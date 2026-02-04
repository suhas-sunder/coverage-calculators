import { useMemo, useEffect, useState } from "react";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  {
    title: "Coverage Calculator (Area, Paint, Mulch, Soil, Gravel, Concrete)",
  },
  {
    name: "description",
    content:
      "Convert area units and estimate material coverage for paint, mulch, soil, gravel, concrete, and more. Exact decimals, transparent math, and clear assumptions.",
  },
  {
    name: "keywords",
    content:
      "coverage calculator, area converter, paint coverage calculator, mulch coverage calculator, soil coverage calculator, gravel coverage calculator, concrete coverage calculator, square feet to square meters, square meters to square feet, acres to square feet, hectares to square meters, material estimator, coats calculator, waste factor",
  },
  { name: "robots", content: "index,follow" },
  { name: "author", content: "CoverageConverters.com" },
  { name: "theme-color", content: "#f8fafc" },

  // Open Graph
  { property: "og:type", content: "website" },
  {
    property: "og:title",
    content: "Coverage Calculator (Area, Paint, Mulch, Soil, Gravel, Concrete)",
  },
  {
    property: "og:description",
    content:
      "Convert area units and estimate material needs with exact decimals and transparent math for paint and bulk materials.",
  },
  { property: "og:url", content: "https://www.coverageconverters.com" },
  { property: "og:site_name", content: "CoverageConverters.com" },
  {
    property: "og:image",
    content: "https://www.coverageconverters.com/og-image.jpg",
  },

  // Twitter
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Coverage Calculator (Area + Material Estimator)",
  },
  {
    name: "twitter:description",
    content:
      "Convert area units and estimate coverage with clear assumptions and exact decimals.",
  },
  {
    name: "twitter:image",
    content: "https://www.coverageconverters.com/og-image.jpg",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://www.coverageconverters.com",
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

/**
 * Decimal-safe math (no float drift in computation).
 * We parse user input to a scaled integer (micro-units) and keep all conversions as rational BigInt.
 */
const SCALE = 1_000_000n; // 6 decimal places preserved end-to-end

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

type Rational = { n: bigint; d: bigint }; // n/d

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

function subR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}

function addR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

function mulR(a: Rational, b: Rational): Rational {
  return normRational({ n: a.n * b.n, d: a.d * b.d });
}

function divR(a: Rational, b: Rational): Rational {
  if (b.n === 0n) return { n: 0n, d: 1n };
  return normRational({ n: a.n * b.d, d: a.d * b.n });
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

function parseMoneyToScaled(input: string): {
  ok: boolean;
  scaled?: bigint;
  normalized?: string;
  error?: string;
} {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter an area value." };

  const sanitized = raw.replace(/[^\d.,+\-()\s$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "");

  const isParenNeg =
    sanitized.includes("(") &&
    sanitized.includes(")") &&
    !sanitized.includes("-");
  const noParens = sanitized.replace(/[()]/g, "");

  const s0 = noParens.replace(/[$€£¥₹₩₽₫₴₱₦₲₵₡₺₸]/g, "").replace(/\s+/g, "");

  if (!s0) return { ok: false, error: "Enter an area value." };

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
    return { ok: false, error: "Value cannot be negative." };
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

  const maxScaled = 1_000_000_000n * SCALE;
  if (scaled > maxScaled) {
    return {
      ok: false,
      error:
        "That value is extremely large. Please enter a smaller area value (under 1,000,000,000).",
    };
  }

  return { ok: true, scaled, normalized: s };
}

function formatMoneyFromDecimalString(
  decimalStr: string,
  currency: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  // In this landing page, the "currency" selector represents output units.
  // We still use grouped number formatting and append the unit label in the UI.
  const n = Number(decimalStr);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
  }).format(n);
}

function formatGroupedNumberFromDecimalString(
  decimalStr: string,
  opts: { minimumFractionDigits: number; maximumFractionDigits: number },
) {
  const n = Number(decimalStr);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(undefined, {
    useGrouping: true,
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
  }).format(n);
}

const DAYS_PER_PERIOD: Record<Exclude<Period, "hourly">, Rational> = {
  daily: { n: 1n, d: 1n },
  weekly: { n: 7n, d: 1n },
  biweekly: { n: 14n, d: 1n },
  every_4_weeks: { n: 28n, d: 1n },
  monthly: { n: 365n, d: 12n },
  annual: { n: 365n, d: 1n },
};

const AREA_FACTOR_TO_SQM: Record<Period, Rational> = {
  // All factors are exact, based on the exact definition of the inch and meter.
  // 1 in = 0.0254 m (exact)
  // Therefore: 1 in² = 0.00064516 m² (exact)
  sqin: { n: 64516n, d: 100000000n },
  // 1 cm² = 0.0001 m² (exact)
  sqcm: { n: 1n, d: 10000n },
  // 1 ft = 0.3048 m (exact) -> 1 ft² = 0.09290304 m² (exact)
  sqft: { n: 9290304n, d: 100000000n },
  // 1 yd = 0.9144 m (exact) -> 1 yd² = 0.83612736 m² (exact)
  sqyd: { n: 83612736n, d: 100000000n },
  // 1 m² = 1 m²
  sqm: { n: 1n, d: 1n },
  // 1 acre = 4046.8564224 m² (exact)
  acre: { n: 40468564224n, d: 10000000n },
  // 1 hectare = 10,000 m² (exact)
  hectare: { n: 10000n, d: 1n },
};

function convertRational(amount: Rational, from: Period, to: Period): Rational {
  if (from === to) return amount;
  const fromFactor = AREA_FACTOR_TO_SQM[from];
  const toFactor = AREA_FACTOR_TO_SQM[to];
  const inSqm = mulR(amount, fromFactor);
  return divR(inSqm, toFactor);
}

function percentStringFromRatio(ratio: Rational, digits = 2) {
  const pct = mulR(ratio, { n: 100n, d: 1n });
  const scaled = toScaledUnits(pct);
  const rounded = roundScaledToDigits(scaled, Math.max(0, Math.min(6, digits)));
  return `${scaledToDecimalString(rounded, digits, { fixed: true })}%`;
}

function safeEnvIsDev(): boolean {
  try {
    const v = (import.meta as any)?.env?.DEV;
    return Boolean(v);
  } catch {
    return false;
  }
}

export default function Home() {
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

  const [wastePct, setWastePct] = useState<string>(() => {
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
    localStorage.setItem("cc_area", amount);
    localStorage.setItem("cc_from", from);
    localStorage.setItem("cc_to", to);
    localStorage.setItem("cc_unit", currency);
    localStorage.setItem("cc_rate", coverageRate);
    localStorage.setItem("cc_rate_unit", coverageUnit);
    localStorage.setItem("cc_coats", coats);
    localStorage.setItem("cc_waste", wastePct);
    localStorage.setItem("cc_rounding", JSON.stringify(roundForDisplay));
    localStorage.setItem("cc_display_decimals", String(displayDecimals));
  }, [
    amount,
    from,
    to,
    currency,
    coverageRate,
    coverageUnit,
    coats,
    wastePct,
    roundForDisplay,
    displayDecimals,
  ]);

  const hasInput = useMemo(() => amount.trim().length > 0, [amount]);

  const parsed = useMemo(() => {
    const p = parseMoneyToScaled(amount);
    return p;
  }, [amount]);
  const hasCoverageRate = useMemo(
    () => coverageRate.trim().length > 0,
    [coverageRate],
  );

  const rateParsed = useMemo(() => {
    const p = parseMoneyToScaled(coverageRate);
    return p;
  }, [coverageRate]);

  const coatsParsed = useMemo(() => {
    const raw = coats.trim();
    if (!raw) return { ok: false, value: 0 };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, value: 0 };
    const i = Math.floor(n);
    return i >= 1 ? { ok: true, value: i } : { ok: false, value: 0 };
  }, [coats]);

  const wasteParsed = useMemo(() => {
    const p = parseMoneyToScaled(wastePct);
    return p;
  }, [wastePct]);

  const validation = useMemo(() => {
    if (!hasInput)
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
  }, [hasInput, parsed.ok, parsed.error, parsed.scaled]);

  const amountR: Rational | null = useMemo(() => {
    if (!validation.ok || !parsed.ok || parsed.scaled === undefined)
      return null;
    return fromScaledUnits(parsed.scaled);
  }, [validation.ok, parsed.ok, parsed.scaled]);

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
      return { ok: false, message: "Coats must be 1 or more." };

    if (!wasteParsed.ok)
      return {
        ok: false,
        message: wasteParsed.error ?? "Enter a valid waste %.",
      };

    if (wasteParsed.scaled !== undefined && wasteParsed.scaled < 0n)
      return { ok: false, message: "Waste % cannot be negative." };

    return { ok: true, message: "" };
  }, [
    hasCoverageRate,
    rateParsed.ok,
    rateParsed.error,
    rateParsed.scaled,
    coatsParsed.ok,
    wasteParsed.ok,
    wasteParsed.error,
    wasteParsed.scaled,
  ]);

  const estimateR = useMemo(() => {
    if (
      !validation.ok ||
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
      wasteParsed.scaled === undefined ? 0n : wasteParsed.scaled;
    const wasteFrac = divR(fromScaledUnits(wasteRatio), { n: 100n, d: 1n });

    const factor = addR({ n: 1n, d: 1n }, wasteFrac);
    return mulR(withCoats, factor);
  }, [
    validation.ok,
    amountR,
    hasCoverageRate,
    estimatorValidation.ok,
    rateParsed.ok,
    rateParsed.scaled,
    from,
    coverageUnit,
    coatsParsed.value,
    wasteParsed.scaled,
  ]);

  const estimateDisplay = useMemo(() => {
    if (!estimateR) return "—";
    const scaled = toScaledUnits(estimateR);
    const roundedScaled = roundForDisplay
      ? roundScaledToDigits(scaled, displayDecimals)
      : scaled;

    const dec = scaledToDecimalString(roundedScaled, 6, {
      fixed: roundForDisplay ? displayDecimals > 0 : false,
      trimTrailingZeros: !roundForDisplay,
    });

    const num = formatMoneyFromDecimalString(dec, currency, {
      minimumFractionDigits: roundForDisplay ? displayDecimals : 0,
      maximumFractionDigits: roundForDisplay ? displayDecimals : 12,
    });

    const unitLabel =
      CURRENCY_OPTIONS.find((c) => c.code === currency)?.label ?? "Units";

    return `${num} ${unitLabel}`;
  }, [estimateR, roundForDisplay, displayDecimals, currency]);
  const roundingNote = roundForDisplay
    ? `Display rounded to ${displayDecimals} decimals (math stays exact in decimals up to 6 places).`
    : "No display rounding (shown with up to 12 decimals when available).";

  const displayMoney = useMemo(() => {
    if (!rawResultR) return "—";
    const scaled = toScaledUnits(rawResultR);

    const roundedScaled = roundForDisplay
      ? roundScaledToDigits(scaled, displayDecimals)
      : scaled;

    const dec = scaledToDecimalString(roundedScaled, 6, {
      fixed: roundForDisplay ? displayDecimals > 0 : false,
      trimTrailingZeros: !roundForDisplay,
    });

    return formatMoneyFromDecimalString(dec, currency, {
      minimumFractionDigits: roundForDisplay ? displayDecimals : 0,
      maximumFractionDigits: roundForDisplay ? displayDecimals : 12,
    });
  }, [rawResultR, roundForDisplay, displayDecimals, currency]);

  const inputGroupedDisplay = useMemo(() => {
    if (amountFocused) return amount;
    if (!hasInput) return amount;
    if (!parsed.ok || parsed.scaled === undefined) return amount;

    const dec = scaledToDecimalString(parsed.scaled, 6, {
      trimTrailingZeros: true,
    });

    return formatGroupedNumberFromDecimalString(dec, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }, [amountFocused, amount, hasInput, parsed.ok, parsed.scaled]);

  const interpretationLine = useMemo(() => {
    if (!validation.ok || !parsed.ok || parsed.scaled === undefined)
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
  }, [validation.ok, parsed.ok, parsed.scaled, amount, currency]);

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

    const roundedScaled = roundForDisplay
      ? roundScaledToDigits(scaled, displayDecimals)
      : scaled;

    const dec = scaledToDecimalString(roundedScaled, 6, {
      fixed: roundForDisplay ? displayDecimals > 0 : false,
      trimTrailingZeros: !roundForDisplay,
    });

    return formatMoneyFromDecimalString(dec, currency, {
      minimumFractionDigits: roundForDisplay ? displayDecimals : 0,
      maximumFractionDigits: roundForDisplay ? displayDecimals : 12,
    });
  }

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
      const p = parseMoneyToScaled(c);
      if (!p.ok || p.scaled === undefined) {
        // eslint-disable-next-line no-console
        console.warn("[DEV] Parse failed unexpectedly:", c, p.error);
      }
    }

    const a = parseMoneyToScaled("0.1");
    const b = parseMoneyToScaled("0.2");
    if (a.ok && b.ok && a.scaled !== undefined && b.scaled !== undefined) {
      const sum = a.scaled + b.scaled;
      const expected = parseMoneyToScaled("0.3");
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

  const faqData = [
    {
      q: "What does “coverage” mean on this page?",
      a: "Coverage is how much area a given amount of material can cover. For example, paint might cover 350 ft² per gallon, or mulch might be planned as a depth that implies a volume calculation. This page focuses on area conversions and a simple area-per-unit estimate.",
    },
    {
      q: "What does the area converter do?",
      a: "It converts the same area between common units like ft², m², acres, and hectares using exact unit definitions (for example, 1 inch = 0.0254 meters exactly).",
    },
    {
      q: "How does the material estimate work?",
      a: "If you enter a coverage rate (area per unit), we estimate units needed as: (area ÷ coverage) × coats × (1 + waste%). This is a simple estimate and does not account for surface texture, compaction, overlap, or product-specific instructions.",
    },
    {
      q: "Does the calculator preserve decimals?",
      a: "Yes. We parse and compute using decimal-safe math (not floating point). Optional rounding is display-only and clearly labeled.",
    },
    {
      q: "Can I save the results?",
      a: "Yes. Your inputs and display settings are saved locally in your browser so you can come back later.",
    },
    {
      q: "Is this good for paint, soil, mulch, gravel, and concrete?",
      a: "It is useful for the area part of the estimate and for simple coverage rates. For depth-based materials (soil, mulch, gravel, concrete), you may still need a volume calculator based on thickness and material density.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CoverageConverters.com",
    url: "https://www.coverageconverters.com",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coverage Calculator: Area + Material Estimate",
    description:
      "Convert area units and estimate material coverage for paint and bulk materials with decimal-safe input and clear assumptions.",
    url: "https://www.coverageconverters.com",
  };

  const convertSummaryLine = useMemo(() => {
    if (
      !validation.ok ||
      !parsed.ok ||
      parsed.scaled === undefined ||
      !rawResultR
    )
      return "Enter a valid area value to see results.";

    const inputDec = scaledToDecimalString(parsed.scaled, 6, {
      trimTrailingZeros: true,
    });

    const outputScaled = toScaledUnits(rawResultR);

    const outputRounded = roundForDisplay
      ? roundScaledToDigits(outputScaled, displayDecimals)
      : outputScaled;

    const outputDec = scaledToDecimalString(outputRounded, 6, {
      fixed: roundForDisplay ? displayDecimals > 0 : false,
      trimTrailingZeros: !roundForDisplay,
    });

    const inputFormatted = formatMoneyFromDecimalString(inputDec, currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });

    const outputFormatted = formatMoneyFromDecimalString(outputDec, currency, {
      minimumFractionDigits: roundForDisplay ? displayDecimals : 0,
      maximumFractionDigits: roundForDisplay ? displayDecimals : 12,
    });

    return `${inputFormatted} ${PERIOD_LABEL[from].toLowerCase()} ≈ ${outputFormatted} ${PERIOD_LABEL[to].toLowerCase()}.`;
  }, [
    validation.ok,
    parsed.ok,
    parsed.scaled,
    rawResultR,
    roundForDisplay,
    displayDecimals,
    currency,
    from,
    to,
  ]);

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
              #top-links, #bottom-nav, #export-controls { display: none !important; }
              #converter { padding-bottom: 0 !important; }
              .shadow-sm { box-shadow: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <section
        id="converter"
        className="mx-auto max-w-6xl px-6 pb-8 mt-4 sm:mt-8 sm:pb-12"
      >
        <div className="rounded-2xl bg-white sm:shadow-sm sm:border border-slate-200 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-center sm:text-left text-2xl sm:text-3xl md:text-4xl capitalize font-bold text-sky-800 tracking-tight">
              Universal coverage calculator
            </h1>

            <div
              id="export-controls"
              className="sm:mt-6 hidden sm:flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
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

          <p id={decimalsHelpId} className="sr-only">
            Controls how many decimals to show when rounding is enabled.
          </p>

          <div className="grid gap-y-3 gap-x-5 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Area
              </label>
              <div className="flex gap-2">
                <input
                  inputMode="decimal"
                  value={inputGroupedDisplay}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500 or 1250.50"
                  className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                  aria-invalid={!validation.ok}
                  aria-describedby={`${amountHelpId} ${amountStatusId}`}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                  aria-label="Material unit"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
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
              ) : (
                <></>
              )}

              {interpretationLine ? (
                <p className="mt-2 text-sm text-slate-600" aria-live="polite">
                  <span className="font-semibold tabular-nums">
                    {interpretationLine}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="md:col-span-7">
              <div className="grid gap-y-3 gap-x-5 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    From
                  </label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value as Period)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    aria-label="From period"
                  >
                    {PERIOD_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {PERIOD_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex sm:items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFrom(to);
                      setTo(from);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label="Swap from and to"
                  >
                    ⇄
                  </button>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    To
                  </label>
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value as Period)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                    aria-label="To period"
                  >
                    {PERIOD_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {PERIOD_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-sm font-semibold text-slate-800">
              Material estimate settings (optional)
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
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Coverage area unit
                </span>
                <select
                  value={coverageUnit}
                  onChange={(e) => setCoverageUnit(e.target.value as Period)}
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
                  Waste %
                </span>
                <input
                  inputMode="decimal"
                  value={wastePct}
                  onChange={(e) => setWastePct(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400"
                  aria-invalid={!estimatorValidation.ok}
                />
              </label>
            </div>

            {!estimatorValidation.ok ? (
              <p
                className="mt-3 text-sm text-rose-700"
                role="alert"
                aria-live="polite"
              >
                {estimatorValidation.message}
              </p>
            ) : hasCoverageRate ? (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                Estimated needed:{" "}
                <strong className="text-slate-900 tabular-nums whitespace-nowrap">
                  {estimateDisplay}
                </strong>
              </p>
            ) : (
              <></>
            )}
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
                Calculated area
              </div>
            </div>

            <div className="mt-2 flex flex-col">
              <div className="text-3xl sm:text-5xl font-extrabold text-emerald-700 tabular-nums leading-none min-h-[3.25rem] sm:min-h-[4rem]">
                {validation.ok ? (
                  <>
                    {displayMoney}{" "}
                    <span className="text-base font-semibold text-slate-700">
                      {PERIOD_LABEL[to]}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>

              <div className="text-sm text-slate-700 leading-relaxed">
                {validation.ok ? (
                  <></>
                ) : (
                  "Enter a valid area value to see results."
                )}
              </div>
            </div>

            <div className=" grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                id="export-controls"
                className="mb-3 sm:hidden flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
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
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={roundForDisplay}
                  onChange={(e) => setRoundForDisplay(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                />
                Round results for display
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 select-none">
                <span className="sr-only">Display decimals</span>
                <select
                  value={displayDecimals}
                  onChange={(e) =>
                    setDisplayDecimals(safeDisplayDecimals(e.target.value, 2))
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
                  aria-describedby={decimalsHelpId}
                  aria-label="Display decimals"
                >
                  <option value={0}>0 decimals</option>
                  <option value={2}>2 decimals</option>
                  <option value={4}>4 decimals</option>
                  <option value={6}>6 decimals</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3 mb-4 rounded-xl bg-emerald-50 p-4">
            <div className="text-sm text-slate-600 leading-relaxed">
              <span className="font-medium text-slate-700">Assumptions:</span>{" "}
              area unit conversions are based on exact definitions (for example,
              1 inch = 0.0254 meters exactly). Converted values are for
              measurement and estimating, not a substitute for product-specific
              instructions.
            </div>

            <div className="mt-3 text-sm text-slate-600 leading-relaxed">
              <span className="font-medium text-slate-700">
                What is included:
              </span>{" "}
              area conversion. If you add a coverage rate below, the estimate
              uses your inputs and does not account for site conditions or
              product variations.
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              <span className="font-medium text-slate-700">Disclaimer:</span>{" "}
              always follow manufacturer specs and local building guidelines for
              your specific material and project.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-sky-800 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-slate-200">
          {faqData.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold text-lg text-sky-800 flex items-center justify-between hover:text-sky-900">
                <span>{f.q}</span>
                <span className="ml-4 text-slate-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="mt-2 text-slate-700 leading-relaxed max-w-prose">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
