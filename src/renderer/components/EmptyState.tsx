import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  onNewInstance: () => void
}

export default function EmptyState({ onNewInstance }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" className="fill-primary" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" className="fill-primary opacity-50" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" className="fill-primary opacity-50" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" className="fill-primary opacity-30" />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">No profiles yet</h2>
        <p className="text-sm text-muted-foreground max-w-[260px] mt-1.5 leading-relaxed">
          Run multiple OpenClaw profiles side by side — dev, staging, production, or more.
        </p>
      </div>

      <Button onClick={onNewInstance} className="gap-1.5">
        <Plus className="h-4 w-4" />
        New Profile
      </Button>
    </div>
  )
}
