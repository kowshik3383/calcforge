"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getTool } from "@/lib/tools/index";
import type { ToolConfig, CalcResult, InputField } from "@/lib/calculator";
import { defaultInputValue, formatNumber } from "@/lib/calculator";

type Props = { slug: string; config: ToolConfig };

const RESULT_BADGE_STYLE: Record<string, string> = {
  success: "border-indigo-600 bg-indigo-50 text-indigo-700",
  warning: "border-amber-600 bg-amber-50 text-amber-700",
  info: "border-cyan-600 bg-cyan-50 text-cyan-700",
};

export default function Calculator({ slug, config }: Props) {
  const tool = getTool(slug);
  const calculate = tool?.calculate;

  const [inputs, setInputs] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of config.inputs) init[f.key] = defaultInputValue(f);
    return init;
  });
  const [results, setResults] = useState<CalcResult[] | null>(null);
  const [computing, setComputing] = useState(false);

  const setField = useCallback((key: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setResults(null);
  }, []);

  const compute = useCallback(() => {
    if (!calculate) return;
    setComputing(true);
    queueMicrotask(() => {
      try {
        setResults(calculate(inputs as Record<string, unknown>));
      } catch {
        setResults([]);
      } finally {
        setComputing(false);
      }
    });
  }, [inputs, calculate]);

  const reset = () => {
    const next: Record<string, unknown> = {};
    for (const f of config.inputs) next[f.key] = defaultInputValue(f);
    setInputs(next);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <nav className="mb-10 text-sm flex items-center gap-2 text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span>&rsaquo;</span>
        <Link href={`/category/${config.category}`} className="hover:text-slate-900">{config.category}</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-600 font-medium">{config.seo.h1}</span>
      </nav>

      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">{config.seo.h1}</h1>
        <p className="mt-4 text-slate-500 leading-relaxed">{config.description}</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-600" /> Client-side
          </span>
          <span>&bull;</span>
          <span>No signup</span>
        </div>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); compute(); }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14"
      >
        <section className="lg:col-span-2 card">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Enter your values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {config.inputs.map((f: InputField) => (
              <div key={f.key} className="col-span-2 md:col-span-1">
                <label className="label-text">{f.label}{f.unitLabel ? ` (${f.unitLabel})` : ""}</label>
                {f.type === "number" ? (
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={String(inputs[f.key] ?? "")}
                    onChange={(e) => setField(f.key, Number(e.target.value))}
                    className="input-field"
                    placeholder={f.hint}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={String(inputs[f.key] ?? "")}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="input-field"
                  >
                    {f.options?.map((o) => (
                      <option key={String(o.value)} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inputs[f.key])}
                      onChange={(e) => setField(f.key, e.target.checked)}
                      className="rounded border-slate-400 bg-white text-indigo-600 focus:ring-indigo-600"
                    />
                    {f.label}
                  </label>
                )}
                {f.hint && <p className="text-xs text-slate-400 mt-1.5">{f.hint}</p>}
              </div>
            ))}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={computing}
                className="btn-primary disabled:opacity-60 disabled:shadow-none"
              >
                {computing ? "Calculating…" : "Calculate"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="btn-outline flex-1"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1 card p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">How it works</h3>
          <p className="text-sm text-slate-600 mb-5">{config.formula}</p>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">Estimates only — verify with local data before making purchases.</p>
          </div>
        </aside>
      </form>

      {results && results.length > 0 && (
        <section className="mb-14">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r) => {
              const style = RESULT_BADGE_STYLE[r.badge ?? "info"];
              return (
                <div key={r.id} className={`result-card p-5 ${style}`}>
                  <span className="text-[10px] uppercase tracking-tighter text-slate-400 mb-2">{r.label}</span>
                  <div className="mt-1 flex items-baseline gap-1 mb-1">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900">{r.value}</span>
                    {r.unit && <span className="text-sm text-slate-500">{r.unit}</span>}
                  </div>
                  {r.note && <p className="text-[11px] text-slate-400 mb-3">{r.note}</p>}
                  {r.badge && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
                      {r.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-14 card p-7">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Formula</h2>
        <p className="text-sm text-slate-600">{config.formula}</p>
      </section>

      {config.examples.length > 0 && (
        <section className="mb-14 card p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Worked examples</h2>
          <ul className="space-y-4">
            {config.examples.map((ex, i) => (
              <li key={i} className="border-l-3 border-indigo-600 bg-indigo-50 rounded-r-md p-5">
                <p className="font-medium text-slate-900">{ex.title}</p>
                <p className="text-sm text-slate-500 mt-1.5">{ex.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {config.faqs.length > 0 && (
        <section className="mb-14 card p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {config.faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                <p className="font-medium text-slate-900">{faq.q}</p>
                <p className="text-sm text-slate-500 mt-1.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {config.related.length > 0 && (
        <section className="card p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Related tools</h2>
          <p className="text-sm text-slate-500 mb-4">Explore more in {config.category}:</p>
          <div className="flex flex-wrap gap-3">
            {config.related.map((s) => (
              <Link
                key={s}
                href={`/tools/${s}`}
                className="text-sm border border-slate-300 rounded-[0.6rem] px-4 py-2 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-colors"
              >
                {s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
