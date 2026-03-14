# CODE_REVIEW_001 — MultiClaw Architecture Audit

**Reviewer:** Emery 🏗️ — Technical Architect  
**Date:** 2026-03-14  
**Scope:** `src/instances/sandbox.ts`, `src/instances/manager.ts`, `src/instances/types.ts`, `src/main/main.ts`, `src/preload/preload.ts`  
**OpenClaw version audited against:** 2026.3.11 (29dc654)  
**Docs reference:** https://docs.openclaw.ai/cli/gateway

---

## Summary

| File | Verdict | Issues |
|---|---|---|
| `sandbox.ts` | ✅ APPROVED (with one flag) | Minor: undocumented health endpoint |
| `manager.ts` | ❌ NEEDS CHANGES | Critical: manual config reading; medium: undocumented REST endpoint; minor: health check pattern |
| `types.ts` | ✅ APPROVED | Clean |
| `main.ts` | ✅ APPROVED | Clean |
| `preload.ts` | ✅ APPROVED | Clean |

---

## File-by-File Findings

---

### `sandbox.ts` — ✅ APPROVED (with flag)

The launch invocation is correct:

```
openclaw --profile <id> gateway --port <N> --force --allow-unconfigured
```

This is exactly what the docs describe. `--force` handles port conflicts natively. `--profile` handles isolation natively. `--allow-unconfigured` handles ad-hoc/dev runs natively. No custom reimplementation. No config file reading. **This is the right approach and Brook should use it as the model for everything else.**

#### Flag: `waitForHealth()` uses an undocumented HTTP endpoint

**Lines ~32–45:** `waitForHealth` polls `http://127.0.0.1:{port}/health` via plain HTTP fetch.

The docs do not document an HTTP REST health endpoint. The documented health check mechanism is:

```
openclaw gateway health --url ws://127.0.0.1:<port>
```

or

```
openclaw gateway call health
```

Both use WebSocket RPC.

**Impact:** If openclaw stops serving HTTP at `/health` in a future release, this silently breaks instance startup. We'd get a 15-second timeout with no indication of why.

**Verdict for this flag:** Not a blocker in itself — HTTP and WS may both be served at present — but the code is betting on undocumented behaviour. Brook should raise this with the team and document the assumption explicitly if we decide to keep it. If openclaw exposes a stable HTTP health endpoint, that's fine; if it doesn't, switch to `openclaw gateway health --url ws://...`.

---

### `manager.ts` — ❌ NEEDS CHANGES

Two critical violations and two medium findings.

---

#### CRITICAL VIOLATION 1: `readProfileToken()` — Manual config file reading

**Lines ~215–230 (private method `readProfileToken`):**

```
Reads ~/.openclaw-{id}/openclaw.json
Parses gateway.auth.token from the config
Returns the raw token string
```

This is the exact violation the review principle exists to catch: **manually reading openclaw's internal config to extract auth tokens**.

The correct model is:

1. MultiClaw owns the token. When creating an instance, MultiClaw generates the token (a random secret string) and stores it in its own state file (`~/.multiclaw/instances.json`).
2. MultiClaw passes that token to the gateway at launch time via `--token <token>` (already supported by the `launchInstance` call in `sandbox.ts`, just not used yet).
3. When `sendChat` (or any other gateway call) needs the token, it reads it from MultiClaw's own state — not from openclaw's config.

**Why this matters:** openclaw's config file format is internal and subject to change. The path (`~/.openclaw-{id}/openclaw.json`) and the key (`gateway.auth.token`) are implementation details of the openclaw runtime. If either changes — or if the token is stored in a SecretRef (keychain, env) rather than plaintext in the config — this breaks silently and with no helpful error message.

**What Brook should do:**
- Add a `token` field to `PersistedInstance` (generated at `create()` time, stored in `instances.json`).
- Pass `--token <token>` to `launchInstance` in `sandbox.ts`.
- In `sendChat`, read `inst.token` from the in-memory instance state — no file I/O, no config parsing.
- Delete `readProfileToken()`.

**Docs reference:** `openclaw gateway run --token <token>` — the token is an input to the gateway, not something MultiClaw discovers by reading back the config afterwards.

---

#### CRITICAL VIOLATION 2: `sendChat()` — Undocumented REST endpoint + token violation

**Lines ~160–210, `sendChat`:**

```
POST http://127.0.0.1:{port}/v1/chat/completions
Authorization: Bearer <token read from openclaw.json>
```

Two problems stacked here:

**Problem A:** The `/v1/chat/completions` endpoint is not documented anywhere in the openclaw gateway docs. The docs describe the gateway as a **WebSocket server** with RPC methods, accessed via `openclaw gateway call <method>`. An OpenAI-compatible REST API may or may not exist; it is not part of the documented contract.

Before shipping, Brook must verify:
- Does the openclaw gateway actually serve HTTP POST at `/v1/chat/completions`?
- If yes, is this endpoint stable and documented, or an internal implementation detail?

If the endpoint is not documented and stable, the correct approach is to use the WebSocket RPC path. The CLI equivalent (`openclaw gateway call`) gives us the method name space to work from.

**Problem B:** The auth header uses the token from `readProfileToken()`, which is the violation above. Even if the endpoint is correct, the token acquisition method is wrong.

**What Brook should do:** Confirm the API endpoint against docs (or ask Yook to confirm with the openclaw team). If the endpoint is valid and stable, keep the HTTP approach but fix the token acquisition as described above. If it is not documented, re-implement using WebSocket RPC.

---

#### MEDIUM FINDING: `getGatewayStatus()` and `startGateway()` — Undocumented HTTP endpoint (system gateway)

**Lines ~195–220:**

```javascript
fetch('http://127.0.0.1:18789/health')
```

Same pattern as `waitForHealth` in sandbox.ts — polling an undocumented HTTP endpoint instead of using documented CLI tooling. For the system gateway, the documented alternatives are:

```
openclaw gateway status
openclaw gateway health --url ws://127.0.0.1:18789
```

Additionally, `startGateway()` launches:

```
openclaw gateway
```

without `--allow-unconfigured`. Per the docs:

> By default, the Gateway refuses to start unless `gateway.mode=local` is set in `~/.openclaw/openclaw.json`. Use `--allow-unconfigured` for ad-hoc/dev runs.

If the user's system openclaw isn't configured with `gateway.mode=local`, this start attempt will fail silently (the process exits, the 3-second wait returns, health check finds nothing running). The error never surfaces to the user.

**What Brook should do:** Either add `--allow-unconfigured` for robustness, or surface the error properly so users know why the system gateway failed to start. The health check should also use the documented WS-based approach or at minimum add a comment acknowledging the dependency on undocumented HTTP behaviour.

---

#### MINOR FINDING: `profileDir()` hardcodes openclaw internal path structure

**Line ~30:**

```javascript
function profileDir(id: string): string {
  return path.join(os.homedir(), `.openclaw-${id}`)
}
```

This is used in two places: (1) setting `InternalInstance.profileDir` for display/delete purposes, and (2) inside `readProfileToken()`.

Violation (2) is addressed by deleting `readProfileToken()` as described above. Use (1) is acceptable — the docs confirm that `--profile <name>` maps to `~/.openclaw-<name>` — but it should carry a comment citing the docs so future-Brook doesn't wonder where this came from.

---

### `types.ts` — ✅ APPROVED

Clean. Correct. The `profileDir` field in `InternalInstance` documents the path but doesn't read from it directly. No violations.

One note: when the `token` field is added to `PersistedInstance` (per the fix above), it should also be added here.

---

### `main.ts` — ✅ APPROVED

Clean. Correctly delegates all openclaw interaction to `InstanceManager`. No direct config reading, no hardcoded paths, no OPENCLAW_STATE_DIR references. IPC wiring is appropriate.

---

### `preload.ts` — ✅ APPROVED

Clean. Correct use of contextBridge. No openclaw interaction. Shape matches the IPC API contract. Nothing to change.

---

## Brook's Fix List (Prioritised)

### Must-fix before merge

1. **Delete `readProfileToken()`** — this method should not exist. See Critical Violation 1 above for the correct pattern.

2. **Add `token` to `PersistedInstance` and `InternalInstance`** — generated at `create()` time, stored in `instances.json`, passed to `launchInstance` via `--token`.

3. **Fix `sendChat` token acquisition** — read `inst.token` from in-memory state, not from openclaw's config files.

4. **Confirm `/v1/chat/completions` endpoint** — either document that it's a stable openclaw gateway API, or replace with the WebSocket RPC approach.

### Should-fix (not blockers, but don't let them linger)

5. **`startGateway()` — add error surfacing or `--allow-unconfigured`** — silent failure on unconfigured system is a bad user experience.

6. **Comment the HTTP `/health` dependency** — if we're betting on an undocumented endpoint, say so explicitly in the code so it's easy to find if it breaks.

7. **Comment `profileDir()`** — cite the docs (`--profile <name>` → `~/.openclaw-<name>`) so the path isn't a mystery.

---

## Rules for Brook and Finley Going Forward

**Rule 1: Token ownership is ours.**  
MultiClaw generates tokens for its own instances. We pass them in; we don't read them back. openclaw's config files are openclaw's business, not ours.

**Rule 2: Use `--profile`, `--port`, `--force` — not filesystem workarounds.**  
If you feel the urge to write config files, read config files, or scan ports manually: stop. The CLI flags handle this. sandbox.ts is the correct model.

**Rule 3: Only call documented endpoints.**  
If the docs don't describe it, we don't call it. Use `openclaw gateway health`, `openclaw gateway call`, and the WebSocket RPC interface. Don't assume an HTTP REST API exists because it currently works.

**Rule 4: Fail loudly.**  
Catch errors from gateway startup and surface them. A silent catch + 3-second wait is not error handling.

**Rule 5: Before a new integration, read the docs first.**  
I don't mean skim. I mean: `openclaw gateway --help`, then `https://docs.openclaw.ai/cli/gateway`, then write the code. In that order.

---

## Pending: Brook's `brook-fix-auth` branch

Brook is currently fixing token auth in `sendChat`. When that branch is ready for review, I will check:

- Does it delete `readProfileToken()`? (**Required.** If no: rejected.)
- Does it add a `token` field to persisted state and pass it via `--token` at launch? (**Required.**)
- Does it read `inst.token` from in-memory state — not from any file? (**Required.**)
- Does it address the `/v1/chat/completions` endpoint question? (**Required** — either confirm it's documented, or switch to WS RPC.)
- Is `readProfileToken()` fully gone, or just unused? (**Must be deleted**, not just bypassed.)

A fix that swaps one form of config reading for another will be rejected. The correct fix changes the ownership model: MultiClaw owns the token end-to-end.

---

*Emery 🏗️ — Read the docs, then judge the code against them.*
