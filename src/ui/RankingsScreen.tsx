import type { RankingsPageVM } from "@/data/views";
import { AppShell } from "./AppShell";
import { countRulesText } from "./format";
import { RankingsBody } from "./RankingsBody";

export function RankingsScreen({
  page,
  countRules,
}: {
  page: RankingsPageVM;
  /** Every division's counting rule, for the intro copy. */
  countRules: { name: string; resultsToCount: number }[];
}) {
  return (
    <AppShell snapshotLabel={page.snapshotLabel} water>
      <RankingsBody
        page={page}
        intro={`${page.seriesName} provisional standings. ${countRulesText(countRules)} Discarded scores are crossed out.`}
      />
    </AppShell>
  );
}
