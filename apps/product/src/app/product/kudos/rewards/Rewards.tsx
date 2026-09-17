"use client";
/* Rewards — the catalogue.

   Employees see what their balance can buy now, what is one step away, and who
   actually fulfils each thing. Redeeming shows the balance after and what
   happens next before anything is spent. Experiences wait for a manager.

   Admins get a "Set up the catalogue" panel: which kinds are on, the price of
   each experience, and a plain list of what can never be added.

   With points off there is nothing to spend: the page lists the experiences a
   manager can grant, and managers get a Grant button. */
import * as React from "react";
import { Ban, Check, Clock3, Gift, Settings2 } from "lucide-react";
import { Button, Switch } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import { KIND_LABEL, KIND_SOURCE, NOT_ALLOWED, REWARDS, TIERS, tierOf, type Reward, type RewardKind } from "@/lib/rewards";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../../Drawer";
import { KudosTabs } from "../KudosTabs";
import { redeem, useWallet } from "../useWallet";
import { usePoints } from "../../usePointsMode";
import { useViewAs } from "../../useViewAs";
import { toast } from "../../Toaster";

const KINDS: RewardKind[] = ["merch", "voucher", "experience", "giving"];
type Filter = "all" | RewardKind | "affordable";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

function RewardCard({ r, cost, balance, showCost, onPick, action }: { r: Reward; cost: number; balance: number; showCost: boolean; onPick: () => void; action: string }) {
  const short = Math.max(0, cost - balance);
  const can = !showCost || short === 0;
  return (
    <li className="card-lift flex flex-col rounded-[22px] border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--lav)] text-[28px]" aria-hidden>{r.emoji}</span>
        {r.needsApproval && <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-muted">Manager approves</span>}
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-snug tracking-tight text-ink">{r.name}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-snug text-muted">{r.blurb}</p>
      <p className="mt-2 text-[12px] text-faint">{KIND_SOURCE[r.kind]}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3.5">
        {showCost ? (
          <span>
            <span className="block text-[16px] font-bold tabular-nums text-ink">{cost.toLocaleString("en-US")} <span className="text-[12px] font-semibold text-faint">pts</span></span>
            <span className="block text-[12px] text-faint">{r.value ? `${inr(r.value)} value` : can ? "You can have this" : `${short.toLocaleString("en-US")} to go`}</span>
          </span>
        ) : <span className="text-[12px] text-faint">{r.needsApproval ? "Granted by a manager" : ""}</span>}
        <Button variant={can ? "brand" : "secondary"} size="sm" className="min-h-[44px] lg:min-h-0" onClick={onPick}>{can ? action : "See details"}</Button>
      </div>
    </li>
  );
}

export function Rewards() {
  const points = usePoints();
  const [role] = useViewAs();
  const { balance, lifetime, redemptions } = useWallet();
  const isAdmin = canAccess(role, "Settings");
  const isManager = canAccess(role, "Manager hub");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [pick, setPick] = React.useState<Reward | null>(null);
  const [setup, setSetup] = React.useState(false);
  const [kindsOn, setKindsOn] = usePersistentState<Record<RewardKind, boolean>>("vadal:rewards-kinds", { merch: true, voucher: true, experience: true, giving: true });
  const [prices, setPrices] = usePersistentState<Record<string, number>>("vadal:rewards-prices", {});

  const costOf = (r: Reward) => prices[r.id] ?? r.cost;
  const catalogue = REWARDS.filter((r) => kindsOn[r.kind] !== false);
  const tier = tierOf(lifetime);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];

  const list = points
    ? catalogue.filter((r) => filter === "all" ? true : filter === "affordable" ? costOf(r) <= balance : r.kind === filter).sort((a, b) => costOf(a) - costOf(b))
    : catalogue.filter((r) => r.kind === "experience");

  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;
  const pending = redemptions.filter((r) => r.status === "waiting");

  return (
    <div className="flex flex-col gap-6">
      <KudosTabs active="rewards" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{points ? `${tier.name} · ${balance.toLocaleString("en-US")} points to spend` : "Rewards"}</Eyebrow>
          <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">{points ? "Rewards" : "Experiences"}</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            {points
              ? nextTier ? `${(nextTier.from - lifetime).toLocaleString("en-US")} more lifetime points to ${nextTier.name}. Tiers never go down, and spending doesn't lower yours.` : "You're at the top tier."
              : "This workspace doesn't use points. These are the experiences a manager can give someone, as a thank-you."}
          </p>
        </div>
        {isAdmin && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Settings2 className="h-4 w-4" />} onClick={() => setSetup(true)}>Set up the catalogue</Button>}
      </header>

      {pending.length > 0 && points && (
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-soft/60 px-4 py-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-[14px] text-ink">
            {pending.map((p) => REWARDS.find((r) => r.id === p.rewardId)?.name).join(", ")} {pending.length === 1 ? "is" : "are"} waiting for your manager.
            <span className="text-muted"> The points are held, not spent, until they decide.</span>
          </p>
        </div>
      )}

      {points && (
        <div role="group" aria-label="Filter rewards" className="flex flex-wrap gap-1 rounded-full bg-soft p-1 lg:w-fit">
          <button className={seg(filter === "all")} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          <button className={seg(filter === "affordable")} aria-pressed={filter === "affordable"} onClick={() => setFilter("affordable")}>Within my points</button>
          {KINDS.filter((k) => kindsOn[k] !== false).map((k) => (
            <button key={k} className={seg(filter === k)} aria-pressed={filter === k} onClick={() => setFilter(k)}>{KIND_LABEL[k]}</button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-line px-6 py-14 text-center">
          <Gift className="mx-auto h-7 w-7 text-faint" />
          <p className="mt-2 text-[15px] font-semibold text-ink">{filter === "affordable" ? "Nothing within your points yet" : "Nothing in the catalogue"}</p>
          <p className="mt-1 text-[14px] text-faint">{filter === "affordable" ? "The mug is 100 — and a kudos received is 25." : "An admin can switch kinds on in Set up the catalogue."}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <RewardCard key={r.id} r={r} cost={costOf(r)} balance={balance} showCost={points} onPick={() => setPick(r)} action={points ? "Redeem" : isManager ? "Grant" : "Details"} />
          ))}
        </ul>
      )}

      {/* redeem / grant */}
      <Drawer open={!!pick} title={pick?.name ?? "Reward"} onClose={() => setPick(null)}>
        {pick && (
          <div className="flex flex-col gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-[var(--lav)] text-[40px]" aria-hidden>{pick.emoji}</span>
            <div>
              <h2 className="text-[22px] font-bold tracking-tight">{pick.name}</h2>
              <p className="mt-1 text-[14px] text-muted">{pick.blurb}</p>
            </div>
            {points ? (
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-soft p-3.5"><dt className="text-[12px] text-faint">Costs</dt><dd className="text-[20px] font-bold tabular-nums">{costOf(pick).toLocaleString("en-US")}</dd></div>
                <div className="rounded-2xl bg-soft p-3.5"><dt className="text-[12px] text-faint">You&apos;ll have</dt><dd className={`text-[20px] font-bold tabular-nums ${balance - costOf(pick) < 0 ? "text-[var(--danger)]" : ""}`}>{(balance - costOf(pick)).toLocaleString("en-US")}</dd></div>
              </dl>
            ) : null}
            <div className="rounded-2xl border border-line p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">What happens next</p>
              <p className="mt-1.5 text-[14px] text-ink">{pick.fulfilment}.</p>
              {pick.value && <p className="mt-1 text-[13px] text-muted">Worth {inr(pick.value)}.</p>}
              {pick.needsApproval && points && <p className="mt-1 text-[13px] text-muted">Your points are held until your manager decides. If they say no, you get them back.</p>}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {points ? (
                <Button
                  variant="brand" size="md" disabled={balance < costOf(pick)}
                  onClick={() => {
                    const res = redeem(pick.id);
                    toast(res.status === "waiting" ? `Asked your manager for “${pick.name}” — points held` : `Redeemed “${pick.name}” 🎉`);
                    setPick(null);
                  }}
                >
                  {balance < costOf(pick) ? `${(costOf(pick) - balance).toLocaleString("en-US")} more points needed` : pick.needsApproval ? "Ask my manager" : "Redeem"}
                </Button>
              ) : isManager ? (
                <Button variant="brand" size="md" onClick={() => { toast(`Opened a grant for “${pick.name}” — pick who it's for in Kudos`); setPick(null); }}>Grant to someone</Button>
              ) : (
                <p className="text-[14px] text-muted">A manager can give you this as a thank-you.</p>
              )}
              <Button variant="tertiary" size="md" onClick={() => setPick(null)}>Close</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* admin setup */}
      <Drawer open={setup} title="Set up the catalogue" onClose={() => setSetup(false)}>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight">Set up the catalogue</h2>
            <p className="mt-1 text-[14px] text-muted">Which kinds of reward people see, and what experiences cost.</p>
          </div>
          <div className="flex flex-col gap-2">
            {KINDS.map((k) => (
              <div key={k} className="rounded-2xl border border-line p-3.5">
                <Switch checked={kindsOn[k] !== false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKindsOn((s) => ({ ...s, [k]: e.target.checked }))} label={KIND_LABEL[k]} description={KIND_SOURCE[k]} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Experience prices</p>
            <ul className="mt-2 divide-y divide-[var(--line)] rounded-2xl border border-line">
              {REWARDS.filter((r) => r.kind === "experience").map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className="text-[20px]" aria-hidden>{r.emoji}</span>
                  <label htmlFor={`price-${r.id}`} className="min-w-0 flex-1 truncate text-[14px] text-ink">{r.name}</label>
                  <input
                    id={`price-${r.id}`} type="number" min={100} step={100} value={costOf(r)}
                    onChange={(e) => setPrices((p) => ({ ...p, [r.id]: Math.max(100, Number(e.target.value) || 100) }))}
                    className="min-h-[44px] w-24 rounded-xl border border-line bg-transparent px-2.5 text-right text-[16px] tabular-nums outline-none focus:border-[var(--purple)] lg:min-h-[36px] lg:text-[14px]"
                  />
                  <span className="text-[12px] text-faint">pts</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-soft p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Ban className="h-4 w-4 text-muted" /> Can&apos;t be added</p>
            <ul className="mt-2 space-y-1.5">
              {NOT_ALLOWED.map((n) => <li key={n.name} className="text-[13px] text-muted"><span className="font-semibold text-ink">{n.name}</span> — {n.why}</li>)}
            </ul>
          </div>
          <Button variant="brand" size="md" leadingIcon={<Check className="h-4 w-4" />} onClick={() => { setSetup(false); toast("Catalogue updated for everyone"); }}>Done</Button>
        </div>
      </Drawer>
    </div>
  );
}
