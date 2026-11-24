import assert from 'node:assert/strict';
import test from 'node:test';
import { GenerationQuota, handleRequest } from './ai-worker.mjs';

const origin = 'https://xzh0524.github.io';
const endpoint = 'https://eachveya.example/api/generate';
const candidates = [
  { x: 4, a: 3, b: 2, c: 1, variant: 0 },
  { x: 3, a: 6, b: -4, c: 2, variant: 1 },
  { x: -3, a: -2, b: 3, c: 1, variant: 0 }
];

function request(body = JSON.stringify({ level: 'L2', avoid: [] }), allowedOrigin = origin) {
  return new Request(endpoint, {
    method: 'POST', headers: { Origin: allowedOrigin, 'Content-Type': 'application/json' }, body
  });
}

function environment(status = 204) {
  const calls = { quota: 0 };
  const env = {
    ALLOWED_ORIGIN: origin,
    DEEPSEEK_API_KEY: 'test-key',
    QUOTA: {
      idFromName: name => name,
      get: () => ({
        fetch: async () => {
          calls.quota++;
          return new Response(null, { status });
        }
      })
    }
  };
  return { env, calls };
}

const modelResponse = (questions = candidates) => Response.json({
  choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ questions }) } }]
});
const noModelCall = () => assert.fail('The model must not be called');

test('CORS failure, invalid input and oversized requests do not reserve model quota', async () => {
  const { env, calls } = environment();
  const preflight = await handleRequest(new Request(endpoint, { method: 'OPTIONS', headers: { Origin: origin } }), env, noModelCall);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  const wrongOrigin = await handleRequest(request(undefined, 'https://another.example'), env, noModelCall);
  assert.equal(wrongOrigin.status, 403);
  assert.equal(wrongOrigin.headers.get('Access-Control-Allow-Origin'), null);
  for (const body of ['{', '{"level":"L5","avoid":[]}', '{"level":"L2","avoid":["x"]}', ' '.repeat(900)]) {
    assert.equal((await handleRequest(request(body), env, noModelCall)).status, 400);
  }
  assert.equal(calls.quota, 0);
});

test('one request reserves one use and returns three independently verified questions', async () => {
  const { env, calls } = environment();
  const result = await handleRequest(request(), env, async (url, options) => {
    assert.equal(url, 'https://api.deepseek.com/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.equal(options.redirect, 'manual');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'deepseek-flash');
    assert.equal(body.max_tokens, 900);
    assert.equal(body.thinking.type, 'disabled');
    assert.match(body.messages[1].content, /^Level L2\./);
    return modelResponse();
  });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  const { questions } = await result.json();
  assert.equal(questions.length, 3);
  assert.deepEqual(questions.map(q => (q.d - q.b) / (q.a - q.c)), candidates.map(q => q.x));
  assert.ok(globalThis.EachVeyaAi.validateBatch(questions, 'L2'));
  assert.equal(calls.quota, 1);
});

test('unverified, blank or previously seen model output is rejected without paid retries', async () => {
  const { env, calls } = environment();
  const responses = [
    modelResponse([{ ...candidates[0], x: 0.5 }, ...candidates.slice(1)]),
    Response.json({ choices: [{ finish_reason: 'stop', message: { content: ' ' } }] }),
    modelResponse()
  ];
  for (const response of responses) {
    const result = await handleRequest(request(JSON.stringify({ level: 'L2', avoid: ['0_14_3_2'] })), env, async () => response);
    assert.equal(result.status, 422);
  }
  assert.equal(calls.quota, 3);
});

test('one model response can supply three verified questions for every supported level despite an unusable candidate', async () => {
  for (const level of ['L1', 'L2', 'L3']) {
    const { env } = environment();
    const response = await handleRequest(request(JSON.stringify({ level, avoid: [] })), env,
      async () => modelResponse([null, candidates[0], candidates[0], ...candidates.slice(1)]));
    assert.equal(response.status, 200);
    const { questions } = await response.json();
    assert.equal(questions.length, 3);
    questions.forEach((s, i) => {
      const x = candidates[i].x;
      assert.equal(s.form === 'grouped' ? s.a * (x + s.b) : s.a * x + s.b, s.c * x + s.d);
      assert.ok(!s.distractors.includes(x));
      assert.equal(new Set(s.distractors).size, 3);
    });
    if (level === 'L3') assert.equal(questions[1].form, 'grouped');
  }
});

test('an unconfigured service or an exhausted allowance never calls the model', async () => {
  const { env, calls } = environment(429);
  assert.equal((await handleRequest(request(), env, noModelCall)).status, 429);
  assert.equal((await handleRequest(request(), { ...env, DEEPSEEK_API_KEY: '' }, noModelCall)).status, 503);
  const health = await handleRequest(new Request('https://eachveya.example/health'), env, noModelCall);
  assert.deepEqual(await health.json(), { ready: true });
  assert.equal(calls.quota, 1);
});

test('quota failures and upstream rejections are distinguishable without exposing keys or provider messages', async () => {
  const { env } = environment();
  const result = await handleRequest(request(), { ...env, DEEPSEEK_API_KEY: ' test-key\n' }, async (_, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    return new Response('private provider message', { status: 402 });
  });
  assert.equal(result.status, 503);
  assert.deepEqual(await result.json(), { error: 'provider_unavailable', providerStatus: 402 });
  const offline = await handleRequest(request(), env, async () => { throw new Error('private connection detail'); });
  assert.deepEqual(await offline.json(), { error: 'provider_unavailable' });
  let requests = 0;
  const redirected = await handleRequest(request(), env, async (_, options) => {
    requests++;
    assert.equal(options.redirect, 'manual');
    return Response.redirect('https://unrelated.example/', 302);
  });
  assert.equal(requests, 1);
  assert.deepEqual(await redirected.json(), { error: 'provider_unavailable', providerStatus: 302 });
  const quotaFailure = await handleRequest(request(), environment(500).env, noModelCall);
  assert.deepEqual(await quotaFailure.json(), { error: 'quota_unavailable' });
});

function transactionalStorage(initial) {
  let usage = initial;
  let pending = Promise.resolve();
  return {
    transaction(operation) {
      const result = pending.then(() => operation({
        get: async () => usage,
        put: async (_, value) => { usage = value; }
      }));
      pending = result.catch(() => {});
      return result;
    }
  };
}

test('concurrent requests share the same daily limit', async () => {
  const quota = new GenerationQuota({ storage: transactionalStorage() });
  const responses = await Promise.all(Array.from({ length: 30 }, () => quota.fetch()));
  assert.equal(responses.filter(response => response.status === 204).length, 20);
  assert.equal(responses.filter(response => response.status === 429).length, 10);
});

test('monthly cap applies after the daily counter resets', async () => {
  const month = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 7);
  const storage = transactionalStorage({ day: 'earlier-in-current-month', month, daily: 20, monthly: 599 });
  const quota = new GenerationQuota({ storage });
  assert.equal((await quota.fetch()).status, 204);
  assert.equal((await quota.fetch()).status, 429);
});
