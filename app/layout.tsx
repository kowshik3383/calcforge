import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrl } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/favicon.svg" },
  verification: { google: "R5yRp38WdR0kXGk16PhzvpwXQHtoQ1knlM8nM9CvlrE" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><head>
    <link rel="stylesheet" href="/styles.css" />
    <style>{".legacy-markup { display: contents; }"}</style>
  </head><body>
    {children}
    <script src="/script.js" defer />
  </body></html>;
}
