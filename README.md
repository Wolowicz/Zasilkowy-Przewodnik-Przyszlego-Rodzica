<p align="center"><img src="otula/dist/assets/otula-logo.svg" width="220" alt="Otula"></p>

# Zasiłkowy Przewodnik Przyszłego Rodzica

**Otula — rodzina ma plan, bliscy wiedzą, jak pomóc.**

Przewodnik po zasiłkach, dokumentach i pierwszych miesiącach rodzicielstwa w formie responsywnej aplikacji webowej na komputer i telefon. Łączy plan dla każdego dziecka, kalkulator zasiłku, kalendarz, podręcznik, asystenta ze źródłami oraz autorską **Kartę wsparcia**: gotową, uprzejmą prośbę o pomoc w konkretnej sprawie.

Projekt na zadanie ZUS w HackNation 2026. Stan dokumentacji: **21 listopada 2026**. To działający prototyp, z jawnie opisanymi ograniczeniami. Integracje z mObywatelem i ZUS są symulowane. Kalkulator wymaga gotowej podstawy zasiłku; nie wylicza jej z historii wynagrodzeń.

## Obejrzyj w 3 minuty

| Materiał | Odnośnik |
| --- | --- |
| Aplikacja bez logowania | [Otwórz Otulę na telefonie lub komputerze](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/) |
| Przewodnik dla jury i mapa wymagań | [DLA-JURY.md](docs/DLA-JURY.md) |
| Prezentacja: 10 slajdów — poprzednia wersja | [PDF w repozytorium](otula/dist/Otula-prezentacja.pdf) |
| Demonstracja: 1 min 30 s · Full HD — poprzednia wersja | [Film MP4](otula/dist/Otula-demo.mp4) · [odtwarzacz online](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/Otula-demo.html) |
| Źródło poprzednich slajdów i notatki | [Samodzielny HTML](otula/materialy/Otula-slajdy-i-notatki.html) — pobierz i otwórz w przeglądarce |
| Wcześniejsze zrzuty aplikacji | [Galeria](docs/EKRANY.md) |

PDF, film i źródła prezentacji pozostają bez zmian. Pokazują wcześniejszy interfejs; ich aktualizacja wymaga osobnego potwierdzenia właścicielki. Bieżący zakres i wynik przeglądu opisują dokumenty tekstowe oraz kod.

Repozytorium jest **prywatne**. Linki do jego plików wymagają dostępu nadanego przez właścicielkę. Publiczne demo nie daje dostępu do kodu. Nie dodano jurorów automatycznie.

## Co działa

| Obszar | Zachowanie |
| --- | --- |
| Moja rodzina | Mama, tata lub bliska osoba; konfiguracja rola → dzieci → zatrudnienie; wiele dzieci i opcjonalne daty; układ dopasowany do telefonu i komputera |
| Nawigacja | Menu na telefonie, panel boczny na komputerze; skróty do planu, terminów i Karty wsparcia; bez menu podczas pierwszej konfiguracji |
| Ścieżka rodzica | Sprawy dopasowane do sytuacji; osobny postęp dziecka; wszystkie kroki dostępne |
| Sprawy i dokumenty | Znaczenie, korzyści/koszty, przygotowanie, terminy, źródła, słowniczek i formularze ZUS |
| Moje terminy | Kalendarz miesiąca; własne wydarzenia, edycja i usuwanie; eksport ICS z alarmem |
| Kalkulator | Jawne reguły, warianty wypłat, podział rodzicielskiego, własne 9 tygodni, stała praca do ½ etatu; osobne szkice dzieci i potwierdzenie danych z teczki |
| Karta wsparcia | Edytowalna prośba do bliskiej osoby, kopiowanie i ręczne udostępnianie |
| Centrum e-usług | Symulacja: logowanie mObywatel z kodem, dane z ZUS (także brak ubezpieczenia), zaświadczenie o zadłużeniu, e-ZLA, wiadomość eZUS, wnioski o urlopy i ZAM, odpis aktu urodzenia – z potwierdzeniem i numerem |
| Sprawdź sprawę ZUS | Wgranie PDF z zestawu testowego: rozpoznanie po skrócie pliku, decyzja ZUS i porównanie z kalkulatorem; dane spraw tylko w postaci zaszyfrowanej |
| Podręcznik | Przygotowanie do porodu, połóg, karmienie, sen i codzienne czynności ze źródłami |
| Asystent AI | Przycisk w rogu; panel obok sprawy na dużym ekranie, osobny ekran na telefonie; kontekst sprawy, źródła i cytaty, przerwanie oczekiwania oraz jawny tryb zastępczy |
| Raport | Plan i terminy w PDF lub Wordzie |
| Dane | Bez konta; profil w przeglądarce; widoczne usunięcie lokalnych danych |

Alarm realizuje zewnętrzny kalendarz po imporcie ICS. Otula nie ma własnych powiadomień w tle ani synchronizacji. Konto pokazowe, panel parametrów i próbny obieg dokumentów są demonstracją. [Zakres i luki](docs/DLA-JURY.md).

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

**Otrzymano materiały ZUS i 87 skanowanych plików spraw.** Lokalnie sprawdzona próba czterech spraw dała trzy częściowe zgodności okresu lub blokady i jeden przypadek poza modelem; **nie zakończono walidacji kwoty żadnej z czterech spraw**. Dokumentów i danych rodzin nie publikujemy. [Wyniki i luki](docs/WALIDACJA-ZUS.md).

## Dokumentacja

**Dla kolegów: [komplet materiałów i instrukcja przeniesienia do repozytorium zespołu](docs/DLA-ZESPOLU.md).**

| Dla kogo | Dokument |
| --- | --- |
| Jury i prezenterzy | [Dla jury](docs/DLA-JURY.md), [pytania i odpowiedzi](docs/PYTANIA-JURY.md), [scenariusz demonstracji](docs/SCENARIUSZ-DEMO.md) |
| Rodzice i bliscy | [Instrukcja użytkownika](docs/UZYTKOWNIK.md) |
| Produkt i projektowanie | [Założenia produktu](docs/PRODUKT.md), [plan rozwoju](docs/PLAN-ROZWOJU.md) |
| Programiści | [Architektura](docs/ARCHITEKTURA.md), [uruchomienie i wdrożenie](docs/URUCHOMIENIE-I-WDROZENIE.md), [zasady zmian](CONTRIBUTING.md) |
| Asystent AI | [API, źródła i tryby awaryjne](docs/ASYSTENT-AI.md) |
| Weryfikacja treści | [Walidacja materiałów ZUS](docs/WALIDACJA-ZUS.md), [reguły i źródła](docs/REGULY-I-ZRODLA.md), [formularze ZUS](docs/FORMULARZE-ZUS.md), [rejestr odnośników](docs/REJESTR-ZRODEL.md) |
| Jakość i bezpieczeństwo | [Testy](docs/TESTY.md), [dane i bezpieczeństwo](docs/PRYWATNOSC-I-BEZPIECZENSTWO.md), [zgłoszenia](SECURITY.md) |
| Autorstwo | [Wcześniejsze prace, AI i licencje](docs/HISTORIA-I-AUTORSTWO.md), [historia zmian](CHANGELOG.md) |
| Prezentacja i film | [Użyte narzędzia i gotowe prompty](docs/PROMPTY-I-NARZEDZIA.md), [źródło montażu](otula/materialy/film/README.md) |

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
