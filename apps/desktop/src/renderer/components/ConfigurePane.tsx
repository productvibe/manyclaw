import '@xterm/xterm/css/xterm.css'
import { useTerminalPane } from '../hooks/useTerminalPane'

export default function ConfigurePane({ instanceId, visible }: { instanceId: string; visible: boolean }) {
  const containerRef = useTerminalPane(
    visible,
    (_cols, _rows) => window.multiclaw.instances.launchConfigure(instanceId),
    (cb) => window.multiclaw.instances.onConfigureData(instanceId, cb),
    (cb) => window.multiclaw.instances.onConfigureExit(instanceId, cb),
    (data) => window.multiclaw.instances.sendConfigureInput(instanceId, data),
    (cols, rows) => window.multiclaw.instances.resizeConfigure(instanceId, cols, rows),
    [instanceId],
  )

  return <div ref={containerRef} className="h-full overflow-hidden p-2" style={{ background: '#1C1C1E' }} />
}
