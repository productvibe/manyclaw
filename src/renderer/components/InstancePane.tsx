import { useState, useEffect, useRef, useCallback } from 'react'
import type { InstanceInfo } from '@shared/ipc'
import StatusDot from './StatusDot'
import HintBar from './HintBar'

function tuiApi() {
  return window.multiclaw.instances
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip ANSI escape sequences for plain-text rendering */
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\x1b[()][A-Z0-9]/g, '')
}

/** Map a KeyboardEvent to the string to send via tuiInput */
function keyEventToData(e: React.KeyboardEvent): string | null {
  // Ignore modifier-only keys
  if (['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'Tab'].includes(e.key)) return null

  // Ctrl combos
  if (e.ctrlKey && e.key.length === 1) {
    const code = e.key.toUpperCase().charCodeAt(0) - 64
    if (code > 0 && code < 32) return String.fromCharCode(code)
  }

  switch (e.key) {
    case 'Enter':     return '\r'
    case 'Backspace': return '\x7f'
    case 'Escape':    return '\x1b'
    case 'Tab':       return '\t'
    case 'ArrowUp':   return '\x1b[A'
    case 'ArrowDown': return '\x1b[B'
    case 'ArrowRight':return '\x1b[C'
    case 'ArrowLeft': return '\x1b[D'
    case 'Home':      return '\x1b[H'
    case 'End':       return '\x1b[F'
    case 'PageUp':    return '\x1b[5~'
    case 'PageDown':  return '\x1b[6~'
    case 'Delete':    return '\x1b[3~'
    case 'Insert':    return '\x1b[2~'
    default:
      // Printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) return e.key
      return null
  }
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

type Tab = 'tui' | 'logs'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

function TabBar({ active, onChange }: TabBarProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'tui',  label: 'TUI' },
    { id: 'logs', label: 'Logs' },
  ]

  return (
    <div
      style={{
        height: 32,
        background: 'var(--instance-toolbar-bg)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'flex-end',
        paddingLeft: 16,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              height: 28,
              padding: '0 12px',
              fontSize: 'var(--font-size-label)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
              fontFamily: 'var(--font)',
              background: isActive ? 'var(--terminal-bg)' : 'transparent',
              color: isActive ? 'var(--text-terminal)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              cursor: 'pointer',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent'
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ── TUI pane ──────────────────────────────────────────────────────────────────

interface TuiPaneProps {
  instanceId: string
}

function TuiPane({ instanceId }: TuiPaneProps) {
  const [chunks, setChunks] = useState<string[]>([])
  const [launched, setLaunched] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLPreElement>(null)

  // Launch TUI and subscribe to output
  useEffect(() => {
    setChunks([])
    setLaunched(false)

    const api = tuiApi()
    api.launchTui(instanceId)
      .then(() => setLaunched(true))
      .catch(() => setLaunched(true)) // show output even if launch call errors

    const unsubscribe = api.onTuiData(instanceId, (data) => {
      setChunks((prev) => [...prev, data])
    })

    return () => unsubscribe()
  }, [instanceId])

  // Auto-scroll to bottom when new data arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [chunks])

  // Focus the pre on mount so keyboard events are captured immediately
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const data = keyEventToData(e)
      if (data === null) return
      e.preventDefault()
      e.stopPropagation()
      tuiApi().sendTuiInput(instanceId, data).catch(() => {/* IPC errors are non-fatal */})
    },
    [instanceId],
  )

  const displayText = chunks.map(stripAnsi).join('')

  return (
    <pre
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        flex: 1,
        margin: 0,
        background: 'var(--terminal-bg)',
        color: 'var(--text-terminal)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-mono)',
        lineHeight: 'var(--line-height-terminal)',
        padding: '12px 16px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        outline: focused ? '2px solid rgba(0,122,255,0.4)' : 'none',
        outlineOffset: '-2px',
        cursor: 'text',
      }}
    >
      {!launched && (
        <span style={{ color: 'var(--text-terminal-dim)' }}>Connecting to TUI…{'\n'}</span>
      )}
      {displayText || (launched && (
        <span style={{ color: 'var(--text-terminal-dim)' }}>Waiting for output…</span>
      ))}
    </pre>
  )
}

// ── Logs pane ─────────────────────────────────────────────────────────────────

interface LogsPaneProps {
  instance: InstanceInfo
}

function LogsPane({ instance }: LogsPaneProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load existing logs on instance change
  useEffect(() => {
    setLogs([])
    if (instance.status === 'running' || instance.status === 'error') {
      setLoadingLogs(true)
      window.multiclaw.instances
        .getLogs(instance.id)
        .then((lines) => {
          setLogs(lines)
          setLoadingLogs(false)
        })
        .catch(() => setLoadingLogs(false))
    }
  }, [instance.id])

  // Subscribe to live log lines
  useEffect(() => {
    const unsubscribe = window.multiclaw.instances.onLog(instance.id, (line) => {
      setLogs((prev) => [...prev, line])
    })
    return () => unsubscribe()
  }, [instance.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: 'var(--terminal-bg)',
        color: 'var(--text-terminal)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-mono)',
        lineHeight: 'var(--line-height-terminal)',
        padding: '12px 16px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
      }}
    >
      {/* Stopped empty state */}
      {instance.status === 'stopped' && logs.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 8,
            color: 'var(--text-terminal-dim)',
          }}
        >
          <div style={{ opacity: 0.4 }}>─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─</div>
          <div>Instance is stopped.</div>
          <div>Press Start to run it.</div>
          <div style={{ opacity: 0.4 }}>─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─</div>
        </div>
      )}

      {/* Error state */}
      {instance.status === 'error' && (
        <div style={{ marginBottom: 16, color: '#FF9500' }}>
          ⚠ Instance exited with error
          {instance.lastError && (
            <div style={{ color: 'var(--text-terminal)', marginTop: 4 }}>
              {instance.lastError}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loadingLogs && (
        <div style={{ color: 'var(--text-terminal-dim)' }}>Loading logs…</div>
      )}

      {/* Log lines */}
      {logs.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {line}
        </div>
      ))}
    </div>
  )
}

// ── InstancePane ──────────────────────────────────────────────────────────────

interface InstancePaneProps {
  instance: InstanceInfo
  showHint: boolean
  onHintDismiss: () => void
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
}

const STATUS_LABELS: Record<string, string> = {
  running:  'Running',
  stopped:  'Stopped',
  starting: 'Starting…',
  error:    'Error',
}

export default function InstancePane({
  instance,
  showHint,
  onHintDismiss,
  onStart,
  onStop,
}: InstancePaneProps) {
  const [actionPending, setActionPending] = useState(false)
  const [tab, setTab] = useState<Tab>('tui')

  // When instance transitions to running, switch to TUI tab
  // When it stops, fall back to logs
  useEffect(() => {
    if (instance.status === 'running') {
      setTab('tui')
    } else {
      setTab('logs')
    }
  }, [instance.status])

  async function handleStart() {
    if (actionPending) return
    setActionPending(true)
    try {
      await onStart(instance.id)
    } finally {
      setActionPending(false)
    }
  }

  async function handleStop() {
    if (actionPending) return
    setActionPending(true)
    try {
      await onStop(instance.id)
    } finally {
      setActionPending(false)
    }
  }

  const isRunning = instance.status === 'running'
  const isStopped = instance.status === 'stopped' || instance.status === 'error'
  const isTransitioning = instance.status === 'starting'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hint bar (first launch only) */}
      {showHint && <HintBar onDismiss={onHintDismiss} />}

      {/* Instance toolbar */}
      <div
        style={{
          height: 'var(--instance-toolbar-height)',
          background: 'var(--instance-toolbar-bg)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Instance name */}
        <span
          style={{
            fontSize: 'var(--font-size-title)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
          }}
        >
          {instance.name}
        </span>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={instance.status} size={8} />
          <span
            style={{
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
            }}
          >
            {STATUS_LABELS[instance.status] ?? instance.status}
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        {isStopped && (
          <TintButton variant="success" onClick={handleStart} disabled={actionPending}>
            ▶ Start
          </TintButton>
        )}
        {isRunning && (
          <>
            <GhostButton
              onClick={() =>
                window.multiclaw.shell.openExternal(`http://127.0.0.1:${instance.port}`)
              }
              title="Open in browser"
            >
              🌐 Open in Browser ↗
            </GhostButton>
            <TintButton variant="destructive" onClick={handleStop} disabled={actionPending}>
              ■ Stop
            </TintButton>
            <TintButton variant="warning" onClick={handleStart} disabled={actionPending}>
              ↺ Restart
            </TintButton>
          </>
        )}
        {isTransitioning && (
          <TintButton variant="warning" disabled>
            {instance.status === 'starting' ? 'Starting…' : 'Stopping…'}
          </TintButton>
        )}
      </div>

      {/* Tab bar — only when running */}
      {isRunning && <TabBar active={tab} onChange={setTab} />}

      {/* Content */}
      {isRunning && tab === 'tui' ? (
        <TuiPane instanceId={instance.id} />
      ) : (
        <LogsPane instance={instance} />
      )}
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────

interface GhostButtonProps {
  onClick: () => void
  title?: string
  children: React.ReactNode
}

function GhostButton({ onClick, title, children }: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        height: 28,
        borderRadius: 'var(--radius-md)',
        padding: '0 10px',
        fontSize: 12,
        fontWeight: 'var(--font-weight-medium)',
        fontFamily: 'var(--font)',
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  )
}

interface TintButtonProps {
  variant: 'success' | 'destructive' | 'warning'
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

const TINT_STYLES: Record<
  TintButtonProps['variant'],
  { bg: string; color: string; border: string }
> = {
  success: {
    bg: 'rgba(52,199,89,0.12)',
    color: '#34C759',
    border: '1px solid rgba(52,199,89,0.30)',
  },
  destructive: {
    bg: 'rgba(255,59,48,0.10)',
    color: '#FF3B30',
    border: '1px solid rgba(255,59,48,0.25)',
  },
  warning: {
    bg: 'rgba(255,149,0,0.10)',
    color: '#FF9500',
    border: '1px solid rgba(255,149,0,0.25)',
  },
}

function TintButton({ variant, onClick, disabled, children }: TintButtonProps) {
  const s = TINT_STYLES[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 28,
        borderRadius: 'var(--radius-md)',
        padding: '0 10px',
        fontSize: 12,
        fontWeight: 'var(--font-weight-medium)',
        fontFamily: 'var(--font)',
        background: s.bg,
        color: s.color,
        border: s.border,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 120ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = '0.8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = disabled ? '0.6' : '1'
      }}
    >
      {children}
    </button>
  )
}
