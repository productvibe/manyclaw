# TUI Blank Screen on Profile Switch

**Severity:** P0 — product is nearly unusable. Users constantly switch between profiles.

**Status:** Fixed (Attempt 6).

## Problem

When a user switches between profiles in the sidebar (Profile A → Profile B → back to A), the TUI pane goes blank. It's not just a rendering glitch — it's a **blank new session**. The old TUI content is gone. Typing starts a fresh interaction.

## Root Cause (two issues)

### 1. xterm destroyed on every profile switch

App rendered only the selected InstancePane. Switching profiles unmounted the old one (disposing its xterm buffer) and mounted a new one. The PTY stayed alive but the TUI app had no reason to repaint.

### 2. Visibility effect never sent SIGWINCH

The `[visible]` effect in `useTerminalPane` called `fit()` + `refresh()` but never called `resize()` to notify the PTY. Manual window resize worked because the ResizeObserver *did* call `resize()` — that was the only difference.

Additionally, xterm.js uses `IntersectionObserver` to pause rendering on hidden elements. A single `requestAnimationFrame` could fire before that observer resumed the renderer, making `fit()` + `refresh()` no-ops.

## Fix (Attempt 5 + 6)

Three changes applied together:

### A. Keep all xterm instances alive (Attempt 5)

App.tsx now renders ALL InstancePanes simultaneously, stacked with `position: absolute; inset: 0`. Only the selected one is visible (`visibility: visible`, `zIndex: 1`); the rest are hidden. Each profile's xterm stays mounted with its buffer intact. Switching profiles toggles CSS visibility — no disposal, no buffer loss.

**Files changed:**
- `src/renderer/App.tsx` — render all instances, pass `visible` prop
- `src/renderer/components/InstancePane.tsx` — accept `visible`, hide with CSS, thread to TuiPane via `visible && topTab === 'tui'`

### B. Fix the visibility effect (Attempt 5)

`useTerminalPane`'s `[visible]` effect now:
1. Uses **double rAF** — first frame lets the browser complete layout and xterm's IntersectionObserver resume the renderer; second frame does the work
2. Sends SIGWINCH to the PTY so the TUI app repaints

The `resize` function is stored in a ref (`resizeRef`) so the `[visible]` effect can access it without being in the deps-effect closure.

### C. Two-step resize with delay (Attempt 6)

Attempt 5's SIGWINCH sent the same dimensions the PTY already had. Many TUI frameworks compare old vs new size and skip the redraw if they match — so the SIGWINCH was silently ignored.

The fix uses a two-step resize with a real 150ms delay:
1. **Immediately (double-rAF):** fit + refresh + focus + resize to `cols - 1` (forces a real dimension change)
2. **150ms later:** fit + resize back to actual `cols` (second SIGWINCH triggers full repaint at correct size)

The delay is critical — back-to-back synchronous resizes get coalesced by the OS/PTY, but a 150ms gap guarantees two distinct SIGWINCH signals.

**File changed:** `src/renderer/hooks/useTerminalPane.ts`

## Why manual resize fixed it

The ResizeObserver callback calls both `fitAddon.fit()` AND `resize(term.cols, term.rows)`. The resize sends SIGWINCH to the PTY, which makes the TUI app repaint its full screen. Manual window resize changes the actual dimensions, so the TUI app always repaints. The visibility effect was both missing the `resize()` call (fixed in attempt 5) and sending same-size resizes that got ignored (fixed in attempt 6).

## Previous Attempts

### Attempt 1: `requestAnimationFrame` + `term.refresh()` on visibility change

**Result:** No effect. `visible` was hardcoded to `true` in TuiView.

### Attempt 2: Thread real visibility through props

**Result:** Fixes TUI/Profile tab switching only. Profile-to-profile switch keeps `topTab === 'tui'`, so `visible` stays `true`.

### Attempt 3: Deferred rAF refresh in main deps effect

**Result:** No effect. Refresh fires before PTY data arrives — empty buffer.

### Attempt 4: SIGWINCH via PTY resize on reconnect

Toggle resize 1x1 → actual in `doLaunch()` when `started === false`.

**Result:** Unreliable. Both resizes fire back-to-back synchronously. Some TUI apps compare old vs new dimensions and skip the redraw since the final size matches the original. Also doesn't solve the xterm buffer destruction issue.

### Attempt 5: Keep all InstancePanes alive + visibility effect with SIGWINCH

Render all panes, hide with CSS. Send SIGWINCH via `resize(cols, rows)` on visibility change.

**Result:** Mostly fixed but intermittent. Same-size SIGWINCH ignored by TUI app when dimensions haven't changed.

### Attempt 6: Two-step resize with 150ms delay

Shrink to `cols - 1` immediately, restore to actual `cols` after 150ms. Two distinct SIGWINCH signals with different dimensions.

**Result:** Fixed. The dimension change forces the TUI app to repaint every time.
