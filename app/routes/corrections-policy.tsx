import type { Route } from "./+types/corrections-policy";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "How Coverage Calculators reviews reports and corrects numerical, formula, unit, source, and content errors.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Corrections Policy | Coverage Calculators", description, path: "/corrections-policy" });

export default function CorrectionsPolicyPage() {
  return (
    <ContentPage title="Corrections Policy" description={description} path="/corrections-policy">
      <ContentSection title="Report an error">
        <p>Use the <Link to="/contact">contact page</Link> to report a numerical, formula, unit-conversion, source, example, or explanatory error. Include the calculator URL, the inputs used, the result shown, and what you expected when possible.</p>
      </ContentSection>
      <ContentSection title="How reports are reviewed">
        <p>Reports are reproduced against the current calculator, then checked against the implemented formula, unit definitions, documented assumptions, examples, and relevant sources.</p>
      </ContentSection>
      <ContentSection title="How confirmed errors are corrected">
        <p>A confirmed error is corrected at its source. Calculator logic, numerical examples, tables, metadata, and related explanations are updated together where they are affected, followed by proportionate validation.</p>
      </ContentSection>
      <ContentSection title="Review dates">
        <p>A meaningful correction may be reflected in a page’s review date after the affected content has actually been reviewed. Typography and formatting fixes are not presented as major content reviews.</p>
      </ContentSection>
    </ContentPage>
  );
}

