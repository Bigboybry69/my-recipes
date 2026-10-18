(() => {
  const $ = selector => document.querySelector(selector);
  const model = window.CookingTimer;
  const dialog = $('#timer-dialog');
  const form = $('#timer-form');
  const chip = $('#timer-chip');
  const storageKey = 'radtion-timer';
  let timer = model.idle();
  let context;
  let alarmLoop;
  let testTimeout;
  let voices = [];
  try { timer = model.restore(JSON.parse(localStorage.getItem(storageKey))); } catch { /* Storage is optional. */ }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(timer)); } catch { /* Countdown still works for this visit. */ }
  }
  async function enableSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Audio unavailable');
      context ||= new AudioContext();
      await context.resume();
      render();
      if (timer.state === 'done') soundAlarm();
    } catch { $('#timer-sound-status').textContent = 'Sound unavailable in this browser. Watch for the red alert.'; }
  }
  function stopSound() {
    clearInterval(alarmLoop); alarmLoop = null;
    clearTimeout(testTimeout);
    voices.forEach(voice => { try { voice.stop(); } catch { /* Already stopped. */ } });
    voices = [];
  }
  function pulse() {
    if (!context || context.state !== 'running') return;
    const start = context.currentTime;
    [740, 520].forEach((frequency, i) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + i * .4);
      gain.gain.linearRampToValueAtTime(.18, start + i * .4 + .03);
      gain.gain.setValueAtTime(.18, start + i * .4 + .28);
      gain.gain.linearRampToValueAtTime(0, start + i * .4 + .36);
      oscillator.connect(gain); gain.connect(context.destination);
      voices.push(oscillator);
      oscillator.onended = () => { voices = voices.filter(v => v !== oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start + i * .4); oscillator.stop(start + i * .4 + .38);
    });
  }
  function soundAlarm() {
    if (alarmLoop || !$('#timer-sound').checked || context?.state !== 'running') return;
    pulse(); alarmLoop = setInterval(pulse, 1200);
  }
  function render() {
    const active = timer.state !== 'idle';
    const done = timer.state === 'done';
    form.hidden = active;
    $('#timer-active').hidden = !active;
    $('#timer-readout').textContent = model.format(timer.remaining);
    $('#timer-label-display').textContent = timer.label || 'COOKING TIMER';
    $('#timer-state').textContent = done ? 'TIME IS UP — CHECK YOUR FOOD!' : timer.state === 'paused' ? 'PAUSED' : 'COUNTING DOWN';
    $('#timer-pause').hidden = !['running', 'paused'].includes(timer.state);
    $('#timer-pause').textContent = timer.state === 'paused' ? 'RESUME' : 'PAUSE';
    $('#timer-stop').textContent = done ? 'DISMISS ALARM' : 'CANCEL TIMER';
    chip.hidden = !active;
    chip.textContent = done ? '⚠ TIMER FINISHED — DISMISS' : `${timer.state === 'paused' ? 'Ⅱ' : '◷'} ${model.format(timer.remaining)}`;
    document.body.classList.toggle('timer-alarm', done);
    const alert = done ? 'Cooking timer finished. Check your food.' : '';
    if ($('#timer-alert').textContent !== alert) $('#timer-alert').textContent = alert;
    $('#timer-sound-status').textContent = !$('#timer-sound').checked ? 'Sound off. Red alert still enabled.' : context?.state === 'running' ? 'Sound ready. Keep your phone volume up.' : 'Tap TEST / ENABLE SOUND to enable the alarm on this visit.';
  }
  function open(label) {
    if (timer.state === 'idle' && typeof label === 'string') form.elements.namedItem('label').value = label.slice(0, 100);
    if (!dialog.open) dialog.showModal();
  }
  function refresh() {
    const previous = timer.state;
    timer = model.tick(timer, Date.now());
    if (timer.state !== previous) save();
    if (timer.state === 'done') soundAlarm();
    render();
  }
  $('#open-timer').onclick = () => open();
  chip.onclick = () => open();
  form.onsubmit = event => {
    event.preventDefault();
    const value = name => Number(form.elements.namedItem(name).value || 0);
    const duration = (value('hours') * 3600 + value('minutes') * 60 + value('seconds')) * 1000;
    try {
      timer = model.start(duration, form.elements.namedItem('label').value, Date.now());
      $('#timer-error').textContent = ''; save(); stopSound(); enableSound(); render();
    } catch (error) { $('#timer-error').textContent = error.message; }
  };
  document.querySelectorAll('[data-timer-minutes]').forEach(button => button.onclick = () => {
    form.elements.namedItem('hours').value = 0;
    form.elements.namedItem('minutes').value = button.dataset.timerMinutes;
    form.elements.namedItem('seconds').value = 0;
  });
  $('#timer-pause').onclick = () => {
    timer = timer.state === 'paused' ? model.resume(timer, Date.now()) : model.pause(timer, Date.now());
    save(); enableSound(); refresh();
  };
  $('#timer-stop').onclick = () => { timer = model.idle(); save(); stopSound(); render(); };
  $('#timer-test').onclick = async () => {
    await enableSound();
    if (timer.state !== 'done') { stopSound(); pulse(); testTimeout = setTimeout(stopSound, 1000); }
  };
  $('#timer-sound').onchange = () => {
    if (!$('#timer-sound').checked) stopSound();
    else enableSound();
    render();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('pageshow', refresh);
  window.RadtionTimer = { open, isActive: () => timer.state !== 'idle' };
  refresh();
  setInterval(refresh, 250);
})();
