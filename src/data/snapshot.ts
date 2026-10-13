import type { AthleteEntry } from "@/domain/ranking";
import type { EventResult } from "@/domain/types";
import type { SeasonConfig } from "./season";

export interface DivisionSnapshot {
  id: string;
  name: string;
  resultsToCount: number;
  athletes: AthleteEntry[];
}

export interface NormalisedSnapshot {
  seriesId: string;
  retrievedAt: string;
  rulesVersion: string;
  divisions: DivisionSnapshot[];
  /** Known, explainable differences from the source (not errors). */
  warnings: string[];
}

function fail(msg: string): never {
  throw new Error(`Invalid snapshot: ${msg}`);
}

const isFiniteInt = (x: unknown): x is number => Number.isInteger(x);

/**
 * Validate a raw LiveHeats series snapshot against the season config and convert it to
 * domain inputs. Throws rather than guessing: a rejected snapshot must never replace a
 * valid one.
 */
export function normaliseSnapshot(raw: any, season: SeasonConfig): NormalisedSnapshot {
  if (String(raw?.id) !== season.series.id) fail(`series ${raw?.id} is not ${season.series.id}`);
  if (typeof raw.retrievedAt !== "string" || Number.isNaN(Date.parse(raw.retrievedAt))) fail("retrievedAt");

  const eventOrder = new Map<string, number>();
  season.events.forEach((e, i) => e.id && eventOrder.set(e.id, i));

  const rawDivisions = new Map<string, any>();
  for (const d of raw.rankingsDivisions ?? []) rawDivisions.set(String(d.id), d);

  const seenResults = new Set<string>();
  const warnings: string[] = [];

  const divisions = season.divisions.map((config): DivisionSnapshot => {
    const rd = rawDivisions.get(config.id);
    if (!rd) fail(`division ${config.id} (${config.name}) missing`);

    const sourceCounts = new Set<number>();
    const athleteIds = new Set<string>();

    const athletes = (rd.rankings ?? []).map((entry: any): AthleteEntry => {
      const athleteId = String(entry?.athlete?.id ?? "");
      const name = entry?.athlete?.name;
      if (!athleteId || typeof name !== "string") fail(`athlete identity in division ${config.id}`);
      if (athleteIds.has(athleteId)) fail(`duplicate athlete ${athleteId} in division ${config.id}`);
      athleteIds.add(athleteId);

      const detail = entry.detail;
      if (!detail || !Array.isArray(detail.results)) fail(`result detail missing for athlete ${athleteId}`);
      if (isFiniteInt(detail.resultsToCount)) sourceCounts.add(detail.resultsToCount);

      const eventsSeen = new Set<string>();
      const results = detail.results.map((r: any): EventResult => {
        const resultId = String(r?.id ?? "");
        if (!resultId) fail(`result without id for athlete ${athleteId}`);
        if (seenResults.has(resultId)) fail(`duplicate result ${resultId}`);
        seenResults.add(resultId);

        const eventId = String(r.eventDivision?.event?.id ?? "");
        const order = eventOrder.get(eventId);
        if (order === undefined) fail(`unknown event ${eventId} in result ${resultId}`);
        if (eventsSeen.has(eventId)) fail(`athlete ${athleteId} has two results for event ${eventId}`);
        eventsSeen.add(eventId);

        if (!isFiniteInt(r.points) || r.points < 0 || r.points > season.maxEventPoints) {
          fail(`invalid points ${JSON.stringify(r.points)} in result ${resultId}`);
        }
        if (!isFiniteInt(r.place) || r.place < 1) fail(`invalid place in result ${resultId}`);
        return { resultId, eventId, eventOrder: order, place: r.place, points: r.points };
      });

      return { athleteId, name, results };
    });

    for (const n of sourceCounts) {
      if (n !== config.resultsToCount) {
        warnings.push(
          `${config.name}: source counts ${n} results; club rules count ${config.resultsToCount}. Totals are recomputed locally.`,
        );
      }
    }

    return { id: config.id, name: config.name, resultsToCount: config.resultsToCount, athletes };
  });

  return { seriesId: season.series.id, retrievedAt: raw.retrievedAt, rulesVersion: season.rulesVersion, divisions, warnings };
}
