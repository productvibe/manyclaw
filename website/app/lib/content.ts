import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const contentRoot = path.resolve(process.cwd(), "content");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  order: number;
  section: string;
}

export interface Post extends PostMeta {
  html: string;
}

export function listPosts(dir: "blog" | "docs"): PostMeta[] {
  const folder = path.join(contentRoot, dir);
  if (!fs.existsSync(folder)) return [];
  const posts = fs
    .readdirSync(folder)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(folder, file), "utf8");
      const { data } = matter(raw);
      const slug = data.slug ?? file.replace(/\.md$/, "");
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ? String(data.date) : "",
        description: data.description ?? "",
        order: typeof data.order === "number" ? data.order : 0,
        section: data.section ?? "",
      };
    });

  // Docs: sort by order. Blog: sort by date descending.
  if (dir === "docs") {
    return posts.sort((a, b) => a.order - b.order);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(dir: "blog" | "docs", slug: string): Promise<Post | null> {
  const folder = path.join(contentRoot, dir);
  if (!fs.existsSync(folder)) return null;
  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(folder, file), "utf8");
    const { data, content } = matter(raw);
    const fileSlug = data.slug ?? file.replace(/\.md$/, "");
    if (fileSlug === slug) {
      const html = await marked(content);
      return {
        slug: fileSlug,
        title: data.title ?? fileSlug,
        date: data.date ? String(data.date) : "",
        description: data.description ?? "",
        order: typeof data.order === "number" ? data.order : 0,
        section: data.section ?? "",
        html,
      };
    }
  }
  return null;
}
