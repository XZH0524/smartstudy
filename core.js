(function () {
  'use strict';
  const VERSION = 1;
  const dateIsValid = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const unique = values => [...new Set(values)];
  const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  function createState() {
    return { version: VERSION, language: 'zh', attempts: [], sessions: [], active: null };
  }

  function normalizeState(raw, questions) {
    if (!raw || raw.version !== VERSION || !Array.isArray(raw.attempts) || !Array.isArray(raw.sessions)) {
      throw new Error('Unsupported or damaged study data');
    }
    const byId = new Map(questions.map(question => [question.id, question]));
    const seen = new Set();
    const attempts = raw.attempts.filter(attempt => {
      const question = byId.get(attempt?.questionId);
      const valid = question && typeof attempt.sessionId === 'string' && attempt.sessionId.length > 0 &&
        Number.isInteger(attempt.choice) && attempt.choice >= 0 && attempt.choice < question.options.length && dateIsValid(attempt.at);
      const key = JSON.stringify([attempt?.sessionId, attempt?.questionId]);
      if (!valid || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(attempt => ({
      sessionId: attempt.sessionId, questionId: attempt.questionId,
      choice: attempt.choice, correct: attempt.choice === byId.get(attempt.questionId).answer, at: attempt.at
    })).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    const sessions = [];
    for (const session of raw.sessions) {
      if (!session || typeof session.id !== 'string' || sessions.some(item => item.id === session.id) || !dateIsValid(session.completedAt)) continue;
      const questionIds = unique(Array.isArray(session.questionIds) ? session.questionIds : []);
      if (!questionIds.length || questionIds.some(id => !byId.has(id))) continue;
      const answers = attempts.filter(attempt => attempt.sessionId === session.id && questionIds.includes(attempt.questionId));
      if (answers.length !== questionIds.length) continue;
      sessions.push({ id: session.id, subject: session.subject, mode: session.mode === 'review' ? 'review' : 'practice', questionIds,
        completedAt: session.completedAt, correct: answers.filter(answer => answer.correct).length });
    }
    let active = null;
    const saved = raw.active;
    if (saved && typeof saved.id === 'string' && saved.id && !sessions.some(session => session.id === saved.id)) {
      const questionIds = unique(Array.isArray(saved.questionIds) ? saved.questionIds : []).filter(id => byId.has(id) && byId.get(id).subject === saved.subject);
      if (questionIds.length) {
        const answers = Object.fromEntries(attempts.filter(attempt => attempt.sessionId === saved.id && questionIds.includes(attempt.questionId)).map(attempt => [attempt.questionId, attempt.choice]));
        const firstUnanswered = questionIds.findIndex(id => answers[id] === undefined);
        const requestedIndex = Number.isInteger(saved.index) ? saved.index : 0;
        const lastAvailableIndex = firstUnanswered < 0 ? questionIds.length - 1 : firstUnanswered;
        active = { id: saved.id, subject: saved.subject, mode: saved.mode === 'review' ? 'review' : 'practice', questionIds,
          index: Math.max(0, Math.min(requestedIndex, lastAvailableIndex)), answers };
      }
    }
    return { version: VERSION, language: raw.language === 'en' ? 'en' : 'zh', attempts, sessions, active };
  }

  function getMistakes(state, questions) {
    const latest = new Map();
    for (const attempt of state.attempts) latest.set(attempt.questionId, attempt);
    return questions.filter(question => latest.has(question.id) && !latest.get(question.id).correct)
      .map(question => ({ question, attempt: latest.get(question.id), wrongCount: state.attempts.filter(attempt => attempt.questionId === question.id && !attempt.correct).length }))
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

  function chooseQuestions(questions, { subject, difficulty = 'all', count = 8, ids }, random = Math.random) {
    if (!Number.isInteger(count) || count < 1) throw new Error('Invalid question count');
    const allowed = ids ? new Set(ids) : null;
    const pool = questions.filter(question => question.subject === subject && (difficulty === 'all' || question.difficulty === difficulty) && (!allowed || allowed.has(question.id)));
    for (let index = pool.length - 1; index > 0; index--) {
      const other = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
      [pool[index], pool[other]] = [pool[other], pool[index]];
    }
    return pool.slice(0, count).map(question => question.id);
  }

  function startSession(state, questions, options, random = Math.random) {
    const questionIds = chooseQuestions(questions, options, random);
    if (!questionIds.length) throw new Error('No questions match');
    return { ...state, active: { id: makeId(), subject: options.subject, mode: options.mode === 'review' ? 'review' : 'practice', questionIds, index: 0, answers: {} } };
  }

  function gradeAnswer(state, questions, choice, at = new Date().toISOString()) {
    const session = state.active;
    if (!session) throw new Error('No active session');
    const question = questions.find(item => item.id === session.questionIds[session.index]);
    if (!question || !Number.isInteger(choice) || choice < 0 || choice >= question.options.length) throw new Error('Invalid answer');
    if (!dateIsValid(at)) throw new Error('Invalid timestamp');
    if (session.answers[question.id] !== undefined) return state;
    const attempt = { sessionId: session.id, questionId: question.id, choice, correct: choice === question.answer, at };
    return { ...state, attempts: [...state.attempts, attempt], active: { ...session, answers: { ...session.answers, [question.id]: choice } } };
  }

  function advanceSession(state, questions, at = new Date().toISOString()) {
    const session = state.active;
    if (!session || session.answers[session.questionIds[session.index]] === undefined) throw new Error('Answer before continuing');
    if (session.index < session.questionIds.length - 1) return { ...state, active: { ...session, index: session.index + 1 } };
    if (session.questionIds.some(id => session.answers[id] === undefined) || !dateIsValid(at)) throw new Error('Session is incomplete');
    const byId = new Map(questions.map(question => [question.id, question]));
    const completed = { id: session.id, subject: session.subject, mode: session.mode, questionIds: [...session.questionIds],
      correct: session.questionIds.filter(id => session.answers[id] === byId.get(id).answer).length, completedAt: at };
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

  globalThis.SmartStudyCore = { VERSION, createState, normalizeState, getMistakes, getStats, chooseQuestions, startSession, gradeAnswer, advanceSession, localDate, dailyStats };
})();
