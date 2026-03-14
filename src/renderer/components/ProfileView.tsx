import { useState, useEffect } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import LogsPane from './LogsPane'
import ConfigurePane from './ConfigurePane'

type Section = 'details' | 'console' | 'configure' | 'danger'

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'console', label: 'Console' },
  { id: 'configure', label: 'Configure' },
]

interface ProfileViewProps {
  instance: InstanceInfo
  onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean>
}

function DetailsSection({ instance }: { instance: InstanceInfo }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Name', value: instance.name },
    { label: 'Label', value: instance.label || '—' },
    { label: 'Profile ID', value: instance.id },
    { label: 'Directory', value: `~/.openclaw-${instance.id}/` },
    { label: 'Port', value: `:${instance.port}` },
    {
      label: 'Color',
      value: (
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: instance.color }} />
          <span>{instance.color}</span>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-muted-foreground font-medium">{row.label}</dt>
                <dd className="text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function DangerZoneSection({ instance, onDelete }: { instance: InstanceInfo; onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean> }) {
  const [deleteData, setDeleteData] = useState(false)
  const isBusy = instance.status === 'running' || instance.status === 'starting'

  return (
    <div className="p-6">
      <Card className="max-w-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Actions here are irreversible. The profile must be stopped first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium text-foreground">Delete this profile</h4>
              <p className="text-sm text-muted-foreground">
                Remove &ldquo;{instance.name}&rdquo; from MultiClaw. This cannot be undone.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isBusy} className="gap-1.5 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{instance.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the profile from the sidebar. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex items-start gap-3 rounded-lg border border-border p-4 my-2">
                  <Checkbox
                    id="delete-data"
                    checked={deleteData}
                    onCheckedChange={(v) => setDeleteData(v === true)}
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="delete-data" className="text-sm font-medium leading-none cursor-pointer">
                      Also uninstall all data
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Removes sessions, config, and workspace for this profile.
                    </p>
                    {deleteData && (
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                        openclaw --profile {instance.id} uninstall --all --yes
                      </code>
                    )}
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(instance.id, { deleteData })}
                  >
                    Delete Profile
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfileView({ instance, onDelete }: ProfileViewProps) {
  const [section, setSection] = useState<Section>('details')
  const [configureMounted, setConfigureMounted] = useState(false)
  const [configureKey, setConfigureKey] = useState(0)

  useEffect(() => {
    setSection('details')
    setConfigureMounted(false)
  }, [instance.id])

  function switchToConfigure() {
    setConfigureMounted(true)
    setSection('configure')
  }

  async function restartConfigure() {
    await window.multiclaw.instances.killConfigure(instance.id)
    setConfigureKey((k) => k + 1)
    setConfigureMounted(true)
    setSection('configure')
  }

  return (
    <div className="flex h-full">
      {/* Inner left nav */}
      <nav className="w-[160px] shrink-0 border-r border-border p-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant={section === item.id ? 'secondary' : 'ghost'}
            size="sm"
            className={`justify-start h-8 text-sm ${section === item.id ? 'font-semibold' : ''}`}
            onClick={() => item.id === 'configure' ? switchToConfigure() : setSection(item.id)}
          >
            {item.label}
          </Button>
        ))}

        <Separator className="my-3" />

        <Button
          variant={section === 'danger' ? 'secondary' : 'ghost'}
          size="sm"
          className={`justify-start h-8 text-sm text-destructive hover:text-destructive ${section === 'danger' ? 'font-semibold' : ''}`}
          onClick={() => setSection('danger')}
        >
          Danger Zone
        </Button>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        <div
          className="absolute inset-0 overflow-y-auto bg-background"
          style={{ visibility: section === 'details' ? 'visible' : 'hidden', zIndex: section === 'details' ? 1 : 0 }}
        >
          <DetailsSection instance={instance} />
        </div>

        <div
          className="absolute inset-0"
          style={{ visibility: section === 'console' ? 'visible' : 'hidden', zIndex: section === 'console' ? 1 : 0 }}
        >
          <LogsPane instance={instance} />
        </div>

        <div
          className="absolute inset-0 flex flex-col bg-background"
          style={{ visibility: section === 'configure' ? 'visible' : 'hidden', zIndex: section === 'configure' ? 1 : 0 }}
        >
          <div className="flex items-center justify-end px-3 py-1.5 border-b border-border shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={restartConfigure}>
              <RotateCcw className="h-3 w-3" />
              Restart
            </Button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {configureMounted && (
              <div className="absolute inset-0">
                <ConfigurePane key={configureKey} instanceId={instance.id} visible={section === 'configure'} />
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-y-auto bg-background"
          style={{ visibility: section === 'danger' ? 'visible' : 'hidden', zIndex: section === 'danger' ? 1 : 0 }}
        >
          <DangerZoneSection instance={instance} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
