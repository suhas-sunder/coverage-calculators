export default function Assumptions({}) {
  return (
    <div className="mb-6 rounded-xl bg-slate-50 p-4 max-w-5xl mx-auto">
      <details className="group">
        <summary className="cursor-pointer list-none font-semibold text-sky-800 flex items-center justify-between hover:text-sky-900">
          <span>Assumptions & disclaimer</span>
          <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="mt-2 text-sm text-slate-600 leading-relaxed">
          <span className="font-medium text-slate-700">Summary:</span> Exact
          unit definitions, estimate-only outputs, follow manufacturer specs.
        </div>

        <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
          <div>
            <span className="font-medium text-slate-700">Assumptions:</span>{" "}
            area unit conversions are based on exact definitions (for example, 1
            inch = 0.0254 meters exactly). Converted values are for measurement
            and estimating, not a substitute for product-specific instructions.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is included:
            </span>{" "}
            area conversion. If you use the builder, the final coverage area
            includes openings and allowance percentages. If you add a coverage
            rate, the estimate uses your inputs and does not account for product
            variations.
          </div>

          <p>
            <span className="font-medium text-slate-700">Disclaimer:</span>{" "}
            always follow manufacturer specs and local building guidelines for
            your specific material and project.
          </p>
        </div>
      </details>
    </div>
  );
}
