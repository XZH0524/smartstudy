(function () {
  'use strict';
  const { bilingual: bi } = globalThis.SmartStudyData;
  const revision = originalId => ({ id: originalId + '@2', originalId, version: 2 });

  function reading(id, passage, question, answer, explanation) {
    return {
      ...revision(`pilot-reading-clock-${id}`), subject: 'english', topic: 'reading', track: 'cefr', level: 'A1',
      focusOnly: true, passageId: `pilot-clock-${id}`, evidenceType: 'time',
      prompt: bi(`${passage.join(' ')}\n\n${question.zh}`, `${passage.join(' ')}\n\n${question.en}`),
      options: passage.map(sentence => bi(sentence, sentence)), answer, explanation
    };
  }

  function calculation(id, subject, topic, prompt, labels, first, second, explanation, revised = false) {
    const originalId = `pilot-${id}`;
    return {
      ...(revised ? revision(originalId) : { id: originalId }), subject, topic, level: 'L2', format: 'calculation', focusOnly: true,
      skill: 'calculation', curriculumRefs: [], prompt,
      fields: [{ label: labels[0], expected: first }, { label: labels[1], expected: second }], explanation
    };
  }

  const xFields = [bi('移去常数，保持 x 的系数不变。右边 = □', 'Remove the constant without changing the coefficient of x. Right side = □'), bi('x = □', 'x = □')];
  const speedFields = [bi('全程用时 = □ s', 'Elapsed time = □ s'), bi('平均速率 = □ m/s', 'Average speed = □ m/s')];
  const densityFields = [bi('总体积或样品体积 = □ cm³', 'Total or sample volume = □ cm³'), bi('质量密度 = □ g/cm³', 'Mass density = □ g/cm³')];
  const surveyFields = [bi('调查面积 = □ m²', 'Surveyed area = □ m²'), bi('样本计数密度 = □ 株/m²', 'Sample count density = □ plants/m²')];

  const pilotHoldouts = [
    reading('entry', ['The green ferry leaves at ten.', 'The blue ferry leaves at eleven.', 'Jan buys a ticket.', 'The boats stop at Pine Island.'],
      bi('哪一句交代了蓝色渡船的出发时间？', 'Which sentence tells you when the blue ferry leaves?'), 1,
      bi('第二句明确说明蓝色渡船十一点出发。', 'The second sentence gives eleven as the departure time of the blue ferry.')),
    reading('next', ['The poster show starts at two.', 'Please enter through the main door.', 'A short talk starts at three.', 'The shop closes at five.'],
      bi('哪一句交代了短讲的开始时间？', 'Which sentence tells you when the short talk starts?'), 2,
      bi('第三句明确说明短讲三点开始。', 'The third sentence says the short talk starts at three.')),
    reading('seven', ['The hall opens at eight.', 'The book sale starts at nine.', 'Mia brings some books.', 'The book sale finishes at noon.'],
      bi('哪一句交代了图书义卖的结束时间？', 'Which sentence tells you when the book sale finishes?'), 3,
      bi('第四句写的是结束时间。第二句写的是开始时间。', 'The fourth sentence gives the finishing time. The second gives the starting time.')),
    calculation('equation-entry', 'math', 'algebra',
      bi('解方程 3x + 4 = 25。先把含 x 的项单独留在左边，填写右边的数，再求 x。', 'Solve 3x + 4 = 25. Isolate the x term on the left, enter the right-hand value, then find x.'),
      xFields, 21, 7, bi('两边减 4 得 3x = 21。两边除以 3 得 x = 7。', 'Subtract 4 to get 3x = 21. Divide by 3 to get x = 7.')),
    calculation('equation-next', 'math', 'algebra',
      bi('解方程 31 = 5x + 6。先把含 x 的项单独留在左边，填写右边的数，再求 x。', 'Solve 31 = 5x + 6. Isolate the x term on the left, enter the right-hand value, then find x.'),
      xFields, 25, 5, bi('把两侧互换后，两边减 6 得 5x = 25。两边除以 5 得 x = 5。', 'Swap the sides, then subtract 6 to get 5x = 25. Divide by 5 to get x = 5.')),
    calculation('equation-seven', 'math', 'algebra',
      bi('解方程 34 − 4x = 10。先把原式写成 −4x = □，再求 x。', 'Solve 34 − 4x = 10. First rewrite the equation as −4x = □, then find x.'),
      [bi('−4x = □', '−4x = □'), xFields[1]], -24, 6,
      bi('两边减 34 得 −4x = −24。两边除以 −4 得 x = 6。', 'Subtract 34 to get −4x = −24. Divide by −4 to get x = 6.'), true),
    calculation('speed-entry', 'physics', 'average-speed',
      bi('一台清扫车先开 20 s，停 10 s，再开 15 s。全程走过 135 m。求全程用时和平均速率。',
        'A sweeper moves for 20 s, stops for 10 s and moves again for 15 s. It covers 135 m in total. Find the total time and average speed.'),
      speedFields, 45, 3, bi('总用时 20 + 10 + 15 = 45 s。平均速率 135 ÷ 45 = 3 m/s。', 'Elapsed time is 20 + 10 + 15 = 45 s. Average speed is 135 ÷ 45 = 3 m/s.')),
    calculation('speed-next', 'physics', 'average-speed',
      bi('巡线机器人移动 16 s，在检查点等候 9 s，然后又移动 25 s，共走过 200 m。求全程用时和平均速率。',
        'A patrol robot travels for 16 s, waits at a checkpoint for 9 s and then travels for 25 s. It covers 200 m altogether. Find the total time and average speed.'),
      speedFields, 50, 4, bi('总用时 16 + 9 + 25 = 50 s。平均速率 200 ÷ 50 = 4 m/s。', 'Elapsed time is 16 + 9 + 25 = 50 s. Average speed is 200 ÷ 50 = 4 m/s.')),
    calculation('speed-seven', 'physics', 'average-speed',
      bi('玩具缆车从计时器显示 6 s 时出发，在 42 s 时到达。途中停了 8 s。总路程 180 m。求全程用时和平均速率。',
        'A toy cable car leaves when the timer reads 6 s and arrives at 42 s. It stops for 8 s along the way. The total distance is 180 m. Find the total time and average speed.'),
      speedFields, 36, 5, bi('全程用时 42 − 6 = 36 s，已含停留。平均速率 180 ÷ 36 = 5 m/s。', 'Elapsed time is 42 − 6 = 36 s, which already includes the stop. Average speed is 180 ÷ 36 = 5 m/s.')),
    calculation('density-entry', 'chemistry', 'mass-density',
      bi('同一种均匀材料的两块样品体积分别为 9 cm³ 和 16 cm³，总质量 75 g。求总体积和这种材料的质量密度。',
        'Two pieces of the same uniform material have volumes of 9 cm³ and 16 cm³ and a combined mass of 75 g. Find the total volume and the mass density of the material.'),
      densityFields, 25, 3, bi('总体积 9 + 16 = 25 cm³。质量密度为 75 ÷ 25 = 3 g/cm³。', 'Total volume is 9 + 16 = 25 cm³. The combined mass per unit volume is 75 ÷ 25 = 3 g/cm³.')),
    calculation('density-next', 'chemistry', 'mass-density',
      bi('一块均匀的柱形样品底面积 7 cm²，垂直高度 4 cm，质量 112 g。求样品的体积和质量密度。',
        'A uniform prism has a base area of 7 cm², a perpendicular height of 4 cm and a mass of 112 g. Find its volume and mass density.'),
      densityFields, 28, 4, bi('体积 7 × 4 = 28 cm³，质量密度 112 ÷ 28 = 4 g/cm³。', 'The volume is 7 × 4 = 28 cm³. The mass density is 112 ÷ 28 = 4 g/cm³.')),
    calculation('density-seven', 'chemistry', 'mass-density',
      bi('模拟记录中，样品完全浸没前后的液体读数分别是 29 mL 和 47 mL。样品质量 90 g，1 mL = 1 cm³。求样品体积和质量密度。',
        'A simulation records 29 mL before a sample is immersed and 47 mL when the sample is fully immersed. Its mass is 90 g and 1 mL = 1 cm³. Find the sample volume and mass density.'),
      densityFields, 18, 5, bi('体积 47 − 29 = 18 cm³，质量密度 90 ÷ 18 = 5 g/cm³。', 'The volume is 47 − 29 = 18 cm³. The mass density is 90 ÷ 18 = 5 g/cm³.')),
    calculation('population-entry', 'biology', 'population-density',
      bi('在 4 个互不重叠的样方中数到了 72 株三叶草，每个样方的面积是 6 m²。求调查面积和样本每平方米的计数。',
        'Four non-overlapping plots of 6 m² each contain 72 clover plants in total. Find the surveyed area and how many plants were counted per square metre.'),
      surveyFields, 24, 3, bi('调查面积是 4 × 6 = 24 m²。样本计数密度是 72 ÷ 24 = 3 株/m²。', 'The surveyed area is 4 × 6 = 24 m². The sample count density is 72 ÷ 24 = 3 plants/m².')),
    calculation('population-next', 'biology', 'population-density',
      bi('在两个互不重叠的样方中数到 36 株雏菊。两个样方面积分别是 7 m² 和 11 m²。求调查面积和样本每平方米的计数。',
        'Two non-overlapping plots contain 36 daisies in total. Their areas are 7 m² and 11 m². Find the surveyed area and how many plants were counted per square metre.'),
      surveyFields, 18, 2, bi('调查面积 7 + 11 = 18 m²。样本计数密度 36 ÷ 18 = 2 株/m²。', 'The surveyed area is 7 + 11 = 18 m². The sample count density is 36 ÷ 18 = 2 plants/m².')),
    calculation('population-seven', 'biology', 'population-density',
      bi('一片草地面积 39 m²，其中 14 m² 未调查。在调查过的部分数到 100 株蒲公英。求调查面积和样本每平方米的计数。',
        'A meadow covers 39 m², of which 14 m² was left unsurveyed. The surveyed part contains 100 dandelion plants. Find the surveyed area and how many plants were counted per square metre.'),
      surveyFields, 25, 4, bi('调查面积 39 − 14 = 25 m²。样本计数密度 100 ÷ 25 = 4 株/m²。', 'The surveyed area is 39 − 14 = 25 m². The sample count density is 100 ÷ 25 = 4 plants/m².'))
  ];

  for (const question of pilotHoldouts) {
    globalThis.SmartStudyData.questions.push({ ...question, purpose: 'pilot-check' });
  }
})();
