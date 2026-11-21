> Archiwalna notatka zespołu. Opisuje stan w chwili przygotowania; bieżący zakres i repozytorium opisuje README.

# Otula po publikacji zadania ZUS

Stan pracy i weryfikacji 21 listopada 2026 r.

## Oficjalne materiały

Zadanie nosi nazwę „Zasiłkowy Przewodnik Przyszłego Rodzica”. Materiały zgłoszeniowe obejmują opis, maksymalnie 10 slajdów, nagranie do 3 minut, źródła, zrzuty oraz działające demo. Weryfikacja ma objąć przypadki z dokumentacji ZUS. Integracje publiczne są pokazowe. Technologie są dowolne, z preferencją dla React/Next.js na froncie. [Pełny brief, s. 12–16](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf)

| Obszar oceny | Waga | Dowód w Otuli |
| --- | --- | --- |
| Dopasowanie do zadania | 25% | Kalkulator, skierowanie dokumentów do płatnika, informacje o ubezpieczeniu. |
| Pomysł | 20% | Jedna ścieżka od sytuacji rodziny do kwot, dokumentów i wsparcia. |
| Autorski wkład | 15% | Karta wsparcia tworzy konkretną, uprzejmą prośbę. |
| Pełność i UX | 25% | Mobilne formularze, profile dzieci, działające przykłady i jawne ograniczenia. |
| Możliwość rozwoju | 15% | Oddzielne reguły zasiłków, panel parametrów, lokalne dane i serwer asystenta. |

Wagi pochodzą z s. 16 briefu. Kolumna dowodów opisuje implementację zespołu, a jej ocena należy do jury. [Źródło](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf)

## Zakres działającej wersji

- Spójne powitanie, wybór roli, rozwijane formularze dzieci i lista zatrudnienia. Dodawanie kolejnego dziecka przenosi fokus do jego karty. Dane i dotychczasowy postęp są zachowywane.
- Mobilna strona główna z przełącznikiem dziecka, kolejną sprawą, kalendarzem, podręcznikiem i wejściem do kalkulatora.
- Kalkulator w `#kalkulator` korzysta z niezależnych reguł w `dist/zus.js`. Przyjmuje gotową podstawę każdego rodzica, liczbę dzieci z jednego zdarzenia, rodzaj opieki, ubezpieczenie, podział rodzicielskiego, Za życiem i stały wymiar pracy do 1/2 etatu.
- Przykłady autorskie pokazują dwoje ubezpieczonych rodziców, pracę na pół etatu i brak ubezpieczenia. Ich etykiety odróżniają je od przypadków, które ZUS udostępnił uczestnikom.
- `#konto-demo` pokazuje fikcyjną tożsamość, ubezpieczenie, saldo i e-ZLA, wiadomość do pokazowej skrzynki oraz przygotowanie przykładowego dokumentu.
- PDF wybrany w kalkulatorze otwiera się lokalnie. Użytkownik przepisuje potwierdzone dane. Plik nie jest wysyłany ani automatycznie interpretowany.
- `#parametry` pozwala testować zmianę stawek i podstawowych limitów. Obowiązują w pamięci tej sesji i są oznaczane w wyniku.
- `#uprawnienia` zawiera opis chorobowego, rehabilitacyjnego, utraty zatrudnienia, sytuacji szczególnych i pomocy organizacji społecznych.
- Karta wsparcia udostępnia wyłącznie treść prośby. Działa ścieżka bez konta, własny raport PDF/Word i kalendarz.

## Ograniczenia istotne dla jury

Brakuje dostępu do zestawów spraw, zestawienia okresów i wyciągu przepisów wymienionych w opisie zadania. Nie potwierdzono wyniku na żadnym oficjalnym zestawie. Użytkowniczka została poproszona o link lub lokalną ścieżkę do tych materiałów. Publiczny poradnik ZUS został odnaleziony. [Poradnik 2026](https://bip.zus.pl/documents/10182/167567/1184_26%2BPoradnik%2Bdla%2Brodzic%C3%B3w.pdf/9378de60-151e-9b9f-ba65-abdf41d9f5b4)

Automatyczne ustalanie podstawy z historii wynagrodzeń i OCR dokumentów są otwarte. Kalkulator przyjmuje podstawę już ustaloną przez płatnika. Nie rozstrzyga samodzielnie przejęcia macierzyńskiego, hospitalizacji, utraty dziecka, wygasających limitów wieku, zbiegu ubezpieczeń ani indywidualnego zadłużenia. Przy takich danych wyświetla potrzebę sprawdzenia zamiast kwoty. Dla adopcji i pieczy obsługuje standardową ścieżkę, wymagając dat i pozostawiając skrócone okresy do indywidualnej analizy.

Symulacja pracy zakłada stały etat przez całą przydzieloną część rodzicielskiego, włącznie z wydłużeniem. Kolejne fragmenty urlopu z innym etatem wymagają rozszerzenia modelu. Kwoty są brutto, bez wynagrodzenia za pracę, PIT, podwyższenia do kwoty świadczenia rodzicielskiego i osobnego zasiłku ojcowskiego. Nie potwierdzono groszowej zgodności z zestawami ZUS.

Panel administracyjny i obieg dokumentów działają demonstracyjnie. Wdrożenie wymaga uprawnień, wersjonowania reguł według daty obowiązywania, audytu i zatwierdzenia merytorycznego. Źródła są utrzymywane w repozytorium Sites. Zespół powinien potwierdzić dostęp jury do repozytorium. Archiwum źródeł ułatwia przegląd i uruchomienie, ale nie zastępuje sprawdzenia uprawnień repozytorium.

## Aktualność informacji

Sprawdzono nowe reguły kalkulatora i materiały o zasiłkach w źródłach ZUS, Ministerstwa Rodziny i PIP. Dotychczasowe karty zachowują własną datę weryfikacji 17.11.2026. Pozostała pełna ponowna kontrola wszystkich świadczeń gminnych i dokumentów poza zakresem nowych ścieżek.

- Stawki i wybór wariantu wypłaty. [ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc)
- Macierzyński, przyjęcie na wychowanie i granice wieku. [ZUS](https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/prawo-do-zasilku-i-okres-przyslugiwania/za-okres-urlopu-macierzynskiego-albo-urlopu-na-warunkach-urlopu-macierzynskiego)
- Rodzicielski i łączenie z pracą. [Ministerstwo Rodziny](https://www.gov.pl/web/rodzina/urlop-rodzicielski), [PIP](https://www.pip.gov.pl/dla-pracodawcow/pytania-i-odpowiedzi/czy-pracownik-moze-laczyc-urlop-rodzicielski-z-wykonywaniem-pracy)
- Podstawa dla etatu oraz pozostałych ubezpieczonych. [Pracownicy](https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru/dla-pracownikow), [Pozostali](https://www.zus.pl/swiadczenia/zasilki/zasilek-macierzynski/podstawa-wymiaru/dla-ubezpieczonych-niebedacych-pracownikami)
- Aktualne dokumenty do zasiłku. [ZUS](https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty)
- Stan prawny. [Kodeks pracy, Dz.U. 2026 poz. 1245](https://eli.gov.pl/eli/DU/2026/1245/ogl), [Ustawa zasiłkowa, Dz.U. 2026 poz. 854](https://api.sejm.gov.pl/eli/acts/DU/2026/854/text/U/D20260854Lj.pdf), [Rozporządzenie, poz. 1316](https://eli.gov.pl/eli/DU/2026/1316/ogl)

## Wcześniejsze prace, AI i licencje

Prototyp powstawał przed konkursem, 16–17 listopada 2026 r. Obejmował markę, oprawę, podstawowe karty spraw, terminy, rodzinę, Kartę wsparcia, raport i podręcznik. W kodzie i materiałach pomagały OpenAI Codex oraz Claude. Ilustracje wygenerowano z pomocą ImageGen. DM Sans i DM Serif Text mają licencję SIL OFL. Kopie licencji bibliotek eksportu znajdują się w assets.

Wersja z 21 listopada dodaje moduł kalkulatora, dane i dokumenty pokazowe, parametry, aktualizację zasiłków, materiały konkursowe i kończy poprawki mobilnej ścieżki. Kod i materiały nadal powstają ze wsparciem AI. W samej aplikacji AI uczestniczy w odpowiedziach asystenta przez serwer i OpenRouter. Kalkulator oblicza wynik według jawnego kodu. Profil rodziny i plik PDF nie są wysyłane do asystenta.

FAQ zadania dopuszcza wcześniejsze zasoby pod warunkiem rzetelnego ujawnienia. Regulamin ZUS wymaga wskazania użytych rozwiązań zewnętrznych. Zwycięski zespół podpisuje umowę przeniesienia praw. Wzór tej umowy wskazano jako osobny załącznik, którego nie odnaleziono przy publicznej karcie. [FAQ, Zadania 11](https://hacknation.pl/faq), [Regulamin ZUS, §4](https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/a0788fbc-e6cb-42b8-9e51-7524cc46c6a8.pdf)

## Scenariusz pokazu

1. Wybierz rolę, nazwij dziecko i podaj termin w 2027 roku. Dodaj starsze rodzeństwo. Wybierz zatrudnienie.
2. Pokaż zmianę aktywnego dziecka i jego terminów na stronie głównej.
3. Otwórz kalkulator, wybierz autorski przykład dwojga rodziców i przelicz. Pokaż własne 9 tygodni drugiego rodzica.
4. Porównaj przykład pracy na pół etatu. Wyjaśnij przyjęte założenie stałego wymiaru pracy.
5. Wybierz brak ubezpieczenia i pokaż pytania do wyjaśnienia. Otwórz dane pokazowe oraz przykładowy wniosek.
6. W Karcie wsparcia skopiuj prośbę o pomoc z dokumentem. Zakończ wyjaśnieniem zakresu gotowości i brakujących testów na danych ZUS.

Zespół odpowiada za zgłoszenie projektu i udostępnienie repozytorium jurorom.

## Końcowa weryfikacja i nowy kalendarz

- 19 autorskich przypadków kalkulatora przeszło testy Node.
- Scenariusze przeglądarkowe na 320, 390 i 1440 px objęły nowy moduł ZUS, formularze pokazowe, parametry i Kartę wsparcia. Treść ze schowka odpowiada edytorowi po normalizacji końców linii Windows.
- Kalendarz i ścieżkę sprawdzono na tych samych szerokościach: tworzenie, edycja, usuwanie terminu, zapis po przeładowaniu, rozdzielenie dzieci oraz obecność własnych dat w raporcie. Sprawdzono plik ICS z alarmem i zachowanie identyfikatora przy edycji.
- Eksport ICS pomija minione i ukończone sprawy oraz poglądowe daty po porodzie. Alarmy obsługuje kalendarz po imporcie, zależnie od jego ustawień. Zmiany w Otuli nie synchronizują się z zewnętrznym kalendarzem.
- Aktualne kategorie formularzy prowadzą do oficjalnego katalogu ZUS: https://www.zus.pl/wzory-formularzy/zasilki.
- Prezentacja została dostosowana do 10 slajdów, z bieżącymi zrzutami telefonu i mapą kryteriów. Film pokazuje rzeczywiste działanie prototypu i trwa poniżej 3 minut.
- Archiwum źródeł obejmuje frontend i testy. Nie zawiera sekretów, danych rodzin ani serwera asystenta. Dostęp jury do repozytorium i backendu pozostaje do potwierdzenia.
