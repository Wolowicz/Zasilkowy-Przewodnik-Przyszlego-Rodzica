import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { Icon, IconBox, Chip } from './ui.jsx';

// Pierwszy ekran dla rodzica bez uzupełnionego profilu: 3 jasne kroki i krótkie karty o świadczeniach.
const BENEFITS = [
  { icon: 'pregnant_woman', tone: 'sky', title: 'W ciąży', text: 'Zwolnienie z kodem „B” = 100% podstawy, do 270 dni.', to: '/baza-wiedzy' },
  { icon: 'child_care', tone: 'peach', title: 'Zasiłek macierzyński', text: '20 tygodni (więcej przy wieloraczkach), 100% albo 81,5%.', to: '/baza-wiedzy' },
  { icon: 'groups', tone: 'sage', title: 'Urlop rodzicielski', text: '41 tygodni do podziału, w tym 9 tygodni dla każdego rodzica.', to: '/baza-wiedzy' },
  { icon: 'male', tone: 'lilac', title: 'Urlop ojcowski', text: '14 dni, 100% podstawy, do 12. miesiąca życia dziecka.', to: '/baza-wiedzy' },
  { icon: 'family_restroom', tone: 'gold', title: 'Adopcja i rodzina zastępcza', text: 'Zasiłek jak przy porodzie, liczony od przyjęcia dziecka.', to: '/kalkulator' },
  { icon: 'volunteer_activism', tone: 'rose', title: 'Trudne sytuacje', text: 'Strata dziecka, wcześniak, choroba — uprawnienia i pomoc.', to: '/trudne-sytuacje' },
];

export default function ParentWelcome() {
  const { setLoginOpen, demo, setDemo, notify } = useApp();
  const nav = useNavigate();
  return (
    <div className="flex flex-col gap-space-lg">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-highest p-space-lg md:p-space-xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary-fixed opacity-50 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <Chip tone="sage">Bezpłatny przewodnik</Chip>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary mt-3">Dzień dobry! Policzymy, co Ci przysługuje.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Odpowiedz na 7 prostych pytań (ok. 3 minuty). Otula wyliczy zasiłek, pokaże terminy i podpowie, gdzie złożyć dokumenty.</p>
          <div className="flex flex-col sm:flex-row gap-space-sm mt-space-lg">
            <button type="button" onClick={() => nav('/kreator')} className="px-space-lg py-3.5 rounded-full bg-primary-container text-on-primary font-button-text text-[16px] shadow-sm hover:bg-primary flex items-center justify-center gap-2"><Icon name="edit_note" />Uzupełnij moje dane</button>
            <button type="button" onClick={() => setLoginOpen(true)} className="px-space-lg py-3.5 rounded-full bg-surface-container-lowest text-primary font-button-text text-[16px] shadow-sm hover:bg-surface-container-low flex items-center justify-center gap-2"><Icon name="id_card" />Pobierz dane z mObywatela</button>
          </div>
          {!demo && <button type="button" onClick={() => { setDemo(true); notify('Wczytano przykładową rodzinę dla jury', 'science'); }} className="mt-space-md text-[14px] text-[#6B4F8F] font-bold flex items-center gap-1 hover:underline"><Icon name="science" className="text-[18px]" />Chcę tylko zobaczyć przykład (dane testowe)</button>}
        </div>
      </div>

      <section>
        <h2 className="font-headline-md text-headline-md text-primary mb-space-sm">Jak to działa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[
            ['1', 'edit_note', 'Uzupełnij dane', 'Forma zatrudnienia, zarobki, termin porodu. Gdy czegoś nie wiesz — pomiń, podpowiemy.', '/kreator'],
            ['2', 'calendar_month', 'Zobacz swój plan', 'Kwoty miesiąc po miesiącu, podział urlopu między rodziców i ważne terminy.', '/kalkulator'],
            ['3', 'task_alt', 'Załatw formalności', 'Lista dokumentów, gotowe wnioski i informacja, czy składasz je u pracodawcy, czy w ZUS.', '/dokumenty'],
          ].map(([n, ic, t, d, to]) => (
            <Link key={n} to={to} className="card p-space-lg flex gap-space-md hover:shadow-md transition-shadow">
              <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold shrink-0">{n}</span>
              <div><div className="flex items-center gap-1.5 font-headline-sm text-headline-sm text-primary"><Icon name={ic} className="text-[20px]" />{t}</div><p className="text-body-sm text-on-surface-variant mt-1">{d}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline-md text-headline-md text-primary mb-space-sm">Najważniejsze świadczenia w skrócie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {BENEFITS.map((b) => (
            <Link key={b.title} to={b.to} className="card p-space-md flex items-start gap-space-sm hover:shadow-md transition-shadow">
              <IconBox icon={b.icon} tone={b.tone} />
              <div className="flex-1"><b className="text-[16px] text-on-surface">{b.title}</b><p className="text-body-sm text-on-surface-variant mt-0.5">{b.text}</p></div>
              <Icon name="chevron_right" className="text-secondary mt-2" />
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-[24px] bg-[#F8EBC7]/60 p-space-md flex items-start gap-space-sm">
        <Icon name="alarm" className="text-[#80611F] text-[24px]" />
        <p className="text-body-md text-[#5d4414]"><b>Najważniejszy termin:</b> wniosek o pełny urlop macierzyński i rodzicielski złożony do <b>21 dni po porodzie</b> daje równy zasiłek 81,5% przez cały rok. Otula przypomni Ci o nim w planie.</p>
      </div>
    </div>
  );
}
