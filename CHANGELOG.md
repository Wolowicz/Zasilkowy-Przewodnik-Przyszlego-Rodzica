# Historia zmian

## 2026-11-21 (wieczór) — symulacje e-usług, sprawy z zestawu ZUS i czytelność

- Centrum e-usług (`#e-uslugi`) z pełnym przebiegiem symulacji: logowanie mObywatel z kodem, pobieranie danych z ZUS, zaświadczenie o zadłużeniu na dzień powstania prawa, e-ZLA, wiadomość eZUS, wnioski o urlopy i ZAM, odpis aktu urodzenia; trzy fikcyjne osoby. Zastępuje dawne „Dane pokazowe ZUS” (stary adres przekierowuje).
- „Sprawdź sprawę ZUS” (`#sprawdz-sprawe`) i rozpoznawanie PDF w teczce kalkulatora: skrót SHA-256 pliku, decyzja ZUS i porównanie okres po okresie. Dane spraw szyfrowane kluczem z oryginalnego pliku (`scripts/sprawy-zus/zaszyfruj.mjs`); test `otula/tests/sprawy.test.cjs`.
- Bez trójkątów ▶: sekcje rozwijane jako karty z przyciskiem +/–; krótsze objaśnienia, strefa upuszczania PDF zamiast surowego pola pliku, minimalne rozmiary krojów, kompaktowy przycisk asystenta na telefonie.
- Kalkulator: przykłady liczą się od razu; polski zapis „81,5%” i „½ etatu”; w menu „Sprawdź sprawę ZUS”, „Centrum e-usług”, „Świadczenia w ciąży” i „Panel parametrów”.
- Reguły: wniosek o 81,5% przed porodem jest dopuszczalny (B3), zasiłek w wysokości macierzyńskiego do dnia porodu (B7), stawki świadczenia rehabilitacyjnego 90%/75% (B8). Wyniki przeglądu i otwarte pozycje: `docs/WALIDACJA-ZUS.md`.

## 2026-11-21 — poprawki UX i przegląd materiałów ZUS

- Mobilne menu zamiast dwóch rzędów zakładek, spójne kroki powitania i proporcje ilustracji, układ komputerowy oraz podpis „Twój plan rodzicielstwa”.
- Kontekstowy panel asystenta na komputerze i pełny ekran na telefonie; anulowanie oczekiwania, przywracanie fokusu i testy referencji.
- Osobne szkice kalkulatora dla dzieci, jawne brakujące dane, potwierdzenia podstawy/ubezpieczenia/dat i aktualne odnośniki formularzy.
- Osobne wyliczenie rodzicielskiego ojca przy nieubezpieczonej matce, bez doliczania jej macierzyńskiego; 52 autorskie testy kalkulatora i niezależny przegląd reguł wariantu.
- Lokalny przegląd materiałów ogólnych oraz czterech spraw ZUS; zakres i nierozstrzygnięte obliczenia opisuje `docs/WALIDACJA-ZUS.md`. Dokumentów organizatora nie publikowano.
- PDF prezentacji i film pozostają w poprzedniej wersji: ich aktualizacja jest etapem pozostawionym do osobnego potwierdzenia właścicielki.

## 2026-11-21 — przekazanie projektu zespołowi

- Mapa wszystkich materiałów, szybki start i instrukcja skopiowania kompletnego projektu do istniejącego repozytorium kolegów.

## 2026-11-21 — nowy film produktowy

- Montaż 90 s w Full HD, animacje 60 kl./s, krótkie hasła obok prawdziwego interfejsu i osobna scena Karty wsparcia.
- Oryginalny podkład instrumentalny, plakat, VTT, rozdziały i responsywny odtwarzacz.
- Odtwarzalne źródło montażu i dwa prompty do prezentacji oraz filmu; lista rzeczywiście użytych narzędzi.
- Kontrola dekodowania, przejść, czytelności, metadanych i poziomu dźwięku.


## 2026-11-21 — prywatne repozytorium projektu

- Import aktualnego frontendu, źródeł serwera AI, testów, zasobów i licencji.
- Dokumentacja jury, scenariusz prezentacji i pytania; instrukcja rodzica, architektura, API, reguły, prywatność, uruchomienie, testy i plan rozwoju.
- Aktualny PDF (10 slajdów), film (~1:50), zrzuty i edytowalne źródło prezentacji.
- Lokalny start jednym poleceniem, własne API na loopback, przykład konfiguracji bez sekretu i testy adaptera.
- Rejestr 21 spraw, 54 tematów podręcznika i 139 odnośników. Import nie oznacza nowej walidacji całej treści.
- Zmiana linków do archiwów w dwóch lokalnych stronach materiałów na repozytorium; opublikowana wersja Sites nie została zmieniona przez ten import.

## 2026-11-21 — wersja aplikacji po briefie ZUS

Kalkulator i parametry, przykłady autorskie, e-usługi i dokumenty demonstracyjne, kalendarz z własnymi terminami i ICS, ścieżka rodzica, poprawki telefonu, prezentacja oraz nagranie. [Notatka historyczna](docs/historia/WYMAGANIA-ZUS-21-11.md).

## 2026-11-16–17 i dalsze iteracje przed pełnym briefem

Marka Otula, plan formalności, role, rodzina, Karta wsparcia, raporty, podręcznik, asystent i poprawki wyglądu. [Zmiany 17.11](docs/historia/ZMIANY-17-11.md). Historia Git tego repozytorium zaczyna się od importu; nie odtwarza każdej wcześniejszej iteracji.
