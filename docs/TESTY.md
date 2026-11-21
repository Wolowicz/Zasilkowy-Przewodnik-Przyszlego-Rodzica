# Testy i granice weryfikacji

Stan: 21.11.2026. Testy autorskie nie zastępują walidacji na zestawach ZUS ani oceny klinicznej treści podręcznika.

## Odtwarzalne testy repozytorium

```sh
npm test
npm run build:assistant
```

| Zakres | Plik | Wynik |
| --- | --- | --- |
| 19 przypadków kalkulatora | `otula/tests/zus.test.cjs` | Przeszły |
| ICS: data, alarm, rewizja, UID dziecka, znaki polskie, CRLF, linie 75 bajtów | `otula/tests/calendar.test.cjs` | Przeszły |
| Składnia JS frontendu i skryptów | `scripts/check.mjs` | Przeszła |
| Lokalny frontend/API, fallback bez klucza, origin, rozmiar, niedostępność sekretów | `tests/dev.test.mjs` | Przeszedł |
| Synchronizacja kart i build workera | `scripts/build-assistant.mjs` | Przeszły |

Test serwera uruchamia krótkotrwały proces na `127.0.0.1:4179`, wyłącza klucz w środowisku potomnym i kończy proces po sprawdzeniu. Nie wywołuje modelu. Środowisko wykonawcze przy imporcie: Node.js 24.14.1 na Windows. Sandbox blokował połączenie loopback (`EACCES`); powtórzenie testu poza blokadą sieciową zakończyło się poprawnie. To różnica uprawnień środowiska, nie awaria aplikacji.

Przypadki kalkulatora obejmują standardowy podział, pół etatu, 81,5%, bliźnięta, Za życiem, brak ubezpieczenia drugiego rodzica, niepoprawny podział/podstawę/liczbę dzieci, za duży etat, pracę poza umową o pracę, termin wniosku, dług, sytuację szczególną i adopcję. Są to 19 wywołań z asercjami, nie pełne pokrycie wszystkich kombinacji prawnych.

## Wcześniejsze sprawdzenie wersji aplikacji z 21 listopada

Scenariusze przeglądarkowe objęły 320, 390 i 1440 px: nowe moduły ZUS, kalendarz, parametry, próbne formularze i Kartę wsparcia. Onboarding sprawdzano także przy 412 px i w orientacji poziomej 740 px. Sprawdzono dodawanie dzieci, rok 2027, przełączanie dziecka, tworzenie/edycję/usuwanie wydarzenia, odczyt po przeładowaniu, własne terminy w raporcie i kopiowanie prośby po normalizacji końców linii Windows.

W publicznym wdrożeniu sprawdzono powitanie, ścieżkę, termin, kalkulator, film i zgodność archiwum. PDF miał 10 stron; przejrzano miniatury całości oraz gęstsze slajdy. MP4 trwa około 109,8 sekundy. Zrzuty i artefakty są w repozytorium. Nie dołączono automatyzacji całej sesji przeglądarkowej; opis jest zapisem wykonanej kontroli, nie obietnicą `npm test` odtwarzającego UI.

## Czego nie potwierdzono

- Wyników na oficjalnych zestawach spraw ZUS i zgodności kwot co do grosza.
- Pełnej poprawności wszystkich kart po zmianach prawa; dotychczasowy katalog zachowuje datę 17.11.2026.
- Realnego logowania, integracji urzędowych, wysyłki wniosku i OCR — tych funkcji nie ma.
- Jakości każdej odpowiedzi modelu, odporności na wszystkie prompt injection i kontroli kosztów pod obciążeniem.
- Pełnego WCAG, audytu bezpieczeństwa, wydajności wieloużytkownikowej i wszystkich wariantów iOS/Android.
- Automatycznej synchronizacji ICS; zachowanie alarmów zależy od kalendarza importującego.

## Ręczna lista regresji

1. Czysty profil: przejdź wybór roli → dzieci → zatrudnienie, użyj daty w 2027 r.
2. Dodaj drugie dziecko; sprawdź osobne daty, oznaczone sprawy i wydarzenia.
3. Wybierz filtry ciąża / po narodzinach / wszystkie. Otwórz sprawę i wróć przyciskiem systemowym.
4. Utwórz termin, popraw godzinę, przeładuj, eksportuj ICS i sprawdź alarm po imporcie.
5. Przelicz trzy przykłady kalkulatora, zmień parametry testowe i sprawdź oznaczenie niestandardowych reguł.
6. Otwórz pokazowy PDF bez wysyłki; sprawdź próbny formularz z fikcyjnymi danymi.
7. Edytuj Kartę wsparcia i porównaj skopiowany tekst z widokiem.
8. Pobierz PDF/Word; sprawdź polskie znaki, aktywne dziecko i własne terminy.
9. Zapytaj AI z kluczem i bez; sprawdź źródła, limit, niepoprawne pytanie i błędy sieci.
10. Usuń tylko testowy profil; sprawdź brak pozostałego stanu. Pobrane pliki powinny pozostać pod kontrolą użytkownika.

Po otrzymaniu przypadków ZUS prowadź oddzielną tabelę oczekiwane/otrzymane z wersją reguł, źródłem i datą. Nie zastępuj brakujących wyników oceną „wygląda poprawnie”.
