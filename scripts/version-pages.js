const fs = require('node:fs');
const path = require('node:path');
const version = process.env.GITHUB_SHA;
if (!version || !/^[a-f0-9]{40}$/.test(version)) throw new Error('Expected a full Git commit SHA in GITHUB_SHA');
const root = path.resolve(__dirname, '../public');
fs.writeFileSync(path.join(root, 'version.json'), JSON.stringify({ version }) + '\n');
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const file = path.join(root, name);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(<meta name="radtion-version" content=")[^"]*(">)/, `$1${version}$2`);
  html = html.replace(/((?:src|href)="\.\/[^"?]+\.(?:js|css|png|webmanifest))"/g, `$1?v=${version}"`);
  fs.writeFileSync(file, html);
}
