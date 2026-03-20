import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("download", "routes/download.tsx"),
  ...prefix("docs", [
    index("routes/docs/index.tsx"),
    route(":slug", "routes/docs/slug.tsx"),
  ]),
  ...prefix("blog", [
    index("routes/blog/index.tsx"),
    route(":slug", "routes/blog/slug.tsx"),
  ]),
] satisfies RouteConfig;
