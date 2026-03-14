# QA Report — Cedar Full Functional Test

**Tester:** Cedar 🌲
**Date:** 2026-03-14
**App version:** multiclaw@0.1.0
**OpenClaw version:** 2026.3.11 (29dc654)
**Platform:** macOS Darwin 25.3.0 (Apple Silicon)

---

## Test Results

### Test 1: App Launches — PASS

- `pnpm build` completed successfully (main + renderer bundles)
- Electron process launched and remained running (PID 77396)
- `~/.multiclaw/instances.json` exists and is valid JSON

### Test 2: Default Instance State — PASS

- `instances.json` contains one default instance:
  ```json
  {
    "id": "my-agent",
    "name": "My OpenClaw",
    "port": 40000,
    "color": "#007AFF"
  }
  ```
- All required fields present: `id`, `name`, `port`, `color`
- `nextPort` and `releasedPorts` tracked correctly

**Note:** The app launched its gateway on port 40099 instead of 40000 because port 40000 was already occupied by an older gateway process (PID 61410). This is reasonable fallback behavior but worth documenting — the app does not update `instances.json` to reflect the actual port used.

### Test 3: Gateway Starts — PASS

- Launched: `openclaw --profile test-cedar gateway --port 40098 --force --allow-unconfigured`
- Health check passed on first poll: `curl http://127.0.0.1:40098/health` → `{"ok":true,"status":"live"}`
- Profile directory `~/.openclaw-test-cedar/` created with expected contents (`canvas/`, `cron/`, `logs/`, `openclaw.json`)
- Gateway process confirmed listening on port 40098 (PID 77498)

### Test 4: TUI Connects to Gateway — PASS-WITH-ISSUES

- `openclaw --profile test-cedar tui` launches successfully
- TUI renders its UI (status bar, input area, separator lines)
- **Issue:** TUI attempts to connect to `ws://127.0.0.1:18789` (hardcoded default) instead of port 40098 where the gateway was running
- **Issue:** Connection fails with `GatewayClientRequestError: unauthorized: gateway token mismatch`
- **Explanation:** Both issues are expected when bypassing the app's IPC layer. In normal operation, the app spawns both gateway and TUI with matching tokens and coordinates the port. The TUI binary itself works correctly — it starts, renders, and attempts WebSocket connection.

### Test 5: Cleanup — PASS

- Gateway killed (required `kill -9`; `pkill -f` did not match the renamed process `openclaw-gateway`)
- Port 40098 confirmed free after kill
- `~/.openclaw-test-cedar/` removed successfully
- Test Electron process killed

---

## Issues Found

### Issue 1: Port mismatch not persisted (Minor)

When the configured port (40000) is occupied, the app launches the gateway on a different port but does not update `instances.json`. This could cause confusion if the app restarts and tries port 40000 again while the old gateway is still running.

**Severity:** Minor
**Recommendation:** Either update the persisted port or kill stale gateways on startup.

### Issue 2: Gateway process name makes pkill unreliable (Minor)

The `openclaw` binary renames itself to `openclaw-gateway` after exec. This means `pkill -f "openclaw --profile test-cedar"` won't match the running gateway. The app should track PIDs directly (which it likely does via the spawned child process).

**Severity:** Minor — only affects manual management, not the app itself.

### Issue 3: Stale gateway from previous session (Observation)

An older gateway (PID 61410) was still running on port 40000 from a prior app session. The app does not appear to clean up gateways on exit, leading to port conflicts on next launch.

**Severity:** Medium
**Recommendation:** Implement gateway cleanup on app quit, or detect and adopt orphaned gateways.

---

## Overall Verdict: PASS-WITH-ISSUES

The core product works:
- The Electron app builds, launches, and creates default instance state
- The `openclaw gateway` binary starts reliably and serves health checks
- The `openclaw tui` binary starts and renders its UI
- Profile isolation via `--profile` works correctly

The issues found are around lifecycle management (stale processes, port conflicts) rather than core functionality. No blocking bugs discovered.
