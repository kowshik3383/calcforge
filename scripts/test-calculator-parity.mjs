import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const baselineCommit = "1b678a7504cecf50892f2af49915262581520baa";
const baseline = await mkdtemp(join(tmpdir(), "measureforge-baseline-"));
async function prepareBaseline() {
  const archive = execFileSync("git", ["archive", baselineCommit, "static-site"], { maxBuffer: 16 * 1024 * 1024 });
  execFileSync("tar", ["-xf", "-", "-C", baseline], { input: archive });
  execFileSync(process.execPath, ["static-site/build.mjs"], {
    cwd: baseline, env: { ...process.env, SITE_URL: "https://measureforge.pages.dev" },
  });
  return join(baseline, "static-site/dist");
}

const contentTypes = { ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

async function serve(folder) {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const filename = pathname === "/" ? "/index.html" : (extname(pathname) ? pathname : pathname + ".html");
    try {
      const data = await readFile(join(folder, filename));
      response.writeHead(200, { "Content-Type": contentTypes[extname(filename)] || "application/octet-stream" });
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

function samples(tool) {
  const defaults = Object.fromEntries(tool.inputs.map(field => [field.key,
    field.defaultValue ?? (field.type === "checkbox" ? false : field.options?.[0]?.value ?? 0)]));
  const examples = tool.examples.map(example => ({ ...defaults, ...example.inputs }));
  const seed = examples[0] ?? defaults;
  const candidates = [...examples, defaults, ...[0.9, 1.1, 0.7, 1.3].map(multiplier => {
    return Object.fromEntries(tool.inputs.map(field => {
      if (field.type !== "number") return [field.key, seed[field.key]];
      const original = Number(seed[field.key]);
      const scaled = original > 0 ? original * multiplier : multiplier < 1 ? original : original + multiplier;
      const rounded = field.step === 1 ? Math.round(scaled) : Number(scaled.toPrecision(10));
      return [field.key, Math.max(field.min ?? -Infinity, Math.min(field.max ?? Infinity, rounded))];
    }));
  })];
  const distinct = new Map(candidates.map(values => [JSON.stringify(values), values]));
  const valid = [...distinct.values()].filter(values =>
    tool.calculate(values).some(row => row.badge !== "warning") &&
    tool.inputs.every(field => field.type !== "number" || (
      Number(values[field.key]) >= (field.min ?? -Infinity) &&
      Number(values[field.key]) <= (field.max ?? Infinity) &&
      (field.step !== 1 || Number.isInteger(Number(values[field.key])))
    )));
  assert.ok(valid.length >= 3, `Three valid distinct inputs required for ${tool.slug}`);
  return valid.slice(0, 3);
}

async function calculate(page, formSelector, resultSelector, values) {
  await page.evaluate(({ formSelector, values }) => {
    const form = document.querySelector(formSelector);
    for (const [key, value] of Object.entries(values)) {
      const field = form.elements.namedItem(key);
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = String(value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (!form.checkValidity()) throw Error(`Sample fails browser validation: ${JSON.stringify(values)}`);
    form.requestSubmit();
  }, { formSelector, values });
  const result = await page.locator(resultSelector).innerText();
  assert.ok(result.trim() && !/will appear|enter measurements|calculate again/i.test(result), result);
  return result;
}

let legacy;
let next;
let browser;
try {
  const baselineOutput = await prepareBaseline();
  const { ALL_TOOLS } = await import(pathToFileURL(join(baselineOutput, "catalog/tools/index.mjs")).href);
  legacy = await serve(baselineOutput);
  next = await serve("out");
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"] });
  const context = await browser.newContext({ locale: "en-IN" });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1:)/, route => route.abort());
  const catalog = await context.newPage();
  await catalog.goto(next.origin + "/calculators");
  const search = catalog.getByRole("searchbox", { name: "Search calculators" });
  await search.fill("flooring");
  const visibleTools = catalog.locator("#catalog li:visible");
  assert.ok(await visibleTools.count() > 0, "Flooring should match calculator pages.");
  assert.equal(await visibleTools.filter({ hasText: /grain/i }).count(), 0);
  await search.fill("zzzz-no-calculator");
  assert.equal(await visibleTools.count(), 0);
  await search.fill("");
  assert.ok(await visibleTools.count() >= ALL_TOOLS.length);
  await catalog.close();

  const planner = await context.newPage();
  await planner.goto(next.origin + "/planners/flooring");
  await planner.getByRole("button", { name: "Add room", exact: true }).click();
  await planner.getByRole("button", { name: "Compare products", exact: true }).click();
  await planner.getByText("40 m² to cover across 2 room(s).").waitFor();
  await planner.getByRole("button", { name: "Save estimate", exact: true }).click();
  await planner.getByLabel("Project name").fill("Test house");
  await planner.getByRole("button", { name: "Save on this device" }).click();
  await planner.getByText("Saved Test house on this device.").waitFor();
  await planner.reload();
  await planner.getByLabel("Saved projects").selectOption({ label: "Test house" });
  await planner.getByRole("button", { name: "Open project" }).click();
  await planner.getByRole("group", { name: "Room 2" }).waitFor();
  await planner.getByRole("button", { name: "Compare products", exact: true }).click();
  await planner.getByText("40 m² to cover across 2 room(s).").waitFor();

  await planner.setViewportSize({ width: 390, height: 844 });
  await planner.goto(next.origin + "/planners/archery");
  await planner.getByLabel("Arrow scores separated by spaces or commas").fill("X, 8, M");
  await planner.getByRole("button", { name: "Review scorecard", exact: true }).click();
  await planner.getByText(/18\/600 · 3\/60 arrows · 1 Xs/).waitFor();
  await planner.getByRole("button", { name: "Save and share", exact: true }).click();
  await planner.getByRole("button", { name: "Save on this device" }).click();
  await planner.getByRole("button", { name: "New project" }).click();
  await planner.getByText("Practice history (1)").click();
  await planner.getByRole("cell", { name: "18", exact: true }).waitFor();
  await planner.close();

  const jobs = ALL_TOOLS.map(tool => ({
    name: tool.slug, path: "/tools/" + tool.slug, form: "#tool-form",
    result: "#tool-result", samples: samples(tool),
  }));
  const featured = [
    { name: "featured field-area calculator", path: "/calculators", form: '[data-calculator="field"]',
      result: "#field-result", samples: [{ length: 120, width: 80 }, { length: 100, width: 60 }, { length: 12.5, width: 8 }] },
    { name: "featured flooring calculator", path: "/calculators", form: '[data-calculator="material"]',
      result: "#material-result",
      samples: [{ area: 24, coverage: 2.2, waste: 10 }, { area: 10, coverage: 2, waste: 0 }, { area: 21, coverage: 4, waste: 15 }] },
  ];
  jobs.push(...featured);
  for (const tool of jobs) {
    if (tool.name === "flooring-pack-calculator" || tool.name === "raised-bed-soil-calculator") {
      tool.samples = tool.samples.map(values => ({ ...values, "purchase-price": 400,
        "purchase-delivery": 75, "purchase-currency": "INR",
        ...(tool.name === "raised-bed-soil-calculator" ? { "purchase-capacity": 40 } : {}),
      }));
    }
  }
  let index = 0;
  const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
    const [oldPage, newPage] = await Promise.all([context.newPage(), context.newPage()]);
    try {
      while (index < jobs.length) {
        const { name, path, form, result, samples: cases } = jobs[index++];
        const [oldResponse, newResponse] = await Promise.all([
          oldPage.goto(legacy.origin + path + ".html"), newPage.goto(next.origin + path),
        ]);
        assert.equal(oldResponse?.status(), 200, name);
        assert.equal(newResponse?.status(), 200, name);
        await Promise.all([oldPage, newPage].map(page => page.locator(form + " button").waitFor()));
        for (const values of cases) {
          const [oldResult, newResult] = await Promise.all([
            calculate(oldPage, form, result, values), calculate(newPage, form, result, values),
          ]);
          assert.equal(newResult, oldResult, `${name} ${JSON.stringify(values)}`);
          if ("purchase-price" in values) assert.match(newResult, /Estimated order cost.*₹/s, name);
        }
      }
    } finally {
      await Promise.all([oldPage.close(), newPage.close()]);
    }
  }));
  for (const result of results) if (result.status === "rejected") throw result.reason;
  console.log(`Matched ${jobs.length * 3} browser results across ${jobs.length} calculator forms.`);
} finally {
  await browser?.close();
  legacy?.server.close();
  next?.server.close();
  await rm(baseline, { recursive: true, force: true });
}
