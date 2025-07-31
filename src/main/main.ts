import { app, BrowserWindow } from 'electron';
import path from 'node:path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      plugins: false,
      sandbox: true,
      webgl: true,
      webSecurity: false
    },
  });

  console.log('Preload path:', path.join(__dirname, '../preload/preload.js'));
  console.log('Renderer path:', path.join(__dirname, '../renderer/index.html'));
  mainWindow.loadFile(path.join(__dirname, `../renderer/index.html`));
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});