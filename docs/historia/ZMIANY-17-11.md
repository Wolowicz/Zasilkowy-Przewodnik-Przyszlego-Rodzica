> Archiwalna notatka zespołu. Opisuje stan w chwili przygotowania; bieżący zakres i repozytorium opisuje README.

# Zmiany w Otuli z 17 listopada 2026 r.

Zmiany wprowadzono z pomocą Claude (Anthropic), po pierwszej wersji przygotowanej w Codex. Ta wersja `dist/` jest **najnowsza**. Wersja sprzed zmian leży w `_kopia-dist-przed-zmianami-Claude/` (to tylko archiwum, nie publikować).

## Co widzi użytkownik

| Obszar | Przed | Po |
|---|---|---|
| Nawigacja | Szczegóły sprawy, „Moja sytuacja” i menu otwierały się w okienkach (`<dialog>`). Systemowe „wstecz” w telefonie wychodziło z aplikacji. | Każdy ekran ma adres: `#start`, `#plan`, `#terminy`, `#biblioteka`, `#wsparcie`, `#wsparcie/<id>`, `#sprawa/<id>`, `#sytuacja`, `#o-przewodniku`, `#dane`. Ekrany podrzędne mają przycisk „← Wróć do: …”, a klikalna ścieżka u góry pokazuje, gdzie jesteś. Na telefonie jest dolny pasek zakładek. Pod sprawą jest link „Następna sprawa w planie”. Okienek już nie ma. |
| Role | Tylko mama. | Powitanie w 2 krokach: kto korzysta (mama, tata, bliska osoba) i etap. Plan, tekst główny i formy w Karcie wsparcia zależą od roli. |
| Nowe sprawy | — | `urlop-ojcowski` (tylko tata), `urlop-rodzicielski`, `ubezpieczenie-dziecka`. Źródła: gov.pl/web/rodzina, pacjent.gov.pl (sprawdzone 17.11.2026). |
| Moje terminy | — | Nowa zakładka `#terminy`. Po wpisaniu daty porodu lub urodzenia liczy orientacyjne terminy na osi czasu. W ciąży odlicza czas do porodu. Przycisk „Dodaj do kalendarza” pobiera plik `.ics` z przypomnieniem. |
| Karta wsparcia | Jedno sztywne zdanie w formie żeńskiej. | Uprzejma prośba z wyborem: kto pisze (mogłabym / mógłbym / czy mogę), do kogo (Ty / Pani / Pan), zwrot i podpis. Struktura: „Czy mogłabym liczyć na Twoją pomoc… Bardzo proszę o… Będę Ci bardzo wdzięczna”. Tekst można edytować. Wysyłka: menu udostępniania, SMS lub schowek. |
| Słowniczek | — | W Bibliotece spraw: płatnik składek, tytuł ubezpieczenia, karta a akt urodzenia, profil zaufany, e-Doręczenia, Emp@tia, eZUS. |

## Co zmieniono w plikach

- `dist/catalog.js`
  - Nowe sekcje: `roles` i `glossary`.
  - W sprawach nowe pola:
    - `roles`: zawęża plan dla mamy lub taty.
    - `due`: termin od daty urodzenia, w dniach (`days`) lub miesiącach kalendarzowych (`months`), albo opisany słownie (`text`). Do tego `label`, `note` i opcjonalnie `remind`.
    - `ask`: fraza w bierniku, która pasuje po „Bardzo proszę o …”.
    - `reason`: jedno neutralne zdanie, bez form zależnych od płci.
  - Stare pole `help` zastąpiły `ask` i `reason`.
- `dist/app.js`: przepisany.
  - Routing przez hash i śledzenie historii dla przycisku „Wróć”.
  - Funkcje `compose()` (treść prośby), `timeline()` i `exportCalendar()`.
  - Stan w `localStorage` pod tym samym kluczem `otula-plan-v1`, rozszerzony o pola `role`, `onboarded`, `date` i `support`. Stare zapisy nadal się wczytują.
- `dist/index.html`: usunięto `<dialog>`, dodano `<nav id="tabbar">` i linki w stopce.
- `dist/style.css`: nowe sekcje dla nawigacji, powitania, ekranu sprawy, osi terminów, Karty wsparcia i słowniczka. Usunięto style okienek.
- `dist/icons.js`: nowe ikony `back`, `home`, `share`, `chat`, `download`, `edit`.

## Jak sprawdzono

Przeglądarka Edge (Playwright), widoki 1440 px i 390 px (telefon). Sprawdzono:
- brak błędów JS i brak poziomego przewijania na wszystkich ekranach,
- przycisk „Wróć” i systemowe „wstecz”,
- plik `.ics`: data urodzenia 10.11.2026 daje 6 terminów, pierwszy 1.12.2026,
- treści próśb w wariantach mama → Ty, tata → Pani, neutralnie → Ty.

## Otwarte sprawy

- Karta „uznanie ojcostwa przed porodem”: brak potwierdzonej oficjalnej strony źródłowej.
- Slajdy (`materialy/Otula-slajdy-i-notatki.html`) i PDF pokazują jeszcze dawne ekrany.
- Terminy są orientacyjne. Po ogłoszeniu briefu warto potwierdzić je z mentorem ZUS.
