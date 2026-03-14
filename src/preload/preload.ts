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

    create: (opts: { name: string; color: string; id?: string; port?: number }) =>
      ipcRenderer.invoke('instances:create', opts),

    update: (id: string, opts: { name?: string; label?: string }) =>
      ipcRenderer.invoke('instances:update', id, opts),

    clone: (id: string, name?: string) =>
      ipcRenderer.invoke('instances:clone', id, name),

    getNextPort: () =>
      ipcRenderer.invoke('instances:getNextPort'),

    delete: (id, opts) =>
      ipcRenderer.invoke('instances:delete', id, opts),

    getLogs: (id) =>
      ipcRenderer.invoke('instances:getLogs', id),

    openDashboard: (id) =>
      ipcRenderer.invoke('instances:openDashboard', id),

    onboard: (id, opts?) =>
      ipcRenderer.invoke('instances:onboard', id, opts),

    addChannel: (id, opts) =>
      ipcRenderer.invoke('instances:addChannel', id, opts),

    removeChannel: (id, opts) =>
      ipcRenderer.invoke('instances:removeChannel', id, opts),

    getChannelStatus: (id, channel) =>
      ipcRenderer.invoke('instances:getChannelStatus', id, channel),

    launchChannelLogin: (id, channel) =>
      ipcRenderer.invoke('instances:launchChannelLogin', id, channel),

    killChannelLogin: (id, channel) =>
      ipcRenderer.invoke('instances:killChannelLogin', id, channel),

    sendChannelLoginInput: (id: string, channel: string, data: string) =>
      ipcRenderer.send('instances:channelLogin:input', id, channel, data),

    resizeChannelLogin: (id: string, channel: string, cols: number, rows: number) =>
      ipcRenderer.send('instances:channelLogin:resize', id, channel, cols, rows),

    onChannelLoginData: (id: string, channel: string, cb: (data: string) => void) => {
      const ch = `instance:channelLogin:data:${id}:${channel}`
      const handler = (_: unknown, data: string) => cb(data)
      ipcRenderer.on(ch, handler)
      return () => ipcRenderer.removeListener(ch, handler)
    },

    onChannelLoginExit: (id: string, channel: string, cb: () => void) => {
      const ch = `instance:channelLogin:exit:${id}:${channel}`
      const handler = () => cb()
      ipcRenderer.on(ch, handler)
      return () => ipcRenderer.removeListener(ch, handler)
    },

    launchTui: (id, cols?, rows?) =>
      ipcRenderer.invoke('instances:launchTui', id, cols, rows),

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

    launchConfigure: (id) =>
      ipcRenderer.invoke('instances:launchConfigure', id),

    killConfigure: (id) =>
      ipcRenderer.invoke('instances:killConfigure', id),

    sendConfigureInput: (id: string, data: string) =>
      ipcRenderer.send('instances:configure:input', id, data),

    resizeConfigure: (id: string, cols: number, rows: number) =>
      ipcRenderer.send('instances:configure:resize', id, cols, rows),

    onConfigureData: (id: string, cb: (data: string) => void) => {
      const channel = `instance:configure:data:${id}`
      const handler = (_: unknown, data: string) => cb(data)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },

    onConfigureExit: (id: string, cb: () => void) => {
      const channel = `instance:configure:exit:${id}`
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

  settings: {
    get: () =>
      ipcRenderer.invoke('settings:get'),

    save: (settings: { setupToken?: string }) =>
      ipcRenderer.invoke('settings:save', settings),
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
    openPath: (path) =>
      ipcRenderer.invoke('shell:openPath', path),
  },
}

contextBridge.exposeInMainWorld('multiclaw', api)
