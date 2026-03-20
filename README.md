# ManyClaw

**Run multiple OpenClaw AI agents side by side.**

ManyClaw is a native macOS app that gives you a clean visual shell around OpenClaw's profile system. Named, color-coded agents in a sidebar. One click to start. Fully isolated — each instance has its own memory, sessions, workspace, and config.

---

## The problem

OpenClaw is powerful. But it's a single agent. Power users — developers, founders, researchers — hit a ceiling fast:

- You want a **dev** agent for experiments and a **production** agent for real work
- You need a **personal** agent and a **work** agent that never share context
- You're managing multiple projects that each deserve their own focused agent

Right now, achieving this means terminal tabs, manual `--profile` flags, juggling ports, and hoping nothing collides. ManyClaw removes all of that.

---

## What it does

One window. Sidebar of agents. Click to select, press Start, you're running.

- **Multi-instance management** — named, color-coded profiles with one-click start/stop
- **Full isolation** — each instance is a separate OpenClaw profile with independent memory and sessions
- **Live console** — per-instance log output, switchable to a full interactive TUI
- **In-app chat** — send messages directly to any running instance, replies stream back inline
- **Open in browser** — one click opens the full OpenClaw dashboard for that instance, pre-authenticated
- **No terminal required** — no port management, no config files, no flags

---

## Who it's for

Developers running parallel agents. Researchers keeping projects separate. Anyone who's hit the ceiling of a single OpenClaw instance.

---

## Requirements

- macOS (Apple Silicon)
- [OpenClaw](https://openclaw.ai) installed

---

## Install

Download the latest DMG from [manyclaw.app](https://manyclaw.app), open it, drag ManyClaw to Applications.

---

## Build from source

```bash
cd apps/desktop
pnpm install
pnpm dev         # development
pnpm dist:mac    # production DMG
```

For a signed and notarized build:

```bash
APPLE_ID="your@email.com" \
APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx" \
APPLE_TEAM_ID="YOURTEAMID" \
pnpm dist:mac
```

---

## Repo structure

```
apps/
  desktop/        Electron app (TypeScript + React)
    src/
      main/       Main process (Electron, IPC, instance lifecycle)
      renderer/   UI (React, Tailwind, shadcn/ui)
      preload/    Preload bridge
      instances/  OpenClaw process management
      shared/     Shared IPC types
content/
  blog/           Blog posts (markdown)
  docs/           Documentation (markdown)
product/
  brief.md        Product overview
  notes/          Architecture, UX spec, technical learnings
  decisions/      Architecture decision records
website/          Marketing site (React Router + Tailwind)
```

---

## Tech stack

- Electron + React + TypeScript + Vite
- node-pty + xterm.js for the TUI
- shadcn/ui + Tailwind CSS
- electron-builder for distribution

---

## License

GPL-3.0 — see [LICENSE](LICENSE)

Built by [Productvibe](https://productvibe.io)
