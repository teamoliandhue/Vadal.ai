/* Pulse loading skeleton — chrome stays put while the dashboard streams in. */
import { Shell } from "./shell";

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-soft ${className}`} />;
}

export default function Loading() {
  return (
    <Shell active="Pulse" breadcrumb="Pulse">
      <div className="flex flex-col gap-6">
        <div className="rounded-[28px] border border-line bg-card p-7 sm:p-9">
          <Sk className="h-3 w-40" />
          <Sk className="mt-3 h-8 w-72 max-w-full" />
          <Sk className="mt-3 h-4 w-96 max-w-full" />
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">{[0, 1, 2].map((i) => <Sk key={i} className="h-24 w-full rounded-2xl" />)}</div>
        </div>
        <Sk className="h-9 w-80 max-w-full" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Sk className="h-72 rounded-[26px] xl:col-span-4" />
          <Sk className="h-72 rounded-[26px] xl:col-span-8" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Sk key={i} className="h-28 rounded-2xl" />)}</div>
      </div>
    </Shell>
  );
}
