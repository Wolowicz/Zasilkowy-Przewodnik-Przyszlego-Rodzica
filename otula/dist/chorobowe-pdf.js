// Formularz ZUS z 24.10.2026. Dane identyfikacyjne istnieją wyłącznie na ekranie.
(() => {
  'use strict';
  const input = (name, label, attributes = '') =>
    `<label class="field">${label}<input name="${name}" ${attributes}></label>`;
  const dateField = (name, label, required = false) =>
    input(name, label, 'type="date"' + (required ? ' required' : ''));
  const nip = input('NIP','NIP płatnika','inputmode="numeric" pattern="[0-9]{10}" maxlength="10"');
  function render(container, ctx = {}) {
    const context = {...ctx.answers, ...ctx.result?.pdfContext, ...ctx.pdfContext, ...ctx};
    container.innerHTML = `<a class="back-link" href="#moja-sprawa/wynik">Wróć do wyniku</a>
      <h1>Wniosek o zasiłek chorobowy</h1><p>Sprawdź dane do druku ZAS-53. Podpis złóż na wydruku.</p>
      <form class="settings" autocomplete="off">
      <h2>Twoje dane</h2>
      ${input('Imie','Imię','required maxlength="55"')}${input('Nazwisko','Nazwisko','required maxlength="65"')}
      ${input('PESEL','PESEL, jeśli go masz','inputmode="numeric" pattern="[0-9]{11}" maxlength="11"')}
      <div data-alternate>${dateField('Dataurodzenia','Data urodzenia, jeśli nie masz PESEL')}${input('Rodzajseriainumerdokumentu','Rodzaj, seria i numer dokumentu tożsamości')}</div>
      ${input('Ulica','Ulica')}${input('Numerdomu','Numer domu','required')}${input('Numerlokalu','Numer lokalu, jeśli dotyczy')}
      ${input('Kodpocztowy','Kod pocztowy','required')}${input('Poczta','Miejscowość','required')}${input('Nazwapaństwa','Państwo, jeśli adres jest poza Polską')}
      ${input('Numerrachunku','Numer rachunku do wypłaty (opcjonalnie)','inputmode="numeric" pattern="[0-9]{26}" maxlength="26"')}
      <h2>Płatnik składek</h2>${input('Nazwaplatnika','Nazwa lub imię i nazwisko płatnika','required')}${nip}
      <details><summary>Inny identyfikator płatnika, jeśli nie ma NIP</summary>${input('REGON','REGON')}${input('PESEL_1','PESEL płatnika, jeśli nie ma NIP i REGON','pattern="[0-9]{11}"')}${input('Rodzajseriainumerdokumentu_1','Dokument tożsamości płatnika, jeśli brak pozostałych identyfikatorów')}</details>
      <h2>Okres zwolnienia</h2>${dateField('from','Początek zwolnienia',true)}${dateField('to','Koniec zwolnienia',true)}
      ${input('zla','Seria i numer zwolnienia, jeśli znasz')}
      <label class="field">Kiedy przypada zwolnienie?<select name="timing" required><option value="">Wybierz</option><option value="insured">Podczas ubezpieczenia</option><option value="after">Po ustaniu ubezpieczenia</option><option value="both">Obejmuje oba okresy</option></select></label>
      <div data-end hidden>${dateField('Data','Data ustania ubezpieczenia')}</div>
      <label class="field">Czy zwolnienie wynika z wypadku lub choroby zawodowej?<select name="cause" required><option value="">Wybierz</option><option value="no">Nie</option><option value="choroby">Choroba zawodowa</option><option value="przypracy">Wypadek przy pracy</option><option value="wdrodze">Wypadek w drodze do pracy lub z pracy</option></select></label>
      <div data-proof hidden>${input('Tekst5','Rodzaj, numer i data dokumentu potwierdzającego zdarzenie')}</div>
      <details><summary>Informacja dla marynarza</summary><label class="field">Czy za ten okres przysługuje wynagrodzenie za pracę na morzu?<select name="seafarer"><option value="">Nie dotyczy</option><option value="yes">Tak</option><option value="no">Nie</option></select></label></details>
      <p>Po pobraniu przeczytaj oświadczenie i pouczenie w urzędowym formularzu.</p>
      <button class="button primary">Pobierz ZAS-53 do podpisu</button><p role="status"></p></form>`;
    const form = container.querySelector('form');
    const fields = form.elements;
    fields.from.value = context.sickFrom || '';
    fields.to.value = context.sickTo || '';
    if (context.employmentEnded === 'yes' && /^\d{4}-\d{2}-\d{2}$/.test(context.coverageEnd)) {
      fields.Data.value = context.coverageEnd;
      if (fields.from.value && fields.to.value && fields.to.value >= fields.from.value) {
        if (fields.from.value > context.coverageEnd) fields.timing.value = 'after';
        else if (fields.to.value > context.coverageEnd) fields.timing.value = 'both';
        else fields.timing.value = 'insured';
      }
    }
    function sync() {
      const alt = !fields.PESEL.value.trim();
      const after = ['after','both'].includes(fields.timing.value);
      const proof = Boolean(fields.cause.value && fields.cause.value !== 'no');
      for (const [selector,visible] of [['[data-alternate]',alt],['[data-end]',after],['[data-proof]',proof]]) {
        const group = form.querySelector(selector);
        group.hidden = !visible;
        group.querySelectorAll('input').forEach(el => { el.required = visible; el.disabled = !visible; });
      }
      fields.to.min = fields.from.value;
      fields.NIP.setCustomValidity(![fields.NIP,fields.REGON,fields.PESEL_1,fields.Rodzajseriainumerdokumentu_1].some(el => el.value.trim()) ? 'Podaj jeden identyfikator płatnika.' : '');
    }
    sync();
    form.addEventListener('input',sync);
    form.addEventListener('submit',async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      const submit = form.querySelector('button');
      const status = form.querySelector('[role=status]');
      submit.disabled = true;
      status.textContent = 'Przygotowywanie dokumentu…';
      try {
        const bytes = await generate(values);
        if (!form.isConnected) return;
        const url = URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
        const link = document.createElement('a');
        link.href = url; link.download = 'Otula-ZAS-53-do-podpisu.pdf'; link.click();
        setTimeout(() => URL.revokeObjectURL(url),60000);
        status.textContent = 'Wniosek jest gotowy do wydruku i podpisu.';
      } catch (err) {
        status.textContent = err.message || 'Nie udało się przygotować wniosku. Spróbuj ponownie.';
      } finally { submit.disabled = false; }
    });
  }
  function printDate(value) { return value ? value.split('-').reverse().join('') : ''; }
  function valuesForPrint(values) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2,'0') + String(today.getMonth()+1).padStart(2,'0') + today.getFullYear();
    return {...values, Dataurodzenia:printDate(values.Dataurodzenia), Data:printDate(values.Data), Data2:day,
      Tekst:[values.from,values.to].map(d => d.split('-').reverse().join('.')).join(' – ') + (values.zla ? ', '+values.zla : ''),
      wniosek1A:['insured','both'].includes(values.timing), wniosek1B:['after','both'].includes(values.timing),
      choroby:values.cause==='choroby', przypracy:values.cause==='przypracy', wdrodze:values.cause==='wdrodze',
      TAK_5:values.cause!=='no', NIE_5:values.cause==='no',TAK_6:values.seafarer==='yes', NIE_6:values.seafarer==='no'};
  }
  async function generate(values) {
    const [res, template] = await Promise.all(['zas-53-pola.json','zas-53.pdf'].map(file=>fetch('./assets/'+file)));
    if (!res.ok || !template.ok) throw new Error('Nie udało się pobrać wzoru ZAS-53.');
    const fields = await res.json();
    const inputValues = valuesForPrint(values);
    const schema = {pages:4, fields: fields.map(field => ({
      page:field.page + 1, name:field.name, rect:field.rect, type:field.check ? 'CheckBox' : 'Text',
      comb:field.comb, maxLength:field.max
    }))};
    const mapped = Object.fromEntries(schema.fields.map(field =>
      [field.page + '.' + field.name, inputValues[field.name]]));
    return window.OtulaWniosek.composePdf({template:await template.arrayBuffer(),schema,values:mapped,title:'ZAS-53 do podpisu'});
  }
  window.OtulaChorobowe = {render,generate};
})();
