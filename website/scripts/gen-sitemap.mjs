import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const SITE = "https://manyclaw.app"
const contentRoot = path.resolve("../content")

function getSlugs(dir) {
  const folder = path.join(contentRoot, dir)
  if (!fs.existsSync(folder)) return []
  return fs.readdirSync(folder)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const { data } = matter(fs.readFileSync(path.join(folder, f), "utf8"))
      return data.slug ?? f.replace(/\.md$/, "")
    })
}

const routes = [
  "/",
  "/download",
  "/blog",
  ...getSlugs("blog").map(s => `/blog/${s}`),
  ...getSlugs("docs").map(s => `/docs/${s}`),
]

const today = new Date().toISOString().split("T")[0]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${SITE}${r}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join("\n")}
</urlset>
`

fs.writeFileSync("build/client/sitemap.xml", xml)
console.log(`✓ sitemap.xml written (${routes.length} URLs)`)
