"use client";
/* Link — enterprise integrations (Platform · admins).

   The question a security reviewer and an HR admin both ask is the same:
   what does each connection read, what does it send, and what does it never
   touch. So every integration says that in plain words, the problems come
   first with what they break, and connecting something is a request to the
   Vadal team — it is never a button that quietly starts syncing people data. */
import * as React from "react";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, Info, KeyRound, Webhook, X } from "lucide-react";
import { Badge, Button, type BadgeTone } from "@vadal/design-system";
import { API_KEYS, INTEGRATIONS, LINK_ISSUES, WEBHOOKS, type Direction, type Integration, type LinkStatus } from "@/lib/platform";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";

const STATUS: Record<LinkStatus, { label: string; tone: BadgeTone }> = {
  connected: { label: "Connected", tone: "success" },
  attention: { label: "Needs attention", tone: "warning" },
  available: { label: "Available", tone: "neutral" },
};
const DIRECTION: Record<Direction, { label: string; Icon: typeof ArrowDownLeft }> = {
  in: { label: "Reads into Vadal", Icon: ArrowDownLeft },
  out: { label: "Sends from Vadal", Icon: ArrowUpRight },
  both: { label: "Both ways", Icon: ArrowLeftRight },
};

/** Which integration each problem comes from — the action opens it. */
const ISSUE_SOURCE: Record<string, string> = { "no-manager": "darwinbox", template: "whatsapp", "no-email": "darwinbox" };

export function LinkHub() {
  const [open, setOpen] = React.useState<Integration | null>(null);
  const [requested, setRequested] = usePersistentState<string[]>("vadal:link-requested", []);
  const [dismissed, setDismissed] = usePersistentState<string[]>("vadal:link-issues-seen", []);

  const connected = INTEGRATIONS.filter((i) => i.status !== "available");
  const issues = LINK_ISSUES.filter((i) => !dismissed.includes(i.id));
  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];
  const tiles: [string, string, string][] = [
    ["Connected", `${connected.length}`, `of ${INTEGRATIONS.length} available`],
    ["People synced", "12,480", "from Darwinbox, today 07:10"],
    ["Signing in with SSO", "10,268", "the rest use a one-time code"],
    ["Needs a look", `${issues.filter((i) => i.tone === "warning").length}`, "problems that change what people see"],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Platform</p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Link</h1>
        <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted">
          The systems Vadal reads from and sends to — and, for each one, exactly what it shares and what it never touches.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      {issues.length > 0 && (
        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="issues-h">
          <h2 id="issues-h" className="text-[18px] font-bold tracking-tight">What needs a look</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {issues.map((i) => (
              <li key={i.id} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: `color-mix(in srgb, var(--${i.tone === "warning" ? "warning" : "purple"}) 8%, transparent)` }}>
                {i.tone === "warning" ? <AlertTriangle className="mt-[2px] h-4 w-4 shrink-0 text-[var(--warning)]" /> : <Info className="mt-[2px] h-4 w-4 shrink-0 text-[var(--purple)]" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{i.title}</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{i.why}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3">
                    <button onClick={() => setOpen(INTEGRATIONS.find((x) => x.id === ISSUE_SOURCE[i.id]) ?? null)} className="min-h-[44px] text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">{i.action}</button>
                    <button onClick={() => { setDismissed((d) => [...d, i.id]); toast("Hidden — it comes back if it gets worse"); }} className="min-h-[44px] text-[13px] font-semibold text-muted hover:text-ink lg:min-h-0">Hide</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="int-h">
        <h2 id="int-h" className="text-[18px] font-bold tracking-tight">Integrations</h2>
        <div className="mt-2 flex flex-col gap-5">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{cat}</p>
              <ul className="mt-2 grid gap-3 md:grid-cols-2">
                {INTEGRATIONS.filter((i) => i.category === cat).map((i) => {
                  const D = DIRECTION[i.direction];
                  return (
                    <li key={i.id}>
                      <button onClick={() => setOpen(i)} className="flex h-full w-full items-start gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-[var(--purple)]">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-[20px]" aria-hidden>{i.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold text-ink">{i.name}</span>
                            <Badge tone={STATUS[i.status].tone} size="sm">{requested.includes(i.id) ? "Requested" : STATUS[i.status].label}</Badge>
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{i.purpose}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[12px] text-faint">
                            <span className="inline-flex items-center gap-1"><D.Icon className="h-3.5 w-3.5" /> {D.label}</span>
                            {i.lastSync && <span>Last sync {i.lastSync}</span>}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="api-h">
        <h2 id="api-h" className="text-[18px] font-bold tracking-tight">API and webhooks</h2>
        <p className="mt-1 text-[14px] text-muted">For your own tools. Keys are read-only unless the Vadal team scopes one otherwise, and a full key is shown once, when it&rsquo;s created.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><KeyRound className="h-4 w-4" /> Keys</p>
            <ul className="mt-2 flex flex-col divide-y divide-[var(--line)]">
              {API_KEYS.map((k) => (
                <li key={k.name} className="py-3 text-[13px]">
                  <p className="font-semibold text-ink">{k.name} <span className="font-mono text-[12px] font-normal text-faint">••••{k.last4}</span></p>
                  <p className="text-faint">{k.scope} · created {k.created} · last used {k.lastUsed}</p>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" className="mt-2 min-h-[44px] lg:min-h-0" onClick={() => toast("Key requests go to the Vadal team, who scope it with you", "info")}>Request a key</Button>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Webhook className="h-4 w-4" /> Webhooks</p>
            <ul className="mt-2 flex flex-col divide-y divide-[var(--line)]">
              {WEBHOOKS.map((w) => (
                <li key={w.event} className="py-3 text-[13px]">
                  <p className="font-mono text-[13px] text-ink">{w.event}</p>
                  <p className="break-all text-faint">→ {w.target} · <span className="text-[var(--success)]">{w.status}</span></p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Drawer open={!!open} title={open?.name} onClose={() => setOpen(null)}>
        {open && <Detail i={open} requested={requested.includes(open.id)} onRequest={() => { setRequested((r) => [...r, open.id]); toast(`Requested — the Vadal team will set up ${open.name} with your IT team`); }} />}
      </Drawer>
    </div>
  );
}

function Detail({ i, requested, onRequest }: { i: Integration; requested: boolean; onRequest: () => void }) {
  const D = DIRECTION[i.direction];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft text-[24px]" aria-hidden>{i.emoji}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[20px] font-bold tracking-tight">{i.name}</h2>
            <Badge tone={STATUS[i.status].tone} size="sm">{requested ? "Requested" : STATUS[i.status].label}</Badge>
          </div>
          <p className="mt-1 text-[14px] text-muted">{i.purpose}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] text-faint">
            <span className="inline-flex items-center gap-1"><D.Icon className="h-3.5 w-3.5" /> {D.label}</span>
            {i.schedule && <span>{i.schedule}</span>}
          </p>
        </div>
      </div>

      {i.issue && (
        <p className="flex items-start gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-4 py-3 text-[14px] text-ink">
          <AlertTriangle className="mt-[2px] h-4 w-4 shrink-0 text-[var(--warning)]" /> {i.issue}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-4">
          <p className="text-[13px] font-semibold text-ink">{i.direction === "out" ? "What it sends" : i.direction === "in" ? "What Vadal reads" : "What it shares"}</p>
          <ul className="mt-2 space-y-1.5 text-[14px] text-muted">
            {i.shares.map((s) => <li key={s} className="flex gap-2"><Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--success)]" />{s}</li>)}
          </ul>
        </div>
        {i.never && (
          <div className="rounded-2xl border border-line p-4">
            <p className="text-[13px] font-semibold text-ink">Never touches</p>
            <ul className="mt-2 space-y-1.5 text-[14px] text-muted">
              {i.never.map((s) => <li key={s} className="flex gap-2"><X className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {i.runs && (
        <div>
          <p className="text-[13px] font-semibold text-ink">Recent syncs</p>
          <ul className="mt-2 flex flex-col divide-y divide-[var(--line)] text-[13px]">
            {i.runs.map((r) => (
              <li key={r.when} className="flex items-start gap-2 py-2.5">
                {r.ok ? <Check className="mt-[2px] h-4 w-4 shrink-0 text-[var(--success)]" /> : <AlertTriangle className="mt-[2px] h-4 w-4 shrink-0 text-[var(--warning)]" />}
                <span className="min-w-0"><span className="font-semibold text-ink">{r.when}</span> <span className="text-muted">· {r.summary}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {i.status === "available" ? (
        <Button variant="brand" className="min-h-[44px] self-start lg:min-h-0" disabled={requested} onClick={onRequest}>
          {requested ? "Requested" : `Request ${i.name}`}
        </Button>
      ) : (
        <p className="text-[13px] text-faint">To change what this shares or disconnect it, talk to your Vadal success manager — people data changes are made together, not from a toggle.</p>
      )}
    </div>
  );
}
