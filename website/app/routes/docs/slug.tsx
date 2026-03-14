import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/slug";
import { data } from "react-router";
import Layout from "~/components/Layout";
import { getPost, listPosts, type PostMeta } from "~/lib/content";

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

function DocsSidebar({
  docs,
  currentSlug,
}: {
  docs: PostMeta[];
  currentSlug: string;
}) {
  // Group by section, preserving order within each section
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
        padding: "2rem 0",
        position: "sticky",
        top: 60,
        height: "calc(100vh - 60px)",
        overflowY: "auto",
        background: "#fcfaf5",
      }}
    >
      {Object.entries(sections).map(([section, posts]) => (
        <div key={section} style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(44,36,24,0.45)",
              fontFamily: "DM Sans, sans-serif",
              padding: "0 1.25rem",
              margin: "0 0 0.5rem",
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
                      padding: "0.4rem 1.25rem",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#FF6B35" : "#2c2418",
                      textDecoration: "none",
                      borderLeft: isActive
                        ? "2px solid #FF6B35"
                        : "2px solid transparent",
                      background: isActive
                        ? "rgba(255,107,53,0.06)"
                        : "transparent",
                      transition: "color 120ms, background 120ms",
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

export default function DocsSlug() {
  const { post, allDocs, prev, next } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <DocsSidebar docs={allDocs} currentSlug={post.slug} />

        <main
          style={{
            flex: 1,
            maxWidth: 720,
            padding: "3rem 2.5rem",
            fontFamily: "DM Sans, sans-serif",
            color: "#2c2418",
          }}
        >
          <h1
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "0.75rem",
              color: "#2c2418",
            }}
          >
            {post.title}
          </h1>
          {post.description && (
            <p
              style={{
                fontSize: "1.1rem",
                color: "rgba(44,36,24,0.6)",
                marginBottom: "2.5rem",
                lineHeight: 1.6,
              }}
            >
              {post.description}
            </p>
          )}

          <style>{`
            .doc-prose { line-height: 1.75; }
            .doc-prose h1, .doc-prose h2, .doc-prose h3 {
              font-family: 'Bricolage Grotesque', sans-serif;
              color: #2c2418;
              margin: 2rem 0 0.75rem;
              line-height: 1.25;
            }
            .doc-prose h1 { font-size: 1.75rem; }
            .doc-prose h2 { font-size: 1.375rem; }
            .doc-prose h3 { font-size: 1.1rem; }
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
            .doc-prose hr { border: none; border-top: 1px solid rgba(44,36,24,0.1); margin: 2rem 0; }
          `}</style>

          <article
            className="doc-prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Prev / Next */}
          {(prev || next) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "3rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(44,36,24,0.1)",
                gap: "1rem",
              }}
            >
              {prev ? (
                <Link
                  to={`/docs/${prev.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "#2c2418",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "rgba(44,36,24,0.45)", display: "block", fontSize: "0.75rem", marginBottom: 2 }}>
                    ← Previous
                  </span>
                  <span style={{ color: "#FF6B35", fontWeight: 500 }}>{prev.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  to={`/docs/${next.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "#2c2418",
                    fontSize: "0.9rem",
                    textAlign: "right",
                  }}
                >
                  <span style={{ color: "rgba(44,36,24,0.45)", display: "block", fontSize: "0.75rem", marginBottom: 2 }}>
                    Next →
                  </span>
                  <span style={{ color: "#FF6B35", fontWeight: 500 }}>{next.title}</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
