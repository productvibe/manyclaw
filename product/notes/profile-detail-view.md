# Profile Detail View

## Startup Flow

When a profile is selected, the view shown depends on status:

### Stopped → Empty State
```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│              🖥 (mac mini)               │
│                                          │
│           Profile not started            │
│              [▶ Start]                   │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

### Starting → Inset Boot Log Card
```
┌──────────────────────────────────────────┐
│                                          │
│              🖥 (mac mini)               │
│                                          │
│           Starting profile...            │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ $ openclaw gateway starting...   │   │
│   │ $ listening on :18789            │   │
│   │ $ ██                             │   │
│   └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

Small rounded inset log box (~6-8 lines), just enough to watch the boot.

### Running → Auto-switch to TUI

Once status hits `running`, the boot card dissolves and TUI takes over as a full-screen terminal.

---

## Profile Tab (settings/config view)

Top-level toolbar: `Name ● Status` on the left, `[TUI] [Profile]` tabs + `[▶ Start] [■ Stop] [⟳ Restart]` action buttons on the right.

Profile view has a simple left nav (plain `<nav>`, not shadcn sidebar):

- **Details** — profile info key-value card
- **Console** — full-height log viewer
- **Configure** — full-height configure xterm + restart button (follows openclaw naming)
- **Danger Zone** — delete button, separated by a divider

Console and Configure each get the full content area when selected.

### ASCII Mockup

```
┌──────────────┬──────────────────────────────────────────────────────┐
│  Profiles  + │                                                     │
│              │  Default ● Stopped  [TUI] [Profile]  [▶Start] [⟳]  │
│ ┌──────────┐ │  ──────────────────────────────────────────────────  │
│ │🖥 Default │ │  ┌────────────┬─────────────────────────────────┐  │
│ │  :18789  │ │  │            │                                 │  │
│ └──────────┘ │  │  Details    │  Name        Default            │  │
│              │  │            │  Label       —                  │  │
│ ┌──────────┐ │  │  Console   │  Profile ID  default            │  │
│ │🖥 Team 5  │ │  │            │  Port        :18789             │  │
│ │  :40002  │ │  │  Configure │  Color       ● Blue             │  │
│ └──────────┘ │  │            │  Provider    Anthropic          │  │
│              │  │            │                                 │  │
│ ┌──────────┐ │  │            │                                 │  │
│ │🖥 Team 6  │ │  │            │                                 │  │
│ │  Marketi…│ │  │            │                                 │  │
│ │  :40000  │ │  │            │                                 │  │
│ └──────────┘ │  │            │                                 │  │
│              │  │  ────────  │                                 │  │
│              │  │            │                                 │  │
│              │  │  Danger    │                                 │  │
│              │  │  Zone      │                                 │  │
│              │  │            │                                 │  │
│──────────────│  └────────────┴─────────────────────────────────┘  │
│ ⚙ Settings   │                                                     │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Inner Nav Style

Plain text links with active indicator (bold when active):

```
Details        ← plain text, bold when active
Console
Configure

───────────
Danger Zone    ← red/muted, separated
```

### Toolbar Row

Start/Stop/Restart/Browser buttons remain on the toolbar row as peers of [TUI] and [Profile] tabs. They are not part of the Profile inner view.

```
Default ● Stopped    [TUI] [Profile]  |  [▶ Start] [🌐 Browser] [■ Stop] [⟳]
```
