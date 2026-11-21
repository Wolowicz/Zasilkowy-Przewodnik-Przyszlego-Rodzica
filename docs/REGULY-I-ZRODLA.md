# Reguły obliczeń i utrzymanie treści

Ten dokument opisuje **implementację prototypu**, a nie wiążącą interpretację prawa. Wynik i kwalifikacja wymagają sprawdzenia przez płatnika lub ZUS. Wersja reguł: `2026-11-21`, plik `otula/dist/zus.js`. Katalog spraw zachowuje datę `17.11.2026`; dodanie repozytorium nie oznacza ponownego sprawdzenia wszystkich kart.

## Dane kalkulatora

### Wywiad i wersje parametrów

Z formularza sytuacji można przejść do `#kalkulator/wywiad`. Podstawa pozostaje przypisana do konkretnego rodzica. Datę przewidywaną traktujemy jako plan. Kolejne pobyty różnych dzieci zachowują osobne identyfikatory. Symulacja pracownicza wymaga potwierdzenia wymiaru etatu. Zmiana warunków lub niejasny podział stawki po wcześniej wykorzystanej części mogą wymagać osobnego rozliczenia u płatnika.

Liczba części rodzicielskiego jest wspólna. Wariant kalkulatora rezerwuje jedną nową część na każdego rodzica, który planuje dodatni okres. Dni wcześniejszych części przypisujemy osobom, po czym sprawdzamy pulę rodziny oraz zastrzeżoną część drugiego rodzica. Pokrywające się dni tej samej osoby wymagają poprawienia planu. Źródła: [Kodeks pracy, art. 182¹a–182¹d](https://eli.gov.pl/eli/DU/1974/141/ogl), [MRPiPS o rodzicielskim](https://www.gov.pl/web/rodzina/urlop-rodzicielski) oraz [ustawa zasiłkowa, w tym art. 30a, 31, 45 i 61](https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf).

Panel zapisuje lokalnie okres obowiązywania własnego zestawu parametrów demonstracyjnych, w tym limit części. W kalkulatorze zestaw wybiera data zdarzenia, a próg długu zależy od roku powstania prawa. Własny okres obowiązywania oznacza zakres symulacji zespołu. Reguły poza zakresem pochodzą z ustawień standardowych. Dla roku bez zarejestrowanej płacy minimalnej próg długu pozostaje nieznany. Mechanika panelu nie odtwarza historii wszystkich zmian ustawowych w trakcie jednego urlopu.

Szczegóły rozgałęzień pytań i źródła ich przesłanek opisują [źródła wywiadu](ZRODLA-WYWIADU.md). Wywiad stosuje ustawowe stawki w oszacowaniu, a własne warianty stawek i wymiarów sprawdza się w kalkulatorze. Stan sprawdzenia 21 listopada 2026 r.

Użytkownik podaje rodzaj zdarzenia, liczbę dzieci z jednego porodu/przyjęcia, daty, ubezpieczenie obojga rodziców, gotowe podstawy zasiłku, podział tygodni, wariant stawki i stały wymiar pracy. Liczba wszystkich dzieci w rodzinie nie jest liczbą dzieci urodzonych jednocześnie.

Podstawa jest już ustaloną wartością wejściową. Kalkulator nie przelicza wynagrodzenia netto, historii wypłat, potrąceń, nieobecności ani zbiegu tytułów. Przykładowe wartości formularza nie pochodzą z konta ZUS. Przed wyliczeniem użytkownik potwierdza sprawdzenie ubezpieczenia, podstawy i dat w teczce. Nieustalone ubezpieczenie drugiego rodzica nie jest traktowane jak brak jego uprawnień. Szkice należą do wybranego dziecka i są unieważniane po zmianie powiązanej sytuacji.

## Parametry zapisane w kodzie

| Parametr | Wartość w prototypie |
| --- | --- |
| Okres macierzyński, 1/2/3/4/5+ dzieci | 20/31/33/35/37 tygodni |
| Rodzicielski, jedno / więcej dzieci | 41/43 tygodnie |
| Wariant Za życiem | 65/67 tygodni |
| Część zastrzeżona rodzicowi | 9 tygodni |
| Przyjęcie blisko granicy wieku | Minimum 9 tygodni macierzyńskiego na warunkach; pule rodzicielskiego 38/62 w tym wariancie |
| Uzupełniający po hospitalizacji | Do 8 lub 15 tygodni, zależnie od masy, tygodnia ciąży i kwalifikujących się pobytów; 100% |
| Stawki | 100%, 70%, wariant 81,5%; własne 9 tygodni drugiego rodzica: 70% |

Źródła użyte przy przygotowaniu reguł: [wysokość zasiłku ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc), [okresy macierzyńskiego i przyjęcie na wychowanie](https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego), [rodzicielski — Ministerstwo Rodziny](https://www.gov.pl/web/rodzina/urlop-rodzicielski). Oryginały opisują warunki i wyjątki; sama tabela parametrów ich nie zastępuje.

## Algorytm i zaokrąglenia

Dla segmentu o `weeks`, podstawie `base`, stawce `rate`, stałym ułamku pracy `fraction` i wymiarze umowy `contractFraction` kod liczy (`round2` oznacza zaokrąglenie do grosza):

```text
baseDays  = weeks × 7
extension = floor(baseDays × fraction)
days      = baseDays + floor(extension / (1 − fraction))
fullDaily = round2(round2(base / 30) × rate / 100)
reduction = round2(fullDaily × fraction / contractFraction)
daily     = round2(fullDaily − reduction)
total     = round2(days × daily)
```

To założenie stałej pracy przez całą część rodzicielskiego, również podczas wydłużenia. Nie obejmuje zmiennych odcinków etatu ani wcześniejszego zakończenia wypłaty na wniosek. Wydłużenie zależy od ułamka pełnego etatu; redukcja kwoty od jego proporcji do umowy. Dwa pominięcia niepełnego dnia mają znaczenie: dla 9 tygodni i pracy na 1/4 etatu model daje 83 dni. [Komentarz ZUS z sierpnia 2023 r.](https://www.zus.pl/documents/10182/24202/Komentarz%2Bdo%2Bustawy%2Bo%2B%C5%9Bwiadczeniach%2Bpieni%C4%99%C5%BCnych%2Bz%2Bubezpieczenia%2Bspo%C5%82ecznego%2Bw%2Brazie%2Bchoroby%2Bi%2Bmacierzy%C5%84stwa%2B2023.pdf/7a31a278-8c06-cee4-3542-1d5bb8b36ad6), pkt 144–147 i 182, s. 38–40 i 48, odczyt 21.11.2026, opisuje te etapy. Przykład z pkt 182 ma niespójne sumy i zaokrąglenie połowy grosza; nie traktujemy jego liczby końcowej jako wzorca kwoty.

Macierzyński po przyjęciu może mieć skrócony wymiar w dniach. Oś dat wyznacza okresy obojga rodziców; segmenty pracownika są w razie potrzeby dzielone na granicy roku dla minimalnej podstawy. Zestawienie miesięczne pokazuje kwoty obliczeniowe, nie rzeczywiste przelewy netto. **Nie potwierdzono żadnej kwoty na indywidualnym zestawie ZUS co do grosza**. [Zakres walidacji](WALIDACJA-ZUS.md).

Wariant 81,5% wymaga daty zdarzenia i wniosku złożonego nie później niż 21 dni po zdarzeniu; wniosek wcześniejszy nie jest automatycznie odrzucany. Przy porodzie osobno potwierdza się wykorzystanie choć jednego dnia rodzicielskiego w pierwszym roku. Wariant bez takiego dnia pokazuje 100% za macierzyński, późniejszy rodzicielski 70% oraz obliczeniowe wyrównanie. Kod sprawdza liczbę dzieci, podstawy, niezależny podział tygodni, daty, ubezpieczenie i zakres etatu. Brak danych lub wariant poza modelem wstrzymuje kwotę, nie jest decyzją odmowną ZUS.

Adopcja i piecza wymagają dat urodzenia oraz przyjęcia. Macierzyński na warunkach jest skracany do właściwego limitu wieku, z gwarancją minimum 63 dni, jeżeli przyjęcie nastąpiło przed granicą. Dla minimum stosowane są pule rodzicielskiego 38/62. Kalendarz rodzicielskiego przekraczający 7/10/14 lat pozostaje do indywidualnego ustalenia — bez kwoty i bez deklarowania odmowy.

**Granica interpretacji wieku, odczyt 21.11.2026:** art. 183 § 3, § 4² i § 4⁵ w lokalnym wyciągu Kodeksu pracy (s. 8–9) ustanawia minimum i pule 38/62, natomiast nie powtarza w tych ustępach końcowej granicy 14 lat. Ogólna [instrukcja ZUS o rodzicielskim](https://bip.zus.pl/pl/web/guest/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-dodatkowego-urlopu-rodzicielskiego), aktualizacja 25.07.2025, wskazuje przy przyjęciu granice 7/10/14 lat. Zespół nie rozstrzyga tej rozbieżności na korzyść automatycznej wypłaty po granicy. Nie stosujemy też do pieczy mechanicznie końca roku, w którym dziecko kończy 6 lat; ZUS wskazuje go dla urodzenia.

## Minimalna podstawa i osobne podwyższenie

Gotową podstawę pracownika porównuje się z minimum właściwym dla roku i wymiaru zatrudnienia, po odliczeniu składek. To nie jest odtworzenie podstawy z wynagrodzeń. Nieznane minimum dla roku wymaga potwierdzenia u płatnika. Dla działalności i zlecenia nie stosuje się automatycznie pracowniczego minimum.

Osobny pomocnik miesięczny podwyższenia przyjmuje wyliczone brutto, rzeczywistą zaliczkę PIT i inne zasiłki netto oraz potwierdzenie danych. Nie zgaduje podatku i nie dodaje podwyższenia bez tych informacji. Przy niepełnym miesiącu cel proporcjonalny jest liczony w tym pomocniku. Źródło: lokalny wyciąg ustawy zasiłkowej, art. 31 ust. 3a–3c oraz art. 45 i 47; [wysokość zasiłku ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc).

## Uzupełniający po hospitalizacji

Pomocnik wymaga masy i ukończonych tygodni ciąży, dat pobytów oraz potwierdzenia zaświadczenia. Łączy nakładające się pobyty tego samego dziecka, sumuje kwalifikujące się dni i raz zaokrągla do pełnego tygodnia. Dla dziecka donoszonego sprawdza warunek dwóch kolejnych dni, z pierwszym między 5. a 28. dniem po porodzie. Przy porodzie mnogim użytkownik potwierdza najniższą masę oraz pobyty dziecka najdłużej hospitalizowanego; pobytów różnych dzieci nie dodaje się. Przy przyjęciu na wychowanie uwzględnia się pobyty od przyjęcia.

Obsługiwana jest nieprzerwana ścieżka pierwszego rodzica: macierzyński → uzupełniający 100% → rodzicielski. 81,5% nie zastępuje 100% części uzupełniającej. Przejęcie przez drugiego rodzica, przerwy i indywidualne warunki przejściowe wymagają osobnego ustalenia. Kod oznacza poród jako dzień 0; dla wcześniaka liczy od kolejnego dnia do dnia 56/105, dla dziecka donoszonego od dnia 5 do 56. Konwencja jest jawna i wymaga potwierdzenia granic pobytu z płatnikiem; nie ma jeszcze porównania z kontrolną kwotą sprawy ZUS.

Źródła, odczyt 21.11.2026: lokalny Kodeks pracy s. 5–6, art. 180², oraz [zasady i odpowiedzi MRPiPS](https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi3), [warunki ZUS](https://bip.zus.pl/pl/web/guest/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-uzupelniajacego-urlopu-macierzynskiego).

## Zadłużenie i parametry

W ścieżce działalności można podać kwotę długu osobno dla każdego rodzica. Próg 1% odnosi się do minimalnego wynagrodzenia właściwego dla roku początku prawa danego rodzica. Nieznana kwota nie oznacza zera; przekroczenie progu lub brak potrzebnych danych wymaga ustalenia z ZUS. Nie jest to pełny model późniejszej spłaty, terminu przedawnienia czy osób współpracujących. Źródło: lokalna ustawa zasiłkowa, art. 2a; poradnik ZUS s. 25 i 37.

Panel parametrów zapisuje lokalnie zwalidowaną konfigurację z etykietą parametrów własnych. Daty `validFrom`/`validTo` wyznaczają wyłącznie rok minimalnego wynagrodzenia wskazany przez `minimumYear`; nie są datami wygaśnięcia przepisów o urlopach. Wersja reguł jest odrębna, a plan zakłada brak przyszłych zmian prawa. Starszy zapis lokalny otrzymuje daty zgodne z rokiem bez utraty podanej kwoty. Nie tworzy centralnej historii zatwierdzeń. Dostępność kwot minimalnych dla wybranych lat nie oznacza obsługi całego prawa historycznego; dla nieznanego roku wynik wymaga potwierdzenia podstawy przez płatnika.

## Odrębny wariant ojca

Osobny wariant porodu pozwala policzyć rodzicielski ubezpieczonego ojca przy potwierdzonym braku ubezpieczenia matki: maksymalnie pula minus 9 tygodni matki, stawka 70%, bez macierzyńskiego matki i bez wariantu 81,5%. Własne 9 tygodni ojca mieści się już w podanej liczbie. Obliczenie zakłada niewykorzystaną wcześniej pulę, własne uprawnienie ojca i brak sytuacji szczególnej; nie rozstrzyga ich automatycznie. Wybór zmiennego etatu, przerw lub zakończenia urlopu wstrzymuje uproszczony wynik i wskazuje konieczność rozliczenia odcinków.

## Poza zakresem wyliczenia

- Podstawa z historii płac i automatyczne obliczenie PIT/netto; pomocnik podwyższenia wymaga osobnych danych miesięcznych.
- Wynagrodzenie za pracę i osobny zasiłek ojcowski w sumie kalkulatora.
- Pełna obsługa przejęcia macierzyńskiego, przerw, utraty dziecka, zbiegu ubezpieczeń, wcześniejszego wykorzystania puli i indywidualnych skutków długu; hospitalizacja ma tylko opisaną wyżej ścieżkę.
- Automatyczny OCR, weryfikacja danych płatnika, orzeczenie uprawnienia.

## Karty, terminy i dokumenty

Katalog zawiera **21 spraw**, a podręcznik **54 tematy**. [Rejestr odnośników](REJESTR-ZRODEL.md) powstaje z pól źródeł w kodzie. Nie jest liczbą niezależnych badań ani potwierdzeniem przeczytania całych książek. Katalog formularzy prowadzi do [ZUS — zasiłki](https://www.zus.pl/wzory-formularzy/zasilki); aktualne formularze trzeba dobierać do sytuacji płatnika. [Oddzielna notatka](FORMULARZE-ZUS.md) opisuje weryfikację zmian formularzy i konflikt między starszym poradnikiem a nowszymi komunikatami.

`due` może określać dni, miesiące kalendarzowe lub opis słowny. Dodanie automatycznej daty wymaga ustalenia zdarzenia, od którego biegnie termin. Nie wolno zamienić „od sporządzenia karty” na „od porodu” bez wyjaśnienia i źródła. Daty podczas ciąży mogą być wyłącznie planistyczne; hipotetyczne terminy po narodzinach nie są eksportowane jako pewne terminy urzędowe.

Podręcznik odsyła m.in. do NFZ, WHO, AAP/HealthyChildren, Medycyny Praktycznej, Canadian Paediatric Society, stanowisk towarzystw i otwartych podręczników. Publiczny fragment książki jest wskazany jako fragment/adaptacja, nie przeczytana cała publikacja. Wyszukiwanie badań nie powinno zastępować zaleceń klinicznych dotyczących konkretnej grupy wieku.

## Procedura zmiany treści

1. Zanotuj konkretny URL, datę publikacji/aktualizacji i datę odczytu. Odróżnij obowiązywanie przepisu od dnia sprawdzenia.
2. Sprawdź grupę uprawnionych, warunki, wyjątki, początek terminu, właściwy organ i dokumenty.
3. Zmień kartę lub regułę bez zmiany stabilnego ID. Dodaj test granicy, jeśli zmiana dotyczy obliczeń.
4. Uzyskaj niezależny przegląd merytoryczny przed produkcyjnym użyciem.
5. Zsynchronizuj backend i odśwież rejestr źródeł oraz raporty aplikacji. Prezentację i film aktualizuj w zakresie zatwierdzonym przez właścicielkę; nie traktuj starego materiału jako dowodu obecnego działania.
6. Zapisz zmianę i nierozwiązane pytania. Nie aktualizuj globalnej daty sprawdzenia bez przejrzenia całego oznaczonego zakresu.

## Załączniki konkursowe

[Brief ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf) wskazuje przykładowe sprawy, tabelę okresów i wyciąg przepisów. **21.11.2026 materiały otrzymano:** sześć dokumentów ogólnych oraz 87 skanowanych PDF ze sprawami. Ogólne materiały odczytano lokalnie. Próba czterech spraw obejmowała lokalny OCR 74 stron i wizualne sprawdzenie 18 stron kluczowych.

Historyczna próba czterech spraw dała trzy częściowe zgodności okresu lub blokady, jedną sprawę poza modelem i zero walidacji kwoty. Późniejszy przegląd objął lokalne OCR wszystkich 87 plików, z których dwa są identyczne bajtowo. Katalog rozpoznaje **86 unikalnych spraw**, zachowuje wcześniejsze 10 i dodaje 76. W 57 odczytano decyzję lub adnotację o wyniku, w 29 nie potwierdzono rozstrzygnięcia. **Zweryfikowane kwoty: 0.** [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md) odróżnia te poziomy dowodu.

Skany, odczyty OCR, jawne opisy i mapowanie osób pozostają poza repozytorium, stroną i bazą AI. Do frontendu trafia katalog zaszyfrowany wyłącznie przez `scripts/sprawy-zus/zaszyfruj.mjs`, otwierany kluczem wyprowadzonym z oryginalnego PDF. Każdy opis wskazuje strony i stan odczytu; lokalny audyt wiąże go ze skrótami PDF i OCR. Rozpoznanie pliku, częściowy odczyt decyzji i walidacja kwoty są oddzielnymi miarami. Testy techniczne tego mechanizmu nie dowodzą kompletnego odtworzenia decyzji ZUS.
