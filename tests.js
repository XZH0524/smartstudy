/* Browser-native tests. Test mode uses a separate storage key from real study history. */
(async function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const { questions, subjects } = globalThis.SmartStudyData;
  const results = [];
  const assert = (condition, message = 'Assertion failed') => { if (!condition) throw new Error(message); };
  const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected), `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  const throws = callback => { let thrown = false; try { callback(); } catch (_) { thrown = true; } assert(thrown, 'Expected an error'); };
  const test = async (name, callback) => {
    try { await callback(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  };
  const wait = () => new Promise(resolve => setTimeout(resolve, 35));
  const fitsViewport = () => assert(document.documentElement.scrollWidth <= window.innerWidth, `Overflow ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
  const click = selector => { const target = document.querySelector(selector); assert(target, `Missing ${selector}`); assert(!target.disabled, `Disabled ${selector}`); target.click(); };
  const change = (id, value) => { const target = document.getElementById(id); assert(target, `Missing #${id}`); target.value = value; target.dispatchEvent(new Event('change', { bubbles: true })); };
  const read = () => JSON.parse(localStorage.getItem('smart-study.tests.v1')) || Core.createState();
  const currentQuestion = () => { const state = read(); return questions.find(question => question.id === state.active.questionIds[state.active.index]); };
  const start = options => Core.startSession(Core.createState(), questions, { subject: 'math', count: 2, ...options }, () => 0.5);
  const answerCurrent = (state, correct = true) => {
    const question = questions.find(question => question.id === state.active.questionIds[state.active.index]);
    return Core.gradeAnswer(state, questions, correct ? question.answer : (question.answer + 1) % question.options.length);
  };
  const resetUi = async () => {
    localStorage.removeItem('smart-study.tests.v1');
    window.dispatchEvent(new StorageEvent('storage', { key: 'smart-study.tests.v1' }));
    location.hash = 'home';
    await wait();
  };

  await test('题库含 48 道唯一题目，每科 24 道', () => {
    equal(questions.length, 48); equal(new Set(questions.map(question => question.id)).size, 48);
    equal(questions.filter(question => question.subject === 'english').length, 24);
    equal(questions.filter(question => question.subject === 'math').length, 24);
  });
  await test('所有题目有双语题干、四个选项、有效答案和双语解析', () => {
    for (const question of questions) {
      assert(subjects.some(subject => subject.id === question.subject && subject.available));
      equal(question.options.length, 4);
      assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
      assert(['easy', 'medium', 'hard'].includes(question.difficulty));
      for (const lang of ['zh', 'en']) {
        assert(question.prompt[lang]?.length > 0); assert(question.explanation[lang]?.length > 0);
        assert(question.options.every(option => typeof option[lang] === 'string' && option[lang].length > 0));
        equal(new Set(question.options.map(option => option[lang])).size, 4);
      }
    }
  });
  await test('预留物理和化学科目', () => equal(subjects.filter(subject => !subject.available).map(subject => subject.id), ['physics', 'chemistry']));
  await test('新用户统计不显示虚构正确率', () => equal(Core.getStats(Core.createState(), questions).accuracy, null));
  await test('按科目和难度筛选，不重复抽题', () => {
    const ids = Core.chooseQuestions(questions, { subject: 'english', difficulty: 'hard', count: 8 });
    equal(ids.length, 6); equal(new Set(ids).size, 6);
    assert(ids.every(id => questions.find(question => question.id === id).difficulty === 'hard'));
  });
  await test('题数超过题库时安全缩减，题库原始顺序不变', () => {
    const order = questions.map(question => question.id);
    equal(Core.chooseQuestions(questions, { subject: 'math', count: 100 }).length, 24);
    equal(questions.map(question => question.id), order);
  });
  await test('无匹配题目和非法数量会报错', () => {
    throws(() => start({ subject: 'physics' })); throws(() => start({ count: 0 })); throws(() => start({ count: 1.5 }));
  });
  await test('未作答时不能跳过题目', () => throws(() => Core.advanceSession(start(), questions)));
  await test('无效答案不能计入记录', () => {
    for (const choice of [-1, 4, null, 1.5, '1']) throws(() => Core.gradeAnswer(start(), questions, choice));
  });
  await test('批改正确答案并保持原状态不变', () => {
    const original = start(); const graded = answerCurrent(original);
    equal(original.attempts.length, 0); equal(graded.attempts.length, 1); equal(graded.attempts[0].correct, true);
  });
  await test('重复提交同一道题不会重复计分或改答案', () => {
    const state = answerCurrent(start()); const again = Core.gradeAnswer(state, questions, 0);
    equal(again, state); equal(again.attempts.length, 1);
  });
  await test('错误答案自动进入错题本', () => {
    const state = answerCurrent(start(), false);
    equal(Core.getMistakes(state, questions).length, 1); equal(Core.getStats(state, questions).accuracy, 0);
  });
  await test('再次答错保留错题并累计错误次数', () => {
    let state = answerCurrent(start({ count: 1 }), false);
    const ids = [state.active.questionIds[0]];
    state = Core.startSession(state, questions, { subject: 'math', ids, count: 1, mode: 'review' });
    state = answerCurrent(state, false);
    equal(Core.getMistakes(state, questions)[0].wrongCount, 2);
  });
  await test('复习答对后自动移出错题本', () => {
    let state = answerCurrent(start({ count: 1 }), false);
    const ids = [state.active.questionIds[0]];
    state = Core.startSession(state, questions, { subject: 'math', ids, count: 1, mode: 'review' });
    state = answerCurrent(state);
    equal(Core.getMistakes(state, questions).length, 0); equal(Core.getStats(state, questions).accuracy, 50);
  });
  await test('完成练习正确汇总，下一题不重复计分', () => {
    let state = answerCurrent(start()); state = Core.advanceSession(state, questions);
    state = answerCurrent(state, false); state = Core.advanceSession(state, questions);
    equal(state.active, null); equal(state.sessions.length, 1); equal(state.sessions[0].correct, 1);
    equal(state.attempts.length, 2); throws(() => Core.advanceSession(state, questions));
  });
  await test('刷新恢复已提交的答案，保持批改锁定', () => {
    const state = answerCurrent(start());
    const restored = Core.normalizeState(JSON.parse(JSON.stringify(state)), questions);
    equal(restored, state); equal(Core.gradeAnswer(restored, questions, 0).attempts.length, 1);
  });
  await test('完成记录可往返保存，正确率从作答重新计算', () => {
    let state = answerCurrent(start({ count: 1 })); state = Core.advanceSession(state, questions);
    state.sessions[0].correct = 0; state.attempts[0].correct = false;
    const restored = Core.normalizeState(state, questions);
    equal(restored.sessions[0].correct, 1); equal(restored.attempts[0].correct, true);
  });
  await test('受损旧记录忽略未知题目、非法答案和重复提交', () => {
    const state = answerCurrent(start());
    state.attempts.push({ ...state.attempts[0] }, { questionId: 'removed' }, { ...state.attempts[0], sessionId: 'bad', choice: 99 });
    equal(Core.normalizeState(state, questions).attempts.length, 1);
  });
  await test('受损练习不能越过尚未作答的题目', () => {
    const state = start(); state.active.index = 100; state.active.answers = { [state.active.questionIds[0]]: 2 };
    const restored = Core.normalizeState(state, questions);
    equal(restored.active.index, 0); equal(restored.active.answers, {});
  });
  await test('未知版本和损坏的顶层记录会被识别', () => {
    throws(() => Core.normalizeState({ version: 99 }, questions)); throws(() => Core.normalizeState(null, questions));
  });
  await test('七天统计使用本地日期并跨月计算', () => {
    const state = Core.createState(); const now = new Date(2026, 2, 2, 12);
    state.attempts = [{ at: new Date(2026, 2, 2, 0, 1).toISOString() }, { at: new Date(2026, 2, 1, 23, 59).toISOString() }];
    const days = Core.dailyStats(state, now);
    equal(days.length, 7); equal(Core.localDate(days[0].date), '2026-02-24'); equal(days[5].total, 1); equal(days[6].total, 1);
  });
  await test('按科目统计隔离英语和数学', () => {
    const state = answerCurrent(start());
    equal(Core.getStats(state, questions, 'english').total, 0); equal(Core.getStats(state, questions, 'math').total, 1);
  });

  await resetUi();
  await test('界面初始为中文，零记录显示正常', () => {
    equal(document.documentElement.lang, 'zh-CN'); assert(document.querySelector('h1').textContent.includes('进步'));
    equal(document.querySelectorAll('.subject-card').length, 2); assert(document.querySelector('.stats-grid').textContent.includes('暂无数据'));
  });
  await test('英语切换同步导航、内容和文档语言', () => {
    change('language', 'en'); equal(document.documentElement.lang, 'en');
    assert(document.querySelector('h1').textContent.includes('progress')); assert(document.querySelector('nav').textContent.includes('Overview'));
  });
  await test('设置按困难题实际数量缩减，并启动练习', async () => {
    click('[data-action="subject"][data-subject="math"]'); await wait();
    change('difficulty', 'hard'); change('count', '12');
    assert(document.getElementById('setup-info').textContent.includes('6 questions'));
    document.getElementById('practice-form').requestSubmit(); await wait();
    equal(read().active.questionIds.length, 6); equal(document.querySelectorAll('.option').length, 4);
    assert(document.querySelector('[data-action="grade"]').disabled);
    fitsViewport();
  });
  await test('键盘方向键选择选项，提交前不暴露解析', () => {
    assert(!document.querySelector('.feedback'));
    const first = document.querySelector('[data-choice="0"]'); first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    equal(document.querySelector('[aria-checked="true"]').dataset.choice, '1');
  });
  await test('答错显示正确答案及解析，且锁定选项', () => {
    const question = currentQuestion(); click(`[data-choice="${(question.answer + 1) % 4}"]`); click('[data-action="grade"]');
    equal(read().attempts.length, 1); equal(Core.getMistakes(read(), questions).length, 1);
    assert(document.querySelector('.feedback.wrong')); assert(document.querySelector('.feedback').textContent.includes(question.explanation.en));
    assert([...document.querySelectorAll('.option')].every(option => option.disabled));
    fitsViewport();
  });
  await test('语言切换保留已批改答案和分数', () => {
    change('language', 'zh'); equal(read().attempts.length, 1); assert(document.querySelector('.feedback').textContent.includes('解析'));
    assert(document.querySelector('[data-action="next"]'));
  });
  await test('返回主页后能恢复未完成练习', async () => {
    const id = read().active.id; click('[data-action="home"]'); await wait();
    click('[data-action="resume"]'); await wait();
    equal(read().active.id, id); assert(document.querySelector('.feedback')); equal(read().attempts.length, 1);
  });
  await test('完成六题，结果正确汇总', async () => {
    click('[data-action="next"]');
    while (read().active) {
      const question = currentQuestion(); click(`[data-choice="${question.answer}"]`); click('[data-action="grade"]');
      click('[data-action="next"]'); await wait();
    }
    equal(read().sessions.length, 1); equal(read().sessions[0].correct, 5); equal(read().attempts.length, 6);
    assert(document.querySelector('.result-score').textContent.includes('83')); equal(document.querySelectorAll('.result-row').length, 6);
    fitsViewport();
  });
  await test('结果页支持仅复习本次错题，答对后错题清除', async () => {
    click('[data-action="review-result"]'); await wait(); equal(read().active.mode, 'review'); equal(read().active.questionIds.length, 1);
    const question = currentQuestion(); click(`[data-choice="${question.answer}"]`); click('[data-action="grade"]');
    equal(Core.getMistakes(read(), questions).length, 0); click('[data-action="next"]'); await wait();
    location.hash = 'mistakes'; await wait(); assert(document.querySelector('.empty-state'));
  });
  await test('取消新练习会保留当前练习', async () => {
    click('[data-action="setup"]'); await wait();
    document.getElementById('practice-form').requestSubmit(); await wait();
    const id = read().active.id;
    location.hash = 'home'; await wait(); click('[data-action="subject"][data-subject="english"]'); await wait();
    document.getElementById('practice-form').requestSubmit(); await wait();
    assert(document.getElementById('confirm-dialog').open); click('#dialog-cancel'); await wait(); equal(read().active.id, id);
  });
  await test('确认开始新练习切换科目，并保留累计记录', async () => {
    document.getElementById('practice-form').requestSubmit(); await wait(); click('#dialog-confirm'); await wait();
    equal(read().active.subject, 'english'); equal(read().attempts.length, 7);
  });
  await test('错题本科目筛选与单题复习工作正常', async () => {
    const question = currentQuestion(); click(`[data-choice="${(question.answer + 1) % 4}"]`); click('[data-action="grade"]');
    location.hash = 'mistakes'; await wait(); equal(document.querySelectorAll('.mistake-card').length, 1);
    click('[data-filter="math"]'); assert(document.querySelector('.empty-state'));
    click('[data-filter="english"]'); equal(document.querySelectorAll('.mistake-card').length, 1);
    fitsViewport();
    click('[data-action="review-one"]'); await wait(); click('#dialog-confirm'); await wait();
    equal(read().active.mode, 'review'); equal(read().active.questionIds, [question.id]);
  });
  await test('清除记录必须确认，确认后统计归零', async () => {
    location.hash = 'home'; await wait(); const total = read().attempts.length;
    click('[data-action="clear"]'); await wait(); click('#dialog-cancel'); await wait(); equal(read().attempts.length, total);
    click('[data-action="clear"]'); await wait(); click('#dialog-confirm'); await wait();
    equal(read().attempts.length, 0); equal(read().active, null); equal(read().sessions.length, 0);
  });
  await test('受损存储能恢复界面并给出提示', async () => {
    localStorage.setItem('smart-study.tests.v1', '{bad json');
    window.dispatchEvent(new StorageEvent('storage', { key: 'smart-study.tests.v1' }));
    assert(!document.getElementById('storage-notice').hidden); assert(document.querySelector('h1'));
    change('language', 'en'); equal(read().language, 'en'); assert(document.getElementById('storage-notice').hidden);
  });
  await test('当前视口内容不产生水平溢出', fitsViewport);
  await test('存储空间不足时保持可练习并明确提示', async () => {
    const originalSetItem = Storage.prototype.setItem;
    try {
      Storage.prototype.setItem = function () { throw new DOMException('Test storage quota', 'QuotaExceededError'); };
      change('language', 'zh'); assert(!document.getElementById('storage-notice').hidden);
      assert(document.getElementById('storage-notice').textContent.includes('无法保存'));
      click('[data-action="subject"][data-subject="english"]'); await wait();
      document.getElementById('practice-form').requestSubmit(); await wait();
      click('[data-choice="0"]'); click('[data-action="grade"]'); assert(document.querySelector('.feedback'));
    } finally { Storage.prototype.setItem = originalSetItem; }
  });

  const failed = results.filter(result => !result.passed);
  const report = document.createElement('section');
  report.id = 'test-results';
  report.dataset.status = failed.length ? 'failed' : 'passed';
  report.dataset.passed = results.length - failed.length;
  report.dataset.total = results.length;
  report.style.cssText = 'position:relative;z-index:30;background:#fff;padding:30px;margin:20px;border:2px solid #527b3d;font-family:system-ui;';
  const title = document.createElement('h1'); title.textContent = `Tests ${results.length - failed.length}/${results.length} passed`;
  report.appendChild(title);
  for (const result of results) {
    const line = document.createElement('p');
    line.textContent = `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? ` — ${result.error}` : ''}`;
    line.style.color = result.passed ? '#22592c' : '#a52020'; report.appendChild(line);
  }
  document.body.prepend(report);
  document.title = `Smart Study tests ${results.length - failed.length}/${results.length}`;
  globalThis.SmartStudyTestResults = results;
})();
