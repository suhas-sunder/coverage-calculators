import type { Route } from "./+types/sitemap";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { CALCULATORS, LEGAL_LINKS, MAIN_LINKS, TRUST_LINKS } from "~/lib/site";
import { pageMeta } from "~/lib/seo";

const description = "A human-readable directory of public Coverage Calculators pages and calculator tools.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "HTML Sitemap | Coverage Calculators", description, path: "/sitemap" });

function LinkList({ links }: { links: Array<{ path: string; label: string }> }) {
  return <ul>{links.map((link) => <li key={link.path}><Link to={link.path}>{link.label}</Link></li>)}</ul>;
}

export default function SitemapPage() {
  const main = [...MAIN_LINKS.map((item) => ({ ...item })), { path: "/contact", label: "Contact" }];
  const trust = Array.from(new Map(TRUST_LINKS.map((item) => [item.path, { ...item }])).values());
  const legal = [
    ...LEGAL_LINKS.map((item) => ({ ...item })),
    { path: "/cookies", label: "Cookie Policy" },
  ];
  return (
    <ContentPage title="HTML Sitemap" description={description} path="/sitemap">
      <ContentSection title="Main pages"><LinkList links={main} /></ContentSection>
      <ContentSection title="Calculators"><LinkList links={CALCULATORS.map((item) => ({ path: item.path, label: item.title }))} /></ContentSection>
      <ContentSection title="About and policies"><LinkList links={trust} /></ContentSection>
      <ContentSection title="Legal and accessibility"><LinkList links={legal} /></ContentSection>
    </ContentPage>
  );
}
