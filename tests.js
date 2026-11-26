/* Open index.html?test=1 to run the suite with separate test storage. */
(async function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const AI = globalThis.EachVeyaAi;
  const Coach = globalThis.EachVeyaCoach;
  const Backup = globalThis.EachVeyaBackup;
  const Science = globalThis.EachVeyaScience;
  const { questions, subjects, topics, topicsBySubject, levels, skills, curricula } = globalThis.SmartStudyData;
  const byId = new Map(questions.map(question => [question.id, question]));
  const key = `smart-study.tests.v${Core.VERSION}`;
  const v6Key = 'smart-study.tests.v6';
  const v5Key = 'smart-study.tests.v5';
  const v4Key = 'smart-study.tests.v4';
  const v3Key = 'smart-study.tests.v3';
  const previousKey = 'smart-study.tests.v2';
  const legacyKey = 'smart-study.tests.v1';
  const aiFixture = [
    { a: 3, b: 2, c: 0, d: 14, form: 'plain', distractors: [3, 5, 6] },
    { a: 6, b: -4, c: 0, d: 14, form: 'plain', distractors: [2, 4, 5] },
    { a: -2, b: 3, c: 0, d: 9, form: 'plain', distractors: [3, -6, 0] }
  ];
  const results = [];
  const assert = (condition, message = 'Assertion failed') => {
    if (!condition) throw new Error(message);
  };
  const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  const throws = callback => {
    let thrown = false;
    try { callback(); } catch (_) { thrown = true; }
    assert(thrown, 'Expected an error');
  };
  async function test(name, callback) {
    try { await callback(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  }

  const knownTime = new Date(2026, 3, 2, 9).toISOString();
  const laterTime = new Date(2026, 3, 3, 9).toISOString();

  function start(options = {}, state = Core.createState()) {
    return Core.startSession(state, questions, { subject: 'math', count: 2, ...options }, () => 0.5);
  }

  function answerCurrent(state, correct = true, at = knownTime) {
    const id = state.active.questionIds[state.active.index];
    const question = byId.get(id);
    return Core.gradeAnswer(state, questions, correct ? question.answer : (question.answer + 1) % question.options.length, at);
  }

  function answerPractice(state, ids, pattern, at = laterTime) {
    let updated = start({ subject: byId.get(ids[0]).subject, ids, count: ids.length }, state);
    for (const outcome of pattern) {
      if (outcome === 'hint') updated = Core.revealHint(updated, questions);
      updated = Core.advanceSession(answerCurrent(updated, outcome !== false, at), questions, at);
    }
    return updated;
  }

  function focusedRound(state, focus, mode, date, outcome = true) {
    const ids = Coach.focusIds(state, focus, mode);
    assert(ids.length > 0);
    const subject = byId.get(ids[0]).subject;
    let current = start({ subject, ids, count: ids.length, mode, focus }, state);
    for (const id of ids) {
      const question = byId.get(id);
      const choice = outcome ? question.answer : Number(Object.keys(question.errors)[0]);
      current = Core.advanceSession(Core.gradeAnswer(current, questions, choice, date), questions, date);
    }
    return current;
  }

  function placement(subject, shouldGetRight, previous = Core.createState()) {
    const ids = Learning.diagnosticIds(subject);
    let state = start({ subject, ids, count: ids.length, mode: 'diagnostic' }, previous);
    for (const id of ids) state = Core.advanceSession(answerCurrent(state, shouldGetRight(byId.get(id)), knownTime), questions, knownTime);
    return state;
  }

  function mathIds(topic, level, count = 5) {
    return questions.filter(item => item.id.startsWith('ma-pr-') && item.topic === topic && item.level === level).slice(0, count).map(item => item.id);
  }

  function oldRecord() {
    return {
      version: 1, language: 'en',
      attempts: [
        { sessionId: 'old-completed', questionId: 'en-g01', choice: 0, correct: false, at: knownTime },
        { sessionId: 'old-active', questionId: 'ma-a01', choice: 1, correct: true, at: laterTime }
      ],
      sessions: [{ id: 'old-completed', subject: 'english', mode: 'practice', questionIds: ['en-g01'], correct: 0, completedAt: knownTime }],
      active: { id: 'old-active', subject: 'math', mode: 'practice', questionIds: ['ma-a01', 'ma-a02'], index: 0, answers: { 'ma-a01': 1 } }
    };
  }

  await test('所有题目 ID 唯一，保留 48 道旧题和原有正确选项', () => {
    equal(byId.size, questions.length);
    equal(questions.filter(question => /^[a-z]{2}-[ngavr]\d{2}$/.test(question.id)).length, 48);
    equal(byId.get('en-g01').options[byId.get('en-g01').answer].en, 'goes');
    equal(byId.get('ma-a01').options[byId.get('ma-a01').answer].en, '5');
    equal(byId.get('ma-n06').topic, 'statistics');
    equal(byId.get('ma-a08').topic, 'functions');
  });

  await test('双语题干、解析、难度标签及作答区域齐全', () => {
    for (const item of questions) {
      assert(subjects.some(subject => subject.id === item.subject && subject.available), item.id);
      assert(topics[item.topic] && topicsBySubject[item.subject].includes(item.topic), item.id);
      assert(levels[item.subject].includes(item.level), item.id);
      assert(item.subject === 'english' ? item.track === 'cefr' : skills[item.skill] && Array.isArray(item.curriculumRefs), item.id);
      for (const lang of ['zh', 'en']) assert(item.prompt[lang]?.length && item.explanation[lang]?.length, item.id);
      if (item.fields) {
        assert(item.fields.length > 0 && item.fields.every(field => Core.evaluateField(field, String(field.expected))?.correct
          && field.label.zh.includes('□') && field.label.en.includes('□')), item.id);
        if (!item.options) continue;
      }
      equal(item.options.length, 4);
      assert(Number.isInteger(item.answer) && !!item.options[item.answer], item.id);
      for (const lang of ['zh', 'en']) {
        assert(item.options.every(option => typeof option[lang] === 'string' && option[lang].length), item.id);
        assert(new Set(item.options.map(option => option[lang])).size === 4, `Repeated option in ${item.id}`);
      }
    }
  });

  await test('数学五领域各覆盖 L1–L5，英语三项技能各覆盖 A1–C2', () => {
    for (const [subject, subjectTopics] of Object.entries(topicsBySubject)) {
      for (const topic of subjectTopics) {
        for (const level of levels[subject]) {
          const items = questions.filter(item => item.topic === topic && item.level === level && !item.diagnosticOnly);
          assert(items.length >= (subject === 'math' ? 10 : 1), `Missing ${subject} ${topic} ${level}`);
        }
      }
    }
    equal(curricula.map(item => item.id), ['cn', 'gcse', 'igcse', 'common-core', 'ib', 'a-level', 'ap']);
  });

  await test('25 个数学题型首个变式的评分与独立验算一致', () => {
    const expected = {
      arithmetic: ['21', '1/3', '240', '99.75%', '6'],
      algebra: ['4', '3', '3', '2, 5', '2 ≤ x ≤ 6'],
      geometry: ['22 cm', '76°', '21π cm²', '8∶27', '8 cm'],
      functions: ['10', '11', '13', '25', '6'],
      statistics: ['3', '2/5', '10', '2/7', '4/11']
    };
    for (const [topic, answers] of Object.entries(expected)) {
      levels.math.forEach((level, index) => {
        const item = byId.get(`ma-pr-${topic}-${level}-1`);
        assert(item.options[item.answer].en === answers[index], `Wrong answer for ${item.id}`);
      });
    }
  });

  await test('三门科学每门七个知识点，保留核心起点测试及已校验的组题题库', () => {
    equal(Science.questions.length, 918);
    equal(new Set(Science.questions.map(item => item.prompt.en)).size, 918);
    for (const subject of Science.subjects) {
      equal(topicsBySubject[subject].length, 7);
      equal(new Set(topicsBySubject[subject].map(topic => Science.topics[topic].domain)).size, 7);
      equal(Learning.diagnosticIds(subject).length, 6);
      for (const topic of topicsBySubject[subject]) for (const level of levels[subject]) {
        const items = Science.candidates({ subject, topic, level });
        equal(items.length, Science.topics[topic].denominator ? 8 : 0);
        assert(items.every(item => Science.validate(item) && item.safety === 'virtual-data' && item.curriculumRefs.length === 0));
        for (const curriculum of Science.curriculumKeys) {
          equal(Science.scopes[subject][curriculum].status, 'planned');
          equal(Science.candidates({ subject, topic, level, curriculum }).length, 0);
        }
      }
    }
    for (const question of Science.questions) {
      assert(Science.validate(question), question.id);
      assert(!Science.validate({ ...question, answer: (question.answer + 1) % 4 }), question.id);
    }
    const speed = byId.get('sci-average-speed-L3-1');
    equal(speed.options[speed.answer].en, '3 m/s');
    const percentage = byId.get('sci-mass-percentage-L3-1');
    equal(percentage.options[percentage.answer].en, '20%');
    const density = byId.get('sci-population-density-L3-1');
    equal(density.options[density.answer].en, '3 individuals/m²');
  });

  await test('科学起点是练习建议，独立按学科知识点评级', () => {
    const physics = placement('physics', question => question.topic === 'average-speed' || question.topic === 'ohmic-current' && question.level === 'L1');
    const profile = Learning.subjectProfile(physics, 'physics');
    equal([profile['average-speed'].level, profile['ohmic-current'].level, profile['energy-efficiency'].level], ['L3', 'L2', 'L1']);
    equal(Object.values(profile).filter(row => row.basis === 'diagnostic').length, 3);
    assert(Object.values(profile).every(row => row.retained === null));
    equal(profile['forces-motion'].basis, 'starting');
    equal(profile['forces-motion'].level, 'L1');
    assert(Object.values(Learning.subjectProfile(physics, 'biology')).every(row => row.basis === 'starting' && row.retained === null));
    equal(Learning.practicePool(physics, { subject: 'physics', topic: 'average-speed', level: 'L5' }).length, 16);
  });

  await test('五科各保有 500 道常规题及典型题，科学知识点用未见的跨日复测升级', () => {
    for (const subject of subjects) {
      const practice = questions.filter(item => item.subject === subject.id && !item.retired && !item.focusOnly && !item.diagnosticOnly);
      const regular = practice.filter(item => !item.reviewedSchool);
      equal(regular.length, 500);
      equal(regular.filter(item => item.fields).length, 100);
      equal(practice.length - regular.length, subject.id === 'english' ? 24 : 6);
    }
    const topic = 'forces-motion';
    const pool = Learning.practicePool(Core.createState(), { subject: 'physics', topic, level: 'L1' });
    equal(pool.length, 8);
    const practiced = answerPractice(Core.createState(), pool.slice(0, 5).map(item => item.id), Array(5).fill(true), knownTime);
    equal(Learning.subjectProfile(practiced, 'physics')[topic].retained, null);
    const after = focusedRound(practiced, topic, 'spaced', laterTime);
    equal(Learning.subjectProfile(after, 'physics')[topic].retained, 'L1');
    equal(Learning.subjectProfile(after, 'physics')[topic].level, 'L2');
    equal(Learning.subjectProfile(after, 'physics')['thermal-models'].retained, null);
  });

  await test('科学多题独立答对后仍需隔日复测；一次答错或低参与不调级', () => {
    const topic = 'mass-density';
    const candidates = Science.candidates({ subject: 'chemistry', topic, level: 'L1' }).map(item => item.id).slice(0, 5);
    const initial = answerPractice(Core.createState(), candidates.slice(0, 1), [true], knownTime);
    const row = state => Learning.subjectProfile(state, 'chemistry')[topic];
    equal(row(initial).level, 'L1');
    equal(row(initial).retained, null);
    const practiced = answerPractice(initial, candidates.slice(1), Array(4).fill(true), knownTime);
    const evidence = Coach.assessment(practiced, questions, new Date(knownTime))[topic];
    equal(evidence.status, 'scheduled');
    equal(evidence.level, 'L1');
    equal(evidence.due, Core.localDate(new Date(laterTime)));
    equal(row(practiced).retained, null);
    const early = focusedRound(practiced, topic, 'spaced', knownTime);
    equal(row(early).level, 'L1');
    const verified = focusedRound(early, topic, 'spaced', laterTime);
    equal(row(verified).level, 'L2');
    equal(row(verified).retained, 'L1');
    equal(Learning.subjectProfile(verified, 'chemistry')['mass-percentage'].retained, null);
    const hinted = answerPractice(Core.createState(), candidates, [true, true, true, 'hint', 'hint'], knownTime);
    equal(row(focusedRound(hinted, topic, 'spaced', laterTime)).level, 'L1');
  });

  await test('同类科学错因和间隔复测可追踪，并进入目标科目的学习计划与报告', () => {
    const topic = 'trait-frequency';
    const ids = Science.candidates({ subject: 'biology', topic, level: 'L3' }).slice(0, 5).map(item => item.id);
    let state = placement('biology', () => true);
    let current = start({ subject: 'biology', ids, count: ids.length }, state);
    for (const id of ids) {
      const q = byId.get(id);
      const choice = Number(Object.keys(q.errorKinds).find(index => q.errorKinds[index] === 'denominator'));
      current = Core.advanceSession(Core.gradeAnswer(current, questions, choice, laterTime), questions, laterTime);
    }
    state = current;
    equal(Learning.subjectProfile(state, 'biology')[topic].level, 'L2');
    const anchor = Coach.assessment(state, questions, new Date(laterTime))[topic];
    equal(anchor.status, 'possible');
    equal(anchor.error, 'denominator');
    const probe = Coach.focusIds(state, topic, 'probe', 2, anchor);
    assert(probe.length === 2 && probe.every(id => byId.get(id).level === 'L3' && byId.get(id).role === 'probe'));
    const withPlan = { ...state, plan: Core.normalizePlan({ enabled: true, goal: 'biology', topic, minutes: 30 }) };
    equal(Coach.learningPlan(withPlan, questions, new Date(laterTime)).review[0].focus, topic);
    equal(Coach.report(state, questions, 7, new Date(laterTime)).topics[topic].total, 7);
    equal(Backup.parse(Backup.serialize(withPlan), questions), Core.normalizeState(withPlan, questions));
  });

  await test('所有函数 L3 变式的正确值可从题干数据重新算出', () => {
    for (const id of mathIds('functions', 'L3', 10)) {
      const item = byId.get(id);
      const [, first, second] = item.prompt.en.match(/f\(0\) = (\d+) and f\(2\) = (\d+)/);
      equal(Number(item.options[item.answer].en), Number(first) + (Number(second) - Number(first)) * 2.5);
    }
  });

  await test('逐道验算新增数学变式，检查选项映射、题干和题号无重复', () => {
    const additions = questions.filter(question => question.id.startsWith('focus-'));
    equal(additions.length, 132);
    equal(new Set(additions.map(q => q.prompt.en)).size, additions.length);
    const toNumber = ({ en }) => {
      const [n, d = 1] = en.split('/').map(Number);
      return n / d;
    };
    for (const question of additions) {
      for (const [choice, focus] of Object.entries(question.errors)) {
        assert(Number(choice) !== question.answer && question.focus.includes(focus), question.id);
      }
      const check = question.verification;
      if (!check) continue;
      const { a, b, c, d, kind } = check;
      const matches = question.options.map(toNumber).map(value => {
        if (kind === 'equation') return a * value + b === c * value + d;
        if (kind === 'product') return value === a * b;
        if (kind === 'quotient') return value * b === a;
        return Math.abs(value * a * b - (a + b)) < 1e-9;
      });
      equal(matches.indexOf(true), question.answer);
      equal(matches.filter(Boolean).length, 1);
    }
  });

  await test('未完成的起点测试不会在错题本或学习记录泄露答案', () => {
    const ids = Learning.diagnosticIds('math');
    const state = answerCurrent(start({ ids, count: ids.length, mode: 'diagnostic' }), false);
    equal(Core.getStats(state, questions).total, 0);
    equal(Core.getMistakes(state, questions).length, 0);
    equal(Learning.topicProgress(state, new Date(knownTime)).arithmetic.total, 0);
    equal(state.attempts.length, 1);
  });

  await test('单题只给错因线索，两道未见题出现相同错误才标记并连接前置知识', () => {
    const date = new Date(knownTime);
    let state = start({ ids: ['ma-a01'], count: 1 });
    state = Core.advanceSession(Core.gradeAnswer(state, questions, 3, knownTime), questions, knownTime);
    equal(Coach.assessment(state, questions, date).coefficient.status, 'possible');
    equal(Coach.assessment(state, questions, date).balance.status, 'unassessed');
    const ids = Coach.focusIds(state, 'coefficient', 'probe');
    equal(ids.map(id => byId.get(id).variant), ['step', 'apply']);
    assert(byId.get(ids[0]).variantGroup !== byId.get(ids[1]).variantGroup);
    state = focusedRound(state, 'coefficient', 'probe', knownTime, false);
    equal(Coach.assessment(state, questions, date).coefficient.status, 'confirmed');
    assert(Coach.focusIds(state, 'coefficient', 'retake').every(id => !ids.includes(id)));
    state = focusedRound(state, 'coefficient', 'retake', laterTime);
    equal(Coach.assessment(state, questions, new Date(laterTime)).coefficient.status, 'verified');
    assert(globalThis.EachVeyaSkills.skills.distribution.prerequisites.includes('coefficient'));
    equal(Coach.assessment(Core.normalizeState(state, questions), questions, new Date(laterTime)), Coach.assessment(state, questions, new Date(laterTime)));
  });

  await test('只有独立完成不同的变式才延长间隔，过早复习不会提前消耗下一个间隔', () => {
    const at = day => new Date(2026, 3, day, 9).toISOString();
    let state = focusedRound(Core.createState(), 'balance', 'retake', at(2));
    equal(Coach.assessment(state, questions, new Date(at(2))).balance.due, '2026-04-03');
    state = focusedRound(state, 'balance', 'spaced', at(2));
    equal(Coach.assessment(state, questions, new Date(at(2))).balance.interval, 1);
    for (const [day, interval] of [[3, 3], [6, 7], [13, 14], [27, 30]]) {
      state = focusedRound(state, 'balance', 'spaced', at(day));
      const record = Coach.assessment(state, questions, new Date(at(day))).balance;
      equal(record.interval, interval);
      equal(record.lastCheck.independent, 1);
      assert(!Coach.dueSkills(Coach.assessment(state, questions, new Date(at(day))), new Date(at(day))).includes('balance'));
    }
    state = focusedRound(state, 'balance', 'spaced', at(58), false);
    const failed = Coach.assessment(state, questions, new Date(at(58))).balance;
    equal(failed.interval, 0);
    equal(failed.due, Core.localDate(new Date(at(58))));
  });

  await test('七个专项在确认错因并复测后都有不同的新题覆盖首轮五个间隔', () => {
    const at = day => new Date(2026, 3, day, 9).toISOString();
    for (const focus of Object.keys(globalThis.EachVeyaSkills.skills)) {
      if (Science.topics[focus]) continue;
      let state = focusedRound(Core.createState(), focus, 'probe', at(2), false);
      state = focusedRound(state, focus, 'retake', at(2));
      for (const day of [3, 6, 13, 27, 57]) state = focusedRound(state, focus, 'spaced', at(day));
      equal(Coach.assessment(state, questions, new Date(at(57)))[focus].interval, 30);
      equal(state.attempts.length, new Set(state.attempts.map(attempt => attempt.questionId)).size);
    }
  });

  await test('常规练习筛选领域和等级并排除诊断专用题', () => {
    const ids = Core.chooseQuestions(questions, { subject: 'math', topic: 'geometry', level: 'L5', count: 100 });
    equal(ids.length, 13);
    equal(new Set(ids).size, 13);
    assert(ids.every(id => byId.get(id).topic === 'geometry' && byId.get(id).level === 'L5' && !byId.get(id).diagnosticOnly));
  });

  await test('开局没有虚构正确率或已评定水平', () => {
    const state = Core.createState();
    equal(Core.getStats(state, questions).accuracy, null);
    equal(Learning.latestPlacement(state, 'english'), null);
    equal(Learning.mathProfile(state).algebra.basis, 'starting');
    equal(Learning.englishRecommendations(state), []);
  });

  await test('非法题数、科目和选项被拒绝，未作答不能前进', () => {
    for (const count of [0, 1.5, -1]) throws(() => start({ count }));
    throws(() => start({ subject: 'unknown-subject' }));
    const state = start();
    for (const choice of [-1, 4, null, 1.5, '1']) throws(() => Core.gradeAnswer(state, questions, choice));
    throws(() => Core.advanceSession(state, questions));
  });

  await test('提交答案后正确判分且保留原状态，同题重复提交只计一次', () => {
    const original = start();
    const graded = answerCurrent(original);
    equal(original.attempts.length, 0);
    equal(graded.attempts[0].correct, true);
    equal(Core.gradeAnswer(graded, questions, 0), graded);
    equal(graded.attempts.length, 1);
  });

  await test('错误进入错题本，重复答错累计次数，再次答对后移出', () => {
    const ids = mathIds('algebra', 'L2', 1);
    let state = answerPractice(Core.createState(), ids, [false]);
    let review = start({ subject: 'math', mode: 'review', ids, count: 1 }, state);
    review = answerCurrent(review, false, laterTime);
    equal(Core.getMistakes(review, questions)[0].wrongCount, 2);
    state = start({ subject: 'math', mode: 'review', ids, count: 1 }, review);
    state = answerCurrent(state, true, laterTime);
    equal(Core.getMistakes(state, questions).length, 0);
    equal(Core.getStats(state, questions).accuracy, 33);
  });

  await test('已完成练习按全部记录计分，半途退出仍有提交记录', () => {
    let state = answerCurrent(start());
    state = Core.advanceSession(state, questions);
    equal(state.attempts.length, 1);
    equal(state.sessions.length, 0);
    state = Core.advanceSession(answerCurrent(state, false), questions);
    equal(state.active, null);
    equal(state.sessions[0].correct, 1);
    equal(state.attempts.length, 2);
    throws(() => Core.advanceSession(state, questions));
  });

  await test('一次提示可恢复且只记一次，诊断不开放提示', () => {
    const ids = mathIds('arithmetic', 'L2', 1);
    const original = start({ ids, count: 1 });
    const hinted = Core.revealHint(original, questions);
    equal(original.active.hintedQuestionIds, []);
    equal(Core.revealHint(hinted, questions), hinted);
    const restored = Core.normalizeState(JSON.parse(JSON.stringify(hinted)), questions);
    equal(restored.active.hintedQuestionIds, ids);
    const graded = answerCurrent(restored);
    equal(graded.attempts[0].hinted, true);
    equal(graded.attempts[0].correct, true);
    const dx = start({ ids: Learning.diagnosticIds('math'), count: 10, mode: 'diagnostic' });
    equal(Core.revealHint(dx, questions), dx);
  });

  await test('数学起点测试恰有 10 题、每领域 2 题，未完成不生成推荐', () => {
    const ids = Learning.diagnosticIds('math');
    equal(ids.length, 10);
    for (const topic of topicsBySubject.math) equal(ids.filter(id => byId.get(id).topic === topic).length, 2);
    const state = answerCurrent(start({ ids, count: 10, mode: 'diagnostic' }));
    equal(Learning.latestPlacement(state, 'math'), null);
  });

  await test('数学起点测试可分别推荐代数 L4、几何 L2 和其他领域 L1', () => {
    const state = placement('math', item => item.topic === 'algebra' || (item.topic === 'geometry' && item.level === 'L2'));
    const result = Learning.latestPlacement(state, 'math');
    equal(result.topics.algebra.level, 'L4');
    equal(result.topics.geometry.level, 'L2');
    equal(result.topics.functions.level, 'L1');
    const pool = Learning.practicePool(state, { subject: 'math', level: 'auto' });
    equal([...new Set(pool.filter(q => q.topic === 'algebra').map(q => q.level))], ['L4']);
    equal([...new Set(pool.filter(q => q.topic === 'geometry').map(q => q.level))], ['L2']);
  });

  await test('单道题与四道题均不会让数学难度立即变化', () => {
    const ids = mathIds('arithmetic', 'L2', 4);
    let state = answerPractice(Core.createState(), ids.slice(0, 1), [false]);
    equal(Learning.mathProfile(state).arithmetic.level, 'L2');
    state = answerPractice(state, ids.slice(1), [true, true, true]);
    equal(Learning.mathProfile(state).arithmetic.evidence, 4);
    equal(Learning.mathProfile(state).arithmetic.level, 'L2');
  });

  await test('五道里四道独立答对只提升该领域一级', () => {
    const state = answerPractice(Core.createState(), mathIds('functions', 'L2'), [true, true, false, true, true]);
    const profile = Learning.mathProfile(state);
    equal(profile.functions.level, 'L3');
    equal(profile.functions.basis, 'practice');
    equal(profile.functions.lastBatch.independent, 4);
    equal(profile.geometry.level, 'L2');
  });

  await test('L2 代数同结构只算一份，三种结构均无提示答对才推荐 L3', () => {
    const repeated = mathIds('algebra', 'L2');
    const previous = answerPractice(Core.createState(), repeated, Array(5).fill(true), knownTime);
    const restored = Backup.parse(Backup.serialize(previous), questions);
    equal(restored.attempts.map(attempt => [attempt.questionId, attempt.correct]), previous.attempts.map(attempt => [attempt.questionId, attempt.correct]));
    let profile = Learning.mathProfile(restored).algebra;
    equal(profile.level, 'L2');
    equal(profile.equationEvidence, { independent: 1, total: 3 });
    equal(Learning.mathProfile(answerPractice(Core.createState(), repeated, Array(5).fill(false))).algebra.level, 'L2');

    const [quotient, otherQuotient, grouped] = [7, 8, 9].map(n => `ma-pr-algebra-L2-${n}@2`);
    let practice = answerPractice(restored, [quotient, grouped], ['hint', true]);
    profile = Learning.mathProfile(practice).algebra;
    equal(profile.level, 'L2');
    equal(profile.equationEvidence, { independent: 2, total: 3 });
    const reviewed = start({ ids: [otherQuotient], mode: 'review', count: 1 }, practice);
    const reviewDone = Core.advanceSession(answerCurrent(reviewed, true, laterTime), questions, laterTime);
    equal(Learning.mathProfile(reviewDone).algebra.level, 'L2');
    practice = answerPractice(practice, [otherQuotient], [true]);
    profile = Learning.mathProfile(practice).algebra;
    equal(profile.level, 'L3');
    equal(profile.lastBatch, { level: 'L2', correct: 3, independent: 3, total: 3 });
    equal(Learning.mathProfile(practice).geometry.level, 'L2');
    const candidates = Learning.practiceIds(restored, { subject: 'math', topic: 'algebra', level: 'auto' }, () => 0.5);
    equal(new Set(candidates.slice(0, 3).map(id => byId.get(id).equationFamily)).size, 3);
    assert(candidates.every(id => byId.get(id).level === 'L2' && !byId.get(id).retired));
  });

  await test('四道新版 L2 方程双语题干可代入验算，答案唯一且原版仍可读取', () => {
    for (const n of [7, 8, 9, 10]) {
      const id = `ma-pr-algebra-L2-${n}`;
      const question = byId.get(id + '@2');
      assert(byId.get(id).retired && question.originalId === id && !question.retired);
      for (const lang of ['zh', 'en']) {
        const prompt = question.prompt[lang];
        const quotient = prompt.match(/x\/(\d+) ([+−]) (\d+) = (\d+)/);
        const grouped = prompt.match(/(\d+)\(x ([+−]) (\d+)\) = (\d+)/);
        const [, factor, sign, constant, right] = quotient || grouped;
        const offset = Number(constant) * (sign === '+' ? 1 : -1);
        const keys = question.options.flatMap((option, i) => {
          const x = Number(option[lang]);
          const lhs = quotient ? x / Number(factor) + offset : Number(factor) * (x + offset);
          return lhs === Number(right) ? [i] : [];
        });
        equal(keys, [question.answer]);
        equal(question.equationFamily, quotient ? 'quotient' : 'grouped');
      }
    }
  });

  await test('五道里最多答对两道才下降一级，且最低为 L1', () => {
    const ids = mathIds('statistics', 'L2');
    let state = answerPractice(Core.createState(), ids, [false, false, true, false, true]);
    equal(Learning.mathProfile(state).statistics.level, 'L1');
    state = answerPractice(state, mathIds('statistics', 'L1'), [false, false, false, false, false]);
    equal(Learning.mathProfile(state).statistics.level, 'L1');
  });

  await test('提示后答对计正确但不计入独立答对，防止不当升级', () => {
    const state = answerPractice(Core.createState(), mathIds('geometry', 'L2'), [true, true, true, 'hint', 'hint']);
    const profile = Learning.mathProfile(state).geometry;
    equal(profile.level, 'L2');
    equal(profile.lastBatch, { level: 'L2', correct: 5, independent: 3, total: 5 });
  });

  await test('重复题、错题复习、其他等级不会凑足数学调整样本', () => {
    const ids = mathIds('algebra', 'L2', 1);
    let state = Core.createState();
    for (let index = 0; index < 6; index++) state = answerPractice(state, ids, [true]);
    state = answerPractice(state, mathIds('algebra', 'L4'), [true, true, true, true, true]);
    const reviews = mathIds('algebra', 'L2').slice(1);
    state = start({ ids: reviews, mode: 'review', count: reviews.length }, state);
    for (const ignored of reviews) state = Core.advanceSession(answerCurrent(state, true, laterTime), questions, laterTime);
    equal(Learning.mathProfile(state).algebra.evidence, 1);
    equal(Learning.mathProfile(state).algebra.level, 'L2');
  });

  await test('数学手选覆盖推荐，等级上限为 L5', () => {
    let state = placement('math', item => item.topic === 'functions');
    state = answerPractice(state, mathIds('functions', 'L4'), Array(5).fill(true));
    state = answerPractice(state, mathIds('functions', 'L5'), Array(5).fill(true));
    equal(Learning.mathProfile(state).functions.level, 'L5');
    const pool = Learning.practicePool(state, { subject: 'math', topic: 'functions', level: 'L1' });
    assert(pool.length > 0 && pool.every(item => item.level === 'L1'));
    equal(Learning.mathProfile(state).functions.level, 'L5');
  });

  await test('重做起点测试后使用最近的结果，保留此前的作答', () => {
    const state = answerPractice(Core.createState(), mathIds('algebra', 'L2'), Array(5).fill(true), new Date(2026, 3, 1, 9).toISOString());
    const retested = placement('math', item => item.topic === 'geometry', state);
    equal(retested.attempts.length, 15);
    equal(Learning.mathProfile(retested).algebra.level, 'L1');
    equal(Learning.mathProfile(retested).geometry.level, 'L4');
  });

  await test('英语起点测试为 12 题且只给 A1–B2 起点，手选可用 C2', () => {
    equal(Learning.diagnosticIds('english').length, 12);
    const state = placement('english', () => true);
    equal(Learning.latestPlacement(state, 'english').level, 'B2');
    assert(Learning.practicePool(state, { subject: 'english', level: 'C2' }).every(item => item.level === 'C2'));
    const inconsistent = placement('english', item => item.level !== 'A1');
    equal(Learning.latestPlacement(inconsistent, 'english').level, 'A1');
  });

  await test('雅思目标只保存偏好，不推导 CEFR 练习等级', () => {
    const state = Core.updatePreferences(Core.createState(), { ieltsTarget: '7.5' });
    equal(state.preferences.ieltsTarget, '7.5');
    equal(state.preferences.englishLevel, null);
    equal(Learning.latestPlacement(state, 'english'), null);
    equal(Core.updatePreferences(state, { ieltsTarget: '7.3' }).preferences.ieltsTarget, '');
  });

  await test('通用英语按知识点独立推荐，手选等级依然有效', () => {
    const ids = questions.filter(q => q.subject === 'english' && q.topic === 'grammar' && q.level === 'A1' && !q.focusOnly && !q.diagnosticOnly)
      .slice(0, 5).map(q => q.id);
    equal(ids.length, 5);
    const partial = answerPractice(Core.createState(), ids.slice(0, 4), [true, true, true, true]);
    equal(Learning.englishProfile(partial).grammar.level, 'A1');
    const state = answerPractice(partial, ids.slice(4), [true]);
    equal(Learning.englishProfile(state).grammar.level, 'A2');
    equal(Learning.englishProfile(state).vocabulary.level, 'A1');
    assert(Learning.practicePool(state, { subject: 'english', topic: 'grammar', level: 'auto' }).every(q => q.level === 'A2'));
    assert(Learning.practicePool(state, { subject: 'english', topic: 'grammar', level: 'C2' }).every(q => q.level === 'C2'));
  });

  await test('英语阅读按不同文章累计样本，同篇新题与专项变式只算首次作答', () => {
    const samePassage = [...[1, 2, 3, 4].map(i => `b400-english-r-lost-cap-${i}`), 'lesson-evidence-lost-cap-3'];
    equal(new Set(samePassage.map(id => Core.readingPassage(byId.get(id)))).size, 1);
    const previous = answerPractice(Core.createState(), samePassage, Array(5).fill(true), knownTime);
    const restored = Backup.parse(Backup.serialize(previous), questions);
    equal(restored.attempts.map(({ questionId, correct }) => [questionId, correct]), previous.attempts.map(({ questionId, correct }) => [questionId, correct]));
    equal(Learning.englishProfile(restored).reading.level, 'A1');
    equal(Learning.englishProfile(restored).reading.evidence, 1);
    const at = new Date(laterTime);
    const report = Coach.report(restored, questions, 7, at);
    equal(report.topics.reading.passages, 1);
    equal(report.topics.reading.correct, 5);

    const fresh = ['en-r01', 'en-r02', 'b400-english-r-library-card-2', 'b400-english-r-blue-route-4'];
    const advanced = answerPractice(restored, fresh, [true, false, true, true], laterTime);
    equal(Learning.englishProfile(advanced).reading.level, 'A2');
    equal(Learning.englishProfile(advanced).grammar.level, 'A1');
    equal(Learning.englishProfile(advanced).reading.lastBatch, { level: 'A1', correct: 4, independent: 4, total: 5 });
    const requested = Learning.practiceIds(answerPractice(Core.createState(), samePassage.slice(0, 1), [true]),
      { subject: 'english', topic: 'reading', level: 'A1' }, () => 0.5);
    const passages = requested.map(id => Core.readingPassage(byId.get(id)));
    equal(new Set(passages.slice(0, 6)).size, 6);
    assert(!passages.slice(0, 6).includes('reading-lost-cap'));
    assert(passages.includes('reading-lost-cap'));
  });

  await test('同篇文章的复习、专项或旧作答不会占用当前等级的有效阅读练习', () => {
    const [first, second] = ['b400-english-r-lost-cap-1', 'b400-english-r-lost-cap-2'];
    const works = ['lesson-evidence-lost-cap-3', first];
    for (const [id, mode] of [[first, 'review'], [works[0], 'practice']]) {
      let state = Core.startSession(Core.createState(), questions, { subject: 'english', ids: [id], mode, count: 1 });
      state = Core.advanceSession(Core.gradeAnswer(state, questions, byId.get(id).answer, knownTime), questions, knownTime);
      state = answerPractice(state, [second], [true], laterTime);
      equal(Learning.englishProfile(state).reading.evidence, 1);
    }
    const previous = answerPractice(Core.createState(), [first], [true], knownTime);
    const newBaseline = { level: 'A1', completedAt: new Date(2026, 3, 2, 14).toISOString() };
    equal(Learning.englishProfile(answerPractice(previous, [second], [true], laterTime), newBaseline).reading.evidence, 1);
  });

  await test('英语填空接受标点、大小写和经过核对的写法，缩写仅在题目允许时等价', () => {
    const field = byId.get('fill-english-reading-details-1').fields[0];
    equal(Core.evaluateField(field, '“Ｔｕｅｓｄａｙ。”').correct, true);
    equal(Core.evaluateField(field, 'Tue.').correct, false);
    equal(Core.evaluateField({ ...field, accepted: ['Tue.'] }, 'TUE').correct, true);
    const phrase = { type: 'text', expected: 'have not', accepted: ["haven't"] };
    equal(Core.evaluateField(phrase, '  HAVE   NOT. ').correct, true);
    equal(Core.evaluateField(phrase, 'Haven’t').correct, true);
    equal(Core.evaluateField(phrase, 'havent').correct, false);
    equal(Core.evaluateField(phrase, 'x'.repeat(97)), null);
    const original = byId.get('fill-english-opposites-8');
    const revised = byId.get(original.id + '@2');
    assert(original.retired && !revised.retired);
    equal(Core.evaluateField(original.fields[0], 'dim').correct, false);
    equal(Core.evaluateField(revised.fields[0], 'DIM.').correct, true);
  });

  await test('英语近期错题触发对应知识点建议，订正后从建议移除', () => {
    const now = new Date(2026, 3, 4, 9);
    let state = answerPractice(Core.createState(), ['en-v01', 'en-v07', 'en-g01'], [false, false, false]);
    equal(Learning.englishRecommendations(state, now), [{ topic: 'vocabulary', count: 2 }, { topic: 'grammar', count: 1 }]);
    state = answerPractice(state, ['en-v01'], [true], new Date(2026, 3, 4, 8).toISOString());
    equal(Learning.englishRecommendations(state, now)[0], { topic: 'vocabulary', count: 1 });
    equal(Learning.englishRecommendations(state, new Date(2026, 3, 23, 12)), []);
  });

  await test('新题优先，各匹配领域轮换且题目不重复', () => {
    const state = answerPractice(Core.createState(), ['en-v01'], [true]);
    const ids = Learning.practiceIds(state, { subject: 'english', level: 'A1' }, () => 0.2);
    equal(ids.at(-1), 'en-v01');
    equal(new Set(ids).size, ids.length);
    equal(new Set(ids.slice(0, 3).map(id => byId.get(id).topic)).size, 3);
  });

  await test('真实新版读写保留提示、选定等级、记录和未完成题目', () => {
    const ids = mathIds('functions', 'L2', 2);
    let state = Core.updatePreferences(Core.createState(), { englishLevel: 'B2', ieltsTarget: '6.5', mathPlacementDeferred: true });
    state = start({ ids, count: 2 }, state);
    state = answerCurrent(Core.revealHint(state, questions));
    const copy = Core.normalizeState(JSON.parse(JSON.stringify(state)), questions);
    equal(copy, state);
    equal(Core.gradeAnswer(copy, questions, 0).attempts.length, 1);
  });

  await test('旧版迁移保留原始作答、成绩、语言、错题和未完练习', () => {
    const legacy = oldRecord();
    const state = Core.normalizeState(legacy, questions);
    equal(state.version, Core.VERSION);
    equal(state.language, 'en');
    equal(state.attempts.map(item => [item.questionId, item.choice, item.correct, item.hinted]), [
      ['en-g01', 0, false, null], ['ma-a01', 1, true, null]
    ]);
    equal(state.sessions.length, 1);
    const savedSession = state.sessions[0];
    for (const [field, value] of Object.entries(legacy.sessions[0])) equal(savedSession[field], value);
    equal(state.active.answers, { 'ma-a01': 1 });
    equal(Core.getMistakes(state, questions)[0].question.id, 'en-g01');
    equal(Learning.mathProfile(state).algebra.evidence, 0);
  });

  await test('修订题重排选项时，v8 备份、原分数和未完练习沿用原题版本', () => {
    const previous = byId.get('en-v08');
    const revised = byId.get('en-v08@2');
    assert(previous.retired && revised.originalId === previous.id && revised.version === 2);
    equal(Core.evaluateAnswer(previous, 0).correct, true);
    equal(Core.evaluateAnswer(revised, 0).correct, false);
    equal(Core.evaluateAnswer(revised, 1).correct, true);
    const activeCatalog = questions.filter(question => question.id !== previous.id);
    const { retired, ...oldQuestion } = previous;
    const oldCatalog = [...activeCatalog, oldQuestion];
    let state = Core.startSession(Core.createState(), oldCatalog, { subject: 'english', ids: [previous.id], count: 1 });
    state = Core.gradeAnswer(state, oldCatalog, 0, knownTime);
    state = Core.advanceSession(state, oldCatalog, knownTime);
    const legacy = Core.startSession(state, oldCatalog, { subject: 'english', ids: [previous.id], count: 1 });
    const imported = Backup.parse(Backup.serialize(legacy), questions);
    equal(imported, Core.normalizeState(legacy, oldCatalog));
    equal(Backup.merge(imported, imported, questions), imported);
    const resumed = Core.gradeAnswer(imported, questions, 0, laterTime);
    equal(Core.advanceSession(resumed, questions, laterTime).sessions.map(session => session.correct), [1, 1]);
    const next = Learning.practiceIds(imported, { subject: 'english', topic: 'vocabulary', level: revised.level });
    assert(next.includes(revised.id) && !next.includes(previous.id));
    equal(Core.chooseQuestions(questions, { subject: 'english', ids: [previous.id, revised.id] }), [revised.id]);
    equal(Coach.learningPlan({ ...resumed, active: null }, questions, new Date(laterTime)).bankReview, null);
    const values = new Map([[key, JSON.stringify(state)]]);
    const storage = { getItem: name => values.get(name) ?? null };
    const pending = Core.readState(storage, key, [], activeCatalog);
    equal(pending.unavailable.attempts.map(attempt => attempt.questionId), [previous.id]);
    equal(Backup.parse(Backup.serialize(pending), questions), Core.normalizeState(state, questions));
    equal(JSON.parse(values.get(key)), state);
  });


  await test('新版可读 v4 与更早资料，旧版备份保持完整', () => {
    const legacyJson = JSON.stringify(oldRecord());
    const previous = JSON.stringify({ ...oldRecord(), version: 2, language: 'zh' });
    const data = new Map([[legacyKey, legacyJson]]);
    const storage = { getItem: name => data.get(name) ?? null, setItem: (name, value) => data.set(name, value) };
    equal(Core.readState(storage, key, [previousKey, legacyKey], questions).language, 'en');
    data.set(previousKey, previous);
    const v3 = JSON.stringify({ ...oldRecord(), version: 3, language: 'en', generated: [] });
    data.set(v3Key, v3);
    const v4 = JSON.stringify({ ...oldRecord(), version: 4, language: 'zh', generated: [] });
    data.set(v4Key, v4);
    const migrated = Core.readState(storage, key, [v4Key, v3Key, previousKey, legacyKey], questions);
    equal(migrated.language, 'zh');
    equal(migrated.active.id, 'old-active');
    Core.saveState(storage, key, migrated);
    equal(data.get(legacyKey), legacyJson);
    equal(data.get(previousKey), previous);
    equal(data.get(v3Key), v3);
    equal(data.get(v4Key), v4);
    equal(Core.readState(storage, key, [previousKey, legacyKey], questions), migrated);
    data.set(key, '{damaged');
    throws(() => Core.readState(storage, key, [previousKey, legacyKey], questions));
    equal(data.get(key), '{damaged');
  });

  await test('损坏数据不会导致重复计分、非法作答或跳过未答题', () => {
    const state = answerCurrent(start());
    state.active.index = 99;
    state.attempts.push({ ...state.attempts[0] }, { questionId: 'missing' }, { ...state.attempts[0], sessionId: 'bad', choice: 99 });
    const restored = Core.normalizeState(state, questions);
    equal(restored.attempts.length, 1);
    equal(restored.active.index, 1);
    throws(() => Core.normalizeState({ version: 99, attempts: [], sessions: [] }, questions));
  });

  await test('旧学习记录中的未知题逐条暂存，已知作答可继续保存和合并，匹配题库后恢复', () => {
    const question = byId.get('fill-english-present-simple-1');
    const partial = questions.filter(item => item.id !== question.id);
    const known = byId.get('en-g01');
    const options = { subject: 'english', ids: [known.id, question.id], count: 2 };
    let state = start(options);
    state = Core.advanceSession(Core.gradeAnswer(state, questions, known.answer, knownTime), questions, knownTime);
    state = Core.advanceSession(Core.gradeAnswer(state, questions, [question.fields[0].expected], knownTime), questions, knownTime);
    state = Core.flagQuestion(start(options, state), question, 'answer', knownTime);
    state = Core.advanceSession(Core.gradeAnswer(state, questions, known.answer, laterTime), questions, laterTime);
    const v8 = 'smart-study.tests.v8';
    const saved = JSON.stringify({ ...state, version: 8 });
    const values = new Map([[v8, saved]]);
    const storage = { getItem: name => values.get(name) ?? null, setItem: (name, value) => values.set(name, value) };
    const pending = Core.readState(storage, key, [v8], partial);
    equal(pending.attempts.map(attempt => attempt.questionId), [known.id, known.id]);
    equal(Core.reportableAttempts(pending).length, 2);
    equal(pending.active, null);
    equal(pending.sessions, []);
    equal(pending.unavailable.attempts.map(attempt => Core.responseOf(attempt)), [[question.fields[0].expected]]);
    equal(pending.unavailable.active[0].id, state.active.id);
    equal(pending.unavailable.flags, state.flags);
    const local = answerPractice(pending, ['ma-a01'], [true]);
    Core.saveState(storage, key, local);
    equal(values.get(v8), saved);
    const reloaded = Core.readState(storage, key, [v8], partial);
    equal(reloaded.attempts.length, 3);
    const rawImport = Backup.parse(saved, partial);
    const combined = Backup.merge(reloaded, rawImport, partial);
    const reimport = Backup.parse(Backup.serialize(combined), partial);
    equal(reimport, reloaded);
    const recovered = Backup.parse(Backup.serialize(combined), questions);
    equal(recovered.unavailable, undefined);
    equal(recovered.attempts.length, 4);
    assert(recovered.sessions.some(session => session.id === state.sessions[0].id && session.correct === 2));
    equal(recovered.active, state.active);
    equal(recovered.flags, state.flags);
    const inProgress = start({ ids: ['ma-a01'], count: 1 }, reloaded);
    const twoSets = Core.normalizeState(inProgress, questions);
    equal(twoSets.active.id, inProgress.active.id);
    equal(twoSets.unavailable.active[0], state.active);
    const finished = Core.advanceSession(answerCurrent(twoSets), questions, laterTime);
    equal(Core.normalizeState(finished, questions).active, state.active);
  });

  await test('两道快速错答让系统多收集证据，慢答和已存历史不会因速度降级', () => {
    const ids = mathIds('functions', 'L2', 5);
    let state = start({ ids, count: ids.length });
    ids.forEach((id, index) => {
      const question = byId.get(id);
      const choice = index === 0 ? question.answer : (question.answer + 1) % 4;
      state = Core.advanceSession(Core.gradeAnswer(state, questions, choice, knownTime, index < 3 ? 800 : 25_000), questions, knownTime);
    });
    const row = Learning.mathProfile(Core.normalizeState(state, questions)).functions;
    equal(row.level, 'L2');
    equal(row.lastBatch.pacedRecheck, true);
    equal(state.attempts[2].durationMs, 800);
  });

  await test('日报、周报和月报用真实样本，过去无计时的记录不会补造学习时长', () => {
    const now = new Date(2026, 5, 1, 13);
    const date = (day, hour = 9) => new Date(2026, 4, day, hour).toISOString();
    const ids = ['ma-a01', 'ma-n01', 'en-g01'];
    let state = Core.createState();
    for (const [index, at, choice, duration] of [[0, date(23), 1], [1, date(31), 0, 36_000], [2, date(32), 1, 20_000], [2, date(32, 14), 0, 15_000]]) {
      const question = byId.get(ids[index]);
      state = start({ subject: question.subject, ids: [question.id], count: 1 }, state);
      state = Core.advanceSession(Core.gradeAnswer(state, questions, choice, at, duration), questions, at);
    }
    const weekly = Coach.report(state, questions, 7, now);
    equal(weekly.recent, { total: 2, correct: 1, accuracy: 50, distinct: 2, timed: 2, durationMs: 56_000 });
    equal(weekly.previous.total, 1);
    equal(weekly.previous.timed, 0);
    equal(weekly.errors, [{ focus: 'common-denominator', attempts: 1, distinct: 1, kinds: [] }]);
    equal(Coach.report(state, questions, 30, now).recent.total, 3);
    equal(Coach.report(state, questions, 1, now).recent.accuracy, 100);
    equal(Coach.report(Core.createState(), questions, 30, now).recent.accuracy, null);
  });

  await test('报告优先显示来自不同题的线索，不因一题反复答错而挤到最前', () => {
    const now = new Date(2026, 5, 1, 13);
    let state = Core.createState();
    const science = Science.questions.filter(item => item.subject === 'physics' && item.role === 'practice'
      && Object.values(item.errorKinds).includes('denominator'));
    const distinct = science.filter(item => item.topic === science[0].topic).slice(0, 2);
    const repeated = byId.get('ma-n01');
    for (const [index, item] of [repeated, repeated, repeated, ...distinct].entries()) {
      const at = new Date(now.getTime() - (10 - index) * 1000).toISOString();
      const choice = item === repeated ? 0 : Number(Object.keys(item.errorKinds).find(key => item.errorKinds[key] === 'denominator'));
      state = start({ subject: item.subject, ids: [item.id], count: 1 }, state);
      state = Core.advanceSession(Core.gradeAnswer(state, questions, choice, at), questions, at);
    }
    const { errors } = Coach.report(state, questions, 7, now);
    equal(errors[0], { focus: distinct[0].topic, attempts: 2, distinct: 2, kinds: [['denominator', 2]] });
    equal(errors[1].distinct, 1);
  });

  await test('计划以到期复习、近期练习、目标和可用时间作动态调整', () => {
    const now = new Date(2026, 3, 3, 12);
    const plan = Core.normalizePlan({ enabled: true, goal: 'math', topic: 'algebra', minutes: 10, deadline: '2026-04-06' });
    equal(Core.normalizePlan({ ...plan, deadline: '2026-02-30' }).deadline, '');
    const studied = focusedRound({ ...Core.createState(), plan }, 'coefficient', 'retake', knownTime);
    const before = Coach.learningPlan(studied, questions, new Date(2026, 3, 2, 11));
    const due = Coach.learningPlan(studied, questions, now);
    equal(before.week.length, 7);
    equal(before.weeks.at(-1).to, '2026-05-01');
    equal(before.week[1].scheduled, [{ focus: 'coefficient', date: '2026-04-03' }]);
    equal(due.review[0], { focus: 'coefficient', mode: 'spaced', count: 1 });
    equal(due.practice.topic, 'algebra');
    assert(due.practice.count <= 4 && due.deadlineSoon);
    const finished = focusedRound(studied, 'coefficient', 'spaced', laterTime);
    const next = Coach.learningPlan(finished, questions, now);
    equal(next.dueCount, 0);
    assert(next.slots < due.slots);
    equal(Coach.learningPlan({ ...studied, plan: { ...plan, goal: 'english', topic: 'grammar' } }, questions, now).review.length, 0);
  });

  await test('计划标明暂缺新题的复测项目，已练旧题不作为新题派发', () => {
    const now = new Date(2026, 3, 3, 12);
    const plan = Core.normalizePlan({ enabled: true, goal: 'math', topic: 'algebra', minutes: 15 });
    let state = { ...Core.createState(), plan };
    const used = questions.filter(item => item.variant && item.focus.includes('coefficient'));
    assert(used.length > 0);
    for (const question of used) {
      state = start({ subject: question.subject, ids: [question.id], count: 1 }, state);
      state = Core.advanceSession(Core.gradeAnswer(state, questions, question.answer, knownTime), questions, knownTime);
    }
    state = start({ subject: 'math', ids: ['ma-a01'], count: 1 }, state);
    state = Core.advanceSession(Core.gradeAnswer(state, questions, 3, now.toISOString()), questions, now.toISOString());
    const calculated = Coach.learningPlan(state, questions, now);
    equal(calculated.unavailableReview, ['coefficient']);
    equal(calculated.review, []);
    equal(calculated.practice.topic, 'algebra');
  });

  await test('无配置时即有八分钟计划；当天按真实答题数前进，不会改写学习设置', () => {
    const now = new Date(2026, 3, 2, 11);
    let state = Core.createState();
    const initial = Coach.learningPlan(state, questions, now);
    equal([initial.settings.minutes, initial.target, initial.completed, initial.practice.count], [8, 5, 0, 5]);
    state = start({ ids: ['ma-a01'], count: 1 }, state);
    state = answerCurrent(state, true, knownTime);
    const partial = Coach.learningPlan(state, questions, now);
    equal([partial.target, partial.completed, partial.slots], [5, 1, 4]);
    equal(state.plan, null);
    equal(Coach.learningPlan(state, questions, new Date(2026, 3, 3, 11)).completed, 0);
  });

  await test('普通错题从当天开始间隔复习，带提示和提前重做不会推进间隔', () => {
    const item = questions.find(question => question.subject === 'math' && question.hint && !question.focusOnly
      && !question.diagnosticOnly && !Object.keys(question.errors || {}).length);
    let state = { ...Core.createState(), plan: Core.normalizePlan({ enabled: true, goal: 'math', topic: item.topic, minutes: 8 }) };
    const date = offset => new Date(2026, 3, 2 + offset, 10);
    const plan = offset => Coach.learningPlan(state, questions, date(offset));
    const answer = (offset, correct, hint = false) => {
      state = start({ subject: item.subject, ids: [item.id], count: 1, mode: 'review' }, state);
      if (hint) state = Core.revealHint(state, questions);
      state = Core.advanceSession(answerCurrent(state, correct, date(offset).toISOString()), questions, date(offset).toISOString());
    };
    answer(0, false);
    equal(plan(0).bankReview.ids, [item.id]);
    answer(0, true, true);
    equal(plan(0).bankReview, null);
    let day = 1;
    for (const interval of [1, 3, 7, 14, 30]) {
      equal(plan(day).bankReview.ids, [item.id]);
      answer(day, true);
      equal(plan(day).bankReview, null);
      answer(day, true);
      equal(plan(day + interval - 1).bankReview, null);
      day += interval;
    }
    answer(day, true, true);
    equal(plan(day).bankReview, null);
    day++;
    equal(plan(day).bankReview.ids, [item.id]);
    answer(day, false);
    equal(plan(day).bankReview.ids, [item.id]);
    const words = answerCurrent(start({ subject: 'english', ids: ['en-v01'], count: 1 }), false, knownTime);
    equal(Coach.learningPlan(words, questions, date(0)).bankReview.ids, ['en-v01']);
  });

  await test('知识路线只使用实际题目证据；前置知识追溯只显示已观察到的错因', () => {
    const now = new Date(2026, 3, 2, 11);
    const fresh = Coach.roadmap(Core.createState(), questions, 'chemistry', now);
    equal(fresh.find(row => row.id === 'amount-concentration').parent, 'mole-calculations');
    assert(fresh.every(row => !row.seen && !row.verified && !row.due));
    const wrong = answerCurrent(start({ ids: ['ma-a01'], count: 1 }), false, knownTime);
    const algebra = Coach.roadmap(wrong, questions, 'math', now).find(row => row.id === 'algebra');
    equal([algebra.parent, algebra.seen, algebra.verified], ['arithmetic', 1, 0]);
    equal(Coach.prerequisiteTrail('distribution', { coefficient: { status: 'possible' }, balance: { status: 'unassessed' } }), ['coefficient']);
    equal(Coach.prerequisiteTrail('distribution', { coefficient: { status: 'verified' }, balance: { status: 'scheduled' } }), []);
  });

  await test('九十天报告按周合并，空周无正确率，并比较前一个等长时段', () => {
    const today = new Date(2026, 6, 30, 12);
    let state = Core.createState();
    for (const [offset, correct] of [[-90, true], [-89, false], [0, true]]) {
      const at = new Date(2026, 6, 30 + offset, 10).toISOString();
      state = Core.advanceSession(answerCurrent(start({ ids: ['ma-a01'], count: 1 }, state), correct, at), questions, at);
    }
    const report = Coach.report(state, questions, 90, today);
    equal([report.recent.total, report.recent.correct, report.previous.total, report.daily.length], [2, 1, 1, 13]);
    equal(report.daily.reduce((sum, period) => sum + period.total, 0), 2);
    equal(report.daily[1].accuracy, null);
    equal(report.daily.at(-1).end, Core.localDate(today));
  });

  await test('备份兼容 v3，合并排序并保持幂等，冲突时保留两份原始作答', () => {
    const old = Core.startAiSession(Core.createState(), questions, 'L2', aiFixture);
    const oldCatalog = Core.questionsForState(questions, old);
    const graded = Core.gradeAnswer(old, oldCatalog, 0, knownTime);
    const migrated = Backup.parse(JSON.stringify({ ...graded, version: 3 }), questions);
    equal(migrated.generated.length, 3);
    equal(migrated.active.id, graded.active.id);
    equal(migrated.attempts.length, 1);
    equal(Backup.parse(Backup.serialize(migrated), questions), migrated);
    const recent = answerPractice(Core.createState(), ['ma-n01'], [true], laterTime);
    const earlier = answerPractice(Core.createState(), ['en-g01'], [false], knownTime);
    const combined = Backup.merge(recent, earlier, questions);
    equal(combined.sessions.map(session => session.completedAt), [knownTime, laterTime]);
    equal(combined.attempts.length, 2);
    equal(Backup.merge(combined, earlier, questions), combined);
    throws(() => Backup.merge(start(), migrated, questions));
    throws(() => Backup.parse(JSON.stringify({ ...migrated, attempts: [...migrated.attempts, { questionId: 'missing' }] }), questions));
    const conflicting = Core.startAiSession(Core.createState(), questions, 'L2', [{ ...aiFixture[0], distractors: [8, 9, 10] }, ...aiFixture.slice(1)]);
    throws(() => Backup.merge(migrated, conflicting, questions));
    equal(migrated.attempts[0].choice, 0);
  });

  await test('最近两周进度按本地日期分段，在月末依然正确', () => {
    const now = new Date(2026, 2, 2, 12);
    const earlier = new Date(2026, 1, 23, 23, 59).toISOString();
    const recent = new Date(2026, 1, 24, 0, 1).toISOString();
    let state = answerPractice(Core.createState(), ['en-g01'], [false], earlier);
    state = answerPractice(state, ['en-v01'], [true], recent);
    equal(Learning.topicProgress(state, now).grammar.previous, { total: 1, correct: 0 });
    equal(Learning.topicProgress(state, now).vocabulary.recent, { total: 1, correct: 1 });
    const daily = Core.dailyStats(state, now);
    equal(Core.localDate(daily[0].date), '2026-02-24');
    equal(daily[0].total, 1);
  });

  await test('AI 方程独立验算，拒绝错误难度、重复方程、分数解和重复选项', () => {
    const batch = AI.validateBatch(aiFixture, 'L2');
    const items = batch.map(AI.makeQuestion);
    equal(items.map(item => item.options[item.answer].en), ['4', '3', '-3']);
    assert(items.every(item => new Set(item.options.map(option => option.zh)).size === 4));
    assert(!AI.validateBatch(aiFixture, 'L1'));
    assert(!AI.validateBatch([aiFixture[0], aiFixture[0], aiFixture[2]], 'L2'));
    assert(!AI.validateBatch(aiFixture, 'L2', batch));
    assert(!AI.normalizeSpec({ ...aiFixture[0], d: 13 }, 'L2'));
    assert(!AI.normalizeSpec({ ...aiFixture[0], distractors: [3, 3, 6] }, 'L2'));
    assert(!AI.normalizeSpec({ ...aiFixture[0], distractors: [3, 4, 6] }, 'L2'));
    const grouped = AI.normalizeSpec({ a: 2, b: 3, c: 1, d: 11, form: 'grouped', distractors: [2, 3, 6] }, 'L3');
    const question = AI.makeQuestion(grouped);
    assert(question.prompt.en.includes('2(x + 3) = x + 11'));
    equal(question.options[question.answer].en, '5');
  });

  await test('已验算 AI 答题与普通练习共享证据，重复复习和同方程题族不补齐升阶样本', () => {
    const previous = answerPractice(Core.createState(), ['en-v01'], [true]);
    let state = Core.startAiSession(previous, questions, 'L2', aiFixture);
    const catalog = Core.questionsForState(questions, state);
    const first = catalog.find(question => question.id === state.active.questionIds[0]);
    state = Core.gradeAnswer(state, catalog, (first.answer + 1) % 4, laterTime);
    state = Core.normalizeState(JSON.parse(JSON.stringify(state)), questions);
    equal(state.active.mode, 'ai');
    equal(state.attempts.length, 2);
    equal(Core.getMistakes(state, Core.questionsForState(questions, state))[0].question, first);
    equal(Learning.topicProgress(state, new Date(2026, 3, 5)).algebra.total, 1);
    equal(Learning.mathProfile(state).algebra.evidence, 1);
    throws(() => Core.startAiSession(state, questions, 'L2', aiFixture));
    for (let index = 1; index < state.active.questionIds.length; index++) {
      state = Core.advanceSession(state, catalog, laterTime);
      const question = catalog.find(item => item.id === state.active.questionIds[index]);
      state = Core.gradeAnswer(state, catalog, question.answer, laterTime);
    }
    equal(Learning.mathProfile(state).algebra.equationEvidence, { independent: 1, total: 3 });
    equal(Learning.mathProfile(state).algebra.level, 'L2');
    state = Core.advanceSession(state, catalog, laterTime);
    state = answerPractice(state, ['ma-pr-algebra-L2-7@2', 'ma-pr-algebra-L2-9@2'], [true, true], laterTime);
    equal(Learning.mathProfile(state).algebra.level, 'L3');
  });

  await test('混合 AI 练习包含真实填空与分步计算，会精确验算分数和小数', () => {
    let state = Core.startAiSession(Core.createState(), questions, 'L2', aiFixture, 'mixed');
    const catalog = Core.questionsForState(questions, state);
    const [fill, calculation, choice] = state.active.questionIds.map(id => catalog.find(item => item.id === id));
    equal([fill.format, calculation.format, choice.format], ['fill', 'calculation', undefined]);
    equal([fill.fields.length, calculation.fields.length], [1, 2]);
    for (const response of [['8/2'], [' ４．０ '], ['−8 / −2'], ['+4']]) {
      assert(Core.evaluateAnswer(fill, response).correct);
    }
    assert(!Core.evaluateAnswer(fill, ['4.0000000000000001']).correct);
    for (const response of [[], [''], ['1/0'], ['4e0'], ['4+0'], ['⁴'], ['<script>'], 0]) {
      equal(Core.evaluateAnswer(fill, response), null);
      throws(() => Core.gradeAnswer(state, catalog, response));
    }
    state = Core.gradeAnswer(state, catalog, [' ８ / ２ '], knownTime);
    equal(state.attempts.at(-1).response, ['8/2']);
    equal(state.attempts.at(-1).choice, undefined);
    const restored = Backup.parse(Backup.serialize(state), questions);
    equal(restored.active.answers[fill.id], ['8/2']);
    equal(Core.gradeAnswer(restored, catalog, ['3'], knownTime), restored);
    state = Core.advanceSession(restored, catalog);
    equal(Core.evaluateAnswer(calculation, ['18.0', '7/2']).marks, [true, false]);
    state = Core.advanceSession(Core.gradeAnswer(state, catalog, ['18.0', '7/2'], knownTime), catalog);
    state = Core.advanceSession(Core.gradeAnswer(state, catalog, choice.answer, knownTime), catalog);
    equal(state.sessions.at(-1).correct, 2);
    equal(Core.getMistakes(state, catalog)[0].question.id, calculation.id);
    equal(Backup.merge(state, Backup.parse(Backup.serialize(state), questions), questions).attempts, state.attempts);
  });

  await test('旧 AI 选择题沿用原题号，免费样题可以换题型反复练且各题只存一次', () => {
    const old = Core.startAiSession(Core.createState(), questions, 'L2', aiFixture);
    const legacy = { ...old, version: 5 };
    const catalog = Core.questionsForState(questions, legacy);
    const first = catalog.find(item => item.id === old.active.questionIds[0]);
    const answered = Core.gradeAnswer(legacy, catalog, first.answer, knownTime);
    const migrated = Backup.parse(JSON.stringify(answered), questions);
    equal(migrated.active.questionIds, legacy.active.questionIds);
    equal(migrated.active.answers[first.id], first.answer);
    equal(migrated.attempts[0].correct, true);
    assert(!first.fields);
    for (const level of AI.LEVELS) {
      const initial = Core.startAlgebraSample(Core.createState(), questions, level, 'calculation');
      const repeat = Core.startAlgebraSample(initial, questions, level, 'calculation');
      equal(repeat.active.questionIds, initial.active.questionIds);
      equal(repeat.generated.length, 3);
      const filled = Core.startAlgebraSample(repeat, questions, level, 'fill');
      equal(filled.generated.length, 6);
      const samples = Core.questionsForState(questions, filled).filter(item => item.sample);
      assert(samples.length === 6 && samples.every(item => !item.ai && item.level === level));
      equal(Backup.parse(Backup.serialize(filled), questions).generated.length, 6);
    }
  });

  if (typeof document === 'undefined') {
    globalThis.SmartStudyTestResults = results;
    return;
  }

  function fitsViewport() {
    assert(document.documentElement.scrollWidth <= window.innerWidth,
      `Overflow ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
  }

  function element(selector) {
    const found = document.querySelector(selector);
    assert(found, `Missing ${selector}`);
    return found;
  }

  function headingLeft() {
    return element('#main > .page-heading:first-child h1').getBoundingClientRect().left;
  }

  function click(selector) {
    const target = element(selector);
    assert(!target.disabled, `Disabled ${selector}`);
    target.click();
  }

  function change(id, value) {
    const target = element('#' + id);
    target.value = value;
    equal(target.value, value);
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function waitFor(condition, message) {
    const started = Date.now();
    while (!condition()) {
      if (Date.now() - started > 2500) throw new Error(message);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  const waitElement = selector => waitFor(() => document.querySelector(selector), `Missing ${selector}`);
  const read = () => Core.readState(localStorage, key, [v6Key, v5Key, v4Key, v3Key, previousKey, legacyKey], questions);
  const replayStorage = name => window.dispatchEvent(new StorageEvent('storage', { key: name }));
  const current = () => {
    const state = read();
    return Core.questionsForState(questions, state).find(item => item.id === state.active.questionIds[state.active.index]);
  };
  const submitForm = () => click('#practice-form button[type="submit"]');

  async function go(hash, selector) {
    location.hash = hash;
    await waitElement(selector);
  }

  async function resetUi() {
    localStorage.removeItem(key);
    localStorage.removeItem(v6Key);
    localStorage.removeItem(v5Key);
    localStorage.removeItem(v4Key);
    localStorage.removeItem(v3Key);
    localStorage.removeItem(previousKey);
    localStorage.removeItem(legacyKey);
    replayStorage(key);
    await go('home', '.subject-grid');
  }

  async function openSubject(subject) {
    await go('home', '.subject-grid');
    click(`.subject-card [data-subject="${subject}"]`);
    await waitElement('#practice-form');
    equal(element('#subject').value, subject);
  }

  await test('五科知识路线显示试点步骤、前置技能和真实审核状态', async () => {
    await resetUi();
    await go('plan', '#pilot-path');
    change('language', 'zh');
    for (const { id } of subjects) {
      click(`[data-action="roadmap-subject"][data-subject="${id}"]`);
      const route = globalThis.EachVeyaPilot.routes[id];
      const panel = element('#pilot-path');
      assert(panel.querySelector('h3').textContent.includes(topics[route.topic].zh), id);
      assert(panel.textContent.includes('已通过 DeepSeek 复核和程序核对'), id);
      equal([...panel.querySelectorAll('[data-pilot-stage] strong')].map(node => node.textContent),
        ['起点测评', '分步讲解', '专项练习', '隔天复测', '第 7 天复测']);
      equal([...panel.querySelectorAll('[data-action="pilot-start"]')].map(node => node.dataset.stage), ['entry']);
    }
    change('language', 'en');
    assert(element('#pilot-path').textContent.includes('Day 7 check'));
    assert(element('#pilot-path').textContent.includes('DeepSeek review and automated answer checks are complete'));
    fitsViewport();
    await resetUi();
  });

  await test('五科试点验证题独立登记，跨午夜开放，新题不同并可从备份恢复', () => {
    const Pilot = globalThis.EachVeyaPilot;
    const local = (day, hour = 10, minute = 0) => new Date(2026, 3, day, hour, minute);
    const response = (q, wrong) => q.fields
      ? q.fields.map((f, i) => String(f.expected + Number(wrong && i === 0)))
      : (q.answer + Number(wrong)) % q.options.length;
    const finish = (state, at, wrong = false) => {
      while (state.active) {
        const q = byId.get(state.active.questionIds[state.active.index]);
        equal(Core.revealHint(state, questions), state);
        if (!Object.hasOwn(state.active.answers, q.id)) state = Core.gradeAnswer(state, questions, response(q, wrong), at.toISOString());
        state = Core.advanceSession(state, questions, at.toISOString());
      }
      return state;
    };
    for (const path of Object.values(Pilot.routes)) {
      const [entry, example, practice, nextDay, week] = path.stages;
      const startStage = (state, stage, at) => Pilot.start(state, questions, path, stage, at);
      let state = Core.createState();
      const reserved = entry.items[0].questionId;
      throws(() => Core.startSession(state, questions, { subject: path.subject, ids: [reserved], count: 1 }));
      throws(() => startStage(state, practice, local(2)));
      state = startStage(state, entry, local(2));
      state = Core.gradeAnswer(state, questions, response(byId.get(reserved), true), local(2).toISOString());
      const sessionId = state.active.id;
      const reopened = startStage(Backup.parse(Backup.serialize({ ...state, active: null }), questions), entry, local(2));
      equal(reopened.active.id, sessionId);
      equal(reopened.active.answers, state.active.answers);
      state = finish(reopened, local(2));
      state = finish(startStage(state, example, local(2)), local(2));
      state = finish(startStage(state, practice, local(2, 23, 59)), local(2, 23, 59));
      const before = Pilot.progress(state, path, local(2, 23, 59));
      equal(before[3].due, '2026-04-03');
      assert(!before[3].ready && !before[4].ready);
      throws(() => startStage(state, nextDay, local(2, 23, 59)));
      throws(() => startStage(state, week, local(9)));
      const late = finish(startStage(state, nextDay, local(12)), local(12));
      equal(Pilot.progress(late, path, local(12))[4].due, '2026-04-13');
      state = finish(startStage(state, nextDay, local(3, 0)), local(3, 0));
      assert(!Pilot.progress(state, path, local(8, 23, 59))[4].ready);
      state = finish(startStage(state, week, local(9, 0)), local(9, 0));
      const rows = Pilot.progress(Backup.parse(Backup.serialize(state), questions), path, local(9));
      equal(rows.map(row => row.session.correct), [0, 1, 2, 1, 1]);
      equal(new Set(state.attempts.map(row => row.questionId)).size, 6);
      equal(Core.reportableAttempts(state), []);
      assert(rows.every(row => !row.ready));
      throws(() => startStage(state, entry, local(9)));
    }
  });

  await test('试点网页从起点错步走到隔天及第七天复测，报告显示真实作答', async () => {
    const Pilot = globalThis.EachVeyaPilot;
    const path = Pilot.routes.math;
    const [entry, example, practice, nextDay] = path.stages;
    const back = '[data-action="pilot-path"][data-subject="math"]';
    const stage = id => `#pilot-path [data-stage="${id}"]`;
    await resetUi();
    await go('plan', '#pilot-path');
    click('[data-action="roadmap-subject"][data-subject="math"]');
    click(stage('entry'));
    await waitElement('#numeric-1');
    assert(!document.querySelector('[data-action="hint"], .worked-example'));
    byId.get(entry.items[0].questionId).fields.forEach((field, i) => {
      element('#numeric-' + i).value = String(field.expected + Number(i === 1));
    });
    click('button[form="numeric-answer-form"]');
    assert(!document.querySelector('.answer-line, .numeric-mark'));
    await finishQuestions(() => false);
    click(back);
    await waitElement(stage('lesson'));
    click(stage('lesson'));
    await waitElement('.worked-example');
    assert(element('.worked-example').textContent.includes('第一步正确'));
    await finishQuestions(() => true);
    assert(!document.querySelector('.result-score'));
    click(back);
    await waitElement(stage('practice'));
    click(stage('practice'));
    await waitElement('#numeric-1');
    await finishQuestions(() => true);
    click(back);
    await waitElement('[data-pilot-stage="next-day"]');
    assert(!document.querySelector(stage('next-day')));

    function past(day) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 12);
    }
    let saved = Core.createState();
    for (const [step, at] of [[entry, past(7)], [example, past(7)], [practice, past(7)], [nextDay, past(6)]]) {
      saved = Pilot.start(saved, questions, path, step, at);
      while (saved.active) {
        const q = byId.get(saved.active.questionIds[saved.active.index]);
        const response = q.fields.map(field => String(field.expected));
        saved = Core.advanceSession(Core.gradeAnswer(saved, questions, response, at.toISOString()), questions, at.toISOString());
      }
    }
    Core.saveState(localStorage, key, saved);
    replayStorage(key);
    click(stage('day-seven'));
    await waitElement('#numeric-1');
    assert(!document.querySelector('[data-action="hint"], .worked-example'));
    await finishQuestions(() => true);
    await go('report', '#pilot-report-title');
    equal([...element('[data-pilot-report="math"]').querySelectorAll('li strong')].map(node => node.textContent),
      ['起点测评', '隔天复测', '第 7 天复测']);
    assert([...element('[data-pilot-report="math"]').querySelectorAll('li')].every(node => node.textContent.includes('独立答对 1/1 题')));
    fitsViewport();
    await resetUi();
  });

  async function answerUi(correct) {
    const item = current();
    if (item.fields) {
      item.fields.forEach((field, index) => {
        element(`#numeric-${index}`).value = correct || index ? String(field.expected)
          : field.type === 'text' ? 'incorrect answer' : Number.isInteger(field.expected) ? String(field.expected + 1) : '0';
      });
      click('button[form="numeric-answer-form"]');
    } else {
      const answer = correct ? item.answer : (item.answer + 1) % 4;
      click(`[data-choice="${answer}"]`);
      click('[data-action="grade"]');
    }
    await waitElement('.feedback');
  }

  await test('页面隔离未知题后仍能续做已知练习，并在提交后保留旧记录', async () => {
    await resetUi();
    const saved = answerPractice(Core.createState(), ['en-g01'], [false]);
    const future = { ...saved.attempts[0], questionId: 'future-question-id', sessionId: 'future-session' };
    const active = start({ ids: ['ma-a01'], count: 1 }, { ...saved, attempts: [...saved.attempts, future] });
    Core.saveState(localStorage, key, { ...active, version: 8 });
    replayStorage(key);
    const notice = element('#storage-notice');
    assert(!notice.hidden && notice.textContent.includes('部分学习记录待恢复'));
    equal(Core.getMistakes(read(), questions).map(entry => entry.question.id), ['en-g01']);
    await go('practice', '#question-title');
    await finishQuestions(() => true);
    const reloaded = read();
    equal(reloaded.attempts.length, 2);
    equal(reloaded.unavailable.attempts[0], future);
    assert(reloaded.sessions.some(session => session.id === active.active.id));
    await resetUi();
  });

  await test('AI 方程系数为 1 时直接读出 x，其他系数继续说明除法', () => {
    const unit = AI.sampleBatch('L1')[0];
    const reducedUnit = AI.normalizeSpec({ a: 4, b: 2, c: 3, d: 6, form: 'plain', distractors: [1, 2, 3] }, 'L3');
    for (const spec of [unit, reducedUnit]) {
      const item = AI.makeQuestion(spec);
      assert(!item.explanation.zh.includes('除以') && !item.explanation.en.includes('Divide'));
      assert(item.explanation.zh.includes('x = ' + AI.solution(spec)));
    }
    assert(AI.makeQuestion(aiFixture[0]).explanation.zh.includes('除以 3'));
  });

  await test('英语原形填空显示自然标签和答案，不出现等号', async () => {
    await resetUi();
    const item = questions.find(q => q.id.startsWith('fill-english-present-simple-')
      && !q.retired && q.fields[0].expected === 'have');
    const seeded = start({ subject: 'english', ids: [item.id], count: 1 });
    Core.saveState(localStorage, key, seeded);
    replayStorage(key);
    await go('practice', '#numeric-0');
    equal(element('label[for="numeric-0"]').textContent, '在此填空');
    equal(element('#numeric-0').getAttribute('inputmode'), null);
    await answerUi(false);
    equal(element('.answer-line').textContent, '正确答案为 have');
    click('[data-action="next"]');
    await waitElement('.result-row');
    assert(!element('.result-row').textContent.includes('答案 = have'));
    await resetUi();
  });

  await test('五科可从普通练习挑选填空；英文自由作答与等值分数可批改、保存及复习', async () => {
    for (const { id } of subjects) {
      const preview = Learning.practicePool(Core.createState(), { subject: id, level: levels[id][0], format: 'fill' });
      const mixed = Learning.practicePool(Core.createState(), { subject: id, level: levels[id][0], format: 'all' });
      assert(preview.length > 0 && preview.every(item => item.fields), id);
      assert(mixed.some(item => !item.fields) && mixed.some(item => item.fields), id);
    }
    await resetUi();
    await openSubject('english');
    change('format', 'fill');
    change('difficulty', 'A1');
    submitForm();
    await waitElement('#numeric-0');
    const item = current();
    equal(item.format, 'fill');
    click('button[form="numeric-answer-form"]');
    assert(!element('#numeric-error').hidden);
    equal(read().attempts.length, 0);
    element('#numeric-0').value = '  ' + item.fields[0].expected.toUpperCase() + '  ';
    click('button[form="numeric-answer-form"]');
    await waitElement('.feedback');
    equal(read().attempts[0].correct, true);
    replayStorage(key);
    equal(read().attempts[0].response, [item.fields[0].expected.toUpperCase()]);
    click('[data-action="next"]');
    await waitFor(() => current().id !== item.id, 'The next fill-in item did not load');
    await answerUi(false);
    const missed = current();
    await go('mistakes', '.mistake-card');
    assert(Core.getMistakes(read(), questions).some(entry => entry.question.id === missed.id));

    const fraction = byId.get('fill-math-different-colours-1');
    equal(Core.evaluateAnswer(fraction, ['8/15']).correct, true);
    equal(Core.evaluateAnswer(fraction, ['1/0']), null);
    equal(Core.evaluateAnswer(fraction, ['0.53']).correct, false);
    const english = byId.get('fill-english-formal-word-form-10');
    equal(Core.evaluateAnswer(english, ['ACKNOWLEDGEMENT']).correct, true);
    await resetUi();
    await openSubject('math');
    click('[data-action="skip-placement"]');
    change('topic', 'statistics');
    change('difficulty', 'L5');
    change('format', 'fill');
    submitForm();
    await waitElement('#numeric-0');
    equal(element('#numeric-0').getAttribute('inputmode'), 'decimal');
    const [numerator, denominator] = current().fields[0].expected.split('/').map(Number);
    element('#numeric-0').value = `${numerator * 2}/${denominator * 2}`;
    click('button[form="numeric-answer-form"]');
    await waitElement('.feedback');
    equal(read().attempts[0].correct, true);
    fitsViewport();
    await resetUi();
    await openSubject('english');
    change('format', 'choice');
    await resetUi();
  });

  async function finishQuestions(shouldGetRight) {
    const initial = read().active;
    for (let index = initial.index; index < initial.questionIds.length; index++) {
      const item = current();
      if (read().active.answers[item.id] === undefined) await answerUi(shouldGetRight(item, index));
      click('[data-action="next"]');
    }
    await waitElement('.result-panel');
    equal(read().active, null);
  }

  await resetUi();
  await test('首页说明平台面向中学生，语言切换更新介绍、品牌和导航', () => {
    equal(document.documentElement.lang, 'zh-CN');
    assert(element('.stats-grid').textContent.includes('暂无数据'));
    equal(element('#brand').getAttribute('aria-label'), 'EachVeya 学验共途');
    assert(!element('#brand-local-name').hidden);
    assert(document.title.includes('EachVeya 学验共途'));
    equal(element('main h1').textContent, 'EachVeya 学验共途');
    assert(element('.page-heading .subtitle').textContent.includes('英语、数学、物理、化学与生物'));
    assert(element('.hero-copy p').textContent.includes('解析'));
    change('language', 'en');
    equal(document.documentElement.lang, 'en');
    equal(element('#brand').getAttribute('aria-label'), 'EachVeya');
    assert(element('#brand-local-name').hidden);
    equal(document.title, 'Overview · EachVeya');
    assert(element('#navigation').textContent.includes('Progress'));
    equal(element('main h1').textContent, 'EachVeya');
    assert(element('.page-heading .subtitle').textContent.includes('English and mathematics practice for secondary school students'));
    assert(element('.hero-copy p').textContent.includes('an explanation'));
    fitsViewport();
  });

  await test('学习记录为空时只显示一条提示，并与首页标题左对齐', async () => {
    const left = headingLeft();
    await go('records', '#main > .records-note');
    equal(headingLeft(), left);
    equal(element('#main > .records-note').textContent, 'Not started yet');
    assert(!document.querySelector('.records-section, .topic-record'));
    change('language', 'zh');
    equal(element('#main > .records-note').textContent, '还没开始');
    change('language', 'en');
    fitsViewport();
  });

  await test('五科均可从双语典型题直接热身，热身不产生起点评级，测评后按领域推荐练习', async () => {
    const keys = { math: ['12','3x + 4 = 25'], physics: ['m/s','15 min'], chemistry: ['Salt','10/100 × 100%'],
      biology: ['Carbon dioxide','Light helps the leaf accumulate starch'], english: ['4:15','Outside the library'] };
    for (const { id } of subjects) {
      await resetUi();
      await openSubject(id);
      const pair = globalThis.EachVeyaLessons.starterPairs[id];
      equal(pair.map(q => q.options[q.answer].en), keys[id]);
      assert(element('.starter-pair').open && pair.every(q => element('.starter-pair').textContent.includes(q.prompt.zh)));
      change('language', 'en');
      assert(pair.every(q => element('.starter-pair').textContent.includes(q.prompt.en)));
      equal(read().attempts.length, 0);
      click('[data-action="starter-pair"]');
      await waitElement('#question-title');
      equal(read().active.questionIds, pair.map(q => q.id));
      await finishQuestions(q => q.id === pair[0].id);
      equal(Core.getStats(read(), questions, id).total, 2);
      assert(Core.getMistakes(read(), questions).some(row => row.question.id === pair[1].id));
      equal(Learning.latestPlacement(read(), id), null);
      assert(Object.values(Learning.subjectProfile(read(), id)).every(row => row.basis === 'starting'));
      assert(element('.result-buttons [data-action="diagnostic"]'));
      if (id === 'math') {
        click('.result-buttons [data-action="diagnostic"]');
        await waitElement('#question-title');
        await finishQuestions(q => q.topic === 'algebra');
        click('[data-action="recommended-set"]');
        await waitElement('#question-title');
        const active = read().active;
        equal(active.questionIds.length, 5);
        const profile = Learning.mathProfile(read());
        assert(active.questionIds.every(key => byId.get(key).level === profile[byId.get(key).topic].level));
      }
      fitsViewport();
    }
    await resetUi();
    change('language', 'en');
  });

  await test('初高中典型题连续使用同一阅读材料，语篇填空和分步计算支持评分与恢复', async () => {
    const sets = globalThis.EachVeyaSchoolPractice;
    equal(sets.length, 14);
    equal(sets.flatMap(set => set.ids).length, 48);
    const expected = {
      repair: [1, 2, 0, 3], library: [3, 1, 2, 0], shade: [1, 0, 2, 3], museum: [2, 1, 0, 2],
      garden: [['opened'], ['brings'], ['to'], ['to share']],
      journals: [['to record'], ['were taken'], ['regularly'], ['in']],
      'ticket-sales': [[108], [4, 24], [6]], fountain: [[5], [3, 9], [2]],
      resistor: [[10], ['3/5'], [3]], cart: [[8], [4, 12], [18]],
      salt: [[120], [10], [12]], dilution: [[0.05], [0.02, 0.1], [0.0025]],
      seedlings: [[3], [4], 1], peas: [[25], ['4/6'], ['3/8']]
    };
    for (const set of sets) {
      const items = set.ids.map(id => byId.get(id));
      equal(new Set(items.map(q => q.material)).size, 1);
      assert(items.every(q => !q.focusOnly && q.reviewedSchool && q.level === set.level && q.schoolSet === set.id));
      for (const [i, value] of expected[set.id].entries()) {
        const answer = Array.isArray(value) ? value.map(String) : value;
        assert(Core.evaluateAnswer(items[i], answer).correct, items[i].id);
      }
    }

    await resetUi();
    await openSubject('english');
    assert(element('.school-sets').textContent.includes('初中风格'));
    click('[data-set="repair"]');
    await waitElement('.school-material[open]');
    const firstMaterial = element('.school-material').textContent;
    await answerUi(false);
    click('[data-action="next"]');
    equal(current().id, 'school-repair-2');
    replayStorage(key);
    equal(element('.school-material').textContent, firstMaterial);
    await finishQuestions(() => true);
    equal(read().sessions.at(-1).correct, 3);
    equal(Core.getMistakes(read(), questions)[0].question.id, 'school-repair-1');
    await go('mistakes', '.mistake-card .school-material');
    assert(element('.mistake-card .school-material').textContent.includes('Repair Corner'));
    equal(Backup.parse(Backup.serialize(read()), questions).attempts.length, 4);
    const report = Coach.report(read(), questions, 7);
    equal(report.topics.reading.total, 4);
    equal(report.topics.reading.passages, 1);

    await openSubject('english');
    click('[data-set="journals"]');
    await waitElement('#numeric-0');
    await finishQuestions(() => true);
    equal(read().sessions.at(-1).correct, 4);
    await openSubject('math');
    click('[data-set="ticket-sales"]');
    await waitElement('#numeric-0');
    await answerUi(true);
    click('[data-action="next"]');
    await waitElement('#numeric-1');
    assert(element('.school-material').textContent.includes('132 元'));
    await finishQuestions(() => true);
    equal(read().sessions.at(-1).correct, 3);
    fitsViewport();
    await resetUi();
    change('language', 'en');
  });

  await test('常规选题优先复核典型题、保留手动题型，同篇阅读及换数字变式靠后', async () => {
    const state = Core.createState();
    const examples = [
      ['english', 'reading', 'A2', 'choice'],
      ['english', 'grammar', 'A2', 'fill'],
      ['math', 'algebra', 'L2', 'fill'],
      ['physics', 'ohmic-current', 'L3', 'fill'],
      ['chemistry', 'mass-percentage', 'L3', 'fill'],
      ['biology', 'trait-frequency', 'L4', 'fill']
    ];
    for (const [subject, topic, level, format] of examples) {
      const options = { subject, topic, level, format };
      const items = Learning.practiceIds(state, options, () => 0.5).map(id => byId.get(id));
      assert(items[0].reviewedSchool, subject + '/' + topic);
      assert(items.every(q => (q.fields ? 'fill' : 'choice') === format && q.level === level));
      const families = new Set(items.map(Learning.practiceFamily)).size;
      equal(new Set(items.slice(0, families).map(Learning.practiceFamily)).size, families);
    }
    const mixed = Learning.practiceIds(state, { subject: 'math', topic: 'algebra', level: 'L2', format: 'all' }, () => 0.5);
    equal(new Set(mixed.slice(0, 2).map(id => Boolean(byId.get(id).fields))).size, 2);
    const archived = byId.get('school-garden-1');
    const revised = byId.get('school-garden-1@2');
    assert(archived.retired && revised.reviewedSchool && revised.material.body.en.includes('(open) a garden'));
    const saved = Core.startSession(state, questions.map(q => q === archived ? { ...q, retired: false } : q),
      { subject: 'english', ids: [archived.id], count: 1 });
    const restored = Backup.parse(Backup.serialize(saved), questions);
    equal(restored.active.questionIds, [archived.id]);
    assert(Core.evaluateAnswer(archived, ['opened']).correct);

    await resetUi();
    await openSubject('math');
    const skip = document.querySelector('[data-action="skip-placement"]');
    if (skip) skip.click();
    change('topic', 'algebra');
    change('difficulty', 'L2');
    change('format', 'all');
    submitForm();
    await waitElement('#question-title');
    assert(current().reviewedSchool && element('.question-tags').textContent.includes('已复核典型题'));
    assert(document.querySelector('.school-material[open]'));
    await resetUi();
    change('language', 'en');
  });

  await test('数学起点测试完成 10 题后显示分领域推荐，设置、作答和结果标题对齐', async () => {
    const left = headingLeft();
    await openSubject('math');
    equal(headingLeft(), left);
    equal(element('#placement-heading').textContent, 'Placement check');
    assert(document.querySelector('[data-action="skip-placement"]'));
    assert(!document.querySelector('#difficulty'));
    click('[data-action="diagnostic"]');
    await waitElement('#question-title');
    equal(headingLeft(), left);
    equal(element('.page-heading .eyebrow').textContent, 'Placement check');
    equal(read().active.mode, 'diagnostic');
    equal(read().active.questionIds.length, 10);
    assert(!document.querySelector('[data-action="hint"]'));
    await answerUi(false);
    assert(!document.querySelector('.answer-line'));
    assert(element('.diagnostic-feedback').textContent.includes('after the placement check'));
    await finishQuestions(item => item.topic === 'algebra' || (item.topic === 'geometry' && item.level === 'L2'));
    equal(headingLeft(), left);
    equal(element('main h1').textContent, 'Placement check complete');
    equal(read().sessions.at(-1).mode, 'diagnostic');
    equal(document.querySelectorAll('.placement-result li').length, 5);
    assert(element('.placement-result').textContent.includes('L4'));
    equal(document.querySelectorAll('.result-row').length, 10);
    element('.result-row details').open = true;
    assert(element('.result-row details p').textContent.includes('correct answer'));
    fitsViewport();
  });

  await test('学习记录分领域显示推荐、真实作答和两段进度', async () => {
    await go('records', '.records-grid');
    const algebra = element('.topic-record[data-topic="algebra"]');
    const geometry = element('.topic-record[data-topic="geometry"]');
    assert(algebra.textContent.includes('Placement check suggests L4'));
    assert(geometry.textContent.includes('Placement check suggests L2'));
    assert(algebra.textContent.includes('2/2 correct'));
    equal(element('#english-records').closest('section').querySelector('.records-note').textContent, 'Not started yet');
    equal(document.querySelectorAll('.topic-record').length, 5);
    assert(!algebra.textContent.includes('0/5'));
    fitsViewport();
  });

  await test('数学可手选领域和 L5，方向键选择、提示与评分联动', async () => {
    click('.topic-record[data-topic="functions"] [data-action="topic-practice"]');
    await waitElement('#practice-form');
    equal(element('#topic').value, 'functions');
    change('difficulty', 'L5');
    change('format', 'choice');
    change('count', '5');
    assert(element('#setup-info').textContent.includes('13 questions'));
    submitForm();
    await waitElement('#question-title');
    equal(read().active.questionIds.length, 5);
    assert(read().active.questionIds.every(id => byId.get(id).level === 'L5' && byId.get(id).topic === 'functions'));
    assert(element('[data-action="grade"]').disabled);
    element('[data-choice="0"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    equal(element('[aria-checked="true"]').dataset.choice, '1');
    click('[data-action="hint"]');
    assert(element('#question-hint').textContent.includes('Hint'));
    equal(read().active.hintedQuestionIds, [current().id]);
    replayStorage(key);
    await waitElement('#question-hint');
    // This link used to route to the homepage because it changed the hash to #main.
    click('#skip-link');
    equal(location.hash, '#practice');
    equal(document.activeElement.id, 'main');
    await answerUi(false);
    equal(read().attempts.at(-1).hinted, true);
    assert(element('.feedback.wrong').textContent.includes('Explanation'));
    assert([...document.querySelectorAll('.option')].every(option => option.disabled));
    change('language', 'zh');
    assert(element('.feedback').textContent.includes('答案解析'));
    equal(element('#feedback-title').textContent, '这题答错了。');
    fitsViewport();
  });

  await test('返回主页可继续未完成练习，练习完成后可单独重做错题', async () => {
    const sessionId = read().active.id;
    click('[data-action="home"]');
    await waitElement('.hero [data-action="resume"]');
    click('.hero [data-action="resume"]');
    await waitElement('.feedback');
    equal(read().active.id, sessionId);
    await finishQuestions(() => true);
    assert(element('.result-score').textContent.includes('80'));
    const mistakeId = read().attempts.find(item => item.sessionId === sessionId && !item.correct).questionId;
    click('[data-action="review-result"]');
    await waitElement('#question-title');
    equal(read().active.mode, 'review');
    equal(read().active.questionIds, [mistakeId]);
    await finishQuestions(() => true);
    assert(!Core.getMistakes(read(), questions).some(item => item.question.id === mistakeId));
  });

  await test('英语主题/等级与雅思目标相互独立，切换中英文可继续', async () => {
    await openSubject('english');
    change('language', 'zh');
    change('topic', 'reading');
    change('difficulty', 'C2');
    assert(element('#setup-info').textContent.includes('14 道'));
    click('[data-track="ielts"]');
    change('ielts-target', '7.0');
    equal(read().preferences.ieltsTarget, '7.0');
    equal(read().preferences.englishLevel, 'C2');
    assert(!document.querySelector('#difficulty'));
    assert(element('.ielts-panel').textContent.includes('专项题库和模拟评分尚未开放'));
    change('language', 'en');
    assert(element('.ielts-panel').textContent.includes('mock scoring are planned'));
    click('[data-track="cefr"]');
    equal(element('#difficulty').value, 'C2');
    equal(element('#topic').value, 'reading');
    fitsViewport();
  });

  await test('英语起点测试完成后显示 B2 起点，错题列表提供技能推荐', async () => {
    equal(element('#placement-heading').textContent, 'Placement check');
    click('[data-action="diagnostic"]');
    await waitElement('#question-title');
    equal(read().active.questionIds.length, 12);
    await finishQuestions(item => item.id !== 'en-dx-a1-v');
    assert(element('.placement-result').textContent.includes('B2'));
    click('.result-buttons [data-action="subject"]');
    await waitElement('#practice-form');
    assert(element('.suggestion-list').textContent.includes('Vocabulary'));
    assert(element('#difficulty').value === 'C2');
    fitsViewport();
  });

  await test('重开练习可取消，旧练习和旧答案保留', async () => {
    submitForm();
    await waitElement('#question-title');
    const original = read().active.id;
    await answerUi(true);
    const total = read().attempts.length;
    await openSubject('math');
    submitForm();
    await waitElement('#confirm-dialog[open]');
    click('#dialog-cancel');
    await waitFor(() => !document.getElementById('confirm-dialog').open, 'The dialog did not close');
    equal(read().active.id, original);
    equal(read().attempts.length, total);
  });

  await test('有作答的知识点才显示卡片，重复作答计次数且不重复累计升降级依据', async () => {
    await resetUi();
    const ids = mathIds('algebra', 'L2', 1);
    const at = new Date().toISOString();
    const first = answerPractice(Core.createState(), ids, [false], at);
    const saved = answerPractice(first, ids, [true], at);
    Core.saveState(localStorage, key, saved);
    replayStorage(key);
    await go('records', '.topic-record');
    equal(document.querySelectorAll('.topic-record').length, 1);
    const algebra = element('.topic-record[data-topic="algebra"]');
    assert(algebra.textContent.includes('累计作答 2 次，答对 1 次'));
    assert(algebra.textContent.includes('已独立答对 0/3 类方程'));
    fitsViewport();
  });

  await test('页面直接读取 v1 学习记录，下一次保存写入独立的新版键', async () => {
    await resetUi();
    const payload = JSON.stringify(oldRecord());
    localStorage.setItem(legacyKey, payload);
    replayStorage(legacyKey);
    assert(!localStorage.getItem(key));
    assert(element('.stats-grid').textContent.includes('50%'));
    click('.hero [data-action="resume"]');
    await waitElement('#question-title');
    assert(element('.feedback').textContent.includes('Explanation'));
    equal(read().active.id, 'old-active');
    change('language', 'zh');
    equal(JSON.parse(localStorage.getItem(key)).version, Core.VERSION);
    equal(localStorage.getItem(legacyKey), payload);
    await go('mistakes', '.mistake-list');
    equal(document.querySelectorAll('.mistake-card').length, 1);
    assert(element('.mistake-card').textContent.includes('school every day'));
    await go('records', '.records-grid');
    assert(element('.topic-record[data-topic="grammar"]').textContent.includes('累计作答 1 次，答对 0 次'));
    assert(!element('.topic-record[data-topic="algebra"]').querySelector('.tag, .field-help'));
    fitsViewport();
  });

  await test('跳过数学起点测试会记住选择，仍可从练习设置打开测试', async () => {
    await resetUi();
    await openSubject('math');
    equal(element('#placement-heading').textContent, '起点测试');
    click('[data-action="skip-placement"]');
    assert(element('#difficulty'));
    equal(read().preferences.mathPlacementDeferred, true);
    replayStorage(key);
    assert(!document.querySelector('[data-action="skip-placement"]'));
    assert(element('[data-action="diagnostic"]'));
  });

  await test('显式清除新版记录前需要确认，并可继续使用空白状态', async () => {
    await go('home', '.hero');
    click('[data-action="clear"]');
    await waitElement('#confirm-dialog[open]');
    click('#dialog-cancel');
    await waitFor(() => !document.getElementById('confirm-dialog').open, 'The dialog did not close');
    equal(read().preferences.mathPlacementDeferred, true);
    click('[data-action="clear"]');
    await waitElement('#confirm-dialog[open]');
    click('#dialog-confirm');
    await waitFor(() => !read().preferences.mathPlacementDeferred, 'No cleared profile');
    equal(read().active, null);
    equal(read().attempts.length, 0);
  });

  await test('损坏或未来版本的保存内容会保护原始数据', async () => {
    const broken = '{"version":99,"attempts":[],"sessions":[]}';
    localStorage.setItem(key, broken);
    replayStorage(key);
    assert(!element('#storage-notice').hidden);
    change('language', 'en');
    equal(document.documentElement.lang, 'en');
    equal(localStorage.getItem(key), broken);
    await resetUi();
  });

  await test('存储空间不足时提示并继续提供临时做题和解析', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    const original = window.localStorage;
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: {
        getItem: name => original.getItem(name),
        setItem() { throw new DOMException('Test storage quota', 'QuotaExceededError'); }
      } });
      await openSubject('english');
      change('language', 'zh');
      assert(element('#storage-notice').textContent.includes('无法保存'));
      submitForm();
      await waitElement('#question-title');
      click('[data-choice="0"]');
      click('[data-action="grade"]');
      assert(element('.feedback').textContent.includes('答案解析'));
      fitsViewport();
    } finally {
      if (descriptor) Object.defineProperty(window, 'localStorage', descriptor);
      else delete window.localStorage;
      await resetUi();
    }
  });

  await test('错题进入分步辅导、探查相同错因并完成变式复测', async () => {
    await resetUi();
    const now = new Date().toISOString();
    let state = start({ ids: ['ma-a01'], count: 1 });
    state = Core.advanceSession(Core.gradeAnswer(state, questions, 3, now), questions, now);
    Core.saveState(localStorage, key, state);
    replayStorage(key);
    await go('mistakes', '.mistake-clue');
    click('.mistake-clue a[href="#coach/coefficient"]');
    await waitElement('.study-details');
    assert(!element('.study-details').open);
    click('[data-action="focus-practice"][data-mode="probe"]');
    await waitElement('#question-title');
    assert(!document.querySelector('[data-action="hint"]'));
    for (let i = 0; i < 2; i++) {
      click(`[data-choice="${Object.keys(current().errors)[0]}"]`);
      click('[data-action="grade"]');
      assert(!document.querySelector('.feedback .answer-line'));
      click('[data-action="next"]');
    }
    await waitElement('.focus-result');
    assert(element('.focus-result').textContent.includes('两道新题出现同类错误'));
    click('.focus-result a');
    await waitElement('[data-mode="retake"]');
    click('[data-mode="retake"]');
    await waitElement('#question-title');
    await finishQuestions(() => true);
    assert(element('.focus-result').textContent.includes('最近一次新题检验通过'));
    assert(element('.focus-result').textContent.includes('下次复习'));
    fitsViewport();
    await resetUi();
  });

  await test('五科专项双语题目可独立验算，练习和跨日题分开', () => {
    const subjectsWithLessons = Object.keys(globalThis.EachVeyaLessons.workshops);
    equal(subjectsWithLessons.sort(), subjects.map(item => item.id).sort());
    for (const subject of subjectsWithLessons) {
      const lesson = questions.filter(q => q.subject === subject && q.purpose === 'lesson');
      const transfer = questions.filter(q => q.subject === subject && q.purpose === 'transfer');
      const followups = questions.filter(q => q.subject === subject && q.purpose === 'followup');
      equal(lesson.length, 12);
      equal(transfer.length, 2);
      equal(followups.length, subject === 'english' ? 10 : subject === 'math' ? 8 : 6);
      const contexts = new Set(lesson.map(q => q.lessonGroup));
      equal(contexts.size, 3);
      const seen = new Set();
      const state = Core.createState();
      for (let round = 0; round < 4; round++) {
        const ids = globalThis.EachVeyaLessons.roundIds(state, subject);
        equal(new Set(ids.map(id => byId.get(id).lessonGroup)).size, 3);
        for (const id of ids) { assert(!seen.has(id)); seen.add(id); state.attempts.push({questionId:id}); }
      }
      const contextsForChecks = new Set(contexts);
      for (const q of [...transfer, ...followups]) {
        assert(q.focusOnly && !contextsForChecks.has(q.lessonGroup) && !seen.has(q.id), q.id);
        contextsForChecks.add(q.lessonGroup);
      }
      if (subject === 'english') equal(new Set(followups.map(q => q.evidenceType)).size, 5);
      const equationChecks = questions.filter(q => q.subject === subject && q.purpose === 'equation-check');
      if (subject === 'math') {
        equal(equationChecks.length, 6);
        assert(equationChecks.every(q => q.focusOnly && q.level === 'L2'));
        equal(new Set(equationChecks.map(Core.equationKey)).size, 6);
        equal(new Set(equationChecks.map(Core.equationStructure)).size, 3);
      }
      for (const q of [...lesson, ...transfer, ...followups, ...equationChecks]) {
        if (subject === 'math') {
          for (const lang of ['zh', 'en']) {
            const line = q.prompt[lang].split('\n').at(-1);
            const numbers = expression => expression.match(/-?[0-9]+/g).map(Number);
            const form = line.replace(/\d+/g, '#');
            const [first, second, third] = numbers(line);
            const [a, b, d] = form === '# = #x − #' ? [second, -third, first]
              : form === '# − #x = #' ? [-second, first, third]
              : [first, form === '#x + # = #' ? second : -second, third];
            assert(['# = #x − #', '# − #x = #', '#x + # = #', '#x − # = #'].includes(form), q.id);
            equal(q.fields.map(f => f.expected), [d - b, (d - b) / a]);
            equal(a * q.fields[1].expected + b, d);
          }
        } else if (subject === 'english') {
          const passage = q.prompt.en.split('\n\n')[0];
          assert(q.options.every(opt => passage.includes(opt.en)));
          equal(q.options[q.answer].en, q.evidenceQuote);
        } else if (subject === 'physics') {
          const numbers = lang => Array.from(q.prompt[lang].matchAll(/\d+/g), match => Number(match[0]));
          const [first, stop, last, distance] = numbers('en');
          const time = first + stop + last;
          equal(numbers('zh'), [first, stop, last, distance]);
          equal(q.fields.map(field => field.expected), [time, distance / time]);
          assert(stop > 0 && Number.isInteger(distance / time) && time !== distance / time);
          assert(q.fields[0].label.en.endsWith('□ s') && q.fields[1].label.en.endsWith('□ m/s'));
        } else {
          const numbers = lang => Array.from(q.prompt[lang].matchAll(/\d+/g), match => Number(match[0]));
          equal(numbers('zh'), numbers('en'));
          const [first, second, numerator] = numbers('en');
          const intermediate = q.stepMethod === 'sum' ? first + second : q.stepMethod === 'product' ? first * second : Math.abs(first - second);
          assert(intermediate > 0 && Number.isInteger(numerator / intermediate), q.id);
          equal(q.fields.map(field => field.expected), [intermediate, numerator / intermediate]);
          const unit = subject === 'chemistry' ? ['cm³', 'g/cm³'] : ['m²', 'm⁻²'];
          assert(q.fields.every((field, index) => ['zh', 'en'].every(lang => field.label[lang].endsWith('□ ' + unit[index]))));
          assert(q.stepHints.every(hint => hint.zh && hint.en));
        }
      }
    }
  });

  await test('数学两步题按不同结构确认错因，重复题和带提示作答只留下线索', () => {
    const get = state => Coach.assessment(state, questions, new Date(laterTime));
    function miss(state, id, step, hinted = false) {
      const q = byId.get(id);
      let run = start({ ids: [id], count: 1 }, state);
      if (hinted) run = Core.revealHint(run, questions);
      const response = q.fields.map((field, index) => String(field.expected + Number(index === step)));
      return Core.advanceSession(Core.gradeAnswer(run, questions, response, knownTime), questions, knownTime);
    }
    const standard = 'lesson-equation-tickets-0';
    let state = miss(Core.createState(), standard, 0);
    equal([get(state).balance.status, get(state).balance.equationEvidence], ['possible', 1]);
    state = miss(state, standard, 0);
    state = miss(state, 'lesson-equation-tickets-1', 0);
    state = miss(state, 'lesson-equation-probe-reversed-0', 0, true);
    equal([get(state).balance.status, get(state).balance.equationEvidence], ['possible', 1]);
    state = miss(state, 'lesson-equation-probe-constant-0', 1);
    equal([get(state).coefficient.status, get(state).coefficient.equationEvidence], ['possible', 1]);
    const ids = Coach.focusIds(state, 'balance', 'probe', 2, get(state).balance);
    equal(new Set(ids.map(id => Core.equationStructure(byId.get(id)))).size, 2);
    let probe = start({ ids, count: 2, mode: 'probe', focus: 'balance' }, state);
    for (const id of ids) {
      probe = Core.gradeAnswer(probe, questions, byId.get(id).fields.map((f, i) => String(f.expected + Number(i === 0))), knownTime);
      if (id === ids.at(-1)) equal(get(probe).balance.status, 'possible');
      probe = Core.advanceSession(probe, questions, knownTime);
    }
    const restored = Backup.parse(Backup.serialize(probe), questions);
    equal([get(restored).balance.status, get(restored).balance.equationEvidence], ['confirmed', 2]);
    const repair = Coach.focusIds(restored, 'balance', 'retake', 2, get(restored).balance);
    assert(repair.length === 2 && repair.every(id => !ids.includes(id)));
    let retake = start({ ids: repair, count: 2, mode: 'retake', focus: 'balance' }, restored);
    for (const id of repair) retake = Core.advanceSession(Core.gradeAnswer(retake, questions,
      byId.get(id).fields.map(f => String(f.expected)), knownTime), questions, knownTime);
    equal([get(retake).balance.status, get(retake).balance.equationEvidence], ['verified', 0]);
    assert(Coach.lessonChecks(retake, questions, new Date(laterTime)).some(task => task.focus === 'balance' && task.ready));
    equal(Coach.report(retake, questions, 7, new Date(laterTime)).checks, []);
  });

  await test('数学 L2 已验算 AI 分步错题可预约隔日复测，同式改写不会重复计入', () => {
    const q = byId.get('lesson-equation-tickets-0');
    const alternate = {
      ...q, id: 'test-same-equation', equationPresentation: 'sides-swapped',
      prompt: { en: '17 = 3x + 2', zh: '17 = 3x + 2' }
    };
    const probe = Core.createState();
    const catalog = [...questions, alternate];
    let state = Core.startSession(probe, catalog, { subject: 'math', ids: [q.id, alternate.id], count: 2 });
    for (const ignored of state.active.questionIds) {
      state = Core.advanceSession(Core.gradeAnswer(state, catalog, ['16', '5'], knownTime), catalog, knownTime);
    }
    equal(Core.equationKey(q), Core.equationKey(alternate));
    equal(Coach.assessment(state, catalog, new Date(laterTime)).balance.equationEvidence, 1);

    let ai = Core.startAiSession(probe, questions, 'L2', aiFixture, 'calculation');
    const withAi = Core.questionsForState(questions, ai);
    const question = withAi.find(item => item.id === ai.active.questionIds[0]);
    ai = Core.gradeAnswer(ai, withAi, question.fields.map((f, i) => String(f.expected + Number(i === 1))), knownTime);
    equal(Coach.mistakeFocus(question, ai.attempts[0]), 'coefficient');
    const pending = Coach.lessonChecks(ai, withAi, new Date(knownTime)).find(task => task.focus === 'coefficient');
    assert(pending.id && !pending.ready);
    const due = Coach.lessonChecks(ai, withAi, new Date(laterTime)).find(task => task.focus === 'coefficient');
    assert(due.ready && byId.get(due.id).level === 'L2');
    assert(Core.equationKey(byId.get(due.id)) !== Core.equationKey(question));
  });

  await test('数学 L2 两步闭环从错题提示到两种方程确认，再做无提示跨日新题并显示最近结果', async () => {
    await resetUi();
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59).toISOString();
    const workshop = byId.get('lesson-equation-tickets-0');
    let seeded = start({ ids: [workshop.id], count: 1 });
    seeded = Core.advanceSession(Core.gradeAnswer(seeded, questions, ['16', '5'], yesterday), questions, yesterday);
    Core.saveState(localStorage, key, seeded);
    replayStorage(key);
    await go('mistakes', '.mistake-clue');
    assert(element('.mistake-clue').textContent.includes('等式两边都减'));
    click('.mistake-clue a[href="#coach/balance"]');
    await waitElement('[data-mode="probe"]');
    assert(element('#skill-check-title').textContent.includes('有待确认'));
    click('[data-mode="probe"]');
    await waitElement('#numeric-answer-form');
    assert(!document.querySelector('[data-action="hint"]'));
    for (let index = 0; index < 2; index++) {
      await answerUi(false);
      click('[data-action="next"]');
    }
    await waitElement('.focus-result');
    assert(element('.focus-result').textContent.includes('两种不同写法'));
    await go('plan/checks', '[data-action="lesson-check"][data-focus="balance"]');
    click('[data-action="lesson-check"][data-focus="balance"]');
    await waitElement('#numeric-answer-form');
    assert(current().id !== workshop.id && current().level === 'L2');
    assert(!document.querySelector('[data-action="hint"]'));
    await finishQuestions(() => true);
    assert(element('.focus-result').textContent.includes('这道跨日新题已独立答对'));
    assert(element('.focus-result').textContent.includes('可做 7 天复测'));
    await go('plan/checks', '[data-lesson-focus="balance"]');
    assert(element('[data-lesson-focus="balance"]').textContent.includes('可做 7 天复测'));
    assert(!document.querySelector('[data-lesson-focus="balance"] [data-action="lesson-check"]'));
    await go('report', '.report-checks');
    assert(element('.report-checks').textContent.includes('独立答对 1/1 次'));
    assert(element('.report-checks').textContent.includes('最近一题已独立答对'));
    fitsViewport();
    await resetUi();
  });

  await test('化学和生物可从科目页进入专项，错因提示和隔天复测匹配原步骤', async () => {
    for (const [subject, focus, wrongStep, hint] of [
      ['chemistry', 'mass-density', 0, '两个读数的差'], ['biology', 'population-density', 1, '总株数除以实际调查面积']
    ]) {
      await resetUi();
      await openSubject(subject);
      click(`#practice-form [data-action="lesson"][data-subject="${subject}"]`);
      await waitElement('#numeric-answer-form');
      const q = current();
      assert([...document.querySelectorAll('[data-numeric-input]')].every(input => input.getAttribute('inputmode') === 'decimal'));
      const response = q.fields.map((field, index) => String(field.expected + Number(index === wrongStep)));
      response.forEach((value, index) => { element(`#numeric-${index}`).value = value; });
      click('button[form="numeric-answer-form"]');
      assert(element('.feedback .mistake-clue').textContent.includes(hint));
      assert(!element('.feedback > details').open);
      assert(element('.feedback a[href="#coach/' + focus + '"]'));
      assert(!document.querySelector('.feedback [data-action="lesson-check"]'));

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const at = yesterday.toISOString();
      const open = start({ subject, ids: [q.id], count: 1 });
      const history = Core.advanceSession(Core.gradeAnswer(open, questions, response, at), questions, at);
      Core.saveState(localStorage, key, history);
      replayStorage(key);
      await go('plan/checks', `[data-lesson-focus="${focus}"]`);
      click(`[data-lesson-focus="${focus}"] [data-action="lesson-check"]`);
      await waitElement('#numeric-answer-form');
      const fresh = current();
      assert(fresh.purpose === 'followup' && fresh.stepMethod === q.stepMethod && fresh.level === q.level && fresh.prompt.en !== q.prompt.en);
      await answerUi(true);
      assert(!document.querySelector('.feedback .answer-line'));
      click('[data-action="next"]');
      await waitElement('.focus-result');
      await go('report', '.report-checks');
      assert(element('.report-checks').textContent.includes('独立答对 1/1 次'));
      assert(element(`.report-checks a[href="#coach/${focus}"]`));
      fitsViewport();
    }
    await resetUi();
  });

  await test('复测报告仅计入合格且已结束的场次，按完成日期和独立答对统计', () => {
    const focus = 'mass-density';
    const first = byId.get('lesson-mass-density-difference-0');
    const makeRun = (state, question, checking) => start({ subject:'chemistry', ids:[question.id], count:1,
      ...(checking ? { mode:'spaced', focus } : {}) }, state);
    const submit = (state, question, at, miss = false) => Core.gradeAnswer(state, questions,
      question.fields.map((field, i) => String(field.expected + Number(miss && i === 0))), at);
    const doneAt = new Date(2026, 3, 4, 0, 1);
    const answerTime = new Date(2026, 3, 3, 23, 59).toISOString();
    const dayAfter = new Date(2026, 3, 5, 9);
    let state = Core.advanceSession(submit(makeRun(Core.createState(), first), first, knownTime, true), questions, knownTime);
    const [task] = Coach.lessonChecks(state, questions, new Date(laterTime));
    const item = byId.get(task.id);
    const early = Core.advanceSession(submit(makeRun(state, item, true), item, knownTime), questions, laterTime);
    equal(Coach.report(early, questions, 7, doneAt).checks, []);
    state = submit(makeRun(state, item, true), item, answerTime, true);
    equal(Coach.report(state, questions, 7, doneAt).checks, []);
    state = Core.advanceSession(state, questions, doneAt.toISOString());
    equal(Coach.report(state, questions, 7, new Date(answerTime)).checks, []);
    equal(Coach.report(state, questions, 1, doneAt).checks, [{ focus, total: 1, independent: 0, last: '2026-04-04' }]);
    const [retry] = Coach.lessonChecks(state, questions, dayAfter);
    assert(retry.ready && retry.id !== task.id && retry.due === '2026-04-05');
    const next = byId.get(retry.id);
    state = Core.advanceSession(submit(makeRun(state, next, true), next, dayAfter.toISOString()), questions, dayAfter.toISOString());
    equal(Coach.report(state, questions, 7, dayAfter).checks, [{ focus, total: 2, independent: 1, last: '2026-04-05' }]);
    equal(Coach.report(state, questions, 1, dayAfter).checks, [{ focus, total: 1, independent: 1, last: '2026-04-05' }]);
  });

  await test('物理专项分别提示漏计停留和求速率，隔日独立答对只清除本次任务', async () => {
    await resetUi();
    await go('plan', '[data-action="lesson"][data-subject="physics"]');
    click('[data-action="lesson"][data-subject="physics"]');
    await waitElement('#numeric-answer-form');
    const first = current();
    assert([...document.querySelectorAll('[data-numeric-input]')].every(input => input.getAttribute('inputmode') === 'decimal'));
    const [firstTime, firstRate] = first.fields.map(field => field.expected);
    const stopped = Number(first.prompt.en.match(/stops for (\d+) s/)[1]);
    element('#numeric-0').value = String(firstTime - stopped);
    element('#numeric-1').value = String(firstRate);
    click('button[form="numeric-answer-form"]');
    assert(element('.feedback .mistake-clue').textContent.includes('中间停留的秒数'));
    assert(!element('.feedback > details').open);
    assert(element('.feedback .mistake-clue').textContent.includes('可做一道新题'));
    assert(!document.querySelector('.feedback [data-action="lesson-check"]'));
    assert(element('.numeric-mark.score-error').textContent.includes('这一步需要再算'));
    click('[data-action="next"]');
    const second = current();
    const [secondTime, secondRate] = second.fields.map(field => field.expected);
    element('#numeric-0').value = String(secondTime);
    element('#numeric-1').value = String(secondRate + 1);
    click('button[form="numeric-answer-form"]');
    assert(element('.feedback .mistake-clue').textContent.includes('用总路程（米）除以这个总用时（秒）'));
    assert(!element('.feedback > details').open);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const at = yesterday.toISOString();
    let history = start({ subject: 'physics', ids: [first.id], count: 1 });
    history = Core.advanceSession(Core.gradeAnswer(history, questions, [String(firstTime - stopped), String(firstRate)], at), questions, at);
    const [pending] = Coach.lessonChecks(history, questions, yesterday);
    assert(pending.focus === 'average-speed' && !pending.ready);
    Core.saveState(localStorage, key, history);
    replayStorage(key);
    await go('plan', '#daily-plan-title');
    click('.today-plan [data-action="lesson-check"][data-focus="average-speed"]');
    await waitElement('#numeric-answer-form');
    const fresh = current();
    assert(fresh.purpose === 'followup' && fresh.lessonGroup !== first.lessonGroup && fresh.level === first.level);
    assert(!document.querySelector('[data-action="hint"]'));
    fresh.fields.forEach((field, index) => { element('#numeric-' + index).value = String(field.expected); });
    click('button[form="numeric-answer-form"]');
    assert(!document.querySelector('.feedback .answer-line'));
    click('[data-action="next"]');
    await waitElement('.focus-result');
    assert(element('.focus-result').textContent.includes('本次新题答对了'));
    equal(Coach.lessonChecks(read(), questions), []);
    equal(Coach.assessment(read(), questions)['average-speed'].status, 'possible');
    const restored = Backup.parse(Backup.serialize(read()), questions);
    equal(restored.attempts.map(attempt => attempt.response), read().attempts.map(attempt => attempt.response));
    fitsViewport();
    await resetUi();
  });

  await test('专项复测合并到日程，按学习目标和当天可用时间安排', () => {
    const focus = 'average-speed';
    const ids = globalThis.EachVeyaLessons.roundIds(Core.createState(), 'physics');
    let state = start({ subject: 'physics', ids, count: 3 });
    for (const [index, id] of ids.entries()) {
      const [time, speed] = byId.get(id).fields.map(field => field.expected);
      state = Core.advanceSession(Core.gradeAnswer(state, questions, [String(time), String(speed + Number(index === 2))], knownTime), questions, knownTime);
    }
    state.plan = { enabled: true, goal: 'physics', topic: focus, minutes: 8, deadline: '' };
    equal(Coach.assessment(state, questions, new Date(knownTime))[focus].status, 'scheduled');
    const tomorrow = Coach.learningPlan(state, questions, new Date(knownTime)).week[1];
    equal(tomorrow.scheduled, [{ focus, date: tomorrow.date }]);
    const plan = Coach.learningPlan(state, questions, new Date(laterTime));
    equal(plan.todayChecks.map(task => task.focus), [focus]);
    assert(!plan.review.some(task => task.focus === focus));
    equal(plan.practice.count + plan.todayChecks.length, plan.slots);
    const other = Coach.learningPlan({ ...state, plan: { ...state.plan, goal: 'math', topic: '' } }, questions, new Date(laterTime));
    equal(other.todayChecks, []);
    equal(other.nextDay.map(task => task.focus), [focus]);
  });

  await test('分步错答触发探查，矛盾或缺失的证据不会被当成已证实的错误', () => {
    const spec = { ...AI.sampleBatch('L2')[0], format: 'calculation' };
    const q = globalThis.EachVeyaSkills.decorateEquation(AI.makeQuestion(spec), spec);
    equal(Coach.mistakeFocus(q, Core.evaluateAnswer(q, ['25','6'])), 'balance');
    equal(Coach.mistakeFocus(q, Core.evaluateAnswer(q, ['48/2','8'])), 'coefficient');
    equal(Coach.mistakeFocus(q, Core.evaluateAnswer(q, ['24','6'])), '');
    equal(Coach.mistakeFocus(q, { correct:false, response:[''] }), '');
    const higher = { ...AI.sampleBatch('L3')[1], format:'calculation' };
    const grouped = globalThis.EachVeyaSkills.decorateEquation(AI.makeQuestion(higher), higher);
    equal(Coach.mistakeFocus(grouped, Core.evaluateAnswer(grouped, ['88','99'])), '');
  });

  await test('旧版英语错题可以在学习记录和错题本查看，归档题不会重新分配', async () => {
    await resetUi();
    const q = byId.get('en-v08');
    const { retired, ...original } = q;
    const historical = [...questions.filter(item => item.id !== q.id), original];
    let state = Core.startSession(Core.createState(), historical, { subject: 'english', ids: [q.id], count: 1 });
    state = Core.gradeAnswer(state, historical, 1, knownTime);
    state = Core.advanceSession(state, historical, knownTime);
    Core.saveState(localStorage, key, state);
    replayStorage(key);
    await go('records', '#archived-answers');
    const archive = element('#archived-answers');
    assert(archive.textContent.includes('before the lesson began'));
    assert(archive.textContent.includes('B · at') && archive.textContent.includes('A · in'));
    assert(archive.textContent.includes('按原题评分'));
    await go('mistakes', '.mistake-card');
    assert(element('.mistake-card').textContent.includes('按原题评分'));
    assert(!document.querySelector('[data-action="review"], [data-action="review-one"]'));
    await go('result', '.result-score');
    assert(element('.result-score').textContent.includes('0%'));
    assert(!document.querySelector('[data-action="review-result"]'));
    equal(read().attempts[0].choice, 1);
    fitsViewport();
    await resetUi();
  });

  await test('学习中心可做双语专项，阅读证据在提交后出现，旧记录可带入专项复测', async () => {
    await resetUi();
    await go('plan', '[data-action="lesson"]');
    click('[data-action="lesson"][data-subject="english"]');
    await waitElement('#question-title');
    const question = current();
    assert(question.purpose === 'lesson' && !document.querySelector('.feedback q'));
    click('[data-choice="' + ((question.answer + 1) % 4) + '"]');
    click('[data-action="grade"]');
    assert(element('.feedback .mistake-clue').textContent.includes('这一步的提示'));
    assert(!element('.feedback > details').open);
    assert(!document.querySelector('.option.correct'));
    element('.feedback > details').open = true;
    equal(element('.feedback q').textContent, question.evidenceQuote);
    assert(element('.feedback a[href="#coach/text-evidence"]'));
    equal(Coach.assessment(read(), questions)['text-evidence'].status, 'possible');
    await resetUi();
    await go('plan', '[data-action="lesson"]');
    click('[data-action="lesson"][data-subject="math"]');
    await waitElement('#numeric-answer-form');
    const item = current();
    element('#numeric-0').value = String(item.fields[0].expected + 1);
    element('#numeric-1').value = String(item.fields[1].expected);
    click('button[form="numeric-answer-form"]');
    assert(element('.feedback a[href="#coach/balance"]'));
    assert(element('.feedback .mistake-clue').textContent.includes('等式两边都'));
    assert(!element('.feedback > details').open);
    assert(element('.numeric-mark.score-error').textContent.includes('这一步需要再算'));
    equal(Coach.assessment(read(), questions).balance.status, 'possible');
    const old = { ...read(), version:6 };
    equal(Backup.parse(Backup.serialize(old), questions).attempts[0].response, old.attempts[0].response);
    await resetUi();
  });

  await test('不同情境下独立作答才安排跨日新题，复测到期前不显示入口', async () => {
    await resetUi();
    let state = Core.createState();
    const at = new Date().toISOString();
    const ids = globalThis.EachVeyaLessons.roundIds(state, 'english');
    state = start({ subject:'english', ids, count:3 }, state);
    for (const id of ids) state = Core.advanceSession(Core.gradeAnswer(state, questions, byId.get(id).answer, at), questions, at);
    const record = Coach.assessment(state, questions)['text-evidence'];
    equal(record.status, 'scheduled');
    const next = Coach.focusIds(state, 'text-evidence', 'spaced', 1, record);
    equal(next.length, 1);
    equal(byId.get(next[0]).purpose, 'transfer');
    assert(!ids.some(id => byId.get(id).lessonGroup === byId.get(next[0]).lessonGroup));
    Core.saveState(localStorage, key, state);
    replayStorage(key);
    await go('coach/text-evidence', '.study-details');
    assert(!document.querySelector('[data-action="focus-practice"][data-mode="spaced"]'));
    await resetUi();
  });

  await test('错题预约隔天一题，同日重复不加任务，重试连续用新题且不凭一题判为掌握', () => {
    const question = byId.get('lesson-equation-ribbon-0');
    const [intermediate, answer] = question.fields.map(field => field.expected);
    const finish = (state, id, response, at, focus) => {
      let run = start({ subject: byId.get(id).subject, ids: [id], count: 1, ...(focus ? { mode: 'spaced', focus } : {}) }, state);
      run = Core.gradeAnswer(run, questions, response, at);
      return Core.advanceSession(run, questions, at);
    };
    let state = finish(Core.createState(), question.id, [String(intermediate + 1), String(answer)], knownTime);
    state = finish(state, question.id, [String(intermediate + 1), String(answer)], knownTime);
    state = finish(state, question.id, [String(intermediate), String(answer + 1)], knownTime);
    const sameDay = Coach.lessonChecks(state, questions, new Date(2026, 3, 2, 23, 59));
    equal(sameDay.map(task => [task.focus, task.due, task.ready]), [
      ['balance', '2026-04-03', false], ['coefficient', '2026-04-03', false]
    ]);
    const nextDay = Coach.lessonChecks(state, questions, new Date(laterTime));
    assert(nextDay.every(task => task.ready));
    assert(nextDay[0].id !== nextDay[1].id);
    const check = byId.get(nextDay[0].id);
    equal(check.equationPresentation, 'sides-swapped');
    const positive = finish(Core.createState(), 'lesson-equation-tickets-0', ['16', '5'], knownTime);
    const positiveCheck = byId.get(Coach.lessonChecks(positive, questions, new Date(laterTime))[0].id);
    equal(positiveCheck.equationPresentation, 'constant-first');
    assert(positiveCheck.equationStep.coefficient < 0 && positiveCheck.focus.includes('balance'));
    const expected = check.fields.map(field => String(field.expected));
    assert(check.prompt.en !== question.prompt.en && check.lessonGroup !== question.lessonGroup && check.level === question.level);
    const premature = finish(state, check.id, expected, knownTime, 'balance');
    assert(Coach.lessonChecks(premature, questions, new Date(laterTime)).some(task => task.focus === 'balance' && task.id !== check.id));
    const passed = finish(state, check.id, expected, laterTime, 'balance');
    equal(Coach.lessonChecks(passed, questions, new Date(laterTime)).map(task => [task.focus, task.ready]), [
      ['coefficient', true], ['balance', false]
    ]);
    equal(Coach.assessment(passed, questions, new Date(laterTime)).balance.status, 'possible');
    equal(Learning.mathProfile(passed).algebra.level, 'L2');
    equal(Coach.report(passed, questions, 7, new Date(laterTime)).checks[0].independent, 1);
    const retry = finish(state, check.id, [String(Number(expected[0]) + 1), expected[1]], laterTime, 'balance');
    const waiting = Coach.lessonChecks(retry, questions, new Date(laterTime)).find(task => task.focus === 'balance');
    equal(waiting.due, '2026-04-04');
    assert(!waiting.ready && waiting.id !== check.id);
    const empty = Coach.lessonChecks(retry, questions.filter(q => q.purpose !== 'followup'), new Date(2026, 3, 4, 9));
    assert(empty.every(task => !task.ready && !task.id));
  });

  await test('两步方程隔日独立答对后，七天后安排一道新题，并根据实际结果结束或重排', async () => {
    const focus = 'balance';
    const source = byId.get('lesson-equation-tickets-0');
    const finish = (state, question, at, mode, miss = false) => {
      const options = { subject: 'math', ids: [question.id], count: 1, ...(mode ? { mode, focus } : {}) };
      const open = start(options, state);
      const response = question.fields.map((field, i) => String(field.expected + Number(miss && i === 0)));
      return Core.advanceSession(Core.gradeAnswer(open, questions, response, at), questions, at);
    };
    const missed = finish(Core.createState(), source, knownTime, undefined, true);
    const [daily] = Coach.lessonChecks(missed, questions, new Date(laterTime));
    const first = byId.get(daily.id);
    const passed = finish(missed, first, laterTime, 'spaced');
    const state = Backup.parse(Backup.serialize(passed), questions);
    const [weekly] = Coach.lessonChecks(state, questions, new Date(laterTime));
    assert(weekly.weekly && !weekly.ready);
    equal(weekly.due, '2026-04-10');
    const upcoming = Coach.learningPlan(state, questions, new Date(laterTime)).weeks.flatMap(week => week.scheduled);
    equal(upcoming.filter(task => task.focus === focus && task.date === weekly.due).length, 1);
    const before = new Date(2026, 3, 9, 23, 59);
    assert(!Coach.lessonChecks(state, questions, before)[0].ready);
    const due = new Date(2026, 3, 10, 10);
    const plan = Coach.learningPlan(state, questions, due);
    const [item] = plan.todayChecks.filter(task => task.focus === focus);
    assert(item.ready && item.weekly && !plan.review.some(task => task.focus === focus));
    const fresh = byId.get(item.id);
    equal(fresh.level, source.level);
    assert(![source, first].some(q => Core.equationKey(q) === Core.equationKey(fresh)));
    const early = finish(state, fresh, before.toISOString(), 'spaced');
    equal(Coach.report(early, questions, 30, due).checks[0].total, 1);
    const done = finish(state, fresh, due.toISOString(), 'spaced');
    equal(Coach.lessonChecks(done, questions, due), []);
    const [report] = Coach.report(done, questions, 30, due).checks;
    assert(report.independent === 2 && report.lastWeekly);
    const failed = finish(state, fresh, due.toISOString(), 'spaced', true);
    const [retry] = Coach.lessonChecks(failed, questions, due);
    assert(!retry.weekly && !retry.ready && retry.id !== fresh.id);
    equal(retry.due, '2026-04-11');
    const newMistake = new Date(2026, 3, 5, 9);
    const [pulledForward] = Coach.lessonChecks(finish(state, source, newMistake.toISOString(), undefined, true), questions, newMistake);
    assert(!pulledForward.weekly && !pulledForward.ready);
    equal(pulledForward.due, '2026-04-06');
    const overdueError = finish(state, source, due.toISOString(), undefined, true);
    const [overdue] = Coach.lessonChecks(overdueError, questions, due);
    assert(overdue.ready && overdue.due === weekly.due);
    const noNewItems = [...questions.filter(q => q.purpose !== 'followup'), first];
    const [unavailable] = Coach.lessonChecks(state, noNewItems, due);
    assert(unavailable.weekly && !unavailable.ready && !unavailable.id);

    await resetUi();
    const lastWeek = new Date();
    const originalDate = new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate() - 8, 12);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(12, 0, 0, 0);
    const oldMiss = finish(Core.createState(), source, originalDate.toISOString(), undefined, true);
    const sinceLastWeek = finish(oldMiss, first, lastWeek.toISOString(), 'spaced');
    Core.saveState(localStorage, key, sinceLastWeek);
    replayStorage(key);
    await go('plan', '.today-plan [data-action="lesson-check"]');
    const action = element('.today-plan [data-action="lesson-check"]');
    assert(action.textContent.includes('7 天复测'));
    click('.today-plan [data-action="lesson-check"]');
    await waitElement('#numeric-answer-form');
    equal(current().id, fresh.id);
    assert(!document.querySelector('[data-action="hint"]'));
    await finishQuestions(() => true);
    assert(element('.focus-result').textContent.includes('这道 7 天复测题已独立答对'));
    await go('report', '.report-checks');
    assert(element('.report-checks').textContent.includes('最近一次为 7 天复测'));
    await resetUi();
  });

  await test('两步方程复测优先换写法，做过的题不再用，缺题时用同写法的同级新题', () => {
    const ticket = byId.get('lesson-equation-tickets-0');
    const tank = byId.get('lesson-equation-water-tank-0');
    const cards = byId.get('lesson-equation-card-boxes-0');
    const finish = (state, question, wrong) => {
      const run = start({ subject: 'math', ids: [question.id], count: 1 }, state);
      const response = question.fields.map((field, i) => String(field.expected + (wrong && i === 0 ? 1 : 0)));
      return Core.advanceSession(Core.gradeAnswer(run, questions, response, knownTime), questions, knownTime);
    };
    const practiced = finish(Core.createState(), tank, false);
    const missed = finish(practiced, ticket, true);
    const due = new Date(laterTime);
    const [varied] = Coach.lessonChecks(missed, questions, due);
    assert(varied.ready);
    equal(varied.id, cards.id);
    const [fallback] = Coach.lessonChecks(finish(missed, cards, false), questions, due);
    const replacement = byId.get(fallback.id);
    assert(fallback.ready && replacement.level === ticket.level);
    equal(Core.equationStructure(replacement), Core.equationStructure(ticket));
    assert(![ticket, tank, cards].some(q => Core.equationKey(q) === Core.equationKey(replacement)));
  });

  await test('数学跨日复测做对第一步后，只预约仍出错的第二步，整题仍计为未答对', async () => {
    await resetUi();
    const yesterday = new Date();
    yesterday.setHours(12, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    const at = yesterday.toISOString();
    const source = byId.get('lesson-equation-tickets-0');
    const open = start({ subject: 'math', ids: [source.id], count: 1 });
    const initial = source.fields.map((field, i) => String(field.expected + Number(i === 0)));
    const history = Core.advanceSession(Core.gradeAnswer(open, questions, initial, at), questions, at);
    Core.saveState(localStorage, key, history);
    replayStorage(key);
    await go('plan/checks', '[data-lesson-focus="balance"] [data-action="lesson-check"]');
    click('[data-lesson-focus="balance"] [data-action="lesson-check"]');
    await waitElement('#numeric-answer-form');
    const item = current();
    assert(Core.equationStructure(item) !== Core.equationStructure(source));
    assert(!document.querySelector('[data-action="hint"]'));
    item.fields.forEach((field, i) => { element('#numeric-' + i).value = String(field.expected + Number(i === 1)); });
    click('button[form="numeric-answer-form"]');
    click('[data-action="next"]');
    await waitElement('.focus-result');
    const completed = read();
    equal(Coach.lessonChecks(completed, questions).map(task => task.focus), ['coefficient']);
    assert(element('.focus-result').textContent.includes('第一步已独立做对'));
    assert(element('.focus-result .mistake-clue a[href="#coach/coefficient"]'));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [next] = Coach.lessonChecks(completed, questions, tomorrow);
    assert(next.ready && next.due === Core.localDate(tomorrow) && next.id !== item.id);
    await go('report', '.report-checks');
    assert(element('.report-checks').textContent.includes('独立答对 0/1 次'));
    assert(element('.report-checks').textContent.includes('第一步已独立做对'));
    await resetUi();
  });

  await test('英语旧错题隔天在学习中心发起同类新题，答错时先看线索再约下一天', async () => {
    await resetUi();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const q = byId.get('lesson-evidence-lost-cap-3');
    equal(q.evidenceType, 'person');
    const open = start({ subject: 'english', ids: [q.id], count: 1 });
    const history = Core.advanceSession(answerCurrent(open, false, yesterday.toISOString()), questions, yesterday.toISOString());
    Core.saveState(localStorage, key, { ...history, version: 7 });
    replayStorage(key);
    await go('plan/checks', '[data-action="lesson-check"]');
    click('[data-action="lesson-check"]');
    await waitElement('#question-title');
    const fresh = current();
    equal(read().active.questionIds.length, 1);
    assert(fresh.id !== q.id && fresh.purpose === 'followup' && fresh.evidenceType === q.evidenceType);
    assert(!document.querySelector('[data-action="hint"]'));
    await answerUi(false);
    assert(!document.querySelector('.feedback .answer-line'));
    click('[data-action="next"]');
    await waitElement('.focus-result');
    assert(element('.focus-result').textContent.includes('隔天再用一道新题'));
    assert(element('.focus-result .mistake-clue').textContent.includes('谁做了这个动作'));
    await go('plan/checks', '#lesson-checks-title');
    assert(!document.querySelector('[data-action="lesson-check"]'));
    await resetUi();
  });

  await test('普通阅读错题提供原文线索并安排不同文章，报告按篇显示样本', async () => {
    await resetUi();
    const q = byId.get('b400-english-r-lost-cap-4');
    const known = 'b400-english-r-lost-cap-1';
    const yesterday = new Date();
    yesterday.setHours(12, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    const at = yesterday.toISOString();
    let state = answerPractice(Core.createState(), [known], [true], at);
    state = start({ subject: 'english', ids: [q.id], count: 1 }, state);
    Core.saveState(localStorage, key, state);
    replayStorage(key);
    await go('home', '[data-action="resume"]');
    click('.today-plan [data-action="resume"]');
    await waitElement('#question-title');
    await answerUi(false);
    assert(element('.feedback .mistake-clue').textContent.includes('谁做了这个动作'));
    assert(!element('.feedback > details').open);
    assert(!document.querySelector('.option.correct'));
    const open = read();
    assert(Coach.lessonChecks(open, questions).every(task => !task.ready));
    let past = answerPractice(Core.createState(), [known, q.id], [true, false], at);
    const [task] = Coach.lessonChecks(past, questions);
    assert(task.ready && byId.get(task.id).evidenceType === 'person');
    assert(Core.readingPassage(byId.get(task.id)) !== Core.readingPassage(q));

    const candidate = byId.get(task.id);
    const alias = { ...candidate, id: 'reading-already-practised', purpose: '' };
    const extended = [...questions, alias];
    past = Core.startSession(past, extended, { subject:'english', ids:[alias.id], count:1 });
    past = Core.advanceSession(Core.gradeAnswer(past, extended, alias.answer, at), extended, at);
    const [unread] = Coach.lessonChecks(past, extended);
    assert(unread.ready && unread.id !== task.id);
    assert(Core.readingPassage(byId.get(unread.id)) !== Core.readingPassage(alias));

    Core.saveState(localStorage, key, answerPractice(Core.createState(), [known, q.id], [true, false], at));
    replayStorage(key);
    await go('report', '.report-map');
    assert(element('.report-map').textContent.includes('1 篇不同文章，1/2 次答对'));
    await go('plan/checks', '[data-lesson-focus="text-evidence"] [data-action="lesson-check"]');
    click('[data-lesson-focus="text-evidence"] [data-action="lesson-check"]');
    await waitElement('#question-title');
    equal(current().id, task.id);
    assert(!document.querySelector('[data-action="hint"]'));
    await answerUi(true);
    click('[data-action="next"]');
    await waitElement('.focus-result');
    assert(element('.focus-result').textContent.includes('本次新题答对了'));
    await go('report', '.report-checks');
    assert(element('.report-checks').textContent.includes('独立答对 1/1 次'));
    await resetUi();
  });

  await test('学习计划可编辑、发起正确主题练习并进入真实报告和备份入口', async () => {
    await resetUi();
    await go('report', '.report-map');
    assert(element('.report-map').textContent.includes('尚未测评'));
    assert(!document.querySelector('.report-charts'));
    await go('plan', '#plan-form');
    element('.plan-settings').open = true;
    change('plan-goal', 'english');
    change('plan-topic', 'grammar');
    element('#plan-minutes').value = '8';
    click('#plan-form button[type="submit"]');
    await waitElement('.today-plan');
    equal(read().plan.minutes, 8);
    assert(element('.plan-preview').textContent.includes('未来 30 天'));
    click('[data-action="plan-practice"]');
    await waitElement('#question-title');
    equal(current().topic, 'grammar');
    await finishQuestions(() => true);
    await go('report', '.report-charts');
    assert(element('.report-totals').textContent.includes('100%'));
    click('[data-days="30"]');
    equal(document.querySelectorAll('.report-table tbody tr').length, 30);
    click('[data-days="90"]');
    equal(document.querySelectorAll('.report-table tbody tr').length, 13);
    change('language', 'en');
    assert(element('.report-map').textContent.includes('Topic practice map'));
    fitsViewport();
    await go('records', '.backup-panel');
    assert(element('[data-action="backup-export"]'));
    assert(element('#backup-file'));
    await resetUi();
  });

  await test('首页可直接做每日任务，进度点随作答更新，五科路线可打开对应知识点', async () => {
    await resetUi();
    equal(element('.hero .daily-dots').getAttribute('aria-valuenow'), '0');
    assert(element('#sound-toggle').getAttribute('aria-label').includes('音效'));
    click('.hero [data-action="plan-practice"]');
    await waitElement('#question-title');
    await answerUi(true);
    click('[data-action="home"]');
    await waitElement('.hero .daily-dots .filled');
    equal(element('.hero .daily-dots').getAttribute('aria-valuenow'), '1');
    await go('plan', '.roadmap');
    equal(document.querySelectorAll('[data-action="roadmap-subject"]').length, 5);
    click('[data-action="roadmap-subject"][data-subject="biology"]');
    assert(element('[data-subject="biology"][data-action="roadmap-subject"]').getAttribute('aria-pressed') === 'true');
    assert(element('.roadmap').textContent.includes('尚未测评'));
    assert(element('.roadmap [data-topic="natural-selection"]').closest('.roadmap-branch').parentElement.querySelector('[data-topic="trait-frequency"]'));
    fitsViewport();
    click('.roadmap [data-topic="natural-selection"]');
    await waitElement('#practice-form');
    equal(element('#topic').value, 'natural-selection');
    await resetUi();
  });

  await test('题目问题本地保存、可从记录页导出，并随备份迁移', async () => {
    await resetUi();
    const saved = answerPractice(Core.createState(), ['ma-a01'], [true]);
    Core.saveState(localStorage, key, saved);
    replayStorage(key);
    await go('result', '.question-report');
    element('.result-row > details').open = true;
    element('.question-report').open = true;
    element('[data-flag-reason]').value = 'answer';
    click('[data-action="flag-question"]');
    await waitElement('.question-report [role="status"]');
    equal(read().flags.map(flag => [flag.questionId, flag.reason]), [['ma-a01', 'answer']]);
    const fromBackup = Backup.parse(Backup.serialize(read()), questions);
    equal(Backup.merge(Core.createState(), fromBackup, questions).flags, read().flags);
    await go('records', '[data-action="flag-export"]');
    await resetUi();
  });

  await test('本地 AI 不可用时一键开始三道同等级代数题', async () => {
    await resetUi();
    const config = element('meta[name="eachveya-ai-endpoint"]');
    const original = config.dataset.origin;
    config.dataset.origin = 'https://unavailable.example';
    try {
      await openSubject('math');
      click('[data-action="skip-placement"]');
      change('topic', 'algebra');
      change('difficulty', 'L3');
      click('[data-action="ai-fallback"]');
      await waitElement('#question-title');
      equal(read().active.mode, 'practice');
      equal(read().active.questionIds.length, 3);
      assert(read().active.questionIds.every(id => byId.get(id).topic === 'algebra' && byId.get(id).level === 'L3'));
    } finally {
      config.dataset.origin = original;
      await resetUi();
    }
  });

  await test('免费试做支持选题型，单独检查每个步骤，输入格式错误可更正后提交', async () => {
    await resetUi();
    const previousFetch = globalThis.fetch;
    globalThis.fetch = () => { throw new Error('Sample practice made a network request'); };
    try {
      await openSubject('math');
      click('[data-action="skip-placement"]');
      change('topic', 'algebra');
      change('difficulty', 'L3');
      change('ai-format', 'calculation');
      click('[data-action="ai-sample"]');
      await waitElement('#numeric-answer-form');
      equal(read().active.mode, 'algebra-sample');
      assert(element('.question-tags').textContent.includes('计算题'));
      equal(document.querySelectorAll('[data-choice]').length, 0);
      equal(document.querySelectorAll('[data-numeric-input]').length, 2);
      const first = current();
      element('#numeric-0').value = '1/0';
      click('button[form="numeric-answer-form"]');
      assert(!element('#numeric-error').hidden);
      equal(read().attempts.length, 0);
      element('#numeric-0').value = String(first.fields[0].expected);
      element('#numeric-1').value = String(first.fields[1].expected + 1);
      element('#numeric-0').dispatchEvent(new Event('input', { bubbles: true }));
      click('[data-action="hint"]');
      equal(element('#numeric-0').value, String(first.fields[0].expected));
      click('button[form="numeric-answer-form"]');
      assert(element('.numeric-mark.score-ok').textContent.includes('正确'));
      assert(element('.numeric-mark.score-error').textContent.includes('应填'));
      assert(!element('.feedback .answer-line').textContent.includes('□'));
      await finishQuestions(() => true);
      assert(element('.result-panel').textContent.includes('答对'));
      await go('mistakes', '.mistake-card');
      assert(element('.mistake-answer').textContent.includes(String(first.fields[1].expected + 1)));
      click('[data-action="review-one"]');
      await waitElement('#numeric-answer-form');
      await finishQuestions(() => true);
      equal(Core.getMistakes(read(), Core.questionsForState(questions, read())).length, 0);
    } finally {
      globalThis.fetch = previousFetch;
      await resetUi();
    }
  });

  await test('通过文件选择导入学习记录，重复导入不重复作答', async () => {
    await resetUi();
    const imported = answerPractice(Core.createState(), ['ma-a01'], [false]);
    const payload = Backup.serialize(imported);
    await go('records', '#backup-form');
    for (const added of [1, 0]) {
      element('.backup-panel').open = true;
      const files = new DataTransfer();
      files.items.add(new File([payload], 'EachVeya-test.json', { type: 'application/json' }));
      element('#backup-file').files = files.files;
      click('#backup-form button[type="submit"]');
      await waitFor(() => document.querySelector('#backup-status')?.textContent.includes(`新增 ${added} 次作答`), 'Missing import result');
      equal(read().attempts.length, 1);
    }
    await resetUi();
  });

  await test('新科学科目共享测评、五级选题、课程待审核状态和知识地图', async () => {
    await resetUi();
    await openSubject('chemistry');
    assert(element('.placement-panel').textContent.includes('共 6 道'));
    change('topic', 'amount-concentration');
    change('difficulty', 'L5');
    assert(element('#difficulty').selectedOptions[0].textContent.includes('深度探究'));
    change('curriculum', 'ib');
    assert(element('#setup-info').textContent.includes('待审核'));
    assert(element('#practice-form button[type="submit"]').disabled);
    assert(!document.querySelector('[data-action="science-bank"]'));
    change('curriculum', '');
    click('[data-action="science-bank"]');
    await waitElement('#question-title');
    equal(read().active.questionIds.length, 3);
    assert(read().active.questionIds.every(id => byId.get(id).topic === 'amount-concentration' && byId.get(id).level === 'L5'));
    await finishQuestions(() => true);
    await go('report', '.report-map');
    assert(element('.report-map').textContent.includes('物质的量浓度'));
    assert(element('.report-map').textContent.includes('尚未测评掌握等级'));
    change('language', 'en');
    assert(element('.report-map').textContent.includes('Population count density'));
    fitsViewport();
    await resetUi();
  });

  await test('科学 AI 组题用白名单校验、拒绝越界题、失败时保留本地题库入口', async () => {
    await resetUi();
    const config = element('meta[name="eachveya-ai-endpoint"]');
    const original = { endpoint: config.content, origin: config.dataset.origin, enabled: config.dataset.scienceAi };
    const previousFetch = globalThis.fetch;
    const expected = Science.candidates({ subject: 'biology', topic: 'population-density', level: 'L4' }).slice(0, 3).map(item => item.id);
    let calls = 0;
    try {
      config.content = 'https://eachveya.example/api/generate';
      config.dataset.origin = location.origin;
      config.dataset.scienceAi = 'enabled';
      globalThis.fetch = async (url, options) => {
        assert(url.endsWith('/api/science'));
        equal(JSON.parse(options.body), { subject: 'biology', topic: 'population-density', level: 'L4', curriculum: '', weakness: '', avoid: [] });
        calls++;
        const ids = calls === 1 ? [expected[0], expected[0], 'ma-a01'] : expected;
        return { ok: true, json: async () => ({ questionIds: ids }) };
      };
      await openSubject('biology');
      change('topic', 'population-density');
      change('difficulty', 'L4');
      click('[data-action="science-ai"]');
      await waitElement('.ai-notice');
      await waitFor(() => element('.ai-notice').textContent.includes('未通过'), 'Invalid science response did not raise an error');
      assert(element('[data-action="science-bank"]'));
      equal(read().active, null);
      click('[data-action="science-ai"]');
      await waitElement('#question-title');
      equal(read().active.mode, 'science-ai');
      equal(read().active.questionIds, expected);
      assert(element('.eyebrow').textContent.includes('AI 题库选题'));
    } finally {
      globalThis.fetch = previousFetch;
      config.content = original.endpoint;
      if (original.origin === undefined) delete config.dataset.origin;
      else config.dataset.origin = original.origin;
      if (original.enabled === undefined) delete config.dataset.scienceAi;
      else config.dataset.scienceAi = original.enabled;
      await resetUi();
    }
  });

  await test('AI 出题不把自动推荐的 L4 或手选 L5 偷换成 L3，题库入口保持原级', async () => {
    await resetUi();
    const state = placement('math', item => item.topic === 'algebra');
    Core.saveState(localStorage, key, state);
    replayStorage(key);
    await openSubject('math');
    change('topic', 'algebra');
    change('difficulty', 'auto');
    assert(!document.querySelector('[data-action="ai-start"], [data-action="ai-sample"]'));
    assert(element('.math-ai-panel .ai-notice').textContent.includes('L4'));
    equal(element('[data-action="ai-fallback"]').dataset.level, 'L4');
    change('difficulty', 'L5');
    assert(element('.math-ai-panel .ai-notice').textContent.includes('L5'));
    click('[data-action="ai-fallback"]');
    await waitElement('#question-title');
    assert(read().active.questionIds.every(id => byId.get(id)?.level === 'L5'));
    await resetUi();
  });

  await test('AI 出题从数学设置开始，额度提示、验算保存和错题重做完整可用', async () => {
    const config = element('meta[name="eachveya-ai-endpoint"]');
    const previousEndpoint = config.content;
    const previousOrigin = config.dataset.origin;
    const previousFetch = globalThis.fetch;
    let calls = 0;
    try {
      config.content = 'https://eachveya.example/api/generate';
      config.dataset.origin = 'https://offline.example';
      globalThis.fetch = async (url, options) => {
        equal(url, config.content);
        equal(JSON.parse(options.body), { level: 'L2', avoid: [] });
        calls++;
        return calls === 1 ? { ok: false, status: 429 } : { ok: true, json: async () => ({ questions: aiFixture }) };
      };
      await resetUi();
      await openSubject('math');
      click('[data-action="skip-placement"]');
      assert(element('[data-online-practice]'));
      assert(!document.querySelector('[data-action="ai-start"]'));
      config.dataset.origin = location.origin;
      change('topic', 'geometry');
      assert(!document.querySelector('[data-action="ai-start"]'));
      change('topic', 'algebra');
      change('difficulty', 'L2');
      change('ai-format', 'mixed');
      click('[data-action="ai-start"]');
      assert(element('[data-action="ai-start"]').disabled);
      await waitFor(() => element('.ai-notice').textContent.includes('额度已用完'), 'Missing quota notice');
      equal(element('[data-action="ai-fallback"]').dataset.level, 'L2');
      equal(read().active, null);
      click('[data-action="ai-start"]');
      await waitElement('#question-title');
      equal(calls, 2);
      equal(read().active.questionIds.length, 3);
      assert(element('.question-tags').textContent.includes('AI 生成'));
      equal(current().format, 'fill');
      const wrong = current().id;
      await answerUi(false);
      replayStorage(key);
      assert(element('.feedback').textContent.includes('正确答案'));
      await finishQuestions(() => true);
      await go('mistakes', '.mistake-card');
      click(`[data-action="review-one"][data-id="${wrong}"]`);
      await waitElement('#question-title');
      await finishQuestions(() => true);
      equal(Core.getMistakes(read(), Core.questionsForState(questions, read())).length, 0);
      assert(read().generated.some(spec => spec.format === 'calculation'));
      fitsViewport();
    } finally {
      config.content = previousEndpoint;
      if (previousOrigin === undefined) delete config.dataset.origin;
      else config.dataset.origin = previousOrigin;
      globalThis.fetch = previousFetch;
      await resetUi();
    }
  });

  await test('AI 重复点击只发一个请求，网络错误和超时均能恢复同级练习入口', async () => {
    await resetUi();
    const config = element('meta[name="eachveya-ai-endpoint"]');
    const endpoint = config.content, origin = config.dataset.origin;
    const fetch = globalThis.fetch, schedule = globalThis.setTimeout;
    let calls = 0, rejectRequest;
    try {
      config.content = 'https://eachveya.example/api/generate';
      config.dataset.origin = location.origin;
      globalThis.setTimeout = (run, delay, ...args) => schedule(run, delay === 25000 ? 15 : delay, ...args);
      globalThis.fetch = (_, { signal }) => new Promise((resolve, reject) => {
        calls++;
        rejectRequest = reject;
        signal.addEventListener('abort', () => reject(new Error('Request timeout')), { once: true });
      });
      await openSubject('math');
      click('[data-action="skip-placement"]');
      change('topic', 'algebra');
      change('difficulty', 'L2');
      click('[data-action="ai-start"]');
      const busyButton = element('[data-action="ai-start"]');
      assert(busyButton.disabled);
      busyButton.click();
      equal(calls, 1);
      rejectRequest(new Error('Network disconnected'));
      await waitElement('[data-action="ai-fallback"]');
      assert(!element('[data-action="ai-start"]').disabled);
      equal(read().active, null);
      click('[data-action="ai-start"]');
      await waitElement('[data-action="ai-fallback"]');
      equal(calls, 2);
      assert(!element('[data-action="ai-start"]').disabled);
      equal(element('[data-action="ai-fallback"]').dataset.level, 'L2');
      equal(read().active, null);
      assert(!read().generated.length);
    } finally {
      config.content = endpoint;
      if (origin === undefined) delete config.dataset.origin;
      else config.dataset.origin = origin;
      globalThis.fetch = fetch;
      globalThis.setTimeout = schedule;
      await resetUi();
    }
  });

  const failed = results.filter(result => !result.passed);
  const report = document.createElement('section');
  report.id = 'test-results';
  report.dataset.status = failed.length ? 'failed' : 'passed';
  report.dataset.passed = results.length - failed.length;
  report.dataset.total = results.length;
  report.style.cssText = 'position:relative;z-index:30;background:#fff;padding:20px;margin:15px;border:2px solid #527b3d;overflow-wrap:anywhere;';
  const title = document.createElement('h1');
  title.textContent = `Tests ${results.length - failed.length}/${results.length} passed`;
  report.appendChild(title);
  for (const result of results) {
    const line = document.createElement('p');
    line.textContent = `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? ` — ${result.error}` : ''}`;
    line.style.color = result.passed ? '#22592c' : '#a52020';
    report.appendChild(line);
  }
  document.body.prepend(report);
  document.title = `EachVeya tests ${results.length - failed.length}/${results.length}`;
  globalThis.SmartStudyTestResults = results;
})();
