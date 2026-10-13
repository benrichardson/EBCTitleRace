import { rankDivision, type RankedRow } from "@/domain/ranking";
import { buildOutlook, type Outlook } from "@/domain/narrative";
import { projectTotal } from "@/domain/scoring";
import type { SeasonConfig } from "./season";
import type { NormalisedSnapshot } from "./snapshot";

// View models: everything the UI shows, already computed. Components do no arithmetic.

export type EventCellStatus = "counted" | "discarded" | "absent" | "pending";

export interface EventCellVM {
  label: string;
  short: string;
  status: EventCellStatus;
  points: number | null;
  place: number | null;
  /** Full description for screen readers, e.g. "October, 730 points, discarded". */
  srText: string;
}

export interface RankingRowVM {
  athleteId: string;
  name: string;
  href: string;
  rank: number;
  tied: boolean;
  total: number;
  gapToLeader: number;
  /** Score a new result must beat; null while fewer results than the limit exist. */
  replacement: number | null;
  resultsCounted: number;
  resultsToCount: number;
  events: EventCellVM[];
}

export interface DivisionLinkVM {
  id: string;
  name: string;
  href: string;
  isActive: boolean;
}

export interface DivisionVM {
  id: string;
  name: string;
  resultsToCount: number;
}

export interface RankingsPageVM {
  seriesName: string;
  division: DivisionVM;
  divisions: DivisionLinkVM[];
  pendingEvent: { label: string } | null;
  rows: RankingRowVM[];
  snapshotLabel: string;
}

export interface SurferPageVM {
  athleteId: string;
  name: string;
  divisionName: string;
  seriesName: string;
  backHref: string;
  rank: number;
  tied: boolean;
  total: number;
  replacement: number | null;
  resultsCounted: number;
  resultsToCount: number;
  winTotal: number;
  rivalsCount: number;
  events: EventCellVM[];
  pendingEvent: { label: string } | null;
  snapshotLabel: string;
  outlook: Outlook;
}

export const rankingsHref = (divisionId: string) => `/2026/rankings/${divisionId}`;
export const surferHref = (divisionId: string, athleteId: string) =>
  `/2026/divisions/${divisionId}/surfers/${athleteId}`;

const sydney = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** e.g. "13 Oct 2026, 8:57 am" */
export function formatSydneyTime(iso: string): string {
  const parts = Object.fromEntries(sydney.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${Number(parts.day)} ${MONTHS[Number(parts.month) - 1]} ${parts.year}, ${parts.hour}:${parts.minute} ${String(parts.dayPeriod).toLowerCase()}`;
}

function eventCells(row: RankedRow, season: SeasonConfig): EventCellVM[] {
  const counted = new Set(row.standing.counted.map((r) => r.resultId));
  const byEvent = new Map([...row.standing.counted, ...row.standing.discarded].map((r) => [r.eventId, r]));

  return season.events.map((event): EventCellVM => {
    const base = { label: event.label, short: event.short };
    if (event.status === "pending") {
      return { ...base, status: "pending", points: null, place: null, srText: `${event.label}, pending` };
    }
    const result = event.id ? byEvent.get(event.id) : undefined;
    if (!result) return { ...base, status: "absent", points: null, place: null, srText: `${event.label}, no result` };
    const status = counted.has(result.resultId) ? "counted" : "discarded";
    return {
      ...base,
      status,
      points: result.points,
      place: result.place,
      srText: `${event.label}, ${result.points} points${status === "discarded" ? ", discarded" : ""}`,
    };
  });
}

function rankedDivision(snapshot: NormalisedSnapshot, divisionId: string) {
  const division = snapshot.divisions.find((d) => d.id === divisionId);
  if (!division) return null;
  return { division, rows: rankDivision(division.athletes, division.resultsToCount) };
}

function pendingEvent(season: SeasonConfig) {
  const e = season.events.find((x) => x.status === "pending");
  return e ? { label: e.label } : null;
}

function standingFields(row: RankedRow, resultsToCount: number) {
  const resultsCounted = row.standing.counted.length;
  return {
    replacement: resultsCounted >= resultsToCount ? row.standing.replacement : null,
    resultsCounted,
    resultsToCount,
  };
}

export function buildRankingsPage(
  snapshot: NormalisedSnapshot,
  season: SeasonConfig,
  divisionId: string,
): RankingsPageVM | null {
  const ranked = rankedDivision(snapshot, divisionId);
  if (!ranked) return null;
  const { division, rows } = ranked;

  return {
    seriesName: season.series.name,
    division: { id: division.id, name: division.name, resultsToCount: division.resultsToCount },
    divisions: season.divisions.map((d) => ({
      id: d.id,
      name: d.name,
      href: rankingsHref(d.id),
      isActive: d.id === divisionId,
    })),
    pendingEvent: pendingEvent(season),
    rows: rows.map((row) => ({
      athleteId: row.athleteId,
      name: row.name,
      href: surferHref(division.id, row.athleteId),
      rank: row.rank,
      tied: row.tied,
      total: row.standing.total,
      gapToLeader: row.gapToLeader,
      ...standingFields(row, division.resultsToCount),
      events: eventCells(row, season),
    })),
    snapshotLabel: formatSydneyTime(snapshot.retrievedAt),
  };
}

export function buildSurferPage(
  snapshot: NormalisedSnapshot,
  season: SeasonConfig,
  divisionId: string,
  athleteId: string,
): SurferPageVM | null {
  const ranked = rankedDivision(snapshot, divisionId);
  const row = ranked?.rows.find((r) => r.athleteId === athleteId);
  if (!ranked || !row) return null;

  return {
    athleteId,
    name: row.name,
    divisionName: ranked.division.name,
    seriesName: season.series.name,
    backHref: rankingsHref(divisionId),
    rank: row.rank,
    tied: row.tied,
    total: row.standing.total,
    ...standingFields(row, ranked.division.resultsToCount),
    winTotal: projectTotal(row.standing, season.maxEventPoints),
    rivalsCount: ranked.rows.length - 1,
    events: eventCells(row, season),
    pendingEvent: pendingEvent(season),
    snapshotLabel: formatSydneyTime(snapshot.retrievedAt),
    outlook: buildOutlook({
      own: {
        athleteId,
        name: row.name,
        total: row.standing.total,
        replacement: row.standing.replacement,
        rank: row.rank,
        tied: row.tied,
        resultsCounted: row.standing.counted.length,
        resultsToCount: ranked.division.resultsToCount,
      },
      rivals: ranked.rows
        .filter((r) => r.athleteId !== athleteId)
        .map((r) => ({ athleteId: r.athleteId, name: r.name, total: r.standing.total, replacement: r.standing.replacement })),
      scale: season.verifiedPoints,
      maxPoints: season.maxEventPoints,
      eventLabel: pendingEvent(season)?.label ?? "next event",
      // Snapshots are validated whole-or-nothing; per-division completeness flags can lower this later.
      guaranteesAllowed: true,
    }),
  };
}
