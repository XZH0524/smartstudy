(function () {
  'use strict';
  const { numeric, exact } = globalThis.EachVeyaBank400;
  function set(topic, level, slug, rows, build) {
    rows.forEach((row, index) => {
      const [stem, why, hint, result, wrong, verify, unit = '', skill = 'application'] = build(...row);
      numeric({ id: ['b400', 'math', topic, slug, index + 1].join('-'), subject: 'math', topic, level, stem, why, hint, skill },
        result, wrong, unit, verify);
    });
  }
  function wording(text, ...values) {
    return text.replace(/%(\d)/g, (_, i) => values[Number(i)]);
  }

  set('arithmetic','L1','order', [[8,4,3],[6,5,2],[12,3,4]], (a,b,c) => [
    wording('计算 %0 + %1 × %2。|Calculate %0 + %1 × %2.', a,b,c),
    wording('先算乘法得 %0，再加 %1 得 %2。|The multiplication gives %0. Add %1 to get %2.', b*c,a,a+b*c),
    '先做乘法。|Multiply first.', a+b*c, [(a+b)*c,a+b+c,a*b+c], n => n-a===b*c, '', 'calculation'
  ]);
  set('arithmetic','L2','per-item', [[6,4,3],[8,3,5],[5,7,4]], (paid,groups,n) => [
    wording('%0 包一共花了 %1 元，每包 %2 件。每件多少元？|The total price is %1 units for %0 packs of %2 items each. What is the price per item?',groups,groups*paid,n),
    wording('共有 %0 件，总价除以总件数等于 %1。|There are %0 items. Dividing the total price by their count gives %1.',groups*n,paid/n),
    '先算所有包一共几件。|Find the total number of items.',paid/n,[paid,groups*paid,n/paid],x=>exact(x*groups*n,groups*paid)
  ]);
  set('arithmetic','L3','remainder-budget', [[240,25,50],[320,50,25],[400,40,75]], (p,a,b) => {
    const first = p*a/100;
    const second = (p-first)*b/100;
    return [
      wording('有 %0 元，先花原钱数的 %1%，再花剩下钱数的 %2%。还剩多少元？|Start with %0 units. Spend %1% of the original amount, then %2% of what remains. How much is left?',p,a,b),
      wording('两次分别花 %0 元和 %1 元。从 %2 元减去两笔即可。|The payments are %0 and %1. Subtract both from the original %2.',first,second,p),
      '第二个百分数的基数是第一次之后的余额。|Apply the second percentage to the remaining balance.',
      p-first-second,[p-first-p*b/100,p-second,first+second],n=>exact(n+first+second,p)
    ];
  });
  set('arithmetic','L4','before-tax', [[200,20,10],[300,10,20],[500,40,5]], (base,disc,tax) => {
    const after = base*(100-disc)/100;
    const final = after*(100+tax)/100;
    return [
      wording('物品先按原价降价 %0%，再对折后价加收 %1% 的税，最终为 %2 元。原价多少元？|An item is discounted by %0%, then taxed at %1% on the discounted price. The final bill is %2. What was the original price?',disc,tax,final),
      wording('先除以 %0 得未税折后价 %1，再除以 %2 得原价。|Divide by %0 to recover the discounted price %1 before tax, then by %2 to recover the original.',1+tax/100,after,1-disc/100),
      '按相反顺序撤销两项百分数变化。|Undo both changes in reverse order.',base,[after,final,final*(1+disc/100)],
      n=>exact((n-n*disc/100)*(1+tax/100),final)
    ];
  });
  set('arithmetic','L5','repeated-schedule', [[6,8,2],[8,12,4],[10,15,5]], (a,b,g) => {
    const result = a*b/g;
    const earliest = Array.from({length:a*b},(_,i)=>i+1).find(n=>n%a===0&&n%b===0);
    return [
      wording('两条提醒刚刚同时响。甲每 %0 分钟响一次，乙每 %1 分钟响一次。下一次同时响要等几分钟？|Two reminders just rang together. One repeats every %0 minutes and one every %1. In how many minutes will they next ring together?',a,b),
      wording('要找最小的正公倍数。%0 和 %1 的最大公因数为 %2，最小公倍数为 %3。|Find the least positive common multiple. The greatest common divisor of %0 and %1 is %2, giving %3 minutes.',a,b,g,result),
      '第一次重合要找最小的正公倍数。|Find the smallest positive multiple of both.',result,[a*b,a+b,2*result],
      n=>n===earliest,'','reasoning'
    ];
  });

  set('algebra','L1','negative-input', [[3,2,5],[4,3,7],[5,2,4]], (a,t,b) => [
    wording('若 x = −%0，求 %1x + %2 的值。|Evaluate %1x + %2 at x = −%0.',t,a,b),
    wording('先得到 %0 × (−%1) = −%2，再加 %3。|Multiply %0 by −%1 to get −%2, then add %3.',a,t,a*t,b),
    '把负号随数值一起代入。|Keep the minus sign when substituting.', b-a*t,[b+a*t,-b-a*t,b-t],n=>n-b===-a*t,'','calculation'
  ]);
  set('algebra','L2','tickets', [[28,8,4],[41,6,5],[56,14,6]], (total,fee,units) => [
    wording('一份订单含 %0 张同价票和一次 %1 元服务费，共 %2 元。每张票多少钱？|An order comes to %2 units for %0 equal-price tickets and a single service fee of %1. How much is each ticket?',units,fee,total),
    wording('设票价 x，则 %0x + %1 = %2。先减 %1，再除以 %0。|Let x be the ticket price. Solve %0x + %1 = %2 by subtracting %1, then dividing by %0.',units,fee,total),
    '只收一次服务费。|The fee is charged once.',(total-fee)/units,[total/units,total-fee,fee/units],n=>exact(n*units+fee,total)
  ]);
  set('algebra','L3','two-prices', [[7,4,9,5],[8,3,9,4],[10,5,11,6]], (n,high,p,q) => {
    const total = high*p+(n-high)*q;
    return [
      wording('买了 %0 张票，有 %1 元和 %2 元两种，共花 %3 元。较贵的有几张？|A group buys %0 tickets costing either %1 or %2 units each. The total is %3. How many tickets are higher-priced?',n,p,q,total),
      wording('设较贵票 x 张，%0x + %1(%2 − x) = %3，解得 %4。|For x higher-price tickets, solve %0x + %1(%2 − x) = %3 to get %4.',p,q,n,total,high),
      '两类票数加起来等于总张数。|The two counts add to the total.',
      high,[n-high,n-1,n+1],x=>Number.isInteger(x)&&x>=0&&x<=n&&p*x+q*(n-x)===total
    ];
  });
  set('algebra','L4','longer-side', [[4,9],[5,11],[7,13]], (w,l) => [
    wording('一个长方形周长为 %0 cm，面积为 %1 cm²。较长一条边是多少？|A rectangle has perimeter %0 cm and area %1 cm². What is its longer side?',2*(w+l),w*l),
    wording('两边之和为 %0、积为 %1。方程 x² − %0x + %1 = 0 的两根为 %2 和 %3。|The sides have sum %0 and product %1. The roots of x² − %0x + %1 = 0 are %2 and %3.',w+l,w*l,w,l),
    '先从周长得到长与宽的和。|Use the perimeter to find the sum of the sides.',
    l,[w,w+l,l+1],n=>n>=w+l-n&&n*(w+l-n)===w*l,'cm','reasoning'
  ]);
  set('algebra','L5','absolute-integers', [[2,8,5],[3,9,7],[4,16,13]], (a,b,t) => {
    const first = Math.floor((b-t)/a)+1;
    const last = Math.ceil((b+t)/a)-1;
    const result = last-first+1;
    const direct = Array.from({length:30},(_,i)=>i-10).filter(x=>Math.abs(a*x-b)<t).length;
    return [
      wording('有多少整数 x 满足 %0x − %1 的绝对值严格小于 %2？|How many integers x make the absolute value of %0x − %1 strictly less than %2?',a,b,t),
      wording('由 −%0 < %1x − %2 < %0，最小可取整数为 %3，最大为 %4，计 %5 个。|Solve −%0 < %1x − %2 < %0. Integers from %3 through %4 are included, giving %5 values.',t,a,b,first,last,result),
      '注意严格不等式不含端点。|Take care with the strict endpoints.',result,[result-1,result+1,2*t],n=>n===direct,'','reasoning'
    ];
  });
  set('algebra','L5','crossover', [[30,5,9],[24,4,7],[56,6,12]], (fee,a,b) => {
    const threshold = Math.floor(fee/(b-a))+1;
    return [
      wording('甲方案先收 %0 元，每次另收 %1 元。乙方案不收起步费，每次 %2 元。至少使用几次，甲才严格便宜？|Plan A charges %0 up front plus %1 per use. Plan B charges %2 per use with no upfront fee. What is the least number of uses for A to be strictly cheaper?',fee,a,b),
      wording('要求 %0 + %1x < %2x，即 x > %0/%3。最小整数为 %4。|Solve %0 + %1x < %2x, so x > %0/%3. The first valid integer is %4.',fee,a,b,b-a,threshold),
      '相同价格不满足严格便宜。|Equal cost does not meet strictly cheaper.',
      threshold,[threshold-1,threshold+1,fee],n=>fee+a*n<b*n&&fee+a*(n-1)>=b*(n-1),'','reasoning'
    ];
  });

  set('geometry','L1','parallelogram', [[7,5,6],[8,6,7],[10,7,9]], (b,h,s) => [
    wording('平行四边形底为 %0 cm，垂直高为 %1 cm，斜边为 %2 cm。面积是多少？|A parallelogram has base %0 cm, perpendicular height %1 cm and sloping side %2 cm. What is the area?',b,h,s),
    wording('面积为底乘垂直高，%0 × %1 = %2 cm²。|Multiply the base by its perpendicular height to get %0 × %1 = %2 cm².',b,h,b*h),
    '用垂直高，斜边不是高。|Use the perpendicular height rather than the sloping side.',
    b*h,[b*s,b+h,2*(b+s)],n=>n/h===b,'cm²'
  ]);
  set('geometry','L2','exterior-angle', [[5],[8],[12]], n => [
    wording('一个正 %0 边形的一个外角有多少度？|What is one exterior angle of a regular %0-sided polygon?',n),
    wording('走过一圈共转 360°，均分 %0 次，得 %1°。|A full turn of 360° is shared equally among %0 angles, giving %1 degrees.',n,360/n),
    '沿边走一圈，总转角是一周。|The turns add up to a full revolution.',
    360/n,[180-360/n,180/n,360/(n-1)],a=>a*n===360,'°','calculation'
  ]);
  set('geometry','L3','grid-distance', [[3,4,2],[5,12,4],[8,15,1]], (x,y,start) => [
    wording('在直角坐标系中，A(%0, 0) 到 B(%1, %2) 的直线距离是多少？|On a coordinate plane, what is the straight-line distance from A(%0, 0) to B(%1, %2)?',start,start+x,y),
    wording('水平差 %0，竖直差 %1。距离为 √(%0² + %1²) = %2。|The differences are %0 horizontally and %1 vertically. The distance is √(%0² + %1²) = %2.',x,y,Math.hypot(x,y)),
    '把横纵差当成直角三角形的两条直角边。|The horizontal and vertical differences form perpendicular legs.',
    Math.hypot(x,y),[x+y,y,x*y],n=>n>0&&n*n===x*x+y*y
  ]);
  set('geometry','L4','scaled-area', [[20,3,2],[36,2,3],[49,4,7]], (area,num,den) => [
    wording('新图与原图相似。原图面积 %0 cm²，新旧对应长度之比为 %1:%2。新图的面积是多少？|A new figure is similar to the %0 cm² original. Their corresponding lengths, new to original, are %1:%2. What is the new area?',area,num,den),
    wording('面积因子是长度因子的平方，%0 × (%1/%2)²。|Multiply %0 by (%1/%2)², the square of the length factor.',area,num,den),
    '面积在两个独立方向同时缩放。|Both dimensions scale.',
    area*num*num/(den*den),[area*num/den,area*den/num,area+num],n=>exact(n*den*den,area*num*num),'cm²','reasoning'
  ]);
  set('geometry','L5','fence', [[18],[22],[26]], half => {
    const best = Math.floor(half/2)*Math.ceil(half/2);
    const possibilities = Array.from({length:half-1},(_,i)=>(i+1)*(half-i-1));
    return [
      wording('用总长 %0 m 的围栏围成四面封闭的长方形，边长取正整数米。面积最大是多少？|Make a rectangle enclosed by %0 metres of fence. Side lengths are positive whole metres. What is the largest area?',2*half),
      wording('两邻边和为 %0。面积 x(%0 − x) 在两边相等时最大，得 %1。|The two sides sum to %0. The product x(%0 − x) is largest at equal sides, giving %1.',half,best),
      '用 x 表示一边，再写出另一边。|Write the other side in terms of x.',
      best,[(half/2-1)*(half/2+1),half*half,half],n=>n===Math.max(...possibilities),'m²','reasoning'
    ];
  });

  set('functions','L1','table-preimage', [[2,5,8,3],[1,6,9,5],[3,7,11,6]], (a,b,c,d) => [
    wording('函数表格输入依次为 %0、%1、%2，输出分别为 %3、%4、%5。得到输出 %4 的输入是多少？|A table pairs inputs %0, %1, %2 with outputs %3, %4, %5, respectively. Which input gives %4?',a,b,c,d,d+2,d+5),
    wording('输出 %0 在第二组，与输入 %1 配对。|The second pair links output %0 to input %1.',d+2,b),
    '先找到输出，再读同一项的输入。|Locate the output, then read the matching input.',
    b,[a,c,d+2],n=>new Map([[a,d],[b,d+2],[c,d+5]]).get(n)===d+2
  ]);
  set('functions','L2','slope', [[2,5,3,9],[1,5,4,16],[3,8,15,5]], (x1,x2,y1,y2) => {
    const k = (y2-y1)/(x2-x1);
    return [
      wording('一条直线经过 (%0, %1) 和 (%2, %3)。斜率是多少？|A line passes through (%0, %1) and (%2, %3). What is its slope?',x1,y1,x2,y2),
      wording('纵坐标改变量 %0 除以横坐标改变量 %1，得到 %2。|Divide the vertical change %0 by the horizontal change %1 to get %2.',y2-y1,x2-x1,k),
      '两个差的计算应使用相同的点顺序。|Take both differences in the same order.',
      k,[y2-y1,-k,1/k],n=>n*(x2-x1)+y1===y2,'','calculation'
    ];
  });
  set('functions','L3','piecewise', [[6,3,2,11],[8,4,3,10],[5,2,4,9]], (limit,first,extra,x) => [
    wording('前 %0 个商品各收 %1 元，超出部分每个 %2 元。买 %3 个要付多少钱？|A store charges %1 units each for the first %0 items and %2 per additional item. What do %3 items cost?',limit,first,extra,x),
    wording('分成 %0 个和 %1 个两部分，费用是 %0 × %2 + %1 × %3。|Split at %0 items. The total is %0 × %2 + %1 × %3.',limit,x-limit,first,extra),
    '数清有几个商品按第二种价格计。|Count the items at the second rate.',
    limit*first+(x-limit)*extra,[x*first,x*extra,limit*first+x*extra],
    n=>n===Array.from({length:x},(_,i)=>i<limit?first:extra).reduce((a,b)=>a+b)
  ]);
  set('functions','L4','undo-composite', [[3,2,4,5],[4,3,2,4],[5,4,3,2]], (a,b,c,x) => {
    const out = (a*x+b)*c;
    return [
      wording('f(x) = %0x + %1，g(x) = %2x。已知 g(f(x)) = %3，求 x。|Let f(x) = %0x + %1 and g(x) = %2x. Given g(f(x)) = %3, find x.',a,b,c,out),
      wording('先除以 %0 得 f(x) = %1，再减 %2 除以 %3，得到 %4。|First divide by %0 to get f(x) = %1. Then subtract %2 and divide by %3, giving %4.',c,a*x+b,b,a,x),
      '先撤销最外层的函数。|Undo the outer function first.',
      x,[a*x+b,out/a,out/c-b],n=>(a*n+b)*c===out,'','calculation'
    ];
  });
  set('functions','L5','optimal-integer', [[7,2],[11,6],[15,5]], (a,c) => {
    const smallest = Math.floor(a/2);
    const parabola = x => -x*x+a*x+c;
    const best = Math.max(...Array.from({length:21},(_,i)=>parabola(i)));
    return [
      wording('对 0 到 20 的整数 x，f(x) = −x² + %0x + %1。使 f(x) 取得最大值的最小 x 是多少？|For integer x from 0 to 20, f(x) = −x² + %0x + %1. What is the smallest x giving the maximum?',a,c),
      wording('对称轴 x = %0/2 位于两个相邻整数中间。两点并列最大，较小者是 %1。|The axis x = %0/2 lies midway between two consecutive integers. Both reach the maximum. The smaller is %1.',a,smallest),
      '在开口向下的抛物线上比较最接近对称轴的整数。|Compare integers closest to the axis of the downward parabola.',
      smallest,[smallest+1,smallest-1,a],n=>parabola(n)===best&&parabola(n-1)<best,'','reasoning'
    ];
  });

  set('statistics','L1','median', [[9,2,4,13,5],[17,3,11,4,8],[22,6,10,19,14]], (...values) => {
    const sorted = [...values].sort((a,b)=>a-b);
    return [
      wording('求这五个数的中位数：%0。|Find the median of the five numbers: %1.',values.join('、'),values.join(', ')),
      wording('从小到大排为 %0，取中间的第三个。|Sort as %1 and take the middle (third) value.',sorted.join('、'),sorted.join(', ')),
      '先把数值从小到大排好。|Put the numbers in order first.',
      sorted[2],[sorted[1],sorted[3],values.reduce((a,b)=>a+b)/5],
      n=>values.includes(n)&&values.filter(x=>x<n).length===2&&values.filter(x=>x>n).length===2,'','calculation'
    ];
  });
  set('statistics','L2','spinner', [[4,1,40],[5,2,35],[8,3,80]], (all,marked,tries) => [
    wording('均匀转盘有 %0 格，其中 %1 格带星。公平转动 %2 次，带星结果的期望次数是多少？|A fair spinner has %0 equal sectors, %1 starred. In %2 spins, what is the expected number of stars?',all,marked,tries),
    wording('一次为星的概率是 %0/%1，乘试验次数 %2。|Multiply probability %0/%1 by the %2 trials.',marked,all,tries),
    '期望次数不代表每轮一定出现这么多次。|An expected count is not a guaranteed observed count.',
    tries*marked/all,[tries-marked,tries/all,marked],n=>n*all===tries*marked
  ]);
  set('statistics','L3','weighted-mean', [[3,10,2,20],[4,12,2,24],[5,8,3,16]], (n,a,m,b) => [
    wording('一组 %0 个记录的平均数为 %1，另一组 %2 个的平均数为 %3。合并后的平均数是多少？|One group of %0 observations averages %1; a second group of %2 averages %3. What is the combined mean?',n,a,m,b),
    wording('先恢复总和 %0 和 %1，把两者的和除以 %2。|Recover the two totals %0 and %1. Divide their sum by %2.',n*a,m*b,n+m),
    '用记录数量作为权重。|Weight each mean by group size.',
    (n*a+m*b)/(n+m),[(a+b)/2,a+b,b],x=>exact(x*(n+m),n*a+m*b)
  ]);
  set('statistics','L4','conditional', [[6,24,18],[8,20,25],[9,36,48]], (both,club,other) => [
    wording('抽样中有 %0 人加入美术社，其中 %1 人也加入音乐社。另有 %2 人没加入美术社。在美术社成员中，同时参加音乐社的人占百分之几？|In a sample, %0 people join the art club and %1 of those also join music. Another %2 are outside the art club. Among art members, what percentage also joins music?',club,both,other),
    wording('只在 %0 名美术社成员内计数，分子为 %1，百分数是 %2%。|Restrict the denominator to the %0 art members. The numerator is %1, giving %2%.',club,both,100*both/club),
    '先缩小到题目指定的群体。|First restrict the group using the condition.',
    100*both/club,[100*both/(club+other),100*(club-both)/club,both],n=>exact(n/100*club,both),'%','reasoning'
  ]);
  set('statistics','L5','selection', [[3,5],[4,7],[6,8]], (a,b) => {
    const people = Array.from({length:a+b},(_,i)=>i);
    const count = people.flatMap(i=>people.filter(j=>i<j&&(i<a)!==(j<a))).length;
    return [
      wording('甲组有 %0 人，乙组有 %1 人，成员互不重叠。从两组中选两人，不考虑先后，恰好每组一人有几种选法？|There are %0 people in group A and %1 in group B, with no overlap. How many unordered two-person selections include one from each group?',a,b),
      wording('甲组每人都能搭配乙组不同的人，得到 %0 × %1 = %2。交换名字顺序不另计。|Pair each member of A with each member of B for %0 × %1 = %2. Reversing the names does not count again.',a,b,a*b),
      '按组别搭配，避免把交换顺序再算一次。|Pair by group without counting reversed order again.',
      a*b,[a+b,2*a*b,(a+b)*(a+b-1)/2],n=>n===count,'','reasoning'
    ];
  });
})();
