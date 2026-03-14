---
title: Getting Started
date: "2026-03-14"
description: Install MultiClaw and run your first multi-agent session in under two minutes.
---

# Getting Started

## Installation

Install MultiClaw via Homebrew:

```bash
brew install --cask multiclaw
```

## First Launch

Open MultiClaw from your Applications folder or dock. The app will detect any existing OpenClaw installations automatically.

## Creating Your First Agent

1. Click the **+** button in the sidebar
2. Name your agent (e.g., "frontend", "backend", "tests")
3. Choose a working directory
4. Click **Start**

That's it. Your agent is running in full isolation with its own config, ports, and context.

## Managing Multiple Agents

The sidebar shows all your agents at a glance. Each one is color-coded and shows its current status:

- **Green**: Running
- **Yellow**: Starting up
- **Red**: Stopped or errored

Click any agent to see its terminal output. Toggle between raw terminal and TUI view with the button in the top-right corner.

## Next Steps

- Read about [profiles](/docs/profiles) to learn how to configure per-agent settings
- Check out [keyboard shortcuts](/docs/shortcuts) for power-user workflows
