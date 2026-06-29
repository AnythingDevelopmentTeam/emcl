const fs = require('fs');
const path = require('path');

const platform = process.platform;
const ext = platform === 'win32' ? 'dll' : 'node';
const srcName = `napi_theseus.${ext}`;

const src = path.join(__dirname, '..', '..', '..', 'target', 'release', srcName);
const destDir = path.join(__dirname, '..', '..', '..', 'apps', 'app-electron', 'native');

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}

const dest = path.join(destDir, srcName);
fs.copyFileSync(src, dest);
console.log(`Copied native addon to ${dest}`);
