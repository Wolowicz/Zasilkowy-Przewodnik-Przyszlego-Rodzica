import { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';
import { api } from '../api.js';
import { Icon, Chip, Btn, Field, inputCls, SectionHead } from '../components/ui.jsx';

export default function AdminPage() {
  const { setRules, notify } = useApp();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  useEffect(() => { api.rules().then((r) => { setData(r); setDraft(structuredClone(r.rules)); }); }, []);
  if (!draft) return <p>Ładowanie parametrów…</p>;
  const rate = (k) => (e) => setDraft({ ...draft, rates: { ...draft.rates, [k]: Number(e.target.value) } });
  const val = (k) => (e) => setDraft({ ...draft, [k]: Number(e.target.value) });
  const arr = (k, i) => (e) => { const a = [...draft[k]]; a[i] = Number(e.target.value); setDraft({ ...draft, [k]: a }); };
  const save = async () => {
    try {
      const r = await api.saveRules(draft);
      setData((d) => ({ ...d, ...r })); setRules(r.rules); notify('Zapisano parametry — kalkulator przeliczony');
    } catch (e) { notify(e.message, 'error'); }
  };
  const reset = async () => { const r = await api.resetRules(); setData((d) => ({ ...d, ...r })); setDraft(structuredClone(r.rules)); setRules(r.rules); notify('Przywrócono wartości ustawowe'); };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div><Chip tone="primary">Panel administracyjny</Chip><h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary mt-2">Parametry ustawowe</h1><p className="text-on-surface-variant max-w-3xl">Zmiany stawek i wymiarów (np. po nowelizacji) bez zmiany kodu. Zapis przez REST API <code className="text-[13px] bg-surface-container px-1 rounded">PUT /api/rules</code>, wersjonowanie i dziennik zmian.</p></div>
        <div className="flex gap-space-xs"><Btn kind="soft" icon="restart_alt" onClick={reset}>Przywróć ustawowe</Btn><Btn icon="save" onClick={save}>Zapisz i przelicz</Btn></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <div className="card p-space-lg">
          <SectionHead icon="percent" tone="peach" kicker="Art. 31 ustawy zasiłkowej" title="Stawki zasiłku (%)" />
          <div className="grid grid-cols-2 gap-space-sm">
            {[['maternity', 'Macierzyński'], ['parental', 'Rodzicielski'], ['combined', 'Wniosek w 21 dni'], ['reserved', '9 tyg. drugiego rodzica'], ['paternity', 'Ojcowski'], ['supplementary', 'Uzupełniający']].map(([k, l]) => <Field key={k} label={l} htmlFor={k}><input id={k} type="number" step="0.1" className={inputCls} value={draft.rates[k]} onChange={rate(k)} /></Field>)}
          </div>
        </div>
        <div className="card p-space-lg">
          <SectionHead icon="date_range" tone="sage" kicker="Kodeks pracy" title="Wymiary urlopów (tygodnie)" />
          <span className="text-[13px] font-bold">Macierzyński wg liczby dzieci (1–5+)</span>
          <div className="grid grid-cols-5 gap-2 mb-space-sm">{draft.maternityWeeks.map((v, i) => <input key={i} aria-label={`Dzieci ${i + 1}`} type="number" className={inputCls + ' !px-2 text-center'} value={v} onChange={arr('maternityWeeks', i)} />)}</div>
          <div className="grid grid-cols-2 gap-space-sm">
            <Field label="Rodzicielski: 1 dziecko" htmlFor="p1"><input id="p1" type="number" className={inputCls} value={draft.parentalWeeks[0]} onChange={arr('parentalWeeks', 0)} /></Field>
            <Field label="Rodzicielski: więcej dzieci" htmlFor="p2"><input id="p2" type="number" className={inputCls} value={draft.parentalWeeks[1]} onChange={arr('parentalWeeks', 1)} /></Field>
            <Field label="„Za życiem”: 1 dziecko" htmlFor="z1"><input id="z1" type="number" className={inputCls} value={draft.zaZyciemParentalWeeks[0]} onChange={arr('zaZyciemParentalWeeks', 0)} /></Field>
            <Field label="„Za życiem”: więcej dzieci" htmlFor="z2"><input id="z2" type="number" className={inputCls} value={draft.zaZyciemParentalWeeks[1]} onChange={arr('zaZyciemParentalWeeks', 1)} /></Field>
            <Field label="Nieprzenoszalne (każdy rodzic)" htmlFor="rw"><input id="rw" type="number" className={inputCls} value={draft.reservedWeeks} onChange={val('reservedWeeks')} /></Field>
            <Field label="Obowiązkowe dla matki" htmlFor="mm"><input id="mm" type="number" className={inputCls} value={draft.mandatoryMotherWeeks} onChange={val('mandatoryMotherWeeks')} /></Field>
          </div>
        </div>
        <div className="card p-space-lg">
          <SectionHead icon="payments" tone="gold" kicker="Kwoty 2026" title="Progi i kwoty" />
          <div className="grid grid-cols-2 gap-space-sm">
            {[['minWage', 'Płaca minimalna (zł)'], ['parentalBenefitMin', 'Świadczenie rodzicielskie (zł)'], ['employeeContributions', 'Składki pracownika (%)'], ['voluntaryMaxBase', 'Maks. podstawa dobrowolna (zł)'], ['debtThresholdPct', 'Próg zadłużenia (% płacy min.)'], ['payerThreshold', 'Płatnik wypłaca od (ubezp.)'], ['applicationDays', 'Termin wniosku 81,5% (dni)'], ['maxWorkFraction', 'Maks. etat przy łączeniu']].map(([k, l]) => <Field key={k} label={l} htmlFor={k}><input id={k} type="number" step="0.01" className={inputCls} value={draft[k]} onChange={val(k)} /></Field>)}
          </div>
        </div>
        <div className="card p-space-lg">
          <SectionHead icon="history" tone="sky" kicker={`Wersja: ${data.rules.version}`} title="Dziennik zmian" />
          {data.audit?.length ? <ul className="space-y-1.5 text-body-sm">{data.audit.map((a, i) => <li key={i} className="p-2 rounded-xl bg-surface-container-low"><b>{new Date(a.at).toLocaleString('pl-PL')}</b> • {a.by}<div className="text-[12px] text-on-surface-variant truncate">{typeof a.changes === 'string' ? a.changes : JSON.stringify(a.changes).slice(0, 140)}</div></li>)}</ul> : <p className="text-body-sm text-on-surface-variant">Brak zmian — obowiązują wartości ustawowe.</p>}
          <p className="text-[12px] text-on-surface-variant mt-space-md flex gap-1"><Icon name="info" className="text-[16px]" />W produkcji: logowanie administratora, zatwierdzanie zmian i data obowiązywania każdej wersji reguł.</p>
        </div>
      </div>
    </div>
  );
}
