import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compareWithSource } from "@/data/checks";
import { loadSeasonConfig } from "@/data/season";
import { normaliseSnapshot } from "@/data/snapshot";

const season = loadSeasonConfig(JSON.parse(readFileSync("data/season-2026.json", "utf8")));
const raw = JSON.parse(readFileSync("data/prototype-snapshot.json", "utf8"));

// Darren Curley (O50): best 5 of 6 discards May's 730.
function withSource(droppedResultId: string | null, resultsToCount = 5) {
  const s = structuredClone(raw);
  const darren = s.rankingsDivisions.find((d: any) => d.id === "107730").rankings[0];
  darren.detail.resultsToCount = resultsToCount;
  for (const r of darren.detail.results) r.dropped = r.id === droppedResultId ? true : null;
  darren.points = 4580;
  return normaliseSnapshot(s, season);
}

describe("compareWithSource", () => {
  it("is quiet when LiveHeats drops the same result", () => {
    expect(compareWithSource(withSource("10680965"))).toEqual([]);
  });

  it("warns when LiveHeats crosses out a different result", () => {
    const warnings = compareWithSource(withSource("10418407"));
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/DARREN CURLEY/);
  });

  it("skips athletes whose source counts a different number of results", () => {
    expect(compareWithSource(withSource("10418407", 7))).toEqual([]);
  });

  it("warns when the source total differs although it counts the same number", () => {
    const s = structuredClone(raw);
    const darren = s.rankingsDivisions.find((d: any) => d.id === "107730").rankings[0];
    darren.detail.resultsToCount = 5;
    darren.points = 4000;
    expect(compareWithSource(normaliseSnapshot(s, season)).join(" ")).toMatch(/total/);
  });
});
