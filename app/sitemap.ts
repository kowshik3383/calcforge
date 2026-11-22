import { planners, plannersCrumb } from "../lib/planners";
import type { MetadataRoute } from "next";
import { pageSlugs } from "../lib/pages";
import { siteUrl } from "../lib/site";
import { categories, tools } from "../lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", plannersCrumb.path, ...planners.map(({ slug }) => "/planners/" + slug), ...pageSlugs.map(slug => "/" + slug), "/categories", ...Object.keys(categories).map(slug => "/categories/" + slug), ...tools.map(tool => "/tools/" + tool.slug)];
  return paths.map(path => ({ url: siteUrl + path }));
}
