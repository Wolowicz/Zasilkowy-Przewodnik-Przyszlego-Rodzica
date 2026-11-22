import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { api } from '../api.js';
import { readPdf } from '../pdf.js';
import { Icon, Chip, AIBadge, Field, inputCls, Btn } from '../components/ui.jsx';
import { CASES } from '../../shared/cases.js';
import { pln } from '../../shared/engine.js';

const TONE = {
  ok: { dot: 'bg-tertiary', tag: 'text-tertiary', chip: 'bg-tertiary-fixed text-on-tertiary-fixed', icon: 'task_alt', box: 'bg-tertiary-fixed', ic: 'text-tertiary', badge: 'Brak ryzyka formalnego' },
  danger: { dot: 'bg-[#91526C]', tag: 'text-[#91526C]', chip: 'bg-[#F4E0E7] text-[#91526C]', icon: 'gpp_maybe', box: 'bg-[#F4E0E7]', ic: 'text-[#91526C]', badge: 'Ryzyko odmowy świadczenia' },
  warning: { dot: 'bg-[#80611F]', tag: 'text-[#80611F]', chip: 'bg-[#F8EBC7] text-[#80611F]', icon: 'pause_circle', box: 'bg-[#F8EBC7]', ic: 'text-[#80611F]', badge: 'Wypłata wstrzymana' },
  neutral: { dot: 'bg-primary-container', tag: 'text-primary-container', chip: 'bg-surface-container text-on-surface', icon: 'swap_horiz', box: 'bg-primary-fixed', ic: 'text-primary', badge: 'Świadczenie alternatywne' },
};

const empLabel = { uop: 'Umowa o pracę', zlecenie: 'Umowa zlecenia', jdg: 'Działalność (JDG)', none: 'Brak tytułu', liquidation: 'Po ustaniu zatrudnienia' };

function rowsFromCase(c) {
  const r = c.result;
  const f = c.focus === 'father';
  const seg = f ? r.segments.find((s) => s.kind.includes('ojcowski')) : r.segments[0];
  return [
    { icon: 'badge', label: 'Kod tytułu ubezpieczenia', ocr: c.fields.code, otula: r.entitled ? `${empLabel[c.input.employment]} — tytuł ważny` : 'Brak tytułu do zasiłku', zus: c.forceStatus === 'review' ? 'Postępowanie wyjaśniające' : r.entitled ? 'Ubezpieczenie aktywne' : 'Brak prawa (art. 29)', ok: r.entitled && c.forceStatus !== 'review' },
    { icon: 'payments', label: 'Podstawa wymiaru (12 m-cy)', ocr: c.input.grossSalary ? `${pln(c.input.grossSalary)} brutto` : '0,00 zł', otula: `${pln(f ? r.fatherBase : r.base)} (po 13,71%)`, zus: c.alternative ? `Ryzyko: ${pln(c.alternative.base)}` : 'Zgodna z RSA', ok: !c.alternative },
    { icon: 'hourglass_top', label: 'Termin wniosku (21 dni)', ocr: c.fields.filedDay ? `Złożono w ${c.fields.filedDay}. dniu` : '—', otula: c.input.variant === 'A' ? 'Stawka jednolita 81,5%' : 'Stawki 100% / 70%', zus: c.fields.filedDay && c.fields.filedDay <= 21 ? 'Termin zachowany' : c.fields.filedDay ? 'Po terminie — 100%/70%' : 'Nie dotyczy', ok: !c.fields.filedDay || c.fields.filedDay <= 21 || c.input.variant === 'B' },
    { icon: 'account_balance', label: 'Płatnik świadczenia', ocr: c.fields.employerSize ? `Płatnik (${c.fields.employerSize} os.)` : '—', otula: f ? r.payer.fatherLabel : r.payer.motherLabel, zus: r.payer.mother === 'employer' && !f ? 'Wypłaca płatnik składek' : 'Wypłaca ZUS', ok: true },
    { icon: 'calculate', label: 'Miesięczna kwota brutto', ocr: seg ? pln(seg.monthly) : '—', otula: r.status === 'denied' ? 'Świadczenie rodzicielskie 1000 zł' : r.status === 'blocked' ? '0 zł do spłaty długu' : seg ? pln(seg.monthly) : '—', zus: c.forceStatus === 'review' ? 'Wstrzymana do decyzji' : r.status === 'blocked' ? 'Blokada art. 2a' : r.entitled ? 'Zatwierdzono do wypłaty' : 'Odmowa', ok: r.entitled && r.status !== 'blocked' && c.forceStatus !== 'review', bold: true },
  ];
}

function rowsFromAnalysis(a) {
  const r = a.result;
  const s = r.segments[0];
  return [
    { icon: 'badge', label: 'Kod tytułu ubezpieczenia', ocr: a.code || empLabel[a.employment] || 'nie rozpoznano', otula: a.insured ? `${empLabel[a.employment]} — tytuł ważny` : 'Brak tytułu / odmowa', zus: a.decision === 'odmowa' ? 'Dokument wskazuje odmowę' : a.insured ? 'Ubezpieczenie potwierdzone' : 'Do weryfikacji', ok: a.insured },
    { icon: 'payments', label: 'Podstawa wymiaru', ocr: a.base ? pln(a.base) : 'nie odczytano', otula: a.base ? pln(r.base) : 'wpisz ręcznie poniżej', zus: a.base ? 'Przyjęta z dokumentu' : 'Brak danych', ok: !!a.base },
    { icon: 'percent', label: 'Stawka zasiłku', ocr: a.rate ? `${String(a.rate).replace('.', ',')}%` : 'brak w dokumencie', otula: r.input.variant === 'A' ? '81,5% (wniosek w 21 dni)' : '100% / 70%', zus: a.rate ? 'Zgodna z wariantem' : 'Przyjęto wariant B', ok: !!a.rate },
    { icon: 'account_balance_wallet', label: 'Zadłużenie składkowe', ocr: a.debt ? pln(a.debt) : 'brak informacji', otula: a.debt ? 'Wstrzymanie (art. 2a)' : 'Brak przeszkód', zus: a.debt ? 'Wypłata po spłacie' : '—', ok: !a.debt },
    { icon: 'calculate', label: 'Miesięczna kwota brutto', ocr: a.amounts.length ? a.amounts.slice(0, 3).map((x) => x.toLocaleString('pl-PL', { minimumFractionDigits: 2 })).join(' • ') : '—', otula: !a.base ? '— (najpierw podstawa)' : s ? pln(s.monthly) : '—', zus: !a.base ? 'Brak danych do wyliczenia' : r.entitled ? 'Wyliczenie Otuli' : 'Brak prawa', ok: r.entitled && !!a.base, bold: true },
  ];
}

export default function AuditorPage() {
  const { notify, setInput, demo } = useApp();
  const [active, setActive] = useState(demo ? 'case1' : null);
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(null);
  const [drag, setDrag] = useState(false);
  const [manualBase, setManualBase] = useState('');
  const [allPages, setAllPages] = useState(false);
  const fileRef = useRef();

  useEffect(() => { if (active) api.case(active).then(setData); }, [active]);
  useEffect(() => { if (!demo) setActive(null); }, [demo]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) return notify('Wybierz plik PDF', 'error');
    setActive(null);
    setAnalysis(null);
    setBusy({ msg: 'Otwieranie dokumentu…', p: 0.05 });
    try {
      const read = await readPdf(file, (p) => setBusy({ msg: p.stage === 'ocr' ? `OCR strony ${p.page}/${p.pages}…` : `Odczyt strony ${p.page}/${p.pages}…`, p: p.stage === 'ocr' ? (p.page - 1 + (p.progress || 0)) / p.pages : p.page / p.pages }), allPages ? 60 : 12);
      const a = await api.audit(read.text, file.name);
      setAnalysis({ ...a, method: read.method, pages: read.pages, ms: read.ms, size: file.size, fullText: read.text });
      notify(`Przeanalizowano ${file.name}`);
    } catch (e) {
      notify('Nie udało się odczytać PDF: ' + e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const applyManual = async () => {
    if (!analysis) return;
    const r = await api.calculate({ ...analysis.input, baseOverride: Number(manualBase) });
    setAnalysis({ ...analysis, base: Number(manualBase), result: r });
  };

  const c = active && data?.id === active ? data : null;
  const tone = c ? TONE[c.tone] : analysis ? TONE[analysis.result.status === 'denied' ? 'neutral' : analysis.result.status === 'blocked' ? 'warning' : analysis.insured ? 'ok' : 'danger'] : TONE.ok;
  const rows = c ? rowsFromCase(c) : analysis ? rowsFromAnalysis(analysis) : [];

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-xs">
            {demo && <Chip tone="warning" dot={false}>Tryb weryfikacji HackNation 2026</Chip>}
            <span className="px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-uppercase text-[12px] font-extrabold tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />OCR + silnik reguł ZUS</span>
          </div>
          <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight mt-1">Audytor spraw PDF i weryfikator świadczeń</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Wgraj wniosek lub dokument z zestawu ZUS (ZAM, Z-3, Z-3a, ZAS-53, decyzja) albo wybierz scenariusz. Otula sprawdzi tytuł ubezpieczenia, podstawę, termin 21 dni, płatnika i ryzyka (pozorność, zadłużenie).</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Btn kind="ghost" icon="download" onClick={() => window.print()}>Pobierz audyt w PDF</Btn>
          <Btn icon="send" onClick={async () => { await api.sendMessage({ subject: 'Weryfikacja sprawy', text: c ? c.headline : 'Weryfikacja dokumentu ' + analysis?.fileName }).catch(() => {}); notify('Zapytanie zarejestrowane w PUE/eZUS (symulacja)', 'done_all'); }}>Wyślij zapytanie przez PUE ZUS</Btn>
        </div>
      </div>

      {demo && (
      <div className="card p-space-md">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-space-xs mb-space-xs">
          <span className="flex items-center gap-space-xs font-label-uppercase text-label-uppercase text-secondary"><Icon name="folder_special" className="text-[20px]" />Scenariusze testowe (dane fikcyjne):</span>
          <span className="font-caption text-caption text-on-surface-variant">Kliknij, aby załadować wsad dokumentowy</span>
        </div>
        <div className="flex lg:grid lg:grid-cols-7 gap-space-xs overflow-x-auto no-scrollbar pb-1">
          {CASES.map((cs) => (
            <button key={cs.id} type="button" onClick={() => { setActive(cs.id); setAnalysis(null); }} className={`text-left p-space-sm rounded-DEFAULT transition-all flex flex-col justify-between h-28 min-w-[150px] ${active === cs.id ? 'bg-surface-container shadow-sm ring-2 ring-primary-container/30' : 'bg-surface-container-low hover:bg-surface-container'}`}>
              <div className="flex items-center justify-between w-full"><span className={`font-label-uppercase text-[12px] font-bold ${TONE[cs.tone].tag}`}>{cs.tag}</span><span className={`w-2.5 h-2.5 rounded-full ${TONE[cs.tone].dot}`} /></div>
              <div><div className="font-headline-sm text-[14px] leading-tight text-on-surface font-bold">{cs.person}</div><div className="text-[12px] text-on-surface-variant leading-snug mt-1">{cs.short}</div></div>
              <span className={`text-[11px] font-bold ${TONE[cs.tone].tag}`}>Status: {cs.statusShort}</span>
            </button>
          ))}
        </div>
      </div>

      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div role="button" tabIndex={0} onClick={() => fileRef.current.click()} onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            className={`card p-space-lg flex flex-col items-center justify-center text-center group cursor-pointer transition-all ${drag ? 'bg-surface-container ring-2 ring-primary-container' : ''}`}>
            <div className="w-16 h-16 rounded-DEFAULT bg-surface-container flex items-center justify-center mb-space-sm group-hover:scale-105 transition-transform"><Icon name="upload_file" className="text-[32px] text-primary" /></div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">Przeciągnij wniosek PDF <AIBadge>OCR</AIBadge></h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">Z-3, Z-3a, ZAM, ZAS-53, ZAS-12, decyzje ZUS. Skany odczytuje OCR w przeglądarce — plik nie jest nigdzie wysyłany.</p>
            <div className="mt-space-md flex flex-wrap gap-1.5 justify-center">{['PDF do 15 MB', 'Skan wielostronicowy', 'Warstwa tekstowa'].map((t) => <span key={t} className="px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[12px]">{t}</span>)}</div>
            <label className="mt-space-sm flex items-center gap-2 text-[13px] text-on-surface-variant" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={allPages} onChange={(e) => setAllPages(e.target.checked)} />Skany: czytaj wszystkie strony (wolniej, ok. 4 s/str.)</label>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {busy && (
              <div className="w-full mt-space-md">
                <div className="flex justify-between text-[12px] text-on-surface-variant mb-1"><span>{busy.msg}</span><span>{Math.round(busy.p * 100)}%</span></div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden"><div className="h-full bg-primary-container transition-all" style={{ width: `${busy.p * 100}%` }} /></div>
              </div>
            )}
          </div>

          <div className="card p-space-lg flex flex-col gap-space-sm flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-10 h-10 rounded-DEFAULT bg-secondary-fixed flex items-center justify-center shrink-0"><Icon name="picture_as_pdf" className="text-secondary text-[20px]" /></div>
                <div className="min-w-0"><div className="font-body-md-medium text-on-surface truncate">{c?.filename || analysis?.fileName || '—'}</div><div className="font-caption text-caption text-on-surface-variant">{c?.meta || (analysis ? `${analysis.pages} str. • ${analysis.method} • ${(analysis.size / 1024).toFixed(0)} KB` : 'Wybierz sprawę lub wgraj plik')}</div></div>
              </div>
              {(c || analysis) && <span className="px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-uppercase text-[11px] font-extrabold shrink-0">Odczytano</span>}
            </div>
            <div className="bg-surface-container-low rounded-DEFAULT p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center justify-between text-on-surface-variant text-[12px] font-mono"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-container" /> WARSTWA TEKSTOWA / OCR</span><span>{analysis ? `PEWNOŚĆ: ${Math.round(analysis.confidence * 100)}%` : 'DANE PRZYKŁADOWE'}</span></div>
              <div className="bg-surface-container-lowest p-space-sm rounded-DEFAULT font-mono text-[12px] leading-relaxed text-on-surface-variant shadow-inner max-h-56 overflow-y-auto whitespace-pre-wrap">
                {c && c.ocr.map(([k, t], i) => <p key={i} className={k === 'h' ? `${TONE[c.tone].tag} font-bold ${i ? 'mt-1' : ''}` : ''}>{t}</p>)}
                {analysis && (analysis.excerpt || '(pusty dokument)')}
              </div>
              <div className="flex items-center justify-between pt-1"><span className="font-caption text-caption text-on-surface-variant">{analysis ? `Rozpoznano: ${analysis.docTypes.join(', ') || 'typ nieokreślony'}` : c ? 'Rozpoznano 14 pól krytycznych' : ''}</span>
                {analysis && <span className="text-[12px] text-on-surface-variant">{analysis.ms} ms</span>}
              </div>
            </div>
            {analysis && (
              <div className="bg-surface-container-low rounded-DEFAULT p-space-sm space-y-space-xs">
                <span className="font-label-uppercase text-[12px] text-on-surface-variant">Wzmianki w dokumencie</span>
                <div className="flex flex-wrap gap-1">{analysis.categories.length ? analysis.categories.map((k) => <Chip key={k.id} tone="lilac" upper={false} dot={false}>{k.label}</Chip>) : <span className="text-[12px]">brak dopasowań</span>}</div>
                <Field label="Popraw podstawę wymiaru (zł)" htmlFor="mb" hint="OCR może się mylić — potwierdź dane z dokumentu.">
                  <div className="flex gap-2"><input id="mb" type="number" step="0.01" className={inputCls} value={manualBase} placeholder={analysis.base || 'np. 6428,60'} onChange={(e) => setManualBase(e.target.value)} /><Btn kind="soft" onClick={applyManual}>Przelicz</Btn></div>
                </Field>
                <details className="text-[13px]"><summary className="cursor-pointer text-secondary font-bold">Pokaż cały odczytany tekst ({analysis.fullText?.length || 0} znaków)</summary><pre id="ocr-full" className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap bg-surface-container-lowest p-2 rounded-xl text-[12px]">{analysis.fullText}</pre></details>
                <Btn kind="ghost" icon="calculate" className="w-full" onClick={() => { setInput({ ...analysis.result.input, motherParentalWeeks: null }); notify('Dane przeniesiono do kalkulatora'); }}>Przenieś do kalkulatora</Btn>
              </div>
            )}
            <div className="rounded-DEFAULT bg-surface-container-low p-space-sm flex items-center justify-between">
              <div className="flex items-center gap-space-xs"><Icon name="verified_user" className="text-tertiary text-[20px]" /><div className="flex flex-col"><span className="font-body-md-medium text-[13px]">Prywatność dokumentu</span><span className="text-[12px] text-on-surface-variant">PESEL maskowany: {analysis?.peselMasked || c?.ocr.find(([, t]) => t.includes('PESEL'))?.[1].match(/\d{6}\*+/)?.[0] || '—'}</span></div></div>
              <span className="font-label-uppercase text-[11px] text-tertiary bg-tertiary-fixed px-space-xs py-0.5 rounded-full">Lokalnie</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col gap-space-md">
          <div className="card p-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md">
              <div>
                <div className="flex items-center gap-space-xs"><span className={`w-2.5 h-2.5 rounded-full ${tone.dot}`} /><h2 className="font-headline-md text-headline-md text-on-surface">Raport zgodności świadczenia</h2></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Odczyt z dokumentu vs. wyliczenie silnika reguł Otuli vs. status wg przepisów.</p>
              </div>
              <div className={`px-space-md py-1.5 rounded-full font-label-uppercase text-[12px] font-extrabold tracking-wider flex items-center gap-2 self-start ${tone.chip}`}><span className={`w-2 h-2 rounded-full ${tone.dot}`} />{c ? c.verdict : analysis ? (analysis.insured ? 'Ubezpieczenie potwierdzone' : 'Brak ubezpieczenia / odmowa') : '—'}</div>
            </div>
            <div className="2xl:hidden space-y-space-sm">
              {rows.map((r) => (
                <div key={r.label} className="rounded-2xl bg-surface-container-low p-space-sm">
                  <div className="flex items-center justify-between gap-2 mb-1.5"><span className="flex items-center gap-2 font-bold text-[14px]"><Icon name={r.icon} className="text-[18px] text-on-surface-variant" />{r.label}</span><span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${r.ok ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-[#F4E0E7] text-[#91526C]'}`}>{r.ok ? 'Zgodne' : 'Uwaga'}</span></div>
                  <dl className="grid grid-cols-[96px_1fr] gap-x-2 gap-y-1 text-[13px]">
                    <dt className="text-on-surface-variant">Z dokumentu</dt><dd className="font-mono">{r.ocr}</dd>
                    <dt className="text-on-surface-variant">Otula</dt><dd className="font-mono font-bold text-primary">{r.otula}</dd>
                    <dt className="text-on-surface-variant">Status</dt><dd>{r.zus}</dd>
                  </dl>
                </div>
              ))}
              {!rows.length && <p className="text-center text-on-surface-variant py-4">Wybierz scenariusz albo wgraj dokument PDF.</p>}
            </div>
            <div className="hidden 2xl:block overflow-x-auto">
              <table className="w-full text-left font-body-md min-w-[680px]">
                <thead><tr className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-[12px] tracking-wider">{['Weryfikowany parametr', 'Dane z PDF (OCR)', 'Wyliczenie Otuli', 'Status ZUS', 'Zgodność'].map((h, i) => <th key={h} className={`py-space-sm px-space-md ${i === 0 ? 'rounded-l-DEFAULT' : ''} ${i === 4 ? 'rounded-r-DEFAULT text-right' : ''}`}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-space-sm px-space-md font-body-md-medium text-on-surface"><div className="flex items-center gap-2"><Icon name={r.icon} className="text-[18px] text-on-surface-variant" />{r.label}</div></td>
                      <td className={`py-space-sm px-space-md font-mono text-[13px] ${r.bold ? 'font-bold' : ''}`}>{r.ocr}</td>
                      <td className={`py-space-sm px-space-md font-mono text-[13px] ${r.bold ? 'font-bold text-primary' : ''}`}>{r.otula}</td>
                      <td className="py-space-sm px-space-md text-[13px]">{r.zus}</td>
                      <td className="py-space-sm px-space-md text-right"><span className={`px-space-sm py-0.5 rounded-full font-label-uppercase text-[11px] font-extrabold ${r.ok ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-[#F4E0E7] text-[#91526C]'}`}>{r.ok ? 'Zgodne' : 'Uwaga'}</span></td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={5} className="py-space-lg text-center text-on-surface-variant">Wybierz scenariusz albo wgraj dokument PDF.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {(c || analysis) && (
            <div className="card p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className={`w-12 h-12 rounded-DEFAULT flex items-center justify-center shrink-0 ${tone.box}`}><Icon name={c ? (c.tone === 'ok' && c.id === 'case4' ? 'child_care' : tone.icon) : tone.icon} className={`text-[26px] ${tone.ic}`} /></div>
                  <div>
                    <div className="flex items-center gap-space-xs"><span className={`w-2.5 h-2.5 rounded-full ${tone.dot}`} /><span className={`font-label-uppercase text-label-uppercase ${tone.tag}`}>{tone.badge}</span></div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">{c ? c.headline : !analysis.insured ? 'Brak prawa do zasiłku z ubezpieczenia chorobowego' : analysis.base ? 'Prawo do zasiłku — wyliczenie na podstawie dokumentu' : 'Ubezpieczenie rozpoznane — uzupełnij podstawę wymiaru'}</h3>
                  </div>
                </div>
                <span className="font-mono text-caption text-on-surface-variant bg-surface-container px-space-sm py-1 rounded-full">{c ? c.law : analysis.result.issues[0]?.law || 'Ustawa zasiłkowa'}</span>
              </div>
              <div className="bg-surface-container-low rounded-DEFAULT p-space-md">
                <p className="font-body-md text-body-md text-on-surface">{c ? c.explanation : [...analysis.result.issues.map((i) => i.text), ...analysis.result.notes.map((n) => n.text)].join(' ') || (!analysis.base ? 'W odczytanej części dokumentu nie znaleziono kwoty podstawy wymiaru. Wpisz ją z zaświadczenia Z-3 lub decyzji (pole „Popraw podstawę”), a Otula przeliczy zasiłek.' : null) || `Odczytana podstawa ${analysis.base ? pln(analysis.base) : '—'}. Wyliczony zasiłek: ${pln(analysis.result.segments[0]?.monthly)} miesięcznie przez ${analysis.result.weeks.motherMat + analysis.result.weeks.motherParental} tygodni.`}</p>
                {c?.alternative && <p className="mt-2 text-body-sm text-[#91526C]"><b>Scenariusz ryzyka:</b> przy podstawie ustalonej przez ZUS od płacy minimalnej zasiłek wyniósłby {pln(c.alternative.segments[0].monthly)} / mc zamiast {pln(c.result.segments[0].monthly)}.</p>}
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Ścieżka postępowania i zalecenia Otuli:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                  {(c ? c.steps : analysis.result.documents.slice(0, 3).map((d) => [d.code, `${d.name} → ${d.to}`])).map(([t, d], i) => (
                    <div key={t} className="bg-surface-container-low p-space-sm rounded-DEFAULT flex items-start gap-space-xs">
                      <span className="w-6 h-6 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold text-[12px] shrink-0">{i + 1}</span>
                      <div><div className="font-body-md-medium text-[13px] text-on-surface">{t}</div><div className="text-[12px] text-on-surface-variant mt-0.5">{d}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {[
              { k: 'Czas analizy', icon: 'bolt', v: analysis ? `${(analysis.ms / 1000).toFixed(2)} s` : '< 0,1 s', d: analysis ? analysis.method : 'Silnik reguł REST API', bar: 'bg-primary', w: 94, col: 'text-primary' },
              { k: 'Pewność odczytu', icon: 'verified', v: analysis ? `${Math.round(analysis.confidence * 100)}%` : '100%', d: analysis ? `${analysis.checks.filter((x) => x.ok).length}/4 pól krytycznych` : 'Dane scenariusza wprowadzone ręcznie', bar: 'bg-tertiary', w: analysis ? analysis.confidence * 100 : 100, col: 'text-tertiary' },
              { k: 'Ochrona budżetu rodziny', icon: 'shield', v: c ? pln(c.result.totalGross) : analysis?.base ? pln(analysis.result.totalGross) : '—', d: 'Suma świadczeń rodziny (brutto)', bar: 'bg-secondary-container', w: 100, col: 'text-on-surface' },
            ].map((m) => (
              <div key={m.k} className="card p-space-md flex flex-col justify-between">
                <div className="flex items-center justify-between"><span className="font-label-uppercase text-[12px] text-on-surface-variant">{m.k}</span><Icon name={m.icon} className="text-secondary text-[20px]" /></div>
                <div className="my-space-xs"><div className={`font-headline-lg text-headline-lg ${m.col}`}>{m.v}</div><div className="font-caption text-caption text-on-surface-variant">{m.d}</div></div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden"><div className={`${m.bar} h-full`} style={{ width: `${m.w}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
