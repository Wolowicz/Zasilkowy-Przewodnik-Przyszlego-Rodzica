# Walidacja Otuli względem materiałów ZUS

Stan przeglądu: **21.11.2026**. Zakres: lokalnie dostarczone materiały organizatora, pełny brief (16 stron), regulamin zadania (4 strony) oraz aktualny kod `otula/dist/zus.js`. To ocena zespołu, nie akceptacja ZUS ani opinia prawna. Zmiana kodu wymaga ponowienia odpowiednich pozycji przeglądu.

## Aktualny stan po rozszerzeniu katalogu

### Nowy wywiad sytuacyjny

Kontrola techniczna obejmuje syntetyczne rodziny, pytania zależne od odpowiedzi, rozróżnienie ról i podstaw, liczenie okresów i wspólnej liczby części oraz przejście od odpowiedzi do właściwego druku. Ręcznego oznaczenia „Przyznano” ani uzupełnienia formularza nie wykorzystuje się jako dowodu wypłaty. Do walidacji interfejsu służą [zrzuty i widoki testowe](../otula/materialy/zrzuty-final/).

Do uzgodnienia z mentorem pozostają zwłaszcza kwalifikacja granicznych dni hospitalizacji i wieloraczków, wnioski przy zmianie etatu podczas wydłużonego rodzicielskiego, daty i stawki przy historycznych częściach obojga rodziców oraz postępowanie z nakładającymi się tytułami ubezpieczenia. Zestawy testowe potwierdzają zachowanie aplikacji na podanych warunkach. Niezależne porównanie faktycznych kwot i okresów wymaga wzorcowych rozstrzygnięć z ustaloną podstawą i historią wypłat.

**86 rozpoznawanych spraw nie oznacza 86 zweryfikowanych wyliczeń.** Zestaw ma 87 PDF, ale dwa mają identyczny SHA-256. Po usunięciu jednej kopii pozostaje 86 unikalnych dokumentacji, łącznie 2008 stron. Lokalny OCR jest dostępny dla całego zestawu; jego dostępność nie oznacza, że każda strona została bezbłędnie odczytana lub sprawdzona wizualnie.

| Miara | Wynik | Co dokładnie potwierdza |
| --- | --- | --- |
| Oryginalne PDF rozpoznawane w aplikacji | 86/86 | Skrót odpowiada kluczowi szyfrowanego rekordu; zachowano wcześniejsze 10, dodano 76. |
| Częściowy odczyt wyniku | 57 | 46 przyznań/adnotacji o wypłacie i 11 odmów. Adnotacja o wypłacie nie potwierdza jej kwoty. |
| Rozstrzygnięcie nieustalone | 29 | Rozpoznany plik, lecz brak pewnego odczytu końcowej decyzji. Nie jest to odmowa ani domyślne przyznanie. |
| Zweryfikowane kwoty | **0** | Nie zamknięto niezależnego porównania podstawy, stawki dziennej i należnej/wypłaconej kwoty. |
| Test rzeczywistego szyfrowania/odszyfrowania | 86/86 | Lokalny roundtrip odtworzył opisy i wszystkie 10 wcześniejszych identyfikatorów plików. To test techniczny. |

Każdy rekord ma anonimowy identyfikator, `walidacja`, `zrodla` ze stronami i ograniczeniami. Lokalny, niepublikowany audyt wiąże rekord ze skrótem PDF i OCR. Nazwy plików są usuwane z payloadu. Jawny JSON, skany i OCR nie trafiają do repozytorium, witryny ani modelu; do frontendu trafia AES-GCM oraz agregaty. Odczyt w przeglądarce wymaga oryginalnego PDF, który nie opuszcza urządzenia. Szyfrowanie nie zastępuje zgody organizatora na sposób demonstracji materiałów.

Skorygowano również wcześniejsze opisy: wniosek wcześniaka bez czytelnej decyzji ma stan `nieustalona`; 7 dni ojcowskiego nie jest traktowane jako pełne 14 dni; przy adopcji pierwotny wniosek jest oddzielony od dłuższego okresu wypłaty. W sprawie z uchyloną odmową opisano późniejsze rozstrzygnięcie. Nie uzupełniano brakujących kwot założeniami kalkulatora.

## Aktualna implementacja kalkulatora

| Obszar | Działa | Granica dowodu lub modelu |
| --- | --- | --- |
| Standard, Za życiem, oboje rodzice | Odrębne pule, 9 tygodni nieprzenoszalnych, niezależna liczba tygodni i daty rodziców; również rodzicielski ojca przy nieubezpieczonej matce. | Nie ustala tytułu ubezpieczenia z dokumentów i nie odejmuje całej historycznej puli. |
| Wniosek 81,5% (B3) | Wniosek przed porodem nie jest odrzucany; górna granica 21 dni. | Termin urlopowy i warunki prawa nadal wymagają właściwych dokumentów. |
| Brak dnia rodzicielskiego w pierwszym roku (B2) | Osobna deklaracja, 100% macierzyński, późniejszy rodzicielski 70%, pokazane wyrównanie. | Symulacja bez potwierdzania rzeczywistej historii wypłat. |
| Minimalna podstawa i podwyższenie (B1) | Minimum dla pracownika zależy od roku i wymiaru etatu; osobny pomocnik podwyższenia z ręcznym PIT i innymi zasiłkami netto. | Nie odtwarza podstawy z historii płac, nie zgaduje PIT, nie potwierdza przelewu. |
| Adopcja/piecza (B4) | Skrócony macierzyński w dniach, gwarantowane minimum 63 dni przy przyjęciu przed granicą, pule 38/62. | Rodzicielski przekraczający 7/10/14 lat zatrzymany do indywidualnego ustalenia; to ograniczenie symulacji, nie odmowa. |
| Hospitalizacja (B5) | Pomocnik masy/tygodnia ciąży/pobytów; sumowanie z usunięciem nakładania, jedno zaokrąglenie, limit 8/15 tygodni; segment 100% między macierzyńskim a rodzicielskim. | Jedna nieprzerwana ścieżka pierwszego rodzica. Przejęcia, przerwy i interpretacja granicznych dni wymagają dodatkowego sprawdzenia. |
| Stała praca do połowy etatu (B10) | Redukcja kwoty względem wymiaru umowy; dwa etapy pomijania niepełnego dnia przy wydłużeniu; dzienne zaokrąglenia etapami. | Zmienny wymiar i wcześniejsze zakończenie nadal wymagają odcinków. Komentarz ZUS pkt 182 ma niespójny przykład liczbowy, więc nie jest wzorcem kwoty. |
| Parametry (B11) | Walidowany lokalny zapis, reset, daty obowiązywania i oznaczenie parametrów własnych. | Brak serwerowych wersji zatwierdzanych przez administratora. |
| Zadłużenie (B6) | Pokazowy stan na dzień zdarzenia i osobna kwota dla rodziców; kontrola progu 1% minimum z roku początku prawa. Nieznana kwota nie jest zerem. | Nie jest samodzielnym rozstrzygnięciem ZUS ani pełnym modelem spłaty, przedawnienia i osób współpracujących. |

Testy `zus.test.cjs` pozostają syntetyczne. `sprawy.test.cjs` dodatkowo kontroluje brak jawnych danych, odrzucenie obcego/zmienionego PDF, brakującego pliku, duplikatu i niepoprawnego statusu, statystyki oraz zakaz domyślnego przyznania. Pełne `npm test` i roundtrip katalogu przechodzą; nie nazywamy tego walidacją prawną wszystkich spraw.

## Otwarte pytania merytoryczne

1. **Granica wieku:** lokalny art. 183 § 3, § 4² i § 4⁵ (s. 8–9) daje minimum i pule 38/62, ale w tych ustępach nie powtarza końcowej granicy 14 lat. [Instrukcja ZUS](https://bip.zus.pl/pl/web/guest/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-dodatkowego-urlopu-rodzicielskiego), aktualizacja 25.07.2025, ogólnie ogranicza rodzicielski po przyjęciu do 7/10/14 lat. Do wyjaśnienia z mentorami, bez automatycznego przyznawania po granicy. Koniec roku 6 lat dotyczy urodzenia; nie przenosimy go mechanicznie na pieczę.
2. **Dni hospitalizacji:** potwierdzić na jednoznacznym przykładzie ZUS wliczanie dnia porodu i granic okna 8/15 tygodni. Kod po przeglądzie przyjmuje dzień porodu jako 0 i dla wcześniaka liczy od kolejnego dnia (do +56/+105), a dla dziecka donoszonego od +5 do +56. Pokrewne [wyjaśnienie MRPiPS o świadczeniu rodzicielskim](https://www.gov.pl/web/rodzina/informacja-w-sprawie-ustawy-z-dnia-6-grudnia-2024-r-o-zmianie-ustawy---kodeks-pracy-oraz-niektorych-innych-ustaw-dz-2024-poz-1871--nowelizacja-przepisow-ustawy-o-swiadczeniach-rodzinnych-dotyczaca-swiadczenia-rodzicielskiego) wyłącza dzień porodu, lecz dotyczy innego świadczenia; nie jest samo w sobie potwierdzeniem reguły zasiłku macierzyńskiego.
3. **Kwoty:** poprosić o czytelny wynik kontrolny: ustalona podstawa, stawka, kwota dzienna, okres i informacja brutto/netto. Sama tabela wynagrodzeń albo zdanie o przyznaniu nie wystarczą.
4. **Materiały chronione:** potwierdzić dopuszczalność pokazywania jurorowi szyfrowanego opracowania odblokowanego jego oryginalnym plikiem. Dokumentów źródłowych nie publikujemy.

## Priorytety przed deklaracją kompletności

- Dokończyć 29 nieustalonych rozstrzygnięć i osobno zweryfikować kwoty wybranych spraw z czytelnym wynikiem oczekiwanym.
- Zweryfikować z mentorem powyższe granice i dopisać testy konkretnego rozstrzygnięcia.
- Uzupełniać historię wcześniejszego wykorzystania, przejęcia, przerwy, ojcowski oraz podstawy z dokumentów dopiero z oddzielnymi dowodami.
- Opis dla jury i prezentacja mają mówić „86 rozpoznawanych plików, 0 zweryfikowanych kwot”, a nie „86 poprawnie policzonych spraw”. [Przygotowanie do rozmowy](ROZMOWA-Z-JURY.md).

## Historia — co sprawdzono we wcześniejszych etapach

**Poniższe sekcje są zapisem wcześniejszych etapów z 21.11.2026. Ich liczby 4/10 spraw i listy otwartych poprawek nie opisują obecnej wersji. Aktualny stan podano powyżej. Zachowano je dla śladu przeglądu.**

Archiwum przekazane przez właścicielkę zawiera sześć ogólnych materiałów: wyciąg Kodeksu pracy, wyciąg ustawy zasiłkowej, dwa rozporządzenia dotyczące dokumentowania uprawnień, tabelę okresów/stawek/podstaw oraz poradnik ZUS dla rodziców z 2026 r. Odczytano tekst lokalnie, z pamięci archiwum. Dokumentów nie dodano do repozytorium, strony ani bazy asystenta; nie wysłano ich do API OpenRouter ani do asystenta działającego w aplikacji.

W drugim archiwum dostarczono następnie **87 skanowanych plików PDF z przykładowymi sprawami**. Wybrano cztery sprawy: standardową, adopcyjną, pracę podczas rodzicielskiego i odmowę. Odczytano 74 strony przez lokalny OCR, a 18 kluczowych stron sprawdzono wizualnie (14 w pierwszym przeglądzie i 4 w dodatkowej kontroli podstawy). Nie wysyłano skanów do usług zewnętrznych. Liczba plików nie oznacza liczby przetestowanych scenariuszy. Wynik próby to trzy częściowe zgodności okresu lub blokady oraz jedna sprawa wykraczająca poza model; **żadna z czterech nie ma zamkniętej walidacji kwoty**.

Poniżej zapisano wyłącznie własne wnioski, zakres implementacji i odwołania. Numer strony oznacza stronę pliku PDF liczoną od 1, która może różnić się od numeru drukowanego. Tabela DOCX nie ma stabilnej paginacji; odwołujemy się do jej tematów.

## Historia — Wynik przeglądu

Podstawowe parametry standardowej ścieżki są zgodne z dostarczonymi materiałami. Aplikacja pozostaje **częściowym kalkulatorem scenariuszy z gotową podstawą**, a nie kompletnym silnikiem ustalania uprawnień i podstaw ze wszystkich dokumentów. Interfejs ma oznaczać symulację i pokazywać granice obliczenia przed interpretacją wyniku. Wykrycie sytuacji szczególnej i wstrzymanie kwoty ogranicza ryzyko błędu, lecz samo w sobie nie realizuje wymagania obliczenia tej sytuacji.

| Obszar | Materiał i odwołanie | Stan implementacji |
| --- | --- | --- |
| Standardowy macierzyński | Kodeks pracy, art. 180; tabela okresów | Parametry 20/31/33/35/37 tygodni zależą od liczby dzieci z jednego zdarzenia. Zgodne w standardowym zakresie. |
| Rodzicielski i Za życiem | Kodeks pracy, s. 6, art. 182¹a | Pule 41/43 oraz 65/67 tygodni i 9 tygodni nieprzenoszalnych są zapisane oddzielnie. |
| Stawki | Ustawa zasiłkowa, s. 8–9, art. 30a i 31 | 100%, 70%, warunkowe 81,5%; własne 9 tygodni drugiego rodzica ma 70%. Sprawdzany termin wniosku 0–21 dni. |
| Łączenie z pracą | Kodeks pracy, s. 7, art. 182¹e–f; ustawa, s. 9, art. 31 ust. 4a | Model stałego wymiaru do połowy etatu przez cały okres i jego przedłużenie. Nie obsługuje różnych odcinków pracy ani innego wymiaru podczas przedłużenia. |
| Obliczenie dzienne | Ustawa zasiłkowa, s. 9–10, art. 36–37 | Podana podstawa dzielona przez 30, zastosowanie stawki i proporcji pracy. Zaokrąglenia do grosza wymagają porównania z wynikami spraw ZUS. |
| Podstawa z wynagrodzeń | Ustawa, s. 9–11, art. 36–43 i 45–47; tabela podstaw | Nie jest wyliczana z historii płac. Brak modelu uzupełniania miesięcy, premii kwartalnych/rocznych, zmian etatu i ponownego ustalania podstawy. Można wprowadzić podstawę uprzednio ustaloną przez płatnika. |
| Podstawa działalności/zlecenia | Ustawa, s. 11–13, art. 48–52 | Gotowa podstawa wejściowa. Nie ma osobnego algorytmu dla krótszego ubezpieczenia, nadwyżki deklarowanej podstawy i poprzednich tytułów. |
| Podwyższenie niskiego zasiłku | Ustawa, s. 9, art. 31 ust. 3a–3c | Wyłączone z kwoty i opisane w założeniach. Nie można przedstawiać wyniku jako przewidywanego przelewu netto. |
| Ubezpieczony ojciec, matka bez ubezpieczenia | Ustawa, s. 9, art. 31 ust. 3h; Kodeks, s. 6, art. 182¹a | Dodano odrębną standardową ścieżkę porodu: ojciec ma 70% własnej podstawy za wybrane pełne tygodnie, do 32/34 lub 56/58 przy Za życiem. Jego własne 9 tygodni mieści się w tej puli; 9 tygodni matki nie przechodzi na ojca. Bez macierzyńskiego matki, przejęć i już wykorzystanych okresów. |
| Adopcja i niezawodowa piecza | Kodeks, s. 8–9, art. 183; ustawa, s. 7, art. 29 | Obsługiwane standardowe pule i kontrola wieku. Skrócone okresy, minimalny okres 9 tygodni oraz warianty rodzicielskiego 38/62 tygodnie wymagają osobnego modelu; obecnie kierują do sprawdzenia. |
| Wcześniactwo i hospitalizacja | Kodeks, s. 5–6, art. 180²; ustawa, s. 9, art. 31 ust. 1 | Materiały określają dodatkowe okresy do 15 lub 8 tygodni zależnie od warunków. Kod informuje i wstrzymuje standardowy wynik, lecz nie liczy dodatkowego okresu. |
| Ojcowski | Kodeks, s. 7–8, art. 182³; ustawa, s. 9, art. 31 ust. 1 | Jest karta informacyjna. Dwa tygodnie i ich kwota nie są wliczone do sumy kalkulatora. |
| Przejęcia, strata i przerwy | Kodeks, s. 3–6; ustawa, s. 7–8, art. 29–30 | Wykrycie ogólnej sytuacji i wskazówki. Brak segmentów przejęcia, odliczania okresu już wykorzystanego i pełnej kwalifikacji wyjątków. |
| Zadłużenie | Poradnik, s. 25 i 37 | Wybór „do sprawdzenia”/„wyjaśniono”/„zadłużenie”. Brak liczbowego progu, daty spłaty i pełnego ustalania skutków. Sama informacja „dług” nie przesądza wszystkich uprawnień. |
| Chronologia opieki | Kodeks, s. 6–9; ustawa, s. 8–9 | Suma tygodni, bez osi rzeczywistych dat obojga rodziców, maksymalnej liczby części i kontroli wcześniejszego wykorzystania. Stawka 81,5% zakłada co najmniej jeden dzień rodzicielskiego w pierwszym roku. |
| Dokumenty | Rozporządzenie o dokumentach zasiłkowych, s. 3–9, zwłaszcza § 13–31 | Linki i ogólne listy. Do pełności potrzebna lista dopasowana m.in. do przejęć, historii drugiego rodzica, podwyższenia oraz właściwego płatnika. |

## Historia — Mapa wymagań briefu

| Wymaganie | Ocena i dowód |
| --- | --- |
| Indywidualne informacje w ciąży | Częściowo: karty chorobowego, rehabilitacyjnego i utraty zatrudnienia; nie jest to pełny algorytm przyznania/odmowy na podstawie dokumentów. |
| Zintegrowany kalkulator obojga rodziców, pracy i przyjęcia dziecka | Jeden ekran i standardowe warianty działają; wyjątki i podstawy mają ograniczenia opisane wyżej. |
| Dokumenty, terminy, płatnik i ryzyka | Działający katalog, wybór płatnika, terminy, Karta wsparcia; dobór dokumentów pozostaje częściowo ogólny. |
| Symulacje mObywatela, ZUS, e-ZLA, długu i wniosków | Są jawnie fikcyjne i lokalne. To odpowiada wymogowi symulacji, lecz przykładowy formularz nie zastępuje kompletnego aktualnego ZAM. |
| Wsparcie charytatywne w szczególnych sytuacjach | Są odnośniki do organizacji. Przed zgłoszeniem sprawdzić aktualny zakres pomocy oraz warunek wyłącznie charytatywnego charakteru wskazanych usług. |
| Upload/wybór PDF i sprawdzenie przypadku | Lokalny PDF, odczyt przez człowieka, ręczne dane i potwierdzenia. Brak automatycznej ekstrakcji/kwalifikacji w aplikacji. OCR nie jest w briefie nazwany obowiązkową technologią. Indywidualne zestawy dostarczono; niezależna walidacja jest w toku. |
| Zmienne parametry | Istnieje sesyjny panel demonstracyjny. Produkcja potrzebuje wersji obowiązujących w czasie, zatwierdzania zmian i uprawnień. |
| Aplikacja webowa RWD | HTML/CSS/JavaScript z API AI. React/Next.js są preferowane, a nie obowiązkowe; obecny stos nie wyklucza zgodności. Responsywność wymaga osobnego sprawdzenia wizualnego. |
| Repozytorium, demo, zrzuty, wskazanie AI | Elementy istnieją. Trzeba zapewnić jury dostęp i wskazać, że reguły kalkulatora nie są odpowiedzią modelu. |
| Prezentacja do 10 slajdów i film do 3 minut | Warunek formalny do sprawdzenia na finalnych plikach. Film ma być publicznie dostępny; dostęp do prywatnego repozytorium nie zastępuje otwartego linku do filmu. Aktualizacja materiałów pozostaje odrębnym etapem. |

## Historia — Konflikt wersji źródeł

Poradnik z archiwum na stronach PDF 27 i 36 opisuje użycie Z-3b. Fragment briefu na stronie 12 wskazuje likwidację tego formularza od 24.10.2026, wraz ze zmianami ZUR i ZAO. Aplikacja odsyła do nowszych komunikatów ZUS, w tym szczególnego komunikatu dla pełnomocników. Nie należy przywracać starej listy formularzy wyłącznie dlatego, że występuje w poradniku z oznaczeniem 2026. Przy każdym formularzu potrzebna jest data instrukcji i właściwa rola użytkownika.

## Historia — Próba czterech dostarczonych spraw

Poniższe identyfikatory są roboczymi oznaczeniami zespołu, a nie identyfikatorami osób. Nie zamieszczamy dat rodzin, danych płacowych ani kopii dokumentów. Mapowanie do lokalnego archiwum pozostaje u zespołu. Odróżniamy okres **wnioskowany**, przyznany i rzeczywiście wypłacony; ich różnica sama w sobie nie oznacza błędu.

| Próba | Lokalnie sprawdzone strony | Wynik i granica dowodu |
| --- | --- | --- |
| V1 — standard, zmiana etatu | Sprawa 8-stronicowa: strony 1, 3–8 | Okres macierzyński odpowiada 140 dniom; schemat 20 + 32 tygodnie daje 364 dni. Reguły odtwarzają ten wymiar. Kwota pozostaje niezweryfikowana: historia obejmuje zmianę etatu, więc nie wolno automatycznie uśredniać wszystkich wcześniejszych wynagrodzeń. Dodatkowy przegląd nie ujawnił osobnej ustalonej podstawy, stawki dziennej ani wypłaconej kwoty; sama adnotacja o wypłacie za okres ich nie zastępuje. |
| V2 — adopcja i późniejsze Za życiem | Sprawa 16-stronicowa: strony 2, 6, 12, 13, 15 | Wariant 20 + 56 tygodni odpowiada 532 dniom. Ustawienie Za życiem z pulą 65 tygodni i 9 tygodniami zastrzeżonymi drugiemu rodzicowi odtwarza ten wymiar. Kwota niezweryfikowana: potrzebne osobne ustalenie podstawy przy krótkim dobrowolnym ubezpieczeniu. |
| V3 — brak ubezpieczenia / odmowa | Sprawa 22-stronicowa: strony 1, 5 | Dokumenty pokazują odmowę powiązaną z wyłączeniem z ubezpieczenia. Dodatnia kwota dla osoby bez potwierdzonego uprawnienia jest blokowana. To zgodność bezpiecznego zachowania, a nie dowód samodzielnego ustalenia tytułu lub odtworzenia decyzji. Później dodana, odrębna ścieżka ubezpieczonego ojca nie zmienia rozstrzygnięcia o matce; wymaga własnych potwierdzonych danych ojca. |
| V4 — praca w części etatu, zakończenie, podwyższenie | Sprawa 28-stronicowa: strony 1, 13, 15, 25 | Poza aktualnym modelem: faktyczny okres zakończono wcześniej, a wypłata obejmowała podwyższenie do minimum świadczenia rodzicielskiego. Stały, pełny okres pracy na pół etatu nie odtwarza tej sprawy. W różnych dokumentach występują różne okresy wnioskowane; bez ich uporządkowania nie można uznać któregokolwiek za prawidłowy wynik końcowy. |

Odtworzono niezależnie w funkcji `zusCalculation` strukturę okresów 364 i 532 dni oraz blokadę dodatniej kwoty przy braku ubezpieczenia. Użyto własnych dat i technicznej podstawy przykładowej, bez przepisywania danych rodzin do testów. To kontrola struktury reguły, nie pełne porównanie świadczenia należnego konkretnej osobie. Pozostałych 83 plików nie poddano w tej próbie analizie indywidualnej.

## Historia — Niezależny przegląd poprawki dla ojca

Po przeglądzie materiałów poprawiono wcześniejsze blokowanie całego wyliczenia, gdy matka nie ma ubezpieczenia, a ojciec ma potwierdzone własne uprawnienie. Kontrola kodu i 49 dodatkowych sprawdzeń w pamięci objęły wszystkie liczby dzieci (1–5+) z Za życiem i bez, warianty 1 i 9 tygodni, maksymalne pule oraz przekroczenie limitu. Osobno sprawdzono pół etatu i treść wyniku. To autorskie testy reguł, nie nowe sprawy ZUS.

- Ojciec otrzymuje jeden segment rodzicielskiego, standardowo 70%; nie dodaje się macierzyńskiego ani drugiego kompletu 9 tygodni.
- 9 tygodni zastrzeżonych matce pozostaje poza jego pulą. Wynik pokazuje także wybraną i niewybraną część puli ojca.
- Nieistotne dla tej ścieżki pola podstawy, etatu, długu i końca ubezpieczenia matki nie blokują wyliczenia ojca.
- Nieustalone ubezpieczenie, brak podstawy ojca, brak rzeczywistej daty urodzenia, wariant 81,5%, przejęcie, adopcja/piecza i zmienne odcinki pracy nie otrzymują dodatniej kwoty w tej ścieżce.
- Wynik wyjaśnia założenie braku wcześniejszego wykorzystania rodzicielskiego oraz brak PIT, podwyższenia do minimum i historii wypłat. Pokazuje właściwego płatnika ojca. Blokada danych jest opisana jako potrzeba ustalenia, a nie decyzja odmowna.

Pozostają ograniczenia całego kalkulatora: gotowa podstawa, pełne tygodnie zamiast dowolnych dni, brak kalendarza części opieki i indywidualnej kwalifikacji szczególnych przypadków. Przegląd nie wykazał błędu w podziale 9 tygodni ani w standardowej stawce nowej ścieżki.

## Historia — Kolejność dalszych prac

1. **P0 — dowód poprawności:** dokończyć lokalną walidację indywidualnych spraw z oczekiwanym rozstrzygnięciem. Zachować je poza GitHubem, serwerem AI i publicznym demo; nie przepisywać danych osób do dokumentacji. Ustalić z organizatorem dozwolony sposób demonstracji materiałów.
2. **P0 — granice wyniku:** żaden wynik orientacyjny, puste ubezpieczenie ani blokada wariantu nie mogą udawać decyzji urzędowej. Osobno pokazywać „brak danych”, „wariant poza zakresem” i potwierdzoną przesłankę do odmowy.
3. **P1 — zakres podstaw:** odtworzyć podstawę z dokumentów wybranych spraw lub jawnie wymagać już ustalonej podstawy. Jeśli dodajemy mechanizm z historii płac, potrzebne są osobne testy miesięcy niepełnych, zmiany etatu, dodatków i działalności.
4. **P1 — uprawnienia rodzin:** po dodaniu standardowej ścieżki ojca uzupełnić skrócone okresy przyjęcia dziecka, uzupełniający i ojcowski. Dodać testy granic wieku, masy, tygodnia ciąży i hospitalizacji przed odblokowaniem wyników. Rozwinąć ścieżkę ojca o wcześniejsze wykorzystanie i rzeczywiste części opieki.
5. **P1 — rzeczywisty podział w czasie:** okresy obojga rodziców, wcześniejsze wykorzystanie, równoczesność, części, termin wniosku i łączenie z pracą w odcinkach. Nie wystarczy porównać sumy tygodni.
6. **P2 — produkcja i prezentacja:** trwałe wersjonowanie reguł, kontrola dostępu administratora, audyt bezpieczeństwa, niezależny przegląd merytoryczny i finalne materiały z rzeczywistych ekranów.

## Historia — Jak zapisywać testy

Testy w `otula/tests/zus.test.cjs` są **autorskimi scenariuszami syntetycznymi**. Po poprawce ścieżki ojca przeszły 52 przypadki oraz kontrola izolacji szkiców dzieci. Sprawdzają m.in. standardowe okresy, stawki, mnożniki pracy, granicę 21 dni, brak danych i wieloraczki. Pozytywny wynik tych testów nie oznacza pokrycia prawa. Wynik przeglądu dostarczonych spraw opisano osobno powyżej.

Dla otrzymanych spraw ZUS prowadzić lokalną, niepublikowaną kartę: anonimowy identyfikator, ustalone dane, oczekiwane rozstrzygnięcie, wynik aplikacji, różnica w dniach/kwocie, przyczyna, poprawka i wynik ponownego testu. Repozytorium może zawierać agregat liczby spraw i rodzaju usterek oraz własne pozbawione danych osobowych testy reguł; nie powinno zawierać skanów, dokumentów ani przepisanych danych rodzin.

Za zweryfikowany uznajemy tylko konkretny scenariusz z porównanym wynikiem. Brak wymaganej informacji oznacza „nie można zweryfikować”, a nie wynik pozytywny.

## Historia — Przegląd reguł względem materiałów ZUS — 21.11.2026, wieczór

Drugi, niezależny przegląd porównał około 70 wartości ilościowych z wyciągów ustawy zasiłkowej, Kodeksu pracy, rozporządzeń i tabeli okresów z kodem `zus.js` i `catalog.js`. **Standardowa ścieżka jest poprawna**: wymiary 20/31/33/35/37 i 41/43, Za życiem 65/67, 9 tygodni drugiego rodzica po 70%, 81,5% dla matki i dla części ojca ponad 9 tygodni, łączenie z pracą przy stałym etacie, limity wieku 7/10/14 oraz próg płatnika „ponad 20 ubezpieczonych”.

| # | Ustalenie | Stan |
| --- | --- | --- |
| B3 | Wniosek o 81,5% złożony przed porodem był odrzucany; ustawa (art. 30a ust. 1) określa tylko górną granicę 21 dni po porodzie | **Poprawione**, test w `zus.test.cjs` |
| B7 | „Zasiłek w wysokości macierzyńskiego do dnia poprzedzającego poród” – ustawa: „do dnia porodu” (art. 30 ust. 3) | **Poprawione** |
| B8 | Świadczenie rehabilitacyjne opisane tylko jako 100% w ciąży – brakowało 90% (3 mies.) i 75% (art. 19 ust. 1) | **Poprawione** |
| B1 | Brak minimalnej podstawy dla pełnego etatu i podwyższenia do kwoty świadczenia rodzicielskiego (art. 45, 47; art. 31 ust. 3a–3c) | Otwarte – kwoty niskich podstaw mogą być zaniżone; wynik to opisuje |
| B2 | 81,5% bez dnia rodzicielskiego w 1. roku życia: wyrównanie do 100% (art. 31 ust. 3g, ust. 4) | Otwarte |
| B4 | Adopcja/piecza: minimum 9 tygodni, pula 38/62, rozdzielenie limitów wieku | Otwarte |
| B5 | Wcześniactwo/hospitalizacja blokuje cały wynik zamiast dodać urlop uzupełniający (100%) | Otwarte |
| B6 | Zadłużenie: próg, data stanu, osoby współpracujące | Częściowo: zaświadczenie na dzień powstania prawa w `#e-uslugi`; reguła progu otwarta |
| B9 | Drugi rodzic zawsze bierze całą resztę puli | Otwarte |
| B10 | Łączenie z pracą tylko stałym wymiarem przez cały okres | Otwarte (znane ograniczenie) |
| B11 | Panel parametrów: 5 pól, bez dat obowiązywania | Otwarte |
| B12–B13 | Termin ojcowskiego przy adopcji; lista dokumentów rodzicielskiego | Otwarte |

Przykładowe sprawy z zestawu ZUS odczytano lokalnym OCR (Windows, bez wysyłania). Ich opisy są przygotowywane poza repozytorium i trafiają do aplikacji wyłącznie zaszyfrowane kluczem z oryginalnego pliku (`scripts/sprawy-zus/zaszyfruj.mjs`): juror z plikiem może sprawdzić wyliczenie, a nikt bez pliku nie odczyta danych.

Stan danych spraw (21.11.2026): w aplikacji jest 10 reprezentatywnych spraw (w tym 2 odmowy – brak ubezpieczenia i zadłużenie, martwe urodzenie, wcześniak, adopcja, ojcowski, 9 tygodni, łączenie z pracą), odczytanych lokalnie ze skanów. Kwoty, stawki i podstawy pominięto, bo skany nie podają ich czytelnie (część wartości agenci tylko wyliczyli lub założyli). Porównanie z kalkulatorem obejmuje więc decyzję i okresy; pozostałych 76 spraw nie opracowano.
