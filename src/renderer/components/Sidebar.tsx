import { useState, useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
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
import MacMiniIcon from './MacMiniIcon'
import InstanceDialog from './InstanceDialog'

interface SidebarProps {
  instances: InstanceInfo[]
  selectedId: string | null
  onSelect: (id: string) => void
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
  onCreate: (opts: { name: string; color: string; id: string; port: number; label?: string }) => Promise<void>
  onDelete: (id: string, opts?: { deleteData?: boolean }) => Promise<boolean>
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
      <ShadcnSidebar collapsible="offcanvas" className="border-r border-border top-[38px] !h-[calc(100vh-38px)]">
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2">Instances</SidebarGroupLabel>
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
                            className="h-auto rounded-lg border border-sidebar-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow data-[active=true]:bg-green-100 dark:data-[active=true]:bg-green-950/40 data-[active=true]:border-green-400/50 dark:data-[active=true]:border-green-700/50 data-[active=true]:shadow-md"
                          >
                            <div className="flex items-start gap-3 w-full">
                              <span className="cursor-grab active:cursor-grabbing shrink-0">
                                <MacMiniIcon color={instance.status === 'running' ? (selected ? '#2DA44E' : '#34C759') : '#8E8E93'} size={48} />
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
                          <ContextMenuItem
                            onClick={async () => {
                              const cloned = await window.multiclaw.instances.clone(instance.id)
                              if (cloned) onSelect(cloned.id)
                            }}
                          >
                            Clone
                          </ContextMenuItem>
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

      </ShadcnSidebar>

      <InstanceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
