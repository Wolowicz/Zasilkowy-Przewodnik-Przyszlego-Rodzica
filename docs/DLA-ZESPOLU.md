# Otula — komplet materiałów dla zespołu

Stan: 21 listopada 2026. Zacznij od [README](../README.md) i [zakresu dla jury](DLA-JURY.md).

## Gdzie jest wszystko

| Materiał | Plik lub katalog |
| --- | --- |
| Działająca aplikacja | [Publiczne demo](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/) |
| Kod aplikacji i zasoby | [otula/dist](../otula/dist) |
| Kod asystenta i konfiguracja przykładowa | [otula-asystent](../otula-asystent), [uruchomienie](URUCHOMIENIE-I-WDROZENIE.md) |
| Prezentacja jury PDF | [Otula-prezentacja.pdf](../otula/dist/Otula-prezentacja.pdf) |
| Slajdy do edycji i notatki | [HTML prezentacji](../otula/materialy/Otula-slajdy-i-notatki.html) |
| Nowy film — 90 s, Full HD | [MP4](../otula/dist/Otula-demo.mp4), [odtwarzacz](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/Otula-demo.html) |
| Plakat i napisy filmu | [JPG](../otula/dist/Otula-demo-plakat.jpg), [VTT](../otula/dist/Otula-demo.vtt) |
| Źródło montażu, muzyki i storyboard | [Instrukcja montażu](../otula/materialy/film/README.md), [storyboard](../otula/materialy/film/storyboard.jpg) |
| Prompty prezentacji i filmu, lista narzędzi | [PROMPTY-I-NARZEDZIA.md](PROMPTY-I-NARZEDZIA.md) |
| Ekrany aplikacji | [Galeria](EKRANY.md) |
| Architektura, testy, reguły i źródła | [Architektura](ARCHITEKTURA.md), [testy](TESTY.md), [reguły](REGULY-I-ZRODLA.md), [rejestr źródeł](REJESTR-ZRODEL.md) |
| Autorstwo i ograniczenia | [Historia i autorstwo](HISTORIA-I-AUTORSTWO.md), [plan rozwoju](PLAN-ROZWOJU.md) |

## Przeniesienie do istniejącego repozytorium kolegów

1. Pobierz zawartość gałęzi main jako ZIP z GitHuba, będąc zalogowanym na konto z dostępem do tego prywatnego repozytorium. Archiwum zawiera kod, dokumentację oraz materiały, ale nie historię Git.
2. Rozpakuj je. W lokalnej kopii repozytorium zespołu utwórz osobną gałąź i nowy katalog, np. projekty/otula. Skopiuj do niego całą zawartość rozpakowanego projektu, łącznie z plikami zaczynającymi się od kropki. Nie zastępuj istniejących plików zespołu.
3. Z katalogu skopiowanego projektu uruchom npm start, a następnie npm test. Odnośniki względne w dokumentacji pozostaną poprawne, gdy zachowasz całą strukturę.
4. Dodaj w głównym README zespołu link do projekty/otula/README.md. Przejrzyj zmiany, zapisz commit i prześlij gałąź do przeglądu zespołu.

Jeśli kopiujesz ze sklonowanego repozytorium zamiast ZIP, pomiń wewnętrzny katalog .git. Nie przenoś konfiguracji prywatnego hostingu, kluczy API, plików .env ani danych prawdziwych rodzin. Wersja przechowywana tutaj zawiera przykłady konfiguracji bez sekretów. Zachowaj pliki licencji, źródła i informację o autorstwie.

## Szybkie uruchomienie

Potrzebny jest Node.js 22 lub nowszy. Polecenia wykonuj w katalogu z package.json tego projektu:

```sh
npm start
```

Otwórz http://127.0.0.1:4173. Bez sekretu OpenRouter działa wyszukiwanie źródeł; odpowiedzi modelu wymagają konfiguracji serwera opisanej w instrukcji uruchomienia. Film i PDF są już gotowe — ich obejrzenie nie wymaga uruchamiania generatorów.

## Dostęp i zakres

Repozytorium pozostaje prywatne. Sam link nie nadaje kolegom dostępu. Właścicielka może udostępnić wybranym osobom repozytorium albo przenieść komplet do repozytorium zespołu. Publikacja demo nie publikuje kodu ani nie dodaje współpracowników.

Karta wsparcia jest wyróżnikiem projektu. Zachowaj jej uprzejmy język i możliwość edycji. W prezentacji rozróżniaj funkcje działające, demonstracje e-usług i planowany rozwój. Nie przedstawiaj autorskich testów jako oficjalnej walidacji ZUS.
