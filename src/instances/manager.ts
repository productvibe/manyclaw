/**
 * manager.ts — InstanceManager
 *
 * Single source of truth for instance state. Persists to ~/.multiclaw/instances.json.
 * Emits 'statusChanged' and 'log' events so main.ts can forward them to the renderer.
 */

import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { launchInstance, killInstance, launchTui, killTui, type ProcessHandle, type TuiHandle } from './sandbox.js'
import type { InternalInstance, PersistedState, PersistedInstance } from './types.js'
import type { InstanceInfo, GatewayStatus } from '../shared/ipc.js'

// ── Constants ──────────────────────────────────────────────────────────────

const STATE_DIR = path.join(os.homedir(), '.multiclaw')
const STATE_FILE = path.join(STATE_DIR, 'instances.json')
const BASE_PORT = 40000
const LOG_MAX_LINES = 500

const DEFAULT_INSTANCE: PersistedInstance = {
  id: 'my-agent',
  name: 'My OpenClaw',
  port: 40000,
  color: '#007AFF',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function profileDir(id: string): string {
  return path.join(os.homedir(), `.openclaw-${id}`)
}

function toInstanceInfo(inst: InternalInstance): InstanceInfo {
  return {
    id: inst.id,
    name: inst.name,
    port: inst.port,
    color: inst.color,
    status: inst.status,
    lastError: inst.lastError,
    pid: inst.pid,
  }
}

// ── Manager ────────────────────────────────────────────────────────────────

export class InstanceManager extends EventEmitter {
  private instances = new Map<string, InternalInstance>()
  private processes = new Map<string, ProcessHandle>()
  private tuiProcesses = new Map<string, TuiHandle>()
  private logs = new Map<string, string[]>()
  private nextPort = BASE_PORT + 1  // 40000 is reserved for default instance
  private releasedPorts: number[] = []

  // ── Lifecycle ──────────────────────────────────────────────────────────

  async init(): Promise<void> {
    fs.mkdirSync(STATE_DIR, { recursive: true })

    let state: PersistedState | null = null
    try {
      const raw = fs.readFileSync(STATE_FILE, 'utf8')
      state = JSON.parse(raw) as PersistedState
    } catch {
      // Missing or corrupt — start fresh
    }

    if (!state || !Array.isArray(state.instances) || state.instances.length === 0) {
      // Seed with default instance
      state = {
        instances: [DEFAULT_INSTANCE],
        nextPort: BASE_PORT + 1,
        releasedPorts: [],
      }
      this.saveState(state)
    }

    this.nextPort = state.nextPort ?? BASE_PORT + 1
    this.releasedPorts = state.releasedPorts ?? []

    for (const p of state.instances) {
      this.instances.set(p.id, {
        ...p,
        status: 'stopped',
        profileDir: profileDir(p.id),
      })
      this.logs.set(p.id, [])
    }
  }

  // ── Queries ────────────────────────────────────────────────────────────

  list(): InstanceInfo[] {
    return Array.from(this.instances.values()).map(toInstanceInfo)
  }

  getInstance(id: string): InstanceInfo | undefined {
    const inst = this.instances.get(id)
    return inst ? toInstanceInfo(inst) : undefined
  }

  getLogs(id: string): string[] {
    return this.logs.get(id) ?? []
  }

  // ── Mutations ──────────────────────────────────────────────────────────

  async start(id: string): Promise<InstanceInfo> {
    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)
    if (inst.status === 'running') return toInstanceInfo(inst)
    if (inst.status === 'starting') return toInstanceInfo(inst)

    this.setStatus(inst, 'starting')

    try {
      const handle = await launchInstance(
        { id: inst.id, name: inst.name, port: inst.port },
        (line) => this.pushLog(id, line),
      )

      this.processes.set(id, handle)
      inst.pid = handle.process.pid
      this.setStatus(inst, 'running')

      // Watch for unexpected exit
      handle.process.then(() => {
        if (this.instances.get(id)?.status === 'running') {
          inst.pid = undefined
          this.setStatus(inst, 'stopped')
        }
      }).catch(() => {
        inst.pid = undefined
        inst.lastError = 'Process exited unexpectedly'
        this.setStatus(inst, 'error')
      })
    } catch (err) {
      inst.lastError = err instanceof Error ? err.message : String(err)
      this.setStatus(inst, 'error')
      throw err
    }

    return toInstanceInfo(inst)
  }

  async stop(id: string): Promise<InstanceInfo> {
    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)
    if (inst.status === 'stopped') return toInstanceInfo(inst)

    // Kill TUI first — it depends on the gateway being alive
    this.killTuiById(id)

    const handle = this.processes.get(id)
    if (handle) {
      await killInstance(handle)
      this.processes.delete(id)
    }

    inst.pid = undefined
    this.setStatus(inst, 'stopped')

    // Give the port a moment to free up
    await new Promise(r => setTimeout(r, 800))

    return toInstanceInfo(inst)
  }

  async stopAll(): Promise<void> {
    const ids = Array.from(this.instances.keys())
    await Promise.allSettled(ids.map(id => this.stop(id)))
  }

  create(opts: { name: string; color: string }): InstanceInfo {
    const port = this.releasedPorts.length > 0
      ? this.releasedPorts.shift()!
      : this.nextPort++

    const id = this.generateId(opts.name)
    const inst: InternalInstance = {
      id,
      name: opts.name,
      port,
      color: opts.color,
      status: 'stopped',
      profileDir: profileDir(id),
    }

    this.instances.set(id, inst)
    this.logs.set(id, [])
    this.saveCurrentState()

    return toInstanceInfo(inst)
  }

  async delete(id: string, deleteData = false): Promise<{ cancelled?: boolean }> {
    const inst = this.instances.get(id)
    if (!inst) return {}

    // Release the port for reuse
    this.releasedPorts.push(inst.port)
    this.instances.delete(id)
    this.logs.delete(id)

    if (deleteData) {
      const dir = profileDir(id)
      try {
        fs.rmSync(dir, { recursive: true, force: true })
      } catch (err) {
        console.error(`[manager] Failed to remove ${dir}:`, err)
      }
    }

    this.saveCurrentState()
    return {}
  }

  // ── TUI ───────────────────────────────────────────────────────────────

  launchTui(id: string): { started: boolean } {
    if (this.tuiProcesses.has(id)) return { started: false }

    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)

    const handle = launchTui(
      { id: inst.id, name: inst.name },
      (data) => this.emit('tuiData', { id, data }),
      () => {
        this.tuiProcesses.delete(id)
        this.emit('tuiExit', { id })
      },
    )

    this.tuiProcesses.set(id, handle)
    return { started: true }
  }

  sendTuiInput(id: string, data: string): void {
    this.tuiProcesses.get(id)?.ptyProcess.write(data)
  }

  resizeTui(id: string, cols: number, rows: number): void {
    this.tuiProcesses.get(id)?.ptyProcess.resize(cols, rows)
  }

  // ── Gateway (system openclaw, port 18789) ─────────────────────────────

  async getGatewayStatus(): Promise<GatewayStatus> {
    try {
      const res = await fetch('http://127.0.0.1:18789/health', {
        signal: AbortSignal.timeout(2000),
      })
      if (res.ok) return { running: true, port: 18789 }
    } catch {
      // not running
    }
    return { running: false }
  }

  async startGateway(): Promise<GatewayStatus> {
    const status = await this.getGatewayStatus()
    if (status.running) return status

    // Fire-and-forget: openclaw gateway (system, no --profile)
    const { execa } = await import('execa')
    const { getOpenClawBin } = await import('./sandbox.js')
    const bin = getOpenClawBin()
    execa(bin, ['gateway'], { reject: false, detached: true }).catch(() => {})

    // Wait a bit and re-check
    await new Promise(r => setTimeout(r, 3000))
    return this.getGatewayStatus()
  }

  // ── Dashboard URL ────────────────────────────────────────────────────

  async getDashboardUrl(id: string): Promise<string> {
    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)

    const { execa } = await import('execa')
    const { getOpenClawBin } = await import('./sandbox.js')
    const bin = getOpenClawBin()

    const result = await execa(
      bin,
      ['--profile', id, 'dashboard', '--no-open'],
      {
        reject: false,
        env: {
          ...process.env,
          PATH: process.env.PATH ?? '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
        },
      },
    )

    const url = result.stdout.split('\n').map(l => l.trim()).find(l => l.startsWith('http'))
    if (!url) throw new Error(`dashboard --no-open returned no URL. stderr: ${result.stderr}`)
    return url
  }

  // ── Event subscriptions (convenience wrappers for main.ts) ────────────

  onStatusChange(cb: (inst: InstanceInfo) => void): () => void {
    const handler = (inst: InstanceInfo) => cb(inst)
    this.on('statusChanged', handler)
    return () => this.off('statusChanged', handler)
  }

  onLog(id: string, cb: (line: string) => void): () => void {
    const handler = ({ id: lineId, line }: { id: string; line: string }) => {
      if (lineId === id) cb(line)
    }
    this.on('log', handler)
    return () => this.off('log', handler)
  }

  // ── Private ────────────────────────────────────────────────────────────

  private setStatus(inst: InternalInstance, status: InternalInstance['status']): void {
    inst.status = status
    this.emit('statusChanged', toInstanceInfo(inst))
  }

  private pushLog(id: string, line: string): void {
    const buf = this.logs.get(id) ?? []
    buf.push(line)
    if (buf.length > LOG_MAX_LINES) buf.splice(0, buf.length - LOG_MAX_LINES)
    this.logs.set(id, buf)
    this.emit('log', { id, line })
  }

  private killTuiById(id: string): void {
    const handle = this.tuiProcesses.get(id)
    if (handle) {
      killTui(handle)
      this.tuiProcesses.delete(id)
    }
  }

  private generateId(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'instance'

    // Ensure uniqueness
    if (!this.instances.has(base)) return base
    let i = 2
    while (this.instances.has(`${base}-${i}`)) i++
    return `${base}-${i}`
  }

  private saveCurrentState(): void {
    const instances: PersistedInstance[] = Array.from(this.instances.values()).map(inst => ({
      id: inst.id,
      name: inst.name,
      port: inst.port,
      color: inst.color,
    }))
    this.saveState({ instances, nextPort: this.nextPort, releasedPorts: this.releasedPorts })
  }

  private saveState(state: PersistedState): void {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
  }
}
