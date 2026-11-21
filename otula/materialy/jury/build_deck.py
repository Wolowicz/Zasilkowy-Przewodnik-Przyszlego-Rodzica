"""Build the ten-slide jury deck. Final mode requires the final screenshot set.

Draft output is isolated in the ignored film/render directory. This generator
uses the original brand artwork and real screenshots, never redrawn UI.
"""
from pathlib import Path
from base64 import b64encode
from html import escape
import argparse

HERE = Path(__file__).resolve().parent
APP = HERE.parents[1]
ASSETS = APP / 'dist/assets'
SHOTS = APP / 'materialy/zrzuty-final'
OLD = APP / 'materialy/zrzuty-21-11'
PUBLIC = 'https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/'
BRIEF = 'https://mudnibfuppwadjkynscc.supabase.co/storage/v1/object/public/task-files/057d36b5-cb92-4062-9393-983cb8a96088/files/d02b6603-486b-474e-837f-3ada06d12bee.pdf'
FALLBACK = {
    'web-start.png':'start.png', 'web-home.png':'pulpit.png',
    'web-start-detail.png':'start.png',
    'web-calculator-result-detail.png':'kalkulator.png',
    'web-documents.png':'dane-zus.png', 'web-support-detail.png':'karta.png',
    'web-documents-detail.png':'dane-zus.png',
    'web-calendar.png':'kalendarz.png', 'web-ai-panel.png':'dane-zus.png',
    'web-ai-answer-detail.png':'dane-zus.png',
    'phone-start.png':'start.png', 'phone-support.png':'karta.png',
    'phone-daily.png':'poradnik.png',
    'phone-daily-detail-crop.png':'poradnik.png',
}

def data(path):
    mime = {'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ttf':'font/ttf'}[path.suffix.lower()]
    return 'data:'+mime+';base64,'+b64encode(path.read_bytes()).decode()

def build(draft=False):
    def resolved(name):
        return next((p for p in [SHOTS/name,(SHOTS/name).with_suffix('.jpg'),(SHOTS/name).with_suffix('.jpeg')] if p.exists()),SHOTS/name)
    missing = [name for name in FALLBACK if not resolved(name).exists()]
    if missing and not draft:
        raise SystemExit('Brak końcowych ekranów: '+', '.join(missing))
    def art(name, cls='', alt=''):
        return f'<img class="{cls}" src="{data(ASSETS/name)}" alt="{escape(alt)}">'
    def shot(name, cls='web-shot', alt=''):
        path = resolved(name)
        if not path.exists(): path=OLD/FALLBACK[name]
        return f'<img class="{cls}" src="{data(path)}" alt="{escape(alt)}" data-shot="{name}">'
    slides=[]
    def add(title,body,note,cls=''):
        number=len(slides)+1
        slides.append(f'<section class="slide {cls}" aria-label="Slajd {number}">'+
            (f'<h2>{title}</h2>' if title else '')+f'<div class="content">{body}</div>'+
            f'<footer><span>{"ROBOCZY PODGLĄD UKŁADU - STARSZE EKRANY" if draft else "Otula / HackNation 2026"}</span><span>{number:02} / 10</span></footer></section>'+
            f'<aside class="notes"><h3>Slajd {number}: notatki i źródła</h3>{note}</aside>')

    add('',f'<div class="cover-copy">{art("otula-logo.svg","brand","Otula")}'
        '<p class="eyebrow">Zadanie ZUS / HackNation 2026</p>'
        '<h1>Plan dla Waszej<br>rodziny</h1>'
        '<p class="lead">Zasiłkowy Przewodnik<br>Przyszłego Rodzica</p>'
        '<p class="cover-detail">Świadczenia, formalności i pomoc bliskich<br>w jednej aplikacji webowej.</p></div>'+
        art('otula-hero.webp','cover-art','Ilustracja przyszłej mamy w pastelowych kolorach'),
        f'<p>Otula łączy wiedzę o formalnościach z planem działania i Kartą wsparcia. Pokazujemy rzeczywisty prototyp, a integracje urzędowe jawnie oznaczamy jako symulacje. Ilustracja: istniejący zasób projektu przygotowany z ImageGen.</p><p><a href="{BRIEF}">Brief ZUS</a></p>','cover')

    add('Co mam zrobić teraz?', '<div class="split"><div class="copy">'
        '<p class="lead">Rodzic potrzebuje kolejnego kroku, dopasowanego do swojej sytuacji.</p>'
        '<p>Informacja o świadczeniu musi prowadzić do dokumentu, terminu i właściwego miejsca.</p>'
        '<p class="accent">Otula zaczyna od osoby,<br>która potrzebuje pomocy.</p></div>'+
        shot('web-start-detail.png',alt='Powiększony rzeczywisty panel wyboru roli w aplikacji webowej na komputerze')+'</div>',
        '<p>Opis problemu jest hipotezą projektową, a nie wynikiem własnego badania ilościowego. Użytkownik wybiera rolę mamy, taty albo osoby wspierającej. Nie musi tworzyć konta. Wymóg aplikacji webowej i RWD pochodzi z briefu, stron 14–15.</p>')

    add('Każde dziecko ma własny plan', '<div class="wide-copy"><p>Rola, etap i zatrudnienie dopasowują sprawy. Rodzeństwo zachowuje osobne daty i postęp.</p></div>'+
        '<div class="desktop-mobile">'+shot('web-home.png',alt='Pulpit Otuli w przeglądarce komputerowej')+
        shot('phone-start.png','phone-shot','Ekran startowy Otuli na telefonie')+'</div>',
        '<p>Na komputerze aplikacja wykorzystuje szerokość ekranu i nawigację boczną. Na telefonie działa menu i osobne ekrany, bez przeładowanej dolnej nawigacji. Dane rodziny zapisuje przeglądarka. RWD nie oznacza instalowania oddzielnej aplikacji mobilnej. Nazwy i daty na zrzutach są fikcyjne.</p>','wide')

    add('Wariant zasiłku z wyjaśnieniem', '<div class="split calculator"><div class="copy">'
        '<p class="lead">Okres opieki i kwota<br>dla każdego rodzica.</p>'
        '<p>Wynik pokazuje podział, podstawę i zastosowaną stawkę.</p>'
        '<p>Jawne reguły oddzielają obliczenia od odpowiedzi AI.</p>'
        '<p class="small">Przykład autorski. Wynik orientacyjny,<br>bez decyzji urzędowej.</p></div>'+
        shot('web-calculator-result-detail.png',alt='Czytelny fragment wyniku kalkulatora z podziałem między rodziców')+'</div>',
        '<p>Przykład pochodzi z danych demonstracyjnych, nie z zestawów osób udostępnionych przez ZUS. Dokładne założenia widoczne na zrzucie są częścią wyniku. Kalkulator rozdziela tygodnie i daty obojga rodziców. Obejmuje też wybrane warianty samodzielnego rodzicielskiego ojca, przysposobienia lub pieczy oraz uzupełniającego urlopu po hospitalizacji. Miesięczne podwyższenie do minimum netto wymaga danych o podatku i innych tytułach. Parametry mają wersję i walidację. Podstawę użytkownik przepisuje z dokumentów; aplikacja nie odtwarza całej historii wynagrodzeń. Zmienne etaty, przerwy i złożona historia wykorzystania wymagają indywidualnego rozliczenia. Szczegółowy zakres i nierozstrzygnięte przypadki opisuje docs/WALIDACJA-ZUS.md. Nie utożsamiamy testów kodu z pełną zgodnością prawną.</p><p><a href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/wysokosc">ZUS: wysokość zasiłku</a></p>')

    add('Dokumenty i właściwy adresat', '<div class="wide-copy"><p>Ścieżka prowadzi od danych do wniosku i pokazuje, czy sprawa dotyczy pracodawcy, czy ZUS.</p></div>'+
        shot('web-documents-detail.png','wide-evidence','Rzeczywisty fragment symulacji wniosku ZAM, z wyborem okresu i przyciskiem przekazania pracodawcy')+
        '<p class="caption">E-usługi i przekazanie wniosku to symulacja. Otula nie łączy się z rzeczywistym kontem urzędowym.</p>',
        '<p>Pokazujemy fikcyjne dane. Symulacja obejmuje mObywatela, dane ZUS, e-ZLA, zadłużenie i obieg dokumentów w zakresie aktualnej aplikacji. Nie przedstawiamy urzędowych skanów ani danych osób. Wymaganie symulacji pochodzi z briefu ZUS, strony 13–14. Wzory formularzy trzeba sprawdzać w aktualnych instrukcjach, a nie kopiować ze starszego poradnika.</p><p><a href="https://www.zus.pl/wzory-formularzy/zasilki">ZUS: formularze</a></p>','wide')

    add('Karta wsparcia', '<div class="support-layout"><div class="support-copy">'
        '<p class="lead">Bliska osoba dostaje prośbę,<br>którą może wykonać.</p>'
        '<p>Rodzic wybiera sprawę i odbiorcę. Poprawia treść, a potem sam ją udostępnia.</p>'
        '<p class="accent">Konkretna pomoc.<br>Uprzejmie i po swojemu.</p></div>'+
        shot('web-support-detail.png','support-detail','Gotowa, uprzejma prośba z Karty wsparcia')+'</div>',
        '<p>Karta wsparcia jest autorskim elementem Otuli. Zawiera uprzejmą prośbę, słowo „proszę”, podziękowanie i formy Ty/Pani/Pan. Użytkownik kontroluje treść i udostępnienie. Nie wysyłamy wiadomości automatycznie. Potencjalny wpływ na obciążenie rodziców wymaga badania z użytkownikami.</p>','support')

    add('Terminy, które zamieniają plan w działanie', '<div class="split"><div class="copy">'
        '<p class="lead">Dokumenty można przygotować wcześniej.</p>'
        '<p>Własny termin, notatka i przypomnienie dla wybranego dziecka.</p>'
        '<p>Plan można zabrać ze sobą w raporcie PDF lub Word.</p>'
        '<p class="small">Alarm obsługuje zewnętrzny kalendarz<br>po imporcie pliku ICS.</p></div>'+
        shot('web-calendar.png',alt='Moje terminy i widok kalendarza na komputerze')+'</div>',
        '<p>Otula eksportuje wydarzenie ICS z ustawieniem przypomnienia. Alarm uruchamia kalendarz użytkownika po imporcie. Nie obiecujemy powiadomień w tle ani synchronizacji późniejszych zmian. Terminy urzędowe i własny plan przygotowań są różnymi typami informacji. Raport powstaje z lokalnie zapisanych danych rodziny.</p>')

    add('Asystent przy aktualnej sprawie', '<div class="split"><div class="copy">'
        '<p class="lead">Rodzic pyta.<br>Otula odpowiada<br>i pokazuje źródło.</p>'
        '<p>Odnośnik i rozwinięty cytat pomagają porównać odpowiedź z oryginałem.</p>'
        '<p>Kwoty świadczeń liczy odrębny moduł reguł.</p>'
        '<p class="small">AI może się mylić. Sam cytat nie gwarantuje poprawności całej odpowiedzi.</p></div>'+
        shot('web-ai-answer-detail.png',alt='Rzeczywista odpowiedź AI o dokumentach do becikowego, z odnośnikiem gov.pl i rozwiniętym cytatem')+'</div>',
        '<p>Na zrzucie jest rzeczywista odpowiedź otrzymana w opublikowanej aplikacji po uruchomieniu modelu Gemini 2.5 Flash Lite przez OpenRouter. Asystent działa przez osobny serwer. Do OpenRouter trafia pytanie i dobrany kontekst źródeł, a nie pełny lokalny profil rodziny. Pytania należy wpisywać bez danych osobowych. Na komputerze panel zachowuje kontekst sprawy, a telefon otwiera osobny ekran. Model nie ustala urzędowego uprawnienia i nie stawia diagnozy. Odnośnik oraz cytat umożliwiają sprawdzenie źródła, nie są gwarancją poprawnego znaczenia całej odpowiedzi. Przy niedostępności modelu aplikacja może pokazać osobno oznaczony tryb źródeł; nie jest on przedstawiany jako odpowiedź AI.</p>')

    add('Technologia z jawnym zakresem', '<div class="technology"><div>'
        '<h3>Warstwa aplikacji</h3><p>HTML, CSS i JavaScript<br>Responsywny interfejs webowy<br>Dane rodziny na urządzeniu</p>'
        '<h3>Reguły i dokumenty</h3><p>Oddzielny kalkulator<br>Wersjonowane parametry<br>Eksport PDF, Word i ICS</p></div><div>'
        '<h3>Asystent</h3><p>API na serwerze<br>OpenRouter i źródła<br>Klucz poza frontendem</p>'
        '<h3>Gotowość</h3><p>Testy automatyczne i przegląd spraw ZUS<br>Integracje urzędowe jako symulacja<br>Dalsza walidacja złożonych sytuacji</p></div></div>',
        '<p>React/Next.js są w briefie preferowane, a wybór technologii jest dowolny. Aktualny frontend używa klasycznych skryptów JavaScript, backend standardowych Web APIs. Model językowy nie jest silnikiem obliczeń. Nie deklarujemy pełnej zgodności prawnej, certyfikacji dostępności ani produkcyjnej integracji ZUS. Dokładne wyniki testów i ograniczenia znajdują się w docs/TESTY.md oraz docs/WALIDACJA-ZUS.md. Bezpieczne wdrożenie wymaga dalszego przeglądu, utrzymania reguł i integracji instytucjonalnych.</p>','tech')

    add('Otula zostaje z rodziną', '<div class="closing"><div>'
        '<p class="lead">Formalności i codzienna opieka<br>w jednej aplikacji.</p>'
        f'<a class="demo-link" href="{PUBLIC}">Otwórz działające demo</a>'
        '<p>Najbliższy krok: dalsza walidacja przypadków i testy z rodzicami.</p>'
        '<div class="credits"><h3>Udział AI i historia</h3><p>Codex i Claude: wsparcie tworzenia projektu<br>ImageGen: ilustracje<br>OpenRouter: asystent w aplikacji</p>'
        '<p>Prototyp od 16–17 XI.<br>Moduł ZUS rozwijany od 21 XI.</p></div></div>'+
        '<figure class="closing-evidence"><figcaption>Codzienne czynności na telefonie<br>Głód i sytość dziecka</figcaption>'+
        shot('phone-daily-detail-crop.png','daily-detail','Rzeczywisty wycinek instrukcji rozpoznawania sygnałów głodu z telefonu')+'</figure></div>',
        f'<p>Wcześniejsze zasoby obejmowały markę, plan, Kartę wsparcia, raport i podręcznik. Nie przypisujemy całej pracy okresowi konkursowemu. Narzędzia przygotowania materiałów: HTML/CSS, Python, Playwright/Edge i FFmpeg. Fonty DM Sans i DM Serif Text na licencji SIL OFL. Ilustracje to istniejące zasoby projektu, a zrzuty pokazują działający interfejs. Zgłoszenie oraz oświadczenia autorstwa składa zespół.</p><p><a href="{PUBLIC}">Demo Otuli</a></p>','closing-slide')

    fonts=''.join(f"@font-face{{font-family:'{family}';src:url({data(ASSETS/file)});font-weight:{weight}}}" for family,file,weight in [('DM Sans','dm-sans.ttf','100 900'),('DM Serif Text','dm-serif-text.ttf','400')])
    css=(HERE/'deck.css').read_text(encoding='utf-8')
    html='<!doctype html><html lang="pl"><meta charset="utf-8"><title>Otula - prezentacja dla jury</title><style>'+fonts+css+'</style><body><div class="toolbar">10 slajdów. Notatki i źródła pozostają poza wydrukiem. <button onclick="window.print()">Drukuj PDF</button></div>'+''.join(slides)+'</body></html>'
    target=APP/'materialy/film/render/jury-draft.html' if draft else APP/'materialy/Otula-slajdy-i-notatki.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(html,encoding='utf-8')
    print(target)
    return target

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true')
    build(parser.parse_args().draft)
