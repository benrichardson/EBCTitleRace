# Decisions

Jointly approved product/technical decisions. Newest last. "Proposed" entries need the other owner's sign-off.

## 2026-10-13 — Technical baseline (Ben Richardson)

Next.js 16 (App Router) + React 19, TypeScript 5.9 (not 7: Next.js tooling still targets the JS compiler API), pnpm 10, Vitest, Node 24 LTS. Hand-written validation for config/snapshots rather than a schema library, to keep dependencies small.

## 2026-10-13 — Discard display for equal low scores (Approved)

When equal scores compete for the last counting slot, the most recently **entered** result (highest LiveHeats result ID) is crossed out, matching LiveHeats. Totals are unaffected. Updated after the first live refresh: LiveHeats crossed out Tom Iverach's (U14 Boys) Dunny Bowl 528 rather than September's, because Dunny Bowl results were entered later; event date is not what LiveHeats uses.

## 2026-10-13 — Points scale handling

`verifiedPoints` must not increase with place (enforced by the config loader). A finish is only named in outlook/head-to-head text when every place up to and including the boundary is verified; currently 15th, 16th and 18th+ are unknown, so boundaries there produce points thresholds only.

## 2026-10-13 — No new-entrant rule (Ben Richardson)

Scenarios compare a surfer only with the surfers already in their division; no hypothetical November newcomer is added. Other completeness checks (unverified results, stale data) are still decided by the narrative layer, not yet built.

## 2026-10-13 — Initial UI drafted on the technical side (Approved)

Ben Richardson will draft the first UI (with an AI design consultant) so there's a working starting point. Ben Miller remains design owner and is free to restyle or replace it.

## 2026-10-13 — Auto-merge on green checks (Ben Richardson)

PRs merge automatically once typecheck, tests and build pass; no human review is required. Draft PRs and PRs labelled `hold` are skipped. Reason: keep shipping effortless for both Bens, especially design work. The domain/data tests are the safety net, so they must not be weakened to get a change through. This replaces the review/CODEOWNERS process in the original kit.

## 2026-10-13 — No scenario calculator (Ben Richardson)

The "Explore every result and build your own scenario" calculator (spec §7) is dropped. The outlook bullets and head-to-head tables cover what visitors need.

## 2026-10-13 — November pool event: two LiveHeats events; entries later (Ben Richardson)

The November pool event (15 Nov 2026, Urbn Surf, Homebush) runs as two LiveHeats events because it uses different banks: 556196 (U12 Boys, U14 Boys, all girls' divisions, Womens, Mens, Masters, Originals; its "Parent Assist" division is not in the series) and 511448 (U16 Boys, U18 Boys). Together they are **one** series event: when results arrive, map both IDs to the single November event and reject any athlete with results in both for the same division.

Entries are closed but the entrant list isn't published, and organisers may still add surfers. Until it is published, every surfer in a division is treated as able to score in November. Later: once a final entrant list is available, use it so non-entrants' totals are final (stronger clinches, fewer rivals in "who can catch you", field size caps possible finishes). Open question for then: whether an entered no-show scores any points.

## 2026-10-13 — Live data, Sydney region and performance budget (Ben Richardson)

- The site now builds from `data/snapshot.json`, written by `pnpm refresh` from LiveHeats' public GraphQL API (read-only, run on demand). `data/prototype-snapshot.json` stays as a test fixture.
- `vercel.json` pins functions to `syd1`; all pages are static and served from Vercel's edge anyway.
- Spec §9's 100/120 KB JS budgets can't be met with Next.js: its React + router runtime alone is ~155 KB gzip (our own code ~10 KB). Accepted, because all content is in the server HTML. Measured instead with Lighthouse (mobile, simulated throttling, local production build): rankings and surfer pages both LCP 2.5 s, CLS 0, TBT 10 ms, performance 98, accessibility 100. Not yet measured on real phones.
