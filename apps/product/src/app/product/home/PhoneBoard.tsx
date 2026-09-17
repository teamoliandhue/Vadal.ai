"use client";
/* Home on a phone — its own design, not the desktop columns stacked (mobile
   pass, spec 043).

   · Its own arrangement. What someone wants first on a phone between shifts is
     not what they want on a laptop, so the phone layout is saved separately.
   · One column of widgets that fold. "Fold" turns a widget into a single
     titled line; folded stays folded. A long Home becomes something you can
     scan with a thumb.
   · Arrange in a bottom sheet: drag the handle, or use the arrows; a switch
     shows or hides each widget. Hidden widgets wait at the bottom of the same
     sheet rather than in a separate library. */
import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, GripVertical, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import type { WidgetDef } from "./WidgetBoard";

type PhoneLayout = { order: string[]; hidden: string[] };

export function PhoneBoard({ widgets, allowed, defaults }: {
  widgets: Record<string, WidgetDef>;
  allowed: (id: string) => boolean;
  /** The desktop default, read left column first — the starting point, not a mirror. */
  defaults: string[];
}) {
  const [stored, setStored, hydrated] = usePersistentState<PhoneLayout | null>("vadal:home-layout-phone-v1", null);
  const [folded, setFolded] = usePersistentState<string[]>("vadal:home-folded-phone", []);
  const [arranging, setArranging] = React.useState(false);

  const all = Object.keys(widgets).filter(allowed);
  const base: PhoneLayout = stored ?? { order: [...defaults, ...all.filter((id) => !defaults.includes(id))], hidden: all.filter((id) => !defaults.includes(id)) };
  // New widgets the saved layout has never seen go to Hidden, so nothing appears uninvited.
  const order = [...base.order.filter(allowed), ...all.filter((id) => !base.order.includes(id))];
  const hidden = new Set([...base.hidden, ...all.filter((id) => !base.order.includes(id))]);
  const shown = order.filter((id) => !hidden.has(id));
  const off = order.filter((id) => hidden.has(id));

  const commit = (next: PhoneLayout) => setStored(next);
  const reorder = (id: string, to: number) => {
    const list = shown.filter((x) => x !== id);
    list.splice(Math.max(0, Math.min(to, list.length)), 0, id);
    commit({ order: [...list, ...off], hidden: [...hidden] });
  };
  const setShown = (id: string, on: boolean) => {
    if (on) commit({ order: [...shown, id, ...off.filter((x) => x !== id)], hidden: [...hidden].filter((x) => x !== id) });
    else commit({ order: [...shown.filter((x) => x !== id), id, ...off], hidden: [...hidden, id] });
  };
  const toggleFold = (id: string) => setFolded((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <section aria-label="Your Home" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Your digest</p>
        <Button variant="tertiary" size="sm" className="min-h-[44px]" leadingIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setArranging(true)} disabled={!hydrated}>
          Arrange
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {shown.map((id) => {
          const w = widgets[id];
          const isFolded = folded.includes(id);
          return (
            <div key={id}>
              {isFolded ? (
                <button
                  onClick={() => toggleFold(id)}
                  aria-expanded={false}
                  aria-controls={`phone-w-${id}`}
                  className="flex min-h-[52px] w-full items-center gap-2.5 rounded-2xl border border-line bg-card px-4 text-left"
                >
                  <span aria-hidden className="text-[18px]">{w.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{w.title}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-faint" />
                </button>
              ) : (
                <>
                  {/* The card names itself; the fold control only needs to be findable. */}
                  <div className="flex justify-end">
                    <button onClick={() => toggleFold(id)} aria-expanded aria-controls={`phone-w-${id}`} aria-label={`Fold ${w.title}`} className="inline-flex min-h-[44px] items-center gap-1 px-2 text-[13px] font-semibold text-faint">
                      Fold <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                  <div id={`phone-w-${id}`}>{w.render()}</div>
                </>
              )}
            </div>
          );
        })}
        {shown.length === 0 && (
          <p className="rounded-[22px] border border-dashed border-line px-5 py-10 text-center text-[14px] text-faint">Your Home is empty. Tap Arrange to bring widgets back.</p>
        )}
      </div>

      <Drawer open={arranging} title="Arrange your Home" onClose={() => setArranging(false)}>
        <ArrangeSheet
          widgets={widgets} shown={shown} off={off}
          onMove={reorder} onShow={setShown}
          onReset={() => { setStored(null); setFolded([]); toast("Home is back to the default"); }}
          onDone={() => setArranging(false)}
        />
      </Drawer>
    </section>
  );
}

const ROW = 64;

function ArrangeSheet({ widgets, shown, off, onMove, onShow, onReset, onDone }: {
  widgets: Record<string, WidgetDef>; shown: string[]; off: string[];
  onMove: (id: string, to: number) => void; onShow: (id: string, on: boolean) => void;
  onReset: () => void; onDone: () => void;
}) {
  const [drag, setDrag] = React.useState<{ id: string; from: number; startY: number; dy: number } | null>(null);
  const live = React.useRef<HTMLParagraphElement>(null);
  const say = (m: string) => { if (live.current) live.current.textContent = m; };
  const target = drag ? Math.max(0, Math.min(shown.length - 1, drag.from + Math.round(drag.dy / ROW))) : -1;

  return (
    <div className="flex flex-col gap-5">
      <div className="pr-10">
        <h2 className="text-[22px] font-bold tracking-tight">Arrange your Home</h2>
        <p className="mt-1 text-[14px] text-muted">Drag the handle, or use the arrows. Switch off what you don&rsquo;t need on your phone — your laptop keeps its own layout.</p>
      </div>
      <p ref={live} className="sr-only" aria-live="polite" />

      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">On your Home · {shown.length}</p>
        <ul className="mt-2 flex flex-col">
          {shown.map((id, i) => {
            const w = widgets[id];
            const dragging = drag?.id === id;
            // Rows between the origin and the target step aside while dragging.
            const shift = drag && !dragging
              ? (drag.from < target && i > drag.from && i <= target ? -ROW : drag.from > target && i < drag.from && i >= target ? ROW : 0)
              : 0;
            return (
              <li
                key={id}
                style={{ height: ROW, transform: `translateY(${dragging ? drag!.dy : shift}px)` }}
                className={`relative flex items-center gap-1 border-b border-line bg-card ${dragging ? "z-10 rounded-2xl shadow-[0_12px_30px_-10px_rgba(20,20,40,0.35)]" : "transition-transform duration-150"}`}
              >
                <span
                  className="grid h-11 w-11 shrink-0 cursor-grab touch-none place-items-center text-faint active:cursor-grabbing"
                  onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is a nicety */ } setDrag({ id, from: i, startY: e.clientY, dy: 0 }); }}
                  onPointerMove={(e) => { if (drag?.id === id) setDrag({ ...drag, dy: e.clientY - drag.startY }); }}
                  onPointerUp={() => { if (drag?.id === id) { if (target !== drag.from) { onMove(id, target); say(`${w.title} moved to position ${target + 1}`); } setDrag(null); } }}
                  onPointerCancel={() => setDrag(null)}
                  aria-hidden
                >
                  <GripVertical className="h-5 w-5" />
                </span>
                <span aria-hidden className="text-[18px]">{w.emoji}</span>
                <span className="min-w-0 flex-1 truncate px-1.5 text-[15px] font-semibold text-ink">{w.title}</span>
                <button disabled={i === 0} onClick={() => { onMove(id, i - 1); say(`${w.title} moved up`); }} aria-label={`Move ${w.title} up`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button disabled={i === shown.length - 1} onClick={() => { onMove(id, i + 1); say(`${w.title} moved down`); }} aria-label={`Move ${w.title} down`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <span className="shrink-0 pl-1"><Switch size="sm" checked onChange={() => onShow(id, false)} aria-label={`Show ${w.title}`} /></span>
              </li>
            );
          })}
        </ul>
      </div>

      {off.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Hidden · {off.length}</p>
          <ul className="mt-2 flex flex-col">
            {off.map((id) => (
              <li key={id} className="flex min-h-[64px] items-center gap-3 border-b border-line py-2">
                <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center text-[18px]">{widgets[id].emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{widgets[id].title}</span>
                  <span className="block text-[12px] leading-snug text-muted">{widgets[id].desc}</span>
                </span>
                <Switch size="sm" checked={false} onChange={() => onShow(id, true)} aria-label={`Show ${widgets[id].title}`} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <Button variant="tertiary" size="sm" className="min-h-[44px]" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>Reset</Button>
        <Button variant="brand" size="sm" className="min-h-[44px]" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
