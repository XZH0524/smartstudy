(function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const Learning = globalThis.SmartStudyLearning;
  const { skills } = globalThis.EachVeyaSkills;
  const Science = globalThis.EachVeyaScience;
  const { questions, topicsBySubject, levels } = globalThis.SmartStudyData;
  const questionsById = new Map(questions.map(question => [question.id, question]));
  const intervals = [1, 3, 7, 14, 30];
  const defaultPlan = Object.freeze({ enabled: true, goal: 'all', topic: '', minutes: 8, deadline: '' });
  const reportWindows = [1, 7, 30, 90];
  const roadmapParents = {
    reading: 'vocabulary',
    algebra: 'arithmetic', functions: 'algebra', geometry: 'arithmetic', statistics: 'arithmetic',
    'forces-motion': 'average-speed',
    'equation-models': 'atomic-structure', 'mole-calculations': 'atomic-structure',
    'amount-concentration': 'mole-calculations', 'acid-base-models': 'amount-concentration',
    'natural-selection': 'trait-frequency'
  };

  function dayAt(date, offset = 0) {
    return Core.localDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset));
  }

  function assessment(state, catalog, now = new Date()) {
    const byId = new Map(catalog.map(question => [question.id, question]));
    const entries = Object.fromEntries(Object.keys(skills).map(focus => [focus, {
      status: 'unassessed', due: '', interval: 0, seen: 0, pendingSince: '', lastQuestion: '', lastCheck: null
    }]));
    const attempts = Core.reportableAttempts(state).filter(attempt => Date.parse(attempt.at) <= now.getTime());
    const firstAttempts = new Set();
    const readPassages = new Set();
    const checks = new Map();
    const scienceIndependent = new Map();
    const lessonContexts = new Map();
    const events = attempts.map(attempt => ({ time: Date.parse(attempt.at), attempt }));
    for (const session of state.sessions.filter(session => session.focus && Core.focusModes.includes(session.mode))) {
      const time = Date.parse(session.completedAt);
      if (time <= now.getTime()) events.push({ time, session });
    }
    events.sort((a, b) => a.time - b.time);

    for (const { time, attempt, session } of events) {
      const date = new Date(time);
      const day = dayAt(date);
      if (attempt) {
        const question = byId.get(attempt.questionId);
        if (!question || question.retired || question.purpose === 'followup') continue;
        const fresh = !firstAttempts.has(question.id);
        firstAttempts.add(question.id);
        const passage = Core.readingPassage(question);
        const freshPassage = !passage || !readPassages.has(passage);
        if (passage) readPassages.add(passage);
        const marks = attempt.focus ? [attempt.focus] : question.focus || [];
        if (fresh) for (const focus of marks) entries[focus].seen++;
        const likely = mistakeFocus(question, attempt);
        if (fresh && freshPassage && question.purpose === 'lesson' && attempt.mode === 'practice' && attempt.correct && attempt.hinted === false) {
          for (const focus of marks) {
            const contexts = lessonContexts.get(focus) || new Set();
            contexts.add(question.lessonGroup);
            lessonContexts.set(focus, contexts);
            const entry = entries[focus];
            entry.lessonLevel = question.level;
            if (contexts.size >= 2 && entry.status === 'unassessed') {
              entry.status = 'scheduled';
              entry.due = dayAt(date, 1);
              entry.interval = 1;
            }
          }
        }
        if (!attempt.correct && likely && (!attempt.focus || attempt.focus === likely) && !Core.focusModes.includes(attempt.mode)) {
          const entry = entries[likely];
          if (Core.schedulesLessonCheck(question)) {
            if (entry.status === 'unassessed') entry.status = 'possible';
            continue;
          }
          if (entry.status !== 'confirmed') entry.status = 'possible';
          entry.due = day;
          entry.interval = 0;
          entry.pendingSince ||= day;
          entry.lastQuestion = question.id;
          if (Science.topics[likely]) {
            entry.level = question.level;
            entry.error = question.errorKinds?.[attempt.choice] || '';
          }
        }
        if (fresh && question.domain && question.role === 'practice' && ['practice', 'science-ai'].includes(attempt.mode) && attempt.correct && attempt.hinted === false) {
          const key = question.topic + '/' + question.level;
          const count = (scienceIndependent.get(key) || 0) + 1;
          scienceIndependent.set(key, count);
          const entry = entries[question.topic];
          if (count === 4 && (!entry.due || (['verified', 'scheduled'].includes(entry.status) && entry.level !== question.level))) {
            entry.status = 'scheduled';
            entry.interval = 1;
            entry.due = dayAt(date, 1);
            entry.level = question.level;
          }
        }
        if (attempt.focus) {
          const rows = checks.get(attempt.sessionId) || [];
          rows.push({ fresh, correct: attempt.correct, independent: attempt.hinted === false, likely,
            error: question.errorKinds?.[attempt.choice] || likely, level: question.level });
          checks.set(attempt.sessionId, rows);
        }
        continue;
      }

      const entry = entries[session.focus];
      const rows = checks.get(session.id) || [];
      if (rows.length !== session.questionIds.length) continue;
      const independent = rows.filter(row => row.fresh && row.independent && row.correct).length;
      const signals = rows.filter(row => row.fresh && !row.correct && row.likely === session.focus).map(row => row.error);
      const repeatedSignal = Math.max(0, ...signals.map(kind => signals.filter(signal => signal === kind).length));
      const wrong = rows.filter(row => !row.correct).length;
      const verified = independent === rows.length && (session.mode === 'spaced' ? rows.length >= 1 : rows.length >= 2);
      entry.lastCheck = { day, answered: rows.length, independent, repeatedSignal, verified, mode: session.mode };
      if (Science.topics[session.focus]) entry.level = rows[0].level;
      if (verified) {
        if (!entry.due || entry.due <= day || entry.interval === 0) {
          const index = intervals.indexOf(entry.interval);
          entry.interval = intervals[Math.min(intervals.length - 1, index + 1)];
          entry.due = dayAt(date, entry.interval);
        }
        entry.status = 'verified';
        entry.pendingSince = '';
      } else if (wrong) {
        entry.status = repeatedSignal >= 2 || entry.status === 'confirmed' ? 'confirmed' : 'possible';
        entry.due = day;
        entry.interval = 0;
        entry.pendingSince ||= day;
      }
    }
    return entries;
  }

  function focusIds(state, focus, mode, count = mode === 'spaced' ? 1 : 2, record) {
    if (!Object.hasOwn(skills, focus) || !Core.focusModes.includes(mode)) return [];
    const used = new Set(state.attempts.map(attempt => attempt.questionId));
    if (mode === 'spaced' && record?.lessonLevel) {
      const usedPassages = new Set(state.attempts.map(attempt => Core.readingPassage(questionsById.get(attempt.questionId))).filter(Boolean));
      const reserved = questions.filter(q => !q.retired && q.purpose === 'transfer' && q.level === record.lessonLevel && q.focus.includes(focus)
        && !used.has(q.id) && !usedPassages.has(Core.readingPassage(q)));
      if (reserved.length >= count) return reserved.slice(0, count).map(q => q.id);
      if (!Science.topics[focus]) return [];
    }
    if (Science.topics[focus]) {
      const topic = Science.topics[focus];
      const level = record?.level || record?.lessonLevel || Learning.subjectProfile(state, topic.subject)[focus].level;
      const role = mode === 'probe' ? 'probe' : 'transfer';
      const options = questions.filter(question => !question.retired && question.topic === focus && question.level === level
        && question.role === role && !used.has(question.id));
      const error = record?.error;
      const related = error && role === 'probe' ? options.filter(question => Object.values(question.errorKinds).includes(error)) : [];
      const selected = (related.length >= count ? related : options).slice(0, count);
      return selected.length === count ? selected.map(question => question.id) : [];
    }
    if (mode === 'retake' && record?.lessonLevel) {
      const chosen = [];
      for (const q of questions) {
        if (q.retired || q.purpose !== 'lesson' || q.level !== record.lessonLevel || !q.focus.includes(focus) || used.has(q.id)) continue;
        if (!chosen.some(other => other.lessonGroup === q.lessonGroup)) chosen.push(q);
        if (chosen.length === count) return chosen.map(item => item.id);
      }
      return [];
    }
    const options = questions.filter(question => !question.retired && question.variant && question.focus.includes(focus) && !used.has(question.id));
    const selected = [];
    if (mode === 'probe') {
      const step = options.find(question => question.variant === 'step');
      if (step) selected.push(step);
    }
    for (const question of options) {
      if (selected.length >= count) break;
      if (question.variant === 'apply' && !selected.some(item => item.variantGroup === question.variantGroup)) selected.push(question);
    }
    return selected.length === count ? selected.map(question => question.id) : [];
  }

  const mistakeFocus = Core.mistakeFocus;

  function lessonHistory(state, byId, now) {
    const pending = new Map();
    const used = new Set();
    const read = new Set();
    const results = [];
    const completed = new Map(state.sessions.map(session => [session.id, session.completedAt]));
    const attempts = Core.reportableAttempts(state).map(attempt => {
      const question = byId.get(attempt.questionId);
      const check = question?.purpose === 'followup' && attempt.mode === 'spaced';
      const submitted = Date.parse(attempt.at);
      const time = check ? Math.max(submitted, Date.parse(completed.get(attempt.sessionId))) : submitted;
      return { attempt, question, check, submitted, time };
    }).filter(item => item.time <= now.getTime()).sort((a, b) => a.time - b.time);
    function schedule(focus, question, date) {
      if (!pending.has(focus)) pending.set(focus, { focus, source: question, due: dayAt(date, 1) });
    }
    for (const { attempt, question, check, submitted, time } of attempts) {
      const date = new Date(time);
      const passage = Core.readingPassage(question);
      const fresh = !used.has(attempt.questionId) && (!passage || !read.has(passage));
      used.add(attempt.questionId);
      if (passage) read.add(passage);
      if (Core.schedulesLessonCheck(question) && !question.retired && !attempt.correct) {
        const focus = mistakeFocus(question, attempt);
        if (focus) schedule(focus, question, date);
      } else if (check && fresh) {
        const task = pending.get(attempt.focus);
        if (!task || task.due > dayAt(new Date(submitted)) || question.level !== task.source.level
          || question.subject !== task.source.subject || question.lessonGroup === task.source.lessonGroup
          || !question.focus.includes(attempt.focus)) continue;
        const independent = attempt.correct && attempt.hinted === false;
        results.push({ focus: attempt.focus, date: dayAt(date), independent });
        pending.delete(attempt.focus);
        if (!independent) {
          schedule(attempt.focus, question, date);
          const step = mistakeFocus(question, attempt);
          if (step && step !== attempt.focus) schedule(step, question, date);
        }
      }
    }
    return { pending, used, read, results };
  }

  function lessonChecks(state, catalog, now = new Date()) {
    const byId = new Map(catalog.map(question => [question.id, question]));
    const { pending, used, read } = lessonHistory(state, byId, now);
    const today = dayAt(now);
    // A submitted but unfinished check may be resumed. Its question cannot be assigned to a second skill.
    for (const attempt of state.attempts) {
      if (Date.parse(attempt.at) > now.getTime()) continue;
      used.add(attempt.questionId);
      const passage = Core.readingPassage(byId.get(attempt.questionId));
      if (passage) read.add(passage);
    }
    const active = state.active;
    const activeQuestion = active?.mode === 'spaced' ? byId.get(active.questionIds[0]) : null;
    if (activeQuestion?.purpose === 'followup') used.add(activeQuestion.id);
    return [...pending.values()].sort((a, b) => a.due.localeCompare(b.due)).map(({ focus, due, source }) => {
      const resume = activeQuestion?.purpose === 'followup' && active.focus === focus;
      const candidates = catalog.filter(q => !q.retired && q.purpose === 'followup' && q.level === source.level
        && q.subject === source.subject && q.focus.includes(focus) && !used.has(q.id) && !read.has(Core.readingPassage(q))
        && (!source.lessonGroup || q.lessonGroup !== source.lessonGroup));
      const matches = candidates.filter(q => source.stepMethod ? q.stepMethod === source.stepMethod
        : source.evidenceType ? q.evidenceType === source.evidenceType
        : source.equationStep && q.equationStep && Math.sign(q.equationStep.offset) === Math.sign(source.equationStep.offset));
      const changedPresentation = matches.find(q => q.equationPresentation && q.equationPresentation !== source.equationPresentation);
      const id = resume ? activeQuestion.id : (changedPresentation || matches[0] || candidates[0])?.id;
      if (id && due <= today) used.add(id);
      return { focus, due, id, ready: Boolean(id && due <= today), resume };
    });
  }

  function prerequisiteTrail(focus, profile) {
    const visited = new Set([focus]);
    const trail = [];
    function visit(id) {
      for (const previous of skills[id]?.prerequisites || []) {
        if (visited.has(previous)) continue;
        visited.add(previous);
        visit(previous);
        if (['possible', 'confirmed'].includes(profile[previous]?.status)) trail.push(previous);
      }
    }
    visit(focus);
    return trail;
  }

  function questionReviews(attempts, byId) {
    const reviews = new Map();
    for (const attempt of [...attempts].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
      const question = byId.get(attempt.questionId);
      if (!question || question.retired || question.diagnosticOnly || question.focusOnly || Core.hasDelayedFeedback(attempt.mode)) continue;
      const date = new Date(attempt.at);
      const day = dayAt(date);
      const previous = reviews.get(question.id);
      if (!attempt.correct) {
        if (mistakeFocus(question, attempt)) reviews.delete(question.id);
        else reviews.set(question.id, { question, date: day, interval: 0 });
      } else if (previous && previous.date <= day) {
        const independent = attempt.hinted === false;
        const interval = independent
          ? intervals[Math.min(intervals.length - 1, intervals.indexOf(previous.interval) + 1)]
          : previous.interval;
        reviews.set(question.id, { question, date: dayAt(date, independent ? interval : 1), interval });
      }
    }
    return [...reviews.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function roadmap(state, catalog, subject, now = new Date()) {
    const ids = topicsBySubject[subject] || [];
    const byId = new Map(catalog.filter(question => question.subject === subject).map(question => [question.id, question]));
    const attempts = Core.reportableAttempts(state).filter(attempt => Date.parse(attempt.at) <= now.getTime());
    const profile = assessment(state, catalog, now);
    const today = dayAt(now);
    const reviewedTopics = new Set(questionReviews(attempts, byId).filter(item => item.date <= today).map(item => item.question.topic));
    return ids.map(id => {
      const supported = Object.keys(skills).filter(focus => skills[focus].topic === id);
      const pending = supported.find(focus => ['possible', 'confirmed'].includes(profile[focus].status));
      return {
        id, parent: ids.includes(roadmapParents[id]) ? roadmapParents[id] : '',
        seen: new Set(attempts.filter(attempt => byId.get(attempt.questionId)?.topic === id).map(attempt => attempt.questionId)).size,
        verified: supported.filter(focus => profile[focus].status === 'verified').length,
        due: reviewedTopics.has(id) || supported.some(focus => profile[focus].due && profile[focus].due <= today),
        guide: pending || supported[0]
      };
    });
  }

  function dueSkills(profile, now = new Date(), limit = Infinity) {
    const day = dayAt(now);
    return Object.entries(profile).filter(([, value]) => value.due && value.due <= day)
      .sort((a, b) => a[1].due.localeCompare(b[1].due) || Number(b[1].status === 'confirmed') - Number(a[1].status === 'confirmed'))
      .slice(0, limit).map(([id]) => id);
  }

  function counts(attempts) {
    const correct = attempts.filter(attempt => attempt.correct).length;
    const timed = attempts.filter(attempt => Number.isInteger(attempt.durationMs) && attempt.durationMs > 0);
    return {
      total: attempts.length, correct, accuracy: attempts.length ? Math.round(100 * correct / attempts.length) : null,
      distinct: new Set(attempts.map(attempt => attempt.questionId)).size,
      timed: timed.length, durationMs: timed.reduce((sum, attempt) => sum + attempt.durationMs, 0)
    };
  }

  function report(state, catalog, days, now = new Date()) {
    const length = reportWindows.includes(days) ? days : 7;
    const today = dayAt(now);
    const start = dayAt(now, 1 - length);
    const previousStart = dayAt(now, 1 - 2 * length);
    const byId = new Map(catalog.map(question => [question.id, question]));
    const recent = [], previous = [];
    const known = Core.reportableAttempts(state).filter(attempt => Date.parse(attempt.at) <= now.getTime());
    const byDay = new Map();
    const topicRows = Object.fromEntries(Object.values(topicsBySubject).flat().map(topic => [topic, []]));
    const errors = new Map();
    for (const attempt of known) {
      const day = dayAt(new Date(attempt.at));
      if (day < previousStart || day > today) continue;
      if (day < start) { previous.push(attempt); continue; }
      recent.push(attempt);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(attempt);
      const question = byId.get(attempt.questionId);
      if (!question) continue;
      topicRows[question.topic]?.push(attempt);
      const focus = mistakeFocus(question, attempt);
      if (focus) {
        const entry = errors.get(focus) || { focus, attempts: 0, questions: new Set(), kinds: new Map() };
        entry.attempts++;
        entry.questions.add(question.id);
        const kind = question.errorKinds?.[attempt.choice];
        if (kind) entry.kinds.set(kind, (entry.kinds.get(kind) || 0) + 1);
        errors.set(focus, entry);
      }
    }
    const topics = Object.fromEntries(Object.entries(topicRows).map(([topic, attempts]) => [topic, counts(attempts)]));
    topics.reading.passages = new Set(topicRows.reading.map(attempt => Core.readingPassage(byId.get(attempt.questionId)))).size;
    const daily = [];
    const step = length > 30 ? 7 : 1;
    for (let offset = 1 - length; offset <= 0; offset += step) {
      const date = dayAt(now, offset);
      const end = Math.min(0, offset + step - 1);
      const period = [];
      for (let day = offset; day <= end; day++) period.push(...(byDay.get(dayAt(now, day)) || []));
      daily.push({ date, end: dayAt(now, end), ...counts(period) });
    }
    const checks = new Map();
    for (const { focus, date, independent } of lessonHistory(state, byId, now).results) {
      if (date < start) continue;
      const row = checks.get(focus) || { focus, total: 0, independent: 0 };
      checks.set(focus, { ...row, last: date, total: row.total + 1, independent: row.independent + Number(independent) });
    }
    return {
      recent: counts(recent), previous: counts(previous), topics, daily, checks: [...checks.values()].sort((a, b) => b.last.localeCompare(a.last)),
      errors: [...errors.values()].map(({ focus, attempts, questions, kinds }) => ({ focus, attempts,
        distinct: questions.size, kinds: [...kinds].sort((a, b) => b[1] - a[1]) }))
        .sort((a, b) => b.distinct - a.distinct || b.attempts - a.attempts)
    };
  }

  function learningPlan(state, catalog, now = new Date()) {
    const settings = state.plan || defaultPlan;
    const today = dayAt(now);
    const profile = assessment(state, catalog, now);
    const subjects = settings.goal === 'all' ? ['math', 'english', ...Science.subjects]
      : settings.goal === 'balanced' ? ['math', 'english'] : [settings.goal];
    const matchesFocus = id => subjects.includes(skills[id].subject)
      && (!settings.topic || settings.topic === skills[id].topic);
    const nextDay = lessonChecks(state, catalog, now);
    const lessonFocuses = new Set(nextDay.filter(task => task.id).map(task => task.focus));
    const due = dueSkills(profile, now).filter(focus => matchesFocus(focus) && !lessonFocuses.has(focus));
    const prerequisites = new Set(due.flatMap(focus => prerequisiteTrail(focus, profile)));
    due.sort((a, b) => Number(prerequisites.has(b)) - Number(prerequisites.has(a)));
    const attempts = Core.reportableAttempts(state).filter(attempt => Date.parse(attempt.at) <= now.getTime());
    const timed = attempts.filter(attempt => dayAt(new Date(attempt.at)) < today && attempt.durationMs).slice(-30)
      .map(attempt => attempt.durationMs / 1000).sort((a, b) => a - b);
    const pace = timed.length >= 5 ? Math.max(45, Math.min(240, timed[Math.floor(timed.length / 2)])) : 90;
    const completed = attempts.filter(attempt => dayAt(new Date(attempt.at)) === today);
    const usedSeconds = completed.reduce((total, attempt) => total + (attempt.durationMs ? attempt.durationMs / 1000 : pace), 0);
    const target = Math.max(1, Math.min(12, Math.floor(settings.minutes * 60 / pace)));
    const slots = Math.max(0, Math.min(target - completed.length, Math.floor((settings.minutes * 60 - usedSeconds) / pace)));
    const dueTasks = due.map(focus => {
      const mode = ['verified', 'scheduled'].includes(profile[focus].status) ? 'spaced' : profile[focus].status === 'confirmed' ? 'retake' : 'probe';
      const count = mode === 'spaced' ? 1 : 2;
      return { focus, mode, count, ready: focusIds(state, focus, mode, count, profile[focus]).length === count };
    });
    const review = [];
    const todayChecks = nextDay.filter(task => task.ready && !task.resume && matchesFocus(task.focus)).slice(0, slots);
    let remaining = slots - todayChecks.length;
    for (const { focus, mode, count, ready } of dueTasks) {
      if (review.length >= 2 || remaining < 1) break;
      if (remaining < count || !ready) continue;
      review.push({ focus, mode, count });
      remaining -= count;
    }
    const priorities = new Set(Object.keys(skills).filter(id => matchesFocus(id) && profile[id].status === 'confirmed').map(id => skills[id].topic));
    const evidence = report(state, catalog, 7, now);
    const byId = new Map(catalog.map(question => [question.id, question]));
    const bankReviews = questionReviews(attempts, byId).filter(({ question }) => subjects.includes(question.subject)
      && (!settings.topic || settings.topic === question.topic));
    const dueBank = bankReviews.filter(item => item.date <= today);
    const bankSubject = dueBank[0]?.question.subject;
    const bankIds = dueBank.filter(item => item.question.subject === bankSubject)
      .slice(0, Math.min(remaining, 3)).map(item => item.question.id);
    const bankReview = bankIds.length ? { subject: bankSubject, ids: bankIds, count: bankIds.length, mode: 'review' } : null;
    remaining -= bankIds.length;
    const lastByTopic = new Map();
    const practisedSubjects = new Set();
    for (const attempt of attempts) {
      const question = byId.get(attempt.questionId);
      if (!question) continue;
      lastByTopic.set(question.topic, Date.parse(attempt.at));
      practisedSubjects.add(question.subject);
    }
    const choices = subjects.flatMap(subject => topicsBySubject[subject].filter(topic => !settings.topic || topic === settings.topic)
      .map(topic => ({ subject, topic, practice: evidence.topics[topic].passages ?? evidence.topics[topic].distinct, priority: priorities.has(topic) ? 0 : 1,
        last: lastByTopic.get(topic) ?? -Infinity })))
      .sort((a, b) => a.priority - b.priority || a.practice - b.practice || a.last - b.last);
    const next = choices[0];
    const deadlineSoon = settings.deadline && settings.deadline >= today && settings.deadline <= dayAt(now, 6);
    const practiceCount = next && remaining > 0 ? Math.min(remaining, deadlineSoon ? 4 : 6) : 0;
    const placement = next && !deadlineSoon && !Learning.latestPlacement(state, next.subject)
      && !practisedSubjects.has(next.subject) && (next.subject !== 'math' || !state.preferences.mathPlacementDeferred)
      ? next.subject : '';
    const practice = practiceCount ? {
      subject: next.subject, topic: next.topic, count: practiceCount, level: next.subject === 'english' ? state.preferences.englishLevel || 'auto' : 'auto'
    } : null;
    const upcoming = Object.entries(profile).filter(([id, value]) => matchesFocus(id) && !lessonFocuses.has(id) && value.due > today && value.due <= dayAt(now, 29))
      .map(([focus, value]) => ({ focus, date: value.due }))
      .concat(nextDay.filter(task => task.id && matchesFocus(task.focus) && task.due > today && task.due <= dayAt(now, 29))
        .map(({ focus, due: date }) => ({ focus, date })))
      .concat(bankReviews.filter(item => item.date > today && item.date <= dayAt(now, 29))
        .map(item => ({ topic: item.question.topic, date: item.date })))
      .sort((a, b) => a.date.localeCompare(b.date));
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = dayAt(now, index);
      return { date, topic: choices[index % choices.length]?.topic, scheduled: upcoming.filter(item => item.date === date) };
    });
    const weeks = [[0, 6], [7, 13], [14, 20], [21, 27], [28, 29]].map(([from, to], index) => ({
      from: dayAt(now, from), to: dayAt(now, to), topic: choices[index % choices.length]?.topic,
      scheduled: upcoming.filter(item => item.date >= dayAt(now, from) && item.date <= dayAt(now, to))
    }));
    return { settings, target, completed: completed.length, review, bankReview, practice, placement, week, weeks, dueCount: due.length, nextDay, todayChecks,
      unavailableReview: dueTasks.filter(task => !task.ready).map(task => task.focus), slots, usedSeconds, pace, deadlineSoon };
  }

  globalThis.EachVeyaCoach = { assessment, focusIds, mistakeFocus, lessonChecks, dueSkills, report, reportWindows, learningPlan, roadmap, prerequisiteTrail, intervals };
})();
