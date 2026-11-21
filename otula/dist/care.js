const CARE_TOPICS = [
  {
    id: 'glod-i-sytosc', section: 'feeding',
    title: 'Po czym poznam głód i sytość?',
    intro: 'W pierwszych miesiącach dziecko potrafi poprosić o mleko jeszcze przed płaczem. Łatwiej zacząć karmienie, kiedy jest spokojne.',
    keywords: ['głód', 'głodne', 'głodna', 'głodny', 'najedzone', 'najedzona', 'najedzony', 'sytość', 'ssie rączki', 'ssie piąstkę', 'chce jeść', 'czy się najada'],
    steps: [
      'Obserwuj kilka sygnałów razem. Dziecko może zwracać głowę w stronę piersi lub butelki, otwierać buzię, mlaskać i podnosić dłonie do ust.',
      'Zaproponuj mleko, gdy dostrzeżesz te ruchy. Jeśli dziecko już mocno płacze, przytul je i spróbuj ponownie, kiedy się uspokoi.',
      'Gdy zamyka usta, odwraca głowę i rozluźnia dłonie, zrób przerwę. Pozwól mu zakończyć posiłek, nawet gdy w butelce zostało mleko.'
    ],
    alert: 'Jeżeli noworodek jest zbyt senny, żeby jeść, odmawia kolejnych karmień lub moczy wyraźnie mniej pieluszek, pilnie skontaktuj się z lekarzem.',
    source: 'https://www.cdc.gov/infant-toddler-nutrition/mealtime/signs-your-child-is-hungry-or-full.html',
    sourceLabel: 'CDC · oznaki głodu i sytości',
    extraSources: [{label:'NHS · kiedy szukać pilnej pomocy',url:'https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/'}]
  },
  {
    id: 'karmienie-piersia', section: 'feeding',
    title: 'Jak przystawić dziecko do piersi?',
    intro: 'Ułóż się wygodnie, podeprzyj plecy i przyciągnij dziecko blisko. W trakcie karmienia powinno swobodnie oddychać i połykać.',
    keywords: ['karmić piersią', 'karmienie piersią', 'przystawić do piersi', 'ssanie', 'brodawka', 'laktacja', 'boli karmienie'],
    steps: [
      'Ułóż całe ciało dziecka przodem do siebie. Głowa i tułów mają być w jednej linii. Podtrzymaj plecy i kark tak, aby mogło lekko odchylić głowę.',
      'Ustaw nos dziecka na wysokości brodawki. Gdy szeroko otworzy buzię, przybliż je do piersi tak, aby najpierw dotknęło jej brodą.',
      'Wypatruj głębszych, rytmicznych ruchów żuchwy z przerwami na połykanie. Policzki zwykle pozostają zaokrąglone. Przy utrzymującym się bólu poproś położną, by obejrzała całe karmienie.',
      'Na początku karmienie może wracać często, także nocą. Jeśli po wypisie dostaliście plan wybudzania lub dokarmiania dziecka, trzymajcie się go do rozmowy z osobą prowadzącą.'
    ],
    alert: 'Jeśli dziecko nie potrafi ssać, stale przysypia przy próbie jedzenia lub moczy mniej pieluszek, poproś o pomoc medyczną jeszcze dziś.',
    source: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/positioning-and-attachment/',
    sourceLabel: 'NHS · przystawianie do piersi, instrukcja ze zdjęciami',
    extraSources: [{label:'Ministerstwo Zdrowia · karmienie piersią',url:'https://www.gov.pl/web/zdrowie/karmienie-piersia'}]
  },
  {
    id: 'karmienie-butelka', section: 'feeding',
    title: 'Jak karmić butelką w rytmie dziecka?',
    intro: 'Przy odciągniętym mleku i przy mieszance dziecko potrzebuje podparcia, spokojnego przepływu i czasu na przerwy.',
    keywords: ['butelka', 'butelką', 'smoczek', 'mieszanka', 'mleko modyfikowane', 'odciągnięte mleko', 'przerwy w karmieniu', 'karmienie butelką'],
    steps: [
      'Usiądź i przytul dziecko w pozycji półpionowej. Podeprzyj jego głowę i kark. Twarz powinna być dobrze widoczna przez całe karmienie.',
      'Dotknij smoczkiem górnej wargi. Poczekaj na otwarcie buzi. Trzymaj butelkę niemal poziomo i lekko ją przechylaj, by mleko płynęło powoli.',
      'Kiedy dziecko przestaje ssać, odsuwa głowę lub mleko wypływa kącikiem ust, opuść butelkę, aby zatrzymać przepływ. Wznów karmienie, gdy znów pokaże gotowość.',
      'Przy mieszance umyj ręce, przygotuj czysty, wysterylizowany sprzęt i jedną świeżą porcję. Odmierz wodę i proszek dokładnie według instrukcji. Resztę po karmieniu wylej.'
    ],
    alert: 'Zawsze trzymaj butelkę w dłoni. Podparta poduszką butelka lub karmienie na płasko zwiększają ryzyko zachłyśnięcia.',
    source: 'https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/',
    sourceLabel: 'NHS · karmienie butelką krok po kroku',
    extraSources: [{label:'NHS · przygotowanie mieszanki',url:'https://www.uhsussex.nhs.uk/resources/how-to-safely-bottle-feed-your-baby/'}]
  },
  {
    id: 'mokre-pieluszki', section: 'feeding',
    title: 'Czy dziecko dostaje dość mleka?',
    intro: 'Spójrz na cały dzień. Połykanie w trakcie karmienia, mokre pieluszki i kolejne pomiary masy ciała mówią więcej niż długość jednego posiłku.',
    keywords: ['mokre pieluchy', 'mokre pieluszki', 'ile pieluch', 'ile siusia', 'mocz', 'mało mleka', 'czy wystarcza pokarmu', 'przyrost masy', 'odwodnienie'],
    steps: [
      'Przy zmianie pieluszki zwróć uwagę, czy jest cięższa od suchej. Jeśli chcesz porównać kolejne doby, zapisuj mokre pieluszki przez 24 godziny.',
      'W pierwszych 48 godzinach po porodzie mokrych pieluszek jest zwykle niewiele. Od piątej doby u dobrze jedzącego noworodka spodziewamy się co najmniej sześciu wyraźnie mokrych pieluszek na dobę.',
      'Podczas wizyty pokaż zapiski położnej. Obejrzenie karmienia i sprawdzenie masy ciała pomoże ustalić, czy dziecko pobiera wystarczająco dużo mleka.'
    ],
    alert: 'Przy wyraźnym spadku ilości moczu, suchych ustach, słabym jedzeniu lub niezwykłej senności skontaktuj się pilnie z lekarzem. Nie czekaj do końca doby na podliczenie pieluszek.',
    source: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/enough-milk/',
    sourceLabel: 'NHS · oznaki skutecznego karmienia'
  },
  {
    id: 'zmeczenie', section: 'sleep',
    title: 'Jak poznać, że pora na odpoczynek?',
    intro: 'Ziewanie, odwracanie wzroku i przymykanie oczu mogą oznaczać senność albo potrzebę przerwy od głosów, światła i zabawy.',
    keywords: ['zmęczenie', 'zmęczone', 'zmęczona', 'senne', 'śpiące', 'ziewa', 'przebodźcowanie', 'pociera oczy', 'usypiać', 'usypianie'],
    steps: [
      'Gdy dziecko odwraca głowę podczas zabawy, zatrzymaj się. Ścisz głos, odłóż zabawkę i daj mu chwilę w spokojnym miejscu.',
      'Sprawdź, czy jest głodne lub ma mokrą pieluszkę. Jeśli szuka pocieszenia, przytul je. Obserwuj, czy przy spokojnym głosie i delikatnym kołysaniu zaczyna się rozluźniać.',
      'Przed drzemką ułóż dziecko na plecach na płaskim, twardym materacu w jego łóżeczku. Tę samą zasadę stosuj w dzień i w nocy.'
    ],
    alert: 'Jeśli dziecko stało się wyjątkowo senne i trudno je dobudzić, potrzebuje pilnej pomocy. Przy braku reakcji lub poważnych trudnościach z oddychaniem dzwoń w Polsce pod 112 lub 999.',
    source: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/bonding-with-your-baby/understanding-your-baby/',
    sourceLabel: 'NHS · odczytywanie sygnałów dziecka'
  },
  {
    id: 'bezpieczny-sen', section: 'sleep',
    title: 'Jak przygotować miejsce do snu?',
    intro: 'Na każdą drzemkę i na noc połóż niemowlę na plecach we własnym łóżeczku. Przez pierwsze sześć miesięcy najbezpieczniej ustawić je w pokoju opiekuna.',
    keywords: ['bezpieczny sen', 'spać', 'drzemka', 'spanie', 'łóżeczko', 'materac', 'na plecach', 'na brzuszku', 'poduszka', 'śpiworek'],
    steps: [
      'Wybierz twardy, płaski, poziomy materac dopasowany do łóżeczka i dobrze napięte prześcieradło.',
      'Zostaw wolną przestrzeń wokół głowy i ciała. Wyjmij poduszkę, przytulanki, ochraniacze i luźne przykrycia. Dobierz ubranie lub lekki śpiworek odpowiedni do temperatury.',
      'Jeśli przy karmieniu lub tuleniu zaczynasz przysypiać, odłóż dziecko do łóżeczka albo poproś kogoś o pomoc.'
    ],
    alert: 'Zaśnięcie z niemowlęciem na sofie lub w fotelu wiąże się z ryzykiem uduszenia. Przygotuj dla dziecka własne miejsce, zanim usiądziesz do nocnego karmienia.',
    source: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/',
    sourceLabel: 'NHS · bezpieczne miejsce do snu'
  },
  {
    id: 'otulanie', section: 'sleep',
    title: 'Jak bezpiecznie otulić noworodka?',
    intro: 'Otulanie jest opcjonalne. Zacznij od cienkiej tkaniny i sprawdź, czy dziecko swobodnie oddycha oraz porusza nogami. Możesz poprosić położną o pokaz podczas wizyty.',
    keywords: ['otulać', 'otulanie', 'otulić', 'otulacz', 'zawijać', 'zawinąć', 'kocyk', 'spowijanie', 'rożek'],
    steps: [
      'Rozłóż cienką tkaninę w romb i zagnij górny róg. Połóż noworodka na plecach tak, aby głowa i szyja były całkowicie nad tkaniną.',
      'Przełóż boczny róg przez tułów i podwiń przy przeciwległym boku, a potem tak samo zabezpiecz drugi róg. Między klatkę piersiową a materiał powinny swobodnie wchodzić dwa lub trzy palce.',
      'Dół podwiń luźno i zabezpiecz przy boku. Nóżki muszą mieć miejsce na zgięcie i rozchylenie w biodrach. Sprawdź, czy materiał nie może się rozwinąć i zasłonić twarzy.',
      'Do snu połóż otulone dziecko wyłącznie na plecach, na płaskim, twardym materacu. Jeśli się poci lub klatka piersiowa jest gorąca, zdejmij warstwę.'
    ],
    alert: 'Zakończ otulanie, gdy dziecko zaczyna próbować się obracać. Może to nastąpić jeszcze przed pierwszym samodzielnym obrotem. Nie używaj otulaczy ani kocyków obciążeniowych.',
    source: 'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Swaddling-Is-it-Safe.aspx',
    sourceLabel: 'Amerykańska Akademia Pediatrii · technika i bezpieczeństwo otulania'
  },
  {
    id: 'kolka', section: 'sleep',
    title: 'Długi płacz. Czy to może być kolka?',
    intro: 'Kolka może dawać długie napady płaczu, często pod wieczór, u niemowlęcia, które poza tym dobrze je i zachowuje się jak zwykle. Samo podkurczanie nóżek nie wystarcza do rozpoznania kolki.',
    keywords: ['kolka', 'kolkę', 'kolki', 'brzuszek', 'płacze wieczorem', 'nieutulony płacz', 'płacz', 'gazy', 'pręży się', 'podkurcza nóżki'],
    steps: [
      'Najpierw sprawdź głód, pieluszkę i temperaturę otoczenia. Spróbuj przytulić dziecko i delikatnie je kołysać. Po karmieniu możesz chwilę potrzymać je pionowo, podpierając głowę.',
      'Zauważ, kiedy płacz się zaczyna, jak długo trwa, co go łagodzi i jak dziecko zachowuje się między napadami. Opowiedz o tym położnej lub pediatrze.',
      'Jeśli płacz Cię przytłacza, połóż dziecko na plecach w bezpiecznym łóżeczku, odejdź na kilka minut i poproś drugą osobę o pomoc. Nigdy nie potrząsaj niemowlęciem.'
    ],
    alert: 'Pilnie zgłoś się z dzieckiem do lekarza, jeśli płacz jest nietypowy, dziecko odmawia jedzenia lub osłabło. Przy temperaturze 38°C lub wyższej u dziecka poniżej 3 miesięcy potrzebna jest pilna ocena. Przy sinieniu, ciężkim oddechu lub braku reakcji dzwoń pod 112 lub 999.',
    source: 'https://www.nhs.uk/conditions/colic/',
    sourceLabel: 'NHS · kolka niemowlęca',
    extraSources: [{label:'NHS · jak uspokajać płaczące dziecko',url:'https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/'},{label:'Pacjent.gov.pl · pogotowie w Polsce',url:'https://pacjent.gov.pl/pogotowie-i-numer-alarmowy'}]
  },
  {
    id: 'kapiel', section: 'home',
    title: 'Pierwsza kąpiel bez pośpiechu',
    intro: 'Wybierz chwilę, gdy dziecko jest spokojne. Noworodka można myć miejscowo między kąpielami. Najważniejsze, by dorosły przez cały czas był tuż przy nim.',
    keywords: ['kąpiel', 'kąpać', 'wanienka', 'mycie', 'umyć dziecko', 'pielęgnacja skóry'],
    steps: [
      'Przygotuj ręcznik, ubranie i pieluszkę w zasięgu ręki. Wymieszaj wodę i sprawdź ją wewnętrzną stroną nadgarstka albo łokciem. Powinna być przyjemnie ciepła.',
      'Jedną ręką podpieraj głowę i barki. Powoli opuść dziecko do wody, cały czas trzymając głowę nad powierzchnią. Drugą ręką delikatnie umyj skórę.',
      'Owiń dziecko ręcznikiem i delikatnie osusz fałdki skóry. Po kąpieli od razu opróżnij wanienkę.'
    ],
    alert: 'Jeżeli musisz sięgnąć po coś poza zasięgiem lub odejść od wanienki, zabierz dziecko ze sobą. Nawet kilka centymetrów wody stanowi zagrożenie.',
    source: 'https://www.nhs.uk/baby/caring-for-a-newborn/washing-and-bathing-your-baby/',
    sourceLabel: 'NHS · kąpiel noworodka, instrukcja i film'
  },
  {
    id: 'pilna-pomoc', section: 'first',
    title: 'Kiedy dziecko potrzebuje pilnej pomocy?',
    intro: 'Gdy niemowlę nie reaguje, ma duże trudności z oddychaniem, sinieją mu usta lub język albo ma drgawki, dzwoń teraz pod 112 lub 999 w Polsce.',
    keywords: ['pilna pomoc', 'gorączka', 'temperatura', '38 stopni', 'nie reaguje', 'nie oddycha', 'duszność', 'sinieje', 'drgawki', 'trudno dobudzić', 'pogotowie'],
    steps: [
      'Dziecko poniżej 3 miesięcy z temperaturą 38°C lub wyższą wymaga pilnej oceny lekarskiej. Szukaj pomocy od razu, nawet jeśli poza gorączką nic Cię nie niepokoi.',
      'Jeśli dziecko odmawia karmienia, ma wyraźnie mniej mokrych pieluszek albo staje się niezwykle senne, pilnie skontaktuj się z lekarzem. Po godzinach przychodni możesz skorzystać z nocnej i świątecznej opieki zdrowotnej.',
      'Dzwoniąc po pomoc, podaj lokalizację, wiek dziecka, jego stan i czas pojawienia się objawów. Powiedz, czy oddycha i reaguje. Zostań na linii i wykonuj polecenia dyspozytora.'
    ],
    alert: 'Przy objawach zagrożenia życia zadzwoń po pogotowie od razu. Nie czekaj na odpowiedź asystenta.',
    source: 'https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/',
    sourceLabel: 'NHS · pilne objawy u niemowląt',
    extraSources: [{label:'Pacjent.gov.pl · 112 i 999 w Polsce',url:'https://pacjent.gov.pl/pogotowie-i-numer-alarmowy'},{label:'Pacjent.gov.pl · gdzie uzyskać pomoc po godzinach',url:'https://pacjent.gov.pl/na-ratunek'}]
  },
  {
    "section": "before",
    "id": "plan-porodu",
    "title": "Jak ułożyć swój plan porodu?",
    "intro": "Plan porodu pomaga położnej poznać Twoje potrzeby, także wtedy, gdy podczas skurczu trudno Ci się skupić na rozmowie.",
    "keywords": [
      "plan porodu",
      "szkoła rodzenia",
      "wybór porodówki",
      "znieczulenie porodowe",
      "edukacja przedporodowa"
    ],
    "steps": [
      "Na spotkaniu z położną opowiedz, czego się obawiasz i co pomaga Ci czuć się bezpiecznie. Możesz zaprosić wybraną osobę bliską na edukację przedporodową.",
      "Zapisz, kto ma Ci towarzyszyć, jakie pozycje chcesz wypróbować, o jakich sposobach łagodzenia bólu chcesz porozmawiać i jak wyobrażasz sobie kontakt z dzieckiem po urodzeniu.",
      "Sprawdź na stronie wybranej porodówki, jakie metody łagodzenia bólu są dostępne. Zapytaj o możliwość wcześniejszej konsultacji anestezjologicznej oraz o potrzeby związane z komunikacją lub poruszaniem się.",
      "Zabierz plan i pokaż go przy przyjęciu. Jeśli Twój stan lub Twoje preferencje się zmienią, poproś o omówienie kolejnego kroku."
    ],
    "alert": "Jeśli ciąża wymaga szczególnego nadzoru, ustal z prowadzącym zespołem miejsce porodu, termin zgłoszenia się i telefon do oddziału.",
    "source": "https://www.gov.pl/web/zdrowie/standardy-opieki-okoloporodowej",
    "sourceLabel": "Ministerstwo Zdrowia · standard opieki okołoporodowej od maja 2026 r.",
    "extraSources": [
      {
        "label": "NFZ · „Ciąża i okres okołoporodowy”, poradnik dla rodzin (PDF)",
        "url": "https://www.nfz.gov.pl/gfx/nfz/userfiles/_public/dla_pacjenta/magazyn_ze_zdrowiem/ze_zdrowiem_nfz_nr_18.pdf"
      }
    ]
  },
  {
    "section": "before",
    "id": "torba-porodowa",
    "title": "Co spakować do szpitala dla siebie i dziecka?",
    "intro": "Podziel torbę na rzeczy do izby przyjęć, na salę po porodzie i na wyjście. Pokaż osobie towarzyszącej, w której kieszeni są dokumenty.",
    "keywords": [
      "torba do porodu",
      "torba do szpitala",
      "wyprawka do szpitala",
      "dokumenty do porodu",
      "pakowanie do szpitala"
    ],
    "steps": [
      "Pod ręką trzymaj dokument tożsamości i kartę ciąży. Sprawdź listę swojej porodówki. Może prosić m.in. o potwierdzony wynik grupy krwi oraz wynik wymazu w kierunku paciorkowców grupy B (GBS).",
      "Spisz nazwy przyjmowanych leków, dawki i uczulenia. Jeśli masz zalecenia specjalisty, wypisy z wcześniejszych hospitalizacji lub ustalony plan porodu, dołącz je do dokumentów.",
      "Przygotuj wygodną koszulę, bieliznę, klapki, przybory do mycia, duże podpaski, wodę i ładowarkę. Zapytaj oddział o to, które pieluszki, ubranka i środki higieny zapewnia na miejscu.",
      "Ustal, kto Cię zawiezie, jak dostać się do izby przyjęć w nocy i kto zajmie się starszym dzieckiem. Spakuj oddzielnie ubranie dla siebie i dziecka na powrót."
    ],
    "alert": "Jeśli pojawią się objawy wymagające natychmiastowej pomocy, zostaw pakowanie i szukanie brakujących wyników bliskiej osobie.",
    "source": "https://www.gov.pl/web/pimmswia/klinika-poloznictwa-i-perinatologii",
    "sourceLabel": "Państwowy Instytut Medyczny MSWiA · przykładowa lista dokumentów i rzeczy do porodu",
    "extraSources": [
      {
        "label": "NHS · przygotowanie osoby towarzyszącej",
        "url": "https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/"
      }
    ]
  },
  {
    "section": "before",
    "id": "poczatek-porodu",
    "title": "Skurcze lub odejście wód. Kiedy dzwonić?",
    "intro": "Zapisz numer izby przyjęć położniczej. Jeśli podejrzewasz poród lub masz wątpliwości, opowiedz położnej, co się zmieniło.",
    "keywords": [
      "odejście wód",
      "wody płodowe",
      "skurcze porodowe",
      "początek porodu",
      "kiedy jechać na porodówkę",
      "mniej ruchów dziecka"
    ],
    "steps": [
      "Przy skurczach możesz zanotować, kiedy jeden się zaczyna i kończy oraz po ilu minutach zaczyna się następny. Przekaż też, w którym jesteś tygodniu ciąży i czy odczuwasz ruchy dziecka jak zwykle.",
      "Jeśli sączy się płyn lub odeszły wody, włóż podpaskę. Zwróć uwagę na porę, kolor i zapach płynu. Od razu skontaktuj się z porodówką, także gdy skurcze jeszcze się nie zaczęły.",
      "Jeśli czujesz wyraźnie mniej ruchów niż zwykle, pojawi się krwawienie lub objawy porodu przed ukończeniem 37. tygodnia ciąży, skontaktuj się z oddziałem natychmiast, również w nocy."
    ],
    "alert": "Przy obfitym krwawieniu, utracie przytomności albo gdy czujesz silne parcie i poród wydaje się bezpośrednio bliski, wezwij pogotowie pod 112 lub 999.",
    "source": "https://www.nhs.uk/pregnancy/labour-and-birth/signs-that-labour-has-begun/",
    "sourceLabel": "NHS · objawy rozpoczynającego się porodu",
    "extraSources": [
      {
        "label": "Pacjent.gov.pl · przebieg porodu",
        "url": "https://pacjent.gov.pl/porod-i-jestes-na-swiecie"
      },
      {
        "label": "Pacjent.gov.pl · wezwanie pogotowia w Polsce",
        "url": "https://pacjent.gov.pl/pogotowie-i-numer-alarmowy"
      }
    ]
  },
  {
    "section": "before",
    "id": "bliska-osoba",
    "title": "Co może zrobić tata lub bliska osoba?",
    "intro": "Najłatwiej skorzystać z pomocy, kiedy druga osoba proponuje konkret. Porozmawiajcie jeszcze przed porodem o tym, co przynosi ulgę, a co męczy.",
    "keywords": [
      "partner przy porodzie",
      "tata przy porodzie",
      "jak pomóc mamie",
      "pomoc po porodzie",
      "osoba towarzysząca",
      "podział obowiązków"
    ],
    "steps": [
      "Przećwiczcie trasę, zapiszcie numer oddziału i sprawdźcie, gdzie leżą dokumenty. Zapytaj osobę rodzącą, kiedy chce sama odpowiadać na pytania, a kiedy masz jej pomóc przekazać prośbę.",
      "Na sali zapytaj, czy przyda się podparcie przy zmianie pozycji, potrzymanie za rękę, masaż pleców lub chwila ciszy. Zmieniaj sposób pomocy, gdy rodząca o to prosi.",
      "Po powrocie przejmij konkretne zadanie od początku do końca, np. posiłek, pranie lub przewijanie między karmieniami. Zaproponuj czas na sen albo spokojny prysznic. Przy odwiedzinach zapytaj oboje rodziców o dogodny moment.",
      "Jeśli wychowujesz dziecko bez partnera, te same zadania możesz rozdzielić między zaufane osoby. Gdy opiekun też jest przeciążony, pomóż mu umówić rozmowę z lekarzem lub położną."
    ],
    "alert": "Gdy obserwujesz nagłe pogorszenie stanu mamy, przekaż personelowi konkretne objawy i czas ich wystąpienia. W domu przy zagrożeniu życia wezwij pomoc pod 112 lub 999.",
    "source": "https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/",
    "sourceLabel": "NHS · wsparcie podczas porodu",
    "extraSources": [
      {
        "label": "NHS · relacje i podział opieki po narodzinach",
        "url": "https://www.nhs.uk/baby/support-and-services/relationships-after-having-a-baby/"
      },
      {
        "label": "Pacjent.gov.pl · wezwanie pogotowia w Polsce",
        "url": "https://pacjent.gov.pl/pogotowie-i-numer-alarmowy"
      }
    ]
  },
  {
    "section": "mother",
    "id": "wypis-i-patronaz",
    "title": "Wypis, pierwsza wizyta położnej i kontrola mamy",
    "intro": "Położna POZ może odwiedzić Cię w domu, ocenić gojenie po porodzie i zobaczyć karmienie w warunkach, w których odbywa się na co dzień.",
    "keywords": [
      "wizyta patronażowa",
      "położna po porodzie",
      "wypis po porodzie",
      "wizyta kontrolna po połogu",
      "kontrola poporodowa"
    ],
    "steps": [
      "Przed wyjściem sprawdź zalecenia dla siebie i dziecka, leki, terminy kontroli i kontakt do oddziału. Upewnij się, że personel ma dane Twojej położnej POZ oraz adres, pod którym będziecie po wypisie.",
      "Szpital przekazuje zgłoszenie w dniu wypisu. Pierwsza wizyta położnej ma się odbyć do 48 godzin od otrzymania przez nią zgłoszenia urodzenia dziecka lub wypisu mamy. Do tego czasu nie wlicza się sobót, niedziel i dni ustawowo wolnych. Jeśli brak kontaktu, zadzwoń do swojej przychodni.",
      "Na wizytę przygotuj wypisy, książeczkę zdrowia dziecka i własne pytania. Możesz poprosić o obejrzenie rany, pomoc przy karmieniu i rozmowę sam na sam o nastroju. Jeśli dziecko pozostaje w szpitalu, Tobie również przysługuje opieka w połogu.",
      "Umów wizytę u ginekologa po zakończeniu połogu zgodnie z wypisem. Zapytaj o gojenie, krwawienie, oddawanie moczu, nastrój, planowanie ciąży i bezpieczny powrót do aktywności."
    ],
    "alert": "Objawy alarmowe wymagają oceny od razu, również w weekend. Przy nagłej duszności, bardzo obfitym krwawieniu lub utracie przytomności dzwoń pod 112 lub 999.",
    "source": "https://www.gov.pl/web/zdrowie/standardy-opieki-okoloporodowej",
    "sourceLabel": "Ministerstwo Zdrowia · organizacja opieki w połogu",
    "extraSources": [
      {
        "label": "Standard opieki okołoporodowej · tekst jednolity z 2026 r., część XV, ust. 6–7 i 10",
        "url": "https://dziennikustaw.gov.pl/DU/2026/1140"
      },
      {
        "label": "WHO · opieka nad mamą i noworodkiem w pierwszych sześciu tygodniach",
        "url": "https://www.who.int/publications/i/item/9789240045989"
      }
    ]
  },
  {
    "section": "mother",
    "id": "krwawienie-po-porodzie",
    "title": "Krwawienie w połogu. Co obserwować?",
    "intro": "Po porodzie drogami natury i po cięciu cesarskim pojawia się wydzielina z macicy, nazywana odchodami połogowymi. Zwykle z czasem krwawienie słabnie i staje się bardziej brunatne.",
    "keywords": [
      "krwawienie po porodzie",
      "krwotok poporodowy",
      "odchody połogowe",
      "podpaski po porodzie",
      "skrzepy po porodzie"
    ],
    "steps": [
      "Używaj podpasek poporodowych i zmieniaj je regularnie. Myj ręce przed zmianą i po niej. W czasie gojenia odłóż tampony i kubeczek menstruacyjny do omówienia na kontroli.",
      "Obserwuj przede wszystkim ilość wydzieliny i swoje samopoczucie. Przy rozmowie z personelem podaj czas od porodu, ile podpasek przemokło i w jakim czasie.",
      "Gdy wydzielina ma przykry zapach lub towarzyszą jej temperatura 38°C lub wyższa i ból podbrzusza, pilnie skontaktuj się z lekarzem."
    ],
    "alert": "Nagły obfity wypływ krwi lub przemoczenie co najmniej jednej dużej podpaski w godzinę wymaga natychmiastowej pomocy. Przy takim krwawieniu albo zasłabnięciu dzwoń pod 112 lub 999. Nie czekaj na upływ godziny, jeśli krew szybko płynie lub słabniesz.",
    "source": "https://www.nhs.uk/pregnancy/labour-and-birth/your-body/",
    "sourceLabel": "NHS · krwawienie i gojenie po porodzie",
    "extraSources": [
      {
        "label": "CDC · sygnały pilnych powikłań u mamy",
        "url": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html"
      },
      {
        "label": "Pacjent.gov.pl · wezwanie pogotowia w Polsce",
        "url": "https://pacjent.gov.pl/pogotowie-i-numer-alarmowy"
      }
    ]
  },
  {
    "section": "mother",
    "id": "pielegnacja-krocza",
    "title": "Jak myć krocze i dbać o szwy?",
    "intro": "Po porodzie okolica krocza może być tkliwa. Codzienna delikatna higiena i obserwacja zmian pomagają zauważyć, czy rana się goi.",
    "keywords": [
      "higiena krocza",
      "rana krocza",
      "szwy po porodzie",
      "nacięcie krocza",
      "ból krocza",
      "toaleta po porodzie"
    ],
    "steps": [
      "Umyj ręce. Do delikatnego mycia krocza wystarczy czysta, letnia woda. Potem osusz skórę przez przykładanie czystego ręcznika i załóż świeżą podpaskę.",
      "Po skorzystaniu z toalety podcieraj się od przodu ku tyłowi. Przy pieczeniu w trakcie oddawania moczu możesz w tym samym czasie delikatnie polewać okolicę letnią wodą.",
      "Zadbaj o regularne picie i posiłki, w których są warzywa, owoce i produkty pełnoziarniste. Przy utrzymujących się zaparciach lub bólu zapytaj położną o bezpieczne sposoby ulgi."
    ],
    "alert": "Narastający ból, obrzęk, ropna wydzielina lub rozchodzenie się rany wymagają oceny jeszcze dziś. Jeśli nie możesz oddać moczu, pilnie zgłoś to personelowi.",
    "source": "https://www.nhs.uk/pregnancy/labour-and-birth/episiotomy-and-perineal-tears/",
    "sourceLabel": "NHS · gojenie po pęknięciu lub nacięciu krocza",
    "extraSources": [
      {
        "label": "Cambridge University Hospitals · higiena krocza i oddawanie moczu",
        "url": "https://www.cuh.nhs.uk/patient-information/perineum-care-after-childbirth/"
      }
    ]
  },
  {
    "section": "mother",
    "id": "po-cesarskim-cieciu",
    "title": "Jak zadbać o siebie po cesarskim cięciu?",
    "intro": "Po operacji potrzebujesz czasu na gojenie rany brzucha i odpoczynek. Już na oddziale poproś o pokazanie, jak bezpiecznie wstać i ułożyć dziecko do karmienia.",
    "keywords": [
      "cesarskie cięcie",
      "po cesarce",
      "rana po cesarce",
      "blizna po cesarskim cięciu",
      "rekonwalescencja po cc"
    ],
    "steps": [
      "Na wypisie sprawdź, kiedy zdjąć lub zmienić opatrunek, czy trzeba usunąć szwy i jakie leki masz stosować w domu. O dodatkowy lek przeciwbólowy zapytaj osobę prowadzącą lub farmaceutę.",
      "Gdy zalecono odsłonięcie rany, delikatnie myj ją i osuszaj każdego dnia. Wybieraj przewiewną bieliznę i luźne ubrania, których szew nie uciska miejsca cięcia.",
      "Zacznij od krótkich, spokojnych przejść dostosowanych do Twoich sił. Przygotuj miejsce do karmienia i przewijania w łatwym zasięgu. Poproś bliską osobę o noszenie fotelika, zakupów i starszego dziecka."
    ],
    "alert": "Jeśli rana staje się gorąca, coraz bardziej boli, puchnie, rozchodzi się lub sączy się z niej ropa, pilnie skontaktuj się z lekarzem. Przy nagłej duszności albo bólu w klatce piersiowej dzwoń pod 112 lub 999.",
    "source": "https://www.nhs.uk/tests-and-treatments/caesarean-section/recovery/",
    "sourceLabel": "NHS · rekonwalescencja po cięciu cesarskim",
    "extraSources": [
      {
        "label": "CDC · sygnały pilnych powikłań u mamy",
        "url": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html"
      }
    ]
  },
  {
    "section": "mother",
    "id": "ruch-i-dno-miednicy",
    "title": "Spacer, mięśnie dna miednicy i powrót do ruchu",
    "intro": "Po niepowikłanym porodzie pierwszym ruchem może być krótki spacer po domu. Długość aktywności zwiększaj stopniowo, zależnie od tego, jak się czujesz.",
    "keywords": [
      "dno miednicy",
      "ćwiczenia po porodzie",
      "powrót do sportu",
      "nietrzymanie moczu",
      "fizjoterapia po porodzie",
      "spacer po porodzie"
    ],
    "steps": [
      "Po cięciu, większym pęknięciu krocza lub innych powikłaniach ustal zakres ruchu z osobą, która Cię leczy. Zacznij od codziennych czynności i odpoczynku pomiędzy nimi.",
      "Gdy możesz swobodnie oddawać mocz, ćwiczenie możesz wykonać w wygodnej pozycji. Przy spokojnym oddechu delikatnie napnij i unieś mięśnie wokół odbytu i pochwy, jak przy powstrzymywaniu gazów. Następnie całkowicie je rozluźnij. Ćwicz poza toaletą.",
      "Jeśli wysiłek zwiększa ból lub krwawienie, przerwij i omów objawy. Przy wyciekaniu moczu, uczuciu ciężkości w pochwie albo bólu poproś o ocenę i dobór ćwiczeń przez fizjoterapeutę zajmującego się dnem miednicy."
    ],
    "alert": "Jednostronny obrzęk, zaczerwienienie lub ból łydki wymaga pilnej oceny medycznej. Nagła duszność lub ból w klatce piersiowej to powód, by natychmiast wezwać pogotowie.",
    "source": "https://www.nhs.uk/baby/support-and-services/your-post-pregnancy-body/",
    "sourceLabel": "NHS · ciało i mięśnie dna miednicy po porodzie",
    "extraSources": [
      {
        "label": "NHS · stopniowy powrót do ruchu",
        "url": "https://www.nhs.uk/baby/support-and-services/keeping-fit-and-healthy-with-a-baby/"
      },
      {
        "label": "CDC · sygnały pilnych powikłań u mamy",
        "url": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html"
      }
    ]
  },
  {
    "section": "mother",
    "id": "bol-piersi",
    "title": "Pełne i bolesne piersi. Co może przynieść ulgę?",
    "intro": "Gdy ilość mleka rośnie, piersi mogą stać się ciężkie i tkliwe. Bolesny, gorący obszar jednej piersi, dreszcze lub uczucie rozbicia mogą towarzyszyć stanowi zapalnemu.",
    "keywords": [
      "ból piersi",
      "nawał pokarmu",
      "zapalenie piersi",
      "obrzmiałe piersi",
      "bolesna pierś",
      "zastój pokarmu"
    ],
    "steps": [
      "Jeśli karmisz piersią, proponuj ją zgodnie z sygnałami dziecka. Gdy przystawienie boli albo dziecko ma trudność z uchwyceniem piersi, poproś położną o obejrzenie całego karmienia.",
      "Jeśli karmienie jest zbyt bolesne, możesz delikatnie odciągnąć ręcznie ilość potrzebną dziecku lub wystarczającą do zmniejszenia napięcia. Dodatkowe odciąganie do całkowitego opróżnienia pobudza produkcję mleka.",
      "Ulgę może przynieść chłodny okład przez tkaninę, odpoczynek i wygodny biustonosz. Unikaj mocnego ugniatania bolącego miejsca. O dobór leków przeciwbólowych zapytaj farmaceutę lub lekarza."
    ],
    "alert": "Gorączka w połogu lub szybkie pogarszanie samopoczucia wymagają pilnej konsultacji. Przy łagodnych objawach miejscowych, które nie poprawiają się w ciągu 12–24 godzin, skontaktuj się z lekarzem. Objawy zapalenia u osoby, która nie karmi, również wymagają oceny.",
    "source": "https://www.nhs.uk/conditions/mastitis/",
    "sourceLabel": "NHS · objawy zapalenia piersi i sposoby postępowania",
    "extraSources": [
      {
        "label": "NFZ · ciąża, poród, połóg i karmienie (PDF)",
        "url": "https://www.nfz.gov.pl/gfx/nfz/userfiles/_public/dla_pacjenta/magazyn_ze_zdrowiem/ze_zdrowiem_nfz_nr_18.pdf"
      },
      {
        "label": "CDC · sygnały pilnych powikłań u mamy",
        "url": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html"
      }
    ]
  },
  {
    "section": "mother",
    "id": "nastroj-po-porodzie",
    "title": "Przygnębienie, lęk i nastrój po porodzie",
    "intro": "W pierwszych dniach mogą pojawiać się płaczliwość, rozdrażnienie i wahania nastroju. Znaczenie ma to, jak długo trwają, czy się nasilają i jak wpływają na jedzenie, sen oraz codzienną opiekę.",
    "keywords": [
      "baby blues",
      "depresja poporodowa",
      "lęk po porodzie",
      "smutek po porodzie",
      "płacz mamy",
      "psychoza poporodowa"
    ],
    "steps": [
      "Powiedz zaufanej osobie, jak wyglądał Twój dzień. Konkret w rodzaju „boję się zostać sama, proszę zostań ze mną i pomóż mi zadzwonić do poradni” ułatwia uzyskanie wsparcia.",
      "Gdy smutek lub lęk utrudniają codzienne funkcjonowanie, skontaktuj się z położną, lekarzem POZ lub psychiatrą. Zrób to także, jeśli pogorszenie nastroju utrzymuje się około dwóch tygodni albo pojawia się w kolejnych miesiącach. Przy silnych objawach szukaj pomocy od razu.",
      "Osoba bliska może umówić wizytę, towarzyszyć w rozmowie i przejąć część opieki. Drugi rodzic także może doświadczać długotrwałego obniżenia nastroju i potrzebować własnej konsultacji."
    ],
    "alert": "Nagłe splątanie, słyszenie głosów lub przekonania oderwane od rzeczywistości po porodzie wymagają natychmiastowej oceny medycznej. Przy bezpośrednim zagrożeniu bezpieczeństwa mamy lub dziecka wezwij pogotowie. Poproś dorosłą osobę, by została z mamą i zapewniła dziecku opiekę.",
    "source": "https://pacjent.gov.pl/jak-zyc-z-choroba/mloda-matka-w-depresji",
    "sourceLabel": "Pacjent.gov.pl · depresja poporodowa i baby blues",
    "extraSources": [
      {
        "label": "NHS · rozpoznawanie psychozy poporodowej",
        "url": "https://www.nhs.uk/mental-health/conditions/post-partum-psychosis/"
      }
    ]
  },
  {
    "section": "mother",
    "id": "bliskosc-po-porodzie",
    "title": "Bliskość, współżycie i planowanie kolejnej ciąży",
    "intro": "Możecie wracać do bliskości w tempie wygodnym dla obojga. Gojenie, zmęczenie i suchość pochwy wpływają na to, co sprawia przyjemność.",
    "keywords": [
      "seks po porodzie",
      "współżycie po porodzie",
      "antykoncepcja po porodzie",
      "suchość pochwy",
      "bliskość po porodzie"
    ],
    "steps": [
      "Powiedz, jakiego dotyku teraz potrzebujesz. Przytulenie, masaż lub chwila we dwoje mogą być wystarczające. Jeśli zespół zalecił czasowe ograniczenia z powodu gojenia, uwzględnij je.",
      "Gdy chcesz wrócić do współżycia, zacznij delikatnie. Przy suchości może pomóc lubrykant na bazie wody. Jeśli pojawia się ból, przerwij i porozmawiaj o tym z partnerem.",
      "Płodność może wrócić już około trzech tygodni po porodzie, również przy karmieniu piersią i przed pierwszą miesiączką. Jeśli planujecie odłożyć kolejną ciążę, omów antykoncepcję z lekarzem lub położną odpowiednio wcześnie."
    ],
    "alert": "Ból, który nawraca podczas prób współżycia, jest powodem do konsultacji z ginekologiem. Opisz, czy czujesz ból przy wejściu do pochwy, głębiej, czy w okolicy blizny.",
    "source": "https://www.nhs.uk/baby/support-and-services/sex-and-contraception-after-birth/",
    "sourceLabel": "NHS · współżycie i antykoncepcja po narodzinach",
    "extraSources": [
      {
        "label": "NHS · gojenie krocza i ból podczas współżycia",
        "url": "https://www.nhs.uk/pregnancy/labour-and-birth/episiotomy-and-perineal-tears/"
      }
    ]
  },
  {
    "section": "mother",
    "id": "pilna-pomoc-dla-mamy",
    "title": "Kiedy mama potrzebuje pilnej pomocy?",
    "intro": "Poważne powikłania mogą zacząć się również po powrocie ze szpitala. Kontaktując się z personelem, od razu powiedz, że jesteś po porodzie i kiedy urodziłaś.",
    "keywords": [
      "objawy alarmowe mamy",
      "gorączka w połogu",
      "duszność po porodzie",
      "ból głowy po porodzie",
      "obrzęk łydki po porodzie",
      "zagrożenie po porodzie"
    ],
    "steps": [
      "Nagła duszność, ból w klatce piersiowej, drgawki, utrata przytomności lub gwałtowne obfite krwawienie to wskazania do natychmiastowego wezwania pogotowia. Dzwoń pod 112 lub 999.",
      "Nagły, wyjątkowo silny ból głowy, zwłaszcza z zaburzeniami widzenia, wymaga natychmiastowej oceny. Przy gwałtownym początku lub ciężkich objawach wezwij pogotowie.",
      "Temperatura 38°C lub wyższa, utrzymujący się silny ból brzucha albo bolesny jednostronny obrzęk nogi wymagają pilnej pomocy medycznej. Nie odkładaj kontaktu do planowanej wizyty po połogu.",
      "Osoba bliska może zostać z mamą, zaopiekować się dzieckiem i przygotować wypis. Przy zgłoszeniu podaj adres, najważniejszy objaw i czas od jego początku, a następnie postępuj zgodnie z instrukcjami dyspozytora."
    ],
    "alert": "Jeżeli stan szybko się pogarsza lub występują objawy zagrożenia życia, dzwoń pod 112 lub 999 również wtedy, gdy nie masz przy sobie wypisu.",
    "source": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html",
    "sourceLabel": "CDC · objawy wymagające pilnej oceny w ciąży i po porodzie",
    "extraSources": [
      {
        "label": "Pacjent.gov.pl · wezwanie pogotowia w Polsce",
        "url": "https://pacjent.gov.pl/pogotowie-i-numer-alarmowy"
      }
    ]
  },
  {
    id: 'wypis-noworodka', section: 'first',
    title: 'Co ustalić przed powrotem z dzieckiem do domu?',
    intro: 'Zanim wyjedziecie ze szpitala, poproś osobę wypisującą o przejrzenie zaleceń razem z Tobą. Drugiemu opiekunowi powierz zapisanie terminów i telefonów.',
    keywords: ['wypis noworodka', 'wyjście ze szpitala z dzieckiem', 'karta informacyjna', 'książeczka zdrowia dziecka', 'pierwsza wizyta u pediatry', 'powrót z noworodkiem'],
    steps: [
      'Spakuj kartę informacyjną dziecka i książeczkę zdrowia. Odszukajcie wpisy o badaniach, szczepieniach i masie ciała przy wypisie. Przy każdym badaniu do powtórzenia zapisz, kto je wykona i kiedy.',
      'Sprawdź, czy oddział ma właściwy adres pobytu, numer kontaktowy i dane wybranej placówki POZ. Zadzwoń do przychodni, aby ustalić opiekę położnej i pierwsze badanie lekarskie dziecka.',
      'Na spotkanie z położną przygotuj wypis i pytania z pierwszej doby w domu. Możesz poprosić, aby obejrzała całe karmienie, pokazała pielęgnację pępka i wyjaśniła zalecenia z oddziału.',
      'Jeśli dziecko urodziło się przedwcześnie lub wymaga dodatkowych kontroli, przepisz z wypisu daty do kalendarza. Zanim wyjdziesz, dowiedz się, gdzie zadzwonić w razie trudności z karmieniem lub pogorszenia stanu.'
    ],
    alert: 'Jeśli nikt nie kontaktuje się w sprawie patronażu, skontaktuj się z wybraną położną. Pierwsza wizyta powinna odbyć się w ciągu 48 godzin od chwili otrzymania przez nią zgłoszenia urodzenia dziecka lub wypisu mamy ze szpitala po porodzie. Do tego terminu nie wlicza się sobót, niedziel ani dni ustawowo wolnych od pracy.',
    source: 'https://nawigatorpacjenta.rpp.gov.pl/nawigator/porady-dla-rodzicow/kiedy-w-rodzinie-pojawia-sie-noworodek-porady-na-pierwsze-dni/',
    sourceLabel: 'Rzecznik Praw Pacjenta · organizacja opieki po wypisie',
    extraSources: [{label:'Ministerstwo Zdrowia · termin pierwszej wizyty, część XV ust. 7 standardu',url:'https://dziennikustaw.gov.pl/DU/2026/1140'}]
  },
  {
    id: 'badanie-z-pietki', section: 'first',
    title: 'Badanie z piętki. Co sprawdzić w książeczce?',
    intro: 'Kilka kropli krwi pobranych na specjalną bibułę pomaga wcześnie wykryć wybrane choroby wrodzone. Dziecko z jedną z takich chorób może początkowo wyglądać zdrowo.',
    keywords: ['badanie z piętki', 'krew z pięty', 'badania przesiewowe noworodka', 'bibuła', 'powtórzenie przesiewu', 'numer próbki'],
    steps: [
      'Przed wypisem poszukaj w książeczce zdrowia naklejki z numerem próbki i datą pobrania. Jeśli jej nie ma, zapytaj oddział, czy pobranie już się odbyło albo gdzie i kiedy jest zaplanowane.',
      'Sprawdź podany adres korespondencyjny i telefon. W serwisie Instytutu Matki i Dziecka można użyć numeru z naklejki, aby sprawdzić, czy próbka dotarła do laboratorium.',
      'Jeśli otrzymasz bibułę do kolejnego pobrania, przeczytaj instrukcję i od razu ustal pobranie z podaną placówką lub położną. Powtórka bywa potrzebna np. z powodu zbyt małej ilości krwi.'
    ],
    alert: 'Wezwanie do poradni specjalistycznej wymaga kontaktu w terminie wskazanym przez laboratorium, nawet gdy dziecko dobrze się czuje. Prawidłowy pierwszy wynik zwykle nie jest wysyłany rodzicom.',
    source: 'https://przesiew.imid.med.pl/badaniaprzesiewowe.html',
    sourceLabel: 'Instytut Matki i Dziecka · badania przesiewowe i sprawdzenie próbki',
    extraSources: [{label:'Instytut Matki i Dziecka · informator dla rodziców (PDF)',url:'https://przesiew.imid.med.pl/download/Ulotka_20240401_PL.pdf'}]
  },
  {
    id: 'przesiew-sluchu', section: 'first',
    title: 'Badanie słuchu. Co oznacza kolor wklejki?',
    intro: 'Oddział noworodkowy wpisuje wynik badania przesiewowego słuchu do dokumentacji dziecka. Kolor certyfikatu podpowiada rodzicom, czy trzeba zaplanować dalsze badanie.',
    keywords: ['badanie słuchu', 'przesiew słuchu', 'żółty certyfikat', 'niebieski certyfikat', 'audiolog', 'badanie uszu'],
    steps: [
      'Odszukaj wklejkę w książeczce dziecka. Niebieska oznacza prawidłowy wynik przesiewu. Żółta wskazuje potrzebę wykonania dalszej diagnostyki w ośrodku audiologicznym.',
      'Przy żółtej wklejce poproś o nazwę poradni i zalecany termin. Zadzwoń do placówki, ustal szczegóły i przygotuj książeczkę oraz wypis na badanie.',
      'Jeśli badanie nie odbyło się w szpitalu lub w książeczce nie ma wyniku, dowiedz się na oddziale, gdzie dokończyć przesiew. Jeśli później zaniepokoi Cię reakcja dziecka na głos, powiedz o tym lekarzowi.'
    ],
    alert: 'Żółta wklejka jest wskazaniem do sprawdzenia słuchu. Oznaczenie może wynikać także z czynników ryzyka. Umów wyznaczoną kontrolę również wtedy, gdy dziecko reaguje na niektóre dźwięki.',
    source: 'https://newsroom.wosp.org.pl/469828-ponad-8-milionow-dzieci-przebadanych-w-programie-badan-sluchu-wosp',
    sourceLabel: 'Fundacja WOŚP · Program Powszechnych Przesiewowych Badań Słuchu u Noworodków'
  },
  {
    id: 'pierwsze-szczepienia', section: 'first',
    title: 'Jak przygotować się do wizyty szczepiennej?',
    intro: 'W książeczce zdrowia sprawdzisz, które szczepienia dziecko już otrzymało. W poradni POZ ustalisz dalsze terminy i omówisz z lekarzem schemat odpowiedni dla dziecka.',
    keywords: ['pierwsze szczepienia', 'szczepienie niemowlęcia', 'wizyta szczepienna', 'kalendarz szczepień', 'książeczka szczepień', 'pytania przed szczepieniem'],
    steps: [
      'Umów termin w punkcie szczepień. Zapytaj, jakie szczepienia przewidziano na tę wizytę, które preparaty zapewnia przychodnia i czy wybrany wariant oznacza dodatkowy koszt.',
      'Zabierz książeczkę zdrowia, wypis, pieluszkę i ubranie, które łatwo rozpiąć. Spisz leki dziecka, dotychczasowe reakcje po szczepieniach oraz pytania do lekarza.',
      'Powiedz lekarzowi o niedawnych chorobach, aktualnych objawach i indywidualnych zaleceniach z oddziału. Przed wyjściem zapytaj o spodziewane reakcje, postępowanie w domu i termin następnej dawki.'
    ],
    alert: 'Po podaniu szczepionki pozostań z dzieckiem w placówce przez czas wskazany przez personel. Nagłe trudności z oddychaniem lub utrata przytomności wymagają natychmiastowej pomocy.',
    source: 'https://szczepienia.pzh.gov.pl/faq/jak-przygotowac-sie-do-pierwszej-wizyty-zwiazanej-ze-szczepieniem-dziecka/',
    sourceLabel: 'NIZP PZH – PIB · pierwsza wizyta szczepienna',
    extraSources: [{label:'NIZP PZH – PIB · przewodnik dla rodziców małych dzieci (PDF)',url:'https://szczepienia.pzh.gov.pl/wp-content/uploads/2022/01/Przewodnik-po-szczepieniach-ochronnych-dla-rodzicow-malych-dzieci-FINAL.pdf'}]
  },
  {
    id: 'zoltaczka-noworodka', section: 'first',
    title: 'Co zrobić, gdy skóra lub oczy żółkną?',
    intro: 'U wielu noworodków w pierwszych dniach pojawia się żółtawe zabarwienie. O tym, czy dziecko wymaga leczenia, decydują m.in. wiek w godzinach i poziom bilirubiny.',
    keywords: ['żółtaczka', 'żółte oczy', 'żółta skóra', 'zażółcenie', 'bilirubina', 'żółte białka oczu'],
    steps: [
      'Spójrz na dziecko w jasnym świetle. Przy ciemniejszej karnacji zmianę koloru łatwiej zauważyć na białkach oczu i wewnątrz ust. Zapisz, kiedy po raz pierwszy ją zauważasz.',
      'Jeśli zażółcenie pojawiło się w pierwszych 24 godzinach życia, dziecko wymaga natychmiastowej oceny w szpitalu. Na oddziale przywołaj personel. W domu zgłoś się po pilną pomoc szpitalną.',
      'Jeśli po pierwszej dobie zauważysz nową lub nasilającą się żółtaczkę, jeszcze tego dnia skontaktuj się z lekarzem lub położną. Powiedz, jak dziecko je, czy łatwo je obudzić i jak często moczy pieluszki.'
    ],
    alert: 'Zażółcenie połączone z odmową karmienia, trudnością w wybudzeniu, wiotkością lub trudnościami w oddychaniu wymaga natychmiastowej pomocy medycznej. Przy zaburzeniach oddychania lub braku reakcji dzwoń pod 112 albo 999 w Polsce.',
    source: 'https://www.nhs.uk/conditions/jaundice-in-babies/',
    sourceLabel: 'NHS · rozpoznawanie żółtaczki i objawy wymagające pomocy'
  },
  {
    id: 'pepek-noworodka', section: 'home',
    title: 'Jak pielęgnować pępek przed odpadnięciem kikuta?',
    intro: 'Pozostałość pępowiny stopniowo wysycha i odpada samoistnie. Przy przewijaniu możesz obejrzeć skórę wokół pępka i zadbać, aby kikut pozostawał czysty i suchy.',
    keywords: ['pępek', 'pępka', 'pępowina', 'kikut', 'kikut pępowiny', 'rana pępka', 'pielęgnacja pępka'],
    steps: [
      'Umyj ręce przed przewinięciem. Ułóż górny brzeg pieluszki poniżej kikuta, aby nic go nie ocierało i żeby okolicę łatwiej było utrzymać w suchości.',
      'Gdy kikut się zabrudzi, delikatnie umyj go czystą wodą i osusz przez przykładanie czystego materiału. Pozostaw go odsłoniętego na czas osuszania.',
      'Pozwól, aby odpadł sam, nawet kiedy trzyma się już tylko przy brzegu. Po odpadnięciu nadal delikatnie myj i osuszaj pępek do wygojenia.'
    ],
    alert: 'Rozszerzające się zaczerwienienie, ocieplenie lub bolesność skóry, ropna wydzielina albo nieprzyjemny zapach wymagają pilnego kontaktu z lekarzem. Jeśli dziecko ma również gorączkę lub trudno je obudzić, szukaj pomocy od razu.',
    source: 'https://www.childrens.health.qld.gov.au/health-a-to-z/caring-for-your-babys-umbilical-cord-stump-and-belly-button',
    sourceLabel: 'Children’s Health Queensland · pielęgnacja pępka noworodka'
  },
  {
    id: 'skora-pod-pieluszka', section: 'home',
    title: 'Jak przewijać dziecko i łagodzić podrażnienie skóry?',
    intro: 'Wilgoć i tarcie łatwo podrażniają skórę pod pieluszką. Przygotowanie czystej pieluchy, wody i ręcznika przed przewijaniem pozwoli Ci cały czas zostać przy dziecku.',
    keywords: ['odparzenie', 'odparzenia', 'pieluszkowe zapalenie skóry', 'zmiana pieluchy', 'przewijanie', 'zaczerwieniona pupa'],
    steps: [
      'Rozłóż matę lub ręcznik na podłodze. Zmieniaj mokrą lub zabrudzoną pieluchę możliwie szybko, a po zmianie umyj ręce.',
      'Przemyj okolice pieluszki wodą lub użyj bezzapachowych chusteczek bez alkoholu. Delikatnie osusz także fałdki skóry. Jeśli możesz, zostaw dziecko na krótką chwilę bez pieluszki pod swoją opieką.',
      'Dopasuj pieluszkę tak, aby nie uciskała i nie ocierała. Przy podrażnieniu położna lub farmaceuta pomoże dobrać krem ochronny do stosowania cienką warstwą. Pomiń talk i pachnące kosmetyki.'
    ],
    alert: 'Skontaktuj się z lekarzem, gdy zmiany się rozszerzają, dziecko wyraźnie cierpi albo skóra mimo pielęgnacji się nie poprawia. Gorączka u noworodka wymaga pilnej oceny.',
    source: 'https://www.nhs.uk/baby/caring-for-a-newborn/nappy-rash/',
    sourceLabel: 'NHS · podrażnienie skóry pod pieluszką',
    extraSources: [{label:'NHS · zmiana pieluszki krok po kroku',url:'https://www.nhs.uk/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/'}]
  },
  {
    id: 'podroz-fotelik', section: 'home',
    title: 'Jak przygotować pierwszą podróż samochodem?',
    intro: 'Przed odbiorem ze szpitala przećwicz montaż fotelika w swoim aucie. Model powinien być przeznaczony dla noworodka i pasować do jego aktualnego wzrostu oraz masy.',
    keywords: ['fotelik', 'samochód z noworodkiem', 'pierwsza podróż', 'fotelik samochodowy', 'nosidełko samochodowe', 'pasy w foteliku'],
    steps: [
      'Przeczytaj instrukcje fotelika i samochodu. Zamontuj fotelik dla niemowlęcia tyłem do kierunku jazdy, najlepiej na odpowiednim miejscu z tyłu. Mocowanie i pochylenie ustaw zgodnie z instrukcją producenta.',
      'Ubierz dziecko w cienkie warstwy. Sprawdź, czy pasy leżą płasko i są dopasowane do ciała. W chłodzie przykryj zapięte dziecko kocykiem, pozostawiając twarz odkrytą.',
      'Po dojeździe wyjmij dziecko z fotelika. Jeśli śpi, przełóż je na plecy do łóżeczka lub innego przeznaczonego do snu miejsca z twardym, płaskim materacem.'
    ],
    alert: 'Fotelik tyłem do kierunku jazdy na przednim siedzeniu wymaga wyłączenia przedniej poduszki powietrznej pasażera. Aktywna poduszka może uderzyć w fotelik przy zderzeniu.',
    source: 'https://www.nhs.uk/baby/first-aid-and-safety/safety/choosing-a-baby-car-seat/',
    sourceLabel: 'NHS · dobór i mocowanie fotelika',
    extraSources: [{label:'Prawo o ruchu drogowym · art. 45 ust. 2 pkt 4 (PDF)',url:'https://eli.gov.pl/api/acts/DU/2024/1251/text/U/D20241251Lj.pdf'},{label:'Amerykańska Akademia Pediatrii · foteliki dla niemowląt',url:'https://www.healthychildren.org/English/safety-prevention/on-the-go/Pages/rear-facing-car-seats-for-infants-toddlers.aspx'}]
  },
  {
    id: 'zabawa-na-brzuszku', section: 'home',
    title: 'Jak zacząć zabawę na brzuszku?',
    intro: 'Krótkie chwile na brzuchu w czasie czuwania pomagają ćwiczyć mięśnie szyi, pleców i ramion. Pierwsze próby możesz zacząć od kontaktu na własnej klatce piersiowej.',
    keywords: ['zabawa na brzuszku', 'tummy time', 'leżenie na brzuchu w dzień', 'ćwiczenia na brzuszku', 'podnoszenie główki', 'zabawy z noworodkiem'],
    steps: [
      'Wybierz moment, gdy dziecko jest spokojne i obudzone, a Ty czujesz się przytomnie. Ułóż je na swojej klatce piersiowej i podtrzymuj. Przez cały czas miej w polu widzenia jego twarz.',
      'Kiedy dziecko oswoi się z tą pozycją, połóż je na płaskiej macie na podłodze. Usiądź lub połóż się naprzeciwko, mów do niego i pozwól mu patrzeć na Twoją twarz.',
      'Zacznij od krótkich prób. Gdy dziecko się męczy lub protestuje, weź je na ręce. Czas można stopniowo wydłużać w kolejnych dniach.'
    ],
    alert: 'Przy zabawie na brzuchu dziecko potrzebuje czuwającego opiekuna tuż obok. Gdy zaczyna zasypiać albo Ty czujesz senność, przełóż dziecko na plecy do jego łóżeczka.',
    source: 'https://www.nhs.uk/best-start-in-life/baby/baby-moves/',
    sourceLabel: 'NHS · zabawa na brzuchu od pierwszych tygodni'
  },
  {
    id: 'odwiedziny-noworodka', section: 'home',
    title: 'Jak umówić odwiedziny u noworodka?',
    intro: 'Przed wizytą bliskich możesz ustalić kilka prostych zasad. Ma to szczególne znaczenie w pierwszych tygodniach, kiedy nawet zwykłe dla dorosłego zakażenie może ciężej przebiegać u dziecka.',
    keywords: ['odwiedziny', 'goście', 'odwiedziny noworodka', 'przeziębieni goście', 'opryszczka na ustach', 'całowanie noworodka'],
    steps: [
      'Poproś gości z kaszlem, katarem lub gorączką, aby przełożyli spotkanie. Starszemu rodzeństwu pokaż, jak umyć ręce po powrocie do domu, zanim dotknie malucha.',
      'Osoby biorące dziecko na ręce powinny najpierw umyć dłonie. Poproś odwiedzających, by powstrzymali się od całowania dziecka, szczególnie w usta, nos i okolice oczu.',
      'Przy aktywnej lub niedawnej opryszczce na ustach unikaj całowania noworodka. Jeśli opiekun musi zajmować się dzieckiem, powinien zakryć zmiany, gdy to możliwe, i szczególnie dokładnie myć ręce.'
    ],
    alert: 'Jeśli po kontakcie z opryszczką niemowlę słabiej je, jest rozdrażnione albo pojawią się pęcherzyki na skórze, koło oczu lub w ustach, szukaj pilnej pomocy lekarskiej. Powiedz lekarzowi o kontakcie z chorą osobą.',
    source: 'https://www.gov.pl/web/gis/zakazenia-wywolane-rsv',
    sourceLabel: 'Główny Inspektorat Sanitarny · zapobieganie zakażeniom RSV',
    extraSources: [{label:'NHS · jak chronić noworodka przed opryszczką',url:'https://www.nhs.uk/conditions/neonatal-herpes/'}]
  },
  {
    "id": "lagodzenie-bolu-porodowego",
    "section": "before",
    "title": "Co może pomóc, kiedy skurcze stają się bolesne?",
    "intro": "Przed porodem warto poznać kilka metod łagodzenia bólu i sprawdzić, które oferuje wybrany szpital. W czasie porodu możesz powiedzieć położnej, co przynosi ulgę, i poprosić o zmianę sposobu postępowania.",
    "keywords": [
      "ból porodowy",
      "bolesne skurcze",
      "znieczulenie zewnątrzoponowe",
      "gaz rozweselający",
      "łagodzenie bólu",
      "anestezjolog"
    ],
    "steps": [
      "Zastanów się, co pomaga Ci rozluźnić się przy bólu. Podczas skurczu możesz spróbować spokojnego wydechu, zmiany pozycji lub masażu dolnej części pleców. Pokaż osobie towarzyszącej, jakiego dotyku chcesz.",
      "Jeśli rozważasz gaz do wdychania, zapytaj położną, kiedy przyłożyć ustnik. Mieszanka podtlenku azotu i tlenu działa szybko i u części osób zmniejsza odczuwanie skurczów. Zgłoś zawroty głowy lub nudności.",
      "Przy znieczuleniu zewnątrzoponowym anestezjolog umieszcza cienki cewnik w dolnej części pleców. Lek można przez niego podawać w czasie porodu. Ulga narasta stopniowo. Zapytaj, jak będzie kontrolowane ciśnienie i czy będziesz potrzebować pomocy przy zmianie pozycji.",
      "Gdy mimo znieczulenia boli głównie jedna strona lub ulga jest niewielka, pokaż położnej miejsce bólu. Zespół może sprawdzić działanie cewnika i dobrać dalszą pomoc."
    ],
    "alert": "Jeśli przyjmujesz leki przeciwkrzepliwe albo masz zaburzenia krzepnięcia, omów znieczulenie z anestezjologiem już przed porodem. Powiedz zespołowi, jaki lek bierzesz i kiedy była ostatnia dawka.",
    "source": "https://www.labourpains.org/during-labour/pain-relief-comparisons",
    "sourceLabel": "Obstetric Anaesthetists’ Association · porównanie metod łagodzenia bólu",
    "extraSources": [
      {
        "label": "OAA · pytania o łagodzenie bólu porodowego, poradnik po polsku (PDF)",
        "url": "https://www.labourpains.org/downloads/translated-content/polish/faqs---pain-relief-in-labour---polish.pdf"
      },
      {
        "label": "OAA · jak działa znieczulenie zewnątrzoponowe",
        "url": "https://www.labourpains.org/during-labour/epidural-advice-and-information"
      }
    ]
  },
  {
    "id": "rozmowa-o-indukcji",
    "section": "before",
    "title": "Lekarz proponuje indukcję porodu. O co zapytać?",
    "intro": "Indukcja to medyczne rozpoczęcie porodu przed samoistnym wystąpieniem skurczów porodowych. Wybór metody zależy m.in. od powodu wywołania porodu, stanu szyjki macicy, zdrowia dziecka i przebiegu poprzednich porodów.",
    "keywords": [
      "indukcja porodu",
      "wywołanie porodu",
      "balonik",
      "oksytocyna",
      "preindukcja",
      "przebicie pęcherza płodowego"
    ],
    "steps": [
      "Poproś o wyjaśnienie, dlaczego zespół proponuje poród właśnie teraz. Zapytaj, jakie korzyści i ryzyko wiążą się w Twojej sytuacji z indukcją oraz z dalszym czekaniem, jeśli można je rozważyć.",
      "Dowiedz się, czy szyjkę trzeba najpierw przygotować. Możliwy jest m.in. cewnik z balonikiem lub lek. Poinformuj o wcześniejszym cesarskim cięciu lub innej operacji macicy, bo może to zmienić dobór metody.",
      "Ustal, co wydarzy się później. Gdy szyjka jest odpowiednio przygotowana, zespół może zaproponować przebicie pęcherza płodowego albo kroplówkę z oksytocyną. Zapytaj, jak będzie obserwować skurcze i tętno dziecka oraz jakie metody uśmierzania bólu będą dostępne.",
      "Przed każdym kolejnym etapem możesz zapytać, co zmieniło się od ostatniego badania i jakie są teraz możliwości. Przygotowanie szyjki i rozwinięcie się porodu mogą zająć więcej niż dzień."
    ],
    "alert": "Jeśli czekasz w domu na przyjęcie i dziecko rusza się wyraźnie mniej niż zwykle, wystąpiło krwawienie lub odeszły wody, od razu skontaktuj się z porodówką. Dotyczy to także sytuacji, gdy przyjęcie jest już zaplanowane.",
    "source": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/induction-labour-iol",
    "sourceLabel": "University College London Hospitals · indukcja i pytania przed podjęciem decyzji",
    "extraSources": [
      {
        "label": "Giles, Prusinski i Wallace · Maternal Newborn Nursing, rozdz. 19.2 o interwencjach porodowych",
        "url": "https://openstax.org/books/maternal-newborn-nursing/pages/19-2-medical-interventions-during-labor"
      }
    ]
  },
  {
    "id": "kontakt-skora-do-skory",
    "section": "first",
    "title": "Jak bezpiecznie ułożyć dziecko skóra do skóry?",
    "intro": "W bezpośrednim kontakcie z klatką piersiową czuwającego rodzica noworodkowi łatwiej utrzymać ciepło. Możesz poprosić położną, by pomogła Wam się ułożyć i pokazała, po czym poznać, że dziecko swobodnie oddycha.",
    "keywords": [
      "skóra do skóry",
      "kangurowanie",
      "kontakt po porodzie",
      "przytulić noworodka",
      "kontakt z tatą"
    ],
    "steps": [
      "Usiądź z podpartymi plecami w pozycji półleżącej. Ułóż dziecko wysoko na odsłoniętej klatce piersiowej, brzuszkiem do siebie. Podeprzyj tułów i pomóż mu utrzymać stabilną pozycję.",
      "Skieruj twarz dziecka lekko w bok. Powinna pozostawać widoczna, nos i usta odsłonięte, a broda odsunięta od klatki piersiowej. Okryj plecy dziecka, pozostawiając twarz ponad kocem.",
      "Obserwuj ruchy oddechowe, kolor skóry i ułożenie główki. Jeśli jesteś po operacji lub dziecko ma przewody albo wymaga wspomagania oddechu, poproś personel o pomoc przy przenoszeniu i układaniu.",
      "Kiedy zaczynasz zasypiać, oddaj dziecko przytomnemu i czuwającemu opiekunowi albo odłóż na plecy do jego własnego łóżeczka, na twardy, płaski materac."
    ],
    "alert": "Jeżeli dziecko wiotczeje, sinieje lub nie oddycha prawidłowo, natychmiast wezwij personel. W domu dzwoń pod 112 lub 999 i wykonuj polecenia dyspozytora.",
    "source": "https://cps.ca/en/documents/position/skin-to-skin-care",
    "sourceLabel": "Altit, Hamilton i O’Brien · stanowisko Canadian Paediatric Society, Paediatrics & Child Health (2024)",
    "extraSources": [
      {
        "label": "UNICEF UK Baby Friendly Initiative · pozycja dziecka i obserwacja oddechu",
        "url": "https://www.unicef.org.uk/babyfriendly/baby-friendly-resources/implementing-standards-resources/skin-to-skin-contact/"
      }
    ]
  },
  {
    "id": "pecherz-po-porodzie",
    "section": "mother",
    "title": "Po porodzie trudno mi oddać mocz. Kiedy zgłosić to położnej?",
    "intro": "Po porodzie lub usunięciu cewnika możesz przez pewien czas słabiej czuć napełnianie pęcherza. Nawet jeśli udaje się oddać kilka kropel, w pęcherzu może pozostawać mocz.",
    "keywords": [
      "pęcherz po porodzie",
      "trudno oddać mocz",
      "nie mogę się wysikać",
      "zatrzymanie moczu",
      "po usunięciu cewnika"
    ],
    "steps": [
      "Na oddziale ustal z położną, czy pierwszą porcję moczu trzeba zmierzyć. Powiedz, kiedy usunięto cewnik i czy czujesz parcie. Spokojnie usiądź na toalecie, oprzyj stopy i daj sobie chwilę prywatności.",
      "Pij zgodnie z pragnieniem i zaleceniami personelu. Wypicie naraz dużej ilości wody może nadmiernie wypełnić pęcherz, zwłaszcza gdy czucie po znieczuleniu jeszcze nie wróciło.",
      "Powiedz położnej od razu, jeśli próba jest bolesna, oddajesz tylko niewielkie ilości lub czujesz pełność podbrzusza po wizycie w toalecie. Jeśli po około czterech godzinach od porodu lub usunięcia cewnika nadal nie czujesz parcia albo nie udało się oddać moczu, zgłoś to, nawet gdy nic nie boli.",
      "Położna może zmierzyć ilość oddanego moczu lub sprawdzić aparatem USG, ile zostało go w pęcherzu. Przy większym zaleganiu zespół omówi z Tobą opróżnienie pęcherza cewnikiem i dalszą kontrolę."
    ],
    "alert": "Jeśli po powrocie do domu nie możesz oddać moczu, zwłaszcza przy narastającym bólu lub rozpieraniu podbrzusza, pilnie skontaktuj się z oddziałem położniczym lub zgłoś się po pomoc lekarską.",
    "source": "https://www.cuh.nhs.uk/patient-information/urinary-retention-following-childbirth/",
    "sourceLabel": "Cambridge University Hospitals · zatrzymanie moczu po porodzie",
    "extraSources": [
      {
        "label": "University College London Hospitals · opieka nad pęcherzem i jelitami po porodzie",
        "url": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/advice-and-exercise-following-childbirth"
      }
    ]
  },
  {
    "id": "wyproznienie-w-pologu",
    "section": "mother",
    "title": "Pierwsze wypróżnienie po porodzie i zaparcia",
    "intro": "Bolesne krocze, obawa o szwy, mniej ruchu i niektóre leki przeciwbólowe mogą utrudniać wypróżnienie. Możesz zadbać o miękki stolec i pozycję, w której łatwiej rozluźnić mięśnie.",
    "keywords": [
      "zaparcia po porodzie",
      "pierwsze wypróżnienie mamy",
      "hemoroidy po porodzie",
      "bolesne wypróżnienie w połogu",
      "jelita po porodzie"
    ],
    "steps": [
      "Gdy poczujesz potrzebę, poproś bliską osobę o przejęcie dziecka na kilka minut. Usiądź wygodnie i oprzyj stopy na niskim, stabilnym podnóżku, tak aby kolana znalazły się trochę wyżej niż biodra.",
      "Pochyl tułów lekko do przodu, oprzyj przedramiona na udach i oddychaj spokojnie. Możesz przyłożyć do bolesnego krocza czystą podpaskę dla podparcia. Unikaj długiego, silnego parcia.",
      "W ciągu dnia sięgaj po wodę, warzywa, owoce i produkty pełnoziarniste. W miarę sił przejdź się po domu. Jeżeli otrzymałaś zalecenia po operacji lub rozległym pęknięciu krocza, uwzględnij je przy wyborze posiłków oraz ruchu.",
      "Jeśli twardy stolec nadal boli albo lęk o szwy utrudnia wizytę w toalecie, zapytaj położną lub lekarza o środek zmiękczający stolec odpowiedni dla Ciebie, także przy karmieniu piersią."
    ],
    "alert": "Silny lub narastający ból brzucha, szczególnie z wymiotami albo znacznym wzdęciem i zatrzymaniem gazów, wymaga pilnej oceny lekarskiej. Po operacji brzucha zgłoś te objawy również zespołowi, który prowadził leczenie.",
    "source": "https://openstax.org/books/maternal-newborn-nursing/pages/20-3-nursing-care-during-the-postpartum-period",
    "sourceLabel": "Giles, Prusinski i Wallace · Maternal Newborn Nursing, rozdz. 20.3 o połogu (OpenStax)",
    "extraSources": [
      {
        "label": "University College London Hospitals · pozycja przy wypróżnieniu, także po założeniu szwów",
        "url": "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/advice-and-exercise-following-childbirth"
      },
      {
        "label": "Cleveland Clinic · objawy brzuszne wymagające pilnej oceny",
        "url": "https://my.clevelandclinic.org/health/diseases/bowel-obstruction"
      }
    ]
  },
  {
    "id": "rodzic-na-neonatologii",
    "section": "first",
    "title": "Co mogę robić przy dziecku na oddziale neonatologicznym?",
    "intro": "Przy inkubatorze rodzic może początkowo czuć się zagubiony. Nawet gdy zespół zajmuje się oddechem, lekami i karmieniem, możesz poznawać sygnały dziecka i stopniowo włączać się w codzienną opiekę.",
    "keywords": [
      "inkubator",
      "oddział neonatologiczny",
      "wcześniak w szpitalu",
      "intensywna terapia noworodka",
      "obchód na neonatologii"
    ],
    "steps": [
      "Podczas pierwszej wizyty ustal, kto dziś opiekuje się dzieckiem, jak przygotować ręce przed dotykiem i kiedy możesz porozmawiać z neonatologiem. Jeśli musisz wyjść, zapytaj też o sposób uzyskiwania informacji z domu.",
      "Poproś pielęgniarkę o pokazanie jednej rzeczy, którą możesz dziś zrobić. Zależnie od stanu dziecka może to być spokojny dotyk, zmiana pieluszki albo pomoc przy ubieraniu. Pierwszą próbę wykonajcie razem.",
      "Przed obchodem zapisz dwa pytania, np. „Co zmieniło się w oddychaniu od wczoraj?” i „Po czym poznamy, że można spróbować karmienia przy piersi?”. Poproś o wyjaśnienie skrótów i zapisz, co jest planowane na dziś.",
      "Wskaż personelowi zachowania, które zauważasz u swojego dziecka. Jeśli chcesz towarzyszyć mu przy badaniu albo wziąć je na klatkę piersiową, ustal z zespołem, kiedy będzie to możliwe i kto pomoże przenieść dziecko."
    ],
    "alert": "O nagłej zmianie koloru, oddechu lub reakcji dziecka od razu powiedz personelowi. Jeśli włącza się alarm albo przesunął się przewód, przywołaj pielęgniarkę i pozostaw jej obsługę sprzętu.",
    "source": "https://www.bliss.org.uk/parents/in-hospital/being-involved-in-your-babys-care-and-procedures/working-with-the-neonatal-care-team",
    "sourceLabel": "Bliss · współpraca rodzica z zespołem oddziału neonatologicznego",
    "extraSources": [
      {
        "label": "American Academy of Pediatrics · fragment książki Newborn Intensive Care: What Every Parent Needs to Know, wyd. 3",
        "url": "https://www.healthychildren.org/English/ages-stages/baby/preemie/pages/How-You-Can-Participate-in-the-Care-of-Your-Baby-in-the-NICU.aspx"
      },
      {
        "label": "Canadian Paediatric Society · kangurowanie noworodków urodzonych przedwcześnie",
        "url": "https://cps.ca/en/documents/position/skin-to-skin-care"
      },
      {
        "label": "Bliss · higiena rąk, kontakt z oddziałem i organizacja wizyt",
        "url": "https://www.bliss.org.uk/parents/in-hospital/about-neonatal-care/routines-on-the-unit"
      }
    ]
  },
  {
    "id": "kontrola-po-cukrzycy-ciazowej",
    "section": "mother",
    "title": "Jak zaplanować badania po cukrzycy ciążowej?",
    "intro": "U wielu mam po porodzie stężenie glukozy wraca do prawidłowych wartości. Przebyta cukrzyca ciążowa zwiększa jednak późniejsze ryzyko cukrzycy typu 2. Kontrola po połogu pomaga ustalić, czy nadal potrzebujesz leczenia.",
    "keywords": [
      "cukrzyca ciążowa po porodzie",
      "krzywa cukrowa",
      "OGTT po porodzie",
      "glukoza po ciąży",
      "diabetolog po porodzie"
    ],
    "steps": [
      "Przy wypisie sprawdź zalecenia dotyczące pomiarów glikemii i leków. Jeśli stosowałaś insulinę, poproś o zapisanie, co masz robić od dnia wypisu i z kim omówić wyniki. Zapotrzebowanie po porodzie może się zmienić.",
      "Umów z lekarzem doustny test tolerancji glukozy (OGTT z 75 g glukozy) między 6. a 12. tygodniem po porodzie. Laboratorium oznaczy glukozę we krwi na czczo i po dwóch godzinach od wypicia roztworu. Ustal z laboratorium sposób przygotowania i zaplanuj opiekę nad dzieckiem na czas badania.",
      "Pokaż wynik lekarzowi. Nawet przy prawidłowym wyniku zapisz w kalendarzu coroczne badanie przesiewowe. Przy planowaniu kolejnej ciąży powiedz lekarzowi o przebytej cukrzycy ciążowej i ustal termin ponownego OGTT."
    ],
    "alert": "Jeżeli domowe pomiary powtarzalnie wychodzą poza zakres ustalony przy wypisie lub pojawiają się niedocukrzenia podczas leczenia, skontaktuj się z prowadzącym wcześniej. Osoby z cukrzycą rozpoznaną przed ciążą potrzebują odrębnego planu leczenia po porodzie.",
    "source": "https://www.termedia.pl/Wytyczne-rozpoznawania-i-leczenia-cukrzycy-dla-lekarzy-rodzinnych-Polskiego-Towarzystwa-Medycyny-Rodzinnej-Kolegium-Lekarzy-Rodzinnych-w-Polsce-i-Polskiego-Towarzystwa-Diabetologicznego,98,47994,1,1.html",
    "sourceLabel": "Mastalerz-Migas i wsp. · wytyczne PTMR, KLRwP i PTD dla lekarzy rodzinnych, część 8.3 (2022)",
    "extraSources": [
      {
        "label": "Polskie Towarzystwo Diabetologiczne · zalecenia na 2026 r., rozdz. 24, Current Topics in Diabetes (PDF)",
        "url": "https://www.currenttopicsindiabetes.com/pdf-219306-137953?filename=Clinical-Recommendations-.pdf"
      }
    ]
  },
  {
    "id": "kontakt-twarza-w-twarz",
    "title": "Jak poznać, że niemowlę ma ochotę na kontakt?",
    "intro": "Już w pierwszych tygodniach spojrzenie, poruszenie ręką lub krótki dźwięk mogą rozpocząć chwilę wspólnej uwagi. Odpowiedzią może być Twój głos, uśmiech lub dotyk.",
    "section": "development",
    "keywords": [
      "więź",
      "twarzą w twarz",
      "kontakt z noworodkiem",
      "relacja",
      "sygnały dziecka",
      "zabawa z noworodkiem",
      "odwraca głowę"
    ],
    "steps": [
      "Wybierz chwilę spokojnego czuwania, np. po przewinięciu. Zbliż twarz tak, żeby maluch mógł Cię zobaczyć. Obserwuj, gdzie kieruje wzrok.",
      "Odpowiedz na to, co właśnie zrobił. Gdy patrzy na Twoją dłoń, pokaż ją i powiedz kilka słów. Gdy wyda dźwięk, możesz go powtórzyć.",
      "Zrób pauzę. Daj mu czas na własny ruch, spojrzenie lub dźwięk. Krótka wymiana też ma wartość.",
      "Jeśli odwraca głowę lub zaczyna marudzić, zrób przerwę. Spokojna chwila w ramionach może mu teraz bardziej odpowiadać."
    ],
    "alert": "Dzieci różnią się tym, jak długo chcą się bawić. Jeżeli stale martwi Cię, jak dziecko reaguje na twarz lub głos, opisz pediatrze konkretną sytuację.",
    "source": "https://developingchild.harvard.edu/resources/briefs/5-steps-for-brain-building-serve-and-return/",
    "sourceLabel": "Harvard University, Center on the Developing Child · jak odpowiadać na sygnały dziecka (ang.)",
    "extraSources": [
      {
        "label": "American Academy of Pediatrics · jak noworodek widzi twarz i reaguje na głos, fragment poradnika (ang.)",
        "url": "https://www.healthychildren.org/English/ages-stages/baby/Pages/How-Your-Newborn-Behaves.aspx"
      }
    ]
  },
  {
    "id": "pierwsze-rozmowy",
    "title": "Jak rozmawiać z dzieckiem, które jeszcze nie mówi?",
    "intro": "W pierwszych trzech miesiącach niemowlę może cichnąć przy znajomym głosie i odpowiadać samogłoskami. W kolejnych miesiącach dołączają nowe dźwięki, piski i śmiech. Możesz wykorzystać do rozmowy zwykłą chwilę ubierania.",
    "section": "development",
    "keywords": [
      "głużenie",
      "gaworzenie",
      "rozwój mowy",
      "dźwięki",
      "rozmowa z niemowlęciem",
      "mowa",
      "śpiewanie",
      "dwujęzyczność"
    ],
    "steps": [
      "Nazwij jedną rzecz, którą właśnie robisz, np. „Teraz zakładamy skarpetkę”. Mów w języku, w którym czujesz się swobodnie. W wielojęzycznej rodzinie każdy opiekun może używać swojego języka.",
      "Kiedy dziecko odpowie przeciągłym „aaa”, powtórz ten dźwięk. Poczekaj chwilę, zanim znów się odezwiesz. Do takiej wymiany nadaje się także śpiewana fraza.",
      "Obserwuj reakcje w spokojnym otoczeniu. Maluch może na moment ucichnąć, ożywić się albo spojrzeć w Twoją stronę.",
      "Przed wizytą zapisz przykład tego, co słyszysz, i kiedy się to zdarza. Taki opis ułatwia rozmowę o komunikacji i słuchu."
    ],
    "alert": "Jeśli dziecko wielokrotnie nie reaguje na dźwięki lub przestaje wydawać dźwięki, których już używało, zgłoś to pediatrze. W razie potrzeby lekarz skieruje dziecko na ocenę słuchu.",
    "source": "https://www.asha.org/public/developmental-milestones/communication-milestones-birth-to-1-year/",
    "sourceLabel": "American Speech-Language-Hearing Association · komunikacja w pierwszym roku (ang.)",
    "extraSources": [
      {
        "label": "Medycyna Praktyczna · etapy rozwoju mowy (po polsku)",
        "url": "https://www.mp.pl/pacjent/pediatria/prawidlowyrozwoj/rozwojfizyczny/52294,etapy-rozwoju-mowy"
      },
      {
        "label": "Ferjan Ramírez i wsp., PNAS, 2020 · badanie rozmów z dziećmi od 6. miesiąca (ang.)",
        "url": "https://doi.org/10.1073/pnas.1921653117"
      }
    ]
  },
  {
    "id": "czytanie-od-urodzenia",
    "title": "Co czytać niemowlęciu i jak zacząć?",
    "intro": "Czytanie można zacząć od urodzenia. Na początku dziecko słucha rytmu Twojego głosu. Z czasem do wspólnej zabawy dochodzą patrzenie na obrazek, dotykanie i sięganie po książeczkę.",
    "section": "development",
    "keywords": [
      "czytanie niemowlęciu",
      "książeczki",
      "książki",
      "głośne czytanie",
      "bajka",
      "obrazki"
    ],
    "steps": [
      "Usiądź tak, by wygodnie podtrzymywać dziecko. Możesz przeczytać jedną stronę albo opowiedzieć własnymi słowami, co widać na ilustracji.",
      "Jeśli wzrok dziecka zatrzyma się na obrazku, wskaż go i nazwij, np. „Kot ma długi ogon”. Poczekaj na spojrzenie, ruch albo odgłos i odpowiedz na niego.",
      "Wróćcie do ulubionej ilustracji tyle razy, ile chcecie. Kiedy dziecko odwraca się lub marudzi, odłóż książkę i spróbuj przy innej okazji.",
      "Połóż książeczkę w miejscu, gdzie zwykle razem odpoczywacie. Możesz czytać w języku najbliższym rodzinie, sięgać po biblioteczne książki lub pokazywać rodzinne zdjęcia i opowiadać o nich."
    ],
    "alert": "Długość lektury dopasuj do zainteresowania dziecka. Przy wcześniactwie lub pobycie na oddziale zapytaj personel, w jakiej chwili czytanie najlepiej pasuje do odpoczynku malucha.",
    "source": "https://publications.aap.org/pediatrics/article/154/6/e2024069090/199469/Literacy-Promotion-An-Essential-Component-of",
    "sourceLabel": "American Academy of Pediatrics, Pediatrics, 2024 · wspólne czytanie od urodzenia (ang.)",
    "extraSources": [
      {
        "label": "Fundacja Powszechnego Czytania · Książka na receptę (po polsku)",
        "url": "https://www.fpc.org.pl/nasze-projekty/ksiazkanarecepte/"
      },
      {
        "label": "Mendelsohn i wsp., Pediatrics, 2018 · badanie wspólnego czytania i zabawy (ang.)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5914489/"
      }
    ]
  },
  {
    "id": "wzrok-w-pierwszych-miesiacach",
    "title": "Co widzi noworodek i jak bawić się spojrzeniem?",
    "intro": "W pierwszych tygodniach noworodek najlepiej widzi z bliska, z odległości około 20–30 cm. Właśnie z takiej odległości często ogląda twarz osoby, która go trzyma.",
    "section": "development",
    "keywords": [
      "wzrok noworodka",
      "co widzi noworodek",
      "śledzi wzrokiem",
      "kontakt wzrokowy",
      "kontrast",
      "patrzy na twarz"
    ],
    "steps": [
      "Gdy dziecko czuwa, pokaż mu twarz z bliska. Daj mu chwilę na zatrzymanie spojrzenia.",
      "Pokaż pojedynczy wyraźny wzór, np. jasną kartkę z ciemnymi pasami. Zmieniaj po jednej rzeczy i zauważ, co przyciąga jego uwagę.",
      "Około trzeciego miesiąca wiele dzieci potrafi skupić wzrok na twarzy i podążać za wolno przesuwanym przedmiotem. Możesz powoli przemieścić zabawkę w bok podczas spokojnej zabawy."
    ],
    "alert": "Jeżeli w wieku około trzech miesięcy dziecko nie skupia wzroku na twarzy lub nie śledzi ruchu przedmiotu, porozmawiaj z pediatrą. Wcześniej zgłoś każdą stale widoczną nieprawidłowość ustawienia oczu.",
    "source": "https://www.healthychildren.org/English/ages-stages/baby/Pages/Babys-Vision-Development.aspx",
    "sourceLabel": "American Academy of Pediatrics · adaptacja książki Caring for Your Baby and Young Child, wyd. 8, 2024 (ang.)",
    "extraSources": []
  },
  {
    "id": "obserwacja-rozwoju",
    "title": "Jak zanotować rozwój przed wizytą u pediatry?",
    "intro": "Lista umiejętności pomaga przypomnieć sobie, o co chcesz zapytać. Tempo zmian bywa różne. Dla pediatry przydatny będzie opis tego, jak dziecko zachowuje się na co dzień i co zmieniło się od poprzedniej wizyty.",
    "section": "development",
    "keywords": [
      "kamienie milowe",
      "rozwój niemowlęcia",
      "opóźnienie rozwoju",
      "utrata umiejętności",
      "obserwacja rozwoju",
      "bilans zdrowia"
    ],
    "steps": [
      "Wybierz przykład z minionego tygodnia. Zapisz sytuację, zachowanie i wiek dziecka, np. „Podczas przewijania spojrzała na mnie, uśmiechnęła się i poruszyła rączkami”.",
      "Przyjrzyj się kilku rodzajom aktywności: kontaktowi z ludźmi, dźwiękom i ruchowi. Około dwóch miesięcy część dzieci uśmiecha się w odpowiedzi, a około czterech próbuje przyciągnąć uwagę głosem lub ruchem.",
      "Zanotuj również pytanie, np. „Kiedy możemy ponownie ocenić tę umiejętność?”. Przy wcześniactwie podaj pediatrze tydzień urodzenia i wiek skorygowany.",
      "Jeśli coś Cię niepokoi, powiedz o tym wprost i zapytaj, czy potrzeba dokładniejszej oceny rozwoju. Do rozmowy możesz zabrać notatkę zapisaną w raporcie Otuli."
    ],
    "alert": "Utratę wcześniej nabytej umiejętności zgłoś pediatrze jak najszybciej. Taką zmianę warto omówić, nawet jeśli termin kolejnego bilansu jest odległy.",
    "source": "https://www.healthychildren.org/English/family-life/health-management/Pages/Milestones-Matter.aspx",
    "sourceLabel": "American Academy of Pediatrics · obserwowanie rozwoju i zgłaszanie obaw (ang.)",
    "extraSources": [
      {
        "label": "American Academy of Pediatrics · znaczenie utraty wcześniej nabytej umiejętności (ang.)",
        "url": "https://www.healthychildren.org/English/health-issues/conditions/developmental-disabilities/Pages/default.aspx"
      }
    ]
  },
  {
    "id": "wiek-skorygowany",
    "title": "Wcześniak: jak policzyć wiek skorygowany?",
    "intro": "Wiek kalendarzowy liczy się od dnia urodzenia. Przy ocenie rozwoju wcześniaka, zwykle w pierwszych dwóch latach życia, pomocny jest także wiek skorygowany. Uwzględnia czas, który pozostał od narodzin do przewidywanego terminu porodu.",
    "section": "development",
    "keywords": [
      "wcześniak",
      "wcześniactwo",
      "wiek korygowany",
      "wiek skorygowany",
      "urodzony przed terminem",
      "rozwój wcześniaka"
    ],
    "steps": [
      "W karcie wypisowej znajdź tydzień ciąży w chwili porodu. Od 40 tygodni odejmij wiek ciążowy w dniu urodzenia. Wynik mówi, o ile wcześniej urodziło się dziecko.",
      "Od liczby tygodni, które upłynęły od rzeczywistych urodzin, odejmij liczbę tygodni wcześniactwa. Przykład: przy porodzie dokładnie w 34. tygodniu (34+0) różnica wynosi 6 tygodni. Dwanaście tygodni po urodzeniu wiek skorygowany wynosi 6 tygodni.",
      "Przed rozmową z pediatrą zanotuj obie wartości. Przy opisie uśmiechu, ruchu czy kontaktu wzrokowego zapytaj, czego możecie oczekiwać w aktualnym wieku skorygowanym."
    ],
    "alert": "W Otuli jako datę urodzenia dziecka wpisz datę z aktu urodzenia. Wiek skorygowany służy do rozmowy o rozwoju. Terminy opieki specjalistycznej odczytaj z zaleceń oddziału lub poradni.",
    "source": "https://www.healthychildren.org/English/ages-stages/baby/preemie/Pages/Corrected-Age-For-Preemies.aspx",
    "sourceLabel": "American Academy of Pediatrics · obliczanie wieku skorygowanego (ang.)",
    "extraSources": [
      {
        "label": "American Academy of Pediatrics · obserwacja rozwoju wcześniaka (ang.)",
        "url": "https://www.healthychildren.org/English/ages-stages/baby/preemie/pages/Preemie-Milestones.aspx"
      }
    ]
  },
  {
    "id": "przerwa-dla-opiekuna",
    "title": "Płacz mnie przerasta. Jak zrobić bezpieczną przerwę?",
    "intro": "Długotrwały płacz i niewyspanie mogą wywołać silne napięcie u każdego opiekuna. Warto wcześniej ustalić, gdzie bezpiecznie odłożysz dziecko i do kogo zadzwonisz, gdy poczujesz, że tracisz cierpliwość.",
    "section": "development",
    "keywords": [
      "przytłacza mnie płacz",
      "tracę cierpliwość",
      "przerwa opiekuna",
      "bezsilność",
      "potrząsanie dzieckiem",
      "boję się że potrząsnę",
      "zmęczenie rodzica"
    ],
    "steps": [
      "Jeśli dziecko oddycha prawidłowo i jest bezpieczne, a Ty czujesz narastającą złość, połóż je na plecach w łóżeczku na płaskim, twardym materacu. Łóżeczko powinno być wolne od poduszek, koców i zabawek.",
      "Na krótką chwilę przejdź do sąsiedniego pomieszczenia. Zwolnij oddech. Zadzwoń do zaufanej osoby i poproś jednym zdaniem o konkretną pomoc: „Przyjdź teraz i przejmij opiekę na chwilę”.",
      "Zaglądaj do dziecka. Weź je na ręce, kiedy czujesz, że potrafisz zrobić to spokojnie. Jeśli napięcie trwa, poproś drugą spokojną osobę o przejęcie opieki.",
      "Jeżeli ten stan często wraca albo płacz dziecka jest inny niż zwykle, skontaktuj się z położną lub pediatrą i opisz sytuację. Plan bezpiecznej przerwy możesz wcześniej omówić z każdym, kto opiekuje się dzieckiem."
    ],
    "alert": "Nigdy nie potrząsaj dzieckiem. Jeśli doszło do gwałtownego potrząśnięcia lub je podejrzewasz, dzwoń pod 112 lub 999. Powiedz dyspozytorowi, co się wydarzyło, nawet jeśli dziecko wygląda dobrze i nie ma widocznych obrażeń.",
    "source": "https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Calming-A-Fussy-Baby.aspx",
    "sourceLabel": "American Academy of Pediatrics · bezpieczna przerwa opiekuna podczas płaczu (ang.)",
    "extraSources": [
      {
        "label": "Mayo Clinic · pilna pomoc po gwałtownym potrząśnięciu niemowlęciem (ang.)",
        "url": "https://www.mayoclinic.org/diseases-conditions/shaken-baby-syndrome/symptoms-causes/syc-20366619"
      }
    ]
  },
  {
    "section": "feeding",
    "id": "reczne-odciaganie-pokarmu",
    "title": "Jak ręcznie odciągnąć pokarm po porodzie?",
    "intro": "Kiedy pierś jest tak pełna, że dziecku trudno ją uchwycić, odciągnięcie kilku kropli może zmiękczyć otoczkę. Ręczne odciąganie przydaje się również podczas rozłąki z dzieckiem.",
    "keywords": [
      "ręczne odciąganie",
      "odciąganie pokarmu",
      "odciągnąć mleko",
      "siara",
      "pełna pierś",
      "odciąganie bez laktatora"
    ],
    "steps": [
      "Umyj ręce i przygotuj czysty pojemnik z szerokim otworem. Usiądź wygodnie, przysuń pojemnik pod pierś i daj sobie chwilę na wypływ pokarmu.",
      "Ułóż kciuk i palce po przeciwnych stronach brodawki, około 2–3 cm od niej. Delikatnie cofnij dłoń w stronę klatki piersiowej, zbliż palce do siebie, a następnie zwolnij ucisk. Powtarzaj ten ruch rytmicznie, pozostawiając palce w tym samym miejscu na skórze.",
      "Jeśli po kilku ruchach mleko nie wypływa, przesuń palce odrobinę bliżej lub dalej od brodawki. Gdy wypływ zwalnia, zmień ułożenie dłoni wokół piersi. Przy pierwszych próbach pokarm może pojawiać się kroplami.",
      "Jeśli chcesz tylko ułatwić przystawienie, spróbuj nakarmić dziecko, gdy otoczka stanie się bardziej miękka. Gdy odciąganie zastępuje karmienia w czasie rozłąki, ustal ich rytm z położną lub zespołem oddziału."
    ],
    "alert": "Mocne ściskanie brodawki i pocieranie skóry może ją uszkodzić. Gdy odciąganie boli, przerwij i poproś położną o pokaz ułożenia dłoni.",
    "source": "https://llli.org/breastfeeding-info/hand-expressing/",
    "sourceLabel": "La Leche League International · instrukcja oparta na książce „The Art of Breastfeeding” (2024, s. 398–402)",
    "extraSources": [
      {
        "label": "American Academy of Pediatrics · fragment książki „New Mother’s Guide to Breastfeeding”, wyd. 3 (2017), adaptacja z 2022 r.",
        "url": "https://www.healthychildren.org/English/ages-stages/baby/breastfeeding/Pages/hand-expressing-milk.aspx"
      },
      {
        "label": "Sydney Children’s Hospitals Network · odciąganie pokarmu podczas hospitalizacji",
        "url": "https://www.schn.health.nsw.gov.au/breastfeeding-and-expressing-milk-hospital-information-sheet"
      }
    ]
  },
  {
    "section": "feeding",
    "id": "przechowywanie-pokarmu",
    "title": "Jak przechować i rozmrozić odciągnięty pokarm?",
    "intro": "Dla zdrowego niemowlęcia urodzonego o czasie możesz przygotować porcję mleka na później. Czas przechowywania zależy od temperatury i od tego, czy mleko jest świeże, rozmrożone lub pozostało po karmieniu.",
    "keywords": [
      "przechowywanie mleka",
      "przechowywanie pokarmu",
      "zamrozić mleko",
      "rozmrażanie mleka",
      "lodówka",
      "podgrzewanie pokarmu"
    ],
    "steps": [
      "Przelej mleko do czystego pojemnika przeznaczonego do żywności lub woreczka na pokarm. Podziel na małe porcje i zapisz datę oraz godzinę odciągnięcia.",
      "Świeże mleko w temperaturze pokojowej do 25°C wykorzystaj w ciągu 4 godzin. Jeśli ma poczekać dłużej, od razu wstaw je w głąb lodówki. W temperaturze 4°C lub niższej przechowuj świeżą porcję do 4 dni.",
      "Jeśli wiesz, że nie zużyjesz mleka w tych dniach, zamroź je od razu. W zamrażarce o temperaturze −18°C lub niższej najlepiej wykorzystać je w ciągu 6 miesięcy. Zacznij od porcji z najwcześniejszą datą.",
      "Rozmrażaj w lodówce. Od chwili całkowitego rozmrożenia masz do 24 godzin na wykorzystanie chłodnego mleka. W pełni rozmrożonej porcji nie zamrażaj ponownie. Do podgrzania użyj naczynia z ciepłą wodą. Mikrofalówka może miejscowo rozgrzać pokarm i oparzyć dziecko.",
      "Po ogrzaniu albo doprowadzeniu do temperatury pokojowej zużyj mleko w ciągu 2 godzin. Jeśli po karmieniu zostało mleko w butelce, zużyj je najpóźniej w ciągu 2 godzin po zakończeniu karmienia, z uwzględnieniem wcześniejszego terminu dla ogrzanej porcji."
    ],
    "alert": "Dla wcześniaka lub dziecka w szpitalu poproś oddział o jego instrukcję dotyczącą pojemników, oznakowania, transportu i czasu przechowywania.",
    "source": "https://www.cdc.gov/breastfeeding/breast-milk-preparation-and-storage/handling-breastmilk.html",
    "sourceLabel": "CDC · tabela czasu i temperatury, przygotowanie oraz rozmrażanie pokarmu",
    "extraSources": [
      {
        "label": "Academy of Breastfeeding Medicine · Protokół kliniczny nr 8 o przechowywaniu mleka w domu (2017, PDF)",
        "url": "https://www.bfmed.org/assets/DOCUMENTS/PROTOCOLS/8-human-milk-storage-protocol-english.pdf"
      },
      {
        "label": "D. DiMaggio, American Academy of Pediatrics · przechowywanie małych porcji pokarmu",
        "url": "https://www.healthychildren.org/English/ages-stages/baby/breastfeeding/Pages/storing-and-preparing-expressed-breast-milk.aspx"
      }
    ]
  },
  {
    "section": "solids",
    "id": "gotowosc-do-rozszerzania-diety",
    "title": "Po czym poznać gotowość na pierwszy posiłek?",
    "intro": "Około 6. miesiąca zdrowe niemowlę urodzone o czasie zwykle zaczyna poznawać pokarmy inne niż mleko. Najpierw sprawdź, jak siedzi, kontroluje głowę i radzi sobie z jedzeniem w buzi.",
    "keywords": [
      "pierwszy posiłek",
      "rozszerzanie diety",
      "pierwsza łyżeczka",
      "gotowość do rozszerzania diety",
      "kiedy jedzenie",
      "pokarmy stałe"
    ],
    "steps": [
      "Posadź dziecko z podparciem i zobacz, czy utrzymuje głowę stabilnie. Przy stole może otwierać usta na widok łyżeczki, sięgać po jedzenie i kierować je do ust. Znaczenie ma także zdolność połknięcia odrobiny miękkiego pokarmu.",
      "Zacznij spokojnie od niewielkiej ilości, np. kilku małych łyżeczek miękkiej kaszki lub rozgniecionego warzywa. Pozwól dziecku zbliżyć się do łyżeczki i daj mu czas na przełknięcie.",
      "Jeśli dziecko odwraca głowę, zaciska usta lub odsuwa łyżkę, zakończ próbę. Do smaku możesz wrócić innego dnia. Pierwsze posiłki uzupełniają karmienie piersią lub mlekiem modyfikowanym.",
      "Polskie stanowisko z 2021 r. opisuje dla zdrowych dzieci urodzonych o czasie zwykle przedział od 17. do 26. tygodnia życia. Jeśli około 6. miesiąca nadal trudno utrzymać głowę lub przy każdej próbie dziecko wypycha cały pokarm, omów gotowość z pediatrą."
    ],
    "alert": "Po wcześniactwie, przy trudnościach z połykaniem lub zaleconej diecie leczniczej ustal początek i sposób podawania pokarmów z zespołem opieki.",
    "source": "https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/pages/starting-solid-foods.aspx",
    "sourceLabel": "American Academy of Pediatrics · oznaki gotowości i pierwsze posiłki",
    "extraSources": [
      {
        "label": "H. Szajewska, P. Socha i wsp., „Zasady żywienia zdrowych niemowląt”, Przegląd Pediatryczny, 2021 (PDF)",
        "url": "https://ptghizd.pl/cm/uploads/2022/12/4337.pdf"
      }
    ]
  },
  {
    "section": "solids",
    "id": "konsystencja-i-zadlawienie",
    "title": "Jak przygotować kawałki jedzenia, by ograniczyć ryzyko zadławienia?",
    "intro": "Znaczenie mają kształt i twardość jedzenia oraz pozycja dziecka przy stole. Całe winogrono może zablokować drogi oddechowe, nawet jeśli mieści się w buzi.",
    "keywords": [
      "kawałki jedzenia",
      "konsystencja",
      "zadławienie",
      "winogrona",
      "BLW",
      "jak kroić",
      "zakrztuszenie"
    ],
    "steps": [
      "Posadź czuwające dziecko pionowo i pozostań przy nim przez cały posiłek. Podawaj tyle jedzenia naraz, by mogło spokojnie poradzić sobie z tym, co ma w ustach.",
      "Twardą marchew lub jabłko ugotuj do miękkości albo drobno zetrzyj. Winogrona umyj, usuń pestki i przekrój wzdłuż na ćwiartki. Z ryb i mięsa starannie usuń ości oraz kości.",
      "Unikaj całych orzechów, popcornu i twardych cukierków. Gładkie masło orzechowe wymieszaj z wilgotnym pokarmem do płynniejszej konsystencji. Zbita porcja prosto z łyżeczki może utknąć w gardle.",
      "Przed pierwszymi posiłkami wspólnie z osobą, która będzie karmić dziecko, przećwiczcie na kursie pierwszą pomoc dla niemowląt. Pokaż jej też, jak przygotowujesz produkty, które rodzina jada najczęściej."
    ],
    "alert": "Jeśli dziecko nagle nie może nabrać powietrza, głośno kaszleć ani płakać, działaj natychmiast. Wołaj o pomoc, wezwij 112 lub 999 i rozpocznij pierwszą pomoc odpowiednią dla niemowlęcia zgodnie z poleceniami dyspozytora. Do buzi nie wkładaj palców na oślep.",
    "source": "https://www.rch.org.au/kidsinfo/fact_sheets/choking,_suffocation_and_strangulation/",
    "sourceLabel": "Royal Children’s Hospital Melbourne · zapobieganie zadławieniu i rozpoznanie zagrożenia",
    "extraSources": [
      {
        "label": "Canadian Paediatric Society · przygotowanie produktów dla dziecka w pierwszym roku",
        "url": "https://caringforkids.cps.ca/handouts/pregnancy-and-babies/feeding_your_baby_in_the_first_year"
      },
      {
        "label": "Pacjent.gov.pl · polskie numery alarmowe i wezwanie pogotowia",
        "url": "https://pacjent.gov.pl/pogotowie-i-numer-alarmowy"
      }
    ]
  },
  {
    "section": "solids",
    "id": "zelazo-w-posilkach",
    "title": "Jak ułożyć posiłek z żelazem dla niemowlęcia?",
    "intro": "Około 6. miesiąca rosną potrzeby dziecka, a zapasy żelaza z ciąży stopniowo się zmniejszają. Już od pierwszych posiłków warto regularnie proponować produkty, które go dostarczają.",
    "keywords": [
      "żelazo w diecie",
      "żelazo",
      "żelaza",
      "kaszka z żelazem",
      "soczewica",
      "mięso dla niemowlęcia",
      "posiłek z żelazem"
    ],
    "steps": [
      "Do posiłku wybierz jedno źródło żelaza. Może to być miękkie, drobno rozdrobnione mięso, dobrze ugotowana soczewica albo kaszka dla niemowląt wzbogacona w żelazo. Informację o wzbogacaniu znajdziesz na opakowaniu.",
      "Do roślinnego źródła żelaza dołóż produkt z witaminą C, która ułatwia jego wchłanianie. Przykładowy obiad to rozgnieciona czerwona soczewica z miękkim pomidorem, a śniadanie to kaszka z rozgniecionymi truskawkami.",
      "Dopasuj konsystencję do umiejętności dziecka. Mięso możesz dobrze ugotować, rozdrobnić i wymieszać z warzywem. Miękkie strączki na początku łatwo rozgnieść widelcem.",
      "Podczas wizyty powiedz, z jakich produktów dziecko już korzysta, szczególnie jeśli rodzina je bez mięsa. To pozwala omówić inne źródła żelaza i ocenić, czy jadłospis wymaga uzupełnienia."
    ],
    "alert": "Wcześniaki i dzieci z małą masą urodzeniową mogą mieć własne zalecenia dotyczące żelaza. Plan podawania preparatu ustala lekarz. Jeśli został zapisany przy wypisie, skonsultuj z nim każdą zmianę.",
    "source": "https://caringforkids.cps.ca/handouts/pregnancy-and-babies/iron_needs_of_babies_and_children",
    "sourceLabel": "Canadian Paediatric Society · żelazo w diecie, źródła roślinne i rola witaminy C",
    "extraSources": [
      {
        "label": "H. Szajewska, P. Socha i wsp., „Zasady żywienia zdrowych niemowląt”, Przegląd Pediatryczny, 2021 (PDF)",
        "url": "https://ptghizd.pl/cm/uploads/2022/12/4337.pdf"
      }
    ]
  },
  {
    "section": "solids",
    "id": "jajko-i-orzeszki",
    "title": "Jak wprowadzić jajko i orzeszki ziemne?",
    "intro": "Po rozpoczęciu rozszerzania diety można zaproponować dobrze ugotowane jajko i orzeszki ziemne w postaci odpowiedniej dla niemowlęcia. Wybierz posiłek, podczas którego możesz obserwować dziecko.",
    "keywords": [
      "alergeny",
      "alergia pokarmowa",
      "jajko",
      "orzeszki ziemne",
      "masło orzechowe",
      "wprowadzanie alergenów",
      "alergeny pokarmowe"
    ],
    "steps": [
      "Przy ciężkim wyprysku lub rozpoznanej alergii na jajko zawczasu omów z alergologiem, w jaki sposób wprowadzić orzeszki ziemne. Jeśli dziecko już zareagowało na konkretny produkt, zaczekaj z kolejną próbą do konsultacji.",
      "Podaj jeden nowy częsty alergen w danym posiłku. Na początek możesz rozgnieść niewielką ilość ugotowanego na twardo jajka i połączyć ze znanym dziecku pokarmem.",
      "Przy innej okazji gładkie masło z orzeszków ziemnych rozprowadź w odrobinie wody lub znanego przecieru. Konsystencja powinna pozwalać łatwo połknąć kęs. Całe orzechy i gęsta grudka masła grożą zadławieniem.",
      "Jeśli produkt jest dobrze tolerowany, nadal proponuj go regularnie w kolejnych tygodniach. Po wystąpieniu uogólnionej pokrzywki lub wymiotów przerwij podawanie, zapisz skład potrawy i czas początku objawów oraz skontaktuj się z lekarzem."
    ],
    "alert": "Trudności z oddychaniem, obrzęk języka lub gardła, nagła wiotkość albo utrata przytomności po jedzeniu wymagają natychmiastowej pomocy. Dzwoń pod 112 lub 999. Jeśli dziecko ma zaleconą adrenalinę, zastosuj ją zgodnie z jego planem ratunkowym.",
    "source": "https://allergy.org.au/hp/papers/infant-feeding-and-allergy-prevention",
    "sourceLabel": "ASCIA · wskazówki dotyczące zapobiegania alergii pokarmowej, 2026",
    "extraSources": [
      {
        "label": "H. Szajewska, P. Socha i wsp., „Zasady żywienia zdrowych niemowląt”, Przegląd Pediatryczny, 2021 (PDF)",
        "url": "https://ptghizd.pl/cm/uploads/2022/12/4337.pdf"
      },
      {
        "label": "G. Du Toit i wsp., badanie LEAP · wczesne wprowadzenie orzeszków u niemowląt z wysokim ryzykiem alergii, NEJM 2015 (ang.)",
        "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1414850"
      },
      {
        "label": "Royal Children’s Hospital Melbourne · objawy ciężkiej reakcji na pokarm",
        "url": "https://www.rch.org.au/kidsinfo/fact_sheets/Nutrition_babies_toddlers/"
      }
    ]
  },
  {
    "section": "home",
    "id": "pierwszy-zab",
    "title": "Pierwszy ząb. Jak zacząć mycie i kiedy iść do dentysty?",
    "intro": "Zacznij szczotkowanie, gdy przez dziąsło przebije się pierwszy ząb. Wczesna wizyta u dentysty to okazja, żeby pokazać, jak myjecie zęby, i wybrać wygodną pozycję.",
    "keywords": [
      "pierwszy ząb",
      "pierwsze zęby",
      "ząbkowanie",
      "szczoteczka",
      "ząbki",
      "pasta do zębów",
      "dentysta",
      "zęby mleczne"
    ],
    "steps": [
      "Przygotuj małą szczoteczkę z miękkim włosiem i pastę o zawartości 1000 ppm fluoru. Dla dziecka poniżej 3 lat wystarcza ślad pasty wielkości ziarnka ryżu. Oznaczenie ppm znajdziesz na tubce.",
      "Szczotkuj zęby dziecka dwa razy dziennie, w tym wieczorem przed snem. Wybierz pozycję, w której głowa jest podparta i widzisz zęby. Delikatnie oczyszczaj również miejsce styku zęba z dziąsłem.",
      "Przy obolałych dziąsłach możesz podać czysty gryzak schłodzony w lodówce. Zamrożony gryzak jest twardy i może zranić dziąsło.",
      "Umów pierwszą wizytę po pojawieniu się zęba, najpóźniej w okolicy pierwszych urodzin. Możesz zabrać szczoteczkę i pastę dziecka, żeby poprosić o pokaz mycia."
    ],
    "alert": "Gdy dziecko ma gorączkę, biegunkę lub wyraźnie źle się czuje, skontaktuj się z lekarzem zamiast przypisywać objawy samemu ząbkowaniu.",
    "source": "https://pasd.edu.pl/porady/dzieci-0-2-rok-zycia/",
    "sourceLabel": "Polska Akademia Stomatologii Dziecięcej · opieka nad dzieckiem do 2. roku życia",
    "extraSources": [
      {
        "label": "American Academy of Pediatric Dentistry · pierwszy ząb, szczotkowanie i termin wizyty",
        "url": "https://www.aapd.org/resources/parent/faq/"
      }
    ]
  }
];
