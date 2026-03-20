# macOS App Icon — Correct Approach

## Key fact

macOS does **not** auto-mask app icons. That's iOS only. On macOS, the `.icns` file is rendered exactly as-is.

## What the icon file must include

- **1024x1024 canvas**
- **Squircle shape baked in** (Apple continuous-curvature superellipse, ~824x824 centered)
- **Transparent corners** (RGBA with alpha channel — not RGB)
- All sizes in the `.iconset` must also have the squircle + transparency

## What went wrong before

- Chrome `--screenshot` always renders with an opaque white background (no alpha)
- Full-bleed square icon → looks oversized, no rounded corners in dock

## Correct render pipeline

1. SVG has a `<clipPath>` with the squircle shape, transparent outside
2. Render SVG → PNG using **Swift/CoreGraphics** (not Chrome) to preserve alpha
3. Downscale with `sips`, pack with `iconutil --convert icns`

## Script

`apps/desktop/scripts/gen-icons.sh` handles all of this.
