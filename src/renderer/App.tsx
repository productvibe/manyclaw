// App.tsx — Root shell layout
// Two-panel: sidebar (220px, grey) + content area (white, flex-1)
// No functionality yet — structure only. Dee's design specs will layer on top.

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          minWidth: 'var(--sidebar-width)',
          height: '100%',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar / window chrome area */}
        <div
          style={{
            height: 'var(--toolbar-height)',
            borderBottom: '1px solid var(--border-color)',
            // Traffic lights live here on macOS — leave room
            paddingLeft: 80,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-title)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            MultiClaw
          </span>
        </div>

        {/* Nav list placeholder */}
        <nav
          style={{
            flex: 1,
            padding: '8px 0',
            overflowY: 'auto',
          }}
        >
          {/* Placeholder items — Dee will spec these */}
          {['Sessions', 'Agents', 'Settings'].map((label) => (
            <div
              key={label}
              style={{
                height: 'var(--item-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-body)',
                cursor: 'default',
                borderRadius: 6,
                margin: '0 6px',
              }}
            >
              {label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content area */}
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
        {/* Toolbar row */}
        <div
          style={{
            height: 'var(--toolbar-height)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        />

        {/* Body */}
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
          {/* Ready for Dee's design specs */}
          <span>MultiClaw renderer ready</span>
        </div>
      </main>
    </div>
  )
}
