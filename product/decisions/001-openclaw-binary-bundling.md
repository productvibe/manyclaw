# Decision 001: Bundle openclaw binary at build time, not runtime

**Date:** 2026-03-14
**Status:** Decided

## Context

MultiClaw depends on the `openclaw` CLI binary. We needed to decide how the app obtains and manages this dependency.

## Decision

**Bundle openclaw inside the `.app` at build time. Ship it. No runtime downloads.**

`pnpm copy-openclaw` downloads the latest binary from `https://openclaw.ai/install.sh` into `resources/openclaw` during the build. The packaged `.app` contains everything. No network calls at runtime.

## Rejected Alternatives

### 1. Runtime download on first launch + background auto-update
Download openclaw into `~/.multiclaw/bin/` at first launch, check for updates every 24h in the background.

**Why rejected:** Sprays files across the user's system. Contradicts our trust pitch — users should be able to delete the app and it's gone. Hidden background downloads erode trust. Technically sophisticated but wrong for the user.

### 2. Require system-installed openclaw
Expect users to `brew install openclaw` or `curl | bash` separately.

**Why rejected:** Extra step before the app works. Bad first-run experience for a dev tool that's supposed to be "download and go."

### 3. Runtime download into `~/.multiclaw/bin/` with auto-update
Same as #1 but with the rationale that `~/.multiclaw/` gets wiped on uninstall anyway.

**Why rejected:** Still creates hidden state outside the `.app`. Users trying openclaw for the first time don't want to wonder what else got installed. Trust matters more than convenience.

## Consequences

- **New app release required** when openclaw updates. This is fine — openclaw updates daily, we can automate the build.
- **Build machine needs internet** to run `pnpm copy-openclaw`. Offline builds can use `OPENCLAW_BIN=/path/to/binary`.
- **Dev mode** falls back to system-installed openclaw via PATH (no bundling needed for `pnpm dev`).

## Principle

When choosing between technical elegance and user trust, choose trust. The app should behave like a simple Mac app: download it, use it, delete it, it's gone. No hidden processes, no scattered files, no surprises.
