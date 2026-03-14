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
import os from 'node:os'

export function getOpenClawBin(): string {
  // 1. Explicit override (e.g. CI or integration tests)
  if (process.env.OPENCLAW_BIN) return process.env.OPENCLAW_BIN

  // 2. Bundled binary inside the .app (production)
  if (process.resourcesPath) {
    const bundled = path.join(process.resourcesPath, 'openclaw')
    if (fs.existsSync(bundled)) return bundled
  }

  // 3. Common system locations (dev)
  for (const p of ['/opt/homebrew/bin/openclaw', '/usr/local/bin/openclaw']) {
    if (fs.existsSync(p)) return p
  }

  // 4. Fall back to PATH
  return 'openclaw'
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

  // Write gateway.port into the profile config so `--profile {id} tui`
  // connects to the right port without needing --url.
  await execa(
    bin,
    ['--profile', instance.id, 'config', 'set', 'gateway.port', String(instance.port)],
    { reject: false, env: { ...process.env } },
  )

  pushLog(`[instance] Starting ${instance.name} (--profile ${instance.id}) on port ${instance.port}...`)

  const child = execa(
    bin,
    [
      '--profile', instance.id,
      'gateway',
      '--port', String(instance.port),
      '--force',
      '--allow-unconfigured',
    ],
    { env: { ...process.env }, reject: false },
  )

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

// ── TUI (PTY) ──────────────────────────────────────────────────────────────

export interface TuiHandle {
  ptyProcess: pty.IPty
}

/**
 * Read the gateway token from a profile's config file.
 * Returns undefined if missing (gateway will prompt for auth).
 */
export function readProfileToken(id: string): string | undefined {
  try {
    const configPath = path.join(os.homedir(), `.openclaw-${id}`, 'openclaw.json')
    const raw = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(raw) as { gateway?: { auth?: { token?: string } } }
    return config.gateway?.auth?.token
  } catch {
    return undefined
  }
}

/**
 * Spawns `openclaw --profile {id} tui --url ws://127.0.0.1:{port} --token {token}` in a PTY.
 *
 * --profile isolates state/identity. --url + --token are required because
 * `tui` defaults to ws://127.0.0.1:18789 regardless of gateway.port in config.
 */
export function launchTui(
  instance: { id: string; name: string; port: number },
  onData: (data: string) => void,
  onExit: () => void,
): TuiHandle {
  const bin = getOpenClawBin()
  const token = readProfileToken(instance.id)
  const url = `ws://127.0.0.1:${instance.port}`

  const args = ['--profile', instance.id, 'tui', '--url', url]
  if (token) args.push('--token', token)

  const ptyProcess = pty.spawn('/bin/sh', ['-c', `"${bin}" ${args.join(' ')}`], {
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

export function killTui(handle: TuiHandle): void {
  try {
    handle.ptyProcess.kill()
  } catch {
    // already dead
  }
}
