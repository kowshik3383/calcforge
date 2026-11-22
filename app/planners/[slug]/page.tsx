import { notFound } from "next/navigation";
import { planners, plannersCrumb } from "../../../lib/planners";
import { home, pageMetadata } from "../../../lib/seo";
import { PageShell } from "../../../lib/site-ui";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return planners.map(({ slug }) => ({ slug }));
}

function findPlanner(slug: string) {
  return planners.find(planner => planner.slug === slug) ?? notFound();
}

export async function generateMetadata({ params }: Props) {
  const planner = findPlanner((await params).slug);
  return pageMetadata(planner.title, planner.description, `/planners/${planner.slug}`);
}

export default async function PlannerPage({ params }: Props) {
  const planner = findPlanner((await params).slug);
  const path = `/planners/${planner.slug}`;
  return <PageShell items={[home, plannersCrumb, { name: planner.title, path }]}>
    <h1 className="page-title">{planner.title}</h1>
    <p className="intro">{planner.description}</p>
    {"category" in planner && <p><a href={`/categories/${planner.category}`}>Browse related calculators</a></p>}
    <noscript><p>Enable JavaScript to use the planner and save your work.</p></noscript>
    <div data-planner={planner.slug}></div>
    <script type="module" src="/planner-app.mjs" />
  </PageShell>;
}
