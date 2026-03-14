import { useState, useCallback, useRef } from 'react'
import { Plus, Settings } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import InstanceDialog from './InstanceDialog'
import AppSettingsDialog from './AppSettingsDialog'

function MacMiniIcon({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="14" width="32" height="16" rx="3" fill={color} opacity="0.15" />
      <rect x="4" y="14" width="32" height="16" rx="3" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <rect x="6" y="14.5" width="28" height="1" rx="0.5" fill={color} opacity="0.15" />
      <rect x="14" y="26" width="12" height="1" rx="0.5" fill={color} opacity="0.3" />
      <circle cx="33" cy="27" r="1" fill={color} opacity="0.6" />
      <rect x="8" y="30" width="4" height="1.5" rx="0.75" fill={color} opacity="0.2" />
      <rect x="28" y="30" width="4" height="1.5" rx="0.75" fill={color} opacity="0.2" />
    </svg>
  )
}

interface SidebarProps {
  instances: InstanceInfo[]
  selectedId: string | null
  onSelect: (id: string) => void
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
  onCreate: (opts: { name: string; color: string; id: string; port: number; label?: string }) => Promise<void>
  onDelete: (id: string) => Promise<boolean>
  onReorder: (orderedIds: string[]) => void
}

export default function Sidebar({
  instances,
  selectedId,
  onSelect,
  onStart,
  onStop,
  onCreate,
  onDelete,
  onReorder,
}: SidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dragItemId = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  const handleCreate = useCallback(
    async (opts: { name: string; color: string; id: string; port: number; label?: string }) => {
      await onCreate(opts)
    },
    [onCreate],
  )

  return (
    <>
      <ShadcnSidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2">Profiles</SidebarGroupLabel>
            <SidebarGroupAction title="New Profile" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {instances.map((instance) => {
                  const selected = selectedId === instance.id
                  return (
                    <SidebarMenuItem
                      key={instance.id}
                      draggable
                      onDragStart={() => { dragItemId.current = instance.id }}
                      onDragOver={(e) => { e.preventDefault(); dragOverId.current = instance.id }}
                      onDragEnd={() => {
                        if (dragItemId.current && dragOverId.current && dragItemId.current !== dragOverId.current) {
                          const ids = instances.map((i) => i.id)
                          const fromIdx = ids.indexOf(dragItemId.current)
                          const toIdx = ids.indexOf(dragOverId.current)
                          ids.splice(fromIdx, 1)
                          ids.splice(toIdx, 0, dragItemId.current)
                          onReorder(ids)
                        }
                        dragItemId.current = null
                        dragOverId.current = null
                      }}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <SidebarMenuButton
                            isActive={selected}
                            onClick={() => onSelect(instance.id)}
                            className="h-auto rounded-lg border border-sidebar-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow data-[active=true]:border-sidebar-primary/30 data-[active=true]:shadow-md"
                          >
                            <div className="flex items-start gap-3 w-full">
                              <span className="cursor-grab active:cursor-grabbing shrink-0">
                                <MacMiniIcon color={instance.status === 'running' ? '#34C759' : '#8E8E93'} size={48} />
                              </span>
                              <div className="min-w-0 flex-1 pb-2">
                                <div className="text-sm font-medium truncate">
                                  {instance.name}
                                </div>
                                {instance.label && (
                                  <div className="text-xs text-foreground/60 break-words">
                                    {instance.label}
                                  </div>
                                )}
                                <div className="text-xs text-foreground/60 mt-0.5">
                                  Port :{instance.port}
                                </div>
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {(instance.status === 'stopped' || instance.status === 'error') && (
                            <ContextMenuItem onClick={() => onStart(instance.id)}>
                              Start
                            </ContextMenuItem>
                          )}
                          {instance.status === 'running' && (
                            <ContextMenuItem onClick={() => onStop(instance.id)}>
                              Stop
                            </ContextMenuItem>
                          )}
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(instance.id)}
                          >
                            Delete...
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </ShadcnSidebar>

      <AppSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <InstanceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
