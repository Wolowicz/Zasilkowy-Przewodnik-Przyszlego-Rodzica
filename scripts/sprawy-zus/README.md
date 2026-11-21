# Sprawy z zestawu testowego ZUS

Materiałów ZUS nie wolno kopiować ani rozpowszechniać. Dlatego aplikacja nie zawiera ani dokumentów, ani jawnych danych spraw.

1. Opisy spraw (JSON) przygotowuje się lokalnie, poza repozytorium. Pola: `plik`, `tytul`, `kategorie`, `fakty`, `zus` (`decyzja`, `uzasadnienie`, `podstawa`, `okresy`), opcjonalnie `kalkulator` i `ryzyka`. Bez imion, nazwisk, PESEL i adresów. Stan decyzji: `przyznano`, `odmowa`, `czesciowo` lub `nieustalona`. Nazwa pliku ani sam wniosek nie potwierdzają przyznania świadczenia.
2. `node scripts/sprawy-zus/zaszyfruj.mjs "<katalog z PDF>" "<sprawy.json>"` zapisuje `otula/dist/sprawy-zus-dane.js`. Każda sprawa jest szyfrowana AES-GCM kluczem wyprowadzonym z SHA-256 oryginalnego PDF; nazwa pliku nie trafia do aplikacji.
3. Juror, który ma plik z zestawu, wgrywa go w `#sprawdz-sprawe` albo w teczce kalkulatora. Przeglądarka liczy skrót, odszyfrowuje opis i pokazuje porównanie. Plik nie opuszcza urządzenia.
4. `npm test` sprawdza, że w `otula/dist/sprawy-zus-dane.js` nie ma jawnych danych.

Katalog z 21.11.2026 rozpoznaje **86 unikalnych plików** z zestawu 87 PDF (jedna kopia jest identyczna bajtowo). Zachowuje wcześniejsze 10 spraw i dodaje 76. W 57 sprawach odczytano decyzję albo adnotację o wyniku; w 29 rozstrzygnięcie pozostaje nieustalone. **Nie zweryfikowano kwot żadnej sprawy.** Nie jest to deklaracja pełnej poprawności merytorycznej 86 wyników.

Każdy zaszyfrowany opis ma `walidacja` (status, zakres, data, strony, stan rozstrzygnięcia i kwoty) oraz `zrodla` wskazujące strony oryginału. `wnioskowaneOkresy` są oddzielone od okresów odczytanych jako rozstrzygnięte. Przy `nieustalona` nie zapisujemy przyznanych okresów ani gotowych założeń kalkulatora. Statystyki publiczne rozdzielają rozpoznawanie plików, częściowy odczyt rozstrzygnięcia oraz weryfikację kwot.

Pełny lokalny audyt SHA-256 PDF/OCR, mapowanie źródeł i jawny JSON pozostają poza repozytorium, w lokalnym katalogu analizy materiałów konkursowych. OCR wykonano lokalnie; dokumentów nie wysłano do modelu ani usługi OCR. Skrypt szyfrujący przerywa pracę przy brakującym PDF, nieprawidłowym statusie lub duplikacie, zamiast zapisywać niepełny katalog.
