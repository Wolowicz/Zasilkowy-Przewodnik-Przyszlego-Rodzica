import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, JURY_PRESET } from '../store.jsx';
import { Icon, Chip, IconBox, Toggle, Segmented, Btn } from '../components/ui.jsx';
import { pln, plnShort, fmtDate } from '../../shared/engine.js';
import ParentWelcome from '../components/ParentWelcome.jsx';

const SEG_COLORS = {
  maternity: { bg: 'bg-[#783E51]', text: 'text-on-primary' },
  cession: { bg: 'bg-[#97496C]', text: 'text-on-primary' },
  supplementary: { bg: 'bg-[#B5677F]', text: 'text-on-primary' },
  parental: { bg: 'bg-[#FDA592]', text: 'text-on-secondary-container' },
  work: { bg: 'bg-[#F8C9B8]', text: 'text-on-secondary-container' },
  reserved: { bg: 'bg-[#CAECBD]', text: 'text-tertiary' },
  paternity: { bg: 'bg-[#E1EEF8]', text: 'text-[#3D6488]' },
};
export const segColor = (c) => SEG_COLORS[c] || SEG_COLORS.parental;

export function TimelineBar({ segments }) {
  const main = segments.filter((s) => !s.independent);
  const total = main.reduce((a, s) => a + s.weeks, 0) || 1;
  return (
    <div className="relative w-full h-12 bg-surface-container rounded-2xl flex p-1 gap-1 shadow-inner">
      {main.map((s, i) => (
        <div key={i} className={`relative group h-full rounded-xl ${segColor(s.color).bg} ${segColor(s.color).text} flex items-center justify-center px-2 cursor-default transition-transform hover:scale-[1.01] min-w-[6px]`} style={{ width: `${(s.weeks / total) * 100}%` }}>
          <span className="font-caption text-[12px] font-bold truncate">{s.weeks} tyg.{s.weeks / total > 0.22 ? ` ${s.who === 'Ojciec' ? 'Tata' : s.who === 'Matka' ? 'Mama' : ''} · ${s.kind.replace('Urlop ', '').replace(/ \(.+\)/, '').replace(/ — .+/, '')}` : ` ${s.who === 'Ojciec' ? 'Tata' : 'Mama'}`}</span>
          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-surface-container-lowest p-2 rounded-xl shadow-lg z-20 w-56 text-on-surface text-left">
            <span className="font-bold text-caption text-primary">{s.kind}</span>
            <span className="text-caption text-on-surface-variant">{s.who} • {s.rate}% • {pln(s.monthly)} / mc • {s.payerLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileTimeline({ result, input, setInput }) {
  const [parent, setParent] = useState('mama');
  const w = result.weeks;
  const half = input.work.fraction > 0;
  return (
    <div className="lg:hidden flex flex-col space-y-space-md">
      <div className="flex items-center justify-between px-space-md py-space-xs bg-surface-container-low rounded-full shadow-sm">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse shrink-0" />
          <span className="font-caption text-caption text-on-surface-variant truncate font-medium">{result.entitled ? `Ubezpieczenie aktywne • Płatnik: ${result.payer.mother === 'employer' ? 'pracodawca' : 'ZUS'}` : 'Brak prawa do zasiłku — sprawdź alternatywy'}</span>
        </div>
        <Icon name="verified_user" className="text-[15px] text-tertiary" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Ścieżka praw i świadczeń</p>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold tracking-tight">Oś Czasu Rodzicielstwa</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><Icon name="calendar_month" className="text-[22px]" /></div>
      </div>
      <div className="p-1 bg-surface-container rounded-full flex items-center gap-1 shadow-inner">
        {[['mama', 'face_3', 'Plan Mamy'], ['tata', 'face_6', 'Plan Taty']].map(([k, ic, l]) => (
          <button key={k} type="button" onClick={() => setParent(k)} className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all ${parent === k ? 'bg-surface-container-lowest text-primary-container shadow-sm' : 'text-on-surface-variant'}`}>
            <Icon name={ic} className="text-[18px]" /><span className="font-button-text text-button-text">{l}</span>
          </button>
        ))}
      </div>
      <div className="p-space-lg rounded-lg bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(69,46,53,0.04)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-28 h-28 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Chip tone="warning" upper={false}>{input.variant === 'A' ? 'Wariant A (wniosek w 21 dni)' : 'Wariant B (100% / 70%)'}</Chip>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="font-headline-xl-mobile text-headline-xl-mobile text-primary font-extrabold tracking-tight">{plnShort(parent === 'mama' ? (input.variant === 'A' ? result.variants.A.net : result.variants.B.netMaternity) : result.variants.reservedMonthly).replace(' zł', '')}</span>
              <span className="font-body-md text-body-md text-on-surface-variant font-bold">zł/mc {parent === 'mama' ? 'netto' : 'brutto'}</span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant">{parent === 'mama' ? `Matka: ${w.motherMat + w.motherParental + w.supplementary} tygodni zasiłku` : `Tata: ${w.fatherReserved} tyg. rodzicielskiego (70%) + 14 dni ojcowskiego`}</p>
          </div>
          <IconBox icon="payments" tone="peach" size="w-12 h-12" />
        </div>
        <div className="mt-space-md bg-surface-container-low p-space-sm rounded-DEFAULT flex items-center justify-between">
          <span className="flex items-center gap-2 font-body-sm text-body-sm font-medium"><Icon name="savings" className="text-primary-container text-[18px]" />Łączny transfer (brutto):</span>
          <span className="font-body-md-medium text-primary-container font-bold">~{plnShort(result.totalGross)}</span>
        </div>
      </div>
      <div className="p-space-md rounded-lg bg-primary-fixed/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center"><Icon name="lightbulb" className="text-[18px]" /></div>
            <div><span className="font-button-text text-button-text text-primary block">Symulator „Co jeśli?”</span><span className="font-caption text-caption text-on-surface-variant">Praca na 1/2 etatu a czas urlopu</span></div>
          </div>
          <button type="button" onClick={() => setInput({ work: half ? { fraction: 0, weeks: 0 } : { fraction: 0.5, weeks: 8 } })} className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary font-button-text text-body-sm shadow-sm active:scale-95 flex items-center gap-1">
            {half ? 'Wyłącz' : 'Włącz 1/2'}<Icon name="tune" className="text-[16px]" />
          </button>
        </div>
        {half && <div className="mt-3 p-2.5 rounded-DEFAULT bg-surface-container-lowest flex items-center gap-2.5"><Icon name="add_task" className="text-tertiary text-[20px]" /><p className="font-body-sm text-body-sm text-on-surface-variant">{input.work.weeks} tyg. pracy na 1/2 etatu wydłuża rodzicielski o <strong className="text-on-surface">+{result.work.extension} tyg.</strong> Zasiłek w tym czasie: {pln(result.work.benefit)} + pensja {pln(result.work.salary)}.</p></div>}
      </div>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Krok po kroku z Otulą</h3>
        <span className="font-caption text-caption text-tertiary-container font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed">5 etapów</span>
      </div>
      <div className="relative pl-6 space-y-space-md before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-outline-variant/40">
        {[
          { icon: 'pregnant_woman', tag: ['sage', 'Aktualny etap'], title: '1. Ciąża i ochrona pracownicza', text: 'Zwolnienie e-ZLA z kodem „B” = 100% podstawy, do 270 dni. Od 3. miesiąca ciąży umowa terminowa przedłuża się do dnia porodu (art. 177 Kp).', active: true },
          { icon: 'alarm', tag: ['warning', 'Kluczowe okno 21 dni'], title: '2. Narodziny i okno 21 dni', text: `Złóż wniosek o pełny urlop macierzyński i rodzicielski do ${fmtDate(result.deadlines.find((d) => d.id === 'zam')?.date)}, by zablokować stawkę 81,5%.` },
          { icon: 'child_care', tag: ['neutral', `Łącznie ${w.maternity} tygodni`], title: '3. Urlop macierzyński', text: `Pierwsze ${14} tygodni zastrzeżone dla mamy. Pozostałe ${w.maxFatherMat} tygodni może przejąć tata.` },
          { icon: 'groups', tag: ['sage', 'Work-Life Balance'], title: '4. Urlop rodzicielski', text: `${w.parentalTotal} tygodni, w tym 9 tygodni nieprzenoszalnych dla każdego rodzica. Okres można podzielić na maks. 5 części do końca roku, w którym dziecko kończy 6 lat.` },
          { icon: 'male', tag: ['peach', '14 dni • 100%'], title: '5. Urlop ojcowski', text: 'Niezależny od urlopu mamy, w 1 lub 2 częściach (min. 7 dni) do ukończenia przez dziecko 12 miesięcy.' },
        ].map((s) => (
          <div key={s.title} className="relative">
            <div className={`absolute -left-6 top-3 w-6 h-6 rounded-full flex items-center justify-center ${s.active ? 'bg-primary-container text-white ring-4 ring-primary-fixed' : 'bg-surface-container-highest text-primary-container'}`}><Icon name={s.icon} className="text-[13px]" /></div>
            <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(69,46,53,0.05)]">
              <div className="mb-1.5"><Chip tone={s.tag[0]} upper={false}>{s.tag[1]}</Chip></div>
              <h4 className={`font-headline-sm text-headline-sm ${s.active ? 'text-primary-container' : 'text-on-surface'}`}>{s.title}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const { input, setInput, result, session, notify, setAiOpen, setLoginOpen, demo, ready } = useApp();
  const [showTable, setShowTable] = useState(false);
  const nav = useNavigate();
  const [hello, setHello] = useState(null);
  const w = result.weeks;
  const zam = result.deadlines.find((d) => d.id === 'zam');
  const name = session?.user?.firstName;
  const people = [session?.user, session?.partner].filter(Boolean);
  const mother = people.find((p) => p.role === 'mama');
  const father = people.find((p) => p.role === 'tata');
  const src = (p) => (p ? (p === session?.user ? 'z ZUS (zalogowano)' : 'z ZUS (za zgodą)') : 'wpisane ręcznie');
  const fracIdx = [0, 0.25, 0.5].indexOf(Number(input.work.fraction));

  if (!ready) return <ParentWelcome />;
  return (
    <div className="flex flex-col w-full">
      <MobileTimeline result={result} input={input} setInput={setInput} />

      <div className="hidden lg:block">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-highest p-space-lg shadow-[0_4px_20px_-2px_rgba(69,46,53,0.04)] mb-space-lg">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-fixed opacity-40 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <IconBox icon="spa" tone="peach" size="w-12 h-12" iconSize="text-[26px]" />
              <div>
                <div className="flex items-center gap-space-xs flex-wrap">
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{hello || `Dzień dobry${name ? `, ${name === 'Anna' ? 'Anno' : name}` : ''}!`}</h1>
                  <Chip tone="ok">Aktywny plan</Chip>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Otula liczy {w.total} tygodni uprawnień Twojej rodziny i pilnuje terminów w ZUS oraz u pracodawcy.</p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              {demo ? (
                <button type="button" onClick={() => { setInput(JURY_PRESET); setHello('Scenariusz dla jury załadowany'); setTimeout(() => setHello(null), 3000); notify('Załadowano przykład: Anna (UoP) i Piotr (JDG)'); }} className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest text-primary font-button-text text-button-text shadow-[0_2px_8px_-1px_rgba(69,46,53,0.06)] hover:shadow-md transition-all active:scale-95">
                  <Icon name="auto_awesome" className="text-[18px] text-secondary group-hover:rotate-12 transition-transform" /><span>Pokaż przykład dla Jury</span>
                </button>
              ) : (
                <Link to="/kreator" className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest text-primary font-button-text shadow-sm hover:shadow-md"><Icon name="edit_note" className="text-[18px]" />Zmień moje dane</Link>
              )}
              <div className="hidden xl:flex items-center gap-1 text-on-surface-variant font-caption text-caption px-space-xs"><Icon name="verified_user" className="text-[16px] text-secondary" /><span>Kodeks pracy 2026 / ustawa zasiłkowa</span></div>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="mb-space-lg bg-surface-container-lowest rounded-[22px] px-space-md py-space-sm shadow-[0_2px_8px_-1px_rgba(69,46,53,0.04)] flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-sm">
            <Chip tone="sage" upper={false}>REST API Otula v1</Chip>
            <span className="flex items-center gap-1 text-caption text-on-surface-variant"><Icon name="gavel" className="text-[16px] text-tertiary" />Stan prawny: <strong>listopad 2026</strong></span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1 text-caption text-on-surface-variant"><Icon name="id_card" className="text-[16px] text-[#3D6488]" />{session ? `Zalogowano: ${session.user.name}` : <button type="button" onClick={() => setLoginOpen(true)} className="underline">Zaloguj przez mObywatel</button>}</span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1 text-caption text-on-surface-variant"><Icon name="verified" className="text-[16px] text-[#4C6944]" />{input.employment === 'jdg' ? `Zadłużenie: ${pln(Number(input.debt) || 0)}` : 'Zaległości składkowe: 0 zł'}</span>
          </div>
          <div className="flex items-center gap-space-xs text-caption">
            <span className="font-label-uppercase text-[12px] bg-surface-container px-2 py-0.5 rounded-md text-primary font-bold">{{ uop: 'Kod ZUS: 01 10 00', zlecenie: 'Kod ZUS: 04 11 00', jdg: 'Kod ZUS: 05 10 00', none: 'Brak tytułu', liquidation: 'Po ustaniu' }[input.employment]}</span>
            <span className="text-[#783E51] font-medium">Płatnik: {result.payer.motherLabel}</span>
          </div>
        </div>

        {/* Bento: profile + status pills */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-space-md mb-space-lg">
          <div className="2xl:col-span-8 card p-space-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <IconBox icon="diversity_1" tone="peach" />
                  <div>
                    <span className="font-label-uppercase text-label-uppercase text-on-surface-variant block">Profil rodzinny i płatnicy</span>
                    <h2 className="font-headline-sm text-headline-sm text-primary">{mother && father ? `${mother.name} i ${father.name}` : session ? `${session.user.name} + drugi rodzic` : 'Mama i tata'}</h2>
                  </div>
                </div>
                <Chip tone={result.entitled ? 'sage' : 'rose'}>{result.entitled ? 'Prawo do zasiłku' : 'Sprawdź uprawnienia'}</Chip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-1.5">
                  <div className="flex items-center justify-between"><span className="font-body-md-medium text-primary">Mama{mother ? ` — ${mother.firstName}` : ''}</span><span className="font-caption text-caption text-on-surface-variant">{mother?.stage || 'dane ' + src(mother)}</span></div>
                  <div className="text-body-sm text-on-surface-variant space-y-1">
                    <p className="flex items-center gap-1.5"><Icon name="check_circle" className="text-[16px] text-tertiary" />{{ uop: `Umowa o pracę (płatnik ${input.employerSize} os.)`, zlecenie: 'Umowa zlecenia', jdg: 'Działalność gospodarcza', none: 'Brak ubezpieczenia chorobowego', liquidation: 'Likwidacja pracodawcy' }[input.employment]}</p>
                    <p className="flex items-center gap-1.5"><Icon name="account_balance" className="text-[16px] text-tertiary" />Zasiłek wypłaca: {result.payer.mother === 'employer' ? 'pracodawca' : 'ZUS'}</p>
                    <p className="flex items-center gap-1.5 text-primary-container font-medium"><Icon name="event" className="text-[16px]" />Data porodu: <strong className="text-primary font-bold">{fmtDate(input.birthDate)}</strong></p>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-1.5">
                  <div className="flex items-center justify-between"><span className="font-body-md-medium text-primary">Tata{father ? ` — ${father.firstName}` : ''}</span><Chip tone={input.fatherInsured ? 'sage' : 'rose'} upper={false} dot={false}>{input.fatherInsured ? 'Ubezpieczony' : 'Bez ubezpieczenia'}</Chip></div>
                  <div className="text-body-sm text-on-surface-variant space-y-1">
                    <p className="flex items-center gap-1.5"><Icon name="check_circle" className="text-[16px] text-tertiary" />{{ uop: 'Umowa o pracę', zlecenie: 'Umowa zlecenia', jdg: 'Działalność gospodarcza (JDG)' }[input.fatherEmployment] || 'Inne'}</p>
                    <p className="flex items-center gap-1.5"><Icon name="health_and_safety" className="text-[16px] text-tertiary" />Podstawa: {pln(result.fatherBase)}</p>
                    <p className="flex items-center gap-1.5 text-primary-container font-medium"><Icon name="child_friendly" className="text-[16px]" />9 tyg. nieprzenoszalnego rodzicielskiego + 14 dni ojcowskiego</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm space-y-space-xs">
              <div className="flex items-center justify-between"><span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Wariant sytuacyjny rodziny</span><span className="text-caption text-secondary font-bold">Kp i ustawa „Za życiem”</span></div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-xs">
                {[
                  { k: 'one', icon: 'person', t: '1 dziecko (biologiczne)', s: '20 + 41 tyg.', on: input.event === 'bio' && input.children === 1, set: { event: 'bio', children: 1 } },
                  { k: 'twins', icon: 'group', t: 'Bliźnięta / wieloraczki', s: '31–37 tyg. macierzyńskiego', on: input.event === 'bio' && input.children > 1, set: { event: 'bio', children: 2 } },
                  { k: 'adopt', icon: 'favorite', t: 'Adopcja (do 14 lat)', s: 'Na warunkach macierz.', on: input.event === 'adoption', set: { event: 'adoption', children: 1, childAge: 3 } },
                  { k: 'foster', icon: 'home', t: 'Rodzina zastępcza', s: 'Niezawodowa, do 7 lat', on: input.event === 'foster', set: { event: 'foster', children: 1, childAge: 2 } },
                ].map((b) => (
                  <button key={b.k} type="button" onClick={() => setInput(b.set)} className={`p-space-xs rounded-xl text-left text-caption font-medium transition-all flex flex-col gap-1 min-h-[64px] ${b.on ? 'bg-primary-container text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}>
                    <span className={`font-bold flex items-center gap-1 text-[12px] ${b.on ? '' : 'text-primary'}`}><Icon name={b.icon} className="text-[14px]" />{b.t}</span>
                    <span className={`text-[12px] ${b.on ? 'opacity-90' : 'text-on-surface-variant'}`}>{b.s}</span>
                  </button>
                ))}
              </div>
              <div className="mt-space-xs p-space-xs px-space-sm rounded-xl bg-[#F8EBC7]/60 flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Icon name="health_and_safety" className="text-[#80611F] text-[20px]" />
                  <div><span className="font-body-md-medium text-[13px] text-primary block leading-tight">Zaświadczenie „Za życiem” (art. 4 ust. 3 ustawy)</span><span className="text-caption text-on-surface-variant">Wydłużenie urlopu rodzicielskiego do 65 tyg. (1 dziecko) lub 67 tyg. (ciąża mnoga)</span></div>
                </div>
                <div className="flex items-center gap-2"><span className="text-[12px] font-bold text-[#80611F] uppercase">{input.zaZyciem ? 'Aktywne' : 'Aktywuj'}</span><Toggle checked={input.zaZyciem} onChange={(v) => setInput({ zaZyciem: v })} label="Za życiem" /></div>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex flex-wrap items-center justify-between gap-space-xs text-caption text-on-surface-variant">
              <span className="flex items-center gap-1"><Icon name="sync" className="text-[16px] text-[#3D6488]" />{session ? `Mama: dane ${src(mother)} • Tata: dane ${src(father)}` : 'Dane wprowadzone samodzielnie'}</span>
              <Link to="/kreator" className="flex items-center gap-1 text-secondary font-bold hover:underline"><Icon name="edit" className="text-[16px]" />Zmień dane w kreatorze</Link>
            </div>
          </div>

          <div className="2xl:col-span-4 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 gap-space-sm content-start">
            <Link to="/e-uslugi" className="card p-space-md flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-space-xs"><IconBox icon="medical_services" tone="sky" size="w-11 h-11" />
                <div><div className="flex items-center gap-1.5"><span className="font-body-md-medium text-primary">Zwolnienie e-ZLA (kod B)</span><span className="text-[12px] px-1.5 rounded bg-[#E6EEDC] text-[#4C6944] font-bold">100%</span></div><p className="font-caption text-caption text-on-surface-variant">Wykorzystano: 56 z 270 dni okresu zasiłkowego</p></div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4C6944]" />
            </Link>
            <div className="card p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-xs"><IconBox icon="verified" tone="sage" size="w-11 h-11" />
                <div><span className="font-body-md-medium text-primary">Ubezpieczenie chorobowe</span><p className="font-caption text-caption text-on-surface-variant">{input.employment === 'none' ? 'Brak tytułu ubezpieczenia' : input.employment === 'uop' ? 'Obowiązkowe, ciągłe' : 'Dobrowolne'}</p></div>
              </div>
              <Chip tone={input.employment === 'none' ? 'rose' : 'sage'} upper={false}>{input.employment === 'none' ? 'Brak' : 'Spełnione'}</Chip>
            </div>
            <Link to="/e-uslugi" className="card p-space-md flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-space-xs"><IconBox icon="account_balance_wallet" tone="lilac" size="w-11 h-11" />
                <div><span className="font-body-md-medium text-primary">Rozliczenia ZUS płatnika</span><p className="font-caption text-caption text-on-surface-variant">Zaświadczenie o niezaleganiu (symulacja)</p></div>
              </div>
              <span className="font-button-text text-secondary whitespace-nowrap">{plnShort(Number(input.debt) || 0)}</span>
            </Link>
            <div className="card p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs"><IconBox icon="shield" tone="peach" /><div><span className="font-body-md-medium text-primary block leading-tight">Gwarancja minimum 1 000 zł</span><span className="font-caption text-caption text-on-surface-variant">Podwyższenie do świadczenia rodzicielskiego</span></div></div>
                <Chip tone="sage" upper={false} dot={false}>Aktywne</Chip>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">Jeśli miesięczny zasiłek byłby niższy niż kwota świadczenia rodzicielskiego, podwyższa się go do tej kwoty.</p>
              <div className="flex items-center justify-between text-caption pt-1">
                <span className="text-tertiary font-bold flex items-center gap-1"><Icon name="check_circle" className="text-[15px]" />{result.variants.A.monthly > 1000 ? `${plnShort(result.variants.A.monthly)} > 1 000 zł (brak dopłaty)` : 'Zasiłek podwyższony do 1 000 zł'}</span>
                <span className="text-on-surface-variant">Art. 31 ust. 3a</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variant selector */}
        <div className="card p-space-lg mb-space-lg">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-1"><IconBox icon="tune" tone="peach" size="w-9 h-9" iconSize="text-[20px]" /><h2 className="font-headline-md text-headline-md text-primary">Wybór wariantu wypłaty zasiłku</h2></div>
              <p className="font-body-md text-body-md text-on-surface-variant">Wniosek o pełny urlop złożony do 21 dni po porodzie daje stałą stawkę 81,5% (bez 9 tyg. drugiego rodzica — 70%).</p>
            </div>
            <Segmented value={input.variant} onChange={(v) => setInput({ variant: v })} options={[{ value: 'A', label: 'Wariant A: stałe 81,5%', icon: 'lock' }, { value: 'B', label: 'Wariant B: 100% / 70%', icon: 'lock' }]} />
          </div>
          <div className="p-space-md rounded-2xl bg-surface-container-low">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md items-center">
              <div className="flex items-center gap-space-xs"><IconBox icon="payments" tone="peach" />
                <div><span className="font-caption text-caption text-on-surface-variant block">Szacowane świadczenie mamy (brutto)</span><span className="font-headline-sm text-headline-sm text-primary">{input.variant === 'A' ? `ok. ${plnShort(result.variants.A.monthly)} / mc` : `${plnShort(result.variants.B.maternity)} → ${plnShort(result.variants.B.parental)}`}</span></div>
              </div>
              <div className="flex items-center gap-space-xs"><IconBox icon="event_available" tone="gold" />
                <div><span className="font-caption text-caption text-on-surface-variant block">Termin wniosku o pełny urlop</span><span className="font-body-md-medium text-primary">do {fmtDate(zam?.date)} (21 dni)</span></div>
              </div>
              <div className="flex xl:justify-end"><Chip tone="sage">{result.variants.A.total >= result.variants.B.total ? 'Rekomendacja: wariant A' : 'Wariant B = wyższa suma'}</Chip></div>
            </div>
          </div>

          <div className="mt-space-lg">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Architektura {w.total} tygodni urlopów rodziny</span>
              <span className="font-caption text-caption text-on-surface-variant">{fmtDate(result.schedule[0]?.from)} – {fmtDate(result.schedule.at(-1)?.to)}</span>
            </div>
            <TimelineBar segments={result.segments} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-md">
              {[['bg-[#783E51]', `${w.maternity} tyg. macierzyński (14 + ${w.maxFatherMat})`], ['bg-[#FDA592]', `${w.parentalTotal - w.reserved * 2} tyg. rodzicielski do podziału`], ['bg-[#CAECBD]', `${w.reserved} tyg. gwarantowane ojca (70%)`], ['bg-[#E1EEF8]', '14 dni urlop ojcowski (100%)']].map(([c, t]) => (
                <div key={t} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-md ${c}`} /><span className="font-caption text-caption text-on-surface-variant">{t}</span></div>
              ))}
            </div>
          </div>

          <div className="mt-space-lg bg-surface-container-low rounded-2xl p-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs mb-space-sm">
              <div>
                <div className="flex items-center gap-space-xs"><Icon name="calendar_month" className="text-[#783E51] text-[20px]" /><h3 className="font-headline-sm text-headline-sm text-primary">Harmonogram wypłat świadczenia</h3></div>
                <p className="font-caption text-caption text-on-surface-variant mt-0.5">Okresy, stawki i podmiot wypłacający (pracodawca &gt; 20 ubezpieczonych albo ZUS).</p>
              </div>
              <span className="text-caption bg-surface-container-lowest px-space-xs py-1 rounded-full text-primary font-bold shadow-sm">Suma brutto: {pln(result.totalGross)}</span>
            </div>
            <button type="button" onClick={() => setShowTable(!showTable)} className="text-secondary font-bold text-[14px] flex items-center gap-1 mb-2" aria-expanded={showTable}><Icon name={showTable ? 'expand_less' : 'expand_more'} />{showTable ? 'Zwiń szczegóły' : `Pokaż szczegóły (${result.schedule.length + 1} okresów)`}</button>
            {showTable && <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm min-w-[820px]">
                <thead className="text-on-surface-variant"><tr>{['Okres', 'Rodzaj urlopu', 'Stawka', 'Beneficjent', 'Kwota brutto / mc', 'Netto / mc', 'Podmiot wypłacający'].map((h) => <th key={h} className="py-1.5 px-2 font-bold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-surface-container">
                  {result.schedule.concat(result.segments.filter((s) => s.independent)).map((s, i) => (
                    <tr key={i} className="hover:bg-surface-container/50">
                      <td className="py-2 px-2 font-bold text-primary whitespace-nowrap">{s.from ? `${new Date(s.from).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} – ${new Date(s.to).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: '2-digit' })}` : 'do 12. m-ca życia'}<span className="block font-normal text-on-surface-variant">{s.weeks} tyg.</span></td>
                      <td className="py-2 px-2">{s.kind}</td>
                      <td className="py-2 px-2"><span className={`px-1.5 py-0.5 rounded text-[12px] font-bold ${segColor(s.color).bg} ${segColor(s.color).text}`}>{String(s.rate).replace('.', ',')}%</span></td>
                      <td className="py-2 px-2">{s.who}</td>
                      <td className="py-2 px-2 font-medium whitespace-nowrap">{pln(s.monthly)}</td>
                      <td className="py-2 px-2 font-bold text-primary whitespace-nowrap">{pln(s.net)}</td>
                      <td className="py-2 px-2 text-on-surface-variant font-medium">{s.payerLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-lg">
            <div className="rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between">
              <div><div className="flex items-center justify-between mb-2"><Chip tone="sage" upper={false} dot={false}>Unijna ochrona praw ojca</Chip><span className="font-caption text-caption text-on-surface-variant">Nie podlega przeniesieniu</span></div>
                <h3 className="font-headline-sm text-headline-sm text-primary">9 tygodni gwarantowanych dla taty</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Część urlopu rodzicielskiego wyłącznie dla drugiego rodzica. Niewykorzystana — przepada. Zasiłek: {pln(result.variants.reservedMonthly)} / mc (70%).</p>
              </div>
              <div className="mt-space-md flex items-center justify-between"><span className="font-caption text-caption text-primary">Art. 182¹a § 4 Kp</span>
                <button type="button" onClick={() => setInput({ fatherUsesReserved: !input.fatherUsesReserved })} className="text-secondary font-button-text text-[14px] flex items-center gap-1 hover:underline">{input.fatherUsesReserved ? 'Uwzględnione w planie' : 'Dodaj do planu'}<Icon name="chevron_right" className="text-[16px]" /></button>
              </div>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between">
              <div><div className="flex items-center justify-between mb-2"><Chip tone="sky" upper={false} dot={false}>Niezależny od rodzicielskiego</Chip><span className="font-caption text-caption text-on-surface-variant">Do 12. m-ca życia</span></div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Urlop ojcowski (14 dni kalendarzowych)</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">100% podstawy. Jednorazowo lub w 2 częściach po min. 7 dni — najpóźniej do {fmtDate(result.deadlines.find((d) => d.id === 'ojcowski')?.date)}. Wniosek o zasiłek: ZAM (od 24.10.2026 zastępuje ZAO).</p>
              </div>
              <div className="mt-space-md flex items-center justify-between"><span className="font-caption text-caption text-[#3D6488]">Płatność: {result.payer.fatherLabel}</span>
                <Link to="/dokumenty?wniosek=ojcowski" className="text-secondary font-button-text text-[14px] flex items-center gap-1 hover:underline">Generuj wniosek<Icon name="download" className="text-[16px]" /></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator */}
        <div className="card p-space-lg mb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
            <div className="flex items-center gap-space-xs"><IconBox icon="calculate" tone="lilac" />
              <div><span className="font-label-uppercase text-label-uppercase text-[#6B4F8F] block">Symulator elastyczności</span><h2 className="font-headline-md text-headline-md text-primary">Łączenie urlopu rodzicielskiego z pracą</h2></div>
            </div>
            <span className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption flex items-center gap-1.5 self-start"><Icon name="balance" className="text-[16px] text-tertiary" />Zgodnie z art. 182¹e Kodeksu pracy</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-center">
            <div className="xl:col-span-6 space-y-space-md">
              <div>
                <div className="flex items-center justify-between mb-2"><label htmlFor="frac" className="font-body-md-medium text-primary">Wymiar pracy w trakcie urlopu:</label><span className="font-button-text text-[14px] text-secondary bg-[#FBE4D7] px-space-xs py-0.5 rounded-full">{['Tylko urlop', '1/4 etatu (10 h/tydz.)', '1/2 etatu (20 h/tydz.)'][fracIdx < 0 ? 0 : fracIdx]}</span></div>
                <input id="frac" type="range" min="0" max="2" step="1" value={fracIdx < 0 ? 0 : fracIdx} onChange={(e) => setInput({ work: { ...input.work, fraction: [0, 0.25, 0.5][e.target.value], weeks: input.work.weeks || 8 } })} className="w-full h-2 bg-surface-container rounded-lg cursor-pointer" />
                <div className="flex justify-between text-caption text-on-surface-variant mt-1"><span>Tylko urlop</span><span>1/4 etatu</span><span className="font-bold text-primary">1/2 etatu (maks.)</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label htmlFor="wweeks" className="font-body-md-medium text-primary">Przez ile tygodni rodzicielskiego:</label><span className="font-bold text-primary">{input.work.weeks} tyg.</span></div>
                <input id="wweeks" type="range" min="0" max={w.motherParental} value={Math.min(input.work.weeks, w.motherParental)} onChange={(e) => setInput({ work: { ...input.work, weeks: Number(e.target.value) } })} className="w-full h-2 bg-surface-container rounded-lg cursor-pointer" />
              </div>
              <div className="bg-surface-container-low rounded-2xl p-space-md">
                <span className="font-caption text-caption text-on-surface-variant block mb-1">Mechanizm proporcjonalnego wydłużenia:</span>
                <p className="font-body-sm text-body-sm text-on-surface">Urlopu udziela się na pozostałą część etatu, a jego wymiar wydłuża się proporcjonalnie: {input.work.weeks} tyg. × {String(input.work.fraction).replace('.', ',')} etatu = <strong className="text-primary">+{result.work.extension} tyg.</strong> Przy 1/2 etatu przez cały okres rodzicielski trwa maksymalnie {w.parentalTotal * 2} tygodni.</p>
              </div>
            </div>
            <div className="xl:col-span-6 bg-gradient-to-br from-surface-container-low to-surface-container-high rounded-[22px] p-space-lg">
              <div className="grid grid-cols-2 gap-space-md mb-space-md">
                <div><span className="font-caption text-caption text-on-surface-variant block">Dodatkowy czas z dzieckiem</span><span className="font-headline-lg text-headline-lg text-primary block mt-1">+{result.work.extension} tyg.</span><span className="font-caption text-caption text-tertiary">Rodzicielski mamy: {w.motherParental + result.work.extension} tyg.</span></div>
                <div><span className="font-caption text-caption text-on-surface-variant block">Miesięczny przychód brutto</span><span className="font-headline-lg text-headline-lg text-secondary block mt-1">~{plnShort(result.work.combined)}</span><span className="font-caption text-caption text-on-surface-variant">Pensja {plnShort(result.work.salary)} + zasiłek {plnShort(result.work.benefit)}</span></div>
              </div>
              <div className="w-full bg-surface-container-lowest rounded-xl p-space-sm flex items-center justify-between gap-2 text-caption">
                <span className="flex items-center gap-1.5 text-on-surface-variant"><Icon name="shield_person" className="text-[16px] text-primary" />Ochrona przed wypowiedzeniem trwa przez cały wydłużony okres.</span>
                <span className="font-bold text-primary shrink-0">Art. 177 Kp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps + AI */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md mb-space-lg">
          <div className="xl:col-span-8 card p-space-lg">
            <div className="flex items-center justify-between pb-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs"><IconBox icon="assignment" tone="gold" />
                <div><span className="font-label-uppercase text-label-uppercase text-[#80611F] block">Kluczowe terminy</span><h2 className="font-headline-sm text-headline-sm text-primary">Najbliższe kroki proceduralne</h2></div>
              </div>
              <a href="/api/calculate" onClick={(e) => { e.preventDefault(); downloadIcs(result); notify('Pobrano terminy do kalendarza (.ics)'); }} className="text-caption text-secondary font-bold flex items-center gap-1 hover:underline"><Icon name="event" className="text-[16px]" />Dodaj do kalendarza</a>
            </div>
            <div className="space-y-space-sm">
              {result.deadlines.slice(0, 4).map((d, i) => (
                <div key={d.id} className="p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
                  <div className="flex items-start gap-space-xs">
                    <div className={`w-8 h-8 rounded-full text-on-primary flex items-center justify-center font-bold text-caption shrink-0 mt-0.5 ${['bg-[#783E51]', 'bg-[#934E3F]', 'bg-[#4C6944]', 'bg-[#3D6488]'][i]}`}>{i + 1}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap"><h4 className="font-body-md-medium text-primary">{d.title}</h4>{d.critical && <Chip tone="rose" upper={false}>Krytyczny: 21 dni</Chip>}</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Termin: <strong className="text-on-surface">{fmtDate(d.date)}</strong> • {d.who} • <span className="text-[12px]">{d.law}</span></p>
                    </div>
                  </div>
                  {d.id === 'zam' && <Btn kind="dark" className="!py-1.5 !text-[13px] self-end md:self-auto" onClick={() => nav('/dokumenty?wniosek=urlop')}>Wypełnij wniosek online</Btn>}
                  {d.id === 'usc' && <Btn kind="ghost" className="!py-1.5 !text-[13px] self-end md:self-auto" onClick={() => nav('/e-uslugi#usc')}>Symulacja USC</Btn>}
                </div>
              ))}
            </div>
            <div className="mt-space-md text-caption text-on-surface-variant">Art. 177 Kp: od wniosku o urlop do jego zakończenia pracodawca nie może wypowiedzieć ani rozwiązać umowy.</div>
          </div>
          <div className="xl:col-span-4 bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-lowest rounded-[24px] p-space-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-xs mb-space-sm">
                <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center"><Icon name="temp_preferences_custom" className="text-[20px]" /></div>
                <div><span className="font-label-uppercase text-label-uppercase text-primary block">Wirtualny asystent</span><h3 className="font-headline-sm text-headline-sm text-primary">Zapytaj Otulę AI</h3></div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Odpowiedzi z bazy przepisów ustawy zasiłkowej i Kodeksu pracy — z podstawą prawną.</p>
              <div className="space-y-space-xs">
                {['Czy tata w JDG może wziąć 9 tyg. bez zawieszania firmy?', 'Co jeśli poród nastąpi 2 tygodnie przed terminem?', 'Jak obliczana jest podstawa z 12 miesięcy?'].map((q) => (
                  <button key={q} type="button" onClick={() => setAiOpen(true)} className="w-full text-left p-space-xs px-space-sm rounded-xl bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface text-caption flex items-center justify-between shadow-sm"><span>{q}</span><Icon name="arrow_forward" className="text-[16px] text-secondary" /></button>
                ))}
              </div>
            </div>
            <div className="mt-space-md flex items-center gap-1.5 text-[12px] text-on-surface-variant"><Icon name="verified" className="text-[15px] text-[#4C6944]" />Podstawa: ustawa zasiłkowa (Dz.U. 2026 poz. 854) i Kodeks pracy.</div>
          </div>
        </div>

        <Link to="/trudne-sytuacje" className="block bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-lowest rounded-[24px] p-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs"><IconBox icon="volunteer_activism" tone="peach" />
              <div><span className="font-label-uppercase text-label-uppercase text-secondary block">Czuła opieka Otuli</span><h3 className="font-headline-sm text-headline-sm text-primary">Wsparcie w trudnych sytuacjach: strata dziecka, wcześniak, choroba</h3></div>
            </div>
            <span className="flex items-center gap-1 text-secondary font-bold">Zobacz uprawnienia i organizacje pomocowe<Icon name="arrow_forward" /></span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function downloadIcs(result) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Otula//PL'];
  for (const d of result.deadlines) {
    const dt = d.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT', `UID:${d.id}-${dt}@otula`, `DTSTAMP:${dt}T090000Z`, `DTSTART;VALUE=DATE:${dt}`, `SUMMARY:${d.title}`, `DESCRIPTION:${d.law}`, 'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', `DESCRIPTION:${d.title}`, 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
  a.download = 'otula-terminy.ics';
  a.click();
}
