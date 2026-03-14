import '@xterm/xterm/css/xterm.css'
import type { InstanceInfo } from '@shared/ipc'
import { useTerminalPane } from '../hooks/useTerminalPane'

export default function TuiPane({ instance, visible }: { instance: InstanceInfo; visible: boolean }) {
  const containerRef = useTerminalPane(
    visible,
    (cols, rows) => window.multiclaw.instances.launchTui(instance.id, cols, rows),
    (cb) => window.multiclaw.instances.onTuiData(instance.id, cb),
    (cb) => window.multiclaw.instances.onTuiExit(instance.id, cb),
    (data) => window.multiclaw.instances.sendTuiInput(instance.id, data),
    (cols, rows) => window.multiclaw.instances.resizeTui(instance.id, cols, rows),
    [instance.id],
  )

  return <div ref={containerRef} className="h-full overflow-hidden p-2" style={{ background: '#1C1C1E' }} />
}
