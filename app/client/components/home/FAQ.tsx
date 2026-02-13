export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this page?",
      a: "On this page, “coverage” means the area a single unit of material can cover (area per unit). Examples: 350 ft² per gallon, 32 m² per bucket, 10 m² per liter. This tool converts area between units and (optionally) estimates how many units you need from that coverage rate.",
    },
    {
      q: "What’s the difference between converting area and estimating material?",
      a: "Area conversion just expresses the same area in another unit (ft² ↔ m², yd², acres, hectares, etc.). Estimating material uses your coverage rate (area per unit) plus coats and waste to approximate how many units to buy.",
    },
    {
      q: "How does the material estimate formula work?",
      a: "If you enter a coverage rate (area per unit), the calculator estimates: units = (area ÷ coverage rate) × coats × (1 + waste% ÷ 100). Your project area is automatically converted into the coverage rate’s area unit before the calculation.",
    },
    {
      q: "Why doesn’t my estimate match the product label exactly?",
      a: "Labels vary by surface texture, porosity, application method, thickness, and product type (paint vs primer vs sealer, etc.). This tool is math-only based on the numbers you enter. If a label provides multiple rates (smooth vs rough), use the one that matches your surface and scenario.",
    },
    {
      q: "Does the calculator preserve decimals accurately?",
      a: "Yes. Inputs are parsed and calculated using decimal-safe math (not floating point). If you enable rounding, rounding affects display only. The underlying conversions and estimate math still keep full precision.",
    },
    {
      q: "Can I mix units (ft² area with m² coverage labels)?",
      a: "Yes. You can enter your area in any supported unit and set the coverage rate’s area unit separately. The calculator converts your project area into the coverage unit automatically so the estimate stays consistent with the label.",
    },
    {
      q: "Can I build my total coverage area from multiple surfaces?",
      a: "Yes. Use the Coverage Area Builder to add multiple surfaces (and optional openings) and apply allowances like overlap and waste. The builder’s final total becomes the coverage area used for conversion and estimating.",
    },
    {
      q: "Is this tool good for mulch, gravel, soil, or concrete?",
      a: "It helps with area conversion and simple “area per unit” estimating. But many bulk materials are typically bought by volume (cubic yards/meters) based on depth. For those projects, a depth-based volume calculator is usually a better fit.",
    },
    {
      q: "Can I save or export results?",
      a: "Your inputs and display settings are saved locally in your browser so you can come back later. You can also use Print / Save PDF to export what you see.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="max-w-5xl mx-auto py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-sky-800 tracking-tight">
        Frequently Asked Questions
      </h2>

      <div className="divide-y divide-slate-200">
        {faqData.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none font-semibold text-lg text-sky-800 flex items-center justify-between hover:text-sky-900">
              <span>{f.q}</span>
              <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>

            <div className="mt-2 text-slate-700 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
