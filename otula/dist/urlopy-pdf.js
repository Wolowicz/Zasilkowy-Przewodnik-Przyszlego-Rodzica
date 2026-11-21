/* Pisma pracownicze do pracodawcy, lokalnie; nie są drukami ZUS ani e-podpisem. */
(function(root){
 'use strict';
 const TITLES={maternity:'Wniosek dotyczący urlopu macierzyńskiego',parental:'Wniosek o urlop rodzicielski',paternity:'Wniosek o urlop ojcowski',childcare:'Wniosek o urlop wychowawczy',loss:'Wniosek dotyczący urlopu macierzyńskiego po stracie'};
 const SOURCES={regulation:'https://eli.gov.pl/eli/DU/2025/322/ogl',maternity:'https://www.gov.pl/web/rodzina/urlop-macierzynski',parental:'https://www.gov.pl/web/rodzina/urlop-rodzicielski',paternity:'https://www.gov.pl/web/rodzina/urlop-ojcowski',childcare:'https://www.gov.pl/web/rodzina/urlop-wychowawczy',loss:'https://www.gov.pl/web/rodzina/latwiejszy-dostep-do-swiadczen-po-stracie-ciazy'};
 const PROOFS={medical:'Zaświadczenie wystawione przez uprawnionego lekarza lub położną',record:'Akt urodzenia z adnotacją o martwym urodzeniu',death:'Dokument potwierdzający zgon po urodzeniu'};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const str=v=>String(v??'').trim();
 const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&+v.slice(0,4)>=1900&&+v.slice(0,4)<2200&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 const fmt=v=>date(v)?v.split('-').reverse().join('.'):'';
 const days=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000)+1;
 const range=d=>fmt(d.from)+'–'+fmt(d.to);
 const num=v=>v!==''&&v!=null&&Number.isFinite(Number(v));
 function normalize(ctx={}){
  const a=ctx.answers||{},r=ctx.result?.pdfContext||{};let kind=ctx.kind||ctx.letterType||r.kind||r.letterType||'maternity';
  if(ctx.reason==='loss'||['loss','childDeath'].includes(a.event))kind='loss';
  const p=(ctx.periods||r.periods||[]).find(p=>p.kind===kind||(kind==='loss'&&p.kind==='maternity'))||{};
  const parts=a.parentalParts||ctx.parentalParts||r.parentalParts||[],work=a.workPeriods||ctx.workPeriods||r.workPeriods||[];
  const previous=a.previousParental==='no'?{usedParts:'0',usedPeriods:'Nie korzystaliśmy'}:parts.length?{usedParts:String(parts.length),usedPeriods:parts.map(x=>(x.parent==='other'?'Drugi rodzic':'Ta osoba')+': '+range(x)).join('\n')}:{};
  const extended=work.filter(x=>x.extended==='yes');
  return {kind,event:a.event||ctx.event||'birth',from:p.from||p.start||'',to:p.to||p.end||'',eventDate:a.eventDate||'',childDob:a.childDob||(a.event==='birth'?a.eventDate:'')||'',proof:a.lossDocument==='act'?(a.event==='childDeath'?'death':'record'):(PROOFS[a.lossDocument]?a.lossDocument:''),applicationDate:a.applicationDate||'',workPeriods:work.map(p=>({...p})),...(kind==='parental'?previous:{}),usedDays:a.paternityUsedDays??'',combine:['yes','no'].includes(a.workDuringParental)?a.workDuringParental:'',extendedWork:extended.length?'yes':'',extendedFraction:extended.length&&extended.every(x=>Number(x.fraction)===Number(extended[0].fraction))?extended[0].fraction:''};
 }
 function validate(d){const e=[];
  if(!TITLES[d.kind])e.push('Wybierz rodzaj wniosku.');
  if(!str(d.employee)||!str(d.employer))e.push('Podaj imię i nazwisko oraz pracodawcę.');
  if(!d.employed)e.push('Potwierdź, że wniosek dotyczy Twojego zatrudnienia na umowę o pracę.');
  if(!date(d.applicationDate))e.push('Podaj datę wniosku.');
  if(!date(d.from)||!date(d.to)||d.from>d.to)e.push('Sprawdź daty urlopu od–do.');
  if(d.kind==='loss'){
   if(!date(d.eventDate))e.push('Podaj datę wskazaną w dokumencie potwierdzającym stratę.');
   if(!PROOFS[d.proof])e.push('Wybierz dokument potwierdzający stratę.');
   if(d.event==='childDeath'&&d.proof!=='death')e.push('Dla zgonu po urodzeniu wybierz dokument potwierdzający zgon.');
   if(!d.periodConfirmed)e.push('Potwierdź okres po stracie zgodny z Twoją sytuacją i dokumentami.');
  } else if(d.kind==='maternity'&&d.event==='pregnancy'){
   if(!date(d.eventDate))e.push('Podaj przewidywany termin porodu z zaświadczenia.');
  } else if(!str(d.children))e.push('Podaj dane dziecka lub dzieci potrzebne do wniosku.');
  if(d.kind==='maternity'&&['adoption','foster','transfer'].includes(d.event)&&!str(d.specialDetails))e.push('Uzupełnij potwierdzony tryb, daty i dokumenty przejęcia lub przyjęcia dziecka.');
  if(['parental','childcare'].includes(d.kind)){
   if(!Number.isInteger(Number(d.usedParts))||!num(d.usedParts)||+d.usedParts<0||+d.usedParts>4)e.push('Podaj liczbę wykorzystanych części od 0 do 4; pięć części zamyka zwykłą pulę.');
   if(!str(d.usedPeriods))e.push('Wpisz wykorzystane okresy obojga rodziców albo wyraźnie „Nie korzystaliśmy”.');
   if(!['no','yes',...(d.kind==='childcare'?['exception']:[])].includes(d.otherUse))e.push('Odpowiedz, czy drugi rodzic korzysta w tym samym czasie.');
   if(d.otherUse==='yes'&&!str(d.otherPeriods))e.push('Podaj okres korzystania przez drugiego rodzica.');
   if(d.otherUse==='exception'&&!str(d.exception))e.push('Podaj podstawę wyjątku i dokument lub oświadczenie dołączane do wniosku.');
  }
  if(d.kind==='parental'){
   if(!['yes','no'].includes(d.combine))e.push('Odpowiedz, czy łączysz ten urlop z pracą u tego pracodawcy.');
   if(d.combine==='yes'){
    if(!d.workPeriods?.length)e.push('Dodaj okres pracy podczas rodzicielskiego.');
    for(const p of d.workPeriods||[])if(!date(p.from)||!date(p.to)||p.from>p.to||!(+p.fraction>0&&+p.fraction<=.5))e.push('Sprawdź okres pracy i wymiar większy od 0, maksymalnie 1/2 etatu.');
    if(!['yes','no'].includes(d.extendedWork))e.push('Odpowiedz, czy pracujesz także w wydłużonej części urlopu.');
    if(d.extendedWork==='yes'&&!(+d.extendedFraction>0&&+d.extendedFraction<=.5))e.push('Podaj wymiar pracy w wydłużonej części, do 1/2 etatu.');
    if(d.workPeriods?.some(p=>p.from<d.from||p.to>d.to))e.push('Okresy pracy muszą mieścić się w okresie tego wniosku.');
    const sorted=[...(d.workPeriods||[])].sort((a,b)=>a.from.localeCompare(b.from));if(sorted.some((p,i)=>i&&p.from<=sorted[i-1].to))e.push('Okresy pracy nie mogą się nakładać.');
   }
  }
  if(d.kind==='paternity'){
   if(!num(d.usedDays)||![0,7,14].includes(+d.usedDays))e.push('Podaj wykorzystane dni ojcowskiego: 0, 7 lub 14, także u innych pracodawców.');
   if(date(d.from)&&date(d.to)&&(![7,14].includes(days(d.from,d.to))||days(d.from,d.to)+Number(d.usedDays)>14))e.push('Ojcowski ma łącznie 14 dni, w całości albo w dwóch częściach po 7 dni.');
   if(+d.usedDays>0&&!str(d.usedPeriods))e.push('Podaj wcześniejszy okres ojcowskiego i pracodawcę.');
  }
  if(d.kind==='childcare'&&!d.employmentSixMonths)e.push('Potwierdź co najmniej 6 miesięcy zatrudnienia, także u poprzednich pracodawców.');
  if(!['attached','held'].includes(d.documentStatus))e.push('Wskaż, czy dołączasz dokumenty, czy są już w aktach pracodawcy.');
  if(!str(d.documents))e.push('Wymień dokumenty, które dołączasz lub które są już w aktach.');
  if(!d.reviewed)e.push('Sprawdź dane i potwierdź treść przed pobraniem.');
  for(const v of Object.values(d))if(typeof v==='string'&&v.length>4000)e.push('Skróć pojedyncze pole do 4000 znaków.');
  return [...new Set(e)];
 }
 function paragraphs(d){
  const lines=[{text:TITLES[d.kind],heading:true},{text:'Pracownik: '+str(d.employee)},{text:'Do: '+str(d.employer)},{text:(str(d.place)?str(d.place)+', ':'')+fmt(d.applicationDate)}];
  let request='Proszę o udzielenie urlopu '+({maternity:['adoption','foster'].includes(d.event)?'na warunkach urlopu macierzyńskiego':'macierzyńskiego',parental:'rodzicielskiego',paternity:'ojcowskiego',childcare:'wychowawczego',loss:'macierzyńskiego po stracie'}[d.kind])+' w okresie '+range(d)+'.';
  lines.push({text:request});
  if(d.kind==='loss'){lines.push({text:'Data wskazana w dokumencie potwierdzającym stratę: '+fmt(d.eventDate)+'.'},{text:'Dokument potwierdzający: '+PROOFS[d.proof]+'.'});}
  else if(d.kind==='maternity'&&d.event==='pregnancy')lines.push({text:'Przewidywany termin porodu potwierdzony zaświadczeniem: '+fmt(d.eventDate)+'.'});
  else lines.push({text:'Dziecko / dzieci, których dotyczy wniosek: '+str(d.children)});
  if(d.kind==='maternity'&&str(d.specialDetails))lines.push({text:'Okoliczności i dokumenty: '+str(d.specialDetails)});
  if(['parental','childcare'].includes(d.kind)){
   lines.push({text:'Dotychczas wykorzystane okresy urlopu'+(d.kind==='parental'?' lub zasiłku za ten okres':'')+' przez oboje rodziców / opiekunów: '+str(d.usedPeriods)},{text:'Łączna liczba wykorzystanych części: '+d.usedParts+'.'});
   lines.push({text:d.otherUse==='no'?'Oświadczam, że drugi rodzic / opiekun nie zamierza korzystać z '+(d.kind==='parental'?'urlopu rodzicielskiego ani zasiłku za ten okres':'urlopu wychowawczego')+' w okresie objętym tym wnioskiem.':d.otherUse==='yes'?'Oświadczam, że drugi rodzic / opiekun zamierza korzystać z '+(d.kind==='parental'?'urlopu rodzicielskiego lub zasiłku za ten okres':'urlopu wychowawczego')+' w następujących okresach objętych wnioskiem: '+str(d.otherPeriods):'Podstawa braku oświadczenia dotyczącego drugiego rodzica / opiekuna: '+str(d.exception)});
  }
  if(d.kind==='parental'&&d.combine==='yes'){
   lines.push({text:'Wniosek o łączenie urlopu rodzicielskiego z pracą',heading:true},{text:'Proszę o łączenie tego urlopu z wykonywaniem pracy u pracodawcy udzielającego urlopu w następujących okresach i wymiarach:'});
   for(const p of d.workPeriods)lines.push({text:range(p)+' — '+Number(p.fraction)+' pełnego etatu.'});
   lines.push({text:d.extendedWork==='yes'?'Oświadczam, że zamierzam łączyć część urlopu powstałą w wyniku proporcjonalnego wydłużenia z pracą w wymiarze '+Number(d.extendedFraction)+' pełnego etatu.':'Oświadczam, że nie zamierzam łączyć części urlopu powstałej w wyniku proporcjonalnego wydłużenia z wykonywaniem pracy.'});
  }
  if(d.kind==='paternity')lines.push({text:+d.usedDays===0?'Oświadczam, że nie korzystałem dotychczas z urlopu ojcowskiego na to dziecko, także u innego pracodawcy.':'Oświadczam, że wykorzystałem '+d.usedDays+' dni urlopu ojcowskiego na to dziecko. Okres i pracodawca: '+str(d.usedPeriods)});
  if(d.kind==='childcare')lines.push({text:'Potwierdzam co najmniej 6 miesięcy zatrudnienia z uwzględnieniem poprzednich okresów zatrudnienia.'});
  lines.push({text:d.documentStatus==='held'?'Dokumenty znajdujące się już w aktach osobowych pracodawcy:':'Dokumenty dołączane do wniosku:',heading:true},{text:str(d.documents)},{text:'Proszę o potwierdzenie przyjęcia wniosku. Dziękuję.'},{text:'........................................................\nPodpis pracownika / pracownicy'});
  return lines;
 }
 async function generatePdf(d,libraries){const errors=validate(d);if(errors.length)throw Error(errors.join('\n'));const {jsPDF,font}=libraries||await root.OtulaWniosek.loadLibraries();const doc=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});doc.addFileToVFS('OtulaSans.ttf',font);doc.addFont('OtulaSans.ttf','OtulaSans','normal');doc.setFont('OtulaSans');doc.setTextColor(45,35,38);doc.setProperties({title:TITLES[d.kind],subject:'Pismo do pracodawcy przygotowane lokalnie do sprawdzenia i podpisu',creator:'Otula',author:''});let y=54;const width=487;
  for(const p of paragraphs(d)){const size=p.heading?15:11;doc.setFontSize(size);const wrapped=doc.splitTextToSize(p.text,width);for(const line of wrapped){if(y+size*1.5>780){doc.addPage();y=54;}doc.text(line,54,y);y+=size*1.45;}y+=p.heading?14:12;}
  return new Uint8Array(doc.output('arraybuffer'));
 }
 function render(container,ctx={}){
  const d=normalize(ctx);if(!TITLES[d.kind])d.kind='maternity';const loss=d.kind==='loss';
  const field=(name,title,value='',type='text')=>'<label class="field"><span>'+esc(title)+'</span><input name="'+name+'" type="'+type+'" value="'+esc(value)+'"'+(type==='date'?' min="1900-01-01" max="2199-12-31"':' maxlength="4000"')+'></label>';
  const area=(name,title,value='')=>'<label class="field"><span>'+esc(title)+'</span><textarea name="'+name+'" rows="3" maxlength="4000">'+esc(value)+'</textarea></label>';
  const select=(name,title,options,value='')=>'<label class="field"><span>'+esc(title)+'</span><select name="'+name+'">'+[['','Wybierz'],...options].map(([v,l])=>'<option value="'+esc(v)+'"'+(v===value?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label>';
  const check=(name,title)=>'<div class="zus-review"><label><input type="checkbox" name="'+name+'"><span>'+esc(title)+'</span></label></div>';
  container.innerHTML='<section class="zus-page wywiad-page"><button type="button" class="button secondary" data-back>Wróć do: wyniku</button><nav class="breadcrumbs" aria-label="Ścieżka"><a href="#start">Start</a><span> / </span><a href="#moja-sprawa/wynik">Wynik</a><span> / Pismo do pracodawcy</span></nav><header class="page-intro"><p class="small-label">Pismo do pracodawcy</p><h1>'+esc({maternity:"Urlop macierzyński",parental:"Urlop rodzicielski",paternity:"Urlop ojcowski",childcare:"Urlop wychowawczy",loss:"Urlop po stracie"}[d.kind])+'</h1><p>Dane służą tylko temu PDF-owi i nie zapisują się w profilu.</p></header><form class="zus-result wywiad-question"><fieldset class="zus-fields"><legend>Ty i pracodawca</legend>'+field('employee','Twoje imię i nazwisko')+field('employer','Nazwa i adres pracodawcy')+field('place','Miejscowość (opcjonalnie)')+field('applicationDate','Data wniosku',d.applicationDate,'date')+'</fieldset>'+check('employed','To wniosek dotyczący mojego zatrudnienia na umowę o pracę.')+'<fieldset class="zus-fields"><legend>Okres wniosku</legend>'+field('from','Od',d.from,'date')+field('to','Do',d.to,'date')+'</fieldset>'+(loss?'<fieldset class="zus-fields"><legend>Potwierdzenie straty</legend>'+field('eventDate','Data z dokumentu potwierdzającego stratę',d.eventDate,'date')+select('proof','Dokument',Object.entries(PROOFS),d.proof)+'</fieldset>'+check('periodConfirmed','Sprawdziłam okres urlopu właściwy dla mojej sytuacji i dokumentów.')+'<p class="wywiad-help">Przy zgonie po urodzeniu i porodzie mnogim okres wymaga odrębnego ustalenia; nie wpisujemy automatycznie 8 tygodni.</p>':d.kind==='maternity'&&d.event==='pregnancy'?field('eventDate','Przewidywany termin porodu',d.eventDate,'date'):area('children','Imię i nazwisko oraz data urodzenia dziecka / dzieci'))+(d.kind==='maternity'&&['adoption','foster','transfer'].includes(d.event)?area('specialDetails','Tryb, daty i dokumenty przyjęcia lub przejęcia opieki'):'')+(['parental','childcare'].includes(d.kind)?'<fieldset class="zus-fields"><legend>Wykorzystane części</legend>'+field('usedParts','Liczba wykorzystanych części przez oboje rodziców / opiekunów',d.usedParts||'','number')+area('usedPeriods','Dotychczasowe okresy obojga rodziców; jeśli brak, wpisz „Nie korzystaliśmy”',d.usedPeriods||'')+select('otherUse','Czy drugi rodzic korzysta w okresie tego wniosku?',[['no','Nie'],['yes','Tak'],...(d.kind==='childcare'?[['exception','Udokumentowany wyjątek / brak możliwości ustalenia']]:[])])+area('otherPeriods','Okresy drugiego rodzica')+area('exception','Podstawa wyjątku i potwierdzający dokument')+'</fieldset>':'')+(d.kind==='parental'?'<fieldset class="zus-fields"><legend>Rodzicielski i praca</legend>'+select('combine','Czy łączysz urlop z pracą u tego pracodawcy?',[['no','Nie'],['yes','Tak']],d.combine)+'<div class="zus-field-note" data-work hidden><p>Każdy okres ma osobne daty i wymiar pracy.</p><div data-work-rows></div><button type="button" class="button secondary" data-add-work>Dodaj okres pracy</button>'+select('extendedWork','Czy zamierzasz pracować w wydłużonej części urlopu?',[['no','Nie'],['yes','Tak']],d.extendedWork)+field('extendedFraction','Wymiar w wydłużonej części (np. 0.5)',d.extendedFraction,'number')+'</div></fieldset>':'')+(d.kind==='paternity'?'<fieldset class="zus-fields"><legend>Wcześniejszy ojcowski</legend>'+select('usedDays','Ile dni wykorzystano, także u innego pracodawcy?',[['0','0 dni'],['7','7 dni'],['14','14 dni']],String(d.usedDays))+area('usedPeriods','Wcześniejszy okres i pracodawca')+'</fieldset>':'')+(d.kind==='childcare'?check('employmentSixMonths','Mam co najmniej 6 miesięcy zatrudnienia, licząc również poprzednich pracodawców.')+'<p class="wywiad-help">Wychowawczy jest bezpłatny; sprawdź pozostały wymiar, wiek dziecka i szczególne dokumenty, jeśli wnioskujesz o pełne 36 miesięcy.</p>':'')+'<fieldset class="zus-fields"><legend>Dokumenty</legend>'+select('documentStatus','Co robisz z dokumentami?',[['attached','Dołączam wskazane dokumenty'],['held','Dokumenty są już w aktach pracodawcy']])+area('documents','Wymień właściwe załączniki lub dokumenty w aktach')+'</fieldset><details><summary>Co przygotować i kiedy złożyć</summary><p data-doc-help></p><p>'+(['parental','childcare'].includes(d.kind)?'Złóż wniosek co najmniej 21 dni przed początkiem urlopu; przy łączeniu rodzicielskiego z pracą wniosek o pracę również składa się 21 dni wcześniej.':d.kind==='paternity'?'Złóż wniosek co najmniej 7 dni przed rozpoczęciem ojcowskiego.':'Przekaż pracodawcy dokument potwierdzający okoliczność i uzgodnij prawidłowy okres urlopu.')+'</p><p>Przekaż podpisane pismo pracodawcy zgodnie z obsługiwanym przez niego sposobem — ten PDF niczego nie wysyła.</p><a href="'+SOURCES[d.kind]+'" target="_blank" rel="noopener noreferrer">Sprawdź zasady w źródle</a></details>'+check('reviewed','Sprawdziłam/sprawdziłem wszystkie dane, okresy i oświadczenia w tym wniosku.')+'<div class="wywiad-error" role="alert"></div><p class="wywiad-message" role="status"></p><div class="wywiad-actions"><button type="submit" class="button primary">Pobierz PDF do podpisu</button></div></form></section>';
  const form=container.querySelector('form'),el=n=>form.elements.namedItem(n);let workRows=d.workPeriods.length?d.workPeriods:[{from:'',to:'',fraction:''}];
  const hints={maternity:d.event==='pregnancy'?'Zaświadczenie o przewidywanej dacie porodu.':(['adoption','foster'].includes(d.event)?'Dokumenty sądowe lub pieczy, data przyjęcia dziecka i ewentualne odroczenie obowiązku szkolnego.':'Odpis aktu urodzenia lub odpowiedni dokument zagraniczny; przy przejęciu także wymagane oświadczenia i potwierdzenia.'),parental:'Dokument urodzenia lub przyjęcia dziecka, historia części i oświadczenie o korzystaniu przez drugiego rodzica; dla zwiększonego wymiaru właściwe zaświadczenie „Za życiem”.',paternity:'Dokument urodzenia, a przy adopcji także prawomocne postanowienie sądu; oświadczenie o wykorzystanym ojcowskim znajduje się w piśmie.',childcare:'Oświadczenie dotyczące drugiego rodzica lub dokument potwierdzający wyjątek; dla dodatkowego urlopu z powodu niepełnosprawności właściwe orzeczenie.',loss:'Akt urodzenia z adnotacją o martwym urodzeniu lub zaświadczenie uprawnionego lekarza/położnej; przy zgonie po urodzeniu dokument potwierdzający zgon.'};
  form.querySelector('[data-doc-help]').textContent=hints[d.kind];
  container.querySelector('[data-back]').onclick=()=>ctx.onBack?ctx.onBack():root.location.hash='#moja-sprawa/wynik';
  function syncWork(){workRows=[...form.querySelectorAll('[data-work-row]')].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(x=>[x.dataset.key,x.value])));}
  function drawWork(){const box=form.querySelector('[data-work-rows]');if(!box)return;box.innerHTML=workRows.map((p,i)=>'<div class="zus-fields" data-work-row>'+['from','to','fraction'].map(k=>'<label class="field"><span>'+({from:'Praca od',to:'Praca do',fraction:'Wymiar pełnego etatu (np. 0.5)'}[k])+'</span><input data-key="'+k+'" type="'+(k==='fraction'?'number':'date')+'" '+(k==='fraction'?'min="0.01" max="0.5" step="0.01"':'min="1900-01-01" max="2199-12-31"')+' value="'+esc(p[k]||'')+'"></label>').join('')+'<button type="button" class="button secondary" data-remove="'+i+'">Usuń okres</button></div>').join('');box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{syncWork();workRows.splice(+b.dataset.remove,1);drawWork();el('reviewed').checked=false;});}
  function visibility(){if(el('otherPeriods'))el('otherPeriods').closest('label').hidden=el('otherUse')?.value!=='yes';if(el('exception'))el('exception').closest('label').hidden=el('otherUse')?.value!=='exception';if(el('combine'))form.querySelector('[data-work]').hidden=el('combine').value!=='yes';if(el('extendedFraction')){el('extendedFraction').step='0.01';el('extendedFraction').min='0.01';el('extendedFraction').max='0.5';el('extendedFraction').closest('label').hidden=el('extendedWork').value!=='yes';}if(d.kind==='paternity')el('usedPeriods').closest('label').hidden=el('usedDays').value==='0';}
  drawWork();visibility();form.querySelector('[data-add-work]')?.addEventListener('click',()=>{syncWork();workRows.push({from:'',to:'',fraction:''});drawWork();el('reviewed').checked=false;});
  form.addEventListener('input',e=>{if(e.target.name!=='reviewed')el('reviewed').checked=false;});form.addEventListener('change',visibility);
  form.addEventListener('submit',async e=>{e.preventDefault();syncWork();const values={...d,...Object.fromEntries(new FormData(form)),workPeriods:workRows};for(const n of ['employed','reviewed','periodConfirmed','employmentSixMonths'])values[n]=!!el(n)?.checked;const errors=validate(values);const output=form.querySelector('[role=alert]');output.innerHTML=errors.length?'<ul>'+errors.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'';if(errors.length){output.scrollIntoView({block:'nearest'});return;}const b=form.querySelector('[type=submit]');b.disabled=true;try{const bytes=await generatePdf(values);const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='Otula-wniosek-'+d.kind+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);form.querySelector('[role=status]').textContent='PDF gotowy — sprawdź, podpisz i przekaż pracodawcy.';}catch(err){output.textContent=err.message||'Nie udało się przygotować PDF.';}finally{b.disabled=false;}});
 }
 const api={TITLES,SOURCES,PROOFS,normalize,validate,paragraphs,generatePdf,render};root.OtulaUrlopy=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
