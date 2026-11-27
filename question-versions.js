(function () {
  'use strict';
  const { questions, bilingual } = globalThis.SmartStudyData;
  const ids = new Map(questions.map(question => [question.id, question]));

  // Every published revision keeps its own ID, wording and scoring key.
  function revise(id, changes) {
    const previous = ids.get(id);
    if (!previous || previous.retired) throw new Error('Cannot revise unavailable question ' + id);
    const originalId = previous.originalId || id;
    const version = (previous.version || 1) + 1;
    const nextId = `${originalId}@${version}`;
    if (ids.has(nextId)) throw new Error('Duplicate question revision ' + nextId);
    const updated = { ...previous, ...changes, id: nextId, originalId, version, retired: false };
    previous.retired = true;
    questions.push(updated);
    ids.set(nextId, updated);
  }

  revise('en-v08', {
    prompt: bilingual('选择合适的词。We arrived just ___ time to catch the last bus. The doors were about to close.',
      'Choose the word. We arrived just ___ time to catch the last bus. The doors were about to close.'),
    options: ['on', 'in', 'at', 'with'].map(value => bilingual(value, value)),
    answer: 1,
    explanation: bilingual('just in time 表示刚好赶上。车门快关了，他们在关门前赶到了。',
      'Just in time means early enough to catch the bus. They arrived just before the doors closed.')
  });

  for (const question of questions) {
    if (question.id === 'ma-a01' || /^ma-pr-algebra-L2-\d+$/.test(question.id)
      || /^b400-math-algebra-tickets-\d+$/.test(question.id)) question.equationFamily = 'linear';
  }

  // Replace four numeric variants with questions that require a different inverse operation.
  for (const [id, divisor, offset, reduced] of [[7, 3, 4, 5], [8, 4, -2, 3]]) {
    const sign = offset < 0 ? '−' : '+';
    const right = reduced + offset;
    const answer = divisor * reduced;
    const equation = `x/${divisor} ${sign} ${Math.abs(offset)} = ${right}`;
    revise(`ma-pr-algebra-L2-${id}`, {
      equationFamily: 'quotient',
      prompt: bilingual(`解方程 ${equation}。`, `Solve ${equation}.`),
      options: [reduced, answer, right * divisor, answer + divisor].map(value => bilingual(String(value), String(value))),
      answer: 1,
      hint: bilingual('先让左边只剩含 x 的分数。再想怎样消去分母。', 'First isolate the fraction containing x. Then undo the division.'),
      explanation: bilingual(`两边${offset < 0 ? '加' : '减'} ${Math.abs(offset)}，得 x/${divisor} = ${reduced}。两边乘 ${divisor}，得 x = ${answer}。`,
        `${offset < 0 ? 'Add' : 'Subtract'} ${Math.abs(offset)} on both sides to get x/${divisor} = ${reduced}. Multiply both sides by ${divisor} to get x = ${answer}.`)
    });
  }
  for (const [id, factor, offset, reduced] of [[9, 3, 2, 7], [10, 4, -3, 5]]) {
    const sign = offset < 0 ? '−' : '+';
    const right = factor * reduced;
    const answer = reduced - offset;
    const equation = `${factor}(x ${sign} ${Math.abs(offset)}) = ${right}`;
    revise(`ma-pr-algebra-L2-${id}`, {
      equationFamily: 'grouped',
      prompt: bilingual(`解方程 ${equation}。`, `Solve ${equation}.`),
      options: [reduced + offset, right, answer, reduced].map(value => bilingual(String(value), String(value))),
      answer: 2,
      hint: bilingual('整个括号一起乘了外面的数。可以先用除法把括号单独留下。', 'The whole bracket is multiplied by the number outside. Try dividing both sides first.'),
      explanation: bilingual(`两边除以 ${factor}，得 x ${sign} ${Math.abs(offset)} = ${reduced}。两边${offset < 0 ? '加' : '减'} ${Math.abs(offset)}，得 x = ${answer}。`,
        `Divide both sides by ${factor} to get x ${sign} ${Math.abs(offset)} = ${reduced}. ${offset < 0 ? 'Add' : 'Subtract'} ${Math.abs(offset)} on both sides to get x = ${answer}.`)
    });
  }

  // Retain the answers students received before defensible alternatives were added.
  for (const [number, alternative, zh, en] of [
    [3, 'demanding', 'difficult 或 demanding 都可表达题目更难。', 'Both difficult and demanding fit the contrast with simple.'],
    [8, 'dim', 'dark 或 dim 都可以形容光线不足的房间。', 'Both dark and dim can describe a room with less light than the bright hall.'],
    [10, 'gradual', 'gentle 或 gradual 都能形容由陡变缓的坡度。', 'Both gentle and gradual can describe the slope as less steep.']
  ]) {
    const id = `fill-english-opposites-${number}`;
    const [field] = ids.get(id).fields;
    revise(id, { fields: [{ ...field, accepted: [alternative] }], explanation: bilingual(zh, en) });
  }
  const museum = ids.get('fill-english-reading-details-5');
  revise(museum.id, {
    prompt: bilingual(museum.prompt.zh.replace('Tickets are always available ___.', 'Outside holidays, the museum sells tickets ___.'),
      museum.prompt.en.replace('Tickets are always available ___.', 'Outside holidays, the museum sells tickets ___.')),
    explanation: bilingual('第一句说博物馆在网上售票。第二句的 also 表明假期另加门口售票。',
      'The first sentence says the museum sells tickets online. Also introduces the extra option of buying at the gate on holidays.')
  });

  for (const [id, stem, explanationZh, explanationEn, choices] of [
    ['A1-14', 'The sun has just risen. In the early ___, I wash my face and get ready for school.',
      '太阳刚升起，说明是清晨。early morning 表示一大早。',
      'The sun has just risen, so it is early morning.'],
    ['A1-18', 'Everyone in the back row says your voice is too quiet. Please speak more ___.',
      'too quiet 说明声音太小，需要提高音量。loudly 表示大声地。',
      'Too quiet points to volume. Speaking more loudly means raising your voice.', ['loudly', 'clearly', 'slowly', 'politely']],
    ['C2-5', 'The witness offered a ___ distinction between being present and taking part. The court considered that difference central to the case.',
      'central to the case 说明这一差别对案件很重要。salient 表示突出、重要。',
      'Central to the case signals importance. A salient distinction is one that stands out as important.'],
    ['C2-16', 'The link was a helpful ___ to another source, but it offered no verdict or objection of its own.',
      '链接的作用是把读者引到另一个来源。pointer 在这里指指引或线索。',
      'The link directs the reader to another source. A pointer can guide you to information without judging it.']
  ]) {
    const original = ids.get(`b400-english-v-${id}`);
    revise(original.id, {
      prompt: bilingual(`根据语境填空。\n${stem}`, `Choose the word or phrase that fits the context.\n${stem}`),
      explanation: bilingual(explanationZh, explanationEn),
      ...(choices ? { options: choices.map(value => bilingual(value, value)) } : {})
    });
  }

  const weekday = 'Our weekly music class takes place ___ Thursday afternoons.';
  revise('b400-english-g-calendar-prep-2', {
    prompt: bilingual(`选择最合适的形式补全句子。\n${weekday}`, `Choose the form that best completes the sentence.\n${weekday}`),
    explanation: bilingual('具体星期几的下午用 on。Thursday afternoons 表示每周四下午。',
      'Use on with a named day or part of a named day. Thursday afternoons describes the weekly schedule.')
  });

  const provenance = ids.get('fill-english-formal-word-form-6');
  const provenancePrompt = 'Her record makes it easy to trace the ___ of each donated object. (a ten-letter noun beginning with p for its origin or ownership history)';
  revise(provenance.id, {
    prompt: bilingual(`根据括号中的释义填入一个名词。\n${provenancePrompt}`, `Fill the blank with one noun that matches the definition.\n${provenancePrompt}`),
    explanation: bilingual('provenance 指物品的来源或流转记录，例如一件藏品历任持有者的记录。',
      'Provenance is the documented origin or ownership history of an object.')
  });

  for (const [id, zh, en] of [
    ['library-card-2', '原文说 My library card is in the front pocket of my bag，明确指出卡在包的前口袋。',
      'The note says, “My library card is in the front pocket of my bag.”'],
    ['meeting-rain-1', '第一句说天气干燥时在电影院外碰面，时间是两点。',
      'The first sentence says they will meet outside the cinema at two if the weather stays dry.'],
    ['school-start-2', '校长认为数据让人看到好转，但没有说这证明了调整上课时间是原因。',
      'The principal calls the figures encouraging but does not claim they prove what caused the improvement.']
  ]) {
    revise(`b400-english-r-${id}`, { explanation: bilingual(zh, en) });
  }

  revise('b400-biology-trait-frequency-both-alleles-L2-change-input', {
    prompt: bilingual('模型甲：两个独立来源分别给出 a 的概率为 25% 和 60%。模型乙：两个独立来源分别给出 a 的概率为 50% 和 30%。从甲到乙，获得 aa 基因型的概率怎样变化？',
      'Model A: probability of receiving allele a from the first source 25%, probability from the second source 60%. Model B: probability from the first source 50%, probability from the second source 30%. The sources are independent in both models. How does the probability of genotype aa change from A to B?'),
    explanation: bilingual('两个来源独立，得到 aa 要把两项概率相乘。甲为 0.25 × 0.60 = 0.15，乙为 0.50 × 0.30 = 0.15，所以保持不变。',
      'For independent sources, multiply the probabilities of receiving a. Model A gives 0.25 × 0.60 = 0.15, and model B gives 0.50 × 0.30 = 0.15. The probability stays the same.')
  });

  // Restore the final line in explanations that previously stopped at the calculation.
  const concludingMathSteps = {
    'arithmetic-remainder-budget': [2, 3],
    'arithmetic-before-tax': [1, 2, 3],
    'algebra-negative-input': [1, 2, 3],
    'algebra-tickets': [1, 2, 3],
    'geometry-scaled-area': [1, 2, 3],
    'functions-piecewise': [1, 2, 3],
    'statistics-spinner': [1, 2, 3],
    'statistics-weighted-mean': [1, 2, 3]
  };
  for (const [model, variants] of Object.entries(concludingMathSteps)) {
    for (const number of variants) {
      const original = ids.get(`b400-math-${model}-${number}`);
      const answer = original.options[original.answer];
      revise(original.id, { explanation: bilingual(
        `${original.explanation.zh} 算得 ${answer.zh}。`,
        `${original.explanation.en} The result is ${answer.en}.`
      ) });
    }
  }

  function reviseReading(slug, zh, en, explanation, options) {
    const id = 'b400-english-r-' + slug;
    const original = ids.get(id);
    const passage = original.prompt.en.split('\n\n')[0];
    revise(id, {
      prompt: bilingual(passage + '\n\n' + zh, passage + '\n\n' + en),
      explanation, ...(options ? { options } : {})
    });
  }

  reviseReading('weather-record-2',
    '两台仪器放在室内同一位置时读数一致。哪一种解释因此最站不住脚？',
    'The instruments agree when placed together indoors. Which explanation is therefore least convincing?',
    bilingual('两台仪器在同一位置读数一致，因此「两台仪器不论放在哪里，总给出不同的读数」最站不住脚。',
      'They agree when placed together, so the claim that the instruments always disagree is least convincing.'));
  reviseReading('opening-hours-4',
    '有人把最初来访人数少当成需求不足。下面哪项说法就是这类过度推断？',
    'Which conclusion overinterprets the low initial visitor counts as a lack of demand?',
    bilingual('末班车在闭馆前就已开走。交通条件可能影响来访人数，单凭客流不足以判断读者没有需求。',
      'The last bus left before closing. Travel can affect attendance, so low turnout alone cannot establish a lack of demand.'));
  reviseReading('translation-choice-2',
    '把 house 换成 palace 能让哪一点更清楚，又会丢掉什么？',
    'Using “palace” would make what clearer, and what would it lose?',
    bilingual('palace 更准确地传达建筑的规模，但失去了人物刻意用普通词、把事情说小一点的语气。',
      '“Palace” makes the scale of the building clearer but loses the character’s deliberate understatement.'),
    ids.get('b400-english-r-translation-choice-2').options.map((option, index) => index === 0
      ? bilingual('建筑规模更清楚，但人物刻意低调的语气消失了', 'The building’s scale becomes clearer, but the deliberate understatement is lost')
      : option));

  // Indices name the sentences that support each answer. Multiple sentences
  // are paired when the answer needs a comparison or a conclusion.
  const readingEvidence = {
    'lost-cap': [[0], [1], [2], [3]],
    'week-plan': [[0], [1], [2], [3]],
    'blue-route': [[0], [1], [2], [3]],
    'library-card': [[1], [2], [3, 4], [5]],
    'bike-desk': [[0], [1], [2], [4]],
    'meeting-rain': [[0], [1], [3], [4]],
    'menu-board': [[0], [1, 2], [3], [4]],
    postcard: [[0], [2, 3], [4], [4]],
    'repair-table': [[0, 1], [2], [3, 4], [4]],
    'tree-map': [[1], [2], [3], [3, 4]],
    'hall-rules': [[0, 1], [2], [3], [3]],
    'campus-route': [[0], [1], [2], [3, 4]],
    'school-start': [[0, 1, 2], [2], [3], [0, 2]],
    'caption-cost': [[1], [2], [3], [2, 3]],
    'weather-record': [[1], [2], [3], [1, 3]],
    'opening-hours': [[1], [2], [2, 3], [1, 3]],
    minutes: [[0, 2], [3], [2, 4], [4]],
    'water-model': [[0, 1], [2], [0, 3], [2, 3]],
    'translation-choice': [[0, 1], [1, 2], [3], [0, 1, 2]],
    'archive-silence': [[1], [4], [4, 5], [2, 4]],
    'pilot-sunset': [[0, 1], [1], [2], [2, 3]],
    'clock-room': [[0, 2], [1, 3, 4], [3, 4], [2, 3, 4]]
  };
  for (const question of questions) {
    if (question.retired) continue;
    const match = question.id.match(/^b400-english-r-(.+)-([1-4])(?:@\d+)?$/u);
    if (!match) continue;
    const article = question.prompt.en.split('\n\n')[0];
    const sentences = article.split(/(?<=[.!?]) (?=[A-Z])/u);
    const selected = readingEvidence[match[1]][Number(match[2]) - 1].map(index => sentences[index]);
    if (selected.some(sentence => !sentence)) throw new Error('Missing reading evidence ' + question.id);
    question.reviewedReadingEvidence = selected;
  }

  revise('b400-chemistry-amount-concentration-remaining-volume-L5-limit', {
    prompt: bilingual('甲、乙两份溶液的总体积都变为原来的 80%，溶质各自保持完全溶解且物质的量不变。甲起初的浓度较高，最终哪份溶液的浓度较高？',
      'The total volume of each solution falls to 80% of its starting value. In each, the solute remains fully dissolved and its amount stays the same. A starts more concentrated than B. Which is more concentrated at the end?'),
    explanation: bilingual('两份溶液的物质的量各自不变，体积都乘 0.8。浓度 c = n/V，因此两者的原浓度都乘 1/0.8 = 1.25，甲仍较浓。',
      'Each solution keeps the same amount of solute, and both volumes are multiplied by 0.8. Since c = n/V, both concentrations are multiplied by 1/0.8 = 1.25. A remains more concentrated.')
  });

  revise('b400-biology-population-density-mean-quadrats-L5-limit', {
    prompt: bilingual('同一区域中两个面积相等的样方，记录到同一种植物的株数相等。这能证明整个区域的密度都相同吗？',
      'Two equal-area quadrats in the same area have the same count of a plant species. Does this prove the density is the same throughout the area?'),
    explanation: bilingual('两个等面积样方的株数相等，说明这两个样方的计数密度相同。其他位置的密度仍可能不同。',
      'Equal counts over equal areas give the same sampled density in these two quadrats. Density may still differ elsewhere.')
  });

  globalThis.EachVeyaQuestionVersions = { version: 7 };
})();
