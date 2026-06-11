import { notFound } from "next/navigation";
import { BrandStudy } from "./study";

const IDS = ["1", "2", "3", "4", "5"];

export function generateStaticParams() {
  return IDS.map((id) => ({ id }));
}

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!IDS.includes(id)) notFound();
  return <BrandStudy id={id} />;
}
