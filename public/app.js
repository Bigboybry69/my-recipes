const $ = (selector) => document.querySelector(selector);
const recipes = window.GATHER_RECIPES;

let storageAvailable = true;
function read(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { storageAvailable = false; return fallback; }
}
let shopping = read('gather-shopping', []);
if (!Array.isArray(shopping) || !shopping.every(i => i && typeof i.id === 'string' && typeof i.text === 'string')) shopping = [];
let category = 'All recipes';
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3300); }
function save() { try { localStorage.setItem('gather-shopping', JSON.stringify(shopping)); return true; } catch { storageAvailable = false; toast('Browser storage is unavailable or full. Your shopping checklist will only last for this visit.'); return false; } }
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
  $('#recipe-detail').innerHTML = `<div class="detail-food" aria-hidden="true">${escapeHTML(r.emoji || emojis[r.category] || '🍽️')}</div><h2>${escapeHTML(r.title)}</h2><div class="detail-meta"><span>${escapeHTML(r.category)}</span><span>◷ ${r.time} minutes</span><span>${r.servings} servings</span></div><p>${escapeHTML(r.description || '')}</p><h3 class="detail-section">Ingredients</h3>${r.ingredients.map(i => `<label class="ingredient"><input type="checkbox"><span>${escapeHTML(i)}</span></label>`).join('')}<h3 class="detail-section">Let’s make it</h3><ol class="steps">${r.steps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ol><div class="detail-actions"><button class="primary" id="detail-shop">＋ Add ingredients to shopping list</button></div>`;
  $('#detail-shop').onclick = () => addRecipeToList(r);
  $('#recipe-dialog').showModal();
}
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
$('#search').oninput = renderRecipes;
$('#custom-item').onsubmit = event => { event.preventDefault(); const input = event.currentTarget.elements.item; if (!input.value.trim()) return; shopping.push({ id: crypto.randomUUID(), text: input.value.trim(), checked: false }); save(); renderShopping(); input.value = ''; input.focus(); };
$('#clear-checked').onclick = () => { shopping = shopping.filter(i => !i.checked); save(); renderShopping(); };
$('#clear-list').onclick = () => { if (shopping.length && confirm('Clear your entire shopping list?')) { shopping = []; save(); renderShopping(); } };
document.querySelectorAll('.close').forEach(button => button.onclick = () => button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); switchView('recipes'); $('#search').focus(); } });
renderRecipes(); renderShopping();
if (!storageAvailable) toast('Shopping checklist storage is unavailable. Recipes are still available from the website.');
