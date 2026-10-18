const { test } = require('node:test');
const assert = require('node:assert/strict');
const { members, recipesFor } = require('../public/family');
const { collectionStats } = require('../public/recipe-stats');
test('family cookbooks are individually assigned and keep separate XP', () => {
  assert.deepEqual(members.map(member => member.name), ['Dan', 'Demi', 'Stu']);
  const sample = { ingredients: Array(6).fill('ingredient'), steps: Array(5).fill('mix') };
  const recipes = [{ ...sample, id: 'old' }, { ...sample, id: 'new', ownerId: 'demi' }];
  assert.deepEqual(recipesFor(recipes, 'dan').map(recipe => recipe.id), ['old']);
  assert.deepEqual(recipesFor(recipes, 'demi').map(recipe => recipe.id), ['new']);
  assert.deepEqual(recipesFor(recipes, 'stu'), []);
  assert.equal(collectionStats(recipesFor(recipes, 'demi')).total, 75);
  assert.equal(collectionStats(recipesFor(recipes, 'stu')).total, 0);
});
