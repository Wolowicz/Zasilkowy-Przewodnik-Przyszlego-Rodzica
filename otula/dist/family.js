// Rodzinne plany. Rola i praca należą do opiekuna; daty i wykonane kroki do dziecka.
function childRecord(value = {}) {
  return {
    uid: typeof value.uid==='string' && /^[a-zA-Z0-9-]{1,80}$/.test(value.uid)?value.uid:calendarId(),
    events: cleanCalendarEvents(value.events),
    name: text(value.name, 40), stage: value.stage === 'birth' ? 'birth' : 'pregnancy',
    date: parseDate(value.date) ? value.date : '',
    done: GUIDE.cases.filter(c => Array.isArray(value.done) && value.done.includes(c.id)).map(c => c.id),
    extras: GUIDE.cases.filter(c=>c.optional && Array.isArray(value.extras) && value.extras.includes(c.id)).map(c=>c.id),
    checks: Array.isArray(value.checks) ? tips.map(t=>t[0]).filter(id=>value.checks.includes(id)) : [],
    note: text(value.note, 600), multiple: value.multiple === true
  };
}
function snapshotChild() {
  Object.assign(state.children[state.active], {stage:state.stage,date:state.date,done:state.done.slice()});
}
function chooseChild(index) {
  if (!Number.isInteger(index) || !state.children[index]) return;
  snapshotChild(); state.active = index;
  const c = state.children[index];
  Object.assign(state,{stage:c.stage,date:c.date,done:c.done.slice()});
  supportId = '';planFilter='all';calendarMonth='';calendarDay='';saved('');render(true);
}
function childLabel(index) { return state.children[index].name || 'Dziecko ' + (index+1); }
const familyTools = [
  {id:'pomoc', label:'Zapytaj AI', short:'Zapytaj AI', description:'Zadaj pytanie i sprawdź źródła odpowiedzi.', glyph:'chat', color:'rose'},
  {id:'poradnik', label:'Podręcznik rodzica', short:'Poradnik', description:'Znajdź temat o porodzie, połogu lub opiece nad dzieckiem.', glyph:'book', color:'gold'},
  {id:'raport', label:'Raport PDF i Word', short:'Raport', description:'Pobierz dokumenty, terminy i notatki w jednym pliku.', glyph:'download', color:'sage'}
];
function familyNavigation(active) {
  return '<div class="nav-label nav-section">Dla rodziny</div>'+familyTools.map(t=>
    `<a href="#${t.id}" class="nav-item ${active===t.id?'selected':''}" ${active===t.id?'aria-current="page"':''}>${icon(t.glyph,20)}${t.label}</a>`
  ).join('');
}
function toolsPage(r) {
  const settings = [
    {id:'rodzina', label:'Moja rodzina', description:'Dodaj dziecko lub zmień jego dane.', glyph:'heart', color:'peach'},
    {id:'sytuacja', label:'Moja sytuacja', description:'Zmień rolę, etap lub formę zatrudnienia.', glyph:'adjust', color:'rose'}
  ];
  const links=items=>items.map(t=>`<a class="case-row" href="#${t.id}">${tileIcon({icon:t.glyph,color:t.color})}<span class="case-copy"><strong class="case-title">${t.label}</strong><span class="case-sub">${t.description}</span></span>${icon('right',16)}</a>`).join('');
  return backLink(r)+`<div class="tools-page"><h1 tabindex="-1">Narzędzia</h1><div class="case-list">${links(familyTools)}</div><h2>Ustawienia rodziny</h2><div class="case-list">${links(settings)}</div></div>`;
}

function childSwitch(compact=false){
 const choices=state.children.map((c,i)=>`<option value="${i}" ${i===state.active?'selected':''}>${esc(childLabel(i))}</option>`).join('');
 if(compact)return `<label>Plan dziecka<select id="active-child">${choices}</select></label>`;
 return `<div class="family-strip"><span class="family-symbol" aria-hidden="true">${icon('heart',23)}</span><label><span>Plan dziecka</span><select id="active-child">${choices}</select></label><a href="#rodzina">${icon('person',16)} Moja rodzina</a></div>`;}

function glossaryResults(q){const key=normalize(q.trim());const matches=GUIDE.glossary.filter(([t,d])=>normalize(t+' '+d).includes(key)).sort((a,b)=>a[0].localeCompare(b[0],'pl'));return matches.length?matches.map(([t,d])=>`<details><summary>${esc(t)}${icon('chevron',16)}</summary><p>${esc(d)}</p></details>`).join(''):'<p>Brak takiego hasła. Spróbuj wpisać jego część.</p>';}

function glossaryPage(r){return backLink(r)+pageHeading('Biblioteka spraw','Słowniczek urzędowy','Wpisz skrót albo słowo z pisma, które chcesz zrozumieć.')+`<label class="search-box">${icon('search')}<input id="glossary-search" type="search" placeholder="Np. kosiniakowe, IKP, odpis" aria-label="Szukaj w słowniczku"></label><div class="glossary" id="glossary-results">${glossaryResults('')}</div>`;}
const tips = [
  ['wyjscie','Przed wyjściem','Zostaw przy drzwiach małą torbę z zapasowym ubraniem, podkładem, pieluszkami i workiem na mokre rzeczy. Po powrocie uzupełnij tylko to, co zostało zużyte.','wyjscia'],
  ['wizyta','Przed wizytą u pediatry','W jednym miejscu połóż książeczkę zdrowia i dokumenty z poprzedniej wizyty. Zapisz dwa pytania oraz konkretną obserwację, o którą chcesz zapytać.','wyjscia'],
  ['para','Gdy ktoś proponuje pomoc','Wybierz jedno zadanie z godziną i miejscem, np. odbiór zakupów. W Karcie wsparcia możesz przeredagować gotową prośbę.','razem'],
  ['rodzenstwo','Chwila ze starszakiem','Pozwól starszemu dziecku wybrać książkę na wasz wspólny czas. Ustal z drugą osobą, kto przez tę chwilę zajmie się młodszym.','dom'],
  ['papiery','Po wysłaniu wniosku','Zapisz potwierdzenie z datą i nazwą sprawy. W planie właściwego dziecka oznacz krok jako wykonany, a numer sprawy zachowaj w swoich dokumentach.','sprawy'],
  ['powrot','Przed powrotem do pracy','Spisz z drugim opiekunem daty urlopów i sprawdźcie osobno u swoich pracodawców, jakie wnioski musicie dostarczyć.','sprawy'],
  ['torba','Dwie przegródki zamiast szukania','Przy dwójce dzieci przypisz każdemu kolor woreczka na ubrania. Zapas łatwiej uzupełnić po wyjściu, a drugi opiekun wie, po który woreczek sięgnąć.','wyjscia'],
  ['przekazanie','Przekazanie opieki w minutę','Na małej kartce zapisz, co jest już spakowane, gdzie leżą potrzebne rzeczy i o której wracasz. Zostaw kontakt do siebie.','razem'],
  ['ubrania','Rozmiary bez przekładania całej szafy','Przygotuj pojemnik na ubrania, z których dziecko wyrosło, i drugi na następny rozmiar. Przy rodzeństwie opisz je rozmiarem, a nie tylko imieniem.','dom'],
  ['urzad','Jedna teczka na jedną sprawę','Przed wyjściem do urzędu otwórz kartę sprawy. Odłóż razem wymagane dokumenty, numer rezerwacji i kartkę z pytaniami.','sprawy'],
  ['chwila','Wspólne czytanie','Połóż jedną książeczkę blisko miejsca, w którym razem odpoczywacie. Wskaż obrazek, nazwij go i daj dziecku chwilę na reakcję.','dom'],
  ['torbaszpital','Pakowanie w ciąży','Sprawdź listę swojej placówki. Spakuj rzeczy na przyjęcie oddzielnie od rzeczy na wyjście i pokaż osobie towarzyszącej, gdzie ich szukać.','wyjscia'],
  ['zakupy','Lista dla osoby pomagającej','Gdy ktoś proponuje zakupy, podaj kilka konkretnych produktów i dopuszczalne zamienniki. Dopisz, gdzie zostawić torbę, jeśli akurat odpoczywacie.','razem'],
  ['pytania','Mały zeszyt pytań','Gdy pojawi się pytanie do położnej, urzędu lub pracodawcy, od razu zapisz je pod nazwą instytucji. Przed rozmową wybierz dwie najważniejsze sprawy.','sprawy'],
  ['rozwoj','Obserwacje rozwoju','Zanotuj, co dziecko zrobiło i w jakiej sytuacji. Na przykład: „Na macie sięgnęła po grzechotkę”. Własny opis łatwiej potem przytoczyć na wizycie.','sprawy']
];
const kdrUrl='https://www.gov.pl/web/gov/uzyskaj-karte-duzej-rodziny';
const publicOtula='https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/';
function familyAdvice(index) {
  const c=state.children[index], notes=[];
  if(state.children.length>1) notes.push(['Każde kolejne dziecko','Przygotuj dane nowego dziecka do 800+ i zgłoszenia do ubezpieczenia. Przy becikowym podaj aktualny skład rodziny i dane o dochodzie; urząd sprawdzi prawo do świadczenia dla tego dziecka.',byId('becikowe').source]);
  if(c.multiple) notes.push(['Poród mnogi','Przy jednym porodzie mnogim standardowy łączny urlop rodzicielski pracowników wynosi do 43 tygodni. Liczy się liczba dzieci z tego porodu. Przy becikowym kwota dotyczy każdego dziecka spełniającego warunki.',byId('urlop-rodzicielski').source]);
  if(state.children.length>=3) notes.push(['Karta Dużej Rodziny','Jeżeli rodzic ma lub miał na utrzymaniu co najmniej troje dzieci, warto sprawdzić Kartę Dużej Rodziny. Przygotuj dane członków rodziny i oświadczenie o władzy rodzicielskiej. Dla uczącego się pełnoletniego dziecka znaczenie ma planowana data zakończenia nauki.',kdrUrl]);
  return notes.map(([h,v,u])=>`<section class="family-note"><h3>${h}</h3><p>${v}</p><a href="${u}" target="_blank" rel="noopener">Warunki w urzędzie ↗</a></section>`).join('');
}
function childrenPage() {
  const c=state.children[state.active];
  return pageHeading('Twoja rodzina','Plany dzieci','Każde dziecko ma własne daty, sprawy i zapiski.')+childSwitch()+`<form id="child-edit" class="settings">
  <label class="field">Imię lub pseudonim<input name="childname" maxlength="40" value="${esc(c.name)}" placeholder="np. Maja"></label>
  <label><input type="checkbox" name="multiple" ${c.multiple?'checked':''}> To dziecko z ciąży mnogiej</label>
  <button class="button primary">Zapisz zmiany</button><a href="#sytuacja">Zmień etap lub datę dziecka</a></form>
  <details class="settings"><summary>Dodaj kolejne dziecko</summary><form id="child-add"><label class="field">Imię lub pseudonim (opcjonalnie)<input name="childname" maxlength="40"></label>
  <label class="field">Etap<select name="childstage"><option value="pregnancy">Ciąża</option><option value="birth">Po narodzinach</option></select></label>
  <label class="field"><span id="new-date-label">Przewidywany termin porodu</span><input type="date" name="childdate" min="1000-01-01" max="9999-12-31"></label>
  <label><input type="checkbox" name="multiple"> To dziecko z ciąży mnogiej</label><button class="button primary">Dodaj dziecko</button></form></details>${familyAdvice(state.active)}
  <div class="case-actions"><a class="button secondary" href="#raport">Raport do wydruku</a><a class="text-button" href="#dane">Usuń profil i dane dzieci</a></div>`;
}
function familyCaseHint(id, index) {
  const c=state.children[index];
  if(state.children.length<2 && !c.multiple)return '';
  const notes={
    '800-plus':'We wniosku sprawdź dane każdego dziecka, na które występujesz. Dodanie nowego profilu w Otuli nie zgłasza go do ZUS.',
    'becikowe':'Przy kolejnym dziecku uwzględnij aktualny skład rodziny przy obliczaniu dochodu na osobę. Przygotuj dane rodzeństwa i dokumenty zmian dochodu, jeśli dotyczy.',
    'ubezpieczenie-dziecka':'Nowo narodzone dziecko wymaga własnego zgłoszenia. Zgłoszenie starszego dziecka nie obejmuje rodzeństwa.',
    'urodzenie':'Każde dziecko ma osobny akt i PESEL. Przed zgłoszeniem sprawdź pisownię imion przypisanych każdemu z dzieci.',
    'urlop-rodzicielski':c.multiple?'Dla oznaczonego porodu mnogiego standardowa wspólna pula to do 43 tygodni.':'Starsze rodzeństwo z innego porodu nie zwiększa standardowego wymiaru urlopu za ten poród.',
    'rodzicielskie':c.multiple?'Przy bliźniętach podstawowy okres świadczenia wynosi 65 tygodni, przy trojaczkach 67. Kwota miesięczna dotyczy jednego świadczenia.':'Przy pojedynczym urodzeniu podstawowy okres to 52 tygodnie. Okres zależy od liczby dzieci przy tym porodzie.'
  };
  return notes[id]?`<p class="family-note"><b>W Twoim planie:</b> ${notes[id]}</p>`:'';
}
function careSources(t){return [{label:t.sourceLabel,url:t.source},...(t.extraSources||[])].map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ${icon('external',14)}</a>`).join('');}

const handbookShelves=[['before','Przygotowanie do porodu','sprout'],['first','Pierwsze dni z dzieckiem','heart'],['mother','Połóg i zdrowie mamy','flower'],['feeding','Karmienie','heart'],['sleep','Sen i ukojenie','flower'],['home','Opieka w domu','home'],['solids','Pierwsze posiłki','sprout'],['development','Rozwój i bliskość','heart']];
function handbookContents(query='', selected='all'){
 const words=familyWords(query);
 const matches=fields=>words.every(word=>normalize(fields.join(' ')).includes(word.slice(0,6)));
 const groups=handbookShelves.filter(([id])=>selected==='all'||id===selected).map(([section,label,glyph])=>{
   const items=CARE_TOPICS.filter(t=>t.section===section&&matches([label,t.title,t.intro,...t.keywords]));
   if(!items.length)return '';
   return `<section class="care-shelf"><div class="shelf-title">${icon(glyph,23)}<h2>${label}</h2></div>${items.map(t=>`<a href="#poradnik/${t.id}">${esc(t.title)}${icon('right',17)}</a>`).join('')}</section>`;
 });
 const docs=GUIDE.cases.filter(c=>(c.optional||['urodzenie','urlop-ojcowski','macierzynski'].includes(c.id))&&matches([c.title,c.id,c.meaning,c.institution,'dokumenty formalności']));
 if(docs.length && (selected==='all'||selected==='documents'))groups.push(`<section class="care-shelf document-shelf"><div class="shelf-title">${icon('files',23)}<h2>Dokumenty i sprawy rodziny</h2></div><div class="document-links">${docs.map(c=>`<a href="#sprawa/${c.id}">${esc(c.title)}${icon('right',17)}</a>`).join('')}</div></section>`);
 return groups.join('')||'<p>Brak takiego tematu. Spróbuj krótszego hasła albo <a href="#pomoc">zapytaj Otulę</a>.</p>';
}

function handbookReading(){
 return `<details class="settings reading-list"><summary>Książki, poradniki i artykuły do dalszej lektury</summary>
 <ul><li><strong>New Mother’s Guide to Breastfeeding</strong> · American Academy of Pediatrics, wyd. 3. Publicznie dostępny fragment pokazuje, jak ułożyć dłoń przy ręcznym odciąganiu mleka. <a target="_blank" rel="noopener noreferrer" href="https://www.healthychildren.org/English/ages-stages/baby/breastfeeding/Pages/hand-expressing-milk.aspx">Przeczytaj fragment po angielsku ↗</a></li>
 <li><strong>Caring for Your Baby and Young Child</strong> · American Academy of Pediatrics, wyd. 8. Na przykładzie wzroku autorzy pokazują, jak zmienia się to, co niemowlę dostrzega w pierwszych miesiącach. <a target="_blank" rel="noopener noreferrer" href="https://www.healthychildren.org/English/ages-stages/baby/Pages/Babys-Vision-Development.aspx">Otwórz adaptację rozdziału ↗</a></li>
 <li><strong>Maternal-Newborn Nursing</strong> · OpenStax. W otwartym rozdziale 20.3 opisano m.in. ocenę pęcherza i jelit oraz wspieranie mamy w połogu. <a target="_blank" rel="noopener noreferrer" href="https://openstax.org/books/maternal-newborn-nursing/pages/20-3-nursing-care-during-the-postpartum-period">Otwórz rozdział podręcznika ↗</a></li>
 <li><strong>Żywienie zdrowych niemowląt</strong> · stanowisko Polskiego Towarzystwa Gastroenterologii, Hepatologii i Żywienia Dzieci. Polski tekst o pierwszych posiłkach, konsystencji i produktach uzupełniających. <a target="_blank" rel="noopener noreferrer" href="https://ptghizd.pl/cm/uploads/2022/12/4337.pdf">Przeczytaj artykuł po polsku (PDF) ↗</a></li>
 <li><strong>ABC opieki okołoporodowej</strong> · Uniwersytet Medyczny w Lublinie, 2024. Polski poradnik o planie porodu, łagodzeniu bólu, opiece nad dzieckiem i połogu. <a target="_blank" rel="noopener noreferrer" href="https://redakcja.www.gov.pl/attachment/dd668a71-d036-43e4-92e4-6b6b850af137">Otwórz poradnik PDF ↗</a></li>
 <li><strong>Ciąża i okres okołoporodowy</strong> · magazyn „Ze Zdrowiem” NFZ, nr 18. Lektura przed porodem o świadczeniach, badaniach i wyborze miejsca porodu. <a target="_blank" rel="noopener noreferrer" href="https://www.nfz.gov.pl/gfx/nfz/userfiles/_public/dla_pacjenta/magazyn_ze_zdrowiem/ze_zdrowiem_nfz_nr_18.pdf">Pobierz poradnik NFZ ↗</a></li>
 <li><strong>Profilaktyka od pierwszych dni życia</strong> · Akademia NFZ. Zajrzyj tu przed wizytą położnej lub pediatry, kiedy chcesz zapytać o badania przesiewowe, szczepienia lub bilans. <a target="_blank" rel="noopener noreferrer" href="https://akademia.nfz.gov.pl/artykuly/profilaktyka-od-pierwszych-dni-zycia/">Przeczytaj artykuł NFZ ↗</a></li>
 <li><strong>Opieka nad mamą i noworodkiem po porodzie</strong> · wytyczne WHO z 2022 r. Publikacja po angielsku omawia pierwsze sześć tygodni, w tym zdrowie fizyczne i psychiczne mamy oraz wsparcie rodziny. <a target="_blank" rel="noopener noreferrer" href="https://www.who.int/publications/i/item/9789240045989">Zobacz publikację WHO ↗</a></li></ul></details>`;
}

const dailyCategories={dom:'W domu',wyjscia:'Wyjścia i wizyty',razem:'Wspólna opieka',sprawy:'Sprawy i notatki'};

function dailyActivities(){
 const child=state.children[state.active];
 const guides=[['glod-i-sytosc','Karmienie','heart'],['skora-pod-pieluszka','Przewijanie','leaf'],['kapiel','Kąpiel','drop'],['bezpieczny-sen','Sen','moon']];
 return `<section class="daily-guides" aria-labelledby="care-shortcuts"><h2 id="care-shortcuts">Opieka krok po kroku</h2>
 <div class="daily-shortcuts">${guides.map(([id,title,glyph])=>`<a href="#poradnik/${id}"><span class="care-symbol">${icon(glyph,21)}</span>${title}${icon('right',15)}</a>`).join('')}</div></section>
 <details class="daily-ideas" id="daily-ideas" open><summary>Rodzinne sposoby na co dzień ${icon('chevron',20)}</summary>
 <div class="daily-controls">${childSwitch(true)}<label>Pokaż pomysły<select id="daily-category"><option value="all">Wszystkie</option>${Object.entries(dailyCategories).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label></div>
 <div class="daily-cards">${tips.map(([id,title,body,category])=>`<article class="daily-card" data-tip-category="${category}">
 <h3>${title}</h3><p>${body}</p><label><input type="checkbox" data-tip="${id}" aria-label="Wypróbowane — ${esc(title)}" ${child.checks.includes(id)?'checked':''}> Wypróbowane</label></article>`).join('')}</div></details>
 <section class="daily-note"><h2>Notatka do raportu</h2><label class="field">Co chcesz zapamiętać przed wizytą?<textarea id="child-note" maxlength="600" rows="3">${esc(child.note)}</textarea></label><a class="inside-link" href="#raport">${icon('file',16)} Otwórz raport rodzinny</a></section>`;
}

function handbook(r){
 const topic=CARE_TOPICS.find(t=>t.id===r.id);
 const fromDaily=previousHash()==='#poradnik/codzienne-czynnosci';
 if(topic)return `<a class="back-link" href="${fromDaily?'#poradnik/codzienne-czynnosci':'#poradnik'}">${icon('back',17)} ${fromDaily?'Codzienne czynności':'Podręcznik rodzica'}</a><article class="care-article">${pageHeading('Podręcznik rodzica',esc(topic.title),esc(topic.intro))}<section class="care-steps"><h2>Co możesz zrobić</h2><ol>${topic.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section><aside class="care-alert">${icon('heart',21)}<div><h2>O czym pamiętać</h2><p>${esc(topic.alert)}</p></div></aside><section class="source-box"><h3>Źródła</h3>${careSources(topic)}</section><a class="button primary" href="#pomoc/${topic.id}">${icon('chat',17)} Zapytaj AI o ten temat</a></article>`;
 const daily=r.id==='codzienne-czynnosci';
 const tabs=`<nav class="handbook-views" aria-label="Widoki podręcznika"><a href="#poradnik" ${daily?'':'aria-current="page"'}>${icon('book',17)} Tematy poradnika</a><a href="#poradnik/codzienne-czynnosci" ${daily?'aria-current="page"':''}>${icon('sun',18)} Codzienne czynności</a></nav>`;
 if(daily)return `<header class="reader-hero daily-hero"><div><div class="small-label">Podręcznik rodzica</div><h1 tabindex="-1">Codzienne czynności</h1><p>Wybierz pomoc przy karmieniu, przewijaniu, kąpieli lub śnie.</p></div><div class="daily-art" aria-hidden="true"></div></header>${tabs}${dailyActivities()}`;
 return `<header class="reader-hero"><div><div class="small-label">Od ciąży przez pierwszy rok dziecka</div><h1 tabindex="-1">Podręcznik rodzica</h1><p>Przygotowania do porodu, zdrowie mamy oraz karmienie, zabawa i rozwój dziecka w pierwszym roku.</p></div><div class="reader-art" aria-hidden="true"></div></header>${tabs}
 <div class="handbook-finder"><label class="search-box">${icon('search')}<input id="handbook-search" type="search" aria-label="Znajdź temat w podręczniku" placeholder="Szukaj tematu, np. połóg, pępek, paszport"></label><label class="shelf-choice">Dział<select id="handbook-section"><option value="all">Wszystkie działy</option>${handbookShelves.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}<option value="documents">Dokumenty i sprawy rodziny</option></select></label></div>
 ${handbookReading()}<div class="care-shelves" id="handbook-contents" aria-live="polite">${handbookContents()}</div>`;
}
function reportPage(){
  snapshotChild();
  return pageHeading('Twój plan','Raport dla rodziny',fmt(today()))+`<section class="export-panel no-print"><span class="export-emblem">${icon('files',32)}</span><div><h2>Zabierz plan ze sobą</h2><p>Terminy, dokumenty, koszty i Twoje notatki dla każdego dziecka.</p><div class="export-actions"><button type="button" class="button primary" data-export-report="pdf">${icon('download',17)} Pobierz PDF</button><button type="button" class="button secondary" data-export-report="docx">${icon('file',17)} Pobierz Word (.docx)</button><button class="text-button" data-action="print-family">Drukuj</button></div></div></section><div data-report-content><p>Rola: ${GUIDE.roles[role()].label} · ${GUIDE.work[state.work]}</p>`+
  state.children.map((c,i)=>`<section class="report-child"><h2>${esc(childLabel(i))}</h2><p>${GUIDE.stages[c.stage]} · ${c.stage==='birth'?'Data urodzenia':'Termin porodu'}: ${c.date?fmt(parseDate(c.date)):'nie podano'}</p>${familyAdvice(i)}
  ${GUIDE.cases.filter(item=>fits(item,false,c.stage,c)).map(item=>{const date=c.date&&item.due&&dueDate(item,parseDate(c.date));return `<section class="report-case"><h3>${c.done.includes(item.id)?'✓ Gotowe':'□ Do zrobienia'} · ${item.title}</h3><p>${item.meaning}</p><p><b>Korzyść</b> · ${item.benefit}</p><p><b>Koszt</b> · ${item.cost}</p><p><b>Kiedy:</b> ${item.timing}${date?' Orientacyjnie: '+fmt(date)+'.':''}</p>${familyCaseHint(item.id,i)}<p><b>Dokumenty:</b> ${item.docs.join('; ')}.</p><ol>${item.steps.map(v=>'<li>'+v+'</li>').join('')}</ol><p><b>Kontakt:</b> ${caseAnswers[item.id].contact} · <a href="${item.source}">Instrukcja urzędowa</a>${item.valueSource && item.valueSource!==item.source ? ` · <a href="${item.valueSource}">Źródło informacji o kosztach lub uprawnieniu</a>` : ''}</p></section>`}).join('')}
  ${c.events.length?'<h3>Własne terminy</h3><ul>'+c.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>'<li>'+fmt(parseDate(e.date))+' '+esc(e.time)+' — '+esc(e.title)+(e.done?' (gotowe)':'')+(e.note?': '+esc(e.note):'')+'</li>').join('')+'</ul>':''}${c.note?'<p><b>Obserwacje opiekuna:</b> '+esc(c.note)+'</p>':''}${c.checks.length?'<p><b>Wypróbowane:</b> '+tips.filter(t=>c.checks.includes(t[0])).map(t=>t[1]).join(', ')+'</p>':''}</section>`).join('')+'</div>';
}
const starterQuestions=[
  ['paszport-dziecka','Jakie dokumenty przygotować do paszportu dziecka?'],
  ['dowod-dziecka','Ile kosztuje dowód osobisty dziecka?'],
  ['odpis-urodzenia','Gdzie zamówić odpis aktu urodzenia?'],
  ['polozna-poz','Jak wybrać położną POZ?'],
  ['urlop-ojcowski','Co przygotować do urlopu ojcowskiego?'],
  ['pielegnacja-krocza','Jak dbać o krocze po porodzie?']
];
function helpPage(r){
 const topic=CARE_TOPICS.find(t=>t.id===r.id),item=byId(r.id);
 const seed=topic? topic.title : item?`Co daje mi ta sprawa i ile kosztuje: ${item.title}?`:'';
 return `<header class="ask-hero"><div><div class="small-label">Asystent rodzica</div><h1 tabindex="-1">Zapytaj Otulę</h1><p>O sprawy w urzędzie i o codzienność z dzieckiem.</p></div><div class="ask-art" aria-hidden="true"></div></header>
 <form class="ask-panel" id="assistant-form"><label for="help-search">Twoje pytanie</label><div class="ask-field">${icon('chat',21)}<input type="search" id="help-search" data-context="${esc(r.id||'')}" ${topic||item?'data-context-locked="true"':''} maxlength="480" value="${esc(seed)}" placeholder="Np. po czym poznam, że dziecko jest głodne?" required></div>
 <div class="ask-actions"><button type="submit" id="ask-ai" class="button primary">${icon('chat',17)} Zapytaj AI</button><button type="button" id="ask-cancel" class="button secondary" hidden>Przerwij</button></div>
 <p class="privacy-line">Po kliknięciu wyślemy pytanie i temat sprawy do asystenta korzystającego z OpenRouter. Imiona, daty i profil rodziny nie są dołączane. Nie wpisuj danych osobowych. Otula dobiera źródła urzędowe i medyczne; AI może się pomylić.</p></form>
 <div class="starter-list" aria-label="Przykładowe pytania">${starterQuestions.map(([,q],i)=>`<button type="button" data-question="${i}">${esc(q)} ${icon('arrow',14)}</button>`).join('')}</div>
 <section id="ai-result" class="answer-panel" aria-live="polite" hidden></section><div id="help-result">${seed?answerSearch(seed,r.id):''}</div>`;
}

function answerSearch(q,id){
 const care=id?CARE_TOPICS.find(t=>t.id===id):matchingCare(q,CARE_TOPICS)[0];
 if(care){
   const urgent=care.id.startsWith('pilna-pomoc');
   const alert=`<aside class="inline-care-alert"><strong>${urgent?'Pilna pomoc':'Kiedy zareagować'}</strong><p>${esc(care.alert)}</p></aside>`;
   return `<section class="instant-answer"><div class="small-label">${icon('book',15)} Z podręcznika rodzica</div><h2>${esc(care.title)}</h2>${urgent?alert:''}<p>${esc(care.intro)}</p>${!urgent?alert:''}<a class="inside-link" href="#poradnik/${care.id}">Cała instrukcja w Otuli ${icon('arrow',16)}</a><div class="article-links">${careSources(care)}</div></section>`;
 }
 const words=familyWords(q);
 const matches= id&&byId(id)?[byId(id)]:GUIDE.cases.map(c=>{
   const title=familyWords(c.title+' '+c.id),extra=familyWords(c.meaning+' '+c.short);
   const score=words.reduce((n,w)=>n+(title.some(t=>t===w||(t.length>=5&&w.length>=5&&t.slice(0,5)===w.slice(0,5)))?5:extra.includes(w)?1:0),0);
   return {c,score};
 }).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score).slice(0,2).map(x=>x.c);
 const intent=normalize(q);
 const detail=c=>{
   if(/ile koszt|oplat|jaki koszt/.test(intent))return '<p><strong>Koszt</strong> · '+esc(c.cost)+'</p>';
   if(/przygotow|jakie dokument/.test(intent))return '<h3>Co przygotować</h3><ul>'+c.docs.map(d=>'<li>'+esc(d)+'</li>').join('')+'</ul>';
   if(/gdzie|jak wybrac/.test(intent))return '<p>'+esc(c.steps[0])+'</p>';
   return '<p><strong>Korzyść</strong> · '+esc(c.benefit)+'</p>';
 };
 return matches.map(c=>`<section class="instant-answer"><div class="small-label">${icon('file',15)} Karta sprawy</div><h2>${esc(c.title)}</h2><p>${esc(c.meaning)}</p>${detail(c)}<a class="inside-link" href="#sprawa/${c.id}">Koszt, dokumenty i kolejne kroki ${icon('arrow',16)}</a></section>`).join('');
}
async function inviteFamily(){
  try {
    if(navigator.share){await navigator.share({title:'Otula dla rodziny',url:publicOtula});return;}
    await navigator.clipboard.writeText(publicOtula);announce('Skopiowano link do Otuli.');
  }catch(error){
    if(error.name==='AbortError')return;
    document.querySelector('#invite-link').innerHTML='<a href="'+publicOtula+'">Link do skopiowania: '+publicOtula+'</a>';
  }
}

let currentAsk;
function clearAssistant(){
 currentAsk?.abort();currentAsk=undefined;
 const out=document.querySelector('#ai-result');
 if(out){out.hidden=true;out.replaceChildren();out.removeAttribute('aria-busy');}
 const button=document.querySelector('#ask-ai');if(button)button.disabled=false;
 const cancel=document.querySelector('#ask-cancel');if(cancel)cancel.hidden=true;
}

function sourceLinks(out,items){
 const used=new Set();
 for(const item of items||[]){
   let url;try{url=new URL(item.url);}catch{continue;}
   if(url.protocol!=='https:'||used.has(url.href))continue;
   used.add(url.href);
   const a=document.createElement('a');a.className='web-result';a.target='_blank';a.rel='noopener noreferrer';a.href=url.href;
   const label=document.createElement('strong'),host=document.createElement('small');label.textContent=item.title||url.hostname;host.textContent=url.hostname+' ↗';a.append(label,host);
   if(item.snippet){const snippet=document.createElement('p');snippet.textContent=item.snippet;a.append(snippet);}
   out.append(a);
 }
}
function showOnline(out,result){
 const heading=document.createElement('h2');heading.textContent=result.results?.length?'Źródła do Twojego pytania':'Wyszukiwanie źródeł';out.append(heading);
 const lead=document.createElement('p');lead.textContent=result.message||(result.results?.length?'Otwórz publikację, aby przeczytać ją w całości.':result.available?'Brak pasującego źródła. Spróbuj nazwy objawu, dokumentu lub świadczenia.':'Wyszukiwanie jest chwilowo niedostępne. Spróbuj ponownie za chwilę.');out.append(lead);
 sourceLinks(out,result.results);
}
async function queryAssistant(question,signal,context){
 const r=await fetch('https://otula-pytania-rodzicow.etherealdaffodil4.chatgpt.site/ask',{method:'POST',signal,credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context})});
 const result=await r.json();
 if(!r.ok){const error=new Error(result.error||'Usługa jest chwilowo niedostępna.');error.status=r.status;throw error;}
 return result;
}

async function searchGovFromDevice(query,signal){
 const endpoint=new URL('https://www.gov.pl/api/data/search');
 endpoint.searchParams.set('query',query);endpoint.searchParams.set('size','12');
 const control=new AbortController(),stop=()=>control.abort();
 if(signal.aborted)stop();else signal.addEventListener('abort',stop,{once:true});
 const timer=setTimeout(stop,8500);
 try{
  const r=await fetch(endpoint,{credentials:'omit',referrerPolicy:'no-referrer',signal:control.signal});
  if(!r.ok)throw Error('gov.pl');
  const data=await r.json();if(!Array.isArray(data.results))throw Error('results');
  return data.results.slice(0,16).map(v=>officialResult(endpoint.origin,v.url,v.title,v.intro)).filter(Boolean);
 }finally{clearTimeout(timer);signal.removeEventListener('abort',stop);}
}

async function askOtula(){
 const field=document.querySelector('#help-search'),out=document.querySelector('#ai-result');if(!field||!out)return;
 const q=field.value.trim();clearAssistant();
 out.hidden=false;
 if(q.length<3||/@|\d[\s-]*(?:\d[\s-]*){8}|sk-or-/i.test(q)){out.textContent='Wpisz pytanie bez numerów dokumentów i danych kontaktowych.';field.focus();return;}
 if(urgentQuestion(q)){out.textContent=urgentAdvice;return;}
 const controller=new AbortController();currentAsk=controller;
 document.querySelector('#ask-ai').disabled=true;
 document.querySelector('#ask-cancel').hidden=false;
 out.setAttribute('aria-busy','true');out.textContent='Dobieram i odczytuję źródła. Odpowiedź może potrwać do minuty…';
 let timedOut=false;
 const timeout=setTimeout(()=>{timedOut=true;controller.abort();},57000);
 try{
  const result=await queryAssistant(q,controller.signal,field.dataset.context);
  if(result.mode==='web' && result.kind==='official' && !result.results?.length){
    const query=officialQuery(q);
    if(query){const hits=await searchGovFromDevice(query,controller.signal).catch(()=>[]);result.results=rankedOfficialResults(query,[hits]);}
  }
  if(currentAsk!==controller)return;
  out.replaceChildren();
  if(result.mode==='web'){showOnline(out,result);return;}
  const excerpts=result.mode==='extracts';
  if(result.mode!=='ai'&&!excerpts){out.textContent=result.error||result.message||'Usługa jest niedostępna.';sourceLinks(out,result.sources);return;}
  const heading=document.createElement('h2');heading.textContent=excerpts?'Fragmenty ze źródeł':'Odpowiedź AI';out.append(heading);
  if(!excerpts){const note=document.createElement('p');note.className='answer-caution';note.textContent='AI może się pomylić. Porównaj odpowiedź z cytatem i warunkami w źródle. To informacja, nie decyzja o świadczeniu ani diagnoza.';out.append(note);}
  if(excerpts){const note=document.createElement('p');note.textContent=result.message;out.append(note);}
  for(const fact of result.facts){
    const src=result.sources[fact.ref-1],section=document.createElement('div'),link=document.createElement('a'),quote=document.createElement('blockquote');
    section.className='answer-fact';quote.textContent=fact.quote;link.href=src.url;link.rel='noopener noreferrer';link.target='_blank';link.textContent=new URL(src.url).hostname+' ↗';
    if(excerpts){section.append(quote,link);}else{
      const p=document.createElement('p'),detail=document.createElement('details'),summary=document.createElement('summary');
      p.textContent=fact.text;summary.textContent='Zobacz cytat';detail.append(summary,quote);section.append(p,link,detail);
    }
    out.append(section);
  }
  const stamp=document.createElement('small');stamp.textContent='Odczyt źródeł '+new Date(result.checked).toLocaleString('pl-PL');out.append(stamp);
  if(result.reading?.length){const h=document.createElement('h3');h.textContent='Do dalszej lektury';out.append(h);sourceLinks(out,result.reading);}
 }catch(error){if(currentAsk===controller){out.textContent=timedOut?'Odpowiedź trwała zbyt długo. Twoje pytanie pozostało w polu — spróbuj ponownie lub skorzystaj z kart poniżej.':error.status===429?'Osiągnięto chwilowy limit pytań. Spróbuj ponownie za minutę.':error.status?error.message:'Nie udało się połączyć. Sprawdź internet; pytanie pozostało w polu. Możesz skorzystać z kart poniżej.';}}
 finally{clearTimeout(timeout);if(currentAsk===controller){out.removeAttribute('aria-busy');const button=document.querySelector('#ask-ai');if(button)button.disabled=false;const cancel=document.querySelector('#ask-cancel');if(cancel)cancel.hidden=true;}}
}
window.addEventListener('hashchange',clearAssistant);
document.addEventListener('input',e=>{if(e.target.id==='help-search')clearAssistant();});
document.addEventListener('click',e=>{if(e.target.closest('[data-question]'))clearAssistant();if(e.target.closest('#ask-cancel')){clearAssistant();const out=document.querySelector('#ai-result');if(out){out.hidden=false;out.textContent='Przerwano oczekiwanie. Pytanie pozostało w polu.';}document.querySelector('#help-search')?.focus();}});
document.addEventListener('submit',e=>{if(e.target.id==='assistant-form'){e.preventDefault();askOtula();}});
