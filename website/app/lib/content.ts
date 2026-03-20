import matter from "gray-matter";
import { marked } from "marked";

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

// Import all markdown files at build time (no filesystem needed at runtime)
const blogFiles = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const docsFiles = import.meta.glob("/content/docs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFile(
  filePath: string,
  raw: string
): { slug: string; data: Record<string, unknown>; content: string } {
  const fileName = filePath.split("/").pop()!.replace(/\.md$/, "");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? fileName;
  return { slug, data, content };
}

function getFiles(dir: "blog" | "docs"): Record<string, string> {
  return dir === "blog" ? blogFiles : docsFiles;
}

export function listPosts(dir: "blog" | "docs"): PostMeta[] {
  const files = getFiles(dir);
  const posts = Object.entries(files).map(([filePath, raw]) => {
    const { slug, data } = parseFile(filePath, raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: data.date ? String(data.date) : "",
      description: (data.description as string) ?? "",
      order: typeof data.order === "number" ? data.order : 0,
      section: (data.section as string) ?? "",
    };
  });

  if (dir === "docs") {
    return posts.sort((a, b) => a.order - b.order);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const renderer = new marked.Renderer();
renderer.heading = function ({
  text,
  depth,
}: {
  text: string;
  depth: number;
}) {
  const id = slugify(text);
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};

export async function getPost(
  dir: "blog" | "docs",
  slug: string
): Promise<Post | null> {
  const files = getFiles(dir);
  for (const [filePath, raw] of Object.entries(files)) {
    const parsed = parseFile(filePath, raw);
    if (parsed.slug === slug) {
      const html = await marked(parsed.content, { renderer });
      return {
        slug: parsed.slug,
        title: (parsed.data.title as string) ?? parsed.slug,
        date: parsed.data.date ? String(parsed.data.date) : "",
        description: (parsed.data.description as string) ?? "",
        order:
          typeof parsed.data.order === "number" ? parsed.data.order : 0,
        section: (parsed.data.section as string) ?? "",
        html,
      };
    }
  }
  return null;
}
