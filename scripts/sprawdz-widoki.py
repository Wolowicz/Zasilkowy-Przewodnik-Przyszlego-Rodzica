"""Ręczny test wydania. Uruchom python scripts/sprawdz-widoki.py z Playwright i Edge."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import mimetypes

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'otula' / 'dist'
SHOTS = ROOT / 'otula' / 'materialy' / 'zrzuty-final'
ORIGIN = 'https://otula.test'


def local_static(route):
    resource = unquote(urlsplit(route.request.url).path).strip('/') or 'index.html'
    file = (DIST / resource).resolve()
    if DIST not in file.parents or not file.is_file():
        route.fulfill(status=404, body='')
        return
    route.fulfill(path=file, content_type=mimetypes.guess_type(str(file))[0] or 'application/octet-stream')


def verify(browser, width):
    page = browser.new_page(viewport={'width': width, 'height': 850})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route(ORIGIN + '/**', local_static)
    page.goto(ORIGIN)
    page.locator('h1').first.wait_for()
    page.get_by_role('button', name='Mama', exact=True).click()
    page.locator('[data-situation]').first.wait_for()
    page.screenshot(path=SHOTS / f'sytuacje-mamy-{width}.jpg', quality=84)
    for route in ['moja-sprawa', 'plan', 'terminy', 'kalkulator', 'sprawdz-sprawe',
                  'e-uslugi', 'uprawnienia', 'parametry', 'formularze', 'wsparcie', 'raport']:
        page.goto(ORIGIN + '/#' + route)
        page.wait_for_function('document.querySelector("main h1, #main h1")')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(150)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, route)
        if route in ['parametry', 'kalkulator']:
            page.screenshot(path=SHOTS / f'parametry-{width}-{route}.jpg', quality=80)
    # A synthetic consenting interview. Its receipt date, name and amounts are not from case files.
    page.goto(ORIGIN + '/#moja-sprawa')
    page.evaluate("""() => localStorage.setItem('otula-plan-v1', JSON.stringify({
        wywiad:{version:2,consent:true,answers:{situation:'birth',role:'mother',event:'birth',
        eventDate:'2026-10-04',count:1,work:'employee',insurance:'yes',otherInsurance:'no',
        baseKnown:'yes',benefitBase:6978,previousParental:'no',parentalWeeks:8,
        otherPlannedWeeks:0,plan:'standard'}}}))""")
    page.goto(ORIGIN + '/#e-uslugi')
    page.reload()
    link = page.locator('[data-eu=wlasny]')
    assert link.get_attribute('href') == '#kalkulator/wywiad'
    link.click()
    page.wait_for_selector('#zus-calculator')
    assert page.input_value('[name=eventDate]') == '2026-10-04'
    assert page.input_value('[name=baseA]') == '6978'
    assert page.input_value('[name=shareA]') == '8'
    assert not errors, (width, errors)
    page.close()


if __name__ == '__main__':
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='msedge', headless=True)
        for width in (320, 390, 1440):
            verify(browser, width)
        browser.close()
    print('Trasy, szerokości i przejście z wywiadu do kalkulatora OK.')
