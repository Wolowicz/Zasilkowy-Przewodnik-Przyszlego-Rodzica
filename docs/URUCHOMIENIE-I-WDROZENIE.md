# Uruchomienie, konfiguracja i wdrożenie

## Wymagania

Node.js 22+ i przeglądarka obsługująca JavaScript. Git potrzebny do klonowania prywatnego repozytorium z autoryzacją właścicielki. `npm install` nie jest wymagane: lokalne skrypty korzystają z modułów wbudowanych, a biblioteki frontendu są dołączone. Python 3 jest opcjonalny do generatora slajdów i odświeżania pamięci stron.

## Start bez klucza

W katalogu repozytorium wykonaj:

```sh
npm start
```

Otwórz `http://127.0.0.1:4173`. Ten dokładny host jest wymagany przez lokalny adapter; `localhost` nie jest jego dozwolonym hostem. Zatrzymanie: Ctrl+C. Aplikacja i własne API działają pod jednym adresem. Bez klucza pytania dotyczące rozpoznanych kart otrzymują źródła. Wyszukiwanie nowych treści wymaga internetu. Model nie jest wywoływany bez klucza.

## Gdzie bezpiecznie dodać klucz OpenRouter

1. Skopiuj `.env.example` do **`.env.local`** w katalogu repozytorium.
2. Otwórz `.env.local` w edytorze i wpisz nowy klucz za `OPENROUTER_API_KEY=`. Nie umieszczaj go w zrzutach, dokumentacji, pytaniach do AI ani w `otula/dist`.
3. Uruchom:

```sh
node --env-file=.env.local scripts/dev.mjs
```

`.env.local` jest ignorowany przez Git. Sprawdź to poleceniem `git check-ignore .env.local`. W hostingu produkcyjnym ustaw sekret **OPENROUTER_API_KEY** w menedżerze sekretów usługi backendu. Nie zapisuj klucza w konfiguracji publicznej strony. Klucz ujawniony wcześniej w czacie lub pliku należy zastąpić nowym u dostawcy; nie kopiuj go do repozytorium.

Uruchomiony serwer odczytuje klucz przy wywołaniu workera. Po zmianie pliku środowiska uruchom proces ponownie. Konsola pokazuje wyłącznie informację, czy klucz jest ustawiony, bez jego wartości.

## Testy i build

```sh
npm test
npm run build:assistant
npm run sources
```

`build:assistant` synchronizuje karty, podręcznik i dopasowanie z frontendu, następnie składa worker. Wynik `otula-asystent/dist/server/index.js` jest odtwarzalny i ignorowany przez Git. Dane wejściowe i skrypty są wersjonowane. Rejestr źródeł powstaje w `docs/REJESTR-ZRODEL.md` i JSON; to indeks, nie nowa walidacja prawna.

## Odświeżanie źródeł

W katalogu `otula-asystent`:

```sh
node sync-cards.mjs
python refresh-sources.py
node refresh-medical.mjs
node build.mjs
```

Skrypt Python wymaga `requests` i `beautifulsoup4`. Zainstaluj je w osobnym środowisku wirtualnym, jeśli chcesz użyć tej opcjonalnej funkcji. Skrypty łączą się z publicznymi źródłami i zmieniają pliki pamięci/indeksu. Sprawdź diff, liczbę wyników, daty i trafność przed commitem. Nie oznaczaj kart jako merytorycznie sprawdzonych wyłącznie dlatego, że udało się pobrać stronę.

## Hosting

Frontendem do publikacji jest **`otula/dist`**, a nie cały katalog repozytorium. Zawiera także PDF i film. Nie udostępniaj `.env`, źródeł prywatnych narzędzi ani dokumentacji wewnętrznej przez przypadkowy serwer całego repozytorium.

Backend wymaga środowiska obsługującego moduł `fetch(Request, env)` lub odpowiedniego adaptera. Opublikuj wygenerowany worker jako osobną usługę HTTPS i ustaw sekret w hostingu. Dopasuj dokładną listę dozwolonych originów w `worker/assistant.mjs` oraz URL `/ask` w `otula/dist/family.js` do własnych domen. Obecne domeny odnoszą się do demonstracji Sites.

Nie publikuj `scripts/dev.mjs` jako serwera produkcyjnego. Przed produkcją potrzebne są trwałe limity zapytań, monitoring bez treści pytań, limity kosztów, polityki dostawców, nagłówki bezpieczeństwa, obsługa błędów i zatwierdzenie treści. [Lista braków](PLAN-ROZWOJU.md).

Samo sklonowanie lub push do GitHuba **nie zmienia** opublikowanej aplikacji Sites. Nie skonfigurowano automatycznego wdrożenia z tego repozytorium. Dane rodzin na różnych domenach są odrębne.

## Materiały jury

Gotowy PDF i film są w `otula/dist`. Edytowalny HTML oraz generator znajdują się w `otula/materialy`. Generator korzysta z lokalnych zrzutów i fontów:

```sh
python otula/materialy/build_jury.py
```

Otwórz `otula/materialy/Otula-slajdy-i-notatki.html`, wybierz drukowanie do PDF. Układ ma 10 stron 16:9, bez marginesów; notatki nie są drukowane. Wyłącz nagłówki/stopki przeglądarki i włącz tła. Zapisz wynik do `otula/dist/Otula-prezentacja.pdf`, sprawdź liczbę stron, czytelność i brak przycięć. Generator nie nagrywa filmu; MP4 jest zachowanym nagraniem bieżącej wersji. Jego opis i przebieg są w `Otula-demo.html`.

## Kontrola wydania i powrót do poprzedniej wersji

1. Uruchom testy, build serwera i sprawdź zmienione pliki.
2. Sprawdź telefon: onboarding, wybór dziecka, kalendarz, kalkulator, Karta wsparcia, raport i AI.
3. Wdróż środowisko testowe, sprawdź CORS i sekret bez ujawniania wartości.
4. Zapisz SHA commita wdrożenia. Aktualizuj frontend i serwer zgodnie z ich kompatybilnością.
5. Przy regresji wdroż poprzednie sprawdzone artefakty. Nie usuwaj danych przeglądarki użytkowników jako sposobu naprawy migracji.

Zmiany schematu danych i identyfikatorów spraw wymagają migracji oraz testu starego zapisu. Przy zmianach prawnych potrzebna jest data obowiązywania reguły, nie tylko data wdrożenia.
