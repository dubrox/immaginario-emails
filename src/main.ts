import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

let mainWindow: BrowserWindow;

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
}

app.whenReady().then(createWindow);

ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Salva su file',
    defaultPath: 'lista_email.txt',
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
    properties: ['openFile']
  });

  if (!canceled && filePaths.length > 0) {
    const data = fs.readFileSync(filePaths[0], 'utf-8');
    return { success: true, data };
  }
  return { success: false };
});
