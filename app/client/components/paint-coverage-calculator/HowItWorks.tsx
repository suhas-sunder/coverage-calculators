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
          {/* Header */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-center sm:text-left text-3xl sm:text-4xl font-extrabold text-sky-800 tracking-tight leading-tight">
                  How the paint coverage calculator works
                </h2>
                <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-2xl">
                  This calculator is built for real paint jobs, not just unit
                  conversions. You can calculate paintable area (including walls
                  and openings), convert that area into the units your label
                  uses, then estimate how much paint to buy using the coverage
                  printed on the can. Coats multiply the job size, and the
                  surface texture adjustment adds a practical buffer for rough
                  or porous surfaces.
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

            {/* Quick flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  INPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Walls, openings, or area
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CONVERT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Area unit sanity checks
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ESTIMATE
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Coverage per can + coats
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OUTPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Paint needed + breakdown
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
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
                      Examples you can copy exactly
                    </h3>
                    <p className="mt-1 text-slate-600">
                      Real scenarios with numbers, using the same controls you
                      see above.
                    </p>
                  </div>
                </div>

                {/* More visual, less grey */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* Example 1: US gallons */}
                  <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-sky-50 via-white to-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-sky-800">
                          US bedroom repaint (walls, door, window)
                        </div>
                        <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-800 ring-1 ring-sky-200/70 px-2.5 py-1 text-[11px] font-semibold">
                          Gallons + ft²
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        You measured a 12 ft by 10 ft bedroom with 8 ft walls.
                        There is one door and one window you are not painting.
                        You want two coats and you want to know what to buy
                        before you go back to the store.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Enter
                          </div>
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            <li>
                              Walls total:{" "}
                              <span className="font-semibold text-slate-900">
                                352 ft²
                              </span>{" "}
                              (2 × (12 + 10) × 8)
                            </li>
                            <li>
                              Openings (subtract): door{" "}
                              <span className="font-semibold text-slate-900">
                                20 ft²
                              </span>
                              , window{" "}
                              <span className="font-semibold text-slate-900">
                                15 ft²
                              </span>
                            </li>
                            <li>
                              Coats:{" "}
                              <span className="font-semibold text-slate-900">
                                2
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Coverage panel
                          </div>
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            <li>
                              Paint unit:{" "}
                              <span className="font-semibold text-slate-900">
                                Gallon
                              </span>
                            </li>
                            <li>
                              Coverage:{" "}
                              <span className="font-semibold text-slate-900">
                                350
                              </span>{" "}
                              ft² per gallon (per coat)
                            </li>
                            <li>
                              Surface texture:{" "}
                              <span className="font-semibold text-slate-900">
                                Smooth / normal
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          What you should expect
                        </div>
                        <p className="mt-2 text-sm text-slate-800">
                          Paintable area becomes{" "}
                          <span className="font-semibold text-slate-900">
                            317 ft²
                          </span>{" "}
                          after subtracting openings. With 2 coats, that is{" "}
                          <span className="font-semibold text-slate-900">
                            634 ft²
                          </span>{" "}
                          of coverage to plan for. At 350 ft² per gallon, the
                          estimate is about{" "}
                          <span className="font-semibold text-slate-900">
                            1.81 gallons
                          </span>
                          . In real life you would usually buy{" "}
                          <span className="font-semibold text-slate-900">
                            2 gallons
                          </span>{" "}
                          so you are not short.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example 2: Canada liters */}
                  <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-indigo-50 via-white to-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-sky-800">
                          Canada condo refresh (liters, metric label)
                        </div>
                        <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-800 ring-1 ring-slate-200 px-2.5 py-1 text-[11px] font-semibold">
                          Litres + m²
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        You already know your paintable wall area from your
                        building plan: 45 m². The paint label says coverage is
                        11 m² per 1 L (per coat). You are doing two coats on
                        lightly textured walls.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Enter
                          </div>
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            <li>
                              Area:{" "}
                              <span className="font-semibold text-slate-900">
                                45 m²
                              </span>
                            </li>
                            <li>
                              Coats:{" "}
                              <span className="font-semibold text-slate-900">
                                2
                              </span>
                            </li>
                            <li>
                              Area display unit:{" "}
                              <span className="font-semibold text-slate-900">
                                m²
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Coverage panel
                          </div>
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            <li>
                              Paint unit:{" "}
                              <span className="font-semibold text-slate-900">
                                Liter (L)
                              </span>
                            </li>
                            <li>
                              Coverage:{" "}
                              <span className="font-semibold text-slate-900">
                                11
                              </span>{" "}
                              m² per L (per coat)
                            </li>
                            <li>
                              Surface texture:{" "}
                              <span className="font-semibold text-slate-900">
                                Light texture (+10%)
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                          What you should expect
                        </div>
                        <p className="mt-2 text-sm text-slate-800">
                          The tool will estimate about{" "}
                          <span className="font-semibold text-slate-900">
                            9.0 L
                          </span>{" "}
                          total: (45 ÷ 11) × 2 × 1.10. If you are buying 1 L
                          cans, that usually means{" "}
                          <span className="font-semibold text-slate-900">
                            9 cans
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example 3: Mix label units */}
                  <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-amber-50 via-white to-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-sky-800">
                          Label is ft² per gallon, you bought 1 L cans
                        </div>
                        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-200/70 px-2.5 py-1 text-[11px] font-semibold">
                          Cross units
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        This is the common “international mismatch” problem. A
                        product page lists coverage as 350 ft² per gallon, but
                        the shelf has 1 L cans. You want the calculator to keep
                        the meaning of coverage correct while changing the
                        container unit.
                      </p>

                      <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700">
                        <li>
                          Set{" "}
                          <span className="font-semibold text-slate-900">
                            Paint unit
                          </span>{" "}
                          to{" "}
                          <span className="font-semibold text-slate-900">
                            Liters (L)
                          </span>
                          .
                        </li>
                        <li>
                          In{" "}
                          <span className="font-semibold text-slate-900">
                            Coverage (from your paint can)
                          </span>
                          , enter{" "}
                          <span className="font-semibold text-slate-900">
                            350
                          </span>{" "}
                          and set coverage area unit to{" "}
                          <span className="font-semibold text-slate-900">
                            Square feet (ft²)
                          </span>
                          .
                        </li>
                        <li>
                          Choose your coats (example:{" "}
                          <span className="font-semibold text-slate-900">
                            2
                          </span>
                          ) and calculate.
                        </li>
                      </ol>

                      <div className="mt-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Why this works
                        </div>
                        <p className="mt-2 text-sm text-slate-800">
                          Coverage meaning is always “area per 1 paint unit per
                          coat.” You are allowed to mix ft² (area) with liters
                          (container). The tool converts behind the scenes so
                          your estimate still makes sense.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Example 4: Cost estimate */}
                  <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-emerald-50 via-white to-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-sky-800">
                          Budget check before you buy (cost estimate)
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70 px-2.5 py-1 text-[11px] font-semibold">
                          Price planning
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        You already have the paint quantity estimate, but you
                        also want to know if you are about to spend $80 or $180.
                        Turn on the optional cost estimate and enter the price
                        for your selected paint unit.
                      </p>

                      <div className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200/70 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Example inputs
                        </div>
                        <ul className="mt-2 text-sm text-slate-700 space-y-1">
                          <li>
                            Paint unit:{" "}
                            <span className="font-semibold text-slate-900">
                              Gallon
                            </span>
                          </li>
                          <li>
                            Paint needed (example result):{" "}
                            <span className="font-semibold text-slate-900">
                              2.0 gallons
                            </span>
                          </li>
                          <li>
                            Enable cost estimate:{" "}
                            <span className="font-semibold text-slate-900">
                              On
                            </span>
                          </li>
                          <li>
                            Price per gallon:{" "}
                            <span className="font-semibold text-slate-900">
                              45
                            </span>
                          </li>
                        </ul>
                        <p className="mt-2 text-sm text-slate-700">
                          Expected output: the cost tiles will show an estimate
                          based on your unit price and the calculated quantity.
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Tip
                        </div>
                        <p className="mt-2 text-sm text-slate-800">
                          Use the rounding control for display if you want clean
                          currency-friendly numbers, but keep the underlying
                          precision intact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini notes block moved here, styled like your old Notes */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-800">
                    Notes that prevent underbuying
                  </div>
                  <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
                    <li>
                      Rough or porous surfaces often require more paint than
                      smooth drywall. A practical planning buffer is typically
                      10% for light texture, 20% for rough or porous, and 30%
                      for heavy texture or corrugated materials.
                    </li>
                    <li>
                      If the label shows a range (for example 300 to 400 ft² per
                      gallon), use the lower coverage number for a safer
                      estimate.
                    </li>
                    <li>
                      For fences or panels, include both sides if you are
                      painting both faces. If you want to model that as two
                      passes, you can set coats to 2.
                    </li>
                    <li>
                      If your result looks wildly wrong, use the area breakdown
                      tiles to sanity-check the units. Huge surprises are often
                      a unit mismatch, not a math issue.
                    </li>
                  </ul>
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
                      What this paint calculator gives you
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    This page is designed around how paint is actually sold and
                    labeled. First you get a clean painted area number you can
                    trust. Then you match the coverage label format (area per 1
                    unit, per coat) and the calculator estimates how many units
                    of paint you need, with coats and an optional surface
                    adjustment.
                  </p>

                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Calculate paintable area from walls, then subtract windows
                      and doors (openings)
                    </li>
                    <li>
                      Convert your area across common units (ft², m², yd², in²,
                      cm², acres, hectares) and use breakdown tiles for sanity
                      checks
                    </li>
                    <li>
                      Estimate paint needed using your can’s coverage rate, your
                      paint unit (gallon, quart, liter, spray can), and your
                      coat count
                    </li>
                    <li>
                      Add a practical buffer for rough or porous surfaces using
                      the surface texture adjustment
                    </li>
                    <li>
                      Optional cost estimate, plus rounding controls for cleaner
                      display when you want them
                    </li>
                    <li>Print or save a copy of results when you are done</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SectionCard: Measuring area */}
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
                      Measuring paintable area without overthinking it
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    Start with measurements you can take quickly. For walls, you
                    typically enter width and height for each wall. The
                    calculator totals them, then subtracts openings you add
                    (like windows and doors) if you are not painting them. This
                    is where the tool saves money: it keeps the “big number”
                    honest before you ever touch paint coverage.
                  </p>

                  <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Quick measuring tips people actually use
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                      <li>
                        If a wall has a sloped ceiling or a bump-out, break it
                        into rectangles and add them as separate wall entries.
                      </li>
                      <li>
                        If you are painting trim but not the window glass, treat
                        the opening as “subtract” only if you truly will not
                        paint that area.
                      </li>
                      <li>
                        If you will paint inside a closet, include it. People
                        often forget it and end up short.
                      </li>
                    </ul>
                  </div>

                  <p>
                    Once the paintable area looks right, the conversion and
                    coverage steps become simple. If your result looks wildly
                    smaller or larger than expected, the breakdown cards help
                    you catch unit mistakes fast.
                  </p>
                </div>
              </div>
            </div>

            {/* SectionCard: Coverage + coats + texture */}
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
                      Turning label coverage into “how much paint to buy”
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p>
                    The Coverage panel is where you match what your paint can
                    says. Look for wording like “Covers up to 350 ft² per gallon
                    per coat” or “10 m²/L.” Enter the coverage number, then pick
                    the matching coverage area unit. The calculator will convert
                    your paintable area into those same units behind the scenes,
                    then divide by the coverage rate and multiply by coats.
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      A simple purchasing walkthrough
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      Say you measured a room and the calculator shows 680 ft²
                      paintable area after subtracting openings. Your paint
                      label says “350 ft² per gallon per coat,” and you want two
                      coats. You set Paint unit to Gallons, enter 350, choose
                      Square feet, set coats to 2, then calculate. The “Paint
                      needed” card shows your total, and “Per coat” gives you a
                      gut check that it makes sense.
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      If the label shows a range, use the lower number for a
                      safer estimate. “Up to 400 ft²” is usually the best-case
                      scenario.
                    </p>
                  </div>

                  <p>
                    Surface texture adjustment is your practical buffer when the
                    wall is rough, porous, or corrugated. Smooth drywall tends
                    to match label coverage more closely. Texture and porosity
                    often consume more paint because the surface is not flat and
                    the material absorbs more. The tool applies that adjustment
                    so you do not have to guess at checkout.
                  </p>

                  <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                    <div className="text-sm font-bold text-slate-900">
                      Typical texture planning buffers
                    </div>
                    <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                      <li>
                        Light texture: around 10% is a common planning buffer
                      </li>
                      <li>Rough or porous: around 20% is often reasonable</li>
                      <li>
                        Heavy texture or corrugated: around 30% is a safer
                        starting point
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-slate-700">
                      If your current surface setting adds extra paint, the
                      results area calls it out as an “adds per coat” number so
                      you can see the impact before you buy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark callout */}
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
                  Practical note
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-sky-300">
                  Estimates are planning numbers, not a guarantee
                </h3>
                <p className="mt-3 text-slate-200 leading-7">
                  This calculator gives you a clean estimate based on your
                  measurements, your label coverage, your coats, and your chosen
                  surface adjustment. Real coverage can vary with application
                  method, primer needs, color change, and how absorbent the
                  surface is. If you are on the fence, rounding up to the next
                  container is often cheaper than a second trip.
                </p>
                <p className="mt-3 text-slate-200 leading-7">
                  When you are done, use Print / Save PDF to keep a copy of your
                  numbers for the store or to share with someone helping you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
