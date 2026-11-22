// Klient REST API. Gdy backend jest niedostępny (np. statyczny hosting), korzysta z tego samego
// silnika reguł lokalnie — wynik oznaczamy wtedy jako „offline”.
import { calculate, DEFAULT_RULES, answer } from '../shared/engine.js';
import { CASES, findCase } from '../shared/cases.js';
import { analyzeText } from '../shared/audit.js';

let online = true;
export const isOnline = () => online;

async function req(path, opts = {}) {
  const res = await fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (!res.ok) throw Object.assign(new Error((await res.json().catch(() => ({}))).error || res.statusText), { status: res.status });
  online = true;
  return res.json();
}
async function withFallback(fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    if (e.status && e.status < 500) throw e;
    online = false;
    return fallback();
  }
}

let localRules = structuredClone(DEFAULT_RULES);

export const api = {
  rules: () => withFallback(() => req('/rules'), () => ({ rules: localRules, defaults: DEFAULT_RULES, audit: [] })),
  saveRules: (patch) => withFallback(() => req('/rules', { method: 'PUT', body: patch }), () => { localRules = { ...localRules, ...patch, rates: { ...localRules.rates, ...(patch.rates || {}) } }; return { rules: localRules, audit: [] }; }),
  resetRules: () => withFallback(() => req('/rules/reset', { method: 'POST' }), () => { localRules = structuredClone(DEFAULT_RULES); return { rules: localRules, audit: [] }; }),
  calculate: (input) => withFallback(() => req('/calculate', { method: 'POST', body: { input } }), () => calculate(input, localRules)),
  cases: () => withFallback(() => req('/cases'), () => CASES),
  case: (id) => withFallback(() => req('/cases/' + id), () => { const c = findCase(id); return { ...c, result: calculate(c.input, localRules), alternative: c.alternativeInput ? calculate({ ...c.input, ...c.alternativeInput }, localRules) : null }; }),
  audit: (text, fileName) => withFallback(() => req('/audit', { method: 'POST', body: { text, fileName } }), () => analyzeText(text, { fileName, rules: localRules })),
  ask: (question) => withFallback(() => req('/ask', { method: 'POST', body: { question } }), () => answer(question)),
  login: (method, who, consents) => req('/demo/login', { method: 'POST', body: { method, who, consents } }),
  partnerConsent: (who) => req('/demo/partner-consent', { method: 'POST', body: { who } }),
  profile: () => req('/demo/profile'),
  ezla: (who) => req('/demo/ezla?who=' + (who || 'anna')),
  debt: (who) => req('/demo/debt?who=' + encodeURIComponent(who)),
  applications: () => req('/applications'),
  submit: (payload) => req('/applications', { method: 'POST', body: payload }),
  messages: () => req('/pue/messages'),
  sendMessage: (payload) => req('/pue/messages', { method: 'POST', body: payload }),
};
