(function (root) {
  function recipeStats(recipe) {
    const instructions = recipe.steps.join(' ').toLowerCase();
    const advanced = ['knead', 'temper', 'laminate', 'caramelize', 'deep-fry', 'ferment', 'sous vide'].filter(word => instructions.includes(word)).length;
    const complexity = Math.min(10, 1 + Math.floor(recipe.ingredients.length / 5) + Math.floor(recipe.steps.length / 4) + advanced);
    return { complexity, hp: complexity * 10, xp: complexity * 25 };
  }
  function collectionStats(recipes) {
    const total = recipes.reduce((sum, recipe) => sum + recipeStats(recipe).xp, 0);
    const level = 1 + Math.floor(total / 200);
    return { total, level, progress: total % 200, next: 200, maxHP: 100 + (level - 1) * 5 };
  }
  function healthState(percent, maxHP) {
    const base = Math.max(18, Math.round(maxHP * Math.max(0, Math.min(100, percent)) / 100));
    const hp = Math.min(maxHP, base);
    const ratio = hp / maxHP;
    return { hp, maxHP, percent: ratio * 100, state: ratio < 0.3 ? 'critical' : ratio < 0.5 ? 'warning' : 'normal' };
  }
  const api = { recipeStats, collectionStats, healthState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RecipeStats = api;
})(typeof window !== 'undefined' ? window : globalThis);
