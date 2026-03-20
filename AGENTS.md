# AGENTS.md

Guide for AI agents working in this repo.

## Repo structure

```
apps/desktop/       Electron app — the main product
  src/
    main/           Main process: Electron lifecycle, IPC handlers, instance management
    renderer/       React UI: components, hooks, pages
    preload/        Preload bridge (contextBridge, IPC exposure)
    instances/      OpenClaw process management (spawn, poll, lifecycle)
    shared/         Shared IPC types — imported by BOTH main and renderer
  build/            Electron-builder resources (icons, entitlements)
  scripts/          Build/dev utilities
content/            Markdown content (blog, docs) — independent of website
product/            Product context: brief, notes, architecture decisions
website/            Marketing site (React Router + Tailwind)
```

## Desktop app: key facts

- **Two processes:** main (Node.js/Electron) and renderer (browser/React). They communicate via IPC only.
- **IPC contract:** all channel names and shared types live in `src/shared/ipc.ts`. If you add a channel, add it there.
- **Preload:** `src/preload/preload.ts` exposes IPC to the renderer via `contextBridge`. Must be CJS (Electron requirement).
- **Main process** bundles as ESM via tsup. **Preload** bundles as CJS. **Renderer** is a standard Vite/React build.
- **node-pty** is a native module — must be rebuilt for the Electron version. `pnpm dist:mac` handles this automatically.
- **Instance = OpenClaw `--profile {id}`** — each instance gets its own isolated profile at `~/.openclaw-{id}/`.

## Dev workflow

```bash
cd apps/desktop
pnpm install
pnpm dev          # starts renderer (Vite) + main process (tsup --watch) concurrently
pnpm build        # production build (no packaging)
pnpm dist:mac     # build + sign + notarize + DMG
```

## Common gotchas

- **Don't import Node-only modules in `src/shared/`** — it's used by both processes.
- **Don't read OpenClaw tokens directly from JSON** — use the CLI. The CLI owns auth.
- **Dashboard URL:** use `openclaw --profile {id} dashboard --no-open` and parse the URL from stdout. Don't hand-roll auth.
- **TUI launch:** `openclaw --profile {id} tui` — no `--url` or `--token` flags needed.
- **Port collisions:** each instance is assigned a unique port at creation time, stored in its profile config.

## Making changes

- UI components live in `src/renderer/components/`. Shared UI primitives are in `src/renderer/components/ui/` (shadcn/ui).
- IPC handlers are registered in `src/main/ipc/`.
- Instance lifecycle (start/stop/health poll) is in `src/instances/manager.ts`.
- Keep `src/shared/ipc.ts` as the single source of truth for channel names and cross-process types.
