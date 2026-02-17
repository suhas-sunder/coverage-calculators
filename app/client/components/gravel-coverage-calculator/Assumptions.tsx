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
          <span className="font-medium text-slate-700">Summary:</span> Standard
          geometry + your depth + optional waste, plus optional density (for
          weight) and optional bag/pricing settings. Outputs are planning
          estimates for buying gravel (bulk or bags), not an installation
          guarantee.
        </div>

        <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
          <div>
            <span className="font-medium text-slate-700">Assumptions:</span> the
            footprint is modeled as the selected shape (square, rectangle,
            circle, triangle, or border variant). Area is computed using
            standard formulas, then volume is computed as{" "}
            <span className="font-semibold text-slate-700">
              volume = area × depth
            </span>
            . Unit conversions use exact definitions (for example,{" "}
            <span className="font-semibold text-slate-700">
              1 inch = 0.0254 meters
            </span>{" "}
            exactly). If your area is irregular, the estimate will only be as
            accurate as the shape approximation.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is included:
            </span>{" "}
            converting dimensions into a consistent length system, calculating
            footprint area from your chosen shape, converting depth to the same
            basis, and converting the resulting volume into practical units for
            buying and quotes (commonly yd³ / ft³ / m³ / L). If you set a waste
            percent, it is applied as a multiplier to volume only:{" "}
            <span className="font-semibold text-slate-700">
              Vw = V × (1 + waste% ÷ 100)
            </span>
            .
          </div>

          <div>
            <span className="font-medium text-slate-700">
              Weight and density:
            </span>{" "}
            if you select a density preset or enter a custom density, the tool
            estimates weight from volume using{" "}
            <span className="font-semibold text-slate-700">
              weight = volume × density
            </span>
            . Density varies by gravel type, moisture, and compaction, so tons
            and pounds are approximate. Bag counts based on weight depend on the
            same density estimate.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is not included:
            </span>{" "}
            compaction from equipment, settling over time, slope correction,
            drainage and base-layer design, geotextile requirements, fines
            migration, moisture changes, void space differences between stone
            types, or site constraints that change effective depth (soft spots,
            edging height, grade changes). Suppliers may round delivery
            quantities, enforce minimums, or price by different “ton” standards.
          </div>

          <div>
            <span className="font-medium text-slate-700">Practical note:</span>{" "}
            for topping up an existing gravel area, enter the{" "}
            <span className="font-semibold text-slate-700">
              depth you plan to add
            </span>
            , not the total depth currently there. If you are ordering close to
            a minimum delivery amount or trying to avoid a second trip, consider
            a small waste buffer for edges, ruts, and touch-ups.
          </div>

          <p>
            <span className="font-medium text-slate-700">Disclaimer:</span> this
            tool provides a math-based estimate for planning and purchasing.
            Always follow local guidelines and supplier recommendations for your
            project, and verify any product- or vendor-specific ordering rules
            before buying.
          </p>
        </div>
      </details>
    </div>
  );
}
