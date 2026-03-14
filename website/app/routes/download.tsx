import { Link } from "react-router";
import Layout from "~/components/Layout";

export default function Download() {
  return (
    <Layout>
      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "6rem 1.5rem",
          textAlign: "center",
          fontFamily: "DM Sans, sans-serif",
          color: "#2c2418",
        }}
      >
        <h1
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            marginBottom: "1rem",
            lineHeight: 1.15,
          }}
        >
          Download MultiClaw
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "rgba(44,36,24,0.65)",
            marginBottom: "0.5rem",
          }}
        >
          macOS 12 Monterey or later · Apple Silicon &amp; Intel
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "rgba(44,36,24,0.4)",
            marginBottom: "3rem",
          }}
        >
          Current version: 0.1.0 · Early Access
        </p>

        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#FF6B35",
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            padding: "0.875rem 2rem",
            borderRadius: "0.625rem",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          ↓ Download DMG (macOS)
        </a>

        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(44,36,24,0.5)",
            marginBottom: "0.5rem",
          }}
        >
          Or install via Homebrew:
        </p>
        <code
          style={{
            display: "inline-block",
            background: "#2c2418",
            color: "#fcfaf5",
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: "0.9rem",
            marginBottom: "3rem",
          }}
        >
          brew install --cask multiclaw
        </code>

        <p style={{ fontSize: "0.875rem", color: "rgba(44,36,24,0.5)" }}>
          Already have it?{" "}
          <Link
            to="/blog"
            style={{ color: "#FF6B35", textDecoration: "none" }}
          >
            Check the changelog →
          </Link>
        </p>
      </main>
    </Layout>
  );
}
