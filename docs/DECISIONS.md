# Decisions

Jointly approved product/technical decisions. Newest last. "Proposed" entries need the other owner's sign-off.

## 2026-10-13 — Technical baseline (Ben Richardson)

Next.js 16 (App Router) + React 19, TypeScript 5.9 (not 7: Next.js tooling still targets the JS compiler API), pnpm 10, Vitest, Node 24 LTS. Hand-written validation for config/snapshots rather than a schema library, to keep dependencies small.

## 2026-10-13 — Discard display for equal low scores (Approved)

When equal scores compete for the last counting slot, the earlier event counts and the later one is shown as discarded (then lower result ID). Totals are unaffected; this only decides which cell is crossed out. Matches LiveHeats, which crosses out the most recent result.

## 2026-10-13 — Points scale handling

`verifiedPoints` must not increase with place (enforced by the config loader). A finish is only named in outlook/head-to-head text when every place up to and including the boundary is verified; currently 15th, 16th and 18th+ are unknown, so boundaries there produce points thresholds only.

## 2026-10-13 — No new-entrant rule (Ben Richardson)

Scenarios compare a surfer only with the surfers already in their division; no hypothetical November newcomer is added. Other completeness checks (unverified results, stale data) are still decided by the narrative layer, not yet built.

## 2026-10-13 — Initial UI drafted on the technical side (Approved)

Ben Richardson will draft the first UI (with an AI design consultant) so there's a working starting point. Ben Miller remains design owner and is free to restyle or replace it.

## 2026-10-13 — Auto-merge on green checks (Ben Richardson)

PRs merge automatically once typecheck, tests and build pass; no human review is required. Draft PRs and PRs labelled `hold` are skipped. Reason: keep shipping effortless for both Bens, especially design work. The domain/data tests are the safety net, so they must not be weakened to get a change through. This replaces the review/CODEOWNERS process in the original kit.
