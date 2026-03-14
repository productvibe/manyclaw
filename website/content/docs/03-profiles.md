---
title: Understanding Profiles
slug: profiles
order: 3
section: Concepts
description: How MultiClaw uses OpenClaw's profile system for true agent isolation.
date: 2026-03-14
---

Every instance you create in MultiClaw corresponds to a named OpenClaw profile. Under the hood, MultiClaw passes `--profile <id>` when it launches each agent, which tells OpenClaw to use a completely separate directory for all of its state.

This means two instances share nothing. Memory files, session history, workspace contents, API authentication, skills configuration, and the gateway port are all scoped to the profile. An action taken in one instance — a file written, a session started, a skill configured — has no effect on any other instance.

This isolation is not a MultiClaw abstraction. It is a property of OpenClaw itself. MultiClaw surfaces it visually and manages the process lifecycle, but the isolation guarantee comes from the underlying profile system. You can inspect it directly: each profile lives in `~/.openclaw-<id>/` on disk.

The practical consequence is that you can use different API keys per instance, maintain separate agent personas, and run development and production agents side by side without any risk of state contamination between them.
