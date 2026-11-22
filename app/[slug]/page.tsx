import { LegacyPage } from "../../lib/legacy-content";
import { pageSlugs, readPage } from "../../lib/pages";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return pageSlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  return readPage((await params).slug + ".html").metadata;
}

export default async function Page({ params }: Props) {
  return <LegacyPage file={(await params).slug + ".html"} />;
}
