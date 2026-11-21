# Zasady rozwijania Otuli

1. Przeczytaj README, architekturę i zakres kalkulatora. Zachowaj oddzielenie reguł od AI.
2. Pracuj na osobnej gałęzi. Opis zmiany powinien wyjaśniać problem użytkownika, wynik, testy i ograniczenia.
3. Nie zmieniaj stabilnych ID spraw i dzieci bez migracji. Nie publikuj danych prawdziwej rodziny w testach/zrzutach.
4. Utrzymuj routing hash, systemowe cofanie i spójny telefon od 320 px. Nie przywracaj okien `<dialog>` zamiast ekranów.
5. Karta wsparcia pozostaje uprzejma, z formami Ty/Pani/Pan i możliwością edycji. Nowa sprawa potrzebuje neutralnego `reason` i poprawnej gramatycznie frazy `ask`.
6. Nowe terminy i kwoty muszą mieć zweryfikowane źródło, warunki i datę. Dodaj test obliczeń oraz niezależny przegląd merytoryczny.
7. Po zmianie katalogu/podręcznika uruchom `npm run build:assistant` i `npm run sources`. Sprawdź diff wygenerowanych danych.
8. Uruchom `npm test`, sprawdź właściwe scenariusze telefonu i eksportów. Nie nazywaj testów autorskich oficjalnymi przypadkami ZUS.
9. Przejrzyj `git diff --cached` i nazwy plików przed push. Nie dodawaj `.env`, tokenów, `.openai`, eksportów rodzin ani prywatnej korespondencji.
10. Aktualizuj dokumentację, daty zakresu i CHANGELOG. Jeśli ekran prezentacji się zmienił, odśwież zrzut i sprawdź PDF po eksporcie.

Przy dodawaniu zależności zachowaj jej licencję i uzasadnij potrzebę. Nie dodawaj całemu projektowi licencji otwartej bez decyzji właścicielki.
