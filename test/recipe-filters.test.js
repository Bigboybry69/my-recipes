const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { proteins, recipeProteins, recipeTags, matchesRecipe } = require('../public/recipe-filters');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/recipes.js'), 'utf8'), context);
const recipes = context.window.GATHER_RECIPES;
const byId = id => recipes.find(recipe => recipe.id === id);
test('mixed protein dishes appear under each relevant protein without duplicates', () => {
  const pasta = byId('creamy-cajun-shrimp-chicken-pasta');
  assert.equal(matchesRecipe(pasta, 'Chicken', ''), true);
  assert.equal(matchesRecipe(pasta, 'Seafood', ''), true);
  assert.equal(matchesRecipe(pasta, 'Beef', ''), false);
  assert.equal(matchesRecipe(byId('adana-kebab'), 'Lamb', ''), true);
  assert.equal(matchesRecipe(byId('adana-kebab'), 'Beef', ''), true);
  assert.equal(recipes.filter(recipe => matchesRecipe(recipe, 'All proteins', '')).length, recipes.length);
});
test('protein filters combine with Chinese and English ingredient searches', () => {
  const ribs = byId('orange-glazed-pork-ribs');
  assert.equal(matchesRecipe(ribs, 'Pork', '柳丁'), true);
  assert.equal(matchesRecipe(ribs, 'Pork', 'sweet potato starch'), true);
  assert.equal(matchesRecipe(ribs, 'Beef', '柳丁'), false);
  assert.equal(matchesRecipe(ribs, 'All proteins', 'pork'), true);
});
test('every recipe has valid tags; unknown ground meat is not assumed to be beef', () => {
  for (const recipe of recipes) {
    assert.ok(recipeTags(recipe).length > 0, recipe.id);
    assert.ok(recipe.proteins.every(tag => proteins.includes(tag)), recipe.id);
  }
  assert.deepEqual(recipeProteins(byId('emre-adana-kebap-lavas')), ['Ground Meat']);
  assert.equal(matchesRecipe(byId('emre-adana-kebap-lavas'), 'Beef', ''), false);
  assert.deepEqual(recipeProteins({}), ['Other']);
});

test('Ben’s pie crust is a dessert, without a protein classification', () => {
  const crust = byId('butter-pie-crust');
  assert.equal(crust.ownerId, 'ben');
  assert.equal(crust.yield, '2 crusts');
  assert.deepEqual(recipeProteins(crust), []);
  assert.deepEqual(recipeTags(crust), ['Dessert']);
  assert.equal(matchesRecipe(crust, 'Dessert', 'butter'), true);
  assert.equal(matchesRecipe(crust, 'Chicken', ''), false);
  assert.equal(matchesRecipe(crust, 'All recipes', 'pie crust'), true);
});
