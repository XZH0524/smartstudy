(function () {
  'use strict';
  const { add } = globalThis.EachVeyaBank400;
  function list(level, rows) {
    rows.trim().split('\n').forEach((row, i) => {
      const [sentence, answer, a, b, c, zh, en] = row.trim().split('~');
      add({ id: ['b400', 'english', 'v', level, i+1].join('-'), subject: 'english', topic: 'vocabulary', level,
        stem: '根据语境填空。\n' + sentence + '|Choose the word or phrase that fits the context.\n' + sentence,
        choices: [answer,a,b,c], why: answer + ' 表示' + zh + '。|“' + answer + '” means ' + en + '.' });
    });
  }

  list('A1', `
    Please sit on this ___. It has four legs and a back.~chair~plate~door~bag~椅子~a piece of furniture for one person to sit on
    The ___ tells me it is three o’clock.~clock~coat~fork~window~钟表~an object that shows the time
    It is snowing. Put on your ___ before you go outside.~coat~pencil~plate~cup~外套~an item of outer clothing
    Sam has no homework left. His work is ___.~finished~hungry~cold~loud~已经完成~complete
    Please put the books on the ___. It is fixed to the wall above the desk.~shelf~shoe~floor~pocket~架子~a flat surface used for storage
    Mum’s brother is my ___.~uncle~sister~cousin~aunt~舅舅，此处指母亲的兄弟~a brother of one of your parents
    I use a ___ to cut this loaf of bread.~knife~cup~spoon~bowl~刀~a tool with a blade for cutting
    Turn on the ___. I cannot see in this room.~light~desk~lunch~floor~灯~a source of illumination
    This box has nothing in it. It is ___.~empty~full~busy~tall~空的~containing nothing
    It is half past six. We eat our evening meal, or ___, together.~dinner~breakfast~lunch~water~晚餐~the main evening meal in this context
    Leo opens the book and turns to the next ___.~page~street~chair~bottle~书页~one side of a leaf in a book
    Take the ___ to get into the locked room.~key~hat~phone~fork~开锁的钥匙~a small object that opens a matching lock
    The train is here. Let’s ___ it before the doors close.~get on~wake up~sit down~turn off~登上交通工具~board a vehicle
    In the ___, I wash my face and get ready for school.~morning~afternoon~evening~middle~早晨~the earlier part of the day after night
    These shoes cost a lot of money. They are ___.~expensive~cheap~round~quiet~昂贵~costing a lot
    We need to buy ___ for our sandwiches.~bread~clocks~stones~soap~面包~baked food commonly used to make sandwiches
    My brother is not here. Can you ___ him on the phone?~call~draw~open~drink~打电话给某人~telephone someone
    I cannot hear you well. Please speak more ___.~loudly~slowly backwards~silently~politely~大声地~at a higher volume
    You can see the river through the large ___.~window~drawer~fridge~shoe~窗户~an opening with glass that lets you see outside
  `);
  list('A2', `
    Please keep the ___. The shop may ask for it if you return the jacket.~receipt~menu~passport~timetable~购物收据~proof of a purchase
    I will ___ the blue headphones from the library and give them back on Monday.~borrow~sell~lend~deliver~借入~take something for temporary use
    We should ___ a table before we go. The restaurant fills up quickly on weekends.~book~borrow~cancel~deliver~提前预订~reserve in advance
    I am sorry I broke your mug. I did not do it on ___.~purpose~time~sale~duty~故意。on purpose 是固定短语~intentional action in the phrase on purpose
    Could you give me ___ to the train station? I do not know which way to go.~directions~ingredients~messages~reasons~路线指引~instructions for how to reach a place
    The train did not leave on time. It was ___ by forty minutes.~delayed~invited~included~closed~延误~made late
    I live very near school, so I usually go there on ___.~foot~train~bus~car~步行。固定短语 on foot~walking in the phrase on foot
    She wore a jacket to ___ herself from the cold wind.~protect~collect~invite~repair~保护，使免受影响~keep safe from something
    We can see smoke outside. Let’s ___ what happened by asking at the information desk.~find out~look after~take off~turn into~弄明白~discover the facts
    The sign says the lake is ___. Please do not enter the water.~dangerous~generous~crowded~fresh~可能造成伤害~likely to cause harm
    Be careful on the floor. It is still ___ because I just washed it.~wet~dry~safe~deep~湿的~covered with moisture
    The shop is ___ today. It sells things again tomorrow.~closed~quiet~bright~untidy~关门歇业~not open for business
    Dad ___ the broken wheel, and now the bike works again.~repaired~dropped~filled~invited~修理好了~fixed something that did not work
    Our picnic ___ was under a tree, away from the busy road.~spot~storm~trip~ticket~选定的地点~a particular place
    What is your ___ for school lunch today: soup or rice?~choice~chance~price~size~选择~the option selected
    The lift is out of ___. We have to use the stairs.~order~space~time~luck~正常工作状态。out of order 指发生故障~working condition in the phrase out of order
    Before you wash the jacket, ___ the label to see which temperatures are allowed.~check~wish~borrow~miss~检查~look at something to confirm information
    Nina ___ a missed lesson by reading the notes later.~caught up on~ran into~put on~turned into~补上落下的内容~did work or study she had missed
    The soup is too ___. Add a little water instead of more salt.~salty~sweet~bitter~weak~太咸的~containing too much salt
  `);
  list('B1', `
    The two cyclists agreed to ___ turns at the front so that each could rest behind the other.~take~make~leave~hold~轮流。take turns 是固定搭配~alternate an activity in the phrase take turns
    I had not planned to see Mira, but I ___ her at the station.~ran into~looked after~wrote down~set off~偶遇~met unexpectedly
    I set aside part of my allowance each week so I can ___ a new pair of shoes.~afford~borrow~pour~avoid~有足够的钱购买~have enough money for
    The coach asked the players to ___ the schedule so that nobody missed a session.~stick to~run out of~take after~do away with~遵守已定安排~continue following a plan
    The class vote ended in a ___. Each proposal got the same number of votes.~tie~rush~gap~loss~票数打平~a result with equal scores
    The guide warned us that a closed path was a temporary measure, rather than a ___ rule.~permanent~frequent~silent~nervous~长期维持的~lasting rather than temporary
    The new pool is easy to ___ by bus because the stop is right outside.~reach~raise~rise~reply~到达~get to a destination
    We are ___ sandwiches. There are none left for the last group.~out of~ahead of~along with~away from~已经用光~no longer in possession of any
    I added his address to my contacts so I would not ___ it again.~lose~loose~lend~reduce~弄丢信息~no longer have access to it
    The caretaker will ___ the heating at six in the morning before the building opens.~switch on~make up~run down~hold out~打开电器或装置~turn a device on
    His apology sounded ___ because he admitted exactly what he had done wrong.~sincere~random~separate~rough~真诚~honest in intention
    Do not ___ with the old machine while somebody is still using it.~interfere~consist~depend~succeed~干扰其使用~get in the way of its operation
    The college offered two short courses. I would rather ___ in the one on local history.~enrol~consist~deliver~apply a rule~报名参加~register as a participant
    The club wants to ___ more time to beginners during next term’s sessions.~devote~refuse~avoid~prevent~把时间投入某事~give time or effort to something
    Their two accounts ___: one said the gate was open, while the other said it was locked.~conflicted~combined~continued~competed~相互矛盾~could not both be true as stated
    The ___ of the school trip depends on how many students join, because the bus price is shared.~cost~shape~taste~height~费用~the amount to pay
    The instructions are printed in two languages to make the event more ___ to visitors.~accessible~accurate~identical~accidental~更容易参与或使用的~easier to use or take part in
    Before signing, please ___ that your name and date are correct.~confirm~replace~connect~relax~确认无误~check and affirm
    We had to ___ the meeting from Monday to Friday because the room was being repaired.~move~remove~invite~repeat~把日期改到另一时间~reschedule it
  `);
  list('B2', `
    The gallery must ___ with fire-safety rules before it can admit as many visitors as planned.~comply~correspond~contend~coincide~遵守规定~act according to requirements
    Her original plan was expensive, so she devised a more ___ alternative that could work with the existing staff.~feasible~erratic~fragile~lengthy~可行~possible to carry out
    The details make it possible to ___ accounts from distinct witnesses instead of relying on just one.~compare~condemn~discard~withhold~相互比较~examine similarities and differences
    The venue ___ its promise to open early by unlocking the doors at seven sharp.~honoured~imposed~evaded~withdrawn~履行承诺~kept and acted on it
    They asked the renter to ___ notice two weeks before leaving the flat.~give~make~hold~get~提前通知。give notice 是固定搭配~formally notify someone in advance
    Several reports have ___ similar concerns, although they approach the issue from different directions.~raised~risen~aroused to~grown~提出顾虑~brought concerns to attention
    The delay will ___ a problem only if the goods arrive after the market closes.~pose~pursue~perform~possess~造成问题~present or create a problem
    The supervisor gave Lina credit for spotting a ___ error: the total was wrong by nearly half.~substantial~marginal~trivial~negligible~相当大的~considerable in size
    The timetable is still ___, so the displayed times may change before next week.~provisional~permanent~retrospective~compulsory~暂定的~subject to later confirmation
    The scheme is intended to ___ students to use the library by making late opening hours more convenient.~encourage~compel~forbid~reprimand~鼓励~give a reason or incentive
    The article omitted a detail that was ___ to the argument: the two samples came from different towns.~relevant~redundant~distant~fictional~与论点有关~directly related to the argument
    We cannot ___ the effect of the new lighting while traffic levels are changing as well.~isolate~imitate~assume away~contradict~把某项影响单独区分出来~separate one effect from other influences
    The two designs look similar, but their costs vary ___. One is nearly twice the price of the other.~considerably~barely~identically~unintentionally~差异明显~by a large amount
    The ___ reason for the change was a lack of staff, though the letter mentioned only the weather.~underlying~spontaneous~visible wording~identical~潜在的根本原因~the deeper cause beneath the stated reason
    This shelf can be adjusted to ___ folders of different heights.~accommodate~accumulate~accompany~anticipate~容纳或适应~make space for
    His conclusions are ___ on a small survey, and may need revisiting with a larger sample.~based~imposed~conditioned by being at~tracked~以某事实为依据~founded on particular evidence
    The museum could not ___ the vase to its original state, but it stopped further damage.~restore~sustain~register~resolve~恢复到从前状态~bring back to an earlier condition
    Her note is ___ enough that a colleague can follow it without any explanation from her.~explicit~obscure~implicit~tentative~清楚明确地表达~stating details clearly
    The teams agreed to ___ the workload so that neither was responsible for all the night shifts.~share~spare~stare~dismiss~分摊~divide between participants
  `);
  list('C1', `
    Two reviews used different definitions of “access”, making a direct comparison ___.~misleading~immaculate~cumulative~reluctant~容易引起误解~liable to give the wrong impression
    Management promised extra shifts but did not ___ for travel costs when drawing up the budget.~allow~vouch~vie~defer~为某项费用留有余量。allow for 的常见用法~make provision for in the phrase allow for
    The records were incomplete, so the committee decided to ___ judgment until more material arrived.~reserve~restore~rehearse~reconcile~暂不下定论~withhold a verdict for the time being
    Her response was ___: she acknowledged the problem without agreeing to the proposed solution.~measured~emphatic about every detail~erratic~dismissively vague~克制且经过考虑~careful and moderate
    The deadline encourages speed but may inadvertently ___ careful checking.~discourage~prescribe~elicit~expedite~使人不愿继续做~reduce willingness to do it
    A footnote ___ the broad claim by restricting it to the years for which complete figures survive.~qualifies~guarantees~amplifies unconditionally~exemplifies only~给陈述加上限制~limits the scope of a claim
    The editor ___ the rumour by tracing it to a misread caption and publishing the original image.~debunked~diluted~deferred~endorsed~揭穿误传~showed that it was false
    A clear diagram can help ___ how the separate contributions produced the same total.~elucidate~evade~elicit instead of explain~embellish~阐明~make a relationship clear
    The dispute was ___ by a misunderstanding: each group thought the other would send the invitation.~compounded~precluded~ratified~repealed~进一步加剧~made worse by an additional factor
    A short trial can ___ a design flaw that static inspection overlooks.~expose~enforce~evade~engender agreement~揭示隐藏的问题~bring a hidden problem to light
    She had to ___ between a missing report and proof that no work had been done.~distinguish~disperse~dispute the two~sustain~区分两个概念~tell two things apart
    Analysts ___ the change to two separate causes rather than to the new rule alone.~attributed~allocated~adhered~appealed~将结果归因于~assigned the cause of a result
    Some conclusions are only ___: they fit the evidence so far, but later records might overturn them.~tentative~definitive~irreversible~self-evident~暂时性的~open to being revised as evidence changes
    The repair scheme was ___ by unusually long delivery times for replacement parts.~hampered~endorsed~vindicated~solidified~受阻~hindered or slowed
    The organisers made a deliberate ___ from previous practice by publishing both versions of each note.~departure~detour on a street~dispersion~deletion~偏离原有做法~a change from an established practice
    Her account ___ details that other writers had overlooked, giving the archive a more balanced picture.~incorporated~obscured deliberately~omitted~suppressed~纳入内容~included material as part of a whole
    The late objection does not ___ the earlier approval, since both refer to different parts of the design.~negate~necessitate~instantiate~nominate~使原判断失效~cancel or invalidate
    Staff said the trial was designed to ___ feedback, not to make a final decision.~elicit~suppress~forfeit~deduce it privately~引出反馈~draw out a response
    The extra checking was ___: it uncovered changes that several readers had missed.~worthwhile~gratuitous~counterproductive~incoherent~有价值、值得做~worth the time or effort
  `);
  list('C2', `
    The exhibition’s title was deliberately ___: “Still Moving” referred both to the photographs and to the people in them.~ambiguous~exhaustive~inadvertent~univocal~一语多义~open to more than one interpretation
    The editor cut several ___ compliments that contributed nothing to the argument.~gratuitous~germane~compelling~salient~无必要、无正当用处的~unwarranted or unnecessary
    The report’s endorsement was ___, praising the training materials but explicitly withholding support for the rollout.~qualified~unconditional~categorical~unequivocal~有限定条件的~restricted rather than unrestricted
    The proposal is persuasive at first sight but rests on a ___ analogy: the two cases share very few relevant features.~specious~cogent~sustained~pertinent~貌似有理实则站不住脚~apparently convincing yet unsound
    The witness offered a ___ distinction between being present and taking part.~salient~latent~tangential~obsolete~明显且与判断有关~especially noticeable and relevant
    What sounded like an endorsement was actually ___ criticism, conveyed through the deliberate understatement “not entirely successful”.~oblique~explicitly direct~exhaustive~inadvertently exact~间接表达的~expressed indirectly
    The historian resisted the ___ to treat one vivid witness account as a complete explanation.~temptation~compliance~reconciliation~reticence~想这样做的诱惑~an impulse to do something attractive but unwise
    The council’s answer was ___: it admitted the charge of delay while leaving responsibility conspicuously unclear.~equivocal~unequivocal~definitive~exhaustive~含糊、故意留有解释空间~deliberately open to multiple interpretations
    The reviewer objected on a narrowly ___ point: the verb “cause” exceeded what the evidence supported.~semantic~chronological~geographical~typographical~与词义有关~concerning meaning
    Her praise was ___ rather than lavish: she called the solution “workable” and said nothing more.~muted~effusive~emphatic~unrestrained~表达得克制、平淡~restrained in intensity
    The paper’s apparently neutral wording ___ an assumption that most households had internet access.~presupposed~precluded~disproved~superseded~暗中预设前提~treated as a prior assumption
    The detail was too ___ to dismiss as incidental: it recurred in all three otherwise unrelated accounts.~striking~negligible~immaterial~unremarkable~显著引人注意~conspicuous enough to notice
    The manager made a ___ apology, reading the customary words without addressing any specific complaint.~perfunctory~heartfelt~contrite~thorough~敷衍了事的~done routinely with little genuine care
    A later inspection ___ the original claim, finding almost exactly the same defect in a separate sample.~corroborated~confounded~retracted~marginalised~提供独立证据支持~confirmed through additional evidence
    The new source does not ___ the old one outright, but makes its universal claim harder to sustain.~refute~confer~recur~delineate~证明某主张错误~prove a claim false
    The link was a helpful ___, but it led to a memoir rather than to independent evidence.~pointer~verdict~guarantee~rebuttal~提示可能方向的线索~a clue about where to look
    The travel diary’s account is ___ with the official calendar: both place the ceremony a week later.~consonant~incompatible~untenable~disjunct~彼此相符~in agreement
    The charter’s wording is ___ enough to cover new forms of publishing without mentioning any specific technology.~elastic~inflexible~prescriptive in every detail~obsolete~解释有弹性~able to accommodate different applications
    The apparent consensus was ___: once the exceptions were made explicit, the participants no longer agreed.~illusory~durable~unqualified~verifiable as stated~表面存在、实际没有~appearing real despite being misleading
  `);
})();
