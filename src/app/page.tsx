import { season, snapshot } from "@/data/current";
import { buildRankingsPage } from "@/data/views";
import { RankingsScreen } from "@/ui/RankingsScreen";

// Main entry: default division (U18 Boys), same content as its rankings URL.
export default function Home() {
  return <RankingsScreen countRules={season.divisions} page={buildRankingsPage(snapshot, season, season.defaultDivisionId)!} />;
}
