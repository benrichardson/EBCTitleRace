/**
 * Fetch the latest 2026 EB-CT results from LiveHeats, validate them, and write
 * data/snapshot.json. Nothing is written unless the whole fetch validates, so a failed
 * or partial fetch can never replace the last good snapshot.
 *
 * Usage: pnpm refresh            (fetch, validate, write, print what changed)
 *        pnpm refresh --dry-run  (fetch and validate only)
 *
 * Source: LiveHeats' public GraphQL API used by its own website. It is not a documented,
 * stable API, so queries may need updating if LiveHeats changes it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { compareWithSource } from "@/data/checks";
import { loadSeasonConfig } from "@/data/season";
import { normaliseSnapshot, type NormalisedSnapshot } from "@/data/snapshot";
import { rankDivision } from "@/domain/ranking";

const API = "https://liveheats.com/api/graphql";
const SEASON_FILE = "data/season-2026.json";
const SNAPSHOT_FILE = "data/snapshot.json";
const dryRun = process.argv.includes("--dry-run");

async function gql<T>(query: string): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "EBCTitleRace snapshot refresh" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`LiveHeats responded ${res.status} ${res.statusText}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new Error(`LiveHeats query error: ${body.errors.map((e) => e.message).join("; ")}`);
  if (!body.data) throw new Error("LiveHeats returned no data");
  return body.data;
}

const RESULT_FIELDS = `resultsToCount eligibleResults eventsToCount
  results { id place points dropped eventDivision { id event { id date name } } }`;

async function fetchSeries(seriesId: string, divisionIds: string[]) {
  const { series } = await gql<{ series: { id: string; name: string; rankingsDivisions: { id: string; name: string }[] } }>(
    `{ series(id: ${JSON.stringify(seriesId)}) { id name rankingsDivisions { id name } } }`,
  );

  const rankingsDivisions = [];
  for (const division of series.rankingsDivisions.filter((d) => divisionIds.includes(d.id))) {
    const { series: s } = await gql<{ series: { rankings: { athlete: { id: string; name: string }; place: number; points: number }[] } }>(
      `{ series(id: ${JSON.stringify(seriesId)}) { rankings(divisionId: ${JSON.stringify(division.id)}) { athlete { id name } place points } } }`,
    );
    // One request per division: each athlete's results fetched under an alias.
    const aliases = s.rankings
      .map((r, i) => `a${i}: athleteRankingResults(divisionId: ${JSON.stringify(division.id)}, athleteId: ${JSON.stringify(r.athlete.id)}) { ${RESULT_FIELDS} }`)
      .join("\n");
    const details = s.rankings.length
      ? (await gql<{ series: Record<string, unknown> }>(`{ series(id: ${JSON.stringify(seriesId)}) { ${aliases} } }`)).series
      : {};
    rankingsDivisions.push({
      id: division.id,
      name: division.name,
      rankings: s.rankings.map((r, i) => ({ ...r, detail: details[`a${i}`] ?? null })),
    });
    process.stdout.write(`  ${division.name}: ${s.rankings.length} surfers\n`);
  }

  return { id: series.id, name: series.name, rankingsDivisions, retrievedAt: new Date().toISOString() };
}

function totals(snapshot: NormalisedSnapshot) {
  const out = new Map<string, string>();
  for (const d of snapshot.divisions) {
    for (const r of rankDivision(d.athletes, d.resultsToCount)) out.set(`${d.name}: ${r.name}`, `${r.rank}${r.tied ? "=" : ""} ${r.standing.total}`);
  }
  return out;
}

async function main() {
  const season = loadSeasonConfig(JSON.parse(readFileSync(SEASON_FILE, "utf8")));
  console.log(`Fetching ${season.series.name} from LiveHeats…`);
  const raw = await fetchSeries(season.series.id, season.divisions.map((d) => d.id));

  const next = normaliseSnapshot(raw, season); // throws on anything invalid
  for (const w of [...next.warnings, ...compareWithSource(next)]) console.warn(`  ⚠ ${w}`);

  let previous: NormalisedSnapshot | null = null;
  try {
    previous = normaliseSnapshot(JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")), season);
  } catch {
    // No previous snapshot or it no longer validates; treat everything as new.
  }
  const before = previous ? totals(previous) : new Map<string, string>();
  const after = totals(next);
  const changes = [...after].filter(([k, v]) => before.get(k) !== v).map(([k, v]) => `  ${k}: ${before.get(k) ?? "new"} → ${v}`);
  const removed = [...before.keys()].filter((k) => !after.has(k)).map((k) => `  ${k}: removed`);
  console.log(changes.length + removed.length ? `Changes (rank total):\n${[...changes, ...removed].join("\n")}` : "No ranking changes.");

  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(raw, null, 1) + "\n");
  console.log(`Wrote ${SNAPSHOT_FILE} (retrieved ${raw.retrievedAt}).`);
}

main().catch((err) => {
  console.error(`Refresh failed; the existing snapshot is unchanged.\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
