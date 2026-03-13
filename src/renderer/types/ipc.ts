/**
 * IPC surface types for window.multiclaw.*
 *
 * These are placeholder shapes — Emery will finalize the actual contract.
 * The renderer should ONLY call what's defined here.
 * Never assume the IPC will succeed: handle loading + error states everywhere.
 */

// ─── Placeholder domain types ─────────────────────────────────────────────────

/** A running or historical agent session */
export interface AgentSession {
  id: string
  label: string
  model: string
  status: 'running' | 'idle' | 'error' | 'terminated'
  createdAt: number
  updatedAt: number
}

/** A message in a session */
export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

/** App-level config */
export interface AppConfig {
  theme: 'light' | 'dark' | 'system'
  defaultModel: string
  [key: string]: unknown
}

// ─── IPC API surface ──────────────────────────────────────────────────────────

/** The full window.multiclaw API shape — placeholder pending Emery's spec */
export interface MulticlawAPI {
  /** Session management */
  sessions: {
    list: () => Promise<AgentSession[]>
    get: (id: string) => Promise<AgentSession | null>
    create: (opts: { label?: string; model?: string }) => Promise<AgentSession>
    terminate: (id: string) => Promise<void>
  }

  /** Messaging */
  messages: {
    list: (sessionId: string) => Promise<Message[]>
    send: (sessionId: string, content: string) => Promise<Message>
  }

  /** Config */
  config: {
    get: () => Promise<AppConfig>
    set: (patch: Partial<AppConfig>) => Promise<void>
  }

  /** App-level events (renderer subscribes, main emits) */
  on: (event: string, handler: (...args: unknown[]) => void) => () => void
  off: (event: string, handler: (...args: unknown[]) => void) => void
}

// ─── Global augmentation ─────────────────────────────────────────────────────

declare global {
  interface Window {
    /**
     * Injected by preload.ts (Electron contextBridge).
     * May be undefined in plain browser dev — always guard with optional chaining.
     */
    multiclaw?: MulticlawAPI
  }
}

export {}
