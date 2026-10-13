import { projectTotal } from "./scoring";

/**
 * The parts of a standing that scenario maths needs. These functions only see the
 * rivals they are given; callers decide whether data is complete enough to state
 * the result as a guarantee (e.g. possible new entrants, unverified results).
 */
export interface Contender {
  athleteId: string;
  total: number;
  replacement: number;
}

/** Verified place → points pairs. Missing places are unknown, never interpolated. */
export type PointsScale = ReadonlyMap<number, number>;

const maxTotal = (c: Contender, maxPoints: number) => projectTotal(c, maxPoints);
const ids = (cs: Contender[]) => cs.map((c) => c.athleteId);

/** Title is secured on points only if the current total strictly beats every rival's maximum. */
export function isTitleClinched(own: Contender, rivals: readonly Contender[], maxPoints: number): boolean {
  return rivals.every((r) => own.total > maxTotal(r, maxPoints));
}

/** Rank from a maximum result while every rival stays on their current total. */
export function bestRankIfRivalsUnchanged(own: Contender, rivals: readonly Contender[], maxPoints: number) {
  const ownMax = maxTotal(own, maxPoints);
  return {
    rank: 1 + rivals.filter((r) => r.total > ownMax).length,
    tiedWith: ids(rivals.filter((r) => r.total === ownMax)),
  };
}

/**
 * Safe (not necessarily tight) lower bound on final rank: every rival whose maximum
 * reaches the current total is assumed to finish ahead.
 */
export function conservativeRankBound(own: Contender, rivals: readonly Contender[], maxPoints: number) {
  return {
    rank: 1 + rivals.filter((r) => maxTotal(r, maxPoints) >= own.total).length,
    possibleTies: ids(rivals.filter((r) => maxTotal(r, maxPoints) === own.total)),
  };
}

/** Rivals currently level or ahead, grouped by whether the athlete's maximum can pass them. */
export function reachableRivals(own: Contender, rivals: readonly Contender[], maxPoints: number) {
  const ownMax = maxTotal(own, maxPoints);
  const ahead = rivals.filter((r) => r.total >= own.total);
  return {
    canPass: ids(ahead.filter((r) => r.total < ownMax)),
    canTie: ids(ahead.filter((r) => r.total === ownMax)),
    unreachable: ids(ahead.filter((r) => r.total > ownMax)),
  };
}

/** Rivals currently level or behind whose maximum reaches the athlete's current total. */
export function threateningRivals(own: Contender, rivals: readonly Contender[], maxPoints: number) {
  const behind = rivals.filter((r) => r.total <= own.total);
  return {
    canPass: ids(behind.filter((r) => maxTotal(r, maxPoints) > own.total)),
    canTie: ids(behind.filter((r) => maxTotal(r, maxPoints) === own.total)),
  };
}

/**
 * Lowest points that add to the total, plus the worst finish that achieves it. The
 * finish is only given when its points and the next place's points are both verified
 * (and every better place is verified), assuming points never increase with place.
 */
export function improvementThreshold(replacement: number, scale: PointsScale, maxPoints: number) {
  const minPoints = replacement + 1;
  if (minPoints > maxPoints) return { minPoints: null, worstImprovingPlace: null };

  let worstImprovingPlace: number | null = null;
  for (let place = 1; scale.has(place); place++) {
    const next = scale.get(place + 1);
    if (scale.get(place)! >= minPoints && next !== undefined && next < minPoints) {
      worstImprovingPlace = place;
      break;
    }
  }
  return { minPoints, worstImprovingPlace };
}

export type HeadToHeadOutcome = "athleteAhead" | "tie" | "rivalAhead";

/**
 * Compare a projected own result with one rival's possible November finishes.
 * The rival cannot take the athlete's own (unique) place.
 */
export function headToHead(own: { projectedTotal: number; place: number }, rival: Contender, scale: PointsScale) {
  const T = own.projectedTotal;
  const R = rival.total;
  const q = rival.replacement;

  const finishes = [...scale.entries()]
    .filter(([place]) => place !== own.place)
    .sort(([a], [b]) => a - b)
    .map(([place, points]) => {
      const rivalTotal = projectTotal(rival, points);
      const outcome: HeadToHeadOutcome = rivalTotal < T ? "athleteAhead" : rivalTotal === T ? "tie" : "rivalAhead";
      return { place, points, rivalTotal, outcome };
    });

  const maxSafeRivalPoints = R < T ? q + T - R - 1 : null;

  // First place (other than the athlete's) from which every finish is safe, when all
  // places up to it are verified.
  let safeFromPlace: number | null = null;
  if (maxSafeRivalPoints !== null) {
    for (let place = 1; scale.has(place); place++) {
      if (place !== own.place && scale.get(place)! <= maxSafeRivalPoints) {
        safeFromPlace = place;
        break;
      }
    }
  }

  return {
    rivalAlreadyAhead: R > T,
    tieIfRivalAddsNothing: R === T,
    maxSafeRivalPoints,
    finishes,
    safeFromPlace,
    tiePlaces: finishes.filter((f) => f.outcome === "tie").map((f) => f.place),
  };
}
