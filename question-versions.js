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

  globalThis.EachVeyaQuestionVersions = { version: 1 };
})();
