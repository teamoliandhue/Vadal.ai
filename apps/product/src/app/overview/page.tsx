import type { Metadata } from "next";
import { Overview } from "./Overview";

export const metadata: Metadata = {
  title: "Vadal — the whole product",
  description: "Every section, what it does, and one click into the live product.",
};

export default function OverviewPage() {
  return <Overview />;
}
