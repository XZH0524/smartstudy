/* Shared authoring helpers for the five free question banks. */
(function () {
  'use strict';
  const data = globalThis.SmartStudyData;
  const science = globalThis.EachVeyaScience;
  const pair = value => {
    if (typeof value !== 'string') throw new Error('Missing bilingual question text');
    const [zh, en = zh, extra] = value.split('|');
    if (!zh.trim() || !en.trim() || extra !== undefined) throw new Error('Invalid bilingual question text');
    return data.bilingual(zh, en);
  };
  const format = value => String(Number(value.toFixed(6)));
  const exact = (left, right) => Math.abs(left - right) < 0.00000051;
  const evidence = new Map();

  function add({ id, subject, topic, level, stem, choices, why, hint, skill = 'application', correct = 0, ...metadata }) {
    const options = choices.map(pair);
    const answerText = options[correct];
    const permutation = [0, 1, 2, 3];
    let seed = 2166136261;
    for (const character of id) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
    for (let i = 3; i > 0; i--) {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    if (!answerText || options.length !== 4 || ['zh', 'en'].some(lang => new Set(options.map(option => option[lang])).size !== 4)) {
      throw new Error('Invalid options for ' + id);
    }
    const item = { id, subject, topic, level, prompt: pair(stem), options: permutation.map(index => options[index]),
      answer: permutation.indexOf(correct), explanation: pair(why),
      ...(hint ? { hint: pair(hint) } : {}), ...(subject === 'english' ? { track: 'cefr' } : { skill, curriculumRefs: [] }),
      ...metadata };
    data.questions.push(item);
    return item;
  }

  const topicGuide = (subject, id, domain, label, source, question, notice, principle, example) => {
    if (Object.hasOwn(science.topics, id)) throw new Error('Duplicate topic ' + id);
    const target = pair(label);
    science.topics[id] = { id, topic: id, subject, domain: id, domainLabel: pair(domain), target, label: target,
      source, prerequisites: [], level: 'L1', question: pair(question), notice: pair(notice), principle: pair(principle), example: pair(example) };
    data.topics[id] = target;
    data.topicsBySubject[subject].push(id);
  };

  function numericChoices(correct, candidates) {
    // Format before deduplicating so equivalent decimals cannot name two choices.
    const possible = [...new Set([correct, ...candidates, correct + 1, correct - 1, correct + 2, correct + 3].map(format))];
    return possible.slice(0, 4).map(Number);
  }

  function numeric(question, correct, alternates, unit, verify) {
    const values = numericChoices(correct, alternates);
    const item = add({ ...question, choices: values.map(value => format(value) + (unit ? ' ' + unit : '')) });
    if (!verify(values[0]) || values.slice(1).some(verify)) throw new Error('Numeric verification failed for ' + item.id);
    evidence.set(item.id, { values, unit, verify });
    return item;
  }

  const signs = ['增大|Increases', '减小|Decreases', '保持不变|Stays the same', '根据给定模型无法比较|Cannot be compared under the stated model'];
  const basicUnits = [['s', 'time'], ['J', 'energy'], ['mol', 'amount'], ['Hz', 'frequency'], ['Pa', 'pressure'],
    ['m', 'length'], ['A', 'current'], ['V', 'voltage'], ['Ω', 'resistance'], ['g', 'mass']];
  const lengthUnits = new Set(['cm', 'mm', 'km', 'µm']);
  function unitChoices(unit) {
    const dimension = lengthUnits.has(unit) ? 'length' : basicUnits.find(([label]) => label === unit)?.[1];
    const other = basicUnits.filter(([, kind]) => kind !== dimension).map(([label]) => label);
    const offset = [...unit].reduce((sum, char) => sum + char.codePointAt(0), 0) % other.length;
    return [unit || '无物理单位|No physical unit', ...Array.from({ length: 3 }, (_, i) => other[(i + offset) % other.length])];
  }
  science.focusQuestions = [];

  function scienceModel(subject, topic, id, config) {
    const { terms, units, rule, formula, records, concept, limits } = config;
    const prompts = terms.map(pair);
    const ruleText = pair(rule);
    const topicInfo = science.topics[topic];
    const source = topicInfo.source;
    const [a0, a1, a2, a3] = records;
    const unit = units[2];
    const show = (value, measure) => format(value) + (measure ? ' ' + measure : '');
    const row = (record, lang) => record.map((value, i) => prompts[i][lang] + ' ' + show(value, units[i])).join(lang === 'zh' ? '，' : ', ');
    const bilingual = (zh, en) => zh + '|' + en;
    const recordsText = (a, b) => bilingual(
      `模型甲：${row(a, 'zh')}。模型乙：${row(b, 'zh')}。`,
      `Model A: ${row(a, 'en')}. Model B: ${row(b, 'en')}.`);
    const internal = (level, suffix, role = 'practice') => ({
      id: `b400-${subject}-${topic}-${id}-${level}-${suffix}`, subject, topic, level, role, source, domain: topicInfo.domain,
      focus: [topic], errorKinds: {}, errors: {}, safety: 'virtual-data', focusOnly: role !== 'practice'
    });
    function register(question, item) {
      if (question.role !== 'practice') science.focusQuestions.push(item);
      return item;
    }
    function conceptual(question, [stem, choices, why], skill = 'reasoning') {
      return register(question, add({ ...question, stem, choices, why, skill }));
    }
    function computed(question, record, alternate = false) {
      const result = formula(...record);
      const wrong = alternate ? [record[0], record[1], record[0] + record[1]] : [record[0] * record[1], record[0] + record[1], record[0] - record[1]];
      const stem = bilingual(
        `根据数学模型，${row(record, 'zh')}。求${prompts[2].zh}。`,
        `In the stated model, ${row(record, 'en')}. Find the ${prompts[2].en}.`);
      const why = bilingual(`${ruleText.zh} 代入得到 ${show(result, unit)}。`, `${ruleText.en} Substitution gives ${show(result, unit)}.`);
      return register(question, numeric({ ...question, stem, why, hint: rule, skill: 'calculation' }, result, wrong, unit,
        value => exact(value, formula(...record))));
    }
    function direction(question, first, next) {
      const [zh, en] = recordsText(first, next).split('|');
      const difference = formula(...next) - formula(...first);
      const correct = exact(difference, 0) ? 2 : difference > 0 ? 0 : 1;
      return register(question, add({ ...question, correct, choices: signs, hint: rule,
        stem: bilingual(`${zh} 从甲到乙，${prompts[2].zh}如何变化？`, `${en} How does ${prompts[2].en} change from A to B?`),
        why: bilingual(`${ruleText.zh} 甲为 ${show(formula(...first), unit)}，乙为 ${show(formula(...next), unit)}。`,
          `${ruleText.en} A gives ${show(formula(...first), unit)}, and B gives ${show(formula(...next), unit)}.`) }));
    }
    function difference(question, first, next) {
      const [zh, en] = recordsText(first, next).split('|');
      const firstValue = formula(...first);
      const nextValue = formula(...next);
      const result = nextValue - firstValue;
      return register(question, numeric({ ...question, hint: rule, skill: 'calculation',
        stem: bilingual(`${zh} 对${prompts[2].zh}，乙减去甲是多少？`, `${en} For ${prompts[2].en}, calculate B minus A.`),
        why: bilingual(`${ruleText.zh} ${format(nextValue)} − (${format(firstValue)}) = ${show(result, unit)}。`,
          `${ruleText.en} ${format(nextValue)} − (${format(firstValue)}) = ${show(result, unit)}.`) },
      result, [firstValue - nextValue, Math.abs(firstValue + nextValue), nextValue], unit, value => exact(value + firstValue, nextValue)));
    }
    function inverse(question, [first, second]) {
      const target = formula(first, second);
      const [unitA, unitB] = units;
      const step = Number.isInteger(first) ? 1 : 0.1;
      const adjusted = [first + step, first + 2 * step, first + 3 * step];
      return register(question, numeric({ ...question, skill: 'calculation', hint: rule,
        stem: bilingual(`在所给模型中，${prompts[1].zh}为 ${show(second, unitB)}，${prompts[2].zh}为 ${show(target, unit)}。求${prompts[0].zh}。`,
          `In the model, ${prompts[1].en} is ${show(second, unitB)} and ${prompts[2].en} is ${show(target, unit)}. Find ${prompts[0].en}.`),
        why: bilingual(`${ruleText.zh} 将 ${show(first, unitA)} 代回可得到 ${show(target, unit)}。`,
          `${ruleText.en} Substituting ${show(first, unitA)} gives ${show(target, unit)}.`) },
      first, adjusted, unitA, value => exact(formula(value, second), target)));
    }
    function testPrediction(question, first, next) {
      const [zh, en] = recordsText(first, next).split('|');
      const expected = formula(...next);
      const reference = formula(...first);
      const offset = 1;
      const reported = expected + offset;
      const compare = show(reference, unit);
      const observed = show(reference + offset, unit);
      const stem = bilingual(
        `${zh} 甲的参考值是 ${compare}，仪器显示 ${observed}。假设同一仪器的固定偏差也适用于乙，哪一个乙的原始读数校正后与模型预测相符（误差不超过 0.01 个单位）？`,
        `${en} The reference for A is ${compare}, but the instrument displays ${observed}. Assume the same fixed offset applies to B. Which raw reading for B agrees with the model after correction, to within 0.01 unit?`);
      return register(question, numeric({ ...question, stem, hint: rule, skill: 'reasoning',
        why: bilingual(`${ruleText.zh} 甲显示值比参考值高 1 个单位。乙的理论值为 ${show(expected, unit)}，加上固定偏差，仪器应显示 ${show(reported, unit)}。`,
          `${ruleText.en} A reads one unit high. The prediction for B is ${show(expected, unit)}, so including the offset gives a displayed value of ${show(reported, unit)}.`) },
      reported, [expected, expected - 1, expected + 2], unit, value => Math.abs(value - offset - expected) <= 0.01));
    }

    conceptual(internal('L1', 'concept'), concept, 'application');
    const unitOptions = unitChoices(unit);
    const symbol = pair(unitOptions[0]);
    conceptual(internal('L1', 'unit'), [
      bilingual(`选择本知识点中${prompts[2].zh}的合适单位或记法。`, `Choose the appropriate unit or notation for ${prompts[2].en} here.`),
      unitOptions, bilingual(`${prompts[2].zh}用 ${symbol.zh} 表示。`, `${prompts[2].en} is expressed using ${symbol.en}.`)
    ], 'application');
    direction(internal('L2', 'change-input'), a0, [a1[0], a0[1]]);
    direction(internal('L2', 'change-condition'), a1, [a1[0], a2[1]]);
    computed(internal('L3', 'direct'), a2);
    inverse(internal('L3', 'recover-input'), a3);
    difference(internal('L4', 'compare'), a0, a2);
    difference(internal('L4', 'reversal'), a3, a1);
    conceptual(internal('L5', 'limit'), limits);
    testPrediction(internal('L5', 'prediction'), a2, a3);

    if (!topicInfo.denominator) {
      // Separate records allow the existing spaced-review flow to test transfer.
      direction(internal('L1', 'transfer', 'transfer'), a2, a0);
      direction(internal('L2', 'transfer', 'transfer'), a3, a0);
      computed(internal('L3', 'transfer', 'transfer'), a0, true);
      difference(internal('L4', 'transfer', 'transfer'), a1, a2);
      testPrediction(internal('L5', 'transfer', 'transfer'), a0, a1);
    }
  }

  const quiz = text => {
    const [stem, correct, wrong1, wrong2, wrong3, why] = text.split('~');
    return [stem, [correct, wrong1, wrong2, wrong3], why];
  };
  const modelFor = subject => (topic, id, terms, units, rule, formula, records, concept, limits) => {
    scienceModel(subject, topic, id, { terms: terms.split('~'), units: units.split('~'), rule, formula, records,
      concept: quiz(concept), limits: quiz(limits) });
  };

  globalThis.EachVeyaBank400 = { add, numeric, exact, evidence, topicGuide, modelFor, quiz };
})();
