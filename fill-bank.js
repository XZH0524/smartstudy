(function () {
  'use strict';
  const { questions, bilingual: bi } = globalThis.SmartStudyData;
  const checks = new Map();

  function numeric(subject, topic, level, family, unit, recipe, equationFamily) {
    for (let i = 0; i < 10; i++) {
      const id = `fill-${subject}-${family}-${i + 1}`;
      const { prompt, hint, explanation, expected, verify } = recipe(i);
      if (!(Number.isSafeInteger(expected) || /^-?\d+\/[1-9]\d*$/.test(expected))
        || !verify(typeof expected === 'number' ? expected : Number(expected.split('/')[0]) / Number(expected.split('/')[1]))) {
        throw new Error('Invalid checked answer for ' + id);
      }
      const englishUnit = ({ 元: 'yuan', 次: 'visits', 倍: '', '株/m²': 'plants/m²' })[unit] ?? unit;
      const label = bi(`答案 = □ ${unit}`.trimEnd(), `Answer = □ ${englishUnit}`.trimEnd());
      const science = globalThis.EachVeyaScience.topics[topic];
      questions.push({ id, subject, topic, level, format: 'fill', skill: 'calculation', curriculumRefs: [],
        prompt, hint, explanation, fields: [{ label, expected }], ...(equationFamily ? { equationFamily } : {}),
        ...(science ? { domain: science.domain, role: 'practice', focus: [topic], errorKinds: {} } : {}) });
      checks.set(id, verify);
    }
  }

  function english(topic, level, family, rows, wording) {
    rows.trim().split('\n').forEach((line, index) => {
      const [sentence, answerList, reasonZh, reasonEn] = line.trim().split('|');
      const [expected, ...accepted] = answerList.split('/');
      if (!sentence.includes('___') || !expected || !reasonZh || !reasonEn) throw new Error('Incomplete English fill question');
      questions.push({
        id: `fill-english-${family}-${index + 1}`, subject: 'english', topic, level, track: 'cefr', format: 'fill',
        prompt: bi(wording.zh + '\n' + sentence, wording.en + '\n' + sentence),
        fields: [{ type: 'text', label: bi('答案 = □', 'Answer = □'), expected, ...(accepted.length ? { accepted } : {}) }],
        explanation: bi(reasonZh, reasonEn)
      });
    });
  }

  globalThis.EachVeyaFillBank = { numeric, english, checks };
})();
