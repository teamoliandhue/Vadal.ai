"use client";
/* KNOWLEDGE — the company brain. An AI answer box that cites its sources, a
   browsable policy/HR library by collection, AI-detected knowledge gaps from
   real questions, and usage. Same Lumen shell + Aurora AI accents. Ask uses a
   simple local matcher over seeded articles (lib/knowledge). */
import * as React from "react";
import { ArrowRight, BookOpen, FileText, Search, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import {
  collections, articles, suggestedQuestions, gaps, usage, findAnswer,
  type Article,
} from "@/lib/knowledge";

const collOf = (k: string) => collections.find((c) => c.key === k);
const articleOf = (id: string) => articles.find((a) => a.id === id);

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
/* renders **bold** spans in canned answers */
function RichText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

export function KnowledgeHub() {
  const [query, setQuery] = React.useState("");
  const [asking, setAsking] = React.useState(false);
  const [result, setResult] = React.useState<{ q: string; answer: string; sources: string[]; matched: boolean } | null>(null);
  const [coll, setColl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<Article | null>(null);
  const [voted, setVoted] = React.useState<string | null>(null);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    setQuery(question);
    setAsking(true);
    setResult(null);
    window.setTimeout(() => {
      setResult({ q: question, ...findAnswer(question) });
      setAsking(false);
    }, 750);
  };

  const list = (coll ? articles.filter((a) => a.collection === coll) : [...articles]).sort((a, b) => b.views - a.views);

  return (
    <div className="flex flex-col gap-6">
      {/* hero + ask */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.10] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative">
          <Eyebrow>Knowledge</Eyebrow>
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">The company brain</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">Ask anything about policies, pay, leave or how things work here. Vadal answers from the knowledge base and shows its sources.</p>

          <form onSubmit={(e) => { e.preventDefault(); ask(query); }} className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-soft p-2 focus-within:border-[var(--purple)]">
            <Search className="ml-2 h-5 w-5 shrink-0 text-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask a question — e.g. How many paid leaves do I have?" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-faint" />
            <Button type="submit" variant="brand" size="sm" disabled={asking || !query.trim()} leadingIcon={<SparkMark size={14} tone="solid" />}>{asking ? "Thinking…" : "Ask Vadal"}</Button>
          </form>

          {!result && !asking && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-line bg-card px-3 py-1.5 text-[13px] text-muted transition hover:border-[var(--purple)] hover:text-ink">{s}</button>
              ))}
            </div>
          )}

          {asking && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[var(--ai-surface)] p-4 text-[14px] text-muted ring-1 ring-[var(--ai-border)]"><Sparkles className="ai-breathe h-4 w-4 text-[var(--ai-accent)]" /> Searching the knowledge base…</div>
          )}

          {result && (
            <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-5 ring-1 ring-[var(--ai-border)]">
              <div className="flex items-center gap-2"><SparkMark size={14} /><span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ai-accent)]">Vadal · answer</span></div>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink"><RichText text={result.answer} /></p>
              {result.sources.length > 0 && (
                <div className="mt-3.5">
                  <p className="text-[12px] font-semibold text-faint">Sources</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {result.sources.map((id) => { const a = articleOf(id); return a ? (
                      <button key={id} onClick={() => setOpen(a)} className="flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[12px] font-semibold text-muted transition hover:border-[var(--purple)] hover:text-ink"><FileText className="h-3.5 w-3.5" /> {a.title}</button>
                    ) : null; })}
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center gap-3 border-t border-[var(--ai-border)] pt-3">
                <span className="text-[12px] text-faint">Was this helpful?</span>
                <button onClick={() => toast("Thanks — glad it helped ✓")} className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-card hover:text-[var(--success)]"><ThumbsUp className="h-4 w-4" /></button>
                <button onClick={() => toast("Logged — the People team will improve this", "info")} className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-card hover:text-[var(--danger)]"><ThumbsDown className="h-4 w-4" /></button>
                <button onClick={() => { setResult(null); setQuery(""); }} className="ml-auto text-[12px] font-semibold text-[var(--purple)] hover:underline">Ask another</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* browse by collection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between"><Eyebrow>Browse by collection</Eyebrow>{coll && <button onClick={() => setColl(null)} className="text-[12px] font-semibold text-[var(--purple)] hover:underline">Show all</button>}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {collections.map((c) => {
            const on = coll === c.key;
            return (
              <button key={c.key} onClick={() => setColl(on ? null : c.key)} className={`card-lift flex flex-col items-start gap-2 rounded-2xl border bg-card p-4 text-left transition ${on ? "border-[var(--purple)] ring-1 ring-[var(--purple)]/30" : "border-line"}`}>
                <span className="text-[22px]" aria-hidden>{c.emoji}</span>
                <span className="text-[14px] font-semibold leading-tight">{c.label}</span>
                <span className="text-[12px] text-faint">{c.count} articles</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* articles */}
        <div className="xl:col-span-7">
          <Card className="!p-0">
            <div className="flex items-center justify-between p-6 pb-3 sm:px-7">
              <div><Eyebrow>{coll ? collOf(coll)?.label : "Most read"}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Articles</h2></div>
              <span className="rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">{list.length}</span>
            </div>
            <div className="flex flex-col">
              {list.map((a) => (
                <button key={a.id} onClick={() => setOpen(a)} className="group flex items-start gap-3 border-t border-line px-6 py-3.5 text-left transition hover:bg-soft/40 sm:px-7">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[16px]" aria-hidden>{collOf(a.collection)?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold group-hover:text-[var(--purple)]">{a.title}</div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-muted">{a.excerpt}</div>
                    <div className="mt-1 text-[12px] text-faint">{collOf(a.collection)?.label} · {a.updated} · {a.readMins} min read</div>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--purple)]" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* gaps + usage */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Knowledge gaps · AI-detected</Eyebrow></div>
            <p className="mt-2 text-[13px] text-muted">Questions people ask that the base can&rsquo;t answer well.</p>
            <ul className="mt-3 flex flex-col gap-3">
              {gaps.map((g) => (
                <li key={g.q} className="flex items-start justify-between gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <div className="min-w-0"><div className="text-[14px] font-medium">{g.q}</div><div className="mt-0.5 text-[12px] text-faint">{g.asks} asks · {g.reason}</div></div>
                  <Button variant="secondary" size="sm" className="shrink-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => toast(`Drafting an article for “${g.q}” ✨`, "info")}>Draft</Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <Eyebrow>Usage · 30 days</Eyebrow>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {[["Questions answered", usage.questions], ["AI resolution", `${usage.resolved}%`], ["Article views", usage.views], ["Search success", `${usage.searchSuccess}%`]].map(([l, v]) => (
                <div key={l}><div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">{l}</div><div className="mt-1 text-[20px] font-bold tracking-tight">{v}</div></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* article drawer */}
      <Drawer open={!!open} title={open?.title} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-center gap-2 text-[12px] text-faint"><BookOpen className="h-3.5 w-3.5" /> {collOf(open.collection)?.label} · {open.readMins} min read</div>
            <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-tight">{open.title}</h2>
            <p className="mt-1 text-[12px] text-faint">{open.updated} · {open.views.toLocaleString()} views</p>

            <div className="mt-5 flex flex-col gap-4">
              {open.sections.map((s, i) => (
                <div key={i}>
                  {s.heading && <h3 className="text-[15px] font-bold">{s.heading}</h3>}
                  {s.text && <p className="mt-1 text-[14px] leading-relaxed text-muted">{s.text}</p>}
                  {s.bullets && <ul className="mt-2 flex flex-col gap-1.5">{s.bullets.map((b, j) => <li key={j} className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--purple)]" aria-hidden />{b}</li>)}</ul>}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="text-[13px] font-semibold">Was this helpful?</span>
              <button onClick={() => { setVoted("up"); toast("Thanks for the feedback ✓"); }} className={`grid h-8 w-8 place-items-center rounded-full transition ${voted === "up" ? "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]" : "text-faint hover:bg-soft hover:text-ink"}`}><ThumbsUp className="h-4 w-4" /></button>
              <button onClick={() => { setVoted("down"); toast("Logged — we'll improve this", "info"); }} className={`grid h-8 w-8 place-items-center rounded-full transition ${voted === "down" ? "bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-[var(--danger)]" : "text-faint hover:bg-soft hover:text-ink"}`}><ThumbsDown className="h-4 w-4" /></button>
              <Button variant="tertiary" size="sm" className="ml-auto" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => { setOpen(null); ask(open.title); }}>Ask Vadal</Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
