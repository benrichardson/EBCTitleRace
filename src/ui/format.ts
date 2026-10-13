// Display formatting only — no scoring arithmetic belongs here.
const number = new Intl.NumberFormat("en-AU");

export const fmt = (n: number) => number.format(n);

export const rankLabel = (rank: number, tied: boolean) => `${tied ? "=" : ""}${rank}`;

export function ordinal(n: number): string {
  const rem100 = n % 100;
  const suffix = rem100 >= 11 && rem100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}
