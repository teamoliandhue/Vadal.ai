import { notFound } from "next/navigation";
import { BrandStudy } from "./study";

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id !== "1" && id !== "2") notFound();
  return <BrandStudy id={id} />;
}
