const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const current = 'a'.repeat(40);
const latest = 'b'.repeat(40);

function app(options = {}) {
  const state = { version: current, busy: false, offline: false, clock: 100000, ...options };
  const status = { textContent: '' };
  const windowEvents = {};
  const documentEvents = {};
  const requests = [];
  const navigations = [];
  const document = {
    hidden: false, activeElement: null,
    querySelector(selector) {
      if (selector.startsWith('meta')) return { content: current };
      if (selector === '#update-status') return status;
      if (selector === '#check-updates') return { addEventListener() {} };
      if (selector === 'dialog[open]') return state.busy ? {} : null;
      return null;
    },
    addEventListener(name, handler) { documentEvents[name] = handler; }
  };
  const window = { RadtionTimer: { isActive: () => state.timerActive }, addEventListener(name, handler) { windowEvents[name] = handler; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/updates.js'), 'utf8'), {
    window, document, URL, Date: { now: () => state.clock }, setInterval() {},
    location: { href: 'https://example.com/my-recipes/?v=old#demi/food', replace(url) { navigations.push(url); } },
    async fetch(url, options) {
      requests.push({ url, options });
      if (state.offline) throw Error('offline');
      return { ok: true, json: async () => ({ version: state.version }) };
    }
  });
  return { state, status, requests, navigations, documentEvents, check: window.RadtionUpdates.check };
}
test('detects a new deployment on resume and preserves character/tab links', async () => {
  const instance = app();
  await instance.check();
  assert.equal(instance.navigations.length, 0);
  instance.state.version = latest;
  instance.state.clock += 20000;
  instance.documentEvents.visibilitychange();
  await instance.check();
  const next = new URL(instance.navigations[0]);
  assert.equal(next.searchParams.get('v'), latest);
  assert.equal(next.hash, '#demi/food');
  assert.equal(instance.requests[0].options.cache, 'no-store');
});
test('waits while a recipe is open; explicit update can refresh immediately', async () => {
  const instance = app({ version: latest, busy: true });
  await instance.check();
  assert.equal(instance.navigations.length, 0);
  assert.match(instance.status.textContent, /Update ready/);
  await instance.check(true);
  assert.equal(instance.navigations.length, 1);
});
test('offline checks and invalid version responses never interrupt the app', async () => {
  const instance = app({ offline: true });
  await instance.check();
  await instance.check(true);
  assert.match(instance.status.textContent, /online/);
  instance.state.offline = false;
  instance.state.version = 'invalid';
  await instance.check(true);
  assert.equal(instance.navigations.length, 0);
});
test('deployment stamps document and assets with the same published version', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'radtion-version-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.mkdirSync(path.join(root, 'public'));
    fs.copyFileSync(path.join(__dirname, '../scripts/version-pages.js'), path.join(root, 'scripts/version-pages.js'));
    fs.writeFileSync(path.join(root, 'public/index.html'), '<meta name="radtion-version" content="development"><script src="./updates.js"></script>');
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/version-pages.js')], { env: { ...process.env, GITHUB_SHA: latest } });
    assert.equal(result.status, 0, result.stderr.toString());
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'public/version.json'))).version, latest);
    const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
    assert.ok(html.includes(`content="${latest}"`));
    assert.ok(html.includes(`updates.js?v=${latest}`));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('automatic updates wait for active timers even with all dialogs closed', async () => {
  const instance = app({ version: latest, timerActive: true });
  await instance.check();
  assert.equal(instance.navigations.length, 0);
  instance.state.timerActive = false;
  instance.state.clock += 20000;
  await instance.check();
  assert.equal(instance.navigations.length, 1);
});
