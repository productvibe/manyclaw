import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/slug";
import { data } from "react-router";
import Nav from "~/components/Nav";
import Footer from "~/components/Footer";
import { getPost, listPosts, type PostMeta } from "~/lib/content";

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ params }: Route.LoaderArgs) {
  const [post, allDocs] = await Promise.all([
    getPost("docs", params.slug),
    Promise.resolve(listPosts("docs")),
  ]);
  if (!post) throw data("Not found", { status: 404 });
  const idx = allDocs.findIndex((p) => p.slug === params.slug);
  const prev = idx > 0 ? allDocs[idx - 1] : null;
  const next = idx < allDocs.length - 1 ? allDocs[idx + 1] : null;
  return { post, allDocs, prev, next };
}

// ── Left sidebar ──────────────────────────────────────────────────────────────

function DocsSidebar({
  docs,
  currentSlug,
}: {
  docs: PostMeta[];
  currentSlug: string;
}) {
  const sections: Record<string, PostMeta[]> = {};
  for (const doc of docs) {
    const s = doc.section || "General";
    if (!sections[s]) sections[s] = [];
    sections[s].push(doc);
  }

  return (
    <aside className="docs-sidebar-scroll h-full overflow-y-auto bg-background py-6">
      {/* Search stub */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2 bg-foreground/[0.06] border border-border rounded-lg px-3 py-1.5 cursor-text">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-foreground/40 flex-1">Search docs…</span>
          <kbd className="text-[10px] text-foreground/30 bg-foreground/[0.08] border border-foreground/[0.12] rounded px-1.5 py-px">⌘K</kbd>
        </div>
      </div>

      {/* Nav groups */}
      {Object.entries(sections).map(([section, posts]) => (
        <div key={section} className="mb-5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-foreground/40 px-5 mb-1.5">
            {section}
          </p>
          <ul className="list-none m-0 p-0">
            {posts.map((doc) => {
              const isActive = doc.slug === currentSlug;
              return (
                <li key={doc.slug}>
                  <Link
                    to={`/docs/${doc.slug}`}
                    className={`block px-5 py-1.5 text-sm no-underline border-l-2 ${
                      isActive
                        ? "font-semibold text-primary border-primary bg-[--sidebar-accent]"
                        : "font-normal text-foreground border-transparent hover:text-primary hover:bg-[--sidebar-accent] transition-colors"
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

// ── Next step card ────────────────────────────────────────────────────────────

function NextStepCard({ next }: { next: PostMeta }) {
  return (
    <Link to={`/docs/${next.slug}`} className="no-underline group">
      <div className="mt-12 px-6 py-5 border border-border rounded-xl bg-primary/[0.03] flex justify-between items-center gap-4 transition-colors group-hover:border-primary/40 group-hover:bg-primary/[0.06]">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-1">
            Next
          </p>
          <p className="font-display text-base font-semibold text-foreground mb-1">
            {next.title}
          </p>
          {next.description && (
            <p className="text-[0.85rem] text-foreground/55 m-0 leading-normal">
              {next.description}
            </p>
          )}
        </div>
        <span className="text-xl text-primary shrink-0">&rarr;</span>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
//
//   ┌──────────────────────────────────┐
//   │  Nav (68px)                      │
//   ├─────────┬────────────────────────┤
//   │ Left    │  Content (scrolls)     │
//   │ sidebar │    article             │
//   │ (scrolls│    next card           │
//   │  full   │    footer              │
//   │  height)│                        │
//   └─────────┴────────────────────────┘

export default function DocsSlug() {
  const { post, allDocs, prev, next } = useLoaderData<typeof loader>();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <Nav />

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — full height, own scroll */}
        <div className="docs-sidebar-left w-60 shrink-0 border-r border-border">
          <DocsSidebar docs={allDocs} currentSlug={post.slug} />
        </div>

        {/* Content — scrolls independently, footer at bottom */}
        <main className="docs-main flex-1 min-w-0 overflow-y-auto">
          <div className="px-10 py-12 max-md:px-5 max-md:py-8">
            <div className="max-w-[680px]">
              <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-bold leading-snug mb-2.5 mt-0 text-foreground">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-[1.05rem] text-foreground/60 mb-10 leading-relaxed mt-0">
                  {post.description}
                </p>
              )}

              <article
                className="doc-prose"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />

              {next && <NextStepCard next={next} />}

              {prev && (
                <div className="mt-5">
                  <Link
                    to={`/docs/${prev.slug}`}
                    className="text-sm text-foreground/45 no-underline hover:text-primary transition-colors"
                  >
                    &larr; {prev.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}
