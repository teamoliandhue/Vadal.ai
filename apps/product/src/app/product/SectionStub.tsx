"use client";
/* On-brand "coming soon" for nav destinations that aren't built yet — keeps the
   shell + nav intact so nothing is a dead end. Tailored copy per section, with a
   real Ask-Vadal CTA (vadal:ask) and a route back to Pulse. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@vadal/design-system";

export function SectionStub({
  icon, title, tagline, bullets, ask: askQ,
}: { icon: React.ReactNode; title: string; tagline: string; bullets: string[]; ask: string }) {
  const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
  return (
    <div className="flex min-h-[62vh] items-center justify-center">
      <section className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-card p-8 text-center shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--lav)] text-[var(--purple)]">{icon}</span>
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Coming soon</p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-[16px] leading-relaxed text-muted">{tagline}</p>
        <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[14px]">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-vgreen-soft text-vgreen"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="brand" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask(askQ)}>Ask Vadal</Button>
          <Link href="/product" className="flex items-center gap-1 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-1.5">Back to Pulse <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>
    </div>
  );
}
