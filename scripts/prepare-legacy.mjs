import { execFileSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const siteUrl = "https://measureforge.pages.dev";

export async function prepareLegacy() {
  execFileSync(process.execPath, ["static-site/build.mjs"], {
    env: { ...process.env, SITE_URL: siteUrl },
    stdio: "inherit",
  });

  const legacy = "static-site/dist";
  const output = "public";
  await mkdir(output, { recursive: true });
  const assets = ["catalog", "catalog-form.mjs", "purchase-estimate.mjs", "script.js",
    "styles.css", "favicon.svg", "social.png", "google017a65e37914063f.html"];
  await Promise.all(assets.map(name => cp(join(legacy, name), join(output, name), { recursive: true })));

  const oldPaths = (await readdir(legacy, { recursive: true }))
    .filter(name => name.endsWith(".html") && !["404.html", "google017a65e37914063f.html"].includes(name))
    .sort();
  const redirects = oldPaths.map(path => `/${path} ${path === "index.html" ? "/" : "/" + path.slice(0, -5)} 301`);
  const verificationRule = (await readFile(join(legacy, "_redirects"), "utf8")).trim();
  await writeFile(join(output, "_redirects"), [verificationRule, ...redirects, ""].join("\n"));
}
