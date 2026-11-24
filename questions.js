/* The first release's questions keep their IDs and option order for saved history. */
(function () {
  'use strict';
  const bilingual = (zh, en) => ({ zh, en });
  const question = (id, subject, topic, difficulty, zh, en, options, answer, whyZh, whyEn) => ({
    id, subject, topic, difficulty,
    prompt: bilingual(zh, en),
    options: options.map(option => Array.isArray(option) ? bilingual(...option) : bilingual(option, option)),
    answer, explanation: bilingual(whyZh, whyEn)
  });
  const subjects = [
    { id: 'english', label: bilingual('英语', 'English'), description: bilingual('从词汇到语法，读懂每一个句子。', 'Build confidence, one word and sentence at a time.'), symbol: 'Aa', available: true },
    { id: 'math', label: bilingual('数学', 'Mathematics'), description: bilingual('理清思路，找到解题的下一步。', 'Find the logic. Make your next step count.'), symbol: 'x²', available: true },
    { id: 'physics', label: bilingual('物理', 'Physics'), description: bilingual('用数据解释运动、电路和能量。', 'Explain motion, circuits and energy with data.'), symbol: 'v', available: true },
    { id: 'chemistry', label: bilingual('化学', 'Chemistry'), description: bilingual('用质量、体积与比例理解物质。', 'Use mass, volume and ratios to understand matter.'), symbol: 'mol', available: true },
    { id: 'biology', label: bilingual('生物', 'Biology'), description: bilingual('从细胞图像、遗传模型和种群数据认识生命。', 'Explore life through cell images, inheritance models and population data.'), symbol: 'µm', available: true }
  ];
  const topics = {
    grammar: bilingual('语法', 'Grammar'), vocabulary: bilingual('词汇', 'Vocabulary'), reading: bilingual('阅读', 'Reading'),
    arithmetic: bilingual('算术', 'Arithmetic'), algebra: bilingual('代数', 'Algebra'), geometry: bilingual('几何', 'Geometry'),
    functions: bilingual('函数', 'Functions'), statistics: bilingual('概率与统计', 'Probability & statistics')
  };
  const questions = [
    question('en-g01','english','grammar','easy','选择正确的形式。She ___ to school every day.','Choose the correct form. She ___ to school every day.',['go','goes','going','gone'],1,'every day 表示习惯性动作，用一般现在时。主语 She 是第三人称单数，go 变为 goes。','Every day signals a routine. In the present simple, third-person singular she takes goes.'),
    question('en-g02','english','grammar','easy','首次提到一个苹果，选择合适的词。I ate ___ apple.','Choose the word when introducing one apple for the first time. I ate ___ apple.',['a','an','many','these'],1,'apple 以元音音素开头。首次提到一个苹果，用不定冠词 an。','Apple begins with a vowel sound. Use an for one apple introduced for the first time.'),
    question('en-g03','english','grammar','medium','完成句子。Look! The children ___ football.','Complete the sentence. Look! The children ___ football.',['play','played','are playing','plays'],2,'Look! 提示动作正在发生。复数主语 children 搭配 are playing，构成现在进行时。','Look! signals an action happening now. The plural subject children takes are playing in the present continuous.'),
    question('en-g04','english','grammar','medium','完成句子。If it rains tomorrow, we ___ at home.','Complete the sentence. If it rains tomorrow, we ___ at home.',['stayed','will stay','would stayed','staying'],1,'表示将来可能发生的条件，if 从句用一般现在时，主句用 will + 动词原形。','For a possible future condition, use the present simple in the if-clause and will + base verb in the main clause.'),
    question('en-g05','english','grammar','medium','完成句子。This book is ___ than that one.','Complete the sentence. This book is ___ than that one.',['interesting','most interesting','more interesting','interest'],2,'than 表示比较。interesting 的比较级是 more interesting。','Than signals a comparison. The comparative form of interesting is more interesting.'),
    question('en-g06','english','grammar','hard','完成句子。By the time we arrived, the film ___.','Complete the sentence. By the time we arrived, the film ___.',['starts','has started','had started','is starting'],2,'电影开始发生在我们到达之前。表示过去的过去，用过去完成时 had started。','The film started before another past event, our arrival. Use the past perfect, had started.'),
    question('en-g07','english','grammar','hard','完成句子。The bridge ___ in 1990.','Complete the sentence. The bridge ___ in 1990.',['built','was built','has building','is build'],1,'桥是被建造的，用被动语态。in 1990 表示过去，结构为 was + 过去分词 built。','The bridge receives the action. The past date calls for the past simple passive, was built.'),
    question('en-g08','english','grammar','easy','完成句子。There ___ two pencils on the desk.','Complete the sentence. There ___ two pencils on the desk.',['is','are','was','be'],1,'two pencils 是复数。描述现在的存在状态，用 There are。','Two pencils is plural. Use there are for their present existence.'),
    question('en-v01','english','vocabulary','easy','哪个单词与 happy 意思最接近？','Which word is closest in meaning to happy?',['sad','glad','angry','tired'],1,'glad 和 happy 都可以表示高兴。sad 是难过，angry 是生气，tired 是疲倦。','Glad and happy both describe feeling pleased. Sad, angry and tired describe different feelings.'),
    question('en-v02','english','vocabulary','easy','哪个单词与 ancient 意思相反？','Which word is the opposite of ancient?',['old','historic','modern','early'],2,'ancient 表示古代的，modern 表示现代的，两者意思相反。','Ancient means belonging to the distant past. Modern refers to the present or recent times.'),
    question('en-v03','english','vocabulary','medium','选择合适的词。Please ___ me your pencil for a minute.','Choose the word. Please ___ me your pencil for a minute.',['borrow','lend','keep','take'],1,'lend 表示把东西借给别人。lend me your pencil 意思是把你的铅笔借给我。borrow 表示向别人借入。','Lend means to give something temporarily. Lend me your pencil asks someone to let you use theirs. Borrow means to receive something temporarily.'),
    question('en-v04','english','vocabulary','medium','选择合适的词。We must ___ the environment.','Choose the word. We must ___ the environment.',['protect','predict','produce','pretend'],0,'protect 表示保护，protect the environment 是保护环境。predict 是预测，produce 是生产，pretend 是假装。','Protect means to keep something safe from harm. Protect the environment is the appropriate phrase.'),
    question('en-v05','english','vocabulary','hard','选择合适的词。Her explanation was clear and ___. Each point followed naturally from the one before it.','Choose the word. Her explanation was clear and ___. Each point followed naturally from the one before it.',['confused','confusing','logical','carelessly'],2,'后一句说明论点之间有自然的推理顺序，所以用 logical。','The next sentence describes a sensible sequence of reasoning, which is what logical means.'),
    question('en-v06','english','vocabulary','hard','句子中的 give up 是什么意思？Never give up on your goals.','What does give up mean in Never give up on your goals?',[['放弃','Stop trying'],['赠送','Give a gift'],['加速','Speed up'],['醒来','Wake up']],0,'give up 表示放弃。整句话鼓励你继续为目标努力。','Give up means to stop trying. The sentence encourages continued effort toward your goals.'),
    question('en-v07','english','vocabulary','easy','选择合适的词。I am ___. I need some water.','Choose the word. I am ___. I need some water.',['hungry','thirsty','sleepy','cold'],1,'需要喝水说明口渴，thirsty 表示口渴的。','Needing water suggests thirst. Thirsty means feeling a need to drink.'),
    question('en-v08','english','vocabulary','medium','选择合适的词。We arrived ___ time, before the lesson began.','Choose the word. We arrived ___ time, before the lesson began.',['in','at','of','with'],0,'in time 表示及时，在某件事发生之前赶到。此处指在上课前到达。','In time means early enough for something. Here, they arrived before the lesson began.'),
    question('en-r01','english','reading','easy','阅读。Tom walks to school because he lives nearby. Tom 为什么步行上学？','Read. Tom walks to school because he lives nearby. Why does Tom walk to school?',[['他住得近','He lives nearby'],['他错过了公交车','He missed the bus'],['他没有自行车','He has no bicycle'],['学校要求步行','The school requires it']],0,'because 引出原因。原文明确说明 he lives nearby，即他住得近。','Because introduces the reason. The text explicitly says that he lives nearby.'),
    question('en-r02','english','reading','easy','阅读。The library opens at 9 a.m. and closes at 5 p.m. 图书馆开放多少小时？','Read. The library opens at 9 a.m. and closes at 5 p.m. How many hours is it open?',['6','7','8','9'],2,'从上午 9 点到下午 5 点，也就是从 9:00 到 17:00，共 8 小时。','From 9 a.m. to 5 p.m. is 17 − 9 = 8 hours.'),
    question('en-r03','english','reading','medium','阅读。Mia wanted to play outside. However, it began to rain, so she read a book indoors. Mia 最后做了什么？','Read. Mia wanted to play outside. However, it began to rain, so she read a book indoors. What did Mia do in the end?',[['在外面玩','Played outside'],['在室内读书','Read indoors'],['去了图书馆','Went to the library'],['在雨中走路','Walked in the rain']],1,'so 后面说明最终结果，她在室内读了一本书。','The clause after so gives the outcome. She read a book indoors.'),
    question('en-r04','english','reading','medium','阅读。Unlike his sister, who loves noisy parties, Leo prefers quiet evenings at home. 哪个描述最符合 Leo？','Read. Unlike his sister, who loves noisy parties, Leo prefers quiet evenings at home. Which description best fits Leo?',[['喜欢安静','Enjoys peace and quiet'],['喜欢喧闹派对','Loves noisy parties'],['每天晚上外出','Goes out every evening'],['讨厌待在家里','Hates staying home']],0,'prefers quiet evenings at home 表明 Leo 更喜欢安静地待在家里。','Prefers quiet evenings at home directly supports the description that Leo enjoys peace and quiet.'),
    question('en-r05','english','reading','hard','阅读。The team lost its first three games. Instead of quitting, they practised daily and eventually won the final. 本段最突出的主题是什么？','Read. The team lost its first three games. Instead of quitting, they practised daily and eventually won the final. What is the main theme?',[['好运永远最重要','Luck matters most'],['坚持可以带来进步','Persistence can lead to improvement'],['训练没有帮助','Practice is unhelpful'],['失败后应该退出','Teams should quit after losing']],1,'球队在失利后仍每天训练，最终获胜，突出坚持和努力带来的进步。','The team kept practising after repeated losses and eventually won. This supports persistence leading to improvement.'),
    question('en-r06','english','reading','hard','阅读。Sara packed an umbrella after seeing dark clouds, although the forecast had promised sunshine. Sara 为什么带伞？','Read. Sara packed an umbrella after seeing dark clouds, although the forecast had promised sunshine. Why did Sara pack an umbrella?',[['她预料可能下雨','She thought it might rain'],['她想遮挡积雪','She expected snow'],['预报说会下雨','The forecast predicted rain'],['当时正在下雨','It was already raining']],0,'乌云让 Sara 推测可能下雨。文中没有说已经下雨，而且预报说的是晴天。','Dark clouds suggested possible rain. The passage says the forecast promised sunshine and does not say rain had already begun.'),
    question('en-r07','english','reading','easy','阅读。Emma has a cat named Snow. It sleeps on her chair. It 指代什么？','Read. Emma has a cat named Snow. It sleeps on her chair. What does It refer to?',[['Emma','Emma'],['椅子','The chair'],['猫 Snow','The cat Snow'],['房子','The house']],2,'It 指代前一句提到的猫 Snow。','It refers back to the cat named Snow in the previous sentence.'),
    question('en-r08','english','reading','medium','阅读。Please return all borrowed books by Friday. 通知要求读者做什么？','Read. Please return all borrowed books by Friday. What does the notice ask readers to do?',[['周五之后借书','Borrow books after Friday'],['最迟周五还书','Return books no later than Friday'],['周五购买书籍','Buy books on Friday'],['把书再保留一周','Keep books another week']],1,'by Friday 表示截至周五，也就是最迟在周五归还。','By Friday sets a deadline. The books must be returned no later than Friday.'),
    question('ma-n01','math','arithmetic','easy','计算 3/4 + 1/8。','Calculate 3/4 + 1/8.',['4/12','7/8','1/2','5/8'],1,'通分后 3/4 = 6/8。因此 6/8 + 1/8 = 7/8。','Use a common denominator. 3/4 = 6/8, so 6/8 + 1/8 = 7/8.'),
    question('ma-n02','math','arithmetic','easy','80 的 15% 是多少？','What is 15% of 80?',['8','10','12','15'],2,'15% = 0.15。80 × 0.15 = 12。','15% = 0.15. Multiply 80 × 0.15 = 12.'),
    question('ma-n03','math','arithmetic','medium','计算 −6 + 4 × 3。','Calculate −6 + 4 × 3.',['−6','6','−18','30'],1,'先乘后加。4 × 3 = 12，再计算 −6 + 12 = 6。','Multiply first. 4 × 3 = 12, then −6 + 12 = 6.'),
    question('ma-n04','math','arithmetic','medium','两种果汁按 2∶3 的体积比混合，总共 25 升。第一种果汁有多少升？','Two juices are mixed in a volume ratio of 2:3, making 25 litres. How many litres of the first juice are used?',['5 L','10 L','12 L','15 L'],1,'共有 2 + 3 = 5 份。每份 25 ÷ 5 = 5 升，第一种果汁有 2 × 5 = 10 升。','There are 2 + 3 = 5 parts. Each part is 25 ÷ 5 = 5 litres, so the first juice is 2 × 5 = 10 litres.'),
    question('ma-n05','math','arithmetic','hard','某商品原价 100 元，先降价 20%，再按降价后的价格涨价 20%。最终价格是多少元？','An item costs 100 units. Its price falls by 20%, then rises by 20% of the reduced price. What is the final price?',['100','96','104','80'],1,'降价后为 100 × 0.8 = 80，再涨价后为 80 × 1.2 = 96。两次百分比的计算基数不同。','After the decrease, the price is 100 × 0.8 = 80. Then 80 × 1.2 = 96. The percentages use different bases.'),
    question('ma-n06','math','arithmetic','hard','随机掷一枚公平的六面骰子两次，两次点数之和为 7 的概率是多少？','A fair six-sided die is rolled twice independently. What is the probability that the sum is 7?',['1/12','1/6','1/3','7/36'],1,'共有 36 种等可能的有序结果。和为 7 的有 (1,6)、(2,5)、(3,4)、(4,3)、(5,2)、(6,1)，所以概率为 6/36 = 1/6。','There are 36 equally likely ordered outcomes. Six have sum 7, from (1,6) through (6,1), giving 6/36 = 1/6.'),
    question('ma-n07','math','arithmetic','easy','数列 4、7、9、12 的平均数是多少？','What is the mean of 4, 7, 9 and 12?',['7','8','9','10'],1,'总和为 4 + 7 + 9 + 12 = 32。平均数为 32 ÷ 4 = 8。','The sum is 4 + 7 + 9 + 12 = 32. Divide by 4 to get the mean, 8.'),
    question('ma-n08','math','arithmetic','medium','计算 2³ × 2²。','Calculate 2³ × 2².',['16','32','64','128'],1,'同底数幂相乘，指数相加。2³ × 2² = 2⁵ = 32。','When multiplying powers with the same base, add the exponents. 2³ × 2² = 2⁵ = 32.'),
    question('ma-a01','math','algebra','easy','解方程 3x + 5 = 20。','Solve 3x + 5 = 20.',['3','5','7','15'],1,'两边减 5 得 3x = 15，再两边除以 3 得 x = 5。','Subtract 5 from both sides to get 3x = 15. Divide by 3 to get x = 5.'),
    question('ma-a02','math','algebra','easy','当 x = 4 时，2x² 的值是多少？','Evaluate 2x² when x = 4.',['16','32','64','8'],1,'先算平方。x² = 4² = 16，再乘以 2，得到 32。','Evaluate the power first. x² = 4² = 16, then multiply by 2 to get 32.'),
    question('ma-a03','math','algebra','medium','化简 4a + 3b − 2a + b。','Simplify 4a + 3b − 2a + b.',['2a + 4b','6a + 4b','2a + 2b','6ab'],0,'合并同类项。4a − 2a = 2a，3b + b = 4b，结果为 2a + 4b。','Combine like terms. 4a − 2a = 2a and 3b + b = 4b, giving 2a + 4b.'),
    question('ma-a04','math','algebra','medium','解不等式 −2x > 6。','Solve the inequality −2x > 6.',['x > −3','x < −3','x > 3','x < 3'],1,'两边除以负数 −2 时，不等号方向反转，所以 x < −3。','Dividing both sides by a negative number reverses the inequality sign. Therefore x < −3.'),
    question('ma-a05','math','algebra','hard','方程 x² − 5x + 6 = 0 的解是什么？','What are the solutions of x² − 5x + 6 = 0?',[['2 和 3','2 and 3'],['−2 和 −3','−2 and −3'],['1 和 6','1 and 6'],['−1 和 −6','−1 and −6']],0,'分解因式得 (x − 2)(x − 3) = 0。因此 x = 2 或 x = 3。','Factorise as (x − 2)(x − 3) = 0. At least one factor must be zero, so x = 2 or x = 3.'),
    question('ma-a06','math','algebra','hard','若 x + y = 7 且 2x − y = 5，x 的值是多少？','If x + y = 7 and 2x − y = 5, what is x?',['2','3','4','5'],2,'两式相加消去 y，得到 3x = 12，所以 x = 4。代回可得 y = 3。','Add the equations to eliminate y. This gives 3x = 12, so x = 4. Substitution gives y = 3.'),
    question('ma-a07','math','algebra','easy','数列 3、7、11、15 的下一项是多少？','What is the next term in 3, 7, 11, 15?',['17','18','19','20'],2,'相邻两项的差都是 4。下一项为 15 + 4 = 19。','Each term increases by 4. The next term is 15 + 4 = 19.'),
    question('ma-a08','math','algebra','medium','直线 y = 3x − 2 的斜率是多少？','What is the slope of the line y = 3x − 2?',['−2','2','3','−3'],2,'在 y = mx + b 中，m 是斜率。这里 x 的系数为 3，所以斜率为 3。','In y = mx + b, m is the slope. The coefficient of x is 3, so the slope is 3.'),
    question('ma-g01','math','geometry','easy','长方形的长为 8 cm，宽为 5 cm，面积是多少？','A rectangle is 8 cm long and 5 cm wide. What is its area?',['13 cm²','26 cm²','40 cm²','80 cm²'],2,'长方形面积 = 长 × 宽 = 8 × 5 = 40 cm²。','Rectangle area = length × width = 8 × 5 = 40 cm².'),
    question('ma-g02','math','geometry','easy','一个三角形的两个内角分别为 50° 和 60°，第三个内角是多少？','Two angles of a triangle are 50° and 60°. What is the third angle?',['60°','70°','80°','90°'],1,'三角形内角和为 180°。第三个角为 180° − 50° − 60° = 70°。','The interior angles of a triangle sum to 180°. The third angle is 180° − 50° − 60° = 70°.'),
    question('ma-g03','math','geometry','medium','直角三角形的两条直角边长分别为 6 cm 和 8 cm，斜边长是多少？','A right triangle has legs of 6 cm and 8 cm. What is the hypotenuse?',['7 cm','10 cm','12 cm','14 cm'],1,'由勾股定理，斜边的平方为 6² + 8² = 100，所以斜边为 10 cm。','By the Pythagorean theorem, the hypotenuse squared is 6² + 8² = 100, so it is 10 cm.'),
    question('ma-g04','math','geometry','medium','半径为 3 cm 的圆，其面积的精确值是多少？','What is the exact area of a circle of radius 3 cm?',['3π cm²','6π cm²','9π cm²','12π cm²'],2,'圆面积公式为 πr²。代入 r = 3，得到 9π cm²。','The area is πr². With r = 3, this is 9π cm².'),
    question('ma-g05','math','geometry','hard','两个相似三角形的对应边长之比为 2∶3，它们的面积之比是多少？','Two similar triangles have corresponding side lengths in the ratio 2:3. What is their area ratio?',['2:3','4:6','4:9','8:27'],2,'相似图形的面积比等于对应边长比的平方。因此面积比为 2²∶3² = 4∶9。','For similar shapes, the area ratio is the square of the side-length ratio. Thus 2²:3² = 4:9.'),
    question('ma-g06','math','geometry','hard','正六边形的每个内角是多少度？','What is each interior angle of a regular hexagon?',['60°','90°','120°','135°'],2,'六边形内角和为 (6 − 2) × 180° = 720°。正六边形六个角相等，所以每个内角为 720° ÷ 6 = 120°。','The angle sum is (6 − 2) × 180° = 720°. All six angles are equal, so each is 720° ÷ 6 = 120°.'),
    question('ma-g07','math','geometry','easy','边长为 7 cm 的正方形，其周长是多少？','What is the perimeter of a square with side length 7 cm?',['14 cm','21 cm','28 cm','49 cm'],2,'正方形有四条等长的边，周长为 4 × 7 = 28 cm。','A square has four equal sides. Its perimeter is 4 × 7 = 28 cm.'),
    question('ma-g08','math','geometry','medium','一个长方体的长、宽、高分别为 4 cm、3 cm、5 cm，体积是多少？','A cuboid measures 4 cm by 3 cm by 5 cm. What is its volume?',['12 cm³','47 cm³','60 cm³','94 cm³'],2,'长方体体积 = 长 × 宽 × 高 = 4 × 3 × 5 = 60 cm³。','Cuboid volume = length × width × height = 4 × 3 × 5 = 60 cm³.')
  ];
  const mathTopics = ['arithmetic', 'algebra', 'geometry', 'functions', 'statistics'];
  const englishTopics = ['vocabulary', 'grammar', 'reading'];
  const tiers = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const levels = { math: tiers, english: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], physics: tiers, chemistry: tiers, biology: tiers };
  const tierLabels = Object.fromEntries(tiers.map((tier, index) => [tier, [
    bilingual('基础认知', 'Foundational recognition'), bilingual('知识理解', 'Conceptual understanding'), bilingual('知识应用', 'Application'),
    bilingual('高级综合应用', 'Advanced synthesis'), bilingual('深度探究', 'In-depth inquiry')
  ][index]]));
  const skills = {
    calculation: bilingual('计算', 'Calculation'), application: bilingual('知识应用', 'Application'),
    reasoning: bilingual('逻辑推理', 'Reasoning')
  };
  const curricula = [
    ['cn', '中国课程', 'China curriculum'], ['gcse', 'GCSE', 'GCSE'], ['igcse', 'IGCSE', 'IGCSE'],
    ['common-core', '美国 Common Core', 'US Common Core'], ['ib', 'IB', 'IB'], ['a-level', 'A-Level', 'A-Level'], ['ap', 'AP', 'AP']
  ].map(([id, zh, en]) => ({ id, label: bilingual(zh, en) }));
  const legacyLevels = {
    'en-g01': 'A1', 'en-g02': 'A1', 'en-g03': 'A2', 'en-g04': 'B1', 'en-g05': 'A2', 'en-g06': 'B1', 'en-g07': 'B1', 'en-g08': 'A1',
    'en-v01': 'A1', 'en-v02': 'A2', 'en-v03': 'A2', 'en-v04': 'B1', 'en-v05': 'B1', 'en-v06': 'A2', 'en-v07': 'A1', 'en-v08': 'B1',
    'en-r01': 'A1', 'en-r02': 'A1', 'en-r03': 'A2', 'en-r04': 'A2', 'en-r05': 'B1', 'en-r06': 'B1', 'en-r07': 'A1', 'en-r08': 'A2'
  };
  const legacyMath = {
    'ma-n01': ['L2', 'calculation'], 'ma-n02': ['L2', 'calculation'], 'ma-n03': ['L2', 'calculation'],
    'ma-n04': ['L3', 'application'], 'ma-n05': ['L4', 'application'], 'ma-n06': ['L4', 'reasoning', 'statistics'],
    'ma-n07': ['L1', 'calculation', 'statistics'], 'ma-n08': ['L3', 'calculation'],
    'ma-a01': ['L2', 'calculation'], 'ma-a02': ['L1', 'calculation'], 'ma-a03': ['L2', 'calculation'],
    'ma-a04': ['L3', 'reasoning'], 'ma-a05': ['L4', 'calculation'], 'ma-a06': ['L4', 'reasoning'],
    'ma-a07': ['L1', 'reasoning'], 'ma-a08': ['L2', 'application', 'functions'],
    'ma-g01': ['L1', 'application'], 'ma-g02': ['L2', 'application'], 'ma-g03': ['L3', 'application'],
    'ma-g04': ['L2', 'application'], 'ma-g05': ['L4', 'reasoning'], 'ma-g06': ['L3', 'reasoning'],
    'ma-g07': ['L1', 'application'], 'ma-g08': ['L2', 'application']
  };
  const legacyQuestions = questions.map(({ difficulty, ...item }) => {
    if (item.subject === 'english') return { ...item, level: legacyLevels[item.id], track: 'cefr' };
    const [level, skill, topic = item.topic] = legacyMath[item.id];
    return { ...item, topic, level, skill, curriculumRefs: [] };
  });

  globalThis.SmartStudyData = {
    subjects, topics, topicsBySubject: { math: mathTopics, english: englishTopics }, levels, tierLabels, skills, curricula,
    bilingual, questions: legacyQuestions
  };
})();
