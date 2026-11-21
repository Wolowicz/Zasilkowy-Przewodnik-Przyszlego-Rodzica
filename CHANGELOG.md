# Historia zmian

## 2026-11-21 — sytuacje rodziny, sprawy urzędowe i pisma do podpisu

- Ekran „Co się u Was dzieje?” dobiera kafelki do roli. Wyszukiwanie obejmuje synonimy i bibliotekę spraw. Druga powiązana sytuacja uzupełnia ten sam wywiad.
- Wywiad zapisuje oddzielnie podstawy rodziców, części rodzicielskiego, okresy pracy i pobyty dzieci w szpitalu. Wynik pokazuje kwotę lub braki, powody możliwej przeszkody, odpowiedzialnych za dokumenty oraz ręczny status.
- Pismo z ZUS ma osobną ścieżkę, odliczanie do wpisanego terminu i plik kalendarza z przypomnieniem. Po stracie można przerwać pytania, przygotować prośbę do kadr i otworzyć informacje o wsparciu.
- Dodano pięć pism do pracodawcy, w tym wniosek o rodzicielski z łączeniem z pracą i pismo po stracie. Dotychczasowe ZAM i ZAS-53 nadal powstają lokalnie. Słowniczek otwiera się przy pytaniu, także jako dolny panel na telefonie.
- Potwierdzone odpowiedzi z wywiadu przechodzą do własnego wariantu kalkulatora. Zakres dat i limit części podlegają sprawdzeniu w panelu parametrów. Zapis odpowiedzi jest dobrowolny i współdzieli dotychczasowy profil.
- Sprawdzono syntetyczne scenariusze reguł, generowanie PDF, migrację zapisu i przypomnienia. Instrukcja, mapa briefu a–j i ograniczenia walidacji są w dokumentacji projektu.

## 2026-11-21 — od pytań rodzica do wniosku

- Start otwiera jeden wywiad. Rodzic może odpowiedzieć „Nie wiem jeszcze”, obejrzeć częściowy wynik i wrócić do konkretnej odpowiedzi. Zmiana sytuacji usuwa odpowiedzi, które przestały jej dotyczyć.
- Wynik pokazuje powód dopasowania, okres, możliwą kwotę lub brakujące dane oraz listę dokumentów ze wskazaniem osoby lub instytucji, która je przygotowuje.
- Urzędowe ZAM i ZAS-53 można uzupełnić i pobrać do podpisu na urządzeniu. Sprawy elektroniczne mają odnośniki do usług urzędowych. Logowanie z mObywatelem odbywa się u dostawcy tożsamości.
- W głównej ścieżce ukryto asystenta AI i podręcznik. Odpowiedzi z wywiadu są zapisywane na urządzeniu na życzenie rodzica. Pola identyfikacyjne z wniosków pozostają w pamięci formularza.

## 2026-11-21 — prostsza ścieżka rodzica i wspólne dane

- Start odpowiada „Co możesz otrzymać?” i pokazuje trzy dopasowane świadczenia; dalej prowadzi do kwoty, dokumentów i terminów. Dodatkowe materiały i przykłady przeniesiono do „Więcej możliwości”. Zachowano Kartę wsparcia.
- Centrum e-usług jest przed kalkulatorem i korzysta z tego samego profilu co edycja sytuacji. Dane nie są wpisywane ponownie. Pokaz fikcyjnych integracji jest osobnym rozwinięciem; linki do rzeczywistego eZUS i formularzy są widoczne bez uruchamiania pokazu.
- Własne szkice kalkulatora zapisują się na urządzeniu osobno dla dzieci; gotowe przykłady nie zmieniają własnych danych. Wariant wcześniejszego porodu ma jawnie hipotetyczną datę, masę, tydzień ciąży i pobyty, a wynik pokazuje kwoty za okresy oraz dokumenty, adresata i termin wniosku.
- Dopasowany ekran świadczeń odróżnia rodzaje wsparcia i udostępnia warunki w rozwinięciach. Zachowano rozróżnienie urlopu i zasiłku oraz pracodawcy jako adresata urlopu i podmiotu wypłacającego pieniądze.
- Testy: 106 autorskich przypadków kalkulatora oraz regresje wspólnego profilu, zapisu, izolacji przykładów i hipotetycznych dat. Przegląd funkcjonalny: odświeżenie, zmiana dziecka, przejście z sytuacji do wyliczenia wcześniactwa. Nie jest to walidacja kwot na zestawach ZUS.
- Dokument decyzji: `docs/SCIEZKA-RODZICA-I-ZUS.md`. Ekrany tej zmiany i pomiary szerokości: `otula/materialy/zrzuty-rodzic/`.
- Opublikowano wersję Sites 24 pod dotychczasowym adresem. Na żywo potwierdzono nowy Start, kolejność menu i Centrum e-usług z zachowaniem istniejącego profilu. 36 widoków kontrolnych (12 tras × 320/390/1440 px) nie wykazało przewijania poziomego; konsola testowa bez błędów.

## 2026-11-21 — publikacja wersji konkursowej

- Opublikowano aktualny `otula/dist` na dotychczasowej stronie Sites (wersja 23), z PDF 10 slajdów i filmem 102 s. Publiczne odnośniki obu plików zwróciły HTTP 200.
- Serwer asystenta (wersja 19) korzysta z płatnego Gemini 2.5 Flash Lite; dwa sprawdzenia pytania o dokumenty do becikowego zwróciły odpowiedź AI, linki i cytaty. Ścisły schemat odpowiedzi odrzuca ucięte dane i błędne referencje; nie certyfikuje merytoryki odpowiedzi.
- `npm test`, `npm run build:assistant` i rejestr źródeł zakończone poprawnie. Zapisano rzeczywisty kadr opublikowanego Startu; 36 wcześniejszych widoków audytu pozostaje osobnym materiałem.

## 2026-11-21 — aktualne materiały dla jury

- Nowa prezentacja PDF: 10 slajdów, aktualne ekrany webowe, czytelne wycinki Karty wsparcia i codziennych czynności z telefonu, notatki prelegenta oraz jawny zakres technologii i użycia AI.
- Film 102 s w Full HD / 60 kl./s, głównie z widokami komputerowymi; rzeczywiste zrzuty, duże detale, podkład instrumentalny, plakat, napisy VTT/SRT i odtwarzacz z rozdziałami.
- Na ekranie asystenta pokazano rzeczywistą odpowiedź modelu Gemini 2.5 Flash Lite przez OpenRouter, z odnośnikiem gov.pl i rozwiniętym cytatem. Podpisy wyjaśniają potrzebę porównania odpowiedzi ze źródłem, bez gwarantowania poprawności całej wypowiedzi. Integracje urzędowe pozostają oznaczonymi symulacjami.
- Odtwarzalne źródła i wyniki kontroli: `otula/materialy/jury/README.md` oraz `QA.md`. 10 stron PDF, 6120 klatek filmu, prawidłowe dekodowanie, pomiar głośności i odtwarzacz sprawdzony przy 320, 390 i 1440 px.

## 2026-11-21 — audyt stylu 12 ekranów i dokończenie wersji konkursowej

- Spójna paleta tokenów we wszystkich arkuszach, czytelne pola i podpisy, pełne przyciski powrotu oraz kreator kalkulatora z czterema krokami i wyborem segmentowym. Krótkie wprowadzenia i pojedyncze oznaczenie symulacji.
- Audyt #start, #plan, #terminy, #kalkulator, #sprawdz-sprawe, #e-uslugi, #uprawnienia, #parametry, #formularze, #wsparcie, #poradnik i #raport na 320, 390 i 1440 px: 36 zrzutów, brak poziomego przewijania. Na najmniejszym ekranie ilustracje i długie nagłówki mają osobne wiersze.
- Dokończono przegląd zmian przejętych przez ac6dee5: B1/B2/B4/B5/B9, daty i sumy dla rodziców, parametry z walidacją i localStorage, szyfrowane opracowania 86 unikalnych spraw. Zakres walidacji i nadal nierozstrzygnięte przypadki opisano w docs/WALIDACJA-ZUS.md.
- Przygotowanie do jury: osobna notatka objaśniająca pełny brief i regulamin, kryteria oraz trudne pytania, z odróżnieniem testów autorskich od porównania kwot ZUS.
- Nowa propozycja scalenia „Mojej sytuacji” z Centrum e-usług oraz zmiana kolejności menu pozostają do kolejnego etapu zgodnie z prośbą właścicielki.

## 2026-11-21 (wieczór) — symulacje e-usług, sprawy z zestawu ZUS i czytelność

- Centrum e-usług (`#e-uslugi`) z pełnym przebiegiem symulacji: logowanie mObywatel z kodem, pobieranie danych z ZUS, zaświadczenie o zadłużeniu na dzień powstania prawa, e-ZLA, wiadomość eZUS, wnioski o urlopy i ZAM, odpis aktu urodzenia; trzy fikcyjne osoby. Zastępuje dawne „Dane pokazowe ZUS” (stary adres przekierowuje).
- „Sprawdź sprawę ZUS” (`#sprawdz-sprawe`) i rozpoznawanie PDF w teczce kalkulatora: skrót SHA-256 pliku, decyzja ZUS i porównanie okres po okresie. Dane spraw szyfrowane kluczem z oryginalnego pliku (`scripts/sprawy-zus/zaszyfruj.mjs`); test `otula/tests/sprawy.test.cjs`.
- Bez trójkątów ▶: sekcje rozwijane jako karty z przyciskiem +/–; krótsze objaśnienia, strefa upuszczania PDF zamiast surowego pola pliku, minimalne rozmiary krojów, kompaktowy przycisk asystenta na telefonie.
- Kalkulator: przykłady liczą się od razu; polski zapis „81,5%” i „½ etatu”; w menu „Sprawdź sprawę ZUS”, „Centrum e-usług”, „Świadczenia w ciąży” i „Panel parametrów”.
- Reguły: wniosek o 81,5% przed porodem jest dopuszczalny (B3), zasiłek w wysokości macierzyńskiego do dnia porodu (B7), stawki świadczenia rehabilitacyjnego 90%/75% (B8). Wyniki przeglądu i otwarte pozycje: `docs/WALIDACJA-ZUS.md`.

## 2026-11-21 — poprawki UX i przegląd materiałów ZUS

- Mobilne menu zamiast dwóch rzędów zakładek, spójne kroki powitania i proporcje ilustracji, układ komputerowy oraz podpis „Twój plan rodzicielstwa”.
- Kontekstowy panel asystenta na komputerze i pełny ekran na telefonie; anulowanie oczekiwania, przywracanie fokusu i testy referencji.
- Osobne szkice kalkulatora dla dzieci, jawne brakujące dane, potwierdzenia podstawy/ubezpieczenia/dat i aktualne odnośniki formularzy.
- Osobne wyliczenie rodzicielskiego ojca przy nieubezpieczonej matce, bez doliczania jej macierzyńskiego; 52 autorskie testy kalkulatora i niezależny przegląd reguł wariantu.
- Lokalny przegląd materiałów ogólnych oraz czterech spraw ZUS; zakres i nierozstrzygnięte obliczenia opisuje `docs/WALIDACJA-ZUS.md`. Dokumentów organizatora nie publikowano.
- PDF prezentacji i film pozostają w poprzedniej wersji: ich aktualizacja jest etapem pozostawionym do osobnego potwierdzenia właścicielki.

## 2026-11-21 — przekazanie projektu zespołowi

- Mapa wszystkich materiałów, szybki start i instrukcja skopiowania kompletnego projektu do istniejącego repozytorium kolegów.

## 2026-11-21 — nowy film produktowy

- Montaż 90 s w Full HD, animacje 60 kl./s, krótkie hasła obok prawdziwego interfejsu i osobna scena Karty wsparcia.
- Oryginalny podkład instrumentalny, plakat, VTT, rozdziały i responsywny odtwarzacz.
- Odtwarzalne źródło montażu i dwa prompty do prezentacji oraz filmu; lista rzeczywiście użytych narzędzi.
- Kontrola dekodowania, przejść, czytelności, metadanych i poziomu dźwięku.


## 2026-11-21 — prywatne repozytorium projektu

- Import aktualnego frontendu, źródeł serwera AI, testów, zasobów i licencji.
- Dokumentacja jury, scenariusz prezentacji i pytania; instrukcja rodzica, architektura, API, reguły, prywatność, uruchomienie, testy i plan rozwoju.
- Aktualny PDF (10 slajdów), film (~1:50), zrzuty i edytowalne źródło prezentacji.
- Lokalny start jednym poleceniem, własne API na loopback, przykład konfiguracji bez sekretu i testy adaptera.
- Rejestr 21 spraw, 54 tematów podręcznika i 139 odnośników. Import nie oznacza nowej walidacji całej treści.
- Zmiana linków do archiwów w dwóch lokalnych stronach materiałów na repozytorium; opublikowana wersja Sites nie została zmieniona przez ten import.

## 2026-11-21 — wersja aplikacji po briefie ZUS

Kalkulator i parametry, przykłady autorskie, e-usługi i dokumenty demonstracyjne, kalendarz z własnymi terminami i ICS, ścieżka rodzica, poprawki telefonu, prezentacja oraz nagranie. [Notatka historyczna](docs/historia/WYMAGANIA-ZUS-21-11.md).

## 2026-11-16–17 i dalsze iteracje przed pełnym briefem

Marka Otula, plan formalności, role, rodzina, Karta wsparcia, raporty, podręcznik, asystent i poprawki wyglądu. [Zmiany 17.11](docs/historia/ZMIANY-17-11.md). Historia Git tego repozytorium zaczyna się od importu; nie odtwarza każdej wcześniejszej iteracji.
