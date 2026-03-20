# Architecture

## Core Principle

Each instance in the app is an openclaw **profile**. openclaw's native `--profile` flag handles all isolation — config, sessions, memory, workspace, gateway auth. The app is the visual manager on top.

## Instance = Profile

```
App sidebar          Command that runs                   Data lives at
──────────────       ───────────────────────────────     ────────────────────────────
● Dev                openclaw --profile dev               ~/.openclaw-dev/
                       gateway --port 40000
                       --force --allow-unconfigured

● Production         openclaw --profile prod              ~/.openclaw-prod/
                       gateway --port 40001
                       --force --allow-unconfigured

● Staging (new)      openclaw --profile staging           ~/.openclaw-staging/
                       gateway --port 40002
                       --force --allow-unconfigured
```

Each profile is fully isolated — its own agent identity, memory, sessions, config, and gateway with its own auth token. Nothing is shared between profiles.

## Port Allocation

- Base port: **40000** (clear of system openclaw at 18789)
- Assignment: incrementing counter with free-list recycling
- Stored in `~/.multiclaw/instances.json`: `{ instances[], nextPort, releasedPorts[] }`
- On create: pop from `releasedPorts` first, else use `nextPort++`
- On delete: push port to `releasedPorts`

## Filesystem Layout

```
~/.openclaw-{id}/               ← Per-instance profile data (managed by openclaw)
  openclaw.json                 ← gateway config, auth token
  workspace/                    ← agent workspace (MEMORY.md, etc.)
  agents/main/sessions/         ← session history
  ...

~/.multiclaw/
  instances.json                ← instance list + port counter (app state)

~/Projects/manyclaw/           ← App source
  src/
    main/                       ← Main process
      main.ts                   ← ~200 lines: window, app lifecycle, IPC wiring only
      ipc/
        instances.ts            ← instance IPC handlers (~150 lines)
        chat.ts                 ← chat.send handler
        gateway.ts              ← gateway:status / gateway:start
        shell.ts                ← shell.openExternal, dialogs
    instances/                  ← Ported from openclaw-desktop (unchanged)
      manager.ts                ← InstanceManager class + port free-list
      sandbox.ts                ← launchInstance / killInstance / getOpenClawBin
      types.ts                  ← Instance, InstanceInfo, InstanceStatus
    preload/
      preload.ts                ← contextBridge: exposes window.multiclaw
    renderer/                   ← Renderer (React UI)
      index.html
      index.css
      main.tsx                  ← React root mount
      App.tsx                   ← Sidebar + instance pane layout (~300 lines)
      components/
        InstanceSidebar.tsx     ← Ported from openclaw-desktop
        InstanceView.tsx        ← Ported from openclaw-desktop
        TerminalPane.tsx        ← Ported from openclaw-desktop
      hooks/
      lib/
        utils.ts                ← shadcn cn() utility
    shared/
      ipc.ts                    ← IPC channel names + ALL shared types
```

## IPC Architecture

```
Renderer                       Preload (Bridge)              Main
─────────────────              ────────────────              ────────────
window.multiclaw.              contextBridge.                ipcMain.handle(
  instances.list()    ──────►  exposeInMainWorld  ──────►      'instances:list'
                       invoke                               )

window.multiclaw.
  instances.onStatusChange(cb)
                      ◄──────  ipcRenderer.on     ◄──────   webContents.send(
                       event    'instance:statusChanged'       'instance:statusChanged',
                                                               instanceInfo
                                                             )
```

### Why this split?

- **Renderer** never touches Node APIs (no `require`, no `fs`, no `child_process`)
- **Preload** is the only place `ipcRenderer` is imported — it's the security boundary
- **Main** owns all process management, file I/O, and system calls
- **contextBridge** prevents renderer from accessing arbitrary Electron APIs

## IPC Surface (complete)

Defined in `src/shared/ipc.ts`. See that file for the full type contract.

```typescript
window.multiclaw = {
  instances: {
    list(): Promise<InstanceInfo[]>
    start(id: string): Promise<InstanceInfo>
    stop(id: string): Promise<InstanceInfo>
    create(opts: { name: string; color: string }): Promise<InstanceInfo>
    delete(id: string): Promise<{ cancelled?: boolean }>
    getLogs(id: string): Promise<string[]>
    onStatusChange(cb: (instance: InstanceInfo) => void): () => void
    onLog(id: string, cb: (line: string) => void): () => void
  },
  chat: {
    send(opts: {
      content: string
      instanceId: string
      conversationId?: string
    }): Promise<ChatResult>
  },
  gateway: {
    status(): Promise<GatewayStatus>
    start(): Promise<GatewayStatus>
  },
  shell: {
    openExternal(url: string): Promise<void>
  }
}
```

## Chat Tab

The Chat tab has an instance selector. Selecting an instance routes the message to that profile's gateway (correct port + auth token from `~/.openclaw-{id}/openclaw.json`). Defaults to the first running instance.

## Deleting an Instance

1. Must be stopped first (blocked if running — enforced in main process)
2. Native macOS confirmation dialog (via `dialog.showMessageBox`) with checkbox:
   - Unchecked (default): removes from sidebar only — `~/.openclaw-{id}/` preserved
   - Checked: removes from sidebar AND deletes `~/.openclaw-{id}/` entirely
3. Returns `{ cancelled: true }` if user clicked Cancel

## openclaw Binary Resolution

```typescript
// src/instances/sandbox.ts
function getOpenClawBin(): string {
  // 1. Bundled binary inside the .app (production)
  const bundled = path.join(process.resourcesPath, 'openclaw')
  if (fs.existsSync(bundled)) return bundled

  // 2. System installation (development)
  for (const p of ['/opt/homebrew/bin/openclaw', '/usr/local/bin/openclaw']) {
    if (fs.existsSync(p)) return p
  }

  // 3. PATH (last resort)
  try { return execSync('which openclaw').trim() } catch {}
  return 'openclaw'
}
```

## Bundling openclaw

For distribution, the openclaw CLI binary is placed in `resources/openclaw` before building. electron-builder copies it to `Resources/openclaw` inside the `.app`, outside the ASAR archive (so it can be executed).

### Building for distribution

1. **Bundle the binary**: `pnpm copy-openclaw` finds the installed openclaw binary and copies it to `resources/openclaw`
2. **Build the DMG**: `pnpm dist:mac` compiles the app and packages it
3. The `prepack` script runs `copy-openclaw` automatically before `electron-builder`, so the binary is always fresh

The binary in `resources/` is gitignored (large, platform-specific). CI will need to fetch it separately.

## What This App Does NOT Do

- WhatsApp / Telegram integration
- Browser automation
- Skills management
- Claude / Codex / Gemini OAuth
- Pro features / API key management

Those belong in openclaw's own TUI and web UI. This app is the visual shell.
