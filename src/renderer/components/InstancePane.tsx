import { useState, useCallback } from 'react'
import { Play, Square, RotateCcw, Globe, Loader2 } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import StatusDot from './StatusDot'
import TuiView from './TuiView'
import ProfileView from './ProfileView'

type TopTab = 'tui' | 'profile'

const STATUS_LABELS: Record<string, string> = {
  running: 'Running',
  stopped: 'Stopped',
  starting: 'Starting...',
  error: 'Error',
}

interface InstancePaneProps {
  instance: InstanceInfo
  visible: boolean
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
  onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean>
}

export default function InstancePane({
  instance, visible, onStart, onStop, onDelete,
}: InstancePaneProps) {
  const [actionPending, setActionPending] = useState(false)
  const [topTab, setTopTab] = useState<TopTab>('tui')
  const [tuiMounted, setTuiMounted] = useState(instance.status === 'running')

  // No reset needed — each InstancePane has its own key and stays mounted

  const handleMountTui = useCallback(() => {
    setTuiMounted(true)
    setTopTab('tui')
  }, [])

  async function handleStart() {
    if (actionPending) return
    setActionPending(true)
    try { await onStart(instance.id) } finally { setActionPending(false) }
  }

  async function handleStop() {
    if (actionPending) return
    setActionPending(true)
    try { await onStop(instance.id) } finally { setActionPending(false) }
  }

  const isRunning = instance.status === 'running'
  const isStopped = instance.status === 'stopped' || instance.status === 'error'
  const isTransitioning = instance.status === 'starting'

  return (
    <div className="flex flex-col h-full absolute inset-0" style={{ visibility: visible ? 'visible' : 'hidden', zIndex: visible ? 1 : 0 }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 h-11 shrink-0 bg-muted/50 border-b border-border">
        <span className="text-[15px] font-semibold text-foreground">{instance.name}</span>
        <div className="flex items-center gap-1.5">
          <StatusDot status={instance.status} size={8} />
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
            {STATUS_LABELS[instance.status] ?? instance.status}
          </span>
        </div>

        <div className="flex-1" />

        {/* Top-level tabs */}
        <ToggleGroup
          type="single"
          variant="outline"
          value={topTab}
          onValueChange={(v) => { if (v) setTopTab(v as TopTab) }}
          className="h-7"
        >
          <ToggleGroupItem value="tui" className="h-7 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            TUI
          </ToggleGroupItem>
          <ToggleGroupItem value="profile" className="h-7 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Profile
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Action buttons */}
        {isStopped && (
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleStart} disabled={actionPending}>
            <Play className="h-3.5 w-3.5" />
            Start
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => window.multiclaw.instances.openDashboard(instance.id)}
              title="Open in Browser"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleStart}
              disabled={actionPending}
              title="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleStop}
              disabled={actionPending}
            >
              <Square className="h-3 w-3" />
              Stop
            </Button>
          </>
        )}

        {isTransitioning && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" disabled>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Starting...
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-background"
          style={{
            zIndex: topTab === 'tui' ? 1 : 0,
            visibility: topTab === 'tui' ? 'visible' : 'hidden',
          }}
        >
          <TuiView
            instance={instance}
            tuiMounted={tuiMounted}
            visible={visible && topTab === 'tui'}
            onMountTui={handleMountTui}
            onStart={onStart}
          />
        </div>
        <div
          className="absolute inset-0 bg-background"
          style={{
            zIndex: topTab === 'profile' ? 1 : 0,
            visibility: topTab === 'profile' ? 'visible' : 'hidden',
          }}
        >
          <ProfileView instance={instance} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
