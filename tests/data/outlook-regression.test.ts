import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadSeasonConfig } from "@/data/season";
import { normaliseSnapshot } from "@/data/snapshot";
import { buildRankingsPage, buildSurferPage } from "@/data/views";

// Reference: the prototype's page for Simon Johnson (O50) on the 13 Oct 2026 snapshot.
const season = loadSeasonConfig(JSON.parse(readFileSync("data/season-2026.json", "utf8")));
const snap = normaliseSnapshot(JSON.parse(readFileSync("data/prototype-snapshot.json", "utf8")), season);
const O50 = "107730";
const idOf = (name: string) => buildRankingsPage(snap, season, O50)!.rows.find((r) => r.name === name)!.athleteId;

describe("Simon Johnson outlook (matches prototype conclusions)", () => {
  const page = buildSurferPage(snap, season, O50, idOf("Simon Johnson"))!;
  const text = (kind: string) => page.outlook.items.find((i) => i.kind === kind)?.text;

  it("headline gives rank and total with a win", () => {
    expect(page.outlook.headline).toBe("You're =2nd on 4,450. A win takes you to 4,720.");
  });

  it("best rank with a win is 1st, assuming rivals add nothing", () => {
    expect(text("bestRank")).toBe("A win would put you 1st if the surfers ahead of you add no points.");
  });

  it("safe bound is top 3", () => {
    expect(text("safeBound")).toBe(
      "You're guaranteed a top-3 finish on points, counting possible ties. That's a safe floor, not necessarily your exact worst case.",
    );
  });

  it("2nd or better improves; 730 or fewer adds nothing", () => {
    expect(text("improve")).toBe("Finishing 2nd or better adds to your total; 730 points or fewer adds nothing.");
  });

  it("can pass Darren; Colm can catch", () => {
    expect(text("canPass")).toBe("With a win you can pass DARREN CURLEY, depending on their November pool event result.");
    expect(text("canCatch")).toBe("Colm O’leary can pass your current 4,450.");
  });

  it("head-to-head against Darren and Colm", () => {
    const [darren, colm] = page.outlook.headToHead;
    expect(darren!.rivalName).toBe("DARREN CURLEY");
    expect(darren!.rows.map((r) => [r.ownFinish, r.ownTotal, r.verdict])).toEqual([
      ["1st", 4720, "They need 2nd or lower (860 points or fewer)."],
      ["2nd", 4580, "Level at best: a points tie if they finish 3rd or lower or don't score."],
      ["3rd or lower", 4450, "You can't finish ahead of them."],
    ]);
    expect(colm!.rivalName).toBe("Colm O’leary");
    expect(colm!.rows.map((r) => r.verdict)).toEqual([
      "They need 2nd or lower (860 points or fewer).",
      "They need 3rd or lower (730 points or fewer).",
      "Level at best: a points tie if they finish 3rd or lower or don't score.",
    ]);
  });
});
