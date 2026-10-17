(function (root) {
  function recipeStats(recipe) {
    const instructions = recipe.steps.join(' ').toLowerCase();
    const advanced = ['knead', 'temper', 'laminate', 'caramelize', 'deep-fry', 'ferment', 'sous vide'].filter(word => instructions.includes(word)).length;
    const complexity = Math.min(10, 1 + Math.floor(recipe.ingredients.length / 5) + Math.floor(recipe.steps.length / 4) + advanced);
    return { complexity, hp: complexity * 10, xp: complexity * 25 };
  }
  function collectionStats(recipes) {
    const total = recipes.reduce((sum, recipe) => sum + recipeStats(recipe).xp, 0);
    return { total, level: 1 + Math.floor(total / 100), progress: total % 100, next: 100 };
  }
  function healthCycle(now, meal) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (meal.name === 'BREAKFAST' && now.getHours() * 60 + now.getMinutes() > 450) target.setDate(target.getDate() + 1);
    return `${target.getFullYear()}-${target.getMonth() + 1}-${target.getDate()}-${meal.name}`;
  }
  const api = { recipeStats, collectionStats, healthCycle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RecipeStats = api;
})(typeof window !== 'undefined' ? window : globalThis);
