import type { Route } from "./+types/accessibility";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "Accessibility goals and feedback options for Coverage Calculators forms, results, content, and navigation.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Accessibility | Coverage Calculators", description, path: "/accessibility" });

export default function AccessibilityPage() {
  return (
    <ContentPage title="Accessibility" description={description} path="/accessibility">
      <ContentSection title="Practical accessibility goals">
        <p>The site aims to provide keyboard-operable calculator forms, associated labels, clear validation, sufficient contrast, responsive text and layouts, semantic headings, accessible tables, and screen-reader-friendly result regions where supported.</p>
      </ContentSection>
      <ContentSection title="Ongoing work">
        <p>Accessibility is considered during implementation and maintenance, but the site does not claim independent certification or complete conformance. Browser, device, and assistive-technology combinations can behave differently.</p>
      </ContentSection>
      <ContentSection title="Accessibility feedback">
        <p>If a calculator or page is difficult to use, please <Link to="/contact">send accessibility feedback</Link>. Include the page, task, device, browser, and assistive technology if you are comfortable sharing those details.</p>
      </ContentSection>
    </ContentPage>
  );
}

