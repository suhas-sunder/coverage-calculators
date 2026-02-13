export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage per coat” mean on paint cans?",
      a: "Paint labels usually list how much area one container covers for a single coat, such as “350 ft² per gallon per coat.” This calculator uses that exact meaning. If you are applying two coats, the required paint is roughly double (before any texture or waste adjustments).",
    },
    {
      q: "How do I use coverage numbers that are in a different unit than my measurements?",
      a: "Keep the coverage number and coverage unit exactly as written on the label. If your room is measured in ft² but the label is in m² per liter, enter your area in ft² and the coverage in m² per liter. The calculator converts units internally so the estimate stays correct.",
    },
    {
      q: "Should I use the high or low number when a label shows a coverage range?",
      a: "Use the lower number for safer planning. Coverage ranges are usually best-case vs real-world conditions. Using the lower value reduces the chance of underbuying paint.",
    },
    {
      q: "What is the surface texture adjustment and when should I use it?",
      a: "Surface texture adjustment is a practical planning buffer for rough or porous surfaces that absorb more paint than smooth drywall. Light texture might need about 10% more paint, rough or porous surfaces around 20%, and heavy texture or corrugated materials closer to 30%. This does not change your area; it adjusts the estimated paint needed.",
    },
    {
      q: "Do I enter total area for multiple sides or use coats?",
      a: "Either approach works as long as you stay consistent. For example, if you paint both sides of a fence, you can double the area and keep coats at 1, or enter one side’s area and set coats to 2. The math is the same. The key is not forgetting that both faces need coverage.",
    },
    {
      q: "Why does the estimate sometimes look higher than expected?",
      a: "Estimates increase when you add coats or texture adjustment, because more paint is realistically needed. Rough surfaces, porous materials, and multiple coats add up fast. The tool is designed to avoid optimistic underestimates that lead to extra trips to the store.",
    },
    {
      q: "Is the result rounded or exact?",
      a: "The math is done with preserved decimal precision. Rounding is display-only if you enable it. For buying paint, most people round up to whole cans to avoid running short.",
    },
    {
      q: "Can I use this for liters, gallons, quarts, or spray cans?",
      a: "Yes. Choose the paint unit that matches what you are buying (gallons, liters, quarts, spray cans, or a custom unit). Enter the coverage number from the label and pick the matching area unit. The calculator handles the conversions for you.",
    },
    {
      q: "How accurate is this compared to what I will actually use?",
      a: "This is a planning estimate based on label coverage, coats, and optional surface adjustment. Real usage depends on application method, paint type, primer, surface condition, and how heavily you apply each coat. Always buy a small buffer if your project cannot afford to run short.",
    },
    {
      q: "Should I include ceilings, doors, and windows in my area?",
      a: "Include only what you plan to paint. Most people exclude window glass and doors if they are not painting them. Ceilings are often estimated separately because they may use different paint and coverage rates.",
    },
    {
      q: "Can I use this calculator outside the US?",
      a: "Yes. The tool supports both metric and imperial units. In Canada and many other countries, labels are often in m² per liter. Enter your measurements in whatever unit you have and keep the coverage unit matched to the label. The estimate will still be correct.",
    },
    {
      q: "Does this replace manufacturer instructions?",
      a: "No. This tool follows the coverage numbers you provide. If a manufacturer specifies special rules for application, surface prep, thickness, or substrate, follow those instructions first and adjust your inputs to match your situation.",
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
    <section id="faq" className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-800 tracking-tight">
          FAQ
        </h2>

        <div className="mt-4 space-y-3">
          {faqData.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-800 flex items-center justify-between hover:text-slate-900">
                <span>{f.q}</span>
                <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
