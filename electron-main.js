import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Create a browser window constrained to a standard mobile phone resolution (e.g., iPhone 13/14 size)
  const win = new BrowserWindow({
    width: 390,
    height: 844,
    resizable: true,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    win.loadURL(startUrl);
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }

  // Optional: open dev tools for debugging
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});