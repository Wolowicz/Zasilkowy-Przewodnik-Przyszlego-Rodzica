# Otula dla jury

**Zasiłkowy Przewodnik Przyszłego Rodzica · zadanie ZUS · HackNation 2026**

Stan: 21.11.2026. Materiały przedstawiają działający prototyp i odróżniają go od planowanych funkcji. Projekt nie jest oficjalną usługą ZUS.

## Problem i wartość

Rodzic potrzebuje odpowiedzi na trzy pytania: co dotyczy mojej sytuacji, co przygotować i co zrobić teraz. Informacje są rozproszone między instytucjami, dokumentami i poradnikami. Zmęczenie oraz obowiązki przy dziecku utrudniają przełożenie informacji na działanie. To założenie projektowe, nie wynik własnego badania ilościowego.

Otula prowadzi od sytuacji rodziny przez sprawę i dokumenty do terminu oraz pomocy bliskich. **Karta wsparcia** zmienia „muszę to załatwić” w uprzejmą prośbę, którą rodzic może poprawić i sam udostępnić. Bliska osoba ma własny punkt wejścia do przewodnika.

## Pakiet oceny

- [Demo](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/).
- [10 slajdów PDF](../otula/dist/Otula-prezentacja.pdf) i [notatki prelegenta](../otula/materialy/Otula-slajdy-i-notatki.html) — aktualne ekrany i dane fikcyjne.
- [Film 1:42, Full HD, 60 kl./s](../otula/dist/Otula-demo.mp4), [odtwarzacz online](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/Otula-demo.html) i [źródła montażu](../otula/materialy/jury/README.md).
- Frontend w `otula/dist`, pełny serwer AI w `otula-asystent`, testy i dokumentacja w tym repozytorium.
- [36 aktualnych zrzutów](EKRANY.md), [scenariusz do 3 minut](SCENARIUSZ-DEMO.md), [briefing z dokumentów i trudne pytania jury](ROZMOWA-Z-JURY.md).

Repozytorium jest prywatne. Właścicielka powinna nadać dostęp wskazanym przez organizatora kontom jury i sprawdzić go przed zgłoszeniem. Utworzenie repozytorium nie jest zgłoszeniem konkursowym.

Prezentacja i film pokazują działający interfejs, Kartę wsparcia, terminy, kalkulator i asystenta. Chronione teczki ZUS nie są materiałem publicznego filmu. Stan technicznej kontroli artefaktów opisuje [raport testów](TESTY.md).

## Kryteria i dowody

Wagi pochodzą z s. 16 [briefu ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf). Dowody są mapowaniem zespołu, nie deklaracją przyznanej oceny.

| Obszar | Waga | Dowód | Granica dowodu |
| --- | --- | --- | --- |
| Dopasowanie do zadania | 25% | Kalkulator, okresy i stawki, dokumenty i płatnik; przegląd materiałów ZUS | Gotowa podstawa; 86 rozpoznawanych plików, 57 częściowo odczytanych wyników, 29 nieustalonych, 0 zweryfikowanych kwot |
| Pomysł | 20% | Sytuacja rodziny → sprawa → termin → pomoc | Wartość wymaga badania z rodzicami |
| Autorski wkład | 15% | Karta wsparcia i rola bliskiej osoby | Ujawniony wcześniejszy prototyp i udział AI |
| Pełność i UX | 25% | Web na komputerze i telefonie, konfiguracja rodziny, Menu, kalendarz, raport PDF/Word i źródła | Wyjątki prawne i integracje częściowe |
| Możliwość rozwoju | 15% | Oddzielone reguły, serwer AI, lokalny start i testy | Lokalne parametry i ich walidacja nie są produkcyjną administracją |

## Mapa zakresu

| Potrzeba | Stan | Implementacja / dalsza praca |
| --- | --- | --- |
| Sytuacja rodziny | Działa | Rola → dzieci → zatrudnienie; widok kolumnowy na komputerze, kompaktowy na telefonie |
| Nawigacja i ilustracje | Działa | Menu na telefonie, panel boczny na komputerze, skróty plan/terminy/wsparcie; proporcjonalne ilustracje |
| Świadczenia i formalności | Działa w zakresie katalogu | Karty, korzyści/koszty, dokumenty, źródła, słowniczek |
| Warianty zasiłku | Częściowo | Pule i daty obojga rodziców, 81,5% i granica wniosku, własne 9 tygodni po 70%, minimum pracownika według roku, osobny miesięczny pomocnik podwyższenia z rzeczywistym PIT |
| Podstawa z historii wynagrodzeń | Do wykonania | Użytkownik podaje podstawę potwierdzoną u płatnika |
| Sytuacje szczególne | Częściowo | Wykrycie i skierowanie do indywidualnej analizy |
| Praca w trakcie rodzicielskiego | Częściowo | Stały wymiar do ½ pełnego etatu przez część i jej wydłużenie; redukcja kwoty względem umowy, odrębne zaokrąglenia dni i stawki |
| Adopcja i piecza | Częściowo | Skrócenie okresu z minimum 63 dni na warunkach, pule 38/62; rodzicielski przekraczający 7/10/14 lat wymaga indywidualnego ustalenia |
| Hospitalizacja dziecka | Częściowo | Pomocnik masy, tygodnia ciąży i pobytów, limit 8/15 tygodni, segment 100%; jedna nieprzerwana ścieżka pierwszego rodzica |
| mObywatel, ubezpieczenie, e-ZLA, zadłużenie, eZUS | Symulacja z pełnym przebiegiem | `#e-uslugi`: logowanie z kodem, pobieranie krok po kroku, zaświadczenie na dzień powstania prawa, e-ZLA (kod B), wiadomość do ZUS; trzy fikcyjne osoby, w tym brak ubezpieczenia i zadłużenie |
| Dokumenty i wnioski | Symulacja | Wnioski o urlop (macierzyński, rodzicielski z pracą, ojcowski, wychowawczy), ZAM do płatnika albo ZUS, odpis aktu urodzenia – z potwierdzeniem i numerem; nic nie jest wysyłane |
| Sprawy z zestawu ZUS (upload PDF) | 86 rozpoznawanych, walidacja częściowa | Oryginalny PDF odblokowuje lokalnie zaszyfrowane opracowanie, strony źródłowe i stan odczytu; 57 wyników częściowych, 29 nieustalonych, 0 zweryfikowanych kwot. Nie ma automatycznego OCR nowej teczki ani jawnej kopii danych w repozytorium |
| Parametry reguł | Demonstracja | Walidowany zapis lokalny i reset. Rok minimum wynagrodzenia jest odrębny od wersji reguł; daty roczne nie wyznaczają wygaśnięcia prawa. Plan zakłada brak przyszłych zmian przepisów |
| Asystent | Działa zależnie od dostawców | Panel na komputerze lub ekran na telefonie, kontekst, źródła, cytaty i tryby zastępcze; produkcyjnie `google/gemini-2.5-flash-lite` przez OpenRouter, sekret tylko na serwerze |
| Oficjalne materiały ZUS | Otrzymane; walidacja częściowa | Sześć materiałów ogólnych, 87 skanów z jedną identyczną kopią; lokalny OCR całego zestawu. Po deduplikacji 86 spraw i 2008 stron; dostępność OCR nie oznacza sprawdzenia każdej strony |
| Materiały zgłoszeniowe | Aktualny pakiet | 10 slajdów, film 102 s, rzeczywiste ekrany i źródła eksportu; zgłoszenie i dostęp jury do prywatnego repozytorium pozostają po stronie zespołu |

## Potwierdzone zachowanie

Autorskie testy kalkulatora, izolacji szkiców dzieci, ICS, źródeł AI i lokalnego API można odtworzyć komendą `npm test`. Aktualny zakres i rozróżnienie wcześniejszych kontroli UI opisuje [raport testów](TESTY.md).

Katalog rozpoznaje 86 unikalnych PDF. Z 57 częściowo odczytanych wyników 46 to przyznanie lub adnotacja o wypłacie, a 11 to odmowa; 29 pozostaje nieustalonych. **Zweryfikowane kwoty: 0.** Lokalny test szyfrowania i odszyfrowania odtworzył 86/86 opisów i zachował wcześniejsze 10 identyfikatorów. To dowód techniczny, nie pełna walidacja decyzji lub kwot. Szczegółowe wcześniejsze próby i obecne ograniczenia opisuje [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md).

Sprawdzono 12 tras przy 320, 390 i 1440 px. W zapisanej macierzy 36 widoków nie wystąpiło poziome przepełnienie; to kontrola tych ekranów, nie certyfikat dostępności całego produktu. Publiczna odpowiedź AI na pytanie o dokumenty do becikowego zawierała odnośniki i cytaty urzędowe. Odróżniamy ten test od kontroli każdej możliwej odpowiedzi modelu.

Nie deklarujemy pełnej zgodności prawnej, certyfikacji dostępności, rzeczywistej integracji publicznej ani automatycznej decyzji o świadczeniu. Nie ma udokumentowanego badania skuteczności z rodzicami ani pomiaru oszczędzonego czasu.

## Historia i transparentność

Prototyp rozpoczęto 16–17 listopada, przed pełnym zadaniem. Obejmował markę, karty, rodzinę, Kartę wsparcia, raport i podręcznik. 21 listopada dodano zasiłki, pokazowe e-usługi, parametry, kalendarz, ścieżkę i materiały dopasowane do briefu. Kod i materiały powstawały z pomocą Codex i Claude, ilustracje z ImageGen. Asystent używa OpenRouter; kalkulator nie korzysta z modelu językowego. [Autorstwo i licencje](HISTORIA-I-AUTORSTWO.md).

## Przed zgłoszeniem

1. Dokończyć walidację otrzymanych spraw: porównać podstawę, okres, rozstrzygnięcie i kwotę. Uporządkować różnice między okresem wnioskowanym a rzeczywiście wypłaconym. Materiały osób pozostają lokalne.
2. Sprawdzić formularz zgłoszenia, regulamin, dane zespołu i oświadczenia o wcześniejszej pracy.
3. Nadać konkretnym kontom jury dostęp do repozytorium; potwierdzić pobieranie PDF i filmu.
4. Otworzyć końcowy PDF i film na urządzeniu prezentera, sprawdzić czytelność, dźwięk, linki i brak chronionych danych w materiałach publicznych.
5. Sprawdzić AI przed pokazem, mając przygotowany tryb źródeł bez modelu.
