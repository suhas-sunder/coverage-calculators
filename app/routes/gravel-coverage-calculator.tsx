import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/gravel-coverage-calculator";
import ShapePreview from "~/client/components/gravel-coverage-calculator/ShapePreview";
import Assumptions from "~/client/components/gravel-coverage-calculator/Assumptions";
import HowItWorks from "~/client/components/gravel-coverage-calculator/HowItWorks";
import ToolFit from "~/client/components/gravel-coverage-calculator/ToolFit";
import FAQ from "~/client/components/gravel-coverage-calculator/FAQ";

export const meta: Route.MetaFunction = () => [
  { title: "Gravel Coverage Calculator: Bags, Cubic Yards, or Tons Needed" },
  {
    name: "description",
    content:
      "Estimate how much gravel you need for driveways, walkways, and base layers using area, depth, and optional density. Outputs volume (yd³, ft³, m³, L), weight (lb, tons, kg), bags, and cost.",
  },
  {
    name: "keywords",
    content:
      "gravel calculator, gravel coverage calculator, how much gravel do i need, gravel driveway calculator, crushed stone calculator, cubic yards gravel, tons of gravel, gravel bags estimate",
  },
  { name: "robots", content: "index,follow" },
  { name: "author", content: "coveragecalculators.com" },
  { name: "theme-color", content: "#f8fafc" },
  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content: "Gravel Coverage Calculator (Bags, Volume, or Tons)",
  },
  {
    property: "og:description",
    content:
      "Estimate gravel needed from shape dimensions, depth, and density. Outputs cubic yards, cubic feet, cubic meters, liters, pounds, tons, bag counts, and cost.",
  },
  {
    property: "og:url",
    content: "https://www.coveragecalculators.com/gravel-coverage-calculator",
  },
  { property: "og:site_name", content: "coveragecalculators.com" },
  {
    property: "og:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Gravel Coverage Calculator (Bags, Volume, or Tons)",
  },
  {
    name: "twitter:description",
    content:
      "Calculate gravel needed from shape dimensions, depth, and density. Includes optional waste and pricing.",
  },
  {
    name: "twitter:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com/gravel-coverage-calculator",
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
  if (!raw) return "N/A";
  if (!/^-?\d+(\.\d+)?$/u.test(raw)) return "N/A";
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

type OutputUnit = "l" | "m3" | "cy" | "cuft";

const OUTPUT_UNIT_LABEL: Record<OutputUnit, string> = {
  l: "Liters (L)",
  m3: "Cubic meters (m³)",
  cy: "Cubic yards (yd³)",
  cuft: "Cubic feet (ft³)",
};

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

type DensityPreset =
  | "gravel_dry"
  | "gravel_wet"
  | "crushed_stone"
  | "pea_gravel"
  | "sand_dry"
  | "sand_wet"
  | "sand_gravel_mix_dry"
  | "sand_gravel_mix_wet"
  | "custom";

type DensityUnit =
  | "t_m3"
  | "kg_m3"
  | "g_cm3"
  | "oz_in3"
  | "lb_in3"
  | "lb_ft3"
  | "lb_yd3";

const DENSITY_UNIT_LABEL: Record<DensityUnit, string> = {
  t_m3: "tons per cubic meter (t/m³)",
  kg_m3: "kilograms per cubic meter (kg/m³)",
  g_cm3: "grams per cubic centimeter (g/cm³)",
  oz_in3: "ounces per cubic inch (oz/cu in)",
  lb_in3: "pounds per cubic inch (lb/cu in)",
  lb_ft3: "pounds per cubic feet (lb/cu ft)",
  lb_yd3: "pounds per cubic yard (lb/cu yd)",
};

const DENSITY_UNIT_SHORT: Record<DensityUnit, string> = {
  t_m3: "t/m³",
  kg_m3: "kg/m³",
  g_cm3: "g/cm³",
  oz_in3: "oz/cu in",
  lb_in3: "lb/cu in",
  lb_ft3: "lb/cu ft",
  lb_yd3: "lb/cu yd",
};

const DENSITY_UNIT_PLACEHOLDER: Record<DensityUnit, string> = {
  lb_ft3: "e.g. 105",
  kg_m3: "e.g. 1680",
  t_m3: "e.g. 1.68",
  g_cm3: "e.g. 1.68",
  lb_yd3: "e.g. 2835",
  lb_in3: "e.g. 0.060",
  oz_in3: "e.g. 1.00",
};

const DENSITY_PRESETS: Array<{
  key: DensityPreset;
  label: string;
  lbPerCuftScaled: bigint | null;
  note?: string;
}> = [
  { key: "gravel_dry", label: "Gravel (dry)", lbPerCuftScaled: 105n * SCALE },
  { key: "gravel_wet", label: "Gravel (wet)", lbPerCuftScaled: 125n * SCALE },
  {
    key: "crushed_stone",
    label: "Crushed stone",
    lbPerCuftScaled: 100n * SCALE,
  },
  {
    key: "pea_gravel",
    label: "Pea gravel (approx.)",
    lbPerCuftScaled: 100n * SCALE,
  },
  { key: "sand_dry", label: "Dry sand", lbPerCuftScaled: 97n * SCALE },
  { key: "sand_wet", label: "Wet sand", lbPerCuftScaled: 119n * SCALE },
  {
    key: "sand_gravel_mix_dry",
    label: "Sand + gravel (dry)",
    lbPerCuftScaled: 107n * SCALE,
    note: "Common estimate blend",
  },
  {
    key: "sand_gravel_mix_wet",
    label: "Sand + gravel (wet)",
    lbPerCuftScaled: 126n * SCALE,
    note: "Common estimate blend",
  },
  { key: "custom", label: "Custom", lbPerCuftScaled: null },
];

type BagMode = "volume" | "weight";

type BagPresetVolume = "0_5" | "1" | "2" | "3" | "custom";

const BAG_VOLUME_PRESETS: Array<{
  key: BagPresetVolume;
  label: string;
  cuftScaled: bigint | null;
}> = [
  { key: "0_5", label: "0.5 ft³ (common)", cuftScaled: 500_000n },
  { key: "1", label: "1.0 ft³", cuftScaled: 1n * SCALE },
  { key: "2", label: "2.0 ft³", cuftScaled: 2n * SCALE },
  { key: "3", label: "3.0 ft³", cuftScaled: 3n * SCALE },
  { key: "custom", label: "Custom", cuftScaled: null },
];

type BagWeightUnit = "lb" | "kg";
type BagPresetWeight = "40lb" | "50lb" | "60lb" | "25kg" | "custom";

const BAG_WEIGHT_PRESETS: Array<{
  key: BagPresetWeight;
  label: string;
  lbScaled: bigint | null;
}> = [
  { key: "40lb", label: "40 lb bag", lbScaled: 40n * SCALE },
  { key: "50lb", label: "50 lb bag (common)", lbScaled: 50n * SCALE },
  { key: "60lb", label: "60 lb bag", lbScaled: 60n * SCALE },
  { key: "25kg", label: "25 kg bag", lbScaled: 55_115_565n },
  { key: "custom", label: "Custom", lbScaled: null },
];

type PricingMode =
  | "none"
  | "per_cuft"
  | "per_cy"
  | "per_m3"
  | "per_l"
  | "per_lb"
  | "per_kg"
  | "per_short_ton"
  | "per_metric_ton"
  | "per_bag";

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
  const num = a * SCALE;
  return (num + b / 2n) / b;
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

const LB_TO_KG_SCALED = 453_592n;
const KG_TO_LB_SCALED = 2_204_623n;
const LB_PER_SHORT_TON = 2000n;
const KG_PER_METRIC_TON_SCALED = 1000n * SCALE;

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

function densityToLbPerCuftScaled(
  valueScaled: bigint,
  unit: DensityUnit,
): bigint {
  const KG_M3_TO_LB_FT3_SCALED = 62_428n; // 0.0624279606 lb/ft³ per 1 kg/m³ (scaled 1e6)
  if (unit === "lb_ft3") return valueScaled;

  if (unit === "lb_yd3") {
    // 1 yd³ = 27 ft³
    return divScaled(valueScaled, 27n * SCALE);
  }

  if (unit === "lb_in3") {
    // 1 ft³ = 1728 in³
    return valueScaled * 1728n;
  }

  if (unit === "oz_in3") {
    // 16 oz = 1 lb, then 1 ft³ = 1728 in³ => 1728/16 = 108
    return valueScaled * 108n;
  }

  if (unit === "kg_m3") {
    return mulScaled(valueScaled, KG_M3_TO_LB_FT3_SCALED);
  }

  if (unit === "t_m3") {
    // 1 t/m³ = 1000 kg/m³
    return mulScaled(valueScaled * 1000n, KG_M3_TO_LB_FT3_SCALED);
  }

  // g/cm³: 1 g/cm³ = 1000 kg/m³
  return mulScaled(valueScaled * 1000n, KG_M3_TO_LB_FT3_SCALED);
}

export default function GravelCoverageCalculator() {
  const [shape, setShape] = useState<Shape>(() => {
    if (typeof window === "undefined") return "rectangle";
    const v = localStorage.getItem("gc_shape") as Shape | null;
    return v && v in SHAPE_LABEL ? v : "rectangle";
  });

  const [dimUnit, setDimUnit] = useState<DimUnit>(() => {
    if (typeof window === "undefined") return "ft";
    const v = (localStorage.getItem("gc_dim_unit") as DimUnit) || null;
    return v && v in DIM_UNIT_LABEL ? v : "ft";
  });

  const [depthUnit, setDepthUnit] = useState<DepthUnit>(() => {
    if (typeof window === "undefined") return "in";
    const v = (localStorage.getItem("gc_depth_unit") as DepthUnit) || null;
    return v && v in DEPTH_UNIT_LABEL ? v : "in";
  });

  const [areaDisplayUnit, setAreaDisplayUnit] = useState<AreaDisplayUnit>(
    () => {
      if (typeof window === "undefined") return "ft2";
      const v =
        (localStorage.getItem("gc_area_unit") as AreaDisplayUnit) || null;
      return v && v in AREA_UNIT_LABEL ? v : "ft2";
    },
  );

  const [outputUnit, setOutputUnit] = useState<OutputUnit>(() => {
    if (typeof window === "undefined") return "cy";
    const v = localStorage.getItem("gc_output_unit") as OutputUnit | null;
    return v && v in OUTPUT_UNIT_LABEL ? v : "cy";
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD";
    const v = (localStorage.getItem("gc_currency") as CurrencyCode) || "USD";
    return v && v in CURRENCY_LABEL ? v : "USD";
  });

  const [length, setLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_length") ?? ""),
  );
  const [width, setWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_width") ?? ""),
  );

  const [outerLength, setOuterLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_outer_length") ?? ""),
  );
  const [outerWidth, setOuterWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_outer_width") ?? ""),
  );
  const [innerLength, setInnerLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_inner_length") ?? ""),
  );
  const [innerWidth, setInnerWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_inner_width") ?? ""),
  );

  const [radius, setRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_radius") ?? ""),
  );
  const [outerRadius, setOuterRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_outer_radius") ?? ""),
  );
  const [innerRadius, setInnerRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_inner_radius") ?? ""),
  );

  const [base, setBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_base") ?? ""),
  );
  const [height, setHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_height") ?? ""),
  );

  const [outerBase, setOuterBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_outer_base") ?? ""),
  );
  const [outerHeight, setOuterHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_outer_height") ?? ""),
  );
  const [innerBase, setInnerBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_inner_base") ?? ""),
  );
  const [innerHeight, setInnerHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_inner_height") ?? ""),
  );

  const [depth, setDepth] = useState<string>(() =>
    typeof window === "undefined"
      ? "2"
      : (localStorage.getItem("gc_depth") ?? "2"),
  );
  const [wastePct, setWastePct] = useState<string>(() =>
    typeof window === "undefined"
      ? "0"
      : (localStorage.getItem("gc_waste_pct") ?? "0"),
  );

  const [densityPreset, setDensityPreset] = useState<DensityPreset>(() => {
    if (typeof window === "undefined") return "gravel_dry";
    const v =
      (localStorage.getItem("gc_density_preset") as DensityPreset) ||
      "gravel_dry";
    return DENSITY_PRESETS.some((d) => d.key === v) ? v : "gravel_dry";
  });
  const [densityUnit, setDensityUnit] = useState<DensityUnit>(() => {
    if (typeof window === "undefined") return "lb_ft3";
    const v =
      (localStorage.getItem("gc_density_unit") as DensityUnit) || "lb_ft3";
    return v && v in DENSITY_UNIT_LABEL ? v : "lb_ft3";
  });
  const [densityCustom, setDensityCustom] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_density_custom") ?? ""),
  );

  const [bagMode, setBagMode] = useState<BagMode>(() => {
    if (typeof window === "undefined") return "volume";
    const v = (localStorage.getItem("gc_bag_mode") as BagMode) || "volume";
    return v === "volume" || v === "weight" ? v : "volume";
  });

  const [bagPresetVolume, setBagPresetVolume] = useState<BagPresetVolume>(
    () => {
      if (typeof window === "undefined") return "0_5";
      const v =
        (localStorage.getItem("gc_bag_preset_vol") as BagPresetVolume) || "0_5";
      return BAG_VOLUME_PRESETS.some((b) => b.key === v) ? v : "0_5";
    },
  );

  const [bagSizeCustomCuft, setBagSizeCustomCuft] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_bag_custom_cuft") ?? ""),
  );

  const [bagWeightUnit, setBagWeightUnit] = useState<BagWeightUnit>(() => {
    if (typeof window === "undefined") return "lb";
    const v =
      (localStorage.getItem("gc_bag_weight_unit") as BagWeightUnit) || "lb";
    return v === "lb" || v === "kg" ? v : "lb";
  });

  const [bagPresetWeight, setBagPresetWeight] = useState<BagPresetWeight>(
    () => {
      if (typeof window === "undefined") return "50lb";
      const v =
        (localStorage.getItem("gc_bag_preset_wt") as BagPresetWeight) || "50lb";
      return BAG_WEIGHT_PRESETS.some((b) => b.key === v) ? v : "50lb";
    },
  );

  const [bagWeightCustom, setBagWeightCustom] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_bag_custom_weight") ?? ""),
  );

  const [pricingMode, setPricingMode] = useState<PricingMode>(() => {
    if (typeof window === "undefined") return "none";
    const v =
      (localStorage.getItem("gc_pricing_mode") as PricingMode) || "none";
    const ok =
      v === "none" ||
      v === "per_cuft" ||
      v === "per_cy" ||
      v === "per_m3" ||
      v === "per_l" ||
      v === "per_lb" ||
      v === "per_kg" ||
      v === "per_short_ton" ||
      v === "per_metric_ton" ||
      v === "per_bag";
    return ok ? v : "none";
  });

  const [price, setPrice] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("gc_price") ?? ""),
  );

  const [roundForDisplay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return safeJsonParseBoolean(localStorage.getItem("gc_rounding"), true);
  });

  const [displayDecimals] = useState<0 | 2 | 4 | 6>(() => {
    if (typeof window === "undefined") return 2;
    return safeParseDisplayDecimals(
      localStorage.getItem("gc_display_decimals"),
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
        localStorage.setItem("gc_shape", shape);
        localStorage.setItem("gc_dim_unit", dimUnit);
        localStorage.setItem("gc_depth_unit", depthUnit);
        localStorage.setItem("gc_area_unit", areaDisplayUnit);
        localStorage.setItem("gc_output_unit", outputUnit);
        localStorage.setItem("gc_currency", currency);

        localStorage.setItem("gc_length", length);
        localStorage.setItem("gc_width", width);

        localStorage.setItem("gc_outer_length", outerLength);
        localStorage.setItem("gc_outer_width", outerWidth);
        localStorage.setItem("gc_inner_length", innerLength);
        localStorage.setItem("gc_inner_width", innerWidth);

        localStorage.setItem("gc_radius", radius);
        localStorage.setItem("gc_outer_radius", outerRadius);
        localStorage.setItem("gc_inner_radius", innerRadius);

        localStorage.setItem("gc_base", base);
        localStorage.setItem("gc_height", height);

        localStorage.setItem("gc_outer_base", outerBase);
        localStorage.setItem("gc_outer_height", outerHeight);
        localStorage.setItem("gc_inner_base", innerBase);
        localStorage.setItem("gc_inner_height", innerHeight);

        localStorage.setItem("gc_depth", depth);
        localStorage.setItem("gc_waste_pct", wastePct);

        localStorage.setItem("gc_density_preset", densityPreset);
        localStorage.setItem("gc_density_unit", densityUnit);
        localStorage.setItem("gc_density_custom", densityCustom);

        localStorage.setItem("gc_bag_mode", bagMode);
        localStorage.setItem("gc_bag_preset_vol", bagPresetVolume);
        localStorage.setItem("gc_bag_custom_cuft", bagSizeCustomCuft);
        localStorage.setItem("gc_bag_weight_unit", bagWeightUnit);
        localStorage.setItem("gc_bag_preset_wt", bagPresetWeight);
        localStorage.setItem("gc_bag_custom_weight", bagWeightCustom);

        localStorage.setItem("gc_pricing_mode", pricingMode);
        localStorage.setItem("gc_price", price);

        localStorage.setItem("gc_rounding", JSON.stringify(roundForDisplay));
        localStorage.setItem("gc_display_decimals", String(displayDecimals));
      } catch {
        // ignore
      }
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
    densityPreset,
    densityUnit,
    densityCustom,
    bagMode,
    bagPresetVolume,
    bagSizeCustomCuft,
    bagWeightUnit,
    bagPresetWeight,
    bagWeightCustom,
    pricingMode,
    price,
    roundForDisplay,
    displayDecimals,
  ]);

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

    const densityCustomParsed =
      densityPreset === "custom"
        ? parseNonNegativeToScaled(densityCustom, {
            emptyError: "Enter a custom density.",
          })
        : ({ ok: true, scaled: 0n } as ParseScaledResult);

    const bagCustomVolParsed =
      bagMode === "volume" && bagPresetVolume === "custom"
        ? parseNonNegativeToScaled(bagSizeCustomCuft, {
            emptyError: "Enter a custom bag size (ft³).",
          })
        : ({ ok: true, scaled: 0n } as ParseScaledResult);

    const bagCustomWtParsed =
      bagMode === "weight" && bagPresetWeight === "custom"
        ? parseNonNegativeToScaled(bagWeightCustom, {
            emptyError: "Enter a custom bag weight.",
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
      densityCustomParsed,
      bagCustomVolParsed,
      bagCustomWtParsed,
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
    densityPreset,
    densityCustom,
    bagMode,
    bagPresetVolume,
    bagSizeCustomCuft,
    bagPresetWeight,
    bagWeightCustom,
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

    if (densityPreset === "custom") {
      const dn = mustPos(parsed.densityCustomParsed, "custom density");
      if (!dn.ok) return dn;
    }

    if (bagMode === "volume" && bagPresetVolume === "custom") {
      const b = mustPos(parsed.bagCustomVolParsed, "custom bag size");
      if (!b.ok) return b;
    }

    if (bagMode === "weight" && bagPresetWeight === "custom") {
      const b = mustPos(parsed.bagCustomWtParsed, "custom bag weight");
      if (!b.ok) return b;
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
  }, [
    parsed,
    shape,
    densityPreset,
    bagMode,
    bagPresetVolume,
    bagPresetWeight,
    pricingMode,
    price,
  ]);

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

        densityLbPerCuftScaled: null as bigint | null,

        weightLbScaled: null as bigint | null,
        weightKgScaled: null as bigint | null,
        weightShortTonsScaled: null as bigint | null,
        weightMetricTonsScaled: null as bigint | null,

        bagBasisLabel: null as string | null,
        bagSizeBasisScaled: null as bigint | null,
        bagsExactScaled: null as bigint | null,
        bagsRoundedUp: null as bigint | null,

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
      // Use scaled division for proper rounding instead of truncation.
      return divScaled(bh, 2n * SCALE);
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

    function divRoundBigInt(n: bigint, d: bigint) {
      if (d === 0n) return 0n;
      const half = d / 2n;
      return (n + half) / d;
    }

    const volumeCyScaled = divRoundBigInt(
      volumeCuftWithWasteScaled,
      CUFT_PER_CY,
    );
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
      if (areaDisplayUnit === "yd2") {
        return divScaled(areaSqftScaled, 9n * SCALE);
      }
      if (areaDisplayUnit === "in2") {
        return areaSqftScaled * 144n;
      }
      if (areaDisplayUnit === "cm2") {
        return areaSqmScaled * 10_000n;
      }
      return areaAcresScaled;
    })();

    const preset =
      DENSITY_PRESETS.find((d) => d.key === densityPreset) ??
      DENSITY_PRESETS[0];
    const densityInputScaled =
      densityPreset === "custom"
        ? (parsed.densityCustomParsed.scaled ?? 0n)
        : (preset.lbPerCuftScaled ?? 0n);

    const densityLbPerCuftScaled =
      densityPreset === "custom"
        ? densityToLbPerCuftScaled(densityInputScaled, densityUnit)
        : densityInputScaled;

    const weightLbScaled = mulScaled(
      volumeCuftWithWasteScaled,
      densityLbPerCuftScaled,
    );
    const weightKgScaled = mulScaled(weightLbScaled, LB_TO_KG_SCALED);
    const weightShortTonsScaled = divScaled(
      weightLbScaled,
      LB_PER_SHORT_TON * SCALE,
    );
    const weightMetricTonsScaled = divScaled(
      weightKgScaled,
      KG_PER_METRIC_TON_SCALED,
    );

    let bagBasisLabel: string | null = null;
    let bagSizeBasisScaled: bigint | null = null;
    let bagsExactScaled: bigint | null = null;
    let bagsRoundedUp: bigint | null = null;

    if (bagMode === "volume") {
      const bPreset =
        BAG_VOLUME_PRESETS.find((b) => b.key === bagPresetVolume) ??
        BAG_VOLUME_PRESETS[0];
      const bagSizeCuftScaled =
        bagPresetVolume === "custom"
          ? (parsed.bagCustomVolParsed.scaled ?? 0n)
          : (bPreset.cuftScaled ?? 0n);

      bagBasisLabel = "Bag volume (ft³)";
      bagSizeBasisScaled = bagSizeCuftScaled;
      bagsExactScaled =
        bagSizeCuftScaled > 0n
          ? divScaled(volumeCuftWithWasteScaled, bagSizeCuftScaled)
          : 0n;
      bagsRoundedUp =
        bagSizeCuftScaled > 0n
          ? ceilDivBigInt(volumeCuftWithWasteScaled, bagSizeCuftScaled)
          : 0n;
    } else {
      const wPreset =
        BAG_WEIGHT_PRESETS.find((b) => b.key === bagPresetWeight) ??
        BAG_WEIGHT_PRESETS[0];
      let bagWeightLbScaled =
        bagPresetWeight === "custom"
          ? (parsed.bagCustomWtParsed.scaled ?? 0n)
          : (wPreset.lbScaled ?? 0n);

      if (bagPresetWeight === "custom") {
        if (bagWeightUnit === "kg") {
          bagWeightLbScaled = mulScaled(bagWeightLbScaled, KG_TO_LB_SCALED);
        }
      }

      bagBasisLabel = "Bag weight (lb)";
      bagSizeBasisScaled = bagWeightLbScaled;
      bagsExactScaled =
        bagWeightLbScaled > 0n
          ? divScaled(weightLbScaled, bagWeightLbScaled)
          : 0n;
      bagsRoundedUp =
        bagWeightLbScaled > 0n
          ? ceilDivBigInt(weightLbScaled, bagWeightLbScaled)
          : 0n;
    }

    let costScaled: bigint | null = null;
    const priceScaled = price.trim() ? (parsed.pPrice.scaled ?? 0n) : 0n;

    if (price.trim() && pricingMode !== "none") {
      if (pricingMode === "per_cuft") {
        costScaled = mulScaled(priceScaled, volumeCuftWithWasteScaled);
      } else if (pricingMode === "per_cy") {
        costScaled = mulScaled(priceScaled, volumeCyScaled);
      } else if (pricingMode === "per_m3") {
        costScaled = mulScaled(priceScaled, volumeM3Scaled);
      } else if (pricingMode === "per_l") {
        costScaled = mulScaled(priceScaled, volumeLitersScaled);
      } else if (pricingMode === "per_lb") {
        costScaled = mulScaled(priceScaled, weightLbScaled);
      } else if (pricingMode === "per_kg") {
        costScaled = mulScaled(priceScaled, weightKgScaled);
      } else if (pricingMode === "per_short_ton") {
        costScaled = mulScaled(priceScaled, weightShortTonsScaled);
      } else if (pricingMode === "per_metric_ton") {
        costScaled = mulScaled(priceScaled, weightMetricTonsScaled);
      } else if (pricingMode === "per_bag") {
        costScaled = mulScaled(priceScaled, (bagsRoundedUp ?? 0n) * SCALE);
      }
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

      densityLbPerCuftScaled,

      weightLbScaled,
      weightKgScaled,
      weightShortTonsScaled,
      weightMetricTonsScaled,

      bagBasisLabel,
      bagSizeBasisScaled,
      bagsExactScaled,
      bagsRoundedUp,

      costScaled,
    };
  }, [
    validation.ok,
    parsed,
    shape,
    dimUnit,
    depthUnit,
    areaDisplayUnit,
    densityPreset,
    densityUnit,
    bagMode,
    bagPresetVolume,
    bagPresetWeight,
    bagWeightUnit,
    pricingMode,
    price,
  ]);

  const primaryVolume = useMemo(() => {
    const label = OUTPUT_UNIT_LABEL[outputUnit];
    if (!validation.ok) return { label, value: "N/A" };
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
      return { cy: "N/A", cuft: "N/A", m3: "N/A", l: "N/A" };
    }
    const cy =
      computed.volumeCyScaled !== null
        ? `${toPrettyNumber(computed.volumeCyScaled, roundForDisplay, displayDecimals)} yd³`
        : "N/A";
    const cuft =
      computed.volumeCuftWithWasteScaled !== null
        ? `${toPrettyNumber(computed.volumeCuftWithWasteScaled, roundForDisplay, displayDecimals)} ft³`
        : "N/A";
    const m3 =
      computed.volumeM3Scaled !== null
        ? `${toPrettyNumber(computed.volumeM3Scaled, roundForDisplay, displayDecimals)} m³`
        : "N/A";
    const l =
      computed.volumeLitersScaled !== null
        ? `${toPrettyNumber(computed.volumeLitersScaled, roundForDisplay, displayDecimals)} L`
        : "N/A";
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

  const quickWeights = useMemo(() => {
    if (!validation.ok) {
      return { lb: "N/A", st: "N/A", kg: "N/A", mt: "N/A" };
    }
    const lb =
      computed.weightLbScaled !== null
        ? `${toPrettyNumber(computed.weightLbScaled, roundForDisplay, displayDecimals)} lb`
        : "N/A";
    const st =
      computed.weightShortTonsScaled !== null
        ? `${toPrettyNumber(computed.weightShortTonsScaled, roundForDisplay, displayDecimals)} short tons`
        : "N/A";
    const kg =
      computed.weightKgScaled !== null
        ? `${toPrettyNumber(computed.weightKgScaled, roundForDisplay, displayDecimals)} kg`
        : "N/A";
    const mt =
      computed.weightMetricTonsScaled !== null
        ? `${toPrettyNumber(computed.weightMetricTonsScaled, roundForDisplay, displayDecimals)} metric tons`
        : "N/A";
    return { lb, st, kg, mt };
  }, [
    validation.ok,
    computed.weightLbScaled,
    computed.weightShortTonsScaled,
    computed.weightKgScaled,
    computed.weightMetricTonsScaled,
    roundForDisplay,
    displayDecimals,
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
    name: "Gravel Coverage Calculator",
    description:
      "Estimate gravel needed using shape dimensions, depth, and optional density. Outputs volume, weight, bags, and cost.",
    url: "https://www.coveragecalculators.com/gravel-coverage-calculator",
  };

  const resultRegionId = "gravel-results-region";

  const densityDisplay = useMemo(() => {
    if (!validation.ok) return "N/A";
    if (computed.densityLbPerCuftScaled === null) return "N/A";

    const lbft3 = `${toPrettyNumber(computed.densityLbPerCuftScaled, true, 0)} lb/ft³`;

    const LB_FT3_TO_KG_M3_SCALED = 16_018_463n;
    const kgm3Scaled = mulScaled(
      computed.densityLbPerCuftScaled,
      LB_FT3_TO_KG_M3_SCALED,
    );
    const kgm3 = `${toPrettyNumber(kgm3Scaled, true, 0)} kg/m³`;

    return `${lbft3} (${kgm3})`;
  }, [
    validation.ok,
    computed.densityLbPerCuftScaled,
    displayDecimals,
    roundForDisplay,
  ]);

  const gravelWeightCalc = useMemo(() => {
    if (!validation.ok) {
      return {
        ok: false as const,
        baseWeightLbScaled: 0n,
        wasteWeightLbScaled: 0n,
        totalWeightLbScaled: 0n,
        rows: [] as Array<{ label: string; value: string }>,
      };
    }

    const totalWeightLbScaled = computed.weightLbScaled ?? 0n;
    const totalWeightKgScaled =
      computed.weightKgScaled ??
      mulScaled(totalWeightLbScaled, LB_TO_KG_SCALED);

    const wasteScaled = parsed.pWaste.scaled ?? 0n;
    const wasteFracScaled = divScaled(wasteScaled, 100n * SCALE);
    const factorScaled = SCALE + wasteFracScaled;

    const totalVolCuftScaled = computed.volumeCuftWithWasteScaled ?? 0n;
    const baseVolCuftScaled =
      factorScaled > 0n ? divScaled(totalVolCuftScaled, factorScaled) : 0n;

    const densityLbPerCuftScaled = computed.densityLbPerCuftScaled ?? 0n;
    const baseWeightLbScaled = mulScaled(
      baseVolCuftScaled,
      densityLbPerCuftScaled,
    );
    const wasteWeightLbScaled = clampNonNegativeScaled(
      totalWeightLbScaled - baseWeightLbScaled,
    );

    const ozScaled = totalWeightLbScaled * 16n;
    const grainsScaled = totalWeightLbScaled * 7000n;
    const drachmsScaled = totalWeightLbScaled * 256n;
    const stonesScaled = divScaled(totalWeightLbScaled, 14n * SCALE);
    const longTonsScaled = divScaled(totalWeightLbScaled, 2240n * SCALE);
    const gramsScaled = totalWeightKgScaled * 1000n;
    const mgScaled = gramsScaled * 1000n;

    const rows: Array<{ label: string; value: string }> = [
      {
        label: "Grams (g)",
        value: `${toPrettyNumber(gramsScaled, roundForDisplay, displayDecimals)} g`,
      },
      {
        label: "Kilograms (kg)",
        value: `${toPrettyNumber(totalWeightKgScaled, roundForDisplay, displayDecimals)} kg`,
      },
      {
        label: "Milligrams (mg)",
        value: `${toPrettyNumber(mgScaled, true, 0)} mg`,
      },
      {
        label: "Pounds (lb)",
        value: `${toPrettyNumber(totalWeightLbScaled, roundForDisplay, displayDecimals)} lb`,
      },
      {
        label: "Ounces (oz)",
        value: `${toPrettyNumber(ozScaled, roundForDisplay, displayDecimals)} oz`,
      },
      {
        label: "US ton (short ton)",
        value: `${toPrettyNumber(computed.weightShortTonsScaled ?? 0n, roundForDisplay, displayDecimals)} short tons`,
      },
      {
        label: "Metric ton",
        value: `${toPrettyNumber(computed.weightMetricTonsScaled ?? 0n, roundForDisplay, displayDecimals)} metric tons`,
      },
      {
        label: "Imperial ton (long ton)",
        value: `${toPrettyNumber(longTonsScaled, roundForDisplay, displayDecimals)} long tons`,
      },
      {
        label: "Stones (st)",
        value: `${toPrettyNumber(stonesScaled, roundForDisplay, displayDecimals)} st`,
      },
      {
        label: "Grains (gr)",
        value: `${toPrettyNumber(grainsScaled, true, 0)} gr`,
      },
      {
        label: "Drachms (dr)",
        value: `${toPrettyNumber(drachmsScaled, true, 0)} dr`,
      },
    ];

    return {
      ok: true as const,
      baseWeightLbScaled,
      wasteWeightLbScaled,
      totalWeightLbScaled,
      rows,
    };
  }, [
    validation.ok,
    computed.weightLbScaled,
    computed.weightKgScaled,
    computed.weightShortTonsScaled,
    computed.weightMetricTonsScaled,
    computed.volumeCuftWithWasteScaled,
    computed.densityLbPerCuftScaled,
    parsed.pWaste.scaled,
    roundForDisplay,
    displayDecimals,
  ]);

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
        <div className="rounded-2xl bg-white sm:shadow-sm sm:border border-slate-200 sm:px-4 pb-4">
          <div className="flex flex-col pt-2 sm:pt-4 pb-1 sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="mb-1 text-center sm:text-left text-2xl sm:text-3xl md:text-4xl capitalize font-bold text-sky-800 tracking-tight">
              Gravel Coverage Calculator
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
            Enter shape dimensions and a target depth to estimate gravel volume.
            Add density to estimate weight in pounds or tons and enable
            weight-based pricing or bag counts.
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
                    Depth units
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
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Gravel depth ({depthUnit})
                    </span>
                    <input
                      inputMode="decimal"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder={depthUnit === "in" ? "e.g. 4" : "e.g. 0.10"}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      Common depths: 2–6 in for walkways, 4–6 in for driveways,
                      and thicker for base layers depending on soil conditions.
                    </div>
                  </label>

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
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      Adds extra volume for compaction, spillage, and uneven
                      grade.
                    </div>
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
        </div>

        <ShapePreview shape={shape} unit={dimUnit} />

        <div
          id={resultRegionId}
          className="mt-3 mb-6 rounded-2xl border border-slate-200 bg-[#f7fbff] p-5 sm:p-6 shadow-sm relative"
          role="region"
          aria-label="Gravel results"
          aria-live="polite"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-200 rounded-t-2xl" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
                  {validation.ok ? primaryVolume.value : "N/A"}
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
                  : "N/A"}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
                {validation.ok && computed.areaSqftScaled !== null
                  ? `${toPrettyNumber(computed.areaSqftScaled, roundForDisplay, displayDecimals)} ft²`
                  : "N/A"}
                <span className="mx-2 text-slate-300" aria-hidden="true">
                  |
                </span>
                {validation.ok && computed.areaSqmScaled !== null
                  ? `${toPrettyNumber(computed.areaSqmScaled, roundForDisplay, displayDecimals)} m²`
                  : "N/A"}
                <span className="mx-2 text-slate-300" aria-hidden="true">
                  |
                </span>
                {validation.ok && computed.areaAcresScaled !== null
                  ? `${toPrettyNumber(computed.areaAcresScaled, roundForDisplay, displayDecimals)} ac`
                  : "N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600">Volume</div>
              <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                {validation.ok ? primaryVolume.value : "N/A"}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
                {quickTotals.cuft}{" "}
                <span className="mx-2 text-slate-300">|</span> {quickTotals.cy}{" "}
                <span className="mx-2 text-slate-300">|</span> {quickTotals.m3}{" "}
                <span className="mx-2 text-slate-300">|</span> {quickTotals.l}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600">Waste</div>
              <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                {validation.ok &&
                parsed.pWaste.ok &&
                parsed.pWaste.scaled !== undefined
                  ? `${toPrettyNumber(parsed.pWaste.scaled, true, 0)}%`
                  : "N/A"}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                Applied to volume only.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:col-span-3">
              <div className="text-xs font-medium text-slate-600">Density</div>
              <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                {densityDisplay}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">
                Change the preset for sand, gravel, crushed stone, or enter a
                custom density.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <details className="group">
              <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">
                    Weight estimate (optional)
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Expand for waste weight and more units (uses density)
                  </span>
                </div>
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                  <div className="text-sm font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                    {validation.ok ? quickWeights.st : "N/A"}
                  </div>
                  <span className="text-slate-400 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </div>
              </summary>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">
                    Density (for weight + weight-based pricing)
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Used to convert volume into pounds/tons.
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block sm:col-span-2">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Material / density preset
                    </span>
                    <select
                      value={densityPreset}
                      onChange={(e) =>
                        setDensityPreset(e.target.value as DensityPreset)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {DENSITY_PRESETS.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {DENSITY_PRESETS.find((d) => d.key === densityPreset)
                      ?.note ? (
                      <div className="mt-1 text-[11px] font-semibold text-slate-500">
                        {
                          DENSITY_PRESETS.find((d) => d.key === densityPreset)
                            ?.note
                        }
                      </div>
                    ) : null}
                  </label>

                  <label
                    className={`block ${
                      densityPreset === "custom"
                        ? ""
                        : "opacity-60 pointer-events-none"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom density units
                    </span>
                    <select
                      value={densityUnit}
                      onChange={(e) =>
                        setDensityUnit(e.target.value as DensityUnit)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {(Object.keys(DENSITY_UNIT_LABEL) as DensityUnit[]).map(
                        (u) => (
                          <option key={u} value={u}>
                            {DENSITY_UNIT_LABEL[u]}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label
                    className={`block sm:col-span-3 ${
                      densityPreset === "custom"
                        ? ""
                        : "opacity-60 pointer-events-none"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom density value ({DENSITY_UNIT_SHORT[densityUnit]})
                    </span>
                    <input
                      inputMode="decimal"
                      value={densityCustom}
                      onChange={(e) => setDensityCustom(e.target.value)}
                      placeholder={DENSITY_UNIT_PLACEHOLDER[densityUnit]}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                  </label>

                  <div className="sm:col-span-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      Density used for calculation
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                      {densityDisplay}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      Density varies by stone type, moisture, and compaction.
                      This is an estimate.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">
                    Weight without waste
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                    {gravelWeightCalc.ok
                      ? `${toPrettyNumber(gravelWeightCalc.baseWeightLbScaled, roundForDisplay, displayDecimals)} lb`
                      : "N/A"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">
                    Waste weight added
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                    {gravelWeightCalc.ok
                      ? `${toPrettyNumber(gravelWeightCalc.wasteWeightLbScaled, roundForDisplay, displayDecimals)} lb`
                      : "N/A"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-emerald-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">
                    Total weight (with waste)
                  </div>
                  <div className="mt-1 text-sm font-bold text-emerald-700 tabular-nums">
                    {gravelWeightCalc.ok
                      ? `${toPrettyNumber(gravelWeightCalc.totalWeightLbScaled, roundForDisplay, displayDecimals)} lb`
                      : "N/A"}
                  </div>
                </div>

                <div className="sm:col-span-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">
                    Total weight in other units
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {gravelWeightCalc.ok
                      ? gravelWeightCalc.rows.map((r) => (
                          <div
                            key={r.label}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-[11px] font-semibold text-slate-600">
                              {r.label}
                            </div>
                            <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
                              {r.value}
                            </div>
                          </div>
                        ))
                      : null}
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-slate-500">
                    US ton is short ton (2,000 lb). Imperial ton is long ton
                    (2,240 lb).
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <details className="group">
              <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">
                    Bags + cost estimate (optional)
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Expand to set bag size (volume or weight) and unit pricing
                  </span>
                </div>
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                  <div className="text-sm font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                    {validation.ok && computed.bagsRoundedUp !== null
                      ? `${computed.bagsRoundedUp.toString()} bags`
                      : "N/A"}
                  </div>
                  <span className="text-slate-400 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </div>
              </summary>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">
                    Bag mode
                  </span>
                  <select
                    value={bagMode}
                    onChange={(e) => setBagMode(e.target.value as BagMode)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                  >
                    <option value="volume">Volume bags (ft³ per bag)</option>
                    <option value="weight">
                      Weight bags (lb or kg per bag)
                    </option>
                  </select>
                </label>

                {bagMode === "volume" ? (
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Bag size (volume)
                    </span>
                    <select
                      value={bagPresetVolume}
                      onChange={(e) =>
                        setBagPresetVolume(e.target.value as BagPresetVolume)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {BAG_VOLUME_PRESETS.map((b) => (
                        <option key={b.key} value={b.key}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Bag size (weight)
                      </span>
                      <select
                        value={bagPresetWeight}
                        onChange={(e) =>
                          setBagPresetWeight(e.target.value as BagPresetWeight)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                      >
                        {BAG_WEIGHT_PRESETS.map((b) => (
                          <option key={b.key} value={b.key}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label
                      className={`block ${
                        bagPresetWeight === "custom"
                          ? ""
                          : "opacity-60 pointer-events-none"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Custom weight units
                      </span>
                      <select
                        value={bagWeightUnit}
                        onChange={(e) =>
                          setBagWeightUnit(e.target.value as BagWeightUnit)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                      >
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                      </select>
                    </label>
                  </div>
                )}

                {bagMode === "volume" ? (
                  <label
                    className={`block sm:col-span-2 ${
                      bagPresetVolume === "custom"
                        ? ""
                        : "opacity-60 pointer-events-none"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom bag size (ft³)
                    </span>
                    <input
                      inputMode="decimal"
                      value={bagSizeCustomCuft}
                      onChange={(e) => setBagSizeCustomCuft(e.target.value)}
                      placeholder="e.g. 0.5"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                  </label>
                ) : (
                  <label
                    className={`block sm:col-span-2 ${
                      bagPresetWeight === "custom"
                        ? ""
                        : "opacity-60 pointer-events-none"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom bag weight ({bagWeightUnit})
                    </span>
                    <input
                      inputMode="decimal"
                      value={bagWeightCustom}
                      onChange={(e) => setBagWeightCustom(e.target.value)}
                      placeholder={
                        bagWeightUnit === "lb" ? "e.g. 50" : "e.g. 25"
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      Weight-based bags use the calculated weight from density.
                    </div>
                  </label>
                )}

                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      Exact bags
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                      {validation.ok && computed.bagsExactScaled !== null
                        ? toPrettyNumber(
                            computed.bagsExactScaled,
                            roundForDisplay,
                            displayDecimals,
                          )
                        : "N/A"}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      {computed.bagBasisLabel
                        ? `Basis: ${computed.bagBasisLabel}`
                        : "Basis: N/A"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-emerald-50 px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      Buy count (rounded up)
                    </div>
                    <div className="mt-1 text-lg font-bold text-emerald-700 tabular-nums">
                      {validation.ok && computed.bagsRoundedUp !== null
                        ? computed.bagsRoundedUp.toString()
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 mt-1 grid gap-3 sm:grid-cols-3">
                  <label className="block sm:col-span-1">
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

                  <label className="block sm:col-span-1">
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
                      <option value="per_cuft">Price per cubic foot</option>
                      <option value="per_cy">Price per cubic yard</option>
                      <option value="per_m3">Price per cubic meter</option>
                      <option value="per_l">Price per liter</option>
                      <option value="per_lb">Price per pound</option>
                      <option value="per_short_ton">Price per short ton</option>
                      <option value="per_kg">Price per kg</option>
                      <option value="per_metric_ton">
                        Price per metric ton
                      </option>
                      <option value="per_bag">Price per bag</option>
                    </select>
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      Weight-based pricing uses density.
                    </div>
                  </label>

                  <label
                    className={`block sm:col-span-1 ${
                      pricingMode === "none"
                        ? "opacity-60 pointer-events-none"
                        : ""
                    }`}
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

                  <div className="sm:col-span-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
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
                        : "N/A"}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {pricingMode === "per_bag"
                        ? "Uses rounded-up bag count."
                        : pricingMode === "per_cuft"
                          ? "Uses total volume in ft³."
                          : pricingMode === "per_cy"
                            ? "Uses total volume in yd³."
                            : pricingMode === "per_m3"
                              ? "Uses total volume in m³."
                              : pricingMode === "per_l"
                                ? "Uses total volume in liters."
                                : pricingMode === "per_lb"
                                  ? "Uses total weight in pounds."
                                  : pricingMode === "per_short_ton"
                                    ? "Uses total weight in short tons."
                                    : pricingMode === "per_kg"
                                      ? "Uses total weight in kg."
                                      : pricingMode === "per_metric_ton"
                                        ? "Uses total weight in metric tons."
                                        : "Set a pricing basis to estimate cost."}
                    </div>
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

        <div className="mt-8">
          <ToolFit />
        </div>

        <div className="mt-8">
          <HowItWorks />
        </div>

        <div className="mt-8">
          <Assumptions />
        </div>

        <div className="mt-8 pb-10">
          <FAQ />
        </div>
      </section>

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
