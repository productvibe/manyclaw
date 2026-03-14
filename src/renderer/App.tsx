import { useState, useEffect, useCallback, useMemo } from 'react'
import { useInstances } from './hooks/useInstances'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import InstancePane from './components/InstancePane'
import SetupWizard from './components/SetupWizard'

export default function App() {
  const { instances, loading, start, stop, create, deleteInstance } = useInstances()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [order, setOrder] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('multiclaw_profile_order') || '[]') } catch { return [] }
  })

  const sortedInstances = useMemo(() => {
    const orderMap = new Map(order.map((id, i) => [id, i]))
    return [...instances].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? Infinity
      const bi = orderMap.get(b.id) ?? Infinity
      return ai - bi
    })
  }, [instances, order])

  const handleReorder = useCallback((ids: string[]) => {
    setOrder(ids)
    localStorage.setItem('multiclaw_profile_order', JSON.stringify(ids))
  }, [])

  useEffect(() => {
    if (!loading && sortedInstances.length > 0 && selectedId === null) {
      setSelectedId(sortedInstances[0].id)
    }
  }, [loading, sortedInstances, selectedId])

  useEffect(() => {
    if (selectedId && !sortedInstances.find((i) => i.id === selectedId)) {
      setSelectedId(sortedInstances[0]?.id ?? null)
    }
  }, [sortedInstances, selectedId])

  async function handleCreate(opts: { name: string; color: string; id: string; port: number; label?: string }) {
    const instance = await create(opts)
    if (instance) setSelectedId(instance.id)
  }

  async function handleDelete(id: string, opts?: { deleteData?: boolean }) {
    return await deleteInstance(id, opts)
  }

  return (
    <SidebarProvider className="flex-col !min-h-0 h-screen">
      <header className="flex h-[38px] shrink-0 items-center bg-sidebar border-b border-sidebar-border toolbar-drag">
        <SidebarTrigger className="toolbar-no-drag ml-[70px]" />
        <div className="flex-1" />
        <span className="text-sm font-semibold toolbar-no-drag">
          MultiClaw{selectedId ? ` — ${sortedInstances.find(i => i.id === selectedId)?.name ?? ''}` : ''}
        </span>
        <div className="flex-1" />
      </header>
      <div className="flex flex-1 min-h-0">
        <Sidebar
          instances={sortedInstances}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onStart={start}
          onStop={stop}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
        <SidebarInset>
          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : sortedInstances.length === 0 ? (
              <SetupWizard onCreate={handleCreate} onStart={start} />
            ) : (
              <>
                {sortedInstances.map((inst) => (
                  <InstancePane
                    key={inst.id}
                    instance={inst}
                    visible={inst.id === selectedId}
                    onStart={start}
                    onStop={stop}
                    onDelete={handleDelete}
                    onClone={async (id, name) => {
                      const cloned = await window.multiclaw.instances.clone(id, name)
                      if (cloned) setSelectedId(cloned.id)
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
