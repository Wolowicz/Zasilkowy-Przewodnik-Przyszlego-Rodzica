# Wniosek ZAM lokalnie

Moduł `otula/dist/wniosek-pdf.js` uzupełnia urzędowy ZAM z 24.10.2026. Nie składa wniosku, nie podpisuje i nie rozstrzyga prawa. Dane identyfikacyjne pozostają w pamięci widoku; nie są zapisywane w localStorage ani przesyłane do AI. Eksport zachowuje 7 stron (5 wniosku i 2 instrukcji), a podpis pozostaje pusty.

Źródło publicznego, pustego wzoru: [ZUS – ZAM](https://www.zus.pl/documents/10182/4223950/ZAM_wypelnij_i_wydrukuj.pdf/4e4534c6-e7cd-b934-9c5e-aab4d64f3f20?t=1793008198611), pobranie i kontrola 21.11.2026. Kopia jest w `assets/zus-zam-2026-10.pdf`; skrót kontrolny i 85 pól w `assets/zus-zam-fields.json`. Nie są to akta konkursowe.

## Integracja

Załaduj zwykły skrypt `wniosek-pdf.js` po istniejących stylach `style.css`, `zus.css`, `ui-czytelnosc.css`. Biblioteki są ładowane leniwie, wyłącznie z lokalnych assets.

```js
OtulaWniosek.render(container, {
  event: 'birth', role: 'mother', date: '2027-01-12',
  periods: [{kind: 'maternity', from: '2027-01-12', to: '2027-05-31'}],
  onBack: () => otworzWynik()
});
```

Wspierane są też `answers`, `result.pdfContext.periods`, `documentCode` i `benefitId` z wywiadu. Rodzaje okresów: maternity, conditions, parental, supplementary, paternity. Wynik obliczenia jest propozycją do sprawdzenia, nie automatycznie podpisanym oświadczeniem. Dane osobowe użytkownik wprowadza jawnie. Brak odpowiedzi na oświadczenie nie staje się odpowiedzią „nie”.

Przygotowanie PDF używa lokalnego jsPDF i jego istniejącego fontu Sans, a pdf-lib 1.17.1 składa nakładkę na oryginale. Licencja MIT pdf-lib: `assets/wniosek-pdf-lib-license.txt`. Dodatkowa biblioteka jest potrzebna do zachowania oryginalnych stron i połączenia ich z polskimi danymi, których standardowy font PDF nie obsłuży. Eksport jest spłaszczony do sprawdzenia i druku; nie zachowuje interaktywnych pól i skryptów XFA.

Ważna kontrola: opisy dostępności niektórych checkboxów strony 5 oryginalnego PDF nie odpowiadają widocznym etykietom. Mapowanie zweryfikowano na widoku strony: TAK2/NIE2 oznacza poprzedni ojcowski z innego tytułu; TAK/NIE oznacza korzystanie przez drugiego rodzica.

## Wspólny helper dla kolejnych druków

`OtulaWniosek.loadLibraries()` zwraca `{PDFLib, jsPDF, font}`. `composePdf({template, schema, values, title}, libraries?)` przyjmuje bajty wzoru oraz schemat `{pages, fields:[{page, name, rect:[x,y,right,bottom], type:'Text'|'CheckBox', comb, maxLength}]}`. Współrzędne w punktach liczone od lewego górnego rogu strony. Wartości mają klucze `page.name`. Zbyt długa treść jest odrzucana zamiast ucinana. Helper nie waliduje prawa ani merytoryki innego formularza: odpowiedzialność należy do modułu danego druku.

Testy: `node otula/tests/wniosek-pdf.test.cjs`. To testy techniczne i syntetyczne, bez danych rodzin z akt ZUS.
