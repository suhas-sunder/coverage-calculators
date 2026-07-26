import type { Route } from "./+types/terms-of-service";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "Terms for informational use of Coverage Calculators, estimation limitations, acceptable use, intellectual property, and external links.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Terms | Coverage Calculators", description, path: "/terms-of-service" });

export default function TermsPage() {
  return (
    <ContentPage title="Terms" description={description} path="/terms-of-service">
      <ContentSection title="Informational use">
        <p>Coverage Calculators provides informational planning tools and explanatory content. Results are estimates based on the inputs and assumptions shown and are not final project specifications or professional advice.</p>
      </ContentSection>
      <ContentSection title="Your responsibility">
        <p>You are responsible for checking measurements, units, assumptions, product requirements, and quantities before acting on a result. Supplier quantities, prices, packaging, availability, site conditions, and project requirements may differ from calculator output.</p>
      </ContentSection>
      <ContentSection title="Intellectual property">
        <p>Original site software, design, and written content are protected to the extent provided by applicable law. Product names, specifications, and third-party materials remain the property of their respective owners. These terms do not claim ownership of facts, formulas, or rights that Coverage Calculators does not possess.</p>
      </ContentSection>
      <ContentSection title="Acceptable use">
        <p>You may use the public calculators for ordinary personal, educational, and business planning. Do not disrupt the service, attempt unauthorized access, introduce malicious code, evade security measures, excessively scrape the site in a way that degrades service, or reverse engineer protected systems where prohibited by applicable law.</p>
      </ContentSection>
      <ContentSection title="External links">
        <p>Links to manufacturers, portfolios, social profiles, or other third-party sites are provided for convenience. Coverage Calculators does not control their content, availability, terms, or privacy practices.</p>
      </ContentSection>
      <ContentSection title="Changes and contact">
        <p>These terms may change as the site evolves. Material changes will be reflected in the published page. Questions can be sent through the <Link to="/contact">contact page</Link>.</p>
      </ContentSection>
    </ContentPage>
  );
}
