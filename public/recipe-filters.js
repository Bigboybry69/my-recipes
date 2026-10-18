(function (root) {
  const proteins = ['Beef', 'Pork', 'Chicken', 'Seafood', 'Lamb', 'Ground Meat', 'Vegetarian', 'Other'];
  const categories = ['Dessert'];
  const filterOptions = [...proteins, ...categories];
  function recipeCategories(recipe) { return (recipe.categories || []).filter(tag => categories.includes(tag)); }
  function recipeProteins(recipe) {
    const tags = (recipe.proteins || []).filter(tag => proteins.includes(tag));
    return tags.length ? [...new Set(tags)] : recipeCategories(recipe).length ? [] : ['Other'];
  }
  function recipeTags(recipe) { return [...new Set([...recipeProteins(recipe), ...recipeCategories(recipe)])]; }
  function matchesRecipe(recipe, protein, query) {
    const tags = recipeTags(recipe);
    const text = [recipe.title, recipe.description || '', ...(recipe.searchTerms || []), ...recipe.ingredients, ...tags].join(' ').toLowerCase();
    return (protein === 'All recipes' || protein === 'All proteins' || tags.includes(protein)) && text.includes(query.trim().toLowerCase());
  }
  const api = { proteins, categories, filterOptions, recipeProteins, recipeTags, matchesRecipe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RecipeFilters = api;
})(typeof window !== 'undefined' ? window : globalThis);
