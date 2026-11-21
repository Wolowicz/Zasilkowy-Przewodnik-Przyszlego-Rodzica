# Historia, autorstwo, AI i materiały zewnętrzne

## Pochodzenie projektu

Otula powstawała na zamówienie właścicielki projektu. Prototyp z 16–17 listopada 2026 obejmował markę i ilustracje, karty formalności, rodzinę, terminy, Kartę wsparcia, raport i podręcznik. Dalsze iteracje rozwijały telefon, asystenta, treści i materiały jury.

21 listopada, po udostępnieniu pełnego zadania ZUS, dodano kalkulator, przykłady, demonstracyjne dane i dokumenty ZUS, parametry, kalendarz i ścieżkę oraz dopasowano prezentację do 10 slajdów. Wersja importowana do tego repozytorium odpowiada lokalnej bazie wdrożenia Otuli z tego dnia. Import rozpoczyna nową historię Git; nie udaje pełnej historii wcześniejszych repozytoriów hostingu.

W repozytorium zachowano [notatkę 17.11](historia/ZMIANY-17-11.md) oraz [notatkę wymagań 21.11](historia/WYMAGANIA-ZUS-21-11.md) jako materiały historyczne. Dawne zdania o „najnowszej wersji”, lokalizacjach i brakującym repozytorium odnoszą się do czasu ich przygotowania. Bieżący opis jest w README i dokumentacji.

## Udział AI

| Narzędzie | Zastosowanie |
| --- | --- |
| OpenAI Codex | Kod, analiza materiałów, poprawki, testy, dokumentacja i przygotowanie artefaktów |
| Claude | Wcześniejsze zmiany interfejsu, routingu i funkcji opisane w notatce 17.11 |
| ImageGen | Ilustracje użyte w warstwie wizualnej |
| OpenRouter i modele | Działanie asystenta pytań rodziców przez osobny serwer |

Kalkulator korzysta z jawnych reguł JavaScript, nie z generowanych przez model wyliczeń. Wsparcie AI w tworzeniu kodu i dokumentów nie jest niezależną walidacją prawa ani medycyny. Nie przypisujemy całej pracy wyłącznie okresowi konkursu.

## Zasoby i licencje

| Zasób | Status / plik |
| --- | --- |
| DM Sans | SIL Open Font License; `otula/dist/assets/dm-sans-license.txt` |
| DM Serif Text | SIL Open Font License; `otula/dist/assets/dm-serif-license.txt` |
| jsPDF | Dołączona licencja MIT; `report-jspdf-license.txt` |
| Biblioteka DOCX | Dołączona licencja MIT; `report-docx-license.txt` |
| Karty i podręcznik | Opracowane treści ze wskazaniem źródeł; rejestr URL w dokumentacji |
| Kopie tekstów i indeksy backendu | Robocze materiały do odpowiedzi i fallbacku, z URL/datami; nie są udzieleniem licencji do publikowania cudzych pełnych tekstów |
| Logo i ilustracje projektu | Elementy identyfikacji Otuli; ilustracje przygotowane ze wsparciem AI |

Prywatne repozytorium nie nadaje odbiorcom nowej licencji open source do kodu i własnych materiałów projektu. Nie dodano MIT/Apache/GPL dla całego projektu bez decyzji właścicielki. Licencje bibliotek zachowują własny zakres. Przed szerszą dystrybucją należy uzgodnić prawa zespołu i ocenić wykorzystanie cudzych tekstów, grafik oraz zasobów AI.

Przed podpisaniem oświadczeń konkursowych zespół powinien potwierdzić autorów, wcześniejsze zasoby i prawa do nich. [Regulamin ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/a0788fbc-e6cb-42b8-9e51-7524cc46c6a8.pdf) oraz [FAQ konkursu](https://hacknation.pl/faq) są dokumentami organizatora. Wskazanego osobnego wzoru umowy przeniesienia praw nie uzyskano; repozytorium nie zastępuje jego analizy.

## Czego świadomie nie importowano

Sekretów, lokalnych konfiguracji hostingu i jego `.git`, prywatnych adresów z notatek automatyzacji, korespondencji, rzeczywistych profili rodzin, wcześniejszych kopii roboczych, cudzych prezentacji referencyjnych ani redundantnych archiwów ZIP/EXE. Zachowano aktualne źródła aplikacji i backendu, testy, PDF, film, generator slajdów, zrzuty i licencje.
