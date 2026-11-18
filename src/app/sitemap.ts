import { MetadataRoute } from "next";
import { allTools } from "@/lib/tools/index";

const BASE = "https://calcforge.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  type CF = "weekly" | "monthly" | "yearly" | "daily";

const routes = [
    "",
    "/category/agriculture",
    "/about",
    "/privacy",
    "/terms",
    "/disclaimer",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as CF,
    priority: path === "" ? 1 : 0.8,
  }));

  const tools = allTools().map((t) => ({
    url: `${BASE}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as CF,
    priority: 0.7,
  }));

  return [...routes, ...tools];
}
