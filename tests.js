/* Open index.html?test=1 to run the suite with separate test storage. */
(async function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const { questions, subjects, topics, topicsBySubject, levels, skills, curricula } = globalThis.SmartStudyData;
  const byId = new Map(questions.map(question => [question.id, question]));
  const key = 'smart-study.tests.v2';
  const legacyKey = 'smart-study.tests.v1';
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
      assert(item.subject === 'math' ? skills[item.skill] && Array.isArray(item.curriculumRefs) : item.track === 'cefr', item.id);
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
    equal(curricula.map(item => item.id), ['cn', 'gcse', 'igcse', 'common-core', 'ib']);
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

  await test('所有函数 L3 变式的正确值可从题干数据重新算出', () => {
    for (const id of mathIds('functions', 'L3', 10)) {
      const item = byId.get(id);
      const [, first, second] = item.prompt.en.match(/f\(0\) = (\d+) and f\(2\) = (\d+)/);
      equal(Number(item.options[item.answer].en), Number(first) + (Number(second) - Number(first)) * 2.5);
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
    throws(() => start({ subject: 'physics' }));
    const state = start();
    for (const choice of [-1, 4, null, 1.5, '1']) throws(() => Core.gradeAnswer(state, questions, choice));
    throws(() => Core.advanceSession(state, questions));
  });

  await test('批改正确保留原状态，同题重复提交只计一次', () => {
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

  await test('数学诊断恰有 10 题、每领域 2 题，未完成不生成推荐', () => {
    const ids = Learning.diagnosticIds('math');
    equal(ids.length, 10);
    for (const topic of topicsBySubject.math) equal(ids.filter(id => byId.get(id).topic === topic).length, 2);
    const state = answerCurrent(start({ ids, count: 10, mode: 'diagnostic' }));
    equal(Learning.latestPlacement(state, 'math'), null);
  });

  await test('数学诊断可分别推荐代数 L4、几何 L2 和其他领域 L1', () => {
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

  await test('重新诊断从最近的结果出发，保留此前的作答', () => {
    const state = answerPractice(Core.createState(), mathIds('algebra', 'L2'), Array(5).fill(true), new Date(2026, 3, 1, 9).toISOString());
    const retested = placement('math', item => item.topic === 'geometry', state);
    equal(retested.attempts.length, 15);
    equal(Learning.mathProfile(retested).algebra.level, 'L1');
    equal(Learning.mathProfile(retested).geometry.level, 'L4');
  });

  await test('英语短测为 12 题且只给 A1–B2 起点，手选可用 C2', () => {
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
    equal(state.version, 2);
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

  await test('新版保存使用新键，原始 v1 备份内容保持完整', () => {
    const legacyJson = JSON.stringify(oldRecord());
    const data = new Map([[legacyKey, legacyJson]]);
    const storage = { getItem: name => data.get(name) ?? null, setItem: (name, value) => data.set(name, value) };
    const migrated = Core.readState(storage, key, legacyKey, questions);
    Core.saveState(storage, key, migrated);
    equal(data.get(legacyKey), legacyJson);
    equal(Core.readState(storage, key, legacyKey, questions), migrated);
    data.set(key, '{damaged');
    throws(() => Core.readState(storage, key, legacyKey, questions));
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
  const read = () => Core.readState(localStorage, key, legacyKey, questions);
  const replayStorage = name => window.dispatchEvent(new StorageEvent('storage', { key: name }));
  const current = () => byId.get(read().active.questionIds[read().active.index]);
  const submitForm = () => click('#practice-form button[type="submit"]');

  async function go(hash, selector) {
    location.hash = hash;
    await waitElement(selector);
  }

  async function resetUi() {
    localStorage.removeItem(key);
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
  await test('新用户首页显示真实零记录，语言切换更新 EachVeya 品牌与导航', () => {
    equal(document.documentElement.lang, 'zh-CN');
    assert(element('.stats-grid').textContent.includes('暂无数据'));
    equal(element('#brand').getAttribute('aria-label'), 'EachVeya 学验共途');
    assert(!element('#brand-local-name').hidden);
    assert(document.title.includes('EachVeya 学验共途'));
    change('language', 'en');
    equal(document.documentElement.lang, 'en');
    equal(element('#brand').getAttribute('aria-label'), 'EachVeya');
    assert(element('#brand-local-name').hidden);
    equal(document.title, 'Overview · EachVeya');
    assert(element('#navigation').textContent.includes('Progress'));
    fitsViewport();
  });

  await test('数学首次进入显示诊断入口，完成 10 道后展示分领域起点', async () => {
    await openSubject('math');
    assert(document.querySelector('[data-action="skip-placement"]'));
    assert(!document.querySelector('#difficulty'));
    click('[data-action="diagnostic"]');
    await waitElement('#question-title');
    equal(read().active.mode, 'diagnostic');
    equal(read().active.questionIds.length, 10);
    assert(!document.querySelector('[data-action="hint"]'));
    await answerUi(false);
    assert(!document.querySelector('.answer-line'));
    await finishQuestions(item => item.topic === 'algebra' || (item.topic === 'geometry' && item.level === 'L2'));
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
    assert(algebra.textContent.includes('Placement start L4'));
    assert(geometry.textContent.includes('Placement start L2'));
    assert(algebra.textContent.includes('2/2 correct'));
    assert(element('.topic-record[data-topic="grammar"]').textContent.includes('No answers yet'));
    equal(document.querySelectorAll('.topic-record').length, 8);
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

  await test('英语短测完成后显示 B2 起点，错题列表提供技能推荐', async () => {
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
    equal(JSON.parse(localStorage.getItem(key)).version, 2);
    equal(localStorage.getItem(legacyKey), payload);
    await go('mistakes', '.mistake-list');
    equal(document.querySelectorAll('.mistake-card').length, 1);
    assert(element('.mistake-card').textContent.includes('school every day'));
    fitsViewport();
  });

  await test('跳过数学诊断会记住选择，但仍可从设置打开诊断', async () => {
    await resetUi();
    await openSubject('math');
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
