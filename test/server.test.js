const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
test('serves the cookbook and assets, rejects missing files', async () => {
  const server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '3199' } });
  try {
    await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw Error('Server exited before startup'); })]);
    for (const [route, content, type] of [['/', 'Your personal cookbook', 'text/html'], ['/app.js', 'renderRecipes', 'text/javascript'], ['/style.css', '@media', 'text/css']]) {
      const response = await fetch(`http://127.0.0.1:3199${route}`);
      assert.equal(response.status, 200); assert.ok(response.headers.get('content-type').includes(type)); assert.ok((await response.text()).toLowerCase().includes(content.toLowerCase()));
    }
    assert.equal((await fetch('http://127.0.0.1:3199/missing')).status, 404);
  } finally { server.kill(); await once(server, 'exit'); }
});
