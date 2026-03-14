---
title: How It Works
slug: how-it-works
order: 3
section: Introduction
description: How MultiClaw uses OpenClaw's profile system to run multiple isolated agents on one machine.
date: 2026-03-15
---

## The profile system

OpenClaw has a first-class concept of profiles. Passing `--profile <name>` to any OpenClaw command tells it to use a completely separate directory for all of its state:

```
~/.openclaw-dev/
  config.json       # gateway port, model config, API keys
  auth.token        # gateway authentication token
  sessions/         # conversation history
  workspace/        # agent workspace files
  memory/           # MEMORY.md and daily notes
  skills/           # installed skills
```

Two profiles share nothing in this directory tree. A file written to `~/.openclaw-dev/workspace/` is invisible to `~/.openclaw-production/`. An API key configured in one profile has no effect on another. Each profile is a complete, independent agent environment.

This is not a MultiClaw abstraction. It is a property of OpenClaw itself.

## What MultiClaw does

MultiClaw is a management layer. It creates and manages profiles on your behalf and provides a native macOS UI over their lifecycle.

When you create an instance called "Dev" in MultiClaw, the app:

1. Allocates a port in the `40000+` range
2. Sets `gateway.port` in that profile's config
3. Starts the gateway process with `openclaw --profile dev gateway ...`
4. Polls the gateway's `/health` endpoint until it responds
5. Updates the instance status to `running`

Nothing custom happens under the hood. MultiClaw calls the same `openclaw` binary you could invoke directly from a terminal. The UI is a shell — the isolation is OpenClaw's.

## Instance lifecycle

### Starting

```
openclaw --profile {id} config set gateway.port {port}
openclaw --profile {id} gateway --port {port} --force --allow-unconfigured
```

MultiClaw polls `http://localhost:{port}/health` at 500ms intervals. Once the endpoint returns `200`, the instance transitions to `running`.

### TUI

Clicking **TUI** in the toolbar spawns:

```
openclaw --profile {id} tui
```

This runs inside a PTY (pseudo-terminal). MultiClaw pipes raw terminal output to the in-app xterm.js renderer and sends keystrokes back to the PTY. The TUI session is independent of the gateway — you can run both simultaneously.

### Dashboard

Clicking **Open in Browser** runs:

```
openclaw --profile {id} dashboard --no-open
```

The `--no-open` flag suppresses the automatic browser launch and prints an authenticated URL to stdout. MultiClaw parses that URL and opens it via `shell.openExternal`. This means the dashboard link is always pre-authenticated — no login step.

### Stopping

MultiClaw sends `SIGTERM` to the gateway process and waits for it to exit cleanly. The profile directory is left intact. Starting the instance again picks up exactly where it left off.

## Isolation guarantees

**Isolated per instance:**

- Memory (`MEMORY.md`, daily notes, long-term knowledge)
- Session history
- Agent workspace and files
- API credentials and auth tokens
- Gateway port
- Model and skill configuration

**Shared across instances:**

- The `openclaw` binary itself
- The Node.js runtime
- MultiClaw's own process (it's the parent of all gateway processes)
- System-level resources (CPU, memory, network interface)

The shared binary is not a concern in practice — OpenClaw reads all mutable state from the profile directory, not from the binary. Two instances running different model configurations both use the same binary but behave independently.

## The Mac Mini problem

The original motivation for MultiClaw was straightforward: developers who needed strict agent isolation were buying multiple machines. A personal agent on one Mac, a work agent on another, a production agent on a third. The machines weren't doing anything a single machine couldn't handle — the isolation was the point.

OpenClaw's `--profile` flag makes this unnecessary. A single machine can run as many isolated agents as it has resources for. MultiClaw makes that operationally tractable by removing the need to manage `--profile` flags, port assignments, and process lifecycle manually.

## Cloning an instance

Cloning copies a profile's configuration to a new instance. MultiClaw reads the source profile's `config.json` — model settings, installed skills, any configured preferences — and writes it to a new profile directory under a new name and port.

What cloning copies: model config, skill list, any custom agent configuration.

What cloning does not copy: session history, workspace files, memory, API credentials.

The result is a new agent that starts with the same personality and toolset as the source, but a clean slate for memory and history. This is the fastest way to spin up a variant — a staging clone of a production agent, or a second instance of a well-configured agent for a different project.
