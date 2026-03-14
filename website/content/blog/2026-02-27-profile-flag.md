---
title: The OpenClaw Flag Most Users Don't Know About
date: "2026-02-27"
description: --profile gives you true isolation. Here's what that actually means.
slug: profile-flag
---

Most OpenClaw users run a single instance and never touch `--profile`. That's fine for casual use. But if you've ever wanted a second agent that doesn't share memory with your first, or tried running two instances on the same machine and hit port conflicts, `--profile` is what you were missing.

The flag tells OpenClaw to use a completely separate directory for everything — config, memory, sessions, workspace files, gateway port. Two profiles don't share a single byte of state. You can run a `--profile dev` and a `--profile work` simultaneously, and they behave as if they're on different machines. There's no bleed, no accidental context sharing, no collision.

MultiClaw is a visual wrapper around exactly this mechanism. Every instance you create in the sidebar is a named profile under the hood. The app handles the port assignment, the process lifecycle, and the directory setup. The flag that most users never discover becomes the foundation of the whole product.
