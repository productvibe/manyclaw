import { useLoaderData } from "react-router";
import type { Route } from "./+types/slug";
import { data } from "react-router";
import Layout from "~/components/Layout";
import { getPost } from "~/lib/content";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost("blog", params.slug);
  if (!post) throw data("Not found", { status: 404 });
  return { post };
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", fontFamily: "DM Sans, sans-serif" }}>
        <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "0.5rem" }}>{post.date}</p>
        <h1 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "2.75rem", marginBottom: "0.75rem", color: "#2c2418" }}>{post.title}</h1>
        <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "2.5rem" }}>{post.description}</p>
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.html }}
          style={{ lineHeight: 1.75, color: "#2c2418" }}
        />
      </main>
    </Layout>
  );
}
