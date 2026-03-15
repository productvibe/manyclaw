import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => [
  { title: "Download ManyClaw" },
  { name: "description", content: "Download ManyClaw for macOS. Free and open source." },
];

export default function Download() {
  return (
    <Layout>
      <main
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "6rem 1.5rem 5rem",
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
            marginBottom: "0.625rem",
            lineHeight: 1.15,
            marginTop: 0,
          }}
        >
          Download ManyClaw
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "rgba(44,36,24,0.6)",
            marginBottom: "2.5rem",
            lineHeight: 1.6,
          }}
        >
          Free and open source. Everything runs on your machine.
        </p>

        {/* Primary CTA */}
        <a
          href="https://github.com/nichochar/multiclaw/releases/latest"
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
            marginBottom: "2.5rem",
          }}
        >
          ↓ Download ManyClaw 0.1 (.dmg)
        </a>

        {/* Brew */}
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
          brew install --cask manyclaw
        </code>

        {/* Requirements */}
        <div
          style={{
            borderTop: "1px solid rgba(44,36,24,0.1)",
            paddingTop: "2rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(44,36,24,0.4)",
              marginBottom: "0.75rem",
            }}
          >
            System Requirements
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              fontSize: "0.9rem",
              color: "rgba(44,36,24,0.65)",
            }}
          >
            <li>macOS 13 Ventura or later</li>
            <li>Apple Silicon or Intel</li>
          </ul>
        </div>

        {/* Notes */}
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(44,36,24,0.5)",
            lineHeight: 1.7,
            marginBottom: "0.5rem",
          }}
        >
          The DMG is signed and notarized. Open it, drag ManyClaw to Applications, launch.
        </p>
        <p style={{ fontSize: "0.875rem", color: "rgba(44,36,24,0.5)" }}>
          Source code and release notes on{" "}
          <a
            href="https://github.com/nichochar/multiclaw"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FF6B35", textDecoration: "none" }}
          >
            GitHub →
          </a>
        </p>

        {/* Changelog link */}
        <p style={{ fontSize: "0.875rem", color: "rgba(44,36,24,0.4)", marginTop: "2rem" }}>
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
