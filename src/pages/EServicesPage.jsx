import { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';
import { api } from '../api.js';
import { Icon, Chip, IconBox, Btn, Field, inputCls, SectionHead, Modal } from '../components/ui.jsx';
import { pln, fmtDate } from '../../shared/engine.js';

export default function EServicesPage() {
  const { session, setLoginOpen, logout, notify, setInput, addPartner } = useApp();
  const [asking, setAsking] = useState(false);
  const [ezla, setEzla] = useState(null);
  const [debt, setDebt] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [usc, setUsc] = useState({ type: 'skrócony', child: '', date: '2026-12-15', place: 'Warszawa', delivery: 'elektronicznie' });
  const [uscDone, setUscDone] = useState(null);

  useEffect(() => { if (session) { api.ezla(session.user.id).then(setEzla); api.messages().then(setMsgs).catch(() => {}); } }, [session?.user?.id]);

  const askPartner = async () => {
    setAsking(true);
    await new Promise((r) => setTimeout(r, 1800)); // symulacja: powiadomienie i zgoda w aplikacji drugiego rodzica
    const r = await addPartner();
    setAsking(false);
    notify(`${r.partner.firstName} udostępnił(a) dane — dodano do kalkulatora`);
  };
  const partnerName = session ? (session.user.id === 'anna' ? 'Piotra' : 'Annę') : '';

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Chip tone="lilac">Integracje pokazowe — dane fikcyjne</Chip>
        <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary mt-2">Symulacje e-usług</h1>
        <p className="text-on-surface-variant max-w-3xl">Logowanie mObywatelem, pobranie danych o ubezpieczeniu z ZUS, zaświadczenie o zadłużeniu, podgląd e-ZLA, korespondencja przez PUE/eZUS i wniosek o odpis aktu urodzenia. Wszystkie połączenia są symulowane przez REST API Otuli.</p>
      </div>

      <div className="card p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <IconBox icon="id_card" tone="lilac" size="w-12 h-12" />
          <div><h2 className="font-headline-sm text-headline-sm text-primary">{session ? `Zalogowano: ${session.user.name}` : 'Logowanie przez mObywatel'}</h2><p className="text-body-sm text-on-surface-variant">{session ? `Jedna osoba na sesję • ${session.method === 'pz' ? 'profil zaufany' : session.method === 'bank' ? 'bankowość elektroniczna' : 'aplikacja mObywatel'} • ${session.user.source}` : 'Węzeł Krajowy — symulacja. Bez logowania możesz wpisać dane samodzielnie w kalkulatorze.'}</p></div>
        </div>
        {session ? <Btn kind="soft" icon="logout" onClick={logout}>Wyloguj</Btn> : <Btn icon="login" onClick={() => setLoginOpen(true)}>Zaloguj przez mObywatel</Btn>}
      </div>

      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="card p-space-lg">
            <SectionHead icon="verified" tone="sage" kicker="Dane z systemów ZUS" title="Ubezpieczenie i płatnicy" />
            {[[session.user, 'Zalogowana osoba'], [session.partner, 'Drugi rodzic — za zgodą']].filter(([p]) => p).map(([p, label]) => (
              <div key={p.id} className="p-space-md rounded-2xl bg-surface-container-low mb-space-sm">
                <div className="flex flex-wrap justify-between gap-2"><b className="text-primary">{p.name}</b><Chip tone={p === session.user ? 'sky' : 'sage'} upper={false} dot={false}>{label}</Chip></div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body-sm mt-2">
                  <dt className="text-on-surface-variant">PESEL</dt><dd>{p.pesel}</dd>
                  <dt className="text-on-surface-variant">Tytuł</dt><dd>{p.insurance.title} — {p.insurance.label}</dd>
                  <dt className="text-on-surface-variant">Chorobowe</dt><dd>{p.insurance.sickness}, od {fmtDate(p.insurance.since)}</dd>
                  <dt className="text-on-surface-variant">Płatnik</dt><dd>{p.payer.name} ({p.payer.insuredCount} ubezp.)</dd>
                  <dt className="text-on-surface-variant">{p.employment === 'jdg' ? 'Podstawa składek' : 'Śr. wynagrodzenie'}</dt><dd>{pln(p.avgGross12m)}</dd>
                </dl>
              </div>
            ))}
            {!session.partner && (
              <div className="p-space-md rounded-2xl border-2 border-dashed border-outline-variant">
                <b className="text-primary">Dane drugiego rodzica</b>
                <p className="text-body-sm text-on-surface-variant mt-1">Otula nie może pobrać cudzych danych z Twojego logowania. Wyślemy prośbę do aplikacji mObywatel drugiego rodzica — po jego zgodzie dane trafią do kalkulatora.</p>
                <Btn kind="ghost" icon={asking ? 'hourglass_top' : 'person_add'} className="mt-2" disabled={asking} onClick={askPartner}>{asking ? `Czekamy na zgodę… (powiadomienie wysłane)` : `Poproś ${partnerName} o udostępnienie danych`}</Btn>
              </div>
            )}
          </div>

          <div className="card p-space-lg">
            <SectionHead icon="medical_services" tone="sky" kicker="e-ZLA" title="Zaświadczenia lekarskie" />
            <div className="space-y-space-sm">
              {ezla && !ezla.length && <p className="text-body-sm text-on-surface-variant">Brak zaświadczeń e-ZLA dla zalogowanej osoby.</p>}
              {(ezla || []).map((z) => (
                <div key={z.number} className="p-space-sm rounded-2xl bg-surface-container-low flex justify-between gap-2 text-body-sm">
                  <div><b>{z.number}</b><div className="text-on-surface-variant">{fmtDate(z.from)} – {fmtDate(z.to)} • {z.doctor}</div></div>
                  <div className="text-right"><Chip tone="sky" upper={false}>Kod {z.code} • {z.rate}</Chip><div className="text-[12px] mt-1">{z.days} dni</div></div>
                </div>
              ))}
              <p className="text-[12px] text-on-surface-variant">Kod „B” = ciąża: zasiłek chorobowy 100% podstawy. Okres zasiłkowy do 270 dni; po nim — świadczenie rehabilitacyjne.</p>
            </div>
          </div>

          <div className="card p-space-lg">
            <SectionHead icon="account_balance_wallet" tone="gold" kicker="Na dzień powstania prawa" title="Zaświadczenie o zadłużeniu" />
            <div className="flex flex-wrap gap-2 mb-space-md">
              <Btn kind="soft" onClick={() => api.debt('piotr').then(setDebt)}>Piotr Kowalski (JDG)</Btn>
              <Btn kind="soft" onClick={() => api.debt('case3').then(setDebt)}>Piotr K. — sprawa 3</Btn>
            </div>
            {debt && (
              <div className={`p-space-md rounded-2xl ${debt.debt > debt.threshold ? 'bg-[#F8EBC7]/70' : 'bg-[#E6EEDC]'}`}>
                <div className="flex justify-between"><b>{debt.number}</b><span className="text-[12px]">stan na {fmtDate(debt.asOf)}</span></div>
                <p className="text-body-sm mt-1">{debt.who} • NIP {debt.nip}</p>
                <p className="font-headline-md text-headline-md mt-2">{pln(debt.debt)}</p>
                {debt.breakdown.map((b) => <div key={b.fund} className="flex justify-between text-body-sm"><span>{b.fund}</span><span>{pln(b.amount)}</span></div>)}
                <p className="text-[12px] mt-2">{debt.debt > debt.threshold ? `Przekroczony próg ${pln(debt.threshold)} — zasiłek zostanie wypłacony po spłacie całości (art. 2a). Termin: 6 miesięcy.` : 'Brak zadłużenia — brak przeszkód w wypłacie.'}</p>
                {debt.debt > 0 && <Btn kind="ghost" className="mt-2" onClick={() => { setInput({ employment: 'jdg', debt: debt.debt, voluntarySickness: true }); notify('Zadłużenie uwzględnione w kalkulatorze'); }}>Uwzględnij w kalkulatorze</Btn>}
              </div>
            )}
          </div>

          <div className="card p-space-lg">
            <SectionHead icon="forum" tone="peach" kicker="PUE / eZUS" title="Zapytaj ZUS" />
            <form className="flex gap-2 mb-space-md" onSubmit={async (e) => { e.preventDefault(); if (!q.trim()) return; const m = await api.sendMessage({ subject: 'Pytanie o zasiłek', text: q }); setMsgs((x) => [m, ...x]); setQ(''); }}>
              <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Np. Kto wypłaci zasiłek, jeśli firma ma 15 osób?" aria-label="Wiadomość" />
              <Btn icon="send" type="submit">Wyślij</Btn>
            </form>
            <div className="space-y-space-sm max-h-80 overflow-y-auto">
              {msgs.map((m) => (
                <div key={m.id} className="rounded-2xl bg-surface-container-low p-space-sm text-body-sm">
                  <b>Ty:</b> {m.text}
                  <div className="mt-2 p-2 rounded-xl bg-surface-container-lowest"><b className="text-tertiary">{m.reply.from}:</b> {m.reply.text}{m.reply.law && <div className="text-[12px] text-on-surface-variant mt-1">{m.reply.law}</div>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div id="usc" className="card p-space-lg scroll-mt-24">
        <SectionHead icon="badge" tone="sky" kicker="Rejestr Stanu Cywilnego (symulacja)" title="Wniosek o odpis aktu urodzenia" sub="Na wzór e-usługi gov.pl. Zgłoszenie urodzenia: 21 dni od sporządzenia karty urodzenia." right={<a href="https://www.gov.pl/web/cyfryzacja/rejestr-stanu-cywilnego" target="_blank" rel="noreferrer" className="text-secondary font-bold text-body-sm flex items-center gap-1">gov.pl <Icon name="open_in_new" className="text-[16px]" /></a>} />
        {uscDone ? (
          <div className="p-space-md rounded-2xl bg-[#E6EEDC] flex items-center gap-space-sm"><Icon name="task_alt" className="text-[#4C6944] text-[28px]" /><div><b>Wniosek {uscDone.id} przyjęty</b><p className="text-body-sm">Odpis {usc.type} zostanie doręczony {usc.delivery === 'elektronicznie' ? 'na skrzynkę mObywatel/ePUAP' : 'pocztą'}. ZUS pobiera dane o urodzeniu z rejestru PESEL — dołączanie odpisu do ZAM zwykle nie jest konieczne.</p></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm items-end">
            <Field label="Rodzaj odpisu" htmlFor="ut"><select id="ut" className={inputCls} value={usc.type} onChange={(e) => setUsc({ ...usc, type: e.target.value })}><option>skrócony</option><option>zupełny</option><option>wielojęzyczny</option></select></Field>
            <Field label="Imię dziecka" htmlFor="uc"><input id="uc" className={inputCls} value={usc.child} onChange={(e) => setUsc({ ...usc, child: e.target.value })} placeholder="np. Zosia" /></Field>
            <Field label="Data urodzenia" htmlFor="ud"><input id="ud" type="date" className={inputCls} value={usc.date} onChange={(e) => setUsc({ ...usc, date: e.target.value })} /></Field>
            <Field label="Doręczenie" htmlFor="ul"><select id="ul" className={inputCls} value={usc.delivery} onChange={(e) => setUsc({ ...usc, delivery: e.target.value })}><option>elektronicznie</option><option>pocztą</option></select></Field>
            <Btn icon="send" onClick={async () => { const r = await api.submit({ type: `Odpis ${usc.type} aktu urodzenia`, recipient: 'USC', data: usc }).catch(() => ({ id: 'USC/offline' })); setUscDone(r); }}>Złóż wniosek</Btn>
          </div>
        )}
      </div>

    </div>
  );
}
