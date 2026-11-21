# Dane i bezpieczeństwo

Opis dotyczy wersji 21.11.2026. Jest technicznym opisem prototypu, nie deklaracją audytu, certyfikacji ani kompletnej zgodności RODO.

## Gdzie trafiają dane

| Dane | Miejsce i działanie |
| --- | --- |
| Rola, praca, dzieci, imiona, daty, postęp, wydarzenia i notatki | `localStorage` danej domeny/przeglądarki |
| Historia ekranów | `sessionStorage` |
| PDF otwarty w kalkulatorze | Lokalny podgląd; aplikacja nie wysyła go do AI ani ZUS |
| Pytanie do AI i ID kontekstu | Własny serwer asystenta; pytanie i dobrane teksty dalej do OpenRouter/modelu |
| Źródła i wyszukiwanie | Zewnętrzne strony/API; dostawcy otrzymują ruch związany z zapytaniem |
| Raport PDF/Word i ICS | Pobrany plik na urządzeniu; dalszy import/udostępnienie zależą od użytkownika |
| Karta wsparcia | Tekst kopiowany/udostępniany ręcznie, bez automatycznego wysłania profilu |
| Wizyty na stronie | Hosting i infrastruktura mogą przetwarzać metadane połączenia |

Lokalny zapis nie jest szyfrowanym sejfem. Osoba z dostępem do profilu przeglądarki może odczytać dane. Imię dziecka jest opcjonalne. Usunięcie profilu usuwa dane aplikacji w tej przeglądarce; nie usuwa eksportów, treści wysłanych przez użytkownika ani logów dostawców. Nie ma kopii serwerowej rodziny i odzyskiwania po usunięciu pamięci.

## Sekrety

Sekret OpenRouter ma być wyłącznie w zmiennej serwera `OPENROUTER_API_KEY`. `.env.local` i metadane hostingu nie są śledzone. Przed commitem sprawdzaj zawartość zmian, nie tylko `.gitignore`. Klucz już dodany do historii trzeba unieważnić u dostawcy; samo usunięcie z najnowszego pliku nie wystarcza. Repozytorium prywatne także nie jest miejscem na klucze.

## Obecne mechanizmy

Walidacja i ograniczanie tekstu, kontrola originów, HTTPS i allowlista źródeł, ograniczenie przekierowań/rozmiaru odczytu, brak klucza w kliencie, komunikaty awaryjne, jawne źródła i lokalne dane rodziny. Asystent ogranicza długość pytania oraz blokuje wybrane wzorce numerów i e-maili. To częściowa ochrona, nie pełna anonimizacja.

Limit zapytań jest w pamięci pojedynczej instancji. CORS nie jest uwierzytelnieniem i nie blokuje dowolnych klientów HTTP. Origin `null` dla wydania plikowego rozszerza powierzchnię dostępu. Przed produkcją należy ocenić, czy nadal jest potrzebny.

## Główne ryzyka i dalsze zabezpieczenia

| Ryzyko | Obecna granica | Potrzebne przed produkcją |
| --- | --- | --- |
| Nieaktualna treść | Daty i źródła, ręczna aktualizacja | Właściciel treści, przeglądy i zatwierdzanie zmian |
| Błąd modelu | Referencje i fallback | Zestaw ewaluacyjny, przegląd tez i scenariusze niepewności |
| Ujawnienie danych w pytaniu | Ostrzeżenie i wzorce | Analiza minimalizacji danych i retencji dostawców |
| Nadużycie publicznego API | Limit instancji | Trwały limit, limity budżetu, monitoring i alerty |
| Utrata profilu | Lokalny zapis | Opcjonalny backup/migracja z jasną zgodą |
| XSS i zależności | Escaping w kodzie, lokalne biblioteki | Audyt, CSP dopasowane do aplikacji i kontrola aktualizacji |
| Integracja z urzędem | Tylko symulacja | Umowy, uprawnienia, audyt, uwierzytelnienie i kontrola dostępu |

Nie ma obecnie logowania, kont współdzielonych ani ról administracyjnych w backendzie. Panel parametrów jest widokiem demonstracyjnym. Produkcyjne uprawnienia i historia zmian wymagają osobnej implementacji. [Procedura zgłoszenia problemu](../SECURITY.md).
