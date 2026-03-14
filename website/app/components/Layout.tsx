import { Link } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", color: "#2c2418", background: "#fcfaf5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header className="nav" role="banner" style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(252,250,245,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(44,36,24,0.06)",
      }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 68, width: "min(90%, 1080px)", marginInline: "auto",
        }}>
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, fontSize: "1.25rem",
            color: "#2c2418", textDecoration: "none",
          }}>
            <div style={{
              width: 32, height: 32, background: "#FF6B35", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: 18, fontFamily: "Bricolage Grotesque, sans-serif",
            }}>M</div>
            <span>MultiClaw</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link to="/blog" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#2c2418", textDecoration: "none" }}>Blog</Link>
            <Link to="/docs" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#2c2418", textDecoration: "none" }}>Docs</Link>
            <a href="https://github.com/nichochar/multiclaw" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#2c2418", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/download" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: "0.875rem",
              padding: "8px 16px", borderRadius: 3, border: "none", cursor: "pointer",
              background: "#2c2418", color: "#fff", textDecoration: "none", whiteSpace: "nowrap",
            }}>Download</Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{
        padding: "2rem 0", borderTop: "1px solid rgba(44,36,24,0.06)", background: "#fcfaf5",
      }} role="contentinfo">
        <div style={{
          width: "min(90%, 1080px)", marginInline: "auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#2c2418" }}>MultiClaw</span>
            <span style={{ fontSize: "0.875rem", color: "#7a6e5e" }}>&copy; 2026 MultiClaw. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="https://github.com/nichochar/multiclaw" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: "#7a6e5e", fontSize: "1.4rem", display: "flex", alignItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
