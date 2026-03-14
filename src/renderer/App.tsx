import { useState, useEffect } from 'react'
import { useInstances } from './hooks/useInstances'
import { useChat } from './hooks/useChat'
import Sidebar from './components/Sidebar'
import InstancePane from './components/InstancePane'
import EmptyState from './components/EmptyState'
import ChatView from './components/ChatView'
import { HINT_DISMISSED_KEY } from './components/HintBar'

type View = 'instance' | 'chat'

export default function App() {
  const { instances, loading, start, stop, create, deleteInstance } = useInstances()
  const { messages, sending, send, clearMessages } = useChat()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<View>('instance')
  const [showHint, setShowHint] = useState(
    () => !localStorage.getItem(HINT_DISMISSED_KEY),
  )
  const [newInstanceOpen, setNewInstanceOpen] = useState(false)

  // Auto-select first instance on load
  useEffect(() => {
    if (!loading && instances.length > 0 && selectedId === null) {
      setSelectedId(instances[0].id)
    }
  }, [loading, instances, selectedId])

  // If selected instance was deleted, select next available
  useEffect(() => {
    if (selectedId && !instances.find((i) => i.id === selectedId)) {
      setSelectedId(instances[0]?.id ?? null)
    }
  }, [instances, selectedId])

  const selectedInstance = selectedId ? instances.find((i) => i.id === selectedId) ?? null : null

  async function handleCreate(opts: { name: string; color: string }) {
    const instance = await create(opts)
    if (instance) {
      setSelectedId(instance.id)
      setView('instance')
    }
  }

  async function handleDelete(id: string) {
    const deleted = await deleteInstance(id)
    return deleted
  }

  function handleSelectInstance(id: string) {
    setSelectedId(id)
    setView('instance')
  }

  function handleOpenNewInstance() {
    setNewInstanceOpen(true)
  }

  // Unused but satisfies the prop expectation via Sidebar's internal dialog
  void newInstanceOpen
  void setNewInstanceOpen

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'var(--font)',
      }}
    >
      {/* ── Main toolbar (full-width, 52px, draggable) ── */}
      <header
        className="toolbar-drag"
        style={{
          height: 'var(--toolbar-height)',
          background: 'var(--toolbar-bg)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Left: spacer for traffic lights */}
        <div style={{ width: 80, flexShrink: 0 }} />

        {/* Center: app title */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--font-size-title)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            pointerEvents: 'none',
          }}
        >
          MultiClaw
        </div>

        {/* Right: chat icon */}
        <div style={{ flex: 1 }} />
        <button
          className="toolbar-no-drag"
          onClick={() => setView(view === 'chat' ? 'instance' : 'chat')}
          title="Chat (⌘T)"
          style={{
            marginRight: 12,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: view === 'chat' ? 'rgba(0,122,255,0.10)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            color: view === 'chat' ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (view !== 'chat') e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
          }}
          onMouseLeave={(e) => {
            if (view !== 'chat') e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 3.5A1.5 1.5 0 013.5 2h11A1.5 1.5 0 0116 3.5v8A1.5 1.5 0 0114.5 13H6l-4 3V3.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* ── Content row: sidebar + main ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <Sidebar
          instances={instances}
          selectedId={selectedId}
          onSelect={handleSelectInstance}
          onStart={start}
          onStop={stop}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />

        {/* Main content */}
        <main
          style={{
            flex: 1,
            height: '100%',
            background: 'var(--content-bg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat view */}
          {view === 'chat' && (
            <ChatView
              instances={instances}
              selectedInstanceId={selectedId}
              messages={messages}
              sending={sending}
              onBack={() => setView('instance')}
              onSend={send}
              onClearMessages={clearMessages}
              onStartInstance={start}
            />
          )}

          {/* Instance view */}
          {view === 'instance' && (
            <>
              {loading ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  Loading…
                </div>
              ) : instances.length === 0 ? (
                <EmptyState onNewInstance={handleOpenNewInstance} />
              ) : selectedInstance ? (
                <InstancePane
                  instance={selectedInstance}
                  showHint={showHint}
                  onHintDismiss={() => setShowHint(false)}
                  onStart={start}
                  onStop={stop}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  Select an instance from the sidebar
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
