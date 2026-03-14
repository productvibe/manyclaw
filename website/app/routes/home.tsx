import { useEffect, useRef } from "react"
import { Link } from "react-router"

/* ─── inline styles (matching manifest.build exactly) ─── */
const css = `
  :root {
    --color-bg: #fcfaf5;
    --color-bg-alt: #f5f3ee;
    --color-bg-card: #ffffff;
    --color-text: #2c2418;
    --color-text-muted: #7a6e5e;
    --color-text-light: #a89b8a;
    --color-accent: #FF6B35;
    --color-accent-dark: #c44b1a;
    --color-accent-glow: #ff9466;
    --color-accent-subtle: rgba(255, 107, 53, 0.08);
    --color-cta-bg: #2c2418;
    --color-cta-text: #fafafa;
    --font-display: "Bricolage Grotesque", serif;
    --font-body: "DM Sans", sans-serif;
    --size-sm: 0.875rem;
    --size-base: 1rem;
    --size-lg: 1.125rem;
    --size-xl: 1.25rem;
    --size-2xl: 1.5rem;
    --size-3xl: 2.25rem;
    --size-4xl: 3rem;
    --size-5xl: 4rem;
    --space-xs: 0.5rem;
    --space-sm: 1rem;
    --space-md: 1.5rem;
    --space-lg: 2rem;
    --space-xl: 3rem;
    --space-2xl: 5rem;
    --space-3xl: 7rem;
    --max-width: 1080px;
    --radius: 14px;
    --radius-lg: 20px;
  }

  /* ── Reset ── */
  .mc-page * { margin: 0; padding: 0; box-sizing: border-box; }
  .mc-page {
    font-family: var(--font-body);
    font-size: var(--size-lg);
    line-height: 1.7;
    color: var(--color-text);
    background: var(--color-bg);
    -webkit-font-smoothing: antialiased;
    background-image:
      linear-gradient(to right, transparent calc(50% - 620px), rgba(44,36,24,0.06) calc(50% - 620px), rgba(44,36,24,0.06) calc(50% - 619px), transparent calc(50% - 619px)),
      linear-gradient(to right, transparent calc(50% + 619px), rgba(44,36,24,0.06) calc(50% + 619px), rgba(44,36,24,0.06) calc(50% + 620px), transparent calc(50% + 620px));
    background-repeat: repeat-y;
    background-size: 100% 1px;
  }
  .mc-page img { max-width: 100%; height: auto; display: block; }
  .mc-page a { color: inherit; text-decoration: none; }
  .mc-page h1 { font-family: var(--font-display); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; }
  .mc-page h2, .mc-page h3, .mc-page h4 { font-family: var(--font-display); font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; }

  /* ── Grain ── */
  .grain {
    position: fixed; inset: 0; z-index: 9999; pointer-events: none; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat; background-size: 256px 256px;
  }

  /* ── Container ── */
  .container { width: min(90%, var(--max-width)); margin-inline: auto; }
  .container--narrow { max-width: 720px; margin-inline: auto; }

  /* ── Nav ── */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(252,250,245,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(44,36,24,0.06);
  }
  .nav__inner {
    display: flex; align-items: center; justify-content: space-between; height: 68px;
  }
  .nav__logo {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display); font-weight: 800; font-size: var(--size-xl);
    color: var(--color-text);
  }
  .nav__logo-icon {
    width: 32px; height: 32px;
    background: var(--color-accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 800; font-size: 18px; font-family: var(--font-display);
  }
  .nav__links {
    display: flex; align-items: center; gap: 20px; margin-left: 32px; position: relative; top: 3px;
  }
  .nav__link {
    font-family: var(--font-body); font-size: var(--size-sm); font-weight: 600;
    color: var(--color-text); transition: color 0.15s;
  }
  .nav__link:hover { color: var(--color-accent); }
  .nav__actions { display: flex; align-items: center; gap: 20px; margin-left: auto; }
  .nav__signin {
    font-family: var(--font-body); font-size: var(--size-sm); font-weight: 500;
    color: var(--color-text-muted); transition: color 0.15s;
  }
  .nav__signin:hover { color: var(--color-text); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-body); font-weight: 500; font-size: var(--size-sm);
    padding: 8px 16px; border-radius: 3px; border: none; cursor: pointer;
    background: var(--color-text); color: #fff; transition: 0.15s; white-space: nowrap;
  }
  .btn:hover { background: #111; }
  .btn--primary { background: var(--color-text); color: #fff; text-decoration: none; }
  .btn--primary:hover { background: #111; }
  .btn--large { padding: 10px 22px; font-size: var(--size-base); }

  /* ── Hero ── */
  .hero {
    padding: var(--space-3xl) 0 var(--space-2xl); text-align: center; position: relative;
  }
  .hero::before {
    content: ""; position: absolute; top: -200px; left: 50%; transform: translate(-50%);
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,150,102,0.08) 30%, transparent 70%);
    pointer-events: none; z-index: 0; filter: blur(40px);
  }
  .hero__inner {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
    position: relative; z-index: 1;
  }
  .hero__logo {
    width: 160px; height: 160px; display: flex; align-items: center; justify-content: center;
    margin-bottom: var(--space-xs);
    filter: drop-shadow(0 8px 24px rgba(255,107,53,0.15));
    animation: float 6s ease-in-out infinite;
  }
  .hero__logo-inner {
    width: 120px; height: 120px;
    background: var(--color-accent);
    border-radius: 28px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 800; font-size: 48px; color: white;
    box-shadow: 0 16px 48px rgba(255,107,53,0.3);
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .hero__title { font-size: var(--size-5xl); max-width: 700px; color: var(--color-text); }
  .hero__subtitle {
    font-size: var(--size-xl); color: var(--color-text-muted); max-width: 560px;
    line-height: 1.6; font-weight: 400;
  }
  .hero__actions {
    margin-top: var(--space-sm); display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .hero__terminal {
    display: inline-flex; align-items: center;
    background: var(--color-text); border: 1px solid #1a1408;
    border-radius: 3px; max-width: 100%;
  }
  .hero__terminal-code {
    margin: 0; padding: 16px 0 16px 20px;
    font-family: "Fira Code", monospace; font-size: var(--size-sm);
    line-height: 1; color: #fff; white-space: pre; overflow-x: auto; text-align: left;
  }
  .hero__terminal-copy {
    padding: 0; margin: 0 18px 0 16px; display: flex; align-items: center;
    background: none; border: none; color: rgba(255,255,255,0.5);
    font-family: var(--font-body); font-size: var(--size-sm); font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: color 0.15s;
  }
  .hero__terminal-copy:hover { color: #fff; }

  /* ── Hero screenshot ── */
  .hero__screenshot-wrap {
    width: min(95%, 1300px); margin-inline: auto; margin-top: var(--space-xl);
    position: relative; z-index: 1; perspective: 1800px;
  }
  .hero__shadow {
    position: absolute; border-radius: 16px; pointer-events: none; z-index: 0;
  }
  .hero__shadow--1 { width: 70%; height: 10px; bottom: 47%; left: 15%; box-shadow: 0 40px 80px rgba(255,107,53,0.18), 0 20px 40px rgba(255,107,53,0.12); }
  .hero__shadow--2 { width: 50%; height: 10px; bottom: 50%; left: 25%; box-shadow: 0 60px 100px rgba(255,107,53,0.15); }
  .hero__shadow--3 { width: 60%; height: 10px; bottom: 15%; left: 20%; box-shadow: 0 62px 90px rgba(200,80,30,0.55); }
  .hero__shadow--4 { width: 10px; height: 40%; top: 30%; left: 30px; box-shadow: -25px 0 50px rgba(255,107,53,0.15); }
  .hero__shadow--5 { width: 10px; height: 40%; top: 30%; right: 30px; box-shadow: 25px 0 50px rgba(255,107,53,0.15); }
  .hero__screenshot {
    z-index: 1; transform-origin: center center;
    background: rgba(255,255,255,0.55); backdrop-filter: blur(16px);
    border: 1px solid rgba(0,0,0,0.06); border-radius: var(--radius-lg);
    padding: 8px; position: relative; overflow: hidden;
  }
  .hero__screenshot img {
    width: 100%; border-radius: calc(var(--radius-lg) - 6px);
    border: 1px solid rgba(0,0,0,0.06);
  }

  /* ── Separator ── */
  .separator {
    width: calc(50% + 621px); max-width: 1240px; margin-inline: auto; line-height: 0;
  }
  .separator svg { width: 100%; height: 20px; display: block; }

  /* ── Section ── */
  .section { padding: var(--space-3xl) 0; }
  .section--alt { background: var(--color-bg-alt); }
  .section__title {
    font-size: var(--size-3xl); max-width: 650px; margin-bottom: var(--space-md);
    text-align: center; margin-inline: auto;
  }
  .section__body {
    font-size: var(--size-lg); color: var(--color-text-muted); line-height: 1.8;
    text-align: center; margin-inline: auto; max-width: 650px;
  }
  .section__body strong { color: var(--color-text); font-weight: 600; }

  /* ── Bento grid ── */
  .bento {
    display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto;
    gap: 12px; margin-top: var(--space-xl);
  }
  .bento__card {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(44,36,24,0.06);
    border-radius: 3px; overflow: hidden;
    display: grid; grid-template-rows: subgrid; grid-row: span 3;
  }
  .bento__card:nth-child(1) { grid-column: span 4; }
  .bento__card:nth-child(2) { grid-column: span 4; }
  .bento__card:nth-child(3) { grid-column: span 4; }
  .bento__card:nth-child(4) { grid-column: span 3; }
  .bento__card:nth-child(5) { grid-column: span 3; }
  .bento__card:nth-child(6) { grid-column: span 6; }
  .bento__visual { width: 100%; overflow: hidden; }
  .bento__visual svg { width: 100%; height: auto; display: block; }
  .bento__card:nth-child(n+4) .bento__visual { height: 180px; display: flex; align-items: center; }
  .bento__card:nth-child(n+4) .bento__visual svg { max-height: 100%; }
  .bento__card:nth-child(6) .bento__visual svg { max-height: none; width: 100%; }
  .bento__title {
    font-size: var(--size-xl); font-weight: 400; color: var(--color-text);
    font-family: var(--font-display); padding: var(--space-md) var(--space-lg) var(--space-xs);
  }
  .bento__text {
    font-size: var(--size-base); color: var(--color-text-muted);
    line-height: 1.7; padding: 0 var(--space-lg) var(--space-lg);
  }

  /* ── Trust grid ── */
  .trust__grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl); margin-top: var(--space-xl);
  }
  .trust__item { text-align: center; }
  .trust__icon {
    position: relative; display: flex; align-items: center; justify-content: center;
    width: 72px; height: 72px; margin: 0 auto var(--space-md);
  }
  .trust__icon::before, .trust__icon::after {
    content: "+"; position: absolute; font-family: var(--font-body);
    font-size: 1rem; font-weight: 200; line-height: 1; color: var(--color-text-light);
  }
  .trust__icon::before { top: 0; left: 0; text-shadow: 0 56px 0 currentColor; }
  .trust__icon::after { top: 0; right: 0; text-shadow: 0 56px 0 currentColor; }
  .trust__icon-inner {
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    font-size: 2rem; color: var(--color-accent);
  }
  .trust__title { font-size: var(--size-xl); font-weight: 600; margin-bottom: var(--space-xs); }
  .trust__text {
    font-size: var(--size-base); color: var(--color-text-muted);
    line-height: 1.7; max-width: 320px; margin-inline: auto;
  }

  /* ── CTA ── */
  .cta {
    padding: var(--space-3xl) 0; background: transparent; color: var(--color-text);
    text-align: center; position: relative; overflow: hidden;
  }
  .cta::before {
    content: ""; position: absolute; top: 20px; left: 50%; transform: translate(-50%);
    width: 400px; height: 200px;
    background: radial-gradient(rgba(255,150,102,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta::after {
    content: ""; position: absolute; bottom: -60px; left: 50%; transform: translate(-50%);
    width: 500px; height: 250px;
    background: radial-gradient(rgba(255,255,255,0.5) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta__inner {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
    position: relative; z-index: 1;
  }
  .cta__logo {
    width: 72px; height: 72px;
    background: var(--color-accent); border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-family: var(--font-display); font-weight: 800; font-size: 32px;
    margin-bottom: var(--space-xs);
    box-shadow: 0 8px 24px rgba(255,107,53,0.2);
  }
  .cta__title {
    font-size: var(--size-4xl); line-height: 1.15;
    margin-top: calc(-1 * var(--space-sm)); letter-spacing: -0.02em;
  }
  .cta__subtitle { font-size: var(--size-lg); color: var(--color-text-muted); max-width: 440px; }

  /* ── Footer ── */
  .footer {
    padding: var(--space-lg) 0; border-top: 1px solid rgba(44,36,24,0.06);
    background: var(--color-bg);
  }
  .footer__inner { display: flex; align-items: center; justify-content: space-between; }
  .footer__left { display: flex; align-items: center; gap: 8px; }
  .footer__brand {
    font-family: var(--font-display); font-weight: 800; font-size: var(--size-xl);
    color: var(--color-text);
  }
  .footer__copy { font-size: var(--size-sm); color: var(--color-text-muted); }
  .footer__socials { display: flex; align-items: center; gap: 16px; }
  .footer__socials a {
    color: var(--color-text-muted); font-size: 1.4rem; display: flex;
    align-items: center; transition: color 0.15s;
  }
  .footer__socials a:hover { color: var(--color-text); }

  /* ── Reveal animation ── */
  .reveal {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.is-visible { opacity: 1; transform: translateY(0); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .hero__title { font-size: var(--size-4xl); }
    .bento { grid-template-columns: repeat(2, 1fr); }
    .bento__card:nth-child(1), .bento__card:nth-child(2), .bento__card:nth-child(3),
    .bento__card:nth-child(4), .bento__card:nth-child(5), .bento__card:nth-child(6) { grid-column: span 1; }
    .bento__card:nth-child(3) { grid-column: span 2; }
  }
  @media (max-width: 768px) {
    :root { --space-3xl: 4rem; --space-2xl: 3rem; }
    .hero__logo { width: 120px; height: 120px; }
    .hero__logo-inner { width: 90px; height: 90px; font-size: 36px; border-radius: 22px; }
    .hero__title { font-size: var(--size-3xl); }
    .hero__subtitle { font-size: var(--size-base); }
    .hero__terminal-code { font-size: var(--size-sm); padding: 10px 0 10px 14px; }
    .section__title { font-size: var(--size-2xl); }
    .section__body { font-size: var(--size-base); }
    .bento { grid-template-columns: 1fr; }
    .bento__card:nth-child(1), .bento__card:nth-child(2), .bento__card:nth-child(3),
    .bento__card:nth-child(4), .bento__card:nth-child(5), .bento__card:nth-child(6) { grid-column: span 1; }
    .trust__grid { grid-template-columns: 1fr; gap: var(--space-xl); }
    .cta__title { font-size: var(--size-3xl); }
    .nav__links { display: none; }
    .nav__logo span { display: none; }
    .footer__inner { flex-direction: column; gap: var(--space-sm); text-align: center; }
    .footer__left { flex-direction: column; }
  }
`

/* ── Separator SVG (hatched lines) ── */
function Separator() {
  const lines = []
  for (let x = 10; x <= 1226; x += 16) {
    lines.push(
      <line key={x} x1={x} y1="20" x2={x + 12} y2="0" />
    )
  }
  return (
    <div className="separator" aria-hidden="true">
      <svg preserveAspectRatio="none" viewBox="0 0 1240 20" fill="none">
        <line x1="0" y1="0" x2="1240" y2="0" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
        <line x1="0" y1="19" x2="1240" y2="19" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
        <g stroke="rgba(44,36,24,0.06)" strokeWidth="1">
          {lines}
        </g>
      </svg>
    </div>
  )
}

/* ── Bento card visuals ── */
function SidebarVisual() {
  return (
    <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="160" fill="url(#dotGrid)" />
      {/* Sidebar panel */}
      <rect x="30" y="16" width="80" height="128" rx="6" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      {/* Sidebar items with color dots */}
      <circle cx="50" cy="40" r="5" fill="#FF6B35" />
      <rect x="62" y="36" width="36" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="60" r="5" fill="#4CAF50" />
      <rect x="62" y="56" width="30" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="80" r="5" fill="#2196F3" />
      <rect x="62" y="76" width="34" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="100" r="5" fill="#9C27B0" />
      <rect x="62" y="96" width="28" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      {/* Active indicator */}
      <rect x="32" y="32" width="3" height="16" rx="1.5" fill="#FF6B35" />
      {/* Main content area */}
      <rect x="124" y="16" width="246" height="128" rx="6" fill="rgba(255,255,255,0.5)" stroke="rgba(44,36,24,0.06)" strokeWidth="1" />
      {/* Terminal lines in main */}
      <rect x="140" y="32" width="100" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="46" width="160" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="60" width="80" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="74" width="200" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="88" width="140" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="102" width="120" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      {/* Cursor blink */}
      <rect x="140" y="116" width="8" height="12" rx="1" fill="#FF6B35" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

function IsolationVisual() {
  return (
    <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid2" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="160" fill="url(#dotGrid2)" />
      {/* Three isolated containers */}
      <rect x="30" y="24" width="100" height="112" rx="8" fill="rgba(255,107,53,0.06)" stroke="rgba(255,107,53,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="150" y="24" width="100" height="112" rx="8" fill="rgba(76,175,80,0.06)" stroke="rgba(76,175,80,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="270" y="24" width="100" height="112" rx="8" fill="rgba(33,150,243,0.06)" stroke="rgba(33,150,243,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      {/* Labels */}
      <text x="80" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#FF6B35" fontWeight="600" textAnchor="middle">Agent 1</text>
      <text x="200" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#4CAF50" fontWeight="600" textAnchor="middle">Agent 2</text>
      <text x="320" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#2196F3" fontWeight="600" textAnchor="middle">Agent 3</text>
      {/* Lock icons (simple) */}
      <rect x="72" y="68" width="16" height="12" rx="3" fill="none" stroke="#FF6B35" strokeWidth="1.5" />
      <rect x="70" y="76" width="20" height="16" rx="2" fill="#FF6B35" opacity="0.2" />
      <rect x="192" y="68" width="16" height="12" rx="3" fill="none" stroke="#4CAF50" strokeWidth="1.5" />
      <rect x="190" y="76" width="20" height="16" rx="2" fill="#4CAF50" opacity="0.2" />
      <rect x="312" y="68" width="16" height="12" rx="3" fill="none" stroke="#2196F3" strokeWidth="1.5" />
      <rect x="310" y="76" width="20" height="16" rx="2" fill="#2196F3" opacity="0.2" />
      {/* Config files */}
      <rect x="55" y="104" width="50" height="6" rx="3" fill="rgba(255,107,53,0.15)" />
      <rect x="175" y="104" width="50" height="6" rx="3" fill="rgba(76,175,80,0.15)" />
      <rect x="295" y="104" width="50" height="6" rx="3" fill="rgba(33,150,243,0.15)" />
      <rect x="55" y="116" width="40" height="6" rx="3" fill="rgba(255,107,53,0.1)" />
      <rect x="175" y="116" width="40" height="6" rx="3" fill="rgba(76,175,80,0.1)" />
      <rect x="295" y="116" width="40" height="6" rx="3" fill="rgba(33,150,243,0.1)" />
    </svg>
  )
}

function TerminalToggleVisual() {
  return (
    <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid3" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="160" fill="url(#dotGrid3)" />
      {/* Two panels side by side: Terminal + TUI */}
      <rect x="24" y="20" width="170" height="120" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <rect x="206" y="20" width="170" height="120" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      {/* Terminal label */}
      <text x="109" y="38" fontFamily="Fira Code, monospace" fontSize="9" fill="#FF6B35" fontWeight="500" textAnchor="middle">Terminal</text>
      <text x="291" y="38" fontFamily="Fira Code, monospace" fontSize="9" fill="#FF6B35" fontWeight="500" textAnchor="middle">TUI</text>
      {/* Terminal content */}
      <rect x="36" y="48" width="60" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="58" width="100" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="68" width="45" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="78" width="130" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="88" width="80" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      {/* TUI content - boxes */}
      <rect x="218" y="48" width="146" height="24" rx="4" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.15)" strokeWidth="0.5" />
      <rect x="218" y="78" width="146" height="24" rx="4" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="0.5" />
      <rect x="218" y="108" width="146" height="24" rx="4" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="0.5" />
      {/* Toggle arrow */}
      <path d="M192 80 L200 80" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M196 76 L200 80 L196 84" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function ChatVisual() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid4" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="200" height="180" fill="url(#dotGrid4)" />
      {/* Chat bubbles */}
      <rect x="20" y="20" width="100" height="28" rx="12" fill="rgba(44,36,24,0.06)" />
      <rect x="32" y="30" width="60" height="8" rx="4" fill="rgba(44,36,24,0.08)" />
      <rect x="80" y="60" width="100" height="36" rx="12" fill="rgba(255,107,53,0.1)" />
      <rect x="92" y="70" width="70" height="6" rx="3" fill="rgba(255,107,53,0.2)" />
      <rect x="92" y="80" width="50" height="6" rx="3" fill="rgba(255,107,53,0.15)" />
      <rect x="20" y="108" width="80" height="28" rx="12" fill="rgba(44,36,24,0.06)" />
      <rect x="32" y="118" width="50" height="8" rx="4" fill="rgba(44,36,24,0.08)" />
      {/* Input bar */}
      <rect x="20" y="148" width="160" height="24" rx="12" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <rect x="32" y="157" width="60" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
    </svg>
  )
}

function BrowserVisual() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid5" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="200" height="180" fill="url(#dotGrid5)" />
      {/* Browser window */}
      <rect x="20" y="20" width="160" height="140" rx="8" fill="rgba(255,255,255,0.6)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      {/* Browser toolbar */}
      <rect x="20" y="20" width="160" height="24" rx="8" fill="rgba(44,36,24,0.04)" />
      <circle cx="34" cy="32" r="4" fill="#ff5f57" opacity="0.6" />
      <circle cx="46" cy="32" r="4" fill="#ffbd2e" opacity="0.6" />
      <circle cx="58" cy="32" r="4" fill="#28ca42" opacity="0.6" />
      {/* URL bar */}
      <rect x="70" y="27" width="100" height="10" rx="5" fill="rgba(44,36,24,0.06)" />
      {/* Content */}
      <rect x="32" y="56" width="80" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <rect x="32" y="72" width="136" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
      <rect x="32" y="84" width="120" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
      <rect x="32" y="96" width="100" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
      {/* Open in browser arrow */}
      <rect x="32" y="116" width="56" height="20" rx="4" fill="rgba(255,107,53,0.1)" stroke="rgba(255,107,53,0.2)" strokeWidth="0.5" />
      <text x="60" y="130" fontFamily="DM Sans, sans-serif" fontSize="8" fill="#FF6B35" fontWeight="500" textAnchor="middle">Open</text>
    </svg>
  )
}

function DragReorderVisual() {
  return (
    <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid6" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.7" fill="#2c2418" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="160" fill="url(#dotGrid6)" />
      {/* Sidebar items with drag handles */}
      <g>
        {/* Item 1 - being dragged */}
        <rect x="100" y="18" width="200" height="32" rx="6" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.2)" strokeWidth="1">
          <animate attributeName="y" values="18;58;18" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        </rect>
        {/* Drag dots */}
        <g opacity="0.4">
          <circle cx="114" cy="30" r="1.5" fill="#2c2418"><animate attributeName="cy" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="114" cy="38" r="1.5" fill="#2c2418"><animate attributeName="cy" values="38;78;38" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="120" cy="30" r="1.5" fill="#2c2418"><animate attributeName="cy" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="120" cy="38" r="1.5" fill="#2c2418"><animate attributeName="cy" values="38;78;38" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
        </g>
        <circle cx="140" cy="34" r="5" fill="#FF6B35"><animate attributeName="cy" values="34;74;34" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
        <rect x="152" y="30" width="60" height="8" rx="3" fill="rgba(255,107,53,0.15)"><animate attributeName="y" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></rect>
      </g>
      {/* Item 2 */}
      <rect x="100" y="58" width="200" height="32" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.06)" strokeWidth="1">
        <animate attributeName="y" values="58;18;58" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      <circle cx="140" cy="74" r="5" fill="#4CAF50"><animate attributeName="cy" values="74;34;74" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
      <rect x="152" y="70" width="50" height="8" rx="3" fill="rgba(44,36,24,0.08)"><animate attributeName="y" values="70;30;70" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></rect>
      {/* Item 3 */}
      <rect x="100" y="98" width="200" height="32" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.06)" strokeWidth="1" />
      <circle cx="140" cy="114" r="5" fill="#2196F3" />
      <rect x="152" y="110" width="55" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
    </svg>
  )
}

export default function Home() {
  const screenshotRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  /* ── 3D tilt on hero screenshot (scroll-based like manifest.build) ── */
  useEffect(() => {
    const el = screenshotRef.current
    const wrap = wrapRef.current
    if (!el || !wrap) return
    const maxTilt = 4
    let raf: number
    function update() {
      const rect = wrap!.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const viewCenter = window.innerHeight / 2
      const ratio = Math.max(-1, Math.min(1, (center - viewCenter) / (window.innerHeight * 0.6)))
      el!.style.transform = `rotateX(${ratio * maxTilt}deg)`
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ── Reveal on scroll ── */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal")
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible")
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* ── Copy to clipboard ── */
  function copyInstall() {
    navigator.clipboard.writeText("brew install --cask multiclaw")
  }

  return (
    <div className="mc-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Grain */}
      <div className="grain" aria-hidden="true" />

      {/* ── Nav ── */}
      <header className="nav" role="banner">
        <nav className="nav__inner container" aria-label="Main navigation">
          <a href="/" className="nav__logo" aria-label="MultiClaw home">
            <div className="nav__logo-icon">M</div>
            <span>MultiClaw</span>
          </a>
          <div className="nav__links">
            <Link to="/docs" className="nav__link">Docs</Link>
            <Link to="/blog" className="nav__link">Blog</Link>
          </div>
          <div className="nav__actions">
            <a href="https://github.com/nichochar/multiclaw" className="nav__link" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/download" className="btn btn--primary">Download</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__inner">
            <div className="hero__logo">
              <div className="hero__logo-inner">M</div>
            </div>
            <h1 id="hero-title" className="hero__title">
              Tame your AI agents, once&nbsp;and&nbsp;for&nbsp;all
            </h1>
            <p className="hero__subtitle">
              Run multiple OpenClaw instances side by side with full isolation.
              No more terminal chaos.
            </p>
            <div className="hero__actions" id="download">
              <div className="hero__terminal">
                <pre className="hero__terminal-code"><code>brew install --cask multiclaw</code></pre>
                <button className="hero__terminal-copy" onClick={copyInstall} type="button">
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="hero__screenshot-wrap" ref={wrapRef}>
            <div className="hero__shadow hero__shadow--1" aria-hidden="true" />
            <div className="hero__shadow hero__shadow--2" aria-hidden="true" />
            <div className="hero__shadow hero__shadow--3" aria-hidden="true" />
            <div className="hero__shadow hero__shadow--4" aria-hidden="true" />
            <div className="hero__shadow hero__shadow--5" aria-hidden="true" />
            <div className="hero__screenshot" ref={screenshotRef} style={{ transform: "rotateX(4deg)" }}>
              <img
                src="https://manifest.build/images/screenshot.svg"
                alt="MultiClaw app — multi-instance management"
                width={1280}
                height={699}
                loading="eager"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Problem ── */}
        <section className="section reveal" aria-labelledby="problem-title">
          <div className="container container--narrow">
            <h2 id="problem-title" className="section__title">
              Managing multiple AI agents is pure&nbsp;chaos
            </h2>
            <p className="section__body">
              Profile flags, port conflicts, context bleed between sessions.
              Running more than one OpenClaw agent means <strong>terminal tab hell</strong> and
              constant context-switching. You deserve better.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── Features Bento ── */}
        <section className="section reveal" id="features" aria-labelledby="solution-title">
          <div className="container">
            <h2 id="solution-title" className="section__title" style={{ marginBottom: "var(--space-xs)" }}>
              Everything you need to run agents at scale
            </h2>
            <div className="bento" id="how-it-works">
              {/* 1. Multi-instance sidebar */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <SidebarVisual />
                </div>
                <h3 className="bento__title">Multi-instance management</h3>
                <p className="bento__text">
                  Clean macOS sidebar with named, color-coded instances.
                  One-click start, stop, and restart.
                </p>
              </div>
              {/* 2. Full isolation */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <IsolationVisual />
                </div>
                <h3 className="bento__title">Full isolation</h3>
                <p className="bento__text">
                  Each agent runs in its own sandbox. No shared state,
                  no port conflicts, no context bleed between sessions.
                </p>
              </div>
              {/* 3. Terminal + TUI toggle */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <TerminalToggleVisual />
                </div>
                <h3 className="bento__title">Live terminal + TUI toggle</h3>
                <p className="bento__text">
                  Switch between raw terminal output and the rich TUI view
                  with a single click. See exactly what your agent sees.
                </p>
              </div>
              {/* 4. In-app chat */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <ChatVisual />
                </div>
                <h3 className="bento__title">In-app chat</h3>
                <p className="bento__text">
                  Chat with any running agent directly from the sidebar.
                  No terminal needed.
                </p>
              </div>
              {/* 5. Open in browser */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <BrowserVisual />
                </div>
                <h3 className="bento__title">Open in browser</h3>
                <p className="bento__text">
                  Preview any agent&apos;s web output in your default browser
                  with one click.
                </p>
              </div>
              {/* 6. Drag to reorder */}
              <div className="bento__card">
                <div className="bento__visual" aria-hidden="true">
                  <DragReorderVisual />
                </div>
                <h3 className="bento__title">Drag to reorder</h3>
                <p className="bento__text">
                  Organize your sidebar the way you think. Drag instances up or down
                  to match your workflow priority.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust / Deep-dive ── */}
        <section className="section trust reveal" aria-labelledby="trust-title">
          <div className="container">
            <h2 id="trust-title" className="section__title">
              Built for power users
            </h2>
            <div className="trust__grid">
              <div className="trust__item">
                <div className="trust__icon" aria-hidden="true">
                  <div className="trust__icon-inner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                </div>
                <h3 className="trust__title">Native macOS</h3>
                <p className="trust__text">
                  Built as a native macOS app. Lightweight, fast, and feels right
                  at home on your dock.
                </p>
              </div>
              <div className="trust__item">
                <div className="trust__icon" aria-hidden="true">
                  <div className="trust__icon-inner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
                <h3 className="trust__title">Open Source</h3>
                <p className="trust__text">
                  MultiClaw is fully open source. Inspect, extend, or contribute.
                  No black boxes, no telemetry.
                </p>
              </div>
              <div className="trust__item">
                <div className="trust__icon" aria-hidden="true">
                  <div className="trust__icon-inner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                </div>
                <h3 className="trust__title">OpenClaw native</h3>
                <p className="trust__text">
                  Deep integration with OpenClaw. One command to install,
                  zero configuration required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta reveal" aria-labelledby="cta-title">
          <div className="container cta__inner">
            <div className="cta__logo">M</div>
            <h2 id="cta-title" className="cta__title">
              Stop juggling terminals
            </h2>
            <p className="cta__subtitle">
              One app. All your agents. Easy to install, impossible to outgrow.
            </p>
            <a href="#download" className="btn btn--primary btn--large">Download MultiClaw</a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer" role="contentinfo">
        <div className="container footer__inner">
          <div className="footer__left">
            <span className="footer__brand">MultiClaw</span>
            <span className="footer__copy">&copy; 2026 MultiClaw. All rights reserved.</span>
          </div>
          <div className="footer__socials">
            <a href="https://github.com/nichochar/multiclaw" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
