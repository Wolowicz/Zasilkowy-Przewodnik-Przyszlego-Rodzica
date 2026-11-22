import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import { Icon } from './ui.jsx';

// Symulacja logowania przez mObywatel (Węzeł Krajowy). Loguje się zawsze jedna osoba.
// Dane drugiego rodzica są pobierane dopiero po jego osobnej zgodzie (EServicesPage).

const PERSONAS = [
  { id: 'anna', name: 'Anna Kowalska', desc: 'Mama • umowa o pracę • 31. tydzień ciąży', icon: 'face_3' },
  { id: 'piotr', name: 'Piotr Kowalski', desc: 'Tata • działalność gospodarcza (JDG)', icon: 'face_6' },
];
const CONSENTS = [
  { id: 'identity', label: 'Imię, nazwisko i PESEL', required: true },
  { id: 'insurance', label: 'Tytuł i okresy ubezpieczenia chorobowego (ZUS)', required: true },
  { id: 'payer', label: 'Dane płatnika składek i podstawa wymiaru', required: true },
  { id: 'ezla', label: 'Zaświadczenia lekarskie e-ZLA', required: false },
  { id: 'debt', label: 'Stan rozliczeń składek (zadłużenie)', required: false },
];
const SYNC = ['Weryfikacja tożsamości w Węźle Krajowym', 'Pobranie danych o ubezpieczeniu z ZUS', 'Pobranie danych płatnika i podstawy wymiaru', 'Pobranie zaświadczeń e-ZLA', 'Sprawdzenie stanu rozliczeń'];

function Qr({ seed }) {
  const cells = useMemo(() => {
    let x = seed;
    return Array.from({ length: 21 * 21 }, (_, i) => {
      const r = Math.floor(i / 21), c = i % 21;
      for (const [a, b] of [[0, 0], [0, 14], [14, 0]]) {
        if (r >= a && r < a + 7 && c >= b && c < b + 7) {
          const R = r - a, C = c - b;
          return R === 0 || R === 6 || C === 0 || C === 6 || (R >= 2 && R <= 4 && C >= 2 && C <= 4);
        }
      }
      x = (x * 1103515245 + 12345) % 2147483648;
      return x % 7 < 3;
    });
  }, [seed]);
  return (
    <div className="grid bg-white p-3 rounded-xl" style={{ gridTemplateColumns: 'repeat(21, 1fr)', width: 196, height: 196 }} aria-label="Kod QR logowania (symulacja)" role="img">
      {cells.map((on, i) => <span key={i} className={on ? 'bg-[#1a1a1a]' : ''} />)}
    </div>
  );
}

export default function MObywatelLogin() {
  const { loginOpen, setLoginOpen, login, notify } = useApp();
  const [step, setStep] = useState('method');
  const [who, setWho] = useState('anna');
  const [method, setMethod] = useState('mobywatel');
  const [consents, setConsents] = useState(CONSENTS.map((c) => c.id));
  const [time, setTime] = useState(120);
  const [seed, setSeed] = useState(7);
  const [code, setCode] = useState('482 913');
  const [sync, setSync] = useState(0);
  const person = PERSONAS.find((p) => p.id === who);

  useEffect(() => { if (loginOpen) { setStep('method'); setSync(0); } }, [loginOpen]);
  useEffect(() => {
    if (step !== 'qr') return;
    setTime(120);
    const t = setInterval(() => setTime((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, seed]);
  useEffect(() => {
    if (step !== 'sync') return;
    if (sync >= SYNC.length) {
      login(method, who, consents).then(() => { setStep('done'); });
      return;
    }
    const t = setTimeout(() => setSync((v) => v + 1), 550);
    return () => clearTimeout(t);
  }, [step, sync]);

  if (!loginOpen) return null;
  const close = () => setLoginOpen(false);
  const refresh = () => { setSeed((s) => s + 13); setCode(String(Math.floor(100000 + Math.random() * 899999)).replace(/(\d{3})(\d{3})/, '$1 $2')); };

  return (
    <div className="fixed inset-0 z-[95] bg-[#0b1f33]/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Logowanie przez mObywatel — symulacja" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="w-full sm:max-w-3xl max-h-[94vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-[24px] shadow-2xl text-[#1b1b1b]" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Pasek serwisu */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0052a5] flex items-center justify-center shrink-0"><Icon name="shield_person" className="text-white text-[22px]" /></div>
            <div className="min-w-0"><div className="font-bold text-[15px] leading-tight">Logowanie do serwisu otula+</div><div className="text-[12px] text-[#5c5c5c] leading-tight">przez Węzeł Krajowy • tryb pokazowy</div></div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline px-2 py-1 rounded-md bg-[#fff4d6] text-[#7a5a00] text-[12px] font-bold uppercase tracking-wide">Symulacja</span>
            <button type="button" onClick={close} className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] flex items-center justify-center" aria-label="Zamknij"><Icon name="close" /></button>
          </div>
        </div>
        <div className="h-1 flex"><span className="flex-1 bg-white" /><span className="flex-1 bg-[#dc143c]" /></div>

        {step === 'method' && (
          <div className="p-5 sm:p-7 space-y-6">
            <div>
              <h2 className="text-[22px] font-bold">Wybierz sposób logowania</h2>
              <p className="text-[14px] text-[#5c5c5c] mt-1">Otula otrzyma tylko dane, na które wyrazisz zgodę. Logujesz się zawsze jako jedna osoba — dane drugiego rodzica możesz dodać później za jego zgodą.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[['mobywatel', 'smartphone', 'Aplikacja mObywatel', 'Kod QR lub kod jednorazowy'], ['pz', 'verified_user', 'Profil zaufany', 'Login i hasło + SMS'], ['bank', 'account_balance', 'Bankowość elektroniczna', 'Logowanie w banku']].map(([id, ic, t, d]) => (
                <button key={id} type="button" onClick={() => setMethod(id)} className={`text-left p-4 rounded-2xl border-2 transition-colors ${method === id ? 'border-[#0052a5] bg-[#eef5fc]' : 'border-[#e3e3e3] hover:border-[#9db8d6]'}`}>
                  <Icon name={ic} className="text-[#0052a5] text-[28px]" />
                  <div className="font-bold text-[15px] mt-2">{t}</div>
                  <div className="text-[13px] text-[#5c5c5c]">{d}</div>
                </button>
              ))}
            </div>
            <div>
              <div className="text-[14px] font-bold mb-2">Kto się loguje? <span className="font-normal text-[#5c5c5c]">(konto testowe)</span></div>
              <div className="grid sm:grid-cols-2 gap-3">
                {PERSONAS.map((p) => (
                  <button key={p.id} type="button" onClick={() => setWho(p.id)} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left ${who === p.id ? 'border-[#0052a5] bg-[#eef5fc]' : 'border-[#e3e3e3] hover:border-[#9db8d6]'}`}>
                    <span className="w-10 h-10 rounded-full bg-[#dbe8f6] flex items-center justify-center shrink-0"><Icon name={p.icon} className="text-[#0052a5]" /></span>
                    <span><b className="block text-[15px]">{p.name}</b><span className="text-[13px] text-[#5c5c5c]">{p.desc}</span></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => { refresh(); setStep('qr'); }} className="px-6 py-3 rounded-full bg-[#0052a5] hover:bg-[#003f80] text-white font-bold flex items-center gap-2">Dalej<Icon name="arrow_forward" className="text-[18px]" /></button></div>
          </div>
        )}

        {step === 'qr' && (
          <div className="p-5 sm:p-7 grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <h2 className="text-[22px] font-bold">{method === 'mobywatel' ? 'Zeskanuj kod w aplikacji mObywatel' : method === 'pz' ? 'Potwierdź logowanie profilem zaufanym' : 'Potwierdź logowanie w banku'}</h2>
              <ol className="text-[14px] text-[#3d3d3d] space-y-1.5 list-decimal pl-5">
                <li>Otwórz aplikację mObywatel w telefonie.</li>
                <li>Wybierz <b>Kod QR → Zaloguj się</b> i zeskanuj kod albo wpisz kod jednorazowy.</li>
                <li>Sprawdź nazwę serwisu i potwierdź logowanie.</li>
              </ol>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2 rounded-2xl border border-[#e3e3e3]"><Qr seed={seed} /></div>
                <div className="text-center sm:text-left">
                  <div className="text-[12px] text-[#5c5c5c]">Kod jednorazowy</div>
                  <div className="text-[28px] font-bold tracking-[0.12em] tabular-nums whitespace-nowrap">{code}</div>
                  <div className={`text-[13px] font-bold ${time < 30 ? 'text-[#b3261e]' : 'text-[#5c5c5c]'}`}>Ważny jeszcze {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</div>
                  <button type="button" onClick={refresh} className="mt-1 text-[13px] text-[#0052a5] font-bold flex items-center gap-1 mx-auto sm:mx-0"><Icon name="refresh" className="text-[16px]" />Nowy kod</button>
                </div>
              </div>
              <button type="button" onClick={() => setStep('method')} className="text-[14px] text-[#0052a5] font-bold flex items-center gap-1"><Icon name="arrow_back" className="text-[18px]" />Zmień sposób logowania</button>
            </div>
            {/* Telefon */}
            <div className="mx-auto w-[250px] rounded-[38px] bg-[#1b1b1b] p-2.5 shadow-xl">
              <div className="rounded-[30px] bg-[#f4f7fb] overflow-hidden">
                <div className="h-6 flex items-center justify-between px-5 text-[11px] font-bold"><span>9:41</span><span className="w-16 h-4 rounded-full bg-[#1b1b1b]" /><span>5G</span></div>
                <div className="bg-[#0052a5] text-white px-4 py-3"><div className="text-[12px] opacity-80">mObywatel</div><div className="font-bold text-[15px]">Potwierdź logowanie</div></div>
                <div className="p-4 space-y-3 text-[13px]">
                  <div className="rounded-xl bg-white p-3 shadow-sm"><div className="text-[12px] text-[#5c5c5c]">Serwis</div><b>otula+ — przewodnik rodzica</b><div className="text-[12px] text-[#5c5c5c] mt-1">Kod: <b className="text-[#1b1b1b]">{code}</b></div></div>
                  <div className="rounded-xl bg-white p-3 shadow-sm flex items-center gap-2"><Icon name="person" className="text-[#0052a5]" /><span><b>{person.name}</b><br /><span className="text-[12px] text-[#5c5c5c]">PESEL {who === 'anna' ? '940512*****' : '890312*****'}</span></span></div>
                  <button type="button" onClick={() => setStep('consent')} className="w-full py-2.5 rounded-full bg-[#0052a5] text-white font-bold">Potwierdzam</button>
                  <button type="button" onClick={() => { setStep('method'); notify('Logowanie odrzucone w aplikacji', 'block'); }} className="w-full py-2 rounded-full border border-[#c9c9c9] font-bold">Odrzuć</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'consent' && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-full bg-[#e6f4ea] flex items-center justify-center"><Icon name="how_to_reg" className="text-[#1e7d3a]" /></span><div><div className="text-[13px] text-[#1e7d3a] font-bold">Tożsamość potwierdzona</div><h2 className="text-[20px] font-bold leading-tight">{person.name}, Otula prosi o dostęp do danych</h2></div></div>
            <div className="rounded-2xl border border-[#e3e3e3] divide-y divide-[#eeeeee]">
              {CONSENTS.map((c) => (
                <label key={c.id} className="flex items-center justify-between gap-3 p-3.5 cursor-pointer">
                  <span className="text-[14px]">{c.label}{c.required && <span className="ml-2 text-[12px] font-bold text-[#5c5c5c] uppercase">wymagane</span>}</span>
                  <input type="checkbox" className="w-5 h-5 accent-[#0052a5]" checked={consents.includes(c.id)} disabled={c.required} onChange={(e) => setConsents(e.target.checked ? [...consents, c.id] : consents.filter((x) => x !== c.id))} />
                </label>
              ))}
            </div>
            <p className="text-[13px] text-[#5c5c5c]">Dane są używane tylko do wyliczeń w tej sesji. Zgodę możesz wycofać, wylogowując się.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button type="button" onClick={close} className="px-5 py-3 rounded-full border border-[#c9c9c9] font-bold">Anuluj</button>
              <button type="button" onClick={() => { setSync(0); setStep('sync'); }} className="px-6 py-3 rounded-full bg-[#0052a5] hover:bg-[#003f80] text-white font-bold">Zgadzam się i pobieram dane</button>
            </div>
          </div>
        )}

        {(step === 'sync' || step === 'done') && (
          <div className="p-5 sm:p-7 space-y-5">
            <h2 className="text-[20px] font-bold">{step === 'done' ? 'Gotowe — dane pobrane' : 'Pobieranie danych z ZUS…'}</h2>
            <ul className="space-y-2.5">
              {SYNC.filter((_, i) => i < 3 || consents.includes(['ezla', 'debt'][i - 3])).map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-[15px]">
                  {i < sync || step === 'done' ? <Icon name="check_circle" fill className="text-[#1e7d3a]" /> : i === sync ? <span className="w-6 h-6 rounded-full border-[3px] border-[#0052a5] border-t-transparent animate-spin" /> : <span className="w-6 h-6 rounded-full border-2 border-[#d0d0d0]" />}
                  <span className={i <= sync || step === 'done' ? '' : 'text-[#8a8a8a]'}>{s}</span>
                </li>
              ))}
            </ul>
            {step === 'done' && (
              <>
                <div className="rounded-2xl bg-[#e6f4ea] p-4 text-[14px] text-[#174d26]">Zalogowano jako <b>{person.name}</b>. Twoje dane trafiły do kalkulatora. Dane drugiego rodzica możesz dodać w „Symulacjach e-Usług” — wymaga to jego zgody w jego aplikacji.</div>
                <div className="flex justify-end"><button type="button" onClick={() => { close(); notify(`Zalogowano: ${person.name} (mObywatel — symulacja)`); }} className="px-6 py-3 rounded-full bg-[#0052a5] text-white font-bold">Przejdź do Otuli</button></div>
              </>
            )}
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#eeeeee] text-[12px] text-[#7a7a7a]">Wersja pokazowa. To nie jest serwis login.gov.pl ani aplikacja mObywatel — żadne dane nie są przesyłane do systemów państwowych.</div>
      </div>
    </div>
  );
}
