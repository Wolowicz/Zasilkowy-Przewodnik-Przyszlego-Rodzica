# Reguły obliczeń i utrzymanie treści

Ten dokument opisuje **implementację prototypu**, a nie wiążącą interpretację prawa. Wynik i kwalifikacja wymagają sprawdzenia przez płatnika lub ZUS. Wersja reguł: `2026-11-21`, plik `otula/dist/zus.js`. Katalog spraw zachowuje datę `17.11.2026`; dodanie repozytorium nie oznacza ponownego sprawdzenia wszystkich kart.

## Dane kalkulatora

Użytkownik podaje rodzaj zdarzenia, liczbę dzieci z jednego porodu/przyjęcia, daty, ubezpieczenie obojga rodziców, gotowe podstawy zasiłku, podział tygodni, wariant stawki i stały wymiar pracy. Liczba wszystkich dzieci w rodzinie nie jest liczbą dzieci urodzonych jednocześnie.

Podstawa jest już ustaloną wartością wejściową. Kalkulator nie przelicza wynagrodzenia netto, historii wypłat, potrąceń, nieobecności ani zbiegu tytułów. Przykładowe wartości formularza nie pochodzą z konta ZUS.

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

To założenie stałej pracy przez całą część rodzicielskiego, również podczas wydłużenia. Nie obejmuje zmiennych odcinków etatu. Wynik sumuje segmenty, nie symuluje rzeczywistych miesięcznych przelewów. Nie potwierdzono zgodności co do grosza z zestawami ZUS.

Wariant 81,5% wymaga daty zdarzenia i wniosku w obsługiwanym przedziale 0–21 dni. Kod sprawdza liczbę dzieci, podstawy, podział tygodni, ubezpieczenie, zakres etatu i sygnały sytuacji szczególnych. Wybrana szczególna sytuacja, nieustalone ubezpieczenie lub zadłużenie przy działalności może blokować kwotę i wyświetlać kwestie do wyjaśnienia.

Adopcja i piecza wymagają dodatkowych dat i sprawdzenia granicy wieku. Przy zbliżeniu do limitu kod kieruje do indywidualnego wyliczenia; nie modeluje wszystkich skróconych okresów ani przejęć uprawnień.

## Poza zakresem wyliczenia

- Podstawa z historii płac; PIT i kwota netto; podwyższenie do świadczenia rodzicielskiego.
- Wynagrodzenie za pracę i osobny zasiłek ojcowski w sumie kalkulatora.
- Pełna obsługa przejęcia macierzyńskiego, hospitalizacji, utraty dziecka, zbiegu ubezpieczeń i indywidualnego długu.
- Automatyczny OCR, weryfikacja danych płatnika, orzeczenie uprawnienia.

## Karty, terminy i dokumenty

Katalog zawiera **21 spraw**, a podręcznik **54 tematy**. [Rejestr 139 odnośników](REJESTR-ZRODEL.md) powstaje z pól źródeł w kodzie. Nie jest liczbą niezależnych badań ani potwierdzeniem przeczytania całych książek. Katalog formularzy prowadzi do [ZUS — zasiłki](https://www.zus.pl/wzory-formularzy/zasilki); aktualne formularze trzeba dobierać do sytuacji płatnika.

`due` może określać dni, miesiące kalendarzowe lub opis słowny. Dodanie automatycznej daty wymaga ustalenia zdarzenia, od którego biegnie termin. Nie wolno zamienić „od sporządzenia karty” na „od porodu” bez wyjaśnienia i źródła. Daty podczas ciąży mogą być wyłącznie planistyczne; hipotetyczne terminy po narodzinach nie są eksportowane jako pewne terminy urzędowe.

Podręcznik odsyła m.in. do NFZ, WHO, AAP/HealthyChildren, Medycyny Praktycznej, Canadian Paediatric Society, stanowisk towarzystw i otwartych podręczników. Publiczny fragment książki jest wskazany jako fragment/adaptacja, nie przeczytana cała publikacja. Wyszukiwanie badań nie powinno zastępować zaleceń klinicznych dotyczących konkretnej grupy wieku.

## Procedura zmiany treści

1. Zanotuj konkretny URL, datę publikacji/aktualizacji i datę odczytu. Odróżnij obowiązywanie przepisu od dnia sprawdzenia.
2. Sprawdź grupę uprawnionych, warunki, wyjątki, początek terminu, właściwy organ i dokumenty.
3. Zmień kartę lub regułę bez zmiany stabilnego ID. Dodaj test granicy, jeśli zmiana dotyczy obliczeń.
4. Uzyskaj niezależny przegląd merytoryczny przed produkcyjnym użyciem.
5. Zsynchronizuj backend, odśwież rejestr źródeł, raporty i prezentację, jeśli pokazują zmienioną treść.
6. Zapisz zmianę i nierozwiązane pytania. Nie aktualizuj globalnej daty sprawdzenia bez przejrzenia całego oznaczonego zakresu.

## Załączniki konkursowe

[Brief ZUS](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf) wskazuje przykładowe sprawy, tabelę okresów i wyciąg przepisów. Tych załączników nie uzyskano. Oficjalny katalog formularzy ani publiczny poradnik nie zastępują testów na przypadkach jury. Po otrzymaniu materiałów należy dopisać tabelę: ID przypadku, dane, wynik oczekiwany, wynik Otuli, różnica, wyjaśnienie i status.
