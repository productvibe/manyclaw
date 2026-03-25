import type { Config } from "@react-router/dev/config"
import matter from "gray-matter"

export default {
  ssr: false,
  async prerender() {
    const blogFiles = import.meta.glob("../content/blog/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>
    const docsFiles = import.meta.glob("../content/docs/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>

    function getSlug(filePath: string, raw: string): string {
      const { data } = matter(raw)
      return (data.slug as string) ?? filePath.split("/").pop()!.replace(/\.md$/, "")
    }

    const blogSlugs = Object.entries(blogFiles).map(([p, r]) => getSlug(p, r))
    const docsSlugs = Object.entries(docsFiles).map(([p, r]) => getSlug(p, r))

    return [
      "/",
      "/about",
      "/download",
      "/blog",
      ...blogSlugs.map(s => `/blog/${s}`),
      ...docsSlugs.map(s => `/docs/${s}`),
    ]
  },
} satisfies Config
