# Decisions

Jointly approved product/technical decisions. Newest last. "Proposed" entries need the other owner's sign-off.

## 2026-10-13 — Technical baseline (Ben Richardson)

Next.js 16 (App Router) + React 19, TypeScript 5.9 (not 7: Next.js tooling still targets the JS compiler API), pnpm 10, Vitest, Node 24 LTS. Hand-written validation for config/snapshots rather than a schema library, to keep dependencies small.

## 2026-10-13 — Discard display for equal low scores (Proposed)

When equal scores compete for the last counting slot, the earlier event counts and the later one is shown as discarded (then lower result ID). Totals are unaffected; this only decides which cell is crossed out.

## 2026-10-13 — Points scale handling

`verifiedPoints` must not increase with place (enforced by the config loader). A finish is only named in outlook/head-to-head text when every place up to and including the boundary is verified; currently 15th, 16th and 18th+ are unknown, so boundaries there produce points thresholds only.

## 2026-10-13 — Guarantee gating lives above the maths (Proposed)

`src/domain/outlook.ts` reasons only over the rivals it is passed. Whether a result can be worded as a guarantee (complete data, possible new entrants in November, unverified results) is decided by the narrative layer, which is not built yet. Note that a new entrant could score up to 1,000 points, which matters for sparse junior divisions.

## 2026-10-13 — Initial UI drafted on the technical side (Proposed)

Ben Richardson will draft the first UI (with an AI design consultant) so there's a working starting point. Ben Miller remains design owner and is free to restyle or replace it.
