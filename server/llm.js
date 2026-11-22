// Asystent „Zapytaj Otulę” oparty o OpenRouter (RAG na bazie wiedzy z shared/engine.js).
// Klucz: OPENROUTER_API_KEY w .env lub w zmiennych środowiskowych. Bez klucza działa dopasowanie reguł.
import { KNOWLEDGE, retrieve, answer as ruleAnswer } from '../shared/engine.js';

const URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 25000;

export const llmEnabled = () => Boolean(process.env.OPENROUTER_API_KEY);

const SYSTEM = `Jesteś „Otulą”, asystentem informującym o zasiłkach i urlopach rodzicielskich w Polsce (ZUS).
Zasady:
- Odpowiadaj po polsku, prostym językiem, zwięźle (maks. 6 zdań).
- Opieraj się WYŁĄCZNIE na dostarczonych fragmentach przepisów. Jeśli ich brakuje, powiedz, że nie masz pewnej odpowiedzi, i odeślij do infolinii ZUS 22 560 16 00.
- Nie zmyślaj kwot ani terminów. Nie zastępujesz decyzji ZUS.
- Na końcu nie dopisuj podstawy prawnej — dodaje ją aplikacja.`;

export async function askAssistant(question) {
  const fallback = { ...ruleAnswer(question), source: 'rules' };
  if (!llmEnabled()) return fallback;

  // Gdy nic nie pasuje, dajemy modelowi całą bazę — jest krótka.
  const hits = retrieve(question, 3).map((h) => h.item);
  const context = (hits.length ? hits : KNOWLEDGE).map((k, i) => `[${i + 1}] ${k.a} (${k.law})`).join('\n');

  try {
    const res = await fetch(URL, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5180',
        'X-Title': 'Otula',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Fragmenty przepisów:\n${context}\n\nPytanie: ${question}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const text = (await res.json()).choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('pusta odpowiedź');
    return {
      answer: text,
      law: hits.length ? [...new Set(hits.map((h) => h.law))].join('; ') : null,
      confidence: hits.length ? 1 : 0.4,
      source: 'llm',
    };
  } catch (e) {
    console.warn('[llm] błąd, używam reguł:', e.message);
    return fallback;
  }
}
