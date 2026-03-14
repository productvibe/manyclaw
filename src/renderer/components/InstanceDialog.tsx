import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COLORS = [
  { name: 'Blue',   value: '#007AFF' },
  { name: 'Green',  value: '#34C759' },
  { name: 'Orange', value: '#FF9500' },
  { name: 'Red',    value: '#FF3B30' },
  { name: 'Purple', value: '#AF52DE' },
  { name: 'Teal',   value: '#5AC8FA' },
]

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  label: z.string().max(80).optional().default(''),
  id: z.string().min(1, 'Profile ID is required').max(32).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  port: z.coerce.number().int().min(1024, 'Min port is 1024').max(65535, 'Max port is 65535'),
  provider: z.string(),
  token: z.string().min(1, 'Setup token is required'),
  color: z.string(),
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
  const [idManual, setIdManual] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      label: '',
      id: '',
      port: 40001,
      provider: 'anthropic',
      token: '',
      color: '#007AFF',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset()
      setIdManual(false)
      setStep('form')
      setStatusMsg('')

      window.multiclaw.instances.getNextPort().then((p) => form.setValue('port', p))
      window.multiclaw.settings.get().then((s) => {
        if (s.setupToken) form.setValue('token', s.setupToken)
      })
    }
  }, [open])

  const watchedId = form.watch('id')

  async function onSubmit(values: FormValues) {
    if (step !== 'form') return

    setStep('creating')
    setStatusMsg('Creating profile...')

    try {
      await onCreate({
        name: values.name.trim(),
        color: values.color,
        id: values.id.trim(),
        port: values.port,
        label: values.label?.trim() || undefined,
      })

      setStatusMsg('Running onboard...')
      const result = await window.multiclaw.instances.onboard(values.id.trim(), {
        provider: values.provider,
        token: values.token.trim(),
      })

      if (!result.success) {
        setStep('error')
        setStatusMsg(result.error ?? 'Onboard failed')
        return
      }

      setStep('done')
      setStatusMsg('Profile created and configured.')
      setTimeout(() => onClose(), 1000)
    } catch (err) {
      setStep('error')
      setStatusMsg(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step !== 'creating') onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Profile</DialogTitle>
          <DialogDescription>
            Create a new OpenClaw profile with its own gateway and auth.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                {/* Name — full width */}
                <div className="col-span-full sm:col-span-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>
                          Name<span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Agent"
                            autoFocus
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (!idManual) form.setValue('id', nameToId(e.target.value))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Color — beside name */}
                <div className="col-span-full sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>Color</FormLabel>
                        <div className="flex items-center gap-2 pt-1">
                          {COLORS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              className="size-6 rounded-full cursor-pointer transition-all border-0 hover:scale-110"
                              onClick={() => field.onChange(c.value)}
                              title={c.name}
                              style={{
                                background: c.value,
                                boxShadow:
                                  field.value === c.value
                                    ? `0 0 0 2px var(--background), 0 0 0 3.5px ${c.value}`
                                    : undefined,
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Label — full width */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>
                          Label
                          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Frontend code review" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Profile ID — full width */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>
                          Profile ID<span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="my-agent"
                            className="font-mono text-sm"
                            {...field}
                            onChange={(e) => {
                              setIdManual(true)
                              const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32)
                              field.onChange(val)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Directory: ~/.openclaw-{watchedId || '...'}/
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Port — half width */}
                <div className="col-span-full sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>Gateway Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1024}
                            max={65535}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Provider — half width, select dropdown */}
                <div className="col-span-full sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>AI Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Token — full width */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem className="gap-2">
                        <FormLabel>
                          Setup Token<span className="text-destructive">*</span>
                          {field.value && (
                            <span className="ml-1 text-muted-foreground font-normal">(from settings)</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="sk-ant-oat01-..."
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-end gap-4">
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
            <span className="text-sm text-muted-foreground">{statusMsg}</span>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <span className="text-sm text-muted-foreground">{statusMsg}</span>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="text-sm text-center text-muted-foreground max-w-xs">{statusMsg}</span>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-2">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
