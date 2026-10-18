(function (root) {
  const proteins = ['Beef', 'Pork', 'Chicken', 'Seafood', 'Lamb', 'Ground Meat', 'Vegetarian', 'Other'];
  function recipeProteins(recipe) {
    const tags = (recipe.proteins || []).filter(tag => proteins.includes(tag));
    return tags.length ? [...new Set(tags)] : ['Other'];
  }
  function matchesRecipe(recipe, protein, query) {
    const tags = recipeProteins(recipe);
    const text = [recipe.title, recipe.description || '', ...(recipe.searchTerms || []), ...recipe.ingredients, ...tags].join(' ').toLowerCase();
    return (protein === 'All proteins' || tags.includes(protein)) && text.includes(query.trim().toLowerCase());
  }
  const api = { proteins, recipeProteins, matchesRecipe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RecipeFilters = api;
})(typeof window !== 'undefined' ? window : globalThis);
