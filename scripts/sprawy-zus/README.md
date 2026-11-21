# Sprawy z zestawu testowego ZUS

Materiałów ZUS nie wolno kopiować ani rozpowszechniać. Dlatego aplikacja nie zawiera ani dokumentów, ani jawnych danych spraw.

1. Opisy spraw (JSON) przygotowuje się lokalnie, poza repozytorium. Pola: `plik`, `tytul`, `kategorie`, `fakty`, `zus` (`decyzja`, `uzasadnienie`, `podstawa`, `okresy`), opcjonalnie `kalkulator` i `ryzyka`. Bez imion, nazwisk, PESEL i adresów.
2. `node scripts/sprawy-zus/zaszyfruj.mjs "<katalog z PDF>" "<sprawy.json>"` zapisuje `otula/dist/sprawy-zus-dane.js`. Każda sprawa jest szyfrowana AES-GCM kluczem wyprowadzonym z SHA-256 oryginalnego PDF; nazwa pliku nie trafia do aplikacji.
3. Juror, który ma plik z zestawu, wgrywa go w `#sprawdz-sprawe` albo w teczce kalkulatora. Przeglądarka liczy skrót, odszyfrowuje opis i pokazuje porównanie. Plik nie opuszcza urządzenia.
4. `npm test` sprawdza, że w `otula/dist/sprawy-zus-dane.js` nie ma jawnych danych.
