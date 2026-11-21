// Each entry describes one action. The order is the recommended order within a stage.
// A work filter suggests topics to explore; it does not establish entitlement.
// roles: optional, narrows the suggested plan for 'mama' or 'tata' ('bliska' sees everything).
// due: optional deadline counted from the child's date of birth (days or calendar months).
// ask + reason: building blocks of the polite request on the support card.
//   ask is a noun phrase in the accusative ("Bardzo proszę o …"), reason is one neutral sentence.
const GUIDE = {
  reviewed: '17.11.2026',
  stages: { pregnancy: 'Ciąża', birth: 'Po narodzinach' },
  roles: {
    mama: { label: 'Mama', description: 'Moje sprawy w ciąży i po porodzie', short: 'Mama', icon: 'heart', color: 'rose' },
    tata: { label: 'Tata', description: 'Formalności i urlopy dla taty', short: 'Tata', icon: 'person', color: 'gold' },
    bliska: { label: 'Wspieram bliską osobę', description: 'Pomoc w sprawach rodziny', short: 'Bliska osoba', icon: 'flower', color: 'peach' }
  },
  work: { any: 'Bez doprecyzowania', employee: 'Umowa o pracę', contract: 'Umowa zlecenia', business: 'Własna działalność', other: 'Inna sytuacja' },
  categories: {
    benefits: { name: 'Świadczenia', icon: 'wallet', color: 'peach' },
    documents: { name: 'Dokumenty', icon: 'files', color: 'gold' },
    work: { name: 'Praca i urlopy', icon: 'briefcase', color: 'rose' }
  },
  glossary: [
    ['Płatnik składek', 'Osoba lub firma, która zgłasza Cię do ubezpieczeń i rozlicza składki, np. Twój pracodawca. Przy własnej działalności możesz być swoim płatnikiem.'],
    ['Płatnik zasiłku', 'Ten, kto ustala i wypłaca zasiłek. Może to być ZUS albo Twój pracodawca. Zapytaj kadry, kto wypłaci Twój zasiłek macierzyński i komu przekazać dokumenty.'],
    ['Tytuł ubezpieczenia', 'Podstawa, z której podlegasz ubezpieczeniom, np. umowa o pracę, umowa zlecenia albo własna działalność. Od niej zależy, czy i na jakich zasadach przysługuje zasiłek.'],
    ['Karta urodzenia a akt urodzenia', 'Kartę urodzenia sporządza szpital lub położna i przekazuje ją do USC. Akt urodzenia powstaje w USC po zgłoszeniu urodzenia. Rodzic otrzymuje odpis aktu.'],
    ['Profil zaufany', 'Bezpłatny sposób potwierdzania tożsamości i podpisywania spraw urzędowych przez internet.'],
    ['e-Doręczenia', 'Elektroniczny odpowiednik listu poleconego. Skrzynka do e-Doręczeń jest potrzebna m.in. przy zgłoszeniu urodzenia przez internet.'],
    ['Emp@tia', 'Portal do składania wniosków o świadczenia rodzinne, m.in. becikowe i świadczenie rodzicielskie.'],
    ['eZUS (dawniej PUE ZUS)', 'Konto internetowe w Zakładzie Ubezpieczeń Społecznych. Tutaj sprawdzisz swoje ubezpieczenia, wyślesz wniosek o 800+ i odbierzesz wiadomości z ZUS.'],
    ['Akt urodzenia i jego odpis', 'Akt to wpis w rejestrze stanu cywilnego. Odpis to urzędowy dokument z tego rejestru. Skrócony podaje aktualne dane, a zupełny obejmuje również treść późniejszych wpisów.'],
    ['Becikowe', 'Potoczna nazwa jednorazowej zapomogi z tytułu urodzenia się dziecka. O pieniądze wnioskujesz w gminie.'],
    ['Dochód na osobę w rodzinie', 'Urząd ustala dochód uwzględniany przy danym świadczeniu i dzieli go przez liczbę członków rodziny w rozumieniu ustawy. Przy becikowym znaczenie mają m.in. rok, z którego pochodzi dochód, utrata pracy lub podjęcie nowej.'],
    ['IKP', 'Internetowe Konto Pacjenta w serwisie pacjent.gov.pl. Po połączeniu konta dziecka ze swoim możesz m.in. odczytać jego e-recepty.'],
    ['Odwołanie i pouczenie', 'Odwołaniem prosisz o ponowne rozpatrzenie decyzji. Pouczenie na końcu decyzji podaje termin, adresata i miejsce złożenia pisma.'],
    ['Okres świadczeniowy', 'Czas, na który urząd przyznaje dane świadczenie. Dla 800+ trwa od 1 czerwca do 31 maja następnego roku. Na kolejny okres składasz nowy wniosek.'],
    ['Opiekun faktyczny', 'W przepisach o świadczeniach rodzinnych to osoba, która opiekuje się dzieckiem i wystąpiła do sądu o jego przysposobienie.'],
    ['Opiekun prawny', 'Osoba, której sąd powierzył sprawowanie opieki nad dzieckiem. Przy wniosku o świadczenie urząd może poprosić o orzeczenie sądu.'],
    ['OPS, MOPS, GOPS', 'Ośrodek pomocy społecznej, miejski lub gminny. W części gmin to właśnie tam składasz wniosek o becikowe lub świadczenie rodzicielskie.'],
    ['PESEL', 'Jedenastocyfrowy numer identyfikacyjny. PESEL dziecka przydaje się np. przy zgłaszaniu go do ubezpieczenia zdrowotnego.'],
    ['Podstawa wymiaru zasiłku', 'Kwota, od której wylicza się zasiłek. Na etacie zwykle wynika z przeciętnego wynagrodzenia podlegającego składce chorobowej z 12 wcześniejszych miesięcy, po odliczeniu składek społecznych finansowanych przez pracownika.'],
    ['Przysposobienie', 'Prawna nazwa adopcji. Gdy formularz pyta o datę przysposobienia, sięgnij do postanowienia sądu.'],
    ['SKO', 'Samorządowe kolegium odwoławcze rozpatruje m.in. odwołania od odmowy becikowego przez gminę. Pismo składasz w instytucji, która wydała decyzję.'],
    ['SW-R', 'Oznaczenie wniosku o 800+ dla rodzica. Dostępny jest m.in. na koncie eZUS.'],
    ['Świadczenie rodzicielskie (kosiniakowe)', 'Pieniądze z gminy na czas osobistej opieki nad dzieckiem, m.in. dla osób bez prawa do zasiłku macierzyńskiego. Dochód rodziny nie decyduje o przyznaniu.'],
    ['Ubezpieczenie chorobowe', 'Część ubezpieczeń społecznych, od której zależy m.in. prawo do zasiłku macierzyńskiego. Na etacie jest obowiązkowe.'],
    ['Ubezpieczenie zdrowotne', 'Ubezpieczenie związane z leczeniem finansowanym przez NFZ. Dziecko można zgłosić jako członka rodziny.'],
    ['USC', 'Urząd stanu cywilnego. Urodzenie zgłaszasz w USC właściwym dla miejsca urodzenia dziecka, także gdy mieszkasz w innej gminie.'],
    ['Wyrównanie', 'Pieniądze należne także za wcześniejszy okres. Przy 800+ prawidłowy wniosek na noworodka złożony w ciągu 3 miesięcy od narodzin pozwala uzyskać wypłatę od dnia urodzenia.'],
    ['ZAM', 'Symbol wniosku o zasiłek macierzyński w ZUS. To, jakie dokumenty dołączyć, zależy od Twojego ubezpieczenia i okresu, za który wnioskujesz.'],
    ['Zasiłek macierzyński', 'Pieniądze z ubezpieczenia chorobowego przysługujące za czas opieki nad dzieckiem określony w przepisach. Wypłatę może otrzymać również uprawniony ojciec.'],
    ['ZUS ZCNA', 'Formularz do zgłoszenia lub wyrejestrowania członka rodziny z ubezpieczenia zdrowotnego. Pracownik przekazuje dane dziecka pracodawcy, a osoba prowadząca firmę może wysłać formularz sama.']
  ],
  cases: [
    {
      id: 'chorobowe', stage: 'pregnancy', category: 'benefits', icon: 'shield', color: 'peach',
      title: 'Sprawdź ubezpieczenie chorobowe', institution: 'ZUS', short: 'Ustal, od czego zależy zasiłek macierzyński.',
      meaning: 'Sprawdzasz w eZUS lub w kadrach, czy i od kiedy obejmuje Cię ubezpieczenie chorobowe. Na etacie jest obowiązkowe. Przy zleceniu lub własnej firmie może wymagać zgłoszenia na Twój wniosek.',
      benefit: 'Jeszcze przed porodem możesz wychwycić brak zgłoszenia i wyjaśnić z płatnikiem, co to oznacza dla zasiłku macierzyńskiego.',
      cost: 'Wgląd do eZUS i sprawdzenie zgłoszenia są bezpłatne. Samo ubezpieczenie ma składkę w wysokości 2,45% podstawy jej wymiaru.',
      valueSource: 'https://www.zus.pl/firmy/rozliczenia-z-zus/skladki-na-ubezpieczenia/spoleczne',
      timing: 'Warto sprawdzić jeszcze w ciąży.',
      why: 'Przy urodzeniu dziecka prawo do zasiłku macierzyńskiego co do zasady zależy od ubezpieczenia chorobowego w dniu porodu. Nie ma wymaganego okresu wyczekiwania. Przepisy przewidują też szczególne sytuacje, np. urodzenie w czasie urlopu wychowawczego.',
      steps: ['Ustal, z jakiego tytułu podlegasz ubezpieczeniom. Sprawdź zgłoszenie u płatnika lub w ZUS.', 'Przy pracy na zleceniu lub działalności zapytaj konkretnie o ubezpieczenie chorobowe. Sama nazwa umowy nie rozstrzyga prawa do zasiłku.'],
      docs: ['Informacja o tytule i okresie ubezpieczenia', 'Dane płatnika składek, jeśli chcesz wyjaśnić zgłoszenie'],
      source: 'https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/komu-przysluguje',
      ask: 'znalezienie numeru infolinii ZUS i godzin, w których najłatwiej się dodzwonić',
      reason: 'Chcę jeszcze przed porodem dopytać o ubezpieczenie chorobowe.'
    },
    {
      id: 'becikowe-przygotowanie', stage: 'pregnancy', category: 'documents', icon: 'file', color: 'gold',
      title: 'Przygotuj dokument do becikowego', institution: 'Gmina', short: 'Sprawdź, jakie zaświadczenie zachować.',
      meaning: 'To zaświadczenie, w którym lekarz lub położna potwierdza, od kiedy i do kiedy mama była pod opieką medyczną w ciąży. Dla rodzica biologicznego jest załącznikiem do wniosku o becikowe.',
      benefit: 'Z dokumentem możesz po porodzie wykazać jeden z warunków jednorazowej wypłaty 1000 zł na dziecko. Gmina sprawdzi też m.in. dochód rodziny.',
      cost: '0 zł za zaświadczenie do becikowego w ramach opieki NFZ. Jeśli wybierasz prywatną wizytę, jej cenę ustala placówka.',
      valueSource: 'https://pacjent.gov.pl/artykul/informacje-o-swiadczeniach',
      timing: 'Opieka medyczna powinna rozpocząć się najpóźniej w 10. tygodniu ciąży i trwać do porodu.',
      why: 'Przy becikowym dla rodziców biologicznych liczy się m.in. udokumentowany okres opieki medycznej. Opiekunów prawnych, faktycznych i osób, które przysposobiły dziecko, ten warunek nie dotyczy.',
      steps: ['Zapisz datę pierwszej wizyty. Przygotuj informacje o liczbie osób w rodzinie i dochodzie.', 'Zapytaj lekarza lub położną o zaświadczenie do becikowego. Wniosek składa się po narodzinach.'],
      docs: ['Zaświadczenie lekarza lub położnej potwierdzające wymagany okres opieki'],
      source: 'https://www.gov.pl/web/gov/uzyskaj-becikowe',
      ask: 'sprawdzenie na gov.pl, jakie zaświadczenie od lekarza lub położnej jest potrzebne do becikowego, i przesłanie mi linku',
      reason: 'Warto poprosić o nie na najbliższej wizycie, jeszcze przed porodem.'
    },
    {
      id: 'profil', stage: 'pregnancy', category: 'documents', icon: 'key', color: 'rose',
      title: 'Przygotuj dostęp do e-urzędu', institution: 'gov.pl', short: 'Wybierz sposób podpisywania spraw online.',
      meaning: 'Profil zaufany pozwala potwierdzić w internecie, że to Ty załatwiasz sprawę, i podpisać dokument urzędowy.',
      benefit: 'Możesz załatwić część spraw z domu, np. podpisać zgłoszenie urodzenia. Do tej usługi przygotuj też aktywną skrzynkę do e-Doręczeń.',
      cost: '0 zł za założenie, przedłużenie i używanie profilu zaufanego.',
      timing: 'Przed pierwszą sprawą załatwianą przez internet.',
      why: 'Profil zaufany przyda się m.in. przy elektronicznym zgłoszeniu urodzenia. Wcześniejsze sprawdzenie dostępu ułatwi podpisanie zgłoszenia po porodzie.',
      steps: ['Jeśli masz profil zaufany, sprawdź jego ważność i sposób logowania w oficjalnym serwisie.', 'Jeśli go zakładasz, wybierz dostępną metodę potwierdzenia tożsamości. Możesz też zaplanować osobistą wizytę w USC po porodzie.'],
      docs: ['Przy potwierdzeniu w punkcie przygotuj ważny dokument tożsamości', 'Przy zakładaniu profilu przygotuj własny numer telefonu i adres e-mail'],
      source: 'https://www.gov.pl/web/profilzaufany/najczesciej-zadawane-pytania2',
      ask: 'sprawdzenie, gdzie w okolicy można potwierdzić profil zaufany i w jakich godzinach',
      reason: 'Przyda się do załatwiania spraw dziecka przez internet, bez stania w kolejkach.'
    },
    {
      id: 'praca-ciaza', stage: 'pregnancy', works: ['employee'], roles: ['mama'], category: 'work', icon: 'briefcase', color: 'rose',
      title: 'Sprawdź swoje prawa w pracy', institution: 'Pracodawca', short: 'Zobacz zasady dotyczące godzin pracy i badań.',
      meaning: 'Jeśli pracujesz na etacie, w ciąży przysługują Ci szczególne zasady dotyczące m.in. godzin pracy i wyjść na badania.',
      benefit: 'Pracodawca musi zaplanować pracę bez nocy i nadgodzin. Zachowujesz wynagrodzenie za czas zaleconego przez lekarza badania związanego z ciążą, gdy nie da się go wykonać poza godzinami pracy.',
      cost: 'Pracodawca nie pobiera opłaty za dostosowanie pracy ani zgłoszenie wyjścia na takie badanie.',
      valueSource: 'https://www.pip.gov.pl/dla-pracodawcow/pytania-i-odpowiedzi/jak-pracownica-powinna-wykazac-stan-ciazy',
      timing: 'W czasie ciąży przy zatrudnieniu na podstawie stosunku pracy.',
      why: 'Pracownicy w ciąży nie wolno zatrudniać w nocy ani w nadgodzinach. Jeśli zalecone przez lekarza badanie związane z ciążą musi odbyć się w godzinach pracy, pracodawca udziela płatnego zwolnienia na ten czas.',
      steps: ['Sprawdź, czy Twój rozkład czasu pracy wymaga zmiany.', 'Omów z kadrami sposób przedstawienia zaświadczenia o ciąży i zgłaszania badań.'],
      docs: ['Zaświadczenie lekarskie stwierdzające ciążę', 'Informacja o terminie zaleconego badania, jeśli potrzebujesz zwolnienia'],
      source: 'https://www.gov.pl/web/rodzina/uprawnienia-zwiazane-z-rodzicielstwem',
      ask: 'pomoc w przygotowaniu listy pytań na rozmowę z działem kadr',
      reason: 'Chcę dobrze zrozumieć swoje prawa w pracy w czasie ciąży.'
    },
    {
      id: 'urodzenie', stage: 'birth', category: 'documents', icon: 'file', color: 'gold',
      title: 'Zgłoś urodzenie dziecka', institution: 'USC', short: 'Zarejestruj dziecko urodzone w Polsce.',
      meaning: 'Zgłaszasz narodziny i wybrane imię lub imiona. Na podstawie zgłoszenia oraz karty urodzenia z placówki medycznej USC sporządza akt urodzenia.',
      benefit: 'Dostajesz odpis, którym możesz potwierdzić narodziny dziecka. Urząd przekazuje też informację o numerze PESEL, jeśli został nadany. Przyda się m.in. do ubezpieczenia dziecka.',
      cost: 'Zgłoszenie i pierwszy odpis skrócony kosztują 0 zł. Przy późniejszym zamówieniu odpisu opłata wynosi zwykle 22 zł za skrócony lub 33 zł za zupełny. Podaj cel we wniosku, bo np. w sprawach ubezpieczenia społecznego przysługuje zwolnienie z opłaty.',
      valueSource: 'https://www.gov.pl/web/gov/uzyskaj-odpis-aktu-stanu-cywilnego-urodzenia-malzenstwa-zgonu',
      timing: '21 dni od sporządzenia karty urodzenia.',
      why: 'Kartę urodzenia przekazuje do USC osoba uprawniona, np. położna. Rodzic zgłasza urodzenie dziecka w urzędzie właściwym dla miejsca urodzenia lub przez internet.',
      steps: ['Ustal, czy karta urodzenia dotarła do USC, i wybierz imię lub imiona dziecka.', 'Złóż zgłoszenie w USC lub podpisz je w usłudze gov.pl. Jeśli zgłasza ojciec, sprawdź zasady uznania ojcostwa.', 'Po rejestracji odbierz odpis aktu urodzenia i informację o numerze PESEL, jeśli został nadany.'],
      docs: ['W urzędzie: dokument tożsamości', 'Online: aktywna skrzynka do e-Doręczeń i sposób potwierdzenia tożsamości, np. profil zaufany', 'Wybrane imię lub imiona dziecka'],
      source: 'https://www.gov.pl/web/gov/zglos-urodzenie-dziecka',
      due: { text: '21 dni od sporządzenia karty urodzenia', label: 'Zgłoszenie urodzenia w USC', note: 'Dokładny termin liczy się od sporządzenia karty urodzenia, nie od porodu.' },
      ask: 'sprawdzenie godzin pracy urzędu stanu cywilnego właściwego dla miejsca urodzenia dziecka',
      reason: 'Na zgłoszenie urodzenia są tylko 3 tygodnie, więc bardzo ułatwi nam to sprawę.'
    },
    {
      id: 'ubezpieczenie-dziecka', stage: 'birth', category: 'documents', icon: 'shield', color: 'peach',
      title: 'Zgłoś dziecko do ubezpieczenia zdrowotnego', institution: 'Pracodawca lub ZUS', short: 'To nie dzieje się automatycznie po rejestracji w USC.',
      meaning: 'Ubezpieczony rodzic zgłasza dziecko jako członka rodziny. Na etacie podajesz dane pracodawcy. Gdy prowadzisz firmę, możesz złożyć formularz ZUS ZCNA.',
      benefit: 'Zgłoszenie porządkuje dane dziecka w NFZ. Po ich przetworzeniu uzyskasz dostęp do jego Internetowego Konta Pacjenta, np. do e-recept. Dziecku z polskim obywatelstwem przysługuje bezpłatne leczenie także przed zgłoszeniem.',
      cost: '0 zł za zgłoszenie. Dopisanie dziecka do ubezpieczenia rodzinnego nie podwyższa Twojej składki zdrowotnej.',
      timing: '7 dni od nadania dziecku numeru PESEL.',
      why: 'Dziecko nie zostaje automatycznie zgłoszone do ubezpieczenia, gdy rejestrujesz jego narodziny w urzędzie stanu cywilnego. Zgłasza je ubezpieczony rodzic lub opiekun.',
      steps: ['Gdy dziecko otrzyma PESEL, przekaż jego dane pracodawcy lub zleceniodawcy.', 'Przy własnej działalności zgłoś dziecko w ZUS na formularzu ZUS ZCNA.', 'Osoba zarejestrowana jako bezrobotna zgłasza dziecko w urzędzie pracy.'],
      docs: ['Numer PESEL i dane dziecka'],
      source: 'https://pacjent.gov.pl/aktualnosc/zglos-dziecko-do-ubezpieczenia',
      due: { text: '7 dni od nadania PESEL', label: 'Zgłoszenie dziecka do ubezpieczenia zdrowotnego', note: 'Termin liczy się od nadania numeru PESEL, dlatego nie ma tu stałej daty.' },
      ask: 'zgłoszenie dziecka do ubezpieczenia zdrowotnego — u pracodawcy albo w ZUS przy własnej firmie',
      reason: 'Trzeba to zrobić w ciągu 7 dni od nadania numeru PESEL.'
    },
    {
      id: 'macierzynski', stage: 'birth', works: ['any','employee','business','contract'], category: 'benefits', icon: 'wallet', color: 'peach',
      title: 'Przygotuj wniosek o zasiłek macierzyński', institution: 'ZUS lub płatnik', short: 'Dobierz dokumenty do tego, kto wypłaca zasiłek.',
      meaning: 'Zasiłek macierzyński zastępuje część dochodu na czas opieki nad dzieckiem. Mogą z niego korzystać m.in. pracownicy i osoby prowadzące firmę lub pracujące na zleceniu, jeśli spełniają warunki ubezpieczenia.',
      benefit: 'Zwykle otrzymasz 100% podstawy za okres macierzyński i 70% za rodzicielski. Jeśli w ciągu 21 dni po porodzie złożysz wniosek za oba okresy w pełnym wymiarze, możesz wybrać 81,5%. Za 9 tygodni zastrzeżonych dla drugiego rodzica stawka wynosi 70%.',
      cost: '0 zł za złożenie wniosku o wypłatę. Indywidualna kwota zasiłku zależy od podstawy obliczonej przez płatnika.',
      valueSource: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
      timing: 'Sprawdź wariant wypłaty zaraz po porodzie. Dla wniosku o uśrednioną stawkę istotny jest termin 21 dni po porodzie.',
      why: 'Zestaw dokumentów zależy m.in. od płatnika zasiłku i wnioskowanego okresu. Poniższy przykład dotyczy urodzenia dziecka w Polsce. Zasady szczególne sprawdzisz w instrukcji ZUS.',
      steps: ['Ustal u pracodawcy lub w ZUS, kto wypłaca zasiłek.', 'Sprawdź instrukcję dla Twojego tytułu ubezpieczenia i okresu zasiłku. Jeśli potrzebny jest wniosek do ZUS, sprawdź aktualny formularz ZAM.'],
      docs: ['Informacja o okresie, za który chcesz pobierać zasiłek', 'Dane dziecka i rodziców do właściwego wniosku'],
      choice: {question:'Kto wypłaca zasiłek?', initial:'Wybierz płatnika, aby zobaczyć, jak przygotować dokument urodzenia.', options: [
        {id:'zus',label:'ZUS',text:'Podaj dane dziecka i rodziców we wniosku. ZUS może pobrać polski odpis aktu urodzenia z rejestru.'},
        {id:'payer',label:'Płatnik składek',text:'Przygotuj dla płatnika skrócony odpis aktu urodzenia albo kopię potwierdzoną za zgodność z oryginałem.'}]},
      source: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty',
      extra: ['Zmiana dokumentów od 24.10.2026', 'https://www.zus.pl/en/o-zus/aktualnosci/-/asset_publisher/aktualnosci/content/id/14583298?_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_aktualnosci_languageId=pl_PL'],
      due: { days: 21, label: 'Wniosek o zasiłek macierzyński w wysokości 81,5%', note: 'Dotyczy wyboru uśrednionej stawki. Po tym terminie wysokość zasiłku ustala się na innych zasadach — sprawdź je w karcie.' },
      ask: 'odszukanie w serwisie ZUS aktualnego formularza wniosku o zasiłek macierzyński (ZAM) i przesłanie mi linku',
      reason: 'Formularze ZUS czasem się zmieniają, a chcę mieć pewność, że korzystam z aktualnej wersji.'
    },
    {
      id: 'urlop-ojcowski', stage: 'birth', works: ['employee'], roles: ['tata'], category: 'work', icon: 'calendar', color: 'rose',
      title: 'Zaplanuj urlop ojcowski', institution: 'Pracodawca', short: 'Dwa tygodnie dla taty — do 12. miesiąca życia dziecka.',
      meaning: 'To osobny urlop pracownika, który wychowuje swoje dziecko. Ojciec może go wykorzystać również wtedy, gdy mama przebywa na urlopie macierzyńskim.',
      benefit: 'Masz do 2 tygodni na opiekę nad dzieckiem, razem lub w dwóch tygodniowych częściach. Za ten czas zasiłek wynosi 100% Twojej podstawy wymiaru.',
      cost: '0 zł za wniosek u pracodawcy. Urlop ojcowski ma własną pulę dni, obok urlopu wypoczynkowego.',
      valueSource: 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo',
      timing: 'Do ukończenia przez dziecko 12. miesiąca życia. Wniosek najpóźniej 7 dni przed rozpoczęciem urlopu.',
      why: 'Tacie zatrudnionemu na umowie o pracę przysługuje urlop ojcowski w wymiarze do 2 tygodni. Można go wykorzystać jednorazowo albo w 2 częściach, z których żadna nie jest krótsza niż tydzień. Za ten czas przysługuje zasiłek macierzyński w wysokości 100% podstawy wymiaru.',
      steps: ['Wybierz termin — całość od razu albo dwie części po co najmniej tygodniu.', 'Złóż wniosek u pracodawcy najpóźniej 7 dni przed rozpoczęciem urlopu, papierowo lub elektronicznie.', 'Przy umowie zlecenia lub własnej działalności sprawdź w ZUS zasady zasiłku za okres odpowiadający urlopowi ojcowskiemu.'],
      docs: ['Wniosek o urlop ojcowski', 'Dane dziecka potrzebne do wniosku, np. data urodzenia'],
      source: 'https://www.gov.pl/web/rodzina/urlop-ojcowski',
      due: { months: 12, remind: 21, label: 'Ostatni moment na urlop ojcowski', note: 'Urlop trzeba wykorzystać do ukończenia przez dziecko 12. miesiąca życia. Wniosek składa się co najmniej 7 dni wcześniej.' },
      ask: 'zaplanowanie urlopu ojcowskiego i złożenie wniosku u pracodawcy co najmniej 7 dni przed jego rozpoczęciem',
      reason: 'Te dwa tygodnie razem bardzo nam pomogą w pierwszych dniach z maluszkiem.'
    },
    {
      id: 'urlop-rodzicielski', stage: 'birth', works: ['any','employee'], category: 'work', icon: 'layers', color: 'gold',
      title: 'Zaplanuj urlop rodzicielski', institution: 'Pracodawca', short: 'Każdemu z rodziców przysługuje 9 tygodni tylko dla siebie.',
      meaning: 'To czas wolny od pracy, który pracujący rodzice mogą podzielić między siebie na opiekę nad dzieckiem. Wniosek o swoją część składasz u swojego pracodawcy.',
      benefit: 'Zwykle macie łącznie do 41 tygodni przy jednym dziecku lub 43 przy porodzie mnogim. Każdy rodzic ma w tej puli 9 tygodni wyłącznie dla siebie. Zasiłek zasadniczo wynosi 70% podstawy. Przy wariancie uśrednionym stawka to 81,5%, z wyjątkiem 9 tygodni drugiego rodzica.',
      cost: '0 zł za złożenie wniosku o urlop rodzicielski.',
      valueSource: 'https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc',
      timing: 'Wniosek składa się co najmniej 21 dni przed rozpoczęciem urlopu.',
      why: 'Przy urodzeniu jednego dziecka urlop rodzicielski trwa do 41 tygodni, a przy urodzeniu więcej dzieci przy jednym porodzie — do 43 tygodni. Każdemu z pracowników-rodziców przysługuje wyłączne prawo do 9 tygodni, których nie można przenieść na drugiego rodzica.',
      steps: ['Ustalcie razem, kto i kiedy korzysta z urlopu.', 'Złóż wniosek u pracodawcy co najmniej 21 dni przed planowanym rozpoczęciem urlopu.', 'Sprawdź, jak wysokość zasiłku zależy od wariantu wybranego po porodzie.'],
      docs: ['Wniosek do pracodawcy', 'Plan podziału urlopu uzgodniony z drugim rodzicem'],
      source: 'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
      ask: 'wspólne zaplanowanie, jak podzielimy urlop rodzicielski',
      reason: 'Każdemu z rodziców przysługuje 9 tygodni, których nie można przekazać drugiemu, więc warto to dobrze ułożyć.'
    },
    {
      id:'800-plus', stage:'birth', category:'benefits', icon:'wallet', color:'rose', title:'Sprawdź świadczenie 800+', institution:'ZUS', short:'Przygotuj elektroniczny wniosek na noworodka.',
      meaning: '800+ to świadczenie wychowawcze z ZUS, które pomaga pokrywać wydatki na dziecko do jego 18. urodzin. Dochód rodziny nie jest kryterium.',
      benefit: 'Za pełny miesiąc przysługuje co do zasady 800 zł na każde uprawnione dziecko. Przy dwojgu to zwykle 1600 zł miesięcznie. Za miesiąc narodzin ZUS oblicza kwotę według liczby dni, za które przysługuje świadczenie.',
      cost: '0 zł za elektroniczny wniosek o 800+.',
      timing:'Zasadniczo 3 miesiące od urodzenia na złożenie wniosku z wyrównaniem od narodzin. Szczególne zasady mogą dotyczyć m.in. osób ze statusem UKR.',
      why:'Świadczenie wynosi co do zasady 800 zł miesięcznie na dziecko do ukończenia 18 lat. Przy noworodku kwota za niepełny miesiąc jest proporcjonalna. ZUS sprawdza warunki, m.in. wspólne zamieszkanie i utrzymywanie dziecka przez wnioskującego rodzica.',
      steps:['Sprawdź zasady dla swojej sytuacji, zwłaszcza przy pobycie za granicą lub ochronie czasowej.', 'Rodzic może wybrać np. eZUS i wniosek SW-R. Sprawdź właściwy okres świadczeniowy i po wysłaniu zachowaj potwierdzenie.'],
      docs:['Dane dziecka, w tym PESEL, jeśli został nadany', 'Numer rachunku do wypłaty', 'Dodatkowe dokumenty wskazane przez ZUS dla Twojej sytuacji'],
      source:'https://www.zus.pl/pl/swiadczenia/swiadczenia-dla-rodzin/swiadczenie-wychowawcze-800-plus',
      due: { months: 3, label: 'Wniosek o 800+ z wyrównaniem od narodzin', note: 'Liczą się 3 miesiące kalendarzowe od dnia urodzenia, a nie 90 dni.' },
      ask:'znalezienie oficjalnej instrukcji ZUS do wniosku o 800+ na noworodka i przesłanie mi linku',
      reason:'Termin ma znaczenie dla wypłaty od dnia narodzin, więc nie chcę go przegapić.'
    },
    {
      id:'rodzicielskie', stage:'birth', works:['any','other','contract','business'], category:'benefits', icon:'heart', color:'peach', title:'Sprawdź świadczenie rodzicielskie', institution:'Gmina', short:'Poznaj wsparcie, gdy rodzice nie pobierają zasiłku macierzyńskiego.',
      meaning: 'Świadczenie rodzicielskie, potocznie „kosiniakowe”, to wsparcie z gminy na czas osobistej opieki nad dzieckiem. Może pomóc m.in. osobie studiującej lub bez pracy, gdy rodzice nie otrzymują zasiłku macierzyńskiego.',
      benefit: 'Podstawowa kwota to 1000 zł za pełny miesiąc, bez progu dochodowego. Przy jednym dziecku okres wynosi zwykle 52 tygodnie, przy bliźniętach 65 tygodni. Bliźnięta wydłużają czas pobierania jednego świadczenia.',
      cost: '0 zł za złożenie wniosku o świadczenie rodzicielskie.',
      valueSource: 'https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20032282255/U/D20032255Lj.pdf',
      timing:'Złożenie w ciągu 3 miesięcy od narodzin pozwala ustalić prawo od miesiąca urodzenia. Później co do zasady od miesiąca złożenia.',
      why:'Dochód rodziny nie wpływa na przyznanie tego świadczenia. Liczy się m.in. osobista opieka oraz to, czy drugi rodzic pobiera zasiłek macierzyński. Przy zasiłku dla bezrobotnych obowiązują szczególne zasady obliczania kwoty.',
      steps:['Wypełnij wniosek o świadczenie rodzicielskie. Podaj datę urodzenia lub objęcia opieką oraz dane dzieci.', 'Wybierz złożenie wniosku w gminie właściwej dla miejsca zamieszkania lub przez portal Emp@tia.'],
      docs:['Wniosek o ustalenie prawa do świadczenia rodzicielskiego', 'Dane rodziców i dziecka oraz załączniki wymagane w Twojej sytuacji'],
      source:'https://www.gov.pl/web/gov/uzyskaj-swiadczenie-rodzicielskie',
      due: { months: 3, label: 'Wniosek o świadczenie rodzicielskie od miesiąca urodzenia', note: 'Po tym terminie prawo ustala się co do zasady od miesiąca złożenia wniosku.' },
      ask:'sprawdzenie, który urząd w naszej gminie przyjmuje wnioski o świadczenie rodzicielskie i w jakich godzinach',
      reason:'Chcę złożyć wniosek w ciągu 3 miesięcy od narodzin.'
    },
    {
      id:'becikowe', stage:'birth', category:'benefits', icon:'wallet', color:'gold', title:'Sprawdź warunki becikowego', institution:'Gmina', short:'Jednorazowa zapomoga po urodzeniu dziecka.',
      meaning: 'Becikowe to jednorazowa pomoc finansowa po narodzinach dziecka. Składasz wniosek w gminie, a przyznane pieniądze możesz przeznaczyć np. na pierwsze zakupy dla dziecka.',
      benefit: 'Po spełnieniu warunków otrzymasz raz 1000 zł na każde dziecko. Przy bliźniętach to łącznie 2000 zł. Dochód na osobę w rodzinie nie może przekroczyć 1922 zł netto miesięcznie.',
      cost: '0 zł za złożenie wniosku o becikowe. Jeśli wybierasz wysyłkę pocztą, ponosisz koszt przesyłki.',
      timing:'Dla rodzica biologicznego: do 12 miesięcy od urodzenia dziecka.',
      why:'Becikowe wynosi 1000 zł. Obowiązuje próg 1922 zł netto miesięcznie na osobę w rodzinie. W przypadku rodziców biologicznych opieka medyczna nad matką powinna rozpocząć się najpóźniej w 10. tygodniu ciąży i trwać do porodu. Sprawdź także warunki dla swojej sytuacji rodzinnej.',
      steps:['Ustal w gminie, jaki okres dochodowy i jakie zmiany dochodu uwzględnić.', 'Wybierz wniosek przez Emp@tię lub w urzędzie i dołącz dokumenty właściwe dla rodziny.'],
      docs:['Wniosek o becikowe', 'Zaświadczenie lekarskie lub od położnej, jeśli dotyczy', 'PESEL członków rodziny, dane do wypłaty oraz dokumenty o utracie lub uzyskaniu dochodu, jeśli dotyczy. Przy samotnym wychowywaniu: orzeczenie alimentacyjne albo dokument potwierdzający wyjątek'],
      source:'https://www.gov.pl/web/gov/uzyskaj-becikowe',
      due: { months: 12, remind: 14, label: 'Wniosek o becikowe', note: 'Termin dotyczy rodzica biologicznego.' },
      ask:'znalezienie kontaktu do działu świadczeń rodzinnych w naszej gminie',
      reason:'Chcę dopytać o becikowe i dokumenty, które trzeba dołączyć.'
    },
    {
      id: "paszport-dziecka", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Wyrób paszport dla dziecka",
      institution: "Punkt paszportowy",
      short: "Sprawdź, kiedy wystarczy wniosek online i czy dziecko musi przyjść.",
      meaning: "Paszport potwierdza tożsamość i polskie obywatelstwo dziecka za granicą. Nawet niemowlę podróżuje z własnym dokumentem.",
      benefit: "Wyjedziesz z dzieckiem także do krajów, które wymagają paszportu. Przed wyjazdem sprawdź minimalną ważność dokumentu i zasady wjazdu do kraju docelowego.",
      cost: "W Polsce zwykły paszport kosztuje 30 zł przed 12. urodzinami i 70 zł od 12. do 18. urodzin. Z Kartą Dużej Rodziny dziecka ceny wynoszą odpowiednio 15 zł i 35 zł. Zdjęcie może kosztować osobno. Konsulat stosuje własną taryfę.",
      timing: "Zaplanuj z wyprzedzeniem przed wyjazdem.",
      why: "Od wieku zależą sposób złożenia wniosku, obecność dziecka i okres ważności dokumentu.",
      steps: [
        "Przed 12. urodzinami możesz złożyć wniosek online lub w dowolnym punkcie paszportowym w Polsce. Od 12. urodzin złóż wniosek osobiście z dzieckiem, urząd pobiera odciski palców.",
        "Uzyskaj zgodę drugiego rodzica, jeśli ma uprawnienie do współdecydowania. Może ją złożyć w punkcie, elektronicznie albo w piśmie z podpisem poświadczonym notarialnie. Przy braku porozumienia potrzebne może być orzeczenie sądu rodzinnego.",
        "Przed 5. urodzinami dziecko nie musi przychodzić. Od 5 do 11 lat przychodzi na złożenie wniosku w punkcie albo na odbiór po wniosku internetowym. Odbierz paszport w wybranym punkcie i oddaj poprzedni paszport dziecka, jeśli go posiada."
      ],
      docs: [
        "Własny ważny dowód albo paszport, aktualne zdjęcie dziecka wykonane do 6 miesięcy wcześniej, potwierdzenie opłaty",
        "Dotychczasowy dokument dziecka, jeśli go ma, oraz potwierdzenie ewentualnej ulgi",
        "Do wniosku online przygotuj cyfrowe zdjęcie, podpis elektroniczny akceptowany przez usługę i skrzynkę do e-Doręczeń. W razie samodzielnej decyzji rodzica przygotuj dokument wskazany dla Twojej sytuacji."
      ],
      source: "https://www.gov.pl/web/gov/uzyskaj-paszport-dla-dziecka",
      extra: ["Zgoda na paszport dziecka online","https://www.gov.pl/web/gov/wyraz-zgode-na-wydanie-paszportu"],
      ask: "sprawdzenie godzin punktu paszportowego i znalezienie fotografa, który robi zdjęcia niemowlętom",
      reason: "Chcę przygotować dokument podróży dziecka przed wyjazdem."
    },
    {
      id: "dowod-dziecka", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Wyrób dowód osobisty dla dziecka",
      institution: "Urząd gminy",
      short: "Bezpłatny dokument na podróże m.in. po Unii Europejskiej.",
      meaning: "Dowód osobisty potwierdza tożsamość i polskie obywatelstwo dziecka. Rodzic może go wyrobić również dla noworodka.",
      benefit: "Dziecko może podróżować z dowodem do państw, które go uznają, m.in. w UE. Przy planowaniu wyjazdu sprawdź zasady konkretnego kraju.",
      cost: "Wydanie dowodu jest bezpłatne. Osobnym wydatkiem może być zdjęcie.",
      timing: "Gdy potrzebujesz dokumentu tożsamości dziecka.",
      why: "Przy wniosku o dowód wystarczy jeden uprawniony rodzic. Od wieku dziecka zależy, czy trzeba zabrać je do urzędu.",
      steps: [
        "Wybierz dowolny urząd gminy w Polsce. Wniosek możesz rozpocząć online lub złożyć w urzędzie.",
        "Przed 5. urodzinami dziecko nie musi przychodzić. Dziecko w wieku 5–11 lat musi być obecne przy składaniu wniosku lub przy odbiorze.",
        "Od 12. urodzin urząd pobiera odciski palców i wzór podpisu. Po wysłaniu wniosku online przyjdź z dzieckiem do wybranego urzędu w ciągu 30 dni. Od 12. urodzin dziecko przychodzi także na odbiór dowodu."
      ],
      docs: [
        "Twój dowód lub paszport, zdjęcie dziecka 35 × 45 mm z ostatnich 6 miesięcy (do wniosku internetowego plik cyfrowy)",
        "Dotychczasowy dowód lub paszport dziecka, jeżeli go ma. Opiekun lub kurator przygotowuje dokument potwierdzający umocowanie."
      ],
      source: "https://www.gov.pl/web/gov/uzyskaj-dowod-osobisty-dla-dziecka-lub-podopiecznego",
      ask: "sprawdzenie godzin odbioru dowodu dziecka w urzędzie gminy",
      reason: "Chcę zaplanować wizytę przed wyjazdem."
    },
    {
      id: "odpis-urodzenia", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Zamów odpis aktu urodzenia",
      institution: "Urząd stanu cywilnego",
      short: "Dobierz odpis skrócony, zupełny lub wielojęzyczny do sprawy.",
      meaning: "Odpis jest urzędowym potwierdzeniem danych z aktu urodzenia. Przy rejestracji urodzenia dostajesz pierwszy odpis skrócony z urzędu.",
      benefit: "Możesz przedstawić potwierdzenie pokrewieństwa lub danych dziecka tam, gdzie instytucja rzeczywiście go wymaga, również w sprawach zagranicznych.",
      cost: "Pierwszy odpis skrócony po rejestracji urodzenia jest bezpłatny. Następny zwykle kosztuje 22 zł za odpis skrócony (także wielojęzyczny) albo 33 zł za zupełny. W sprawach objętych zwolnieniem, np. ubezpieczenia społecznego, wskaż cel wydania.",
      timing: "Po zarejestrowaniu urodzenia, kiedy potrzebny jest odpis.",
      why: "Odpis zupełny zawiera wpisy i zmiany w akcie. Przy dokumentach zagranicznych zapytaj odbiorcę, czy uzna skrócony odpis wielojęzyczny.",
      steps: [
        "Zapytaj instytucję, jakiego rodzaju odpis przyjmie i czy wystarczy jej dokument elektroniczny.",
        "Złóż wniosek w dowolnym USC albo przez gov.pl. Przy wniosku elektronicznym przygotuj podpis i skrzynkę do e-Doręczeń. Wskaż cel oraz sposób odbioru i opłać właściwy USC, jeśli pobiera opłatę.",
        "Przekazując odpis elektroniczny, wyślij oryginalny plik z podpisem lub pieczęcią. Zwykły wydruk tego pliku nie zachowuje jego mocy urzędowej."
      ],
      docs: [
        "Dane dziecka, w tym imię i nazwisko, data i miejsce urodzenia",
        "Twój dokument tożsamości w urzędzie, potwierdzenie ewentualnej opłaty i dane do wysyłki"
      ],
      source: "https://www.gov.pl/web/gov/uzyskaj-odpis-aktu-stanu-cywilnego-urodzenia-malzenstwa-zgonu",
      ask: "ustalenie, czy instytucja przyjmie elektroniczny odpis aktu urodzenia",
      reason: "Chcę zamówić taki dokument, jaki jest potrzebny w naszej sprawie."
    },
    {
      id: "ekuz-rodziny", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Zamów EKUZ dla dziecka i rodziców",
      institution: "NFZ",
      short: "Przed wyjazdem wyrobisz osobną Europejską Kartę Ubezpieczenia Zdrowotnego każdej uprawnionej osobie.",
      meaning: "EKUZ potwierdza prawo do niezbędnego, nieplanowanego leczenia w publicznym systemie kraju czasowego pobytu. Działa m.in. w UE, państwach EFTA i Wielkiej Brytanii.",
      benefit: "Jeśli podczas wyjazdu dziecko zachoruje, okażesz jego kartę w placówce publicznego systemu. Koszty są rozliczane na zasadach obowiązujących osoby ubezpieczone na miejscu.",
      cost: "Wydanie EKUZ przez NFZ jest bezpłatne. Za granicą mogą obowiązywać dopłaty do wizyty lub pobytu w szpitalu.",
      timing: "Przed czasowym wyjazdem za granicę, np. na wakacje.",
      why: "Niemowlę potrzebuje własnej karty. Karta rodzica potwierdza wyłącznie jego uprawnienia.",
      steps: [
        "Sprawdź, czy każdy członek rodziny jest uprawniony do świadczeń i czy dotychczasowa karta jest jeszcze ważna.",
        "Złóż oddzielny wniosek dla każdej osoby w oddziale NFZ albo przez IKP lub mojeIKP. Kiedy wnioskujesz za dziecko, przełącz się na jego profil.",
        "Wybierz sposób odbioru. Przed wyjazdem przeczytaj zasady korzystania z opieki zdrowotnej w kraju pobytu, w tym możliwe dopłaty."
      ],
      docs: [
        "Dane osoby, dla której wnioskujesz, w tym PESEL, jeśli go nadano, oraz adres przy wysyłce",
        "Przy wizycie dokument tożsamości. Jeśli NFZ nie może potwierdzić prawa do świadczeń, może poprosić o dodatkowe dokumenty."
      ],
      source: "https://pacjent.gov.pl/ekuz",
      ask: "sprawdzenie, które placówki w miejscu wyjazdu przyjmują z EKUZ",
      reason: "Chcę wiedzieć, dokąd pojedziemy z dzieckiem, jeśli zachoruje."
    },
    {
      id: "ikp-dziecka", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Otwórz IKP dziecka i daj dostęp drugiemu rodzicowi",
      institution: "Centrum e-Zdrowia",
      short: "Sprawdź e-receptę, e-skierowanie lub deklarację POZ dziecka z własnego konta.",
      meaning: "Internetowe Konto Pacjenta jest zakładane automatycznie osobie z numerem PESEL. Rodzic korzysta z konta małego dziecka po zalogowaniu do własnego IKP.",
      benefit: "Masz pod ręką kody recept, skierowania i informacje o opiece dziecka. Drugi uprawniony rodzic może sprawdzać te dane we własnym profilu.",
      cost: "Korzystanie z IKP i udostępnienie konta drugiemu rodzicowi są bezpłatne.",
      timing: "Po nadaniu numeru PESEL i zgłoszeniu dziecka do ubezpieczenia.",
      why: "Dostęp automatycznie pojawia się u rodzica, który zgłosił dziecko do ubezpieczenia. Drugi rodzic może uzyskać od niego uprawnienie.",
      steps: [
        "Zaloguj się do swojego IKP na pacjent.gov.pl. Wybierz „Uprawnienia”, następnie „Konta Twoich dzieci” i profil dziecka.",
        "Aby dać dostęp drugiemu rodzicowi mającemu władzę rodzicielską, poproś, żeby najpierw zalogował się do własnego IKP. Wybierz przy dziecku zarządzanie dostępem, podaj nazwisko i PESEL drugiego rodzica i zatwierdź.",
        "Jeśli dziecka brakuje, zacznij od sprawdzenia, kto zgłaszał je do ubezpieczenia. Przy adopcji lub opiece prawnej Centrum e-Zdrowia opisuje odrębne postępowanie."
      ],
      docs: [
        "Twój bezpieczny sposób logowania do IKP, np. profil zaufany",
        "Do nadania dostępu PESEL i nazwisko drugiego rodzica"
      ],
      source: "https://pacjent.gov.pl/dbaj-online-o-zdrowie-twojego-dziecka",
      extra: ["Gdy dziecko nie jest widoczne na IKP","https://pacjent.gov.pl/utrata-dostepu-do-ikp-dziecka"],
      ask: "przygotowanie listy recept i zaleceń przed wizytą u pediatry",
      reason: "Chcę przypomnieć sobie zalecenia i zapytać o sprawy, które wymagają wyjaśnienia."
    },
    {
      id: "polozna-poz", stage: "pregnancy", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Wybierz położną POZ na ciążę i połóg",
      institution: "Przychodnia POZ / NFZ",
      short: "Jedna deklaracja ułatwia przygotowanie do porodu i kontakt po powrocie do domu.",
      meaning: "Położna podstawowej opieki zdrowotnej prowadzi edukację przedporodową oraz opiekuje się mamą i noworodkiem po porodzie. Możesz wybrać położną przyjmującą w ramach NFZ.",
      benefit: "Jeszcze w ciąży omówisz poród i karmienie. Po powrocie do domu możesz zapytać o gojenie, pielęgnację noworodka lub pomoc przy przystawianiu do piersi.",
      cost: "Pierwszy wybór i świadczenia w ramach NFZ są bezpłatne dla uprawnionych pacjentek. Dwie zmiany położnej w roku kalendarzowym są bezpłatne. Kolejna zwykle kosztuje 80 zł, z wyjątkami np. przy przeprowadzce.",
      timing: "Wybierz w ciąży. Edukacja przedporodowa w POZ jest dostępna od 21. tygodnia ciąży.",
      why: "Warto ustalić z wybraną położną, jaki teren obejmuje wizytami domowymi, zwłaszcza gdy po porodzie zatrzymasz się u bliskich.",
      steps: [
        "Zadzwoń do przychodni z umową z NFZ. Zapytaj o edukację w ciąży oraz wizyty domowe pod adresem, pod którym spędzisz połóg.",
        "Złóż własną deklarację wyboru położnej na papierze w przychodni lub w swoim IKP. W zakładce „Moje konto” odszukaj „Twoja Podstawowa Opieka Zdrowotna”. Sprawdź, czy placówka przyjęła deklarację.",
        "Przy wypisie przekaż dane wybranej położnej i aktualny adres pobytu. Jeśli po powrocie nikt się nie odezwie w sprawie pierwszej wizyty, zadzwoń do położnej."
      ],
      docs: [
        "Dane identyfikacyjne pacjentki, w tym PESEL, jeśli nadany",
        "Dane wybranej położnej i placówki, adres pobytu po porodzie i telefon do kontaktu"
      ],
      source: "https://pacjent.gov.pl/czym-jest-opieka-okoloporodowa",
      extra: ["Jak złożyć deklarację POZ","https://pacjent.gov.pl/jak-wybrac-lub-zmienic-swiadczeniodawce-poz"],
      ask: "znalezienie położnej NFZ dojeżdżającej pod nasz adres po porodzie",
      reason: "Chcę wcześniej uzgodnić kontakt po wyjściu ze szpitala."
    },
    {
      id: "lekarz-poz-dziecka", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Wybierz lekarza i pielęgniarkę POZ dla dziecka",
      institution: "Przychodnia POZ / NFZ",
      short: "Zapisz noworodka do przychodni na wizyty, bilanse i szczepienia.",
      meaning: "Rodzic lub opiekun wybiera dla dziecka lekarza POZ, np. pediatrę lub lekarza rodzinnego, a osobno pielęgniarkę POZ. Służą do tego deklaracje wyboru.",
      benefit: "Po przyjęciu deklaracji wiesz, gdzie umówić dziecko na poradę, bilans zdrowia i szczepienie. Możesz od razu ustalić z rejestracją termin pierwszej wizyty.",
      cost: "Pierwszy wybór jest bezpłatny. Każdego z medyków można zmienić bez opłat dwa razy w roku kalendarzowym. Następna zmiana zwykle kosztuje 80 zł, z wyjątkami m.in. przy zmianie miejsca zamieszkania.",
      timing: "Przychodnię możesz znaleźć w ciąży, deklarację dla dziecka składasz po urodzeniu.",
      why: "Twoja deklaracja u lekarza rodzinnego obejmuje Ciebie. Noworodek potrzebuje własnej deklaracji.",
      steps: [
        "Wyszukaj przychodnię z umową NFZ i upewnij się, że wybrany lekarz przyjmuje niemowlęta.",
        "Złóż deklaracje na papierze w przychodni lub przełącz IKP na konto dziecka. Wybierz lekarza, a następnie pielęgniarkę i poczekaj na potwierdzenie placówki.",
        "Zadzwoń do rejestracji i umów pierwszą wizytę. Jeśli dziecko potrzebuje pomocy teraz, opisz objawy przy kontakcie z przychodnią."
      ],
      docs: [
        "Dane dziecka i rodzica lub opiekuna, PESEL dziecka, gdy już go nadano",
        "Przy wyborze online dostęp do IKP dziecka. Jeśli PESEL nie jest jeszcze nadany, zadzwoń do przychodni i ustal, jak złożyć deklarację dla noworodka."
      ],
      source: "https://pacjent.gov.pl/aktualnosc/wybierz-dziecku-lekarza-rodzinnego",
      extra: ["Papierowa i elektroniczna deklaracja POZ","https://pacjent.gov.pl/jak-zostac-pacjentem-wybranej-przychodni"],
      ask: "sprawdzenie godzin przyjęć noworodków w naszej przychodni",
      reason: "Chcę z wyprzedzeniem umówić pierwszą wizytę dziecka."
    },
    {
      id: "uznanie-ojcostwa", stage: "pregnancy", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Uznaj ojcostwo przed narodzinami lub po porodzie",
      institution: "Urząd stanu cywilnego",
      short: "Rodzice mogą wspólnie ustalić ojcostwo także w czasie ciąży.",
      meaning: "Ojciec składa przed kierownikiem USC oświadczenie, że jest ojcem dziecka, a matka potwierdza jego słowa. Ta droga dotyczy sytuacji, gdy ojcostwo innej osoby nie jest już prawnie ustalone.",
      benefit: "Możecie uregulować pochodzenie dziecka i złożyć oświadczenia o jego nazwisku. Uznanie przed porodem ułatwia późniejsze zgłoszenie urodzenia przez tatę.",
      cost: "Przyjęcie oświadczeń w USC jest bezpłatne.",
      timing: "Możecie zgłosić się już w ciąży. Potwierdzenie matki musi nastąpić jednocześnie lub w ciągu 3 miesięcy od oświadczenia ojca.",
      why: "Poza małżeństwem biologiczne ojcostwo nie zawsze jest jeszcze ustalone prawnie. Dawniejsze małżeństwo matki może mieć znaczenie dla domniemania ojcostwa.",
      steps: [
        "Skontaktujcie się z dowolnym USC i umówcie osobiste złożenie oświadczeń. Jeśli matka jest lub niedawno była zamężna, opiszcie sytuację kierownikowi przed wizytą.",
        "Weźcie dokumenty tożsamości. Jeśli przychodzicie w ciąży, zapytajcie USC, jak potwierdzić ciążę. Po urodzeniu podajcie dane dziecka.",
        "Ojciec składa oświadczenie. Matka potwierdza je tego samego dnia lub najpóźniej w ciągu 3 miesięcy. Uzgodnijcie z kierownikiem oświadczenia o nazwisku dziecka."
      ],
      docs: [
        "Dokumenty tożsamości obojga rodziców",
        "Przed porodem dokument potwierdzający ciążę wskazany przez USC, np. zaświadczenie lekarskie. Przy zagranicznych dokumentach zapytaj o odpis i tłumaczenie."
      ],
      source: "https://samorzad.gov.pl/web/gmina-jaslo/uznanie-ojcostwa",
      extra: ["Zgłoszenie urodzenia dziecka w Polsce","https://www.gov.pl/web/gov/zglos-urodzenie-dziecka"],
      ask: "umówienie wspólnej wizyty w USC i sprawdzenie, jak potwierdzić ciążę",
      reason: "Chcemy przed porodem ustalić formalności związane z ojcostwem."
    },
    {
      id: "karta-duzej-rodziny", stage: "birth", optional: true, category: 'documents', icon: 'files', color: 'gold',
      title: "Sprawdź Kartę Dużej Rodziny",
      institution: "Gmina / Emp@tia",
      short: "Sprawdź, komu w rodzinie z co najmniej trojgiem dzieci przysługują zniżki.",
      meaning: "Karta Dużej Rodziny (KDR) potwierdza uprawnienie do ulg i zniżek u partnerów programu. Każdy uprawniony członek rodziny ma swoją kartę.",
      benefit: "Przykładowo KDR obniża opłatę za paszport dziecka. Inne aktualne zniżki, np. na usługi lub wstęp do obiektów, sprawdzisz w wykazie partnerów.",
      cost: "Pierwsze przyznanie karty jest bezpłatne. Od 1 marca 2026 r. duplikat kosztuje 17 zł. Jeśli zamówisz kartę plastikową po wcześniejszym wyborze wyłącznie elektronicznej, opłata wynosi 10 zł.",
      valueSource: "https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi-kdr",
      timing: "Sprawdź po narodzinach trzeciego dziecka. O swoją kartę rodzic może wystąpić także wtedy, gdy dzieci są już dorosłe.",
      why: "Uprawnienia rodziców i dzieci różnią się. Dochód rodziny nie jest kryterium.",
      steps: [
        "Policz dzieci spełniające warunki i ustal, dla kogo składasz wniosek. Rodzic może złożyć go w imieniu rodziny.",
        "Złóż wniosek w gminie miejsca zamieszkania albo elektronicznie w portalu Emp@tia. Wskaż członków rodziny, ich dane i wybraną formę kart.",
        "Po przyznaniu sprawdź kartę elektroniczną w mObywatelu lub odbierz zamówioną kartę tradycyjną zgodnie z informacją gminy."
      ],
      docs: [
        "Dane i numery PESEL członków rodziny, przy braku numeru dokumenty tożsamości",
        "Oświadczenia dotyczące władzy rodzicielskiej, a w odpowiednim przypadku nauki pełnoletniego dziecka, orzeczenia o niepełnosprawności lub pieczy zastępczej. Dla cudzoziemca mogą być potrzebne dokumenty pobytowe."
      ],
      source: "https://www.gov.pl/web/gov/uzyskaj-karte-duzej-rodziny",
      extra: ["Aktualne komunikaty i opłaty KDR","https://www.gov.pl/web/rodzina/informacje-biezace"],
      ask: "sprawdzenie, które miejsca w naszej okolicy honorują Kartę Dużej Rodziny",
      reason: "Chcę wiedzieć, z jakich zniżek możemy skorzystać z dziećmi."
    }
  ]
};

// Odpowiedzi uzupełniają dokumenty, kroki i termin zapisane w katalogu.
const familyAppeal = 'Od decyzji gminy odwołaj się bez opłat do samorządowego kolegium odwoławczego. Pismo złóż w urzędzie, który wydał decyzję, w ciągu 14 dni od doręczenia. Przy decyzji wojewody kieruj się jego pouczeniem.';
const municipalContact = 'Dział świadczeń rodzinnych urzędu miasta, gminy lub OPS właściwy dla miejsca zamieszkania. Podaj nazwę świadczenia i datę złożenia wniosku.';
const zusContact = 'Centrum Kontaktu Klientów ZUS: 22 560 16 00 (dni robocze 7–18). W sprawie indywidualnej napisz po zalogowaniu do eZUS lub umów e-wizytę.';
const workAppeal = 'Jeżeli pracodawca odmawia, poproś o uzasadnienie na piśmie. Możesz zgłosić sprawę do okręgowego inspektoratu pracy lub dochodzić praw w sądzie pracy.';
const allowanceAppeal = 'Jeżeli wypłaty odmawia płatnik, możesz wystąpić do ZUS o decyzję. Od decyzji ZUS odwołaj się do sądu pracy i ubezpieczeń społecznych za pośrednictwem ZUS w ciągu miesiąca od jej doręczenia.';
const localWait = 'Zwykle do miesiąca od wszczęcia postępowania, w szczególnie skomplikowanej sprawie do dwóch miesięcy. Odbieraj wezwania do uzupełnienia dokumentów.';
const caseAnswers = {
  "paszport-dziecka": {
    who: "Wniosek składa rodzic dziecka z polskim obywatelstwem, jego opiekun prawny lub kurator. Zasadą jest zgoda obojga uprawnionych rodziców.",
    when: "Możesz złożyć wniosek także dla niemowlęcia. Przed zapłatą sprawdź wymagania kraju docelowego i dostępność terminu w urzędzie.",
    wait: "W Polsce zwykle około miesiąca od złożenia wniosku. Urząd poda przewidywaną datę. Numer wniosku pozwala sprawdzić gotowość dokumentu online.",
    amount: "Zwykły paszport wydany dziecku przed 12. urodzinami jest ważny 5 lat, a wydany od 12. urodzin – 10 lat.",
    appeal: "Jeśli urząd wyda decyzję odmowną, przeczytaj pouczenie o odwołaniu. Spór rodziców o zgodę rozstrzyga sąd rodzinny.",
    more: "Zgoda na wydanie paszportu dotyczy dokumentu. Przy podróży z jednym rodzicem sprawdź oddzielnie formalności wjazdowe i wymagania przewoźnika.",
    contact: "Dowolny punkt paszportowy w Polsce. Za granicą skontaktuj się z polskim konsulatem.",
    law: "Ustawa z 27 stycznia 2022 r. o dokumentach paszportowych oraz rozporządzenie Rady Ministrów w sprawie opłat za paszport i paszport tymczasowy."
  },
  "dowod-dziecka": {
    who: "Jeden z rodziców, opiekun prawny lub kurator dziecka z obywatelstwem polskim.",
    when: "Możesz wystąpić o dowód od narodzin. Przed podróżą sprawdź datę ważności dotychczasowego dokumentu.",
    wait: "Zwykle do 30 dni. Jeżeli trzeba złożyć odciski palców po wniosku online, termin liczy się od ich złożenia.",
    amount: "Przed 12. urodzinami dowód wydaje się na 5 lat. Od 12. urodzin zwykle na 10 lat. Szczególne zasady dotyczą przejściowej niemożności pobrania odcisków palców.",
    appeal: "Jeśli gmina odmówi wydania dokumentu, w decyzji znajdziesz sposób i termin odwołania do wojewody.",
    more: "Przy wymianie zabierz poprzedni dowód dziecka. Na podstawie numeru wniosku sprawdzisz online, czy nowy dokument jest gotowy.",
    contact: "Wydział dowodów osobistych urzędu gminy, w której składasz wniosek.",
    law: "Ustawa z 6 sierpnia 2010 r. o dowodach osobistych."
  },
  "odpis-urodzenia": {
    who: "Rodzic może uzyskać odpis aktu własnego dziecka. Usługa wymienia też inne uprawnione osoby, m.in. dziadków i przedstawicieli ustawowych.",
    when: "W dowolnym momencie po sporządzeniu aktu. Najpierw sprawdź, czy masz już odpowiedni odpis.",
    wait: "Niektóre odpisy elektroniczne system wydaje automatycznie. Dla aktu w rejestrze termin wynosi do 7 dni kalendarzowych. Przy wpisie tylko w papierowej księdze wynosi do 7 dni roboczych w USC przechowującym księgę lub do 10 dni roboczych w innym USC.",
    amount: "Skrócony pokazuje aktualne dane. Zupełny uwzględnia także treść zmian. Wielojęzyczny odpis skrócony jest dostępny na papierze.",
    appeal: "Od decyzji odmownej możesz odwołać się do wojewody za pośrednictwem kierownika USC w ciągu 14 dni od doręczenia.",
    more: "Przy opłacie przelewem sprawdź numer rachunku właściwy dla wybranego urzędu.",
    contact: "Dowolny USC. Jeśli wnioskujesz przez internet, wybierz urząd i zachowaj potwierdzenie złożenia.",
    law: "Ustawa z 28 listopada 2014 r. – Prawo o aktach stanu cywilnego oraz ustawa z 16 listopada 2006 r. o opłacie skarbowej."
  },
  "ekuz-rodziny": {
    who: "Dla siebie wnioskuje osoba uprawniona do świadczeń finansowanych przez NFZ. Dla dziecka wnioskuje rodzic lub opiekun.",
    when: "Przed każdym wyjazdem sprawdź osobno datę ważności karty dziecka i kart dorosłych.",
    wait: "W oddziale NFZ karta zwykle jest wydawana od ręki. Wniosek elektroniczny jest zwykle rozpatrywany w ciągu 5 dni, a latem może to potrwać dłużej. Dolicz czas dostawy.",
    amount: "Kartą nie sfinansujesz planowanego leczenia ani zwykłej wizyty w prywatnym gabinecie poza systemem publicznym. Co do zasady nie pokrywa też transportu do Polski.",
    appeal: "Jeśli system nie potwierdza uprawnień, wyjaśnij w NFZ, jakiego dokumentu brakuje. Przy pilnej potrzebie leczenia za granicą zapytaj o certyfikat tymczasowo zastępujący EKUZ.",
    more: "Zabierz kartę i dokument tożsamości. O zakresie niezbędnych świadczeń w czasie pobytu decyduje lekarz.",
    contact: "Oddział wojewódzki NFZ lub Telefoniczna Informacja Pacjenta, 800 190 590.",
    law: "Rozporządzenia Parlamentu Europejskiego i Rady (WE) nr 883/2004 oraz nr 987/2009 o koordynacji systemów zabezpieczenia społecznego."
  },
  "ikp-dziecka": {
    who: "Rodzic wykonujący władzę rodzicielską lub opiekun prawny. Automatyczne powiązanie korzysta z danych o zgłoszeniu do ubezpieczenia.",
    when: "Po otrzymaniu PESEL i przetworzeniu zgłoszenia dziecka do ubezpieczenia.",
    wait: "Od zgłoszenia dziecka w ZUS do pojawienia się dostępu może minąć do 21 dni.",
    amount: "Możesz np. odczytać kod e-recepty, sprawdzić e-skierowanie i złożyć deklarację wyboru lekarza POZ dziecka.",
    appeal: "Sprawdź dane u płatnika, który zgłaszał dziecko, a potem skontaktuj się z obsługą IKP, jeśli zgłoszenie jest prawidłowe.",
    more: "Zawsze loguj się na własne konto. Każdemu dziecku przypisany jest osobny profil.",
    contact: "Centrum e-Zdrowia, obsługa IKP pod adresem ikp-pomoc@cez.gov.pl.",
    law: "Ustawa z 28 kwietnia 2011 r. o systemie informacji w ochronie zdrowia."
  },
  "polozna-poz": {
    who: "Kobieta uprawniona do świadczeń POZ wybiera położną dla siebie. Nie musisz czekać na narodziny dziecka.",
    when: "Możesz wybrać położną wcześniej i od 21. tygodnia ciąży korzystać z edukacji przedporodowej.",
    wait: "Po deklaracji online sprawdź status na IKP. Po porodzie pierwsza wizyta powinna odbyć się w ciągu 48 godzin od otrzymania przez położną zgłoszenia urodzenia dziecka lub wypisu mamy. Do tego terminu nie wlicza się sobót, niedziel ani świąt ustawowych.",
    amount: "Zapytaj o przygotowanie do porodu, karmienie, higienę oraz opiekę nad dzieckiem w pierwszych tygodniach. Możesz zapisać pytania i omówić je w domu podczas wizyty patronażowej.",
    appeal: "Jeśli deklaracji nie przyjęto, zapytaj przychodnię o powód i inne położne obejmujące Twój adres. W znalezieniu placówki pomaga NFZ.",
    more: "Położna POZ może pracować w innej placówce niż Twój lekarz rodzinny. Poród w konkretnym szpitalu nie przesądza o wyborze położnej POZ.",
    contact: "Rejestracja POZ, wybrana położna lub Telefoniczna Informacja Pacjenta, 800 190 590.",
    law: "Ustawa z 27 października 2017 r. o podstawowej opiece zdrowotnej oraz rozporządzenie Ministra Zdrowia z 16 sierpnia 2018 r. w sprawie standardu organizacyjnego opieki okołoporodowej (tekst jednolity Dz.U. z 2026 r. poz. 1140, załącznik, część XV ust. 7)."
  },
  "lekarz-poz-dziecka": {
    who: "Deklarację w imieniu dziecka składa rodzic lub opiekun prawny.",
    when: "Po urodzeniu. Możesz wcześniej zapytać placówkę o dostępność lekarza i pielęgniarki.",
    wait: "Przyjęcie deklaracji online zwykle trwa do 7 dni, a bywa, że do 3 tygodni. Termin wizyty uzgodnij z placówką.",
    amount: "Lekarz prowadzi opiekę podstawową, ocenia rozwój dziecka i kwalifikuje do szczepień. Pielęgniarka wspiera m.in. profilaktykę.",
    appeal: "Zapytaj placówkę o powód i dostępność innych lekarzy. Jeśli masz trudność z wyborem placówki, skontaktuj się z NFZ.",
    more: "Każde dziecko ma własną deklarację, nawet jeśli rodzeństwo chodzi do tego samego lekarza.",
    contact: "Wybrana przychodnia lub Telefoniczna Informacja Pacjenta, 800 190 590.",
    law: "Ustawa z 27 października 2017 r. o podstawowej opiece zdrowotnej."
  },
  "uznanie-ojcostwa": {
    who: "Rodzice dziecka, którego ojcostwo nie zostało wcześniej ustalone. Przy wątpliwościach dotyczących domniemania ojcostwa męża matki zapytaj USC o właściwą drogę.",
    when: "Od poczęcia, również po urodzeniu przed osiągnięciem przez dziecko pełnoletności. Przed 18. urodzinami rodzica mogą obowiązywać szczególne zasady składania oświadczeń przed sądem.",
    wait: "Jeśli dokumenty są kompletne, kierownik przyjmuje oświadczenia podczas umówionej wizyty. Termin wizyty zależy od urzędu.",
    amount: "Po uznaniu ojcostwo jest ustalone prawnie. Przed wizytą porozmawiajcie o nazwisku, jakie ma nosić dziecko.",
    appeal: "W razie odmowy przyjęcia oświadczenia kierownik wyjaśnia przyczynę i możliwość złożenia oświadczenia przed sądem opiekuńczym. Sporne pochodzenie dziecka może wymagać sądowego ustalenia ojcostwa.",
    more: "Opisana procedura dotyczy USC w Polsce. Za granicą zapytajcie polski konsulat o warunki, dokumenty i opłaty.",
    contact: "Dowolny USC w Polsce. W sprawach wymagających drogi sądowej właściwy będzie sąd rodzinny.",
    law: "Kodeks rodzinny i opiekuńczy, w szczególności art. 62 i art. 72–77, oraz ustawa – Prawo o aktach stanu cywilnego."
  },
  "karta-duzej-rodziny": {
    who: "Rodzic, który ma lub miał na utrzymaniu łącznie co najmniej troje dzieci, oraz małżonek takiego rodzica mogą spełniać warunki KDR. Prawo dzieci zależy od tego, czy w dniu składania wniosku co najmniej troje dzieci w rodzinie spełnia ustawowe kryteria.",
    when: "W typowej sytuacji dziecko spełnia warunki do ukończenia 18 lat, przy dalszej nauce najdalej do 25. urodzin, a przy orzeczeniu o umiarkowanym lub znacznym stopniu niepełnosprawności – bez limitu wieku przez okres ważności orzeczenia.",
    wait: "Gmina sprawdza uprawnienia. Czas przygotowania wersji plastikowej dolicz do czasu rozpatrzenia wniosku. O status zapytaj jednostkę, która przyjęła wniosek.",
    amount: "Przykład w Polsce: zwykły paszport dla dziecka z KDR kosztuje 15 zł przed 12. urodzinami i 35 zł od 12. do 18. urodzin. Poszczególni partnerzy mają własne warunki zniżek.",
    appeal: "Od odmowy przyznania karty możesz odwołać się do samorządowego kolegium odwoławczego przez urząd, który wydał decyzję, zgodnie z pouczeniem.",
    more: "Rodzic zasadniczo otrzymuje kartę bezterminowo. Przy pieczy zastępczej, ograniczeniu władzy rodzicielskiej lub szczególnej podstawie pobytu w Polsce sprawdź warunki w urzędzie.",
    contact: "Urząd gminy właściwy dla miejsca zamieszkania lub wyznaczona przez gminę jednostka prowadząca KDR.",
    law: "Ustawa z 5 grudnia 2014 r. o Karcie Dużej Rodziny."
  },
  chorobowe: {
    who: 'Osoba przygotowująca się do porodu, która chce ustalić, czy jest objęta ubezpieczeniem chorobowym. Na etacie jest ono obowiązkowe. Na zleceniu lub przy działalności może być dobrowolne, jeśli spełniasz warunki.',
    when: 'Możesz sprawdzić zgłoszenie już teraz, a po zmianie pracy sprawdzić je ponownie.',
    wait: 'Dane już zapisane na koncie możesz sprawdzić od razu w eZUS w panelu ubezpieczonego. Brak okresu ubezpieczenia wyjaśnij z płatnikiem.',
    amount: 'Samo sprawdzenie jest bezpłatne. Kwotę przyszłego zasiłku ustala się od podstawy wymiaru.',
    appeal: 'Jeśli widzisz błędny okres, poproś płatnika o korektę. Przy sporze o podleganie ubezpieczeniu możesz wystąpić do ZUS o formalną decyzję i skorzystać z jej pouczenia.',
    more: 'Ubezpieczenie zdrowotne daje dostęp do leczenia. Ubezpieczenie chorobowe ma znaczenie dla zasiłków. Na koncie sprawdź właśnie tę drugą pozycję.',
    contact: zusContact, law: 'Ustawa o systemie ubezpieczeń społecznych, art. 11. Ustawa zasiłkowa z 25 czerwca 1999 r., art. 29.'
  },
  'becikowe-przygotowanie': {
    who: 'Osoba w ciąży, która po narodzinach chce udokumentować okres opieki medycznej do becikowego.',
    when: 'Na wizytach w ciąży zadbaj o zapis dat i przebiegu opieki. Po zakończeniu ciąży poproś o zaświadczenie obejmujące okres do porodu.',
    wait: 'Termin wydania dokumentu ustalasz z lekarzem lub położną. Gmina rozpatruje dopiero późniejszy wniosek o świadczenie.',
    amount: 'Na tym etapie otrzymujesz dokument. Samo becikowe to jednorazowe 1000 zł po spełnieniu warunków.',
    appeal: 'Błąd w zaświadczeniu wyjaśnij z osobą, która je wystawiła. Odmowa becikowego przez gminę to odrębna decyzja, od której przysługuje odwołanie.',
    more: 'Poproś o zaświadczenie na wzorze do becikowego. Zachowaj dokumentację wizyt, także gdy zmieniasz poradnię.',
    contact: 'Lekarz lub położna prowadząca ciążę. O wymagany wzór zapytaj dział świadczeń rodzinnych swojej gminy.',
    law: 'Art. 15b ustawy o świadczeniach rodzinnych oraz rozporządzenie Ministra Zdrowia z 14 września 2010 r. w sprawie formy opieki medycznej i wzoru zaświadczenia.'
  },
  profil: {
    who: 'Osoba od 13. roku życia, z numerem PESEL i pełną albo ograniczoną zdolnością do czynności prawnych.',
    when: 'W dowolnym czasie przed podpisaniem pierwszego urzędowego formularza.',
    wait: 'Przy potwierdzeniu przez bank profil jest dostępny po pomyślnej identyfikacji. Przy wizycie zależy to od terminu potwierdzenia w punkcie.',
    amount: 'Założenie i używanie profilu są bezpłatne. Otrzymujesz możliwość podpisywania spraw urzędowych online.',
    appeal: 'Przy błędzie potwierdzania sprawdź zgodność danych z PESEL. Problem techniczny zgłoś pomocy profilu zaufanego.',
    more: 'Profil jest ważny trzy lata. Jeśli ważność się kończy, możesz ją przedłużyć. Nie przekazuj bliskim kodów SMS ani danych logowania.',
    contact: 'Pomoc profilu zaufanego: 42 253 54 50. Przy identyfikacji przez bank skontaktuj się też ze swoim bankiem.',
    law: 'Ustawa z 17 lutego 2005 r. o informatyzacji działalności podmiotów realizujących zadania publiczne, przepisy o profilu zaufanym.'
  },
  'praca-ciaza': {
    who: 'Pracownica w ciąży zatrudniona w ramach stosunku pracy.',
    when: 'W ciąży. Zwolnienie na zalecone badanie przysługuje, jeśli nie można go wykonać poza godzinami pracy.',
    wait: 'Nie czekasz na decyzję urzędu. Pracodawca organizuje pracę zgodnie z ochroną pracownicy w ciąży. Termin badania zgłoś przed wyjściem.',
    amount: 'Za czas takiego badania zachowujesz wynagrodzenie. Nie składasz odrębnego wniosku o wypłatę do ZUS.',
    appeal: workAppeal, more: 'Przy pracy nocnej pracodawca ma zmienić rozkład czasu pracy. Jeśli to niemożliwe lub niecelowe, powinien przenieść Cię do innej pracy, a gdy i to jest niemożliwe, zwolnić z obowiązku jej świadczenia.',
    contact: 'Przełożony lub dział kadr. Przy sporze skorzystaj z porad okręgowego inspektoratu pracy.',
    law: 'Kodeks pracy, art. 178, 178¹ i 185.'
  },
  urodzenie: {
    who: 'Matka albo ojciec, jeśli ma co najmniej 16 lat i odpowiednią zdolność do czynności prawnych. W pozostałych sytuacjach zgłasza przedstawiciel ustawowy lub opiekun matki. Ojciec musi mieć prawnie ustalone ojcostwo.',
    when: 'Po urodzeniu dziecka w Polsce. Do sporządzenia aktu urząd potrzebuje karty urodzenia przesłanej przez osobę uprawnioną.',
    wait: 'Przy zgłoszeniu online USC sporządza akt następnego dnia roboczego po zgłoszeniu, jeśli ma kartę urodzenia. W urzędzie zwykle podczas wizyty. Doręczenie pocztą trwa dodatkowo.',
    amount: 'Rejestracja jest bezpłatna. Otrzymujesz jeden bezpłatny skrócony odpis aktu urodzenia.',
    appeal: 'Przy decyzji o odmowie przyjęcia wybranego imienia masz 14 dni od doręczenia na odwołanie do wojewody. Złóż je za pośrednictwem kierownika USC.',
    more: 'Możesz wybrać najwyżej dwa imiona. Jeśli minie termin zgłoszenia, kierownik USC sam zarejestruje urodzenie i wybierze imię. Przy martwym urodzeniu obowiązuje odrębny termin.',
    contact: 'Urząd stanu cywilnego miejscowości, w której urodziło się dziecko. Jeśli brakuje karty, zapytaj placówkę, w której odbył się poród.',
    law: 'Prawo o aktach stanu cywilnego z 28 listopada 2014 r., w szczególności art. 52–59.'
  },
  'ubezpieczenie-dziecka': {
    who: 'Rodzic podlegający ubezpieczeniu zdrowotnemu zgłasza dziecko jako członka rodziny, gdy dziecko nie ma własnego tytułu. Wystarczy zgłoszenie przez jednego rodzica.',
    when: 'Po nadaniu numeru PESEL. Przy zmianie tytułu ubezpieczenia, np. po zmianie pracodawcy, zgłoś dziecko ponownie.',
    wait: 'Płatnik przekazuje zgłoszenie do ZUS. Po przetworzeniu danych konto dziecka pojawi się na IKP rodzica, który zgłosił je do ubezpieczenia. Może to potrwać do 21 dni.',
    amount: 'Nie. Przy zgłoszeniu dziecka jako członka rodziny Twoja składka zdrowotna pozostaje taka sama.',
    appeal: 'Przy braku wpisu najpierw sprawdź u płatnika PESEL i wysłanie ZCNA. Rozbieżność w prawie do świadczeń wyjaśnij z oddziałem NFZ. Przy decyzji korzystaj z dołączonego pouczenia.',
    more: 'Gdy zmieniasz pracodawcę, poprzednie zgłoszenie dziecka może wygasnąć. Przekaż dane nowemu płatnikowi, nawet jeśli numer PESEL się nie zmienił.',
    contact: 'Kadry, zleceniodawca albo ZUS. Telefoniczna Informacja Pacjenta: 800 190 590.',
    law: 'Ustawa z 27 sierpnia 2004 r. o świadczeniach opieki zdrowotnej finansowanych ze środków publicznych, art. 67.'
  },
  macierzynski: {
    who: 'Zwykle osoba objęta ubezpieczeniem chorobowym w dniu porodu. Dotyczy również ubezpieczonych na zleceniu lub we własnej firmie. Są wyjątki, np. urodzenie podczas urlopu wychowawczego.',
    when: 'Za okres odpowiadający urlopowi macierzyńskiemu, następnie rodzicielskiemu, jeśli spełniasz warunki. Nie obowiązuje okres wyczekiwania na ubezpieczeniu.',
    wait: 'Wypłata powinna nastąpić najpóźniej 30 dni od wyjaśnienia ostatniej okoliczności potrzebnej do ustalenia prawa, np. po uzupełnieniu brakującego dokumentu.',
    amount: 'Zasadniczo 100% podstawy za okres macierzyński i 70% za rodzicielski. Przy wniosku w ciągu 21 dni po porodzie można wybrać 81,5% za oba okresy. Wyłączne 9 tygodni drugiego rodzica płatne jest w wysokości 70%.',
    appeal: allowanceAppeal, more: 'Formularze sprawdzone 21.11.2026: gdy wypłaca ZUS, pracodawca przekazuje Z-3, a przy zleceniu stosuje się Z-3a. Od 24.10.2026 Z-3b nie jest ogólnie wymagany od przedsiębiorcy; aktualne dokumenty dobierz według instrukcji ZUS. Ustal z płatnikiem, kto wysyła załączniki. Szczególny, czasowy dostęp do Z-3b dla pełnomocników w eZUS opisujemy w Teczce sprawy kalkulatora.',
    contact: zusContact, law: 'Ustawa zasiłkowa z 25 czerwca 1999 r., art. 29–31 i 64.'
  },
  'urlop-ojcowski': {
    who: 'Pracownik będący ojcem wychowującym dziecko. Własna działalność lub zlecenie wymagają osobnego sprawdzenia prawa do zasiłku w ZUS.',
    when: 'Po narodzinach, do ukończenia przez dziecko 12 miesięcy. Dla ojca adopcyjnego okres liczy się od uprawomocnienia przysposobienia, z ograniczeniem wieku dziecka do 14 lat.',
    wait: 'Pracodawca musi uwzględnić prawidłowo złożony wniosek. Urlop zaczyna się w podanym terminie.',
    amount: 'Do 2 tygodni urlopu. Zasiłek za ten okres wynosi 100% podstawy wymiaru.',
    appeal: workAppeal, more: 'Do wniosku dołącz wymagany dokument urodzenia albo przysposobienia i oświadczenie, czy korzystałeś już z urlopu na to dziecko. Tygodnie obejmują także weekendy.',
    contact: 'W sprawie urlopu napisz do kadr. O wysokość i wypłatę zasiłku zapytaj płatnika lub ZUS: 22 560 16 00.',
    law: 'Kodeks pracy, art. 182³. Ustawa zasiłkowa, art. 31.'
  },
  'urlop-rodzicielski': {
    who: 'Pracownicy będący rodzicami. Limit jest wspólny dla rodziców dziecka. Osoba ubezpieczona poza etatem może sprawdzić prawo do zasiłku za odpowiadający okres.',
    when: 'Urlop można podzielić maksymalnie na 5 części, do końca roku kalendarzowego, w którym dziecko kończy 6 lat.',
    wait: 'Wniosek złożony z wymaganym wyprzedzeniem wiąże pracodawcę. Urlop rozpoczyna się w terminie wskazanym we wniosku.',
    amount: 'Zwykle 41 tygodni łącznie przy jednym dziecku albo 43 przy porodzie mnogim. Zasiłek zasadniczo wynosi 70% podstawy, a w wariancie uśrednionym 81,5%. Wyłączne 9 tygodni drugiego rodzica to 70%.',
    appeal: workAppeal, more: 'Podaj daty i wykorzystane już części urlopu. Rodzice mogą korzystać równocześnie, lecz oboje zużywają wtedy wspólną pulę. Zaświadczenie „Za życiem” może zwiększyć wymiar.',
    contact: 'Dział kadr każdego z rodziców przyjmuje jego wniosek. Pytania o zasiłek skieruj do płatnika lub do ZUS.',
    law: 'Kodeks pracy, art. 182¹a i 182¹c–182¹d. Ustawa zasiłkowa, art. 31.'
  },
  '800-plus': {
    who: 'Między innymi rodzic, z którym dziecko mieszka i który je utrzymuje, opiekun prawny lub faktyczny. Dochód rodziny nie jest kryterium. Przy pobycie transgranicznym i statusie UKR obowiązują dodatkowe warunki.',
    when: 'Od narodzin do ukończenia 18 lat. Na kolejny okres świadczeniowy (czerwiec–maj) trzeba złożyć kolejny wniosek.',
    wait: 'Na nowy okres kompletny wniosek z lutego–kwietnia oznacza wypłatę do końca czerwca, majowy do końca lipca, czerwcowy do końca sierpnia. Przy noworodku zachowaj potwierdzenie i sprawdzaj informację o przyznaniu w eZUS.',
    amount: '800 zł za pełny miesiąc na dziecko. Za miesiąc urodzenia kwota jest proporcjonalna. Przy sądowej opiece naprzemiennej w porównywalnych okresach każde z rodziców może dostać połowę.',
    appeal: 'Od odmowy odwołaj się do Prezesa ZUS w ciągu 14 dni od doręczenia w eZUS. Następnie można złożyć skargę do wojewódzkiego sądu administracyjnego w ciągu 30 dni od doręczenia decyzji Prezesa.',
    more: 'Wniosek rodzica SW-R możesz wysłać przez eZUS, mZUS, Emp@tię albo bank udostępniający tę usługę. ZUS kieruje korespondencję na konto eZUS także wtedy, gdy wniosek wysłano przez bank.',
    contact: zusContact, law: 'Ustawa z 11 lutego 2016 r. o pomocy państwa w wychowywaniu dzieci.'
  },
  rodzicielskie: {
    who: 'Zwykle matka osobiście opiekująca się dzieckiem, gdy żaden rodzic nie pobiera zasiłku macierzyńskiego za ten okres. Może to być np. studentka lub osoba bez pracy. Ojciec w określonych przypadkach, m.in. po śmierci matki lub przejęciu opieki po co najmniej 14 tygodniach pobierania świadczenia przez matkę.',
    when: 'Od narodzin albo objęcia opieką lub przysposobienia. Przy jednym dziecku zwykle przez 52 tygodnie, przy dwojgu 65, trojgu 67, czworgu 69, pięciorgu lub więcej 71.',
    wait: localWait, amount: 'Podstawowa kwota to 1000 zł za pełny miesiąc, niezależnie od dochodu. Za część miesiąca wypłata jest proporcjonalna. Przy porodzie mnogim przysługuje jedno świadczenie. Jeśli matka pobierała zasiłek dla bezrobotnych, podaj gminie daty jego pobierania. W przypadkach określonych w art. 17c ust. 6 świadczenie stanowi różnicę między 1000 zł a tym zasiłkiem po odliczeniu zaliczki na podatek.',
    appeal: familyAppeal, more: 'Przy hospitalizacji noworodka możesz wnioskować o wydłużenie okresu. Przygotuj zaświadczenie ze szpitala. Termin dodatkowego wniosku mija z końcem miesiąca następującego po podstawowym okresie świadczenia.',
    contact: municipalContact, law: 'Ustawa z 28 listopada 2003 r. o świadczeniach rodzinnych, art. 17c i 24.'
  },
  becikowe: {
    who: 'Rodzic, opiekun prawny lub faktyczny po spełnieniu warunków pobytu i dochodu. Dochód rodziny na osobę nie może przekroczyć 1922 zł netto miesięcznie.',
    when: 'Po narodzinach żywego dziecka. Przy adopcji lub objęciu opieką złóż wniosek w ciągu 12 miesięcy od tego zdarzenia, przed pełnoletnością dziecka.',
    wait: localWait, amount: 'Jednorazowo 1000 zł na każde dziecko, na wskazane konto lub przekazem pocztowym.',
    appeal: familyAppeal, more: 'Przy samotnym wychowywaniu co do zasady trzeba mieć ustalone alimenty. Wyjątki obejmują m.in. śmierć drugiego rodzica, nieznane ojcostwo, oddalenie powództwa alimentacyjnego oraz orzeczoną opiekę naprzemienną.',
    contact: municipalContact, law: 'Ustawa z 28 listopada 2003 r. o świadczeniach rodzinnych, art. 15b.'
  }
};

const caseQuestions = {
  "paszport-dziecka": [
    "Kto może złożyć wniosek?",
    "Kiedy zająć się paszportem?",
    "Jak długo trwa wydanie paszportu?",
    "Jak długo paszport będzie ważny?",
    "Co zrobić w razie odmowy lub sporu o zgodę?"
  ],
  "dowod-dziecka": [
    "Kto wnioskuje o dowód?",
    "Kiedy mogę wyrobić dowód?",
    "Kiedy dowód będzie gotowy?",
    "Ile lat obowiązuje dokument?",
    "Co zrobić, gdy gmina odmówi?"
  ],
  "odpis-urodzenia": [
    "Kto może zamówić odpis?",
    "Kiedy można złożyć wniosek?",
    "Ile poczekam na odpis?",
    "Którą wersję wybrać?",
    "Co zrobić w razie odmowy?"
  ],
  "ekuz-rodziny": [
    "Kto może otrzymać EKUZ?",
    "Kiedy wnioskować dla rodziny?",
    "Kiedy dostanę kartę?",
    "Czego EKUZ nie pokrywa?",
    "Co zrobić, gdy NFZ nie potwierdza uprawnień?"
  ],
  "ikp-dziecka": [
    "Kto ma dostęp do IKP dziecka?",
    "Kiedy zajrzeć na konto?",
    "Kiedy zobaczę dziecko w swoim profilu?",
    "Co mogę załatwić w IKP dziecka?",
    "Co zrobić, jeśli konto się nie pokazuje?"
  ],
  "polozna-poz": [
    "Kto może wybrać położną?",
    "Kiedy umówić się na edukację?",
    "Kiedy spodziewać się kontaktu?",
    "O co mogę zapytać na wizycie?",
    "Co zrobić, jeśli placówka nie przyjęła deklaracji?"
  ],
  "lekarz-poz-dziecka": [
    "Kto podpisuje deklarację?",
    "Kiedy zapisać dziecko do przychodni?",
    "Ile trwa przyjęcie deklaracji?",
    "W czym pomoże zespół POZ?",
    "Co zrobić, jeśli lekarz nie przyjmuje nowych pacjentów?"
  ],
  "uznanie-ojcostwa": [
    "Kiedy rodzice mogą uznać ojcostwo?",
    "Czy można to zrobić przed porodem?",
    "Kiedy urząd przyjmie oświadczenia?",
    "Co to zmienia dla rodziny?",
    "Co zrobić, gdy USC nie może przyjąć oświadczenia?"
  ],
  "karta-duzej-rodziny": [
    "Komu w rodzinie przysługuje karta?",
    "Do jakiego wieku dziecko może korzystać?",
    "Kiedy odbierzemy karty?",
    "Jakiej zniżki możemy użyć przy paszporcie?",
    "Jak odwołać się od odmowy?"
  ],
  "chorobowe": [
    "Kto powinien sprawdzić ubezpieczenie?",
    "Kiedy sprawdzić zgłoszenie?",
    "Czy dane są już widoczne?",
    "Czy sprawdzenie kosztuje?",
    "Jak poprawić błędne zgłoszenie?"
  ],
  "becikowe-przygotowanie": [
    "Komu potrzebne jest zaświadczenie?",
    "Kiedy poprosić o dokument?",
    "Kiedy dostanę dokument?",
    null,
    "Co zrobić z błędem w zaświadczeniu?"
  ],
  "profil": [
    "Kto może założyć profil?",
    "Kiedy założyć profil?",
    "Kiedy profil będzie aktywny?",
    "Czy profil jest bezpłatny?",
    "Co zrobić, gdy potwierdzenie się nie uda?"
  ],
  "praca-ciaza": [
    "Komu przysługuje ochrona?",
    "Kiedy można skorzystać ze zwolnienia?",
    "Kiedy pracodawca dostosuje pracę?",
    "Czy badanie w godzinach pracy jest płatne?",
    "Co zrobić, gdy pracodawca odmawia?"
  ],
  "urodzenie": [
    "Kto może zgłosić urodzenie?",
    "Kiedy można zgłosić dziecko?",
    "Kiedy będzie gotowy akt?",
    "Co otrzymasz z USC i ile to kosztuje?",
    "Co zrobić, jeśli USC odmówi przyjęcia imienia?"
  ],
  "ubezpieczenie-dziecka": [
    "Kto zgłasza dziecko?",
    "Kiedy ponowić zgłoszenie?",
    "Kiedy dziecko pojawi się w IKP?",
    "Czy zgłoszenie zwiększa składkę?",
    "Co zrobić, jeśli brakuje zgłoszenia?"
  ],
  "macierzynski": [
    "Komu przysługuje zasiłek?",
    "Za jaki okres przysługuje zasiłek?",
    "Kiedy nastąpi wypłata?",
    "Jak wysoki będzie zasiłek?",
    "Jak odwołać się od odmowy wypłaty?"
  ],
  "urlop-ojcowski": [
    "Kto może wziąć urlop ojcowski?",
    "Do kiedy wykorzystać urlop?",
    "Czy potrzebujesz zgody pracodawcy?",
    "Ile urlopu i jaki zasiłek przysługują?",
    "Co zrobić w razie odmowy urlopu?"
  ],
  "urlop-rodzicielski": [
    "Kto może wziąć urlop rodzicielski?",
    "Jak rozłożyć urlop w czasie?",
    "Kiedy można rozpocząć urlop?",
    "Ile tygodni i jaki zasiłek przysługują?",
    "Co zrobić w razie odmowy urlopu?"
  ],
  "800-plus": [
    "Kto może otrzymać 800+?",
    "Na jaki okres przysługuje 800+?",
    "Kiedy ZUS wypłaci 800+?",
    "Ile wynosi świadczenie?",
    "Jak odwołać się od decyzji ZUS?"
  ],
  "rodzicielskie": [
    "Kto może otrzymać świadczenie?",
    "Przez ile tygodni można je pobierać?",
    "Kiedy dostaniesz decyzję?",
    "Ile wynosi świadczenie rodzicielskie?",
    "Jak odwołać się od decyzji?"
  ],
  "becikowe": [
    "Kto może otrzymać becikowe?",
    "Od kiedy można ubiegać się o becikowe?",
    "Kiedy dostaniesz decyzję?",
    "Ile wynosi becikowe?",
    "Jak odwołać się od decyzji?"
  ]
};
