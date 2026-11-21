# Kontrola materiałów dla jury — 21 listopada 2026

Wyniki dotyczą plików w `otula/dist/`. Pokazują aplikację webową na komputerze i telefonie, z fikcyjnymi danymi. Wersja odtwarzalna znajduje się w tym katalogu; zrzuty oraz współrzędne rzeczywistych wycinków w `../zrzuty-final/`.

| Kontrola | Wynik |
| --- | --- |
| Prezentacja | 10 stron, 16:9, 960 × 540 pt; 2 800 409 bajtów |
| Tekst PDF | Tekst wyszukiwalny, polskie znaki, bez napisu roboczego; klikalny link do demonstracji |
| Układ PDF | 0 ostrzeżeń przepełnienia; wyrenderowano i obejrzano wszystkie slajdy, w tym duże detale Karty wsparcia i codziennej czynności z telefonu |
| Film | 102,000 s, 1920 × 1080, 60 kl./s, 6120 klatek, H.264 High / YUV 4:2:0, BT.709 |
| Rozmiar filmu | 20 946 445 bajtów |
| Dźwięk | AAC, stereo, 48 kHz; pomiar po końcowym kodowaniu: −18,01 LUFS, −7,22 dBTP, zakres 3,7 LU |
| Dekodowanie | Cały MP4 zdekodowano bez błędu; nie wykryto czarnych odcinków ≥ 0,15 s |
| Kontrola obrazu | Przejrzano końcowe kadry wszystkich 10 scen oraz duże detale. Kompozycja nie rozciąga zrzutów; obrazy nie zasłaniają podpisów |
| Napisy | 20 opisów scen w VTT i SRT, zgodnych z osią czasu |
| Odtwarzacz | 320, 390 i 1440 px bez poziomego przewijania; wybranie rozdziału 73 s zakończyło się dekodowaniem klatki (`readyState = 4`) |
| Projekt | `npm test`: 105 autorskich przypadków kalkulatora oraz pozostałe zestawy — PASS; nie jest to pełna walidacja prawna na przypadkach jury |

## Zakres przedstawienia AI

Na zrzucie asystenta widoczny jest **tryb źródeł przy niedostępności modelu**. Slajd, podpis filmu i notatki mówią o tym wprost. Nie przedstawiamy tego ekranu jako odpowiedzi wygenerowanej przez model ani nie obiecujemy nieprzerwanej dostępności usługi. Ewentualna wymiana na potwierdzoną odpowiedź wymaga odświeżenia zrzutu, slajdu, sceny AI oraz tego raportu.

## Raporty techniczne

Generator zapisuje pliki diagnostyczne w ignorowanym `otula/materialy/film/render/`:

- `jury-review/layout-warnings.json` — granice tekstu slajdów;
- `jury-movie/artifact-checks.json` — format PDF/MP4 i liczba napisów;
- `jury-movie/video-quality-checks.json` — dekodowanie, czarne klatki i głośność;
- `jury-movie/player-checks.json` — szerokości i przejście do rozdziału;
- `jury-movie/final-contact.jpg` — kadry wyjęte z końcowego MP4.

Kontrola obrazu obejmuje kadry i układ, a kontrola dźwięku — parametry sygnału. Nie zastępuje to oceny artystycznej montażu przez zespół. Materiały nie zawierają skanów, danych osób ani kopii prywatnych załączników ZUS.
