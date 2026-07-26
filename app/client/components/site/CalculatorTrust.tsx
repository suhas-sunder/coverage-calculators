import { Link } from "react-router";

export function EstimateNote() {
  return (
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
      Results are estimates based on the inputs and assumptions shown. Material
      properties, product specifications, compaction, waste, and installation
      conditions may vary. Verify quantities before placing large or high-cost
      orders. <Link to="/disclaimer" className="font-medium text-sky-800 hover:underline">Read the calculator disclaimer.</Link>
    </p>
  );
}

export function CalculatorByline() {
  return (
    <section
      aria-label="Calculator authorship"
      className="mx-auto my-8 max-w-6xl px-6"
    >
      <div className="border-t border-slate-200 pt-5 text-sm text-slate-600">
        <p>
          Built and maintained by{" "}
          <Link to="/about" className="font-semibold text-sky-800 hover:underline">
            Suhas Sunder
          </Link>
          , software developer.
        </p>
      </div>
    </section>
  );
}

