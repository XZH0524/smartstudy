(function () {
  'use strict';
  const { questions, topicsBySubject, levels } = globalThis.SmartStudyData;
  const Core = globalThis.SmartStudyCore;
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
    if (ids.length !== session.questionIds.length || ids.some(id => !session.questionIds.includes(id))) return null;
    const answers = new Map(state.attempts.filter(attempt => attempt.sessionId === session.id).map(attempt => [attempt.questionId, attempt]));
    if (ids.some(id => !answers.has(id))) return null;
    const items = ids.map(id => ({ ...byId.get(id), correct: answers.get(id).correct }));
    const completedAt = session.completedAt;
    if (session.subject === 'math') {
      const topics = {};
      for (const topic of topicsBySubject.math) {
        const [foundation, challenge] = items.filter(item => item.topic === topic);
        let recommendation = 'L1';
        if (foundation.correct && challenge.correct) recommendation = 'L4';
        else if (foundation.correct || challenge.correct) recommendation = 'L2';
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
    const adjustments = Object.fromEntries(topicsBySubject.math.map(topic => [topic, {
      level: placement?.topics[topic].level ?? 'L2',
      basis: placement ? 'diagnostic' : 'starting',
      seen: new Set(), samples: [], lastBatch: null
    }]));
    const cutoff = placement ? Date.parse(placement.completedAt) : -Infinity;

    for (const attempt of state.attempts) {
      const question = byId.get(attempt.questionId);
      if (question?.subject !== 'math' || attempt.mode !== 'practice' || typeof attempt.hinted !== 'boolean'
        || question.diagnosticOnly || Date.parse(attempt.at) < cutoff) continue;
      const profile = adjustments[question.topic];
      if (question.level !== profile.level || profile.seen.has(question.id)) continue;

      profile.seen.add(question.id);
      profile.samples.push(attempt);
      if (profile.samples.length < EVIDENCE_COUNT) continue;

      const correct = profile.samples.filter(sample => sample.correct).length;
      const independent = profile.samples.filter(sample => sample.correct && sample.hinted === false).length;
      const direction = independent >= 4 ? 1 : correct <= 2 ? -1 : 0;
      const index = levels.math.indexOf(profile.level);
      profile.lastBatch = { level: profile.level, correct, independent, total: EVIDENCE_COUNT };
      profile.level = levels.math[Math.max(0, Math.min(levels.math.length - 1, index + direction))];
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

  function recommendedEnglishLevel(state) {
    return latestPlacement(state, 'english')?.level ?? 'A1';
  }

  function practicePool(state, { subject, topic, level }) {
    const profiles = subject === 'math' && level === 'auto' ? mathProfile(state) : null;
    const chosenLevel = subject === 'english' && level === 'auto' ? recommendedEnglishLevel(state) : level;
    return questions.filter(question => question.subject === subject && !question.diagnosticOnly
      && (!topic || question.topic === topic) && question.level === (profiles ? profiles[question.topic].level : chosenLevel));
  }

  function practiceIds(state, options, random = Math.random) {
    const pool = practicePool(state, options);
    const topics = topicsBySubject[options.subject];
    const ranked = options.subject === 'english' ? englishRecommendations(state).map(item => item.topic) : [];
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

    for (const attempt of state.attempts) {
      const question = byId.get(attempt.questionId);
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
    englishRecommendations, recommendedEnglishLevel, practicePool, practiceIds, topicProgress
  };
})();
