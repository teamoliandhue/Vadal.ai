"use client";
/* Header · Account — avatar trigger → identity card + account links + sign out. */
import * as React from "react";
import Image from "next/image";
import { ChevronDown, Keyboard, LifeBuoy, LogOut, Settings, Trophy, UserRound } from "lucide-react";
import { MenuItem } from "@vadal/design-system";
import { me } from "@/lib/data";
import { useMenu } from "./useMenu";

const LINKS = [
  { icon: UserRound, label: "View profile", href: "/product/home" },
  { icon: Trophy, label: "Points & badges", href: "/product/home" },
  { icon: Settings, label: "Settings", href: "#" },
  { icon: LifeBuoy, label: "Help & support", href: "#" },
  { icon: Keyboard, label: "Keyboard shortcuts", href: "#" },
];

export function ProfileMenu() {
  const { open, setOpen, ref } = useMenu();

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
          <div className="mx-2 mb-1 flex items-center gap-1.5 px-0 pb-1 text-[12px] text-faint">
            <span className="h-2 w-2 rounded-full bg-vgreen" /> Active · {me.title}
          </div>

          <div className="my-1 h-px bg-line" />

          {LINKS.map((l) => (
            <MenuItem key={l.label} href={l.href} icon={<l.icon className="h-[18px] w-[18px]" strokeWidth={1.85} />} label={l.label} />
          ))}

          <div className="my-1 h-px bg-line" />

          <button
            type="button"
            onClick={() => setOpen(false)}
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
