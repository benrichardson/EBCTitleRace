# EBCTitleRace — design direction v0.1 ("Heat sheet")

**Status:** first UI, drafted by Ben Richardson with Fable (Claude) as design consultant, then built and reviewed. Ben Miller leads design and is free to restyle or replace any of it. Tokens live in `src/ui/tokens.css`; components use only tokens, so most restyling happens there.

**Built vs this document:** the calculator (§5b, §6 `ScenarioCalculator`) was dropped (DECISIONS.md). The new-entrant line in the sparse-division state was dropped (no new-entrant rule). `--ink-3` became `#61666e` for AA contrast on paper. The display font uses `display: optional` for faster first paint. Wireframe names and numbers are illustrative, not real data.

Original consultation notes follow. Facts used: 12 divisions of 1–32 surfers, 7 completed events + pending November pool, best-6 (O50 best-5), `RankedRow`/`Standing`/outlook contracts in `src/domain/`, longest current name "Rickard Muffinhead Sillan", snapshot 2026-10-12T21:57Z = 13 Oct 2026, 8:57 am AEDT.

## 1. Concept: "Heat sheet"

The visual model is the printed heat sheet pinned to the club tent: ink on paper, big condensed numbers, one highlighter colour marking what still matters. It is a scoreboard, not a dashboard — no cards-in-cards, no gradients, no wave/palm/board iconography. Identity comes from typography (condensed display numerals), a warm paper neutral instead of grey-blue, and a single "flare" orange reserved for the one thing that is still open: the November pool event. Everything else is black-and-white certainty, which matches the product's promise: deterministic maths, no predictions.

## 2. Typography

Two Google families, self-hosted via `next/font/google` (latin subset, `display: swap`, preload display weights only).

| Role | Family | Weights | Est. woff2 |
|---|---|---|---|
| Display: ranks, totals, headings, hero numbers | **Barlow Condensed** | 600, 700 | ~36 KB |
| Text + data: names, bullets, event strip, labels | **IBM Plex Sans** | 400, 600 | ~50 KB |

~86 KB total, leaving room inside the 150 KB above-fold budget with no above-fold imagery. Plex Sans ships `tnum`; set `font-variant-numeric: tabular-nums` on every numeric cell. Verify `tnum` in the Barlow Condensed static file at build time (`fc-query` or Wakamai Fondue); if absent, keep Barlow Condensed for single hero numbers only and render columns of numbers in Plex. Right-align all numeric columns regardless. Never apply `text-transform` to names — source casing is inconsistent ("DARREN CURLEY", "Rickard Muffinhead Sillan") and normalising it is a data decision, not a style.

Type scale (rem; 16px base, line-height in brackets):

```
--text-xs   0.75  (1.2)  Plex 600 uppercase, letter-spacing .06em — labels, event months
--text-sm   0.875 (1.4)  Plex 400 — secondary lines, bullets on mobile
--text-md   1.0   (1.5)  Plex 400/600 — names, body
--text-lg   1.25  (1.3)  Barlow Cond 600 — section headings
--text-xl   1.75  (1.1)  Barlow Cond 700 — totals in rows (mobile), page titles
--text-2xl  2.5   (1.0)  Barlow Cond 700 — hero rank/total
--text-3xl  3.5   (0.95) Barlow Cond 700 — hero rank on desktop
```

## 3. Colour tokens

Primitives feed semantic tokens; components only use semantic tokens. Contrast ratios are against the surface they sit on.

```css
:root {
  /* surfaces */
  --bg: #F4F1EA;          /* paper */
  --surface: #FFFFFF;
  --surface-2: #ECE8DF;   /* row stripe, strip background */
  --line: #D6D1C6;
  --line-strong: #8F8A7E;

  /* ink */
  --ink: #15171A;         /* 16.5:1 on --bg */
  --ink-2: #4A4E55;       /* 7.9:1 */
  --ink-3: #6A6F77;       /* 4.9:1 on --surface — minimum for small text */

  /* brand */
  --accent: #F2542D;      /* flare; graphic use only, 3.4:1 on white */
  --accent-text: #B93A17; /* 5.6:1 on white — use for any accent text */
  --accent-soft: #FDE4DB;

  /* semantic states */
  --counted-fg: var(--ink);
  --discarded-fg: var(--ink-3);          /* + line-through + sr text */
  --discarded-bg: transparent;
  --pending-fg: #7A4F00;                 /* 6.3:1 on --pending-bg */
  --pending-bg: #FFF0CC;
  --pending-line: var(--accent);         /* dashed outline */
  --tie-fg: #3F43A3;                     /* 7.1:1 on --tie-bg */
  --tie-bg: #E6E6FA;
  --ahead-fg: #146C3F;                   /* 6.2:1 on --ahead-bg */
  --ahead-bg: #DCF2E4;
  --behind-fg: #A3261B;                  /* 6.7:1 on --behind-bg */
  --behind-bg: #FBE3E0;
  --clinched-fg: #FFFFFF;
  --clinched-bg: #15171A;                /* filled ink chip: the one definitive state */

  --focus: #1D5CFF;                      /* 2px outline + 2px offset, both modes */
}

@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* dark set */ } }
:root[data-theme="dark"] {
  --bg: #0F1114; --surface: #171A1F; --surface-2: #1F232A;
  --line: #2C313A; --line-strong: #5A616C;
  --ink: #EDEEF0; --ink-2: #B5BAC3; --ink-3: #8E949E;   /* 5.3:1 on --surface */
  --accent: #FF7A52; --accent-text: #FF8E6B; --accent-soft: #3A1E14;
  --pending-fg: #FFD27A; --pending-bg: #33250A;
  --tie-fg: #B3B5F7; --tie-bg: #24264A;
  --ahead-fg: #6FD79B; --ahead-bg: #12301F;
  --behind-fg: #FF8C84; --behind-bg: #3B1613;
  --clinched-fg: #0F1114; --clinched-bg: #EDEEF0;
}
```

Rules: no state is conveyed by colour alone. Discarded = `<s>` + `--discarded-fg` + visually-hidden "discarded"; pending = dashed outline + the word "Pending"; tie = "=" glyph before rank + "Tied" text; ahead/behind = arrow glyph (▲/▼) + words. `--ahead/--behind` appear only inside head-to-head rows and the calculator, never on the rankings list (rank is the signal there). Body background is always explicit; token file is the single place Ben Miller needs to change to retheme.

## 4. Spacing, radius, elevation

```
--space-1 4px  --space-2 8px  --space-3 12px  --space-4 16px  --space-5 20px
--space-6 24px --space-8 32px --space-10 40px --space-12 48px
--gutter 16px (mobile) / 24px (≥768px);  --measure 68ch;  --content-max 1040px
--radius-1 4px (chips, cells)  --radius-2 8px (banners, strip)  --radius-pill 999px
--tap-min 44px (every link, chip, summary, select)
--shadow-1 0 1px 2px rgb(21 23 26 / .08)         sticky header only
--shadow-2 0 4px 16px rgb(21 23 26 / .12)        none in v1 (no popovers/modals)
dark mode: shadows off, use --line borders
--motion-fast 120ms, --motion-base 200ms; @media (prefers-reduced-motion) → 0ms, no transforms
```

Mostly flat: hierarchy comes from the surface step (--bg → --surface) and rules, not drop shadows.

## 5. Screens

### 5a. Rankings page, 375px

```
┌───────────────────────────────────────────┐
│ EBC TITLE RACE            2026 EB-CT      │  wordmark Barlow Cond 700, sticky
├───────────────────────────────────────────┤
│ ◀ U16 Boys [U18 Boys] U12 Girls U14 Gi… ▶ │  chip rail, scroll-snap, active chip
│                                            │  auto-scrolled into view; all links
│ ┌─ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ─┐ │
│ │ ● ONE EVENT TO GO                      │ │  --pending-bg, dashed --accent line
│ │ November pool event · best 6 of 8 count│ │
│ └─ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ─┘ │
│ [🔍 Find a surfer in U18 Boys          ]  │  filters rows client-side; 44px
│ Snapshot 13 Oct 2026, 8:57 am Sydney       │  --text-xs --ink-3, always visible
├───────────────────────────────────────────┤
│  1   Lucas Whitfield            5,140  ▾  │  rank Barlow 700 xl, total Barlow 700 xl
│      Leader · replace 610                 │  secondary --text-sm --ink-2
├───────────────────────────────────────────┤
│ =2   Cam Pyett                  4,610  ▾  │  "=" + tie chip
│      Tied · −530 · replace 610            │
├───────────────────────────────────────────┤
│ =2   Rickard Muffinhead                   │  name wraps to 2 lines, never clips
│      Sillan                     4,610  ▴  │  expanded ↓
│      Tied · −530 · replace 500            │
│   ┌────────┬────────┬────────┬────────┐   │  event strip, 4×2 grid, no h-scroll
│   │ MAR    │ APR    │ MAY    │ JUL    │   │
│   │ 1,000  │  ~~583~~ │ 730  │  860   │   │  struck cell = --discarded-fg + <s>
│   ├────────┼────────┼────────┼────────┤   │
│   │ AUG    │ SEP    │ OCT    │ NOV    │   │
│   │  —     │ 670    │ 500    │Pending │   │  "—" absent; NOV cell dashed accent
│   └────────┴────────┴────────┴────────┘   │
│      Full outlook for Rickard  →          │  link, same tab
├───────────────────────────────────────────┤
│  4   David Martin               4,185  ▾  │
└───────────────────────────────────────────┘
```

Notes: Row = one `<li>` with the name as the only link to the surfer page (whole-row tap would steal the expand toggle); the caret is a `<button aria-expanded>` controlling the strip. Rank, name and total are always visible at 320px: grid `44px 1fr auto 44px`, name `overflow-wrap: anywhere`. Secondary line shows gap to leader as a signed number and "replace N" (hidden when fewer than N results: "4 of 6 results"). Chip rail order: U12→U18 Boys, U12→U18 Girls, Womens, Mens, Masters, Originals; each chip is a real link to `?division=ID` so SSG and back-button restore work. Division counting rule appears in the banner ("best 5 of 8" for O50).

Desktop (≥900px): chips wrap into one visible block (no rail scrolling); rows become a real `<table>` with sticky header: Rank · Name · Mar…Nov (8 numeric columns, struck/pending cells styled the same) · Total · Gap · Replace. Name column `min-width: 14rem`. No expand toggle needed.

### 5b. Surfer page, 375px

```
┌───────────────────────────────────────────┐
│ ← Back to U18 Boys rankings               │  link, 44px, preserves ?division
├───────────────────────────────────────────┤
│ U18 BOYS · 2026 EB-CT                     │  --text-xs
│ Rickard Muffinhead Sillan                 │  Barlow Cond 700 xl, wraps
│                                            │
│  =2nd        4,610                        │  2xl numerals; "=2nd" with [Tied] chip
│  CURRENT     TOTAL (best 6)               │
│ ┌────────────────────┬────────────────────┐│
│ │ 500                │ 5,110              ││  xl numerals
│ │ SCORE TO REPLACE   │ TOTAL WITH A WIN   ││
│ └────────────────────┴────────────────────┘│
│ A win takes Rickard to 5,110 — enough to   │  headline, Plex 600 md, --measure
│ lead if nobody above him improves.         │
├───────────────────────────────────────────┤
│ OUTLOOK                                    │
│ • Any November result above 500 adds to    │
│   the total; 9th place (500) adds nothing. │
│ • Can pass: Cam Pyett (4,610, tied).       │
│ • Cannot be caught by: nobody — 3 rivals   │
│   can still reach 4,610.                   │
│ • Safe bound: finishes no lower than 5th   │
│   whatever happens (not necessarily the    │
│   exact worst case).                       │
├───────────────────────────────────────────┤
│ HEAD TO HEAD                               │
│ vs Cam Pyett  4,610 · replaces 610         │
│ ┌──────┬────────┬───────────────────────┐  │
│ │ You  │ You'd  │ Cam stays behind if   │  │
│ │ 1st  │ 5,110  │ 2nd or lower; =tie 1st│  │
│ │ 2nd  │ 4,970  │ 4th or lower; 3rd tie │  │
│ │ 3rd  │ 4,840  │ 6th or lower; 5th tie │  │
│ │ 4th  │ 4,780  │ 8th or lower          │  │
│ │ 9th+ │ 4,610  │ no gain; stays tied   │  │
│ └──────┴────────┴───────────────────────┘  │
│ vs David Martin  4,185 …                   │
├───────────────────────────────────────────┤
│ ▸ Explore every result and build your own │  <details>; calculator island loads
│   scenario                                 │  on open; rivals default "no points"
├───────────────────────────────────────────┤
│ MAR APR MAY JUL AUG SEP OCT NOV   results  │  same EventStrip component, 4×2
│ Snapshot 13 Oct 2026, 8:57 am Sydney       │
└───────────────────────────────────────────┘
```

Illustrative numbers only; every string is computed. Hero: name, current rank (ordinal, with tie chip), total, then the two-cell stat row (replacement, max). The headline is one sentence chosen from a ranked list of supportable conclusions (clinch → best rank → safe bound). Outlook bullets are capped at ~5, each rendered from a typed `OutlookItem`; the component skips any item the domain does not emit. Head-to-head tables show own 1st–4th plus the first non-improving finish; a rival's row carries "tie" in words. The calculator sits inside `<details>` whose `open` state is in page state, not URL, so selections persist while tapping. Desktop: hero left (rank+total large), stat cells and headline right; head-to-head tables two-up.

### 5c. States

```
Stale data (replaces snapshot line and banner tone; --behind-bg, ! glyph):
│ ! Showing the last complete snapshot from 13 Oct, 8:57 am. │
│   A refresh on 14 Oct failed; results may be out of date.  │
│   Absolute guarantees are hidden until data is complete.   │

Tie (rankings row, rank cell):
│ =2  Colm O'leary   4,450 │   │ =2  Simon Johnson  4,450 │   both carry [Tied] chip; ranks 1, =2, =2, 4

Sparse division (1 surfer, e.g. U16 Girls):
│  1   Maya Lily Johnsen   3,470  ▾ │
│      Only surfer in this division · 5 of 6 results │

Long name at 320px:
│ =2  Rickard Muffinhead │ 4,610 ▴ │   name wraps; total column never shrinks below 5ch
│     Sillan             │         │
```

Empty search: "No one in U18 Boys matches 'xyz'" plus a "Show everyone" button. Fewer than N results: secondary line "4 of 6 results count" and no "replace" figure.

## 6. Component inventory

All components consume typed view models from `src/domain`/`src/data`; no arithmetic in `src/ui`.

| Component | Props (plain terms) |
|---|---|
| `AppShell` | series name, snapshot label (Sydney formatted), stale flag + message |
| `DivisionRail` | list of {id, name, href, isActive}; counting rule for active division |
| `PendingEventBanner` | event label, counting rule text ("best 6 of 8"), tone (`pending` / `stale`) |
| `SurferSearch` | division name, current query, result count; client-side only |
| `RankingList` / `RankingTable` | rows of `RankingRowVM`; which row is expanded (mobile) |
| `RankingRow` | rank, isTied, name, surferHref, total, gapToLeader (signed), replacement or resultsCount/of, events (`EventCellVM[]`), expanded |
| `EventStrip` | 8 `EventCellVM`: {label, status: counted/discarded/absent/pending, points?, place?, srText} |
| `RankBadge` | rank, isTied, ordinal (`=2nd`) |
| `StatusChip` | kind: tie / pending / clinched / ahead / behind; text; glyph |
| `SurferHero` | name, division, rank + isTied, total, countingRule, replacement or resultsCount/of, maxTotal, headline (string + kind: clinched/bestRank/safeBound/none) |
| `OutlookList` | `OutlookItem[]`: {kind, text, assumption?: "rivals unchanged" \| "safe bound"} |
| `HeadToHead` | rival name, rival total, rival replacement, rows: {ownPlace label, ownTotal, rivalSafeFrom place?, tiePlaces[], rivalAlreadyAhead, unverifiedBoundary flag} |
| `ScenarioCalculator` (lazy) | own finish options (verified places only), rivals with {name, total, replacement, selected place?}, result: own total, gain, projected rank, tiedWith[], invalid-duplicate-place warning |
| `BackLink` | division name, href (with query to restore) |
| `SnapshotLine` | timestamp label, snapshot id, rulesVersion |

`EventCellVM.srText` is supplied by the view model ("April, 583 points, discarded") so screen-reader equivalence is tested in one place.

## 7. Microcopy

Tone: plain, present tense, second person on the surfer page ("you"), club-casual but exact. Numbers always with thousands separators. Say what the maths proves and name the assumption in the same sentence. "Secured" and "guaranteed" appear only when `isTitleClinched` or a proven bound returns true and the snapshot is complete; otherwise use "can", "could", "at worst", "if".

1. Banner: **"One event to go — November pool event. Best 6 results count."**
2. Clinch (proven): **"Championship secured on points. Nobody can reach 5,140."**
3. Best rank: **"A win would put you first if the surfers above you add no points."**
4. Safe bound: **"You finish no lower than 5th whatever happens. That is a safe bound, not the exact worst case."**
5. Head-to-head: **"Finish 2nd and you reach 4,970. Cam stays behind with 4th or lower; 3rd makes a points tie."**
6. Tie / no gain: **"Tied on 4,450 — equal totals share the rank until the club confirms a tie-break."** / **"9th or lower (500) adds nothing to your total."**
7. Stale: **"Showing the last complete snapshot from 13 Oct, 8:57 am Sydney. Guarantees are hidden until a full refresh succeeds."**

Avoid: "likely", "should win", "projected to", "locked in", "on track", percentages, and any sentence that lists more than three rivals (summarise: "7 surfers below you can still pass 3,783").
