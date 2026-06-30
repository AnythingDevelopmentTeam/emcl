const fs = require('fs');
const path = require('path');

const platform = process.platform;
const isWin = platform === 'win32';
const srcDir = path.join(__dirname, '..', '..', '..', 'target', 'release');

// napi-rs creates {name}.node on macOS/Windows, but lib{name}.so on Linux
let srcName = isWin ? 'napi_theseus.dll' : 'napi_theseus.node';
let src = path.join(srcDir, srcName);

if (!fs.existsSync(src) && !isWin) {
	// Try lib{name}.so (Linux, napi-build v2 doesn't auto-rename)
	const soSrc = path.join(srcDir, 'libnapi_theseus.so');
	if (fs.existsSync(soSrc)) {
		src = soSrc;
		srcName = 'napi_theseus.node';
	} else {
		console.error(`Native addon not found at ${src} or ${soSrc}`);
		process.exit(1);
	}
} else if (!fs.existsSync(src)) {
	console.error(`Native addon not found at ${src}`);
	process.exit(1);
}

const destDir = path.join(__dirname, '..', '..', '..', 'apps', 'app-electron', 'native');

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}

const dest = path.join(destDir, srcName);
fs.copyFileSync(src, dest);
console.log(`Copied native addon to ${dest}`);
