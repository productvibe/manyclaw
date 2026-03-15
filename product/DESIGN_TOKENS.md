# ManyClaw — Design Tokens
**Author:** Dee 🎨  
**Date:** 2026-03-14  
**Status:** v1.0 — Authoritative source of truth for implementation  
**Implementer:** Finley

This file is the design system. Every color, spacing value, typography spec, and component variant is defined here. When in doubt, refer here — not to screenshots, not to "it looked about right."

---

## CSS Custom Properties

Paste this into your `globals.css`:

```css
:root {
  /* ── Surface colors ── */
  --sidebar-bg: #F5F5F5;
  --content-bg: #FFFFFF;
  --toolbar-bg: #F5F5F5;         /* same as sidebar — unified bar */
  --instance-toolbar-bg: #FAFAFA;/* one step off white */
  --input-bg: #FFFFFF;
  --terminal-bg: #1C1C1E;        /* macOS dark base — NOT #000000 */

  /* ── Border ── */
  --border-color: rgba(0, 0, 0, 0.10);
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-focus: rgba(0, 122, 255, 0.50);

  /* ── Text ── */
  --text-primary: #1C1C1E;
  --text-secondary: #8E8E93;
  --text-tertiary: #C7C7CC;      /* placeholders */
  --text-inverted: #FFFFFF;      /* on accent / on dark surfaces */
  --text-terminal: #F5F5F7;      /* on terminal-bg */
  --text-terminal-dim: #48484A;  /* muted terminal text */

  /* ── Accent / semantic ── */
  --accent: #007AFF;
  --accent-hover: #0066D6;       /* darken 8% */
  --accent-subtle: rgba(0, 122, 255, 0.10);
  --accent-subtle-border: rgba(0, 122, 255, 0.20);

  --destructive: #FF3B30;
  --destructive-subtle: rgba(255, 59, 48, 0.10);
  --destructive-subtle-border: rgba(255, 59, 48, 0.25);

  --success: #34C759;
  --success-subtle: rgba(52, 199, 89, 0.12);
  --success-subtle-border: rgba(52, 199, 89, 0.30);

  --warning: #FF9500;
  --warning-subtle: rgba(255, 149, 0, 0.10);
  --warning-subtle-border: rgba(255, 149, 0, 0.25);

  /* ── Selection / hover ── */
  --row-hover-bg: rgba(0, 0, 0, 0.04);
  --row-selected-bg: rgba(0, 122, 255, 0.10);
  --row-selected-bg-focused: rgba(0, 122, 255, 0.12);

  /* ── Typography ── */
  --font: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace;

  --font-size-label: 11px;       /* sidebar section headers, timestamps */
  --font-size-body: 13px;        /* default — everything else */
  --font-size-title: 15px;       /* window title, instance name */
  --font-size-headline: 17px;    /* empty state title */
  --font-size-mono: 13px;        /* terminal */
  --font-size-mono-code: 12px;   /* inline code in chat bubbles */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  --line-height-body: 1.4;
  --line-height-terminal: 1.5;

  --letter-spacing-label: 0.06em; /* uppercase sidebar labels */

  /* ── Spacing ── */
  --sidebar-width: 220px;
  --toolbar-height: 52px;
  --instance-toolbar-height: 44px;
  --item-height: 32px;
  --input-height: 36px;
  --button-height-sm: 28px;
  --button-height-md: 32px;

  --space-2: 2px;
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-14: 14px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;

  /* ── Radius ── */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;         /* pill shapes */

  /* ── Status dot ── */
  --dot-size: 8px;               /* sidebar + toolbar status dot */
  --dot-size-sm: 6px;            /* accent dot on row hover */

  /* ── Shadows ── */
  --shadow-dialog: 0 20px 60px rgba(0, 0, 0, 0.20);
  --shadow-popover: 0 4px 20px rgba(0, 0, 0, 0.12);

  /* ── Transitions ── */
  --transition-instant: 0ms;
  --transition-fast: 120ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 300ms ease;
  --transition-sheet: 200ms ease-out;
}
```

---

## Instance Accent Colors

Six fixed options. No freeform color picker — consistency over personalization.

```css
/* Instance accent color palette */
--instance-blue:   #007AFF;   /* default */
--instance-green:  #34C759;
--instance-orange: #FF9500;
--instance-red:    #FF3B30;
--instance-purple: #AF52DE;
--instance-teal:   #5AC8FA;
```

**Usage:** Instance accent color appears in:
- The colored dot on hover in sidebar rows
- The instance section header color in chat empty state
- Color swatch selection indicator in "New Instance" dialog

Do NOT use instance accent color as the row selection background — that's always `--row-selected-bg` (blue) regardless of instance color.

---

## Component Variants

### Button

Override shadcn's default button. Do not use shadcn's default slate palette.

```typescript
// button.tsx variant definitions
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-opacity",
  {
    variants: {
      variant: {
        // Primary — filled accent
        default: "bg-[#007AFF] text-white hover:opacity-85 active:opacity-70",
        
        // Ghost — transparent, used in toolbars
        ghost: "bg-transparent text-[#1C1C1E] hover:bg-[rgba(0,0,0,0.04)]",
        
        // Destructive — red filled
        destructive: "bg-[#FF3B30] text-white hover:opacity-85",
        
        // Tinted — semantic colored background (start/stop/restart)
        "success-tint": "bg-[rgba(52,199,89,0.12)] text-[#34C759] border border-[rgba(52,199,89,0.30)] hover:opacity-80",
        "destructive-tint": "bg-[rgba(255,59,48,0.10)] text-[#FF3B30] border border-[rgba(255,59,48,0.25)] hover:opacity-80",
        "warning-tint": "bg-[rgba(255,149,0,0.10)] text-[#FF9500] border border-[rgba(255,149,0,0.25)] hover:opacity-80",
      },
      size: {
        sm: "h-[28px] px-3 text-[13px] rounded-[6px]",
        md: "h-[32px] px-4 text-[13px] rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
```

### Input

```css
/* Override shadcn input */
.input-native {
  height: var(--item-height);              /* 32px default */
  border: 1px solid rgba(0, 0, 0, 0.20);
  border-radius: var(--radius-md);         /* 6px */
  padding: 0 10px;
  font-family: var(--font);
  font-size: var(--font-size-body);
  color: var(--text-primary);
  background: var(--input-bg);
  outline: none;
  transition: border-color var(--transition-fast);
}

.input-native:focus {
  border-color: rgba(0, 122, 255, 0.50);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.input-native::placeholder {
  color: var(--text-tertiary);
}

/* Chat input — pill variant */
.input-chat {
  height: var(--input-height);             /* 36px */
  border-radius: var(--radius-full);       /* pill */
  padding: 0 14px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
```

### Status badge

```typescript
// Used in instance toolbar
type Status = "running" | "stopped" | "starting" | "stopping" | "error"

const statusConfig: Record<Status, { dot: string; label: string; animate: boolean }> = {
  running:  { dot: "#34C759", label: "Running",   animate: false },
  stopped:  { dot: "#8E8E93", label: "Stopped",   animate: false },
  starting: { dot: "#FF9500", label: "Starting…", animate: true  },
  stopping: { dot: "#FF9500", label: "Stopping…", animate: true  },
  error:    { dot: "#FF3B30", label: "Error",     animate: false },
}
```

CSS for animated dot:
```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.status-dot-animated {
  animation: pulse-dot 1.2s ease-in-out infinite;
}
```

### Sidebar row

```css
.instance-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--item-height);              /* 32px */
  margin: 0 8px;                           /* inset from sidebar edges */
  padding: 0 8px;                          /* inner padding */
  border-radius: var(--radius-md);         /* 6px */
  cursor: default;
  user-select: none;
  transition: background var(--transition-fast);
}

.instance-row:hover {
  background: var(--row-hover-bg);
}

.instance-row[data-selected="true"] {
  background: var(--row-selected-bg);
}

.instance-row[data-selected="true"] .row-name {
  color: var(--accent);
}

.instance-row .accent-dot {
  width: var(--dot-size-sm);               /* 6px */
  height: var(--dot-size-sm);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-base);
  margin-left: auto;
}

.instance-row:hover .accent-dot,
.instance-row[data-selected="true"] .accent-dot {
  opacity: 1;
}
```

### Chat message bubbles

```css
/* Base bubble */
.chat-bubble {
  max-width: 65%;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  margin-bottom: 8px;
}

/* User message */
.chat-bubble--user {
  background: var(--accent);
  color: var(--text-inverted);
  border-radius: 16px 16px 4px 16px;
  align-self: flex-end;
}

/* Assistant message */
.chat-bubble--assistant {
  background: #F2F2F7;
  color: var(--text-primary);
  border-radius: 16px 16px 16px 4px;
  align-self: flex-start;
  max-width: 75%;
}

/* Code block inside assistant bubble */
.chat-bubble--assistant .code-block {
  background: var(--terminal-bg);
  color: var(--text-terminal);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono-code);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  margin: 4px 0;
  width: 100%;
  overflow-x: auto;
}

/* Timestamp */
.chat-timestamp {
  font-size: var(--font-size-label);
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity var(--transition-base);
}
.chat-bubble:hover .chat-timestamp {
  opacity: 1;
}
```

### Send button

```css
.send-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base);
  flex-shrink: 0;
}

.send-button--active {
  background: var(--accent);
  cursor: pointer;
}

.send-button--inactive {
  background: var(--text-tertiary);
  cursor: default;
}

.send-button svg {
  color: white;
  width: 16px;
  height: 16px;
}
```

### Color swatch picker

```css
.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow var(--transition-base);
}

.color-swatch[data-selected="true"] {
  box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px currentColor;
  /* currentColor = the swatch's own background color */
}

.color-swatch:hover:not([data-selected="true"]) {
  box-shadow: 0 0 0 2px rgba(0,0,0,0.15);
}
```

### Hint bar (first launch only)

```css
.hint-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background: rgba(0, 122, 255, 0.08);
  border-bottom: 1px solid rgba(0, 122, 255, 0.15);
  font-size: 12px;
  color: var(--accent);
  flex-shrink: 0;
}

.hint-bar__dismiss {
  margin-left: auto;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.hint-bar__dismiss:hover {
  color: var(--text-primary);
}
```

---

## Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-label` | 11px | Sidebar section headers, timestamps |
| `--font-size-body` | 13px | All default text, inputs, buttons |
| `--font-size-title` | 15px | Window title, instance name in toolbar |
| `--font-size-headline` | 17px | Empty state title |
| `--font-size-mono` | 13px | Terminal output |
| `--font-size-mono-code` | 12px | Code blocks inside chat |

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | 400 | Body text, secondary labels |
| `--font-weight-medium` | 500 | Buttons, status labels |
| `--font-weight-semibold` | 600 | Titles, section headers |

---

## Spacing Guide

Use the `--space-*` tokens, not Tailwind's arbitrary values, for structural layout.

| Token | px | Used for |
|-------|----|----|
| `--space-4` | 4px | Tight gaps, internal button padding |
| `--space-6` | 6px | Between dot and label in status badges |
| `--space-8` | 8px | Row gaps, swatch gaps, bubble margin |
| `--space-10` | 10px | Input row padding top/bottom |
| `--space-12` | 12px | Sidebar row padding, terminal padding |
| `--space-14` | 14px | Chat input horizontal padding |
| `--space-16` | 16px | Standard section padding |
| `--space-20` | 20px | Empty state spacing |
| `--space-24` | 24px | Dialog internal padding |

---

## Tailwind Config (tokens as Tailwind extensions)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        sidebar: "#F5F5F5",
        content: "#FFFFFF",
        border: "rgba(0,0,0,0.1)",
        accent: "#007AFF",
        destructive: "#FF3B30",
        success: "#34C759",
        warning: "#FF9500",
        "text-primary": "#1C1C1E",
        "text-secondary": "#8E8E93",
        "text-tertiary": "#C7C7CC",
        "terminal-bg": "#1C1C1E",
        "terminal-text": "#F5F5F7",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Menlo", "Courier New", "monospace"],
      },
      fontSize: {
        label: ["11px", { lineHeight: "1.3" }],
        body: ["13px", { lineHeight: "1.4" }],
        title: ["15px", { lineHeight: "1.3" }],
        headline: ["17px", { lineHeight: "1.3" }],
      },
      width: {
        sidebar: "220px",
      },
      height: {
        toolbar: "52px",
        "instance-toolbar": "44px",
        item: "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      boxShadow: {
        dialog: "0 20px 60px rgba(0,0,0,0.20)",
        popover: "0 4px 20px rgba(0,0,0,0.12)",
      },
    },
  },
}
```

---

## Animation

```css
/* Sheet open/close */
@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes dialog-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.96); }
}

.dialog-content[data-state="open"]  { animation: dialog-in  200ms ease-out; }
.dialog-content[data-state="closed"]{ animation: dialog-out 150ms ease-in; }

/* Chat message appear */
@keyframes message-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.chat-bubble--new {
  animation: message-in 150ms ease-out;
}

/* Thinking dots */
@keyframes thinking-dot {
  0%, 80%, 100% { opacity: 0.3; }
  40%           { opacity: 1; }
}

.thinking-dot:nth-child(1) { animation: thinking-dot 1.2s infinite 0ms; }
.thinking-dot:nth-child(2) { animation: thinking-dot 1.2s infinite 150ms; }
.thinking-dot:nth-child(3) { animation: thinking-dot 1.2s infinite 300ms; }
```

---

## Do/Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `--sidebar-bg` for sidebar background | Use Tailwind's `bg-gray-100` — wrong shade |
| Use `border-radius: 6px` for rows | Round rows to 4px or 8px — off-system |
| Show status via dot color only | Add text labels inside the sidebar row |
| Use SF Pro (system font) for all UI | Use Inter or Geist — looks web-app |
| Animate status dot only when transitioning | Animate dots for running state |
| Right-click for destructive actions | Put "Delete" in the main toolbar |
| Inset sidebar row selection (margin: 0 8px) | Let selection color hit sidebar edges |
| Gray placeholder text at `#C7C7CC` | Use `#8E8E93` for placeholders (too visible) |

---

## File Structure Recommendation

```
src/
  components/
    sidebar/
      InstanceRow.tsx
      SidebarHeader.tsx
      AddInstanceDialog.tsx
    instance/
      InstanceToolbar.tsx
      TerminalPane.tsx
      StatusBadge.tsx
    chat/
      ChatView.tsx
      MessageBubble.tsx
      ChatInput.tsx
      InstancePicker.tsx
    shared/
      ColorSwatch.tsx
      HintBar.tsx
    empty/
      EmptyState.tsx
  styles/
    globals.css       ← all CSS custom properties defined here
    animations.css    ← all @keyframes here
```
