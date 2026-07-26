import { Link } from "react-router";
import JsonLd from "./JsonLd";
import { absoluteUrl } from "~/lib/site";

export type BreadcrumbItem = { label: string; path: string };

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-2">
              {index < items.length - 1 ? (
                <Link
                  to={item.path}
                  className="rounded hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-slate-800">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={schema} />
    </>
  );
}

