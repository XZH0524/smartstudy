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

  globalThis.EachVeyaQuestionVersions = { version: 2 };
})();
