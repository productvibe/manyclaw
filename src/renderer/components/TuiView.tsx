import { useEffect, useRef } from 'react'
import { Play, Loader2 } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import { Button } from '@/components/ui/button'
import MacMiniIcon from './MacMiniIcon'
import BootLogCard from './BootLogCard'
import TuiPane from './TuiPane'

interface TuiViewProps {
  instance: InstanceInfo
  tuiMounted: boolean
  visible: boolean
  onMountTui: () => void
  onStart: (id: string) => Promise<void>
}

export default function TuiView({ instance, tuiMounted, visible, onMountTui, onStart }: TuiViewProps) {
  const prevStatusRef = useRef(instance.status)

  useEffect(() => {
    if (prevStatusRef.current === 'starting' && instance.status === 'running') {
      onMountTui()
    }
    prevStatusRef.current = instance.status
  }, [instance.status, onMountTui])

  const isRunning = instance.status === 'running'
  const isStarting = instance.status === 'starting'
  const isStopped = instance.status === 'stopped' || instance.status === 'error'

  if (isRunning && tuiMounted) {
    return <TuiPane instance={instance} visible={visible} />
  }

  const iconColor = isStarting ? '#FF9500' : '#8E8E93'

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <MacMiniIcon color={iconColor} size={96} />

      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">{instance.name}</h2>
        {instance.label && (
          <p className="text-sm mt-0.5 text-muted-foreground">{instance.label}</p>
        )}
        <p className="text-sm mt-0.5 text-muted-foreground">Port :{instance.port}</p>
      </div>

      {isStopped && (
        <>
          {instance.status === 'error' && instance.lastError && (
            <p className="text-sm text-destructive">{instance.lastError}</p>
          )}
          <Button onClick={() => onStart(instance.id)} className="gap-1.5">
            <Play className="h-4 w-4" />
            Start
          </Button>
        </>
      )}

      {isStarting && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting profile...
          </div>
          <BootLogCard instanceId={instance.id} />
        </>
      )}

      {isRunning && !tuiMounted && (
        <Button onClick={onMountTui} className="gap-1.5">
          <Play className="h-4 w-4" />
          Open TUI
        </Button>
      )}
    </div>
  )
}
