const $ = (selector) => document.querySelector(selector);
const initialRecipes = [
  { id: 'lemon-pasta', title: 'Creamy lemon pasta', category: 'Dinner', time: 25, servings: 2, emoji: '🍝', color: '#ede8d6', description: 'Bright, buttery, and a little bit indulgent. Your new weeknight favorite.', ingredients: ['200 g spaghetti', '2 tbsp butter', '1 lemon, zest and juice', '½ cup heavy cream', '¼ cup grated Parmesan', 'Salt and black pepper'], steps: ['Bring a large pot of salted water to a boil. Cook spaghetti according to package directions, reserving ½ cup pasta water before draining.', 'Melt butter in a skillet over medium-low heat. Stir in lemon zest and cream; simmer gently for 2 minutes.', 'Add spaghetti, lemon juice, and Parmesan. Toss with a splash of pasta water until glossy. Season to taste and serve.'] },
  { id: 'avocado-toast', title: 'The perfect avocado toast', category: 'Breakfast', time: 10, servings: 1, emoji: '🥑', color: '#e1e8d7', description: 'Crispy sourdough, creamy avocado, and a sunny start to your day.', ingredients: ['2 slices sourdough bread', '1 ripe avocado', '1 tbsp lemon juice', '1 tsp olive oil', 'Chili flakes', 'Salt and black pepper'], steps: ['Toast the sourdough until golden and crisp.', 'Mash avocado with lemon juice, salt, and pepper.', 'Spread onto toast. Drizzle with olive oil and sprinkle with chili flakes.'] },
  { id: 'summer-salad', title: 'Everyday Mediterranean salad', category: 'Lunch', time: 15, servings: 2, emoji: '🥗', color: '#ebded0', description: 'A colorful bowl of fresh crunch, salty feta, and sunshine.', ingredients: ['1 cucumber, chopped', '2 tomatoes, chopped', '½ red onion, sliced', '½ cup feta cheese', '¼ cup Kalamata olives', '2 tbsp olive oil', '1 tbsp red wine vinegar', '½ tsp dried oregano'], steps: ['Combine cucumber, tomatoes, red onion, and olives in a bowl.', 'Whisk olive oil, vinegar, and oregano together. Toss with the vegetables.', 'Top with crumbled feta and serve.'] },
  { id: 'pancakes', title: 'Slow Sunday pancakes', category: 'Breakfast', time: 20, servings: 4, emoji: '🥞', color: '#efe0ca', description: 'Fluffy, golden stacks made for unhurried mornings.', ingredients: ['1½ cups all-purpose flour', '2 tbsp sugar', '2 tsp baking powder', '¼ tsp salt', '1¼ cups milk', '1 egg', '3 tbsp melted butter', 'Maple syrup, to serve'], steps: ['Whisk flour, sugar, baking powder, and salt in a bowl.', 'Mix milk, egg, and melted butter separately, then fold into the dry ingredients until just combined.', 'Heat a lightly buttered skillet over medium heat. Pour ¼ cup batter for each pancake. Flip when bubbles appear and cook until golden.', 'Serve warm with maple syrup.'] },
  { id: 'cookies', title: 'Chocolate chunk cookies', category: 'Dessert', time: 30, servings: 12, emoji: '🍪', color: '#e6d7c3', description: 'Crisp edges, soft centers, and plenty of chocolate in every bite.', ingredients: ['½ cup softened butter', '¾ cup brown sugar', '1 egg', '1 tsp vanilla extract', '1¼ cups all-purpose flour', '½ tsp baking soda', '¼ tsp salt', '1 cup chocolate chunks'], steps: ['Heat oven to 350°F (175°C). Line a baking tray with parchment paper.', 'Beat butter and sugar until fluffy. Mix in egg and vanilla.', 'Stir in flour, baking soda, and salt, then fold in chocolate chunks.', 'Scoop 12 portions onto the tray, leaving space between them. Bake for 10–12 minutes, until edges are golden. Cool on the tray for 5 minutes.'] },
  { id: 'tacos', title: 'Weeknight veggie tacos', category: 'Dinner', time: 25, servings: 3, emoji: '🌮', color: '#e7ead6', description: 'Big flavor, simple ingredients. A fresh take on taco night.', ingredients: ['6 small tortillas', '1 can black beans, drained', '1 bell pepper, sliced', '1 small onion, sliced', '1 tbsp olive oil', '1 tsp ground cumin', '1 avocado, sliced', '1 lime', 'Fresh cilantro'], steps: ['Heat olive oil in a skillet. Add onion and bell pepper; cook for 7–8 minutes until tender.', 'Add beans and cumin with a splash of water. Cook for 5 minutes and season to taste.', 'Warm tortillas, fill with vegetables and beans, and top with avocado, lime juice, and cilantro.'] }
];
let storageAvailable = true;
function read(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { storageAvailable = false; return fallback; }
}
function validRecipe(r) { return r && typeof r.id === 'string' && typeof r.title === 'string' && typeof r.category === 'string' && Number.isFinite(r.time) && r.time > 0 && Number.isFinite(r.servings) && r.servings > 0 && Array.isArray(r.ingredients) && r.ingredients.length > 0 && r.ingredients.every(i => typeof i === 'string') && Array.isArray(r.steps) && r.steps.length > 0 && r.steps.every(i => typeof i === 'string'); }
const storedRecipes = read('gather-recipes', null);
let recipes = Array.isArray(storedRecipes) && storedRecipes.every(validRecipe) ? storedRecipes : structuredClone(initialRecipes);
let shopping = read('gather-shopping', []);
if (!Array.isArray(shopping) || !shopping.every(i => i && typeof i.id === 'string' && typeof i.text === 'string')) shopping = [];
let category = 'All recipes';
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3300); }
function save() { try { localStorage.setItem('gather-recipes', JSON.stringify(recipes)); localStorage.setItem('gather-shopping', JSON.stringify(shopping)); return true; } catch { storageAvailable = false; toast('Browser storage is unavailable or full. Back up your recipes before leaving.'); return false; } }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const emojis = { Dinner: '🍲', Lunch: '🥗', Breakfast: '🥞', Dessert: '🍰', Snacks: '🥨' };
function renderRecipes() {
  const query = $('#search').value.trim().toLowerCase();
  const filtered = recipes.filter(r => (category === 'All recipes' || r.category === category) && [r.title, r.description || '', ...r.ingredients].join(' ').toLowerCase().includes(query));
  $('#recipe-count').textContent = `${recipes.length} recipes to love`;
  $('#categories').replaceChildren(...['All recipes', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'].map(name => {
    const button = document.createElement('button'); button.className = 'chip' + (name === category ? ' active' : ''); button.textContent = name; button.setAttribute('aria-pressed', name === category); button.onclick = () => { category = name; renderRecipes(); }; return button;
  }));
  $('#recipe-grid').replaceChildren(...filtered.map(recipe => {
    const card = document.createElement('article'); card.className = 'recipe-card';
    const artwork = document.createElement('button'); artwork.className = 'card-image'; artwork.style.width = '100%'; artwork.style.setProperty('--card-bg', /^#[a-fA-F0-9]{6}$/.test(recipe.color || '') ? recipe.color : '#e5eadb'); artwork.setAttribute('aria-label', `View ${recipe.title}`);
    artwork.innerHTML = `<span class="category-tag">${escapeHTML(recipe.category)}</span><span class="food-emoji" aria-hidden="true">${escapeHTML(recipe.emoji || emojis[recipe.category] || '🍽️')}</span>`; artwork.onclick = () => showRecipe(recipe.id);
    const body = document.createElement('div'); body.className = 'card-body';
    body.innerHTML = `<button class="card-title">${escapeHTML(recipe.title)}</button><p>${escapeHTML(recipe.description || 'A favorite from your personal cookbook.')}</p><div class="card-bottom"><div class="metadata"><span>◷ ${recipe.time} min</span><span>♧ ${recipe.servings} servings</span></div><button class="add-list">＋ Shopping list</button></div>`;
    body.querySelector('.card-title').onclick = () => showRecipe(recipe.id); body.querySelector('.add-list').onclick = () => addRecipeToList(recipe);
    card.append(artwork, body); return card;
  }));
  $('#empty').hidden = filtered.length > 0;
}
function addRecipeToList(recipe) {
  let count = 0;
  recipe.ingredients.forEach(text => {
    if (!shopping.some(item => item.text.trim().toLowerCase() === text.trim().toLowerCase() && item.sourceId === recipe.id)) { shopping.push({ id: crypto.randomUUID(), text, source: recipe.title, sourceId: recipe.id, checked: false }); count++; }
  });
  save(); renderShopping(); toast(count ? `${count} ingredients added to your shopping list` : 'These ingredients are already on your list');
}
function showRecipe(id) {
  const r = recipes.find(recipe => recipe.id === id); if (!r) return;
  $('#recipe-detail').innerHTML = `<div class="detail-food" aria-hidden="true">${escapeHTML(r.emoji || emojis[r.category] || '🍽️')}</div><h2>${escapeHTML(r.title)}</h2><div class="detail-meta"><span>${escapeHTML(r.category)}</span><span>◷ ${r.time} minutes</span><span>${r.servings} servings</span></div><p>${escapeHTML(r.description || '')}</p><h3 class="detail-section">Ingredients</h3>${r.ingredients.map(i => `<label class="ingredient"><input type="checkbox"><span>${escapeHTML(i)}</span></label>`).join('')}<h3 class="detail-section">Let’s make it</h3><ol class="steps">${r.steps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ol><div class="detail-actions"><button class="primary" id="detail-shop">＋ Add ingredients to shopping list</button><button class="secondary" id="edit-recipe">Edit recipe</button><button class="text-button" id="delete-recipe">Delete recipe</button></div>`;
  $('#detail-shop').onclick = () => addRecipeToList(r);
  $('#edit-recipe').onclick = () => { $('#recipe-dialog').close(); openForm(r); };
  $('#delete-recipe').onclick = () => { if (confirm(`Delete “${r.title}”? This cannot be undone.`)) { recipes = recipes.filter(recipe => recipe.id !== id); save(); renderRecipes(); $('#recipe-dialog').close(); toast('Recipe deleted'); } };
  $('#recipe-dialog').showModal();
}
function openForm(recipe) {
  const form = $('#recipe-form'); form.reset(); form.elements.id.value = '';
  $('#form-title').textContent = recipe ? 'Edit your recipe' : 'Add a recipe';
  if (recipe) ['id', 'title', 'category', 'time', 'servings', 'description', 'ingredients', 'steps'].forEach(key => { form.elements[key].value = Array.isArray(recipe[key]) ? recipe[key].join('\n') : recipe[key] || ''; });
  $('#add-dialog').showModal();
}
$('#recipe-form').onsubmit = event => {
  event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
  const ingredients = data.ingredients.split('\n').map(s => s.trim()).filter(Boolean); const steps = data.steps.split('\n').map(s => s.trim()).filter(Boolean);
  if (!data.title.trim() || !ingredients.length || !steps.length) { toast('Add a name, at least one ingredient, and one instruction.'); return; }
  const existing = recipes.find(r => r.id === data.id);
  const recipe = { ...existing, id: existing?.id || crypto.randomUUID(), title: data.title.trim(), category: data.category, time: Number(data.time), servings: Number(data.servings), description: data.description.trim(), ingredients, steps };
  if (existing) recipes = recipes.map(r => r.id === existing.id ? recipe : r); else recipes.unshift(recipe);
  save(); category = 'All recipes'; $('#search').value = ''; renderRecipes(); $('#add-dialog').close(); switchView('recipes'); toast(existing ? 'Recipe updated' : 'Your recipe is in the cookbook');
};
function renderShopping() {
  $('#list-count').textContent = shopping.filter(i => !i.checked).length;
  const items = $('#shopping-items'); items.replaceChildren();
  if (!shopping.length) { items.innerHTML = '<div class="empty"><h2>A fresh start for your grocery run.</h2><p>Add ingredients from any recipe, or add an item above.</p><button class="secondary" id="browse-recipes">Browse recipes</button></div>'; $('#browse-recipes').onclick = () => switchView('recipes'); return; }
  const progress = document.createElement('p'); progress.textContent = `${shopping.filter(i => i.checked).length} of ${shopping.length} items gathered`; items.append(progress);
  shopping.forEach(item => {
    const row = document.createElement('div'); row.className = 'shopping-row' + (item.checked ? ' checked' : '');
    row.innerHTML = `<label><input type="checkbox" ${item.checked ? 'checked' : ''}><span>${escapeHTML(item.text)}<small>${escapeHTML(item.source || 'Your extra essentials')}</small></span></label><button class="remove" aria-label="Remove ${escapeHTML(item.text)}">×</button>`;
    row.querySelector('input').onchange = event => { item.checked = event.target.checked; save(); renderShopping(); };
    row.querySelector('button').onclick = () => { shopping = shopping.filter(i => i.id !== item.id); save(); renderShopping(); };
    items.append(row);
  });
}
function switchView(view) { const recipesActive = view === 'recipes'; $('#recipes-view').hidden = !recipesActive; $('#shopping-view').hidden = recipesActive; $('#recipes-tab').classList.toggle('active', recipesActive); $('#shopping-tab').classList.toggle('active', !recipesActive); $('#recipes-tab').setAttribute('aria-current', recipesActive ? 'page' : 'false'); $('#shopping-tab').setAttribute('aria-current', recipesActive ? 'false' : 'page'); }
$('#recipes-tab').onclick = () => switchView('recipes'); $('#shopping-tab').onclick = () => switchView('shopping');
$('#add-top').onclick = () => openForm(); $('#search').oninput = renderRecipes;
$('#custom-item').onsubmit = event => { event.preventDefault(); const input = event.currentTarget.elements.item; if (!input.value.trim()) return; shopping.push({ id: crypto.randomUUID(), text: input.value.trim(), checked: false }); save(); renderShopping(); input.value = ''; input.focus(); };
$('#clear-checked').onclick = () => { shopping = shopping.filter(i => !i.checked); save(); renderShopping(); };
$('#clear-list').onclick = () => { if (shopping.length && confirm('Clear your entire shopping list?')) { shopping = []; save(); renderShopping(); } };
document.querySelectorAll('.close').forEach(button => button.onclick = () => button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); switchView('recipes'); $('#search').focus(); } });
$('#export').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, recipes, shopping }, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'gather-recipes-backup.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Your backup is downloading'); };
$('#import').onclick = () => $('#import-file').click();
$('#import-file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw Error('too large');
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.recipes) || !data.recipes.every(validRecipe)) throw Error('invalid');
    const additions = data.recipes.filter(r => !recipes.some(existing => existing.id === r.id));
    recipes.push(...additions); save(); renderRecipes(); toast(`${additions.length} recipes imported. Existing recipes kept.`);
  } catch { toast('Could not import. Choose a Gather JSON backup under 5 MB.'); }
  event.target.value = '';
};
renderRecipes(); renderShopping();
if (!storageAvailable) toast('Browser storage is unavailable. Back up recipes before leaving.');
