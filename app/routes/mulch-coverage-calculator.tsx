import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/mulch-coverage-calculator";
import ShapePreview from "~/client/components/mulch-coverage-calculator/ShapePreview";
import Assumptions from "~/client/components/mulch-coverage-calculator/Assumptions";
import HowItWorks from "~/client/components/mulch-coverage-calculator/HowItWorks";
import ToolFit from "~/client/components/mulch-coverage-calculator/ToolFit";
import FAQ from "~/client/components/mulch-coverage-calculator/FAQ";

export const meta: Route.MetaFunction = () => [
  { title: "Mulch Coverage Calculator: Bags or Cubic Yards Needed" },
  {
    name: "description",
    content:
      "Calculate how many bags or cubic yards of mulch are needed from shape dimensions and target depth. Supports common shapes and border shapes.",
  },
  {
    name: "keywords",
    content:
      "mulch calculator, mulch coverage calculator, how much mulch do i need, cubic yards mulch, mulch bags estimate, ring bed calculator",
  },
  { name: "robots", content: "index,follow" },
  { name: "author", content: "coveragecalculators.com" },
  { name: "theme-color", content: "#f8fafc" },

  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content: "Mulch Coverage Calculator (Bags or Cubic Yards)",
  },
  {
    property: "og:description",
    content:
      "Estimate mulch needed from shape dimensions and depth. Outputs cubic yards, cubic feet, cubic meters, liters, and bag counts.",
  },
  {
    property: "og:url",
    content: "https://www.coveragecalculators.com/mulch-coverage-calculator",
  },
  { property: "og:site_name", content: "coveragecalculators.com" },
  {
    property: "og:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Mulch Coverage Calculator (Bags or Cubic Yards)",
  },
  {
    name: "twitter:description",
    content:
      "Calculate mulch needed from shape dimensions and depth. Includes optional waste and pricing.",
  },
  {
    name: "twitter:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com/mulch-coverage-calculator",
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
    // Comma-only input: allow comma as either thousands separators or decimal separator.
    // If it matches a thousands pattern (1,234 or 1,234,567) treat as thousands.
    // Otherwise treat as decimal separator, with optional enforcement for prices.
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
    // Dot-decimal or integer with optional commas as thousands.
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

type BagPreset = "2" | "1_5" | "3" | "custom";

const BAG_PRESETS: Array<{
  key: BagPreset;
  label: string;
  cuftScaled: bigint | null;
}> = [
  { key: "2", label: "2.0 cu ft (common)", cuftScaled: 2n * SCALE },
  { key: "1_5", label: "1.5 cu ft", cuftScaled: 1_500_000n },
  { key: "3", label: "3.0 cu ft", cuftScaled: 3n * SCALE },
  { key: "custom", label: "Custom", cuftScaled: null },
];

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

type OutputUnit = "l" | "m3" | "cy" | "cuft";

const OUTPUT_UNIT_LABEL: Record<OutputUnit, string> = {
  l: "Liters (L)",
  m3: "Cubic meters (m³)",
  cy: "Cubic yards (yd³)",
  cuft: "Cubic feet (ft³)",
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

// Constants (scaled)
const PI_SCALED = 3_141_593n; // pi * 1e6 (rounded)

// linear conversion to feet (scaled)
const FT_TO_FT_SCALED = 1_000_000n;
const IN_TO_FT_SCALED = 83_333n; // 1/12 ft
const YD_TO_FT_SCALED = 3_000_000n; // 3 ft
const M_TO_FT_SCALED = 3_280_840n; // 3.28084 ft
const CM_TO_FT_SCALED = 32_808n; // 0.0328084 ft

const SQM_TO_SQFT_SCALED = 10_763_910n; // 1 sqm = 10.763910 sqft
const CUFT_PER_CY = 27n; // exact
const CUFT_PER_M3_SCALED = 35_314_667n; // 1 m3 = 35.3146667 cuft (scaled)
const SQFT_PER_ACRE = 43_560n;

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

export default function MulchCoverageCalculator() {
  const [shape, setShape] = useState<Shape>(() => {
    if (typeof window === "undefined") return "rectangle";
    const v = localStorage.getItem("mc_shape") as Shape | null;
    return v && v in SHAPE_LABEL ? v : "rectangle";
  });

  const [dimUnit, setDimUnit] = useState<DimUnit>(() => {
    if (typeof window === "undefined") return "ft";
    const v = (localStorage.getItem("mc_dim_unit") as DimUnit) || null;
    if (v && v in DIM_UNIT_LABEL) return v;

    const legacy = (localStorage.getItem("mc_unit") as DimUnit) || "ft";
    return legacy && legacy in DIM_UNIT_LABEL ? legacy : "ft";
  });

  const [depthUnit, setDepthUnit] = useState<DepthUnit>(() => {
    if (typeof window === "undefined") return "in";
    const v = (localStorage.getItem("mc_depth_unit") as DepthUnit) || null;
    return v && v in DEPTH_UNIT_LABEL ? v : "in";
  });

  const [areaDisplayUnit, setAreaDisplayUnit] = useState<AreaDisplayUnit>(
    () => {
      if (typeof window === "undefined") return "ft2";
      const v =
        (localStorage.getItem("mc_area_unit") as AreaDisplayUnit) || null;
      return v && v in AREA_UNIT_LABEL ? v : "ft2";
    },
  );

  const [outputUnit, setOutputUnit] = useState<OutputUnit>(() => {
    if (typeof window === "undefined") return "cy";
    const v = localStorage.getItem("mc_output_unit") as OutputUnit | null;
    return v && v in OUTPUT_UNIT_LABEL ? v : "cy";
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD";
    const v = (localStorage.getItem("mc_currency") as CurrencyCode) || "USD";
    return v && v in CURRENCY_LABEL ? v : "USD";
  });

  // Rectangle / Square
  const [length, setLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_length") ?? ""),
  );
  const [width, setWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_width") ?? ""),
  );

  // Rectangle border
  const [outerLength, setOuterLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_outer_length") ?? ""),
  );
  const [outerWidth, setOuterWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_outer_width") ?? ""),
  );
  const [innerLength, setInnerLength] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_inner_length") ?? ""),
  );
  const [innerWidth, setInnerWidth] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_inner_width") ?? ""),
  );

  // Circle / Ring
  const [radius, setRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_radius") ?? ""),
  );
  const [outerRadius, setOuterRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_outer_radius") ?? ""),
  );
  const [innerRadius, setInnerRadius] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_inner_radius") ?? ""),
  );

  // Triangle
  const [base, setBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_base") ?? ""),
  );
  const [height, setHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_height") ?? ""),
  );

  // Triangle border
  const [outerBase, setOuterBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_outer_base") ?? ""),
  );
  const [outerHeight, setOuterHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_outer_height") ?? ""),
  );
  const [innerBase, setInnerBase] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_inner_base") ?? ""),
  );
  const [innerHeight, setInnerHeight] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_inner_height") ?? ""),
  );

  // Depth + waste
  const [depth, setDepth] = useState<string>(() =>
    typeof window === "undefined"
      ? "3"
      : (localStorage.getItem("mc_depth") ?? "3"),
  );
  const [wastePct, setWastePct] = useState<string>(() =>
    typeof window === "undefined"
      ? "0"
      : (localStorage.getItem("mc_waste_pct") ?? "0"),
  );

  // Optional bag/pricing
  const [bagPreset, setBagPreset] = useState<BagPreset>(() => {
    if (typeof window === "undefined") return "2";
    const v = (localStorage.getItem("mc_bag_preset") as BagPreset) || "2";
    return BAG_PRESETS.some((b) => b.key === v) ? v : "2";
  });

  const [bagSizeCustom, setBagSizeCustom] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_bag_custom") ?? ""),
  );

  const [pricingMode, setPricingMode] = useState<PricingMode>(() => {
    if (typeof window === "undefined") return "none";
    const v =
      (localStorage.getItem("mc_pricing_mode") as PricingMode) || "none";
    return v === "none" || v === "per_bag" || v === "per_cy" || v === "per_m3"
      ? v
      : "none";
  });

  const [price, setPrice] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : (localStorage.getItem("mc_price") ?? ""),
  );

  // Display controls
  const [roundForDisplay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return safeJsonParseBoolean(localStorage.getItem("mc_rounding"), true);
  });

  const [displayDecimals] = useState<0 | 2 | 4 | 6>(() => {
    if (typeof window === "undefined") return 2;
    return safeParseDisplayDecimals(
      localStorage.getItem("mc_display_decimals"),
      2,
    );
  });

  // Debounced localStorage writes to reduce churn on each keystroke
  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem("mc_shape", shape);
        localStorage.setItem("mc_dim_unit", dimUnit);
        localStorage.setItem("mc_depth_unit", depthUnit);
        localStorage.setItem("mc_area_unit", areaDisplayUnit);
        localStorage.setItem("mc_output_unit", outputUnit);
        localStorage.setItem("mc_currency", currency);

        localStorage.setItem("mc_length", length);
        localStorage.setItem("mc_width", width);

        localStorage.setItem("mc_outer_length", outerLength);
        localStorage.setItem("mc_outer_width", outerWidth);
        localStorage.setItem("mc_inner_length", innerLength);
        localStorage.setItem("mc_inner_width", innerWidth);

        localStorage.setItem("mc_radius", radius);
        localStorage.setItem("mc_outer_radius", outerRadius);
        localStorage.setItem("mc_inner_radius", innerRadius);

        localStorage.setItem("mc_base", base);
        localStorage.setItem("mc_height", height);

        localStorage.setItem("mc_outer_base", outerBase);
        localStorage.setItem("mc_outer_height", outerHeight);
        localStorage.setItem("mc_inner_base", innerBase);
        localStorage.setItem("mc_inner_height", innerHeight);

        localStorage.setItem("mc_depth", depth);
        localStorage.setItem("mc_waste_pct", wastePct);

        localStorage.setItem("mc_bag_preset", bagPreset);
        localStorage.setItem("mc_bag_custom", bagSizeCustom);

        localStorage.setItem("mc_pricing_mode", pricingMode);
        localStorage.setItem("mc_price", price);

        localStorage.setItem("mc_rounding", JSON.stringify(roundForDisplay));
        localStorage.setItem("mc_display_decimals", String(displayDecimals));
      } catch {
        // ignore write failures (private mode, quota, etc.)
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
    bagPreset,
    bagSizeCustom,
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

    const bagCustomParsed =
      bagPreset === "custom"
        ? parseNonNegativeToScaled(bagSizeCustom, {
            emptyError: "Enter a custom bag size.",
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
      bagCustomParsed,
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
    bagPreset,
    bagSizeCustom,
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

    if (bagPreset === "custom") {
      const b = mustPos(parsed.bagCustomParsed, "custom bag size");
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
  }, [parsed, shape, bagPreset, pricingMode, price]);

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
        bagSizeCuftScaled: null as bigint | null,
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

    const wasteScaled = parsed.pWaste.scaled ?? 0n; // percent (scaled)
    const wasteFracScaled = divScaled(wasteScaled, 100n * SCALE); // fraction (scaled)
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
      BAG_PRESETS.find((b) => b.key === bagPreset) ?? BAG_PRESETS[0];
    const bagSizeCuftScaled =
      bagPreset === "custom"
        ? (parsed.bagCustomParsed.scaled ?? 0n)
        : (preset.cuftScaled ?? 0n);

    const bagsExactScaled =
      bagSizeCuftScaled > 0n
        ? divScaled(volumeCuftWithWasteScaled, bagSizeCuftScaled)
        : 0n;

    const bagsRoundedUp =
      bagSizeCuftScaled > 0n
        ? ceilDivBigInt(volumeCuftWithWasteScaled, bagSizeCuftScaled)
        : 0n;

    let costScaled: bigint | null = null;
    const priceScaled = price.trim() ? (parsed.pPrice.scaled ?? 0n) : 0n;

    if (pricingMode === "per_bag" && price.trim()) {
      costScaled = mulScaled(priceScaled, bagsRoundedUp * SCALE);
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
      bagSizeCuftScaled,
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
    bagPreset,
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
      return {
        cy: "—",
        cuft: "—",
        m3: "—",
        l: "—",
      };
    }

    const cy =
      computed.volumeCyScaled !== null
        ? `${toPrettyNumber(computed.volumeCyScaled, roundForDisplay, displayDecimals)} yd³`
        : "—";

    const cuft =
      computed.volumeCuftWithWasteScaled !== null
        ? `${toPrettyNumber(
            computed.volumeCuftWithWasteScaled,
            roundForDisplay,
            displayDecimals,
          )} ft³`
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "coveragecalculators.com",
    url: "https://www.coveragecalculators.com",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Mulch Coverage Calculator",
    description:
      "Calculate how many bags or cubic yards of mulch are needed from shape dimensions and target depth.",
    url: "https://www.coveragecalculators.com/mulch-coverage-calculator",
  };

  const resultRegionId = "mulch-results-region";

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
              Mulch Coverage Calculator
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
            Enter shape dimensions and a target depth to estimate mulch volume
            and optional bag counts.
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
                      Mulch layer depth ({depthUnit})
                    </span>
                    <input
                      inputMode="decimal"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder={depthUnit === "in" ? "e.g. 3" : "e.g. 0.08"}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
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
            aria-label="Mulch results"
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
                    ? `${toPrettyNumber(
                        computed.areaDisplayScaled,
                        roundForDisplay,
                        displayDecimals,
                      )} ${
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
                    ? `${toPrettyNumber(
                        computed.areaSqftScaled,
                        roundForDisplay,
                        displayDecimals,
                      )} ft²`
                    : "—"}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {validation.ok && computed.areaSqmScaled !== null
                    ? `${toPrettyNumber(
                        computed.areaSqmScaled,
                        roundForDisplay,
                        displayDecimals,
                      )} m²`
                    : "—"}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    |
                  </span>
                  {validation.ok && computed.areaAcresScaled !== null
                    ? `${toPrettyNumber(
                        computed.areaAcresScaled,
                        roundForDisplay,
                        displayDecimals,
                      )} ac`
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <details className="group">
                <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">
                      Bags + cost estimate (optional)
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Expand to set bag size and unit pricing
                    </span>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                    <div className="text-sm font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                      {validation.ok && computed.bagsRoundedUp !== null
                        ? `${computed.bagsRoundedUp.toString()} bags`
                        : "—"}
                    </div>
                    <span className="text-slate-400 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Bag size
                    </span>
                    <select
                      value={bagPreset}
                      onChange={(e) =>
                        setBagPreset(e.target.value as BagPreset)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {BAG_PRESETS.map((b) => (
                        <option key={b.key} value={b.key}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    className={`block ${
                      bagPreset === "custom"
                        ? ""
                        : "opacity-60 pointer-events-none"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom bag size (ft³)
                    </span>
                    <input
                      inputMode="decimal"
                      value={bagSizeCustom}
                      onChange={(e) => setBagSizeCustom(e.target.value)}
                      placeholder="e.g. 2.0"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    />
                  </label>

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
                          : "—"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-emerald-50 px-4 py-3">
                      <div className="text-xs font-medium text-slate-600">
                        Buy count (rounded up)
                      </div>
                      <div className="mt-1 text-lg font-bold text-emerald-700 tabular-nums">
                        {validation.ok && computed.bagsRoundedUp !== null
                          ? computed.bagsRoundedUp.toString()
                          : "—"}
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
                        <option value="per_bag">Price per bag</option>
                        <option value="per_cy">Price per cubic yard</option>
                        <option value="per_m3">Price per cubic meter</option>
                      </select>
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
                          ? "Uses rounded-up bag count."
                          : pricingMode === "per_cy"
                            ? "Uses total volume in yd³."
                            : pricingMode === "per_m3"
                              ? "Uses total volume in m³."
                              : "Set a pricing basis to estimate cost."}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-1">
                      <div className="text-xs font-medium text-slate-600">
                        Quick totals
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                        {quickTotals.cy}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                        {quickTotals.m3}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                        {quickTotals.l}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="flex flex-wrap items-center gap-3 ">
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
