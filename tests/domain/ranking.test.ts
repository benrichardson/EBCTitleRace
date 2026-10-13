import { describe, expect, it } from "vitest";
import { rankDivision } from "@/domain/ranking";
import type { EventResult } from "@/domain/types";

const res = (...points: number[]): EventResult[] =>
  points.map((p, i) => ({ resultId: `x${i}-${p}`, eventId: `e${i}`, eventOrder: i, place: 0, points: p }));

describe("rankDivision", () => {
  it("assigns competition ranks with shared places for equal totals", () => {
    const rows = rankDivision(
      [
        { athleteId: "1", name: "Ann", results: res(1000) },
        { athleteId: "2", name: "Zed", results: res(860) },
        { athleteId: "3", name: "Bea", results: res(860) },
        { athleteId: "4", name: "Cal", results: res(730) },
      ],
      6,
    );
    expect(rows.map((r) => [r.athleteId, r.rank, r.tied])).toEqual([
      ["1", 1, false],
      ["3", 2, true],
      ["2", 2, true],
      ["4", 4, false],
    ]);
  });

  it("orders tied rows by name then athlete ID for stable display", () => {
    const rows = rankDivision(
      [
        { athleteId: "9", name: "Sam", results: res(500) },
        { athleteId: "5", name: "Sam", results: res(500) },
      ],
      6,
    );
    expect(rows.map((r) => r.athleteId)).toEqual(["5", "9"]);
  });

  it("reports the gap to the leader", () => {
    const rows = rankDivision(
      [
        { athleteId: "1", name: "A", results: res(1000, 860) },
        { athleteId: "2", name: "B", results: res(730) },
      ],
      6,
    );
    expect(rows.map((r) => r.gapToLeader)).toEqual([0, 1130]);
  });

  it("applies the division counting limit", () => {
    const rows = rankDivision([{ athleteId: "1", name: "A", results: res(1000, 860, 730) }], 2);
    expect(rows[0]!.standing.total).toBe(1860);
    expect(rows[0]!.standing.discarded).toHaveLength(1);
  });

  it("handles a single-athlete division", () => {
    const rows = rankDivision([{ athleteId: "1", name: "A", results: res(500) }], 6);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ rank: 1, tied: false, gapToLeader: 0 });
  });

  it("returns no rows for an empty division", () => {
    expect(rankDivision([], 6)).toEqual([]);
  });
});
