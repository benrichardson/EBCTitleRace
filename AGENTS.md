# AGENTS.md — EBCTitleRace

These instructions apply to all coding agents working in this repository. Human task instructions take precedence. Skim `docs/PROJECT_SPEC.md` for product rules before changing behaviour.

## The easy path (start here)

Two people work on this: **Ben Richardson** (technical) and **Ben Miller** (design). Either may be new to git. Your job is to make shipping a change feel effortless: they describe what they want, you do the git/GitHub work, and you tell them in plain language when it's live. Don't ask them to run commands you can run yourself, and don't lecture them about git.

**Shipping model:** every change goes through a pull request. When the PR's checks pass (typecheck, tests, production build), the `Auto-merge` CI job squash-merges it automatically, and Vercel deploys `main` to production at **https://ebc-title-race.vercel.app** about a minute later. There is no human review step. The checks are the safety net, so never weaken them to get a change through.

### First-time setup (do this for them if the repo isn't on their machine)

1. Check the tools, installing anything missing with Homebrew (`brew install git gh node pnpm` or `corepack enable` for pnpm). Node must be 24+.
2. Check `gh auth status`. If not logged in, ask them to type `! gh auth login` in the prompt and follow the browser steps (choose GitHub.com, HTTPS, log in with a browser).
3. Clone and install: `gh repo clone benrichardson/EBCTitleRace && cd EBCTitleRace && pnpm install`.
4. Start the site with `pnpm dev` (in the background) and give them the local URL it prints. It's usually http://localhost:3000, but Next.js moves to the next free port if that one is taken, so always read the actual URL from the output. Changes appear there instantly as you edit.

### Every change

1. **Start fresh:** `git checkout main && git pull`, then create a branch named for the work: `design/<short-topic>` for visual work, `technical/<short-topic>` otherwise. Never commit directly to `main`.
2. **Make the change.** Keep `pnpm dev` running so they can see it locally (at the URL it printed). For UI work, check it at phone width (375px) as well as desktop.
3. **Verify:** run `pnpm check` (typecheck + tests + build). Fix failures before pushing.
4. **Ship:** commit with a clear message, `git push -u origin HEAD`, then `gh pr create --fill` (add a short plain-English summary to the body).
5. **Watch it land:** Vercel comments a public preview link on the PR within a minute or two; share it if they want a look before it merges. Then `gh pr checks --watch`. When it merges, tell them it's live at https://ebc-title-race.vercel.app (allow a minute for Vercel). If a check fails, read the log (`gh run view --log-failed`), fix it on the same branch and push again; the PR re-runs and merges itself when green.
6. **Not ready to go live yet?** Open the PR as a draft (`gh pr create --draft --fill`) or add the `hold` label. Mark it ready (`gh pr ready`) or remove the label when they're happy.

### Updating results

To pull the latest results from LiveHeats: on a fresh branch (`technical/refresh-<date>`), run `pnpm refresh`. It validates everything and only writes `data/snapshot.json` if the whole fetch is good, then prints whose rank or total changed. Ship it like any other change. If it fails, the existing snapshot is untouched; report the error. When November results appear, the refresh will refuse them until the November event is marked `"completed"` in `data/season-2026.json`, which needs Ben Richardson to confirm results are final.

### When things get awkward

- **Merge conflict** (someone else changed the same lines): `git pull origin main` on the branch, then resolve by keeping both people's intent. If you can't do that without throwing away the other person's work, stop and explain the conflict to your human in plain terms so they can check with the other Ben.
- **A scoring/domain test fails after a design change:** you've almost certainly broken something real. Don't edit `tests/domain/` or `tests/data/` to make it pass. Undo the cause, or if the human really does intend a rule change, tell them it needs Ben Richardson's agreement.
- **Uncommitted changes you didn't make:** leave them alone and ask.

## Areas of lead

- **Ben Richardson leads:** scoring and scenario logic (`src/domain/`), data and ingestion (`src/data/`, `data/`, `scripts/`), tests, dependencies, GitHub/Vercel setup.
- **Ben Miller leads:** visual design (`src/ui/`, `public/design/`, design tokens/styles, `docs/DESIGN.md`).

These are areas of lead, not locks. Either Ben can change anything. When a PR changes the other person's area, say so in the PR summary so they notice.

## Editing rules

- Business rules belong in pure domain modules. UI consumes typed view models; never reproduce best-N arithmetic inside components.
- Keep shared screen props/exports stable where you can; if a change breaks them, update every caller in the same PR so `main` always builds.
- Don't mass-format, rename, delete or restructure files outside the task. Avoid adding dependencies for styling; if one is genuinely needed, mention it in the PR.
- No force-push to `main`; no force-push or reset of another person's branch. Never use blanket "ours/theirs" conflict resolution.
- Do not treat the prototype's CSS/HTML as the new design. Preserve approved product behaviour while building from scratch.

## Correctness requirements

- Count six results in all divisions except Originals (O50), which counts five. Configure by series/division ID.
- Same points scale for November pool event. Never invent unverified allocation slots.
- Distinguish pending, absent and scored zero. Equal totals are unresolved ties until official tie-break rules exist.
- Do not assert "secured", "guaranteed", "best possible" or an exact worst-case outcome beyond what validated complete data and feasible scoring prove. Distinguish conservative bounds, unchanged-rival scenarios and simultaneous event feasibility.
- Use fixtures for UI work. Production calculations and narratives must be data-driven, not hard-coded athlete names or totals.
- Main entry defaults to U18 Boys. Surfer details are ordinary same-tab full pages with stable URLs. No modal details or print button.

## Verification

- `pnpm check` before every push. Never claim a test or browser check you did not run.
- Domain/data changes: ranking/scenario tests and snapshot validation. UI changes: check phone width, keyboard focus and contrast, and that the production build passes.
- Do not change domain tests to match faulty output. An intentional rule change updates the spec, fixtures and tests together and needs Ben Richardson's agreement.
- Deploy only through merging to `main` (Vercel Git integration). No ad hoc production deploys from a laptop or agent.

## Security and operations

No secrets in code, logs, PRs or snapshots. Keep ingestion server-side/build-time. Do not expose junior contact details or add extra personal information from another source. Never publish a partial fetch over the last good snapshot. Keep a visible snapshot timestamp and suppress unsupported guarantees when source completeness is uncertain.

## Documentation precedence

Confirmed human requirements → approved project spec/decision log (`docs/DECISIONS.md`) → these instructions → task-specific notes. Surface conflicting requirements rather than silently resolving them by deleting someone's work.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
