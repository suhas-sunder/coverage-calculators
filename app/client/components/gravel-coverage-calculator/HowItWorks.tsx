import { useId } from "react";
import ShapePreview from "~/client/components/gravel-coverage-calculator/ShapePreview";

type Shape =
  | "square"
  | "rectangle"
  | "circle"
  | "triangle"
  | "rectangle_border"
  | "circle_border"
  | "triangle_border";

type LinearUnit = "ft" | "in" | "yd" | "m" | "cm";

type UnitSet = {
  id: "us" | "metric";
  label: string;
  badge: string;
  dimUnit: LinearUnit;
  depthUnit: "in" | "cm";
  volumePrefs: Array<"yd3" | "ft3" | "m3" | "L">;
};

const PREVIEW_UNIT_SET: UnitSet = {
  id: "us",
  label: "Preview set",
  badge: "ft + in",
  dimUnit: "ft",
  depthUnit: "in",
  volumePrefs: ["yd3", "ft3", "L"],
};

function Expandable(props: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { title, subtitle, defaultOpen = false, children } = props;
  const contentId = useId();

  return (
    <details
      className="group rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5"
      open={defaultOpen}
    >
      <summary
        className="cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-xl"
        aria-controls={contentId}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-sm text-slate-600 leading-6">
                {subtitle}
              </div>
            ) : null}
          </div>
          <div className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 group-hover:ring-sky-200/80 group-hover:bg-sky-50 transition">
            <span className="h-2 w-2 rounded-full bg-slate-400 group-open:bg-sky-500 transition" />
            <span className="hidden sm:inline">Show details</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">
              ▾
            </span>
          </div>
        </div>
      </summary>

      <div id={contentId} className="mt-4 text-sm text-slate-700 leading-7">
        {children}
      </div>
    </details>
  );
}

function Badge(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
      <span className="h-2 w-2 rounded-full bg-sky-500" />
      {props.children}
    </span>
  );
}

export default function HowItWorksGravel() {
  const CardShell = (p: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
        />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
              {p.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold text-sky-800 tracking-tight">
                {p.title}
              </h3>
              {p.subtitle ? (
                <p className="mt-1 text-slate-600 leading-7">{p.subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-4">{p.children}</div>
        </div>
      </div>
    );
  };

  const ShapeExplainer = (p: {
    shape: Shape;
    unitSet: UnitSet;
    title: string;
    whenToUse: string;
    diagramMeans: string;
    whyMatters: string;
    inputs: Array<{ label: string; meaning: string }>;
    formulas: Array<{ label: string; formula: string; note?: string }>;
    checks: string[];
  }) => {
    return (
      <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl sm:text-2xl font-extrabold text-sky-800 tracking-tight">
                  {p.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Preview units: {p.unitSet.dimUnit}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <ShapePreview shape={p.shape} unit={p.unitSet.dimUnit} />
              </div>

              <p className="mt-3 text-slate-600 leading-7 max-w-3xl">
                {p.whenToUse}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    What the diagram represents
                  </div>
                  <p className="mt-2 text-sm text-slate-700 leading-7">
                    {p.diagramMeans}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why it matters in real life
                  </div>
                  <p className="mt-2 text-sm text-slate-700 leading-7">
                    {p.whyMatters}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Inputs you enter (what each one means)
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700 leading-7">
                  {p.inputs.map((i) => (
                    <li key={i.label}>
                      <span className="font-semibold text-slate-900">
                        {i.label}:
                      </span>{" "}
                      {i.meaning}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <Expandable
                  title="Calculations used (technical)"
                  subtitle="Collapsed by default so it stays readable. Open if you want the exact math."
                >
                  <ul className="list-disc pl-5 space-y-2">
                    {p.formulas.map((f) => (
                      <li key={f.label}>
                        <span className="font-semibold text-slate-900">
                          {f.label}:
                        </span>{" "}
                        <span className="font-semibold text-slate-900">
                          {f.formula}
                        </span>
                        {f.note ? (
                          <span className="text-slate-600">. {f.note}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Expandable>
              </div>

              <div className="mt-4">
                <Expandable
                  title="Quick checks to avoid mistakes (technical)"
                  subtitle="These prevent the classic 2x, 4x, and 12x errors."
                >
                  <ul className="list-disc pl-5 space-y-2">
                    {p.checks.map((c, idx) => (
                      <li key={`${p.shape}-${p.unitSet.id}-${idx}`}>{c}</li>
                    ))}
                  </ul>
                </Expandable>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-center sm:text-left text-3xl sm:text-4xl font-extrabold text-sky-800 tracking-tight leading-tight">
                  How the gravel coverage calculator works
                </h2>
                <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-3xl">
                  This calculator turns a measured footprint into gravel volume.
                  You pick a shape, enter dimensions in your preferred units,
                  and choose a depth. The tool computes area from the shape,
                  then computes volume as area × depth, applies optional waste,
                  and converts the same volume into practical buying units. Many
                  suppliers quote gravel by bulk volume (yd³ / m³) and some
                  users think in smaller units (ft³ / L), so the multi-unit
                  output is meant to match real purchasing.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <Badge>Shape-driven area math</Badge>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Depth → volume → buy list
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  INPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Shape + dimensions
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  AREA
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Shape formula
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  VOLUME
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Area × depth
                </div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  OUTPUT
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  yd³ / ft³ / m³ / L
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <CardShell
              title="Scenario-based examples"
              subtitle="Each example uses a different shape and a different real-world job, so you can copy the one that matches your situation. The preview diagrams below use the same unit system as the example they describe."
              icon={
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19V5m0 14h16M8 15l3-3 3 3 6-6"
                  />
                </svg>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Example A: CIRCLE (US) */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example A (US): round fire pit pad, circle, ft + in, order
                      in yd³
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: ft (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are building a round gravel pad for a fire pit. The pad
                    has a{" "}
                    <span className="font-semibold text-slate-900">5 ft</span>{" "}
                    radius, and you want a{" "}
                    <span className="font-semibold text-slate-900">3 in</span>{" "}
                    gravel layer. The supplier sells gravel by{" "}
                    <span className="font-semibold text-slate-900">yd³</span>.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Circle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">ft</span>.
                      Enter Radius <span className="font-semibold">5</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">3</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">7%</span> if you’ll
                      rake edges smooth or expect spill/cleanup.
                    </li>
                    <li>
                      Read results in <span className="font-semibold">yd³</span>{" "}
                      for ordering, then sanity-check{" "}
                      <span className="font-semibold">ft³</span> if you’re
                      visualizing “how much that is.”
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    What this prevents: entering diameter as radius makes the
                    result 4× too large.
                  </div>
                </div>

                {/* Example B: RECTANGLE BORDER (Metric) */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example B (Metric): patio surround, rectangle border, m +
                      cm, quote in m³
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: m (dims) • cm (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are adding gravel around a rectangular patio. The outer
                    footprint is{" "}
                    <span className="font-semibold text-slate-900">6.0 m</span>{" "}
                    by{" "}
                    <span className="font-semibold text-slate-900">4.2 m</span>,
                    but the patio itself (no gravel) is{" "}
                    <span className="font-semibold text-slate-900">4.8 m</span>{" "}
                    by{" "}
                    <span className="font-semibold text-slate-900">3.0 m</span>.
                    You want{" "}
                    <span className="font-semibold text-slate-900">5 cm</span>{" "}
                    of gravel and the yard quotes in{" "}
                    <span className="font-semibold text-slate-900">m³</span>.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape:{" "}
                      <span className="font-semibold">Rectangle border</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">m</span>.
                      Enter Outer Length{" "}
                      <span className="font-semibold">6.0</span> and Outer Width{" "}
                      <span className="font-semibold">4.2</span>.
                    </li>
                    <li>
                      Still in <span className="font-semibold">m</span>, enter
                      Inner Length <span className="font-semibold">4.8</span>{" "}
                      and Inner Width <span className="font-semibold">3.0</span>
                      .
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">5</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">5%</span> if the
                      border width varies a bit or you expect loss while
                      screeding.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why this is worth using: it forces the cutout subtraction so
                    you do not pay for gravel that goes where the patio already
                    is.
                  </div>
                </div>

                {/* Example C: TRIANGLE (US) */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example C (US): shed ramp fill, triangle, yd + in,
                      estimate a tapered wedge
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: yd (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are building a tapered gravel wedge to smooth a
                    transition up to a shed door. The wedge footprint is roughly
                    triangular:{" "}
                    <span className="font-semibold text-slate-900">4 yd</span>{" "}
                    along the back edge (base) and{" "}
                    <span className="font-semibold text-slate-900">2 yd</span>{" "}
                    out from that edge (perpendicular height). You want a{" "}
                    <span className="font-semibold text-slate-900">3.5 in</span>{" "}
                    layer.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Triangle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">yd</span>.
                      Enter Base <span className="font-semibold">4</span> and
                      Height <span className="font-semibold">2</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">3.5</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">12%</span> if the
                      wedge is “close enough” and you expect extra
                      raking/shaping.
                    </li>
                    <li>
                      Use the diagram: height is perpendicular to the base, not
                      the slanted side.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why this example is different: wedge areas are where
                    “height” is most often mis-measured, which inflates area and
                    volume.
                  </div>
                </div>

                {/* Example D: CIRCLE BORDER (Metric) */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example D (Metric): tree ring refresh, circle border, cm +
                      cm, quick liters check
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: cm (dims) • cm (depth) • L (output)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are adding gravel in a ring around a tree where the
                    center is not filled. The outer radius is{" "}
                    <span className="font-semibold text-slate-900">120 cm</span>
                    , the inner radius is{" "}
                    <span className="font-semibold text-slate-900">35 cm</span>,
                    and you want{" "}
                    <span className="font-semibold text-slate-900">6 cm</span>{" "}
                    depth. You want the output in{" "}
                    <span className="font-semibold text-slate-900">Litres</span>{" "}
                    to match small bag labels.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape:{" "}
                      <span className="font-semibold">Circle border</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">cm</span>.
                      Enter Outer Radius{" "}
                      <span className="font-semibold">120</span> and Inner
                      Radius <span className="font-semibold">35</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">6</span>.
                    </li>
                    <li>
                      Set output to <span className="font-semibold">L</span> and
                      divide by a bag size (for example 20 L or 25 L), then
                      round up.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    What this prevents: swapping inner and outer radii (or using
                    diameters) breaks ring math fast because radii are squared.
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Expandable
                  title="End-to-end math path (technical)"
                  subtitle="Open if you want the exact sequence the calculator uses."
                >
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Convert all dimensions into a common base length unit
                      derived from the chosen selectors.
                    </li>
                    <li>
                      Compute area A for the selected shape
                      (square/rectangle/circle/triangle or a border variant).
                    </li>
                    <li>
                      Convert depth into that same base length unit and compute
                      volume V = A × depth.
                    </li>
                    <li>
                      Apply waste as a multiplier: Vw = V × (1 + waste% ÷ 100).
                    </li>
                    <li>
                      Convert Vw into yd³, ft³, m³, and L (and show whichever
                      your UI prioritizes).
                    </li>
                    <li>
                      If your gravel page includes weight conversion: estimate
                      weight from volume using a selected density (weight =
                      volume × density). Density varies by material and
                      moisture.
                    </li>
                  </ul>
                </Expandable>
              </div>
            </CardShell>

            <div className="space-y-6">
              {SHAPE_EXPLAINERS.map((p) => (
                <ShapeExplainer key={`${p.shape}-${p.title}`} {...p} />
              ))}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl opacity-20" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl opacity-30" />
              </div>

              <div className="relative">
                <div className="text-sm font-semibold text-sky-300">
                  Utility note
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-sky-300">
                  Gravel estimates are planning outputs
                </h3>
                <p className="mt-3 text-slate-200 leading-7">
                  This tool uses standard geometry plus your chosen depth and an
                  optional waste buffer. Real gravel jobs can involve
                  compaction, base layering, moisture variation, and supplier
                  rounding. Use the output as a starting point for ordering,
                  then adjust with a buffer if your edges are irregular or you
                  want to avoid coming up short.
                </p>

                <div className="mt-4">
                  <Expandable
                    title="Final notes (depth, compaction, and buying strategy)"
                    subtitle="For users comparing contractor quotes, bulk delivery, and bagged products."
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        If you’re building a base, decide whether your target
                        depth is the placed depth or the compacted depth, and be
                        consistent. Compaction can change the final thickness.
                      </li>
                      <li>
                        Bulk gravel is commonly ordered in yd³ or m³, but many
                        suppliers also sell by weight. If your page includes a
                        density setting, weight is an estimate and varies by
                        material and moisture.
                      </li>
                      <li>
                        If you’re buying in bags, match your output unit to the
                        bag label (ft³ or liters), divide by bag volume, and
                        round up.
                      </li>
                      <li>
                        For comparisons, always convert prices to the same unit
                        (for example $/yd³ vs $/m³ vs $/ton) before deciding.
                      </li>
                    </ul>
                  </Expandable>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SHAPE_EXPLAINERS: any[] = [
  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "rectangle",
    title: "Rectangle",
    whenToUse:
      "Use Rectangle for straight-edged gravel placements like driveway extensions, walkway bases, shed pads, and paver base rectangles.",
    diagramMeans:
      "Length and Width describe the footprint on the ground. The diagram is only a measuring guide, not a scale drawing.",
    whyMatters:
      "Rectangle jobs fail when one input is in the wrong unit, or when the depth entered is not the planned placed thickness. Depth is what drives the yardage.",
    inputs: [
      {
        label: `Length (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning:
          "Measure the long direction of the area you are covering, on the ground plane.",
      },
      {
        label: `Width (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Measure across the area, perpendicular to Length.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning:
          "Target gravel layer thickness. If you're building a base that will be compacted, decide whether you're entering the planned compacted thickness or the loose thickness, then be consistent.",
      },
      {
        label: "Waste %",
        meaning:
          "Buffer for grade irregularities, edge trimming, spill, and small measuring error.",
      },
    ],
    formulas: [
      { label: "Area", formula: "A = Length × Width" },
      { label: "Volume", formula: "V = A × depth" },
      {
        label: "Waste-adjusted volume",
        formula: "Vw = V × (1 + waste% ÷ 100)",
      },
    ],
    checks: [
      "If your result is off by ~12×, the usual cause is inches vs feet on depth (or vice versa).",
      "If the footprint is slightly irregular, rectangle is still fine but do not pretend it's exact. Add a modest waste buffer.",
      "If you're ordering by the yard, sanity-check the final yd³ number against what you can picture in a pickup bed or bucket size.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "square",
    title: "Square",
    whenToUse:
      "Use Square for square pads and base layers where both sides really match (for example, a small paver patio base or a compact shed pad).",
    diagramMeans:
      "A square uses one side length for both dimensions, so you only enter one number for the footprint size.",
    whyMatters:
      "Square reduces inputs, but it is not a shortcut for “almost square.” A small mismatch changes area enough to change an order, especially at thicker depths.",
    inputs: [
      {
        label: `Side (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning:
          "One side of the footprint on the ground. Used twice in the area math.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Target gravel thickness for the layer you’re placing.",
      },
      {
        label: "Waste %",
        meaning: "Optional buffer for edge trimming and cleanup.",
      },
    ],
    formulas: [
      { label: "Area", formula: "A = side²" },
      { label: "Volume", formula: "V = A × depth" },
      { label: "Waste volume", formula: "Vw = V × (1 + waste% ÷ 100)" },
    ],
    checks: [
      "If one side is longer, use Rectangle. Do not force Square because it’s faster.",
      "If you’re building up in multiple lifts (layers), calculate each layer separately if thickness differs.",
      "For ordering, the rounded-up result matters. Exact decimals are not what you receive.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "circle",
    title: "Circle",
    whenToUse:
      "Use Circle for round pads (fire pit circles, circular planters, round stepping-stone bases) and anything measured from a center point.",
    diagramMeans:
      "The input is Radius: center to edge. The diagram exists to make radius vs diameter unambiguous.",
    whyMatters:
      "Circle area uses r², so a radius mistake is not small. Entering diameter as radius makes the volume 4× too large.",
    inputs: [
      {
        label: `Radius (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning:
          "Center-to-edge distance. If you measured across the full circle, divide by 2 before entering.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Gravel thickness across the circular footprint.",
      },
      {
        label: "Waste %",
        meaning: "Optional buffer for edge shaping and spreading loss.",
      },
    ],
    formulas: [
      { label: "Area", formula: "A = π × r²" },
      { label: "Volume", formula: "V = A × depth" },
      { label: "Waste volume", formula: "Vw = V × (1 + waste% ÷ 100)" },
    ],
    checks: [
      "If you measured diameter, halve it. If the answer is ~4× too big, that’s the mistake.",
      "If the circle is not perfect, measure two radii at right angles and average them.",
      "Circle jobs often involve edging. If you plan to taper edges, include a small waste buffer.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "triangle",
    title: "Triangle",
    whenToUse:
      "Use Triangle for wedge-shaped gravel areas where you can measure a base edge and a perpendicular height (common around corners and transitions).",
    diagramMeans:
      "Base is the reference edge. Height is the perpendicular distance from that base, not the slanted side.",
    whyMatters:
      "Triangle errors usually come from using the sloped edge as “height,” which inflates area and volume. The calculator needs the perpendicular height.",
    inputs: [
      {
        label: `Base (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "The straight edge you choose as the base reference.",
      },
      {
        label: `Height (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Perpendicular distance from the base to the opposite point.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Target gravel thickness for the triangle footprint.",
      },
      {
        label: "Waste %",
        meaning: "Optional buffer for rough edges and shaping.",
      },
    ],
    formulas: [
      { label: "Area", formula: "A = (base × height) ÷ 2" },
      { label: "Volume", formula: "V = A × depth" },
      { label: "Waste volume", formula: "Vw = V × (1 + waste% ÷ 100)" },
    ],
    checks: [
      "Height must be perpendicular. If you use the slanted side, you over-order.",
      "If the wedge is irregular, split it into simpler pieces (rectangle + triangle) and add results.",
      "If you cannot measure a perpendicular height, this becomes a rough estimate. Increase waste slightly.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "rectangle_border",
    title: "Rectangle border",
    whenToUse:
      "Use Rectangle border when gravel goes around a rectangular area you are not filling (patio/slab cutout, existing pad, or a no-fill zone).",
    diagramMeans:
      "Outer dimensions describe the full footprint. Inner dimensions describe the cutout. The filled area is outer minus inner.",
    whyMatters:
      "Border shapes prevent ordering gravel for the space that already exists. This is one of the most common overbuy causes on hardscape projects.",
    inputs: [
      {
        label: `Outer length (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Overall outside length of the footprint.",
      },
      {
        label: `Outer width (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Overall outside width of the footprint.",
      },
      {
        label: `Inner length (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Cutout length you are not filling.",
      },
      {
        label: `Inner width (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Cutout width you are not filling.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Gravel thickness for the border area only.",
      },
    ],
    formulas: [
      { label: "Outer area", formula: "Aout = outer_length × outer_width" },
      { label: "Inner area", formula: "Ain = inner_length × inner_width" },
      { label: "Border area", formula: "A = Aout - Ain" },
      { label: "Volume", formula: "V = A × depth" },
    ],
    checks: [
      "Inner dimensions must be smaller than outer dimensions.",
      "If you have multiple cutouts, subtract each cutout area (or run multiple calculations and add).",
      "If you’re shaping the border with variable width, use waste to cover that reality.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "circle_border",
    title: "Circle border (ring)",
    whenToUse:
      "Use Circle border for rings: gravel around a fire pit insert, around a tree where the trunk zone stays empty, or around a circular feature.",
    diagramMeans:
      "Outer radius is the outside edge. Inner radius is the hole. The filled footprint is the difference of two circles.",
    whyMatters:
      "Ring math is sensitive because radii are squared. Swapping inner/outer values or entering diameters will break the result fast.",
    inputs: [
      {
        label: `Outer radius (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Center-to-outer-edge distance.",
      },
      {
        label: `Inner radius (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Center-to-inner-edge distance (void).",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Gravel thickness for the ring only.",
      },
      {
        label: "Waste %",
        meaning: "Optional buffer for edge shaping and spill.",
      },
    ],
    formulas: [
      { label: "Outer area", formula: "Aout = π × Rout²" },
      { label: "Inner area", formula: "Ain = π × Rin²" },
      { label: "Ring area", formula: "A = Aout - Ain" },
      { label: "Volume", formula: "V = A × depth" },
    ],
    checks: [
      "Inner radius must be smaller than outer radius.",
      "If you measured diameters, divide by 2 before entering.",
      "Thin rings are sensitive to measurement error. Use a modest waste buffer.",
    ],
  },

  {
    unitSet: PREVIEW_UNIT_SET,
    shape: "triangle_border",
    title: "Triangle border",
    whenToUse:
      "Use Triangle border when you’re filling a triangular perimeter region and excluding an inner triangular no-fill zone.",
    diagramMeans:
      "You enter an outer triangle (base + perpendicular height) and an inner triangle (base + perpendicular height). The filled footprint is outer minus inner.",
    whyMatters:
      "Triangle borders show up in corner transitions where it is easy to over-order by treating the whole outer triangle as fill. The cutout subtraction is the point.",
    inputs: [
      {
        label: `Outer base (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Base length of the outer triangle.",
      },
      {
        label: `Outer height (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Perpendicular height of the outer triangle.",
      },
      {
        label: `Inner base (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Base length of the cutout triangle.",
      },
      {
        label: `Inner height (${PREVIEW_UNIT_SET.dimUnit})`,
        meaning: "Perpendicular height of the cutout triangle.",
      },
      {
        label: `Depth (${PREVIEW_UNIT_SET.depthUnit})`,
        meaning: "Gravel thickness for the border area only.",
      },
      {
        label: "Waste %",
        meaning: "Optional buffer for shaping and imperfect edges.",
      },
    ],
    formulas: [
      {
        label: "Outer area",
        formula: "Aout = (outer_base × outer_height) ÷ 2",
      },
      { label: "Inner area", formula: "Ain = (inner_base × inner_height) ÷ 2" },
      { label: "Border area", formula: "A = Aout - Ain" },
      { label: "Volume", formula: "V = A × depth" },
    ],
    checks: [
      "Both heights must be perpendicular to their bases.",
      "Inner values must be smaller than outer values.",
      "If the inner cutout isn’t perfectly similar, this is still a planning estimate. Use a small buffer.",
    ],
  },
];
