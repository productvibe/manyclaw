#!/usr/bin/env node
/**
 * Download the latest openclaw binary into resources/ for bundling.
 *
 * Run: pnpm copy-openclaw
 * Also runs automatically via the prepack script before building the .app.
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { execSync } from "node:child_process"

const DEST = path.join(process.cwd(), "resources", "openclaw")
const INSTALL_URL = "https://openclaw.ai/install.sh"

function download() {
  console.log(`Downloading latest openclaw via ${INSTALL_URL} ...`)
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-"))
  try {
    execSync(
      `curl -fsSL "${INSTALL_URL}" | OPENCLAW_INSTALL_DIR="${tmpDir}" bash`,
      { stdio: "pipe", shell: "/bin/bash" },
    )
    for (const candidate of [
      path.join(tmpDir, "bin", "openclaw"),
      path.join(tmpDir, "openclaw"),
    ]) {
      if (fs.existsSync(candidate)) return candidate
    }
    const found = execSync(`find "${tmpDir}" -name openclaw -type f`, {
      encoding: "utf8",
    }).trim().split("\n")[0]
    if (found && fs.existsSync(found)) return found
    throw new Error("Install script ran but openclaw binary not found")
  } finally {
    // Clean up temp dir after copying
    process.on("exit", () => fs.rmSync(tmpDir, { recursive: true, force: true }))
  }
}

// --- Main ---

const src = process.env.OPENCLAW_BIN ?? download()

console.log(`Copying ${src} → ${DEST}`)
fs.mkdirSync(path.dirname(DEST), { recursive: true })
fs.copyFileSync(src, DEST)
fs.chmodSync(DEST, 0o755)

const stat = fs.statSync(DEST)
console.log(`Done. ${Math.round(stat.size / 1024 / 1024)}MB`)
