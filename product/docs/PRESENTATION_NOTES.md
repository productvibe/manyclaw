# Presentation — How It Was Built

**File:** `product/docs/presentation.html`  
**Approach:** Single self-contained HTML file. No frameworks, no dependencies, no build step.

---

## Design Principles

- **macOS system aesthetic** — `#007AFF` blue, `#1C1C1E` near-black, `#8E8E93` secondary grey, `#F2F2F7` light background. Same palette as the app itself.
- **-apple-system font stack** — renders as SF Pro on macOS automatically. No web fonts needed.
- **One idea per slide** — no bullet dumps. Each slide makes a single point.
- **Light and minimal** — white backgrounds, generous whitespace, subtle borders (`rgba(0,0,0,0.08)`). Nothing decorative that isn't functional.

---

## Slide Structure (7 slides)

| # | Type | Purpose |
|---|------|---------|
| 1 | Title | Name + one-line tagline |
| 2 | Statement (blue bg) | State the problem boldly |
| 3 | Split (text + mock UI) | Show the solution with a visual |
| 4 | Feature grid (3×2 cards) | What it does |
| 5 | Who grid (2×2 cards) | Who it's for |
| 6 | Status list | What's shipping today |
| 7 | End card (dark bg) | Close strong |

---

## Navigation

- **Arrow keys** (←/→) or spacebar
- **Click** right half of screen to advance, left half to go back
- **Dot nav** at the bottom — click any dot to jump
- **Prev/Next buttons** flank the dots

---

## Mock UI (Slide 3)

Hand-coded SVG + HTML to approximate the actual MultiClaw sidebar and terminal. No screenshots — keeps the file self-contained and renders crisply at any size. Uses the same colors and proportions as the real app.

---

## Reuse / Adapt

To reuse this pattern for another product:
1. Update the 7 slide `<div>` blocks — content only, structure stays
2. Swap `#007AFF` accent color if needed (one CSS variable would be cleaner next time)
3. Replace the mock UI in slide 3 with whatever visual fits
4. The JS is ~30 lines and generic — no changes needed

Total: ~600 lines of HTML/CSS/JS. Opens directly in any browser, no server needed.
