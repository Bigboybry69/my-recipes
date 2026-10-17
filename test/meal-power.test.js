const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mealPower } = require('../public/meal-power');
const at = (hours, minutes) => mealPower(new Date(2026, 9, 17, hours, minutes));

test('energy reaches zero at each scheduled local mealtime', () => {
  for (const [hours, name] of [[7, 'BREAKFAST'], [12, 'LUNCH'], [18, 'DINNER']]) {
    const state = at(hours, 30);
    assert.equal(state.percent, 0);
    assert.equal(state.remaining, 0);
    assert.equal(state.name, name);
    assert.equal(at(hours, 29).percent, 1);
    assert.equal(at(hours, 31).percent, 100);
  }
});

test('energy drains between meals and wraps correctly across midnight', () => {
  assert.equal(at(10, 0).percent, 50);
  assert.equal(at(15, 30).percent, 50);
  assert.equal(at(1, 0).percent, 50);
  assert.equal(at(23, 0).name, 'BREAKFAST');
  assert.equal(at(0, 0).name, 'BREAKFAST');
  assert.equal(at(0, 0).remaining, 450);
  assert.ok(at(8, 0).percent > at(11, 0).percent);
  assert.ok(at(23, 59).percent >= at(0, 0).percent);
});
