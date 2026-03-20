---
title: "The blast radius problem"
date: "March 17, 2026"
description: "The more capable your agent gets, the more dangerous a single mistake becomes. Here's the architectural fix."
slug: blast-radius
---

Someone in r/openclaw posted this week about a realization they had partway through building their setup:

> "The more useful my assistant became, the more dangerous the architecture became."

What bothered them wasn't the model. It was the setup. One agent. Full access to personal context and memory. Access to a growing tool list. Authorized to send messages and publish things on their behalf.

At first that felt efficient. Then they saw the problem:

> "If the same agent can remember everything, execute everything, and send/publish things on my behalf, then I've created a giant blast radius. A bad prompt, stale memory, prompt injection, sloppy tool use, or just one wrong assumption can spill into places that had nothing to do with the original task."

That's a precise description of something a lot of OpenClaw users are sitting inside right now, without having named it yet.

---

## Why it happens

When you build out an agent over time, each capability you add feels incremental. Email access. Calendar. GitHub. A cron job that posts on your behalf. Each one made sense in isolation.

But the accumulation creates something you didn't explicitly design: an agent that knows almost everything about you and can act on almost anything.

The problem isn't capability. The problem is coupling. When knowledge and action live in the same component, with no separation between them, there's no natural point where anything slows down before a mistake propagates.

One misconfigured cron. One ambiguous instruction. One session where the context was stale. And the thing with the most knowledge is also the thing that acted fastest.

---

## The fix is architectural, not disciplinary

The poster's solution was to split the system into three distinct roles:

**A controller** that gets broad personal context but whose job is to decide what each task needs to know — not to execute it directly.

**Scoped workers** that get minimum necessary context for a specific task. A writing agent doesn't need your full message history. A scheduling agent doesn't need your financial data.

**An outbound gate** that handles anything with external consequences: sending messages, publishing content, deleting or mutating state. The thing that drafts something is not the thing that sends it.

The key insight they landed on: **the component that knows the most should not also be the component that can act the fastest.**

That's borrowed from how people design secure systems. It applies here for the same reason: the blast radius of a failure should be bounded by design, not patched by being careful.

---

Careful works until it doesn't. Architectural separation works by default.

If your current OpenClaw setup has one agent doing all three of those jobs, the question isn't whether something will eventually go sideways — it's whether the consequences will be contained when it does.

ManyClaw is built around this pattern: separate profiles for separate concerns, each with its own context, tool access, and boundaries. The personal agent and the dev agent and the outbound-actions agent don't share a blast radius.

But the principle doesn't require any specific tool. It requires deciding, deliberately, what each agent should know and what it should be allowed to do. Those are different questions. Most setups treat them as the same question.

They're not.
