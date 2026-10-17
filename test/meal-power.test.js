const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mealPower } = require('../public/meal-power');
const at = (hours, minutes) => mealPower(new Date(2026, 9, 17, hours, minutes));
test('health waits a full hour after each meal before refilling', () => {
  for (const [hours, name] of [[7, 'BREAKFAST'], [12, 'LUNCH'], [18, 'DINNER']]) {
    for (const [h, m, remaining] of [[hours, 30, 60], [hours, 31, 59], [hours + 1, 29, 1]]) {
      const state = at(h, m);
      assert.equal(state.percent, 0);
      assert.equal(state.recovering, true);
      assert.equal(state.refillRemaining, remaining);
      assert.equal(state.name, name);
    }
    assert.equal(at(hours, 29).percent, 1);
    assert.equal(at(hours + 1, 30).percent, 100);
    assert.equal(at(hours + 1, 30).recovering, false);
  }
});
test('health drains from the previous refill and wraps across midnight', () => {
  assert.equal(at(10, 30).percent, 50);
  assert.equal(at(16, 0).percent, 50);
  assert.equal(at(1, 30).percent, 50);
  assert.equal(at(23, 0).name, 'BREAKFAST');
  assert.equal(at(0, 0).remaining, 450);
  assert.ok(at(23, 59).percent >= at(0, 0).percent);
});
