const { test } = require('node:test');
const assert = require('node:assert/strict');
const { recipeStats, collectionStats, healthState } = require('../public/recipe-stats');
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
test('English and Chinese instructions receive the same technique score', () => {
  const base = { ingredients: Array(14).fill('食材') };
  const english = recipeStats({ ...base, steps: Array(5).fill('deep-fry until golden') });
  const chinese = recipeStats({ ...base, steps: Array(5).fill('將排骨油炸至金黃') });
  const bilingual = recipeStats({ ...base, steps: Array(5).fill('deep-fry 將排骨油炸至金黃') });
  assert.equal(chinese.complexity, 5);
  assert.deepEqual(chinese, english);
  assert.deepEqual(bilingual, english);
});
test('HP respects the floor, level maximum, and percentage-based warning thresholds', () => {
  assert.equal(healthState(0, 100).hp, 18);
  assert.equal(healthState(1, 105).hp, 18);
  assert.equal(healthState(100, 105).hp, 105);
  assert.equal(healthState(50, 100).state, 'normal');
  assert.equal(healthState(49, 100).state, 'warning');
  assert.equal(healthState(30, 100).state, 'warning');
  assert.equal(healthState(29, 100).state, 'critical');
  assert.equal(healthState(0, 105).state, 'critical');
});
