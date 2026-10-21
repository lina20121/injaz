const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, dialog, shell } = require('electron');

let localServer;
const grantedPermissions = new Set();
const permissionFile = path.join(app.getPath('userData'), 'permissions.json');

function saveGrantedPermissions() {
  try {
    fs.mkdirSync(path.dirname(permissionFile), { recursive: true });
    fs.writeFileSync(permissionFile, JSON.stringify([...grantedPermissions]), 'utf8');
  } catch (error) {
    console.warn('Could not persist app permissions:', error);
  }
}

function permissionKey(permission, details = {}) {
  if (permission === 'media') return details.mediaTypes?.includes('audio') ? 'microphone' : null;
  if (permission === 'notifications') return 'notifications';
  return null;
}

function configurePermissions() {
  const ses = require('electron').session.defaultSession;
  try {
    const savedPermissions = JSON.parse(fs.readFileSync(permissionFile, 'utf8'));
    if (Array.isArray(savedPermissions)) {
      savedPermissions.forEach((permission) => grantedPermissions.add(permission));
    }
  } catch {
    // No saved permissions on first launch.
  }

  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const key = permissionKey(permission, details);
    if (!key) {
      callback(false);
      return;
    }

    if (grantedPermissions.has(key)) {
      callback(true);
      return;
    }

    const parent = BrowserWindow.fromWebContents(webContents);
    const isMicrophone = key === 'microphone';
    dialog.showMessageBox(parent, {
      type: 'question',
      buttons: ['سماح', 'عدم السماح'],
      defaultId: 0,
      cancelId: 1,
      title: isMicrophone ? 'إذن الميكروفون' : 'إذن الإشعارات',
      message: isMicrophone
        ? 'هل تسمح لتطبيق إنجاز باستخدام الميكروفون للإملاء الصوتي؟'
        : 'هل تسمح لتطبيق إنجاز بإرسال إشعارات المهام والتنبيهات؟',
    }).then(({ response }) => {
      const allowed = response === 0;
      if (allowed) {
        grantedPermissions.add(key);
        saveGrantedPermissions();
      }
      callback(allowed);
    }).catch(() => callback(false));
  });

  ses.setPermissionCheckHandler((_webContents, permission, _origin, details) => {
    const key = permissionKey(permission, details);
    return Boolean(key && grantedPermissions.has(key));
  });
}

async function createWindow() {
  process.env.NODE_ENV = 'production';
  const { startServer } = await import('./server.bundle.mjs');
  localServer = await startServer({
    port: 0,
    host: '127.0.0.1',
    staticDir: path.join(app.getAppPath(), 'dist'),
    dataDirectory: app.getPath('userData'),
  });

  const address = localServer.address();
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'injaz.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  await window.loadURL(`http://127.0.0.1:${address.port}?platform=electron`);
}

app.whenReady().then(() => {
  configurePermissions();
  return createWindow();
}).catch(error => {
  dialog.showErrorBox('Injaz could not start', error?.stack || String(error));
  app.quit();
});

app.on('window-all-closed', () => {
  localServer?.close();
  app.quit();
});

app.on('before-quit', () => localServer?.close());
