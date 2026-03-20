import { redirect } from "react-router";
import type { Route } from "./+types/index";
import { listPosts } from "~/lib/content";

export function loader(_: Route.LoaderArgs) {
  const posts = listPosts("docs");
  if (posts.length > 0) {
    throw redirect(`/docs/${posts[0].slug}`);
  }
  return {};
}

export default function DocsIndex() {
  return null;
}
