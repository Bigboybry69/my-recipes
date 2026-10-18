const $ = (selector) => document.querySelector(selector);
const recipes = window.GATHER_RECIPES;
let selectedMember = 'dan';
function memberRecipes() { return window.Family.recipesFor(recipes, selectedMember); }
function currentMember() { return window.Family.members.find(member => member.id === selectedMember); }

let storageAvailable = true;
function read(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { storageAvailable = false; return fallback; }
}
let shopping = read('gather-shopping', []);
if (!Array.isArray(shopping) || !shopping.every(i => i && typeof i.id === 'string' && typeof i.text === 'string')) shopping = [];
let proteinFilter = 'All proteins';
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3300); }
function save() { try { localStorage.setItem('gather-shopping', JSON.stringify(shopping)); return true; } catch { storageAvailable = false; toast('Browser storage is unavailable or full. Your shopping checklist will only last for this visit.'); return false; } }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const foodPaths = {
  BeefNoodles: '<path d="M17 48h86c-4 23-17 35-43 35S21 71 17 48Z M39 85h42 M24 52c20 8 52 8 72 0 M32 45c-6-8 6-15 12-10s10-6 17-2 12-4 18 1 12 4 11 12 M28 42l8-12 16 2 4 10-12 7-16-7Z M59 39l5-13 16 2 6 11-11 9-16-9Z M39 35l7 7m23-11 7 9 M79 16l19 33 M89 12l18 32 M45 22c-7-7 5-7 0-15"/>',
  OrangeRibs: '<ellipse cx="58" cy="68" rx="43" ry="16"/><path d="m26 54 7-15 18-2 10 12-7 14-18 1Z m32-10 10-12 19 4 6 15-9 12-18-3Z M45 65l9-11 17 6 3 13-15 6-13-7Z M38 43l9 11m24-13 12 10 M27 72l8 3m45-7 7 1"/><circle cx="94" cy="27" r="16"/><circle cx="94" cy="27" r="12"/><path d="M94 15v24 M82 27h24 M86 19l16 16 M86 35l16-16 M38 26c-6-8 7-8 0-16"/>',
  ThreeCupChicken: '<path d="M20 48h80c-3 23-18 34-40 34S23 71 20 48Z M39 84h42 M23 51c19 9 55 9 74 0 M40 39l5-9 12 2 4 10-9 7-12-4Z M64 35l9-9 12 5 3 10-10 7-13-3Z M36 21c-7-8 6-8 0-16 M60 22c-7-8 6-8 0-16"/><path d="M88 18c-13-5-18 4-12 12 9 0 15-4 12-12Z M87 19l-10 9 M33 60l5 4m10 1 5 3m13-3 6-3"/>',
  Dumplings: '<ellipse cx="60" cy="76" rx="46" ry="10"/><path d="M23 66c0-17 14-28 31-28 18 0 32 11 32 28-16 12-46 12-63 0Z M23 66c9-3 6-15 15-13 8 1 5-12 14-9 9 3 9-8 16-1 6 6 11 4 14 13 M44 38c3-16 20-24 35-16 15 7 20 21 15 34l-10 9 M51 32l8 9 M63 26l5 13 M76 25l1 14 M87 33l-5 10 M33 24c-8-8 7-9 0-18 M55 17c-7-7 6-8 0-15"/>',
  Kebab: '<path d="m22 83 13-16m46-55 7-8M45 87l12-15m39-55 6-8"/><path d="m35 67-5-7 34-43 8-3 9 8-1 8-34 43-11-6Z m22 5-5-8 30-38 8-3 9 7-1 8-29 38-12-4Z M38 53l13 9 M47 42l13 9 M56 31l13 9 M62 57l12 9 M71 46l12 9 M80 35l12 9"/><path d="M19 88h87 M16 19c-6-7 5-7 0-14 M36 18c-6-7 5-7 0-14"/>',
  CrescentRing: '<ellipse cx="60" cy="49" rx="43" ry="29"/><ellipse cx="60" cy="46" rx="16" ry="10"/><path d="M17 49v7c0 16 19 29 43 29s43-13 43-29v-7 M60 20v16 M82 24 70 38 M98 37 76 43 M102 54 76 49 M84 72 69 55 M60 78V56 M36 72l14-17 M19 54l25-5 M22 36l22 7 M38 24l12 14 M53 44l5-3 5 4 5-2 M53 49l8 3 6-4"/>',
  Pasta: '<ellipse cx="60" cy="66" rx="43" ry="17"/><ellipse cx="60" cy="64" rx="34" ry="11"/><path d="M35 62c-9-13 5-22 16-15 7-15 25-10 24 1 13-4 20 7 10 15 M35 61c15-17 30 14 45-1 M39 54c14-10 24 11 36 0 M48 48c6-7 14 1 19 1 M43 8v23c0 10 13 10 13 0V8 M49 8v24m0 9v10 M83 30c-15-15-28 10-12 17 7 3 17-6 10-12-4-3-10 0-7 4 M82 31l10-4-2 9-6 1"/>',
  CrockpotChicken: '<path d="M27 43h66v27c0 9-8 14-33 14s-33-5-33-14V43Z M27 48H16v12h11 M93 48h11v12H93 M34 84v5m52-5v5 M23 38c3-11 18-17 37-17s34 6 37 17H23Z M52 21v-6h16v6"/><ellipse cx="60" cy="45" rx="33" ry="6"/><path d="M43 58c-6-9 6-16 14-10 5-3 12 1 10 7-1 5-7 8-12 7l-10 8c1 4-4 6-6 3-4 0-5-5-1-7l10-8 M78 54c-3-5 4-7 1-12"/><circle cx="72" cy="73" r="5"/><path d="m72 70 2 3 M47 7c-4-4 3-4 0-7 M75 10c-4-4 3-4 0-7"/>',
  Dinner: '<path d="M21 47h78c-3 25-16 34-39 34S24 72 21 47Z M45 83h30 M44 32c-9-10 9-11 0-23 M60 32c-9-10 9-11 0-23 M76 32c-9-10 9-11 0-23"/>',
  Lunch: '<path d="M21 48h78c-3 23-16 33-39 33S24 71 21 48Z M38 47c-13-19 4-33 17-13 M57 46c-7-24 15-35 21-14 M77 47c0-15 16-20 19-9 M45 83h30 M33 33l13 9 M67 23l-2 20"/>',
  Breakfast: '<path d="M29 45c-12-24 3-33 31-33s43 9 31 33v35H29V45Z M38 46c-9-17 2-23 22-23s31 6 22 23v24H38V46Z"/><circle cx="60" cy="48" r="13"/><path d="M55 46h1m8 0h1 M53 55c5 4 10 4 15 0"/>',
  Dessert: '<path d="M23 72h76L84 34H37L23 72Z M23 73v9h76v-9 M37 34l47 0 M61 34V20 M61 18c-10-8 0-12 0-17 10 10 8 14 0 17Z M30 55c9-15 16 9 24-2s12 12 20 0 14 7 18 1"/>',
};
function foodIcon(icon) { return `<svg class="food-icon" viewBox="0 0 120 95" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${foodPaths[icon] || foodPaths.Dinner}</svg>`; }
function renderRecipes() {
  const query = $('#search').value.trim().toLowerCase();
  const assigned = memberRecipes();
  const filtered = assigned.filter(recipe => window.RecipeFilters.matchesRecipe(recipe, proteinFilter, query));
  $('#recipe-count').textContent = `${filtered.length} / ${assigned.length} RECORDS`;
  const options = ['All proteins', ...window.RecipeFilters.proteins.filter(protein => assigned.some(recipe => window.RecipeFilters.recipeProteins(recipe).includes(protein)))];
  $('#proteins').replaceChildren(...options.map(name => {
    const button = document.createElement('button');
    button.className = 'chip' + (name === proteinFilter ? ' active' : '');
    const count = assigned.filter(recipe => window.RecipeFilters.matchesRecipe(recipe, name, '')).length;
    button.textContent = `${name} (${count})`;
    button.setAttribute('aria-pressed', name === proteinFilter);
    button.onclick = () => { proteinFilter = name; renderRecipes(); };
    return button;
  }));
  $('#recipe-grid').replaceChildren(...filtered.map(recipe => {
    const stats = window.RecipeStats.recipeStats(recipe);
    const card = document.createElement('article'); card.className = 'recipe-card'; card.lang = recipe.lang || 'en';
    const artwork = document.createElement('button'); artwork.className = 'card-image'; artwork.style.width = '100%'; artwork.setAttribute('aria-label', `View ${recipe.title}`);
    artwork.innerHTML = `<span class="category-tag">${escapeHTML(window.RecipeFilters.recipeProteins(recipe).join(" + "))}</span>${foodIcon(recipe.icon)}`; artwork.onclick = () => showRecipe(recipe.id);
    const body = document.createElement('div'); body.className = 'card-body';
    body.innerHTML = `<button class="card-title">${escapeHTML(recipe.title)}</button><p>${escapeHTML(recipe.description || 'A favorite from your personal cookbook.')}</p><div class="recipe-rewards"><span>COMPLEXITY <b>${stats.complexity}/10</b></span><span>+${stats.hp} HP</span><span>+${stats.xp} XP</span></div><div class="card-bottom"><div class="metadata"><span>${escapeHTML(recipe.timeLabel || `${recipe.time} MIN`)}</span>${recipe.servings ? `<span>QTY: ${recipe.servings}</span>` : ''}</div><button class="add-list">+ SUPPLIES</button></div>`;
    body.querySelector('.card-title').onclick = () => showRecipe(recipe.id); body.querySelector('.add-list').onclick = () => addRecipeToList(recipe);
    card.append(artwork, body); return card;
  }));
  $('#empty').hidden = filtered.length > 0;
  $('#empty h3').textContent = assigned.length ? 'No recipes found' : `${currentMember().name}’s cookbook is waiting`;
  $('#empty p').textContent = assigned.length ? 'Try another protein, recipe name, or ingredient.' : 'No recipes assigned yet. Switch characters to explore the family collection.';
}
function addRecipeToList(recipe) {
  let count = 0;
  recipe.ingredients.forEach(text => {
    if (!shopping.some(item => item.text.trim().toLowerCase() === text.trim().toLowerCase() && item.sourceId === recipe.id)) { shopping.push({ id: crypto.randomUUID(), text, source: recipe.title, sourceId: recipe.id, checked: false }); count++; }
  });
  save(); renderShopping(); toast(count ? `${count} ingredients added to your shopping list` : 'These ingredients are already on your list');
}
function fieldPhoto(recipe) {
  if (!recipe.photo) return '';
  return `<details class="field-photo-panel" open><summary><span class="photo-toggle" aria-hidden="true"></span>VIEW FOOD PHOTO <small>// FIELD ARCHIVE</small></summary><figure class="field-photo-frame"><div class="field-photo-window"><img class="field-photo-image" src="${escapeHTML(recipe.photo)}" alt="${escapeHTML(recipe.photoAlt || `Generated serving illustration of ${recipe.title}`)}" loading="lazy" decoding="async"></div><figcaption>FIELD PHOTO / ${escapeHTML(recipe.title)}<span>${escapeHTML(recipe.photoCaption || 'AI-GENERATED SERVING ILLUSTRATION')}</span></figcaption></figure></details>`;
}
function showRecipe(id) {
  const r = recipes.find(recipe => recipe.id === id); if (!r) return;
  const stats = window.RecipeStats.recipeStats(r);
  $('#recipe-detail').dataset.recipeId = r.id;
  $('#recipe-detail').lang = r.lang || 'en';
  $('#recipe-detail').innerHTML = `<div class="detail-food" aria-hidden="true">${foodIcon(r.icon)}</div><h2>${escapeHTML(r.title)}</h2><div class="detail-meta"><span>${escapeHTML(window.RecipeFilters.recipeProteins(r).join(" + "))}</span><span>◷ ${escapeHTML(r.timeLabel || `${r.time} minutes`)}</span>${r.servings ? `<span>${r.servings}${r.lang === 'zh-Hant' ? ' 人份' : r.lang === 'tr' ? ' kişilik' : ' servings'}</span>` : ''}</div><p>${escapeHTML(r.description || '')}</p>${fieldPhoto(r)}${r.notes ? `<p class="stats-help">${escapeHTML(r.notes)}</p>` : ''}<div class="recipe-rewards detail-rewards"><span>COMPLEXITY <b>${stats.complexity}/10</b></span><span>FLAVOR BONUS +${stats.hp} HP</span><span>COLLECTION +${stats.xp} XP</span></div><p class="stats-help">Complexity reflects ingredient count, preparation steps, and advanced techniques. HP bonuses are just for fun; your health bar refills automatically an hour after each meal. XP comes from adding recipes to the collection.</p><h3 class="detail-section">${r.lang === 'zh-Hant' ? '食材' : r.lang === 'tr' ? 'Malzemeler' : 'Ingredients'}</h3>${r.ingredients.map(i => `<label class="ingredient"><input type="checkbox"><span>${escapeHTML(i)}</span></label>`).join('')}<h3 class="detail-section">${r.lang === 'zh-Hant' ? '料理步驟' : r.lang === 'tr' ? 'Hazırlanışı' : 'Preparation protocol'}</h3><ol class="steps">${r.steps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ol><div class="detail-actions"><button class="secondary" id="detail-timer">◷ COOKING TIMER</button><button class="secondary" id="detail-shop">+ REQUISITION INGREDIENTS</button></div>`;
  $('#detail-shop').onclick = () => addRecipeToList(r);
  $('#detail-timer').onclick = () => window.RadtionTimer.open(r.title);
  updateHealth(new Date());
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
const viewHashes = { stats: 'stats', recipes: 'food', timer: 'timer', shopping: 'items' };
let activeView = 'family';
function renderFamily() {
  $('#family-grid').replaceChildren(...window.Family.members.map(member => {
    const owned = window.Family.recipesFor(recipes, member.id);
    const stats = window.RecipeStats.collectionStats(owned);
    const button = document.createElement('button');
    button.className = 'family-card';
    button.setAttribute('aria-label', `Open ${member.name}’s cookbook, ${owned.length} recipes`);
    button.innerHTML = `<span class="eyebrow">LVL ${stats.level} // ${stats.total} XP</span><img src="${member.image}" alt="" width="180" height="210"><strong>${escapeHTML(member.name)}</strong><span class="member-role">${member.role}</span><span class="member-count">${owned.length} RECIPES</span><span class="member-enter">[ OPEN COOKBOOK ]</span>`;
    button.onclick = () => selectMember(member.id, 'stats');
    return button;
  }));
  $('#member-switcher').replaceChildren(...window.Family.members.map(member => {
    const button = document.createElement('button');
    button.className = 'member-button';
    button.setAttribute('aria-label', `Open ${member.name}’s cookbook`);
    button.setAttribute('aria-pressed', member.id === selectedMember);
    button.innerHTML = `<img src="${member.image}" alt="" width="32" height="38"><span>${escapeHTML(member.name)}</span>`;
    button.onclick = () => selectMember(member.id, activeView === 'family' ? 'stats' : activeView);
    return button;
  }));
}
function selectMember(id, view = 'stats', updateLocation = true) {
  if (!window.Family.members.some(member => member.id === id)) id = 'dan';
  selectedMember = id;
  try { localStorage.setItem('radtion-last-member', JSON.stringify(id)); }
  catch { storageAvailable = false; }
  proteinFilter = 'All proteins';
  $('#search').value = '';
  $('#cookbook-owner').textContent = `${currentMember().name}’S`;
  $('#character-name').textContent = `${currentMember().name.toUpperCase()} // ${currentMember().role}`;
  $('#character-image').src = currentMember().image;
  if ($('#recipe-dialog').open) $('#recipe-dialog').close();
  renderFamily(); renderRecipes(); renderXP(); updateHealth(new Date());
  switchView(view, updateLocation);
}
function switchView(view, updateLocation = true) {
  if (view !== 'family' && !Object.hasOwn(viewHashes, view)) view = 'family';
  activeView = view;
  updateHealth(new Date());
  $('#family-view').hidden = view !== 'family';
  $('#member-toolbar').hidden = view === 'family';
  $('#member-switcher').hidden = view !== 'recipes';
  $('header nav').hidden = view === 'family';
  for (const name of Object.keys(viewHashes)) {
    const active = name === view;
    $(`#${name}-view`).hidden = !active;
    const tab = $(`#${name}-tab`);
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  const hash = view === 'family' ? '#family' : `#${selectedMember}/${viewHashes[view]}`;
  if (updateLocation && location.hash !== hash) location.hash = hash;
}
function viewFromLocation(restoreLast = false) {
  const hash = location.hash.slice(1);
  if (restoreLast && (!hash || hash === 'family' || hash === 'stats')) {
    const saved = read('radtion-last-member', null);
    if (window.Family.members.some(member => member.id === saved)) {
      history.replaceState(null, '', `#${saved}/stats`);
      selectMember(saved, 'stats', false);
      return;
    }
  }
  if (!hash || hash === 'family') { switchView('family', false); return; }
  const [first, second] = hash.split('/');
  const member = second ? first : 'dan';
  const tab = second || first;
  const view = Object.keys(viewHashes).find(name => viewHashes[name] === tab);
  if (view) selectMember(member, view, false);
  else switchView('family', false);
}
$('#family-home').onclick = () => switchView('family');
$('#stats-tab').onclick = () => switchView('stats');
$('#recipes-tab').onclick = () => switchView('recipes');
$('#timer-tab').onclick = () => switchView('timer');
$('#shopping-tab').onclick = () => switchView('shopping');
window.addEventListener('hashchange', () => viewFromLocation());
renderFamily();
viewFromLocation(true);
$('#search').oninput = renderRecipes;
$('#custom-item').onsubmit = event => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('item'); if (!input.value.trim()) return; shopping.push({ id: crypto.randomUUID(), text: input.value.trim(), checked: false }); save(); renderShopping(); input.value = ''; input.focus(); };
$('#clear-checked').onclick = () => { shopping = shopping.filter(i => !i.checked); save(); renderShopping(); };
$('#clear-list').onclick = () => { if (shopping.length && confirm('Clear your entire shopping list?')) { shopping = []; save(); renderShopping(); } };
document.querySelectorAll('.close').forEach(button => button.onclick = () => button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); switchView('recipes'); $('#search').focus(); } });
renderRecipes(); renderShopping();
if (!storageAvailable) toast('Browser storage is unavailable. Character choices and shopping checkmarks may not be remembered.');

function updateClock() {
  const now = new Date();
  $('#clock-hour').textContent = String(now.getHours()).padStart(2, '0');
  $('#clock-minute').textContent = String(now.getMinutes()).padStart(2, '0');
  $('#clock-period').textContent = 'HRS';
  $('#clock-day').textContent = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  $('#clock-date').textContent = String(now.getDate()).padStart(2, '0');
  $('#clock-month').textContent = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  updateHealth(now);
}
function updateHealth(now) {
  const energy = window.mealPower(now);
  const { maxHP } = window.RecipeStats.collectionStats(memberRecipes());
  const status = window.RecipeStats.healthState(energy.percent, maxHP);
  const hp = status.hp;
  document.body.dataset.health = activeView === 'family' ? 'normal' : status.state;
  const statusText = activeView === 'family' ? 'FAMILY COOKBOOKS ONLINE' : status.state === 'critical' ? 'CRITICAL HP // EAT SOON' : status.state === 'warning' ? 'LOW HP // MEAL RECOMMENDED' : 'ALL SYSTEMS OPERATIONAL';
  $('#system-state').textContent = statusText;
  $('#footer-state').textContent = statusText;
  $('#power-fill').style.width = `${status.percent}%`;
  $('#power-value').textContent = `${hp}/${maxHP}`;
  $('#meal-power').setAttribute('aria-valuemax', maxHP);
  $('#meal-power').setAttribute('aria-valuenow', hp);
  $('#meal-power').setAttribute('aria-valuetext', `${hp} of ${maxHP} health points. ${energy.name} at ${energy.time}.`);
  const remaining = energy.recovering ? energy.refillRemaining : energy.remaining;
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  const countdown = [hours ? `${hours}H` : '', minutes ? `${minutes}M` : ''].filter(Boolean).join(' ');
  $('#meal-status').textContent = energy.recovering
    ? `${energy.name} // AUTO REFILL ${energy.refillTime} // ${countdown}`
    : `NEXT: ${energy.name} ${energy.time} // ${countdown}`;
  $('#meal-status').classList.toggle('low-power', status.state !== 'normal');
}
function renderXP() {
  const xp = window.RecipeStats.collectionStats(memberRecipes());
  $('#xp-level').textContent = `LVL ${xp.level}`;
  $('#xp-fill').style.width = `${xp.progress / xp.next * 100}%`;
  $('#xp-value').textContent = `${xp.progress}/${xp.next}`;
  $('#xp-bar').setAttribute('aria-valuemax', xp.next);
  $('#xp-bar').setAttribute('aria-valuenow', xp.progress);
  $('#xp-bar').setAttribute('aria-valuetext', `Level ${xp.level}. ${xp.progress} of ${xp.next} XP to next level. ${xp.total} total XP.`);
  $('#xp-status').textContent = `${xp.total} TOTAL XP // MAX HP ${xp.maxHP} // +5 HP PER LEVEL`;
}
renderXP();
updateClock();
setInterval(updateClock, 10000);
