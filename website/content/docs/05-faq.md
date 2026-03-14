---
title: FAQ
slug: faq
order: 5
section: Reference
description: Common questions about MultiClaw.
date: 2026-03-14
---

**Does MultiClaw require OpenClaw to be installed?**
MultiClaw bundles a compatible OpenClaw binary, so a separate installation is not required. If you already have OpenClaw installed, MultiClaw uses its own bundled copy and leaves your existing installation untouched.

**Can I use different API keys for each instance?**
Yes. Because each instance is a separate OpenClaw profile with its own isolated config directory, you configure API credentials per instance through that instance's OpenClaw dashboard. MultiClaw does not manage API keys directly.

**Is data shared between instances?**
No. Memory, sessions, workspace files, and configuration are fully isolated per profile. Two instances running simultaneously cannot read each other's state. This is a property of OpenClaw's `--profile` system, not a MultiClaw-level abstraction.

**Is MultiClaw open source?**
Yes. MultiClaw is MIT-licensed and the source is available on [GitHub](https://github.com/nichochar/multiclaw).

**What happens to my data if I delete an instance?**
Deleting an instance removes the profile directory from disk (`~/.openclaw-<id>/`). This is permanent and includes all memory, sessions, and workspace files for that instance. MultiClaw shows a confirmation dialog before deleting.
