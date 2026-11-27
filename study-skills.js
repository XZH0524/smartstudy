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
    ['equation-models', 'atomic-structure'],
    ['amount-concentration', 'mole-calculations'],
    ['natural-selection', 'trait-frequency']
  ]) {
    skills[topic] = { ...skills[topic], prerequisites: [prerequisite] };
  }
  globalThis.EachVeyaSkills = { skills, decorateEquation };
})();
