import { notFound } from "next/navigation";
import { categoriesCrumb, home, pageMetadata } from "../../../lib/seo";
import { PageShell } from "../../../lib/site-ui";
import { categories, tools } from "../../../lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(categories).map(slug => ({ slug }));
}

function getCategory(slug: string) {
  if (!Object.hasOwn(categories, slug)) notFound();
  return categories[slug as keyof typeof categories];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  return pageMetadata(category.title, category.description, `/categories/${slug}`);
}

export default async function Category({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  return <PageShell items={[home, categoriesCrumb, { name: category.title, path: `/categories/${slug}` }]}>
    <h1 className="page-title">{category.title}</h1>
    <p className="intro">{category.description}</p>
    <ul className="catalog-list">
      {tools.filter(tool => tool.category === slug).map(tool =>
        <li key={tool.slug}><a href={`/tools/${tool.slug}`}>{tool.title}</a></li>)}
    </ul>
  </PageShell>;
}
