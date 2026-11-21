"""Build the public player only after approving the matching final MP4."""
from html import escape
from pathlib import Path
import argparse
from build_movie import SCENES
from build_deck import APP

CSS="""
@font-face{font-family:'DM Sans';src:url(assets/dm-sans.ttf);font-weight:100 900;font-display:swap}
@font-face{font-family:'DM Serif Text';src:url(assets/dm-serif-text.ttf);font-weight:400;font-display:swap}
*{box-sizing:border-box}body{margin:0;background:#fffdfb;color:#452e35;font:17px/1.55 'DM Sans',sans-serif}
main{max-width:1240px;margin:auto;padding:28px 24px 56px}header{display:flex;align-items:center;justify-content:space-between;gap:24px}header img{width:158px;height:auto}a{color:#783e51;text-underline-offset:4px}header a{font-weight:700;min-height:44px;display:flex;align-items:center}
h1{font:400 clamp(38px,6vw,64px)/1.1 'DM Serif Text',serif;letter-spacing:-.04em;margin:20px 0 16px}h2{font-size:24px;line-height:1.3}p{max-width:870px}.eyebrow{font-size:12px;font-weight:750;letter-spacing:.12em;text-transform:uppercase;color:#6f6265;margin:36px 0 12px}.intro{font-size:19px;margin-bottom:24px}
.tags{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}.tags span{background:#fbe4d7;padding:7px 14px;border-radius:999px;font-size:14px;font-weight:650}.tags span:nth-child(2){background:#f4e0e7}.tags span:nth-child(3){background:#f8ebc7}
video{display:block;width:100%;aspect-ratio:16/9;background:#f4e0e7;border-radius:24px;box-shadow:0 8px 26px #5a2e400d}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.actions a{min-height:44px;padding:11px 20px;border:1px solid #e9e1dd;border-radius:999px;text-decoration:none;font-weight:700}.actions .primary{background:#783e51;color:#fff;border-color:#783e51}.actions .primary:hover{background:#5b293c}
.chapters{display:flex;gap:10px;flex-wrap:wrap;padding:0;list-style:none}.chapters li{margin:0}.chapters button{font:650 15px/1.4 'DM Sans',sans-serif;background:#fff;color:#783e51;border:1px solid #e9e1dd;border-radius:999px;padding:11px 16px;min-height:44px;cursor:pointer}.chapters button:hover{background:#f4e0e7}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #97496c;outline-offset:3px}
.note{padding:24px 28px;background:#f8ebc7;border-radius:22px;margin-top:32px}.note h2{margin-top:0}.note p{margin-bottom:0}.credits{font-size:14px;color:#6f6265}
details{border:1px solid #e9e1dd;border-radius:20px;padding:20px 24px;margin:28px 0}summary{font-weight:700;cursor:pointer;min-height:44px;display:flex;align-items:center;gap:16px;list-style:none}summary::-webkit-details-marker{display:none}summary:after{content:'+';font-size:25px;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#f4e0e7;color:#783e51;margin-left:auto;flex-shrink:0}details[open] summary:after{content:'−'}ol{padding-left:24px}li{margin:14px 0}
@media(max-width:600px){main{padding:20px 16px 36px}header img{width:132px}header a{font-size:14px}video{border-radius:16px}.note,details{padding:18px}.intro{font-size:17px}.actions a{flex:1 1 100%;text-align:center}.eyebrow{margin-top:30px}}
"""

def build(preview=False):
    chapters=''.join(f'<li><button data-time="{s["t0"]}">{s["t0"]//60:02}:{s["t0"]%60:02} · {escape(s["title"])}</button></li>' for s in SCENES[1:-1])
    description=''.join(f'<li><strong>{escape(s["title"])}.</strong> {escape(s["sub"])} {escape(s["note"])}</li>' for s in SCENES)
    html='''<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fffdfb"><title>Otula — zobacz aplikację w działaniu</title><link rel="icon" href="assets/otula-kwiat.svg"><style>'''+CSS+'''</style></head><body><main>
<header><img src="assets/otula-logo.svg" width="158" height="57" alt="Otula"><a href="./#start">Wróć do aplikacji</a></header>
<p class="eyebrow">Rodzina ma plan. Bliscy wiedzą, jak pomóc.</p><h1>Otula na komputerze i telefonie.</h1>
<p class="intro">Zobacz działający prototyp: plan rodziny, kalkulator, dokumenty, Kartę wsparcia i asystenta przy aktualnej sprawie.</p>
<div class="tags" aria-label="Parametry filmu"><span>Full HD · 1920 × 1080</span><span>60 kl./s</span><span>1 min 42 s</span></div>
<video id="demo" controls playsinline preload="metadata" poster="Otula-demo-plakat.jpg?v=jury-final-20261121" aria-label="Film prezentujący Otulę"><source src="Otula-demo.mp4?v=jury-final-20261121" type="video/mp4"><track kind="captions" src="Otula-demo.vtt?v=jury-final-20261121" srclang="pl" label="Polskie opisy scen">Twoja przeglądarka nie odtwarza filmu. <a href="Otula-demo.mp4">Pobierz MP4</a>.</video>
<p class="credits">Film można obejrzeć bez dźwięku. Podkład instrumentalny powstał proceduralnie; nie ma lektora. Dodatkowe opisy scen można włączyć w menu napisów.</p>
<div class="actions"><a class="primary" href="Otula-demo.mp4?v=jury-final-20261121" download="Otula-demo-Full-HD.mp4">Pobierz film MP4</a><a href="Otula-prezentacja.pdf?v=jury-final-20261121">Prezentacja dla jury · PDF</a><a href="Otula-demo.srt" download>Opisy scen · SRT</a></div>
<h2>Przejdź do wybranego momentu</h2><ul class="chapters">'''+chapters+'''</ul>
<section class="note"><h2>Rzeczywisty prototyp, jawny zakres</h2><p>Obliczenia są orientacyjne i pokazują założenia. E-usługi urzędowe stanowią symulację. Przypomnienie obsługuje kalendarz po imporcie ICS. Asystent korzysta z OpenRouter i źródeł; nie wydaje decyzji urzędowej ani diagnozy.</p></section>
<details><summary>Przebieg filmu w wersji tekstowej</summary><ol>'''+description+'''</ol></details>
<p class="credits">Edycja 21 listopada 2026. Zrzuty rzeczywistej aplikacji, dane fikcyjne. Wcześniejszy prototyp od 16–17 XI; moduł ZUS rozwijany od 21 XI. Tworzenie kodu i materiałów: wsparcie Codex i Claude. Ilustracje: ImageGen. Skład i montaż: HTML/CSS, Python, Playwright/Edge i FFmpeg. Zgłoszenie konkursowe składa zespół.</p>
</main><script>
const demo=document.getElementById('demo');
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{
 const start=()=>{demo.currentTime=Number(button.dataset.time);demo.play().catch(()=>{});};
 if(demo.readyState>=1)start();else{demo.addEventListener('loadedmetadata',start,{once:true});demo.load();}
 demo.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
}));
</script></body></html>'''
    path=APP/'materialy/film/render/jury-movie/player-preview.html' if preview else APP/'dist/Otula-demo.html'
    if preview:
        html=html.replace('assets/',(APP/'dist/assets').as_uri()+'/')
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(html,encoding='utf-8')
    print(path)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true')
    build(parser.parse_args().preview)
