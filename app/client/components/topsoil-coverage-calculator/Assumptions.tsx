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
          geometry + your topsoil thickness (depth) + optional waste. Outputs
          are planning estimates for buying topsoil in bulk or bags, not an
          installation guarantee.
        </div>

        <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
          <div>
            <span className="font-medium text-slate-700">Assumptions:</span> the
            footprint is modeled as the selected shape (square, rectangle,
            circle, triangle, or border variant). Area is computed using
            standard formulas, then volume is computed as{" "}
            <span className="font-semibold text-slate-700">
              volume = area × thickness
            </span>
            . Unit conversions use exact definitions (for example,{" "}
            <span className="font-semibold text-slate-700">
              1 inch = 0.0254 meters
            </span>{" "}
            exactly). If your lawn or yard is irregular, the estimate will only
            be as accurate as the shape approximation.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is included:
            </span>{" "}
            converting dimensions into a consistent length system, calculating
            footprint area from your chosen shape, converting thickness to the
            same basis, and converting the resulting volume into practical units
            used for ordering topsoil (commonly yd³ / ft³ / m³ / L). If you set
            a waste percent, it is applied as a multiplier to volume only:{" "}
            <span className="font-semibold text-slate-700">
              Vw = V × (1 + waste% ÷ 100)
            </span>
            .
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is not included:
            </span>{" "}
            compaction, settling after watering/raking, soil screening/texture
            differences, moisture content (wet soil weighs more and may be
            delivered denser), slope correction, mixing into existing soil,
            removal of old material, or site constraints that change effective
            thickness (roots, rocks, low spots, edging height, grade changes).
            Bulk suppliers may also round delivery quantities or enforce
            minimums.
          </div>

          <div>
            <span className="font-medium text-slate-700">Practical note:</span>{" "}
            for topdressing or leveling, enter the{" "}
            <span className="font-semibold text-slate-700">
              thickness you plan to add
            </span>
            , not the total soil depth that already exists. If you are spreading
            over a lawn, thin applications are common and uneven spots can
            consume more than expected, so consider a small waste buffer for
            leveling and cleanup.
          </div>

          <p>
            <span className="font-medium text-slate-700">Disclaimer:</span> this
            tool provides a math-based estimate for planning and purchasing.
            Follow local guidelines and supplier recommendations for your
            specific job (topdressing, grading, raised bed fill), and verify any
            vendor-specific ordering rules (minimums, rounding, delivery access)
            before buying.
          </p>
        </div>
      </details>
    </div>
  );
}
