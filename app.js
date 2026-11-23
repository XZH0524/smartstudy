(function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const { subjects, topics, questions } = globalThis.SmartStudyData;
  const testing = new URLSearchParams(location.search).get('test');
  const STORAGE_KEY = testing ? 'smart-study.tests.v1' : 'smart-study.v1';
  const byId = new Map(questions.map(question => [question.id, question]));
  const copy = {
    home: ['学习主页', 'Overview'], practice: ['开始练习', 'Practice'], mistakes: ['错题复习', 'Mistake review'],
    skip: ['跳至主要内容', 'Skip to main content'], navigation: ['主导航', 'Main navigation'], language: ['界面语言', 'Interface language'],
    local: ['学习记录保存在此浏览器', 'Study data stays in this browser'], footer: ['Smart Study · 本地学习版 · 英语与数学', 'Smart Study · Local edition · English & mathematics'],
    welcome: ['每一天，进步一点。', 'A little progress, every day.'], welcomeSub: ['从一个小练习开始，让知识真正成为你的。', 'A short practice today. A little more confidence tomorrow.'],
    workspace: ['我的学习空间', 'Your learning space'], heroTitle: ['下一次进步，从这里开始。', 'Your next step starts here.'],
    heroText: ['选择一个科目，完成练习，跟着解析弄懂每一道题。', 'Pick a subject, try a few questions, and understand the thinking behind every answer.'],
    quickStart: ['开始今日练习', 'Start a practice'], resume: ['继续上次练习', 'Continue practice'], answered: ['累计作答', 'Answers submitted'], accuracy: ['作答正确率', 'Answer accuracy'],
    pending: ['待复习错题', 'Mistakes to revisit'], questionsUnit: ['题', 'questions'], noData: ['暂无数据', 'No data yet'], subjects: ['选择你的科目', 'Choose your subject'],
    available: ['{n} 个科目可练习', '{n} subjects ready to explore'], questionBank: ['{n} 道题', '{n} questions'], coverage: ['已练习 {n}/{total} 题', '{n}/{total} questions tried'],
    start: ['开始练习', 'Start practice'], lastWeek: ['最近 7 天', 'The last 7 days'], activity: ['每日作答', 'Daily answers'], moreSubjects: ['更多探索，即将开启', 'More to explore, soon'],
    comingSoon: ['即将推出', 'Coming soon'], setupTitle: ['让练习适合你。', 'Make it your practice.'], setupSub: ['选择科目和难度，按照自己的节奏开始。', 'Choose a subject and difficulty. Go at your own pace.'],
    settings: ['练习设置', 'Practice settings'], subject: ['科目', 'Subject'], difficulty: ['难度', 'Difficulty'], allLevels: ['混合难度', 'Mixed difficulty'],
    easy: ['基础', 'Foundation'], medium: ['进阶', 'Intermediate'], hard: ['挑战', 'Challenge'], count: ['题目数量', 'Number of questions'],
    questionCount: ['{n} 题', '{n} questions'], allQuestions: ['全部匹配题目', 'All matching questions'],
    setupInfo: ['当前条件有 {n} 道题。本次随机抽取 {count} 道，提交后显示答案和解析。', '{n} questions match. This practice selects {count} at random. Answers and explanations appear after submission.'],
    curriculum: ['题目覆盖常见中学知识点，未绑定特定国家教材。', 'Questions cover common secondary-school topics, without a country-specific curriculum.'],
    unfinished: ['你有一次尚未完成的练习。', 'You have an unfinished practice.'], progressLabel: ['{subject} · 已提交 {done}/{total} 题', '{subject} · {done}/{total} submitted'],
    progress: ['第 {current} / {total} 题', 'Question {current} of {total}'], reviewMode: ['错题复习', 'Mistake review'], practiceMode: ['自主练习', 'Independent practice'],
    selectHint: ['选择一个答案，然后提交。', 'Choose one answer, then submit.'], submit: ['提交答案', 'Check answer'], next: ['下一题', 'Next question'], finish: ['查看练习结果', 'See results'],
    correct: ['答对了！', 'That’s correct!'], incorrect: ['再理解一步，你就会了。', 'Let’s work through this one.'], explanation: ['答案解析', 'Explanation'],
    rightAnswer: ['正确答案为 {answer}', 'The correct answer is {answer}'], yourAnswer: ['你的答案为 {answer}', 'Your answer was {answer}'],
    gradedHint: ['本题已批改，作答记录已更新。', 'Answer checked. Your record is updated.'], exit: ['返回主页', 'Back to overview'],
    mistakesTitle: ['把错题，变成收获。', 'Turn mistakes into progress.'], mistakesSub: ['答错的题会留在这里，再次答对后自动移出。', 'Incorrect answers stay here until you answer them correctly in another practice.'],
    allSubjects: ['全部科目', 'All subjects'], reviewSubject: ['复习{subject}错题（{n}）', 'Review {subject} ({n})'],
    emptyTitle: ['这里还没有待复习的题目。', 'No mistakes to revisit here.'], emptyText: ['完成一些练习后，答错的题会自动收集到这里。', 'Try a practice. Any incorrect answers will be collected here for you.'],
    wrongCount: ['累计答错 {n} 次', 'Answered incorrectly {n} times'], reviewOne: ['再练此题', 'Try this question'],
    result: ['练习结果', 'Practice results'], complete: ['练习完成！', 'Practice complete!'], resultSub: ['本次答对 {correct}/{total} 题。每一道题都让你更进一步。', 'You answered {correct}/{total} correctly. Every question is a step forward.'],
    roundAccuracy: ['本次正确率', 'Accuracy this practice'], newPractice: ['再来一组', 'Another practice'], reviewWrong: ['复习本次错题', 'Revisit these mistakes'],
    answerDetails: ['回看本次作答', 'Review your answers'], clearData: ['清除学习记录', 'Clear study history'], cancel: ['取消', 'Cancel'], clear: ['清除记录', 'Clear history'],
    clearTitle: ['清除这台设备上的学习记录？', 'Clear study history on this device?'], clearText: ['作答记录、错题和未完成的练习都将清除，此操作无法撤销。', 'This deletes answers, mistakes and unfinished practice from this browser. This action cannot be undone.'],
    replaceTitle: ['开始一组新练习？', 'Start a new practice?'], replaceText: ['当前练习将结束。已经提交的答案仍计入学习记录。', 'The current practice will end. Submitted answers remain in your study history.'],
    continue: ['开始新练习', 'Start new practice'], storageUnavailable: ['浏览器无法保存记录。你仍可练习，但关闭或刷新页面后，本次记录可能丢失。请在普通浏览模式下打开。', 'This browser cannot save your progress. You can practise, but this session may be lost after closing or refreshing. Try a normal browsing window.'],
    storageDamaged: ['发现无法读取的学习记录，已启用新的临时学习状态。下次保存会更新本地记录。', 'Saved study data could not be read. A fresh study state is in use. Your next save will update the local record.'],
    noMatch: ['当前条件没有题目，请调整设置。', 'No questions match. Please adjust the settings.'], changed: ['另一窗口已更新学习记录，页面已同步。', 'Study history changed in another window. This page is now up to date.'],
    error: ['操作未完成，请重新选择练习后再试。', 'The action could not be completed. Please choose a practice and try again.'], today: ['今天', 'Today']
  };
  const main = document.getElementById('main');
  let storageIssue = '';
  let persistent = true;
  let state = loadState();
  let selected = null;
  let selectedQuestion = '';
  let setup = { subject: 'english', difficulty: 'all', count: '8' };
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
  const button = (label, action, style = '', extra = '') => `<button class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
  const locale = () => state.language === 'zh' ? 'zh-CN' : 'en-GB';

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Core.normalizeState(JSON.parse(saved), questions) : Core.createState();
    } catch (error) {
      storageIssue = error.name === 'SecurityError' ? 'storageUnavailable' : 'storageDamaged';
      if (error.name === 'SecurityError') persistent = false;
      return Core.createState();
    }
  }
  function commit(update) {
    if (persistent) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) state = Core.normalizeState(JSON.parse(saved), questions);
      } catch (_) { /* Keep the current in-memory state if saved data is unavailable. */ }
    }
    state = update(state);
    try {
      if (persistent) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (storageIssue === 'storageDamaged') storageIssue = '';
      }
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
    return ['home', 'practice', 'mistakes', 'result'].includes(value) ? value : 'home';
  }
  function go(page) {
    if (route() === page) render();
    else location.hash = page;
  }
  function heading(title, subtitle, eyebrow = '') {
    return `<div class="page-heading"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1><p class="subtitle">${subtitle}</p></div><span class="date-label">${escapeHtml(new Date().toLocaleDateString(locale(), { month: 'long', day: 'numeric', weekday: 'short' }))}</span></div>`;
  }
  function render() {
    const page = route();
    document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
    document.getElementById('language').value = state.language;
    document.getElementById('language-label').innerHTML = t('language');
    document.getElementById('skip-link').innerHTML = t('skip');
    const navigation = document.getElementById('navigation');
    navigation.setAttribute('aria-label', state.language === 'zh' ? '主导航' : 'Main navigation');
    const count = Core.getMistakes(state, questions).length;
    navigation.innerHTML = [['home', '⌂'], ['practice', '▤'], ['mistakes', '▧']].map(([id, icon]) => `<a class="nav-link ${page === id || (page === 'result' && id === 'practice') ? 'active' : ''}" href="#${id}" ${page === id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${t(id)}</span>${id === 'mistakes' && count ? `<span class="nav-count">${count}</span>` : ''}</a>`).join('');
    document.getElementById('local-label').innerHTML = t('local');
    document.getElementById('footer').innerHTML = t('footer');
    document.getElementById('breadcrumb').innerHTML = `Smart Study &nbsp; / &nbsp; ${t(page)}`;
    document.title = `${document.getElementById('breadcrumb').textContent.trim()} · Smart Study`;
    if (page === 'home') main.innerHTML = renderHome();
    if (page === 'practice') main.innerHTML = state.active && !forceSetup ? renderQuestion() : renderSetup();
    if (page === 'mistakes') main.innerHTML = renderMistakes();
    if (page === 'result') main.innerHTML = renderResult();
    updateStorageNotice();
  }

  function renderHome() {
    const stats = Core.getStats(state, questions);
    const statCard = (label, value, unit, icon) => `<div class="stat"><div><p class="stat-label">${t(label)}</p><div class="stat-value">${value}${unit ? `<span class="stat-unit">${unit}</span>` : ''}</div></div><span class="stat-icon" aria-hidden="true">${icon}</span></div>`;
    const days = Core.dailyStats(state);
    const max = Math.max(5, ...days.map(day => day.total));
    return `${heading(t('welcome'), t('welcomeSub'), t('workspace'))}
      <section class="hero"><div class="hero-copy"><h2>${t('heroTitle')}</h2><p>${t('heroText')}</p>${button(t(state.active ? 'resume' : 'quickStart'), 'resume')}</div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="paper"><div class="paper-line"></div><div class="paper-line short"></div><div class="paper-sum">a² + b²</div><div class="paper-line"></div></div><span class="art-star">✧</span><div class="art-tile">Aa</div></div></section>
      <section class="stats-grid" aria-label="${t('workspace')}">${statCard('answered', stats.total, t('questionsUnit'), '▤')}${statCard('accuracy', stats.accuracy === null ? '—' : `${stats.accuracy}%`, stats.accuracy === null ? t('noData') : '', '◎')}${statCard('pending', stats.mistakes, t('questionsUnit'), '▧')}</section>
      <section><div class="section-heading"><h2>${t('subjects')}</h2><span class="section-note">${t('available', { n: subjects.filter(subject => subject.available).length })}</span></div><div class="subject-grid">${subjects.filter(subject => subject.available).map(subject => {
        const stats = Core.getStats(state, questions, subject.id);
        const total = questions.filter(question => question.subject === subject.id).length;
        return `<article class="subject-card ${subject.id}"><div class="subject-top"><span class="subject-symbol" aria-hidden="true">${subject.symbol}</span><span class="subject-meta">${t('questionBank', { n: total })}</span></div><h3>${text(subject.label)}</h3><p class="subject-description">${text(subject.description)}</p><div class="subject-footer"><span class="subject-coverage">${t('coverage', { n: stats.unique, total })}</span>${button(t('start'), 'subject', 'secondary', `data-subject="${subject.id}"`)}</div></article>`;
      }).join('')}</div></section>
      <div class="lower-grid"><section class="panel"><div class="section-heading"><h2>${t('activity')}</h2><span class="section-note">${t('lastWeek')}</span></div><div class="week-chart">${days.map((day, index) => `<div class="chart-column ${index === 6 ? 'today' : ''}" aria-label="${escapeHtml(day.date.toLocaleDateString(locale()))} ${t('questionCount', { n: day.total })}"><span class="bar-number">${day.total}</span><span class="bar-space"><span class="bar" style="height:${Math.max(3, day.total / max * 100)}%"></span></span><span>${index === 6 ? t('today') : escapeHtml(day.date.toLocaleDateString(locale(), { weekday: 'short' }))}</span></div>`).join('')}</div></section>
      <section class="panel"><h2>${t('moreSubjects')}</h2><div class="upcoming-list">${subjects.filter(subject => !subject.available).map(subject => `<div class="upcoming"><span class="upcoming-symbol" aria-hidden="true">${subject.symbol}</span><div>${text(subject.label)}<small>${t('comingSoon')}</small></div></div>`).join('')}</div></section></div>
      <div class="reset-area"><button class="text-button" data-action="clear">${t('clearData')}</button></div>`;
  }

  function setupPool() {
    return questions.filter(question => question.subject === setup.subject && (setup.difficulty === 'all' || question.difficulty === setup.difficulty));
  }
  function renderSetup() {
    const pool = setupPool();
    const count = setup.count === 'all' ? pool.length : Math.min(Number(setup.count), pool.length);
    const unfinished = state.active;
    return `<div class="practice-layout">${heading(t('setupTitle'), t('setupSub'))}
      ${unfinished ? `<div class="resume-banner"><div><strong>${t('unfinished')}</strong><p>${t('progressLabel', { subject: subjects.find(subject => subject.id === unfinished.subject).label[state.language], done: Object.keys(unfinished.answers).length, total: unfinished.questionIds.length })}</p></div>${button(t('resume'), 'resume')}</div>` : ''}
      <form id="practice-form" class="panel configuration"><h2>${t('settings')}</h2><div class="field-grid"><div class="field"><label for="subject">${t('subject')}</label><select id="subject" name="subject">${subjects.filter(subject => subject.available).map(subject => `<option value="${subject.id}" ${setup.subject === subject.id ? 'selected' : ''}>${text(subject.label)}</option>`).join('')}</select></div><div class="field"><label for="difficulty">${t('difficulty')}</label><select id="difficulty" name="difficulty">${['all', 'easy', 'medium', 'hard'].map(level => `<option value="${level}" ${setup.difficulty === level ? 'selected' : ''}>${t(level === 'all' ? 'allLevels' : level)}</option>`).join('')}</select></div><div class="field"><label for="count">${t('count')}</label><select id="count" name="count">${['5', '8', '12', 'all'].map(value => `<option value="${value}" ${setup.count === value ? 'selected' : ''}>${value === 'all' ? t('allQuestions') : t('questionCount', { n: value })}</option>`).join('')}</select></div></div><p class="setup-info" id="setup-info">${t('setupInfo', { n: pool.length, count })}</p><p class="subtitle">${t('curriculum')}</p><div class="question-bottom"><span></span><button class="button" type="submit" ${!pool.length ? 'disabled' : ''}>${t('start')}</button></div></form></div>`;
  }

  function renderQuestion() {
    const session = state.active;
    const question = byId.get(session.questionIds[session.index]);
    const answer = session.answers[question.id];
    const graded = answer !== undefined;
    if (selectedQuestion !== `${session.id}/${question.id}`) {
      selected = null;
      selectedQuestion = `${session.id}/${question.id}`;
    }
    const choice = graded ? answer : selected;
    const correct = graded && answer === question.answer;
    return `<div class="practice-layout"><div class="page-heading"><div><p class="eyebrow">${t(session.mode === 'review' ? 'reviewMode' : 'practiceMode')}</p><h1>${subjectName(session.subject)}</h1></div>${button(t('exit'), 'home', 'ghost')}</div><div class="question-top"><span>${t('progress', { current: session.index + 1, total: session.questionIds.length })}</span><span>${t('progressLabel', { subject: subjects.find(subject => subject.id === session.subject).label[state.language], done: Object.keys(session.answers).length, total: session.questionIds.length })}</span></div><div class="progress" role="progressbar" aria-label="${t('answered')}" aria-valuemin="0" aria-valuemax="${session.questionIds.length}" aria-valuenow="${Object.keys(session.answers).length}"><div class="progress-fill" style="width:${Object.keys(session.answers).length / session.questionIds.length * 100}%"></div></div>
      <section class="panel question-card"><div class="question-tags"><span class="tag">${text(topics[question.topic])}</span><span class="tag">${t(question.difficulty)}</span></div><h2 id="question-title" class="question-title">${text(question.prompt)}</h2><div class="options" role="radiogroup" aria-labelledby="question-title">${question.options.map((option, index) => {
        const correctOption = graded && index === question.answer;
        const wrongOption = graded && index === answer && !correct;
        const chosen = choice === index;
        return `<button class="option ${chosen ? 'selected' : ''} ${correctOption ? 'correct' : ''} ${wrongOption ? 'incorrect' : ''}" role="radio" aria-checked="${chosen}" data-action="choose" data-choice="${index}" tabindex="${chosen || (choice === null && index === 0) ? '0' : '-1'}" ${graded ? 'disabled' : ''}><span class="option-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${text(option)}</span>${correctOption || wrongOption ? `<span class="option-feedback" aria-hidden="true">${correctOption ? '✓' : '×'}</span>` : ''}</button>`;
      }).join('')}</div>${graded ? `<div class="feedback ${correct ? '' : 'wrong'}"><h3 id="feedback-title" tabindex="-1">${t(correct ? 'correct' : 'incorrect')}</h3><p class="answer-line">${t('rightAnswer', { answer: `${'ABCD'[question.answer]} · ${question.options[question.answer][state.language]}` })}</p><p><strong>${t('explanation')}</strong></p><p>${text(question.explanation)}</p></div>` : ''}<div class="question-bottom"><p class="question-hint">${t(graded ? 'gradedHint' : 'selectHint')}</p>${graded ? button(t(session.index === session.questionIds.length - 1 ? 'finish' : 'next'), 'next') : button(t('submit'), 'grade', '', selected === null ? 'disabled' : '')}</div></section></div>`;
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

  function renderResult() {
    const session = state.sessions.find(session => session.id === resultId) || state.sessions.at(-1);
    if (!session) return `<section class="panel empty-state"><h1>${t('result')}</h1><p>${t('emptyText')}</p>${button(t('start'), 'setup')}</section>`;
    const attempts = state.attempts.filter(attempt => attempt.sessionId === session.id);
    const wrong = attempts.filter(attempt => !attempt.correct);
    return `<div class="practice-layout"><section class="panel result-panel"><p class="eyebrow">${subjectName(session.subject)} · ${t(session.mode === 'review' ? 'reviewMode' : 'practiceMode')}</p><h1>${t('complete')}</h1><div class="result-score">${Math.round(session.correct / session.questionIds.length * 100)}<small>%</small></div><span class="section-note">${t('roundAccuracy')}</span><p>${t('resultSub', { correct: session.correct, total: session.questionIds.length })}</p><div class="result-buttons">${button(t('newPractice'), 'setup')}${wrong.length ? button(t('reviewWrong'), 'review-result', 'secondary', `data-session="${session.id}"`) : button(t('exit'), 'home', 'secondary')}</div></section><section class="result-list"><h2>${t('answerDetails')}</h2>${session.questionIds.map(id => {
      const question = byId.get(id);
      const attempt = attempts.find(attempt => attempt.questionId === id);
      return `<div class="result-row ${attempt.correct ? '' : 'wrong'}"><span class="result-status" aria-hidden="true">${attempt.correct ? '✓' : '×'}</span><details><summary><span class="sr-only">${t(attempt.correct ? 'correct' : 'incorrect')} </span>${text(question.prompt)}</summary><p>${t('yourAnswer', { answer: `${'ABCD'[attempt.choice]} · ${question.options[attempt.choice][state.language]}` })}<br>${t('rightAnswer', { answer: `${'ABCD'[question.answer]} · ${question.options[question.answer][state.language]}` })}<br>${text(question.explanation)}</p></details></div>`;
    }).join('')}</section></div>`;
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
    if (state.active && !await confirmAction('replaceTitle', 'replaceText', 'continue')) return;
    commit(current => Core.startSession(current, questions, options));
    forceSetup = false;
    selected = null;
    go('practice');
    main.focus();
  }
  function announce(message) {
    document.getElementById('announcement').innerHTML = message;
  }
  document.getElementById('language').addEventListener('change', event => {
    const language = event.target.value;
    commit(current => ({ ...current, language }));
    render();
  });
  main.addEventListener('change', event => {
    if (!['subject', 'difficulty', 'count'].includes(event.target.id)) return;
    setup[event.target.id] = event.target.value;
    const pool = setupPool();
    document.getElementById('setup-info').innerHTML = t('setupInfo', { n: pool.length, count: setup.count === 'all' ? pool.length : Math.min(Number(setup.count), pool.length) });
  });
  main.addEventListener('submit', async event => {
    if (event.target.id !== 'practice-form') return;
    event.preventDefault();
    try { await begin({ ...setup, count: setup.count === 'all' ? setupPool().length : Number(setup.count) }); }
    catch (_) { announce(t('noMatch')); }
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
      if (action === 'next') {
        commit(current => Core.advanceSession(current, questions));
        selected = null;
        if (state.active) { render(); document.getElementById('question-title').setAttribute('tabindex', '-1'); document.getElementById('question-title').focus(); }
        else { resultId = state.sessions.at(-1).id; go('result'); main.focus(); }
      }
      if (action === 'home') go('home');
      if (action === 'resume') { forceSetup = false; go('practice'); }
      if (action === 'setup') { forceSetup = true; go('practice'); }
      if (action === 'subject') { setup.subject = target.dataset.subject; forceSetup = true; go('practice'); }
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
        render();
      }
    } catch (_) { render(); announce(t('error')); }
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
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    state = loadState();
    selected = null;
    render();
    announce(t('changed'));
  });
  render();
  if (new URLSearchParams(location.search).get('test') === '1') {
    const script = document.createElement('script');
    script.src = 'tests.js';
    document.body.appendChild(script);
  }
})();
