(function () {
  'use strict';
  const data = globalThis.SmartStudyData;
  const bi = data.bilingual;

  const skills = {
    balance: {
      subject: 'math', topic: 'algebra', level: 'L1', prerequisites: [],
      label: bi('等式两边做同一个运算', 'Keep both sides of an equation balanced'),
      notice: bi('找出需要从含 x 的一边移去的常数。', 'Find the constant attached to the side with x.'),
      question: bi('怎样消掉 x + 5 里的 +5？等式另一边要做什么？', 'How could you undo the +5 in x + 5? What must happen on the other side?'),
      principle: bi('在两边同时减 5，等式仍成立。遇到 x − 5，就在两边同时加 5。', 'Subtract 5 from both sides to keep the equality. For x − 5, add 5 to both sides.'),
      example: bi('x + 5 = 12 → x + 5 − 5 = 12 − 5 → x = 7。代回得到 7 + 5 = 12。', 'x + 5 = 12 → x + 5 − 5 = 12 − 5 → x = 7. Substitution gives 7 + 5 = 12.')
    },
    coefficient: {
      subject: 'math', topic: 'algebra', level: 'L1', prerequisites: [],
      label: bi('用除法消去系数', 'Undo multiplication by dividing'),
      notice: bi('3x 表示 3 乘以 x，目标是让 x 的系数变成 1。', '3x means 3 times x. The aim is to make the coefficient of x equal to 1.'),
      question: bi('3x = 18 中，两边做什么运算才能只留下 x？', 'What operation on both sides of 3x = 18 leaves x on its own?'),
      principle: bi('两边同时除以 3。即使系数是负数，也要用带符号的系数去除。', 'Divide both sides by 3. If the coefficient is negative, keep its sign when dividing.'),
      example: bi('3x = 18 → 3x ÷ 3 = 18 ÷ 3 → x = 6。', '3x = 18 → 3x ÷ 3 = 18 ÷ 3 → x = 6.')
    },
    distribution: {
      subject: 'math', topic: 'algebra', level: 'L3', prerequisites: ['balance', 'coefficient'],
      label: bi('把括号外的系数分配给每一项', 'Apply the multiplier to every term'),
      notice: bi('括号内有几项？找出括号外的共同乘数。', 'How many terms are inside the brackets? Identify the multiplier outside.'),
      question: bi('展开 3(x + 2) 时，除了 x，哪一项也要乘以 3？', 'When expanding 3(x + 2), which term besides x is multiplied by 3?'),
      principle: bi('括号内的每一项都要乘以外面的数。展开后再整理等式。', 'Multiply each term inside the brackets by the outside number. Then rearrange the equation.'),
      example: bi('3(x + 2) = 3x + 3 × 2 = 3x + 6。若等于 21，则 3x = 15，x = 5。', '3(x + 2) = 3x + 3 × 2 = 3x + 6. If this equals 21, then 3x = 15 and x = 5.')
    },
    'common-denominator': {
      subject: 'math', topic: 'arithmetic', level: 'L2', prerequisites: [],
      label: bi('分数相加前统一分母', 'Use a common denominator'),
      notice: bi('分母表示每一小份的大小。先问两种小份能不能直接合在一起数。', 'The denominator describes the size of each piece. Check whether the two fractions use pieces of the same size.'),
      question: bi('1/3 有几份 1/6？写成同样大小的小份后，哪些数可以相加？', 'How many sixths equal 1/3? Once both fractions use sixths, which numbers can you add?'),
      principle: bi('分子和分母同时乘以同一个数，得到等值分数。同分母后只加分子。', 'Multiply the numerator and denominator by the same number to get an equivalent fraction. Then add the numerators.'),
      example: bi('1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2。', '1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.')
    },
    agreement: {
      subject: 'english', topic: 'grammar', level: 'A1', prerequisites: [],
      label: bi('一般现在时的主谓一致', 'Subject–verb agreement in the present simple'),
      notice: bi('先找真正发出动作的主语，再看是一个人还是多个人。', 'Find the subject performing the action. Is it one person or more than one?'),
      question: bi('比较 She 和 They。哪个主语搭配 plays，哪个搭配 play？', 'Compare “she” and “they”. Which subject takes “plays” and which takes “play”?'),
      principle: bi('一般现在时的肯定句里，he、she、it 或单数第三人称主语通常搭配带 -s 的动词形式。', 'In affirmative present-simple sentences, he, she, it and singular third-person subjects normally take the -s form.'),
      example: bi('She plays after school. They play after school. 两句都说习惯，主语决定动词形式。', 'She plays after school. They play after school. Both describe habits. The subject determines the verb form.')
    },
    'past-simple': {
      subject: 'english', topic: 'grammar', level: 'A2', prerequisites: [],
      label: bi('根据时间线索选择一般过去时', 'Use time clues to choose the past simple'),
      notice: bi('圈出指向已结束时间的词，例如 yesterday 或 last week。', 'Look for words that point to a finished time, such as yesterday or last week.'),
      question: bi('句子出现 last night 时，动作发生在什么时候？动词应该用哪个时态？', 'If the sentence says “last night”, when did the action happen? Which tense fits?'),
      principle: bi('描述发生在明确、已结束时间里的事件时，可以用一般过去时。规则动词常加 -ed。', 'Use the past simple for an event in a clearly finished time. Regular verbs usually take -ed.'),
      example: bi('They visit weekly. → They visited yesterday. 时间线索从习惯变成已经结束的过去。', 'They visit weekly. → They visited yesterday. The time clue changes from a routine to a finished past event.')
    },
    'text-evidence': {
      subject: 'english', topic: 'reading', level: 'A2', prerequisites: [],
      label: bi('用原文证据核对选项', 'Check each claim against the text'),
      notice: bi('先找问题问的是谁、哪里、时间，还是数量。', 'Identify what you are being asked about: a person, a place, a time or a number.'),
      question: bi('哪一句能支持你的选择？答案里有没有原文没有说的信息？', 'Which sentence supports your choice? Does the option add anything the text never says?'),
      principle: bi('选项可以用不同的词转述原意，但人物、时间和数量都要一致。', 'An option may paraphrase the text, while keeping the people, time and quantities consistent.'),
      example: bi('原文说周一比周五来的人多，可以判断周一访客更多。原文没有说明人数正好翻倍。', 'If the passage says more people came on Monday than on Friday, Monday had more visitors. The passage gives no evidence that the number doubled.')
    }
  };

  // Only annotate a wrong choice when it matches a specific, defensible pattern.
  const existing = {
    'ma-a01': { focus: ['balance', 'coefficient'], errors: { 3: 'coefficient' } },
    'ma-n01': { focus: ['common-denominator'], errors: { 0: 'common-denominator', 2: 'common-denominator' } },
    'en-g01': { focus: ['agreement'], errors: { 0: 'agreement' } },
    'en-dx-a2-g': { focus: ['past-simple'], errors: { 1: 'past-simple', 2: 'past-simple', 3: 'past-simple' } },
    'en-pr-b2-r1': { focus: ['text-evidence'], errors: { 1: 'text-evidence', 2: 'text-evidence', 3: 'text-evidence' } }
  };
  for (const question of data.questions) {
    if (existing[question.id]) Object.assign(question, existing[question.id]);
  }

  // Map only distractors that point to a recognisable misunderstanding.
  const scienceClues = {
    'b400-physics-forces-motion-net-L3-direct': [2, 'direction'],
    'b400-physics-fluid-models-contact-L3-direct': [3, 'area-denominator'],
    'b400-chemistry-atomic-structure-anion-L1-concept': [0, 'electron-proton'],
    'b400-chemistry-equation-models-coefficient-L1-concept': [3, 'coefficient-subscript'],
    'b400-chemistry-mole-calculations-from-mass-L1-concept': [1, 'mass-amount'],
    'b400-biology-cell-transport-balance-L1-concept': [1, 'net-flow'],
    'b400-biology-natural-selection-frequency-change-L1-concept': [2, 'count-versus-share']
  };
  for (const question of data.questions) {
    const clue = scienceClues[question.id];
    if (!clue) continue;
    const [choice, kind] = clue;
    if (choice === question.answer) throw new Error('Invalid science clue for ' + question.id);
    question.errors = { ...question.errors, [choice]: question.topic };
    question.errorKinds = { ...question.errorKinds, [choice]: kind };
  }

  const numeric = values => values.map(value => bi(String(value), String(value)));

  function add(skill, key, index, variant, prompt, options, explanation, tagged, verification) {
    if (options.length !== 4 || ['zh', 'en'].some(lang => new Set(options.map(option => option[lang])).size !== 4)) {
      throw new Error('Invalid template options for ' + key);
    }
    const info = skills[skill];
    const id = 'focus-' + skill + '-' + key + '-' + (index + 1);
    const answer = (index + (variant === 'step' ? 0 : 1)) % 4;
    const order = [1, 2, 3];
    order.splice(answer, 0, 0);
    const errors = Object.fromEntries(order.flatMap((option, position) => tagged.includes(option) ? [[position, skill]] : []));
    data.questions.push({
      id, subject: info.subject, topic: info.topic, level: info.level, curriculumRefs: [],
      ...(info.subject === 'math' ? { skill: 'calculation' } : { track: 'cefr' }),
      focus: [skill], errors, variant, variantGroup: index, prompt, options: order.map(option => options[option]), answer, verification,
      ...(variant === 'step' ? { focusOnly: true } : {}),
      hint: info.notice, explanation
    });
  }

  // Each full calculation has a short diagnostic question that isolates the targeted step.
  for (let index = 0; index < 12; index++) {
    const x = index + 2;
    const b = 3 + index % 5;
    const a = 2 + index % 4;
    const total = x + b;
    const product = a * x;
    add('balance', 'operation', index, 'step',
      bi(`方程 x + ${b} = ${total}。要去掉左边的 +${b}，右边应做什么？`, `In x + ${b} = ${total}, what should you do to the right side when removing +${b} from the left?`),
      [bi(`减 ${b}`, `Subtract ${b}`), bi(`加 ${b}`, `Add ${b}`), bi(`乘 ${b}`, `Multiply by ${b}`), bi('保持原样', 'Leave it as it is')],
      bi(`两边同时减 ${b}，右边变为 ${x}。`, `Subtract ${b} from both sides. The right side becomes ${x}.`), [1, 3]);
    add('balance', 'subtract', index, 'apply',
      bi(`解方程 x − ${b} = ${x + 1}。`, `Solve x − ${b} = ${x + 1}.`),
      numeric([total + 1, x + 1 - b, x + 1, total + 2]),
      bi(`两边同时加 ${b}，得 x = ${total + 1}。`, `Add ${b} to both sides to give x = ${total + 1}.`), [1, 2],
      { kind: 'equation', a: 1, b: -b, c: 0, d: x + 1 });
    add('coefficient', 'operation', index, 'step',
      bi(`方程 ${a}x = ${product}。为了让 x 的系数变成 1，两边要做什么？`, `In ${a}x = ${product}, what operation on both sides makes the coefficient of x equal to 1?`),
      [bi(`除以 ${a}`, `Divide by ${a}`), bi(`减去 ${a}`, `Subtract ${a}`), bi(`乘以 ${a}`, `Multiply by ${a}`), bi(`加上 ${a}`, `Add ${a}`)],
      bi(`${a}x ÷ ${a} = x，因此右边也除以 ${a}。`, `${a}x ÷ ${a} = x, so divide the right side by ${a} as well.`), [1, 2, 3]);
    add('coefficient', 'solve', index, 'apply',
      bi(`解方程 ${a}x = ${product}。`, `Solve ${a}x = ${product}.`), numeric([x, product, product * a, x + 1]),
      bi(`两边除以 ${a}，得 x = ${x}。`, `Divide both sides by ${a} to get x = ${x}.`), [1, 2],
      { kind: 'equation', a, b: 0, c: 0, d: product });
    const rhs = (a - 1) * x + a * b;
    const expandOptions = [a * b, b, a + b, a * b + 1];
    if (a * b === a + b) expandOptions[2] = -a * b;
    add('distribution', 'expand', index, 'step',
      bi(`展开 ${a}(x + ${b}) 时，常数项是多少？`, `What is the constant term when you expand ${a}(x + ${b})?`),
      numeric(expandOptions), bi(`常数项是 ${a} × ${b} = ${a * b}。`, `The constant is ${a} × ${b} = ${a * b}.`), [1],
      { kind: 'product', a, b });
    const partial = (rhs - b) / (a - 1);
    const distinctOptions = [...new Set([x, partial, x + a, x + 1, x - 1, x + 2])].slice(0, 4);
    add('distribution', 'solve', index, 'apply',
      bi(`解方程 ${a}(x + ${b}) = x + ${rhs}。`, `Solve ${a}(x + ${b}) = x + ${rhs}.`),
      numeric(distinctOptions),
      bi(`展开得 ${a}x + ${a * b}，整理得 ${a - 1}x = ${rhs - a * b}，所以 x = ${x}。`,
        `Expand to ${a}x + ${a * b}. Rearranging gives ${a - 1}x = ${rhs - a * b}, so x = ${x}.`), [1],
      { kind: 'equation', a, b: a * b, c: 1, d: rhs });
    const small = index + 3;
    const multiple = 2 + index % 3;
    const denominator = small * multiple;
    add('common-denominator', 'convert', index, 'step',
      bi(`将 1/${small} 写成分母为 ${denominator} 的分数，分子是多少？`, `Rewrite 1/${small} with denominator ${denominator}. What is the numerator?`),
      numeric([multiple, 1, multiple + 1, denominator]),
      bi(`分母乘了 ${multiple}，分子也要乘 ${multiple}。`, `The denominator was multiplied by ${multiple}, so multiply the numerator by ${multiple} too.`), [1],
      { kind: 'quotient', a: denominator, b: small });
    add('common-denominator', 'sum', index, 'apply',
      bi(`计算 1/${small} + 1/${denominator}。`, `Calculate 1/${small} + 1/${denominator}.`),
      numeric([`${multiple + 1}/${denominator}`, `2/${small + denominator}`, `2/${denominator}`, `1/${denominator}`]),
      bi(`先把 1/${small} 化成 ${multiple}/${denominator}。分子相加得 ${multiple + 1}/${denominator}。`,
        `Rewrite 1/${small} as ${multiple}/${denominator}. Add numerators to get ${multiple + 1}/${denominator}.`), [1, 2],
      { kind: 'fraction-sum', a: small, b: denominator });
  }

  const englishItems = {
    agreement: [
      ['step', 'The singer practises every day.', ['The singer', 'every day', 'practises', 'the day'], 'Which words are the subject?', 'The singer is the person doing the action.', [1, 2]],
      ['apply', 'My brother ___ his bike on Saturdays.', ['rides', 'ride', 'riding', 'ridden'], 'Choose the verb.', 'My brother is singular, so rides fits.', [1]],
      ['apply', 'The nurses ___ at seven each morning.', ['start', 'starts', 'starting', 'started'], 'Complete the present-simple sentence.', 'The nurses is plural. Use start with this plural subject.', [1]],
      ['step', 'Her cousins play tennis after school.', ['Her cousins', 'tennis', 'after school', 'play tennis'], 'Which words are the subject?', 'Her cousins names the people doing the action.', [1, 3]],
      ['apply', 'Julia ___ water after each run.', ['drinks', 'drink', 'drinking', 'drunk'], 'Choose the verb.', 'Julia is one person, so drinks fits.', [1]],
      ['apply', 'The kittens ___ under the chair every afternoon.', ['sleep', 'sleeps', 'sleeping', 'slept'], 'Complete the present-simple sentence.', 'The kittens is plural. Use sleep.', [1]]
    ],
    'past-simple': [
      ['step', 'We cleaned the classroom yesterday.', ['yesterday', 'the classroom', 'we', 'cleaned the classroom'], 'Which word directly names the time?', 'Yesterday specifies a finished time.', [1, 2, 3]],
      ['apply', 'Mina ___ the picture last night.', ['painted', 'paints', 'will paint', 'is painting'], 'Choose the verb.', 'Last night is a finished past time. Use painted.', [1, 2, 3]],
      ['apply', 'Two days ago, they ___ at the station.', ['arrived', 'arrive', 'will arrive', 'are arriving'], 'Choose the verb.', 'Two days ago points to a finished past event. Use arrived.', [1, 2, 3]],
      ['step', 'Last Monday, Leo walked to the shop.', ['Last Monday', 'the shop', 'Leo', 'walked'], 'Which words directly name the time?', 'Last Monday provides the time of the action.', [1, 2]],
      ['apply', 'I ___ my aunt last Sunday.', ['called', 'call', 'will call', 'am calling'], 'Choose the verb.', 'Last Sunday sets a finished past time. Use called.', [1, 2, 3]],
      ['apply', 'They ___ the game an hour ago.', ['finished', 'finish', 'will finish', 'are finishing'], 'Choose the verb.', 'An hour ago is a past time cue. Use finished.', [1, 2, 3]]
    ],
    'text-evidence': [
      ['step', 'Lena left the blue bag at home. She carried a small brown box to the station.',
        ['She carried a small brown box.', 'The bag was brown.', 'She took the bag to the station.', 'She left the box at home.'],
        'Which statement does the text support?', 'The second sentence says she carried a small brown box to the station.', [1, 2, 3]],
      ['apply', 'The bus leaves the library at 8:15 and reaches the park at 8:40.',
        ['8:40', '8:15', '8:25', '8:55'], 'When does the bus reach the park?', 'The second time, 8:40, is attached to reaches the park.', [1]],
      ['apply', 'Mei borrowed one comic and two history books. She returned the comic on Monday.',
        ['Two history books', 'One history book', 'Two comics', 'Three history books'],
        'What did Mei borrow besides the comic?', 'The first sentence says she also borrowed two history books.', [1, 2, 3]],
      ['step', 'The shop opens late on Friday. It closes at six as usual.',
        ['The shop still closes at six on Friday.', 'The shop opens at six on Friday.', 'The shop closes late on Friday.', 'The shop is closed all Friday.'],
        'Which statement is supported?', 'The second sentence confirms closing time is unchanged at six.', [1, 2, 3]],
      ['apply', 'Omar chose the train because the roads were snowy. Ava took the bus.',
        ['The roads were snowy.', 'Ava asked him to come.', 'The bus was free.', 'He wanted to drive.'],
        'Why did Omar choose the train?', 'Because the roads were snowy gives the stated reason.', [1, 2, 3]],
      ['apply', 'The pool is open from Tuesday to Sunday. Lessons take place on Wednesday and Friday.',
        ['Wednesday and Friday', 'Tuesday and Sunday', 'Monday only', 'Every day'],
        'When are swimming lessons?', 'The second sentence gives the two lesson days.', [1, 2, 3]]
    ]
  };
  const translatedInstructions = {
    'Which words are the subject?': '哪几个词是主语？',
    'Choose the verb.': '选择正确的动词形式。',
    'Complete the present-simple sentence.': '补全一般现在时的句子。',
    'Which word directly names the time?': '哪个词直接指明时间？',
    'Which words directly name the time?': '哪些词直接指明时间？',
    'Which statement does the text support?': '哪项陈述有原文支持？',
    'When does the bus reach the park?': '公交车什么时候到公园？',
    'What did Mei borrow besides the comic?': '除了漫画，Mei 还借了什么？',
    'Which statement is supported?': '哪项陈述有原文支持？',
    'Why did Omar choose the train?': 'Omar 为什么选火车？',
    'When are swimming lessons?': '哪两天有游泳课？'
  };
  const translations = {
    agreement: [
      'The singer 是在做动作的人，因此是主语。', 'My brother 是单数第三人称，因此用 rides。', 'The nurses 是复数，因此用 start。',
      'Her cousins 指做这个动作的人，因此是主语。', 'Julia 是单数第三人称，因此用 drinks。', 'The kittens 是复数，因此用 sleep。'
    ],
    'past-simple': [
      'Yesterday 指已经结束的昨天。', 'Last night 是已经过去的时间，因此用 painted。', 'Two days ago 指两天前，因此用 arrived。',
      'Last Monday 指明事件发生的时间。', 'Last Sunday 是已经结束的时间，因此用 called。', 'An hour ago 指一小时前，因此用 finished。'
    ],
    'text-evidence': [
      '第二句明确说 Lena 拎着一个棕色小盒子去了车站。', 'reaches the park 对应第二个时间 8:40。', '第一句说除了漫画，她还借了两本历史书。',
      '第二句说商店仍然照常在六点关门。', 'because the roads were snowy 给出了 Omar 选火车的理由。', '第二句给出的上课时间是星期三和星期五。'
    ]
  };
  for (const [skill, items] of Object.entries(englishItems)) {
    items.forEach(([variant, sentence, options, instruction, explanation, tagged], index) => {
      add(skill, 'language', index, variant, bi(`${translatedInstructions[instruction]}\n${sentence}`, `${instruction}\n${sentence}`),
        options.map(option => bi(option, option)), bi(translations[skill][index], explanation), tagged);
    });
  }

  const reviewEnglish = {
    agreement: [
      ['The bus ___ here every morning.', ['stops', 'stop', 'stopping', 'stopped'], 'The bus 是单数，用 stops。', 'The bus is singular. Use stops.'],
      ['Rui and Ana ___ together after school.', ['walk', 'walks', 'walking', 'walked'], 'Rui and Ana 指两个人，用 walk。', 'Rui and Ana names two people. Use walk.'],
      ['My neighbour ___ two cats.', ['has', 'have', 'having', 'had'], 'My neighbour 是单数第三人称，用 has。', 'My neighbour is singular. The third-person form is has.'],
      ['The lights ___ on at six every evening.', ['come', 'comes', 'coming', 'came'], 'The lights 是复数，用 come。', 'The lights is plural. Use come.'],
      ['Our coach ___ the team every Wednesday.', ['meets', 'meet', 'meeting', 'met'], 'Our coach 是单数，用 meets。', 'Our coach is singular. Use meets.'],
      ['Those children ___ the answer.', ['know', 'knows', 'knowing', 'knew'], 'Those children 是复数，用 know。', 'Those children is plural. Use know.']
    ],
    'past-simple': [
      ['Aya ___ her keys yesterday morning.', ['lost', 'loses', 'will lose', 'is losing'], 'Yesterday morning 是已结束的时间，lose 的过去式是 lost。', 'Yesterday morning is over. Lost is the past form of lose.'],
      ['The train ___ ten minutes ago.', ['left', 'leaves', 'is leaving', 'will leave'], 'Ten minutes ago 对应过去式 left。', 'Ten minutes ago calls for the past form left.'],
      ['Last Tuesday, we ___ the classroom windows.', ['opened', 'open', 'are opening', 'will open'], 'Last Tuesday 是已结束的时间，用 opened。', 'Last Tuesday is a finished past time. Use opened.'],
      ['I ___ an email to Max yesterday afternoon.', ['sent', 'send', 'am sending', 'will send'], 'Yesterday afternoon 指过去，send 的过去式是 sent。', 'Yesterday afternoon calls for sent, the past form of send.'],
      ['They ___ the garden last weekend.', ['watered', 'water', 'are watering', 'will water'], 'Last weekend 表示已结束的过去，用 watered。', 'Last weekend is over. Use watered.'],
      ['Two months ago, we ___ the bus to the coast.', ['took', 'take', 'are taking', 'will take'], 'Two months ago 指过去，take 的过去式是 took。', 'Two months ago points to the past. Took is the past form of take.']
    ]
  };
  for (const [skill, items] of Object.entries(reviewEnglish)) {
    items.forEach(([sentence, options, zh, en], index) => {
      const instruction = skill === 'agreement' ? bi('补全一般现在时的句子。', 'Complete the present-simple sentence.') : bi('选择正确的动词形式。', 'Choose the correct verb form.');
      add(skill, 'review', 6 + index, 'apply', bi(instruction.zh + '\n' + sentence, instruction.en + '\n' + sentence),
        options.map(option => bi(option, option)), bi(zh, en), skill === 'agreement' ? [1] : [1, 2, 3]);
    });
  }

  const readingReview = [
    ['Room 5 is for art. The music club meets in Room 8 on Thursday.', '音乐社团在哪儿集合？', 'Where does the music club meet?',
      ['Room 8', 'Room 5', 'Room 3', 'In the gym'], '第二句明确说音乐社团在八号房间集合。', 'The second sentence puts the music club in Room 8.'],
    ['The market sells bread in the morning. Fresh fruit arrives after lunch.', '哪项陈述有原文支持？', 'Which claim is supported?',
      ['Fresh fruit arrives after lunch.', 'Fresh fruit arrives before breakfast.', 'Bread arrives after lunch.', 'The market only sells fruit.'],
      '原文第二句明确说新鲜水果午饭后送到。', 'The second sentence gives the arrival time for fresh fruit.'],
    ['Elias packed a hat for himself and a spare jacket for his sister.', 'Elias 给妹妹带了什么？', 'What did Elias pack for his sister?',
      ['A spare jacket', 'A hat', 'A scarf', 'A pair of shoes'], 'for his sister 对应一件备用夹克。', 'For his sister belongs to a spare jacket.'],
    ['The science show lasted twenty minutes. The talk that followed lasted ten minutes.', '讲座持续了多久？', 'How long was the talk?',
      ['Ten minutes', 'Twenty minutes', 'Thirty minutes', 'An hour'], '第二句写明后面的讲座持续十分钟。', 'The second sentence specifies ten minutes for the talk.'],
    ['The park café only accepts cash. The bookshop next door accepts cards.', '哪个地方接受刷卡？', 'Which place accepts cards?',
      ['The bookshop', 'The park café', 'Both places', 'The passage does not say.'], '第二句说隔壁书店可以刷卡。', 'The second sentence says the bookshop accepts cards.'],
    ['Hana put the tickets in a red envelope. She left the envelope beside the keys.', 'Hana 把信封放在了哪里？', 'Where did Hana leave the envelope?',
      ['Beside the keys', 'Inside a drawer', 'Under the table', 'In a blue box'], '第二句明确说信封在钥匙旁边。', 'The second sentence places the envelope beside the keys.']
  ];
  readingReview.forEach(([sentence, instructionZh, instructionEn, options, zh, en], index) => {
    add('text-evidence', 'review', 6 + index, 'apply', bi(instructionZh + '\n' + sentence, instructionEn + '\n' + sentence),
      options.map(option => bi(option, option)), bi(zh, en), [1, 2, 3]);
  });

  function decorateEquation(question, spec) {
    const { a, b, c, d, form } = spec;
    const grouped = form === 'grouped';
    const offset = grouped ? a * b : b;
    const coefficient = a - c;
    const focus = [grouped && 'distribution', offset !== 0 && 'balance', Math.abs(coefficient) !== 1 && 'coefficient'].filter(Boolean);
    const patterns = [
      [grouped && (d - b) / coefficient, grouped && 'distribution'],
      [offset && (d + offset) / coefficient, offset && 'balance'],
      [Math.abs(coefficient) !== 1 && d - offset, Math.abs(coefficient) !== 1 && 'coefficient']
    ];
    const errors = {};
    question.options.forEach((option, index) => {
      const matches = patterns.filter(([value, skill]) => skill && value === Number(option.en));
      if (index !== question.answer && matches.length === 1) errors[index] = matches[0][1];
    });
    return { ...question, focus, errors, equationStep: { coefficient, offset, right: d, grouped },
      ...(question.ai && spec.level === 'L2' ? { equationFamily: 'linear' } : {}) };
  }

  Object.assign(skills, globalThis.EachVeyaScience.topics);
  for (const [topic, prerequisite] of [
    ['fluid-models', 'forces-motion'],
    ['equation-models', 'atomic-structure'],
    ['amount-concentration', 'mole-calculations'],
    ['mole-calculations', 'atomic-structure'],
    ['natural-selection', 'trait-frequency']
  ]) {
    skills[topic] = { ...skills[topic], prerequisites: [prerequisite] };
  }

  // These questions are reserved for independent checks after instruction.
  // Only a distractor that expresses the named misconception counts as evidence.
  const foundationChecks = {
    'forces-motion': ['direction', [
      ['向东 11 N、向西 3 N 的两个力作用在同一物体上。合力是多少？|Two forces of 11 N east and 3 N west act on one object. Find the net force.',
        '向东 8 N|8 N east~向东 14 N|14 N east~向西 8 N|8 N west~向东 11 N|11 N east', '向东为正，11 − 3 = 8 N。|With east positive, 11 − 3 = 8 N.'],
      ['同一物体受到大小都是 7 N、方向相反的两个力。合力大小是多少？|Two opposing forces of 7 N each act on an object. What is the net force magnitude?',
        '0 N~14 N~7 N~49 N', '大小相同、方向相反的两个力相互抵消。|Equal forces in opposite directions cancel.']
    ]],
    'wave-behaviour': ['frequency-period', [
      ['某振动 5 秒完成 20 个周期，频率是多少？|An oscillation completes 20 cycles in 5 seconds. What is the frequency?',
        '4 Hz~0.25 Hz~20 Hz~100 Hz', '频率是每秒周期数，20 ÷ 5 = 4 Hz。|Frequency is cycles per second: 20 ÷ 5 = 4 Hz.'],
      ['一个信号的频率为 2 Hz。一个周期用时多少？|A signal has frequency 2 Hz. How long is one cycle?',
        '0.5 s~2 s~4 s~1 s', '每秒两个周期，一个周期用时 1/2 秒。|Two cycles each second means one cycle takes half a second.']
    ]],
    'thermal-models': ['heat-rate', [
      ['虚拟记录显示 8 秒内传热 96 J。平均每秒传热多少？|A virtual record shows 96 J transferred in 8 seconds. What is the average transfer per second?',
        '12 J~1/12 J~88 J~96 J', '能量除以用时，96 ÷ 8 = 12 J 每秒。|Divide the energy by the time: 96 ÷ 8 = 12 J per second.'],
      ['热容为 15 J/K 的物体吸收 45 J，且没有相变。温度增加多少？|An object with heat capacity 15 J/K absorbs 45 J without changing phase. How much does its temperature rise?',
        '3 K~1/3 K~30 K~45 K', '升高 1 K 需要 15 J，因此 45 ÷ 15 = 3 K。|Each kelvin requires 15 J, so the increase is 45 ÷ 15 = 3 K.']
    ]],
    'fluid-models': ['area-denominator', [
      ['24 N 的垂直力均匀作用在 4 m² 上，平均压强是多少？|A perpendicular force of 24 N is spread uniformly over 4 m². What is the average pressure?',
        '6 Pa~96 Pa~20 Pa~28 Pa', '用力除以面积，24 ÷ 4 = 6 Pa。|Divide force by area: 24 ÷ 4 = 6 Pa.'],
      ['垂直力保持不变，均匀受力的面积变成原来的 3 倍。平均压强变成多少？|The perpendicular force is unchanged and the area it acts on uniformly triples. What happens to the average pressure?',
        '变为原来的 1/3|It becomes one third as large~变为原来的 3 倍|It triples~保持不变|It stays the same~变为零|It becomes zero', '面积在分母，乘 3 后，压强除以 3。|Area is in the denominator. Tripling it divides the pressure by three.']
    ]],
    'atomic-structure': ['electron-proton', [
      ['中性原子失去一个电子，哪一类粒子的数量减少？|A neutral atom loses one electron. Which particle count decreases?',
        '电子|Electrons~质子|Protons~中子|Neutrons~质子和中子|Protons and neutrons', '形成离子时这里改变的是电子数，原子核组成保持不变。|The electron count changes. The nucleus keeps the same composition.'],
      ['一种一价负离子有 9 个质子。它有多少个电子？|A singly negative ion contains 9 protons. How many electrons does it have?',
        '10~9~8~18', '质子仍是 9 个，多一个电子后总电荷为 −1。|The 9 protons remain. One additional electron gives charge −1.']
    ]],
    'equation-models': ['coefficient-subscript', [
      ['4H₂O 表示的氢原子总数是多少？|How many hydrogen atoms are represented by 4H₂O?',
        '8~2~4~12', '每个水分子有 2 个氢原子，4 个共有 8 个。|Each water molecule has 2 hydrogen atoms. Four contain 8.'],
      ['3NH₃ 表示的氢原子总数是多少？|How many hydrogen atoms are represented by 3NH₃?',
        '9~3~6~12', '每个分子有 3 个氢原子，3 个共有 9 个。|There are 3 hydrogen atoms per molecule and 3 molecules, giving 9.']
    ]],
    'mole-calculations': ['mass-amount', [
      ['某样品质量 36 g，摩尔质量 18 g/mol。物质的量是多少？|A sample has mass 36 g and molar mass 18 g/mol. What is its amount?',
        '2 mol~18 mol~648 mol~0.5 mol', '用质量除以摩尔质量，36 ÷ 18 = 2 mol。|Divide the mass by molar mass: 36 ÷ 18 = 2 mol.'],
      ['两份纯物质的质量相等。摩尔质量较大的那份，物质的量如何？|Two pure samples have equal mass. What is true of the amount in the one with larger molar mass?',
        '较小|Smaller~一定相等|They are always equal~较大|Larger~一定为零|It must be zero', '质量固定，n = m/M。分母较大，商较小。|For fixed mass, n = m/M. The larger denominator gives a smaller amount.']
    ]],
    'acid-base-models': ['log-scale', [
      ['某模型的 pH 从 7 降到 6。氢离子活度变为原来的多少倍？|A model’s pH falls from 7 to 6. By what factor does its hydrogen-ion activity change?',
        '10 倍|10 times~1 倍|1 time~0.1 倍|0.1 times~100 倍|100 times', 'pH 下降一个单位，对应活度乘 10。|A one-unit pH decrease multiplies the activity by ten.'],
      ['甲的 pH 为 4，乙为 6。甲的氢离子活度是乙的多少倍？|A has pH 4 and B has pH 6. How many times as large is the hydrogen-ion activity in A?',
        '100 倍|100 times~2 倍|2 times~10 倍|10 times~0.01 倍|0.01 times', '相差两个 pH 单位，活度比为 10 × 10 = 100。|Two pH units give an activity ratio of 10 × 10 = 100.']
    ]],
    'cell-transport': ['net-flow', [
      ['在模拟中，每秒有 9 个粒子从甲到乙，4 个从乙到甲。每秒净移到乙多少个？|In a simulation, 9 particles per second move from A to B and 4 from B to A. What is the net count entering B each second?',
        '5~13~9~4', '净量是进入减离开，9 − 4 = 5。|Subtract the outgoing count from the incoming count: 9 − 4 = 5.'],
      ['模拟中每秒各有 6 个粒子向相反方向跨膜。每秒净通过多少个？|In a model, 6 particles per second cross a membrane in each direction. What is the net count crossing per second?',
        '0~12~6~36', '两个相反方向的数量相等，净变化是 6 − 6 = 0。|The equal counts in opposite directions give 6 − 6 = 0 net.']
    ]],
    'plant-energy': ['net-production', [
      ['模型中每分钟光合产氧 11 单位，呼吸耗氧 4 单位。每分钟净产氧多少？|A model produces 11 oxygen units per minute by photosynthesis and uses 4 in respiration. What is the net production per minute?',
        '7~15~11~4', '净产氧要扣掉呼吸消耗，11 − 4 = 7。|Subtract the oxygen used in respiration: 11 − 4 = 7.'],
      ['光照记录显示产氧 8 单位、耗氧 8 单位。净产氧是多少？|A record in light shows 8 oxygen units produced and 8 used. What is the net production?',
        '0~16~8~64', '产生和消耗相等，净量为零。|Production and consumption are equal, giving zero net production.']
    ]],
    'human-systems': ['amount-rate', [
      ['教学模型中每跳一次泵出 30 mL，每分钟跳 70 次。每分钟泵出多少？|A teaching model pumps 30 mL per beat at 70 beats per minute. What volume is pumped per minute?',
        '2100 mL~100 mL~30 mL~70 mL', '每次的量乘每分钟的次数，30 × 70 = 2100 mL。|Multiply the amount per beat by the rate: 30 × 70 = 2100 mL.'],
      ['另一模型每次换气 250 mL，每分钟 16 次。每分钟换气多少？|Another model moves 250 mL per breath at 16 breaths per minute. How much air moves per minute?',
        '4000 mL~266 mL~250 mL~16 mL', '每次的量乘次数，250 × 16 = 4000 mL 每分钟。|Multiply the amount per breath by the rate: 250 × 16 = 4000 mL per minute.']
    ]],
    'natural-selection': ['count-versus-share', [
      ['样本甲中有 10/50 表现某性状，乙中有 12/100。哪组比例较高？|A trait appears in 10 of 50 in sample A and 12 of 100 in B. Which sample has the greater proportion?',
        '甲|A~乙|B~一样高|Equal~任何数据都不能比较|The data cannot be compared', '甲为 20%，乙为 12%。总数不同，应比较比例。|A gives 20% and B 12%. Compare proportions when sample sizes differ.'],
      ['前次记录 30/60 表现某性状，本次为 35/100。比例怎样变化？|The first sample has 30 of 60 with a trait. The second has 35 of 100. What happened to the proportion?',
        '下降|It decreased~上升|It increased~相同|It stayed constant~不可比较|It cannot be compared', '前次为 50%，本次为 35%。计数增加时，比例仍可能下降。|The proportion went from 50% to 35%. A higher count can accompany a lower proportion.']
    ]]
  };
  const localize = string => bi(...(string.includes('|') ? string.split('|') : [string, string]));
  function addFoundationItems(focus, items, transfer) {
    const { subject, topic } = skills[focus];
    const [kind] = foundationChecks[focus];
    items.forEach(([prompt, choices, explanation], index) => {
      const options = choices.split('~').map(localize);
      const answer = index + 1;
      options.splice(answer, 0, options.shift());
      data.questions.push({
        id: `foundation-${transfer ? 'transfer-' : ''}${focus}-${index + 1}`, subject, topic, level: 'L2', focusOnly: true,
        skill: 'application', role: transfer ? 'prerequisite-transfer' : 'prerequisite-check',
        focus: [focus], prompt: localize(prompt), options, answer,
        errors: { 0: focus }, errorKinds: { 0: kind }, explanation: localize(explanation),
        safety: 'virtual-data', curriculumRefs: []
      });
    });
  }
  for (const [focus, [, items]] of Object.entries(foundationChecks)) addFoundationItems(focus, items, false);
  // Follow-up items change the situation while checking the same prerequisite.
  for (const [focus, items] of Object.entries({
    'forces-motion': [
      ['同一物体受到向北 15 N、向南 9 N 的力。合力是多少？|An object is pulled with 15 N north and 9 N south. What is its net force?',
        '向北 6 N|6 N north~向北 24 N|24 N north~向南 6 N|6 N south~向南 24 N|24 N south',
        '向北取正，15 − 9 = 6 N，结果指向北。|Take north as positive: 15 − 9 = 6 N north.'],
      ['同一直线上，物体受到向左 12 N 和向右 12 N 的力。合力是多少？|An object has a 12 N force left and a 12 N force right along the same line. Find the net force.',
        '0 N~24 N~12 N~144 N', '相反方向的 12 N 抵消，合力为零。|The opposing 12 N forces cancel. The net force is zero.']
    ],
    'atomic-structure': [
      ['中性原子获得两个电子。核内的质子数如何变化？|A neutral atom gains two electrons. What happens to its proton count?',
        '保持不变|It stays the same~增加两个|It increases by two~减少两个|It decreases by two~必变为零|It becomes zero',
        '增加的是核外电子，核内质子数保持不变。|Only extra electrons are added. The proton count in the nucleus stays the same.'],
      ['一个原子有 12 个质子，形成带 2 个单位正电荷的离子。离子有多少个电子？|An atom with 12 protons forms an ion of charge +2. How many electrons are in the ion?',
        '10~12~14~2', '两个单位的正电荷意味着少两个电子，12 − 2 = 10。|Charge +2 means two fewer electrons than protons: 12 − 2 = 10.']
    ],
    'mole-calculations': [
      ['装有 60 g 纯物质的样品，其摩尔质量是 30 g/mol。它含有多少物质的量？|A pure sample has mass 60 g and molar mass 30 g/mol. How much substance does it contain in moles?',
        '2 mol~30 mol~60 mol~1800 mol', '每摩尔质量是 30 g，因此 60 ÷ 30 = 2 mol。|Each mole has a mass of 30 g, so 60 ÷ 30 = 2 mol.'],
      ['同一物质取两份样品，一份 1 mol、一份 2 mol。两份样品质量是否相等？|Take 1 mol and 2 mol of the same substance. Do the samples have equal mass?',
        '不相等，2 mol 的质量是 1 mol 的两倍|No. The 2 mol sample has twice the mass.~相等，因为摩尔质量相等|Yes, because molar mass is the same.~相等，因为都含有相同粒子数|Yes, because they contain the same number of particles.~无法比较|There is not enough information.',
        '同一物质的摩尔质量相同，样品质量等于物质的量乘摩尔质量。|The molar mass is fixed for the same substance. Sample mass equals amount times molar mass.']
    ]
  })) addFoundationItems(focus, items, true);
  globalThis.EachVeyaSkills = { skills, decorateEquation };
})();
