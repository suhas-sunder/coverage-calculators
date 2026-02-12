export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-center sm:text-left text-3xl sm:text-4xl font-extrabold text-sky-800 tracking-tight leading-tight">
                  How the coverage calculator works
                </h2>
                <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-2xl">
                  This tool helps you do two things with the same set of inputs:
                  convert an area between common units and estimate how many
                  units of material you need when you have a coverage rate. You
                  enter an area, pick the unit it is currently written in,
                  choose a target unit for the headline output, and optionally
                  add a coverage rate to estimate material quantity with coats
                  and waste.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Exact unit definitions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Display rounding only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  INPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Area + unit
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CONVERT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Unit → unit
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ESTIMATE
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Coverage rate
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OUTPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Results + breakdown
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            {/* SectionCard: Examples */}
            <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 19V5m0 14h16M8 15l3-3 3 3 6-6"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-sky-800 tracking-tight">
                      Examples
                    </h3>
                    <p className="mt-1 text-slate-600">
                      Common real-world scenarios and the exact way to use this
                      calculator.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Paint label in m², plan in ft²
                    </div>
                    <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-slate-700">
                      <li>Enter your room area (example: 850).</li>
                      <li>Set the area unit to Square feet (ft²).</li>
                      <li>Convert to Square meters (m²).</li>
                      <li>
                        Optional: enter a coverage rate that matches the label
                        unit (example: 10 m² per unit).
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Yard project written in m², supplier quotes in yd²
                    </div>
                    <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-slate-700">
                      <li>Enter your plan area (example: 40).</li>
                      <li>Set the area unit to Square meters (m²).</li>
                      <li>Convert to Square yards (yd²).</li>
                      <li>
                        Use the breakdown cards to sanity-check against ft² or
                        acres if needed.
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Multi-coat finish planning
                    </div>
                    <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-slate-700">
                      <li>Enter the area and select the correct unit.</li>
                      <li>
                        Enter the coverage rate from the product label (example:
                        350 ft² per unit).
                      </li>
                      <li>Set Coats to 2 if you are doing two coats.</li>
                      <li>
                        Add a waste buffer (example: 10%) if you want a planning
                        margin.
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Large land areas (acres and hectares)
                    </div>
                    <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-slate-700">
                      <li>Enter the area (example: 2.5).</li>
                      <li>Select Acres or Hectares as your input unit.</li>
                      <li>
                        Convert to m² or ft² to compare against product coverage
                        specs.
                      </li>
                      <li>
                        If your output looks tiny, you likely selected the wrong
                        input unit.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* SectionCard: What it does */}
            <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 7h16M4 12h12M4 17h14"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-sky-800 tracking-tight">
                      What this coverage calculator gives you
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    This page is built for quick, practical estimating. You can
                    use it as a pure area calculator or as a material quantity
                    estimator. The top controls convert your area between units
                    for measurement and planning. The optional coverage panel
                    uses a coverage rate (area per unit) to estimate how many
                    units of material you should plan to buy for the same area,
                    with support for coats (multiplier) and waste percent.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Convert between common area units used in home projects
                      and material specs (ft², m², yd², in², cm², acres,
                      hectares)
                    </li>
                    <li>
                      Preserve decimal precision end to end, then apply rounding
                      for display only when you choose to
                    </li>
                    <li>
                      Estimate material quantity when you know the coverage
                      rate, plus adjust for coats and waste
                    </li>
                    <li>
                      See a clean breakdown in other units for sanity checks and
                      quick cross-references
                    </li>
                  </ul>

                  <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      When to use each mode
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2">
                      <li>
                        Use{" "}
                        <span className="font-semibold text-slate-900">
                          area conversion
                        </span>{" "}
                        when your plan is written in one unit (for example, ft²)
                        but a product label is written in another (for example,
                        m²).
                      </li>
                      <li>
                        Use{" "}
                        <span className="font-semibold text-slate-900">
                          coverage estimating
                        </span>{" "}
                        when you have a coverage rate like “covers 350 ft² per
                        unit” or “25 m² per unit,” and you want a quantity
                        estimate.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SectionCard: Area input + conversion */}
            <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M9 6v12m6-12v12"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-sky-800 tracking-tight">
                      Area input and conversions
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    Start with the area value. Enter it exactly as you have it
                    from a room plan, a yard measurement, a blueprint, or a
                    product worksheet. Then choose the unit that value is
                    currently in using the area unit selector next to the input.
                    The headline result is shown in your chosen target unit.
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Valid input formats
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2">
                      <li>1000</li>
                      <li>1,000</li>
                      <li>1000.5</li>
                      <li>1,000.50</li>
                      <li>.5 (interpreted as 0.5)</li>
                      <li>12. (interpreted as 12)</li>
                    </ul>
                  </div>

                  <p>
                    The “From” unit is the unit your entered number represents.
                    The “To” unit is the unit you want to see in the primary
                    result. Swapping From and To reverses the conversion
                    direction. The tool also shows a breakdown of the same area
                    expressed in other common units, which is useful for quick
                    sanity checks.
                  </p>

                  <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Practical conversion checks
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2">
                      <li>
                        1 ft² = 144 in². If your breakdown looks off by a factor
                        of 144, your input unit is likely wrong.
                      </li>
                      <li>
                        1 m² ≈ 10.7639 ft². Large swings between m² and ft² are
                        expected because the base units differ in size.
                      </li>
                      <li>
                        Acres and hectares are large-area units. If you
                        accidentally input a small room in acres, the output
                        will look tiny.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SectionCard: Coverage rate estimate */}
            <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5v14"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-sky-800 tracking-tight">
                      Coverage estimating (optional)
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    If you know the coverage rate of a product, you can estimate
                    quantity directly from area. Coverage rate here means “area
                    per unit,” for example “350 ft² per unit” or “25 m² per
                    unit.” Enter the rate, select the rate’s area unit, and the
                    tool estimates the number of units you need for the entered
                    area.
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      The estimate formula used
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2">
                      <li>
                        Convert your project area into the coverage rate’s area
                        unit
                      </li>
                      <li>
                        Apply coats:{" "}
                        <span className="font-semibold text-slate-900">
                          adjusted area = area × coats
                        </span>
                      </li>
                      <li>
                        Apply waste:{" "}
                        <span className="font-semibold text-slate-900">
                          waste factor = 1 + (waste% ÷ 100)
                        </span>
                      </li>
                      <li>
                        Estimate units:{" "}
                        <span className="font-semibold text-slate-900">
                          units = (adjusted area × waste factor) ÷ coverage rate
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p>
                    The output is a math-only estimate based on your inputs. It
                    does not apply product-specific rules such as surface
                    porosity, texture, thickness, compaction, overlap, or
                    packing. If a manufacturer provides multiple coverage rates
                    (for example, smooth vs rough surfaces, or different
                    depths), use the rate that matches your scenario.
                  </p>

                  <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Typical ways people use coats and waste
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-semibold text-slate-900">
                          Coats
                        </span>{" "}
                        is most common for paint, sealers, primers, and
                        finishes. If you are applying two coats, set coats to 2
                        so the estimated area doubles.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-900">
                          Waste %
                        </span>{" "}
                        is a planning buffer. It is commonly used for offcuts,
                        overlap, imperfect coverage, and minor measurement
                        error. For many projects, 5 to 15% is a typical range,
                        but you can set it to 0 if you do not want a buffer.
                      </li>
                    </ul>
                  </div>

                  {/* Examples block for Coverage estimating */}
                  <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Coverage estimate examples
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Paint
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Area: 850 ft²</li>
                            <li>Coverage: 350 ft² per gallon</li>
                            <li>Coats: 2</li>
                            <li>Waste: 10%</li>
                          </ul>
                          <div className="mt-2 text-sm text-slate-700">
                            Result: estimated gallons = (850 ÷ 350) × 2 × 1.10
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Sealer in m²
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Area: 40 m²</li>
                            <li>Coverage: 12 m² per unit</li>
                            <li>Coats: 1</li>
                            <li>Waste: 5%</li>
                          </ul>
                          <div className="mt-2 text-sm text-slate-700">
                            Result: estimated units = (40 ÷ 12) × 1 × 1.05
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Tip: if your coverage label is in m² but your plan is in
                      ft², convert your area to m² first, then enter the
                      coverage rate in m² per unit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark callout block like the reference file */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl opacity-20" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl opacity-30" />
              </div>

              <div className="relative">
                <div className="text-sm font-semibold text-sky-300">
                  Utility note
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-sky-300">
                  Estimates are math-only planning outputs
                </h3>
                <p className="mt-3 text-slate-200 leading-7">
                  This calculator converts area using exact unit definitions and
                  estimates material quantity using the coverage rate, coats,
                  and waste values you provide. It does not account for product
                  variations, surface conditions, depth targets, compaction,
                  application technique, or local requirements. For purchasing,
                  always confirm coverage guidance on the specific product label
                  and adjust inputs to match your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
