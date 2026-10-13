import type { EventResult, Standing } from "./types";

/** Numeric-aware ID comparison ("900" < "1000"). */
function compareIds(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

/**
 * Highest points first. Equal scores keep the earlier-entered result (lower LiveHeats
 * result ID), so the most recently entered one is shown as discarded. This matches
 * LiveHeats, which uses entry order rather than event date (e.g. Dunny Bowl results
 * were entered after September's).
 */
function byCountingPriority(a: EventResult, b: EventResult): number {
  return b.points - a.points || compareIds(a.resultId, b.resultId) || a.eventOrder - b.eventOrder;
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
