/* Analytics — the free-slicing companion to Pulse. Pulse curates "what needs
   attention now"; Analytics answers "any metric, any cut." Deep-linked from
   Pulse via ?metric=&dim= (read here on the server, Next 16 searchParams is a
   Promise) and handed to the client explorer. */
import { Shell } from "../shell";
import { AnalyticsExplorer } from "./AnalyticsExplorer";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ metric?: string; dim?: string; period?: string }> }) {
  const sp = await searchParams;
  return (
    <Shell active="Analytics" breadcrumb="Analytics">
      <AnalyticsExplorer initialMetric={sp.metric} initialDim={sp.dim} initialPeriod={sp.period} />
    </Shell>
  );
}
