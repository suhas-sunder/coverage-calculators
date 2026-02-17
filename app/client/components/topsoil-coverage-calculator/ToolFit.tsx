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
                Use this topsoil calculator to turn real measurements (shape +
                dimensions + thickness) into a buy-ready volume for bulk
                delivery or bag purchases.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Homeowners, DIYers, and landscapers who know the footprint of
                  the area they’re adding topsoil to (square, rectangle, circle,
                  triangle, or border cutout), plus a target{" "}
                  <span className="font-semibold text-slate-900">
                    thickness (depth)
                  </span>
                  , and want a fast volume estimate in yd³/ft³/m³/L for ordering
                  topsoil in bulk or in bags.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why this tool is different
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It is shape-first (not “enter area and hope it matches”), so
                  you can measure like people do in real life. The preview
                  diagrams reduce the common errors (radius vs diameter,
                  triangle height vs sloped side, forgetting to subtract a
                  cutout), and the output shows multiple volume units so you can
                  compare bulk quotes to bag math without manual conversions.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is not for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Contractor-grade site modeling: soil compaction, moisture
                  content changes, settling after watering/rolling, slope
                  correction, mixing into existing soil, drainage/base layers,
                  or job-specific grading plans. This is{" "}
                  <span className="font-semibold text-slate-900">
                    geometry + thickness + optional waste
                  </span>{" "}
                  so you can plan and buy.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  If you’re actually buying mulch or gravel
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  If you’re covering a bed with{" "}
                  <span className="font-semibold text-slate-900">mulch</span> or
                  filling with{" "}
                  <span className="font-semibold text-slate-900">
                    gravel/stone
                  </span>
                  , use the dedicated tools. The topsoil calculator is for{" "}
                  <span className="font-semibold text-slate-900">
                    adding soil by thickness
                  </span>
                  : lawn topdressing, leveling low spots, building up a thin
                  layer for seeding, or filling planters and beds with soil.
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
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Use the tool that matches the material you’re ordering so the
                  examples, wording, and expectations line up with your project.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Typical topsoil use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-semibold">Topdressing a lawn</span> with
                  a thin layer (often measured in inches or centimeters) and you
                  want the volume for ordering bulk or bags.
                </li>
                <li>
                  <span className="font-semibold">Leveling low spots</span> in a
                  yard where thickness varies, so you add a small waste buffer
                  to avoid coming up short.
                </li>
                <li>
                  Filling or refreshing{" "}
                  <span className="font-semibold">garden beds</span> where you
                  can measure the footprint as a rectangle, circle, triangle, or
                  a border around a cutout (patio, pavers, shed slab).
                </li>
                <li>
                  You measure bed dimensions in{" "}
                  <span className="font-semibold">ft/yd or m</span> but the
                  layer thickness is in{" "}
                  <span className="font-semibold">in or cm</span>. The
                  calculator handles the unit mix and outputs in yd³/ft³/m³/L.
                </li>
                <li>
                  You need to compare a{" "}
                  <span className="font-semibold">bulk quote</span> (yd³ or m³)
                  against <span className="font-semibold">bag volume</span> (ft³
                  or L) without doing manual conversions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
