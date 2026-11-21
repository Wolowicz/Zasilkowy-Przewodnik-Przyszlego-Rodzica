# Ścieżka rodzica i wymagania ZUS

Przegląd 21.11.2026. Podstawa: cały lokalny brief ZUS (16 stron, plik `d02b6603-486b-474e-837f-3ada06d12bee.pdf`), nowy wklejony fragment odpowiadający jego stronom 10–13, bieżące `app.js`, `e-uslugi.js`, `zus.js` oraz poniższe źródła urzędowe. To niezależna lista kontrolna powstająca podczas implementacji, nie potwierdzenie stanu opublikowanej wersji. Nie wykorzystuje danych osobowych z indywidualnych spraw.

## Najważniejsza decyzja

**Sytuacja → świadczenia → kwota i okres → dokumenty, odbiorca i termin.** Ten kierunek odpowiada celowi briefu (s. 11–13): rodzic ma rozumieć swoje możliwości i wykonać poprawny następny krok. Nie potrzeba kolejnych modułów. Trzeba połączyć istniejące ekrany, zachować wybrane dziecko i dane oraz nazwać granice wyniku.

| Pytanie rodzica | Odpowiedź na ekranie | Warunek dobrego przejścia |
| --- | --- | --- |
| Co dotyczy mojej rodziny? | Rola, etap, data, zatrudnienie; widoczna możliwość poprawienia | Dane podane raz; „nie wiem” pozostaje niewiadomą |
| Jakie wsparcie warto sprawdzić? | Kilka dopasowanych świadczeń z krótkim „dlaczego je pokazujemy” | „Może dotyczyć” nie staje się automatycznie „przyznano” |
| Ile i przez jaki czas? | Właściwy wariant kalkulatora, kwota brutto, okres, założenia | Przycisk nazywa konkretny zasiłek; nie obiecuje wyliczenia wszystkich świadczeń |
| Co mam teraz zrobić? | Dokument, adresat, termin, załączniki, link do urzędu | Wynik prowadzi do tej samej sprawy, bez ponownego rozpoczynania formularza |
| Jak tego dopilnować? | Moje terminy, raport, Karta wsparcia | Termin ma źródło i warunki; raport zachowuje ograniczenia wyniku |

E-usługi są opcjonalnym sposobem sprawdzenia danych i demonstracją integracji. Nie powinny blokować zrozumienia świadczeń ani wymagać pozornego urzędowego logowania. Pomoc AI objaśnia bieżący krok i źródła; nie orzeka uprawnień.

## Rozróżnienia, które muszą być widoczne

- **Urlop** to uprawnienie pracownicze do zwolnienia z pracy; **zasiłek** to wypłata. Osoba na działalności lub zleceniu może mieć prawo do zasiłku za odpowiedni okres, mimo że nie składa pracowniczego wniosku o urlop. Brief: s. 4–9.
- **Ojcowski: 14 dni** i **nieprzenoszalna część rodzicielskiego: 9 tygodni** to różne uprawnienia. Nie sumować ich pod jedną etykietą „tacierzyński”. Brak ubezpieczenia matki nie przesądza o własnym prawie ojca. Brief: s. 7–8.
- **Świadczenie rodzicielskie w gminie** i **zasiłek macierzyński za okres rodzicielskiego** mają różne warunki, organy i sposób wyliczenia. Kwota świadczenia rodzicielskiego nie jest automatyczną dopłatą do każdego zasiłku. W aplikacji podwyższenie po PIT ma osobne dane i ograniczenia.
- **Płatnik wypłaty** i **adresat wniosku urlopowego** nie są jednym polem. Pracownik występuje o urlop do pracodawcy także wtedy, gdy zasiłek wypłaca ZUS. Próg płatnika to ponad 20 zgłoszonych do ubezpieczenia chorobowego, co do zasady według stanu na 30 listopada poprzedniego roku. Nie zastępować go liczbą zatrudnionych. [Ustawa zasiłkowa, art. 61, s. 49–50](https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf), [instrukcja dokumentów ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty).

## Wcześniactwo i hospitalizacja: cztery kroki zamiast samej liczby

1. Wyjaśnij, że także dziecko urodzone w terminie może spełniać warunki. Nie obiecuj każdemu pełnych 8 lub 15 tygodni.
2. Zapytaj o ukończone tygodnie ciąży, masę i daty pobytów. Uwzględnij właściwe okna pobytu, połącz nakładające się odcinki, zaokrąglij sumę. Przy porodzie mnogim nie dodawaj pobytów różnych dzieci. [MRPiPS: pytania i odpowiedzi](https://www.gov.pl/web/rodzina/pytania-i-odpowiedzi3).
3. Pokaż konkretny następny krok: pracownik składa wniosek do pracodawcy co najmniej 21 dni przed końcem macierzyńskiego; ubezpieczony niebędący pracownikiem składa wniosek właściwemu podmiotowi przed początkiem okresu zasiłku. Potrzebne są zaświadczenie szpitala o tygodniu ciąży, masie i pobytach oraz wymagane oświadczenia. Przy wcześniej zaplanowanym rodzicielskim trzeba skorygować jego daty. [ZUS: dokumenty do okresu uzupełniającego](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty).
4. Zachowaj granice modelu: aktualny pomocnik obsługuje określoną nieprzerwaną ścieżkę; przejęcia, przerwy i granice dni wymagają potwierdzenia. Opis ograniczeń nie może znikać w raporcie. Szczegóły: [reguły](REGULY-I-ZRODLA.md).

Hospitalizacja dziecka i utrata dziecka powinny mieć osobne, spokojnie nazwane wejścia. Wspólny nagłówek łączący oba zdarzenia jest niepotrzebnie obciążający i utrudnia znalezienie właściwej ścieżki.

## Kontrola przed publikacją

Obserwacje przekazano osobom wdrażającym zmiany. Część jest poprawiana równolegle; poniższa lista służy do sprawdzenia finalnego ekranu.

- Na starcie „Oblicz moje świadczenia” zastąpić nazwą odpowiadającą zakresowi kalkulatora. Karta wcześniactwa ma otwierać ten wariant i zachować profil.
- Wynik ma rozdzielić „komu przekazuję wniosek o urlop” od „kto wypłaca”. Lista samych nazw formularzy nie wystarcza.
- Import fikcyjnego profilu e-usług nie może automatycznie oznaczać prawdziwego ubezpieczenia, podstawy i dat jako sprawdzonych przez użytkownika. Symulacja pozostaje czytelnie oznaczona także po przejściu do kalkulatora.
- Nie publikować pozornej gwarancji odpowiedzi eZUS „w 7 dni”. Informacja o terminie wypłaty również nie oznacza automatycznie terminu od kliknięcia wniosek: art. 64 odnosi go do wyjaśnienia ostatniej potrzebnej okoliczności. [Ustawa, s. 54](https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf).
- Nie przypisywać wariantu 81,5% do każdego rodzaju okresu. Interfejs wniosku musi rozróżniać ojcowski, rodzicielski i uzupełniający.
- Karta dopasowana do niepełnych danych ma wskazać, czego jeszcze brakuje. „Brak ubezpieczenia” nie może prowadzić do ogólnej odmowy wszystkich świadczeń ani praw drugiego rodzica.
- Pozostawić aktualne formularze i odwołanie do instrukcji urzędu. Brief s. 12 opisuje zmianę ZAM; bieżący przewodnik dodatkowo odnotowuje czasowe przywrócenie Z-3b dla określonej roli pełnomocnika. Nie przywracać go jako uniwersalnego wymogu.

## Jedna rozbieżność do wyjaśnienia z ZUS

Brief s. 4 łączy bezprawne rozwiązanie stosunku pracy z wypłatą równoważną macierzyńskiemu przed porodem. Trzeba odróżnić art. 30 ust. 1 (prawo po porodzie, także po bezprawnym zwolnieniu potwierdzonym prawomocnie) od ust. 3 (świadczenie przed porodem po śmierci, upadłości lub likwidacji pracodawcy, przy dodatkowych warunkach). Aktualny ust. 3 nie wymienia bezprawnego zwolnienia. W aplikacji zachować to rozróżnienie i poprosić ZUS o wyjaśnienie skrótu briefu. [Ustawa zasiłkowa, art. 30, s. 17](https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf).

## Minimalne sprawdzenie gotowej ścieżki

Przejść na telefonie: pracownica w ciąży; ubezpieczony ojciec przy nieubezpieczonej matce; działalność z nieustalonym długiem; hospitalizacja dziecka; zmiana aktywnego dziecka. W każdym scenariuszu sprawdzić zachowanie danych, brak wymuszonego fikcyjnego logowania, zrozumiały zakres kwoty i następny krok. Te scenariusze sprawdzają użyteczność; nie zastępują walidacji kwot na sprawach ZUS. Stan dowodów pozostaje opisany w [WALIDACJA-ZUS.md](WALIDACJA-ZUS.md).
