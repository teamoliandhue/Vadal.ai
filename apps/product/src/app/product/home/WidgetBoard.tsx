"use client";
/* Home as widgets (17 Sep decision §3 · roadmap v2 widget library).

   Home opens on a fixed default layout — the digest. "Customise" turns every
   widget into something you can move or remove, and opens a library of the
   rest. Three ways to move a widget, because one is never enough:
     · drag it (desktop, where a pointer can)
     · the ↑ ↓ buttons, and ← → between columns (touch and keyboard)
     · remove it and add it back from the library
   The layout is the person's own and is remembered; Reset brings back the
   default. A phone gets its own board (PhoneBoard, spec 043) with its own
   saved arrangement — not these columns stacked. */
import * as React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, GripVertical, LayoutGrid, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@vadal/design-system";
import type { Role } from "@/lib/auth";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useViewAs } from "../useViewAs";
import { PhoneBoard } from "./PhoneBoard";

/* Phone = below md. null until mounted, so the server render never guesses. */
const PHONE = "(max-width: 767px)";
const subscribePhone = (f: () => void) => { const m = window.matchMedia(PHONE); m.addEventListener("change", f); return () => m.removeEventListener("change", f); };
function useIsPhone(): boolean | null {
  return React.useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => null);
}

export type WidgetDef = { title: string; desc: string; emoji: string; roles?: Role[]; render: () => React.ReactNode };
type Col = "left" | "right";
type Layout = { left: string[]; right: string[] };

export function WidgetBoard({ widgets, defaults }: { widgets: Record<string, WidgetDef>; defaults: Layout }) {
  const [role] = useViewAs();
  const [stored, setStored, hydrated] = usePersistentState<Layout | null>("vadal:home-layout-v1", null);
  const [editing, setEditing] = React.useState(false);
  const [library, setLibrary] = React.useState(false);
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ col: Col; index: number } | null>(null);
  const liveRef = React.useRef<HTMLParagraphElement>(null);
  const phone = useIsPhone();

  const allowed = (id: string) => Boolean(widgets[id]) && (!widgets[id].roles || widgets[id].roles!.includes(role));
  const base = stored ?? defaults;
  const layout: Layout = { left: base.left.filter(allowed), right: base.right.filter(allowed) };
  const placed = new Set([...layout.left, ...layout.right]);
  const available = Object.keys(widgets).filter((id) => allowed(id) && !placed.has(id));

  const say = (msg: string) => { if (liveRef.current) liveRef.current.textContent = msg; };
  const commit = (next: Layout) => setStored(next);

  function move(id: string, col: Col, index: number) {
    const next: Layout = { left: layout.left.filter((x) => x !== id), right: layout.right.filter((x) => x !== id) };
    const from = layout.left.includes(id) ? "left" : "right";
    const fromIndex = layout[from].indexOf(id);
    const adj = from === col && fromIndex < index ? index - 1 : index;
    next[col].splice(Math.max(0, Math.min(adj, next[col].length)), 0, id);
    commit(next);
  }
  function nudge(id: string, dir: "up" | "down" | "left" | "right") {
    const col: Col = layout.left.includes(id) ? "left" : "right";
    const i = layout[col].indexOf(id);
    if (dir === "up" && i > 0) move(id, col, i - 1);
    if (dir === "down" && i < layout[col].length - 1) move(id, col, i + 2);
    if (dir === "left" && col === "right") move(id, "left", layout.left.length);
    if (dir === "right" && col === "left") move(id, "right", layout.right.length);
    say(`${widgets[id].title} moved ${dir}`);
  }
  function remove(id: string) {
    commit({ left: layout.left.filter((x) => x !== id), right: layout.right.filter((x) => x !== id) });
    toast(`Removed ${widgets[id].title} — add it back from the library`);
  }
  function add(id: string) {
    const col: Col = layout.left.length <= layout.right.length ? "left" : "right";
    commit({ ...layout, [col]: [...layout[col], id] });
    toast(`Added ${widgets[id].title}`);
  }

  if (phone === null) return <section aria-label="Your Home" className="mt-6 min-h-[240px]" aria-busy="true" />;
  if (phone) return <PhoneBoard widgets={widgets} allowed={allowed} defaults={[...defaults.left, ...defaults.right].filter(allowed)} />;

  const iconBtn = "grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink disabled:opacity-30 lg:h-8 lg:w-8";

  const column = (col: Col) => (
    <div
      className={`flex flex-col gap-6 ${col === "left" ? "xl:col-span-7" : "xl:col-span-5"}`}
      onDragOver={(e) => { if (drag) { e.preventDefault(); if (!over || over.col !== col) setOver({ col, index: layout[col].length }); } }}
      onDrop={(e) => { e.preventDefault(); if (drag && over) move(drag, over.col, over.index); setDrag(null); setOver(null); }}
    >
      {layout[col].map((id, i) => {
        const w = widgets[id];
        const first = i === 0, last = i === layout[col].length - 1;
        return (
          <div
            key={id}
            draggable={editing}
            onDragStart={(e) => { setDrag(id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id); }}
            onDragEnd={() => { setDrag(null); setOver(null); }}
            onDragOver={(e) => {
              if (!drag) return;
              e.preventDefault(); e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              const index = e.clientY < r.top + r.height / 2 ? i : i + 1;
              if (!over || over.col !== col || over.index !== index) setOver({ col, index });
            }}
            className={`relative ${editing ? "rounded-[30px] p-1.5 ring-2 ring-dashed ring-[var(--purple)]/30" : ""} ${drag === id ? "opacity-40" : ""}`}
          >
            {editing && over?.col === col && over.index === i && drag !== id && <span className="absolute -top-4 left-4 right-4 h-1 rounded-full bg-[var(--purple)]" aria-hidden />}
            {editing && (
              <div className="mb-1.5 flex items-center gap-1 rounded-full bg-card px-2 py-1 ring-1 ring-line">
                <span className="hidden cursor-grab items-center text-faint lg:flex" title="Drag to move"><GripVertical className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate px-1 text-[13px] font-semibold text-ink"><span aria-hidden className="mr-1.5">{w.emoji}</span>{w.title}</span>
                <button className={iconBtn} disabled={first} onClick={() => nudge(id, "up")} aria-label={`Move ${w.title} up`}><ArrowUp className="h-4 w-4" /></button>
                <button className={iconBtn} disabled={last} onClick={() => nudge(id, "down")} aria-label={`Move ${w.title} down`}><ArrowDown className="h-4 w-4" /></button>
                <button className={`${iconBtn} max-xl:hidden`} disabled={col === "left"} onClick={() => nudge(id, "left")} aria-label={`Move ${w.title} to the left column`}><ArrowLeft className="h-4 w-4" /></button>
                <button className={`${iconBtn} max-xl:hidden`} disabled={col === "right"} onClick={() => nudge(id, "right")} aria-label={`Move ${w.title} to the right column`}><ArrowRight className="h-4 w-4" /></button>
                <button className={iconBtn} onClick={() => remove(id)} aria-label={`Remove ${w.title}`}><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className={editing ? "pointer-events-none select-none" : ""} aria-hidden={editing || undefined}>{w.render()}</div>
          </div>
        );
      })}
      {editing && (
        <div className={`grid min-h-[88px] place-items-center rounded-[26px] border-2 border-dashed text-[13px] ${over?.col === col && over.index === layout[col].length ? "border-[var(--purple)] text-[var(--purple)]" : "border-line text-faint"}`}>
          {layout[col].length === 0 ? "Drop a widget here" : "Drop here to put it last"}
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="Your Home" className="mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Your digest</p>
          {editing && <p className="mt-1 text-[14px] text-muted">Drag widgets, or use the arrows. Your layout is saved as you go.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setLibrary(true)}>Add widgets{available.length ? ` · ${available.length}` : ""}</Button>
              <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setStored(null); toast("Home is back to the default digest"); }}>Reset</Button>
              <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => setEditing(false)}>Done</Button>
            </>
          ) : (
            <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<LayoutGrid className="h-4 w-4" />} onClick={() => setEditing(true)} disabled={!hydrated}>Customise</Button>
          )}
        </div>
      </div>
      <p ref={liveRef} className="sr-only" aria-live="polite" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {column("left")}
        {column("right")}
      </div>

      <Drawer open={library} title="Add widgets" onClose={() => setLibrary(false)}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight">Add widgets</h2>
            <p className="mt-1 text-[14px] text-muted">Everything you can put on Home. Added widgets go to the bottom of the shorter column.</p>
          </div>
          {available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-[14px] text-faint">Every widget is already on your Home.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {available.map((id) => (
                <li key={id} className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft text-[20px]" aria-hidden>{widgets[id].emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{widgets[id].title}</span>
                    <span className="block text-[12px] leading-snug text-muted">{widgets[id].desc}</span>
                  </span>
                  <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => add(id)}>Add</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Drawer>
    </section>
  );
}
