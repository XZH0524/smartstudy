(function () {
  'use strict';
  const key = 'eachveya.answer-sound';
  let enabled = true;
  let context;
  try { enabled = localStorage.getItem(key) !== 'off'; } catch (_) { /* Storage is optional. */ }

  function setEnabled(value) {
    enabled = Boolean(value);
    try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch (_) { /* Use this tab's setting. */ }
  }

  async function play(correct) {
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!enabled || !Audio) return;
    try {
      context ||= new Audio();
      if (context.state !== 'running') await context.resume();
      if (!enabled || context.state !== 'running') return;
      const at = context.currentTime + 0.01;
      const length = correct ? 0.18 : 0.12;
      const gain = context.createGain();
      const tone = context.createOscillator();
      tone.type = correct ? 'sine' : 'triangle';
      tone.frequency.setValueAtTime(correct ? 690 : 175, at);
      tone.frequency.exponentialRampToValueAtTime(correct ? 990 : 65, at + (correct ? 0.065 : 0.09));
      gain.gain.setValueAtTime(0.001, at);
      gain.gain.linearRampToValueAtTime(correct ? 0.065 : 0.046, at + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.001, at + length);
      tone.connect(gain);
      gain.connect(context.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(at);
      tone.stop(at + length);
    } catch (_) { /* Grading works when audio is unavailable. */ }
  }

  globalThis.EachVeyaSound = { enabled: () => enabled, setEnabled, play };
})();
