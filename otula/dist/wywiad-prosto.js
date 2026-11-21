'use strict';
/* Prosty język dla pytań wywiadu. Nie zmienia reguł (wywiad-reguly.js) — tylko to, jak pytanie
   jest zadane i wyjaśnione. Każdy wpis:
   t  – pytanie zwykłym językiem,  h – jedno zdanie podpowiedzi,
   co – co to znaczy (pokazywane po „Nie wiem” i w „Dlaczego pytamy?”),
   gdzie – gdzie to sprawdzić lub kogo zapytać,  nie – co się stanie, jeśli teraz pominiesz. */
(function (root) {
  const KADRY = 'Zapytaj w kadrach lub księgowości swojej firmy albo sprawdź w eZUS (zus.pl → eZUS → „Dane z konta ubezpieczonego”).';
  const P = {
    role: { t: 'Dla kogo sprawdzamy wsparcie?', h: 'Mama i tata mają częściowo inne prawa, dlatego pytamy na początku.' },
    behalf: { t: 'Komu pomagasz?', h: 'Odpowiadaj tak, jakby pytania dotyczyły tej osoby.' },
    event: { t: 'Co teraz dzieje się w Waszej rodzinie?', h: 'Wybierz to, co najlepiej opisuje Waszą sytuację dziś.' },
    work: {
      t: 'Jak pracujesz?', h: 'Od formy pracy zależy, kto wypłaca pieniądze i jakie dokumenty są potrzebne.',
      co: 'Umowa o pracę = jesteś pracownikiem. Umowa zlecenie = zleceniobiorca. Własna firma = działalność gospodarcza.',
      gdzie: 'Spójrz na umowę, którą podpisałaś/podpisałeś, albo zapytaj w firmie.',
      nie: 'Bez tej informacji pokażemy ogólne zasady i nie wskażemy, kto przygotowuje dokumenty.'
    },
    insurance: {
      t: 'Czy masz ubezpieczenie chorobowe?',
      h: 'To ono daje prawo do zasiłku macierzyńskiego i chorobowego. To coś innego niż ubezpieczenie zdrowotne (NFZ, lekarz).',
      co: 'Ubezpieczenie chorobowe to część składek ZUS. Przy umowie o pracę masz je zawsze, automatycznie. Przy umowie zlecenie i własnej firmie jest dobrowolne: trzeba się do niego zgłosić i płacić składkę. Bez niego w dniu porodu ZUS odmawia zasiłku macierzyńskiego.',
      gdzie: KADRY + ' Przy własnej firmie: w eZUS lub u księgowej („czy płacę dobrowolne chorobowe?”).',
      nie: 'Pokażemy świadczenia warunkowo i dopiszemy to do listy „Do sprawdzenia”.'
    },
    coverageVerified: {
      t: 'Czy ktoś potwierdził Ci, że masz ubezpieczenie chorobowe?',
      h: 'Wystarczy potwierdzenie od kadr, księgowej albo wpis w eZUS.',
      co: 'Samo przekonanie „chyba mam” nie wystarcza — czasem ktoś zapomniał zgłosić chorobowe albo zgłosił je później. Najczęstsza przyczyna odmów w sprawach ZUS to brak chorobowego w dniu porodu.',
      gdzie: KADRY,
      nie: 'Nic się nie zablokuje — przypomnimy, żeby to sprawdzić przed złożeniem wniosku.'
    },
    voluntaryRegistered: {
      t: 'Czy zgłosiłaś/zgłosiłeś się do dobrowolnego chorobowego?',
      h: 'Przy zleceniu i własnej firmie chorobowe nie jest automatyczne.',
      co: 'Przy umowie zlecenie zgłasza Cię zleceniodawca, ale tylko jeśli o to poprosisz. Przy własnej firmie zgłaszasz się sama/sam (druk ZUS ZUA) i płacisz składkę co miesiąc. Prawo do zasiłku pojawia się zwykle po 90 dniach takiego ubezpieczenia.',
      gdzie: 'Zleceniodawca albo księgowa; w eZUS w danych o ubezpieczeniach widać kod „chorobowe”.',
      nie: 'Oznaczymy, że prawo do zasiłku zależy od tego zgłoszenia.'
    },
    insuranceStart: { t: 'Od kiedy masz ubezpieczenie chorobowe?', h: 'Data z eZUS albo od kadr. Liczy się, czy minęło 30 dni (umowa o pracę) lub 90 dni (zlecenie, firma).', gdzie: KADRY },
    insuranceDispute: {
      t: 'Czy dostałaś/dostałeś pismo z ZUS, że nie masz ubezpieczenia albo że zasiłku nie dostaniesz?',
      h: 'Jeśli takiego pisma nie było — wybierz „Nie”. Większość osób odpowiada „Nie”.',
      co: 'Czasem ZUS sprawdza umowę (np. gdy zatrudnienie zaczęło się tuż przed ciążą) i wydaje decyzję, że ktoś nie podlega ubezpieczeniu, albo odmawia zasiłku. Takie pismo nazywa się „decyzja” i ma pouczenie o odwołaniu.',
      gdzie: 'Sprawdź pocztę tradycyjną i skrzynkę w eZUS (zakładka „Korespondencja”).',
      nie: 'Przyjmiemy, że takiego pisma nie było, i pokażemy zwykłą ścieżkę.'
    },
    nonCoverageDecision: { t: 'Czy to pismo mówi, że nie podlegasz ubezpieczeniu?', h: 'Szukaj słów „niepodleganie ubezpieczeniom” w treści decyzji.', co: 'To inna decyzja niż odmowa zasiłku: dotyczy samego ubezpieczenia. Od niej też można się odwołać — termin jest w pouczeniu na końcu pisma.' },
    decisionStage: { t: 'Co się teraz dzieje ze sprawą w ZUS?', h: 'Na przykład: czekasz, ZUS prosi o dokumenty, przyszła decyzja albo złożono odwołanie.' },
    decisionReceived: { t: 'Kiedy odebrałaś/odebrałeś to pismo?', h: 'Od tej daty liczy się termin odwołania lub uzupełnienia.' },
    debt: {
      t: 'Czy masz zaległości w składkach ZUS?',
      h: 'Dotyczy głównie osób z własną firmą.',
      co: 'Jeśli w dniu, od którego należy Ci się zasiłek, masz nieopłacone składki (powyżej niewielkiego progu), ZUS nie wypłaci zasiłku, dopóki ich nie spłacisz. Raty to jeszcze nie spłata.',
      gdzie: 'W eZUS: „Stan rozliczeń” albo u księgowej. Możesz też pobrać zaświadczenie o niezaleganiu.',
      nie: 'Przypomnimy, żeby to sprawdzić — to częsta przyczyna wstrzymania wypłaty.'
    },
    debtResolved: { t: 'Czy po spłacie ZUS potwierdził Ci prawo do zasiłku?', h: 'Na przykład nowym pismem lub wypłatą.' },
    debtAmount: { t: 'Ile wynosiła zaległość?', h: 'Kwota z eZUS lub od księgowej. Jeśli nie wiesz — pomiń.' },
    debtPaidDate: { t: 'Kiedy spłaciłaś/spłaciłeś całą zaległość?', h: 'Data ostatniej wpłaty, po której nic nie zostało do zapłaty.' },
    payerSize: {
      t: 'Kto wypłaci Ci zasiłek: pracodawca czy ZUS?',
      h: 'Duże firmy (ponad 20 osób) wypłacają zasiłek same. Mniejsze przekazują sprawę do ZUS.',
      co: '„Płatnik” to ten, kto wypłaca zasiłek. Jeśli Twój pracodawca zgłasza do ubezpieczenia chorobowego ponad 20 osób, to on wypłaca zasiłek razem z pensją i to jemu składasz wniosek. Jeśli 20 lub mniej — pieniądze przelewa ZUS, a pracodawca tylko wysyła do ZUS zaświadczenie Z-3.',
      gdzie: 'Zapytaj w kadrach: „Kto wypłaci mój zasiłek macierzyński — firma czy ZUS?”.',
      nie: 'Pokażemy obie drogi; kwota się nie zmienia, zmienia się tylko adresat wniosku.'
    },
    baseKnown: {
      t: 'Czy wiesz, od jakiej kwoty liczy się Twój zasiłek?',
      h: 'Kadry nazywają ją „podstawą wymiaru zasiłku”. To nie jest pensja „na rękę”.',
      co: 'Podstawa to zwykle średnia pensja brutto z 12 miesięcy, pomniejszona o składki (ok. 13,71%). Zasiłek za dzień = podstawa ÷ 30 × procent (100%, 81,5% lub 70%).',
      gdzie: 'Kadry wpisują ją w zaświadczeniu Z-3. Możesz też wpisać pensję brutto w kalkulatorze — policzymy w przybliżeniu.',
      nie: 'Policzymy przybliżoną kwotę z pensji albo pokażemy, czego brakuje.'
    },
    benefitBase: { t: 'Od jakiej miesięcznej kwoty liczy się zasiłek?', h: 'Kwota z zaświadczenia od kadr (Z-3). Nie wiesz? Pomiń — policzymy szacunkowo w kalkulatorze.' },
    changedBaseConfirmed: { t: 'Czy kadry przeliczyły podstawę po zmianie etatu?', h: 'Po zmianie wymiaru pracy podstawę liczy się inaczej niż zwykłą średnią.' },
    hoursChanged: { t: 'Czy w ostatnim roku zmienił się Twój wymiar pracy (np. z pół etatu na cały)?', h: 'To zmienia sposób liczenia zasiłku.' },
    hoursChangedDate: { t: 'Od kiedy pracujesz w nowym wymiarze?', h: 'Data z aneksu do umowy.' },
    multipleTitles: {
      t: 'Czy masz więcej niż jedną pracę lub umowę, z której płacone są składki?',
      h: 'Na przykład etat i zlecenie albo etat i własna firma.',
      co: 'Zasiłek może przysługiwać z każdego źródła osobno. Wtedy każdy płatnik wystawia swoje zaświadczenie.',
      nie: 'Policzymy z jednego źródła; dodatkowe może dać więcej pieniędzy.'
    },
    otherMaternityPayments: { t: 'Czy dostajesz zasiłek macierzyński jeszcze z innego miejsca?', h: 'Ważne przy dopłacie do 1000 zł miesięcznie.' },
    lowBenefit: { t: 'Czy Twój zasiłek „na rękę” będzie niższy niż 1000 zł miesięcznie?', h: 'Wtedy ZUS dopłaca do 1000 zł. To nie jest dodatkowe 1000 zł, tylko wyrównanie.' },
    otherPaymentsNet: { t: 'Ile miesięcznie dostajesz z innych zasiłków po podatku?', h: 'Potrzebne tylko do dopłaty do 1000 zł.' },
    employmentEnded: { t: 'Czy Twoja umowa się skończyła?', h: 'Koniec umowy nie zawsze oznacza koniec prawa do zasiłku.' },
    terminationReason: { t: 'Dlaczego skończyła się umowa?', h: 'Przy likwidacji lub upadłości firmy w ciąży należy się specjalny zasiłek do porodu.' },
    pregnantAtEnd: { t: 'Czy była już ciąża, kiedy skończyła się umowa?', h: 'Wystarczy zaświadczenie lekarza o ciąży z tego dnia.' },
    replacementEmployment: { t: 'Czy zaproponowano Ci inną pracę?', h: 'Dotyczy likwidacji lub upadłości firmy.' },
    coverageEnd: { t: 'Kiedy skończyło się ubezpieczenie?', h: 'Zwykle dzień końca umowy.' },
    businessEnded: { t: 'Czy zamknęłaś/zamknąłeś firmę przed porodem?', h: 'Zamknięta firma = brak chorobowego od tego dnia.' },
    suspended: { t: 'Czy firma była zawieszona w dniu porodu?', h: 'W czasie zawieszenia nie ma ubezpieczenia chorobowego, więc zasiłek nie przysługuje.' },
    studentContract: { t: 'Czy to zlecenie zawarte jako student(ka) przed 26. urodzinami?', h: 'Wtedy zwykle nie ma składek, więc nie ma chorobowego.' },
    leave: { t: 'Czy w dniu porodu jesteś na innym urlopie (np. bezpłatnym, wychowawczym)?', h: 'Niektóre urlopy przerywają ubezpieczenie.' },
    foreign: {
      t: 'Czy Ty lub druga osoba pracujecie albo dostajecie świadczenia za granicą?',
      h: 'Większość osób odpowiada „Nie”.',
      co: 'Przy pracy w innym kraju UE świadczenia mogą wypłacać dwa państwa i trzeba to uzgodnić między urzędami.',
      nie: 'Przyjmiemy, że wszystko dzieje się w Polsce.'
    },
    count: { t: 'Ile dzieci urodziło się lub przyjęliście jednocześnie?', h: 'Przy bliźniętach urlop jest dłuższy. Liczą się dzieci z tego porodu, nie wszystkie w rodzinie.' },
    eventDate: { t: 'Kiedy jest lub był termin porodu?', h: 'Jeśli dziecko jeszcze się nie urodziło — wpisz przewidywaną datę.' },
    childDob: { t: 'Kiedy urodziło się dziecko?', h: 'Data z aktu urodzenia.' },
    hospital: { t: 'Czy dziecko leżało w szpitalu po porodzie dłużej niż zwykle?', h: 'Także gdy urodziło się o czasie. Daje to dodatkowy urlop (uzupełniający).' },
    gestationWeeks: { t: 'W którym tygodniu ciąży urodziło się dziecko?', h: 'Pełne tygodnie, np. „34”. Jest w karcie wypisowej.' },
    birthWeight: { t: 'Ile ważyło dziecko przy urodzeniu (w gramach)?', h: 'Masa urodzeniowa z karty wypisowej, nie przy kolejnym przyjęciu.' },
    hospitalConfirmed: { t: 'Czy szpital wydał zaświadczenie z tymi danymi?', h: 'Do urlopu uzupełniającego potrzebne jest zaświadczenie szpitala z tygodniem ciąży, masą i datami pobytu.' },
    zaZyciem: {
      t: 'Czy dziecko ma zaświadczenie „Za życiem”?',
      h: 'Większość rodzin go nie ma — wtedy wybierz „Nie”.',
      co: '„Za życiem” to specjalne zaświadczenie od lekarza specjalisty, gdy u dziecka stwierdzono ciężką, nieodwracalną niepełnosprawność albo nieuleczalną chorobę zagrażającą życiu, powstałą w ciąży lub przy porodzie. Daje dłuższy urlop rodzicielski (65 zamiast 41 tygodni) i jednorazowe 4000 zł z gminy. Orzeczenie o niepełnosprawności ani wypis ze szpitala go NIE zastępują.',
      gdzie: 'Wydaje je lekarz specjalista (np. neonatolog, pediatra, położnik). Zapytaj lekarza prowadzącego dziecko.',
      nie: 'Policzymy zwykły urlop rodzicielski.'
    },
    previousParental: { t: 'Czy ktoś z Was już był na urlopie rodzicielskim z tym dzieckiem?', h: 'Urlop można podzielić najwyżej na 5 części — łącznie dla obojga rodziców.' },
    parallelParental: { t: 'Czy chcecie być na urlopie rodzicielskim w tym samym czasie?', h: 'Można, ale wtedy pula tygodni szybciej się kończy.' },
    plan: {
      t: 'Jak chcesz dostawać pieniądze?',
      h: 'Albo przez cały rok po 81,5%, albo najpierw 100%, a potem 70%. Łącznie wychodzi podobnie.',
      co: 'Wariant 81,5%: składasz wniosek najpóźniej 21 dni po porodzie i dostajesz równą kwotę przez cały rok. Wariant 100% + 70%: pierwsze 20 tygodni więcej, potem mniej — i łatwiej podzielić urlop z tatą.'
    },
    applicationDate: { t: 'Kiedy złożysz wniosek o wypłatę po 81,5%?', h: 'Najpóźniej 21 dni po porodzie.' },
    firstYearParental: { t: 'Czy wykorzystasz choć jeden dzień urlopu rodzicielskiego przed pierwszymi urodzinami dziecka?', h: 'Jeśli nie — ZUS może wyrównać wypłatę za urlop macierzyński do 100%.' },
    workDuringParental: { t: 'Czy chcesz pracować na część etatu w czasie urlopu rodzicielskiego?', h: 'Można pracować do połowy etatu u tego samego pracodawcy — urlop się wtedy wydłuża.' },
    parentalWeeks: { t: 'Ile tygodni urlopu rodzicielskiego planujesz wziąć?', h: 'Każde z rodziców ma 9 własnych tygodni; resztę dzielicie.' },
    parentalStart: { t: 'Od kiedy chcesz zacząć urlop rodzicielski?', h: 'Zwykle zaraz po macierzyńskim.' },
    otherInsurance: { t: 'Czy druga osoba (np. tata) też ma ubezpieczenie chorobowe?', h: 'Wtedy też może dostać zasiłek za swoje tygodnie urlopu.' },
    otherBaseKnown: { t: 'Czy wiesz, od jakiej kwoty liczy się zasiłek drugiej osoby?', h: 'Jak wyżej — „podstawa” z kadr. Możesz pominąć.' },
    otherBenefitBase: { t: 'Od jakiej kwoty liczy się zasiłek drugiej osoby?', h: 'Kwota z jej zaświadczenia Z-3. Nie wiesz? Pomiń.' },
    otherConditionsConfirmed: { t: 'Czy pracodawca drugiej osoby potwierdził jej prawo do urlopu?', h: 'Wystarczy rozmowa z kadrami drugiej osoby.' },
    otherPlannedWeeks: { t: 'Ile tygodni urlopu planuje druga osoba?', h: 'Co najmniej 9 tygodni jest tylko dla niej.' },
    otherParentalStart: { t: 'Od kiedy druga osoba chce zacząć urlop?', h: 'Możecie też być na urlopie jednocześnie.' },
    otherRatePlan: { t: 'Ile procent dostanie druga osoba?', h: 'Własne 9 tygodni drugiej osoby są zwykle płatne 70%.' },
    paternityStart: { t: 'Od kiedy tata chce wziąć urlop ojcowski?', h: '2 tygodnie, do pierwszych urodzin dziecka. Płatne 100%.' },
    paternityUsedDays: { t: 'Ile dni urlopu ojcowskiego tata już wykorzystał?', h: 'Wpisz 0, jeśli jeszcze żadnego.' },
    motherUsedWeeks: { t: 'Ile tygodni urlopu macierzyńskiego mama już wykorzystała?', h: 'Tata może przejąć resztę po co najmniej 14 tygodniach mamy.' },
    motherResignation: { t: 'Czy mama złożyła pismo, że rezygnuje z reszty urlopu na rzecz taty?', h: 'To pismo składa się u pracodawcy mamy.' },
    transferReason: { t: 'Dlaczego tata przejmuje opiekę?', h: 'Na przykład mama jest w szpitalu albo zrezygnowała z części urlopu.' },
    pregnancySick: { t: 'Czy lekarz dał Ci zwolnienie (L4) w ciąży?', h: 'Zwolnienie w ciąży jest płatne 100% pensji (podstawy).',
      co: 'L4 to elektroniczne zwolnienie lekarskie (e-ZLA). Jeśli dotyczy ciąży, lekarz wpisuje kod „B” i zasiłek wynosi 100% zamiast 80%.',
      gdzie: 'Zwolnienia widać w eZUS w zakładce „Zaświadczenia lekarskie” oraz u pracodawcy.',
      nie: 'Pokażemy zasady zasiłku chorobowego w ciąży, bez kwoty.' },
    sickFrom: { t: 'Od kiedy jesteś na zwolnieniu?', h: 'Data z e-ZLA (L4).' },
    sickLimit: { t: 'Czy jesteś na zwolnieniu już prawie 270 dni?', h: 'Zasiłek chorobowy w ciąży przysługuje najdłużej 270 dni.' },
    sickRemainingDays: { t: 'Ile dni zasiłku chorobowego Ci jeszcze zostało?', h: 'Kadry albo ZUS podadzą tę liczbę.' },
    sickWaiting: { t: 'Czy masz ubezpieczenie dość długo, żeby dostać zasiłek chorobowy?', h: '30 dni przy umowie o pracę, 90 dni przy zleceniu i firmie.' },
    reEnrolled: { t: 'Czy po przerwie ponownie zgłosiłaś/zgłosiłeś się do chorobowego?', h: 'Przy firmie po zakończeniu zasiłku trzeba się zgłosić ponownie — inaczej kolejna część urlopu nie będzie płatna.' },
    resumedAfterBenefit: { t: 'Czy to kolejna część urlopu po przerwie?', h: 'Na przykład wracasz po kilku miesiącach pracy.' },
    lossDocument: { t: 'Jaki dokument masz?', h: 'Wystarczy zaświadczenie od lekarza lub położnej. Akt urodzenia nie jest konieczny.' },
    otherSurviving: { t: 'Czy z tego porodu są inne dzieci, które żyją?', h: 'Ważne tylko przy bliźniętach lub trojaczkach.' },
    maternityAtDeath: { t: 'Czy w tym czasie trwał jeszcze urlop macierzyński?', h: 'Wpływa na to, jak długo przysługuje zasiłek.' },
    funeralCosts: { t: 'Czy pokrywaliście koszty pogrzebu?', h: 'Osoba, która pokryła koszty, może dostać zasiłek pogrzebowy z ZUS.' },
    adoptionCourt: { t: 'Czy złożyliście w sądzie wniosek o adopcję?', h: 'Zasiłek przysługuje od przyjęcia dziecka, gdy toczy się sprawa w sądzie.' },
    fosterType: { t: 'Jaką rodziną zastępczą jesteście?', h: 'Zasiłek przysługuje rodzinie niezawodowej (nie zawodowej).' },
    schoolDeferred: { t: 'Czy dziecko ma odroczony obowiązek szkolny?', h: 'Wtedy limit wieku jest wyższy (10 lat zamiast 7).' },
    careReason: { t: 'Kto potrzebuje opieki i dlaczego?', h: 'Na przykład chore dziecko albo zamknięty żłobek.' },
    careProof: { t: 'Czy lekarz wystawił zwolnienie na opiekę?', h: 'Na chore dziecko lekarz wystawia e-ZLA na rodzica.' },
    carePersonal: { t: 'Czy w tych dniach nie pracujesz, bo opiekujesz się dzieckiem?', h: 'Zasiłek opiekuńczy jest za dni bez pracy.' },
    careOnlyClaimant: { t: 'Czy tylko Ty bierzesz opiekę za te dni?', h: 'Za ten sam dzień zasiłek dostaje tylko jedna osoba.' },
    otherCarer: { t: 'Czy ktoś inny w domu może zająć się dzieckiem?', h: 'Przy dziecku powyżej 2 lat to wpływa na prawo do zasiłku.' },
    careUsedDays: { t: 'Ile dni opieki wykorzystaliście w tym roku?', h: 'Limit to 60 dni w roku na rodzinę.' },
    careUntil: { t: 'Do kiedy potrzebna jest opieka?', h: 'Data z zwolnienia lekarskiego.' },
    motherHealthSituation: { t: 'Jak możemy pomóc?', h: 'Nie pytamy o diagnozę. Wybierz to, co jest najbliżej.' },
    hospitalStays: { t: 'Kiedy dziecko było w szpitalu?', h: 'Wpisz każdy pobyt osobno, także przeniesienia między szpitalami.' },
    parentalParts: { t: 'Jakie części urlopu rodzicielskiego już wykorzystaliście?', h: 'Wpisz każdą część z datami — limit to 5 części dla obojga.' },
    workPeriods: { t: 'Kiedy i na jaką część etatu chcesz pracować w czasie urlopu?', h: 'Wpisz okres i wymiar, np. ½ etatu.' }
  };
  const GROUP = {
    rodzina: { gdzie: 'Tę informację zwykle znasz sama/sam albo znajdziesz w dokumentach (umowa, zaświadczenia, akt urodzenia).', nie: 'Pominiemy to na razie i pokażemy, czego brakuje.' },
    ubezpieczenie: { gdzie: KADRY, nie: 'Pokażemy wynik warunkowo i dopiszemy to do listy „Do sprawdzenia”.' },
    okresy: { gdzie: 'Daty znajdziesz we wnioskach urlopowych i w kadrach.', nie: 'Policzymy typowy układ urlopów; możesz go potem zmienić.' },
    kwota: { gdzie: 'Kwotę podają kadry w zaświadczeniu Z-3 albo księgowa.', nie: 'Kwotę policzymy w przybliżeniu w kalkulatorze z pensji brutto.' }
  };
  function get(q) {
    const own = P[q.id] || {};
    const g = GROUP[q.group] || GROUP.rodzina;
    return {
      title: own.t || q.title || q.label,
      help: own.h || q.help || q.hint || '',
      co: own.co || '',
      gdzie: own.gdzie || g.gdzie,
      nie: own.nie || g.nie
    };
  }
  const PICKS = { count: [1, 2, 3, 4], paternityUsedDays: [0, 7, 14], motherUsedWeeks: [14, 16, 18, 20] };
  const SUB = {
    work: { employee: 'Masz etat — zasiłek wypłaca pracodawca albo ZUS', contract: 'Zlecenie lub umowa usługowa — chorobowe jest dobrowolne', business: 'Sama/sam opłacasz składki ZUS', cooperating: 'Pomagasz w firmie bliskiej osoby', krus: 'Rolnik — świadczenia z KRUS, nie z ZUS', none: 'Bez składek na chorobowe' },
    payerSize: { over20: 'Średnia lub duża firma — wypłaca zasiłek sama', upTo20: 'Mała firma — zasiłek wypłaci ZUS' },
    insurance: { yes: 'Np. umowa o pracę albo opłacane dobrowolne chorobowe', no: 'Np. zlecenie bez chorobowego, umowa o dzieło' },
    plan: { standard: 'Więcej na początku, potem mniej — łatwiej dzielić z tatą', combined: 'Równa kwota przez cały rok; wniosek do 21 dni po porodzie' },
    event: { pregnancy: 'Jesteś w ciąży lub planujecie dziecko', birth: 'Dziecko już jest na świecie', adoption: 'Złożony wniosek do sądu o przysposobienie', foster: 'Rodzina zastępcza niezawodowa' },
    insuranceDispute: { yes: 'Masz decyzję lub pismo w tej sprawie', no: 'Nie było takiego pisma — najczęstsza odpowiedź' },
    debt: { yes: 'Nieopłacone składki w dniu porodu', no: 'Wszystkie składki opłacone' },
    zaZyciem: { yes: 'Zaświadczenie od lekarza specjalisty', no: 'Większość rodzin go nie ma' }
  };
  root.OtulaProsto = { get, picks: id => PICKS[id] || null, sub: (id, v) => (SUB[id] || {})[v] || '' };
})(window);
