// Buduje otula/dist/sprawy-zus-dane.js – zaszyfrowane opisy spraw z zestawu testowego ZUS.
// Kluczem każdej sprawy jest SHA-256 jej oryginalnego PDF: bez pliku nie da się odczytać danych.
// Jawne dane (JSON) i pliki PDF zostają POZA repozytorium (materiały ZUS nie mogą być rozpowszechniane).
//
// Użycie (Node 22+):
//   node scripts/sprawy-zus/zaszyfruj.mjs "<katalog z PDF spraw>" "<plik sprawy.json>" [otula/dist/sprawy-zus-dane.js]
// sprawy.json: [{ "plik": "nazwa.pdf", "tytul": "...", "kategorie": [...], "fakty": [[k,v],...],
//                 "zus": {"decyzja": "przyznano|odmowa|czesciowo", "uzasadnienie": "...", "dni": 140, "kwotaDzienna": 123.45},
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
let pominiete = 0;
for (const c of cases) {
  let pdf;
  try { pdf = await readFile(path.join(dir, c.plik)); } catch { pominiete++; console.warn('brak pliku:', c.plik); continue; }
  const fileHex = hex(await sha(pdf));
  const lookup = hex(await sha('otula-lookup|' + fileHex)).slice(0, 32);
  const key = await crypto.subtle.importKey('raw', await sha('otula-key|' + fileHex), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const { plik, ...publiczne } = c; // nazwa pliku (zawiera nazwisko) nie trafia do aplikacji
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(publiczne)));
  items[lookup] = { iv: Buffer.from(iv).toString('base64'), ct: Buffer.from(ct).toString('base64') };
  for (const k of c.kategorie || []) kategorie[k] = (kategorie[k] || 0) + 1;
}
const body = `// Wygenerowano ${new Date().toISOString().slice(0, 10)} przez scripts/sprawy-zus/zaszyfruj.mjs.\n` +
  `// Zaszyfrowane AES-GCM; klucz = SHA-256 oryginalnego PDF sprawy. Nie zawiera jawnych danych ani dokumentów ZUS.\n` +
  `window.ZUS_SPRAWY_ENC=${JSON.stringify({ v: 1, kategorie, items })};\n`;
await writeFile(out, body, 'utf8');
console.log(`zaszyfrowano ${Object.keys(items).length} spraw, pominięto ${pominiete} → ${out}`);
