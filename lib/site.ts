export const siteUrl = "https://measureforge.pages.dev";

export function canonicalPath(path: string): string {
  return path === "/index.html" ? "/" : path.replace(/\.html$/, "");
}
