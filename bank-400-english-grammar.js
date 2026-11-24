(function () {
  'use strict';
  const { add } = globalThis.EachVeyaBank400;
  function group(level, slug, guidance, rows) {
    const [zh, en] = guidance.split('|');
    for (const [i, row] of rows.entries()) {
      const [sentence, answer, ...wrong] = row.split('~');
      add({ id: ['b400', 'english', 'g', slug, i+1].join('-'), subject: 'english', topic: 'grammar', level,
        stem: '选择最合适的形式。\n' + sentence + '|Choose the form that best completes the sentence.\n' + sentence,
        choices: [answer, ...wrong], why: zh + ' 填 ' + answer + '。|' + en + ' Choose “' + answer + '”.' });
    }
  }

  group('A1','be','现在时的 be 随主语变化：I am，单数第三人称 is，we、you、they 用 are。|Present-tense be agrees with the subject: I am, one third-person subject is, and we, you and they are.',[
    'I ___ in the school library now.~am~are~be~is',
    'Today she ___ at the front desk.~is~are~am~be',
    'These boxes ___ empty now.~are~is~am~be'
  ]);
  group('A1','routine','描述日常习惯时，第三人称单数动词一般加 -s 或 -es，复数主语用原形。|For routines use the present simple. A third-person singular subject usually takes -s or -es.',[
    'Nora ___ lunch at noon every day.~eats~eat~eating~eaten',
    'My brothers ___ basketball on Fridays.~play~plays~playing~to play',
    'The bakery ___ at seven every morning.~opens~open~opening~to open'
  ]);
  group('A1','first-article','首次提到一件可数的东西时用 a 或 an，选择取决于下一个词的开头音。|Use a or an for one countable thing mentioned for the first time. Choose by the next word’s opening sound.',[
    'I need ___ umbrella to walk home in the rain.~an~a~some~many',
    'There is ___ small desk in my room.~a~an~any~these',
    'Leila wants ___ orange from the fruit bowl.~an~a~those~many'
  ]);
  group('A1','demonstrative','this、that 用于单数，these、those 用于复数。近处用 this 或 these。|Use this or that with one item and these or those with several. This and these indicate nearby things.',[
    'Look at the pen in my hand. ___ pen is blue.~This~These~Those~They',
    'Look at the two photos I am holding. Can you see ___ photos here?~these~this~that~it',
    'The mountains far across the lake are beautiful. Look at ___ mountains!~those~that~it~this'
  ]);
  group('A1','calendar-prep','具体时刻一般用 at，星期或日期用 on，月份或年份用 in。|Use at for a clock time, on for a day or date, and in for a month or year.',[
    'Meet me ___ six o’clock.~at~on~in~of',
    'We have music class ___ Thursday.~on~at~in~by',
    'The new school year begins ___ September.~in~on~at~to'
  ]);
  group('A1','do-support','一般现在时疑问句中，第三人称单数用 does，其余主语用 do，后面的主要动词用原形。|Present simple questions use does with third-person singular and do with the other subjects. Keep the main verb in its base form.',[
    '___ you like apples?~Do~Does~Is~Are',
    '___ Mia live near the park?~Does~Do~Are~Am',
    'Does your uncle ___ English?~speak~speaks~speaking~spoken'
  ]);
  group('A1','can-base','can 后接动词原形，不加 to 或 -s。|Follow can with the bare infinitive, with no to or -s.',[
    'I can ___ a little French.~speak~speaks~speaking~to speak',
    'Can Tom ___ this book?~read~reads~reading~to read',
    'Their dog can ___ over the low wall.~jump~jumps~jumping~to jump'
  ]);

  group('A2','finished','明确已经结束的过去事件用一般过去时。|Use the simple past for finished events at a definite past time.',[
    'We ___ the night market last Saturday.~visited~visit~visiting~visits',
    'Arun ___ his grandparents at the station yesterday.~met~meets~meeting~has meet',
    'At eight last night, I ___ my backpack by the door and went to bed.~left~leave~leaving~has left'
  ]);
  group('A2','comparison','than 引导比较对象。根据形容词选比较级，例如 taller、more useful 或 better。|Than introduces a comparison. Use the appropriate comparative, such as taller, more useful or better.',[
    'This shelf is ___ than that one.~lower~lowest~more low~lowly',
    'The map is ___ than the list of streets for a visitor.~more useful~most useful~usefully~usefuller',
    'The soup tastes ___ today than it did yesterday.~better~best~more good~wellest'
  ]);
  group('A2','amount','many 和 few 搭配可数复数，much 和 little 搭配不可数名词。|Many and few go with plural countable nouns. Much and little go with uncountable nouns.',[
    'How ___ chairs should we bring?~many~much~little~any',
    'How ___ flour do we need for the recipe?~much~many~few~several',
    'Only a ___ visitors stayed until closing time.~few~little~much~any'
  ]);
  group('A2','future-plan','be going to 表示已经形成的计划或根据眼前证据作出的预测。going to 后用动词原形。|Use be going to for a prior plan or a prediction based on present evidence, followed by a base verb.',[
    'We have bought the tickets. We ___ going to travel on Friday.~are~is~be~was',
    'Ben is going to ___ a poster for the event.~make~made~makes~making',
    'Watch the dark clouds. It is going to ___.~rain~rains~raining~rained'
  ]);
  group('A2','requests','Could you 后接动词原形。Would you mind 后接动词的 -ing 形式。|Follow Could you with a base verb and Would you mind with an -ing form.',[
    'Could you ___ the door, please?~close~closes~closing~to close',
    'Would you mind ___ a little more slowly?~speaking~to speak~speak~spoken',
    'Would you mind ___ the last line again?~reading~read~to read~reads'
  ]);
  group('A2','adverb-place','频率副词通常放在主要动词前，放在 be 后。|Frequency adverbs generally precede a main verb and follow be.',[
    'Choose the neutral word order: We ___ after class.~usually meet~meet usual~are usually meet~usually meeting',
    'Choose the neutral word order: The café ___ on Sunday mornings.~is often busy~often busy is~busy is often always~often is busily',
    'Choose the neutral word order: My sister ___ coffee after lunch.~rarely drinks~drinks rare~rarely is drink~rarely drinking'
  ]);
  group('A2','possessive','所有格限定词后接名词，独立所有格 mine、yours、hers 等单独使用。|Possessive determiners come before nouns. Possessive pronouns such as mine, yours and hers stand alone.',[
    'That blue folder is mine. Is this red one ___?~yours~your~you~you’re',
    'Sofia brought this; the lunch box is ___.~hers~her~she~herself',
    'We forgot ___ water bottles on the bus.~our~ours~us~ourselves'
  ]);

  group('B1','present-perfect','从过去延续到现在的时间用现在完成时，已经结束的过去时段一般用一般过去时。|Use the present perfect for a period continuing to now, and the simple past for a finished past period.',[
    'I ___ this bike since I started secondary school, and I still use it.~have owned~owned~am owning~will own',
    'Last winter we ___ three villages along the coast.~visited~have visited~are visiting~had visit',
    'This is the first time I ___ this trail.~have walked~walks~had walk~will walking'
  ]);
  group('B1','real-condition','谈可能发生的未来时，if 从句通常用一般现在时，主句用 will 或祈使句。|For a real future possibility, use the present simple in the if-clause and will or an imperative in the result.',[
    'If your parcel ___ before lunch, I will bring it inside.~arrives~will arrive~arrived~would arrive',
    'If you ___ any extra forms, ask at the information desk.~need~will needing~needed~would need',
    'We will use the indoor court if it ___ this afternoon.~rains~will rain~would rain~raining'
  ]);
  group('B1','past-passive','一般过去时被动用 was 或 were 加过去分词。看主语是动作发出者还是承受者。|Form the simple past passive with was or were plus a past participle when the subject receives the action.',[
    'The school hall ___ by volunteers over the weekend.~was painted~painted~was painting~has paint',
    'The invitations ___ online yesterday.~were sent~sent~were sending~was sent',
    'The damaged sign ___ in May before the street reopened.~was replaced~replaced~was replacing~will replacing'
  ]);
  group('B1','relative-role','按从句中需要的成分选择关系词，例如所有关系用 whose，地点状语用 where。|Choose according to the missing role in the relative clause, such as whose for possession and where for a place.',[
    'I thanked the student ___ notes helped me revise.~whose~which~who~where',
    'The street ___ we met has since been renamed.~where~whose~who~what',
    'I kept the card ___ had the museum’s address on it.~that~whose~where~who'
  ]);
  group('B1','reported-questions','间接疑问句使用陈述语序，通常不保留直接疑问句的 do 或 does。|An embedded question uses statement word order, without the direct question’s do or does.',[
    'Could you tell me ___?~where the coach stops~where does the coach stop~where stop the coach~the coach where stops',
    'Do you know ___?~when the café closes~when does the café close~the café closes when~when closes the café',
    'Maya asked how much ___.~the ticket cost~did the ticket cost~cost the ticket~did cost the ticket'
  ]);
  group('B1','since-for','since 引出起点，for 引出持续时间。|Since introduces a starting point, while for introduces a duration.',[
    'The sports hall has been closed ___ Monday.~since~for~during~until',
    'I’ve waited ___ nearly half an hour and I’m still here.~for~since~while~at',
    'She has lived here ___ her family moved to the town.~since~for~during~until'
  ]);
  group('B1','verb-pattern','enjoy、avoid 和 consider 后面接表示动作的 -ing 形式。|Enjoy, avoid and consider take an -ing form for an activity.',[
    'We enjoyed ___ along the old railway path.~cycling~to cycle~cycle~have cycled',
    'Please avoid ___ heavy bags by the emergency exit.~leaving~leave~to leave~left',
    'We are considering ___ an earlier bus.~taking~to take~take~took'
  ]);

  group('B2','counterfactual-past','过去反事实条件用 if + had + 过去分词，结果常用 would have + 过去分词。|For an unreal past, use if with the past perfect and would have plus a past participle in the result.',[
    'If we had checked the timetable, we ___ the last train.~would have caught~will catch~would catch now~had catching',
    'If Hana ___ the receipt, she could have returned the lamp.~had kept~keeps~has keep~would have kept',
    'They ___ the address if you had sent the new map.~would have found~will have found~would finding~had found'
  ]);
  group('B2','mixed-condition','条件在过去而后果在现在时，常用 if + had done 搭配 would + 动词原形。|A past condition with a present consequence commonly uses if with had done and would plus a bare verb.',[
    'If I had saved the directions, I ___ where to turn now.~would know~would have known yesterday~had known~would knowing',
    'If the team had repaired the bus last night, it ___ ready now.~would be~had been~would have been yesterday~will have',
    'If I ___ her number when we met, I could call her now.~had taken~take~would take~have took'
  ]);
  group('B2','past-deduction','must have done 表示对过去的强推断，might have done 表示可能，can’t have done 排除可能。|Must have, might have and can’t have mark strong inference, possibility and impossibility about a past event.',[
    'Everyone was outside, and all the doors were locked from within. The guard ___ the gate before leaving, though we have no proof.~might have locked~must lock tomorrow~will have locking~can’t lock now',
    'The camera shows I stayed home all day. I ___ the parcel in person at school that day.~can’t have collected~must have collected~would have delivering~had certainly collect',
    'It’s one possible explanation: the notes ___ into the recycling box by mistake.~might have gone~must go now~has went~must have been went'
  ]);
  group('B2','report-passive','被动报道结构 It is said that ... 可改写为 subject + is said + 不定式，较早动作可用 to have done。|The personal passive uses a subject plus is said or believed and an infinitive. Use to have done for an earlier action.',[
    'Historians now believe she travelled there in 1880. She is believed ___ there that year.~to have travelled~to be travelling now~that travels~travelled to',
    'The repaired clock is expected ___ on Monday.~to work~working to~that work~have working',
    'The old path is thought ___ near the original gate.~to have ended~ending have~that end~has to ending'
  ]);
  group('B2','aspect','进行形式强调持续过程。完成形式可强调已实现的数量或结果。|Progressive forms focus on duration or process. Perfect simple forms can emphasise completed results or quantities.',[
    'My hands are covered in paint because I ___ the fence all morning and haven’t finished.~have been painting~painted yesterday~had painted tomorrow~have paint',
    'As soon as I entered, I noticed that someone ___ the locked window earlier.~had opened~is opening~has opens~opens next week',
    'So far today we ___ all four applications; each is now ready to send.~have completed~have been completing all yesterday~were completing tomorrow~had complete'
  ]);
  group('B2','reduced-relative','当名词承受动作，修饰它的简化从句可用过去分词。名词发出持续动作时常用 -ing。|A reduced clause uses a past participle for a passive relation and often an -ing form for an active one.',[
    'The photographs ___ during the rehearsal are on the wall.~taken~taking~take~to taking',
    'The students ___ outside the lab can come in now.~waiting~waited~were wait~was waiting',
    'All forms ___ after Friday will go into the next review cycle.~submitted~submitting~submit~to submitting'
  ]);
  group('B2','connectives','despite 后接名词或 -ing 结构，although 引导从句，so that 可引导目的从句。|Despite takes a noun or an -ing phrase. Although introduces a clause; so that can introduce a purpose clause.',[
    '___ having little time, I read the whole chapter.~Despite~Although~Even if~Because of that',
    '___ the room was small, it felt bright.~Although~Despite~In spite of~Rather than',
    'Leave enough space on the form ___ readers can add their own notes.~so that~despite~in order to~owing to'
  ]);

  group('C1','negative-inversion','句首是否定或限制性状语时，主句通常把助动词放在主语前。|A fronted negative or restrictive adverbial generally triggers inversion in the main clause.',[
    'Under no circumstances ___ the originals leave this room.~may~the rules may let~do let~are let',
    'Only when the room fell silent ___ the faint ticking.~did we hear~we did hear~we heard~had heard we',
    'Seldom ___ an argument stated with so little evidence.~have I seen~I have seen~had seen I~seeing I have'
  ]);
  group('C1','cleft','what 分裂句把待强调的成分放在 be 后。it 分裂句用 It is/was ... that 打出焦点。|A what-cleft places focus after be. An it-cleft uses It is or was ... that to isolate its focus.',[
    'It was the timing, rather than the cost, ___ caused the objection.~that~what~which it~for which it',
    'What the organisers need most ___ more notice from the venue, not more volunteers.~is~they need~being~are notice',
    'It was not until the second reading ___ I noticed the change in tone.~that~when~what~where'
  ]);
  group('C1','concession','名词、副词或形容词置于句首并接 as，可表达让步。|A fronted noun, adverb or adjective followed by as can express concession.',[
    'Plausible ___ the account may sound, it explains only one witness’s view.~as~because~so~since',
    'Hard ___ they tried, the original recordings could not be recovered.~as~so~where~which',
    'Helpful ___ the timetable is, it cannot tell us whether a talk is fully booked.~as~because~if only~such'
  ]);
  group('C1','participle-subject','没有另设主语的分词短语，其隐含主语应与主句主语一致。|A participle phrase without its own subject normally shares the subject of the main clause.',[
    'Having reviewed the original figures, ___ corrected the summary.~the editor~the figures~the correction~the summary',
    'Walking back from the archive, ___ noticed the laboratory lights.~the researchers~the lights~the building~the archive doors',
    'Exhausted after the rehearsal, ___ decided to cancel the extra session.~the actors~the remaining schedule~the hall~the advertised start time'
  ]);
  group('C1','demands','在指定虚拟式的正式用语中，表示要求的动词后可以用 that + 主语 + 动词原形。|The formal mandative subjunctive uses that, then a subject and the base form of the verb.',[
    'In the formal subjunctive: The board recommended that each team ___ an observer.~appoint~appoints~appointed~appointing',
    'In the formal subjunctive: It is vital that the backup ___ kept offline.~be~is being~was~has',
    'In the formal subjunctive: The editor requested that the title ___ changed before printing.~be~was~has been~being'
  ]);
  group('C1','nominalisation','名词化后要检查动词到名词的搭配和介词，例如 refusal to、commitment to、concern about。|When turning a verb into a noun, check the noun’s complement and preposition.',[
    'Their refusal ___ the results surprised the panel.~to publish~for publishing to~from publish~of publish',
    'Her commitment ___ every source improved the report.~to checking~to check of~of checking to~for check',
    'Public concern ___ the accuracy of the map led to a revision.~about~between~apart~because'
  ]);
  group('C1','free-choice','whatever、however、whoever 可组成让步结构，根据所修饰的成分选择形式。|Whatever, however and whoever introduce free-choice or concessive clauses according to the missing element.',[
    '___ carefully you read, you may miss that tiny footnote.~However~Whatever~Whoever~Whichever',
    '___ takes the last bus should check where it stops.~Whoever~Whichever of~However~Despite',
    '___ route the group chooses, it will cross the same river.~Whichever~Whoever~However~Wherever'
  ]);

  group('C2','immediate-order','用 no sooner 时，通常与 than 呼应；hardly/scarcely 引导先发生的动作时通常与 when 呼应。句首需倒装。|No sooner pairs with than. Hardly or scarcely typically pairs with when in this construction. Initial negative clauses invert.',[
    'No sooner had the note been circulated ___ objections began to arrive.~than~when~as~while',
    'Scarcely ___ the first paragraph when the chair interrupted.~had she finished~she had finished~finished had she~did she had finished',
    'Hardly had the contractor left ___ the fault returned.~when~than~that~until'
  ]);
  group('C2','modal-implication','needn’t have done 表示做了但无须做，didn’t need to 表达当时没有必要，单独不能断定是否做过。|Needn’t have done presupposes the action happened unnecessarily. Didn’t need to alone states absence of necessity.',[
    'I carried six printed copies, but the venue supplied them. I ___ any copies.~needn’t have brought~must not have brought~didn’t bring~could not bring',
    'The report arrived automatically; no one called to ask for it. We ___ the office.~didn’t need to call~needn’t have called~must have called~could have called to require',
    'The recording was safe on the server. Even so, I made another copy. I ___ it, but I did.~needn’t have copied~couldn’t have copied~didn’t copy~would never copy'
  ]);
  group('C2','relative-range','非限制性关系从句可以用 which 指代前面整件事。that 一般不能这样放在逗号后。|A supplementary which-clause can refer to the whole preceding proposition, rather than a single noun.',[
    'The dates changed without notice, ___ caused confusion among the speakers.~which~that~what~for whom',
    'The sign was moved overnight, ___ made the morning queue harder to manage.~which~what~that~whose',
    'The data are available only in print, ___ limits comparison across years.~which~that~which it~whom'
  ]);
  group('C2','subtle-contrast','比较 which construction 的句法结构，例如 much as 表让步、inasmuch as 表条件范围、whereas 表对照。|Choose the connective by function: much as for concession, inasmuch as for the scope of a claim, and whereas for explicit contrast.',[
    '___ I value the proposal’s ambition, I cannot endorse the schedule.~Much as~In order that~Lest~Provided by',
    'A written note is reusable ___ it can be consulted again without its author present.~inasmuch as~even though~lest~as if not',
    'The first statement reports what occurred, ___ the second offers an interpretation.~whereas~lest~in order that~notwithstanding that no'
  ]);
  group('C2','contrast-parallel','并列或对照结构应把同级成分对应起来。避免把时态或词类不配对的两项硬并列。|Keep coordinated or contrasted elements grammatically parallel.',[
    'The team was told not only to retain the evidence but also ___ it securely.~to store~storing~it stored~has stored',
    'The policy concerns both retaining historical files and ___ future access.~controlling~to controlling~controlled~control to',
    'The change reflects neither a lack of interest nor ___ money.~a shortage of~running short to~because money is~it lacks'
  ]);
  group('C2','irrealis-preference','would rather 后接另一主语时，用过去式表示现在的偏好，用过去完成时表达对已发生事件的遗憾。|With a separate subject after would rather, use the past for a current preference and the past perfect for regret about a completed event.',[
    'The date has already been announced. I would rather they ___ until the room was confirmed.~had waited~wait~were waiting tomorrow~have wait',
    'The decision is still open. I would rather we ___ the matter in private tomorrow.~discussed~had discussed yesterday~will be discussed~are discussing it yesterday',
    'The draft went out last night. I’d rather you ___ everyone a second version without asking.~hadn’t sent~wouldn’t have send~don’t sent~weren’t send'
  ]);
  group('C2','inverted-condition','正式假设句可用 Had、Were 或 Should 置于句首省略 if，同时保持相应的条件与时间关系。|Formal inversion can replace if with initial had, were or should. Keep the appropriate time relationship.',[
    '___ the flaw been detected earlier, the data could have been collected again.~Had~Were~Should~Would',
    '___ the venue to close next month, we would need to reschedule.~Were~Had~Did~Would',
    '___ the courier arrive before noon tomorrow, sign for the package and leave it in the office.~Should~Had~Were~Would have'
  ]);
})();
