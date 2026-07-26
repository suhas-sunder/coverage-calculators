import { Link } from "react-router";
import { CALCULATORS, LEGAL_LINKS, SITE_DESCRIPTION, TRUST_LINKS } from "~/lib/site";

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ path: string; label: string }>;
}) {
  return (
    <section aria-labelledby={`footer-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2
        id={`footer-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="text-sm font-bold uppercase tracking-wide text-white"
      >
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="rounded text-slate-300 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
export default function Footer() {
  const calculatorLinks = [
    { path: "/calculators", label: "All Calculators" },
    ...CALCULATORS.map((calculator) => ({
      path: calculator.path,
      label: calculator.title,
    })),
  ];

  return (
    <footer className="bg-sky-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterGroup title="Calculators" links={calculatorLinks} />
          <FooterGroup title="About" links={TRUST_LINKS} />
          <FooterGroup title="Legal" links={LEGAL_LINKS} />
          <FooterGroup
            title="Resources"
            links={[{ path: "/sitemap", label: "HTML Sitemap" }]}
          />
        </div>

        <div className="mt-10 border-t border-sky-900 pt-7">
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            {SITE_DESCRIPTION}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Coverage Calculators was created and is maintained by Suhas Sunder.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            © {new Date().getFullYear()} Coverage Calculators. Estimates should
            be checked against product and project requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}
