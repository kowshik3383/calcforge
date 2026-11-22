# MeasureForge

MeasureForge publishes browser-based calculators, conversions and practical measurement guides. The Next.js App Router exports the site as static files for Cloudflare Pages.

## Development and deployment

Use Node.js 24 and run:

```sh
npm ci
npm run dev
npm run build
```

Use `npm run build` as the Cloudflare Pages build command and `out` as the output directory. It runs `next build` and removes unused hydration code from the exported documents. The production workflow targets the `measureforge` project and uses the existing `CF_ACCOUNT_ID` and `CF_API_TOKEN` secrets.

## Add a tool

For a conversion, add a row to `conversions` in [lib/tools.ts](lib/tools.ts) with a unique slug, input unit, output unit, multiplier, realistic example, and the two contexts that explain where the values come from and where they are used. Use the optional offset for affine conversions and require a documented local factor for variable units. For a flooring room variant, add a `roomTool` entry with the room dimensions, example pack coverage, allowance and a measurement or layout detail specific to that room. The tool route, sitemap, category listing and page metadata are generated from the same registry. A new family of formulas requires a calculation model. The calculator engines live in `lib/calculators/` and editorial page sources live in `content/pages/`.

## AdSense

The exported pages include the existing publisher tag, an `ads.txt` entry, and a privacy disclosure. Set the GitHub Actions variable `ADSENSE_TOOL_SLOT` to the AdSense unit ID to render slots after calculator results. Slots request ads when they approach the viewport. Publish the EU and UK consent message in Google AdSense **Privacy & messaging** and confirm it appears on the live address. Review Auto ads settings if you want only the manually positioned slots.

See the [migration checklist](migration/README.md) for tests, redirect coverage, and release checks.
