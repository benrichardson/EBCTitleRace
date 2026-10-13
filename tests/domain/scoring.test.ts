import { describe, expect, it } from "vitest";
import { countBestN, projectTotal } from "@/domain/scoring";
import type { EventResult } from "@/domain/types";

const r = (eventOrder: number, points: number, resultId = `r${eventOrder}`): EventResult => ({
  resultId,
  eventId: `e${eventOrder}`,
  eventOrder,
  place: 0,
  points,
});

describe("countBestN", () => {
  it("keeps every result when fewer than N exist and has no replacement score", () => {
    const s = countBestN([r(1, 860), r(2, 500)], 6);
    expect(s.total).toBe(1360);
    expect(s.discarded).toEqual([]);
    expect(s.replacement).toBe(0);
  });

  it("uses the lowest counted score as replacement when exactly N exist", () => {
    const s = countBestN([r(1, 1000), r(2, 860), r(3, 730), r(4, 670), r(5, 610)], 5);
    expect(s.total).toBe(3870);
    expect(s.replacement).toBe(610);
    expect(s.discarded).toEqual([]);
  });

  it("discards the lowest scores when more than N exist", () => {
    const s = countBestN([r(1, 400), r(2, 1000), r(3, 860), r(4, 500), r(5, 730), r(6, 670), r(7, 610)], 6);
    expect(s.total).toBe(1000 + 860 + 730 + 670 + 610 + 500);
    expect(s.discarded.map((x) => x.resultId)).toEqual(["r1"]);
    expect(s.replacement).toBe(500);
  });

  it("discards the most recently entered result (highest LiveHeats result ID) when equal low scores compete, like LiveHeats", () => {
    // Event order deliberately disagrees with entry order: the later-entered result goes.
    const s = countBestN([r(1, 1000, "100"), r(2, 500, "11010571"), r(3, 500, "11007123")], 2);
    expect(s.counted.map((x) => x.resultId)).toEqual(["100", "11007123"]);
    expect(s.discarded.map((x) => x.resultId)).toEqual(["11010571"]);
    expect(s.replacement).toBe(500);
  });

  it("compares result IDs numerically, not alphabetically", () => {
    const s = countBestN([r(1, 500, "900"), r(2, 500, "1000")], 1);
    expect(s.discarded.map((x) => x.resultId)).toEqual(["1000"]);
  });

  it("treats a scored zero as a real counted result", () => {
    const s = countBestN([r(1, 0)], 1);
    expect(s.counted).toHaveLength(1);
    expect(s.total).toBe(0);
    expect(s.replacement).toBe(0);
  });

  it("rejects a non-positive counting limit", () => {
    expect(() => countBestN([r(1, 500)], 0)).toThrow();
  });
});

describe("projectTotal", () => {
  const full = countBestN([r(1, 1000), r(2, 860), r(3, 730), r(4, 670), r(5, 610), r(6, 500)], 6);

  it("adds only the improvement over the replacement score", () => {
    expect(projectTotal(full, 860)).toBe(full.total + 360);
  });

  it("adds nothing when the new result equals the replacement score", () => {
    expect(projectTotal(full, 500)).toBe(full.total);
  });

  it("adds nothing when the new result is below the replacement score", () => {
    expect(projectTotal(full, 400)).toBe(full.total);
  });

  it("adds the whole result when fewer than N are counted", () => {
    const partial = countBestN([r(1, 730)], 6);
    expect(projectTotal(partial, 400)).toBe(1130);
  });

  it("matches full recomputation for every candidate outcome", () => {
    const base = [r(1, 1000), r(2, 450), r(3, 730), r(4, 670), r(5, 610), r(6, 500), r(7, 438)];
    const standing = countBestN(base, 6);
    for (const p of [0, 400, 438, 450, 500, 610, 1000]) {
      const recomputed = countBestN([...base, r(8, p)], 6).total;
      expect(projectTotal(standing, p)).toBe(recomputed);
    }
  });
});
