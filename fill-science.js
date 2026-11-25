(function () {
  'use strict';
  const { numeric } = globalThis.EachVeyaFillBank;
  const bi = globalThis.SmartStudyData.bilingual;
  const problem = (zh, en, hz, he, ez, ee, expected, verify) =>
    ({ prompt: bi(zh, en), hint: bi(hz, he), explanation: bi(ez, ee), expected, verify });

  numeric('physics', 'average-speed', 'L1', 'convert-speed', 'm/s', i => {
    const expected = 5 * (i + 2), speed = 18 * (i + 2);
    return problem(`仪表显示 ${speed} km/h，换算成 m/s。`, `Convert a speed of ${speed} km/h to m/s.`,
      '1 km = 1000 m，1 h = 3600 s。', 'Use 1000 metres per kilometre and 3600 seconds per hour.',
      `${speed} × 1000 ÷ 3600 = ${expected} m/s。`, `${speed} × 1000 ÷ 3600 = ${expected} m/s.`,
      expected, x => x * 3600 === speed * 1000);
  });
  numeric('physics', 'wave-behaviour', 'L1', 'cycles-in-time', '', i => {
    const frequency = i + 4, time = 2 + i % 5, expected = frequency * time;
    return problem(`一个振动每秒完成 ${frequency} 个周期。在 ${time} 秒内完成多少个周期？`, `An oscillator completes ${frequency} cycles per second. How many cycles occur in ${time} seconds?`,
      '用每秒周期数乘以时间。', 'Multiply the cycles per second by elapsed time.',
      `${frequency} × ${time} = ${expected} 个周期。`, `${frequency} × ${time} = ${expected} cycles.`,
      expected, x => x / time === frequency);
  });
  numeric('physics', 'average-speed', 'L2', 'walk-including-stop', 'm/s', i => {
    const moving = i + 11, stopped = i + 6, expected = 1 + i % 3, distance = (moving + stopped) * expected;
    return problem(`步行者走了 ${moving} 秒、停了 ${stopped} 秒。全程总路程 ${distance} 米。平均速率是多少？`, `A walker moves for ${moving} s and stops for ${stopped} s. A total of ${distance} m is covered. What is the average speed over the whole interval?`,
      '总用时包括停留。', 'Include stopped time in the elapsed time.',
      `${distance} ÷ (${moving} + ${stopped}) = ${expected} m/s。`, `${distance} ÷ (${moving} + ${stopped}) = ${expected} m/s.`,
      expected, x => x * (moving + stopped) === distance);
  });
  numeric('physics', 'ohmic-current', 'L2', 'resistance-from-readings', 'Ω', i => {
    const current = i % 3 + 2, expected = 7 + i, voltage = current * expected;
    return problem(`理想欧姆电阻两端电压为 ${voltage} V，通过的电流为 ${current} A。电阻是多少？`, `An ohmic resistor has ${voltage} V across it and carries ${current} A. What is the resistance?`,
      '由 U = IR 解出 R。', 'Rearrange V = IR for R.',
      `R = ${voltage} ÷ ${current} = ${expected} Ω。`, `R = ${voltage} ÷ ${current} = ${expected} Ω.`,
      expected, x => current * x === voltage);
  });
  numeric('physics', 'forces-motion', 'L3', 'opposing-forces', 'm/s²', i => {
    const mass = i + 3, opposing = 13 + i, expected = 2 + i % 5, assisting = mass * expected + opposing;
    return problem(`质量为 ${mass} kg 的模型车受到向右 ${assisting} N 和向左 ${opposing} N 的水平力。取向右为正，求加速度。`, `A ${mass} kg cart experiences horizontal forces of ${assisting} N to the right and ${opposing} N to the left. Taking right as positive, find its acceleration.`,
      '先求有方向的合力。', 'Find the signed resultant force first.',
      `a = (${assisting} − ${opposing}) ÷ ${mass} = ${expected} m/s²。`, `a = (${assisting} − ${opposing}) ÷ ${mass} = ${expected} m/s².`,
      expected, x => x * mass + opposing === assisting);
  });
  numeric('physics', 'fluid-models', 'L3', 'pressure-rise', 'Pa', i => {
    const from = i + 1, to = from + 2 + i % 3, gradient = 9500 + 100 * i, expected = (to - from) * gradient;
    return problem(`同一静止液体中，每下降 1 米压强增加 ${gradient} Pa。从距液面 ${from} m 到 ${to} m，压强增加多少？`, `In the same stationary liquid, pressure rises by ${gradient} Pa per metre of depth. How much does pressure increase from ${from} m to ${to} m below the surface?`,
      '用深度变化量求压强变化量。', 'Use the change in depth.',
      `(${to} − ${from}) × ${gradient} = ${expected} Pa。`, `(${to} − ${from}) × ${gradient} = ${expected} Pa.`,
      expected, x => from * gradient + x === to * gradient);
  });
  numeric('physics', 'wave-behaviour', 'L4', 'echo-gap', 'm', i => {
    const speed = 340, gap = i + 3, expected = 17 * gap;
    return problem(`声源到两块反射板距离不同，在它们的正前方分别收到回声。两次回声到达时间相差 ${gap}/10 秒，声速为 ${speed} m/s。两块板到声源的距离相差多少？`, `A sound reflects from two surfaces in front of the source. The echoes arrive ${gap}/10 s apart. Sound travels at ${speed} m/s. By how many metres do the one-way distances differ?`,
      '回声的计时包括去程和回程。', 'Echo travel time covers the outward and return paths.',
      `${speed} × (${gap}/10) ÷ 2 = ${expected} m。`, `${speed} × (${gap}/10) ÷ 2 = ${expected} m.`,
      expected, x => x * 20 === speed * gap);
  });
  numeric('physics', 'energy-efficiency', 'L4', 'two-stage-output', 'J', i => {
    const input = 500 + 100 * i, expected = input * 2 / 5;
    return problem(`装置依次经过效率 80% 与 50% 的两个阶段。第一阶段输入 ${input} J，输出全部送入第二阶段。最终有用输出是多少？`, `A device has two successive stages with efficiencies of 80% and 50%. The first stage takes ${input} J and passes all its useful output to the second. Find the final useful output.`,
      '第二个效率乘的是第一阶段的有用输出。', 'Apply the second efficiency to the first stage’s useful output.',
      `${input} × 0.8 × 0.5 = ${expected} J。`, `${input} × 0.8 × 0.5 = ${expected} J.`,
      expected, x => x * 5 === 2 * input);
  });
  numeric('physics', 'thermal-models', 'L5', 'heat-capacity-balance', '°C', i => {
    const cold = 12 + i, hot = cold + 30 + 3 * i, c = 4 + i, expected = cold + (hot - cold) / 3;
    return problem(`热容为 ${c} J/K 的热物体原为 ${hot} °C，热容为 ${2*c} J/K 的冷物体原为 ${cold} °C。两物体接触，热容恒定且与外界无能量交换。平衡温度是多少？`, `A hot body at ${hot} °C has heat capacity ${c} J/K. A cold body at ${cold} °C has heat capacity ${2*c} J/K. They touch with constant heat capacities and no energy exchange with the surroundings. Find the equilibrium temperature.`,
      '热物体失去的热量等于冷物体吸收的热量。', 'Equate the energy lost by the hotter body to the energy gained by the colder body.',
      `按热容加权，T = (${hot} + 2 × ${cold}) ÷ 3 = ${expected} °C。`, `Weighting by heat capacity gives T = (${hot} + 2 × ${cold}) ÷ 3 = ${expected} °C.`,
      expected, x => c * (hot - x) === 2 * c * (x - cold));
  });
  numeric('physics', 'ohmic-current', 'L5', 'parallel-then-series', 'A', i => {
    const r = i + 2, expected = i + 3, series = 4 + i, total = r + series, volts = total * expected;
    return problem(`两只 ${2*r} Ω 的理想电阻并联，再与 ${series} Ω 电阻串联。电源电压为 ${volts} V。求电源提供的总电流。`, `Two ideal ${2*r} Ω resistors in parallel are in series with a ${series} Ω resistor. The supply voltage is ${volts} V. Find the total supply current.`,
      '先把并联部分化成一个等效电阻。', 'Replace the parallel pair with its equivalent resistance first.',
      `并联等效为 ${r} Ω，总电阻 ${total} Ω，电流为 ${volts} ÷ ${total} = ${expected} A。`, `The parallel pair is ${r} Ω, so the total is ${total} Ω and the current is ${volts} ÷ ${total} = ${expected} A.`,
      expected, x => x * total === volts);
  });

  numeric('chemistry', 'atomic-structure', 'L1', 'neutron-count', '', i => {
    const protons = 6 + i, mass = 2 * protons + i % 3, expected = mass - protons;
    return problem(`某同位素的原子序数为 ${protons}，质量数为 ${mass}。有多少个中子？`, `An isotope has atomic number ${protons} and mass number ${mass}. How many neutrons are in its nucleus?`,
      '质量数包含质子与中子。', 'Mass number counts protons and neutrons.',
      `${mass} − ${protons} = ${expected} 个中子。`, `${mass} − ${protons} = ${expected} neutrons.`,
      expected, x => x + protons === mass);
  });
  numeric('chemistry', 'amount-concentration', 'L1', 'litres-to-millilitres', 'mL', i => {
    const tenth = i + 3, expected = tenth * 100;
    return problem(`浓度题给的溶液体积为 ${tenth}/10 L，换算成毫升。`, `A concentration exercise gives a volume of ${tenth}/10 L. Convert it to millilitres.`,
      '1 L = 1000 mL。', 'There are 1000 mL in a litre.',
      `(${tenth}/10) × 1000 = ${expected} mL。`, `(${tenth}/10) × 1000 = ${expected} mL.`,
      expected, x => x * 10 === tenth * 1000);
  });
  numeric('chemistry', 'mass-density', 'L2', 'density-from-difference', 'g/cm³', i => {
    const before = 21 + i, delta = 6 + i, after = before + delta, expected = 2 + i % 5, mass = delta * expected;
    return problem(`教材中的模拟读数从 ${before} mL 变为 ${after} mL，由质量为 ${mass} g 的固体样品完全浸没引起。求样品的密度。1 mL = 1 cm³。`, `In a simulated reading a fully submerged solid of mass ${mass} g raises the volume from ${before} mL to ${after} mL. Find its density. Use 1 mL = 1 cm³.`,
      '读数的差是固体体积。', 'The difference between the readings gives the solid’s volume.',
      `样品体积 ${delta} cm³，密度为 ${mass} ÷ ${delta} = ${expected} g/cm³。`, `Its volume is ${delta} cm³. Density is ${mass} ÷ ${delta} = ${expected} g/cm³.`,
      expected, x => x * (after - before) === mass);
  });
  numeric('chemistry', 'mass-percentage', 'L2', 'component-percent', '%', i => {
    const sample = 50 + 50 * i, expected = 18 + 2 * i, component = sample * expected / 100;
    return problem(`一份混合物重 ${sample} g，其中组分甲重 ${component} g。甲的质量百分数是多少？`, `A ${sample} g mixture contains ${component} g of component A. What is the mass percentage of A?`,
      '总质量在分母。', 'Use the total mass in the denominator.',
      `${component} ÷ ${sample} × 100% = ${expected}% 。`, `${component} ÷ ${sample} × 100% = ${expected}%.`,
      expected, x => sample * x === 100 * component);
  });
  numeric('chemistry', 'mole-calculations', 'L3', 'amount-by-mass', 'mol', i => {
    const molar = [18, 44, 58, 100, 60, 32, 40, 64, 80, 98][i];
    const expected = 2 + i % 5, mass = expected * molar;
    return problem(`某物质的摩尔质量为 ${molar} g/mol，一份样品重 ${mass} g。求样品的物质的量。`, `A substance has molar mass ${molar} g/mol. Find the amount of substance in a ${mass} g sample.`,
      '把质量除以摩尔质量。', 'Divide the mass by the molar mass.',
      `${mass} ÷ ${molar} = ${expected} mol。`, `${mass} ÷ ${molar} = ${expected} mol.`,
      expected, x => x * molar === mass);
  });
  numeric('chemistry', 'equation-models', 'L3', 'remaining-reactant', 'mol', i => {
    const hydrogen = 5 + 3 * i, oxygen = 2 + i, expected = hydrogen - 2 * oxygen;
    return problem(`纸面反应模型 2H₂ + O₂ → 2H₂O 中，开始有 ${hydrogen} mol H₂ 和 ${oxygen} mol O₂，反应至一种物质耗尽。剩下多少 mol H₂？`, `In the paper model 2H₂ + O₂ → 2H₂O, start with ${hydrogen} mol H₂ and ${oxygen} mol O₂ and react until one is exhausted. How much H₂ remains?`,
      '每 1 mol O₂ 消耗 2 mol H₂。', 'Each mole of O₂ uses two moles of H₂.',
      `O₂ 耗尽，需要 ${2*oxygen} mol H₂，剩 ${expected} mol。`, `O₂ is exhausted after ${2*oxygen} mol H₂ has reacted, leaving ${expected} mol.`,
      expected, x => x + 2 * oxygen === hydrogen);
  });
  numeric('chemistry', 'amount-concentration', 'L4', 'dilution-volume', 'mL', i => {
    const initial = 25 + 5 * i, concentration = i + 4, expected = 4 * initial;
    return problem(`模拟溶液的初始体积为 ${initial} mL，浓度为 ${concentration}/10 mol/L。溶质的物质的量恒定，当浓度降为初始值的四分之一时，溶液总体积是多少？`, `A model solution has initial volume ${initial} mL and concentration ${concentration}/10 mol/L. The solute amount stays fixed. What is the total volume when the concentration is one quarter of its initial value?`,
      '溶质的量恒定时，浓度与总体积成反比。', 'For fixed solute amount, concentration is inversely proportional to volume.',
      `浓度缩小到四分之一，体积变为 ${initial} × 4 = ${expected} mL。`, `A quarter of the concentration requires ${initial} × 4 = ${expected} mL.`,
      expected, x => x * concentration === 4 * initial * concentration);
  });
  numeric('chemistry', 'acid-base-models', 'L4', 'hydrogen-ion-ratio', '倍', i => {
    const ph = 2 + i % 5, gap = 1 + Math.floor(i / 5), expected = 10 ** gap;
    return problem(`在用于计算的稀溶液模型中，pH 分别为 ${ph} 和 ${ph+gap}。前者的氢离子浓度是后者的几倍？`, `Two dilute solutions in a calculation model have pH values ${ph} and ${ph+gap}. How many times as large is the first hydrogen ion concentration as the second?`,
      'pH 每增加 1，氢离子浓度降为原来的十分之一。', 'An increase of one pH unit corresponds to one tenth of the hydrogen ion concentration.',
      `相差 ${gap} 个 pH 单位，浓度之比为 10 的 ${gap} 次方，即 ${expected}。`, `The difference is ${gap} pH units. The concentration ratio is 10 to the power ${gap}, or ${expected}.`,
      expected, x => x * 10 ** ph === 10 ** (ph + gap));
  });
  numeric('chemistry', 'mass-percentage', 'L5', 'mix-two-percentages', '%', i => {
    const a = 50 + 50 * i, b = 3 * a, p = 4 + i, q = p + 8, expected = p + 6;
    return problem(`两份含同一种溶质的模型溶液分别为 ${a} g（质量分数 ${p}%）和 ${b} g（质量分数 ${q}%）。混合无损失时，质量百分数是多少？`, `Two model solutions of the same solute are ${a} g at ${p}% by mass and ${b} g at ${q}%. With no loss on mixing, find the resulting mass percentage.`,
      '先把两份溶液所含的溶质质量相加。', 'Add the two solute masses first.',
      `质量加权为 (${a} × ${p} + ${b} × ${q}) ÷ (${a} + ${b}) = ${expected}% 。`, `The mass-weighted percentage is (${a} × ${p} + ${b} × ${q}) ÷ (${a} + ${b}) = ${expected}%.`,
      expected, x => x * (a + b) === a * p + b * q);
  });
  numeric('chemistry', 'atomic-structure', 'L5', 'isotope-abundance', '%', i => {
    const light = 21 + i, heavy = light + 4, offset = 1 + i % 3, mean = light + offset, expected = 25 * offset;
    return problem(`假想元素只有两种同位素，在模型中质量分别为 ${light} u 和 ${heavy} u，平均原子质量为 ${mean} u。较重同位素的百分丰度是多少？`, `A hypothetical element has just two model isotopes of masses ${light} u and ${heavy} u. The mean atomic mass is ${mean} u. What percentage of its atoms are the heavier isotope?`,
      '平均值离较轻值的距离，除以两同位素的质量差。', 'Divide the distance from the light mass to the mean by the full gap between isotope masses.',
      `(${mean} − ${light}) ÷ (${heavy} − ${light}) × 100% = ${expected}% 。`, `(${mean} − ${light}) ÷ (${heavy} − ${light}) × 100% = ${expected}%.`,
      expected, x => light * (100 - x) + heavy * x === 100 * mean);
  });

  numeric('biology', 'image-magnification', 'L1', 'image-length', 'µm', i => {
    const size = 4 + i, factor = [10, 20, 30, 40, 50][i % 5], expected = size * factor;
    return problem(`某细胞结构实际长 ${size} µm，图像线性放大 ${factor} 倍。图像上该结构长多少？`, `A cell structure is ${size} µm long. Its image is magnified by a linear factor of ${factor}. How long is the structure in the image?`,
      '真实长度乘以线性放大倍数。', 'Multiply the true length by the linear magnification.',
      `${size} × ${factor} = ${expected} µm。`, `${size} × ${factor} = ${expected} µm.`,
      expected, x => x / factor === size);
  });
  numeric('biology', 'population-density', 'L1', 'two-quadrat-count', '', i => {
    const first = 6 + i * 2, second = 8 + i, expected = first + second;
    return problem(`两个互不重叠的样方分别记录到 ${first} 株和 ${second} 株三叶草。一共记录到多少株？`, `Two non-overlapping quadrats contain ${first} and ${second} clover plants. How many plants were recorded altogether?`,
      '样方互不重叠，两个计数直接相加。', 'The plots do not overlap, so add their counts.',
      `${first} + ${second} = ${expected} 株。`, `${first} + ${second} = ${expected} plants.`,
      expected, x => x - first === second);
  });
  numeric('biology', 'image-magnification', 'L2', 'scale-bar-size', 'µm', i => {
    const bar = 3 + i, copies = i % 4 + 2, expected = bar * copies;
    return problem(`图片中的比例尺代表 ${bar} µm。一个细胞的像长相当于 ${copies} 个比例尺。细胞实际多长？`, `An image scale bar represents ${bar} µm. A cell spans ${copies} scale-bar lengths. What is the actual cell length?`,
      '把一条比例尺代表的真实长度乘以相当的条数。', 'Multiply the actual length per bar by the number of bar lengths.',
      `${bar} × ${copies} = ${expected} µm。`, `${bar} × ${copies} = ${expected} µm.`,
      expected, x => x / copies === bar);
  });
  numeric('biology', 'population-density', 'L2', 'surveyed-density', '株/m²', i => {
    const area = 7 + i, expected = 2 + i % 5, count = area * expected;
    return problem(`模拟调查的总面积为 ${area} m²，共数到 ${count} 株蒲公英。样本中每平方米有多少株？`, `A simulated survey records ${count} dandelion plants over ${area} m². How many plants per square metre were counted in the sample?`,
      '用样本计数除以调查面积。', 'Divide the count by the surveyed area.',
      `${count} ÷ ${area} = ${expected} 株/m²。`, `${count} ÷ ${area} = ${expected} plants/m².`,
      expected, x => x * area === count);
  });
  numeric('biology', 'cell-transport', 'L3', 'net-particle-count', '', i => {
    const forward = 13 + i, backward = 7 + i % 4, time = 5 + i, expected = (forward - backward) * time;
    return problem(`在简化粒子模型中，每秒从甲到乙 ${forward} 个粒子，从乙到甲 ${backward} 个。速率恒定，${time} 秒内净有多少个粒子从甲到乙？`, `In a simplified particle model, ${forward} particles per second move from A to B and ${backward} move the other way. The rates stay fixed. What is the net number moving from A to B over ${time} s?`,
      '先求两个方向的速率差。', 'Find the difference between the rates first.',
      `(${forward} − ${backward}) × ${time} = ${expected} 个粒子。`, `(${forward} − ${backward}) × ${time} = ${expected} particles.`,
      expected, x => x + backward * time === forward * time);
  });
  numeric('biology', 'human-systems', 'L3', 'volume-over-time', 'mL', i => {
    const heartbeat = 56 + 2 * i, perBeat = 58 + i, minutes = i % 3 + 2, expected = heartbeat * perBeat * minutes;
    return problem(`在人体循环教学模型中，心率为每分钟 ${heartbeat} 次，每次射出 ${perBeat} mL，条件恒定。求 ${minutes} 分钟泵出的总体积。`, `In a teaching model of circulation, the heart beats ${heartbeat} times per minute and ejects ${perBeat} mL per beat. At these fixed values, find the total pumped in ${minutes} minutes.`,
      '用每分钟的搏动次数乘以每次射血量，再乘以分钟数。', 'Multiply beats per minute by volume per beat and elapsed minutes.',
      `${heartbeat} × ${perBeat} × ${minutes} = ${expected} mL。`, `${heartbeat} × ${perBeat} × ${minutes} = ${expected} mL.`,
      expected, x => x === heartbeat * minutes * perBeat);
  });
  numeric('biology', 'plant-energy', 'L4', 'observed-oxygen-output', 'µmol', i => {
    const photo = 17 + i, resp = 5 + i % 3, time = 3 + i, expected = (photo - resp) * time;
    return problem(`一个光合与呼吸教学模型中，光合作用每分钟产氧 ${photo} µmol，呼吸每分钟耗氧 ${resp} µmol。持续 ${time} 分钟，净释放多少氧？`, `In a model of photosynthesis and respiration, photosynthesis produces ${photo} µmol of oxygen per minute while respiration consumes ${resp} µmol per minute. Rates are fixed for ${time} minutes. Find the net oxygen released.`,
      '净速率等于产氧速率减耗氧速率。', 'Subtract oxygen consumption from oxygen production to find the net rate.',
      `(${photo} − ${resp}) × ${time} = ${expected} µmol。`, `(${photo} − ${resp}) × ${time} = ${expected} µmol.`,
      expected, x => x / time + resp === photo);
  });
  numeric('biology', 'trait-frequency', 'L4', 'pooled-plant-trait', '%', i => {
    const small = 50 + 50 * i, large = 2 * small, p = 12 + 2 * i, q = p + 12;
    const n = small * p / 100, m = large * q / 100, expected = p + 8;
    return problem(`两个不重叠的观测组分别有 ${small} 株和 ${large} 株植物，其中 ${n} 株和 ${m} 株有目标性状。汇总后目标性状占多少百分比？`, `Two non-overlapping observations contain ${small} and ${large} plants, of which ${n} and ${m} show a given trait. What percentage of the pooled plants show the trait?`,
      '把有目标性状的株数相加，再除以汇总株数。', 'Add the plants showing the trait and divide by the full pooled count.',
      `(${n} + ${m}) ÷ (${small} + ${large}) × 100% = ${expected}% 。`, `(${n} + ${m}) ÷ (${small} + ${large}) × 100% = ${expected}%.`,
      expected, x => (small + large) * x === (n + m) * 100);
  });
  numeric('biology', 'natural-selection', 'L5', 'trait-among-survivors', '%', i => {
    const total = 40 + i * 20, survivors = 20 + i * 10;
    const expected = i % 2 ? 60 : 40, n = survivors * expected / 100, m = survivors - n;
    return problem(`一份教学记录起始跟踪 ${total} 个个体。到期仍在记录中的个体里，${n} 个有条纹，${m} 个无条纹。计算仍在记录中的个体中有条纹的百分比。`, `An educational record initially tracks ${total} individuals. Of those still recorded at the end, ${n} have stripes and ${m} do not. What percentage of the individuals still recorded have stripes?`,
      '题目问的是到期仍在记录的群体。', 'Identify the group that was still recorded at the end.',
      `分母为 ${n} + ${m}，${n} ÷ ${survivors} × 100% = ${expected}% 。`, `The denominator is ${n} + ${m}. Thus ${n} ÷ ${survivors} × 100% = ${expected}%.`,
      expected, x => (n + m) * x === n * 100);
  });
  numeric('biology', 'population-density', 'L5', 'additional-sample-count', '', i => {
    const initialArea = 5 + i, newArea = 7 + i, initialDensity = i % 3 + 4, combinedDensity = initialDensity + 1;
    const initialCount = initialDensity * initialArea, expected = combinedDensity * (initialArea + newArea) - initialCount;
    return problem(`首个范围 ${initialArea} m² 记录到 ${initialCount} 株植物。另一个不重叠范围为 ${newArea} m²。合并两范围后计数密度为 ${combinedDensity} 株/m²，第二个范围记录到多少株？`, `An area of ${initialArea} m² contains ${initialCount} plants. A separate non-overlapping area is ${newArea} m². The pooled count density is ${combinedDensity} plants/m². How many plants were recorded in the second area?`,
      '用合并面积和合并密度求总株数。', 'Use the combined area and pooled density to recover the total count.',
      `总数为 ${combinedDensity} × (${initialArea} + ${newArea})，减去 ${initialCount} 后为 ${expected} 株。`, `The total is ${combinedDensity} × (${initialArea} + ${newArea}). Subtract ${initialCount} to get ${expected} plants.`,
      expected, x => x + initialCount === combinedDensity * (initialArea + newArea));
  });
})();
