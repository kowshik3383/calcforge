import { stripTypeScriptTypes } from "node:module";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
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

  await mkdir(join(output, "fonts"), { recursive: true });
  const fonts = [
    ["open-sans", "open-sans"],
    ["source-serif-4", "source-serif"],
  ];
  await Promise.all(fonts.map(async ([family, target]) => {
    const directory = join("node_modules/@fontsource-variable", family);
    await cp(join(directory, "files", family + "-latin-wght-normal.woff2"), join(output, "fonts", target + ".woff2"));
    await cp(join(directory, "LICENSE"), join(output, "fonts", target + "-LICENSE.txt"));
  }));
  await cp("scripts/measureforge-ads.js", join(output, "measureforge-ads.js"));
  await cp("scripts/generated-calculator.mjs", join(output, "generated-calculator.mjs"));
  const model = await readFile("lib/new-calculations.ts", "utf8");
  await writeFile(join(output, "new-calculations.mjs"), stripTypeScriptTypes(model));
  const css = await readFile(join(legacy, "styles.css"), "utf8");
  const siteCss = await readFile("scripts/measureforge.css", "utf8");
  await writeFile(join(output, "styles.css"), css + "\n" + siteCss);

  const verification = "google017a65e37914063f";
  await cp(join(legacy, verification + ".html"), join(output, verification));
}
