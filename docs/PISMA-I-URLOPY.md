# Pisma z ZUS i wnioski do pracodawcy

Stan implementacji: 21.11.2026. Moduły nie wysyłają danych do ZUS ani pracodawcy i nie używają AI. Nie zawierają danych spraw konkursowych.

## Pismo z ZUS

`pismo-zus.js` pyta pojedynczo o rodzaj pisma, przedmiot decyzji, świadczenie, wpisany przez rodzica termin, odpowiedzialną osobę i brakujący dokument albo przyczynę odmowy. Decyzja o ubezpieczeniu jest oddzielona od decyzji o zasiłku. Powód odmowy jest oznaczony jako wskazany przez rodzica. Brak dokumentu nie oznacza automatycznie braku prawa, a jego dosłanie nie zapewnia zmiany decyzji.

`OtulaPismo.render(container, {data, step, onChange, onNavigate, onBack})`. Kroki: `kind`, `decisionScope`, `benefit`, `deadline`, `owner`, `missingDocument`, `reason`, `result`. Callback `onChange` przekazuje wyłącznie dozwolone, nieidentyfikujące wybory. Moduł nie ma własnego localStorage; zapis i routing zapewnia wspólny profil wywiadu.

ICS zawiera datę wpisaną przez rodzica, całodniowy termin i alarm dzień wcześniej. Linie są składane według limitu 75 bajtów UTF-8 (RFC5545), daty nie zależą od zmiany czasu. Kalendarz wymaga importu i sprawdzenia ustawień przypomnień; Otula nie wysyła samodzielnych powiadomień. Nie liczymy automatycznie terminu odwołania, bo rodzaj decyzji, doręczenie i jej pouczenie mają znaczenie.

Gotowa prośba do kadr zawiera prośbę o dokument płatnika i potwierdzenie przekazania. Nie jest wysyłana automatycznie. `renderLossSupport(container)` pokazuje spokojną kartę wsparcia i prośbę po stracie.

## Pięć lokalnych PDF do pracodawcy

`urlopy-pdf.js` generuje własne pismo pracownicze: macierzyński, rodzicielski, ojcowski, wychowawczy albo macierzyński po stracie. To nie urzędowe wzory ZUS. Dane osobowe są wpisywane jawnie, pozostają w pamięci widoku i nie są dopisywane do profilu. Podpis pozostaje pusty.

```js
OtulaUrlopy.render(container, {
  kind: 'parental', // maternity | parental | paternity | childcare | loss
  answers, result, periods: [{kind:'parental', from:'2027-01-01', to:'2027-03-04'}],
  onBack
});
```

Kody dokumentów dla wywiadu: `LEAVE-MATERNITY`, `LEAVE-PARENTAL`, `LEAVE-PATERNITY`, `LEAVE-CHILDCARE`, `LEAVE-LOSS`. `reason:'loss'` albo `answers.event` równe `loss`/`childDeath` uruchamia widok po stracie. PDF używa lokalnego jsPDF i osadzonego fontu przez `OtulaWniosek.loadLibraries()`.

Rodzicielski wymaga jawnej historii wykorzystania, liczby części i oświadczenia o drugim rodzicu. Łączenie z pracą ma osobne okresy od–do, wymiar do 1/2 pełnego etatu oraz deklarację dotyczącą wydłużonej części. Ojcowski pyta o wykorzystane 0/7/14 dni, również u innego pracodawcy. Wychowawczy pyta o historię, drugiego opiekuna i staż zatrudnienia. Załączniki trzeba samodzielnie wymienić i potwierdzić, czy są dołączane, czy znajdują się już w aktach pracodawcy.

Po stracie generator nie ma pola imienia, płci ani diagnozy dziecka. Wymaga daty, rodzaju potwierdzenia i sprawdzenia właściwego okresu. Nie zakłada automatycznie ośmiu tygodni w każdym zgonie po urodzeniu lub porodzie mnogim. Także widok urzędowego ZAM ukrywa i czyści dane dziecka; do właściwego miejsca druku przenosi tylko datę i rodzaj dokumentu.

## Źródła i granice

- [Rozporządzenie z 11.03.2025, Dz.U. poz.322](https://eli.gov.pl/eli/DU/2025/322/ogl): §15 rodzicielski, §16 łączenie z pracą, §17 ojcowski, §18 przyjęcie dziecka, §19 wychowawczy, §22 dokumenty już w aktach.
- [MRPiPS — rodzicielski](https://www.gov.pl/web/rodzina/urlop-rodzicielski): wnioski 21 dni przed urlopem i pracą, do połowy etatu, możliwość odmowy łączenia ze względu na organizację lub rodzaj pracy.
- [MRPiPS — ojcowski](https://www.gov.pl/web/rodzina/urlop-ojcowski): wniosek 7 dni przed, maksymalnie dwie części po tygodniu.
- [MRPiPS — wychowawczy](https://www.gov.pl/web/rodzina/urlop-wychowawczy): co najmniej sześć miesięcy zatrudnienia i termin wniosku 21 dni przed.
- [MRPiPS — dokumenty po stracie](https://www.gov.pl/web/rodzina/latwiejszy-dostep-do-swiadczen-po-stracie-ciazy): od 6.08.2025 również zaświadczenie uprawnionego lekarza lub położnej, bez ustalania płci.
- [ZUS — postępowanie w sprawie macierzyńskiego](https://www.zus.pl/en/-/jak-uzyskac-zasilek-macierzynski-z-tytulu-urodzenia-dziecka) i [ZUS — kontakt](https://www.zus.pl/o-zus/kontakt): właściwy tryb zawsze należy odczytać z pouczenia konkretnej decyzji.
- [Ronić po Ludzku](https://ronicpoludzku.com/), [Wcześniak Rodzice–Rodzicom](https://wczesniak.pl/), [Rodzić po Ludzku](https://rodzicpoludzku.pl/o-nas/kontakt/) — różne zakresy wsparcia, bez obietnicy dostępności konsultacji.

Pisma nie zastępują ustalenia prawa, wyczerpującej obsługi nietypowych wyjątków ani pracodawcy potwierdzającego okres. Generator nie oblicza dodatkowo wieku granicznego, pozostałej puli ani dat końca urlopu — wykorzystuje wynik wywiadu i jawnie podane okresy. Pełne 36 miesięcy wychowawczego, wyjątki dotyczące opieki i szczególne przejęcia wymagają właściwych dokumentów. Uzupełniający macierzyński nie ma osobnego pisma pracowniczego w tym module (istnieje ZAM).

Testy syntetyczne: `otula/tests/pismo-zus.test.cjs`, `otula/tests/urlopy-pdf.test.cjs`, rozszerzony `otula/tests/wniosek-pdf.test.cjs`. Kontrola wizualna 320,390,1440px i zrzuty bez danych osób w `otula/materialy/zrzuty-final/`. To walidacja techniczna i reguł formularza, a nie zatwierdzenie przez ZUS.
