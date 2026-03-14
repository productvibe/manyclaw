# QA Real UI Test Report — Round 2
**Date:** 2026-03-14
**Tester:** Cedar 🌲
**Build:** OpenClaw 2026.3.11 (29dc654)
**Environment:** Electron app via CDP port 9223, macOS

---

## Flow 1: Initial State — PASS
- App launched and rendered correctly
- Sidebar shows "My OpenClaw" with green Running indicator
- TUI and Logs tabs visible
- Header bar has Open in Browser, Stop, Restart buttons
- **Screenshot:** `qa-real2/01-launch.png`

## Flow 2: Instance Running / Health Check — PASS
- Instance was already in Running state (green dot)
- Health endpoint returns: `{"ok":true,"status":"live"}`
- **Screenshot:** `qa-real2/02-started.png`

## Flow 3: TUI Tab Rendering — PARTIAL
- **PASS:** TUI tab renders xterm.js terminal with content
- **PASS:** OpenClaw banner displays: `🦞 OpenClaw 2026.3.11 (29dc654) — I'll butter your workflow like a lobster roll: messy, delicious, effective.`
- **PASS:** No `posix_spawnp` errors — the shell spawn fix (commit 2534930) is working
- **FAIL:** TUI immediately shows credential error:
  ```
  Error: gateway url override requires explicit credentials
  Fix: pass --token or --password when using --url.
  ```
- The TUI process appears to exit after this error — no interactive prompt is reached
- **Screenshot:** `qa-real2/03-tui.png`

## Flow 4: Type a Message — FAIL
- Typed "hello" + Enter into xterm textarea
- No response — the TUI process had already exited due to the credential error
- The terminal is a dead shell at this point
- **Screenshot:** `qa-real2/04-reply.png`

## Flow 5: Logs Tab — PARTIAL
- **PASS:** Logs tab renders and shows structured log output
- **PASS:** No `posix_spawnp` errors anywhere in logs (spawn fix confirmed)
- **FAIL:** Massive `device_token_mismatch` spam — WebSocket connections from the webchat UI to the gateway are rejected every ~16 seconds
  - Pattern: `[ws] unauthorized conn=<uuid> ... reason=device_token_mismatch`
  - Followed by: `[ws] closed before connect ... code=1008 reason=unauthorized: device token mismatch`
- **Root cause:** The token the Electron app passes to the OpenClaw gateway does not match the gateway's device token. This is the same class of bug as the TUI credential error — the app is not correctly propagating authentication credentials.
- **Screenshot:** `qa-real2/05-logs.png`

## Flow 6: Stop Instance — PASS
- Stop button clicked, instance shut down cleanly
- Logs confirm: `[gateway] signal SIGTERM received`, `shutting down`, `gmail watcher stopped`
- Status changed to "Stopped" (orange dot)
- **Screenshot:** `qa-real2/06-stopped.png`

---

## Summary

| Flow | Test | Verdict |
|------|------|---------|
| 1 | Initial state / launch | **PASS** |
| 2 | Health check | **PASS** |
| 3 | TUI renders | **PARTIAL** — renders but hits credential error |
| 4 | Type a message | **FAIL** — TUI dead, no prompt |
| 5 | Logs tab | **PARTIAL** — renders, but token_mismatch spam |
| 6 | Stop instance | **PASS** |

**Overall Verdict: PARTIAL — 3 PASS, 2 PARTIAL, 1 FAIL**

## What's Fixed Since Last Round
- `posix_spawnp` spawn errors are **gone** — the TUI binary launches successfully
- TUI renders the OpenClaw banner in xterm.js — the PTY pipe is working

## Blocking Issue
**Token mismatch / credential propagation bug:**
The TUI subprocess and the webchat WebSocket both fail to authenticate against the gateway. The TUI shows `"Error: gateway url override requires explicit credentials"` and the logs show continuous `device_token_mismatch` rejections. The Electron app needs to read the gateway's device token after startup and pass it to both:
1. The TUI subprocess (via `--token` flag or environment variable)
2. The webchat iframe/WebSocket connection

This is the single remaining blocker preventing the TUI from being interactive.
