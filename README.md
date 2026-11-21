<p align="center"><img src="otula/dist/assets/otula-logo.svg" width="220" alt="Otula"></p>

# Zasiłkowy Przewodnik Przyszłego Rodzica

**Otula — rodzina ma plan, bliscy wiedzą, jak pomóc.**

Mobilny przewodnik po zasiłkach, dokumentach i pierwszych miesiącach rodzicielstwa. Łączy plan dla każdego dziecka, kalkulator zasiłku, kalendarz, podręcznik, asystenta ze źródłami oraz autorską **Kartę wsparcia**: gotową, uprzejmą prośbę o pomoc w konkretnej sprawie.

Projekt na zadanie ZUS w HackNation 2026. Stan dokumentacji: **21 listopada 2026**. To działający prototyp, z jawnie opisanymi ograniczeniami. Integracje z mObywatelem i ZUS są symulowane. Kalkulator wymaga gotowej podstawy zasiłku; nie wylicza jej z historii wynagrodzeń.

## Obejrzyj w 3 minuty

| Materiał | Odnośnik |
| --- | --- |
| Aplikacja bez logowania | [Otwórz Otulę na telefonie lub komputerze](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/) |
| Przewodnik dla jury i mapa wymagań | [DLA-JURY.md](docs/DLA-JURY.md) |
| Prezentacja: 10 slajdów | [PDF w repozytorium](otula/dist/Otula-prezentacja.pdf) |
| Demonstracja: około 1 min 50 s | [Film MP4](otula/dist/Otula-demo.mp4) · [odtwarzacz online](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/Otula-demo.html) |
| Slajdy do edycji i notatki prelegenta | [Samodzielny HTML](otula/materialy/Otula-slajdy-i-notatki.html) — pobierz i otwórz w przeglądarce |
| Ekrany aktualnej wersji | [Galeria](docs/EKRANY.md) |

Repozytorium jest **prywatne**. Linki do jego plików wymagają dostępu nadanego przez właścicielkę. Publiczne demo nie daje dostępu do kodu. Nie dodano jurorów automatycznie.

## Co działa

| Obszar | Zachowanie |
| --- | --- |
| Moja rodzina | Mama, tata lub bliska osoba; wiele dzieci, opcjonalne imiona, ciąża / po narodzinach, zatrudnienie |
| Ścieżka rodzica | Sprawy dopasowane do sytuacji; osobny postęp dziecka; wszystkie kroki dostępne |
| Sprawy i dokumenty | Znaczenie, korzyści/koszty, przygotowanie, terminy, źródła, słowniczek i formularze ZUS |
| Moje terminy | Kalendarz miesiąca; własne wydarzenia, edycja i usuwanie; eksport ICS z alarmem |
| Kalkulator | Jawne reguły, warianty wypłat, podział rodzicielskiego, własne 9 tygodni, stała praca do ½ etatu |
| Karta wsparcia | Edytowalna prośba do bliskiej osoby, kopiowanie i ręczne udostępnianie |
| Podręcznik | Przygotowanie do porodu, połóg, karmienie, sen i codzienne czynności ze źródłami |
| Asystent AI | Dobieranie kart i publikacji, odpowiedź ze źródłami lub jawny tryb zastępczy |
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

Testy obejmują 19 autorskich przypadków kalkulatora, eksport ICS oraz lokalny serwer i API. **Nie wykonano walidacji na oficjalnych zestawach ZUS — nie były dostępne.** [Raport testów](docs/TESTY.md).

## Dokumentacja

| Dla kogo | Dokument |
| --- | --- |
| Jury i prezenterzy | [Dla jury](docs/DLA-JURY.md), [pytania i odpowiedzi](docs/PYTANIA-JURY.md), [scenariusz demonstracji](docs/SCENARIUSZ-DEMO.md) |
| Rodzice i bliscy | [Instrukcja użytkownika](docs/UZYTKOWNIK.md) |
| Produkt i projektowanie | [Założenia produktu](docs/PRODUKT.md), [plan rozwoju](docs/PLAN-ROZWOJU.md) |
| Programiści | [Architektura](docs/ARCHITEKTURA.md), [uruchomienie i wdrożenie](docs/URUCHOMIENIE-I-WDROZENIE.md), [zasady zmian](CONTRIBUTING.md) |
| Asystent AI | [API, źródła i tryby awaryjne](docs/ASYSTENT-AI.md) |
| Weryfikacja treści | [Reguły i źródła](docs/REGULY-I-ZRODLA.md), [rejestr odnośników](docs/REJESTR-ZRODEL.md) |
| Jakość i bezpieczeństwo | [Testy](docs/TESTY.md), [dane i bezpieczeństwo](docs/PRYWATNOSC-I-BEZPIECZENSTWO.md), [zgłoszenia](SECURITY.md) |
| Autorstwo | [Wcześniejsze prace, AI i licencje](docs/HISTORIA-I-AUTORSTWO.md), [historia zmian](CHANGELOG.md) |

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
