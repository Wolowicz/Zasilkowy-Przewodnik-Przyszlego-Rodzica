# Asystent AI: API, źródła i ograniczenia

Asystent jest częścią Otuli, ale jego serwer działa osobno. Kod znajduje się w `otula-asystent/worker`. Klucz OpenRouter jest sekretem środowiska serwera. **Nie ma go w repozytorium ani w przeglądarce.** Instrukcja konfiguracji: [uruchomienie](URUCHOMIENIE-I-WDROZENIE.md).

## Przebieg odpowiedzi

Na komputerze przycisk „Zapytaj Otulę” otwiera panel obok aktualnej sprawy. Na telefonie otwiera pełny ekran asystenta. Kontekst oznacza identyfikator karty, nie dane rodziny. Można przerwać oczekiwanie, poprawić pytanie i ponowić próbę po błędzie. Panel jest ukryty podczas wprowadzania rodziny i drukowania.

1. Frontend wysyła pytanie oraz opcjonalny identyfikator karty lub tematu. Nie dołącza całego profilu rodziny.
2. Serwer kontroluje origin, typ żądania, rozmiar, długość pytania, wybrane wzorce danych i limit zapytań.
3. Kontekst i dopasowanie rozróżniają formalności od tematów zdrowia/opieki. Rozpoznane objawy alarmowe mają osobną odpowiedź ogólną.
4. Wykorzystywane są karty, podręcznik, wyszukiwanie stron urzędowych oraz dobrane publikacje medyczne. Źródła są ograniczone do dozwolonych domen i sprawdzane przy przekierowaniach.
5. Serwer odczytuje fragmenty stron; przy błędach może użyć odpowiednio świeżej kopii. Pamięć tekstów ma limit wieku 72 godzin w tej ścieżce. Daty indeksu publikacji i daty kart są odrębne.
6. Do modelu trafia pytanie, kontekst kart i numerowane fragmenty. Model ma zwrócić maksymalnie cztery tezy z numerami źródła i fragmentu.
7. Serwer weryfikuje format i istnienie referencji, a interfejs pokazuje odpowiedź, cytat i link. To kontrola odwołań, nie dowód merytorycznej poprawności każdej tezy.

Treść pytania, stron i kart jest traktowana jako dane, nie instrukcje zmieniające działanie systemu. Prompt nie pozwala na indywidualne rozstrzyganie uprawnień, diagnozy ani dawkowanie leków. Ograniczenia promptu i filtrów nie zastępują testów bezpieczeństwa.

## Kontrakt

```http
POST /ask
Content-Type: application/json
Origin: <dokładny dozwolony origin Otuli>
```

```json
{"question":"Co przygotować do becikowego?","context":"becikowe"}
```

`question`: 3–480 znaków. Całe ciało: do 4096 bajtów. `context` jest opcjonalnym identyfikatorem treści, nie profilem rodziny. `mode` domyślnie wynosi `ai`; historyczny tryb `web` pozostaje dostępny w API. W interfejsie jeden przycisk asystenta uruchamia dobór źródeł.

| Tryb odpowiedzi | Znaczenie |
| --- | --- |
| `ai` | `facts` zawiera `text`, `ref`, `quote`; `sources` tytuły i URL; opcjonalne `reading` i `checked` |
| `extracts` | Fragmenty materiałów zamiast wygenerowanej odpowiedzi, z komunikatem o niedostępności modelu |
| `guide` | Komunikat i dopasowane źródła; m.in. brak klucza, brak potwierdzenia lub ścieżka alarmowa |
| `web` | Wyniki wyszukiwania i informacja o ich dostępności |
| `error` | Błąd walidacji, originu albo limitu; nie jest odpowiedzią merytoryczną |

Statusy API: 200 dla odpowiedzi i trybów zastępczych, 204 dla dozwolonego OPTIONS, 400 dla niepoprawnego pytania, 403 dla originu, 429 dla limitu. Lokalny adapter może wcześniej zwrócić 413 dla dużego żądania lub 405 dla metody. Ścieżka inna niż `/ask` w workerze zwraca prostą informację o usłudze.

## Dostawcy i modele

Konfiguracja kodu próbuje `openrouter/free`, a następnie `google/gemma-4-26b-a4b-it:free`, zależnie od rodzaju błędu. Temperatura 0, limit odpowiedzi 1400 tokenów, budżet czasu modelu do około 50 sekund. Nazwy opisują stan implementacji, nie gwarantują dostępności ani stałych warunków bezpłatnego użycia. Sprawdź dostępność, limity i warunki dostawcy przed pokazem lub wdrożeniem. Model wybrany przez automatyczny router może się zmieniać.

Błędy uprawnień/rozliczeń nie powodują ujawnienia sekretu w odpowiedzi. Niedostępność modelu uruchamia źródła lub fragmenty. Nie sprawdzono w tym imporcie odpowiedzi płatnego/produkcyjnego modelu nowym kluczem; test lokalny działa bez niego.

## Granice ochrony

Opcjonalne zmienne serwera `OPENROUTER_MODEL` i `OPENROUTER_FALLBACK_MODEL` pozwalają wybrać modele bez zmiany kodu. Brak tych zmiennych zachowuje powyższe domyślne wartości. Ta aktualizacja nie zmienia sekretu ani modelu w środowisku produkcyjnym. Testy konfiguracji i kontroli referencji są w `otula/tests/assistant.test.cjs` i uruchamia je `npm test`.

- Lista originów obejmuje domeny demonstracji. Dopuszczony jest także origin `null` dla anonimowej wersji plikowej bez cookie i Authorization. To kompromis demonstracyjny, nie uwierzytelnienie.
- Limit 8 pytań na 60 sekund działa w pamięci instancji według nagłówka IP dostarczanego przez platformę lub wspólnego klucza. Nie jest globalnym, trwałym limitem kosztów.
- Adresy źródeł wymagają HTTPS, dozwolonej domeny i kontrolowanych przekierowań; tekst strony ma limit rozmiaru. Domeny są rozszerzane źródłami z katalogu i podręcznika — zmiana treści zmienia zaufaną powierzchnię.
- Filtry pytania blokują m.in. adresy e-mail i długie numery, lecz nie wykrywają wszystkich danych osobowych.
- Aplikacja nie dodaje logowania treści pytań, ale infrastruktura i dostawcy mają własne zasady logów i retencji. Nie deklarujemy „zerowego przechowywania”.

## Utrzymanie i testy jakości

Po zmianie katalogu uruchom synchronizację, a po zmianie źródeł sprawdź trafność i daty. Testuj: zwykłe pytanie o dokument, pytanie nieobsługiwane, pytanie zdrowotne, sprzeczny kontekst, brak klucza, 429, brak sieci, niedostępny artykuł i próbę polecenia ukrytego w źródle. Oceniaj osobno trafność źródła, zgodność odpowiedzi z fragmentem, zachowanie wyjątków oraz komunikat niepewności. To plan rozszerzenia testów; nie twierdzimy, że cała macierz jest zautomatyzowana.


## Konfiguracja pokazu 21.11.2026

Za zgodą właścicielki w środowisku produkcyjnym ustawiono `OPENROUTER_MODEL` i `OPENROUTER_FALLBACK_MODEL` na `google/gemini-2.5-flash-lite`. Klucz pozostał niezmieniony w sekrecie Sites. Domyślne modele bezpłatne w kodzie nadal służą jako konfiguracja nieustawionego środowiska; nie opisują aktualnego wyboru produkcyjnego.

Zmiana nastąpiła po limicie darmowego modelu; test publiczny pytania o dokumenty do becikowego zakończył się odpowiedzią AI z odnośnikami i cytatami gov.pl. Budżet zatwierdzony na testy wynosi maksymalnie 5 zł; nie jest to limit rachunku ani całego publicznego ruchu. Limit odpowiedzi pozostaje 1400 tokenów; nie zapisujemy tutaj sekretu, danych konta ani prywatnych pytań. Cena w chwili sprawdzenia: 0,10 USD / mln tokenów wejścia i 0,40 USD / mln wyjścia, według [OpenRouter](https://openrouter.ai/google/gemini-2.5-flash-lite). Aktualną dostępność i ceny należy sprawdzić przed dłuższym użyciem.
