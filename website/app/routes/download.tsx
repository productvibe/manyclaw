import type { MetaFunction } from "react-router";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => [
  { title: "Download ManyClaw" },
  { name: "description", content: "Download ManyClaw for macOS. Free and open source." },
];

export default function Download() {
  return (
    <Layout>
      <main className="max-w-[520px] mx-auto px-6 py-24 text-center font-sans">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold mb-2.5 mt-0 leading-tight">
          Download ManyClaw
        </h1>
        <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
          Free and open source. Everything runs on your machine.
        </p>

        {/* OpenClaw prerequisite */}
        <div className="border border-border rounded-lg bg-foreground/[0.03] px-5 py-4 mb-8 text-sm text-foreground/70">
          <p className="m-0">
            OpenClaw must be installed first.{" "}
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary no-underline font-medium hover:underline"
            >
              Get OpenClaw →
            </a>
          </p>
        </div>

        {/* Primary download */}
        <a
          href="https://github.com/productvibe/manyclaw/releases/download/v0.0.2/ManyClaw-0.0.2-arm64.dmg"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-base px-8 py-3.5 rounded-lg no-underline mb-3 hover:bg-[--color-accent-dark] transition-colors"
        >
          ↓ Download for M1/M2/M3/M4
        </a>

        {/* Intel link */}
        <p className="text-sm text-foreground/45 mb-0">
          <a
            href="https://github.com/productvibe/manyclaw/releases/download/v0.0.2/ManyClaw-0.0.2-x64.dmg"
            className="text-primary no-underline hover:underline"
          >
            ↓ Intel Mac
          </a>
        </p>

        {/* Footer links */}
        <div className="border-t border-border mt-10 pt-6 text-sm text-foreground/45 space-y-1">
          <p className="m-0">
            Source on{" "}
            <a
              href="https://github.com/productvibe/manyclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary no-underline hover:underline"
            >
              GitHub →
            </a>
          </p>
          <p className="m-0">macOS 13+</p>
        </div>
      </main>
    </Layout>
  );
}
