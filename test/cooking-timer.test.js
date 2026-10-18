const test = require('node:test');
const assert = require('node:assert/strict');
const timer = require('../public/cooking-timer');

test('deadline catches up after suspension and survives a reload', () => {
  const started = timer.start(300000, 'Pasta', 1000);
  const restored = timer.restore(JSON.parse(JSON.stringify(started)));
  assert.equal(timer.tick(restored, 121000).remaining, 180000);
  assert.equal(timer.tick(restored, 400000).state, 'done');
  assert.equal(timer.tick(restored, 400000).remaining, 0);
});
test('pause freezes remaining time; resume establishes a new deadline', () => {
  const paused = timer.pause(timer.start(60000, 'Sauce', 1000), 21000);
  assert.equal(paused.remaining, 40000);
  assert.equal(timer.tick(paused, 900000).remaining, 40000);
  const resumed = timer.resume(timer.restore(paused), 900000);
  assert.equal(timer.tick(resumed, 939000).remaining, 1000);
  assert.equal(timer.pause(resumed, 940000).state, 'done');
});
test('rejects invalid durations and damaged saved state; rounds up the readout', () => {
  for (const ms of [0, -1, NaN, Infinity, 86400001]) assert.throws(() => timer.start(ms, '', 0));
  for (const value of [null, {}, {state:'running', remaining:1000, endAt:0}, {state:'paused', remaining:-5, endAt:1}]) assert.equal(timer.restore(value).state, 'idle');
  assert.equal(timer.format(61001), '00:01:02');
  assert.equal(timer.format(3600000), '01:00:00');
});
