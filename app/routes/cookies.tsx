import type { Route } from "./+types/cookies";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import { pageMeta } from "~/lib/seo";

const description = "How browser storage, cookies, analytics, and advertising technologies apply to the current Coverage Calculators site.";
export const meta: Route.MetaFunction = () => pageMeta({ title: "Cookie Policy | Coverage Calculators", description, path: "/cookies" });

export default function CookiesPage() {
  return (
    <ContentPage title="Cookie Policy" description={description} path="/cookies">
      <ContentSection title="Current use">
        <p>The site may use browser storage for limited calculator preferences. The current page layout does not mount an analytics provider or advertising provider, so this policy does not describe those services as active.</p>
      </ContentSection>
      <ContentSection title="Browser storage">
        <p>Browser storage can keep a preference on your device between visits. You can view, block, or remove site data through your browser settings. Removing it may reset saved calculator preferences.</p>
      </ContentSection>
      <ContentSection title="Future analytics or advertising">
        <p>If analytics or advertising is introduced, providers may use cookies or similar technologies for measurement, security, frequency control, or ad delivery. Coverage Calculators will update this policy and the <Link to="/privacy-policy">privacy policy</Link> to identify the actual service and available choices.</p>
      </ContentSection>
      <ContentSection title="Questions">
        <p>Use the <Link to="/contact">contact page</Link> with questions about site storage or privacy.</p>
      </ContentSection>
    </ContentPage>
  );
}
