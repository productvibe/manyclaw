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
import { launchInstance, killInstance, launchTui, launchConfigure, launchChannelLogin, killTui, type ProcessHandle, type TuiHandle, type PtyHandle } from './sandbox.js'
import type { InternalInstance, PersistedState, PersistedInstance } from './types.js'
import type { InstanceInfo, GatewayStatus } from '../shared/ipc.js'

// ── Constants ──────────────────────────────────────────────────────────────

const STATE_DIR = path.join(os.homedir(), '.multiclaw')
const STATE_FILE = path.join(STATE_DIR, 'instances.json')
const SETTINGS_FILE = path.join(STATE_DIR, 'settings.json')
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
  if (id === 'default') return path.join(os.homedir(), '.openclaw')
  return path.join(os.homedir(), `.openclaw-${id}`)
}

function toInstanceInfo(inst: InternalInstance): InstanceInfo {
  return {
    id: inst.id,
    name: inst.name,
    port: inst.port,
    color: inst.color,
    label: inst.label,
    status: inst.status,
    lastError: inst.lastError,
    pid: inst.pid,
    profileDir: inst.profileDir,
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

    if (!state || !Array.isArray(state.instances)) {
      state = { instances: [], nextPort: BASE_PORT, releasedPorts: [] }
    }

    this.nextPort = state.nextPort ?? BASE_PORT
    this.releasedPorts = state.releasedPorts ?? []

    // Load known profiles from state
    const knownIds = new Set<string>()
    for (const p of state.instances) {
      knownIds.add(p.id)
      this.instances.set(p.id, {
        ...p,
        status: 'stopped',
        profileDir: profileDir(p.id),
      })
      this.logs.set(p.id, [])
    }

    // Scan for orphaned ~/.openclaw-* directories not in our state
    this.discoverOrphanedProfiles(knownIds)

    this.saveCurrentState()

    // Check which instances already have a running gateway
    await this.probeAllInstances()
  }

  private discoverOrphanedProfiles(knownIds: Set<string>): void {
    const homeDir = os.homedir()
    let entries: string[]
    try {
      entries = fs.readdirSync(homeDir)
    } catch {
      return
    }

    // Discover the default profile (~/.openclaw) as id "default"
    if (!knownIds.has('default')) {
      const defaultDir = path.join(homeDir, '.openclaw')
      try {
        if (fs.statSync(defaultDir).isDirectory()) {
          const port = this.readPortFromConfig(defaultDir) ?? 18789
          console.log(`[manager] Discovered default profile (port ${port})`)
          this.instances.set('default', {
            id: 'default',
            name: 'Default',
            port,
            color: '#8E8E93',
            status: 'stopped',
            profileDir: defaultDir,
          })
          this.logs.set('default', [])
          if (port >= this.nextPort) this.nextPort = port + 1
        }
      } catch {
        // No default profile
      }
    }

    // Discover ~/.openclaw-* profiles
    const PREFIX = '.openclaw-'
    for (const entry of entries) {
      if (!entry.startsWith(PREFIX)) continue
      const id = entry.slice(PREFIX.length)
      if (!id || knownIds.has(id)) continue

      // Skip known non-profile dirs (dev, sandbox, etc.)
      if (id === 'dev' || id.startsWith('sandbox')) continue

      const dir = path.join(homeDir, entry)
      try {
        if (!fs.statSync(dir).isDirectory()) continue
      } catch {
        continue
      }

      const port = this.readPortFromConfig(dir) ?? this.nextPort++

      // Derive a display name from the id
      const name = id
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      console.log(`[manager] Discovered orphaned profile: ${id} (port ${port})`)

      this.instances.set(id, {
        id,
        name,
        port,
        color: '#8E8E93',
        status: 'stopped',
        profileDir: dir,
      })
      this.logs.set(id, [])

      if (port >= this.nextPort) this.nextPort = port + 1
    }
  }

  private readPortFromConfig(dir: string): number | null {
    try {
      const raw = fs.readFileSync(path.join(dir, 'openclaw.json'), 'utf8')
      const config = JSON.parse(raw)
      const port = config?.commands?.gateway?.port
      return typeof port === 'number' ? port : null
    } catch {
      return null
    }
  }

  /**
   * Probe all instance ports to detect already-running gateways.
   * Called once during init() so the UI shows correct status on launch.
   */
  private async probeAllInstances(): Promise<void> {
    const checks = Array.from(this.instances.values()).map(async (inst) => {
      try {
        const res = await fetch(`http://127.0.0.1:${inst.port}/health`, {
          signal: AbortSignal.timeout(2000),
        })
        if (res.ok) {
          console.log(`[manager] Probe: ${inst.id} is already running on port ${inst.port}`)
          this.setStatus(inst, 'running')
        }
      } catch {
        // Not running — leave as stopped
      }
    })
    await Promise.allSettled(checks)
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

    // Kill PTY processes first — they depend on the gateway being alive
    this.killTuiById(id)
    this.killConfigureById(id)

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

  getNextPort(): number {
    // Peek at the next port without consuming it
    if (this.releasedPorts.length > 0) return this.releasedPorts[0]
    return this.nextPort
  }

  create(opts: { name: string; color: string; id?: string; port?: number; label?: string }): InstanceInfo {
    const port = opts.port ?? (this.releasedPorts.length > 0
      ? this.releasedPorts.shift()!
      : this.nextPort++)

    // If a custom port was provided, don't consume from the pool
    if (opts.port !== undefined) {
      // Remove from released if it was there
      this.releasedPorts = this.releasedPorts.filter(p => p !== opts.port)
      // Advance nextPort past it if needed
      if (opts.port >= this.nextPort) this.nextPort = opts.port + 1
    }

    const id = opts.id ?? this.generateId(opts.name)
    const inst: InternalInstance = {
      id,
      name: opts.name,
      port,
      color: opts.color,
      label: opts.label,
      status: 'stopped',
      profileDir: profileDir(id),
    }

    this.instances.set(id, inst)
    this.logs.set(id, [])
    this.saveCurrentState()

    return toInstanceInfo(inst)
  }

  async clone(sourceId: string, customName?: string): Promise<InstanceInfo> {
    const source = this.instances.get(sourceId)
    if (!source) throw new Error(`Instance not found: ${sourceId}`)

    const newName = customName?.trim() || `${source.name} (copy)`
    const newId = this.generateId(newName)
    const newPort = this.releasedPorts.length > 0
      ? this.releasedPorts.shift()!
      : this.nextPort++

    const newDir = profileDir(newId)

    // Copy the entire profile directory
    fs.cpSync(source.profileDir, newDir, { recursive: true })

    // Fix hardcoded paths in agent session files
    this.rewritePathsInAgentSessions(newDir, source.profileDir, newDir)

    // Update the cloned config with new port and auth token
    const configPath = path.join(newDir, 'openclaw.json')
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (config.gateway) config.gateway.port = newPort
      if (config.agents?.defaults?.workspace) {
        config.agents.defaults.workspace = path.join(newDir, 'workspace')
      }
      const crypto = await import('node:crypto')
      if (config.gateway?.auth?.token) {
        config.gateway.auth.token = crypto.randomBytes(24).toString('hex')
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    } catch {
      // Config missing — that's ok, it'll be created on first start
    }

    const inst: InternalInstance = {
      id: newId,
      name: newName,
      port: newPort,
      color: source.color,
      label: source.label,
      status: 'stopped',
      profileDir: newDir,
    }

    this.instances.set(newId, inst)
    this.logs.set(newId, [])
    this.saveCurrentState()
    this.emit('statusChanged', toInstanceInfo(inst))

    console.log(`[manager] Cloned ${sourceId} → ${newId} (port ${newPort})`)
    return toInstanceInfo(inst)
  }

  updateInstance(id: string, opts: { name?: string; label?: string }): InstanceInfo | undefined {
    const inst = this.instances.get(id)
    if (!inst) return undefined
    if (opts.name !== undefined) inst.name = opts.name
    if (opts.label !== undefined) inst.label = opts.label || undefined
    this.saveCurrentState()
    this.emit('statusChanged', toInstanceInfo(inst))
    return toInstanceInfo(inst)
  }

  async delete(id: string, deleteData = false): Promise<{ cancelled?: boolean }> {
    const inst = this.instances.get(id)
    if (!inst) return {}

    // Stop if running
    if (inst.status === 'running' || inst.status === 'starting') {
      await this.stop(id)
    }

    // Release the port for reuse
    this.releasedPorts.push(inst.port)
    this.instances.delete(id)
    this.logs.delete(id)

    if (deleteData) {
      // Use openclaw uninstall to cleanly remove the profile
      const { execa } = await import('execa')
      const { getOpenClawBin } = await import('./sandbox.js')
      const bin = getOpenClawBin()
      const uninstallArgs = id === 'default'
        ? ['uninstall', '--all', '--yes']
        : ['--profile', id, 'uninstall', '--all', '--yes']
      await execa(bin, uninstallArgs, {
        reject: false,
        env: { ...process.env },
      })
    }

    this.saveCurrentState()
    return {}
  }

  // ── TUI ───────────────────────────────────────────────────────────────

  launchTui(id: string, cols?: number, rows?: number): { started: boolean } {
    if (this.tuiProcesses.has(id)) {
      // PTY already running — renderer will trigger SIGWINCH via resizeTui
      // after this returns, ensuring its data subscription is active first.
      return { started: false }
    }

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

  // ── Configure (PTY) ──────────────────────────────────────────────────

  private configureProcesses = new Map<string, PtyHandle>()

  launchConfigure(id: string): { started: boolean } {
    if (this.configureProcesses.has(id)) return { started: false }

    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)

    const handle = launchConfigure(
      { id: inst.id },
      (data) => this.emit('configureData', { id, data }),
      () => {
        this.configureProcesses.delete(id)
        this.emit('configureExit', { id })
      },
    )

    this.configureProcesses.set(id, handle)
    return { started: true }
  }

  sendConfigureInput(id: string, data: string): void {
    this.configureProcesses.get(id)?.ptyProcess.write(data)
  }

  resizeConfigure(id: string, cols: number, rows: number): void {
    this.configureProcesses.get(id)?.ptyProcess.resize(cols, rows)
  }

  killConfigure(id: string): void {
    this.killConfigureById(id)
  }

  private killConfigureById(id: string): void {
    const handle = this.configureProcesses.get(id)
    if (handle) {
      killTui(handle)
      this.configureProcesses.delete(id)
    }
  }

  // ── Channel Login (PTY) ─────────────────────────────────────────────

  private channelLoginProcesses = new Map<string, PtyHandle>()

  launchChannelLogin(id: string, channel: string): { started: boolean } {
    const key = `${id}:${channel}`
    if (this.channelLoginProcesses.has(key)) return { started: false }

    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)

    const handle = launchChannelLogin(
      { id: inst.id },
      channel,
      (data) => this.emit('channelLoginData', { id, channel, data }),
      () => {
        this.channelLoginProcesses.delete(key)
        this.emit('channelLoginExit', { id, channel })
      },
    )

    this.channelLoginProcesses.set(key, handle)
    return { started: true }
  }

  sendChannelLoginInput(id: string, channel: string, data: string): void {
    this.channelLoginProcesses.get(`${id}:${channel}`)?.ptyProcess.write(data)
  }

  resizeChannelLogin(id: string, channel: string, cols: number, rows: number): void {
    this.channelLoginProcesses.get(`${id}:${channel}`)?.ptyProcess.resize(cols, rows)
  }

  killChannelLogin(id: string, channel: string): void {
    const key = `${id}:${channel}`
    const handle = this.channelLoginProcesses.get(key)
    if (handle) {
      killTui(handle)
      this.channelLoginProcesses.delete(key)
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

  // ── Dashboard ────────────────────────────────────────────────────────

  async openDashboard(id: string): Promise<void> {
    const inst = this.instances.get(id)
    if (!inst) throw new Error(`Instance not found: ${id}`)

    // Let the CLI open the browser directly — it resolves auth and port from the profile config.
    const { execa } = await import('execa')
    const { getOpenClawBin } = await import('./sandbox.js')
    const bin = getOpenClawBin()
    const args = id === 'default'
      ? ['dashboard']
      : ['--profile', id, 'dashboard']
    await execa(bin, args, {
      reject: false,
      env: { ...process.env },
    })
  }

  // ── App Settings ─────────────────────────────────────────────────────

  getSettings(): { setupToken?: string } {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  saveSettings(settings: { setupToken?: string }): void {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
  }

  /**
   * Run non-interactive onboard for a profile using the saved setup token.
   * Called automatically when starting an instance that hasn't been onboarded.
   */
  async onboardInstance(
    id: string,
    opts?: { provider?: string; token?: string },
  ): Promise<{ success: boolean; error?: string }> {
    const inst = this.instances.get(id)
    if (!inst) return { success: false, error: 'Profile not found' }

    const settings = this.getSettings()
    const token = opts?.token || settings.setupToken
    const provider = opts?.provider || 'anthropic'

    if (!token) {
      return { success: false, error: 'No API token provided.' }
    }

    const { execa } = await import('execa')
    const { getOpenClawBin } = await import('./sandbox.js')
    const bin = getOpenClawBin()

    const profileArgs = id === 'default' ? [] : ['--profile', id]
    const workspace = path.join(inst.profileDir, 'workspace')
    const result = await execa(bin, [
      ...profileArgs,
      'onboard',
      '--non-interactive',
      '--accept-risk',
      '--mode', 'local',
      '--flow', 'quickstart',
      '--auth-choice', 'token',
      '--token', token,
      '--token-provider', provider,
      '--gateway-port', String(inst.port),
      '--gateway-bind', 'loopback',
      '--gateway-auth', 'token',
      '--workspace', workspace,
      '--skip-health',
    ], {
      reject: false,
      env: { ...process.env },
    })

    if (result.exitCode !== 0) {
      return { success: false, error: result.stderr || result.stdout || 'Onboard failed' }
    }

    // Fix workspace path — openclaw onboard defaults to ~/.openclaw/workspace-{id}
    // but each profile should use its own directory: ~/.openclaw-{id}/workspace
    if (id !== 'default') {
      this.fixWorkspacePath(inst)
    }

    return { success: true }
  }

  // ── Channels ──────────────────────────────────────────────────────────

  /**
   * Write a channel config entry directly to the profile's openclaw.json.
   * Each channel has its own token field name (e.g. botToken, token).
   */
  async addChannel(
    id: string,
    opts: { channel: string; token: string },
  ): Promise<{ success: boolean; error?: string }> {
    const inst = this.instances.get(id)
    if (!inst) return { success: false, error: 'Profile not found' }

    const configPath = path.join(inst.profileDir, 'openclaw.json')
    try {
      let config: Record<string, unknown> = {}
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      } catch { /* new config */ }

      const channels = (config.channels ?? {}) as Record<string, Record<string, unknown>>
      const tokenField = this.channelTokenField(opts.channel)

      channels[opts.channel] = {
        ...channels[opts.channel],
        enabled: true,
        [tokenField]: opts.token,
      }
      config.channels = channels

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
      console.log(`[manager] Added channel ${opts.channel} for ${id}`)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to write config' }
    }
  }

  async removeChannel(
    id: string,
    opts: { channel: string },
  ): Promise<{ success: boolean; error?: string }> {
    const inst = this.instances.get(id)
    if (!inst) return { success: false, error: 'Profile not found' }

    const configPath = path.join(inst.profileDir, 'openclaw.json')
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      const channels = (config.channels ?? {}) as Record<string, unknown>
      delete channels[opts.channel]
      config.channels = channels
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to write config' }
    }
  }

  async getChannelStatus(id: string, channel: string): Promise<{ enabled: boolean; hasToken: boolean }> {
    const inst = this.instances.get(id)
    if (!inst) return { enabled: false, hasToken: false }

    try {
      const config = JSON.parse(fs.readFileSync(path.join(inst.profileDir, 'openclaw.json'), 'utf8'))
      const ch = config?.channels?.[channel]
      if (!ch) return { enabled: false, hasToken: false }
      const tokenField = this.channelTokenField(channel)
      return { enabled: !!ch.enabled, hasToken: !!ch[tokenField] }
    } catch {
      return { enabled: false, hasToken: false }
    }
  }

  private channelTokenField(channel: string): string {
    switch (channel) {
      case 'telegram': return 'botToken'
      case 'discord': return 'token'
      case 'slack': return 'botToken'
      default: return 'token'
    }
  }

  /**
   * Fix hardcoded paths in agent session files (sessions.json, *.jsonl).
   * These contain absolute paths to the source profile that need updating.
   */
  private rewritePathsInAgentSessions(profileDir: string, oldPath: string, newPath: string): void {
    const agentsDir = path.join(profileDir, 'agents')
    let agents: string[]
    try {
      agents = fs.readdirSync(agentsDir)
    } catch { return }

    for (const agent of agents) {
      const sessionsDir = path.join(agentsDir, agent, 'sessions')
      let files: string[]
      try {
        files = fs.readdirSync(sessionsDir)
      } catch { continue }

      for (const file of files) {
        if (!file.endsWith('.json') && !file.endsWith('.jsonl')) continue
        const filePath = path.join(sessionsDir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          if (content.includes(oldPath)) {
            fs.writeFileSync(filePath, content.replaceAll(oldPath, newPath), 'utf8')
          }
        } catch { /* skip */ }
      }
    }
  }

  private fixWorkspacePath(inst: InternalInstance): void {
    const configPath = path.join(inst.profileDir, 'openclaw.json')
    try {
      const raw = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(raw)
      const correctWorkspace = path.join(inst.profileDir, 'workspace')
      if (config?.agents?.defaults?.workspace !== correctWorkspace) {
        config.agents = config.agents ?? {}
        config.agents.defaults = config.agents.defaults ?? {}
        config.agents.defaults.workspace = correctWorkspace
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
        console.log(`[manager] Fixed workspace path for ${inst.id}: ${correctWorkspace}`)
      }
    } catch {
      // Config doesn't exist yet or is malformed — skip
    }
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
      label: inst.label,
    }))
    this.saveState({ instances, nextPort: this.nextPort, releasedPorts: this.releasedPorts })
  }

  private saveState(state: PersistedState): void {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
  }
}
