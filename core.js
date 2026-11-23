(function () {
  'use strict';
  const VERSION = 2;
  const englishLevels = globalThis.SmartStudyData.levels.english;
  const dateIsValid = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const unique = values => [...new Set(values)];
  const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sessionMode = value => value === 'review' || value === 'diagnostic' ? value : 'practice';

  function normalizePreferences(value) {
    const target = typeof value?.ieltsTarget === 'string' ? Number(value.ieltsTarget) : 0;
    return {
      englishLevel: englishLevels.includes(value?.englishLevel) ? value.englishLevel : null,
      mathPlacementDeferred: value?.mathPlacementDeferred === true,
      ieltsTarget: target >= 1 && target <= 9 && Number.isInteger(target * 2) ? target.toFixed(1) : ''
    };
  }

  function createState() {
    return { version: VERSION, language: 'zh', preferences: normalizePreferences(), attempts: [], sessions: [], active: null };
  }

  function normalizeState(raw, questions) {
    if (!raw || ![1, VERSION].includes(raw.version) || !Array.isArray(raw.attempts) || !Array.isArray(raw.sessions)) {
      throw new Error('Unsupported or damaged study data');
    }
    const byId = new Map(questions.map(question => [question.id, question]));
    const attemptsBySession = new Map();
    const attempts = [];
    for (const entry of raw.attempts) {
      const question = byId.get(entry?.questionId);
      if (!question || typeof entry.sessionId !== 'string' || !entry.sessionId || !dateIsValid(entry.at)
        || !Number.isInteger(entry.choice) || entry.choice < 0 || entry.choice >= question.options.length) continue;
      if (!attemptsBySession.has(entry.sessionId)) attemptsBySession.set(entry.sessionId, new Map());
      const submitted = attemptsBySession.get(entry.sessionId);
      if (submitted.has(question.id)) continue;

      const attempt = {
        sessionId: entry.sessionId, questionId: question.id, choice: entry.choice, correct: entry.choice === question.answer, at: entry.at,
        mode: raw.version === 1 || entry.mode === 'legacy' ? 'legacy' : sessionMode(entry.mode),
        hinted: raw.version === 1 || typeof entry.hinted !== 'boolean' ? null : entry.hinted
      };
      attempts.push(attempt);
      submitted.set(question.id, attempt);
    }
    attempts.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

    const sessions = [];
    const completedIds = new Set();
    for (const session of raw.sessions) {
      if (!session || typeof session.id !== 'string' || !session.id || completedIds.has(session.id) || !dateIsValid(session.completedAt)) continue;
      const questionIds = unique(Array.isArray(session.questionIds) ? session.questionIds : []);
      if (!questionIds.length || questionIds.some(id => byId.get(id)?.subject !== session.subject || !byId.has(id))) continue;
      const submitted = attemptsBySession.get(session.id);
      if (questionIds.some(id => !submitted?.has(id))) continue;
      const correct = questionIds.filter(id => submitted.get(id).correct).length;
      sessions.push({ id: session.id, subject: session.subject, mode: sessionMode(session.mode), questionIds, completedAt: session.completedAt, correct });
      completedIds.add(session.id);
    }

    let active = null;
    const saved = raw.active;
    if (saved && typeof saved.id === 'string' && saved.id && !completedIds.has(saved.id)) {
      const questionIds = unique(Array.isArray(saved.questionIds) ? saved.questionIds : [])
        .filter(id => byId.has(id) && byId.get(id).subject === saved.subject);
      if (questionIds.length) {
        const submitted = attemptsBySession.get(saved.id);
        const answers = Object.fromEntries(questionIds.filter(id => submitted?.has(id)).map(id => [id, submitted.get(id).choice]));
        const firstUnanswered = questionIds.findIndex(id => answers[id] === undefined);
        const requestedIndex = Number.isInteger(saved.index) ? saved.index : 0;
        const lastAvailableIndex = firstUnanswered < 0 ? questionIds.length - 1 : firstUnanswered;
        const hintedQuestionIds = unique(Array.isArray(saved.hintedQuestionIds) ? saved.hintedQuestionIds : [])
          .filter(id => questionIds.includes(id) && byId.get(id).hint);
        active = {
          id: saved.id, subject: saved.subject, mode: sessionMode(saved.mode), questionIds,
          index: Math.max(0, Math.min(requestedIndex, lastAvailableIndex)), answers, hintedQuestionIds
        };
      }
    }
    return {
      version: VERSION, language: raw.language === 'en' ? 'en' : 'zh', preferences: normalizePreferences(raw.preferences), attempts, sessions, active
    };
  }

  function readState(storage, key, legacyKey, questions) {
    const saved = storage.getItem(key) ?? storage.getItem(legacyKey);
    return saved === null ? createState() : normalizeState(JSON.parse(saved), questions);
  }

  function saveState(storage, key, state) {
    storage.setItem(key, JSON.stringify(state));
  }

  function updatePreferences(state, preferences) {
    return { ...state, preferences: normalizePreferences({ ...state.preferences, ...preferences }) };
  }

  function getMistakes(state, questions) {
    const latest = new Map();
    const wrongCounts = new Map();
    for (const attempt of state.attempts) {
      latest.set(attempt.questionId, attempt);
      if (!attempt.correct) wrongCounts.set(attempt.questionId, (wrongCounts.get(attempt.questionId) || 0) + 1);
    }
    return questions.filter(question => latest.has(question.id) && !latest.get(question.id).correct)
      .map(question => ({ question, attempt: latest.get(question.id), wrongCount: wrongCounts.get(question.id) }))
      .sort((a, b) => Date.parse(b.attempt.at) - Date.parse(a.attempt.at));
  }

  function getStats(state, questions, subject) {
    const ids = new Set(questions.filter(question => !subject || question.subject === subject).map(question => question.id));
    const attempts = state.attempts.filter(attempt => ids.has(attempt.questionId));
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
    if (ids) {
      const subjectIds = new Set(questions.filter(question => question.subject === subject).map(question => question.id));
      return unique(ids).filter(id => subjectIds.has(id)).slice(0, count);
    }
    const pool = questions.filter(question => question.subject === subject && !question.diagnosticOnly
      && (!level || level === question.level) && (!topic || topic === question.topic));
    return shuffled(pool, random).slice(0, count).map(question => question.id);
  }

  function startSession(state, questions, options, random = Math.random) {
    const questionIds = chooseQuestions(questions, options, random);
    if (!questionIds.length) throw new Error('No questions match');
    return { ...state, active: {
      id: makeId(), subject: options.subject, mode: sessionMode(options.mode), questionIds, index: 0, answers: {}, hintedQuestionIds: []
    } };
  }

  function revealHint(state, questions) {
    const session = state.active;
    if (!session || session.mode === 'diagnostic') return state;
    const id = session.questionIds[session.index];
    if (session.answers[id] !== undefined || session.hintedQuestionIds.includes(id)
      || !questions.some(question => question.id === id && question.hint)) return state;
    return { ...state, active: { ...session, hintedQuestionIds: [...session.hintedQuestionIds, id] } };
  }

  function gradeAnswer(state, questions, choice, at = new Date().toISOString()) {
    const session = state.active;
    if (!session) throw new Error('No active session');
    const question = questions.find(item => item.id === session.questionIds[session.index]);
    if (!question || !Number.isInteger(choice) || choice < 0 || choice >= question.options.length) throw new Error('Invalid answer');
    if (!dateIsValid(at)) throw new Error('Invalid timestamp');
    if (session.answers[question.id] !== undefined) return state;
    const attempt = {
      sessionId: session.id, questionId: question.id, choice, correct: choice === question.answer, at,
      mode: session.mode, hinted: session.hintedQuestionIds.includes(question.id)
    };
    return { ...state, attempts: [...state.attempts, attempt], active: { ...session, answers: { ...session.answers, [question.id]: choice } } };
  }

  function advanceSession(state, questions, at = new Date().toISOString()) {
    const session = state.active;
    if (!session || session.answers[session.questionIds[session.index]] === undefined) throw new Error('Answer before continuing');
    if (session.index < session.questionIds.length - 1) return { ...state, active: { ...session, index: session.index + 1 } };
    if (session.questionIds.some(id => session.answers[id] === undefined) || !dateIsValid(at)) throw new Error('Session is incomplete');
    const byId = new Map(questions.map(question => [question.id, question]));
    const completed = {
      id: session.id, subject: session.subject, mode: session.mode, questionIds: [...session.questionIds],
      correct: session.questionIds.filter(id => session.answers[id] === byId.get(id).answer).length, completedAt: at
    };
    return { ...state, active: null, sessions: [...state.sessions, completed] };
  }

  function localDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function dailyStats(state, now = new Date()) {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
      const key = localDate(date);
      return { date, total: state.attempts.filter(attempt => localDate(new Date(attempt.at)) === key).length };
    });
  }

  globalThis.SmartStudyCore = {
    VERSION, createState, normalizeState, readState, saveState, updatePreferences, getMistakes, getStats,
    shuffled, chooseQuestions, startSession, revealHint, gradeAnswer, advanceSession, localDate, dailyStats
  };
})();
