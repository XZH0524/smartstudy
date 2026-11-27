(function () {
  'use strict';
  const Coach = globalThis.EachVeyaCoach;
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const Science = globalThis.EachVeyaScience;
  const Pilot = globalThis.EachVeyaPilot;
  const { skills } = globalThis.EachVeyaSkills;
  const { bilingual: bi, topics, topicsBySubject, subjects } = globalThis.SmartStudyData;

  // The first response selects an explanation. The second question changes the context.
  // These short exchanges teach a step and never contribute to the ability record.
  const guide = {
    balance: [
      [bi('8 = x − 3。要让 x 单独留下，两边应该怎样做？', 'In 8 = x − 3, what should you do to both sides to isolate x?'),
        bi('加 3', 'Add 3'), bi('减 3', 'Subtract 3'),
        bi('加 3 与减 3 互相抵消，两边仍相等。', 'Adding 3 undoes subtracting 3. The two sides stay equal.'),
        bi('把等式想成天平。左盘是 8，右盘比 x 少 3。给两盘各放 3，右盘就变成 x。', 'Picture a balance. One side is 8 and the other is 3 below x. Adding 3 to each side makes the second side equal to x.')],
      [bi('4x + 5 = 29。先移去 +5，右边变成几？', 'In 4x + 5 = 29, remove +5 first. What is the new value on the right?'),
        bi('24', '24'), bi('34', '34'),
        bi('等式右边也减 5，所以是 24。接下来才处理系数。', 'Subtract 5 from the right as well, giving 24. Deal with the coefficient next.'),
        bi('先用相反运算。左边减 5 后只剩 4x，右边也做 29 − 5。', 'Undo the addition first. Subtracting 5 leaves 4x on the left, and you also subtract 5 from 29.') ]
    ],
    coefficient: [
      [bi('−4x = 20。应该除以哪个数才能只留下 x？', 'In −4x = 20, what must you divide by to isolate x?'),
        bi('−4', '−4'), bi('4', '4'),
        bi('−4 是完整系数。两边除以 −4，左边就成了 x。', 'The coefficient is −4. Dividing both sides by −4 leaves x on the left.'),
        bi('把 −4x 写成 (−4) × x。除以 +4 仍留下 −x，除以 −4 才留下 x。', 'Write −4x as (−4) × x. Dividing by +4 leaves −x. Dividing by −4 leaves x.')],
      [bi('在 6x = −18 中，哪个值代回原式能成立？', 'In 6x = −18, which value works when substituted?'),
        bi('x = −3', 'x = −3'), bi('x = 3', 'x = 3'),
        bi('6 × (−3) = −18。代入可以核对符号。', '6 × (−3) = −18. Substitution checks the sign.'),
        bi('6 × 3 得正 18。要得到负 18，乘的另一个数须为负。', '6 × 3 is positive 18. To get negative 18, the other factor must be negative.')]
    ],
    distribution: [
      [bi('展开 4(x − 3) 时，−3 应变成什么？', 'When you expand 4(x − 3), what does the −3 become?'),
        bi('−12', '−12'), bi('−3', '−3'),
        bi('括号里的 −3 也和 4 相乘，得到 −12。', 'The −3 is also multiplied by 4, giving −12.'),
        bi('把 4(x − 3) 想成四份 x − 3 相加。x 有四份，−3 也有四份。', 'Think of 4(x − 3) as four copies of x − 3. Both terms appear four times.')],
      [bi('哪一式等价于 −2(x + 5)？', 'Which expression is equivalent to −2(x + 5)?'),
        bi('−2x − 10', '−2x − 10'), bi('−2x + 10', '−2x + 10'),
        bi('−2 乘 x 得 −2x，乘 +5 得 −10。', 'Multiply x by −2 to get −2x and +5 by −2 to get −10.'),
        bi('令 x = 0 检查常数。原式是 −2 × 5 = −10，所以常数项要带负号。', 'Try x = 0 to check the constant. The original equals −2 × 5 = −10, so the constant is negative.')]
    ],
    'common-denominator': [
      [bi('把 1/4 改写成以 12 为分母的等值分数，应写什么？', 'Which fraction with denominator 12 is equivalent to 1/4?'),
        bi('3/12', '3/12'), bi('1/12', '1/12'),
        bi('分母乘 3，分子也乘 3，分数的大小不变。', 'Multiply both the numerator and denominator by 3 to preserve the value.'),
        bi('把一块占整张纸四分之一的纸再分成三等份。原来的一块变成三小块，每小块是整张纸的 1/12。', 'Imagine cutting one quarter of a sheet into three equal pieces. The same area is now three pieces of size 1/12.')],
      [bi('1/6 + 1/3 等于多少？', 'What is 1/6 + 1/3?'),
        bi('1/2', '1/2'), bi('2/9', '2/9'),
        bi('1/3 = 2/6，所以总共 3/6，也就是 1/2。', 'Since 1/3 equals 2/6, the sum is 3/6, or 1/2.'),
        bi('先把 1/3 换成两份 1/6，再加上已有的一份 1/6。每一份的大小仍是 1/6。', 'Replace 1/3 with two sixths and add the one sixth you already have. The pieces are still sixths.')]
    ],
    agreement: [
      [bi('The boy with two bags ___ to school every day. 主语决定用 walks 还是 walk？', 'The boy with two bags ___ to school every day. Which form matches the subject?'),
        bi('walks', 'walks'), bi('walk', 'walk'),
        bi('真正走路的是一个男孩，主语是 The boy。', 'One boy is walking. The subject is “the boy”.'),
        bi('先划掉补充说明 with two bags。剩下 The boy ___ to school，主语是第三人称单数。', 'Cross out the extra detail “with two bags”. The subject that remains is singular: “the boy”.')],
      [bi('The two girls near the door ___ in the choir. 应填 sing 还是 sings？', 'The two girls near the door ___ in the choir. Should it be “sing” or “sings”?'),
        bi('sing', 'sing'), bi('sings', 'sings'),
        bi('唱歌的是两个女孩，复数主语用 sing。', 'Two girls are singing, so the plural subject takes “sing”.'),
        bi('用 they 替换 The two girls。念一下 They sing，听一听谁和动词搭配。', 'Replace “the two girls” with “they”. Say “They sing” to check the pairing.')]
    ],
    'past-simple': [
      [bi('We ___ the museum yesterday. 选 visited 还是 visit？', 'We ___ the museum yesterday. Choose “visited” or “visit”.'),
        bi('visited', 'visited'), bi('visit', 'visit'),
        bi('yesterday 指已经结束的时间，visit 的过去式是 visited。', '“Yesterday” names a finished time. The past form of “visit” is “visited”.'),
        bi('在时间线上把 yesterday 放在今天之前。句子说的是过去一次已经完成的活动。', 'Put “yesterday” before today on a timeline. This is a completed event in the past.')],
      [bi('Last Friday, Malin ___ the late bus. 选 took 还是 takes？', 'Last Friday, Malin ___ the late bus. Choose “took” or “takes”.'),
        bi('took', 'took'), bi('takes', 'takes'),
        bi('Last Friday 指过去一次。take 的过去式是不规则的 took。', '“Last Friday” points to a past event. “Took” is the irregular past of “take”.'),
        bi('先找时间再想词形。Last Friday 是结束的时间，这个动词不加 -ed，过去式是 took。', 'Find the time clue first. “Last Friday” is finished, and “take” becomes “took” in the past.')]
    ],
    'text-evidence': [
      [bi('读两句：The library opens at nine. The book sale starts at ten. 哪一句能回答义卖何时开始？',
        'Read: The library opens at nine. The book sale starts at ten. Which sentence tells you when the sale starts?'),
        bi('The book sale starts at ten.', 'The book sale starts at ten.'), bi('The library opens at nine.', 'The library opens at nine.'),
        bi('book sale 和 starts 都与所问的事相符。', 'Both “book sale” and “starts” match the event in the question.'),
        bi('先遮住两个时间，只比动作。opens 说的是图书馆开门，starts 说的是义卖开始。', 'Cover both clock times and compare the events. “Opens” refers to the library and “starts” refers to the sale.')],
      [bi('读两句：The bus leaves at eight. It reaches the station at nine. 问到站时间时，哪一个词能帮你定位？',
        'Read: The bus leaves at eight. It reaches the station at nine. Which verb identifies the time it arrives?'),
        bi('reaches', 'reaches'), bi('leaves', 'leaves'),
        bi('reaches the station 是到站，所以是九点。', '“Reaches the station” means arrives there, so it is nine.'),
        bi('把时间按出发和到达分开。leaves 是离开，reaches 是到达。', 'Put the times in two groups. “Leaves” is departure and “reaches” is arrival.') ]
    ],
    'average-speed': [
      [bi('小车移动 12 秒，停 5 秒，再移动 8 秒。求全程平均速率时，用时是多少？',
        'A cart moves for 12 seconds, stops for 5, and moves for 8 more. What time goes into the average speed for the whole trip?'),
        bi('25 秒', '25 seconds'), bi('20 秒', '20 seconds'),
        bi('总用时 12 + 5 + 8 = 25 秒，包含中间的停留。', 'The elapsed time is 12 + 5 + 8 = 25 seconds, including the stop.'),
        bi('想象出发时开启秒表，到终点才停。小车停着的 5 秒，秒表仍在走。', 'Imagine starting a stopwatch at departure and stopping it at arrival. It keeps running while the cart waits.')],
      [bi('计时器读数从 6 秒到 30 秒，途中停了 4 秒。总路程 72 米。全程平均速率是多少？',
        'The timer reads 6 seconds at departure and 30 at arrival. The trip includes a 4-second stop and covers 72 metres. What is the average speed?'),
        bi('3 米/秒', '3 m/s'), bi('3.6 米/秒', '3.6 m/s'),
        bi('用时是 30 − 6 = 24 秒，72 ÷ 24 = 3 米/秒。', 'Elapsed time is 30 − 6 = 24 seconds. Divide 72 by 24 to get 3 m/s.'),
        bi('30 − 6 已包含停留。用 72 米除以这 24 秒，不能再扣一次停留时间。', 'The 24 seconds already includes the stop. Divide 72 metres by all 24 seconds.') ]
    ],
    'mass-density': [
      [bi('模拟量筒的读数从 14 mL 升到 22 mL。物体完全浸没，它占多少体积？',
        'In a simulation, the reading rises from 14 mL to 22 mL with the object fully submerged. What volume does the object displace?'),
        bi('8 mL', '8 mL'), bi('22 mL', '22 mL'),
        bi('物体排开的体积是读数的增加量，22 − 14 = 8 mL。', 'The object displaces the increase in the reading: 22 − 14 = 8 mL.'),
        bi('把 22 mL 拆成原有的 14 mL 和物体排开的部分。相减才留下物体占的体积。', 'Separate the 22 mL reading into the original 14 mL and the displaced part. Subtraction leaves the volume displaced by the object.')],
      [bi('样品的质量是 45 g，体积是 15 cm³。每 1 cm³ 有多重？', 'A sample has a mass of 45 g and a volume of 15 cm³. What mass corresponds to 1 cm³?'),
        bi('3 g', '3 g'), bi('1/3 g', '1/3 g'),
        bi('把 45 g 平均分成 15 份，每份质量 3 g，密度为 3 g/cm³。', 'Share 45 g across fifteen cubic centimetres. Each has 3 g, so the density is 3 g/cm³.'),
        bi('单位提示运算。要算克每立方厘米，就把克数放在上面，除以立方厘米数。', 'Let the units guide you. Grams per cubic centimetre means divide the grams by the volume in cubic centimetres.') ]
    ],
    'population-density': [
      [bi('草地总面积 40 m²，其中 10 m² 没调查。计算样本计数密度要用哪一个面积？',
        'A meadow covers 40 m², but 10 m² was not surveyed. Which area belongs in the sample density calculation?'),
        bi('30 m²', '30 m²'), bi('40 m²', '40 m²'),
        bi('计数只覆盖调查过的 40 − 10 = 30 m²。', 'The count covers only the 40 − 10 = 30 m² surveyed.'),
        bi('在草地图上涂掉没调查的 10 m²。计数来自剩下的格子，分母也用这些格子的面积。', 'Shade out the 10 m² you did not survey. The count comes from the remaining squares, so their area is the denominator.')],
      [bi('面积为 8 m² 和 12 m² 的两个不重叠样方，共数到 60 株。平均每平方米数到几株？',
        'Two non-overlapping plots of 8 m² and 12 m² contain 60 plants in total. What is the count per square metre?'),
        bi('3 株', '3 plants'), bi('30 株', '30 plants'),
        bi('60 ÷ (8 + 12) = 3。分母是调查面积。', '60 ÷ (8 + 12) = 3. The denominator is the surveyed area.'),
        bi('60 ÷ 2 得到的是平均每个样方的株数。要求每平方米，先把两个样方的面积相加。', '60 ÷ 2 gives the count per plot. To get the count per square metre, add the two areas first.') ]
    ]
  };

  const scienceGuides = {
    'forces-motion': [
      bi('按方向相减', 'Subtract by direction'), bi('把力的大小直接相加', 'Add the magnitudes'),
      bi('取向右为正。向右 9 N，向左 4 N，合力是多少？', 'Take right as positive. What is the net force of 9 N right and 4 N left?'),
      bi('向右 5 N', '5 N right'), bi('向右 13 N', '13 N right'),
      bi('两个方向符号相反，9 + (−4) = 5 N。', 'Opposite directions have opposite signs: 9 + (−4) = 5 N.')
    ],
    'wave-behaviour': [
      bi('波长减半', 'Wavelength halves'), bi('波长也加倍', 'Wavelength doubles'),
      bi('波速为 12 m/s，频率是 4 Hz，波长是多少？', 'A wave travels at 12 m/s with a frequency of 4 Hz. What is the wavelength?'),
      bi('3 m', '3 m'), bi('48 m', '48 m'),
      bi('波长 = 波速 ÷ 频率，12 ÷ 4 = 3 m。', 'Wavelength is speed divided by frequency: 12 ÷ 4 = 3 m.')
    ],
    'thermal-models': [
      bi('热容较大者', 'The one with the greater heat capacity'), bi('热容较小者', 'The one with the smaller heat capacity'),
      bi('热容为 30 J/K 的物体吸收 120 J，温度升高多少？', 'An object with heat capacity 30 J/K absorbs 120 J. How much does its temperature rise?'),
      bi('4 K', '4 K'), bi('90 K', '90 K'),
      bi('每升高 1 K 要吸收 30 J，120 ÷ 30 = 4 K。', 'Each 1 K rise needs 30 J. Divide 120 by 30 to get 4 K.')
    ],
    'fluid-models': [
      bi('压强增大', 'Pressure increases'), bi('压强减小', 'Pressure decreases'),
      bi('6 N 的垂直力均匀作用在 2 m² 上，平均压强是多少？', 'A uniform perpendicular force of 6 N acts over 2 m². What is the average pressure?'),
      bi('3 Pa', '3 Pa'), bi('12 Pa', '12 Pa'),
      bi('压强是单位面积所受的力，6 ÷ 2 = 3 Pa。', 'Pressure is force per unit area: 6 ÷ 2 = 3 Pa.')
    ],
    'atomic-structure': [
      bi('它们是同位素', 'They are isotopes'), bi('它们属于不同元素', 'They are different elements'),
      bi('某原子有 8 个质子和 10 个中子，质量数是几？', 'An atom has 8 protons and 10 neutrons. What is its mass number?'),
      bi('18', '18'), bi('8', '8'),
      bi('质量数包含质子和中子，8 + 10 = 18。', 'Mass number counts protons and neutrons: 8 + 10 = 18.')
    ],
    'equation-models': [
      bi('改化学式前的系数', 'Change the coefficients'), bi('改化学式右下角的下标', 'Change the formula subscripts'),
      bi('2 CO₂ 表示的氧原子总数是几？', 'How many oxygen atoms are represented by 2 CO₂?'),
      bi('4', '4'), bi('2', '2'),
      bi('每份有 2 个氧原子，两份共有 4 个。', 'Each molecule contains 2 oxygen atoms, so two contain 4.')
    ],
    'mole-calculations': [
      bi('可以，摩尔质量可能不同', 'Yes, their molar masses may differ'), bi('不可以，摩尔数一样就一样重', 'No, equal amounts always have equal mass'),
      bi('某物质的摩尔质量是 16 g/mol，3 mol 的质量是多少？', 'A substance has a molar mass of 16 g/mol. What is the mass of 3 mol?'),
      bi('48 g', '48 g'), bi('16 g', '16 g'),
      bi('每摩尔 16 g，3 mol 的质量是 3 × 16 = 48 g。', 'Each mole has a mass of 16 g. Three moles have 3 × 16 = 48 g.')
    ],
    'acid-base-models': [
      bi('变为原来的 10 倍', 'It becomes ten times as large'), bi('降为原来的 1/10', 'It drops to one tenth'),
      bi('比较 pH 为 5 和 pH 为 7 的两个模型。前者的氢离子活度是后者的多少倍？', 'Compare models at pH 5 and pH 7. How many times the hydrogen-ion activity of the second is in the first?'),
      bi('100 倍', '100 times'), bi('2 倍', '2 times'),
      bi('每降低一个 pH 单位，活度乘 10。相差两个单位就是 100 倍。', 'Each one-unit decrease in pH multiplies the activity by 10. For two units, that is 100 times.')
    ],
    'cell-transport': [
      bi('仍在移动，净移动可以为零', 'They still move. Net movement can be zero.'), bi('分子停止移动', 'The molecules stop moving'),
      bi('每秒有 7 个粒子从甲到乙，也有 7 个从乙到甲。每秒净移到乙的粒子有几个？', 'Seven particles move each way per second. How many net particles move to side B per second?'),
      bi('0 个', '0'), bi('14 个', '14'),
      bi('净移动看差值，7 − 7 = 0。两个方向仍有粒子穿过。', 'Net movement is the difference, 7 − 7 = 0. Particles still cross in both directions.')
    ],
    'plant-energy': [
      bi('没有，仍有呼吸作用', 'No, respiration still occurs'), bi('停止了，因为检测到氧气净释放', 'Yes, because there is net oxygen release'),
      bi('某模拟每分钟产生 12 单位氧气，呼吸消耗 5 单位。每分钟净释放多少？', 'A model produces 12 units of oxygen per minute and uses 5 in respiration. What is the net release per minute?'),
      bi('7 单位', '7 units'), bi('17 单位', '17 units'),
      bi('同时发生的消耗要扣除，所以净释放是 12 − 5 = 7。', 'Subtract simultaneous consumption. Net release is 12 − 5 = 7.')
    ],
    'human-systems': [
      bi('不能，还需要每次泵出的体积', 'No, you also need volume pumped per beat'), bi('能，心率已经给出了每分钟体积', 'Yes, heart rate already gives volume per minute'),
      bi('教学模型中，每分钟 60 次，每次泵出 40 mL。每分钟泵出多少？', 'A teaching model pumps 40 mL per beat at 60 beats per minute. What is the volume per minute?'),
      bi('2,400 mL', '2,400 mL'), bi('100 mL', '100 mL'),
      bi('每次体积乘每分钟次数，40 × 60 = 2,400 mL/min。', 'Multiply volume per beat by beats per minute: 40 × 60 = 2,400 mL/min.')
    ],
    'natural-selection': [
      bi('不能，仅看到频率发生变化', 'No, it only shows a change in frequency'), bi('能，单次观察足以证明原因', 'Yes, one observation establishes the cause'),
      bi('原来有 20/100，后来有 45/150 个体表现一种性状。频率如何变化？', 'A trait is present in 20 of 100 individuals, then in 45 of 150. What happened to the frequency?'),
      bi('从 20% 升到 30%', 'It rose from 20% to 30%'), bi('从 20% 升到 45%', 'It rose from 20% to 45%'),
      bi('两次样本大小不同。分别算 20 ÷ 100 和 45 ÷ 150，再比较比例。', 'The sample sizes differ. Compute 20 ÷ 100 and 45 ÷ 150, then compare the proportions.')
    ]
  };

  function dialogueFor(focus) {
    if (Object.hasOwn(guide, focus)) return guide[focus];
    if (!Object.hasOwn(Science.topics, focus)) return null;
    const skill = Science.topics[focus];
    if (Object.hasOwn(scienceGuides, focus)) {
      const [first, firstDistractor, prompt, second, secondDistractor, result] = scienceGuides[focus];
      return [[skill.question, first, firstDistractor, skill.principle, skill.notice],
        [prompt, second, secondDistractor, result, bi(`${skill.example.zh} 回到这道题：${result.zh}`, `${skill.example.en} Back to this question: ${result.en}`)]];
    }
    const { numerator, denominator, numeratorUnit, denominatorUnit, unit, percent } = skill;
    if (!numerator || !denominator) return null;
    const inEnglish = value => ['条', '只'].includes(value) ? 'observations' : value;
    const a = percent ? 6 : 24;
    const b = percent ? 24 : 6;
    const result = percent ? 25 : 4;
    return [
      [skill.question, denominator, numerator, skill.principle,
        bi(`看到「每」或「占」时，先确定用什么作基准。这里用「${denominator.zh}」作分母。`,
          `Think of the quantity after “per” or the total a share is compared with. Here, use “${denominator.en}” as the denominator.`)],
      [bi(`换一份虚拟记录。「${numerator.zh}」为 ${a} ${numeratorUnit}，「${denominator.zh}」为 ${b} ${denominatorUnit}。求「${skill.target.zh}」。`,
        `Try another virtual record. “${numerator.en}” is ${a} ${inEnglish(numeratorUnit)} and “${denominator.en}” is ${b} ${inEnglish(denominatorUnit)}. Find “${skill.target.en}”.`),
      bi(`${result} ${unit}`, `${result} ${unit}`), bi(`${percent ? a : b / a} ${unit}`, `${percent ? a : b / a} ${unit}`),
      bi(`${a} ÷ ${b}${percent ? ' × 100%' : ''} = ${result} ${unit}。`,
        `${a} ÷ ${b}${percent ? ' × 100%' : ''} = ${result} ${unit}.`),
      bi(`先把 ${a} 放进分子、${b} 放进分母。${percent ? '最后把比值换成百分数。' : '最后核对原题所求单位。'}`,
        `Put ${a} in the numerator and ${b} in the denominator.${percent ? ' Convert the ratio to a percentage.' : ' Check the unit the question asks for.'}`)]
    ];
  }

  const copy = {
    evidenceLessons: ['三题专项试练', 'Three-question workshops'],
    lessonReview: ['专项题已通过程序检查。试点题的复核结果可在知识路线查看。', 'Workshop questions pass automated checks. Review status for pilot questions is shown in Topic paths.'],
    equationLesson: ['数学 · 分两步解方程 · L2', 'Maths · Two-step equations · L2'],
    readingLesson: ['英语 · 阅读找依据 · A1', 'English · Find the supporting sentence · A1'],
    speedLesson: ['物理 · 平均速率 · L2', 'Physics · Average speed · L2'],
    massDensityLesson: ['化学 · 质量密度 · L2', 'Chemistry · Mass density · L2'],
    populationDensityLesson: ['生物 · 种群计数密度 · L2', 'Biology · Population count density · L2'],
    originalEvidence: ['原文依据', 'Evidence in the passage'],
    stepHint: ['这一步的提示', 'Hint for this step'],
    stepSubtract: ['先消掉 x 那一边的 +{n}。等式两边都减 {n}，再算 {expression}。', 'Find +{n} on the side containing x. Subtract {n} from both sides, then work out {expression}.'],
    stepAdd: ['先消掉 x 那一边的 −{n}。等式两边都加 {n}，再算 {expression}。', 'Find −{n} on the side containing x. Add {n} to both sides, then work out {expression}.'],
    stepDivide: ['中间值算对了。现在两边同时除以 x 的系数 {n}，再算 {expression}。', 'Your intermediate value is correct. Divide both sides by the coefficient {n}, then work out {expression}.'],
    cluePerson: ['先找问题说的动作，再看原文里谁做了这个动作。', 'Find the action in the question, then look for who actually does it in the passage.'],
    cluePlace: ['先圈出问题里要找的人或物，再找同一句里的地点。只提到地点的句子还不够。', 'Find the person or thing from the question and the place in the same sentence. A place alone is not enough.'],
    clueTime: ['先找问题问的那件事，再检查同一句中的时间。文中其他事情的时间容易混淆。', 'Find the event from the question, then check its time in the same sentence. Other events may have their own times.'],
    clueReason: ['先找问题里的动作，再找说明原因的词，例如 because。', 'Find the action in the question, then look for a reason word such as “because”.'],
    clueDetail: ['先找问题指的是哪件事，再核对原句是否同时说到了所问的细节。', 'Find the event or thing named in the question, then check that the same sentence gives the detail you need.'],
    lessonChecks: ['错题跨日复测', 'Next-day checks on missed questions'],
    lessonCheck: ['新题复测', 'New-question check'],
    lessonStart: ['做一道新题', 'Try one new question'],
    lessonStartSkill: ['做一道新题 · {skill}', 'Try one new question · {skill}'],
    lessonStartsOn: ['{date} 可做一道新题', 'One new question available on {date}'],
    lessonReady: ['新题已可以做', 'Your new question is ready'],
    lessonWeeklyStartsOn: ['{date} 可做 7 天复测', '7-day check available on {date}'],
    lessonWeeklyReady: ['7 天复测已到期', 'Your 7-day check is due'],
    lessonWeeklyStart: ['7 天复测 · {skill}', '7-day check · {skill}'],
    lessonWeeklyPassed: ['这道 7 天复测题已独立答对。', 'You answered the 7-day check correctly without hints.'],
    lessonUnavailable: ['这个专项暂时没有未做过的新题。', 'There are no unseen check questions left for this workshop.'],
    lessonPassed: ['本次新题答对了。', 'You answered this new question correctly.'],
    lessonIndependent: ['这道跨日新题已独立答对。', 'You answered this fresh next-day question correctly without hints.'],
    lessonFirstStepCorrect: ['第一步已独立做对。接下来练习怎样求出未知数。', 'You completed the first step without hints. Next, practise solving for the unknown.'],
    lessonNotCounted: ['作答已保存。这道题未计入跨日独立复测。', 'Your answer was saved. It does not count as an independent next-day check.'],
    lessonHinted: ['这次用了提示。隔天可以独立做一道新题。', 'You used a hint. Try another new question on your own the next day.'],
    lessonRetry: ['先看这一步的提示，隔天再用一道新题试试。', 'Review the hint for this step and try another new question the next day.'],
    lessonOpen: ['查看跨日复测', 'View next-day checks'],
    coach: ['分步辅导', 'Step-by-step guidance'],
    coachIntro: ['先判断自己卡在哪一步，再用没见过的题检验理解。', 'Find the step you got stuck on, then check your understanding on a new question.'],
    coachBasis: ['这些提示和例题由预设教学规则提供，可在本地使用。', 'These guided prompts and worked examples use built-in teaching rules and work locally.'],
    coachPrompt: ['先想一想', 'Think it through'],
    coachDialog: ['跟着提示想两步', 'Work through two prompts'],
    coachDialogStep: ['第 {n} 步，共 2 步', 'Step {n} of 2'],
    coachDialogAccept: ['这一步做对了。', 'This step is correct.'],
    coachDialogRetry: ['换个角度想这一步。', 'Try a different way to think about this step.'],
    coachDialogNext: ['换个情境再想一步', 'Try a different example'],
    coachDialogEnd: ['接下来可以用专项的新题独立检验。', 'Next, use fresh practice questions to check your understanding independently.'],
    coachDialogReset: ['从第一步重来', 'Start again'],
    coachHelp: ['查看这一步的提示', 'Get a hint for this step'],
    coachRule: ['查看规则与例题', 'See the rule and a worked example'],
    coachPrerequisites: ['先复习这些基础步骤', 'Review these prerequisite skills'],
    coachTrace: ['记录提示先补这些步骤', 'Your answers suggest revisiting these steps first'],
    coachSuggestion: ['选项提示可能卡在「{skill}」。用两道新题进一步确认。', 'This choice may point to difficulty with “{skill}”. Check it on two new questions.'],
    coachAmbiguous: ['这道题的选项不足以判断错因。可以先看解析，再练同一知识点。', 'This answer does not pinpoint a cause. Read the explanation, then try the same topic again.'],
    coachJump: ['看分步辅导', 'Open guided practice'],
    coachBankFallback: ['继续练这个知识点', 'Practise this topic'],
    probe: ['两题错因探查', 'Two-question diagnostic'],
    retake: ['两题变式复测', 'Two-question transfer check'],
    spaced: ['间隔复习', 'Spaced review'],
    focusedSubmitted: ['已提交。完成本组后可看答案和解析。', 'Submitted. Answers and explanations appear after this set.'],
    coachUntested: ['尚未测评', 'Not yet assessed'],
    coachPossible: ['有待确认', 'Needs checking'],
    coachConfirmed: ['两道新题出现同类错误，建议先补练这一步。', 'The same error appeared on two new questions. Practise this step first.'],
    coachEquationEvidence: ['同一步出错的方程结构：{n} 种。达到 2 种才建议优先补练。', 'This step was missed in {n} equation structures. Two are needed before we prioritise it for practice.'],
    coachEquationConfirmed: ['两种不同写法的新方程里，同一步出错。建议先补练这一步。', 'The same step was missed in two fresh equation structures. Practise this step first.'],
    coachVerified: ['最近一次新题检验通过，继续按计划复习。', 'The latest check on new questions passed. Continue with scheduled review.'],
    coachScheduled: ['已记录初练表现，等待跨日复测。', 'Practice evidence is recorded. A later-day check is pending.'],
    scienceErrorClue: ['此选项可能涉及「{kind}」。做两道新题再确认。', 'This option may involve “{kind}”. Try two new items to check.'],
    scienceSource: ['查看知识参考', 'View the subject reference'],
    coachEmpty: ['这个专项的可用新题已用完，可继续练习题库里的同一知识点。', 'You have used all fresh questions for this skill. Continue with the topic bank.'],
    coachDue: ['下次复习 {date}', 'Next review {date}'],
    coachDueNow: ['待复习', 'Due for review'],
    coachCheckSummary: ['本组独立答对 {independent}/{answered} 道新题。', '{independent}/{answered} new questions answered correctly without hints.'],
    targetedAlgebra: ['根据近期错题练「{skill}」', 'Practise “{skill}” from recent mistakes'],
    sameLevelBank: ['做同等级题库题（{level}）', 'Use the {level} question bank'],
    localAiBank: ['本地版可以直接练已验算的题库变式。', 'The local version can use verified variations from the question bank.'],
    plan: ['学习中心', 'Study centre'], planSubtitle: ['先做今天的小任务，再沿知识路线继续学。', 'Start with a short daily task, then follow a topic path.'],
    planSettings: ['调整我的计划', 'Edit my plan'], planGoal: ['目标科目', 'Subject goal'], planBalanced: ['数学和英语', 'Mathematics and English'], planAll: ['全部学科', 'All subjects'],
    planTopic: ['重点知识点', 'Focus topic'], planMinutes: ['每日可用时间（分钟）', 'Daily time available (minutes)'],
    planDeadline: ['考试日期（可选）', 'Exam date (optional)'], planSave: ['保存学习计划', 'Save study plan'],
    planSaved: ['学习计划已保存。', 'Study plan saved.'], planTask: ['今日任务', 'Today’s task'],
    planStart: ['练 {topic} · {n} 题', 'Practise {topic} · {n} questions'], planPlacement: ['做 {subject} 起点测试', 'Take the {subject} placement check'],
    planDailyTime: ['计划用时 {minutes} 分钟', 'A {minutes}-minute plan'],
    planProgress: ['今天已作答 {n} 题，目标 {target} 题', '{n} answers today, target {target}'],
    planReview: ['复习 {topic} · {n} 题', 'Review {topic} · {n} questions'],
    planBankReview: ['重做 {subject} 错题 · {n} 题', 'Retry {subject} mistakes · {n} questions'],
    planComplete: ['今日任务完成', 'Daily goal complete'],
    planBudgetDone: ['今天的计划用时已到', 'Today’s planned time is up'],
    planMoreTasks: ['查看其余任务', 'See the other tasks'],
    planReasonResume: ['上次的练习还没做完，可以从原处继续。', 'Your last practice is unfinished. Pick up where you left off.'],
    planReasonCheck: ['复测已到期，用一道新题检验这一步。', 'This check is due. Use a fresh question to check this skill.'],
    planReasonProbe: ['近期作答出现了错因线索，先用新题确认。', 'A recent answer suggests a difficulty. Check it on new questions.'],
    planReasonRetake: ['不同题目里出现相同错误，优先练这一步。', 'The same error appeared on different questions. Practise this step first.'],
    planReasonSpaced: ['到了复习日，看看隔一段时间还能不能独立做对。', 'This review is due. Check what you can still do unaided.'],
    planReasonBank: ['有已到期的错题，可以先订正。', 'Some missed questions are due for another try.'],
    planReasonWeak: ['近期作答显示这个知识点有待巩固。', 'Recent answers suggest this topic needs more practice.'],
    planReasonGoal: ['这是你在计划里选的重点知识点。', 'You chose this as your focus topic.'],
    planReasonCoverage: ['计划优先安排近期练习较少的知识点。', 'The plan prioritises topics you have practised less recently.'],
    planReasonReturned: ['这项练习来自之前顺延的任务。', 'This practice was postponed from an earlier day.'],
    planDefer: ['移到明天', 'Move to tomorrow'], planRestore: ['移回今天', 'Bring back today'],
    planDeferred: ['已移到 {date}', 'Moved to {date}'], planDeferredOnly: ['今天的任务已调整。', 'Today’s tasks have been adjusted.'],
    planDeferSaved: ['任务已移到明天。', 'Task moved to tomorrow.'], planRestoreSaved: ['任务已移回今天。', 'Task brought back to today.'],
    planOther: ['自由练习', 'Choose your practice'],
    planUpcoming: ['未来 7 天', 'Next 7 days'], planMonth: ['未来 30 天', 'Next 30 days'],
    planExamSoon: ['考前一周优先巩固已有知识，并缩短新练习。', 'In the week before the exam, prioritise review and keep new sets short.'],
    planNeedsVariants: ['{n} 个专项暂缺新复测题，可先看辅导。', '{n} skills need fresh check questions. Guidance is available.'],
    planScheduled: ['已安排复习', 'Scheduled review'], planProposed: ['建议练习', 'Suggested practice'],
    roadmap: ['知识路线', 'Topic paths'], roadmapIntro: ['从基础开始，也可以直接练任何一节。', 'Start with the basics or choose any topic.'],
    roadmapPractised: ['练过 {n} 道不同题', '{n} distinct questions tried'],
    roadmapVerified: ['{n} 个子技能通过复测', '{n} skills passed a check'],
    roadmapGuide: ['学这节', 'Guide'],
    pilotRoute: ['试点学习路线', 'Pilot learning path'],
    pilotPrerequisites: ['学习顺序', 'Learning sequence'],
    pilotPending: ['题单待复核，试学入口暂未开放。', 'The questions are awaiting review. The pilot is currently closed.'],
    pilotReviewed: ['题单已通过 DeepSeek 复核和程序核对。复测从专项练习完成日算起。', 'DeepSeek review and automated answer checks are complete. Check dates are counted from the day you finish targeted practice.'],
    pilotOpenStage: ['开始{stage}', 'Start {stage}'],
    pilotLocked: ['完成前一步后开放', 'Available after the previous step'],
    pilotOnDate: ['{date} 起可做', 'Available from {date}'],
    pilotDone: ['已完成', 'Finished'],
    pilotGuided: ['看分步例题', 'Read a worked example'],
    pilotPersonalHint: ['根据刚才的作答，先留意这一步', 'From your first answer, review this step'],
    pilotTryExample: ['看完例题后，自己做一遍再继续。', 'After reading the example, try it yourself to continue.'],
    pilotGoPath: ['回到试点路线', 'Back to the pilot path'],
    pilotReport: ['试点路线的独立作答', 'Independent answers in the pilot paths'],
    pilotReportBasis: ['按整条路线显示起点、隔天和第 7 天的结果。每次只有 1 道题。', 'See each path’s initial, next-day and Day 7 results. There is one question at each check.'],
    pilotStepBasis: ['每个格子只反映这次的答案。还未完成的复测没有分数。', 'Each result describes this answer only. Unfinished checks have no score.'],
    pilotStepSkill: ['作答步骤', 'Answer step'], pilotStepYes: ['做对', 'Correct'],
    pilotStepNo: ['需再练', 'Needs practice'], pilotStepPending: ['尚未测评', 'Not yet assessed'],
    pilotIndependent: ['独立答对 {correct}/{total} 题', '{correct}/{total} correct without hints'],
    report: ['学习报告', 'Study report'], reportIntro: ['根据已提交的作答比较表现，并查看下一步可练的知识点。', 'Compare submitted answers and choose what to practise next.'],
    reportToday: ['今天', 'Today'], reportWeek: ['近 7 天', 'Last 7 days'], reportMonth: ['近 30 天', 'Last 30 days'], reportQuarter: ['近 90 天', 'Last 90 days'],
    reportFilters: ['报告时段', 'Report period'], reportTime: ['记录到的作答时间', 'Observed answering time'],
    reportTimeValue: ['{n} 分 {seconds} 秒', '{n} min {seconds} sec'], reportTimeCoverage: ['{timed}/{total} 次作答有计时', '{timed}/{total} answers have timing'],
    reportDelta: ['当前答对 {correct}/{total}；此前同长度时段答对 {previousCorrect}/{previousTotal}。', '{correct}/{total} correct this period; {previousCorrect}/{previousTotal} in the previous equal-length period.'],
    reportNoComparison: ['至少两个时段有作答后可比较。', 'Comparison is available once both periods have answers.'],
    reportActivity: ['每日作答量', 'Answers by day'], reportAccuracy: ['每日作答正确率', 'Accuracy by day'],
    reportWeeklyActivity: ['每周作答量', 'Answers by week'], reportWeeklyAccuracy: ['每周作答正确率', 'Accuracy by week'],
    reportDate: ['日期', 'Date'], reportTable: ['查看图表数据', 'View chart data'],
    reportMap: ['知识点练习地图', 'Topic practice map'], reportEvidence: ['{n} 道不同题，{correct}/{total} 次答对', '{n} distinct questions, {correct}/{total} answers correct'],
    reportReadingEvidence: ['{passages} 篇不同文章，{correct}/{total} 次答对', '{passages} different passages, {correct}/{total} answers correct'],
    reportSparse: ['样本较少', 'Small sample'], reportSkillNote: ['正确率描述本时段做过的题目。每个知识点同时显示题数。', 'Accuracy describes answers from this period. Each topic also shows the sample size.'],
    reportMistakes: ['常见错因线索', 'Common mistake patterns'],
    reportChecks: ['跨日复测表现', 'Next-day check results'],
    reportCheckStat: ['独立答对 {independent}/{total} 次 · 最近 {date}', '{independent}/{total} checks correct without hints · Latest {date}'],
    reportLastIndependent: ['最近一题已独立答对。', 'Most recent question: correct without hints.'],
    reportLastFirstStepCorrect: ['最近一题的第一步已独立做对，第二步还需练习。', 'Most recent question: first step correct without hints. Keep practising the second step.'],
    reportLastWeekly: ['最近一次为 7 天复测。', 'The latest result is from a 7-day check.'],
    reportLastNeedsPractice: ['最近一题未独立答对。', 'Most recent question: no independent correct answer.'],
    reportMistakeCount: ['{attempts} 次线索，来自 {distinct} 道不同题', '{attempts} clues across {distinct} distinct questions'],
    reportMistakeKind: ['{kind} · {n} 次', '{kind} · {n} times'],
    reportNext: ['下一步', 'Suggested next step'], reportNextTopic: ['试练「{topic}」', 'Try “{topic}”'],
    reportNoMistakes: ['本时段暂时没有可归类的错因线索。', 'No identifiable mistake patterns in this period yet.'],
    paceRecheck: ['这一组出现多次很快的错误回答。先保留当前等级，继续积累练习证据。', 'Several incorrect answers came very quickly. The current level stays in place while more evidence is collected.'],
    backups: ['备份与迁移', 'Backup and transfer'], backupHelp: ['导出的文件含作答、错题、未完成练习及学习计划。可在另一浏览器或新网址导入。', 'The file includes answers, mistakes, unfinished practice and your plan. Import it in another browser or at a new address.'],
    backupExport: ['导出学习记录', 'Export study history'], backupImport: ['导入并合并', 'Import and merge'],
    backupFile: ['选择 EachVeya 的 JSON 备份文件', 'Choose an EachVeya JSON backup file'],
    backupDone: ['已合并学习记录，新增 {n} 次作答。', 'Study history merged. Added {n} answers.'],
    backupInvalid: ['无法读取这份备份。请选择兼容的 EachVeya JSON 文件（不超过 12 MB）。', 'This backup could not be read. Choose a compatible EachVeya JSON file up to 12 MB.'],
    backupConflict: ['备份和当前记录存在冲突，未合并。请先导出留存当前记录。', 'The backup conflicts with current study data. Save a copy of your current records before resolving the conflict.'],
    backupActive: ['两份记录各有不同的未完成练习。请先完成本机的练习，再重试导入。', 'Both records have different unfinished practices. Finish the practice on this device, then try importing again.'],
    backupTemporary: ['记录已合并到当前页面，但浏览器无法保存。可立即导出合并后的记录。', 'Records are merged on this page, but the browser could not save them. Export the merged records now if you need a copy.'],
    flagQuestion: ['记录题目问题', 'Flag a question issue'], flagReason: ['问题类型', 'Issue type'],
    wording: ['题干或选项不清楚', 'Unclear prompt or choices'], answer: ['答案或解析可能有误', 'Possible answer or explanation error'],
    translation: ['翻译问题', 'Translation problem'],
    flagSaved: ['已记录，可在「学习记录」中导出问题清单。', 'Flag saved. Export the issue list from Learning progress.'],
    flagExport: ['导出题目问题清单', 'Export question issues']
  };

  function create({ t, text, escapeHtml, button, heading, subjectName, selectField, locale, language }) {
    const sectionStatus = {
      unassessed: 'coachUntested', possible: 'coachPossible', confirmed: 'coachConfirmed', verified: 'coachVerified', scheduled: 'coachScheduled'
    };
    const coachUrl = id => '#coach/' + id;
    const statusKey = record => record.equationLevel && record.status === 'confirmed' ? 'coachEquationConfirmed' : sectionStatus[record.status];

    function linkToCoach(id, label, extra = '', startAt = '') {
      return `<a class="button secondary ${extra}" href="${coachUrl(id)}${startAt}">${label || text(skills[id].label)}</a>`;
    }

    function renderEvidence(question) {
      return question.evidenceQuote ? `<p><strong>${t('originalEvidence')}</strong> <q lang="en">${escapeHtml(question.evidenceQuote)}</q></p>` : '';
    }

    function renderClue(question, attempt, nextDay = []) {
      const focus = Coach.mistakeFocus(question, attempt);
      const targeted = Core.schedulesLessonCheck(question) || question.purpose === 'followup';
      const task = targeted && nextDay.find(item => item.focus === focus);
      const schedule = task ? `<p class="field-help">${lessonStatus(task)} · <a href="#plan/checks">${t('lessonOpen')}</a></p>` : '';
      if (question.stepHints && focus) {
        const marks = Core.evaluateAnswer(question, Core.responseOf(attempt)).marks;
        return `<div class="mistake-clue"><p><strong>${t('stepHint')}</strong> ${text(question.stepHints[marks.indexOf(false)])}</p>${schedule}
          ${linkToCoach(focus, t('coachJump'), '', dialogueFor(focus) && marks[0] && !marks[1] ? '/step-2' : '')}</div>`;
      }
      if (question.fields) {
        if (!focus) return '';
        const { right, offset, coefficient } = question.equationStep;
        const prompt = focus === 'balance' ? t(offset < 0 ? 'stepAdd' : 'stepSubtract', {
          n: Math.abs(offset), expression: right + (offset < 0 ? ' + ' : ' − ') + Math.abs(offset)
        }) : t('stepDivide', { n: coefficient, expression: question.fields[0].expected + ' ÷ (' + coefficient + ')' });
        return `<div class="mistake-clue"><p><strong>${t('stepHint')}</strong> ${prompt}</p>${schedule}${linkToCoach(focus, t('coachJump'))}</div>`;
      }
      if (question.evidenceType && focus === 'text-evidence') {
        const hint = { person: 'cluePerson', place: 'cluePlace', time: 'clueTime', reason: 'clueReason', detail: 'clueDetail' };
        return `<div class="mistake-clue"><p><strong>${t('stepHint')}</strong> ${t(hint[question.evidenceType])}</p>${schedule}
          ${linkToCoach(focus, t('coachJump'))}</div>`;
      }
      if (!focus) return `<p class="field-help">${t('coachAmbiguous')}</p>`;
      const kind = Science.errorLabels[question.errorKinds?.[attempt.choice]];
      return `<div class="mistake-clue"><p>${kind ? t('scienceErrorClue', { kind: kind[language()] }) : t('coachSuggestion', { skill: skills[focus].label[language()] })}</p>
        ${linkToCoach(focus, t('coachJump'))}</div>`;
    }

    function renderDialogue(focus, progress, entryTurn) {
      const rounds = dialogueFor(focus);
      if (!rounds) return '';
      const phase = progress?.focus === focus && progress.entryTurn === entryTurn ? progress : { turn: entryTurn, choice: null };
      const [prompt, correct, distractor, right, wrong] = rounds[phase.turn];
      const options = phase.turn === 0 ? [distractor, correct] : [correct, distractor];
      const answered = phase.choice !== null;
      const accepted = phase.choice === 1 - phase.turn;
      return `<section class="coach-dialogue" aria-labelledby="coach-dialog-title">
        <h3 id="coach-dialog-title" tabindex="-1">${t('coachDialog')}</h3>
        <p class="section-note">${t('coachDialogStep', { n: phase.turn + 1 })}</p><p>${text(prompt)}</p>
        ${answered ? `<p class="worked-example" tabindex="-1" id="coach-reply"><strong>${t(accepted ? 'coachDialogAccept' : 'coachDialogRetry')}</strong> ${text(accepted ? right : wrong)}</p>
          ${phase.turn === 0 ? button(t('coachDialogNext'), 'coach-continue', 'secondary', `data-focus="${focus}"`)
            : `<p>${t('coachDialogEnd')}</p>${button(t('coachDialogReset'), 'coach-reset', 'secondary', `data-focus="${focus}"`)}`}`
          : `<div class="study-actions">${options.map((value, index) => button(text(value), 'coach-pick', 'secondary',
            `data-focus="${focus}" data-choice="${index}"`)).join('')}</div>`}
      </section>`;
    }

    function renderCoach(state, catalog, focus, dialogue, entryTurn = 0) {
      const profile = Coach.assessment(state, catalog);
      if (!Object.hasOwn(skills, focus)) {
        return `${heading(t('coach'), t('coachIntro'))}<section class="panel study-panel"><p>${t('coachBasis')}</p>
          <ul class="study-skill-list">${Object.keys(skills).map(id => `<li><a href="${coachUrl(id)}">${text(skills[id].label)}</a>
            <span class="section-note">${subjectName(skills[id].subject)} · ${t(statusKey(profile[id]))}</span></li>`).join('')}</ul></section>`;
      }
      const skill = skills[focus];
      const record = profile[focus];
      const trail = Coach.prerequisiteTrail(focus, profile);
      const modes = ['verified', 'scheduled'].includes(record.status) ? ['spaced', 'retake'] : record.status === 'confirmed' ? ['retake'] : ['probe', 'retake'];
      const ready = modes.filter(mode => (mode !== 'spaced' || (record.due && record.due <= Core.localDate(new Date())))
        && Coach.focusIds(state, focus, mode, undefined, record).length);
      return `${heading(text(skill.label), t('coachIntro'))}
        <div class="study-grid">
          <section class="panel study-panel" aria-labelledby="guide-title">
            <p class="eyebrow">${subjectName(skill.subject)} · ${t('coach')}</p>
            <h2 id="guide-title">${t('coachPrompt')}</h2>
            ${renderDialogue(focus, dialogue, entryTurn) || `<p>${text(skill.question)}</p>`}
            <details class="study-details"><summary>${t('coachHelp')}</summary><p>${text(skill.notice)}</p></details>
            <details class="study-details"><summary>${t('coachRule')}</summary><p>${text(skill.principle)}</p><p class="worked-example">${text(skill.example)}</p></details>
            ${skill.source ? `<p class="field-help"><a href="${escapeHtml(skill.source)}" target="_blank" rel="noopener noreferrer">${t('scienceSource')}</a></p>` : ''}
            ${trail.length ? `<h3>${t('coachTrace')}</h3><ol class="coach-trail">${trail.map(id => `<li>${linkToCoach(id)}</li>`).join('')}</ol>`
              : skill.prerequisites.length ? `<h3>${t('coachPrerequisites')}</h3><div class="study-actions">${skill.prerequisites.map(id => linkToCoach(id)).join('')}</div>` : ''}
          </section>
          <section class="panel study-panel" aria-labelledby="skill-check-title">
            <h2 id="skill-check-title">${t(statusKey(record))}</h2>
            ${record.equationLevel ? `<p>${t('coachEquationEvidence', { n: record.equationEvidence })}</p>` : ''}
            ${record.lastCheck ? `<p>${t('coachCheckSummary', record.lastCheck)}</p>` : ''}
            ${record.due ? `<p class="section-note">${record.due <= Core.localDate(new Date()) ? t('coachDueNow') : t('coachDue', { date: formatDate(record.due) })}</p>` : ''}
            <div class="study-actions">${ready.map(mode => button(t(mode), 'focus-practice', mode === ready[0] ? '' : 'secondary', `data-mode="${mode}" data-focus="${focus}"`)).join('')}</div>
            ${ready.length ? '' : `<p>${t('coachEmpty')}</p>${button(t('coachBankFallback'), 'topic-practice', 'secondary', `data-subject="${skill.subject}" data-topic="${skill.topic}"`)}`}
          </section>
        </div>`;
    }

    function renderFocusResult(state, catalog, session) {
      if (!session.focus) return '';
      const checkQuestion = session.mode === 'spaced' && catalog.find(question => question.id === session.questionIds[0] && question.purpose === 'followup');
      if (checkQuestion) {
        const tasks = Coach.lessonChecks(state, catalog);
        const task = tasks.find(item => item.focus === session.focus);
        const answer = state.attempts.find(attempt => attempt.sessionId === session.id && attempt.questionId === checkQuestion.id);
        const result = Coach.lessonCheckResult(state, catalog, session);
        return `<section class="panel study-panel focus-result"><h2>${t('lessonCheck')}</h2>
          <p>${t(!result ? 'lessonNotCounted' : result.independent ? result.weekly ? 'lessonWeeklyPassed' : result.equation ? 'lessonIndependent' : 'lessonPassed'
            : result.firstStepCorrect ? 'lessonFirstStepCorrect'
              : task?.id ? session.correct ? 'lessonHinted' : 'lessonRetry' : 'lessonUnavailable')}</p>
          ${result?.independent && task?.weekly && task.id ? `<p class="field-help">${lessonStatus(task)}</p>` : ''}
          ${answer && !answer.correct ? renderClue(checkQuestion, answer, tasks) : ''}
          <a href="#plan/checks">${t('lessonOpen')}</a></section>`;
      }
      const record = Coach.assessment(state, catalog, new Date(session.completedAt))[session.focus];
      return `<section class="panel study-panel focus-result"><h2>${text(skills[session.focus].label)}</h2>
        <p>${t(statusKey(record))}</p>${record.lastCheck ? `<p>${t('coachCheckSummary', record.lastCheck)}</p>` : ''}
        ${record.interval ? `<p>${t('coachDue', { date: formatDate(record.due) })}</p>` : ''}
        ${linkToCoach(session.focus, t('coachJump'))}</section>`;
    }
    const formatDate = date => new Date(date + 'T00:00:00').toLocaleDateString(locale(), { month: 'short', day: 'numeric' });
    function lessonStatus(task) {
      if (!task.id) return t('lessonUnavailable');
      if (task.ready) return t(task.weekly ? 'lessonWeeklyReady' : 'lessonReady');
      return t(task.weekly ? 'lessonWeeklyStartsOn' : 'lessonStartsOn', { date: formatDate(task.due) });
    }

    function renderLessonChecks(tasks) {
      if (!tasks.length) return '';
      return `<section class="panel study-panel" aria-labelledby="lesson-checks-title">
        <h2 id="lesson-checks-title" tabindex="-1">${t('lessonChecks')}</h2>
        <ul class="study-skill-list">${tasks.map(task => `<li data-lesson-focus="${task.focus}">
          <strong>${text(skills[task.focus].label)}</strong>
          <span class="section-note">${lessonStatus(task)}</span>
          ${task.ready ? button(t(task.resume ? 'resume' : 'lessonStart'), 'lesson-check', 'secondary', `data-focus="${task.focus}"`) : ''}
        </li>`).join('')}</ul></section>`;
    }

    function planTopicOptions(goal, value = '') {
      return [['', t('allTopics')], ...(topicsBySubject[goal] || []).map(id => [id, text(topics[id])])]
        .map(([id, label]) => `<option value="${id}" ${id === value ? 'selected' : ''}>${label}</option>`).join('');
    }

    function renderToday(plan, active, compact = false) {
      const tasks = plan.review.map(({ focus, mode, count }) => ({
        label: t('planReview', { topic: skills[focus].label[language()], n: count }),
        action: 'focus-practice', attrs: `data-focus="${focus}" data-mode="${mode}"`,
        key: 'skill:' + focus, reason: { probe: 'planReasonProbe', retake: 'planReasonRetake', spaced: 'planReasonSpaced' }[mode]
      }));
      tasks.unshift(...plan.todayChecks.map(({ focus, weekly }) => ({
        label: t(weekly ? 'lessonWeeklyStart' : 'lessonStartSkill', { skill: skills[focus].label[language()] }),
        action: 'lesson-check', attrs: `data-focus="${focus}"`, key: 'check:' + focus, reason: 'planReasonCheck' })));
      if (plan.bankReview) tasks.push({ label: t('planBankReview', {
        subject: subjects.find(item => item.id === plan.bankReview.subject).label[language()], n: plan.bankReview.count
      }), action: 'plan-review', key: 'bank:' + plan.bankReview.subject, reason: 'planReasonBank' });
      if (plan.practice) tasks.push({ label: t('planStart', { topic: topics[plan.practice.topic][language()], n: plan.practice.count }),
        action: 'plan-practice', key: 'practice:' + plan.practice.topic, reason: plan.practiceReason });
      if (active) tasks.unshift({ label: t('resume'), action: 'resume', reason: 'planReasonResume' });
      const [first, ...extra] = tasks;
      const renderTask = (task, style) => `<div class="daily-task">${button(task.label, task.action, style, task.attrs)}
        ${!compact && task.key ? button(t('planDefer'), 'plan-defer', 'ghost', `data-task="${task.key}"`) : ''}
        <p class="field-help">${t(task.reason)}</p></div>`;
      const deferredLabel = key => {
        const [kind, id] = key.split(':');
        if (kind === 'bank') return subjectName(id);
        return text(kind === 'practice' ? topics[id] : skills[id].label);
      };
      const done = Math.min(plan.target, plan.completed);
      const status = plan.completed >= plan.target ? 'planComplete' : plan.slots ? 'planDeferredOnly' : 'planBudgetDone';
      return `<section class="today-plan ${compact ? 'today-compact' : 'panel study-panel'}" aria-labelledby="daily-plan-title">
        <div class="daily-top"><div><h2 id="daily-plan-title">${t('planTask')}</h2><p>${t('planDailyTime', plan.settings)}</p></div>
          <strong class="daily-count" aria-hidden="true">${done}<span>/${plan.target}</span></strong></div>
        <div class="daily-dots" role="progressbar" aria-label="${t('planTask')}" aria-valuemin="0" aria-valuemax="${plan.target}" aria-valuenow="${done}"
          aria-valuetext="${t('planProgress', { n: plan.completed, target: plan.target })}">
          ${Array.from({ length: plan.target }, (_, index) => `<span class="${index < done ? 'filled' : ''}" aria-hidden="true">${index < done ? '✓' : ''}</span>`).join('')}
        </div>
        ${first ? renderTask(first) : `<strong class="daily-done">${t(status)}</strong> <a class="button secondary" href="#practice">${t('planOther')}</a>`}
        ${compact ? '' : `
          ${extra.length ? `<details class="study-details"><summary>${t('planMoreTasks')}</summary>${extra.map(task => renderTask(task, 'secondary')).join('')}</details>` : ''}
          ${plan.deferred.length ? `<ul class="study-skill-list deferred-tasks">${plan.deferred.map(([key, date]) => `<li>
            <span>${deferredLabel(key)} · ${t('planDeferred', { date: formatDate(date) })}</span>
            ${button(t('planRestore'), 'plan-restore', 'ghost', `data-task="${key}"`)}</li>`).join('')}</ul>` : ''}
          ${plan.placement && plan.slots && !active ? `<div class="study-actions">${button(t('planPlacement', {
            subject: subjects.find(item => item.id === plan.placement).label[language()]
          }), 'diagnostic', 'secondary', `data-subject="${plan.placement}"`)}</div>` : ''}
          ${plan.deadlineSoon ? `<p class="field-help">${t('planExamSoon')}</p>` : ''}
          ${plan.unavailableReview.length ? `<p class="field-help">${t('planNeedsVariants', { n: plan.unavailableReview.length })}</p>
            <div class="study-actions">${plan.unavailableReview.slice(0, 3).map(id => linkToCoach(id)).join('')}</div>` : ''}
        `}
      </section>`;
    }

    function pilotStatus(row) {
      if (row.session) {
        if (row.stage.evidence !== 'independent') return t('pilotDone');
        return `${t('pilotIndependent', { correct: row.answers.filter(answer => answer.correct).length, total: row.answers.length })} · ${formatDate(Core.localDate(new Date(row.session.completedAt)))}`;
      }
      return row.ready ? t('coachDueNow') : row.due ? t('pilotOnDate', { date: formatDate(row.due) }) : t('pilotLocked');
    }

    function renderPilot(state, subject) {
      const route = Pilot?.routes[subject];
      if (!route) return '';
      const approved = route.stages.every(stage => stage.items.every(item =>
        item.review.status === 'approved' && item.review.reviewer === 'DeepSeek'));
      return `<section class="study-details pilot-path" id="pilot-path" aria-labelledby="pilot-title">
        <h3 id="pilot-title" tabindex="-1">${t('pilotRoute')} · ${text(topics[route.topic])} · ${escapeHtml(route.level)}</h3>
        <p class="field-help">${t(approved ? 'pilotReviewed' : 'pilotPending')}</p>
        <ol class="study-skill-list">${Pilot.progress(state, route).map(row => `<li data-pilot-stage="${row.stage.id}">
          <strong>${text(row.stage.label)}</strong>
          ${approved && row.ready ? button(state.active?.subject === subject && Pilot.sessionStage(state.active) === row.stage
            ? t('resume') : t('pilotOpenStage', { stage: row.stage.label[language()] }), 'pilot-start', 'secondary',
            `data-subject="${subject}" data-stage="${row.stage.id}"`)
            : approved ? `<span class="field-help">${pilotStatus(row)}</span>` : ''}
        </li>`).join('')}</ol>
        <details class="study-details"><summary>${t('pilotPrerequisites')}</summary><ol>${Pilot.skillPath(route)
          .map(skill => `<li>${text(skill.label)}</li>`).join('')}</ol></details>
      </section>`;
    }

    function renderPilotReport(state, catalog) {
      const paths = Object.values(Pilot.routes).map(route => ({ route, rows: Pilot.progress(state, route) }))
        .filter(({ rows }) => rows[0].session);
      if (!paths.length) return '';
      return `<section class="panel study-panel" aria-labelledby="pilot-report-title">
        <h2 id="pilot-report-title">${t('pilotReport')}</h2><p class="field-help">${t('pilotReportBasis')} ${t('pilotStepBasis')}</p>
        <div class="study-grid">${paths.map(({ route, rows }) => `<section data-pilot-report="${route.subject}">
          <h3>${subjectName(route.subject)} · ${text(topics[route.topic])}</h3>
          <ul class="study-skill-list">${rows.filter(row => row.stage.evidence === 'independent').map(row => `<li>
            <strong>${text(row.stage.label)}</strong><span class="field-help">${pilotStatus(row)}</span></li>`).join('')}</ul>
          <table class="pilot-step-report"><thead><tr><th scope="col">${t('pilotStepSkill')}</th>
            ${rows.filter(row => row.stage.evidence === 'independent').map(row => `<th scope="col">${text(row.stage.label)}</th>`).join('')}</tr></thead>
            <tbody>${Pilot.stepResults(route, rows, catalog).map(row => `<tr><th scope="row">${text(row.label)}</th>
              ${row.results.map(mark => `<td data-step-mark="${mark ?? 'pending'}">${t(mark === null ? 'pilotStepPending' : mark ? 'pilotStepYes' : 'pilotStepNo')}</td>`).join('')}</tr>`).join('')}
            </tbody></table>
          ${button(t('pilotGoPath'), 'pilot-path', 'secondary', `data-subject="${route.subject}"`)}
        </section>`).join('')}</div></section>`;
    }

    function renderRoadmap(state, catalog, preferredSubject) {
      const subject = Object.hasOwn(topicsBySubject, preferredSubject) ? preferredSubject : 'english';
      const rows = Coach.roadmap(state, catalog, subject);
      function branch(parent) {
        return `<ul class="roadmap-branch">${rows.filter(row => row.parent === parent).map(row => {
          const status = row.due ? 'due' : row.verified ? 'verified' : row.seen ? 'started' : 'new';
          return `<li><div class="roadmap-node"><span class="roadmap-dot ${status}" aria-hidden="true"></span>
            <div>${button(text(topics[row.id]), 'topic-practice', 'roadmap-topic', `data-subject="${subject}" data-topic="${row.id}"`)}
              <span class="roadmap-status">${row.seen ? t('roadmapPractised', { n: row.seen }) : t('coachUntested')}
                ${row.due ? ` · ${t('coachDueNow')}` : ''}
                ${row.verified ? ` · ${t('roadmapVerified', { n: row.verified })}` : ''}</span>
            </div>${row.guide ? linkToCoach(row.guide, t('roadmapGuide')) : ''}
          </div>${rows.some(item => item.parent === row.id) ? branch(row.id) : ''}</li>`;
        }).join('')}</ul>`;
      }
      return `<section class="panel study-panel roadmap" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title">${t('roadmap')}</h2><p>${t('roadmapIntro')}</p>
        <div class="filters" role="group" aria-label="${t('subjects')}">${subjects.filter(item => item.available).map(item =>
          `<button type="button" class="filter-button ${item.id === subject ? 'active' : ''}" aria-pressed="${item.id === subject}"
            data-action="roadmap-subject" data-subject="${item.id}">${text(item.label)}</button>`).join('')}</div>
        ${renderPilot(state, subject)}
        ${branch('')}
      </section>`;
    }

    function renderPlan(state, catalog, preferredSubject) {
      const plan = Coach.learningPlan(state, catalog);
      const settings = plan.settings;
      const readyChecks = Object.values(Pilot.routes).flatMap(route => Pilot.progress(state, route)
        .filter(row => row.ready && row.stage.day > 0).map(row => ({ route, stage: row.stage })));
      function reviews(list) {
        const focuses = [...new Set(list.map(item => item.focus).filter(Boolean))];
        const ids = [...new Set(list.map(item => item.topic).filter(Boolean))];
        return [...focuses.map(id => linkToCoach(id)), ...ids.map(id => text(topics[id]))].join(' · ');
      }
      return `${heading(t('plan'), t('planSubtitle'))}
        ${renderToday(plan, state.active)}
        ${readyChecks.length ? `<section class="panel study-panel"><h2>${t('reportChecks')}</h2><div class="study-actions">
          ${readyChecks.map(({ route, stage }) => button(`${subjectName(route.subject)} · ${text(stage.label)}`, 'pilot-start', 'secondary',
            `data-subject="${route.subject}" data-stage="${stage.id}"`)).join('')}
        </div></section>` : ''}
        ${renderLessonChecks(plan.nextDay)}
        <section class="panel study-panel"><h2>${t('evidenceLessons')}</h2><div class="study-actions">
          ${Object.entries(globalThis.EachVeyaLessons.workshops).map(([subject, label]) =>
            button(t(label), 'lesson', 'secondary', `data-subject="${subject}"`)).join('')}</div>
          <p class="field-help">${t('lessonReview')}</p></section>
        ${renderRoadmap(state, catalog, preferredSubject || settings.goal)}
        <section class="panel study-panel plan-preview">
          <details class="study-details plan-settings"><summary>${t('planSettings')}</summary>
            <form id="plan-form" class="plan-form">
              ${selectField('plan-goal', t('planGoal'), [['all', t('planAll')], ['balanced', t('planBalanced')], ...subjects.filter(item => item.available).map(item => [item.id, subjectName(item.id)])], settings.goal)}
              <label class="field"><span>${t('planTopic')}</span><select id="plan-topic">${planTopicOptions(settings.goal, settings.topic)}</select></label>
              <label class="field"><span>${t('planMinutes')}</span><input id="plan-minutes" type="number" min="5" max="90" required value="${settings.minutes}"></label>
              <label class="field"><span>${t('planDeadline')}</span><input id="plan-deadline" type="date" value="${escapeHtml(settings.deadline)}"></label>
              <button class="button" type="submit">${t('planSave')}</button>
            </form>
          </details>
          <details class="study-details"><summary>${t('planUpcoming')}</summary><ul class="study-skill-list">${plan.week.map(item => `<li><strong>${formatDate(item.date)}</strong>
            <span>${item.scheduled.length ? `${t('planScheduled')} · ${reviews(item.scheduled)}` : `${t('planProposed')} · ${text(topics[item.topic])}`}</span></li>`).join('')}</ul></details>
          <details class="study-details"><summary>${t('planMonth')}</summary><ul class="study-skill-list">${plan.weeks.map(item => `<li><strong>${formatDate(item.from)} – ${formatDate(item.to)}</strong>
            <span>${t('planProposed')} · ${text(topics[item.topic])}</span>${item.scheduled.length ? `<span>${t('planScheduled')} · ${reviews(item.scheduled)}</span>` : ''}</li>`).join('')}</ul></details>
          <a class="button secondary" href="#report">${t('report')}</a>
        </section>`;
    }

    function renderCharts(daily, weekly) {
      const periodLabel = day => day.date === day.end ? formatDate(day.date) : `${formatDate(day.date)} – ${formatDate(day.end)}`;
      const max = Math.max(1, ...daily.map(day => day.total));
      const x = index => daily.length > 1 ? 49 + index * 531 / (daily.length - 1) : 300;
      const y = accuracy => 108 - accuracy * .9;
      const accuracy = daily.map((day, index) => day.accuracy === null ? '' : `
        ${index && daily[index - 1].accuracy !== null ? `<line x1="${x(index - 1)}" y1="${y(daily[index - 1].accuracy)}" x2="${x(index)}" y2="${y(day.accuracy)}"/>` : ''}
        <circle cx="${x(index)}" cy="${y(day.accuracy)}" r="4"><title>${periodLabel(day)} · ${day.accuracy}%</title></circle>`).join('');
      const dates = `<div class="chart-dates" aria-hidden="true"><span>${formatDate(daily[0].date)}</span>${daily.length > 1 ? `<span>${formatDate(daily.at(-1).end)}</span>` : ''}</div>`;
      return `<section class="panel study-panel report-charts">
        <figure><figcaption>${t(weekly ? 'reportWeeklyActivity' : 'reportActivity')}</figcaption><div class="report-bars" aria-hidden="true">${daily.map(day => `<span title="${periodLabel(day)} · ${day.total}" style="--bar-height:${day.total * 100 / max}%"></span>`).join('')}</div>${dates}</figure>
        <figure><figcaption>${t(weekly ? 'reportWeeklyAccuracy' : 'reportAccuracy')}</figcaption><svg class="report-line" viewBox="0 0 600 126" preserveAspectRatio="none" aria-hidden="true">
          <path class="chart-grid" d="M49 18H580 M49 63H580 M49 108H580"/><text x="2" y="22">100%</text><text x="2" y="67">50%</text><text x="2" y="112">0%</text>${accuracy}</svg>${dates}</figure>
        <details class="study-details"><summary>${t('reportTable')}</summary><div class="report-table"><table>
          <thead><tr><th scope="col">${t('reportDate')}</th><th scope="col">${t('answered')}</th><th scope="col">${t('accuracy')}</th></tr></thead>
          <tbody>${daily.map(day => `<tr><th scope="row">${periodLabel(day)}</th><td>${day.total}</td><td>${day.accuracy === null ? '—' : day.accuracy + '%'}</td></tr>`).join('')}</tbody>
        </table></div></details>
      </section>`;
    }

    function renderReport(state, catalog, days) {
      const report = Coach.report(state, catalog, days);
      const mastery = Object.fromEntries(Science.subjects.map(subject => [subject, Learning.subjectProfile(state, subject)]));
      const { recent, previous } = report;
      const seconds = Math.round(recent.durationMs / 1000);
      const nextTopic = Object.entries(report.topics).filter(([, row]) => (row.passages ?? row.distinct) >= 3)
        .sort((a, b) => a[1].accuracy - b[1].accuracy)[0]?.[0];
      const summary = (label, value, note = '') => `<div><dt>${t(label)}</dt><dd>${value}</dd>${note ? `<dd class="field-help">${note}</dd>` : ''}</div>`;
      return `${heading(t('report'), t('reportIntro'))}
        <div class="filters report-filters" role="group" aria-label="${t('reportFilters')}">${[[1, 'reportToday'], [7, 'reportWeek'], [30, 'reportMonth'], [90, 'reportQuarter']].map(([n, key]) =>
          `<button type="button" class="filter-button ${days === n ? 'active' : ''}" aria-pressed="${days === n}" data-action="report-window" data-days="${n}">${t(key)}</button>`).join('')}</div>
        <section class="panel study-panel"><dl class="report-totals">
          ${summary('answered', recent.total)}
          ${summary('accuracy', recent.accuracy === null ? t('coachUntested') : recent.accuracy + '%')}
          ${summary('reportTime', recent.timed ? t('reportTimeValue', { n: Math.floor(seconds / 60), seconds: seconds % 60 }) : t('noData'),
            recent.total ? t('reportTimeCoverage', recent) : '')}</dl>
          <p class="field-help">${recent.total && previous.total ? t('reportDelta', { ...recent, previousCorrect: previous.correct, previousTotal: previous.total }) : t('reportNoComparison')}</p>
        </section>
        ${renderPilotReport(state, catalog)}
        ${recent.total ? renderCharts(report.daily, days === 90) : ''}
        ${report.checks.length ? `<section class="panel study-panel report-checks"><h2>${t('reportChecks')}</h2>
          <ul class="study-skill-list">${report.checks.map(row => `<li><span class="section-note">${subjectName(skills[row.focus].subject)}</span>
            <a href="${coachUrl(row.focus)}">${text(skills[row.focus].label)}</a>
            <span class="field-help">${t('reportCheckStat', { ...row, date: formatDate(row.last) })}</span>
            ${typeof row.lastIndependent === 'boolean' ? `<span class="field-help">${t(row.lastIndependent ? 'reportLastIndependent'
              : row.lastFirstStepCorrect ? 'reportLastFirstStepCorrect' : 'reportLastNeedsPractice')}</span>` : ''}
            ${row.lastWeekly ? `<span class="field-help">${t('reportLastWeekly')}</span>` : ''}</li>`).join('')}</ul></section>` : ''}
        <section class="panel study-panel report-map"><h2>${t('reportMap')}</h2><p class="field-help">${t('reportSkillNote')}</p>
          <div class="study-grid">${Object.entries(topicsBySubject).map(([subject, ids]) => `<section><h3>${subjectName(subject)}</h3><ul class="study-skill-list">${ids.map(id => {
            const row = report.topics[id];
            const science = Science.topics[id];
            const verified = mastery[subject]?.[id]?.retained;
            return `<li>${science ? `<span class="section-note">${text(science.domainLabel)}</span>` : ''}<strong>${text(topics[id])}</strong><span class="field-help">${row.total ? t(id === 'reading' ? 'reportReadingEvidence' : 'reportEvidence', { ...row, n: row.distinct }) : t('coachUntested')}</span>
              ${science && (row.total || verified) ? `<span class="section-note">${verified ? t('scienceRetained', { level: verified }) : t('scienceUnverified')}</span>` : ''}
              ${row.total && (row.passages ?? row.distinct) < 3 ? `<span class="section-note">${t('reportSparse')}</span>` : ''}</li>`;
          }).join('')}</ul></section>`).join('')}</div>
        </section>
        <div class="study-grid report-recommendations"><section class="panel study-panel"><h2>${t('reportMistakes')}</h2>
          ${report.errors.length ? `<ul class="study-skill-list">${report.errors.map(row => `<li><a href="${coachUrl(row.focus)}">${text(skills[row.focus].label)}</a>
            <span class="field-help">${t('reportMistakeCount', row)}</span>
            ${row.kinds.length ? `<span class="field-help">${row.kinds.map(([kind, n]) => t('reportMistakeKind', { kind: Science.errorLabels[kind][language()], n })).join(' / ')}</span>` : ''}</li>`).join('')}</ul>` : `<p>${t('reportNoMistakes')}</p>`}
        </section><section class="panel study-panel"><h2>${t('reportNext')}</h2><div class="study-actions">
          ${report.errors.length ? linkToCoach(report.errors[0].focus, t('coachJump')) : nextTopic ? button(t('reportNextTopic', { topic: topics[nextTopic][language()] }), 'topic-practice', 'secondary',
            `data-subject="${Object.keys(topicsBySubject).find(subject => topicsBySubject[subject].includes(nextTopic))}" data-topic="${nextTopic}"`) : ''}
          <a class="button secondary" href="#plan">${t('plan')}</a></div></section></div>`;
    }

    function renderQuestionReport(question, flag) {
      return `<details class="study-details question-report" ${flag ? 'open' : ''}><summary>${t('flagQuestion')}</summary>
        <div class="study-actions"><label class="field"><span>${t('flagReason')}</span><select data-flag-reason>${Core.flagReasons.map(reason =>
          `<option value="${reason}" ${flag?.reason === reason ? 'selected' : ''}>${t(reason)}</option>`).join('')}</select></label>
          ${button(t('flagQuestion'), 'flag-question', 'secondary', `data-id="${escapeHtml(question.id)}"`)}</div>
        ${flag ? `<p role="status">${t('flagSaved')}</p>` : ''}</details>`;
    }

    function renderBackup(status, flags) {
      return `<details class="panel backup-panel" ${status ? 'open' : ''}><summary>${t('backups')}</summary><p>${t('backupHelp')}</p>
        <div class="study-actions">${button(t('backupExport'), 'backup-export', 'secondary')}${flags.length ? button(t('flagExport'), 'flag-export', 'secondary') : ''}</div>
        <form id="backup-form"><label class="field"><span>${t('backupFile')}</span><input type="file" accept=".json,application/json" id="backup-file" required></label>
          <button class="button secondary" type="submit">${t('backupImport')}</button></form>
        ${status ? `<p id="backup-status" role="status" tabindex="-1">${t(status.key, status)}</p>` : ''}
      </details>`;
    }

    return { renderEvidence, renderClue, renderCoach, renderFocusResult, renderToday, renderPlan, renderReport, renderBackup, renderQuestionReport, planTopicOptions };
  }
  globalThis.EachVeyaStudyUI = { copy, create, hasDialogue: focus => Object.hasOwn(guide, focus) || Object.hasOwn(Science.topics, focus) };
})();
