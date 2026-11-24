(function () {
  'use strict';
  const LEVELS = ['L1', 'L2', 'L3'];
  const BATCH_SIZE = 3;
  const FORMATS = ['fill', 'calculation', 'choice'];
  const ROUND_FORMATS = ['mixed', ...FORMATS];
  const integer = (value, limit) => Number.isInteger(value) && Math.abs(value) <= limit;
  const constant = spec => spec.form === 'grouped' ? spec.a * spec.b : spec.b;
  const solution = spec => (spec.d - constant(spec)) / (spec.a - spec.c);
  const pair = (zh, en) => ({ zh, en });

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

  function questionId(spec) {
    const prefix = spec.source === 'template' ? 'ma-sample' : 'ma-ai';
    const format = ['fill', 'calculation'].includes(spec.format) ? '-' + spec.format : '';
    return `${prefix}-${signature(spec)}${format}`;
  }

  // Compare values as fractions of integers to avoid rounding near a correct answer.
  function parseNumber(value) {
    if (typeof value !== 'string' || value.length > 40) return null;
    const input = value.replace(/[０-９＋－．／]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
      .replaceAll('−', '-').trim();
    const fraction = /^([+-]?\d{1,16})\s*\/\s*([+-]?\d{1,16})$/.exec(input);
    if (fraction) {
      const denominator = BigInt(fraction[2]);
      return denominator === 0n ? null : { text: fraction[1] + '/' + fraction[2], numerator: BigInt(fraction[1]), denominator };
    }
    const decimal = /^([+-]?)(?:(\d{1,16})(?:\.(\d{0,16}))?|\.(\d{1,16}))$/.exec(input);
    if (!decimal) return null;
    const [, sign, whole, places, shortPlaces] = decimal;
    const rest = places ?? shortPlaces ?? '';
    const digits = (whole || '0') + rest;
    return { text: input, numerator: BigInt(digits) * (sign === '-' ? -1n : 1n), denominator: 10n ** BigInt(rest.length) };
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
    const fields = [{ label: pair('x = □', 'x = □'), expected: answer }];
    const fill = spec.format === 'fill';
    const calculation = spec.format === 'calculation';
    if (calculation) fields.unshift({ label: pair(`${linear(coefficient)} = □`, `${linear(coefficient)} = □`), expected: numerator });
    let prompt = pair(`求方程中 x 的值。\n${equation}`, `Find the value of x.\n${equation}`);
    if (fill) prompt = pair(`填出 x 的值。\n${equation}`, `Fill in the value of x.\n${equation}`);
    if (calculation) prompt = pair(`有括号时先展开。把 x 项移到左边、常数移到右边，再填写右端的常数和 x 的值。\n${equation}`,
      `Expand any brackets, then collect the x terms on the left and the constants on the right. Enter the resulting constant and the value of x.\n${equation}`);
    const sample = spec.source === 'template';
    return {
      id: questionId(spec), ai: !sample, ...(sample ? { sample: true } : {}), subject: 'math', topic: 'algebra', level: spec.level,
      skill: 'calculation', curriculumRefs: [],
      prompt,
      hint: { zh: '先把含 x 的项放在等式一边，把常数放在另一边。', en: 'Collect the terms with x on one side and the constants on the other.' },
      options: choices.map(value => ({ zh: String(value), en: String(value) })),
      answer: slot,
      ...(fill || calculation ? { format: spec.format, fields } : {}),
      explanation: {
        zh: `整理得到 ${reduced}。两边同时除以 ${coefficient}，得 x = ${answer}。`,
        en: `Rearrange to get ${reduced}. Divide both sides by ${coefficient} to get x = ${answer}.`
      }
    };
  }

  function sampleBatch(level) {
    if (!LEVELS.includes(level)) return null;
    // Original equations for a free preview of the same input and grading flow.
    const examples = {
      L1: [[1, 6, 0, 15], [4, 0, 0, -28], [1, -8, 0, -6]],
      L2: [[4, 7, 0, 31], [-3, 4, 0, 13], [5, -8, 0, 12]],
      L3: [[4, 3, 1, 18], [3, -2, -2, 9, 'grouped'], [-2, 6, 1, 0, 'grouped']]
    };
    const items = examples[level].map(([a, b, c, d, form = 'plain']) => {
      const spec = { a, b, c, d, form };
      const x = solution(spec);
      return { ...spec, distractors: [x - 1, x + 1, x + 2] };
    });
    return validateBatch(items, level);
  }

  globalThis.EachVeyaAi = { LEVELS, BATCH_SIZE, FORMATS, ROUND_FORMATS, normalizeSpec, parseNumber, signature, questionId, solution, validateBatch, makeQuestion, sampleBatch };
})();
