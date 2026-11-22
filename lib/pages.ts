import { load } from "cheerio";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { breadcrumb, faqSchema, home, pageMetadata } from "./seo";
import { canonicalPath, siteUrl } from "./site";
import { categories, tools } from "./tools";

const content = join(process.cwd(), "content/pages");
export const pageSlugs = readdirSync(content)
  .filter(file => file.endsWith(".html") && !["index.html", "404.html", "google017a65e37914063f.html"].includes(file))
  .map(file => file.slice(0, -5));

const genericWords = new Set(["the", "and", "calculator", "how", "for", "your", "you", "from", "with", "use", "area", "volume"]);
function tokens(text: string) {
  return new Set(text.toLowerCase().match(/[a-z]{3,}/g)?.filter(word => !genericWords.has(word)) ?? []);
}

const guideTools: Record<string, string[]> = {
  "check-your-units": ["square-feet-to-square-metres-calculator", "cubic-metres-to-litres-calculator"],
  "estimate-supplier-quote-checklist": ["flooring-pack-calculator", "soil-bag-count-calculator"],
  "materials-estimate-version-log": ["flooring-pack-surplus-calculator", "bulk-fill-volume-calculator"],
  "measure-a-field": ["field-area-calculator", "triangular-field-area-calculator"],
  "measure-project-in-stages": ["floor-area-with-alcove-calculator", "horizontal-run-from-slope-calculator"],
  "workbench-mat-area": ["floor-area-with-alcove-calculator", "square-feet-to-square-metres-calculator"],
};

function suggestedTools(slug: string, title: string, body: string) {
  if (guideTools[slug]) return guideTools[slug].flatMap(id => tools.find(tool => tool.slug === id) ?? []);
  const headingWords = tokens(title + " " + slug.replaceAll("-", " "));
  const bodyWords = tokens(body);
  return tools.map(tool => {
    const words = [...tokens(tool.title)];
    const score = words.reduce((total, word) => total + (headingWords.has(word) ? 4 : bodyWords.has(word) ? 1 : 0), 0);
    return { tool, score: score / Math.max(words.length, 2) + (slug === tool.slug ? 10 : 0) };
  }).filter(item => item.score >= 0.8)
    .sort((first, second) => second.score - first.score).slice(0, 2).map(item => item.tool);
}

export const readPage = cache((file: string) => {
  const source = readFileSync(join(content, file), "utf8").replaceAll("https://example.com", siteUrl).replaceAll("CalcForge", "MeasureForge").replaceAll("CALCFORGE", "MEASUREFORGE");
  const $ = load(source);
  const title = $("title").text().replace(/ \| MeasureForge$/, "");
  const description = $('meta[name="description"]').attr("content") || "Browse MeasureForge calculators and measurement guides.";
  const canonical = $('link[rel="canonical"]').attr("href");
  const path = canonicalPath(new URL(canonical || "/", siteUrl).pathname);
  const article = $('meta[property="og:type"]').attr("content") === "article";
  const metadata = pageMetadata(title, description, path, article);

  $("body a[href]").each((_, element) => {
    const link = $(element);
    const href = link.attr("href")!;
    if (href.startsWith("#") || href.startsWith("?")) return;
    const target = new URL(href, new URL(file, siteUrl));
    if (target.origin === siteUrl) {
      link.attr("href", canonicalPath(target.pathname) + target.search + target.hash);
    }
  });
  $("#menu-toggle").removeAttr("hidden");
  $("header #main-menu").append('<li><a href="/categories">Categories</a></li>');
  if (file === "calculators.html") {
    const catalog = $('<div id="catalog"><p><a href="/categories">Browse calculators by category and unit</a></p></div>');
    catalog.append($("<h2>").text(`All ${tools.length} calculators`));
    for (const [slug, category] of Object.entries(categories)) {
      const section = $('<section class="guide-group"><h2></h2><ul class="catalog-list"></ul></section>');
      section.find("h2").text(category.title);
      for (const tool of tools.filter(tool => tool.category === slug)) {
        section.find("ul").append($("<li>").append($("<a>").attr("href", `/tools/${tool.slug}`).text(tool.title)));
      }
      catalog.append(section);
    }
    const marker = $("main > section").contents().filter((_, node) => node.type === "comment" && node.data.trim() === "calculator-catalog");
    if (marker.length !== 1) throw new Error("Expected one calculator catalog marker.");
    marker.replaceWith(catalog);
  }
  if (article) {
    const candidates = suggestedTools(file.slice(0, -5), title, $("main").text());
    if (candidates.length) {
      const section = $('<section class="prose"><h2>Calculate from your own measurements</h2><ul></ul></section>');
      for (const tool of candidates) {
        section.find("ul").append($("<li>").append($("<a>").attr("href", `/tools/${tool.slug}`).text(tool.title)));
      }
      $("main > article, main > section").first().append(section);
    }
  }

  if (file === "privacy.html") {
    const policy = $('<section class="prose"><h2>Google AdSense, cookies and consent</h2></section>');
    policy.append($("<p>").text("MeasureForge uses Google AdSense to display advertising. Google and its partners may use cookies, device identifiers and information about visits to serve ads, measure performance and help prevent fraud. Depending on your settings and applicable law, ads may be personalised or non-personalised."));
    policy.append($("<p>").text("Where consent is required, use the privacy controls provided by Google Privacy & messaging to set or change your choices. Browser settings can also limit or clear cookies. Learn more about "));
    policy.find("p").last().append($("<a>").attr("href", "https://policies.google.com/technologies/partner-sites").text("how Google uses information from sites that use its services"), ".");
    $("main > section, main > article").first().append(policy);
  }

  const schemas = $('head script[type="application/ld+json"]').map((_, element) =>
    $(element).text().replace(/https:\/\/measureforge\.pages\.dev\/([\w/-]+)\.html/g, (_, path: string) =>
      siteUrl + canonicalPath("/" + path)),
  ).get();
  const crumbs = [home];
  if (article) crumbs.push({ name: "Guides", path: "/blog" });
  if (path !== "/") crumbs.push({ name: title, path });
  if (!schemas.some(value => value.includes('"BreadcrumbList"'))) {
    schemas.push(JSON.stringify(breadcrumb(crumbs)));
  }
  if (article && !schemas.some(value => /"(?:Article|BlogPosting)"/.test(value))) {
    schemas.push(JSON.stringify({ "@context": "https://schema.org", "@type": "Article",
      headline: title, description, url: siteUrl + path, mainEntityOfPage: siteUrl + path,
      author: { "@type": "Organization", name: "MeasureForge", url: siteUrl + "/about" },
    }));
  }
  if (file === "faq.html") {
    const faqs = $("main details").map((_, detail) => ({
      q: $(detail).find("summary").text(), a: $(detail).find("p").text(),
    })).get();
    schemas.push(JSON.stringify(faqSchema(faqs)));
  }
  if (path !== "/" && !$('main nav[aria-label="Breadcrumb"]').length) {
    const nav = $('<nav aria-label="Breadcrumb"></nav>');
    crumbs.forEach(({ name, path: href }, index) => {
      if (index) nav.append(" / ");
      nav.append(index === crumbs.length - 1 ? $("<span>").attr("aria-current", "page").text(name)
        : $("<a>").attr("href", href).text(name));
    });
    $("main > article, main > section").first().prepend(nav);
  }
  return {
    metadata, schemas, body: $("body").html() ?? "",
    banner: $("body > .skip, body > header").toString(),
    footer: $("body > footer, body > [role=status], body > .toast").toString(),
  };
});
