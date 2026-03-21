import { useLoaderData, Link } from "react-router";
import type { MetaFunction } from "react-router";
import type { Route } from "./+types/index";
import Layout from "~/components/Layout";
import { listPosts } from "~/lib/content.server";

export const meta: MetaFunction = () => [
  { title: "Blog — ManyClaw" },
  { name: "description", content: "Updates, stories, and release notes from the ManyClaw team." },
];

export function loader(_: Route.LoaderArgs) {
  return { posts: listPosts("blog") };
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <main className="max-w-[720px] mx-auto px-6 py-16 font-sans">
        <h1 className="font-display text-4xl mb-10">Blog</h1>
        {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
        <ul className="list-none p-0 m-0 flex flex-col gap-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="no-underline text-inherit">
                <p className="text-sm text-muted-foreground mb-1">{post.date}</p>
                <h2 className="font-display text-2xl mb-2 text-foreground">{post.title}</h2>
                <p className="text-foreground/60 m-0">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}
