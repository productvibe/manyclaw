# Decision 001: Require system-installed openclaw

**Date:** 2026-03-14 (updated)
**Status:** Decided

## Context

ManyClaw depends on the `openclaw` CLI. We needed to decide how the app obtains this dependency.

## Decision

**Require users to install openclaw themselves.** The app looks for it in standard locations (`/opt/homebrew/bin/openclaw`, `/usr/local/bin/openclaw`, PATH).

Install: `curl -fsSL https://openclaw.ai/install.sh | bash`

## Rejected Alternatives

### 1. Bundle openclaw inside the .app at build time
Previously decided, then reversed. openclaw is an npm package (~677MB with node_modules). Bundling it would make the DMG ~800MB. The CLI binary is a Node.js script shim, not a standalone executable — it needs the full node_modules tree to run.

### 2. Runtime download on first launch
Sprays files across the user's system. Contradicts trust pitch.

### 3. Bundle as standalone binary
openclaw is not distributed as a standalone binary. It's an npm package with native dependencies.

## Consequences

- Users must install openclaw before using ManyClaw
- The setup wizard should check for openclaw and show install instructions if missing
- App uses whatever version is installed — always up to date with the user's system
- Uninstall: delete the .app + `rm -rf ~/.multiclaw` + `npm uninstall -g openclaw`

## Principle

Keep the app lightweight. Don't bundle what you can't own. The 677MB npm package is openclaw's responsibility to distribute — ManyClaw is the GUI layer on top.
