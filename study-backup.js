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
    const changed = state.attempts.length !== raw.attempts.length || state.sessions.length !== raw.sessions.length
      || state.generated.length !== (raw.generated?.length ?? 0)
      || state.flags.length !== (raw.flags?.length ?? 0)
      || Boolean(state.active) !== Boolean(raw.active)
      || (state.active && state.active.questionIds.length !== raw.active.questionIds?.length);
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

  function merge(current, incoming, bank) {
    const generated = new Map(current.generated.map(spec => [AI.questionId(spec), spec]));
    for (const spec of incoming.generated) {
      const key = AI.questionId(spec);
      const previous = generated.get(key);
      if (previous && JSON.stringify(previous) !== JSON.stringify(spec)) throw new Error('question_conflict');
      generated.set(key, spec);
    }

    const attemptKey = attempt => JSON.stringify([attempt.sessionId, attempt.questionId]);
    const attempts = new Map(current.attempts.map(attempt => [attemptKey(attempt), attempt]));
    for (const attempt of incoming.attempts) {
      const key = attemptKey(attempt);
      const previous = attempts.get(key);
      if (!previous) { attempts.set(key, attempt); continue; }
      if (JSON.stringify(Core.responseOf(previous)) !== JSON.stringify(Core.responseOf(attempt)) || Date.parse(previous.at) !== Date.parse(attempt.at)
        || (previous.focus && attempt.focus && previous.focus !== attempt.focus)) throw new Error('attempt_conflict');
      attempts.set(key, { ...attempt, ...previous, hinted: previous.hinted ?? attempt.hinted });
    }

    const sameSession = (a, b) => a.subject === b.subject && a.mode === b.mode
      && a.focus === b.focus && JSON.stringify(a.questionIds) === JSON.stringify(b.questionIds);
    const sessions = new Map(current.sessions.map(session => [session.id, session]));
    for (const session of incoming.sessions) {
      const existing = sessions.get(session.id);
      if (existing && (!sameSession(existing, session) || Date.parse(existing.completedAt) !== Date.parse(session.completedAt))) {
        throw new Error('session_conflict');
      }
      sessions.set(session.id, existing || session);
    }

    const saved = current.active && !sessions.has(current.active.id) ? current.active : null;
    const imported = incoming.active && !sessions.has(incoming.active.id) ? incoming.active : null;
    let active = saved || imported;
    if (saved && imported) {
      if (saved.id !== imported.id || !sameSession(saved, imported)) throw new Error('active_conflict');
      active = { ...saved, index: Math.max(saved.index, imported.index),
        hintedQuestionIds: [...new Set([...saved.hintedQuestionIds, ...imported.hintedQuestionIds])] };
    }
    const empty = Core.createState();
    const usesLocalPreferences = current.attempts.length > 0 || current.active || current.plan
      || current.language !== empty.language || JSON.stringify(current.preferences) !== JSON.stringify(empty.preferences);
    return Core.normalizeState({
      ...current, language: usesLocalPreferences ? current.language : incoming.language,
      preferences: usesLocalPreferences ? current.preferences : incoming.preferences,
      plan: current.plan || incoming.plan,
      generated: [...generated.values()], attempts: [...attempts.values()], sessions: [...sessions.values()], active,
      flags: [...current.flags, ...incoming.flags]
    }, bank);
  }

  globalThis.EachVeyaBackup = { serialize, parse, merge, practiceRecords };
})();
