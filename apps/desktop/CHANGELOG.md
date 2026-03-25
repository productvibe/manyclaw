# Changelog

## 0.0.2 (2026-03-25)

### Features
- **Export Claw** — save any instance as a portable `.manyclaw` archive from its profile view. Options to strip API keys/tokens (on by default) and include or exclude session history.
- **Import Claw** — restore a `.manyclaw` archive as a new instance via a new Import tab in the New Claw dialog. Patches the config with a fresh port and auth token on import.

---

## 0.0.1 (2026-03-20)

### Release
- Signed and notarized DMG for macOS arm64
- App icon updated with macOS-standard rounded corners
- Repo restructured for open source: `apps/desktop`, `website`, `content`, `product`
- GPL-3.0 license

### Features
- **Auto-update** — electron-updater wired to GitHub Releases; users notified in-app when a new version is available

### Infrastructure
- electron-builder publish configured for GitHub Releases (`productvibe/manyclaw`)
- Team agents bootstrapped with persistent identity and memory

---

## 0.0.1-alpha (2026-03-14)

Initial pre-release.

### Features
- **Profile management** — create, delete, rename, and reorder profiles via drag-and-drop sidebar
- **Profile cards** — status-colored MacMini icons, port labels, and green accent on active selection
- **Gateway lifecycle** — start/stop/restart openclaw gateway per profile with boot log display
- **TUI terminal** — embedded xterm.js terminal for `openclaw tui`, with auto-focus on profile switch
- **Configure terminal** — embedded `openclaw configure` PTY session per profile
- **Profile view** — detail pane with profile metadata and delete actions
- **Dashboard** — open authenticated openclaw dashboard in browser via CLI
- **Onboarding** — non-interactive `openclaw onboard` with saved API token from app settings
- **App settings** — setup token configuration dialog
- **Health probe on startup** — detect already-running gateways and show correct status on app launch
- **Sidebar** — collapsible sidebar with profile cards, context menus (start/stop/delete), drag-to-reorder
- **shadcn/ui** — full component library (buttons, dialogs, context menus, separators, etc.)

### Bug Fixes
- **TUI blank screen on profile switch** — force SIGWINCH resize from renderer after reconnecting to existing PTY, ensuring data subscription is active before redraw
- **TUI auto-focus** — terminal receives keyboard focus immediately on mount and visibility change
- **Visibility prop threading** — pass real tab visibility through TuiView to TuiPane for proper xterm refresh on tab switch
- **xterm line height** — set to 1.0 to match openclaw TUI expectations (was 1.2)
- **Font size** — increased xterm font to 15px for readability
- **Font stack** — reordered to SF Mono > Menlo > Courier New > monospace > Monaco
