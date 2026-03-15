import { useState } from "react";
import { Link } from "react-router";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-100 bg-background/90 backdrop-blur-md border-b border-[--color-border-subtle]" role="banner">
        <nav className="flex items-center justify-between h-17 w-[min(90%,1080px)] mx-auto">
          <Link to="/" className="flex items-center gap-2.5 font-display font-extrabold text-xl text-foreground no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold text-lg font-display">M</div>
            <span>ManyClaw</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-5">
            <Link to="/blog" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Blog</Link>
            <Link to="/docs" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Docs</Link>
            <a href="https://github.com/nichochar/multiclaw" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/download" className="inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-sm bg-primary text-primary-foreground no-underline whitespace-nowrap hover:bg-[--color-accent-dark] transition-colors">Download</Link>
          </div>

          {/* Hamburger button */}
          <button
            className="flex sm:hidden items-center justify-center bg-transparent border-none cursor-pointer p-2 text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed top-17 inset-x-0 bottom-0 z-99 bg-background/[0.98] backdrop-blur-md flex flex-col items-center pt-12 gap-6 sm:hidden">
          <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-foreground no-underline">Blog</Link>
          <Link to="/docs" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-foreground no-underline">Docs</Link>
          <a href="https://github.com/nichochar/multiclaw" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-foreground no-underline">GitHub</a>
          <Link to="/download" onClick={() => setMenuOpen(false)} className="inline-flex items-center font-medium text-lg px-6 py-2.5 rounded-sm bg-primary text-primary-foreground no-underline">Download</Link>
        </div>
      )}
    </>
  );
}
