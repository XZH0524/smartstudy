(function () {
  'use strict';
  const LEVELS = ['L1', 'L2', 'L3'];
  const BATCH_SIZE = 3;
  const integer = (value, limit) => Number.isInteger(value) && Math.abs(value) <= limit;
  const constant = spec => spec.form === 'grouped' ? spec.a * spec.b : spec.b;
  const solution = spec => (spec.d - constant(spec)) / (spec.a - spec.c);

  function normalizeSpec(value, level) {
    if (!value || !LEVELS.includes(level)) return null;
    const { a, b, c, d, form, distractors } = value;
    if (!integer(a, 12) || a === 0 || !integer(b, 96) || !integer(c, 12) || a === c || !integer(d, 96)) return null;
    if (form !== 'plain' && form !== 'grouped') return null;
    if (form === 'grouped' && (level !== 'L3' || Math.abs(a) < 2 || !integer(b, 8) || b === 0)) return null;
    if (level === 'L1' && (c !== 0 || !(a === 1 && b !== 0 || a >= 2 && b === 0))) return null;
    if (level === 'L2' && (c !== 0 || Math.abs(a) < 2 || b === 0)) return null;
    if (level === 'L3' && (c === 0 || (b === 0 && d === 0))) return null;

    const spec = { level, a, b, c, d, form, distractors };
    const answer = solution(spec);
    if (!integer(answer, 30) || !Array.isArray(distractors) || distractors.length !== 3
      || new Set(distractors).size !== 3 || distractors.some(value => !integer(value, 48) || value === answer)) return null;
    return { ...spec, distractors: [...distractors] };
  }

  function signature(spec) {
    return [`${spec.a}_${constant(spec)}`, `${spec.c}_${spec.d}`].sort().join('_');
  }

  function validateBatch(items, level, previous = []) {
    if (!Array.isArray(items) || items.length !== BATCH_SIZE) return null;
    const equations = new Set(previous.map(signature));
    const answers = new Set();
    const specs = [];
    for (const item of items) {
      const spec = normalizeSpec(item, level);
      if (!spec || equations.has(signature(spec)) || answers.has(solution(spec))) return null;
      equations.add(signature(spec));
      answers.add(solution(spec));
      specs.push(spec);
    }
    return specs;
  }

  function signed(value) {
    return value < 0 ? `− ${-value}` : `+ ${value}`;
  }

  function linear(coefficient, offset = 0) {
    if (coefficient === 0) return String(offset);
    const variable = coefficient === 1 ? 'x' : coefficient === -1 ? '−x' : `${coefficient}x`;
    return offset ? `${variable} ${signed(offset)}` : variable;
  }

  function makeQuestion(spec) {
    const key = signature(spec);
    const answer = solution(spec);
    const left = spec.form === 'grouped' ? `${spec.a}(x ${signed(spec.b)})` : linear(spec.a, spec.b);
    const equation = `${left} = ${linear(spec.c, spec.d)}`;
    const coefficient = spec.a - spec.c;
    const numerator = spec.d - constant(spec);
    const reduced = `${linear(coefficient)} = ${numerator}`;
    const choices = [...spec.distractors];
    // Keep the option order stable when a saved question is loaded again.
    const slot = (Math.abs(spec.a * 31 + spec.b * 17 + spec.c * 7 + spec.d) % 4);
    choices.splice(slot, 0, answer);
    return {
      id: `ma-ai-${key}`, ai: true, subject: 'math', topic: 'algebra', level: spec.level,
      skill: 'calculation', curriculumRefs: [],
      prompt: { zh: `求方程中 x 的值。\n${equation}`, en: `Find the value of x.\n${equation}` },
      hint: { zh: '先把含 x 的项放在等式一边，把常数放在另一边。', en: 'Collect the terms with x on one side and the constants on the other.' },
      options: choices.map(value => ({ zh: String(value), en: String(value) })),
      answer: slot,
      explanation: {
        zh: `整理得到 ${reduced}。两边同时除以 ${coefficient}，得 x = ${answer}。`,
        en: `Rearrange to get ${reduced}. Divide both sides by ${coefficient} to get x = ${answer}.`
      }
    };
  }

  globalThis.EachVeyaAi = { LEVELS, BATCH_SIZE, normalizeSpec, signature, validateBatch, makeQuestion };
})();
