import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface TerminalPaneProps {
  instanceId: string
}

export default function TerminalPane({ instanceId }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const terminal = new Terminal({
      fontFamily: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      theme: {
        background: '#1C1C1E',
        foreground: '#F2F2F7',
        cursor: '#F2F2F7',
        selectionBackground: 'rgba(242,242,247,0.2)',
      },
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(el)
    fitAddon.fit()

    const api = window.multiclaw.instances

    // Launch TUI (idempotent)
    api.launchTui(instanceId).catch(() => {})

    // PTY → xterm
    const unsubscribe = api.onTuiData(instanceId, (data) => {
      terminal.write(data)
    })

    // xterm → PTY
    const onDataDisposable = terminal.onData((data) => {
      api.sendTuiInput(instanceId, data).catch(() => {})
    })

    // Resize observer
    const ro = new ResizeObserver(() => {
      fitAddon.fit()
      api.resizeTui(instanceId, terminal.cols, terminal.rows).catch(() => {})
    })
    ro.observe(el)

    return () => {
      unsubscribe()
      onDataDisposable.dispose()
      ro.disconnect()
      terminal.dispose()
    }
  }, [instanceId])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: '#1C1C1E',
        padding: 4,
        overflow: 'hidden',
      }}
    />
  )
}
