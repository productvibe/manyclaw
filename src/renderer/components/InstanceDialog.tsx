import { useState, useEffect, useRef } from 'react'

const COLORS = [
  { name: 'Blue',   value: '#007AFF' },
  { name: 'Green',  value: '#34C759' },
  { name: 'Orange', value: '#FF9500' },
  { name: 'Red',    value: '#FF3B30' },
  { name: 'Purple', value: '#AF52DE' },
  { name: 'Teal',   value: '#5AC8FA' },
]

interface InstanceDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (opts: { name: string; color: string }) => Promise<void>
}

export default function InstanceDialog({ open, onClose, onCreate }: InstanceDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#007AFF')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setColor('#007AFF')
      setCreating(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  async function handleCreate() {
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      await onCreate({ name: name.trim(), color })
      onClose()
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="dialog-content"
        style={{ width: 360 }}
        onKeyDown={handleKeyDown}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 20px',
          }}
        >
          New Instance
        </h2>

        {/* Name */}
        <label
          style={{
            display: 'block',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          Name
        </label>
        <input
          ref={inputRef}
          className="input-native"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Agent"
          maxLength={64}
          style={{ marginBottom: 20 }}
        />

        {/* Color */}
        <label
          style={{
            display: 'block',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          Color
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {COLORS.map((c) => (
            <button
              key={c.value}
              className="color-swatch"
              data-selected={color === c.value ? 'true' : 'false'}
              onClick={() => setColor(c.value)}
              title={c.name}
              style={{
                background: c.value,
                boxShadow:
                  color === c.value
                    ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${c.value}`
                    : undefined,
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              height: 28,
              padding: '0 12px',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font)',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            style={{
              height: 28,
              padding: '0 12px',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font)',
              background: !name.trim() || creating ? '#C7C7CC' : '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: !name.trim() || creating ? 'default' : 'pointer',
              transition: 'background 150ms ease, opacity 120ms ease',
            }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
