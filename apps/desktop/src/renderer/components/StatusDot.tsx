import type { InstanceStatus } from '@shared/ipc'

interface StatusDotProps {
  status: InstanceStatus
  size?: number
}

const STATUS_COLORS: Record<InstanceStatus, string> = {
  running:  '#34C759',
  stopped:  '#8E8E93',
  starting: '#FF9500',
  error:    '#FF3B30',
}

export default function StatusDot({ status, size = 8 }: StatusDotProps) {
  const animate = status === 'starting'
  return (
    <span
      className={animate ? 'status-dot-animated' : ''}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: STATUS_COLORS[status] ?? '#8E8E93',
        flexShrink: 0,
        transition: 'background 300ms ease',
      }}
    />
  )
}
