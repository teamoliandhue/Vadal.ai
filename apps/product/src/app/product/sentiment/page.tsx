import { Shell } from "../shell";
import { SentimentDashboard } from "./SentimentDashboard";

export default function SentimentPage() {
  return (
    <Shell active="Sentiment" breadcrumb="Sentiment">
      <SentimentDashboard />
    </Shell>
  );
}
