import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { allTools, getTool } from "@/lib/tools/index";
import Calculator from "@/components/Calculator";
import type { ToolConfig } from "@/lib/calculator";

export function generateStaticParams() {
  return allTools().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: tool.seo.h1,
    description: tool.seo.metaDescription,
    keywords: tool.seo.keywords,
    alternates: { canonical: `https://calcforge.example.com/tools/${tool.slug}` },
    openGraph: {
      title: tool.seo.h1,
      description: tool.seo.metaDescription,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  // `calculate` is a function — strip it before crossing to the client component.
  // The client resolves it locally from the shared registry by slug.
  const { calculate, ...config } = tool;

  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600">Loading tool…</p>
      </div>
    }>
      <Calculator slug={slug} config={config as ToolConfig} />
    </Suspense>
  );
}
