# Testy i granice weryfikacji

Stan: 21.11.2026. Testy autorskie nie zastępują walidacji na zestawach ZUS ani oceny klinicznej treści podręcznika.

## Odtwarzalne testy repozytorium

```sh
npm test
npm run build:assistant
```

| Zakres | Plik | Wynik |
| --- | --- | --- |
| Autorskie przypadki kalkulatora i izolacja szkiców dzieci | `otula/tests/zus.test.cjs` | 105 przypadków kalkulatora oraz dodatkowe asercje szkiców, reguł i lat minimum; przeszły |
| ICS: data, alarm, rewizja, UID dziecka, znaki polskie, CRLF, linie 75 bajtów | `otula/tests/calendar.test.cjs` | Przeszły |
| Walidacja źródeł/cytatów AI oraz konfiguracji modeli | `otula/tests/assistant.test.cjs` | Przeszła; nie dowodzi zgodności znaczenia każdej odpowiedzi ze źródłem |
| Szyfrowanie i stany odczytu spraw ZUS | `otula/tests/sprawy.test.cjs` | Przeszły: 86 rekordów, brak jawnych danych, odrzucenie obcego/zmienionego pliku oraz nieprawidłowych danych generatora |
| Składnia JS frontendu i skryptów | `scripts/check.mjs` | Przeszła |
| Lokalny frontend/API, fallback bez klucza, origin, rozmiar, niedostępność sekretów | `tests/dev.test.mjs` | Przeszedł |
| Synchronizacja kart i build workera | `scripts/build-assistant.mjs` | Przeszły |

Test serwera uruchamia krótkotrwały proces na `127.0.0.1:4179`, wyłącza klucz w środowisku potomnym i kończy proces po sprawdzeniu. Nie wywołuje modelu. Środowisko wykonawcze przy imporcie: Node.js 24.14.1 na Windows. Sandbox blokował połączenie loopback (`EACCES`); powtórzenie testu poza blokadą sieciową zakończyło się poprawnie. To różnica uprawnień środowiska, nie awaria aplikacji.

Przypadki kalkulatora obejmują standardowe pule i Za życiem, niezależne tygodnie/daty rodziców, 9 tygodni zastrzeżonych, ubezpieczenie oraz brak lub sprzeczność danych. Kontrolują też:

- 81,5%: wniosek przed porodem i do 21. dnia, brak dnia rodzicielskiego w pierwszym roku i wyrównanie;
- minimum pracownika przy pełnym i częściowym etacie oraz przejście 2025→2026→2027; pomocnik podwyższenia wymaga rzeczywistych danych PIT/netto;
- proporcję pracy do umowy, dwa etapy pomijania niepełnych dni wydłużenia i etapowe zaokrąglenia stawki; własny przykład 9 tygodni przy 1/4 etatu daje 83 dni;
- minimum 63 dni po przyjęciu przed granicą wieku, pule 38/62 i wstrzymanie indywidualnego wariantu rodzicielskiego poza granicą;
- hospitalizację: masę/tydzień ciąży, okna dni, nakładanie pobytów, sumowanie i jedno zaokrąglenie, granice 8/15 tygodni oraz stawkę 100%; konwencja dnia porodu pozostaje do potwierdzenia na przykładzie ZUS;
- próg zadłużenia 1% właściwego minimum, osobno dla rodziców; nieznana kwota nie oznacza zera;
- zapis parametrów i migrację starszej konfiguracji. Rok minimum jest odrębny od wersji reguł: własne minimum 5100 zł w 2027 nie zmienia minimum 2026;
- szkice przypisane do dzieci, unieważnienie po zmianie sytuacji i potwierdzenia danych w teczce.

Są to syntetyczne przypadki z asercjami, nie pełne pokrycie kombinacji prawnych ani wyniki rodzin z teczek ZUS. Szczegółowe granice opisują [reguły i źródła](REGULY-I-ZRODLA.md).

## Otrzymane materiały i sprawy ZUS

21 listopada dostarczono sześć materiałów ogólnych oraz 87 skanowanych PDF. Jedna para jest identyczna bajtowo: **86 unikalnych spraw, 2008 stron**. Lokalny OCR obejmuje cały zestaw, ale nie jest dowodem poprawnego odczytu każdej strony.

| Poziom kontroli | Wynik |
| --- | --- |
| Rozpoznawanie oryginalnego PDF i lokalne odszyfrowanie | 86/86; zachowane wcześniejsze 10, dodane 76 |
| Częściowo odczytana decyzja lub adnotacja o wyniku | 57: 46 przyznań/adnotacji o wypłacie, 11 odmów |
| Rozstrzygnięcie nieustalone | 29; brak domyślnego przyznania |
| Niezależnie porównane kwoty | **0** |

Techniczny roundtrip wszystkich oryginalnych PDF wykonał się lokalnie. Testy generatora kontrolują brakujący plik, duplikat i sprzeczny status; testy przeglądarkowego mechanizmu — odrzucenie obcego lub zmienionego PDF. Każdy zaszyfrowany opis zawiera stan odczytu i strony źródłowe, a nieustalone okresy wniosku są oddzielone od rozstrzygniętych.

Skany, jawne opisy, mapowanie i OCR pozostają poza repozytorium oraz stroną. Do aplikacji trafia szyfrogram i niesensytywne agregaty. Rozpoznanie dokumentu nie jest automatycznym OCR nowej teczki ani poprawnym policzeniem świadczenia. Wcześniejsza próba czterech spraw pozostaje zapisem historycznym w [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md).

## Aktualny audyt interfejsu

Sprawdzono **12 tras × 3 szerokości: 320, 390 i 1440 px**. Macierz obejmuje start, plan, terminy, kalkulator, sprawę ZUS, e-usługi, uprawnienia, parametry, formularze, podręcznik, Kartę wsparcia i raport. [Galeria wszystkich 36 widoków](EKRANY.md) oraz [zapis wymiarów i nawigacji](../otula/materialy/zrzuty-final/audit-after.json) dokumentują zakres. Zapis nie wykazał poziomego przepełnienia w żadnym z tych widoków. Uzgodnione kolory, typografia i komponenty są w [STYL-I-DESIGN.md](STYL-I-DESIGN.md).

To kontrola zapisanych ekranów z fikcyjnymi danymi, nie automatyczny test wszystkich interakcji, certyfikacja WCAG ani sprawdzenie wszystkich telefonów. `npm test` nie odtwarza tej sesji przeglądarkowej.

## Publiczny asystent AI

21.11.2026 sprawdzono publiczną odpowiedź na pytanie o dokumenty do becikowego: tryb AI zawierał odpowiedź, urzędowe odnośniki i cytaty. Konfiguracja pokazu korzysta z `google/gemini-2.5-flash-lite` przez OpenRouter; szczegóły i zakres potwierdzenia są w [ASYSTENT-AI.md](ASYSTENT-AI.md). To pojedynczy test działania, nie ocena każdej tezy lub całej macierzy pytań. Lokalny test API bez klucza pozostaje osobną kontrolą trybu zastępczego.

## Aktualne materiały dla jury

Pakiet obejmuje 10 slajdów 16:9 oraz film planowany na 102 s, 1920×1080, 60 kl./s, z aktualnych ekranów i fikcyjnych danych. [Źródła, generator i procedura kontroli](../otula/materialy/jury/README.md) opisują odtworzenie artefaktów. PDF przeszedł kontrolę liczby stron, fontów, odnośnika demo i układu; aktualizacja sceny AI oraz końcowy render filmu są osobno weryfikowane przed podmianą plików. Metadane filmu i wynik finalnego przeglądu trzeba potwierdzić dla końcowego MP4; nie przenosimy wyników kontroli starego filmu na nowy.

## Wcześniejsze sprawdzenie wersji aplikacji z 21 listopada

### Ponowna kontrola po poprawkach UX i kalkulatora

W lokalnej przeglądarce sprawdzono 320, 390 i 1440 px: dwukolumnowy wybór roli, dodanie dwojga dzieci, zapis daty 12.03.2027, zatrudnienie, plan i rozwijane Menu. Brak poziomego przepełnienia w sprawdzonych widokach 320 px. Na komputerze panel AI otwiera się obok planu, Escape zamyka go i zwraca fokus; na telefonie przycisk przechodzi do pełnego ekranu. Pytanie o dokumenty do becikowego w lokalnym trybie bez klucza zwróciło źródła i karty wraz z komunikatem o niedostępności modelu. Dla przykładu autorskiego kalkulator wymagał trzech potwierdzeń, policzył wariant, a zmiana podstawy usunęła stary wynik i potwierdzenia. Konsola nie zgłosiła błędów JS. Nie jest to walidacja kwot na dokumentach jury ani test produkcyjnego modelu AI.

Scenariusze przeglądarkowe objęły 320, 390 i 1440 px: nowe moduły ZUS, kalendarz, parametry, próbne formularze i Kartę wsparcia. Onboarding sprawdzano także przy 412 px i w orientacji poziomej 740 px. Sprawdzono dodawanie dzieci, rok 2027, przełączanie dziecka, tworzenie/edycję/usuwanie wydarzenia, odczyt po przeładowaniu, własne terminy w raporcie i kopiowanie prośby po normalizacji końców linii Windows.

W publicznym wdrożeniu sprawdzono powitanie, ścieżkę, termin, kalkulator, film i zgodność archiwum. PDF miał 10 stron; przejrzano miniatury całości oraz gęstsze slajdy. Ówczesny MP4 trwał około 109,8 sekundy; zastąpił go opisany poniżej film 90-sekundowy. Zrzuty i artefakty są w repozytorium. Nie dołączono automatyzacji całej sesji przeglądarkowej; opis jest zapisem wykonanej kontroli, nie obietnicą `npm test` odtwarzającego UI.

## Historia kontroli wcześniejszych materiałów

Poprzedni MP4 90 s przeszedł kontrolę dekodowania 5400 klatek, wybranych scen, przejść, dźwięku i faststart. Ten zapis dotyczy poprzedniej wersji. Nie stanowi potwierdzenia aktualnego montażu 102 s; końcową kontrolę wykonuje się ponownie według procedury z katalogu materiałów dla jury.

## Czego nie potwierdzono

- Pełnej walidacji oficjalnych spraw ZUS; w całym katalogu 86 spraw żadna kwota nie została niezależnie potwierdzona co do grosza.
- Pełnej poprawności wszystkich kart po zmianach prawa; dotychczasowy katalog zachowuje datę 17.11.2026.
- Realnego logowania, integracji urzędowych, wysyłki wniosku i OCR — tych funkcji nie ma.
- Jakości każdej odpowiedzi modelu, odporności na wszystkie prompt injection i kontroli kosztów pod obciążeniem.
- Pełnego WCAG, audytu bezpieczeństwa, wydajności wieloużytkownikowej i wszystkich wariantów iOS/Android.
- Automatycznej synchronizacji ICS; zachowanie alarmów zależy od kalendarza importującego.

## Ręczna lista regresji

1. Czysty profil: przejdź wybór roli → dzieci → zatrudnienie, użyj daty w 2027 r. Menu i przycisk AI nie powinny przesłaniać konfiguracji. Porównaj telefon 320–390 px z układem kolumnowym na komputerze.
2. Dodaj drugie dziecko; sprawdź osobne daty, oznaczone sprawy, wydarzenia i szkice kalkulatora. Zmiana daty/etapu powinna wymagać ponownego potwierdzenia danych obliczenia.
3. Wybierz filtry ciąża / po narodzinach / wszystkie. Otwórz sprawę i wróć przyciskiem systemowym.
4. Utwórz termin, popraw godzinę, przeładuj, eksportuj ICS i sprawdź alarm po imporcie.
5. Przelicz trzy przykłady kalkulatora, zmień parametry testowe i sprawdź oznaczenie niestandardowych reguł. Upewnij się, że zmiana minimum dla 2027 nie zmienia minimum 2026, a roczne daty nie są przedstawiane jako wygaśnięcie prawa.
6. Otwórz pokazowy PDF bez wysyłki; sprawdź próbny formularz z fikcyjnymi danymi.
7. Edytuj Kartę wsparcia i porównaj skopiowany tekst z widokiem.
8. Pobierz PDF/Word; sprawdź polskie znaki, aktywne dziecko i własne terminy.
9. Zapytaj AI z kluczem i bez; sprawdź źródła, cytat, limit, przerwanie i błędy sieci. Na dużym ekranie otwórz panel z kontekstem sprawy; na telefonie osobny ekran. Sprawdź Escape, powrót fokusu, zmianę szerokości i brak panelu na wydruku.
10. Usuń tylko testowy profil; sprawdź brak pozostałego stanu. Pobrane pliki powinny pozostać pod kontrolą użytkownika.
11. Na telefonie otwórz Menu również po przewinięciu długiej strony; sprawdź wszystkie odnośniki, nawigację klawiaturą, Escape i zamknięcie po wybraniu sekcji. Nie powinien pojawić się dawny dwurzędowy pasek.

Dalszą walidację otrzymanych przypadków ZUS prowadź lokalnie w oddzielnej tabeli oczekiwane/otrzymane z wersją reguł, źródłem i datą. Odróżniaj okres wnioskowany od rzeczywiście wypłaconego. Nie zastępuj brakujących wyników oceną „wygląda poprawnie”.
