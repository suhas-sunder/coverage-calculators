export default function FAQ() {
  const faqData = [
    {
      q: "What does “coverage” mean on this topsoil calculator?",
      a: "On this page, “coverage” means how much ground area you’re filling or topdressing and the resulting topsoil volume you need at a chosen thickness (depth). The calculator finds the footprint area from your selected shape (square, rectangle, circle, triangle, or border variants), converts your thickness into the same length basis, then computes volume as: volume = area × thickness. That volume is shown in ordering-friendly units like cubic yards (bulk), cubic feet (common bag labels), cubic meters (metric quotes), and liters (quick metric checks).",
    },
    {
      q: "Depth vs thickness: which word is correct for topsoil?",
      a: "Both are correct in this context. You’re entering the vertical amount of topsoil to add on top of the ground surface. Many sites say “depth” because it’s the depth of the layer, while others say “thickness” because it’s the thickness of the added topsoil. The important part is the meaning: the thickness of the layer you plan to add (for example, 2 in, 3 in, or 5 cm).",
    },
    {
      q: "What’s the difference between area and volume in this tool?",
      a: "Area describes the footprint on the ground (for example, a rectangle that is 20 ft × 8 ft). Volume describes how much topsoil you need once you choose a thickness (for example, a 2 in topdressing layer). Topsoil is purchased by volume, so thickness is what turns “footprint” into “how much to buy.”",
    },
    {
      q: "What formulas does the calculator use for topsoil?",
      a: "It uses standard geometry for area, then multiplies by thickness for volume. Examples: Rectangle area A = length × width. Square area A = side². Circle area A = π × r². Triangle area A = (base × height) ÷ 2. Border shapes subtract an inner cutout area from an outer area (A = Aouter − Ainner). Then volume is V = A × thickness. If you set a waste percent, it’s applied to volume as: Vw = V × (1 + waste% ÷ 100).",
    },
    {
      q: "Why is there a “waste %” option for topsoil?",
      a: "Waste % is a planning buffer. It helps cover low spots, minor grade variation, spreading losses, and the fact that real yards are rarely perfectly flat. If you’re doing leveling or filling uneven areas, a buffer can prevent coming up short. If your surface is flat and you’re confident in measurements, you can set waste to 0%.",
    },
    {
      q: "Can I mix units like feet for dimensions and inches or centimeters for thickness?",
      a: "Yes. Many projects use mixed units (for example, dimensions in ft and thickness in in, or dimensions in m and thickness in cm). The calculator converts your inputs internally so the math stays consistent. The key is that the unit selectors must match the numbers you typed. A correct number with the wrong selector is the fastest way to get a result that is off by a large factor (12× is common when inches vs feet are mixed).",
    },
    {
      q: "Circle inputs confuse me. Do I enter radius or diameter?",
      a: "This calculator’s circle shape uses radius (center to edge). If you measured across the full circle, you measured diameter, which must be divided by 2 to get radius before entering it. This matters because area uses r², so entering diameter as radius makes the result 4× too large.",
    },
    {
      q: "What does a “border” shape mean for topsoil?",
      a: "Border shapes are for areas with a cutout you are not filling with topsoil. Examples: topsoil around a patio cutout, around a shed slab, or a ring around a circular feature. The calculator treats it as: topsoil area = outer footprint area − inner cutout area. This prevents systematic overbuy when the center (or inner section) is not part of the area receiving topsoil.",
    },
    {
      q: "What output unit should I use: yd³, ft³, m³, or liters?",
      a: "Use the unit that matches how you’re buying. Bulk topsoil in the US/Canada is commonly quoted in cubic yards (yd³), while some suppliers quote in cubic meters (m³). Bagged products are often labeled by volume (commonly ft³ in North America, liters in many metric markets). If you are comparing prices, convert everything to the same volume unit before deciding.",
    },
    {
      q: "Why might my estimate not match what the supplier delivers exactly?",
      a: "This tool is geometry plus your chosen thickness. It does not model compaction after watering/rolling, moisture content (wet soil can be delivered denser), settling after spreading, slope correction, mixing into existing soil, or vendor rounding/minimum delivery amounts. Treat the number as a planning estimate, then apply judgment: add a buffer if you’re leveling or you expect uneven areas to eat volume.",
    },
    {
      q: "Can I save or export results?",
      a: "Inputs and display settings are saved locally in your browser so you can return later. If your UI includes Print / Save PDF, you can export exactly what you see for a supplier quote, a shopping list, or to plan delivery and wheelbarrow trips.",
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
