import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";

// Exported pages use full-document navigation and standalone scripts for forms.
const pages = (await readdir("out", { recursive: true })).filter(file => file.endsWith(".html"));
for (const page of pages) {
  if (page === "google017a65e37914063f.html") continue;
  const file = join("out", page);
  const markup = await readFile(file, "utf8");
  const $ = load(markup);
  $("script").each((_, element) => {
    const script = $(element);
    if (script.attr("src")?.startsWith("/_next/") || /^\s*(?:\(self\.__next_f=|self\.__next_f\.push\()/.test(script.text())) {
      script.remove();
    }
  });
  $('link[as="script"][href^="/_next/"]').remove();
  await writeFile(file, $.html());
}
