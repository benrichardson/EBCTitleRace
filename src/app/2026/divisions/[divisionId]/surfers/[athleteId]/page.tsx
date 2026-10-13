import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { season, snapshot } from "@/data/current";
import { buildSurferPage } from "@/data/views";
import { SurferScreen } from "@/ui/SurferScreen";

type Params = { divisionId: string; athleteId: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return snapshot.divisions.flatMap((d) => d.athletes.map((a) => ({ divisionId: d.id, athleteId: a.athleteId })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { divisionId, athleteId } = await params;
  const page = buildSurferPage(snapshot, season, divisionId, athleteId);
  return page ? { title: `${page.name} · ${page.divisionName}` } : {};
}

export default async function SurferPage({ params }: { params: Promise<Params> }) {
  const { divisionId, athleteId } = await params;
  const page = buildSurferPage(snapshot, season, divisionId, athleteId);
  if (!page) notFound();
  return <SurferScreen page={page} />;
}
