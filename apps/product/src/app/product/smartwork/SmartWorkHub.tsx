"use client";
/* SMARTWORK — the HR desk (Digital workplace, spec 051).

   What the platform means by SmartWork: HR Queries · Automated Resolution ·
   Smart Escalation · Policy Answers. The section that used to live here — the
   wellbeing companion, counsellors and crisis lines — moved to /product/icare
   with its route, its brief and its promises intact. They were two different
   products sharing one name, and the name belongs to this one.

   The shape follows what a person actually does:
   · Ask — a question answered from a named policy, or a task finished on the
     spot with a receipt;
   · My requests — what happened to each one, with a person's name on the
     escalations;
   · Desk (People team) — the share that never needed a human, and the three
     things that would move it.

   An escalation writes a real case into Flow's own store, so the People team
   has one queue rather than two, and the conversation travels with it. */
import * as React from "react";
import { Plus } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import { canAccess } from "@/lib/access";
import type { Case } from "@/lib/cases";
import {
  caseCategoryFor, caseTitleFor, seedRequests, type DeskAnswer, type DeskRequest, type InstantAction,
} from "@/lib/smartwork";
import { useViewAs } from "../useViewAs";
import { useMe } from "../useSession";
import { toast } from "../Toaster";
import { Ask } from "./Ask";
import { Desk } from "./Desk";
import { Requests } from "./Requests";
import { Eyebrow } from "./parts";

type View = "ask" | "requests" | "desk";

/* The HRBP an escalation lands with. Named, because "the People team" is who
   you chase and a person is who answers. */
const OWNER = { name: "Meera Pillai", role: "HRBP · Ops", img: "/avatars/user-7.svg" };

let seq = 0;

export function SmartWorkHub() {
  const [role] = useViewAs();
  const me = useMe();
  const isAdmin = canAccess(role, "Flow");
  const [view, setView] = React.useState<View>("ask");
  const [mine, setMine, ready] = usePersistentState<DeskRequest[]>("vadal:smartwork-requests", []);
  const [, setCases] = usePersistentState<Case[]>("vadal:cases-created", []);

  const requests = [...mine, ...seedRequests];
  const open = requests.filter((r) => r.kind === "escalated" && r.status !== "Resolved").length;

  const VIEWS: { id: View; label: string }[] = [
    { id: "ask", label: "Ask" },
    { id: "requests", label: open ? `My requests · ${open}` : "My requests" },
    ...(isAdmin ? [{ id: "desk" as const, label: "Desk" }] : []),
  ];

  const add = (r: DeskRequest) => setMine((all) => [r, ...all]);

  /* a task the desk finished — a receipt, not a ticket */
  function done(a: InstantAction) {
    add({ id: `d-${seq++}-${a.id}`, kind: "done", question: a.label, outcome: a.result, when: "just now" });
    toast(`Done — ${a.result}. It's in My requests.`);
  }

  function answered(q: string, outcome: string) {
    add({ id: `a-${seq++}-${q.length}`, kind: "answered", question: q, outcome, when: "just now" });
  }

  /* what the desk could not finish goes to a person, with the question
     attached — and becomes a case in Flow, not a second queue */
  function escalate(q: string, answer: DeskAnswer | null) {
    const caseId = `CASE-3${String(20 + seq).padStart(2, "0")}`;
    add({
      id: `e-${seq++}-${q.length}`, kind: "escalated", question: q,
      outcome: answer
        ? "Sent to the People team with the answer you were given, so they can see what was missing."
        : "Sent to the People team with what you wrote. They answer these in about a day.",
      when: "just now", caseId, owner: { name: OWNER.name, img: OWNER.img }, status: "With HR", dueInDays: 1,
    });
    setCases((all) => [
      {
        id: caseId,
        title: caseTitleFor(q),
        category: caseCategoryFor(q),
        subject: me.fullName,
        team: me.team ?? "—",
        confidential: false,
        status: "Open",
        priority: "Medium",
        owner: OWNER,
        source: "Manual",
        opened: "just now",
        slaDays: 1,
        timeline: [{ when: "just now", text: `Asked SmartWork: “${q}”`, who: me.fullName }],
        aiSummary: answer
          ? "SmartWork answered from policy and the person said it did not settle it — the gap is between the document and their case."
          : "No policy covers this. SmartWork could not answer it, so it came here with the person's own words.",
      },
      ...all,
    ]);
    setView("requests");
    toast(`${OWNER.name.split(" ")[0]} has it — ${caseId}. You won't be asked to explain it again.`);
  }

  if (!ready) return <div className="py-10" aria-busy="true" />;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Digital workplace</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">SmartWork</h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Your HR desk. Ask about pay, leave, insurance or policy and get an answer from the company&rsquo;s own documents — or have the whole thing done for you.
          </p>
        </div>
      </header>

      <nav aria-label="SmartWork views" className="flex items-center gap-1 border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "ask" && <Ask onDone={done} onAnswered={answered} onEscalate={escalate} />}
      {view === "requests" && <Requests items={requests} isAdmin={isAdmin} />}
      {view === "desk" && isAdmin && <Desk />}

      {view === "requests" && (
        <button onClick={() => setView("ask")} className="inline-flex min-h-[44px] items-center gap-1.5 self-start text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
          <Plus className="h-4 w-4" /> Ask something else
        </button>
      )}
    </div>
  );
}
