(function () {
  'use strict';
  const { bilingual: bi } = globalThis.SmartStudyData;
  const { skills } = globalThis.EachVeyaSkills;
  const deepSeekReview = Object.freeze({ status: 'approved', reviewer: 'DeepSeek', date: '2026-11-25' });
  const pendingReview = Object.freeze({ status: 'pending' });
  const stages = [
    { id: 'entry', label: bi('起点测评', 'Initial check'), evidence: 'independent', day: 0 },
    { id: 'lesson', label: bi('分步讲解', 'Worked example'), evidence: 'guided' },
    { id: 'practice', label: bi('专项练习', 'Targeted practice'), evidence: 'practice' },
    { id: 'next-day', label: bi('隔天复测', 'Next-day check'), evidence: 'independent', day: 1 },
    { id: 'day-seven', label: bi('第 7 天复测', 'Day 7 check'), evidence: 'independent', day: 7 }
  ];

  const skillsBySubject = {
    english: {
      'time-clue': { label: bi('找出问题中的动作与时间线索', 'Identify the action and time clue'), prerequisites: [] },
      'text-evidence': { ...skills['text-evidence'], prerequisites: ['time-clue'] }
    },
    math: {
      balance: skills.balance,
      coefficient: skills.coefficient,
      'two-step-equation': { label: bi('用两步解方程并代回核对', 'Solve and check a two-step equation'), prerequisites: ['balance', 'coefficient'] }
    },
    physics: {
      'elapsed-time': { label: bi('计算包含停留的总用时', 'Count all elapsed time, including stops'), prerequisites: [] },
      'average-speed': { ...skills['average-speed'], prerequisites: ['elapsed-time'] }
    },
    chemistry: {
      'sample-volume': { label: bi('从模拟读数或尺寸求样品体积', 'Find sample volume from simulated readings or dimensions'), prerequisites: [] },
      'mass-density': { ...skills['mass-density'], prerequisites: ['sample-volume'] }
    },
    biology: {
      'surveyed-area': { label: bi('确定实际调查面积', 'Identify the area actually surveyed'), prerequisites: [] },
      'population-density': { ...skills['population-density'], prerequisites: ['surveyed-area'] }
    }
  };

  function makeRoute(subject, topic, level, target, stageItems) {
    return {
      id: `pilot-${subject}-1`, revision: 2, subject, topic, level, target, skills: skillsBySubject[subject],
      stages: stages.map((stage, index) => ({
        ...stage,
        items: stageItems[index].map(([questionId, family, review = pendingReview]) => ({
          questionId, version: Number(questionId.split('@')[1] || 1), family,
          source: stage.evidence === 'independent' ? 'reserved' : 'workshop',
          review
        }))
      }))
    };
  }

  const entryHints = {
    english: [bi('先圈出问题中的活动和时间词，再找同时提到两者的原句。', 'Identify the event and the time clue in the question, then find the sentence that contains both.')],
    math: [bi('先让含 x 的项单独留在一边。检查等式两边是否做了同一个运算。', 'Isolate the x term first. Check that you do the same operation to both sides.'),
      bi('第一步正确。用等式右边的数除以 x 的系数，再把 x 代回原式。', 'Your first step is correct. Divide by the coefficient of x, then substitute your answer into the original equation.')],
    physics: [bi('先算从出发到到达的总用时。途中停着的时间也算在内。', 'Find the time from departure to arrival, including time spent stopped.'),
      bi('第一步正确。求全程平均速率，要用总路程除以总用时。', 'Your first step is correct. Divide the total distance by the full elapsed time.')],
    chemistry: [bi('先确定参与计算的总体积。多块样品合在一起时，把它们的体积相加。', 'First find the total volume used in the calculation. Add the volumes of the pieces.'),
      bi('第一步正确。用总质量除以总体积，核对单位是 g/cm³。', 'Your first step is correct. Divide the total mass by the total volume, in g/cm³.')],
    biology: [bi('先求真正调查了多少平方米。大小相同的样方，用数量乘单个样方的面积。', 'Find the area actually surveyed. For equal plots, multiply the number of plots by the area of one plot.'),
      bi('第一步正确。把调查到的总株数除以实际调查面积。', 'Your first step is correct. Divide the total number of plants counted by the surveyed area.')]
  };

  const routes = {
    english: makeRoute('english', 'reading', 'A1', 'text-evidence', [
      [['pilot-reading-clock-entry@2', 'time-evidence', deepSeekReview]],
      [['lesson-evidence-blue-route-1', 'time-evidence', deepSeekReview]],
      [['lesson-evidence-week-plan-3', 'time-evidence', deepSeekReview], ['lesson-evidence-lost-cap-2', 'place-evidence', deepSeekReview]],
      [['pilot-reading-clock-next@2', 'time-evidence', deepSeekReview]],
      [['pilot-reading-clock-seven@2', 'time-evidence', deepSeekReview]]
    ]),
    math: makeRoute('math', 'algebra', 'L2', 'two-step-equation', [
      [['pilot-equation-entry', 'linear-inverse', deepSeekReview]],
      [['lesson-equation-tickets-0', 'linear-inverse', deepSeekReview]],
      [['lesson-equation-ribbon-0', 'linear-inverse', deepSeekReview], ['lesson-equation-points-0', 'linear-inverse', deepSeekReview]],
      [['pilot-equation-next', 'linear-inverse', deepSeekReview]],
      [['pilot-equation-seven@2', 'linear-inverse', deepSeekReview]]
    ]),
    physics: makeRoute('physics', 'average-speed', 'L2', 'average-speed', [
      [['pilot-speed-entry', 'elapsed-add', deepSeekReview]],
      [['lesson-speed-cart-0', 'elapsed-add', deepSeekReview]],
      [['lesson-speed-runner-0', 'elapsed-add', deepSeekReview], ['lesson-speed-cyclist-0', 'elapsed-add', deepSeekReview]],
      [['pilot-speed-next', 'elapsed-add', deepSeekReview]],
      [['pilot-speed-seven', 'elapsed-subtract', deepSeekReview]]
    ]),
    chemistry: makeRoute('chemistry', 'mass-density', 'L2', 'mass-density', [
      [['pilot-density-entry', 'volume-sum', deepSeekReview]],
      [['lesson-mass-density-difference-0', 'volume-difference', deepSeekReview]],
      [['lesson-mass-density-product-0', 'volume-product', deepSeekReview], ['lesson-mass-density-sum-0', 'volume-sum', deepSeekReview]],
      [['pilot-density-next', 'volume-product', deepSeekReview]],
      [['pilot-density-seven', 'volume-difference', deepSeekReview]]
    ]),
    biology: makeRoute('biology', 'population-density', 'L2', 'population-density', [
      [['pilot-population-entry', 'area-product', deepSeekReview]],
      [['lesson-population-density-product-0', 'area-product', deepSeekReview]],
      [['lesson-population-density-sum-0', 'area-sum', deepSeekReview], ['lesson-population-density-difference-0', 'area-difference', deepSeekReview]],
      [['pilot-population-next', 'area-sum', deepSeekReview]],
      [['pilot-population-seven', 'area-difference', deepSeekReview]]
    ])
  };

  function skillPath(route) {
    const visited = new Set();
    const visiting = new Set();
    function visit(id) {
      if (visited.has(id)) return;
      if (visiting.has(id) || !Object.hasOwn(route.skills, id)) throw new Error(`Invalid prerequisite: ${id}`);
      visiting.add(id);
      for (const previous of route.skills[id].prerequisites) visit(previous);
      visiting.delete(id);
      visited.add(id);
    }
    visit(route.target);
    if (visited.size !== Object.keys(route.skills).length) throw new Error(`Unused skill in ${route.id}`);
    return [...visited].map(id => ({ id, label: route.skills[id].label }));
  }

  function sessionStage(session) {
    if (session?.mode !== 'pilot') return null;
    return routes[session.subject]?.stages.find(stage => stage.items.length === session.questionIds.length
      && stage.items.every((item, index) => item.questionId === session.questionIds[index])) || null;
  }

  function progress(state, route, now = new Date()) {
    const Core = globalThis.SmartStudyCore;
    const offsetDay = (at, offset) => {
      const date = new Date(at);
      date.setDate(date.getDate() + offset);
      return Core.localDate(date);
    };
    const today = offsetDay(now, 0);
    const completed = state.sessions.filter(session => session.subject === route.subject && session.mode === 'pilot'
      && Date.parse(session.completedAt) <= now.getTime()).sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
    const answersBySession = new Map();
    for (const attempt of state.attempts) {
      if (attempt.mode !== 'pilot') continue;
      const answers = answersBySession.get(attempt.sessionId) || new Map();
      answers.set(attempt.questionId, attempt);
      answersBySession.set(attempt.sessionId, answers);
    }
    const rows = [];
    let previousTime = -Infinity;
    let practiceAt;
    let nextCheckAt;
    for (const stage of route.stages) {
      const previousFinished = !rows.length || Boolean(rows.at(-1).session);
      let due = previousFinished && stage.day > 0 ? offsetDay(practiceAt, stage.day) : '';
      if (due && nextCheckAt) due = [due, offsetDay(nextCheckAt, 1)].sort().at(-1);
      let answers = [];
      const session = previousFinished && completed.find(session => {
        if (sessionStage(session) !== stage || Date.parse(session.completedAt) < previousTime) return false;
        const submitted = stage.items.map(({ questionId }) => answersBySession.get(session.id)?.get(questionId));
        if (submitted.some(attempt => !attempt || Date.parse(attempt.at) < previousTime
          || Date.parse(attempt.at) > Date.parse(session.completedAt)
          || (due && offsetDay(attempt.at, 0) < due)
          || (stage.evidence === 'independent' && attempt.hinted !== false))) return false;
        answers = submitted;
        return true;
      });
      rows.push({ stage, due, session: session || null, answers, ready: previousFinished && !session && (!due || due <= today) });
      if (!session) continue;
      previousTime = Date.parse(session.completedAt);
      if (stage.id === 'practice') practiceAt = session.completedAt;
      if (stage.id === 'next-day') nextCheckAt = session.completedAt;
    }
    return rows;
  }

  function start(state, catalog, route, stage, now = new Date()) {
    const Core = globalThis.SmartStudyCore;
    const ids = stage.items.map(item => item.questionId);
    const rows = progress(state, route, now);
    const index = rows.findIndex(row => row.stage === stage && row.ready);
    if (index === -1) throw new Error('Pilot stage is unavailable');
    const previousTime = index > 0 ? Date.parse(rows[index - 1].session.completedAt) : -Infinity;
    const next = Core.startSession(state, catalog, { subject: route.subject, ids, count: ids.length, mode: 'pilot', now });
    // A submitted response stays with its original session even if the learner switches to another exercise.
    const abandoned = state.attempts.find(attempt => attempt.mode === 'pilot' && ids.includes(attempt.questionId)
      && Date.parse(attempt.at) >= previousTime && Date.parse(attempt.at) <= now.getTime()
      && (!rows[index].due || Core.localDate(new Date(attempt.at)) >= rows[index].due)
      && !state.sessions.some(session => session.id === attempt.sessionId));
    if (!abandoned) return next;
    const answers = Object.fromEntries(state.attempts.filter(attempt => attempt.sessionId === abandoned.sessionId
      && ids.includes(attempt.questionId)).map(attempt => [attempt.questionId, Core.responseOf(attempt)]));
    const unanswered = ids.findIndex(id => !Object.hasOwn(answers, id));
    return { ...next, active: { ...next.active, id: abandoned.sessionId,
      answers, index: unanswered === -1 ? ids.length - 1 : unanswered } };
  }

  globalThis.EachVeyaPilot = { routes, skillPath, entryHints, sessionStage, progress, start };
})();
