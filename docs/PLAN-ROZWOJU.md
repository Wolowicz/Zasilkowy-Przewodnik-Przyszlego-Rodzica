# Plan rozwoju

Lista jest planem, nie deklaracją gotowych funkcji ani terminów dostawy.

| Priorytet | Zadanie | Kryterium zakończenia |
| --- | --- | --- |
| P0 — wiarygodność | Oficjalne przypadki ZUS | Każdy przypadek ma wynik oczekiwany/otrzymany, opis różnicy i akceptację merytoryczną |
| P0 | Historia wynagrodzeń i podstawa | Jasny model danych, reguły wyjątków, testy granic i potwierdzone zaokrąglenia |
| P0 | Złożone zdarzenia rodzinne | Jawna obsługa przejęć, hospitalizacji, utraty dziecka, limitów wieku i zbiegu tytułów |
| P0 | Przegląd treści | Każda karta ma właściciela, źródło, zakres oraz aktualną datę weryfikacji |
| P1 — jakość | Ewaluacja AI | Zestaw pytań urzędowych/medycznych; ocena źródeł, tez, wyjątków i bezpiecznej odmowy |
| P1 | Dostępność i testy rodziców | Rzeczywiste sesje na telefonach, klawiatura/czytnik, naprawione bariery |
| P1 | Produkcyjny serwer | Trwałe limity, budżet, monitoring, polityka logów, nagłówki i procedura awarii |
| P1 | Wersjonowanie prawa | Reguły według daty obowiązywania, historia zatwierdzeń, raport wersji wyniku |
| P2 — integracje | Rzeczywiste e-usługi | Uzgodnione API i uprawnienia, testowe środowisko, audyt, brak symulacji podszywającej się pod dane |
| P2 | OCR | Lokalny lub świadomie wybrany serwerowy odczyt, korekta użytkownika, brak automatycznej decyzji |
| P2 | Opcjonalne konto i rodzina | Minimalne dane, odzyskanie, granularne zaproszenia, cofanie dostępu, usuwanie konta |
| P2 | Synchronizowany kalendarz | Jawna zgoda na integrację, obsługa aktualizacji/usunięć i duplikatów |
| P3 — rozwój | Refaktoryzacja frontendu | Moduły/typy, testy migracji stanu; ewentualny React bez utraty identyfikatorów i zachowania telefonu |

Wdrożenie produkcyjne powinno mieć niezależne odbiory merytoryczne, bezpieczeństwa i dostępności. Nowa funkcja nie powinna usuwać Karty wsparcia ani wymuszać konta do podstawowego planu bez świadomej decyzji produktowej.
