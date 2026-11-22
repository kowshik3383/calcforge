# CalcForge

CalcForge offers free browser-based calculators for agriculture, construction, manufacturing, and animal care.

## Frontend

The standalone HTML, CSS, and JavaScript site lives in [static-site](static-site/). It includes field-area and material-pack calculators, measurement guides, and a responsive interface inspired by the Orbita reference.

Build and serve the 107-tool catalog with the commands in the static site README. See the [static site README](static-site/README.md) for deployment and form configuration, and the [reference audit](static-site/AUDIT.md) for design decisions.

The [editorial plan](docs/calculator-content-plan.md) contains three query candidates for each calculator.

GitHub Actions builds the static site and deploys it to [Cloudflare Pages](https://measureforge.pages.dev/).
