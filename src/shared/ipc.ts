/**
 * IPC channel names and shared types.
 *
 * This file is imported by BOTH main process and renderer (via preload).
 * Keep it free of Node-only or browser-only imports.
 */

// ── Channel names ──────────────────────────────────────────────────────────

export const IPC = {
  // invoke (renderer → main, returns Promise)
  INSTANCES_LIST:       'instances:list',
  INSTANCES_START:      'instances:start',
  INSTANCES_STOP:       'instances:stop',
  INSTANCES_CREATE:     'instances:create',
  INSTANCES_DELETE:     'instances:delete',
  INSTANCES_GET_LOGS:   'instances:getLogs',
  INSTANCES_OPEN_DASHBOARD: 'instances:openDashboard',

  GATEWAY_STATUS:       'gateway:status',
  GATEWAY_START:        'gateway:start',

  SHELL_OPEN_EXTERNAL:  'shell:openExternal',

  // events (main → renderer, via ipcRenderer.on)
  INSTANCE_STATUS_CHANGED: 'instance:statusChanged',
  INSTANCE_LOG_LINE:       'instance:logLine',   // channel is `instance:logLine:{id}`
} as const

// ── Core types ─────────────────────────────────────────────────────────────

export type InstanceStatus = 'stopped' | 'starting' | 'running' | 'error'

/**
 * The public view of an instance — safe to send over IPC.
 * Does NOT include apiKey or internal workspacePath.
 */
export interface InstanceInfo {
  /** Used as the --profile name and directory suffix: ~/.openclaw-{id}/ */
  id: string
  /** Human display name shown in sidebar */
  name: string
  /** Gateway port (40000+) */
  port: number
  /** Hex color for sidebar status dot, e.g. "#3b82f6" */
  color: string
  /** Optional short label/comment shown on the profile card */
  label?: string
  status: InstanceStatus
  lastError?: string
  pid?: number
  /** Absolute path to the profile data dir */
  profileDir: string
}

export interface GatewayStatus {
  running: boolean
  port?: number
}

// ── window.multiclaw API contract ─────────────────────────────────────────
//
// This is the surface Finley (renderer) codes against.
// Brook (main) implements it in preload.ts + ipc/ handlers.
//
// Constraints:
//   - All methods are async (Promise-returning) — IPC is always async
//   - Callbacks (onStatusChange, onLog) are registered in the preload via
//     ipcRenderer.on, so they work across the contextBridge sandbox
//   - Each subscription returns an unsubscribe function (() => void)

export interface ManyClawAPI {
  instances: {
    /** Returns all instances with current status */
    list(): Promise<InstanceInfo[]>

    /** Starts the openclaw gateway for this instance. Idempotent if already running. */
    start(id: string): Promise<InstanceInfo>

    /** Gracefully stops the gateway process. */
    stop(id: string): Promise<InstanceInfo>

    /** Creates a new profile with the given options. */
    create(opts: { name: string; color: string; id?: string; port?: number; label?: string }): Promise<InstanceInfo>

    /** Update profile name/label. */
    update(id: string, opts: { name?: string; label?: string }): Promise<InstanceInfo | undefined>

    /** Clone a profile — copies everything, assigns new port. */
    clone(id: string, name?: string): Promise<InstanceInfo>

    /** Get the next suggested port number. */
    getNextPort(): Promise<number>

    /** Check if a profile id or port already exists. */
    validate(opts: { id: string; port: number }): Promise<{ idExists: boolean; portExists: boolean; dirExists: boolean }>

    /**
     * Deletes an instance.
     * Instance must be stopped first (main enforces this).
     */
    delete(id: string, opts?: { deleteData?: boolean }): Promise<{ cancelled?: boolean }>

    /** Returns recent log lines (up to 2000) for the given instance. */
    getLogs(id: string): Promise<string[]>

    /** Open the dashboard in the default browser via `openclaw --profile {id} dashboard` */
    openDashboard(id: string): Promise<void>

    /** Run non-interactive onboard for this profile. */
    onboard(id: string, opts?: { provider?: string; token?: string; authChoice?: string }): Promise<{ success: boolean; error?: string }>

    /** Add a messaging channel to this profile. */
    addChannel(id: string, opts: { channel: string; token: string }): Promise<{ success: boolean; error?: string }>

    /** Remove a messaging channel from this profile. */
    removeChannel(id: string, opts: { channel: string }): Promise<{ success: boolean; error?: string }>

    /** Check if a channel is configured for this profile. */
    getChannelStatus(id: string, channel: string): Promise<{ enabled: boolean; hasToken: boolean }>

    /** Launch interactive channel login (e.g. WhatsApp QR) in a PTY. */
    launchChannelLogin(id: string, channel: string): Promise<{ started: boolean }>

    /** Kill a running channel login PTY. */
    killChannelLogin(id: string, channel: string): Promise<void>

    /** Send input to a channel login PTY. */
    sendChannelLoginInput(id: string, channel: string, data: string): void

    /** Resize a channel login PTY. */
    resizeChannelLogin(id: string, channel: string, cols: number, rows: number): void

    /** Subscribe to channel login PTY output. */
    onChannelLoginData(id: string, channel: string, cb: (data: string) => void): () => void

    /** Subscribe to channel login PTY exit. */
    onChannelLoginExit(id: string, channel: string, cb: () => void): () => void

    /** Spawn the TUI for this instance in a PTY (idempotent if already running). */
    launchTui(id: string, cols?: number, rows?: number): Promise<{ started: boolean }>

    /** Send raw input to the TUI PTY. */
    sendTuiInput(id: string, data: string): void

    /** Resize the TUI PTY. */
    resizeTui(id: string, cols: number, rows: number): void

    /** Subscribe to raw PTY output from the TUI. */
    onTuiData(id: string, cb: (data: string) => void): () => void

    /** Subscribe to TUI exit events. */
    onTuiExit(id: string, cb: () => void): () => void

    /** Spawn `openclaw --profile {id} configure` in a PTY. */
    launchConfigure(id: string): Promise<{ started: boolean }>

    /** Kill the running configure PTY for this instance. */
    killConfigure(id: string): Promise<void>

    /** Send raw input to the configure PTY. */
    sendConfigureInput(id: string, data: string): void

    /** Resize the configure PTY. */
    resizeConfigure(id: string, cols: number, rows: number): void

    /** Subscribe to raw PTY output from configure. */
    onConfigureData(id: string, cb: (data: string) => void): () => void

    /** Subscribe to configure exit events. */
    onConfigureExit(id: string, cb: () => void): () => void

    /**
     * Subscribe to status changes for any instance.
     * Callback fires whenever an instance's status field changes.
     * Returns an unsubscribe function — call it in useEffect cleanup.
     */
    onStatusChange(cb: (instance: InstanceInfo) => void): () => void

    /**
     * Subscribe to live log output for a specific instance.
     * Returns an unsubscribe function.
     */
    onLog(id: string, cb: (line: string) => void): () => void
  }

  settings: {
    /** Get app-level settings (setup token, etc.) */
    get(): Promise<{ setupToken?: string }>
    /** Save app-level settings */
    save(settings: { setupToken?: string }): Promise<void>
  }

  gateway: {
    /** Check whether the system openclaw gateway (port 18789) is reachable. */
    status(): Promise<GatewayStatus>
    /** Start the system openclaw gateway if not running. */
    start(): Promise<GatewayStatus>
  }

  shell: {
    /** Opens a URL in the default browser. Validates against https:// only. */
    openExternal(url: string): Promise<void>
    /** Opens a folder in Finder. */
    openPath(path: string): Promise<void>
  }
}

// Augment the global Window type so renderer code gets full autocomplete
declare global {
  interface Window {
    multiclaw: ManyClawAPI
  }
}
