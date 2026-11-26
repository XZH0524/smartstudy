(function () {
  'use strict';
  const { questions, bilingual: bi } = globalThis.SmartStudyData;
  const same = value => bi(value, value);
  const sets = [];

  function add(id, subject, topic, stage, level, title, body, items, revision = {}) {
    const material = { title, body };
    const entries = items.map(({ prompt, explanation, ...answer }, index) => ({
      id: 'school-' + id + '-' + (index + 1), subject, topic, level, prompt, explanation, material,
      schoolSet: id, focusOnly: true, skill: answer.fields ? 'calculation' : 'reasoning', curriculumRefs: [],
      ...(subject === 'english' ? { track: 'cefr', ...(topic === 'reading' ? { passageId: 'school-' + id } : {}) } : {}),
      ...answer
    }));
    const current = entries.map((question, index) => {
      const changes = revision[index + 1];
      if (!changes) return { ...question, focusOnly: false, reviewedSchool: true };
      questions.push({ ...question, retired: true });
      return { ...question, ...changes, id: question.id + '@2', originalId: question.id, version: 2,
        focusOnly: false, reviewedSchool: true };
    });
    questions.push(...current);
    sets.push({ id, subject, stage, level, title, ids: current.map(question => question.id) });
  }

  function choice(prompt, options, answer, explanation) {
    return { prompt: same(prompt), options: options.map(same), answer, explanation };
  }

  function fill(prompt, explanation, fields, type) {
    return { prompt, explanation, format: fields.length > 1 ? 'calculation' : 'fill',
      fields: fields.map(([zh, en, expected]) => ({ label: bi(zh, en), expected, ...(type ? { type } : {}) })) };
  }

  add('repair', 'english', 'reading', 'junior', 'A2', bi('修理午间角', 'The Lunch Repair Corner'), same(
    'When Ava broke the zip on her pencil case, she planned to buy another one. On Tuesday, however, she noticed a sign outside the art room: “Repair Corner, Thursday lunchtime. Bring one small item.” She decided to wait.\n\n' +
    'On Thursday, an older student showed Ava how to sew a small button next to the broken zip. The button held the case shut. “It does not have to look new,” the student said. “It just has to work.” Another visitor, Ben, brought a toy car. There were no spare wheels, so he made one from a bottle cap.\n\n' +
    'At first the teachers expected only a few visitors, but nearly twenty students came. Next month, they plan to put a box outside the art room for spare buttons, string and caps. Students can leave useful things there even if they cannot attend at lunchtime.'
  ), [
    choice('Why did Ava decide to wait before buying a new pencil case?', ['The shop was closed.', 'She saw a notice about a repair session.', 'A teacher gave her a new case.', 'Ben offered her a toy car.'], 1,
      bi('第一段说她看到修理活动海报，因此决定等到周四。', 'The notice announced a repair session on Thursday, and Ava decided to wait.')),
    choice('What did Ben use for a wheel?', ['A zip.', 'A button.', 'A bottle cap.', 'A piece of string.'], 2,
      bi('第二段最后一句指出 Ben 用瓶盖做轮子。', 'The second paragraph says he made a wheel from a bottle cap.')),
    choice('What can students do if they cannot attend at lunchtime next month?', ['Leave useful materials in a box.', 'Send their broken items to a shop.', 'Join an extra Tuesday session.', 'Borrow a toy from the art room.'], 0,
      bi('最后一段说明不能到场的学生也可把材料投进收集箱。', 'The last sentence says students can leave supplies even if they cannot attend.')),
    choice('What is the main idea of the passage?', ['Old toys are worth a lot of money.', 'Art lessons should last longer.', 'Schools should stop using buttons.', 'Students find simple ways to make broken things useful again.'], 3,
      bi('全文用两个修理故事和后续计划说明小物品可以修好继续用。', 'The two repairs and the supply-box plan show how students keep broken things useful.'))
  ]);

  add('library', 'english', 'reading', 'junior', 'A2', bi('图书馆送书车', 'Books on Wheels'), same(
    'Last spring, the town library sent a book cart to Lake Park every Saturday. It carried fifty books, and visitors could borrow two at a time. Volunteers first parked it near the main gate. Many people passed it there, but few stopped.\n\n' +
    'Nora, a volunteer, asked several parents about the cart. Most were hurrying toward the playground and did not want to carry books while their children played. The following week, she moved the cart next to the playground and put three chairs beside it. Children began reading while their parents rested.\n\n' +
    'By June, the cart was lending nearly twice as many books each weekend as it had near the gate. Nora did not buy extra books. Instead, she asked visitors what they wanted and changed half the books each Saturday. The library will try the same idea at another park next spring.'
  ), [
    choice('Where was the cart at first?', ['At the playground.', 'Inside the library.', 'Beside the lake.', 'Near the main gate.'], 3,
      bi('第一段交代了送书车起初停在公园正门附近。', 'The first paragraph gives the main gate as its first location.')),
    choice('Why did many parents pass the cart without stopping?', ['They already had library books.', 'They were on their way to the playground.', 'They could only borrow one book.', 'The books were all for adults.'], 1,
      bi('家长急着去游乐场，也不愿在孩子玩耍时拿着书。', 'The parents were hurrying to the playground and did not want to carry books while the children played.')),
    choice('How did Nora change the selection of books?', ['She bought new books each weekend.', 'She kept only the five most popular books.', 'She changed half the books based on visitors’ requests.', 'She took away all the children’s books.'], 2,
      bi('最后一段说明 Nora 征求读者意见，并在每个周六换掉一半的书。', 'Nora asked what visitors wanted and changed half of the books each Saturday.')),
    choice('What lesson does the story suggest?', ['A service can improve when it fits people’s habits.', 'A service needs more supplies to succeed.', 'Most families prefer to read at home.', 'A busy location always works best.'], 0,
      bi('正门人流量大却不适合停留。搬到游乐场旁后，服务才适应家庭的活动习惯。', 'A convenient place to stop and a useful selection mattered more than heavy foot traffic.'))
  ]);

  add('shade', 'english', 'reading', 'senior', 'B1', bi('两条上学路', 'Two Routes to School'), same(
    'The student council wanted to recommend a cooler walking route to school during hot weather. An online map showed that Oak Street was shorter than Canal Road by about two minutes. Several students assumed that it would also be more comfortable, since a shorter trip meant less time outside.\n\n' +
    'To test that idea, two groups walked the routes at the same time on five sunny afternoons. Each group used the same kind of thermometer and followed the same pace. Oak Street had almost no trees, while most of Canal Road ran under trees. The groups swapped routes halfway through the week so that the results would not depend on which group took the readings. On all five days, Canal Road felt cooler to most walkers, even though the air-temperature readings were often close.\n\n' +
    'The council pointed out that a thermometer reading alone does not describe what a walker experiences. Direct sunlight can warm the skin even when the air temperature is similar. It recommended Canal Road for hot, sunny days, but kept Oak Street on the map as the quicker route when shade was less important.'
  ), [
    choice('What assumption did some students make at the beginning?', ['The two roads were equally long.', 'The shorter walk would feel more comfortable.', 'The tree-covered road would take less time.', 'The thermometers would give different readings.'], 1,
      bi('第一段把“少在户外两分钟”和“更舒服”联系起来，正是他们要检验的假设。', 'They assumed that spending less time outdoors would make the walk more comfortable.')),
    choice('Why did the groups swap routes?', ['To keep one group from affecting the comparison.', 'To avoid walking at the same pace.', 'To collect readings on a rainy day.', 'To make both routes take two minutes.'], 0,
      bi('换组可减少不同组的测量方式对结果造成的影响。', 'Swapping reduces the chance that the result is caused by differences between the groups.')),
    choice('What did the measurements and reports show together?', ['The shorter route always had cooler air.', 'The longer route was cooler only when the air reading was lower.', 'Walkers could feel a difference despite similar air readings.', 'People reported identical experiences on the two roads.'], 2,
      bi('第二段说读数常接近，但多数人仍觉得 Canal Road 更凉快。', 'The air readings were often close, yet most walkers found Canal Road cooler.')),
    choice('Which title best reflects the writer’s main point?', ['Why Oak Street Should Be Closed', 'A Guide to Buying Thermometers', 'Five Ways to Walk Faster', 'Choosing a Walking Route Takes More Than Measuring Distance'], 3,
      bi('文章通过比较说明，选路还要考虑遮阴和行走体验。', 'The comparison shows that distance alone misses factors like shade and comfort.'))
  ]);

  add('museum', 'english', 'reading', 'senior', 'B2', bi('博物馆的慢路线', 'A Slower Route through the Museum'), same(
    'On busy Saturdays, visitors to a small city museum hurried past most objects and formed a queue in front of a famous painting. The museum’s director had expected the painting to draw attention. What surprised her was how little visitors remembered about anything else. In brief exit interviews, many could name the painting, but struggled to describe a second object.\n\n' +
    'A curator proposed a “slow route”: instead of sending visitors from one famous object to another, a free card would ask them to spend several minutes looking closely at three ordinary pieces. One prompt asked which marks on a clay bowl might have been left by its maker. Another invited visitors to compare how two everyday tools had been repaired. The prompts were deliberately open; the curator wanted visitors to test an idea against what they could see.\n\n' +
    'After six weeks, interviews showed that card users could describe more details. This did not prove that the card caused the difference, because visitors chose whether to pick one up. People already interested in looking closely might have been more likely to use it. The museum plans to hand cards to every other visitor next month and repeat the interviews before deciding whether to make the route permanent.'
  ), [
    choice('What problem led the museum to try a slow route?', ['The famous painting attracted too few visitors.', 'The museum had too few everyday objects.', 'Visitors remembered little about the other exhibits.', 'Exit interviews took too much time.'], 2,
      bi('第一段说许多人只记住名画，无法描述另一件展品。', 'Many interviewees remembered the painting but could not describe another exhibit.')),
    choice('Why were the card prompts deliberately open?', ['To see how quickly visitors could leave.', 'To let visitors form and test ideas using visible details.', 'To give visitors the single correct explanation.', 'To encourage visitors to read more labels.'], 1,
      bi('第二段最后一句说明，策展人希望参观者用观察到的细节检验想法。', 'The curator wanted visitors to compare their ideas with evidence from the objects.')),
    choice('What limited the conclusion after six weeks?', ['Visitors selected themselves into the card group.', 'The museum did not ask about exhibit details.', 'The prompts changed every Saturday.', 'All visitors received a card.'], 0,
      bi('领卡由参观者自己决定，两组原本对细看展品的兴趣可能不同。', 'People chose whether to take a card, so the groups could already differ in interest.')),
    choice('Why will the museum offer a card to every other visitor?', ['To shorten the painting queue.', 'To replace the old exit interviews.', 'To reduce the effect of who chooses to take a card.', 'To remove all choices from the museum visit.'], 2,
      bi('按顺序轮流发卡可减轻发卡对象完全由个人兴趣决定的问题。', 'Alternating offers reduces the role of visitors’ initial interest in who receives a card.'))
  ]);

  const gardenTitle = bi('校园菜园', 'The School Garden');
  const gardenBody = 'Our school garden (1) ___ (open) last April. Every Friday, our science teacher (2) ___ (bring) a group there after lunch. The taller plants grow next (3) ___ the wall. Last week we grew enough beans (4) ___ (share) with another class.';
  const revisedGarden = { material: { title: gardenTitle, body: same(gardenBody.replace('Our school garden (1) ___ (open)', 'Our school (1) ___ (open) a garden')) } };
  add('garden', 'english', 'grammar', 'junior', 'A2', gardenTitle, same(
    gardenBody
  ), [
    fill(bi('填第 1 空，用 open 的适当形式。', 'Fill blank 1 with the correct form of open.'), bi('last April 是过去时间，用 opened。','“Last April” calls for the past simple “opened”.'), [['□','□','opened']], 'text'),
    fill(bi('填第 2 空，用 bring 的适当形式。', 'Fill blank 2 with the correct form of bring.'), bi('Every Friday 表示习惯，单数主语对应 brings。','The regular action takes “brings” with a singular subject.'), [['□','□','brings']], 'text'),
    fill(bi('填第 3 空，补一个介词。', 'Fill blank 3 with a preposition.'), bi('next to 表示在……旁边。','“Next to” means beside.'), [['□','□','to']], 'text'),
    fill(bi('填第 4 空，用 share 的适当形式。', 'Fill blank 4 with the correct form of share.'), bi('enough + 名词 + to do 表示足够做某事。','“Enough” plus the noun can be followed by the infinitive “to share”.'), [['□','□','to share']], 'text')
  ], {
    1: { ...revisedGarden, prompt: bi('填第 1 空，用 open 的一般过去时。', 'Fill blank 1 with the past simple form of open.') },
    2: revisedGarden,
    3: revisedGarden,
    4: { ...revisedGarden,
      prompt: bi('填第 4 空，用 to 加 share 的适当形式。', 'Fill blank 4 with to and the correct form of share.') }
  });

  add('journals', 'english', 'grammar', 'senior', 'B1', bi('观鸟日志', 'The Bird Journal'), same(
    'In May, a group of students set out (1) ___ (record) the birds in their neighbourhood. The first photographs (2) ___ (take) from the school roof last Friday. The team now meets (3) ___ (regular) to compare its records. The project has changed the way (4) ___ which the students notice their surroundings.'
  ), [
    fill(bi('填第 1 空，用 record 的适当形式。','Fill blank 1 with the correct form of record.'),bi('set out to do 表示着手做某事。','“Set out to do” means to start with that aim.'),[['□','□','to record']],'text'),
    fill(bi('填第 2 空，用 take 的适当形式。','Fill blank 2 with the correct form of take.'),bi('照片是被拍摄的，last Friday 指过去，用 were taken。','The plural photographs were acted on in the past: “were taken”.'),[['□','□','were taken']],'text'),
    fill(bi('填第 3 空，用 regular 的适当形式。','Fill blank 3 with the correct form of regular.'),bi('修饰动词 meets，用副词 regularly。','The verb “meets” is modified by the adverb “regularly”.'),[['□','□','regularly']],'text'),
    fill(bi('填第 4 空，补一个介词。','Fill blank 4 with a preposition.'),bi('the way in which 表示方式。','The fixed construction is “the way in which”.'),[['□','□','in']],'text')
  ], { 2: { prompt: bi('填第 2 空，用 be 和 take 构成一般过去时的被动形式。', 'Fill blank 2 with the past simple passive of take, using be.') } });

  function number(zh, en, expected, reasonZh, reasonEn, unit = '') {
    const label = unit ? '□ ' + unit : '□';
    return fill(bi(zh, en), bi(reasonZh, reasonEn), [[label, label, expected]]);
  }

  add('ticket-sales', 'math', 'algebra', 'junior', 'L2', bi('售票总价与一元一次方程', 'Ticket sales and linear equations'), bi(
    '学校演出共卖出 18 张票。学生票每张 6 元，成人票每张 10 元，总收入 132 元。',
    'A school show sold 18 tickets. Student tickets cost 6 yuan each and adult tickets cost 10 yuan each. Total revenue was 132 yuan.'
  ), [
    number('如果 18 张全是学生票，总收入是多少？', 'How much would all 18 tickets earn at the student price?', 108, '18 × 6 = 108 元。', '18 × 6 = 108 yuan.', 'CNY'),
    fill(bi('设成人票卖出 x 张，将收入方程化为 ax = b，填写 a 和 b。','Let x be the number of adult tickets. Rewrite the revenue equation as ax = b. Enter a and b.'),
      bi('6(18 − x) + 10x = 132，展开并减去 108，得到 4x = 24。','Expand 6(18 − x) + 10x = 132 and subtract 108 from both sides to get 4x = 24.'),
      [['a = □','a = □',4],['b = □','b = □',24]]),
    number('卖出了多少张成人票？', 'How many adult tickets were sold?', 6, '4x = 24，所以 x = 6。检验：12 × 6 + 6 × 10 = 132。', '4x = 24 gives x = 6. Check: 12 × 6 + 6 × 10 = 132.')
  ], { 2: { prompt: bi('设成人票卖出 x 张。展开 6(18 − x) + 10x = 132，合并 x 项，再将 108 移到右边。填写所得 ax = b 的 a、b。',
    'Let x be the number of adult tickets. Expand 6(18 − x) + 10x = 132, combine the x terms and subtract 108 from both sides. Enter a and b in the resulting ax = b.') } });

  add('fountain', 'math', 'functions', 'senior', 'L4', bi('二次函数与抛物线', 'Quadratic functions and a parabola'), bi(
    '一股喷泉的水沿抛物线运动。距出水口的水平距离为 x 米时，水流离地高度为 h(x) = −x² + 6x 米，其中 0 ≤ x ≤ 6。',
    'A fountain jet follows a parabola. Its height in metres is h(x) = −x² + 6x, where x is the horizontal distance in metres from the nozzle and 0 ≤ x ≤ 6.'
  ), [
    number('当 x = 1 时，水流高度是多少？', 'What is the height when x = 1?', 5, '代入 x = 1，得 −1 + 6 = 5。', 'Substitute x = 1: −1 + 6 = 5.', 'm'),
    fill(bi('用配方法写成 h(x) = −(x − p)² + q，求 p、q。','Complete the square to write h(x) = −(x − p)² + q. Find p and q.'),
      bi('−x² + 6x = −(x² − 6x + 9) + 9 = −(x − 3)² + 9。','−x² + 6x = −(x² − 6x + 9) + 9 = −(x − 3)² + 9.'),
      [['p = □','p = □',3],['q = □','q = □',9]]),
    number('水流高度为 8 米时，两个对应位置的水平距离相差多少米？', 'At height 8 m, how far apart are the two horizontal positions?', 2,
      '令 −(x − 3)² + 9 = 8，得 x = 2 或 4，相差 2 米。', 'Solving −(x − 3)² + 9 = 8 gives x = 2 and x = 4, a separation of 2 m.', 'm')
  ]);

  add('resistor', 'physics', 'ohmic-current', 'junior', 'L3', bi('伏安数据与电阻', 'Voltage, current and resistance'), bi(
    '某定值电阻温度保持不变。三次测量如下。\n电压 U（V）：1.5、3.0、4.5\n电流 I（A）：0.15、0.30、0.45',
    'A fixed resistor stays at a constant temperature. Three pairs of readings were recorded.\nVoltage U (V): 1.5, 3.0, 4.5\nCurrent I (A): 0.15, 0.30, 0.45'
  ), [
    number('用第 2 组数据求电阻。','Use the second pair to find the resistance.',10,'R = U/I = 3.0/0.30 = 10 Ω。','R = U/I = 3.0/0.30 = 10 Ω.','Ω'),
    number('电压升到 6.0 V 时，电流是多少？','Find the current at 6.0 V.',0.6,'同一电阻的 R 为 10 Ω。I = 6.0/10 = 0.60 A。','The same resistor has R = 10 Ω. I = 6.0/10 = 0.60 A.','A'),
    number('根据这三组数据，电压增加到原来的 3 倍时，电流增加到原来的几倍？','For these readings, by what factor does the current change when the voltage triples?',3,
      '4.5 V 是 1.5 V 的 3 倍，0.45 A 也是 0.15 A 的 3 倍。','4.5 V is three times 1.5 V, and 0.45 A is three times 0.15 A.')
  ]);

  add('cart', 'physics', 'forces-motion', 'senior', 'L4', bi('小车的受力与加速度', 'A cart’s forces and acceleration'), bi(
    '质量 2 kg 的小车在水平轨道上从静止开始运动。它受到 10 N 的水平拉力和 2 N 的恒定阻力，两力方向相反。拉力持续 3 s。',
    'A 2 kg cart starts from rest on a horizontal track. A horizontal pull of 10 N acts for 3 s. Constant resistance of 2 N acts in the opposite direction.'
  ), [
    number('小车受到的水平合力大小是多少？','Find the magnitude of the net horizontal force.',8,'方向相反，合力为 10 − 2 = 8 N，方向与拉力相同。','The forces oppose one another, so the net force is 8 N in the direction of the pull.','N'),
    fill(bi('求小车的加速度大小和 3 秒末的速率。','Find the magnitude of the acceleration and the speed at 3 s.'),
      bi('a = F/m = 8/2 = 4 m/s²。由静止开始，v = at = 4 × 3 = 12 m/s。','a = F/m = 4 m/s². Starting from rest, v = at = 12 m/s.'),
      [['加速度 □ m/s²','Acceleration □ m/s²',4],['速率 □ m/s','Speed □ m/s',12]]),
    number('前 3 秒小车移动多少米？','How far does the cart travel in the first 3 s?',18,
      '从静止做匀加速运动，距离为 ½at² = ½ × 4 × 9 = 18 m。','From rest at constant acceleration, distance is ½at² = 18 m.','m')
  ]);

  add('salt', 'chemistry', 'mass-percentage', 'junior', 'L3', bi('溶液中溶质的质量分数', 'Mass percentage in a solution'), bi(
    '一份盐水由 12 g 食盐和 108 g 水组成，食盐完全溶解。下面只讨论给定的数据。',
    'A solution contains 12 g of dissolved salt and 108 g of water. Use the supplied data.'
  ), [
    number('溶液质量是多少？','Find the mass of the solution.',120,'盐和水的质量相加：12 + 108 = 120 g。','Add the salt and water: 12 + 108 = 120 g.','g'),
    number('食盐的质量分数是多少？填百分数的数值。','Enter the numerical value of the salt percentage by mass.',10,'12/120 × 100% = 10%。','12/120 × 100% = 10%.','%'),
    number('若只少了 20 g 水，食盐仍完全溶解，新的质量分数是多少？','If only 20 g of water is lost and all salt stays dissolved, what is the new mass percentage?',12,
      '食盐仍是 12 g，溶液质量变成 100 g，所以质量分数为 12%。','Salt stays at 12 g while the solution becomes 100 g, so the new percentage is 12%.','%')
  ]);

  add('dilution', 'chemistry', 'amount-concentration', 'senior', 'L4', bi('物质的量浓度与稀释', 'Molar concentration and dilution'), bi(
    '有 50.0 mL 浓度为 0.40 mol/L 的氯化钠溶液。加水后，溶液的最终体积为 200.0 mL。假设没有溶质损失。',
    'A 50.0 mL sample contains sodium chloride at 0.40 mol/L. Water is added until the final solution volume is 200.0 mL. Assume no solute is lost.'
  ), [
    number('50.0 mL 等于多少升？','Convert 50.0 mL to litres.',0.05,'1 L = 1000 mL，所以 50.0 mL = 0.0500 L。','Divide by 1000 to get 0.0500 L.','L'),
    fill(bi('求稀释前溶质的物质的量和稀释后的浓度。','Find the amount of solute before dilution and its concentration afterwards.'),
      bi('n = cV = 0.40 × 0.0500 = 0.020 mol。用 0.2000 L 除总量，即 0.020 ÷ 0.2000 = 0.10 mol/L。','n = cV = 0.020 mol. Divide the amount by the final volume, 0.2000 L, to get 0.10 mol/L.'),
      [['物质的量 □ mol','Amount □ mol',0.02],['浓度 □ mol/L','Concentration □ mol/L',0.1]]),
    number('从稀释后均匀溶液中取 25.0 mL，其中溶质有多少摩尔？','How many moles of solute are in 25.0 mL of the diluted solution?',0.0025,
      '25.0 mL = 0.0250 L，n = 0.10 × 0.0250 = 0.0025 mol。','25.0 mL = 0.0250 L, so n = 0.10 × 0.0250 = 0.0025 mol.','mol')
  ]);

  add('seedlings', 'biology', 'plant-energy', 'junior', 'L3', bi('幼苗对照实验读数', 'Reading a controlled seedling experiment'), bi(
    '三组同种幼苗长了 7 天。每组 10 株，初始大小、用水量、温度和光源类型相同。每天照光分别为 2、6、10 小时。各组平均新增叶片数分别是 1、3、5 片。',
    'Three groups of ten seedlings of the same species grew for seven days. Starting size, water, temperature and light source were matched. Daily light periods were 2, 6 and 10 hours. Mean numbers of new leaves were 1, 3 and 5, respectively.'
  ), [
    number('每天照光 6 小时的一组平均新增多少片叶？','How many new leaves on average were counted for six hours of light per day?',3,'第二组的平均新增叶片数为 3。','The mean for the middle group was 3.'),
    number('每天照光 10 小时组比 2 小时组平均多长几片新叶？','How many more new leaves on average were counted for ten hours than for two hours?',4,
      '比较两组的平均值：5 − 1 = 4。','Subtract the two means: 5 − 1 = 4.'),
    { prompt: bi('哪项结论有实验数据支持？', 'Which conclusion is supported by these observations?'),
      options: [bi('所有植物在持续光照下长得最好。','Every species grows best under constant light.'),
        bi('这三组中，照光越久，平均新增叶片越多。','More hours of light were associated with more new leaves in these groups.'),
        bi('水对这些植物毫无影响。','Water had no effect on the plants.'),
        bi('每天照光 10 小时组的平均株高翻倍。','The 10-hour group doubled its height.')],
      answer: 1, explanation: bi('数据支持在这三组和这些条件下的关系，记录的是新增叶片数。',
        'The data support the pattern in these groups under the tested conditions. New leaf counts were measured.') }
  ]);

  add('peas', 'biology', 'trait-frequency', 'senior', 'L4', bi('豌豆杂交与表现型概率', 'Pea crosses and phenotype probabilities'), bi(
    '在一个简化的孟德尔模型中，豌豆高茎等位基因 T 对矮茎 t 完全显性。用 Tt 与 Tt 杂交，假定配子等概率、独立结合。',
    'In a simplified Mendelian model for peas, tall T is completely dominant over short t. Two Tt plants are crossed. Assume equally likely gametes and independent fertilisation.'
  ), [
    number('单个后代基因型为 tt 的概率是多少？填百分数的数值。','Enter the probability of a tt offspring as a percentage.',25,'两个亲本都要给出 t，概率为 ½ × ½ = ¼。','Both parents must contribute t: ½ × ½ = ¼.','%'),
    number('已知某后代表现为高茎，它的基因型为 Tt 的概率是多少？用分数作答。','Given a tall offspring, what is the probability it is Tt? Answer with a fraction.','2/3',
      '等可能组合 TT、Tt、tT、tt 中前三种为高茎，其中两种是杂合。','Of the equally likely outcomes TT, Tt, tT and tt, three are tall and two of those are heterozygous.'),
    number('随机取两个独立后代，恰好一个是矮茎的概率是多少？可用分数作答。','For two independent offspring, what is the probability exactly one is short? You can use a fraction.','3/8',
      '先矮后高或先高后矮，概率相加：¼ × ¾ + ¾ × ¼ = 3/8。','Add short–tall and tall–short: ¼ × ¾ + ¾ × ¼ = 3/8.')
  ]);

  globalThis.EachVeyaSchoolPractice = sets;
})();
