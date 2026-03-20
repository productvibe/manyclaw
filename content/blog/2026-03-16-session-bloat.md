---
title: "Your OpenClaw costs are probably higher than they need to be"
date: "March 16, 2026"
description: "Every message in your session history gets sent on every API call. Most people don't know this. Here's what it costs, why it happens, and the durable fix."
slug: session-bloat
---

Someone on Reddit posted this week about reviewing 50 different OpenClaw setups. The second most common problem they found, behind using Opus as the default model for everything, was this:

> "Every message in your current session gets sent with every new API call. That means if you've been chatting with your agent for 3 weeks in the same session, your 'what's the weather' question is carrying thousands of tokens of old conversation with it. You're paying for all of that. Every single time."

Three people they helped cut their monthly costs by 40 to 60 percent by doing one thing: typing `/new` before heavy tasks.

That number is not a typo.

---

## What's actually happening

OpenClaw works by sending the full conversation history with each API request. This is how the model maintains context — it doesn't have memory in the way a human does. It reads the whole conversation every time.

For a fresh session, this is fine. For a session that's been running for two weeks, the context window is carrying a lot of weight that has nothing to do with what you're asking right now.

Every "good morning" exchange. Every debugging session from last Tuesday. Every half-finished thought you never followed up on. All of it goes along for the ride, every single time, at full token cost.

This is not a bug. It's how the architecture works. The question is whether your setup accounts for it.

---

## The discipline fix

The author of that Reddit post recommends `/new` before heavy tasks. Start a fresh session when you're about to do something context-intensive. Your agent isn't wiped when you do this — it still has SOUL.md, MEMORY.md, all its files. You're clearing the conversation buffer, not the agent itself.

This works. It's the right advice.

But it requires you to remember. And to do it at the right moments. And to have a clear sense of what counts as a "heavy task." People who are good at this probably already have low token costs. The people running $47/week setups are not the people thinking carefully about when to type `/new`.

---

## The structural fix

A long-running personal agent and a dev agent running in the same instance share a context window.

Ask your agent to debug a build error after a two-hour conversation about your weekend plans, and both are in the prompt. Ask it to help you draft an email after a session where you were working through a complex technical problem, and all of that is in the prompt too.

The cost is real. The distraction is also real — context that has nothing to do with the current task takes up space that could be used for something relevant.

The structural answer is to keep separate concerns in separate instances. Not because of cost alone, but because of what context is actually for: giving the model relevant information to do the current task well.

A dev agent with a clean context window full of recent code, error logs, and build output is a more capable dev agent than one that also knows about your grocery list, your sleep schedule, and the three jokes you made last Tuesday.

When `/new` is the solution, isolation is the durable version of that solution. You don't need to remember to type a command if the contexts never mix in the first place.

---

The Reddit author ended their post with this: "People optimize for capability before stability. They want their agent to do more before it reliably does anything."

Worth sitting with. Adding capabilities is easy. Getting the basics right — clean context, appropriate models, well-defined scope — is what makes an agent you actually want to use.

ManyClaw handles the isolation side of this. Running separate instances for separate concerns, without the overhead of managing multiple OpenClaw installations yourself, is what it's for.

But you don't need ManyClaw to start. If your setup is getting expensive and you haven't thought about session length, start there.
