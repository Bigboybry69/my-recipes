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
  function healthState(percent, bonus, maxHP) {
    const base = Math.max(18, Math.round(maxHP * Math.max(0, Math.min(100, percent)) / 100));
    const hp = Math.min(maxHP, base + Math.max(0, bonus));
    const ratio = hp / maxHP;
    return { hp, maxHP, percent: ratio * 100, state: ratio < 0.3 ? 'critical' : ratio < 0.5 ? 'warning' : 'normal' };
  }
  function healthCycle(now, meal) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (meal.name === 'BREAKFAST' && now.getHours() * 60 + now.getMinutes() > 450) target.setDate(target.getDate() + 1);
    return `${target.getFullYear()}-${target.getMonth() + 1}-${target.getDate()}-${meal.name}`;
  }
  const api = { recipeStats, collectionStats, healthCycle, healthState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RecipeStats = api;
})(typeof window !== 'undefined' ? window : globalThis);
