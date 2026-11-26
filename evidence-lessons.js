(function () {
  'use strict';
  const { questions, bilingual: bi } = globalThis.SmartStudyData;
  const AI = globalThis.EachVeyaAi;
  const { decorateEquation } = globalThis.EachVeyaSkills;
  const byId = new Map(questions.map(q => [q.id, q]));
  const items = [];
  const workshops = {
    math: 'equationLesson', english: 'readingLesson', physics: 'speedLesson',
    chemistry: 'massDensityLesson', biology: 'populationDensityLesson'
  };

  function equation(group, index, a, b, x, context, purpose = 'lesson', presentation = '') {
    const spec = { level: 'L2', form: 'plain', a, b, c: 0, d: a * x + b, distractors: [x - 1, x + 1, x + 2] };
    const checked = AI.normalizeSpec(spec, 'L2');
    if (!checked) throw new Error('Invalid lesson equation');
    const q = decorateEquation(AI.makeQuestion({ ...checked, format: 'calculation' }), checked);
    const displayedEquation = presentation === 'sides-swapped' ? `${spec.d} = ${a}x − ${Math.abs(b)}`
      : presentation === 'constant-first' ? `${b} − ${Math.abs(a)}x = ${spec.d}` : '';
    const contextualize = lang => context[lang] + '\n' + (displayedEquation ? q.prompt[lang].split('\n')[0] + '\n' + displayedEquation : q.prompt[lang]);
    q.prompt = bi(contextualize('zh'), contextualize('en'));
    if (presentation) q.equationPresentation = presentation;
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
  equation('card-boxes', 0, 5, -4, 7, bi('5 盒卡片，每盒 x 张。送出 4 张后，还剩 31 张。',
    'Five boxes contain x cards each. After four cards are given away, 31 cards remain.'), 'followup', 'sides-swapped');
  equation('water-tank', 0, -4, 36, 5, bi('水箱原有 36 升水，取了 4 次，每次取 x 升，还剩 16 升。',
    'A tank starts with 36 litres of water. Four draws of x litres each leave 16 litres.'), 'followup', 'constant-first');

  // Fresh L2 probes use the same two steps as the workshop, in three written forms.
  for (const [group, a, b, x, presentation] of [
    ['probe-standard', 3, 8, 9, ''], ['probe-reversed', 7, -3, 6, 'sides-swapped'],
    ['probe-constant', -5, 52, 7, 'constant-first'],
    ['retake-standard', 5, 7, 6, ''], ['retake-reversed', 8, -7, 6, 'sides-swapped'],
    ['retake-constant', -6, 75, 9, 'constant-first']
  ]) equation(group, 0, a, b, x, bi('按顺序填出两步。', 'Complete both steps in order.'), 'equation-check', presentation);

  function evidence(group, index, passage, ask, answer, explanation, purpose = 'lesson') {
    const sentences = passage.match(/[^.!?]+[.!?]/g)?.map(s => s.trim());
    if (sentences?.length !== 4 || sentences.join(' ') !== passage || !sentences[answer]) throw new Error('Invalid reading passage ' + group);
    const evidenceType = /^who\b/i.test(ask.en) ? 'person' : /^where\b/i.test(ask.en) ? 'place' :
      /^(when|what time|on which day)\b/i.test(ask.en) ? 'time' : /^why\b/i.test(ask.en) ? 'reason' : 'detail';
    items.push({
      id: 'lesson-evidence-' + group + '-' + index, subject: 'english', topic: 'reading', track: 'cefr', level: 'A1',
      focusOnly: true, lessonGroup: group, passageId: 'reading-' + group, purpose, focus: ['text-evidence'],
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
      const { evidenceQuote, evidenceType, focus } = items.at(-1);
      Object.assign(source, {
        evidenceQuote, evidenceType, focus, readingEvidence: true,
        errors: Object.fromEntries(source.options.flatMap((_, index) => index === source.answer ? [] : [[index, 'text-evidence']]))
      });
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

  function calculation(subject, topic, group, index, purpose, prompt, fields, stepHints, explanation, stepMethod) {
    items.push({
      id: 'lesson-' + (subject === 'physics' ? 'speed' : topic) + '-' + group + '-' + index,
      subject, topic, level: 'L2', skill: 'calculation', curriculumRefs: [], focusOnly: true, lessonGroup: group,
      purpose, focus: [topic], format: 'calculation', prompt, fields, stepHints, hint: stepHints[0], explanation, stepMethod
    });
  }

  function averageSpeed(group, index, context, [first, stop, last, speed], purpose = 'lesson') {
    const total = first + stop + last;
    const distance = total * speed;
    const prompt = bi(`${context.zh}，先移动 ${first} 秒，停留 ${stop} 秒，再移动 ${last} 秒。全程走过 ${distance} 米。求从出发到结束的总用时和平均速率。`,
      `${context.en} moves for ${first} s, stops for ${stop} s and then moves for ${last} s. It covers ${distance} m in all. Find the total elapsed time and the average speed from start to finish.`);
    const explanation = bi(`总用时为 ${first} + ${stop} + ${last} = ${total} 秒。平均速率为 ${distance} ÷ ${total} = ${speed} m/s。`,
        `The total elapsed time is ${first} + ${stop} + ${last} = ${total} s. The average speed is ${distance} ÷ ${total} = ${speed} m/s.`);
    calculation('physics', 'average-speed', group, index, purpose, prompt, [
      { label: bi('第 1 步 · 总用时 = □ s', 'Step 1 · Total elapsed time = □ s'), expected: total },
      { label: bi('第 2 步 · 平均速率 = □ m/s', 'Step 2 · Average speed = □ m/s'), expected: speed }
    ], [
      bi('计时从出发到结束。把两段行进的秒数和中间停留的秒数都加起来。',
        'The clock runs from start to finish. Add both moving times and the time spent stopped.'),
      bi('总用时已经算对。用总路程（米）除以这个总用时（秒），得到每秒走了多少米。',
        'Your elapsed time is correct. Divide the total distance in metres by that time in seconds to get metres per second.')
    ], explanation);
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

  const operations = {
    sum: { solve: (a, b) => a + b, symbol: '+' },
    difference: { solve: (a, b) => a - b, symbol: '−' },
    product: { solve: (a, b) => a * b, symbol: '×' }
  };

  function densityPractice(subject, topic, units, labels, finalHint, families) {
    const [firstUnit, numeratorUnit, answerUnit] = units;
    const unitsForInput = [firstUnit, answerUnit];
    for (const { method, stem, hint, lessons, followups, transfer } of families) {
      const { solve, symbol } = operations[method];
      const add = (group, index, [a, b, rate], purpose) => {
        const intermediate = solve(a, b);
        const numerator = intermediate * rate;
        const prompt = stem(a, b, numerator);
        const explanation = bi(`${labels[0].zh}为 ${a} ${symbol} ${b} = ${intermediate} ${firstUnit}。${labels[1].zh}为 ${numerator} ÷ ${intermediate} = ${rate} ${answerUnit}。`,
          `${labels[0].en}: ${a} ${symbol} ${b} = ${intermediate} ${firstUnit}. ${labels[1].en}: ${numerator}${numeratorUnit} ÷ ${intermediate} ${firstUnit} = ${rate} ${answerUnit}.`);
        const fields = labels.map((label, i) => ({
          label: bi(`第 ${i + 1} 步 · ${label.zh} = □ ${unitsForInput[i]}`, `Step ${i + 1} · ${label.en} = □ ${unitsForInput[i]}`),
          expected: i === 0 ? intermediate : rate
        }));
        calculation(subject, topic, group, index, purpose, prompt, fields, [hint, finalHint], explanation, method);
      };
      lessons.forEach((row, i) => add(method, i, row, 'lesson'));
      followups.forEach((row, i) => add(`${method}-check-${i + 1}`, 0, row, 'followup'));
      if (transfer) add(`${method}-transfer`, 0, transfer, 'transfer');
    }
  }

  densityPractice('chemistry', 'mass-density', ['cm³', ' g', 'g/cm³'], [bi('样品体积', 'Sample volume'), bi('质量密度', 'Mass density')],
    bi('体积已经算对。用样品质量除以样品体积，确认单位是 g/cm³。', 'Your volume is correct. Divide the sample mass by its volume to get g/cm³.'), [
    { method: 'difference', stem: (after, before, mass) => bi(
      `一份模拟测量记录显示：样品完全浸没前读数为 ${before} mL，浸没后为 ${after} mL。样品质量为 ${mass} g。求样品体积和质量密度。1 mL = 1 cm³。`,
      `A simulated measurement reads ${before} mL before a sample is fully submerged and ${after} mL afterward. The sample mass is ${mass} g. Find its volume and mass density. 1 mL = 1 cm³.`),
      hint: bi('取浸没后和浸没前两个读数的差。两次读数都包含原来的液体。', 'Subtract the initial reading from the final reading. Both readings include the original liquid.'),
      lessons: [[18, 12, 2], [27, 19, 3], [38, 23, 4], [33, 21, 2]],
      followups: [[31, 20, 3], [48, 32, 2]], transfer: [53, 39, 5] },
    { method: 'product', stem: (base, height, mass) => bi(
      `一块均匀的柱形样品底面积为 ${base} cm²，高 ${height} cm，质量为 ${mass} g。求样品体积和质量密度。`,
      `A uniform prism has a base area of ${base} cm², a height of ${height} cm and a mass of ${mass} g. Find its volume and mass density.`),
      hint: bi('用底面积乘以高。面积用 cm²，高用 cm，相乘得 cm³。', 'Multiply the base area by the height. Multiplying cm² by cm gives cm³.'),
      lessons: [[5, 3, 2], [6, 4, 3], [8, 2, 4], [9, 3, 2]],
      followups: [[7, 4, 2], [11, 3, 3]] },
    { method: 'sum', stem: (first, second, mass) => bi(
      `同一种均匀材料制成的两块样品，体积分别为 ${first} cm³ 和 ${second} cm³，总质量为 ${mass} g。求两块的总体积和这种材料的质量密度。`,
      `Two pieces of the same uniform material have volumes of ${first} cm³ and ${second} cm³, with a combined mass of ${mass} g. Find their combined volume and the material's mass density.`),
      hint: bi('题目给的是两块的总质量，所以先把两块样品的体积相加。', 'The mass covers both pieces, so add both volumes before dividing.'),
      lessons: [[4, 9, 2], [8, 9, 3], [7, 13, 4], [14, 8, 2]],
      followups: [[12, 11, 2], [16, 10, 3]], transfer: [17, 13, 4] }
  ]);

  densityPractice('biology', 'population-density', ['m²', '', 'm⁻²'], [bi('实际调查面积', 'Surveyed area'), bi('样本中的计数密度', 'Count density in the sample')],
    bi('调查面积已经算对。用在这些样方里数到的总株数除以实际调查面积，得到每平方米的株数。',
      'Your surveyed area is correct. Divide the total plants counted in those plots by their total area to get plants per square metre.'), [
    { method: 'sum', stem: (first, second, count) => bi(
      `在两个互不重叠的样方中统计三叶草。样方面积分别为 ${first} m² 和 ${second} m²，合计数到 ${count} 株。求实际调查面积和样本中的计数密度。`,
      `Two non-overlapping plots of ${first} m² and ${second} m² contain ${count} clover plants in total. Find the surveyed area and the count density in the sample.`),
      hint: bi('把两个互不重叠的样方面积相加，得到总株数所对应的面积。', 'Add the areas of the two non-overlapping plots to match the combined count.'),
      lessons: [[2, 5, 3], [3, 6, 4], [7, 4, 2], [5, 8, 3]],
      followups: [[6, 9, 3], [7, 10, 4]] },
    { method: 'product', stem: (plots, area, count) => bi(
      `调查者查看 ${plots} 个不重叠的样方，每个样方 ${area} m²，共数到 ${count} 株蒲公英。求实际调查面积和样本中的计数密度。`,
      `A survey covers ${plots} non-overlapping plots, each ${area} m², with ${count} dandelion plants counted in total. Find the surveyed area and the count density in the sample.`),
      hint: bi('每个样方一样大。用样方个数乘以单个样方的面积。', 'The plots have equal areas. Multiply the number of plots by the area of one plot.'),
      lessons: [[3, 2, 3], [4, 2, 4], [3, 4, 2], [5, 3, 3]],
      followups: [[4, 5, 2], [5, 4, 3]], transfer: [6, 2, 4] },
    { method: 'difference', stem: (whole, skipped, count) => bi(
      `一片 ${whole} m² 的草地内，有 ${skipped} m² 未调查。调查者只在其余部分共数到 ${count} 株车前草。求实际调查面积和样本中的计数密度。`,
      `In a ${whole} m² field, ${skipped} m² was left unsurveyed. The survey counted ${count} plantain plants in the remaining area. Find the surveyed area and the count density in the sample.`),
      hint: bi('只使用数过植株的那部分面积。从整片面积中减去未调查的面积。', 'Use only the area where plants were counted. Subtract the area that was left unsurveyed.'),
      lessons: [[16, 4, 2], [23, 7, 3], [24, 9, 2], [27, 6, 4]],
      followups: [[31, 11, 2], [35, 12, 3]], transfer: [39, 12, 4] }
  ]);
  questions.push(...items);

  // These pairs illustrate the change in demand within one topic. They can be
  // previewed before answering, so they are kept out of placement and adaptive evidence.
  const starterPairs = {};
  const same = value => bi(value, value);
  function starter(subject, topic, level, skill, task, prompt, options, answer, explanation) {
    const id = 'starter-' + subject + '-' + level;
    const item = { id, subject, topic, level, purpose: 'starter', focusOnly: true, skill, curriculumRefs: [],
      ...(subject === 'english' ? { track: 'cefr' } : {}), task, prompt, options, answer, explanation };
    (starterPairs[subject] ||= []).push(item);
    questions.push(item);
  }

  starter('math', 'algebra', 'L1', 'calculation', bi('还原一个数', 'Undo one operation'),
    bi('一个数加上 7 等于 19。这个数是多少？', 'A number plus 7 equals 19. What is the number?'),
    ['7','12','19','26'].map(same), 1,
    bi('从 19 减去多出的 7，得到 12。代回去检验，12 + 7 = 19。', 'Subtract 7 from 19 to get 12. Check by adding it back: 12 + 7 = 19.'));
  starter('math', 'algebra', 'L2', 'application', bi('从总价列方程', 'Build an equation from a total'),
    bi('3 本同价笔记本加一个 4 元的文件夹，共 25 元。设每本笔记本 x 元，哪个方程正确？',
      'Three equally priced notebooks and a 4-yuan folder cost 25 yuan altogether. If a notebook costs x yuan, which equation fits?'),
    ['3(x + 4) = 25','x + 3 + 4 = 25','3x + 4 = 25','4x + 3 = 25'].map(same), 2,
    bi('三本笔记本共 3x 元，文件夹只买了一个，所以只加一次 4。每本 7 元时，3 × 7 + 4 = 25。',
      'The notebooks cost 3x together. Add 4 once for the single folder. At 7 yuan each, 3 × 7 + 4 = 25.'));
  starter('physics', 'average-speed', 'L1', 'application', bi('认出速率单位', 'Identify a speed unit'),
    bi('体育课记录百米跑的路程和用时。用米记录路程、用秒记录时间，平均速率用哪个单位？',
      'A PE class records a sprint distance in metres and the time in seconds. Which unit gives the average speed?'),
    ['m','s','m·s','m/s'].map(same), 3,
    bi('平均速率等于路程除以时间，因此单位是米每秒（m/s）。', 'Average speed is distance divided by time, so the unit is metres per second (m/s).'));
  starter('physics', 'average-speed', 'L2', 'reasoning', bi('判断计时范围', 'Decide which time counts'),
    bi('小宁骑车 8 分钟，停车 2 分钟，再骑 5 分钟。求从出发到抵达的平均速率，总路程应除以多长时间？',
      'A cyclist rides for 8 minutes, stops for 2, then rides for 5. Which time divides the total distance to give average speed from departure to arrival?'),
    ['10 min','13 min','15 min','5 min'].map(same), 2,
    bi('从出发到抵达经过 8 + 2 + 5 = 15 分钟。停车时路程不增加，但时间仍在走。',
      'The whole trip takes 8 + 2 + 5 = 15 minutes. During the stop, distance stays the same while time passes.'));
  starter('chemistry', 'mass-percentage', 'L1', 'application', bi('分清溶质和溶剂', 'Identify the solute'),
    bi('把 5 克食盐完全溶在 95 克水中。这杯盐水里的溶质是什么？',
      'Five grams of table salt dissolve completely in 95 grams of water. What is the solute?'),
    [bi('食盐','Salt'),bi('水','Water'),bi('盐水','Salt solution'),bi('烧杯','Beaker')], 0,
    bi('被溶解的食盐是溶质，用来溶解食盐的水是溶剂。', 'Salt is the substance being dissolved, so it is the solute. Water is the solvent.'));
  starter('chemistry', 'mass-percentage', 'L2', 'reasoning', bi('选出百分比的分母', 'Choose the mass in the denominator'),
    bi('把 10 克糖完全溶在 90 克水中，没有质量损失。哪个算式表示糖的质量百分比？',
      'Ten grams of sugar dissolve in 90 grams of water with no mass lost. Which expression gives the sugar percentage by mass?'),
    ['10/90 × 100%','90/100 × 100%','90/10 × 100%','10/100 × 100%'].map(same), 3,
    bi('分母是整杯糖水的质量，即 10 + 90 = 100 克。糖占 10/100 × 100% = 10%。',
      'Use the mass of the entire solution as the denominator: 10 + 90 = 100 g. Sugar makes up 10% by mass.'));
  starter('biology', 'plant-energy', 'L1', 'application', bi('辨认光合原料', 'Recognise a photosynthesis input'),
    bi('一片绿叶在光照下进行光合作用。它利用空气中的哪种气体合成糖？',
      'A green leaf is photosynthesising in the light. Which gas from the air does it use to make sugars?'),
    [bi('氧气','Oxygen'),bi('氮气','Nitrogen'),bi('二氧化碳','Carbon dioxide'),bi('氦气','Helium')], 2,
    bi('光合作用利用光能，把二氧化碳和水转化为糖，并释放氧气。',
      'Photosynthesis uses light energy to make sugars from carbon dioxide and water, releasing oxygen.'));
  starter('biology', 'plant-energy', 'L2', 'reasoning', bi('比较有光与遮光的叶片', 'Interpret a light comparison'),
    bi('一株植物先在暗处耗尽叶中淀粉，再把同一片绿叶的一半遮光，另一半照光。稍后只有照光部分检出淀粉。这一结果支持哪种解释？',
      'After a plant is destarched in the dark, half of one green leaf is covered and the other half is lit. Later only the lit half tests positive for starch. Which explanation fits?'),
    [bi('遮光会增加淀粉','Covering the leaf increases starch'),bi('光照有助于叶片积累淀粉','Light helps the leaf accumulate starch'),
      bi('两部分一定含有相同质量的淀粉','Both halves must contain equal masses of starch'),bi('叶片只在暗处合成淀粉','Leaves make starch only in darkness')], 1,
    bi('比较的是同一片叶的两部分，开始时都没有可检出的淀粉。只有照光部分积累了可检出的淀粉，支持光照起作用。',
      'The two halves started with no detectable starch. Only the lit half accumulated detectable starch, supporting a role for light.'));
  starter('english', 'reading', 'A1', 'application', bi('从通知找时间', 'Find a time in a notice'),
    bi('读通知：“Art club starts at 4:15 on Friday.” 美术社几点开始？',
      'Read the notice: “Art club starts at 4:15 on Friday.” What time does the club start?'),
    ['3:45','4:00','4:15','5:15'].map(same), 2,
    bi('starts at 后面直接给出开始时间 4:15。Friday 说的是星期几。', 'The words “starts at” introduce the time, 4:15. Friday tells you the day.'));
  starter('english', 'reading', 'A2', 'reasoning', bi('读懂地点变更', 'Follow a change of place'),
    bi('读留言：“We usually meet in the gym. Today it is closed, so meet outside the library instead.” 今天应在哪里集合？',
      'Read the message: “We usually meet in the gym. Today it is closed, so meet outside the library instead.” Where should you meet today?'),
    [bi('体育馆里','Inside the gym'),bi('图书馆外','Outside the library'),bi('图书馆里','Inside the library'),bi('体育馆外','Outside the gym')], 1,
    bi('usually 提到平时的地点。instead 表示今天改到别处，outside the library 指图书馆外。',
      '“Usually” introduces the old arrangement. “Instead” signals the change, and “outside the library” names today’s meeting place.'));

  function roundIds(state, subject) {
    const last = new Map();
    state.attempts.forEach((attempt, index) => last.set(attempt.questionId, index));
    const ranked = questions.filter(q => !q.retired && q.subject === subject && q.purpose === 'lesson')
      .sort((a,b) => (last.get(a.id) ?? -1) - (last.get(b.id) ?? -1));
    const groups = new Set();
    return ranked.filter(q => {
      if (groups.has(q.lessonGroup)) return false;
      groups.add(q.lessonGroup);
      return true;
    }).map(q => q.id);
  }
  globalThis.EachVeyaLessons = { roundIds, workshops, starterPairs };
})();
