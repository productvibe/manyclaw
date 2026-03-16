import { defineConfig } from 'tsup'

export default defineConfig([
  // ── Main process ───────────────────────────────────────────────────────
  {
    entry: { main: 'app/main/main.ts' },
    outDir: 'dist/main',
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    external: ['electron', 'node-pty'],
    sourcemap: true,
    clean: true,
  },
  // ── Preload script ─────────────────────────────────────────────────────
  // Must be CJS — Electron contextBridge requires CommonJS preloads
  {
    entry: { preload: 'app/preload/preload.ts' },
    outDir: 'dist/preload',
    format: ['cjs'],
    target: 'node20',
    platform: 'node',
    external: ['electron'],
    sourcemap: true,
  },
])
