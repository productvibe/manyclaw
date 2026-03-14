import { useState, useEffect, useRef } from 'react'

export default function BootLogCard({ instanceId }: { instanceId: string }) {
  const [logs, setLogs] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLogs([])
    window.multiclaw.instances
      .getLogs(instanceId)
      .then((lines) => setLogs(lines.slice(-8)))
      .catch(() => {})
  }, [instanceId])

  useEffect(() => {
    const unsubscribe = window.multiclaw.instances.onLog(instanceId, (line) => {
      setLogs((prev) => [...prev, line].slice(-8))
    })
    return () => unsubscribe()
  }, [instanceId])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md rounded-lg overflow-hidden font-mono text-[11px] leading-snug p-3 max-h-[10rem] overflow-y-auto bg-[#1C1C1E] text-[#F5F5F7]"
    >
      {logs.length === 0 && (
        <div className="text-[#48484A]">Waiting for output...</div>
      )}
      {logs.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
      ))}
    </div>
  )
}
