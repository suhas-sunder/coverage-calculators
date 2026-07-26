import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const canonicalPaths = [
  "/calculators",
  "/paint-coverage-calculator",
  "/mulch-coverage-calculator",
  "/gravel-coverage-calculator",
  "/topsoil-coverage-calculator",
  "/compost-coverage-calculator",
  "/about",
  "/contact",
  "/methodology",
  "/editorial-policy",
  "/corrections-policy",
  "/privacy-policy",
  "/terms-of-service",
  "/disclaimer",
  "/accessibility",
  "/cookies",
  "/sitemap",
];

test("public routes are registered and included once in the XML sitemap", async () => {
  const [routes, sitemap] = await Promise.all([
    read("app/routes.ts"),
    read("public/sitemap.xml"),
  ]);

  for (const path of canonicalPaths) {
    assert.ok(
      routes.includes(`\"${path.slice(1)}\"`),
      `${path} should be registered`,
    );
    assert.equal(
      sitemap.split(`https://www.coveragecalculators.com${path}`).length - 1,
      1,
      `${path} should appear once`,
    );
  }

  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.ok(locations.every((location) => !location.includes("?") && !location.includes("&")));
  assert.ok(!locations.includes("https://www.coveragecalculators.com/terms"));
  assert.ok(!locations.includes("https://www.coveragecalculators.com/coverage-calculator"));
  assert.equal(new Set(locations).size, 18);
});

test("robots declares one production sitemap and no placeholder host", async () => {
  const robots = await read("public/robots.txt");
  assert.equal((robots.match(/^Sitemap:/gm) ?? []).length, 1);
  assert.match(robots, /Sitemap: https:\/\/www\.coveragecalculators\.com\/sitemap\.xml/);
  assert.doesNotMatch(robots, /yourdomain|Disallow: \/build|Disallow: \/assets/);
});

test("SEO helper supports canonical metadata and injection-safe JSON-LD", async () => {
  const seo = await read("app/lib/seo.ts");
  assert.match(seo, /rel: \"canonical\"/);
  assert.match(seo, /property: \"og:url\"/);
  assert.match(seo, /replace\(\/<\/g, \"\\\\u003c\"\)/);
  assert.match(seo, /replace\(\/>\/g, \"\\\\u003e\"\)/);
  assert.match(seo, /replace\(\/&\/g, \"\\\\u0026\"\)/);
});

test("ad architecture defines every requested placement and hides unconfigured production slots", async () => {
  const adSlot = await read("app/client/components/advertising/AdSlot.tsx");
  for (const placement of [
    "top-banner",
    "sidebar-left",
    "sidebar-right",
    "after-utility",
    "seo-content-square",
    "all-tools-banner",
  ]) {
    assert.match(adSlot, new RegExp(`\\"${placement}\\"`));
  }
  assert.match(adSlot, /if \(!providerContent && !showPlaceholder\) return null/);
  assert.match(adSlot, /VITE_SHOW_AD_PLACEHOLDERS/);
});

test("protected material shape previews retain their layout invariants", async () => {
  for (const calculator of ["mulch", "gravel", "topsoil", "compost"]) {
    const preview = await read(
      `app/client/components/${calculator}-coverage-calculator/ShapePreview.tsx`,
    );
    assert.match(preview, /viewBox=\"0 0 280 180\"/);
    assert.match(preview, /className=\"w-full h-\[150px\]\"/);
    assert.match(preview, /className=\"scale-\[1\.1\]\"/);
    assert.match(preview, /min-w-\[320px\]/);
  }
});

test("metadata does not reference nonexistent social preview files", async () => {
  const files = [
    "app/routes/home.tsx",
    "app/routes/mulch-coverage-calculator.tsx",
    "app/routes/gravel-coverage-calculator.tsx",
    "app/routes/topsoil-coverage-calculator.tsx",
    "app/routes/compost-coverage-calculator.tsx",
  ];
  const content = (await Promise.all(files.map(read))).join("\n");
  assert.doesNotMatch(content, /og-image\.jpg|\/og\/coveragecalculators/);
});
