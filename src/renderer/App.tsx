import { useState, useEffect, useCallback, useMemo } from 'react'
import { useInstances } from './hooks/useInstances'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import InstancePane from './components/InstancePane'
import EmptyState from './components/EmptyState'

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
    <div className="flex h-screen flex-col">
      <header className="flex h-[38px] shrink-0 items-center justify-center bg-sidebar border-b border-sidebar-border toolbar-drag">
        <span className="text-sm font-semibold toolbar-no-drag">
          MultiClaw{selectedInstance ? ` — ${selectedInstance.name}` : ''}
        </span>
      </header>
      <SidebarProvider className="flex-1 !min-h-0">
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
              <EmptyState onNewInstance={() => {}} />
            ) : sortedInstances.length > 0 ? (
              <>
                {sortedInstances.map((inst) => (
                  <InstancePane
                    key={inst.id}
                    instance={inst}
                    visible={inst.id === selectedId}
                    onStart={start}
                    onStop={stop}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a profile from the sidebar
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
