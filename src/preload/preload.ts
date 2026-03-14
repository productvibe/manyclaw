/**
 * preload.ts — contextBridge bridge
 *
 * This is the ONLY place ipcRenderer is used. It exposes window.multiclaw
 * to the renderer process without leaking any Node/Electron internals.
 *
 * The shape must exactly match MultiClawAPI in src/shared/ipc.ts.
 */

import { contextBridge, ipcRenderer } from 'electron'
import type { MultiClawAPI } from '../shared/ipc.js'

const api: MultiClawAPI = {
  instances: {
    list: () =>
      ipcRenderer.invoke('instances:list'),

    start: (id) =>
      ipcRenderer.invoke('instances:start', id),

    stop: (id) =>
      ipcRenderer.invoke('instances:stop', id),

    create: (opts: { name: string; color: string }) =>
      ipcRenderer.invoke('instances:create', opts),

    delete: (id) =>
      ipcRenderer.invoke('instances:delete', id),

    getLogs: (id) =>
      ipcRenderer.invoke('instances:getLogs', id),

    getDashboardUrl: (id) =>
      ipcRenderer.invoke('instances:getDashboardUrl', id),

    launchTui: (id) =>
      ipcRenderer.invoke('instances:launchTui', id),

    sendTuiInput: (id: string, data: string) =>
      ipcRenderer.send('instances:tui:input', id, data),

    resizeTui: (id: string, cols: number, rows: number) =>
      ipcRenderer.send('instances:tui:resize', id, cols, rows),

    onTuiData: (id: string, cb: (data: string) => void) => {
      const channel = `instance:tui:data:${id}`
      const handler = (_: unknown, data: string) => cb(data)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },

    onTuiExit: (id: string, cb: () => void) => {
      const channel = `instance:tui:exit:${id}`
      const handler = () => cb()
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },

    onStatusChange: (cb) => {
      const handler = (_: unknown, inst: unknown) =>
        cb(inst as Parameters<typeof cb>[0])
      ipcRenderer.on('instance:statusChanged', handler)
      return () => ipcRenderer.removeListener('instance:statusChanged', handler)
    },

    onLog: (id, cb) => {
      const channel = `instance:logLine:${id}`
      const handler = (_: unknown, line: string) => cb(line)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },

  },

  gateway: {
    status: () =>
      ipcRenderer.invoke('gateway:status'),

    start: () =>
      ipcRenderer.invoke('gateway:start'),
  },

  shell: {
    openExternal: (url) =>
      ipcRenderer.invoke('shell:openExternal', url),
  },
}

contextBridge.exposeInMainWorld('multiclaw', api)
