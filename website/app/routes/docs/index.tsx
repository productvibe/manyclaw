import { redirect } from "react-router";
import type { Route } from "./+types/index";

export function clientLoader(_: Route.ClientLoaderArgs) {
  throw redirect("/docs/getting-started");
}

export default function DocsIndex() {
  return null;
}
