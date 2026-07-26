import type { Route } from "./+types/editorial-policy";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "Standards for researching, testing, documenting, reviewing, and updating Coverage Calculators content.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Editorial Policy | Coverage Calculators", description, path: "/editorial-policy" });

export default function EditorialPolicyPage() {
  return (
    <ContentPage title="Editorial Policy" description={description} path="/editorial-policy">
      <ContentSection title="Purpose and responsibility">
        <p>Coverage Calculators publishes practical estimation tools and supporting explanations. Suhas Sunder is currently the creator and maintainer; the site does not claim a separate editorial staff or independent professional review where none exists.</p>
      </ContentSection>
      <ContentSection title="Research and formula standards">
        <p>Authoritative or primary references are preferred. Formulas, unit definitions, material assumptions, rounding rules, and meaningful limitations should be disclosed where users need them to interpret an output.</p>
      </ContentSection>
      <ContentSection title="Review and numerical checks">
        <p>Pages should receive human review before publication. Numerical examples should be tested against calculator output, and updates should keep formulas, examples, tables, and related explanations consistent. Review dates must not change without a real review.</p>
      </ContentSection>
      <ContentSection title="Advertising and commercial independence">
        <p>Advertising does not determine calculator formulas or outputs. Sponsored relationships must not deceptively alter results. If affiliate links are introduced later, they will be disclosed near the relevant content.</p>
      </ContentSection>
      <ContentSection title="Software-assisted drafting">
        <p>Software may assist with drafting, formatting, research organization, or testing. Suhas remains responsible for reviewing published content and calculation behavior. Software assistance is not a substitute for checking facts, formulas, sources, and examples.</p>
      </ContentSection>
      <ContentSection title="What the site will not publish">
        <p>Pages should not exist solely to target keyword variations. The site prohibits fake expertise, fabricated testimonials, invented ratings, unsupported accuracy claims, credential inflation, and claims of independent review that did not occur.</p>
      </ContentSection>
    </ContentPage>
  );
}

