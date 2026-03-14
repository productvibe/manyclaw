/**
 * Instance types for the main process.
 *
 * Re-exports IPC-safe types from shared/ipc.ts, and adds internal-only
 * fields that must never cross the contextBridge boundary.
 */

export type { InstanceInfo, InstanceStatus, GatewayStatus } from '../shared/ipc.js'

/**
 * Internal representation of an instance — extends InstanceInfo with
 * fields that stay in the main process only.
 */
export interface InternalInstance {
  id: string
  name: string
  port: number
  color: string
  status: import('../shared/ipc.js').InstanceStatus
  lastError?: string
  pid?: number
  /** Absolute path to the profile data dir: ~/.openclaw-{id} */
  profileDir: string
}

/**
 * Persisted state in ~/.multiclaw/instances.json
 */
export interface PersistedState {
  instances: PersistedInstance[]
  nextPort: number
  releasedPorts: number[]
}

export interface PersistedInstance {
  id: string
  name: string
  port: number
  color: string
}
