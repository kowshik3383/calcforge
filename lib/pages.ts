import { load } from "cheerio";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { cache } from "react";
import { canonicalPath, siteUrl } from "./site";

const legacy = join(process.cwd(), "static-site/dist");
export const pageSlugs = readdirSync(legacy)
  .filter(file => file.endsWith(".html") && !["index.html", "404.html", "google017a65e37914063f.html"].includes(file))
  .map(file => file.slice(0, -5));

export const readPage = cache((file: string) => {
  const $ = load(readFileSync(join(legacy, file), "utf8"));
  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content");
  const canonical = $('link[rel="canonical"]').attr("href");
  const path = canonicalPath(new URL(canonical || "/", siteUrl).pathname);
  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: path,
      images: ["/social.png"],
      type: $('meta[property="og:type"]').attr("content") === "article" ? "article" : "website",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/social.png"] },
  };

  $("body a[href]").each((_, element) => {
    const link = $(element);
    const href = link.attr("href")!;
    if (href.startsWith("#") || href.startsWith("?")) return;
    const target = new URL(href, new URL(file, siteUrl));
    if (target.origin === siteUrl) {
      link.attr("href", canonicalPath(target.pathname) + target.search + target.hash);
    }
  });

  const schemas = $('head script[type="application/ld+json"]').map((_, element) =>
    $(element).text().replace(/https:\/\/measureforge\.pages\.dev\/([\w/-]+)\.html/g, (_, path: string) =>
      siteUrl + canonicalPath("/" + path)),
  ).get();
  const buyingHeading = $("main h2").filter((_, element) => $(element).text() === "Buying guides");
  const body = $("body").html() ?? "";
  return {
    metadata, schemas, body,
    banner: $("body > .skip, body > header").toString(),
    footer: $("body > footer, body > [role=status], body > .toast").toString(),
    calculator: $("main .grid, #purchase-supplier, main noscript").toString(),
    buyingGuides: buyingHeading.toString() + buyingHeading.next("ul").toString(),
  };
});
