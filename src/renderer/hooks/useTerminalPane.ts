import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export const TERM_THEME = {
  background: '#1C1C1E',
  foreground: '#F5F5F7',
  cursor: '#F5F5F7',
  selectionBackground: 'rgba(245,245,247,0.2)',
}

export function useTerminalPane(
  visible: boolean,
  launch: (cols: number, rows: number) => Promise<unknown>,
  onPtyData: (cb: (data: string) => void) => () => void,
  onPtyExit: (cb: () => void) => () => void,
  sendInput: (data: string) => void,
  resize: (cols: number, rows: number) => void,
  deps: unknown[],
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!visible) return
    // Defer fit until browser has laid out the now-visible container
    const raf = requestAnimationFrame(() => {
      try {
        fitAddonRef.current?.fit()
        const term = termRef.current
        if (term) {
          term.refresh(0, term.rows - 1)
          term.focus()
        }
      } catch { /* ignore if disposed */ }
    })
    return () => cancelAnimationFrame(raf)
  }, [visible])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const term = new Terminal({
      theme: TERM_THEME,
      fontFamily: "'SF Mono', 'Menlo', 'Courier New', monospace, 'Monaco'",
      fontSize: 15,
      lineHeight: 1.0,
      cursorBlink: true,
      allowTransparency: false,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(el)
    termRef.current = term
    fitAddonRef.current = fitAddon

    const unsubData = onPtyData((data) => term.write(data))
    const unsubExit = onPtyExit(() => term.writeln('\r\n\x1b[2m[process exited]\x1b[0m'))
    const onData = term.onData((data) => sendInput(data))

    // Launch immediately — don't wait for ResizeObserver
    let launched = false
    function doLaunch() {
      if (launched) return
      launched = true
      console.log('[useTerminalPane] launching PTY (%dx%d)', term.cols, term.rows)
      launch(term.cols, term.rows).then((result) => {
        const r = result as { started?: boolean } | undefined
        if (r && r.started === false) {
          // PTY was already running — force SIGWINCH to trigger full redraw.
          // Data subscription is active (set up before launch), so the
          // redraw output will be captured.
          resize(1, 1)
          resize(term.cols, term.rows)
        }
      }).catch((err) => {
        console.error('[useTerminalPane] launch failed:', err)
        term.writeln('\r\n\x1b[31mFailed to launch.\x1b[0m')
      })
    }

    // Try to fit and launch right away
    try {
      fitAddon.fit()
      resize(term.cols, term.rows)
      doLaunch()
    } catch {
      // Element might not have dimensions yet — ResizeObserver will handle it
      console.log('[useTerminalPane] initial fit failed, waiting for resize')
    }

    // Deferred refresh + focus — ensures xterm paints and accepts input immediately
    const initialRaf = requestAnimationFrame(() => {
      try {
        fitAddon.fit()
        resize(term.cols, term.rows)
        term.refresh(0, term.rows - 1)
        term.focus()
      } catch { /* ignore */ }
    })

    const observer = new ResizeObserver(() => {
      try {
        fitAddon.fit()
        resize(term.cols, term.rows)
      } catch {
        // ignore fit errors on zero-size elements
      }
      doLaunch()
    })
    observer.observe(el)

    return () => {
      cancelAnimationFrame(initialRaf)
      unsubData()
      unsubExit()
      onData.dispose()
      observer.disconnect()
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
    }
  }, deps)

  return containerRef
}
