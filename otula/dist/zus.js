'use strict';

// Rules are versioned independently from the interface. Values edited in the demo
// are stored on this device and are visibly labelled as simulation parameters.
const ZUS_DEFAULT_RULES = Object.freeze({
  version: '2026-11-21',
  maternityWeeks: [20,31,33,35,37],
  parentalWeeks: [41,43],
  specialParentalWeeks: [65,67],
  reservedWeeks: 9,
  maternityRate: 100,
  parentalRate: 70,
  combinedRate: 81.5,
  adoptionMinWeeks: 9,olderChildParentalWeeks:38,olderChildSpecialParentalWeeks:62,
  minimumYear:2026,minimumWage:4806,contributionRate:13.71,parentalBenefitAmount:1000,debtThresholdPercent:1,
  validFrom:'2026-01-01',validTo:'2026-12-31'
});
const ZUS_RULES_KEY='otula-zus-rules-v2';
function zusValidateRules(r) {
  const issues=[];
  for(const key of ['maternityRate','parentalRate','combinedRate'])if(!Number.isFinite(r[key])||r[key]<=0||r[key]>100)issues.push('Stawki muszą być większe od 0 i nie większe od 100%.');
  if(!(r.parentalRate<=r.combinedRate&&r.combinedRate<=r.maternityRate))issues.push('Zachowaj kolejność: rodzicielski ≤ uśredniony ≤ macierzyński.');
  for(const [key,length] of [['maternityWeeks',5],['parentalWeeks',2],['specialParentalWeeks',2]]){
    const values=r[key];if(!Array.isArray(values)||values.length!==length||values.some((v,i)=>!Number.isInteger(v)||v<1||v>150||(i>0&&v<values[i-1])))issues.push('Wymiary muszą być pełnymi tygodniami w rosnącej kolejności.');
  }
  if(!Number.isInteger(r.reservedWeeks)||r.reservedWeeks<1||[...(r.parentalWeeks||[]),...(r.specialParentalWeeks||[]),r.olderChildParentalWeeks,r.olderChildSpecialParentalWeeks].some(v=>v<2*r.reservedWeeks))issues.push('Każda pula musi pomieścić części nieprzenoszalne obojga rodziców.');
  if(r.specialParentalWeeks?.some((v,i)=>v<r.parentalWeeks?.[i])||r.olderChildSpecialParentalWeeks<r.olderChildParentalWeeks)issues.push('Pula Za życiem nie może być mniejsza od standardowej.');
  for(const key of ['adoptionMinWeeks','olderChildParentalWeeks','olderChildSpecialParentalWeeks'])if(!Number.isInteger(r[key])||r[key]<1||r[key]>150)issues.push('Wymiary przy przyjęciu dziecka muszą być dodatnimi pełnymi tygodniami.');
  if(r.adoptionMinWeeks>r.maternityWeeks?.[0])issues.push('Minimalny wymiar przyjęcia nie może przekraczać standardowego macierzyńskiego.');
  if(!Number.isInteger(r.minimumYear)||r.minimumYear<2020||r.minimumYear>2100||!Number.isFinite(r.minimumWage)||r.minimumWage<=0||r.minimumWage>100000)issues.push('Sprawdź rok i wysokość minimalnego wynagrodzenia.');
  if(!Number.isFinite(r.contributionRate)||r.contributionRate<0||r.contributionRate>=100||!Number.isFinite(r.parentalBenefitAmount)||r.parentalBenefitAmount<=0||!Number.isFinite(r.debtThresholdPercent)||r.debtThresholdPercent<0||r.debtThresholdPercent>100)issues.push('Sprawdź składki, świadczenie rodzicielskie i próg zadłużenia.');
  if(r.validFrom!==`${r.minimumYear}-01-01`||r.validTo!==`${r.minimumYear}-12-31`)issues.push('Przedział minimalnego wynagrodzenia musi odpowiadać wybranemu rokowi. Nie jest datą wygaśnięcia przepisów o urlopach.');
  return [...new Set(issues)];
}
function zusLoadRules() {
  try{const saved=JSON.parse(localStorage.getItem(ZUS_RULES_KEY)||'null');if(saved?.schema===2){
    // Older copies used these dates as descriptive metadata. Preserve edited amounts when migrating them to the wage year.
    const rules={...saved.rules,validFrom:`${saved.rules.minimumYear}-01-01`,validTo:`${saved.rules.minimumYear}-12-31`};
    if(!zusValidateRules(rules).length)return rules;
  }}catch{}
  return structuredClone(ZUS_DEFAULT_RULES);
}
function zusSetRules(r,reset=false) {
  const issues=zusValidateRules(r);if(issues.length)return {issues};
  zusRules=structuredClone(r);let persisted=true;
  try{if(reset)localStorage.removeItem(ZUS_RULES_KEY);else localStorage.setItem(ZUS_RULES_KEY,JSON.stringify({schema:2,rules:zusRules}));}catch{persisted=false;}
  return {issues:[],persisted};
}
let zusRules = zusLoadRules();
let zusDraft = null;
let zusDocumentUrl = '';
let zusAutoSubmit = false; // przykład lub sprawa z zestawu: przelicz od razu po otwarciu kalkulatora
const zusDrafts = new Map();
const zusEvidence = new Map();
function zusChildKey() { return state.children[state.active].uid; }
function zusFingerprint() {
  const c=state.children[state.active];
  return JSON.stringify([c.stage,c.date,c.multiple,state.role,state.work]);
}
function zusCurrentDraft() {
  const saved=zusDrafts.get(zusChildKey());
  zusDraft=saved?.fingerprint===zusFingerprint()?structuredClone(saved.value):zusInitial();
  return zusDraft;
}
function zusSaveDraft(value) {
  zusDraft=structuredClone(value);
  zusDrafts.set(zusChildKey(),{fingerprint:zusFingerprint(),value:structuredClone(value)});
}
function zusCurrentEvidence() {
  const key=zusChildKey();
  if(!zusEvidence.has(key))zusEvidence.set(key,{file:null,sample:''});
  return zusEvidence.get(key);
}
function zusResetDrafts() {
  zusDrafts.clear();zusEvidence.clear();zusDraft=null;
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl='';
}
function zusRuleLabel(rules=zusRules) {
  let hash=2166136261;for(const char of JSON.stringify(rules)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return rules.version+(JSON.stringify(rules)===JSON.stringify(ZUS_DEFAULT_RULES)?' · standard':' · parametry własne')+' · '+(hash>>>0).toString(16);
}
function zusSprawaBanner(c) {
  const d=c.zus?.decyzja||'nieustalona';
  return `<div class="zus-rozpoznano" role="status"><div><p class="home-kicker">Rozpoznano sprawę z zestawu ZUS</p><strong>${esc(c.tytul||'Sprawa ZUS')}</strong></div>
    <span class="sprawa-decyzja ${esc(d)}">${d==='odmowa'?'Odmowa ZUS':d==='czesciowo'?'Częściowo':d==='przyznano'?'Przyznano':'Rozstrzygnięcie nieustalone'}</span>
    <div class="case-actions">${c.kalkulator?'<button class="button primary" type="button" data-zus-sprawa="wczytaj">Wczytaj dane do kalkulatora</button>':''}<button class="button secondary" type="button" data-zus-sprawa="porownaj">Porównaj z decyzją ZUS</button></div></div>`;
}
function zusDocumentPanel() {
  const evidence=zusCurrentEvidence();
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl=evidence.file?URL.createObjectURL(evidence.file):'';
  return `<section class="zus-dossier" aria-labelledby="dossier-title"><p class="home-kicker">Teczka sprawy · ${esc(childLabel(state.active))}</p><h2 id="dossier-title">Od dokumentu do planu</h2>
    <ol class="zus-steps"><li>Wybierz przykład lub PDF</li><li>Sprawdź i wpisz dane</li><li>Porównaj wynik</li><li>Zaplanuj dokumenty i pomoc</li></ol>
    <label class="sprawa-drop sprawa-drop-mala">${icon('file',28)}<strong>Wgraj PDF sprawy</strong><span>Sprawę z zestawu ZUS rozpoznamy automatycznie, inną przepiszesz ręcznie</span><span class="button secondary">Wybierz plik</span><input id="zus-document" type="file" accept="application/pdf,.pdf"><small>${icon('lock',14)} Plik zostaje na tym urządzeniu</small></label>
    ${evidence.sprawa?zusSprawaBanner(evidence.sprawa):''}
    <div id="zus-document-view">${evidence.file?`<p>${esc(evidence.file.name)}</p><a class="button secondary" href="${zusDocumentUrl}" target="_blank" rel="noopener">Otwórz lokalny PDF</a><button class="button secondary" type="button" data-zus-action="document-clear">Usuń dokument z teczki</button><iframe title="Podgląd dokumentu w przeglądarce" src="${zusDocumentUrl}"></iframe>`:'<p class="zus-field-note">Nie dodano pliku. Możesz też sprawdzić wariant na danych wpisanych ręcznie.</p>'}</div>
    ${evidence.sample?`<p class="zus-notice">Przykład autorski: ${esc(evidence.sample)}. Fikcyjne dane do demonstracji, nie przypadek udostępniony przez ZUS.</p>`:''}
    <details><summary>Gdzie szukać danych?</summary><ul><li>Ubezpieczenie: tytuł i okres podlegania w dokumentach ZUS/płatnika; samo zatrudnienie nie potwierdza każdego uprawnienia.</li><li>Podstawa: kwota ustalona przez płatnika, nie pensja netto ani dowolna kwota brutto.</li><li>Zdarzenie: data porodu/przyjęcia, liczba dzieci jednocześnie, szczególne okoliczności.</li><li>Podział: uzgodnione okresy obojga rodziców i właściwy wniosek.</li></ul></details>
    <details><summary>Aktualne wzory ZUS — który pasuje do sprawy?</summary><p>Dobierz wzór do celu i płatnika. Nie trzeba składać wszystkich dokumentów z tej listy. Odczyt stron ZUS: 21.11.2026.</p><ul>
      <li>${zusSource('formZam','ZAM — zasiłek macierzyński')}. Nowy wzór obejmuje również okres rodzicielski i ojcowski; zastąpił oddzielne ZUR i ZAO od 24.10.2026.</li>
      <li>${zusSource('formZ3','Z-3 — zaświadczenie płatnika dla pracownika')} i ${zusSource('formZ3a','Z-3a — zaświadczenie płatnika, m.in. przy zleceniu')}. Przygotowuje je płatnik; zapytaj, jakie dane ustalił i co przekaże do ZUS.</li>
      <li>${zusSource('formZ15','Z-15 — zasiłek opiekuńczy')}. Od 24.10.2026 zastępuje Z-15a i Z-15b. To odrębna sprawa od kalkulacji macierzyńskiego.</li>
      <li>${zusSource('formSick','ZAS-53 — zasiłek chorobowy')}. Sprawdź instrukcję dla swojej sytuacji; sam formularz nie potwierdza uprawnienia.</li>
    </ul><p>Wniosek ZAM oraz Z-3, Z-3a i ZAS-53 mają na stronie ZUS datę aktualizacji 24.10.2026. Wzory PDF pobierz z podlinkowanych stron. Do elektronicznego wypełniania ZUS zaleca plik „Wypełnij i wydrukuj” otwarty w Adobe Reader lub Acrobat; podgląd w Otuli służy czytaniu.</p><p>Przy działalności nie zakładaj automatycznie obowiązku Z-3b. ${zusSource('formChanges','Sprawdź zmiany formularzy')} oraz ${zusSource('formProxy','komunikat o czasowym Z-3b dla pełnomocników w eZUS')}.</p></details></section>`;
}

const ZUS_SOURCES = {
  amount: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
  duration: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego',
  parental: 'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
  parentalZus: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-dodatkowego-urlopu-rodzicielskiego',
  documents: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
  insurance: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje',
  base: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru',
  sick: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-chorobowy',
  rehabilitation: 'https://www.zus.pl/swiadczenia/zasilki/swiadczenie-rehabilitacyjne',
  forms: 'https://www.zus.pl/wzory-formularzy/zasilki',
  formZam: 'https://www.zus.pl/-/wniosek-zas-54?redirect=/wzory-formularzy/zasilki/zasilek-macierzynski',
  formZ3: 'https://www.zus.pl/-/zaswiadczenie-zus-z-3?redirect=/wzory-formularzy/zasilki/zasilek-macierzynski',
  formZ3a: 'https://www.zus.pl/-/zaswiadczenie-zus-z-3a',
  formZ15: 'https://www.zus.pl/-/oswiadczenie-zus-z-15?redirect=/wzory-formularzy/zasilki/zasilek-opiekunczy',
  formSick: 'https://www.zus.pl/-/zaswiadczenie-zas-53?redirect=/wzory-formularzy/zasilki/zasilek-chorobowy',
  formChanges: 'https://bip.zus.pl/pl/web/guest/o-zus/aktualnosci/-/asset_publisher/aktualnosci/content/id/14583298?_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_aktualnosci_languageId=pl_PL',
  formProxy: 'https://bip.zus.pl/web/guest/-/tymczasowe-przywr%C3%B3cenie-formularza-z-3b-na-profilu-p%C5%82atnika-w-zwi%C4%85zku-z-ograniczeniami-na-ezus-dla-pe%C5%82nomocnik%C3%B3w?redirect=%2Fweb%2Fguest',
  work: 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo'
  ,supplementary:'https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi3'
  ,calculationCommentary:'https://www.zus.pl/documents/10182/24202/Komentarz%2Bdo%2Bustawy%2Bo%2B%C5%9Bwiadczeniach%2Bpieni%C4%99%C5%BCnych%2Bz%2Bubezpieczenia%2Bspo%C5%82ecznego%2Bw%2Brazie%2Bchoroby%2Bi%2Bmacierzy%C5%84stwa%2B2023.pdf/7a31a278-8c06-cee4-3542-1d5bb8b36ad6'
};
function zusSource(key,label) {
  return `<a href="${ZUS_SOURCES[key]}" target="_blank" rel="noopener noreferrer">${label} ${icon('external',14)}</a>`;
}
function zusMoney(value) {
  return value.toLocaleString('pl-PL',{style:'currency',currency:'PLN'});
}
function zusInitial() {
  const child=state.children[state.active];
  return {kind:'birth',count:child.multiple?0:1,multiple:child.multiple,special:false,insurance:'unknown',insuranceB:'unknown',
    baseA:'',baseB:'',shareA:32,shareB:9,fatherWeeks:32,fractionA:0,fractionB:0,rate:'standard',workPattern:'constant',
    parentalStartA:'',parentalStartB:'',firstYearParental:'unknown',contractFractionA:1,contractFractionB:1,
    gestationWeeks:'',birthWeight:'',hospitalFrom:'',hospitalUntil:'',hospitalExtra:'',hospitalConfirmed:false,
    eventDate:child.stage==='birth'?child.date:'',childDob:child.stage==='birth'?child.date:'',
    deferred:false,payer:state.role==='mama'&&state.work==='business'?'zus':'unknown',payerB:state.role==='tata'&&state.work==='business'?'zus':'unknown',exception:'none',
    workA:state.role==='mama'?state.work:'any',workB:state.role==='tata'?state.work:'any',coverageEnd:'',debt:'unknown',debtB:'unknown',debtAmountA:'',debtAmountB:'',applicationDate:'',reviewInsurance:false,reviewBasis:false,reviewDates:false};
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
  const d=new FormData(form);
  // Preserve the other path's draft; disabled controls cannot block browser validation.
  for(const el of form.elements)if(el.name&&el.disabled&&(el.type!=='checkbox'||el.checked))d.set(el.name,el.value);
  const value=Object.fromEntries(d);
  for(const key of ['count','baseA','baseB','shareA','shareB','fatherWeeks','fractionA','fractionB','contractFractionA','contractFractionB'])value[key]=Number(d.get(key));
  for(const key of ['debtAmountA','debtAmountB'])value[key]=d.get(key)===''?'':Number(d.get(key));
  value.special=d.has('special');value.deferred=d.has('deferred');
  value.hospitalConfirmed=d.has('hospitalConfirmed');
  for(const key of ['reviewInsurance','reviewBasis','reviewDates'])value[key]=d.has(key);
  value.multiple=state.children[state.active].multiple;value.evidenceRequired=true;
  return value;
}
function zusFatherOnly(d) { return d.kind==='birth'&&d.insurance==='no'&&d.insuranceB==='yes'; }
function zusDate(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return null;
  const date=new Date(value+'T12:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?date:null;
}
function zusIso(date) { return date?date.toISOString().slice(0,10):''; }
function zusAddDays(date,days) { if(!date)return null;const next=new Date(date);next.setUTCDate(next.getUTCDate()+days);return next; }
function zusRound(value) { return Math.round((value+Number.EPSILON)*100)/100; }
// ZUS commentary, points 144/147/182: separately round daily basis, rate and reduction.
// Leave extension uses the fraction of full-time work; payment reduction uses the fraction of the person's contract.
function zusDaily(base,rate,workFraction=0,contractFraction=1) {
  const full=zusRound(zusRound(base/30)*rate/100);
  return zusRound(full-zusRound(full*workFraction/contractFraction));
}
function zusParentalDays(originalDays,workFraction=0) {
  const extension=Math.floor(originalDays*workFraction+1e-8);
  return originalDays+Math.floor(extension/(1-workFraction)+1e-8);
}
function zusSupplementary(d) {
  if(d.exception!=='hospital')return {issues:[],weeks:0,days:0};
  const issues=[],birth=zusDate(d.kind==='birth'?d.eventDate:d.childDob),placement=zusDate(d.eventDate);
  if(!birth||!placement)issues.push('Do uzupełniającego potrzebne są rzeczywiste daty urodzenia i porodu/przyjęcia.');
  const ga=Number(d.gestationWeeks),weight=Number(d.birthWeight);
  if(!Number.isInteger(ga)||ga<20||ga>45||!Number.isFinite(weight)||weight<=0||weight>10000)issues.push('Wpisz ukończone tygodnie ciąży i masę urodzeniową w gramach z zaświadczenia szpitala.');
  if(!d.hospitalConfirmed)issues.push('Potwierdź zaświadczenie szpitala oraz wybrane dziecko przy porodzie mnogim.');
  const rows=[[d.hospitalFrom,d.hospitalUntil]];
  for(const line of String(d.hospitalExtra||'').split(/\r?\n/).filter(s=>s.trim())){
    const match=line.trim().match(/^(\d{4}-\d{2}-\d{2})\s*\/\s*(\d{4}-\d{2}-\d{2})$/);
    if(!match)issues.push('Dodatkowy pobyt wpisz jako RRRR-MM-DD / RRRR-MM-DD, jeden pobyt w wierszu.');
    else rows.push([match[1],match[2]]);
  }
  const intervals=[];
  for(const [from,until] of rows){const a=zusDate(from),b=zusDate(until);
    if(!a||!b||a>b||birth&&a<birth)issues.push('Sprawdź daty hospitalizacji: przyjęcie nie może być przed urodzeniem, a wypis przed przyjęciem.');
    else intervals.push([a,b]);
  }
  if(issues.length)return {issues:[...new Set(issues)],weeks:0,days:0};
  if(zusFatherOnly(d))return {issues:['Samodzielny rodzicielski ojca przy nieubezpieczonej matce nie potwierdza prawa do uzupełniającego. Sprawdź je odrębnie z ZUS.'],weeks:0,days:0};
  const cap=ga<28||weight<=1000?15:8,term=ga>=37&&weight>1000;
  // Day of birth is day 0; post-birth windows start on day 1 (term birth: day 5).
  // Admission/discharge days inside the window count once, including readmissions.
  const first=zusAddDays(birth,term?5:1),last=zusAddDays(birth,cap*7);
  intervals.sort((a,b)=>a[0]-b[0]);const merged=[];
  for(const pair of intervals){const prev=merged.at(-1);if(prev&&pair[0]<=zusAddDays(prev[1],1)){if(pair[1]>prev[1])prev[1]=pair[1];}else merged.push([...pair]);}
  const eligibleStart=d.kind==='birth'?first:new Date(Math.max(first,placement));
  const qualifies=!term||merged.some(([a,b])=>{const start=new Date(Math.max(a,eligibleStart));return start<=zusAddDays(birth,28)&&zusAddDays(start,1)<=b;});
  const days=qualifies?merged.reduce((n,[a,b])=>{const start=new Date(Math.max(a,eligibleStart)),end=new Date(Math.min(b,last));return n+(end>=start?Math.round((end-start)/86400000)+1:0);},0):0;
  return {issues:[],weeks:Math.min(cap,Math.ceil(days/7)),days,cap,term,qualifies,windowFrom:zusIso(eligibleStart),windowUntil:zusIso(last)};
}
function zusMinimumBase(rules=zusRules) { return zusRound(rules.minimumWage*(1-rules.contributionRate/100)); }
function zusWages(rules) { return {2025:4666,2026:4806,2027:4950,[rules.minimumYear]:rules.minimumWage}; }
function zusDebtCheck(d,parent,date,rules) {
  if(d['work'+parent]!=='business')return '';
  const status=d[parent==='A'?'debt':'debtB'],amount=d['debtAmount'+parent];
  if(status==='clear'&&(amount===''||amount===undefined))return '';
  if(!['clear','amount'].includes(status))return `Wyjaśnij stan zadłużenia składkowego ${parent==='A'?'pierwszego':'drugiego'} rodzica prowadzącego działalność.`;
  if(!Number.isFinite(amount)||amount<0)return `Rodzic ${parent}: wpisz potwierdzoną kwotę zadłużenia; 0 oznacza brak długu.`;
  const when=zusDate(date),wage=when?zusWages(rules)[when.getUTCFullYear()]:undefined;
  if(wage===undefined)return `Rodzic ${parent}: do progu zadłużenia potrzebna jest data początku prawa i minimum wynagrodzenia z tego roku.`;
  const threshold=zusRound(wage*rules.debtThresholdPercent/100);
  return amount>threshold?`Rodzic ${parent}: zadłużenie ${zusMoney(amount)} przekracza próg ${zusMoney(threshold)} na ${date}. Wyjaśnij z ZUS spłatę, układ ratalny lub odroczenie. Spłata całości w ciągu 6 miesięcy może pozwalać na wypłatę za cały okres; nie zakładamy jej automatycznie.`:'';
}
function zusApplyMinimum(segments,d,rules) {
  const output=[],notices=[];
  // Annual amounts are public, not taken from the competition case files.
  const wages=zusWages(rules);
  for(const s of segments){
    if(d['work'+s.parent]!=='employee'){output.push(s);continue;}
    const fraction=d['contractFraction'+s.parent]??1;
    const start=zusDate(s.from),end=zusDate(s.until),parts=[];
    let cursor=start;
    do{
      const year=cursor?cursor.getUTCFullYear():rules.minimumYear;
      const floor=wages[year]===undefined?null:zusRound(wages[year]*(1-rules.contributionRate/100)*fraction);
      const base=floor===null?s.base:Math.max(s.base,floor);
      if(floor===null)notices.push(`Nie ustalono minimalnej podstawy dla ${year} r.; potwierdź podaną podstawę u płatnika.`);
      if(base>s.base)notices.push(`Rodzic ${s.parent}: podstawę podniesiono z ${zusMoney(s.base)} do minimum ${zusMoney(base)} dla ${year} r. i wymiaru ${fraction} etatu.`);
      const yearEnd=cursor?new Date(Date.UTC(year,11,31,12)):null,last=end&&yearEnd<end?yearEnd:end;
      const days=cursor?Math.round((last-cursor)/86400000)+1:s.days;
      const daily=zusDaily(base,s.rate,s.fraction,s.contractFraction??1);
      parts.push({...s,base,days,daily,total:zusRound(days*daily),from:zusIso(cursor),until:zusIso(last)});
      cursor=last?zusAddDays(last,1):null;
    }while(cursor&&end&&cursor<=end);
    if(parts.every(p=>p.base===parts[0].base))output.push({...s,base:parts[0].base,daily:parts[0].daily,total:zusRound(s.days*parts[0].daily)});
    else output.push(...parts);
  }
  return {segments:output,notices:[...new Set(notices)]};
}
function zusMonthlyTotals(segments) {
  const months=new Map();
  for(const s of segments){let date=zusDate(s.from);if(!date)continue;
    for(let day=0;day<s.days;day++,date=zusAddDays(date,1)){
      const month=zusIso(date).slice(0,7),key=s.parent+'-'+month;
      if(!months.has(key))months.set(key,{parent:s.parent,month,days:new Set(),monthDays:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate(),cents:0});
      const row=months.get(key);row.days.add(zusIso(date));row.cents+=Math.round(s.daily*100);
    }
  }
  return [...months.values()].map(row=>({parent:row.parent,month:row.month,days:row.days.size,monthDays:row.monthDays,gross:row.cents/100}));
}
function zusTopupMonth(row,pit,otherNet,confirmed,rules=zusRules) {
  if(!confirmed||pit===''||otherNet===''||![row.gross,pit,otherNet].every(Number.isFinite)||pit<0||otherNet<0||pit>row.gross||!Number.isInteger(row.days)||row.days<1||row.days>row.monthDays)return {issue:'Potwierdź kompletną zaliczkę PIT i kwoty netto z pozostałych tytułów za ten sam miesiąc; wpisz 0, gdy ich nie ma.'};
  const net=zusRound(row.gross-pit+otherNet);
  const target=row.days===row.monthDays?rules.parentalBenefitAmount:Math.ceil((zusRound(rules.parentalBenefitAmount/row.monthDays)*row.days-1e-8)*10)/10;
  const topup=zusRound(Math.max(0,target-net));
  return {net,target,topup,netWithTopup:zusRound(net+topup)};
}
function zusTopupPanel(result) {
  if(!result.months.length)return '<p class="zus-field-note">Do podwyższenia miesięcznego potrzebne są daty okresów wypłaty.</p>';
  return `<details class="zus-explain"><summary>Sprawdź podwyższenie do świadczenia rodzicielskiego po PIT</summary><p>Porównujemy kwotę po zaliczce PIT z ${zusMoney(zusRules.parentalBenefitAmount)} miesięcznie. Za część miesiąca próg jest proporcjonalny. Podaj rzeczywistą lub potwierdzoną przez płatnika zaliczkę od tej kwoty zasiłku, a także netto z innych tytułów zasiłku macierzyńskiego tej samej osoby. Wynagrodzenia za pracę nie wpisuj. Nie zakładamy automatycznie 12% PIT ani zwolnienia podatkowego.</p><form id="zus-topup">${result.months.map((row,i)=>`<fieldset data-topup-row data-parent="${row.parent}" data-month="${row.month}" data-gross="${row.gross}" data-days="${row.days}" data-month-days="${row.monthDays}"><legend>Rodzic ${row.parent} · ${row.month}</legend><p>${row.days} dni z ${row.monthDays} · brutto ${zusMoney(row.gross)}</p>${zusField('Zaliczka PIT od tej kwoty (zł)','pit-'+i,'','type="number" min="0" step="0.01"')}${zusField('Zasiłek macierzyński z innych tytułów po PIT (zł)','other-'+i,'','type="number" min="0" step="0.01"')}<p data-topup-output></p></fieldset>`).join('')}<label class="multiple-choice"><input type="checkbox" name="confirmed" required>Potwierdzam kompletne kwoty za obliczane miesiące, ze wszystkich tytułów danej osoby; puste pola pozostają nieustalone.</label><button class="button secondary" type="submit">Oblicz podwyższenie po PIT</button><p id="zus-topup-status" role="status"></p></form><p>Podwyższenie jest osobnym wyliczeniem netto. Nie dodajemy go do sumy brutto powyżej. Przy wypłacie wyrównania za wcześniejsze miesiące uzgodnij z płatnikiem miesiąc rozliczenia.</p>${zusSource('amount','Podstawa i zasady podwyższenia ZUS')}</details>`;
}
function zusTimeline(segments,d,maternityDays,ageLimit,supplementaryDays=0) {
  const issues=[],event=zusDate(d.eventDate);
  const fromA=zusDate(d.parentalStartA),fromB=zusDate(d.parentalStartB);
  if(d.parentalStartA&&!fromA)issues.push('Popraw datę rozpoczęcia rodzicielskiego pierwszego rodzica.');
  if(d.parentalStartB&&!fromB)issues.push('Popraw datę rozpoczęcia rodzicielskiego drugiego rodzica.');
  const maternityEnd=zusAddDays(event,maternityDays+supplementaryDays-1);
  let nextA=fromA||zusAddDays(event,maternityDays+supplementaryDays),nextB=fromB;
  for(const s of segments){
    if(s.kind==='maternity')s.from=zusIso(event);
    else if(s.kind==='supplementary')s.from=zusIso(zusAddDays(event,maternityDays));
    else if(s.parent==='A')s.from=zusIso(nextA);
    else {if(!nextB)nextB=nextA||event;s.from=zusIso(nextB);}
    const start=zusDate(s.from),end=zusAddDays(start,s.days-1);s.until=zusIso(end);
    if(s.kind==='parental'){
      if(s.parent==='A')nextA=zusAddDays(end,1);else nextB=zusAddDays(end,1);
      if(start&&event&&start<event)issues.push('Rodzicielskie nie może zacząć się przed porodem lub przyjęciem dziecka.');
      if(s.parent==='A'&&start&&maternityEnd&&start<=maternityEnd)issues.push('Rodzicielskie pierwszego rodzica musi zacząć się po jego okresie macierzyńskim, także uzupełniającym.');
      if(end&&ageLimit&&end>=ageLimit)issues.push('Rodzicielski wychodzi poza granicę wieku przy tej ścieżce przyjęcia. Znaczenie gwarantowanych 38/62 tygodni i terminu ich wykorzystania wymaga potwierdzenia z ZUS. To ograniczenie tej symulacji, a nie odmowa uprawnienia. Możesz osobno policzyć macierzyński, wpisując 0 tygodni rodzicielskiego.');
      if(d.kind==='birth'&&end&&event&&end.getUTCFullYear()>event.getUTCFullYear()+6)issues.push('Rodzicielskie musi zakończyć się najpóźniej z końcem roku 6. urodzin dziecka.');
    }
  }
  return [...new Set(issues)];
}
function zusCalculation(d,rules=zusRules) {
  const issues=[];
  const fatherOnly=zusFatherOnly(d);
  const count=d.count;
  if(d.evidenceRequired && !['reviewInsurance','reviewBasis','reviewDates'].every(key=>d[key]))issues.push('Potwierdź sprawdzenie danych w teczce przed obliczeniem.');
  if(d.multiple && count===1)issues.push('W profilu oznaczono ciążę mnogą. Wybierz liczbę dzieci z jednego porodu albo popraw profil rodziny.');
  if(!Number.isInteger(count)||count<1||count>5)issues.push('Wybierz liczbę dzieci urodzonych lub przyjętych jednocześnie.');
  for(const key of ['A','B']) {
    if(key==='A'&&fatherOnly)continue;
    if(key==='B'&&d.insuranceB==='no')continue;
    if((key==='A'||d.insuranceB==='yes')&&(!Number.isFinite(d['base'+key])||d['base'+key]<=0))issues.push('Wpisz dodatnią podstawę zasiłku dla każdego rodzica objętego wyliczeniem.');
    if(!Number.isFinite(d['fraction'+key])||d['fraction'+key]<0||d['fraction'+key]>.5)issues.push('Wymiar pracy w okresie urlopu musi wynosić od 0 do połowy etatu.');
    if(d['fraction'+key]>0&&d['work'+key]!=='employee')issues.push('Łączenie urlopu z pracą w tym kalkulatorze dotyczy umowy o pracę u pracodawcy udzielającego urlopu.');
    if(d['work'+key]==='employee'&&d['contractFraction'+key]!==undefined&&(!Number.isFinite(d['contractFraction'+key])||d['contractFraction'+key]<=0||d['contractFraction'+key]>1))issues.push('Wymiar zatrudnienia do minimalnej podstawy musi być większy od 0 i nie większy od 1 etatu.');
    if(d['fraction'+key]>0&&d['fraction'+key]>=(d['contractFraction'+key]??1))issues.push('Praca podczas rodzicielskiego musi pozostawiać część Twojego wymiaru zatrudnienia na urlop. Przy umowie na pół etatu wybierz np. pracę na 1/4 pełnego etatu; pracę w całym dotychczasowym wymiarze ustal odrębnie z kadrami.');
  }
  if(!fatherOnly&&(!Number.isInteger(d.shareA)||d.shareA<0))issues.push('Podaj pełną, nieujemną liczbę tygodni rodzicielskich pierwszego rodzica.');
  if(d.workPattern==='variable')issues.push('Zmiany etatu, przerwy lub zakończenie pracy w trakcie urlopu wymagają wyliczenia odcinkami. Ten kalkulator obsługuje wyłącznie stały wymiar przez cały wybrany okres i jego wydłużenie.');
  if(issues.length)return {issues};
  let maternity=fatherOnly?0:rules.maternityWeeks[count-1];
  let parental=(d.special?rules.specialParentalWeeks:rules.parentalWeeks)[count===1?0:1];
  let maternityDays=maternity*7,minimumAdoption=false,ageLimit=null;
  if(d.kind!=='birth') {
    const dob=zusDate(d.childDob),event=zusDate(d.eventDate);
    if(!dob||!event||dob>event)issues.push('Przy przyjęciu na wychowanie potrzebne są poprawne daty urodzenia i przyjęcia dziecka.');
    else {
      ageLimit=new Date(dob);ageLimit.setUTCFullYear(dob.getUTCFullYear()+(d.kind==='adoption'?14:d.deferred?10:7));
      const days=daysBetween(event,ageLimit);
      if(days<=0)issues.push('Dziecko osiągnęło limit wieku dla tej ścieżki. Sprawdź indywidualne uprawnienia z ZUS.');
      else {
        // Art. 183 § 3 guarantees nine weeks even when the birthday is earlier.
        minimumAdoption=days<=rules.adoptionMinWeeks*7;
        maternityDays=Math.max(rules.adoptionMinWeeks*7,Math.min(maternityDays,days));
        maternity=maternityDays/7;
        if(minimumAdoption)parental=d.special?rules.olderChildSpecialParentalWeeks:rules.olderChildParentalWeeks;
      }
    }
  }
  const supplementary=zusSupplementary(d);issues.push(...supplementary.issues);
  if(!['none','hospital'].includes(d.exception))issues.push('Wybrana szczególna sytuacja wymaga indywidualnego ustalenia okresu zasiłku. Otwórz wskazówki poniżej i przygotuj dokumenty do ZUS.');
  if(d.insurance!=='yes'&&!fatherOnly)issues.push(d.insurance==='no'?'Pierwszy rodzic wskazał brak ubezpieczenia. ZUS musi sprawdzić wyjątki i ewentualne uprawnienie po ustaniu ubezpieczenia.':'Potwierdź ubezpieczenie pierwszego rodzica na dzień powstania prawa do zasiłku.');
  if(!['yes','no'].includes(d.insuranceB))issues.push('Potwierdź ubezpieczenie drugiego rodzica. „Do sprawdzenia” nie oznacza braku uprawnienia ani zerowego zasiłku.');
  const maximum=parental-rules.reservedWeeks;
  if(!fatherOnly&&d.shareA>maximum)issues.push(`Pierwszy rodzic może w tym wariancie wykorzystać najwyżej ${maximum} tygodni rodzicielskich. ${rules.reservedWeeks} tygodni jest zastrzeżone dla drugiego rodzica.`);
  const shareA=fatherOnly?0:d.shareA;
  const shareB=fatherOnly?d.fatherWeeks:d.insuranceB==='yes'?(d.shareB??parental-d.shareA):0;
  if(!fatherOnly&&(!Number.isInteger(shareB)||shareB<0))issues.push('Podaj pełną, nieujemną liczbę tygodni rodzicielskich drugiego rodzica.');
  if(shareA+shareB>parental)issues.push(`Suma tygodni obojga rodziców przekracza wspólną pulę ${parental} tygodni.`);
  if(fatherOnly&&(!Number.isInteger(shareB)||shareB<1||shareB>maximum))issues.push(`Wpisz od 1 do ${maximum} pełnych tygodni rodzicielskiego ojca. W tej puli są już jego własne ${rules.reservedWeeks} tygodni; części matki nie można przejąć.`);
  if(!fatherOnly&&shareB>maximum)issues.push(`Drugi rodzic może wykorzystać najwyżej ${maximum} tygodni. Zwiększ udział pierwszego rodzica.`);
  if(fatherOnly&&d.rate==='combined')issues.push('Samodzielny rodzicielski ojca przy nieubezpieczonej matce liczymy według 70%. Wybierz wariant standardowy; przejęcia uprawnień w szczególnych sytuacjach wymagają odrębnego ustalenia.');
  if(d.rate==='combined') {
    const event=parseDate(d.eventDate),application=parseDate(d.applicationDate);
    if(!event||!application)issues.push('Dla stawki 81,5% wpisz datę porodu/przyjęcia i złożenia wniosku.');
    else if(daysBetween(event,application)>21)issues.push('Wniosek o 81,5% trzeba złożyć najpóźniej 21 dni po porodzie lub przyjęciu. Wybierz wariant 100% i 70% albo sprawdź sytuację z płatnikiem.');
    if(d.kind==='birth'&&d.firstYearParental==='unknown')issues.push('Potwierdź, czy choć jeden dzień rodzicielskiego w stawce 81,5% przypada w pierwszym roku życia dziecka. Od tego zależy stawka i wyrównanie.');
  }
  if(!fatherOnly&&d.workA==='business'&&!['clear','amount'].includes(d.debt))issues.push('Przy działalności najpierw potwierdź stan zadłużenia składkowego z ZUS.');
  if(d.insuranceB==='yes'&&d.workB==='business'&&!['clear','amount'].includes(d.debtB))issues.push('Wyjaśnij stan zadłużenia składkowego drugiego rodzica prowadzącego działalność.');
  const end=parseDate(d.coverageEnd),event=parseDate(d.eventDate);
  if(!fatherOnly&&end&&(!event||end<event))issues.push('Wskazano koniec ubezpieczenia przed zdarzeniem lub bez daty zdarzenia. Potrzebne jest sprawdzenie przedłużenia umowy lub wyjątku w ZUS.');
  if(fatherOnly&&!event)issues.push('Wpisz datę urodzenia dziecka, aby sprawdzić granicę wykorzystania rodzicielskiego ojca.');
  if(d.kind==='birth'&&event) {
    const limit=new Date(event.getFullYear()+6,11,31);
    if(today()>limit)issues.push('Upłynął koniec roku, w którym dziecko skończyło 6 lat. Sprawdź uprawnienia z płatnikiem.');
  }
  if(issues.length)return {issues,maternity,parental};
  const firstYearAdjustment=d.rate==='combined'&&d.kind==='birth'&&d.firstYearParental==='no';
  const maternityRate=d.rate==='combined'&&!firstYearAdjustment?rules.combinedRate:rules.maternityRate;
  const parentalRate=d.rate==='combined'&&!firstYearAdjustment?rules.combinedRate:rules.parentalRate;
  const segment=(label,weeks,base,rate,fraction,parent,kind)=> {
    const originalDays=Math.round(weeks*7),days=zusParentalDays(originalDays,fraction),contractFraction=d['contractFraction'+parent]??1;
    const daily=zusDaily(base,rate,fraction,contractFraction);
    return {label,days,daily,total:Math.round(days*daily*100)/100,rate,fraction,contractFraction,parent,kind,base};
  };
  let segments=fatherOnly?[]:[segment('Pierwszy rodzic · okres macierzyński',maternity,d.baseA,maternityRate,0,'A','maternity')];
  if(supplementary.weeks)segments.push(segment('Pierwszy rodzic · uzupełniający macierzyński',supplementary.weeks,d.baseA,rules.maternityRate,0,'A','supplementary'));
  if(shareA)segments.push(segment('Pierwszy rodzic · rodzicielski',shareA,d.baseA,parentalRate,d.fractionA,'A','parental'));
  if(fatherOnly)segments.push(segment('Ojciec · własny rodzicielski',shareB,d.baseB,rules.parentalRate,d.fractionB,'B','parental'));
  else if(shareB) {
    segments.push(segment('Drugi rodzic · część nieprzenoszalna',Math.min(shareB,rules.reservedWeeks),d.baseB,rules.parentalRate,d.fractionB,'B','parental'));
    if(shareB>rules.reservedWeeks)segments.push(segment('Drugi rodzic · pozostały rodzicielski',shareB-rules.reservedWeeks,d.baseB,parentalRate,d.fractionB,'B','parental'));
  }
  const timelineData={...d};
  const birthday=zusDate(d.eventDate);if(birthday)birthday.setUTCFullYear(birthday.getUTCFullYear()+1);
  if(firstYearAdjustment&&!d.parentalStartA&&shareA)timelineData.parentalStartA=zusIso(birthday);
  if(firstYearAdjustment&&!d.parentalStartB&&!shareA)timelineData.parentalStartB=zusIso(birthday);
  issues.push(...zusTimeline(segments,timelineData,maternityDays,ageLimit,supplementary.weeks*7));
  for(const parent of ['A','B']){const first=segments.find(s=>s.parent===parent);if(first){const issue=zusDebtCheck(d,parent,first.from,rules);if(issue)issues.push(issue);}}
  if(supplementary.weeks&&zusDate(segments.find(s=>s.kind==='supplementary')?.from)<zusDate('2025-03-19'))issues.push('Uzupełniający wprowadzono 19.03.2025. Wariant przejściowy sprzed tej daty wymaga odrębnego sprawdzenia.');
  if(d.rate==='combined'&&d.kind==='birth'&&birthday&&['yes','no'].includes(d.firstYearParental)){
    const early=segments.some(s=>s.kind==='parental'&&(s.parent==='A'||s.label.includes('pozostały'))&&zusDate(s.from)<birthday);
    if(early&&firstYearAdjustment)issues.push('Podane daty zawierają rodzicielski przed pierwszymi urodzinami. Popraw daty albo odpowiedź o pierwszym roku.');
    if(!early&&d.firstYearParental==='yes')issues.push('Wybrany plan nie zawiera dnia rodzicielskiego w stawce 81,5% przed pierwszymi urodzinami. Wybierz „Nie”, aby policzyć wyrównanie.');
  }
  if(issues.length)return {issues,maternity,maternityDays,minimumAdoption,parental};
  const minimum=zusApplyMinimum(segments,d,rules);segments=minimum.segments;
  const perParent=Object.fromEntries(['A','B'].map(parent=>[parent,{days:segments.filter(s=>s.parent===parent).reduce((n,s)=>n+s.days,0),total:zusRound(segments.filter(s=>s.parent===parent).reduce((n,s)=>n+s.total,0))}]));
  const adjustment=firstYearAdjustment?zusRound(segments.filter(s=>s.kind==='maternity').reduce((sum,s)=>sum+(s.daily-zusDaily(s.base,rules.combinedRate))*s.days,0)):0;
  return {issues:[],fatherOnly,maternity,maternityDays,minimumAdoption,parental,supplementary,shareA,shareB,unused:parental-shareA-shareB,segments,firstYearAdjustment,adjustment,
    total:Math.round(segments.reduce((sum,s)=>sum+Math.round(s.total*100),0))/100,
    perParent,months:zusMonthlyTotals(segments),notices:minimum.notices,ageLimit,custom:JSON.stringify(rules)!==JSON.stringify(ZUS_DEFAULT_RULES)};
}
function zusResult(d) {
  const result=zusCalculation(d);
  const destination=value=>value==='employer'?'pracodawcy uprawnionego do wypłaty zasiłków':value==='zus'?'ZUS':'płatnika po potwierdzeniu w kadrach';
  const payer=destination(d.payer),payerB=destination(d.payerB);
  if(result.issues.length)return `<div class="zus-result"><h2 tabindex="-1">Co trzeba jeszcze ustalić?</h2><ul>${result.issues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>${d.insurance==='no'&&d.insuranceB==='yes'?`<section class="zus-next"><h3>Sprawdź własną ścieżkę drugiego rodzica</h3><p>Brak ubezpieczenia matki nie rozstrzyga automatycznie o prawach ojca. Ten wariant nie dolicza mu okresu macierzyńskiego. Zbierz potwierdzenie jego ubezpieczenia, daty i dotychczasowe okresy opieki, a następnie sprawdź odrębne prawo do rodzicielskiego i ojcowskiego z płatnikiem.</p>${zusSource('parental','Zasady urlopu rodzicielskiego')} <a href="#sprawa/urlop-ojcowski">Sprawa: urlop ojcowski</a></section>`:''}<p>Uzupełnij dane i przelicz ponownie. ${zusSource('insurance','Warunki ubezpieczenia i wyjątki w ZUS')}</p><a class="dashboard-link" href="#uprawnienia">Świadczenia i szczególne sytuacje ${icon('arrow',16)}</a></div>`;
  return `<div class="zus-result"><p class="home-kicker">Symulacja ${result.custom?'· zmienione parametry testowe':'· zasady sprawdzone 21.11.2026'}</p>
    <h2 tabindex="-1">${result.fatherOnly?'Rodzicielski ubezpieczonego ojca':'Wasz wariant opieki'}</h2><p class="zus-version">Reguły: ${esc(zusRuleLabel())}. Plan zakłada brak zmian przepisów w jego trakcie; minimalną podstawę dobieramy osobno dla każdego roku wypłaty. Dane: ${d.evidenceRequired?'potwierdzone przez Ciebie, bez weryfikacji urzędowej':'symulacja na podanych danych'}.</p><p>${result.fatherOnly?`Ojciec: ${result.shareB} tyg. rodzicielskiego · bez doliczania macierzyńskiego matki`:`${result.maternityDays} dni macierzyńskiego${Number.isInteger(result.maternity)?" ("+result.maternity+" tyg.)":""} · pula rodzicielska ${result.parental} tyg.`}</p>
    ${result.minimumAdoption?'<p class="zus-notice">Zastosowano gwarantowane minimum 9 tygodni macierzyńskiego. Pula rodzicielska 38/62 tygodni nie oznacza automatycznie prawa do jej wykorzystania po granicy wieku.</p>':''}
    ${d.exception==='hospital'?`<p class="zus-notice">Uzupełniający: ${result.supplementary.weeks} tygodni przy ${result.supplementary.days} dniach hospitalizacji w oknie ${result.supplementary.windowFrom} – ${result.supplementary.windowUntil}. ${result.supplementary.weeks?'Liczymy 100% podstawy pierwszego rodzica, bezpośrednio po macierzyńskim.':'W podanych pobytach nie ustalono dodatkowych tygodni; sprawdź kompletne zaświadczenie.'} Daty liczymy od dnia po porodzie (dla dziecka donoszonego od 5. dnia); potwierdź granice z płatnikiem. ${zusSource('supplementary','Warunki uzupełniającego')}</p>`:''}
    ${result.fatherOnly?`<p class="zus-notice">Brak ubezpieczenia matki nie odbiera ojcu własnego uprawnienia do rodzicielskiego. Liczymy wybrany okres według ${zusRules.parentalRate}% jego podstawy, z puli najwyżej ${result.parental-zusRules.reservedWeeks} tygodni. Własne ${zusRules.reservedWeeks} tygodni ojca są już w tej puli. Zakładamy brak wcześniejszego wykorzystania rodzicielskiego i brak sytuacji szczególnych; płatnik musi potwierdzić prawo i okres. ${zusSource('parentalZus','Podział rodzicielskiego w ZUS')}</p>`:''}
    <p class="zus-notice">Suma brutto przed PIT — podwyższenie i założenia rozwiniesz poniżej.</p>
    ${result.notices.length?`<ul class="zus-notice">${result.notices.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:''}
    <div class="zus-total"><strong>${zusMoney(result.total)}</strong><span>Orientacyjna suma brutto zasiłków w poniższym wariancie</span></div>
    ${result.firstYearAdjustment?`<p class="zus-notice">Brak dnia rodzicielskiego w stawce 81,5% w pierwszym roku: rodzicielskie liczymy według 70%, a macierzyńskie po wyrównaniu do 100%. Wyrównanie wynosi orientacyjnie ${zusMoney(result.adjustment)} i wymaga wniosku. Jest już zawarte w sumie powyżej — nie dodawaj go drugi raz. ${zusSource('amount','Zasady wyrównania ZUS')}</p>`:''}
    <div class="zus-segments">${result.segments.map(s=>`<section><h3>${s.label}</h3>${s.from?`<p>${s.from} – ${s.until}</p>`:'<p>Bez daty — porównanie wymiaru</p>'}<p>${s.days} dni · ${String(s.rate).replace('.',',')}% podstawy${s.fraction?' · praca '+(s.fraction===.5?'½':s.fraction===.25?'¼':String(s.fraction).replace('.',','))+' etatu':''}</p><strong>${zusMoney(s.daily)} / dzień</strong><span>Razem ${zusMoney(s.total)}</span></section>`).join('')}</div>
    <p>Pierwszy rodzic: ${result.perParent.A.days} dni, ${zusMoney(result.perParent.A.total)}. Drugi rodzic: ${result.perParent.B.days} dni, ${zusMoney(result.perParent.B.total)}. Daty końca obejmują ostatni dzień wypłaty. Nakładanie się okresów rodziców jest dozwolone; zużywa sumę ich tygodni.</p>
    ${zusTopupPanel(result)}
    ${result.unused?`<p class="zus-notice">${result.unused} tygodni nie jest objętych tym wyliczeniem. ${result.fatherOnly?`${zusRules.reservedWeeks} tygodni zastrzeżonych matce nie przechodzi na ojca. Pozostała różnica, jeśli występuje, to niewybrana część jego puli.`:'Nieprzenoszalna część drugiego rodzica wymaga jego własnego uprawnienia.'}</p>`:''}
    <details class="zus-explain"><summary>Założenia i sposób liczenia</summary><p>Podstawa to kwota ustalona po odliczeniu składek, przed podatkiem. Podstawę dzienną (podstawa / 30), stawkę procentową i kwotę redukcji za pracę zaokrąglamy kolejno do grosza. Kwota dzienna po redukcji = pełny zasiłek dzienny minus zaokrąglona redukcja. Kwota miesięczna zależy od liczby dni kalendarzowych. Suma główna jest brutto. Podwyższenie netto obliczamy osobno z potwierdzonej zaliczki PIT i kwot z pozostałych tytułów; nie obliczamy podatku za płatnika.</p><p>${result.fatherOnly?'Liczymy wyłącznie rodzicielskie ojca przy nieubezpieczonej matce (art. 31 ust. 3h ustawy zasiłkowej). Nie oznacza to przejęcia macierzyńskiego ani prawa do 81,5%.':'Pierwszy rodzic korzysta z całego okresu macierzyńskiego. Rodzicielskie można wykorzystać kolejno lub równolegle. Przy porodzie brak dnia rodzicielskiego w stawce 81,5% w pierwszym roku zmienia stawkę na 70% i pozwala obliczyć wyrównanie macierzyńskiego do 100% na wniosek.'} Kwoty nie obejmują wynagrodzenia za pracę ani osobnego urlopu ojcowskiego.</p><p>Praca u pracodawcy udzielającego urlopu trwa w stałym wymiarze przez cały wybrany okres rodzicielski i jego wydłużenie. Wydłużenie: dni okresu × wymiar pracy względem pełnego etatu, pominięcie części dnia, następnie podział przez (1 − wymiar pracy) i ponowne pominięcie części dnia. Kwotę zasiłku zmniejszamy o stosunek tej pracy do Twojego wymiaru z umowy: praca 1/4 przy umowie 1/2 oznacza redukcję o połowę. Część nieprzenoszalną drugiego rodzica i pozostałą część planujemy jako odrębne okresy. ${zusSource('calculationCommentary','Komentarz ZUS: pkt 144, 147 i 182')} Zmienne okresy pracy, wcześniejsze wykorzystanie części puli i przejęcie macierzyńskiego wymagają odrębnego wyliczenia. Przy adopcji/pieczy macierzyński skracamy do granicy wieku, zachowując minimum 9 tygodni; dla tego minimum pokazujemy pulę 38 lub 62 tygodni. Rodzicielskie przekraczające granicę wieku wymaga potwierdzenia interpretacji z ZUS.</p>${result.ageLimit?`<p>Graniczny wiek dziecka przypada ${fmt(result.ageLimit)}. Zaplanuj wykorzystanie urlopu z uwzględnieniem właściwych terminów.</p>`:''}</details>
    <h3>Dokumenty i następny krok</h3><p>Wynik dotyczy dziecka wybranego w teczce i założeń widocznych powyżej. Zapisz go razem z wersją reguł.</p><p>${result.fatherOnly?`Ojciec kieruje dokumenty do ${payerB}.`:`Pierwszy rodzic kieruje dokumenty do ${payer}.${result.shareB?` Drugi rodzic: do ${payerB}.`:''}`} Przy zatrudnieniu u płatnika zgłaszającego ponad 20 osób do ubezpieczenia chorobowego wypłata zwykle należy do płatnika. Stan ustala się co do zasady na 30 listopada poprzedniego roku.</p>
    <ul><li>Przygotuj aktualny ZAM oraz dokumenty potwierdzające poród lub przyjęcie na wychowanie.</li><li>Pracownik uzgadnia urlop z pracodawcą. Do wypłaty przez ZUS potrzebne może być Z-3, a przy zleceniu Z-3a od płatnika.</li><li>Wniosek o urlop rodzicielski pracownika składa się co najmniej 21 dni przed rozpoczęciem. Wybór stawki 81,5% ma odrębny termin.</li></ul>
    <div class="source-box">${zusSource('amount','Stawki zasiłku')}${zusSource('duration','Wymiar i limity wieku')}${zusSource('parental','Podział i łączenie z pracą')}${zusSource('documents','Aktualne dokumenty')}</div>
    <div class="case-actions"><a class="button secondary" href="#wsparcie/macierzynski">Poproś bliską osobę o pomoc</a><a class="button secondary" href="#terminy">Zaplanuj termin</a><a class="button primary" href="#e-uslugi/zasilek">Wniosek ZAM (symulacja) ${icon('arrow',16)}</a><button class="button secondary" type="button" data-zus-action="print">Drukuj wynik / PDF</button></div></div>`;
}
function calculatorPage(r) {
  const d=zusCurrentDraft();
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{zusSyncFields();if(zusAutoSubmit){zusAutoSubmit=false;document.querySelector('#zus-calculator')?.requestSubmit();}});
  const insurance={unknown:'Do sprawdzenia',yes:'Tak, potwierdzone',no:'Brak ubezpieczenia'};
  return backLink(r)+pageHeading('Zasiłki i urlopy','Zaplanujcie opiekę','Porównaj podział urlopu, okres wypłaty i kwoty dla obojga rodziców.')+
    `<div class="zus-page"><p class="zus-notice">Wynik jest orientacyjną symulacją. O prawie i wysokości świadczenia rozstrzyga ZUS lub uprawniony płatnik po sprawdzeniu dokumentów.</p>
    <div class="zus-demo-choices"><span>Przykłady autorskie</span><button class="filter" data-zus-case="employee">Dwoje rodziców</button><button class="filter" data-zus-case="half">Powrót na pół etatu</button><button class="filter" data-zus-case="uninsured">Brak ubezpieczenia</button><a class="filter" href="#e-uslugi">Dane z ZUS (symulacja)</a><a class="filter" href="#sprawdz-sprawe">Sprawa z zestawu ZUS</a></div>
    ${zusDocumentPanel()}<p class="zus-notice"><strong>Pierwszy rodzic</strong> korzysta z macierzyńskiego (przy porodzie – matka), <strong>drugi</strong> z pozostałej części rodzicielskiego.</p><form id="zus-calculator"><fieldset class="zus-fields"><legend>Dziecko i zdarzenie</legend>
    ${zusSelect('Wasza sytuacja','kind',{birth:'Urodzenie dziecka',adoption:'Przyjęcie w celu adopcji',foster:'Niezawodowa rodzina zastępcza'},d.kind)}
    ${zusSelect('Dzieci urodzone / przyjęte jednocześnie','count',{'0':'Wybierz liczbę dzieci','1':'Jedno','2':'Dwoje','3':'Troje','4':'Czworo','5':'Pięcioro lub więcej'},String(d.count))}
    ${zusField('Rzeczywista data porodu lub przyjęcia','eventDate',d.eventDate,'type="date"')}
    ${state.children[state.active].stage==='pregnancy'?`<p class="zus-field-note">W profilu zapisano przewidywany termin porodu${state.children[state.active].date?' ('+esc(state.children[state.active].date)+')':''}. Nie przenosimy go jako rzeczywistej daty zdarzenia. Bez daty można porównać standardowe kwoty; stawka 81,5% i samodzielny rodzicielski ojca wymagają daty do sprawdzenia terminów.</p>`:''}
    ${zusField('Data urodzenia przyjmowanego dziecka','childDob',d.childDob,'type="date"')}
    ${zusCheck('Zaświadczenie „Za życiem”','special',d.special)}
    ${zusCheck('Odroczony obowiązek szkolny (piecza zastępcza)','deferred',d.deferred)}
    ${zusSelect('Szczególne okoliczności','exception',{none:'Standardowa sytuacja',hospital:'Wcześniactwo / hospitalizacja',loss:'Utrata dziecka',transfer:'Choroba lub śmierć matki / przejęcie opieki'},d.exception)}
    <div class="zus-hospital-fields" ${d.exception==='hospital'?'':'hidden'}><p class="zus-notice">Uzupełniający planujemy dla pierwszego rodzica, bezpośrednio po jego macierzyńskim. Wniosek pracownika wymaga co najmniej 21 dni wyprzedzenia. Wariant z drugim rodzicem lub przerwą w macierzyńskim ustal osobno.</p>
    ${zusField('Ukończone tygodnie ciąży przy porodzie','gestationWeeks',d.gestationWeeks||'','type="number" min="20" max="45" step="1"')}
    ${zusField('Masa urodzeniowa (g) — przy mnogim najniższa','birthWeight',d.birthWeight||'','type="number" min="1" max="10000" step="1"')}
    ${zusField('Pierwszy pobyt — data przyjęcia','hospitalFrom',d.hospitalFrom||'','type="date"')}
    ${zusField('Pierwszy pobyt — data wypisu','hospitalUntil',d.hospitalUntil||'','type="date"')}
    <label class="field">Kolejne pobyty tego samego dziecka (opcjonalnie)<textarea name="hospitalExtra" rows="3" placeholder="RRRR-MM-DD / RRRR-MM-DD">${esc(d.hospitalExtra||'')}</textarea></label>
    ${zusCheck('Potwierdzam dane z zaświadczenia szpitala. Przy porodzie mnogim podaję najniższą masę i pobyty dziecka najdłużej hospitalizowanego, bez sumowania różnych dzieci.','hospitalConfirmed',d.hospitalConfirmed)}
    <p class="zus-field-note">Dzień porodu oznacza dzień 0; liczymy od następnego dnia, do dnia 56 lub 105. Przyjęcie i wypis w tym oknie wliczamy. Granicę pobytu potwierdź z płatnikiem na podstawie zaświadczenia. Dla dziecka donoszonego sprawdzamy pobyt w dniach 5–56 po porodzie i dwa kolejne dni zaczynające się między 5. a 28. dniem. Przy przyjęciu na wychowanie uwzględniamy hospitalizację od przyjęcia. ${zusSource('supplementary','Zasady i przykłady MRPiPS')}</p></div></fieldset>
    <fieldset class="zus-fields"><legend>Ubezpieczenie i podstawa</legend>
    ${zusSelect('Ubezpieczenie pierwszego rodzica w dniu zdarzenia','insurance',insurance,d.insurance)}
    ${zusSelect('Ubezpieczenie drugiego rodzica','insuranceB',insurance,d.insuranceB)}
    ${zusSelect('Praca pierwszego rodzica','workA',GUIDE.work,d.workA)}
    ${zusSelect('Praca drugiego rodzica','workB',GUIDE.work,d.workB)}
    <p class="zus-notice" id="zus-father-note" ${zusFatherOnly(d)?'':'hidden'}>Wybrano samodzielny rodzicielski ojca przy nieubezpieczonej matce. Podaj tylko jego podstawę i wybrany okres. Nie doliczamy macierzyńskiego matki; zakładamy niewykorzystaną wcześniej pulę rodzicielskiego. Ojciec musi mieć własne uprawnienie i opiekować się dzieckiem.</p>
    ${zusField('Podstawa pierwszego rodzica (zł)','baseA',d.baseA,'type="number" min="0" max="1000000" step="0.01"'+(zusFatherOnly(d)?'':' required'))}
    ${zusField('Podstawa drugiego rodzica (zł)','baseB',d.baseB,'type="number" min="0" max="1000000" step="0.01"'+(d.insuranceB==='yes'?' required':''))}
    ${zusField('Wymiar z umowy pierwszego rodzica (1 = pełny etat)','contractFractionA',d.contractFractionA??1,'type="number" min="0.01" max="1" step="0.01"')}
    ${zusField('Wymiar z umowy drugiego rodzica (1 = pełny etat)','contractFractionB',d.contractFractionB??1,'type="number" min="0.01" max="1" step="0.01"')}
    <p class="zus-field-note">Dla pełnego etatu minimum w 2026 r. to 4 147,10 zł (4 806 zł pomniejszone o 13,71%). Wymiar z umowy określa minimum i proporcję redukcji zasiłku podczas pracy. Poniżej wybierzesz pracę podczas rodzicielskiego jako część pełnego etatu, nie część swojej umowy. Podstawa działalności i zlecenia nie podlega temu minimum pracowniczemu.</p>
    <p class="zus-field-note">Wpisz podstawę z dokumentów płatnika. Na etacie zwykle wynika z 12 miesięcy wynagrodzenia po odliczeniu składek społecznych. Wahania składników, krótsze ubezpieczenie i działalność wymagają odrębnego ustalenia. ${zusSource('base','Jak ustala się podstawę')}</p>
    ${zusField('Koniec ubezpieczenia, jeśli znany','coverageEnd',d.coverageEnd,'type="date"')}
    ${zusSelect('Zadłużenie pierwszego rodzica przy działalności','debt',{unknown:'Do sprawdzenia',clear:'ZUS potwierdził brak przeszkody do wypłaty',amount:'Znam potwierdzoną kwotę — sprawdź próg',debt:'Zadłużenie wymaga wyjaśnienia'},d.debt)}
    ${zusField('Potwierdzony dług pierwszego rodzica na początek prawa (zł)','debtAmountA',d.debtAmountA??'','type="number" min="0" step="0.01"')}
    ${zusSelect('Zadłużenie drugiego rodzica przy działalności','debtB',{unknown:'Do sprawdzenia',clear:'ZUS potwierdził brak przeszkody do wypłaty',amount:'Znam potwierdzoną kwotę — sprawdź próg',debt:'Zadłużenie wymaga wyjaśnienia'},d.debtB||'unknown')}
    ${zusField('Potwierdzony dług drugiego rodzica na początek prawa (zł)','debtAmountB',d.debtAmountB??'','type="number" min="0" step="0.01"')}</fieldset>
    <fieldset class="zus-fields"><legend>Podział opieki</legend>
    ${zusField('Tygodnie rodzicielskiego pierwszego rodzica','shareA',d.shareA,'type="number" min="0" max="58" step="1" required')}
    ${zusField('Tygodnie rodzicielskiego drugiego rodzica','shareB',d.shareB??9,'type="number" min="0" max="58" step="1"')}
    ${zusField('Tygodnie rodzicielskiego ojca — łącznie z jego własną częścią','fatherWeeks',d.fatherWeeks??32,'type="number" min="1" max="58" step="1"')}
    ${zusField('Początek rodzicielskiego pierwszego rodzica (opcjonalnie)','parentalStartA',d.parentalStartA||'','type="date"')}
    ${zusField('Początek rodzicielskiego drugiego rodzica (opcjonalnie)','parentalStartB',d.parentalStartB||'','type="date"')}
    <p class="zus-field-note">Bez własnych dat planujemy okresy kolejno: macierzyński, rodzicielski pierwszego i drugiego rodzica. Wpisz daty, jeśli chcecie opiekować się dzieckiem jednocześnie. Końce okresów policzymy z wybranych tygodni i etatu; dotychczas wykorzystane części wymagają odrębnego uwzględnienia.</p>
    ${zusSelect('Wariant wypłaty','rate',{standard:'100% macierzyński + 70% rodzicielski',combined:'81,5% po wniosku w terminie'},d.rate)}
    ${zusField('Data wniosku o stawkę 81,5%','applicationDate',d.applicationDate,'type="date"')}
    ${zusSelect('Choć jeden dzień rodzicielskiego w stawce 81,5% w pierwszym roku życia?','firstYearParental',{unknown:'Do potwierdzenia',yes:'Tak — wykorzystany lub zaplanowany',no:'Nie — oblicz 70% i wyrównanie macierzyńskiego'},d.firstYearParental||'unknown')}
    ${zusSelect('Kto wypłaca zasiłek pierwszego rodzica','payer',{unknown:'Potwierdzę w kadrach',employer:'Uprawniony pracodawca',zus:'ZUS'},d.payer)}
    ${zusSelect('Kto wypłaca zasiłek drugiego rodzica','payerB',{unknown:'Potwierdzę w kadrach',employer:'Uprawniony pracodawca',zus:'ZUS'},d.payerB||'unknown')}
    ${zusSelect('Praca pierwszego rodzica podczas rodzicielskiego','fractionA',{'0':'Bez łączenia z pracą','0.25':'1/4 pełnego etatu przez cały okres','0.5':'1/2 pełnego etatu przez cały okres'},String(d.fractionA))}
    ${zusSelect('Praca drugiego rodzica podczas rodzicielskiego','fractionB',{'0':'Bez łączenia z pracą','0.25':'1/4 pełnego etatu przez cały okres','0.5':'1/2 pełnego etatu przez cały okres'},String(d.fractionB))}
    ${zusSelect('Czy warunki pozostają stałe przez wybrany okres?','workPattern',{constant:'Tak — jeden stały wymiar, bez przerw',variable:'Nie — zmiany etatu, przerwy lub zakończenie urlopu'},d.workPattern||'constant')}</fieldset>
    <fieldset class="zus-review"><legend>Potwierdź dane do tego wariantu</legend>
    ${zusCheck('Sprawdzono stan ubezpieczenia obojga rodziców i ewentualne zadłużenie','reviewInsurance',d.reviewInsurance)}
    ${zusCheck('Podane podstawy pochodzą z dokumentów płatnika albo są świadomie przyjętym założeniem symulacji','reviewBasis',d.reviewBasis)}
    ${zusCheck('Sprawdzono zdarzenie, liczbę dzieci i założenia podziału opieki','reviewDates',d.reviewDates)}
    <p>Potwierdzenia dotyczą tego wyliczenia. Zmiana danych wymaga ich ponownego sprawdzenia.</p></fieldset>
    <button class="button primary" type="submit">Oblicz nasz wariant ${icon('arrow',16)}</button></form>
    <div id="zus-result" aria-live="polite"></div><a class="dashboard-link" href="#uprawnienia">Świadczenia w ciąży i trudniejsze sytuacje ${icon('right',16)}</a>
    <a class="dashboard-link" href="#parametry">Parametry kalkulatora — panel demonstracyjny ${icon('right',16)}</a></div>`;
}
function zusParametersPage(r) {
  return backLink(r)+pageHeading('Panel demonstracyjny','Parametry zasiłków','Ustaw parametry na tym urządzeniu i sprawdzaj ich wersję przy wyniku.')+
    `<div class="zus-page"><form id="zus-parameters"><div class="zus-fields">
    ${zusField('Macierzyński (%)','maternityRate',zusRules.maternityRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Rodzicielski (%)','parentalRate',zusRules.parentalRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Wariant uśredniony (%)','combinedRate',zusRules.combinedRate,'type="number" min="0" max="100" step="0.1" required')}
    ${zusField('Rodzicielski dla jednego dziecka (tyg.)','parentalSingle',zusRules.parentalWeeks[0],'type="number" min="18" max="100" step="1" required')}
    ${zusField('Rodzicielski dla wieloraczków (tyg.)','parentalMultiple',zusRules.parentalWeeks[1],'type="number" min="18" max="150" step="1" required')}
    ${zusRules.maternityWeeks.map((n,i)=>zusField('Macierzyński — '+(i+1)+(i===4?'+':'')+' dzieci (tyg.)','maternityWeeks'+i,n,'type="number" min="1" max="150" step="1" required')).join('')}
    ${zusField('Za życiem — jedno dziecko (tyg.)','specialSingle',zusRules.specialParentalWeeks[0],'type="number" min="18" max="150" step="1" required')}
    ${zusField('Za życiem — wieloraczki (tyg.)','specialMultiple',zusRules.specialParentalWeeks[1],'type="number" min="18" max="150" step="1" required')}
    ${[['reservedWeeks','Część nieprzenoszalna (tyg.)'],['adoptionMinWeeks','Minimalny okres przy przyjęciu (tyg.)'],['olderChildParentalWeeks','Rodzicielski przy minimum 9 tygodni (tyg.)'],['olderChildSpecialParentalWeeks','Za życiem przy minimum 9 tygodni (tyg.)'],['minimumYear','Rok minimalnego wynagrodzenia'],['minimumWage','Minimalne wynagrodzenie (zł)'],['contributionRate','Odliczenie składek (%)'],['parentalBenefitAmount','Świadczenie rodzicielskie netto (zł)'],['debtThresholdPercent','Próg długu (% minimalnego wynagrodzenia)']].map(([key,label])=>zusField(label,key,zusRules[key],'type="number" min="0" step="0.01" required')).join('')}
    <p class="zus-field-note">Podana kwota minimalnego wynagrodzenia dotyczy całego wybranego roku: od 1 stycznia do 31 grudnia. Pozostałe reguły są wersją sprawdzoną ${esc(zusRules.version)}; nie mają tu daty automatycznego wygaśnięcia.</p></div>
    <div class="case-actions"><button class="button primary" type="submit">Zastosuj w symulacji</button><button class="button secondary" data-zus-action="rules-reset" type="button">Przywróć sprawdzone wartości</button></div><p id="zus-parameters-status" role="status"></p></form>
    <p class="zus-field-note">Minimum pełnego etatu: ${zusMoney(zusMinimumBase())}. Próg długu: ${zusMoney(zusRound(zusRules.minimumWage*zusRules.debtThresholdPercent/100))}. Wartości pochodne wyliczamy automatycznie. Domyślne minima wynagrodzeń: 2025 — 4666 zł, 2026 — 4806 zł, 2027 — 4950 zł. Podany rok zastępuje jedną pozycję; pozostałe parametry opisują tę symulację, nie automatyczny silnik historycznego prawa. Produkcyjna zmiana reguł wymaga zatwierdzenia merytorycznego.</p><a class="dashboard-link" href="#kalkulator">Przetestuj kalkulator ${icon('right',16)}</a></div>`;
}
function zusGuidePage(r) {
  return backLink(r)+pageHeading('Uprawnienia i pomoc','Co warto sprawdzić wcześniej','Informacje zweryfikowane w źródłach ZUS 21 listopada 2026 r.')+
    `<div class="zus-page zus-guide-list">
    <article><h2>Chorobowe w ciąży</h2><p>Przy niezdolności do pracy potwierdzonej przez lekarza świadczenie w ciąży wynosi 100% podstawy, a okres zasiłkowy może trwać do 270 dni. Ubezpieczenie obowiązkowe zwykle wymaga 30 dni wyczekiwania, dobrowolne 90 dni. Istnieją wyjątki i zasady wliczania poprzedniego ubezpieczenia.</p><p>e-ZLA trafia elektronicznie do ZUS i płatnika. Pracownica informuje pracodawcę o nieobecności. Gdy wypłaca ZUS, płatnik przekazuje właściwe zaświadczenie Z-3 lub Z-3a. Osoba prowadząca firmę składa wniosek ZAS-53. Kod B lub zaświadczenie o ciąży pozwala zastosować właściwą stawkę.</p><div class="source-box">${zusSource('sick','Warunki, dokumenty i terminy ZUS')}</div></article>
    <article><h2>Świadczenie rehabilitacyjne</h2><p>Po wyczerpaniu zasiłku chorobowego można je otrzymać, jeżeli nadal nie można pracować, a dalsze leczenie lub rehabilitacja rokują odzyskanie zdolności do pracy. Ocenę przeprowadza ZUS. Świadczenie trwa maksymalnie 12 miesięcy. Wynosi 90% podstawy przez pierwsze 3 miesiące i 75% później, a w okresie ciąży – 100%.</p><p>Przygotuj wniosek ZNp-7, zaświadczenie o stanie zdrowia OL-9 i dokumenty wymagane dla Twojej sytuacji. ZUS zaleca złożenie dokumentów co najmniej 6 tygodni przed końcem okresu zasiłkowego.</p><div class="source-box">${zusSource('rehabilitation','Świadczenie rehabilitacyjne w ZUS')}</div></article>
    <article><h2>Zakończenie pracy w ciąży</h2><p>Gdy ubezpieczenie kończy się przed porodem, zbierz datę i podstawę rozwiązania umowy. Niektóre umowy terminowe przedłużają się do porodu. Śmierć pracodawcy, jego upadłość lub likwidacja mogą dawać szczególne uprawnienia.</p><p>Po utracie zatrudnienia z powodu śmierci, likwidacji lub upadłości pracodawcy, bez zapewnienia innej pracy, możliwy jest zasiłek w wysokości macierzyńskiego do dnia porodu. Za okres po porodzie sprawdza się odrębne warunki. Przygotuj świadectwo pracy i dokumenty potwierdzające okoliczności.</p><div class="source-box">${zusSource('insurance','Wyjątki po ustaniu ubezpieczenia')}${zusSource('documents','Wymagane dowody')}${zusSource('work','Ochrona zatrudnienia — PIP')}</div></article>
    <article><h2>Wcześniactwo, hospitalizacja i utrata dziecka</h2><p>Wcześniactwo lub pobyt noworodka w szpitalu mogą dawać prawo do uzupełniającego urlopu macierzyńskiego. Wymiar zależy od tygodnia ciąży, masy urodzeniowej i czasu hospitalizacji. Przygotuj zaświadczenie szpitala i ustal termin wniosku z płatnikiem.</p><p>Po utracie ciąży lub dziecka zapytaj ZUS o dokumenty potwierdzające zdarzenie i właściwy skrócony okres świadczenia. Choroba, hospitalizacja albo śmierć matki mogą pozwalać drugiemu uprawnionemu opiekunowi przejąć opiekę i zasiłek. Takie przypadki wymagają indywidualnej oceny dokumentów.</p><div class="source-box">${zusSource('duration','ZUS — okresy i sytuacje szczególne')}${zusSource('documents','Dokumenty do zasiłku')}</div></article>
    <article><h2>Co może zmienić prawo lub kwotę?</h2><ul><li>Brak zgłoszenia do chorobowego lub zakończenie ubezpieczenia przed porodem.</li><li>Zadłużenie składkowe przy prowadzeniu działalności — sprawdź stan na właściwy dzień.</li><li>Zmiana etatu, przerwy w ubezpieczeniu i nieregularne składniki wynagrodzenia.</li><li>Umowa wykonywana pozornie albo nieuzasadnione podniesienie podstawy mogą podlegać weryfikacji ZUS.</li><li>Wniosek o stawkę 81,5% ma termin 21 dni. Jeżeli nie wykorzystano choć jednego dnia rodzicielskiego w pierwszym roku, zastosowanie mają odrębne zasady stawki i wyrównania.</li></ul><div class="source-box">${zusSource('amount','Wysokość i wyrównanie')}${zusSource('insurance','Warunki prawa do zasiłku')}</div></article>
    <article><h2>Aktualne formularze</h2><p>Od 24 października 2026 r. ZAM obejmuje również okresy wcześniej obsługiwane przez ZUR i ZAO. Z-3b co do zasady przestał być wymagany. ZUS czasowo udostępnił go 20 listopada w roli Płatnik dla pełnomocników z ograniczonym dostępem do usług eZUS. Dobierz formularz do aktualnej instrukcji i roli użytkownika.</p><div class="source-box">${zusSource('forms','Wzory formularzy ZUS')}${zusSource('documents','Instrukcja składania dokumentów')}</div></article>
    <article><h2>Wsparcie organizacji społecznych</h2><p>Po utracie ciąży możesz skorzystać z informacji Fundacji Ronić po Ludzku. Rodzicom wcześniaków pomaga Fundacja Wcześniak Rodzice-Rodzicom. Informacje o prawach okołoporodowych udostępnia Fundacja Rodzić po Ludzku. Zakres dostępnej pomocy i kontakt sprawdzisz bezpośrednio w organizacji.</p><div class="source-box"><a href="https://ronicpoludzku.com/" target="_blank" rel="noopener noreferrer">Ronić po Ludzku</a><a href="https://wczesniak.pl/tak-pomagamy/" target="_blank" rel="noopener noreferrer">Wcześniak Rodzice-Rodzicom</a><a href="https://rodzicpoludzku.pl/o-nas/kontakt/" target="_blank" rel="noopener noreferrer">Rodzić po Ludzku</a></div><a class="dashboard-link" href="#wsparcie">Przygotuj własną Kartę wsparcia dla bliskiej osoby ${icon('arrow',16)}</a></article></div>`;
}
document.addEventListener('click',event=>{
  const sample=event.target.closest('[data-zus-case]');
  if(sample) {
    zusDraft={...zusInitial(),count:1,multiple:false,baseA:5000,baseB:6000,insurance:'yes',insuranceB:'yes',workA:'employee',workB:'employee',eventDate:'2026-01-01',childDob:'2026-01-01',debt:'clear',payer:'employer'};
    if(state.children[state.active].multiple){zusDraft.count=2;zusDraft.multiple=true;zusDraft.shareA=34;}
    if(sample.dataset.zusCase==='half')zusDraft.fractionA=.5;
    if(sample.dataset.zusCase==='uninsured')zusDraft.insurance='no';
    zusSaveDraft(zusDraft);
    Object.assign(zusDraft,{reviewInsurance:true,reviewBasis:true,reviewDates:true});zusSaveDraft(zusDraft);zusAutoSubmit=true;
    const evidence=zusCurrentEvidence();evidence.sample=sample.textContent.trim();evidence.file=null;evidence.sprawa=null;
    if(location.hash==='#kalkulator')render(true);else location.hash='kalkulator';
    return;
  }
  const action=event.target.closest('[data-zus-action]')?.dataset.zusAction;
  if(action==='document-clear'){zusCurrentEvidence().file=null;zusCurrentEvidence().sprawa=null;render(true);}
  const sprawa=event.target.closest('[data-zus-sprawa]')?.dataset.zusSprawa,c=zusCurrentEvidence().sprawa;
  if(sprawa==='wczytaj'&&c?.kalkulator){zusSaveDraft({...zusInitial(),...c.kalkulator,reviewInsurance:true,reviewBasis:true,reviewDates:true});zusAutoSubmit=true;render(true);}
  if(sprawa==='porownaj'&&c&&typeof sprawyPokaz==='function')sprawyPokaz(zusCurrentEvidence().file,c);
  if(action==='rules-reset'){zusSetRules(structuredClone(ZUS_DEFAULT_RULES),true);render(true);}
  if(action==='print') {
    document.body.classList.add('printing-zus');
    window.print();
    document.body.classList.remove('printing-zus');
  }
});
document.addEventListener('submit',event=>{
  const form=event.target;
  if(form.id==='zus-topup'){
    event.preventDefault();if(!form.reportValidity())return;
    const values=new FormData(form);let computed=0,total=0;
    form.querySelectorAll('[data-topup-row]').forEach((node,i)=>{
      const row={gross:Number(node.dataset.gross),days:Number(node.dataset.days),monthDays:Number(node.dataset.monthDays)};
      const rawPit=values.get('pit-'+i),rawOther=values.get('other-'+i);
      const out=zusTopupMonth(row,rawPit===''?'':Number(rawPit),rawOther===''?'':Number(rawOther),values.has('confirmed'));
      node.querySelector('[data-topup-output]').textContent=out.issue||`Razem po PIT: ${zusMoney(out.net)}. Próg: ${zusMoney(out.target)}. Podwyższenie: ${zusMoney(out.topup)}. Razem netto z podwyższeniem: ${zusMoney(out.netWithTopup)}.`;
      if(!out.issue){computed++;total+=out.topup;}
    });
    document.querySelector('#zus-topup-status').textContent=`Obliczono ${computed} z ${form.querySelectorAll('[data-topup-row]').length} miesięcy. Suma podwyższeń tylko dla uzupełnionych miesięcy: ${zusMoney(zusRound(total))}.`;
    return;
  }
  if(form.id==='zus-calculator') {
    event.preventDefault();if(!form.reportValidity())return;
    zusSaveDraft(zusRead(form));
    const result=document.querySelector('#zus-result');result.innerHTML=zusResult(zusDraft);
    result.querySelector('h2').focus();result.scrollIntoView({behavior:'auto',block:'start'});
  }
  if(form.id==='zus-parameters') {
    event.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form),next=structuredClone(zusRules);
    for(const key of ['maternityRate','parentalRate','combinedRate','reservedWeeks','adoptionMinWeeks','olderChildParentalWeeks','olderChildSpecialParentalWeeks','minimumYear','minimumWage','contributionRate','parentalBenefitAmount','debtThresholdPercent'])next[key]=Number(d.get(key));
    next.parentalWeeks=[Number(d.get('parentalSingle')),Number(d.get('parentalMultiple'))];
    next.specialParentalWeeks=[Number(d.get('specialSingle')),Number(d.get('specialMultiple'))];
    next.maternityWeeks=Array.from({length:5},(_,i)=>Number(d.get('maternityWeeks'+i)));
    next.validFrom=`${next.minimumYear}-01-01`;next.validTo=`${next.minimumYear}-12-31`;
    const outcome=zusSetRules(next);
    document.querySelector('#zus-parameters-status').textContent=outcome.issues.length?outcome.issues.join(' '):`Zastosowano ${zusRuleLabel()}. Minimum pełnego etatu ${zusMoney(zusMinimumBase())}; próg długu ${zusMoney(zusRound(zusRules.minimumWage*zusRules.debtThresholdPercent/100))}. `+(outcome.persisted?'Zapisano na tym urządzeniu.':'Przeglądarka nie pozwoliła zapisać; zmiana działa tylko w tej karcie.');
  }
});
document.addEventListener('change',event=>{
  if(event.target.id!=='zus-document')return;
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl='';
  const file=event.target.files[0],target=document.querySelector('#zus-document-view');
  if(!file){zusCurrentEvidence().file=null;target.innerHTML='';return;}
  if(file.type!=='application/pdf'||file.size>20*1024*1024){zusCurrentEvidence().file=null;target.textContent='Wybierz PDF do 20 MB.';return;}
  const form=document.querySelector('#zus-calculator');
  for(const key of ['reviewInsurance','reviewBasis','reviewDates'])form.elements[key].checked=false;
  zusSaveDraft(zusRead(form));document.querySelector('#zus-result').innerHTML='<p class="zus-notice">Dodano dokument. Sprawdź dane i potwierdź je przed przeliczeniem.</p>';
  zusCurrentEvidence().file=file;zusCurrentEvidence().sample='';zusCurrentEvidence().sprawa=null;
  if(typeof sprawyRozpoznaj==='function')sprawyRozpoznaj(file).then(c=>{
    if(!c||zusCurrentEvidence().file!==file)return;
    zusCurrentEvidence().sprawa=c;
    document.querySelector('#zus-document-view')?.insertAdjacentHTML('beforebegin',zusSprawaBanner(c));
  }).catch(()=>{});
  zusDocumentUrl=URL.createObjectURL(file);
  target.innerHTML=`<p>${esc(file.name)}</p><a class="button secondary" href="${zusDocumentUrl}" target="_blank" rel="noopener">Otwórz lokalny dokument</a><button class="button secondary" type="button" data-zus-action="document-clear">Usuń dokument z teczki</button><iframe title="Podgląd dokumentu w przeglądarce" src="${zusDocumentUrl}"></iframe>`;
});
window.addEventListener('hashchange',()=>{
  if(zusDocumentUrl)URL.revokeObjectURL(zusDocumentUrl);
  zusDocumentUrl='';
});

// Keep partially entered values with their child's stable UID, without storing documents on disk.
document.addEventListener('input',event=>{
  const form=event.target.form;
  if(form?.id!=='zus-calculator')return;
  if(!['reviewInsurance','reviewBasis','reviewDates'].includes(event.target.name)){
    for(const key of ['reviewInsurance','reviewBasis','reviewDates'])form.elements[key].checked=false;

  }
  const result=document.querySelector('#zus-result');if(result)result.innerHTML='<p class="zus-notice">Dane lub potwierdzenia zmieniono. Przelicz wariant ponownie.</p>';
  zusSaveDraft(zusRead(form));
});

function zusSyncFields() {
  const form=document.querySelector('#zus-calculator');if(!form)return;
  // Include retained values of hidden controls while deciding what to re-enable.
  const d=Object.fromEntries(Array.from(form.elements).filter(el=>el.name&&(el.type!=='checkbox'||el.checked)).map(el=>[el.name,el.value]));
  const fatherOnly=zusFatherOnly(d);
  const hospitalGroup=form.querySelector('.zus-hospital-fields');hospitalGroup.hidden=d.exception!=='hospital';
  hospitalGroup.querySelectorAll('input,textarea').forEach(el=>el.disabled=d.exception!=='hospital');
  const combinedOption=form.elements.rate.querySelector('option[value="combined"]');
  combinedOption.hidden=fatherOnly;combinedOption.disabled=fatherOnly;
  if(fatherOnly&&d.rate==='combined'){form.elements.rate.value='standard';d.rate='standard';}
  const visible={contractFractionA:!fatherOnly&&d.workA==='employee',contractFractionB:d.insuranceB==='yes'&&d.workB==='employee',firstYearParental:d.rate==='combined'&&d.kind==='birth',childDob:d.kind!=='birth',deferred:d.kind==='foster',debt:!fatherOnly&&d.workA==='business',debtB:d.workB==='business'&&d.insuranceB==='yes',applicationDate:d.rate==='combined',baseB:d.insuranceB!=='no',fractionB:d.insuranceB!=='no',workB:d.insuranceB!=='no',payerB:d.insuranceB!=='no',baseA:!fatherOnly,workA:!fatherOnly,coverageEnd:!fatherOnly,shareA:!fatherOnly,shareB:!fatherOnly&&d.insuranceB!=='no',parentalStartA:!fatherOnly,parentalStartB:d.insuranceB!=='no',payer:!fatherOnly,fractionA:!fatherOnly,fatherWeeks:fatherOnly};
  visible.debtAmountA=visible.debt&&d.debt==='amount';visible.debtAmountB=visible.debtB&&d.debtB==='amount';
  for(const [key,show] of Object.entries(visible)){
    form.elements[key].closest('label').hidden=!show;
    form.elements[key].disabled=!show;
  }
  form.elements.baseB.required=d.insuranceB==='yes';
  form.elements.baseA.required=!fatherOnly;
  form.elements.shareA.required=!fatherOnly;
  form.elements.fatherWeeks.required=fatherOnly;
  form.elements.fatherWeeks.max=(d.special?zusRules.specialParentalWeeks:zusRules.parentalWeeks)[Number(d.count)===1?0:1]-zusRules.reservedWeeks;
  form.elements.rate.options[0].textContent=fatherOnly?'70% rodzicielskiego ojca':'100% macierzyński + 70% rodzicielski';
  document.querySelector('#zus-father-note').hidden=!fatherOnly;
}
document.addEventListener('change',event=>{if(event.target.form?.id==='zus-calculator')zusSyncFields();});
window.addEventListener('storage',event=>{if(event.key===ZUS_RULES_KEY){zusRules=zusLoadRules();const result=document.querySelector('#zus-result');if(result)result.innerHTML='<p class="zus-notice">Parametry zmieniono w innej karcie. Przelicz wynik.</p>';}});
