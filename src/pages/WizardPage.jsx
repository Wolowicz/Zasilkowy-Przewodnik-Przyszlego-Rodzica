import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { Icon, Toggle, inputCls } from '../components/ui.jsx';
import { pln } from '../../shared/engine.js';

function Option({ on, title, sub, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-start gap-space-sm active:scale-[0.99] ${on ? 'bg-primary-fixed shadow-md' : 'bg-surface-container-lowest shadow-sm'}`}>
      <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${on ? 'bg-surface' : 'bg-surface-container-high'}`}><span className={`w-2 h-2 rounded-full ${on ? 'bg-primary' : 'bg-transparent'}`} /></div>
      <div className="flex flex-col min-w-0 flex-1"><span className="font-headline-sm text-headline-sm text-on-surface">{title}</span>{sub && <span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span>}</div>
    </button>
  );
}

export default function WizardPage() {
  const { input, setInput, result, notify } = useApp();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [help, setHelp] = useState(false);
  const empChoice = input.employment === 'uop' ? (input.employerSize > 20 ? 'big' : 'small') : input.employment;

  const STEPS = [
    { cat: 'Twoja sytuacja', badge: 'Zdarzenie', q: 'Na jakim etapie jest Twoja rodzina?', sub: 'Dopasujemy uprawnienia i terminy.', help: ['Dlaczego pytamy?', 'Przy przyjęciu dziecka na wychowanie obowiązują inne granice wieku i brak obowiązkowych 14 tygodni dla matki.'],
      body: <div className="flex flex-col gap-space-sm">
        <Option on={input.event === 'bio'} title="Spodziewamy się dziecka / urodziło się" sub="Poród biologiczny" onClick={() => setInput({ event: 'bio' })} />
        <Option on={input.event === 'adoption'} title="Przysposobienie (adopcja)" sub="Dziecko do 14 lat, wniosek do sądu" onClick={() => setInput({ event: 'adoption', childAge: 3 })} />
        <Option on={input.event === 'foster'} title="Rodzina zastępcza niezawodowa" sub="Dziecko do 7 lat (10 przy odroczeniu)" onClick={() => setInput({ event: 'foster', childAge: 2 })} />
      </div> },
    { cat: 'Terminy', badge: 'Data', q: 'Kiedy jest (lub był) termin porodu?', sub: 'Na tej podstawie policzymy okno 21 dni i pozostałe terminy.', help: ['To tylko orientacja', 'Termin 21 dni liczy się od faktycznej daty porodu. Po porodzie zaktualizuj datę — Otula przeliczy terminy.'],
      body: <div className="space-y-space-sm"><input type="date" className={inputCls + ' !bg-surface-container-lowest text-[18px]'} value={input.birthDate} onChange={(e) => setInput({ birthDate: e.target.value })} aria-label="Data porodu" />
        <div className="p-space-md rounded-2xl bg-surface-container-low text-body-sm">Wniosek o 81,5% do: <b className="text-primary">{result.deadlines[0] && new Date(result.deadlines[0].date).toLocaleDateString('pl-PL')}</b></div></div> },
    { cat: 'Twoja praca i ubezpieczenie', badge: 'Płatnik zasiłku macierzyńskiego', q: 'Czy Twój pracodawca zatrudnia powyżej 20 osób?', sub: 'Wybierz wariant najlepiej pasujący do Twojej obecnej umowy.', help: ['Kto wypłaci Ci zasiłek?', 'Powyżej 20 ubezpieczonych: pieniądze co miesiąc przekazuje pracodawca razem z pensją. Do 20 osób, JDG, zlecenie: zasiłek wypłaca ZUS na Twoje konto. Sprawdzisz to w kadrach lub w PUE/eZUS (Ubezpieczenia i płatnicy).'],
      body: <div className="flex flex-col gap-space-sm">
        <Option on={empChoice === 'big'} title="Tak" sub="Średnia lub duża firma, instytucja" onClick={() => setInput({ employment: 'uop', employerSize: 38 })} />
        <Option on={empChoice === 'small'} title="Nie" sub="Mała firma lub startup (do 20 osób)" onClick={() => setInput({ employment: 'uop', employerSize: 12 })} />
        <Option on={empChoice === 'jdg'} title="Własna działalność (JDG)" sub="Samodzielnie opłacasz składki ZUS" onClick={() => setInput({ employment: 'jdg', voluntarySickness: true })} />
        <Option on={empChoice === 'zlecenie'} title="Umowa zlecenia" sub="Z dobrowolnym ubezpieczeniem chorobowym" onClick={() => setInput({ employment: 'zlecenie', voluntarySickness: true })} />
        <Option on={empChoice === 'none'} title="Nie mam ubezpieczenia" sub="Np. umowa o dzieło, brak pracy" onClick={() => setInput({ employment: 'none' })} />
      </div> },
    { cat: 'Wysokość zasiłku', badge: 'Podstawa wymiaru', q: input.employment === 'jdg' ? 'Od jakiej kwoty płacisz składki?' : 'Ile średnio zarabiasz brutto miesięcznie?', sub: 'Średnia z 12 miesięcy przed miesiącem porodu (lub zwolnienia).', help: ['Jak liczymy?', 'Od średniego wynagrodzenia odejmujemy 13,71% składek. Premie kwartalne i roczne liczą się w 1/12. Dokładną podstawę znajdziesz w Z-3 od pracodawcy.'],
      body: <div className="space-y-space-sm"><div className="relative"><input type="number" className={inputCls + ' !bg-surface-container-lowest text-[22px] font-bold pr-24'} value={input.grossSalary} onChange={(e) => setInput({ grossSalary: Number(e.target.value) })} aria-label="Wynagrodzenie brutto" /><span className="absolute right-4 top-3.5 text-on-surface-variant font-bold">zł brutto</span></div>
        {input.employment === 'jdg' && <><label className="block text-body-sm font-bold">Zadłużenie w ZUS (zł)</label><input type="number" className={inputCls + ' !bg-surface-container-lowest'} value={input.debt} onChange={(e) => setInput({ debt: Number(e.target.value) })} /></>}
        <div className="p-space-md rounded-2xl bg-surface-container-low text-body-sm">Podstawa: <b className="text-primary">{pln(result.base)}</b> • 81,5%: <b>{pln(result.variants.A.monthly)}</b> / mc</div></div> },
    { cat: 'Dziecko', badge: 'Wymiar urlopu', q: 'Ile dzieci i czy są szczególne okoliczności?', sub: 'Liczba dzieci i „Za życiem” wydłużają urlopy.', help: ['Co wydłuża urlop?', 'Wieloraczki: 31–37 tygodni macierzyńskiego i 43 tygodnie rodzicielskiego. „Za życiem”: 65/67 tygodni rodzicielskiego. Hospitalizacja noworodka: uzupełniający urlop do 8 lub 15 tygodni.'],
      body: <div className="space-y-space-sm">
        <div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setInput({ children: n })} className={`h-14 rounded-2xl font-bold text-[18px] ${input.children === n ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest shadow-sm'}`}>{n}{n === 5 ? '+' : ''}</button>)}</div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm"><span className="font-bold">Zaświadczenie „Za życiem”</span><Toggle checked={input.zaZyciem} onChange={(v) => setInput({ zaZyciem: v })} label="Za życiem" /></div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm"><span className="font-bold">Wcześniak / pobyt w szpitalu</span><Toggle checked={input.premature !== 'none'} onChange={(v) => setInput({ premature: v ? 'preterm' : 'none', hospitalWeeks: v ? 4 : 0 })} label="Wcześniak" /></div>
      </div> },
    { cat: 'Drugi rodzic', badge: 'Podział opieki', q: 'Czy drugi rodzic ma ubezpieczenie chorobowe?', sub: 'Każdemu z rodziców przysługuje 9 nieprzenoszalnych tygodni rodzicielskiego.', help: ['Po co to?', 'Ubezpieczony tata może przejąć część macierzyńskiego po 14 tygodniach, wziąć 9 tygodni rodzicielskiego (70%) i 14 dni ojcowskiego (100%).'],
      body: <div className="flex flex-col gap-space-sm">
        <Option on={input.fatherInsured && input.fatherEmployment === 'uop'} title="Tak — umowa o pracę" onClick={() => setInput({ fatherInsured: true, fatherEmployment: 'uop' })} />
        <Option on={input.fatherInsured && input.fatherEmployment === 'jdg'} title="Tak — działalność (JDG)" sub="Z dobrowolnym chorobowym" onClick={() => setInput({ fatherInsured: true, fatherEmployment: 'jdg' })} />
        <Option on={input.fatherInsured && input.fatherEmployment === 'zlecenie'} title="Tak — umowa zlecenia" onClick={() => setInput({ fatherInsured: true, fatherEmployment: 'zlecenie' })} />
        <Option on={!input.fatherInsured} title="Nie / nie dotyczy" onClick={() => setInput({ fatherInsured: false })} />
      </div> },
    { cat: 'Podsumowanie', badge: 'Wariant wypłaty', q: 'Czy chcesz złożyć wniosek o pełny urlop w 21 dni?', sub: 'To decyduje o stawce: równe 81,5% albo 100% → 70%.', help: ['Co wybrać?', 'Wariant A daje równy dochód przez cały rok. Wariant B — więcej na początku, mniej w rodzicielskim. Sumy są zbliżone; kalkulator pokaże różnicę.'],
      body: <div className="flex flex-col gap-space-sm">
        <Option on={input.variant === 'A'} title={`Tak — 81,5% (${pln(result.variants.A.monthly)} / mc)`} sub="Równy dochód przez cały okres" onClick={() => setInput({ variant: 'A' })} />
        <Option on={input.variant === 'B'} title={`Nie — 100% → 70%`} sub={`${pln(result.variants.B.maternity)} → ${pln(result.variants.B.parental)}`} onClick={() => setInput({ variant: 'B' })} />
      </div> },
  ];
  const S = STEPS[i];
  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : (notify('Plan gotowy!'), nav('/')));

  return (
    <div className="max-w-xl mx-auto flex flex-col w-full pb-8">
      <div className="flex flex-col gap-space-xs mb-space-md">
        <div className="flex items-center justify-between"><span className="font-caption text-caption text-on-surface-variant font-medium">KROK {i + 1} Z {STEPS.length}</span><span className="font-caption text-caption text-primary font-bold">{S.cat}</span></div>
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden"><div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
      </div>
      <div className="flex flex-col gap-1 mb-space-lg">
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary font-label-uppercase text-label-uppercase"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />{S.badge}</span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight mt-1">{S.q}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{S.sub}</p>
      </div>
      <div className="mb-space-lg">{S.body}</div>
      <button type="button" onClick={() => setHelp(true)} className="w-full text-left p-space-md rounded-2xl bg-secondary-fixed/40 hover:bg-secondary-fixed/60 transition-all flex items-center justify-between gap-space-sm mb-space-xl group shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0"><div className="w-10 h-10 rounded-2xl bg-secondary-fixed-dim/50 flex items-center justify-center text-on-secondary-fixed shrink-0"><Icon name="contact_support" className="text-[22px]" /></div>
          <div className="flex flex-col min-w-0"><span className="font-headline-sm text-headline-sm text-on-secondary-fixed leading-snug">Nie wiem, co to oznacza?</span><span className="font-body-sm text-body-sm text-on-secondary-fixed-variant truncate">Dotknij, aby sprawdzić, dlaczego to ważne</span></div></div>
        <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm"><Icon name="expand_more" className="text-[18px]" /></div>
      </button>
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={() => (i ? setI(i - 1) : nav(-1))} className="flex-1 py-3.5 px-space-md rounded-full bg-surface-container-high/60 hover:bg-surface-container-high font-button-text text-button-text">Wróć</button>
          <button type="button" onClick={next} className="flex-[2] py-3.5 px-space-lg rounded-full bg-primary-container text-on-primary font-button-text text-button-text shadow-sm hover:bg-primary flex items-center justify-center gap-2">{i === STEPS.length - 1 ? 'Pokaż mój plan' : 'Dalej'}<Icon name="arrow_forward" className="text-[18px]" /></button>
        </div>
        <button type="button" onClick={() => { notify('Otula uwzględni bezpieczny wariant — możesz wrócić później.'); next(); }} className="w-full py-2.5 font-button-text text-button-text text-on-surface-variant hover:text-primary">Pomiń to pytanie</button>
      </div>

      <div className={`fixed inset-0 z-[75] bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-300 flex items-end justify-center ${help ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={(e) => e.target === e.currentTarget && setHelp(false)}>
        <div className={`w-full max-w-xl max-h-[85vh] overflow-y-auto bg-surface rounded-t-3xl p-space-lg shadow-xl transition-transform duration-300 flex flex-col gap-space-lg ${help ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/60 mx-auto -mt-1" />
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex items-center gap-space-sm"><div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed"><Icon name="psychology_alt" className="text-[26px]" /></div>
              <div><span className="font-caption text-caption text-secondary font-bold uppercase">Spokojnie, to naturalne</span><h3 className="font-headline-md text-headline-md">{S.help[0]}</h3></div></div>
            <button type="button" onClick={() => setHelp(false)} className="w-9 h-9 rounded-full bg-surface-container-high/80 flex items-center justify-center" aria-label="Zamknij"><Icon name="close" className="text-[20px]" /></button>
          </div>
          <div className="p-space-md rounded-2xl bg-surface-container-low text-body-md text-on-surface-variant leading-relaxed">{S.help[1]}</div>
          <div className="p-space-md rounded-2xl bg-tertiary-fixed/30 flex items-start gap-space-sm"><Icon name="security" className="text-tertiary text-[24px]" /><div><span className="font-headline-sm text-headline-sm text-tertiary">Co jeśli pominiesz?</span><p className="text-body-sm text-on-surface-variant">Otula przyjmie bezpieczny wariant i pokaże kroki dla obu możliwości. Nic nie przepadnie.</p></div></div>
          <button type="button" onClick={() => setHelp(false)} className="w-full py-3.5 rounded-full bg-primary-container text-on-primary font-button-text">Rozumiem, wracam do wyboru</button>
        </div>
      </div>
    </div>
  );
}
