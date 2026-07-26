import type { Route } from "./+types/disclaimer";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "Plain-language limitations for calculator results, material quantities, cost estimates, and project decisions.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Calculator Disclaimer | Coverage Calculators", description, path: "/disclaimer" });

export default function DisclaimerPage() {
  return (
    <ContentPage title="Calculator Disclaimer" description={description} path="/disclaimer">
      <ContentSection title="Estimates, not final specifications">
        <p>Calculator results are informational estimates based on the inputs and assumptions shown. Real quantities can vary with supplier data, product specifications, site conditions, installation methods, moisture, density, compaction, coverage, and waste.</p>
      </ContentSection>
      <ContentSection title="Verify important decisions">
        <p>Check quantities before buying large, expensive, custom, or nonreturnable orders. Structural, regulated, safety-critical, or expensive decisions should be verified with the relevant manufacturer, supplier, project specifications, local requirements, or an appropriately qualified professional.</p>
      </ContentSection>
      <ContentSection title="Costs and professional advice">
        <p>Cost estimates are planning figures, not quotations. Coverage Calculators does not provide architectural, structural, engineering, contracting, legal, or financial advice.</p>
      </ContentSection>
    </ContentPage>
  );
}

