import { useState, useEffect, useRef, useCallback } from 'react'
import type { InstanceInfo } from '@shared/ipc'
import StatusDot from './StatusDot'
import InstanceDialog from './InstanceDialog'

interface ContextMenuState {
  x: number
  y: number
  instanceId: string
}

interface DeleteConfirmState {
  id: string
  name: string
}

interface SidebarProps {
  instances: InstanceInfo[]
  selectedId: string | null
  onSelect: (id: string) => void
  onStart: (id: string) => Promise<void>
  onStop: (id: string) => Promise<void>
  onCreate: (opts: { name: string; color: string }) => Promise<void>
  onDelete: (id: string) => Promise<boolean>
}

export default function Sidebar({
  instances,
  selectedId,
  onSelect,
  onStart,
  onStop,
  onCreate,
  onDelete,
}: SidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function handler(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [contextMenu])

  // Close context menu on Escape
  useEffect(() => {
    if (!contextMenu) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setContextMenu(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [contextMenu])

  function handleContextMenu(e: React.MouseEvent, id: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, instanceId: id })
  }

  const handleCreate = useCallback(
    async (opts: { name: string; color: string }) => {
      await onCreate(opts)
    },
    [onCreate],
  )

  async function handleDeleteConfirmed() {
    if (!deleteConfirm) return
    await onDelete(deleteConfirm.id)
    setDeleteConfirm(null)
  }

  const ctxInstance = contextMenu
    ? instances.find((i) => i.id === contextMenu.instanceId)
    : null

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100%',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          height: 24,
          marginTop: 16,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-label)',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-label)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          Instances
        </span>
        <button
          onClick={() => setDialogOpen(true)}
          title="New Instance"
          style={{
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: 0,
            borderRadius: 3,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Instance list */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2px 0',
        }}
      >
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="instance-row"
            data-selected={selectedId === instance.id ? 'true' : 'false'}
            onClick={() => onSelect(instance.id)}
            onContextMenu={(e) => handleContextMenu(e, instance.id)}
          >
            <StatusDot status={instance.status} size={8} />
            <span
              className="row-name"
              style={{
                flex: 1,
                fontSize: 'var(--font-size-body)',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {instance.name}
            </span>
            <span
              className="accent-dot"
              style={{ background: instance.color }}
            />
          </div>
        ))}
      </nav>

      {/* Context menu */}
      {contextMenu && ctxInstance && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {ctxInstance.status === 'stopped' || ctxInstance.status === 'error' ? (
            <div
              className="context-menu-item"
              onClick={() => {
                onStart(contextMenu.instanceId)
                setContextMenu(null)
              }}
            >
              Start
            </div>
          ) : ctxInstance.status === 'running' ? (
            <div
              className="context-menu-item"
              onClick={() => {
                onStop(contextMenu.instanceId)
                setContextMenu(null)
              }}
            >
              Stop
            </div>
          ) : null}
          <div className="context-menu-separator" />
          <div
            className="context-menu-item context-menu-item--destructive"
            onClick={() => {
              setDeleteConfirm({ id: ctxInstance.id, name: ctxInstance.name })
              setContextMenu(null)
            }}
          >
            Delete…
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
        >
          <div className="dialog-content" style={{ width: 320 }}>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 8px',
              }}
            >
              Delete &quot;{deleteConfirm.name}&quot;?
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--text-secondary)',
                margin: '0 0 20px',
                lineHeight: 1.5,
              }}
            >
              This will remove the instance and its configuration. OpenClaw data
              (memory, settings) is not affected.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  height: 28,
                  padding: '0 12px',
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'var(--font)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                style={{
                  height: 28,
                  padding: '0 12px',
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'var(--font)',
                  background: '#FF3B30',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'opacity 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Instance dialog */}
      <InstanceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </aside>
  )
}
