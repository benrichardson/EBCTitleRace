import { rankDivision } from "@/domain/ranking";
import type { NormalisedSnapshot } from "./snapshot";

/**
 * Cross-check our recomputed standings against what LiveHeats shows, for athletes where
 * LiveHeats counts the same number of results as club rules. Differences are warnings
 * for a human to look at, not errors: club rules govern this site.
 */
export function compareWithSource(snapshot: NormalisedSnapshot): string[] {
  const warnings: string[] = [];
  for (const division of snapshot.divisions) {
    const rows = new Map(rankDivision(division.athletes, division.resultsToCount).map((r) => [r.athleteId, r]));
    for (const athlete of division.athletes) {
      if (athlete.source.resultsToCount !== division.resultsToCount) continue;
      const ours = rows.get(athlete.athleteId)!.standing;
      const label = `${division.name}: ${athlete.name}`;
      if (athlete.source.points !== null && athlete.source.points !== ours.total) {
        warnings.push(`${label} — LiveHeats total ${athlete.source.points}, ours ${ours.total}.`);
      }
      const ourDropped = ours.discarded.map((r) => r.resultId).sort().join(",");
      const theirDropped = [...athlete.source.droppedResultIds].sort().join(",");
      if (ourDropped !== theirDropped) {
        warnings.push(`${label} — LiveHeats crosses out [${theirDropped}], we cross out [${ourDropped}].`);
      }
    }
  }
  return warnings;
}
