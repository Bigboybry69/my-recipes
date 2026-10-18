/* Wall-clock deadlines survive background tabs and page reloads. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.CookingTimer = model;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const idle = () => ({ state: 'idle', remaining: 0, endAt: 0, label: '' });
  function restore(value) {
    if (!value || !['running', 'paused', 'done'].includes(value.state) ||
        !Number.isFinite(value.remaining) || value.remaining < 0 || value.remaining > 86400000 ||
        !Number.isFinite(value.endAt) || value.endAt < 0 ||
        (value.state === 'running' && value.endAt === 0)) return idle();
    return { state: value.state, remaining: value.remaining, endAt: value.endAt,
      label: typeof value.label === 'string' ? value.label.slice(0, 100) : '' };
  }
  function tick(timer, now) {
    if (timer.state !== 'running') return timer;
    const remaining = Math.max(0, timer.endAt - now);
    return { ...timer, remaining, state: remaining ? 'running' : 'done' };
  }
  function start(milliseconds, label, now) {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > 86400000) throw new Error('Choose a time between 1 second and 24 hours.');
    return { state: 'running', remaining: milliseconds, endAt: now + milliseconds, label: String(label || '').slice(0, 100) };
  }
  function pause(timer, now) {
    const current = tick(timer, now);
    return current.state === 'running' ? { ...current, state: 'paused' } : current;
  }
  function resume(timer, now) {
    return timer.state === 'paused' ? { ...timer, state: 'running', endAt: now + timer.remaining } : timer;
  }
  function format(ms) {
    const seconds = Math.ceil(Math.max(0, ms) / 1000);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
  }
  return { idle, restore, tick, start, pause, resume, format };
});
