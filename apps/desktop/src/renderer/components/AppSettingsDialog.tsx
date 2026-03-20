import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AppSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export default function AppSettingsDialog({ open, onClose }: AppSettingsDialogProps) {
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setSaved(false)
      window.multiclaw.settings.get().then((s) => {
        setToken(s.setupToken ?? '')
      })
    }
  }, [open])

  async function handleSave() {
    setSaving(true)
    await window.multiclaw.settings.save({ setupToken: token || undefined })
    setSaving(false)
    setSaved(true)
    setTimeout(() => onClose(), 600)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Anthropic setup token for new Claws.
            Generate one with <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">claude setup-token</code>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Label htmlFor="setup-token">Setup Token</Label>
          <Input
            id="setup-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sk-ant-oat01-..."
            className="font-mono text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
