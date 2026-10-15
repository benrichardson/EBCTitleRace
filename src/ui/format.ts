// Display formatting only — no scoring arithmetic belongs here.
const number = new Intl.NumberFormat("en-AU");

export const fmt = (n: number) => number.format(n);

export const rankLabel = (rank: number, tied: boolean) => `${tied ? "=" : ""}${rank}`;

export function ordinal(n: number): string {
  const rem100 = n % 100;
  const suffix = rem100 >= 11 && rem100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number) => WORDS[n] ?? String(n);

/** e.g. "The best six results count in every division except Originals (O50), where the best five count." */
export function countRulesText(divisions: { name: string; resultsToCount: number }[]): string {
  const tally = new Map<number, number>();
  for (const d of divisions) tally.set(d.resultsToCount, (tally.get(d.resultsToCount) ?? 0) + 1);
  const usual = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (usual === undefined) return "";
  const exceptions = divisions.filter((d) => d.resultsToCount !== usual);
  const base = `The best ${word(usual)} results count in every division`;
  if (exceptions.length === 0) return `${base}.`;
  const parts = exceptions.map((d) => `${d.name}, where the best ${word(d.resultsToCount)} count`);
  return `${base} except ${parts.join("; and ")}.`;
}
