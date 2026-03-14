import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/index";
import Layout from "~/components/Layout";
import { listPosts } from "~/lib/content";

export function loader(_: Route.LoaderArgs) {
  return { posts: listPosts("blog") };
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", fontFamily: "DM Sans, sans-serif" }}>
        <h1 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "2.5rem", marginBottom: "2.5rem" }}>Blog</h1>
        {posts.length === 0 && <p style={{ color: "#888" }}>No posts yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2rem" }}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <p style={{ fontSize: "0.875rem", color: "#888", margin: "0 0 0.25rem" }}>{post.date}</p>
                <h2 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "1.5rem", margin: "0 0 0.5rem", color: "#2c2418" }}>{post.title}</h2>
                <p style={{ color: "#555", margin: 0 }}>{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}
