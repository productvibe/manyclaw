# OpenClaw Profile Lifecycle

Verified working sequence for creating, running, using, and deleting an isolated OpenClaw profile.

## 1. Create & Configure a Profile

```bash
# Non-interactive with setup token (what multiclaw uses)
# --accept-risk is REQUIRED for non-interactive mode
# --skip-health because gateway isn't running yet
openclaw --profile mybot onboard \
  --non-interactive \
  --accept-risk \
  --mode local \
  --flow quickstart \
  --auth-choice token \
  --token "sk-ant-oat01-..." \
  --token-provider anthropic \
  --gateway-port 40000 \
  --gateway-bind loopback \
  --gateway-auth token \
  --skip-health

# Or interactive
openclaw --profile mybot onboard --flow quickstart
```

This creates isolated state at `~/.openclaw-mybot/` and configures:
- Model provider auth (OAuth token via setup-token)
- Gateway port and binding
- Workspace directory

Note: `--auth-choice setup-token` requires interactive mode.
For non-interactive, use `--auth-choice token --token-provider anthropic --token <value>`.

## 2. Start the Gateway

```bash
# As a foreground process (what multiclaw uses)
# Port is read from profile config (set during onboard)
openclaw --profile mybot gateway --force

# Or install as a background daemon
openclaw --profile mybot gateway install
openclaw --profile mybot gateway start
```

Key flags:
- `--force` — kill any existing gateway on the configured port

## 3. Open the TUI

Requires the gateway to be running.

```bash
openclaw --profile mybot tui
```

## 4. Open the Dashboard

Requires the gateway to be running.

```bash
# Opens in default browser
openclaw --profile mybot dashboard

# Get the authenticated URL without opening the browser
openclaw --profile mybot dashboard --no-open
# Output: Dashboard URL: http://127.0.0.1:40000/#token=<gateway-auth-token>
```

The `--no-open` variant is useful for getting the gateway auth token or embedding the URL in a webview.

## 5. Configure (Edit Settings)

```bash
# Interactive settings wizard (no gateway needed)
openclaw --profile mybot configure
```

## 6. Stop the Gateway

```bash
# If running as daemon
openclaw --profile mybot gateway stop

# If running as foreground process, send SIGTERM to the process
```

## 7. Delete the Profile

```bash
openclaw --profile mybot uninstall --all --yes
```

## Dependency Chain

```
onboard
    └── gateway (reads port from profile config)
            ├── tui (connects via WebSocket)
            └── dashboard (web UI served by gateway)
```

- `onboard` has no prerequisites
- `gateway` needs config from onboard (auth + port)
- `tui` and `dashboard` both require a running gateway
- `configure` works independently (no gateway needed)

## Multi-Profile Port Allocation

Each profile needs a unique port, set during onboard via `--gateway-port`.

| Profile | Port |
|---------|------|
| default (my-agent) | 40000 |
| additional instances | 40001+ |

## How Multiclaw Does It

1. **Create**: User fills in name + color in dialog
2. **Onboard**: `onboard --non-interactive --auth-choice token --token <saved-token> --token-provider anthropic --gateway-port <port> --skip-health`
3. **Start**: `gateway --force` — port read from profile config
4. **Use**: TUI and dashboard via embedded terminal / browser
5. **Configure**: `configure` — interactive settings in embedded terminal
6. **Stop**: SIGTERM to gateway process
7. **Delete**: `uninstall --all --yes`
