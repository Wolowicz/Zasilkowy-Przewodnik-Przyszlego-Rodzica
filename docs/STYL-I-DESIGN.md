# Otula — styl, grafika i design

Obowiązuje wszystkich, którzy zmieniają wygląd Otuli: ludzi, Claude i Codex. Cel: **każdy nowy ekran wygląda jak część tej samej aplikacji**, bez poprawek „na bieżąco”. Wartości poniżej pochodzą z `otula/dist/style.css` i `ui-czytelnosc.css`. Zmieniając je, zmień też ten dokument.

## 1. Charakter

Ciepło, spokój i troska. Aplikacja ma uspokajać rodzica, nie przytłaczać go urzędową formalnością. Białe, jasne tło, pastelowe akcenty (brzoskwinia, żółć, róż, szałwia) i jedna ciemna, jagodowa barwa dla działań. Krótkie teksty, duże odstępy, duże cele dotyku. Nic „niedorobionego”: żadnych surowych kontrolek przeglądarki, trójkątów ▶, nieostylowanych pól plików ani gołych list.

## 2. Kolory

| Rola | Wartość | Użycie |
|---|---|---|
| Tekst główny `--ink` | `#452e35` | nagłówki, treść |
| Tekst pomocniczy `--muted` | `#6f6265` | opisy, podpisy (kontrast ≥ 4,5:1) |
| Akcja `--berry` | `#783e51` | przyciski główne, linki, aktywne elementy |
| Akcja ciemna `--berry-dark` | `#5b293c` | najechanie na przycisk |
| Tło strony `--paper` | `#fffdfb` | tło aplikacji (jasne, nigdy ciemne) |
| Linia `--line` | `#e9e1dd` | obramowania kart i separatory |
| Brzoskwinia `.peach` | tło `#fbe4d7`, tekst `#934e3f` | świadczenia, główne karty |
| Żółć `.gold` | tło `#f8ebc7`, tekst `#80611f` | terminy, ostrzeżenia, uwagi |
| Róż `.rose` | tło `#f4e0e7`, tekst `#91526c` | wsparcie, ścieżka rodzica |
| Szałwia `.sage` | tło `#e6eedc`, tekst `#4c6944` | gotowe, sukces, podręcznik |
| Fokus | `#97496c`, obrys 3 px, odstęp 3 px | każdy element interaktywny |

Zasady: kolor nigdy nie jest jedynym nośnikiem znaczenia (zawsze etykieta lub ikona). Czerwień tylko dla odmów i błędów, w stonowanym odcieniu (`#f8dde2` tło, `#8a2e46` tekst). Nowe barwy dodaje się tylko w tej palecie.

## 3. Typografia

- **Nagłówki i hasła:** DM Serif Text (`--serif`), waga 400, ciasny tracking (około −0,04 em). `h1` 38–64 px, `h2` 25–36 px.
- **Treść i interfejs:** DM Sans, 14–16 px, interlinia 1,4–1,5. Przyciski 13–15 px, waga 650–700.
- **Etykiety nad nagłówkami** (`.small-label`): wersaliki, 12 px, tracking 0,12 em, kolor `--muted`.
- **Minimum:** 12 px dla wersalików, 14 px dla linków i chipów, 16 px w polach formularzy (bez przybliżania na iOS).
- Czcionki są lokalne (`assets/`, licencja SIL OFL). Nie dołączaj czcionek z internetu.

## 4. Układ i odstępy

- Siatka 4/8 px. Odstępy sekcji 24–32 px, wewnątrz kart 16–30 px (`clamp`).
- Komputer: panel boczny (~16 % szerokości) + treść do ~1600 px. Telefon: górny pasek z „Menu”, jedna kolumna, 16 px marginesu.
- Karty: tło `#fff` lub pastel, obramowanie `1px solid var(--line)`, promień **15–24 px**, delikatny cień `0 8px 26px #5a2e400d`. Karty główne mają większy promień (22–24 px).
- Przyciski i chipy: promień **pełny (pigułka)**, min. wysokość **44 px** (cel dotyku).
- Strona nigdy nie przewija się poziomo. Sprawdzaj **320, 390 i 1440 px**.

## 5. Komponenty (używaj istniejących)

| Potrzeba | Komponent | Uwagi |
|---|---|---|
| Działanie główne | `.button.primary` | jeden na widok; jagodowe tło, biały tekst |
| Działanie dodatkowe | `.button.secondary` | białe tło, jagodowy tekst, cienka ramka |
| Wybór / filtr | `.filter` (chip) | `aria-pressed`, aktywny: różowe tło |
| Nawigacja | zakładki/menu, **zawsze** z „Wróć do: …” na podekranach | każdy ekran ma adres `#…` |
| Rozwijana treść | `<details>` | w `ui-czytelnosc.css` dostaje kartę i okrągły przycisk +/–; **nigdy** trójkąt ▶ |
| Wgrywanie pliku | strefa `.sprawa-drop` | nigdy surowe `<input type=file>` |
| Status | pigułka (`.chip`, `.sprawa-status`) | zielona = zgodne/gotowe, żółta = uwaga, czerwona = odmowa |
| Symulacja | jedna pigułka „Symulacja · dane fikcyjne” (`.eu-sym`) | zamiast powtarzanych akapitów |
| Wynik / podsumowanie | karta z dużą liczbą w DM Serif Text | etykieta małym drukiem nad liczbą |
| Powiadomienie | `#notice` | krótkie, zanika po kilku sekundach |

Ikony: własny zestaw liniowy z `icons.js` (obrys 1,65 px, zaokrąglone zakończenia), `aria-hidden`. Kwiat Otuli (`assets/otula-kwiat.svg`) jako znak marki, bez dodatkowych ozdób.

## 6. Grafika

- **Ilustracje:** ciepłe, akwarelowe, w tej samej palecie (brzoskwinia, róż, żółć, zieleń liści). Pochodzą z `assets/*.webp`. Nowe ilustracje: ten sam styl, tło dopasowane do karty, `alt=""` gdy dekoracyjne, zawsze `width`/`height`. Nie rozciągaj obrazów (`object-fit: cover`, stałe proporcje).
- Zdjęć stockowych i ostrych, korporacyjnych grafik nie używamy.
- Logo: `assets/otula-logo.svg` (kwiat + „otula.”), jagodowa kropka. Nie zmieniaj proporcji ani kolorów.

## 7. Treść interfejsu

- Po polsku, ciepło i konkretnie. **Jedno zdanie zamiast akapitu.** Nie powtarzaj zastrzeżeń; jedna pigułka „Symulacja” lub „Orientacyjnie” na ekran.
- Prośby uprzejme: „Bardzo proszę o…”, „czy mogłabym/mógłbym liczyć na…”, formy Ty/Pani/Pan, podziękowanie.
- Zamiast żargonu: nazwa instytucji + co zrobić („Złóż wniosek w ZUS”). Skróty (ZAM, Z-3) tylko z wyjaśnieniem lub linkiem do słowniczka.
- Nie obiecuj tego, czego aplikacja nie robi: symulacje i wyniki są oznaczone, e-usługi nie wysyłają niczego do urzędów.

## 8. Dostępność

Kontrast tekstu ≥ 4,5:1, widoczny fokus, obsługa klawiatury, `aria-current`, `aria-live` dla wyników, `prefers-reduced-motion` (animacje wyłączone), cele dotyku ≥ 44 px, układ działa przy 320 px i zwiększonym tekście.

## 9. Ruch

Subtelny: 150–200 ms, `ease`, tylko przejścia koloru, cienia i przesunięć o kilka pikseli. Bez migania i animacji niezwiązanych z zadaniem.

## 10. Lista kontrolna przed zakończeniem zmiany wyglądu

1. Tylko kolory, czcionki i komponenty z tego dokumentu.
2. Sprawdzone zrzutami na 320, 390 i 1440 px: bez przewijania poziomego, bez uciętych tekstów.
3. Brak `▶`, surowych kontrolek, nagłych kolorów, cieni „z innej aplikacji”.
4. Każdy ekran: nagłówek, krótki opis, jedno działanie główne, przycisk „Wróć”.
5. Fokus widoczny, kontrast sprawdzony, `npm test` przechodzi.
6. Zmiana opisana w `CHANGELOG.md`.

## 11. Gdzie to jest w kodzie

| Plik | Zawartość |
|---|---|
| `otula/dist/style.css` | tokeny (`:root`), układ, karty, przyciski, kolory `.peach/.gold/.rose/.sage` |
| `otula/dist/ui-czytelnosc.css` | sekcje rozwijane, minimalne rozmiary, menu, przycisk asystenta |
| `otula/dist/zus.css`, `calendar.css`, `e-uslugi.css`, `sprawy-zus.css` | style modułów (używają tych samych tokenów) |
| `otula/dist/icons.js` | zestaw ikon |
| `otula/dist/assets/` | logo, ilustracje, czcionki |
