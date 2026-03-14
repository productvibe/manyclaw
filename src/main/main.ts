/**
 * main.ts — Electron main process entry point
 *
 * Responsibilities (and nothing else):
 *   1. App lifecycle (ready, window-all-closed, activate)
 *   2. BrowserWindow creation
 *   3. IPC handler wiring → delegates to InstanceManager
 */

import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { InstanceManager } from '../instances/manager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = !!process.env.VITE_DEV_PORT

const manager = new InstanceManager()

// ── Window ─────────────────────────────────────────────────────────────────

async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 700,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',   // macOS: traffic lights visible, title hidden
    vibrancy: 'sidebar',            // native sidebar blur
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    await win.loadURL(`http://localhost:${process.env.VITE_DEV_PORT}`)
    win.webContents.openDevTools()
  } else {
    await win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

  return win
}

// ── IPC ────────────────────────────────────────────────────────────────────

function setupIpc(win: BrowserWindow): void {
  // Instances
  ipcMain.handle('instances:list', () =>
    manager.list(),
  )

  ipcMain.handle('instances:start', (_, id: string) =>
    manager.start(id),
  )

  ipcMain.handle('instances:stop', (_, id: string) =>
    manager.stop(id),
  )

  ipcMain.handle('instances:create', (_, opts: { name: string; color: string }) =>
    manager.create(opts),
  )

  ipcMain.handle('instances:delete', async (_, id: string) => {
    const inst = manager.getInstance(id)
    if (!inst) return { error: 'Not found' }

    if (inst.status === 'running' || inst.status === 'starting') {
      return { error: 'Stop the instance before deleting it.' }
    }

    const { response, checkboxChecked } = await dialog.showMessageBox(win, {
      type: 'warning',
      title: 'Delete Instance',
      message: `Delete "${inst.name}"?`,
      detail: 'This will remove the instance from the sidebar.',
      checkboxLabel:
        `Also delete all data (sessions, memory, config)\n` +
        `This will permanently remove ~/.openclaw-${id}/`,
      checkboxChecked: false,
      buttons: ['Cancel', 'Delete'],
      defaultId: 0,
      cancelId: 0,
    })

    if (response === 0) return { cancelled: true }
    return manager.delete(id, checkboxChecked)
  })

  ipcMain.handle('instances:getLogs', (_, id: string) =>
    manager.getLogs(id),
  )

  ipcMain.handle('instances:getDashboardUrl', (_, id: string) =>
    manager.getDashboardUrl(id),
  )

  // TUI
  ipcMain.handle('instances:launchTui', (_, id: string) =>
    manager.launchTui(id),
  )

  ipcMain.handle('instances:tui:input', (_, id: string, data: string) => {
    manager.sendTuiInput(id, data)
  })

  ipcMain.handle('instances:tui:resize', (_, id: string, cols: number, rows: number) => {
    manager.resizeTui(id, cols, rows)
  })

  // System gateway
  ipcMain.handle('gateway:status', () =>
    manager.getGatewayStatus(),
  )

  ipcMain.handle('gateway:start', () =>
    manager.startGateway(),
  )

  // Shell
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    if (
      url.startsWith('https://') ||
      url.startsWith('http://127.0.0.1') ||
      url.startsWith('http://localhost')
    ) {
      shell.openExternal(url)
    }
  })

  // ── Forward instance events to renderer ──────────────────────────────
  manager.on('statusChanged', (inst) => {
    win.webContents.send('instance:statusChanged', inst)
  })

  manager.on('log', ({ id, line }: { id: string; line: string }) => {
    win.webContents.send(`instance:logLine:${id}`, line)
  })

  manager.on('tuiData', ({ id, data }: { id: string; data: string }) => {
    win.webContents.send(`instance:tui:data:${id}`, data)
  })
}

// ── App lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  await manager.init()
  const win = await createWindow()
  setupIpc(win)

  // macOS: re-create window when dock icon is clicked and no windows are open
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const win = await createWindow()
      setupIpc(win)
    }
  })
})

app.on('window-all-closed', () => {
  manager.stopAll()
  if (process.platform !== 'darwin') app.quit()
})
