# MultiClaw Website — Product Brief

## What we're building

A marketing website for MultiClaw. Lives at `website/` inside the multiclaw repo. Serves as the public face of the product — where people land, learn, and download.

## Pages

- **/** — Landing page. The main pitch. Hero, what it is, key features, download CTA.
- **/download** — Download page. DMG link, system requirements, install instructions.
- **/docs** — Documentation index. Getting started, guides.
- **/docs/:slug** — Individual doc pages.
- **/blog** — Blog index. Release notes, updates, stories.
- **/blog/:slug** — Individual blog posts.

## Design direction

Inspired by manifest.build. Warm, editorial, not a generic SaaS site. Key traits:
- Warm off-white background — not stark white
- Strong display typography (editorial, heavy headings)
- Subtle texture (film grain)
- Generous whitespace
- Bento-style feature grid
- Sharp button corners — not pill-shaped
- OpenClaw orange (#FF6B35) as the accent, not blue

Feels premium but approachable. Not Electron-app-in-a-browser. A real product with a real identity.

## Content

- Blog and docs are written in Markdown
- Content files live in `website/content/docs/` and `website/content/blog/`
- Frontmatter for title, date, slug, description
- No CMS — everything is files in the repo

## Audience

Whoever finds it. No assumptions. The site should make sense whether you've never heard of OpenClaw or you're already running three profiles in a terminal.

## Tone

Same as the product: direct, honest, no hype. We built it because setup was the blocker. The site says that plainly and gets out of the way.

## What it's not

- Not a web app
- No login, no accounts, no analytics tracking
- No dynamic backend — fully static output
