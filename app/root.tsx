import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  Link,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import NavBar from "./client/components/navigation/NavBar";
import Footer from "./client/components/navigation/Footer";
import { CalculatorAdLayout } from "./client/components/advertising/AdSlot";
import { CALCULATORS } from "./lib/site";

/* ---------- Trailing slash helpers (one place, app-level) ---------- */
function needsStrip(pathname: string) {
  if (pathname === "/") return false;
  if (!/\/+$/.test(pathname)) return false;
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(last);
  return !looksLikeFile;
}
function strip(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/* ---------- Loader does the canonical 301 ---------- */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (needsStrip(url.pathname)) {
    url.pathname = strip(url.pathname);
    return redirect(url.pathname + url.search, { status: 301 });
  }
  return null;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavBar />
        {children}
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const calculatorPaths = new Set(CALCULATORS.map((calculator) => calculator.path));
  const outlet = <Outlet />;
  return calculatorPaths.has(location.pathname) ? (
    <CalculatorAdLayout>{outlet}</CalculatorAdLayout>
  ) : (
    outlet
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16 text-slate-700">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-4xl font-bold text-sky-900">{message}</h1>
      <p className="mt-3 text-lg text-slate-600">{details}</p>
      {isRouteErrorResponse(error) && error.status === 404 ? (
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/" className="rounded-xl bg-sky-700 px-4 py-2.5 font-semibold text-white hover:bg-sky-800">Home</Link>
          <Link to="/calculators" className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-sky-900 hover:bg-slate-50">All Calculators</Link>
        </div>
      ) : null}
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-lg bg-slate-950 p-4 text-slate-100">
          <code>{stack}</code>
        </pre>
      )}
      </div>
    </main>
  );
}
