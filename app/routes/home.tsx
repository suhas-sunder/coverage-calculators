import { useMemo, useEffect, useState } from "react";
import type { Route } from "./+types/home";
import HowItWorks from "~/client/components/home/HowItWorks";
import FAQ from "~/client/components/home/FAQ";
import ToolFit from "~/client/components/home/ToolFit";
import Rounding from "~/client/components/home/Rounding";

export const meta: Route.MetaFunction = () => [
  {
    title:
      "How Much Do I Need? Coverage Calculator for Paint, Mulch, Gravel, Soil + Area Converter",
  },
  {
    name: "description",
    content:
      "Need to know how much paint, mulch, soil, gravel, or concrete to buy? Convert area (ft², m², yd², acres) and estimate quantity using a coverage rate, coats, and waste.",
  },
  {
    name: "keywords",
    content:
      "coverage calculator, how much paint do I need, paint coverage calculator, mulch calculator, gravel calculator, soil calculator, concrete calculator, area converter, square feet to square meters, square meters to square feet, acres to square feet, hectares to square meters, coats calculator, waste percentage",
  },
  { name: "robots", content: "index,follow" },
  { name: "author", content: "coveragecalculators.com" },
  { name: "theme-color", content: "#f8fafc" },

  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content:
      "How Much Do I Need? Coverage Calculator (Paint, Mulch, Gravel, Soil) + Area Converter",
  },
  {
    property: "og:description",
    content:
      "Convert area units and estimate how much material to buy using a coverage rate. Includes coats and waste for planning paint and bulk projects.",
  },
  { property: "og:url", content: "https://www.coveragecalculators.com" },
  { property: "og:site_name", content: "coveragecalculators.com" },
  {
    property: "og:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "How Much Do I Need? Coverage Calculator + Area Converter",
  },
  {
    name: "twitter:description",
    content:
      "Estimate paint, mulch, soil, gravel, or concrete from a coverage rate. Converts ft², m², yd², acres, and more. Includes coats and waste.",
  },
  {
    name: "twitter:image",
    content: "https://www.coveragecalculators.com/og-image.jpg",
  },

  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com",
  },
];

type Period = "sqft" | "sqm" | "sqyd" | "acre" | "hectare" | "sqin" | "sqcm";

const PERIOD_LABEL: Record<Period, string> = {
  sqft: "Square feet (ft²)",
  sqm: "Square meters (m²)",
  sqyd: "Square yards (yd²)",
  acre: "Acres",
  hectare: "Hectares",
  sqin: "Square inches (in²)",
  sqcm: "Square centimeters (cm²)",
};

const PERIOD_SHORT: Record<Period, string> = {
  sqft: "ft²",
  sqm: "m²",
  sqyd: "yd²",
  acre: "acres",
  hectare: "ha",
  sqin: "in²",
  sqcm: "cm²",
};

const PERIOD_ORDER: Period[] = [
  "sqin",
  "sqcm",
  "sqft",
  "sqyd",
  "sqm",
  "acre",
  "hectare",
];

const CURRENCY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "UNIT", label: "Units" },
  { code: "GAL", label: "Gallons" },
  { code: "L", label: "Liters" },
  { code: "BAG", label: "Bags" },
  { code: "CY", label: "Cubic yards" },
  { code: "M3", label: "Cubic meters" },
];

function safeJsonParseBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "boolean" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safePeriod(value: string | null, fallback: Period): Period {
  if (!value) return fallback;
  const v = value as Period;
  return PERIOD_ORDER.includes(v) ? v : fallback;
}

function safeCurrency(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const v = value.toUpperCase();
  return CURRENCY_OPTIONS.some((c) => c.code === v) ? v : fallback;
}

function safeDisplayDecimals(value: string | null, fallback: 0 | 2 | 4 | 6) {
  if (value === null) return fallback;
  const n = Number(value);
  if (n === 0 || n === 2 || n === 4 || n === 6) return n as 0 | 2 | 4 | 6;
  return fallback;
}

const SCALE = 1_000_000n;

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

type Rational = { n: bigint; d: bigint };

function normRational(r: Rational): Rational {
  if (r.d === 0n) return { n: 0n, d: 1n };
  let n = r.n;
  let d = r.d;
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdBigInt(n, d);
  return { n: n / g, d: d / g };
}

function addR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

function subR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}

function mulR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.n, d: a.d * b.d });
}

function divR(a: Rational, b: Rational): Rational {
  if (b.n === 0n) return { n: 0n, d: 1n };
  return normRational({ n: a.n * b.d, d: a.d * b.n });
}

function cmpR(a: Rational, b: Rational): number {
  const aa = normRational(a);
  const bb = normRational(b);
  const left = aa.n * bb.d;
  const right = bb.n * aa.d;
  if (left === right) return 0;
  return left > right ? 1 : -1;
}

function maxR(a: Rational, b: Rational): Rational {
  return cmpR(a, b) >= 0 ? a : b;
}

function fromScaledUnits(scaled: bigint): Rational {
  return { n: scaled, d: SCALE };
}

function toScaledUnits(r: Rational): bigint {
  const rr = normRational(r);
  return (rr.n * SCALE) / rr.d;
}

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

type ParseScaledResult = {
  ok: boolean;
  scaled?: bigint;
  normalized?: string;
  error?: string;
};

function parseNonNegativeToScaled(
  input: string,
  cfg: {
    emptyError: string;
    negativeError?: string;
    maxScaled?: bigint;
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
          "That number format is ambiguous. Use only one decimal separator (like 1250.50).",
      };
    }
  } else if (lastComma !== -1 && lastDot === -1) {
    const commaCount = (s.match(/,/g) ?? []).length;
    if (commaCount !== 1) {
      return {
        ok: false,
        error:
          "That comma format is ambiguous. Use a dot for decimals (example: 1250.50).",
      };
    }
    const parts = s.split(",");
    const right = parts[1] ?? "";
    if (right.length !== 2) {
      return {
        ok: false,
        error:
          "That comma-decimal format is ambiguous. Use 2 digits after the comma (example: 1250,50) or use a dot (1250.50).",
      };
    }
    s = `${parts[0]}.${right}`;
  } else {
    if ((s.match(/\./g) ?? []).length > 1) {
      return {
        ok: false,
        error: "That number format looks unclear. Try 1250.50 or 1,250.50.",
      };
    }
    s = s.replace(/,/g, "");
  }

  if (s.startsWith(".")) s = `0${s}`;
  if (s.endsWith(".")) s = `${s}0`;

  if (!/^\d+(\.\d+)?$/u.test(s)) {
    return {
      ok: false,
      error:
        "That number format looks unclear. Try 1250.50 or 1,250.50 (and avoid mixed separators).",
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
        "That value is very large and may be impractical to display. Try a smaller number or switch units (for example, acres or hectares).",
    };
  }

  return { ok: true, scaled, normalized: s };
}

function parseAreaToScaled(input: string): ParseScaledResult {
  return parseNonNegativeToScaled(input, {
    emptyError: "Enter an area value.",
  });
}

function parseRateToScaled(input: string): ParseScaledResult {
  return parseNonNegativeToScaled(input, {
    emptyError: "Enter a coverage rate.",
    negativeError: "Coverage rate cannot be negative.",
  });
}

function parsePercentToScaled(input: string, label: string): ParseScaledResult {
  return parseNonNegativeToScaled(input, {
    emptyError: `${label} must be a valid number.`,
    negativeError: `${label} cannot be negative.`,
    maxScaled: 10_000n * SCALE,
  });
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

function formatGroupedNumberFromDecimalString(
  decimalStr: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  return formatGroupedDecimalString(decimalStr, opts);
}

function formatMoneyFromDecimalString(
  decimalStr: string,
  _currency: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  return formatGroupedDecimalString(decimalStr, opts);
}

function formatScaledForDisplay(
  scaled: bigint,
  opts: {
    roundForDisplay: boolean;
    displayDecimals: 0 | 2 | 4 | 6;
    minFD: number;
    maxFD: number;
    allowLessThan: boolean;
    currencyForFormatter: string;
  },
) {
  const {
    roundForDisplay,
    displayDecimals,
    minFD,
    maxFD,
    allowLessThan,
    currencyForFormatter,
  } = opts;

  if (!roundForDisplay) {
    const dec = scaledToDecimalString(scaled, 6, { trimTrailingZeros: true });
    return formatMoneyFromDecimalString(dec, currencyForFormatter, {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.max(0, Math.min(12, maxFD)),
    });
  }

  const roundedScaled = roundScaledToDigits(scaled, displayDecimals);

  if (allowLessThan && roundedScaled === 0n && scaled !== 0n) {
    const step = 10n ** BigInt(6 - displayDecimals);
    const decStep = scaledToDecimalString(step, 6, {
      fixed: displayDecimals > 0,
    });
    const prettyStep = formatMoneyFromDecimalString(
      decStep,
      currencyForFormatter,
      {
        minimumFractionDigits: displayDecimals,
        maximumFractionDigits: displayDecimals,
      },
    );
    return `< ${prettyStep}`;
  }

  const dec = scaledToDecimalString(roundedScaled, 6, {
    fixed: displayDecimals > 0,
    trimTrailingZeros: false,
  });

  return formatMoneyFromDecimalString(dec, currencyForFormatter, {
    minimumFractionDigits: Math.max(0, Math.min(12, minFD)),
    maximumFractionDigits: Math.max(0, Math.min(12, maxFD)),
  });
}

const AREA_FACTOR_TO_SQM: Record<Period, Rational> = {
  sqin: { n: 64516n, d: 100000000n },
  sqcm: { n: 1n, d: 10000n },
  sqft: { n: 9290304n, d: 100000000n },
  sqyd: { n: 83612736n, d: 100000000n },
  sqm: { n: 1n, d: 1n },
  acre: { n: 40468564224n, d: 10000000n },
  hectare: { n: 10000n, d: 1n },
};

function convertRational(amount: Rational, from: Period, to: Period): Rational {
  if (from === to) return amount;
  const fromFactor = AREA_FACTOR_TO_SQM[from];
  const toFactor = AREA_FACTOR_TO_SQM[to];
  const inSqm = mulR(amount, fromFactor);
  return divR(inSqm, toFactor);
}

function safeEnvIsDev(): boolean {
  try {
    const v = (import.meta as any)?.env?.DEV;
    return Boolean(v);
  } catch {
    return false;
  }
}

type SurfaceRow = {
  id: string;
  area: string;
  unit: Period;
  count: string;
};

type OpeningRow = {
  id: string;
  area: string;
  unit: Period;
  count: string;
};

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeCountInput(raw: string): string {
  const v = raw.trim();
  if (v === "") return "";
  if (!/^\d+$/u.test(v)) return v.replace(/[^\d]/g, "");
  return v;
}

function normalizeCountForCalc(raw: string): bigint | null {
  const v = raw.trim();
  const use = v.length ? v : "1";
  if (!/^\d+$/u.test(use)) return null;
  try {
    const bi = BigInt(use);
    if (bi < 1n) return null;
    return bi;
  } catch {
    return null;
  }
}

export default function Home() {
  const [surfaces, setSurfaces] = useState<SurfaceRow[]>(() => {
    if (typeof window === "undefined") {
      return [{ id: "s1", area: "", unit: "sqft", count: "1" }];
    }
    const saved = safeParseJson<SurfaceRow[]>(
      localStorage.getItem("cc_surfaces"),
      [],
    );
    if (Array.isArray(saved) && saved.length > 0) {
      const cleaned = saved
        .filter(
          (r) =>
            r &&
            typeof r.id === "string" &&
            typeof r.area === "string" &&
            typeof r.unit === "string" &&
            typeof r.count === "string" &&
            PERIOD_ORDER.includes(r.unit as Period),
        )
        .map((r) => ({
          ...r,
          unit: r.unit as Period,
        }));
      return cleaned.length > 0
        ? cleaned
        : [{ id: uid(), area: "", unit: "sqft", count: "1" }];
    }
    return [{ id: uid(), area: "", unit: "sqft", count: "1" }];
  });

  const [includeOpenings, setIncludeOpenings] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return safeJsonParseBoolean(
      localStorage.getItem("cc_include_openings"),
      false,
    );
  });

  const [openings, setOpenings] = useState<OpeningRow[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = safeParseJson<OpeningRow[]>(
      localStorage.getItem("cc_openings"),
      [],
    );
    if (Array.isArray(saved) && saved.length > 0) {
      return saved
        .filter(
          (r) =>
            r &&
            typeof r.id === "string" &&
            typeof r.area === "string" &&
            typeof r.unit === "string" &&
            typeof r.count === "string" &&
            PERIOD_ORDER.includes(r.unit as Period),
        )
        .map((r) => ({
          ...r,
          unit: r.unit as Period,
        }));
    }
    return [];
  });

  const [overlapPct, setOverlapPct] = useState<string>(() => {
    if (typeof window === "undefined") return "0";
    return localStorage.getItem("cc_overlap_pct") ?? "0";
  });

  const [irregularPct, setIrregularPct] = useState<string>(() => {
    if (typeof window === "undefined") return "0";
    return localStorage.getItem("cc_irregular_pct") ?? "0";
  });

  const [coverageWastePct, setCoverageWastePct] = useState<string>(() => {
    if (typeof window === "undefined") return "10";
    return localStorage.getItem("cc_cov_waste_pct") ?? "10";
  });

  const [amount, setAmount] = useState<string>(() => {
    if (typeof window === "undefined") return "1000";
    return localStorage.getItem("cc_area") ?? "1000";
  });

  const [amountFocused, setAmountFocused] = useState<boolean>(false);

  const [from, setFrom] = useState<Period>(() => {
    if (typeof window === "undefined") return "sqft";
    return safePeriod(localStorage.getItem("cc_from"), "sqft");
  });

  const [to, setTo] = useState<Period>(() => {
    if (typeof window === "undefined") return "sqm";
    return safePeriod(localStorage.getItem("cc_to"), "sqm");
  });

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window === "undefined") return "UNIT";
    return safeCurrency(localStorage.getItem("cc_unit"), "UNIT");
  });

  const [coverageRate, setCoverageRate] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("cc_rate") ?? "";
  });

  const [coverageUnit, setCoverageUnit] = useState<Period>(() => {
    if (typeof window === "undefined") return "sqft";
    return safePeriod(localStorage.getItem("cc_rate_unit"), "sqft");
  });

  const [coats, setCoats] = useState<string>(() => {
    if (typeof window === "undefined") return "1";
    return localStorage.getItem("cc_coats") ?? "1";
  });

  const [materialWastePct, setMaterialWastePct] = useState<string>(() => {
    if (typeof window === "undefined") return "10";
    return localStorage.getItem("cc_waste") ?? "10";
  });

  const [roundForDisplay, setRoundForDisplay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return safeJsonParseBoolean(localStorage.getItem("cc_rounding"), true);
  });

  const [displayDecimals, setDisplayDecimals] = useState<0 | 2 | 4 | 6>(() => {
    if (typeof window === "undefined") return 2;
    return safeDisplayDecimals(localStorage.getItem("cc_display_decimals"), 2);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("cc_surfaces", JSON.stringify(surfaces));
    localStorage.setItem(
      "cc_include_openings",
      JSON.stringify(includeOpenings),
    );
    localStorage.setItem("cc_openings", JSON.stringify(openings));
    localStorage.setItem("cc_overlap_pct", overlapPct);
    localStorage.setItem("cc_irregular_pct", irregularPct);
    localStorage.setItem("cc_cov_waste_pct", coverageWastePct);

    localStorage.setItem("cc_area", amount);
    localStorage.setItem("cc_from", from);
    localStorage.setItem("cc_to", to);
    localStorage.setItem("cc_unit", currency);
    localStorage.setItem("cc_rate", coverageRate);
    localStorage.setItem("cc_rate_unit", coverageUnit);
    localStorage.setItem("cc_coats", coats);
    localStorage.setItem("cc_waste", materialWastePct);

    localStorage.setItem("cc_rounding", JSON.stringify(roundForDisplay));
    localStorage.setItem("cc_display_decimals", String(displayDecimals));
  }, [
    surfaces,
    includeOpenings,
    openings,
    overlapPct,
    irregularPct,
    coverageWastePct,
    amount,
    from,
    to,
    currency,
    coverageRate,
    coverageUnit,
    coats,
    materialWastePct,
    roundForDisplay,
    displayDecimals,
  ]);

  const parsed = useMemo(() => parseAreaToScaled(amount), [amount]);

  const hasCoverageRate = useMemo(
    () => coverageRate.trim().length > 0,
    [coverageRate],
  );

  const rateParsed = useMemo(
    () => parseRateToScaled(coverageRate),
    [coverageRate],
  );

  const coatsParsed = useMemo(() => {
    const raw = coats.trim();
    if (!raw) return { ok: false, value: 0 };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, value: 0 };
    if (!Number.isInteger(n) || n < 1) return { ok: false, value: 0 };
    return { ok: true, value: n };
  }, [coats]);

  const materialWasteParsed = useMemo(
    () => parsePercentToScaled(materialWastePct, "Waste %"),
    [materialWastePct],
  );

  const coverageOverlapParsed = useMemo(
    () => parsePercentToScaled(overlapPct, "Overlap %"),
    [overlapPct],
  );
  const coverageIrregularParsed = useMemo(
    () => parsePercentToScaled(irregularPct, "Surface factor %"),
    [irregularPct],
  );
  const coverageWasteParsed = useMemo(
    () => parsePercentToScaled(coverageWastePct, "Waste %"),
    [coverageWastePct],
  );

  const materialWasteWarning = useMemo(() => {
    if (!hasCoverageRate) return null;
    if (!materialWasteParsed.ok || materialWasteParsed.scaled === undefined)
      return null;

    const w = materialWasteParsed.scaled;
    const warn50 = 50n * SCALE;
    const warn200 = 200n * SCALE;

    if (w > warn200) {
      return {
        tone: "strong" as const,
        text: "Very high waste percentage. This will massively inflate the estimate.",
      };
    }
    if (w > warn50) {
      return {
        tone: "soft" as const,
        text: "High waste percentage. Typical planning ranges are often around 5% to 15%.",
      };
    }
    return null;
  }, [hasCoverageRate, materialWasteParsed.ok, materialWasteParsed.scaled]);

  const builderInUse = useMemo(() => {
    return surfaces.some((r) => r.area.trim().length > 0);
  }, [surfaces]);

  const builderRowsValidation = useMemo(() => {
    const anySurface = surfaces.some((r) => r.area.trim().length > 0);
    if (!anySurface) {
      return {
        ok: true,
        message: "",
      };
    }

    for (const s of surfaces) {
      const areaHas = s.area.trim().length > 0;
      if (!areaHas) continue;

      const p = parseAreaToScaled(s.area);
      if (!p.ok || p.scaled === undefined) {
        return {
          ok: false,
          message: "One or more surface rows has an invalid area.",
        };
      }
      if (p.scaled === 0n) {
        return { ok: false, message: "Surface areas must be greater than 0." };
      }

      const count = normalizeCountForCalc(s.count);
      if (!count) {
        return {
          ok: false,
          message: "Surface counts must be whole numbers (1 or more).",
        };
      }
    }

    if (includeOpenings) {
      for (const o of openings) {
        const areaHas = o.area.trim().length > 0;
        if (!areaHas) continue;

        const p = parseAreaToScaled(o.area);
        if (!p.ok || p.scaled === undefined) {
          return {
            ok: false,
            message: "One or more opening rows has an invalid area.",
          };
        }

        const count = normalizeCountForCalc(o.count);
        if (!count) {
          return {
            ok: false,
            message: "Opening counts must be whole numbers (1 or more).",
          };
        }
      }
    }

    const pctInputs: Array<[string, { ok: boolean; scaled?: bigint }]> = [
      ["Overlap %", coverageOverlapParsed],
      ["Surface factor %", coverageIrregularParsed],
      ["Waste %", coverageWasteParsed],
    ];

    for (const [label, parsedPct] of pctInputs) {
      if (!parsedPct.ok || parsedPct.scaled === undefined) {
        return { ok: false, message: `${label} must be a valid number.` };
      }
    }

    return { ok: true, message: "" };
  }, [
    surfaces,
    includeOpenings,
    openings,
    coverageOverlapParsed.ok,
    coverageOverlapParsed.scaled,
    coverageIrregularParsed.ok,
    coverageIrregularParsed.scaled,
    coverageWasteParsed.ok,
    coverageWasteParsed.scaled,
  ]);

  const builderComputed = useMemo(() => {
    const zero: Rational = { n: 0n, d: 1n };

    if (!builderInUse || !builderRowsValidation.ok) {
      return {
        grossSqm: null as Rational | null,
        openingsSqm: null as Rational | null,
        netSqm: null as Rational | null,
        finalSqm: null as Rational | null,
      };
    }

    let grossSqm: Rational = zero;

    for (const s of surfaces) {
      if (!s.area.trim()) continue;

      const p = parseAreaToScaled(s.area);
      if (!p.ok || p.scaled === undefined || p.scaled === 0n) continue;

      const count = normalizeCountForCalc(s.count) ?? 1n;

      const areaR = fromScaledUnits(p.scaled);
      const inSqm = convertRational(areaR, s.unit, "sqm");
      grossSqm = addR(grossSqm, mulR(inSqm, { n: count, d: 1n }));
    }

    let openingsSqm: Rational = zero;

    if (includeOpenings) {
      for (const o of openings) {
        if (!o.area.trim()) continue;

        const p = parseAreaToScaled(o.area);
        if (!p.ok || p.scaled === undefined || p.scaled === 0n) continue;

        const count = normalizeCountForCalc(o.count) ?? 1n;

        const areaR = fromScaledUnits(p.scaled);
        const inSqm = convertRational(areaR, o.unit, "sqm");
        openingsSqm = addR(openingsSqm, mulR(inSqm, { n: count, d: 1n }));
      }
    }

    const netSqm = maxR(zero, subR(grossSqm, openingsSqm));

    const overlap =
      coverageOverlapParsed.ok && coverageOverlapParsed.scaled !== undefined
        ? coverageOverlapParsed.scaled
        : 0n;
    const irregular =
      coverageIrregularParsed.ok && coverageIrregularParsed.scaled !== undefined
        ? coverageIrregularParsed.scaled
        : 0n;
    const waste =
      coverageWasteParsed.ok && coverageWasteParsed.scaled !== undefined
        ? coverageWasteParsed.scaled
        : 0n;

    const pctSumScaled = overlap + irregular + waste;
    const pctSumR = fromScaledUnits(pctSumScaled);
    const addFrac = divR(pctSumR, { n: 100n, d: 1n });
    const factor = addR({ n: 1n, d: 1n }, addFrac);

    const finalSqm = mulR(netSqm, factor);

    return {
      grossSqm,
      openingsSqm,
      netSqm,
      finalSqm,
    };
  }, [
    builderInUse,
    builderRowsValidation.ok,
    surfaces,
    includeOpenings,
    openings,
    coverageOverlapParsed.ok,
    coverageOverlapParsed.scaled,
    coverageIrregularParsed.ok,
    coverageIrregularParsed.scaled,
    coverageWasteParsed.ok,
    coverageWasteParsed.scaled,
  ]);

  const manualValidation = useMemo(() => {
    if (!amount.trim())
      return { ok: false, message: "Enter an area value." as string };
    if (!parsed.ok)
      return {
        ok: false,
        message: parsed.error ?? "Enter a valid area value.",
      };
    if (parsed.scaled === 0n) {
      return {
        ok: true,
        message:
          "A value of 0 converts to 0. If that is not what you intend, enter your area above.",
      };
    }
    return { ok: true, message: "" };
  }, [amount, parsed.ok, parsed.error, parsed.scaled]);

  const validation = useMemo(() => {
    return manualValidation;
  }, [manualValidation]);

  const amountR: Rational | null = useMemo(() => {
    if (!manualValidation.ok) return null;
    if (!parsed.ok || parsed.scaled === undefined) return null;
    return fromScaledUnits(parsed.scaled);
  }, [manualValidation.ok, parsed.ok, parsed.scaled]);

  const rawResultR = useMemo(() => {
    if (!amountR) return null;
    return convertRational(amountR, from, to);
  }, [amountR, from, to]);

  const estimatorValidation = useMemo(() => {
    if (!hasCoverageRate) return { ok: true, message: "" };

    if (!rateParsed.ok)
      return {
        ok: false,
        message: rateParsed.error ?? "Enter a valid coverage rate.",
      };

    if (rateParsed.scaled === undefined || rateParsed.scaled === 0n)
      return { ok: false, message: "Coverage rate must be greater than 0." };

    if (!coatsParsed.ok)
      return {
        ok: false,
        message: "Coats must be a whole number (1 or more).",
      };

    if (!materialWasteParsed.ok)
      return {
        ok: false,
        message: materialWasteParsed.error ?? "Enter a valid waste %.",
      };

    return { ok: true, message: "" };
  }, [
    hasCoverageRate,
    rateParsed.ok,
    rateParsed.error,
    rateParsed.scaled,
    coatsParsed.ok,
    materialWasteParsed.ok,
    materialWasteParsed.error,
  ]);

  const estimateR = useMemo(() => {
    if (
      !manualValidation.ok ||
      !amountR ||
      !hasCoverageRate ||
      !estimatorValidation.ok ||
      !rateParsed.ok ||
      rateParsed.scaled === undefined ||
      rateParsed.scaled === 0n
    )
      return null;

    const areaInCoverageUnit = convertRational(amountR, from, coverageUnit);
    const rateR = fromScaledUnits(rateParsed.scaled);

    const baseUnits = divR(areaInCoverageUnit, rateR);
    const withCoats = mulR(baseUnits, { n: BigInt(coatsParsed.value), d: 1n });

    const wasteRatio =
      materialWasteParsed.scaled === undefined
        ? 0n
        : materialWasteParsed.scaled;
    const wasteFrac = divR(fromScaledUnits(wasteRatio), { n: 100n, d: 1n });

    const factor = addR({ n: 1n, d: 1n }, wasteFrac);
    return mulR(withCoats, factor);
  }, [
    manualValidation.ok,
    amountR,
    hasCoverageRate,
    estimatorValidation.ok,
    rateParsed.ok,
    rateParsed.scaled,
    from,
    coverageUnit,
    coatsParsed.value,
    materialWasteParsed.scaled,
  ]);

  const estimateDisplay = useMemo(() => {
    if (!estimateR) return "—";
    const scaled = toScaledUnits(estimateR);

    const num = formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      minFD: roundForDisplay ? displayDecimals : 0,
      maxFD: roundForDisplay ? displayDecimals : 12,
      allowLessThan: true,
      currencyForFormatter: currency,
    });

    const unitLabel =
      CURRENCY_OPTIONS.find((c) => c.code === currency)?.label ?? "Units";

    return `${num} ${unitLabel}`;
  }, [estimateR, roundForDisplay, displayDecimals, currency]);

  const displayMoney = useMemo(() => {
    if (!rawResultR) return "—";
    const scaled = toScaledUnits(rawResultR);

    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      minFD: roundForDisplay ? displayDecimals : 0,
      maxFD: roundForDisplay ? displayDecimals : 12,
      allowLessThan: true,
      currencyForFormatter: currency,
    });
  }, [rawResultR, roundForDisplay, displayDecimals, currency]);

  const inputGroupedDisplay = useMemo(() => {
    if (amountFocused) return amount;
    if (!amount.trim()) return amount;
    if (!parsed.ok || parsed.scaled === undefined) return amount;

    const dec = scaledToDecimalString(parsed.scaled, 6, {
      trimTrailingZeros: true,
    });

    return formatGroupedNumberFromDecimalString(dec, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }, [amountFocused, amount, parsed.ok, parsed.scaled]);

  const interpretationLine = useMemo(() => {
    if (!manualValidation.ok || !parsed.ok || parsed.scaled === undefined)
      return null;

    const raw = amount.trim();
    if (!raw) return null;

    const hasCurrencySymbol = /[$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/u.test(raw);
    const hasWhitespace = /\s/u.test(raw);
    const startsWithDot = raw.startsWith(".");
    const endsWithDot = raw.endsWith(".");
    const hasComma = raw.includes(",");
    const hasDot = raw.includes(".");
    const isSimple = /^\d+(\.\d+)?$/u.test(raw);

    const shouldShow =
      !isSimple &&
      (startsWithDot ||
        endsWithDot ||
        hasCurrencySymbol ||
        hasWhitespace ||
        (hasComma && !hasDot) ||
        (hasComma && hasDot));

    if (!shouldShow) return null;

    const dec = scaledToDecimalString(parsed.scaled, 6, {
      trimTrailingZeros: true,
    });

    const nice = formatMoneyFromDecimalString(dec, currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });

    return `Interpreting that as ${nice}.`;
  }, [manualValidation.ok, parsed.ok, parsed.scaled, amount, currency]);

  const coverageUnitNote = useMemo(() => {
    if (!hasCoverageRate) return null;
    if (!estimatorValidation.ok) return null;
    if (coverageUnit === from) return null;
    return `Note: your area is converted into ${PERIOD_LABEL[coverageUnit]} for the estimate.`;
  }, [hasCoverageRate, estimatorValidation.ok, coverageUnit, from]);

  const breakdown = useMemo(() => {
    if (!amountR) {
      return {
        sqin: null as Rational | null,
        sqcm: null as Rational | null,
        sqft: null as Rational | null,
        sqyd: null as Rational | null,
        sqm: null as Rational | null,
        acre: null as Rational | null,
        hectare: null as Rational | null,
      };
    }

    const sqin = convertRational(amountR, from, "sqin");
    const sqcm = convertRational(amountR, from, "sqcm");
    const sqft = convertRational(amountR, from, "sqft");
    const sqyd = convertRational(amountR, from, "sqyd");
    const sqm = convertRational(amountR, from, "sqm");
    const acre = convertRational(amountR, from, "acre");
    const hectare = convertRational(amountR, from, "hectare");

    return {
      sqin,
      sqcm,
      sqft,
      sqyd,
      sqm,
      acre,
      hectare,
    };
  }, [amountR, from]);

  function formatRationalMoney(r: Rational | null) {
    if (!r) return "—";
    const scaled = toScaledUnits(r);

    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      minFD: roundForDisplay ? displayDecimals : 0,
      maxFD: roundForDisplay ? displayDecimals : 12,
      allowLessThan: true,
      currencyForFormatter: currency,
    });
  }

  const builderSummary = useMemo(() => {
    if (!builderInUse || !builderRowsValidation.ok || !builderComputed.finalSqm)
      return null;

    const grossInFrom = builderComputed.grossSqm
      ? convertRational(builderComputed.grossSqm, "sqm", from)
      : null;

    const openingsInFrom = builderComputed.openingsSqm
      ? convertRational(builderComputed.openingsSqm, "sqm", from)
      : null;

    const netInFrom = builderComputed.netSqm
      ? convertRational(builderComputed.netSqm, "sqm", from)
      : null;

    const finalInFrom = convertRational(builderComputed.finalSqm, "sqm", from);

    return {
      grossInFrom,
      openingsInFrom,
      netInFrom,
      finalInFrom,
    };
  }, [
    builderInUse,
    builderRowsValidation.ok,
    builderComputed.grossSqm,
    builderComputed.openingsSqm,
    builderComputed.netSqm,
    builderComputed.finalSqm,
    from,
  ]);

  useEffect(() => {
    if (!safeEnvIsDev()) return;

    const cases = [
      ".5",
      "12.",
      "1,234.56",
      "$1,234.56",
      "1250,50",
      "0.1",
      "12.345",
      "999999999.999999",
    ];

    for (const c of cases) {
      const p = parseAreaToScaled(c);
      if (!p.ok || p.scaled === undefined) {
        // eslint-disable-next-line no-console
        console.warn("[DEV] Parse failed unexpectedly:", c, p.error);
      }
    }

    const a = parseAreaToScaled("0.1");
    const b = parseAreaToScaled("0.2");
    if (a.ok && b.ok && a.scaled !== undefined && b.scaled !== undefined) {
      const sum = a.scaled + b.scaled;
      const expected = parseAreaToScaled("0.3");
      if (
        expected.ok &&
        expected.scaled !== undefined &&
        sum !== expected.scaled
      ) {
        // eslint-disable-next-line no-console
        console.error("[DEV] Decimal drift detected in scaled math.");
      }
    }
  }, []);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "coveragecalculators.com",
    url: "https://www.coveragecalculators.com",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coverage Calculator: Area + Material Estimate",
    description:
      "Build a coverage area from surfaces, subtract openings, add overlap and waste, convert units, and estimate how many units you need from a coverage rate.",
    url: "https://www.coveragecalculators.com",
  };

  const amountHelpId = "area-value-help";
  const amountStatusId = "area-value-status";
  const resultRegionId = "converted-area-region";
  const decimalsHelpId = "display-decimals-help";

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
        className="mx-auto max-w-6xl px-6 pb-8 sm:mt-6 sm:pb-12"
      >
        <div className="rounded-2xl bg-white sm:shadow-sm sm:border border-slate-200 sm:px-8">
          <div className="flex flex-col pt-2 sm:pt-4 pb-1 sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="mb-1 text-center sm:text-left text-2xl sm:text-3xl md:text-4xl capitalize font-bold text-sky-800 tracking-tight">
              Coverage Calculator
            </h1>

            <div
              id="export-controls-desktop"
              className=" hidden sm:flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
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
            Convert area units and estimate material needs using a coverage rate
            (paint, mulch, soil, gravel, concrete) with coats and waste.
          </p>

          <p id={decimalsHelpId} className="sr-only">
            Controls how many decimals to show when rounding is enabled.
          </p>

          <div className="grid gap-y-3 gap-x-5 lg:grid-cols-12 mt-1">
            <div className="lg:col-span-7">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Coverage Area
              </label>

              <div className="flex flex-col gap-2 lg:flex-row">
                <input
                  inputMode={"decimal"}
                  value={inputGroupedDisplay}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  placeholder="e.g. 500 or 1250.50"
                  className={`w-full text-lg min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 ${""}`}
                  aria-invalid={!validation.ok}
                  aria-describedby={`${amountHelpId} ${amountStatusId}`}
                />

                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value as Period)}
                  className="w-full lg:w-auto rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                  aria-label="Area unit"
                >
                  {PERIOD_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {PERIOD_LABEL[p]}
                    </option>
                  ))}
                </select>
              </div>

              {!validation.ok ? (
                <p
                  id={amountStatusId}
                  className="mt-2 text-sm text-rose-700"
                  role="alert"
                  aria-live="polite"
                >
                  {validation.message}
                </p>
              ) : validation.message ? (
                <p
                  id={amountStatusId}
                  className="mt-2 text-sm text-slate-600"
                  aria-live="polite"
                >
                  {validation.message}
                </p>
              ) : null}

              {interpretationLine ? (
                <p className="mt-2 text-sm text-slate-600" aria-live="polite">
                  <span className="font-semibold tabular-nums">
                    {interpretationLine}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Convert to
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as Period)}
                className="flex w-full rounded-xl border border-slate-300 bg-white p-4 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                aria-label="Convert to"
              >
                {PERIOD_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {PERIOD_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            id={resultRegionId}
            className="mt-3 rounded-2xl border border-slate-200 bg-[#f7fbff] p-5 sm:p-6 shadow-sm relative"
            role="region"
            aria-label="Calculated area"
            aria-live="polite"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-200 rounded-t-2xl" />
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full bg-sky-600"
                aria-hidden="true"
              />
              <div className="text-sm font-semibold text-slate-800">
                <span className="text-base font-semibold text-slate-700">
                  {PERIOD_LABEL[to]}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-3xl sm:text-5xl font-extrabold text-emerald-700 tabular-nums leading-none min-h-[3.25rem] sm:min-h-[4rem]">
                {validation.ok ? <>{displayMoney} </> : "—"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["Square inches (in²)", breakdown.sqin, "sqin"],
                  ["Square centimeters (cm²)", breakdown.sqcm, "sqcm"],
                  ["Square feet (ft²)", breakdown.sqft, "sqft"],
                  ["Square yards (yd²)", breakdown.sqyd, "sqyd"],
                  ["Square meters (m²)", breakdown.sqm, "sqm"],
                  ["Acres", breakdown.acre, "acre"],
                  ["Hectares", breakdown.hectare, "hectare"],
                ] as const
              )
                .filter(([, , key]) => key !== to)
                .map(([label, val, key]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="text-xs font-medium text-slate-600">
                      {label}
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                      {validation.ok ? formatRationalMoney(val) : "—"}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-6">
              <div
                id="export-controls-mobile"
                className=" sm:hidden flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
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
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <details className="group">
              <summary className="cursor-pointer flex-col list-none font-semibold text-sky-800 flex justify-center hover:text-sky-900">
                <div className="flex justify-between items-center">
                  <span>Coverage area builder (optional)</span>
                  <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </div>
                <p className="font-normal">
                  Use builder to calculate coverage area from surfaces,
                  openings, and allowances.
                </p>
              </summary>

              <div className="mt-3">
                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Coverage Units
                      </span>
                      <select
                        value={from}
                        onChange={(e) => setFrom(e.target.value as Period)}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                        aria-label="Coverage builder unit"
                      >
                        {PERIOD_ORDER.map((p) => (
                          <option key={p} value={p}>
                            {PERIOD_LABEL[p]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-2 space-y-2">
                    {surfaces.map((row, idx) => (
                      <div
                        key={row.id}
                        className="grid gap-2 sm:grid-cols-12 items-start"
                      >
                        <div className="sm:col-span-10">
                          <label className="block">
                            <span className="block text-xs font-semibold text-slate-700 mb-1">
                              Surface area ({PERIOD_SHORT[from]})
                            </span>
                            <input
                              inputMode="decimal"
                              value={row.area}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSurfaces((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, area: v, unit: from }
                                      : r,
                                  ),
                                );
                              }}
                              placeholder={idx === 0 ? "e.g. 500" : "e.g. 120"}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                            />
                          </label>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block">
                            <span className="block text-xs font-semibold text-slate-700 mb-1">
                              Count
                            </span>
                            <div className="flex gap-2">
                              <input
                                inputMode="numeric"
                                value={row.count}
                                onChange={(e) => {
                                  const v = safeCountInput(e.target.value);
                                  setSurfaces((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, count: v, unit: from }
                                        : r,
                                    ),
                                  );
                                }}
                                placeholder="1"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                aria-label="Surface count"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSurfaces((prev) => {
                                    const next = prev.filter(
                                      (r) => r.id !== row.id,
                                    );
                                    return next.length > 0
                                      ? next.map((r) => ({ ...r, unit: from }))
                                      : [
                                          {
                                            id: uid(),
                                            area: "",
                                            unit: from,
                                            count: "1",
                                          },
                                        ];
                                  });
                                }}
                                className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                                aria-label="Remove surface row"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSurfaces((prev) => [
                          ...prev,
                          { id: uid(), area: "", unit: from, count: "1" },
                        ]);
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                    >
                      Add surface
                    </button>
                  </div>

                  <div className="mt-5">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={includeOpenings}
                        onChange={(e) => setIncludeOpenings(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 cursor-pointer"
                      />
                      Subtract openings or gaps (doors, windows, cutouts)
                    </label>

                    <div
                      className={`mt-3 ${
                        includeOpenings ? "" : "opacity-60 pointer-events-none"
                      }`}
                    >
                      {openings.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          Add opening rows if you want to subtract areas you
                          will not cover.
                        </p>
                      ) : null}

                      <div className="mt-2 space-y-2">
                        {openings.map((row) => (
                          <div
                            key={row.id}
                            className="grid gap-2 sm:grid-cols-12 items-start"
                          >
                            <div className="sm:col-span-10">
                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Opening area ({PERIOD_SHORT[from]})
                                </span>
                                <input
                                  inputMode="decimal"
                                  value={row.area}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setOpenings((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, area: v, unit: from }
                                          : r,
                                      ),
                                    );
                                  }}
                                  placeholder="e.g. 21"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                />
                              </label>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Count
                                </span>
                                <div className="flex gap-2">
                                  <input
                                    inputMode="numeric"
                                    value={row.count}
                                    onChange={(e) => {
                                      const v = safeCountInput(e.target.value);
                                      setOpenings((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, count: v, unit: from }
                                            : r,
                                        ),
                                      );
                                    }}
                                    placeholder="1"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                    aria-label="Opening count"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenings((prev) =>
                                        prev.filter((r) => r.id !== row.id),
                                      );
                                    }}
                                    className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                                    aria-label="Remove opening row"
                                    title="Remove"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenings((prev) => [
                              ...prev,
                              { id: uid(), area: "", unit: from, count: "1" },
                            ]);
                          }}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                        >
                          Add opening
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold text-slate-800">
                      Allowances (add to net area)
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Overlap / seams %
                        </span>
                        <input
                          inputMode="decimal"
                          value={overlapPct}
                          onChange={(e) => setOverlapPct(e.target.value)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Surface factor %
                        </span>
                        <input
                          inputMode="decimal"
                          value={irregularPct}
                          onChange={(e) => setIrregularPct(e.target.value)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Waste %
                        </span>
                        <input
                          inputMode="decimal"
                          value={coverageWastePct}
                          onChange={(e) => setCoverageWastePct(e.target.value)}
                          placeholder="10"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">
                        Builder summary
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Display unit: {PERIOD_LABEL[from]} ({PERIOD_SHORT[from]}
                        )
                      </div>
                    </div>

                    {!builderInUse ? (
                      <p className="mt-2 text-sm text-slate-600">
                        Start entering surface rows to calculate a final
                        coverage area.
                      </p>
                    ) : !builderRowsValidation.ok ? (
                      <p
                        className="mt-2 text-sm text-rose-700"
                        role="alert"
                        aria-live="polite"
                      >
                        {builderRowsValidation.message}
                      </p>
                    ) : builderSummary ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-medium text-slate-600">
                              Gross
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              {PERIOD_SHORT[from]}
                            </div>
                          </div>
                          <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                            {formatRationalMoney(builderSummary.grossInFrom)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-medium text-slate-600">
                              Openings
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              {PERIOD_SHORT[from]}
                            </div>
                          </div>
                          <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                            {formatRationalMoney(builderSummary.openingsInFrom)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-medium text-slate-600">
                              Net
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              {PERIOD_SHORT[from]}
                            </div>
                          </div>
                          <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                            {formatRationalMoney(builderSummary.netInFrom)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-emerald-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-medium text-slate-600">
                              Final coverage
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              {PERIOD_SHORT[from]}
                            </div>
                          </div>
                          <div className="mt-1 text-lg font-bold text-emerald-700 tabular-nums">
                            {formatRationalMoney(builderSummary.finalInFrom)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">
                        Add surface rows to calculate your coverage area.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-emerald-50 px-4 py-4">
            <details className="group">
              <summary className="cursor-pointer list-none flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">
                    Material estimate settings (optional)
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Expand to edit
                  </span>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
                  <div className="text-sm font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                    {hasCoverageRate && estimatorValidation.ok && validation.ok
                      ? estimateDisplay
                      : "—"}
                  </div>

                  <span className="text-slate-400 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </div>
              </summary>

              <div className="mt-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-800">
                    Settings
                  </div>

                  <label className="inline-flex items-center gap-2">
                    <span className="sr-only">Material unit</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                      aria-label="Material unit"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Coverage rate (area per unit)
                    </span>
                    <input
                      inputMode="decimal"
                      value={coverageRate}
                      onChange={(e) => setCoverageRate(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      aria-invalid={!estimatorValidation.ok}
                    />
                    {hasCoverageRate &&
                    rateParsed.ok &&
                    rateParsed.scaled !== undefined &&
                    rateParsed.scaled === 0n ? (
                      <p
                        className="mt-2 text-xs text-rose-700"
                        role="alert"
                        aria-live="polite"
                      >
                        Coverage rate must be greater than 0.
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Coverage area unit
                    </span>
                    <select
                      value={coverageUnit}
                      onChange={(e) =>
                        setCoverageUnit(e.target.value as Period)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    >
                      {PERIOD_ORDER.map((p) => (
                        <option key={p} value={p}>
                          {PERIOD_LABEL[p]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Coats (multiplier)
                    </span>
                    <input
                      inputMode="numeric"
                      value={coats}
                      onChange={(e) => setCoats(e.target.value)}
                      placeholder="1"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      aria-invalid={!estimatorValidation.ok}
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      Waste % (material estimate)
                    </span>
                    <input
                      inputMode="decimal"
                      value={materialWastePct}
                      onChange={(e) => setMaterialWastePct(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                      aria-invalid={!estimatorValidation.ok}
                    />
                    {materialWasteWarning ? (
                      <p
                        className={`mt-2 text-xs ${
                          materialWasteWarning.tone === "strong"
                            ? "text-rose-700"
                            : "text-slate-600"
                        }`}
                        aria-live="polite"
                      >
                        {materialWasteWarning.text}
                      </p>
                    ) : null}
                  </label>
                </div>

                {coverageUnitNote ? (
                  <p className="mt-3 text-xs text-slate-600" aria-live="polite">
                    {coverageUnitNote}
                  </p>
                ) : null}

                {!validation.ok ? (
                  <p
                    className="mt-3 text-sm text-rose-700"
                    role="alert"
                    aria-live="polite"
                  >
                    Fix the coverage area above to compute an estimate.
                  </p>
                ) : !estimatorValidation.ok ? (
                  <p
                    className="mt-3 text-sm text-rose-700"
                    role="alert"
                    aria-live="polite"
                  >
                    {estimatorValidation.message}
                  </p>
                ) : hasCoverageRate ? (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-slate-800">
                      Estimated needed
                    </div>
                    <div className="mt-2 text-2xl sm:text-4xl font-extrabold text-sky-700 tabular-nums leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                      {estimateDisplay}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Uses: (final coverage area ÷ coverage) × coats × (1 +
                      waste% ÷ 100)
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Enter a coverage rate to compute an estimate.
                  </p>
                )}
              </div>
            </details>
          </div>

          <div className="mt-3 mb-4 rounded-xl bg-slate-50 p-4">
            <details className="group">
              <summary className="cursor-pointer list-none font-semibold text-sky-800 flex items-center justify-between hover:text-sky-900">
                <span>Assumptions & disclaimer</span>
                <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                <span className="font-medium text-slate-700">Summary:</span>{" "}
                Exact unit definitions, estimate-only outputs, follow
                manufacturer specs.
              </div>

              <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
                <div>
                  <span className="font-medium text-slate-700">
                    Assumptions:
                  </span>{" "}
                  area unit conversions are based on exact definitions (for
                  example, 1 inch = 0.0254 meters exactly). Converted values are
                  for measurement and estimating, not a substitute for
                  product-specific instructions.
                </div>

                <div>
                  <span className="font-medium text-slate-700">
                    What is included:
                  </span>{" "}
                  area conversion. If you use the builder, the final coverage
                  area includes openings and allowance percentages. If you add a
                  coverage rate, the estimate uses your inputs and does not
                  account for product variations.
                </div>

                <p>
                  <span className="font-medium text-slate-700">
                    Disclaimer:
                  </span>{" "}
                  always follow manufacturer specs and local building guidelines
                  for your specific material and project.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

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
