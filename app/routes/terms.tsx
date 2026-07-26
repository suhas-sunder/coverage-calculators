import type { Route } from "./+types/terms";
import { redirect } from "react-router";

export function loader(_: Route.LoaderArgs) {
  return redirect("/terms-of-service", { status: 301 });
}

export default function TermsRedirect() {
  return null;
}

