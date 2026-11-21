/* Official blank ZAM (2026-10-24), filled locally. No API, storage or signature. */
(function (root) {
  'use strict';
  const SOURCE = 'https://www.zus.pl/wzory-formularzy/zasilki/zasilek-macierzynski';
  const KIND = {maternity:'Macierzyński',conditions:'Na warunkach macierzyńskiego',parental:'Rodzicielski',supplementary:'Uzupełniający macierzyński',paternity:'Ojcowski'};
  const PERIOD = {maternity:['macierzynskiego','Okres'],conditions:['nawarunkach','Okres'],parental:['rodzicielskiego','Okres2'],supplementary:['uzMacierzynskiego','Okres3'],paternity:['ojcowskiego','Okres4']};
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => String(value == null ? '' : value).trim();
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number(value.slice(0,4)) >= 1900 && Number(value.slice(0,4)) <= 2199 && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value;
  const displayDate = value => date(value) ? value.split('-').reverse().join('.') : '';
  const digitsDate = value => displayDate(value).replace(/\./g,'');
  const range = p => displayDate(p.from)+' – '+displayDate(p.to);
  const isYes = value => value === true || value === 'yes' || value === 'tak';
  const loaders = new Map();

  function normalize(context = {}) {
    const a = context.answers || {};
    const p = context.periods || context.result?.pdfContext?.periods || [];
    const kind = k => ({macierzynski:'maternity',macierzyński:'maternity',rodzicielski:'parental',uzupelniajacy:'supplementary',uzupełniający:'supplementary',ojcowski:'paternity',adoption:'conditions',foster:'conditions',maternitySupplement:'supplementary'}[k] || k);
    const event = context.event || a.event || 'birth';
    return {
      event, role:context.role || a.role || '', eventDate:context.date || a.eventDate || '',
      childDob:a.childDob || (event === 'birth' ? (context.date || a.eventDate || '') : ''),
      periods:p.map(x=>({kind:kind(x.kind),from:x.from || x.start || '',to:x.to || x.end || ''})).filter(x=>KIND[x.kind]),
      grams:context.grams ?? a.birthWeight ?? '', weeks:context.weeks ?? a.gestationWeeks ?? '',
      stays:context.stays || (a.hospitalFrom && a.hospitalUntil ? [{from:a.hospitalFrom,to:a.hospitalUntil}] : []),
      zaZyciem:isYes(context.zaZyciem ?? a.zaZyciem),
      reason:({pregnancy:'pregnancy',birth:'birth',loss:'loss',childDeath:'loss',adoption:'adoption',foster:'foster',transfer:'transfer'}[event] || 'birth')
    };
  }

  function validate(data) {
    const errors=[];
    if(!['birth','pregnancy','loss','adoption','foster','afterEmployment','transfer','return'].includes(data.reason))errors.push('Wybierz właściwy powód wniosku.');
    if (!text(data.firstName) || !text(data.lastName)) errors.push('Podaj imię i nazwisko osoby składającej wniosek.');
    if (data.pesel && !/^\d{11}$/.test(data.pesel)) errors.push('PESEL powinien mieć 11 cyfr.');
    if (!data.pesel && (!date(data.personDob) || !text(data.identity))) errors.push('Podaj PESEL albo datę urodzenia i dokument tożsamości.');
    if (!text(data.house) || !text(data.city) || !text(data.postal)) errors.push('Uzupełnij numer domu, miejscowość i kod pocztowy.');
    if (!text(data.payerName) || !text(data.payerNip || data.payerRegon || data.payerPesel || data.payerIdentity)) errors.push('Podaj nazwę i identyfikator płatnika składek.');
    if (data.payerNip && !/^\d{10}$/.test(data.payerNip)) errors.push('NIP płatnika powinien mieć 10 cyfr.');
    if (data.payerRegon && !/^(\d{9}|\d{14})$/.test(data.payerRegon)) errors.push('REGON powinien mieć 9 albo 14 cyfr.');
    if (data.payerPesel && !/^\d{11}$/.test(data.payerPesel)) errors.push('PESEL płatnika powinien mieć 11 cyfr.');
    if (data.account && !/^\d{26}$/.test(data.account.replace(/\s/g,''))) errors.push('Ten druk ma pole na 26 cyfr polskiego rachunku; inny rachunek wymaga wyjaśnienia z płatnikiem.');
    if (!data.periods?.length) errors.push('Wybierz co najmniej jeden okres wniosku.');
    const seen=new Set();
    for (const p of data.periods || []) {
      if (!KIND[p.kind]) errors.push('Nieznany rodzaj okresu.');
      if (seen.has(p.kind)) errors.push('Dla każdego rodzaju wpisz jeden okres; kolejne części przygotuj w osobnym wniosku.');
      seen.add(p.kind);
      if (!date(p.from) || !date(p.to) || p.from>p.to) errors.push('Sprawdź daty od–do w okresie: '+(KIND[p.kind] || p.kind)+'.');
    }
    if (seen.has('maternity') && seen.has('conditions')) errors.push('Wybierz macierzyński albo urlop na jego warunkach.');
    if (seen.has('parental') && (!Number.isInteger(Number(data.parentalPart)) || +data.parentalPart<1 || +data.parentalPart>5)) errors.push('Wpisz numer części rodzicielskiego od 1 do 5.');
    if (seen.has('paternity') && !['1','2'].includes(String(data.paternityPart))) errors.push('Wpisz numer części ojcowskiego: 1 albo 2.');
    if (seen.has('paternity') && !['yes','no'].includes(data.previousPaternity)) errors.push('Odpowiedz, czy pobierano ojcowski z innego tytułu.');
    if (seen.has('paternity') && data.previousPaternity==='yes' && !text(data.previousPaternityDetails)) errors.push('Podaj wcześniejszy tytuł i okres ojcowskiego.');
    if ((seen.has('parental') || seen.has('supplementary')) && !['yes','no'].includes(data.otherUses)) errors.push('Potwierdź, czy drugi rodzic będzie korzystał z rodzicielskiego lub uzupełniającego.');
    if (data.otherUses==='yes' && (!text(data.otherPeriods) || !text(data.otherFirstName) || !text(data.otherLastName))) errors.push('Uzupełnij okresy oraz dane drugiego rodzica.');
    if (data.otherUses==='yes' && !(/^\d{11}$/.test(data.otherPesel || '') || (date(data.otherDob) && text(data.otherIdentity)))) errors.push('Podaj PESEL drugiego rodzica albo jego datę urodzenia i dokument tożsamości.');
    if (!date(data.filledDate)) errors.push('Podaj poprawną datę wypełnienia.');
    if (['pregnancy','adoption','foster'].includes(data.reason) && !date(data.eventDate)) errors.push('Podaj termin porodu albo datę przyjęcia dziecka.');
    if (!['pregnancy','loss'].includes(data.reason) && !text(data.children)) errors.push('Uzupełnij dane dzieci potrzebne we wniosku.');
    if (data.reason==='loss' && (!date(data.lossDate) || !['medical','record','death'].includes(data.lossDocument))) errors.push('Podaj datę i rodzaj dokumentu potwierdzającego stratę.');
    if (data.zaZyciem && !text(data.zaZyciemNames)) errors.push('Wskaż dziecko lub dzieci posiadające zaświadczenie „Za życiem”.');
    if (seen.has('supplementary')) {
      if (!date(data.maternityEnd)) errors.push('Podaj datę zakończenia podstawowego macierzyńskiego.');
      if (!data.stays?.length || data.stays.some(p=>!date(p.from)||!date(p.to)||p.from>p.to)) errors.push('Podaj poprawne okresy hospitalizacji z zaświadczenia.');
      if (!['before28','mass1000','between28and37','term'].includes(data.hospitalCondition)) errors.push('Wybierz potwierdzony warunek hospitalizacji z zaświadczenia.');
      if (!data.hospitalConfirmed) errors.push('Potwierdź zgodność warunku i pobytów z zaświadczeniem szpitala.');
    }
    if (data.reason==='transfer' && (!['skroceniem','przerwaniem4A','przerwaniem4B','podjeciem','porzuceniem','smiercia'].includes(data.transferReason) || !date(data.transferDate) || !text(data.motherDetails))) errors.push('Uzupełnij przyczynę przejęcia opieki, datę i dane matki.');
    if (data.reason==='afterEmployment' && !['upadlosc','likwidacje','rozwiazal','zmarl'].includes(data.employerReason)) errors.push('Wybierz udokumentowaną szczególną przyczynę ustania zatrudnienia.');
    if (data.reason==='return' && (!['mother','child'].includes(data.returnWho) || !date(data.returnDate))) errors.push('Podaj, kogo wypisano ze szpitala i kiedy.');
    if (!data.reviewed) errors.push('Sprawdź dane i zaznacz potwierdzenie przed pobraniem.');
    return [...new Set(errors)];
  }

  function fieldValues(d) {
    const f={}, set=(page,name,value)=>{if (value!=='' && value!=null && value!==false) f[page+'.'+name]=value;};
    for (const [input,name] of Object.entries({pesel:'PESEL',identity:'Rodzajseriainumerdokumentu',firstName:'Imie',lastName:'Nazwisko',street:'Ulica',house:'Numerdomu',flat:'Numerlokalu',postal:'Kodpocztowy',city:'Poczta',country:'Nazwapaństwa',phone:'Numertelefonu',payerName:'Nazwaplatnika'})) set(1,name,text(d[input]));
    if (!d.pesel) set(1,'Dataurodzenia',digitsDate(d.personDob));
    if (d.payerNip) set(1,'NIP',d.payerNip);
    else if (d.payerRegon) set(1,'REGON',d.payerRegon);
    else if (d.payerPesel) set(1,'PESEL_1',d.payerPesel);
    else set(1,'Rodzajseriainumerdokumentu_1',d.payerIdentity);
    set(2,'Numerrachunku',(d.account || '').replace(/\s/g,''));
    for (const p of d.periods) {const spec=PERIOD[p.kind];set(2,spec[0],true);set(2,spec[1],range(p));}
    const kinds=d.periods.map(p=>p.kind);
    if (kinds.includes('parental')) set(2,'czesc',String(d.parentalPart));
    if (kinds.includes('paternity')) set(2,'Numerlokalu2',String(d.paternityPart));
    if (d.fullVariantDeclaration) set(2,'informuje',true);
    if (['yes','no'].includes(d.insuranceDeclaration)) set(2,d.insuranceDeclaration==='yes'?'TAK':'NIE',true);
    const ordinary=['birth','loss','adoption','foster'].includes(d.reason);
    if (ordinary) {
      set(2,({birth:'ZaznaczX1a',loss:'ZaznaczX1a',adoption:'ZaznaczX1b',foster:'ZaznaczX1c'})[d.reason],true);
      if (['adoption','foster'].includes(d.reason)) set(2,'Data',digitsDate(d.eventDate));
      set(3,'Tekst1',d.reason==='loss' ? 'Strata potwierdzona dokumentem. Data: '+displayDate(d.lossDate)+'. Dokument: '+({medical:'zaświadczenie uprawnionego lekarza lub położnej',record:'akt urodzenia z adnotacją o martwym urodzeniu',death:'dokument potwierdzający zgon po urodzeniu'}[d.lossDocument]) : d.children);
      if(d.zaZyciem){set(3,'ZaznaczX1',true);set(3,'podajimie1',d.zaZyciemNames);}
    }
    if (d.reason==='pregnancy') {set(3,'_2',true);set(3,'Data2a',digitsDate(d.eventDate));}
    if (d.reason==='afterEmployment') {
      set(3,'_3',true);set(3,d.employerReason,true);set(3,'Tekst13B',d.children);
      if(d.zaZyciem){set(3,'ZaznaczX1d',true);set(3,'podajimie',d.zaZyciemNames);}
    }
    if (kinds.includes('supplementary')) {
      set(2,'Data2',digitsDate(d.maternityEnd));set(3,'_4',true);
      set(3,({before28:'skroceniem',mass1000:'przerwaniem4A',between28and37:'przerwaniem4B',term:'podjeciem'})[d.hospitalCondition],true);
      set(3,'Tekst4a',d.stays.map(range).join('\n'));set(4,'Tekst4c',d.children);
    }
    if (d.reason==='transfer') {
      set(4,'_5',true);set(4,d.transferReason,true);set(4,'Data5',digitsDate(d.transferDate));set(4,'Tekst4b',d.children);set(4,'Tekst13',d.motherDetails);
      if(d.zaZyciem){set(4,'ZaznaczX1d',true);set(4,'podajimie',d.zaZyciemNames);}
    }
    if (d.reason==='return') {set(5,'_6',true);set(5,d.returnWho==='mother'?'mnie5':'dziecka5',true);set(5,'Data6',digitsDate(d.returnDate));}
    // The official PDF's accessibility labels on page 5 are swapped. These IDs
    // were checked against the visible page, not trusted from the tooltip text.
    if(kinds.includes('paternity')) {set(5,d.previousPaternity==='yes'?'TAK2':'NIE2',true);if(d.previousPaternity==='yes')set(5,'Okres1',d.previousPaternityDetails);}
    if(kinds.includes('parental') || kinds.includes('supplementary')) {
      set(5,d.otherUses==='yes'?'TAK':'NIE',true);
      if(d.otherUses==='yes')set(5,'Okres',d.otherPeriods);
      for (const [input,name] of Object.entries({otherPesel:'PESEL',otherIdentity:'Rodzajseriainumerdokumentu',otherFirstName:'Imie',otherLastName:'Nazwisko'}))set(5,name,d[input]);
      if(!d.otherPesel)set(5,'Dataurodzenia',digitsDate(d.otherDob));
    }
    set(5,'Data',digitsDate(d.filledDate));
    return f;
  }

  function loadScript(file, present) {
    if(present())return Promise.resolve();
    if(!loaders.has(file))loaders.set(file,new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='./assets/'+file;
      s.onload=resolve;s.onerror=()=>{loaders.delete(file);s.remove();reject(Error('Nie udało się wczytać lokalnego narzędzia PDF.'));};document.head.append(s);
    }));
    return loaders.get(file);
  }
  async function loadLibraries() {
    await Promise.all([loadScript('wniosek-pdf-lib.min.js',()=>!!root.PDFLib),loadScript('report-jspdf.min.js',()=>!!root.jspdf),loadScript('report-fonts.js',()=>!!root.otulaReportFonts)]);
    return {PDFLib:root.PDFLib,jsPDF:root.jspdf.jsPDF,font:root.otulaReportFonts.Sans};
  }
  async function browserAssets() {
    const libraries=await loadLibraries();
    const [template,schema]=await Promise.all(['zus-zam-2026-10.pdf','zus-zam-fields.json'].map(async(name)=>{
      const r=await fetch('./assets/'+name);if(!r.ok)throw Error('Nie udało się wczytać wzoru ZAM.');return name.endsWith('json')?r.json():r.arrayBuffer();
    }));
    return {template,schema,...libraries};
  }
  async function generatePdf(data, assets) {
    const errors=validate(data);if(errors.length)throw Error(errors.join('\n'));
    assets=assets || await browserAssets();
    if(assets.schema.version!=='2026-10-24' || assets.schema.pages!==7)throw Error('Wersja urzędowego formularza nie zgadza się z mapą pól.');
    return composePdf({...assets,values:fieldValues(data),title:'ZAM – wniosek do sprawdzenia i podpisu'},assets);
  }
  async function composePdf({template,schema,values,title='Wniosek do sprawdzenia i podpisu'},libraries) {
    const {PDFLib,jsPDF,font}=libraries || await loadLibraries();
    const original=await PDFLib.PDFDocument.load(template);
    if(original.getPageCount()!==schema.pages)throw Error('Liczba stron wzoru nie zgadza się z mapą pól.');
    const form=original.getForm();
    form.deleteXFA();form.flatten();
    original.catalog.delete(PDFLib.PDFName.of('AcroForm'));
    original.catalog.delete(PDFLib.PDFName.of('OpenAction'));
    original.catalog.delete(PDFLib.PDFName.of('AA'));
    // Original tags reference XFA/widgets removed by flattening; leaving these
    // stale references produces structure-tree errors in PDF readers.
    original.catalog.delete(PDFLib.PDFName.of('StructTreeRoot'));
    original.catalog.delete(PDFLib.PDFName.of('MarkInfo'));
    // Draw only confirmed values into the original field rectangles. jsPDF embeds
    // the existing local Unicode font, preserving Polish names without a CDN.
    const overlay=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
    overlay.addFileToVFS('OtulaZAM.ttf',font);overlay.addFont('OtulaZAM.ttf','OtulaZAM','normal');overlay.setFont('OtulaZAM');overlay.setTextColor(0);
    for(let p=1;p<=schema.pages;p++) {
      if(p>1)overlay.addPage();
      for(const field of schema.fields.filter(f=>f.page===p)) {
        const value=values[p+'.'+field.name];if(value==null || value===false || value==='')continue;
        const [x,y,right,bottom]=field.rect,w=right-x,h=bottom-y;
        if(field.type==='CheckBox') {overlay.setLineWidth(1.25);overlay.line(x+5,y+5,right-5,bottom-5);overlay.line(right-5,y+5,x+5,bottom-5);continue;}
        const content=text(value).toLocaleUpperCase('pl-PL');
        if(field.comb) {
          if(content.length>field.maxLength)throw Error('Wartość nie mieści się w polu '+field.name+'.');
          overlay.setFontSize(10);
          [...content].forEach((ch,i)=>overlay.text(ch,x+(i+.5)*(w/field.maxLength),y+h/2+3.4,{align:'center'}));
          continue;
        }
        let size=10,lines=[];
        for(;size>=8;size-=.5) {overlay.setFontSize(size);lines=overlay.splitTextToSize(content,w-8);if(lines.length*size*1.15<=h-3)break;}
        if(size<8)throw Error('Treść jest za długa w polu '+field.name+'; skróć ją lub przygotuj odrębny załącznik.');
        overlay.text(lines,x+4,y+Math.max(size+1,(h-lines.length*size*1.15)/2+size*.85),{lineHeightFactor:1.15});
      }
    }
    const layer=await PDFLib.PDFDocument.load(overlay.output('arraybuffer'));
    const pages=await original.embedPages(layer.getPages());
    pages.forEach((p,i)=>original.getPage(i).drawPage(p,{x:0,y:0,width:original.getPage(i).getWidth(),height:original.getPage(i).getHeight()}));
    original.setTitle(title);original.setAuthor('');original.setSubject('Oficjalny formularz ZUS; dane uzupełnione lokalnie');
    return original.save();
  }

  const input=(name,label,value='',type='text',extra='')=>`<label class="field"><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const area=(name,label,value='')=>`<label class="field zus-field-note"><span>${esc(label)}</span><textarea name="${name}" rows="3">${esc(value)}</textarea></label>`;
  const choice=(name,label,options,value='')=>`<label class="field"><span>${esc(label)}</span><select name="${name}">${options.map(([v,l])=>`<option value="${v}"${v===value?' selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
  const check=(name,label)=>`<label><input name="${name}" type="checkbox"> <span>${esc(label)}</span></label>`;
  const yesno=[['','Wybierz odpowiedź'],['yes','Tak'],['no','Nie']];

  function render(container, context={}) {
    const c=normalize(context);
    if(context.documentCode && !/^(ZAM|ZUR|ZAO)$/i.test(context.documentCode)) {
      container.innerHTML='<section class="zus-page"><button class="button secondary" data-back>Wróć do sprawy</button><h1>Właściwy dokument</h1><p>Ten generator uzupełnia ZAM; dla wybranego dokumentu otwórz aktualny wzór w urzędzie.</p><a class="button primary" href="https://www.zus.pl/wzory-formularzy/zasilki" target="_blank" rel="noopener noreferrer">Otwórz wzory ZUS</a></section>';
      container.querySelector('[data-back]').onclick=()=>context.onBack?context.onBack():history.back();return;
    }
    const kinds=Object.keys(KIND);
    const today=new Date();const localToday=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    const children='';
    container.innerHTML=`<section class="zus-page"><button type="button" class="button secondary" data-back>Wróć do sprawy</button><p class="small-label">Dokument do podpisu · ZAM</p><h1>Przygotuj wniosek</h1><p>Sprawdź okresy, wpisz dane do druku i pobierz urzędowy PDF z pustym miejscem na podpis.</p><p class="zus-version">Dane zostają w pamięci tej strony; pobranie nie wysyła wniosku do ZUS.</p><form autocomplete="off" novalidate>
      <fieldset class="zus-fields"><legend>Twoje dane</legend>${input('firstName','Imię')}${input('lastName','Nazwisko')}${input('pesel','PESEL (jeśli nadany)','','text','inputmode="numeric" maxlength="11"')}${input('personDob','Data urodzenia, gdy nie masz PESEL','','date')}${input('identity','Dokument tożsamości, gdy nie masz PESEL')}${input('street','Ulica (jeśli występuje)')}${input('house','Numer domu')}${input('flat','Numer lokalu (opcjonalnie)')}${input('postal','Kod pocztowy')}${input('city','Miejscowość')}${input('country','Państwo, gdy adres jest poza Polską')}${input('phone','Telefon (opcjonalnie)')}${input('account','Polski numer rachunku (opcjonalnie)','','text','inputmode="numeric"')}<p class="zus-field-note">Bez numeru rachunku wzór przewiduje wypłatę przekazem na adres.</p></fieldset>
      <fieldset class="zus-fields"><legend>Płatnik składek</legend><p class="zus-field-note">Podaj pracodawcę, zleceniodawcę albo własną działalność; wybierz jeden dostępny identyfikator.</p>${input('payerName','Nazwa albo imię i nazwisko płatnika')}${input('payerNip','NIP (jeśli nadany)','','text','inputmode="numeric" maxlength="10"')}<details class="zus-field-note"><summary>Płatnik nie ma NIP</summary>${input('payerRegon','REGON, gdy brak NIP','','text','inputmode="numeric"')}${input('payerPesel','PESEL, gdy brak NIP i REGON','','text','inputmode="numeric"')}${input('payerIdentity','Dokument tożsamości, gdy brak powyższych numerów')}</details></fieldset>
      <fieldset class="zus-fields"><legend>Zdarzenie</legend>${choice('reason','Powód wniosku',[['birth','Narodziny dziecka'],['pregnancy','Macierzyński przed porodem'],['loss','Strata ciąży lub dziecka'],['adoption','Przyjęcie do adopcji i wniosek do sądu'],['foster','Niezawodowa rodzina zastępcza'],['afterEmployment','Narodziny po szczególnym ustaniu zatrudnienia'],['transfer','Przejęcie opieki w związku z sytuacją matki'],['return','Dokończenie po wypisie ze szpitala']],c.reason)}${input('eventDate','Termin porodu / data przyjęcia dziecka',c.eventDate,'date')}${area('children','Dane każdego dziecka: imię, nazwisko, data i miejsce urodzenia',children)}<div class="zus-field-note" data-loss hidden>${input('lossDate','Data z dokumentu potwierdzającego stratę',c.eventDate,'date')}${choice('lossDocument','Dokument potwierdzający stratę',[['','Wybierz'],['medical','Zaświadczenie uprawnionego lekarza lub położnej'],['record','Akt urodzenia z adnotacją o martwym urodzeniu'],['death','Dokument potwierdzający zgon po urodzeniu']])}</div>${choice('employerReason','Szczególna przyczyna ustania zatrudnienia',[['','Nie dotyczy'],['upadlosc','Upadłość'],['likwidacje','Likwidacja'],['rozwiazal','Bezprawne rozwiązanie potwierdzone prawomocnym wyrokiem'],['zmarl','Śmierć pracodawcy']])}<div class="zus-field-note" data-transfer hidden>${choice('transferReason','Udokumentowana sytuacja matki',[['','Wybierz'],['skroceniem','Rezygnacja po co najmniej 14 tygodniach'],['przerwaniem4A','Hospitalizacja po co najmniej 8 tygodniach'],['przerwaniem4B','Odpowiednie orzeczenie po co najmniej 8 tygodniach'],['podjeciem','Podjęcie pracy co najmniej na pół etatu'],['porzuceniem','Porzucenie dziecka'],['smiercia','Śmierć matki']])}${input('transferDate','Data wskazanej okoliczności','','date')}${area('motherDetails','Dane matki: imię, nazwisko, PESEL lub dokument i data urodzenia')}</div><div class="zus-field-note" data-return hidden>${choice('returnWho','Kogo wypisano ze szpitala',[['','Wybierz'],['mother','Matkę'],['child','Dziecko']])}${input('returnDate','Data wypisu','','date')}</div></fieldset>
      <fieldset class="zus-review"><legend>Okresy, o które występujesz</legend><p>Daty z wyliczenia są propozycją; zatwierdź tylko okresy tej osoby i tego wniosku.</p>${kinds.map(k=>{const p=c.periods.find(p=>p.kind===k);return `<label><input type="checkbox" name="kind-${k}"${p?' checked':''}> <span>${KIND[k]}</span></label><div class="zus-fields" data-period="${k}"${p?'':' hidden'}>${input('from-'+k,'Od',p?.from || '','date')}${input('to-'+k,'Do',p?.to || '','date')}${k==='parental'?input('parentalPart','Która część rodzicielskiego?','','number','min="1" max="5"'):k==='paternity'?input('paternityPart','Która część ojcowskiego?','','number','min="1" max="2"'):''}</div>`;}).join('')}</fieldset>
      <fieldset class="zus-fields" data-hospital hidden><legend>Zaświadczenie szpitala</legend><p class="zus-field-note">Wybierz warunek z dokumentu; nie wpisuj przewidywanego pobytu jako faktu.</p>${choice('hospitalCondition','Warunek z zaświadczenia',[['','Wybierz po sprawdzeniu'],['before28','Poród przed ukończeniem 28. tygodnia'],['mass1000','Masa urodzeniowa nie większa niż 1000 g'],['between28and37','Ukończone 28–36 tygodni i masa ponad 1000 g'],['term','Po ukończeniu 37 tygodni i kwalifikujący pobyt co najmniej 2 dni']])}${input('maternityEnd','Koniec podstawowego macierzyńskiego',c.periods.find(p=>['maternity','conditions'].includes(p.kind))?.to || '','date')}${area('hospitalDates','Każdy pobyt w osobnym wierszu: RRRR-MM-DD / RRRR-MM-DD',c.stays.map(s=>s.from+' / '+s.to).join('\n'))}<div class="zus-field-note">${check('hospitalConfirmed','Sprawdziłam/sprawdziłem warunek i daty z zaświadczeniem szpitala.')}</div></fieldset>
      <fieldset class="zus-fields" data-other hidden><legend>Drugi rodzic</legend>${choice('otherUses','Czy będzie korzystać z rodzicielskiego lub uzupełniającego?',yesno)}${input('otherPeriods','Jeśli tak: okresy od–do')}${input('otherFirstName','Imię drugiego rodzica')}${input('otherLastName','Nazwisko drugiego rodzica')}${input('otherPesel','PESEL drugiego rodzica (jeśli nadany)','','text','inputmode="numeric" maxlength="11"')}${input('otherDob','Data urodzenia, gdy brak PESEL','','date')}${input('otherIdentity','Dokument tożsamości, gdy brak PESEL')}</fieldset>
      <fieldset class="zus-fields" data-paternity hidden><legend>Wcześniejszy ojcowski</legend>${choice('previousPaternity','Czy pobierano ojcowski z innego tytułu?',yesno)}${input('previousPaternityDetails','Jeśli tak: tytuł i okres pobierania')}</fieldset>
      <details><summary>Pozostałe oświadczenia we wzorze</summary><div class="zus-fields">${choice('insuranceDeclaration','Działalność, współpraca, duchowny lub marynarz: czy obejmuje Cię chorobowe?',[['','Nie dotyczy / pozostaw puste'],['yes','Tak, potwierdzam'],['no','Nie']])}${input('zaZyciemNames','Imiona dzieci objętych zaświadczeniem „Za życiem”')}<div class="zus-field-note">${check('zaZyciem','Potwierdzam posiadanie zaświadczenia z art. 4 ust. 3 ustawy „Za życiem”.')}${check('fullVariantDeclaration','Zamierzam wykorzystać pełny właściwy wymiar macierzyńskiego i rodzicielskiego, w tym co najmniej dzień rodzicielskiego w pierwszym roku życia dziecka.')}</div></div></details>
      <fieldset class="zus-review"><legend>Sprawdź przed pobraniem</legend>${input('filledDate','Data wypełnienia',localToday,'date')}${check('reviewed','Sprawdziłam/sprawdziłem dane, okresy i zaznaczone oświadczenia; podpis złożę dopiero po sprawdzeniu PDF.')}<p>Podpis pozostaje pusty, a plik ma wszystkie 7 stron urzędowego wzoru z instrukcją.</p></fieldset>
      <div data-status role="status" aria-live="polite" class="zus-notice" hidden></div><div class="case-actions"><button class="button primary" type="submit">Pobierz ZAM do podpisu</button><a class="button secondary" href="./assets/zus-zam-2026-10.pdf" target="_blank" rel="noopener">Pokaż pusty wzór</a><a class="button secondary" href="${SOURCE}" target="_blank" rel="noopener noreferrer">Źródło: ZUS</a></div></form><div class="zus-next" data-download hidden><h2>Sprawdź plik i podpisz</h2><p>Dołącz dokumenty wskazane w Twojej sprawie i przekaż wniosek właściwemu płatnikowi albo otwórz usługę eZUS.</p><div class="case-actions"><a class="button secondary" data-preview target="_blank" rel="noopener">Otwórz przygotowany PDF</a><a class="button secondary" href="https://www.zus.pl/ezus/logowanie" target="_blank" rel="noopener noreferrer">Otwórz eZUS</a></div></div></section>`;
    const form=container.querySelector('form'),status=container.querySelector('[data-status]');let generatedURL='';
    const el=name=>form.elements.namedItem(name);
    const sync=()=>{
      for(const k of kinds)form.querySelector('[data-period="'+k+'"]').hidden=!el('kind-'+k).checked;
      form.querySelector('[data-hospital]').hidden=!el('kind-supplementary').checked;
      form.querySelector('[data-other]').hidden=!(el('kind-parental').checked || el('kind-supplementary').checked);
      form.querySelector('[data-paternity]').hidden=!el('kind-paternity').checked;
      form.querySelector('[data-transfer]').hidden=el('reason').value!=='transfer';form.querySelector('[data-return]').hidden=el('reason').value!=='return';
      el('employerReason').closest('label').hidden=el('reason').value!=='afterEmployment';
      el('eventDate').closest('label').hidden=!['pregnancy','adoption','foster'].includes(el('reason').value);
      const loss=el('reason').value==='loss';
      el('children').closest('label').hidden=loss || el('reason').value==='pregnancy';
      form.querySelector('[data-loss]').hidden=!loss;
      el('zaZyciemNames').closest('label').hidden=loss;
      el('zaZyciem').closest('label').hidden=loss;
      el('fullVariantDeclaration').closest('label').hidden=loss;
      if(loss){el('children').value='';el('zaZyciem').checked=false;el('fullVariantDeclaration').checked=false;}
    };
    sync();
    form.addEventListener('change',e=>{if(e.target.name!=='reviewed')el('reviewed').checked=false;sync();});
    form.addEventListener('input',e=>{if(e.target.name!=='reviewed')el('reviewed').checked=false;});
    container.querySelector('[data-back]').onclick=()=>{if(generatedURL)URL.revokeObjectURL(generatedURL);context.onBack?context.onBack():history.back();};
    form.onsubmit=async e=>{
      e.preventDefault();const data=Object.fromEntries(new FormData(form));
      for(const name of ['reviewed','zaZyciem','fullVariantDeclaration','hospitalConfirmed'])data[name]=el(name).checked;
      data.periods=kinds.filter(k=>el('kind-'+k).checked).map(k=>({kind:k,from:el('from-'+k).value,to:el('to-'+k).value}));
      data.stays=text(data.hospitalDates).split('\n').filter(Boolean).map(line=>{const a=line.split('/').map(s=>s.trim());return {from:a[0],to:a[1]};});
      const errors=validate(data);status.hidden=false;
      if(errors.length){status.textContent=errors.join(' ');status.tabIndex=-1;status.focus();return;}
      const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Przygotowuję urzędowy PDF na tym urządzeniu…';
      try {
        const bytes=await generatePdf(data);if(generatedURL)URL.revokeObjectURL(generatedURL);generatedURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
        const link=document.createElement('a');link.href=generatedURL;link.download='ZAM-do-podpisu.pdf';document.body.append(link);link.click();link.remove();
        const preview=container.querySelector('[data-preview]');preview.href=generatedURL;container.querySelector('[data-download]').hidden=false;
        status.textContent='PDF został przygotowany. Otwórz go, sprawdź wszystkie strony i podpisz przed złożeniem.';
      } catch(error) {status.textContent=error.message || 'Nie udało się przygotować PDF. Dane pozostają w formularzu.';}
      finally {button.disabled=false;}
    };
  }
  const api={render,normalize,validate,fieldValues,generatePdf,composePdf,loadLibraries,version:'2026-10-24',source:SOURCE};
  root.OtulaWniosek=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
