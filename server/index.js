// Otula — backend REST API (Node.js + Express).
// Uruchomienie: `npm start` (po `npm run build`) albo `npm run dev` (Vite w trybie middleware).
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculate, DEFAULT_RULES, answer } from '../shared/engine.js';
import { CASES, findCase } from '../shared/cases.js';
import { analyzeText } from '../shared/audit.js';
import { demoPerson, partnerOf, demoDebtCertificate, demoEzla } from './demo-data.js';
import { askAssistant, llmEnabled } from './llm.js';

// Minimalny loader .env (bez dodatkowych zależności).
try {
  for (const line of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const RULES_FILE = path.join(DATA_DIR, 'rules.json');
const PORT = Number(process.env.PORT) || 5180;
const DEV = process.argv.includes('--dev');

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadRules() {
  try {
    return { ...structuredClone(DEFAULT_RULES), ...JSON.parse(fs.readFileSync(RULES_FILE, 'utf8')) };
  } catch {
    return structuredClone(DEFAULT_RULES);
  }
}
let rules = loadRules();
const audit = []; // dziennik zmian parametrów
const applications = [];
const messages = [];

const app = express();
app.use(express.json({ limit: '4mb' }));

const api = express.Router();

api.get('/health', (_req, res) => res.json({ ok: true, service: 'otula-api', rulesVersion: rules.version, llm: llmEnabled(), time: new Date().toISOString() }));

// ---- Parametry ustawowe (panel administracyjny) ----
api.get('/rules', (_req, res) => res.json({ rules, defaults: DEFAULT_RULES, audit }));
api.put('/rules', (req, res) => {
  const next = { ...rules, ...req.body, rates: { ...rules.rates, ...(req.body?.rates || {}) } };
  const bad = Object.entries(next.rates).find(([, v]) => !(Number(v) > 0 && Number(v) <= 100));
  if (bad) return res.status(400).json({ error: `Nieprawidłowa stawka: ${bad[0]}` });
  if (!Array.isArray(next.maternityWeeks) || next.maternityWeeks.length !== 5) return res.status(400).json({ error: 'maternityWeeks musi mieć 5 wartości' });
  next.version = new Date().toISOString().slice(0, 10) + '-admin';
  audit.unshift({ at: new Date().toISOString(), by: req.get('x-user') || 'admin (demo)', changes: req.body });
  rules = next;
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
  res.json({ rules, audit });
});
api.post('/rules/reset', (_req, res) => {
  rules = structuredClone(DEFAULT_RULES);
  audit.unshift({ at: new Date().toISOString(), by: 'admin (demo)', changes: 'reset do wartości ustawowych' });
  try { fs.unlinkSync(RULES_FILE); } catch {}
  res.json({ rules, audit });
});

// ---- Kalkulator ----
api.post('/calculate', (req, res) => {
  try {
    res.json(calculate(req.body?.input || req.body || {}, rules));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- Sprawy testowe ----
api.get('/cases', (_req, res) => res.json(CASES.map(({ id, tag, person, short, statusShort, tone, filename }) => ({ id, tag, person, short, statusShort, tone, filename }))));
api.get('/cases/:id', (req, res) => {
  const c = findCase(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nie ma takiej sprawy' });
  const result = calculate(c.input, rules);
  const alternative = c.alternativeInput ? calculate({ ...c.input, ...c.alternativeInput }, rules) : null;
  res.json({ ...c, result, alternative });
});

// ---- Audyt dokumentu (tekst z PDF / OCR wysyłany przez przeglądarkę) ----
api.post('/audit', (req, res) => {
  const { text = '', fileName } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'Brak tekstu dokumentu' });
  res.json(analyzeText(text, { fileName, rules }));
});

// ---- Asystent (baza wiedzy, dopasowanie reguł) ----
api.post('/ask', async (req, res) => res.json(await askAssistant(String(req.body?.question || '').slice(0, 1000))));

// ---- Symulacje e-usług (mObywatel, ZUS, PUE/eZUS, USC) ----
api.post('/demo/login', (req, res) => {
  const { method = 'mobywatel', who = 'anna' } = req.body || {};
  const user = demoPerson(who);
  res.json({ token: 'demo-' + Math.random().toString(36).slice(2, 10), method, user, partner: null, consents: req.body?.consents || [], simulated: true });
});
api.get('/demo/profile', (req, res) => res.json(demoPerson(req.query.who || 'anna')));
// Drugi rodzic udostępnia swoje dane za zgodą (symulacja powiadomienia w jego aplikacji mObywatel)
api.post('/demo/partner-consent', (req, res) => res.json({ partner: demoPerson(partnerOf(req.body?.who || 'anna')), consentAt: new Date().toISOString() }));
api.get('/demo/ezla', (req, res) => res.json(demoEzla(req.query.who || 'anna')));
api.get('/demo/debt', (req, res) => res.json(demoDebtCertificate(req.query.who || 'piotr')));
api.get('/applications', (_req, res) => res.json(applications));
api.post('/applications', (req, res) => {
  const { type = 'wniosek', recipient = 'Pracodawca', data = {} } = req.body || {};
  const item = { id: `OT/${new Date().getFullYear()}/${String(applications.length + 1).padStart(5, '0')}`, type, recipient, data, status: 'Przekazano (symulacja)', at: new Date().toISOString() };
  applications.unshift(item);
  res.status(201).json(item);
});
api.get('/pue/messages', (_req, res) => res.json(messages));
api.post('/pue/messages', (req, res) => {
  const q = String(req.body?.text || '');
  const reply = answer(q);
  const item = { id: messages.length + 1, subject: req.body?.subject || 'Zapytanie', text: q, at: new Date().toISOString(), reply: { from: 'ZUS — Centrum Obsługi (symulacja)', text: reply.answer, law: reply.law } };
  messages.unshift(item);
  res.status(201).json(item);
});

app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Nieznany endpoint' }));

if (DEV) {
  const { createServer } = await import('vite');
  const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) {
    console.error('Brak katalogu dist — uruchom najpierw: npm run build');
    process.exit(1);
  }
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`Otula działa: http://localhost:${PORT}  (API: /api/health)`));
