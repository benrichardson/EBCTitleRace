import { describe, expect, it } from "vitest";
import { buildOutlook, type NarrativeInput } from "@/domain/narrative";

const SCALE = new Map([
  [1, 1000], [2, 860], [3, 730], [4, 670], [5, 610], [6, 583], [7, 555],
  [8, 528], [9, 500], [10, 488], [11, 475], [12, 462], [13, 450], [14, 438], [17, 400],
]);

type Person = { id: string; name: string; total: number; replacement: number; rank: number; tied?: boolean; counted?: number };

function input(me: Person, rivals: Person[], guaranteesAllowed = true): NarrativeInput {
  return {
    own: {
      athleteId: me.id, name: me.name, total: me.total, replacement: me.replacement, rank: me.rank,
      tied: me.tied ?? false, resultsCounted: me.counted ?? 6, resultsToCount: 6,
    },
    rivals: rivals.map((r) => ({ athleteId: r.id, name: r.name, total: r.total, replacement: r.replacement })),
    scale: SCALE,
    maxPoints: 1000,
    eventLabel: "November pool event",
    guaranteesAllowed,
  };
}

const kinds = (o: ReturnType<typeof buildOutlook>) => o.items.map((i) => i.kind);

describe("buildOutlook", () => {
  it("states a clinch only when the total beats every rival maximum", () => {
    const o = buildOutlook(input({ id: "g", name: "Glenn", total: 5140, replacement: 610, rank: 1 }, [
      { id: "d", name: "David", total: 4610, replacement: 610, rank: 2 },
    ]));
    expect(o.headline).toBe("Championship secured on points. Nobody can reach your 5,140.");
    expect(kinds(o)).not.toContain("safeBound");
  });

  it("withholds the clinch and guarantees when data completeness is uncertain", () => {
    const unsure = buildOutlook(
      input({ id: "g", name: "Glenn", total: 5140, replacement: 610, rank: 1 }, [
        { id: "d", name: "David", total: 4610, replacement: 610, rank: 2 },
      ], false),
    );
    expect(unsure.headline).not.toMatch(/secured/i);
    expect(unsure.items.map((i) => i.text).join(" ")).not.toMatch(/secured|guaranteed/i);
  });

  it("explains a lone surfer without inventing rivals", () => {
    const o = buildOutlook(input({ id: "h", name: "Havana", total: 3000, replacement: 0, rank: 1, counted: 3 }, []));
    expect(o.items.find((i) => i.kind === "canCatch")!.text).toBe("You're the only surfer in this division.");
    expect(o.items.find((i) => i.kind === "improve")!.text).toBe(
      "Any November pool event result adds to your total: 3 of your best 6 count so far.",
    );
    expect(o.headToHead).toEqual([]);
  });

  it("says when no November result can add points", () => {
    const o = buildOutlook(input({ id: "x", name: "X", total: 6000, replacement: 1000, rank: 1 }, []));
    expect(o.items.find((i) => i.kind === "improve")!.text).toBe("No November pool event result can add to your total.");
  });

  it("gives a points threshold rather than a finish when the boundary place is unverified", () => {
    const o = buildOutlook(input({ id: "x", name: "X", total: 3000, replacement: 420, rank: 1 }, []));
    expect(o.items.find((i) => i.kind === "improve")!.text).toBe("You need more than 420 points to add to your total.");
  });

  it("summarises long rival lists instead of naming everyone", () => {
    const rivals = ["a", "b", "c", "d", "e"].map((id, i) => ({ id, name: id.toUpperCase(), total: 4000 - i, replacement: 500, rank: i + 2 }));
    const o = buildOutlook(input({ id: "me", name: "Me", total: 4100, replacement: 500, rank: 1 }, rivals));
    expect(o.items.find((i) => i.kind === "canCatch")!.text).toMatch(/^5 surfers can pass your current 4,100/);
  });
});
