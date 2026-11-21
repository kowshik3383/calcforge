# Orbita reference audit

Scope: the supplied single HTML file. Quality findings are based on source inspection.

| Area | Present | Partial | Missing |
|---|---|---|---|
| Pages | Home, menu with prices | About/story and contact details are homepage sections | Blog index, blog post, FAQ, 404, privacy page, terms page |
| Tools | Category filters | Cart count only, booking modal shows a local confirmation, newsletter shows a local confirmation | Search, calculator/configurator, checkout, account signup, comparison, dashboard |
| Content | Testimonials, how-it-works steps | Menu counts and promotional figures are static | Case studies, team, press logos, changelog |
| UI | Footer, buttons, cards, native modal, toasts | Desktop navigation only with no active links, native form constraints, step buttons with pressed states, empty-cart toast | Mobile menu, explicit error UI, loading states |
| Quality | Responsive grid breakpoints, title and description | Native keyboard controls, limited explicit focus styling, contrast not verified, reduced motion disables ticker but scripted smooth scrolling remains, decorative emoji mostly hidden from assistive technology, external fonts and no measured performance | Dark mode, Open Graph, favicon, analytics hooks |

## Build priorities

1. Give visitors two working calculators, visible formulas, and a clear path from the home page to a result.
2. Carry over the headline pairing, cards, checkerboard, ticker, section pills, and large footer wordmark. Add mobile navigation, clear focus, labeled fields, and reduced-motion support.
3. Add searchable guides, contact and newsletter forms, FAQ and legal pages, a 404, and metadata for publishing.
