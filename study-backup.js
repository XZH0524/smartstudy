(function () {
  'use strict';
  const Core = globalThis.SmartStudyCore;
  const AI = globalThis.EachVeyaAi;
  const format = 'EachVeya study backup';

  function serialize(state) {
    return JSON.stringify({ format, exportedAt: new Date().toISOString(), study: state }, null, 2);
  }

  function parse(content, bank) {
    const payload = JSON.parse(content);
    const raw = payload?.format === format ? payload.study : payload;
    const state = Core.normalizeState(raw, bank);
    const recordGroups = ['attempts', 'sessions', 'flags'];
    if ((raw.flags != null && !Array.isArray(raw.flags))
      || (raw.unavailable != null && (typeof raw.unavailable !== 'object' || Array.isArray(raw.unavailable)
        || Object.entries(raw.unavailable).some(([field, records]) =>
          ![...recordGroups, 'active'].includes(field) || !Array.isArray(records))))) throw new Error('invalid_backup');
    const practice = data => [data.active, ...(data.unavailable?.active || [])].filter(Boolean);
    const restored = new Map(practice(state).map(session => [session.id, session.questionIds.length]));
    const oldPractice = practice(raw);
    const changed = recordGroups.some(field => Core.storedRows(state, field).length !== Core.storedRows(raw, field).length)
      || state.generated.length !== (raw.generated?.length ?? 0) || restored.size !== oldPractice.length
      || oldPractice.some(session => !Array.isArray(session.questionIds) || restored.get(session.id) !== session.questionIds.length);
    if (changed) throw new Error('invalid_backup');
    return state;
  }

  function practiceRecords(state) {
    const answered = new Set(state.attempts.map(attempt => attempt.questionId));
    return {
      ...Core.createState(),
      attempts: state.attempts,
      sessions: state.sessions,
      generated: state.generated.filter(spec => answered.has(AI.questionId(spec)))
    };
  }

  function merge(current, incoming, bank, { liveSync = false } = {}) {
    const generated = new Map(current.generated.map(spec => [AI.questionId(spec), spec]));
    for (const spec of incoming.generated) {
      const key = AI.questionId(spec);
      const previous = generated.get(key);
      if (previous && JSON.stringify(previous) !== JSON.stringify(spec)) throw new Error('question_conflict');
      generated.set(key, spec);
    }

    const attemptKey = attempt => JSON.stringify([attempt.sessionId, attempt.questionId]);
    const attempts = new Map(Core.storedRows(current, 'attempts').map(attempt => [attemptKey(attempt), attempt]));
    for (const attempt of Core.storedRows(incoming, 'attempts')) {
      const key = attemptKey(attempt);
      const previous = attempts.get(key);
      if (!previous) { attempts.set(key, attempt); continue; }
      if (JSON.stringify(Core.responseOf(previous)) !== JSON.stringify(Core.responseOf(attempt))
        || (!liveSync && Date.parse(previous.at) !== Date.parse(attempt.at))
        || (previous.focus && attempt.focus && previous.focus !== attempt.focus)) throw new Error('attempt_conflict');
      attempts.set(key, { ...attempt, ...previous, hinted: previous.hinted ?? attempt.hinted });
    }

    const sameSession = (a, b) => a.subject === b.subject && a.mode === b.mode
      && a.focus === b.focus && JSON.stringify(a.questionIds) === JSON.stringify(b.questionIds);
    const sessions = new Map(Core.storedRows(current, 'sessions').map(session => [session.id, session]));
    for (const session of Core.storedRows(incoming, 'sessions')) {
      const existing = sessions.get(session.id);
      if (existing && (!sameSession(existing, session) || (!liveSync && Date.parse(existing.completedAt) !== Date.parse(session.completedAt)))) {
        throw new Error('session_conflict');
      }
      sessions.set(session.id, existing || session);
    }

    const saved = current.active && !sessions.has(current.active.id) ? current.active : null;
    const imported = incoming.active && !sessions.has(incoming.active.id) ? incoming.active : null;
    let active = saved || imported;
    function mergeActive(a, b) {
      if (a.id !== b.id || !sameSession(a, b)) throw new Error('active_conflict');
      return { ...a, index: Math.max(a.index, b.index), hintedQuestionIds: [...new Set([...a.hintedQuestionIds, ...b.hintedQuestionIds])] };
    }
    if (saved && imported) {
      active = mergeActive(saved, imported);
    }
    const deferred = new Map();
    for (const session of [...(current.unavailable?.active || []), ...(incoming.unavailable?.active || [])]) {
      if (sessions.has(session.id)) continue;
      if (active?.id === session.id) {
        active = mergeActive(active, session);
      } else {
        const previous = deferred.get(session.id);
        deferred.set(session.id, previous ? mergeActive(previous, session) : session);
      }
    }
    const empty = Core.createState();
    const usesLocalPreferences = current.attempts.length > 0 || current.unavailable || current.active || current.plan
      || current.language !== empty.language || JSON.stringify(current.preferences) !== JSON.stringify(empty.preferences);
    return Core.normalizeState({
      ...current, language: usesLocalPreferences ? current.language : incoming.language,
      preferences: usesLocalPreferences ? current.preferences : incoming.preferences,
      plan: current.plan || incoming.plan,
      generated: [...generated.values()], attempts: [...attempts.values()], sessions: [...sessions.values()], active,
      flags: [...Core.storedRows(current, 'flags'), ...Core.storedRows(incoming, 'flags')],
      unavailable: { active: [...deferred.values()] }
    }, bank);
  }

  globalThis.EachVeyaBackup = { serialize, parse, merge, practiceRecords };
})();
