# TUI Blank Screen on Profile Switch

**Severity:** P0 — product is nearly unusable. Users constantly switch between profiles.

## Problem

When a user switches between profiles in the sidebar (Profile A → Profile B → back to A), the TUI pane goes blank. It's not just a rendering glitch — it's a **blank new session**. The old TUI content is gone. Typing starts a fresh interaction.

## Root Cause

The issue is a PTY lifecycle problem, not an xterm.js canvas issue.

### Component tree

```
App (selectedId state)
  └─ InstancePane (instance prop — NO key, React reuses same component)
       └─ TuiView (instance, tuiMounted, visible)
            └─ TuiPane (instance, visible)
                 └─ useTerminalPane(visible, ..., deps=[instance.id])
                      └─ xterm.js Terminal + FitAddon + ResizeObserver
```

### What happens on profile switch (A → B → A)

1. **Switch to A:** `useTerminalPane` creates xterm, subscribes to PTY data, calls `launchTui('a')` → PTY spawned, TUI renders full screen
2. **Switch to B:** deps `[instance.id]` change → cleanup runs:
   - xterm terminal **disposed** (buffer destroyed)
   - IPC data subscription **unsubscribed**
   - BUT: the PTY process for A **stays alive** in `manager.tuiProcesses`
   - New xterm created for B, new PTY launched for B — works fine
3. **Switch back to A:** deps change again → cleanup destroys B's xterm, creates new xterm for A
   - `launchTui('a')` called → manager sees `tuiProcesses.has('a')` → returns `{ started: false }` (line 363)
   - **No new PTY is spawned** — the old one is still running
   - New IPC subscription is active — future data from A's PTY will flow
   - But the TUI app hasn't changed state, so **it sends nothing**
   - Result: blank terminal with active PTY, waiting for user input

### Key insight

The TUI app (openclaw tui) is a full-screen terminal application. It painted its full UI once when it started. When the renderer disposes the xterm and creates a new one, that painted buffer is lost forever. The PTY is still alive but the TUI app has no reason to repaint — it doesn't know its output was lost.

## Attempts (chronological)

### Attempt 1: `requestAnimationFrame` + `term.refresh()` on visibility change

Added a `[visible]` effect that defers `fitAddon.fit()` + `term.refresh()` via rAF.

**Result:** No effect. `visible` was hardcoded to `true` in TuiView, so the effect never re-fired.

### Attempt 2: Thread real visibility through props

Changed InstancePane to pass `visible={topTab === 'tui'}` → TuiView → TuiPane.

**Result:** Fixes TUI↔Profile tab switching only. On profile-to-profile switch, `topTab` stays `'tui'`, so `visible` stays `true` — effect doesn't re-trigger.

### Attempt 3: Deferred rAF refresh in main deps effect

Added `requestAnimationFrame` after `term.open(el)` to call `fit()` + `refresh()`.

**Result:** No effect. The refresh fires before PTY data arrives. The terminal buffer is empty — nothing to repaint. This was based on the wrong diagnosis (canvas issue vs data issue).

### Attempt 4: SIGWINCH via PTY resize on reconnect (current)

Modified `manager.launchTui()` to detect an already-running PTY and force a resize (toggle 1×1 → actual size) to trigger SIGWINCH. The TUI app receives the signal and redraws its full screen. Also threaded cols/rows from the renderer through IPC so the resize uses the actual terminal dimensions.

**Status:** Implemented, not yet confirmed working.

## If Attempt 4 Fails — Remaining Options

### A. Keep all xterm instances alive (don't destroy on switch)

Render ALL profiles' InstancePanes simultaneously, hide inactive ones with CSS (`display: none` or `visibility: hidden`). Each profile's xterm stays mounted with its buffer intact. Switching profiles just toggles visibility.

**Tradeoff:** More memory (one xterm + PTY per profile). But profiles are few (typically 2-5), so this is fine. This is the most robust long-term solution.

### B. Add `key={instance.id}` to InstancePane

Forces React to fully destroy and recreate the component tree on profile switch. Combined with the SIGWINCH fix, this ensures a clean DOM element for each terminal.

**Tradeoff:** Destroys all component state on switch. Slight flicker.

### C. Buffer recent PTY output in manager

Keep a ring buffer of the last N bytes of PTY output per instance in `manager.ts`. When `launchTui` returns `{ started: false }`, also return the buffer. The renderer writes the buffer to the new xterm before subscribing to live data.

**Tradeoff:** TUI apps use escape codes for cursor positioning, colors, etc. Replaying raw output may produce garbled display. SIGWINCH is cleaner because the app redraws properly.
