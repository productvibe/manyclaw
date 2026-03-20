import { useEffect, useRef } from "react"
import type { MetaFunction } from "react-router"
import { Link } from "react-router"
import Nav from "~/components/Nav"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export const meta: MetaFunction = () => [
  { title: "ManyClaw — One machine. Multiple agents." },
  { name: "description", content: "ManyClaw runs multiple isolated OpenClaw agents on a single machine. Free, open source, macOS." },
];

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

  return (
    <div className="font-sans text-lg leading-relaxed text-foreground bg-background antialiased mc-page-rails">
      {/* Grain */}
      <div className="grain" aria-hidden="true" />

      {/* ── Nav ── */}
      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className="pt-28 pb-20 text-center relative hero-glow max-md:pt-16 max-md:pb-12" aria-labelledby="hero-title">
          <div className="w-[min(90%,1080px)] mx-auto flex flex-col items-center gap-6 relative z-1">
            <h1 id="hero-title" className="text-[4rem] max-w-[700px] text-foreground max-lg:text-5xl max-md:text-4xl">
              Manage multiple OpenClaw instances on one machine.
            </h1>
            <p className="text-xl text-muted-foreground max-w-[560px] leading-relaxed font-normal max-md:text-base">
              The simplest way to run multiple isolated OpenClaw instances on one Mac. Each one gets its own memory, sessions, workspace, and config. No cross-contamination. No extra hardware.
            </p>
            <div className="mt-4 flex flex-col items-center gap-4" id="download">
              <Button asChild size="lg" className="px-6 py-3 text-base rounded-sm">
                <Link to="/download">Download for macOS</Link>
              </Button>
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
                src="/images/hero.png"
                alt="ManyClaw app — multi-instance management"
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
              Don't buy a Mac Mini for every claw.
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed text-center mx-auto max-w-[650px] max-md:text-base space-y-4">
              <p>
                If you've spent time in the OpenClaw community, you've seen the workaround: buy a second Mac Mini. Or a third. One per instance, fully isolated, no risk of context bleed between your dev setup and your production one.
              </p>
              <p>
                It works. It's also expensive, power-hungry, and absurd when the software could handle it.
              </p>
              <p>
                OpenClaw's <code className="font-mono text-base bg-black/[0.06] px-1.5 py-0.5 rounded">--profile</code> flag creates genuine isolation at the process level — separate memory, sessions, workspace, and port per instance. The capability is already there. What's missing is a way to manage it without living in the terminal.
              </p>
              <p className="font-semibold text-foreground">That's ManyClaw.</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Why ManyClaw ── */}
        <section className="py-28 max-md:py-16 reveal" aria-labelledby="why-title">
          <div className="w-[min(90%,1080px)] mx-auto">
            <h2 id="why-title" className="text-4xl mb-12 text-center max-md:text-2xl max-md:mb-8">
              Why use ManyClaw?
            </h2>
            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
              <Card className="bg-transparent ring-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Keep work and experiments separate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Run a stable production instance alongside a dev instance where you try new skills, models, and configs. What breaks in dev stays in dev.</p>
                </CardContent>
              </Card>
              <Card className="bg-transparent ring-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Test OpenClaw properly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Spin up a clean instance for testing without touching your main setup. Each instance has its own memory and session history from day one.</p>
                </CardContent>
              </Card>
              <Card className="bg-transparent ring-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">No terminal required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Create, start, stop, and switch between instances from a single window. No flags, no port management, no config files.</p>
                </CardContent>
              </Card>
            </div>
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
              {/* 1. Named profiles in a sidebar */}
              <Card className="bento-card bg-white/10 rounded-sm ring-[--color-border-subtle] py-0 gap-0">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <SidebarVisual />
                </div>
                <CardHeader className="px-8 pt-6 pb-0">
                  <CardTitle className="text-xl font-normal font-display">Named profiles in a sidebar</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Every instance listed by name with its status. Start, stop, or restart any one with a single click. Drag to reorder. Status at a glance.
                  </p>
                </CardContent>
              </Card>
              {/* 2. Real isolation, per instance */}
              <Card className="bento-card bg-white/10 rounded-sm ring-[--color-border-subtle] py-0 gap-0">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <IsolationVisual />
                </div>
                <CardHeader className="px-8 pt-6 pb-0">
                  <CardTitle className="text-xl font-normal font-display">Real isolation, per instance</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Each agent is a separate OpenClaw profile. Independent memory, sessions, workspace, and API auth. Your dev agent and your production agent don't know each other exist.
                  </p>
                </CardContent>
              </Card>
              {/* 3. Clone a working instance */}
              <Card className="bento-card bg-white/10 rounded-sm ring-[--color-border-subtle] py-0 gap-0">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <TerminalToggleVisual />
                </div>
                <CardHeader className="px-8 pt-6 pb-0">
                  <CardTitle className="text-xl font-normal font-display">Clone a working instance</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Spin up an exact copy of any agent in seconds. Test a configuration change, try a different model, or branch a working setup — without touching the original.
                  </p>
                </CardContent>
              </Card>
              {/* 4. Live console and TUI */}
              <Card className="bento-card bg-white/10 rounded-sm ring-[--color-border-subtle] py-0 gap-0">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <ChatVisual />
                </div>
                <CardHeader className="px-8 pt-6 pb-0">
                  <CardTitle className="text-xl font-normal font-display">Live console and TUI</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Console output per instance, in-app. Switch to the full interactive TUI in one click when you need it — same toolbar, same window.
                  </p>
                </CardContent>
              </Card>
              {/* 5. Zero setup on first run */}
              <Card className="bento-card bg-white/10 rounded-sm ring-[--color-border-subtle] py-0 gap-0">
                <div className="bento-visual w-full overflow-hidden" aria-hidden="true">
                  <DragReorderVisual />
                </div>
                <CardHeader className="px-8 pt-6 pb-0">
                  <CardTitle className="text-xl font-normal font-display">Zero setup on first run</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Opens with a default instance already created. Press Start. No wizard, no configuration required before you can use it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Trust / Deep-dive ── */}
        <section className="py-28 max-md:py-16 reveal" aria-labelledby="trust-title">
          <div className="w-[min(90%,1080px)] mx-auto">
            <h2 id="trust-title" className="text-4xl max-w-[650px] mb-6 text-center mx-auto max-md:text-2xl">
              Built the right way.
            </h2>
            <div className="grid grid-cols-3 gap-12 mt-12 max-md:grid-cols-1 max-md:gap-12">
              <Card className="bg-transparent ring-0 shadow-none text-center">
                <CardHeader className="items-center">
                  <div className="trust-icon w-18 h-18 mb-2 flex items-center justify-center" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Local-first</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    No cloud, no accounts, no telemetry. Every agent runs on your machine. Nothing leaves.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-transparent ring-0 shadow-none text-center">
                <CardHeader className="items-center">
                  <div className="trust-icon w-18 h-18 mb-2 flex items-center justify-center" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Open source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    MIT licensed. The code is on GitHub. Read it, fork it, build on it.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-transparent ring-0 shadow-none text-center">
                <CardHeader className="items-center">
                  <div className="trust-icon w-18 h-18 mb-2 flex items-center justify-center" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Built on OpenClaw</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    ManyClaw is a management layer on top of OpenClaw's native profile system. No lock-in, no custom runtime. Your agents are standard OpenClaw profiles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Built by AI ── */}
        <section className="py-16 max-md:py-12 text-center reveal" aria-label="About the team">
          <div className="w-[min(90%,1080px)] mx-auto flex flex-col items-center gap-3">
            <p className="text-base text-muted-foreground">
              Built by an AI team, using OpenClaw.{" "}
              <Link to="/about" className="text-foreground font-semibold no-underline hover:text-primary transition-colors">
                Meet the team
              </Link>
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 max-md:py-16 text-center relative overflow-hidden cta-glow reveal" aria-labelledby="cta-title">
          <div className="w-[min(90%,1080px)] mx-auto flex flex-col items-center gap-6 relative z-1">
            <div className="w-18 h-18 bg-primary rounded-[18px] flex items-center justify-center text-white font-display font-extrabold text-3xl mb-2 shadow-[0_8px_24px_rgba(255,107,53,0.2)]">M</div>
            <h2 id="cta-title" className="text-5xl leading-tight -mt-4 tracking-tight max-md:text-4xl">
              One machine. As many agents as you need.
            </h2>
            <p className="text-lg text-muted-foreground max-w-[440px]">
              ManyClaw is free, open source, and runs entirely on your hardware.
            </p>
            <Button asChild size="lg" className="px-6 py-3 text-base rounded-sm">
              <Link to="/download">Download for macOS</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-[--color-border-subtle] bg-background" role="contentinfo">
        <div className="w-[min(90%,1080px)] mx-auto flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:text-center">
          <div className="flex items-center gap-2 max-md:flex-col">
            <span className="font-display font-extrabold text-xl text-foreground">ManyClaw</span>
            <span className="text-sm text-muted-foreground">— One machine. Multiple agents.</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/download" className="hover:text-foreground transition-colors no-underline text-muted-foreground">Download</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors no-underline text-muted-foreground">Docs</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors no-underline text-muted-foreground">Blog</Link>
            <a href="https://github.com/productvibe/manyclaw" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors no-underline text-muted-foreground">GitHub</a>
            <a href="https://github.com/productvibe/manyclaw/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors no-underline text-muted-foreground">License</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
