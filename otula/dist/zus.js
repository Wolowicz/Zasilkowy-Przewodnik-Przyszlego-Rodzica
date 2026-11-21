'use strict';

// Rules are versioned independently from the interface. Values edited in the demo
// apply only to this browser session and are visibly labelled in the result.
const ZUS_DEFAULT_RULES = Object.freeze({
  version: '2026-11-21',
  maternityWeeks: [20,31,33,35,37],
  parentalWeeks: [41,43],
  specialParentalWeeks: [65,67],
  reservedWeeks: 9,
  maternityRate: 100,
  parentalRate: 70,
  combinedRate: 81.5
});
let zusRules = structuredClone(ZUS_DEFAULT_RULES);
let zusDraft = null;
let zusDemo = '';
let zusDocumentUrl = '';
const ZUS_SOURCES = {
  amount: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
  duration: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego',
  parental: 'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
  documents: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
  insurance: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje',
  base: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru',
  sick: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-chorobowy',
  rehabilitation: 'https://www.zus.pl/swiadczenia/zasilki/swiadczenie-rehabilitacyjne',
  forms: 'https://www.zus.pl/wzory-formularzy/zasilki',
  work: 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo'
};
function zusSource(key,label) {
  return `<a href="${ZUS_SOURCES[key]}" target="_blank" rel="noopener noreferrer">${label} ${icon('external',14)}</a>`;
}
function zusMoney(value) {
  return value.toLocaleString('pl-PL',{style:'currency',currency:'PLN'});
}
function zusInitial() {
  const child=state.children[state.active];
  return {kind:'birth',count:1,special:false,insurance:'unknown',insuranceB:'unknown',
    baseA:5000,baseB:5000,shareA:32,fractionA:0,fractionB:0,rate:'standard',
    eventDate:child.stage==='birth'?child.date:'',childDob:child.stage==='birth'?child.date:'',
    deferred:false,payer:state.work==='business'?'zus':'unknown',exception:'none',
    workA:state.work,workB:'employee',coverageEnd:'',debt:'unknown',applicationDate:''};
}
function zusField(label,name,value,attributes='') {
  return `<label class="field">${label}<input name="${name}" value="${esc(value)}" ${attributes}></label>`;
}
function zusSelect(label,name,entries,value) {
  return `<label class="field">${label}<select name="${name}">${options(entries,value)}</select></label>`;
}
function zusCheck(label,name,checked) {
  return `<label class="multiple-choice"><input type="checkbox" name="${name}" ${checked?'checked':''}>${label}</label>`;
}
function zusRead(form) {
  const d=new FormData(form), value=Object.fromEntries(d);
  for(const key of ['count','baseA','baseB','shareA','fractionA','fractionB'])value[key]=Number(d.get(key));
  value.special=d.has('special');value.deferred=d.has('deferred');
  return value;
}
function zusCalculation(d,rules=zusRules) {
  const issues=[];
  const count=d.count;
  if(!Number.isInteger(count)||count<1||count>5)issues.push('Wybierz liczbę dzieci urodzonych lub przyjętych jednocześnie.');
  for(const key of ['A','B']) {
    if(!Number.isFinite(d['base'+key])||d['base'+key]<0)issues.push('Podstawa zasiłku musi być poprawną kwotą.');
    if(!Number.isFinite(d['fraction'+key])||d['fraction'+key]<0||d['fraction'+key]>.5)issues.push('Wymiar pracy w okresie urlopu musi wynosić od 0 do połowy etatu.');
    if(d['fraction'+key]>0&&d['work'+key]!=='employee')issues.push('Łączenie urlopu z pracą w tym kalkulatorze dotyczy umowy o pracę u pracodawcy udzielającego urlopu.');
  }
  if(!Number.isInteger(d.shareA)||d.shareA<0)issues.push('Podaj pełną, nieujemną liczbę tygodni rodzicielskich pierwszego rodzica.');
  if(issues.length)return {issues};
  let maternity=rules.maternityWeeks[count-1];
  let parental=(d.special?rules.specialParentalWeeks:rules.parentalWeeks)[count===1?0:1];
  let ageLimit=null;
  if(d.kind!=='birth') {
    const dob=parseDate(d.childDob),event=parseDate(d.eventDate);
    if(!dob||!event||dob>event)issues.push('Przy przyjęciu na wychowanie potrzebne są poprawne daty urodzenia i przyjęcia dziecka.');
    else {
      ageLimit=new Date(dob);ageLimit.setFullYear(dob.getFullYear()+(d.kind==='adoption'?14:d.deferred?10:7));
      const days=daysBetween(event,ageLimit);
      if(days<=0)issues.push('Dziecko osiągnęło limit wieku dla tej ścieżki. Sprawdź indywidualne uprawnienia z ZUS.');
      else if(days<maternity*7+d.shareA*7/(1-d.fractionA))issues.push('Przyjęcie blisko granicy wieku wymaga sprawdzenia skróconego wymiaru i dat wykorzystania urlopu. Ten wariant wymaga wyliczenia indywidualnego.');
    }
  }
  if(d.exception!=='none')issues.push('Wybrana szczególna sytuacja wymaga indywidualnego ustalenia okresu zasiłku. Otwórz wskazówki poniżej i przygotuj dokumenty do ZUS.');
  if(d.insurance!=='yes')issues.push(d.insurance==='no'?'Pierwszy rodzic wskazał brak ubezpieczenia. ZUS musi sprawdzić wyjątki i ewentualne uprawnienie po ustaniu ubezpieczenia.':'Potwierdź ubezpieczenie pierwszego rodzica na dzień powstania prawa do zasiłku.');
  const maximum=parental-rules.reservedWeeks;
  if(d.shareA>maximum)issues.push(`Pierwszy rodzic może w tym wariancie wykorzystać najwyżej ${maximum} tygodni rodzicielskich. ${rules.reservedWeeks} tygodni jest zastrzeżone dla drugiego rodzica.`);
  const shareB=d.insuranceB==='yes'?parental-d.shareA:0;
  if(shareB>maximum)issues.push(`Drugi rodzic może wykorzystać najwyżej ${maximum} tygodni. Zwiększ udział pierwszego rodzica.`);
  if(d.rate==='combined') {
    const event=parseDate(d.eventDate),application=parseDate(d.applicationDate);
    if(!event||!application)issues.push('Dla stawki 81,5% wpisz datę porodu/przyjęcia i złożenia wniosku.');
    else if(daysBetween(event,application)>21||application<event)issues.push('Wybrany wniosek jest poza przedziałem 0–21 dni. Wybierz wariant 100% i 70% albo sprawdź sytuację z płatnikiem.');
  }
  if(d.workA==='business'&&d.debt!=='clear')issues.push('Przy działalności najpierw wyjaśnij zadłużenie składkowe z ZUS. Może wpływać na wypłatę.');
  const end=parseDate(d.coverageEnd),event=parseDate(d.eventDate);
  if(end&&(!event||end<event))issues.push('Wskazano koniec ubezpieczenia przed zdarzeniem lub bez daty zdarzenia. Potrzebne jest sprawdzenie przedłużenia umowy lub wyjątku w ZUS.');
  if(d.kind==='birth'&&event) {
    const limit=new Date(event.getFullYear()+6,11,31);
    if(today()>limit)issues.push('Upłynął koniec roku, w którym dziecko skończyło 6 lat. Sprawdź uprawnienia z płatnikiem.');
  }
  if(issues.length)return {issues,maternity,parental};
  const maternityRate=d.rate==='combined'?rules.combinedRate:rules.maternityRate;
  const parentalRate=d.rate==='combined'?rules.combinedRate:rules.parentalRate;
  const segment=(label,weeks,base,rate,fraction)=> {
    const days=Math.floor(weeks*7/(1-fraction)+1e-8);
    const daily=Math.round(base/30*rate/100*(1-fraction)*100)/100;
    return {label,days,daily,total:Math.round(days*daily*100)/100,rate,fraction};
  };
  const segments=[segment('Pierwszy rodzic · okres macierzyński',maternity,d.baseA,maternityRate,0)];
  if(d.shareA)segments.push(segment('Pierwszy rodzic · rodzicielski',d.shareA,d.baseA,parentalRate,d.fractionA));
  if(shareB) {
    segments.push(segment('Drugi rodzic · własne 9 tygodni',rules.reservedWeeks,d.baseB,rules.parentalRate,d.fractionB));
    if(shareB>rules.reservedWeeks)segments.push(segment('Drugi rodzic · pozostały rodzicielski',shareB-rules.reservedWeeks,d.baseB,parentalRate,d.fractionB));
  }
  return {issues:[],maternity,parental,shareB,unused:parental-d.shareA-shareB,segments,
    total:segments.reduce((sum,s)=>sum+s.total,0),
    ageLimit,custom:JSON.stringify(rules)!==JSON.stringify(ZUS_DEFAULT_RULES)};
}
function zusResult(d) {
  const result=zusCalculation(d);
  const payer=d.payer==='employer'?'pracodawcy uprawnionego do wypłaty zasiłków':d.payer==='zus'?'ZUS':'płatnika po potwierdzeniu w kadrach';
  if(result.issues.length)return `<div class="zus-result"><h2 tabindex="-1">Co trzeba jeszcze ustalić?</h2><ul>${result.issues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul><p>Uzupełnij dane i przelicz ponownie. ${zusSource('insurance','Warunki ubezpieczenia i wyjątki w ZUS')}</p><a class="dashboard-link" href="#uprawnienia">Świadczenia i szczególne sytuacje ${icon('arrow',16)}</a></div>`;
  return `<div class="zus-result"><p class="home-kicker">Symulacja ${result.custom?'· zmienione parametry testowe':'· zasady sprawdzone 21.11.2026'}</p>
    <h2 tabindex="-1">Wasz wariant opieki</h2><p>${result.maternity} tyg. macierzyńskiego · pula rodzicielska ${result.parental} tyg.</p>
    <div class="zus-total"><strong>${zusMoney(result.total)}</strong><span>Orientacyjna suma brutto zasiłków w poniższym wariancie</span></div>
    <div class="zus-segments">${result.segments.map(s=>`<section><h3>${s.label}</h3><p>${s.days} dni · ${s.rate}% podstawy${s.fraction?' · praca '+s.fraction+' etatu':''}</p><strong>${zusMoney(s.daily)} / dzień</strong><span>Razem ${zusMoney(s.total)}</span></section>`).join('')}</div>
    ${result.unused?`<p class="zus-notice">${result.unused} tygodni pozostaje niewykorzystanych. Nieprzenoszalna część drugiego rodzica wymaga jego własnego uprawnienia.</p>`:''}
    <details class="zus-explain"><summary>Założenia i sposób liczenia</summary><p>Podstawa to kwota ustalona po odliczeniu składek, przed podatkiem. Stawka dzienna = podstawa / 30 × procent zasiłku, z zaokrągleniem do grosza. Kwota miesięczna zależy od liczby dni kalendarzowych. Symulacja nie obejmuje PIT ani podwyższenia do świadczenia rodzicielskiego.</p><p>Pierwszy rodzic korzysta z całego okresu macierzyńskiego. Rodzicielskie można wykorzystać kolejno lub równolegle. Kwoty nie obejmują wynagrodzenia za pracę ani osobnego urlopu ojcowskiego. Stawka 81,5% zakłada wykorzystanie co najmniej jednego dnia rodzicielskiego w pierwszym roku.</p><p>Praca u pracodawcy udzielającego urlopu trwa w stałym wymiarze przez cały wybrany okres rodzicielski i jego wydłużenie. Dni = pełnowymiarowe dni / (1 − etat), z pominięciem części dnia. Zasiłek maleje proporcjonalnie. Zmienne okresy pracy, przejęcie macierzyńskiego i skrócenie z powodu wieku wymagają odrębnego wyliczenia.</p>${result.ageLimit?`<p>Graniczny wiek dziecka przypada ${fmt(result.ageLimit)}. Zaplanuj wykorzystanie urlopu z uwzględnieniem właściwych terminów.</p>`:''}</details>
    <h3>Dokumenty i następny krok</h3><p>Skieruj dokumenty do ${payer}. Przy zatrudnieniu u płatnika zgłaszającego ponad 20 osób do ubezpieczenia chorobowego wypłata zwykle należy do płatnika. Stan ustala się co do zasady na 30 listopada poprzedniego roku.</p>
    <ul><li>Przygotuj aktualny ZAM oraz dokumenty potwierdzające poród lub przyjęcie na wychowanie.</li><li>Pracownik uzgadnia urlop z pracodawcą. Do wypłaty przez ZUS potrzebne może być Z-3, a przy zleceniu Z-3a od płatnika.</li><li>Wniosek o urlop rodzicielski pracownika składa się co najmniej 21 dni przed rozpoczęciem. Wybór stawki 81,5% ma odrębny termin.</li></ul>
    <div class="source-box">${zusSource('amount','Stawki zasiłku')}${zusSource('duration','Wymiar i limity wieku')}${zusSource('parental','Podział i łączenie z pracą')}${zusSource('documents','Aktualne dokumenty')}</div>
    <div class="case-actions"><a class="button primary" href="#konto-demo/wniosek">Przygotuj wniosek pokazowy ${icon('arrow',16)}</a><button class="button secondary" type="button" data-zus-action="print">Drukuj wynik / PDF</button></div></div>`;
}
function calculatorPage(r) {
  const d=zusDraft||zusInitial();
  const insurance={unknown:'Do sprawdzenia',yes:'Tak, potwierdzone',no:'Brak ubezpieczenia'};
  return backLink(r)+pageHeading('Zasiłki i urlopy','Zaplanujcie opiekę','Porównaj podział urlopu, okres wypłaty i kwoty dla obojga rodziców.')+
    `<div class="zus-page"><p class="zus-notice">Wynik jest orientacyjną symulacją. O prawie i wysokości świadczenia rozstrzyga ZUS lub uprawniony płatnik po sprawdzeniu dokumentów.</p>
    <div class="zus-demo-choices"><span>Przykłady autorskie</span><button class="filter" data-zus-case="employee">Dwoje rodziców</button><button class="filter" data-zus-case="half">Powrót na pół etatu</button><button class="filter" data-zus-case="uninsured">Brak ubezpieczenia</button><a class="filter" href="#konto-demo">Dane pokazowe ZUS</a></div>
    <form id="zus-calculator"><fieldset class="zus-fields"><legend>Dziecko i zdarzenie</legend>
    ${zusSelect('Wasza sytuacja','kind',{birth:'Urodzenie dziecka',adoption:'Przyjęcie w celu adopcji',foster:'Niezawodowa rodzina zastępcza'},d.kind)}
    ${zusSelect('Dzieci urodzone / przyjęte jednocześnie','count',{'1':'Jedno','2':'Dwoje','3':'Troje','4':'Czworo','5':'Pięcioro lub więcej'},String(d.count))}
    ${zusField('Data porodu lub przyjęcia','eventDate',d.eventDate,'type="date"')}
    ${zusField('Data urodzenia przyjmowanego dziecka','childDob',d.childDob,'type="date"')}
    ${zusCheck('Zaświadczenie „Za życiem”','special',d.special)}
    ${zusCheck('Odroczony obowiązek szkolny (piecza zastępcza)','deferred',d.deferred)}
    ${zusSelect('Szczególne okoliczności','exception',{none:'Standardowa sytuacja',hospital:'Wcześniactwo / hospitalizacja',loss:'Utrata dziecka',transfer:'Choroba lub śmierć matki / przejęcie opieki'},d.exception)}</fieldset>
    <fieldset class="zus-fields"><legend>Ubezpieczenie i podstawa</legend>
    ${zusSelect('Ubezpieczenie pierwszego rodzica w dniu zdarzenia','insurance',insurance,d.insurance)}
    ${zusSelect('Ubezpieczenie drugiego rodzica','insuranceB',insurance,d.insuranceB)}
    ${zusSelect('Praca pierwszego rodzica','workA',GUIDE.work,d.workA)}
    ${zusSelect('Praca drugiego rodzica','workB',GUIDE.work,d.workB)}
    ${zusField('Podstawa pierwszego rodzica (zł)','baseA',d.baseA,'type="number" min="0" max="1000000" step="0.01" required')}
    ${zusField('Podstawa drugiego rodzica (zł)','baseB',d.baseB,'type="number" min="0" max="1000000" step="0.01" required')}
    <p class="zus-field-note">Wpisz podstawę z dokumentów płatnika. Na etacie zwykle wynika z 12 miesięcy wynagrodzenia po odliczeniu składek społecznych. Wahania składników, krótsze ubezpieczenie i działalność wymagają odrębnego ustalenia. ${zusSource('base','Jak ustala się podstawę')}</p>
    ${zusField('Koniec ubezpieczenia, jeśli znany','coverageEnd',d.coverageEnd,'type="date"')}
    ${zusSelect('Zadłużenie przy własnej działalności','debt',{unknown:'Do sprawdzenia',clear:'Potwierdzono brak przeszkody do wypłaty',debt:'Zadłużenie wymaga wyjaśnienia'},d.debt)}</fieldset>
    <fieldset class="zus-fields"><legend>Podział opieki</legend>
    ${zusField('Tygodnie rodzicielskiego pierwszego rodzica','shareA',d.shareA,'type="number" min="0" max="58" step="1" required')}
    ${zusSelect('Wariant wypłaty','rate',{standard:'100% macierzyński + 70% rodzicielski',combined:'81,5% po wniosku w terminie'},d.rate)}
    ${zusField('Data wniosku o stawkę 81,5%','applicationDate',d.applicationDate,'type="date"')}
    ${zusSelect('Kto wypłaca zasiłek','payer',{unknown:'Potwierdzę w kadrach',employer:'Uprawniony pracodawca',zus:'ZUS'},d.payer)}
    ${zusSelect('Praca pierwszego rodzica podczas rodzicielskiego','fractionA',{'0':'Bez łączenia z pracą','0.25':'1/4 etatu przez cały okres','0.5':'1/2 etatu przez cały okres'},String(d.fractionA))}
    ${zusSelect('Praca drugiego rodzica podczas rodzicielskiego','fractionB',{'0':'Bez łączenia z pracą','0.25':'1/4 etatu przez cały okres','0.5':'1/2 etatu przez cały okres'},String(d.fractionB))}</fieldset>
    <button class="button primary" type="submit">Oblicz nasz wariant ${icon('arrow',16)}</button></form>
    <div id="zus-result" aria-live="polite"></div><a class="dashboard-link" href="#uprawnienia">Świadczenia w ciąży i trudniejsze sytuacje ${icon('right',16)}</a>
    <details class="zus-explain"><summary>Dokument z zestawu testowego</summary><p>Możesz otworzyć PDF i przepisać potwierdzone dane do kalkulatora. Dokument jest wyświetlany lokalnie. Dane nie są automatycznie odczytywane z pliku.</p><label class="field">Otwórz PDF<input id="zus-document" type="file" accept="application/pdf,.pdf"></label><div id="zus-document-view"></div></details>
    <a class="dashboard-link" href="#parametry">Parametry kalkulatora — panel demonstracyjny ${icon('right',16)}</a></div>`;
}
function zusDemoPage(r) {
  const request=r.id==='wniosek';
  return backLink(r)+pageHeading('Środowisko pokazowe',request?'Przećwicz wniosek':'Dane i e-usługi ZUS','W tym miejscu korzystasz z fikcyjnych danych i lokalnej symulacji usług.')+
    `<div class="zus-page"><div class="zus-demo-choices"><a class="filter" href="#konto-demo">Dane pokazowe</a><a class="filter" href="#konto-demo/wniosek">Wniosek pokazowy</a><a class="filter" href="#kalkulator">Kalkulator</a></div>
    ${request?`<form id="zus-demo-request"><div class="zus-fields">
      ${zusSelect('Rodzaj dokumentu','document',{parental:'Wniosek o urlop rodzicielski',maternity:'Dane do wniosku ZAM',civil:'Wniosek o odpis aktu urodzenia'},'parental')}
      ${zusSelect('Odbiorca','recipient',{employer:'Pracodawca',zus:'ZUS',usc:'Urząd stanu cywilnego'},'employer')}
      ${zusField('Od dnia','from','','type="date" required')}
      ${zusField('Do dnia','until','','type="date" required')}
      <label class="field">Treść prośby<textarea name="message" rows="4" maxlength="2000" required>Proszę o udzielenie urlopu rodzicielskiego we wskazanym okresie.</textarea></label></div>
      <button class="button primary" type="submit">Sprawdź i przygotuj podgląd</button></form><div id="zus-request-preview" aria-live="polite"></div>`:
      `<button class="button primary" data-zus-action="login">mObywatel · uruchom symulację</button>
      <div id="zus-demo-data">${zusDemo?zusDemoData():''}</div>
      <div class="zus-notice"><strong>Możesz użyć własnych danych</strong><p>Przejdź do kalkulatora i wpisz je samodzielnie. W aplikacji pokazowej dane z ZUS służą do demonstracji.</p><a class="dashboard-link" href="#kalkulator">Wpisz dane ręcznie ${icon('arrow',16)}</a></div>`}
      <p class="zus-field-note">Symulacja obejmuje tożsamość, dane ZUS, e-ZLA i przygotowanie dokumentu. Wynik nie oznacza złożenia wniosku w urzędzie.</p></div>`;
}
function zusDemoData() {
  return `<div class="zus-result"><h2>Dane fikcyjnej osoby</h2><dl class="zus-facts"><dt>Ubezpieczenie chorobowe</dt><dd>Umowa o pracę · potwierdzone w przykładzie</dd><dt>Podstawa miesięczna</dt><dd>5 000 zł</dd><dt>Zadłużenie</dt><dd>0 zł · pokazowy stan na 21.11.2026</dd><dt>e-ZLA</dt><dd>01–14.11.2026 · kod B · przykład</dd></dl>
    <button class="button primary" data-zus-case="employee">Użyj danych w kalkulatorze</button>
    <details class="zus-explain"><summary>Zapytanie do eZUS — symulacja</summary><label class="field">Treść zapytania<textarea id="zus-question" rows="3" maxlength="1200" placeholder="Np. jakie dokumenty powinien przekazać mój płatnik?"></textarea></label><button class="button secondary" data-zus-action="question">Zapisz w pokazowej skrzynce</button><p id="zus-question-status" role="status"></p></details></div>`;
}
function zusParametersPage(r) {
  return backLink(r)+pageHeading('Panel demonstracyjny','Parametry zasiłków','Zmiany służą testowaniu reguł w tej sesji przeglądarki.')+
    `<div class="zus-page"><form id="zus-parameters"><div class="zus-fields">
    ${zusField('Macierzyński (%)','maternityRate',zusRules.maternityRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Rodzicielski (%)','parentalRate',zusRules.parentalRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Wariant uśredniony (%)','combinedRate',zusRules.combinedRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Rodzicielski dla jednego dziecka (tyg.)','parentalSingle',zusRules.parentalWeeks[0],'type="number" min="18" max="100" step="1" required')}
    ${zusField('Rodzicielski dla wieloraczków (tyg.)','parentalMultiple',zusRules.parentalWeeks[1],'type="number" min="18" max="100" step="1" required')}</div>
    <div class="case-actions"><button class="button primary" type="submit">Zastosuj w symulacji</button><button class="button secondary" data-zus-action="rules-reset" type="button">Przywróć sprawdzone wartości</button></div><p id="zus-parameters-status" role="status"></p></form>
    <p class="zus-field-note">W produkcji zarządzanie regułami wymaga uprawnień administratora, dat obowiązywania i zatwierdzenia merytorycznego. Aktualna wersja reguł ${ZUS_DEFAULT_RULES.version}.</p><a class="dashboard-link" href="#kalkulator">Przetestuj kalkulator ${icon('right',16)}</a></div>`;
}
function zusGuidePage(r) {
  return backLink(r)+pageHeading('Uprawnienia i pomoc','Co warto sprawdzić wcześniej','Informacje zweryfikowane w źródłach ZUS 21 listopada 2026 r.')+
    `<div class="zus-page zus-guide-list">
    <article><h2>Chorobowe w ciąży</h2><p>Przy niezdolności do pracy potwierdzonej przez lekarza świadczenie w ciąży wynosi 100% podstawy, a okres zasiłkowy może trwać do 270 dni. Ubezpieczenie obowiązkowe zwykle wymaga 30 dni wyczekiwania, dobrowolne 90 dni. Istnieją wyjątki i zasady wliczania poprzedniego ubezpieczenia.</p><p>e-ZLA trafia elektronicznie do ZUS i płatnika. Pracownica informuje pracodawcę o nieobecności. Gdy wypłaca ZUS, płatnik przekazuje właściwe zaświadczenie Z-3 lub Z-3a. Osoba prowadząca firmę składa wniosek ZAS-53. Kod B lub zaświadczenie o ciąży pozwala zastosować właściwą stawkę.</p><div class="source-box">${zusSource('sick','Warunki, dokumenty i terminy ZUS')}</div></article>
    <article><h2>Świadczenie rehabilitacyjne</h2><p>Po wyczerpaniu zasiłku chorobowego można je otrzymać, jeżeli nadal nie można pracować, a dalsze leczenie lub rehabilitacja rokują odzyskanie zdolności do pracy. Ocenę przeprowadza ZUS. Świadczenie trwa maksymalnie 12 miesięcy i w ciąży wynosi 100% podstawy.</p><p>Przygotuj wniosek ZNp-7, zaświadczenie o stanie zdrowia OL-9 i dokumenty wymagane dla Twojej sytuacji. ZUS zaleca złożenie dokumentów co najmniej 6 tygodni przed końcem okresu zasiłkowego.</p><div class="source-box">${zusSource('rehabilitation','Świadczenie rehabilitacyjne w ZUS')}</div></article>
    <article><h2>Zakończenie pracy w ciąży</h2><p>Gdy ubezpieczenie kończy się przed porodem, zbierz datę i podstawę rozwiązania umowy. Niektóre umowy terminowe przedłużają się do porodu. Śmierć pracodawcy, jego upadłość lub likwidacja mogą dawać szczególne uprawnienia.</p><p>Po utracie zatrudnienia z powodu śmierci, likwidacji lub upadłości pracodawcy, bez zapewnienia innej pracy, możliwy jest zasiłek w wysokości macierzyńskiego do dnia poprzedzającego poród. Za okres po porodzie sprawdza się odrębne warunki. Przygotuj świadectwo pracy i dokumenty potwierdzające okoliczności.</p><div class="source-box">${zusSource('insurance','Wyjątki po ustaniu ubezpieczenia')}${zusSource('documents','Wymagane dowody')}${zusSource('work','Ochrona zatrudnienia — PIP')}</div></article>
    <article><h2>Wcześniactwo, hospitalizacja i utrata dziecka</h2><p>Wcześniactwo lub pobyt noworodka w szpitalu mogą dawać prawo do uzupełniającego urlopu macierzyńskiego. Wymiar zależy od tygodnia ciąży, masy urodzeniowej i czasu hospitalizacji. Przygotuj zaświadczenie szpitala i ustal termin wniosku z płatnikiem.</p><p>Po utracie ciąży lub dziecka zapytaj ZUS o dokumenty potwierdzające zdarzenie i właściwy skrócony okres świadczenia. Choroba, hospitalizacja albo śmierć matki mogą pozwalać drugiemu uprawnionemu opiekunowi przejąć opiekę i zasiłek. Takie przypadki wymagają indywidualnej oceny dokumentów.</p><div class="source-box">${zusSource('duration','ZUS — okresy i sytuacje szczególne')}${zusSource('documents','Dokumenty do zasiłku')}</div></article>
    <article><h2>Co może zmienić prawo lub kwotę?</h2><ul><li>Brak zgłoszenia do chorobowego lub zakończenie ubezpieczenia przed porodem.</li><li>Zadłużenie składkowe przy prowadzeniu działalności — sprawdź stan na właściwy dzień.</li><li>Zmiana etatu, przerwy w ubezpieczeniu i nieregularne składniki wynagrodzenia.</li><li>Umowa wykonywana pozornie albo nieuzasadnione podniesienie podstawy mogą podlegać weryfikacji ZUS.</li><li>Wniosek o stawkę 81,5% ma termin 21 dni. Jeżeli nie wykorzystano choć jednego dnia rodzicielskiego w pierwszym roku, zastosowanie mają odrębne zasady stawki i wyrównania.</li></ul><div class="source-box">${zusSource('amount','Wysokość i wyrównanie')}${zusSource('insurance','Warunki prawa do zasiłku')}</div></article>
    <article><h2>Aktualne formularze</h2><p>Od 24 października 2026 r. ZAM obejmuje również okresy wcześniej obsługiwane przez ZUR i ZAO. Z-3b co do zasady przestał być wymagany. ZUS czasowo udostępnił go 20 listopada w roli Płatnik dla pełnomocników z ograniczonym dostępem do usług eZUS. Dobierz formularz do aktualnej instrukcji i roli użytkownika.</p><div class="source-box">${zusSource('forms','Wzory formularzy ZUS')}${zusSource('documents','Instrukcja składania dokumentów')}</div></article>
    <article><h2>Wsparcie organizacji społecznych</h2><p>Po utracie ciąży możesz skorzystać z informacji Fundacji Ronić po Ludzku. Rodzicom wcześniaków pomaga Fundacja Wcześniak Rodzice-Rodzicom. Informacje o prawach okołoporodowych udostępnia Fundacja Rodzić po Ludzku. Zakres dostępnej pomocy i kontakt sprawdzisz bezpośrednio w organizacji.</p><div class="source-box"><a href="https://ronicpoludzku.com/" target="_blank" rel="noopener noreferrer">Ronić po Ludzku</a><a href="https://wczesniak.pl/tak-pomagamy/" target="_blank" rel="noopener noreferrer">Wcześniak Rodzice-Rodzicom</a><a href="https://rodzicpoludzku.pl/o-nas/kontakt/" target="_blank" rel="noopener noreferrer">Rodzić po Ludzku</a></div><a class="dashboard-link" href="#wsparcie">Przygotuj własną Kartę wsparcia dla bliskiej osoby ${icon('arrow',16)}</a></article></div>`;
}
document.addEventListener('click',event=>{
  const sample=event.target.closest('[data-zus-case]');
  if(sample) {
    zusDraft={...zusInitial(),insurance:'yes',insuranceB:'yes',workA:'employee',workB:'employee',eventDate:'2026-11-01',childDob:'2026-11-01',debt:'clear',payer:'employer'};
    if(sample.dataset.zusCase==='half')zusDraft.fractionA=.5;
    if(sample.dataset.zusCase==='uninsured')zusDraft.insurance='no';
    if(location.hash==='#kalkulator')render(true);else location.hash='kalkulator';
    return;
  }
  const action=event.target.closest('[data-zus-action]')?.dataset.zusAction;
  if(action==='login'){zusDemo='synthetic';document.querySelector('#zus-demo-data').innerHTML=zusDemoData();}
  if(action==='question') {
    const text=document.querySelector('#zus-question').value.trim();
    document.querySelector('#zus-question-status').textContent=text?'Wiadomość zapisana w pokazowej skrzynce tej sesji. To symulacja.':'Najpierw wpisz pytanie.';
  }
  if(action==='rules-reset'){zusRules=structuredClone(ZUS_DEFAULT_RULES);render(true);}
  if(action==='print') {
    document.body.classList.add('printing-zus');
    window.print();
    document.body.classList.remove('printing-zus');
  }
  if(action==='request-send')document.querySelector('#zus-request-status').textContent='Symulacja zakończona. Dokument został oznaczony jako przekazany w pokazowym obiegu.';
});
document.addEventListener('submit',event=>{
  const form=event.target;
  if(form.id==='zus-calculator') {
    event.preventDefault();if(!form.reportValidity())return;
    zusDraft=zusRead(form);
    const result=document.querySelector('#zus-result');result.innerHTML=zusResult(zusDraft);
    result.querySelector('h2').focus();result.scrollIntoView({behavior:'auto',block:'start'});
  }
  if(form.id==='zus-parameters') {
    event.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form);
    for(const key of ['maternityRate','parentalRate','combinedRate'])zusRules[key]=Number(d.get(key));
    zusRules.parentalWeeks=[Number(d.get('parentalSingle')),Number(d.get('parentalMultiple'))];
    document.querySelector('#zus-parameters-status').textContent='Zastosowano parametry testowe w tej sesji.';
  }
  if(form.id==='zus-demo-request') {
    event.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form),civil=d.get('document')==='civil',from=parseDate(d.get('from')),until=parseDate(d.get('until'));
    const target=document.querySelector('#zus-request-preview');
    if(!civil&&(!from||!until||from>until)){target.textContent='Data końcowa musi przypadać tego samego dnia lub później.';return;}
    const documentLabel=form.elements.document.selectedOptions[0].text;
    target.innerHTML=`<div class="zus-result"><h2>Podgląd dokumentu pokazowego</h2><p><strong>${esc(documentLabel)}</strong></p><p>Odbiorca · ${esc(form.elements.recipient.selectedOptions[0].text)}</p>${civil?'':`<p>Okres ${fmt(from)} – ${fmt(until)}</p>`}<p class="zus-request-message">${esc(d.get('message'))}</p><button class="button primary" type="button" data-zus-action="request-send">Zasymuluj przekazanie</button><p id="zus-request-status" role="status"></p></div>`;
  }
});
document.addEventListener('change',event=>{
  if(event.target.form?.id==='zus-demo-request'&&event.target.name==='document') {
    const form=event.target.form,civil=event.target.value==='civil';
    form.elements.recipient.value=civil?'usc':event.target.value==='maternity'?'zus':'employer';
    for(const key of ['from','until']){form.elements[key].disabled=civil;form.elements[key].closest('label').hidden=civil;}
    form.elements.message.value=civil?'Proszę o wydanie skróconego odpisu aktu urodzenia dziecka.':event.target.value==='maternity'?'Proszę o ustalenie prawa i wypłatę zasiłku macierzyńskiego we wskazanym okresie.':'Proszę o udzielenie urlopu rodzicielskiego we wskazanym okresie.';
  }
  if(event.target.id!=='zus-document')return;
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl='';
  const file=event.target.files[0],target=document.querySelector('#zus-document-view');
  if(!file){target.innerHTML='';return;}
  if(file.type!=='application/pdf'||file.size>20*1024*1024){target.textContent='Wybierz PDF do 20 MB.';return;}
  zusDocumentUrl=URL.createObjectURL(file);
  target.innerHTML=`<p>${esc(file.name)}</p><a class="button secondary" href="${zusDocumentUrl}" target="_blank" rel="noopener">Otwórz lokalny dokument</a><iframe title="Podgląd dokumentu w przeglądarce" src="${zusDocumentUrl}"></iframe>`;
});
window.addEventListener('hashchange',()=>{
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl='';
});
