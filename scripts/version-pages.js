const fs = require('node:fs');
const path = require('node:path');
const version = process.env.GITHUB_SHA;
if (!version || !/^[a-f0-9]{40}$/.test(version)) throw new Error('Expected a full Git commit SHA in GITHUB_SHA');
const root = path.resolve(__dirname, '../public');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/((?:src|href)="\.\/[^"?]+\.(?:js|css|png))"/g, `$1?v=${version}"`);
fs.writeFileSync(file, html);
