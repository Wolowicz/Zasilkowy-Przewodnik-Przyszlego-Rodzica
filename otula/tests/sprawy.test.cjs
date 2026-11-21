// Sprawy z zestawu testowego ZUS: szyfrowanie kluczem z pliku PDF (scripts/sprawy-zus/zaszyfruj.mjs)
// i odszyfrowanie tak jak w przeglądarce (otula/dist/sprawy-zus.js). Bez prawdziwych dokumentów ZUS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { webcrypto: crypto } = require('node:crypto');

const root = path.join(__dirname, '..', '..');
const enc = new TextEncoder();
const hex = b => Buffer.from(b).toString('hex');
const sha = d => crypto.subtle.digest('SHA-256', typeof d === 'string' ? enc.encode(d) : d);

async function odszyfruj(dane, plik) {
  const fileHex = hex(await sha(plik));
  const rec = dane.items[hex(await sha('otula-lookup|' + fileHex)).slice(0, 32)];
  if (!rec) return null;
  const key = await crypto.subtle.importKey('raw', await sha('otula-key|' + fileHex), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(rec.iv, 'base64') }, key, Buffer.from(rec.ct, 'base64'));
  return JSON.parse(new TextDecoder().decode(plain));
}
function wczytaj(js) { const ctx = { window: {} }; vm.runInNewContext(js, ctx); return ctx.window.ZUS_SPRAWY_ENC; }

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'otula-sprawy-'));
  const pdf = Buffer.from('%PDF-1.4 syntetyczny dokument testowy Otuli');
  fs.writeFileSync(path.join(dir, 'Jan Testowy_1_zas. mac.pdf'), pdf);
  const sprawa = { plik: 'Jan Testowy_1_zas. mac.pdf', tytul: 'Syntetyczna sprawa testowa', kategorie: ['macierzynski', 'odmowa'],
    fakty: [['Wnioskodawca', 'matka']], zus: { decyzja: 'odmowa', okresy: [{ rodzaj: 'macierzyński', stawka: 100, kwotaDzienna: 166.67 }], podstawa: 5000 } };
  fs.writeFileSync(path.join(dir, 'sprawy.json'), JSON.stringify([sprawa]));
  const out = path.join(dir, 'dane.js');
  execFileSync(process.execPath, [path.join(root, 'scripts/sprawy-zus/zaszyfruj.mjs'), dir, path.join(dir, 'sprawy.json'), out], { stdio: 'pipe' });

  const js = fs.readFileSync(out, 'utf8');
  assert.ok(!js.includes('Syntetyczna sprawa') && !js.includes('Testowy') && !js.includes('podstawa'), 'plik aplikacji nie może zawierać jawnych danych ani nazwy pliku');
  const dane = wczytaj(js);
  assert.equal(Object.keys(dane.items).length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(dane.kategorie)), { macierzynski: 1, odmowa: 1 });

  const odczyt = await odszyfruj(dane, pdf);
  assert.equal(odczyt.tytul, sprawa.tytul);
  assert.equal(odczyt.zus.decyzja, 'odmowa');
  assert.equal(odczyt.plik, undefined, 'nazwa pliku (z nazwiskiem) nie trafia do zaszyfrowanych danych');
  assert.equal(await odszyfruj(dane, Buffer.from('%PDF-1.4 inny plik')), null, 'inny plik nie odczyta sprawy');
  const zmieniony = Buffer.from(pdf); zmieniony[zmieniony.length - 1] ^= 1;
  assert.equal(await odszyfruj(dane, zmieniony), null, 'zmieniony plik nie odczyta sprawy');

  // dane w aplikacji: zawsze tylko szyfrogram
  const dist = fs.readFileSync(path.join(root, 'otula/dist/sprawy-zus-dane.js'), 'utf8');
  const wDist = wczytaj(dist);
  for (const rec of Object.values(wDist.items)) assert.ok(rec.iv && rec.ct && Object.keys(rec).length === 2);
  assert.ok(!/"tytul"|"fakty"|\.pdf/.test(dist), 'otula/dist/sprawy-zus-dane.js nie może zawierać jawnych danych');
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Sprawy ZUS: szyfrowanie kluczem z pliku, odrzucenie obcego pliku, brak jawnych danych OK (w aplikacji: ${Object.keys(wDist.items).length})`);
})().catch(e => { console.error(e); process.exit(1); });
