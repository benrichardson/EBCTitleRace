export interface DivisionConfig {
  id: string;
  name: string;
  resultsToCount: number;
}

export interface EventConfig {
  /** LiveHeats event IDs that make up this one series event (e.g. two banks run as two events). */
  ids: string[];
  label: string;
  /** Three-letter label for compact grids. */
  short: string;
  status: "completed" | "pending";
}

export interface SeasonConfig {
  rulesVersion: string;
  season: number;
  series: { id: string; name: string };
  defaultDivisionId: string;
  maxEventPoints: number;
  /** In display order for division navigation. */
  divisions: DivisionConfig[];
  /** In chronological order. */
  events: EventConfig[];
  verifiedPoints: Map<number, number>;
}

function fail(msg: string): never {
  throw new Error(`Invalid season config: ${msg}`);
}

const isPositiveInt = (x: unknown): x is number => Number.isInteger(x) && (x as number) > 0;
const isNonEmptyString = (x: unknown): x is string => typeof x === "string" && x.length > 0;

export function loadSeasonConfig(input: any): SeasonConfig {
  if (!isNonEmptyString(input?.rulesVersion)) fail("rulesVersion");
  if (!isPositiveInt(input.season)) fail("season");
  if (!isNonEmptyString(input.series?.id)) fail("series.id");
  if (!isPositiveInt(input.maxEventPoints)) fail("maxEventPoints");

  const divisions: DivisionConfig[] = (input.divisions ?? []).map((d: any) => {
    if (!isNonEmptyString(d?.id) || !isNonEmptyString(d.name)) fail("division id/name");
    if (!isPositiveInt(d.resultsToCount)) fail(`resultsToCount for division ${d.id}`);
    return { id: d.id, name: d.name, resultsToCount: d.resultsToCount };
  });
  if (divisions.length === 0) fail("no divisions");
  if (new Set(divisions.map((d) => d.id)).size !== divisions.length) fail("duplicate division id");
  if (!divisions.some((d) => d.id === input.defaultDivisionId)) fail("defaultDivisionId not a configured division");

  const events: EventConfig[] = (input.events ?? []).map((e: any) => {
    if (e?.status !== "completed" && e?.status !== "pending") fail(`event status for ${e?.label}`);
    if (!Array.isArray(e.ids) || !e.ids.every(isNonEmptyString)) fail(`event ids for ${e.label}`);
    if (e.status === "completed" && e.ids.length === 0) fail(`completed event ${e.label} needs at least one id`);
    if (!isNonEmptyString(e.short)) fail(`event short label for ${e.label}`);
    return { ids: [...e.ids], label: String(e.label), short: e.short, status: e.status };
  });
  const eventIds = events.flatMap((e) => e.ids);
  if (new Set(eventIds).size !== eventIds.length) fail("duplicate event id");

  const verifiedPoints = new Map<number, number>();
  let previous = Infinity;
  for (const p of [...(input.verifiedPoints ?? [])].sort((a: any, b: any) => a.place - b.place)) {
    if (!isPositiveInt(p?.place) || !Number.isInteger(p.points) || p.points < 0) fail("verifiedPoints entry");
    if (verifiedPoints.has(p.place)) fail(`duplicate points for place ${p.place}`);
    if (p.points > previous) fail("verifiedPoints must not increase with place");
    if (p.points > input.maxEventPoints) fail("verifiedPoints above maxEventPoints");
    verifiedPoints.set(p.place, p.points);
    previous = p.points;
  }

  return {
    rulesVersion: input.rulesVersion,
    season: input.season,
    series: { id: input.series.id, name: String(input.series.name) },
    defaultDivisionId: input.defaultDivisionId,
    maxEventPoints: input.maxEventPoints,
    divisions,
    events,
    verifiedPoints,
  };
}
