"use client";
/* Posting & moderation — who may post and share, and what is checked before a
   post goes out. Rules apply the moment they change; the table under
   Sensitivity shows exactly what each setting does to each kind of post, and
   "Try a post" runs the real check so an admin can see it rather than trust it. */
import * as React from "react";
import Link from "next/link";
import { Switch } from "@vadal/design-system";
import { checkPost } from "@/lib/ai/engines/moderation";
import {
  AUDIENCE_LABEL, SENSITIVITY_LABEL, type Audience, type PostingPolicy, type Sensitivity,
} from "@/lib/posting";
import { usePostingPolicy } from "../usePostingPolicy";
import { toast } from "../Toaster";

const RIGHTS: { key: "feed" | "announcements" | "communities" | "share"; title: string; hint: string }[] = [
  { key: "feed", title: "Post in the company feed", hint: "Communities are open to their members whatever this says." },
  { key: "announcements", title: "Post in #company", hint: "The announcement channel. Most workspaces keep it to leadership." },
  { key: "communities", title: "Start a community", hint: "Joining one is always open." },
  { key: "share", title: "Share posts outside the company", hint: "Through Amplify — LinkedIn, X, WhatsApp." },
];
const AUDIENCES: Audience[] = ["everyone", "managers", "admins"];
const SENS: Sensitivity[] = ["relaxed", "standard", "strict"];

/* what each sensitivity does to each kind of post — derived from the engine, not written twice */
const SAMPLES: { label: string; text: string; media?: { src: string } }[] = [
  { label: "A threat, or a post that singles out a group", text: "watch your back" },
  { label: "A risky photo", text: "Done!", media: { src: "/feed/screen.jpg" } },
  { label: "Harsh words", text: "this is stupid" },
  { label: "Personal details", text: "call me on 98765 43210" },
];
const OUTCOME = { hold: "Held for a person", nudge: "Author gets a nudge", publish: "Posts" } as const;
const OUTCOME_TONE = { hold: "text-[var(--warning)]", nudge: "text-[var(--ai-accent)]", publish: "text-muted" } as const;

function Segmented<T extends string>({ value, options, label, onChange }: { value: T; options: { v: T; l: string }[]; label: string; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid w-full grid-cols-3 gap-1 rounded-full border border-line bg-soft p-1 sm:inline-flex sm:w-auto sm:shrink-0">
      {options.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`min-h-[44px] rounded-full px-2 text-[13px] font-semibold leading-tight transition sm:px-3 lg:min-h-[30px] ${value === o.v ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function PostingPanel() {
  const [policy, set] = usePostingPolicy();
  const [trial, setTrial] = React.useState("If the late shift keeps leaving pallets in bay 4, watch your back.");
  const change = (next: Partial<PostingPolicy>, what: string) => { set(next); toast(`${what} updated — applies to new posts now`); };
  const result = trial.trim() ? checkPost({ text: trial }, policy) : null;
  const eyebrow = "text-[12px] font-semibold uppercase tracking-[0.14em] text-faint";

  return (
    <div className="flex flex-col gap-7">
      <div className="border-b border-line pb-4">
        <h2 className="text-[18px] font-bold tracking-tight">Posting & moderation</h2>
        <p className="mt-1 text-[14px] text-muted">Who can post and share, and what is checked before a post goes out. Changes apply straight away.</p>
      </div>

      <section className="flex flex-col gap-3">
        <p className={eyebrow}>Who can</p>
        {RIGHTS.map((r) => (
          <div key={r.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
            <div className="min-w-[200px] flex-1">
              <div className="text-[14px] font-semibold">{r.title}</div>
              <div className="text-[13px] text-muted">{r.hint}</div>
            </div>
            <Segmented
              label={r.title}
              value={policy[r.key]}
              options={AUDIENCES.map((a) => ({ v: a, l: AUDIENCE_LABEL[a] }))}
              onChange={(v) => change({ [r.key]: v } as Partial<PostingPolicy>, r.title)}
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <p className={eyebrow}>Checked before posting</p>
        <div className="rounded-2xl border border-line p-4"><Switch checked={policy.checkText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => change({ checkText: e.target.checked }, "Wording check")} label="Check the wording" description="Threats, posts that single out a group, and harsh words." /></div>
        <div className="rounded-2xl border border-line p-4"><Switch checked={policy.checkPhotos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => change({ checkPhotos: e.target.checked }, "Photo check")} label="Check photos" description="Screens, documents and badges where people's details could be readable." /></div>
        <div className="rounded-2xl border border-line p-4"><Switch checked={policy.personalData} onChange={(e: React.ChangeEvent<HTMLInputElement>) => change({ personalData: e.target.checked }, "Personal details check")} label="Flag personal details" description="Phone numbers, email addresses, Aadhaar and PAN numbers." /></div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrow}>Sensitivity</p>
            <p className="mt-1 text-[13px] text-muted">{SENSITIVITY_LABEL[policy.sensitivity].hint}</p>
          </div>
          <Segmented label="Sensitivity" value={policy.sensitivity} options={SENS.map((s) => ({ v: s, l: SENSITIVITY_LABEL[s].label }))} onChange={(v) => change({ sensitivity: v }, "Sensitivity")} />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-soft text-left text-[12px] text-faint">
                <th className="px-4 py-2 font-semibold">When a post has…</th>
                <th className="px-4 py-2 font-semibold">What happens</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLES.map((s) => {
                const v = checkPost({ text: s.text, media: s.media }, { ...policy, checkText: true, checkPhotos: true, personalData: true }).verdict;
                return (
                  <tr key={s.label} className="border-t border-line">
                    <td className="px-4 py-2.5 text-ink">{s.label}</td>
                    <td className={`px-4 py-2.5 font-semibold ${OUTCOME_TONE[v]}`}>{OUTCOME[v]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
        <label htmlFor="try-post" className={eyebrow}>Try a post</label>
        <textarea id="try-post" value={trial} onChange={(e) => setTrial(e.target.value)} rows={2} className="w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-[16px] leading-relaxed text-ink outline-none focus:border-[var(--purple)] lg:text-[14px]" />
        {result && (
          <p className="text-[14px] leading-snug text-ink">
            <span className={`font-semibold ${OUTCOME_TONE[result.verdict]}`}>{OUTCOME[result.verdict]}.</span>{" "}
            {result.findings.length ? result.findings.map((f) => f.match ? `${f.reason} (“${f.match}”)` : f.reason).join(" · ") : "Nothing flagged."}
          </p>
        )}
      </section>

      <p className="text-[13px] text-muted">
        Held and reported posts wait in <Link href="/product/feed/review" className="font-semibold text-[var(--purple)] hover:underline">Social › Review</Link>.
      </p>
    </div>
  );
}
