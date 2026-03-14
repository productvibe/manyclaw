import { useState, useEffect, useCallback } from 'react'
import type { InstanceInfo } from '@shared/ipc'

export interface UseInstancesReturn {
  instances: InstanceInfo[]
  loading: boolean
  start: (id: string) => Promise<void>
  stop: (id: string) => Promise<void>
  create: (opts: { name: string; color: string }) => Promise<InstanceInfo | null>
  deleteInstance: (id: string) => Promise<boolean>
}

export function useInstances(): UseInstancesReturn {
  const [instances, setInstances] = useState<InstanceInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial instances
    window.multiclaw.instances
      .list()
      .then((list) => {
        setInstances(list)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    // Subscribe to status changes for any instance
    const unsubscribe = window.multiclaw.instances.onStatusChange((updated) => {
      setInstances((prev) => {
        const idx = prev.findIndex((i) => i.id === updated.id)
        if (idx === -1) return [...prev, updated]
        const next = [...prev]
        next[idx] = updated
        return next
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const start = useCallback(async (id: string) => {
    await window.multiclaw.instances.start(id)
  }, [])

  const stop = useCallback(async (id: string) => {
    await window.multiclaw.instances.stop(id)
  }, [])

  const create = useCallback(async (opts: { name: string; color: string }) => {
    try {
      const instance = await window.multiclaw.instances.create(opts)
      setInstances((prev) => {
        // If already exists (from status change), update; otherwise append
        const idx = prev.findIndex((i) => i.id === instance.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = instance
          return next
        }
        return [...prev, instance]
      })
      return instance
    } catch {
      return null
    }
  }, [])

  const deleteInstance = useCallback(async (id: string) => {
    try {
      const result = await window.multiclaw.instances.delete(id)
      if (!result.cancelled) {
        setInstances((prev) => prev.filter((i) => i.id !== id))
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  return { instances, loading, start, stop, create, deleteInstance }
}
