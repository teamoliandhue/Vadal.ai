"use client";
/* KNOWLEDGE — the company brain, with the loop closed.

   Ask, read, and when it's wrong, say how — and the People team sees it:
   · Role-gated: manager and admin articles exist, and an answer never cites a
     document the asker cannot open.
   · Thumbs-down → correction: "wrong" is four different problems with four
     fixes, so the person picks which, and it lands in a queue with a count.
   · Unanswered → gap: a question with no answer is recorded as a gap and the
     person is handed to someone who can answer it now.
   · Staleness: a document over a year old says so where it is read, not only
     on the People team's dashboard.

   Employees see Ask, the library and Who to ask. Admins also see the gaps and
   corrections they own. */
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, Check, FileText, Languages, Lock, Search, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge, Button, SparkMark } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import { didAction } from "@/lib/tour";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  CORRECTION_REASONS, articles, canRead, collections, findAnswer, gaps, isStale, suggestedQuestions, usage, whoToAsk,
  type Article, type CorrectionReason,
} from "@/lib/knowledge";
import { Drawer } from "../Drawer";
import { TRANSLATE_LANGS, summaryIn } from "@/lib/ai/engines/translate";
import { useTranslatePref } from "../social/Translate";
import { useTranslates } from "../useTranslationAddon";
import { toast } from "../Toaster";
import { useViewAs } from "../useViewAs";

const collOf = (k: string) => collections.find((c) => c.key === k);
const articleOf = (id: string) => articles.find((a) => a.id === id);
const ageOf = (m: number) => (m >= 24 ? `${Math.floor(m / 12)} years` : m >= 12 ? "over a year" : `${m} months`);

type Correction = { id: string; target: string; kind: "article" | "answer"; reason: CorrectionReason; note: string; count: number; at: string; fixed?: boolean };
type AskedGap = { q: string; asks: number; at: string };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function RichText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

function StaleNote({ a }: { a: Article }) {
  if (!isStale(a)) return null;
  return (
    <div role="note" className="flex items-start gap-2.5 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
      <p className="text-[13px] leading-snug text-ink">
        <span className="font-semibold">Not updated in {ageOf(a.updatedMonthsAgo)}.</span> Check with the People team before you act on it.
      </p>
    </div>
  );
}

/* Thumbs up / down with the reason picker behind "down". */
function Feedback({ target, kind, onReport }: { target: string; kind: "article" | "answer"; onReport: (reason: CorrectionReason, note: string) => void }) {
  const [state, setState] = React.useState<"idle" | "up" | "picking" | "sent">("idle");
  const [reason, setReason] = React.useState<CorrectionReason | null>(null);
  const [note, setNote] = React.useState("");
  const btn = "grid h-11 w-11 place-items-center rounded-full transition lg:h-8 lg:w-8";

  if (state === "sent") return <p className="flex items-center gap-1.5 text-[13px] text-muted"><Check className="h-4 w-4 text-[var(--success)]" /> Sent to the People team. You&apos;ll hear back when it&apos;s fixed.</p>;
  if (state === "picking") {
    return (
      <div className="w-full">
        <p className="text-[13px] font-semibold text-ink">What&apos;s wrong with it?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="What's wrong">
          {CORRECTION_REASONS.map((r) => (
            <button key={r.key} role="radio" aria-checked={reason === r.key} onClick={() => setReason(r.key)}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-left transition ${reason === r.key ? "border-[var(--purple)] bg-[var(--lav)]" : "border-line bg-card hover:bg-soft"}`}>
              <span className="block text-[13px] font-semibold text-ink">{r.label}</span>
              <span className="block text-[12px] text-muted">{r.hint}</span>
            </button>
          ))}
        </div>
        <label className="mt-2 block">
          <span className="sr-only">Anything else</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={reason === "contradicts" ? "What were you told? (optional)" : "Anything else? (optional)"}
            className="min-h-[44px] w-full rounded-xl border border-line bg-card px-3 text-[16px] outline-none focus:border-[var(--purple)] lg:text-[14px]" />
        </label>
        <div className="mt-2 flex gap-2">
          <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={!reason} onClick={() => { if (reason) { onReport(reason, note.trim()); setState("sent"); } }}>Send to the People team</Button>
          <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => setState("idle")}>Cancel</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-[12px] text-faint">{state === "up" ? "Glad it helped" : "Was this helpful?"}</span>
      <button aria-label={`This ${kind} helped`} aria-pressed={state === "up"} onClick={() => setState("up")} className={`${btn} ${state === "up" ? "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[var(--success)]" : "text-faint hover:bg-card hover:text-[var(--success)]"}`}><ThumbsUp className="h-4 w-4" /></button>
      <button aria-label={`Something is wrong with this ${kind}`} onClick={() => setState("picking")} className={`${btn} text-faint hover:bg-card hover:text-[var(--danger)]`}><ThumbsDown className="h-4 w-4" /></button>
      <span className="sr-only">{target}</span>
    </div>
  );
}

export function KnowledgeHub() {
  const [role] = useViewAs();
  const isAdmin = canAccess(role, "Settings");
  const [query, setQuery] = React.useState("");
  const [asking, setAsking] = React.useState(false);
  const [result, setResult] = React.useState<{ q: string; answer: string; sources: string[]; matched: boolean } | null>(null);
  const [coll, setColl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<Article | null>(null);
  const [corrections, setCorrections] = usePersistentState<Correction[]>("vadal:kb-corrections", []);
  const [asked, setAsked] = usePersistentState<AskedGap[]>("vadal:kb-gaps", []);

  const visible = articles.filter((a) => canRead(a, role));
  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    setQuery(question);
    setAsking(true);
    setResult(null);
    window.setTimeout(() => {
      const r = findAnswer(question, role);
      setResult({ q: question, ...r });
      if (!r.matched && r.sources.length === 0) {
        setAsked((g) => {
          const hit = g.find((x) => x.q.toLowerCase() === question.toLowerCase());
          return hit ? g.map((x) => (x === hit ? { ...x, asks: x.asks + 1 } : x)) : [{ q: question, asks: 1, at: "just now" }, ...g];
        });
      }
      didAction("answer");
      setAsking(false);
    }, 750);
  };

  const report = (target: string, kind: "article" | "answer") => (reason: CorrectionReason, note: string) => {
    setCorrections((cs) => {
      const hit = cs.find((c) => c.target === target && c.reason === reason && !c.fixed);
      return hit ? cs.map((c) => (c === hit ? { ...c, count: c.count + 1, note: note || c.note } : c)) : [{ id: `c-${Date.now()}`, target, kind, reason, note, count: 1, at: "just now" }, ...cs];
    });
  };

  const list = (coll ? visible.filter((a) => a.collection === coll) : [...visible]).sort((a, b) => b.views - a.views);
  const openCorrections = corrections.filter((c) => !c.fixed);
  const allGaps = [...asked.map((g) => ({ q: g.q, asks: g.asks, reason: "Asked here, no answer found", fresh: true })), ...gaps.map((g) => ({ ...g, fresh: false }))];
  const staleCount = visible.filter(isStale).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.10] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative">
          <Eyebrow>Learn</Eyebrow>
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Knowledge</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">Ask anything about policies, pay, leave or how things work here. Nudge answers from the knowledge base, shows its sources, and tells you when a document is out of date.</p>

          <form onSubmit={(e) => { e.preventDefault(); ask(query); }} className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-soft p-2 focus-within:border-[var(--purple)]">
            <Search className="ml-2 h-5 w-5 shrink-0 text-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Ask a question" placeholder="Ask a question — e.g. How many paid leaves do I have?" className="min-h-[44px] min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-faint lg:text-[15px]" />
            <Button type="submit" variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={asking || !query.trim()} leadingIcon={<SparkMark size={14} tone="solid" />}>{asking ? "Thinking…" : "Ask"}</Button>
          </form>

          {!result && !asking && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((s) => (
                <button key={s} onClick={() => ask(s)} className="min-h-[44px] rounded-full border border-line bg-card px-3 text-[13px] text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[32px]">{s}</button>
              ))}
            </div>
          )}

          {asking && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[var(--ai-surface)] p-4 text-[14px] text-muted ring-1 ring-[var(--ai-border)]"><Sparkles className="ai-breathe h-4 w-4 text-[var(--ai-accent)]" /> Searching the knowledge base…</div>
          )}

          {result && (
            <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-5 ring-1 ring-[var(--ai-border)]">
              <div className="flex items-center gap-2"><SparkMark size={14} /><span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ai-accent)]">Nudge · answer</span></div>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink"><RichText text={result.answer} /></p>

              {result.sources.map(articleOf).filter((a): a is Article => Boolean(a && isStale(a))).map((a) => (
                <div key={a.id} className="mt-3"><StaleNote a={a} /></div>
              ))}

              {result.sources.length > 0 && (
                <div className="mt-3.5">
                  <p className="text-[12px] font-semibold text-faint">Sources</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {result.sources.map((id) => { const a = articleOf(id); return a ? (
                      <button key={id} onClick={() => setOpen(a)} className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[12px] font-semibold text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[30px]"><FileText className="h-3.5 w-3.5" /> {a.title}</button>
                    ) : null; })}
                  </div>
                </div>
              )}

              {!result.matched && result.sources.length === 0 && (
                <div className="mt-3.5 rounded-2xl bg-card p-4 ring-1 ring-[var(--ai-border)]">
                  <p className="text-[13px] font-semibold text-ink">Who can answer this now</p>
                  <ul className="mt-2 flex flex-col">
                    {whoToAsk.map((w) => (
                      <li key={w.label}>
                        <Link href={w.href} className="group flex min-h-[48px] items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-soft/60">
                          <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-ink">{w.label}</span><span className="block text-[12px] text-muted">{w.detail}</span></span>
                          <ArrowRight className="h-4 w-4 text-faint group-hover:text-[var(--purple)]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--ai-border)] pt-3">
                {(result.matched || result.sources.length > 0) && <Feedback key={result.q} target={result.q} kind="answer" onReport={report(result.q, "answer")} />}
                <button onClick={() => { setResult(null); setQuery(""); }} className="ml-auto min-h-[44px] text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">Ask another</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between"><Eyebrow>Browse by collection</Eyebrow>{coll && <button onClick={() => setColl(null)} className="min-h-[44px] text-[12px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">Show all</button>}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {collections.map((c) => {
            const on = coll === c.key;
            const n = visible.filter((a) => a.collection === c.key).length;
            return (
              <button key={c.key} onClick={() => setColl(on ? null : c.key)} aria-pressed={on} className={`card-lift flex flex-col items-start gap-2 rounded-2xl border bg-card p-4 text-left transition ${on ? "border-[var(--purple)] ring-1 ring-[var(--purple)]/30" : "border-line"}`}>
                <span className="text-[22px]" aria-hidden>{c.emoji}</span>
                <span className="text-[14px] font-semibold leading-tight">{c.label}</span>
                <span className="text-[12px] text-faint">{n} {n === 1 ? "article" : "articles"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[14px] font-semibold group-hover:text-[var(--purple)]">{a.title}</span>
                      {a.audience && <Badge tone="brand" size="sm">{a.audience.includes("manager") ? "Managers" : "Admins"}</Badge>}
                      {isStale(a) && <Badge tone="warning" size="sm">Out of date</Badge>}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-muted">{a.excerpt}</div>
                    <div className="mt-1 text-[12px] text-faint">{collOf(a.collection)?.label} · {a.updated} · {a.readMins} min read</div>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--purple)]" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">
          {isAdmin ? (
            <>
              <Card>
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Corrections · from readers</Eyebrow></div>
                <p className="mt-2 text-[13px] text-muted">When someone says an answer or article is wrong, and why.</p>
                {openCorrections.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-faint">Nothing reported. Thumbs-down on any answer lands here.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {openCorrections.map((c) => {
                      const a = articleOf(c.target);
                      const r = CORRECTION_REASONS.find((x) => x.key === c.reason)!;
                      return (
                        <li key={c.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[14px] font-medium text-ink">{a ? a.title : `“${c.target}”`}</p>
                              <p className="mt-0.5 text-[12px] text-faint">{r.label} · {c.count} {c.count === 1 ? "report" : "reports"} · {c.kind}</p>
                              {c.note && <p className="mt-1 text-[13px] text-muted">“{c.note}”</p>}
                            </div>
                            <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => { setCorrections((cs) => cs.map((x) => (x.id === c.id ? { ...x, fixed: true } : x))); toast("Marked fixed — the people who reported it are told"); }}>Mark fixed</Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card>
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Knowledge gaps</Eyebrow></div>
                <p className="mt-2 text-[13px] text-muted">Questions the base couldn&rsquo;t answer, newest first.{staleCount ? ` ${staleCount} ${staleCount === 1 ? "document is" : "documents are"} over a year old.` : ""}</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {allGaps.map((g) => (
                    <li key={g.q} className="flex items-start justify-between gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5"><span className="text-[14px] font-medium">{g.q}</span>{g.fresh && <Badge tone="info" size="sm">New</Badge>}</div>
                        <div className="mt-0.5 text-[12px] text-faint">{g.asks} {g.asks === 1 ? "ask" : "asks"} · {g.reason}</div>
                      </div>
                      <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => toast(`Nudge is drafting an article for “${g.q}” — it lands in drafts for review`, "info")}>Draft</Button>
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
            </>
          ) : (
            <Card>
              <Eyebrow>Can&apos;t find it?</Eyebrow>
              <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Who to ask</h2>
              <ul className="mt-3 flex flex-col">
                {whoToAsk.map((w) => (
                  <li key={w.label} className="border-t border-line first:border-t-0">
                    <Link href={w.href} className="group flex min-h-[56px] items-center gap-3 py-3">
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-ink">{w.label}</span><span className="block text-[13px] text-muted">{w.detail}</span></span>
                      <ArrowRight className="h-4 w-4 text-faint group-hover:text-[var(--purple)]" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-faint"><Lock className="h-3.5 w-3.5" /> Some documents are for managers or the People team, and won&apos;t appear here.</p>
            </Card>
          )}
        </div>
      </div>

      <Drawer open={!!open} title={open?.title} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-center gap-2 text-[12px] text-faint"><BookOpen className="h-3.5 w-3.5" /> {collOf(open.collection)?.label} · {open.readMins} min read</div>
            <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-tight">{open.title}</h2>
            <p className="mt-1 text-[12px] text-faint">{open.updated} · {open.views.toLocaleString()} views</p>
            <div className="mt-4"><StaleNote a={open} /></div>
            <Summary key={open.id} docId={open.id} />

            <div className="mt-5 flex flex-col gap-4">
              {open.sections.map((s, i) => (
                <div key={i}>
                  {s.heading && <h3 className="text-[15px] font-bold">{s.heading}</h3>}
                  {s.text && <p className="mt-1 text-[14px] leading-relaxed text-muted">{s.text}</p>}
                  {s.bullets && <ul className="mt-2 flex flex-col gap-1.5">{s.bullets.map((b, j) => <li key={j} className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--purple)]" aria-hidden />{b}</li>)}</ul>}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
              <Feedback key={open.id} target={open.id} kind="article" onReport={report(open.id, "article")} />
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

/* A summary in the reader's language — Indian-language summaries ship first
   (roadmap v3). A reading aid: the document above is what applies. */
function Summary({ docId }: { docId: string }) {
  const on = useTranslates("summaries");
  const [pref] = useTranslatePref();
  const [open, setOpen] = React.useState(false);
  if (!on) return null;
  const lang = TRANSLATE_LANGS.find((l) => l.code === pref.lang) ?? TRANSLATE_LANGS[0];
  const result = open ? summaryIn(docId, lang.code) : null;
  return (
    <div className="mt-4">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] hover:opacity-80 lg:min-h-[28px]">
        <Languages className="h-4 w-4" /> {open ? "Hide summary" : <>Summary in <span lang={lang.code}>{lang.label}</span></>}
      </button>
      {result?.ok && (
        <div lang={lang.code} className="mt-2 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] px-4 py-3">
          <p className="text-[15px] leading-relaxed text-ink">{result.text}</p>
          <p lang="en" className="mt-2 text-[12px] text-muted">Summarised in {lang.english} by Nudge · a reading aid — the policy below is what applies</p>
        </div>
      )}
      {result && !result.ok && <p className="mt-2 rounded-2xl border border-dashed border-line px-4 py-3 text-[13px] text-muted">{result.reason}</p>}
    </div>
  );
}
