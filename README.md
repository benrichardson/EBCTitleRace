# EBCTitleRace — project handoff

Working name: **EBCTitleRace** (may change). Build 2026 only; future years can be configured later without building an archive now.

New implementation, new design. Specification and collaboration kit dated 13 October 2026.

Start with `docs/PROJECT_SPEC.md`. Ben Richardson leads technical work; Ben Miller leads design. Both work through branches and PRs that auto-merge when checks pass (see `docs/COLLABORATION.md`).

Included:

- `docs/PROJECT_SPEC.md`: confirmed rules, UX, scenario mathematics, data pipeline, performance targets, architecture, deployment and acceptance criteria.
- `AGENTS.md`: instructions for both people’s coding agents and boundaries preventing accidental overwrites.
- `docs/COLLABORATION.md`: how changes ship (auto-merging PRs) and who leads what.
- `docs/OWNERSHIP.md`: optional note of in-flight work.
- `data/prototype-snapshot.json`: dated source fixture from the prototype, for regression testing only. It contains public ranking names/IDs, not contact details. Do not treat source totals as corrected championship totals.

Do not copy prototype visual design.

Important launch decisions: official tie-break, complete points/shared-place rules, source integration permission, data freshness/completeness, November event details, and club approval of public junior-data presentation.

## Development

Requires Node 24 (see `.nvmrc`) and pnpm 10 (`corepack enable`).

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Local dev server |
| `pnpm test` | Domain and data tests (Vitest) |
| `pnpm typecheck` | TypeScript check |
| `pnpm build` | Production build |
| `pnpm refresh` | Fetch latest results from LiveHeats into `data/snapshot.json` (validated; `--dry-run` to preview) |

CI (`.github/workflows/ci.yml`) runs typecheck, tests and build as separate named jobs, then auto-merges the PR when all pass (unless it's a draft or labelled `hold`). Merges to `main` deploy to https://ebc-title-race.vercel.app via Vercel.

`pnpm check` runs typecheck, tests and build locally. New here? Open the repo in Claude Code and say "help me get set up"; `AGENTS.md` has the walkthrough.

Season rules live in `data/season-2026.json`; they are validated by `src/data/season.ts`.
