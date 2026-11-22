import { notFound } from "next/navigation";
import { Markup, Schemas } from "../../../lib/legacy-content";
import { readPage } from "../../../lib/pages";
import { tools } from "../../../lib/tools";

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
  return readPage(`tools/${tool.slug}.html`).metadata;
}

export default async function Calculator({ params }: Props) {
  const tool = getTool((await params).slug);
  const page = readPage(`tools/${tool.slug}.html`);
  const related = tool.relatedTools.flatMap(slug => tools.find(item => item.slug === slug) ?? []);
  return <>
    <Schemas values={page.schemas} />
    <Markup html={page.banner} />
    <main id="content" tabIndex={-1}><article className="section wrap">
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/calculators">Calculators</a></nav>
      <h1 className="page-title">{tool.h1}</h1>
      <p className="intro">{tool.description}</p>
      <Markup html={page.calculator} />
      <div className="prose">
        <h2>Formula</h2><p>{tool.formulaText}</p>
        <h2>Worked examples</h2>
        {tool.examples.map(example => <div key={example.title}><h3>{example.title}</h3><p>{example.note}</p></div>)}
        <h2>Questions and assumptions</h2>
        {tool.faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
        {related.length > 0 && <>
          <h2>Related calculators</h2>
          <ul>{related.map(other => <li key={other.slug}><a href={`/tools/${other.slug}`}>{other.title}</a></li>)}</ul>
        </>}
        {page.buyingGuides && <Markup html={page.buyingGuides} />}
        <p><a href="/blog">Browse measurement and estimating guides</a></p>
      </div>
    </article></main>
    <Markup html={page.footer} />
    <script type="module" src="/catalog-form.mjs" />
  </>;
}
