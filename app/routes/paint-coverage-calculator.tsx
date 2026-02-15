import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/paint-coverage-calculator";
import HowItWorks from "~/client/components/paint-coverage-calculator/HowItWorks";
import ToolFit from "~/client/components/paint-coverage-calculator/ToolFit";
import FAQ from "~/client/components/paint-coverage-calculator/FAQ";
import Rounding from "~/client/components/home/Rounding";

export const meta: Route.MetaFunction = () => [
  {
    title:
      "Paint Coverage Calculator: Estimate Gallons or Liters for Walls, Rooms, Ceilings, Fences + Siding",
  },
  {
    name: "description",
    content:
      "Estimate paint needed for walls, rooms, ceilings, fences, and siding using label coverage per coat and total coats. Add walls, doors, and windows dynamically, subtract openings, and get per-coat and total paint estimates.",
  },
  {
    name: "keywords",
    content:
      "paint coverage calculator, paint calculator, how much paint do I need, gallons of paint, liters of paint, wall paint calculator, room paint calculator, ceiling paint calculator, fence paint calculator, siding paint calculator, spreading rate, m2 per liter, ft2 per gallon, coats",
  },
  { name: "robots", content: "index,follow" },
  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content:
      "Paint Coverage Calculator (Walls, Rooms, Ceilings, Fences, Siding)",
  },
  {
    property: "og:description",
    content:
      "Add walls, doors, and windows to estimate paint from paintable area, label coverage per coat, and total coats.",
  },
  {
    property: "og:url",
    content: "https://www.coveragecalculators.com/paint-coverage-calculator",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coveragecalculators.com/paint-coverage-calculator",
  },
];

type Period = "sqft" | "sqm" | "sqyd" | "acre" | "hectare" | "sqin" | "sqcm";
type Mode = "walls" | "area";
type DimUnit = "ft" | "m";
type PaintUnit = "GAL" | "QT" | "L" | "SPRAY400" | "CUSTOM";
type SurfaceAdj = "none" | "light" | "rough" | "heavy";
type CurrencyCode = "USD" | "CAD" | "EUR" | "GBP";

type DimRow = {
  id: string;
  label: string;
  w: string;
  h: string;
};

const PERIOD_LABEL: Record<Period, string> = {
  sqft: "Square feet (ft²)",
  sqm: "Square meters (m²)",
  sqyd: "Square yards (yd²)",
  acre: "Acres",
  hectare: "Hectares",
  sqin: "Square inches (in²)",
  sqcm: "Square centimeters (cm²)",
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

const PAINT_UNITS: Array<{ code: PaintUnit; label: string; hint?: string }> = [
  { code: "GAL", label: "US gallons (gal)", hint: "Most common for US paint" },
  { code: "QT", label: "Quarts (qt)", hint: "1 quart = 0.25 gal" },
  { code: "L", label: "Liters (L)", hint: "Most common for metric labels" },
  {
    code: "SPRAY400",
    label: "Spray cans (400 mL)",
    hint: "Typical small aerosol",
  },
];

const PAINT_UNIT_SHORT: Record<PaintUnit, string> = {
  GAL: "gal",
  QT: "qt",
  L: "L",
  SPRAY400: "cans",
  CUSTOM: "units",
};

function paintUnitShortLabel(paintUnit: PaintUnit, customLabel: string) {
  if (paintUnit === "CUSTOM")
    return customLabel.trim() ? customLabel.trim() : PAINT_UNIT_SHORT.CUSTOM;
  return PAINT_UNIT_SHORT[paintUnit];
}

const DEFAULT_COVERAGE: Record<
  Exclude<PaintUnit, "CUSTOM">,
  { rate: string; unit: Period; cost: string }
> = {
  GAL: { rate: "350", unit: "sqft", cost: "45" },
  QT: { rate: "90", unit: "sqft", cost: "18" },
  L: { rate: "11", unit: "sqm", cost: "20" },
  SPRAY400: { rate: "2", unit: "sqm", cost: "8" },
};

const CURRENCIES: Array<{ code: CurrencyCode; label: string; symbol: string }> =
  [
    { code: "USD", label: "USD ($)", symbol: "$" },
    { code: "CAD", label: "CAD (C$)", symbol: "C$" },
    { code: "EUR", label: "EUR (€)", symbol: "€" },
    { code: "GBP", label: "GBP (£)", symbol: "£" },
  ];

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeMode(value: string | null, fallback: Mode): Mode {
  if (!value) return fallback;
  return value === "walls" || value === "area" ? (value as Mode) : fallback;
}

function safeDimUnit(value: string | null, fallback: DimUnit): DimUnit {
  if (!value) return fallback;
  return value === "ft" || value === "m" ? (value as DimUnit) : fallback;
}

function safePeriod(value: string | null, fallback: Period): Period {
  if (!value) return fallback;
  const v = value as Period;
  return PERIOD_ORDER.includes(v) ? v : fallback;
}

function safePaintUnit(value: string | null, fallback: PaintUnit): PaintUnit {
  if (!value) return fallback;
  const v = value.toUpperCase() as PaintUnit;
  return PAINT_UNITS.some((u) => u.code === v) ? v : fallback;
}

function safeCurrency(
  value: string | null,
  fallback: CurrencyCode,
): CurrencyCode {
  if (!value) return fallback;
  const v = value.toUpperCase() as CurrencyCode;
  return CURRENCIES.some((c) => c.code === v) ? v : fallback;
}

function safeDisplayDecimals(value: string | null, fallback: 0 | 2 | 4 | 6) {
  if (value === null) return fallback;
  const n = Number(value);
  if (n === 0 || n === 2 || n === 4 || n === 6) return n as 0 | 2 | 4 | 6;
  return fallback;
}

function safeBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "boolean" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const SCALE = 1_000_000n;

type Rational = { n: bigint; d: bigint };

const SURFACE_ADJ: Array<{
  code: SurfaceAdj;
  label: string;
  note: string;
  factor: Rational;
}> = [
  {
    code: "none",
    label: "Smooth / normal",
    note: "0% adjustment",
    factor: { n: 1n, d: 1n },
  },
  {
    code: "light",
    label: "Light texture",
    note: "+10% is typical",
    factor: { n: 11n, d: 10n },
  },
  {
    code: "rough",
    label: "Rough / porous",
    note: "+20% is typical",
    factor: { n: 6n, d: 5n },
  },
  {
    code: "heavy",
    label: "Heavy texture / corrugated",
    note: "+30% is typical",
    factor: { n: 13n, d: 10n },
  },
];

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

function mulR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.n, d: a.d * b.d });
}

function divR(a: Rational, b: Rational): Rational {
  if (b.n === 0n) return { n: 0n, d: 1n };
  return normRational({ n: a.n * b.d, d: a.d * b.n });
}

function subR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
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

function formatGroupedDecimalString(
  decimalStr: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  const raw = decimalStr.trim();
  if (!raw) return "–";
  if (!/^-?\d+(\.\d+)?$/u.test(raw)) return "–";

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

function formatScaledForDisplay(
  scaled: bigint,
  opts: {
    roundForDisplay: boolean;
    displayDecimals: 0 | 2 | 4 | 6;
    allowLessThan: boolean;
  },
) {
  const { roundForDisplay, displayDecimals, allowLessThan } = opts;

  if (!roundForDisplay) {
    const dec = scaledToDecimalString(scaled, 6, { trimTrailingZeros: true });
    return formatGroupedDecimalString(dec, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 12,
    });
  }

  const roundedScaled = roundScaledToDigits(scaled, displayDecimals);

  if (allowLessThan && roundedScaled === 0n && scaled !== 0n) {
    const step = 10n ** BigInt(6 - displayDecimals);
    const decStep = scaledToDecimalString(step, 6, {
      fixed: displayDecimals > 0,
    });
    const prettyStep = formatGroupedDecimalString(decStep, {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
    });
    return `< ${prettyStep}`;
  }

  const dec = scaledToDecimalString(roundedScaled, 6, {
    fixed: displayDecimals > 0,
    trimTrailingZeros: false,
  });

  return formatGroupedDecimalString(dec, {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

function formatMoneyScaled(scaled: bigint, currency: CurrencyCode) {
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
  const num = formatScaledForDisplay(scaled, {
    roundForDisplay: true,
    displayDecimals: 2,
    allowLessThan: true,
  });
  return `${symbol}${num}`;
}

function parseNumberToScaled(input: string): {
  ok: boolean;
  scaled?: bigint;
  error?: string;
} {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a value." };

  const sanitized = raw.replace(/[^\d.,+\-()\s$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "");
  const isParenNeg =
    sanitized.includes("(") &&
    sanitized.includes(")") &&
    !sanitized.includes("-");
  const noParens = sanitized.replace(/[()]/g, "");
  const s0 = noParens.replace(/[$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "").replace(/\s+/g, "");

  if (!s0) return { ok: false, error: "Enter a value." };

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
  if (isNegative) return { ok: false, error: "Value cannot be negative." };

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
        error: "That number format looks unclear. Try 12.5 or 1,250.50.",
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
        "That number format looks unclear. Try 12.5 or 1,250.50 (and avoid mixed separators).",
    };
  }

  const [intStr, fracStrRaw = ""] = s.split(".");
  const fracStr = fracStrRaw.slice(0, 6);
  const fracPadded = fracStr.padEnd(6, "0");

  const intPart = BigInt(intStr || "0");
  const fracPart = BigInt(fracPadded || "0");
  const scaled = intPart * SCALE + fracPart;

  if (scaled > 1_000_000_000n * SCALE) {
    return {
      ok: false,
      error:
        "That value is very large and may be impractical to display. Try a smaller number or switch units.",
    };
  }

  return { ok: true, scaled };
}

function parseOptionalScaled(
  input: string,
): { ok: true; scaled: bigint } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) return { ok: true, scaled: 0n };
  const p = parseNumberToScaled(raw);
  if (!p.ok || p.scaled === undefined)
    return { ok: false, error: p.error ?? "Enter a valid value." };
  return { ok: true, scaled: p.scaled };
}

function mulDimToAreaScaled(widthScaled: bigint, heightScaled: bigint): bigint {
  return (widthScaled * heightScaled) / SCALE;
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

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function defaultWalls(): DimRow[] {
  return [{ id: newId("wall"), label: "Wall", w: "", h: "" }];
}

function loadRows(key: string, fallback: DimRow[]): DimRow[] {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  const parsed = safeJsonParse<any>(raw, null);
  if (!Array.isArray(parsed)) return fallback;

  const clean: DimRow[] = [];
  for (const r of parsed) {
    if (!r || typeof r !== "object") continue;
    const id = typeof r.id === "string" && r.id ? r.id : newId(key);
    const label = typeof r.label === "string" && r.label ? r.label : "Item";
    const w = typeof r.w === "string" ? r.w : "";
    const h = typeof r.h === "string" ? r.h : "";
    clean.push({ id, label, w, h });
  }
  return clean.length ? clean : fallback;
}

function looksLikeUsTimezone(tz: string) {
  return (
    /^America\/(New_York|Detroit|Chicago|Indiana\/|Denver|Phoenix|Los_Angeles|Anchorage|Adak)/u.test(
      tz,
    ) || /^US\//u.test(tz)
  );
}

function normalizeLocale(s: string) {
  return (s || "").trim().toLowerCase();
}

export default function PaintCoverageCalculator() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "walls";
    return safeMode(localStorage.getItem("pc_mode"), "walls");
  });

  const [dimUnit, setDimUnit] = useState<DimUnit>(() => {
    if (typeof window === "undefined") return "ft";
    return safeDimUnit(localStorage.getItem("pc_dim_unit"), "ft");
  });

  const [walls, setWalls] = useState<DimRow[]>(() =>
    loadRows("pc_walls", defaultWalls()),
  );
  const [doors, setDoors] = useState<DimRow[]>(() => loadRows("pc_doors", []));
  const [windows, setWindows] = useState<DimRow[]>(() =>
    loadRows("pc_windows", []),
  );

  const [areaValue, setAreaValue] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pc_area") ?? "";
  });

  const [areaFocused, setAreaFocused] = useState<boolean>(false);

  const [areaUnit, setAreaUnit] = useState<Period>(() => {
    if (typeof window === "undefined") return "sqft";
    return safePeriod(localStorage.getItem("pc_area_unit"), "sqft");
  });

  const [paintUnit, setPaintUnit] = useState<PaintUnit>(() => {
    if (typeof window === "undefined") return "GAL";
    return safePaintUnit(localStorage.getItem("pc_paint_unit"), "GAL");
  });

  const [customContainerLabel, setCustomContainerLabel] = useState<string>(
    () => {
      if (typeof window === "undefined") return "units";
      return (localStorage.getItem("pc_custom_container_label") ?? "units")
        .toString()
        .trim();
    },
  );

  const [coverageTouched, setCoverageTouched] = useState<boolean>(false);
  const [costTouched, setCostTouched] = useState<boolean>(false);

  const [coverageRate, setCoverageRate] = useState<string>(() => {
    if (typeof window === "undefined") return "350";
    return localStorage.getItem("pc_coverage_rate") ?? "350";
  });

  const [coverageUnit, setCoverageUnit] = useState<Period>(() => {
    if (typeof window === "undefined") return "sqft";
    return safePeriod(localStorage.getItem("pc_coverage_unit"), "sqft");
  });

  const [coats, setCoats] = useState<string>(() => {
    if (typeof window === "undefined") return "2";
    return localStorage.getItem("pc_coats") ?? "2";
  });

  const [surfaceAdj, setSurfaceAdj] = useState<SurfaceAdj>(() => {
    if (typeof window === "undefined") return "none";
    const v = localStorage.getItem("pc_surface_adj");
    return v === "none" || v === "light" || v === "rough" || v === "heavy"
      ? (v as SurfaceAdj)
      : "none";
  });

  const [costEnabled, setCostEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return safeBoolean(localStorage.getItem("pc_cost_enabled"), false);
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD";
    return safeCurrency(localStorage.getItem("pc_currency"), "USD");
  });

  const [costPerUnit, setCostPerUnit] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pc_cost_per_unit") ?? "";
  });

  const [roundForDisplay, setRoundForDisplay] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return safeBoolean(localStorage.getItem("pc_rounding"), true);
  });

  const [displayDecimals, setDisplayDecimals] = useState<0 | 2 | 4 | 6>(() => {
    if (typeof window === "undefined") return 2;
    return safeDisplayDecimals(localStorage.getItem("pc_display_decimals"), 2);
  });

  const [didCalculate, setDidCalculate] = useState<boolean>(false);

  const resultRegionId = "paint-results-region";
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  // First-run only initializer (layered locale defaults).
  // Runs once and writes missing keys only. Never overwrites an existing key.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const keys = {
      dimUnit: "pc_dim_unit",
      paintUnit: "pc_paint_unit",
      coverageUnit: "pc_coverage_unit",
      areaUnit: "pc_area_unit",
      currency: "pc_currency",
    } as const;

    const existing = {
      dimUnit: localStorage.getItem(keys.dimUnit),
      paintUnit: localStorage.getItem(keys.paintUnit),
      coverageUnit: localStorage.getItem(keys.coverageUnit),
      areaUnit: localStorage.getItem(keys.areaUnit),
      currency: localStorage.getItem(keys.currency),
    };

    const hasAllRequired =
      !!existing.dimUnit && !!existing.paintUnit && !!existing.coverageUnit;

    if (hasAllRequired) return;

    const navLang = normalizeLocale(
      (typeof navigator !== "undefined" ? navigator.language : "") || "",
    );
    const intlLocale = normalizeLocale(
      Intl.DateTimeFormat().resolvedOptions().locale || "",
    );
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").trim();

    const locale = navLang || intlLocale;

    // US-first baseline defaults
    let nextPaintUnit: PaintUnit = "GAL";
    let nextCoverageUnit: Period = "sqft";
    let nextDimUnit: DimUnit = "ft";
    let nextCurrency: CurrencyCode | null = "USD";

    const isUS = locale === "en-us" || looksLikeUsTimezone(tz);
    const isCA = locale === "en-ca";
    const isGB = locale === "en-gb" || /Europe\/London/u.test(tz);
    const isAU = locale === "en-au" || /Australia\//u.test(tz);
    const isNZ = locale === "en-nz" || /Pacific\/Auckland/u.test(tz);

    // Broad heuristic: most of Europe (plus UK handled above)
    const isLikelyEurope =
      /^([a-z]{2})(-([a-z]{2}))?$/u.test(locale) &&
      !locale.startsWith("en-us") &&
      !locale.startsWith("en-ca") &&
      !locale.startsWith("en-gb") &&
      /^Europe\//u.test(tz);

    if (isUS) {
      nextPaintUnit = "GAL";
      nextCoverageUnit = "sqft";
      nextDimUnit = "ft";
      nextCurrency = "USD";
    } else if (isCA) {
      nextPaintUnit = "GAL";
      nextCoverageUnit = "sqft";
      nextDimUnit = "ft";
      nextCurrency = "CAD";
    } else if (isGB) {
      nextPaintUnit = "L";
      nextCoverageUnit = "sqm";
      nextDimUnit = "m";
      nextCurrency = "GBP";
    } else if (isLikelyEurope) {
      nextPaintUnit = "L";
      nextCoverageUnit = "sqm";
      nextDimUnit = "m";
      nextCurrency = "EUR";
    } else if (isAU || isNZ) {
      nextPaintUnit = "L";
      nextCoverageUnit = "sqm";
      nextDimUnit = "m";
      nextCurrency = null;
    } else {
      // Keep US-first defaults
      nextPaintUnit = "GAL";
      nextCoverageUnit = "sqft";
      nextDimUnit = "ft";
      nextCurrency = "USD";
    }

    // Apply only missing keys
    if (!existing.dimUnit) {
      localStorage.setItem(keys.dimUnit, nextDimUnit);
      setDimUnit(nextDimUnit);
    }

    if (!existing.coverageUnit) {
      localStorage.setItem(keys.coverageUnit, nextCoverageUnit);
      setCoverageUnit(nextCoverageUnit);
    }

    if (!existing.paintUnit) {
      localStorage.setItem(keys.paintUnit, nextPaintUnit);
      setPaintUnit(nextPaintUnit);
    }

    if (!existing.areaUnit) {
      // Area input defaults should follow the same area convention on first run.
      localStorage.setItem(keys.areaUnit, nextCoverageUnit);
      setAreaUnit(nextCoverageUnit);
    }

    if (nextCurrency && !existing.currency) {
      localStorage.setItem(keys.currency, nextCurrency);
      setCurrency(nextCurrency);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pc_mode", mode);
    localStorage.setItem("pc_dim_unit", dimUnit);
    localStorage.setItem("pc_walls", JSON.stringify(walls));
    localStorage.setItem("pc_doors", JSON.stringify(doors));
    localStorage.setItem("pc_windows", JSON.stringify(windows));
    localStorage.setItem("pc_area", areaValue);
    localStorage.setItem("pc_area_unit", areaUnit);
    localStorage.setItem("pc_paint_unit", paintUnit);
    localStorage.setItem("pc_coverage_rate", coverageRate);
    localStorage.setItem("pc_coverage_unit", coverageUnit);
    localStorage.setItem("pc_coats", coats);
    localStorage.setItem("pc_surface_adj", surfaceAdj);
    localStorage.setItem("pc_cost_enabled", JSON.stringify(costEnabled));
    localStorage.setItem("pc_currency", currency);
    localStorage.setItem("pc_cost_per_unit", costPerUnit);
    localStorage.setItem("pc_rounding", JSON.stringify(roundForDisplay));
    localStorage.setItem("pc_display_decimals", String(displayDecimals));
  }, [
    mode,
    dimUnit,
    walls,
    doors,
    windows,
    areaValue,
    areaUnit,
    paintUnit,
    coverageRate,
    coverageUnit,
    coats,
    surfaceAdj,
    costEnabled,
    currency,
    costPerUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pc_custom_container_label", customContainerLabel);
  }, [customContainerLabel]);

  useEffect(() => {
    if (paintUnit !== "CUSTOM" && DEFAULT_COVERAGE[paintUnit]) {
      if (!coverageTouched) {
        setCoverageRate(DEFAULT_COVERAGE[paintUnit].rate);
        setCoverageUnit(DEFAULT_COVERAGE[paintUnit].unit);
      }
      if (!costTouched) {
        setCostPerUnit(DEFAULT_COVERAGE[paintUnit].cost);
      }
    }
  }, [paintUnit, coverageTouched, costTouched]);

  const dimAreaUnit: Period = useMemo(
    () => (dimUnit === "m" ? "sqm" : "sqft"),
    [dimUnit],
  );
  const dimUnitLabel = dimUnit === "m" ? "m" : "ft";
  const dimAreaSymbol = dimUnit === "m" ? "m²" : "ft²";

  const coatsParsed = useMemo(() => {
    const raw = coats.trim();
    if (!raw) return { ok: false, value: 0, message: "Coats is required." };
    const n = Number(raw);
    if (!Number.isFinite(n))
      return { ok: false, value: 0, message: "Coats must be a number." };
    if (!Number.isInteger(n) || n < 1)
      return {
        ok: false,
        value: 0,
        message: "Coats must be a whole number (1 or more).",
      };
    if (n > 20)
      return {
        ok: false,
        value: 0,
        message: "Coats looks unusually high. Double-check the value.",
      };
    return { ok: true, value: n, message: "" };
  }, [coats]);

  function rowAreaScaled(row: DimRow): {
    ok: boolean;
    areaScaled: bigint;
    message: string;
  } {
    const wHas = row.w.trim().length > 0;
    const hHas = row.h.trim().length > 0;
    if (!wHas && !hHas) return { ok: true, areaScaled: 0n, message: "" };
    if (wHas !== hHas)
      return {
        ok: false,
        areaScaled: 0n,
        message: `${row.label}: enter both width and height.`,
      };

    const pw = parseOptionalScaled(row.w);
    if (!pw.ok) {
      const msg = (pw as { ok: false; error: string }).error;
      return { ok: false, areaScaled: 0n, message: `${row.label}: ${msg}` };
    }
    const ph = parseOptionalScaled(row.h);
    if (!ph.ok) {
      const msg = (ph as { ok: false; error: string }).error;
      return { ok: false, areaScaled: 0n, message: `${row.label}: ${msg}` };
    }

    const areaScaled = mulDimToAreaScaled(pw.scaled, ph.scaled);
    return { ok: true, areaScaled, message: "" };
  }

  const wallsMath = useMemo(() => {
    const wallAreas = walls.map((r) => ({
      id: r.id,
      row: r,
      ...rowAreaScaled(r),
    }));
    const doorAreas = doors.map((r) => ({
      id: r.id,
      row: r,
      ...rowAreaScaled(r),
    }));
    const winAreas = windows.map((r) => ({
      id: r.id,
      row: r,
      ...rowAreaScaled(r),
    }));

    const messages = [...wallAreas, ...doorAreas, ...winAreas]
      .map((x) => x.message)
      .filter(Boolean);

    const wallsScaled: bigint = wallAreas.reduce<bigint>(
      (acc, x) => acc + x.areaScaled,
      0n,
    );
    const doorsScaled: bigint = doorAreas.reduce<bigint>(
      (acc, x) => acc + x.areaScaled,
      0n,
    );
    const windowsScaled: bigint = winAreas.reduce<bigint>(
      (acc, x) => acc + x.areaScaled,
      0n,
    );

    const openingsScaled = doorsScaled + windowsScaled;
    const paintableScaled = wallsScaled - openingsScaled;

    const anyWall = wallAreas.some((x) => x.row.w.trim() && x.row.h.trim());
    const anyOpenings = [...doorAreas, ...winAreas].some(
      (x) => x.row.w.trim() || x.row.h.trim(),
    );
    const anyInput = anyWall || anyOpenings;

    const okPairs = messages.length === 0;
    const okNonNegative = paintableScaled >= 0n;

    return {
      wallAreas,
      doorAreas,
      winAreas,
      messages,
      anyWall,
      anyOpenings,
      anyInput,
      okPairs,
      okNonNegative,
      wallsScaled,
      doorsScaled,
      windowsScaled,
      openingsScaled,
      paintableScaled,
      paintableAreaR: fromScaledUnits(
        paintableScaled < 0n ? 0n : paintableScaled,
      ),
    };
  }, [walls, doors, windows]);

  const areaParsed = useMemo(() => parseNumberToScaled(areaValue), [areaValue]);
  const formattedAreaValue = useMemo(() => {
    if (areaFocused) return areaValue;
    if (mode !== "area") return areaValue;
    if (!areaValue.trim()) return areaValue;
    if (!areaParsed.ok || areaParsed.scaled === undefined) return areaValue;
    const dec = scaledToDecimalString(areaParsed.scaled, 6, {
      trimTrailingZeros: true,
    });
    return formatGroupedDecimalString(dec, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }, [areaFocused, mode, areaValue, areaParsed.ok, areaParsed.scaled]);

  const activeAreaR = useMemo<Rational | null>(() => {
    if (mode === "walls") {
      if (!wallsMath.okPairs) return null;
      if (!wallsMath.anyWall) return null;
      if (!wallsMath.okNonNegative) return null;
      return wallsMath.paintableAreaR;
    }

    if (mode === "area") {
      if (!areaValue.trim()) return null;
      if (!areaParsed.ok || areaParsed.scaled === undefined) return null;
      return fromScaledUnits(areaParsed.scaled);
    }

    return null;
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.anyWall,
    wallsMath.okNonNegative,
    wallsMath.paintableAreaR,
    areaValue,
    areaParsed.ok,
    areaParsed.scaled,
  ]);

  const activeFromUnit = useMemo<Period>(
    () => (mode === "walls" ? dimAreaUnit : areaUnit),
    [mode, dimAreaUnit, areaUnit],
  );

  // Area displays are derived from coverageUnit (primary area display unit).
  const displayAreaUnit = useMemo<Period>(() => coverageUnit, [coverageUnit]);

  const convertedAreaR = useMemo(() => {
    if (!activeAreaR) return null;
    return convertRational(activeAreaR, activeFromUnit, displayAreaUnit);
  }, [activeAreaR, activeFromUnit, displayAreaUnit]);

  const hasCoverage = useMemo(
    () => coverageRate.trim().length > 0,
    [coverageRate],
  );

  const coverageParsed = useMemo(
    () => parseNumberToScaled(coverageRate),
    [coverageRate],
  );

  const inputsValid = useMemo(() => {
    if (!activeAreaR) return { ok: false, message: "" };
    if (!hasCoverage) return { ok: false, message: "" };
    if (!coverageParsed.ok) return { ok: false, message: "" };
    if (coverageParsed.scaled === undefined || coverageParsed.scaled === 0n)
      return { ok: false, message: "" };
    if (!coatsParsed.ok) return { ok: false, message: "" };
    return { ok: true, message: "" };
  }, [
    activeAreaR,
    hasCoverage,
    coverageParsed.ok,
    coverageParsed.scaled,
    coatsParsed.ok,
  ]);

  const wallValidationMessage = useMemo(() => {
    if (mode !== "walls") return "";
    if (!wallsMath.okPairs)
      return wallsMath.messages[0] ?? "Check your wall and opening inputs.";
    if (!wallsMath.anyWall)
      return "Add at least one wall and enter width and height.";
    if (!wallsMath.okNonNegative)
      return "Doors and windows exceed total wall area. Double-check dimensions.";
    return "";
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.messages,
    wallsMath.anyWall,
    wallsMath.okNonNegative,
  ]);

  const areaValidationMessage = useMemo(() => {
    if (mode !== "area") return "";
    if (!areaValue.trim()) return "Enter a surface area value.";
    if (!areaParsed.ok)
      return areaParsed.error ?? "Enter a valid surface area value.";
    return "";
  }, [mode, areaValue, areaParsed.ok, areaParsed.error]);

  const estimatorValidationMessage = useMemo(() => {
    if (!activeAreaR)
      return mode === "walls"
        ? "Enter valid wall measurements above."
        : "Enter a valid surface area above.";
    if (!hasCoverage) return "Enter a coverage rate.";
    if (!coverageParsed.ok)
      return coverageParsed.error ?? "Enter a valid coverage rate.";
    if (coverageParsed.scaled === undefined || coverageParsed.scaled === 0n)
      return "Coverage rate must be greater than 0.";
    if (!coatsParsed.ok)
      return coatsParsed.message || "Coats must be a whole number (1 or more).";
    return "";
  }, [
    activeAreaR,
    mode,
    hasCoverage,
    coverageParsed.ok,
    coverageParsed.error,
    coverageParsed.scaled,
    coatsParsed.ok,
    coatsParsed.message,
  ]);

  const costParsed = useMemo(() => {
    if (!costEnabled) return { ok: true as const, scaled: 0n };
    if (!costPerUnit.trim())
      return { ok: false as const, error: "Enter a cost per unit." };
    const p = parseNumberToScaled(costPerUnit);
    if (!p.ok || p.scaled === undefined || p.scaled === 0n) {
      return {
        ok: false as const,
        error: p.error ?? "Enter a valid cost per unit.",
      };
    }
    return { ok: true as const, scaled: p.scaled };
  }, [costEnabled, costPerUnit]);

  const costValidationMessage = useMemo(() => {
    if (!costEnabled) return "";
    if (!costParsed.ok) return costParsed.error;
    if (!inputsValid.ok)
      return "Enter valid paint inputs above to estimate cost.";
    return "";
  }, [costEnabled, costParsed, inputsValid.ok]);

  const surfaceFactorR = useMemo<Rational>(() => {
    return (
      SURFACE_ADJ.find((s) => s.code === surfaceAdj)?.factor ?? { n: 1n, d: 1n }
    );
  }, [surfaceAdj]);

  const estimatePerCoatBaseR = useMemo(() => {
    if (!activeAreaR) return null;
    if (!hasCoverage) return null;
    if (
      !coverageParsed.ok ||
      coverageParsed.scaled === undefined ||
      coverageParsed.scaled === 0n
    )
      return null;

    const areaInCoverageUnit = convertRational(
      activeAreaR,
      activeFromUnit,
      coverageUnit,
    );
    const rateR = fromScaledUnits(coverageParsed.scaled);
    return divR(areaInCoverageUnit, rateR);
  }, [
    activeAreaR,
    hasCoverage,
    coverageParsed.ok,
    coverageParsed.scaled,
    activeFromUnit,
    coverageUnit,
  ]);

  const estimatePerCoatR = useMemo(() => {
    if (!estimatePerCoatBaseR) return null;
    return mulR(estimatePerCoatBaseR, surfaceFactorR);
  }, [estimatePerCoatBaseR, surfaceFactorR]);

  const estimateTotalR = useMemo(() => {
    if (!estimatePerCoatR) return null;
    if (!coatsParsed.ok) return null;
    return mulR(estimatePerCoatR, { n: BigInt(coatsParsed.value), d: 1n });
  }, [estimatePerCoatR, coatsParsed.ok, coatsParsed.value]);

  const surfaceExtraPerCoatR = useMemo(() => {
    if (!estimatePerCoatR || !estimatePerCoatBaseR) return null;
    return subR(estimatePerCoatR, estimatePerCoatBaseR);
  }, [estimatePerCoatR, estimatePerCoatBaseR]);

  const surfaceExtraTotalR = useMemo(() => {
    if (!estimateTotalR || !estimatePerCoatBaseR) return null;
    if (!coatsParsed.ok) return null;
    const baseTotal = mulR(estimatePerCoatBaseR, {
      n: BigInt(coatsParsed.value),
      d: 1n,
    });
    return subR(estimateTotalR, baseTotal);
  }, [estimateTotalR, estimatePerCoatBaseR, coatsParsed.ok, coatsParsed.value]);

  const displayConvertedArea = useMemo(() => {
    if (!convertedAreaR) return "–";
    const scaled = toScaledUnits(convertedAreaR);
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [convertedAreaR, roundForDisplay, displayDecimals]);

  const displayPaintableAreaInDisplayUnit = useMemo(() => {
    if (!activeAreaR) return "–";
    const scaled = toScaledUnits(
      convertRational(activeAreaR, activeFromUnit, displayAreaUnit),
    );
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [
    activeAreaR,
    activeFromUnit,
    displayAreaUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  const displayWallsAreaInDisplayUnit = useMemo(() => {
    if (mode !== "walls") return "–";
    if (!wallsMath.okPairs) return "–";
    if (!wallsMath.anyWall) return "–";
    const r = fromScaledUnits(wallsMath.wallsScaled);
    const scaled = toScaledUnits(
      convertRational(r, dimAreaUnit, displayAreaUnit),
    );
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.anyWall,
    wallsMath.wallsScaled,
    dimAreaUnit,
    displayAreaUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  const displayOpeningsAreaInDisplayUnit = useMemo(() => {
    if (mode !== "walls") return "–";
    if (!wallsMath.okPairs) return "–";
    if (!wallsMath.anyWall) return "–";
    const r = fromScaledUnits(wallsMath.openingsScaled);
    const scaled = toScaledUnits(
      convertRational(r, dimAreaUnit, displayAreaUnit),
    );
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.anyWall,
    wallsMath.openingsScaled,
    dimAreaUnit,
    displayAreaUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  const displayDoorsTotalInDisplayUnit = useMemo(() => {
    if (mode !== "walls") return "–";
    if (!wallsMath.okPairs) return "–";
    if (!wallsMath.anyWall) return "–";
    const r = fromScaledUnits(wallsMath.doorsScaled);
    const scaled = toScaledUnits(
      convertRational(r, dimAreaUnit, displayAreaUnit),
    );
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.anyWall,
    wallsMath.doorsScaled,
    dimAreaUnit,
    displayAreaUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  const displayWindowsTotalInDisplayUnit = useMemo(() => {
    if (mode !== "walls") return "–";
    if (!wallsMath.okPairs) return "–";
    if (!wallsMath.anyWall) return "–";
    const r = fromScaledUnits(wallsMath.windowsScaled);
    const scaled = toScaledUnits(
      convertRational(r, dimAreaUnit, displayAreaUnit),
    );
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }, [
    mode,
    wallsMath.okPairs,
    wallsMath.anyWall,
    wallsMath.windowsScaled,
    dimAreaUnit,
    displayAreaUnit,
    roundForDisplay,
    displayDecimals,
  ]);

  const displayPerCoat = useMemo(() => {
    if (!estimatePerCoatR) return "–";
    const scaled = toScaledUnits(estimatePerCoatR);
    const v = formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
    const u = paintUnitShortLabel(paintUnit, customContainerLabel);
    return `${v} ${u}`;
  }, [
    estimatePerCoatR,
    roundForDisplay,
    displayDecimals,
    paintUnit,
    customContainerLabel,
  ]);

  const displayTotal = useMemo(() => {
    if (!estimateTotalR) return "–";
    const scaled = toScaledUnits(estimateTotalR);
    const v = formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
    const u = paintUnitShortLabel(paintUnit, customContainerLabel);
    return `${v} ${u}`;
  }, [
    estimateTotalR,
    roundForDisplay,
    displayDecimals,
    paintUnit,
    customContainerLabel,
  ]);

  const displaySurfaceExtraPerCoat = useMemo(() => {
    if (!surfaceExtraPerCoatR) return "–";
    const scaled = toScaledUnits(surfaceExtraPerCoatR);
    const v = formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
    const u = paintUnitShortLabel(paintUnit, customContainerLabel);
    return `${v} ${u}`;
  }, [
    surfaceExtraPerCoatR,
    roundForDisplay,
    displayDecimals,
    paintUnit,
    customContainerLabel,
  ]);

  const displaySurfaceExtraTotal = useMemo(() => {
    if (!surfaceExtraTotalR) return "–";
    const scaled = toScaledUnits(surfaceExtraTotalR);
    const v = formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
    const u = paintUnitShortLabel(paintUnit, customContainerLabel);
    return `${v} ${u}`;
  }, [
    surfaceExtraTotalR,
    roundForDisplay,
    displayDecimals,
    paintUnit,
    customContainerLabel,
  ]);

  const costPerCoatScaled = useMemo(() => {
    if (!costEnabled) return null;
    if (!inputsValid.ok) return null;
    if (!costParsed.ok) return null;
    if (!estimatePerCoatR) return null;
    const unitsScaled = toScaledUnits(estimatePerCoatR);
    return (unitsScaled * costParsed.scaled) / SCALE;
  }, [costEnabled, inputsValid.ok, costParsed, estimatePerCoatR]);

  const costTotalScaled = useMemo(() => {
    if (!costEnabled) return null;
    if (!inputsValid.ok) return null;
    if (!costParsed.ok) return null;
    if (!estimateTotalR) return null;
    const unitsScaled = toScaledUnits(estimateTotalR);
    return (unitsScaled * costParsed.scaled) / SCALE;
  }, [costEnabled, inputsValid.ok, costParsed, estimateTotalR]);

  const currencyLabel = useMemo(() => {
    return CURRENCIES.find((c) => c.code === currency)?.label ?? "USD ($)";
  }, [currency]);

  const breakdown = useMemo(() => {
    if (!activeAreaR) {
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
    return {
      sqin: convertRational(activeAreaR, activeFromUnit, "sqin"),
      sqcm: convertRational(activeAreaR, activeFromUnit, "sqcm"),
      sqft: convertRational(activeAreaR, activeFromUnit, "sqft"),
      sqyd: convertRational(activeAreaR, activeFromUnit, "sqyd"),
      sqm: convertRational(activeAreaR, activeFromUnit, "sqm"),
      acre: convertRational(activeAreaR, activeFromUnit, "acre"),
      hectare: convertRational(activeAreaR, activeFromUnit, "hectare"),
    };
  }, [activeAreaR, activeFromUnit]);

  function formatRational(r: Rational | null) {
    if (!r) return "–";
    const scaled = toScaledUnits(r);
    return formatScaledForDisplay(scaled, {
      roundForDisplay,
      displayDecimals,
      allowLessThan: true,
    });
  }

  function addRow(
    setter: (rows: DimRow[]) => void,
    rows: DimRow[],
    label: string,
  ) {
    setter([...rows, { id: newId(label.toLowerCase()), label, w: "", h: "" }]);
  }

  function removeRow(
    setter: (rows: DimRow[]) => void,
    rows: DimRow[],
    id: string,
  ) {
    const next = rows.filter((r) => r.id !== id);
    setter(next.length ? next : rows);
  }

  function revealAndScroll() {
    setDidCalculate(true);
    const el = document.getElementById(resultRegionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const showWallsError = mode === "walls" && !!wallValidationMessage;
  const showAreaError = mode === "area" && !!areaValidationMessage;
  const showEstimatorError = !!estimatorValidationMessage;

  const anyUserIntent = useMemo(() => {
    if (mode === "walls") return wallsMath.anyInput;
    return !!areaValue.trim();
  }, [mode, wallsMath.anyInput, areaValue]);

  const primaryIssueMessage = useMemo(() => {
    if (!anyUserIntent) return "";
    if (mode === "walls" && wallValidationMessage) return wallValidationMessage;
    if (mode === "area" && areaValidationMessage) return areaValidationMessage;
    if (estimatorValidationMessage) return estimatorValidationMessage;
    return "";
  }, [
    anyUserIntent,
    mode,
    wallValidationMessage,
    areaValidationMessage,
    estimatorValidationMessage,
  ]);

  const resultsHeaderText = useMemo(() => {
    if (!anyUserIntent) {
      return mode === "walls"
        ? "Enter wall measurements to see results."
        : "Enter a surface area value to see results.";
    }
    if (primaryIssueMessage) return primaryIssueMessage;
    return "";
  }, [anyUserIntent, mode, primaryIssueMessage]);

  const paintNeededStatusText = useMemo(() => {
    if (!anyUserIntent) return "Enter inputs to estimate paint.";
    if (primaryIssueMessage) return primaryIssueMessage;
    if (!inputsValid.ok)
      return "Enter coverage rate and coats to estimate paint.";
    return "";
  }, [anyUserIntent, primaryIssueMessage, inputsValid.ok]);

  // Conversion tiles: primary follows coverageUnit. If sqft/sqm, show the other as a consistent secondary.
  const secondaryAreaUnit = useMemo<Period | null>(() => {
    if (coverageUnit === "sqft") return "sqm";
    if (coverageUnit === "sqm") return "sqft";
    return null;
  }, [coverageUnit]);

  return (
    <main className="bg-white text-slate-700 scroll-smooth antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              a[href]:after { content: ""; }
              #export-controls-desktop, #export-controls-mobile, #calculate-controls { display: none !important; }
              .shadow-sm { box-shadow: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 sm:mt-6 sm:pb-12">
        <div className="rounded-2xl bg-white sm:shadow-sm sm:border border-slate-200 sm:px-8">
          <div className="flex flex-col pt-2 sm:pt-4 pb-1 sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className=" text-center sm:text-left text-2xl sm:text-3xl md:text-4xl capitalize font-bold text-sky-800 tracking-tight">
              Paint Coverage Calculator
            </h1>

            <div
              id="export-controls-desktop"
              className="hidden sm:flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          <p className="hidden mb-1 md:flex w-full text-left text-sm md:text-base text-slate-600 leading-relaxed">
            Add walls, doors, and windows to estimate paint from label coverage
            per coat and total coats.
          </p>

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode("walls")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    mode === "walls"
                      ? "border-sky-300 bg-sky-50 text-sky-900"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-sky-50 hover:border-sky-200"
                  }`}
                >
                  Walls + openings
                </button>
                <button
                  type="button"
                  onClick={() => setMode("area")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    mode === "area"
                      ? "border-sky-300 bg-sky-50 text-sky-900"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-sky-50 hover:border-sky-200"
                  }`}
                >
                  I already know the area
                </button>
              </div>

              {mode === "walls" ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <label className="inline-flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Dimensions in
                    </span>
                    <select
                      value={dimUnit}
                      onChange={(e) => setDimUnit(e.target.value as DimUnit)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                      aria-label="Dimension unit"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            {mode === "walls" ? (
              <div className="mt-2">
                <div className="mt-3 grid gap-3">
                  {walls.map((row, idx) => {
                    const a = rowAreaScaled(row);
                    const areaText =
                      row.w.trim() && row.h.trim() && a.ok
                        ? `${formatScaledForDisplay(
                            toScaledUnits(
                              convertRational(
                                fromScaledUnits(a.areaScaled),
                                dimAreaUnit,
                                displayAreaUnit,
                              ),
                            ),
                            {
                              roundForDisplay,
                              displayDecimals,
                              allowLessThan: true,
                            },
                          )} ${PERIOD_LABEL[displayAreaUnit]}`
                        : "–";
                    return (
                      <div
                        key={row.id}
                        className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-white via-sky-50/40 to-emerald-50/30 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Wall {idx + 1}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              Area:{" "}
                              <span className="font-semibold text-slate-800 tabular-nums">
                                {areaText}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRow(setWalls, walls, row.id)}
                            disabled={walls.length <= 1}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                              walls.length <= 1
                                ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "border-slate-300 bg-white text-slate-900 hover:bg-rose-50 hover:border-rose-200"
                            }`}
                            aria-label={`Remove wall ${idx + 1}`}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="block text-xs font-semibold text-slate-700 mb-1">
                              Width ({dimUnitLabel})
                            </span>
                            <input
                              inputMode="decimal"
                              value={row.w}
                              onChange={(e) =>
                                setWalls(
                                  walls.map((r) =>
                                    r.id === row.id
                                      ? { ...r, w: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                              placeholder="e.g. 12"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                            />
                          </label>

                          <label className="block">
                            <span className="block text-xs font-semibold text-slate-700 mb-1">
                              Height ({dimUnitLabel})
                            </span>
                            <input
                              inputMode="decimal"
                              value={row.h}
                              onChange={(e) =>
                                setWalls(
                                  walls.map((r) =>
                                    r.id === row.id
                                      ? { ...r, h: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                              placeholder="e.g. 8"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                            />
                          </label>
                        </div>

                        {!a.ok ? (
                          <p
                            className="mt-2 text-sm text-rose-700"
                            role="alert"
                          >
                            {a.message}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => addRow(setWalls, walls, "Wall")}
                    className="rounded-xl border border-slate-300 bg-sky-700 px-4 py-3 text-sm font-semibold text-white hover:bg-white hover:text-sky-900  hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    + Add another wall
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Doors (subtract)
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Total:{" "}
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {wallsMath.anyWall && wallsMath.okPairs
                              ? `${displayDoorsTotalInDisplayUnit} ${PERIOD_LABEL[displayAreaUnit]}`
                              : "Not available"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addRow(setDoors, doors, "Door")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="mt-1 space-y-3">
                      {doors.length === 0 ? (
                        <div className="text-sm text-slate-600">
                          Optional. Add doors if you are not painting them.
                        </div>
                      ) : null}

                      {doors.map((row, idx) => {
                        const a = rowAreaScaled(row);
                        return (
                          <div
                            key={row.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-slate-800">
                                Door {idx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setDoors(doors.filter((r) => r.id !== row.id))
                                }
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Width ({dimUnitLabel})
                                </span>
                                <input
                                  inputMode="decimal"
                                  value={row.w}
                                  onChange={(e) =>
                                    setDoors(
                                      doors.map((r) =>
                                        r.id === row.id
                                          ? { ...r, w: e.target.value }
                                          : r,
                                      ),
                                    )
                                  }
                                  placeholder="e.g. 3"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                />
                              </label>

                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Height ({dimUnitLabel})
                                </span>
                                <input
                                  inputMode="decimal"
                                  value={row.h}
                                  onChange={(e) =>
                                    setDoors(
                                      doors.map((r) =>
                                        r.id === row.id
                                          ? { ...r, h: e.target.value }
                                          : r,
                                      ),
                                    )
                                  }
                                  placeholder="e.g. 7"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                />
                              </label>
                            </div>

                            <div className="mt-2 text-xs text-slate-600">
                              Area:{" "}
                              <span className="font-semibold text-slate-800 tabular-nums">
                                {row.w.trim() && row.h.trim() && a.ok
                                  ? `${formatScaledForDisplay(
                                      toScaledUnits(
                                        convertRational(
                                          fromScaledUnits(a.areaScaled),
                                          dimAreaUnit,
                                          displayAreaUnit,
                                        ),
                                      ),
                                      {
                                        roundForDisplay,
                                        displayDecimals,
                                        allowLessThan: true,
                                      },
                                    )} ${PERIOD_LABEL[displayAreaUnit]}`
                                  : "–"}
                              </span>
                            </div>

                            {!a.ok ? (
                              <p
                                className="mt-2 text-sm text-rose-700"
                                role="alert"
                              >
                                {a.message}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-white via-sky-50/30 to-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Windows (subtract)
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Total:{" "}
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {wallsMath.anyWall && wallsMath.okPairs
                              ? `${displayWindowsTotalInDisplayUnit} ${PERIOD_LABEL[displayAreaUnit]}`
                              : "Not available"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addRow(setWindows, windows, "Window")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="mt-1 space-y-3">
                      {windows.length === 0 ? (
                        <div className="text-sm text-slate-600">
                          Optional. Add windows if you are not painting frames
                          or glass.
                        </div>
                      ) : null}

                      {windows.map((row, idx) => {
                        const a = rowAreaScaled(row);
                        return (
                          <div
                            key={row.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-slate-800">
                                Window {idx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setWindows(
                                    windows.filter((r) => r.id !== row.id),
                                  )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Width ({dimUnitLabel})
                                </span>
                                <input
                                  inputMode="decimal"
                                  value={row.w}
                                  onChange={(e) =>
                                    setWindows(
                                      windows.map((r) =>
                                        r.id === row.id
                                          ? { ...r, w: e.target.value }
                                          : r,
                                      ),
                                    )
                                  }
                                  placeholder="e.g. 4"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                />
                              </label>

                              <label className="block">
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                  Height ({dimUnitLabel})
                                </span>
                                <input
                                  inputMode="decimal"
                                  value={row.h}
                                  onChange={(e) =>
                                    setWindows(
                                      windows.map((r) =>
                                        r.id === row.id
                                          ? { ...r, h: e.target.value }
                                          : r,
                                      ),
                                    )
                                  }
                                  placeholder="e.g. 3"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                                />
                              </label>
                            </div>

                            <div className="mt-2 text-xs text-slate-600">
                              Area:{" "}
                              <span className="font-semibold text-slate-800 tabular-nums">
                                {row.w.trim() && row.h.trim() && a.ok
                                  ? `${formatScaledForDisplay(
                                      toScaledUnits(
                                        convertRational(
                                          fromScaledUnits(a.areaScaled),
                                          dimAreaUnit,
                                          displayAreaUnit,
                                        ),
                                      ),
                                      {
                                        roundForDisplay,
                                        displayDecimals,
                                        allowLessThan: true,
                                      },
                                    )} ${PERIOD_LABEL[displayAreaUnit]}`
                                  : "–"}
                              </span>
                            </div>

                            {!a.ok ? (
                              <p
                                className="mt-2 text-sm text-rose-700"
                                role="alert"
                              >
                                {a.message}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {didCalculate && showWallsError ? (
                  <p
                    className="mt-3 text-sm text-rose-700"
                    role="alert"
                    aria-live="polite"
                  >
                    {wallValidationMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Surface area
                </label>

                <div className="flex flex-col gap-2 lg:flex-row">
                  <input
                    inputMode="decimal"
                    value={formattedAreaValue}
                    onFocus={() => setAreaFocused(true)}
                    onBlur={() => setAreaFocused(false)}
                    onChange={(e) => setAreaValue(e.target.value)}
                    placeholder="e.g. 500 or 1250.50"
                    className="w-full text-lg min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                    aria-invalid={didCalculate && showAreaError}
                  />

                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as Period)}
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

                {didCalculate && showAreaError ? (
                  <p
                    className="mt-2 text-sm text-rose-700"
                    role="alert"
                    aria-live="polite"
                  >
                    {areaValidationMessage}
                  </p>
                ) : null}
              </div>
            )}

            <div className="my-6 grid gap-3 lg:grid-cols-12">
              {/* Card A: Paint settings */}
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-sky-800">
                      Paint settings
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1">
                        Paint unit
                      </span>
                      <select
                        value={paintUnit}
                        onChange={(e) =>
                          setPaintUnit(e.target.value as PaintUnit)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                        aria-label="Paint unit"
                      >
                        {PAINT_UNITS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-600">
                        {paintUnit !== "CUSTOM"
                          ? (PAINT_UNITS.find((x) => x.code === paintUnit)
                              ?.hint ?? "")
                          : "Use your own unit name. Enter coverage and cost per unit."}
                      </p>
                    </label>

                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1">
                        Coats
                      </span>
                      <input
                        inputMode="numeric"
                        value={coats}
                        onChange={(e) => setCoats(e.target.value)}
                        placeholder="2"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        aria-invalid={didCalculate && !coatsParsed.ok}
                      />
                      <p className="mt-1 text-xs text-slate-600">
                        Most projects use 2 coats.
                      </p>
                    </label>
                  </div>

                  {/* Surface texture adjustment (kept, but placed here so the left card feels complete) */}
                  <div className="mt-4">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1">
                        Surface texture adjustment (optional)
                      </span>
                      <select
                        value={surfaceAdj}
                        onChange={(e) =>
                          setSurfaceAdj(e.target.value as SurfaceAdj)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                        aria-label="Surface texture adjustment"
                      >
                        {SURFACE_ADJ.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.label} • {s.note}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                        Labels usually assume smooth surfaces. Use this to add a
                        practical buffer for rough, porous, or corrugated
                        materials.
                      </p>
                    </label>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    Total paint = (paintable area ÷ coverage per{" "}
                    {paintUnitShortLabel(paintUnit, customContainerLabel)}) ×
                    coats
                  </div>
                </div>
              </div>

              {/* Card B: Coverage */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-sky-800">
                      Coverage (from your paint can)
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900">
                      per coat
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="block text-sm font-semibold text-slate-700 mb-1">
                      Coverage area (per coat/per can)
                    </span>

                    {/* Responsive fix: stack on mobile, side-by-side on sm+ */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      <input
                        inputMode="decimal"
                        value={coverageRate}
                        onChange={(e) => {
                          setCoverageTouched(true);
                          setCoverageRate(e.target.value);
                        }}
                        placeholder={
                          paintUnit === "GAL"
                            ? "e.g. 350"
                            : paintUnit === "QT"
                              ? "e.g. 90"
                              : paintUnit === "L"
                                ? "e.g. 11"
                                : paintUnit === "SPRAY400"
                                  ? "e.g. 2"
                                  : "e.g. 350"
                        }
                        className="w-full min-w-0 sm:flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                        aria-invalid={
                          didCalculate &&
                          (!coverageParsed.ok || coverageParsed.scaled === 0n)
                        }
                        aria-describedby="pc-coverage-help"
                      />

                      {/* Remove fixed width on mobile, keep it on sm+ so your desktop layout stays the same */}
                      <div className="w-full sm:shrink-0 sm:w-[13.5rem]">
                        <label className="sr-only">Coverage area (units)</label>
                        <select
                          value={coverageUnit}
                          onChange={(e) =>
                            setCoverageUnit(e.target.value as Period)
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                          aria-label="Coverage area (units)"
                          aria-describedby="pc-coverage-help"
                        >
                          {PERIOD_ORDER.map((p) => (
                            <option key={p} value={p}>
                              {PERIOD_LABEL[p]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p
                      id="pc-coverage-help"
                      className="mt-2 text-xs text-slate-600 leading-relaxed"
                    >
                      Find this on the can label or product page. Enter the
                      number for{" "}
                      <span className="font-semibold text-slate-800">
                        1 {paintUnitShortLabel(paintUnit, customContainerLabel)}
                      </span>{" "}
                      and choose the matching area units.
                      <span className="block mt-1">
                        Example: “350 ft² per gallon per coat” → enter{" "}
                        <span className="font-semibold text-slate-800">
                          350
                        </span>
                        , choose{" "}
                        <span className="font-semibold text-slate-800">
                          Square feet (ft²)
                        </span>
                        . If there’s a range, use the lower number.
                      </span>
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      You’re saying:{" "}
                      <span className="font-semibold text-slate-900">
                        1 {paintUnitShortLabel(paintUnit, customContainerLabel)}
                      </span>{" "}
                      covers{" "}
                      <span className="font-semibold text-slate-900">
                        {coverageRate.trim() ? coverageRate.trim() : "—"}
                      </span>{" "}
                      <span className="font-semibold text-slate-900">
                        {PERIOD_LABEL[coverageUnit]}
                      </span>{" "}
                      per coat.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={scrollTargetRef}
              id={resultRegionId}
              className="mt-4 rounded-2xl border border-slate-200 bg-[#f7fbff] p-5 sm:p-6 shadow-sm relative"
              role="region"
              aria-label="Paint calculation results"
              aria-live="polite"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-200 rounded-t-2xl" />

              {resultsHeaderText ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800">
                  <span className="font-semibold">Heads up:</span>{" "}
                  {resultsHeaderText}
                </div>
              ) : null}

              {/* Primary results row */}
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Painted area card */}
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full bg-sky-600"
                            aria-hidden="true"
                          />
                          <div className="text-sm font-semibold text-slate-800">
                            Painted area
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Display unit:{" "}
                          <span className="font-semibold text-slate-800">
                            {PERIOD_LABEL[displayAreaUnit]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-3xl sm:text-5xl font-extrabold text-emerald-700 tabular-nums leading-none min-h-[3.25rem] sm:min-h-[4rem]">
                      {activeAreaR ? (
                        <>
                          {displayConvertedArea}{" "}
                          <span className="text-base sm:text-lg font-bold text-slate-700">
                            {PERIOD_LABEL[displayAreaUnit]}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600 text-xl sm:text-2xl font-bold">
                          Not available
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <div>
                        Area in coverage unit:{" "}
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {activeAreaR
                            ? `${displayPaintableAreaInDisplayUnit} ${PERIOD_LABEL[displayAreaUnit]}`
                            : "Not available"}
                        </span>
                      </div>

                      {mode === "walls" ? (
                        <div className="grid gap-1">
                          <div>
                            Walls total:{" "}
                            <span className="font-semibold text-slate-800 tabular-nums">
                              {wallsMath.anyWall && wallsMath.okPairs
                                ? `${displayWallsAreaInDisplayUnit} ${PERIOD_LABEL[displayAreaUnit]}`
                                : "Not available"}
                            </span>
                          </div>
                          <div>
                            Openings:{" "}
                            <span className="font-semibold text-slate-800 tabular-nums">
                              {wallsMath.anyWall && wallsMath.okPairs
                                ? `${displayOpeningsAreaInDisplayUnit} ${PERIOD_LABEL[displayAreaUnit]}`
                                : "Not available"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Wall inputs are entered in {dimUnitLabel}; totals
                            shown in your selected coverage unit.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Paint needed card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-slate-800">
                      Paint needed
                    </div>

                    <div className="mt-2 pb-2 text-2xl sm:text-4xl font-extrabold text-sky-700 tabular-nums leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                      {inputsValid.ok ? (
                        displayTotal
                      ) : (
                        <span className="text-slate-600 text-xl sm:text-2xl font-bold">
                          Not available
                        </span>
                      )}
                    </div>

                    {!inputsValid.ok ? (
                      <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-slate-800">
                        <span className="font-semibold">Fix this:</span>{" "}
                        {paintNeededStatusText}
                      </div>
                    ) : null}

                    <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Per coat:{" "}
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {estimatePerCoatR ? displayPerCoat : "–"}
                      </span>{" "}
                      • Coats:{" "}
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {coatsParsed.ok ? coatsParsed.value : "–"}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Uses: (paintable area ÷ coverage per unit) × coats
                    </div>

                    <div
                      id="export-controls-mobile"
                      className="sm:hidden mt-3 flex flex-col gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]"
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary section: conversions (visually separated) */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-800">
                  Area conversions
                </div>
                <div className="text-xs text-slate-600">
                  Based on your current painted area
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Show a consistent “secondary” tile first when relevant */}
                {secondaryAreaUnit ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-medium text-slate-600">
                      {PERIOD_LABEL[secondaryAreaUnit]}
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                      {activeAreaR
                        ? formatRational(
                            convertRational(
                              activeAreaR,
                              activeFromUnit,
                              secondaryAreaUnit,
                            ),
                          )
                        : "–"}
                    </div>
                  </div>
                ) : null}

                {(
                  [
                    ["Square feet (ft²)", breakdown.sqft, "sqft"],
                    ["Square meters (m²)", breakdown.sqm, "sqm"],
                    ["Square yards (yd²)", breakdown.sqyd, "sqyd"],
                    ["Acres", breakdown.acre, "acre"],
                    ["Hectares", breakdown.hectare, "hectare"],
                    ["Square inches (in²)", breakdown.sqin, "sqin"],
                    ["Square centimeters (cm²)", breakdown.sqcm, "sqcm"],
                  ] as const
                )
                  .filter(([, , key]) => key !== coverageUnit)
                  .filter(([, , key]) =>
                    secondaryAreaUnit ? key !== secondaryAreaUnit : true,
                  )
                  .map(([label, val, key]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="text-xs font-medium text-slate-600">
                        {label}
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                        {activeAreaR ? formatRational(val) : "–"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-y-3 gap-x-5 lg:grid-cols-12">
            <div className="lg:col-span-12">
              {didCalculate && showEstimatorError ? (
                <p
                  className="mt-3 text-sm text-rose-700"
                  role="alert"
                  aria-live="polite"
                >
                  {estimatorValidationMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Cost estimate (optional)
                </div>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                  Enter a realistic price for your selected paint unit to
                  estimate per-coat and total cost.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 select-none">
                <input
                  type="checkbox"
                  checked={costEnabled}
                  onChange={(e) => setCostEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                />
                Enable cost estimate
              </label>
            </div>

            {costEnabled ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1">
                        Currency
                      </span>
                      <select
                        value={currency}
                        onChange={(e) =>
                          setCurrency(e.target.value as CurrencyCode)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus-visible:ring-emerald-300 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/40 transition"
                        aria-label="Currency"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 mb-1">
                        Cost per{" "}
                        {paintUnitShortLabel(paintUnit, customContainerLabel)}
                      </span>
                      <input
                        inputMode="decimal"
                        value={costPerUnit}
                        onChange={(e) => {
                          setCostTouched(true);
                          setCostPerUnit(e.target.value);
                        }}
                        placeholder={
                          paintUnit === "GAL"
                            ? "e.g. 45"
                            : paintUnit === "L"
                              ? "e.g. 14"
                              : "e.g. 20"
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus-visible:ring-emerald-300"
                        aria-invalid={didCalculate && !costParsed.ok}
                      />
                      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                        Tip: many interior paints are priced roughly 30 to 70
                        per gallon (in your currency), and smaller containers
                        can cost more per unit.
                      </p>
                    </label>
                  </div>

                  {didCalculate && costValidationMessage ? (
                    <p
                      className="mt-3 text-sm text-rose-700"
                      role="alert"
                      aria-live="polite"
                    >
                      {costValidationMessage}
                    </p>
                  ) : null}
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-slate-200 bg-[#f4fff7] p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full bg-emerald-600"
                        aria-hidden="true"
                      />
                      <div className="text-sm font-semibold text-slate-900">
                        Estimated cost
                      </div>
                    </div>

                    <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums leading-none">
                      {costTotalScaled !== null
                        ? formatMoneyScaled(costTotalScaled, currency)
                        : "–"}
                    </div>

                    <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                      Per coat:{" "}
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {costPerCoatScaled !== null
                          ? formatMoneyScaled(costPerCoatScaled, currency)
                          : "–"}
                      </span>{" "}
                      • Uses your paint estimate ({displayTotal}) × cost per
                      unit
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">
                        What makes costs realistic
                      </div>
                      <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
                        <li>
                          Better quality paints often cost more but can cover
                          better on smooth surfaces.
                        </li>
                        <li>
                          Rough or porous substrates can raise quantity (and
                          cost) by about 10% to 30% depending on surface.
                        </li>
                        <li>
                          If you are buying multiple containers, you may need to
                          round up to the next available size.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div
            id="calculate-controls"
            className="mt-4 flex flex-wrap items-center justify-between gap-3"
          >
            <button
              type="button"
              onClick={() => {
                revealAndScroll();
              }}
              className="flex w-full justify-center  md:text-base items-center rounded-xl border border-slate-300 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-50 hover:text-sky-800 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Calculate
            </button>
          </div>         
        </div>
      </section>

      <HowItWorks />
      <ToolFit />
      <FAQ />
    </main>
  );
}
