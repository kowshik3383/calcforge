import { generateCatalog } from "./build-catalog.mjs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const source = dirname(fileURLToPath(import.meta.url));
const output = join(source, "dist");
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const rawUrl = process.env.SITE_URL || (productionHost && `https://${productionHost}`);
if (!rawUrl) {
  throw new Error("Set SITE_URL to the public HTTPS URL, or expose Vercel system environment variables.");
}
const url = new URL(rawUrl);
if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
    ["example.com", "localhost"].includes(url.hostname) ||
    !/^[a-zA-Z0-9/._~-]+$/.test(url.pathname)) {
  throw new Error("SITE_URL must be a valid public HTTPS URL without credentials, query, or fragment.");
}
const base = url.href.replace(/\/+$/, "");
const subpath = url.pathname.replace(/\/+$/, "");
const assets = [".nojekyll", "favicon.svg", "script.js", "social.png", "styles.css"];

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const name of await readdir(source)) {
  if (!name.endsWith(".html") && !["robots.txt", "sitemap.xml"].includes(name)) continue;
  let content = (await readFile(join(source, name), "utf8")).replaceAll("https://example.com", base);
  if (name === "404.html" && subpath) {
    content = content.replace(/(href|src)="\/(?!\/)/g, (_, attribute) => `${attribute}="${subpath}/`);
  }
  await writeFile(join(output, name), content);
}
for (const name of assets) await cp(join(source, name), join(output, name));
await generateCatalog(output, base);
console.log(`Built CalcForge for ${base}`);
