import { useLoaderData } from "react-router";
import type { Route } from "./+types/slug";
import { data } from "react-router";
import Layout from "~/components/Layout";
import { getPost } from "~/lib/content.server";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPost("blog", params.slug);
  if (!post) throw data("Not found", { status: 404 });
  return { post };
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <main className="max-w-[720px] mx-auto px-6 py-16 font-sans">
        <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
        <h1 className="font-display text-[2.75rem] mb-3 text-foreground">{post.title}</h1>
        <p className="text-lg text-foreground/60 mb-10">{post.description}</p>
        <article
          className="doc-prose"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </main>
    </Layout>
  );
}
