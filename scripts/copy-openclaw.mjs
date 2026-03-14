#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const DEST = path.join(process.cwd(), "resources", "openclaw")

function findOpenClaw() {
  const candidates = [
    process.env.OPENCLAW_BIN,
    "/opt/homebrew/bin/openclaw",
    "/usr/local/bin/openclaw",
  ].filter(Boolean)

  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }

  try {
    return execSync("which openclaw", { encoding: "utf8" }).trim()
  } catch {
    throw new Error(
      "openclaw binary not found. Install it first: brew install openclaw\n" +
      "Or set OPENCLAW_BIN=/path/to/openclaw"
    )
  }
}

const src = findOpenClaw()
console.log(`Copying ${src} → ${DEST}`)

fs.mkdirSync(path.dirname(DEST), { recursive: true })
fs.copyFileSync(src, DEST)
fs.chmodSync(DEST, 0o755)

const stat = fs.statSync(DEST)
console.log(`Done. ${Math.round(stat.size / 1024 / 1024)}MB`)
