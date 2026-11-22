import { notFound } from "next/navigation";
import { CalculatorAd } from "../../../lib/ads";
import { GeneratedCalculator } from "../../../lib/generated-calculator";
import { Markup, Schemas } from "../../../lib/legacy-content";
import { readPage } from "../../../lib/pages";
import { categoriesCrumb, faqSchema, home, pageMetadata } from "../../../lib/seo";
import { PageShell } from "../../../lib/site-ui";
import { siteUrl } from "../../../lib/site";
import { categories, tools } from "../../../lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}

function getTool(slug: string) {
  const tool = tools.find(item => item.slug === slug);
  if (!tool) notFound();
  return tool;
}

export async function generateMetadata({ params }: Props) {
  const tool = getTool((await params).slug);
  return pageMetadata(tool.title, tool.metaDescription, `/tools/${tool.slug}`);
}

export default async function Calculator({ params }: Props) {
  const tool = getTool((await params).slug);
  const path = `/tools/${tool.slug}`;
  const category = categories[tool.category as keyof typeof categories];
  const items = [home, categoriesCrumb,
    { name: category.title, path: `/categories/${tool.category}` }, { name: tool.title, path }];
  const related = tool.relatedTools.flatMap(slug => tools.find(item => item.slug === slug) ?? []);
  const page = tool.model ? null : readPage(`tools/${tool.slug}.html`);
  return <PageShell items={items}>
    <Schemas values={[
      JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication",
        name: tool.title, url: siteUrl + path, description: tool.metaDescription,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
        offers: { "@type": "Offer", price: 0, priceCurrency: "INR" } }),
      JSON.stringify(faqSchema(tool.faqs)),
    ]} />
    <h1 className="page-title">{tool.h1}</h1>
    <p className="intro">{tool.description}</p>
    {tool.model ? <GeneratedCalculator model={tool.model} exampleInput={tool.exampleInput} />
      : <Markup html={page!.calculator} />}
    <CalculatorAd />
    <div className="prose" data-tool-editorial>
      <h2>How it works</h2>
      {tool.howItWorks.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <h2>Formula</h2><p>{tool.formulaText}</p>
      <h2>Worked example</h2>
      {tool.examples.map(example => <div key={example.title}><h3>{example.title}</h3><p>{example.note}</p></div>)}
      <h2>Frequently asked questions</h2>
      {tool.faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
      {related.length > 0 && <>
        <h2>Related calculators</h2>
        <ul>{related.map(other => <li key={other.slug}><a href={`/tools/${other.slug}`}>{other.title}</a></li>)}</ul>
      </>}
      {page?.buyingGuides && <Markup html={page.buyingGuides} />}
      <p><a href="/blog">Browse measurement and estimating guides</a></p>
      <p><small>Also searched as: {tool.alsoSearchedAs.join(", ")}</small></p>
    </div>
    {!tool.model && <script type="module" src="/catalog-form.mjs" />}
  </PageShell>;
}
