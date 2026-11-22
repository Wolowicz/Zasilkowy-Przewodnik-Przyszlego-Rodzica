# Otula — Zasiłkowy Przewodnik Przyszłego Rodzica

Prototyp na HackNation 2026 (wyzwanie ZUS). Frontend **React 18 + Vite + Tailwind**, backend **Node.js + Express (REST API)**.
Wygląd wg projektów „Tender Guidance” (Otula); przełącznik „Motyw ZUS” nakłada paletę i kroje z „Empatyczny GovTech ZUS”.

## Uruchomienie

```
npm install
npm run build
npm start          # http://localhost:5180
npm test           # testy silnika reguł i analizatora
```

Windows: dwuklik `start.bat`.

## Moduły (wymagania a–j z briefu)

| Ekran | Zakres |
|---|---|
| Plan i Oś Czasu `/` | profil rodziny, wariant A/B, oś urlopów, harmonogram wypłat i płatników, symulator pracy, terminy (+ eksport .ics); wersja mobilna jako pionowa oś |
| Kalkulator `/kalkulator` | zintegrowany: poród, wieloraczki, „Za życiem”, wcześniak, martwe urodzenie, adopcja i rodzina zastępcza, oboje rodzice, łączenie z pracą, podstawa z Z-3 lub ze sprawy testowej, ryzyka, dokumenty |
| Audytor PDF `/audytor` | upload PDF: warstwa tekstowa (pdf.js) lub OCR (Tesseract.js, model polski) w przeglądarce → `POST /api/audit` → weryfikacja ubezpieczenia i wyliczenie; 7 scenariuszy testowych |
| Dokumenty i Wnioski `/dokumenty` | lista dokumentów wg płatnika, terminy, generator wniosków o urlopy, symulacja wysyłki, wzory ZUS |
| Trudne sytuacje | martwe urodzenie, wcześniak, „Za życiem”, choroba/śmierć matki; organizacje charytatywne |
| Symulacje e-Usług | logowanie mObywatel, dane z ZUS, e-ZLA, zaświadczenie o zadłużeniu, PUE/eZUS, odpis aktu urodzenia (USC) |
| Parametry Admin | stawki, wymiary, kwoty — `PUT /api/rules`, dziennik zmian |
| Kreator `/kreator` | 7 kroków z pomocą „Nie wiem, co to oznacza?” |

## REST API

`GET /api/health` · `GET|PUT /api/rules` · `POST /api/rules/reset` · `POST /api/calculate` · `GET /api/cases[/:id]` · `POST /api/audit` · `POST /api/ask` · `POST /api/demo/login` · `GET /api/demo/profile|ezla|debt` · `GET|POST /api/applications` · `GET|POST /api/pue/messages`

Silnik reguł: `shared/engine.js` — wspólny dla serwera i trybu offline przeglądarki.

## Gdzie działa AI

- OCR skanów (Tesseract LSTM, model polski) — w przeglądarce. Model językowy pobierany z CDN przy pierwszym użyciu (wymaga internetu).
- Kalkulator i weryfikacja uprawnień — deterministyczne reguły, bez AI.
- Asystent „Zapytaj Otulę” — baza wiedzy z podstawą prawną + model przez **OpenRouter** (`server/llm.js`, endpoint `/api/ask`). Bez klucza lub przy błędzie sieci działa dopasowanie reguł.

### Konfiguracja OpenRouter
Skopiuj `.env.example` do `.env` i wpisz `OPENROUTER_API_KEY` (opcjonalnie `OPENROUTER_MODEL`). Plik `.env` jest w `.gitignore` — nie commituj klucza. `GET /api/health` zwraca `llm: true`, gdy klucz jest wczytany.
- Kod i treści przygotowano ze wsparciem asystentów AI.

Dane w scenariuszach są fikcyjne. Wyniki mają charakter informacyjny.
