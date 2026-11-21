import Link from "next/link";
import { allTools } from "@/lib/tools/index";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [...new Set(allTools().map(tool => tool.category))].map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const tools = allTools().filter((t) => t.category === category);
  if (tools.length === 0) notFound();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <nav className="mb-10">
        <Link href="/" className="nav-link">&larr; Back to home</Link>
      </nav>
      <div className="section-head mb-12">
        <h1 className="section-title">{category}</h1>
        <p className="section-subtitle">{tools.length} free tools</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((t) => (
          <article key={t.slug} className="card-hover group p-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-tighter text-slate-400">{t.category}</span>
            </div>
            <Link href={`/tools/${t.slug}`} className="block">
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{t.seo.h1}</h3>
              <p className="text-sm text-slate-500 mb-5">{t.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <span className="text-[10px] border border-slate-200 rounded-full px-2 py-0.5 text-slate-500 bg-slate-50">
                  SEO page
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
