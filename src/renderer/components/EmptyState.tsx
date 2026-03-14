interface EmptyStateProps {
  onNewInstance: () => void
}

export default function EmptyState({ onNewInstance }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 0,
        padding: 24,
      }}
    >
      {/* App icon placeholder */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'rgba(0,122,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#007AFF" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#007AFF" opacity="0.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#007AFF" opacity="0.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#007AFF" opacity="0.3" />
        </svg>
      </div>

      <h2
        style={{
          fontSize: 'var(--font-size-headline)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
          margin: '16px 0 0',
        }}
      >
        No instances yet
      </h2>

      <p
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--text-secondary)',
          maxWidth: 260,
          textAlign: 'center',
          lineHeight: 1.5,
          margin: '6px 0 0',
        }}
      >
        Run multiple OpenClaw profiles side by side — dev, staging, production, or more.
      </p>

      <button
        onClick={onNewInstance}
        style={{
          marginTop: 20,
          height: 32,
          borderRadius: 8,
          background: '#007AFF',
          color: '#FFFFFF',
          border: 'none',
          padding: '0 16px',
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font)',
          cursor: 'pointer',
          transition: 'opacity 120ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        + New Instance
      </button>
    </div>
  )
}
