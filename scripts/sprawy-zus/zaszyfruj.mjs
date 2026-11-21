// Buduje otula/dist/sprawy-zus-dane.js – zaszyfrowane opisy spraw z zestawu testowego ZUS.
// Kluczem każdej sprawy jest SHA-256 jej oryginalnego PDF: bez pliku nie da się odczytać danych.
// Jawne dane (JSON) i pliki PDF zostają POZA repozytorium (materiały ZUS nie mogą być rozpowszechniane).
//
// Użycie (Node 22+):
//   node scripts/sprawy-zus/zaszyfruj.mjs "<katalog z PDF spraw>" "<plik sprawy.json>" [otula/dist/sprawy-zus-dane.js]
// sprawy.json: [{ "plik": "nazwa.pdf", "tytul": "...", "kategorie": [...], "fakty": [[k,v],...],
//                 "zus": {"decyzja": "przyznano|odmowa|czesciowo|nieustalona", "uzasadnienie": "..."},
//                 "kalkulator": { pola zgodne z zusInitial() }, "ryzyka": [...] }]
import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import path from 'node:path';

const [dir, jsonPath, out = 'otula/dist/sprawy-zus-dane.js'] = process.argv.slice(2);
if (!dir || !jsonPath) { console.error('Podaj katalog PDF i plik JSON.'); process.exit(1); }
const enc = new TextEncoder();
const hex = buf => Buffer.from(buf).toString('hex');
const sha = async data => crypto.subtle.digest('SHA-256', typeof data === 'string' ? enc.encode(data) : data);

const cases = JSON.parse(await readFile(jsonPath, 'utf8'));
const items = {}, kategorie = {};
const statystyki = { rozpoznawane: 0, odczytaneRozstrzygniecie: 0, nieustaloneRozstrzygniecie: 0, zweryfikowaneKwoty: 0 };
if (!Array.isArray(cases) || !cases.length) throw new Error('Katalog musi być niepustą tablicą spraw.');
for (const [index, c] of cases.entries()) {
  if (!c.plik || !['przyznano', 'odmowa', 'czesciowo', 'nieustalona'].includes(c.zus?.decyzja)) {
    throw new Error(`Nieprawidłowy plik lub status rozstrzygnięcia w rekordzie ${index + 1}.`);
  }
  if (c.zus.decyzja === 'nieustalona' && (c.zus.okresy?.length || c.kalkulator)) {
    throw new Error(`Nieustalone rozstrzygnięcie nie może zawierać przyznanych okresów ani gotowych założeń kalkulatora (rekord ${index + 1}).`);
  }
  let pdf;
  try { pdf = await readFile(path.join(dir, c.plik)); } catch { throw new Error(`Nie można odczytać PDF dla rekordu ${index + 1}; katalog nie został zapisany.`); }
  const fileHex = hex(await sha(pdf));
  const lookup = hex(await sha('otula-lookup|' + fileHex)).slice(0, 32);
  if (items[lookup]) throw new Error(`Powtórzony identyczny PDF w rekordzie ${index + 1}; wybierz jedną wersję opisu przed szyfrowaniem.`);
  const key = await crypto.subtle.importKey('raw', await sha('otula-key|' + fileHex), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const { plik, ...publiczne } = c; // nazwa pliku (zawiera nazwisko) nie trafia do aplikacji
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(publiczne)));
  items[lookup] = { iv: Buffer.from(iv).toString('base64'), ct: Buffer.from(ct).toString('base64') };
  for (const k of new Set(c.kategorie || [])) kategorie[k] = (kategorie[k] || 0) + 1;
  statystyki.rozpoznawane++;
  if (c.walidacja?.rozstrzygniecie === 'odczytane') statystyki.odczytaneRozstrzygniecie++;
  else statystyki.nieustaloneRozstrzygniecie++;
  if (c.walidacja?.kwota === 'zweryfikowana') statystyki.zweryfikowaneKwoty++;
}
const body = `// Wygenerowano ${new Date().toISOString().slice(0, 10)} przez scripts/sprawy-zus/zaszyfruj.mjs.\n` +
  `// Zaszyfrowane AES-GCM; klucz = SHA-256 oryginalnego PDF sprawy. Nie zawiera jawnych danych ani dokumentów ZUS.\n` +
  `window.ZUS_SPRAWY_ENC=${JSON.stringify({ v: 1, kategorie, statystyki, items })};\n`;
await writeFile(out, body, 'utf8');
console.log(`Zaszyfrowano ${Object.keys(items).length} unikalnych spraw → ${out}`);
