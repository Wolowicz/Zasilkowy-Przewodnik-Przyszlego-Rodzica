# Testy i granice weryfikacji

Stan: 21.11.2026. Testy autorskie nie zastępują walidacji na zestawach ZUS ani oceny klinicznej treści podręcznika.

## Odtwarzalne testy repozytorium

```sh
npm test
npm run build:assistant
```

| Zakres | Plik | Wynik |
| --- | --- | --- |
| Autorskie przypadki kalkulatora i izolacja szkiców dzieci | `otula/tests/zus.test.cjs` | Kontrola przez `npm test`; bieżącą liczbę przypadków podaje skrypt |
| ICS: data, alarm, rewizja, UID dziecka, znaki polskie, CRLF, linie 75 bajtów | `otula/tests/calendar.test.cjs` | Przeszły |
| Walidacja źródeł/cytatów AI oraz konfiguracji modeli | `otula/tests/assistant.test.cjs` | Kontrola przez `npm test` |
| Składnia JS frontendu i skryptów | `scripts/check.mjs` | Przeszła |
| Lokalny frontend/API, fallback bez klucza, origin, rozmiar, niedostępność sekretów | `tests/dev.test.mjs` | Przeszedł |
| Synchronizacja kart i build workera | `scripts/build-assistant.mjs` | Przeszły |

Test serwera uruchamia krótkotrwały proces na `127.0.0.1:4179`, wyłącza klucz w środowisku potomnym i kończy proces po sprawdzeniu. Nie wywołuje modelu. Środowisko wykonawcze przy imporcie: Node.js 24.14.1 na Windows. Sandbox blokował połączenie loopback (`EACCES`); powtórzenie testu poza blokadą sieciową zakończyło się poprawnie. To różnica uprawnień środowiska, nie awaria aplikacji.

Przypadki kalkulatora obejmują standardowy podział, pół etatu, 81,5%, bliźnięta, Za życiem, brak lub nieustalone ubezpieczenie, niepoprawny podział/podstawę/liczbę dzieci, za duży etat, pracę poza umową o pracę, granicę terminu wniosku, dług, sytuację szczególną i adopcję. Sprawdzane są także szkice przypisane do dzieci, unieważnienie szkicu po zmianie sytuacji oraz potwierdzenia danych w teczce. Są to syntetyczne przypadki z asercjami, nie pełne pokrycie wszystkich kombinacji prawnych ani dane rodzin ze spraw ZUS.

## Otrzymane materiały i próba spraw ZUS

21 listopada dostarczono sześć materiałów ogólnych oraz archiwum 87 skanowanych PDF ze sprawami. Cztery wybrane sprawy odczytano lokalnie: OCR przetworzył 74 strony, a 14 kluczowych stron zweryfikowano wizualnie. To **trzy częściowe zgodności okresu lub blokady, jedna sprawa poza modelem i zero zakończonych walidacji kwoty**. Pozostałych 83 plików nie przeanalizowano indywidualnie.

- Standard: zgodna struktura 140 + 224 dni; ustalenie podstawy po zmianie etatu pozostaje poza algorytmem.
- Adopcja z późniejszym Za życiem: zgodna struktura 140 + 392 dni; podstawa przy krótkim ubezpieczeniu nie została odtworzona.
- Odmowa związana z brakiem ubezpieczenia: ręczne wskazanie tego braku blokuje kwotę; aplikacja nie ustala samodzielnie tytułu ubezpieczenia ani nie wydaje decyzji.
- Praca na część etatu, wcześniejsze zakończenie i podwyższenie do minimum: rzeczywista wypłata nie jest odtwarzana przez stały model pracy przez cały okres i wydłużenie.

Wyniki i odwołania do materiałów znajdują się w [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md). Dokumenty, lokalne odczyty OCR i dane osób nie należą do repozytorium ani publicznego demo. Test jednostkowy reguły z własnymi danymi nie zastępuje porównania rzeczywistej kwoty ze sprawy.

## Wcześniejsze sprawdzenie wersji aplikacji z 21 listopada

### Ponowna kontrola po poprawkach UX i kalkulatora

W lokalnej przeglądarce sprawdzono 320, 390 i 1440 px: dwukolumnowy wybór roli, dodanie dwojga dzieci, zapis daty 12.03.2027, zatrudnienie, plan i rozwijane Menu. Brak poziomego przepełnienia w sprawdzonych widokach 320 px. Na komputerze panel AI otwiera się obok planu, Escape zamyka go i zwraca fokus; na telefonie przycisk przechodzi do pełnego ekranu. Pytanie o dokumenty do becikowego w lokalnym trybie bez klucza zwróciło źródła i karty wraz z komunikatem o niedostępności modelu. Dla przykładu autorskiego kalkulator wymagał trzech potwierdzeń, policzył wariant, a zmiana podstawy usunęła stary wynik i potwierdzenia. Konsola nie zgłosiła błędów JS. Nie jest to walidacja kwot na dokumentach jury ani test produkcyjnego modelu AI.

Scenariusze przeglądarkowe objęły 320, 390 i 1440 px: nowe moduły ZUS, kalendarz, parametry, próbne formularze i Kartę wsparcia. Onboarding sprawdzano także przy 412 px i w orientacji poziomej 740 px. Sprawdzono dodawanie dzieci, rok 2027, przełączanie dziecka, tworzenie/edycję/usuwanie wydarzenia, odczyt po przeładowaniu, własne terminy w raporcie i kopiowanie prośby po normalizacji końców linii Windows.

W publicznym wdrożeniu sprawdzono powitanie, ścieżkę, termin, kalkulator, film i zgodność archiwum. PDF miał 10 stron; przejrzano miniatury całości oraz gęstsze slajdy. Ówczesny MP4 trwał około 109,8 sekundy; zastąpił go opisany poniżej film 90-sekundowy. Zrzuty i artefakty są w repozytorium. Nie dołączono automatyzacji całej sesji przeglądarkowej; opis jest zapisem wykonanej kontroli, nie obietnicą `npm test` odtwarzającego UI.

## Kontrola istniejącego filmu — poprzednia wersja z 21 listopada

Poniższy zapis dotyczy istniejącego pliku. Nie jest kontrolą nowego montażu ani potwierdzeniem aktualności pokazanych ekranów. PDF, film i źródła prezentacji pozostają bez zmian; ich aktualizacja wymaga osobnego potwierdzenia właścicielki.

- ffprobe: H.264, 1920×1080, 60 kl./s, 90,005 s; AAC stereo 48 kHz. Ruch nagranego UI pochodzi ze źródła 25 kl./s, grafiki montażowe są animowane w 60 kl./s.
- Pełne dekodowanie 5400 klatek zakończyło się bez błędów; blackdetect nie zgłosił czarnych odcinków dłuższych niż 0,1 s.
- Obejrzano 16 klatek gotowego MP4: sceny, trzy przejścia i zakończenie, a Kartę wsparcia także w 960×540. Sprawdzono proporcje i rozmieszczenie tekstów.
- Pomiar dźwięku: −19,06 LUFS, −5,06 dBTP, bez przesterowania. To kontrola techniczna, nie odsłuch na urządzeniu jury.
- MP4 ma atom moov przed mdat (faststart). Film ma plakat, opcjonalne opisy VTT i tekstowy przebieg w odtwarzaczu.

## Czego nie potwierdzono

- Pełnej walidacji oficjalnych spraw ZUS; żadna kwota w próbie czterech spraw nie została potwierdzona co do grosza.
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
5. Przelicz trzy przykłady kalkulatora, zmień parametry testowe i sprawdź oznaczenie niestandardowych reguł.
6. Otwórz pokazowy PDF bez wysyłki; sprawdź próbny formularz z fikcyjnymi danymi.
7. Edytuj Kartę wsparcia i porównaj skopiowany tekst z widokiem.
8. Pobierz PDF/Word; sprawdź polskie znaki, aktywne dziecko i własne terminy.
9. Zapytaj AI z kluczem i bez; sprawdź źródła, cytat, limit, przerwanie i błędy sieci. Na dużym ekranie otwórz panel z kontekstem sprawy; na telefonie osobny ekran. Sprawdź Escape, powrót fokusu, zmianę szerokości i brak panelu na wydruku.
10. Usuń tylko testowy profil; sprawdź brak pozostałego stanu. Pobrane pliki powinny pozostać pod kontrolą użytkownika.
11. Na telefonie otwórz Menu również po przewinięciu długiej strony; sprawdź wszystkie odnośniki, nawigację klawiaturą, Escape i zamknięcie po wybraniu sekcji. Nie powinien pojawić się dawny dwurzędowy pasek.

Dalszą walidację otrzymanych przypadków ZUS prowadź lokalnie w oddzielnej tabeli oczekiwane/otrzymane z wersją reguł, źródłem i datą. Odróżniaj okres wnioskowany od rzeczywiście wypłaconego. Nie zastępuj brakujących wyników oceną „wygląda poprawnie”.
