import { Fragment, type ReactNode } from "react";
import { Markup, Schemas } from "./legacy-content";
import { readPage } from "./pages";
import { breadcrumb, type Crumb } from "./seo";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return <nav aria-label="Breadcrumb">
    {items.map(({ name, path }, index) => <Fragment key={path}>
      {index > 0 ? " / " : null}
      {index === items.length - 1 ? <span aria-current="page">{name}</span> : <a href={path}>{name}</a>}
    </Fragment>)}
  </nav>;
}

export function PageShell({ items, children }: { items: Crumb[]; children: ReactNode }) {
  const layout = readPage("index.html");
  return <>
    <Schemas values={[JSON.stringify(breadcrumb(items))]} />
    <Markup html={layout.banner} />
    <main id="content" tabIndex={-1}><article className="section wrap">
      <Breadcrumbs items={items} />
      {children}
    </article></main>
    <Markup html={layout.footer} />
  </>;
}
