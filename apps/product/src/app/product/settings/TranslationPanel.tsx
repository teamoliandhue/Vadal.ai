"use client";
/* Translation — a paid add-on (roadmap v3).

   Three things an admin decides here: whether the workspace has it, where it
   appears, and which provider reads Indian languages. The cost estimate is the
   evaluation the roadmap asked for, with every assumption visible and movable,
   and prices dated and linked to the provider's own page. */
import * as React from "react";
import { ExternalLink, Languages } from "lucide-react";
import { Badge, SparkMark, Switch } from "@vadal/design-system";
import { TRANSLATE_LANGS } from "@/lib/ai/engines/translate";
import { workspace } from "@/lib/settings";
import { PRICES_CHECKED, PROVIDERS, SURFACES, inr, monthlyCharacters, monthlyCostInr, type ProviderId } from "@/lib/translation";
import { setTranslationAddon, useTranslationAddon } from "../useTranslationAddon";
import { toast } from "../Toaster";

const eyebrow = "text-[12px] font-semibold uppercase tracking-[0.14em] text-faint";
const millions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;

export function TranslationPanel() {
  const addon = useTranslationAddon();
  const [languages, setLanguages] = React.useState(3);
  const [share, setShare] = React.useState(35);

  const usage = monthlyCharacters({ headcount: workspace.seats, languages, onDemandShare: share / 100 });
  const sarvam = PROVIDERS.find((p) => p.id === "sarvam")!;
  const google = PROVIDERS.find((p) => p.id === "google")!;
  const costs = PROVIDERS.map((p) => ({ p, cost: monthlyCostInr(p, usage.total) }));
  const perPerson = (n: number) => (n / workspace.seats).toFixed(2);

  return (
    <div className="flex flex-col gap-7">
      <div className="border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[18px] font-bold tracking-tight">Translation</h2>
          <Badge tone="brand" size="sm">Paid add-on</Badge>
        </div>
        <p className="mt-1 text-[14px] text-muted">People read and answer in their own language. Billed as an add-on — the price is in your order form.</p>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <Switch
          checked={addon.enabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTranslationAddon({ enabled: e.target.checked });
            toast(e.target.checked ? "Translation is on for this workspace" : "Translation is off — the controls are gone everywhere");
          }}
          label="Translation add-on"
          description="Off removes every translate control, so nobody is offered something the workspace hasn't turned on."
        />
      </div>

      <section className={`flex flex-col gap-3 transition ${addon.enabled ? "" : "pointer-events-none opacity-50"}`} aria-labelledby="tr-where">
        <p id="tr-where" className={eyebrow}>Where it appears</p>
        {SURFACES.map((s) => (
          <div key={s.key} className="rounded-2xl border border-line p-4">
            <Switch
              checked={addon.surfaces[s.key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTranslationAddon({ surfaces: { ...addon.surfaces, [s.key]: e.target.checked } })}
              label={s.first ? `${s.label} · ships first` : s.label}
              description={s.desc}
            />
          </div>
        ))}
      </section>

      <section className={`flex flex-col gap-3 transition ${addon.enabled ? "" : "pointer-events-none opacity-50"}`} aria-labelledby="tr-provider">
        <p id="tr-provider" className={eyebrow}>Indian languages go to</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const on = addon.indian === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTranslationAddon({ indian: p.id as ProviderId })}
                aria-pressed={on}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${on ? "border-[var(--purple)] bg-[var(--lav)]" : "border-line hover:border-[var(--purple)]"}`}
              >
                <span className="flex w-full items-center gap-2 text-[15px] font-semibold text-ink">
                  {p.name}
                  {p.id === "sarvam" && <Badge tone="success" size="sm">Recommended</Badge>}
                </span>
                <span className="text-[13px] text-muted">{p.fit}</span>
                <span className="mt-1 text-[13px] text-ink">{p.published}</span>
                <span className="text-[12px] text-faint">{p.free} · {p.languages}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-muted">Everything that isn&rsquo;t an Indian language goes to {google.name}. Translations are made once per item and language, then reused for every reader.</p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-line p-4 sm:p-5" aria-labelledby="tr-cost">
        <div className="flex items-center gap-2">
          <SparkMark size={14} tone="gradient" />
          <p id="tr-cost" className="text-[15px] font-semibold">What it costs to run, a month</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[13px]">
            <span className="flex justify-between text-muted"><span>Languages in use besides English</span><span className="font-bold tabular-nums text-ink">{languages}</span></span>
            <input type="range" min={1} max={7} value={languages} onChange={(e) => setLanguages(Number(e.target.value))} className="mt-2 w-full accent-[var(--purple)]" />
          </label>
          <label className="text-[13px]">
            <span className="flex justify-between text-muted"><span>Comments opened in another language</span><span className="font-bold tabular-nums text-ink">{share}%</span></span>
            <input type="range" min={5} max={80} step={5} value={share} onChange={(e) => setShare(Number(e.target.value))} className="mt-2 w-full accent-[var(--purple)]" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-soft p-3">
            <p className="text-[12px] text-faint">Characters translated</p>
            <p className="text-[20px] font-bold tabular-nums">{millions(usage.total)}</p>
            <p className="text-[12px] text-faint">{millions(usage.perLanguage)} per language</p>
          </div>
          {costs.map(({ p, cost }) => (
            <div key={p.id} className="rounded-xl bg-soft p-3">
              <p className="text-[12px] text-faint">All on {p.name.split(" ")[0]}</p>
              <p className="text-[20px] font-bold tabular-nums">{inr(cost)}</p>
              <p className="text-[12px] text-faint">₹{perPerson(cost)} a person a month</p>
            </div>
          ))}
        </div>

        <details className="group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[13px] font-semibold text-[var(--purple)] lg:min-h-0">The assumptions behind this</summary>
          <table className="mt-2 w-full text-[13px]">
            <caption className="sr-only">Characters translated per language, per month</caption>
            <tbody>
              {usage.lines.map((l) => (
                <tr key={l.label} className="border-t border-line">
                  <td className="py-2 pr-3 align-top text-ink">{l.label}<span className="block text-[12px] text-faint">{l.note}</span></td>
                  <td className="py-2 text-right align-top tabular-nums">{l.chars.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            {workspace.seats.toLocaleString("en-IN")} people. Dollar prices at ₹88 to $1. Summaries also use a language model to write the summary; that is billed under AI &amp; guardrails.
          </p>
        </details>

        <p className="text-[13px] leading-relaxed text-ink">
          {Math.max(...costs.map((c) => c.cost)) / workspace.seats < 1
            ? "Either provider costs less than a rupee a person a month at this size"
            : `Either provider costs at most ₹${perPerson(Math.max(...costs.map((c) => c.cost)))} a person a month at this size`}, so the choice is about quality, not price. Sarvam for Indian languages, with a native-speaker review of the first hundred translations before it goes to everyone.
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-faint">
          Prices checked {PRICES_CHECKED} —
          {[sarvam, google].map((p) => (
            <a key={p.id} href={p.source} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-1 underline-offset-2 hover:text-ink hover:underline lg:min-h-0">
              {p.name} pricing <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </p>
      </section>

      <section className="flex flex-col gap-2" aria-labelledby="tr-langs">
        <p id="tr-langs" className={eyebrow}>Languages</p>
        <ul className="divide-y divide-[var(--line)] rounded-2xl border border-line">
          {TRANSLATE_LANGS.map((l) => (
            <li key={l.code} className="flex items-center gap-3 px-4 py-3">
              <Languages className="h-4 w-4 shrink-0 text-faint" />
              <span lang={l.code} className="text-[14px] font-semibold text-ink">{l.label}</span>
              <span className="text-[13px] text-faint">{l.english}</span>
              <span className="ml-auto">{l.live ? <Badge tone="warning" size="sm">Demo content · review pending</Badge> : <Badge tone="neutral" size="sm">With the provider</Badge>}</span>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-faint">Safety instructions and policies are reviewed by a native speaker before a translation is shown as final.</p>
      </section>
    </div>
  );
}
