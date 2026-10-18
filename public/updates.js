(() => {
  const current = document.querySelector('meta[name="radtion-version"]')?.content;
  const status = document.querySelector('#update-status');
  const button = document.querySelector('#check-updates');
  let inFlight = null;
  let lastCheck = 0;
  const isVersion = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

  function busy() {
    return Boolean(document.querySelector('dialog[open]') ||
      document.querySelector('#custom-item input')?.value.trim() ||
      document.activeElement?.matches('input, textarea, select'));
  }
  async function run(manual) {
    if (!isVersion(current)) {
      if (manual) status.textContent = 'Local development preview.';
      return;
    }
    if (manual) status.textContent = 'Checking for updates…';
    try {
      const url = new URL('./version.json', location.href);
      url.searchParams.set('check', String(Date.now()));
      const response = await fetch(url.href, { cache: 'no-store' });
      if (!response.ok) throw new Error('Version check failed');
      const { version } = await response.json();
      if (!isVersion(version)) throw new Error('Invalid version');
      if (version === current) {
        if (manual) status.textContent = 'Radtion is up to date.';
        return;
      }
      if (!manual && busy()) {
        status.textContent = 'Update ready. Finish your recipe or tap Check for Updates.';
        return;
      }
      status.textContent = 'Loading the latest Radtion…';
      const next = new URL(location.href);
      next.searchParams.set('v', version);
      // A new document URL refreshes cached HTML while retaining the character/tab hash.
      location.replace(next.href);
    } catch {
      if (manual) status.textContent = 'Could not check. Try again when you’re online.';
    }
  }
  function check(manual = false) {
    if (inFlight) return inFlight;
    if (!manual && (document.hidden || Date.now() - lastCheck < 15000)) return Promise.resolve();
    lastCheck = Date.now();
    inFlight = run(manual).finally(() => { inFlight = null; });
    return inFlight;
  }
  button.addEventListener('click', () => check(true));
  window.addEventListener('pageshow', () => check());
  window.addEventListener('focus', () => check());
  window.addEventListener('online', () => check());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  document.addEventListener('close', () => check(), true);
  setInterval(() => check(), 60000);
  window.RadtionUpdates = { check };
  check();
})();
