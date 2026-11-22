import { stripTypeScriptTypes } from "node:module";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const siteUrl = "https://measureforge.pages.dev";

export async function prepareAssets() {
  const output = "public";
  const catalog = "lib/calculators";
  const files = ["calculator.ts", ...(await readdir(join(catalog, "tools")))
    .filter(name => name.endsWith(".ts")).map(name => join("tools", name))];
  await mkdir(join(output, "catalog", "tools"), { recursive: true });
  await Promise.all(files.map(async file => {
    const source = await readFile(join(catalog, file), "utf8");
    const module = stripTypeScriptTypes(source).replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, "$1$2.mjs$3");
    await writeFile(join(output, "catalog", file.replace(/\.ts$/, ".mjs")), module);
  }));

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

  const verification = "google017a65e37914063f";
  await cp(join(output, verification + ".html"), join(output, verification));
}
