# EBCTitleRace — project handoff

Working name: **EBCTitleRace** (may change). Build 2026 only; future years can be configured later without building an archive now.

New implementation, new design. Specification and collaboration kit dated 13 October 2026.

Start with `docs/PROJECT_SPEC.md`. Copy `AGENTS.md` to the repository root and keep the docs in `docs/`. Ben Richardson creates the GitHub/Vercel project; Ben Miller owns design. Both work through separate branches and reviewed PRs.

Included:

- `docs/PROJECT_SPEC.md`: confirmed rules, UX, scenario mathematics, data pipeline, performance targets, architecture, deployment and acceptance criteria.
- `AGENTS.md`: instructions for both people’s coding agents and boundaries preventing accidental overwrites.
- `docs/COLLABORATION.md`: remote workflow, ownership, reviews and GitHub safeguards.
- `docs/OWNERSHIP.md`: active-task/file-reservation template.
- `.github/CODEOWNERS.example`: inactive template; replace usernames before enabling.
- `data/prototype-snapshot.json`: dated source fixture from the prototype, for regression testing only. It contains public ranking names/IDs, not contact details. Do not treat source totals as corrected championship totals.

No app scaffold, repository, Vercel account settings or deployments are created by this documentation kit. Do not copy prototype visual design. Actual install/build/test commands should be added once the technical scaffold is chosen.

Important launch decisions: official tie-break, complete points/shared-place rules, source integration permission, data freshness/completeness, November event details, and club approval of public junior-data presentation.
