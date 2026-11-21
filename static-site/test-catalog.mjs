import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { compileCatalog, generateCatalog } from "./build-catalog.mjs";

const folder = await mkdtemp(join(tmpdir(), "calcforge-catalog-"));
try {
  const markup = await readFile(new URL("./calculators.html", import.meta.url), "utf8");
  const base = "https://calcforge.test/demo";
  await writeFile(join(folder, "calculators.html"), markup.replaceAll("https://example.com", base));
  await writeFile(join(folder, "sitemap.xml"), "<urlset>\n</urlset>");
  const { allTools } = await compileCatalog(folder);
  const { MEASUREMENT_EXAMPLES } = await import(pathToFileURL(join(folder, "catalog/tools/measurements.mjs")));
  assert.equal(allTools().length, 107);
  assert.equal(MEASUREMENT_EXAMPLES.length, 83);
  assert.equal(new Set(allTools().map(tool => tool.slug)).size, 107);
  for (const [slug, expected] of MEASUREMENT_EXAMPLES) {
    const tool = allTools().find(x => x.slug === slug);
    const inputs = tool.examples[0].inputs;
    const result = tool.calculate(inputs)[0];
    assert.equal(result.badge, "success", slug);
    assert.ok(Math.abs(result.value - expected) <= Math.max(1e-8, Math.abs(expected) * 1e-8), slug);
    assert.equal(tool.calculate({ ...inputs, [tool.inputs[0].key]: "" })[0].badge, "warning", slug);
    assert.equal(tool.calculate({ ...inputs, [tool.inputs[0].key]: Infinity })[0].badge, "warning", slug);
  }
  await generateCatalog(folder, base);
  const sitemap = await readFile(join(folder, "sitemap.xml"), "utf8");
  const index = await readFile(join(folder, "calculators.html"), "utf8");
  for (const tool of allTools()) {
    const route = `tools/${tool.slug}.html`;
    const html = await readFile(join(folder, route), "utf8");
    assert.ok(index.includes(`href="${route}"`), route);
    assert.ok(sitemap.includes(`<loc>${base}/${route}</loc>`), route);
    assert.ok(html.includes(`rel="canonical" href="${base}/${route}"`), route);
    assert.ok(html.includes('src="../catalog-form.mjs"'), route);
  }
  console.log("107 routes and metadata validated; 83 worked examples and invalid inputs passed.");
} finally {
  await rm(folder, { recursive: true, force: true });
}
