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

  GATEWAY_STATUS:       'gateway:status',
  GATEWAY_START:        'gateway:start',

  SHELL_OPEN_EXTERNAL:  'shell:openExternal',

  INSTANCES_LAUNCH_TUI: 'instances:launchTui',
  INSTANCES_TUI_INPUT:  'instances:tui:input',

  // events (main → renderer, via ipcRenderer.on)
  INSTANCE_STATUS_CHANGED: 'instance:statusChanged',
  INSTANCE_LOG_LINE:       'instance:logLine',   // channel is `instance:logLine:{id}`
  INSTANCE_TUI_DATA:       'instance:tui:data',  // channel is `instance:tui:data:{id}`
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
  status: InstanceStatus
  lastError?: string
  pid?: number
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

export interface MultiClawAPI {
  instances: {
    /** Returns all instances with current status */
    list(): Promise<InstanceInfo[]>

    /** Starts the openclaw gateway for this instance. Idempotent if already running. */
    start(id: string): Promise<InstanceInfo>

    /** Gracefully stops the gateway process. */
    stop(id: string): Promise<InstanceInfo>

    /** Creates a new instance with the given name and sidebar color. */
    create(opts: { name: string; color: string }): Promise<InstanceInfo>

    /**
     * Deletes an instance. Shows native confirmation dialog.
     * Returns { cancelled: true } if user cancelled.
     * Instance must be stopped first (main enforces this).
     */
    delete(id: string): Promise<{ cancelled?: boolean }>

    /** Returns recent log lines (up to 2000) for the given instance. */
    getLogs(id: string): Promise<string[]>

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

    /**
     * Launch the TUI for an instance (opens `openclaw --profile {id} tui` as a PTY).
     * Idempotent — if the TUI is already running, returns { started: false }.
     */
    launchTui(id: string): Promise<{ started: boolean }>

    /**
     * Send raw keystroke data to the instance's TUI PTY.
     */
    sendTuiInput(id: string, data: string): Promise<void>

    /**
     * Subscribe to PTY output for a specific instance's TUI.
     * Returns an unsubscribe function.
     */
    onTuiData(id: string, cb: (data: string) => void): () => void
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
  }
}

// Augment the global Window type so renderer code gets full autocomplete
declare global {
  interface Window {
    multiclaw: MultiClawAPI
  }
}
