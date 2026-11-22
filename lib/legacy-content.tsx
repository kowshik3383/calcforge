import { readPage } from "./pages";

export function Markup({ html }: { html: string }) {
  return <div className="legacy-markup" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Schemas({ values }: { values: string[] }) {
  return values.map((value, index) =>
    <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: value.replaceAll("<", "\\u003c") }} />);
}

export function LegacyPage({ file }: { file: string }) {
  const page = readPage(file);
  return <><Schemas values={page.schemas} /><Markup html={page.body} /></>;
}
