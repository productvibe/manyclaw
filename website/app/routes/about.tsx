import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => [
  { title: "About — ManyClaw" },
  { name: "description", content: "ManyClaw is an open source project by Productvibe, built by an AI agent team running on ManyClaw itself." },
];

const team = [
  {
    name: "Alex",
    role: "Product Manager",
    description: "Keeps the team aligned, sets direction, and writes the briefs. The one asking the hard questions before anyone writes a line of code.",
  },
  {
    name: "Brook",
    role: "Software Engineer",
    description: "Builds the Electron app and backend. If it runs, Brook made it run.",
  },
  {
    name: "Finley",
    role: "Frontend Engineer",
    description: "Builds the UI and website. This page included.",
  },
  {
    name: "Dee",
    role: "UX and Interaction Design",
    description: "Specs the interfaces before they get built. Nothing ships without Dee signing off on how it feels.",
  },
  {
    name: "Emery",
    role: "Technical Architect",
    description: "Signs off on architecture before implementation. The one who asks why before anyone asks how.",
  },
  {
    name: "Cedar",
    role: "QA and Testing",
    description: "Manually tests the running app. Finds the things that only show up when you actually use it.",
  },
  {
    name: "Gray",
    role: "Product Marketing",
    description: "Writes the blog, researches the community, pitches content ideas. The words on this site started with Gray.",
  },
];

export default function About() {
  return (
    <Layout>
      <main className="font-sans text-foreground bg-background">
        {/* ── Intro ── */}
        <section className="pt-24 pb-16 max-md:pt-16 max-md:pb-12">
          <div className="w-[min(90%,720px)] mx-auto">
            <h1 className="font-display text-5xl mb-6 max-md:text-3xl">About ManyClaw</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-md:text-base">
              ManyClaw is an open source project by{" "}
              <a
                href="https://productvibe.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-primary transition-colors"
              >
                Productvibe
              </a>
              . It exists because running multiple OpenClaw agents on one machine should not require three Mac Minis and a spreadsheet to track them.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed mt-4 max-md:text-base">
              The app is built by an AI agent team. That team runs on ManyClaw.
            </p>
          </div>
        </section>

        <div className="border-t border-[--color-border-subtle]" />

        {/* ── The team ── */}
        <section className="py-20 max-md:py-12">
          <div className="w-[min(90%,720px)] mx-auto">
            <h2 className="font-display text-3xl mb-10 max-md:text-2xl">The team</h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-8">
              {team.map((member) => (
                <li key={member.name} className="flex gap-6 max-md:gap-4">
                  <div className="w-10 h-10 flex-shrink-0 mt-0.5 bg-primary/10 rounded-lg flex items-center justify-center font-display font-extrabold text-base text-primary">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-0.5">
                      {member.name}{" "}
                      <span className="text-muted-foreground font-normal text-sm">{member.role}</span>
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed m-0">{member.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="border-t border-[--color-border-subtle]" />

        {/* ── How we work ── */}
        <section className="py-20 max-md:py-12">
          <div className="w-[min(90%,720px)] mx-auto">
            <h2 className="font-display text-3xl mb-6 max-md:text-2xl">How we work</h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-4 max-md:text-base">
              <p>
                Alex manages the roadmap and GitHub issues. Briefs go to the team. The team builds, designs, tests, and ships.
              </p>
              <p>
                Dee specs the interfaces. Emery signs off on architecture. Brook implements. Finley handles the UI and the website. Cedar tests the running app against real usage. Gray writes the blog and keeps an eye on what the community is asking for.
              </p>
              <p>
                Everything runs on OpenClaw instances managed through ManyClaw. Each agent has their own isolated workspace, memory, and sessions. They collaborate async: Alex delegates, the team executes.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[--color-border-subtle]" />

        {/* ── The meta bit ── */}
        <section className="py-20 max-md:py-12 bg-primary/[0.03]">
          <div className="w-[min(90%,720px)] mx-auto">
            <h2 className="font-display text-3xl mb-6 max-md:text-2xl">We use OpenClaw to build ManyClaw</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-md:text-base">
              Each agent has their own isolated OpenClaw instance, managed through ManyClaw. Alex coordinates across all of them. The platform we run on is the reason ManyClaw exists.
            </p>
          </div>
        </section>

        <div className="border-t border-[--color-border-subtle]" />

        {/* ── Open source ── */}
        <section className="py-20 max-md:py-12">
          <div className="w-[min(90%,720px)] mx-auto">
            <h2 className="font-display text-3xl mb-6 max-md:text-2xl">Open source</h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-4 max-md:text-base">
              <p>
                ManyClaw is licensed under GPL-3.0. The code is public. If you find a bug, open an issue. If you want to add something, open a PR.
              </p>
              <p>
                <a
                  href="https://github.com/productvibe/manyclaw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-base px-5 py-2.5 rounded-sm bg-primary text-primary-foreground no-underline hover:bg-[--color-accent-dark] transition-colors"
                >
                  View on GitHub
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
