import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/compost-coverage-calculator";
import ShapePreview from "~/client/components/compost-coverage-calculator/ShapePreview";
import Assumptions from "~/client/components/compost-coverage-calculator/Assumptions";
import HowItWorks from "~/client/components/compost-coverage-calculator/HowItWorks";
import ToolFit from "~/client/components/compost-coverage-calculator/ToolFit";
import FAQ from "~/client/components/compost-coverage-calculator/FAQ";

export const meta: Route.MetaFunction = () => [
  { title: "Compost Coverage Calculator: Compost Volume and Bag Counts" },
  {
    name: "description",
    content:
      "Convert garden bed area and depth into compost volume for bulk or bag purchases. Supports common shapes and border shapes. Outputs cubic yards, cubic feet, and bag counts.",
  },
  {
    name: "keywords",
    content:
      "compost calculator, compost coverage calculator, how much compost do i need, compost cubic yards, compost bags estimate, garden bed compost calculator, raised bed compost calculator",
  },
  { name: "robots", content: "index,follow" },
  { name: "author", content: "coveragecalculators.com" },
  { name: "theme-color", content: "#f8fafc" },

  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content: "Compost Coverage Calculator (Compost Volume)",
  },
  {
    property: "og:description",
    content:
      "Estimate compost needed from shape dimensions and depth. Outputs cubic yards, cubic feet, liters, cubic meters, bag counts, and optional weight and pricing.",
  },
  {
    property: "og:url",
    content: "https://www.coveragecalculators.com/compost-coverage-calculator",
  },
  { property: "og:site_name", content: "coveragecalculators.com" },
  {
    property: "og:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Compost Coverage Calculator (Compost Volume)",
  },
  {
    name: "twitter:description",
    content:
      "Convert bed area and depth into compost volume for bulk or bag purchases, with optional weight and pricing.",
  },
  {
    name: "twitter:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com/compost-coverage-calculator",
  },
];

const SCALE = 1_000_000n;

type ParseScaledResult = {
  ok: boolean;
  scaled?: bigint;
  normalized?: string;
  error?: string;
};

function absBigInt(x: bigint) {
  return x < 0n ? -x : x;
}

function roundScaledToDigits(scaled: bigint, digits: number): bigint {
  const d = Math.max(0, Math.min(6, digits));
  const drop = 6 - d;
  const factor = 10n ** BigInt(drop);
  const half = factor / 2n;

  const neg = scaled < 0n;
  const x = absBigInt(scaled);
  const rounded = (x + half) / factor;
  const back = rounded * factor;
  return neg ? -back : back;
}

function scaledToDecimalString(
  scaled: bigint,
  digits: number,
  opts?: { fixed?: boolean; trimTrailingZeros?: boolean },
): string {
  const d = Math.max(0, Math.min(6, digits));
  const neg = scaled < 0n;
  const x = absBigInt(scaled);

  const intPart = x / SCALE;
  const fracPart = x % SCALE;

  const fracStr6 = fracPart.toString().padStart(6, "0");
  const fracStr = d === 0 ? "" : fracStr6.slice(0, d);

  let out = d === 0 ? intPart.toString() : `${intPart.toString()}.${fracStr}`;

  if (opts?.trimTrailingZeros && d > 0) {
    out = out.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
  }

  if (opts?.fixed && d > 0) {
    const m = out.match(/^(-?\d+)(?:\.(\d+))?$/u);
    if (m) {
      const a = m[1];
      const b = (m[2] ?? "").padEnd(d, "0").slice(0, d);
      out = `${a}.${b}`;
    }
  }

  return neg ? `-${out}` : out;
}

function formatGroupedDecimalString(
  decimalStr: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  const raw = decimalStr.trim();
  if (!raw) return "—";
  if (!/^-?\d+(\.\d+)?$/u.test(raw)) return "—";

  const neg = raw.startsWith("-");
  const s = neg ? raw.slice(1) : raw;

  const [intRaw, fracRaw = ""] = s.split(".");
  const intPart = intRaw.replace(/^0+(?=\d)/u, "") || "0";

  const minFD = Math.max(0, Math.min(12, opts.minimumFractionDigits));
  const maxFD = Math.max(minFD, Math.min(12, opts.maximumFractionDigits));

  let frac = fracRaw.slice(0, maxFD);
  if (frac.length < minFD) frac = frac.padEnd(minFD, "0");

  const fmt = new Intl.NumberFormat(undefined, {
    useGrouping: true,
    maximumFractionDigits: 0,
  });
  const parts = fmt.formatToParts(0);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";

  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/gu, group);
  const out = frac.length > 0 ? `${groupedInt}${decimal}${frac}` : groupedInt;

  return neg ? `-${out}` : out;
}

function parseNonNegativeToScaled(
  input: string,
  cfg: {
    emptyError: string;
    negativeError?: string;
    maxScaled?: bigint;
    commaDecimalDigits?: "any" | "2";
  },
): ParseScaledResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: cfg.emptyError };

  const sanitized = raw.replace(/[^\d.,+\-()\s$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "");

  const isParenNeg =
    sanitized.includes("(") &&
    sanitized.includes(")") &&
    !sanitized.includes("-");
  const noParens = sanitized.replace(/[()]/g, "");

  const s0 = noParens.replace(/[$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "").replace(/\s+/g, "");

  if (!s0) return { ok: false, error: cfg.emptyError };

  const signCount = (s0.match(/[+\-]/g) ?? []).length;
  if (signCount > 1) {
    return {
      ok: false,
      error: "That number format looks unclear. Remove extra + or - signs.",
    };
  }

  let s = s0;
  const hasMinus = s.includes("-");
  s = s.replace(/[+\-]/g, "");
  const isNegative = isParenNeg || hasMinus;

  if (isNegative) {
    return {
      ok: false,
      error: cfg.negativeError ?? "Value cannot be negative.",
    };
  }

  if (!s) {
    return {
      ok: false,
      error: "That number format looks unclear. Try 1250.50 or 1,250.50.",
    };
  }

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandsSep = decimalSep === "." ? "," : ".";
    s = s.split(thousandsSep).join("");
    if (decimalSep === ",") s = s.replace(",", ".");
    if ((s.match(/\./g) ?? []).length > 1) {
      return {
        ok: false,
        error:
          "That number format is ambiguous. Use only one decimal separator.",
      };
    }
  } else if (lastComma !== -1 && lastDot === -1) {
    const commaThousandsPattern = /^\d{1,3}(,\d{3})+$/u;
    if (commaThousandsPattern.test(s)) {
      s = s.replace(/,/g, "");
    } else {
      const parts = s.split(",");
      if (parts.length !== 2) {
        return {
          ok: false,
          error:
            "That comma format is ambiguous. Use 1,250.50 or 1250.50 for decimals.",
        };
      }
      const right = parts[1] ?? "";
      const mode = cfg.commaDecimalDigits ?? "any";
      if (mode === "2") {
        if (right.length !== 2) {
          return {
            ok: false,
            error:
              "That comma-decimal format is ambiguous for prices. Use 2 digits after the comma (12,50).",
          };
        }
      } else {
        if (right.length < 1 || right.length > 6) {
          return {
            ok: false,
            error:
              "That comma-decimal format is ambiguous. Use 1 to 6 digits after the comma.",
          };
        }
      }
      s = `${parts[0]}.${right}`;
    }
  } else {
    if ((s.match(/\./g) ?? []).length > 1) {
      return { ok: false, error: "That number format looks unclear." };
    }
    s = s.replace(/,/g, "");
  }

  if (s.startsWith(".")) s = `0${s}`;
  if (s.endsWith(".")) s = `${s}0`;

  if (!/^\d+(\.\d+)?$/u.test(s)) {
    return {
      ok: false,
      error: "That number format looks unclear. Try 1250.50 or 1,250.50.",
    };
  }

  const [intStr, fracStrRaw = ""] = s.split(".");
  const fracStr = fracStrRaw.slice(0, 6);
  const fracPadded = fracStr.padEnd(6, "0");

  const intPart = BigInt(intStr || "0");
  const fracPart = BigInt(fracPadded || "0");

  const scaled = intPart * SCALE + fracPart;

  const maxScaled = cfg.maxScaled ?? 1_000_000_000n * SCALE;
  if (scaled > maxScaled) {
    return {
      ok: false,
      error:
        "That value is very large and may be impractical to display. Try a smaller number.",
    };
  }

  return { ok: true, scaled, normalized: s };
}

function safeJsonParseBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "boolean" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeParseDisplayDecimals(
  value: string | null,
  fallback: 0 | 2 | 4 | 6,
): 0 | 2 | 4 | 6 {
  if (!value) return fallback;
  const n = Number(value);
  if (n === 0 || n === 2 || n === 4 || n === 6) return n;
  return fallback;
}

type Shape =
  | "square"
  | "rectangle"
  | "circle"
  | "triangle"
  | "rectangle_border"
  | "circle_border"
  | "triangle_border";

const SHAPE_LABEL: Record<Shape, string> = {
  square: "Square",
  rectangle: "Rectangle",
  circle: "Circle",
  triangle: "Triangle",
  rectangle_border: "Rectangle border",
  circle_border: "Circle border (ring)",
  triangle_border: "Triangle border",
};

type DimUnit = "cm" | "in" | "ft" | "m" | "yd";
type DepthUnit = "cm" | "in" | "ft" | "m" | "yd";

const DIM_UNIT_LABEL: Record<DimUnit, string> = {
  cm: "Centimeters (cm)",
  in: "Inches (in)",
  ft: "Feet (ft)",
  m: "Meters (m)",
  yd: "Yards (yd)",
};

const DEPTH_UNIT_LABEL: Record<DepthUnit, string> = {
  cm: "Centimeters (cm)",
  in: "Inches (in)",
  ft: "Feet (ft)",
  m: "Meters (m)",
  yd: "Yards (yd)",
};

type AreaDisplayUnit = "ft2" | "in2" | "yd2" | "m2" | "cm2" | "ac";

const AREA_UNIT_LABEL: Record<AreaDisplayUnit, string> = {
  ft2: "Square feet (ft²)",
  in2: "Square inches (in²)",
  yd2: "Square yards (yd²)",
  m2: "Square meters (m²)",
  cm2: "Square centimeters (cm²)",
  ac: "Acres (ac)",
};

type PricingMode = "none" | "per_bag" | "per_cy" | "per_m3";

type CurrencyCode = "USD" | "CAD" | "GBP" | "EUR" | "AUD" | "NZD";

const CURRENCY_LABEL: Record<CurrencyCode, string> = {
  USD: "USD ($) United States",
  CAD: "CAD ($) Canada",
  GBP: "GBP (£) United Kingdom",
  EUR: "EUR (€) Eurozone",
  AUD: "AUD ($) Australia",
  NZD: "NZD ($) New Zealand",
};

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  NZD: "NZ$",
};

type OutputUnit = "cy" | "cuft" | "m3" | "l";

const OUTPUT_UNIT_LABEL: Record<OutputUnit, string> = {
  cy: "Cubic yards (yd³)",
  cuft: "Cubic feet (ft³)",
  m3: "Cubic meters (m³)",
  l: "Liters (L)",
};

function ceilDivBigInt(n: bigint, d: bigint) {
  if (d === 0n) return 0n;
  return (n + d - 1n) / d;
}

function clampNonNegativeScaled(x: bigint) {
  return x < 0n ? 0n : x;
}

function mulScaled(a: bigint, b: bigint) {
  return (a * b) / SCALE;
}

function divScaled(a: bigint, b: bigint) {
  if (b === 0n) return 0n;
  return (a * SCALE) / b;
}

function toPrettyNumber(
  scaled: bigint,
  roundForDisplay: boolean,
  displayDecimals: 0 | 2 | 4 | 6,
) {
  if (!roundForDisplay) {
    const dec = scaledToDecimalString(scaled, 6, { trimTrailingZeros: true });
    return formatGroupedDecimalString(dec, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 12,
    });
  }
  const rounded = roundScaledToDigits(scaled, displayDecimals);
  const dec = scaledToDecimalString(rounded, 6, {
    fixed: displayDecimals > 0,
    trimTrailingZeros: false,
  });
  return formatGroupedDecimalString(dec, {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

function formatMoneyFromScaled(
  scaled: bigint,
  currency: CurrencyCode,
  roundForDisplay: boolean,
) {
  const symbol = CURRENCY_SYMBOL[currency];
  const rounded = roundForDisplay ? roundScaledToDigits(scaled, 2) : scaled;
  const dec = scaledToDecimalString(rounded, 2, { fixed: true });
  const grouped = formatGroupedDecimalString(dec, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${grouped}`;
}

function pluralizeCount(count: bigint, singular: string, plural: string) {
  return count === 1n ? singular : plural;
}

function pluralizeScaledCount(
  scaled: bigint,
  singular: string,
  plural: string,
) {
  return scaled === 1n * SCALE ? singular : plural;
}

const PI_SCALED = 3_141_593n;

const FT_TO_FT_SCALED = 1_000_000n;
const IN_TO_FT_SCALED = 83_333n;
const YD_TO_FT_SCALED = 3_000_000n;
const M_TO_FT_SCALED = 3_280_840n;
const CM_TO_FT_SCALED = 32_808n;

const SQM_TO_SQFT_SCALED = 10_763_910n;
const CUFT_PER_CY = 27n;
const CUFT_PER_M3_SCALED = 35_314_667n;
const SQFT_PER_ACRE = 43_560n;

const STANDARD_BAGS: Array<{ key: string; label: string; cuftScaled: bigint }> =
  [
    { key: "0_75", label: "0.75 cu ft bags", cuftScaled: 750_000n },
    { key: "1", label: "1.0 cu ft bags", cuftScaled: 1n * SCALE },
    { key: "1_5", label: "1.5 cu ft bags", cuftScaled: 1_500_000n },
    { key: "2", label: "2.0 cu ft bags", cuftScaled: 2n * SCALE },
    { key: "3", label: "3.0 cu ft bags", cuftScaled: 3n * SCALE },
  ];

function feetPerDimUnitScaled(u: DimUnit) {
  if (u === "ft") return FT_TO_FT_SCALED;
  if (u === "in") return IN_TO_FT_SCALED;
  if (u === "yd") return YD_TO_FT_SCALED;
  if (u === "m") return M_TO_FT_SCALED;
  return CM_TO_FT_SCALED;
}

function feetPerDepthUnitScaled(u: DepthUnit) {
  if (u === "ft") return FT_TO_FT_SCALED;
  if (u === "in") return IN_TO_FT_SCALED;
  if (u === "yd") return YD_TO_FT_SCALED;
  if (u === "m") return M_TO_FT_SCALED;
  return CM_TO_FT_SCALED;
}

type DepthPresetKey =
  | "select"
  | "new_lawn_high"
  | "new_lawn_low"
  | "est_lawn_high"
  | "est_lawn_low"
  | "garden_high"
  | "garden_low"
  | "raised_high"
  | "raised_low"
  | "custom";

/**
 * Depth presets aligned to commonly published guidance:
 * - Established lawn topdressing: 0.25" to 0.5"
 * - New lawn (incorporated before seed/sod): 1" to 2"
 * - Garden beds (amend): 1" to 2"
 * - Raised beds (refresh/amend): 2" to 4"
 */
const DEPTH_PRESETS: Array<{
  key: DepthPresetKey;
  label: string;
  depthInches?: string;
}> = [
  { key: "select", label: "Select" },
  {
    key: "new_lawn_high",
    label: "New lawn - high compost level (2 in)",
    depthInches: "2",
  },
  {
    key: "new_lawn_low",
    label: "New lawn - low compost level (1 in)",
    depthInches: "1",
  },
  {
    key: "est_lawn_high",
    label: "Established lawn - high compost level (1/2 in)",
    depthInches: "0.5",
  },
  {
    key: "est_lawn_low",
    label: "Established lawn - low compost level (1/4 in)",
    depthInches: "0.25",
  },
  {
    key: "garden_high",
    label: "Garden - high compost level (2 in)",
    depthInches: "2",
  },
  {
    key: "garden_low",
    label: "Garden - low compost level (1 in)",
    depthInches: "1",
  },
  {
    key: "raised_high",
    label: "Raised bed - high compost level (4 in)",
    depthInches: "4",
  },
  {
    key: "raised_low",
    label: "Raised bed - low compost level (2 in)",
    depthInches: "2",
  },
  { key: "custom", label: "Custom depth" },
];

type DensityUnit =
  | "kg_m3"
  | "lb_ft3"
  | "lb_yd3"
  | "g_cm3"
  | "kg_cm3"
  | "mg_cm3"
  | "g_m3"
  | "g_dm3";

const DENSITY_UNIT_LABEL: Record<DensityUnit, string> = {
  kg_m3: "kilograms per cubic meter (kg/m³)",
  lb_ft3: "pounds per cubic foot (lb/cu ft)",
  lb_yd3: "pounds per cubic yard (lb/cu yd)",
  g_cm3: "grams per cubic centimeter (g/cm³)",
  kg_cm3: "kilograms per cubic centimeter (kg/cm³)",
  mg_cm3: "milligrams per cubic centimeter (mg/cm³)",
  g_m3: "grams per cubic meter (g/m³)",
  g_dm3: "grams per cubic decimeter (g/dm³)",
};

const KG_PER_LB_SCALED = 453_592n; // 0.453592 kg per lb, scaled 1e6
const LB_PER_KG_SCALED = 2_204_623n; // 2.204623 lb per kg, scaled 1e6

const FACTOR_LBFT3_TO_KGM3_SCALED = 16_018_463n; // 16.018463
const FACTOR_LBYD3_TO_KGM3_SCALED = 593_276n; // 0.593276
const FACTOR_GCM3_TO_KGM3_SCALED = 1_000_000_000n; // 1000
const FACTOR_KGCM3_TO_KGM3_SCALED = 1_000_000_000_000n; // 1,000,000
const FACTOR_MGCM3_TO_KGM3_SCALED = 1_000_000n; // 1
const FACTOR_GM3_TO_KGM3_SCALED = 1_000n; // 0.001
const FACTOR_GDM3_TO_KGM3_SCALED = 1_000_000n; // 1

function densityToKgPerM3Scaled(densityScaled: bigint, unit: DensityUnit) {
  if (unit === "kg_m3") return densityScaled;
  if (unit === "lb_ft3")
    return mulScaled(densityScaled, FACTOR_LBFT3_TO_KGM3_SCALED);
  if (unit === "lb_yd3")
    return mulScaled(densityScaled, FACTOR_LBYD3_TO_KGM3_SCALED);
  if (unit === "g_cm3")
    return mulScaled(densityScaled, FACTOR_GCM3_TO_KGM3_SCALED);
  if (unit === "kg_cm3")
    return mulScaled(densityScaled, FACTOR_KGCM3_TO_KGM3_SCALED);
  if (unit === "mg_cm3")
    return mulScaled(densityScaled, FACTOR_MGCM3_TO_KGM3_SCALED);
  if (unit === "g_m3")
    return mulScaled(densityScaled, FACTOR_GM3_TO_KGM3_SCALED);
  return mulScaled(densityScaled, FACTOR_GDM3_TO_KGM3_SCALED);
}

// Weight conversion constants (display only)
const LB_PER_US_TON = 2000n;
const LB_PER_IMPERIAL_TON = 2240n;
const LB_PER_STONE = 14n;
const OZ_PER_LB = 16n;
const KG_PER_METRIC_TON = 1000n;

export default function CompostCoverageCalculator() {
  const [shape, setShape] = useState<Shape>(() => {
    if (typeof window === "undefined") return "rectangle";
    const v = localStorage.getItem("sc_shape") as Shape | null;
    return v && v in SHAPE_LABEL ? v : "rectangle";
  });

  const [dimUnit, setDimUnit] = useState<DimUnit>(() => {
    if (typeof window === "undefined") return "ft";
    const v = (localStorage.getItem("sc_dim_unit") as DimUnit) || null;
    if (v && v in DIM_UNIT_LABEL) return v;

    const legacy = (localStorage.getItem("sc_unit") as DimUnit) || "ft";
    return legacy && legacy in DIM_UNIT_LABEL ? legacy : "ft";
  });

  const [depthUnit, setDepthUnit] = useState<DepthUnit>(() => {
    if (typeof window === "undefined") return "in";
    const v = (localStorage.getItem("sc_depth_unit") as DepthUnit) || null;
    return v && v in DEPTH_UNIT_LABEL ? v : "in";
  });

  const [areaDisplayUnit, setAreaDisplayUnit] = useState<AreaDisplayUnit>(
    () => {
      if (typeof window === "undefined") return "ft2";
      const v =
        (localStorage.getItem("sc_area_unit") as AreaDisplayUnit) || null;
      return v && v in AREA_UNIT_LABEL ? v : "ft2";
    },
  );

  const [outputUnit, setOutputUnit] = useState<OutputUnit>(() => {
    if (typeof window === "undefined") return "cy";
    const v = localStorage.getItem("sc_output_unit") as OutputUnit | null;
    return v && v in OUTPUT_UNIT_LABEL ? v : "cy";
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD";
    const v = (localStorage.getItem("sc_currency") as CurrencyCode) || "USD";
    return v && v in CURRENCY_LABEL ? v : "USD";
  });

  const [length, setLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_length") ?? ""),
  );
  const [width, setWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_width") ?? ""),
  );

  const [outerLength, setOuterLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_outer_length") ?? ""),
  );
  const [outerWidth, setOuterWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_outer_width") ?? ""),
  );
  const [innerLength, setInnerLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_inner_length") ?? ""),
  );
  const [innerWidth, setInnerWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_inner_width") ?? ""),
  );

  const [radius, setRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_radius") ?? ""),
  );
  const [outerRadius, setOuterRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_outer_radius") ?? ""),
  );
  const [innerRadius, setInnerRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_inner_radius") ?? ""),
  );

  const [base, setBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_base") ?? ""),
  );
  const [height, setHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_height") ?? ""),
  );

  const [outerBase, setOuterBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_outer_base") ?? ""),
  );
  const [outerHeight, setOuterHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_outer_height") ?? ""),
  );
  const [innerBase, setInnerBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_inner_base") ?? ""),
  );
  const [innerHeight, setInnerHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_inner_height") ?? ""),
  );

  const [depth, setDepth] = useState<string>(() =>
    typeof window === "undefined"
      ? "2"
      : (localStorage.getItem("sc_depth") ?? "2"),
  );
  const [wastePct, setWastePct] = useState<string>(() =>
    typeof window === "undefined"
      ? "0"
      : (localStorage.getItem("sc_waste_pct") ?? "0"),
  );

  const [depthPreset, setDepthPreset] = useState<DepthPresetKey>(() => {
    if (typeof window === "undefined") return "custom";
    const v =
      (localStorage.getItem("sc_depth_preset") as DepthPresetKey) || "custom";
    const allowed = new Set(DEPTH_PRESETS.map((x) => x.key));
    return allowed.has(v) ? v : "custom";
  });

  const [pricingMode, setPricingMode] = useState<PricingMode>(() => {
    if (typeof window === "undefined") return "none";
    const v =
      (localStorage.getItem("sc_pricing_mode") as PricingMode) || "none";
    return v === "none" || v === "per_bag" || v === "per_cy" || v === "per_m3"
      ? v
      : "none";
  });

  const [price, setPrice] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("sc_price") ?? ""),
  );

  const [density, setDensity] = useState<string>(() =>
    typeof window === "undefined"
      ? "650"
      : (localStorage.getItem("sc_density") ?? "650"),
  );

  const [densityUnit, setDensityUnit] = useState<DensityUnit>(() => {
    if (typeof window === "undefined") return "kg_m3";
    const v =
      (localStorage.getItem("sc_density_unit") as DensityUnit) || "kg_m3";
    return v && v in DENSITY_UNIT_LABEL ? v : "kg_m3";
  });

  const [roundForDisplay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return safeJsonParseBoolean(localStorage.getItem("sc_rounding"), true);
  });

  const [displayDecimals] = useState<0 | 2 | 4 | 6>(() => {
    if (typeof window === "undefined") return 2;
    return safeParseDisplayDecimals(
      localStorage.getItem("sc_display_decimals"),
      2,
    );
  });

  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem("sc_shape", shape);
        localStorage.setItem("sc_dim_unit", dimUnit);
        localStorage.setItem("sc_depth_unit", depthUnit);
        localStorage.setItem("sc_area_unit", areaDisplayUnit);
        localStorage.setItem("sc_output_unit", outputUnit);
        localStorage.setItem("sc_currency", currency);

        localStorage.setItem("sc_length", length);
        localStorage.setItem("sc_width", width);

        localStorage.setItem("sc_outer_length", outerLength);
        localStorage.setItem("sc_outer_width", outerWidth);
        localStorage.setItem("sc_inner_length", innerLength);
        localStorage.setItem("sc_inner_width", innerWidth);

        localStorage.setItem("sc_radius", radius);
        localStorage.setItem("sc_outer_radius", outerRadius);
        localStorage.setItem("sc_inner_radius", innerRadius);

        localStorage.setItem("sc_base", base);
        localStorage.setItem("sc_height", height);

        localStorage.setItem("sc_outer_base", outerBase);
        localStorage.setItem("sc_outer_height", outerHeight);
        localStorage.setItem("sc_inner_base", innerBase);
        localStorage.setItem("sc_inner_height", innerHeight);

        localStorage.setItem("sc_depth", depth);
        localStorage.setItem("sc_waste_pct", wastePct);
        localStorage.setItem("sc_depth_preset", depthPreset);

        localStorage.setItem("sc_pricing_mode", pricingMode);
        localStorage.setItem("sc_price", price);

        localStorage.setItem("sc_density", density);
        localStorage.setItem("sc_density_unit", densityUnit);

        localStorage.setItem("sc_rounding", JSON.stringify(roundForDisplay));
        localStorage.setItem("sc_display_decimals", String(displayDecimals));
      } catch {}
    }, 250);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    shape,
    dimUnit,
    depthUnit,
    areaDisplayUnit,
    outputUnit,
    currency,
    length,
    width,
    outerLength,
    outerWidth,
    innerLength,
    innerWidth,
    radius,
    outerRadius,
    innerRadius,
    base,
    height,
    outerBase,
    outerHeight,
    innerBase,
    innerHeight,
    depth,
    wastePct,
    depthPreset,
    pricingMode,
    price,
    density,
    densityUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  useEffect(() => {
    const preset = DEPTH_PRESETS.find((p) => p.key === depthPreset);
    if (!preset || !preset.depthInches) return;
    setDepthUnit("in");
    setDepth(preset.depthInches);
  }, [depthPreset]);

  const parsed = useMemo(() => {
    const pLen = parseNonNegativeToScaled(length, {
      emptyError: "Enter a length.",
    });
    const pWid = parseNonNegativeToScaled(width, {
      emptyError: "Enter a width.",
    });

    const pOLen = parseNonNegativeToScaled(outerLength, {
      emptyError: "Enter an outer length.",
    });
    const pOWid = parseNonNegativeToScaled(outerWidth, {
      emptyError: "Enter an outer width.",
    });
    const pILen = parseNonNegativeToScaled(innerLength, {
      emptyError: "Enter an inner length.",
    });
    const pIWid = parseNonNegativeToScaled(innerWidth, {
      emptyError: "Enter an inner width.",
    });

    const pRad = parseNonNegativeToScaled(radius, {
      emptyError: "Enter a radius.",
    });
    const pORad = parseNonNegativeToScaled(outerRadius, {
      emptyError: "Enter an outer radius.",
    });
    const pIRad = parseNonNegativeToScaled(innerRadius, {
      emptyError: "Enter an inner radius.",
    });

    const pBase = parseNonNegativeToScaled(base, {
      emptyError: "Enter a base.",
    });
    const pHeight = parseNonNegativeToScaled(height, {
      emptyError: "Enter a height.",
    });

    const pOBase = parseNonNegativeToScaled(outerBase, {
      emptyError: "Enter an outer base.",
    });
    const pOHeight = parseNonNegativeToScaled(outerHeight, {
      emptyError: "Enter an outer height.",
    });
    const pIBase = parseNonNegativeToScaled(innerBase, {
      emptyError: "Enter an inner base.",
    });
    const pIHeight = parseNonNegativeToScaled(innerHeight, {
      emptyError: "Enter an inner height.",
    });

    const pDepth = parseNonNegativeToScaled(depth, {
      emptyError: "Enter a depth.",
    });

    const pWaste = wastePct.trim()
      ? parseNonNegativeToScaled(wastePct, {
          emptyError: "Waste % must be a valid number.",
          maxScaled: 10_000n * SCALE,
        })
      : ({ ok: true, scaled: 0n } as ParseScaledResult);

    const pPrice = price.trim()
      ? parseNonNegativeToScaled(price, {
          emptyError: "Price must be a valid number.",
          commaDecimalDigits: "2",
        })
      : ({ ok: true, scaled: 0n } as ParseScaledResult);

    const pDensity = density.trim()
      ? parseNonNegativeToScaled(density, {
          emptyError: "Density must be a valid number.",
          maxScaled: 10_000_000n * SCALE,
        })
      : ({ ok: true, scaled: 0n } as ParseScaledResult);

    return {
      pLen,
      pWid,
      pOLen,
      pOWid,
      pILen,
      pIWid,
      pRad,
      pORad,
      pIRad,
      pBase,
      pHeight,
      pOBase,
      pOHeight,
      pIBase,
      pIHeight,
      pDepth,
      pWaste,
      pPrice,
      pDensity,
    };
  }, [
    length,
    width,
    outerLength,
    outerWidth,
    innerLength,
    innerWidth,
    radius,
    outerRadius,
    innerRadius,
    base,
    height,
    outerBase,
    outerHeight,
    innerBase,
    innerHeight,
    depth,
    wastePct,
    price,
    density,
  ]);

  function dimToFeetScaled(linearScaled: bigint) {
    return mulScaled(linearScaled, feetPerDimUnitScaled(dimUnit));
  }

  function depthToFeetScaled(linearScaled: bigint) {
    return mulScaled(linearScaled, feetPerDepthUnitScaled(depthUnit));
  }

  const validation = useMemo(() => {
    const mustPos = (p: ParseScaledResult, label: string) => {
      if (!p.ok || p.scaled === undefined)
        return { ok: false, message: p.error ?? `Enter a valid ${label}.` };
      if (p.scaled === 0n)
        return { ok: false, message: `${label} must be greater than 0.` };
      return { ok: true, message: "" };
    };

    const d = mustPos(parsed.pDepth, "depth");
    if (!d.ok) return d;

    if (!parsed.pWaste.ok || parsed.pWaste.scaled === undefined) {
      return {
        ok: false,
        message: parsed.pWaste.error ?? "Waste % must be valid.",
      };
    }

    if (pricingMode !== "none" && price.trim()) {
      if (!parsed.pPrice.ok || parsed.pPrice.scaled === undefined) {
        return {
          ok: false,
          message: parsed.pPrice.error ?? "Price must be valid.",
        };
      }
    }

    if (shape === "square") return mustPos(parsed.pLen, "side length");

    if (shape === "rectangle") {
      const a = mustPos(parsed.pLen, "length");
      if (!a.ok) return a;
      return mustPos(parsed.pWid, "width");
    }

    if (shape === "circle") return mustPos(parsed.pRad, "radius");

    if (shape === "triangle") {
      const a = mustPos(parsed.pBase, "base");
      if (!a.ok) return a;
      return mustPos(parsed.pHeight, "height");
    }

    if (shape === "rectangle_border") {
      const a = mustPos(parsed.pOLen, "outer length");
      if (!a.ok) return a;
      const b = mustPos(parsed.pOWid, "outer width");
      if (!b.ok) return b;
      const c = mustPos(parsed.pILen, "inner length");
      if (!c.ok) return c;
      const d2 = mustPos(parsed.pIWid, "inner width");
      if (!d2.ok) return d2;

      if ((parsed.pILen.scaled ?? 0n) >= (parsed.pOLen.scaled ?? 0n)) {
        return {
          ok: false,
          message: "Inner length must be smaller than outer length.",
        };
      }
      if ((parsed.pIWid.scaled ?? 0n) >= (parsed.pOWid.scaled ?? 0n)) {
        return {
          ok: false,
          message: "Inner width must be smaller than outer width.",
        };
      }
      return { ok: true, message: "" };
    }

    if (shape === "circle_border") {
      const a = mustPos(parsed.pORad, "outer radius");
      if (!a.ok) return a;
      const b = mustPos(parsed.pIRad, "inner radius");
      if (!b.ok) return b;

      if ((parsed.pIRad.scaled ?? 0n) >= (parsed.pORad.scaled ?? 0n)) {
        return {
          ok: false,
          message: "Inner radius must be smaller than outer radius.",
        };
      }
      return { ok: true, message: "" };
    }

    if (shape === "triangle_border") {
      const a = mustPos(parsed.pOBase, "outer base");
      if (!a.ok) return a;
      const b = mustPos(parsed.pOHeight, "outer height");
      if (!b.ok) return b;
      const c = mustPos(parsed.pIBase, "inner base");
      if (!c.ok) return c;
      const d2 = mustPos(parsed.pIHeight, "inner height");
      if (!d2.ok) return d2;

      if ((parsed.pIBase.scaled ?? 0n) >= (parsed.pOBase.scaled ?? 0n)) {
        return {
          ok: false,
          message: "Inner base must be smaller than outer base.",
        };
      }
      if ((parsed.pIHeight.scaled ?? 0n) >= (parsed.pOHeight.scaled ?? 0n)) {
        return {
          ok: false,
          message: "Inner height must be smaller than outer height.",
        };
      }
      return { ok: true, message: "" };
    }

    return { ok: true, message: "" };
  }, [parsed, shape, pricingMode, price]);

  const computed = useMemo(() => {
    if (!validation.ok) {
      return {
        areaSqftScaled: null as bigint | null,
        areaSqmScaled: null as bigint | null,
        areaDisplayScaled: null as bigint | null,
        areaAcresScaled: null as bigint | null,
        volumeCuftWithWasteScaled: null as bigint | null,
        volumeCyScaled: null as bigint | null,
        volumeM3Scaled: null as bigint | null,
        volumeLitersScaled: null as bigint | null,
        standardBagCounts: [] as Array<{
          key: string;
          label: string;
          count: bigint;
        }>,
        costScaled: null as bigint | null,
      };
    }

    const depthFtScaled = depthToFeetScaled(parsed.pDepth.scaled ?? 0n);

    const areaFromRect = (lScaled: bigint, wScaled: bigint) => {
      const lFt = dimToFeetScaled(lScaled);
      const wFt = dimToFeetScaled(wScaled);
      return mulScaled(lFt, wFt);
    };

    const areaFromSquare = (sScaled: bigint) => {
      const sFt = dimToFeetScaled(sScaled);
      return mulScaled(sFt, sFt);
    };

    const areaFromCircle = (rScaled: bigint) => {
      const rFt = dimToFeetScaled(rScaled);
      const r2 = mulScaled(rFt, rFt);
      return mulScaled(PI_SCALED, r2);
    };

    const areaFromTriangle = (bScaled: bigint, hScaled: bigint) => {
      const bFt = dimToFeetScaled(bScaled);
      const hFt = dimToFeetScaled(hScaled);
      const bh = mulScaled(bFt, hFt);
      return bh / 2n;
    };

    let areaSqftScaled = 0n;

    if (shape === "rectangle") {
      areaSqftScaled = areaFromRect(
        parsed.pLen.scaled ?? 0n,
        parsed.pWid.scaled ?? 0n,
      );
    } else if (shape === "square") {
      areaSqftScaled = areaFromSquare(parsed.pLen.scaled ?? 0n);
    } else if (shape === "circle") {
      areaSqftScaled = areaFromCircle(parsed.pRad.scaled ?? 0n);
    } else if (shape === "triangle") {
      areaSqftScaled = areaFromTriangle(
        parsed.pBase.scaled ?? 0n,
        parsed.pHeight.scaled ?? 0n,
      );
    } else if (shape === "rectangle_border") {
      const outer = areaFromRect(
        parsed.pOLen.scaled ?? 0n,
        parsed.pOWid.scaled ?? 0n,
      );
      const inner = areaFromRect(
        parsed.pILen.scaled ?? 0n,
        parsed.pIWid.scaled ?? 0n,
      );
      areaSqftScaled = clampNonNegativeScaled(outer - inner);
    } else if (shape === "circle_border") {
      const outer = areaFromCircle(parsed.pORad.scaled ?? 0n);
      const inner = areaFromCircle(parsed.pIRad.scaled ?? 0n);
      areaSqftScaled = clampNonNegativeScaled(outer - inner);
    } else if (shape === "triangle_border") {
      const outer = areaFromTriangle(
        parsed.pOBase.scaled ?? 0n,
        parsed.pOHeight.scaled ?? 0n,
      );
      const inner = areaFromTriangle(
        parsed.pIBase.scaled ?? 0n,
        parsed.pIHeight.scaled ?? 0n,
      );
      areaSqftScaled = clampNonNegativeScaled(outer - inner);
    }

    const volumeCuftScaled = mulScaled(areaSqftScaled, depthFtScaled);

    const wasteScaled = parsed.pWaste.scaled ?? 0n;
    const wasteFracScaled = divScaled(wasteScaled, 100n * SCALE);
    const factorScaled = SCALE + wasteFracScaled;
    const volumeCuftWithWasteScaled = mulScaled(volumeCuftScaled, factorScaled);

    const volumeCyScaled = volumeCuftWithWasteScaled / CUFT_PER_CY;
    const volumeM3Scaled = divScaled(
      volumeCuftWithWasteScaled,
      CUFT_PER_M3_SCALED,
    );
    const volumeLitersScaled = volumeM3Scaled * 1000n;

    const areaSqmScaled = divScaled(areaSqftScaled, SQM_TO_SQFT_SCALED);
    const areaAcresScaled = divScaled(areaSqftScaled, SQFT_PER_ACRE * SCALE);

    const areaDisplayScaled = (() => {
      if (areaDisplayUnit === "ft2") return areaSqftScaled;
      if (areaDisplayUnit === "m2") return areaSqmScaled;
      if (areaDisplayUnit === "yd2")
        return divScaled(areaSqftScaled, 9n * SCALE);
      if (areaDisplayUnit === "in2") return areaSqftScaled * 144n;
      if (areaDisplayUnit === "cm2") return areaSqmScaled * 10_000n;
      return areaAcresScaled;
    })();

    const standardBagCounts = STANDARD_BAGS.map((b) => {
      const count =
        b.cuftScaled > 0n
          ? ceilDivBigInt(volumeCuftWithWasteScaled, b.cuftScaled)
          : 0n;
      return { key: b.key, label: b.label, count };
    });

    let costScaled: bigint | null = null;
    const priceScaled = price.trim() ? (parsed.pPrice.scaled ?? 0n) : 0n;

    if (pricingMode === "per_bag" && price.trim()) {
      const defaultBag =
        STANDARD_BAGS.find((b) => b.key === "2") ?? STANDARD_BAGS[0];
      const bags = ceilDivBigInt(
        volumeCuftWithWasteScaled,
        defaultBag.cuftScaled,
      );
      costScaled = mulScaled(priceScaled, bags * SCALE);
    } else if (pricingMode === "per_cy" && price.trim()) {
      costScaled = mulScaled(priceScaled, volumeCyScaled);
    } else if (pricingMode === "per_m3" && price.trim()) {
      costScaled = mulScaled(priceScaled, volumeM3Scaled);
    }

    return {
      areaSqftScaled,
      areaSqmScaled,
      areaDisplayScaled,
      areaAcresScaled,
      volumeCuftWithWasteScaled,
      volumeCyScaled,
      volumeM3Scaled,
      volumeLitersScaled,
      standardBagCounts,
      costScaled,
    };
  }, [
    validation.ok,
    parsed,
    shape,
    dimUnit,
    depthUnit,
    areaDisplayUnit,
    pricingMode,
    price,
  ]);

  const primaryVolume = useMemo(() => {
    const label = OUTPUT_UNIT_LABEL[outputUnit];
    if (!validation.ok) return { label, value: "—" };

    if (outputUnit === "cy") {
      const v = toPrettyNumber(
        computed.volumeCyScaled ?? 0n,
        roundForDisplay,
        displayDecimals,
      );
      return { label, value: `${v} yd³` };
    }

    if (outputUnit === "cuft") {
      const v = toPrettyNumber(
        computed.volumeCuftWithWasteScaled ?? 0n,
        roundForDisplay,
        displayDecimals,
      );
      return { label, value: `${v} ft³` };
    }

    if (outputUnit === "m3") {
      const v = toPrettyNumber(
        computed.volumeM3Scaled ?? 0n,
        roundForDisplay,
        displayDecimals,
      );
      return { label, value: `${v} m³` };
    }

    const v = toPrettyNumber(
      computed.volumeLitersScaled ?? 0n,
      roundForDisplay,
      displayDecimals,
    );
    return { label, value: `${v} L` };
  }, [
    validation.ok,
    outputUnit,
    computed.volumeCyScaled,
    computed.volumeCuftWithWasteScaled,
    computed.volumeM3Scaled,
    computed.volumeLitersScaled,
    roundForDisplay,
    displayDecimals,
  ]);

  const quickTotals = useMemo(() => {
    if (!validation.ok) {
      return { cy: "—", cuft: "—", m3: "—", l: "—" };
    }

    const cy =
      computed.volumeCyScaled !== null
        ? `${toPrettyNumber(computed.volumeCyScaled, roundForDisplay, displayDecimals)} yd³`
        : "—";

    const cuft =
      computed.volumeCuftWithWasteScaled !== null
        ? `${toPrettyNumber(computed.volumeCuftWithWasteScaled, roundForDisplay, displayDecimals)} ft³`
        : "—";

    const m3 =
      computed.volumeM3Scaled !== null
        ? `${toPrettyNumber(computed.volumeM3Scaled, roundForDisplay, displayDecimals)} m³`
        : "—";

    const l =
      computed.volumeLitersScaled !== null
        ? `${toPrettyNumber(computed.volumeLitersScaled, roundForDisplay, displayDecimals)} L`
        : "—";

    return { cy, cuft, m3, l };
  }, [
    validation.ok,
    computed.volumeCyScaled,
    computed.volumeCuftWithWasteScaled,
    computed.volumeM3Scaled,
    computed.volumeLitersScaled,
    roundForDisplay,
    displayDecimals,
  ]);

  const summaryLine = useMemo(() => {
    if (!validation.ok) return "—";
    const cuftScaled = computed.volumeCuftWithWasteScaled ?? 0n;
    const cyScaled = computed.volumeCyScaled ?? 0n;

    const cuft = toPrettyNumber(cuftScaled, roundForDisplay, displayDecimals);
    const cy = toPrettyNumber(cyScaled, roundForDisplay, displayDecimals);

    const cuftUnit = pluralizeScaledCount(
      cuftScaled,
      "cubic foot",
      "cubic feet",
    );
    const cyUnit = pluralizeScaledCount(cyScaled, "cubic yard", "cubic yards");

    const bags15 =
      computed.standardBagCounts.find((b) => b.key === "1_5")?.count ?? 0n;
    const bags2 =
      computed.standardBagCounts.find((b) => b.key === "2")?.count ?? 0n;
    const bags3 =
      computed.standardBagCounts.find((b) => b.key === "3")?.count ?? 0n;

    const bagWord15 = pluralizeCount(bags15, "bag", "bags");
    const bagWord2 = pluralizeCount(bags2, "bag", "bags");
    const bagWord3 = pluralizeCount(bags3, "bag", "bags");

    return `You need a total of ${cuft} ${cuftUnit} of compost, or ${cy} ${cyUnit} of compost, or ${bags15.toString()} 1.5-cubic-foot ${bagWord15} of compost, or ${bags2.toString()} 2-cubic-foot ${bagWord2} of compost, or ${bags3.toString()} 3-cubic-foot ${bagWord3} of compost.`;
  }, [
    validation.ok,
    computed.volumeCuftWithWasteScaled,
    computed.volumeCyScaled,
    computed.standardBagCounts,
    roundForDisplay,
    displayDecimals,
  ]);

  const compostWeight = useMemo(() => {
    if (!validation.ok) {
      return {
        ok: false,
        message: "",
        densityOk: true,
        totalKgScaled: null as bigint | null,
        totalLbScaled: null as bigint | null,
      };
    }

    if (!density.trim()) {
      return {
        ok: false,
        message: "",
        densityOk: false,
        totalKgScaled: null as bigint | null,
        totalLbScaled: null as bigint | null,
      };
    }

    if (!parsed.pDensity.ok || parsed.pDensity.scaled === undefined) {
      return {
        ok: false,
        message: parsed.pDensity.error ?? "Density must be valid.",
        densityOk: false,
        totalKgScaled: null as bigint | null,
        totalLbScaled: null as bigint | null,
      };
    }

    const volM3Scaled = computed.volumeM3Scaled ?? 0n;
    const densityKgM3Scaled = densityToKgPerM3Scaled(
      parsed.pDensity.scaled,
      densityUnit,
    );

    const totalKgScaled = mulScaled(volM3Scaled, densityKgM3Scaled);
    const totalLbScaled = mulScaled(totalKgScaled, LB_PER_KG_SCALED);

    return {
      ok: true,
      message: "",
      densityOk: true,
      totalKgScaled,
      totalLbScaled,
    };
  }, [
    validation.ok,
    density,
    densityUnit,
    parsed.pDensity,
    computed.volumeM3Scaled,
  ]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "coveragecalculators.com",
    url: "https://www.coveragecalculators.com",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Compost Coverage Calculator",
    description:
      "Convert garden bed area and depth into compost volume for bulk or bag purchases.",
    url: "https://www.coveragecalculators.com/compost-coverage-calculator",
  };

  const resultRegionId = "compost-results-region";

  return (
    <main className="bg-white text-slate-700 scroll-smooth antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              a[href]:after { content: ""; }
              #top-links, #bottom-nav, #export-controls-desktop, #export-controls-mobile { display: none !important; }
              #calculator { padding-bottom: 0 !important; }
              .shadow-sm { box-shadow: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <section
        id="calculator"
        className="mx-auto max-w-6xl px-6 pb-8 sm:mt-6 sm:pb-5"
      >
        <div className="rounded-2xl bg-white sm:shadow-sm sm:border border-slate-200 sm:px-8">
          <div className="flex flex-col pt-2 sm:pt-4 pb-1 sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="mb-1 text-center sm:text-left text-2xl sm:text-3xl md:text-4xl capitalize font-bold text-sky-800 tracking-tight">
              Compost Coverage Calculator
            </h1>

            <div
              id="export-controls-desktop"
              className="hidden sm:flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    window.print();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          <p className="hidden md:flex w-full text-left text-sm md:text-base text-slate-600 leading-relaxed">
            Convert garden bed area and compost depth (thickness) into compost
            volume for bulk or bag purchases.
          </p>

          <div className="flex w-full mt-1">
            <div className="flex flex-col w-full">
              <div className="grid gap-3 w-full sm:grid-cols-3">
                <label className="flex flex-col w-full">
                  <span className="block text-sm font-semibold text-slate-800 mb-2">
                    Coverage shape
                  </span>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as Shape)}
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    aria-label="Coverage shape"
                  >
                    {(Object.keys(SHAPE_LABEL) as Shape[]).map((k) => (
                      <option key={k} value={k}>
                        {SHAPE_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col w-full">
                  <span className="block text-sm font-semibold text-slate-800 mb-2">
                    Dimension units
                  </span>
                  <select
                    value={dimUnit}
                    onChange={(e) => setDimUnit(e.target.value as DimUnit)}
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    aria-label="Dimension units"
                  >
                    {(Object.keys(DIM_UNIT_LABEL) as DimUnit[]).map((u) => (
                      <option key={u} value={u}>
                        {DIM_UNIT_LABEL[u]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col w-full">
                  <span className="block text-sm font-semibold text-slate-800 mb-2">
                    Depth (thickness) units
                  </span>
                  <select
                    value={depthUnit}
                    onChange={(e) => setDepthUnit(e.target.value as DepthUnit)}
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    aria-label="Depth units"
                  >
                    {(Object.keys(DEPTH_UNIT_LABEL) as DepthUnit[]).map((u) => (
                      <option key={u} value={u}>
                        {DEPTH_UNIT_LABEL[u]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">
                  Inputs (Preview Image Below)
                </div>

                {shape === "square" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Side length ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>
                ) : null}

                {shape === "rectangle" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Length ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Width ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="e.g. 8"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>
                ) : null}

                {shape === "rectangle_border" ? (
                  <div className="mt-3 grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Outer rectangle length ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={outerLength}
                          onChange={(e) => setOuterLength(e.target.value)}
                          placeholder="e.g. 24"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Outer rectangle width ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={outerWidth}
                          onChange={(e) => setOuterWidth(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Inner rectangle length ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={innerLength}
                          onChange={(e) => setInnerLength(e.target.value)}
                          placeholder="e.g. 18"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Inner rectangle width ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={innerWidth}
                          onChange={(e) => setInnerWidth(e.target.value)}
                          placeholder="e.g. 6"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                {shape === "circle" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Radius ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>
                ) : null}

                {shape === "circle_border" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Outer radius ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={outerRadius}
                        onChange={(e) => setOuterRadius(e.target.value)}
                        placeholder="e.g. 6"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Inner radius ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={innerRadius}
                        onChange={(e) => setInnerRadius(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>
                ) : null}

                {shape === "triangle" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Base ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={base}
                        onChange={(e) => setBase(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Height ({dimUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="e.g. 7"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>
                ) : null}

                {shape === "triangle_border" ? (
                  <div className="mt-3 grid gap-3">
                    <div className="text-xs font-semibold text-slate-600">
                      Outer triangle
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Outer base ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={outerBase}
                          onChange={(e) => setOuterBase(e.target.value)}
                          placeholder="e.g. 12"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Outer height ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={outerHeight}
                          onChange={(e) => setOuterHeight(e.target.value)}
                          placeholder="e.g. 9"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-600">
                      Inner triangle (cutout)
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Inner base ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={innerBase}
                          onChange={(e) => setInnerBase(e.target.value)}
                          placeholder="e.g. 8"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Inner height ({dimUnit})
                        </span>
                        <input
                          inputMode="decimal"
                          value={innerHeight}
                          onChange={(e) => setInnerHeight(e.target.value)}
                          placeholder="e.g. 6"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Garden or lawn type (depth presets)
                      </span>
                      <select
                        value={depthPreset}
                        onChange={(e) =>
                          setDepthPreset(e.target.value as DepthPresetKey)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                        aria-label="Garden or lawn type"
                      >
                        {DEPTH_PRESETS.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Compost depth or thickness ({depthUnit})
                      </span>
                      <input
                        inputMode="decimal"
                        value={depth}
                        onChange={(e) => {
                          setDepth(e.target.value);
                          if (depthPreset !== "custom")
                            setDepthPreset("custom");
                        }}
                        placeholder={
                          depthUnit === "in" ? "e.g. 2" : "e.g. 0.08"
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Waste % (optional)
                    </span>
                    <input
                      inputMode="decimal"
                      value={wastePct}
                      onChange={(e) => setWastePct(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                  </label>
                </div>

                {!validation.ok ? (
                  <p
                    className="mt-3 text-sm text-rose-700"
                    role="alert"
                    aria-live="polite"
                  >
                    {validation.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <ShapePreview shape={shape} unit={dimUnit} />

          <div
            id={resultRegionId}
            className="mt-3 mb-6 rounded-2xl border border-slate-200 bg-[#f7fbff] p-5 sm:p-6 shadow-sm relative"
            role="region"
            aria-label="Compost results"
            aria-live="polite"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-200 rounded-t-2xl" />

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-slate-800">
                Compost Needed
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {validation.ok ? summaryLine : "—"}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-sky-600"
                    aria-hidden="true"
                  />
                  <div className="text-sm font-semibold text-slate-800">
                    <span className="text-base font-semibold text-slate-700">
                      {primaryVolume.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="text-3xl sm:text-5xl font-extrabold text-emerald-700 tabular-nums leading-none min-h-[3.25rem] sm:min-h-[4rem]">
                    {validation.ok ? primaryVolume.value : "—"}
                  </div>
                </div>
              </div>

              <label className="block w-full sm:w-[260px]">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Output units
                </span>
                <select
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value as OutputUnit)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                  aria-label="Output units"
                >
                  {(Object.keys(OUTPUT_UNIT_LABEL) as OutputUnit[]).map((k) => (
                    <option key={k} value={k}>
                      {OUTPUT_UNIT_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600">
                Quick preview
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    yd³
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                    {quickTotals.cy}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    ft³
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                    {quickTotals.cuft}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    m³
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                    {quickTotals.m3}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    L
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                    {quickTotals.l}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-end justify-between gap-3">
                  <div className="text-xs font-medium text-slate-600">Area</div>

                  <label className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Area units
                    </span>
                    <select
                      value={areaDisplayUnit}
                      onChange={(e) =>
                        setAreaDisplayUnit(e.target.value as AreaDisplayUnit)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                      aria-label="Area units"
                    >
                      {(Object.keys(AREA_UNIT_LABEL) as AreaDisplayUnit[]).map(
                        (k) => (
                          <option key={k} value={k}>
                            {AREA_UNIT_LABEL[k]}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                  {validation.ok && computed.areaDisplayScaled !== null
                    ? `${toPrettyNumber(computed.areaDisplayScaled, roundForDisplay, displayDecimals)} ${
                        areaDisplayUnit === "ft2"
                          ? "ft²"
                          : areaDisplayUnit === "in2"
                            ? "in²"
                            : areaDisplayUnit === "yd2"
                              ? "yd²"
                              : areaDisplayUnit === "m2"
                                ? "m²"
                                : areaDisplayUnit === "cm2"
                                  ? "cm²"
                                  : "ac"
                      }`
                    : "—"}
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
                  {validation.ok && computed.areaSqftScaled !== null
                    ? `${toPrettyNumber(computed.areaSqftScaled, roundForDisplay, displayDecimals)} ft²`
                    : "—"}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {validation.ok && computed.areaSqmScaled !== null
                    ? `${toPrettyNumber(computed.areaSqmScaled, roundForDisplay, displayDecimals)} m²`
                    : "—"}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {validation.ok && computed.areaAcresScaled !== null
                    ? `${toPrettyNumber(computed.areaAcresScaled, roundForDisplay, displayDecimals)} ac`
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-medium text-slate-600">Volume</div>
                <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                  {validation.ok ? primaryVolume.value : "—"}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
                  {quickTotals.cuft}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {quickTotals.cy}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {quickTotals.m3}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {quickTotals.l}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs font-medium text-slate-600">Waste</div>
                <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                  {validation.ok &&
                  parsed.pWaste.ok &&
                  parsed.pWaste.scaled !== undefined
                    ? `${toPrettyNumber(parsed.pWaste.scaled, true, 0)}%`
                    : "—"}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  Applied to volume only.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">
                Bags of Compost Needed
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {STANDARD_BAGS.map((b) => {
                  const count =
                    validation.ok && computed.standardBagCounts.length
                      ? (computed.standardBagCounts.find((x) => x.key === b.key)
                          ?.count ?? 0n)
                      : null;
                  return (
                    <div
                      key={b.key}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="text-[11px] font-semibold text-slate-600">
                        {b.label}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                        {validation.ok && count !== null
                          ? `${count.toString()} bags`
                          : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                Bag counts are rounded up to whole bags.
              </div>
            </div>

            {/* Compost Weight Calculator (optional) */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <details className="group">
                <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">
                      Compost Weight Calculator (optional)
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Estimate total weight from volume and density
                    </span>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                    <span className="text-slate-400 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Density
                    </span>
                    <div className="flex w-full gap-2">
                      <input
                        inputMode="decimal"
                        value={density}
                        onChange={(e) => setDensity(e.target.value)}
                        placeholder="e.g. 650"
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      />
                      <select
                        value={densityUnit}
                        onChange={(e) =>
                          setDensityUnit(e.target.value as DensityUnit)
                        }
                        className="w-[260px] max-w-[55%] rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                        aria-label="Density units"
                      >
                        {(Object.keys(DENSITY_UNIT_LABEL) as DensityUnit[]).map(
                          (u) => (
                            <option key={u} value={u}>
                              {DENSITY_UNIT_LABEL[u]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      Typical compost density varies by moisture and blend. If
                      you are not sure, 650 kg/m³ is a reasonable starting
                      point.
                    </div>
                  </label>

                  {!compostWeight.densityOk && compostWeight.message ? (
                    <p
                      className="sm:col-span-2 text-sm text-rose-700"
                      role="alert"
                      aria-live="polite"
                    >
                      {compostWeight.message}
                    </p>
                  ) : null}

                  <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      Total weight
                    </div>

                    {validation.ok &&
                    compostWeight.ok &&
                    compostWeight.totalKgScaled !== null &&
                    compostWeight.totalLbScaled !== null ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Kilograms (kg)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              compostWeight.totalKgScaled,
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            kg
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Grams (g)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              compostWeight.totalKgScaled * 1000n,
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            g
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Pounds (lb)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              compostWeight.totalLbScaled,
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            lb
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Ounces (oz)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              compostWeight.totalLbScaled * OZ_PER_LB,
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            oz
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Metric tons (t)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              divScaled(
                                compostWeight.totalKgScaled,
                                KG_PER_METRIC_TON * SCALE,
                              ),
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            t
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            US ton (short ton)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              divScaled(
                                compostWeight.totalLbScaled,
                                LB_PER_US_TON * SCALE,
                              ),
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            US ton
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Imperial ton (long ton)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              divScaled(
                                compostWeight.totalLbScaled,
                                LB_PER_IMPERIAL_TON * SCALE,
                              ),
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            long ton
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Stone (st)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                            {toPrettyNumber(
                              divScaled(
                                compostWeight.totalLbScaled,
                                LB_PER_STONE * SCALE,
                              ),
                              roundForDisplay,
                              displayDecimals,
                            )}{" "}
                            st
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                        —
                      </div>
                    )}

                    <div className="mt-2 text-xs font-semibold text-slate-500">
                      Weight is estimated from your computed volume and the
                      density you enter.
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <details className="group">
                <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">
                      Pricing estimate (optional)
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Set a unit price to estimate total cost
                    </span>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                    <span className="text-slate-400 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Currency
                    </span>
                    <select
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value as CurrencyCode)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {(Object.keys(CURRENCY_LABEL) as CurrencyCode[]).map(
                        (c) => (
                          <option key={c} value={c}>
                            {CURRENCY_LABEL[c]}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Pricing basis
                    </span>
                    <select
                      value={pricingMode}
                      onChange={(e) =>
                        setPricingMode(e.target.value as PricingMode)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      <option value="none">No cost estimate</option>
                      <option value="per_cy">Price per cubic yard</option>
                      <option value="per_m3">Price per cubic meter</option>
                      <option value="per_bag">
                        Price per bag (assumes 2.0 cu ft)
                      </option>
                    </select>
                  </label>

                  <label
                    className={`block sm:col-span-2 ${pricingMode === "none" ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit price ({CURRENCY_SYMBOL[currency]})
                    </span>
                    <input
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 42.00"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                  </label>

                  <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      Estimated cost
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                      {validation.ok && computed.costScaled !== null
                        ? formatMoneyFromScaled(
                            computed.costScaled,
                            currency,
                            roundForDisplay,
                          )
                        : "—"}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {pricingMode === "per_bag"
                        ? "Uses 2.0 cu ft bag count rounded up."
                        : pricingMode === "per_cy"
                          ? "Uses total volume in yd³."
                          : pricingMode === "per_m3"
                            ? "Uses total volume in m³."
                            : "Set a pricing basis to estimate cost."}
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                id="export-controls-mobile"
                className="sm:hidden flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    window.print();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Assumptions />
      <HowItWorks />
      <ToolFit />
      <FAQ />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </main>
  );
}
