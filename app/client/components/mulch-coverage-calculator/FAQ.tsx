export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this mulch calculator?",
      a: "On this page, “coverage” means how much ground area you are covering with mulch at a chosen depth, and the resulting mulch volume you need. The calculator first finds the footprint area from your selected shape (square, rectangle, circle, triangle, or border variants). Then it converts your chosen depth into the same length basis and computes volume as: volume = area × depth. That volume is shown in buying-friendly units like cubic yards (bulk), cubic feet (common bag sizes), cubic meters (metric quotes), and liters (quick metric sanity checks).",
    },
    {
      q: "What’s the difference between area and volume in this tool?",
      a: "Area describes the size of the bed’s footprint on the ground (for example, a rectangle that is 20 ft × 8 ft). Volume describes how much mulch you need once you choose a depth (for example, a 3 in layer). Mulch is purchased by volume, so depth is the step that turns “footprint” into “how much to buy.”",
    },
    {
      q: "What formulas does the calculator use for mulch?",
      a: "The calculator uses standard geometry for area, then multiplies by depth for volume. Examples: Rectangle area A = length × width. Square area A = side². Circle area A = π × r². Triangle area A = (base × height) ÷ 2. Border shapes subtract an inner cutout area from an outer area (A = Aouter − Ainner). Then volume is V = A × depth. If you set a waste percent, it is applied to volume as: Vw = V × (1 + waste% ÷ 100).",
    },
    {
      q: "Why is there a “waste %” option for mulch?",
      a: "Waste % is a planning buffer, not a magic correction. It helps cover uneven grade, settling, rough edges, and small measurement error, which are the common reasons people end up short by a few bags or have to top up later. If your bed is clean-edged and level, you can set waste to 0%. If your bed is irregular, edged with stone, or you want to avoid a second trip, 5–15% is a common planning range.",
    },
    {
      q: "Can I mix units like feet for dimensions and inches or centimeters for depth?",
      a: "Yes. Many real projects use mixed units (for example, dimensions in ft and depth in in, or dimensions in m and depth in cm). The calculator converts your inputs internally so the math stays consistent. The key is that the unit selectors must match the numbers you typed. A correct number with the wrong selector is the fastest way to get a result that is off by a large factor (12× is common when inches vs feet are mixed).",
    },
    {
      q: "Circle inputs confuse me. Do I enter radius or diameter?",
      a: "This calculator’s circle shape uses radius (center to edge). If you measured across the full circle, you measured diameter, which must be divided by 2 to get radius before entering it. This matters because area uses r², so entering diameter as radius makes the result 4× too large.",
    },
    {
      q: "What does a “border” shape mean for mulch?",
      a: "Border shapes are for beds with a cutout you are not mulching. Examples: a rectangular bed that wraps around a patio section, or a circular tree ring where the trunk/inner circle is not mulched. The calculator treats it as: mulch area = outer footprint area − inner cutout area. This prevents overbuy when the center is not part of the mulched surface.",
    },
    {
      q: "What output unit should I use: yd³, ft³, m³, or liters?",
      a: "Use the unit that matches how you’re buying. Bulk mulch in the US is commonly quoted in cubic yards (yd³). Bagged mulch is commonly labeled by cubic feet (ft³). Many metric suppliers quote in cubic meters (m³), and liters are useful for small projects or for a quick reality check when you’re thinking in metric volume. If you are comparing prices, always convert to the same volume unit before deciding.",
    },
    {
      q: "Why might my estimate not match what the supplier delivers exactly?",
      a: "This tool is geometry plus depth. It does not model compaction, settling after rain, how “fluffy” a bag is compared to another brand, slope correction, drainage layers, or vendor rounding/minimum delivery amounts. Treat the number as a planning estimate, then apply judgment: add a buffer if your edges are messy or you know you’ll lose some depth after spreading.",
    },
    {
      q: "Can I save or export results?",
      a: "Inputs and display settings are saved locally in your browser so you can return later. If your UI includes Print / Save PDF, you can export exactly what you see for a receipt, a supplier quote, or a shopping list.",
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
