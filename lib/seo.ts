import type { Metadata } from "next";
import { siteUrl } from "./site";

export type Crumb = { name: string; path: string };

export function breadcrumb(items: Crumb[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, path }, index) => ({
      "@type": "ListItem", position: index + 1, name, item: new URL(path, siteUrl).href,
    })),
  };
}

export const home: Crumb = { name: "Home", path: "/" };
export const categoriesCrumb: Crumb = { name: "Calculator categories", path: "/categories" };

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function pageMetadata(title: string, description: string, path: string, article = false): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: "MeasureForge", type: article ? "article" : "website",
      images: [{ url: "/social.png", alt: "MeasureForge calculator artwork", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/social.png"] },
  };
}
