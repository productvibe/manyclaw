---
title: Understanding Profiles
slug: profiles
order: 3
section: Concepts
description: How MultiClaw uses OpenClaw's profile system for true agent isolation.
date: 2026-03-14
---
# Understanding Profiles

Each instance in MultiClaw is an OpenClaw profile. When you create an instance called 'Dev', MultiClaw runs it as `openclaw --profile dev`. Everything about that agent — its memory, sessions, workspace, API auth — lives in its own isolated directory.

Two instances can never see each other's context. What your work agent knows, your personal agent doesn't. This isn't a setting — it's structural.

## What's isolated

- Memory (MEMORY.md and daily notes)
- Session history
- Agent workspace and files
- Gateway auth token
- Model configuration
