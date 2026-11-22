import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { api } from '../api.js';
import { Icon, Chip, IconBox, Toggle, Btn, Field, inputCls, Modal } from '../components/ui.jsx';
import { TimelineBar, segColor } from './PlanPage.jsx';
import { CASES } from '../../shared/cases.js';
import { pln, plnShort, fmtDate } from '../../shared/engine.js';

function Step({ n, title, sub, tag, children, id }) {
  return (
    <section id={id} className="card p-space-lg scroll-mt-24">
      <div className="flex items-center justify-between gap-2 pb-space-sm mb-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-2xl bg-surface-container flex items-center justify-center text-primary font-headline-sm text-headline-sm shrink-0">{n}</div>
          <div><h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2><p className="font-body-sm text-body-sm text-on-surface-variant">{sub}</p></div>
        </div>
        {tag && <span className="hidden sm:block font-label-uppercase text-label-uppercase text-primary">{tag}</span>}
      </div>
      {children}
    </section>
  );
}

// Jednolity kafelek wyboru: ikona w kwadracie, tytuł, krótki opis, znacznik wyboru.
const Tile = ({ on, onClick, icon, title, sub }) => (
  <button type="button" onClick={onClick} aria-pressed={on} className={`w-full h-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 border-2 ${on ? 'bg-primary-fixed/50 border-primary-container' : 'bg-surface-container-lowest border-surface-container-high hover:border-primary-fixed-dim'}`}>
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${on ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-primary'}`}><Icon name={icon} className="text-[20px]" /></span>
    <span className="flex-1 min-w-0"><span className="block font-bold text-[15px] leading-tight text-on-surface">{title}</span><span className="block text-[13px] text-on-surface-variant leading-snug mt-0.5">{sub}</span></span>
  </button>
);

const EMPLOYMENTS = [
  ['uop', 'badge', 'Umowa o pracę', 'Etat, chorobowe obowiązkowe'],
  ['zlecenie', 'history_edu', 'Umowa zlecenia', 'Chorobowe dobrowolne'],
  ['jdg', 'storefront', 'Własna firma (JDG)', 'Sama opłacasz składki'],
  ['liquidation', 'domain_disabled', 'Likwidacja pracodawcy', 'Umowa rozwiązana w ciąży'],
  ['none', 'block', 'Brak ubezpieczenia', 'Np. umowa o dzieło'],
];

export default function CalculatorPage() {
  const { input, setInput, result, rules, notify, demo, ready } = useApp();
  const special = input.zaZyciem || input.premature !== 'none' || input.stillbirth || (input.baseOverride ?? '') !== '' || Number(input.insuredDays) < 90;
  const [more, setMore] = useState(special);
  const nav = useNavigate();
  const [zam, setZam] = useState(false);
  const [caseId, setCaseId] = useState('');
  const w = result.weeks;
  const num = (k) => (e) => setInput({ [k]: e.target.value === '' ? '' : Number(e.target.value) });

  const loadCase = async (id) => {
    setCaseId(id);
    if (!id) return;
    const c = CASES.find((x) => x.id === id);
    setInput({ ...c.input, work: c.input.work || { fraction: 0, weeks: 0 }, baseOverride: null, motherParentalWeeks: null, fatherMaternityWeeks: 0, zaZyciem: !!c.input.zaZyciem, premature: c.input.premature || 'none', hospitalWeeks: c.input.hospitalWeeks || 0, debt: c.input.debt || 0, event: c.input.event || 'bio', children: 1, stillbirth: false });
    notify(`Wczytano ${c.tag}: ${c.person}`);
  };

  const submitZam = async () => {
    const r = await api.submit({ type: input.employment === 'uop' ? 'Wniosek o urlop macierzyński i rodzicielski (pełny wymiar)' : 'ZAM — zasiłek macierzyński', recipient: result.payer.mother === 'employer' ? 'Pracodawca' : 'ZUS (eZUS)', data: { variant: input.variant, base: result.base, weeks: w } }).catch(() => null);
    setZam(false);
    notify(r ? `Wniosek ${r.id} przekazano (symulacja)` : 'Wniosek zapisany lokalnie (tryb offline)', 'send');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <div className="flex flex-wrap items-center gap-space-xs mb-1"><Chip tone="peach">Zintegrowany kalkulator</Chip><Chip tone="sage" upper={false}>Parametry: {rules.version}</Chip></div>
          <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">Kalkulator świadczeń rodzicielskich</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">Okres i wysokość zasiłku macierzyńskiego dla obojga rodziców: poród, wieloraczki, „Za życiem”, wcześniak, adopcja i rodzina zastępcza, łączenie z pracą oraz indywidualna podstawa z dokumentów.</p>
        </div>
        {demo && <div className="card p-space-sm flex items-center gap-space-xs w-full lg:w-auto lg:max-w-md self-stretch lg:self-start">
          <Icon name="folder_special" className="text-secondary" />
          <select aria-label="Wczytaj sprawę testową" value={caseId} onChange={(e) => loadCase(e.target.value)} className="bg-transparent font-body-md-medium text-[14px] focus:outline-none pr-2 w-full min-w-0 truncate">
            <option value="">Wczytaj sprawę testową…</option>
            {CASES.map((c) => <option key={c.id} value={c.id}>{c.tag}: {c.person} — {c.short}</option>)}
          </select>
        </div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <Step n="1" title="Twoja sytuacja" sub="Kilka podstawowych pytań — resztę uzupełnisz, jeśli Cię dotyczy" tag="Profil">
            <h3 className="font-bold text-[15px] mb-space-xs">1. Co się wydarzy lub wydarzyło?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-lg">
              <Tile on={input.event === 'bio'} onClick={() => setInput({ event: 'bio' })} icon="child_care" title="Poród" sub="Urodzenie dziecka" />
              <Tile on={input.event === 'adoption'} onClick={() => setInput({ event: 'adoption', stillbirth: false, premature: 'none', childAge: input.childAge || 3 })} icon="family_restroom" title="Adopcja" sub="Dziecko do 14 lat, wniosek do sądu" />
              <Tile on={input.event === 'foster'} onClick={() => setInput({ event: 'foster', stillbirth: false, premature: 'none', childAge: input.childAge || 2 })} icon="volunteer_activism" title="Rodzina zastępcza" sub="Niezawodowa, dziecko do 7 lat" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
              <Field label={input.event === 'bio' ? 'Data porodu (lub przewidywana)' : 'Data przyjęcia dziecka'} htmlFor="bd"><input id="bd" type="date" className={inputCls} value={input.birthDate} onChange={(e) => setInput({ birthDate: e.target.value })} /></Field>
              <Field label="Liczba dzieci" htmlFor="kids">
                <select id="kids" className={inputCls} value={input.children} onChange={num('children')}>
                  {rules.maternityWeeks.map((wk, i) => <option key={i} value={i + 1}>{['1 dziecko', '2 dzieci (bliźnięta)', '3 dzieci', '4 dzieci', '5 i więcej'][i]}</option>)}
                </select>
              </Field>
              {input.event !== 'bio' && (
                <Field label="Wiek dziecka w dniu przyjęcia (lata)" htmlFor="age" hint={input.event === 'foster' ? 'Rodzina zastępcza: do 7 lat (10 przy odroczeniu obowiązku szkolnego).' : 'Przysposobienie: do 14 lat.'}>
                  <input id="age" type="number" min="0" max="17" className={inputCls} value={input.childAge} onChange={num('childAge')} />
                </Field>
              )}
            </div>

            <h3 className="font-bold text-[15px] mb-space-xs">2. Jak jesteś ubezpieczona w dniu porodu?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-space-sm mb-space-md">
              {EMPLOYMENTS.map(([v, ic, t, d]) => <Tile key={v} on={input.employment === v} onClick={() => setInput({ employment: v })} icon={ic} title={t} sub={d} />)}
            </div>
            {input.employment !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
                {input.employment === 'uop' && <Field label="Ile osób zatrudnia pracodawca?" htmlFor="es" hint="Powyżej 20 — zasiłek wypłaca pracodawca, do 20 — ZUS. Zapytaj w kadrach."><input id="es" type="number" min="1" placeholder="np. 38" className={inputCls} value={input.employerSize} onChange={num('employerSize')} /></Field>}
                {(input.employment === 'zlecenie' || input.employment === 'jdg') && (
                  <Field label="Czy płacisz dobrowolne chorobowe?" htmlFor="vs" hint="Bez niego zasiłek macierzyński nie przysługuje.">
                    <div className="flex items-center justify-between bg-surface-container-low px-4 rounded-2xl h-12"><span className="text-[15px]">{input.voluntarySickness ? 'Tak' : 'Nie'}</span><Toggle checked={input.voluntarySickness} onChange={(v) => setInput({ voluntarySickness: v })} label="Dobrowolne chorobowe" /></div>
                  </Field>
                )}
                {input.employment === 'jdg' && <Field label="Zaległości w ZUS (zł)" htmlFor="debt" hint={`Powyżej ${pln(rules.minWage * rules.debtThresholdPct / 100)} wypłata zostaje wstrzymana do spłaty.`}><input id="debt" type="number" min="0" step="0.01" className={inputCls} value={input.debt} onChange={num('debt')} /></Field>}
              </div>
            )}

            {input.employment !== 'none' && (
              <>
                <h3 className="font-bold text-[15px] mb-space-xs">3. {input.employment === 'jdg' ? 'Od jakiej kwoty płacisz składki?' : 'Ile średnio zarabiasz?'}</h3>
                <div className="bg-surface-container-low rounded-2xl p-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md items-center mb-space-lg">
                  <Field label={input.employment === 'jdg' ? 'Zadeklarowana podstawa składek (śr. z 12 miesięcy)' : 'Średnie wynagrodzenie brutto z 12 miesięcy'} htmlFor="gross" hint="Kwota z paska wypłaty przed odliczeniem podatku i składek.">
                    <div className="relative flex items-center"><input id="gross" type="number" min="0" step="50" placeholder="np. 7450" className={`${inputCls} !bg-surface-container-lowest pr-24 font-bold text-[18px]`} value={input.grossSalary} onChange={num('grossSalary')} /><span className="absolute right-4 text-[13px] text-on-surface-variant font-bold">zł brutto</span></div>
                  </Field>
                  <div className="bg-surface-container-lowest rounded-2xl p-space-sm">
                    <span className="text-[13px] text-on-surface-variant block">Podstawa zasiłku (po odjęciu {rules.employeeContributions}% składek)</span>
                    <span className="font-headline-lg text-headline-lg text-primary">{pln(result.base)}</span>
                  </div>
                </div>
              </>
            )}

            <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="w-full flex items-center justify-between gap-2 p-space-sm rounded-2xl border-2 border-dashed border-outline-variant hover:bg-surface-container-low text-left">
              <span><b className="text-[15px] text-primary">Szczególne okoliczności</b><span className="block text-[13px] text-on-surface-variant">„Za życiem”, wcześniak, martwe urodzenie, podstawa z dokumentu Z-3, krótki staż</span></span>
              <Icon name={more ? 'expand_less' : 'expand_more'} className="text-primary" />
            </button>
            {more && (
              <div className="mt-space-sm grid grid-cols-1 sm:grid-cols-2 gap-space-md p-space-md rounded-2xl bg-surface-container-low">
                {input.event === 'bio' && (
                  <>
                    <Field label="Zaświadczenie „Za życiem”" htmlFor="zz" hint={`Rodzicielski ${rules.zaZyciemParentalWeeks[0]} tyg. (1 dziecko) / ${rules.zaZyciemParentalWeeks[1]} tyg.`}>
                      <div className="flex items-center justify-between bg-surface-container-lowest px-4 rounded-2xl h-12"><span className="text-[15px]">{input.zaZyciem ? 'Tak' : 'Nie'}</span><Toggle checked={input.zaZyciem} onChange={(v) => setInput({ zaZyciem: v })} label="Za życiem" /></div>
                    </Field>
                    <Field label="Martwe urodzenie lub zgon dziecka" htmlFor="sb" hint="8 tygodni zasiłku, 100%.">
                      <div className="flex items-center justify-between bg-surface-container-lowest px-4 rounded-2xl h-12"><span className="text-[15px]">{input.stillbirth ? 'Tak' : 'Nie'}</span><Toggle checked={input.stillbirth} onChange={(v) => setInput({ stillbirth: v })} label="Martwe urodzenie" /></div>
                    </Field>
                    <Field label="Wcześniak / pobyt dziecka w szpitalu" htmlFor="prem">
                      <select id="prem" className={`${inputCls} !bg-surface-container-lowest`} value={input.premature} onChange={(e) => setInput({ premature: e.target.value, hospitalWeeks: e.target.value === 'none' ? 0 : input.hospitalWeeks || 1 })}>
                        <option value="none">Nie dotyczy</option>
                        <option value="extreme">Przed 28. tyg. ciąży lub do 1000 g</option>
                        <option value="preterm">28.–37. tydzień, powyżej 1000 g</option>
                        <option value="term">Po 37. tyg., szpital 5.–28. dzień</option>
                      </select>
                    </Field>
                    {input.premature !== 'none' && <Field label="Tygodnie w szpitalu" htmlFor="hw" hint="Niepełny tydzień liczymy w górę."><input id="hw" type="number" min="0" max="20" step="0.5" className={`${inputCls} !bg-surface-container-lowest`} value={input.hospitalWeeks} onChange={num('hospitalWeeks')} /></Field>}
                  </>
                )}
                <Field label="Podstawa wymiaru z Z-3 lub decyzji ZUS (zł)" htmlFor="bo" hint="Jeśli ją znasz — ma pierwszeństwo przed wynagrodzeniem.">
                  <input id="bo" type="number" min="0" step="0.01" placeholder="np. 6428,60" className={`${inputCls} !bg-surface-container-lowest`} value={input.baseOverride ?? ''} onChange={(e) => setInput({ baseOverride: e.target.value === '' ? null : Number(e.target.value) })} />
                </Field>
                <Field label="Od ilu dni masz ubezpieczenie?" htmlFor="idays" hint="Krótki staż może skutkować kontrolą ZUS.">
                  <input id="idays" type="number" min="0" className={`${inputCls} !bg-surface-container-lowest`} value={input.insuredDays} onChange={num('insuredDays')} />
                </Field>
              </div>
            )}
          </Step>

          <Step n="2" title="Wariant wypłaty zasiłku" sub="Wniosek w 21 dni decyduje o stawce" tag="Model">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {[
                { v: 'A', title: 'Wariant A: wniosek do 21 dni po porodzie', badge: '81,5%', text: 'Wniosek o urlop macierzyński i rodzicielski w pełnym wymiarze. Równy dochód przez cały okres; 9 tyg. drugiego rodzica — 70%.', body: <><div className="text-[12px] text-on-surface-variant">Przez cały okres mamy:</div><div className="flex items-baseline justify-between"><span className="font-headline-md text-headline-md text-primary">{pln(result.variants.A.monthly)}</span><span className="text-[12px] text-on-surface-variant">brutto / mc</span></div><div className="text-[12px] text-on-surface-variant flex justify-between"><span>Netto (PIT {input.under26 ? '0 — ulga do 26 lat' : `${rules.pit.rate}%`}):</span><b className="text-on-surface">{pln(result.variants.A.net)}</b></div></> },
                { v: 'B', title: 'Wariant B: standardowy etapowy', badge: '100% / 70%', text: 'Bez wniosku w 21 dni: 100% za macierzyński, 70% za rodzicielski. Wniosek o rodzicielski min. 21 dni przed jego rozpoczęciem.', body: <><div className="text-[12px] text-on-surface-variant">Macierzyński ({w.motherMat + w.supplementary} tyg.):</div><div className="flex items-baseline justify-between"><span className="font-headline-sm text-headline-sm text-secondary">{pln(result.variants.B.maternity)}</span><span className="text-[12px]">100%</span></div><div className="text-[12px] text-on-surface-variant mt-1">Rodzicielski ({w.motherParental} tyg.):</div><div className="flex items-baseline justify-between"><span className="font-headline-sm text-headline-sm">{pln(result.variants.B.parental)}</span><span className="text-[12px]">70%</span></div></> },
              ].map((c) => (
                <button type="button" key={c.v} onClick={() => setInput({ variant: c.v })} className={`text-left rounded-2xl p-space-md transition-all flex flex-col gap-space-sm ${input.variant === c.v ? 'bg-surface-container-low ring-2 ring-primary-container/40' : 'bg-surface-container-lowest border border-surface-container-high opacity-90 hover:opacity-100'}`}>
                  <div className="flex items-start justify-between gap-2"><span className="flex items-center gap-space-xs font-body-md-medium text-[14px] font-bold"><span className={`w-3 h-3 rounded-full ${c.v === 'A' ? 'bg-primary-container' : 'bg-secondary'}`} />{c.title}</span><span className={`px-2 py-0.5 rounded text-[12px] font-bold ${c.v === 'A' ? 'bg-primary-container text-on-primary' : 'bg-secondary text-on-secondary'}`}>{c.badge}</span></div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{c.text}</p>
                  <div className="bg-surface-container-lowest rounded-xl p-space-sm">{c.body}</div>
                </button>
              ))}
            </div>
            <div className="mt-space-md p-space-sm bg-surface-container-low rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-space-sm text-[13px]">
              <span className="flex items-center gap-space-xs"><Icon name="balance" className="text-primary text-[20px]" />Suma zasiłku mamy w całym okresie:</span>
              <span>A: <b className="text-primary">{pln(result.variants.A.total)}</b> <span className="opacity-50 px-1">vs</span> B: <b className="text-secondary">{pln(result.variants.B.total)}</b></span>
              <Chip tone="neutral" upper={false} dot={false}>Różnica: {pln(Math.abs(result.variants.A.total - result.variants.B.total))}</Chip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-sm">
              <label className="flex items-center gap-space-sm p-3 rounded-2xl bg-surface-container-low cursor-pointer"><input type="checkbox" checked={input.pit2} onChange={(e) => setInput({ pit2: e.target.checked })} className="w-4 h-4" /><span className="text-body-sm">PIT-2 złożony (kwota zmniejszająca {rules.pit.monthlyReduction} zł)</span></label>
              <label className="flex items-center gap-space-sm p-3 rounded-2xl bg-surface-container-low cursor-pointer"><input type="checkbox" checked={input.under26} onChange={(e) => setInput({ under26: e.target.checked })} className="w-4 h-4" /><span className="text-body-sm">Ulga dla młodych (do 26 lat)</span></label>
            </div>
          </Step>

          <Step n="3" title="Podział urlopów: mama i tata" sub="Oboje rodzice — przejęcie macierzyńskiego i pula rodzicielska" tag="Podział praw">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-md">
              <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-2xl h-12"><span className="font-body-md-medium text-[14px]">Tata ubezpieczony</span><Toggle checked={input.fatherInsured} onChange={(v) => setInput({ fatherInsured: v })} label="Tata ubezpieczony" /></div>
              <Field label="Tytuł ubezpieczenia taty" htmlFor="femp"><select id="femp" className={inputCls} value={input.fatherEmployment} onChange={(e) => setInput({ fatherEmployment: e.target.value })}><option value="uop">Umowa o pracę</option><option value="zlecenie">Umowa zlecenia</option><option value="jdg">Działalność (JDG)</option></select></Field>
              <Field label="Wynagrodzenie / podstawa taty (brutto)" htmlFor="fg"><input id="fg" type="number" min="0" className={inputCls} value={input.fatherGrossSalary} onChange={num('fatherGrossSalary')} /></Field>
            </div>
            <div className="bg-surface-container-low p-space-md rounded-2xl mb-space-md">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-space-xs"><span className="font-body-md-medium text-[14px] font-bold">1. Urlop {input.event === 'bio' ? 'macierzyński' : 'na warunkach macierzyńskiego'} — {w.maternity} tyg.</span><span className="text-[12px] text-on-surface-variant">{input.event === 'bio' ? 'Min. 14 tyg. wykorzystuje mama osobiście' : 'Podział dowolny między rodziców'}</span></div>
              <div className="h-7 w-full bg-surface-container-high rounded-full overflow-hidden flex my-2">
                <div className="bg-primary-container h-full flex items-center justify-center text-[12px] text-on-primary font-bold transition-all" style={{ width: `${(w.motherMat / w.maternity) * 100}%` }}>Mama: {w.motherMat} tyg.</div>
                {w.fatherMat > 0 && <div className="bg-secondary h-full flex items-center justify-center text-[12px] text-on-secondary font-bold transition-all" style={{ width: `${(w.fatherMat / w.maternity) * 100}%` }}>Tata: {w.fatherMat} tyg.</div>}
              </div>
              <div className="flex justify-between text-[12px] text-on-surface-variant"><label htmlFor="fm">Część przejmowana przez tatę:</label><b className="text-secondary">{w.fatherMat} tyg.</b></div>
              <input id="fm" type="range" min="0" max={w.maxFatherMat} value={w.fatherMat} disabled={!input.fatherInsured} onChange={(e) => setInput({ fatherMaternityWeeks: Number(e.target.value) })} className="w-full" />
            </div>
            <div className="bg-surface-container-low p-space-md rounded-2xl mb-space-md">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-space-xs"><span className="font-body-md-medium text-[14px] font-bold">2. Urlop rodzicielski — {w.parentalTotal} tyg.</span><Chip tone="warning" upper={false}>W tym 9 tyg. dla każdego rodzica</Chip></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
                <div className="bg-surface-container-lowest p-space-sm rounded-xl">
                  <label htmlFor="mp" className="block text-[12px] text-on-surface-variant mb-1">Tygodnie rodzicielskiego mamy (min. 9):</label>
                  <div className="flex items-center gap-space-sm"><input id="mp" type="number" min={w.reserved} max={w.parentalTotal - w.reserved} value={w.motherParental} onChange={(e) => setInput({ motherParentalWeeks: Number(e.target.value) })} className="w-20 h-10 px-2 rounded-xl bg-surface-container-low font-bold text-[18px] text-primary text-center" /><span className="text-body-sm">z {w.parentalTotal - w.reserved} możliwych</span></div>
                  <span className="text-[12px] text-on-surface-variant mt-1 block">Mama nie może przejąć 9 tygodni drugiego rodzica.</span>
                </div>
                <div className="bg-surface-container-lowest p-space-sm rounded-xl">
                  <div className="flex items-center justify-between mb-1"><span className="text-[12px] text-on-surface-variant">Rodzicielski taty:</span><span className="px-1.5 rounded bg-primary-fixed text-primary text-[11px] font-bold">Art. 182¹a Kp</span></div>
                  <div className="flex items-center gap-space-sm"><span className="font-bold text-[18px] text-secondary">{w.fatherReserved + w.fatherParentalCommon} tyg.</span><label className="flex items-center gap-1 text-body-sm"><input type="checkbox" checked={input.fatherUsesReserved} onChange={(e) => setInput({ fatherUsesReserved: e.target.checked })} />wykorzysta swoje 9 tyg.</label></div>
                  <span className="text-[12px] text-secondary mt-1 block font-medium">Niewykorzystane 9 tygodni bezpowrotnie przepada.</span>
                </div>
              </div>
            </div>
            <div className="p-space-sm rounded-2xl bg-surface-container-high/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm"><Icon name="event_available" className="text-secondary text-[24px]" /><div><div className="font-body-md-medium text-[14px] font-bold">Urlop ojcowski: 14 dni (100%)</div><div className="text-[12px] text-on-surface-variant">Niezależny od macierzyńskiego i rodzicielskiego; do 12. miesiąca życia dziecka.</div></div></div>
              <Toggle checked={input.fatherPaternity} onChange={(v) => setInput({ fatherPaternity: v })} label="Urlop ojcowski" />
            </div>
          </Step>

          <Step id="praca" n="4" title="Łączenie urlopu rodzicielskiego z pracą" sub="Praca do 1/2 etatu u pracodawcy udzielającego urlopu" tag="Elastyczność">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-md">
              <Field label="Wymiar pracy" htmlFor="wf"><select id="wf" className={inputCls} value={input.work.fraction} onChange={(e) => setInput({ work: { ...input.work, fraction: Number(e.target.value), weeks: input.work.weeks || 8 } })}><option value="0">Bez pracy</option><option value="0.25">1/4 etatu</option><option value="0.375">3/8 etatu</option><option value="0.5">1/2 etatu (maks.)</option></select></Field>
              <Field label="Przez ile tygodni rodzicielskiego" htmlFor="ww"><input id="ww" type="number" min="0" max={w.motherParental} className={inputCls} value={input.work.weeks} onChange={(e) => setInput({ work: { ...input.work, weeks: Number(e.target.value) } })} /></Field>
              <div className="bg-surface-container-low p-space-sm rounded-2xl"><span className="text-[12px] text-on-surface-variant uppercase font-bold">Wydłużenie urlopu</span><div className="font-headline-lg text-headline-lg text-primary">+{result.work.extension} tyg.</div><span className="text-[12px] text-on-surface-variant">{result.work.weeks} tyg. × {result.work.fraction} etatu</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm text-center">
              <div className="p-space-sm bg-surface-container-low rounded-2xl"><div className="text-[12px] text-on-surface-variant">Wynagrodzenie za pracę</div><div className="font-headline-sm text-headline-sm text-secondary">{pln(result.work.salary)}</div></div>
              <div className="p-space-sm bg-surface-container-low rounded-2xl"><div className="text-[12px] text-on-surface-variant">Zasiłek (proporcjonalnie)</div><div className="font-headline-sm text-headline-sm text-primary">{pln(result.work.benefit)}</div></div>
              <div className="p-space-sm bg-primary-fixed rounded-2xl text-on-primary-fixed"><div className="text-[12px] font-semibold">Łącznie brutto / mc</div><div className="font-headline-sm text-headline-sm">{pln(result.work.combined)}</div></div>
            </div>
          </Step>

          <Step n="5" title="Harmonogram świadczeń" sub="Okresy, stawki, płatnicy i daty" tag="Wynik">
            <TimelineBar segments={result.segments} />
            <div className="overflow-x-auto mt-space-md">
              <table className="w-full text-left text-body-sm min-w-[520px]">
                <thead className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase"><tr>{['Okres', 'Świadczenie', 'Stawka', 'Brutto / mc', 'Razem'].map((h, i) => <th key={h} className={`p-space-sm ${i === 0 ? 'rounded-l-2xl' : ''} ${i === 4 ? 'rounded-r-2xl text-right' : ''}`}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.schedule.concat(result.segments.filter((s) => s.independent)).map((s, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/50">
                      <td className="p-space-sm font-semibold">{s.from ? `${fmtDate(s.from)}` : '—'}<span className="block text-[12px] text-on-surface-variant font-normal">{s.weeks} tyg.</span></td>
                      <td className="p-space-sm text-on-surface-variant"><b className="text-secondary">{s.who}</b> · {s.kind}{s.raised && <span className="block text-[12px] text-tertiary">podwyższono do 1000 zł</span>}</td>
                      <td className="p-space-sm"><span className={`px-2 py-0.5 rounded text-[12px] font-bold ${segColor(s.color).bg} ${segColor(s.color).text}`}>{String(s.rate).replace('.', ',')}%</span></td>
                      <td className="p-space-sm font-bold whitespace-nowrap">{pln(s.monthly)}</td>
                      <td className="p-space-sm text-right font-bold text-primary whitespace-nowrap">{pln(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-24">
          {!ready && <div className="card p-space-lg text-center"><Icon name="edit_note" className="text-primary text-[36px]" /><h3 className="font-headline-sm text-headline-sm text-primary mt-1">Uzupełnij podstawowe dane</h3><p className="text-body-sm text-on-surface-variant mt-1">Podaj datę porodu i wynagrodzenie (albo zaznacz brak ubezpieczenia), a tu zobaczysz wynik.</p></div>}
          {ready && <>
          <div className="card p-space-lg shadow-md">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="flex items-center gap-space-xs font-headline-sm text-headline-sm"><Icon name="account_balance_wallet" className="text-primary" />Podsumowanie</span>
              <Chip tone={result.entitled ? (result.status === 'blocked' ? 'gold' : 'sage') : 'rose'} upper={false}>{{ ok: 'Prawo ustalone', blocked: 'Wypłata wstrzymana', denied: 'Brak prawa', special: 'Sytuacja szczególna', warning: 'Do weryfikacji' }[result.status]}</Chip>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-space-md flex items-center justify-between mb-space-sm">
              <div><div className="text-[12px] text-on-surface-variant">Łączny wymiar urlopów rodziny</div><div className="font-headline-xl text-headline-xl text-primary">{w.total} tyg.</div><div className="text-[12px] text-on-surface-variant">{w.totalDays} dni + {w.paternityDays} dni ojcowskiego</div></div>
              <IconBox icon="family_restroom" tone="peach" size="w-14 h-14" />
            </div>
            <dl className="space-y-space-xs text-body-sm mb-space-md">
              {[['Mama — średnio / mc (brutto)', pln(result.motherMonthlyAvg)], ['Mama — tygodnie zasiłku', `${w.motherMat + w.supplementary + w.motherParental + w.extension} tyg.`], ['Tata — tygodnie zasiłku', `${w.fatherMat + w.fatherReserved + w.fatherParentalCommon} tyg. + 14 dni`], ['Płatnik mamy', result.payer.mother === 'employer' ? 'Pracodawca' : 'ZUS'], ['Suma świadczeń rodziny (brutto)', pln(result.totalGross)]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2"><dt className="text-on-surface-variant">{k}</dt><dd className="font-bold text-right">{v}</dd></div>
              ))}
            </dl>
            {result.issues.length > 0 && (
              <div className="space-y-space-xs mb-space-md">
                {result.issues.map((i) => (
                  <div key={i.title} className={`p-space-sm rounded-2xl text-[12px] ${i.level === 'danger' ? 'bg-[#F4E0E7] text-[#6d2b45]' : i.level === 'warning' ? 'bg-[#F8EBC7] text-[#5d4414]' : 'bg-[#E1EEF8] text-[#28496a]'}`}>
                    <b className="block">{i.title}</b>{i.text}<span className="block mt-1 font-bold opacity-80">{i.law}</span>
                  </div>
                ))}
              </div>
            )}
            {result.notes.map((n) => <div key={n.title} className="p-space-sm rounded-2xl text-[12px] bg-[#E6EEDC] text-[#33502c] mb-space-xs"><b className="block">{n.title}</b>{n.text}<span className="block mt-1 font-bold opacity-80">{n.law}</span></div>)}
            <div className="pt-space-sm mb-space-md">
              <div className="font-body-md-medium text-[14px] font-bold mb-space-xs">Dokumenty i gdzie je złożyć:</div>
              <ul className="space-y-1 text-[12px] text-on-surface-variant">
                {result.documents.map((d) => <li key={d.name} className="flex items-start gap-1.5"><Icon name="check" className="text-[16px] text-primary mt-0.5" /><span><b className="text-on-surface">{d.code}</b> — {d.name} <span className="text-secondary">→ {d.to}</span></span></li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-space-xs">
              <Btn icon="assignment_turned_in" onClick={() => setZam(true)} disabled={!result.entitled}>Generuj gotowy wniosek</Btn>
              <Btn kind="soft" icon="download" onClick={() => window.print()}>Eksportuj kalkulację (PDF)</Btn>
              <Btn kind="ghost" icon="calendar_today" onClick={() => nav('/')}>Pokaż na osi czasu</Btn>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-[24px] p-space-md flex items-start gap-space-xs">
            <Icon name="schedule" className="text-secondary text-[22px]" />
            <div><span className="font-body-md-medium text-[14px] font-bold block">Termin ustawowy</span><p className="text-[12px] text-on-surface-variant mt-1">Wniosek o 81,5% — do <b>{fmtDate(result.deadlines.find((d) => d.id === 'zam')?.date)}</b> (21 dni od porodu/przyjęcia). Później: 100% za macierzyński i 70% za rodzicielski.</p></div>
          </div>
        </>}
        </aside>
      </div>

      <Modal open={zam} onClose={() => setZam(false)} title={input.employment === 'uop' ? 'Wniosek o urlop — wersja robocza' : 'Wniosek ZAM — wersja robocza'} footer={<><Btn kind="soft" onClick={() => setZam(false)}>Anuluj</Btn><Btn icon="send" onClick={submitZam}>Przekaż do {result.payer.mother === 'employer' ? 'pracodawcy' : 'eZUS'}</Btn></>}>
        <div className="space-y-2 text-body-sm">
          {[['Wnioskodawca', 'Anna Kowalska (PESEL 940512*****)'], ['Adresat', result.payer.motherLabel], ['Wariant', input.variant === 'A' ? 'Pełny wymiar — 81,5% (art. 30a)' : 'Standardowy — 100% / 70%'], ['Zdarzenie', { bio: 'Urodzenie dziecka', adoption: 'Przyjęcie na wychowanie (przysposobienie)', foster: 'Rodzina zastępcza niezawodowa' }[input.event] + ` — ${fmtDate(input.birthDate)}`], ['Liczba dzieci', input.children], ['Okres', `${w.motherMat + w.supplementary} tyg. macierzyńskiego + ${w.motherParental} tyg. rodzicielskiego`], ['Podstawa wymiaru', pln(result.base)]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-1 border-b border-surface-container"><span className="text-on-surface-variant">{k}</span><b className="text-right">{v}</b></div>
          ))}
          <div className="p-space-sm bg-primary-fixed rounded-2xl text-on-primary-fixed flex items-center gap-2 text-[13px]"><Icon name="check_circle" />Gotowe do podpisu profilem zaufanym / mObywatelem (symulacja).</div>
        </div>
      </Modal>
    </div>
  );
}
