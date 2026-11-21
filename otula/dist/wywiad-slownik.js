/* Pojęcia z pytań i wyników. Treść i adresy pochodzą ze stałego katalogu. */
(() => {
  'use strict';
  const sick = 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-chorobowy/z-ubezpieczenia-chorobowego/prawo-do-zasilku-i-okres-przyslugiwania';
  const amount = 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc';
  const terms = [
    ['chorobowe','Ubezpieczenie chorobowe',/voluntary|insuranceStart|^insurance |dobrowolne chorobowe/i,'Dzięki temu ubezpieczeniu możesz otrzymać pieniądze m.in. w czasie choroby lub opieki po narodzinach. Przy etacie jest zwykle obowiązkowe, a przy działalności trzeba się do niego zgłosić. Datę objęcia sprawdzisz w ZUS.','https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje'],
    ['adopcja','Przysposobienie',/adoptionCourt|przysposobieni/i,'To prawna nazwa adopcji. W sprawie o zasiłek ważne są zarówno data przyjęcia dziecka pod opiekę, jak i dokument dotyczący postępowania w sądzie.', 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty'],
    ['tytuly','Tytuł ubezpieczenia',/multipleTitles|tytuł.*ubezpiecze/i,'Chodzi o powód objęcia ubezpieczeniem, np. etat lub prowadzenie działalności. Możesz mieć kilka takich tytułów jednocześnie. Każdy trzeba sprawdzić osobno.', 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje'],
    ['zaZyciem', 'Za życiem', /za.?życiem|za.?zyciem|special|childrenClinical/i, 'To zaświadczenie od uprawnionego lekarza, np. specjalisty neonatologii, potwierdzające ciężką, nieodwracalną niepełnosprawność lub nieuleczalną chorobę zagrażającą życiu dziecka powstałą przed urodzeniem albo przy porodzie. Może dać rodzicom dłuższy rodzicielski. Wypis ze szpitala i orzeczenie o niepełnosprawności go nie zastępują.', 'https://www.gov.pl/web/zdrowie/jak-prawidlowo-wystawic-zaswiadczenie-lekarskie-osobom-uprawnionym-zgodnie-z-ustawa-za-zyciem-'],
    ['podstawa', 'Podstawa wymiaru', /base|podstaw[ęay]|wynagrodzeni|pensj/i, 'To kwota, od której płatnik oblicza zasiłek. Na etacie zwykle bierze pod uwagę wcześniejsze wynagrodzenie po odliczeniu składek społecznych. Gotową podstawę możesz uzyskać w kadrach.', 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru'],
    ['platnik', 'Płatnik składek', /payer|płatnik|pracodawc|zleceniodawc/i, 'To ten, kto rozlicza składki, np. pracodawca. Gdy zgłaszał do chorobowego ponad 20 osób, z reguły sam wypłaca zasiłki, a przy 20 lub mniej wypłaca je ZUS. Zwykle decyduje stan na 30 listopada poprzedniego roku.', 'https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf'],
    ['szpital', 'Urlop uzupełniający', /hospital|supplementary|szpital|uzupełniaj/i, 'Po pobycie dziecka w szpitalu rodzic może mieć dodatkowy płatny czas bezpośrednio po macierzyńskim. Liczą się ukończone tygodnie ciąży, masa przy urodzeniu i daty pobytu.', 'https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi3'],
    ['kodB', 'Kod B na e-ZLA', /sick|e-zla|zwolnieni[eu]|kod B/i, 'e-ZLA to elektroniczne zwolnienie od lekarza. Kod B oznacza, że niezdolność do pracy przypada w ciąży. Jeśli kodu brakuje, zapytaj lekarza o osobne zaświadczenie o ciąży.', sick],
    ['wyczekiwanie', 'Okres wyczekiwania', /waiting|wyczekiwani|pregnancySick/i, 'To czas ubezpieczenia potrzebny zwykle do chorobowego. Przy obowiązkowym chorobowym wynosi 30 dni, a przy dobrowolnym 90 dni. Poprzednie okresy i wyjątki mogą zmienić wynik.', sick],
    ['wakacje', 'Wakacje składkowe', /wakacje|debt|zadłuż|zaległoś|suspended/i, 'Przedsiębiorca spełniający warunki może wystąpić o pokrycie wybranych własnych składek za jeden miesiąc w roku. Działalność może dalej działać. Składkę zdrowotną nadal trzeba rozliczyć.', 'https://www.zus.pl/-/zwolnienie-z-op%C5%82acania-sk%C5%82adek-zus-wakacje-sk%C5%82adkowe'],
    ['podwyzszenie', 'Podwyższenie do 1000 zł', /lowBenefit|topup|podwyższen|1000/i, 'Gdy łączny macierzyński po potrąceniu podatku jest niższy niż poziom świadczenia rodzicielskiego, płatnik sprawdza, ile brakuje do tego poziomu. Dla pełnego miesiąca wynosi on 1000 zł. Przy części miesiąca uwzględnia się odpowiednią część tej kwoty.', amount],
    ['czesci', 'Część rodzicielskiego', /parental|rodzicielsk|urlopu w częściach/i, 'To okres urlopu lub odpowiadającego mu zasiłku objęty wnioskiem. Oboje rodzice korzystają łącznie z maksymalnie pięciu części. Jednoczesne wykorzystanie po jednej części przez każdego liczy się jako dwie.', 'https://www.gov.pl/web/rodzina/urlop-rodzicielski']
  ];
  function buttonFor(question) {
    const words = typeof question === 'string' ? question : [question?.id, question?.title, question?.help].join(' ');
    return terms.filter(([key,,pattern]) => words === key || pattern.test(words)).map(([key,title]) =>
      '<button type="button" class="otula-term" data-term="'+key+'" aria-label="Co to znaczy: '+title+'?" aria-haspopup="dialog"><span aria-hidden="true">?</span> '+title+'</button>').join(' ');
  }
  let dialog;
  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-term]');
    if (!opener) return;
    const entry = terms.find(row => row[0] === opener.dataset.term);
    if (!entry || dialog?.open) return;
    dialog = document.createElement('dialog');
    dialog.className = 'otula-definition';
    dialog.setAttribute('aria-labelledby','definition-title');
    dialog.innerHTML = '<h2 id="definition-title">'+entry[1]+'</h2><p>'+entry[3]+'</p><a class="text-button" href="'+entry[4]+'" rel="noopener noreferrer" target="_blank">Przeczytaj źródło urzędowe ↗</a><form method="dialog"><button class="button primary" autofocus>Zamknij</button></form>';
    document.body.append(dialog);
    dialog.addEventListener('close', () => { dialog.remove(); dialog = null; if (opener.isConnected) opener.focus(); }, {once:true});
    dialog.showModal();
  });
  window.addEventListener('hashchange', () => dialog?.close());
  window.OtulaSlownik = {buttonFor};
})();
