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
                Quick clarity on when this coverage calculator is the right
                choice, and when it is not.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Converting a known area into the unit you need and estimating
                  how many units of material to plan for using a coverage rate,
                  coats, and a waste buffer.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why this tool is different
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It keeps decimal precision end-to-end and shows the same area
                  in multiple units so you can sanity-check before buying
                  material.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is not for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It is not a product-specific estimator for surface conditions,
                  depth targets, compaction, or local requirements. Use your
                  product label guidance to choose the right coverage rate.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  When to use another tool
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  If you only need a fast unit conversion with no estimating,
                  use the{" "}
                  <span className="font-semibold text-slate-900">
                    Area Converter
                  </span>{" "}
                  instead.
                </p>

                <div className="mt-3">
                  <Link
                    to="/area-converter"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Open Area Converter
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  If that page does not exist on your site yet, remove this
                  card.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Typical use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  A paint label lists coverage in ft² per gallon, but your plan
                  is written in m².
                </li>
                <li>
                  You are planning two coats and want a built-in waste margin.
                </li>
                <li>
                  You want a quick cross-check between ft², m², yd², acres, or
                  hectares to catch a unit mismatch.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
