// Desktop shell: serves the game from a local loopback server (ES modules need http, not file://)
// and shows it in a native window. F11 fullscreen, Ctrl+R reload.
const { app, BrowserWindow, Menu, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.normalize(path.join(ROOT, p));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv.address().port));
  });
}

async function createWindow() {
  const port = await serve();
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 640, minHeight: 400,
    title: 'Endroid Craft', backgroundColor: '#87CEEB', autoHideMenuBar: true,
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (i.key === 'F5' || (i.control && i.key.toLowerCase() === 'r')) win.reload();
  });
  win.loadURL('http://127.0.0.1:' + port + '/index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
