import { useState, useRef, useEffect } from 'react'
import type { InstanceInfo } from '@shared/ipc'
import type { ChatMessage } from '../hooks/useChat'
import StatusDot from './StatusDot'

interface ChatViewProps {
  instances: InstanceInfo[]
  selectedInstanceId: string | null
  messages: ChatMessage[]
  sending: boolean
  onBack: () => void
  onSend: (content: string, instanceId: string) => Promise<void>
  onClearMessages: () => void
  onStartInstance: (id: string) => Promise<void>
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatView({
  instances,
  selectedInstanceId,
  messages,
  sending,
  onBack,
  onSend,
  onClearMessages,
  onStartInstance,
}: ChatViewProps) {
  const [activeId, setActiveId] = useState<string>(
    selectedInstanceId ?? instances[0]?.id ?? '',
  )
  const [input, setInput] = useState('')
  const [startPending, setStartPending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync activeId when selectedInstanceId changes
  useEffect(() => {
    if (selectedInstanceId) setActiveId(selectedInstanceId)
  }, [selectedInstanceId])

  // Clear messages when switching instances
  const prevActiveRef = useRef(activeId)
  useEffect(() => {
    if (prevActiveRef.current !== activeId) {
      onClearMessages()
      prevActiveRef.current = activeId
    }
  }, [activeId, onClearMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const activeInstance = instances.find((i) => i.id === activeId)
  const isRunning = activeInstance?.status === 'running'

  async function handleSend() {
    const content = input.trim()
    if (!content || !activeId || sending || !isRunning) return
    setInput('')
    await onSend(content, activeId)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleStart() {
    if (!activeId || startPending) return
    setStartPending(true)
    try {
      await onStartInstance(activeId)
    } finally {
      setStartPending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat toolbar */}
      <div
        style={{
          height: 44,
          background: 'var(--instance-toolbar-bg)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'var(--font)',
            padding: '0 4px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path
              d="M8 2L2 8L8 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {/* Title */}
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 'var(--font-size-title)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
          }}
        >
          Chat
        </span>

        {/* Instance picker */}
        <select
          className="select-native"
          value={activeId}
          onChange={(e) => setActiveId(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {instances.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
              {inst.status !== 'running' ? ` (${inst.status})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          background: 'var(--content-bg)',
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Empty chat state */}
        {messages.length === 0 && !sending && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: activeInstance?.color ?? 'var(--accent)',
              }}
            />
            <div
              style={{
                fontSize: 'var(--font-size-title)',
                fontWeight: 'var(--font-weight-semibold)',
                color: activeInstance?.color ?? 'var(--accent)',
                marginTop: 4,
              }}
            >
              Start chatting with {activeInstance?.name ?? 'your instance'}
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              Type a message below to send it to your running instance.
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Thinking indicator */}
        {sending && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '10px 14px',
              background: '#F2F2F7',
              borderRadius: '16px 16px 16px 4px',
              alignSelf: 'flex-start',
              marginBottom: 8,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`thinking-dot`}
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--text-secondary)',
                }}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div
        style={{
          height: 56,
          background: '#FAFAFA',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Instance stopped warning */}
        {!isRunning && activeInstance ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,149,0,0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              height: 36,
            }}
          >
            <StatusDot status={activeInstance.status} size={8} />
            <span
              style={{
                flex: 1,
                fontSize: 'var(--font-size-body)',
                color: 'var(--text-secondary)',
              }}
            >
              {activeInstance.name} is {activeInstance.status}. Start it to chat.
            </span>
            <button
              onClick={handleStart}
              disabled={startPending}
              style={{
                height: 24,
                padding: '0 10px',
                fontSize: 12,
                fontFamily: 'var(--font)',
                background: 'rgba(52,199,89,0.12)',
                color: '#34C759',
                border: '1px solid rgba(52,199,89,0.30)',
                borderRadius: 'var(--radius-md)',
                cursor: startPending ? 'default' : 'pointer',
                fontWeight: 500,
              }}
            >
              {startPending ? 'Starting…' : '▶ Start'}
            </button>
          </div>
        ) : (
          <>
            {/* Chat input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeInstance?.name ?? 'instance'}…`}
              disabled={sending}
              style={{
                flex: 1,
                height: 36,
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 18,
                padding: '0 14px',
                fontSize: 'var(--font-size-body)',
                fontFamily: 'var(--font)',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 120ms ease',
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(0,122,255,0.5)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)')
              }
            />

            {/* Send button */}
            <button
              className={`send-button ${input.trim() && !sending ? 'send-button--active' : 'send-button--inactive'}`}
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 13V3M3 8l5-5 5 5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div
      className={`chat-bubble chat-bubble--${isUser ? 'user' : 'assistant'}`}
      style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}
    >
      <div style={{ wordBreak: 'break-word' }}>{message.content}</div>
      <div
        className="chat-timestamp"
        style={{ textAlign: isUser ? 'right' : 'left' }}
      >
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}
