import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.PAGES_PREVIEW_URL || "http://127.0.0.1:8791";
const inventory = JSON.parse(await readFile("migration/legacy-paths.json", "utf8"));
const paths = [...inventory.filter(path => path.endsWith(".html")), "/index.html"];
let index = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (index < paths.length) {
    const path = paths[index++];
    const target = path === "/index.html" ? "/" : path.slice(0, -5);
    const redirect = await fetch(origin + path, { redirect: "manual" });
    assert.equal(redirect.status, 301, path);
    assert.equal(new URL(redirect.headers.get("location"), origin).pathname, target, path);
    await redirect.arrayBuffer();
    const page = await fetch(origin + target, { redirect: "manual" });
    assert.equal(page.status, 200, target);
    await page.arrayBuffer();
  }
}));
const verification = await fetch(origin + "/google017a65e37914063f.html", { redirect: "manual" });
assert.equal(verification.status, 200);
assert.match(await verification.text(), /google-site-verification: google017a65e37914063f.html/);
assert.equal((await fetch(origin + "/nonexistent-test-route", { redirect: "manual" })).status, 404);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
try {
  const context = await browser.newContext({ locale: "en-IN" });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1:)/, route => route.abort());
  const page = await context.newPage();
  const scenarios = [
    ["/tools/feet-to-metres", { quantity: "10" }, /10 feet = 3\.048 metres/],
    ["/tools/square-yards-to-square-metres", { quantity: "100" }, /100 square yards = 83\.612736 square metres/],
    ["/tools/gunta-to-square-feet", { quantity: "1" }, /1 gunta = 1,089 square feet/],
    ["/tools/cent-to-acres", { quantity: "25" }, /25 cent = 0\.25 acres/],
    ["/tools/bigha-to-square-feet", { quantity: "2", localSize: "10000" }, /2 bigha = 20,000 square feet/],
    ["/tools/fahrenheit-to-celsius", { quantity: "32" }, /32 Fahrenheit = 0 Celsius/],
    ["/tools/celsius-to-fahrenheit", { quantity: "-40" }, /-40 Celsius = -40 Fahrenheit/],
    ["/tools/flooring-for-10x10-room", { coverage: "18", waste: "8" }, /100 sq ft before allowance · 108 sq ft including allowance · 6 boxes/],
    ["/tools/flooring-for-12x12-room", { coverage: "22", waste: "10" }, /144 sq ft before allowance · 158\.4 sq ft including allowance · 8 boxes/],
    ["/tools/flooring-for-12x15-room", { coverage: "24", waste: "12" }, /180 sq ft before allowance · 201\.6 sq ft including allowance · 9 boxes/],
  ];
  for (const [path, values, expected] of scenarios) {
    assert.equal((await page.goto(origin + path))?.status(), 200, path);
    const form = page.locator("main form");
    for (const [name, value] of Object.entries(values)) {
      await form.locator(`input[name="${name}"]`).fill(value);
    }
    await form.getByRole("button", { name: "Calculate" }).click();
    await page.waitForFunction(expression =>
      new RegExp(expression).test(document.querySelector("main [role=status]")?.textContent ?? ""), expected.source);
    assert.match(await page.locator("main [role=status]").innerText(), expected, path);
  }
  console.log(`Verified ${paths.length} live-style redirects, Google verification, 404 handling and ${scenarios.length} new calculator results in Wrangler.`);
} finally {
  await browser.close();
}
