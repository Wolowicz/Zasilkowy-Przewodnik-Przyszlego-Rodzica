import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { Icon, AIBadge, Toggle } from './ui.jsx';
import { api } from '../api.js';
import MObywatelLogin from './MObywatelLogin.jsx';
import LogoMark from './Logo.jsx';

export const NAV = [
  { group: 'Ścieżka Zasiłkowa', items: [
    { to: '/', icon: 'calendar_today', label: 'Plan i Oś Czasu', mobile: 'Mój Plan', mIcon: 'diversity_1' },
    { to: '/kalkulator', icon: 'calculate', label: 'Kalkulator Świadczeń', mobile: 'Kalkulator' },
    { to: '/audytor', icon: 'find_in_page', label: 'Audytor Spraw PDF', mobile: 'Sprawy i PDF', mIcon: 'folder_open' },
    { to: '/dokumenty', icon: 'description', label: 'Dokumenty i Wnioski' },
  ] },
  { group: 'Wsparcie i Integracje', items: [
    { to: '/trudne-sytuacje', icon: 'volunteer_activism', label: 'Trudne Sytuacje', mobile: 'Pomoc', mIcon: 'support_agent' },
    { to: '/e-uslugi', icon: 'devices', label: 'Symulacje e-Usług' },
    { to: '/baza-wiedzy', icon: 'menu_book', label: 'Baza Wiedzy' },
    { to: '/admin', icon: 'tune', label: 'Parametry Admin' },
  ] },
];
const ALL = NAV.flatMap((g) => g.items).concat([{ to: '/kreator', icon: 'auto_fix_high', label: 'Kreator sytuacji' }]);

function Logo() {
  return <NavLink to="/" aria-label="otula+ — strona główna"><LogoMark tagline /></NavLink>;
}

function Sidebar({ open, onClose }) {
  const { rules, demo, setDemo, notify } = useApp();
  return (
    <>
      {open && <div className="fixed inset-0 z-[55] bg-inverse-surface/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest border-r border-[#f1e6e9] z-[60] flex flex-col justify-between overflow-y-auto no-scrollbar transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-space-lg">
          <div className="flex items-center justify-between mb-space-xs">
            <Logo />
            <button className="lg:hidden w-9 h-9 rounded-full hover:bg-surface-container" onClick={onClose} aria-label="Zamknij menu"><Icon name="close" /></button>
          </div>
          {NAV.map((g) => (
            <div className="mt-space-lg" key={g.group}>
              <span className="font-label-uppercase text-label-uppercase text-on-surface-variant block mb-space-xs px-space-xs">{g.group}</span>
              <nav className="flex flex-col gap-1">
                {g.items.map((it) => (
                  <NavLink key={it.to} to={it.to} end={it.to === '/'} onClick={onClose}
                    className={({ isActive }) => `flex items-center gap-space-xs px-space-md py-space-sm rounded-full transition-colors font-body-md-medium text-body-md-medium ${isActive ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_-1px_rgba(69,46,53,0.08)]' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                    <Icon name={it.icon} className="text-[20px]" />
                    <span>{it.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
          <NavLink to="/kreator" onClick={onClose} className="mt-space-lg flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-secondary-fixed/60 text-on-secondary-container hover:bg-secondary-fixed font-body-md-medium">
            <Icon name="auto_fix_high" className="text-[20px]" /> Kreator „Moja sytuacja”
          </NavLink>
        </div>
        <div className="p-space-lg space-y-space-sm">
          <div className="rounded-DEFAULT p-space-md border border-[#ECE4F6] bg-[#F7F3FC]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold text-[14px] text-[#4f3a6d]"><Icon name="science" className="text-[18px]" />Przykładowe dane dla jury</span>
              <Toggle checked={demo} onChange={(v) => { setDemo(v); notify(v ? 'Wczytano przykładową rodzinę (Anna i Piotr)' : 'Przykładowe dane wyłączone — uzupełnij swój profil', v ? 'science' : 'person'); }} label="Przykładowe dane dla jury" />
            </div>
            <p className="text-[12px] text-on-surface-variant mt-1">{demo ? 'Włączone: rodzina testowa i scenariusze ZUS.' : 'Wyłączone: Otula pokazuje tylko Twoje dane.'}</p>
          </div>
          <div className="bg-surface-container-low rounded-DEFAULT p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <Icon name="verified" className="text-tertiary text-[20px]" />
              <span className="font-label-uppercase text-label-uppercase text-tertiary">Zgodność ZUS 2026</span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant">Stawki {rules.rates.combined}% / {rules.rates.maternity}% / {rules.rates.parental}%. Parametry: {rules.version}.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenu }) {
  const { session, setLoginOpen, logout, setAiOpen, theme, setTheme, notify } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const results = q.length > 1 ? SEARCH.filter((s) => (s.label + ' ' + s.keys).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 lg:h-20 bg-white/90 backdrop-blur-xl border-b border-[#f1e6e9] z-40 px-margin lg:px-space-lg flex items-center justify-between gap-space-sm no-print">
      <div className="flex items-center gap-space-xs lg:hidden">
        <NavLink to="/" aria-label="otula+"><LogoMark size="sm" /></NavLink>
        {session && <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/60 text-tertiary text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />mObywatel</span>}
      </div>
      <div className="hidden lg:block flex-1 max-w-lg relative">
        <div className="relative flex items-center w-full">
          <Icon name="search" className="absolute left-space-md text-on-surface-variant text-[20px]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full h-12 pl-11 pr-space-md bg-surface-container-lowest rounded-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant shadow-[0_2px_6px_-1px_rgba(69,46,53,0.03)] focus:outline-none" placeholder="Szukaj: zasiłek, wniosek, termin…" type="search" aria-label="Szukaj" />
        </div>
        {results.length > 0 && (
          <div className="absolute top-14 left-0 right-0 card p-2 z-50">
            {results.map((r) => (
              <button key={r.label} type="button" onClick={() => { nav(r.to); setQ(''); }} className="w-full text-left px-3 py-2 rounded-2xl hover:bg-surface-container-low flex items-center gap-2">
                <Icon name={r.icon} className="text-primary text-[18px]" /><span className="font-body-md-medium">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-space-xs lg:gap-space-sm">
        <button type="button" onClick={() => setTheme(theme === 'otula' ? 'zus' : 'otula')} title="Przełącz motyw: Otula / ZUS GovTech" className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest text-caption font-bold text-on-surface">
          <Icon name="palette" className="text-[18px]" />{theme === 'otula' ? 'Motyw ZUS' : 'Motyw Otula'}
        </button>
        <button type="button" onClick={() => setAiOpen(true)} className="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container transition-colors">
          <Icon name="temp_preferences_custom" className="text-[18px]" /><span className="font-button-text text-button-text">Zapytaj Otulę AI</span>
        </button>
        {session ? (
          <button type="button" onClick={() => { logout(); notify('Wylogowano z mObywatela (symulacja)', 'logout'); }} className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed" title="Wyloguj">
            <span className="w-2 h-2 rounded-full bg-tertiary" /><span className="font-label-uppercase text-label-uppercase">mObywatel połączony</span>
          </button>
        ) : (
          <button type="button" onClick={() => setLoginOpen(true)} className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest">
            <Icon name="id_card" className="text-[18px] text-[#3D6488]" /><span className="font-label-uppercase text-label-uppercase">Zaloguj mObywatel</span>
          </button>
        )}
        <div className="flex items-center gap-space-xs pl-space-xs">
          <div className="text-right hidden xl:block">
            <span className="block font-body-md-medium text-body-md-medium text-on-surface leading-tight">{session ? session.user.name : 'Gość'}</span>
            <span className="block font-caption text-caption text-on-surface-variant">{session ? (session.partner ? `+ dane: ${session.partner.firstName} (za zgodą)` : 'Zalogowano mObywatelem') : 'Dane wpisane ręcznie'}</span>
          </div>
          <button type="button" onClick={() => (session ? null : setLoginOpen(true))} title={session ? session.user.name : 'Zaloguj przez mObywatel'} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[13px]">{session ? session.user.name.split(' ').map((x) => x[0]).join('') : <Icon name="person" className="text-[18px]" />}</button>
        </div>
        <button type="button" onClick={onMenu} className="lg:hidden min-h-[44px] px-3.5 py-2 rounded-full bg-surface-container-high/60 text-on-surface hover:bg-surface-container-highest flex items-center gap-1.5 font-button-text text-body-sm" aria-label="Menu">
          <Icon name="widgets" className="text-[18px]" /><span>Menu</span>
        </button>
      </div>
    </header>
  );
}

const SEARCH = [
  ...ALL.map((a) => ({ label: a.label, to: a.to, icon: a.icon, keys: '' })),
  { label: 'Wariant 81,5% — wniosek w 21 dni', to: '/kalkulator', icon: 'percent', keys: 'zam 21 dni 81,5 wariant' },
  { label: 'Łączenie urlopu z pracą', to: '/kalkulator#praca', icon: 'work', keys: 'etat 1/2 praca łączenie' },
  { label: 'Zaświadczenie o zadłużeniu', to: '/e-uslugi', icon: 'account_balance_wallet', keys: 'dług zadłużenie jdg składki' },
  { label: 'e-ZLA — zwolnienia lekarskie', to: '/e-uslugi', icon: 'medical_services', keys: 'l4 zla chorobowe ciąża' },
  { label: 'Odpis aktu urodzenia (USC)', to: '/e-uslugi', icon: 'badge', keys: 'usc akt urodzenia odpis' },
  { label: 'Wniosek o urlop rodzicielski', to: '/dokumenty', icon: 'edit_document', keys: 'wniosek urlop rodzicielski macierzyński ojcowski' },
  { label: 'Fundacje i organizacje pomocowe', to: '/trudne-sytuacje', icon: 'volunteer_activism', keys: 'fundacja poronienie wcześniak' },
  { label: 'Adopcja i rodzina zastępcza', to: '/kalkulator', icon: 'family_restroom', keys: 'adopcja przysposobienie zastępcza' },
];

function BottomNav() {
  const items = NAV.flatMap((g) => g.items).filter((i) => i.mobile);
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_-2px_rgba(69,46,53,0.05)] no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16 px-space-xs">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-colors ${isActive ? 'text-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <Icon name={it.mIcon || it.icon} className="text-[22px]" />
            <span className="font-caption text-caption tracking-tight mt-0.5">{it.mobile}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const SUGGESTED = ['Czy Piotr w JDG może wziąć 9 tyg. bez zawieszania firmy?', 'Co jeśli poród nastąpi 2 tygodnie przed terminem?', 'Jak obliczana jest podstawa zasiłku z 12 miesięcy?', 'Kto wypłaci mi zasiłek — pracodawca czy ZUS?'];

export function AskPanel() {
  const { aiOpen, setAiOpen } = useApp();
  const [msgs, setMsgs] = useState([{ from: 'otula', text: 'Cześć! Odpowiadam na pytania o zasiłki i urlopy na podstawie ustawy zasiłkowej i Kodeksu pracy. Każdą odpowiedź opatruję podstawą prawną.' }]);
  const [q, setQ] = useState('');
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  const ask = async (text) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: 'me', text }]);
    setQ('');
    const r = await api.ask(text);
    setMsgs((m) => [...m, { from: 'otula', text: r.answer, law: r.law }]);
  };
  if (!aiOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-inverse-surface/30 flex justify-end" onClick={(e) => e.target === e.currentTarget && setAiOpen(false)}>
      <div className="w-full sm:w-[420px] h-full bg-surface flex flex-col shadow-xl">
        <div className="p-space-md flex items-center justify-between bg-gradient-to-b from-surface-container-high to-surface">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center"><Icon name="temp_preferences_custom" className="text-[20px]" /></div>
            <div><span className="font-label-uppercase text-label-uppercase text-primary block">Wirtualny asystent</span><h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">Zapytaj Otulę <AIBadge>baza reguł</AIBadge></h3></div>
          </div>
          <button type="button" onClick={() => setAiOpen(false)} className="w-9 h-9 rounded-full bg-surface-container-high/80 flex items-center justify-center" aria-label="Zamknij"><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-md space-y-space-sm">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[88%] p-3 rounded-2xl text-body-sm ${m.from === 'me' ? 'ml-auto bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface'}`}>
              {m.text}
              {m.law && <div className="mt-2 text-[12px] font-bold text-tertiary flex items-center gap-1"><Icon name="gavel" className="text-[14px]" />{m.law}</div>}
            </div>
          ))}
          <div ref={end} />
        </div>
        <div className="p-space-md space-y-space-xs">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="text-left px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm text-[12px] hover:bg-surface-container">{s}</button>)}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 h-12 px-4 rounded-full bg-surface-container-lowest shadow-sm focus:outline-none" placeholder="Zadaj pytanie…" aria-label="Pytanie" />
            <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center" aria-label="Wyślij"><Icon name="send" /></button>
          </form>
          <p className="text-[12px] text-on-surface-variant">Asystent dopasowuje pytanie do bazy przepisów (bez wysyłania danych na zewnątrz). Nie zastępuje decyzji ZUS.</p>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [menu, setMenu] = useState(false);
  const { toast, setAiOpen } = useApp();
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);
  return (
    <>
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="lg:pl-72">
        <Header onMenu={() => setMenu(true)} />
        <main className="w-full pt-20 lg:pt-24 px-margin lg:px-space-lg pb-36 lg:pb-space-xl bg-surface min-h-screen print-pad">
          <div className="max-w-[1400px] mx-auto"><Outlet /></div>
          <footer className="max-w-[1400px] mx-auto mt-space-xl pt-space-md text-caption text-on-surface-variant flex flex-wrap gap-x-4 gap-y-1 justify-between no-print">
            <span>Otula — prototyp HackNation 2026 dla ZUS. Wyliczenia mają charakter informacyjny; prawo ustala płatnik lub ZUS w decyzji.</span>
            <span className="flex gap-3">
              <a className="hover:underline" href="https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski" target="_blank" rel="noreferrer">zus.pl</a>
              <a className="hover:underline" href="https://www.gov.pl/web/rodzina/urlop-rodzicielski" target="_blank" rel="noreferrer">gov.pl/rodzina</a>
              <a className="hover:underline" href="https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo" target="_blank" rel="noreferrer">PIP</a>
            </span>
          </footer>
        </main>
      </div>
      <BottomNav />
      <button type="button" onClick={() => setAiOpen(true)} aria-label="Zapytaj Otulę AI" className="md:hidden fixed bottom-24 right-margin z-40 flex items-center gap-2 pl-3.5 pr-4 h-12 rounded-full bg-primary-container text-on-primary shadow-[0_8px_24px_rgba(120,62,81,0.28)] active:scale-95 no-print">
        <Icon name="temp_preferences_custom" className="text-[20px] text-primary-fixed" /><span className="font-button-text text-button-text font-bold tracking-tight">Zapytaj Otulę AI</span>
      </button>
      <AskPanel />
      <MObywatelLogin />
      <div aria-live="polite" className={`fixed bottom-24 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[90] bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <Icon name={toast?.icon || 'check_circle'} className="text-tertiary-fixed text-[20px]" />
        <span className="font-body-sm text-body-sm">{toast?.msg}</span>
      </div>
    </>
  );
}
