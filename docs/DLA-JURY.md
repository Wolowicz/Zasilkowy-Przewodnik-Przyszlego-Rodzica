# Otula dla jury

**Zasiłkowy Przewodnik Przyszłego Rodzica · zadanie ZUS · HackNation 2026**

Stan: 21.11.2026. Materiały przedstawiają działający prototyp i odróżniają go od planowanych funkcji. Projekt nie jest oficjalną usługą ZUS.

## Problem i wartość

Rodzic potrzebuje odpowiedzi na trzy pytania: co dotyczy mojej sytuacji, co przygotować i co zrobić teraz. Informacje są rozproszone między instytucjami, dokumentami i poradnikami. Zmęczenie oraz obowiązki przy dziecku utrudniają przełożenie informacji na działanie. To założenie projektowe, nie wynik własnego badania ilościowego.

Otula prowadzi od sytuacji rodziny przez sprawę i dokumenty do terminu oraz pomocy bliskich. **Karta wsparcia** zmienia „muszę to załatwić” w uprzejmą prośbę, którą rodzic może poprawić i sam udostępnić. Bliska osoba ma własny punkt wejścia do przewodnika.

## Pakiet oceny

- [Demo](https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/).
- [10 slajdów PDF](../otula/dist/Otula-prezentacja.pdf) i [notatki prelegenta](../otula/materialy/Otula-slajdy-i-notatki.html) — poprzednia wersja.
- [Nagranie 1:30 w Full HD](../otula/dist/Otula-demo.mp4) — poprzednia wersja, zrozumiała także bez dźwięku.
- Frontend w `otula/dist`, pełny serwer AI w `otula-asystent`, testy i dokumentacja w tym repozytorium.
- [Zrzuty](EKRANY.md), [scenariusz do 3 minut](SCENARIUSZ-DEMO.md), [odpowiedzi na pytania](PYTANIA-JURY.md).

Repozytorium jest prywatne. Właścicielka powinna nadać dostęp wskazanym przez organizatora kontom jury i sprawdzić go przed zgłoszeniem. Utworzenie repozytorium nie jest zgłoszeniem konkursowym.

PDF, film, źródła slajdów i dotychczasowa galeria nie dokumentują wszystkich najnowszych zmian. Aktualizacja prezentacji i filmu pozostaje do osobnego potwierdzenia właścicielki; obecny przegląd nie zmienia tych plików.

## Kryteria i dowody

Wagi pochodzą z s. 16 [briefu ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf). Dowody są mapowaniem zespołu, nie deklaracją przyznanej oceny.

| Obszar | Waga | Dowód | Granica dowodu |
| --- | --- | --- | --- |
| Dopasowanie do zadania | 25% | Kalkulator, okresy i stawki, dokumenty i płatnik; przegląd materiałów ZUS | Gotowa podstawa; cztery sprawy sprawdzono częściowo, bez zamkniętej walidacji kwot |
| Pomysł | 20% | Sytuacja rodziny → sprawa → termin → pomoc | Wartość wymaga badania z rodzicami |
| Autorski wkład | 15% | Karta wsparcia i rola bliskiej osoby | Ujawniony wcześniejszy prototyp i udział AI |
| Pełność i UX | 25% | Web na komputerze i telefonie, konfiguracja rodziny, Menu, kalendarz, raport PDF/Word i źródła | Wyjątki prawne i integracje częściowe |
| Możliwość rozwoju | 15% | Oddzielone reguły, serwer AI, lokalny start i testy | Parametry sesyjne nie są produkcyjną administracją |

## Mapa zakresu

| Potrzeba | Stan | Implementacja / dalsza praca |
| --- | --- | --- |
| Sytuacja rodziny | Działa | Rola → dzieci → zatrudnienie; widok kolumnowy na komputerze, kompaktowy na telefonie |
| Nawigacja i ilustracje | Działa | Menu na telefonie, panel boczny na komputerze, skróty plan/terminy/wsparcie; proporcjonalne ilustracje |
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
| Asystent | Działa zależnie od dostawców | Panel na dużym ekranie lub ekran na telefonie; kontekst sprawy, źródła, cytaty i tryby zastępcze; sekret tylko na serwerze |
| Oficjalne materiały ZUS | Otrzymane; walidacja częściowa | Sześć materiałów ogólnych i 87 skanów spraw; próba czterech: trzy częściowe zgodności, jedna poza modelem, zero zamkniętych walidacji kwoty |
| Materiały zgłoszeniowe | Wymagają aktualizacji i zatwierdzenia | Istniejący PDF i film pokazują poprzednią wersję; zgłoszenie składa zespół |

## Potwierdzone zachowanie

Autorskie testy kalkulatora, izolacji szkiców dzieci, ICS, źródeł AI i lokalnego API można odtworzyć komendą `npm test`. Aktualny zakres i rozróżnienie wcześniejszych kontroli UI opisuje [raport testów](TESTY.md).

W próbie spraw ZUS lokalny OCR objął 74 strony, a przegląd wizualny 14 kluczowych stron. Standardowy okres 20 + 32 tygodnie, adopcyjny 20 + 56 tygodni z Za życiem oraz blokada kwoty przy braku ubezpieczenia dały częściową zgodność. Sprawa pracy na część etatu z wcześniejszym zakończeniem i podwyższeniem świadczenia wykracza poza model. **Nie potwierdzono kwot żadnej z czterech spraw; pozostałe 83 pliki nie były analizowane indywidualnie.** [Pełny wynik i ograniczenia](WALIDACJA-ZUS.md).

Nie deklarujemy pełnej zgodności prawnej, certyfikacji dostępności, rzeczywistej integracji publicznej ani automatycznej decyzji o świadczeniu. Nie ma udokumentowanego badania skuteczności z rodzicami ani pomiaru oszczędzonego czasu.

## Historia i transparentność

Prototyp rozpoczęto 16–17 listopada, przed pełnym zadaniem. Obejmował markę, karty, rodzinę, Kartę wsparcia, raport i podręcznik. 21 listopada dodano zasiłki, pokazowe e-usługi, parametry, kalendarz, ścieżkę i materiały dopasowane do briefu. Kod i materiały powstawały z pomocą Codex i Claude, ilustracje z ImageGen. Asystent używa OpenRouter; kalkulator nie korzysta z modelu językowego. [Autorstwo i licencje](HISTORIA-I-AUTORSTWO.md).

## Przed zgłoszeniem

1. Dokończyć walidację otrzymanych spraw: porównać podstawę, okres, rozstrzygnięcie i kwotę. Uporządkować różnice między okresem wnioskowanym a rzeczywiście wypłaconym. Materiały osób pozostają lokalne.
2. Sprawdzić formularz zgłoszenia, regulamin, dane zespołu i oświadczenia o wcześniejszej pracy.
3. Nadać konkretnym kontom jury dostęp do repozytorium; potwierdzić pobieranie PDF i filmu.
4. Po osobnym potwierdzeniu właścicielki zaktualizować PDF i film rzeczywistymi ekranami, przede wszystkim webowymi; zachować ujęcia telefonu jako uzupełnienie. Obejrzeć finalne materiały na urządzeniu prezentera.
5. Sprawdzić AI przed pokazem, mając przygotowany tryb źródeł bez modelu.
