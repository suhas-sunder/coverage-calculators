import { SITE_NAME, absoluteUrl } from "./site";

type PageMetaOptions = {
  title: string;
  description: string;
  path: string;
  robots?: string;
};

export function pageMeta({
  title,
  description,
  path,
  robots = "index,follow",
}: PageMetaOptions) {
  const canonical = absoluteUrl(path);
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { name: "author", content: "Suhas Sunder" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
  ];
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

