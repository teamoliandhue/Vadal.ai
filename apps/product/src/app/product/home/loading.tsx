/* Loading state (Notion Home spec §5) — skeleton inside the real Shell so the chrome
   stays put while Home content streams in. */
import { Shell } from "../shell";

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-soft ${className}`} />;
}

const CARD = "rounded-[26px] border border-line bg-card p-6 sm:p-7";

export default function Loading() {
  return (
    <Shell active="Home" breadcrumb="Home">
      <div className="rounded-[28px] border border-line bg-card p-7 sm:p-9">
        <Sk className="h-3 w-28" />
        <Sk className="mt-4 h-9 w-[22rem] max-w-full" />
        <Sk className="mt-3 h-4 w-64" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className={`${CARD} xl:col-span-7`}>
          <Sk className="h-4 w-24" />
          <div className="mt-5 space-y-3">{[0, 1, 2, 3].map((i) => <Sk key={i} className="h-12 w-full" />)}</div>
        </div>
        <div className={`${CARD} xl:col-span-5`}>
          <Sk className="h-12 w-44" />
          <Sk className="mt-6 h-14 w-full" />
          <Sk className="mt-4 h-24 w-full" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className={`${CARD} xl:col-span-7`}>
          <Sk className="h-4 w-28" />
          <div className="mt-5 space-y-5">{[0, 1, 2].map((i) => <Sk key={i} className="h-20 w-full" />)}</div>
        </div>
        <div className="flex flex-col gap-6 xl:col-span-5">
          <Sk className="h-48 w-full rounded-[26px]" />
          <Sk className="h-40 w-full rounded-[26px]" />
        </div>
      </div>
    </Shell>
  );
}
