(function () {
  'use strict';
  const VERSION = 10;
  const AI = globalThis.EachVeyaAi;
  const { levels: { english: englishLevels }, topicsBySubject } = globalThis.SmartStudyData;
  const SkillData = globalThis.EachVeyaSkills;
  const dateIsValid = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const unique = values => [...new Set(values)];
  const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const focusModes = ['probe', 'retake', 'spaced'];
  const flagReasons = ['wording', 'answer', 'translation'];
  const hasDelayedFeedback = mode => mode === 'diagnostic' || mode === 'pilot' || focusModes.includes(mode);
  const sessionMode = value => ['review', 'diagnostic', 'pilot', 'ai', 'science-ai', 'algebra-sample', ...focusModes].includes(value) ? value : 'practice';
  const isValidDuration = value => Number.isInteger(value) && value > 0 && value <= 600_000;

  function focusFor(value, mode, subject) {
    return focusModes.includes(mode) && Object.hasOwn(SkillData.skills, value) && SkillData.skills[value].subject === subject ? value : null;
  }

  function planDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
    const date = new Date(value + 'T00:00:00');
    return Number.isFinite(date.getTime()) && localDate(date) === value ? value : '';
  }

  function planTaskKey(value) {
    if (typeof value !== 'string') return false;
    const [kind, id, extra] = value.split(':');
    if (extra !== undefined) return false;
    if (kind === 'check' || kind === 'skill') return Object.hasOwn(SkillData.skills, id);
    if (kind === 'bank') return Object.hasOwn(topicsBySubject, id);
    return kind === 'practice' && Object.values(topicsBySubject).some(topics => topics.includes(id));
  }

  function normalizePlan(value) {
    if (!value || value.enabled !== true) return null;
    const goal = value.goal === 'all' || Object.hasOwn(topicsBySubject, value.goal) ? value.goal : 'balanced';
    const minutes = Number(value.minutes);
    const deferred = Object.fromEntries(Object.entries(typeof value.deferred === 'object' && value.deferred || {}).slice(0, 100)
      .filter(([key, date]) => planTaskKey(key) && planDate(date)));
    return {
      enabled: true, goal, topic: topicsBySubject[goal]?.includes(value.topic) ? value.topic : '',
      minutes: Number.isInteger(minutes) && minutes >= 5 && minutes <= 90 ? minutes : 15,
      deadline: planDate(value.deadline), ...(Object.keys(deferred).length ? { deferred } : {})
    };
  }

  function normalizePreferences(value) {
    const target = typeof value?.ieltsTarget === 'string' ? Number(value.ieltsTarget) : 0;
    return {
      englishLevel: englishLevels.includes(value?.englishLevel) ? value.englishLevel : null,
      mathPlacementDeferred: value?.mathPlacementDeferred === true,
      ieltsTarget: target >= 1 && target <= 9 && Number.isInteger(target * 2) ? target.toFixed(1) : ''
    };
  }

  function createState() {
    return { version: VERSION, language: 'zh', preferences: normalizePreferences(), attempts: [], sessions: [], active: null, generated: [], plan: null, flags: [] };
  }

  function questionsForState(questions, state) {
    return state.generated?.length
      ? [...questions, ...state.generated.map(spec => SkillData.decorateEquation(AI.makeQuestion(spec), spec))] : questions;
  }

  const responseOf = attempt => attempt.response ?? attempt.choice;
  const readingPassage = question => question?.subject === 'english' && question.topic === 'reading'
    ? question.passageId || question.originalId || question.id : '';
  function equationStructure(question) {
    const step = question?.equationStep;
    return question?.subject === 'math' && question.level === 'L2' && question.format === 'calculation'
      && step && !step.grouped && step.offset !== 0 && Math.abs(step.coefficient) > 1
      ? question.equationPresentation || 'standard' : '';
  }

  function equationKey(question) {
    if (!equationStructure(question)) return '';
    const { coefficient, offset, right } = question.equationStep;
    const sign = Math.sign(coefficient);
    return [coefficient * sign, offset * sign, right * sign].join('/');
  }

  const schedulesLessonCheck = question => question?.purpose === 'lesson' || question?.readingEvidence === true
    || (Boolean(equationStructure(question)) && question.purpose !== 'followup' && question.purpose !== 'transfer' && !question.sample);

  function textAnswer(value) {
    return value.normalize('NFKC').trim().toLowerCase()
      .replace(/[‘’ʼ]/g, "'").replace(/[‐‑]/g, '-').replace(/\s+/gu, ' ')
      .replace(/[.!?,;:。！？、；：]+$/u, '').trim()
      .replace(/^"(.*)"$|^“(.*)”$|^'(.*)'$/u, '$1$2$3')
      .replace(/[.!?,;:。！？、；：]+$/u, '').trim();
  }

  function fieldInputLimit(field) {
    if (field.type !== 'text') return 40;
    return [field.expected, ...(field.accepted || [])].some(answer => /\s/u.test(answer.trim())) ? 96 : 64;
  }

  function evaluateField(field, input) {
    if (field.type === 'text') {
      if (typeof input !== 'string' || input.length > fieldInputLimit(field)) return null;
      const value = textAnswer(input);
      // Keep previously accepted English-shaped wrong answers valid as recorded attempts.
      if (!/^[a-z][a-z '\-]*$/u.test(value)) return null;
      const correct = [field.expected, ...(field.accepted || [])].some(answer => textAnswer(answer) === value);
      return { text: input.trim(), correct };
    }
    const value = AI.parseNumber(input);
    const expected = AI.parseNumber(String(field.expected));
    if (!value || !expected) return null;
    return { text: value.text, correct: value.numerator * expected.denominator === expected.numerator * value.denominator };
  }

  function evaluateAnswer(question, response) {
    if (!question) return null;
    if (!question.fields) {
      return Number.isInteger(response) && response >= 0 && response < question.options.length
        ? { choice: response, correct: response === question.answer } : null;
    }
    if (!Array.isArray(response) || response.length !== question.fields.length) return null;
    const fields = question.fields.map((field, index) => evaluateField(field, response[index]));
    if (fields.some(field => !field)) return null;
    const marks = fields.map(field => field.correct);
    return { response: fields.map(field => field.text), correct: marks.every(Boolean), marks };
  }

  function mistakeFocus(question, attempt) {
    if (attempt.correct) return '';
    if (question.stepHints) return evaluateAnswer(question, responseOf(attempt))?.correct === false ? question.focus[0] : '';
    const step = question.equationStep;
    if (step && question.format === 'calculation') {
      const marks = evaluateAnswer(question, responseOf(attempt))?.marks;
      if (!marks) return '';
      if (!marks[0] && !step.grouped && step.offset !== 0) return 'balance';
      if (marks[0] && !marks[1] && Math.abs(step.coefficient) > 1) return 'coefficient';
      return '';
    }
    return question.errors?.[attempt.choice] || '';
  }

  const storedRows = (state, field) => [
    ...(Array.isArray(state[field]) ? state[field] : []),
    ...(Array.isArray(state.unavailable?.[field]) ? state.unavailable[field] : [])
  ];

  function ungradedAnswer(entry) {
    const response = responseOf(entry);
    const correct = typeof entry.correct === 'boolean' ? { correct: entry.correct } : {};
    if (Array.isArray(response) && response.length && response.every(value => typeof value === 'string')) {
      return { response: [...response], ...correct };
    }
    return Number.isInteger(response) && response >= 0 ? { choice: response, ...correct } : null;
  }

  function normalizeState(raw, questions) {
    if (!raw || !Number.isInteger(raw.version) || raw.version < 1 || raw.version > VERSION || !Array.isArray(raw.attempts) || !Array.isArray(raw.sessions)) {
      throw new Error('Unsupported or damaged study data');
    }
    const generated = [];
    const used = new Set();
    for (const stored of raw.version >= 3 && Array.isArray(raw.generated) ? raw.generated : []) {
      const spec = AI.normalizeSpec(stored, stored?.level);
      if (!spec) continue;
      if (raw.version >= 6 && ['fill', 'calculation'].includes(stored.format)) spec.format = stored.format;
      if (raw.version >= 6 && stored.source === 'template') spec.source = 'template';
      const id = AI.questionId(spec);
      if (used.has(id)) continue;
      used.add(id);
      generated.push(spec);
    }
    const byId = new Map(questionsForState(questions, { generated }).map(question => [question.id, question]));
    const unavailable = { attempts: [], sessions: [], active: [], flags: [] };
    const attemptsBySession = new Map();
    const attempts = [];
    for (const entry of storedRows(raw, 'attempts')) {
      if (typeof entry?.questionId !== 'string' || !entry.questionId || typeof entry.sessionId !== 'string'
        || !entry.sessionId || !dateIsValid(entry.at)) continue;
      const question = byId.get(entry.questionId);
      const score = question ? evaluateAnswer(question, responseOf(entry)) : ungradedAnswer(entry);
      if (!score) continue;
      if (!attemptsBySession.has(entry.sessionId)) attemptsBySession.set(entry.sessionId, new Map());
      const submitted = attemptsBySession.get(entry.sessionId);
      if (submitted.has(entry.questionId)) continue;

      const attempt = {
        sessionId: entry.sessionId, questionId: entry.questionId, ...(question ? answerRecord(score) : score), at: entry.at,
        mode: raw.version === 1 || entry.mode === 'legacy' ? 'legacy' : sessionMode(entry.mode),
        hinted: raw.version === 1 || typeof entry.hinted !== 'boolean' ? null : entry.hinted
      };
      const focus = focusFor(entry.focus, attempt.mode, question?.subject ?? SkillData.skills[entry.focus]?.subject);
      if (focus && (!question || question.focus?.includes(focus))) attempt.focus = focus;
      if (raw.version >= 4 && isValidDuration(entry.durationMs)) attempt.durationMs = entry.durationMs;
      (question ? attempts : unavailable.attempts).push(attempt);
      submitted.set(entry.questionId, attempt);
    }
    attempts.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

    const sessions = [];
    const completedIds = new Set();
    for (const session of storedRows(raw, 'sessions')) {
      if (!session || typeof session.id !== 'string' || !session.id || completedIds.has(session.id) || !dateIsValid(session.completedAt)) continue;
      const questionIds = unique(Array.isArray(session.questionIds) ? session.questionIds : []);
      if (!Object.hasOwn(topicsBySubject, session.subject) || !questionIds.length
        || questionIds.some(id => typeof id !== 'string' || !id || (byId.has(id) && byId.get(id).subject !== session.subject))) continue;
      const mode = sessionMode(session.mode);
      const focus = focusFor(session.focus, mode, session.subject);
      const restored = { id: session.id, subject: session.subject, mode, questionIds, completedAt: session.completedAt };
      const focusEntry = focus && questionIds.every(id => !byId.has(id) || byId.get(id).focus?.includes(focus)) ? { focus } : {};
      if (questionIds.some(id => !byId.has(id))) {
        unavailable.sessions.push({ ...restored, ...(Number.isInteger(session.correct) ? { correct: session.correct } : {}), ...focusEntry });
      } else {
        const submitted = attemptsBySession.get(session.id);
        if (questionIds.some(id => !submitted?.has(id))) continue;
        const correct = questionIds.filter(id => submitted.get(id).correct).length;
        sessions.push({ ...restored, correct, ...focusEntry });
      }
      completedIds.add(session.id);
    }
    sessions.sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));

    let active = null;
    const practice = [raw.active, ...(Array.isArray(raw.unavailable?.active) ? raw.unavailable.active : [])];
    const activeIds = new Set();
    for (const saved of practice) {
      if (!saved || typeof saved.id !== 'string' || !saved.id || completedIds.has(saved.id) || activeIds.has(saved.id)
        || !Object.hasOwn(topicsBySubject, saved.subject)) continue;
      const questionIds = unique(Array.isArray(saved.questionIds) ? saved.questionIds : [])
        .filter(id => typeof id === 'string' && id && (!byId.has(id) || byId.get(id).subject === saved.subject));
      if (questionIds.length) {
        const submitted = attemptsBySession.get(saved.id);
        const answers = Object.fromEntries(questionIds.filter(id => submitted?.has(id)).map(id => [id, responseOf(submitted.get(id))]));
        const firstUnanswered = questionIds.findIndex(id => answers[id] === undefined);
        const requestedIndex = Number.isInteger(saved.index) ? saved.index : 0;
        const lastAvailableIndex = firstUnanswered < 0 ? questionIds.length - 1 : firstUnanswered;
        const hintedQuestionIds = unique(Array.isArray(saved.hintedQuestionIds) ? saved.hintedQuestionIds : [])
          .filter(id => questionIds.includes(id) && (!byId.has(id) || byId.get(id).hint));
        const restored = {
          id: saved.id, subject: saved.subject, mode: sessionMode(saved.mode), questionIds,
          index: Math.max(0, Math.min(requestedIndex, lastAvailableIndex)), answers, hintedQuestionIds
        };
        const focus = focusFor(saved.focus, restored.mode, restored.subject);
        if (focus && questionIds.every(id => !byId.has(id) || byId.get(id).focus?.includes(focus))) restored.focus = focus;
        if (active || questionIds.some(id => !byId.has(id))) unavailable.active.push(restored);
        else active = restored;
        activeIds.add(saved.id);
      }
    }
    const flags = storedRows(raw, 'flags').reduce((items, flag) => {
      if (typeof flag?.questionId === 'string' && flag.questionId && flagReasons.includes(flag.reason) && dateIsValid(flag.at)) {
        const previous = items.get(flag.questionId);
        if (!previous || Date.parse(previous.at) < Date.parse(flag.at)) items.set(flag.questionId, { questionId: flag.questionId, reason: flag.reason, at: flag.at });
      }
      return items;
    }, new Map());
    const knownFlags = [];
    for (const flag of flags.values()) (byId.has(flag.questionId) ? knownFlags : unavailable.flags).push(flag);
    return {
      version: VERSION, language: raw.language === 'en' ? 'en' : 'zh',
      preferences: normalizePreferences(raw.preferences), attempts, sessions, active, generated, plan: normalizePlan(raw.plan), flags: knownFlags,
      ...(Object.values(unavailable).some(items => items.length) ? { unavailable } : {})
    };
  }

  function readState(storage, key, legacyKeys, questions) {
    for (const name of [key, ...[].concat(legacyKeys)]) {
      const saved = storage.getItem(name);
      if (saved !== null) return normalizeState(JSON.parse(saved), questions);
    }
    return createState();
  }

  function saveState(storage, key, state) {
    storage.setItem(key, JSON.stringify(state));
  }

  function updatePreferences(state, preferences) {
    return { ...state, preferences: normalizePreferences({ ...state.preferences, ...preferences }) };
  }

  function flagQuestion(state, question, reason, at = new Date().toISOString()) {
    if (!question || !flagReasons.includes(reason) || !dateIsValid(at)) throw new Error('Invalid question report');
    return { ...state, flags: [...state.flags.filter(flag => flag.questionId !== question.id), { questionId: question.id, reason, at }] };
  }

  function reportableAttempts(state) {
    const completed = new Set(state.sessions.filter(session => hasDelayedFeedback(session.mode)).map(session => session.id));
    return state.attempts.filter(attempt => attempt.mode !== 'pilot'
      && (!hasDelayedFeedback(attempt.mode) || completed.has(attempt.sessionId)));
  }

  function getMistakes(state, questions) {
    const latest = new Map();
    const wrongCounts = new Map();
    for (const attempt of reportableAttempts(state)) {
      latest.set(attempt.questionId, attempt);
      if (!attempt.correct) wrongCounts.set(attempt.questionId, (wrongCounts.get(attempt.questionId) || 0) + 1);
    }
    return questions.filter(question => latest.has(question.id) && !latest.get(question.id).correct)
      .map(question => ({ question, attempt: latest.get(question.id), wrongCount: wrongCounts.get(question.id) }))
      .sort((a, b) => Date.parse(b.attempt.at) - Date.parse(a.attempt.at));
  }

  function getStats(state, questions, subject) {
    const ids = new Set(questions.filter(question => !subject || question.subject === subject).map(question => question.id));
    const attempts = reportableAttempts(state).filter(attempt => ids.has(attempt.questionId));
    const correct = attempts.filter(attempt => attempt.correct).length;
    return { total: attempts.length, correct, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : null,
      unique: new Set(attempts.map(attempt => attempt.questionId)).size,
      mistakes: getMistakes(state, questions).filter(item => ids.has(item.question.id)).length };
  }

  function shuffled(items, random = Math.random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const other = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function chooseQuestions(questions, { subject, topic, level, count = 8, ids }, random = Math.random) {
    if (!Number.isInteger(count) || count < 1) throw new Error('Invalid question count');
    const available = questions.filter(question => question.subject === subject && !question.retired);
    if (ids) {
      const subjectIds = new Set(available.map(question => question.id));
      return unique(ids).filter(id => subjectIds.has(id)).slice(0, count);
    }
    const pool = available.filter(question => !question.diagnosticOnly && !question.focusOnly
      && (!level || level === question.level) && (!topic || topic === question.topic));
    return shuffled(pool, random).slice(0, count).map(question => question.id);
  }

  function startSession(state, questions, options, random = Math.random) {
    const questionIds = chooseQuestions(questions, options, random);
    if (!questionIds.length) throw new Error('No questions match');
    const mode = sessionMode(options.mode);
    if (mode !== 'pilot' && questions.some(q => q.purpose === 'pilot-check' && questionIds.includes(q.id))) {
      throw new Error('Reserved pilot question');
    }
    validatePilotStage(state, { mode, subject: options.subject, questionIds }, options.now || new Date());
    const focus = focusFor(options.focus, mode, options.subject);
    if (focusModes.includes(mode) && (!focus || !questionIds.every(id => questions.find(question => question.id === id)?.focus?.includes(focus)))) {
      throw new Error('Invalid focused practice');
    }
    return { ...state, active: {
      id: makeId(), subject: options.subject, mode, questionIds, index: 0, answers: {}, hintedQuestionIds: [], ...(focus ? { focus } : {})
    } };
  }

  function validatePilotStage(state, session, date) {
    if (session.mode !== 'pilot') return;
    const pilot = globalThis.EachVeyaPilot;
    const stage = pilot?.sessionStage(session);
    if (!stage || !stage.items.every(item => item.review.status === 'approved')
      || !pilot.progress(state, pilot.routes[session.subject], date).some(row => row.stage === stage && row.ready)) {
      throw new Error('Pilot stage is unavailable');
    }
  }

  function startEquationSession(state, questions, specs, format, sample) {
    if (!AI.ROUND_FORMATS.includes(format)) throw new Error('Unsupported exercise format');
    const batch = specs.map((spec, index) => {
      const type = format === 'mixed' ? AI.FORMATS[index] : format;
      return { ...spec, ...(type === 'choice' ? {} : { format: type }), ...(sample ? { source: 'template' } : {}) };
    });
    const seen = new Set(state.generated.map(AI.questionId));
    const next = { ...state, generated: [...state.generated, ...batch.filter(spec => !seen.has(AI.questionId(spec)))] };
    const ids = batch.map(AI.questionId);
    return startSession(next, questionsForState(questions, next),
      { subject: 'math', ids, count: ids.length, mode: sample ? 'algebra-sample' : 'ai' });
  }

  function startAiSession(state, questions, level, items, format = 'choice') {
    const specs = AI.validateBatch(items, level, state.generated.filter(spec => spec.source !== 'template'));
    if (!specs) throw new Error('Invalid generated questions');
    return startEquationSession(state, questions, specs, format, false);
  }

  function startAlgebraSample(state, questions, level, format) {
    const specs = AI.sampleBatch(level);
    if (!specs) throw new Error('Invalid practice templates');
    return startEquationSession(state, questions, specs, format, true);
  }

  function revealHint(state, questions) {
    const session = state.active;
    if (!session || hasDelayedFeedback(session.mode)) return state;
    const id = session.questionIds[session.index];
    if (session.answers[id] !== undefined || session.hintedQuestionIds.includes(id)
      || !questions.some(question => question.id === id && question.hint)) return state;
    return { ...state, active: { ...session, hintedQuestionIds: [...session.hintedQuestionIds, id] } };
  }

  function answerRecord(score) {
    return { ...(score.response ? { response: score.response } : { choice: score.choice }), correct: score.correct };
  }

  function gradeAnswer(state, questions, response, at = new Date().toISOString(), durationMs) {
    const session = state.active;
    if (!session) throw new Error('No active session');
    const question = questions.find(item => item.id === session.questionIds[session.index]);
    const score = evaluateAnswer(question, response);
    if (!score) throw new Error('Invalid answer');
    if (!dateIsValid(at)) throw new Error('Invalid timestamp');
    if (session.answers[question.id] !== undefined) return state;
    validatePilotStage(state, session, new Date(at));
    const attempt = {
      sessionId: session.id, questionId: question.id, ...answerRecord(score), at,
      mode: session.mode, hinted: session.hintedQuestionIds.includes(question.id),
      ...(session.focus ? { focus: session.focus } : {}), ...(isValidDuration(durationMs) ? { durationMs } : {})
    };
    return { ...state, attempts: [...state.attempts, attempt], active: { ...session, answers: { ...session.answers, [question.id]: responseOf(attempt) } } };
  }

  function advanceSession(state, questions, at = new Date().toISOString()) {
    const session = state.active;
    if (!session || session.answers[session.questionIds[session.index]] === undefined) throw new Error('Answer before continuing');
    if (session.index < session.questionIds.length - 1) return { ...state, active: { ...session, index: session.index + 1 } };
    if (session.questionIds.some(id => session.answers[id] === undefined) || !dateIsValid(at)) throw new Error('Session is incomplete');
    validatePilotStage(state, session, new Date(at));
    const byId = new Map(questions.map(question => [question.id, question]));
    const completed = {
      id: session.id, subject: session.subject, mode: session.mode, questionIds: [...session.questionIds],
      correct: session.questionIds.filter(id => evaluateAnswer(byId.get(id), session.answers[id])?.correct).length, completedAt: at,
      ...(session.focus ? { focus: session.focus } : {})
    };
    return { ...state, active: null, sessions: [...state.sessions, completed] };
  }

  function localDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function dailyStats(state, now = new Date()) {
    const attempts = reportableAttempts(state);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
      const key = localDate(date);
      return { date, total: attempts.filter(attempt => localDate(new Date(attempt.at)) === key).length };
    });
  }

  globalThis.SmartStudyCore = {
    VERSION, createState, normalizeState, readState, saveState, storedRows, updatePreferences, getMistakes, getStats, questionsForState,
    shuffled, chooseQuestions, startSession, startAiSession, startAlgebraSample, revealHint, gradeAnswer, evaluateAnswer, responseOf, mistakeFocus,
    advanceSession, localDate, dailyStats,
    reportableAttempts, normalizePlan, flagQuestion, flagReasons, hasDelayedFeedback, focusModes, readingPassage,
    equationStructure, equationKey, schedulesLessonCheck, evaluateField, fieldInputLimit
  };
})();
