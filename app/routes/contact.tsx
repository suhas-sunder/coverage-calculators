// routes/contact.tsx
import type { Route } from "./+types/contact";

export const meta: Route.MetaFunction = () => [
  { title: "Contact | coveragecalculators.com" },
  {
    name: "description",
    content:
      "Contact coveragecalculators.com for feedback, corrections, or questions about our coverage and area calculators, assumptions, and results.",
  },
  { name: "robots", content: "index,follow" },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com/contact",
  },

  // Open Graph
  { property: "og:type", content: "website" },
  { property: "og:title", content: "Contact | coveragecalculators.com" },
  {
    property: "og:description",
    content:
      "Send feedback, corrections, or questions about our coverage and area calculators, assumptions, and results.",
  },
  {
    property: "og:url",
    content: "https://www.coveragecalculators.com/contact",
  },
  { property: "og:site_name", content: "coveragecalculators.com" },

  // Twitter
  { name: "twitter:card", content: "summary" },
  { name: "twitter:title", content: "Contact | coveragecalculators.com" },
  {
    name: "twitter:description",
    content:
      "Send feedback, corrections, or questions about our coverage and area calculators, assumptions, and results.",
  },
];

export default function Contact() {
  const pageName = "Contact";
  const canonicalUrl = "https://www.coveragecalculators.com/contact";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.coveragecalculators.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: canonicalUrl,
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "coveragecalculators.com",
    url: "https://www.coveragecalculators.com",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageName,
    url: canonicalUrl,
  };

  return (
    <main className="bg-white text-slate-700 antialiased min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-12 flex items-center">
        <div className="w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight text-center">
            Contact
          </h1>

          <p className="mt-4 text-slate-700 text-center max-w-2xl mx-auto leading-relaxed">
            This page is for feedback and corrections. If something looks off in
            a result, include the area you entered, the from and to units, and
            any coverage rate, coats, or waste settings you used (if
            applicable).
          </p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-slate-900">Email</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Send us a message at:
            </p>

            <p className="mt-4 text-base font-semibold text-slate-900">
              <a
                href="mailto:hello@coveragecalculators.com"
                className="cursor-pointer text-sky-700 hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
              >
                hello@coveragecalculators.com
              </a>
            </p>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                What to include
              </h3>
              <ul className="mt-2 list-disc ml-5 text-sm text-slate-700 space-y-1 leading-relaxed">
                <li>Area value and the unit you used</li>
                <li>From unit and to unit</li>
                <li>Coverage rate and its area unit (if using the estimate)</li>
                <li>Coats and waste % (if using the estimate)</li>
                <li>Your expected result (and why)</li>
                <li>A screenshot or URL of the page (optional)</li>
              </ul>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                coveragecalculators.com provides math-only conversions and
                estimates based on your inputs and the assumptions shown on the
                page. Results do not account for product-specific instructions,
                surface conditions, application technique, compaction, depth
                targets, or local requirements unless a tool explicitly says it
                does.
              </p>
            </div>
          </div>

          <p className="mt-10 text-xs text-slate-600 text-center leading-relaxed">
            Tools on this site are for informational, planning, and comparison
            purposes only. Results are estimates based on your inputs and the
            assumptions shown. This website does not provide professional,
            legal, or engineering advice. Always confirm specifications and
            requirements for your specific material and project.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </main>
  );
}
