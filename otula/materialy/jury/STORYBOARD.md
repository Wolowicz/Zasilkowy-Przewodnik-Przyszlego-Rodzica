# Nowa prezentacja i film Otuli

Źródło aktualizacji: działająca aplikacja po poprawkach z 21.11.2026. Zrzuty końcowe zapisujemy w `../zrzuty-final/`. Materiały pokazują dane autorskie i fikcyjne. Nie wykorzystujemy dokumentów ani danych osób z zestawów ZUS, również w postaci wycinków lub odtworzonych formularzy.

## Prezentacja: 10 slajdów, 16:9

| Slajd | Treść | Dowód / obraz |
| --- | --- | --- |
| 1 | Otula. Zasiłkowy Przewodnik Przyszłego Rodzica. | Oryginalne logo i ulubiona ilustracja ciężarnej z aplikacji. |
| 2 | Rodzic potrzebuje wiedzieć, co zrobić teraz. Opis problemu bez wymyślonych statystyk. | Aktualny wybór roli na komputerze. |
| 3 | Osobny plan każdego dziecka. Rola, etap, zatrudnienie i terminy. | Duży pulpit webowy, mały ekran telefonu jako potwierdzenie RWD. |
| 4 | Wariant opieki i zasiłku. Wynik, podział oraz jawne założenia. | Czytelny wycinek autorskiego wyniku kalkulatora. |
| 5 | Dokumenty i e-usługi. Co przygotować i dokąd skierować. | Ekran demonstracyjnego wniosku lub usług, wyraźnie oznaczony jako symulacja. |
| 6 | Karta wsparcia. Prośba, którą bliska osoba może wykonać. | Duży prawdziwy fragment prośby, uzupełniony widokiem telefonu. |
| 7 | Terminy i wydruk dla rodziny. Przypomnienie po imporcie ICS. | Kalendarz webowy; raport jako funkcja opisana krótko. |
| 8 | Asystent przy aktualnej sprawie. Odpowiedź, źródło i granice. | Panel AI obok karty sprawy, rzeczywista odpowiedź bez danych osobowych. |
| 9 | Technologia i gotowość. Reguły oddzielone od modelu, zakres testów i ograniczeń. | Czytelna płaska kompozycja tekstowa, bez udawania certyfikacji. |
| 10 | Demo i dalsza praca. Udział AI i wcześniejsze zasoby. | Link do Otuli, ekran codziennych czynności na telefonie, jawne autorstwo. |

## Film: około 100 sekund, Full HD, 60 kl./s

| Czas | Ujęcie | Napis na ekranie |
| --- | --- | --- |
| 0–6 s | Logo i ilustracja | Otula. Plan dla Waszej rodziny. |
| 6–15 s | Wybór roli na komputerze | Mama, tata lub bliska osoba. |
| 15–24 s | Pulpit webowy, krótko telefon | Każde dziecko ma własny plan. |
| 24–39 s | Kalkulator webowy, zbliżenie wyniku | Okresy i kwoty z jawnymi założeniami. |
| 39–49 s | E-usługi / dokumenty na komputerze | Dokumenty i właściwy płatnik. Symulacja usług. |
| 49–63 s | Karta wsparcia na komputerze, detal prośby | Bliscy wiedzą, w czym pomóc. |
| 63–73 s | Kalendarz webowy | Przypomnienie po imporcie do kalendarza. |
| 73–86 s | Panel AI obok aktualnej sprawy | Pytanie, odpowiedź i źródło w jednym miejscu. |
| 86–94 s | Telefon: codzienne czynności | Podręcznik także na co dzień. |
| 94–102 s | Logo i adres demo | Otula. Zobacz działający prototyp. |

Większość czasu ekranów aplikacji przypada na widoki komputerowe. Tekst pozostaje poza aktywną treścią interfejsu. Krótkie przejścia, lekkie przesunięcia i zbliżenia kierują wzrok, bez wymuszania ciągłego ruchu. Prośba z Karty wsparcia pozostaje dostatecznie długo, aby ją przeczytać. Nie tworzymy fikcyjnego kursora ani kliknięć sugerujących działanie, którego nie zarejestrowano.

## Wymagane zrzuty

`web-start.png`, `web-home.png`, `web-calculator-result.png`, `web-calculator-result-detail.png`, `web-documents.png`, `web-support.png`, `web-support-detail.png`, `web-calendar.png`, `web-ai-panel.png`, `phone-start.png`, `phone-support.png`, `phone-daily.png`.

Preferowany komputer: 1440 × 900 CSS px przy DPR 2. Telefon: 390 × 844 CSS px przy DPR 2. Detale zachowują rzeczywiste proporcje. Każdy zrzut potrzebuje krótkiej adnotacji: trasa, wersja kodu, rozdzielczość i fikcyjność danych. Generator w trybie finalnym odrzuca brakujące zrzuty zamiast zastępować je starszą wersją.

## Zakres przekazu i narzędzia

- Kalkulator: powtarzalne reguły JavaScript, niezależne od modelu językowego. Dokładny zakres dopasowujemy do finalnej implementacji i raportu walidacji.
- Asystent w produkcie: OpenRouter, kontekst sprawy, fragmenty źródeł i odnośniki. Nie pokazujemy AI jako organu ustalającego uprawnienie ani diagnozę.
- Integracje ZUS i mObywatela: demonstracja, jawnie oznaczona na ekranie.
- Tworzenie projektu: Codex i Claude, wcześniejsze ilustracje ImageGen. Eksport: HTML/CSS, Playwright/Edge i FFmpeg. Logo pozostaje oryginalne.
- Muzyka: zachowany autorski podkład proceduralny z poprzedniego filmu; bez cudzych piosenek i klonowanego głosu. Film zrozumiały również bez dźwięku.
- Historia: wcześniejszy prototyp 16–17 XI, rozwój modułu ZUS od 21 XI. Materiały nie przypisują całej pracy okresowi konkursu.

## Kontrola przed publikacją

10 stron PDF, tekst bez obcięć i z polskimi znakami, działające linki, obrazy w proporcji. Film krótszy niż 3 minuty, H.264/AAC, 1920 × 1080, 60 kl./s, szybki start, brak czarnych klatek. Kontrola wszystkich slajdów i każdej sceny również przy 960 × 540. Zestaw gotowych plików: PDF, MP4, plakat, napisy VTT i SRT oraz źródło do odtworzenia.
