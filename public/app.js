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
const foodPaths = {
  CrockpotChicken: '<path d="M27 43h66v27c0 9-8 14-33 14s-33-5-33-14V43Z M27 48H16v12h11 M93 48h11v12H93 M34 84v5m52-5v5 M23 38c3-11 18-17 37-17s34 6 37 17H23Z M52 21v-6h16v6"/><ellipse cx="60" cy="45" rx="33" ry="6"/><path d="M43 58c-6-9 6-16 14-10 5-3 12 1 10 7-1 5-7 8-12 7l-10 8c1 4-4 6-6 3-4 0-5-5-1-7l10-8 M78 54c-3-5 4-7 1-12"/><circle cx="72" cy="73" r="5"/><path d="m72 70 2 3 M47 7c-4-4 3-4 0-7 M75 10c-4-4 3-4 0-7"/>',
  Dinner: '<path d="M21 47h78c-3 25-16 34-39 34S24 72 21 47Z M45 83h30 M44 32c-9-10 9-11 0-23 M60 32c-9-10 9-11 0-23 M76 32c-9-10 9-11 0-23"/>',
  Lunch: '<path d="M21 48h78c-3 23-16 33-39 33S24 71 21 48Z M38 47c-13-19 4-33 17-13 M57 46c-7-24 15-35 21-14 M77 47c0-15 16-20 19-9 M45 83h30 M33 33l13 9 M67 23l-2 20"/>',
  Breakfast: '<path d="M29 45c-12-24 3-33 31-33s43 9 31 33v35H29V45Z M38 46c-9-17 2-23 22-23s31 6 22 23v24H38V46Z"/><circle cx="60" cy="48" r="13"/><path d="M55 46h1m8 0h1 M53 55c5 4 10 4 15 0"/>',
  Dessert: '<path d="M23 72h76L84 34H37L23 72Z M23 73v9h76v-9 M37 34l47 0 M61 34V20 M61 18c-10-8 0-12 0-17 10 10 8 14 0 17Z M30 55c9-15 16 9 24-2s12 12 20 0 14 7 18 1"/>',
  Snacks: '<circle cx="60" cy="47" r="34"/><circle cx="48" cy="32" r="4"/><circle cx="75" cy="40" r="4"/><circle cx="56" cy="59" r="5"/><path d="m37 49 6 4m27 12 5-5m-9-35 3 3"/>'
};
function foodIcon(category, icon) { return `<svg class="food-icon" viewBox="0 0 120 95" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${foodPaths[icon] || foodPaths[category] || foodPaths.Dinner}</svg>`; }
function renderRecipes() {
  const query = $('#search').value.trim().toLowerCase();
  const filtered = recipes.filter(r => (category === 'All recipes' || r.category === category) && [r.title, r.description || '', ...r.ingredients].join(' ').toLowerCase().includes(query));
  $('#recipe-count').textContent = `${filtered.length} / ${recipes.length} RECORDS`;
  $('#categories').replaceChildren(...['All recipes', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'].map(name => {
    const button = document.createElement('button'); button.className = 'chip' + (name === category ? ' active' : ''); button.textContent = name; button.setAttribute('aria-pressed', name === category); button.onclick = () => { category = name; renderRecipes(); }; return button;
  }));
  $('#recipe-grid').replaceChildren(...filtered.map(recipe => {
    const card = document.createElement('article'); card.className = 'recipe-card';
    const artwork = document.createElement('button'); artwork.className = 'card-image'; artwork.style.width = '100%'; artwork.setAttribute('aria-label', `View ${recipe.title}`);
    artwork.innerHTML = `<span class="category-tag">${escapeHTML(recipe.category)}</span>${foodIcon(recipe.category, recipe.icon)}`; artwork.onclick = () => showRecipe(recipe.id);
    const body = document.createElement('div'); body.className = 'card-body';
    body.innerHTML = `<button class="card-title">${escapeHTML(recipe.title)}</button><p>${escapeHTML(recipe.description || 'A favorite from your personal cookbook.')}</p><div class="card-bottom"><div class="metadata"><span>${escapeHTML(recipe.timeLabel || `${recipe.time} MIN`)}</span>${recipe.servings ? `<span>QTY: ${recipe.servings}</span>` : ''}</div><button class="add-list">+ SUPPLIES</button></div>`;
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
  $('#recipe-detail').innerHTML = `<div class="detail-food" aria-hidden="true">${foodIcon(r.category, r.icon)}</div><h2>${escapeHTML(r.title)}</h2><div class="detail-meta"><span>${escapeHTML(r.category)}</span><span>◷ ${escapeHTML(r.timeLabel || `${r.time} minutes`)}</span>${r.servings ? `<span>${r.servings} servings</span>` : ''}</div><p>${escapeHTML(r.description || '')}</p><h3 class="detail-section">Ingredients</h3>${r.ingredients.map(i => `<label class="ingredient"><input type="checkbox"><span>${escapeHTML(i)}</span></label>`).join('')}<h3 class="detail-section">Preparation protocol</h3><ol class="steps">${r.steps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ol><div class="detail-actions"><button class="primary" id="detail-shop">+ REQUISITION INGREDIENTS</button></div>`;
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

function updateClock() {
  const now = new Date();
  $('#clock-hour').textContent = String(now.getHours()).padStart(2, '0');
  $('#clock-minute').textContent = String(now.getMinutes()).padStart(2, '0');
  $('#clock-period').textContent = 'HRS';
  $('#clock-day').textContent = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  $('#clock-date').textContent = String(now.getDate()).padStart(2, '0');
  $('#clock-month').textContent = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const energy = window.mealPower(now);
  $('#power-fill').style.width = `${energy.percent}%`;
  $('#power-value').textContent = `${energy.percent}/100`;
  $('#meal-power').setAttribute('aria-valuenow', energy.percent);
  $('#meal-power').setAttribute('aria-valuetext', `${energy.percent}% energy. ${energy.name} at ${energy.time}.`);
  const hours = Math.floor(energy.remaining / 60);
  const minutes = energy.remaining % 60;
  const countdown = [hours ? `${hours}H` : '', minutes ? `${minutes}M` : ''].filter(Boolean).join(' ');
  $('#meal-status').textContent = energy.remaining === 0
    ? `${energy.name} TIME // ENERGY REFILLS NEXT MINUTE`
    : `NEXT: ${energy.name} ${energy.time} // ${countdown}`;
  $('#meal-status').classList.toggle('low-power', energy.percent <= 15);
}
updateClock();
setInterval(updateClock, 10000);
