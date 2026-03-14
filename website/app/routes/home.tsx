import { useEffect, useRef } from "react"
import { Link } from "react-router"

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
      <rect x="30" y="16" width="80" height="128" rx="6" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <circle cx="50" cy="40" r="5" fill="#FF6B35" />
      <rect x="62" y="36" width="36" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="60" r="5" fill="#4CAF50" />
      <rect x="62" y="56" width="30" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="80" r="5" fill="#2196F3" />
      <rect x="62" y="76" width="34" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <circle cx="50" cy="100" r="5" fill="#9C27B0" />
      <rect x="62" y="96" width="28" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <rect x="32" y="32" width="3" height="16" rx="1.5" fill="#FF6B35" />
      <rect x="124" y="16" width="246" height="128" rx="6" fill="rgba(255,255,255,0.5)" stroke="rgba(44,36,24,0.06)" strokeWidth="1" />
      <rect x="140" y="32" width="100" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="46" width="160" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="60" width="80" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="74" width="200" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="88" width="140" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
      <rect x="140" y="102" width="120" height="6" rx="3" fill="rgba(44,36,24,0.06)" />
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
      <rect x="30" y="24" width="100" height="112" rx="8" fill="rgba(255,107,53,0.06)" stroke="rgba(255,107,53,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="150" y="24" width="100" height="112" rx="8" fill="rgba(76,175,80,0.06)" stroke="rgba(76,175,80,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="270" y="24" width="100" height="112" rx="8" fill="rgba(33,150,243,0.06)" stroke="rgba(33,150,243,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <text x="80" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#FF6B35" fontWeight="600" textAnchor="middle">Agent 1</text>
      <text x="200" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#4CAF50" fontWeight="600" textAnchor="middle">Agent 2</text>
      <text x="320" y="50" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#2196F3" fontWeight="600" textAnchor="middle">Agent 3</text>
      <rect x="72" y="68" width="16" height="12" rx="3" fill="none" stroke="#FF6B35" strokeWidth="1.5" />
      <rect x="70" y="76" width="20" height="16" rx="2" fill="#FF6B35" opacity="0.2" />
      <rect x="192" y="68" width="16" height="12" rx="3" fill="none" stroke="#4CAF50" strokeWidth="1.5" />
      <rect x="190" y="76" width="20" height="16" rx="2" fill="#4CAF50" opacity="0.2" />
      <rect x="312" y="68" width="16" height="12" rx="3" fill="none" stroke="#2196F3" strokeWidth="1.5" />
      <rect x="310" y="76" width="20" height="16" rx="2" fill="#2196F3" opacity="0.2" />
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
      <rect x="24" y="20" width="170" height="120" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <rect x="206" y="20" width="170" height="120" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <text x="109" y="38" fontFamily="Fira Code, monospace" fontSize="9" fill="#FF6B35" fontWeight="500" textAnchor="middle">Terminal</text>
      <text x="291" y="38" fontFamily="Fira Code, monospace" fontSize="9" fill="#FF6B35" fontWeight="500" textAnchor="middle">TUI</text>
      <rect x="36" y="48" width="60" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="58" width="100" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="68" width="45" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="78" width="130" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="36" y="88" width="80" height="5" rx="2" fill="rgba(44,36,24,0.06)" />
      <rect x="218" y="48" width="146" height="24" rx="4" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.15)" strokeWidth="0.5" />
      <rect x="218" y="78" width="146" height="24" rx="4" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="0.5" />
      <rect x="218" y="108" width="146" height="24" rx="4" fill="rgba(44,36,24,0.04)" stroke="rgba(44,36,24,0.08)" strokeWidth="0.5" />
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
      <rect x="20" y="20" width="100" height="28" rx="12" fill="rgba(44,36,24,0.06)" />
      <rect x="32" y="30" width="60" height="8" rx="4" fill="rgba(44,36,24,0.08)" />
      <rect x="80" y="60" width="100" height="36" rx="12" fill="rgba(255,107,53,0.1)" />
      <rect x="92" y="70" width="70" height="6" rx="3" fill="rgba(255,107,53,0.2)" />
      <rect x="92" y="80" width="50" height="6" rx="3" fill="rgba(255,107,53,0.15)" />
      <rect x="20" y="108" width="80" height="28" rx="12" fill="rgba(44,36,24,0.06)" />
      <rect x="32" y="118" width="50" height="8" rx="4" fill="rgba(44,36,24,0.08)" />
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
      <rect x="20" y="20" width="160" height="140" rx="8" fill="rgba(255,255,255,0.6)" stroke="rgba(44,36,24,0.08)" strokeWidth="1" />
      <rect x="20" y="20" width="160" height="24" rx="8" fill="rgba(44,36,24,0.04)" />
      <circle cx="34" cy="32" r="4" fill="#ff5f57" opacity="0.6" />
      <circle cx="46" cy="32" r="4" fill="#ffbd2e" opacity="0.6" />
      <circle cx="58" cy="32" r="4" fill="#28ca42" opacity="0.6" />
      <rect x="70" y="27" width="100" height="10" rx="5" fill="rgba(44,36,24,0.06)" />
      <rect x="32" y="56" width="80" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
      <rect x="32" y="72" width="136" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
      <rect x="32" y="84" width="120" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
      <rect x="32" y="96" width="100" height="6" rx="3" fill="rgba(44,36,24,0.04)" />
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
      <g>
        <rect x="100" y="18" width="200" height="32" rx="6" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.2)" strokeWidth="1">
          <animate attributeName="y" values="18;58;18" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
        </rect>
        <g opacity="0.4">
          <circle cx="114" cy="30" r="1.5" fill="#2c2418"><animate attributeName="cy" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="114" cy="38" r="1.5" fill="#2c2418"><animate attributeName="cy" values="38;78;38" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="120" cy="30" r="1.5" fill="#2c2418"><animate attributeName="cy" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
          <circle cx="120" cy="38" r="1.5" fill="#2c2418"><animate attributeName="cy" values="38;78;38" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
        </g>
        <circle cx="140" cy="34" r="5" fill="#FF6B35"><animate attributeName="cy" values="34;74;34" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
        <rect x="152" y="30" width="60" height="8" rx="3" fill="rgba(255,107,53,0.15)"><animate attributeName="y" values="30;70;30" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></rect>
      </g>
      <rect x="100" y="58" width="200" height="32" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.06)" strokeWidth="1">
        <animate attributeName="y" values="58;18;58" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>
      <circle cx="140" cy="74" r="5" fill="#4CAF50"><animate attributeName="cy" values="74;34;74" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></circle>
      <rect x="152" y="70" width="50" height="8" rx="3" fill="rgba(44,36,24,0.08)"><animate attributeName="y" values="70;30;70" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" /></rect>
      <rect x="100" y="98" width="200" height="32" rx="6" fill="rgba(44,36,24,0.03)" stroke="rgba(44,36,24,0.06)" strokeWidth="1" />
      <circle cx="140" cy="114" r="5" fill="#2196F3" />
      <rect x="152" y="110" width="55" height="8" rx="3" fill="rgba(44,36,24,0.08)" />
    </svg>
  )
}

export default function Home() {
  const screenshotRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  /* ── 3D tilt on hero screenshot ── */
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

  function copyInstall() {
    navigator.clipboard.writeText("brew install --cask multiclaw")
  }

  return (
    <div className="font-sans text-lg leading-relaxed text-foreground bg-background antialiased mc-page-rails">
      {/* Grain */}
      <div className="grain" aria-hidden="true" />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-100 bg-background/90 backdrop-blur-md border-b border-[--color-border-subtle]" role="banner">
        <nav className="flex items-center justify-between h-17 w-[min(90%,1080px)] mx-auto" aria-label="Main navigation">
          <a href="/" className="flex items-center gap-2.5 font-display font-extrabold text-xl text-foreground no-underline" aria-label="MultiClaw home">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold text-lg font-display">M</div>
            <span>MultiClaw</span>
          </a>
          <div className="flex items-center gap-5 ml-8 relative top-0.5 max-md:hidden">
            <Link to="/docs" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Docs</Link>
            <Link to="/blog" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <a href="https://github.com/nichochar/multiclaw" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/download" className="inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-sm bg-primary text-primary-foreground no-underline whitespace-nowrap hover:bg-[--color-accent-dark] transition-colors">Download</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="pt-28 pb-20 text-center relative hero-glow max-md:pt-16 max-md:pb-12" aria-labelledby="hero-title">
          <div className="w-[min(90%,1080px)] mx-auto flex flex-col items-center gap-6 relative z-1">
            <div className="w-40 h-40 flex items-center justify-center mb-2 drop-shadow-[0_8px_24px_rgba(255,107,53,0.15)] animate-float max-md:w-30 max-md:h-30">
              <div className="w-30 h-30 bg-primary rounded-[28px] flex items-center justify-center font-display font-extrabold text-5xl text-white shadow-[0_16px_48px_rgba(255,107,53,0.3)] max-md:w-[90px] max-md:h-[90px] max-md:text-4xl max-md:rounded-[22px]">M</div>
            </div>
            <h1 id="hero-title" className="text-[4rem] max-w-[700px] text-foreground max-lg:text-5xl max-md:text-4xl">
              Tame your AI agents, once&nbsp;and&nbsp;for&nbsp;all
            </h1>
            <p className="text-xl text-muted-foreground max-w-[560px] leading-relaxed font-normal max-md:text-base">
              Run multiple OpenClaw instances side by side with full isolation.
              No more terminal chaos.
            </p>
            <div className="mt-4 flex flex-col items-center gap-2" id="download">
              <div className="inline-flex items-center bg-foreground border border-[#1a1408] rounded-sm max-w-full">
                <pre className="m-0 py-4 pl-5 pr-0 font-mono text-sm leading-none text-white whitespace-pre overflow-x-auto text-left max-md:text-sm max-md:py-2.5 max-md:pl-3.5"><code>brew install --cask multiclaw</code></pre>
                <button className="p-0 mx-4.5 ml-4 flex items-center bg-none border-none text-white/50 font-sans text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors hover:text-white" onClick={copyInstall} type="button">
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="w-[min(95%,1300px)] mx-auto mt-12 relative z-1" style={{ perspective: 1800 }} ref={wrapRef}>
            <div className="hero-shadow--1 absolute rounded-2xl pointer-events-none z-0" aria-hidden="true" />
            <div className="hero-shadow--2 absolute rounded-2xl pointer-events-none z-0" aria-hidden="true" />
            <div className="hero-shadow--3 absolute rounded-2xl pointer-events-none z-0" aria-hidden="true" />
            <div className="hero-shadow--4 absolute rounded-2xl pointer-events-none z-0" aria-hidden="true" />
            <div className="hero-shadow--5 absolute rounded-2xl pointer-events-none z-0" aria-hidden="true" />
            <div className="z-1 origin-center bg-white/55 backdrop-blur-lg border border-black/[0.06] rounded-[20px] p-2 relative overflow-hidden" ref={screenshotRef} style={{ transform: "rotateX(4deg)" }}>
              <img
                src="https://manifest.build/images/screenshot.svg"
                alt="MultiClaw app — multi-instance management"
                width={1280}
                height={699}
                loading="eager"
                className="w-full rounded-[14px] border border-black/[0.06]"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Problem ── */}
        <section className="py-28 max-md:py-16 reveal" aria-labelledby="problem-title">
          <div className="w-[min(90%,1080px)] mx-auto max-w-[720px]">
            <h2 id="problem-title" className="text-4xl max-w-[650px] mb-6 text-center mx-auto max-md:text-2xl">
              Managing multiple AI agents is pure&nbsp;chaos
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center mx-auto max-w-[650px] max-md:text-base">
              Profile flags, port conflicts, context bleed between sessions.
              Running more than one OpenClaw agent means <strong className="text-foreground font-semibold">terminal tab hell</strong> and
              constant context-switching. You deserve better.
            </p>
          </div>
        </section>

        <Separator />

        {/* ── Features Bento ── */}
        <section className="py-28 max-md:py-16 reveal" id="features" aria-labelledby="solution-title">
          <div className="w-[min(90%,1080px)] mx-auto">
            <h2 id="solution-title" className="text-4xl max-w-[650px] mb-2 text-center mx-auto max-md:text-2xl">
              Everything you need to run agents at scale
            </h2>
            <div className="bento-grid mt-12" id="how-it-works">
              {/* 1. Multi-instance sidebar */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <SidebarVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">Multi-instance management</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Clean macOS sidebar with named, color-coded instances.
                  One-click start, stop, and restart.
                </p>
              </div>
              {/* 2. Full isolation */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <IsolationVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">Full isolation</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Each agent runs in its own sandbox. No shared state,
                  no port conflicts, no context bleed between sessions.
                </p>
              </div>
              {/* 3. Terminal + TUI toggle */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <TerminalToggleVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">Live terminal + TUI toggle</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Switch between raw terminal output and the rich TUI view
                  with a single click. See exactly what your agent sees.
                </p>
              </div>
              {/* 4. In-app chat */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <ChatVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">In-app chat</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Chat with any running agent directly from the sidebar.
                  No terminal needed.
                </p>
              </div>
              {/* 5. Open in browser */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <BrowserVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">Open in browser</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Preview any agent&apos;s web output in your default browser
                  with one click.
                </p>
              </div>
              {/* 6. Drag to reorder */}
              <div className="bento-card bg-white/10 border border-[--color-border-subtle] rounded-sm overflow-hidden">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <DragReorderVisual />
                </div>
                <h3 className="text-xl font-normal text-foreground font-display px-8 pt-6 pb-2">Drag to reorder</h3>
                <p className="text-base text-muted-foreground leading-relaxed px-8 pb-8">
                  Organize your sidebar the way you think. Drag instances up or down
                  to match your workflow priority.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust / Deep-dive ── */}
        <section className="py-28 max-md:py-16 reveal" aria-labelledby="trust-title">
          <div className="w-[min(90%,1080px)] mx-auto">
            <h2 id="trust-title" className="text-4xl max-w-[650px] mb-6 text-center mx-auto max-md:text-2xl">
              Built for power users
            </h2>
            <div className="grid grid-cols-3 gap-12 mt-12 max-md:grid-cols-1 max-md:gap-12">
              <div className="text-center">
                <div className="trust-icon w-18 h-18 mx-auto mb-6 flex items-center justify-center" aria-hidden="true">
                  <div className="w-10 h-10 flex items-center justify-center text-3xl text-primary">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Native macOS</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Built as a native macOS app. Lightweight, fast, and feels right
                  at home on your dock.
                </p>
              </div>
              <div className="text-center">
                <div className="trust-icon w-18 h-18 mx-auto mb-6 flex items-center justify-center" aria-hidden="true">
                  <div className="w-10 h-10 flex items-center justify-center text-3xl text-primary">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Open Source</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  MultiClaw is fully open source. Inspect, extend, or contribute.
                  No black boxes, no telemetry.
                </p>
              </div>
              <div className="text-center">
                <div className="trust-icon w-18 h-18 mx-auto mb-6 flex items-center justify-center" aria-hidden="true">
                  <div className="w-10 h-10 flex items-center justify-center text-3xl text-primary">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">OpenClaw native</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Deep integration with OpenClaw. One command to install,
                  zero configuration required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 max-md:py-16 text-center relative overflow-hidden cta-glow reveal" aria-labelledby="cta-title">
          <div className="w-[min(90%,1080px)] mx-auto flex flex-col items-center gap-6 relative z-1">
            <div className="w-18 h-18 bg-primary rounded-[18px] flex items-center justify-center text-white font-display font-extrabold text-3xl mb-2 shadow-[0_8px_24px_rgba(255,107,53,0.2)]">M</div>
            <h2 id="cta-title" className="text-5xl leading-tight -mt-4 tracking-tight max-md:text-4xl">
              Stop juggling terminals
            </h2>
            <p className="text-lg text-muted-foreground max-w-[440px]">
              One app. All your agents. Easy to install, impossible to outgrow.
            </p>
            <a href="#download" className="inline-flex items-center gap-1.5 font-medium text-base px-5.5 py-2.5 rounded-sm bg-primary text-primary-foreground no-underline whitespace-nowrap hover:bg-[--color-accent-dark] transition-colors">Download MultiClaw</a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-[--color-border-subtle] bg-background" role="contentinfo">
        <div className="w-[min(90%,1080px)] mx-auto flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:text-center">
          <div className="flex items-center gap-2 max-md:flex-col">
            <span className="font-display font-extrabold text-xl text-foreground">MultiClaw</span>
            <span className="text-sm text-muted-foreground">&copy; 2026 MultiClaw. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/nichochar/multiclaw" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
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
