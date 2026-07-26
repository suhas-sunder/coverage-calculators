import type { Route } from "./+types/methodology";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description =
  "How Coverage Calculators handles formulas, unit conversions, material assumptions, rounding, testing, sourcing, and review.";

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: "Calculation Methodology | Coverage Calculators", description, path: "/methodology" });

export default function MethodologyPage() {
  return (
    <ContentPage title="Calculation Methodology" description={description} path="/methodology">
      <ContentSection title="1. How calculations are selected">
        <p>Each calculator starts with the practical quantity a user needs and a formula appropriate to the documented inputs. Formulas are shown on relevant calculator pages so users can check the method and reproduce the calculation.</p>
      </ContentSection>
      <ContentSection title="2. Formulas and unit conversions">
        <p>Calculation logic uses consistent conversion factors and avoids rounding intermediate values merely for display. Suhas implements the formulas, input validation, and unit conversions as software and checks that displayed numerical examples agree with calculator output.</p>
      </ContentSection>
      <ContentSection title="3. Material density and coverage assumptions">
        <p>Density varies by material, grading, moisture, compaction, and supplier. Product coverage also varies by manufacturer, product line, surface, application method, and number of coats. Editable assumptions are preferred where a single value would be misleading.</p>
      </ContentSection>
      <ContentSection title="4. Waste and compaction">
        <p>Waste and compaction settings are planning allowances, not universal recommendations. Users should adjust them to their site, material, cutting or placement method, and supplier guidance.</p>
      </ContentSection>
      <ContentSection title="5. Package and purchase rounding">
        <p>When material must be purchased as whole bags, cans, or other packages, purchase quantities are rounded up. Unrounded volume or weight remains useful for comparison and bulk orders.</p>
      </ContentSection>
      <ContentSection title="6. Cost estimates">
        <p>Cost estimates use prices entered by the user unless a calculator explicitly documents another source. They do not include taxes, delivery, minimum order charges, labor, availability, or price changes unless those inputs are shown.</p>
      </ContentSection>
      <ContentSection title="7. Numerical testing">
        <p>Implementation checks cover unit conversions, formula behavior, boundary inputs, rounding, and representative examples. A passing software test does not make a material assumption universally correct; users must still match assumptions to the product and project.</p>
      </ContentSection>
      <ContentSection title="8. Sources and references">
        <p>Primary or authoritative sources are preferred, including standards, manufacturer data, and established conversion definitions. Relevant sources and assumptions should be documented on the calculator page when they materially affect the result.</p>
      </ContentSection>
      <ContentSection title="9. Review and update process">
        <p>Calculator logic, examples, explanations, and references are reviewed together when a meaningful change is made. A review date is added or changed only after an actual review, not after a minor formatting edit.</p>
      </ContentSection>
      <ContentSection title="10. Limits of an estimate">
        <p>These tools support planning, not final specifications. High-cost, structural, regulated, or safety-critical work requires independent verification against product instructions, project documents, local requirements, suppliers, or qualified professionals.</p>
      </ContentSection>
    </ContentPage>
  );
}

