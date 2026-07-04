"use client";
/* Header · Account — avatar trigger → identity card + points, account links,
   workspace controls (role-gated) and sign out. */
import * as React from "react";
import Image from "next/image";
import { ChevronDown, Keyboard, LifeBuoy, LogOut, Repeat, Settings, Trophy, UserPlus, UserRound, Building2 } from "lucide-react";
import { MenuItem } from "@vadal/design-system";
import { me } from "@/lib/data";
import { useMenu } from "./useMenu";
import { toast } from "../Toaster";
import { useViewAs } from "../useViewAs";

const ACCOUNT = [
  { icon: UserRound, label: "View profile", href: "/product/home" },
  { icon: Trophy, label: "Points & badges", href: "/product/home" },
  { icon: Settings, label: "Settings", href: "/product/settings" },
  { icon: LifeBuoy, label: "Help & support", href: "#" },
  { icon: Keyboard, label: "Keyboard shortcuts", href: "#" },
];

export function ProfileMenu() {
  const { open, setOpen, ref } = useMenu();
  const [role] = useViewAs();
  const canAdmin = role !== "employee"; // workspace controls are manager/admin-only

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition hover:bg-soft aria-expanded:bg-soft"
      >
        <Image src={me.img} alt={me.fullName} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-card" />
        <ChevronDown className={`h-4 w-4 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-40 w-[268px] overflow-hidden rounded-2xl border border-line bg-card p-2 shadow-[0_4px_12px_-2px_rgba(10,10,12,0.12),0_18px_44px_-10px_rgba(10,10,12,0.22)] dark:border-white/10"
        >
          {/* identity */}
          <div className="flex items-center gap-3 px-2 py-2">
            <Image src={me.img} alt={me.fullName} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">{me.fullName}</div>
              <div className="truncate text-[12px] text-faint">{me.email}</div>
            </div>
          </div>
          {/* points & badges pill */}
          <div className="mx-1 mb-1 flex items-center gap-2 rounded-xl bg-soft px-2.5 py-2 text-[12px]">
            <Trophy className="h-3.5 w-3.5 text-[var(--purple)]" />
            <span className="font-semibold">{me.points.toLocaleString()} pts</span>
            <span className="text-faint">· #{me.rank} on your team · {me.streak}-day streak 🔥</span>
          </div>

          <div className="my-1 h-px bg-line" />

          {ACCOUNT.map((l) => (
            <MenuItem key={l.label} href={l.href} icon={<l.icon className="h-[18px] w-[18px]" strokeWidth={1.85} />} label={l.label} />
          ))}

          {/* workspace — manager/admin only */}
          {canAdmin && (
            <>
              <div className="my-1 h-px bg-line" />
              <div className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Workspace</div>
              <MenuItem href="/product/settings" icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.85} />} label="Workspace settings" />
              <MenuItem icon={<UserPlus className="h-[18px] w-[18px]" strokeWidth={1.85} />} label="Invite people" onClick={() => { setOpen(false); toast("Invite link copied ✓"); }} />
              <MenuItem icon={<Repeat className="h-[18px] w-[18px]" strokeWidth={1.85} />} label="Switch workspace" onClick={() => { setOpen(false); toast("Only oliandhue is connected in this demo", "info"); }} />
            </>
          )}

          <div className="my-1 h-px bg-line" />

          <button
            type="button"
            onClick={() => { setOpen(false); toast("Signed out (demo)", "info"); }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[#dc4a44] outline-none transition-colors hover:bg-[#fbecec] focus-visible:bg-[#fbecec] dark:hover:bg-[#3a1d1d] dark:focus-visible:bg-[#3a1d1d]"
          >
            <span className="grid size-5 shrink-0 place-items-center" aria-hidden><LogOut className="h-[18px] w-[18px]" strokeWidth={1.85} /></span>
            <span className="flex-1">Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
