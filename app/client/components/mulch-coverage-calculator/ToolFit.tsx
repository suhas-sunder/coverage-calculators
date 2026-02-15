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
                Use this mulch calculator to turn real measurements (shape +
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
                  Homeowners, DIYers, and landscapers who have a bed shape and
                  dimensions (square, rectangle, circle, triangle, or a border
                  cutout), plus a target depth, and want a fast volume estimate
                  in yd³/ft³/m³/L for buying mulch in bulk or in bags.
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
                  Contractor-grade modeling of compaction, settling over time,
                  slope correction, drainage rock layers, “fluffed bag” brand
                  differences, or site-specific install methods. This is
                  geometry + depth + optional waste so you can plan and buy.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  If you need an area or paint coverage calculator
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  If your problem starts with a known total area (ft²/m²) and a
                  product label that says “covers X per unit,” use the paint
                  coverage tool. The mulch calculator is for{" "}
                  <span className="font-semibold text-slate-900">
                    footprint → volume
                  </span>
                  : it starts with a shape, computes area, then converts depth
                  into volume.
                </p>

                <div className="mt-3">
                  <Link
                    to="/paint-coverage-calculator"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Paint Coverage Calculator
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  If you need another specialized tool later, use the site
                  navigation to browse the growing tool list.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Typical mulch use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  You are choosing between{" "}
                  <span className="font-semibold">bulk delivery (yd³/m³)</span>{" "}
                  and <span className="font-semibold">bags (ft³/L)</span>, and
                  you want one estimate that shows both so you can compare price
                  fairly.
                </li>
                <li>
                  You have a <span className="font-semibold">tree ring</span> or{" "}
                  <span className="font-semibold">circular bed</span> and want
                  to avoid the radius/diameter error that can blow the order up
                  by 4×.
                </li>
                <li>
                  Your bed wraps around something (patio, shed pad, utility
                  box), so you need a{" "}
                  <span className="font-semibold">border shape</span> that
                  subtracts the cutout instead of overbuying the full outer
                  footprint.
                </li>
                <li>
                  You are topping up a thin layer and depth is in{" "}
                  <span className="font-semibold">in or cm</span>, while the bed
                  dimensions are in{" "}
                  <span className="font-semibold">ft/yd or m</span>. The
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
