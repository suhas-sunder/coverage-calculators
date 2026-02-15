import { useId } from "react";
import ShapePreview from "~/client/components/mulch-coverage-calculator/ShapePreview";

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
    label: "US-style example set",
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

export default function HowItWorksMulch() {
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
                  How the mulch coverage calculator works
                </h2>
                <p className="text-center sm:text-left mt-2 text-slate-600 leading-7 max-w-3xl">
                  This calculator turns a measured footprint into mulch volume.
                  You pick a shape, enter dimensions in your preferred units,
                  and choose a depth. The tool computes area from the shape,
                  then computes volume as area × depth, and finally converts the
                  same volume into practical buying units. The preview diagrams
                  exist to stop the high-cost mistakes: radius versus diameter,
                  triangle height versus slanted side, and border cutouts that
                  must be subtracted.
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
              subtitle="These examples pick units on purpose. The preview diagrams below use the same unit system as the example they are describing."
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
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example A (US): rectangle, ft + in, compare bulk vs bags
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: ft (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are refreshing mulch along a front walkway bed that is{" "}
                    <span className="font-semibold text-slate-900">20 ft</span>{" "}
                    long by{" "}
                    <span className="font-semibold text-slate-900">8 ft</span>{" "}
                    wide. You want a{" "}
                    <span className="font-semibold text-slate-900">3 in</span>{" "}
                    layer to cover old, faded mulch. You want enough to finish
                    in one trip.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Rectangle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">ft</span>.
                      Enter Length <span className="font-semibold">20</span> and
                      Width <span className="font-semibold">8</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">3</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">10%</span> if your
                      edge is uneven or you expect settling.
                    </li>
                    <li>
                      Read results in <span className="font-semibold">ft³</span>{" "}
                      for bags and <span className="font-semibold">yd³</span>{" "}
                      for bulk delivery.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why this example is realistic: many big-box bags are sold in
                    cubic feet, while bulk is sold in cubic yards. Seeing both
                    lets you decide if delivery is worth it.
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example B (Canada/UK): circle, m + cm, quote in m³
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: m (dims) • cm (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are mulching a round tree ring in a backyard where you
                    measure with a metric tape. The ring has a radius of{" "}
                    <span className="font-semibold text-slate-900">1.2 m</span>{" "}
                    and you want a{" "}
                    <span className="font-semibold text-slate-900">7 cm</span>{" "}
                    top-up. The landscape yard quotes bulk mulch in{" "}
                    <span className="font-semibold text-slate-900">m³</span>.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Circle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">m</span>.
                      Enter Radius <span className="font-semibold">1.2</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">7</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">5%</span> if the
                      bed is not perfectly level or you have roots and bumps.
                    </li>
                    <li>
                      Read headline in <span className="font-semibold">m³</span>{" "}
                      for the quote, then check{" "}
                      <span className="font-semibold">L</span> if you want a
                      more intuitive number.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    The mistake this prevents: if you accidentally input the
                    diameter (2.4 m) as the radius, area and volume jump 4×.
                  </div>
                </div>

                {/* NEW: Example C */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example C (General): triangle, yd + in, estimating a
                      corner wedge
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: yd (dims) • in (depth)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You have a corner wedge bed by a patio. It measures{" "}
                    <span className="font-semibold text-slate-900">5 yd</span>{" "}
                    along the back edge (base) and{" "}
                    <span className="font-semibold text-slate-900">3 yd</span>{" "}
                    perpendicular out from the corner (height). You want a{" "}
                    <span className="font-semibold text-slate-900">2.5 in</span>{" "}
                    mulch top-up and you want the result in the same
                    bulk-friendly units you see in landscape quotes.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Triangle</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">yd</span>.
                      Enter Base <span className="font-semibold">5</span> and
                      Height <span className="font-semibold">3</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">in</span>.
                      Enter Depth <span className="font-semibold">2.5</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">8%</span> if the
                      edges are irregular or the wedge is “close enough” rather
                      than perfectly triangular.
                    </li>
                    <li>
                      Read results in <span className="font-semibold">yd³</span>{" "}
                      for bulk, and cross-check{" "}
                      <span className="font-semibold">ft³</span> if you’re
                      sanity-checking against bags.
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why this example is realistic: landscapers often think in
                    yards for both layout and bulk material. A wedge bed is
                    where people most often confuse “height” with a sloped edge,
                    so use the diagram and measure perpendicular to the base.
                  </div>
                </div>

                {/* NEW: Example D (Litres output) */}
                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      Example D (General): square, cm + cm, final answer in
                      Litres
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Units: cm (dims) • cm (depth) • L (output)
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 leading-7">
                    <div className="font-semibold text-slate-900">
                      Scenario:
                    </div>
                    You are filling a raised planter that is a neat square. The
                    inside footprint is{" "}
                    <span className="font-semibold text-slate-900">240 cm</span>{" "}
                    by{" "}
                    <span className="font-semibold text-slate-900">240 cm</span>
                    . You want a{" "}
                    <span className="font-semibold text-slate-900">6 cm</span>{" "}
                    mulch layer, and you want the result in{" "}
                    <span className="font-semibold text-slate-900">Litres</span>{" "}
                    because local garden centers list bag volumes in liters.
                  </div>

                  <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-7">
                    <li>
                      Shape: <span className="font-semibold">Square</span>
                    </li>
                    <li>
                      Dimension unit: <span className="font-semibold">cm</span>.
                      Enter Side <span className="font-semibold">240</span>.
                    </li>
                    <li>
                      Depth unit: <span className="font-semibold">cm</span>.
                      Enter Depth <span className="font-semibold">6</span>.
                    </li>
                    <li>
                      Waste: <span className="font-semibold">5%</span> if you
                      expect settling or you’ll spill during spreading.
                    </li>
                    <li>
                      Set output to <span className="font-semibold">L</span> and
                      use the headline liters number to match bag options (for
                      example 40 L bags).
                    </li>
                  </ol>

                  <div className="mt-3 text-sm text-slate-600 leading-7">
                    Why liters matters: when bags are labeled 40 L, 56 L, or 70
                    L, a liters output prevents manual conversions and makes it
                    obvious how many bags you need once you divide by the bag
                    size and round up.
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
                      derived from the chosen selectors (ft/in/yd or m/cm).
                    </li>
                    <li>
                      Compute area A for the selected shape
                      (square/rectangle/circle/ triangle or border variant).
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
                      If bag sizing is used: bags_exact = Vw ÷ bag_volume, and
                      the buy count is rounded up.
                    </li>
                  </ul>
                </Expandable>
              </div>
            </CardShell>

            {/* EXPLAIN ALL SHAPES TWICE: once in US set, once in metric set */}
            {UNIT_SETS.map((unitSet) => (
              <div key={unitSet.id} className="space-y-6">
                <ShapeExplainer
                  unitSet={unitSet}
                  shape="rectangle"
                  title="Rectangle"
                  whenToUse="Use Rectangle for straight-edged beds: long borders along a fence, a strip beside a driveway, or a simple garden box."
                  diagramMeans={`Length and Width are the two ground measurements that define the footprint. In this section the diagram labels are shown in ${unitSet.dimUnit}.`}
                  whyMatters="The rectangle formula is simple, but the real-world errors are not: wrong unit selectors, swapping a depth unit, or measuring the outside edge when you really meant the inside edge."
                  inputs={[
                    {
                      label: `Length (${unitSet.dimUnit})`,
                      meaning:
                        "Measured along the long edge of the bed on the ground.",
                    },
                    {
                      label: `Width (${unitSet.dimUnit})`,
                      meaning:
                        "Measured across the bed, perpendicular to length.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Thickness of mulch to add. This is what converts area into volume.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Planning buffer for uneven grade, settling, and imperfect edges.",
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
                    `If depth is entered in ${unitSet.depthUnit} but the selector is wrong, volume will be off by a big factor (12× when inches and feet are mixed).`,
                    "If you are measuring a bed that curves slightly, rectangle is still a good estimate but use waste to cover the irregular edges.",
                    "If your result is surprisingly small, verify you did not enter centimeters while the selector is meters (or inches while the selector is feet).",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="square"
                  title="Square"
                  whenToUse="Use Square when the footprint is truly equal on all sides: square planters, square paver cutouts, or compact beds."
                  diagramMeans={`The preview shows one side labeled Length, because a square uses the same side for both dimensions. The unit shown is ${unitSet.dimUnit}.`}
                  whyMatters="Square reduces input effort and reduces mismatched sides, but it only works if the footprint is actually square. If one side is longer, use Rectangle."
                  inputs={[
                    {
                      label: `Side (${unitSet.dimUnit})`,
                      meaning:
                        "One side of the footprint on the ground. Used twice in the area calculation.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Mulch thickness. Doubling depth doubles volume.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer. Useful when edges are not perfectly straight.",
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
                    "Do not use Square as a shortcut for rectangles. A small mismatch in sides can change area enough to affect bag counts.",
                    "If you are matching a bulk quote, sanity-check with a second output unit (yd³ or m³) so the number “feels” right.",
                    "If your square is actually a border around something, use a border shape instead so you subtract the cutout.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="circle"
                  title="Circle"
                  whenToUse="Use Circle for round beds, tree rings, circular planters, and anything measured from a central point."
                  diagramMeans={`The preview labels Radius from the center to the edge. The unit on the diagram is ${unitSet.dimUnit}.`}
                  whyMatters="Circle errors are expensive because radius is squared. If radius is doubled, area becomes 4×. The diagram is there to make “radius” unambiguous."
                  inputs={[
                    {
                      label: `Radius (${unitSet.dimUnit})`,
                      meaning:
                        "Center-to-edge distance. If you measured across the full circle, you measured diameter, not radius.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Mulch thickness applied uniformly across the circle footprint.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for roots, bumps, and irregular edging.",
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
                    "If the circle is not perfect, measure two radii at right angles, average them, and add a small waste buffer.",
                    "If the result is 4× too big, the most likely cause is diameter entered as radius.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="triangle"
                  title="Triangle"
                  whenToUse="Use Triangle for wedge-shaped corners, tapered beds, or any area where you can define one base and a perpendicular height."
                  diagramMeans={`The preview shows Base along the bottom and Height as a straight up-and-down perpendicular measurement. Units shown are ${unitSet.dimUnit}.`}
                  whyMatters="The most common triangle mistake is using a sloped edge as height. The calculator needs the perpendicular height because that is what the area formula uses."
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
                        "Mulch thickness applied across the triangle footprint.",
                    },
                    {
                      label: "Waste %",
                      meaning:
                        "Optional buffer for irregular edges or measurement uncertainty.",
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
                    "If you only have the three side lengths and no perpendicular height, triangle is harder to measure accurately. Use a right-angle measurement if possible.",
                    "If the triangle is part of a larger bed, consider splitting the job into a rectangle plus a triangle to reduce error.",
                    "If you used the slanted side as height, your area is overstated.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="rectangle_border"
                  title="Rectangle border"
                  whenToUse="Use Rectangle border when you mulch around a rectangular cutout: around a patio, around a shed pad, or around a rectangular feature you are not covering."
                  diagramMeans={`The preview shows an outer rectangle and an inner rectangle. The mulch footprint is the difference: outer minus inner. Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="Border shapes prevent overbuy. People often measure the outside footprint and forget to subtract what they are not mulching. This shape forces the subtraction."
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
                      meaning: "Cutout length you will not cover with mulch.",
                    },
                    {
                      label: `Inner width (${unitSet.dimUnit})`,
                      meaning: "Cutout width you will not cover with mulch.",
                    },
                    {
                      label: `Depth (${unitSet.depthUnit})`,
                      meaning:
                        "Mulch thickness applied only to the border area.",
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
                  ]}
                  checks={[
                    "Inner dimensions must be smaller than outer dimensions. If not, the cutout is invalid or swapped.",
                    "Cutout position does not matter for area, only the cutout size matters.",
                    "If you have multiple cutouts, compute them separately and subtract, or add waste conservatively.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="circle_border"
                  title="Circle border (ring)"
                  whenToUse="Use Circle border for donut shapes: tree rings, circular beds around a fountain, or any area between an outer edge and an inner edge."
                  diagramMeans={`The preview shows outer radius and inner radius. The mulched footprint is πRout² - πRin². Diagram units are ${unitSet.dimUnit}.`}
                  whyMatters="Circle borders are one of the easiest places to swap inner and outer values. The diagram makes the relationship obvious, and the math is sensitive because radii are squared."
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
                      meaning: "Mulch thickness applied to the ring only.",
                    },
                  ]}
                  formulas={[
                    { label: "Outer area", formula: "Aout = π × Rout²" },
                    { label: "Inner area", formula: "Ain = π × Rin²" },
                    { label: "Ring area", formula: "A = Aout - Ain" },
                    { label: "Volume", formula: "V = A × depth" },
                  ]}
                  checks={[
                    "Inner radius must be smaller than outer radius. If it is not, swap them or re-measure.",
                    "If you measured inner/outer diameters, divide by 2 before input.",
                    "If the ring is thin, small measurement error can matter. Use a modest waste buffer.",
                  ]}
                />

                <ShapeExplainer
                  unitSet={unitSet}
                  shape="triangle_border"
                  title="Triangle border"
                  whenToUse="Use Triangle border when you are mulching around a triangular cutout or you have a triangular perimeter zone that excludes a similar inner triangle."
                  diagramMeans={`The preview shows outer base/height and inner base/height. The mulch footprint is outer triangle area minus inner triangle area. Units shown are ${unitSet.dimUnit}.`}
                  whyMatters="Triangle borders show up in corners and hardscape transitions. Subtracting the inner triangle prevents a systematic overbuy that is hard to notice until you compare to what was actually installed."
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
                        "Mulch thickness applied to the border area only.",
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
                  ]}
                  checks={[
                    "For both triangles, height must be perpendicular. Using a slanted side inflates area.",
                    "Inner values must be smaller than outer values, otherwise the subtraction becomes negative.",
                    "If the inner cutout is not similar to the outer triangle, this still approximates well but increase waste slightly.",
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
                  Utility note
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-sky-300">
                  Estimates are planning outputs
                </h3>
                <p className="mt-3 text-slate-200 leading-7">
                  This tool uses standard geometry plus your chosen depth and
                  optional waste buffer. It does not model compaction, settling
                  over time, slope correction, drainage layers, or product
                  density differences. For buying, confirm depth guidance for
                  your project and use a realistic waste percent if your bed
                  edges are irregular or your shape is an approximation.
                </p>

                <div className="mt-4">
                  <Expandable
                    title="Hardcore notes (depth, compaction, and buying strategy)"
                    subtitle="For users comparing contractor quotes, bulk delivery, and bagged mulch."
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        If you are topping up existing mulch, enter the depth
                        you intend to add, not the total depth already present.
                      </li>
                      <li>
                        A “3 inch” layer often settles. If you need an effective
                        3 inches after settling, plan slightly higher or add a
                        small waste buffer.
                      </li>
                      <li>
                        Bagged mulch is sold by volume (often ft³) but may fluff
                        differently by brand. Use the rounded-up bag count, not
                        the exact decimal.
                      </li>
                      <li>
                        Bulk is typically yd³ or m³. Use the same unit as the
                        quote before comparing prices.
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
