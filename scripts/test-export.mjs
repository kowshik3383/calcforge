import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { siteUrl } from "./prepare-legacy.mjs";

const xml = path => readFile(path, "utf8").then(text => load(text, { xml: true }));
const current = await xml("out/sitemap.xml");
const redirects = new Map((await readFile("out/_redirects", "utf8")).trim().split("\n").map(line => {
  const [from, to, status] = line.split(/\s+/);
  return [from, { to, status: Number(status) }];
}));

const published = new Set(current("loc").map((_, element) => current(element).text()).get());
const inventory = JSON.parse(await readFile("migration/legacy-paths.json", "utf8"));
const oldUrls = new Set(inventory.map(path => siteUrl + path));
assert.equal(oldUrls.size, inventory.length, "The live inventory must not contain duplicate URLs.");
assert.ok(oldUrls.size > 0, "The old sitemap must contain URLs.");
assert.equal(published.size, oldUrls.size, "The export must cover every old sitemap URL.");
for (const url of oldUrls) {
  const oldPath = new URL(url).pathname;
  const path = oldPath.replace(/\.html$/, "");
  const canonical = siteUrl + path;
  assert.ok(published.has(canonical), url);
  if (oldPath !== path) assert.deepEqual(redirects.get(oldPath), { to: path, status: 301 }, url);
  const $ = load(await readFile(path === "/" ? "out/index.html" : `out${path}.html`, "utf8"));
  assert.equal(new URL($('link[rel="canonical"]').attr("href")).href, canonical, url);
  assert.equal($("h1").length, 1, url);
  assert.ok($("title").text(), url);
  assert.ok($('meta[name="description"]').attr("content"), url);
  if (path.startsWith("/tools/")) {
    assert.equal($("#tool-form").attr("data-tool"), path.split("/").at(-1), url);
  }
}
assert.deepEqual(redirects.get("/index.html"), { to: "/", status: 301 });
assert.equal(await readFile("out/google017a65e37914063f.html", "utf8"),
  await readFile("static-site/google017a65e37914063f.html", "utf8"));
assert.match(await readFile("out/robots.txt", "utf8"), /Sitemap: https:\/\/measureforge\.pages\.dev\/sitemap\.xml/);
assert.match(await readFile("out/404.html", "utf8"), /<h1[ >]/);
console.log(`Verified ${published.size} indexed routes and ${redirects.size} redirect/verification rules.`);
