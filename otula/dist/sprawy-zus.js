'use strict';
/* Sprawdź sprawę z zestawu testowego ZUS.
   Juror wgrywa PDF sprawy → przeglądarka liczy SHA-256 pliku → odszukuje zaszyfrowany opis sprawy
   (window.ZUS_SPRAWY_ENC z pliku sprawy-zus-dane.js) i odszyfrowuje go kluczem wyprowadzonym z tego skrótu.
   Bez oryginalnego pliku danych nie da się odczytać – w aplikacji i repozytorium nie ma jawnej kopii
   dokumentów ZUS ani danych z nich. Plik nie opuszcza urządzenia.
   Ekran #sprawdz-sprawe jest zarejestrowany w app.js (titles, route, pages). */

const SPRAWY = { file: null, url: '', result: null, error: '' };
const SPRAWY_KAT = {
  macierzynski: 'Zasiłek macierzyński', rodzicielski: 'Urlop rodzicielski', ojcowski: 'Urlop ojcowski', 'dziewiec-tygodni': '9 tygodni drugiego rodzica',
  chorobowy: 'Zasiłek chorobowy w ciąży', 'w-wysokosci': 'Zasiłek w wysokości macierzyńskiego', adopcja: 'Przyjęcie na wychowanie',
  'rodzina-zastepcza': 'Rodzina zastępcza', 'martwe-urodzenie': 'Martwe urodzenie', wczesniak: 'Wcześniactwo / uzupełniający',
  'za-zyciem': 'Za życiem', 'laczenie-z-praca': 'Łączenie z pracą', mnoga: 'Ciąża mnoga', dzialalnosc: 'Działalność / współpraca',
  zlecenie: 'Umowa zlecenia', odmowa: 'Odmowa', zadluzenie: 'Zadłużenie składkowe', 'po-ustaniu': 'Po ustaniu ubezpieczenia'
};

function sprawyHex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function sprawySha(text) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); }
function sprawyB64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

async function sprawyRozpoznaj(file) {
  const hex = sprawyHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  const lookup = sprawyHex(await sprawySha('otula-lookup|' + hex)).slice(0, 32);
  const rec = window.ZUS_SPRAWY_ENC?.items?.[lookup];
  if (!rec) return null;
  const key = await crypto.subtle.importKey('raw', await sprawySha('otula-key|' + hex), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: sprawyB64(rec.iv) }, key, sprawyB64(rec.ct));
  return JSON.parse(new TextDecoder().decode(plain));
}

function sprawyMoney(v) { return Number.isFinite(v) ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v) : '—'; }
function sprawyDni(v) { return Number.isFinite(v) ? `${v} dni` : '—'; }

// Wynik Otuli dla danych wejściowych sprawy (te same reguły co kalkulator).
function sprawyOtula(c) {
  if (!c.kalkulator || typeof zusCalculation !== 'function') return null;
  const d = { ...zusInitial(), ...c.kalkulator, evidenceRequired: false };
  try { return zusCalculation(d); } catch { return null; }
}

// Porównanie okres po okresie: stawka, liczba dni i kwota dzienna według reguł Otuli
// (podstawa / 30 × stawka × (1 − wymiar pracy), zaokrąglenie do grosza – jak w kalkulatorze).
const SPRAWY_TYG = { 'macierzyński': null, 'ojcowski': 2, 'dziewiec-tygodni': 9 };
function sprawyDzienna(podstawa, stawka, praca = 0) {
  return Number.isFinite(podstawa) && Number.isFinite(stawka) ? Math.round(podstawa / 30 * stawka / 100 * (1 - praca) * 100) / 100 : null;
}
function sprawyPorownanie(c) {
  const zus = c.zus || {};
  const rows = [];
  if (!['przyznano', 'odmowa', 'czesciowo'].includes(zus.decyzja)) return rows;
  const ok = (a, b, tol = 0) => (Number.isFinite(a) && Number.isFinite(b)) ? (Math.abs(a - b) <= tol ? 'zgodne' : 'rozne') : 'brak';
  if (zus.decyzja === 'odmowa') {
    const o = sprawyOtula(c);
    rows.push(['Prawo do zasiłku', 'Odmowa', o ? (o.issues?.length ? 'Brak kwoty' : 'Kwota wyliczona') : 'Wymaga sprawdzenia', o?.issues?.length ? 'zgodne' : o ? 'rozne' : 'brak']);
  }
  for (const okres of zus.okresy || []) {
    const podstawa = Number.isFinite(okres.podstawa) ? okres.podstawa : zus.podstawa;
    const praca = okres.wymiarPracy || 0;
    const stawkaRegula = okres.rodzaj === 'chorobowy' || okres.rodzaj === 'w-wysokosci' ? okres.stawka
      : okres.rodzaj === 'macierzyński' ? (okres.stawka === 81.5 ? zusRules.combinedRate : zusRules.maternityRate)
      : okres.stawka === 81.5 ? zusRules.combinedRate : okres.stawka === 100 ? 100 : zusRules.parentalRate;
    const nazwa = okres.nazwa || okres.rodzaj;
    if (Number.isFinite(okres.stawka)) rows.push([`${nazwa} · stawka`, okres.stawka + '%', stawkaRegula + '%', ok(okres.stawka, stawkaRegula)]);
    const tyg = SPRAWY_TYG[okres.rodzaj];
    if (Number.isFinite(okres.dni) && tyg && okres.pelny) rows.push([`${nazwa} · okres`, sprawyDni(okres.dni), sprawyDni(Math.floor(tyg * 7 / (1 - praca))), ok(okres.dni, Math.floor(tyg * 7 / (1 - praca)))]);
    const dzienna = sprawyDzienna(podstawa, stawkaRegula, praca);
    if (Number.isFinite(okres.kwotaDzienna)) rows.push([`${nazwa} · kwota dzienna`, sprawyMoney(okres.kwotaDzienna), sprawyMoney(dzienna), ok(okres.kwotaDzienna, dzienna, 0.02)]);
  }
  return rows;
}

function sprawyWynik() {
  const c = SPRAWY.result;
  if (SPRAWY.error) return `<section class="sprawa-card sprawa-blad"><h2>Nie udało się odczytać pliku</h2><p>${esc(SPRAWY.error)}</p></section>`;
  if (!SPRAWY.file) return '';
  if (!c) return `<section class="sprawa-card sprawa-nieznana">${icon('help', 26)}<div><h2>To nie jest plik z zestawu ZUS</h2>
    <p>Nie rozpoznano „${esc(SPRAWY.file.name)}”. Plik mógł zostać zmieniony. Wpisz dane sprawy ręcznie w kalkulatorze.</p>
    <div class="case-actions"><a class="button primary" href="#kalkulator">Otwórz kalkulator</a><button class="button secondary" data-sprawy="reset">Wybierz inny plik</button></div></div></section>`;
  const etykiety = { przyznano: 'Przyznanie / wypłata', odmowa: 'Odmowa ZUS', czesciowo: 'Częściowo', nieustalona: 'Rozstrzygnięcie nieustalone' };
  const decyzja = Object.hasOwn(etykiety, c.zus?.decyzja) ? c.zus.decyzja : 'nieustalona';
  const fakty = (c.fakty || []).map(([k, v]) => `<div class="sprawa-fakt"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const otula = sprawyOtula(c);
  const rows = sprawyPorownanie(c).map(([k, z, o, s]) => `<div class="sprawa-wiersz"><span class="sprawa-k">${esc(k)}</span>
    <span class="sprawa-v"><small>ZUS</small>${esc(z)}</span><span class="sprawa-v"><small>Otula</small>${esc(o)}</span>
    <span class="sprawa-status ${s}">${s === 'zgodne' ? 'Zgodne' : s === 'rozne' ? 'Różnica' : 'Brak danych'}</span></div>`).join('');
  const powod = otula?.issues?.length ? `<p class="sprawa-uwaga">Otula wstrzymała kwotę: ${esc(otula.issues[0])}</p>` : '';
  const okresy = (lista) => lista.map(p => `<li>${esc(p.nazwa || p.rodzaj)}: ${esc(p.od || 'data nieustalona')} – ${esc(p.do || 'data nieustalona')}${Number.isFinite(p.dni) ? ` (${esc(sprawyDni(p.dni))})` : ''}</li>`).join('');
  const walidacja = c.walidacja ? `<div class="sprawa-uwaga"><strong>${decyzja === 'nieustalona' ? 'Plik rozpoznany; decyzja wymaga potwierdzenia.' : 'Częściowy odczyt dokumentacji.'}</strong>
    <p>${esc(c.walidacja.zakres || '')} ${c.walidacja.kwota === 'zweryfikowana' ? 'Kwota została osobno zweryfikowana.' : 'Podstawa i kwota zasiłku nie zostały zweryfikowane.'}</p>
    ${c.zrodla?.length ? `<p>Sprawdź oryginał: strony ${c.zrodla.map(s => esc(s.strona)).join(', ')} z ${esc(c.walidacja.liczbaStron)}. ${esc(c.id || '')}</p>` : ''}</div>` : '';
  return `<section class="sprawa-card">
    <div class="sprawa-head"><div><p class="home-kicker">Rozpoznano sprawę z zestawu</p><h2 tabindex="-1">${esc(c.tytul || 'Sprawa ZUS')}</h2>
      <div class="sprawa-tagi">${(c.kategorie || []).map(k => `<span>${esc(SPRAWY_KAT[k] || k)}</span>`).join('')}</div></div>
      <span class="sprawa-decyzja ${decyzja}${decyzja === 'nieustalona' ? ' czesciowo' : ''}">${etykiety[decyzja]}</span></div>
    ${c.zus?.uzasadnienie ? `<p class="sprawa-powod">${esc(c.zus.uzasadnienie)}</p>` : ''}
    ${walidacja}
    <dl class="sprawa-fakty">${fakty}</dl>
    ${c.zus?.okresy?.length && decyzja !== 'nieustalona' ? `<h3>${decyzja === 'odmowa' ? 'Okresy objęte odmową' : 'Okresy odczytane z dokumentacji'}</h3><ul class="sprawa-ryzyka">${okresy(c.zus.okresy)}</ul>` : ''}
    ${c.wnioskowaneOkresy?.length ? `<h3>Okresy z wniosku — niepotwierdzone jako przyznane</h3><ul class="sprawa-ryzyka">${okresy(c.wnioskowaneOkresy)}</ul>` : ''}
    ${rows ? `<h3>Porównanie z kalkulatorem Otuli</h3><div class="sprawa-por">${rows}</div>${powod}` : ''}
    ${c.ryzyka?.length ? `<h3>Na co uważać w takiej sytuacji</h3><ul class="sprawa-ryzyka">${c.ryzyka.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
    <div class="case-actions">${c.kalkulator ? `<button class="button primary" data-sprawy="kalkulator">Przelicz w kalkulatorze ${icon('arrow', 16)}</button>` : ''}
      <button class="button secondary" data-sprawy="podglad">${SPRAWY.preview ? 'Ukryj dokument' : 'Pokaż dokument'}</button>
      <button class="button secondary" data-sprawy="reset">Inny plik</button></div>
    ${SPRAWY.preview ? `<iframe class="sprawa-pdf" src="${SPRAWY.url}" title="Podgląd wgranego dokumentu"></iframe>` : ''}
  </section>`;
}

function sprawdzSprawePage() {
  const n = Object.keys(window.ZUS_SPRAWY_ENC?.items || {}).length;
  const kat = window.ZUS_SPRAWY_ENC?.kategorie || {};
  const stat = window.ZUS_SPRAWY_ENC?.statystyki;
  return `<div class="page-intro"><div class="small-label">Zestaw testowy ZUS</div><h1 tabindex="-1">Sprawdź sprawę</h1>
    <p>Wybierz oryginalny PDF z zestawu. Otula rozpozna sprawę, pokaże odczytane informacje i wskaże, co jeszcze trzeba potwierdzić w dokumentach.</p></div>
    <ol class="sprawa-kroki" aria-label="Etapy"><li class="${SPRAWY.file ? 'done' : 'now'}"><b>1</b>Wgraj</li><li class="${SPRAWY.result ? 'done' : SPRAWY.file ? 'now' : ''}"><b>2</b>Rozpoznaj</li><li class="${SPRAWY.result ? 'now' : ''}"><b>3</b>Porównaj</li></ol>
    ${SPRAWY.file ? '' : `<label class="sprawa-drop" id="sprawa-drop">${icon('file', 34)}<strong>Przeciągnij tutaj plik PDF</strong><span>albo</span><span class="button primary">Wybierz plik</span>
      <input type="file" id="sprawa-plik" accept="application/pdf,.pdf"><small>${icon('lock', 14)} Plik zostaje na tym urządzeniu</small></label>`}
    <div id="sprawa-wynik" aria-live="polite">${sprawyWynik()}</div>
    ${n ? `<section class="sprawa-zakres"><h2>Rozpoznawane sprawy z zestawu ZUS: ${n}</h2>
      ${stat ? `<p>${esc(stat.odczytaneRozstrzygniecie)} spraw z odczytaną decyzją lub adnotacją o wyniku; ${esc(stat.nieustaloneRozstrzygniecie)} z nieustalonym rozstrzygnięciem. Zweryfikowane kwoty: ${esc(stat.zweryfikowaneKwoty)}.</p><p>Rozpoznanie dokumentu nie oznacza pełnej weryfikacji uprawnienia ani zgodności kwoty z kalkulatorem.</p>` : ''}
      <div class="sprawa-tagi">${Object.entries(kat).map(([k, v]) => `<span>${esc(SPRAWY_KAT[k] || k)} · ${v}</span>`).join('')}</div></section>` : ''}`;
}

// Wejście z kalkulatora: plik już rozpoznany w teczce sprawy.
function sprawyPokaz(file, wynik) {
  if (SPRAWY.url) URL.revokeObjectURL(SPRAWY.url);
  Object.assign(SPRAWY, { file, url: URL.createObjectURL(file), result: wynik, error: '', preview: false });
  location.hash = 'sprawdz-sprawe';
}
async function sprawyWczytaj(file) {
  if (!file) return;
  if (SPRAWY.url) URL.revokeObjectURL(SPRAWY.url);
  Object.assign(SPRAWY, { file, url: URL.createObjectURL(file), result: null, error: '', preview: false });
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') SPRAWY.error = 'Wybierz plik w formacie PDF.';
  else try { SPRAWY.result = await sprawyRozpoznaj(file); } catch { SPRAWY.error = 'Plik jest uszkodzony albo przeglądarka nie obsługuje odczytu.'; }
  render(); document.querySelector('#sprawa-wynik h2')?.focus();
}

document.addEventListener('change', e => { if (e.target.id === 'sprawa-plik') sprawyWczytaj(e.target.files[0]); });
document.addEventListener('dragover', e => { const d = e.target.closest?.('#sprawa-drop'); if (d) { e.preventDefault(); d.classList.add('nad'); } });
document.addEventListener('dragleave', e => e.target.closest?.('#sprawa-drop')?.classList.remove('nad'));
document.addEventListener('drop', e => { if (e.target.closest?.('#sprawa-drop')) { e.preventDefault(); sprawyWczytaj(e.dataTransfer.files[0]); } });
document.addEventListener('click', e => {
  const a = e.target.closest('[data-sprawy]')?.dataset.sprawy;
  if (!a) return;
  if (a === 'reset') { if (SPRAWY.url) URL.revokeObjectURL(SPRAWY.url); Object.assign(SPRAWY, { file: null, url: '', result: null, error: '', preview: false }); render(); }
  if (a === 'podglad') { SPRAWY.preview = !SPRAWY.preview; render(); }
  if (a === 'kalkulator' && SPRAWY.result?.kalkulator) { zusSaveDraft({ ...zusInitial(), ...SPRAWY.result.kalkulator, reviewInsurance: true, reviewBasis: true, reviewDates: true }); zusAutoSubmit = true; location.hash = 'kalkulator'; }
});
