"use client";
/* Header · Notifications — bell trigger with unread count → dropdown panel.
   All/Unread filter · per-item + mark-all read · type icons · empty state. */
import * as React from "react";
import Link from "next/link";
import { AtSign, Bell, CalendarClock, Check, ClipboardList, Gift, PartyPopper, Sparkles, type LucideIcon } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { notifications as seed, type Notif, type NotifKind } from "@/lib/data";
import { useMenu } from "./useMenu";

const KIND_ICON: Record<NotifKind, LucideIcon> = {
  recognition: Gift,
  mention: AtSign,
  survey: ClipboardList,
  manager: CalendarClock,
  celebration: PartyPopper,
  system: Sparkles,
};
const KIND_TINT: Record<NotifKind, string> = {
  recognition: "var(--purple)",
  mention: "#3b82f6",
  survey: "#e0a020",
  manager: "#33b28a",
  celebration: "#ef7faf",
  system: "var(--purple)",
};

export function NotificationsMenu() {
  const { open, setOpen, ref } = useMenu();
  const [items, setItems] = React.useState<Notif[]>(seed);
  const [tab, setTab] = React.useState<"all" | "unread">("all");

  const unread = items.filter((n) => !n.read).length;
  const shown = tab === "unread" ? items.filter((n) => !n.read) : items;

  const markAll = () => setItems((x) => x.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((x) => x.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-soft aria-expanded:bg-soft aria-expanded:text-ink"
      >
        <Bell className="h-[16px] w-[16px]" strokeWidth={1.9} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#ef7faf] px-1 text-[12px] font-bold leading-none text-white ring-2 ring-card">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-40 flex max-h-[min(560px,80vh)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_4px_12px_-2px_rgba(10,10,12,0.12),0_18px_44px_-10px_rgba(10,10,12,0.22)] dark:border-white/10"
        >
          {/* header */}
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold tracking-tight">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-[var(--lav)] px-2 py-0.5 text-[12px] font-semibold text-[var(--purple)]">{unread} new</span>
              )}
            </div>
            <button
              onClick={markAll}
              disabled={unread === 0}
              className="text-[14px] font-semibold text-[var(--purple)] transition hover:underline disabled:cursor-default disabled:text-faint disabled:no-underline"
            >
              Mark all read
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-1.5 px-3 pt-3">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1 text-[14px] font-semibold capitalize transition ${
                  tab === t ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"
                }`}
              >
                {t}
                {t === "unread" && unread > 0 ? ` · ${unread}` : ""}
              </button>
            ))}
          </div>

          {/* list */}
          {shown.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-soft text-[var(--purple)]"><Check className="h-5 w-5" /></span>
              <p className="text-[14px] font-semibold">You’re all caught up</p>
              <p className="text-[14px] text-faint">No {tab === "unread" ? "unread " : ""}notifications right now.</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto p-2">
              {shown.map((n) => {
                const Icon = KIND_ICON[n.kind];
                const tint = KIND_TINT[n.kind];
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href ?? "#"}
                      onClick={() => { markRead(n.id); setOpen(false); }}
                      className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-soft"
                    >
                      <span className="relative mt-0.5 shrink-0">
                        {n.img ? (
                          <Avatar src={n.img} name={n.actor} size="md" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: "var(--soft)", color: tint }}>
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-card ring-2 ring-card" style={{ color: tint }} aria-hidden>
                          <Icon className="h-3 w-3" />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] leading-snug text-ink/90">
                          <b className="font-semibold text-ink">{n.actor}</b> {n.body}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-faint">{n.time} ago</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--purple)]" aria-label="Unread" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* footer */}
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="border-t border-line py-3 text-center text-[14px] font-semibold text-[var(--purple)] transition hover:bg-soft dark:border-white/10"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
