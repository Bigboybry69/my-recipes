(() => {
  const $ = selector => document.querySelector(selector);
  const model = window.CookingTimer;
  const dialog = $('#timer-dialog');
  const form = $('#timer-form');
  const chip = $('#timer-chip');
  const storageKey = 'radtion-timer';
  let timer = model.idle();
  let context;
  let alarmSource;
  let audioBuffer;
  let audioLoad;
  let soundError = false;
  let testTimeout;
  try { timer = model.restore(JSON.parse(localStorage.getItem(storageKey))); } catch { /* Storage is optional. */ }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(timer)); } catch { /* Countdown still works for this visit. */ }
  }
  async function enableSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Audio unavailable');
      context ||= new AudioContext();
      // Resume directly from the tap so mobile browsers can unlock audio.
      const resumed = context.resume();
      if (!audioLoad) {
        audioLoad = fetch('./incident-alarm.mp3').then(response => {
          if (!response.ok) throw new Error('Alarm could not load');
          return response.arrayBuffer();
        }).then(bytes => context.decodeAudioData(bytes)).then(buffer => { audioBuffer = buffer; })
          .catch(error => { audioLoad = null; throw error; });
      }
      await Promise.all([resumed, audioLoad]);
      soundError = false;
      render();
      if (timer.state === 'done') soundAlarm();
    } catch {
      soundError = true;
      render();
    }
  }
  function stopSound() {
    clearTimeout(testTimeout);
    if (alarmSource) {
      alarmSource.stop();
      alarmSource.disconnect();
      alarmSource = null;
    }
  }
  function playAudio() {
    if (alarmSource || !audioBuffer || context?.state !== 'running') return;
    alarmSource = context.createBufferSource();
    alarmSource.buffer = audioBuffer;
    alarmSource.loop = true;
    alarmSource.connect(context.destination);
    alarmSource.start();
  }
  function soundAlarm() {
    if (!$('#timer-sound').checked) return;
    clearTimeout(testTimeout);
    playAudio();
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
    $('#timer-sound-status').textContent = !$('#timer-sound').checked ? 'Sound off. Red alert still enabled.' : soundError ? 'Could not load alarm. Tap TEST / ENABLE SOUND to retry online. Red alert is still enabled.' : context?.state === 'running' && audioBuffer ? 'Sound ready. Keep your phone volume up.' : 'Tap TEST / ENABLE SOUND to enable the alarm on this visit.';
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
    if (timer.state !== 'done' && $('#timer-sound').checked) { stopSound(); playAudio(); testTimeout = setTimeout(stopSound, 3000); }
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
