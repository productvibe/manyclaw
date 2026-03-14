# Shadcn Sidebar Fix

## What happened

The sidebar was completely broken — it overlapped the main content, ignored its width setting, and sat on top of the macOS traffic lights. Changing the sidebar width constant had no effect.

## Root cause

The shadcn UI components were installed using syntax meant for Tailwind CSS v3, but this project runs Tailwind CSS v4. The two versions handle CSS variable references differently.

In v3, writing `w-[--sidebar-width]` in a class automatically gets treated as `width: var(--sidebar-width)` — valid CSS that reads the variable's value.

In v4, the same syntax outputs `width: --sidebar-width` literally — which the browser ignores entirely because it's not valid CSS. The sidebar effectively had no width set at all.

This affected every shadcn component that referenced a CSS variable: the sidebar width, context menu positioning, tooltip transform origins, and more.

## What was fixed

- Updated all CSS variable references in the shadcn UI components from v3 syntax (`[--variable]`) to valid v4 syntax (`[var(--variable)]`)
- Fixed the `components.json` config so future `npx shadcn add` commands generate correct import paths
- Replaced the hand-rolled context menu (raw divs, manual click-outside handling, custom CSS) with shadcn's built-in ContextMenu component
- Set the sidebar to `collapsible="none"` mode — a simple flex layout appropriate for a desktop Electron app, instead of the stock fixed-position + spacer pattern designed for web
- Added a header spacer so sidebar content clears the macOS traffic light buttons
- Removed ~85 lines of dead CSS (`.instance-row`, `.context-menu` styles) that were left over from the pre-shadcn sidebar

## Takeaway

When adding shadcn components to a Tailwind v4 project, check that arbitrary value classes use `[var(--name)]` not `[--name]`. The shadcn CLI may generate v3-style classes depending on the version used.
