import { planners, plannersCrumb } from "../../lib/planners";
import { home, pageMetadata } from "../../lib/seo";
import { PageShell } from "../../lib/site-ui";

const description = "Plan flooring, measure land, lay out sheet cuts, plan garden beds, or score archery practice.";
export const metadata = pageMetadata("Project Planners", description, plannersCrumb.path);

export default function PlannerIndex() {
  return <PageShell items={[home, plannersCrumb]}>
    <h1 className="page-title">Project planners</h1>
    <p className="intro">{description} Save your work on this device.</p>
    <div className="grid">
      {planners.map(({ slug, title, description: summary }) => <section className="card" key={slug}>
        <h2 className="planner-card-title"><a href={`/planners/${slug}`}>{title}</a></h2>
        <p>{summary}</p>
      </section>)}
    </div>
  </PageShell>;
}
