import './ai-questions.js';

const AI = globalThis.EachVeyaAi;
const MODEL_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-flash';
const DAILY_LIMIT = 20;
const MONTHLY_LIMIT = 600;
const MAX_BODY = 768;
const EQUATION_KEY = /^-?\d{1,3}_-?\d{1,3}_-?\d{1,3}_-?\d{1,3}$/;
const instructions = [
  'Design six varied linear-equation exercises for a secondary-school student. Return only a JSON object with a questions array.',
  'Example JSON shape: {"questions":[{"x":4,"a":3,"b":-2,"c":1,"variant":0}]}. Supply six such objects, each with a different solution x.',
  'Pick x from -8 to 8. Pick a from 2 to 6 or -6 to -2, a nonzero b from -4 to 4, and a nonzero c from -3 to 3 different from a. Pick variant 0 or 1. Mix signs and variants.',
  'For L1, variant 0 practices addition or subtraction and 1 multiplication. L2 uses ax+b. L3 has variables on both sides, with parentheses when variant=1.',
  'The application calculates the right-hand constant, answer choices and explanations. The avoid list contains previously used equation signatures.'
].join('\n');

function reply(body, status, origin = '') {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (status === 204) {
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return new Response(null, { status, headers });
  }
  return Response.json(body, { status, headers });
}

async function readInput(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let text = '';
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY) return null;
      text += decoder.decode(value, { stream: true });
    }
    const input = JSON.parse(text + decoder.decode());
    if (!input || !AI.LEVELS.includes(input.level) || !Array.isArray(input.avoid)
      || input.avoid.length > 8 || input.avoid.some(key => typeof key !== 'string' || !EQUATION_KEY.test(key))) return null;
    return { level: input.level, avoid: [...new Set(input.avoid)] };
  } catch (_) {
    return null;
  } finally {
    await reader.cancel().catch(() => {});
  }
}

function buildQuestionSpecs(candidates, level, avoid) {
  if (!Array.isArray(candidates)) return null;
  const usedEquations = new Set(avoid);
  const usedSolutions = new Set();
  const specs = [];
  for (const candidate of candidates.slice(0, 8)) {
    if (!candidate || typeof candidate !== 'object') continue;
    const { x, a: factor, b: offset, c: other, variant = 0 } = candidate;
    if (!Number.isInteger(x) || Math.abs(x) > 30 || usedSolutions.has(x) || (variant !== 0 && variant !== 1)) continue;
    const simple = level === 'L1';
    if ((!simple || variant === 1) && (!Number.isInteger(factor) || Math.abs(factor) < 2 || Math.abs(factor) > 12)) continue;
    const a = simple ? (variant === 0 ? 1 : Math.abs(factor)) : factor;
    const b = simple && variant === 1 ? 0 : offset;
    const c = level === 'L3' ? other : 0;
    if (!Number.isInteger(b) || !Number.isInteger(c) || a === c || (level === 'L3' && !c)) continue;
    const form = level === 'L3' && variant === 1 ? 'grouped' : 'plain';
    const constant = form === 'grouped' ? a * b : b;
    const d = (a - c) * x + constant;
    // Common mistakes include moving a constant with the wrong sign and omitting the final division.
    const wrong = [(d + constant) / (a - c), d - constant, -x, x + b, x - b, x + 1, x - 1, x + 2];
    const distractors = [...new Set(wrong.filter(n => Number.isInteger(n) && Math.abs(n) <= 48 && n !== x))].slice(0, 3);
    const spec = AI.normalizeSpec({ a, b, c, d, form, distractors }, level);
    if (!spec || usedEquations.has(AI.signature(spec))) continue;
    specs.push(spec);
    usedEquations.add(AI.signature(spec));
    usedSolutions.add(x);
    if (specs.length === AI.BATCH_SIZE) return AI.validateBatch(specs, level);
  }
  return null;
}

async function generate(apiKey, { level, avoid }, modelFetch, origin) {
  const response = await modelFetch(MODEL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
    // Workers supports manual redirects. Reject non-2xx below without forwarding the key.
    redirect: 'manual',
    signal: AbortSignal.timeout(18000),
    body: JSON.stringify({
      model: MODEL,
      thinking: { type: 'disabled' },
      temperature: 0.55,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: `Level ${level}. Avoid keys ${JSON.stringify(avoid)}. Variation seed ${crypto.randomUUID().slice(0, 8)}.` }
      ]
    })
  });
  // Keep provider bodies private. The status lets the operator distinguish billing, access and service errors.
  if (!response.ok) return reply({ error: 'provider_unavailable', providerStatus: response.status }, 503, origin);
  const result = await response.json();
  const item = result.choices?.[0];
  if (item?.finish_reason !== 'stop' || typeof item.message?.content !== 'string') return reply({ error: 'verification', reason: 'incomplete' }, 422, origin);
  const content = item.message.content.trim();
  const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i.exec(content);
  let data;
  try { data = JSON.parse(fenced ? fenced[1] : content); }
  catch (_) { return reply({ error: 'verification', reason: 'json' }, 422, origin); }
  const specs = buildQuestionSpecs(Array.isArray(data) ? data : data?.questions, level, avoid);
  if (!specs) return reply({ error: 'verification', reason: 'parameters' }, 422, origin);
  return reply({ questions: specs }, 200, origin);
}

export async function handleRequest(request, env, modelFetch = fetch) {
  const path = new URL(request.url).pathname;
  const ready = Boolean(env.DEEPSEEK_API_KEY && env.QUOTA && env.ALLOWED_ORIGIN);
  if (path === '/health' && request.method === 'GET') return reply({ ready }, ready ? 200 : 503);
  if (path !== '/api/generate') return reply({ error: 'not_found' }, 404);

  const origin = request.headers.get('Origin');
  if (!origin || origin !== env.ALLOWED_ORIGIN) return reply({ error: 'origin' }, 403);
  if (request.method === 'OPTIONS') return reply(null, 204, origin);
  if (request.method !== 'POST') return reply({ error: 'method' }, 405, origin);
  if (!ready) return reply({ error: 'unavailable' }, 503, origin);
  if (request.headers.get('Content-Type')?.split(';', 1)[0].trim() !== 'application/json') return reply({ error: 'input' }, 400, origin);

  const input = await readInput(request);
  if (!input) return reply({ error: 'input' }, 400, origin);
  let reservation;
  try {
    const quota = env.QUOTA.get(env.QUOTA.idFromName('generation'));
    reservation = await quota.fetch('https://quota.internal/reserve', { method: 'POST' });
  } catch (_) {
    return reply({ error: 'quota_unavailable' }, 503, origin);
  }
  if (reservation.status === 429) return reply({ error: 'limit' }, 429, origin);
  if (!reservation.ok) return reply({ error: 'quota_unavailable' }, 503, origin);
  try {
    return await generate(env.DEEPSEEK_API_KEY, input, modelFetch, origin);
  } catch (_) {
    return reply({ error: 'provider_unavailable' }, 503, origin);
  }
}

export class GenerationQuota {
  constructor(context) {
    this.storage = context.storage;
  }

  async fetch() {
    // Count every upstream attempt, including unsuccessful or invalid responses.
    const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const accepted = await this.storage.transaction(async transaction => {
      const saved = await transaction.get('usage');
      const daily = saved?.day === day ? saved.daily : 0;
      const monthly = saved?.month === month ? saved.monthly : 0;
      if (daily >= DAILY_LIMIT || monthly >= MONTHLY_LIMIT) return false;
      await transaction.put('usage', { day, month, daily: daily + 1, monthly: monthly + 1 });
      return true;
    });
    return new Response(null, { status: accepted ? 204 : 429 });
  }
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  }
};
