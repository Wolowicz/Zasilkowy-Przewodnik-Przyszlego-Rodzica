# Artefakty wydania do repozytorium

Data pakietu: 21.11.2026. Repozytorium zawiera frontend, serwer asystenta, materiały jury i dokumentację. Prywatne metadane hostingu, sekrety i dane rodzin nie są częścią importu.

| Plik | Parametry | SHA-256 |
| --- | --- | --- |
| `otula/dist/Otula-prezentacja.pdf` | 10 slajdów | `44f16f1e0dc584c6ef8f03eb7d53846eeb414fa6e55ecdb31200defdafbf4249` |
| `otula/dist/Otula-demo.mp4` | około 109,8 s; 3 121 173 bajty | `cb9bad039181219eaae53265cebe9d83c7dce64ac28592f8f7f36ccde98704bc` |

HTML prezentacji zawiera osadzone obrazy i fonty. Generator oraz wszystkie jego zrzuty są w `otula/materialy`, dzięki czemu można odtworzyć HTML i ponownie wydrukować PDF. PDF i film są zachowane z działającej wersji; nie regenerowano ich przy samym imporcie do GitHuba.

Repozytorium zaczyna nową historię. Podstawa frontendu pochodzi z wersji wdrożonej 21.11.2026, o identyfikatorze w poprzednim repozytorium `f1ac460fdb1cef2654b0e3b815b3750974795669`. Tego commita nie należy oczekiwać w historii nowego repozytorium.

Różnice importu: skrypty lokalnego uruchomienia/testów, dokumentacja, rejestr źródeł, synchronizacja danych backendu oraz linki do repozytorium zamiast brakujących ZIP w lokalnych stronach materiałów. Funkcje opublikowanego frontendu nie są zmieniane przez push do GitHuba.

Przed kolejnym wydaniem uruchom testy, sprawdź `git diff --cached`, a następnie `node scripts/audit-package.mjs`. Kontrola wzorców sekretów jest pomocą i nie zastępuje przeglądu treści.
