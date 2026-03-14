# Technical Learnings — multiclaw (2026-03-14)

## openclaw CLI — Profile & Gateway

### launchInstance() — correct sequence
```
openclaw --profile {id} config set gateway.port {port}
openclaw --profile {id} gateway --port {port} --force --allow-unconfigured
poll /health until 200 (15s timeout)
```
- `--force` kills any existing gateway on that port
- `--allow-unconfigured` bypasses the onboard requirement — essential for programmatic use
- `config set gateway.port` must run first so TUI/dashboard can resolve the port without explicit flags

### launchTui() — correct invocation
```
openclaw --profile {id} tui
```
- No `--url`, no `--token` needed — profile config already has the port
- Spawn directly (not via `/bin/sh -c`) to avoid shell quoting issues
- PTY required (`node-pty`) — TUI is a terminal UI, not a plain process

### getDashboardUrl() — correct invocation
```
openclaw --profile {id} dashboard --no-open
```
- Output is verbose multi-line, not a bare URL:
  ```
  Dashboard URL: http://127.0.0.1:40000/#token=abc123
  Copied to clipboard.
  Browser launch disabled (--no-open). Use the URL above.
  ```
- Extract with regex: `/https?:\/\/127\.0\.0\.1:\d+[^\s]*/`
- Do not assume stdout is just the URL

### Token handling
- Never read the token directly from the profile's JSON config file
- The CLI manages auth — use `dashboard --no-open` to get an authenticated URL
- `readProfileToken()` pattern is wrong; delete it wherever it appears

---

## Electron IPC — TUI wiring

The full PTY → renderer path requires all three layers in `main.ts`:

1. **`ipcMain.handle('instances:launchTui')`** — spawns the PTY via manager
2. **`ipcMain.on('instances:tui:input')`** — forwards keystrokes from renderer to PTY
3. **`ipcMain.on('instances:tui:resize')`** — forwards terminal resize to PTY
4. **`manager.on('tuiData')`** → `win.webContents.send(...)` — forwards PTY output to renderer
5. **`manager.on('tuiExit')`** → `win.webContents.send(...)` — notifies renderer when PTY exits

Missing any one of these silently breaks the TUI. The preload and manager can be perfectly wired while the TUI appears completely dead if `main.ts` handlers aren't registered.

---

## xterm.js in Electron

- Use `FitAddon` + `ResizeObserver` to keep PTY cols/rows in sync with container size
- Wire `term.onData` → `sendTuiInput` IPC for keyboard passthrough
- Clean up on unmount: unsubscribe IPC listeners, disconnect ResizeObserver, call `terminal.dispose()`
- PTY channel naming convention: `instance:tui:data:{id}` and `instance:tui:exit:{id}` (per-instance channels avoid cross-contamination)
