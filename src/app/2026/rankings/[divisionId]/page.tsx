import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { season, snapshot } from "@/data/current";
import { buildRankingsPage } from "@/data/views";
import { RankingsScreen } from "@/ui/RankingsScreen";

type Params = { divisionId: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return season.divisions.map((d) => ({ divisionId: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { divisionId } = await params;
  const name = season.divisions.find((d) => d.id === divisionId)?.name;
  return name ? { title: `${name} rankings` } : {};
}

export default async function DivisionRankings({ params }: { params: Promise<Params> }) {
  const { divisionId } = await params;
  const page = buildRankingsPage(snapshot, season, divisionId);
  if (!page) notFound();
  return <RankingsScreen page={page} />;
}
