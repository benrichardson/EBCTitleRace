# AGENTS.md — EBCTitleRace

These instructions apply to all coding agents working in this repository. Human task instructions take precedence. Read `docs/PROJECT_SPEC.md` and `docs/COLLABORATION.md` before starting.

## Owners and boundaries

- **Ben Richardson — technical owner:** `src/domain/`, `src/data/`, `src/app/` route wiring, `data/`, `scripts/`, logic tests, dependencies, GitHub/Vercel setup and releases.
- **Ben Miller — design owner:** `src/ui/`, `public/design/`, design tokens/styles, responsive presentation and `docs/DESIGN.md`.
- **Shared:** screen prop contracts, user-facing behaviour, accessibility, integration tests, documentation, filenames/folder moves and this file.

Paths are the agreed target layout. If the scaffold differs, update the documented ownership together before using new paths. Ownership must not be inferred from whoever last edited a file.

## Before editing

1. Identify which human owns the current task. If context does not say, perform read-only inspection and ask before making ownership-sensitive edits.
2. Read the GitHub issue/PR or supplied work brief. Record the branch, scope and files likely to overlap in the shared work board.
3. Run `git status` and inspect current branch/changes. Never overwrite or revert uncommitted work, whether it appears to be another agent’s, another person’s, or unrelated.
4. Use a dedicated feature branch and separate worktree/checkout per active task. No work directly on `main`, and no two agents sharing one writable branch.
5. Fetch and inspect `origin/main` before work. Do not pull/merge into a dirty tree or hide changes with an unrequested stash.
6. Check `docs/OWNERSHIP.md` for active file reservations. A conflicting reservation means coordinate before editing those paths, not that another branch is safe to overwrite later.

## Editing and integration

- Stay inside the assigned scope. Do not redesign Ben Miller’s UI during technical work or alter scoring/data contracts during design work without a coordinated task.
- Cross-owner changes: propose the contract/change in the shared issue first; let the responsible owner implement it or explicitly agree to your patch. Routine work entirely within assigned scope can continue without repeated permission.
- Business rules belong in pure domain modules. UI consumes typed view models; never reproduce best-N arithmetic inside components.
- Keep shared screen props/export contracts stable. A breaking change needs an explicit coordinated plan and integration PR.
- Do not mass-format, rename, delete, restructure or regenerate files outside the task. Do not alter dependencies/lockfiles for a styling change without the technical owner’s agreement.
- No force-push to `main`; no force-push or reset of another person’s branch. Never use blanket “ours/theirs” conflict resolution.
- On conflicts, inspect both changes and preserve both intents. If resolving would discard or materially reinterpret the other owner’s work, pause that conflict and coordinate; continue unrelated safe work.
- Do not treat the prototype’s CSS/HTML as the new design. Preserve approved product behaviour while building from scratch.

## Correctness requirements

- Count six results in all divisions except Originals (O50), which counts five. Configure by series/division ID.
- Same points scale for November pool event. Never invent unverified allocation slots.
- Distinguish pending, absent and scored zero. Equal totals are unresolved ties until official tie-break rules exist.
- Do not assert “secured”, “guaranteed”, “best possible” or an exact worst-case outcome beyond what validated complete data and feasible scoring prove. Distinguish conservative bounds, unchanged-rival scenarios and simultaneous event feasibility.
- Use fixtures for UI work. Production calculations and narratives must be data-driven, not hard-coded athlete names or totals.
- Main entry defaults to U18 Boys. Surfer details are ordinary same-tab full pages with stable URLs. No modal details or print button.

## Verification and PRs

- Run checks relevant to changes using the repo’s documented commands. Never claim a test/browser check you did not run.
- Domain/data changes: ranking/scenario tests and snapshot validation. UI changes: relevant accessibility/mobile checks and a production build. Integration changes: route/deep-link and scenario checks.
- Do not change domain tests to match faulty output. Explain any intentional rule change and update the spec/fixtures together.
- Open a focused PR with problem/behaviour, ownership touched, tests, preview URL and any limitations. UI PRs include mobile screenshots when practical.
- Request review from the other human. Cross-boundary changes need design and technical sign-off; GitHub CODEOWNERS with two names on a line does not itself require both.
- Do not approve on behalf of either human. Do not merge, send messages to collaborators or deploy outside task authorisation. Once authorised, execute without inventing extra approval gates.
- GitHub/Vercel Git integration is the normal deployment path. Do not run ad hoc production deploys from a laptop/agent branch.
- Update the work-board reservation and handoff notes on completion: changes, commit/PR, remaining work and known issues.

## Security and operations

No secrets in code, logs, PRs or snapshots. Keep ingestion server-side/build-time. Do not expose junior contact details or add extra personal information from another source. Never publish a partial fetch over the last good snapshot. Keep a visible snapshot timestamp and suppress unsupported guarantees when source completeness is uncertain.

## Documentation precedence

Confirmed human requirements → approved project spec/decision log → these instructions → task-specific implementation notes. Conflicting requirements should be surfaced, not silently resolved by deleting another person’s work. Agent instructions guide behaviour; branch protection and code review provide enforcement.
