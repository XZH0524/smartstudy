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

  globalThis.EachVeyaPilot = { routes, skillPath };
})();
