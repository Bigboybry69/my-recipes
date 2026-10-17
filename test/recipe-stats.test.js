const { test } = require('node:test');
const assert = require('node:assert/strict');
const { recipeStats, collectionStats, healthCycle } = require('../public/recipe-stats');
const simple = { ingredients: Array(6).fill('ingredient'), steps: Array(5).fill('mix and cook') };
test('complexity scales with ingredients, steps, and advanced techniques', () => {
  assert.deepEqual(recipeStats(simple), { complexity: 3, hp: 30, xp: 75 });
  assert.equal(recipeStats({ ingredients: ['rice'], steps: ['Boil'] }).complexity, 1);
  const complex = recipeStats({ ingredients: Array(20).fill('ingredient'), steps: Array(20).fill('knead and temper') });
  assert.deepEqual(complex, { complexity: 10, hp: 100, xp: 250 });
});
test('collection XP levels up and does not depend on browser activity', () => {
  assert.deepEqual(collectionStats([]), { total: 0, level: 1, progress: 0, next: 100 });
  assert.deepEqual(collectionStats([simple, simple]), { total: 150, level: 2, progress: 50, next: 100 });
});
test('overnight health cycles share the next breakfast date', () => {
  assert.equal(healthCycle(new Date(2026, 9, 17, 23), { name: 'BREAKFAST' }), healthCycle(new Date(2026, 9, 18, 1), { name: 'BREAKFAST' }));
  assert.notEqual(healthCycle(new Date(2026, 9, 18, 12), { name: 'LUNCH' }), healthCycle(new Date(2026, 9, 18, 13), { name: 'DINNER' }));
});
