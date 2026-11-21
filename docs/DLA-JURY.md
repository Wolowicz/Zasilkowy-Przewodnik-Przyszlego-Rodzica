# Otula dla jury

**Zasiłkowy Przewodnik Przyszłego Rodzica · zadanie ZUS · HackNation 2026**

Stan: 21.11.2026. Materiały przedstawiają działający prototyp i odróżniają go od planowanych funkcji. Projekt nie jest oficjalną usługą ZUS.

## Problem i wartość

Rodzic potrzebuje odpowiedzi na trzy pytania: co dotyczy mojej sytuacji, co przygotować i co zrobić teraz. Informacje są rozproszone między instytucjami, dokumentami i poradnikami. Zmęczenie oraz obowiązki przy dziecku utrudniają przełożenie informacji na działanie. To założenie projektowe, nie wynik własnego badania ilościowego.

Otula prowadzi od sytuacji rodziny przez sprawę i dokumenty do terminu oraz pomocy bliskich. **Karta wsparcia** zmienia „muszę to załatwić” w uprzejmą prośbę, którą rodzic może poprawić i sam udostępnić. Bliska osoba ma własny punkt wejścia do przewodnika.

## Pakiet oceny

- [Demo](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/).
- [10 slajdów PDF](../otula/dist/Otula-prezentacja.pdf) i [notatki prelegenta](../otula/materialy/Otula-slajdy-i-notatki.html).
- [Nagranie około 1:50](../otula/dist/Otula-demo.mp4), bez dźwięku, z objaśnieniami.
- Frontend w `otula/dist`, pełny serwer AI w `otula-asystent`, testy i dokumentacja w tym repozytorium.
- [Zrzuty](EKRANY.md), [scenariusz do 3 minut](SCENARIUSZ-DEMO.md), [odpowiedzi na pytania](PYTANIA-JURY.md).

Repozytorium jest prywatne. Właścicielka powinna nadać dostęp wskazanym przez organizatora kontom jury i sprawdzić go przed zgłoszeniem. Utworzenie repozytorium nie jest zgłoszeniem konkursowym.

## Kryteria i dowody

Wagi pochodzą z s. 16 [briefu ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf). Dowody są mapowaniem zespołu, nie deklaracją przyznanej oceny.

| Obszar | Waga | Dowód | Granica dowodu |
| --- | --- | --- | --- |
| Dopasowanie do zadania | 25% | Kalkulator, okresy i stawki, dokumenty i płatnik | Gotowa podstawa; brak oficjalnych przypadków do walidacji |
| Pomysł | 20% | Sytuacja rodziny → sprawa → termin → pomoc | Wartość wymaga badania z rodzicami |
| Autorski wkład | 15% | Karta wsparcia i rola bliskiej osoby | Ujawniony wcześniejszy prototyp i udział AI |
| Pełność i UX | 25% | Telefon, dzieci, kalendarz, raport PDF/Word, źródła | Wyjątki prawne i integracje częściowe |
| Możliwość rozwoju | 15% | Oddzielone reguły, serwer AI, lokalny start i testy | Parametry sesyjne nie są produkcyjną administracją |

## Mapa zakresu

| Potrzeba | Stan | Implementacja / dalsza praca |
| --- | --- | --- |
| Sytuacja rodziny | Działa | Rola, etap, dzieci, daty i zatrudnienie |
| Świadczenia i formalności | Działa w zakresie katalogu | Karty, korzyści/koszty, dokumenty, źródła, słowniczek |
| Warianty zasiłku | Częściowo | Standardowe sytuacje, orientacyjne kwoty brutto |
| Podstawa z historii wynagrodzeń | Do wykonania | Użytkownik podaje podstawę potwierdzoną u płatnika |
| Sytuacje szczególne | Częściowo | Wykrycie i skierowanie do indywidualnej analizy |
| Praca w trakcie rodzicielskiego | Częściowo | Stały wymiar do ½ etatu przez całą część i jej wydłużenie |
| Adopcja i piecza | Częściowo | Standardowa ścieżka z datami; skrócone okresy do weryfikacji |
| mObywatel, ubezpieczenie, e-ZLA, saldo | Demonstracja | Fikcyjne dane, bez połączenia z urzędem |
| Dokumenty i wnioski | Częściowo / demonstracja | Linki, lokalny podgląd PDF, próbny formularz i skrzynka |
| OCR dokumentu | Do wykonania | Użytkownik sam przepisuje potwierdzone dane |
| Parametry reguł | Demonstracja | Pamięć sesji, wynik oznaczony jako testowy |
| Asystent | Działa zależnie od dostawców | Źródła i tryby zastępcze; model wymaga sekretu serwera |
| Oficjalne zestawy ZUS | Niepotwierdzone | Nie uzyskano załączników wymienionych w briefie |
| Materiały zgłoszeniowe | Przygotowane | PDF, film, repo, opis i zrzuty; zgłoszenie składa zespół |

## Potwierdzone zachowanie

19 autorskich przypadków kalkulatora i test ICS przeszły kontrolę. Weryfikacja przeglądarkowa wersji z 21.11 objęła 320, 390 i 1440 px oraz dzieci, rok 2027, kalendarz, raport i Kartę wsparcia. Testy logiki i lokalnego API można odtworzyć komendą `npm test`.

Nie deklarujemy pełnej zgodności prawnej, testów na zestawach ZUS, certyfikacji dostępności, rzeczywistej integracji publicznej ani automatycznej decyzji o świadczeniu. Nie ma udokumentowanego badania skuteczności z rodzicami ani pomiaru oszczędzonego czasu. [Zakres testów](TESTY.md).

## Historia i transparentność

Prototyp rozpoczęto 16–17 listopada, przed pełnym zadaniem. Obejmował markę, karty, rodzinę, Kartę wsparcia, raport i podręcznik. 21 listopada dodano zasiłki, pokazowe e-usługi, parametry, kalendarz, ścieżkę i materiały dopasowane do briefu. Kod i materiały powstawały z pomocą Codex i Claude, ilustracje z ImageGen. Asystent używa OpenRouter; kalkulator nie korzysta z modelu językowego. [Autorstwo i licencje](HISTORIA-I-AUTORSTWO.md).

## Przed zgłoszeniem

1. Uzyskać zestawy spraw, tabelę okresów i wyciąg przepisów ZUS; porównać oczekiwane i otrzymane wyniki.
2. Sprawdzić formularz zgłoszenia, regulamin, dane zespołu i oświadczenia o wcześniejszej pracy.
3. Nadać konkretnym kontom jury dostęp do repozytorium; potwierdzić pobieranie PDF i filmu.
4. Obejrzeć demo na urządzeniu prezentera i zachować lokalne materiały.
5. Sprawdzić AI przed pokazem, mając przygotowany tryb źródeł bez modelu.
