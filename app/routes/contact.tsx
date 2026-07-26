import type { Route } from "./+types/contact";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import JsonLd from "~/client/components/site/JsonLd";
import { absoluteUrl } from "~/lib/site";
import { pageMeta } from "~/lib/seo";

const description = "Contact Coverage Calculators about feedback, calculator errors, tool suggestions, accessibility, or partnerships.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Contact Coverage Calculators", description, path: "/contact" });

export default function ContactPage() {
  const page = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Coverage Calculators",
    description,
    url: absoluteUrl("/contact"),
  };
  return (
    <>
      <ContentPage title="Contact Coverage Calculators" description="Send general feedback, report a calculator issue, suggest a useful tool, or ask about accessibility or partnerships." path="/contact">
        <ContentSection title="Email">
          <p>Email <a href="mailto:hello@coveragecalculators.com">hello@coveragecalculators.com</a>. There is no contact form, account, or support ticket system on this site.</p>
        </ContentSection>
        <ContentSection title="Calculator error reports">
          <p>Include the calculator URL, inputs, selected units, output shown, and expected result when possible. Reports may concern a formula, conversion, assumption, source, example, or explanation.</p>
        </ContentSection>
        <ContentSection title="Other feedback">
          <p>The same address can be used for general feedback, missing-calculator suggestions, accessibility feedback, and business or partnership inquiries.</p>
          <p>You can also reach Suhas through his <a href="https://www.suhassunder.com/" target="_blank" rel="noopener noreferrer">portfolio</a> or <a href="https://www.linkedin.com/in/s-sunder/" target="_blank" rel="noopener noreferrer">LinkedIn profile</a>.</p>
        </ContentSection>
      </ContentPage>
      <JsonLd data={page} />
    </>
  );
}
