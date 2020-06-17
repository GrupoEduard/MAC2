'use strict'
import path from 'path'
import { app, protocol, BrowserWindow, Tray, Menu } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null, winSync = null, tray = null, createdAppProtocol = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'mega', privileges: { secure: true, standard: true } }])

const createTray = () => {
  tray = new Tray(path.join(__static, '/icons/init.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Salir",
      accelerator: "CmdOrCtrl+Q",
      click() {
        app.quit()
      }
    },
    {
      label: "Mac",
      accelerator: "CmdOrCtrl+M",
      click() {
       
      }
    }
  ])
  tray.setToolTip('Mega Archivo.')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (winSync !== null) toggleWindow();
  })

}

const toggleWindow = () => {
  winSync.isVisible() ? winSync.hide() : showWindow();
}
const showWindow = () => {
  const position = getWindowPosition();
  winSync.setPosition(position.x, position.y, false);
  winSync.show();
}
const getWindowPosition = () => {
  const windowBounds = winSync.getBounds();
  const trayBounds = tray.getBounds();
  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y - windowBounds.height)
  return { x: x, y: y }
}


function createWorkerWindow() {
  winSync = new BrowserWindow({
    width: 320,
    height: 350,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    winSync.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'sync')
    if (!process.env.IS_TEST) winSync.webContents.openDevTools()
  } else {
    if (!createdAppProtocol) {
      createProtocol('mega')
      createdAppProtocol = true
    }
    // Load the index.html when not in development
    winSync.loadURL('mega://./sync.html')
  }

  winSync.on('blur', () => {
    if (!winSync.webContents.isDevToolsOpened()) {
      winSync.hide();
    }
  });

  winSync.on('close', () => {
    winSync = null
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 720,
    icon: path.join(__static, '/icon64.png'),
    webPreferences: { nodeIntegration: true }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    if (!createdAppProtocol) {
      createProtocol('app')
      createdAppProtocol = true
    }
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  win.on('close', () => {
    win = null
  })

}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log(`Not the first instance - quit`);
  app.quit();
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }

  }
  createTray();
  createWindow();
  createWorkerWindow()
  ipcMain.on('open-sync', () => {
    if (winSync === null) createWorkerWindow()
  })

  ipcMain.on('open-app', () => {
    if (win === null) createWindow()
  })
  ipcMain.on('salir-app', () => {
    //killApp().then(() => app.quit()).catch(e => app.quit())
  })

  ipcMain.on('close-sync', () => {
    winSync.close()
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
