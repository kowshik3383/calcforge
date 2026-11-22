import type { MetadataRoute } from "next";
import { pageSlugs } from "../lib/pages";
import { siteUrl } from "../lib/site";
import { tools } from "../lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...pageSlugs.map(slug => "/" + slug), ...tools.map(tool => "/tools/" + tool.slug)];
  return paths.map(path => ({ url: siteUrl + path }));
}
