import { useState, useEffect, useRef } from 'react'
import type { InstanceInfo } from '@shared/ipc'

export default function LogsPane({ instance }: { instance: InstanceInfo }) {
  const [logs, setLogs] = useState<string[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLogs([])
    if (instance.status === 'running' || instance.status === 'error') {
      setLoadingLogs(true)
      window.multiclaw.instances
        .getLogs(instance.id)
        .then((lines) => { setLogs(lines); setLoadingLogs(false) })
        .catch(() => setLoadingLogs(false))
    }
  }, [instance.id])

  useEffect(() => {
    const unsubscribe = window.multiclaw.instances.onLog(instance.id, (line) => {
      setLogs((prev) => [...prev, line])
    })
    return () => unsubscribe()
  }, [instance.id])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  function handleMouseUp() {
    const sel = window.getSelection()
    const text = sel?.toString()
    if (text) navigator.clipboard.writeText(text)
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="h-full overflow-y-auto p-3 font-mono text-[11px] leading-snug select-text cursor-text bg-[#1C1C1E] text-[#F5F5F7]"
    >
      {instance.status === 'stopped' && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-[#48484A]">
          <div className="opacity-40">─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─</div>
          <div>Claw is stopped. Press Start to run it.</div>
          <div className="opacity-40">─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─</div>
        </div>
      )}

      {instance.status === 'error' && (
        <div className="mb-4 text-amber-500">
          Warning: Claw exited with error
          {instance.lastError && (
            <div className="mt-1 text-[#F5F5F7]">{instance.lastError}</div>
          )}
        </div>
      )}

      {loadingLogs && (
        <div className="text-[#48484A]">Loading logs...</div>
      )}

      {logs.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
      ))}
    </div>
  )
}
