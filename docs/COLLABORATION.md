# Working together remotely

## Day-one setup

Ben Richardson creates the repo and Vercel project, adds Ben Miller with appropriate access, sets `main` as production, installs the Git integration and protects `main`. Both use individual GitHub accounts, distinct local clones, and task branches such as `technical/scenario-engine` and `design/mobile-rankings`.

Agree on the first mobile screen, folder boundaries and typed props before working in parallel. Use the supplied `CODEOWNERS.example` after substituting actual usernames and matching the scaffold. Create `docs/DESIGN.md` for Miller’s visual decisions and `docs/DECISIONS.md` for jointly approved product/technical decisions.

## Shared work board

Use GitHub issues/project as the canonical board, not verbal assumptions across locations. Each active issue records owner, branch/PR, files or directories, expected shared contracts, dependencies and status. Keep a short summary of overlapping work in `docs/OWNERSHIP.md`.

Suggested statuses: Ready → In progress → Ready for review → Merged. A reservation is advisory coordination, not a filesystem lock. Clear reservations when work finishes or is abandoned.

## Handoffs

Miller sends the mobile design, tokens, responsive behaviour and presentational props; Richardson supplies typed fixture/view models and domain APIs. UI screens can ship independently behind fixture data in a preview. Route wrappers connect them in a small integration PR.

Do not edit the same shared screen shell concurrently. One person owns that integration task; the other reviews. For cross-boundary work, agree the exact files first. A README/AGENTS policy cannot automatically prevent Git merge conflicts.

## Pull requests

Every PR includes intent, changed behaviour, test evidence, Vercel preview and owner(s) affected. The other person reviews. For mixed design/logic changes, obtain both roles’ sign-off through the author’s recorded validation and the other human’s approval. GitHub does not let authors approve their own PRs, and a CODEOWNERS line listing both people allows either owner to satisfy its code-owner review.

Use small PRs; squash merge after checks. Refresh against main before merging, and re-review changed parts if another PR lands first. Resolve conflicts deliberately, preserving both owners’ changes. Never force-push another person’s branch.

## Branch rules

Require PRs, one non-author approval, passing uniquely named CI checks, and code-owner review where the repository plan supports it. Disallow force-push/deletion and bypass for normal work. Decide together who can use an emergency bypass and how its follow-up PR is reviewed. Vercel previews are for review; `main` merges are the normal production release.

## Decisions still needed

Actual GitHub usernames and Vercel team/project; chosen scaffold and package manager; tie-break and point-allocation source; snapshot refresh ownership; branding/domain. These documents specify the process but do not create the repo or change account settings.
