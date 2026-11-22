import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { api } from '../api.js';
import { Icon, Chip, IconBox, Btn, Field, inputCls, SectionHead } from '../components/ui.jsx';
import { fmtDate, pln } from '../../shared/engine.js';

// Wnioski o urlopy (projekt Otuli wg rozporządzenia Dz.U. 2025 poz. 322) — wniosek o zasiłek: ZAM (zus.pl).
const FORMS = {
  urlop: { title: 'Wniosek o urlop macierzyński i rodzicielski w pełnym wymiarze', to: 'Pracodawca', icon: 'child_care', law: 'Art. 180, 182¹a, 182¹b Kp; art. 30a ustawy zasiłkowej', when: 'Nie później niż 21 dni po porodzie — wtedy zasiłek 81,5% za cały okres.', body: (d) => `Na podstawie art. 180 § 1 i art. 182¹b § 2 Kodeksu pracy wnoszę o udzielenie mi urlopu macierzyńskiego w wymiarze ${d.mat} tygodni od dnia ${fmtDate(d.from)} oraz bezpośrednio po nim urlopu rodzicielskiego w wymiarze ${d.par} tygodni. Jednocześnie, zgodnie z art. 30a ustawy zasiłkowej, wnoszę o wypłatę zasiłku macierzyńskiego w wysokości 81,5% podstawy wymiaru za cały ten okres.` },
  rodzicielski: { title: 'Wniosek o urlop rodzicielski (część)', to: 'Pracodawca', icon: 'groups', law: 'Art. 182¹b Kp', when: 'Min. 21 dni przed rozpoczęciem urlopu. Maks. 5 części do końca roku, w którym dziecko kończy 6 lat.', body: (d) => `Wnoszę o udzielenie mi urlopu rodzicielskiego w wymiarze ${d.par} tygodni w okresie od ${fmtDate(d.from)}. Jest to ${d.part}. część urlopu. Drugi rodzic dziecka: ${d.other}.` },
  ojcowski: { title: 'Wniosek o urlop ojcowski', to: 'Pracodawca ojca', icon: 'male', law: 'Art. 182³ Kp', when: 'Min. 7 dni przed rozpoczęciem; do ukończenia przez dziecko 12 miesięcy. Zasiłek — wniosek ZAM (od 24.10.2026 zastępuje ZAO).', body: (d) => `Na podstawie art. 182³ Kodeksu pracy wnoszę o udzielenie mi urlopu ojcowskiego w wymiarze ${d.days} dni w okresie od ${fmtDate(d.from)}. Dziecko urodziło się ${fmtDate(d.birth)}.` },
  przejecie: { title: 'Wniosek ojca o przejęcie części urlopu macierzyńskiego', to: 'Pracodawca ojca + rezygnacja matki u jej pracodawcy', icon: 'swap_horiz', law: 'Art. 180 § 5–6 Kp', when: 'Matka wykorzystuje min. 14 tygodni po porodzie; rezygnację składa min. 7 dni przed powrotem do pracy.', body: (d) => `Wnoszę o udzielenie mi pozostałej części urlopu macierzyńskiego w wymiarze ${d.mat} tygodni od dnia ${fmtDate(d.from)}, w związku z rezygnacją matki dziecka z tej części urlopu po wykorzystaniu 14 tygodni po porodzie.` },
  laczenie: { title: 'Wniosek o łączenie urlopu rodzicielskiego z pracą', to: 'Pracodawca', icon: 'work_history', law: 'Art. 182¹e Kp', when: 'Min. 21 dni przed podjęciem pracy. Wymiar nie wyższy niż 1/2 etatu.', body: (d) => `Wnoszę o umożliwienie mi wykonywania pracy w wymiarze ${d.fraction} etatu w okresie urlopu rodzicielskiego od ${fmtDate(d.from)} przez ${d.par} tygodni. Urlop rodzicielski ulegnie proporcjonalnemu wydłużeniu.` },
  uzupelniajacy: { title: 'Wniosek o uzupełniający urlop macierzyński', to: 'Pracodawca', icon: 'medical_services', law: 'Art. 180¹ Kp', when: 'Udzielany jednorazowo, bezpośrednio po urlopie macierzyńskim. Dołącz zaświadczenie ze szpitala.', body: (d) => `Wnoszę o udzielenie mi uzupełniającego urlopu macierzyńskiego w wymiarze ${d.sup} tygodni bezpośrednio po zakończeniu urlopu macierzyńskiego, w związku z hospitalizacją dziecka (zaświadczenie w załączeniu).` },
};

const OFFICIAL = [
  ['ZAM', 'Wniosek o zasiłek macierzyński (od 24.10.2026 obejmuje rodzicielski i ojcowski)', 'https://www.zus.pl/wzory-formularzy/zasilki/zasilek-macierzynski'],
  ['Z-3', 'Zaświadczenie płatnika składek (pracownik)', 'https://www.zus.pl/wzory-formularzy/zasilki'],
  ['Z-3a', 'Zaświadczenie płatnika (zleceniobiorca, inni)', 'https://www.zus.pl/wzory-formularzy/zasilki'],
  ['ZAS-53', 'Wniosek o zasiłek chorobowy (np. przedsiębiorczyni w ciąży)', 'https://www.zus.pl/wzory-formularzy/zasilki'],
  ['ZAS-12', 'Zaświadczenie płatnika na dalszy okres', 'https://www.zus.pl/wzory-formularzy/zasilki'],
  ['Z-12', 'Wniosek o zasiłek pogrzebowy', 'https://www.zus.pl/wzory-formularzy/swiadczenia'],
];

export default function DocumentsPage() {
  const { input, result, notify } = useApp();
  const [params] = useSearchParams();
  const [form, setForm] = useState(params.get('wniosek') && FORMS[params.get('wniosek')] ? params.get('wniosek') : 'urlop');
  const [apps, setApps] = useState([]);
  const w = result.weeks;
  const [d, setD] = useState({});
  useEffect(() => {
    setD({ name: 'Anna Kowalska', employer: 'TechNova Sp. z o.o.', from: input.birthDate, birth: input.birthDate, mat: form === 'przejecie' ? w.maxFatherMat : w.maternity, par: form === 'laczenie' ? input.work.weeks || 8 : w.motherParental, days: 14, part: 1, other: 'Piotr Kowalski', fraction: '1/2', sup: w.supplementary || 4 });
  }, [form, input.birthDate, w.maternity, w.motherParental, w.maxFatherMat, w.supplementary, input.work.weeks]);
  useEffect(() => { api.applications().then(setApps).catch(() => {}); }, []);
  const F = FORMS[form];
  const text = useMemo(() => (d.from ? F.body(d) : ''), [F, d]);
  const up = (k) => (e) => setD({ ...d, [k]: e.target.value });

  const send = async () => {
    const r = await api.submit({ type: F.title, recipient: F.to, data: d }).catch(() => null);
    if (r) setApps((a) => [r, ...a]);
    notify(r ? `${r.id}: przekazano do „${F.to}” (symulacja)` : 'Tryb offline — wydrukuj wniosek', 'send');
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Chip tone="gold">Dokumenty, terminy, sposób złożenia</Chip>
        <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary mt-2">Dokumenty i wnioski</h1>
        <p className="text-on-surface-variant max-w-3xl">Gdzie złożyć dokumenty zależy od płatnika: pracodawca zgłaszający ponad 20 ubezpieczonych ustala i wypłaca zasiłek sam; w pozostałych przypadkach — ZUS. Twój płatnik: <b className="text-primary">{result.payer.motherLabel}</b>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-5 card p-space-lg">
          <SectionHead icon="checklist" tone="sage" kicker="Twoja sytuacja" title="Lista dokumentów" />
          <ul className="space-y-space-sm">
            {result.documents.map((doc) => (
              <li key={doc.name} className="p-space-sm rounded-2xl bg-surface-container-low flex items-start gap-space-sm">
                <IconBox icon="description" tone={doc.required ? 'peach' : 'sky'} size="w-9 h-9" iconSize="text-[18px]" />
                <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><b className="text-[14px]">{doc.code}</b>{doc.required ? <Chip tone="gold" upper={false}>Wymagany</Chip> : <Chip tone="sky" upper={false}>Opcjonalny</Chip>}</div><p className="text-body-sm text-on-surface-variant">{doc.name}</p><p className="text-[12px] text-secondary font-bold mt-0.5">→ {doc.to}</p></div>
              </li>
            ))}
          </ul>
          <h3 className="font-headline-sm text-headline-sm text-primary mt-space-lg mb-space-sm">Terminy</h3>
          <ul className="space-y-1">
            {result.deadlines.map((x) => <li key={x.id} className="flex justify-between gap-2 text-body-sm py-1.5 border-b border-surface-container"><span>{x.title}</span><b className={x.critical ? 'text-[#91526C]' : ''}>{fmtDate(x.date)}</b></li>)}
          </ul>
          <h3 className="font-headline-sm text-headline-sm text-primary mt-space-lg mb-space-sm">Oficjalne wzory ZUS</h3>
          <div className="grid gap-1.5">
            {OFFICIAL.map(([c, n, href]) => <a key={c} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-body-sm"><span><b>{c}</b> — {n}</span><Icon name="open_in_new" className="text-[16px] text-secondary" /></a>)}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="card p-space-lg">
            <SectionHead icon="edit_document" tone="lilac" kicker="Generator (symulacja wysyłki)" title="Wnioski o urlopy" sub="Wypełnione danymi z kalkulatora. Wydrukuj albo prześlij do pracodawcy / ZUS." />
            <div className="flex flex-wrap gap-1.5 mb-space-md">
              {Object.entries(FORMS).map(([k, f]) => <button key={k} type="button" onClick={() => setForm(k)} className={`px-3 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1 ${form === k ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}><Icon name={f.icon} className="text-[16px]" />{f.title.replace('Wniosek o ', '').replace('Wniosek ojca o ', '')}</button>)}
            </div>
            <div className="p-space-sm rounded-2xl bg-[#F8EBC7]/60 text-[13px] text-[#5d4414] flex items-start gap-2 mb-space-md"><Icon name="schedule" className="text-[18px]" /><span><b>Kiedy:</b> {F.when}</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
              <Field label="Imię i nazwisko" htmlFor="n"><input id="n" className={inputCls} value={d.name || ''} onChange={up('name')} /></Field>
              <Field label="Pracodawca / płatnik" htmlFor="e"><input id="e" className={inputCls} value={d.employer || ''} onChange={up('employer')} /></Field>
              <Field label="Od dnia" htmlFor="f"><input id="f" type="date" className={inputCls} value={d.from || ''} onChange={up('from')} /></Field>
              {['urlop', 'przejecie'].includes(form) && <Field label="Tygodnie macierzyńskiego" htmlFor="m"><input id="m" type="number" className={inputCls} value={d.mat || ''} onChange={up('mat')} /></Field>}
              {['urlop', 'rodzicielski', 'laczenie'].includes(form) && <Field label="Tygodnie rodzicielskiego" htmlFor="p"><input id="p" type="number" className={inputCls} value={d.par || ''} onChange={up('par')} /></Field>}
              {form === 'ojcowski' && <Field label="Liczba dni (7 lub 14)" htmlFor="dd"><select id="dd" className={inputCls} value={d.days} onChange={up('days')}><option>14</option><option>7</option></select></Field>}
              {form === 'rodzicielski' && <Field label="Która część (1–5)" htmlFor="pt"><input id="pt" type="number" min="1" max="5" className={inputCls} value={d.part} onChange={up('part')} /></Field>}
              {form === 'laczenie' && <Field label="Wymiar pracy" htmlFor="fr"><select id="fr" className={inputCls} value={d.fraction} onChange={up('fraction')}><option>1/2</option><option>1/4</option><option>3/8</option></select></Field>}
              {form === 'uzupelniajacy' && <Field label="Tygodnie uzupełniającego" htmlFor="su"><input id="su" type="number" className={inputCls} value={d.sup} onChange={up('sup')} /></Field>}
            </div>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-space-lg text-body-sm leading-relaxed print:border-0">
              <div className="flex justify-between text-[12px] text-on-surface-variant mb-space-md"><span>{d.name}<br />{d.employer ? `Pracownik: ${d.employer}` : ''}</span><span>{new Date().toLocaleDateString('pl-PL')}</span></div>
              <p className="text-right font-bold mb-space-md">{F.to}</p>
              <h3 className="font-headline-sm text-center mb-space-md">{F.title}</h3>
              <p>{text}</p>
              <p className="mt-space-md text-[12px] text-on-surface-variant">Podstawa prawna: {F.law}. Wnioskowany zasiłek liczony od podstawy {pln(result.base)}.</p>
              <p className="mt-space-lg text-right">…………………………<br /><span className="text-[12px]">podpis (profil zaufany / mObywatel)</span></p>
            </div>
            <div className="flex flex-wrap justify-end gap-space-xs mt-space-md">
              <Btn kind="soft" icon="content_copy" onClick={() => { navigator.clipboard?.writeText(`${F.title}\n\n${text}`); notify('Skopiowano treść wniosku'); }}>Kopiuj</Btn>
              <Btn kind="soft" icon="print" onClick={() => window.print()}>Drukuj / PDF</Btn>
              <Btn icon="send" onClick={send}>Wyślij do: {F.to.split(' ')[0]}</Btn>
            </div>
          </div>

          <div className="card p-space-lg">
            <SectionHead icon="outbox" tone="sky" kicker="Rejestr wysyłek" title="Przekazane wnioski" />
            {apps.length ? (
              <ul className="space-y-1.5">{apps.map((a) => <li key={a.id} className="flex flex-wrap justify-between gap-2 p-space-sm rounded-xl bg-surface-container-low text-body-sm"><span><b>{a.id}</b> • {a.type}</span><span className="text-on-surface-variant">{a.recipient} • {new Date(a.at).toLocaleString('pl-PL')} • <span className="text-tertiary font-bold">{a.status}</span></span></li>)}</ul>
            ) : <p className="text-body-sm text-on-surface-variant">Brak wysłanych wniosków w tej sesji.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
