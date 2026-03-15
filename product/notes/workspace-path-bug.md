# Workspace Path Bug

**Status:** Fixed

## Problem

New profiles created via ManyClaw had their workspaces landing in `~/.openclaw/` (default profile directory) instead of `~/.openclaw-{id}/`. Every chat, regardless of which profile it was started from, created its workspace under the default profile.

## Root Cause

`openclaw onboard --non-interactive` defaults the workspace to `~/.openclaw/workspace` when `--workspace` is not specified. The `--profile` flag isolates the config directory but does NOT change the default workspace path. This is set at onboard time and baked into the config — it cannot be changed after the fact by editing `openclaw.json`.

## Failed Attempt: Post-hoc config patching

Added `fixWorkspacePath()` to patch `agents.defaults.workspace` in `openclaw.json` after onboard completed. Did not work — the workspace path is determined at onboard time and the gateway does not re-read it from config at runtime.

## Failed Attempt: Using `--url` and `--token` on TUI

An earlier commit (`a1e590c`) tried passing explicit `--url ws://127.0.0.1:{port} --token {token}` to the TUI command. This was incorrect — per the [CLI docs](https://docs.openclaw.ai/cli), `--profile` is sufficient for gateway routing. The workspace issue was about onboard defaults, not TUI connectivity.

## Fix

Pass `--workspace` during onboard so it's set correctly from the start:

```ts
const workspace = path.join(inst.profileDir, 'workspace')
// ...
'--workspace', workspace,
```

This sets the workspace to `~/.openclaw-{id}/workspace` at onboard time. No post-hoc patching needed.

**File:** `src/instances/manager.ts` — `onboardInstance()`

## Key Lesson

The workspace path is an onboard-time decision, not a runtime config. Patching the config after onboard has no effect. Always pass `--workspace` to `openclaw onboard`.
