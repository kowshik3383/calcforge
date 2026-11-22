# CalcForge

A vanilla HTML, CSS, and JavaScript site for growers, tradespeople, and DIY project planners. Its primary goal is to get visitors from the homepage to a calculator result. The bold display type, italic serif accents, rounded cards, pill buttons, checkerboard, ticker, and oversized footer carry over from the reference. The palette uses cobalt (#263EAA), pale blue (#EDF3FF), and mint (#B7F1D4) with navy ink (#142744). Shared design tokens live at the top of `styles.css`.

## Open locally

From this directory, run `SITE_URL=https://calcforge.test node build.mjs` with Node.js 22.15+ or 24. Then run `python3 -m http.server 8000 --directory dist` and open http://localhost:8000. The build generates a page for each calculator so the full catalog and sitemap are available. Run `node test-catalog.mjs` to verify the registry and worked examples.

## Change the visuals

The homepage hero and calculator illustrations are original inline SVGs. Find the comments starting with “Image slot” in `index.html` and `calculators.html`. Replace the following SVG with an `img` of your own. Use equivalent alt text, include width and height, and keep the `icon` class for card illustrations. Replace `social.png` with a 1200 × 630 image if the visual identity changes. Its image description lives in the Open Graph tags.

## Deploy

**Cloudflare Pages.** GitHub Actions builds with `SITE_URL=https://calcforge.pages.dev` and deploys `static-site/dist` to the `calcforge` project. Set `CF_ACCOUNT_ID` and `CF_API_TOKEN` in GitHub Actions secrets for the Cloudflare account that owns the project. The API token needs Account → Cloudflare Pages → Edit.

**Vercel.** Import the repository with `main` as the production branch and `static-site` as Root Directory. Use the build command and output directory defined by `vercel.json` (`node build.mjs` and `dist`) and remove any previous blank build override. With system variables exposed, `VERCEL_PROJECT_PRODUCTION_URL` supplies the canonical host. If you use a custom domain, set `SITE_URL` to that full HTTPS URL before deploying. After publishing, submit the deployed `/sitemap.xml` in Google Search Console.

**Branch or folder hosting**

1. From the repository root, run `python3 static-site/prepare_deploy.py YOUR_PUBLIC_HTTPS_URL publish`. Supply the full public URL, including the project path for GitHub Pages. This generates a new publish directory with matching canonical URLs, social metadata, sitemap, and links on the 404 page.
2. **GitHub Pages.** Copy the contents of `publish` to the publishing branch root or its `docs` folder. In Settings → Pages, select that branch and folder. Include the hidden `.nojekyll` file. If the project lives below a subpath, submit its sitemap directly because crawlers look for robots.txt at the origin root.
3. **Netlify.** Deploy the generated `publish` directory. For manual deployment, drop it into the Netlify dashboard. For continuous deployment, set the build command to the command in step 1 and use `publish` as the publish directory. Check the homepage and a nested missing URL after deployment.

## What still needs production configuration

- The newsletter saves one email in the current browser and offers a local delete control. Connect an email provider for subscriptions and confirmation emails.
- Contact generates a downloadable draft and needs a real feedback endpoint for message delivery.
- The documented builds replace the sample domain. Review the privacy and terms copy against your actual hosting and data flows.
- The site uses the 107-tool registry under `static-site/catalog`. The calculators page also retains its two featured forms.
- An optional `calcforge:calculation` event exposes the tool ID to an analytics integration. No analytics tracker is installed.

## Purchase estimates and monetization

The Flooring Pack Count and Raised Bed Soil Volume pages offer purchase estimates based on the visitor’s own package size or price. Their default supplier links are direct links to India-based retailers and earn no commission. When you have approved affiliate links, set `FLOORING_AFFILIATE_URL` or `SOIL_AFFILIATE_URL` to the approved HTTPS URL in Vercel and redeploy. The generated page labels the link as affiliate and adds `rel="sponsored"`.

The browser dispatches `calcforge:calculation` when a calculator returns a result and `calcforge:supplier-click` when a supplier link is clicked. Both expose the tool slug, and supplier events also expose direct versus affiliate. The events exclude measurements and prices. Connect them to your analytics provider to count completions and clicks, and check commissions in your affiliate dashboard.

For display ads, connect your approved AdSense publisher account after the site is marked Ready. Leave spacing around inputs and results and start with a placement below the worked examples. The build includes the AdSense tag for `https://calcforge.pages.dev`.
