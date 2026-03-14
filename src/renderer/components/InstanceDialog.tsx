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
  { id: 'anthropic', name: 'Anthropic', cli: 'Claude Code', auth: 'OAuth', placeholder: 'sk-ant-...' },
  { id: 'openai', name: 'OpenAI', cli: 'Codex', auth: 'OAuth', placeholder: 'sk-...' },
  { id: 'gemini', name: 'Gemini', cli: 'Gemini CLI', auth: 'OAuth', placeholder: 'AIza...' },
] as const

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  label: z.string().max(80).optional().default(''),
  port: z.coerce.number().int().min(1024, 'Min port is 1024').max(65535, 'Max port is 65535'),
  provider: z.string(),
  token: z.string().min(1, 'API token is required'),
})

type FormValues = z.infer<typeof formSchema>

type Step = 'form' | 'creating' | 'done' | 'error'

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      label: '',
      port: 40001,
      provider: 'anthropic',
      token: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset()
      setStep('form')
      setStatusMsg('')

      window.multiclaw.instances.getNextPort().then((p) => form.setValue('port', p))
    }
  }, [open])

  const watchedName = form.watch('name')
  const derivedId = nameToId(watchedName)

  async function onSubmit(values: FormValues) {
    if (step !== 'form') return

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

      setStatusMsg('Setting up...')
      const result = await window.multiclaw.instances.onboard(id, {
        provider: values.provider,
        token: values.token.trim(),
      })

      if (!result.success) {
        setStep('error')
        setStatusMsg(result.error ?? 'Onboard failed')
        return
      }

      // Save token for future profiles
      await window.multiclaw.settings.save({ setupToken: values.token.trim() })

      setStep('done')
      setStatusMsg('Profile ready.')
      setTimeout(() => onClose(), 1000)
    } catch (err) {
      setStep('error')
      setStatusMsg(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step !== 'creating') onClose() }}>
      <DialogContent className="sm:max-w-[560px] flex flex-col max-h-[85vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>New Profile</DialogTitle>
          <DialogDescription>
            Each profile gets its own gateway, workspace, and channels.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Agent"
                            autoFocus
                            {...field}
                          />
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
                          <Input
                            type="number"
                            min={1024}
                            max={65535}
                            className="font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {derivedId && (
                  <p className="text-xs text-muted-foreground -mt-2">
                    ~/.openclaw-{derivedId}/
                  </p>
                )}

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend code review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium mb-1 block">AI Provider (OAuth)</label>
                  <p className="text-xs text-muted-foreground mb-2">Requires the provider's CLI to be installed</p>
                  <div className="space-y-2">
                    {AI_PROVIDERS.map((p) => {
                      const selected = form.watch('provider') === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => form.setValue('provider', p.id)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            selected
                              ? 'border-foreground bg-accent'
                              : 'border-border hover:border-foreground/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selected ? 'border-foreground' : 'border-muted-foreground/40'
                            }`}>
                              {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{p.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{p.cli}</span>
                              <span className="text-xs text-muted-foreground ml-1">({p.auth})</span>
                            </div>
                          </div>
                          {selected && (
                            <div className="mt-2 ml-7 flex gap-1.5">
                              <input
                                placeholder={p.placeholder}
                                className="flex-1 rounded border border-input bg-background px-2 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/30"
                                value={form.watch('token')}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => form.setValue('token', e.target.value)}
                              />
                              <button
                                type="button"
                                className="shrink-0 rounded border border-input bg-background px-2 py-1.5 hover:bg-accent transition-colors"
                                title="Paste from clipboard"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const text = await navigator.clipboard.readText()
                                  if (text) form.setValue('token', text)
                                }}
                              >
                                <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {form.formState.errors.token && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.token.message}</p>
                  )}
                </div>
              </div>

              <div className="shrink-0 pt-4 flex justify-end gap-3 border-t border-border mt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </form>
          </Form>
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
            <Button variant="outline" size="sm" onClick={onClose} className="mt-2">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
