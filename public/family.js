(function (root) {
  const members = [
    { id: 'dan', name: 'Dan', role: 'THE ORIGINAL COOK', image: './radtion-cook.png' },
    { id: 'demi', name: 'Demi', role: 'WASTELAND BAKER', image: './demi.png' },
    { id: 'stu', name: 'Stu', role: 'GRILL SPECIALIST', image: './stu.png' },
    { id: 'zoe', name: 'Zoe', role: 'WASTELAND HOME COOK', image: './zoe.png' }
  ];
  function recipesFor(recipes, memberId) {
    return recipes.filter(recipe => (recipe.ownerId || 'dan') === memberId);
  }
  const api = { members, recipesFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Family = api;
})(typeof window !== 'undefined' ? window : globalThis);
