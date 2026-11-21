"""Build a deterministic 102-second composition from real final screenshots."""
from pathlib import Path
import json,argparse
from build_deck import APP,ASSETS,SHOTS,OLD,FALLBACK,data

HERE=Path(__file__).resolve().parent
OUT=APP/'materialy/film/render/jury-movie'
SCENES=[
 {'id':'intro','t0':0,'t1':6,'layout':'cover','title':'Plan dla Waszej rodziny','sub':'Zasiłkowy Przewodnik Przyszłego Rodzica','image':'otula-hero.webp','asset':True,'note':'Działający prototyp aplikacji webowej'},
 {'id':'rola','t0':6,'t1':15,'layout':'web','title':'Mama, tata lub bliska osoba','sub':'Wybierz rolę. Zacznij bez zakładania konta.','image':'web-start.png','note':'Rzeczywisty ekran aplikacji na komputerze'},
 {'id':'rodzina','t0':15,'t1':24,'layout':'web-phone','title':'Każde dziecko ma własny plan','sub':'Etap, zatrudnienie i daty dopasowują kolejne sprawy.','image':'web-home.png','phone':'phone-start.png','note':'Jeden przewodnik na komputerze i telefonie'},
 {'id':'kalkulator','t0':24,'t1':39,'layout':'web','title':'Okresy i kwoty z wyjaśnieniem','sub':'Porównaj wariant opieki dla obojga rodziców.','image':'web-calculator-result.png','detail':'web-calculator-result-detail.png','note':'Przykład autorski. Wynik orientacyjny, z jawnymi założeniami.'},
 {'id':'dokumenty','t0':39,'t1':49,'layout':'web','title':'Dokumenty i właściwy płatnik','sub':'Przećwicz przygotowanie sprawy i pokazowy obieg wniosku.','image':'web-documents.png','detail':'web-documents-detail.png','note':'E-usługi ZUS i mObywatela to symulacja. Nic nie jest wysyłane.'},
 {'id':'wsparcie','t0':49,'t1':63,'layout':'web','title':'Bliscy wiedzą, w czym pomóc','sub':'Edytuj prośbę. Samodzielnie zdecyduj, komu ją wyślesz.','image':'web-support.png','detail':'web-support-detail.png','note':'Karta wsparcia udostępnia wyłącznie treść prośby'},
 {'id':'terminy','t0':63,'t1':73,'layout':'web','title':'Czas przygotować dokumenty','sub':'Zapisz własny termin i wybierz przypomnienie.','image':'web-calendar.png','note':'Alarm działa po imporcie ICS do zewnętrznego kalendarza'},
 {'id':'ai','t0':73,'t1':86,'layout':'web','title':'Asystent obok aktualnej sprawy','sub':'Rzeczywista odpowiedź AI, odnośnik i cytat z gov.pl.','image':'web-ai-panel.png','detail':'web-ai-answer-detail.png','note':'Porównaj odpowiedź ze źródłem. Sam cytat nie gwarantuje poprawności całej odpowiedzi.'},
 {'id':'codziennosc','t0':86,'t1':94,'layout':'phone','title':'Podręcznik także na co dzień','sub':'Karmienie, sen i codzienne czynności z podanymi źródłami.','image':'phone-daily-detail.jpg','note':'Wiedza informacyjna. Porady nie zastępują indywidualnej konsultacji.'},
 {'id':'final','t0':94,'t1':102,'layout':'final','title':'Otula','sub':'Zobacz działający prototyp','image':'wsparcie-babci.webp','asset':True,'note':'otula-dla-rodziny.etherealdaffodil4.chatgpt.site'},
]

def build(draft=False):
    OUT.mkdir(parents=True,exist_ok=True)
    def source(name,asset=False):
        if asset:return ASSETS/name
        candidates=[SHOTS/name,(SHOTS/name).with_suffix('.jpg'),(SHOTS/name).with_suffix('.jpeg')]
        for p in candidates:
            if p.exists():return p
        if draft:return OLD/FALLBACK.get(name,'kalkulator.png')
        raise FileNotFoundError('Brak końcowego zrzutu: '+name)
    for s in SCENES:
        s['src']=data(source(s['image'],s.get('asset',False)))
        if s.get('detail'):s['detailSrc']=data(source(s['detail']))
        if s.get('phone'):s['phoneSrc']=data(source(s['phone']))
    fonts=''.join(f"@font-face{{font-family:'{family}';src:url({data(ASSETS/file)});font-weight:{weight}}}" for family,file,weight in [('DM Sans','dm-sans.ttf','100 900'),('DM Serif Text','dm-serif-text.ttf','400')])
    css=(HERE/'movie.css').read_text(encoding='utf-8')
    js=(HERE/'movie.js').read_text(encoding='utf-8')
    html='<!doctype html><html lang="pl"><meta charset="utf-8"><title>Otula - film dla jury</title><style>'+fonts+css+'</style><body><div id="stage"></div><script>const SCENES='+json.dumps(SCENES,ensure_ascii=False)+';const BRAND='+json.dumps(data(ASSETS/'otula-logo.svg'))+';const DRAFT='+json.dumps(draft)+';</script><script>'+js+'</script></body></html>'
    target=OUT/('draft.html' if draft else 'movie.html');target.write_text(html,encoding='utf-8')
    timeline={'duration':102,'fps':60,'scenes':[{k:v for k,v in s.items() if k not in ['src','detailSrc','phoneSrc']} for s in SCENES],'taps':[],'typing':[]}
    (OUT/'timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2),encoding='utf-8')
    return target

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true')
    print(build(parser.parse_args().draft))
