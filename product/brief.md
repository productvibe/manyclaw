# ManyClaw — Product Brief

**Version:** 0.1 — 2026-03-14  
**Status:** Early access / ready for marketing  

---

## What It Is

ManyClaw is a native macOS app for running multiple OpenClaw AI agents side by side. Think browser profiles, but for AI — each instance is fully isolated with its own identity, memory, sessions, and config.

---

## The Problem

OpenClaw is powerful. But it's a single agent. Power users — developers, founders, researchers — need more than one:

- A **dev** agent for experimentation, a **production** agent for real work
- A **personal** agent and a **work** agent that never share context
- Multiple specialized agents running concurrently for different projects

Right now, achieving this means terminal tabs, manual `--profile` flags, juggling ports, and hoping nothing collides. It's friction that kills the workflow.

---

## The Solution

ManyClaw is a clean visual shell around OpenClaw's native profile system. One window. Sidebar of named, color-coded agents. Click to select, press Start, you're running.

No terminal required. No port management. No config files. Just agents.

---

## Key Features

**Multi-instance management**
Named, color-coded profiles in a sidebar. Start, stop, restart with one click. Drag to reorder. Status shown at a glance — green is running, grey is stopped.

**Fully isolated agents**
Each instance is a separate OpenClaw profile. Independent memory, sessions, workspace, and API auth. What happens in Dev stays in Dev.

**Live terminal view**
Console output per instance, in-app. Switch between the log console and a full interactive TUI — same toolbar, one click.

**In-app chat**
Send messages directly to any running instance from the Chat view. No browser required. Replies stream back inline.

**Open in browser**
One click opens the full OpenClaw web dashboard for that instance, pre-authenticated. For power users who want the full UI.

**Drag-to-reorder sidebar**
Profiles ordered how you want them. Order persists across sessions.

**Zero-friction first run**
Opens with a default instance pre-created. One click to start. No wizard, no onboarding flow.

---

## Who It's For

- **Developers** running dev/staging/prod agents in parallel
- **Power users** who want strict context separation between personal and work agents
- **Teams** where one person manages multiple specialized agents
- **Anyone** who's hit the ceiling of a single OpenClaw instance

---

## What It's Not

ManyClaw is a visual shell — not a replacement for OpenClaw. It doesn't manage API keys, skills, WhatsApp/Telegram integrations, or agent configuration. Those live in each instance's own OpenClaw UI. ManyClaw just makes running many of them manageable.

---

## Technical Snapshot

- **Platform:** macOS (Electron + React + TypeScript)
- **Backend:** OpenClaw's native `--profile` flag for full process and data isolation
- **Bundled:** Ships with the OpenClaw binary — no separate install required
- **Local-first:** No cloud, no accounts, no telemetry

---

## Content & Blog Guidelines

**When citing community sources (Reddit, HN, forums etc.):** always include the actual link to the post. Don't reference a thread without linking it. Readers should be able to click through to the original.

---

## Status

Core functionality is working:
- ✅ Create, start, stop, delete instances
- ✅ Sidebar with drag-to-reorder and status indicators
- ✅ Console log view per instance
- ✅ Interactive TUI toggle
- ✅ In-app chat
- ✅ Open in browser (authenticated)
- ✅ First-run default instance

Distribution build pipeline in place (`pnpm dist:mac` → signed DMG).
