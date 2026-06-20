"use client";
/* Header · Search — a ⌘K command palette.
   Opens via ⌘/Ctrl-K or the `vadal:search-open` event (the TopBar search field).
   Fuzzy filter across pages · people · teams · insights · quick actions, with
   full keyboard nav (↑ ↓ ↵ esc). Mounted once by the TopBar. */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, BookOpen, Building2, ClipboardList, CornerDownLeft, FolderKanban, Gauge,
  HeartHandshake, House, Megaphone, Newspaper, Radio, Search, Settings, Smile, Sparkles,
  UsersRound, type LucideIcon,
} from "lucide-react";
import { people, departments, aiBriefing, quickActions } from "@/lib/data";

type Item = {
  id: string;
  group: string;
  label: string;
  sub?: string;
  icon?: LucideIcon;
  img?: string;
  tint?: string;
  keywords: string;
  run: (router: ReturnType<typeof useRouter>) => void;
};

const go = (href: string) => (r: ReturnType<typeof useRouter>) => r.push(href);
const ask = (q: string) => () => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

const NAV: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Home", icon: House, href: "/product/home" },
  { label: "Pulse", icon: Gauge, href: "/product" },
  { label: "Analytics", icon: BarChart3, href: "/product" },
  { label: "Surveys", icon: ClipboardList, href: "/product" },
  { label: "Sentiment", icon: Smile, href: "/product" },
  { label: "Always-on listening", icon: Radio, href: "/product" },
  { label: "Recognition", icon: HeartHandshake, href: "/product" },
  { label: "Campaigns", icon: Megaphone, href: "/product" },
  { label: "Feed", icon: Newspaper, href: "/product/feed" },
  { label: "Manager hub", icon: UsersRound, href: "/product" },
  { label: "Cases", icon: FolderKanban, href: "/product" },
  { label: "Knowledge", icon: BookOpen, href: "/product" },
  { label: "Settings", icon: Settings, href: "#" },
];

function buildIndex(): Item[] {
  const nav: Item[] = NAV.map((n) => ({
    id: `nav-${n.label}`, group: "Jump to", label: n.label, icon: n.icon,
    keywords: `${n.label} page nav go`.toLowerCase(), run: go(n.href),
  }));
  const ppl: Item[] = people.map((p) => ({
    id: `ppl-${p.name}`, group: "People", label: p.name, sub: `${p.role} · ${p.team}`, img: p.img,
    keywords: `${p.name} ${p.role} ${p.team}`.toLowerCase(), run: go("/product"),
  }));
  const teams: Item[] = departments.map((d) => ({
    id: `team-${d.name}`, group: "Teams", label: d.name, sub: `Health ${d.score}`, icon: Building2,
    keywords: `${d.name} team department`.toLowerCase(), run: go("/product"),
  }));
  const insights: Item[] = aiBriefing.map((b, i) => ({
    id: `ins-${i}`, group: "Insights", label: b.text, sub: b.sub, icon: Sparkles, tint: b.dot,
    keywords: `${b.text} ${b.sub} insight ai`.toLowerCase(), run: ask(b.text),
  }));
  const actions: Item[] = quickActions.map((a) => ({
    id: `act-${a.label}`, group: "Actions", label: a.label, sub: a.hint, icon: Sparkles,
    keywords: `${a.label} ${a.hint} action do`.toLowerCase(), run: ask(a.label),
  }));
  return [...nav, ...ppl, ...teams, ...insights, ...actions];
}

const GROUP_ORDER = ["Jump to", "People", "Teams", "Insights", "Actions"];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const index = React.useMemo(buildIndex, []);

  // open via ⌘K / Ctrl-K, or the search-field event
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpen() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("vadal:search-open", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("vadal:search-open", onOpen as EventListener);
    };
  }, []);

  React.useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const query = q.trim().toLowerCase();
  const pool = query
    ? index
    : [...index.filter((i) => i.group === "Jump to"), ...index.filter((i) => i.group === "Actions"), ...index.filter((i) => i.group === "People").slice(0, 3)];
  const results = pool.filter((i) => !query || i.keywords.includes(query) || i.label.toLowerCase().includes(query));

  // re-clamp the active row when the result set changes
  React.useEffect(() => { setActive((a) => Math.min(a, Math.max(0, results.length - 1))); }, [results.length]);
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(it: Item) { setOpen(false); it.run(router); }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[active]) choose(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  }

  if (!open) return null;

  // group while preserving each item's flat index (for keyboard highlight)
  let flat = -1;
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: results.filter((r) => r.group === g).map((r) => ({ item: r, idx: ++flat })),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-[rgba(15,15,25,0.45)] backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
      <div className="relative flex max-h-[70vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_70px_-18px_rgba(10,10,30,0.5)] dark:border-white/10">
        {/* input */}
        <div className="flex items-center gap-3 border-b border-line px-4 dark:border-white/10">
          <Search className="h-[18px] w-[18px] shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search people, teams, insights…"
            className="min-w-0 flex-1 bg-transparent py-4 text-[16px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[12px] font-semibold text-faint dark:border-white/15">esc</kbd>
        </div>

        {/* results */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-soft text-faint"><Search className="h-5 w-5" /></span>
              <p className="text-[14px] font-semibold">No results for “{q}”</p>
              <p className="text-[14px] text-faint">Try a name, team, or page.</p>
            </div>
          ) : (
            grouped.map((section) => (
              <div key={section.group} className="mb-1">
                <div className="px-2 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{section.group}</div>
                {section.items.map(({ item, idx }) => (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onClick={() => choose(item)}
                    onMouseMove={() => setActive(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${idx === active ? "bg-soft" : ""}`}
                  >
                    {item.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.img} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-soft" style={{ color: item.tint ?? "var(--purple)" }}>
                        {item.icon ? <item.icon className="h-[18px] w-[18px]" strokeWidth={1.85} /> : null}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{item.label}</span>
                      {item.sub && <span className="block truncate text-[12px] text-faint">{item.sub}</span>}
                    </span>
                    {idx === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-faint" />}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* footer hints */}
        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[12px] text-faint dark:border-white/10">
          <span className="flex items-center gap-1"><kbd className="rounded border border-line px-1 dark:border-white/15">↑</kbd><kbd className="rounded border border-line px-1 dark:border-white/15">↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-line px-1 dark:border-white/15">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-line px-1 dark:border-white/15">esc</kbd> close</span>
          <span className="ml-auto flex items-center gap-1"><Sparkles className="h-3 w-3" /> Vadal search</span>
        </div>
      </div>
    </div>
  );
}
