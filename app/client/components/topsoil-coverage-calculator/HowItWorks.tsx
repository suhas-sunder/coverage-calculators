import { useId } from "react";
import ShapePreview from "~/client/components/topsoil-coverage-calculator/ShapePreview";

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

const UNIT_SETS: UnitSet[] = [
  {
    id: "us",
    label: "US example set",
    badge: "Feet + inches + yd³/ft³",
    dimUnit: "ft",
    depthUnit: "in",
    volumePrefs: ["yd3", "ft3", "L"],
  },
];

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

export default function HowItWorksTopsoil() {
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
                    Why it matters for topsoil
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
                  subtitle="Open if you want the exact geometry and unit conversions."
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
                  title="Quick checks to avoid expensive mistakes (technical)"
                  subtitle="These prevent the classic unit and measurement errors that wreck bag counts and bulk orders."
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
                  How the topsoil coverage calculator works
                </h2>
                <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-3xl">
                  This calculator converts a measured footprint and a planned
                  topsoil depth into a buyable volume. You pick the shape that
                  matches your lawn or yard area, enter dimensions, then enter
                  the depth of topsoil you plan to add. The tool computes area
                  from the shape, computes volume as area × depth, applies an
                  optional waste buffer, then converts the same volume into
                  common purchase units like cubic yards, cubic feet, cubic
                  meters, liters, and topsoil bag counts.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <Badge>Topsoil volume, not mulch</Badge>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Area → depth → yd³ / m³ / bags
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
                  BUY LIST
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Bulk or bags
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <CardShell
              title="Examples you can copy"
              subtitle="Each example is shaped like a real job. Use it to pick the correct shape, depth units, and the output that matches how you buy topsoil."
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
                {/* Example A: US rectangle lawn topdressing */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example A (US): rectangle lawn topdressing, yd³ for bulk
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: ft (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">Goal:</div>
                    Add a thin topsoil layer to smooth and level a lawn area
                    measuring{" "}
                    <span className="font-semibold text-slate-900">
                      30 ft
                    </span>{" "}
                    by{" "}
                    <span className="font-semibold text-slate-900">18 ft</span>.
                    You plan to add{" "}
                    <span className="font-semibold text-slate-900">0.5 in</span>{" "}
                    of topsoil and want the answer in{" "}
                    <span className="font-semibold text-slate-900">
                      cubic yards
                    </span>{" "}
                    for a bulk order.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Rectangle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">ft</span>.
                      Enter Length <span className="font-semibold">30</span> and
                      Width <span className="font-semibold">18</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">0.5</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">5%</span> if your
                      lawn edge is irregular or you expect some loss during
                      spreading.
                    </li>
                    <li>
                      Read results in <span className="font-semibold">yd³</span>{" "}
                      for ordering.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Tip: thin layers are sensitive to depth mistakes. If you
                    enter 5 inches instead of 0.5 inches, volume jumps 10×.
                  </div>
                </div>

                {/* Example B: Metric circle raised bed topping */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example B (Metric): round raised bed top-up, m³ for
                      delivery
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: m (dims) • cm (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">Goal:</div>
                    Top up a circular raised bed with a measured radius of{" "}
                    <span className="font-semibold text-slate-900">1.0 m</span>.
                    You want to add{" "}
                    <span className="font-semibold text-slate-900">4 cm</span>{" "}
                    of topsoil and compare your result against a supplier quote
                    in <span className="font-semibold text-slate-900">m³</span>.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Circle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">m</span>.
                      Enter Radius <span className="font-semibold">1.0</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">4</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">8%</span> if the
                      surface is rough or you are blending into existing soil.
                    </li>
                    <li>
                      Read headline in <span className="font-semibold">m³</span>
                      , then check <span className="font-semibold">L</span> if
                      you want a more intuitive number.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Common error: entering diameter as radius makes area and
                    volume 4× too large.
                  </div>
                </div>

                {/* Example C: Rectangle border around patio (US), bags */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example C (US): rectangle border around patio, bags for
                      pickup
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: ft (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">Goal:</div>
                    Build up soil around a patio by adding topsoil to the
                    surrounding border area only. The outer footprint is{" "}
                    <span className="font-semibold text-slate-900">
                      22 ft × 14 ft
                    </span>{" "}
                    and the patio cutout is{" "}
                    <span className="font-semibold text-slate-900">
                      18 ft × 10 ft
                    </span>
                    . You plan to add{" "}
                    <span className="font-semibold text-slate-900">2 in</span>{" "}
                    of topsoil and you want a bag count for a store run.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape:{" "}
                      <span className="font-semibold">Rectangle border</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">ft</span>.
                      Enter outer (22, 14) and inner (18, 10).
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">2</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">10%</span> if the
                      edge transitions are not straight.
                    </li>
                    <li>
                      Read results in <span className="font-semibold">ft³</span>{" "}
                      and check bag counts.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why border matters: if you ignore the patio cutout, you
                    overbuy by the entire patio area.
                  </div>
                </div>

                {/* Example D: Triangle slope fill (Metric), liters */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example D (Metric): triangular low spot, liters for bag
                      labels
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: m (dims) • cm (depth) • L (output)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">Goal:</div>
                    Fix a triangular low area near a fence corner. The base is{" "}
                    <span className="font-semibold text-slate-900">
                      2.6 m
                    </span>{" "}
                    and the perpendicular height is{" "}
                    <span className="font-semibold text-slate-900">1.4 m</span>.
                    You want to add{" "}
                    <span className="font-semibold text-slate-900">5 cm</span>{" "}
                    of topsoil and match store bags labeled in{" "}
                    <span className="font-semibold text-slate-900">liters</span>
                    .
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Triangle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">m</span>.
                      Enter Base <span className="font-semibold">2.6</span> and
                      Height <span className="font-semibold">1.4</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">5</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">12%</span> if your
                      triangle is an approximation and edges are irregular.
                    </li>
                    <li>
                      Set output to <span className="font-semibold">L</span> and
                      compare with bag sizes (for example 25 L, 40 L, 56 L).
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Triangle reminder: height must be perpendicular to the base,
                    not a sloped edge.
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
                      Convert dimensions into a consistent base unit using your
                      selectors (ft/in/yd or m/cm).
                    </li>
                    <li>
                      Compute footprint area A based on the selected shape
                      (including border variants that subtract cutouts).
                    </li>
                    <li>
                      Convert depth into the same base system and compute volume
                      V = A × depth.
                    </li>
                    <li>
                      Apply waste as a multiplier: Vw = V × (1 + waste% ÷ 100).
                    </li>
                    <li>
                      Convert Vw into yd³, ft³, m³, and liters, and show bag
                      counts by dividing by bag volume and rounding up.
                    </li>
                  </ul>
                </Expandable>
              </div>
            </CardShell>

            {/* SHAPES EXPLAINED IN TWO UNIT SYSTEMS */}
            {UNIT_SETS.map((unitSet) => (
              <div key={unitSet.id} className="space-y-6">
                <ShapeExplainer
                  unitSet={unitSet}
                  shape="rectangle"
                  title={`Rectangle`}
                  whenToUse="Use Rectangle for lawns, strips, and beds you can measure as length × width: leveling a section of lawn, topping a garden bed, or building up a flat area."
                  diagramMeans={`Length and Width are ground measurements that define the footprint. In this section the diagram labels are shown in ${unitSet.dimUnit}.`}
                  whyMatters="Topsoil projects often use thin layers. A small depth error (or wrong depth unit selector) can swing volume dramatically and change whether you should buy bulk or bags."
                  inputs={[
                    {
                      label: `Length (${unitSet.dimUnit})`,
                      meaning: "Measured along the long edge on the ground.",
                    },
                    {
                      label: `Width (${unitSet.dimUnit})`,
                      meaning:
                        "Measured across the area, perpendicular to length.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Thickness of topsoil to add. For lawn topdressing this is often a small number.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Buffer for spillage, uneven grade, and areas you under-measured.",
                    },
                  ]}
                  formulas={[
                    { label: "Area", formula: "A = Length × Width" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste-adjusted volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    `If depth is entered in ${unitSet.depthUnit} but the selector is wrong, volume can be off by a large factor (12× when inches and feet are mixed).`,
                    "If your job is a thin layer (topdressing), sanity-check by switching outputs between bulk units and bag counts. The number should still feel plausible.",
                    "If the area is not truly rectangular, rectangle is still a useful estimate but add a realistic waste percent.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="square"
                  title={`Square`}
                  whenToUse="Use Square for square planters, square raised bed interiors, and any footprint where both sides are equal."
                  diagramMeans={`The preview shows one side labeled Length because a square uses the same side for both dimensions. Units shown are ${unitSet.dimUnit}.`}
                  whyMatters="Square reduces input effort and reduces the chance of entering mismatched sides, but it only applies if the footprint is actually square."
                  inputs={[
                    {
                      label: `Side (${unitSet.dimUnit})`,
                      meaning:
                        "One side of the footprint on the ground. Used twice in the area calculation.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Topsoil thickness to add. Doubling depth doubles volume.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer. Useful when you are feathering soil edges or blending into existing grade.",
                    },
                  ]}
                  formulas={[
                    { label: "Area", formula: "A = side²" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "If one side is even slightly longer, use Rectangle instead. A small mismatch can change bag counts.",
                    "If you are filling to a specific height in a box, confirm you are measuring the inside footprint, not the outside footprint.",
                    "If your square is a border around something, use a border shape so you subtract the cutout.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="circle"
                  title={`Circle`}
                  whenToUse="Use Circle for round beds, tree rings, and circular planters when you can measure from the center."
                  diagramMeans={`The preview labels Radius from the center to the edge. Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="Radius is squared, so input mistakes are costly. This matters for topsoil because you may be ordering bulk and a 4× error is expensive."
                  inputs={[
                    {
                      label: `Radius (${unitSet.dimUnit})`,
                      meaning:
                        "Center-to-edge distance. If you measured across the full circle, you measured diameter, not radius.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Topsoil thickness applied across the circle footprint.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for roots, bumps, and irregular edges.",
                    },
                  ]}
                  formulas={[
                    { label: "Area", formula: "A = π × r²" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "If you measured diameter, divide by 2 before entering radius.",
                    "If the circle is not perfect, measure two radii at right angles and average them, then add a small waste buffer.",
                    "If the output seems 4× too big, the most likely cause is diameter entered as radius.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="triangle"
                  title={`Triangle`}
                  whenToUse="Use Triangle for wedges, corners, and tapered areas where you can define a base and a perpendicular height."
                  diagramMeans={`The preview shows Base and Height where height is perpendicular to base. Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="For topsoil, triangles often show up when fixing a corner low spot or blending grade. Using a slanted side as height will overstate area and overstate volume."
                  inputs={[
                    {
                      label: `Base (${unitSet.dimUnit})`,
                      meaning:
                        "The straight edge you choose as the base reference.",
                    },
                    {
                      label: `Height (${unitSet.dimUnit})`,
                      meaning:
                        "Perpendicular distance from the base to the opposite point (not the slanted side).",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Topsoil thickness to add across the triangle footprint.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for irregular edges and measurement uncertainty.",
                    },
                  ]}
                  formulas={[
                    { label: "Area", formula: "A = (base × height) ÷ 2" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "Height must be perpendicular. If you use a sloped edge, you inflate area.",
                    "If the triangle is part of a larger job, split it into a rectangle plus a triangle for cleaner measurements.",
                    "If you only know side lengths, measure a perpendicular height in the real world instead of guessing.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="rectangle_border"
                  title={`Rectangle border`}
                  whenToUse="Use Rectangle border when you are adding topsoil around a rectangular area you are not covering: around a patio, around a shed pad, or around a concrete slab."
                  diagramMeans={`The preview shows an outer rectangle and an inner rectangle cutout. The topsoil footprint is outer minus inner. Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="Border shapes prevent systematic overbuy. For topsoil, this matters because you may be ordering bulk and extra yards add up quickly."
                  inputs={[
                    {
                      label: `Outer length (${unitSet.dimUnit})`,
                      meaning: "Outside footprint length of the whole region.",
                    },
                    {
                      label: `Outer width (${unitSet.dimUnit})`,
                      meaning: "Outside footprint width of the whole region.",
                    },
                    {
                      label: `Inner length (${unitSet.dimUnit})`,
                      meaning: "Cutout length you will not cover with topsoil.",
                    },
                    {
                      label: `Inner width (${unitSet.dimUnit})`,
                      meaning: "Cutout width you will not cover with topsoil.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Topsoil thickness applied only to the border area.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for feathering soil edges and blending transitions.",
                    },
                  ]}
                  formulas={[
                    {
                      label: "Outer area",
                      formula: "Aout = outer_length × outer_width",
                    },
                    {
                      label: "Inner area",
                      formula: "Ain = inner_length × inner_width",
                    },
                    { label: "Border area", formula: "A = Aout - Ain" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "Inner dimensions must be smaller than outer dimensions. If not, swap them or re-measure.",
                    "Cutout position does not matter for area, only cutout size matters.",
                    "If you have multiple cutouts, compute them separately and subtract (or add waste conservatively).",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="circle_border"
                  title={`Circle border (ring)`}
                  whenToUse="Use Circle border for ring-shaped areas: around a tree trunk, around a circular patio, or any donut-shaped footprint."
                  diagramMeans={`The preview shows outer radius and inner radius. The footprint is πRout² - πRin². Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="Swapping inner and outer values is common. For topsoil, the squared radii make the difference between a small ring and a surprisingly large order."
                  inputs={[
                    {
                      label: `Outer radius (${unitSet.dimUnit})`,
                      meaning: "Center-to-outer-edge distance.",
                    },
                    {
                      label: `Inner radius (${unitSet.dimUnit})`,
                      meaning: "Center-to-inner-edge distance (the void).",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning: "Topsoil thickness applied to the ring only.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for uneven edges or soil that spreads beyond the ring.",
                    },
                  ]}
                  formulas={[
                    { label: "Outer area", formula: "Aout = π × Rout²" },
                    { label: "Inner area", formula: "Ain = π × Rin²" },
                    { label: "Ring area", formula: "A = Aout - Ain" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "Inner radius must be smaller than outer radius. If not, swap them or re-measure.",
                    "If you measured diameters, divide by 2 before input.",
                    "Thin rings are sensitive to measurement error. Use a modest waste buffer if you are estimating by eye.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="triangle_border"
                  title={`Triangle border`}
                  whenToUse="Use Triangle border when you are adding topsoil in a triangular perimeter zone that excludes a smaller triangular cutout."
                  diagramMeans={`The preview shows an outer triangle (base/height) and an inner triangle cutout (base/height). The footprint is outer area minus inner area. Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="This is common near hardscape corners and transitions. Subtracting the inner triangle prevents overbuy and keeps estimates aligned with what you will actually spread."
                  inputs={[
                    {
                      label: `Outer base (${unitSet.dimUnit})`,
                      meaning: "Base edge length of the outer triangle.",
                    },
                    {
                      label: `Outer height (${unitSet.dimUnit})`,
                      meaning: "Perpendicular height of the outer triangle.",
                    },
                    {
                      label: `Inner base (${unitSet.dimUnit})`,
                      meaning: "Base edge length of the inner cutout triangle.",
                    },
                    {
                      label: `Inner height (${unitSet.dimUnit})`,
                      meaning:
                        "Perpendicular height of the inner cutout triangle.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Topsoil thickness applied to the border area only.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for irregular edges and blending into surrounding grade.",
                    },
                  ]}
                  formulas={[
                    {
                      label: "Outer area",
                      formula: "Aout = (outer_base × outer_height) ÷ 2",
                    },
                    {
                      label: "Inner area",
                      formula: "Ain = (inner_base × inner_height) ÷ 2",
                    },
                    { label: "Border area", formula: "A = Aout - Ain" },
                    { label: "Volume", formula: "V = A × depth" },
                    {
                      label: "Waste volume",
                      formula: "Vw = V × (1 + waste% ÷ 100)",
                    },
                  ]}
                  checks={[
                    "For both triangles, height must be perpendicular. Using a slanted side inflates area.",
                    "Inner values must be smaller than outer values, otherwise subtraction becomes negative.",
                    "If the inner cutout is not similar to the outer triangle, the estimate is still useful, but increase waste slightly.",
                  ]}
                />
              </div>
            ))}

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
                  Practical note
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-sky-300">
                  Topsoil is not a precision pour
                </h3>
                <p className="mt-3 text-slate-200 leading-7">
                  The output is a planning estimate based on footprint geometry,
                  your chosen depth, and an optional waste buffer. Real jobs
                  vary because you feather edges, fill low spots deeper than
                  your “average depth,” and lose some soil to spillage and
                  raking. If your project is leveling or regrading, increase
                  waste to reflect the uncertainty, and prefer bulk units (yd³
                  or m³) so you have enough on hand.
                </p>

                <div className="mt-4">
                  <Expandable
                    title="Buying strategy (bulk vs bags) and depth guidance"
                    subtitle="Open if you are deciding how to purchase and how to choose depth."
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Thin lawn topdressing layers are often fractions of an
                        inch or a few centimeters. Double-check the depth unit
                        selector before trusting the result.
                      </li>
                      <li>
                        If you are filling depressions or leveling, an “average
                        depth” can understate what you need. Add waste or split
                        the job into sections with different depths.
                      </li>
                      <li>
                        Bags are convenient for small jobs and tight access, but
                        they are usually priced higher per volume. Use ft³ or
                        liters outputs to match bag labeling and round up.
                      </li>
                      <li>
                        Bulk is typically sold in yd³ or m³. Use the same unit
                        as your supplier quote before comparing prices.
                      </li>
                      <li>
                        If you are blending into existing soil, you may spread a
                        little wider than your measured footprint. That is what
                        waste percent is for.
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
