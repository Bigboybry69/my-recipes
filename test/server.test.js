const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
test('serves the cookbook and assets, rejects missing files', async () => {
  const server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '3199' } });
  try {
    await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw Error('Server exited before startup'); })]);
    for (const [route, content, type] of [['/', 'PERSONAL RECIPE ARCHIVE', 'text/html'], ['/app.js', 'renderRecipes', 'text/javascript'], ['/recipes.js', 'GATHER_RECIPES', 'text/javascript'], ['/meal-power.js', 'mealPower', 'text/javascript'], ['/recipe-stats.js', 'recipeStats', 'text/javascript'], ['/style.css', '@media', 'text/css']]) {
      const response = await fetch(`http://127.0.0.1:3199${route}`);
      assert.equal(response.status, 200); assert.ok(response.headers.get('content-type').includes(type)); assert.ok((await response.text()).toLowerCase().includes(content.toLowerCase()));
    }
    const mascot = await fetch('http://127.0.0.1:3199/radtion-cook.png');
    assert.equal(mascot.status, 200);
    assert.ok(mascot.headers.get('content-type').startsWith('image/png'));
    assert.deepEqual(Buffer.from(await mascot.arrayBuffer()).subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal((await fetch('http://127.0.0.1:3199/missing')).status, 404);
  } finally { server.kill(); await once(server, 'exit'); }
});
