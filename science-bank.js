(function () {
  'use strict';
  const data = globalThis.SmartStudyData;
  const bi = data.bilingual;
  const sources = {
    motion: 'https://openstax.org/books/physics/pages/2-2-speed-and-velocity',
    circuits: 'https://openstax.org/books/physics/pages/19-1-ohms-law',
    energy: 'https://openstax.org/books/physics/pages/9-3-simple-machines',
    matter: 'https://openstax.org/books/chemistry-atoms-first-2e/pages/1-4-measurements',
    solutions: 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity',
    composition: 'https://openstax.org/books/chemistry-2e/pages/3-4-other-units-for-solution-concentrations',
    cells: 'https://openstax.org/books/biology-2e/pages/4-1-studying-cells',
    inheritance: 'https://openstax.org/books/biology-2e/pages/12-1-mendels-experiments-and-the-laws-of-probability',
    ecology: 'https://openstax.org/books/biology-2e/pages/45-1-population-demography'
  };
  const fields = [
    ['physics', 'motion', '运动学', 'Motion', 'average-speed', '平均速率', 'Average speed',
      '总路程', 'total distance', '总时间', 'total time', 'm', 's', 'm/s', false, '计时移动模型', 'timed motion model'],
    ['physics', 'circuits', '电学', 'Electricity', 'ohmic-current', '欧姆定律中的电流', 'Current in an ohmic model',
      '电阻两端电压', 'voltage across the resistor', '电阻', 'resistance', 'V', 'Ω', 'A', false, '理想欧姆电阻模型', 'ideal ohmic resistor model'],
    ['physics', 'energy', '能量', 'Energy', 'energy-efficiency', '能量效率', 'Energy efficiency',
      '有用输出能量', 'useful output energy', '输入能量', 'input energy', 'J', 'J', '%', true, '能量转换虚拟模型', 'virtual energy-conversion model'],
    ['chemistry', 'matter', '物质性质', 'Properties of matter', 'mass-density', '质量与密度', 'Mass density',
      '样品质量', 'sample mass', '样品体积', 'sample volume', 'g', 'cm³', 'g/cm³', false, '均匀样品模型', 'uniform sample model'],
    ['chemistry', 'solutions', '溶液', 'Solutions', 'amount-concentration', '物质的量浓度', 'Amount concentration',
      '溶质物质的量', 'amount of solute', '溶液总体积', 'total solution volume', 'mol', 'L', 'mol/L', false, '虚拟溶液数据', 'virtual solution data'],
    ['chemistry', 'composition', '组成与定量关系', 'Composition', 'mass-percentage', '质量百分数', 'Mass percentage',
      '组分质量', 'component mass', '混合物总质量', 'total mixture mass', 'g', 'g', '%', true, '均匀混合物虚拟模型', 'virtual homogeneous mixture model'],
    ['biology', 'cells', '细胞与显微观察', 'Cells and microscopy', 'image-magnification', '图像放大倍数', 'Image magnification',
      '图像中的长度', 'length in the image', '对应实际长度', 'corresponding actual length', 'µm', 'µm', '×', false, '细胞图像模型', 'cell image model'],
    ['biology', 'inheritance', '遗传与变异', 'Inheritance', 'trait-frequency', '模拟遗传结果的频率', 'Frequency in an inheritance simulation',
      '出现目标表型的记录数', 'records with the target phenotype', '模拟记录总数', 'total simulation records', '条', '条', '%', true, '虚拟豌豆性状记录', 'virtual pea-trait records'],
    ['biology', 'ecology', '生态与种群', 'Ecology', 'population-density', '种群计数密度', 'Population count density',
      '观察到的个体数', 'individuals counted', '调查面积', 'survey area', '只', 'm²', 'individuals/m²', false, '虚拟样方调查', 'virtual quadrat survey']
  ];
  const scienceSubjects = ['physics', 'chemistry', 'biology'];
  const curriculumKeys = ['cn', 'igcse', 'gcse', 'a-level', 'ib', 'ap'];
  const scopes = Object.fromEntries(scienceSubjects.map(subject => [subject, Object.fromEntries(
    curriculumKeys.map(id => [id, { status: 'planned', objectives: [] }])
  )]));
  const topics = {};
  const questions = [];
  const errorLabels = {
    quantity: bi('辨认题目中的测量量', 'Identifying measured quantities'),
    unit: bi('辨认比值单位', 'Interpreting units'),
    denominator: bi('分母选取或相除顺序', 'Choosing the denominator or division order'),
    evidence: bi('混淆比值与原始数量', 'Confusing a ratio with a raw quantity')
  };

  const word = (pair, lang) => pair[lang];
  const localized = render => bi(render('zh'), render('en'));
  const show = (value, unit, lang) => unit === '%' || unit === '×' ? value + unit : value + ' ' + (lang === 'en' && ['条', '只'].includes(unit) ? 'observations' : unit);
  const numbers = values => values.map(value => localized(lang => show(value[0], value[1], lang)));

  function recipe(topic, level, i, role) {
    const { target, numerator, denominator, numeratorUnit: nu, denominatorUnit: de, unit, percent, context } = topic;
    const multiplier = i + 4;
    const p = (percent ? 2 : 3) + i % 3;
    const q = percent ? 10 : 1;
    const n = p * multiplier;
    const d = q * multiplier;
    const ratio = percent ? p * 10 : p;
    const caseLabel = localized(lang => lang === 'zh' ? `${context.zh}（记录 ${i + 1}）` : `${context.en} (record ${i + 1})`);
    const measurements = localized(lang => `${caseLabel[lang]} · ${numerator[lang]} ${show(n, nu, lang)} · ${denominator[lang]} ${show(d, de, lang)}`);
    const definition = bi(`${target.zh} = ${numerator.zh} ÷ ${denominator.zh}${percent ? ' × 100%' : ''}。`,
      `${target.en} = ${numerator.en} ÷ ${denominator.en}${percent ? ' × 100%' : ''}.`);
    let question, values, answer, explanation, check, form, kinds;

    if (level === 'L1') {
      if (i % 2 === 0) {
        form = 'unit';
        question = bi('这个比值应如何标注单位？', 'How should the unit of this ratio be labelled?');
        values = [bi(unit, unit), bi('kg', 'kg'), bi('min', 'min'), bi('K', 'K')];
        explanation = definition;
        kinds = [null, 'unit', 'unit', 'unit'];
      } else {
        form = 'concept';
        question = bi(`给出的 ${show(n, nu, 'zh')} 在这份记录中代表什么？`, `What does ${show(n, nu, 'en')} represent in this record?`);
        values = [numerator, denominator, target, bi('记录编号', 'record identifier')];
        explanation = bi(`题面明确把这个读数标为「${numerator.zh}」。`, `The record explicitly labels this reading as “${numerator.en}”.`);
        kinds = [null, 'quantity', 'quantity', 'quantity'];
      }
    } else if (level === 'L2') {
      if (i % 2 === 0) {
        form = 'concept';
        question = bi(`计算「${target.zh}」时，应以哪个量为分母？`, `Which quantity is the denominator when finding “${target.en}”?`);
        values = [denominator, numerator, bi('记录编号', 'record identifier'), bi('先把两个读数相加', 'the sum of both readings')];
        explanation = definition;
        kinds = [null, 'denominator', 'quantity', 'denominator'];
      } else {
        form = 'inverse';
        question = bi(`另一个模型记录保持「${denominator.zh}」不变，并把「${numerator.zh}」加倍。比值会怎样？`,
          `In a second model record, “${denominator.en}” is fixed and “${numerator.en}” doubles. What happens to the ratio?`);
        values = [bi('变为原来的两倍', 'It doubles'), bi('减为原来的一半', 'It halves'),
          bi('保持不变', 'It stays the same'), bi('变为原来的四分之一', 'It falls to one quarter')];
        explanation = bi('分母不变时，分子加倍会使比值加倍。', 'With the denominator fixed, doubling the numerator doubles the ratio.');
        kinds = [null, 'denominator', 'evidence', 'evidence'];
      }
    } else if (level === 'L3') {
      form = 'ratio';
      question = bi(`根据记录计算「${target.zh}」。`, `Find “${target.en}” from the record.`);
      const reversed = Number((d / n * (percent ? 100 : 1)).toFixed(2));
      const choices = [ratio, reversed, ratio / 2, ratio + (percent ? 5 : 1)];
      values = numbers(choices.map(value => [value, unit]));
      explanation = bi(`${definition.zh} 代入 ${n} 和 ${d}，得到 ${show(ratio, unit, 'zh')}。`,
        `${definition.en} Substitute ${n} and ${d} to get ${show(ratio, unit, 'en')}.`);
      kinds = [null, 'denominator', null, null];
      check = { type: 'ratio', n, d, scale: percent ? 100 : 1, choices };
    } else if (level === 'L4') {
      form = 'inverse';
      const add = q * (2 + i % 3);
      const adjustedD = d + add;
      const adjustedN = n + add / q * p;
      if (i % 2 === 0) {
        const choices = [adjustedN, n, adjustedN + 2 * add, adjustedN + add];
        question = bi(`第二份记录的「${denominator.zh}」为 ${show(adjustedD, de, 'zh')}，且「${target.zh}」与第一份相同。第二份的「${numerator.zh}」是多少？`,
          `In a second record, “${denominator.en}” is ${show(adjustedD, de, 'en')} and “${target.en}” is unchanged. Find “${numerator.en}” in the second record.`);
        values = numbers(choices.map(value => [value, nu]));
        explanation = bi(`先用第一份数据算原比值 ${n}/${d}，再乘新分母 ${adjustedD}，得到 ${show(adjustedN, nu, 'zh')}。`,
          `Find the first raw ratio ${n}/${d}, then multiply by the new denominator ${adjustedD}: ${show(adjustedN, nu, 'en')}.`);
        check = { type: 'scaled', n, d, adjustedD, choices };
      } else {
        const choices = [adjustedD, d, adjustedD + 2 * add, adjustedD + add];
        question = bi(`第二份记录的「${numerator.zh}」为 ${show(adjustedN, nu, 'zh')}，且「${target.zh}」与第一份相同。第二份的「${denominator.zh}」是多少？`,
          `In a second record, “${numerator.en}” is ${show(adjustedN, nu, 'en')} and “${target.en}” is unchanged. Find “${denominator.en}” in the second record.`);
        values = numbers(choices.map(value => [value, de]));
        explanation = bi(`用新分子 ${adjustedN} 除以原比值 ${n}/${d}，得到 ${show(adjustedD, de, 'zh')}。`,
          `Divide the new numerator ${adjustedN} by the original raw ratio ${n}/${d} to get ${show(adjustedD, de, 'en')}.`);
        check = { type: 'reverse-scale', n, d, adjustedN, choices };
      }
      kinds = [null, 'evidence', null, null];
    } else if (i % 2 === 1) {
      form = 'evidence-limits';
      question = bi(`第二份记录中两个量都恰好是第一份的两倍。仅凭这两条数据，可以得出哪项结论？`,
        'Both measurements in a second record are exactly twice those in the first. Which conclusion do these two records alone support?');
      values = [bi('这两条记录的比值相同', 'These two records have equal ratios'), bi('比值也变为两倍', 'The ratio also doubled'),
        bi('记录的任何新条件都不会改变比值', 'No new condition could change the ratio'), bi('数据已经证明哪一个量是变化的原因', 'The data prove which quantity caused the change')];
      explanation = bi('两组数据支持这两条记录的比值相等。判断新条件或因果关系需要更多证据。',
        'The two ratios are equal. New conditions or causal explanations require more evidence.');
      kinds = [null, 'evidence', 'evidence', 'evidence'];
      check = { type: 'evidence-limits', n, d, n2: n * 2, d2: d * 2 };
    } else {
      form = 'dataset';
      const pairs = [[n * 2, d * 2], [n + 1, d], [n, d * 3], [n * 2, d * 4]];
      question = bi(`一个同学说两份虚拟记录的「${target.zh}」一样。下列哪份第二记录支持这个说法？`,
        `A student claims two virtual records have the same “${target.en}”. Which second record supports the claim?`);
      values = pairs.map(([a, b]) => localized(lang => `${word(numerator, lang)} ${show(a, nu, lang)} / ${word(denominator, lang)} ${show(b, de, lang)}`));
      explanation = bi('只看其中一个读数无法比较。两个量同时加倍时，比值不变。这组数据支持比值相同。', 'One reading alone is insufficient. Doubling both quantities preserves the ratio. This evidence supports equal ratios.');
      kinds = [null, 'evidence', 'evidence', 'denominator'];
      check = { type: 'comparison', n, d, pairs };
    }

    answer = (i + Math.floor(i / 4)) % 4;
    const order = [1, 2, 3];
    order.splice(answer, 0, 0);
    const options = order.map(index => values[index]);
    const errorKinds = Object.fromEntries(order.flatMap((index, choice) => kinds[index] ? [[choice, kinds[index]]] : []));
    const prefix = localized(lang => `${measurements[lang]}\n${question[lang]}`);
    return {
      id: `sci-${topic.id}-${level}-${i + 1}`, subject: topic.subject, domain: topic.domain, topic: topic.id,
      level, form, role, variantGroup: i, variant: role === 'probe' ? 'step' : 'apply',
      diagnosticOnly: role === 'placement', focusOnly: role === 'probe' || role === 'transfer',
      focus: [topic.id], skill: level === 'L5' ? 'reasoning' : level === 'L3' ? 'calculation' : 'application',
      errors: Object.fromEntries(Object.keys(errorKinds).map(index => [index, topic.id])), errorKinds,
      curriculumRefs: [], source: sources[topic.domain], review: 'template-validated', safety: 'virtual-data',
      prompt: prefix, options, answer, explanation, hint: level === 'L1' ? topic.notice : definition,
      validation: check && { ...check, order }
    };
  }

  // Independent checks use cross multiplication on the reported measurements, not the answer index.
  function validate(question) {
    const topic = question && Object.hasOwn(topics, question.topic) ? topics[question.topic] : null;
    if (!topic || question.subject !== topic.subject || question.domain !== topic.domain
      || !data.levels[topic.subject].includes(question.level) || question.review !== 'template-validated' || question.safety !== 'virtual-data'
      || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3
      || !Array.isArray(question.options) || question.options.length !== 4
      || ['zh', 'en'].some(lang => !question.prompt?.[lang] || !question.explanation?.[lang]
        || !question.options.every(option => option[lang]) || new Set(question.options.map(option => option[lang])).size !== 4)) return false;
    const check = question.validation;
    if (!check) {
      const option = question.options[question.answer];
      const published = question.level === 'L1' && question.form === 'unit' ? bi(topic.unit, topic.unit)
        : question.level === 'L1' && question.form === 'concept' ? topic.numerator
        : question.level === 'L2' && question.form === 'concept' ? topic.denominator
        : question.level === 'L2' && question.form === 'inverse' ? bi('变为原来的两倍', 'It doubles') : null;
      return Boolean(published && option.zh === published.zh && option.en === published.en);
    }
    const { type, n, d, adjustedD, adjustedN, choices, scale, pairs, order } = check;
    if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4
      || order.some(index => !Number.isInteger(index) || index < 0 || index > 3)) return false;
    const matches = order.filter(index => {
      if (type === 'ratio') return Math.abs(choices[index] * d - n * scale) < 1e-9;
      if (type === 'scaled') return choices[index] * d === n * adjustedD;
      if (type === 'reverse-scale') return choices[index] * n === adjustedN * d;
      if (type === 'evidence-limits') return index === 0 && n * check.d2 === check.n2 * d;
      return type === 'comparison' && pairs[index][0] * d === n * pairs[index][1];
    });
    if (matches.length !== 1 || order[question.answer] !== matches[0]) return false;
    return !choices || ['zh', 'en'].every(lang => Number.parseFloat(question.options[question.answer][lang]) === choices[matches[0]]);
  }

  for (const [subject, domain, domainZh, domainEn, id, zh, en, nZh, nEn, dZh, dEn, numeratorUnit, denominatorUnit, unit, percent, ctxZh, ctxEn] of fields) {
    const numerator = bi(nZh, nEn);
    const denominator = bi(dZh, dEn);
    const target = bi(zh, en);
    const topic = {
      id, topic: id, subject, domain, domainLabel: bi(domainZh, domainEn), target, label: target, numerator, denominator, numeratorUnit, denominatorUnit, unit,
      context: bi(ctxZh, ctxEn), percent, level: 'L2', prerequisites: [], source: sources[domain],
      notice: bi('先看两个读数的名称和单位。', 'Read the names and units of both measurements first.'),
      question: bi(`哪一个量应该放在「${zh}」的分母？`, `Which quantity belongs in the denominator for “${en}”?`),
      principle: bi(`用「${nZh}」除以「${dZh}」${percent ? '，再转换成百分数' : ''}。比较两条记录时要使用相同单位。`,
        `Divide “${nEn}” by “${dEn}”${percent ? ', then express the result as a percentage' : ''}. Compare records in consistent units.`),
      example: bi(`虚拟例子中，${nZh}为 ${show(4, numeratorUnit, 'zh')}，${dZh}为 ${show(8, denominatorUnit, 'zh')}，比值为 ${show(percent ? 50 : 0.5, unit, 'zh')}。`,
        `In a virtual example, “${nEn}” is ${show(4, numeratorUnit, 'en')} and “${dEn}” is ${show(8, denominatorUnit, 'en')}. The resulting ratio is ${show(percent ? 50 : 0.5, unit, 'en')}.`)
    };
    topics[id] = topic;
    data.topics[id] = target;
    (data.topicsBySubject[subject] ||= []).push(id);
    for (const level of data.levels[subject]) {
      for (let i = 0; i < 20; i++) questions.push(recipe(topic, level, i, i < 8 ? 'practice' : i < 12 ? 'probe' : 'transfer'));
      if (level === 'L1' || level === 'L2') questions.push(recipe(topic, level, 20, 'placement'));
    }
  }
  if (questions.some(question => !validate(question)) || new Set(questions.map(question => question.id)).size !== questions.length) {
    throw new Error('Science bank failed validation');
  }
  data.questions.push(...questions);

  function candidates({ subject, topic, level, curriculum = '', avoid = [] }) {
    if (topics[topic]?.subject !== subject || !scienceSubjects.includes(subject) || !data.levels[subject].includes(level)) return [];
    const excluded = new Set(avoid);
    return data.questions.filter(question => !question.retired && question.review === 'template-validated'
      && question.topic === topic && question.level === level && question.role === 'practice'
      && (!curriculum || question.curriculumRefs.some(ref => ref.curriculum === curriculum)) && !excluded.has(question.id));
  }

  globalThis.EachVeyaScience = { subjects: scienceSubjects, topics, scopes, curriculumKeys, errorLabels, questions, validate, candidates };
})();
