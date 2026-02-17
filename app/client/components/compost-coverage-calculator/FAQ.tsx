export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this compost calculator?",
      a: "On this page, “coverage” means the ground footprint you’re applying compost to and the compost volume needed at a chosen depth (thickness). The calculator finds the footprint area from your selected shape (square, rectangle, circle, triangle, or border variants), converts your depth into the same unit basis, then computes volume as: volume = area × depth. Results are shown in ordering-friendly units like cubic yards (bulk), cubic feet (common bag labels), cubic meters (metric quotes), and liters.",
    },
    {
      q: "Depth vs thickness: which word is correct for compost?",
      a: "Both are correct here. You’re entering the vertical thickness of compost you plan to add on top of the surface (for example, 1 in, 2 in, or 5 cm). The key is that it’s the added layer, not the total soil depth that already exists.",
    },
    {
      q: "What’s the difference between area and volume in this tool?",
      a: "Area describes the footprint on the ground (for example, a bed that is 20 ft × 8 ft). Volume describes how much compost you need once you choose a depth (for example, a 2 in layer). Compost is purchased by volume, so depth is what converts “footprint” into “how much to buy.”",
    },
    {
      q: "What formulas does the calculator use for compost volume?",
      a: "It uses standard geometry for area, then multiplies by depth for volume. Examples: Rectangle area A = length × width. Square area A = side². Circle area A = π × r². Triangle area A = (base × height) ÷ 2. Border shapes subtract an inner cutout area from an outer area (A = Aouter − Ainner). Then volume is V = A × depth. If you set a waste percent, it’s applied to volume as: Vw = V × (1 + waste% ÷ 100).",
    },
    {
      q: "Why is there a “waste %” option for compost?",
      a: "Waste % is a planning buffer. It helps cover uneven ground, minor grade variation, spill/loss during spreading, and the fact that real beds and lawns rarely match perfect shapes. If you’re topdressing a lawn or leveling low spots, a buffer helps prevent coming up short. If your surface is flat and you’re confident in measurements, you can set waste to 0%.",
    },
    {
      q: "Can I mix units like feet for dimensions and inches or centimeters for depth?",
      a: "Yes. Many projects use mixed units (for example, dimensions in ft and depth in in, or dimensions in m and depth in cm). The calculator converts inputs internally so the math stays consistent. The critical part is that the unit selectors must match the numbers you typed. A correct number with the wrong selector can throw results off by a large factor (12× is common when inches vs feet are mixed).",
    },
    {
      q: "Circle inputs confuse me. Do I enter radius or diameter?",
      a: "This calculator uses radius (center to edge). If you measured across the full circle, you measured diameter, which must be divided by 2 before entering it. This matters because area uses r², so entering diameter as radius makes the result 4× too large.",
    },
    {
      q: "What does a “border” shape mean for compost?",
      a: "Border shapes are for areas where you’re applying compost around a cutout you’re not covering. Examples: compost around a patio cutout, around a shed slab, or a ring around a tree/feature. The calculator treats it as: compost area = outer footprint area − inner cutout area, so you don’t overbuy by counting space that isn’t receiving compost.",
    },
    {
      q: "What output unit should I use: yd³, ft³, m³, or liters?",
      a: "Use the unit that matches how you’re buying. Bulk compost in the US/Canada is commonly quoted in cubic yards (yd³), while some suppliers quote in cubic meters (m³). Bagged compost is often labeled by volume (commonly ft³ in North America, liters in many metric markets). If you’re comparing prices, convert everything to the same volume unit first.",
    },
    {
      q: "Why might my estimate not match bag coverage claims or what a supplier delivers exactly?",
      a: "This tool is geometry plus your chosen depth. It does not model compaction during spreading, settling after watering, shrinkage as compost dries, uneven absorption into turf, blending/mixing into existing soil, or vendor rounding/minimum delivery amounts. Bag “covers X sq ft” claims can vary because compost texture and moisture change how fluffy vs compacted the material is. Treat the result as a planning estimate and add a buffer if you’re leveling or expect uneven areas.",
    },
    {
      q: "What’s the compost weight calculator doing, and why can weight vary so much?",
      a: "The optional weight estimate multiplies your computed volume (in m³) by the density you enter. Compost density varies widely with moisture, screening, and blend (woody compost vs manure/plant blends). If you have a supplier spec sheet, use their density for the best estimate.",
    },
    {
      q: "Can I save or export results?",
      a: "Inputs and display settings are saved locally in your browser so you can come back later. You can also use Print / Save PDF to export what you see for planning, shopping, or a supplier quote.",
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
