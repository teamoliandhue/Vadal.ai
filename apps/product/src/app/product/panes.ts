/* ════════════════════ the scroll model ════════════════════
   Vadal is an app, not a document, and until now it scrolled like a document:
   the whole page moved, the top bar was pinned back over it with `sticky`, the
   sidebar held itself still with `h-screen`, and anything that wanted to stay
   put had to hand-compute an offset around the bar (`sticky top-[57px]`). Three
   separate mechanisms all compensating for the same thing.

   From lg up, the chrome is simply fixed — rail, top bar, dock — and the
   content scrolls inside a pane below it. One scroll region, owned by us.
   Sticky elements inside a pane measure from the pane's own top edge, so they
   need no offset at all.

   Below lg the document scrolls as before. Fixed-height panes and mobile
   browser chrome (a URL bar that grows and shrinks under your thumb) are a
   long-standing bad marriage, and a phone shows one column anyway.

   ── two panes ──────────────────────────────────────────────
   A page laid out as a main column plus a context rail gets a scroll region
   each: the rail no longer rides along with the stream and then jams against
   the top of the window with its own bottom out of reach. Compose it as

     <Shell pane="split">
       <div className={SPLIT}>
         <div className={`${PANE} flex-1`}>…the stream…</div>
         <aside className={`${PANE} w-[320px]`}>…the rail…</aside>
       </div>
     </Shell>

   The split turns on at xl, which is where a rail exists at all. Below that the
   columns stack and the single pane scrolls them together. */

/** Row that holds two panes. Fills the shell's height at xl so its children can. */
export const SPLIT = "flex w-full min-w-0 flex-col gap-6 xl:h-full xl:min-h-0 xl:flex-row xl:overflow-hidden";

/** A column that scrolls on its own at xl, carrying its own top/bottom breathing room.
 *  `pb` clears the AI dock; `pane` quiets the scrollbar (see globals.css).
 *  Give the element `tabIndex={0}` and an `aria-label` as well: a scroll region
 *  the keyboard cannot reach is a region Page Down and the arrow keys cannot
 *  move, and once the document stops scrolling there is nothing else for those
 *  keys to act on. */
export const PANE = "pane min-w-0 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--brand)] xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:pb-28 xl:pt-10";

/** Grid variant — for pages already laid out on the 12-column grid. */
export const SPLIT_GRID = "grid grid-cols-1 gap-6 xl:h-full xl:min-h-0 xl:grid-cols-12 xl:overflow-hidden";
