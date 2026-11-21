# Reguły obliczeń i utrzymanie treści

Ten dokument opisuje **implementację prototypu**, a nie wiążącą interpretację prawa. Wynik i kwalifikacja wymagają sprawdzenia przez płatnika lub ZUS. Wersja reguł: `2026-11-21`, plik `otula/dist/zus.js`. Katalog spraw zachowuje datę `17.11.2026`; dodanie repozytorium nie oznacza ponownego sprawdzenia wszystkich kart.

## Dane kalkulatora

Użytkownik podaje rodzaj zdarzenia, liczbę dzieci z jednego porodu/przyjęcia, daty, ubezpieczenie obojga rodziców, gotowe podstawy zasiłku, podział tygodni, wariant stawki i stały wymiar pracy. Liczba wszystkich dzieci w rodzinie nie jest liczbą dzieci urodzonych jednocześnie.

Podstawa jest już ustaloną wartością wejściową. Kalkulator nie przelicza wynagrodzenia netto, historii wypłat, potrąceń, nieobecności ani zbiegu tytułów. Przykładowe wartości formularza nie pochodzą z konta ZUS. Przed wyliczeniem użytkownik potwierdza sprawdzenie ubezpieczenia, podstawy i dat w teczce. Nieustalone ubezpieczenie drugiego rodzica nie jest traktowane jak brak jego uprawnień. Szkice należą do wybranego dziecka i są unieważniane po zmianie powiązanej sytuacji.

## Parametry zapisane w kodzie

| Parametr | Wartość w prototypie |
| --- | --- |
| Okres macierzyński, 1/2/3/4/5+ dzieci | 20/31/33/35/37 tygodni |
| Rodzicielski, jedno / więcej dzieci | 41/43 tygodnie |
| Wariant Za życiem | 65/67 tygodni |
| Część zastrzeżona rodzicowi | 9 tygodni |
| Stawki | 100%, 70%, wariant 81,5%; własne 9 tygodni drugiego rodzica: 70% |

Źródła użyte przy przygotowaniu reguł: [wysokość zasiłku ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc), [okresy macierzyńskiego i przyjęcie na wychowanie](https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego), [rodzicielski — Ministerstwo Rodziny](https://www.gov.pl/web/rodzina/urlop-rodzicielski). Oryginały opisują warunki i wyjątki; sama tabela parametrów ich nie zastępuje.

## Algorytm i zaokrąglenia

Dla segmentu o `weeks`, podstawie `base`, stawce `rate` i stałym ułamku pracy `fraction` kod liczy:

```text
days  = floor(weeks × 7 / (1 − fraction) + 1e−8)
daily = round(base / 30 × rate / 100 × (1 − fraction), do 2 miejsc)
total = round(days × daily, do 2 miejsc)
```

To założenie stałej pracy przez całą część rodzicielskiego, również podczas wydłużenia. Nie obejmuje zmiennych odcinków etatu ani wcześniejszego zakończenia wypłaty na wniosek. Wynik sumuje segmenty, nie symuluje rzeczywistych miesięcznych przelewów. W próbie czterech dostarczonych spraw ZUS potwierdzono częściowo struktury okresów i jedną blokadę, ale **nie potwierdzono żadnej kwoty co do grosza**. [Zakres walidacji](WALIDACJA-ZUS.md).

Wariant 81,5% wymaga daty zdarzenia i wniosku w obsługiwanym przedziale 0–21 dni. Kod sprawdza liczbę dzieci, podstawy, podział tygodni, ubezpieczenie, zakres etatu i sygnały sytuacji szczególnych. Wybrana szczególna sytuacja, nieustalone ubezpieczenie lub zadłużenie przy działalności może blokować kwotę i wyświetlać kwestie do wyjaśnienia.

Adopcja i piecza wymagają dodatkowych dat i sprawdzenia granicy wieku. Przy zbliżeniu do limitu kod kieruje do indywidualnego wyliczenia; nie modeluje wszystkich skróconych okresów ani przejęć uprawnień.

## Odrębny wariant ojca

Osobny wariant porodu pozwala policzyć rodzicielski ubezpieczonego ojca przy potwierdzonym braku ubezpieczenia matki: maksymalnie pula minus 9 tygodni matki, stawka 70%, bez macierzyńskiego matki i bez wariantu 81,5%. Własne 9 tygodni ojca mieści się już w podanej liczbie. Obliczenie zakłada niewykorzystaną wcześniej pulę, własne uprawnienie ojca i brak sytuacji szczególnej; nie rozstrzyga ich automatycznie. Wybór zmiennego etatu, przerw lub zakończenia urlopu wstrzymuje uproszczony wynik i wskazuje konieczność rozliczenia odcinków.

## Poza zakresem wyliczenia

- Podstawa z historii płac; PIT i kwota netto; podwyższenie do świadczenia rodzicielskiego.
- Wynagrodzenie za pracę i osobny zasiłek ojcowski w sumie kalkulatora.
- Pełna obsługa przejęcia macierzyńskiego, hospitalizacji, utraty dziecka, zbiegu ubezpieczeń i indywidualnego długu.
- Automatyczny OCR, weryfikacja danych płatnika, orzeczenie uprawnienia.

## Karty, terminy i dokumenty

Katalog zawiera **21 spraw**, a podręcznik **54 tematy**. [Rejestr odnośników](REJESTR-ZRODEL.md) powstaje z pól źródeł w kodzie. Nie jest liczbą niezależnych badań ani potwierdzeniem przeczytania całych książek. Katalog formularzy prowadzi do [ZUS — zasiłki](https://www.zus.pl/wzory-formularzy/zasilki); aktualne formularze trzeba dobierać do sytuacji płatnika. [Oddzielna notatka](FORMULARZE-ZUS.md) opisuje weryfikację zmian formularzy i konflikt między starszym poradnikiem a nowszymi komunikatami.

`due` może określać dni, miesiące kalendarzowe lub opis słowny. Dodanie automatycznej daty wymaga ustalenia zdarzenia, od którego biegnie termin. Nie wolno zamienić „od sporządzenia karty” na „od porodu” bez wyjaśnienia i źródła. Daty podczas ciąży mogą być wyłącznie planistyczne; hipotetyczne terminy po narodzinach nie są eksportowane jako pewne terminy urzędowe.

Podręcznik odsyła m.in. do NFZ, WHO, AAP/HealthyChildren, Medycyny Praktycznej, Canadian Paediatric Society, stanowisk towarzystw i otwartych podręczników. Publiczny fragment książki jest wskazany jako fragment/adaptacja, nie przeczytana cała publikacja. Wyszukiwanie badań nie powinno zastępować zaleceń klinicznych dotyczących konkretnej grupy wieku.

## Procedura zmiany treści

1. Zanotuj konkretny URL, datę publikacji/aktualizacji i datę odczytu. Odróżnij obowiązywanie przepisu od dnia sprawdzenia.
2. Sprawdź grupę uprawnionych, warunki, wyjątki, początek terminu, właściwy organ i dokumenty.
3. Zmień kartę lub regułę bez zmiany stabilnego ID. Dodaj test granicy, jeśli zmiana dotyczy obliczeń.
4. Uzyskaj niezależny przegląd merytoryczny przed produkcyjnym użyciem.
5. Zsynchronizuj backend i odśwież rejestr źródeł oraz raporty aplikacji. Prezentację i film aktualizuj w uzgodnionym zakresie; obecne pliki pokazują poprzednią wersję i pozostają bez zmian do osobnego potwierdzenia właścicielki.
6. Zapisz zmianę i nierozwiązane pytania. Nie aktualizuj globalnej daty sprawdzenia bez przejrzenia całego oznaczonego zakresu.

## Załączniki konkursowe

[Brief ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf) wskazuje przykładowe sprawy, tabelę okresów i wyciąg przepisów. **21.11.2026 materiały otrzymano:** sześć dokumentów ogólnych oraz 87 skanowanych PDF ze sprawami. Ogólne materiały odczytano lokalnie. Próba czterech spraw obejmowała lokalny OCR 74 stron i wizualne sprawdzenie 18 stron kluczowych.

Wynik: trzy częściowe zgodności okresu lub blokady, jedna sprawa poza modelem, zero zakończonych walidacji kwoty; pozostałych 83 plików nie analizowano indywidualnie. [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md) mapuje wymagania i reguły na dostarczone materiały oraz opisuje każdą granicę dowodu. Przypadek pracy na część etatu pokazał potrzebę modelowania rzeczywistych odcinków i podwyższenia świadczenia, a przypadki podstaw — zmian etatu i krótkiego ubezpieczenia.

Skany, odczyty OCR, dane płacowe, daty rodzin i mapowanie osób pozostają poza repozytorium, stroną i bazą AI. Lokalna karta dalszej walidacji powinna zawierać anonimowy identyfikator, dane, wynik oczekiwany, wynik Otuli, różnicę, wyjaśnienie i status. Agregat w repozytorium nie jest dowodem kompletnego odtworzenia decyzji ZUS.
