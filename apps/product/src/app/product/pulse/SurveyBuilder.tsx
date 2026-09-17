"use client";
/* Survey builder — opens in the shared Drawer, seeded blank or from a template.
   Edit the name, audience, cadence and an editable question list (with types),
   get AI-suggested questions, preview the count, and launch. Emits a Survey the
   hub prepends to the live list (demo-only; persisted to localStorage). */
import * as React from "react";
import { GripVertical, Plus, Sparkles, X } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { Drawer } from "../Drawer";
import type { Survey } from "@/lib/listen";
import { toast } from "../Toaster";

export type BuilderSeed = { name: string; cadence: string; key?: string } | null;

type Q = { id: string; text: string; type: string };
const QTYPES = ["Scale 1–5", "Multiple choice", "Open text"] as const;
const AUDIENCES = ["All org", "New joiners", "People managers", "Leavers", "Engineering", "Sales", "Support", "Design"] as const;
const CADENCES = ["One-time", "Weekly", "Monthly", "Quarterly", "Triggered"] as const;
const AUDIENCE_SIZE: Record<string, number> = { "All org": 12480, "New joiners": 96, "People managers": 240, Leavers: 18, Engineering: 980, Sales: 1240, Support: 760, Design: 210 };
const KEY_TYPE: Record<string, string> = { pulse: "Pulse", enps: "eNPS", onboarding: "Lifecycle", exit: "Lifecycle", dei: "DEI", manager: "360", candidate: "Lifecycle" };

const STARTER: Record<string, string[]> = {
  pulse: ["I feel motivated at work.", "My workload is manageable.", "I get recognition for good work."],
  enps: ["How likely are you to recommend us as a place to work?"],
  onboarding: ["My onboarding set me up to succeed.", "I know who to go to for help.", "My first weeks matched expectations."],
  exit: ["What is the main reason you're leaving?", "What could we have done differently?"],
  dei: ["I feel I belong here.", "I can be myself at work.", "Decisions are made fairly."],
  manager: ["My manager gives helpful feedback.", "My manager supports my growth.", "My 1:1s are valuable."],
  candidate: ["The interview process was respectful of my time.", "Communication was clear throughout."],
};
const SUGGESTIONS = [
  "I would recommend my team as a great place to work.",
  "I have the tools and resources to do my job well.",
  "I see a path to grow my career here.",
  "Leadership communicates a clear direction.",
  "I feel comfortable raising concerns.",
];

let qid = 0;
const newQ = (text = "", type: string = QTYPES[0]): Q => ({ id: `q${qid++}`, text, type });

export function SurveyBuilder({ seed, onClose, onLaunch }: { seed: BuilderSeed; onClose: () => void; onLaunch: (s: Survey) => void }) {
  const [name, setName] = React.useState("");
  const [audience, setAudience] = React.useState<string>(AUDIENCES[0]);
  const [cadence, setCadence] = React.useState<string>(CADENCES[0]);
  const [questions, setQuestions] = React.useState<Q[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const sugIx = React.useRef(0);

  // (re)seed whenever the builder opens
  React.useEffect(() => {
    if (!seed) return;
    setName(seed.name);
    setCadence(seed.cadence);
    setAudience(AUDIENCES[0]);
    const starter = seed.key ? STARTER[seed.key] ?? [] : [];
    setQuestions(starter.length ? starter.map((t) => newQ(t, t.includes("?") ? "Open text" : "Scale 1–5")) : [newQ()]);
  }, [seed]);

  function suggest() {
    setThinking(true);
    window.setTimeout(() => {
      const picks = [SUGGESTIONS[sugIx.current % SUGGESTIONS.length], SUGGESTIONS[(sugIx.current + 1) % SUGGESTIONS.length]];
      sugIx.current += 2;
      setQuestions((qs) => [...qs, ...picks.map((t) => newQ(t, "Scale 1–5"))]);
      setThinking(false);
      toast("Vadal suggested 2 questions ✨");
    }, 650);
  }

  const valid = name.trim().length > 0 && questions.some((q) => q.text.trim());

  function launch() {
    if (!valid) return;
    const s: Survey = {
      name: name.trim(),
      type: (seed?.key && KEY_TYPE[seed.key]) || "Custom",
      audience,
      status: "live",
      responseRate: 0,
      responses: 0,
      sent: AUDIENCE_SIZE[audience] ?? 100,
      when: "Just launched",
    };
    onLaunch(s);
    toast(`“${s.name}” is live — sent to ${audience} 🚀`);
    onClose();
  }

  return (
    <Drawer open={!!seed} title="New survey" onClose={onClose}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">New survey</p>
      <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Build &amp; launch</h2>

      <label className="mt-5 block">
        <span className="text-[12px] font-semibold text-faint">Survey name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Q3 Engagement Pulse"
          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] outline-none transition focus:border-[var(--purple)]"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12px] font-semibold text-faint">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[14px] outline-none focus:border-[var(--purple)]">
            {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-faint">Cadence</span>
          <select value={cadence} onChange={(e) => setCadence(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[14px] outline-none focus:border-[var(--purple)]">
            {CADENCES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-1.5 text-[12px] text-faint">Will be sent to ~{(AUDIENCE_SIZE[audience] ?? 100).toLocaleString()} people.</p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[14px] font-bold">Questions <span className="font-normal text-faint">· {questions.length}</span></span>
        <button onClick={suggest} disabled={thinking} className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 disabled:opacity-60">
          <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Suggesting…" : "Suggest questions"}
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-start gap-2 rounded-xl border border-line p-2">
            <GripVertical className="mt-2 h-4 w-4 shrink-0 text-faint" aria-hidden />
            <div className="min-w-0 flex-1">
              <input
                value={q.text}
                onChange={(e) => setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, text: e.target.value } : x)))}
                placeholder={`Question ${i + 1}`}
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
              />
              <select
                value={q.type}
                onChange={(e) => setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, type: e.target.value } : x)))}
                className="mt-1 rounded-md bg-soft px-2 py-1 text-[12px] font-semibold text-muted outline-none"
              >
                {QTYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))} aria-label="Remove question" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setQuestions((qs) => [...qs, newQ()])} className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline">
        <Plus className="h-3.5 w-3.5" /> Add question
      </button>

      <div className="sticky bottom-0 -mx-7 -mb-7 mt-6 flex items-center justify-between gap-2 border-t border-line bg-card px-7 py-4">
        <span className="text-[12px] text-faint">{questions.filter((q) => q.text.trim()).length} question{questions.filter((q) => q.text.trim()).length === 1 ? "" : "s"} ready</span>
        <div className="flex items-center gap-2">
          <Button variant="tertiary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" disabled={!valid} leadingIcon={<SparkMark size={14} tone="solid" />} onClick={launch}>Launch survey</Button>
        </div>
      </div>
    </Drawer>
  );
}
