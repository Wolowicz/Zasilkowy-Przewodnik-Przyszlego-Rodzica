import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { Icon, Chip, IconBox, SectionHead } from '../components/ui.jsx';

const SITUATIONS = [
  { id: 'stillbirth', icon: 'heart_broken', tone: 'rose', tag: 'Kodeks pracy art. 180 § 4–5', title: 'Urodzenie martwego dziecka lub zgon dziecka', lead: 'Matce przysługuje czas na regenerację i pożegnanie dziecka — niezależnie od czasu trwania ciąży.',
    facts: [['Zasiłek macierzyński', '8 tygodni po porodzie, 100%'], ['Zgon po 8. tyg. życia', '7 dni od dnia zgonu']],
    steps: ['Szpital: karta martwego urodzenia (płeć ustalana także badaniem genetycznym).', 'USC: akt urodzenia z adnotacją o martwym urodzeniu.', 'Pracodawca / ZUS: wniosek o urlop i zasiłek macierzyński oraz Z-12 o zasiłek pogrzebowy.'],
    calc: { stillbirth: true, event: 'bio' } },
  { id: 'preterm', icon: 'child_care', tone: 'sky', tag: 'Kodeks pracy art. 180¹', title: 'Wcześniak lub hospitalizacja noworodka', lead: 'Czas walki o zdrowie dziecka w szpitalu nie odbiera czasu na budowanie więzi po powrocie do domu.',
    facts: [['Uzupełniający urlop', 'do 8 lub 15 tygodni'], ['Wysokość', '100% podstawy']],
    steps: ['Przed 28. tc lub ≤ 1000 g: tydzień za tydzień szpitala, do 15 tygodni.', '28–37 tc (> 1000 g) lub po 37 tc z hospitalizacją 5.–28. dzień: do 8 tygodni.', 'Bezpośrednio po macierzyńskim, jednorazowo; zaświadczenie ze szpitala.'],
    calc: { premature: 'preterm', hospitalWeeks: 6, event: 'bio', stillbirth: false } },
  { id: 'illness', icon: 'family_restroom', tone: 'sage', tag: 'Ustawa „Za życiem”', title: 'Ciężka choroba lub niepełnosprawność dziecka', lead: 'Rodzice dzieci z zaświadczeniem „Za życiem” mają dłuższy urlop rodzicielski i dodatkowe wsparcie.',
    facts: [['Urlop rodzicielski', '65 / 67 tygodni'], ['Jednorazowo z gminy', '4 000 zł']],
    steps: ['Zaświadczenie wystawia lekarz specjalista (art. 4 ust. 3 ustawy „Za życiem”).', 'Dołącz je do wniosku o urlop rodzicielski / ZAM.', 'Wniosek o 4 000 zł do gminy — do 12 miesięcy od urodzenia.'],
    calc: { zaZyciem: true, stillbirth: false } },
  { id: 'mother', icon: 'shield_with_heart', tone: 'peach', tag: 'Kodeks pracy art. 180 § 7–17', title: 'Hospitalizacja, choroba lub śmierć matki', lead: 'Ojciec lub inny członek najbliższej rodziny może przejąć opiekę i zasiłek wcześniej niż po 14 tygodniach.',
    facts: [['Przejęcie urlopu', 'przed upływem 14 tyg.'], ['Podstawa', 'orzeczenie / szpital / akt zgonu']],
    steps: ['Matka z orzeczeniem o niezdolności do samodzielnej egzystencji lub w szpitalu — ojciec przejmuje urlop na czas hospitalizacji.', 'Śmierć matki lub porzucenie dziecka — ojciec przejmuje pozostałą część urlopu.', 'Ochrona stosunku pracy obejmuje także ojca od dnia złożenia wniosku.'],
    calc: null },
];

const ORGS = [
  { name: 'Fundacja Koalicja dla Wcześniaka', tags: ['wczesniak'], icon: 'medical_services', tone: 'sky', desc: 'Wsparcie rodziców wcześniaków: poradniki, grupy wsparcia, informacje o opiece po wyjściu ze szpitala.', url: 'https://koalicjadlawczesniaka.pl' },
  { name: 'Stowarzyszenie Rodziców po Poronieniu', tags: ['strata'], icon: 'groups_3', tone: 'rose', desc: 'Społeczność rodziców po stracie dziecka w ciąży: grupy wsparcia, poradniki formalności (akt urodzenia, pochówek, zasiłek).', url: 'https://www.poronienie.pl' },
  { name: 'Fundacja Gajusz — hospicjum perinatalne', tags: ['choroba', 'strata'], icon: 'favorite', tone: 'peach', desc: 'Opieka nad rodzinami, które dowiadują się o nieuleczalnej chorobie dziecka w ciąży; wsparcie psychologiczne i w żałobie.', url: 'https://gajusz.org.pl' },
  { name: 'Warszawskie Hospicjum dla Dzieci', tags: ['choroba', 'strata'], icon: 'home_health', tone: 'sage', desc: 'Hospicjum perinatalne i domowe; pomoc rodzicom w planowaniu porodu i opieki nad nieuleczalnie chorym dzieckiem.', url: 'https://hospicjum.waw.pl' },
  { name: 'Fundacja Rodzić po Ludzku', tags: ['strata', 'wczesniak'], icon: 'pregnant_woman', tone: 'lilac', desc: 'Prawa pacjentek w okresie okołoporodowym, materiały o stracie ciąży i opiece okołoporodowej.', url: 'https://www.rodzicpoludzku.pl' },
  { name: 'Fundacja Hospicyjna', tags: ['strata'], icon: 'volunteer_activism', tone: 'gold', desc: 'Wsparcie w żałobie, w tym dla rodziców po śmierci dziecka; telefon wsparcia w żałobie.', url: 'https://fundacja-hospicyjna.pl' },
];
const PHONES = [
  ['116 123', 'Telefon zaufania dla dorosłych w kryzysie emocjonalnym'],
  ['800 70 2222', 'Centrum Wsparcia dla osób w stanie kryzysu psychicznego (całodobowo)'],
  ['22 560 16 00', 'Centrum Obsługi Telefonicznej ZUS'],
];

export default function HardPage() {
  const { setInput, notify } = useApp();
  const [filter, setFilter] = useState('all');
  return (
    <div className="flex flex-col gap-space-lg">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-space-lg lg:p-space-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row gap-space-lg md:items-center justify-between">
          <div className="max-w-3xl space-y-space-sm">
            <Chip tone="rose">Czuła opieka Otuli</Chip>
            <h1 className="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary">Prawa rodziców w trudnych sytuacjach</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Nie musisz przechodzić przez to sama ani sam. Poniżej uprawnienia, dokumenty i organizacje o charakterze wyłącznie charytatywnym, które pomagają bezpłatnie.</p>
          </div>
          <div className="card p-space-md min-w-[260px] space-y-1">
            <span className="flex items-center gap-1 text-secondary font-bold"><Icon name="support_agent" />Wsparcie telefoniczne</span>
            {PHONES.map(([n, d]) => <a key={n} href={`tel:${n.replace(/\s/g, '')}`} className="block hover:underline"><b className="text-primary text-[17px]">{n}</b><span className="block text-[12px] text-on-surface-variant">{d}</span></a>)}
          </div>
        </div>
      </div>

      <section>
        <SectionHead icon="gavel" tone="sage" kicker="Kompendium prawne" title="Sytuacje szczególne i przysługujące świadczenia" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {SITUATIONS.map((s) => (
            <div key={s.id} className="card p-space-lg flex flex-col justify-between gap-space-md">
              <div className="space-y-space-md">
                <div className="flex items-start justify-between gap-2"><IconBox icon={s.icon} tone={s.tone} size="w-12 h-12" /><Chip tone={s.tone} upper={false} dot={false}>{s.tag}</Chip></div>
                <div><h3 className="font-headline-md text-headline-md text-on-surface">{s.title}</h3><p className="text-body-sm text-on-surface-variant mt-1">{s.lead}</p></div>
                <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-space-md rounded-2xl">{s.facts.map(([k, v]) => <div key={k}><span className="text-[12px] text-on-surface-variant block">{k}</span><b className="text-primary text-[17px]">{v}</b></div>)}</div>
                <ol className="space-y-1.5">{s.steps.map((t, i) => <li key={i} className="flex gap-2 text-body-sm text-on-surface-variant"><span className="w-5 h-5 rounded-full bg-surface-container text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>{t}</li>)}</ol>
              </div>
              {s.calc ? <Link to="/kalkulator" onClick={() => { setInput(s.calc); notify('Ustawiono sytuację w kalkulatorze'); }} className="p-space-sm rounded-2xl bg-surface-container-low/70 flex items-center justify-between text-secondary font-bold text-body-sm hover:bg-surface-container">Policz w kalkulatorze<Icon name="arrow_forward" /></Link> : <Link to="/dokumenty?wniosek=przejecie" className="p-space-sm rounded-2xl bg-surface-container-low/70 flex items-center justify-between text-secondary font-bold text-body-sm hover:bg-surface-container">Wniosek o przejęcie urlopu<Icon name="arrow_forward" /></Link>}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low/70 rounded-[24px] p-space-lg lg:p-space-xl">
        <Chip tone="warning">Organizacje wyłącznie charytatywne</Chip>
        <h2 className="font-headline-lg text-headline-lg text-primary mt-2">Fundacje i stowarzyszenia wspierające rodziców</h2>
        <p className="text-on-surface-variant mb-space-md">Pomoc jest bezpłatna. Otula nie pośredniczy w kontakcie — linki prowadzą na strony organizacji.</p>
        <div className="flex flex-wrap gap-space-xs mb-space-lg">
          {[['all', 'Wszystkie'], ['strata', 'Strata dziecka i poronienie'], ['wczesniak', 'Wcześniaki'], ['choroba', 'Ciężka choroba dziecka']].map(([k, l]) => <button key={k} type="button" onClick={() => setFilter(k)} className={`px-space-md py-1.5 rounded-full font-button-text text-[14px] ${filter === k ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}`}>{l}</button>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {ORGS.filter((o) => filter === 'all' || o.tags.includes(filter)).map((o) => (
            <div key={o.name} className="card p-space-lg flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
              <div className="space-y-space-sm"><div className="flex items-center gap-space-sm"><IconBox icon={o.icon} tone={o.tone} size="w-12 h-12" /><h3 className="font-headline-sm text-headline-sm">{o.name}</h3></div><p className="text-body-sm text-on-surface-variant">{o.desc}</p></div>
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="self-start px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-[13px] flex items-center gap-1">{o.url.replace(/https?:\/\/(www\.)?/, '')}<Icon name="open_in_new" className="text-[14px]" /></a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
