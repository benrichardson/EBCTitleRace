# Working together remotely

## Setup (done)

- GitHub: private repo `benrichardson/EBCTitleRace`. Ben Richardson adds Ben Miller as a collaborator.
- Vercel: project `ebc-title-race`, connected to the repo. `main` deploys to production at https://ebc-title-race.vercel.app. Every PR also gets a public preview link (the Vercel bot comments it on the PR). The project is fine being public.
- Tooling: Node 24, pnpm. `pnpm check` runs typecheck, tests and build. See the README.

Ben Miller's coding agent (Claude) reads `AGENTS.md` (via `CLAUDE.md`) and walks him through setup and shipping. He doesn't need to know git.

## How changes ship

1. Work on a branch: `design/...` or `technical/...`.
2. Open a PR. CI runs typecheck, tests and the production build.
3. When all checks pass, the `Auto-merge` job squash-merges the PR and deletes the branch. Vercel deploys `main` to production.
4. To stop a PR going live, open it as a draft or add the `hold` label.

There's no review requirement: we trust each other and the tests. Look at each other's merged PRs when convenient, and raise anything odd in a follow-up PR or a chat.

## Who leads what

Ben Richardson leads scoring, data, tests and infrastructure. Ben Miller leads visual design. Either can change anything; PRs that touch the other person's area say so in their summary. Product decisions go in `docs/DECISIONS.md`; visual decisions in `docs/DESIGN.md`.

## Avoiding collisions

Keep PRs small and short-lived, since auto-merge means `main` moves quickly. Start each change from a fresh `main`. If you're about to do a big restructure of shared screens, give the other Ben a heads-up first. Resolve conflicts by keeping both people's intent; never force-push another person's branch.

## Decisions still needed

Tie-break and point-allocation source; snapshot refresh ownership; branding/domain.
