import { purchaseTools } from "./purchase-estimate.mjs";
import { stripTypeScriptTypes } from "node:module";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const assets = dirname(fileURLToPath(import.meta.url));
const categoryNames = {
  agriculture: "Agriculture and gardening", construction: "Construction and home projects",
  manufacturing: "Workshop and materials", "animal-care": "Animal care", conversions: "Units and conversions",
};
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const toolUrl = slug => `tools/${slug}.html`;
const schema = data => JSON.stringify(data).replaceAll("<", "\\u003c");
const write = (path, text) => writeFile(path, text, "utf8");

export async function compileCatalog(output) {
  const launch = join(output, "catalog");
  await mkdir(join(launch, "tools"), { recursive: true });
  const files = ["calculator.ts", ...(await readdir(join(assets, "catalog/tools"))).map(name => "tools/" + name)];
  for (const file of files) {
    const content = await readFile(join(assets, "catalog", file), "utf8");
    const js = stripTypeScriptTypes(content).replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, "$1$2.mjs$3");
    await write(join(launch, file.replace(/\.ts$/, ".mjs")), js);
  }
  return import(pathToFileURL(join(launch, "tools/index.mjs")));
}

function formField(field) {
  const { key, label, defaultValue, unitLabel, hint, type, options, min, max, step } = field;
  const id = "input-" + key;
  const attributes = `id="${escape(id)}" name="${escape(key)}"${hint ? ` aria-describedby="${escape(id)}-hint"` : ""}`;
  let input;
  if (type === "select") {
    input = `<select ${attributes} required>${(options || []).map(option => `<option value="${escape(option.value)}"${String(defaultValue) === String(option.value) ? " selected" : ""}>${escape(option.label)}</option>`).join("")}</select>`;
  } else if (type === "checkbox") {
    input = `<input ${attributes} type="checkbox"${defaultValue ? " checked" : ""}>`;
  } else {
    input = `<input ${attributes} type="number" inputmode="decimal" required step="${escape(step === 1 ? 1 : "any")}"${min == null ? "" : ` min="${escape(min)}"`}${max == null ? "" : ` max="${escape(max)}"`} value="${escape(defaultValue ?? "")}">`;
  }
  return `<div class="field"><label for="${escape(id)}">${escape(label)}${unitLabel ? ` (${escape(unitLabel)})` : ""}</label>${input}${hint ? `<small id="${escape(id)}-hint">${escape(hint)}</small>` : ""}</div>`;
}

function purchaseFields(config) {
  if (!config) return "";
  const bag = config.unit === "bag";
  return `<fieldset class="purchase-fields"><legend>Optional purchase estimate</legend>
    ${bag ? '<div class="field"><label for="purchase-capacity">Bag volume (L)</label><input id="purchase-capacity" name="purchase-capacity" type="number" inputmode="decimal" min="0.01" max="10000" step="any" placeholder="40"></div>' : ""}
    <div class="field"><label for="purchase-price">Price per ${config.unit}</label><input id="purchase-price" name="purchase-price" type="number" inputmode="decimal" min="0" max="100000000" step="any"></div>
    <div class="field"><label for="purchase-delivery">Delivery charge</label><input id="purchase-delivery" name="purchase-delivery" type="number" inputmode="decimal" min="0" max="100000000" step="any"></div>
    <div class="field"><label for="purchase-currency">Currency</label><select id="purchase-currency" name="purchase-currency"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
  </fieldset>`;
}

function supplierSection(config) {
  if (!config) return "";
  const affiliate = process.env[config.affiliateEnv]?.trim();
  const target = new URL(affiliate || config.supplierUrl);
  if (target.protocol !== "https:" || target.username || target.password) {
    throw new Error(config.affiliateEnv + " must be an HTTPS URL without credentials.");
  }
  return `<section id="purchase-supplier" class="card purchase-supplier" aria-labelledby="supplier-heading" hidden>
    <h2 id="supplier-heading">Check supplier options</h2>
    <p>${escape(config.supplierNote)}</p>
    ${affiliate ? "<p>Affiliate disclosure: CalcForge may earn a commission if you buy through this link.</p>" : ""}
    <p><a href="${escape(target.href)}" data-supplier="${affiliate ? "affiliate" : "direct"}"${affiliate ? ' rel="sponsored"' : ""}>${affiliate ? "Visit supplier (affiliate link)" : escape(config.supplierName)} ↗</a></p>
  </section>`;
}

function article(template, tool, base, registry) {
  const purchase = purchaseTools[tool.slug];
  const canonical = `${base}/${toolUrl(tool.slug)}`;
  const title = tool.seo.h1 + " | CalcForge";
  const desc = tool.seo.metaDescription;
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base + "/" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: base + "/calculators.html" },
      { "@type": "ListItem", position: 3, name: tool.title, item: canonical },
    ],
  };
  const related = tool.related.flatMap(slug => registry.has(slug) ? [registry.get(slug)] : []);
  const examples = tool.examples.map(example => `<div><h3>${escape(example.title)}</h3><p>${escape(example.note)}</p></div>`).join("");
  const details = tool.faqs.map(faq => `<details><summary>${escape(faq.q)}</summary><p>${escape(faq.a)}</p></details>`).join("");
  const body = `<main id="content" tabindex="-1"><article class="section wrap">
  <nav aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="../calculators.html">Calculators</a></nav>
  <h1 class="page-title">${escape(tool.seo.h1)}</h1><p class="intro">${escape(tool.description)}</p>
  <div class="grid">
    <form class="card" id="tool-form" data-tool="${escape(tool.slug)}">
      <fieldset disabled><legend>Enter measurements</legend>${tool.inputs.map(formField).join("")}${purchaseFields(purchase)}<button class="btn">Calculate</button></fieldset>
    </form>
    <div class="card"><h2 class="page-title">Result</h2><div id="tool-result" role="status">Enter measurements to calculate a result.</div></div>
  </div>
  ${supplierSection(purchase)}
  <noscript><p>JavaScript is required to run the calculator. The formula and worked examples are below.</p></noscript>
  <div class="prose"><h2>Formula</h2><p>${escape(tool.formula)}</p>
    <h2>Worked examples</h2>${examples}
    <h2>Questions and assumptions</h2>${details}
    ${related.length ? `<h2>Related calculators</h2><ul>${related.map(other => `<li><a href="${escape(other.slug)}.html">${escape(other.title)}</a></li>`).join("")}</ul>` : ""}
    ${purchase ? `<h2>Buying guides</h2><ul>${purchase.guides.map(([path, label]) => `<li><a href="../${escape(path)}">${escape(label)}</a></li>`).join("")}</ul>` : ""}
    <p><a href="../blog.html">Browse measurement and estimating guides</a></p>
  </div></article></main>`;
  return template
    .replace(/(href|src)="(?!https?:|#|\/)([^"]+)"/g, '$1="../$2"')
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(title)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/g, (_, prefix) => prefix + escape(desc))
    .replace(/(<meta property="og:title" content=")[^"]*/, (_, prefix) => prefix + escape(title))
    .replace(/((?:rel="canonical" href|property="og:url" content)=")[^"]*/g, (_, prefix) => prefix + escape(canonical))
    .replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, start, end) => start + schema(breadcrumb) + end)
    .replace(/<main\b[\s\S]*?<\/main>/, () => body)
    .replace("</body>", '<script type="module" src="../catalog-form.mjs"></script>\n</body>');
}

export async function generateCatalog(output, base) {
  const { ALL_TOOLS: tools } = await compileCatalog(output);
  const registry = new Map(tools.map(tool => [tool.slug, tool]));
  if (registry.size !== tools.length) throw Error("Duplicate calculator slug");
  const templatePath = join(output, "calculators.html");
  const template = await readFile(templatePath, "utf8");
  if (!template.includes("<!-- calculator-catalog -->")) throw Error("Calculator catalog marker is missing.");

  await mkdir(join(output, "tools"), { recursive: true });
  await Promise.all(tools.map(tool => write(join(output, toolUrl(tool.slug)), article(template, tool, base, registry))));
  const groups = Object.entries(categoryNames).map(([category, label]) =>
    `<section class="guide-group"><h2>${label}</h2><ul class="catalog-list">${tools.filter(tool => tool.category === category).map(
      tool => `<li><a href="${toolUrl(tool.slug)}">${escape(tool.title)}</a></li>`
    ).join("")}</ul></section>`
  ).join("");
  await write(templatePath, template.replace("<!-- calculator-catalog -->", `<div id="catalog"><h2>All ${tools.length} calculators</h2>${groups}</div>`));
  const sitemapPath = join(output, "sitemap.xml");
  const sitemap = await readFile(sitemapPath, "utf8");
  await write(sitemapPath, sitemap.replace("</urlset>", tools.map(
    tool => `  <url><loc>${escape(base + "/" + toolUrl(tool.slug))}</loc></url>`
  ).join("\n") + "\n</urlset>"));
  for (const name of ["catalog-form.mjs", "purchase-estimate.mjs"]) {
    await write(join(output, name), await readFile(join(assets, name), "utf8"));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , folder, siteUrl] = process.argv;
  if (!folder || !siteUrl) throw Error("Supply the publish folder and site URL.");
  await generateCatalog(resolve(folder), siteUrl.replace(/\/+$/, ""));
}
