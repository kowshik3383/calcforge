import { LegacyPage } from "../lib/legacy-content";
import { readPage } from "../lib/pages";

export function generateMetadata() {
  return readPage("index.html").metadata;
}

export default function Home() {
  return <LegacyPage file="index.html" />;
}
