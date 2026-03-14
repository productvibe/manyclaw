# OpenClaw Profile Lifecycle

Complete sequence for creating, running, using, and deleting an isolated OpenClaw profile.

## 1. Create & Configure a Profile

```bash
# Initialize the profile with onboarding (interactive)
openclaw --profile mybot onboard --flow quickstart

# Or non-interactive with explicit flags
# --accept-risk is REQUIRED for non-interactive mode
openclaw --profile mybot onboard \
  --non-interactive \
  --accept-risk \
  --mode local \
  --flow quickstart \
  --auth-choice anthropic \
  --gateway-port 3100 \
  --gateway-bind loopback \
  --gateway-auth token \
  --install-daemon
```

This creates isolated state at `~/.openclaw-mybot/` and configures:
- Model provider auth (API keys)
- Gateway port and binding
- Workspace directory

### Minimal Setup (Skip Onboard)

If you only need a gateway without full onboarding:

```bash
# Set the gateway port in profile config
openclaw --profile mybot config set gateway.port 3100

# Set model auth manually
openclaw --profile mybot models auth add --provider anthropic
```

## 2. Start the Gateway

```bash
# As a foreground process (what multiclaw uses)
openclaw --profile mybot gateway --port 3100 --force --allow-unconfigured

# Or install as a background daemon
openclaw --profile mybot gateway install --port 3100
openclaw --profile mybot gateway start
```

Verify it's running:

```bash
curl http://127.0.0.1:3100/health
```

Key flags:
- `--port <port>` — required to avoid conflicts between profiles
- `--force` — kill any existing gateway on this port
- `--allow-unconfigured` — start even if onboard hasn't completed
- `--bind <loopback|lan|tailnet|auto>` — network exposure
- `--token <token>` — set auth token (auto-generated if omitted)

## 3. Open the TUI

Requires the gateway to be running.

```bash
# Connects using port from profile config (set in step 1 or 2)
openclaw --profile mybot tui

# Or specify connection explicitly
openclaw --profile mybot tui --url http://127.0.0.1:3100 --token <token>
```

Additional TUI flags:
- `--session <key>` — resume a specific conversation
- `--message <text>` — send an initial message on open
- `--thinking <level>` — set thinking mode
- `--history-limit <n>` — limit conversation history
- `--timeout-ms <ms>` — request timeout

## 4. Open the Dashboard

Requires the gateway to be running.

```bash
# Opens dashboard in default browser
openclaw --profile mybot dashboard

# Get the authenticated URL without opening (used by multiclaw for webview)
openclaw --profile mybot dashboard --no-open
# Outputs: http://127.0.0.1:3100/dashboard?token=...
```

## 5. Stop the Gateway

```bash
# If running as daemon
openclaw --profile mybot gateway stop

# If running as foreground process, send SIGTERM to the process
```

## 6. Delete the Profile

```bash
# Reset config + credentials + sessions (keeps workspace files)
openclaw --profile mybot reset --scope config+creds+sessions --yes

# Full reset including workspace
openclaw --profile mybot reset --scope full --yes

# Or uninstall everything for this profile
openclaw --profile mybot uninstall --all --yes

# Preview what would be removed
openclaw --profile mybot uninstall --all --dry-run
```

Uninstall selective flags:
- `--service` — remove daemon/service only
- `--state` — remove config and state
- `--workspace` — remove workspace files
- `--all` — everything

## Dependency Chain

```
onboard (or manual config)
    └── gateway start
            ├── tui (connects via WebSocket)
            └── dashboard (web UI served by gateway)
```

- `onboard` has no prerequisites
- `gateway` needs config (from onboard or manual `config set`)
- `tui` and `dashboard` both require a running gateway
- `--allow-unconfigured` on gateway bypasses the onboard requirement

## Multi-Profile Port Allocation

Each profile needs a unique port. Convention used in multiclaw:

| Profile | Port |
|---------|------|
| system (default) | 18789 |
| dev (`--dev`) | shifted automatically |
| custom (`--profile X`) | assign explicitly |

## How Multiclaw Does It

The Electron app automates this sequence in `sandbox.ts`:

1. `config set gateway.port` — writes port to profile config
2. `gateway --port <port> --force --allow-unconfigured` — starts as child process
3. Polls `/health` until gateway responds (15s timeout)
4. `dashboard --no-open` — gets authenticated URL for embedded webview
5. On stop: SIGTERM to gateway process
