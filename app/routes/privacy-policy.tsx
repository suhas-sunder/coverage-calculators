import type { Route } from "./+types/privacy-policy";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "How Coverage Calculators currently handles calculator inputs, local preferences, server data, analytics, advertising, and contact messages.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Privacy Policy | Coverage Calculators", description, path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy" description={description} path="/privacy-policy">
      <ContentSection title="Calculator inputs and accounts">
        <p>Coverage Calculators does not currently provide user accounts or a contact form. Calculator inputs are processed in the browser to produce results and are not intentionally submitted to a Coverage Calculators database.</p>
      </ContentSection>
      <ContentSection title="Local device storage">
        <p>Certain calculators may store preferences such as a custom label in browser storage on your device. This helps retain a setting between visits. You can remove this data through your browser’s site-data controls.</p>
      </ContentSection>
      <ContentSection title="Hosting and technical logs">
        <p>Hosting and network providers may process request data needed to deliver and secure the site, such as an IP address, browser information, requested URL, date and time, and diagnostic logs. Their handling is governed by their own policies.</p>
      </ContentSection>
      <ContentSection title="Analytics and cookies">
        <p>The current site does not mount an analytics provider in its page layout. If analytics is enabled later, this policy will be updated to identify the service and explain its use of cookies or similar technologies before it is described as active.</p>
      </ContentSection>
      <ContentSection title="Advertising">
        <p>The application currently includes empty placement architecture but does not load an advertising provider or display fake advertisements. If advertising is introduced, third-party vendors may use cookies or similar technologies and process information under their own privacy policies. This page and the <Link to="/cookies">cookie policy</Link> will be updated to reflect the actual integration.</p>
      </ContentSection>
      <ContentSection title="Messages and external links">
        <p>If you email the public contact address or contact Suhas through an external service, the information you provide is processed through that email or service provider. External sites have their own privacy practices.</p>
      </ContentSection>
      <ContentSection title="Privacy questions and changes">
        <p>Use the <Link to="/contact">contact page</Link> for privacy questions. This policy may change when site features or providers change. It is a practical description of the current site, not jurisdiction-specific legal advice.</p>
      </ContentSection>
    </ContentPage>
  );
}
