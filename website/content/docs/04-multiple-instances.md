---
title: Running Multiple Instances
slug: multiple-instances
order: 5
section: Concepts
description: Create, manage, and switch between multiple isolated agents.
date: 2026-03-14
---

Click the **+** button at the bottom of the sidebar to create a new instance. You will be prompted to give it a name and choose a colour. The name is for your own reference — it has no effect on the underlying profile. The colour appears in the sidebar status dot to help you tell instances apart at a glance.

Each instance can be started and stopped independently. Click an instance in the sidebar to select it, then use the Start button in the toolbar. The status dot updates in real time: grey for stopped, animated for starting, green for running, amber for error. Multiple instances can run simultaneously.

To reorder instances, drag them in the sidebar. The order persists across app restarts. To delete an instance, right-click it and select Delete — you will be asked to confirm. Deletion is permanent and removes the profile directory from disk.

Switching between instances is instant. MultiClaw keeps each instance's console log buffered in memory while it is running, so switching away and back does not lose output. The TUI view reconnects to the PTY session when you return to it.
