const { test } = require('node:test');
const assert = require('node:assert/strict');
const { recipeStats, collectionStats, healthCycle, healthState } = require('../public/recipe-stats');
const simple = { ingredients: Array(6).fill('ingredient'), steps: Array(5).fill('mix and cook') };
test('complexity scales with ingredients, steps, and advanced techniques', () => {
  assert.deepEqual(recipeStats(simple), { complexity: 3, hp: 30, xp: 75 });
  assert.equal(recipeStats({ ingredients: ['rice'], steps: ['Boil'] }).complexity, 1);
  const complex = recipeStats({ ingredients: Array(20).fill('ingredient'), steps: Array(20).fill('knead and temper') });
  assert.deepEqual(complex, { complexity: 10, hp: 100, xp: 250 });
});
test('collection XP levels up and does not depend on browser activity', () => {
  assert.deepEqual(collectionStats([]), { total: 0, level: 1, progress: 0, next: 200, maxHP: 100 });
  assert.deepEqual(collectionStats([simple, simple]), { total: 150, level: 1, progress: 150, next: 200, maxHP: 100 });
  assert.deepEqual(collectionStats([simple, simple, simple]), { total: 225, level: 2, progress: 25, next: 200, maxHP: 105 });
  assert.equal(collectionStats(Array(8).fill(simple)).maxHP, 115);
});
test('HP respects the floor, level maximum, and percentage-based warning thresholds', () => {
  assert.equal(healthState(0, 0, 100).hp, 18);
  assert.equal(healthState(1, 0, 105).hp, 18);
  assert.equal(healthState(100, 30, 105).hp, 105);
  assert.equal(healthState(50, 0, 100).state, 'normal');
  assert.equal(healthState(49, 0, 100).state, 'warning');
  assert.equal(healthState(30, 0, 100).state, 'warning');
  assert.equal(healthState(29, 0, 100).state, 'critical');
  assert.equal(healthState(0, 35, 105).state, 'normal');
  assert.equal(healthState(0, 0, 105).state, 'critical');
  assert.equal(healthState(0, 30, 100).hp, 48);
});
test('overnight health cycles share the next breakfast date', () => {
  assert.equal(healthCycle(new Date(2026, 9, 17, 23), { name: 'BREAKFAST' }), healthCycle(new Date(2026, 9, 18, 1), { name: 'BREAKFAST' }));
  assert.notEqual(healthCycle(new Date(2026, 9, 18, 12), { name: 'LUNCH' }), healthCycle(new Date(2026, 9, 18, 13), { name: 'DINNER' }));
});
