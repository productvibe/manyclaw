export default function MacMiniIcon({ color, size = 36 }: { color: string; size?: number }) {
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
