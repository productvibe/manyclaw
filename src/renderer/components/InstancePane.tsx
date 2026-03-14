import { useState, useEffect, useRef } from 'react'
import type { InstanceInfo } from '@shared/ipc'
import StatusDot from './StatusDot'
import HintBar from './HintBar'
import { HINT_DISMISSED_KEY } from './HintBar'

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
  const [logs, setLogs] = useState<string[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [actionPending, setActionPending] = useState(false)

  // Load logs on mount / instance change
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

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

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
            <button
              onClick={() => window.multiclaw.shell.openExternal(`http://127.0.0.1:${instance.port}`)}
              title="Open in browser"
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
              🌐 Open in Browser ↗
            </button>
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

      {/* Terminal pane */}
      <div
        ref={terminalRef}
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
          <div
            style={{
              marginBottom: 16,
              color: '#FF9500',
            }}
          >
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
    </div>
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
