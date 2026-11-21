# Pytania jury

**Co odróżnia Otulę od katalogu linków?** Karta sprawy prowadzi od wyjaśnienia do dokumentów, terminu i działania. Ścieżka i profile dzieci porządkują zadania. Karta wsparcia pomaga poprosić bliską osobę o konkretną pomoc. Źródła umożliwiają kontrolę treści.

**Dlaczego bez logowania?** Plan można uruchomić od razu bez przekazywania profilu serwerowi. Kosztem jest brak synchronizacji i odzyskiwania po usunięciu pamięci przeglądarki. Konta to plan rozwoju.

**Czy AI oblicza zasiłek?** Nie. Wynik oblicza kod `zus.js`. AI odpowiada na ogólne pytania i dobiera źródła. Reguły można testować niezależnie od modelu.

**Czy źródła gwarantują poprawność AI?** Ograniczamy domeny, numerujemy fragmenty i sprawdzamy referencje. To nie dowodzi, że cała odpowiedź logicznie wynika z cytatu. Potrzebne są testy jakości i ocena merytoryczna; nie gwarantujemy bezbłędności.

**Czy imię dziecka trafia do modelu?** Profil nie jest dołączany. Do serwera trafia pytanie i identyfikator kontekstu, a do modelu pytanie i dobrane treści. Użytkownik może jednak sam wpisać dane; blokady wzorców nie wykrywają wszystkich danych osobowych.

**Czy jest oficjalna integracja ZUS?** Nie. E-usługi korzystają z fikcyjnych danych. Udział w zadaniu konkursowym nie oznacza zatwierdzenia produktu przez ZUS.

**Największa luka?** Brak walidacji na oficjalnych zestawach, automatycznego ustalania podstawy i pełnego modelu sytuacji szczególnych. Interfejs ujawnia ograniczenia zamiast podawać nieuzasadniony wynik.

**Dlaczego bez React/Next.js?** Zachowano działający, lekki frontend bez procesu budowania. Brief dopuszcza różne technologie. Późniejsza migracja powinna zachować identyfikatory spraw, dane i testowane reguły.

**Jak aktualizować przepisy?** Wersjonować katalog i reguły, sprawdzać źródła, dodawać testy i zatwierdzenie merytoryczne. Panel parametrów jest tylko demonstracją sesyjną; produkcja wymaga historii reguł według dat obowiązywania.

**Czy alarm działa po zamknięciu Otuli?** Po imporcie ICS odpowiada za niego kalendarz urządzenia i jego ustawienia. Nie ma własnego push ani synchronizacji.

**Czy testowano z rodzicami?** Nie ma udokumentowanego badania użytkowników. Wykonano testy kodu i scenariusze przeglądarkowe. Plan badania opisano w dokumencie produktu.

**Co powstało wcześniej i jak użyto AI?** Prototyp rozwijano od 16–17 listopada. Zakres zmian, narzędzia i licencje opisuje dokument autorstwa. Nie przypisujemy całego kodu wyłącznie pracy podczas wydarzenia.
