import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CalcForge",
    default: "CalcForge - Free Online Calculators",
  },
  description:
    "Free client-side calculators for agriculture, construction, and trade. Formulas, worked examples, and FAQs on every tool page.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="page-container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.35)]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">CalcForge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/category/agriculture" className="nav-link">Agriculture</Link>
          <Link href="/category/construction" className="nav-link">Construction</Link>
          <Link href="/category/manufacturing" className="nav-link">Manufacturing</Link>
          <Link href="/category/animal-care" className="nav-link">Animal care</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/tools/grain-moisture-shrink-calculator" className="btn-outline">
            Try a tool
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="page-container py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p className="text-slate-600">CalcForge — free calculators. Estimates only.</p>
        <nav className="flex gap-6">
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/privacy" className="nav-link">Privacy</Link>
          <Link href="/terms" className="nav-link">Terms</Link>
          <Link href="/disclaimer" className="nav-link">Disclaimer</Link>
        </nav>
        <p className="text-slate-500 text-xs">No signup. Client-side only.</p>
      </div>
    </footer>
  );
}
