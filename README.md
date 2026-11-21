# CalcForge

CalcForge offers free browser-based calculators for agriculture, construction, manufacturing, and animal care.

## Static redesign

The standalone HTML, CSS, and JavaScript site lives in [static-site](static-site/). It includes field-area and material-pack calculators, measurement guides, and a responsive interface inspired by the Orbita reference.

Run `python3 -m http.server 8000 --directory static-site` and visit http://localhost:8000. See the [static site README](static-site/README.md) for deployment and form configuration, and the [reference audit](static-site/AUDIT.md) for design decisions.

## Next.js calculator catalog

The repository root contains the existing Next.js app. Install its dependencies with `npm ci` and run `npm run dev`. Visit http://localhost:3000. Its deployment uses the existing Cloudflare Pages workflow.
