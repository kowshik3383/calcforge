import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publisher, slot } from "../lib/ads";
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
    <noscript><style>{".nav #menu-toggle { display: none; } .nav #menu-toggle + #main-menu { display: flex; }"}</style></noscript>
    <script async crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`} />
  </head><body>
    {children}
    <script src="/script.js" defer />
    {slot && <script src="/measureforge-ads.js" defer />}
  </body></html>;
}
