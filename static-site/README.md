# CalcForge

A vanilla HTML, CSS, and JavaScript site for growers, tradespeople, and DIY project planners. Its primary goal is to get visitors from the homepage to a calculator result. The bold display type, italic serif accents, rounded cards, pill buttons, checkerboard, ticker, and oversized footer carry over from the reference. The palette uses cobalt (#263EAA), pale blue (#EDF3FF), and mint (#B7F1D4) with navy ink (#142744). Shared design tokens live at the top of `styles.css`.

## Open locally

Extract the ZIP and open `index.html` for a quick look. For consistent storage behavior, run `python3 -m http.server 8000` from this directory and open http://localhost:8000. No install or build step is required.

## Change the visuals

The homepage hero and calculator illustrations are original inline SVGs. Find the comments starting with “Image slot” in `index.html` and `calculators.html`. Replace the following SVG with an `img` of your own. Use equivalent alt text, include width and height, and keep the `icon` class for card illustrations. Replace `social.png` with a 1200 × 630 image if the visual identity changes. Its image description lives in the Open Graph tags.

## Deploy

1. From the repository root, run `python3 static-site/prepare_deploy.py YOUR_PUBLIC_HTTPS_URL publish`. Supply the full public URL, including the project path for GitHub Pages. This generates a new publish directory with matching canonical URLs, social metadata, sitemap, and links on the 404 page.
2. **GitHub Pages.** Copy the contents of `publish` to the publishing branch root or its `docs` folder. In Settings → Pages, select that branch and folder. Include the hidden `.nojekyll` file. If the project lives below a subpath, submit its sitemap directly because crawlers look for robots.txt at the origin root.
3. **Netlify.** Deploy the generated `publish` directory. For manual deployment, drop it into the Netlify dashboard. For continuous deployment, set the build command to the command in step 1 and use `publish` as the publish directory. Check the homepage and a nested missing URL after deployment.

## What still needs production configuration

- The newsletter saves one email in the current browser and offers a local delete control. Connect an email provider for subscriptions and confirmation emails.
- Contact generates a downloadable draft and needs a real feedback endpoint for message delivery.
- Replace the sample domain and review the privacy and terms copy against your actual hosting and data flows.
- The standalone site ships the two requested calculators. It does not import the existing Next.js calculator catalog.
- An optional `calcforge:calculation` event exposes the tool ID to an analytics integration. No tracker is installed.
