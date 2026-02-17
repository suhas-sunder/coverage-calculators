export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this gravel calculator?",
      a: "On this page, “coverage” means how much ground area you are filling with gravel at a chosen depth, and the resulting gravel volume you need. The calculator finds the footprint area from your selected shape (square, rectangle, circle, triangle, or border variants), converts your depth into the same basis, then computes volume as: volume = area × depth. That volume can be shown in buying-friendly units like cubic yards (bulk), cubic feet, cubic meters (metric quotes), and liters.",
    },
    {
      q: "What’s the difference between area, volume, and weight in this tool?",
      a: "Area is the size of the surface footprint (for example, 20 ft × 8 ft). Volume is how much gravel you need once you choose depth (for example, a 3 in layer). Weight is an estimate derived from volume using an assumed density (for example, tons). Gravel is commonly purchased by volume (yd³/m³) or by weight (tons), so density is what connects those two.",
    },
    {
      q: "What formulas does the calculator use for gravel?",
      a: "The calculator uses standard geometry for area, then multiplies by depth for volume. Examples: Rectangle area A = length × width. Square area A = side². Circle area A = π × r². Triangle area A = (base × height) ÷ 2. Border shapes subtract an inner cutout area from an outer area (A = Aouter − Ainner). Then volume is V = A × depth. If you set a waste percent, it is applied to volume as: Vw = V × (1 + waste% ÷ 100). If you enable weight, it uses: weight = volume × density.",
    },
    {
      q: "What depth should I use for a gravel driveway, walkway, or base?",
      a: "It depends on the project and the gravel type. Walkways and patios often use a compacted base layer plus a thinner top layer. Driveways typically need more depth and often multiple layers. This calculator won’t tell you the “right” construction spec, but it will accurately convert your chosen footprint and depth into volume (and weight if density is set). Use local recommendations for base thickness and compaction, then plug those depths in.",
    },
    {
      q: "Why is there a “waste %” option for gravel?",
      a: "Waste % is a planning buffer. It helps cover uneven grade, edging loss, spillage, compaction variability, and measurement error. If your area is clean-edged and you’re confident in measurements, you can set waste to 0%. If the edges are irregular or you want to avoid coming up short, a modest buffer is common.",
    },
    {
      q: "Can I mix units like feet for dimensions and inches or centimeters for depth?",
      a: "Yes. Many projects use mixed units (for example, dimensions in ft and depth in in, or dimensions in m and depth in cm). The calculator converts your inputs internally so the math stays consistent. The key is that the unit selectors must match the numbers you typed. A correct number with the wrong selector can be off by a large factor (12× is common when inches vs feet are mixed).",
    },
    {
      q: "Circle inputs confuse me. Do I enter radius or diameter?",
      a: "This calculator’s circle shape uses radius (center to edge). If you measured across the full circle, you measured diameter, which must be divided by 2 to get radius before entering it. This matters because area uses r², so entering diameter as radius makes the result 4× too large.",
    },
    {
      q: "What does a “border” shape mean for gravel?",
      a: "Border shapes are for areas with a cutout you are not filling. Examples: a rectangular gravel area around a slab/patio cutout, or a circular ring area where the center is not part of the gravel surface. The calculator treats it as: gravel area = outer footprint area − inner cutout area. This prevents overbuying when the center is excluded.",
    },
    {
      q: "Why might my estimate not match a supplier’s delivery exactly?",
      a: "This tool is geometry plus depth (and optional density). It does not model compaction method, settling, moisture content, void space differences between stone types, slope correction, base-layer design, vendor rounding/minimums, or how a supplier defines a ‘ton’ or loads a truck. Treat the number as a planning estimate, then add a buffer if your project is sensitive to being short.",
    },
    {
      q: "Can I save or export results?",
      a: "Inputs and display settings are saved locally in your browser so you can return later. If your UI includes Print / Save PDF, you can export exactly what you see for a quote request, shopping list, or project notes.",
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
