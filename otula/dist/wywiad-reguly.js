/* Otula: adaptive, local-only interview. Public rules reviewed 2026-11-21.
 * No case files or extracted personal data belong in this module.
 * Estimates use a confirmed benefit base, never salary/net pay or an LLM.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OtulaWywiadReguly = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const VERSION = '2026-11-21';
  const URL = Object.freeze({
    insurance: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje',
    amount: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
    maternity: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego',
    parental: 'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
    hospital: 'https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi3',
    loss: 'https://www.gov.pl/web/rodzina/latwiejszy-dostep-do-swiadczen-po-stracie-ciazy',
    transfer: 'https://www.gov.pl/web/rodzina/urlop-macierzynski',
    documents: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
    zam: 'https://www.zus.pl/-/wniosek-zas-54-1',
    z3: 'https://www.zus.pl/-/zaswiadczenie-zus-z-3',
    z3a: 'https://www.zus.pl/-/zaswiadczenie-zus-z-3a',
    forms: 'https://www.zus.pl/wzory-formularzy/zasilki',
    sick: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-chorobowy',
    zas53: 'https://www.zus.pl/-/zaswiadczenie-zas-53',
    care: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-opiekunczy/prawo-do-zasilku-i-okres-przyslugiwania',
    z15: 'https://www.zus.pl/-/oswiadczenie-zus-z-15',
    municipal: 'https://www.gov.pl/web/gov/uzyskaj-swiadczenie-rodzicielskie',
    funeral: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-pogrzebowy',
    rehabilitation: 'https://www.zus.pl/swiadczenia/zasilki/swiadczenie-rehabilitacyjne',
    zaZyciem: 'https://www.gov.pl/web/rodzina/za-zyciem',
    zaZyciemPayment: 'https://www.gov.pl/web/gov/uzyskaj-jednorazowe-swiadczenie-w-wysokosci-4000-zl',
    appeal: 'https://www.zus.pl/o-zus/o-nas/porady-dla-klientow/odwolania-od-decyzji',
    ezus: 'https://www.zus.pl/ezus/logowanie',
    krus: 'https://www.gov.pl/web/krus/zasilek-macierzynski',
    changes: 'https://bip.zus.pl/pl/web/guest/o-zus/aktualnosci/-/asset_publisher/aktualnosci/content/id/14583298?_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_aktualnosci_languageId=pl_PL'
  });
  const yn = [['yes', 'Tak'], ['no', 'Nie'], ['unknown', 'Nie wiem jeszcze']];
  const isYes = value => value === 'yes';
  const answered = value => value !== undefined && value !== null && value !== '';
  const n = value => answered(value) && value !== 'unknown' ? Number(value) : NaN;
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const money = value => value.toLocaleString('pl-PL', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' zł';
  const unique = values => [...new Set(values.filter(Boolean))];
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
    const d = new Date(value + 'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value ? d : null;
  }
  function iso(d) { return d && Number.isFinite(d.getTime()) ? d.toISOString().slice(0,10) : ''; }
  function addDays(value, days) { const d = date(value); if (!d) return ''; d.setUTCDate(d.getUTCDate()+days); return iso(d); }
  function diff(a,b) { return date(a) && date(b) ? Math.round((date(b)-date(a))/86400000) : NaN; }
  function ageAt(dob, at) { if (!date(dob)||!date(at)||dob>at) return NaN; const d=date(dob),a=date(at); return a.getUTCFullYear()-d.getUTCFullYear()-Number(a.getUTCMonth()<d.getUTCMonth() || (a.getUTCMonth()===d.getUTCMonth()&&a.getUTCDate()<d.getUTCDate())); }
  function who(a) { return a.role==='supporter' ? a.behalf : a.role; }
  function choices(id,title,options=yn,help='',group='rodzina') { return {id,title,label:title,help,hint:help,type:'choice',options:options.map(([value,label])=>({value,label})),group,optional:true}; }
  function field(id,title,type,group='rodzina',help='',min,max,step) { return {id,title,label:title,type,group,help,hint:help,optional:true,...(min!==undefined?{min}:{}),...(max!==undefined?{max}:{}),...(step!==undefined?{step}:{})}; }

  function basicQuestions(input={}) {
    const a=input||{}, r=who(a), q=[choices('role','Dla kogo sprawdzamy wsparcie?', [['mother','Dla mamy'],['father','Dla taty'],['guardian','Dla opiekuna'],['supporter','Pomagam bliskiej osobie']])];
    if(!answered(a.role))return q;
    if(a.role==='supporter')q.push(choices('behalf','Czyją sytuację opisujesz?', [['mother','Mamy'],['father','Taty'],['guardian','Opiekuna']]));
    q.push(choices('event','Co teraz dzieje się w rodzinie?', [['pregnancy','Czekamy na narodziny'],['birth','Dziecko się urodziło'],['adoption','Przyjęcie dziecka do adopcji'],['foster','Przyjęcie do rodziny zastępczej'],['care','Potrzebna opieka nad dzieckiem lub bliskim'],['transfer','Trzeba przejąć opiekę od mamy'],['loss','Strata ciąży / martwe urodzenie'],['childDeath','Dziecko zmarło'],['motherHealth','Zdrowie mamy po porodzie']]));
    if(!answered(a.event))return q;
    if(a.event==='motherHealth'){q.push(choices('motherHealthSituation','Jakiej pomocy teraz potrzebujesz?', [['support','Wsparcia w powrocie do zdrowia lub samopoczuciu'],['hospital','Mama jest w szpitalu'],['unknown','Nie wiem jeszcze']],'Nie pytamy o rozpoznanie ani dokumentację medyczną.'));return q;}
    const childEvents=['birth','adoption','foster'];
    q.push(field('eventDate',a.event==='pregnancy'?'Jaki jest przewidywany termin porodu?':a.event==='care'?'Od kiedy potrzebna jest opieka?':['adoption','foster'].includes(a.event)?'Kiedy dziecko przyjęto na wychowanie?':['loss','childDeath'].includes(a.event)?'Kiedy nastąpiła strata?':a.event==='transfer'?'Od kiedy chcesz przejąć opiekę?':'Kiedy urodziło się dziecko?','date'));
    if(['adoption','foster','childDeath','care','transfer'].includes(a.event))q.push(field('childDob','Jaka jest data urodzenia dziecka?','date'));
    if(childEvents.includes(a.event)||a.event==='pregnancy')q.push(field('count','Ile dzieci urodziło się lub zostało przyjętych jednocześnie?','number','rodzina','Liczy się ten poród lub przyjęcie, nie wszystkie dzieci w rodzinie.',1,5,1));
    if(['loss','childDeath'].includes(a.event)){
      q.push(choices('otherSurviving','Czy z tego samego porodu są inne dzieci, które żyją?',yn,'To wpływa na okres wsparcia. Możesz pominąć odpowiedź.'));
      q.push(choices('lossDocument','Jaki dokument już masz?', [['medical','Zaświadczenie medyczne o martwym urodzeniu'],['act','Akt urodzenia / zgonu'],['none','Jeszcze żadnego'],['unknown','Nie wiem']], 'Gdy nie sporządzono aktu po martwym urodzeniu, możliwe jest odpowiednie zaświadczenie medyczne.'));
      q.push(choices('funeralCosts','Czy poniesiono koszty pochówku?',yn));
    }
    if(a.event==='adoption')q.push(choices('adoptionCourt','Czy wystąpiono do sądu o przysposobienie dziecka?',yn,'Samo nieformalne sprawowanie opieki nie potwierdza tej ścieżki.'));
    if(a.event==='foster'){
      q.push(choices('fosterType','Jaki to rodzaj pieczy?', [['nonprofessional','Rodzina zastępcza niezawodowa lub spokrewniona'],['professional','Rodzina zastępcza zawodowa'],['other','Inny rodzaj pieczy'],['unknown','Nie wiem']]));
      q.push(choices('schoolDeferred','Czy odroczono obowiązek szkolny dziecka?',yn));
    }
    if(childEvents.includes(a.event)){
      q.push(choices('hospital','Czy dziecko było hospitalizowane po urodzeniu?',yn));
      if(isYes(a.hospital)){
        q.push(field('gestationWeeks','Ile pełnych tygodni ciąży ukończono przy porodzie?','number','rodzina','Np. 28 tygodni i 5 dni to 28 ukończonych tygodni.',20,45,1));
        q.push(field('birthWeight','Jaka była masa urodzeniowa w gramach?','number','rodzina','Masa przy porodzie, nie przy wypisie; przy porodzie mnogim najniższa.',1,10000,1));
        q.push(field('hospitalFrom','Od kiedy trwał pobyt w szpitalu?','date'),field('hospitalUntil','Do kiedy trwał ten pobyt?','date'));
        q.push(choices('hospitalMore','Czy był kolejny pobyt lub przeniesienie do innego szpitala?',yn));
        if(isYes(a.hospitalMore))q.push(field('hospitalFrom2','Początek drugiego pobytu','date'),field('hospitalUntil2','Koniec drugiego pobytu','date'),choices('hospitalMoreThanTwo','Czy pobytów było więcej niż dwa?',yn));
        q.push(choices('hospitalConfirmed','Czy masz zaświadczenia obejmujące te dane i wszystkie pobyty?',yn,'Wpisz pobyty każdego dziecka; do wymiaru wybieramy najdłuższą hospitalizację, nie sumujemy rodzeństwa.'));
      }
      q.push(choices('zaZyciem','Czy dziecko ma zaświadczenie „Za życiem”?',yn,'Chodzi o zaświadczenie z art. 4 ust. 3: ciężkie, nieodwracalne upośledzenie lub nieuleczalna choroba zagrażająca życiu, powstałe prenatalnie lub przy porodzie; nie sam wypis lub orzeczenie niepełnosprawności.'));
    }
    if(a.event==='pregnancy'&&r==='mother')q.push(choices('pregnancySick','Czy lekarz stwierdził niezdolność do pracy w ciąży?',yn));
    if(a.event==='care'){
      q.push(choices('careReason','Kto i dlaczego wymaga opieki?', [['sickChild','Chore dziecko'],['healthyChild','Zdrowe dziecko: zamknięta placówka lub niedostępny stały opiekun'],['disabledChild','Dziecko z niepełnosprawnością'],['adult','Chory członek rodziny'],['unknown','Nie wiem, jaki wariant wybrać']]));
      q.push(choices('otherCarer','Czy ktoś z domowników może zapewnić opiekę?',yn),field('careUsedDays','Ile dni opiekuńczego wykorzystano w tym roku w rodzinie?','number','okresy','Limit jest wspólny dla rodziców i dzieci; nie liczymy osobnej puli na każde dziecko.',0,60,1));
      if(a.careReason==='sickChild')q.push(field('careUntil','Do kiedy potrzebna jest opieka nad chorym dzieckiem?','date','okresy'),choices('careProof','Czy lekarz wystawił zwolnienie na te dni opieki?',yn,'Nie potrzebujemy diagnozy dziecka.','okresy'),choices('carePersonal','Czy na te dni przerywasz pracę, aby osobiście opiekować się dzieckiem?',yn,'Praca podczas zwolnienia albo zachowanie wynagrodzenia na podstawie szczególnych przepisów wyklucza wypłatę za te dni.','okresy'),choices('careOnlyClaimant','Czy tylko ta osoba wnioskuje o opiekuńczy za te dni?',yn,'Za ten sam okres zasiłek otrzymuje jeden rodzic.','okresy'));
    }
    if(a.event==='transfer')q.push(choices('transferReason','Dlaczego potrzebne jest przejęcie opieki?', [['return','Mama wraca do pracy po swojej części'],['hospital','Mama jest w szpitalu'],['incapacity','Mama ma orzeczoną niezdolność do samodzielnej egzystencji'],['death','Mama zmarła'],['abandonment','Mama zaprzestała opieki'],['unknown','Inna sytuacja / nie wiem']]),field('motherUsedWeeks','Ile tygodni po porodzie mama już wykorzystała?','number','okresy','Nie trzeba podawać diagnozy.',0,67,1));
    q.push(choices('work','Jaka jest sytuacja zawodowa osoby, dla której sprawdzamy świadczenie?', [['employee','Umowa o pracę'],['contract','Zlecenie / umowa usługowa'],['business','Własna działalność'],['cooperating','Współpraca przy działalności'],['krus','Ubezpieczenie w KRUS'],['none','Bez pracy / studia / umowa o dzieło'],['unknown','Nie wiem']], '', 'ubezpieczenie'));
    if(a.work==='employee'||a.work==='contract')q.push(choices('employmentEnded','Czy zatrudnienie lub umowa się zakończyły?',yn,'Ważna jest sytuacja na dzień powstania prawa, nie tylko dzisiejsza.','ubezpieczenie'));
    if(isYes(a.employmentEnded))q.push(field('coverageEnd','Kiedy zakończyło się ubezpieczenie?','date','ubezpieczenie'),choices('terminationReason','Z jakiego powodu skończyła się umowa?', [['liquidation','Likwidacja / upadłość pracodawcy'],['death','Śmierć pracodawcy'],['birthExtension','Umowa przedłużona do dnia porodu'],['unlawful','Bezprawne rozwiązanie potwierdzone prawomocnym wyrokiem'],['other','Inny powód'],['unknown','Nie wiem']], '', 'ubezpieczenie'));
    if(a.work==='employee')q.push(choices('leave','Czy w dniu zdarzenia korzystasz z innego urlopu?', [['none','Nie'],['unpaid','Bezpłatnego'],['parenting','Wychowawczego'],['unknown','Nie wiem']], '', 'ubezpieczenie'));
    if(a.work==='business')q.push(choices('suspended','Czy działalność była zawieszona w dniu zdarzenia?',yn,'Samo posiadanie firmy nie oznacza objęcia chorobowym.','ubezpieczenie'));
    if(a.work==='contract')q.push(choices('studentContract','Czy to zlecenie studenta lub ucznia przed 26. urodzinami?',yn,'Takie zlecenie co do zasady nie tworzy ubezpieczenia chorobowego.','ubezpieczenie'));
    q.push(choices('insurance','Czy w dniu zdarzenia osoba była objęta ubezpieczeniem chorobowym?',yn,'Ubezpieczenie zdrowotne i prawo do lekarza to coś innego. Przy przyszłym porodzie odpowiedź opisuje dzisiejszy stan.','ubezpieczenie'));
    if(isYes(a.insurance))q.push(choices('coverageVerified','Czy daty i tytuł chorobowego potwierdzono z płatnikiem lub w ZUS?',yn,'Nie wyciągamy tego wniosku z samego rodzaju pracy.','ubezpieczenie'));
    if(['business','cooperating'].includes(a.work)){
      q.push(choices('debt','Czy na dzień uprawnienia są zaległości składkowe?', [['clear','Brak zaległości potwierdzony w ZUS'],['paid','Zaległość spłacona w całości'],['instalments','Jest układ ratalny'],['owing','Pozostała zaległość'],['unknown','Nie wiem']], '', 'ubezpieczenie'));
      if(a.debt==='paid')q.push(field('debtPaidDate','Kiedy spłacono całą zaległość?','date','ubezpieczenie'),choices('debtResolved','Czy ZUS potwierdził uprawnienie po spłacie?',yn,'Sam układ ratalny nie oznacza pełnej spłaty.','ubezpieczenie'));
      q.push(choices('resumedAfterBenefit','Czy to nowa część po przerwie w pobieraniu macierzyńskiego?',yn,'Po przerwie trzeba sprawdzić ponowne zgłoszenie do chorobowego.','ubezpieczenie'));
      if(isYes(a.resumedAfterBenefit))q.push(choices('reEnrolled','Czy ponownie zgłoszono chorobowe przed tą częścią?',yn,'','ubezpieczenie'));
    }
    q.push(choices('insuranceDispute','Czy ZUS kwestionuje ubezpieczenie lub wydał odmowę?',yn,'Pomożemy ustalić następny krok i brakujące dowody.','ubezpieczenie'));
    if(isYes(a.insuranceDispute))q.push(choices('decisionStage','Na jakim etapie jest sprawa?', [['request','Wezwanie do uzupełnienia'],['refusal','Decyzja odmowna'],['appeal','Złożone odwołanie'],['changed','ZUS zmienił decyzję'],['unknown','Nie wiem']], '', 'ubezpieczenie'),field('decisionReceived','Kiedy doręczono pismo?','date','ubezpieczenie'));
    q.push(choices('foreign','Czy jest praca, ubezpieczenie lub świadczenie za granicą?',yn,'To może wymagać skoordynowania instytucji.','ubezpieczenie'),choices('multipleTitles','Czy osoba ma więcej niż jeden tytuł ubezpieczenia?',yn,'Np. dwa etaty albo etat i działalność.','ubezpieczenie'));
    if(childEvents.includes(a.event)||a.event==='pregnancy')q.push(choices('otherInsurance','Czy drugi rodzic ma własne chorobowe?',yn,'Jego prawo do rodzicielskiego jest odrębne; „nie wiem” nie oznacza zera.','ubezpieczenie'));
    if(['birth','adoption','foster'].includes(a.event)){
      q.push(choices('previousParental','Czy którekolwiek z Was wykorzystało już rodzicielski na to dziecko?',yn,'Pytamy o rodzicielski, nie o ojcowski ani macierzyński.','okresy'));
      if(isYes(a.previousParental))q.push(field('usedOwnWeeks','Ile tygodni rodzicielskiego wykorzystała już ta osoba?','number','okresy','',0,67,1),field('usedOtherWeeks','Ile wykorzystał drugi rodzic?','number','okresy','',0,67,1));
      q.push(field('parentalWeeks','Ile tygodni rodzicielskiego planuje teraz ta osoba?','number','okresy','Można podać 0; część zastrzeżona drugiemu rodzicowi nie przechodzi automatycznie.',0,58,1),field('otherPlannedWeeks','Ile tygodni planuje teraz drugi rodzic?','number','okresy','Bez powtarzania tygodni już wykorzystanych.',0,58,1));
      if(n(a.parentalWeeks)>0)q.push(field('parentalStart','Od kiedy planujesz tę część rodzicielskiego?','date','okresy'));
      if(r==='father'&&a.event!=='foster')q.push(field('paternityUsedDays','Ile dni ojcowskiego wykorzystano wcześniej?','number','okresy','Uwzględnij także innego płatnika; to osobna pula od rodzicielskiego.',0,14,1),field('paternityStart','Od kiedy chcesz skorzystać z ojcowskiego?','date','okresy'));
      if(r!=='father'||a.event!=='birth'){
        q.push(choices('plan','Jak chcesz porównać wypłatę?', [['standard','100% za macierzyński, 70% za rodzicielski'],['combined','81,5% za połączony plan'],['unknown','Jeszcze nie wybieram']], '', 'okresy'));
        if(a.plan==='combined')q.push(field('applicationDate','Kiedy złożono lub planujesz złożyć wniosek o 81,5%?','date','okresy'),choices('firstYearParental','Czy co najmniej dzień rodzicielskiego w 81,5% przypadnie przed pierwszymi urodzinami?',yn,'Własne 9 tygodni drugiego rodzica pozostaje płatne 70%.','okresy'));
      }
      if(a.work==='employee'&&n(a.parentalWeeks)>0)q.push(choices('workDuringParental','Czy chcesz łączyć rodzicielski z pracą u tego pracodawcy?',yn,'Praca zmienia okres i kwotę; potrzebne jest rozliczenie wymiaru etatu.','okresy'));
    }
    if(a.event==='pregnancy'&&isYes(a.pregnancySick))q.push(field('sickFrom','Od kiedy trwa zwolnienie?','date','okresy'),field('sickTo','Do kiedy wystawiono zwolnienie?','date','okresy'),choices('sickWaiting','Czy płatnik potwierdził okres wyczekiwania lub wyjątek?',yn,'Dla chorobowego okres wyczekiwania ma znaczenie; dla macierzyńskiego nie ma takiego warunku.','ubezpieczenie'),choices('sickLimit','Czy kończy się okres zasiłkowy?',yn,'Jeśli nadal nie możesz pracować, można sprawdzić świadczenie rehabilitacyjne.','okresy'));
    if(a.event==='pregnancy'&&isYes(a.pregnancySick)&&isYes(a.sickLimit))q.push(field('sickRemainingDays','Ile dni okresu zasiłkowego pozostało według płatnika?','number','okresy','Uwzględnij wcześniejsze zwolnienia zaliczane do tego samego okresu; wpisz 0, jeśli okres się wyczerpał.',0,270,1));
    q.push(choices('baseKnown','Czy znasz podstawę zasiłku potwierdzoną przez płatnika?',yn,'To podstawa po wymaganych odliczeniach i ewentualnym minimum, nie wypłata netto ani pensja brutto.','kwota'));
    if(isYes(a.baseKnown))q.push(field('benefitBase','Jaka jest potwierdzona miesięczna podstawa zasiłku?','number','kwota','Użyj kwoty ustalonej dla tego świadczenia; przy dwóch tytułach potrzebne jest osobne rozliczenie.',0.01,1000000,0.01));
    if(childEvents.includes(a.event)&&isYes(a.insurance))q.push(choices('lowBenefit','Czy łączna miesięczna wypłata macierzyńskiego po PIT jest niższa niż 1000 zł?',yn,'Podwyższenie bada sumę ze wszystkich tytułów i faktyczny podatek.','kwota'));
    return q;
  }

  const records=(id,title,fields,maxItems,help='',group='okresy')=>({id,title,label:title,type:'records',fields,maxItems,unitLabel:'Wpis',allowUnknown:true,optional:true,help,hint:help,group});
  const rowDate=(id,title)=>({id,title,type:'date'});
  const rowNumber=(id,title,min=0,max=100000,step=1)=>({id,title,type:'number',min,max,step});
  const rowChoice=(id,title,options)=>({id,title,type:'choice',options:options.map(([value,label])=>({value,label}))});
  function questions(input={}) {
    const a=input||{},q=basicQuestions(a),child=['birth','adoption','foster'].includes(a.event),voluntary=['business','cooperating','contract'].includes(a.work),loss=['loss','childDeath'].includes(a.event);
    if(!answered(a.event))return q;
    const extras=[];
    if(a.insurance==='yes'&&voluntary)extras.push(choices('voluntaryRegistered','Czy zgłoszono dobrowolne chorobowe?',yn,'Sam przelew składki ani ubezpieczenie zdrowotne nie zastępują potwierdzenia zgłoszenia.','ubezpieczenie'),field('insuranceStart','Od jakiej daty ZUS potwierdził chorobowe?','date','ubezpieczenie'));
    if(isYes(a.insuranceDispute))extras.push(choices('nonCoverageDecision','Czy pismo rozstrzyga o niepodleganiu ubezpieczeniu?',yn,'Decyzja o ubezpieczeniu i decyzja o konkretnym zasiłku to różne pisma; krótki staż sam nie oznacza pozorności.','ubezpieczenie'));
    if(a.work==='employee'){
      extras.push(choices('hoursChanged','Czy w okresie ustalania podstawy zmienił się etat?',yn,'Ważna jest data zmiany; nie liczymy średniej starych i nowych pensji.','kwota'));
      if(isYes(a.hoursChanged))extras.push(field('hoursChangedDate','Od kiedy zmienił się wymiar etatu?','date','kwota'),choices('changedBaseConfirmed','Czy płatnik potwierdził podstawę po zmianie etatu?',yn,'Składniki wynagrodzenia i właściwy okres rozlicza płatnik.','kwota'));
      extras.push(choices('payerSize','Ile osób płatnik zgłaszał do chorobowego w dniu ustalania płatnika?', [['over20','Ponad 20'],['upTo20','Do 20'],['unknown','Nie wiem jeszcze']],'Zwykle liczy się stan na 30 listopada poprzedniego roku, nie dzisiejsza wielkość firmy.','ubezpieczenie'));
    }
    if(['business','cooperating'].includes(a.work))extras.push(field('debtAmount','Jaka była zaległość w dniu powstania prawa?','number','ubezpieczenie','Nie wpisuj raty; potrzebna jest cała zaległość z konta ZUS.',0,10000000,0.01));
    if(a.work==='business')extras.push(choices('businessEnded','Czy działalność zakończono przed dniem powstania prawa?',yn,'Zakończenie i zawieszenie działalności to różne zdarzenia.','ubezpieczenie'));
    if(child){
      extras.push(choices('otherMaternityPayments','Czy otrzymujesz macierzyński z innych tytułów?',yn,'Podwyższenie do 1000 zł sprawdza się łącznie, nie osobno dla każdego przelewu.','kwota'));
      if(isYes(a.otherMaternityPayments))extras.push(field('otherPaymentsNet','Ile wynoszą pozostałe miesięczne wypłaty po PIT?','number','kwota','Dane do oświadczenia płatnikowi; nie dodajemy ich drugi raz do sumy.',0,1000000,0.01));
      if(isYes(a.previousParental))extras.push(records('parentalParts','Jakie części rodzicielskiego już wykorzystano?', [rowChoice('parent','Kto korzystał?', [['self','Ta osoba'],['other','Drugi rodzic']]),rowDate('from','Od'),rowDate('to','Do')],20,'Każdy wpis to osobna wykorzystana część; daty mogą się nakładać dla różnych rodziców.'));
      if(n(a.otherPlannedWeeks)>0){
        extras.push(field('otherParentalStart','Od kiedy planuje rodzicielski drugi rodzic?','date','okresy'),choices('otherConditionsConfirmed','Czy płatnik potwierdził prawo drugiego rodzica do tego okresu?',yn,'Potwierdzenie obejmuje jego tytuł, okres, wcześniejsze części, brak przeszkód i niełączenie tej części z pracą.','ubezpieczenie'),choices('otherRatePlan','Jaki wariant dotyczy rodzicielskiego drugiej osoby?', [['standard','Standardowy: 70%'],['combined','Wspólny plan 81,5%'],['unknown','Nie wiem jeszcze']],'Własne 9 tygodni drugiego rodzica zawsze ma stawkę 70%.','okresy'),choices('otherBaseKnown','Czy znasz potwierdzoną podstawę drugiego rodzica?',yn,'Nie używamy Twojej podstawy dla drugiej osoby.','kwota'));
        if(a.otherBaseKnown==='yes')extras.push(field('otherBenefitBase','Jaka jest podstawa zasiłku drugiego rodzica?','number','kwota','Po odliczeniach i zastosowaniu ewentualnego minimum przez jego płatnika.',0.01,1000000,0.01));
      }
      if(n(a.parentalWeeks)>0&&n(a.otherPlannedWeeks)>0)extras.push(choices('parallelParental','Czy planujecie korzystać w tym samym czasie?',yn,'Równoległe dni pomniejszają wspólną pulę osobno dla każdej osoby.','okresy'));
      if(n(a.count)>1||isYes(a.hospital))extras.push(records('childrenClinical','Dane każdego dziecka do dodatkowych uprawnień',[rowChoice('child','Dziecko',[1,2,3,4,5].slice(0,Math.max(1,n(a.count)||1)).map(i=>[String(i),'Dziecko '+i])),...(isYes(a.hospital)?[rowNumber('gestationWeeks','Ukończone tygodnie ciąży',20,45),rowNumber('birthWeight','Masa urodzeniowa (g)',1,10000)]:[]),rowChoice('zaZyciem','Zaświadczenie Za życiem',yn)],5,'Bez imion i rozpoznań; Za życiem sprawdzamy dla każdego dziecka.','rodzina'));
      if(isYes(a.hospital))extras.push(records('hospitalStays','Wszystkie pobyty dzieci w szpitalu',[rowChoice('child','Dziecko',[1,2,3,4,5].slice(0,Math.max(1,n(a.count)||1)).map(i=>[String(i),'Dziecko '+i])),rowDate('from','Przyjęcie'),rowDate('to','Wypis')],100,'Każdy pobyt osobno; nie sumujemy dni hospitalizacji rodzeństwa.','rodzina'));
      if(isYes(a.workDuringParental))extras.push(records('workPeriods','Kiedy połączysz rodzicielski z pracą?',[rowDate('from','Od'),rowDate('to','Do'),rowNumber('fraction','Część pełnego etatu pracy',0.01,0.5,0.01),rowChoice('extended','Czy to już część wydłużona?',yn)],100,'Wpisz wszystkie odcinki, również zmianę wymiaru i pracę w części wydłużonej.'));
    }
    if(a.event==='adoption')extras.push(field('adoptionCourtDate','Kiedy złożono wniosek o przysposobienie?','date'),field('adoptionFinalDate','Kiedy orzeczenie stało się prawomocne, jeśli już zapadło?','date'));
    if(a.event==='foster')extras.push(field('fosterCourtDate','Jaka jest data postanowienia o pieczy?','date'));
    if(a.event==='transfer'&&a.transferReason==='return')extras.push(choices('motherResignation','Czy mama złożyła rezygnację z pozostałej części?',yn,'Zwykłe przekazanie wymaga co najmniej 14 tygodni wykorzystanych przez mamę po porodzie.','okresy'));
    if(a.event==='pregnancy'&&isYes(a.employmentEnded))extras.push(choices('pregnantAtEnd','Czy ciąża trwała w dniu zakończenia umowy?',yn,'Potwierdza to zaświadczenie; nie potrzebujemy szczegółów medycznych.','ubezpieczenie'),choices('replacementEmployment','Czy zapewniono inne zatrudnienie?',yn,'To warunek odrębnego zasiłku do dnia porodu przy likwidacji, upadłości lub śmierci pracodawcy.','ubezpieczenie'));
    if(loss&&isYes(a.otherSurviving))extras.push(records('lossChildren','Czy pozostałe dzieci z tego porodu żyją?',[rowChoice('child','Dziecko',[1,2,3,4,5].map(i=>[String(i),'Dziecko '+i])),rowChoice('alive','Czy dziecko żyje?',yn),{...rowDate('deathDate','Data śmierci, tylko jeśli dotyczy'),visibleWhen:{field:'alive',value:'no'}}],5,'Nie pytamy o imiona, płeć ani rozpoznanie.','rodzina'));
    if(a.event==='childDeath')extras.push(choices('maternityAtDeath','Czy w dniu śmierci trwał jeszcze okres macierzyński?',yn,'Nie zakładamy nowego macierzyńskiego po zakończeniu jego okresu.'));
    const replaced=new Set(['hospitalFrom','hospitalUntil','hospitalMore','hospitalFrom2','hospitalUntil2','hospitalMoreThanTwo']);
    if(isYes(a.previousParental)){replaced.add('usedOwnWeeks');replaced.add('usedOtherWeeks');}
    if(n(a.count)>1||isYes(a.hospital)){replaced.add('birthWeight');replaced.add('gestationWeeks');replaced.add('zaZyciem');}
    // Keep the question order meaningful without changing stable identifiers.
    const all=q.filter(x=>!replaced.has(x.id));
    for(const extra of extras){const last=all.findLastIndex(x=>x.group===extra.group);all.splice(last+1,0,extra);}
    return all;
  }
  function migrate(input={}) {
    const a={...input};
    if(a.hospital==='yes'&&!answered(a.hospitalStays)&&date(a.hospitalFrom)){
      a.hospitalStays=[{child:'1',from:a.hospitalFrom,to:a.hospitalUntil}];
      if(a.hospitalMore==='yes')a.hospitalStays.push({child:'1',from:a.hospitalFrom2,to:a.hospitalUntil2});
      if(a.hospitalMoreThanTwo==='yes'||a.hospitalMore==='unknown'||a.hospitalMore===undefined)a.hospitalStays='unknown';
    }
    if(!answered(a.childrenClinical)&&a.hospital==='yes'&&Number(a.count)===1&&answered(a.birthWeight))a.childrenClinical=[{child:'1',birthWeight:a.birthWeight,gestationWeeks:a.gestationWeeks,zaZyciem:a.zaZyciem}];
    return a;
  }
  function prune(input={}) {
    let a=migrate(input);
    for(let pass=0;pass<4;pass++) {
      const list=questions(a), next={};
      for(const q of list)if(answered(a[q.id])){
        const value=a[q.id];
        if(q.type==='records'&&Array.isArray(value))next[q.id]=value.length>q.maxItems?'unknown':value.map(row=>Object.fromEntries(q.fields.filter(f=>answered(row?.[f.id])&&(!f.visibleWhen||row[f.visibleWhen.field]===f.visibleWhen.value)).map(f=>{const v=row[f.id];return [f.id,v==='unknown'?'unknown':f.type==='choice'?(f.options.some(o=>o.value===v)?v:'unknown'):f.type==='date'?(date(v)?v:'unknown'):Number.isFinite(n(v))?n(v):'unknown'];})));
        else if(value==='unknown'||q.type!=='choice'||q.options.some(o=>o.value===value))next[q.id]=value;
      }
      if(typeof a.situation==='string')next.situation=a.situation.slice(0,60);
      if(Array.isArray(a.extraSituations))next.extraSituations=a.extraSituations.filter(x=>typeof x==='string').slice(0,8);
      if(JSON.stringify(next)===JSON.stringify(a))return next;
      a=next;
    }
    return a;
  }
  const doc=(owner,text,url,code)=>({owner,text,label:text,url,code});
  function claimantDocs(a) {
    const docs=[doc('Rodzic / osoba składająca wniosek','Aktualny ZAM: właściwy rodzaj okresu, daty i oświadczenia.',URL.zam,'ZAM')];
    if(a.work==='employee')docs.push(doc('Pracodawca / kadry','Zaświadczenie Z-3 oraz potwierdzenie udzielonego urlopu; tych danych nie poświadczasz za pracodawcę.',URL.z3,'Z-3'));
    else if(a.work==='contract')docs.push(doc('Zleceniodawca / płatnik','Zaświadczenie Z-3a, jeśli jest wymagane w Twojej sprawie.',URL.z3a,'Z-3a'));
    else if(['business','cooperating'].includes(a.work))docs.push(doc('Płatnik i ZUS','Potwierdzenie tytułu, okresu chorobowego, podstaw i rozliczeń. Z-3b nie jest zwykłym aktualnym drukiem; od 20.11.2026 ma przejściową obsługę przez pełnomocnika w roli płatnika w eZUS.',URL.forms));
    return docs;
  }
  function eligibility(a) {
    const missing=[];
    if(a.insurance!=='yes')missing.push(a.insurance==='no'?'Brak chorobowego: sprawdź wyjątki po ustaniu ubezpieczenia i wsparcie poza ZUS.':'Potwierdź chorobowe na dzień powstania prawa.');
    else if(a.coverageVerified!=='yes')missing.push('Potwierdź daty i tytuł chorobowego z płatnikiem lub ZUS.');
    if(!['employee','contract','business','cooperating'].includes(a.work))missing.push(a.work==='krus'?'Ustal odrębne uprawnienia i wypłatę w KRUS.':'Ustal tytuł ubezpieczenia.');
    for(const [id,text] of [['insuranceDispute','Wyjaśnij wezwanie lub decyzję ZUS.'],['foreign','Sprawdź wpływ pracy i świadczeń zagranicznych.'],['multipleTitles','Rozlicz każdy tytuł oddzielnie; nie sumujemy niepotwierdzonych podstaw.']])if(a[id]!=='no')missing.push(text);
    const debtThreshold=parameters(a.eventDate).debtThreshold,debtBelow=debtThreshold!==null&&Number.isFinite(n(a.debtAmount))&&n(a.debtAmount)>=0&&n(a.debtAmount)<=debtThreshold;
    if(['business','cooperating'].includes(a.work)&&a.debt!=='clear'&&!(a.debt==='paid'&&a.debtResolved==='yes')&&!(a.debt==='owing'&&debtBelow))missing.push('Sprawdź zaległość i skutek pełnej spłaty z ZUS; raty nie są pełną spłatą.');
    if(isYes(a.resumedAfterBenefit)&&a.reEnrolled!=='yes')missing.push('Potwierdź ponowne objęcie chorobowym po przerwie w zasiłku.');
    if(a.work==='business'&&a.suspended!=='no')missing.push('Sprawdź wpływ zawieszenia działalności na ubezpieczenie.');
    if(a.work==='contract'&&a.studentContract!=='no')missing.push('Sprawdź, czy zlecenie studenta tworzy tytuł do chorobowego.');
    if(a.work==='employee'&&a.leave!=='none')missing.push(a.leave==='parenting'?'Sprawdź zasady macierzyńskiego podczas wychowawczego.':'Sprawdź wpływ urlopu bezpłatnego lub innej przerwy.');
    if(['employee','contract'].includes(a.work)&&a.employmentEnded!=='no')missing.push('Sprawdź uprawnienie po zakończeniu umowy i jego podstawę.');
    return unique(missing);
  }
  function rate(a) {
    if(a.plan==='standard')return {maternity:100,parental:70,missing:[]};
    if(a.plan!=='combined')return {maternity:null,parental:null,missing:['Wybierz wariant wypłaty, aby porównać konkretną kwotę.']};
    if(!date(a.applicationDate)||!date(a.eventDate))return {missing:['Podaj datę zdarzenia i złożenia wniosku o 81,5%.']};
    if(diff(a.eventDate,a.applicationDate)>21)return {missing:['Wniosek o 81,5% jest po 21 dniach; wybierz 100% / 70% lub wyjaśnij datę z płatnikiem.']};
    if(a.firstYearParental==='no')return {maternity:100,parental:70,missing:[],adjustment:true};
    if(a.firstYearParental!=='yes')return {missing:['Potwierdź dzień rodzicielskiego w pierwszym roku dla wariantu 81,5%.']};
    return {maternity:81.5,parental:81.5,missing:[]};
  }
  function estimate(a,rateValue,days,extraMissing=[]) {
    const missing=unique([...eligibility(a),...extraMissing]);
    if(a.baseKnown!=='yes'||!Number.isFinite(n(a.benefitBase))||n(a.benefitBase)<=0)missing.push('Podaj potwierdzoną podstawę zasiłku, żeby policzyć pieniądze.');
    if(!Number.isFinite(rateValue))missing.push('Najpierw ustal stawkę zasiłku.');
    if(missing.length)return {amount:Number.isFinite(rateValue)?`${rateValue.toLocaleString('pl-PL')}% podstawy; kwota po uzupełnieniu danych.`:'Kwota po ustaleniu wariantu i podstawy.',missing:unique(missing)};
    // The app already has a tested rounding function. Standalone use follows its two-stage rounding.
    const daily=typeof root?.zusDaily==='function'?root.zusDaily(n(a.benefitBase),rateValue,0,1):round(round(n(a.benefitBase)/30)*rateValue/100);
    return {amount:Number.isFinite(days)&&days>0?`${money(round(daily*days))} brutto za ${days} dni (${money(daily)} za dzień).`:`${money(daily)} brutto za dzień; miesięcznie zależy od liczby płatnych dni.`,missing:[],estimate:{daily,days:Number.isFinite(days)?days:null,total:Number.isFinite(days)?round(daily*days):null,rate:rateValue}};
  }
  function legacyHospital(a) {
    const missing=[]; const dob=a.event==='birth'?a.eventDate:a.childDob;
    if(!date(dob))missing.push('Podaj rzeczywistą datę urodzenia.');
    const weeks=n(a.gestationWeeks),grams=n(a.birthWeight);
    if(!Number.isInteger(weeks)||weeks<20||weeks>45||!Number.isFinite(grams)||grams<=0||grams>10000)missing.push('Sprawdź ukończone tygodnie ciąży i masę urodzeniową.');
    if(a.hospitalConfirmed!=='yes')missing.push('Uzyskaj zaświadczenie szpitala z masą, tygodniem ciąży i datami pobytów.');
    if(a.hospitalMore==='unknown'||!answered(a.hospitalMore)||isYes(a.hospitalMoreThanTwo))missing.push('Uzupełnij pełną historię pobytów; nie policzymy tylko jej fragmentu.');
    if(isYes(a.hospitalMore)&&a.hospitalMoreThanTwo!=='no')missing.push('Potwierdź, czy dwa pobyty wyczerpują historię.');
    const stays=[{from:a.hospitalFrom,to:a.hospitalUntil}];
    if(isYes(a.hospitalMore))stays.push({from:a.hospitalFrom2,to:a.hospitalUntil2});
    if(stays.some(s=>!date(s.from)||!date(s.to)||s.to<s.from||s.from<dob))missing.push('Popraw daty przyjęcia i wypisu.');
    if(missing.length)return {missing:unique(missing),stays,weeks:null};
    const data={kind:a.event==='birth'?'birth':a.event,exception:'hospital',eventDate:a.eventDate,childDob:a.childDob,gestationWeeks:weeks,birthWeight:grams,hospitalConfirmed:true,hospitalFrom:a.hospitalFrom,hospitalUntil:a.hospitalUntil,hospitalExtra:isYes(a.hospitalMore)?`${a.hospitalFrom2} / ${a.hospitalUntil2}`:'',insurance:'yes',insuranceB:'no'};
    if(typeof root?.zusSupplementary==='function'){
      const result=root.zusSupplementary(data);return {...result,missing:result.issues||[],stays};
    }
    const cap=weeks<28||grams<=1000?15:8,term=weeks>=37&&grams>1000;
    const start=addDays(dob,term?5:1),end=addDays(dob,cap*7);
    const merged=[];
    for(const s of stays.slice().sort((x,y)=>x.from.localeCompare(y.from))){const p=merged.at(-1);if(p&&s.from<=addDays(p.to,1)){if(s.to>p.to)p.to=s.to;}else merged.push({...s});}
    const eligibleStart=a.event==='birth'?start:[start,a.eventDate].sort().at(-1);
    const qualifies=!term||merged.some(s=>{const first=[s.from,eligibleStart].sort().at(-1);return first<=addDays(dob,28)&&addDays(first,1)<=s.to;});
    const days=qualifies?merged.reduce((sum,s)=>{const f=[s.from,eligibleStart].sort().at(-1),t=[s.to,end].sort()[0];return sum+(f<=t?diff(f,t)+1:0);},0):0;
    return {missing:[],stays,cap,days,weeks:Math.min(cap,Math.ceil(days/7)),qualifies};
  }

  function hospital(a) {
    if(!answered(a.hospitalStays))return legacyHospital(a);
    const missing=[],dob=a.event==='birth'?a.eventDate:a.childDob,rows=a.childrenClinical,stays=a.hospitalStays,count=n(a.count)||1;
    if(!date(dob)||!Array.isArray(rows)||rows.length!==count||new Set(rows.map(x=>x.child)).size!==count)missing.push('Uzupełnij dane każdego dziecka i datę urodzenia.');
    if(!Array.isArray(stays)||!stays.length)missing.push('Wpisz wszystkie pobyty, osobno dla każdego dziecka.');
    if(a.hospitalConfirmed!=='yes')missing.push('Potwierdź zaświadczenia szpitala dla wszystkich pobytów.');
    if(Array.isArray(rows)&&rows.some(x=>!Number.isInteger(n(x.gestationWeeks))||n(x.gestationWeeks)<20||n(x.gestationWeeks)>45||n(x.birthWeight)<=0||!Number.isFinite(n(x.birthWeight))))missing.push('Uzupełnij masę urodzeniową i ukończone tygodnie każdego dziecka.');
    if(Array.isArray(stays)&&stays.some(s=>!date(s.from)||!date(s.to)||s.from>s.to||s.from<dob||!rows?.some?.(r=>r.child===s.child)))missing.push('Popraw daty i numer dziecka przy pobytach.');
    if(missing.length)return {missing:unique(missing),stays:Array.isArray(stays)?stays:[],weeks:null};
    const minWeight=Math.min(...rows.map(x=>n(x.birthWeight))),minWeeks=Math.min(...rows.map(x=>n(x.gestationWeeks))),cap=minWeeks<28||minWeight<=1000?15:8,term=minWeeks>=37&&minWeight>1000;
    const counts=rows.map(child=>{
      const merged=[];
      for(const s of stays.filter(s=>s.child===child.child).sort((x,y)=>x.from.localeCompare(y.from))){const p=merged.at(-1);if(p&&s.from<=addDays(p.to,1)){if(s.to>p.to)p.to=s.to;}else merged.push({...s});}
      const start=[addDays(dob,term?5:1),a.event==='birth'?dob:a.eventDate].sort().at(-1),end=addDays(dob,cap*7);
      const qualifies=!term||merged.some(s=>{const first=[s.from,start].sort().at(-1);return first<=addDays(dob,28)&&addDays(first,1)<=s.to;});
      const days=qualifies?merged.reduce((sum,s)=>{const f=[s.from,start].sort().at(-1),t=[s.to,end].sort()[0];return sum+(f<=t?diff(f,t)+1:0);},0):0;
      return {child:child.child,days,stays:merged};
    });
    const longest=counts.sort((x,y)=>y.days-x.days)[0];
    if(typeof root?.zusSupplementary==='function'&&longest.stays.length){
      const result=root.zusSupplementary({kind:a.event,exception:'hospital',eventDate:a.eventDate,childDob:a.childDob,gestationWeeks:minWeeks,birthWeight:minWeight,hospitalConfirmed:true,hospitalFrom:longest.stays[0].from,hospitalUntil:longest.stays[0].to,hospitalExtra:longest.stays.slice(1).map(s=>`${s.from} / ${s.to}`).join('\n'),insurance:'yes',insuranceB:'no'});
      return {...result,missing:result.issues||[],stays:longest.stays,allStays:stays,perChild:counts,grams:minWeight,gestationWeeks:minWeeks};
    }
    return {missing:[],cap,days:longest.days,weeks:Math.min(cap,Math.ceil(longest.days/7)),stays:longest.stays,allStays:stays,perChild:counts,grams:minWeight,gestationWeeks:minWeeks};
  }
  function derive(a){
    a={...a};
    if(Array.isArray(a.childrenClinical)){
      a.zaZyciem=a.childrenClinical.some(c=>c.zaZyciem==='yes')?'yes':a.childrenClinical.length===n(a.count)&&a.childrenClinical.every(c=>c.zaZyciem==='no')?'no':'unknown';
      a.birthWeight=Math.min(...a.childrenClinical.map(c=>n(c.birthWeight)));a.gestationWeeks=Math.min(...a.childrenClinical.map(c=>n(c.gestationWeeks)));
    }
    if(isYes(a.previousParental)&&Array.isArray(a.parentalParts)&&a.parentalParts.length&&a.parentalParts.every(p=>['self','other'].includes(p.parent)&&date(p.from)&&date(p.to)&&p.to>=p.from)){
      a.usedOwnWeeks=a.parentalParts.filter(p=>p.parent==='self').reduce((s,p)=>s+diff(p.from,p.to)+1,0)/7;
      a.usedOtherWeeks=a.parentalParts.filter(p=>p.parent==='other').reduce((s,p)=>s+diff(p.from,p.to)+1,0)/7;
    }
    return a;
  }
  function parameters(at){return typeof root?.zusInterviewParameters==='function'?root.zusInterviewParameters(at):{partsLimit:5,debtThreshold:null};}
  function inspect(a){
    const blocks=[],put=(id,kind,text,scope='all')=>blocks.push({id,kind,text,scope});
    if(a.insurance==='no')put('insurance','risk','Brak chorobowego na dzień powstania prawa wymaga sprawdzenia wyjątku.');
    if(['business','cooperating','contract'].includes(a.work)&&a.insurance==='yes'){
      if(a.voluntaryRegistered!=='yes'||!date(a.insuranceStart))put('voluntary','missing','Potwierdź zgłoszenie i datę początku dobrowolnego chorobowego.');
      if(date(a.insuranceStart)&&date(a.eventDate)&&a.event!=='pregnancy'&&a.insuranceStart>a.eventDate)put('coverage-date','risk','Początek chorobowego jest późniejszy niż zdarzenie; wyjaśnij prawo z ZUS.');
    }
    if(a.resumedAfterBenefit==='yes'&&a.reEnrolled!=='yes')put('reenrolment',a.reEnrolled==='no'?'risk':'missing','Po przerwie trzeba potwierdzić ponowne zgłoszenie chorobowego.');
    if(a.nonCoverageDecision==='yes')put('noncoverage','risk','ZUS wydał decyzję o niepodleganiu; sprawdź jej okres i pouczenie o odwołaniu.');
    if(a.suspended==='yes')put('suspension','risk','Zawieszenie działalności może wyłączyć chorobowe w dniu zdarzenia.');
    if(a.businessEnded==='yes')put('business-ended','risk','Zakończenie działalności przed zdarzeniem wymaga ustalenia uprawnienia po ustaniu ubezpieczenia.');
    if(['business','cooperating'].includes(a.work)){
      const threshold=parameters(a.eventDate).debtThreshold;
      if(a.debt==='instalments')put('debt','risk','Raty nie oznaczają pełnej spłaty zaległości.');
      if(a.debt==='owing'&&Number.isFinite(n(a.debtAmount))&&threshold!==null&&n(a.debtAmount)>threshold)put('debt','risk','Zaległość przekracza próg obowiązujący w dacie prawa.');
      if(a.debt==='paid'&&!date(a.debtPaidDate))put('debt-payment','missing','Podaj datę całkowitej spłaty.');
      if(a.debt==='owing'&&(threshold===null||!Number.isFinite(n(a.debtAmount))))put('debt-amount','missing','Ustal pełną zaległość i próg dla daty prawa w panelu parametrów.');
    }
    if(a.hoursChanged==='yes'&&(!date(a.hoursChangedDate)||a.changedBaseConfirmed!=='yes'))put('hours-base','missing','Potwierdź datę zmiany etatu i podstawę ustaloną dla nowych warunków.');
    if(a.previousParental==='yes'){
      if(!Array.isArray(a.parentalParts)||!a.parentalParts.length)put('parts-dates','missing','Podaj daty wykorzystanych części obojga rodziców.','parental');
      else{
        const rows=a.parentalParts,limit=parameters(a.eventDate).partsLimit||5;
        if(rows.length+Number(n(a.parentalWeeks)>0)+Number(n(a.otherPlannedWeeks)>0)>limit)put('parts-limit','risk',`Plan przekracza wspólny limit ${limit} części; pozostałe dni nie tworzą kolejnej części.`,'parental');
        for(const p of rows){if(!date(p.from)||!date(p.to)||p.to<p.from||p.from<a.eventDate||!['self','other'].includes(p.parent))put('parts-date','missing','Popraw daty i rodzica przy wykorzystanych częściach.','parental');}
        if(rows.some((p,i)=>rows.some((x,j)=>j<i&&x.parent===p.parent&&p.from<=x.to&&p.to>=x.from)))put('parts-overlap','missing','Dwie części tej samej osoby mają wspólne dni; popraw historię.','parental');
        if(rows.some(p=>p.parent==='self'&&date(a.parentalStart)&&p.to>=a.parentalStart))put('parts-current','missing','Nowa część nakłada się na wcześniejszą część tej samej osoby.','parental');
      }
    }
    if(a.workDuringParental==='yes'){
      if(!Array.isArray(a.workPeriods)||!a.workPeriods.length)put('work-periods','missing','Wpisz odcinki pracy i wymiar, również podczas wydłużenia.','parental');
      else if(a.workPeriods.some(p=>!date(p.from)||!date(p.to)||p.from>p.to||!(n(p.fraction)>0&&n(p.fraction)<=.5)||!['yes','no'].includes(p.extended)))put('work-periods','missing','Popraw daty, wymiar do połowy pełnego etatu i etap wydłużenia.','parental');
    }
    if(n(a.count)>1&&['birth','adoption','foster'].includes(a.event)&&(!Array.isArray(a.childrenClinical)||a.childrenClinical.length!==n(a.count)||new Set(a.childrenClinical.map(c=>c.child)).size!==n(a.count)))put('children-certificate','document','Potwierdź Za życiem osobno dla każdego dziecka.','parental');
    if(n(a.parentalWeeks)>0&&n(a.otherPlannedWeeks)>0&&date(a.parentalStart)&&date(a.otherParentalStart)){
      const ownEnd=addDays(a.parentalStart,n(a.parentalWeeks)*7-1),otherEnd=addDays(a.otherParentalStart,n(a.otherPlannedWeeks)*7-1),overlap=a.parentalStart<=otherEnd&&a.otherParentalStart<=ownEnd;
      if((a.parallelParental==='yes'&&!overlap)||(a.parallelParental==='no'&&overlap))put('parallel-dates','missing','Daty nie odpowiadają odpowiedzi o równoległej opiece; popraw plan.','parental');
    }
    if(a.event==='transfer'&&a.transferReason==='return'){
      if(!(n(a.motherUsedWeeks)>=14))put('mother14','risk','Przy zwykłym przekazaniu mama wykorzystuje co najmniej 14 tygodni po porodzie.');
      if(a.motherResignation!=='yes')put('resignation','document','Potrzebne jest oświadczenie mamy o rezygnacji i potwierdzenie płatnika.');
    }
    if(a.event==='pregnancy'&&a.employmentEnded==='yes'){
      if(a.pregnantAtEnd!=='yes')put('pregnancy-end','missing','Potwierdź, że ciąża trwała w dniu ustania umowy.','pregnancy-after-work');
      if(a.replacementEmployment!=='no')put('replacement','missing','Ustal, czy zapewniono inne zatrudnienie.','pregnancy-after-work');
    }
    if(['loss','childDeath'].includes(a.event)&&Array.isArray(a.lossChildren)){
      if(new Set(a.lossChildren.map(c=>c.child)).size!==a.lossChildren.length)put('loss-children','missing','Wskaż każde dziecko z tego porodu tylko raz.','loss');
      if(a.lossChildren.some(c=>c.alive==='no'&&(!date(c.deathDate)||c.deathDate!==a.eventDate)))put('loss-chronology','missing','Różne lub nieznane daty strat wymagają ustalenia okresów kolejno z płatnikiem.','loss');
    }
    return blocks.filter((x,i,list)=>list.findIndex(y=>y.id===x.id)===i);
  }
  function assess(input={}) {
    const a=derive(prune(input)),results=[],r=who(a),common=eligibility(a);
    const context={event:a.event,role:r,date:a.eventDate,periods:[],grams:Number.isFinite(n(a.birthWeight))?n(a.birthWeight):undefined,weeks:Number.isFinite(n(a.gestationWeeks))?n(a.gestationWeeks):undefined,stays:[],zaZyciem:a.zaZyciem};
    function push(id,title,why,period,rateValue,days,documents,url,extra=[],ctx={},gain=''){
      const e=estimate(a,rateValue,days,extra);
      const item={id,title,why,summary:why,period,amount:e.amount,gain,missing:e.missing,documents,url,status:e.missing.length?'Możliwe po potwierdzeniu':'Dopasowane do odpowiedzi',pdfContext:{...context,...ctx},...(e.estimate?{estimate:e.estimate}:{})};results.push(item);return item;
    }
    function info(id,title,why,period,amount,documents,url,missing=[],gain='') {const item={id,title,why,summary:why,period,amount,documents,url,missing:unique(missing),gain,status:missing.length?'Do sprawdzenia':'Wymaga indywidualnego ustalenia',pdfContext:{...context}};results.push(item);return item;}
    if(!answered(a.event))return [{id:'start',title:'Sprawdźmy wsparcie dla Twojej sytuacji',why:'Wybierz zdarzenie w rodzinie; pokażemy właściwe świadczenia i dokumenty.',period:'',amount:'',documents:[],missing:['Opisz sytuację rodziny.'],status:'Do sprawdzenia'}];
    const docs=claimantDocs(a),count=n(a.count),countOk=Number.isInteger(count)&&count>=1&&count<=5;
    if(a.work==='krus')info('krus','Sprawdź świadczenie w KRUS','Ubezpieczenie rolnicze ma osobną ścieżkę; nie stosujemy do niego podstawy i kwoty z ZUS.','Okres zależy od zdarzenia i dokumentów.','Kwotę i uprawnienie potwierdza KRUS.',[doc('Osoba ubezpieczona w KRUS','Wniosek i dokumenty właściwe dla KRUS.',URL.krus)],URL.krus);
    if(isYes(a.insuranceDispute))info('case-followup','Dokończ sprawę z ZUS',a.decisionStage==='request'?'Wezwanie to możliwość uzupełnienia dokumentów, nie wydana odmowa.':a.decisionStage==='changed'?'Zachowaj decyzję zmieniającą i sprawdź jej końcowe okresy oraz kwotę.':'Porównaj uzasadnienie z faktami i brakującymi dowodami; sama nazwa formularza nie przesądza prawa.','Przy odwołaniu od decyzji ZUS co do zasady miesiąc od doręczenia; przeczytaj pouczenie.','Kwota według końcowego ustalenia, nie samego wniosku.',[doc('Rodzic','Pismo ZUS, data doręczenia, brakujący dowód lub odwołanie przez ZUS.',URL.appeal)],URL.appeal,['Ustal, czego dokładnie dotyczy pismo i jaki wyznacza termin.']);
    if(['business','cooperating'].includes(a.work)&&a.debt&&a.debt!=='clear')info('debt','Wyjaśnij zaległości, zanim ocenisz wypłatę','Przy zadłużeniu ponad próg 1% minimalnego wynagrodzenia liczą się kwota, data powstania prawa i pełna spłata; układ ratalny nie jest pełną spłatą.','Pełna spłata w ciągu 6 miesięcy może zachować wypłatę za cały okres; potrzebna weryfikacja dat.','Nie odejmujemy długu od wyliczonego zasiłku.',[doc('Płatnik / ZUS','Rozliczenie konta i potwierdzenie pełnej spłaty.',URL.insurance)],URL.insurance,['Potwierdź skutek rozliczenia w tej konkretnej sprawie.']);

    if(a.event==='pregnancy'){
      if(r==='mother'&&isYes(a.pregnancySick)){
        const sickDays=date(a.sickFrom)&&date(a.sickTo)&&a.sickTo>=a.sickFrom?diff(a.sickFrom,a.sickTo)+1:NaN;
        const sm=a.sickWaiting==='yes'?[]:['Potwierdź wyczekiwanie lub wyjątek i pozostały okres zasiłkowy.'];
        const remaining=n(a.sickRemainingDays),knownRemaining=isYes(a.sickLimit)&&Number.isInteger(remaining)&&remaining>=0&&remaining<=270;
        if(sickDays>270&&!knownRemaining)sm.push('Podane dni przekraczają 270; ustal pozostały okres zasiłkowy przed obliczeniem wypłaty.');
        if(a.sickLimit!=='no'&&!knownRemaining)sm.push('Ustal liczbę pozostałych dni okresu zasiłkowego z płatnikiem.');
        if(knownRemaining&&remaining===0)sm.push('Okres zasiłkowy został wykorzystany; sprawdź świadczenie rehabilitacyjne.');
        const paidSickDays=knownRemaining&&Number.isFinite(sickDays)?Math.min(sickDays,remaining):sickDays;
        const paidSickEnd=paidSickDays>0&&date(a.sickFrom)?addDays(a.sickFrom,paidSickDays-1):'';
        const sd=[doc('Lekarz','Zwolnienie i potwierdzenie ciąży; to lekarz ocenia niezdolność do pracy.',URL.sick)];
        if(a.work==='employee'&&!isYes(a.employmentEnded))sd.push(doc('Pracodawca','Wynagrodzenie chorobowe / dokumenty do zasiłku i Z-3, gdy płaci ZUS.',URL.z3,'Z-3'));
        else sd.push(doc('Osoba ubezpieczona','ZAS-53 i dokumenty odpowiednie dla tytułu lub okresu po ustaniu ubezpieczenia.',URL.zas53,'ZAS-53'));
        const item=push('sick','Pieniądze podczas choroby w ciąży','Przy potwierdzonej niezdolności w ciąży stawka wynosi 100% podstawy; początkowo może płacić pracodawca.',paidSickEnd?`${a.sickFrom} — ${paidSickEnd}; ${paidSickDays} dni objętych obliczeniem z ${sickDays} dni zwolnienia.`:'Okres ze zwolnienia; w ciąży okres zasiłkowy co do zasady do 270 dni, z uwzględnieniem wcześniejszych okresów.',100,paidSickDays,sd,URL.sick,sm,{...(!(a.work==='employee'&&!isYes(a.employmentEnded))?{formCode:'ZAS-53'}:{}),sickFrom:a.sickFrom,sickTo:a.sickTo});
        item.gain='Zastępuje dochód za czas, kiedy ze względu na chorobę nie możesz pracować.';
        if(knownRemaining&&remaining<sickDays)item.gain=`Pozostałe ${sickDays-remaining} dni zwolnienia są poza potwierdzonym okresem zasiłkowym; sprawdź odrębną ścieżkę dalszego wsparcia.`;
        if(knownRemaining&&remaining===0){item.amount='0 zł z wyczerpanego okresu chorobowego; odrębnie sprawdź świadczenie rehabilitacyjne.';delete item.estimate;}
        if(isYes(a.sickLimit))info('rehabilitation','Sprawdź dalsze wsparcie po chorobowym','Gdy nadal nie możesz pracować, ale leczenie rokuje odzyskanie zdolności, możliwe jest świadczenie rehabilitacyjne.','Okres określa ZUS na podstawie dokumentacji i orzeczenia.','Nie liczymy kwoty bez ustalenia właściwego okresu.',[doc('Rodzic i lekarz','Wniosek o świadczenie rehabilitacyjne i dokumentacja zdrowia.',URL.rehabilitation)],URL.rehabilitation);
      }
      if(isYes(a.employmentEnded)&&['liquidation','death'].includes(a.terminationReason))info('pregnancy-after-work','Wsparcie przed porodem po utracie pracodawcy','Likwidacja, upadłość lub śmierć pracodawcy w czasie ciąży może otworzyć odrębną ścieżkę, jeżeli nie zapewniono innego zatrudnienia.','Do dnia porodu, po potwierdzeniu warunków.','Zasiłek w wysokości macierzyńskiego; podstawę ustala płatnik/ZUS.',[doc('Były pracodawca','Świadectwo pracy i Z-3.',URL.z3,'Z-3'),doc('Lekarz','Potwierdzenie ciąży istniejącej przed ustaniem zatrudnienia.'),doc('Rodzic','Wniosek ZAS-55 i oświadczenie o niezapewnieniu innego zatrudnienia.',URL.forms,'ZAS-55')],URL.maternity,['Sprawdź przyczynę rozwiązania umowy i brak innego zatrudnienia.']);
      if(r==='mother'){
        const plannedDays=countOk?[20,31,33,35,37][count-1]*7:null;
        const plannedEnd=plannedDays&&date(a.eventDate)?addDays(a.eventDate,plannedDays-1):'';
        const planned=push('birth-plan','Twój plan macierzyńskiego po porodzie','Przy zachowaniu obecnego ubezpieczenia i podstawy tak wygląda standardowy wariant 100%; po porodzie potwierdzimy daty i liczbę dzieci.',plannedEnd?`Plan: ${a.eventDate} — ${plannedEnd}; ${plannedDays} dni. Do 6 tygodni można wykorzystać przed przewidywanym porodem, skracając część po porodzie.`:'Do 6 tygodni można wykorzystać przed przewidywanym porodem; łączny okres zależy od liczby dzieci.',100,plannedDays,docs,URL.maternity,countOk?[]:['Podaj liczbę dzieci planowanego porodu.'],{planned:true,periods:plannedEnd?[{kind:'maternity',from:a.eventDate,to:plannedEnd}]:[]},'To plan na dzisiejszych danych; po porodzie można porównać też 81,5% i podział rodzicielskiego.');
        planned.status='Plan przy zachowaniu warunków';
        planned.planned=true;
      }else info('birth-plan','Przygotuj dokumenty po narodzinach','Po porodzie ustalimy rodzicielski i właściwe uprawnienia drugiego rodzica na podstawie rzeczywistej daty.','Termin porodu jest teraz planistyczny.','Podstawę i plan opieki sprawdzimy osobno dla każdego rodzica.',docs,URL.maternity,['Po porodzie potwierdź datę, ubezpieczenie i podział opieki.']);
    }

    if(['birth','adoption','foster'].includes(a.event)){
      const missing=[];
      if(!countOk)missing.push('Podaj liczbę dzieci z tego porodu lub przyjęcia.');
      if(!date(a.eventDate))missing.push('Podaj datę zdarzenia.');
      const certificateMissing=!['yes','no'].includes(a.zaZyciem)?['Sprawdź, czy jest właściwe zaświadczenie Za życiem.']:[];
      let maternityDays=countOk?[20,31,33,35,37][count-1]*7:null,ageLimit='',minimumAdoption=false;
      if(a.event!=='birth'){
        const age=a.event==='adoption'?14:a.schoolDeferred==='yes'?10:7,dob=date(a.childDob);
        if(dob){dob.setUTCFullYear(dob.getUTCFullYear()+age);ageLimit=iso(dob);}
        if(!ageLimit||!date(a.eventDate)||a.childDob>a.eventDate)missing.push('Uzupełnij poprawne daty urodzenia i przyjęcia dziecka.');
        else if(a.eventDate>=ageLimit)missing.push('Przyjęcie przypada po granicy wieku tej ścieżki; sprawdź indywidualne uprawnienie.');
        else if(maternityDays){minimumAdoption=diff(a.eventDate,ageLimit)<=63;maternityDays=Math.max(63,Math.min(maternityDays,diff(a.eventDate,ageLimit)));}
        if(a.event==='adoption'&&a.adoptionCourt!=='yes')missing.push('Potwierdź wystąpienie do sądu o przysposobienie.');
        if(a.event==='foster'&&a.fosterType!=='nonprofessional')missing.push('Sprawdź rodzaj pieczy; zawodowa rodzina nie należy do tej ścieżki.');
        if(a.event==='foster'&&a.schoolDeferred==='unknown')missing.push('Sprawdź odroczenie obowiązku szkolnego, jeśli ma wpływ na wiek.');
        docs.push(doc('Sąd / organizator pieczy','Potwierdzenie przyjęcia, trybu i dat; przy adopcji dokument postępowania o przysposobienie.',URL.documents));
      }else docs.push(doc('Rodzic / USC','Akt urodzenia lub dane potrzebne ZUS do uzyskania odpisu.',URL.documents));
      const rates=rate(a),parentalPool=minimumAdoption?(isYes(a.zaZyciem)?62:38):(isYes(a.zaZyciem)?(count===1?65:67):(count===1?41:43));
      if(r==='mother'||(a.event!=='birth'&&['guardian','father'].includes(r))){
        const end=maternityDays&&date(a.eventDate)?addDays(a.eventDate,maternityDays-1):'';
        push('maternity',a.event==='birth'?'Zasiłek za okres macierzyński':'Zasiłek po przyjęciu dziecka na wychowanie','To pieniądze za czas opieki bezpośrednio po porodzie lub przyjęciu, a nie jednorazowa zapomoga.',end?`${a.eventDate} — ${end} (${maternityDays} dni).`:'Okres zależy od liczby dzieci, dat i trybu przyjęcia.',rates.maternity,maternityDays,docs,URL.maternity,[...missing,...rates.missing],{periods:end?[{kind:'maternity',from:a.eventDate,to:end}]:[]},rates.adjustment?'Brak dnia rodzicielskiego w 81,5% w pierwszym roku oznacza wniosek o wyrównanie macierzyńskiego do 100%.':'Czas opieki i wypłata zależna od własnej podstawy.');
      }
      let h=null;
      if(isYes(a.hospital)){
        h=hospital(a);const start=maternityDays&&date(a.eventDate)?addDays(a.eventDate,maternityDays):'',end=start&&h.weeks?addDays(start,h.weeks*7-1):'';
        const hm=[...missing,...h.missing];
        if(r!=='mother'&&a.event==='birth')hm.push('Potwierdź, który rodzic korzysta bezpośrednio po macierzyńskim.');
        if(a.eventDate<'2025-03-19')hm.push('To wariant przejściowy sprzed 19.03.2025; potrzebna indywidualna ocena.');
        const hd=[...docs,doc('Szpital','Zaświadczenie: ukończony tydzień ciąży, masa urodzeniowa i wszystkie pobyty od–do.',URL.hospital),doc('Rodzic','Wniosek o uzupełniający bezpośrednio po macierzyńskim; pracownik składa go co najmniej 21 dni przed końcem macierzyńskiego.',URL.zam,'ZAM')];
        const item=push('supplementary','Dodatkowy czas po hospitalizacji dziecka','Uzupełniający macierzyński jest odrębny od Za życiem i płatny 100%, również przy planie 81,5%.',end?`${h.weeks} tygodni: ${start} — ${end}.`:h.weeks===0?'Podane pobyty nie tworzą dodatkowych tygodni w tym wariancie.':'Do 8 lub 15 tygodni; potrzebna pełna historia pobytów.',100,h.weeks?h.weeks*7:NaN,hd,URL.hospital,hm,{stays:h.stays,periods:end?[{kind:'supplementary',from:start,to:end}]:[]},h.weeks?`Według podanych pobytów: ${h.weeks} dodatkowych tygodni opieki.`:'Możliwy dodatkowy czas na opiekę po szpitalu.');
        if(h.weeks===0){item.amount='Brak dodatku obliczeniowego dla tych pobytów; sprawdź daty i zaświadczenie.';delete item.estimate;}
      }
      if(isYes(a.zaZyciem))info('za-zyciem','Dłuższy rodzicielski z zaświadczeniem „Za życiem”','Właściwe zaświadczenie potwierdza szczególną przesłankę zdrowotną powstałą prenatalnie lub przy porodzie; sam wypis i orzeczenie niepełnosprawności go nie zastępują.',`Pula rodzicielskiego w rozważanym wariancie: ${parentalPool} tygodni dla rodziców łącznie; po 9 tygodni zastrzeżone dla każdego.`,'To wydłużenie płatnego okresu rodzicielskiego, nie automatyczna dodatkowa jednorazowa wypłata.',[doc('Uprawniony lekarz','Zaświadczenie z art. 4 ust. 3 ustawy Za życiem.',URL.zaZyciem),doc('Rodzic i płatnik','Wniosek z właściwymi datami i podziałem rodzicielskiego.',URL.zam,'ZAM')],URL.parental,missing,'Dłuższy czas na opiekę; odrębne jednorazowe wsparcie sprawdza gmina.');
      if(isYes(a.zaZyciem))info('za-zyciem-payment','Osobno: jednorazowe 4000 zł w gminie','Świadczenie Za życiem dotyczy żywo urodzonego dziecka z właściwym zaświadczeniem; nie zależy od dochodu i nie jest częścią zasiłku ZUS.','Wniosek do 12 miesięcy od narodzin albo objęcia opieką / przysposobienia, w drugim przypadku najpóźniej przed 18. urodzinami.','4000 zł jednorazowo po spełnieniu warunków; nie dodajemy tej kwoty do wyliczeń ZUS.',[doc('Rodzic / uprawniony opiekun','Wniosek do gminy / OPS, dane dziecka i rachunek; dostępny także oficjalny kanał online.',URL.zaZyciemPayment),doc('Uprawniony lekarz','Zaświadczenie potwierdzające przesłankę z art. 4 ust. 3.',URL.zaZyciemPayment),doc('Lekarz / położna','Dla biologicznych rodziców: potwierdzenie opieki medycznej od nie później niż 10. tygodnia ciąży do porodu.',URL.zaZyciemPayment)],URL.zaZyciemPayment,['Gmina sprawdzi uprawnionego wnioskodawcę, termin, dokumenty i pozostałe warunki; opiekunowie prawni, faktyczni i rodzice adopcyjni nie potwierdzają opieki medycznej w ciąży.'],'Odrębna pomoc na wydatki związane z opieką nad dzieckiem.');
      const own=n(a.parentalWeeks),other=n(a.otherPlannedWeeks),usedOwn=isYes(a.previousParental)?n(a.usedOwnWeeks):a.previousParental==='no'?0:NaN,usedOther=isYes(a.previousParental)?n(a.usedOtherWeeks):a.previousParental==='no'?0:NaN;
      const pm=[...missing,...certificateMissing];
      if(!['yes','no'].includes(a.otherInsurance))pm.push('Sprawdź odrębne chorobowe drugiego rodzica.');
      if(![own,other,usedOwn,usedOther].every(v=>Number.isFinite(v)&&v>=0))pm.push('Uzupełnij nowe i wykorzystane tygodnie obojga rodziców.');
      else if(own+usedOwn>parentalPool-9||other+usedOther>parentalPool-9||own+other+usedOwn+usedOther>parentalPool)pm.push('Podział przekracza pulę albo 9 tygodni zastrzeżone drugiemu rodzicowi.');
      if(isYes(a.workDuringParental)||a.workDuringParental==='unknown')pm.push('Łączenie z pracą wymaga osobnego obliczenia etatu i wydłużenia okresu.');
      const from=a.parentalStart,to=date(from)&&own>0?addDays(from,own*7-1):'';
      if(own>0&&!date(from))pm.push('Wpisz datę rozpoczęcia swojej części rodzicielskiego.');
      if(date(from)&&date(a.eventDate)&&from<a.eventDate)pm.push('Rodzicielski nie może zaczynać się przed narodzinami lub przyjęciem.');
      if(a.plan==='combined'&&a.firstYearParental==='yes'&&date(from)&&date(a.eventDate)){const birthday=date(a.eventDate);birthday.setUTCFullYear(birthday.getUTCFullYear()+1);if(from>=iso(birthday))pm.push('Plan zaczyna się po pierwszym roku; potwierdź wcześniejszy dzień rodzicielskiego w 81,5% lub wybierz wyrównanie.');}
      if(a.event==='birth'&&to){const limit=`${date(a.eventDate)?.getUTCFullYear()+6}-12-31`;if(to>limit)pm.push('Podany rodzicielski wykracza poza koniec roku 6. urodzin.');}
      if(a.event!=='birth'&&to&&ageLimit&&to>=ageLimit)pm.push('Okres po granicy wieku wymaga indywidualnego ustalenia.');
      if((r==='mother'||a.event!=='birth')&&from&&maternityDays){const earliest=addDays(a.eventDate,maternityDays+(h?.weeks||0)*7);if(from<earliest)pm.push('Ta część musi następować po okresie macierzyńskim i wybranym uzupełniającym.');}
      if(a.hospital!=='no'&&!h?.weeks)pm.push('Sprawdź hospitalizację, zanim ustalisz daty kolejnych części.');
      if(r==='father'&&a.event==='birth'&&own>9&&a.otherInsurance!=='no')pm.push('Przy części ponad własne 9 tygodni potwierdź stawkę wspólnego planu rodziców.');
      if(r!=='father'||a.event!=='birth')pm.push(...rates.missing);
      if(own!==0)push('parental','Zasiłek za Twój okres rodzicielski','To odrębny płatny okres opieki; rodzice dzielą wspólną pulę, ale każde zachowuje swoją nieprzenoszalną część.',to?`${own} tygodni: ${from} — ${to}; pula rodziny ${parentalPool} tygodni.`:`Pula rodziny: ${parentalPool} tygodni; podział wymaga odpowiedzi obojga rodziców.`,r==='father'&&a.event==='birth'?70:rates.parental,Number.isInteger(own)&&own>0?own*7:NaN,docs,URL.parental,pm,{periods:to?[{kind:'parental',from,to}]:[]},'Drugiemu rodzicowi przysługuje własna część; nie trzeba przenosić macierzyńskiego mamy.');
      if(other>0){
        const om=[...missing,...certificateMissing],ofrom=a.otherParentalStart,odays=other*7,oto=date(ofrom)?addDays(ofrom,odays-1):'';
        if(a.otherInsurance!=='yes'||a.otherConditionsConfirmed!=='yes')om.push('Potwierdź własne uprawnienie i warunki drugiego rodzica z jego płatnikiem.');
        if(a.otherBaseKnown!=='yes'||!(n(a.otherBenefitBase)>0))om.push('Podaj odrębną potwierdzoną podstawę drugiego rodzica.');
        if(!date(ofrom)||ofrom<a.eventDate)om.push('Podaj poprawny początek części drugiego rodzica.');
        if(![own,other,usedOwn,usedOther].every(v=>Number.isFinite(v)&&v>=0)||own+other+usedOwn+usedOther>parentalPool||other+usedOther>parentalPool-9||own+usedOwn>parentalPool-9)om.push('Potwierdź wspólną pulę i wykorzystanie części przez oboje rodziców.');
        const otherRole=r==='mother'?'father':r==='father'?'mother':'other';
        if((otherRole==='mother'||a.event!=='birth')&&maternityDays&&ofrom<addDays(a.eventDate,maternityDays+(h?.weeks||0)*7))om.push('Ta część drugiej osoby przypada przed końcem jej okresu macierzyńskiego / uzupełniającego.');
        if(oto&&a.event==='birth'&&date(a.eventDate)&&oto>`${date(a.eventDate).getUTCFullYear()+6}-12-31`)om.push('Część drugiego rodzica przekracza koniec roku 6. urodzin.');
        if(oto&&a.event!=='birth'&&ageLimit&&oto>=ageLimit)om.push('Część drugiego opiekuna po granicy wieku wymaga ustalenia.');
        const reservedOnly=otherRole==='father'&&other<=9&&usedOther===0;
        if(a.otherRatePlan!=='standard'&&!reservedOnly)om.push('Dla wspólnego 81,5% potwierdź rozdzielenie dni 70% i 81,5%; nie uśredniamy stawek.');
        const item=info('other-parental','Rodzicielski drugiego rodzica','Kwotę liczymy z jego własnej potwierdzonej podstawy; to odrębna wypłata za uzgodnione dni.',oto?`${ofrom} — ${oto}; ${odays} dni.`:'Uzupełnij daty części drugiego rodzica.','70% własnej podstawy; kwota po potwierdzeniu danych.',[doc('Drugi rodzic i jego płatnik','ZAM / wniosek urlopowy, potwierdzenie własnego prawa, podstawy i historii rodzicielskiego.',URL.zam,'ZAM')],URL.parental,om);
        item.parent=otherRole;item.pdfContext={...item.pdfContext,role:otherRole,periods:oto?[{kind:'parental',from:ofrom,to:oto}]:[]};
        if(!om.length){const daily=typeof root?.zusDaily==='function'?root.zusDaily(n(a.otherBenefitBase),70,0,1):round(round(n(a.otherBenefitBase)/30)*.7);item.estimate={daily,days:odays,total:round(daily*odays),rate:70};item.amount=`${money(item.estimate.total)} brutto za ${odays} dni (${money(daily)} za dzień).`;item.status='Dopasowane do odpowiedzi';}
      }
      if(r==='father'&&a.event!=='foster'){
        const used=n(a.paternityUsedDays),remain=Number.isInteger(used)&&used>=0&&used<=14?14-used:NaN,pstart=a.paternityStart,pend=date(pstart)&&remain>0?addDays(pstart,remain-1):'';
        const fm=[];if(!Number.isFinite(remain)||![0,7,14].includes(used))fm.push('Potwierdź wcześniej wykorzystane tygodniowe części ojcowskiego.');
        if(!date(pstart))fm.push('Podaj początek ojcowskiego.');
        if(date(pstart)&&date(a.eventDate)&&pstart<a.eventDate)fm.push('Ojcowski nie może zaczynać się przed narodzinami lub przyjęciem.');
        const birthday=date(a.event==='birth'?a.eventDate:a.childDob);if(birthday){birthday.setUTCFullYear(birthday.getUTCFullYear()+1);if(a.event==='birth'&&pend>=iso(birthday))fm.push('Ojcowski należy wykorzystać przed ukończeniem przez dziecko 12 miesięcy.');}else fm.push('Potwierdź datę urodzenia.');
        if(a.event!=='birth')fm.push('Przy adopcji potwierdź prawomocność przysposobienia i granicę wieku z płatnikiem.');
        if(remain>0||!Number.isFinite(remain))push('paternity','Ojcowski — osobno od rodzicielskiego','Ojciec może wykorzystać do dwóch tygodni; nie pomniejsza to jego dziewięciu tygodni rodzicielskiego.',pend?`${pstart} — ${pend}; pozostało ${remain} dni.`:'Do 2 tygodni, jednorazowo albo w dwóch tygodniowych częściach.',100,remain,docs,URL.maternity,fm,{periods:pend?[{kind:'paternity',from:pstart,to:pend}]:[]});
      }
      if(isYes(a.lowBenefit))info('topup','Sprawdź podwyższenie niskiego macierzyńskiego','Płatnik bada kwotę po podatku ze wszystkich tytułów; nie porównuje jedynie podstawy lub pojedynczego przelewu.','Osobno za każdy miesiąc; przy niepełnym miesiącu proporcjonalnie.','Możliwe podwyższenie do poziomu 1000 zł; nie jest to dodatkowe 1000 zł do każdej wypłaty.',[doc('Rodzic','Oświadczenie o innych wypłatach i podwyższeniach.'),doc('Płatnik / ZUS','Rozliczenie miesięcznej kwoty po PIT i należnego podwyższenia.',URL.amount)],URL.amount,['Ustal faktyczne wypłaty netto, PIT, inne tytuły i dni świadczenia.']);
      if(a.insurance==='no'||a.work==='none')info('municipal','Sprawdź świadczenie rodzicielskie w gminie','Brak chorobowego nie musi oznaczać braku pomocy. To inne świadczenie niż zasiłek z ZUS i ma własne warunki oraz wyłączenia.','Zwykle 52 tygodnie przy jednym dziecku; inne warianty wymagają ustalenia.','1000 zł miesięcznie po spełnieniu warunków; bez automatycznego sumowania z macierzyńskim rodziców.',[doc('Rodzic / opiekun','Wniosek w gminie / OPS lub przez oficjalny kanał wskazany w usłudze.',URL.municipal)],URL.municipal,['Sprawdź świadczenia obojga rodziców, opiekę, pobyt i pozostałe wyłączenia.']);
    }

    if(['loss','childDeath'].includes(a.event)){
      const lm=[];let from=a.eventDate,days=56;
      if(r!=='mother')lm.push('Osiem tygodni po stracie dotyczy matki; dla bliskiej osoby sprawdź odrębne zwolnienie/opiekę.');
      let survivors=0;
      if(a.otherSurviving!=='no'){
        if(!Array.isArray(a.lossChildren)||!a.lossChildren.length||a.lossChildren.some(c=>!['yes','no'].includes(c.alive)))lm.push('Przy innych dzieciach z tego porodu potwierdź sytuację każdego dziecka.');
        else survivors=a.lossChildren.filter(c=>c.alive==='yes').length;
      }
      if(!['medical','act'].includes(a.lossDocument))lm.push('Uzyskaj właściwy dokument o zdarzeniu; po martwym urodzeniu akt nie zawsze jest konieczny.');
      if(!date(a.eventDate))lm.push('Podaj datę zdarzenia, jeśli chcesz ustalić okres.');
      if(a.event==='childDeath'){
        from=a.childDob;days=null;
        if(a.lossDocument!=='act')lm.push('Po żywym urodzeniu potwierdź właściwy akt dotyczący śmierci; zaświadczenie o martwym urodzeniu dotyczy innej sytuacji.');
        if(!date(from)||!date(a.eventDate)||a.eventDate<from)lm.push('Potwierdź daty urodzenia i śmierci, żeby ustalić koniec okresu.');
        else if(a.maternityAtDeath!=='yes')lm.push('Potwierdź, czy w dniu śmierci trwał okres macierzyński; nie zaczynamy nowego okresu po jego zakończeniu.');
        else {const ageDays=diff(from,a.eventDate);if(ageDays<56)days=Math.max(56,ageDays+7);else{from=a.eventDate;days=7;}}
      }
      if(a.event==='loss'&&a.lossDocument==='medical'&&date(a.eventDate)&&a.eventDate<'2025-08-06')lm.push('To zdarzenie sprzed 6 sierpnia 2025; sposób dokumentowania wymaga odrębnego potwierdzenia.');
      if(survivors>0&&survivors<=5){from=a.event==='loss'?a.eventDate:a.childDob;days=[20,31,33,35,37][survivors-1]*7;if(a.event==='childDeath'&&date(from)&&date(a.eventDate)&&diff(from,a.eventDate)>=56)days=Math.max(days,diff(from,a.eventDate)+7);}
      const end=days&&date(from)?addDays(from,days-1):'';
      const lossDocs=[...docs,doc('Lekarz / położna lub USC','Zaświadczenie o martwym urodzeniu albo odpowiedni akt; nie potrzebujemy płci, imienia ani rozpoznania.',URL.loss)];
      if(a.work==='employee')lossDocs.unshift(doc('Ty → pracodawca / kadry','Wniosek o urlop macierzyński po stracie; dołącz właściwy dokument.',URL.loss,'LEAVE-LOSS'));
      const lossItem=push('loss','Wsparcie po stracie','Możesz przejść formalności bez opisywania szczegółów straty; zaświadczenie lekarza lub położnej może zastąpić akt po martwym urodzeniu.',end?`${from} — ${end}; ${days} dni, ustalone dla opisanej sytuacji.`:'Okres po śmierci dziecka zależy od dat i pozostałych dzieci z tego porodu.',100,days,lossDocs,URL.loss,lm,{kind:'loss',reason:'loss',periods:end?[{kind:'maternity',from,to:end}]:[]});
      lossItem.supportRequest='Dzień dobry, bardzo proszę o pomoc w przygotowaniu wniosku o urlop po stracie i wskazanie dokumentów potrzebnych do wypłaty świadczenia. Czy mogę liczyć na spokojne przeprowadzenie przez formalności? Dziękuję za wsparcie.';
      lossItem.support=[{title:'Ronić po Ludzku',url:'https://ronicpoludzku.com/'},{title:'Fundacja Wcześniak Rodzice-Rodzicom',url:'https://wczesniak.pl/'},{title:'Fundacja Rodzić po Ludzku',url:'https://rodzicpoludzku.pl/'}];
      if(isYes(a.funeralCosts))info('funeral','Zwrot części kosztów pochówku','Osoba, która poniosła koszty, może sprawdzić odrębny zasiłek pogrzebowy.','Termin i dokumenty zależą od daty zdarzenia oraz uprawnienia.','Kwota do ustalenia według daty, relacji i udokumentowanych kosztów.',[doc('Osoba, która zapłaciła','Rachunki kosztów i wniosek pogrzebowy.'),doc('Lekarz / USC','Dokument właściwy dla zdarzenia.',URL.funeral)],URL.funeral);
    }
    if(a.event==='care'){
      const cm=[],used=n(a.careUsedDays),from=a.eventDate,to=a.careUntil;
      const fullPeriod=date(from)&&date(to)&&to>=from;
      const childAge=ageAt(a.childDob,from),endAge=ageAt(a.childDob,to);
      const youngSick=a.careReason==='sickChild'&&childAge>=0&&endAge>=0&&endAge<2;
      if(a.otherCarer!=='no'&&!youngSick)cm.push('Sprawdź możliwość zapewnienia opieki przez domownika; dla chorego dziecka poniżej 2 lat ten warunek nie obowiązuje.');
      if(!Number.isInteger(used)||used<0||used>60)cm.push('Ustal wykorzystany roczny limit opieki w rodzinie.');
      if(!date(a.childDob)&&a.careReason!=='adult')cm.push('Podaj datę urodzenia i potwierdź odpowiedni wariant opieki.');
      const cd=[doc('Rodzic / opiekun','Aktualny Z-15, oświadczenia o opiece i wykorzystanych dniach.',URL.z15,'Z-15'),doc('Lekarz / placówka','Zwolnienie lub właściwe potwierdzenie przyczyny opieki.'),doc('Płatnik','Dane do podstawy i wypłaty.',a.work==='employee'?URL.z3:URL.forms)];
      if(a.careReason==='sickChild'){
        if(!fullPeriod)cm.push('Podaj poprawny początek i koniec opieki.');
        if(!(childAge>=0&&childAge<14&&endAge>=0&&endAge<14))cm.push('Potwierdź wiek przez cały okres; ukończenie 14 lat zmienia wariant limitu.');
        if(fullPeriod&&from.slice(0,4)!==to.slice(0,4))cm.push('Podziel okres między lata kalendarzowe i podaj wykorzystanie limitu dla każdego roku.');
        if(a.careProof!=='yes')cm.push('Potwierdź zwolnienie na opiekę wystawione przez lekarza.');
        if(a.carePersonal!=='yes')cm.push('Potwierdź osobistą opiekę zamiast pracy i brak zachowanego wynagrodzenia.');
        if(a.careOnlyClaimant!=='yes')cm.push('Wyjaśnij, czy drugi rodzic nie pobiera opiekuńczego za te same dni.');
      }else cm.push('Ustal właściwy limit dla przyczyny opieki przed obliczeniem liczby płatnych dni.');
      const requested=fullPeriod?diff(from,to)+1:null,remaining=Number.isInteger(used)&&used>=0&&used<=60?60-used:null;
      const paid=cm.length===0&&remaining!==null?Math.min(requested,remaining):null;
      let item;
      if(paid!==null&&paid>0){
        const end=addDays(from,paid-1);
        item=push('care','Zasiłek opiekuńczy na chore dziecko','Zastępuje dochód za osobistą opiekę nad chorym dzieckiem poniżej 14 lat; limit 60 dni jest wspólny dla rodziny.',`${from} — ${end}: ${paid} płatnych dni z podanych ${requested}; w rocznym limicie pozostało ${remaining}.`,80,paid,cd,URL.care,[],{periods:[{kind:'care',from,to:end}]},paid<requested?`Pozostałe ${requested-paid} dni nie mieszczą się w podanym wspólnym limicie.`:'Możesz zająć się dzieckiem bez utraty całego dochodu.');
      }else{
        item=info('care','Zasiłek opiekuńczy','To wypłata za zwolnienie od pracy potrzebne do osobistej opieki, inna niż macierzyński i urlop rodzicielski.',paid===0?'Wspólny limit 60 dni na ten rok jest już wykorzystany.':'Limity mogą wynosić 60, 30 lub 14 dni; zależą od wieku, przyczyny i wykorzystania wspólnej puli.',paid===0?'0 zł za dodatkowe dni z wyczerpanej puli 60 dni.':'Co do zasady 80% potwierdzonej podstawy; nie liczymy dni bez ustalenia wariantu.',cd,URL.care,[...common,...cm]);
        if(paid!==0){const daily=estimate(a,80,NaN);if(daily.estimate){item.amount=`Przy spełnieniu warunków: ${money(daily.estimate.daily)} brutto za dzień (80% podstawy); łączna kwota po ustaleniu płatnych dni.`;}else item.missing=unique([...item.missing,...daily.missing]);}
      }
    }
    if(a.event==='transfer')info('transfer','Ustal przejęcie opieki od mamy','Powrót do pracy, hospitalizacja, orzeczenie, śmierć lub zaprzestanie opieki mają różne warunki i dokumenty; nie można ich zastąpić jednym pytaniem o rolę.','Potrzebne są daty, okres wykorzystany przez mamę i podstawa przejęcia.','Stawka i kwota po potwierdzeniu właściwego wariantu.',[...docs,doc('Mama / jej płatnik','Potwierdzenie wykorzystanego okresu i przerwania lub zakończenia wypłaty.'),doc('Lekarz / sąd / USC, zależnie od sytuacji','Dokument potwierdzający konkretną przyczynę przejęcia.',URL.documents)],URL.transfer,[...common,'Ustal warunki przejęcia; w pierwszych 8 tygodniach może chodzić o dodatkowy opiekuńczy.']);
    if(a.event==='motherHealth'){
      const item=info('mother-health','Wsparcie zdrowia mamy','Problemy zdrowotne lub samopoczucie po porodzie warto omówić z lekarzem lub położną; nie wynikają one z samego wyboru roli ani z materiałów konkursowych.','Lekarz ocenia niezdolność do pracy; przejęcie opieki przy hospitalizacji mamy wymaga osobnej ścieżki.','Do potwierdzenia w ZUS: nie wyliczamy kwoty na podstawie objawów.',[doc('Lekarz','Ocena stanu zdrowia i e-ZLA, jeżeli jest wskazane.',URL.sick),doc('Rodzina / płatnik','Przy hospitalizacji: dokumenty przejęcia opieki lub dodatkowego opiekuńczego.',URL.transfer)],URL.sick,['Ustal z lekarzem potrzebną pomoc, a z płatnikiem właściwy rodzaj świadczenia.']);
      item.support=[{title:'NFZ: smutek poporodowy i pomoc lekarza',url:'https://akademia.nfz.gov.pl/artykuly/smutek-poporodowy-czy-depresja/'}];
      item.nextEvent=a.motherHealthSituation==='hospital'?'transfer':null;
    }
    const blockers=inspect(a);
    for(const item of results){
      item.parent=item.parent||r;
      item.recipient=a.work==='employee'?'Urlop: pracodawca. Wypłata: '+(a.employmentEnded==='yes'?'ZUS.':a.payerSize==='over20'?'pracodawca jako płatnik.':a.payerSize==='upTo20'?'ZUS, z dokumentami od pracodawcy.':'potwierdź w kadrach stan zgłoszeń na dzień ustalania płatnika.'):'Wniosek o świadczenie: właściwa instytucja wskazana przy dokumentach.';
      if(item.id==='other-parental')item.recipient='Wniosek urlopowy: pracodawca drugiego rodzica; wypłatę i dokumenty ustala jego płatnik.';
      const relevant=blockers.filter(b=>item.id==='other-parental'?b.scope==='parental':b.scope==='all'||b.scope===item.id);
      item.blockers=[...relevant,...(item.missing||[]).filter(text=>!relevant.some(b=>b.text===text)).map((text,i)=>({id:'missing-'+i,kind:/zaświadczeni|dokument|oświadczeni/i.test(text)?'document':'missing',text}))];
      if(relevant.length){item.missing=unique([...(item.missing||[]),...relevant.map(b=>b.text)]);if(item.estimate){item.amount='Kwota po wyjaśnieniu wskazanych danych i warunków.';delete item.estimate;}}
      item.check={state:item.blockers.some(b=>b.kind==='risk')?'risk':item.blockers.length?'missing':item.estimate?'ok':'info',label:item.blockers.some(b=>b.kind==='risk')?'Ryzyko odmowy':item.blockers.length?`Brakuje: ${item.blockers.length}`:item.estimate?'Wygląda na spełnione':'Wymaga indywidualnego ustalenia',disclaimer:'To wskazówka, nie decyzja ZUS'};
      item.sumEligible=Boolean(item.estimate&&Number.isFinite(item.estimate.total)&&!item.missing.length);
      const leaveCodes={maternity:'LEAVE-MATERNITY',parental:'LEAVE-PARENTAL',paternity:'LEAVE-PATERNITY'};
      if(a.work==='employee'&&leaveCodes[item.id])item.documents=[doc('Ty → pracodawca','Wniosek o urlop z datami ustalonymi dla Twojej sytuacji.',item.url,leaveCodes[item.id]),...item.documents];
      if(a.role==='supporter'&&!item.supportRequest)item.supportRequest='Czy mogę Cię prosić o pomoc w skompletowaniu dokumentów wskazanych przez Otulę? Chętnie wspólnie sprawdzę, co jest już gotowe. Dziękuję za wsparcie.';
      if(item.id==='parental'){item.pdfContext.parentalParts=a.parentalParts||[];item.pdfContext.workPeriods=a.workPeriods||[];}
    }
    return results;
  }
  function summarize(answers,items=assess(answers)){
    const byParent={},missing=[],seen=new Set();let total=0,count=0;
    const conflict=new Set();
    for(let i=0;i<items.length;i++)for(let j=0;j<i;j++){const x=items[i],y=items[j];if(x.parent===y.parent&&x.sumEligible&&y.sumEligible&&(x.pdfContext?.periods||[]).some(p=>(y.pdfContext?.periods||[]).some(q=>p.from<=q.to&&p.to>=q.from))){conflict.add(x.id);conflict.add(y.id);}}
    if(conflict.size)missing.push('Okresy różnych świadczeń tej samej osoby nakładają się; popraw daty, zanim je zsumujemy.');
    for(const item of items){if(seen.has(item.id))continue;seen.add(item.id);if(item.sumEligible&&!conflict.has(item.id)){total=round(total+item.estimate.total);byParent[item.parent]=round((byParent[item.parent]||0)+item.estimate.total);count++;}else if(item.missing?.length)missing.push(...item.missing);}
    if(n(answers?.otherPlannedWeeks)>0&&!items.some(i=>i.id==='other-parental'&&i.sumEligible))missing.push('Kwota drugiego rodzica wymaga jego własnej podstawy i potwierdzonych warunków; nie używamy podstawy pierwszej osoby.');
    return {total:count?total:null,byParent,missing:unique(missing),partial:missing.length>0,label:'Orientacyjnie, brutto, bez PIT'};
  }
  return {version:VERSION,questions,assess,prune,migrate,summarize,sources:URL,evaluate:a=>({benefits:assess(a)}),helpers:{date,addDays,hospital,inspect}};
});
