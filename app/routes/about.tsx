import type { Route } from "./+types/about";
import { Link } from "react-router";
import ContentPage, { ContentSection } from "~/client/components/site/ContentPage";
import JsonLd from "~/client/components/site/JsonLd";
import { absoluteUrl } from "~/lib/site";
import { pageMeta } from "~/lib/seo";

const description =
  "Learn who created Coverage Calculators and how its calculation tools are researched, implemented, tested, and maintained.";

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: "About Coverage Calculators and Suhas Sunder", description, path: "/about" });

export default function AboutPage() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Suhas Sunder",
    jobTitle: "Software Developer",
    url: absoluteUrl("/about"),
    sameAs: ["https://www.suhassunder.com/", "https://www.linkedin.com/in/s-sunder/"],
    knowsAbout: [
      "Software development",
      "Calculator implementation",
      "Unit conversion",
      "Numerical testing",
      "Electrical and computer engineering",
    ],
  };
  const page = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Coverage Calculators and Suhas Sunder",
    description,
    url: absoluteUrl("/about"),
    mainEntity: { "@id": absoluteUrl("/about") + "#suhas-sunder" },
  };

  return (
    <>
      <ContentPage
        title="About Coverage Calculators"
        description="Coverage Calculators was created by Suhas Sunder to provide practical, transparent tools for material and project estimates."
        path="/about"
        aside={
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm leading-6 text-slate-600">
            <h2 className="font-bold text-sky-900">Suhas Sunder</h2>
            <p className="mt-1">Creator and developer</p>
            <p>Software developer</p>
            <div className="mt-4 space-y-2">
              <a className="block font-semibold text-sky-800 underline" href="https://www.suhassunder.com/" target="_blank" rel="noopener noreferrer">Portfolio</a>
              <a className="block font-semibold text-sky-800 underline" href="https://www.linkedin.com/in/s-sunder/" target="_blank" rel="noopener noreferrer">LinkedIn profile</a>
            </div>
          </div>
        }
      >
        <ContentSection title="Who built the site">
          <p>
            Suhas Sunder is the creator and developer of Coverage Calculators.
            He is a software developer with a bachelor’s degree in Engineering
            and Management and a master’s degree in Electrical and Computer
            Engineering.
          </p>
          <p>
            He designs, implements, tests, documents, and maintains the site’s
            calculation tools. These credentials describe his software and
            technical background; the site does not present him as a contractor,
            licensed engineer, or licensed trade professional.
          </p>
        </ContentSection>

        <ContentSection title="How the calculators are developed">
          <p>
            The tools emphasize visible formulas and assumptions, consistent
            unit conversion, input validation, numerical examples, and outputs
            that support practical planning. Material-specific calculators
            expose relevant settings where one universal assumption would be
            misleading.
          </p>
          <p>
            Read the <Link to="/methodology">methodology</Link> and{" "}
            <Link to="/editorial-policy">editorial policy</Link> for the standards
            used when selecting formulas, references, and examples.
          </p>
        </ContentSection>

        <ContentSection title="Accuracy, assumptions, and limitations">
          <p>
            Real material estimates can change with density, moisture,
            compaction, surface condition, application method, package size,
            product specifications, waste, and installation practices. Inputs
            should match the actual product and site whenever possible.
          </p>
          <p>
            Large, structural, safety-critical, regulated, or high-cost projects
            should be checked against manufacturer instructions, supplier
            recommendations, project specifications, local requirements, or an
            appropriately qualified professional.
          </p>
        </ContentSection>

        <ContentSection title="Contact and corrections">
          <p>
            Feedback and error reports are welcome through the{" "}
            <Link to="/contact">contact page</Link>. Confirmed numerical or
            content errors are handled under the{" "}
            <Link to="/corrections-policy">corrections policy</Link>.
          </p>
        </ContentSection>
      </ContentPage>
      <JsonLd data={{ ...person, "@id": absoluteUrl("/about") + "#suhas-sunder" }} />
      <JsonLd data={page} />
    </>
  );
}

