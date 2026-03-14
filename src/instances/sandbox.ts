/**
 * sandbox.ts — spawn and kill openclaw gateway and TUI processes.
 *
 * Nothing else lives here. InstanceManager calls these functions;
 * this module has no state of its own.
 */

import { execa, type ResultPromise } from 'execa'
import * as pty from 'node-pty'
import fs from 'node:fs'
import path from 'node:path'

export function getOpenClawBin(): string {
  // 1. Explicit override (e.g. CI or integration tests)
  if (process.env.OPENCLAW_BIN) return process.env.OPENCLAW_BIN

  // 2. Common system locations
  for (const p of ['/opt/homebrew/bin/openclaw', '/usr/local/bin/openclaw']) {
    if (fs.existsSync(p)) return p
  }

  // 3. Fall back to PATH
  return 'openclaw'
}

/** Check if openclaw CLI is installed and reachable. */
export function isOpenClawInstalled(): boolean {
  for (const p of [process.env.OPENCLAW_BIN, '/opt/homebrew/bin/openclaw', '/usr/local/bin/openclaw'].filter(Boolean)) {
    if (p && fs.existsSync(p)) return true
  }
  try {
    const { execSync } = require('node:child_process')
    execSync('which openclaw', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function waitForHealth(port: number, timeoutMs = 15000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) return true
    } catch {
      // not up yet — keep polling
    }
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

/**
 * Wraps a ResultPromise to prevent TypeScript from double-unwrapping it.
 * (ResultPromise itself extends Promise<Result>, so returning it directly from
 * an async function would cause the outer Promise to flatten into Promise<Result>.)
 */
export type ProcessHandle = { process: ResultPromise }

export async function launchInstance(
  instance: { id: string; name: string; port: number },
  pushLog: (line: string) => void,
): Promise<ProcessHandle> {
  const bin = getOpenClawBin()

  pushLog(`[instance] Starting ${instance.name} (${instance.id === 'default' ? 'default' : '--profile ' + instance.id}) on port ${instance.port}...`)

  const gatewayArgs = instance.id === 'default'
    ? ['gateway', '--force']
    : ['--profile', instance.id, 'gateway', '--force']

  const child = execa(bin, gatewayArgs, { env: { ...process.env }, reject: false })

  child.stdout?.on('data', (d: Buffer) =>
    d.toString().split('\n').filter(Boolean).forEach(pushLog),
  )
  child.stderr?.on('data', (d: Buffer) =>
    d.toString().split('\n').filter(Boolean).forEach(pushLog),
  )

  const up = await waitForHealth(instance.port)
  if (!up) {
    child.kill('SIGTERM')
    throw new Error(`Gateway health check timed out after 15s (port ${instance.port})`)
  }

  pushLog(`[instance] ${instance.name} is up on port ${instance.port}`)
  return { process: child }
}

export async function killInstance(handle: ProcessHandle): Promise<void> {
  handle.process.kill('SIGTERM')
  await new Promise(r => setTimeout(r, 1000))
}

// ── PTY processes (TUI, configure) ──────────────────────────────────────────

export interface PtyHandle {
  ptyProcess: pty.IPty
}

// Keep old name for backward compat with manager imports
export type TuiHandle = PtyHandle

function spawnProfilePty(
  profileId: string,
  command: string[],
  onData: (data: string) => void,
  onExit: () => void,
): PtyHandle {
  const bin = getOpenClawBin()
  const args = profileId === 'default'
    ? [...command]
    : ['--profile', profileId, ...command]

  // Spawn through the user's shell so shebangs and PATH are resolved correctly.
  // posix_spawnp (used by node-pty) can fail on script files with shebangs.
  const shell = process.env.SHELL ?? '/bin/zsh'
  const shellCmd = [bin, ...args].map(a => `'${a}'`).join(' ')

  const ptyProcess = pty.spawn(shell, ['-l', '-c', shellCmd], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME ?? '/',
    env: {
      ...process.env,
      PATH: process.env.PATH ?? '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
    } as Record<string, string>,
  })

  ptyProcess.onData(onData)
  ptyProcess.onExit(onExit)

  return { ptyProcess }
}

export function launchTui(
  instance: { id: string; name: string },
  onData: (data: string) => void,
  onExit: () => void,
): PtyHandle {
  return spawnProfilePty(instance.id, ['tui'], onData, onExit)
}

export function launchConfigure(
  instance: { id: string },
  onData: (data: string) => void,
  onExit: () => void,
): PtyHandle {
  return spawnProfilePty(instance.id, ['configure'], onData, onExit)
}

export function launchChannelLogin(
  instance: { id: string },
  channel: string,
  onData: (data: string) => void,
  onExit: () => void,
): PtyHandle {
  // Use `configure --section channels` which handles dependency
  // installation and channel setup in one interactive flow.
  return spawnProfilePty(instance.id, ['configure', '--section', 'channels'], onData, onExit)
}

export function killTui(handle: PtyHandle): void {
  try {
    handle.ptyProcess.kill()
  } catch {
    // already dead
  }
}
