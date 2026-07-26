import { Link } from "react-router";
import { CALCULATORS } from "~/lib/site";

export default function HomeOverview() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10" aria-labelledby="home-tools-heading">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 id="home-tools-heading" className="text-2xl font-bold tracking-tight text-sky-900 sm:text-3xl">
              Calculators for common material projects
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Start with the general coverage tool above or choose a
              material-specific calculator for inputs such as depth, density,
              coats, package size, and cost where supported.
            </p>
          </div>
          <Link to="/calculators" className="shrink-0 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
            View all calculators
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.filter((calculator) => calculator.path !== "/").map((calculator) => (
            <Link key={calculator.path} to={calculator.path} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <h3 className="font-bold text-sky-900">{calculator.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{calculator.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="font-bold text-slate-900">Outputs you can plan with</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Depending on the tool: area, volume, cubic yards, cubic metres,
              tons, tonnes, bags, gallons, litres, and user-priced cost estimates.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="font-bold text-slate-900">Transparent methodology</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Formulas, conversions, assumptions, package rounding, and
              limitations are documented so results can be checked.
            </p>
            <Link to="/methodology" className="mt-3 inline-block text-sm font-semibold text-sky-800 underline underline-offset-2">Read the methodology</Link>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="font-bold text-slate-900">Created and maintained by Suhas Sunder</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Suhas is a software developer who implements, tests, documents,
              and maintains the calculation tools.
            </p>
            <Link to="/about" className="mt-3 inline-block text-sm font-semibold text-sky-800 underline underline-offset-2">About the creator and site</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

