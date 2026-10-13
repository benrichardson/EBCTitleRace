import type { EventResult, Standing } from "./types";

/**
 * Highest points first. Equal scores keep the earlier event (then lower result ID)
 * in the counting set, so the later result is the one shown as discarded.
 */
function byCountingPriority(a: EventResult, b: EventResult): number {
  return b.points - a.points || a.eventOrder - b.eventOrder || a.resultId.localeCompare(b.resultId);
}

export function countBestN(results: readonly EventResult[], resultsToCount: number): Standing {
  if (!Number.isInteger(resultsToCount) || resultsToCount < 1) {
    throw new Error(`resultsToCount must be a positive integer, got ${resultsToCount}`);
  }
  const sorted = [...results].sort(byCountingPriority);
  const counted = sorted.slice(0, resultsToCount);
  const discarded = sorted.slice(resultsToCount);
  const total = counted.reduce((sum, x) => sum + x.points, 0);
  const replacement = counted.length === resultsToCount ? counted[counted.length - 1]!.points : 0;
  return { total, counted, discarded, replacement };
}

/** Total after one more event awarding `points`. */
export function projectTotal(standing: Pick<Standing, "total" | "replacement">, points: number): number {
  return standing.total + Math.max(0, points - standing.replacement);
}
