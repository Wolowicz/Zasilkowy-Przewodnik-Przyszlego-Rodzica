# Artefakty wydania do repozytorium

Data pakietu: 21.11.2026. Repozytorium zawiera frontend, serwer asystenta, materiały jury i dokumentację. Prywatne metadane hostingu, sekrety i dane rodzin nie są częścią importu.

| Plik | Parametry | SHA-256 |
| --- | --- | --- |
| `otula/dist/Otula-prezentacja.pdf` | 10 slajdów | `44f16f1e0dc584c6ef8f03eb7d53846eeb414fa6e55ecdb31200defdafbf4249` |
| `otula/dist/Otula-demo.mp4` | 90 s; 1920×1080; 60 kl./s; 10 224 452 bajty | `6c8f456b923e5c9355f7399e258a866fad7cc86025aeba8353f3ba800290aa32` |

HTML prezentacji zawiera osadzone obrazy i fonty. Generator oraz wszystkie jego zrzuty są w `otula/materialy`, dzięki czemu można odtworzyć HTML i ponownie wydrukować PDF. PDF zachowano z działającej wersji. Film otrzymał nowy montaż Full HD z prawdziwych ekranów, duże napisy, przejścia i oryginalny instrumental. Źródło montażu, zachowane nagranie wejściowe i storyboard są w `otula/materialy/film`. Odtwarzacz ma rozdziały, plakat i opcjonalny VTT.

Repozytorium zaczyna nową historię. Podstawa frontendu pochodzi z wersji wdrożonej 21.11.2026, o identyfikatorze w poprzednim repozytorium `f1ac460fdb1cef2654b0e3b815b3750974795669`. Tego commita nie należy oczekiwać w historii nowego repozytorium.

Różnice importu: skrypty lokalnego uruchomienia/testów, dokumentacja, rejestr źródeł, synchronizacja danych backendu oraz linki do repozytorium zamiast brakujących ZIP w lokalnych stronach materiałów. Funkcje opublikowanego frontendu nie są zmieniane przez push do GitHuba.

Przed kolejnym wydaniem uruchom testy, sprawdź `git diff --cached`, a następnie `node scripts/audit-package.mjs`. Kontrola wzorców sekretów jest pomocą i nie zastępuje przeglądu treści.
