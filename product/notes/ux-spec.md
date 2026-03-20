# ManyClaw — UX Specification
**Author:** Dee 🎨  
**Date:** 2026-03-14  
**Status:** v1.0 — Ready for implementation  
**Implementer:** Renderer team

---

## Overview

ManyClaw is a macOS desktop app for managing multiple isolated OpenClaw AI instances side by side. Three things, nothing more:

1. **Manage instances** — create, start, stop, delete named profiles
2. **Chat** — send messages to a running instance, see replies
3. **Terminal pane** — see each instance's TUI/logs live

The design must feel like Finder or System Settings. Not an Electron app. Not a web app in a frame. A macOS app that happens to be built with web tech.

---

## Mental Model

Users think of instances like **browser profiles** or **Docker containers** — named, colored, isolatable. Dev is blue, Production is red. You start them, use them, stop them. The app stays out of the way.

**Key flow:** Sidebar → select instance → see its terminal → chat with it.

---

## Screen 1: Main Window

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ● ● ●  [spacer 8px]  ManyClaw        [divider]  [chat icon]  │  ← Toolbar: 52px
├─────────────────────┬───────────────────────────────────────────┤
│                     │                                           │
│     Sidebar         │         Content Area                      │
│     220px           │         flex-1                            │
│                     │                                           │
│                     │                                           │
│                     │                                           │
│                     │                                           │
│                     │                                           │
└─────────────────────┴───────────────────────────────────────────┘
```

### Window chrome

- **Min size:** 800×560px
- **Default size:** 1200×760px
- **Titlebar:** native macOS, integrated (no separate bar)
- **Traffic lights:** standard position, left-aligned
- **Window title:** "ManyClaw" — centered in toolbar
- **Toolbar:** `height: var(--toolbar-height)` = 52px, `background: var(--sidebar-bg)` = `#F5F5F5`
- **Sidebar/content divider:** `1px solid var(--border-color)` = `rgba(0,0,0,0.1)`

### Toolbar contents

| Position | Element | Notes |
|----------|---------|-------|
| Left | Traffic lights (system) | Standard macOS |
| Center | App name "ManyClaw" | `font-size: 15px`, `font-weight: 600`, `color: #1C1C1E` |
| Right | Chat icon button | `20×20px` icon, `color: #8E8E93`, switches to Chat view |

The toolbar has a subtle bottom border: `border-bottom: 1px solid rgba(0,0,0,0.08)`.

---

## Screen 2: Sidebar

### Layout

```
┌─────────────────────┐
│                     │  ← 16px padding top (below toolbar)
│  INSTANCES      [+] │  ← Section header row
│                     │
│  ● Dev              │  ← Instance row (selected)
│  ● Production       │  ← Instance row
│  ● Staging          │  ← Instance row
│                     │
│                     │
│                     │
└─────────────────────┘
```

### Section header

```
INSTANCES     [+]
```

- Text: `"INSTANCES"` — `font-size: 11px`, `font-weight: 600`, `letter-spacing: 0.06em`, `color: #8E8E93`, uppercase
- `[+]` button: 16×16px, SF Symbol `plus` or equivalent, `color: #8E8E93`
  - Hover: `color: #1C1C1E`
  - Active (click): `color: #007AFF`
- Row padding: `padding: 0 12px`, `height: 24px`, `display: flex`, `align-items: center`, `justify-content: space-between`
- Margin: `margin-top: 16px`, `margin-bottom: 4px`

### Instance row

```
● Name                 ◉
```

- Height: `32px` (`var(--item-height)`)
- Padding: `0 12px`
- Layout: `display: flex`, `align-items: center`, `gap: 8px`

**Status dot (left):**
- Size: `8px × 8px`, `border-radius: 50%`
- Running → `background: var(--success)` = `#34C759`
- Stopped → `background: var(--text-secondary)` = `#8E8E93`
- Starting/Stopping → animated pulse, `background: var(--warning)` = `#FF9500`

**Instance name:**
- `font-size: 13px`, `color: var(--text-primary)` = `#1C1C1E`
- `flex: 1`, truncated with ellipsis if overflow

**Right indicator (only on hover or selected):**
- Shows a small colored dot matching the instance's accent color (user-set)
- `6px × 6px`, `border-radius: 50%`
- Fade in on hover: `transition: opacity 150ms ease`

### Row states

| State | Background | Text color |
|-------|-----------|------------|
| Default | transparent | `#1C1C1E` |
| Hover | `rgba(0,0,0,0.04)` | `#1C1C1E` |
| Selected | `rgba(0,122,255,0.10)` | `#007AFF` |
| Selected + focused window | `rgba(0,122,255,0.12)` | `#007AFF` |

Selected row: `border-radius: 6px`, applied within sidebar padding (`margin: 0 8px`, so the highlight doesn't touch sidebar edges — matches Finder behavior).

### Context menu (right-click on row)

```
Start
Stop
──────────────
Rename
Change Color
──────────────
Delete…
```

- "Delete…" → `color: #FF3B30` (destructive)
- Separator: `height: 1px`, `background: rgba(0,0,0,0.1)`
- Shown via native context menu (`contextMenuTrigger` component)

### Add instance sheet

Triggered by `[+]` in sidebar header.

**Sheet dimensions:** 360×200px, centered in window  
**Sheet type:** `shadcn/ui` `<Dialog>`, styled with `border-radius: 12px`, `box-shadow: 0 20px 60px rgba(0,0,0,0.2)`

```
┌────────────────────────────────────────┐
│                                        │
│  New Instance                          │  ← 18px, semibold
│                                        │
│  Name                                  │
│  ┌──────────────────────────────────┐  │
│  │ My Agent                         │  │  ← text input, placeholder
│  └──────────────────────────────────┘  │
│                                        │
│  Color                                 │
│  ⬤ ⬤ ⬤ ⬤ ⬤ ⬤                       │  ← color swatches
│                                        │
│                    [Cancel]  [Create]  │
└────────────────────────────────────────┘
```

**Name input:**
- shadcn `<Input>`, native macOS feel: `border: 1px solid rgba(0,0,0,0.2)`, `border-radius: 6px`, `height: 32px`, `font-size: 13px`
- Focus ring: `outline: 2px solid rgba(0,122,255,0.5)`, `outline-offset: 2px`
- Placeholder: `"My Agent"`, `color: #C7C7CC`

**Color swatches (6 options):**
```
Blue     #007AFF
Green    #34C759
Orange   #FF9500
Red      #FF3B30
Purple   #AF52DE
Teal     #5AC8FA
```
- Swatch size: `20×20px`, `border-radius: 50%`
- Selected: `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px <swatch-color>`
- Default selection: Blue (`#007AFF`)
- Gap between swatches: `8px`

**Buttons:**
- Cancel: shadcn `<Button variant="ghost">`, `height: 28px`, `font-size: 13px`
- Create: shadcn `<Button>`, accent filled, `background: #007AFF`, `color: #FFFFFF`, `height: 28px`, `font-size: 13px`
- `Create` disabled when name is empty

**On Create:** Sheet closes, new instance appears in sidebar (stopped state), sidebar scrolls to it.

---

## Screen 3: Instance Pane

Content area when an instance row is selected.

### Layout

```
┌───────────────────────────────────────────────────────┐
│  Dev                [●] Running    [■ Stop] [↺ Restart]│  ← Instance toolbar: 44px
├───────────────────────────────────────────────────────┤
│                                                       │
│  $ openclaw start --profile dev                       │  ← Terminal pane
│  ✓ Starting OpenClaw (dev)...                         │     flex-1
│  ✓ Listening on :8080                                 │
│  ▌                                                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Instance toolbar

- Height: `44px`
- Background: `#FAFAFA` (one step off white, visually distinct from content)
- Bottom border: `1px solid rgba(0,0,0,0.08)`
- Padding: `0 16px`
- Layout: `display: flex`, `align-items: center`, `gap: 12px`

**Instance name:**
- `font-size: 15px`, `font-weight: 600`, `color: #1C1C1E`
- Clicking the name makes it editable inline (click to rename)
- Editable state: underline appears, cursor changes to text

**Status badge:**
```
● Running      ← success color
● Stopped      ← secondary
● Starting…    ← warning + animated
● Error        ← destructive
```
- Status text: `font-size: 11px`, `font-weight: 500`, `letter-spacing: 0.02em`
- Dot: `8px`, same colors as sidebar dot

**Action buttons (right side):**

When **stopped:**
```
[▶ Start]
```

When **running:**
```
[■ Stop]   [↺ Restart]
```

Button specs:
- Height: `28px`, `border-radius: 6px`, `font-size: 12px`, `font-weight: 500`
- Start: `background: rgba(52,199,89,0.12)`, `color: #34C759`, `border: 1px solid rgba(52,199,89,0.3)`
- Stop: `background: rgba(255,59,48,0.10)`, `color: #FF3B30`, `border: 1px solid rgba(255,59,48,0.25)`
- Restart: `background: rgba(255,149,0,0.10)`, `color: #FF9500`, `border: 1px solid rgba(255,149,0,0.25)`
- Hover: `opacity: 0.85` + slight background darkening

**Stop confirmation:**
No destructive confirmation for Stop — it's a process, not data. Stop is immediate. Delete (from context menu) asks confirmation.

### Terminal pane

- Background: `#1C1C1E` (macOS dark base — not pure black, not gray, this specific value)
- Text: `#F5F5F7`
- Font: `'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace`
- Font size: `13px`
- Line height: `1.5`
- Padding: `12px 16px`
- Scrollable vertically, auto-scrolls to bottom when new output arrives
- `flex: 1`, fills remaining height after toolbar
- Scroll indicator: native macOS scrollbar style (`scrollbar-width: thin`)

**Empty terminal (instance stopped):**
```
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  Instance is stopped.
  Press Start to run it.
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```
- Centered vertically in terminal pane
- Text: `color: #48484A` (dim, not distracting)
- Font: same terminal font at 13px

**Error state (instance crashed):**
```
⚠ Instance exited with code 1
  Last line: [error output...]
  
  [↺ Restart]
```
- `⚠` in `#FF9500`
- Restart button same spec as toolbar button, centered

---

## Screen 4: Chat View

Triggered by chat icon in toolbar (top-right). Global view across all instances, or focused on selected instance.

### Layout

```
┌───────────────────────────────────────────────────────┐
│  [← Back]    Chat         [Dev ▾]  ← instance picker  │  ← 44px toolbar
├───────────────────────────────────────────────────────┤
│                                                       │
│                          ╔══════════════════╗         │
│                          ║ Hello, run ls -la ║         │  ← User message (right)
│                          ╚══════════════════╝         │
│                                                       │
│  ╔═══════════════════════════════╗                    │
│  ║ Sure! Here's the output:      ║                    │  ← Assistant reply (left)
│  ║ total 48                      ║                    │
│  ║ drwxr-xr-x  ...               ║                    │
│  ╚═══════════════════════════════╝                    │
│                                                       │
├───────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  [Send]               │  ← Input row: 56px
│  │ Message Dev...             │                        │
│  └────────────────────────────┘                        │
└───────────────────────────────────────────────────────┘
```

### Chat toolbar

- Back arrow (`←`) returns to instance pane
- Title: `"Chat"`, centered, same spec as main toolbar
- Instance picker: shadcn `<Select>`, shows selected instance name + colored dot
  - Shows only running instances (stopped ones grayed out with "(stopped)" suffix)
  - Width: auto, min `140px`

### Message list

- Background: `var(--content-bg)` = `#FFFFFF`
- Padding: `16px`
- Scroll: vertical, auto-scroll on new message

**User message bubble:**
- Background: `#007AFF`
- Text: `#FFFFFF`
- `border-radius: 16px 16px 4px 16px`
- `max-width: 65%`
- `align-self: flex-end`
- `padding: 8px 12px`
- `font-size: 13px`
- `margin-bottom: 8px`

**Assistant message bubble:**
- Background: `#F2F2F7`
- Text: `#1C1C1E`
- `border-radius: 16px 16px 16px 4px`
- `max-width: 75%`
- `align-self: flex-start`
- `padding: 8px 12px`
- `font-size: 13px`
- `margin-bottom: 8px`

**Code blocks inside assistant messages:**
- Background: `#1C1C1E`
- Text: `#F5F5F7`
- Font: monospace, 12px
- `border-radius: 6px`
- `padding: 8px 10px`
- Full-width within bubble

**Timestamps:**
- `font-size: 11px`, `color: #8E8E93`
- Shown below message, only when message is hovered
- Right-aligned for user, left-aligned for assistant

**Loading / thinking state:**
```
● ● ●   ← animated pulse dots
```
- Three dots, `8px` each, `gap: 4px`, `background: #8E8E93`
- Pulse animation: opacity 0.3 → 1 → 0.3, staggered 150ms between dots

**Empty chat state:**
```
[instance colored dot — 32px]
Start chatting with Dev

Type a message below to send it to your running instance.
```
- Centered in message area
- Instance name uses instance accent color
- Subtitle: `font-size: 13px`, `color: #8E8E93`

### Input row

- Height: `56px`
- Background: `#FAFAFA`
- Top border: `1px solid rgba(0,0,0,0.08)`
- Padding: `10px 16px`
- Layout: `display: flex`, `align-items: center`, `gap: 8px`

**Input field:**
- `flex: 1`
- `height: 36px`
- `border: 1px solid rgba(0,0,0,0.15)`
- `border-radius: 18px` (pill shape — matches macOS Messages)
- `padding: 0 14px`
- `font-size: 13px`
- `background: #FFFFFF`
- Placeholder: `"Message [instance name]…"` — `color: #C7C7CC`
- Focus: `outline: none`, `border-color: rgba(0,122,255,0.5)`
- `Enter` key sends message

**Send button:**
- `width: 32px`, `height: 32px`
- `border-radius: 50%`
- Background: `#007AFF` when input has text, `#C7C7CC` when empty
- Icon: arrow-up, `color: #FFFFFF`, `16×16px`
- Transition: `background 150ms ease`
- Disabled when input empty (no cursor change needed — just visual state)

**Instance stopped warning:**
```
Dev is stopped. Start it to chat.   [▶ Start]
```
- Shown instead of input when selected instance is stopped
- Background: `rgba(255,149,0,0.08)`
- Text: `font-size: 13px`, `color: #8E8E93`
- Start button: same spec as instance toolbar Start

---

## Screen 5: Empty State (No Instances)

Shown in content area when sidebar has no instances.

### Layout

Content area is centered both axes:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│                   [app icon 48px]                     │
│                                                       │
│               No instances yet                        │
│                                                       │
│         Run multiple OpenClaw profiles                │
│          side by side — dev, staging,                 │
│               production, or more.                    │
│                                                       │
│                 [+ New Instance]                      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**App icon placeholder:** 48×48px, `border-radius: 12px`, `background: rgba(0,122,255,0.10)` with a simple grid/instance icon in `#007AFF`

**Title:** `"No instances yet"`
- `font-size: 17px`, `font-weight: 600`, `color: #1C1C1E`
- `margin-top: 16px`

**Subtitle:**
- `font-size: 13px`, `color: #8E8E93`
- `max-width: 260px`, `text-align: center`, `line-height: 1.5`
- `margin-top: 6px`

**CTA Button:** `"+ New Instance"`
- shadcn `<Button>` default variant
- `background: #007AFF`, `color: #FFFFFF`
- `height: 32px`, `border-radius: 8px`, `font-size: 13px`, `font-weight: 500`
- `padding: 0 16px`
- `margin-top: 20px`
- Same action as `[+]` in sidebar header

---

## Screen 6: First Launch

### Decision: Pre-populated default instance

**Why:** Zero actions to understanding, one action to running.

A new user opens ManyClaw and immediately sees an instance called **"My OpenClaw"** in the sidebar, stopped state. The content area shows the instance pane with a single large Start button.

They click Start. Done. They're running.

No wizard. No onboarding flow. No "welcome to ManyClaw" modal. Just: here's your first instance, press play.

**Implementation:**
- App creates a default instance record on first launch: `{ name: "My OpenClaw", color: "#007AFF", status: "stopped" }`
- This is persisted in app state immediately — not a tutorial overlay
- The instance pane for first launch has a one-time contextual hint (dismissible):

```
┌─────────────────────────────────────────────────────┐
│  ℹ  This is your first instance. Press Start to run │
│     it, or create more using [+] in the sidebar.    │  [×]
└─────────────────────────────────────────────────────┘
```

Hint bar spec:
- Height: `40px`
- Background: `rgba(0,122,255,0.08)`
- Border bottom: `1px solid rgba(0,122,255,0.15)`
- Text: `font-size: 12px`, `color: #007AFF`
- `×` dismiss button: `color: #8E8E93`, `16×16px`, `hover: color: #1C1C1E`
- Dismissed permanently via localStorage flag `multiclaw_hint_dismissed`
- Never shown again after dismiss

**First launch content area:**

```
┌───────────────────────────────────────────────────────┐
│  ℹ  This is your first instance. Press Start...   [×] │
├───────────────────────────────────────────────────────┤
│  My OpenClaw        [●] Stopped         [▶ Start]      │
├───────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│              Instance is stopped.                      │
│              Press Start to run it.                    │
│                                                        │
│                                                        │
└───────────────────────────────────────────────────────┘
```

**Action count to running:** 1 click (Start button)

---

## Interaction Principles

### 1. No modals for non-destructive actions
Start/Stop are immediate. No "Are you sure you want to stop?" for Stop. Only "Delete instance?" asks confirmation (destructive + irreversible).

### 2. Delete confirmation
Triggered from context menu → "Delete…":
```
Delete "Dev"?
This will remove the instance and its configuration.
OpenClaw data (memory, settings) is not affected.

[Cancel]    [Delete]  ← red
```
- shadcn `<AlertDialog>`
- Delete button: `background: #FF3B30`, `color: #FFFFFF`

### 3. Sidebar width
Fixed at `220px`. Not resizable. Simple is right here.

### 4. Keyboard shortcuts

| Action | Shortcut |
|--------|----------|
| New instance | `⌘N` |
| Start instance | `⌘R` |
| Stop instance | `⌘.` |
| Chat view | `⌘T` |
| Switch instances | `⌘1`, `⌘2`... |
| Close window | `⌘W` |

### 5. Transitions
- Sidebar selection: instantaneous (no animation — Finder doesn't animate selection)
- Sheet open/close: `duration: 200ms`, `ease-out`
- Status dot state change: `transition: background 300ms ease`
- Button hover: `transition: opacity 120ms ease`
- Chat message appear: fade in `opacity 0→1`, `150ms ease`

### 6. Window close behavior
Window closes → app stays in menu bar (macOS convention). Running instances continue. Dock icon badge shows count of running instances.

---

## Component Map

| UI Element | shadcn Component | Notes |
|-----------|-----------------|-------|
| Instance list | Custom `<InstanceRow>` | Built on shadcn primitives |
| Add sheet | `<Dialog>` | Sized 360×200px |
| Color picker | Custom swatches | 6 fixed colors only |
| Delete confirm | `<AlertDialog>` | Destructive variant |
| Context menu | `<ContextMenu>` | Right-click on row |
| Instance picker | `<Select>` | Chat toolbar |
| Message input | `<Input>` | Pill border-radius override |
| Status badge | Custom `<StatusBadge>` | With animated dot |
| Action buttons | `<Button>` | Custom variant overrides |
| Terminal pane | `<div>` + xterm.js | No shadcn here |
