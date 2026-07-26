export const SITE_NAME = "Coverage Calculators";
export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL || "https://www.coveragecalculators.com"
).replace(/\/+$/, "");
export const SITE_DESCRIPTION =
  "Practical estimation tools for material coverage, quantity, area, volume, weight, package counts, and project planning.";

export type CalculatorLink = {
  path: string;
  title: string;
  shortTitle: string;
  description: string;
  category: "General" | "Paint" | "Landscaping";
};

export const CALCULATORS: CalculatorLink[] = [
  {
    path: "/",
    title: "Coverage Calculator",
    shortTitle: "General Coverage",
    description:
      "Convert area units and estimate material quantity from a product coverage rate.",
    category: "General",
  },
  {
    path: "/paint-coverage-calculator",
    title: "Paint Coverage Calculator",
    shortTitle: "Paint Coverage",
    description:
      "Estimate paint for walls, rooms, ceilings, fences, and siding.",
    category: "Paint",
  },
  {
    path: "/mulch-coverage-calculator",
    title: "Mulch Coverage Calculator",
    shortTitle: "Mulch Coverage",
    description:
      "Estimate mulch volume, cubic yards, and optional bag quantities.",
    category: "Landscaping",
  },
  {
    path: "/gravel-coverage-calculator",
    title: "Gravel Coverage Calculator",
    shortTitle: "Gravel Coverage",
    description:
      "Estimate gravel volume and weight from dimensions, depth, and density.",
    category: "Landscaping",
  },
  {
    path: "/topsoil-coverage-calculator",
    title: "Topsoil Coverage Calculator",
    shortTitle: "Topsoil Coverage",
    description:
      "Estimate topsoil volume, cubic yards, and optional bag quantities.",
    category: "Landscaping",
  },
  {
    path: "/compost-coverage-calculator",
    title: "Compost Coverage Calculator",
    shortTitle: "Compost Coverage",
    description:
      "Estimate compost volume and package quantities for beds and other areas.",
    category: "Landscaping",
  },
];

export const MAIN_LINKS = [
  { path: "/", label: "Home" },
  { path: "/calculators", label: "Calculators" },
  { path: "/about", label: "About" },
  { path: "/methodology", label: "Methodology" },
] as const;

export const TRUST_LINKS = [
  { path: "/about", label: "About" },
  { path: "/methodology", label: "Methodology" },
  { path: "/editorial-policy", label: "Editorial Policy" },
  { path: "/corrections-policy", label: "Corrections Policy" },
  { path: "/contact", label: "Contact" },
] as const;

export const LEGAL_LINKS = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-of-service", label: "Terms" },
  { path: "/disclaimer", label: "Disclaimer" },
  { path: "/accessibility", label: "Accessibility" },
] as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`}`;
}
