import { redirect } from "next/navigation";
import { season } from "@/data/current";
import { rankingsHref } from "@/data/views";

export default function RankingsIndex() {
  redirect(rankingsHref(season.defaultDivisionId));
}
