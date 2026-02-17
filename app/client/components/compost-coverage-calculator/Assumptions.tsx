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
          geometry + your compost depth + optional waste. Outputs are planning
          estimates for buying compost in bulk or bags, not an installation or
          delivery guarantee.
        </div>

        <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
          <div>
            <span className="font-medium text-slate-700">Assumptions:</span>{" "}
            your bed, lawn area, or planting zone is modeled as the selected
            shape (square, rectangle, circle, triangle, or border variants).
            Area is computed using standard formulas, then volume is computed as{" "}
            <span className="font-semibold text-slate-700">
              volume = area × depth
            </span>
            . The estimate is only as accurate as your measurements and how well
            the chosen shape matches the real footprint, especially for curved
            edges, irregular beds, or areas with cutouts.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is included:
            </span>{" "}
            converting dimensions into a consistent unit system, calculating
            footprint area from your chosen shape, converting depth (thickness)
            to the same basis, and converting the resulting volume into common
            compost ordering units (yd³ / ft³ / m³ / L) plus bag counts. If you
            add a waste percent, it is applied to volume only:{" "}
            <span className="font-semibold text-slate-700">
              Vw = V × (1 + waste% ÷ 100)
            </span>
            .
          </div>

          <div>
            <span className="font-medium text-slate-700">
              Bag-count assumptions:
            </span>{" "}
            bag counts are rounded up to whole bags and assume the bag volume on
            the label is accurate. Real-world “coverage per bag” can vary with
            compost texture, moisture, and how fluffy vs compacted the product
            is. If your supplier’s bags are in liters, this calculator’s liters
            (L) output is the closest match.
          </div>

          <div>
            <span className="font-medium text-slate-700">
              What is not included:
            </span>{" "}
            compaction during spreading, settling after watering, shrinkage as
            compost dries, blending into existing soil, “working in” compost to
            a till depth, slope correction, low-spot filling, edging height
            limits, or site constraints that change effective depth. Bulk
            suppliers may also round quantities, enforce minimums, or deliver in
            increments (for example half-yard steps).
          </div>

          <div>
            <span className="font-medium text-slate-700">Practical notes:</span>{" "}
            enter the{" "}
            <span className="font-semibold text-slate-700">
              compost you plan to add
            </span>
            , not the existing soil depth. Typical jobs vary:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                <span className="font-semibold text-slate-700">
                  Topdressing a lawn:
                </span>{" "}
                thin layers are common and you may use extra compost for uneven
                areas, so a small waste buffer can help.
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  Amending garden beds:
                </span>{" "}
                if you plan to mix compost into the soil, measure the surface
                area and use the depth of compost you want to add before mixing
                (mixing changes the final level).
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  Raised beds:
                </span>{" "}
                compost is often blended with other materials; if you are not
                filling with 100% compost, calculate the total volume and then
                apply your compost percentage.
              </li>
            </ul>
          </div>

          <p>
            <span className="font-medium text-slate-700">Optional weight:</span>{" "}
            the weight estimate uses the density you enter and is approximate.
            Compost density varies widely by moisture, screening, and wood vs
            manure/plant blend. Use supplier specs when available.
          </p>

          <p>
            <span className="font-medium text-slate-700">Disclaimer:</span> this
            tool provides a math-based estimate for planning and purchasing.
            Verify supplier-specific ordering rules (bag size, bulk minimums,
            rounding, and delivery constraints) before buying.
          </p>
        </div>
      </details>
    </div>
  );
}
