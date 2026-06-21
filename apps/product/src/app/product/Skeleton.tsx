/* Shared loading skeleton — rendered inside the real Shell so the chrome stays
   put while a section streams in. Used by every route's loading.tsx. */
import { Shell } from "./shell";

export function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-soft ${className}`} />;
}

const CARD = "rounded-[26px] border border-line bg-card p-6 sm:p-7";

export function PageSkeleton({ active, breadcrumb }: { active: string; breadcrumb: string }) {
  return (
    <Shell active={active} breadcrumb={breadcrumb}>
      <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
        {/* hero */}
        <div className="rounded-[28px] border border-line bg-card p-7 sm:p-9">
          <Sk className="h-3 w-24" />
          <Sk className="mt-4 h-9 w-80 max-w-full" />
          <Sk className="mt-3 h-4 w-64 max-w-full" />
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-12 w-full" />)}
          </div>
        </div>
        {/* card grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className={`${CARD} xl:col-span-5`}>
            <Sk className="h-4 w-28" />
            <Sk className="mt-5 h-40 w-full" />
            <div className="mt-4 flex gap-2">{[0, 1, 2].map((i) => <Sk key={i} className="h-6 w-20" />)}</div>
          </div>
          <div className={`${CARD} xl:col-span-7`}>
            <Sk className="h-4 w-32" />
            <div className="mt-5 space-y-3">{[0, 1, 2, 3, 4].map((i) => <Sk key={i} className="h-10 w-full" />)}</div>
          </div>
        </div>
        <span className="sr-only">Loading {breadcrumb}…</span>
      </div>
    </Shell>
  );
}
