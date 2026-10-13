import { countBestN } from "./scoring";
import type { EventResult, Standing } from "./types";

export interface AthleteEntry {
  athleteId: string;
  name: string;
  results: EventResult[];
}

export interface RankedRow {
  athleteId: string;
  name: string;
  standing: Standing;
  /** Competition rank (1, 2, 2, 4). Equal totals share a rank until an official tie-break exists. */
  rank: number;
  /** True when another athlete has the same total. */
  tied: boolean;
  gapToLeader: number;
}

/**
 * Rank a division by best-N total. Rows with equal totals are ordered by name then
 * athlete ID purely so the display is stable; that order implies no tie-break.
 */
export function rankDivision(athletes: readonly AthleteEntry[], resultsToCount: number): RankedRow[] {
  const scored = athletes
    .map((a) => ({ athleteId: a.athleteId, name: a.name, standing: countBestN(a.results, resultsToCount) }))
    .sort(
      (a, b) =>
        b.standing.total - a.standing.total ||
        a.name.localeCompare(b.name) ||
        a.athleteId.localeCompare(b.athleteId),
    );

  const leaderTotal = scored[0]?.standing.total ?? 0;
  const countByTotal = new Map<number, number>();
  for (const s of scored) countByTotal.set(s.standing.total, (countByTotal.get(s.standing.total) ?? 0) + 1);

  let rank = 0;
  return scored.map((s, i) => {
    if (i === 0 || s.standing.total !== scored[i - 1]!.standing.total) rank = i + 1;
    return {
      ...s,
      rank,
      tied: countByTotal.get(s.standing.total)! > 1,
      gapToLeader: leaderTotal - s.standing.total,
    };
  });
}
