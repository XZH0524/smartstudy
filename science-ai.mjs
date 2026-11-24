import './questions.js';
import './science-bank.js';

const Science = globalThis.EachVeyaScience;

export function readScienceInput(input) {
  const allowed = ['subject', 'topic', 'level', 'curriculum', 'weakness', 'avoid'];
  if (!input || Object.keys(input).some(key => !allowed.includes(key))) return null;
  const { subject, topic, level, curriculum = '', weakness = '', avoid } = input;
  if (typeof topic !== 'string' || !Object.hasOwn(Science.topics, topic) || Science.topics[topic].subject !== subject
    || !['L1', 'L2', 'L3', 'L4', 'L5'].includes(level)
    || (curriculum !== '' && !Science.curriculumKeys.includes(curriculum))
    || (weakness !== '' && (typeof weakness !== 'string' || !Object.hasOwn(Science.errorLabels, weakness)))
    || !Array.isArray(avoid) || avoid.length > 8 || avoid.some(id => typeof id !== 'string'
      || !id.startsWith(`sci-${topic}-${level}-`) || !/^sci-[a-z-]+-L[1-5]-[1-8]$/.test(id))) return null;
  return { subject, topic, level, curriculum, weakness, avoid };
}

export function approvedOptions(input) {
  return Science.candidates(input).filter(Science.validate);
}

export function approvedSelection(payload, candidates) {
  const ids = payload?.questionIds;
  if (!Array.isArray(ids) || ids.length !== 3 || new Set(ids).size !== 3) return null;
  const allowed = new Set(candidates.map(question => question.id));
  return ids.every(id => allowed.has(id)) ? ids : null;
}

export async function generateScience(apiKey, input, candidates, modelFetch, endpoint, model) {
  const options = candidates.map(question => ({ id: question.id, form: question.form, addresses: [...new Set(Object.values(question.errorKinds))] }));
  const response = await modelFetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
    redirect: 'manual',
    signal: AbortSignal.timeout(18000),
    body: JSON.stringify({
      model, thinking: { type: 'disabled' }, response_format: { type: 'json_object' }, max_tokens: 220,
      messages: [
        { role: 'system', content: 'Assemble an ordered three-item practice set from the approved simulation templates. Return only {"questionIds":["id","id","id"]} with three different IDs from candidates. Prefer items addressing the requested weakness and use different forms when available. Do not write questions, answers or experiments.' },
        { role: 'user', content: JSON.stringify({ subject: input.subject, topic: input.topic, level: input.level,
          scope: input.curriculum || 'general', weakness: input.weakness || 'none', candidates: options }) }
      ]
    })
  });
  if (!response.ok) return { providerStatus: response.status };
  const message = (await response.json()).choices?.[0];
  if (message?.finish_reason !== 'stop') return null;
  try {
    const ids = approvedSelection(JSON.parse(message.message?.content), candidates);
    const targeted = options.filter(option => option.addresses.includes(input.weakness));
    return ids && (!targeted.length || targeted.some(option => ids.includes(option.id))) ? ids : null;
  }
  catch (_) { return null; }
}
