// Builds EndroidCraft-Offline.zip: unzip, double-click index.html, plays offline (no server needed).
// Browsers block ES modules on file://, so three.js is bundled as a classic script and the
// game scripts are listed directly in index.html.
// Needs: npm install (esbuild is a devDependency) and the `zip` command.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(root, 'offline-build', 'EndroidCraft');
fs.rmSync(path.join(root, 'offline-build'), { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
const copy = (a) => fs.cpSync(path.join(root, a), path.join(out, a), { recursive: true });
['css', 'icons', 'icon.svg', 'manifest.json'].forEach(copy);
for (const f of fs.readdirSync(path.join(root, 'js')))
  if (f !== 'boot.js' && f !== 'three.module.js') copy('js/' + f);
require('esbuild').buildSync({
  entryPoints: [path.join(root, 'js/three.module.js')], bundle: true, format: 'iife',
  globalName: 'THREE', minify: true, outfile: path.join(out, 'js/three.iife.js')
});
const boot = fs.readFileSync(path.join(root, 'js/boot.js'), 'utf8');
const files = JSON.parse(boot.match(/FILES=(\[[^\]]*\])/)[1]);
const tags = ['<script src="js/three.iife.js"></script>', ...files.map(f => `<script src="js/${f}.js"></script>`)].join('\n');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tag = '<script type="module" src="js/boot.js"></script>';
if (!html.includes(tag)) throw new Error('boot tag not found');
fs.writeFileSync(path.join(out, 'index.html'), html.replace(tag, tags));
fs.writeFileSync(path.join(out, 'README.txt'), 'ENDROID CRAFT - offline edition\n\n1. Unzip this folder anywhere.\n2. Double-click index.html (Chrome, Edge or Firefox).\n3. Click Play. No internet or install needed.\n\nWASD move, Space jump, Shift sprint, Ctrl sneak, mouse look, E craft, Esc pause.\nSaves stay in your browser for this file location.\n');
fs.rmSync(path.join(root, 'EndroidCraft-Offline.zip'), { force: true });
cp.execSync('zip -qr ../EndroidCraft-Offline.zip EndroidCraft', { cwd: path.join(root, 'offline-build'), stdio: 'inherit' });
fs.renameSync(path.join(root, 'offline-build', '..', 'EndroidCraft-Offline.zip'), path.join(root, 'EndroidCraft-Offline.zip'));
console.log('built EndroidCraft-Offline.zip');
