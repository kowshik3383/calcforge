# MeasureForge Next.js migration

## Build and verify

Use Node.js 24.

```sh
npm ci
npm run build
npx playwright install chromium
npm test
```

Set `CHROMIUM_PATH` for the test command if Chromium is already installed separately. `npm run dev` runs the App Router locally. The Cloudflare Pages build command is `npm run build` (runs `next build`), the output directory is `out`, and the export needs no server. The build automatically prepares existing assets and produces `out/_redirects`.

## Calculator data

`lib/tools.ts` gives the template its typed view of the existing calculator registry. The source definitions in `static-site/catalog/tools/` contain each tool's fields, computation, worked examples, and FAQs. Updating a registry entry regenerates its tool page without editing a route component. The single editable data file and new tool families are scheduled for phases 3 and 4.

## Phase 2 review

| Check | Result |
| --- | --- |
| Live sitemap inventory | 222 unique URLs captured in `legacy-paths.json` |
| Exported content | 222 pages, including 107 catalog calculators and the existing guides and converters |
| Legacy URL coverage | 221 indexed HTML paths use a 301 to the matching clean route. The home alias also redirects. The Google verification file keeps its existing path. |
| Calculator parity | 327 exact rendered-result matches in Chromium at en-IN across 107 tool pages and two featured forms. Includes purchase estimates for flooring and raised-bed soil. |
| Metadata smoke check | Every indexed export has one H1, a title, a description, and the expected canonical URL. |
| Lighthouse | Pending phase 5. |
| Manual review | Test Cloudflare's redirect responses and Google verification file on a preview deployment before promotion. Review editorial metadata and regional terminology in phase 3, especially land-unit terms with local definitions. |

The existing content and browser calculation modules remain the source of truth for parity. Production deploys the existing static frontend until the Next.js migration is approved. The phase 2 export omits the old advertising script while the AdSense and consent integration is pending.
