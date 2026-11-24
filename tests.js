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
  const key = 'smart-study.tests.v5';
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

  await test('双语题干、解析、难度标签及四个不同选项齐全', () => {
    for (const item of questions) {
      assert(subjects.some(subject => subject.id === item.subject && subject.available), item.id);
      assert(topics[item.topic] && topicsBySubject[item.subject].includes(item.topic), item.id);
      assert(levels[item.subject].includes(item.level), item.id);
      assert(item.subject === 'english' ? item.track === 'cefr' : skills[item.skill] && Array.isArray(item.curriculumRefs), item.id);
      equal(item.options.length, 4);
      assert(Number.isInteger(item.answer) && !!item.options[item.answer], item.id);
      for (const lang of ['zh', 'en']) {
        assert(item.prompt[lang]?.length && item.explanation[lang]?.length, item.id);
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

  await test('三门科学每门三个领域及知识点，全部五级覆盖并校验数值与证据题', () => {
    equal(Science.questions.length, 918);
    equal(new Set(Science.questions.map(item => item.prompt.en)).size, 918);
    for (const subject of Science.subjects) {
      equal(topicsBySubject[subject].length, 3);
      equal(new Set(topicsBySubject[subject].map(topic => Science.topics[topic].domain)).size, 3);
      equal(Learning.diagnosticIds(subject).length, 6);
      for (const topic of topicsBySubject[subject]) for (const level of levels[subject]) {
        const items = Science.candidates({ subject, topic, level });
        equal(items.length, 8);
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
    assert(Object.values(profile).every(row => row.basis === 'diagnostic' && row.retained === null));
    assert(Object.values(Learning.subjectProfile(physics, 'biology')).every(row => row.basis === 'starting' && row.retained === null));
    equal(Learning.practicePool(physics, { subject: 'physics', topic: 'average-speed', level: 'L5' }).length, 8);
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
    equal(ids.length, 10);
    equal(new Set(ids).size, 10);
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
    const state = answerPractice(Core.createState(), mathIds('algebra', 'L2'), [true, true, false, true, true]);
    const profile = Learning.mathProfile(state);
    equal(profile.algebra.level, 'L3');
    equal(profile.algebra.basis, 'practice');
    equal(profile.algebra.lastBatch.independent, 4);
    equal(profile.geometry.level, 'L2');
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

  await test('两道快速错答让系统多收集证据，慢答和已存历史不会因速度降级', () => {
    const ids = mathIds('algebra', 'L2', 5);
    let state = start({ ids, count: ids.length });
    ids.forEach((id, index) => {
      const question = byId.get(id);
      const choice = index === 0 ? question.answer : (question.answer + 1) % 4;
      state = Core.advanceSession(Core.gradeAnswer(state, questions, choice, knownTime, index < 3 ? 800 : 25_000), questions, knownTime);
    });
    const row = Learning.mathProfile(Core.normalizeState(state, questions)).algebra;
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
    equal(weekly.errors, [['common-denominator', 1]]);
    equal(Coach.report(state, questions, 30, now).recent.total, 3);
    equal(Coach.report(state, questions, 1, now).recent.accuracy, 100);
    equal(Coach.report(Core.createState(), questions, 30, now).recent.accuracy, null);
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

  await test('AI 题保存并恢复作答和错题，计入记录但不参与等级调整', () => {
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
    equal(Learning.mathProfile(state).algebra.evidence, 0);
    throws(() => Core.startAiSession(state, questions, 'L2', aiFixture));
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
  const read = () => Core.readState(localStorage, key, [previousKey, legacyKey], questions);
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

  async function answerUi(correct) {
    const item = current();
    const answer = correct ? item.answer : (item.answer + 1) % 4;
    click(`[data-choice="${answer}"]`);
    click('[data-action="grade"]');
    await waitElement('.feedback');
  }

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
    assert(element('.hero-copy p').textContent.includes('答案解析'));
    change('language', 'en');
    equal(document.documentElement.lang, 'en');
    equal(element('#brand').getAttribute('aria-label'), 'EachVeya');
    assert(element('#brand-local-name').hidden);
    equal(document.title, 'Overview · EachVeya');
    assert(element('#navigation').textContent.includes('Progress'));
    equal(element('main h1').textContent, 'EachVeya');
    assert(element('.page-heading .subtitle').textContent.includes('English and mathematics practice for secondary school students'));
    assert(element('.hero-copy p').textContent.includes('multiple-choice questions'));
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
    change('count', '5');
    assert(element('#setup-info').textContent.includes('10 questions'));
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
    assert(element('#setup-info').textContent.includes('2'));
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
    assert(algebra.textContent.includes('1/5 道有效练习题'));
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

  await test('学习计划可编辑、发起正确主题练习并进入真实报告和备份入口', async () => {
    await resetUi();
    await go('report', '.report-map');
    assert(element('.report-map').textContent.includes('尚未测评'));
    assert(!document.querySelector('.report-charts'));
    await go('plan', '#plan-form');
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
    change('language', 'en');
    assert(element('.report-map').textContent.includes('Topic practice map'));
    fitsViewport();
    await go('records', '.backup-panel');
    assert(element('[data-action="backup-export"]'));
    assert(element('#backup-file'));
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
    assert(read().active.questionIds.every(id => id.startsWith('sci-amount-concentration-L5-')));
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
    const original = { origin: config.dataset.origin, enabled: config.dataset.scienceAi };
    const previousFetch = globalThis.fetch;
    const expected = Science.candidates({ subject: 'biology', topic: 'population-density', level: 'L4' }).slice(0, 3).map(item => item.id);
    let calls = 0;
    try {
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
      assert(element('.eyebrow').textContent.includes('AI 组题'));
    } finally {
      globalThis.fetch = previousFetch;
      config.dataset.origin = original.origin;
      if (original.enabled === undefined) delete config.dataset.scienceAi;
      else config.dataset.scienceAi = original.enabled;
      await resetUi();
    }
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
      fitsViewport();
    } finally {
      config.content = previousEndpoint;
      if (previousOrigin === undefined) delete config.dataset.origin;
      else config.dataset.origin = previousOrigin;
      globalThis.fetch = previousFetch;
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
