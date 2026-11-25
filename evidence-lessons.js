(function () {
  'use strict';
  const { questions, bilingual: bi } = globalThis.SmartStudyData;
  const AI = globalThis.EachVeyaAi;
  const { decorateEquation } = globalThis.EachVeyaSkills;
  const byId = new Map(questions.map(q => [q.id, q]));
  const items = [];
  const workshops = { math: 'equationLesson', english: 'readingLesson', physics: 'speedLesson' };

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
  for (const [group, a, b, x, zh, en] of [
    ['paint', 7, 4, 9, '7 瓶颜料每瓶 x 元，另付 4 元运费，共付 67 元。', 'Seven paint bottles cost x yuan each. With a 4 yuan delivery fee, the total is 67 yuan.'],
    ['robot', 6, -4, 8, '机器人前进 6 次，每次 x 厘米，然后后退 4 厘米，净前进 44 厘米。', 'A robot moves forward six times by x cm, then moves back 4 cm. It ends 44 cm ahead.'],
    ['pages', 5, 6, 11, '周一读了 6 页，之后 5 天每天读 x 页，共读了 61 页。', 'A reader reads 6 pages on Monday and x pages a day for the next five days, 61 pages in all.'],
    ['packing', 4, -5, 12, '4 袋纽扣每袋 x 枚，取出 5 枚后，剩下 43 枚。', 'Four bags hold x buttons each. After five buttons are taken out, 43 are left.'],
    ['garden', 8, 3, 7, '8 行幼苗，每行 x 株，再加上盆里的 3 株，共有 59 株。', 'Eight rows contain x seedlings each. With three more in a pot, there are 59 seedlings.'],
    ['chain', 9, -6, 5, '9 段铁链，每段 x 厘米。共剪掉 6 厘米后，总长为 39 厘米。', 'Nine pieces of chain are x cm each. After 6 cm is cut off in total, their length is 39 cm.']
  ]) equation(group, 0, a, b, x, bi(zh, en), 'followup');

  function evidence(group, index, passage, ask, answer, explanation, purpose = 'lesson') {
    const sentences = passage.match(/[^.!?]+[.!?]/g)?.map(s => s.trim());
    if (sentences?.length !== 4 || sentences.join(' ') !== passage || !sentences[answer]) throw new Error('Invalid reading passage ' + group);
    const evidenceType = /^who\b/i.test(ask.en) ? 'person' : /^where\b/i.test(ask.en) ? 'place' :
      /^(when|what time|on which day)\b/i.test(ask.en) ? 'time' : /^why\b/i.test(ask.en) ? 'reason' : 'detail';
    items.push({
      id: 'lesson-evidence-' + group + '-' + index, subject: 'english', topic: 'reading', track: 'cefr', level: 'A1',
      focusOnly: true, lessonGroup: group, purpose, focus: ['text-evidence'],
      prompt: bi(passage + '\n\n哪句原文能回答这个问题？' + ask.zh, passage + '\n\nWhich sentence answers this question? ' + ask.en),
      options: sentences.map(s => bi(s, s)), answer, evidenceQuote: sentences[answer], evidenceType,
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
  for (const [group, passage, zh, en, answer, whyZh, whyEn] of [
    ['museum', 'Jin gives out maps at the door. Paul checks the tickets. The museum opens at ten. The café closes at four.',
      '谁在门口发地图？', 'Who gives out maps at the door?', 0, '第一句把发地图的动作和 Jin 联系起来。', 'The first sentence links Jin to giving out maps.'],
    ['bird-box', 'Eva paints a bird box. Her sister has a red bag. Tom puts the bird box in the tree. They eat lunch by the gate.',
      '谁把鸟箱放到了树上？', 'Who puts the bird box in the tree?', 2, '第三句的主语 Tom 做了这个动作。', 'Tom is the person doing this in the third sentence.'],
    ['drama', 'School ends at three. The drama club meets at half past three. The music club starts at four. All clubs end at five.',
      '戏剧社几点集合？', 'When does the drama club meet?', 1, '第二句把戏剧社和三点半联系起来。', 'The second sentence gives half past three as the drama club time.'],
    ['market', 'We buy apples in the morning. The bread stall is near the gate. We walk home after lunch. The market closes at two.',
      '集市几点关门？', 'When does the market close?', 3, '最后一句说的是关门时间，两点。', 'The last sentence states the closing time, two o’clock.'],
    ['keys', 'My blue bag is on the chair. I left the keys on the kitchen table. The front door is locked. Please wait by the gate.',
      '钥匙在哪里？', 'Where are the keys?', 1, '第二句同时提到钥匙和厨房桌子。', 'The second sentence mentions both the keys and the kitchen table.'],
    ['pool', 'The pool opens at nine. Please pay at the front desk. Towels are on the shelf. Put your shoes under the bench.',
      '鞋应放在哪里？', 'Where should you put your shoes?', 3, '最后一句是关于鞋的指示，地点是长凳下面。', 'The last sentence gives the instruction about shoes: under the bench.'],
    ['bikes', 'We met outside the shop. I had my bike with me. I walked home because I could not ride it. Leo took the bus.',
      '我为什么步行回家？', 'Why did I walk home?', 2, '第三句把步行与不能骑车的原因直接连起来。', 'The third sentence directly connects walking home to being unable to ride.'],
    ['concert', 'I sat near the front because I wanted to see the band. Leo sat beside the door. We went to the concert on Friday. We went home at nine.',
      '我为什么坐在靠前的位置？', 'Why did I sit near the front?', 0, '第一句说明我想看清乐队。', 'The first sentence explains that I wanted to see the band.'],
    ['picnic-list', 'I put two cups in the bag. Sara brought three apples. We shared one sandwich. Dad carried a bottle of water.',
      '萨拉带了什么？', 'What did Sara bring?', 1, '第二句用 Sara 作主语，说她带了三个苹果。', 'The second sentence tells us that Sara brought three apples.'],
    ['crafts', 'We made paper boats at school. Mine is yellow. Mina made a blue boat. We put the boats in a box.',
      '米娜的纸船是什么颜色的？', 'What colour is Mina’s boat?', 2, '第三句同时提到 Mina 和蓝色纸船。', 'The third sentence mentions both Mina and the blue boat.']
  ]) evidence(group, 0, passage, bi(zh, en), answer, bi(whyZh, whyEn), 'followup');

  function averageSpeed(group, index, context, [first, stop, last, speed], purpose = 'lesson') {
    const total = first + stop + last;
    const distance = total * speed;
    items.push({
      id: 'lesson-speed-' + group + '-' + index, subject: 'physics', topic: 'average-speed', level: 'L2',
      skill: 'calculation', curriculumRefs: [],
      focusOnly: true, lessonGroup: group, purpose, focus: ['average-speed'], speedSteps: true, format: 'calculation',
      prompt: bi(`${context.zh}，先移动 ${first} 秒，停留 ${stop} 秒，再移动 ${last} 秒。全程走过 ${distance} 米。求从出发到结束的总用时和平均速率。`,
        `${context.en} moves for ${first} s, stops for ${stop} s and then moves for ${last} s. It covers ${distance} m in all. Find the total elapsed time and the average speed from start to finish.`),
      fields: [
        { label: bi('第 1 步 · 总用时 = □ s', 'Step 1 · Total elapsed time = □ s'), expected: total },
        { label: bi('第 2 步 · 平均速率 = □ m/s', 'Step 2 · Average speed = □ m/s'), expected: speed }
      ],
      hint: bi('把行进和停留的时间都计入总用时，再用总路程除以总用时。',
        'Include both moving time and stopped time, then divide the total distance by the total elapsed time.'),
      explanation: bi(`总用时为 ${first} + ${stop} + ${last} = ${total} 秒。平均速率为 ${distance} ÷ ${total} = ${speed} m/s。`,
        `The total elapsed time is ${first} + ${stop} + ${last} = ${total} s. The average speed is ${distance} ÷ ${total} = ${speed} m/s.`)
    });
  }

  for (const [group, context, rows] of [
    ['cart', bi('模型小车在直道上行驶', 'A model car on a straight track'), [[6, 2, 4, 1], [7, 3, 5, 2], [8, 4, 6, 1], [9, 5, 7, 2]]],
    ['runner', bi('一名跑步者沿跑道前进', 'A runner on a track'), [[10, 6, 8, 2], [12, 8, 9, 3], [11, 7, 13, 2], [15, 5, 12, 3]]],
    ['cyclist', bi('一辆自行车沿小路前进', 'A bicycle on a path'), [[14, 7, 9, 4], [16, 6, 13, 3], [17, 8, 11, 5], [20, 4, 14, 4]]]
  ]) rows.forEach((row, index) => averageSpeed(group, index, context, row));

  for (const [group, zh, en, row, purpose] of [
    ['kayak', '一艘独木舟在平静水面上行进', 'A kayak on still water', [25, 10, 15, 2], 'transfer'],
    ['bus', '一辆公交车沿街道行驶', 'A bus on a street', [22, 8, 20, 6], 'transfer'],
    ['delivery', '一辆配送车沿街道行驶', 'A delivery van on a street', [21, 9, 18, 5]],
    ['pond', '一只鸭子在平静的池塘里游动', 'A duck in a still pond', [13, 4, 8, 1]],
    ['skater', '一名滑冰者沿冰道滑行', 'A skater on an ice rink', [10, 5, 12, 3]],
    ['shuttle', '一辆接驳车沿站台旁的道路行驶', 'A shuttle on a road by a platform', [18, 12, 15, 4]],
    ['dog', '一只狗沿草地上的小径奔跑', 'A dog on a path through a field', [9, 3, 13, 4]],
    ['robot-cart', '一辆仓库搬运机器人沿通道行驶', 'A warehouse robot along an aisle', [12, 7, 10, 1]]
  ]) averageSpeed(group, 0, bi(zh, en), row, purpose || 'followup');
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
  globalThis.EachVeyaLessons = { roundIds, workshops };
})();
