export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this page?",
      a: "Coverage is how much area a given amount of material can cover. For example, paint might cover 350 ft² per gallon, or mulch might be planned as a depth that implies a volume calculation. This page focuses on area conversions and a simple area-per-unit estimate.",
    },
    {
      q: "What does the area calculator do?",
      a: "It converts the same area between common units like ft², m², acres, and hectares using exact unit definitions (for example, 1 inch = 0.0254 meters exactly).",
    },
    {
      q: "How does the material estimate work?",
      a: "If you enter a coverage rate (area per unit), we estimate units needed as: (area ÷ coverage) × coats × (1 + waste%). This is a simple estimate and does not account for surface texture, compaction, overlap, or product-specific instructions.",
    },
    {
      q: "Does the calculator preserve decimals?",
      a: "Yes. We parse and compute using decimal-safe math (not floating point). Optional rounding is display-only and clearly labeled.",
    },
    {
      q: "Can I save the results?",
      a: "Yes. Your inputs and display settings are saved locally in your browser so you can come back later.",
    },
    {
      q: "Is this good for paint, soil, mulch, gravel, and concrete?",
      a: "It is useful for the area part of the estimate and for simple coverage rates. For depth-based materials (soil, mulch, gravel, concrete), you may still need a volume calculator based on thickness and material density.",
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

            <div className="mt-2 text-slate-700 leading-relaxed max-w-prose">
              {f.a}
            </div>
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
