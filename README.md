<p align="center"><img src="otula/dist/assets/otula-logo.svg" width="220" alt="Otula"></p>

# Zasiłkowy Przewodnik Przyszłego Rodzica

**Otula pomaga rodzicowi ustalić, o jakie świadczenie może wystąpić i jak przygotować wniosek.**

Po otwarciu aplikacji rodzic odpowiada na pytania o swoją sytuację. Może sprawdzić częściowy wynik, kwotę, okres oraz dokumenty, których potrzebuje od pracodawcy, lekarza lub urzędu. Druki ZAM i ZAS-53 uzupełnia na urządzeniu i pobiera do podpisu. Główna ścieżka działa bez konta i bez asystenta AI.

Projekt na zadanie ZUS w HackNation 2026. Stan dokumentacji **21 listopada 2026**. Wyliczenie kwoty wymaga podstawy zasiłku ustalonej przez płatnika. Złożenie elektroniczne wymaga przejścia do oficjalnego serwisu. W eZUS można wybrać logowanie przez login.gov.pl z mObywatelem. Osobny moduł konkursowy ilustruje integracje na fikcyjnych danych.

## Obejrzyj w 3 minuty

| Materiał | Odnośnik |
| --- | --- |
| Aplikacja bez logowania | [Otwórz Otulę na telefonie lub komputerze](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/) |
| Przewodnik dla jury i mapa wymagań | [DLA-JURY.md](docs/DLA-JURY.md) |
| Prezentacja: 10 slajdów, 16:9 | [PDF w repozytorium](otula/dist/Otula-prezentacja.pdf) |
| Demonstracja: 1 min 42 s · Full HD · 60 kl./s | [Film MP4](otula/dist/Otula-demo.mp4) · [odtwarzacz online](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/Otula-demo.html) |
| Źródło slajdów i notatki | [Samodzielny HTML](otula/materialy/Otula-slajdy-i-notatki.html) — pobierz i otwórz w przeglądarce |
| Aktualne ekrany: 12 tras × 3 szerokości | [Galeria](docs/EKRANY.md) |

Film, slajdy i galeria pokazują wcześniejszą wersję konkursową z fikcyjnymi danymi. Najnowszy wywiad jest dostępny w aplikacji. Źródła oraz sposób odtworzenia PDF i filmu opisuje [katalog materiałów dla jury](otula/materialy/jury/README.md). [Przygotowanie do rozmowy z ZUS i jury](docs/ROZMOWA-Z-JURY.md) objaśnia oba dokumenty konkursowe, kryteria i otwarte pytania.

Repozytorium jest **prywatne**. Linki do jego plików wymagają dostępu nadanego przez właścicielkę. Publiczne demo nie daje dostępu do kodu. Nie dodano jurorów automatycznie.

## Co działa

| Obszar | Zachowanie |
| --- | --- |
| Moja rodzina | Mama, tata lub bliska osoba; konfiguracja rola → dzieci → zatrudnienie; wiele dzieci i opcjonalne daty; układ dopasowany do telefonu i komputera |
| Nawigacja | Menu na telefonie, panel boczny na komputerze; skróty do planu, terminów i Karty wsparcia; bez menu podczas pierwszej konfiguracji |
| Ścieżka rodzica | Sprawy dopasowane do sytuacji; osobny postęp dziecka; wszystkie kroki dostępne |
| Sprawy i dokumenty | Znaczenie, korzyści/koszty, przygotowanie, terminy, źródła, słowniczek i formularze ZUS |
| Moje terminy | Kalendarz miesiąca; własne wydarzenia, edycja i usuwanie; eksport ICS z alarmem |
| Kalkulator | Jawne reguły i daty obojga rodziców, własne 9 tygodni, stała praca do ½ etatu, adopcja/piecza, pomocnik hospitalizacji, roczne minima i osobne podwyższenie; szkice dzieci i potwierdzenie danych z teczki |
| Karta wsparcia | Edytowalna prośba do bliskiej osoby, kopiowanie i ręczne udostępnianie |
| Centrum e-usług | Symulacja: logowanie mObywatel z kodem, dane z ZUS (także brak ubezpieczenia), zaświadczenie o zadłużeniu, e-ZLA, wiadomość eZUS, wnioski o urlopy i ZAM, odpis aktu urodzenia – z potwierdzeniem i numerem |
| Sprawdź sprawę ZUS | 86 unikalnych PDF rozpoznawanych lokalnie; zaszyfrowane opracowania ze stronami źródłowymi i stanem odczytu. 57 częściowo odczytanych wyników, 29 nieustalonych, 0 zweryfikowanych kwot |
| Podręcznik | Przygotowanie do porodu, połóg, karmienie, sen i codzienne czynności ze źródłami |
| Asystent AI | Przycisk w rogu; panel obok sprawy na dużym ekranie, osobny ekran na telefonie; kontekst sprawy, źródła i cytaty, przerwanie oczekiwania oraz jawny tryb zastępczy |
| Raport | Plan i terminy w PDF lub Wordzie |
| Dane | Bez konta; profil w przeglądarce; widoczne usunięcie lokalnych danych |

Alarm realizuje zewnętrzny kalendarz po imporcie ICS. Otula nie ma własnych powiadomień w tle ani synchronizacji. Konto pokazowe, panel parametrów i próbny obieg dokumentów są demonstracją. Parametry zapisują się lokalnie; rok minimum wynagrodzenia jest oddzielony od wersji reguł. Produkcyjny asystent korzysta z `google/gemini-2.5-flash-lite` przez OpenRouter; sprawdzono odpowiedź ze źródłami, ale nie każdą możliwą odpowiedź. [Zakres i luki](docs/DLA-JURY.md).

## Uruchomienie lokalne

Potrzebny jest **Node.js 22 lub nowszy**. Nie trzeba instalować pakietów npm.

```sh
git clone https://github.com/Wolowicz/Zasilkowy-Przewodnik-Przyszlego-Rodzica.git
cd Zasilkowy-Przewodnik-Przyszlego-Rodzica
npm start
```

Otwórz **http://127.0.0.1:4173**. Serwer obsługuje aplikację i `/ask`; bez klucza AI pokazuje dopasowane źródła. Pełne odpowiedzi wymagają sekretu według [instrukcji](docs/URUCHOMIENIE-I-WDROZENIE.md). Klucz nigdy nie trafia do kodu frontendu.

```sh
npm test
npm run build:assistant
npm run sources
```

Testy obejmują autorskie przypadki kalkulatora, rozdzielenie szkiców dzieci, eksport ICS, obsługę źródeł AI oraz lokalny serwer i API. Aktualny zakres: [raport testów](docs/TESTY.md).

**Otrzymano materiały ZUS i 87 skanowanych PDF: 86 unikalnych spraw oraz jedną identyczną kopię.** Katalog zachowuje wcześniejsze 10 spraw i dodaje 76. Lokalny OCR obejmuje cały zestaw; częściowo odczytano 57 rozstrzygnięć/adnotacji o wyniku, a 29 wymaga dalszej weryfikacji. **Nie zakończono niezależnej walidacji kwoty żadnej sprawy.** Test odszyfrowania 86/86 jest dowodem technicznym, nie prawnym. Skany, OCR i jawne opracowania pozostają poza repozytorium i stroną. [Wyniki i luki](docs/WALIDACJA-ZUS.md).

## Dokumentacja

**Dla kolegów: [komplet materiałów i instrukcja przeniesienia do repozytorium zespołu](docs/DLA-ZESPOLU.md).**

| Dla kogo | Dokument |
| --- | --- |
| Jury i prezenterzy | [Dla jury](docs/DLA-JURY.md), [briefing i trudne pytania](docs/ROZMOWA-Z-JURY.md), [pytania i odpowiedzi](docs/PYTANIA-JURY.md), [scenariusz demonstracji](docs/SCENARIUSZ-DEMO.md) |
| Rodzice i bliscy | [Instrukcja użytkownika](docs/UZYTKOWNIK.md) |
| Produkt i projektowanie | [Założenia produktu](docs/PRODUKT.md), [plan rozwoju](docs/PLAN-ROZWOJU.md) |
| Programiści | [Architektura](docs/ARCHITEKTURA.md), [uruchomienie i wdrożenie](docs/URUCHOMIENIE-I-WDROZENIE.md), [zasady zmian](CONTRIBUTING.md) |
| Asystent AI | [API, źródła i tryby awaryjne](docs/ASYSTENT-AI.md) |
| Weryfikacja treści | [Walidacja materiałów ZUS](docs/WALIDACJA-ZUS.md), [reguły i źródła](docs/REGULY-I-ZRODLA.md), [formularze ZUS](docs/FORMULARZE-ZUS.md), [rejestr odnośników](docs/REJESTR-ZRODEL.md) |
| Jakość i bezpieczeństwo | [Testy](docs/TESTY.md), [dane i bezpieczeństwo](docs/PRYWATNOSC-I-BEZPIECZENSTWO.md), [zgłoszenia](SECURITY.md) |
| Autorstwo | [Wcześniejsze prace, AI i licencje](docs/HISTORIA-I-AUTORSTWO.md), [historia zmian](CHANGELOG.md) |
| Prezentacja i film | [Użyte narzędzia i gotowe prompty](docs/PROMPTY-I-NARZEDZIA.md), [aktualne źródła i eksport](otula/materialy/jury/README.md) |

## Układ repozytorium

```text
otula/dist/             frontend, fonty, ilustracje, PDF i film
otula/tests/            testy kalkulatora i kalendarza
otula/materialy/        ekrany telefonu, źródło slajdów i generator HTML
otula-asystent/worker/  serwer AI, karty, indeks i pamięć źródeł
otula-asystent/*.mjs    synchronizacja treści i budowanie serwera
scripts/               lokalny start, testy, build i rejestr źródeł
tests/                 test lokalnego serwera i granic dostępu
docs/                  dokumentacja jury, użytkownika, produktu i techniczna
```

Interfejs: HTML, CSS i JavaScript bez frameworka. API: JavaScript z `fetch(Request, env)`. Biblioteki eksportu i fonty są dołączone z licencjami. Nie nadano nowej licencji open source kodowi projektu; [szczegóły](docs/HISTORIA-I-AUTORSTWO.md).
