(function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const AI = globalThis.EachVeyaAi;
  const Science = globalThis.EachVeyaScience;
  const Coach = globalThis.EachVeyaCoach;
  const Lessons = globalThis.EachVeyaLessons;
  const focusSkills = globalThis.EachVeyaSkills?.skills;
  const StudyUI = globalThis.EachVeyaStudyUI;
  const Sound = globalThis.EachVeyaSound;
  const Backup = globalThis.EachVeyaBackup;
  const Account = globalThis.EachVeyaAccount;
  const data = globalThis.SmartStudyData;
  const main = document.getElementById('main');
  const soundButton = document.getElementById('sound-toggle');

  // Reading history with an incomplete bank can drop otherwise valid answers.
  const practiceCounts = new Map();
  for (const question of data?.questions || []) {
    if (!question.diagnosticOnly && !question.focusOnly) {
      practiceCounts.set(question.subject, (practiceCounts.get(question.subject) || 0) + 1);
    }
  }
  const completeBank = data?.subjects?.length && data.subjects.every(({ id, available }) =>
    !available || practiceCounts.get(id) >= 400);
  const workshopSubjects = new Set(data?.questions?.filter(question => question.purpose === 'followup').map(question => question.subject));
  const completeWorkshops = typeof Lessons?.roundIds === 'function' && data?.subjects?.every(({ id, available }) =>
    !available || (Lessons.workshops?.[id] && workshopSubjects.has(id)));
  if (!completeBank || !completeWorkshops
    || Core?.VERSION !== 8 || !Coach?.lessonChecks || !AI?.ROUND_FORMATS || [Learning, Science, focusSkills, StudyUI, Backup].some(component => !component)) {
    document.getElementById('language').disabled = true;
    main.innerHTML = `<section class="panel configuration" role="alert">
      <h1>练习页面未加载完整</h1>
      <p>请刷新后重试。此浏览器中的学习记录已保留。</p>
      <p lang="en">Practice could not finish loading. Reload to try again. Your study history is still saved in this browser.</p>
      <button id="startup-reload" type="button" class="button">重新加载 · Reload</button>
    </section>`;
    document.getElementById('startup-reload').addEventListener('click', () => location.reload());
    return;
  }

  const { subjects, topics, topicsBySubject, levels, tierLabels, skills, curricula, questions: bank } = data;
  const brandName = 'EachVeya';
  const localPreview = location.protocol === 'file:' || ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
  const currentUrl = new URL(location.href);
  const testing = localPreview && currentUrl.searchParams.get('test') === '1';
  if (!localPreview && currentUrl.searchParams.has('test')) {
    currentUrl.searchParams.delete('test');
    currentUrl.hash = 'home';
    history.replaceState(history.state, '', currentUrl);
  }
  const accountEnabled = Boolean(Account?.enabled && !testing);
  // The original keys also hold the records created before the rename.
  const storagePrefix = testing ? 'smart-study.tests' : 'smart-study';
  const LEGACY_STORAGE_KEYS = [7, 6, 5, 4, 3, 2, 1].map(version => `${storagePrefix}.v${version}`);
  const STORAGE_KEY = `${storagePrefix}.v${Core.VERSION}`;
  const copy = {
    ...StudyUI.copy,
    stepRetry: ['这一步需要再算', 'Recheck this step'],
    answerSound: ['作答音效', 'Answer sounds'],
    answerSoundOn: ['音效已开启', 'Answer sounds on'],
    answerSoundOff: ['音效已关闭', 'Answer sounds off'],
    home: ['学习主页', 'Overview'], practice: ['开始练习', 'Practice'], mistakes: ['错题复习', 'Mistakes'], records: ['学习记录', 'Progress'],
    skip: ['跳至主要内容', 'Skip to main content'], navigation: ['主导航', 'Main navigation'], language: ['界面语言', 'Interface language'],
    brand: [`${brandName} 学验共途`, brandName],
    metaDescription: [`${brandName} 学验共途为中学生提供英语、数学、物理、化学和生物练习，以及分步解析和间隔复习。`,
      `${brandName} offers English, mathematics, physics, chemistry and biology practice for secondary school students, with explanations and spaced review.`],
    local: ['学习记录保存在此浏览器', 'Study data stays in this browser'],
    disciplines: ['英语、数学与科学', 'English, mathematics & science'],
    welcomeSub: ['面向全球中学生的练习平台，涵盖英语、数学、物理、化学与生物。', 'English and mathematics practice for secondary school students, alongside physics, chemistry and biology.'],
    workspace: ['练习概览', 'Practice overview'], heroTitle: ['选择知识点和难度', 'Choose a topic and level'],
    heroText: ['选择知识点开始练习，查看解析或复习错题。', 'Practise a topic, explore an explanation or revisit a mistake.'],
    resume: ['继续上次练习', 'Continue practice'], answered: ['累计作答', 'Answers submitted'], accuracy: ['作答正确率', 'Answer accuracy'],
    pending: ['待复习错题', 'Mistakes to revisit'], questionsUnit: ['题', 'questions'], noData: ['暂无数据', 'No data yet'], subjects: ['选择你的科目', 'Choose your subject'],
    available: ['{n} 个科目可练习', '{n} subjects ready to explore'], questionBank: ['{n} 道练习题', '{n} practice questions'], coverage: ['累计作答 {n} 次', '{n} answers submitted'],
    start: ['开始练习', 'Start practice'], lastWeek: ['最近 7 天', 'The last 7 days'], activity: ['每日作答', 'Daily answers'],
    setupTitle: ['选择适合你的练习', 'Find your next practice'], setupSub: ['选择科目、知识点和等级，或按推荐开始。', 'Choose a subject, topic and level, or start with a recommendation.'],
    settings: ['练习设置', 'Practice settings'], subject: ['科目', 'Subject'], difficulty: ['练习等级', 'Practice level'], topic: ['知识点', 'Topic'],
    allTopics: ['所有知识点', 'All topics'], autoLevel: ['按知识点推荐', 'Recommended by topic'],
    count: ['题目数量', 'Number of questions'],
    questionCount: ['{n} 题', '{n} questions'], allQuestions: ['全部匹配题目', 'All matching questions'],
    setupInfo: ['当前匹配 {n} 道，本次练习 {count} 道，优先安排没做过的题。', '{n} questions match. This set includes {count}, with untried questions first.'],
    mathScale: ['题目难度按知识点分别推荐。掌握情况以作答证据为准。', 'Practice difficulty is suggested per topic. Mastery depends on the available evidence.'],
    scienceScope: ['课程范围', 'Curriculum scope'], generalScience: ['通用科学', 'General science'],
    scopePlanned: ['{course} 专项课程映射待审核。请选择通用科学使用现有题目。', '{course} curriculum mapping is awaiting review. Select General science to use the current bank.'],
    sciencePlacementInfo: ['三个核心知识点各两题，共 {n} 道。其他知识点会根据后续练习积累证据。', 'Two questions on each of three core topics, {n} in total. Other topics build evidence through practice.'],
    scienceBank: ['从校验题库组题', 'Build a validated practice set'],
    scienceAi: ['AI 按薄弱点组题', 'Assemble a set with AI'], scienceAiMode: ['AI 组题 · 已校验', 'AI-assembled · validated'],
    scienceAiOffline: ['本地可从已校验的模板组题。', 'Build a set from validated templates locally.'],
    chooseScienceTopic: ['选择一个具体知识点后可以组题。', 'Choose a specific topic to build a set.'],
    scienceEvidence: ['科学升阶需要多道独立练习及跨日新题复测。', 'Science levels advance with several independent answers and a fresh check on a later day.'],
    scienceRetained: ['已通过 {level} 跨日复测', 'Passed a later-day check at {level}'],
    scienceUnverified: ['尚未测评掌握等级', 'Mastery level not yet assessed'],
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
    evidenceNote: ['同领域、同等级积累 5 道不同练习题后，最多调整一级。正确率和是否用了提示都会纳入判断。', 'Suggested levels move by at most one tier after five distinct questions at the same topic and level. Accuracy and hint use both count.'],
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
    error: ['操作未完成，请重新选择练习后再试。', 'The action could not be completed. Please choose a practice and try again.'], today: ['今天', 'Today'],
    aiTitle: ['AI 出题', 'AI practice'],
    aiScope: ['一元一次方程 L1–L3，每组 3 题。', 'Three linear equations per set at L1–L3.'],
    aiFormat: ['题型', 'Question format'],
    aiMixed: ['混合题型', 'Mixed formats'],
    aiChoice: ['选择题', 'Multiple choice'],
    aiFill: ['填空题', 'Fill in the blank'],
    aiCalculation: ['计算题', 'Two-step calculation'],
    aiSample: ['免费试做 3 题', 'Try 3 free sample questions'],
    aiSampleMode: ['题型试做', 'Sample practice'],
    aiSampleFailed: ['试做暂时无法开始，请重新选择难度。', 'The sample could not start. Choose a level again.'],
    numericHelp: ['填写整数、小数或分数，例如 −3、3.0、6/2。', 'Enter a whole number, decimal or fraction, such as −3, 3.0 or 6/2.'],
    numericInvalid: ['请在每个空格填入有效数字。分数的分母不能为 0。', 'Enter a valid number in each field. A fraction must have a nonzero denominator.'],
    numericMarkCorrect: ['这一步正确', 'Correct'],
    numericMarkExpected: ['这一步应填 {value}', 'Expected {value}'],
    aiStart: ['生成 {level} 练习', 'Generate {level} practice'],
    aiGenerated: ['AI 生成 · 已验算', 'AI-generated · Answer checked'],
    aiOffline: ['AI 出题服务待启用。', 'AI generation has yet to be activated.'],
    aiOnline: ['到 EachVeya 在线版使用 AI 出题', 'Use AI practice on the EachVeya website'],
    aiSelection: ['请选择「代数」或「所有知识点」，并使用推荐等级或 L1–L3。', 'Choose Algebra or All topics, then choose a recommended level or L1–L3.'],
    aiLoading: ['正在生成和验算题目…', 'Generating and checking questions…'],
    aiLimit: ['AI 出题额度已用完。你仍可做题库练习。', 'The AI allowance has been used. Bank questions are still available.'],
    aiInvalid: ['本组题未通过验算或与旧题重复。请再试一次。', 'This set failed verification or repeated a previous question. Please try again.'],
    aiFailure: ['暂时无法生成题目。请稍后重试，或开始题库练习。', 'Questions could not be generated. Try again later or practise from the question bank.'],
    account: ['账号', 'Account'], accountLogin: ['登录测试账号', 'Sign in to a test account'],
    accountSubtitle: ['本机版只使用演示账号。请在 Mac 的终端启动窗口查看测试验证码。', 'Use a demo account in this local preview. Find the test code in the Mac Terminal window that started it.'],
    accountContact: ['演示手机号或邮箱', 'Demo phone number or email'], accountInvite: ['首次登录用邀请码，已注册可留空', 'Invitation code for first sign-in. Leave blank if already registered.'],
    accountDemoPhone: ['用演示手机号', 'Use demo phone number'], accountDemoEmail: ['用演示邮箱', 'Use demo email'],
    accountDemoHelp: ['演示手机号为 {phone}，终端会显示验证码。本机版没有接入短信或邮件服务。', 'The demo number is {phone}. The code appears in Terminal. SMS and email delivery are disabled in this preview.'],
    accountDemoRequired: ['这个号码或邮箱无法在本机版使用。请点「用演示手机号」或「用演示邮箱」。', 'This phone number or email cannot be used in the local preview. Choose “Use demo phone number” or “Use demo email”.'],
    accountSend: ['获取测试验证码', 'Get test code'], accountCode: ['六位验证码', 'Six-digit code'],
    accountVerify: ['验证并登录', 'Verify and sign in'], accountRestart: ['重新获取验证码', 'Request another code'],
    accountSent: ['请在终端查看六位验证码。如果没出现，请点「重新获取验证码」，检查演示账号和邀请码。首次登录需要一张未使用的邀请码。', 'Look in Terminal for the six-digit code. If none appears, request another code and check the demo account and invitation. First sign-in requires an unused invitation.'],
    accountInvalidCode: ['验证码有误、已过期或已用过。请检查终端里的六位码，或重新获取。', 'The code is incorrect, expired, or already used. Check the six-digit code in Terminal or request another one.'],
    accountConnection: ['暂时无法连接本机测试服务。请确认终端启动窗口还开着，再重试。', 'The local test server could not be reached. Keep its Terminal window open and try again.'],
    accountFailed: ['无法完成操作。请检查测试凭证、邀请码或验证码。', 'The action could not be completed. Check the test identity, invitation or code.'],
    accountRate: ['尝试次数过多，请稍后再试。', 'Too many attempts. Try again later.'],
    accountLoadFailed: ['暂时无法恢复登录状态，可继续练习或重试。', 'Sign-in state could not be restored. You can keep practising or retry.'],
    accountSignout: ['退出账号', 'Sign out'], accountFree: ['免费版', 'Free'], accountPlus: ['升级版试用', 'Plus trial'],
    accountHelp: ['已提交的作答、错题、计划和设置可以同步到这个测试账号。新设备可以查看记录。本次练习的未提交进度保存在当前页面。', 'Submitted answers, mistakes, plans and settings sync to this test account. Pending practice stays on this page.'],
    accountGuestTitle: ['带入游客作答', 'Bring over guest answers'],
    accountGuestAvailable: ['当前浏览器有 {n} 次游客作答。确认后可把作答和已完成的练习复制到这个账号，游客记录仍保留。', 'This browser has {n} guest answers. Confirm to copy the answers and completed sets into this account. The guest copy stays in the browser.'],
    accountGuestEmpty: ['这个网址在当前浏览器里没有游客作答。', 'No guest answers are saved for this address in this browser.'],
    accountGuestUnavailable: ['暂时无法读取此浏览器里的游客记录。', 'Guest records in this browser could not be read.'],
    accountGuestBackup: ['记录在原网址或其他浏览器？先在那里从「学习记录」导出备份，再在这里导入。', 'Are your answers on the original site or in another browser? Export a backup from Learning Records there, then import it here.'],
    accountGuestBackupLink: ['打开备份与迁移', 'Open backup and migration'],
    accountGuestConfirm: ['把 {n} 次游客作答带入当前账号？', 'Bring {n} guest answers into this account?'],
    accountGuestConfirmInfo: ['请确认这是你自己的记录。系统会合并错题和作答，跳过重复记录，并沿用当前账号的计划和设置。', 'Confirm that these records are yours. The app merges answers and mistakes, skips duplicates, and keeps this account’s plan and settings.'],
    accountGuestAction: ['复制到当前账号', 'Copy to this account'],
    accountGuestBusy: ['正在导入游客作答…', 'Importing guest answers…'],
    accountGuestDone: ['已导入 {n} 次新作答，可以到学习记录查看。', 'Imported {n} new answers. View them in Learning Records.'],
    accountGuestAlready: ['这些作答已在当前账号中。', 'These answers are already in this account.'],
    accountGuestError: ['导入结果暂时无法确认。原游客记录仍在，可以重试。', 'The import could not be confirmed. The guest records are still available. You can retry.'],
    accountGuestConflict: ['有一组练习与账号里的记录冲突。账号和游客记录均已保留。', 'One practice set conflicts with records in this account. Both copies were kept.'],
    accountSync: ['刷新或重试同步', 'Refresh or retry sync'], accountSyncing: ['正在同步…', 'Syncing…'], accountSaved: ['已同步到本机测试后台', 'Synced to the local test server'],
    accountUnsaved: ['部分改动尚未同步。请重试，或先导出备份。', 'Some changes have not synced. Retry or export a backup first.'],
    accountStale: ['其他会话已更新设置。作答已合并，请检查计划和偏好。', 'Another session changed the settings. Answers were merged. Check your plan and preferences.'],
    accountLocal: ['测试账号 · {tier}', 'Test account · {tier}'],
    accountImport: ['合并到测试账号？', 'Merge into the test account?'],
    accountImportInfo: ['这份备份的有效记录会存入本机测试后台。请只导入允许在本机试用的数据。', 'Valid records from this backup will be stored in the local test server. Import only data you may use here.'],
    accountImportDone: ['已合并 {n} 次新作答。请查看账号页的同步状态。', 'Merged {n} new answers. Check sync status on the Account page.'],
    accountSignoutUnsaved: ['同步失败，退出会丢失本页尚未保存的改动。', 'Sync failed. Signing out will discard unsaved changes on this page.'],
    accountReportSent: ['问题已发送到本机管理后台。', 'The issue was sent to the local admin portal.'],
    accountReportFailed: ['问题清单已保存在学习记录中，暂时无法发送到后台。', 'The issue is saved in your learning records. The admin portal could not be reached.'],
    aiPreview: ['本机模拟出题，每组 3 道 L1–L3 一元一次方程。题目会自动验算。', 'Local simulation for three L1–L3 linear equations, checked automatically.'],
    aiMember: ['登录测试账号即可体验模拟出题。', 'Sign in with a test account to try simulated AI practice.'],
    aiPlusOnly: ['当前账号可体验基础代数出题。科学组题与按错因出题需要升级版测试权限。', 'This account can try basic algebra generation. Science and mistake-based generation require a Plus trial.'],
    aiPreviewAllowance: ['模拟生成上限为每天 {daily} 组、每月 {monthly} 组。审核题库优先。', 'Simulation allows up to {daily} new sets per day and {monthly} per month. Reviewed questions are used first.'],
    previewVersion: ['本机验收', 'Local preview'],
    aiPreviewBank: ['验收题 · 已验算', 'Preview item · Answer checked'],
    sciencePreviewMode: ['模拟组题 · 已校验', 'Simulated set · Validated']
  };
  let storageIssue = '';
  let persistent = true;
  let state = loadState();
  let questions = Core.questionsForState(bank, state);
  let byId = new Map(questions.map(question => [question.id, question]));
  const aiFormats = { mixed: 'aiMixed', fill: 'aiFill', calculation: 'aiCalculation', choice: 'aiChoice' };
  let selected = null;
  let selectedQuestion = '';
  let setup = { subject: 'english', level: state.preferences.englishLevel || 'auto', topic: '', count: '8', track: 'cefr' };
  let forceSetup = false;
  let mistakeFilter = 'all';
  let resultId = null;
  let aiRequest = null;
  let aiNotice = '';
  let aiFailedLevel = '';
  let reportDays = 7;
  let roadmapSubject = '';
  let backupStatus = null;
  let questionClock = null;
  let displayedDay = '';
  let account = null;
  let auth = { challenge: '', status: '', busy: false };

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
  const study = StudyUI.create({ t, text, escapeHtml, button, heading, subjectName, selectField, locale, language: () => state.language });

  function readGuestState() {
    return Core.readState(localStorage, STORAGE_KEY, LEGACY_STORAGE_KEYS, bank);
  }

  function loadState() {
    try {
      const saved = readGuestState();
      storageIssue = '';
      persistent = true;
      return saved;
    } catch (error) {
      storageIssue = error.name === 'SecurityError' ? 'storageUnavailable' : 'storageDamaged';
      persistent = false;
      return Core.createState();
    }
  }
  function setState(next) {
    state = next;
    questions = Core.questionsForState(bank, state);
    byId = new Map(questions.map(question => [question.id, question]));
  }
  function commit(update) {
    if (account) {
      const previous = state;
      setState(update(state));
      if (Object.keys(state).some(key => key !== 'active' && state[key] !== previous[key])) {
        account.pending = { ...state, active: null };
        void flushAccount(account);
      }
      return;
    }
    if (persistent) {
      try {
        setState(readGuestState());
      } catch (error) {
        persistent = false;
        storageIssue = error.name === 'SecurityError' ? 'storageUnavailable' : 'storageDamaged';
      }
    }
    setState(update(state));
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
    const message = account ? (account.error ? 'accountUnsaved' : '') : storageIssue;
    notice.hidden = !message;
    notice.innerHTML = message ? t(message) : '';
  }
  function route() {
    const value = location.hash.slice(1).split('/', 1)[0];
    if (accountEnabled && value === 'account') return value;
    return ['home', 'practice', 'mistakes', 'result', 'records', 'coach', 'plan', 'report'].includes(value) ? value : 'home';
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
    displayedDay = Core.localDate(new Date());
    const chinese = state.language === 'zh';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    document.getElementById('brand').setAttribute('aria-label', t('brand'));
    document.getElementById('brand-local-name').hidden = !chinese;
    document.querySelector('meta[name="description"]').content = t('metaDescription');
    document.getElementById('language').value = state.language;
    document.getElementById('language-label').innerHTML = t('language');
    renderSoundToggle();
    document.getElementById('skip-link').innerHTML = t('skip');
    const navigation = document.getElementById('navigation');
    navigation.setAttribute('aria-label', t('navigation'));
    const count = Core.getMistakes(state, questions).length;
    const parent = ({ result: 'practice', coach: 'mistakes', report: 'records' })[page] || page;
    navigation.innerHTML = [['home', '⌂'], ['practice', '▤'], ['plan', '□'], ['mistakes', '▧'], ['records', '▥']].map(([id, icon]) => `<a class="nav-link ${parent === id ? 'active' : ''}" href="#${id}" ${page === id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${t(id)}</span>${id === 'mistakes' && count ? `<span class="nav-count">${count}</span>` : ''}</a>`).join('');
    document.getElementById('local-label').innerHTML = account ? t('accountLocal', { tier: copy[account.tier === 'plus' ? 'accountPlus' : 'accountFree'][chinese ? 0 : 1] }) : t('local');
    if (accountEnabled) document.querySelector('.version').innerHTML = t('previewVersion');
    const accountLink = document.getElementById('account-link');
    accountLink.hidden = !accountEnabled;
    accountLink.innerHTML = t(account ? 'account' : 'accountLogin');
    document.getElementById('footer').innerHTML = `${t('brand')} · ${t('disciplines')}`;
    document.getElementById('breadcrumb').innerHTML = `${brandName} &nbsp; / &nbsp; ${t(page)}`;
    document.title = `${t(page)} · ${t('brand')}`;
    if (page === 'home') main.innerHTML = renderHome();
    if (page === 'practice') {
      main.innerHTML = state.active && !forceSetup ? renderQuestion() : renderSetup();
    }
    if (page === 'mistakes') main.innerHTML = renderMistakes();
    if (page === 'result') main.innerHTML = renderResult();
    if (page === 'records') {
      main.innerHTML = renderRecords();
      if (location.hash === '#records/backup') main.querySelector('.backup-panel').open = true;
    }
    if (page === 'coach') main.innerHTML = study.renderCoach(state, questions, location.hash.split('/')[1]);
    if (page === 'plan') main.innerHTML = study.renderPlan(state, questions, roadmapSubject);
    if (page === 'report') main.innerHTML = study.renderReport(state, questions, reportDays);
    if (page === 'account') main.innerHTML = renderAccount();
    for (const select of main.querySelectorAll('select[data-value]')) select.value = select.dataset.value;
    syncQuestionClock();
    updateStorageNotice();
  }

  function syncMessage() {
    if (account.error) return 'accountUnsaved';
    if (account.pending || account.flushing) return 'accountSyncing';
    return account.stale ? 'accountStale' : 'accountSaved';
  }

  function showSync() {
    const element = document.getElementById('account-sync-status');
    if (account && element) element.innerHTML = t(syncMessage());
    updateStorageNotice();
  }

  function renderAccount() {
    if (account) {
      let guestCount = null;
      try { guestCount = readGuestState().attempts.length; }
      catch (_) { /* Leave unreadable guest records in place. */ }
      const guestMessage = guestCount === null ? 'accountGuestUnavailable' : guestCount ? 'accountGuestAvailable' : 'accountGuestEmpty';
      const status = account.migrationStatus;
      const disabled = account.migrating ? 'disabled' : '';
      return `${heading(t('account'), t('accountHelp'))}
        <section class="panel configuration">
          <h2>${t(account.tier === 'plus' ? 'accountPlus' : 'accountFree')}</h2>
          <p id="account-sync-status" role="status">${t(syncMessage())}</p>
          <div class="inline-actions">${button(t('accountSync'), 'account-sync', 'secondary', disabled)}
          ${button(t('accountSignout'), 'account-logout', 'secondary', disabled)}</div>
        </section>
        <section class="panel configuration" aria-labelledby="guest-records-title">
          <h2 id="guest-records-title">${t('accountGuestTitle')}</h2>
          <p>${t(guestMessage, { n: guestCount })}</p>
          ${guestCount ? button(t('accountGuestAction'), 'account-migrate', '', disabled) : ''}
          <p id="account-migration-status" tabindex="-1" role="status">${status ? t(status.key, status) : ''}</p>
          <p>${t('accountGuestBackup')}</p><a href="#records/backup">${t('accountGuestBackupLink')}</a>
        </section>`;
    }
    const disabled = auth.busy ? 'disabled' : '';
    const form = auth.challenge ? `<label class="field"><span>${t('accountCode')}</span>
      <input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"
        aria-describedby="account-login-status" required></label>
      <div class="inline-actions"><button type="submit" class="button" ${disabled}>${t('accountVerify')}</button>
      ${button(t('accountRestart'), 'account-restart', 'secondary', disabled)}</div>`
      : `<div class="inline-actions">${button(t('accountDemoPhone'), 'account-demo-phone', 'secondary', disabled)}
      ${button(t('accountDemoEmail'), 'account-demo-email', 'secondary', disabled)}</div>
      <p id="account-demo-help" class="field-help">${t('accountDemoHelp', Account.demoContacts)}</p>
      <label class="field"><span>${t('accountContact')}</span>
      <input name="contact" type="text" autocomplete="off" autocapitalize="none" maxlength="160"
        aria-describedby="account-demo-help account-login-status" required></label>
      <label class="field"><span>${t('accountInvite')}</span><input name="invite" autocomplete="off" maxlength="64"></label>
      <button type="submit" class="button" ${disabled}>${t('accountSend')}</button>`;
    return `${heading(t('accountLogin'), t('accountSubtitle'))}<form id="account-form" class="panel configuration">
      ${form}
      <p id="account-login-status" role="status">${auth.status ? t(auth.status) : ''}</p></form>
      ${auth.status === 'accountLoadFailed' ? button(t('accountSync'), 'account-sync', 'secondary') : ''}`;
  }

  async function flushAccount(sync) {
    if (sync.flushing) return sync.flushing;
    if (!sync.pending || account !== sync) return;
    sync.error = false;
    sync.flushing = (async () => {
      while (sync.pending && account === sync) {
        const pending = sync.pending;
        sync.pending = null;
        try {
          const saved = await Account.request('/api/history', { owner: sync.id, revision: sync.revision, study: pending });
          if (account !== sync) return;
          if (saved.owner !== sync.id) throw new Error('account_changed');
          sync.revision = saved.revision;
          if (saved.stale) {
            sync.stale = true;
            // Preserve concurrent settings unless a newer edit explicitly changed them locally.
            if (sync.pending) {
              for (const key of ['language', 'plan', 'preferences']) {
                if (sync.pending[key] === pending[key]) sync.pending[key] = saved.study[key];
              }
            }
          }
          if (!sync.pending) setState({ ...saved.study, active: state.active });
        } catch (_) {
          sync.pending ||= pending;
          sync.error = true;
          break;
        }
      }
    })();
    showSync();
    try { await sync.flushing; }
    finally { sync.flushing = null; if (account === sync) showSync(); }
  }

  async function openAccount(profile, prior = account) {
    const saved = await Account.request('/api/history', undefined, profile.id);
    if (account !== prior || saved.owner !== profile.id) throw new Error('account_changed');
    if (prior && (prior.pending || prior.flushing || prior.migrating || prior.id !== profile.id || saved.revision < prior.revision)) throw new Error('account_changed');
    cancelAiRequest();
    account = { ...profile, revision: saved.revision, pending: null, flushing: null, error: false, stale: false,
      migrating: false, migrationStatus: prior?.migrationStatus };
    auth = { challenge: '', status: '', busy: false };
    setState({ ...saved.study, active: prior ? state.active : null });
    if (!prior) { selected = null; resultId = null; backupStatus = null; }
    if (setup.subject === 'english') setup.level = state.preferences.englishLevel || 'auto';
    render();
  }

  async function refreshAccount() {
    const prior = account;
    if (prior?.migrating) return;
    try {
      if (prior?.pending || prior?.flushing) await flushAccount(prior);
      if (prior?.pending || account !== prior) return;
      const profile = await Account.request('/api/session');
      if (account === prior) await openAccount(profile, prior);
    } catch (error) {
      if (account !== prior) return;
      if (prior) { prior.error = true; showSync(); }
      else if (error.status !== 401) { auth.status = 'accountLoadFailed'; if (route() === 'account') render(); }
    }
  }

  async function signOut() {
    const prior = account;
    if (!prior || prior.migrating) return;
    await flushAccount(prior);
    if (prior.pending && !await confirmAction('accountSignout', 'accountSignoutUnsaved', 'accountSignout')) return;
    try {
      await Account.request('/api/logout', {}, prior.id);
    } catch (error) {
      if (error.status !== 409) { announce(t('accountFailed')); return; }
    }
    if (account !== prior) return;
    cancelAiRequest();
    account = null;
    setState(loadState());
    selected = null;
    resultId = null;
    backupStatus = null;
    if (setup.subject === 'english') setup.level = state.preferences.englishLevel || 'auto';
    render();
  }

  async function migrateGuestAnswers() {
    const owner = account;
    if (!owner || owner.migrating) return;
    let guest;
    try { guest = readGuestState(); }
    catch (_) { render(); return; }
    const n = guest.attempts.length;
    if (!n || !await confirmAction('accountGuestConfirm', 'accountGuestConfirmInfo', 'accountGuestAction', { n })) return;
    if (account !== owner || owner.migrating) return;
    owner.migrating = true;
    owner.migrationStatus = { key: 'accountGuestBusy' };
    render();
    let imported = false;
    try {
      const { added, owner: savedOwner } = await Account.request('/api/history/import', { study: Backup.practiceRecords(guest) }, owner.id);
      if (savedOwner !== owner.id || !Number.isSafeInteger(added) || added < 0) throw new Error('account_changed');
      owner.migrationStatus = { key: added ? 'accountGuestDone' : 'accountGuestAlready', n: added };
      imported = true;
    } catch (error) {
      owner.migrationStatus = { key: error.message === 'history_conflict' ? 'accountGuestConflict' : 'accountGuestError' };
    } finally {
      owner.migrating = false;
    }
    if (account !== owner) return;
    if (imported) await refreshAccount();
    if (route() === 'account') {
      render();
      document.getElementById('account-migration-status')?.focus();
    }
  }

  function syncQuestionClock() {
    const session = state.active;
    const question = session?.questionIds[session.index];
    const key = question && session.answers[question] === undefined ? `${session.id}/${question}` : '';
    if (questionClock?.key !== key) questionClock = key ? { key, started: null, elapsed: 0 } : null;
    if (!questionClock) return;
    const visible = route() === 'practice' && !forceSetup && !document.hidden && !document.getElementById('confirm-dialog').open;
    if (visible && questionClock.started === null) questionClock.started = performance.now();
    if (!visible && questionClock.started !== null) {
      questionClock.elapsed += performance.now() - questionClock.started;
      questionClock.started = null;
    }
  }

  function observedDuration() {
    syncQuestionClock();
    if (!questionClock) return undefined;
    const ms = Math.round(questionClock.elapsed + (questionClock.started === null ? 0 : performance.now() - questionClock.started));
    return ms >= 20 && ms <= 600_000 ? ms : undefined;
  }

  function renderSoundToggle() {
    soundButton.hidden = !Sound;
    if (!Sound) return;
    soundButton.setAttribute('aria-label', t('answerSound'));
    soundButton.setAttribute('aria-pressed', String(Sound.enabled()));
    soundButton.title = t(Sound.enabled() ? 'answerSoundOn' : 'answerSoundOff');
  }

  function renderHome() {
    const stats = Core.getStats(state, questions);
    const statCard = (label, value, unit, icon) => `<div class="stat"><div><p class="stat-label">${t(label)}</p><div class="stat-value">${value}${unit ? `<span class="stat-unit">${unit}</span>` : ''}</div></div><span class="stat-icon" aria-hidden="true">${icon}</span></div>`;
    const days = Core.dailyStats(state);
    const max = Math.max(5, ...days.map(day => day.total));
    return `${heading(t('brand'), t('welcomeSub'))}
      <section class="hero"><div class="hero-copy"><h2>${t('heroTitle')}</h2><p>${t('heroText')}</p><a class="button secondary" href="#plan">${t('roadmap')}</a></div>
        ${study.renderToday(Coach.learningPlan(state, questions), state.active, true)}</section>
      <section class="stats-grid" aria-label="${t('workspace')}">${statCard('answered', stats.total, t('questionsUnit'), '▤')}${statCard('accuracy', stats.accuracy === null ? '—' : `${stats.accuracy}%`, stats.accuracy === null ? t('noData') : '', '◎')}${statCard('pending', stats.mistakes, t('questionsUnit'), '▧')}</section>
      <section><div class="section-heading"><h2>${t('subjects')}</h2><span class="section-note">${t('available', { n: subjects.filter(subject => subject.available).length })}</span></div><div class="subject-grid">${subjects.filter(subject => subject.available).map(subject => {
        const stats = Core.getStats(state, questions, subject.id);
        const total = bank.filter(question => question.subject === subject.id && !question.diagnosticOnly && !question.focusOnly).length;
        return `<article class="subject-card ${subject.id}"><div class="subject-top"><span class="subject-symbol" aria-hidden="true">${subject.symbol}</span><span class="subject-meta">${t('questionBank', { n: total })}</span></div><h3>${text(subject.label)}</h3><p class="subject-description">${text(subject.description)}</p><div class="subject-footer"><span class="subject-coverage">${t('coverage', { n: stats.total })}</span>${button(t('start'), 'subject', 'secondary', `data-subject="${subject.id}"`)}</div></article>`;
      }).join('')}</div></section>
      <div class="lower-grid"><section class="panel"><div class="section-heading"><h2>${t('activity')}</h2><span class="section-note">${t('lastWeek')}</span></div><div class="week-chart">${days.map((day, index) => `<div class="chart-column ${index === 6 ? 'today' : ''}" aria-label="${escapeHtml(day.date.toLocaleDateString(locale()))} ${t('questionCount', { n: day.total })}"><span class="bar-number">${day.total}</span><span class="bar-space"><span class="bar" style="height:${Math.max(3, day.total / max * 100)}%"></span></span><span>${index === 6 ? t('today') : escapeHtml(day.date.toLocaleDateString(locale(), { weekday: 'short' }))}</span></div>`).join('')}</div></section>
      <section class="panel study-panel"><h2>${t('report')}</h2><p>${t('reportIntro')}</p><a class="button secondary" href="#report">${t('report')}</a></section></div>
      ${account ? '' : `<div class="reset-area"><button class="text-button" data-action="clear">${t('clearData')}</button></div>`}`;
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
    const science = Science.subjects.includes(subject);
    const summary = placement
      ? (math || science ? t('diagnosticReadyMath') : t('diagnosticReadyEnglish', { level: placement.level }))
      : science ? t('sciencePlacementInfo', { n: Learning.diagnosticIds(subject).length }) : t(math ? 'mathDiagnosticInfo' : 'englishDiagnosticInfo');
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

  const aiConfig = document.querySelector('meta[name="eachveya-ai-endpoint"]');
  const aiEndpoint = () => aiConfig?.content.trim() || '';
  const aiRunsHere = () => !aiConfig?.dataset.origin || aiConfig.dataset.origin === location.origin;
  const canUseAi = () => !accountEnabled || Boolean(account);
  const scienceAiEnabled = () => (!accountEnabled || account?.tier === 'plus') && aiRunsHere() && Boolean(aiEndpoint()) && aiConfig?.dataset.scienceAi === 'enabled';

  function scienceRequest() {
    const { subject, topic, curriculum = '' } = setup;
    if (Science.topics[topic]?.subject !== subject || curriculum) return null;
    const level = setup.level === 'auto' ? Learning.subjectProfile(state, subject)[topic].level : setup.level;
    const wrong = Core.getMistakes(state, questions).find(item => item.question.topic === topic && item.question.level === level);
    const candidates = new Set(Science.candidates({ subject, topic, level }).map(question => question.id));
    const avoid = [...new Set(state.attempts.map(attempt => attempt.questionId).filter(id => candidates.has(id)))].slice(-8);
    return { subject, topic, level, curriculum, weakness: wrong?.question.errorKinds?.[wrong.attempt.choice] || '', avoid };
  }

  function renderSciencePanel() {
    const request = scienceRequest();
    const enable = scienceAiEnabled() && request && Science.candidates(request).length >= 3;
    return `<section class="placement-panel ai-panel" aria-labelledby="science-bank-heading">
      <div><h3 id="science-bank-heading">${t('scienceBank')}</h3><p>${request ? t('scienceAiOffline') : t('chooseScienceTopic')}</p></div>
      ${request ? `<div class="inline-actions">${button(t('sameLevelBank', request), 'science-bank', 'secondary', aiRequest ? 'disabled' : '')}
        ${enable ? button(t('scienceAi'), 'science-ai', 'secondary', aiRequest ? 'disabled' : '') : ''}</div>` : ''}
      ${aiRequest || aiNotice ? `<p class="ai-notice" role="status">${t(aiRequest ? 'aiLoading' : aiNotice)}</p>` : ''}
    </section>`;
  }

  function selectedAiLevel() {
    if (setup.subject !== 'math' || (setup.topic && setup.topic !== 'algebra')) return '';
    if (setup.level !== 'auto') return AI.LEVELS.includes(setup.level) ? setup.level : '';
    const recommended = Learning.mathProfile(state).algebra.level;
    return AI.LEVELS.includes(recommended) ? recommended : AI.LEVELS.at(-1);
  }

  function renderAiPanel() {
    const level = selectedAiLevel();
    const onlineOnly = aiEndpoint() && !aiRunsHere();
    const enabled = Boolean(canUseAi() && aiEndpoint() && !onlineOnly && level);
    const recent = level && Core.getMistakes(state, questions).find(({ question, attempt }) =>
      question.topic === 'algebra' && Coach.mistakeFocus(question, attempt)
        && Date.parse(attempt.at) >= Date.now() - 14 * 86400000);
    const focus = recent && Coach.mistakeFocus(recent.question, recent.attempt);
    const notice = !canUseAi() ? 'aiMember' : !aiEndpoint() ? 'aiOffline' : !level ? 'aiSelection' : aiRequest ? 'aiLoading' : aiNotice;
    const fallback = (onlineOnly || !aiEndpoint() || aiNotice) && !aiRequest ? aiFailedLevel || level : '';
    return `<section class="placement-panel ai-panel math-ai-panel" aria-labelledby="ai-heading">
      <div><h3 id="ai-heading">${t('aiTitle')}</h3><p>${t(accountEnabled ? 'aiPreview' : 'aiScope')}</p>
        ${account?.aiAllowance ? `<p class="field-help">${t('aiPreviewAllowance', account.aiAllowance)}</p>` : ''}</div>
      ${level ? `<div class="ai-format-picker field">
        <label for="ai-format">${t('aiFormat')}</label>
        <select id="ai-format" data-value="${setup.aiFormat || 'mixed'}" ${aiRequest ? 'disabled' : ''}>
          ${AI.ROUND_FORMATS.map(format => `<option value="${format}">${t(aiFormats[format])}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="inline-actions">
        ${enabled ? button(t('aiStart', { level }), 'ai-start', '', `data-level="${level}" ${aiRequest ? 'disabled' : ''}`) : ''}
        ${level && !aiRequest ? button(t('aiSample'), 'ai-sample', 'secondary', `data-level="${level}"`) : ''}
        ${fallback ? button(t('sameLevelBank', { level: fallback }), 'ai-fallback', 'secondary', `data-level="${fallback}"`) : ''}
        ${focus ? `<a href="#coach/${focus}" class="button secondary">${t('targetedAlgebra', { skill: focusSkills[focus].label[state.language] })}</a>` : ''}
      </div>
      ${onlineOnly ? `<p class="field-help">${t('localAiBank')} <a href="https://xzh0524.github.io/smartstudy/#practice" data-online-practice>${t('aiOnline')}</a></p>`
        : notice ? `<p class="ai-notice" role="status">${t(notice)}</p>` : ''}
    </section>`;
  }

  function renderSetup() {
    const { subject, topic, level, count, track, curriculum = '' } = setup;
    const math = subject === 'math';
    const science = Science.subjects.includes(subject);
    const english = subject === 'english';
    const placement = Learning.latestPlacement(state, subject);
    const firstVisit = math && !placement && !state.preferences.mathPlacementDeferred;
    const showIELTS = english && track === 'ielts';
    const showPractice = !firstVisit && !showIELTS;
    const pool = showPractice ? Learning.practicePool(state, setup) : [];
    const number = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
    const unfinished = state.active;
    const profile = topic && Learning.subjectProfile(state, subject, placement);
    const autoLabel = topic ? t('practiceLevel', { level: profile[topic].level }) : t('autoLevel');
    const subjectOptions = subjects.filter(item => item.available).map(item => [item.id, text(item.label)]);
    const topicOptions = [['', t('allTopics')], ...topicsBySubject[subject].map(id => [id, science ? `${text(Science.topics[id].domainLabel)} · ${text(topics[id])}` : text(topics[id])])];
    const levelOptions = [['auto', autoLabel], ...levels[subject].map(item => [item, english ? item : `${item} · ${text(tierLabels[item])}`])];
    const courseOptions = [['', t('generalScience')], ...curricula.filter(course => Science.curriculumKeys.includes(course.id)).map(course => [course.id, text(course.label)])];
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
        ${english ? `<div class="filters study-tracks">${[['cefr', 'cefrTrack'], ['ielts', 'ieltsTrack']].map(([id, label]) =>
          `<button type="button" class="filter-button ${id === track ? 'active' : ''}" data-action="track" data-track="${id}" aria-pressed="${id === track}">${t(label)}</button>`).join('')}</div>` : ''}
        ${showIELTS ? renderIELTS() : renderPlacementPanel(subject, placement, firstVisit)}
        ${!showIELTS && !curriculum ? `<div class="inline-actions">
          ${button(t(Lessons.workshops[subject]), 'lesson', 'secondary', `data-subject="${subject}"`)}
        </div>` : ''}
        ${showPractice ? `
          ${english ? renderEnglishSuggestions() : ''}
          ${science ? selectField('curriculum', t('scienceScope'), courseOptions, curriculum) : ''}
          <div class="field-grid practice-fields">
            ${selectField('topic', t('topic'), topicOptions, topic)}
            ${selectField('difficulty', t('difficulty'), levelOptions, level)}
            ${selectField('count', t('count'), countOptions, count)}
          </div>
          <p class="field-help">${t(english ? 'cefrScope' : 'mathScale')}</p>
          <p class="setup-info" id="setup-info" role="status">${pool.length
            ? t('setupInfo', { n: pool.length, count: number })
            : science && curriculum ? t('scopePlanned', { course: curricula.find(course => course.id === curriculum)?.label[state.language] || curriculum }) : t('emptyMatch')}</p>
          <p class="inline-error" id="practice-error" role="alert" hidden></p>
          <div class="setup-submit"><button class="button" type="submit" ${!pool.length ? 'disabled' : ''}>${t('start')}</button></div>
          ${math ? renderAiPanel() : ''}
          ${science && !curriculum ? renderSciencePanel() : ''}
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
    const tools = `<div class="study-actions record-actions"><a class="button secondary" href="#report">${t('report')}</a></div>`;
    const scienceRecords = Science.subjects.map(subject => {
      const measured = topicsBySubject[subject].filter(topic => rows[topic].total);
      if (!measured.length) return '';
      const profile = Learning.subjectProfile(state, subject);
      return `<section class="records-section" aria-labelledby="records-${subject}"><div class="section-heading"><h2 id="records-${subject}">${subjectName(subject)}</h2></div>
        <p class="records-note">${t('scienceEvidence')}</p><div class="records-grid">${measured.map(topic => renderTopicRecord(subject, topic, rows[topic], profile[topic])).join('')}</div></section>`;
    }).join('');
    if (!mathTopics.length && !englishTopics.length && !scienceRecords) return `${heading(t('recordTitle'))}${empty}${tools}${study.renderBackup(backupStatus, state.flags)}`;

    const math = Learning.mathProfile(state);
    const english = Learning.latestPlacement(state, 'english');
    const englishLevels = Learning.englishProfile(state, english);
    const preferredEnglish = state.preferences.englishLevel;
    const ieltsTarget = state.preferences.ieltsTarget;
    return `${heading(t('recordTitle'), t('recordSubtitle'))}${tools}
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
        ${englishTopics.length ? `<div class="records-grid">${englishTopics.map(topic => renderTopicRecord('english', topic, rows[topic], englishLevels[topic])).join('')}</div>` : empty}
      </section>${scienceRecords}${study.renderBackup(backupStatus, state.flags)}`;
  }

  function renderTopicRecord(subject, topic, row, profile) {
    const status = profile && (profile.basis !== 'starting' || profile.evidence > 0)
      ? t(({ starting: 'starting', diagnostic: 'diagnostic', practice: 'practiceLevel' })[profile.basis], { level: profile.level }) : '';
    const period = (label, data) => `<div><dt>${t(label)}</dt><dd>${data.total ? t('correctFraction', data) : '—'}</dd></div>`;
    return `<article class="panel topic-record" data-topic="${topic}">
      <div class="topic-record-heading"><h3>${text(topics[topic])}</h3>${status ? `<span class="tag">${status}</span>` : ''}</div>
      <p>${t('recordTotals', row)}</p>
      ${Science.subjects.includes(subject) ? `<p class="field-help">${profile.retained ? t('scienceRetained', { level: profile.retained }) : t('scienceUnverified')}</p>` : ''}
      <dl class="record-periods">${period('recentPeriod', row.recent)}${period('earlierPeriod', row.previous)}</dl>
      ${profile?.lastBatch ? `<p class="field-help">${t('batchEvidence', profile.lastBatch)}</p>` : ''}
      ${profile?.lastBatch?.pacedRecheck ? `<p class="field-help">${t('paceRecheck')}</p>` : ''}
      ${profile?.evidence ? `<p class="field-help">${t('evidenceProgress', { n: profile.evidence, total: Learning.EVIDENCE_COUNT })}</p>` : ''}
      ${button(t('practiceTopic'), 'topic-practice', 'secondary', `data-subject="${subject}" data-topic="${topic}"`)}
    </article>`;
  }

  function modeLabel(mode, question) {
    if (mode === 'spaced' && question?.purpose === 'followup') return t('lessonCheck');
    if (accountEnabled && mode === 'science-ai') return t('sciencePreviewMode');
    return t(({ practice: 'practiceMode', diagnostic: 'diagnosticMode', review: 'reviewMode', ai: 'aiTitle', 'algebra-sample': 'aiSampleMode', 'science-ai': 'scienceAiMode' })[mode] || mode);
  }

  function answerLabel(question, response) {
    if (question.fields) {
      return question.fields.map((field, index) => field.label[state.language].replace('□', response[index])).join(' · ');
    }
    return `${'ABCD'[response]} · ${question.options[response][state.language]}`;
  }

  function expectedLabel(question) {
    return answerLabel(question, question.fields ? question.fields.map(field => field.expected) : question.answer);
  }

  function renderNumericFields(question, response, graded, score, hideSolution = false) {
    return `<form id="numeric-answer-form" aria-labelledby="question-title" novalidate>
      ${!graded ? `<p class="question-hint" id="numeric-help">${t('numericHelp')}</p>` : ''}
      <div class="numeric-fields">${question.fields.map((field, index) => `<div class="field">
        <label for="numeric-${index}">${text(field.label)}</label>
        <input id="numeric-${index}" name="answer-${index}" class="numeric-input" data-numeric-input type="text"
          autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40"
          value="${escapeHtml(response[index] ?? '')}" ${graded ? 'readonly' : 'aria-describedby="numeric-help"'}>
        ${score ? `<span class="numeric-mark ${score.marks[index] ? 'score-ok' : 'score-error'}">${score.marks[index]
          ? t('numericMarkCorrect') : hideSolution ? t('stepRetry') : t('numericMarkExpected', { value: field.expected })}</span>` : ''}
      </div>`).join('')}</div>
      <p id="numeric-error" class="inline-error" role="alert" hidden>${t('numericInvalid')}</p>
    </form>`;
  }

  function renderQuestion() {
    const session = state.active;
    const question = byId.get(session.questionIds[session.index]);
    const answer = session.answers[question.id];
    const graded = answer !== undefined;
    const diagnostic = session.mode === 'diagnostic';
    const delayedFeedback = Core.hasDelayedFeedback(session.mode);
    const hasHint = !delayedFeedback && Boolean(question.hint);
    const hinted = session.hintedQuestionIds.includes(question.id);
    if (selectedQuestion !== `${session.id}/${question.id}`) {
      selected = null;
      selectedQuestion = `${session.id}/${question.id}`;
    }
    const choice = graded ? answer : selected;
    const score = graded ? Core.evaluateAnswer(question, answer) : null;
    const correct = score?.correct === true;
    const showGrade = graded && !delayedFeedback;
    const guidedMiss = showGrade && !correct && ['lesson', 'followup'].includes(question.purpose);
    const nextDay = guidedMiss ? Coach.lessonChecks(state, questions) : [];
    const done = Object.keys(session.answers).length;
    const total = session.questionIds.length;
    const options = !question.fields && question.options.map((option, index) => {
      const correctOption = showGrade && !guidedMiss && index === question.answer;
      const wrongOption = showGrade && index === answer && !correct;
      const chosen = choice === index;
      return `<button type="button" class="option ${chosen ? 'selected' : ''} ${correctOption ? 'correct' : ''} ${wrongOption ? 'incorrect' : ''}"
        role="radio" aria-checked="${chosen}" data-action="choose" data-choice="${index}" tabindex="${chosen || (choice === null && index === 0) ? '0' : '-1'}" ${graded ? 'disabled' : ''}>
        <span class="option-letter" aria-hidden="true">${'ABCD'[index]}</span><span>${text(option)}</span>
        ${correctOption || wrongOption ? `<span class="option-feedback" aria-hidden="true">${correctOption ? '✓' : '×'}</span>` : ''}
      </button>`;
    }).join('');
    const solution = `<p class="answer-line">${t('rightAnswer', { answer: expectedLabel(question) })}</p>
        <p><strong>${t('explanation')}</strong></p><p>${text(question.explanation)}</p>${study.renderEvidence(question)}`;
    const feedback = delayedFeedback
      ? `<div class="feedback diagnostic-feedback"><h3 id="feedback-title" tabindex="-1">${t(diagnostic ? 'diagnosticSubmitted' : 'focusedSubmitted')}</h3></div>`
      : `<div class="feedback ${correct ? '' : 'wrong'}">
        <h3 id="feedback-title" tabindex="-1">${t(correct ? 'correct' : 'incorrect')}</h3>
        ${!graded || correct ? '' : study.renderClue(question, score, nextDay)}
        ${guidedMiss ? `<details class="study-details"><summary>${t('explanation')}</summary>${solution}</details>` : solution}
      </div>`;
    return `<div class="page-heading"><div><p class="eyebrow">${modeLabel(session.mode, question)}</p><h1>${subjectName(session.subject)}</h1></div>${button(t('exit'), 'home', 'ghost')}</div>
    <div class="practice-layout">
      <div class="question-top"><span>${t('progress', { current: session.index + 1, total })}</span>
        <span>${t('progressLabel', { subject: subjects.find(item => item.id === session.subject).label[state.language], done, total })}</span></div>
      <div class="progress" role="progressbar" aria-label="${t('answered')}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
        <div class="progress-fill" style="width:${done / total * 100}%"></div>
      </div>
      <section class="panel question-card">
        <div class="question-tags"><span class="tag">${text(topics[question.topic])}</span><span class="tag">${escapeHtml(question.level)}</span>
          ${question.ai ? `<span class="tag">${t(accountEnabled ? 'aiPreviewBank' : 'aiGenerated')}</span>` : ''}
          ${question.ai || question.sample ? `<span class="tag">${t(aiFormats[question.format || 'choice'])}</span>`
            : question.skill ? `<span class="tag">${text(skills[question.skill])}</span>` : ''}</div>
        <h2 id="question-title" class="question-title">${text(question.prompt)}</h2>
        ${question.fields ? renderNumericFields(question, choice || [], graded, showGrade ? score : null, guidedMiss)
          : `<div class="options" role="radiogroup" aria-labelledby="question-title">${options}</div>`}
        ${hasHint && !graded ? `<div class="hint-area">
          ${hinted ? `<p id="question-hint" class="hint-content" tabindex="-1"><strong>${t('hint')}</strong> ${text(question.hint)}</p>`
            : button(t('showHint'), 'hint', 'secondary', 'aria-expanded="false"')}
        </div>` : ''}
        ${graded ? feedback : ''}
        <div class="question-bottom">
          ${hinted || (!graded && !question.fields) ? `<p class="question-hint">${t(graded ? 'hintUsed' : 'selectHint')}</p>` : ''}
          ${graded ? button(t(session.index === total - 1 ? 'finish' : 'next'), 'next')
            : question.fields ? `<button type="submit" class="button" form="numeric-answer-form">${t('submit')}</button>`
              : button(t('submit'), 'grade', '', selected === null ? 'disabled' : '')}
        </div>
      </section>
    </div>`;
  }

  function renderMistakes() {
    const mistakes = Core.getMistakes(state, questions);
    const nextDay = Coach.lessonChecks(state, questions);
    const filtered = mistakes.filter(item => mistakeFilter === 'all' || item.question.subject === mistakeFilter);
    const reviewButtons = subjects.filter(subject => subject.available && (mistakeFilter === 'all' || mistakeFilter === subject.id)).map(subject => {
      const count = mistakes.filter(item => item.question.subject === subject.id).length;
      return count ? button(t('reviewSubject', { subject: subject.label[state.language], n: count }), 'review', '', `data-subject="${subject.id}"`) : '';
    }).join('');
    return `${heading(t('mistakesTitle'), t('mistakesSub'))}<div class="filters">${['all', ...subjects.filter(subject => subject.available).map(subject => subject.id)].map(id => `<button class="filter-button ${mistakeFilter === id ? 'active' : ''}" data-action="filter" data-filter="${id}" aria-pressed="${mistakeFilter === id}">${id === 'all' ? t('allSubjects') : subjectName(id)}</button>`).join('')}</div>
      <div class="review-actions">${reviewButtons}<a class="button secondary" href="#coach">${t('coach')}</a></div>
      ${filtered.length ? `<div class="mistake-list">${filtered.map(({ question, attempt, wrongCount }) => `<article class="mistake-card">
        <div class="mistake-meta"><span>${subjectName(question.subject)} · ${text(topics[question.topic])}</span><span>${t('wrongCount', { n: wrongCount })}</span></div>
        <h3>${text(question.prompt)}</h3><p class="mistake-answer">${t('yourAnswer', { answer: answerLabel(question, Core.responseOf(attempt)) })}</p>
        ${study.renderClue(question, attempt, nextDay)}
        <details><summary>${t('explanation')}</summary><p><strong>${t('rightAnswer', { answer: expectedLabel(question) })}</strong><br>${text(question.explanation)}</p></details>
        <div class="question-bottom"><span class="section-note">${escapeHtml(new Date(attempt.at).toLocaleDateString(locale()))}</span>${button(t('reviewOne'), 'review-one', 'secondary', `data-id="${question.id}"`)}</div>
      </article>`).join('')}</div>` : `<section class="panel empty-state"><span class="empty-symbol" aria-hidden="true">✓</span><h2>${t('emptyTitle')}</h2><p>${t('emptyText')}</p>${button(t('start'), 'setup')}</section>`}`;
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
    const nextDay = Coach.lessonChecks(state, questions);
    return `<div class="page-heading"><div>
      <p class="eyebrow">${subjectName(session.subject)}${diagnostic ? '' : ` · ${modeLabel(session.mode, byId.get(session.questionIds[0]))}`}</p>
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
      ${study.renderFocusResult(state, questions, session)}
      <section class="result-list"><h2>${t('answerDetails')}</h2>${session.questionIds.map(id => {
        const question = byId.get(id);
        const attempt = attempts.find(item => item.questionId === id);
        return `<div class="result-row ${attempt.correct ? '' : 'wrong'}">
          <span class="result-status" aria-hidden="true">${attempt.correct ? '✓' : '×'}</span>
          <details>
            <summary><span class="sr-only">${t(attempt.correct ? 'correct' : 'incorrect')} </span>${text(question.prompt)}</summary>
            ${!attempt.correct && question.purpose === 'lesson' ? study.renderClue(question, attempt, nextDay) : ''}
            <p>${t('yourAnswer', { answer: answerLabel(question, Core.responseOf(attempt)) })}<br>
            ${t('rightAnswer', { answer: expectedLabel(question) })}<br>
            ${text(question.explanation)}${attempt.hinted ? `<br><strong>${t('hintUsed')}</strong>` : ''}</p>
            ${study.renderEvidence(question)}
            ${study.renderQuestionReport(question, state.flags.find(flag => flag.questionId === id))}
          </details>
        </div>`;
      }).join('')}</section>
    </div>`;
  }

  function confirmAction(title, description, action, values) {
    const dialog = document.getElementById('confirm-dialog');
    if (dialog.open) return Promise.resolve(false);
    document.getElementById('dialog-title').innerHTML = t(title, values);
    document.getElementById('dialog-text').innerHTML = t(description);
    document.getElementById('dialog-cancel').innerHTML = t('cancel');
    document.getElementById('dialog-confirm').innerHTML = t(action);
    dialog.returnValue = '';
    dialog.showModal();
    syncQuestionClock();
    return new Promise(resolve => dialog.addEventListener('close', () => {
      syncQuestionClock();
      resolve(dialog.returnValue === 'confirm');
    }, { once: true }));
  }
  async function begin(options) {
    if (aiRequest) { cancelAiRequest(); render(); }
    const previousId = state.active?.id;
    if (previousId && !await confirmAction('replaceTitle', 'replaceText', 'continue')) return;
    commit(current => {
      if (current.active?.id !== previousId) throw new Error('The active practice changed');
      if (options.lessonCheck && !Coach.lessonChecks(current, questions).some(task =>
        task.focus === options.focus && task.ready && task.id === options.ids[0])) throw new Error('The next-day check changed');
      if (options.sample) return Core.startAlgebraSample(current, bank, options.level, options.format);
      if (options.ids) return Core.startSession(current, questions, options);
      const ids = Learning.practiceIds(current, options);
      const count = options.count === 'all' ? ids.length : Number(options.count);
      return Core.startSession(current, questions, { ...options, ids, count });
    });
    showActivePractice();
  }

  function showActivePractice() {
    forceSetup = false;
    selected = null;
    go('practice');
    window.scrollTo(0, 0);
    main.focus();
  }

  function cancelAiRequest() {
    aiRequest?.abort();
    aiRequest = null;
    aiNotice = '';
    aiFailedLevel = '';
  }

  async function beginAi(level) {
    const endpoint = aiEndpoint();
    const science = typeof level === 'object';
    const format = setup.aiFormat || 'mixed';
    if (!canUseAi() || !endpoint || !aiRunsHere() || aiRequest || (science ? !level || !scienceAiEnabled() : !selectedAiLevel() || !AI.LEVELS.includes(level))) return;
    const previousId = state.active?.id;
    const request = new AbortController();
    aiRequest = request;
    aiNotice = '';
    aiFailedLevel = '';
    render();
    announce(t('aiLoading'));
    let timeout;
    let started = false;
    try {
      if (previousId && !await confirmAction('replaceTitle', 'replaceText', 'continue')) return;
      if (aiRequest !== request) return;
      const payload = science ? level : { level, avoid: state.generated.filter(spec => spec.level === level && spec.source !== 'template').slice(-8).map(AI.signature) };
      timeout = setTimeout(() => request.abort(), 25000);
      const headers = { 'Content-Type': 'application/json' };
      if (accountEnabled) Object.assign(headers, { 'X-EachVeya-Request': 'web-v1', 'X-EachVeya-Account': account.id });
      const response = await fetch(science ? (accountEnabled ? '/api/ai/science' : new URL('/api/science', endpoint).href) : endpoint, {
        method: 'POST', headers, credentials: accountEnabled ? 'same-origin' : 'omit',
        signal: request.signal, body: JSON.stringify(payload)
      });
      if (aiRequest !== request) return;
      if (!response.ok) {
        aiNotice = response.status === 429 ? 'aiLimit' : response.status === 422 ? 'aiInvalid'
          : accountEnabled && response.status === 403 ? 'aiPlusOnly' : 'aiFailure';
        return;
      }
      const { questions: items, questionIds } = await response.json();
      if (aiRequest !== request || route() !== 'practice') return;
      if (science) {
        const allowed = new Set(Science.candidates(payload).filter(Science.validate).map(question => question.id));
        if (!Array.isArray(questionIds) || questionIds.length !== 3 || new Set(questionIds).size !== 3 || !questionIds.every(id => allowed.has(id))) {
          aiNotice = 'aiInvalid';
          return;
        }
      } else if (!AI.validateBatch(items, level, state.generated.filter(spec => spec.source !== 'template'))) { aiNotice = 'aiInvalid'; return; }
      commit(current => {
        if (current.active?.id !== previousId) throw new Error('The active practice changed');
        if (science) return Core.startSession(current, questions, { subject: payload.subject, ids: questionIds, count: 3, mode: 'science-ai' });
        return Core.startAiSession(current, bank, level, items, format);
      });
      started = true;
    } catch (_) {
      if (aiRequest === request) aiNotice = 'aiFailure';
    } finally {
      clearTimeout(timeout);
      if (aiRequest === request) {
        aiRequest = null;
        if (aiNotice && !science) aiFailedLevel = level;
        if (started) showActivePractice();
        else if (route() === 'practice') {
          render();
          if (aiNotice) {
            announce(t(aiNotice));
            main.querySelector(science ? '[data-action="science-bank"]' : '[data-action="ai-start"]')?.focus();
          }
        }
      }
    }
  }

  function openSetup(subject, topic = '') {
    cancelAiRequest();
    setup = {
      ...setup, subject, topic, curriculum: '', track: 'cefr',
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

  function downloadJson(label, contents) {
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `EachVeya-${label}${Core.localDate(new Date())}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(file) {
    let incoming;
    const owner = account;
    try {
      if (!file || file.size > 12 * 1024 * 1024) throw new Error('invalid_backup');
      incoming = Backup.parse(await file.text(), bank);
    } catch (_) {
      backupStatus = { key: 'backupInvalid' };
    }
    if (incoming) {
      if (owner && !await confirmAction('accountImport', 'accountImportInfo', 'backupImport')) return;
      if (owner !== account) return;
      let added = 0;
      try {
        commit(current => {
          const next = Backup.merge(current, incoming, bank);
          added = next.attempts.length - current.attempts.length;
          return next;
        });
        backupStatus = owner ? { key: 'accountImportDone', n: added } : persistent ? { key: 'backupDone', n: added } : { key: 'backupTemporary' };
        selected = null;
        setup.level = setup.subject === 'english' ? state.preferences.englishLevel || 'auto' : setup.level;
      } catch (error) {
        backupStatus = { key: error.message === 'active_conflict' ? 'backupActive' : 'backupConflict' };
      }
    }
    if (route() === 'records') {
      render();
      document.getElementById('backup-status')?.focus();
    }
  }
  document.getElementById('skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  });
  soundButton.addEventListener('click', () => {
    if (!Sound) return;
    Sound.setEnabled(!Sound.enabled());
    renderSoundToggle();
    announce(t(Sound.enabled() ? 'answerSoundOn' : 'answerSoundOff'));
  });
  document.getElementById('language').addEventListener('change', event => {
    const language = event.target.value;
    commit(current => ({ ...current, language }));
    render();
  });
  main.addEventListener('change', event => {
    const { id, value } = event.target;
    if (id === 'plan-goal') {
      document.getElementById('plan-topic').innerHTML = study.planTopicOptions(value);
      return;
    }
    if (id === 'ai-format' && AI.ROUND_FORMATS.includes(value)) {
      setup.aiFormat = value;
      return;
    }
    if (!['subject', 'topic', 'difficulty', 'count', 'ielts-target', 'curriculum'].includes(id)) return;
    cancelAiRequest();
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
  function submitAnswer(response) {
    const sessionId = state.active?.id;
    const questionId = state.active?.questionIds[state.active.index];
    const duration = observedDuration();
    let answer;
    commit(current => {
      if (current.active?.id !== sessionId || current.active?.questionIds[current.active.index] !== questionId) return current;
      const updated = Core.gradeAnswer(current, questions, response, new Date().toISOString(), duration);
      if (updated !== current && !Core.hasDelayedFeedback(current.active.mode)) answer = updated.attempts.at(-1).correct;
      return updated;
    });
    if (!testing && typeof answer === 'boolean') Sound?.play(answer);
    render();
    document.getElementById('feedback-title')?.focus();
  }

  main.addEventListener('input', event => {
    if (!event.target.matches('[data-numeric-input]')) return;
    selected = [...event.target.form.querySelectorAll('[data-numeric-input]')].map(input => input.value);
    event.target.removeAttribute('aria-invalid');
    document.getElementById('numeric-error').hidden = true;
  });

  main.addEventListener('submit', async event => {
    if (event.target.id === 'numeric-answer-form') {
      event.preventDefault();
      const fields = [...event.target.querySelectorAll('[data-numeric-input]')];
      if (fields.every(field => field.readOnly)) return;
      const invalid = fields.find(field => !AI.parseNumber(field.value));
      if (invalid) {
        document.getElementById('numeric-error').hidden = false;
        invalid.setAttribute('aria-invalid', 'true');
        invalid.focus();
        return;
      }
      try { submitAnswer(fields.map(field => field.value)); }
      catch (_) { render(); reportSetupError(t('error')); }
      return;
    }
    if (event.target.id === 'account-form') {
      event.preventDefault();
      if (!accountEnabled || account || auth.busy) return;
      const form = new FormData(event.target);
      const contact = form.get('contact')?.trim();
      const method = contact ? Account.demoMethod(contact) : null;
      if (!auth.challenge && !method) {
        auth.status = 'accountDemoRequired';
        document.getElementById('account-login-status').innerHTML = t(auth.status);
        const field = event.target.elements.namedItem('contact');
        field.setAttribute('aria-invalid', 'true');
        field.focus();
        return;
      }
      auth.busy = true;
      const submit = event.target.querySelector('button[type="submit"]');
      submit.disabled = true;
      try {
        if (auth.challenge) {
          const profile = await Account.request('/api/verify-code', { challenge: auth.challenge, code: form.get('code') });
          auth.challenge = '';
          try { await openAccount(profile); }
          catch (_) { auth.status = 'accountLoadFailed'; }
        } else {
          const { challenge } = await Account.request('/api/request-code', {
            method, contact, invite: form.get('invite').trim()
          });
          auth.challenge = challenge;
          auth.status = 'accountSent';
        }
      } catch (error) {
        if (error.status === 429) auth.status = 'accountRate';
        else if (error.message === 'test_identity_required') auth.status = 'accountDemoRequired';
        else if (error.message === 'invalid_code') auth.status = 'accountInvalidCode';
        else auth.status = 'accountConnection';
      } finally {
        auth.busy = false;
        if (route() === 'account') { render(); main.querySelector('input')?.focus(); }
      }
      return;
    }
    if (event.target.id === 'plan-form') {
      event.preventDefault();
      const plan = Core.normalizePlan({ enabled: true, goal: document.getElementById('plan-goal').value,
        topic: document.getElementById('plan-topic').value, minutes: document.getElementById('plan-minutes').value,
        deadline: document.getElementById('plan-deadline').value });
      commit(current => ({ ...current, plan }));
      render();
      announce(t('planSaved'));
      main.querySelector('.today-plan button, .today-plan a')?.focus();
      return;
    }
    if (event.target.id === 'backup-form') {
      event.preventDefault();
      await importBackup(document.getElementById('backup-file').files[0]);
      return;
    }
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
      if (action === 'account-demo-phone' || action === 'account-demo-email') {
        if (auth.busy) return;
        const contact = target.form.elements.namedItem('contact');
        contact.value = Account.demoContacts[action === 'account-demo-phone' ? 'phone' : 'email'];
        contact.removeAttribute('aria-invalid');
        auth.status = '';
        document.getElementById('account-login-status').textContent = '';
        target.form.elements.namedItem('invite').focus();
        return;
      }
      if (action === 'account-restart') { auth = { challenge: '', status: '', busy: false }; render(); main.querySelector('input')?.focus(); }
      if (action === 'account-sync') await refreshAccount();
      if (action === 'account-logout') await signOut();
      if (action === 'account-migrate') await migrateGuestAnswers();
      if (action === 'choose') {
        selected = Number(target.dataset.choice);
        render();
        main.querySelector(`[data-choice="${selected}"]`).focus();
      }
      if (action === 'grade') submitAnswer(selected);
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
      if (action === 'plan-practice' || action === 'plan-review') {
        const plan = Coach.learningPlan(state, questions);
        const task = action === 'plan-review' ? plan.bankReview : plan.practice;
        if (task) await begin(task);
        else render();
      }
      if (action === 'roadmap-subject' && Object.hasOwn(topicsBySubject, target.dataset.subject)) {
        roadmapSubject = target.dataset.subject;
        render();
        main.querySelector(`[data-action="roadmap-subject"][data-subject="${roadmapSubject}"]`)?.focus();
      }
      if (action === 'report-window' && Coach.reportWindows.includes(Number(target.dataset.days))) {
        reportDays = Number(target.dataset.days);
        render();
        main.querySelector(`[data-days="${reportDays}"]`)?.focus();
      }
      if (action === 'backup-export') downloadJson('', Backup.serialize(state));
      if (action === 'flag-export') downloadJson('issues-', JSON.stringify(state.flags, null, 2));
      if (action === 'flag-question') {
        const id = target.dataset.id;
        const reason = target.closest('.question-report').querySelector('[data-flag-reason]').value;
        commit(current => Core.flagQuestion(current, byId.get(id), reason));
        render();
        const fresh = [...main.querySelectorAll('[data-action="flag-question"]')].find(item => item.dataset.id === id);
        if (fresh) { fresh.closest('.result-row > details').open = true; fresh.focus(); }
        let message = 'flagSaved';
        const owner = account;
        if (owner) {
          try { await Account.request('/api/feedback', { reason, questionId: id }, owner.id); message = 'accountReportSent'; }
          catch (_) { message = 'accountReportFailed'; }
          if (account === owner) {
            const status = fresh?.closest('.question-report')?.querySelector('[role="status"]');
            if (status) status.innerHTML = t(message);
          }
        }
        announce(t(message));
      }
      if (action === 'resume') { cancelAiRequest(); forceSetup = false; go('practice'); }
      if (action === 'setup') { forceSetup = true; go('practice'); }
      if (action === 'subject' || action === 'topic-practice') openSetup(target.dataset.subject, target.dataset.topic);
      if (action === 'ai-start') await beginAi(target.dataset.level);
      if (action === 'ai-sample' && AI.LEVELS.includes(target.dataset.level)) {
        try { await begin({ sample: true, level: target.dataset.level, format: setup.aiFormat || 'mixed' }); }
        catch (_) { reportSetupError(t('aiSampleFailed')); }
      }
      if (action === 'science-ai') await beginAi(scienceRequest());
      if (action === 'science-bank') {
        const request = scienceRequest();
        if (request) {
          const ordered = Learning.practiceIds(state, request);
          const ideas = ordered.filter(id => Object.values(byId.get(id).errorKinds).includes(request.weakness));
          const fresh = new Set(Science.candidates(request).map(question => question.id));
          const ids = [...new Set([...ideas.filter(id => fresh.has(id)), ...ordered])].slice(0, 3);
          if (ids.length) await begin({ subject: request.subject, ids, count: ids.length });
        }
      }
      if (action === 'ai-fallback' && AI.LEVELS.includes(target.dataset.level)) {
        await begin({ subject: 'math', topic: 'algebra', level: target.dataset.level, count: 3 });
      }
      if (action === 'lesson' && Object.hasOwn(Lessons.workshops, target.dataset.subject)) {
        const subject = target.dataset.subject;
        const ids = Lessons.roundIds(state, subject);
        await begin({ subject, ids, count: ids.length });
      }
      if (action === 'lesson-check') {
        const task = Coach.lessonChecks(state, questions).find(item => item.focus === target.dataset.focus);
        if (task?.resume) showActivePractice();
        else if (task?.ready) await begin({ subject: focusSkills[task.focus].subject,
          ids: [task.id], count: 1, focus: task.focus, mode: 'spaced', lessonCheck: true });
      }
      if (action === 'focus-practice') {
        const { focus, mode } = target.dataset;
        const profile = Coach.assessment(state, questions)[focus];
        if (profile && mode === 'spaced' && (!profile.due || profile.due > Core.localDate(new Date()))) return;
        const ids = Coach.focusIds(state, focus, mode, undefined, profile);
        if (ids.length) await begin({ subject: focusSkills[focus].subject, ids, count: ids.length, focus, mode });
      }
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
      if (action === 'clear' && !account && await confirmAction('clearTitle', 'clearText', 'clear') && !account) {
        const language = state.language;
        commit(() => ({ ...Core.createState(), language }));
        selected = null;
        resultId = null;
        backupStatus = null;
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
    if (route() !== 'practice') {
      cancelAiRequest();
      forceSetup = false;
    }
    render();
    const checks = location.hash === '#plan/checks' && document.getElementById('lesson-checks-title');
    if (checks) { checks.focus(); return; }
    window.scrollTo(0, 0);
    main.focus();
  });
  document.addEventListener('visibilitychange', () => {
    syncQuestionClock();
    if (!document.hidden && ['home', 'plan'].includes(route()) && displayedDay !== Core.localDate(new Date())) render();
  });
  window.addEventListener('storage', event => {
    if (account) return;
    if (event.key !== STORAGE_KEY && !LEGACY_STORAGE_KEYS.includes(event.key) && event.key !== null) return;
    setState(loadState());
    if (setup.subject === 'english') setup.level = state.preferences.englishLevel || 'auto';
    selected = null;
    render();
    announce(t('changed'));
  });
  render();
  if (accountEnabled) {
    void refreshAccount();
    window.addEventListener('beforeunload', event => {
      if (!account?.pending && !account?.flushing) return;
      event.preventDefault();
      event.returnValue = true;
    });
  }
  if (testing) {
    const script = document.createElement('script');
    script.src = 'tests.js?v=2.12';
    document.body.appendChild(script);
  }
})();
