// Silnik reguł zasiłku macierzyńskiego — wspólny dla backendu (REST API) i frontendu (tryb offline).
// Stan prawny: ustawa zasiłkowa (Dz.U. 2026 poz. 854), Kodeks pracy (Dz.U. 2026 poz. 1245),
// załącznik do wyzwania HackNation 2026 „Zasiłkowy Przewodnik Przyszłego Rodzica”.
// Wszystkie wartości liczbowe pochodzą z obiektu `rules` — panel administracyjny może je zmienić
// bez modyfikacji kodu (wymóg: zmiany legislacyjne).

export const DEFAULT_RULES = Object.freeze({
  version: '2026-11-22',
  legalState: '1 listopada 2026 r.',
  maternityWeeks: [20, 31, 33, 35, 37], // 1..5+ dzieci przy jednym porodzie
  adoptionMinWeeks: 9, // urlop na warunkach macierzyńskiego nie krócej niż 9 tyg.
  mandatoryMotherWeeks: 14,
  parentalWeeks: [41, 43], // 1 dziecko / więcej dzieci (z 9 tyg. dla każdego rodzica)
  zaZyciemParentalWeeks: [65, 67],
  reservedWeeks: 9,
  paternityDays: 14,
  stillbirthWeeks: 8,
  supplementaryMaxWeeks: { extreme: 15, preterm: 8, term: 8 },
  rates: { maternity: 100, parental: 70, combined: 81.5, reserved: 70, paternity: 100, supplementary: 100 },
  employeeContributions: 13.71, // % składek finansowanych przez ubezpieczonego
  minWage: 4806,
  voluntaryMaxBase: 23550, // maks. podstawa dobrowolnej składki chorobowej (miesięcznie)
  parentalBenefitMin: 1000, // kwota świadczenia rodzicielskiego (podwyższenie, art. 31 ust. 3a)
  debtThresholdPct: 1, // % minimalnego wynagrodzenia (art. 2a)
  debtRepayMonths: 6,
  payerThreshold: 20, // art. 61 ust. 1 pkt 1
  applicationDays: 21, // art. 30a
  pit: { rate: 12, monthlyReduction: 300 },
  maxWorkFraction: 0.5,
  waitingDays: { mandatory: 30, voluntary: 90 },
  sicknessPeriodDays: 270,
});

const r2 = (x) => Math.round(x * 100) / 100;
export const pln = (x) =>
  (Number.isFinite(x) ? x : 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
export const plnShort = (x) => Math.round(Number.isFinite(x) ? x : 0).toLocaleString('pl-PL') + ' zł';

export const DEFAULT_INPUT = {
  event: 'bio', // bio | adoption | foster
  children: 1,
  childAge: 0, // dla adopcji / rodziny zastępczej (lata)
  zaZyciem: false,
  stillbirth: false,
  premature: 'none', // none | extreme (<28 tc lub ≤1000 g) | preterm (28–37 tc) | term (hospitalizacja po 37 tc)
  hospitalWeeks: 0,
  employment: 'uop', // uop | zlecenie | jdg | liquidation | none
  voluntarySickness: true, // dla zlecenia / JDG
  insuredDays: 400, // nieprzerwany okres ubezpieczenia chorobowego
  grossSalary: 7500, // średnie miesięczne wynagrodzenie / przychód brutto z 12 m-cy
  baseOverride: null, // podstawa wymiaru ustalona przez płatnika (np. z Z-3)
  employerSize: 38,
  debt: 0, // zadłużenie składkowe (JDG) na dzień powstania prawa
  variant: 'A', // A = wniosek w 21 dni (81,5%), B = 100% / 70%
  fatherMaternityWeeks: 0, // przejęcie części macierzyńskiego po 14 tyg.
  motherParentalWeeks: null, // łączny urlop rodzicielski matki (min. 9, maks. pula − 9 tyg. ojca)
  fatherUsesReserved: true,
  fatherInsured: true,
  fatherGrossSalary: 6800,
  fatherEmployment: 'jdg',
  fatherPaternity: true,
  work: { fraction: 0, weeks: 0 }, // łączenie rodzicielskiego z pracą
  pit2: true,
  under26: false,
  birthDate: '2026-05-15',
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function benefitBase(gross, employment, rules = DEFAULT_RULES, override = null) {
  if (override != null && override !== '' && Number(override) > 0) {
    return { base: r2(Number(override)), deduction: 0, capped: false, fromDocument: true };
  }
  let g = Number(gross) || 0;
  let capped = false;
  if ((employment === 'zlecenie' || employment === 'jdg') && g > rules.voluntaryMaxBase && employment === 'jdg') {
    g = rules.voluntaryMaxBase;
    capped = true;
  }
  const deduction = r2((g * rules.employeeContributions) / 100);
  return { base: r2(g - deduction), deduction, capped, fromDocument: false };
}

export function netOf(gross, input, rules = DEFAULT_RULES) {
  if (input.under26) return r2(gross);
  const tax = Math.max(0, Math.round((gross * rules.pit.rate) / 100 - (input.pit2 ? rules.pit.monthlyReduction : 0)));
  return r2(gross - tax);
}

const monthly = (base, rate, rules) => {
  const m = (base * rate) / 100;
  return { amount: r2(Math.max(m, rules.parentalBenefitMin)), raised: m < rules.parentalBenefitMin };
};

function addDays(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function addMonths(iso, months) {
  const d = new Date(iso + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Główna funkcja: ustala uprawnienia, wymiar i wysokość zasiłku dla obojga rodziców. */
export function calculate(rawInput = {}, rules = DEFAULT_RULES) {
  const input = { ...DEFAULT_INPUT, ...rawInput, work: { ...DEFAULT_INPUT.work, ...(rawInput.work || {}) } };
  const issues = [];
  const notes = [];
  const kids = clamp(Number(input.children) || 1, 1, 5);
  const multi = kids > 1;
  const R = rules.rates;

  // ---------- 1. Prawo do zasiłku (tytuł ubezpieczenia) ----------
  let status = 'ok'; // ok | warning | blocked | denied | special
  const emp = input.employment;
  if (emp === 'none') {
    status = 'denied';
    issues.push({
      level: 'danger',
      title: 'Brak tytułu do ubezpieczenia chorobowego w dniu porodu',
      text: `Zasiłek macierzyński z ZUS nie przysługuje. Rodzinie przysługuje świadczenie rodzicielskie ${plnShort(rules.parentalBenefitMin)} miesięcznie przez 52 tygodnie — wniosek do gminy / przez Emp@tię w ciągu 3 miesięcy od porodu.`,
      law: 'Art. 29 ustawy zasiłkowej; art. 17c ustawy o świadczeniach rodzinnych',
    });
  }
  if ((emp === 'zlecenie' || emp === 'jdg') && !input.voluntarySickness) {
    status = 'denied';
    issues.push({
      level: 'danger',
      title: 'Brak dobrowolnego ubezpieczenia chorobowego',
      text: 'Przy umowie zlecenia i działalności gospodarczej ubezpieczenie chorobowe jest dobrowolne. Bez zgłoszenia do niego zasiłek macierzyński nie przysługuje.',
      law: 'Art. 29 ust. 1 ustawy zasiłkowej; art. 11 ustawy o sus',
    });
  }
  if (emp === 'jdg' && input.voluntarySickness) {
    const threshold = r2((rules.minWage * rules.debtThresholdPct) / 100);
    if (Number(input.debt) > threshold) {
      status = 'blocked';
      issues.push({
        level: 'warning',
        title: `Zadłużenie składkowe ${pln(Number(input.debt))} (próg ${pln(threshold)})`,
        text: `Świadczenie nie zostanie wypłacone do czasu spłaty całości zadłużenia. Prawo przedawnia się, jeżeli zadłużenie nie zostanie uregulowane w ciągu ${rules.debtRepayMonths} miesięcy od dnia powstania prawa.`,
        law: 'Art. 2a ust. 1–2 ustawy zasiłkowej',
      });
    }
  }
  if (emp === 'liquidation') {
    status = 'special';
    notes.push({
      title: 'Zasiłek w wysokości zasiłku macierzyńskiego do dnia porodu',
      text: 'Po rozwiązaniu umowy w ciąży z powodu upadłości lub likwidacji pracodawcy przysługuje do dnia porodu zasiłek w wysokości 100% podstawy, wypłacany przez ZUS. Po porodzie — zasiłek macierzyński po ustaniu ubezpieczenia.',
      law: 'Art. 30 ust. 3 ustawy zasiłkowej',
    });
  }
  // Uwaga: okres wyczekiwania (art. 4) dotyczy zasiłku chorobowego, nie macierzyńskiego.
  const voluntary = emp === 'zlecenie' || emp === 'jdg';
  const waiting = voluntary ? rules.waitingDays.voluntary : rules.waitingDays.mandatory;
  if (emp !== 'none' && Number(input.insuredDays) < waiting) {
    issues.push({
      level: 'info',
      title: `Krótki staż ubezpieczenia (${input.insuredDays} dni)`,
      text: `Zasiłek chorobowy w ciąży przysługuje po ${waiting} dniach nieprzerwanego ubezpieczenia. Zasiłek macierzyński nie wymaga okresu wyczekiwania, ale ZUS może zweryfikować tytuł ubezpieczenia (pozorność umowy).`,
      law: 'Art. 4 ust. 1 ustawy zasiłkowej; art. 83 Kc',
    });
  }

  // ---------- 2. Podstawa wymiaru ----------
  const b = benefitBase(input.grossSalary, emp, rules, input.baseOverride);
  const base = b.base;
  if (b.capped)
    notes.push({ title: 'Ograniczenie podstawy', text: `Podstawa dobrowolnej składki chorobowej nie może przekraczać ${pln(rules.voluntaryMaxBase)} miesięcznie.`, law: 'Załącznik do wyzwania' });
  if (!b.fromDocument && Number(input.grossSalary) < rules.minWage && emp === 'uop')
    issues.push({ level: 'info', title: 'Wynagrodzenie poniżej płacy minimalnej', text: `Przy pełnym etacie podstawa nie powinna być niższa niż ${pln(r2(rules.minWage * (1 - rules.employeeContributions / 100)))}. Sprawdź wymiar etatu.`, law: 'Załącznik do wyzwania, pkt 2' });

  // ---------- 3. Wymiar ----------
  let maternityWeeks = rules.maternityWeeks[kids - 1];
  let maternityLabel = 'Urlop macierzyński';
  if (input.event !== 'bio') {
    maternityLabel = 'Urlop na warunkach urlopu macierzyńskiego';
    const limit = input.event === 'foster' ? 7 : 14;
    if (Number(input.childAge) >= limit) {
      status = status === 'ok' ? 'denied' : status;
      issues.push({ level: 'danger', title: `Dziecko w wieku ${input.childAge} lat`, text: input.event === 'foster' ? 'Rodzinie zastępczej niezawodowej urlop przysługuje do 7. roku życia dziecka (do 10 lat przy odroczonym obowiązku szkolnym).' : 'Przy przysposobieniu urlop przysługuje do 14. roku życia dziecka.', law: 'Art. 183 Kp; art. 29 ust. 1 pkt 2–3 ustawy zasiłkowej' });
    }
    notes.push({ title: 'Przyjęcie dziecka na wychowanie', text: `Wymiar jak przy porodzie, liczony od dnia przyjęcia dziecka, nie krócej niż ${rules.adoptionMinWeeks} tygodni. Brak obowiązkowych 14 tygodni dla matki. Wniosek o 81,5% — w ciągu 21 dni od przyjęcia dziecka.`, law: 'Art. 183 Kp; art. 30a ust. 2 ustawy zasiłkowej' });
  }
  if (input.stillbirth) {
    maternityWeeks = rules.stillbirthWeeks;
    notes.push({ title: 'Urodzenie martwego dziecka', text: `Zasiłek macierzyński za okres urlopu macierzyńskiego w wymiarze ${rules.stillbirthWeeks} tygodni po porodzie (nie krócej niż 7 dni od zgonu). Urlop rodzicielski nie przysługuje. Przysługuje zasiłek pogrzebowy.`, law: 'Art. 180 § 4 Kp' });
  }

  let supplementaryWeeks = 0;
  if (!input.stillbirth && input.premature !== 'none' && input.event === 'bio') {
    const max = rules.supplementaryMaxWeeks[input.premature] || 8;
    supplementaryWeeks = clamp(Math.ceil(Number(input.hospitalWeeks) || 0), 0, max);
    notes.push({ title: 'Uzupełniający urlop macierzyński', text: `1 tydzień za każdy tydzień hospitalizacji dziecka (niepełny tydzień w górę), maksymalnie ${max} tygodni. Udzielany jednorazowo, bezpośrednio po urlopie macierzyńskim, 100% podstawy. Wymaga zaświadczenia ze szpitala.`, law: 'Art. 180¹ Kp; załącznik do wyzwania' });
  }

  const parentalTotal = input.stillbirth ? 0 : input.zaZyciem ? rules.zaZyciemParentalWeeks[multi ? 1 : 0] : rules.parentalWeeks[multi ? 1 : 0];
  const reserved = input.stillbirth ? 0 : rules.reservedWeeks;
  const commonPool = Math.max(0, parentalTotal - 2 * reserved); // pula, którą rodzice mogą dowolnie podzielić
  // motherParentalWeeks = łączny rodzicielski matki (jej 9 tyg. + część puli wspólnej); reszta puli → ojciec.
  const motherParental = input.stillbirth ? 0 : clamp(input.motherParentalWeeks == null || input.motherParentalWeeks === '' ? parentalTotal - reserved : Number(input.motherParentalWeeks), Math.min(reserved, parentalTotal), parentalTotal - reserved);
  const fatherCommon = input.stillbirth ? 0 : Math.max(0, parentalTotal - reserved - motherParental);
  const fatherReserved = input.fatherInsured && input.fatherUsesReserved && !input.stillbirth ? reserved : 0;
  const fatherParentalCommon = input.fatherInsured ? fatherCommon : 0;
  if (!input.fatherInsured && !input.stillbirth)
    issues.push({ level: 'info', title: 'Drugi rodzic nie podlega ubezpieczeniu chorobowemu', text: `${reserved} tygodni urlopu rodzicielskiego zastrzeżonych dla drugiego rodzica nie może zostać przeniesionych — przepadną.`, law: 'Art. 182¹a § 4 Kp' });

  const maxFatherMat = input.event === 'bio' && !input.stillbirth ? Math.max(0, maternityWeeks - rules.mandatoryMotherWeeks) : maternityWeeks;
  const fatherMat = input.fatherInsured ? clamp(Number(input.fatherMaternityWeeks) || 0, 0, maxFatherMat) : 0;
  const motherMat = maternityWeeks - fatherMat;

  // ---------- 4. Łączenie z pracą (art. 182¹e Kp) ----------
  const frac = clamp(Number(input.work.fraction) || 0, 0, rules.maxWorkFraction);
  const workWeeks = clamp(Number(input.work.weeks) || 0, 0, motherParental);
  const extension = r2(workWeeks * frac); // wydłużenie proporcjonalne
  if (frac > 0 && emp !== 'uop')
    issues.push({ level: 'info', title: 'Łączenie urlopu z pracą dotyczy pracowników', text: 'Przy zleceniu i działalności zasiłek za okres odpowiadający rodzicielskiemu przysługuje, jeśli nie wykonujesz pracy zarobkowej — podjęcie pracy powoduje utratę zasiłku za ten okres.', law: 'Art. 17 ustawy zasiłkowej; art. 182¹e Kp' });

  // ---------- 5. Wysokość ----------
  const A = input.variant === 'A';
  const matRate = A ? R.combined : R.maternity;
  const parRate = A ? R.combined : R.parental;
  const fatherB = benefitBase(input.fatherGrossSalary, input.fatherEmployment, rules);
  const fatherBase = fatherB.base;

  const payerMother = emp === 'uop' && Number(input.employerSize) > rules.payerThreshold ? 'employer' : 'zus';
  const payerLabel = (p) => (p === 'employer' ? `Pracodawca (płatnik > ${rules.payerThreshold} ubezpieczonych)` : 'ZUS');
  const payerFather = input.fatherEmployment === 'uop' && Number(input.fatherEmployerSize ?? 50) > rules.payerThreshold ? 'employer' : 'zus';

  const seg = [];
  const push = (who, kind, weeks, rate, b0, payer, extra = {}) => {
    if (weeks <= 0) return;
    const m = monthly(b0, rate, rules);
    const total = r2((m.amount / 30) * weeks * 7);
    seg.push({ who, kind, weeks: r2(weeks), rate, monthly: m.amount, raised: m.raised, net: netOf(m.amount, input, rules), total, payer, payerLabel: payerLabel(payer), ...extra });
  };
  push('Matka', maternityLabel, motherMat, matRate, base, payerMother, { color: 'maternity' });
  push('Ojciec', `${maternityLabel} (przejęcie)`, fatherMat, matRate, fatherBase, payerFather, { color: 'cession' });
  push('Matka / Ojciec', 'Uzupełniający urlop macierzyński', supplementaryWeeks, R.supplementary, base, payerMother, { color: 'supplementary' });
  const motherParentalPlain = motherParental - workWeeks;
  push('Matka', 'Urlop rodzicielski', motherParentalPlain, parRate, base, payerMother, { color: 'parental' });
  if (workWeeks > 0) {
    const leaveWeeks = r2(workWeeks + extension); // łączny czas trwania z wydłużeniem
    const m = monthly(base, parRate, rules);
    const reduced = r2(m.amount * (1 - frac));
    seg.push({ who: 'Matka', kind: `Rodzicielski + praca ${frac === 0.5 ? '1/2' : frac === 0.25 ? '1/4' : frac} etatu`, weeks: leaveWeeks, rate: parRate, monthly: reduced, net: netOf(reduced, input, rules), total: r2((reduced / 30) * leaveWeeks * 7), payer: payerMother, payerLabel: payerLabel(payerMother), color: 'work', salary: r2((Number(input.grossSalary) || 0) * frac) });
  }
  push('Ojciec', 'Urlop rodzicielski (pula wspólna)', fatherParentalCommon, parRate, fatherBase, payerFather, { color: 'parental' });
  push('Ojciec', `Urlop rodzicielski — ${reserved} tyg. nieprzenoszalne`, fatherReserved, R.reserved, fatherBase, payerFather, { color: 'reserved' });

  const paternity = input.event === 'bio' || input.event === 'adoption' ? input.fatherInsured && input.fatherPaternity && !input.stillbirth : false;
  if (paternity) {
    const m = monthly(fatherBase, R.paternity, rules);
    seg.push({ who: 'Ojciec', kind: 'Urlop ojcowski (14 dni)', weeks: 2, rate: R.paternity, monthly: m.amount, net: netOf(m.amount, input, rules), total: r2((m.amount / 30) * rules.paternityDays), payer: payerFather, payerLabel: payerLabel(payerFather), color: 'paternity', independent: true });
  }

  const mainSeg = seg.filter((s) => !s.independent);
  const totalWeeks = r2(mainSeg.reduce((a, s) => a + s.weeks, 0));
  const totalGross = denied(status) ? 0 : r2(seg.reduce((a, s) => a + s.total, 0));
  const motherSeg = seg.filter((s) => s.who === 'Matka');

  // Porównanie wariantów dla matki (bez pracy) — do kart A/B
  const vA = monthly(base, R.combined, rules).amount;
  const v100 = monthly(base, R.maternity, rules).amount;
  const v70 = monthly(base, R.parental, rules).amount;
  const motherWeeksMat = motherMat + supplementaryWeeks;
  const totalA = r2((vA / 30) * 7 * (motherWeeksMat + motherParental));
  const totalB = r2((v100 / 30) * 7 * motherWeeksMat + (v70 / 30) * 7 * motherParental);

  // ---------- 6. Harmonogram miesięczny ----------
  const schedule = buildSchedule(mainSeg, input.birthDate);

  // ---------- 7. Terminy ----------
  const bd = input.birthDate;
  const deadlines = bd
    ? [
        { id: 'zam', title: 'Wniosek ZAM / wniosek do pracodawcy o pełny urlop (81,5%)', date: addDays(bd, rules.applicationDays), critical: true, law: 'Art. 30a ustawy zasiłkowej', who: payerMother === 'employer' ? 'Pracodawca' : 'ZUS (eZUS)' },
        { id: 'usc', title: 'Zgłoszenie urodzenia w USC / mObywatel', date: addDays(bd, 21), critical: false, law: 'Art. 55 Prawa o aktach stanu cywilnego (21 dni od sporządzenia karty urodzenia)', who: 'USC / mObywatel' },
        { id: 'nfz', title: 'Zgłoszenie dziecka do ubezpieczenia zdrowotnego (ZUS ZCNA)', date: addDays(bd, 7), critical: false, law: 'Ustawa o świadczeniach opieki zdrowotnej', who: 'Pracodawca / ZUS' },
        { id: 'swiadczenie', title: 'Świadczenie rodzicielskie (gdy brak zasiłku)', date: addMonths(bd, 3), critical: false, law: 'Art. 17c ustawy o świadczeniach rodzinnych', who: 'Gmina / Emp@tia', onlyDenied: true },
        { id: 'ojcowski', title: 'Ostatni dzień na urlop ojcowski', date: addMonths(bd, 12), critical: false, law: 'Art. 182³ Kp', who: 'Pracodawca ojca / ZUS' },
        { id: 'rodzicielski', title: 'Wniosek o urlop rodzicielski (bez wniosku w 21 dni)', date: addDays(bd, 20 * 7 - 21), critical: false, law: 'Rozporządzenie Dz.U. 2025 poz. 322 — min. 21 dni przed', who: 'Pracodawca', onlyB: true },
      ].filter((d) => (!d.onlyDenied || status === 'denied') && (!d.onlyB || input.variant === 'B'))
    : [];

  // ---------- 8. Dokumenty i ścieżka ----------
  const documents = buildDocuments(input, payerMother, supplementaryWeeks, rules);

  const risks = buildRisks(input, rules);

  return {
    input,
    rulesVersion: rules.version,
    status,
    entitled: !denied(status),
    issues,
    notes,
    base,
    deduction: b.deduction,
    fatherBase,
    weeks: { maternity: maternityWeeks, motherMat, fatherMat, supplementary: supplementaryWeeks, parentalTotal, commonPool, motherParental, fatherReserved, fatherParentalCommon, reserved, extension, total: totalWeeks, totalDays: Math.round(totalWeeks * 7), paternityDays: paternity ? rules.paternityDays : 0, maxFatherMat },
    variants: {
      A: { monthly: vA, net: netOf(vA, input, rules), total: totalA },
      B: { maternity: v100, parental: v70, netMaternity: netOf(v100, input, rules), netParental: netOf(v70, input, rules), total: totalB },
      reservedMonthly: monthly(fatherBase, R.reserved, rules).amount,
    },
    work: { fraction: frac, weeks: workWeeks, extension, salary: r2((Number(input.grossSalary) || 0) * frac), benefit: r2(monthly(base, parRate, rules).amount * (1 - frac)), combined: r2((Number(input.grossSalary) || 0) * frac + monthly(base, parRate, rules).amount * (1 - frac)) },
    segments: seg,
    motherMonthlyAvg: motherSeg.length ? r2(motherSeg.reduce((a, s) => a + s.monthly * s.weeks, 0) / motherSeg.reduce((a, s) => a + s.weeks, 0)) : 0,
    totalGross,
    payer: { mother: payerMother, motherLabel: payerLabel(payerMother), father: payerFather, fatherLabel: payerLabel(payerFather) },
    schedule,
    deadlines,
    documents,
    risks,
  };
}

const denied = (s) => s === 'denied';

function buildSchedule(segments, birthDate) {
  const rows = [];
  let week = 0;
  const start = birthDate ? new Date(birthDate + 'T12:00:00') : null;
  for (const s of segments) {
    const from = week;
    week += s.weeks;
    const fromDate = start ? new Date(start.getTime() + from * 7 * 864e5) : null;
    const toDate = start ? new Date(start.getTime() + (week * 7 - 1) * 864e5) : null;
    rows.push({
      ...s,
      fromWeek: Math.round(from * 10) / 10 + 1,
      toWeek: Math.round(week * 10) / 10,
      from: fromDate ? fromDate.toISOString().slice(0, 10) : null,
      to: toDate ? toDate.toISOString().slice(0, 10) : null,
    });
  }
  return rows;
}

function buildDocuments(input, payer, supplementaryWeeks, rules) {
  const emp = input.employment;
  const docs = [];
  if (emp === 'uop') {
    docs.push({ code: 'Wniosek o urlop', name: 'Wniosek o urlop macierzyński i rodzicielski (jeden wniosek w 21 dni = 81,5%)', to: 'Pracodawca', required: true });
    if (payer === 'zus') docs.push({ code: 'Z-3', name: 'Zaświadczenie płatnika składek Z-3 (wystawia pracodawca)', to: 'ZUS — przekazuje pracodawca', required: true });
  }
  if (emp === 'zlecenie') {
    docs.push({ code: 'ZAM', name: 'Wniosek o zasiłek macierzyński ZAM', to: 'Płatnik składek (> 20) lub ZUS', required: true });
    docs.push({ code: 'Z-3a', name: 'Zaświadczenie płatnika składek Z-3a', to: 'ZUS — przekazuje zleceniodawca', required: true });
  }
  if (emp === 'jdg') docs.push({ code: 'ZAM', name: 'Wniosek o zasiłek macierzyński ZAM (od 24.10.2026 obejmuje też rodzicielski i ojcowski)', to: 'ZUS (eZUS)', required: true });
  if (emp === 'liquidation') docs.push({ code: 'ZAS-53 / ZAM', name: 'Wniosek o zasiłek w wysokości zasiłku macierzyńskiego + świadectwo pracy', to: 'ZUS', required: true });
  if (emp === 'none') docs.push({ code: 'SR', name: 'Wniosek o świadczenie rodzicielskie (1000 zł)', to: 'Gmina / Emp@tia', required: true });
  if (emp !== 'none') {
    docs.push({ code: 'Akt urodzenia', name: input.event === 'bio' ? 'Skrócony odpis aktu urodzenia (ZUS pobiera z rejestru — dołącz, jeśli wezwie)' : 'Postanowienie sądu / umowa o pełnienie funkcji rodziny zastępczej', to: 'Do wniosku', required: input.event !== 'bio' });
    if (input.zaZyciem) docs.push({ code: 'Za życiem', name: 'Zaświadczenie lekarskie „Za życiem” (art. 4 ust. 3 ustawy)', to: 'Do wniosku', required: true });
    if (supplementaryWeeks > 0) docs.push({ code: 'Szpital', name: 'Zaświadczenie ze szpitala o okresie hospitalizacji dziecka', to: 'Do wniosku o uzupełniający urlop', required: true });
    if (input.stillbirth) docs.push({ code: 'Karta martwego urodzenia', name: 'Odpis aktu urodzenia z adnotacją o martwym urodzeniu + Z-12 (zasiłek pogrzebowy)', to: 'Pracodawca / ZUS', required: true });
    if (input.fatherInsured && (input.fatherMaternityWeeks > 0 || input.fatherUsesReserved))
      docs.push({ code: 'ZAM (ojciec)', name: 'Wniosek ojca o urlop / zasiłek za okres przejętego macierzyńskiego i rodzicielskiego', to: input.fatherEmployment === 'uop' ? 'Pracodawca ojca' : 'ZUS', required: true });
    if (input.fatherPaternity && input.fatherInsured) docs.push({ code: 'Urlop ojcowski', name: 'Wniosek o urlop ojcowski (min. 7 dni przed) — zasiłek w ZAM', to: input.fatherEmployment === 'uop' ? 'Pracodawca ojca' : 'ZUS', required: false });
  }
  return docs;
}

function buildRisks(input, rules) {
  const risks = [
    { id: 'pozornosc', title: 'Umowa zawarta dla pozoru', text: 'Zatrudnienie tuż przed porodem lub w ciąży może zostać zbadane przez ZUS. Brak dowodów rzeczywistej pracy = decyzja o niepodleganiu ubezpieczeniu.', law: 'Art. 83 Kc; art. 68 ustawy o sus', active: Number(input.insuredDays) < 180 },
    { id: 'podstawa', title: 'Podwyższenie podstawy w ciąży', text: 'Nagły wzrost wynagrodzenia w ciąży może skutkować ustaleniem przez ZUS niższej podstawy wymiaru.', law: 'Art. 58 § 2 Kc', active: Number(input.grossSalary) > 15000 },
    { id: 'ubezpieczenie', title: 'Brak ubezpieczenia w dniu porodu', text: 'Rozwiązanie umowy, koniec zlecenia lub wyrejestrowanie z dobrowolnego chorobowego przed porodem odbiera prawo do zasiłku macierzyńskiego.', law: 'Art. 29 ustawy zasiłkowej', active: input.employment === 'none' || input.employment === 'zlecenie' },
    { id: 'termin', title: 'Przekroczenie 21 dni', text: 'Wniosek po 21 dniach = 100% za macierzyński i 70% za rodzicielski. Brak wykorzystania rodzicielskiego w 1. roku życia dziecka = 70% zamiast 81,5%.', law: 'Art. 30a i 31 ust. 3g ustawy zasiłkowej', active: true },
    { id: 'dlug', title: 'Zadłużenie składkowe (JDG)', text: `Zaległość powyżej ${rules.debtThresholdPct}% płacy minimalnej wstrzymuje wypłatę; po ${rules.debtRepayMonths} mies. prawo przedawnia się.`, law: 'Art. 2a ustawy zasiłkowej', active: input.employment === 'jdg' },
    { id: 'praca', title: 'Praca zarobkowa w czasie zasiłku', text: 'Wykonywanie pracy zarobkowej (poza łączeniem z rodzicielskim u pracodawcy) powoduje utratę zasiłku za ten okres.', law: 'Art. 17 ustawy zasiłkowej', active: input.employment !== 'uop' },
    { id: 'ochrona', title: 'Ochrona stosunku pracy', text: 'Od wniosku o urlop do jego końca pracodawca nie może wypowiedzieć umowy. Umowa terminowa trwająca dłużej niż 1 mies. przedłuża się do dnia porodu. Nie dotyczy zlecenia i JDG.', law: 'Art. 177 Kp', active: input.employment === 'uop', positive: true },
  ];
  return risks;
}

/** Proste wyjaśnienia dla asystenta „Zapytaj Otulę” — dopasowanie słów kluczowych (bez zewnętrznego modelu). */
export const KNOWLEDGE = [
  { k: ['81', '21 dni', 'wariant', 'długi wniosek', 'zam'], a: 'Jeśli w ciągu 21 dni od porodu złożysz wniosek o urlop macierzyński i rodzicielski w pełnym wymiarze (pracodawcy albo ZAM do ZUS), cały zasiłek wyniesie 81,5% podstawy — z wyjątkiem 9 tygodni drugiego rodzica (70%). Bez takiego wniosku: 100% za macierzyński i 70% za rodzicielski.', law: 'Art. 30a, art. 31 ust. 3 i 3f ustawy zasiłkowej' },
  { k: ['jdg', 'działalno', 'firm', 'zawiesz'], a: 'Przy działalności gospodarczej potrzebne jest dobrowolne ubezpieczenie chorobowe. Zasiłek wypłaca ZUS na podstawie wniosku ZAM. Nie zawieszasz firmy, ale w okresie zasiłku nie możesz wykonywać pracy zarobkowej. Zadłużenie powyżej 1% płacy minimalnej wstrzymuje wypłatę do spłaty (6 miesięcy).', law: 'Art. 2a, art. 17 ustawy zasiłkowej' },
  { k: ['przed terminem', 'wcześniej', 'wcześniak', 'inkubator', 'hospital'], a: 'Termin 21 dni liczy się od faktycznej daty porodu. Gdy dziecko urodzi się przedwcześnie lub wymaga hospitalizacji, przysługuje uzupełniający urlop macierzyński: tydzień za tydzień w szpitalu, do 8 lub 15 tygodni, płatny 100%.', law: 'Art. 180¹ Kp' },
  { k: ['podstaw', '12 miesi', 'oblicz', '13,71'], a: 'Podstawa to przeciętne miesięczne wynagrodzenie z 12 miesięcy kalendarzowych przed miesiącem powstania prawa, pomniejszone o 13,71% składek pracownika. Premie kwartalne i roczne wlicza się w 1/12.', law: 'Art. 36 ustawy zasiłkowej' },
  { k: ['ojc', 'tata', '14 dni', 'tacierz'], a: 'Urlop ojcowski: 14 dni, 100% podstawy, jednorazowo lub w 2 częściach po min. 7 dni, do ukończenia przez dziecko 12 miesięcy. Niezależnie od tego ojciec ma 9 nieprzenoszalnych tygodni rodzicielskiego (70%) i może przejąć macierzyński po 14 tygodniach matki.', law: 'Art. 182³, 182¹a Kp' },
  { k: ['pół etatu', '1/2', 'praca', 'łącz', 'etat'], a: 'Pracownik może łączyć urlop rodzicielski z pracą u tego samego pracodawcy do 1/2 etatu. Urlop wydłuża się proporcjonalnie (np. 8 tygodni na 1/2 etatu = +4 tygodnie), a zasiłek przysługuje za część niewypracowaną.', law: 'Art. 182¹e Kp' },
  { k: ['martw', 'poron', 'strat', 'zgon'], a: 'Przy urodzeniu martwego dziecka lub zgonie przed 8. tygodniem życia przysługuje 8 tygodni zasiłku macierzyńskiego (100%), nie krócej niż 7 dni od zgonu. Przysługuje też zasiłek pogrzebowy. Wsparcie oferują m.in. fundacje opisane w zakładce „Trudne sytuacje”.', law: 'Art. 180 § 4–5 Kp' },
  { k: ['adopc', 'przysposob', 'zastępcz'], a: 'Przy przyjęciu dziecka na wychowanie przysługuje urlop na warunkach urlopu macierzyńskiego (20–37 tygodni, nie krócej niż 9) i rodzicielski. Przysposobienie: dziecko do 14 lat; rodzina zastępcza niezawodowa: do 7 lat (10 przy odroczeniu obowiązku szkolnego).', law: 'Art. 183 Kp' },
  { k: ['zleceni'], a: 'Na umowie zlecenia ubezpieczenie chorobowe jest dobrowolne. Jeśli do niego przystąpisz, masz zasiłek macierzyński na tych samych zasadach co pracownik — składasz ZAM, a zleceniodawca Z-3a. Koniec umowy przed porodem oznacza brak zasiłku.', law: 'Art. 29 ustawy zasiłkowej' },
  { k: ['kto wypłac', 'pracodawc', 'płatnik', '20'], a: 'Zasiłek wypłaca pracodawca, który zgłasza do ubezpieczenia chorobowego ponad 20 osób (stan na 30 listopada poprzedniego roku). W pozostałych przypadkach — w tym JDG — wypłaca ZUS.', law: 'Art. 61 ust. 1 ustawy zasiłkowej' },
  { k: ['za życiem'], a: 'Zaświadczenie „Za życiem” wydłuża urlop rodzicielski do 65 tygodni (1 dziecko) lub 67 tygodni (więcej dzieci), w tym 9 tygodni dla każdego z rodziców.', law: 'Art. 182¹a Kp; ustawa „Za życiem”' },
  { k: ['ciąż', 'chorobow', 'l4', 'zwolnieni', 'e-zla'], a: 'W ciąży e-ZLA z kodem „B” daje zasiłek chorobowy 100% podstawy, do 270 dni. Pracownicy przez pierwsze 33 dni w roku płaci pracodawca (wynagrodzenie chorobowe). Po wyczerpaniu okresu zasiłkowego — świadczenie rehabilitacyjne (w ciąży 100%).', law: 'Art. 8, 11 ust. 2 pkt 2 ustawy zasiłkowej' },
  { k: ['likwidac', 'upadło', 'zwolni'], a: 'Gdy w ciąży umowę rozwiązano z powodu upadłości, likwidacji lub śmierci pracodawcy, przysługuje do porodu zasiłek w wysokości zasiłku macierzyńskiego (100%), wypłacany przez ZUS.', law: 'Art. 30 ust. 3 ustawy zasiłkowej' },
  { k: ['1000', 'kosiniak', 'świadczenie rodzicielskie', 'brak ubezpiecz'], a: 'Jeśli nie masz ubezpieczenia chorobowego w dniu porodu, przysługuje świadczenie rodzicielskie 1000 zł miesięcznie przez 52 tygodnie z gminy. Zasiłek macierzyński niższy niż 1000 zł jest z urzędu podwyższany do tej kwoty.', law: 'Art. 31 ust. 3a ustawy zasiłkowej' },
];

// Pozycje bazy wiedzy dopasowane do pytania, od najlepszej.
export function retrieve(question = '', limit = 3) {
  const q = question.toLowerCase();
  return KNOWLEDGE
    .map((item) => ({ item, score: item.k.reduce((a, k) => a + (q.includes(k) ? k.length : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function answer(question = '') {
  const [top] = retrieve(question, 1);
  const best = top?.item;
  const score = top?.score ?? 0;
  if (!best) return { answer: 'Nie znalazłam pewnej odpowiedzi w bazie przepisów Otuli. Sprawdź kalkulator lub zadaj pytanie przez PUE/eZUS albo infolinię ZUS (22 560 16 00).', law: null, confidence: 0 };
  return { answer: best.a, law: best.law, confidence: Math.min(1, score / 8) };
}
