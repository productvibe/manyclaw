import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle2, ClipboardPaste } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AI_PROVIDERS = [
  { id: 'anthropic', name: 'Claude Code', description: 'Paste your setup token', authChoice: 'token', tokenProvider: 'anthropic', needsToken: true, disabled: false },
  { id: 'openai', name: 'Codex', description: 'Coming soon', authChoice: 'codex-cli', tokenProvider: 'openai', needsToken: false, disabled: true },
  { id: 'gemini', name: 'Gemini', description: 'Coming soon', authChoice: 'google-gemini-cli', tokenProvider: 'gemini', needsToken: false, disabled: true },
  { id: 'skip', name: 'Skip', description: 'Configure a provider later', authChoice: 'skip', tokenProvider: '', needsToken: false, disabled: false },
] as const

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  label: z.string().max(80).optional().default(''),
  port: z.coerce.number().int().min(1024, 'Min port is 1024').max(65535, 'Max port is 65535'),
})

type FormValues = z.infer<typeof formSchema>

type Step = 'form' | 'provider' | 'creating' | 'done' | 'error'

interface InstanceDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (opts: { name: string; color: string; id: string; port: number; label?: string }) => Promise<void>
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'profile'
}

export default function InstanceDialog({ open, onClose, onCreate }: InstanceDialogProps) {
  const [step, setStep] = useState<Step>('form')
  const [statusMsg, setStatusMsg] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('anthropic')
  const [token, setToken] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', label: '', port: 40001 },
  })

  useEffect(() => {
    if (open) {
      form.reset()
      setStep('form')
      setStatusMsg('')
      setSelectedProvider('anthropic')
      setToken('')
      window.multiclaw.instances.getNextPort().then((p) => form.setValue('port', p))
    }
  }, [open])

  const watchedName = form.watch('name')
  const derivedId = nameToId(watchedName)

  // Step 1 → Step 2
  function handleNext() {
    form.handleSubmit(() => setStep('provider'))()
  }

  // Step 2 → Create
  async function handleCreate() {
    const values = form.getValues()
    const provider = AI_PROVIDERS.find(p => p.id === selectedProvider)!

    if (provider.needsToken && !token.trim()) return

    const id = nameToId(values.name.trim())
    setStep('creating')
    setStatusMsg('Creating profile...')

    try {
      await onCreate({
        name: values.name.trim(),
        color: '#007AFF',
        id,
        port: values.port,
        label: values.label?.trim() || undefined,
      })

      if (provider.authChoice !== 'skip') {
        setStatusMsg(provider.needsToken ? 'Setting up...' : 'Opening browser for login...')
      }

      const result = await window.multiclaw.instances.onboard(id, {
        provider: provider.tokenProvider || undefined,
        token: provider.needsToken ? token.trim() : undefined,
        authChoice: provider.authChoice,
      })

      if (!result.success) {
        setStep('error')
        setStatusMsg(result.error ?? 'Onboard failed')
        return
      }

      if (token.trim()) {
        await window.multiclaw.settings.save({ setupToken: token.trim() })
      }

      setStep('done')
      setStatusMsg('Profile ready.')
      setTimeout(() => onClose(), 1000)
    } catch (err) {
      setStep('error')
      setStatusMsg(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider)!

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step !== 'creating') onClose() }}>
      <DialogContent className="sm:max-w-[480px] flex flex-col max-h-[85vh]">

        {step === 'form' && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>New Profile</DialogTitle>
              <DialogDescription>
                Each profile gets its own gateway, workspace, and channels.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext() }} className="space-y-4">
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Agent" autoFocus {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input type="number" min={1024} max={65535} className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {derivedId && (
                  <p className="text-xs text-muted-foreground -mt-2">~/.openclaw-{derivedId}/</p>
                )}

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend code review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit">Next</Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {step === 'provider' && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>AI Provider</DialogTitle>
              <DialogDescription>
                Choose how to connect an AI model. You can change this later in Configure.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {AI_PROVIDERS.map((p) => {
                const selected = selectedProvider === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected ? 'border-foreground bg-accent' : 'border-border hover:border-foreground/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-foreground' : 'border-muted-foreground/40'
                      }`}>
                        {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {currentProvider.needsToken && (
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-medium">Setup Token</label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    placeholder={currentProvider.id === 'anthropic' ? 'sk-ant-...' : 'Paste token...'}
                    className="flex-1 rounded border border-input bg-background px-2 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/30"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded border border-input bg-background px-2 py-1.5 hover:bg-accent transition-colors"
                    title="Paste from clipboard"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText()
                      if (text) setToken(text)
                    }}
                  >
                    <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate with <code className="rounded bg-muted px-1 py-0.5 font-mono">claude setup-token</code>
                </p>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('form')}>Back</Button>
              <Button
                onClick={handleCreate}
                disabled={currentProvider.needsToken && !token.trim()}
              >
                Create Profile
              </Button>
            </div>
          </>
        )}

        {step === 'creating' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{statusMsg}</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <p className="text-sm text-muted-foreground">{statusMsg}</p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-center text-muted-foreground max-w-xs">{statusMsg}</p>
            <Button variant="outline" size="sm" onClick={() => setStep('provider')} className="mt-2">Back</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
