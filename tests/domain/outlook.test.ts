import { describe, expect, it } from "vitest";
import {
  bestRankIfRivalsUnchanged,
  conservativeRankBound,
  headToHead,
  improvementThreshold,
  isTitleClinched,
  ownFinishScenarios,
  reachableRivals,
  selectRivals,
  threateningRivals,
  type Contender,
} from "@/domain/outlook";

const MAX = 1000;
const c = (athleteId: string, total: number, replacement: number): Contender => ({ athleteId, total, replacement });

// Places 1–14 and 17 verified; 15 and 16 deliberately unknown.
const SCALE = new Map([
  [1, 1000], [2, 860], [3, 730], [4, 670], [5, 610], [6, 583], [7, 555],
  [8, 528], [9, 500], [10, 488], [11, 475], [12, 462], [13, 450], [14, 438], [17, 400],
]);

describe("isTitleClinched", () => {
  it("is true only when the current total strictly exceeds every rival maximum", () => {
    expect(isTitleClinched(c("me", 5000, 600), [c("a", 4000, 500)], MAX)).toBe(true); // a max 4500
  });

  it("is false when a rival maximum equals the current total (possible tie)", () => {
    expect(isTitleClinched(c("me", 4500, 600), [c("a", 4000, 500)], MAX)).toBe(false);
  });

  it("is false when a rival maximum exceeds the current total", () => {
    expect(isTitleClinched(c("me", 4400, 600), [c("a", 4000, 500)], MAX)).toBe(false);
  });
});

describe("bestRankIfRivalsUnchanged", () => {
  it("counts rivals whose current total already exceeds the athlete's maximum", () => {
    // me max = 4000 + (1000 - 500) = 4500
    const r = bestRankIfRivalsUnchanged(c("me", 4000, 500), [c("a", 4600, 0), c("b", 4500, 0), c("c", 4400, 0)], MAX);
    expect(r.rank).toBe(2);
    expect(r.tiedWith).toEqual(["b"]);
  });
});

describe("conservativeRankBound", () => {
  it("counts every rival whose maximum reaches the current total, including potential ties", () => {
    const r = conservativeRankBound(
      c("me", 4500, 600),
      [c("a", 4000, 500) /* max 4500, tie */, c("b", 4200, 500) /* max 4700 */, c("d", 3000, 500) /* max 3500 */],
      MAX,
    );
    expect(r.rank).toBe(3);
    expect(r.possibleTies).toEqual(["a"]);
  });

  it("is 1 in a single-athlete division", () => {
    expect(conservativeRankBound(c("me", 100, 0), [], MAX).rank).toBe(1);
  });
});

describe("reachableRivals", () => {
  it("separates rivals below, equal to and above the athlete's maximum", () => {
    // me max = 4000 + 500 = 4500
    const r = reachableRivals(c("me", 4000, 500), [c("a", 4400, 0), c("b", 4500, 0), c("x", 4600, 0), c("me2", 3000, 0)], MAX);
    expect(r.canPass).toEqual(["a"]);
    expect(r.canTie).toEqual(["b"]);
    expect(r.unreachable).toEqual(["x"]);
  });

  it("does not list rivals already behind the athlete as passable", () => {
    const r = reachableRivals(c("me", 4000, 500), [c("behind", 3900, 0)], MAX);
    expect(r.canPass).toEqual([]);
  });
});

describe("threateningRivals", () => {
  it("lists level or lower rivals whose maximum reaches the current total, splitting pass from tie", () => {
    const r = threateningRivals(
      c("me", 4500, 600),
      [c("pass", 4100, 500) /* 4600 */, c("tie", 4000, 500) /* 4500 */, c("safe", 3900, 500) /* 4400 */, c("ahead", 4700, 500)],
      MAX,
    );
    expect(r.canPass).toEqual(["pass"]);
    expect(r.canTie).toEqual(["tie"]);
  });

  it("treats a rival level on points as a threat that can pass", () => {
    const r = threateningRivals(c("me", 4500, 600), [c("level", 4500, 500)], MAX);
    expect(r.canPass).toEqual(["level"]);
  });
});

describe("improvementThreshold", () => {
  it("returns the minimum improving points and the worst improving finish when the scale is known around it", () => {
    expect(improvementThreshold(610, SCALE, MAX)).toEqual({ minPoints: 611, worstImprovingPlace: 4 });
  });

  it("does not translate to a finish when the next place's points are unverified", () => {
    // 438 (14th) improves on 420; 15th is unknown so the worst improving finish is unknown.
    expect(improvementThreshold(420, SCALE, MAX)).toEqual({ minPoints: 421, worstImprovingPlace: null });
  });

  it("treats every result as improving when nothing is being replaced", () => {
    expect(improvementThreshold(0, SCALE, MAX)).toEqual({ minPoints: 1, worstImprovingPlace: null });
  });

  it("reports no possible improvement when the replacement is already the maximum", () => {
    expect(improvementThreshold(1000, SCALE, MAX)).toEqual({ minPoints: null, worstImprovingPlace: null });
  });
});

describe("headToHead", () => {
  it("reports that the athlete cannot get ahead when the rival's current total exceeds the projection", () => {
    const h = headToHead({ projectedTotal: 4900, place: 2 }, c("cam", 4950, 610), SCALE);
    expect(h.rivalAlreadyAhead).toBe(true);
    expect(h.maxSafeRivalPoints).toBeNull();
  });

  it("treats an equal current total as a tie if the rival adds nothing", () => {
    const h = headToHead({ projectedTotal: 4900, place: 2 }, c("cam", 4900, 610), SCALE);
    expect(h.rivalAlreadyAhead).toBe(false);
    expect(h.tieIfRivalAddsNothing).toBe(true);
    expect(h.maxSafeRivalPoints).toBeNull();
  });

  it("computes the maximum safe rival points as q + T - R - 1", () => {
    // T = 4980, R = 4520, q = 610 -> safe while rival scores <= 1069 -> always safe
    expect(headToHead({ projectedTotal: 4980, place: 1 }, c("cam", 4520, 610), SCALE).maxSafeRivalPoints).toBe(1069);
    // T = 4900, R = 4520, q = 610 -> max safe 989
    expect(headToHead({ projectedTotal: 4900, place: 2 }, c("cam", 4520, 610), SCALE).maxSafeRivalPoints).toBe(989);
  });

  it("evaluates each verified rival finish except the athlete's own unique place", () => {
    // T = 4900; cam 4520 q 610. 1st -> 4910 (ahead), 3rd -> 4640 safe.
    const h = headToHead({ projectedTotal: 4900, place: 2 }, c("cam", 4520, 610), SCALE);
    expect(h.finishes.find((f) => f.place === 2)).toBeUndefined();
    expect(h.finishes.find((f) => f.place === 1)).toMatchObject({ rivalTotal: 4910, outcome: "rivalAhead" });
    expect(h.finishes.find((f) => f.place === 3)).toMatchObject({ rivalTotal: 4640, outcome: "athleteAhead" });
    expect(h.safeFromPlace).toBe(3);
    expect(h.tiePlaces).toEqual([]);
  });

  it("identifies a finish that produces a points tie", () => {
    // T = 4650, R = 4520, q = 600 -> rival 730 (3rd) gives 4650 tie; 4th safe.
    const h = headToHead({ projectedTotal: 4650, place: 1 }, c("cam", 4520, 600), SCALE);
    expect(h.tiePlaces).toEqual([3]);
    expect(h.safeFromPlace).toBe(4);
  });

  it("does not name a safe-from finish when the boundary falls in unverified places", () => {
    // T = 4520, R = 4500, q = 400 -> max safe 419: 14th (438) unsafe, 15th unknown, 17th safe.
    const h = headToHead({ projectedTotal: 4520, place: 1 }, c("cam", 4500, 400), SCALE);
    expect(h.maxSafeRivalPoints).toBe(419);
    expect(h.safeFromPlace).toBeNull();
  });
});


describe("ownFinishScenarios", () => {
  it("lists 1st–4th and then groups every finish that adds nothing", () => {
    // replacement 730: 3rd (730) adds nothing, so 3rd or lower is one group.
    expect(ownFinishScenarios(c("me", 4450, 730), SCALE)).toEqual([
      { fromPlace: 1, orLower: false, points: 1000, total: 4720, gain: 270 },
      { fromPlace: 2, orLower: false, points: 860, total: 4580, gain: 130 },
      { fromPlace: 3, orLower: true, points: 730, total: 4450, gain: 0 },
    ]);
  });

  it("adds the first non-improving finish after the first four", () => {
    const rows = ownFinishScenarios(c("me", 3783, 475), SCALE);
    expect(rows.map((r) => [r.fromPlace, r.orLower])).toEqual([
      [1, false], [2, false], [3, false], [4, false], [11, true],
    ]);
    expect(rows.at(-1)!.total).toBe(3783);
  });

  it("can group across unverified places because points never rise with place", () => {
    // replacement 420: 14th (438) improves, 15th/16th unknown, 17th (400) does not.
    expect(ownFinishScenarios(c("me", 3000, 420), SCALE).at(-1)).toMatchObject({ fromPlace: 17, orLower: true, gain: 0 });
  });

  it("has no 'or lower' row when every verified finish improves", () => {
    expect(ownFinishScenarios(c("me", 500, 0), SCALE).some((r) => r.orLower)).toBe(false);
  });
});

describe("headToHead for a grouped own finish", () => {
  it("lets the rival take any place when the athlete's own place is not fixed", () => {
    const h = headToHead({ projectedTotal: 4450, place: null }, c("colm", 4450, 730), SCALE);
    expect(h.tieIfRivalAddsNothing).toBe(true);
    expect(h.finishes.find((f) => f.place === 3)).toMatchObject({ outcome: "tie" });
  });
});

describe("selectRivals", () => {
  const field = [c("darren", 4580, 860), c("colm", 4450, 730), c("simon", 4450, 730), c("scott", 2400, 0), c("craig", 730, 0)];

  it("picks the leader, the nearest reachable rival above or level, and the nearest threat below", () => {
    expect(selectRivals(c("simon", 4450, 730), field.filter((r) => r.athleteId !== "simon"), MAX)).toEqual(["darren", "colm"]);
  });

  it("returns every rival level on the nearest threatening total, in field order", () => {
    expect(selectRivals(c("darren", 4580, 860), field.filter((r) => r.athleteId !== "darren"), MAX)).toEqual(["colm", "simon"]);
  });

  it("shows at most three rivals", () => {
    const crowd = ["a", "b", "c", "d"].map((id) => c(id, 4000, 500));
    expect(selectRivals(c("me", 4100, 500), crowd, MAX)).toHaveLength(3);
  });

  it("returns nothing when no rival is reachable or threatening", () => {
    expect(selectRivals(c("craig", 730, 0), [c("darren", 4580, 860)], MAX)).toEqual([]);
  });
});
