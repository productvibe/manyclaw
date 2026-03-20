# ManyClaw Demo Video

Records a scripted walkthrough of the ManyClaw website as an MP4.

## What it shows

1. Hero — the main value prop
2. Problem section — why isolation costs $2000
3. Features bento grid — all six feature cards
4. CTA section
5. Blog — navigates to the index and opens the first post

## How to record

Start the website server first, then run the recorder:

```bash
# Terminal 1 — start the site
cd website && npm run start

# Terminal 2 — record
cd website/demos && npx webreel record
```

Output: `website/public/videos/manyclaw-demo.mp4`

## Config

`webreel.config.json` — edit this to adjust timing, add steps, or change what gets recorded.

The config targets `http://localhost:3000`. If your dev server runs on a different port, update the `url` field.

## Re-recording after UI changes

Just run `npx webreel record` again. The config is committed to the repo so it stays in sync with the product.
