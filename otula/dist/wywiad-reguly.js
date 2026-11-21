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

  function questions(input={}) {
    const a=input||{}, r=who(a), q=[choices('role','Dla kogo sprawdzamy wsparcie?', [['mother','Dla mamy'],['father','Dla taty'],['guardian','Dla opiekuna'],['supporter','Pomagam bliskiej osobie']])];
    if(!answered(a.role))return q;
    if(a.role==='supporter')q.push(choices('behalf','Czyją sytuację opisujesz?', [['mother','Mamy'],['father','Taty'],['guardian','Opiekuna']]));
    q.push(choices('event','Co teraz dzieje się w rodzinie?', [['pregnancy','Czekamy na narodziny'],['birth','Dziecko się urodziło'],['adoption','Przyjęcie dziecka do adopcji'],['foster','Przyjęcie do rodziny zastępczej'],['care','Potrzebna opieka nad dzieckiem lub bliskim'],['transfer','Trzeba przejąć opiekę od mamy'],['loss','Strata ciąży / martwe urodzenie'],['childDeath','Dziecko zmarło']]));
    if(!answered(a.event))return q;
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
        q.push(choices('hospitalConfirmed','Czy masz zaświadczenie szpitala z tymi danymi?',yn,'Przy porodzie mnogim uwzględniamy pobyty jednego dziecka hospitalizowanego najdłużej, nie sumę pobytów rodzeństwa.'));
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
      if(r==='father'&&a.event!=='foster')q.push(field('paternityUsedDays','Ile dni ojcowskiego wykorzystano wcześniej?','number','okresy','To osobna pula od rodzicielskiego.',0,14,1),field('paternityStart','Od kiedy chcesz skorzystać z ojcowskiego?','date','okresy'));
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

  function prune(input={}) {
    let a={...input};
    for(let pass=0;pass<4;pass++) {
      const list=questions(a), next={};
      for(const q of list)if(answered(a[q.id])){
        const value=a[q.id];
        if(value==='unknown'||q.type!=='choice'||q.options.some(o=>o.value===value))next[q.id]=value;
      }
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
    else if(['business','cooperating'].includes(a.work))docs.push(doc('Płatnik i ZUS','Potwierdzenie tytułu, okresu chorobowego, podstaw i stanu rozliczeń; sprawdź bieżącą instrukcję zamiast automatycznie dokładać stary Z-3b.',URL.forms));
    return docs;
  }
  function eligibility(a) {
    const missing=[];
    if(a.insurance!=='yes')missing.push(a.insurance==='no'?'Brak chorobowego: sprawdź wyjątki po ustaniu ubezpieczenia i wsparcie poza ZUS.':'Potwierdź chorobowe na dzień powstania prawa.');
    else if(a.coverageVerified!=='yes')missing.push('Potwierdź daty i tytuł chorobowego z płatnikiem lub ZUS.');
    if(!['employee','contract','business','cooperating'].includes(a.work))missing.push(a.work==='krus'?'Ustal odrębne uprawnienia i wypłatę w KRUS.':'Ustal tytuł ubezpieczenia.');
    for(const [id,text] of [['insuranceDispute','Wyjaśnij wezwanie lub decyzję ZUS.'],['foreign','Sprawdź wpływ pracy i świadczeń zagranicznych.'],['multipleTitles','Rozlicz każdy tytuł oddzielnie; nie sumujemy niepotwierdzonych podstaw.']])if(a[id]!=='no')missing.push(text);
    if(['business','cooperating'].includes(a.work)&&a.debt!=='clear'&&!(a.debt==='paid'&&a.debtResolved==='yes'))missing.push('Sprawdź zaległość i skutek pełnej spłaty z ZUS; raty nie są pełną spłatą.');
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
  function hospital(a) {
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

  function assess(input={}) {
    const a=prune(input),results=[],r=who(a),common=eligibility(a);
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
      if(![own,other,usedOwn,usedOther].every(v=>Number.isInteger(v)&&v>=0))pm.push('Uzupełnij nowe i wykorzystane tygodnie obojga rodziców.');
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
      if(a.otherSurviving!=='no')lm.push('Przy innych dzieciach z tego porodu trzeba ustalić okres dla pozostałych przy życiu.');
      if(!['medical','act'].includes(a.lossDocument))lm.push('Uzyskaj właściwy dokument o zdarzeniu; po martwym urodzeniu akt nie zawsze jest konieczny.');
      if(!date(a.eventDate))lm.push('Podaj datę zdarzenia, jeśli chcesz ustalić okres.');
      if(a.event==='childDeath'){from=a.childDob;days=null;lm.push('Zgon po żywym urodzeniu wymaga ustalenia końca okresu, z uwzględnieniem wieku i co najmniej 7 dni po zgonie.');}
      const end=days&&date(from)?addDays(from,days-1):'';
      push('loss','Wsparcie po stracie','Możesz otrzymać pomoc w formalnościach bez opisywania szczegółów straty; po martwym urodzeniu medyczne zaświadczenie może zastąpić akt.',end?`${from} — ${end}; 8 tygodni.`:'Okres po śmierci dziecka zależy od dat i pozostałych dzieci z tego porodu.',100,days,[...docs,doc('Lekarz / położna lub USC','Odpowiednie zaświadczenie o martwym urodzeniu albo akt; bez wymagania ustalenia płci w ścieżce medycznej.',URL.loss)],URL.loss,lm,{periods:end?[{kind:'maternity',from,to:end}]:[]});
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
    return results;
  }
  return {version:VERSION,questions,assess,prune,sources:URL,evaluate:a=>({benefits:assess(a)}),helpers:{date,addDays,hospital}};
});
