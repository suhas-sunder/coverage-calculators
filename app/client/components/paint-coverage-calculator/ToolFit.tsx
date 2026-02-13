export default function ToolFit() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 sm:pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-800 tracking-tight">
          What this tool is for
        </h2>

        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Use this page when you already know (or can estimate) your paintable
          area and want a fast, dependable paint quantity estimate using the
          coverage printed on your paint can (per coat).
        </p>

        {/* Quick intent tiles (keeps this section “fit” focused, not “how it works”) */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-[#f7fbff] p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Best for
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              Buying the right amount
            </div>
            <div className="mt-1 text-xs text-slate-600 leading-relaxed">
              “How many gallons or liters do I need for two coats?”
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#f7fbff] p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Works well when
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              Your area is already known
            </div>
            <div className="mt-1 text-xs text-slate-600 leading-relaxed">
              You have a room total, a spreadsheet, or a measured plan.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#f7fbff] p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Keep in mind
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              Labels are ideal-case
            </div>
            <div className="mt-1 text-xs text-slate-600 leading-relaxed">
              Rough, porous, or corrugated surfaces usually need more paint.
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-[#f7fbff] p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Good fit</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600 leading-relaxed">
              <li>
                Walls, rooms, and ceilings where you can measure total paintable
                area.
              </li>
              <li>Fences or siding when you already have an area estimate.</li>
              <li>Planning paint purchases from label coverage and coats.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#f7fbff] p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Not a good fit
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600 leading-relaxed">
              <li>Projects where you do not know the paintable area yet.</li>
              <li>
                Situations where manufacturer instructions override typical
                coverage (specialty coatings, heavy texture, unusual
                substrates).
              </li>
              <li>
                Professional estimating for bids (site conditions matter).
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-800">
            Units and conversions
          </div>
          <div className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter your area in whatever unit you have. You can display the
            result in a different unit, and your coverage label can be in yet
            another unit. Just keep the coverage number and the coverage unit
            matched to what you read on the can.
          </div>
        </div>
      </div>
    </section>
  );
}
