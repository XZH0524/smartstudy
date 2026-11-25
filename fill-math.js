(function () {
  'use strict';
  const { numeric } = globalThis.EachVeyaFillBank;
  const bi = globalThis.SmartStudyData.bilingual;
  const add = (topic, level, family, unit, recipe, structure) => numeric('math', topic, level, family, unit, recipe, structure);

  add('arithmetic', 'L1', 'return-change', '元', i => {
    const price = 13 + 3 * i, count = 2 + i % 4;
    const expected = 4 + 2 * i, cash = price * count + expected;
    return {
      prompt: bi(`每个笔袋 ${price} 元，买 ${count} 个，付 ${cash} 元。应找回多少钱？`, `Pencil cases cost ${price} yuan each. You buy ${count} and pay ${cash} yuan. How much change should you receive in yuan?`),
      hint: bi('先求商品总价。', 'Work out the total cost first.'),
      explanation: bi(`${cash} − ${count} × ${price} = ${expected} 元。`, `${cash} − ${count} × ${price} = ${expected} yuan.`),
      expected, verify: x => x + count * price === cash
    };
  });
  add('arithmetic', 'L4', 'undo-two-markdowns', '元', i => {
    const expected = 200 + 100 * i, after = expected * 3 / 5;
    return {
      prompt: bi(`一件商品先降价 20%，再按降价后的价格打七五折，现价 ${after} 元。求原价。`, `An item is marked down by 20%, then its reduced price is cut by 25%. It now costs ${after} yuan. Find its original price in yuan.`),
      hint: bi('两次降价依次乘 0.8 和 0.75。', 'Apply the multipliers 0.8 and 0.75 in order.'),
      explanation: bi(`现价为原价的 0.8 × 0.75 = 0.6 倍。原价为 ${after} ÷ 0.6 = ${expected} 元。`, `The final price is 0.8 × 0.75 = 0.6 of the original. Divide ${after} by 0.6 to get ${expected} yuan.`),
      expected, verify: x => x * 8 * 75 === after * 1000
    };
  });
  add('algebra', 'L2', 'divide-and-offset', '', i => {
    const divisor = 3 + i % 5, adjustment = 5 + i, reduced = 9 + i;
    const expected = divisor * reduced, right = reduced + adjustment;
    return {
      prompt: bi(`求 x。x/${divisor} + ${adjustment} = ${right}`, `Find x. x/${divisor} + ${adjustment} = ${right}`),
      hint: bi('先移去常数，再用乘法消去除数。', 'Undo the addition, then undo the division.'),
      explanation: bi(`两边减去 ${adjustment}，得 x/${divisor} = ${reduced}。乘 ${divisor} 后得到 x = ${expected}。`, `Subtract ${adjustment} to get x/${divisor} = ${reduced}. Then multiply by ${divisor} to get x = ${expected}.`),
      expected, verify: x => x === (right - adjustment) * divisor
    };
  }, 'quotient');
  add('algebra', 'L3', 'plans-meet', '次', i => {
    const cheap = 4 + i % 3, expensive = cheap + 2 + i % 4;
    const expected = 8 + i, fee = (expensive - cheap) * expected;
    return {
      prompt: bi(`方案甲收 ${fee} 元固定费，每次另收 ${cheap} 元。方案乙只收每次 ${expensive} 元。用多少次时总费用相同？`, `Plan A charges ${fee} yuan plus ${cheap} yuan per visit. Plan B charges ${expensive} yuan per visit. At how many visits do they cost the same?`),
      hint: bi('将两个含次数的总费用写成等式。', 'Set the two total costs equal.'),
      explanation: bi(`每次费用差为 ${expensive - cheap} 元，${fee} ÷ ${expensive - cheap} = ${expected} 次时抵消固定费。`, `The per-visit difference is ${expensive - cheap} yuan. It matches the initial fee after ${fee} ÷ ${expensive - cheap} = ${expected} visits.`),
      expected, verify: x => fee + cheap * x === expensive * x
    };
  });
  add('geometry', 'L1', 'triangle-angles', '°', i => {
    const a = 23 + 3 * i, b = 52 + 2 * i;
    const expected = 180 - a - b;
    return {
      prompt: bi(`三角形两个内角为 ${a}° 和 ${b}°，第三个内角是多少度？`, `Two interior angles of a triangle are ${a}° and ${b}°. Find the third angle in degrees.`),
      hint: bi('平面三角形的三个内角相加是 180°。', 'The three angles of a plane triangle add to 180°.'), 
      explanation: bi(`180° − ${a}° − ${b}° = ${expected}°。`, `180° − ${a}° − ${b}° = ${expected}°.`),
      expected, verify: x => x + a + b === 180
    };
  });
  add('geometry', 'L4', 'area-scale-back', 'cm²', i => {
    const expected = 16 + 4 * i, a = 2 + i % 4, b = a + 2, large = expected * b * b;
    const small = expected * a * a;
    return {
      prompt: bi(`相似图形甲与乙对应边之比为 ${a}∶${b}。乙的面积为 ${large} cm²。求甲的面积。`, `Similar shapes A and B have corresponding side lengths in the ratio ${a}:${b}. B has area ${large} cm². Find the area of A.`),
      hint: bi('面积之比是边长之比的平方。', 'Square the side length ratio to obtain the area ratio.'),
      explanation: bi(`甲的面积是 ${large} × ${a}² ÷ ${b}² = ${small} cm²。`, `A has area ${large} × ${a}² ÷ ${b}² = ${small} cm².`),
      expected: small, verify: x => x * b * b === large * a * a
    };
  });
  add('functions', 'L2', 'piecewise-value', '', i => {
    const boundary = i - 4, x = boundary + i % 3 - 1, offset = 6 + i;
    const first = x < boundary;
    const expected = first ? 2 * x : 3 * x + offset;
    return {
      prompt: bi(`当 x < ${boundary} 时，f(x) = 2x；当 x ≥ ${boundary} 时，f(x) = 3x + ${offset}。求 f(${x})。`, `Let f(x) = 2x for x < ${boundary} and f(x) = 3x + ${offset} for x ≥ ${boundary}. Find f(${x}).`),
      hint: bi('把输入值与分界值比较，再选公式。', 'Compare the input with the boundary, then choose the formula.'),
      explanation: first ? bi(`${x} < ${boundary}，代入第一个式子得 ${expected}。`, `${x} < ${boundary}, so the first rule gives ${expected}.`)
        : bi(`${x} ≥ ${boundary}，代入第二个式子得 ${expected}。`, `${x} ≥ ${boundary}, so the second rule gives ${expected}.`),
      expected, verify: value => first ? value / 2 === x : (value - offset) / 3 === x
    };
  });
  add('functions', 'L5', 'inverse-on-left-branch', '', i => {
    const edge = 5 + i, k = 2 + i, distance = 2 + i % 4, y = distance * distance + k;
    const expected = edge - distance;
    return {
      prompt: bi(`f(x) = (x − ${edge})² + ${k}，定义域为 x ≤ ${edge}。求满足 f(x) = ${y} 的 x。`, `Let f(x) = (x − ${edge})² + ${k} for x ≤ ${edge}. Find the x for which f(x) = ${y}.`),
      hint: bi('开平方会得到两种符号，用定义域选根。', 'Use the domain to choose the sign after taking the square root.'),
      explanation: bi(`x − ${edge} ≤ 0，所以 x − ${edge} = −${distance}，得到 x = ${expected}。`, `Since x − ${edge} ≤ 0, choose x − ${edge} = −${distance}, giving x = ${expected}.`),
      expected, verify: x => x <= edge && (x - edge) ** 2 + k === y
    };
  });
  add('statistics', 'L3', 'combined-mean', '', i => {
    const n = 3 + i, m = 2 * n, a = 11 + i, b = a + 6, expected = a + 4;
    return {
      prompt: bi(`甲组 ${n} 人平均得 ${a} 分，乙组 ${m} 人平均得 ${b} 分。两组合在一起，平均得多少分？`, `Group A has ${n} people with a mean score of ${a}. Group B has ${m} people with a mean of ${b}. Find the combined mean score.`),
      hint: bi('先求两组的总分，再除以总人数。', 'Add the group totals and divide by the total number of people.'),
      explanation: bi(`(${n} × ${a} + ${m} × ${b}) ÷ (${n} + ${m}) = ${expected}。`, `(${n} × ${a} + ${m} × ${b}) ÷ (${n} + ${m}) = ${expected}.`),
      expected, verify: x => x * (n + m) === n * a + m * b
    };
  });
  add('statistics', 'L5', 'different-colours', '', i => {
    const red = 2 + i, blue = 4 + i % 3, total = red + blue;
    const denominator = total * (total - 1), numerator = denominator - blue * (blue - 1) - red * (red - 1);
    return {
      prompt: bi(`袋中有 ${red} 个红球和 ${blue} 个蓝球。不放回地随机取两球，两球颜色不同的概率是多少？`, `A bag has ${red} red balls and ${blue} blue balls. Two are drawn at random without replacement. What is the probability their colours differ?`),
      hint: bi('把先红后蓝、先蓝后红两个互斥事件相加。', 'Add the disjoint outcomes red then blue, and blue then red.'),
      explanation: bi(`两种顺序一共 ${numerator} 个等可能结果，所有有序结果为 ${denominator} 个。概率是 ${numerator}/${denominator}，可约分。`, `The two orders give ${numerator} outcomes among ${denominator} equally likely ordered draws. The probability is ${numerator}/${denominator}, or its reduced form.`),
      expected: `${numerator}/${denominator}`, verify: x => Math.abs(x - 2 * red * blue / (total * (total - 1))) < 1e-12
    };
  });
})();
