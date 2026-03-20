# CLAUDE.md

See [AGENTS.md](AGENTS.md) for repo structure, architecture, and development guidance.

## Claude-specific notes

- Use `--permission-mode bypassPermissions` when running in this repo
- Run `pnpm build` in `apps/desktop/` to verify changes compile before finishing
- The renderer and main process are separate bundles — a TypeScript error in one won't surface in the other's build
