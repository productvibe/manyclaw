import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import type { InstanceInfo } from '@shared/ipc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CHANNELS = [
  {
    id: 'telegram',
    name: 'Telegram',
    placeholder: '123456789:ABCdefGHI...',
    helpText: 'Bot token from @BotFather',
    steps: [
      'Message @BotFather on Telegram → /newbot',
      'Follow the prompts to name your bot',
      'Copy the bot token provided',
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    placeholder: '',
    helpText: 'Use Configure tab to connect via QR code',
    steps: [],
  },
  {
    id: 'slack',
    name: 'Slack',
    placeholder: 'xoxb-...',
    helpText: 'Bot User OAuth Token from Slack app settings',
    steps: [
      'Go to api.slack.com/apps → Create New App',
      'OAuth & Permissions → Add bot scopes → Install to Workspace',
      'Copy the Bot User OAuth Token (xoxb-...)',
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    placeholder: 'MTIzNDU2Nzg5...',
    helpText: 'Bot token from Discord Developer Portal',
    steps: [
      'Discord Developer Portal → Applications → New Application',
      'Bot → Add Bot → Reset Token → copy token',
      'OAuth2 → URL Generator → scope "bot" → invite to your server',
      'Enable Message Content Intent (Bot → Privileged Gateway Intents)',
    ],
    docsUrl: 'https://discord.com/developers/applications',
  },
] as const

type ChannelId = typeof CHANNELS[number]['id']

interface ChannelsSectionProps {
  instance: InstanceInfo
  channel: ChannelId
}

export const CHANNEL_NAV = CHANNELS.map(c => ({ id: c.id as ChannelId, label: c.name }))

export default function ChannelsSection({ instance, channel }: ChannelsSectionProps) {
  const config = CHANNELS.find(c => c.id === channel)!
  const isWhatsApp = channel === 'whatsapp'

  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setToken('')
    setStatus('idle')
    setError('')
    window.multiclaw.instances.getChannelStatus(instance.id, channel).then((s) => {
      setConnected(s.enabled && s.hasToken)
      setLoading(false)
    })
  }, [instance.id, channel])

  async function handleConnect() {
    if (!token.trim()) return
    setStatus('saving')
    setError('')

    const result = await window.multiclaw.instances.addChannel(instance.id, {
      channel,
      token: token.trim(),
    })

    if (result.success) {
      setStatus('success')
      setConnected(true)
      setToken('')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
      setError(result.error ?? 'Failed to save')
    }
  }

  async function handleRemove() {
    setStatus('saving')
    const result = await window.multiclaw.instances.removeChannel(instance.id, { channel })
    if (result.success) {
      setConnected(false)
      setStatus('idle')
    } else {
      setStatus('error')
      setError(result.error ?? 'Failed to remove')
    }
  }

  if (loading) return null

  if (isWhatsApp) {
    return (
      <div className="p-6 max-w-md">
        <h3 className="text-base font-semibold mb-1">{config.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          WhatsApp requires interactive QR code authentication.
          Go to <strong>Configure</strong> and select the channels section to set up WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-base font-semibold mb-1">{config.name}</h3>

      {config.steps.length > 0 && !connected && (
        <ol className="text-sm text-muted-foreground mb-4 space-y-1 list-decimal list-inside">
          {config.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {'docsUrl' in config && config.docsUrl && !connected && (
        <Button
          variant="link"
          size="sm"
          className="px-0 mb-4 text-sm"
          onClick={() => window.multiclaw.shell.openExternal(config.docsUrl as string)}
        >
          Open {config.name} Developer Portal &rarr;
        </Button>
      )}

      {connected && status !== 'saving' && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-sm text-green-700 dark:text-green-400">Connected</span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${channel}-token`}>
            {connected ? 'Update token' : 'Bot Token'}
          </Label>
          <Input
            id={`${channel}-token`}
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={config.placeholder}
            className="font-mono text-sm"
            onKeyDown={(e) => { if (e.key === 'Enter') handleConnect() }}
          />
        </div>

        <Button onClick={handleConnect} disabled={!token.trim() || status === 'saving'} size="sm">
          {status === 'saving' ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...</>
          ) : status === 'success' ? (
            <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Saved</>
          ) : connected ? (
            'Update'
          ) : (
            'Connect'
          )}
        </Button>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 mt-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!connected && (
        <p className="text-xs text-muted-foreground mt-4">
          Restart the gateway after connecting for changes to take effect.
        </p>
      )}
    </div>
  )
}
