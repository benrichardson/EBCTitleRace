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
  type PointsScale,
} from "./outlook";
import { projectTotal } from "./scoring";

// Plain-language outlook built only from computed results. Wording rules (spec §6):
// "secured"/"guaranteed" only when proven and data is complete; state assumptions inline;
// never name more than three rivals in one sentence.

export interface NarrativeInput {
  own: Contender & { name: string; rank: number; tied: boolean; resultsCounted: number; resultsToCount: number };
  /** Everyone else in the division, in rank order. */
  rivals: (Contender & { name: string })[];
  scale: PointsScale;
  maxPoints: number;
  eventLabel: string;
  /** False when source completeness is uncertain: absolute claims are withheld. */
  guaranteesAllowed: boolean;
}

export type OutlookKind = "bestRank" | "safeBound" | "improve" | "canPass" | "canCatch";
export interface OutlookItem {
  kind: OutlookKind;
  text: string;
}

export type HeadToHeadTone = "ahead" | "conditional" | "tie" | "behind";
export interface HeadToHeadRow {
  ownFinish: string;
  ownTotal: number;
  verdict: string;
  tone: HeadToHeadTone;
}
export interface HeadToHeadTable {
  rivalId: string;
  rivalName: string;
  rivalTotal: number;
  rows: HeadToHeadRow[];
}

export interface Outlook {
  headline: string;
  items: OutlookItem[];
  headToHead: HeadToHeadTable[];
}

const number = new Intl.NumberFormat("en-AU");
const fmt = (n: number) => number.format(n);

export function ordinal(n: number): string {
  const rem100 = n % 100;
  const suffix = rem100 >= 11 && rem100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

function nameList(names: string[]): string {
  if (names.length > 3) return `${names.length} surfers`;
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** First place (skipping `exclude`) meeting `test`, provided every place before it is verified. */
function firstVerifiedPlace(scale: PointsScale, test: (points: number) => boolean, exclude: number | null): number | null {
  for (let place = 1; scale.has(place); place++) {
    if (place !== exclude && test(scale.get(place)!)) return place;
  }
  return null;
}

function verdict(
  own: { total: number; place: number | null },
  rival: Contender,
  scale: PointsScale,
  maxPoints: number,
): { verdict: string; tone: HeadToHeadTone } {
  const h = headToHead({ projectedTotal: own.total, place: own.place }, rival, scale);

  if (h.rivalAlreadyAhead) return { verdict: "You can't finish ahead of them.", tone: "behind" };

  if (h.tieIfRivalAddsNothing) {
    if (rival.replacement === 0) return { verdict: "Level at best: a points tie only if they don't score.", tone: "tie" };
    const from = firstVerifiedPlace(scale, (p) => p <= rival.replacement, own.place);
    return {
      verdict:
        from === null
          ? `Level at best: a points tie if they score ${fmt(rival.replacement)} or fewer.`
          : `Level at best: a points tie if they finish ${ordinal(from)} or lower or don't score.`,
      tone: "tie",
    };
  }

  const maxSafe = h.maxSafeRivalPoints!;
  if (maxSafe >= maxPoints) return { verdict: "You stay ahead whatever they do.", tone: "ahead" };

  const ties = h.tiePlaces.length ? `; ${nameList(h.tiePlaces.map(ordinal))} gives a points tie` : "";
  const need =
    h.safeFromPlace === null
      ? `They need ${fmt(maxSafe)} points or fewer`
      : `They need ${ordinal(h.safeFromPlace)} or lower (${fmt(scale.get(h.safeFromPlace)!)} points or fewer)`;
  return { verdict: `${need}${ties}.`, tone: "conditional" };
}

export function buildOutlook(input: NarrativeInput): Outlook {
  const { own, rivals, scale, maxPoints, eventLabel, guaranteesAllowed } = input;
  const nameOf = new Map(rivals.map((r) => [r.athleteId, r.name]));
  const names = (ids: string[]) => nameList(ids.map((id) => nameOf.get(id)!));

  const winTotal = projectTotal(own, maxPoints);
  const clinched = guaranteesAllowed && rivals.length > 0 && isTitleClinched(own, rivals, maxPoints);
  const items: OutlookItem[] = [];

  // Headline
  const position = `You're ${own.tied ? "=" : ""}${ordinal(own.rank)} on ${fmt(own.total)}.`;
  const headline = clinched
    ? `Championship secured on points. Nobody can reach your ${fmt(own.total)}.`
    : winTotal > own.total
      ? `${position} A win takes you to ${fmt(winTotal)}.`
      : `${position} No ${eventLabel} result can add to that.`;

  // Best rank with a win, rivals unchanged
  if (!clinched && rivals.length > 0) {
    const best = bestRankIfRivalsUnchanged(own, rivals, maxPoints);
    if (best.rank < own.rank || (best.rank === own.rank && own.tied && best.tiedWith.length === 0)) {
      const level = best.tiedWith.length ? ` You'd be level with ${names(best.tiedWith)}.` : "";
      items.push({
        kind: "bestRank",
        text: `A win would put you ${best.tiedWith.length ? "=" : ""}${ordinal(best.rank)} if the surfers ahead of you add no points.${level}`,
      });
    } else if (own.rank > 1) {
      items.push({
        kind: "bestRank",
        text: `Even a win can't lift you above ${ordinal(own.rank)}: the surfers ahead are out of reach.`,
      });
    }
  }

  // Conservative floor
  if (guaranteesAllowed && !clinched && rivals.length > 0) {
    const bound = conservativeRankBound(own, rivals, maxPoints);
    if (bound.rank <= rivals.length) {
      items.push({
        kind: "safeBound",
        text: `You're guaranteed a top-${bound.rank} finish on points, counting possible ties. That's a safe floor, not necessarily your exact worst case.`,
      });
    }
  }

  // What improves the total
  const threshold = improvementThreshold(own.replacement, scale, maxPoints);
  let improve: string;
  if (threshold.minPoints === null) improve = `No ${eventLabel} result can add to your total.`;
  else if (own.resultsCounted < own.resultsToCount)
    improve = `Any ${eventLabel} result adds to your total: ${own.resultsCounted} of your best ${own.resultsToCount} count so far.`;
  else if (threshold.worstImprovingPlace !== null)
    improve = `Finishing ${ordinal(threshold.worstImprovingPlace)} or better adds to your total; ${fmt(own.replacement)} points or fewer adds nothing.`;
  else improve = `You need more than ${fmt(own.replacement)} points to add to your total.`;
  items.push({ kind: "improve", text: improve });

  // Who can be passed (rivals strictly ahead; level rivals are covered by the tie)
  if (!clinched) {
    const reach = reachableRivals(own, rivals, maxPoints);
    const ahead = new Set(rivals.filter((r) => r.total > own.total).map((r) => r.athleteId));
    const pass = reach.canPass.filter((id) => ahead.has(id));
    const parts: string[] = [];
    if (pass.length) parts.push(`With a win you can pass ${names(pass)}, depending on their ${eventLabel} result.`);
    if (reach.canTie.length) parts.push(`A win draws you level with ${names(reach.canTie)} if they add no points.`);
    if (reach.unreachable.length && parts.length)
      parts.push(`${reach.unreachable.length === 1 ? "1 surfer" : `${reach.unreachable.length} surfers`} further ahead ${reach.unreachable.length === 1 ? "is" : "are"} out of reach.`);
    if (parts.length) items.push({ kind: "canPass", text: parts.join(" ") });
  }

  // Who can catch the athlete's current total
  if (rivals.length === 0) {
    items.push({ kind: "canCatch", text: "You're the only surfer in this division." });
  } else {
    const t = threateningRivals(own, rivals, maxPoints);
    const parts: string[] = [];
    if (t.canPass.length) parts.push(`${names(t.canPass)} can pass your current ${fmt(own.total)}.`);
    if (t.canTie.length) parts.push(`${names(t.canTie)} can draw level with it.`);
    if (t.canPass.length + t.canTie.length > 1) parts.push("Each can do it with their own result; they can't all win the same event.");
    if (parts.length) items.push({ kind: "canCatch", text: parts.join(" ") });
    else if (guaranteesAllowed && rivals.some((r) => r.total < own.total) && !clinched)
      items.push({ kind: "canCatch", text: `No one below you can reach your current ${fmt(own.total)}.` });
  }

  // Head-to-head with the most relevant rivals
  const scenarios = ownFinishScenarios(own, scale);
  const headToHeadTables = selectRivals(own, rivals, maxPoints).map((id): HeadToHeadTable => {
    const rival = rivals.find((r) => r.athleteId === id)!;
    return {
      rivalId: id,
      rivalName: rival.name,
      rivalTotal: rival.total,
      rows: scenarios.map((s) => ({
        ownFinish: `${ordinal(s.fromPlace)}${s.orLower ? " or lower" : ""}`,
        ownTotal: s.total,
        ...verdict({ total: s.total, place: s.orLower ? null : s.fromPlace }, rival, scale, maxPoints),
      })),
    };
  });

  return { headline, items, headToHead: headToHeadTables };
}
