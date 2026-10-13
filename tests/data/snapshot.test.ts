import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadSeasonConfig } from "@/data/season";
import { normaliseSnapshot } from "@/data/snapshot";
import { isTitleClinched } from "@/domain/outlook";
import { rankDivision } from "@/domain/ranking";
import { projectTotal } from "@/domain/scoring";

const season = loadSeasonConfig(JSON.parse(readFileSync("data/season-2026.json", "utf8")));
const raw = JSON.parse(readFileSync("data/prototype-snapshot.json", "utf8"));

const clone = <T>(x: T): T => structuredClone(x);
const firstResult = (snap: any) => snap.rankingsDivisions[0].rankings[0].detail.results;

describe("season config", () => {
  it("counts five results for Originals (O50) and six everywhere else", () => {
    for (const d of season.divisions) {
      expect(d.resultsToCount).toBe(d.id === "107730" ? 5 : 6);
    }
    expect(season.divisions).toHaveLength(12);
  });

  it("defaults to U18 Boys", () => {
    expect(season.defaultDivisionId).toBe("92925");
  });

  it("rejects a division without a valid counting limit", () => {
    const bad = JSON.parse(readFileSync("data/season-2026.json", "utf8"));
    bad.divisions[0].resultsToCount = 0;
    expect(() => loadSeasonConfig(bad)).toThrow();
  });
});

describe("normaliseSnapshot", () => {
  const snap = normaliseSnapshot(raw, season);
  const rows = (divisionId: string) => {
    const d = snap.divisions.find((x) => x.id === divisionId)!;
    return rankDivision(d.athletes, d.resultsToCount);
  };
  const row = (divisionId: string, name: string) => rows(divisionId).find((r) => r.name === name)!;

  it("records the source retrieval time", () => {
    expect(snap.retrievedAt).toBe("2026-10-12T21:57:53.691763+00:00");
  });

  it("reproduces the spec's Masters regression figures", () => {
    const expected: [string, number, number][] = [
      ["Glenn Pringle", 5140, 610],
      ["David Martin", 4610, 610],
      ["Cam Pyett", 4520, 610],
      ["Ben Richardson", 3783, 475],
      ["Rickard Muffinhead Sillan", 4185, 500],
    ];
    for (const [name, total, replacement] of expected) {
      const r = row("107729", name);
      expect({ name, total: r.standing.total, replacement: r.standing.replacement }).toEqual({ name, total, replacement });
    }
  });

  it("reproduces the spec's Masters win totals", () => {
    const expected: [string, number][] = [
      ["Glenn Pringle", 5530],
      ["David Martin", 5000],
      ["Cam Pyett", 4910],
      ["Ben Richardson", 4308],
      ["Rickard Muffinhead Sillan", 4685],
    ];
    for (const [name, winTotal] of expected) {
      expect([name, projectTotal(row("107729", name).standing, season.maxEventPoints)]).toEqual([name, winTotal]);
    }
  });

  it("finds Glenn Pringle strictly ahead of every Masters rival's maximum", () => {
    const toContender = (r: ReturnType<typeof rows>[number]) => ({ athleteId: r.athleteId, ...r.standing });
    const [glenn, ...rest] = rows("107729");
    expect(glenn!.name).toBe("Glenn Pringle");
    expect(isTitleClinched(toContender(glenn!), rest.map(toContender), season.maxEventPoints)).toBe(true);
  });

  it("counts best five in O50 and leaves equal totals as a shared rank", () => {
    expect(row("107730", "DARREN CURLEY").standing.total).toBe(4580);
    const colm = row("107730", "Colm O’leary");
    const simon = row("107730", "Simon Johnson");
    expect(colm.standing.total).toBe(4450);
    expect(simon.standing.total).toBe(4450);
    expect(colm.rank).toBe(simon.rank);
    expect(colm.tied && simon.tied).toBe(true);
  });

  it("rejects duplicate result IDs", () => {
    const bad = clone(raw);
    const results = firstResult(bad);
    results.push(clone(results[0]));
    expect(() => normaliseSnapshot(bad, season)).toThrow(/duplicate result/i);
  });

  it("rejects results from events not configured for the season", () => {
    const bad = clone(raw);
    firstResult(bad)[0].eventDivision.event.id = "999";
    expect(() => normaliseSnapshot(bad, season)).toThrow(/unknown event/i);
  });

  it("rejects invalid points", () => {
    const bad = clone(raw);
    firstResult(bad)[0].points = "860";
    expect(() => normaliseSnapshot(bad, season)).toThrow(/points/i);
  });

  it("rejects a snapshot from a different series", () => {
    const bad = clone(raw);
    bad.id = "1";
    expect(() => normaliseSnapshot(bad, season)).toThrow(/series/i);
  });

  it("rejects a snapshot missing a configured division", () => {
    const bad = clone(raw);
    bad.rankingsDivisions.pop();
    expect(() => normaliseSnapshot(bad, season)).toThrow(/division/i);
  });

  it("rejects an athlete whose result detail is missing rather than treating it as zero", () => {
    const bad = clone(raw);
    bad.rankingsDivisions[0].rankings[0].detail = null;
    expect(() => normaliseSnapshot(bad, season)).toThrow(/detail/i);
  });

  it("flags the source's seven-result counting setting as a known discrepancy", () => {
    expect(snap.warnings.some((w) => /counts 7/.test(w))).toBe(true);
  });
});

describe("November pool event (two LiveHeats events, one series event)", () => {
  const nov = (eventId: string) => {
    const s = clone(raw);
    const results = firstResult(s);
    results.push({ ...clone(results[0]), id: "nov-1", eventDivision: { id: "x", event: { id: eventId, date: "2026-11-14T21:00:00Z", name: "Nov" } } });
    return s;
  };

  it("maps both LiveHeats IDs to the one configured event", () => {
    const novEvent = season.events.find((e) => e.status === "pending")!;
    expect(novEvent.ids).toEqual(["556196", "511448"]);
  });

  it("refuses results for an event still marked pending, so provisional scores can't slip in", () => {
    expect(() => normaliseSnapshot(nov("511448"), season)).toThrow(/pending/i);
  });

  it("rejects two results for the same series event across its LiveHeats events", () => {
    const completedSeason = { ...season, events: season.events.map((e) => ({ ...e, status: "completed" as const })) };
    const s = nov("556196");
    const results = firstResult(s);
    results.push({ ...clone(results[0]), id: "nov-2", eventDivision: { id: "y", event: { id: "511448", date: "2026-11-14T21:00:00Z", name: "Nov" } } });
    expect(() => normaliseSnapshot(s, completedSeason)).toThrow(/two results/i);
  });
});

describe("the committed live snapshot", () => {
  it("validates against the season config", () => {
    const live = JSON.parse(readFileSync("data/snapshot.json", "utf8"));
    expect(() => normaliseSnapshot(live, season)).not.toThrow();
  });
});
