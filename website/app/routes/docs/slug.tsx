import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/slug";
import { data } from "react-router";
import Layout from "~/components/Layout";
import { getPost, listPosts, type PostMeta } from "~/lib/content";

// ── TOC extraction ────────────────────────────────────────────────────────────

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

function extractToc(html: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 2 | 3;
    // Use explicit id if present, else slug the text
    const rawText = match[3].replace(/<[^>]+>/g, "");
    const id =
      match[2] ||
      rawText
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    entries.push({ id, text: rawText, level });
  }
  return entries;
}

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
  const toc = extractToc(post.html);
  return { post, allDocs, prev, next, toc };
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
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid rgba(44,36,24,0.1)",
        padding: "1.5rem 0 2rem",
        position: "sticky",
        top: 60,
        alignSelf: "flex-start",
        height: "calc(100vh - 60px)",
        overflowY: "auto",
        background: "#fcfaf5",
      }}
    >
      {/* Search stub */}
      <div style={{ padding: "0 1rem 1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(44,36,24,0.06)",
            border: "1px solid rgba(44,36,24,0.1)",
            borderRadius: 8,
            padding: "0.45rem 0.75rem",
            cursor: "text",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="#2c2418" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="#2c2418" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontSize: 12,
              color: "rgba(44,36,24,0.4)",
              fontFamily: "DM Sans, sans-serif",
              flex: 1,
            }}
          >
            Search docs…
          </span>
          <kbd
            style={{
              fontSize: 10,
              color: "rgba(44,36,24,0.3)",
              fontFamily: "inherit",
              background: "rgba(44,36,24,0.08)",
              border: "1px solid rgba(44,36,24,0.12)",
              borderRadius: 4,
              padding: "1px 5px",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Nav groups */}
      {Object.entries(sections).map(([section, posts]) => (
        <div key={section} style={{ marginBottom: "1.25rem" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(44,36,24,0.4)",
              fontFamily: "DM Sans, sans-serif",
              padding: "0 1.25rem",
              margin: "0 0 0.4rem",
            }}
          >
            {section}
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {posts.map((doc) => {
              const isActive = doc.slug === currentSlug;
              return (
                <li key={doc.slug}>
                  <Link
                    to={`/docs/${doc.slug}`}
                    style={{
                      display: "block",
                      padding: "0.375rem 1.25rem",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#FF6B35" : "#2c2418",
                      textDecoration: "none",
                      borderLeft: isActive
                        ? "2px solid #FF6B35"
                        : "2px solid transparent",
                      background: isActive
                        ? "rgba(255,107,53,0.06)"
                        : "transparent",
                    }}
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

// ── Right TOC sidebar ─────────────────────────────────────────────────────────

function TocSidebar({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;
  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        padding: "2rem 0 2rem 1.5rem",
        position: "sticky",
        top: 60,
        alignSelf: "flex-start",
        height: "calc(100vh - 60px)",
        overflowY: "auto",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(44,36,24,0.4)",
          fontFamily: "DM Sans, sans-serif",
          margin: "0 0 0.75rem",
        }}
      >
        On this page
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              style={{
                display: "block",
                padding: `0.3rem 0 0.3rem ${entry.level === 3 ? "0.875rem" : "0"}`,
                fontFamily: "DM Sans, sans-serif",
                fontSize: entry.level === 3 ? "0.8rem" : "0.85rem",
                color:
                  entry.level === 3
                    ? "rgba(44,36,24,0.55)"
                    : "rgba(44,36,24,0.75)",
                textDecoration: "none",
                lineHeight: 1.4,
              }}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ── Next step card ────────────────────────────────────────────────────────────

function NextStepCard({ next }: { next: PostMeta }) {
  return (
    <Link
      to={`/docs/${next.slug}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          marginTop: "3rem",
          padding: "1.25rem 1.5rem",
          border: "1px solid rgba(44,36,24,0.12)",
          borderRadius: 12,
          background: "rgba(255,107,53,0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          transition: "border-color 150ms, background 150ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,107,53,0.4)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,107,53,0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(44,36,24,0.12)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,107,53,0.03)";
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FF6B35",
              fontFamily: "DM Sans, sans-serif",
              margin: "0 0 0.3rem",
            }}
          >
            Next
          </p>
          <p
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#2c2418",
              margin: "0 0 0.25rem",
            }}
          >
            {next.title}
          </p>
          {next.description && (
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(44,36,24,0.55)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {next.description}
            </p>
          )}
        </div>
        <span style={{ fontSize: "1.25rem", color: "#FF6B35", flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsSlug() {
  const { post, allDocs, prev, next, toc } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <style>{`
        .doc-prose { line-height: 1.75; }
        .doc-prose h1, .doc-prose h2, .doc-prose h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          color: #2c2418;
          margin: 2rem 0 0.75rem;
          line-height: 1.25;
          scroll-margin-top: 80px;
        }
        .doc-prose h1 { font-size: 1.75rem; }
        .doc-prose h2 { font-size: 1.375rem; border-bottom: 1px solid rgba(44,36,24,0.08); padding-bottom: 0.4rem; }
        .doc-prose h3 { font-size: 1.05rem; }
        .doc-prose p { margin: 0 0 1.25rem; }
        .doc-prose ul, .doc-prose ol { margin: 0 0 1.25rem 1.5rem; }
        .doc-prose li { margin-bottom: 0.4rem; }
        .doc-prose code {
          background: rgba(44,36,24,0.07);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .doc-prose pre {
          background: #2c2418;
          color: #fcfaf5;
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0 0 1.5rem;
        }
        .doc-prose pre code {
          background: none;
          padding: 0;
          font-size: 0.875rem;
          color: inherit;
        }
        .doc-prose a { color: #FF6B35; text-decoration: none; }
        .doc-prose a:hover { text-decoration: underline; }
        .doc-prose strong { font-weight: 600; }
        .doc-prose blockquote {
          border-left: 3px solid #FF6B35;
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 0 0 1.25rem;
          color: rgba(44,36,24,0.7);
        }
        .doc-prose hr { border: none; border-top: 1px solid rgba(44,36,24,0.1); margin: 2rem 0; }
        .doc-prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9rem; }
        .doc-prose th { text-align: left; padding: 0.5rem 0.75rem; background: rgba(44,36,24,0.05); font-weight: 600; border-bottom: 1px solid rgba(44,36,24,0.1); }
        .doc-prose td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(44,36,24,0.07); }

        /* Mobile: collapse sidebars */
        @media (max-width: 900px) {
          .docs-sidebar-left { display: none !important; }
          .docs-sidebar-right { display: none !important; }
          .docs-main { padding: 2rem 1.25rem !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)", background: "#fcfaf5" }}>
        {/* Left sidebar */}
        <div className="docs-sidebar-left">
          <DocsSidebar docs={allDocs} currentSlug={post.slug} />
        </div>

        {/* Main content */}
        <main
          className="docs-main"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "3rem 2.5rem",
            fontFamily: "DM Sans, sans-serif",
            color: "#2c2418",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <h1
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: "0.625rem",
                marginTop: 0,
                color: "#2c2418",
              }}
            >
              {post.title}
            </h1>
            {post.description && (
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "rgba(44,36,24,0.6)",
                  marginBottom: "2.5rem",
                  lineHeight: 1.6,
                  marginTop: 0,
                }}
              >
                {post.description}
              </p>
            )}

            <article
              className="doc-prose"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {/* Next step card */}
            {next && <NextStepCard next={next} />}

            {/* Prev link (text only, below the card) */}
            {prev && (
              <div style={{ marginTop: "1.25rem" }}>
                <Link
                  to={`/docs/${prev.slug}`}
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "0.875rem",
                    color: "rgba(44,36,24,0.45)",
                    textDecoration: "none",
                  }}
                >
                  ← {prev.title}
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Right TOC */}
        <div className="docs-sidebar-right">
          <TocSidebar toc={toc} />
        </div>
      </div>
    </Layout>
  );
}
