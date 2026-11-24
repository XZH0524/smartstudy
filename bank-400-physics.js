(function () {
  'use strict';
  const { topicGuide, modelFor } = globalThis.EachVeyaBank400;
  const guide = (...fields) => topicGuide('physics', ...fields);
  const model = modelFor('physics');

  guide('forces-motion', '力与运动|Forces and motion', '合力、质量与加速度|Net force, mass and acceleration',
    'https://openstax.org/books/physics/pages/4-3-newtons-second-law-of-motion',
    '两个方向相反的力应怎样合成？|How do oppositely directed forces combine?',
    '先选定正方向，在同一物体上相加。|Choose a positive direction and add forces acting on one object.',
    '质量不变时，合力决定加速度。合力为零时，速度保持不变。|At constant mass, net force determines acceleration. With zero net force, velocity is constant.',
    '向右 8 N、向左 3 N，合力为向右 5 N。|The net of 8 N right and 3 N left is 5 N right.');
  guide('wave-behaviour', '波与声|Waves and sound', '波速、频率和回声|Wave speed, frequency and echoes',
    'https://openstax.org/books/physics/pages/13-2-wave-properties-speed-amplitude-frequency-and-period',
    '频率变为两倍、波速不变时，波长怎样变化？|What happens to wavelength if frequency doubles at the same wave speed?',
    '把每秒振动次数和相邻波峰距离分开。|Distinguish cycles per second from the distance between crests.',
    '波速等于波长乘以频率。|Wave speed is wavelength multiplied by frequency.',
    '波长 2 m、频率 3 Hz 的波以 6 m/s 传播。|A wavelength of 2 m at 3 Hz gives a speed of 6 m/s.');
  guide('thermal-models', '热学|Thermal physics', '温度变化与能量传递|Temperature change and energy transfer',
    'https://openstax.org/books/physics/pages/11-2-heat-specific-heat-and-heat-transfer',
    '同样的能量使哪种物体温度升高较少？|Which object changes temperature less for the same energy transfer?',
    '看热容，也留意模型是否忽略散热。|Consider heat capacity and check whether heat losses are neglected.',
    '没有相变时，传给物体的热量等于热容乘以温度变化。|Without a change of state, energy transferred as heat equals heat capacity times temperature change.',
    '热容 20 J/K 的物体吸收 60 J，温度升高 3 K。|An object with heat capacity 20 J/K warms by 3 K when it absorbs 60 J.');
  guide('fluid-models', '流体|Fluids', '压强、深度和浮力|Pressure, depth and buoyancy',
    'https://openstax.org/books/college-physics-2e/pages/11-3-pressure',
    '力相同而受力面积变小时，压强如何变化？|What happens to pressure if the same force acts on a smaller area?',
    '力用牛顿，面积用平方米。|Use newtons for force and square metres for area.',
    '压强是垂直作用力除以受力面积。|Pressure is the perpendicular force divided by the area.',
    '12 N 均匀作用在 3 m² 上，压强为 4 Pa。|A force of 12 N spread over 3 m² gives 4 Pa.');

  model('average-speed','elapsed','路程|distance~时间|time~平均速率（单段）|average speed for one leg','m~s~m/s',
    '平均速率 = 路程 ÷ 时间。|Average speed equals distance divided by time.', (d,t) => d/t, [[24,6],[36,9],[45,5],[56,8]],
    '速率向我们说明什么？|What information does speed give?~运动快慢|How fast something moves~运动朝向|Which direction it heads~加速持续多久|How long it accelerates~物体受到的合力|The net force~速率描述路程随时间变化的快慢。|Speed describes distance covered per unit time.',
    '甲乙两段旅程的平均速率相等，可确定什么？|Two trips have equal average speeds. What follows?~各自路程与时间的比值相等|Each distance-to-time ratio is the same~全程没有停车|Neither vehicle stopped~出发地必定相同|They started in the same place~每一秒的速率都一样|Their speeds matched every second~总量的比值相同，细节不必相同。|The ratio of totals can agree while the motion differs.');
  model('average-speed','acceleration','速度改变量|change in velocity~时间|time interval~平均加速度|average acceleration','m/s~s~m/s²',
    '平均加速度 = 速度改变量 ÷ 时间。|Average acceleration equals the change in velocity divided by elapsed time.', (v,t) => v/t, [[12,4],[24,6],[30,5],[42,7]],
    '加速度描述下列哪个量的变化快慢？|What rate of change does acceleration describe?~速度|Velocity~质量|Mass~时间|Time~物体的温度|Temperature~加速度衡量速度每单位时间的改变量。|Acceleration measures velocity change per time.',
    '两辆车同向行驶，平均加速度相同。要比较末速度还需要什么？|Two cars moving in the same direction have the same average acceleration. What else is needed to compare their final velocities?~初速度和加速时间|Initial velocities and time intervals~车漆颜色|Paint colours~轮胎磨损的位置|The location of tyre wear~只有两车的质量|Only the masses~末速度 = 初速度 + 平均加速度 × 时间。|Final velocity equals initial velocity plus average acceleration times the interval.');
  model('average-speed','steady-distance','恒定速率|constant speed~时间|travel time~匀速行进路程|distance at constant speed','m/s~s~m',
    '匀速路程 = 速率 × 时间。|At constant speed, distance equals speed times time.', (v,t) => v*t, [[3,8],[4,9],[6,7],[8,5]],
    '速率固定在 2 m/s 时，每过 1 s 路程增加多少？|At a steady 2 m/s, how much distance is added each second?~2 m~0.5 m~1 m~4 m~m/s 表示每秒行进的米数。|Metres per second tells how many metres are covered in one second.',
    '同样在 30 s 内走了 60 m，哪个观察能排除匀速模型？|Two accounts each cover 60 m in 30 s. Which observation rules out steady motion for one of them?~前 10 s 走 10 m，后 10 s 走 30 m|It covers 10 m in the first 10 s and 30 m in the last 10 s~总路程恰好 60 m|The total is exactly 60 m~全班计时 30 s|The class times 30 s~用直线跑道|A straight track is used~匀速时等长时间应走等长路程。|At constant speed, equal time intervals cover equal distances.');
  model('average-speed','closing','甲向乙的速率|A’s speed toward B~乙向甲的速率|B’s speed toward A~两者相向接近速率|closing speed','m/s~m/s~m/s',
    '沿同一直线相向运动，接近速率 = 两速率之和。|For objects approaching along a line, closing speed is the sum of the speeds.', (a,b) => a+b, [[3,2],[5,7],[8,9],[11,6]],
    '两个物体相向运动时，接近速率描述什么？|What does closing speed describe for objects moving toward each other?~间距减小的快慢|How fast the gap shrinks~任意一方的加速度|Either object’s acceleration~物体的总质量|Their total mass~两者的平均温度|Their mean temperature~接近速率度量间距的减少量除以时间。|Closing speed measures the reduction in separation per time.',
    '两名选手同向奔跑，后者更快。还应把两人速率相加以求缩短间距的快慢吗？|Two runners move in the same direction and the trailing runner is faster. Should their speeds still be added to find the closing speed?~不，应以快者速率减慢者速率|No. Subtract the slower speed from the faster one~是，因为两人都在运动|Yes, both are moving~是，因为速率一定为正|Yes, speeds are positive~不，接近速率一定为零|No. Closing speed must be zero~同向运动要计算带方向的相对速度。|Relative motion depends on the directions of both velocities.');

  model('ohmic-current','potential-drop','电流|current~电阻|resistance~欧姆电阻两端电压|potential difference across an ohmic resistor','A~Ω~V',
    '欧姆模型中 U = IR。|In the ohmic model, V = IR.', (i,r) => i*r, [[2,3],[3,4],[4,5],[5,6]],
    '固定电阻中，哪项同时影响它两端电压？|Which variable affects voltage across a fixed resistor?~经过它的电流|Current through it~电路图的比例尺|The diagram scale~电池标签的颜色|The colour of the battery label~电线在图中的方向|The drawn direction of the wire~U = IR，在 R 固定时 U 随 I 变化。|V = IR, so V varies with I when R is fixed.',
    '相同电压下两个电阻的电流不同，理想模型支持什么解释？|Two ohmic resistors at the same voltage carry different currents. Which explanation fits the model?~电阻不同|Their resistances differ~电压必须不同|Their voltages must differ~电流大者一定更长|The larger current must mean a longer resistor~串联的每处电流不同|Current differs along every series path~R = U/I，固定 U 时不同 I 对应不同 R。|At fixed V, unequal currents imply unequal V/I.');
  model('ohmic-current','charge','稳恒电流|steady current~通过时间|time interval~流过截面的电荷量|charge through a cross section','A~s~C',
    '电荷量 Q = I × t。|Charge Q equals I times t.', (i,t) => i*t, [[1,12],[2,9],[3,7],[5,4]],
    '1 A 表示以下哪一个量率？|What rate does 1 A represent?~每秒 1 C|1 C per second~每秒 1 J|1 J per second~每库仑 1 V|1 V per coulomb~每秒 1 Ω|1 Ω per second~电流是单位时间通过截面的电荷量。|Current is charge passing a cross section per unit time.',
    '两个不同时间段流过相同电荷量。什么量不足以判断平均电流相同？|Equal amounts of charge pass in two intervals. What alone is insufficient to conclude equal average current?~这个共同的电荷量|The common charge alone~共同电荷量加上相同时间|The charge together with equal times~分别测量电荷量和时间|Charge and duration measured for each case~两者的电荷量与时间之比相等|Equal charge-to-time ratios~平均电流为 Q/t，还需要各段时间。|Average current is Q/t, so duration also matters.');
  model('ohmic-current','series','第一只电阻|first resistance~第二只电阻|second resistance~纯串联总电阻|equivalent series resistance','Ω~Ω~Ω',
    '纯串联中 R 总 = R₁ + R₂。|In a simple series connection, equivalent resistance is R₁ + R₂.', (a,b) => a+b, [[4,6],[6,7],[9,11],[12,10]],
    '理想串联支路中，两只电阻的什么量相同？|Which quantity is the same for two resistors in one ideal series path?~电流|Current~两端电压必相同|Voltage across each must match~电阻值|Resistance~消耗功率必相同|Power dissipated must match~只有一条电流路径。|There is only one current path.',
    '把一只正电阻接入原本纯串联的模型，电源电压不变时总电流怎样？|Add a positive resistance in series and hold supply voltage fixed. What happens to total current?~变小|It decreases~变大|It increases~恒为零|It must become zero~恒定不变|It must stay the same~总电阻增大，固定电压下 I = U/R 变小。|Larger total resistance gives smaller I = V/R.');
  model('ohmic-current','parallel','第一支路电阻|first branch resistance~第二支路电阻|second branch resistance~两支路并联等效电阻|equivalent resistance of two parallel branches','Ω~Ω~Ω',
    '两正电阻并联时 R 总 = R₁R₂ ÷ (R₁ + R₂)。|For two positive resistances in parallel, equivalent resistance is R₁R₂/(R₁ + R₂).', (a,b) => a*b/(a+b), [[6,3],[12,4],[10,10],[12,6]],
    '两只理想电阻直接并联在同一对节点之间，哪个量相等？|What is equal for ideal resistors connected across the same two nodes?~两端电压|Voltage across each~阻值|Resistance~支路电流一定相等|Branch currents necessarily match~支路功率一定相等|Branch powers necessarily match~共享同一对节点便共享同一电势差。|Both branches share the same potential difference.',
    '两正电阻并联后，仪器给出比任一支路都大的等效电阻。这说明什么？|A meter reports an equivalent resistance larger than both branches for two positive resistors in parallel. What follows?~读数与理想并联模型不相容，应检查连接或测量|The reading conflicts with the ideal model. Check the setup or measurement.~这是并联必定出现的效应|A parallel connection always has this effect~这证明支路互换了位置|It proves the branches swapped places~读数说明供电只经过一半电阻|It means supply current crossed half a resistor~两正阻并联的等效阻值小于任何一个分阻。|Positive parallel resistances yield an equivalent smaller than either branch.');

  model('energy-efficiency','mechanical-work','同向恒力|constant force along the motion~位移|displacement~该力所做的功|work done by the force','N~m~J',
    '力恒定且与位移同向时，W = Fd。|For a constant force along the displacement, W = Fd.', (f,d) => f*d, [[6,3],[9,4],[12,5],[15,7]],
    '一个力没有导致物体发生任何位移。在该时间内，这个力对物体做了多少机械功？|An object undergoes no displacement. How much mechanical work does a force do on it during this interval?~0 J~等于力的数值|The numerical value of the force~1 J~必须知道物体质量|The mass is required~没有位移时机械功为零。|Mechanical work is zero without displacement.',
    '力的大小与位移大小相同的两次过程中，功未必相同。还需比较什么？|The magnitudes of force and displacement agree in two trials, but work may differ. What else matters?~力与位移的夹角|The angle between force and displacement~尺子的颜色|The ruler colour~仅仅是物体的密度|Only the object’s density~操作者的身高|The operator’s height~只将力沿位移方向的分量乘位移。|Only the component of force along the displacement contributes.');
  model('energy-efficiency','kinetic','质量|mass~速率|speed~平动动能|translational kinetic energy','kg~m/s~J',
    '经典平动动能 E = mv²/2。|Classical translational kinetic energy is mv²/2.', (m,v) => m*v*v/2, [[2,3],[3,4],[4,5],[6,7]],
    '在参考系中静止的物体，其平动动能如何？|An object is at rest in the reference frame. What is its translational kinetic energy?~为零|Zero~等于它的重力|Equal to its weight~一定超过 1 J|Always above 1 J~等于它的质量|Equal to its mass~速率为零，因此 mv²/2 为零。|Its speed and therefore mv²/2 are zero.',
    '等质量模型乙的速率是甲的两倍，为什么不能说它的动能也是两倍？|Model B moves at twice the speed of equal-mass A. Why isn’t its kinetic energy merely doubled?~能量正比于速率的平方|Energy is proportional to speed squared~能量只取决于方向|Energy depends only on direction~速度越大质量必减半|Mass always halves as speed rises~能量和速率没有关系|Energy and speed are unrelated~速率倍增后平方项变成四倍。|Doubling speed multiplies the squared term by four.');
  model('energy-efficiency','lift','重力大小|weight~竖直升高量|vertical rise~重力势能增加量|increase in gravitational potential energy','N~m~J',
    '在近地恒定重力模型中，势能增量 = 重力大小 × 升高量。|For constant near-Earth gravity, the gain is weight times vertical rise.', (w,h) => w*h, [[20,2],[30,3],[45,4],[60,5]],
    '升到同样高度，理想重力势能变化取决于水平绕路吗？|Does a horizontal detour change the gravitational potential energy gain for the same vertical rise?~不取决于水平绕路|It does not depend on the horizontal detour~必定减少一半|It must halve~必定增大|It must increase~必定变成负值|It must become negative~在恒定重力下重力势能增量取决于高度变化。|With constant gravity, the change depends on the vertical rise.',
    '用坡道和直接竖直升高同一物体到同一终点，实测消耗能量不同。哪项合理？|A ramp and a vertical lift bring the same object to the same final height but consume different energy. Which is reasonable?~势能增量相同，损耗可能不同|The potential gain is the same, but losses can differ~坡道一定改变重力常数|The ramp must change gravity~两终点势能增量必不同|The potential gains must differ~能量守恒一定失效|Energy conservation must fail~损耗可随方式变化，势能增量由高度和重量决定。|Losses may differ even though the rise and weight fix the potential gain.');
  model('energy-efficiency','stages','第一阶段效率|first-stage efficiency~第二阶段效率|second-stage efficiency~串接总效率|overall efficiency across two stages','%~%~%',
    '第二级只接收第一级的有用输出时，总效率百分数 = 两级百分数相乘后除以 100。|If only useful output enters stage two, multiply the two percentages and divide by 100.', (a,b) => a*b/100, [[80,50],[90,60],[75,80],[60,90]],
    '两级设备串接时，第二级的输入能量来自哪里？|In this two-stage model, where does the second-stage input come from?~第一级的有用输出|The first stage’s useful output~第一级所有损耗|All first-stage losses~第二级自身凭空产生|Energy created by the second stage~与第一级输入总是相同|It always equals the original input~模型规定只把第一级有用部分送到第二级。|Only first-stage useful output is passed forward.',
    '两级效率分别 80% 与 50%，把总效率写成 130% 的根本错误是什么？|Two stages are 80% and 50% efficient. What is wrong with adding them to get 130%?~两个百分数的参照输入不同，应依次取比例|Each refers to a different input, so the fractions act successively~只因为百分数永远不能相加|Percentages can never be added~实际应取较大者|The larger value alone should apply~前一级应完全忽略|The first stage must be ignored~第二级只使用第一级输出，正确结果为 40%。|Stage two acts on the first output only, giving 40% overall.');

  model('forces-motion','net','向右力|rightward force~向左力的大小|magnitude of leftward force~向右为正的合力|net force with right positive','N~N~N',
    '取向右为正，合力 = 向右力 − 向左力的大小。|Taking right as positive, subtract the magnitude of the leftward force from the rightward force.', (r,l) => r-l, [[8,3],[11,7],[5,9],[17,12]],
    '同一物体受大小相等且方向相反的两个力，合力为多少？|What is the net force on one body acted on by two equal and opposite forces?~0 N~等于其中一个力|One of the two forces~每个力的两倍|Twice either force~取决于物体颜色|It depends on the body’s colour~方向相反，沿轴相加时一正一负。|The opposite signs cancel.',
    '发现一个小车速度不变。哪些结论在惯性参考系成立？|A cart keeps a constant velocity. What follows in an inertial frame?~它的合力为零|Its net force is zero~它一定未受到任何力|It must be free of all forces~它的重力为零|It has no weight~初速度一定为零|Its initial speed was zero~零加速度只要求合力为零。|Zero acceleration requires zero net force, even when individual forces exist.');
  model('forces-motion','second-law','合力大小|net force magnitude~质量|mass~牛顿第二定律的加速度大小|acceleration magnitude from Newton’s second law','N~kg~m/s²',
    '合力大小 = 质量 × 加速度大小。|Net force magnitude is mass times acceleration magnitude.', (f,m) => f/m, [[12,3],[20,4],[30,5],[42,7]],
    '同样合力作用于较重的物体，哪个变化正确？|The same net force acts on a more massive object. What happens?~加速度减小|Acceleration is smaller~加速度增加|Acceleration is larger~加速度必为零|Acceleration is zero~加速度与质量无关|Acceleration is independent of mass~由 a = F/m 可知固定力下质量越大加速度越小。|At fixed F, a = F/m decreases with mass.',
    '两个测试的加速度不同。要把差异归因于质量，最重要的比较条件是什么？|Two tests give different accelerations. What condition matters most if attributing the difference to mass?~两次保持相同合力|Keep net force the same in both tests~两次使用相同颜色物体|Use the same colour~两次经过同一时刻|Begin at the same clock time~任意更换力和质量|Vary force and mass arbitrarily~a 同时取决于合力和质量，需要控制合力。|Acceleration depends on both factors. Control net force to isolate mass.');
  model('forces-motion','weight','物体质量|mass~重力场强|gravitational field strength~物体重量|weight at that location','kg~N/kg~N',
    '重量 W = mg。|Weight is mass times gravitational field strength.', (m,g) => m*g, [[2,10],[3,8],[4,6],[5,4]],
    '同一个物体被移到重力场强较小的地方，哪一量保持不变？|An object is moved to a field with smaller gravitational strength. Which quantity remains the same?~它的质量|Its mass~它的重量|Its weight~单位质量承受的引力|Force per unit mass~当地的重力场强|Local field strength~质量描述物体本身，重量随 g 变。|Mass describes the object; weight changes with g.',
    '某人的重量读数下降，但携带物品未变。可以仅凭重量变化判断质量变小吗？|A person’s weight reading falls with no change in what they carry. Can the reading alone establish a loss of mass?~不能，重力场强变化也可改变重量|No. Field strength can change weight as well.~可以，重量和质量定义相同|Yes. Weight and mass have the same definition.~可以，G 会自动保持重量不变|Yes. Gravity automatically fixes weight.~不能，因为质量总是零|No. Mass is always zero.~W = mg，要知道 g 才能从重量确定质量。|Using W = mg to infer mass requires g.');
  model('forces-motion','sliding','动摩擦因数|kinetic friction coefficient~法向力|normal force~滑动摩擦力大小|kinetic friction force magnitude','~N~N',
    '在给定滑动摩擦模型中，f = μN。|In the stated sliding friction model, f = μN.', (mu,n) => mu*n, [[0.2,10],[0.3,20],[0.4,30],[0.5,40]],
    '物块已经在水平面滑动，摩擦力沿面朝向哪里？|A block is sliding over a surface. In which direction along the surface does friction act?~与相对滑动相反|Opposite the relative sliding~与相对滑动相同|Along the relative sliding~垂直向上|Straight up~垂直向下|Straight down~滑动摩擦阻碍接触面间的相对运动。|Kinetic friction opposes relative sliding along the surface.',
    '若仍在滑动，只将法向力增加一倍，何时可预测摩擦力也加倍？|When can doubling the normal force predict doubled friction while sliding continues?~动摩擦因数保持相同|The kinetic friction coefficient stays the same~必须让摩擦因数也加倍|The coefficient must also double~无论接触材料如何都可|For all contact materials regardless of change~物体速度必定变为两倍时|Only if speed must double~在 f = μN 模型中，保持 μ 不变才得到正比。|The proportional prediction holds when μ stays fixed.');

  model('wave-behaviour','speed','波长|wavelength~频率|frequency~由波长频率求得的波速|wave speed from wavelength and frequency','m~Hz~m/s',
    'v = λf。|Wave speed is wavelength times frequency.', (l,f) => l*f, [[2,4],[3,6],[5,8],[7,9]],
    '波长对应一列波上哪一段距离？|Which distance represents a wavelength in a repeating wave?~相邻两个同相位的波峰之间|Between adjacent crests in phase~一个波谷到相邻波峰|From a trough to its neighbouring crest~介质质点离平衡点的最大距离|The particle’s maximum displacement~波源到观察者的总路程|The entire journey from source to observer~同相位相邻波峰相隔一个波长。|Consecutive crests are separated by one wavelength.',
    '同一介质、波速固定时，换频率更高的波源会怎样？|What happens with a higher-frequency source in a medium with fixed wave speed?~波长变短|Wavelength shortens~波长加长|Wavelength lengthens~波长不变且波速必增加|Wavelength stays fixed and speed must rise~波停止传播|The wave stops propagating~λ = v/f。固定 v 时 f 与 λ 反比。|At fixed v, wavelength v/f decreases as f rises.');
  model('wave-behaviour','count','观测到的完整周期数|number of complete cycles~观测时间|observation time~计数得到的频率|frequency measured by counting','~s~Hz',
    '频率 = 完整周期数 ÷ 观测时间。|Frequency equals the number of complete cycles divided by observation time.', (n,t) => n/t, [[12,3],[20,4],[36,6],[56,7]],
    '9 Hz 的周期信号在 1 s 有多少完整周期？|How many complete cycles of a 9 Hz periodic signal occur in 1 s?~9~3~18~90~赫兹表示每秒的周期次数。|Hertz counts cycles per second.',
    '两个记录的周期数相同，能断定两个信号的频率相同吗？|Two records contain equal cycle counts. Can their frequencies be inferred to match?~只有观测时间也相同才可由此断定|Only if the observation durations are also equal~必然相同|Yes, always~必然不同|They must differ~还需要波源温度相同|Source temperature must match~频率还取决于观测时间。|Frequency also depends on observation duration.');
  model('wave-behaviour','period','总计时|total time measured~完整周期数|complete cycles~单次周期|period of one cycle','s~~s',
    '稳定信号的周期 = 总时间 ÷ 完整周期数。|For a steady signal, period is total time divided by the cycle count.', (t,n) => t/n, [[8,4],[12,3],[15,5],[24,6]],
    '把频率和周期配对，哪一项正确？|Which statement correctly relates period to frequency?~频率是周期的倒数|Frequency is the reciprocal of period~频率等于周期加一|Frequency is period plus one~频率总等于周期|Frequency always equals period~二者与计时无关|Neither is related to time~每秒周期次数和每个周期秒数互为倒数。|Cycles per second and seconds per cycle are reciprocals.',
    '同一个稳定信号，为什么可以计时多个周期再除以周期数？|Why time multiple cycles of one steady signal and divide by the count?~固定的启停计时误差分摊到多个周期|A fixed timing error is spread across more cycles~可以提高波本身的频率|It raises the actual frequency~会改变信号的周期|It changes the true period~保证所有误差为零|It removes every possible error~这样可减小一次启停误差相对单周期的影响。|It can reduce the per-cycle effect of start and stop timing error.');
  model('wave-behaviour','echo','声速|speed of sound~回声往返时间|echo round-trip time~到反射面的单程距离|one-way distance to reflector','m/s~s~m',
    '声波走来回两段，单程距离 = 声速 × 往返时间 ÷ 2。|The echo travels out and back, so one-way distance is speed times round-trip time divided by two.', (v,t) => v*t/2, [[340,0.2],[330,0.4],[350,0.6],[320,0.8]],
    '计时从发出声音直到听到回声，计入了几段路程？|From emission to return, how many legs does an echo travel?~两段|Two~一段|One~零段|Zero~一定有四段|Always four~声音去到反射面再返回。|Sound travels to the reflector and back.',
    '同一回声时间，若当地声速更高，物体需在什么位置才符合模型？|For the same echo time at a higher sound speed, where must the reflector be under this model?~更远|Farther away~更近|Closer~不变|At the same distance~一定在声源后方|Always behind the source~单程距离与声速成正比。|At fixed round-trip time, the one-way distance increases with sound speed.');

  model('thermal-models','heat-capacity','物体热容|heat capacity~升高的温度|temperature increase~物体吸收的热量|energy absorbed as heat','J/K~K~J',
    '无相变且热容恒定时 Q = CΔT。|At constant heat capacity without phase change, Q = CΔT.', (c,t) => c*t, [[15,3],[20,4],[25,5],[30,6]],
    '热容较大的物体，每升高 1 K 所需的热量如何？|How much energy per kelvin does a larger heat capacity require?~较多|More~较少|Less~总是为零|Always zero~总是不变|Always unchanged~热容的意义就是升温一单位所需的能量。|Heat capacity is energy required per unit temperature increase.',
    '加热过程中看到温度长时间不变。此时为何不宜用 Q = CΔT 得出 Q = 0？|Temperature stays constant while energy continues entering the material. Why may Q = CΔT give a misleading zero?~可能发生相变|A change of state may be occurring~热传递只能降低温度|Heat can only lower temperature~所有材料热容必为零|All materials must have zero heat capacity~温度恒定时功必为负|Constant temperature means negative work~相变可吸收能量而不增加温度。|A phase change can absorb energy without a temperature rise.');
  model('thermal-models','mean-mix','样品甲温度|temperature of sample A~样品乙温度|temperature of sample B~等热容无损混合的平衡温度|equilibrium temperature for equal heat capacities without loss','°C~°C~°C',
    '热容相等且无热损的数据模型中，平衡温度为两初温的平均数。|For equal heat capacities with no heat losses, the equilibrium temperature is the mean of the starting values.', (a,b) => (a+b)/2, [[22,42],[26,48],[31,55],[34,62]],
    '两个温度不同的样品接触时，净热传递起初朝哪个方向？|When objects at different temperatures touch, which way does net heat initially transfer?~从较热到较冷|From the warmer object to the cooler one~从较冷到较热|From cooler to warmer~由质量最小者流出|Always out of the smaller mass~无论怎样都不会传热|There is never heat transfer~自发传热方向是从高温到低温。|Net spontaneous heat transfer is from higher to lower temperature.',
    '样品甲热容远大于乙，且只有这两样品交换热量。平衡温度应更接近哪个初温？|Sample A has much larger heat capacity than B, with exchange limited to the two. Which starting temperature is nearer the final one?~甲的初温|A’s initial temperature~乙的初温|B’s initial temperature~必定恰在中点|Exactly the midpoint in every case~必定低于两者|Below both starting temperatures~热容较大的一方温度变化较小。|The sample with greater heat capacity changes temperature less.');
  model('thermal-models','transfer-power','传给模型的热量|energy transferred as heat~传递时间|elapsed time~平均热传递功率|average heat transfer rate','J~s~W',
    '平均功率 = 传递能量 ÷ 时间。|Average power equals the energy transferred divided by time.', (e,t) => e/t, [[48,6],[72,8],[105,7],[144,9]],
    '1 W 的能量传递率是什么意思？|What does an energy transfer rate of 1 W mean?~每秒 1 J|1 J per second~每焦耳 1 s²|1 s² per joule~每秒 1 K|1 K per second~每米 1 J|1 J per metre~瓦特等于焦耳每秒。|A watt is a joule per second.',
    '两个过程的平均功率相同。哪个现象仍有可能？|Two processes have equal average power. Which is still possible?~一个过程早期传热快，后来变慢|One process transfers heat faster early and slower later~所有时刻必然同速|Their rates necessarily match at every instant~过程时间一定相同|They must have equal durations~传递总量一定为零|Both transfer zero energy~平均功率不规定过程内每一时刻的速率。|An average need not describe every moment.');
  model('thermal-models','thermal-expansion','起始长度|starting length~每米长度的增量|increase per metre of original length~整根材料的伸长量|extension of the whole piece','m~mm/m~mm',
    '均匀热膨胀模型中，伸长量 = 起始长度 × 每米的增量。|In the uniform expansion model, extension is starting length times the increase per metre.', (l,d) => l*d, [[2,0.4],[3,0.6],[4,0.5],[5,0.8]],
    '加热前后说一根棒伸长 2 mm，2 mm 表示什么？|A rod extends 2 mm after warming. What does 2 mm describe?~末长度减去初长度|Final length minus initial length~棒的末长度本身|The final length itself~棒的质量变化|Its change in mass~温度变化|The temperature change~伸长量是长度差。|Extension is a difference in length.',
    '同材料两段棒的伸长量不同，能仅据此断言温升不同吗？|Two pieces of the same material extend by different amounts. Does that alone prove different temperature rises?~不能，还需比较起始长度|No. The original lengths also matter.~能，起始长度一定无关|Yes. Starting length cannot matter.~能，较短的棒永远伸长更多|Yes. A shorter piece always extends more.~不能，因为材料不会热胀|No. Materials do not expand when heated.~给定温升和材料时，起始长度仍影响总伸长。|At the same temperature change, total extension still depends on initial length.');

  model('fluid-models','contact','均匀垂直作用力|uniform perpendicular force~承受该力的面积|area the force acts on~平均接触压强|average contact pressure','N~m²~Pa',
    '平均压强 p = F/A。|Average pressure is force divided by area.', (f,a) => f/a, [[24,4],[35,5],[48,6],[63,7]],
    '平均压强的定义是哪一个？|Which expression defines average pressure?~垂直力除以面积|Perpendicular force divided by area~面积除以垂直力|Area divided by perpendicular force~力乘面积|Force times area~力除以时间|Force divided by time~同一作用力分摊到每单位面积，就是压强。|Pressure gives the perpendicular force per unit area.',
    '两个表面平均压强相同，其中一个面积更大。在同一模型下它的总作用力如何？|Two surfaces have the same average pressure. One area is larger. How do their total forces compare?~较大面积的总力更大|Total force is larger on the larger area~总力必相等|Forces must be equal~较大面积总力更小|Force is smaller on the larger area~总力一定都为零|Both forces must be zero~总力等于平均压强乘面积。|Total force is average pressure times area.');
  model('fluid-models','depth','距液面深度|depth below the surface~每米深度的压强增量|pressure increase per metre~相对液面的液体压强增量|pressure increase relative to the surface','m~Pa/m~Pa',
    '均匀静止液体的压强增量 = 深度 × 压强梯度。|In a uniform fluid at rest, pressure increase is depth times the pressure gradient.', (h,g) => h*g, [[2,5000],[3,6000],[4,7000],[5,8000]],
    '在均匀静止液体内，深度应从哪里量？|From where is depth measured in a uniform liquid at rest?~液面向下|Down from the surface~容器底向上|Up from the container bottom~容器侧面水平|Horizontally from the wall~容器把手起算|From a vessel handle~深度是测点在液面下的竖直距离。|Depth is the vertical distance below the surface.',
    '两个不同形状的容器装同种静止液体，液面承受相同压强。同深度压强如何？|Two differently shaped vessels hold the same still liquid with equal surface pressure. How do pressures at equal depths compare?~相等|Equal~宽容器总是更大|Always greater in the wider vessel~窄容器总是更大|Always greater in the narrower vessel~只能由容器总容量决定|Determined only by vessel capacity~静水压随深度和流体密度确定，与容器外形无关。|Hydrostatic pressure depends on depth and density, not on vessel shape.');
  model('fluid-models','buoyancy','流体密度|fluid density~排开体积|displaced volume~取 g = 10 N/kg 时的浮力大小|buoyant force with g = 10 N/kg','kg/m³~m³~N',
    '取 g = 10 N/kg，浮力 = 流体密度 × 排开体积 × g。|Take g = 10 N/kg. Buoyancy equals fluid density times displaced volume times g.', (r,v) => 10*r*v, [[800,0.02],[900,0.03],[1000,0.04],[1100,0.05]],
    '阿基米德原理中的浮力等于什么？|According to Archimedes’ principle, buoyancy equals what?~排开的流体重量|Weight of displaced fluid~物体质量|Mass of the object~容器总重量|Total vessel weight~液面面积|Area of the liquid surface~浮力与排开流体的重量相同。|Buoyant force equals the weight of displaced fluid.',
    '同一物体完全浸没在两种液体中，且排开体积相同。为何浮力仍可能不同？|The same object is fully immersed in two liquids and displaces equal volumes. Why can buoyancy differ?~液体密度可能不同|The liquids can have different densities~物体体积必变|The object’s volume must change~重力方向必反转|Gravity must reverse direction~压强必都为零|Both pressures must be zero~相同体积的不同密度流体重量可不同。|Equal displaced volumes can have different weights.');
  model('fluid-models','hydraulic','液体传递的压强增量|transmitted pressure increase~输出活塞面积|output piston area~输出活塞的力增量|increase in output piston force','Pa~m²~N',
    '理想液压模型中，输出力增量 = 压强增量 × 输出面积。|In the ideal hydraulic model, the output force increase equals pressure increase times output area.', (p,a) => p*a, [[20,2],[30,3],[40,4],[50,5]],
    '理想封闭静止液体传递什么增量？|Which increase is transmitted through a confined fluid in the ideal static model?~压强增量|Pressure increase~各处相同的力增量|The same force increase at every area~相同的容器面积|Equal vessel area~物体质量的增量|An increase in object mass~相同压强作用于不同面积可产生不同力。|Transmitted pressure is shared, while piston forces depend on area.',
    '想仅靠提高输出活塞面积让理想装置输出额外能量，为什么不可行？|Why can a larger output piston alone not create extra output energy in an ideal machine?~力增大时输出位移相应变小|A larger force comes with a smaller output displacement~压强传递必为零|No pressure can be transmitted~由面积直接创造能量|Area directly creates energy~输出力与面积无关|Output force is independent of area~不可压缩流体约束推过的体积，理想的力与位移互相补偿。|Displaced volume constrains motion, so ideal force gain trades for displacement.');
})();
