(function () {
  'use strict';
  const { questions, topicsBySubject, levels } = globalThis.SmartStudyData;
  const Core = globalThis.SmartStudyCore;
  const Science = globalThis.EachVeyaScience;
  const byId = new Map(questions.map(question => [question.id, question]));
  const EVIDENCE_COUNT = 5;
  const ENGLISH_PLACEMENT_LEVELS = levels.english.slice(0, 4);

  function diagnosticIds(subject) {
    const items = questions.filter(question => question.subject === subject && question.diagnosticOnly);
    return [...items].sort((a, b) => levels[subject].indexOf(a.level) - levels[subject].indexOf(b.level)
      || topicsBySubject[subject].indexOf(a.topic) - topicsBySubject[subject].indexOf(b.topic)).map(question => question.id);
  }

  function placementResult(state, session) {
    if (!session || session.mode !== 'diagnostic') return null;
    const ids = diagnosticIds(session.subject);
    if (!ids.length || ids.length !== session.questionIds.length || ids.some(id => !session.questionIds.includes(id))) return null;
    const answers = new Map(state.attempts.filter(attempt => attempt.sessionId === session.id).map(attempt => [attempt.questionId, attempt]));
    if (ids.some(id => !answers.has(id))) return null;
    const items = ids.map(id => ({ ...byId.get(id), correct: answers.get(id).correct }));
    const completedAt = session.completedAt;
    if (session.subject === 'math' || Science.subjects.includes(session.subject)) {
      const topics = {};
      for (const topic of topicsBySubject[session.subject]) {
        const [foundation, challenge] = items.filter(item => item.topic === topic);
        let recommendation = 'L1';
        if (foundation.correct && challenge.correct) recommendation = session.subject === 'math' ? 'L4' : 'L3';
        else if (foundation.correct || (session.subject === 'math' && challenge.correct)) recommendation = 'L2';
        topics[topic] = { level: recommendation, correct: Number(foundation.correct) + Number(challenge.correct), total: 2 };
      }
      return { completedAt, topics };
    }

    let recommendation = ENGLISH_PLACEMENT_LEVELS[0];
    for (const level of ENGLISH_PLACEMENT_LEVELS) {
      recommendation = level;
      const itemsAtLevel = items.filter(item => item.level === level);
      if (itemsAtLevel.filter(item => item.correct).length < 2) break;
    }
    return { completedAt, level: recommendation };
  }

  function latestPlacement(state, subject) {
    const session = state.sessions.filter(item => item.subject === subject && item.mode === 'diagnostic').at(-1);
    return placementResult(state, session);
  }

  function mathProfile(state, placement = latestPlacement(state, 'math')) {
    return adaptiveProfile(state, 'math', placement);
  }

  function englishProfile(state, placement = latestPlacement(state, 'english')) {
    return adaptiveProfile(state, 'english', placement);
  }

  function subjectProfile(state, subject, placement = latestPlacement(state, subject)) {
    if (Science.subjects.includes(subject)) return scienceProfile(state, subject, placement);
    return adaptiveProfile(state, subject, placement);
  }

  function scienceProfile(state, subject, placement) {
    const rows = Object.fromEntries(topicsBySubject[subject].map(topic => [topic, {
      level: placement?.topics[topic].level || 'L1', basis: placement ? 'diagnostic' : 'starting',
      samples: [], evidence: 0, lastBatch: null, retained: null, transfer: null, seen: new Set()
    }]));
    const cutoff = Date.parse(placement?.completedAt || '1970-01-01');
    const reviewed = new Map(state.sessions.filter(session => session.mode === 'spaced').map(session => [session.id, session]));
    for (const attempt of state.attempts) {
      const question = byId.get(attempt.questionId);
      if (question?.subject !== subject || Date.parse(attempt.at) < cutoff || attempt.hinted === null || question.diagnosticOnly) continue;
      const row = rows[question.topic];
      if (question.level !== row.level || row.seen.has(question.id)) continue;
      if (['practice', 'science-ai'].includes(attempt.mode) && question.role === 'practice') {
        row.seen.add(question.id);
        row.samples.push({ ...attempt, error: attempt.correct ? '' : question.errorKinds[attempt.choice] });
        row.evidence = row.samples.length;
      } else if (question.role === 'transfer' && attempt.mode === 'spaced' && attempt.hinted === false && reviewed.has(attempt.sessionId)) {
        const anchor = row.samples[0]?.at;
        const completion = reviewed.get(attempt.sessionId).completedAt;
        if (!anchor || Core.localDate(new Date(completion)) <= Core.localDate(new Date(anchor))) continue;
        row.seen.add(question.id);
        row.transfer = attempt.correct;
        if (!attempt.correct) row.retained = null;
      } else continue;
      if (row.samples.length < EVIDENCE_COUNT) continue;
      const batch = row.samples.slice(-EVIDENCE_COUNT);
      const correct = batch.filter(item => item.correct).length;
      const independent = batch.filter(item => item.correct && !item.hinted).length;
      const errors = batch.flatMap(item => item.error ? [item.error] : []);
      const repeated = errors.some((error, index) => errors.indexOf(error) !== index);
      const direction = independent >= 4 && row.transfer === true ? 1 : correct <= 2 && (repeated || row.transfer === false) ? -1 : 0;
      row.basis = 'practice';
      row.lastBatch = { level: row.level, correct, independent, total: EVIDENCE_COUNT };
      if (direction === 0) continue;
      if (direction > 0) row.retained = row.level;
      else row.retained = null;
      const index = levels[subject].indexOf(row.level);
      const level = levels[subject][Math.max(0, Math.min(4, index + direction))];
      row.level = level;
      row.samples = [];
      row.evidence = 0;
      row.transfer = null;
    }
    return Object.fromEntries(Object.entries(rows).map(([topic, { level, basis, evidence, lastBatch, retained }]) =>
      [topic, { level, basis, evidence, lastBatch, retained }]));
  }

  function adaptiveProfile(state, subject, placement) {
    const tiers = levels[subject];
    const adjustments = Object.fromEntries(topicsBySubject[subject].map(topic => [topic, {
      level: placement?.topics?.[topic]?.level ?? placement?.level ?? (subject === 'math' ? 'L2' : 'A1'),
      basis: placement ? 'diagnostic' : 'starting',
      seen: new Set(), samples: [], lastBatch: null
    }]));
    const cutoff = placement ? Date.parse(placement.completedAt) : -Infinity;

    for (const attempt of state.attempts) {
      const question = byId.get(attempt.questionId);
      if (question?.subject !== subject || attempt.mode !== 'practice' || typeof attempt.hinted !== 'boolean'
        || question.diagnosticOnly || Date.parse(attempt.at) < cutoff) continue;
      const profile = adjustments[question.topic];
      if (question.level !== profile.level || profile.seen.has(question.id)) continue;

      profile.seen.add(question.id);
      profile.samples.push(attempt);
      if (profile.samples.length < EVIDENCE_COUNT) continue;

      const correct = profile.samples.filter(sample => sample.correct).length;
      const independent = profile.samples.filter(sample => sample.correct && sample.hinted === false).length;
      // Several very fast incorrect answers need more evidence before lowering a level.
      const pacedRecheck = correct <= 2 && profile.samples.filter(sample => !sample.correct && sample.durationMs >= 20 && sample.durationMs < 2000).length >= 2;
      const direction = independent >= 4 ? 1 : correct <= 2 && !pacedRecheck ? -1 : 0;
      const index = tiers.indexOf(profile.level);
      profile.lastBatch = { level: profile.level, correct, independent, total: EVIDENCE_COUNT };
      if (pacedRecheck) profile.lastBatch.pacedRecheck = true;
      profile.level = tiers[Math.max(0, Math.min(tiers.length - 1, index + direction))];
      profile.basis = 'practice';
      profile.samples = [];
    }

    return Object.fromEntries(Object.entries(adjustments).map(([topic, profile]) => [topic, {
      level: profile.level, basis: profile.basis, evidence: profile.samples.length, lastBatch: profile.lastBatch
    }]));
  }

  function englishRecommendations(state, now = new Date()) {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    const counts = new Map();
    for (const { question, attempt } of Core.getMistakes(state, questions)) {
      if (question.subject === 'english' && Date.parse(attempt.at) >= cutoff && Date.parse(attempt.at) <= now.getTime()) {
        counts.set(question.topic, (counts.get(question.topic) || 0) + 1);
      }
    }
    return topicsBySubject.english.filter(topic => counts.has(topic)).map(topic => ({ topic, count: counts.get(topic) }))
      .sort((a, b) => b.count - a.count);
  }

  function practicePool(state, { subject, topic, level, curriculum = '' }) {
    const profiles = level === 'auto' && topicsBySubject[subject] ? subjectProfile(state, subject) : null;
    return questions.filter(question => question.subject === subject && !question.diagnosticOnly && !question.focusOnly
      && (!curriculum || question.curriculumRefs?.some(ref => ref.curriculum === curriculum))
      && (!topic || question.topic === topic) && question.level === (profiles ? profiles[question.topic].level : level));
  }

  function practiceIds(state, options, random = Math.random) {
    const pool = practicePool(state, options);
    const topics = topicsBySubject[options.subject];
    const ranked = options.subject === 'english' ? englishRecommendations(state).map(item => item.topic)
      : Science.subjects.includes(options.subject) ? Core.getMistakes(state, pool).map(item => item.question.topic) : [];
    const orderedTopics = [...new Set([...ranked, ...topics])];
    const attempted = new Set(state.attempts.map(attempt => attempt.questionId));
    const ids = [];

    // Finish untried questions in the matching pool before repeating any.
    for (const repeat of [false, true]) {
      const queues = orderedTopics.map(topic =>
        Core.shuffled(pool.filter(question => question.topic === topic && attempted.has(question.id) === repeat), random));
      const longest = Math.max(0, ...queues.map(queue => queue.length));
      for (let index = 0; index < longest; index++) {
        for (const queue of queues) {
          if (queue[index]) ids.push(queue[index].id);
        }
      }
    }
    return ids;
  }

  function topicProgress(state, now = new Date()) {
    const recentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    const rows = Object.fromEntries(Object.values(topicsBySubject).flat().map(topic => [topic, {
      total: 0, correct: 0, recent: { total: 0, correct: 0 }, previous: { total: 0, correct: 0 }
    }]));
    const questionById = state.generated?.length
      ? new Map(Core.questionsForState(questions, state).map(question => [question.id, question])) : byId;

    for (const attempt of Core.reportableAttempts(state)) {
      const question = questionById.get(attempt.questionId);
      if (!question) continue;
      const row = rows[question.topic];
      const at = Date.parse(attempt.at);
      if (at > now.getTime()) continue;
      row.total++;
      row.correct += Number(attempt.correct);
      const period = at >= recentStart ? row.recent : at >= previousStart ? row.previous : null;
      if (period) {
        period.total++;
        period.correct += Number(attempt.correct);
      }
    }
    return rows;
  }

  globalThis.SmartStudyLearning = {
    EVIDENCE_COUNT, diagnosticIds, placementResult, latestPlacement, mathProfile,
    englishRecommendations, englishProfile, subjectProfile, practicePool, practiceIds, topicProgress
  };
})();
