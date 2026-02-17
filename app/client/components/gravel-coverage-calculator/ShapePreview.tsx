type Shape =
  | "square"
  | "rectangle"
  | "circle"
  | "triangle"
  | "rectangle_border"
  | "circle_border"
  | "triangle_border";

type LinearUnit = "ft" | "in" | "yd" | "m" | "cm";

export default function ShapePreview(props: {
  shape: Shape;
  unit: LinearUnit;
}) {
  const { shape, unit } = props;

  function DimArrowSvgDefs() {
    return (
      <defs>
        <marker
          id="arrowHead"
          markerWidth="6"
          markerHeight="6"
          refX="5.4"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>
    );
  }

  function DimLine(props: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    labelX: number;
    labelY: number;
    textAnchor?: "start" | "middle" | "end";
  }) {
    const {
      x1,
      y1,
      x2,
      y2,
      label,
      labelX,
      labelY,
      textAnchor = "middle",
    } = props;

    return (
      <>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#64748b"
          strokeWidth={1.4}
          markerStart="url(#arrowHead)"
          markerEnd="url(#arrowHead)"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor={textAnchor}
          fontSize="10"
          fill="#0f172a"
          fontWeight="700"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </>
    );
  }

  function DimLineBare(props: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) {
    const { x1, y1, x2, y2 } = props;
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#64748b"
        strokeWidth={1.4}
        markerStart="url(#arrowHead)"
        markerEnd="url(#arrowHead)"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    );
  }

  function Tick(props: { x: number; y: number; dx: number; dy: number }) {
    const { x, y, dx, dy } = props;
    return (
      <line
        x1={x - dx}
        y1={y - dy}
        x2={x + dx}
        y2={y + dy}
        stroke="#94a3b8"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    );
  }

  function CalloutLabel(props: {
    x: number;
    y: number;
    text: string;
    anchor?: "start" | "middle" | "end";
    leaderTo?: { x: number; y: number };
  }) {
    const { x, y, text, anchor = "middle", leaderTo } = props;

    const clamp = (n: number, a: number, b: number) =>
      Math.max(a, Math.min(b, n));
    const approxCharW = 6.2;
    const textW = clamp(Math.round(text.length * approxCharW), 56, 160);
    const padX = 8;
    const padY = 6;
    const boxW = textW + padX * 2;
    const boxH = 22;

    const left =
      anchor === "start" ? x : anchor === "end" ? x - boxW : x - boxW / 2;
    const top = y - boxH / 2;

    const textX =
      anchor === "start"
        ? left + padX
        : anchor === "end"
          ? left + boxW - padX
          : left + boxW / 2;

    return (
      <g>
        {leaderTo ? (
          <line
            x1={leaderTo.x}
            y1={leaderTo.y}
            x2={
              anchor === "start"
                ? left
                : anchor === "end"
                  ? left + boxW
                  : left + boxW / 2
            }
            y2={y}
            stroke="#94a3b8"
            strokeWidth={1.1}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        ) : null}

        <rect
          x={left}
          y={top}
          width={boxW}
          height={boxH}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.1}
        />
        <text
          x={textX}
          y={y}
          textAnchor={
            anchor === "start" ? "start" : anchor === "end" ? "end" : "middle"
          }
          fontSize="10"
          fill="#0f172a"
          fontWeight="800"
          dominantBaseline="middle"
        >
          {text}
        </text>
      </g>
    );
  }

  const Box = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3 mt-2 shadow-sm min-w-[320px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-xs font-semibold text-slate-700">
          Area Shape Preview
        </div>
        <div className="text-[11px] font-semibold text-slate-500">
          Units: {unit}
        </div>
      </div>
      <div className="scale-[1.1]">{children}</div>
    </div>
  );

  const Svg = ({ children }: { children: React.ReactNode }) => (
    <svg
      viewBox="0 0 280 180"
      className="w-full h-[150px]"
      role="img"
      aria-label="Shape preview"
    >
      <DimArrowSvgDefs />
      <rect x="10" y="10" width="260" height="160" rx="16" fill="#ffffff" />
      {children}
    </svg>
  );

  const label = (name: string) => `${name} (${unit})`;

  // ---- Layout system (prevents drift + collisions) ----
  // Panel interior bounds:
  const P_LEFT = 10;
  const P_TOP = 10;
  const P_W = 260;
  const P_H = 160;
  const P_RIGHT = P_LEFT + P_W;
  const P_BOTTOM = P_TOP + P_H;

  // Shape box (big, centered)
  const S_LEFT = 72;
  const S_TOP = 52;
  const S_W = 136;
  const S_H = 86;
  const S_RIGHT = S_LEFT + S_W;
  const S_BOTTOM = S_TOP + S_H;
  const S_CX = S_LEFT + S_W / 2;
  const S_CY = S_TOP + S_H / 2;

  // Dedicated dimension lanes (outside shape box, inside panel)
  const LANE_TOP_Y = 28;
  const LANE_BOTTOM_Y = 156;
  const LANE_LEFT_X = 28;
  const LANE_RIGHT_X = 252;

  // Extension line (subtle)
  const Ext = (p: { x1: number; y1: number; x2: number; y2: number }) => (
    <line
      x1={p.x1}
      y1={p.y1}
      x2={p.x2}
      y2={p.y2}
      stroke="#94a3b8"
      strokeWidth={1.1}
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
    />
  );

  const strokeOuter = "#0ea5e9";
  const strokeInner = "#38bdf8";

  if (shape === "square") {
    const size = Math.min(S_W, S_H);
    const x = S_CX - size / 2;
    const y = S_CY - size / 2;

    return (
      <Box>
        <Svg>
          <rect
            x={x}
            y={y}
            width={size}
            height={size}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />

          <Tick x={x} y={LANE_TOP_Y} dx={0} dy={6} />
          <Tick x={x + size} y={LANE_TOP_Y} dx={0} dy={6} />
          <DimLine
            x1={x}
            y1={LANE_TOP_Y}
            x2={x + size}
            y2={LANE_TOP_Y}
            label={label("Length")}
            labelX={S_CX}
            labelY={LANE_TOP_Y - 10}
          />
          <Ext x1={x} y1={LANE_TOP_Y} x2={x} y2={y} />
          <Ext x1={x + size} y1={LANE_TOP_Y} x2={x + size} y2={y} />
        </Svg>
      </Box>
    );
  }

  if (shape === "rectangle") {
    const x = S_LEFT;
    const y = S_TOP;
    const w = S_W;
    const h = S_H;

    return (
      <Box>
        <Svg>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />

          {/* Length (top lane) */}
          <Tick x={x} y={LANE_TOP_Y} dx={0} dy={6} />
          <Tick x={x + w} y={LANE_TOP_Y} dx={0} dy={6} />
          <DimLine
            x1={x}
            y1={LANE_TOP_Y}
            x2={x + w}
            y2={LANE_TOP_Y}
            label={label("Length")}
            labelX={S_CX}
            labelY={LANE_TOP_Y - 10}
          />
          <Ext x1={x} y1={LANE_TOP_Y} x2={x} y2={y} />
          <Ext x1={x + w} y1={LANE_TOP_Y} x2={x + w} y2={y} />

          {/* Width (right lane) */}
          <Tick x={LANE_RIGHT_X} y={y} dx={6} dy={0} />
          <Tick x={LANE_RIGHT_X} y={y + h} dx={6} dy={0} />
          <DimLine
            x1={LANE_RIGHT_X}
            y1={y}
            x2={LANE_RIGHT_X}
            y2={y + h}
            label={label("Width")}
            labelX={LANE_RIGHT_X + 10}
            labelY={S_CY}
            textAnchor="start"
          />
          <Ext x1={LANE_RIGHT_X} y1={y} x2={x + w} y2={y} />
          <Ext x1={LANE_RIGHT_X} y1={y + h} x2={x + w} y2={y + h} />
        </Svg>
      </Box>
    );
  }

  if (shape === "rectangle_border") {
    const xO = S_LEFT;
    const yO = S_TOP;
    const wO = S_W;
    const hO = S_H;

    const inset = 18;
    const xI = xO + inset;
    const yI = yO + inset;
    const wI = wO - inset * 2;
    const hI = hO - inset * 2;

    // Border width dimension (right side, between inner and outer)
    const bwY = S_CY;
    const bwX1 = xI + wI; // inner right edge
    const bwX2 = xO + wO; // outer right edge
    const bwMid = { x: (bwX1 + bwX2) / 2, y: bwY };

    // Put label in open whitespace, not on top of the arrows/lines
    const calloutX = Math.min(P_RIGHT + 14, bwX2 + 103);
    const calloutY = bwY - 83;

    return (
      <Box>
        <Svg>
          <rect
            x={xO}
            y={yO}
            width={wO}
            height={hO}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />
          <rect
            x={xI}
            y={yI}
            width={wI}
            height={hI}
            fill="#f7fbff"
            stroke={strokeInner}
            strokeWidth={3}
          />

          {/* Outer Length (top lane) */}
          <Tick x={xO} y={LANE_TOP_Y} dx={0} dy={6} />
          <Tick x={xO + wO} y={LANE_TOP_Y} dx={0} dy={6} />
          <DimLine
            x1={xO}
            y1={LANE_TOP_Y}
            x2={xO + wO}
            y2={LANE_TOP_Y}
            label={label("Outer Length")}
            labelX={S_CX}
            labelY={LANE_TOP_Y - 10}
          />
          <Ext x1={xO} y1={LANE_TOP_Y} x2={xO} y2={yO} />
          <Ext x1={xO + wO} y1={LANE_TOP_Y} x2={xO + wO} y2={yO} />

          {/* Outer Width (right lane) */}
          <Tick x={LANE_RIGHT_X} y={yO} dx={6} dy={0} />
          <Tick x={LANE_RIGHT_X} y={yO + hO} dx={6} dy={0} />
          <DimLine
            x1={LANE_RIGHT_X}
            y1={yO}
            x2={LANE_RIGHT_X}
            y2={yO + hO}
            label={label("Outer Width")}
            labelX={LANE_RIGHT_X + 10}
            labelY={S_CY}
            textAnchor="start"
          />
          <Ext x1={LANE_RIGHT_X} y1={yO} x2={xO + wO} y2={yO} />
          <Ext x1={LANE_RIGHT_X} y1={yO + hO} x2={xO + wO} y2={yO + hO} />

          {/* Inner Length (bottom lane) */}
          <Tick x={xI} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <Tick x={xI + wI} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <DimLine
            x1={xI}
            y1={LANE_BOTTOM_Y}
            x2={xI + wI}
            y2={LANE_BOTTOM_Y}
            label={label("Inner Length")}
            labelX={S_CX}
            labelY={LANE_BOTTOM_Y + 10}
          />
          <Ext x1={xI} y1={LANE_BOTTOM_Y} x2={xI} y2={yI + hI} />
          <Ext x1={xI + wI} y1={LANE_BOTTOM_Y} x2={xI + wI} y2={yI + hI} />

          {/* Inner Width (left lane) */}
          <Tick x={LANE_LEFT_X} y={yI} dx={-6} dy={0} />
          <Tick x={LANE_LEFT_X} y={yI + hI} dx={-6} dy={0} />
          <DimLine
            x1={LANE_LEFT_X}
            y1={yI}
            x2={LANE_LEFT_X}
            y2={yI + hI}
            label={label("Inner Width")}
            labelX={LANE_LEFT_X - 10}
            labelY={S_CY}
            textAnchor="end"
          />
          <Ext x1={LANE_LEFT_X} y1={yI} x2={xI} y2={yI} />
          <Ext x1={LANE_LEFT_X} y1={yI + hI} x2={xI} y2={yI + hI} />

          {/* Border Width (clean callout, not on top of lines) */}
          <Tick x={bwX1} y={bwY} dx={0} dy={6} />
          <Tick x={bwX2} y={bwY} dx={0} dy={6} />
          <DimLineBare x1={bwX1} y1={bwY} x2={bwX2} y2={bwY} />
          <CalloutLabel
            x={calloutX}
            y={calloutY}
            anchor="middle"
            text={label("Border Width [outer - inner]")}
            leaderTo={bwMid}
          />
        </Svg>
      </Box>
    );
  }

  if (shape === "circle") {
    const r = Math.min(S_W, S_H) * 0.44;

    return (
      <Box>
        <Svg>
          <circle
            cx={S_CX}
            cy={S_CY}
            r={r}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />

          {/* Radius (top lane) */}
          <Tick x={S_CX} y={LANE_TOP_Y} dx={0} dy={6} />
          <Tick x={S_CX + r} y={LANE_TOP_Y} dx={0} dy={6} />
          <DimLine
            x1={S_CX}
            y1={LANE_TOP_Y}
            x2={S_CX + r}
            y2={LANE_TOP_Y}
            label={label("Radius")}
            labelX={S_CX + r / 2}
            labelY={LANE_TOP_Y - 10}
          />
          <Ext x1={S_CX} y1={LANE_TOP_Y} x2={S_CX} y2={S_CY} />
          <Ext x1={S_CX + r} y1={LANE_TOP_Y} x2={S_CX + r} y2={S_CY} />
        </Svg>
      </Box>
    );
  }

  if (shape === "circle_border") {
    const rO = Math.min(S_W, S_H) * 0.48;
    const rI = Math.min(S_W, S_H) * 0.28;

    // Border width dimension (right side, between inner and outer)
    const bwY = S_CY;
    const bwX1 = S_CX + rI;
    const bwX2 = S_CX + rO;
    const bwMid = { x: (bwX1 + bwX2) / 2, y: bwY };

    // Put label in open whitespace to the right and a bit up
    const calloutX = Math.min(P_LEFT - 14, bwX2 + 70);
    const calloutY = bwY;

    return (
      <Box>
        <Svg>
          <circle
            cx={S_CX}
            cy={S_CY}
            r={rO}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />
          <circle
            cx={S_CX}
            cy={S_CY}
            r={rI}
            fill="#f7fbff"
            stroke={strokeInner}
            strokeWidth={3}
          />

          {/* Outer Radius (top lane) */}
          <Tick x={S_CX} y={LANE_TOP_Y} dx={0} dy={6} />
          <Tick x={S_CX + rO} y={LANE_TOP_Y} dx={0} dy={6} />
          <DimLine
            x1={S_CX}
            y1={LANE_TOP_Y}
            x2={S_CX + rO}
            y2={LANE_TOP_Y}
            label={label("Outer Radius")}
            labelX={S_CX + rO / 2}
            labelY={LANE_TOP_Y - 10}
          />
          <Ext x1={S_CX} y1={LANE_TOP_Y} x2={S_CX} y2={S_CY} />
          <Ext x1={S_CX + rO} y1={LANE_TOP_Y} x2={S_CX + rO} y2={S_CY} />

          {/* Inner Radius (bottom lane) */}
          <Tick x={S_CX} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <Tick x={S_CX + rI} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <DimLine
            x1={S_CX}
            y1={LANE_BOTTOM_Y}
            x2={S_CX + rI}
            y2={LANE_BOTTOM_Y}
            label={label("Inner Radius")}
            labelX={S_CX + rI / 2}
            labelY={LANE_BOTTOM_Y + 10}
          />
          <Ext x1={S_CX} y1={LANE_BOTTOM_Y} x2={S_CX} y2={S_CY} />
          <Ext x1={S_CX + rI} y1={LANE_BOTTOM_Y} x2={S_CX + rI} y2={S_CY} />

          {/* Border Width (clean callout, not on top of lines) */}
          <Tick x={bwX1} y={bwY} dx={0} dy={6} />
          <Tick x={bwX2} y={bwY} dx={0} dy={6} />
          <DimLineBare x1={bwX1} y1={bwY} x2={bwX2} y2={bwY} />
          <CalloutLabel
            x={calloutX}
            y={calloutY}
            anchor="middle"
            text={label("Border Width [outer - inner]")}
            leaderTo={bwMid}
          />
        </Svg>
      </Box>
    );
  }

  if (shape === "triangle") {
    // clean centered isosceles triangle
    const p1 = { x: S_LEFT, y: S_BOTTOM };
    const p2 = { x: S_RIGHT, y: S_BOTTOM };
    const p3 = { x: S_CX, y: S_TOP };

    const baseMidX = (p1.x + p2.x) / 2;

    return (
      <Box>
        <Svg>
          <polygon
            points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
            fill="white"
            stroke={strokeOuter}
            strokeWidth={3}
          />

          {/* Base (bottom lane) */}
          <Tick x={p1.x} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <Tick x={p2.x} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
          <DimLine
            x1={p1.x}
            y1={LANE_BOTTOM_Y}
            x2={p2.x}
            y2={LANE_BOTTOM_Y}
            label={label("Base")}
            labelX={baseMidX}
            labelY={LANE_BOTTOM_Y + 10}
          />
          <Ext x1={p1.x} y1={LANE_BOTTOM_Y} x2={p1.x} y2={p1.y} />
          <Ext x1={p2.x} y1={LANE_BOTTOM_Y} x2={p2.x} y2={p2.y} />

          {/* Height (left lane) */}
          <Tick x={LANE_LEFT_X} y={p3.y} dx={-6} dy={0} />
          <Tick x={LANE_LEFT_X} y={p1.y} dx={-6} dy={0} />
          <DimLine
            x1={LANE_LEFT_X}
            y1={p3.y}
            x2={LANE_LEFT_X}
            y2={p1.y}
            label={label("Height")}
            labelX={LANE_LEFT_X - 10}
            labelY={(p3.y + p1.y) / 2}
            textAnchor="end"
          />
          <Ext x1={LANE_LEFT_X} y1={p3.y} x2={p3.x} y2={p3.y} />
          <Ext x1={LANE_LEFT_X} y1={p1.y} x2={baseMidX} y2={p1.y} />
        </Svg>
      </Box>
    );
  }

  // triangle_border (outer base/height and inner base/height)
  // Outer triangle (clean isosceles inside the shape box)
  const o1 = { x: S_LEFT, y: S_BOTTOM };
  const o2 = { x: S_RIGHT, y: S_BOTTOM };
  const o3 = { x: S_CX, y: S_TOP };

  // Inner triangle: true similar triangle scaled about the centroid
  const centroid = {
    x: (o1.x + o2.x + o3.x) / 3,
    y: (o1.y + o2.y + o3.y) / 3,
  };

  const inset = 18;
  const rawScale = (S_W - inset * 2) / S_W;
  const s = Math.max(0.55, Math.min(0.85, rawScale));

  const scalePoint = (p: { x: number; y: number }) => ({
    x: centroid.x + (p.x - centroid.x) * s,
    y: centroid.y + (p.y - centroid.y) * s,
  });

  const i1 = scalePoint(o1);
  const i2 = scalePoint(o2);
  const i3 = scalePoint(o3);

  const outerBaseMidX = (o1.x + o2.x) / 2;
  const innerBaseMidX = (i1.x + i2.x) / 2;

  // Put Inner Base high (top lane), with label above it (no overlap with shape)
  const innerBaseDimY = LANE_TOP_Y + 6;

  // Border width: measure thickness on the RIGHT slanted edge, closer to the mid area (matches user intent).
  // Use a horizontal slice halfway down the inner right edge.
  const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));

  const intersectHoriz = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    yH: number,
  ) => {
    const denom = b.y - a.y;
    const t = denom === 0 ? 0 : (yH - a.y) / denom;
    const tt = clamp01(t);
    return { x: lerp(a.x, b.x, tt), y: lerp(a.y, b.y, tt) };
  };

  // Choose a y closer to the middle of the inner right edge (near your red mark)
  const yH = (i2.y + i3.y) / 2;

  // Right outer edge is o2->o3, right inner edge is i2->i3
  const outerRightAtY = intersectHoriz(o2, o3, yH);
  const innerRightAtY = intersectHoriz(i2, i3, yH);

  const bwY = yH;
  const bwX1 = innerRightAtY.x; // inner side
  const bwX2 = outerRightAtY.x; // outer side
  const bwMid = { x: (bwX1 + bwX2) / 2, y: bwY };

  // Callout positioned near the thickness mark (not on top of lines), close to the triangle
  const calloutX = clamp(bwX2 + 24, P_LEFT + 22, P_RIGHT - 22);
  const calloutY = clamp(bwY + 6, P_TOP + 22, P_BOTTOM - 152);

  return (
    <Box>
      <Svg>
        {/* shapes */}
        <polygon
          points={`${o1.x},${o1.y} ${o2.x},${o2.y} ${o3.x},${o3.y}`}
          fill="white"
          stroke={strokeOuter}
          strokeWidth={3}
        />
        <polygon
          points={`${i1.x},${i1.y} ${i2.x},${i2.y} ${i3.x},${i3.y}`}
          fill="#f7fbff"
          stroke={strokeInner}
          strokeWidth={3}
        />

        {/* OUTER BASE (bottom lane) */}
        <Tick x={o1.x} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
        <Tick x={o2.x} y={LANE_BOTTOM_Y} dx={0} dy={-6} />
        <DimLine
          x1={o1.x}
          y1={LANE_BOTTOM_Y}
          x2={o2.x}
          y2={LANE_BOTTOM_Y}
          label={label("Outer Base")}
          labelX={outerBaseMidX}
          labelY={LANE_BOTTOM_Y + 10}
        />
        <Ext x1={o1.x} y1={LANE_BOTTOM_Y} x2={o1.x} y2={o1.y} />
        <Ext x1={o2.x} y1={LANE_BOTTOM_Y} x2={o2.x} y2={o2.y} />

        {/* INNER BASE (top lane, label above) */}
        <Tick x={i1.x} y={innerBaseDimY} dx={0} dy={6} />
        <Tick x={i2.x} y={innerBaseDimY} dx={0} dy={6} />
        <DimLine
          x1={i1.x}
          y1={innerBaseDimY}
          x2={i2.x}
          y2={innerBaseDimY}
          label={label("Inner Base")}
          labelX={innerBaseMidX}
          labelY={innerBaseDimY - 10}
        />
        <Ext x1={i1.x} y1={innerBaseDimY} x2={i1.x} y2={i1.y} />
        <Ext x1={i2.x} y1={innerBaseDimY} x2={i2.x} y2={i2.y} />

        {/* OUTER HEIGHT (left lane) */}
        <Tick x={LANE_LEFT_X} y={o3.y} dx={-6} dy={0} />
        <Tick x={LANE_LEFT_X} y={o1.y} dx={-6} dy={0} />
        <DimLine
          x1={LANE_LEFT_X}
          y1={o3.y}
          x2={LANE_LEFT_X}
          y2={o1.y}
          label={label("Outer Height")}
          labelX={LANE_LEFT_X - 10}
          labelY={(o3.y + o1.y) / 2}
          textAnchor="end"
        />
        <Ext x1={LANE_LEFT_X} y1={o3.y} x2={o3.x} y2={o3.y} />
        <Ext x1={LANE_LEFT_X} y1={o1.y} x2={outerBaseMidX} y2={o1.y} />

        {/* INNER HEIGHT (right lane) */}
        <Tick x={LANE_RIGHT_X} y={i3.y} dx={6} dy={0} />
        <Tick x={LANE_RIGHT_X} y={i1.y} dx={6} dy={0} />
        <DimLine
          x1={LANE_RIGHT_X}
          y1={i3.y}
          x2={LANE_RIGHT_X}
          y2={i1.y}
          label={label("Inner Height")}
          labelX={LANE_RIGHT_X + 10}
          labelY={(i3.y + i1.y) / 2}
          textAnchor="start"
        />
        <Ext x1={LANE_RIGHT_X} y1={i3.y} x2={i3.x} y2={i3.y} />
        <Ext x1={LANE_RIGHT_X} y1={i1.y} x2={innerBaseMidX} y2={i1.y} />

        {/* BORDER WIDTH (triangle_border) */}
        <Tick x={bwX1} y={bwY} dx={0} dy={6} />
        <Tick x={bwX2} y={bwY} dx={0} dy={6} />
        <DimLineBare x1={bwX1} y1={bwY} x2={bwX2} y2={bwY} />
        <CalloutLabel
          x={calloutX}
          y={calloutY}
          anchor="start"
          text={label("Border Width [outer - inner]")}
          leaderTo={bwMid}
        />
      </Svg>
    </Box>
  );
}
