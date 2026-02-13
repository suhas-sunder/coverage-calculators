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
                Use this page for two things: convert area units and estimate
                how many units of material you need from a coverage label.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  People who already have an area (from a room plan, yard
                  sketch, blueprint, or measurement) and need it in a different
                  unit, plus a quick quantity estimate using an “area per unit”
                  coverage rate.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Why this tool is different
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  It shows the same area in multiple units (ft², m², yd², acres,
                  hectares) so you can catch unit mismatches, and it keeps
                  decimal precision end-to-end (rounding is display-only).
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  This tool is not for
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Hyper-specific product modeling (surface texture, porosity,
                  depth targets, compaction, thickness, application technique).
                  If the product label gives multiple coverage rates, pick the
                  rate that matches your exact scenario.
                </p>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  If you need a paint-specific calculator
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  For paint projects, use the dedicated paint tool. This general
                  calculator stays flexible for different materials, while the
                  paint tool can be framed around paint-first inputs and labels.
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
                Typical use cases
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  You measured <span className="font-semibold">850 ft²</span>,
                  but the label coverage is in{" "}
                  <span className="font-semibold">m² per unit</span>, so you
                  convert first to match the label.
                </li>
                <li>
                  You have coverage like{" "}
                  <span className="font-semibold">350 ft² per gallon</span> (or{" "}
                  <span className="font-semibold">12 m² per unit</span>) and
                  want a quick plan with{" "}
                  <span className="font-semibold">2 coats</span> and{" "}
                  <span className="font-semibold">10%</span> waste.
                </li>
                <li>
                  A quote is in <span className="font-semibold">yd²</span> but
                  your plan is in <span className="font-semibold">ft²</span>, so
                  you convert and sanity-check with the breakdown cards.
                </li>
              </ul>
            </div>

            <div className="mt-2 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
              <div className="text-sm font-bold text-slate-900">
                Quick decision rule
              </div>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                If you have a single total area and a coverage label, use this
                page. If you want a paint-first flow, jump to{" "}
                <span className="font-semibold text-slate-900">
                  Paint Coverage Calculator
                </span>
                .
              </p>
              <div className="mt-3">
                <Link
                  to="/paint-coverage-calculator"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Go to Paint Coverage Calculator
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
