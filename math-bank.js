(function () {
  'use strict';
  const data = globalThis.SmartStudyData;
  const zhEn = data.bilingual;
  const pairs = (values, suffix = '') => values.map(value => zhEn(`${value}${suffix}`, `${value}${suffix}`));
  const options = (answer, unit = '') => pairs([answer, answer + 1, answer - 1, answer + 2], unit);
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fraction = (n, d) => {
    const factor = gcd(n, d);
    return d === factor ? String(n / factor) : `${n / factor}/${d / factor}`;
  };
  const item = (skill, prompt, answers, hint, explanation) => ({ skill, prompt, options: answers, hint, explanation });

  const templates = {
    arithmetic: {
      L1(i) {
        const a = i + 3;
        const b = 7 + i % 4;
        return item('calculation', zhEn(`计算 ${a} × ${b}。`, `Calculate ${a} × ${b}.`), options(a * b),
          zhEn(`把 ${a} 看成 ${a} 组，每组 ${b} 个。`, `Think of ${a} groups with ${b} in each group.`),
          zhEn(`${a} × ${b} = ${a * b}。`, `${a} × ${b} = ${a * b}.`));
      },
      L2(i) {
        const denominator = i + 9;
        const total = 2 + (i % 4 + 1);
        return item('calculation', zhEn(`计算 2/${denominator} + ${total - 2}/${denominator}。`, `Calculate 2/${denominator} + ${total - 2}/${denominator}.`),
          pairs([total, total - 1, total + 1, total + 2].map(n => fraction(n, denominator))),
          zhEn('分母相同时，只计算分子的和。', 'With equal denominators, add the numerators.'),
          zhEn(`分子相加得到 ${total}，分母仍为 ${denominator}，结果为 ${fraction(total, denominator)}。`,
            `The numerator becomes ${total}, and the denominator stays ${denominator}. This gives ${fraction(total, denominator)}.`));
      },
      L3(i) {
        const original = 20 * (i + 12);
        const discount = 10 + 5 * (i % 4);
        const paid = original * (100 - discount) / 100;
        return item('application',
          zhEn(`一件物品降价 ${discount}% 后售价为 ${paid} 元。原价是多少元？`, `An item sells for ${paid} units after a ${discount}% discount. What was its original price?`),
          pairs([original, paid, original + 20, original - 20]),
          zhEn(`付的是原价的 ${100 - discount}%。`, `The sale price is ${100 - discount}% of the original price.`),
          zhEn(`原价 = ${paid} ÷ ${(100 - discount) / 100} = ${original} 元。`, `Original price = ${paid} ÷ ${(100 - discount) / 100} = ${original} units.`));
      },
      L4(i) {
        const change = (i + 1) * 5;
        const result = (100 + change) * (100 - change) / 100;
        return item('application',
          zhEn(`某价格先上涨 ${change}%，再从涨后的价格下跌 ${change}%。最终是原价的百分之几？`,
            `A price rises by ${change}% and then falls by ${change}% of the increased price. What percentage of the original price remains?`),
          pairs([result, 100, 200 - result, 100 - change], '%'),
          zhEn('把两次变化写成两个乘数。', 'Express the two percentage changes as multipliers.'),
          zhEn(`把原价看作 100。变化后为 100 × ${(100 + change) / 100} × ${(100 - change) / 100} = ${result}。`,
            `Start with 100. The new price is 100 × ${(100 + change) / 100} × ${(100 - change) / 100} = ${result}.`));
      },
      L5(i) {
        const divisor = i + 6;
        const numbers = [8, 12, 15].map(factor => factor * divisor + 3);
        const list = numbers.join(', ');
        return item('reasoning',
          zhEn(`用同一个正整数分别除 ${list}，得到相同的余数。这个除数最大是多少？`,
            `When ${list} are each divided by the same positive integer, the remainders are equal. What is the largest possible divisor?`),
          pairs([divisor, divisor * 2, divisor * 4, divisor * 7]),
          zhEn('如果两数余数相同，想想它们的差与除数有什么关系。', 'If two numbers have equal remainders, what does that imply about their difference?'),
          zhEn(`除数必须同时整除差值 ${4 * divisor} 和 ${7 * divisor}。最大公因数为 ${divisor}，三个数除以它都余 3。`,
            `The divisor must divide both differences, ${4 * divisor} and ${7 * divisor}. Their greatest common divisor is ${divisor}, which leaves remainder 3 for all three numbers.`));
      }
    },
    algebra: {
      L1(i) {
        const x = i + 4;
        const b = 6 + i % 5;
        return item('calculation', zhEn(`解方程 x + ${b} = ${x + b}。`, `Solve x + ${b} = ${x + b}.`), options(x),
          zhEn('让 x 单独留在等号左边。', 'Isolate x on the left side.'),
          zhEn(`等式两边减 ${b}，得 x = ${x}。`, `Subtract ${b} from both sides to get x = ${x}.`));
      },
      L2(i) {
        const x = i + 3;
        const a = 2 + i % 4;
        const b = 5 + i % 5;
        return item('calculation', zhEn(`解方程 ${a}x + ${b} = ${a * x + b}。`, `Solve ${a}x + ${b} = ${a * x + b}.`), options(x),
          zhEn('先移去常数项，再处理 x 的系数。', 'Remove the constant term first, then deal with the coefficient of x.'),
          zhEn(`两边先减 ${b} 得 ${a}x = ${a * x}，再除以 ${a}，得到 x = ${x}。`,
            `Subtract ${b} to get ${a}x = ${a * x}. Divide by ${a} to get x = ${x}.`));
      },
      L3(i) {
        const x = i + 3;
        const b = 2 + i % 4;
        const c = 2 * x + b;
        return item('calculation', zhEn(`解方程 3x + ${b} = x + ${c}。`, `Solve 3x + ${b} = x + ${c}.`), options(x),
          zhEn('先从两边都减去 x。', 'Start by subtracting x from both sides.'),
          zhEn(`移项后 2x = ${c} − ${b} = ${2 * x}，所以 x = ${x}。`,
            `Rearranging gives 2x = ${c} − ${b} = ${2 * x}, so x = ${x}.`));
      },
      L4(i) {
        const a = i + 2;
        const b = a + 3;
        const eq = `x² − ${a + b}x + ${a * b} = 0`;
        return item('calculation', zhEn(`解方程 ${eq}。`, `Solve ${eq}.`), pairs([`${a}, ${b}`, `−${a}, −${b}`, `${a - 1}, ${b + 1}`, `${a}, −${b}`]),
          zhEn(`找两个数，它们的和是 ${a + b}，积是 ${a * b}。`, `Find two numbers whose sum is ${a + b} and product is ${a * b}.`),
          zhEn(`因式分解得 (x − ${a})(x − ${b}) = 0，因此两根为 ${a} 和 ${b}。`,
            `Factorise to get (x − ${a})(x − ${b}) = 0, with roots ${a} and ${b}.`));
      },
      L5(i) {
        const a = i + 2;
        const b = a + 4;
        const outside = zhEn(`x ≤ ${a} 或 x ≥ ${b}`, `x ≤ ${a} or x ≥ ${b}`);
        return item('reasoning', zhEn(`求不等式 (x − ${a})(x − ${b}) ≤ 0 的解集。`, `Find the solution set of (x − ${a})(x − ${b}) ≤ 0.`),
          [...pairs([`${a} ≤ x ≤ ${b}`, `${a} < x < ${b}`, `x ≥ ${b}`]), outside],
          zhEn('找出两个零点，分别考虑区间内外两个因子的符号。', 'Locate the two zeros and examine the signs of the factors inside and outside the interval.'),
          zhEn(`两个零点之间因子异号，端点的乘积等于 0，因此解集是 ${a} ≤ x ≤ ${b}。`,
            `The factors have opposite signs between the zeros and the product is zero at both endpoints. The solution is ${a} ≤ x ≤ ${b}.`));
      }
    },
    geometry: {
      L1(i) {
        const a = i + 8;
        const b = 3 + i % 3;
        return item('application', zhEn(`一块长方形标牌长 ${a} cm、宽 ${b} cm，周长是多少？`, `A rectangular sign is ${a} cm long and ${b} cm wide. What is its perimeter?`),
          pairs([2 * (a + b), a + b, 2 * a + b, a + 2 * b], ' cm'),
          zhEn('长和宽各有两条边。', 'Count two long sides and two short sides.'),
          zhEn(`周长 = 2 × (${a} + ${b}) = ${2 * (a + b)} cm。`, `Perimeter = 2 × (${a} + ${b}) = ${2 * (a + b)} cm.`));
      },
      L2(i) {
        const a = 39 + i;
        const b = 65 + i;
        const c = 180 - a - b;
        return item('application', zhEn(`一个三角形的两个内角分别为 ${a}° 和 ${b}°，第三个内角是多少？`,
          `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`), pairs([c, c + 10, c - 10, a + b], '°'),
          zhEn('用三角形内角和减去两个已知角。', 'Subtract the known angles from the sum of the angles in a triangle.'),
          zhEn(`180° − ${a}° − ${b}° = ${c}°。`, `180° − ${a}° − ${b}° = ${c}°.`));
      },
      L3(i) {
        const inner = i + 2;
        const outer = inner + 3;
        const area = outer ** 2 - inner ** 2;
        return item('application', zhEn(`圆环的外半径为 ${outer} cm，内半径为 ${inner} cm。面积是多少？`,
          `A ring has outer radius ${outer} cm and inner radius ${inner} cm. What is its area?`),
          pairs([area, outer ** 2, 9, outer ** 2 + inner ** 2], 'π cm²'),
          zhEn('用大圆面积减去小圆面积。', 'Subtract the inner disk area from the outer disk area.'),
          zhEn(`面积 = π(${outer}² − ${inner}²) = ${area}π cm²。`, `Area = π(${outer}² − ${inner}²) = ${area}π cm².`));
      },
      L4(i) {
        const a = i + 2;
        const b = a + 1;
        const correct = `${a ** 3}∶${b ** 3}`;
        return item('reasoning', zhEn(`两个相似立体的对应边长之比为 ${a}∶${b}，体积之比是多少？`,
          `The corresponding lengths of two similar solids are in the ratio ${a}:${b}. What is the ratio of their volumes?`),
          pairs([correct, `${a}∶${b}`, `${a ** 2}∶${b ** 2}`, `${b ** 3}∶${a ** 3}`]),
          zhEn('体积需要考虑三个方向上的缩放。', 'Consider how the scale factor applies in three dimensions.'),
          zhEn(`体积比是边长比的立方，因此为 ${correct}。`, `Cube both parts of the length ratio to get ${correct}.`));
      },
      L5(i) {
        const p = i + 4;
        const q = 4 * p;
        return item('reasoning', zhEn(`直角三角形从直角顶点向斜边作高，斜边被分成 ${p} cm 和 ${q} cm 两段。高是多少？`,
          `The altitude from the right angle of a right triangle splits the hypotenuse into segments of ${p} cm and ${q} cm. What is the altitude?`),
          pairs([2 * p, p, 3 * p, q], ' cm'),
          zhEn('高将原三角形分成两个相似的直角三角形。', 'The altitude divides the original triangle into two similar right triangles.'),
          zhEn(`由相似关系，高 h 满足 h² = ${p} × ${q} = ${p * q}，所以 h = ${2 * p} cm。`,
            `Similarity gives h² = ${p} × ${q} = ${p * q}, hence h = ${2 * p} cm.`));
      }
    },
    functions: {
      L1(i) {
        const x = i + 2;
        const y = x + 6;
        return item('application', zhEn(`函数的输入、输出依次是（${x}，${y}）、（${x + 1}，${y + 2}）、（${x + 2}，${y + 4}）。输入 ${x + 1} 时输出多少？`,
          `A function has input–output pairs (${x}, ${y}), (${x + 1}, ${y + 2}), and (${x + 2}, ${y + 4}). What is the output for input ${x + 1}?`),
          pairs([y + 2, y, y + 4, x + 1]),
          zhEn('每组数的第一个是输入，第二个是输出。', 'The first number of each pair is the input and the second is the output.'),
          zhEn(`找到输入 ${x + 1} 的一组，可读得输出 ${y + 2}。`, `Find the pair with input ${x + 1}. Its output is ${y + 2}.`));
      },
      L2(i) {
        const a = 2 + i % 4;
        const x = i + 3;
        const b = 5;
        return item('calculation', zhEn(`若 f(x) = ${a}x + ${b}，求 f(${x})。`, `If f(x) = ${a}x + ${b}, find f(${x}).`), options(a * x + b),
          zhEn('将输入代入 x 的位置。', 'Substitute the input for x.'),
          zhEn(`f(${x}) = ${a} × ${x} + ${b} = ${a * x + b}。`, `f(${x}) = ${a} × ${x} + ${b} = ${a * x + b}.`));
      },
      L3(i) {
        const a = 2 + i % 5;
        const b = i + 3;
        return item('application', zhEn(`一次函数 f 满足 f(0) = ${b} 且 f(2) = ${b + 2 * a}。求 f(5)。`,
          `A linear function f satisfies f(0) = ${b} and f(2) = ${b + 2 * a}. Find f(5).`),
          pairs([b + 5 * a, b + 2 * a, b + 10 * a, b + 4 * a]),
          zhEn('把输出增加量除以输入增加量，得到每步变化。', 'Divide the change in output by the change in input to find the slope.'),
          zhEn(`斜率为 (${b + 2 * a} − ${b}) ÷ 2 = ${a}，所以 f(5) = ${b} + 5 × ${a} = ${b + 5 * a}。`,
            `The slope is (${b + 2 * a} − ${b}) ÷ 2 = ${a}, so f(5) = ${b} + 5 × ${a} = ${b + 5 * a}.`));
      },
      L4(i) {
        const b = i + 2;
        const x = 3 + i % 4;
        const g = x + b;
        return item('application', zhEn(`f(x) = x²，g(x) = x + ${b}。求 f(g(${x}))。`, `Let f(x) = x² and g(x) = x + ${b}. Find f(g(${x})).`),
          pairs([g ** 2, x ** 2 + b, g, x ** 2 + b ** 2]),
          zhEn('先求括号最里面的函数值。', 'Evaluate the inner function first.'),
          zhEn(`g(${x}) = ${g}，再代入 f，得 ${g}² = ${g ** 2}。`, `g(${x}) = ${g}. Applying f next gives ${g}² = ${g ** 2}.`));
      },
      L5(i) {
        const a = i + 2;
        const k = 3 + i % 4;
        const root = i + 4;
        const y = k + root ** 2;
        return item('reasoning', zhEn(`函数 f(x) = (x − ${a})² + ${k} 的定义域为 x ≥ ${a}。f 的反函数在输入 ${y} 时输出多少？`,
          `The function f(x) = (x − ${a})² + ${k} has domain x ≥ ${a}. What is the output of its inverse at input ${y}?`),
          pairs([a + root, a - root, root, a + y]),
          zhEn('解 f(x) 等于给定输入的方程，再用定义域挑选解。', 'Solve for x, then use the domain to choose the valid root.'),
          zhEn(`(x − ${a})² = ${y} − ${k} = ${root ** 2}。由 x ≥ ${a}，取 x − ${a} = ${root}，得 x = ${a + root}。`,
            `(x − ${a})² = ${y} − ${k} = ${root ** 2}. Since x ≥ ${a}, take x − ${a} = ${root}, so x = ${a + root}.`));
      }
    },
    statistics: {
      L1(i) {
        const a = i + 2;
        return item('calculation', zhEn(`数据 ${a}, ${a + 1}, ${a + 2}, ${a + 1}, ${a + 3} 的众数是多少？`,
          `What is the mode of ${a}, ${a + 1}, ${a + 2}, ${a + 1}, ${a + 3}?`), pairs([a + 1, a, a + 2, a + 3]),
          zhEn('众数是出现次数最多的值。', 'The mode is the value that occurs most often.'),
          zhEn(`${a + 1} 出现两次，其他数只出现一次，所以众数是 ${a + 1}。`, `${a + 1} appears twice and every other value appears once.`));
      },
      L2(i) {
        const red = i + 2;
        const blue = 3;
        const total = red + blue;
        return item('application', zhEn(`袋中有 ${red} 个红球和 ${blue} 个蓝球，随机取一个。取到红球的概率是多少？`,
          `A bag contains ${red} red balls and ${blue} blue balls. What is the probability of drawing one red ball at random?`),
          pairs([red, red - 1, red + 1, total].map(n => fraction(n, total))),
          zhEn('列出红球数和所有球的总数。', 'Count the red balls and the total number of balls.'),
          zhEn(`概率是 ${red}/${total}，即 ${fraction(red, total)}。`, `The probability is ${red}/${total}, or ${fraction(red, total)}.`));
      },
      L3(i) {
        const a = i + 3;
        const b = a + 5;
        const mean = a + 4;
        const x = 3 * mean - a - b;
        return item('application', zhEn(`${a}、${b} 和 x 的平均数为 ${mean}。x 是多少？`,
          `The mean of ${a}, ${b} and x is ${mean}. What is x?`), options(x),
          zhEn('平均数乘以数据个数等于总和。', 'Multiply the mean by the number of values to find their sum.'),
          zhEn(`x = 3 × ${mean} − ${a} − ${b} = ${x}。`, `x = 3 × ${mean} − ${a} − ${b} = ${x}.`));
      },
      L4(i) {
        const red = i + 4;
        const total = red + 3;
        const numerator = red * (red - 1);
        const denominator = total * (total - 1);
        return item('reasoning', zhEn(`袋中有 ${red} 个红球、3 个蓝球，依次随机取两个且不放回。两个都是红球的概率是多少？`,
          `A bag contains ${red} red balls and 3 blue balls. Two are drawn at random without replacement. What is the probability both are red?`),
          pairs([fraction(numerator, denominator), fraction(red ** 2, total ** 2), fraction(red, total), fraction(numerator, denominator + total)]),
          zhEn('第一个取走后，剩下的红球数和总数各减 1。', 'After drawing the first red ball, subtract one from both the red count and the total.'),
          zhEn(`概率为 ${red}/${total} × ${red - 1}/${total - 1} = ${fraction(numerator, denominator)}。`,
            `Multiply ${red}/${total} × ${red - 1}/${total - 1} = ${fraction(numerator, denominator)}.`));
      },
      L5(i) {
        const a = i + 4;
        const b = a + 3;
        const total = b + 4;
        const fractionA = fraction(a, a + b);
        return item('reasoning', zhEn(`以相同概率选箱 A 或 B，每箱都有 ${total} 个球。A 有 ${a} 个红球，B 有 ${b} 个红球。已知随机取到红球，来自 A 的概率是多少？`,
          `Choose box A or B with equal probability. Each has ${total} balls. A has ${a} red balls and B has ${b}. Given that a randomly drawn ball was red, what is the probability it came from A?`),
          pairs([fractionA, '1/2', fraction(b, a + b), fraction(a, 2 * total)]),
          zhEn('两箱总球数一样。比较所有等可能的红球中，有多少来自 A。', 'The boxes have equal sizes. Among all equally likely red balls, count the share from A.'),
          zhEn(`在红球这一条件下，有 ${a + b} 个等可能的红球，其中 ${a} 个来自 A，因此概率为 ${fractionA}。`,
            `Given a red ball, there are ${a + b} equally likely red balls and ${a} are from A. The probability is ${fractionA}.`));
      }
    }
  };

  function buildQuestion(topic, level, index, diagnosticOnly = false) {
    const recipe = templates[topic][level](index);
    const answer = (index + data.topicsBySubject.math.indexOf(topic) + data.levels.math.indexOf(level)) % 4;
    const [correct, ...distractors] = recipe.options;
    distractors.splice(answer, 0, correct);
    const id = diagnosticOnly ? `ma-dx-${topic}-${level}` : `ma-pr-${topic}-${level}-${index + 1}`;
    return { ...recipe, id, subject: 'math', topic, level, answer, options: distractors, diagnosticOnly, curriculumRefs: [] };
  }

  for (const topic of data.topicsBySubject.math) {
    for (const level of data.levels.math) {
      for (let index = 0; index < 10; index++) data.questions.push(buildQuestion(topic, level, index));
    }
    data.questions.push(buildQuestion(topic, 'L2', 13, true), buildQuestion(topic, 'L4', 15, true));
  }
})();
