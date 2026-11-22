import { categoriesCrumb, home, pageMetadata } from "../../lib/seo";
import { PageShell } from "../../lib/site-ui";
import { categories } from "../../lib/tools";

export const metadata = pageMetadata("Calculator categories",
  "Browse calculators for agriculture, construction, workshop projects, animal care and unit conversions.",
  "/categories");

export default function Categories() {
  return <PageShell items={[home, categoriesCrumb]}>
    <h1 className="page-title">Calculator categories</h1>
    <div className="grid">
      {Object.entries(categories).map(([slug, category]) => <section className="card" key={slug}>
        <h2><a href={`/categories/${slug}`}>{category.title}</a></h2>
        <p>{category.description}</p>
      </section>)}
    </div>
  </PageShell>;
}
