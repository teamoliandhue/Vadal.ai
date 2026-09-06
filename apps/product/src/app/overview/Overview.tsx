"use client";
/* ═══════════════════ the front door ═══════════════════
   `/` redirected to Home, Home is behind AuthGuard, so the first thing anyone
   who is not already signed in saw was a sign-in form. Zero of sixty-eight
   features in the first five seconds — then, after picking a persona, one
   employee's daily workspace, which surfaces about three of them.

   The breadth was real and completely invisible, which is the worst possible
   version of that problem.

   This is deliberately NOT a marketing page. Investors are about to use the
   actual product, and a page of claims followed by the real thing makes the
   real thing look smaller. It is an index: every section that exists, what it
   does in one line, what it costs to open, and one click into any of it. The
   grid is the argument — sixteen live sections read as depth in a way no
   paragraph does.

   Everything on it derives from NAV, FEATURES and SECTION_ACCESS, so it cannot
   advertise something the product does not have. */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { NAV } from "../product/nav-model";
import { SECTION_BLURB, aiCountFor, opensFor, headlineStats } from "@/lib/tour";
import { org } from "@/lib/data";
import { TENANTS, sessionFor, setSession } from "@/lib/auth";

const STATS = headlineStats();

/* Four ways in. Role changes what exists, so the entry point is the demo —
   an admin and a frontline operator see genuinely different products. */
const ENTRY = [
  { email: "priya@oliandhue.com", label: "HR admin", detail: "Sees everything" },
  { email: "anita@oliandhue.com", label: "Manager", detail: "Their team only" },
  { email: "aarav@oliandhue.com", label: "Employee", detail: "Desk worker" },
  { email: "ravi@oliandhue.com", label: "Frontline", detail: "Line operator, no desk" },
];

export function Overview() {
  const router = useRouter();

  function enterAs(email: string, to = "/product/home") {
    const tenant = TENANTS.find((t) => t.domains.some((d) => email.endsWith(d)));
    if (!tenant) return;
    setSession({ ...sessionFor(email, tenant, "sso"), onboarded: true });
    router.push(to);
  }

  return (
    <div className="lumen min-h-dvh bg-canvas text-ink" data-ds>
      <div className="mx-auto w-full max-w-[1240px] px-6 py-8 sm:px-10 sm:py-9">

        {/* ══ the thesis, and the numbers behind it ══ */}
        <header className="rise">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <SparkMark size={22} tone="gradient" />
                <span className="text-[15px] font-bold tracking-tight">Vadal</span>
                <span className="text-[13px] text-faint">· {org.name} · {org.headcount.toLocaleString()} people</span>
              </div>
              <h1 className="mt-3 max-w-[22ch] text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.04] tracking-[-0.03em]">
                Keeping a company human at scale.
              </h1>
              <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-muted">
                Seventeen sections and an assistant running through all of them — listening,
                recognising, teaching and looking after people, in an app they open daily rather
                than once a quarter.
              </p>
            </div>

            {/* Counted from the registry, never typed. */}
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                [STATS.aiFeatures, "AI features", "named in the brief"],
                [STATS.reachable, "live today", "reachable, not just built"],
                [STATS.sections, "sections", "each role-gated"],
                [STATS.pillars, "pillars", "one product, not seven"],
              ].map(([v, l, sub]) => (
                <div key={l as string}>
                  <dd className="text-[26px] font-bold leading-none tracking-tight tabular-nums">{v}</dd>
                  <dt className="mt-1.5 text-[13px] font-semibold">{l}</dt>
                  <dd className="text-[12px] text-faint">{sub}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* ══ enter ══ before the grid, because the grid is what they will
            explore AFTER deciding to look. Role is the choice that matters. ══ */}
        <section className="rise rise-1 mt-6 rounded-[22px] border border-line bg-card p-4 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold tracking-tight">Open the live product</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">
                No password. Role decides what exists — an admin and a line operator see a
                genuinely different product, which is the point.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ENTRY.map((p) => (
                <button
                  key={p.email}
                  onClick={() => enterAs(p.email)}
                  className="group min-h-[52px] rounded-2xl border border-line px-4 text-left transition hover:border-[var(--purple)] hover:bg-soft"
                >
                  <span className="block text-[14px] font-semibold transition group-hover:text-[var(--purple)]">{p.label}</span>
                  <span className="block text-[12px] text-faint">{p.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ the whole product, at once ══ */}
        <section className="mt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-faint">Everything in it</h2>
            <span className="text-[13px] text-muted">Click any section to open it live.</span>
          </div>

          {/* One grid, not eight stacked groups. The domain moved onto the tile
              as a label, which costs a line of 10px type and buys back roughly
              180px of eight repeated section headers — the difference between
              seeing four sections at a glance and seeing all seventeen. */}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {NAV.flatMap((group, gi) =>
              group.items.map((item) => {
                const Icon = item.icon;
                const ai = aiCountFor(item.label);
                const opens = opensFor(item.label);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`card-lift rise rise-${Math.min(gi + 1, 5)} group flex items-start gap-2.5 rounded-2xl border border-line bg-card p-3.5 transition hover:border-faint/50`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]">
                      <Icon className="h-[17px] w-[17px]" strokeWidth={1.85} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">{group.label}</span>
                        {opens !== "Everyone" && <Lock className="h-2.5 w-2.5 shrink-0 text-faint" aria-label={opens} />}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5">
                        <span className="text-[14.5px] font-semibold leading-tight transition group-hover:text-[var(--purple)]">{item.label}</span>
                        {ai > 0 && (
                          <span className="flex items-center gap-0.5 rounded-full bg-[var(--ai-surface)] px-1.5 text-[10px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)]">
                            <SparkMark size={9} tone="solid" /> {ai}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[12.5px] leading-snug text-muted">{SECTION_BLURB[item.label]}</span>
                    </span>
                  </Link>
                );
              }),
            )}
          </div>
        </section>

        {/* ══ the honest footer ══ investors ask this one, and being asked it
            after they find out is much worse than saying it first. ══ */}
        <footer className="mt-10 flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-line pt-6">
          <p className="min-w-0 max-w-[70ch] flex-1 text-[13px] leading-relaxed text-muted">
            <b className="font-semibold text-ink">This is the real front end, on demo data.</b>{" "}
            No model is connected yet — retrieval, citations, refusals, role gating, confirm-and-undo
            on every agentic action, and the crisis-detection tests are all real and enforced in code;
            the generated language is scripted until an API key is set.
          </p>
          <Link
            href="/product"
            className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-soft"
          >
            Skip to the dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
