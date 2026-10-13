import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadSeasonConfig } from "@/data/season";
import { normaliseSnapshot } from "@/data/snapshot";
import { buildRankingsPage, buildSurferPage, formatSydneyTime } from "@/data/views";

const season = loadSeasonConfig(JSON.parse(readFileSync("data/season-2026.json", "utf8")));
const snap = normaliseSnapshot(JSON.parse(readFileSync("data/prototype-snapshot.json", "utf8")), season);

const MASTERS = "107729";
const U18_GIRLS = "92929";
const O50 = "107730";

describe("buildRankingsPage", () => {
  const page = buildRankingsPage(snap, season, MASTERS)!;
  const glenn = page.rows.find((r) => r.name === "Glenn Pringle")!;

  it("returns null for an unknown division", () => {
    expect(buildRankingsPage(snap, season, "nope")).toBeNull();
  });

  it("lists rows in rank order with same-tab surfer page links", () => {
    expect(page.rows[0]!.name).toBe("Glenn Pringle");
    expect(glenn.href).toBe(`/2026/divisions/${MASTERS}/surfers/${glenn.athleteId}`);
    expect(glenn).toMatchObject({ rank: 1, tied: false, total: 5140, gapToLeader: 0, replacement: 610 });
  });

  it("links every division and marks the active one", () => {
    expect(page.divisions).toHaveLength(12);
    expect(page.divisions.filter((d) => d.isActive).map((d) => d.id)).toEqual([MASTERS]);
    expect(page.divisions.find((d) => d.id === "92925")!.href).toBe("/2026/rankings/92925");
  });

  it("gives one cell per season event, ending with the pending November event", () => {
    expect(glenn.events.map((e) => e.short)).toEqual(["Mar", "Apr", "May", "Jul", "Aug", "Sep", "Oct", "Nov"]);
    expect(glenn.events.at(-1)).toMatchObject({ status: "pending", points: null });
    expect(glenn.events.at(-1)!.srText).toMatch(/pending/i);
  });

  it("marks discarded results with screen-reader text", () => {
    const jess = buildRankingsPage(snap, season, U18_GIRLS)!.rows.find((r) => r.name === "Jess Mayer")!;
    const jul = jess.events.find((e) => e.short === "Jul")!;
    const oct = jess.events.find((e) => e.short === "Oct")!;
    expect(jul).toMatchObject({ status: "counted", points: 730 });
    expect(oct).toMatchObject({ status: "discarded", points: 730 });
    expect(oct.srText).toBe("October, 730 points, discarded");
  });

  it("marks events with no result as absent rather than zero", () => {
    const u12 = buildRankingsPage(snap, season, "92926")!;
    const cells = u12.rows[0]!.events;
    expect(cells.find((e) => e.short === "Mar")).toMatchObject({ status: "absent", points: null });
  });

  it("gives no replacement score when fewer results than the limit exist", () => {
    const u12 = buildRankingsPage(snap, season, "92926")!.rows[0]!;
    expect(u12.replacement).toBeNull();
    expect(u12.resultsCounted).toBe(1);
    expect(u12.resultsToCount).toBe(6);
  });

  it("shows equal totals as a shared, tied rank", () => {
    const rows = buildRankingsPage(snap, season, O50)!.rows;
    const tied = rows.filter((r) => r.total === 4450);
    expect(tied).toHaveLength(2);
    expect(new Set(tied.map((r) => r.rank)).size).toBe(1);
    expect(tied.every((r) => r.tied)).toBe(true);
  });

  it("describes the remaining event and counting rule", () => {
    expect(page.pendingEvent).toEqual({ label: "November pool event" });
    expect(page.division.resultsToCount).toBe(6);
    expect(buildRankingsPage(snap, season, O50)!.division.resultsToCount).toBe(5);
  });

  it("labels the snapshot in Sydney time", () => {
    expect(page.snapshotLabel).toMatch(/^13 Oct 2026, 8:57\s?am$/i);
  });
});

describe("buildSurferPage", () => {
  it("returns null for an unknown surfer", () => {
    expect(buildSurferPage(snap, season, MASTERS, "nope")).toBeNull();
  });

  it("summarises the surfer's standing and total with a win", () => {
    const page = buildRankingsPage(snap, season, MASTERS)!;
    const id = page.rows.find((r) => r.name === "Glenn Pringle")!.athleteId;
    const s = buildSurferPage(snap, season, MASTERS, id)!;
    expect(s).toMatchObject({
      name: "Glenn Pringle",
      rank: 1,
      total: 5140,
      replacement: 610,
      winTotal: 5530,
      backHref: `/2026/rankings/${MASTERS}`,
      divisionName: "Masters (O35)",
      rivalsCount: page.rows.length - 1,
    });
    expect(s.events).toHaveLength(8);
  });
});

describe("formatSydneyTime", () => {
  it("handles daylight saving", () => {
    expect(formatSydneyTime("2026-07-01T00:00:00Z")).toMatch(/^1 Jul 2026, 10:00\s?am$/i);
  });
});
