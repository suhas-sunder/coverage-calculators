import type { Route } from "./+types/calculators";
import { Link } from "react-router";
import Breadcrumbs from "~/client/components/site/Breadcrumbs";
import JsonLd from "~/client/components/site/JsonLd";
import AdSlot from "~/client/components/advertising/AdSlot";
import { CALCULATORS, absoluteUrl } from "~/lib/site";
import { pageMeta } from "~/lib/seo";

const description =
  "Browse every available Coverage Calculators tool for area conversion, paint, mulch, gravel, topsoil, and compost estimates.";

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: "Material Coverage Calculators", description, path: "/calculators" });

export default function CalculatorsPage() {
  const categories = ["General", "Paint", "Landscaping"] as const;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Material Coverage Calculators",
    description,
    url: absoluteUrl("/calculators"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: CALCULATORS.map((calculator, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: calculator.title,
        url: absoluteUrl(calculator.path),
      })),
    },
  };

  return (
    <main className="bg-slate-50 text-slate-700">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs items={[{ label: "Home", path: "/" }, { label: "Calculators", path: "/calculators" }]} />
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 sm:text-4xl">
            Material Coverage Calculators
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Choose a calculator that matches the material and output you need.
            Each tool documents its inputs and assumptions; see the{" "}
            <Link to="/methodology" className="font-semibold text-sky-800 underline underline-offset-2">
              calculation methodology
            </Link>{" "}
            for the site-wide approach.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {categories.map((category) => {
            const calculators = CALCULATORS.filter((item) => item.category === category);
            if (!calculators.length) return null;
            return (
              <section key={category} aria-labelledby={`category-${category.toLowerCase()}`}>
                <h2 id={`category-${category.toLowerCase()}`} className="text-2xl font-bold text-sky-900">
                  {category}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {calculators.map((calculator) => (
                    <Link
                      key={calculator.path}
                      to={calculator.path}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <h3 className="font-bold text-sky-900">{calculator.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{calculator.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <AdSlot placementId="all-tools-banner" format="horizontal" minHeight={90} />
      </div>
      <JsonLd data={schema} />
    </main>
  );
}

