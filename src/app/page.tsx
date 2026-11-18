import Link from "next/link";
import { allTools } from "@/lib/tools/index";

const CATEGORIES = [
  {
    key: "agriculture",
    label: "Agriculture & farming",
    description: "Feed, grain, fertilizer, irrigation, livestock.",
    tools: allTools().filter((t) => t.category === "agriculture"),
  },
  {
    key: "construction",
    label: "Construction & engineering",
    description: "Voltage drop, rebar, formwork, solar, pumps.",
    tools: allTools().filter((t) => t.category === "construction"),
  },
  {
    key: "manufacturing",
    label: "Manufacturing & business",
    description: "Material waste, flooring, greenhouse, recipes.",
    tools: allTools().filter((t) => t.category === "manufacturing"),
  },
  {
    key: "animal-care",
    label: "Animal care",
    description: "Horse blanket weather guide.",
    tools: allTools().filter((t) => t.category === "animal-care"),
  },
];

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <section className="mb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          Free online calculators
        </span>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Simple <span className="text-indigo-600">calculators</span> that actually help
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Client-side tools with no signup. One page per tool, with the formula and worked examples shown.
        </p>
      </section>

      <section className="mb-16">
        <div className="section-head">
          <h2 className="section-title">By category</h2>
          <p className="section-subtitle">Pick a niche and explore every tool inside it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/category/${cat.key}`}
              className="card-hover group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.label}</h3>
              <p className="text-sm text-slate-500 mb-4">{cat.description}</p>
              <span className="text-[10px] border border-slate-200 rounded-full px-2.5 py-0.5 text-slate-500 bg-slate-50">
                {cat.tools.length} tools
              </span>
            </Link>
          ))}
        </div>
      </section>

      <hr className="hr" />

      <section>
        <div className="section-head">
          <h2 className="section-title">Popular tools</h2>
          <p className="section-subtitle">Quick-start calculators.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {allTools().slice(0, 8).map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="card-hover group p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-tighter text-slate-400">{t.category}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{t.title}</h3>
              <p className="text-sm text-slate-500">{t.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
