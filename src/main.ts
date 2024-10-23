import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import contextMenu from 'electron-context-menu';
import * as fs from 'fs';
import * as path from 'path';

let mainWindow: BrowserWindow;
let lastUsedFilename = 'lista_email.txt';
const systemLocale = app.getLocale();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('src/index.html');

  app.on('browser-window-created', () => {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('set-locale', systemLocale);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  // Set up the context menu
  contextMenu({
    window: mainWindow,
    showSaveImageAs: false,
    showInspectElement: false,
  });
});

ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Salva su file',
    defaultPath: lastUsedFilename,
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, data);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('load-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Carica da file',
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['openFile', 'multiSelections'],
  });

  if (!canceled && filePaths.length > 0) {
    let data = '';
    for (const filePath of filePaths) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.txt') {
        lastUsedFilename = path.basename(filePath);
        data += fs.readFileSync(filePath, 'utf-8') + '\n\n\n';
      } else {
        // Unsupported file type
        continue;
      }
    }
    return { success: true, data };
  }
  return { success: false };
});
