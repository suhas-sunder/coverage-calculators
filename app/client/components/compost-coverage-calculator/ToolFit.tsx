import { Link } from "react-router";

export default function ToolFit() {
  return (
    <section
      id="tool-fit"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
      aria-labelledby="tool-fit-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="min-w-0">
              <h2
                id="tool-fit-title"
                className="text-center sm:text-left text-3xl sm:text-4xl font-extrabold text-sky-800 tracking-tight leading-tight"
              >
                Who this tool is for
              </h2>
              <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-2xl">
                Use this compost calculator to turn real measurements (shape +
                dimensions + thickness) into a buy-ready compost volume for bulk
                delivery or bag purchases.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Homeowners, gardeners, and landscapers who know the footprint
                  they’re spreading{" "}
                  <span className="font-semibold text-slate-900">compost</span>{" "}
                  on (square, rectangle, circle, triangle, or border cutout),
                  plus a planned{" "}
                  <span className="font-semibold text-slate-900">
                    thickness (depth)
                  </span>
                  , and want a fast volume estimate in yd³/ft³/m³/L for buying
                  compost in bulk or in bags.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why this tool is different
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It’s shape-first (not “enter area and hope”), so you can
                  measure like people do in real life. The preview diagrams
                  reduce the classic errors (radius vs diameter, triangle height
                  vs sloped side, forgetting to subtract a cutout), and the
                  output shows multiple volume units so you can compare bulk
                  quotes to bag math without manual conversions.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is not for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Contractor-grade site modeling: compaction after watering,
                  moisture content changes, settling, slope correction, drainage
                  layers, tilling depth, or soil-test-driven nutrient planning.
                  This is{" "}
                  <span className="font-semibold text-slate-900">
                    geometry + thickness + optional waste
                  </span>{" "}
                  so you can plan and buy.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pick the right calculator for the material
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Use{" "}
                  <span className="font-semibold text-slate-900">compost</span>{" "}
                  when you’re topdressing a lawn, refreshing beds, or adding
                  organic matter. Use{" "}
                  <span className="font-semibold text-slate-900">mulch</span>{" "}
                  when your goal is surface cover for moisture and weeds. Use{" "}
                  <span className="font-semibold text-slate-900">
                    gravel/stone
                  </span>{" "}
                  when you need a durable mineral layer (paths, driveways,
                  drainage). Use{" "}
                  <span className="font-semibold text-slate-900">topsoil</span>{" "}
                  when you’re building up soil depth, filling, grading, or
                  creating a planting base.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/mulch-coverage-calculator"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Mulch Calculator
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    to="/gravel-coverage-calculator"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Gravel Calculator
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    to="/topsoil-coverage-calculator"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Topsoil Calculator
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Using the matching calculator keeps depth guidance, wording,
                  and expectations aligned with what you’re ordering.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Typical compost use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-semibold">Lawn topdressing</span> with a
                  thin compost layer, where the depth is small and unit mistakes
                  can blow up the order.
                </li>
                <li>
                  <span className="font-semibold">Garden bed refresh</span> by
                  spreading compost on top (and optionally mixing it in) to add
                  organic matter.
                </li>
                <li>
                  <span className="font-semibold">New bed prep</span> where you
                  want a consistent compost layer before planting.
                </li>
                <li>
                  Beds with <span className="font-semibold">cutouts</span>{" "}
                  (patio slab, shed pad, pavers) where a border shape prevents
                  overbuy.
                </li>
                <li>
                  You need to compare a{" "}
                  <span className="font-semibold">bulk quote</span> (yd³ or m³)
                  against <span className="font-semibold">bag volume</span> (ft³
                  or L) without manual conversions.
                </li>
              </ul>
            </div>

            <div className="mt-2 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
              <div className="text-sm font-bold text-slate-900">
                Quick “which one should I use?” guide
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compost
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Topdress lawn to improve soil</li>
                    <li>Refresh beds before planting</li>
                    <li>Add organic matter to soil</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mulch
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Surface cover for weeds/moisture</li>
                    <li>Decorative bark layer in beds</li>
                    <li>Tree ring cover layer</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gravel / stone
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Paths, patios, driveways</li>
                    <li>Drainage trenches / base layers</li>
                    <li>Decorative rock beds</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Topsoil
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Build up grade or fill low spots</li>
                    <li>Create a planting base layer</li>
                    <li>Leveling and thicker fills</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Rule of thumb: compost improves soil, mulch covers soil, gravel
                builds surfaces, and topsoil builds grade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
