# ManyClaw Website — Product Brief

## What we're building

A marketing website for ManyClaw. Lives at `website/` inside the multiclaw repo. Serves as the public face of the product — where people land, learn, and download.

## Pages

- **/** — Landing page. The main pitch. Hero, what it is, key features, download CTA.
- **/download** — Download page. DMG link, system requirements, install instructions.
- **/docs** — Redirects to first doc. No index page of its own.
- **/docs/:slug** — Individual doc pages with left sidebar nav.
- **/blog** — Blog index listing all posts.
- **/blog/:slug** — Individual blog posts.

## Tech stack

- React Router v7 (SSR mode, `ssr: true`)
- Tailwind CSS v4 + shadcn/ui components
- Markdown content via gray-matter + marked
- Fonts: Bricolage Grotesque (display/headings), DM Sans (body), Fira Code (mono) — loaded from Google Fonts
- Build: Vite. Deployed via Docker (`Dockerfile` in `website/`).

## Design system

### Colours (do not deviate)

| Token | Value | Use |
|---|---|---|
| `--background` | `#fcfaf5` | Page background — warm off-white, never stark white |
| `--foreground` | `#2c2418` | Body text — warm near-black |
| `--primary` | `#FF6B35` | Brand accent — OpenClaw orange. CTAs, links, highlights |
| `--color-accent-dark` | `#c44b1a` | Primary hover state |
| `--color-accent-glow` | `#ff9466` | Lighter tint, gradients |
| `--muted-foreground` | `#7a6e5e` | Secondary text, captions |
| `--color-border-subtle` | `rgba(44,36,24,0.06)` | Dividers, card borders |

### Typography

- **Headings:** `font-display` = Bricolage Grotesque. Heavy weight (800). No hyphens, no em dashes.
- **Body:** `font-sans` = DM Sans. 400–600 weight range.
- **Code:** `font-mono` = Fira Code.
- Heading sizes: hero `4rem`, section `text-4xl`, subsection `text-xl`. Scale down gracefully on mobile.

### Buttons and controls

- Primary CTA: `bg-primary text-white`, `rounded-sm` (sharp corners — not pill-shaped), hover `bg-[--color-accent-dark]`
- No pill-shaped buttons. Sharp corners are a brand marker.
- Nav download button: smaller (`px-4 py-2 text-sm`). Page CTAs: larger (`px-6 py-3 text-base`).

### Layout

- Content width: `w-[min(90%,1080px)] mx-auto`
- Page sections separated by a hatched SVG `<Separator />` component (see `home.tsx`)
- Film grain overlay on every page (`.grain` CSS class)
- Sections use `reveal` class for scroll-based fade-in

### Bento grid (home page features)

- 6-card grid defined in `.bento-grid` CSS
- Each card: white/10 background, subtle border, `rounded-sm`, SVG illustration on top, heading + description below
- SVG illustrations are inline, animated where appropriate, use the brand dot-grid pattern background

## Content rules

- Blog and docs are Markdown files in `website/content/`
- Frontmatter fields: `title`, `date`, `slug`, `description`, `order` (docs only), `section` (docs only)
- Docs sort by `order` ascending. Blog sorts by `date` descending.
- Doc sections group nav entries under a label (e.g. "Introduction", "Concepts", "Reference")
- File naming convention: `website/content/docs/NN-slug.md` where `NN` matches the `order` value

## Naming and links

- Product name: **ManyClaw** (always — never MultiClaw, ManyClaw, or multiclaw in prose)
- GitHub: `https://github.com/productvibe/manyclaw`
- No Homebrew install command — not part of the product offering
- No affiliate links, no tracking pixels, no analytics

## Tone

Direct, honest, no hype. No "blazing fast", no "powerful", no "seamless". Say the thing plainly.

Good: "ManyClaw runs multiple isolated OpenClaw agents on a single machine."
Bad: "Supercharge your workflow with powerful multi-agent management."

No hyphens. No em dashes. If a sentence needs a dash to hold together, rewrite it.

## What the site is not

- Not a web app — no login, no accounts, no user state
- No Homebrew install — not part of the product
- No dynamic backend — SSR is for rendering Markdown, not API calls
- No analytics or tracking of any kind
- No dark mode toggle (dark mode CSS exists but is not exposed to users)

## Download page

Links to: `https://github.com/productvibe/manyclaw/releases/latest`

The download page should have:
- A clear primary download CTA (link to releases/latest)
- System requirements (macOS 13+, Apple Silicon or Intel)
- A note that the DMG is signed and notarized
- Link back to GitHub for source and release notes

No Homebrew. No other install methods unless explicitly added to this brief.

## File structure

```
website/
  app/
    routes/
      home.tsx         # /
      download.tsx     # /download
      blog/
        index.tsx      # /blog
        slug.tsx       # /blog/:slug
      docs/
        index.tsx      # /docs — redirects to first doc
        slug.tsx       # /docs/:slug
    components/
      Nav.tsx          # sticky top nav with mobile hamburger
      Footer.tsx       # simple footer with GitHub icon link
      Layout.tsx       # wrapper used by blog and download pages
    lib/
      content.ts       # listPosts() and getPost() — reads from content/
    app.css            # all CSS variables, global styles, bento grid, animations
    root.tsx           # HTML shell, fonts, meta fallback
  content/
    blog/              # one .md file per post
    docs/              # one .md file per doc, prefixed NN-
  public/
    images/            # hero.png, feature-*.png, blog/*.png
```
