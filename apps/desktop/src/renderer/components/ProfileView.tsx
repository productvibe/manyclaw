import { useState, useEffect } from 'react'
import { Trash2, Loader2, Download } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  { id: 'configure', label: 'Configure' },
]

interface ProfileViewProps {
  instance: InstanceInfo
  onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean>
  onClone: (id: string, name?: string) => Promise<void>
}

function DetailsSection({ instance, onClone }: { instance: InstanceInfo; onClone: (id: string) => Promise<void> }) {
  const isDefault = instance.id === 'default'
  const dirDisplay = isDefault ? '~/.openclaw/' : `~/.openclaw-${instance.id}/`
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(instance.name)
  const [label, setLabel] = useState(instance.label ?? '')

  useEffect(() => {
    setName(instance.name)
    setLabel(instance.label ?? '')
    setEditing(false)
  }, [instance.id, instance.name, instance.label])

  function handleSave() {
    window.multiclaw.instances.update(instance.id, {
      name: name.trim() || instance.name,
      label: label.trim(),
    })
    setEditing(false)
  }

  function handleCancel() {
    setName(instance.name)
    setLabel(instance.label ?? '')
    setEditing(false)
  }

  return (
    <div className="p-6 space-y-4">
      {isDefault && (
        <div className="max-w-lg rounded-lg border border-blue-300/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20 p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is the <strong>system default</strong> Claw, created outside of ManyClaw by the OpenClaw CLI.
            It runs as a background daemon and is shared across all tools that use OpenClaw.
            ManyClaw can monitor and interact with it, but does not manage its lifecycle.
          </p>
        </div>
      )}
      <div className="max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Claw Details</h3>
          {!editing && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        <dl className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm items-center">
          <dt className="text-muted-foreground font-medium">Name</dt>
          <dd>
            {editing ? (
              <input
                className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:border-foreground/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="text-foreground">{instance.name}</span>
            )}
          </dd>
          <dt className="text-muted-foreground font-medium">Description</dt>
          <dd>
            {editing ? (
              <input
                className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:border-foreground/30"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="optional"
              />
            ) : (
              <span className="text-foreground">{instance.label || '—'}</span>
            )}
          </dd>
          <dt className="text-muted-foreground font-medium">Claw ID</dt>
          <dd className="text-foreground font-mono">{instance.id}</dd>
          <dt className="text-muted-foreground font-medium">Directory</dt>
          <dd className="text-foreground font-mono">{dirDisplay}</dd>
          <dt className="text-muted-foreground font-medium">Port</dt>
          <dd className="text-foreground font-mono">:{instance.port}</dd>
        </dl>
        {editing && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}

        <ExportSection instance={instance} />
        <CloneSection instance={instance} onClone={onClone} />
      </div>
    </div>
  )
}

function ExportSection({ instance }: { instance: InstanceInfo }) {
  const [open, setOpen] = useState(false)
  const [includeSessions, setIncludeSessions] = useState(false)
  const [removeApiKeys, setRemoveApiKeys] = useState(true)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await window.multiclaw.instances.exportInstance(instance.id, { includeSessions, removeApiKeys })
    } finally {
      setExporting(false)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium">Export Claw</h4>
          <p className="text-sm text-muted-foreground">
            Save this Claw as a portable .manyclaw file.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Export &ldquo;{instance.name}&rdquo;</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="include-sessions"
                checked={includeSessions}
                onCheckedChange={(v) => setIncludeSessions(v === true)}
              />
              <Label htmlFor="include-sessions" className="text-sm leading-snug cursor-pointer">
                Include session history
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="remove-api-keys"
                checked={removeApiKeys}
                onCheckedChange={(v) => setRemoveApiKeys(v === true)}
              />
              <Label htmlFor="remove-api-keys" className="text-sm leading-snug cursor-pointer">
                Strip credentials
              </Label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Removes API keys, auth tokens, and provider credentials from the export. The recipient will need to configure their own.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Exporting...</>
              ) : (
                'Export'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CloneSection({ instance, onClone }: { instance: InstanceInfo; onClone: (id: string, name?: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [cloning, setCloning] = useState(false)

  function handleOpen() {
    setName(`${instance.name} (copy)`)
    setCloning(false)
    setOpen(true)
  }

  async function handleClone() {
    setCloning(true)
    await onClone(instance.id, name.trim() || undefined)
    setCloning(false)
    setOpen(false)
  }

  return (
    <>
      <div className="rounded-lg border border-border p-4 space-y-3 opacity-60">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Clone Claw</h4>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Coming Soon</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Create an exact copy of this Claw — including workspace, agents, channels, and configuration.
        </p>
        <Button variant="outline" size="sm" disabled>
          Clone
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Clone "{instance.name}"</DialogTitle>
            <DialogDescription>
              This will copy the entire Claw directory — workspace, agents, sessions, channels, and all configuration. The clone gets its own gateway port and can run independently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 py-2">
            <Label htmlFor="clone-name">Name for the clone</Label>
            <Input
              id="clone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !cloning) handleClone() }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={cloning}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={cloning || !name.trim()}>
              {cloning ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Cloning...</>
              ) : (
                'Clone Claw'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DangerZoneSection({ instance, onDelete }: { instance: InstanceInfo; onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean> }) {
  const [deleteData, setDeleteData] = useState(false)
  const isBusy = instance.status === 'running' || instance.status === 'starting'

  return (
    <div className="p-6">
      <h3 className="text-base font-semibold text-destructive mb-1">Danger Zone</h3>
      <p className="text-sm text-muted-foreground mb-4">Actions here are irreversible. The Claw must be stopped first.</p>

      <div className="flex items-center gap-4 max-w-lg rounded-lg border border-border p-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">Delete this Claw</h4>
          <p className="text-sm text-muted-foreground">
            Remove &ldquo;{instance.name}&rdquo; from ManyClaw.
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
                    This will remove the Claw from the sidebar. This action cannot be undone.
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
                      Removes sessions, config, and workspace for this Claw.
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
                    Delete Claw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
      </div>
    </div>
  )
}

export default function ProfileView({ instance, onDelete, onClone }: ProfileViewProps) {
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
          variant={section === 'console' ? 'secondary' : 'ghost'}
          size="sm"
          className={`justify-start h-8 text-sm ${section === 'console' ? 'font-semibold' : ''}`}
          onClick={() => setSection('console')}
        >
          Console
        </Button>

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
          <DetailsSection instance={instance} onClone={onClone} />
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
          <div className="flex items-center justify-start px-3 py-1.5 border-b border-border shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={restartConfigure}>
              Reload Configure
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
