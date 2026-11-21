"""Render only our authored HTML to PDF and diagnostic PNGs using headless Edge.

This does not visit or automate the running Otula application. Requires the
locally available Playwright package and Edge. Screenshots are supplied by QA.
"""
from pathlib import Path
import argparse,json
from playwright.sync_api import sync_playwright
from build_deck import build,APP

def main(draft=False):
    html=build(draft)
    out=APP/'materialy/film/render/jury-review'
    out.mkdir(parents=True,exist_ok=True)
    pdf=out/'Otula-prezentacja-robocza.pdf' if draft else APP/'dist/Otula-prezentacja.pdf'
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
        page.goto(html.as_uri(),wait_until='load')
        page.evaluate('document.fonts.ready')
        page.evaluate('Promise.all(Array.from(document.images).map(i=>i.decode()))')
        assert page.locator('.slide').count()==10
        # Diagnose text escaping the page and evidence overlapping the footer.
        warnings=page.evaluate('''() => [...document.querySelectorAll('.slide')].flatMap((s,i)=>{
          const r=s.getBoundingClientRect(), floor=r.bottom-58;
          return [...s.querySelectorAll('h1,h2,h3,p,.demo-link')].filter(e=>{const b=e.getBoundingClientRect();return b.bottom>floor||b.right>r.right-30||b.left<r.left+25}).map(e=>({slide:i+1,text:e.textContent.slice(0,130),bounds:e.getBoundingClientRect().toJSON()}));
        })''')
        (out/'layout-warnings.json').write_text(json.dumps(warnings,ensure_ascii=False,indent=2),encoding='utf-8')
        for i in range(10):page.locator('.slide').nth(i).screenshot(path=str(out/f'slide-{i+1:02}.png'))
        page.pdf(path=str(pdf),print_background=True,prefer_css_page_size=True)
        browser.close()
    if warnings:raise SystemExit('Layout requires review: '+str(out/'layout-warnings.json'))
    print(pdf)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true')
    main(parser.parse_args().draft)
