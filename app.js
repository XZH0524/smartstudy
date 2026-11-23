(function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const { subjects, topics, topicsBySubject, levels, skills, curricula, questions } = globalThis.SmartStudyData;
  const brandName = 'EachVeya';
  const testing = new URLSearchParams(location.search).get('test');
  // The original keys also hold the records created before the rename.
  const LEGACY_STORAGE_KEY = testing ? 'smart-study.tests.v1' : 'smart-study.v1';
  const STORAGE_KEY = LEGACY_STORAGE_KEY.replace(/v1$/, 'v2');
  const byId = new Map(questions.map(question => [question.id, question]));
  const copy = {
    home: ['学习主页', 'Overview'], practice: ['开始练习', 'Practice'], mistakes: ['错题复习', 'Mistakes'], records: ['学习记录', 'Progress'],
    skip: ['跳至主要内容', 'Skip to main content'], navigation: ['主导航', 'Main navigation'], language: ['界面语言', 'Interface language'],
    brand: [`${brandName} 学验共途`, brandName],
    metaDescription: [`${brandName} 学验共途是面向全球中学生的英语和数学练习平台，提供答案解析和错题复习。`,
      `${brandName} offers English and mathematics practice for secondary school students, with answer explanations and mistake review.`],
    local: ['学习记录保存在此浏览器', 'Study data stays in this browser'],
    disciplines: ['英语与数学', 'English & mathematics'],
    welcomeSub: ['面向全球中学生的英语和数学练习平台。', 'English and mathematics practice for secondary school students around the world.'],
    workspace: ['练习概览', 'Practice overview'], heroTitle: ['选择知识点和难度', 'Choose a topic and level'],
    heroText: ['做选择题、查看答案解析，并复习答错的题目。', 'Answer multiple-choice questions, read the explanations and revisit mistakes.'],
    resume: ['继续上次练习', 'Continue practice'], answered: ['累计作答', 'Answers submitted'], accuracy: ['作答正确率', 'Answer accuracy'],
    pending: ['待复习错题', 'Mistakes to revisit'], questionsUnit: ['题', 'questions'], noData: ['暂无数据', 'No data yet'], subjects: ['选择你的科目', 'Choose your subject'],
    available: ['{n} 个科目可练习', '{n} subjects ready to explore'], questionBank: ['{n} 道练习题', '{n} practice questions'], coverage: ['累计作答 {n} 次', '{n} answers submitted'],
    start: ['开始练习', 'Start practice'], lastWeek: ['最近 7 天', 'The last 7 days'], activity: ['每日作答', 'Daily answers'], moreSubjects: ['更多探索，即将开启', 'More to explore, soon'],
    comingSoon: ['即将推出', 'Coming soon'], setupTitle: ['选择适合你的练习', 'Find your next practice'], setupSub: ['选择科目、知识点和等级，或按推荐开始。', 'Choose a subject, topic and level, or start with a recommendation.'],
    settings: ['练习设置', 'Practice settings'], subject: ['科目', 'Subject'], difficulty: ['练习等级', 'Practice level'], topic: ['知识点', 'Topic'],
    allTopics: ['所有知识点', 'All topics'], autoMath: ['按知识点推荐', 'Recommended by topic'],
    autoEnglish: ['推荐起点 {level}', 'Recommended start {level}'], starterEnglish: ['从 A1 开始', 'Start at A1'],
    count: ['题目数量', 'Number of questions'],
    questionCount: ['{n} 题', '{n} questions'], allQuestions: ['全部匹配题目', 'All matching questions'],
    setupInfo: ['当前匹配 {n} 道，本次练习 {count} 道，优先安排没做过的题。', '{n} questions match. This set includes {count}, with untried questions first.'],
    mathScale: ['L1 为入门，L5 为挑战。等级按知识点分别推荐。', 'L1 is the starting tier and L5 is the most challenging. Each topic has its own recommendation.'],
    curriculumPlan: ['课程体系规划', 'Curriculum plans'],
    curriculumStatus: ['第一版提供通用数学练习，以下课程专项题库待开发。', 'This release offers general mathematics. Curriculum-specific question banks are planned.'],
    diagnosticMode: ['起点测试', 'Placement check'],
    mathDiagnosticInfo: ['10 道题覆盖五个领域，帮你分别找到练习起点。', 'Try 10 questions across five domains to find a starting point for each one.'],
    englishDiagnosticInfo: ['12 道词汇、语法和阅读选择题，推荐 A1–B2 的练习起点。', 'Try 12 vocabulary, grammar and reading questions for an A1–B2 practice starting point.'],
    diagnosticReadyMath: ['已有各领域的起点推荐，之后的练习会继续调整。', 'You have starting recommendations by domain. Practice helps refine them.'],
    diagnosticReadyEnglish: ['起点测试建议从 {level} 开始练习。也可以手选 A1–C2。', 'The placement check suggests starting at {level}. You can also choose A1–C2 yourself.'],
    startDiagnostic: ['开始起点测试', 'Start placement check'], retakeDiagnostic: ['重做起点测试', 'Retake placement check'],
    skipPlacement: ['跳过起点测试', 'Skip placement check'],
    diagnosticSubmitted: ['答案已提交。完成起点测试后可查看解析。', 'Answer submitted. You can review the explanations after the placement check.'],
    diagnosticFinished: ['起点测试完成', 'Placement check complete'],
    diagnosticComplete: ['推荐的练习起点', 'Recommended starting levels'],
    diagnosticCaution: ['结果仅用于选择练习起点。', 'These results suggest practice starting points.'],
    cefrScope: ['CEFR 等级用于标注练习难度。起点测试仅涵盖词汇、语法和阅读选择题。', 'CEFR levels label practice difficulty. The placement check covers multiple-choice vocabulary, grammar and reading questions.'],
    cefrTrack: ['通用英语（CEFR）', 'General English (CEFR)'], ieltsTrack: ['雅思备考', 'IELTS preparation'],
    ieltsTarget: ['雅思目标分数', 'IELTS target band'], noTarget: ['暂不设置', 'No target set'],
    ieltsStatus: ['专项题库和模拟评分尚未开放。目标分数只作为你的备考计划。', 'Exam practice and mock scoring are planned. The band you select is your personal target.'],
    recommendation: ['推荐练习', 'Suggested practice'], englishWeakness: ['近 14 天有 {n} 道待复习错题', '{n} unresolved mistakes from the last 14 days'],
    practiceTopic: ['练这个知识点', 'Practise this topic'], recordTitle: ['学习记录', 'Learning progress'],
    recordSubtitle: ['按知识点查看练习起点、作答表现和最近两周的记录。', 'See practice levels, answers and the last two weeks of activity by topic.'],
    evidenceNote: ['数学每积累 5 道同领域、同等级的不同练习题，最多调整一级。正确率和是否用了提示都会纳入判断。', 'Mathematics adjusts by at most one level after five distinct questions at the same topic and level. Accuracy and hint use both count.'],
    starting: ['练习起点 {level}', 'Starting level {level}'], diagnostic: ['起点测试推荐 {level}', 'Placement check suggests {level}'],
    practiceLevel: ['练习推荐 {level}', 'Practice recommendation {level}'],
    evidenceProgress: ['当前等级已积累 {n}/{total} 道有效练习题', '{n}/{total} eligible practice questions at this level'],
    batchEvidence: ['最近一组 {level} 证据中有 {correct}/{total} 题正确，其中 {independent} 题独立答对。', 'In the latest {level} sample, {correct}/{total} were correct, including {independent} without hints.'],
    recordTotals: ['累计作答 {total} 次，答对 {correct} 次', '{correct} correct out of {total} submitted'], recordEmpty: ['还没开始', 'Not started yet'],
    recentPeriod: ['最近 7 天', 'Last 7 days'], earlierPeriod: ['此前 7 天', 'Prior 7 days'],
    correctFraction: ['答对 {correct}/{total}', '{correct}/{total} correct'],
    singleEnglish: ['起点测试建议从 {level} 开始', 'The placement check suggests starting at {level}'],
    selfSelected: ['已选练习等级 {level}', 'Selected practice level {level}'],
    targetSummary: ['雅思自选目标 {band}', 'Selected IELTS target {band}'],
    showHint: ['查看提示', 'Show hint'], hint: ['提示', 'Hint'],
    hintUsed: ['本题用了提示', 'Hint used'],
    emptyMatch: ['这个组合暂无题目，请选择其他知识点或等级。', 'No questions match this combination. Choose a different topic or level.'],
    unfinished: ['你有一次尚未完成的练习。', 'You have an unfinished practice.'], progressLabel: ['{subject} · 已提交 {done}/{total} 题', '{subject} · {done}/{total} submitted'],
    progress: ['第 {current} / {total} 题', 'Question {current} of {total}'], reviewMode: ['错题复习', 'Mistake review'], practiceMode: ['自主练习', 'Independent practice'],
    selectHint: ['选择一个答案，然后提交。', 'Choose one answer, then submit.'], submit: ['提交答案', 'Submit answer'], next: ['下一题', 'Next question'], finish: ['查看结果', 'See results'],
    correct: ['答对了！', 'That’s correct!'], incorrect: ['这题答错了。', 'That’s incorrect.'], explanation: ['答案解析', 'Explanation'],
    rightAnswer: ['正确答案为 {answer}', 'The correct answer is {answer}'], yourAnswer: ['你的答案为 {answer}', 'Your answer was {answer}'],
    exit: ['返回主页', 'Back to overview'],
    mistakesTitle: ['把错题，变成收获。', 'Turn mistakes into progress.'], mistakesSub: ['答错的题会留在这里，再次答对后自动移出。', 'Incorrect answers stay here until you answer them correctly in another practice.'],
    allSubjects: ['全部科目', 'All subjects'], reviewSubject: ['复习{subject}错题（{n}）', 'Review {subject} ({n})'],
    emptyTitle: ['这里还没有待复习的题目。', 'No mistakes to revisit here.'], emptyText: ['完成一些练习后，答错的题会自动收集到这里。', 'Try a practice. Any incorrect answers will be collected here for you.'],
    wrongCount: ['累计答错 {n} 次', 'Answered incorrectly {n} times'], reviewOne: ['再练此题', 'Try this question'],
    result: ['作答结果', 'Results'], complete: ['练习完成！', 'Practice complete!'],
    resultEmpty: ['完成一组练习后，就能在这里查看结果。', 'Complete a practice set to see your results here.'],
    resultSub: ['本次答对 {correct}/{total} 题。', 'You answered {correct} of {total} questions correctly.'],
    roundAccuracy: ['本次正确率', 'Accuracy'], newPractice: ['再来一组', 'Another practice'], reviewWrong: ['复习本次错题', 'Revisit these mistakes'],
    answerDetails: ['回看本次作答', 'Review your answers'], clearData: ['清除学习记录', 'Clear study history'], cancel: ['取消', 'Cancel'], clear: ['清除记录', 'Clear history'],
    clearTitle: ['清除当前学习记录？', 'Clear current study history?'], clearText: ['将清除新版作答记录、错题、未完成的练习和设置。升级前的备份保留在浏览器中。', 'This deletes the new version’s answers, mistakes, unfinished practice and settings. The pre-upgrade backup stays in this browser.'],
    replaceTitle: ['开始一组新练习？', 'Start a new practice?'], replaceText: ['当前练习将结束。已经提交的答案仍计入学习记录。', 'The current practice will end. Submitted answers remain in your study history.'],
    continue: ['开始新练习', 'Start new practice'], storageUnavailable: ['浏览器无法保存记录。你仍可练习，但关闭或刷新页面后，本次记录可能丢失。请在普通浏览模式下打开。', 'This browser cannot save your progress. You can practise, but this session may be lost after closing or refreshing. Try a normal browsing window.'],
    storageDamaged: ['学习记录无法读取。浏览器里的原记录已保留，本次作答暂时无法保存。', 'Saved study data could not be read. The existing record is kept, and answers in this session cannot be saved.'],
    noMatch: ['当前条件没有题目，请调整设置。', 'No questions match. Please adjust the settings.'], changed: ['另一窗口已更新学习记录，页面已同步。', 'Study history changed in another window. This page is now up to date.'],
    error: ['操作未完成，请重新选择练习后再试。', 'The action could not be completed. Please choose a practice and try again.'], today: ['今天', 'Today']
  };
  const main = document.getElementById('main');
  let storageIssue = '';
  let persistent = true;
  let state = loadState();
  let selected = null;
  let selectedQuestion = '';
  let setup = { subject: 'english', level: state.preferences.englishLevel || 'auto', topic: '', count: '8', track: 'cefr' };
  let forceSetup = false;
  let mistakeFilter = 'all';
  let resultId = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  function t(key, values = {}) {
    let text = copy[key][state.language === 'en' ? 1 : 0];
    for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
    return escapeHtml(text);
  }
  const text = value => escapeHtml(value[state.language]);
  const subjectName = id => text(subjects.find(subject => subject.id === id)?.label || { zh: id, en: id });
  const button = (label, action, style = '', extra = '') => `<button type="button" class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
  const locale = () => state.language === 'zh' ? 'zh-CN' : 'en-GB';

  function loadState() {
    try {
      const saved = Core.readState(localStorage, STORAGE_KEY, LEGACY_STORAGE_KEY, questions);
      storageIssue = '';
      persistent = true;
      return saved;
    } catch (error) {
      storageIssue = error.name === 'SecurityError' ? 'storageUnavailable' : 'storageDamaged';
      persistent = false;
      return Core.createState();
    }
  }
  function commit(update) {
    if (persistent) {
      try {
        state = Core.readState(localStorage, STORAGE_KEY, LEGACY_STORAGE_KEY, questions);
      } catch (error) {
        persistent = false;
        storageIssue = error.name === 'SecurityError' ? 'storageUnavailable' : 'storageDamaged';
      }
    }
    state = update(state);
    try {
      if (persistent) Core.saveState(localStorage, STORAGE_KEY, state);
    } catch (_) {
      persistent = false;
      storageIssue = 'storageUnavailable';
    }
    updateStorageNotice();
  }
  function updateStorageNotice() {
    const notice = document.getElementById('storage-notice');
    notice.hidden = !storageIssue;
    notice.innerHTML = storageIssue ? t(storageIssue) : '';
  }
  function route() {
    const value = location.hash.slice(1);
    return ['home', 'practice', 'mistakes', 'result', 'records'].includes(value) ? value : 'home';
  }
  function go(page) {
    if (route() === page) render();
    else location.hash = page;
  }
  function heading(title, subtitle = '') {
    return `<div class="page-heading"><div><h1>${title}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}</div><span class="date-label">${escapeHtml(new Date().toLocaleDateString(locale(), { month: 'long', day: 'numeric', weekday: 'short' }))}</span></div>`;
  }
  function render() {
    const page = route();
    const chinese = state.language === 'zh';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    document.getElementById('brand').setAttribute('aria-label', t('brand'));
    document.getElementById('brand-local-name').hidden = !chinese;
    document.querySelector('meta[name="description"]').content = t('metaDescription');
    document.getElementById('language').value = state.language;
    document.getElementById('language-label').innerHTML = t('language');
    document.getElementById('skip-link').innerHTML = t('skip');
    const navigation = document.getElementById('navigation');
    navigation.setAttribute('aria-label', t('navigation'));
    const count = Core.getMistakes(state, questions).length;
    navigation.innerHTML = [['home', '⌂'], ['practice', '▤'], ['mistakes', '▧'], ['records', '▥']].map(([id, icon]) => `<a class="nav-link ${page === id || (page === 'result' && id === 'practice') ? 'active' : ''}" href="#${id}" ${page === id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${t(id)}</span>${id === 'mistakes' && count ? `<span class="nav-count">${count}</span>` : ''}</a>`).join('');
    document.getElementById('local-label').innerHTML = t('local');
    document.getElementById('footer').innerHTML = `${t('brand')} · ${t('disciplines')}`;
    document.getElementById('breadcrumb').innerHTML = `${brandName} &nbsp; / &nbsp; ${t(page)}`;
    document.title = `${t(page)} · ${t('brand')}`;
    if (page === 'home') main.innerHTML = renderHome();
    if (page === 'practice') {
      main.innerHTML = state.active && !forceSetup ? renderQuestion() : renderSetup();
      for (const select of main.querySelectorAll('select[data-value]')) select.value = select.dataset.value;
    }
    if (page === 'mistakes') main.innerHTML = renderMistakes();
    if (page === 'result') main.innerHTML = renderResult();
    if (page === 'records') main.innerHTML = renderRecords();
    updateStorageNotice();
  }

  function renderHome() {
    const stats = Core.getStats(state, questions);
    const statCard = (label, value, unit, icon) => `<div class="stat"><div><p class="stat-label">${t(label)}</p><div class="stat-value">${value}${unit ? `<span class="stat-unit">${unit}</span>` : ''}</div></div><span class="stat-icon" aria-hidden="true">${icon}</span></div>`;
    const days = Core.dailyStats(state);
    const max = Math.max(5, ...days.map(day => day.total));
    return `${heading(t('brand'), t('welcomeSub'))}
      <section class="hero"><div class="hero-copy"><h2>${t('heroTitle')}</h2><p>${t('heroText')}</p>${button(t(state.active ? 'resume' : 'start'), 'resume')}</div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="paper"><div class="paper-line"></div><div class="paper-line short"></div><div class="paper-sum">a² + b²</div><div class="paper-line"></div></div><span class="art-star">✧</span><div class="art-tile">Aa</div></div></section>
      <section class="stats-grid" aria-label="${t('workspace')}">${statCard('answered', stats.total, t('questionsUnit'), '▤')}${statCard('accuracy', stats.accuracy === null ? '—' : `${stats.accuracy}%`, stats.accuracy === null ? t('noData') : '', '◎')}${statCard('pending', stats.mistakes, t('questionsUnit'), '▧')}</section>
      <section><div class="section-heading"><h2>${t('subjects')}</h2><span class="section-note">${t('available', { n: subjects.filter(subject => subject.available).length })}</span></div><div class="subject-grid">${subjects.filter(subject => subject.available).map(subject => {
        const stats = Core.getStats(state, questions, subject.id);
        const total = questions.filter(question => question.subject === subject.id && !question.diagnosticOnly).length;
        return `<article class="subject-card ${subject.id}"><div class="subject-top"><span class="subject-symbol" aria-hidden="true">${subject.symbol}</span><span class="subject-meta">${t('questionBank', { n: total })}</span></div><h3>${text(subject.label)}</h3><p class="subject-description">${text(subject.description)}</p><div class="subject-footer"><span class="subject-coverage">${t('coverage', { n: stats.total })}</span>${button(t('start'), 'subject', 'secondary', `data-subject="${subject.id}"`)}</div></article>`;
      }).join('')}</div></section>
      <div class="lower-grid"><section class="panel"><div class="section-heading"><h2>${t('activity')}</h2><span class="section-note">${t('lastWeek')}</span></div><div class="week-chart">${days.map((day, index) => `<div class="chart-column ${index === 6 ? 'today' : ''}" aria-label="${escapeHtml(day.date.toLocaleDateString(locale()))} ${t('questionCount', { n: day.total })}"><span class="bar-number">${day.total}</span><span class="bar-space"><span class="bar" style="height:${Math.max(3, day.total / max * 100)}%"></span></span><span>${index === 6 ? t('today') : escapeHtml(day.date.toLocaleDateString(locale(), { weekday: 'short' }))}</span></div>`).join('')}</div></section>
      <section class="panel"><h2>${t('moreSubjects')}</h2><div class="upcoming-list">${subjects.filter(subject => !subject.available).map(subject => `<div class="upcoming"><span class="upcoming-symbol" aria-hidden="true">${subject.symbol}</span><div>${text(subject.label)}<small>${t('comingSoon')}</small></div></div>`).join('')}</div></section></div>
      <div class="reset-area"><button class="text-button" data-action="clear">${t('clearData')}</button></div>`;
  }

  function selectField(id, label, options, selectedValue) {
    return `<div class="field">
      <label for="${id}">${label}</label>
      <select id="${id}" name="${id}" data-value="${escapeHtml(selectedValue)}">${options.map(([value, name]) =>
        `<option value="${value}">${name}</option>`).join('')}</select>
    </div>`;
  }

  function renderPlacementPanel(subject, placement, firstVisit) {
    const math = subject === 'math';
    const summary = placement
      ? (math ? t('diagnosticReadyMath') : t('diagnosticReadyEnglish', { level: placement.level }))
      : t(math ? 'mathDiagnosticInfo' : 'englishDiagnosticInfo');
    return `<section class="placement-panel" aria-labelledby="placement-heading">
      <div><h3 id="placement-heading">${t('diagnosticMode')}</h3><p>${summary}</p></div>
      <div class="inline-actions">
        ${button(t(placement ? 'retakeDiagnostic' : 'startDiagnostic'), 'diagnostic', firstVisit ? '' : 'secondary', `data-subject="${subject}"`)}
        ${firstVisit ? button(t('skipPlacement'), 'skip-placement', 'secondary') : ''}
      </div>
    </section>`;
  }

  function renderIELTS() {
    const bands = Array.from({ length: 17 }, (_, index) => ((index + 2) / 2).toFixed(1));
    return `<section class="placement-panel ielts-panel" aria-labelledby="ielts-heading">
      <div><h3 id="ielts-heading">${t('ieltsTrack')}</h3><p>${t('ieltsStatus')}</p></div>
      ${selectField('ielts-target', t('ieltsTarget'), [['', t('noTarget')], ...bands.map(band => [band, band])], state.preferences.ieltsTarget)}
    </section>`;
  }

  function renderEnglishSuggestions() {
    const suggestions = Learning.englishRecommendations(state);
    if (!suggestions.length) return '';
    return `<section class="suggestion-panel" aria-labelledby="suggestion-heading">
      <h3 id="suggestion-heading">${t('recommendation')}</h3>
      <ul class="suggestion-list">${suggestions.map(({ topic, count }) => `<li>
        <div><strong>${text(topics[topic])}</strong><p>${t('englishWeakness', { n: count })}</p></div>
        ${button(t('practiceTopic'), 'topic-practice', 'secondary', `data-subject="english" data-topic="${topic}"`)}
      </li>`).join('')}</ul>
    </section>`;
  }

  function renderSetup() {
    const { subject, topic, level, count, track } = setup;
    const math = subject === 'math';
    const placement = Learning.latestPlacement(state, subject);
    const firstVisit = math && !placement && !state.preferences.mathPlacementDeferred;
    const showIELTS = !math && track === 'ielts';
    const showPractice = !firstVisit && !showIELTS;
    const pool = showPractice ? Learning.practicePool(state, setup) : [];
    const number = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
    const unfinished = state.active;
    const autoLabel = math
      ? (topic ? t('practiceLevel', { level: Learning.mathProfile(state, placement)[topic].level }) : t('autoMath'))
      : (placement ? t('autoEnglish', { level: placement.level }) : t('starterEnglish'));
    const subjectOptions = subjects.filter(item => item.available).map(item => [item.id, text(item.label)]);
    const topicOptions = [['', t('allTopics')], ...topicsBySubject[subject].map(id => [id, text(topics[id])])];
    const levelOptions = [['auto', autoLabel], ...levels[subject].map(item => [item, item])];
    const countOptions = ['5', '8', '12', '20', 'all'].map(value =>
      [value, value === 'all' ? t('allQuestions') : t('questionCount', { n: value })]);

    return `${heading(t('setupTitle'), t('setupSub'))}
    <div class="practice-layout">
      ${unfinished ? `<div class="resume-banner">
        <div><strong>${t('unfinished')}</strong><p>${t('progressLabel', {
          subject: subjects.find(item => item.id === unfinished.subject).label[state.language],
          done: Object.keys(unfinished.answers).length, total: unfinished.questionIds.length
        })}</p></div>${button(t('resume'), 'resume')}
      </div>` : ''}
      <form id="practice-form" class="panel configuration">
        <h2>${t('settings')}</h2>
        <div class="field-grid subject-field">${selectField('subject', t('subject'), subjectOptions, subject)}</div>
        ${math ? '' : `<div class="filters study-tracks">${[['cefr', 'cefrTrack'], ['ielts', 'ieltsTrack']].map(([id, label]) =>
          `<button type="button" class="filter-button ${id === track ? 'active' : ''}" data-action="track" data-track="${id}" aria-pressed="${id === track}">${t(label)}</button>`).join('')}</div>`}
        ${showIELTS ? renderIELTS() : renderPlacementPanel(subject, placement, firstVisit)}
        ${showPractice ? `
          ${math ? '' : renderEnglishSuggestions()}
          <div class="field-grid practice-fields">
            ${selectField('topic', t('topic'), topicOptions, topic)}
            ${selectField('difficulty', t('difficulty'), levelOptions, level)}
            ${selectField('count', t('count'), countOptions, count)}
          </div>
          <p class="field-help">${t(math ? 'mathScale' : 'cefrScope')}</p>
          <p class="setup-info" id="setup-info" role="status">${pool.length
            ? t('setupInfo', { n: pool.length, count: number }) : t('emptyMatch')}</p>
          <p class="inline-error" id="practice-error" role="alert" hidden></p>
          <div class="setup-submit"><button class="button" type="submit" ${!pool.length ? 'disabled' : ''}>${t('start')}</button></div>
          ${math ? `<details class="curriculum-plan">
            <summary>${t('curriculumPlan')}</summary><p>${t('curriculumStatus')}</p>
            <ul>${curricula.map(item => `<li>${text(item.label)}</li>`).join('')}</ul>
          </details>` : ''}
        ` : '<p class="inline-error" id="practice-error" role="alert" hidden></p>'}
      </form>
    </div>`;
  }

  function renderRecords() {
    const rows = Learning.topicProgress(state);
    const mathTopics = topicsBySubject.math.filter(topic => rows[topic].total > 0);
    const englishTopics = topicsBySubject.english.filter(topic => rows[topic].total > 0);
    const empty = `<p class="records-note">${t('recordEmpty')}</p>`;
    if (!mathTopics.length && !englishTopics.length) return `${heading(t('recordTitle'))}${empty}`;

    const math = Learning.mathProfile(state);
    const english = Learning.latestPlacement(state, 'english');
    const preferredEnglish = state.preferences.englishLevel;
    const ieltsTarget = state.preferences.ieltsTarget;
    return `${heading(t('recordTitle'), t('recordSubtitle'))}
      <section class="records-section" aria-labelledby="math-records">
        <div class="section-heading"><h2 id="math-records">${subjectName('math')}</h2></div>
        ${mathTopics.length ? `<p class="records-note">${t('evidenceNote')}</p>
          <div class="records-grid">${mathTopics.map(topic => renderTopicRecord('math', topic, rows[topic], math[topic])).join('')}</div>` : empty}
      </section>
      <section class="records-section" aria-labelledby="english-records">
        <div class="section-heading"><h2 id="english-records">${subjectName('english')}</h2></div>
        ${preferredEnglish ? `<p class="records-note">${t('selfSelected', { level: preferredEnglish })}</p>`
          : english ? `<p class="records-note">${t('singleEnglish', { level: english.level })}</p>` : ''}
        ${ieltsTarget ? `<p class="records-note">${t('targetSummary', { band: ieltsTarget })}</p>` : ''}
        ${englishTopics.length ? `<div class="records-grid">${englishTopics.map(topic => renderTopicRecord('english', topic, rows[topic])).join('')}</div>` : empty}
      </section>`;
  }

  function renderTopicRecord(subject, topic, row, profile) {
    const status = profile && (profile.basis !== 'starting' || profile.evidence > 0)
      ? t(({ starting: 'starting', diagnostic: 'diagnostic', practice: 'practiceLevel' })[profile.basis], { level: profile.level }) : '';
    const period = (label, data) => `<div><dt>${t(label)}</dt><dd>${data.total ? t('correctFraction', data) : '—'}</dd></div>`;
    return `<article class="panel topic-record" data-topic="${topic}">
      <div class="topic-record-heading"><h3>${text(topics[topic])}</h3>${status ? `<span class="tag">${status}</span>` : ''}</div>
      <p>${t('recordTotals', row)}</p>
      <dl class="record-periods">${period('recentPeriod', row.recent)}${period('earlierPeriod', row.previous)}</dl>
      ${profile?.lastBatch ? `<p class="field-help">${t('batchEvidence', profile.lastBatch)}</p>` : ''}
      ${profile?.evidence ? `<p class="field-help">${t('evidenceProgress', { n: profile.evidence, total: Learning.EVIDENCE_COUNT })}</p>` : ''}
      ${button(t('practiceTopic'), 'topic-practice', 'secondary', `data-subject="${subject}" data-topic="${topic}"`)}
    </article>`;
  }

  function modeLabel(mode) {
    return t(({ practice: 'practiceMode', diagnostic: 'diagnosticMode', review: 'reviewMode' })[mode]);
  }

  function renderQuestion() {
    const session = state.active;
    const question = byId.get(session.questionIds[session.index]);
    const answer = session.answers[question.id];
    const graded = answer !== undefined;
    const diagnostic = session.mode === 'diagnostic';
    const hasHint = !diagnostic && Boolean(question.hint);
    const hinted = session.hintedQuestionIds.includes(question.id);
    if (selectedQuestion !== `${session.id}/${question.id}`) {
      selected = null;
      selectedQuestion = `${session.id}/${question.id}`;
    }
    const choice = graded ? answer : selected;
    const correct = graded && answer === question.answer;
    const showGrade = graded && !diagnostic;
    const done = Object.keys(session.answers).length;
    const total = session.questionIds.length;
    const options = question.options.map((option, index) => {
      const correctOption = showGrade && index === question.answer;
      const wrongOption = showGrade && index === answer && !correct;
      const chosen = choice === index;
      return `<button type="button" class="option ${chosen ? 'selected' : ''} ${correctOption ? 'correct' : ''} ${wrongOption ? 'incorrect' : ''}"
        role="radio" aria-checked="${chosen}" data-action="choose" data-choice="${index}" tabindex="${chosen || (choice === null && index === 0) ? '0' : '-1'}" ${graded ? 'disabled' : ''}>
        <span class="option-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${text(option)}</span>
        ${correctOption || wrongOption ? `<span class="option-feedback" aria-hidden="true">${correctOption ? '✓' : '×'}</span>` : ''}
      </button>`;
    }).join('');
    const feedback = diagnostic
      ? `<div class="feedback diagnostic-feedback"><h3 id="feedback-title" tabindex="-1">${t('diagnosticSubmitted')}</h3></div>`
      : `<div class="feedback ${correct ? '' : 'wrong'}">
        <h3 id="feedback-title" tabindex="-1">${t(correct ? 'correct' : 'incorrect')}</h3>
        <p class="answer-line">${t('rightAnswer', { answer: `${'ABCD'[question.answer]} · ${question.options[question.answer][state.language]}` })}</p>
        <p><strong>${t('explanation')}</strong></p><p>${text(question.explanation)}</p>
      </div>`;
    return `<div class="page-heading"><div><p class="eyebrow">${modeLabel(session.mode)}</p><h1>${subjectName(session.subject)}</h1></div>${button(t('exit'), 'home', 'ghost')}</div>
    <div class="practice-layout">
      <div class="question-top"><span>${t('progress', { current: session.index + 1, total })}</span>
        <span>${t('progressLabel', { subject: subjects.find(item => item.id === session.subject).label[state.language], done, total })}</span></div>
      <div class="progress" role="progressbar" aria-label="${t('answered')}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
        <div class="progress-fill" style="width:${done / total * 100}%"></div>
      </div>
      <section class="panel question-card">
        <div class="question-tags"><span class="tag">${text(topics[question.topic])}</span><span class="tag">${escapeHtml(question.level)}</span>
          ${question.skill ? `<span class="tag">${text(skills[question.skill])}</span>` : ''}</div>
        <h2 id="question-title" class="question-title">${text(question.prompt)}</h2>
        <div class="options" role="radiogroup" aria-labelledby="question-title">${options}</div>
        ${hasHint && !graded ? `<div class="hint-area">
          ${hinted ? `<p id="question-hint" class="hint-content" tabindex="-1"><strong>${t('hint')}</strong> ${text(question.hint)}</p>`
            : button(t('showHint'), 'hint', 'secondary', 'aria-expanded="false"')}
        </div>` : ''}
        ${graded ? feedback : ''}
        <div class="question-bottom">
          ${!graded || hinted ? `<p class="question-hint">${t(graded ? 'hintUsed' : 'selectHint')}</p>` : ''}
          ${graded ? button(t(session.index === total - 1 ? 'finish' : 'next'), 'next')
            : button(t('submit'), 'grade', '', selected === null ? 'disabled' : '')}
        </div>
      </section>
    </div>`;
  }

  function renderMistakes() {
    const mistakes = Core.getMistakes(state, questions);
    const filtered = mistakes.filter(item => mistakeFilter === 'all' || item.question.subject === mistakeFilter);
    const reviewButtons = subjects.filter(subject => subject.available && (mistakeFilter === 'all' || mistakeFilter === subject.id)).map(subject => {
      const count = mistakes.filter(item => item.question.subject === subject.id).length;
      return count ? button(t('reviewSubject', { subject: subject.label[state.language], n: count }), 'review', '', `data-subject="${subject.id}"`) : '';
    }).join('');
    return `${heading(t('mistakesTitle'), t('mistakesSub'))}<div class="filters">${['all', ...subjects.filter(subject => subject.available).map(subject => subject.id)].map(id => `<button class="filter-button ${mistakeFilter === id ? 'active' : ''}" data-action="filter" data-filter="${id}" aria-pressed="${mistakeFilter === id}">${id === 'all' ? t('allSubjects') : subjectName(id)}</button>`).join('')}</div>
      ${filtered.length ? `<div class="review-actions">${reviewButtons}</div><div class="mistake-list">${filtered.map(({ question, attempt, wrongCount }) => `<article class="mistake-card"><div class="mistake-meta"><span>${subjectName(question.subject)} · ${text(topics[question.topic])}</span><span>${t('wrongCount', { n: wrongCount })}</span></div><h3>${text(question.prompt)}</h3><p class="mistake-answer">${t('yourAnswer', { answer: `${'ABCD'[attempt.choice]} · ${question.options[attempt.choice][state.language]}` })}</p><details><summary>${t('explanation')}</summary><p><strong>${t('rightAnswer', { answer: `${'ABCD'[question.answer]} · ${question.options[question.answer][state.language]}` })}</strong><br>${text(question.explanation)}</p></details><div class="question-bottom"><span class="section-note">${escapeHtml(new Date(attempt.at).toLocaleDateString(locale()))}</span>${button(t('reviewOne'), 'review-one', 'secondary', `data-id="${question.id}"`)}</div></article>`).join('')}</div>` : `<section class="panel empty-state"><span class="empty-symbol" aria-hidden="true">✓</span><h2>${t('emptyTitle')}</h2><p>${t('emptyText')}</p>${button(t('start'), 'setup')}</section>`}`;
  }

  function renderPlacementResult(result) {
    if (!result) return '';
    return `<section class="panel placement-result" aria-labelledby="placement-result-title">
      <h2 id="placement-result-title">${t('diagnosticComplete')}</h2>
      <p>${t('diagnosticCaution')}</p>
      ${result.topics ? `<ul>${Object.entries(result.topics).map(([topic, info]) => `<li>
        <strong>${text(topics[topic])}</strong>
        <span>${t('diagnostic', { level: info.level })} · ${t('correctFraction', info)}</span>
      </li>`).join('')}</ul>` : `<p><strong>${t('singleEnglish', { level: result.level })}</strong></p><p>${t('cefrScope')}</p>`}
    </section>`;
  }

  function renderResult() {
    const session = state.sessions.find(item => item.id === resultId) || state.sessions.at(-1);
    if (!session) return `${heading(t('result'))}
      <section class="panel empty-state practice-layout"><p>${t('resultEmpty')}</p>${button(t('start'), 'setup')}</section>`;
    const attempts = state.attempts.filter(attempt => attempt.sessionId === session.id);
    const wrong = attempts.filter(attempt => !attempt.correct);
    const placement = Learning.placementResult(state, session);
    const diagnostic = session.mode === 'diagnostic';
    return `<div class="page-heading"><div>
      <p class="eyebrow">${subjectName(session.subject)}${diagnostic ? '' : ` · ${modeLabel(session.mode)}`}</p>
      <h1>${t(diagnostic ? 'diagnosticFinished' : 'complete')}</h1>
    </div></div>
    <div class="practice-layout">
      <section class="panel result-panel">
        <div class="result-score">${Math.round(session.correct / session.questionIds.length * 100)}<small>%</small></div>
        <span class="section-note">${t('roundAccuracy')}</span>
        <p>${t('resultSub', { correct: session.correct, total: session.questionIds.length })}</p>
        <div class="result-buttons">
          ${button(t('newPractice'), 'subject', '', `data-subject="${session.subject}"`)}
          ${wrong.length ? button(t('reviewWrong'), 'review-result', 'secondary', `data-session="${escapeHtml(session.id)}"`) : button(t('records'), 'records', 'secondary')}
        </div>
      </section>
      ${renderPlacementResult(placement)}
      <section class="result-list"><h2>${t('answerDetails')}</h2>${session.questionIds.map(id => {
        const question = byId.get(id);
        const attempt = attempts.find(item => item.questionId === id);
        return `<div class="result-row ${attempt.correct ? '' : 'wrong'}">
          <span class="result-status" aria-hidden="true">${attempt.correct ? '✓' : '×'}</span>
          <details>
            <summary><span class="sr-only">${t(attempt.correct ? 'correct' : 'incorrect')} </span>${text(question.prompt)}</summary>
            <p>${t('yourAnswer', { answer: `${'ABCD'[attempt.choice]} · ${question.options[attempt.choice][state.language]}` })}<br>
            ${t('rightAnswer', { answer: `${'ABCD'[question.answer]} · ${question.options[question.answer][state.language]}` })}<br>
            ${text(question.explanation)}${attempt.hinted ? `<br><strong>${t('hintUsed')}</strong>` : ''}</p>
          </details>
        </div>`;
      }).join('')}</section>
    </div>`;
  }

  function confirmAction(title, description, action) {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('dialog-title').innerHTML = t(title);
    document.getElementById('dialog-text').innerHTML = t(description);
    document.getElementById('dialog-cancel').innerHTML = t('cancel');
    document.getElementById('dialog-confirm').innerHTML = t(action);
    dialog.returnValue = '';
    dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
  }
  async function begin(options) {
    const previousId = state.active?.id;
    if (previousId && !await confirmAction('replaceTitle', 'replaceText', 'continue')) return;
    commit(current => {
      if (current.active?.id !== previousId) throw new Error('The active practice changed');
      if (options.ids) return Core.startSession(current, questions, options);
      const ids = Learning.practiceIds(current, options);
      const count = options.count === 'all' ? ids.length : Number(options.count);
      return Core.startSession(current, questions, { ...options, ids, count });
    });
    forceSetup = false;
    selected = null;
    go('practice');
    window.scrollTo(0, 0);
    main.focus();
  }
  function openSetup(subject, topic = '') {
    setup = {
      ...setup, subject, topic, track: 'cefr',
      level: subject === 'english' ? state.preferences.englishLevel || 'auto' : 'auto'
    };
    forceSetup = true;
    go('practice');
  }
  function announce(message) {
    document.getElementById('announcement').innerHTML = message;
  }
  function reportSetupError(message) {
    const error = document.getElementById('practice-error');
    if (!error) { announce(message); return; }
    error.innerHTML = message;
    error.hidden = false;
  }
  document.getElementById('skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  });
  document.getElementById('language').addEventListener('change', event => {
    const language = event.target.value;
    commit(current => ({ ...current, language }));
    render();
  });
  main.addEventListener('change', event => {
    const { id, value } = event.target;
    if (!['subject', 'topic', 'difficulty', 'count', 'ielts-target'].includes(id)) return;
    if (id === 'subject') {
      openSetup(value);
    } else {
      if (id === 'ielts-target') commit(current => Core.updatePreferences(current, { ieltsTarget: value }));
      else if (id === 'difficulty') {
        setup.level = value;
        if (setup.subject === 'english') commit(current => Core.updatePreferences(current, { englishLevel: value }));
      } else {
        setup[id] = value;
      }
      render();
    }
    document.getElementById(id)?.focus();
  });
  main.addEventListener('submit', async event => {
    if (event.target.id !== 'practice-form') return;
    event.preventDefault();
    const submit = event.target.querySelector('button[type="submit"]');
    if (!submit || submit.disabled) return;
    try { await begin({ ...setup }); }
    catch (_) { reportSetupError(t('noMatch')); }
  });
  main.addEventListener('click', async event => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    const action = target.dataset.action;
    try {
      if (action === 'choose') {
        selected = Number(target.dataset.choice);
        render();
        main.querySelector(`[data-choice="${selected}"]`).focus();
      }
      if (action === 'grade') {
        const sessionId = state.active?.id;
        const questionId = state.active?.questionIds[state.active.index];
        commit(current => {
          if (current.active?.id !== sessionId || current.active?.questionIds[current.active.index] !== questionId) return current;
          return Core.gradeAnswer(current, questions, selected);
        });
        render();
        document.getElementById('feedback-title')?.focus();
      }
      if (action === 'hint') {
        const active = state.active;
        commit(current => {
          if (current.active?.id !== active?.id || current.active?.index !== active?.index) return current;
          return Core.revealHint(current, questions);
        });
        render();
        document.getElementById('question-hint')?.focus();
      }
      if (action === 'next') {
        const active = state.active;
        let advanced = false;
        commit(current => {
          if (current.active?.id !== active?.id || current.active?.index !== active?.index) return current;
          const updated = Core.advanceSession(current, questions);
          advanced = true;
          return updated;
        });
        if (!advanced) { render(); announce(t('changed')); return; }
        selected = null;
        if (state.active) { render(); document.getElementById('question-title').setAttribute('tabindex', '-1'); document.getElementById('question-title').focus(); }
        else { resultId = state.sessions.at(-1).id; go('result'); main.focus(); }
      }
      if (action === 'home') go('home');
      if (action === 'records') go('records');
      if (action === 'resume') { forceSetup = false; go('practice'); }
      if (action === 'setup') { forceSetup = true; go('practice'); }
      if (action === 'subject' || action === 'topic-practice') openSetup(target.dataset.subject, target.dataset.topic);
      if (action === 'skip-placement') {
        commit(current => Core.updatePreferences(current, { mathPlacementDeferred: true }));
        render();
        document.getElementById('topic')?.focus();
      }
      if (action === 'diagnostic') {
        const subject = target.dataset.subject;
        const ids = Learning.diagnosticIds(subject);
        await begin({ subject, ids, count: ids.length, mode: 'diagnostic' });
      }
      if (action === 'track') {
        setup.track = target.dataset.track;
        render();
        main.querySelector(`[data-track="${setup.track}"]`)?.focus();
      }
      if (action === 'filter') { mistakeFilter = target.dataset.filter; render(); }
      if (action === 'review' || action === 'review-one') {
        const subject = action === 'review-one' ? byId.get(target.dataset.id).subject : target.dataset.subject;
        const ids = Core.getMistakes(state, questions).filter(item => item.question.subject === subject && (action !== 'review-one' || item.question.id === target.dataset.id)).map(item => item.question.id);
        await begin({ subject, ids, count: Math.max(1, ids.length), mode: 'review' });
      }
      if (action === 'review-result') {
        const session = state.sessions.find(session => session.id === target.dataset.session);
        const ids = state.attempts.filter(attempt => attempt.sessionId === session.id && !attempt.correct).map(attempt => attempt.questionId);
        await begin({ subject: session.subject, ids, count: ids.length, mode: 'review' });
      }
      if (action === 'clear' && await confirmAction('clearTitle', 'clearText', 'clear')) {
        const language = state.language;
        commit(() => ({ ...Core.createState(), language }));
        selected = null;
        resultId = null;
        setup = { subject: 'english', level: 'auto', topic: '', count: '8', track: 'cefr' };
        render();
      }
    } catch (_) { render(); reportSetupError(t('error')); }
  });
  main.addEventListener('keydown', event => {
    if (!event.target.matches('[role="radio"]') || event.target.disabled) return;
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const count = main.querySelectorAll('[role="radio"]').length;
    let choice = Number(event.target.dataset.choice);
    if (event.key === 'Home') choice = 0;
    else if (event.key === 'End') choice = count - 1;
    else choice = (choice + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + count) % count;
    main.querySelector(`[data-choice="${choice}"]`).click();
  });
  window.addEventListener('hashchange', () => {
    if (route() !== 'practice') forceSetup = false;
    render();
    window.scrollTo(0, 0);
    main.focus();
  });
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY && event.key !== null) return;
    state = loadState();
    if (setup.subject === 'english') setup.level = state.preferences.englishLevel || 'auto';
    selected = null;
    render();
    announce(t('changed'));
  });
  render();
  if (new URLSearchParams(location.search).get('test') === '1') {
    const script = document.createElement('script');
    script.src = 'tests.js?v=2.2';
    document.body.appendChild(script);
  }
})();
