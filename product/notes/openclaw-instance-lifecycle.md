# OpenClaw Instance Lifecycle (via --profile)

Source: https://docs.openclaw.ai/cli  
Verified: 2026-03-14

`--profile <name>` isolates state under `~/.openclaw-<name>/`.  
It does NOT tell `tui` or `dashboard` which port/token to use — those need explicit flags.

---

## 1. Create a new instance (first time setup)

```bash
# Configure the profile (sets gateway.mode=local so gateway starts without --allow-unconfigured)
openclaw --profile {name} config set gateway.mode local
openclaw --profile {name} config set gateway.port {port}
```

After first `gateway` start, openclaw writes `gateway.auth.token` to `~/.openclaw-{name}/openclaw.json` automatically.

---

## 2. Start a gateway for a profile

```bash
# Normal start (requires gateway.mode=local in config — see step 1)
openclaw --profile {name} gateway --port {port} --force

# Ad-hoc / first-ever start (skips the mode=local requirement)
openclaw --profile {name} gateway --port {port} --force --allow-unconfigured
```

- `--force` kills any existing listener on that port first
- After starting, the gateway writes the token to `~/.openclaw-{name}/openclaw.json`
- Health check: `curl http://127.0.0.1:{port}/health`

---

## 3. Open an instance

### TUI

`tui` defaults to `ws://127.0.0.1:18789` regardless of `gateway.port` in the profile config.  
**Must pass `--url` and `--token` explicitly.**

```bash
# Read token from ~/.openclaw-{name}/openclaw.json → gateway.auth.token
TOKEN=$(cat ~/.openclaw-{name}/openclaw.json | jq -r '.gateway.auth.token')

openclaw --profile {name} tui --url ws://127.0.0.1:{port} --token $TOKEN
```

### Dashboard (browser)

`openclaw dashboard --no-open` also ignores the profile's port — always returns 18789.  
**Build the URL directly:**

```
http://127.0.0.1:{port}/#token={token}
```

```bash
TOKEN=$(cat ~/.openclaw-{name}/openclaw.json | jq -r '.gateway.auth.token')
open "http://127.0.0.1:{port}/#token=$TOKEN"
```

---

## 4. Delete an instance

```bash
# 1. Kill the gateway (SIGTERM the process, or use --force on next start)
kill {pid}

# 2. Reset the profile's state (config, credentials, sessions, workspace)
openclaw --profile {name} reset --yes

# 3. Remove the profile directory entirely
rm -rf ~/.openclaw-{name}
```

---

## Key facts for multiclaw

| Thing | Works with --profile alone? | Notes |
|-------|---------------------------|-------|
| Gateway isolation | ✅ | Separate state dir, token, port |
| TUI connection | ❌ | Needs `--url ws://127.0.0.1:{port} --token {token}` |
| Dashboard URL | ❌ | Build `http://127.0.0.1:{port}/#token={token}` directly |
| `dashboard --no-open` | ❌ | Always returns port 18789, ignores profile |

Token lives at: `~/.openclaw-{name}/openclaw.json` → `gateway.auth.token`
