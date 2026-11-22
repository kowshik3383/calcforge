# MeasureForge migration checklist

## Build and test

Use Node.js 24.

```sh
npm ci
npm run build
npx playwright install chromium
npm test
```

The calculator parity test builds the original site from a pinned Git commit in a temporary directory. Use a full clone, or run `git fetch --unshallow` if the baseline commit is missing. Set `CHROMIUM_PATH` if Chromium is already installed separately. Run the Cloudflare Pages emulator in a separate terminal, then run the preview test.

```sh
npx wrangler@4.166.0 pages dev out --ip 127.0.0.1 --port 8791
node scripts/test-pages-preview.mjs
```

## Results

| Check | Result |
| --- | --- |
| Static export | 273 sitemap pages, covering all 222 legacy URLs plus 45 new calculator pages and six category pages. |
| Legacy URLs | All 222 redirects, including the home alias, returned a 301 and then a 200 in Cloudflare's local Pages emulator. The Google verification endpoint returned a direct 200 and an unknown route returned 404. |
| Calculator parity | 327 exact rendered-result matches across 107 existing tools and two featured forms in Chromium with the `en-IN` locale. Both purchase flows include an INR order total. |
| New calculations | Ten browser checks cover conversions, negative temperatures, locally defined bigha and the three flooring variants. |
| SEO | All 273 indexed pages passed title, description, H1, canonical, social tag and breadcrumb checks. The 152 tool pages passed application schema, FAQ count and 300 to 600 word checks. All 107 guides have Article or BlogPosting schema and tool links. |
| Ads and consent | The publisher tag, `ads.txt`, privacy copy and lazy slot code are in the export. Consent and the slot ID require publisher-side setup. |

The committed Cloudflare redirect map is [public/_redirects](../public/_redirects). The [legacy inventory](legacy-paths.json) records paths from the production sitemap before the migration.

## Manual review before production

- Review the calculator copy and suggested links for editorial judgment. Pay special attention to land records and regional terminology for gunta, cent, ground, gaj and bigha. The bigha tools require a locally documented factor.
- Confirm the AdSense publisher entry against the dashboard, configure the calculator ad unit ID, publish the consent message and test the ad experience in applicable regions. The performance checks do not load live advertising.
- Confirm the production sitemap and Google verification in Search Console after the promotion.

## Mobile Lighthouse

Lighthouse 13.6 audited the optimized static export through the local Pages emulator using default mobile throttling. Google ad requests were blocked during the measurements. The results cover five representative pages.

| Page | Performance | SEO | CLS |
| --- | ---: | ---: | ---: |
| Home | 99 | 100 | 0 |
| Flooring pack calculator | 100 | 100 | 0 |
| Gunta to square feet | 100 | 100 | 0 |
| Flooring box coverage guide | 100 | 100 | 0 |
| Unit conversion category | 100 | 100 | 0 |

To repeat a measurement while Wrangler is running:

```sh
npx lighthouse http://127.0.0.1:8791/ --only-categories=performance,seo --chrome-flags="--headless" --blocked-url-patterns="*googlesyndication.com*"
```
