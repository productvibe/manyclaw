import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MacMiniIcon from './MacMiniIcon'

type Step = 'welcome' | 'creating' | 'done' | 'error'

interface SetupWizardProps {
  onCreate: (opts: { name: string; color: string; id: string; port: number }) => Promise<void>
  onStart: (id: string) => Promise<void>
}

export default function SetupWizard({ onCreate, onStart }: SetupWizardProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [token, setToken] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSetup() {
    if (!token.trim()) return

    setStep('creating')
    setStatusMsg('Creating Claw...')

    try {
      await onCreate({
        name: 'My OpenClaw',
        color: '#007AFF',
        id: 'my-openclaw',
        port: 40000,
      })

      setStatusMsg('Setting up OpenClaw...')
      await window.multiclaw.settings.save({ setupToken: token.trim() })

      const result = await window.multiclaw.instances.onboard('my-openclaw', {
        provider: 'anthropic',
        token: token.trim(),
      })

      if (!result.success) {
        setStep('error')
        setError(result.error ?? 'Setup failed')
        return
      }

      setStatusMsg('Starting...')
      await onStart('my-openclaw')

      setStep('done')
      setStatusMsg('Ready to go.')
    } catch (err) {
      setStep('error')
      setError(err instanceof Error ? err.message : 'Setup failed')
    }
  }

  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 max-w-md mx-auto">
        <MacMiniIcon color="#007AFF" size={80} />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to ManyClaw</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Run multiple OpenClaw agents side by side. Paste your Anthropic API token below to get started.
          </p>
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="setup-token">API Token</Label>
          <Input
            id="setup-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sk-ant-..."
            className="font-mono text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSetup() }}
          />
          <p className="text-xs text-muted-foreground">
            Your Anthropic API key. Stored locally, never sent anywhere except Anthropic.
          </p>
        </div>

        <Button onClick={handleSetup} disabled={!token.trim()} className="w-full">
          Get Started
        </Button>
      </div>
    )
  }

  if (step === 'creating') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{statusMsg}</p>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
        <p className="text-sm text-muted-foreground">{statusMsg}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 max-w-md mx-auto">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-center text-muted-foreground">{error}</p>
      <Button variant="outline" onClick={() => setStep('welcome')}>
        Try Again
      </Button>
    </div>
  )
}
