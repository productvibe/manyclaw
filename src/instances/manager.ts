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
import { launchInstance, killInstance, type ProcessHandle } from './sandbox.js'
import type { InternalInstance, PersistedState, PersistedInstance } from './types.js'
import type { InstanceInfo, GatewayStatus, ChatResult } from '../shared/ipc.js'

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

  // ── Chat ──────────────────────────────────────────────────────────────

  async sendChat(opts: {
    content: string
    instanceId: string
    conversationId?: string
  }): Promise<ChatResult> {
    const inst = this.instances.get(opts.instanceId)
    if (!inst) {
      return {
        conversationId: opts.conversationId ?? '',
        response: '',
        instanceId: opts.instanceId,
        error: `Instance not found: ${opts.instanceId}`,
      }
    }
    if (inst.status !== 'running') {
      return {
        conversationId: opts.conversationId ?? '',
        response: '',
        instanceId: opts.instanceId,
        error: `Instance is not running (status: ${inst.status})`,
      }
    }

    // Read auth token from ~/.openclaw-{id}/openclaw.json
    const apiKey = this.readProfileToken(opts.instanceId)

    try {
      const body: Record<string, unknown> = { content: opts.content }
      if (opts.conversationId) body.conversationId = opts.conversationId

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

      const res = await fetch(`http://127.0.0.1:${inst.port}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        return {
          conversationId: opts.conversationId ?? '',
          response: '',
          instanceId: opts.instanceId,
          error: `Gateway returned ${res.status}: ${text}`,
        }
      }

      const data = await res.json() as {
        conversationId?: string
        response?: string
        content?: string
      }

      return {
        conversationId: data.conversationId ?? opts.conversationId ?? '',
        response: data.response ?? data.content ?? '',
        instanceId: opts.instanceId,
      }
    } catch (err) {
      return {
        conversationId: opts.conversationId ?? '',
        response: '',
        instanceId: opts.instanceId,
        error: err instanceof Error ? err.message : String(err),
      }
    }
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

  private readProfileToken(id: string): string | undefined {
    try {
      const configPath = path.join(profileDir(id), 'openclaw.json')
      const raw = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(raw) as Record<string, unknown>
      // Token lives at gateway.auth.token in openclaw profile config
      const gateway = (config.gateway as Record<string, unknown> | undefined) ?? {}
      const auth = (gateway.auth as Record<string, unknown> | undefined) ?? {}
      return typeof auth.token === 'string' ? auth.token : undefined
    } catch {
      return undefined
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
