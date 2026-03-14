import { defineConfig } from 'tsup'

export default defineConfig([
  // ── Main process ───────────────────────────────────────────────────────
  {
    entry: { main: 'src/main/main.ts' },
    outDir: 'dist/main',
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    external: ['electron'],
    // Bundle execa and everything else — no node_modules needed at runtime
    noExternal: ['execa'],
    sourcemap: true,
    clean: true,
  },
  // ── Preload script ─────────────────────────────────────────────────────
  {
    entry: { preload: 'src/preload/preload.ts' },
    outDir: 'dist/preload',
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    external: ['electron'],
    sourcemap: true,
  },
])
