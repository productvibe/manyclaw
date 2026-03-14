---
title: The OpenClaw Flag Most Users Don't Know About
date: "2026-02-27"
description: --profile gives you true isolation. Here's what that actually means.
slug: profile-flag
---

If you've been running OpenClaw for a while, you've probably got one instance set up the way you like it — your workspace connected, your memory built up, your sessions running. That's fine for a single context. The moment you want a second one, the default setup doesn't scale.

The flag most users never find is `--profile`.

What it does is more significant than the name suggests. It doesn't just change a setting — it tells OpenClaw to use a completely separate directory for everything. Config, memory, sessions, workspace files, gateway port. Two profiles share nothing. They don't share a single byte of state. You can run `--profile dev` and `--profile work` simultaneously on the same machine and they behave as if they're on separate computers. No context bleed, no accidental memory overlap, no port collision.

This matters for a few common situations.

**Separation between work and personal.** Your personal agent knowing about your work projects, or vice versa, creates noise at best and leaks at worst. Two profiles solve this cleanly — each one only knows what you've deliberately given it.

**Experimentation without risk.** If you want to try a new skill, a new model, or a different memory setup, doing it on your main agent means potentially disrupting something that's working. A separate profile gives you a clean environment to experiment in. Your main setup stays untouched.

**Dev and production agents.** If you're building on top of OpenClaw, testing against your production agent is a bad habit. A `--profile dev` instance lets you run whatever you're building against an isolated environment with no risk to your main agent's state.

The mechanics are simple. Every time OpenClaw starts with a given profile name, it reads from and writes to a directory specific to that profile. The gateway binds to a different port. Nothing crosses over. When you stop the profile and start it again later, it picks up exactly where it left off.

The catch, if you're running profiles manually, is management overhead. You need to remember which terminal is which profile, what ports each one is using, and which one you actually want to talk to right now. For two profiles that's manageable. For three or more it gets messy fast.

But the underlying capability — real, byte-level isolation between OpenClaw instances — is solid. `--profile` is the foundation. What you build on top of it is up to you.
