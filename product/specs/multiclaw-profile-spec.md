# Multiclaw Profile Management Spec

**Status:** Draft  
**Author:** Cedar 🌲  
**Date:** 2026-03-14  
**Ground truth:** `product/notes/openclaw-profile-lifecycle.md`

---

## Principles

- The openclaw CLI is the only source of truth for profile state.
- No hand-rolled token reading from JSON files.
- No manual URL construction.
- No workarounds. Use the CLI as designed.
- `--profile {id}` is the isolation mechanism. Everything flows from it.

---

## 1. Instance Creation

**When:** User creates a new instance in the multiclaw UI.

### Step 1 — Assign a port

Multiclaw maintains a port counter in `~/.multiclaw/instances.json` (starting at 40000, incrementing per instance). Pick the next available port and persist it to the instance record.

### Step 2 — Write port to profile config

```bash
openclaw --profile {id} config set gateway.port {port} --strict-json
```

- `--strict-json` is required when setting a number value.
- This writes `~/.openclaw-{id}/openclaw.json` with `gateway.port`.
- This is what allows `tui` and subsequent commands to connect without explicit `--url` flags.

**Expected output:** Silent (exit 0).  
**Error cases:**
- Non-zero exit → surface error to user, abort creation.

### Step 3 — (Optional) Configure model auth

If the instance was created with an API key:

```bash
openclaw --profile {id} models auth paste-token --provider anthropic
```

Or for other providers, substitute `--provider {provider}`.

**When to skip:** If the user wants to configure auth later via the TUI or dashboard, skip this step. The gateway can start with `--allow-unconfigured`.

---

## 2. Gateway Start

**When:** User clicks Start, or app auto-starts on launch.

```bash
openclaw --profile {id} gateway \
  --port {port} \
  --force \
  --allow-unconfigured
```

**Flags:**
- `--port {port}` — required; prevents conflicts between profiles.
- `--force` — kills any existing gateway on this port before starting.
- `--allow-unconfigured` — starts even if onboarding hasn't completed; lets the user configure via dashboard.

**Run as:** Foreground child process (not daemon). Multiclaw holds the process handle; stdout/stderr are piped to the instance log buffer.

**Health check after start:**

Poll `GET http://127.0.0.1:{port}/health` every 500ms with a 1s per-request timeout.  
Declare success on first `200 OK`. Declare failure after 15s total.

```
GET http://127.0.0.1:{port}/health
→ 200 OK  (gateway is alive)
```

**Expected outcome:** Gateway process running, `/health` returns 200.  
**Error cases:**
- Health check times out (15s) → SIGTERM the child, set instance status to `error`.
- Port already in use and `--force` fails → bubble error to UI.
- Process exits before health check passes → capture stderr, surface to user.

---

## 3. Gateway Stop

**When:** User clicks Stop, or instance is deleted, or app quits.

Send `SIGTERM` to the gateway child process:

```
handle.process.kill('SIGTERM')
```

Wait up to 1s for the process to exit. If it's still alive, send `SIGKILL`.

**No openclaw CLI call is needed** for foreground gateways — the process handle is sufficient.

For daemon-mode gateways (not used by multiclaw, documented for completeness):

```bash
openclaw --profile {id} gateway stop
```

**Expected outcome:** Process exits, port is freed.  
**Error cases:**
- Process already dead (ignore, it's idempotent).
- Process doesn't respond to SIGTERM → escalate to SIGKILL after timeout.

---

## 4. TUI

**When:** User clicks the TUI button for a running instance.

```bash
openclaw --profile {id} tui
```

That's it. No `--url`. No `--token`. No manual token reading.

**Why this works:** Step 1 of instance creation writes `gateway.port` to the profile config via `config set`. The `tui` command reads `gateway.port` from that config and connects to `ws://127.0.0.1:{port}` automatically.

**Run as:** PTY process (requires terminal emulation). Use `node-pty` to spawn:

```js
pty.spawn('/bin/sh', ['-c', `"${bin}" --profile ${id} tui`], {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  env: { ...process.env }
})
```

**Resize:** Call `ptyProcess.resize(cols, rows)` on terminal resize events.

**Expected outcome:** TUI connects to the running gateway, renders in the PTY.  
**Error cases:**
- Gateway not running → TUI will fail to connect; show error overlay, prompt user to start the gateway.
- PTY spawn fails → surface OS error.

---

## 5. Dashboard / Open in Browser

**When:** User clicks "Open in Browser" or the webview needs an authenticated URL.

### Get the authenticated URL

```bash
openclaw --profile {id} dashboard --no-open
```

**Expected stdout:**

```
http://127.0.0.1:{port}/dashboard?token=...
```

Parse the full URL from stdout (trim whitespace). Do not construct it manually.

**Open in browser:**

```js
shell.openExternal(url)
```

**For embedded webview:** Use the URL directly as the webview `src`.

**Expected outcome:** Browser opens to the authenticated dashboard for this profile.  
**Error cases:**
- Gateway not running → `dashboard --no-open` will fail or output nothing; check exit code.
- Empty or malformed stdout → surface error, do not attempt to open.
- URL does not start with `http://127.0.0.1:` → reject it (security guard).

---

## 6. Delete

**When:** User confirms deletion of an instance. Instance must be stopped first.

### Step 1 — Stop the gateway (if running)

See §3 Gateway Stop. Enforce this before proceeding.

### Step 2 — Wipe the profile

```bash
openclaw --profile {id} reset --scope config+creds+sessions --yes
```

This removes config, credentials, and sessions, but keeps workspace files if any were created.

For a full wipe including workspace:

```bash
openclaw --profile {id} reset --scope full --yes
```

Or using uninstall:

```bash
openclaw --profile {id} uninstall --all --yes
```

**Preview before wiping (optional, for debug/audit):**

```bash
openclaw --profile {id} uninstall --all --dry-run
```

### Step 3 — Remove from multiclaw state

Remove the instance record from `~/.multiclaw/instances.json` and release the port back to the pool.

**Expected outcome:** `~/.openclaw-{id}/` is removed or emptied. Instance no longer appears in the UI.  
**Error cases:**
- `reset` fails (e.g., permission error) → surface error, do not remove from state (allows retry).
- Profile directory doesn't exist → treat as success (already cleaned up).

---

## 7. Health Check

**When:** Periodic liveness checks, or before TUI/dashboard operations.

```
GET http://127.0.0.1:{port}/health
```

- Expected: `200 OK`
- Timeout: 1s per request
- Use native `fetch` with `AbortSignal.timeout(1000)`

**Do not use the openclaw CLI for health checks.** The HTTP endpoint is direct and fast.

```js
const res = await fetch(`http://127.0.0.1:${port}/health`, {
  signal: AbortSignal.timeout(1000),
})
const alive = res.ok
```

**Expected outcome:** `true` if gateway is up, `false` if unreachable.  
**Error cases:**
- Network error (ECONNREFUSED, timeout) → return `false`, set status to `error`.
- Non-200 response → return `false`.

---

## 8. IPC Surface (Electron Renderer)

Operations the renderer needs from the main process. These map to `window.multiclaw.*`.

### instances.*

| Operation | Description |
|-----------|-------------|
| `list()` | Returns all instances with current status |
| `create(name, color)` | Creates a new instance (assigns port, writes config) |
| `start(id)` | Starts the gateway for an instance |
| `stop(id)` | Stops the gateway for an instance |
| `delete(id)` | Deletes an instance and its profile data |
| `getLogs(id)` | Returns recent log lines (up to 2000) |
| `getDashboardUrl(id)` | Runs `dashboard --no-open`, returns the full URL |
| `launchTui(id)` | Spawns `openclaw --profile {id} tui` in a PTY |
| `sendTuiInput(id, data)` | Writes raw bytes to the TUI PTY |
| `resizeTui(id, cols, rows)` | Resizes the TUI PTY |
| `onTuiData(id, cb)` | Subscribe to PTY output; returns unsubscribe fn |
| `onTuiExit(id, cb)` | Subscribe to TUI exit; returns unsubscribe fn |
| `onStatusChange(cb)` | Subscribe to instance status changes; returns unsubscribe fn |
| `onLog(id, cb)` | Subscribe to live log lines for an instance; returns unsubscribe fn |

### gateway.*

| Operation | Description |
|-----------|-------------|
| `status()` | Checks if the system gateway (port 18789) is reachable |
| `start()` | Starts the system gateway if not running |

### shell.*

| Operation | Description |
|-----------|-------------|
| `openExternal(url)` | Opens a URL in the default browser (https:// only) |

---

## Current Codebase Deviations

The following deviations exist in `src/instances/sandbox.ts` and should be corrected:

### ❌ `readProfileToken()` — remove this function

```ts
// WRONG — reads token from JSON file directly
export function readProfileToken(id: string): string | undefined {
  const configPath = path.join(os.homedir(), `.openclaw-${id}`, 'openclaw.json')
  const raw = fs.readFileSync(configPath, 'utf8')
  return config.gateway?.auth?.token
}
```

**Fix:** Delete `readProfileToken`. The CLI handles auth internally.

### ❌ `launchTui()` — remove `--url` and `--token` flags

```ts
// WRONG — hand-rolls ws:// URL and reads token manually
const url = `ws://127.0.0.1:${instance.port}`
const args = ['--profile', instance.id, 'tui', '--url', url]
if (token) args.push('--token', token)
```

**Fix:** Use `openclaw --profile {id} tui` with no extra flags. The `gateway.port` is already set in the profile config (via `config set` in `launchInstance`), so `tui` connects automatically.

```ts
// CORRECT
const args = ['--profile', instance.id, 'tui']
```

### ✅ `launchInstance()` — correct as-is

The gateway launch sequence is correct:
1. `config set gateway.port {port} --strict-json`
2. `gateway --port {port} --force --allow-unconfigured`
3. Poll `/health` until alive

No changes needed here.

---

## Command Summary

| Operation | Command |
|-----------|---------|
| Set port | `openclaw --profile {id} config set gateway.port {port} --strict-json` |
| Start gateway | `openclaw --profile {id} gateway --port {port} --force --allow-unconfigured` |
| Health check | `GET http://127.0.0.1:{port}/health` |
| Open TUI | `openclaw --profile {id} tui` |
| Get dashboard URL | `openclaw --profile {id} dashboard --no-open` |
| Stop gateway | SIGTERM to process handle |
| Delete (partial) | `openclaw --profile {id} reset --scope config+creds+sessions --yes` |
| Delete (full) | `openclaw --profile {id} reset --scope full --yes` |
| Delete (uninstall) | `openclaw --profile {id} uninstall --all --yes` |
