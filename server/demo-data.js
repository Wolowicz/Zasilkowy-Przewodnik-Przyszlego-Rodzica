// Fikcyjne dane pokazowe — symulacja integracji z mObywatelem (Węzeł Krajowy), systemami ZUS i e-ZLA.
// Logowanie zawsze dotyczy JEDNEJ osoby. Dane drugiego rodzica są dostępne dopiero po jego zgodzie.

const PEOPLE = {
  anna: {
    id: 'anna',
    name: 'Anna Kowalska',
    firstName: 'Anna',
    role: 'mama',
    pesel: '940512*****',
    stage: '31. tydzień ciąży',
    dueDate: '2026-12-15',
    insurance: { title: '01 10 00', label: 'Umowa o pracę', since: '2021-03-15', sickness: 'obowiązkowe', active: true },
    payer: { name: 'TechNova Sp. z o.o.', nip: '5219983411', insuredCount: 38 },
    avgGross12m: 7450,
    employment: 'uop',
    debt: 0,
  },
  piotr: {
    id: 'piotr',
    name: 'Piotr Kowalski',
    firstName: 'Piotr',
    role: 'tata',
    pesel: '890312*****',
    insurance: { title: '05 10 00', label: 'Pozarolnicza działalność', since: '2019-02-10', sickness: 'dobrowolne', active: true },
    payer: { name: 'Piotr Kowalski (płatnik dla siebie)', nip: '7781234567', insuredCount: 1 },
    avgGross12m: 5200,
    employment: 'jdg',
    debt: 0,
  },
};

export const partnerOf = (who) => (who === 'piotr' ? 'anna' : 'piotr');

export function demoPerson(who = 'anna') {
  return { ...structuredClone(PEOPLE[who] || PEOPLE.anna), source: 'Symulacja: mObywatel (Węzeł Krajowy) + rejestry ZUS', syncedAt: new Date().toISOString() };
}

export function demoEzla(who = 'anna') {
  if (who === 'piotr') return [];
  return [
    { number: 'ZLA/2026/0912345', from: '2026-10-01', to: '2026-10-28', code: 'B', rate: '100%', doctor: 'lek. Ewa Nowak (ginekolog)', days: 28, payer: 'TechNova Sp. z o.o.' },
    { number: 'ZLA/2026/0954321', from: '2026-10-29', to: '2026-11-25', code: 'B', rate: '100%', doctor: 'lek. Ewa Nowak (ginekolog)', days: 28, payer: 'TechNova Sp. z o.o.' },
  ];
}

export function demoDebtCertificate(who = 'piotr') {
  const withDebt = who === 'case3';
  return {
    number: `ZUS/ZAS-W/${Math.floor(Math.random() * 90000 + 10000)}/2026`,
    who: withDebt ? 'Piotr K. (sprawa 3)' : 'Piotr Kowalski',
    nip: withDebt ? '5832210047' : '7781234567',
    asOf: new Date().toISOString().slice(0, 10),
    debt: withDebt ? 2418.5 : 0,
    breakdown: withDebt ? [{ fund: 'FUS (społeczne)', amount: 2101.2 }, { fund: 'Fundusz Pracy / FS', amount: 317.3 }] : [],
    threshold: 48.06,
    note: 'Zaświadczenie wygenerowane w trybie pokazowym. Próg wstrzymania wypłaty: 1% minimalnego wynagrodzenia (art. 2a ustawy zasiłkowej).',
  };
}
