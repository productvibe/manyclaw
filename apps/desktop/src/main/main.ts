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
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { InstanceManager } from '../instances/manager.js'
import { initUpdater } from './updater.js'

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

// ── IPC handlers (registered once) ────────────────────────────────────────

function registerIpcHandlers(): void {
  ipcMain.handle('instances:list', () => manager.list())
  ipcMain.handle('instances:start', (_, id: string) => manager.start(id))
  ipcMain.handle('instances:stop', (_, id: string) => manager.stop(id))
  ipcMain.handle('instances:create', (_, opts: { name: string; color: string; id?: string; port?: number }) => manager.create(opts))
  ipcMain.handle('instances:update', (_, id: string, opts: { name?: string; label?: string }) => manager.updateInstance(id, opts))
  ipcMain.handle('instances:clone', (_, id: string, name?: string) => manager.clone(id, name))
  ipcMain.handle('instances:getNextPort', () => manager.getNextPort())
  ipcMain.handle('instances:validate', (_, opts: { id: string; port: number }) => manager.validate(opts))
  ipcMain.handle('instances:delete', async (_, id: string, opts?: { deleteData?: boolean }) => {
    const inst = manager.getInstance(id)
    if (!inst) return { error: 'Not found' }
    return manager.delete(id, opts?.deleteData ?? false)
  })
  ipcMain.handle('instances:getLogs', (_, id: string) => manager.getLogs(id))
  ipcMain.handle('instances:openDashboard', (_, id: string) => manager.openDashboard(id))
  ipcMain.handle('gateway:status', () => manager.getGatewayStatus())
  ipcMain.handle('gateway:start', () => manager.startGateway())
  ipcMain.handle('settings:get', () => manager.getSettings())
  ipcMain.handle('settings:save', (_, settings: { setupToken?: string }) => manager.saveSettings(settings))
  ipcMain.handle('instances:onboard', (_, id: string, opts?: { provider?: string; token?: string }) => manager.onboardInstance(id, opts))
  ipcMain.handle('instances:addChannel', (_, id: string, opts: { channel: string; token: string }) => manager.addChannel(id, opts))
  ipcMain.handle('instances:removeChannel', (_, id: string, opts: { channel: string }) => manager.removeChannel(id, opts))
  ipcMain.handle('instances:getChannelStatus', (_, id: string, channel: string) => manager.getChannelStatus(id, channel))
  ipcMain.handle('instances:launchChannelLogin', (_, id: string, channel: string) => manager.launchChannelLogin(id, channel))
  ipcMain.handle('instances:killChannelLogin', (_, id: string, channel: string) => manager.killChannelLogin(id, channel))
  ipcMain.on('instances:channelLogin:input', (_, id: string, channel: string, data: string) => { manager.sendChannelLoginInput(id, channel, data) })
  ipcMain.on('instances:channelLogin:resize', (_, id: string, channel: string, cols: number, rows: number) => { manager.resizeChannelLogin(id, channel, cols, rows) })
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      shell.openExternal(url)
    }
  })
  ipcMain.handle('shell:openPath', (_, p: string) => {
    if (p.startsWith(os.homedir())) { shell.openPath(p) }
  })
  ipcMain.handle('instances:launchTui', (_, id: string, cols?: number, rows?: number) => manager.launchTui(id, cols, rows))
  ipcMain.on('instances:tui:input', (_, id: string, data: string) => { manager.sendTuiInput(id, data) })
  ipcMain.on('instances:tui:resize', (_, id: string, cols: number, rows: number) => { manager.resizeTui(id, cols, rows) })
  ipcMain.handle('instances:launchConfigure', (_, id: string) => manager.launchConfigure(id))
  ipcMain.handle('instances:killConfigure', (_, id: string) => manager.killConfigure(id))
  ipcMain.on('instances:configure:input', (_, id: string, data: string) => { manager.sendConfigureInput(id, data) })
  ipcMain.on('instances:configure:resize', (_, id: string, cols: number, rows: number) => { manager.resizeConfigure(id, cols, rows) })
}

// ── Event forwarding (re-wired per window) ────────────────────────────────

function bridgeEventsToWindow(win: BrowserWindow): void {
  manager.removeAllListeners()

  const send = (channel: string, ...args: unknown[]) => {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args)
  }

  manager.on('statusChanged', (inst) => { send('instance:statusChanged', inst) })
  manager.on('log', ({ id, line }: { id: string; line: string }) => { send(`instance:logLine:${id}`, line) })
  manager.on('tuiData', ({ id, data }: { id: string; data: string }) => { send(`instance:tui:data:${id}`, data) })
  manager.on('tuiExit', ({ id }: { id: string }) => { send(`instance:tui:exit:${id}`) })
  manager.on('configureData', ({ id, data }: { id: string; data: string }) => { send(`instance:configure:data:${id}`, data) })
  manager.on('configureExit', ({ id }: { id: string }) => { send(`instance:configure:exit:${id}`) })
  manager.on('channelLoginData', ({ id, channel, data }: { id: string; channel: string; data: string }) => { send(`instance:channelLogin:data:${id}:${channel}`, data) })
  manager.on('channelLoginExit', ({ id, channel }: { id: string; channel: string }) => { send(`instance:channelLogin:exit:${id}:${channel}`) })
}

// ── App lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  await manager.init()
  registerIpcHandlers()
  const win = await createWindow()
  bridgeEventsToWindow(win)

  // Auto-update — production only
  if (app.isPackaged) {
    initUpdater()
  }

  // macOS: re-create window when dock icon is clicked and no windows are open
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const win = await createWindow()
      bridgeEventsToWindow(win)
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

let forceQuit = false

app.on('before-quit', async (e) => {
  if (forceQuit) return

  const running = manager.list().filter(i => i.status === 'running' || i.status === 'starting')
  if (running.length === 0) {
    // Nothing running — quit immediately
    return
  }

  e.preventDefault()

  const win = BrowserWindow.getAllWindows()[0]
  const { response } = await dialog.showMessageBox(win ?? null, {
    type: 'warning',
    title: 'Quit ManyClaw',
    message: `${running.length} running profile${running.length > 1 ? 's' : ''} will be stopped.`,
    detail: running.map(i => i.name).join(', '),
    buttons: ['Cancel', 'Quit'],
    defaultId: 1,
    cancelId: 0,
  })

  if (response === 0) return

  await manager.stopAll()
  forceQuit = true
  app.quit()
})
