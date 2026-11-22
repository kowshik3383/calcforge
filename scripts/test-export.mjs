import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { siteUrl } from "./prepare-assets.mjs";

const current = load(await readFile("out/sitemap.xml", "utf8"), { xml: true });
const redirects = new Map((await readFile("out/_redirects", "utf8")).trim().split("\n").map(line => {
  const [from, to, status] = line.split(/\s+/);
  return [from, { to, status: Number(status) }];
}));

const sitemap = current("loc").map((_, element) => current(element).text()).get();
const published = new Set(sitemap);
const inventory = JSON.parse(await readFile("migration/legacy-paths.json", "utf8"));
assert.equal(published.size, sitemap.length, "Duplicate sitemap URLs");
assert.ok(inventory.length > 0, "The legacy inventory must contain URLs.");
assert.equal(new Set(inventory).size, inventory.length, "Duplicate legacy paths.");
for (const oldPath of inventory) {
  const path = oldPath.replace(/\.html$/, "");
  assert.ok(published.has(siteUrl + path), oldPath);
  if (oldPath !== path) assert.deepEqual(redirects.get(oldPath), { to: path, status: 301 }, oldPath);
}

const titles = new Set();
const descriptions = new Set();
const legacy = new Set(inventory.map(path => path.replace(/\.html$/, "")));
let toolCount = 0;
let articleCount = 0;
let reciprocalLinks = 0;
for (const url of published) {
  const path = new URL(url).pathname;
  const $ = load(await readFile(path === "/" ? "out/index.html" : `out${path}.html`, "utf8"));
  assert.equal(new URL($('link[rel="canonical"]').attr("href")).href, url);
  assert.equal($("h1").length, 1, url);
  for (const link of $('a[href^="/"]')) {
    const href = new URL($(link).attr("href"), siteUrl);
    if (href.origin === siteUrl) assert.ok(published.has(href.origin + href.pathname), `Broken internal link ${href} on ${url}`);
  }
  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content");
  assert.ok(title && title.length < 60 && !titles.has(title), `Invalid or duplicate title: ${url}`);
  assert.ok(description && description.length < 155 && !descriptions.has(description), `Invalid or duplicate description: ${url}`);
  titles.add(title);
  descriptions.add(description);
  assert.equal($('meta[property="og:title"]').attr("content"), title, url);
  assert.equal($('meta[name="twitter:description"]').attr("content"), description, url);
  assert.equal($('head script[src*="adsbygoogle.js"]').length, 1, url);
  assert.ok($('head meta[name="google-site-verification"]').attr("content"), url);
  assert.equal($('meta[name="keywords"]').length, 0, url);
  const schemas = $('script[type="application/ld+json"]').map((_, tag) => JSON.parse($(tag).text())).get();
  const types = schemas.flatMap(schema => schema["@graph"] || [schema]).flatMap(schema => schema["@type"]);
  assert.ok(types.includes("BreadcrumbList"), url);
  if ($('meta[property="og:type"]').attr("content") === "article") {
    articleCount++;
    assert.ok(types.includes("Article") || types.includes("BlogPosting"), url);
    assert.ok($('main a[href^="/tools/"]').length > 0, `Missing contextual tool link: ${url}`);
  }
  if (path.startsWith("/tools/")) {
    toolCount++;
    const slots = $("main .calculator-ad ins.adsbygoogle");
    const slot = process.env.ADSENSE_TOOL_SLOT;
    assert.equal(slots.length, slot ? 1 : 0, url);
    if (slot) assert.equal(slots.attr("data-ad-slot"), slot, url);
    for (const guide of $("[data-related-guides] a").toArray()) {
      const guidePath = $(guide).attr("href");
      const guidePage = load(await readFile(`out${guidePath}.html`, "utf8"));
      assert.ok(guidePage(`main a[href="${path}"]`).length, `Missing calculator link back from ${guidePath} to ${path}`);
      reciprocalLinks++;
    }
    if (legacy.has(path)) assert.equal($("#tool-form").attr("data-tool"), path.split("/").at(-1), url);
    assert.ok(types.includes("WebApplication") && types.includes("FAQPage"), url);
    assert.ok($("[data-tool-editorial] h2").toArray().some(heading => $(heading).text() === "Related calculators"), url);
    const faqs = $("[data-tool-editorial] details").length;
    assert.ok(faqs >= 4 && faqs <= 6, `FAQ count ${faqs}: ${url}`);
    const content = $("[data-tool-editorial] :is(p,h2,h3,summary,li)").map((_, tag) => $(tag).text()).get().join(" ");
    const words = content.match(/\S+/g).length;
    assert.ok(words >= 300 && words <= 600, `Word count ${words}: ${url}`);
  }
}
assert.ok(reciprocalLinks > 0, "No contextual calculator-to-guide links");
assert.deepEqual(redirects.get("/index.html"), { to: "/", status: 301 });
assert.equal(await readFile("out/google017a65e37914063f.html", "utf8"),
  await readFile("public/google017a65e37914063f.html", "utf8"));
assert.match(await readFile("out/robots.txt", "utf8"), /Sitemap: https:\/\/measureforge\.pages\.dev\/sitemap\.xml/);
assert.match(await readFile("out/ads.txt", "utf8"), /^google\.com, pub-\d{16}, DIRECT, f08c47fec0942fa0\n$/);
assert.match(await readFile("out/404.html", "utf8"), /<h1[ >]/);
console.log(`Verified ${published.size} sitemap pages, including ${inventory.length} legacy URLs, ${toolCount} tools and ${articleCount} guides.`);
console.log(`Verified ${redirects.size} redirect/verification rules, metadata, structured data, AdSense and tool word counts.`);
