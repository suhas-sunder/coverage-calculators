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
                Use this gravel calculator to turn real measurements (shape +
                dimensions + depth) into a buy-ready volume in the units people
                actually shop and quote in.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Homeowners, DIYers, and contractors who have an area shape and
                  dimensions (square, rectangle, circle, triangle, or a border
                  cutout), plus a target depth, and want a fast volume estimate
                  in yd³/ft³/m³/L for buying gravel in bulk or in bags.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why this tool is different
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It is shape-first (not “enter area and hope it matches”), so
                  you can measure like people do in real life. The preview
                  diagrams reduce the common mistakes (radius vs diameter,
                  triangle height vs sloped side, forgetting to subtract a
                  cutout), and the output is shown in multiple volume units so
                  you can compare bulk quotes to bag math without mental
                  conversions.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is not for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Engineering-grade modeling of compaction behavior, soil
                  bearing capacity, slope correction, drainage design, or
                  layered build-ups. This is geometry + depth + optional waste
                  so you can plan and buy.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  If you need mulch coverage instead
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  If your goal is{" "}
                  <span className="font-semibold text-slate-900">
                    mulch (or soil) volume
                  </span>{" "}
                  from a shaped bed at a chosen depth, the mulch coverage tool
                  is the closer match. The gravel calculator is also volume
                  based, but mulch pages may include bag-specific assumptions
                  and copy tailored to landscaping beds.
                </p>

                <div className="mt-3">
                  <Link
                    to="/mulch-coverage-calculator"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Mulch Coverage Calculator
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  If you need another specialized tool later, use the site
                  navigation to browse the tool list.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Typical gravel use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  You are ordering{" "}
                  <span className="font-semibold">bulk gravel (yd³/m³)</span>{" "}
                  and want the same estimate also shown in{" "}
                  <span className="font-semibold">ft³/L</span> for quick sanity
                  checks.
                </li>
                <li>
                  You are building a{" "}
                  <span className="font-semibold">
                    driveway, pad, or walkway
                  </span>{" "}
                  and need volume from a clear footprint plus a target
                  thickness.
                </li>
                <li>
                  Your area wraps around something (slab, pad, post base), so
                  you need a <span className="font-semibold">border shape</span>{" "}
                  that subtracts the cutout instead of overbuying the full outer
                  footprint.
                </li>
                <li>
                  You are mixing units: footprint in{" "}
                  <span className="font-semibold">ft/yd or m</span> while depth
                  is in <span className="font-semibold">in or cm</span>. The
                  calculator handles the unit mix without manual conversions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
