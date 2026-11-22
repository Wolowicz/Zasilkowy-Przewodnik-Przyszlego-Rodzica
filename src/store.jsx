import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_INPUT, calculate, DEFAULT_RULES } from '../shared/engine.js';
import { api } from './api.js';

const Ctx = createContext(null);
const KEY = 'otula-profile-v1';

export const JURY_PRESET = {
  ...DEFAULT_INPUT,
  grossSalary: 7450,
  employerSize: 38,
  birthDate: '2026-12-15',
  fatherEmployment: 'jdg',
  fatherGrossSalary: 5200,
  fatherInsured: true,
  work: { fraction: 0.5, weeks: 8 },
};

// Pusty profil rodzica (tryb bez przykładowych danych): bez kwot i dat — rodzic uzupełnia je sam.
export const EMPTY_PROFILE = {
  ...DEFAULT_INPUT,
  grossSalary: '',
  employerSize: '',
  birthDate: '',
  fatherGrossSalary: '',
  fatherEmployment: 'uop',
  insuredDays: 400,
  work: { fraction: 0, weeks: 0 },
};

// Profil jest gotowy do wyliczeń, gdy znamy datę oraz podstawę (albo wiemy, że nie ma ubezpieczenia).
export const isProfileReady = (i) => !!i.birthDate && (i.employment === 'none' || Number(i.grossSalary) > 0 || Number(i.baseOverride) > 0);

const loadDemo = () => localStorage.getItem('otula-demo') !== 'off';
function load() {
  const base = loadDemo() ? JURY_PRESET : EMPTY_PROFILE;
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v ? { ...base, ...v, work: { ...base.work, ...(v.work || {}) } } : base;
  } catch {
    return base;
  }
}

export function AppProvider({ children }) {
  const [input, setInputRaw] = useState(load);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [result, setResult] = useState(() => calculate(load(), DEFAULT_RULES));
  const [theme, setTheme] = useState(() => localStorage.getItem('otula-theme') || 'otula');
  const [session, setSession] = useState(() => (() => { const v = JSON.parse(sessionStorage.getItem('otula-session') || 'null'); return v?.user ? v : null; })());
  const [toast, setToast] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [demo, setDemoRaw] = useState(loadDemo);
  const tRef = useRef();

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('otula-theme', theme); }, [theme]);
  useEffect(() => { api.rules().then((r) => setRules(r.rules)); }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(input)); }, [input]);
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => api.calculate(input).then((r) => alive && setResult(r)), 120);
    return () => { alive = false; clearTimeout(id); };
  }, [input, rules]);

  const setInput = useCallback((patch) => setInputRaw((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) })), []);
  const notify = useCallback((msg, icon = 'check_circle') => {
    setToast({ msg, icon });
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 2800);
  }, []);
  const [loginOpen, setLoginOpen] = useState(false);
  const saveSession = (s) => { setSession(s); if (s) sessionStorage.setItem('otula-session', JSON.stringify(s)); else sessionStorage.removeItem('otula-session'); };
  // Dane osoby z „ZUS” trafiają do odpowiedniej części kalkulatora (mama albo tata).
  const importPerson = useCallback((p) => {
    if (!p) return;
    if (p.role === 'mama') setInputRaw((i) => ({ ...i, employment: p.employment, grossSalary: p.avgGross12m, employerSize: p.payer.insuredCount, insuredDays: 1800, birthDate: p.dueDate || i.birthDate, debt: p.debt, baseOverride: null }));
    else setInputRaw((i) => ({ ...i, fatherInsured: true, fatherEmployment: p.employment, fatherGrossSalary: p.avgGross12m }));
  }, []);
  const login = useCallback(async (method = 'mobywatel', who = 'anna', consents = []) => {
    const s = await api.login(method, who, consents);
    saveSession(s);
    importPerson(s.user);
    return s;
  }, [importPerson]);
  const addPartner = useCallback(async () => {
    const r = await api.partnerConsent(session?.user?.id);
    const s = { ...session, partner: r.partner, partnerConsentAt: r.consentAt };
    saveSession(s);
    importPerson(r.partner);
    return s;
  }, [session, importPerson]);
  const logout = () => saveSession(null);
  // Przełącznik przykładowych danych dla jury: włączenie wczytuje rodzinę Kowalskich, wyłączenie czyści profil.
  const setDemo = useCallback((on) => {
    setDemoRaw(on);
    localStorage.setItem('otula-demo', on ? 'on' : 'off');
    setInputRaw(on ? JURY_PRESET : EMPTY_PROFILE);
    if (!on) saveSession(null);
  }, []);

  const value = useMemo(() => ({ input, setInput, result, rules, setRules, theme, setTheme, session, login, logout, addPartner, loginOpen, setLoginOpen, notify, toast, aiOpen, setAiOpen, demo, setDemo, ready: isProfileReady(input), resetInput: () => setInputRaw(demo ? JURY_PRESET : EMPTY_PROFILE) }), [input, setInput, result, rules, theme, session, login, addPartner, loginOpen, notify, toast, aiOpen, demo, setDemo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
