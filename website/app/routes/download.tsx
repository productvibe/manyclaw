import { Link } from "react-router";
import Layout from "~/components/Layout";

export default function Download() {
  return (
    <Layout>
      <main className="max-w-[640px] mx-auto px-6 py-24 text-center font-sans text-foreground">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold mb-4 leading-tight">
          Download MultiClaw
        </h1>
        <p className="text-lg text-foreground/65 mb-2">
          macOS 12 Monterey or later &middot; Apple Silicon &amp; Intel
        </p>
        <p className="text-sm text-foreground/40 mb-12">
          Current version: 0.1.0 &middot; Early Access
        </p>

        <a
          href="#"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-base px-8 py-3.5 rounded-lg no-underline mb-8 hover:bg-[--color-accent-dark] transition-colors"
        >
          &darr; Download DMG (macOS)
        </a>

        <p className="text-sm text-foreground/50 mb-2">
          Or install via Homebrew:
        </p>
        <code className="inline-block bg-foreground text-background px-5 py-2.5 rounded-lg font-mono text-sm mb-12">
          brew install --cask multiclaw
        </code>

        <p className="text-sm text-foreground/50">
          Already have it?{" "}
          <Link to="/blog" className="text-primary no-underline hover:underline">
            Check the changelog &rarr;
          </Link>
        </p>
      </main>
    </Layout>
  );
}
