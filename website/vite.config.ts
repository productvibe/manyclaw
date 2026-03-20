import path from "node:path"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  resolve: {
    alias: {
      "/content": path.resolve(__dirname, "../content"),
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
})
