import { useState } from 'react';
import { useApp } from '../store.jsx';
import { Icon, Chip, IconBox, SectionHead, AIBadge } from '../components/ui.jsx';
import { KNOWLEDGE } from '../../shared/engine.js';

const TOPICS = [
  { icon: 'pregnant_woman', title: 'W ciąży', items: ['Zasiłek chorobowy (e-ZLA kod B) — 100% podstawy, do 270 dni.', 'Pracownica: pierwsze 33 dni w roku (14 dni po 50. r.ż.) — wynagrodzenie chorobowe od pracodawcy.', 'Świadczenie rehabilitacyjne po wyczerpaniu okresu zasiłkowego — w ciąży 100%.', 'Zasiłek w wysokości zasiłku macierzyńskiego — gdy umowę rozwiązano w ciąży z powodu upadłości/likwidacji pracodawcy.', 'Brak uprawnień: brak ubezpieczenia chorobowego (np. umowa o dzieło, koniec zlecenia).'] },
  { icon: 'child_care', title: 'Po porodzie', items: ['Macierzyński: 20/31/33/35/37 tygodni, 100% (81,5% przy wniosku w 21 dni).', 'Uzupełniający urlop macierzyński: do 8 lub 15 tygodni, 100%.', 'Rodzicielski: 41/43 tyg. (65/67 z „Za życiem”), 70% lub 81,5%; 9 tyg. dla każdego rodzica.', 'Ojcowski: 14 dni, 100%, do 12. miesiąca życia dziecka.', 'Minimum: zasiłek niższy niż 1000 zł podwyższa się do kwoty świadczenia rodzicielskiego.'] },
  { icon: 'warning', title: 'Ryzyka utraty lub obniżenia', items: ['Umowa lub działalność dla pozoru (art. 83 Kc) — decyzja o niepodleganiu ubezpieczeniu.', 'Podwyższenie podstawy w ciąży — ZUS może ustalić niższą podstawę.', 'Brak ubezpieczenia chorobowego w dniu porodu.', 'Zadłużenie JDG > 1% płacy minimalnej — wypłata po spłacie, przedawnienie po 6 miesiącach.', 'Brak wykorzystania rodzicielskiego w 1. roku życia — 70% zamiast 81,5%.'] },
];

const LINKS = [
  ['ZUS — zasiłek macierzyński', 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski'],
  ['ZUS — wzory formularzy (zasiłki)', 'https://www.zus.pl/wzory-formularzy/zasilki'],
  ['Ministerstwo Rodziny — urlop rodzicielski', 'https://www.gov.pl/web/rodzina/urlop-rodzicielski'],
  ['PIP — rodzicielstwo', 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo'],
  ['gov.pl — Rejestr Stanu Cywilnego', 'https://www.gov.pl/web/cyfryzacja/rejestr-stanu-cywilnego'],
];

export default function KnowledgePage() {
  const { setAiOpen } = useApp();
  const [q, setQ] = useState('');
  const list = KNOWLEDGE.filter((k) => !q || (k.a + k.k.join(' ')).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div><Chip tone="sky">Baza wiedzy</Chip><h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary mt-2">Uprawnienia w ciąży i rodzicielstwie</h1><p className="text-on-surface-variant">Zwięzłe zasady z ustawy zasiłkowej, Kodeksu pracy i poradnika ZUS 2026.</p></div>
        <button type="button" onClick={() => setAiOpen(true)} className="px-space-md py-2.5 rounded-full bg-secondary-fixed text-on-secondary-container font-bold flex items-center gap-2 self-start"><Icon name="temp_preferences_custom" />Zapytaj Otulę</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {TOPICS.map((t) => (
          <div key={t.title} className="card p-space-lg"><div className="flex items-center gap-space-xs mb-space-md"><IconBox icon={t.icon} tone="peach" /><h2 className="font-headline-sm text-headline-sm text-primary">{t.title}</h2></div>
            <ul className="space-y-2">{t.items.map((i) => <li key={i} className="flex gap-2 text-body-sm"><Icon name="check" className="text-tertiary text-[18px]" />{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="card p-space-lg">
        <SectionHead icon="quiz" tone="lilac" kicker="Najczęstsze pytania" title="Pytania i odpowiedzi" right={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtruj…" aria-label="Filtruj pytania" className="h-11 px-4 rounded-full bg-surface-container-low focus:outline-none" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          {list.map((k) => <details key={k.a} className="rounded-2xl bg-surface-container-low p-space-md group"><summary className="cursor-pointer font-bold text-primary list-none flex justify-between gap-2">{k.k[0].charAt(0).toUpperCase() + k.k[0].slice(1)} — {k.k.slice(1, 3).join(', ')}<Icon name="expand_more" className="group-open:rotate-180 transition-transform" /></summary><p className="text-body-sm mt-2">{k.a}</p><p className="text-[12px] text-tertiary font-bold mt-1">{k.law}</p></details>)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <div className="card p-space-lg">
          <SectionHead icon="link" tone="sky" kicker="Źródła oficjalne" title="Przekierowania" />
          <div className="grid gap-1.5">{LINKS.map(([l, u]) => <a key={u} href={u} target="_blank" rel="noreferrer" className="px-3 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex justify-between items-center text-body-sm font-medium">{l}<Icon name="open_in_new" className="text-[16px] text-secondary" /></a>)}</div>
        </div>
        <div className="card p-space-lg">
          <SectionHead icon="auto_awesome" tone="lilac" kicker="Przejrzystość" title="Gdzie Otula używa AI" />
          <ul className="space-y-space-sm text-body-sm">
            <li className="flex gap-2"><AIBadge>OCR</AIBadge><span><b>Audytor PDF</b> — rozpoznawanie tekstu ze skanów modelem sieci neuronowej Tesseract (LSTM, model polski), uruchamianym w przeglądarce.</span></li>
            <li className="flex gap-2"><Icon name="rule" className="text-primary text-[18px]" /><span><b>Kalkulator i weryfikacja uprawnień</b> — deterministyczny silnik reguł (bez AI), parametry w panelu administracyjnym.</span></li>
            <li className="flex gap-2"><Icon name="rule" className="text-primary text-[18px]" /><span><b>Asystent „Zapytaj Otulę”</b> — dopasowanie pytań do bazy wiedzy z podstawą prawną; z kluczem OpenRouter odpowiedź formułuje model AI wyłącznie na podstawie dopasowanych przepisów (bez klucza działa sama baza reguł).</span></li>
            <li className="flex gap-2"><AIBadge>proces</AIBadge><span>Kod i treści przygotowano przy wsparciu asystentów AI (Claude), z weryfikacją przepisów w materiałach ZUS.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
