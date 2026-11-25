(function () {
  'use strict';
  const Coach = globalThis.EachVeyaCoach;
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const Science = globalThis.EachVeyaScience;
  const { skills } = globalThis.EachVeyaSkills;
  const { topics, topicsBySubject, subjects } = globalThis.SmartStudyData;

  const copy = {
    evidenceLessons: ['三题专项试练', 'Three-question workshops'],
    lessonReview: ['本组题已通过程序检查，仍待独立教师复核。发现问题可在练习结果中报错。', 'These questions have passed automated checks and await independent teacher review. Flag an issue from your results.'],
    equationLesson: ['分两步解方程 · L2', 'Two-step equations · L2'],
    readingLesson: ['找到支持答案的原句 · A1', 'Find the supporting sentence · A1'],
    originalEvidence: ['原文依据', 'Evidence in the passage'],
    stepHint: ['这一步的提示', 'Hint for this step'],
    stepSubtract: ['第一步先消掉左边的 +{n}。等式两边都减 {n}，再算右边的 {expression}。', 'First undo +{n} on the left. Subtract {n} from both sides, then work out {expression} on the right.'],
    stepAdd: ['第一步先消掉左边的 −{n}。等式两边都加 {n}，再算右边的 {expression}。', 'First undo −{n} on the left. Add {n} to both sides, then work out {expression} on the right.'],
    stepDivide: ['中间值算对了。现在两边同时除以 x 的系数 {n}，再算 {expression}。', 'Your intermediate value is correct. Divide both sides by the coefficient {n}, then work out {expression}.'],
    cluePerson: ['先找问题说的动作，再看原文里谁做了这个动作。', 'Find the action in the question, then look for who actually does it in the passage.'],
    cluePlace: ['先圈出问题里要找的人或物，再找同一句里的地点。只提到地点的句子还不够。', 'Find the person or thing from the question and the place in the same sentence. A place alone is not enough.'],
    clueTime: ['先找问题问的那件事，再检查同一句中的时间。文中其他事情的时间容易混淆。', 'Find the event from the question, then check its time in the same sentence. Other events may have their own times.'],
    clueReason: ['先找问题里的动作，再找说明原因的词，例如 because。', 'Find the action in the question, then look for a reason word such as “because”.'],
    clueDetail: ['先找问题指的是哪件事，再核对原句是否同时说到了所问的细节。', 'Find the event or thing named in the question, then check that the same sentence gives the detail you need.'],
    lessonChecks: ['错题跨日复测', 'Next-day checks on missed questions'],
    lessonCheck: ['新题复测', 'New-question check'],
    lessonStart: ['做一道新题', 'Try one new question'],
    lessonStartSkill: ['做一道新题 · {skill}', 'Try one new question · {skill}'],
    lessonStartsOn: ['{date} 可做一道新题', 'One new question available on {date}'],
    lessonReady: ['新题已可以做', 'Your new question is ready'],
    lessonUnavailable: ['这个专项暂时没有未做过的新题。', 'There are no unseen check questions left for this workshop.'],
    lessonPassed: ['本次新题答对了。', 'You answered this new question correctly.'],
    lessonRetry: ['先看这一步的提示，隔天再用一道新题试试。', 'Review the hint for this step and try another new question the next day.'],
    lessonOpen: ['查看跨日复测', 'View next-day checks'],
    coach: ['分步辅导', 'Step-by-step guidance'],
    coachIntro: ['先判断自己卡在哪一步，再用没见过的题检验理解。', 'Find the step you got stuck on, then check your understanding on a new question.'],
    coachBasis: ['这些提示和例题由预设教学规则提供，可在本地使用。', 'These guided prompts and worked examples use built-in teaching rules and work locally.'],
    coachPrompt: ['先想一想', 'Think it through'],
    coachHelp: ['查看这一步的提示', 'Get a hint for this step'],
    coachRule: ['查看规则与例题', 'See the rule and a worked example'],
    coachPrerequisites: ['先复习这些基础步骤', 'Review these prerequisite skills'],
    coachTrace: ['记录提示先补这些步骤', 'Your answers suggest revisiting these steps first'],
    coachSuggestion: ['选项提示可能卡在「{skill}」。用两道新题进一步确认。', 'This choice may point to difficulty with “{skill}”. Check it on two new questions.'],
    coachAmbiguous: ['这道题的选项不足以判断错因。可以先看解析，再练同一知识点。', 'This answer does not pinpoint a cause. Read the explanation, then try the same topic again.'],
    coachJump: ['看分步辅导', 'Open guided practice'],
    coachBankFallback: ['继续练这个知识点', 'Practise this topic'],
    probe: ['两题错因探查', 'Two-question diagnostic'],
    retake: ['两题变式复测', 'Two-question transfer check'],
    spaced: ['间隔复习', 'Spaced review'],
    focusedSubmitted: ['已提交。完成本组后可看答案和解析。', 'Submitted. Answers and explanations appear after this set.'],
    coachUntested: ['尚未测评', 'Not yet assessed'],
    coachPossible: ['有待确认', 'Needs checking'],
    coachConfirmed: ['两道新题出现同类错误，建议先补练这一步。', 'The same error appeared on two new questions. Practise this step first.'],
    coachVerified: ['最近一次新题检验通过，继续按计划复习。', 'The latest check on new questions passed. Continue with scheduled review.'],
    coachScheduled: ['已记录初练表现，等待跨日复测。', 'Practice evidence is recorded. A later-day check is pending.'],
    scienceErrorClue: ['此选项可能涉及「{kind}」。做两道新题再确认。', 'This option may involve “{kind}”. Try two new items to check.'],
    scienceSource: ['查看知识参考', 'View the subject reference'],
    coachEmpty: ['这个专项的可用新题已用完，可继续练习题库里的同一知识点。', 'You have used all fresh questions for this skill. Continue with the topic bank.'],
    coachDue: ['下次复习 {date}', 'Next review {date}'],
    coachDueNow: ['待复习', 'Due for review'],
    coachCheckSummary: ['本组独立答对 {independent}/{answered} 道新题。', '{independent}/{answered} new questions answered correctly without hints.'],
    targetedAlgebra: ['根据近期错题练「{skill}」', 'Practise “{skill}” from recent mistakes'],
    sameLevelBank: ['做同等级题库题（{level}）', 'Use the {level} question bank'],
    localAiBank: ['本地版可以直接练已验算的题库变式。', 'The local version can use verified variations from the question bank.'],
    plan: ['学习中心', 'Study centre'], planSubtitle: ['先做今天的小任务，再沿知识路线继续学。', 'Start with a short daily task, then follow a topic path.'],
    planSettings: ['调整我的计划', 'Edit my plan'], planGoal: ['目标科目', 'Subject goal'], planBalanced: ['数学和英语', 'Mathematics and English'], planAll: ['全部学科', 'All subjects'],
    planTopic: ['重点知识点', 'Focus topic'], planMinutes: ['每日可用时间（分钟）', 'Daily time available (minutes)'],
    planDeadline: ['考试日期（可选）', 'Exam date (optional)'], planSave: ['保存学习计划', 'Save study plan'],
    planSaved: ['学习计划已保存。', 'Study plan saved.'], planTask: ['今日任务', 'Today’s task'],
    planStart: ['练 {topic} · {n} 题', 'Practise {topic} · {n} questions'], planPlacement: ['做 {subject} 起点测试', 'Take the {subject} placement check'],
    planDailyTime: ['计划用时 {minutes} 分钟', 'A {minutes}-minute plan'],
    planProgress: ['今天已作答 {n} 题，目标 {target} 题', '{n} answers today, target {target}'],
    planReview: ['复习 {topic} · {n} 题', 'Review {topic} · {n} questions'],
    planBankReview: ['重做 {subject} 错题 · {n} 题', 'Retry {subject} mistakes · {n} questions'],
    planComplete: ['今日任务完成', 'Daily goal complete'],
    planBudgetDone: ['今天的计划用时已到', 'Today’s planned time is up'],
    planMoreTasks: ['查看其余任务', 'See the other tasks'],
    planOther: ['自由练习', 'Choose your practice'],
    planUpcoming: ['未来 7 天', 'Next 7 days'], planMonth: ['未来 30 天', 'Next 30 days'],
    planExamSoon: ['考前一周优先巩固已有知识，并缩短新练习。', 'In the week before the exam, prioritise review and keep new sets short.'],
    planNeedsVariants: ['{n} 个专项暂缺新复测题，可先看辅导。', '{n} skills need fresh check questions. Guidance is available.'],
    planScheduled: ['已安排复习', 'Scheduled review'], planProposed: ['建议练习', 'Suggested practice'],
    roadmap: ['知识路线', 'Topic paths'], roadmapIntro: ['从基础开始，也可以直接练任何一节。', 'Start with the basics or choose any topic.'],
    roadmapPractised: ['练过 {n} 道不同题', '{n} distinct questions tried'],
    roadmapVerified: ['{n} 个子技能通过复测', '{n} skills passed a check'],
    roadmapGuide: ['学这节', 'Guide'],
    report: ['学习报告', 'Study report'], reportIntro: ['根据已提交的作答比较表现，并查看下一步可练的知识点。', 'Compare submitted answers and choose what to practise next.'],
    reportToday: ['今天', 'Today'], reportWeek: ['近 7 天', 'Last 7 days'], reportMonth: ['近 30 天', 'Last 30 days'], reportQuarter: ['近 90 天', 'Last 90 days'],
    reportFilters: ['报告时段', 'Report period'], reportTime: ['记录到的作答时间', 'Observed answering time'],
    reportTimeValue: ['{n} 分 {seconds} 秒', '{n} min {seconds} sec'], reportTimeCoverage: ['{timed}/{total} 次作答有计时', '{timed}/{total} answers have timing'],
    reportDelta: ['当前答对 {correct}/{total}；此前同长度时段答对 {previousCorrect}/{previousTotal}。', '{correct}/{total} correct this period; {previousCorrect}/{previousTotal} in the previous equal-length period.'],
    reportNoComparison: ['至少两个时段有作答后可比较。', 'Comparison is available once both periods have answers.'],
    reportActivity: ['每日作答量', 'Answers by day'], reportAccuracy: ['每日作答正确率', 'Accuracy by day'],
    reportWeeklyActivity: ['每周作答量', 'Answers by week'], reportWeeklyAccuracy: ['每周作答正确率', 'Accuracy by week'],
    reportDate: ['日期', 'Date'], reportTable: ['查看图表数据', 'View chart data'],
    reportMap: ['知识点练习地图', 'Topic practice map'], reportEvidence: ['{n} 道不同题，{correct}/{total} 次答对', '{n} distinct questions, {correct}/{total} answers correct'],
    reportSparse: ['样本较少', 'Small sample'], reportSkillNote: ['正确率描述本时段做过的题目。每个知识点同时显示题数。', 'Accuracy describes answers from this period. Each topic also shows the sample size.'],
    reportMistakes: ['常见错因线索', 'Common mistake patterns'],
    reportMistakeCount: ['{attempts} 次线索，来自 {distinct} 道不同题', '{attempts} clues across {distinct} distinct questions'],
    reportMistakeKind: ['{kind} · {n} 次', '{kind} · {n} times'],
    reportNext: ['下一步', 'Suggested next step'], reportNextTopic: ['试练「{topic}」', 'Try “{topic}”'],
    reportNoMistakes: ['本时段暂时没有可归类的错因线索。', 'No identifiable mistake patterns in this period yet.'],
    paceRecheck: ['这一组出现多次很快的错误回答。先保留当前等级，继续积累练习证据。', 'Several incorrect answers came very quickly. The current level stays in place while more evidence is collected.'],
    backups: ['备份与迁移', 'Backup and transfer'], backupHelp: ['导出的文件含作答、错题、未完成练习及学习计划。可在另一浏览器或新网址导入。', 'The file includes answers, mistakes, unfinished practice and your plan. Import it in another browser or at a new address.'],
    backupExport: ['导出学习记录', 'Export study history'], backupImport: ['导入并合并', 'Import and merge'],
    backupFile: ['选择 EachVeya 的 JSON 备份文件', 'Choose an EachVeya JSON backup file'],
    backupDone: ['已合并学习记录，新增 {n} 次作答。', 'Study history merged. Added {n} answers.'],
    backupInvalid: ['无法读取这份备份。请选择兼容的 EachVeya JSON 文件（不超过 12 MB）。', 'This backup could not be read. Choose a compatible EachVeya JSON file up to 12 MB.'],
    backupConflict: ['备份和当前记录存在冲突，未合并。请先导出留存当前记录。', 'The backup conflicts with current study data. Save a copy of your current records before resolving the conflict.'],
    backupActive: ['两份记录各有不同的未完成练习。请先完成本机的练习，再重试导入。', 'Both records have different unfinished practices. Finish the practice on this device, then try importing again.'],
    backupTemporary: ['记录已合并到当前页面，但浏览器无法保存。可立即导出合并后的记录。', 'Records are merged on this page, but the browser could not save them. Export the merged records now if you need a copy.'],
    flagQuestion: ['记录题目问题', 'Flag a question issue'], flagReason: ['问题类型', 'Issue type'],
    wording: ['题干或选项不清楚', 'Unclear prompt or choices'], answer: ['答案或解析可能有误', 'Possible answer or explanation error'],
    translation: ['翻译问题', 'Translation problem'],
    flagSaved: ['已记录，可在「学习记录」中导出问题清单。', 'Flag saved. Export the issue list from Learning progress.'],
    flagExport: ['导出题目问题清单', 'Export question issues']
  };

  function create({ t, text, escapeHtml, button, heading, subjectName, selectField, locale, language }) {
    const sectionStatus = {
      unassessed: 'coachUntested', possible: 'coachPossible', confirmed: 'coachConfirmed', verified: 'coachVerified', scheduled: 'coachScheduled'
    };
    const coachUrl = id => '#coach/' + id;

    function linkToCoach(id, label, extra = '') {
      return `<a class="button secondary ${extra}" href="${coachUrl(id)}">${label || text(skills[id].label)}</a>`;
    }

    function renderEvidence(question) {
      return question.evidenceQuote ? `<p><strong>${t('originalEvidence')}</strong> <q lang="en">${escapeHtml(question.evidenceQuote)}</q></p>` : '';
    }

    function renderClue(question, attempt, nextDay = []) {
      const focus = Coach.mistakeFocus(question, attempt);
      const targeted = question.purpose === 'lesson' || question.purpose === 'followup';
      const task = targeted && nextDay.find(item => item.focus === focus);
      const schedule = task ? `<p class="field-help">${lessonStatus(task)} · <a href="#plan/checks">${t('lessonOpen')}</a></p>` : '';
      if (question.fields) {
        if (!focus) return '';
        const { right, offset, coefficient } = question.equationStep;
        const prompt = focus === 'balance' ? t(offset < 0 ? 'stepAdd' : 'stepSubtract', {
          n: Math.abs(offset), expression: right + (offset < 0 ? ' + ' : ' − ') + Math.abs(offset)
        }) : t('stepDivide', { n: coefficient, expression: question.fields[0].expected + ' ÷ (' + coefficient + ')' });
        return `<div class="mistake-clue"><p><strong>${t('stepHint')}</strong> ${prompt}</p>${schedule}${linkToCoach(focus, t('coachJump'))}</div>`;
      }
      if (question.evidenceType && focus === 'text-evidence') {
        const hint = { person: 'cluePerson', place: 'cluePlace', time: 'clueTime', reason: 'clueReason', detail: 'clueDetail' };
        return `<div class="mistake-clue"><p><strong>${t('stepHint')}</strong> ${t(hint[question.evidenceType])}</p>${schedule}
          ${linkToCoach(focus, t('coachJump'))}</div>`;
      }
      if (!focus) return `<p class="field-help">${t('coachAmbiguous')}</p>`;
      const kind = Science.errorLabels[question.errorKinds?.[attempt.choice]];
      return `<div class="mistake-clue"><p>${kind ? t('scienceErrorClue', { kind: kind[language()] }) : t('coachSuggestion', { skill: skills[focus].label[language()] })}</p>
        ${linkToCoach(focus, t('coachJump'))}</div>`;
    }

    function renderCoach(state, catalog, focus) {
      const profile = Coach.assessment(state, catalog);
      if (!Object.hasOwn(skills, focus)) {
        return `${heading(t('coach'), t('coachIntro'))}<section class="panel study-panel"><p>${t('coachBasis')}</p>
          <ul class="study-skill-list">${Object.keys(skills).map(id => `<li><a href="${coachUrl(id)}">${text(skills[id].label)}</a>
            <span class="section-note">${subjectName(skills[id].subject)} · ${t(sectionStatus[profile[id].status])}</span></li>`).join('')}</ul></section>`;
      }
      const skill = skills[focus];
      const record = profile[focus];
      const trail = Coach.prerequisiteTrail(focus, profile);
      const modes = ['verified', 'scheduled'].includes(record.status) ? ['spaced', 'retake'] : record.status === 'confirmed' ? ['retake'] : ['probe', 'retake'];
      const ready = modes.filter(mode => (mode !== 'spaced' || (record.due && record.due <= Core.localDate(new Date())))
        && Coach.focusIds(state, focus, mode, undefined, record).length);
      return `${heading(text(skill.label), t('coachIntro'))}
        <div class="study-grid">
          <section class="panel study-panel" aria-labelledby="guide-title">
            <p class="eyebrow">${subjectName(skill.subject)} · ${t('coach')}</p>
            <h2 id="guide-title">${t('coachPrompt')}</h2><p>${text(skill.question)}</p>
            <details class="study-details"><summary>${t('coachHelp')}</summary><p>${text(skill.notice)}</p></details>
            <details class="study-details"><summary>${t('coachRule')}</summary><p>${text(skill.principle)}</p><p class="worked-example">${text(skill.example)}</p></details>
            ${skill.source ? `<p class="field-help"><a href="${escapeHtml(skill.source)}" target="_blank" rel="noopener noreferrer">${t('scienceSource')}</a></p>` : ''}
            ${trail.length ? `<h3>${t('coachTrace')}</h3><ol class="coach-trail">${trail.map(id => `<li>${linkToCoach(id)}</li>`).join('')}</ol>`
              : skill.prerequisites.length ? `<h3>${t('coachPrerequisites')}</h3><div class="study-actions">${skill.prerequisites.map(id => linkToCoach(id)).join('')}</div>` : ''}
          </section>
          <section class="panel study-panel" aria-labelledby="skill-check-title">
            <h2 id="skill-check-title">${t(sectionStatus[record.status])}</h2>
            ${record.lastCheck ? `<p>${t('coachCheckSummary', record.lastCheck)}</p>` : ''}
            ${record.due ? `<p class="section-note">${record.due <= Core.localDate(new Date()) ? t('coachDueNow') : t('coachDue', { date: formatDate(record.due) })}</p>` : ''}
            <div class="study-actions">${ready.map(mode => button(t(mode), 'focus-practice', mode === ready[0] ? '' : 'secondary', `data-mode="${mode}" data-focus="${focus}"`)).join('')}</div>
            ${ready.length ? '' : `<p>${t('coachEmpty')}</p>${button(t('coachBankFallback'), 'topic-practice', 'secondary', `data-subject="${skill.subject}" data-topic="${skill.topic}"`)}`}
          </section>
        </div>`;
    }

    function renderFocusResult(state, catalog, session) {
      if (!session.focus) return '';
      const checkQuestion = session.mode === 'spaced' && catalog.find(question => question.id === session.questionIds[0] && question.purpose === 'followup');
      if (checkQuestion) {
        const tasks = Coach.lessonChecks(state, catalog);
        const task = tasks.find(item => item.focus === session.focus);
        const answer = state.attempts.find(attempt => attempt.sessionId === session.id && attempt.questionId === checkQuestion.id);
        return `<section class="panel study-panel focus-result"><h2>${t('lessonCheck')}</h2>
          ${answer && !answer.correct ? renderClue(checkQuestion, answer, tasks) : ''}
          <p>${t(session.correct ? 'lessonPassed' : task?.id ? 'lessonRetry' : 'lessonUnavailable')}</p>
          <a href="#plan/checks">${t('lessonOpen')}</a></section>`;
      }
      const record = Coach.assessment(state, catalog, new Date(session.completedAt))[session.focus];
      return `<section class="panel study-panel focus-result"><h2>${text(skills[session.focus].label)}</h2>
        <p>${t(sectionStatus[record.status])}</p>${record.lastCheck ? `<p>${t('coachCheckSummary', record.lastCheck)}</p>` : ''}
        ${record.interval ? `<p>${t('coachDue', { date: formatDate(record.due) })}</p>` : ''}
        ${linkToCoach(session.focus, t('coachJump'))}</section>`;
    }
    const formatDate = date => new Date(date + 'T00:00:00').toLocaleDateString(locale(), { month: 'short', day: 'numeric' });
    const lessonStatus = task => !task.id ? t('lessonUnavailable') : task.ready ? t('lessonReady') : t('lessonStartsOn', { date: formatDate(task.due) });

    function renderLessonChecks(tasks) {
      if (!tasks.length) return '';
      return `<section class="panel study-panel" aria-labelledby="lesson-checks-title">
        <h2 id="lesson-checks-title" tabindex="-1">${t('lessonChecks')}</h2>
        <ul class="study-skill-list">${tasks.map(task => `<li data-lesson-focus="${task.focus}">
          <strong>${text(skills[task.focus].label)}</strong>
          <span class="section-note">${lessonStatus(task)}</span>
          ${task.ready ? button(t(task.resume ? 'resume' : 'lessonStart'), 'lesson-check', 'secondary', `data-focus="${task.focus}"`) : ''}
        </li>`).join('')}</ul></section>`;
    }

    function planTopicOptions(goal, value = '') {
      return [['', t('allTopics')], ...(topicsBySubject[goal] || []).map(id => [id, text(topics[id])])]
        .map(([id, label]) => `<option value="${id}" ${id === value ? 'selected' : ''}>${label}</option>`).join('');
    }

    function renderToday(plan, active, compact = false) {
      const tasks = plan.review.map(({ focus, mode, count }) => ({
        label: t('planReview', { topic: skills[focus].label[language()], n: count }),
        action: 'focus-practice', attrs: `data-focus="${focus}" data-mode="${mode}"`
      }));
      if (compact) {
        const check = plan.nextDay.find(task => task.ready);
        if (check) tasks.unshift({ label: t('lessonStartSkill', { skill: skills[check.focus].label[language()] }),
          action: 'lesson-check', attrs: `data-focus="${check.focus}"` });
      }
      if (plan.bankReview) tasks.push({ label: t('planBankReview', {
        subject: subjects.find(item => item.id === plan.bankReview.subject).label[language()], n: plan.bankReview.count
      }), action: 'plan-review' });
      if (plan.practice) tasks.push({ label: t('planStart', { topic: topics[plan.practice.topic][language()], n: plan.practice.count }),
        action: 'plan-practice' });
      if (active) tasks.unshift({ label: t('resume'), action: 'resume' });
      const [first, ...extra] = tasks;
      const renderTask = (task, style) => button(task.label, task.action, style, task.attrs);
      const done = Math.min(plan.target, plan.completed);
      const status = plan.completed >= plan.target ? 'planComplete' : 'planBudgetDone';
      return `<section class="today-plan ${compact ? 'today-compact' : 'panel study-panel'}" aria-labelledby="daily-plan-title">
        <div class="daily-top"><div><h2 id="daily-plan-title">${t('planTask')}</h2><p>${t('planDailyTime', plan.settings)}</p></div>
          <strong class="daily-count" aria-hidden="true">${done}<span>/${plan.target}</span></strong></div>
        <div class="daily-dots" role="progressbar" aria-label="${t('planTask')}" aria-valuemin="0" aria-valuemax="${plan.target}" aria-valuenow="${done}"
          aria-valuetext="${t('planProgress', { n: plan.completed, target: plan.target })}">
          ${Array.from({ length: plan.target }, (_, index) => `<span class="${index < done ? 'filled' : ''}" aria-hidden="true">${index < done ? '✓' : ''}</span>`).join('')}
        </div>
        ${first ? renderTask(first) : `<strong class="daily-done">${t(status)}</strong> <a class="button secondary" href="#practice">${t('planOther')}</a>`}
        ${compact ? '' : `
          ${extra.length ? `<details class="study-details"><summary>${t('planMoreTasks')}</summary><div class="study-actions">${extra.map(task => renderTask(task, 'secondary')).join('')}</div></details>` : ''}
          ${plan.placement && plan.slots && !active ? `<div class="study-actions">${button(t('planPlacement', {
            subject: subjects.find(item => item.id === plan.placement).label[language()]
          }), 'diagnostic', 'secondary', `data-subject="${plan.placement}"`)}</div>` : ''}
          ${plan.deadlineSoon ? `<p class="field-help">${t('planExamSoon')}</p>` : ''}
          ${plan.unavailableReview.length ? `<p class="field-help">${t('planNeedsVariants', { n: plan.unavailableReview.length })}</p>
            <div class="study-actions">${plan.unavailableReview.slice(0, 3).map(id => linkToCoach(id)).join('')}</div>` : ''}
        `}
      </section>`;
    }

    function renderRoadmap(state, catalog, preferredSubject) {
      const subject = Object.hasOwn(topicsBySubject, preferredSubject) ? preferredSubject : 'english';
      const rows = Coach.roadmap(state, catalog, subject);
      function branch(parent) {
        return `<ul class="roadmap-branch">${rows.filter(row => row.parent === parent).map(row => {
          const status = row.due ? 'due' : row.verified ? 'verified' : row.seen ? 'started' : 'new';
          return `<li><div class="roadmap-node"><span class="roadmap-dot ${status}" aria-hidden="true"></span>
            <div>${button(text(topics[row.id]), 'topic-practice', 'roadmap-topic', `data-subject="${subject}" data-topic="${row.id}"`)}
              <span class="roadmap-status">${row.seen ? t('roadmapPractised', { n: row.seen }) : t('coachUntested')}
                ${row.due ? ` · ${t('coachDueNow')}` : ''}
                ${row.verified ? ` · ${t('roadmapVerified', { n: row.verified })}` : ''}</span>
            </div>${row.guide ? linkToCoach(row.guide, t('roadmapGuide')) : ''}
          </div>${rows.some(item => item.parent === row.id) ? branch(row.id) : ''}</li>`;
        }).join('')}</ul>`;
      }
      return `<section class="panel study-panel roadmap" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title">${t('roadmap')}</h2><p>${t('roadmapIntro')}</p>
        <div class="filters" role="group" aria-label="${t('subjects')}">${subjects.filter(item => item.available).map(item =>
          `<button type="button" class="filter-button ${item.id === subject ? 'active' : ''}" aria-pressed="${item.id === subject}"
            data-action="roadmap-subject" data-subject="${item.id}">${text(item.label)}</button>`).join('')}</div>
        ${branch('')}
      </section>`;
    }

    function renderPlan(state, catalog, preferredSubject) {
      const plan = Coach.learningPlan(state, catalog);
      const settings = plan.settings;
      function reviews(list) {
        const focuses = [...new Set(list.map(item => item.focus).filter(Boolean))];
        const ids = [...new Set(list.map(item => item.topic).filter(Boolean))];
        return [...focuses.map(id => linkToCoach(id)), ...ids.map(id => text(topics[id]))].join(' · ');
      }
      return `${heading(t('plan'), t('planSubtitle'))}
        ${renderToday(plan, state.active)}
        ${renderLessonChecks(plan.nextDay)}
        <section class="panel study-panel"><h2>${t('evidenceLessons')}</h2><div class="study-actions">
          ${button(t('equationLesson'), 'lesson', 'secondary', 'data-subject="math"')}
          ${button(t('readingLesson'), 'lesson', 'secondary', 'data-subject="english"')}</div>
          <p class="field-help">${t('lessonReview')}</p></section>
        ${renderRoadmap(state, catalog, preferredSubject || settings.goal)}
        <section class="panel study-panel plan-preview">
          <details class="study-details plan-settings"><summary>${t('planSettings')}</summary>
            <form id="plan-form" class="plan-form">
              ${selectField('plan-goal', t('planGoal'), [['all', t('planAll')], ['balanced', t('planBalanced')], ...subjects.filter(item => item.available).map(item => [item.id, subjectName(item.id)])], settings.goal)}
              <label class="field"><span>${t('planTopic')}</span><select id="plan-topic">${planTopicOptions(settings.goal, settings.topic)}</select></label>
              <label class="field"><span>${t('planMinutes')}</span><input id="plan-minutes" type="number" min="5" max="90" required value="${settings.minutes}"></label>
              <label class="field"><span>${t('planDeadline')}</span><input id="plan-deadline" type="date" value="${escapeHtml(settings.deadline)}"></label>
              <button class="button" type="submit">${t('planSave')}</button>
            </form>
          </details>
          <details class="study-details"><summary>${t('planUpcoming')}</summary><ul class="study-skill-list">${plan.week.map(item => `<li><strong>${formatDate(item.date)}</strong>
            <span>${item.scheduled.length ? `${t('planScheduled')} · ${reviews(item.scheduled)}` : `${t('planProposed')} · ${text(topics[item.topic])}`}</span></li>`).join('')}</ul></details>
          <details class="study-details"><summary>${t('planMonth')}</summary><ul class="study-skill-list">${plan.weeks.map(item => `<li><strong>${formatDate(item.from)} – ${formatDate(item.to)}</strong>
            <span>${t('planProposed')} · ${text(topics[item.topic])}</span>${item.scheduled.length ? `<span>${t('planScheduled')} · ${reviews(item.scheduled)}</span>` : ''}</li>`).join('')}</ul></details>
          <a class="button secondary" href="#report">${t('report')}</a>
        </section>`;
    }

    function renderCharts(daily, weekly) {
      const periodLabel = day => day.date === day.end ? formatDate(day.date) : `${formatDate(day.date)} – ${formatDate(day.end)}`;
      const max = Math.max(1, ...daily.map(day => day.total));
      const x = index => daily.length > 1 ? 49 + index * 531 / (daily.length - 1) : 300;
      const y = accuracy => 108 - accuracy * .9;
      const accuracy = daily.map((day, index) => day.accuracy === null ? '' : `
        ${index && daily[index - 1].accuracy !== null ? `<line x1="${x(index - 1)}" y1="${y(daily[index - 1].accuracy)}" x2="${x(index)}" y2="${y(day.accuracy)}"/>` : ''}
        <circle cx="${x(index)}" cy="${y(day.accuracy)}" r="4"><title>${periodLabel(day)} · ${day.accuracy}%</title></circle>`).join('');
      const dates = `<div class="chart-dates" aria-hidden="true"><span>${formatDate(daily[0].date)}</span>${daily.length > 1 ? `<span>${formatDate(daily.at(-1).end)}</span>` : ''}</div>`;
      return `<section class="panel study-panel report-charts">
        <figure><figcaption>${t(weekly ? 'reportWeeklyActivity' : 'reportActivity')}</figcaption><div class="report-bars" aria-hidden="true">${daily.map(day => `<span title="${periodLabel(day)} · ${day.total}" style="--bar-height:${day.total * 100 / max}%"></span>`).join('')}</div>${dates}</figure>
        <figure><figcaption>${t(weekly ? 'reportWeeklyAccuracy' : 'reportAccuracy')}</figcaption><svg class="report-line" viewBox="0 0 600 126" preserveAspectRatio="none" aria-hidden="true">
          <path class="chart-grid" d="M49 18H580 M49 63H580 M49 108H580"/><text x="2" y="22">100%</text><text x="2" y="67">50%</text><text x="2" y="112">0%</text>${accuracy}</svg>${dates}</figure>
        <details class="study-details"><summary>${t('reportTable')}</summary><div class="report-table"><table>
          <thead><tr><th scope="col">${t('reportDate')}</th><th scope="col">${t('answered')}</th><th scope="col">${t('accuracy')}</th></tr></thead>
          <tbody>${daily.map(day => `<tr><th scope="row">${periodLabel(day)}</th><td>${day.total}</td><td>${day.accuracy === null ? '—' : day.accuracy + '%'}</td></tr>`).join('')}</tbody>
        </table></div></details>
      </section>`;
    }

    function renderReport(state, catalog, days) {
      const report = Coach.report(state, catalog, days);
      const mastery = Object.fromEntries(Science.subjects.map(subject => [subject, Learning.subjectProfile(state, subject)]));
      const { recent, previous } = report;
      const seconds = Math.round(recent.durationMs / 1000);
      const nextTopic = Object.entries(report.topics).filter(([, row]) => row.distinct >= 3).sort((a, b) => a[1].accuracy - b[1].accuracy)[0]?.[0];
      const summary = (label, value, note = '') => `<div><dt>${t(label)}</dt><dd>${value}</dd>${note ? `<dd class="field-help">${note}</dd>` : ''}</div>`;
      return `${heading(t('report'), t('reportIntro'))}
        <div class="filters report-filters" role="group" aria-label="${t('reportFilters')}">${[[1, 'reportToday'], [7, 'reportWeek'], [30, 'reportMonth'], [90, 'reportQuarter']].map(([n, key]) =>
          `<button type="button" class="filter-button ${days === n ? 'active' : ''}" aria-pressed="${days === n}" data-action="report-window" data-days="${n}">${t(key)}</button>`).join('')}</div>
        <section class="panel study-panel"><dl class="report-totals">
          ${summary('answered', recent.total)}
          ${summary('accuracy', recent.accuracy === null ? t('coachUntested') : recent.accuracy + '%')}
          ${summary('reportTime', recent.timed ? t('reportTimeValue', { n: Math.floor(seconds / 60), seconds: seconds % 60 }) : t('noData'),
            recent.total ? t('reportTimeCoverage', recent) : '')}</dl>
          <p class="field-help">${recent.total && previous.total ? t('reportDelta', { ...recent, previousCorrect: previous.correct, previousTotal: previous.total }) : t('reportNoComparison')}</p>
        </section>
        ${recent.total ? renderCharts(report.daily, days === 90) : ''}
        <section class="panel study-panel report-map"><h2>${t('reportMap')}</h2><p class="field-help">${t('reportSkillNote')}</p>
          <div class="study-grid">${Object.entries(topicsBySubject).map(([subject, ids]) => `<section><h3>${subjectName(subject)}</h3><ul class="study-skill-list">${ids.map(id => {
            const row = report.topics[id];
            const science = Science.topics[id];
            const verified = mastery[subject]?.[id]?.retained;
            return `<li>${science ? `<span class="section-note">${text(science.domainLabel)}</span>` : ''}<strong>${text(topics[id])}</strong><span class="field-help">${row.total ? t('reportEvidence', { ...row, n: row.distinct }) : t('coachUntested')}</span>
              ${science && (row.total || verified) ? `<span class="section-note">${verified ? t('scienceRetained', { level: verified }) : t('scienceUnverified')}</span>` : ''}
              ${row.total && row.distinct < 3 ? `<span class="section-note">${t('reportSparse')}</span>` : ''}</li>`;
          }).join('')}</ul></section>`).join('')}</div>
        </section>
        <div class="study-grid report-recommendations"><section class="panel study-panel"><h2>${t('reportMistakes')}</h2>
          ${report.errors.length ? `<ul class="study-skill-list">${report.errors.map(row => `<li><a href="${coachUrl(row.focus)}">${text(skills[row.focus].label)}</a>
            <span class="field-help">${t('reportMistakeCount', row)}</span>
            ${row.kinds.length ? `<span class="field-help">${row.kinds.map(([kind, n]) => t('reportMistakeKind', { kind: Science.errorLabels[kind][language()], n })).join(' / ')}</span>` : ''}</li>`).join('')}</ul>` : `<p>${t('reportNoMistakes')}</p>`}
        </section><section class="panel study-panel"><h2>${t('reportNext')}</h2><div class="study-actions">
          ${report.errors.length ? linkToCoach(report.errors[0].focus, t('coachJump')) : nextTopic ? button(t('reportNextTopic', { topic: topics[nextTopic][language()] }), 'topic-practice', 'secondary',
            `data-subject="${Object.keys(topicsBySubject).find(subject => topicsBySubject[subject].includes(nextTopic))}" data-topic="${nextTopic}"`) : ''}
          <a class="button secondary" href="#plan">${t('plan')}</a></div></section></div>`;
    }

    function renderQuestionReport(question, flag) {
      return `<details class="study-details question-report" ${flag ? 'open' : ''}><summary>${t('flagQuestion')}</summary>
        <div class="study-actions"><label class="field"><span>${t('flagReason')}</span><select data-flag-reason>${Core.flagReasons.map(reason =>
          `<option value="${reason}" ${flag?.reason === reason ? 'selected' : ''}>${t(reason)}</option>`).join('')}</select></label>
          ${button(t('flagQuestion'), 'flag-question', 'secondary', `data-id="${escapeHtml(question.id)}"`)}</div>
        ${flag ? `<p role="status">${t('flagSaved')}</p>` : ''}</details>`;
    }

    function renderBackup(status, flags) {
      return `<details class="panel backup-panel" ${status ? 'open' : ''}><summary>${t('backups')}</summary><p>${t('backupHelp')}</p>
        <div class="study-actions">${button(t('backupExport'), 'backup-export', 'secondary')}${flags.length ? button(t('flagExport'), 'flag-export', 'secondary') : ''}</div>
        <form id="backup-form"><label class="field"><span>${t('backupFile')}</span><input type="file" accept=".json,application/json" id="backup-file" required></label>
          <button class="button secondary" type="submit">${t('backupImport')}</button></form>
        ${status ? `<p id="backup-status" role="status" tabindex="-1">${t(status.key, status)}</p>` : ''}
      </details>`;
    }

    return { renderEvidence, renderClue, renderCoach, renderFocusResult, renderToday, renderPlan, renderReport, renderBackup, renderQuestionReport, planTopicOptions };
  }
  globalThis.EachVeyaStudyUI = { copy, create };
})();
