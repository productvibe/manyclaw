const HINT_DISMISSED_KEY = 'multiclaw_hint_dismissed'

interface HintBarProps {
  onDismiss: () => void
}

export default function HintBar({ onDismiss }: HintBarProps) {
  function handleDismiss() {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true')
    onDismiss()
  }

  return (
    <div className="hint-bar">
      <span style={{ fontSize: 14 }}>ℹ</span>
      <span>
        This is your first profile. Press <strong>Start</strong> to run it, or
        create more using <strong>[+]</strong> in the sidebar.
      </span>
      <button
        className="hint-bar__dismiss toolbar-no-drag"
        onClick={handleDismiss}
        title="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 2L12 12M12 2L2 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}

export { HINT_DISMISSED_KEY }
