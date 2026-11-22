// Analiza tekstu z dokumentu ZUS (warstwa tekstowa PDF albo OCR).
// Rozpoznaje typ dokumentu, kod tytułu ubezpieczenia, PESEL (maskowany), kwoty i daty,
// wyciąga podstawę wymiaru i porównuje ją z silnikiem reguł. Działa heurystycznie — wynik
// zawsze pokazujemy do potwierdzenia przez użytkownika.

import { calculate, DEFAULT_RULES } from './engine.js';

const norm = (t) => (t || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ');

const AMOUNT = /(\d{1,3}(?:[ . ]\d{3})*|\d+)[,.](\d{2})(?!\d)/g;
const toNum = (s) => Number(String(s).replace(/[ . ]/g, '').replace(',', '.'));

const CATEGORIES = [
  { id: 'martwe-urodzenie', re: /martw\w* urodz|martwo\s?urodz|zgon\w* dziecka/i, label: 'Urodzenie martwego dziecka' },
  { id: 'wczesniak', re: /wcze[sś]niak|uzupe[lł]niaj\w* urlop|hospitaliz/i, label: 'Wcześniak / uzupełniający urlop macierzyński' },
  { id: 'adopcja', re: /przysposob|przyj[eę]ci\w* dziecka na wychowanie|rodzin\w* zast[eę]pcz/i, label: 'Przyjęcie dziecka na wychowanie' },
  { id: 'zadluzenie', re: /zad[lł]u[zż]eni/i, label: 'Zadłużenie składkowe' },
  { id: 'odmowa', re: /odmow|nie przys[lł]uguje|nie podlega/i, label: 'Odmowa / brak prawa' },
  { id: 'laczenie', re: /[lł][aą]czeni\w* urlopu|wymiarze .{0,20}etatu|po[lł]ow\w* etatu/i, label: 'Łączenie rodzicielskiego z pracą' },
  { id: 'ojcowski', re: /urlop\w* ojcowsk|ojcowski/i, label: 'Urlop ojcowski' },
  { id: 'za-zyciem', re: /za [zż]yciem/i, label: 'Zaświadczenie „Za życiem”' },
  { id: 'likwidacja', re: /likwidac|upad[lł]o[sś]/i, label: 'Likwidacja / upadłość pracodawcy' },
  { id: 'chorobowy', re: /zasi[lł]\w* chorobow|e-?zla|niezdolno[sś]/i, label: 'Zasiłek chorobowy w ciąży' },
  { id: 'rodzicielski', re: /rodzicielsk/i, label: 'Urlop rodzicielski' },
  { id: 'macierzynski', re: /macierzy[nń]sk/i, label: 'Zasiłek macierzyński' },
];

const DOC_TYPES = [
  { id: 'Z-3a', re: /Z-?3a\b/i },
  { id: 'Z-3', re: /\bZ-?3\b(?!a)/i },
  { id: 'ZAM', re: /\bZAM\b/ },
  { id: 'ZAS-53', re: /ZAS-?53/i },
  { id: 'ZAS-12', re: /ZAS-?12/i },
  { id: 'Decyzja ZUS', re: /decyzj/i },
  { id: 'Poświadczenie ubezpieczenia', re: /po[sś]wiadczeni\w* ubezpiecz/i },
];

const TITLE_CODES = [
  { re: /\b01\s?1[01]\s?\d{2}\b/, emp: 'uop', label: 'Umowa o pracę' },
  { re: /\b04\s?11\s?\d{2}\b/, emp: 'zlecenie', label: 'Umowa zlecenia' },
  { re: /\b05\s?[1-9]\d\s?\d{2}\b/, emp: 'jdg', label: 'Pozarolnicza działalność' },
];

export function analyzeText(text, { fileName = 'dokument.pdf', rules = DEFAULT_RULES } = {}) {
  const t = norm(text);
  const lower = t.toLowerCase();
  const found = [];

  const pesel = (t.match(/\b\d{11}\b/) || [])[0];
  const peselMasked = pesel ? pesel.slice(0, 6) + '*****' : null;
  const nip = (t.match(/NIP[:\s]*([\d-]{10,13})/i) || [])[1];

  let code = null;
  let employment = null;
  for (const c of TITLE_CODES) {
    const m = t.match(c.re);
    if (m) { code = m[0].replace(/\s/g, '').replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3'); employment = c.emp; found.push(`Kod tytułu ${code} (${c.label})`); break; }
  }
  if (!employment) {
    if (/umow\w* o prac/i.test(t)) employment = 'uop';
    else if (/zleceni/i.test(t)) employment = 'zlecenie';
    else if (/dzia[lł]alno[sś]/i.test(t)) employment = 'jdg';
    else if (/umow\w* o dzie[lł]o/i.test(t)) employment = 'none';
  }

  const docTypes = DOC_TYPES.filter((d) => d.re.test(t)).map((d) => d.id);
  const categories = CATEGORIES.filter((c) => c.re.test(t)).map((c) => ({ id: c.id, label: c.label }));

  // Podstawa wymiaru: kwota najbliżej frazy "podstaw"
  const amounts = [];
  let m;
  AMOUNT.lastIndex = 0;
  while ((m = AMOUNT.exec(t))) {
    const v = toNum(m[1] + ',' + m[2]);
    if (v >= 100 && v <= 100000) amounts.push({ v, i: m.index });
  }
  let base = null;
  const baseIdx = [...lower.matchAll(/podstaw\S* wymiar\S*/g)].map((x) => x.index);
  if (baseIdx.length && amounts.length) {
    let best = null;
    for (const bi of baseIdx) for (const a of amounts) {
      const d = a.i - bi;
      if (d >= 0 && d < 400 && (!best || d < best.d)) best = { d, v: a.v };
    }
    if (best) base = best.v;
  }
  const monthlyAmounts = amounts.map((a) => a.v);

  const rate = /81[,.]5\s?%/.test(t) ? 81.5 : /70\s?%/.test(t) && !/100\s?%/.test(t) ? 70 : /100\s?%/.test(t) ? 100 : null;
  const dates = [...t.matchAll(/\b(\d{2})[.-](\d{2})[.-](20\d{2})\b/g)].map((d) => `${d[3]}-${d[2]}-${d[1]}`);
  const birth = (t.match(/urodz\w*[^\d]{0,40}(\d{2})[.-](\d{2})[.-](20\d{2})/i) || []);
  const birthDate = birth.length ? `${birth[3]}-${birth[2]}-${birth[1]}` : dates[0] || null;
  const debt = (() => {
    const i = lower.indexOf('zadłuż');
    if (i < 0) return 0;
    const a = amounts.find((x) => x.i > i && x.i - i < 250);
    return a ? a.v : 0;
  })();
  const kids = /bli[zź]ni/i.test(t) ? 2 : /troja/i.test(t) ? 3 : 1;

  const has = (id) => categories.some((c) => c.id === id);
  const input = {
    employment: has('odmowa') && /nie podlega/i.test(t) ? 'none' : employment || 'uop',
    voluntarySickness: true,
    grossSalary: 0,
    baseOverride: base,
    children: kids,
    zaZyciem: has('za-zyciem'),
    stillbirth: has('martwe-urodzenie'),
    premature: has('wczesniak') ? 'preterm' : 'none',
    hospitalWeeks: has('wczesniak') ? 8 : 0,
    // Formularze ZUS wymieniają wszystkie warianty, więc adopcję uznajemy tylko przy braku śladów porodu.
    event: has('adopcja') && !/urodzeni\w* dziecka|porod|poród|data urodzenia/i.test(t) ? (/zast[eę]pcz/i.test(t) ? 'foster' : 'adoption') : 'bio',
    debt: has('zadluzenie') ? debt : 0,
    variant: rate === 81.5 ? 'A' : 'B',
    work: has('laczenie') ? { fraction: 0.5, weeks: 8 } : { fraction: 0, weeks: 0 },
    birthDate: birthDate || undefined,
    employerSize: 21,
  };
  if (!base) input.grossSalary = 0;

  const result = calculate(input, rules);
  const decision = has('odmowa') ? 'odmowa' : /przyzna/i.test(t) ? 'przyznano' : 'nieokreślona';
  const insured = input.employment !== 'none' && decision !== 'odmowa';

  const checks = [
    { label: 'Tytuł ubezpieczenia chorobowego', ok: insured, value: code ? `${code}` : employment ? employment.toUpperCase() : 'nie rozpoznano' },
    { label: 'Podstawa wymiaru zasiłku', ok: !!base, value: base ? base.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' zł' : 'nie znaleziono — wpisz ręcznie' },
    { label: 'Stawka zasiłku', ok: !!rate, value: rate ? rate + '%' : 'brak w dokumencie' },
    { label: 'Zadłużenie składkowe', ok: !input.debt, value: input.debt ? input.debt.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' zł' : 'brak informacji / 0 zł' },
  ];

  return {
    fileName,
    chars: t.length,
    peselMasked,
    nip: nip || null,
    code,
    employment: input.employment,
    docTypes,
    categories,
    base,
    rate,
    debt: input.debt,
    birthDate,
    dates: [...new Set(dates)].slice(0, 8),
    amounts: [...new Set(monthlyAmounts)].slice(0, 12),
    decision,
    insured,
    found,
    checks,
    confidence: Math.min(0.99, 0.25 + 0.15 * checks.filter((c) => c.ok).length + (t.length > 500 ? 0.1 : 0)),
    input,
    result,
    excerpt: t.slice(0, 1800),
  };
}
