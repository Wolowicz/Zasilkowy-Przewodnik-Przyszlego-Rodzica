# Aktualna prezentacja i film dla jury

Ten katalog zawiera odtwarzalne źródła nowej prezentacji (10 slajdów, 16:9) oraz filmu (102 s, 1920 × 1080, 60 kl./s). Film pokazuje przede wszystkim aplikację webową na komputerze; telefon uzupełnia demonstrację. Plan treści i ograniczenia przekazu opisuje [STORYBOARD.md](STORYBOARD.md).

## Źródła obrazu i treści

- Oryginalne logo, ilustracje i lokalne fonty pochodzą z `../../dist/assets/`. Nie przerysowujemy interfejsu.
- Rzeczywiste zrzuty aplikacji z fikcyjnymi danymi znajdują się w `../zrzuty-final/`. Akceptowane rozszerzenia: PNG, JPG, JPEG. Nazwy wymaganych ujęć są w scenariuszu.
- Detale są zwykłymi prostokątnymi wycinkami zrzutów. `prepare_crops.py` zapisuje współrzędne w `zrzuty-final/crops.json`. Po zmianie układu trzeba ponownie sprawdzić współrzędne wzrokowo.
- Żaden slajd ani kadr nie zawiera skanu lub danych osób z prywatnych materiałów konkursowych ZUS. Dokumenty w aplikacji są autorską symulacją.
- Reguły świadczeń wykonuje kod kalkulatora. Produktowy asystent korzysta z OpenRouter; jego trybu źródeł nie przedstawiamy jako odpowiedzi modelu.
- Narzędzia tworzenia projektu i materiałów: Codex, Claude, wcześniejsze ilustracje ImageGen. Skład i eksport: Python, HTML/CSS, Playwright/Edge oraz FFmpeg. Materiały ujawniają wcześniejszy prototyp z 16–17 XI.

## Środowisko

Python 3.11+ z `playwright`, `Pillow`, `numpy`, `scipy` i `PyMuPDF`; Microsoft Edge; FFmpeg i FFprobe w `PATH`. Fonty i obrazy osadzamy lokalnie. Do renderowania nie jest potrzebny klucz API ani połączenie z usługą AI.

Najpierw sprawdzono biblioteki dostarczone z Codex przez `load_workspace_dependencies`. Pakiet ma narzędzia dokumentowe, ale na tej maszynie nie ma Playwright ani PyMuPDF; generator korzysta z dostępnej lokalnej instalacji Python. Playwright otwiera wyłącznie wygenerowane lokalne pliki HTML. Nie steruje aplikacją ani nie tworzy zrzutów jej działania.

## Podgląd roboczy

Polecenia uruchamiaj z katalogu głównego repozytorium:

```powershell
python otula/materialy/jury/export_deck.py --draft
python otula/materialy/jury/render_movie.py --draft --preview
```

Podglądy trafiają wyłącznie do ignorowanego `otula/materialy/film/render/`. Tryb roboczy może podstawić starsze ekrany i pokazuje widoczne oznaczenie. Nigdy nie służy do publikacji. Brak `--draft` wymaga kompletnego zestawu aktualnych zrzutów i nie stosuje zastępników.

## Końcowy eksport

Po przeglądzie zrzutów, treści kalkulatora i raportu walidacji:

```powershell
python otula/materialy/jury/prepare_crops.py
python otula/materialy/jury/export_deck.py
python otula/materialy/jury/render_movie.py --preview
python otula/materialy/jury/render_movie.py --workers 4
python otula/materialy/jury/verify_outputs.py
npm test
```

PDF zapisuje się jako `otula/dist/Otula-prezentacja.pdf`; źródło wraz z notatkami prelegenta jako `otula/materialy/Otula-slajdy-i-notatki.html`. Notatki i źródła są dostępne w HTML, poza wydrukiem slajdów.

Film, plakat i napisy powstają w `otula/materialy/film/render/jury-movie/`. Po pełnym przeglądzie należy skopiować do `otula/dist/` pliki `Otula-demo.mp4`, `Otula-demo-plakat.jpg`, `Otula-demo.vtt`, `Otula-demo.srt`, a następnie uzgodnić rozdziały strony `Otula-demo.html` z `SCENES` w `build_movie.py`. Sam generator nie podmienia opublikowanego filmu.

`--finish --workers 4` pozwala ponowić łączenie i dźwięk z istniejących czterech segmentów. Wolno go użyć wyłącznie wtedy, gdy od renderu nie zmieniły się źródła, zrzuty ani oś czasu. Po zmianie trzeba renderować wszystkie segmenty ponownie.

## Kontrola jakości

- `export_deck.py`: 10 slajdów, załadowane fonty i obrazy, raport przekroczeń tekstu, 10 PNG do przeglądu.
- `render_movie.py --preview`: każda scena, plakat, plansza kontaktowa i kontrola położenia nagłówków. Ruch to krótkie przejścia i łagodne zbliżenie bez pozorowania kliknięć.
- `verify_outputs.py`: liczba i format stron PDF, tekst z polskimi znakami, aktywny link demo, metadane filmu, długość, rozdzielczość, klatkaż i obecność dźwięku. Raport nie zastępuje przeglądu wzrokowego.
- Finalny przegląd obejmuje każdy slajd, kadr sceny, przejścia, czytelność przy 960 × 540 oraz odsłuch. W przypadku zmian w treści lub obrazie kontrolę powtarzamy.
- Podkład instrumentalny powstaje proceduralnie z kodu `music.py` (na bazie wcześniejszego montażu zespołu). Nie zawiera cudzych nagrań, sampli ani lektora. Normalizacja: −18 LUFS, docelowy true peak −1,5 dBTP. Film pozostaje zrozumiały bez dźwięku, dodatkowe opisy są w VTT/SRT.

Publikację i przesłanie zgłoszenia wykonuje zespół zgodnie z aktualnym zakresem zadania. Materiały nie deklarują urzędowej decyzji, pełnej certyfikacji ani rzeczywistej integracji z ZUS.
