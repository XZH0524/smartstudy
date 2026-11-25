(function () {
  'use strict';
  const { questions, bilingual: bi } = globalThis.SmartStudyData;
  const AI = globalThis.EachVeyaAi;
  const { decorateEquation } = globalThis.EachVeyaSkills;
  const byId = new Map(questions.map(q => [q.id, q]));
  const items = [];

  function equation(group, index, a, b, x, context, purpose = 'lesson') {
    const spec = { level: 'L2', form: 'plain', a, b, c: 0, d: a * x + b, distractors: [x - 1, x + 1, x + 2] };
    const checked = AI.normalizeSpec(spec, 'L2');
    if (!checked) throw new Error('Invalid lesson equation');
    const q = decorateEquation(AI.makeQuestion({ ...checked, format: 'calculation' }), checked);
    q.prompt = bi(context.zh + '\n' + q.prompt.zh, context.en + '\n' + q.prompt.en);
    items.push({ ...q, ai: false, id: 'lesson-equation-' + group + '-' + index, lessonGroup: group, purpose, focusOnly: true });
  }

  for (let i = 0; i < 4; i++) {
    const n = 3 + i, fee = 2 + i, x = 5 + i;
    equation('tickets', i, n, fee, x, bi(
      n + ' 张同价票加 ' + fee + ' 元订票费，共 ' + (n*x + fee) + ' 元。每张票 x 元。',
      n + ' equal-price tickets plus a booking fee of ' + fee + ' yuan cost ' + (n*x + fee) + ' yuan. Each ticket costs x yuan.'));
    equation('ribbon', i, n, -fee, x+2, bi(
      n + ' 段丝带，每段 x 厘米。剪去总共 ' + fee + ' 厘米后，还剩 ' + (n*(x+2)-fee) + ' 厘米。',
      n + ' ribbons are each x cm long. After a total of ' + fee + ' cm is cut off, ' + (n*(x+2)-fee) + ' cm remains.'));
    equation('points', i, n+1, fee, x+1, bi(
      '比赛起始积分为 ' + fee + ' 分，每轮得 x 分。完成 ' + (n+1) + ' 轮后共得 ' + ((n+1)*(x+1)+fee) + ' 分。',
      'A team starts with ' + fee + ' points and earns x points each round. After ' + (n+1) + ' rounds it has ' + ((n+1)*(x+1)+fee) + ' points.'));
  }
  equation('parcel', 0, 4, 3, 8, bi('空盒重 3 克，放入 4 枚等重的模型后共重 35 克。每枚模型重 x 克。',
    'A box weighs 3 g. With four identical models inside it weighs 35 g. Each model weighs x grams.'), 'transfer');
  equation('walk', 0, 3, -2, 9, bi('步行者连续三次向东走 x 米，随后向西走 2 米，最终在起点以东 25 米处。',
    'A walker takes three eastward stretches of x metres each and then walks 2 metres west, finishing 25 metres east of the start.'), 'transfer');

  function evidence(group, index, passage, ask, answer, explanation, purpose = 'lesson') {
    const sentences = passage.match(/[^.!?]+[.!?]/g)?.map(s => s.trim());
    if (sentences?.length !== 4 || sentences.join(' ') !== passage || !sentences[answer]) throw new Error('Invalid reading passage ' + group);
    items.push({
      id: 'lesson-evidence-' + group + '-' + index, subject: 'english', topic: 'reading', track: 'cefr', level: 'A1',
      focusOnly: true, lessonGroup: group, purpose, focus: ['text-evidence'],
      prompt: bi(passage + '\n\n哪句原文能回答这个问题？' + ask.zh, passage + '\n\nWhich sentence answers this question? ' + ask.en),
      options: sentences.map(s => bi(s, s)), answer, evidenceQuote: sentences[answer],
      hint: bi('先找问题问的是人、地点、时间还是原因，再对照每句所说的事情。',
        'Identify the person, place, time or reason being asked about. Then compare the sentences.'),
      explanation, errors: Object.fromEntries(sentences.flatMap((_, i) => i === answer ? [] : [[i, 'text-evidence']]))
    });
  }
  // Each source consists of four complete sentences. The key identifies the supporting sentence for each question.
  for (const [group, sequence] of [['lost-cap', [0,1,2,3]], ['week-plan', [2,3,0,1]], ['blue-route', [1,0,3,2]]]) {
    sequence.forEach(i => {
      const source = byId.get('b400-english-r-' + group + '-' + (i+1));
      const [passage, askEn] = source.prompt.en.split('\n\n');
      const askZh = source.prompt.zh.split('\n\n')[1];
      evidence(group, i, passage, bi(askZh, askEn), i, source.explanation);
      source.evidenceQuote = items.at(-1).evidenceQuote;
    });
  }
  evidence('posters', 0, 'Our class made two posters. Jo drew a tree on the first one. Lee hung the second one by the door. We took both down on Friday.',
    bi('第二张海报挂在哪里？', 'Where did Lee hang the second poster?'), 2, bi('第三句把第二张海报和门旁的位置联系起来。', 'The third sentence links the second poster to its place by the door.'), 'transfer');
  evidence('picnic', 0, 'We met beside the lake. Rain began at noon. We ate inside the tent because the grass was wet. Dad took the tent home on Sunday.',
    bi('大家为什么在帐篷里吃饭？', 'Why did they eat in the tent?'), 2, bi('第三句给出了原因，草地是湿的。', 'The third sentence gives the reason: the grass was wet.'), 'transfer');
  questions.push(...items);

  function roundIds(state, subject) {
    const last = new Map();
    state.attempts.forEach((attempt, index) => last.set(attempt.questionId, index));
    const ranked = items.filter(q => q.subject === subject && q.purpose === 'lesson')
      .sort((a,b) => (last.get(a.id) ?? -1) - (last.get(b.id) ?? -1));
    const groups = new Set();
    return ranked.filter(q => {
      if (groups.has(q.lessonGroup)) return false;
      groups.add(q.lessonGroup);
      return true;
    }).map(q => q.id);
  }
  globalThis.EachVeyaLessons = { roundIds };
})();
