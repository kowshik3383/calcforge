# CalcForge — Money-making mission plan

## Mission
Build free client-side micro-tools that capture organic Google traffic and monetize via display ads (AdSense → Journey → Ezoic) + affiliates + premium features.

## Phase plan

**Phase 0 — Validate (weeks 1–2, $0)**
- Pick ONE niche (e.g., agriculture). Use Google Keyword Planner + Trends to confirm 1,000+ monthly searches for specific queries.
- Check top 10 Google results per query. Reject if dominated by established tool sites; build if forums/articles/weak tools dominate.
- Target: 3 verified candidates, not 23 ideas.

**Phase 1 — Launch one tool site (weeks 3–6)**
- One domain, one focused tool (MVP in 1–3 days). Add About, Privacy, Terms, Disclaimer (AdSense requires these).
- Apply to AdSense once ~10 complete pages exist.

**Phase 2 — Monetize & measure (months 2–4)**
- Track GSC impressions/CTR per keyword. Double down on queries actually getting impressions.
- Ad placements: below intro, after results, near FAQ — never beside buttons.
- Example math: 10,000 visitors/mo × 1.1 page views × $3 RPM = ~$33/mo. At 100k visitors = ~$330/mo.
- Upgrade path: AdSense → Journey by Mediavine (~5k sessions) → Ezoic (~250k MAU). Add affiliate (feed/pump/solar suppliers) and premium (PDF exports, saved projects).

**Phase 3 — Replicate winners only (months 4–8)**
- Only replicate niches that passed Phase 2 validation. One domain per niche (topical relevance).
- Target 5–10 sites, each with one winning tool + 2–3 related tools.
- Portfolio goal: $500–$2,000/mo combined.

**Phase 4 — Asset build (month 8+)**
- Sell individual tool sites or bundle as a portfolio.

## Tasks

- [ ] Build all 24 tools (DONE — agriculture, construction, manufacturing, animal care)
- [ ] Deploy to the calcforge Cloudflare Pages project using GitHub Actions
- [ ] Pick a design from Dribbble (e.g., Scappa Finance) and make the website utilize more visual illustrations
- [ ] Verify search volume for top candidates before building more
- [ ] Apply to AdSense once ~15+ complete tool pages are live

## Tech stack
Static HTML, CSS, and JavaScript in `static-site/`, with a Node.js build and client-side calculations.

## Repo
https://github.com/kowshik3383/calcforge
