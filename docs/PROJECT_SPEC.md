# EBCTitleRace — project specification

Version 1.0 · 13 October 2026 · Authors/owners: Ben Richardson (technical), Ben Miller (design)

## 1. Purpose and boundaries

Working project name: **EBCTitleRace**; it may change. Build only the 2026 competition now. Keep the name, season, series ID, division IDs and counting limits in straightforward configuration so they can be updated in future years. No season picker, historical archive, multi-club platform or elaborate rollover system is required. Future years can be handled in a later change.


Build a new, mobile-first EBC championship rankings website from scratch. Keep the prototype’s useful calculations and interactions; do not inherit its visual design or single-file implementation. Most visitors will arrive from a shared link on a phone.

Answer three questions quickly: Where am I now? What can my last result change? What do I need from my rivals?

This is a deterministic championship scenario tool, not a probability forecast. “Could finish second” is a mathematical possibility under stated conditions, not a predicted result.

Reference prototype: https://ebc-live-rankings.benricho.chatgpt.site
Source series: https://liveheats.com/ebc/rankings?series=61709&division=107730
Source series name: **2026 EB-CT**. Remaining event: **November pool event**. Exact date is not yet supplied. The pool uses the same points scale as the other series events, confirmed by Ben Richardson.

V1 includes all divisions, event-by-event results, counted/discarded scores, individual pages, short personal outlooks and head-to-head scenarios. No sign-in, payments, print button, modal detail views, probabilistic predictions, notifications, or new competition-management system.

## 2. Confirmed division configuration

Use IDs as identity; display names can change. Store counting rules in validated, season-specific configuration, not conditional logic spread through components.

| Division | LiveHeats division ID | Results to count |
|---|---|---:|
| Originals (O50) | 107730 | **5** |
| Masters (O35) | 107729 | 6 |
| MENS | 107728 | 6 |
| U18 Girls | 92929 | 6 |
| U16 Girls | 92928 | 6 |
| U14 Girls | 92927 | 6 |
| U12 Girls | 92926 | 6 |
| U18 Boys | 92925 | 6 |
| U16 Boys | 92924 | 6 |
| U14 Boys | 92923 | 6 |
| U12 Boys | 92922 | 6 |
| WOMENS | 6289 | 6 |

**Default entry division: U18 Boys.** An explicit division URL and returning from a surfer’s page take precedence. Do not silently override the first-load default using another remembered division.

## 3. Events and point scale

The prototype snapshot includes these events, in chronological order:

| Event | LiveHeats event ID | Display label |
|---|---|---|
| EB-CT : March 2026 | 482248 | March |
| EB-CT : April 26 | 496829 | April |
| EB-CT : May 2026 | 509534 | May |
| EB-CT : July 2026 | 530027 | July |
| 2026 Dunny Bowl + ABB Kings/Queens of the Beach | 518312 | August / Dunny Bowl |
| EB-CT : Sept 2026 | 555041 | September |
| EB-CT : Oct 2026 | 560816 | October |
| November pool event | Not yet verified | November / Pool — pending |

Include the Dunny Bowl because its results are in this series. Do not invent June or other absent events. An absent athlete result is not proof that a division’s results have been finalised. Confirm division-level completeness, especially when someone has no October result.

Verified finish-point pairs observed in the prototype’s source data:

| Place | Points | Place | Points | Place | Points |
|---:|---:|---:|---:|---:|---:|
| 1 | 1,000 | 6 | 583 | 11 | 475 |
| 2 | 860 | 7 | 555 | 12 | 462 |
| 3 | 730 | 8 | 528 | 13 | 450 |
| 4 | 670 | 9 | 500 | 14 | 438 |
| 5 | 610 | 10 | 488 | 17 | 400 |

15th, 16th, positions beyond 17th, shared event places, disqualifications and no-show scoring need the official allocation. Do not interpolate them or copy a WSL scale. “No result” means zero additional scenario points; retain its status separately from an actual scored zero. A scored non-attendance award must follow the official rule.

## 4. Rankings mathematics

For an athlete’s eligible, finalised event points `scores` and division counting limit `N`:

- Sort by descending points; retain the highest `min(N, scores.length)`.
- `total = sum(retained scores)`.
- `replacement = lowest retained score` when at least N results exist; otherwise 0.
- For one future event awarding `p` points: `projectedTotal = total + max(0, p - replacement)`.
- `gain = projectedTotal - total`.
- A November result equal to the replacement score adds nothing.
- Maximum total uses 1,000 November points.

Cross out only existing discarded results. A missing result is shown as “—”; the upcoming pool event is “Pending”, never a scored zero. A surfer with fewer than N results retains all recorded results. When equally low scores compete for the final counting slot, use chronological event order then stable result ID to select the discarded display score. This does not resolve a championship tie.

Until the official championship tie-break is confirmed, equal totals share competition ranks (1, 2, 2, 4). An alphabetical/stable-ID ordering may make rows deterministic but must not imply one tied surfer leads another. Clearly show tied totals and unresolved final outcomes.

Source LiveHeats totals must not be copied as championship totals: at prototype retrieval, LiveHeats was configured to count seven, while the confirmed club rules are six or five. Recompute locally from eligible individual results. Warn if source configuration changes; club-approved configuration governs this product until reviewed.

## 5. Rankings page

Recommended URL: `/2026/rankings?division=92925` (route shape can change before implementation).

Show division navigation, a surfer search, current provisional rank, name, best-N total, gap to leader, event results with discards crossed out, and score to replace. Surface “One event to go — November pool event” and the snapshot timestamp in Sydney time.

A surfer’s name is a standard link to their full individual page in the **same tab**. No modal or new window. Browser Back and a visible “Back to [division] rankings” link work. Preserve division and ideally search/scroll state on return. Deep links load directly and can be shared.

Do not require lateral scrolling to discover the main rank/name/total or to open a surfer’s page. Ben Miller owns the final mobile design: an expandable result strip or responsive cards can replace the desktop table. If detailed tables scroll sideways, keep names and key totals identifiable and make the overflow discoverable. No print control.

## 6. Individual page and short outlook

Recommended URL: `/2026/divisions/[divisionId]/surfers/[athleteId]`. Athlete IDs are stable; names need not be unique.

Put the short outlook first. Show current rank, current counting total, replaceable score, total with a win, and the strongest supportable rank conclusion. Use brief bullets and a few compact head-to-head examples, similar to the supplied friend’s report but recalculated from the active snapshot.

### Required conclusions

1. **Clinched title:** only state “Championship secured on points” if the athlete’s current total strictly exceeds every rival’s maximum possible total. Equality is a possible tie, not a clinch.
2. **Best rank:** a win against rivals’ unchanged totals gives `1 + count(rival current total > own maximum)`. Flag any equal total. Label the unchanged-rival assumption; do not imply that all rivals can necessarily score zero or avoid improving under a fixed event draw.
3. **Guaranteed top-X:** conservative bound is `1 + count(rival maximum >= own current total)`, including potential ties. Explain that it is a safe bound, not necessarily the exact worst achievable position. Never claim a tight worst-case finish unless an actual feasible finish-allocation solver proves it.
4. **Improvement threshold:** lowest confirmed November points that exceed the replacement score, translated into a finish only when the complete relevant points mapping is known.
5. **Who can be passed:** rivals with current totals below own maximum. Separate rivals equal to maximum (possible points tie) from those above it (unreachable).
6. **Who can catch the athlete:** rivals currently level/below whose maxima reach or exceed the athlete’s current total. Distinguish reaching a tie from passing outright. This compares rivals to the athlete’s existing total, not their hypothetical winning total.
7. **Conditional position security:** where useful, explain the athlete finish that protects a position irrespective of the remaining feasible rival finishes, without permitting two unique event winners.

Skip empty/unhelpful bullets. A one-surfer division is valid. Avoid lists of every unreachable surfer overwhelming a low-ranked athlete; summarise, with optional detail. Relevant rival selection should include the nearest attainable ranks above, nearest threatening rivals below, and the title leader if the title is reachable.

### Head-to-head calculation

For own projected total `T` and rival current total `R` with replacement `q`:

- Rival projected total is `R + max(0, p - q)`.
- If `R > T`, own selected result cannot get ahead even if the rival adds nothing.
- If `R = T`, rival adding nothing leaves a tie; any positive gain puts the rival ahead.
- If `R < T`, own athlete stays strictly ahead when `p < q + T - R`.
- For integer points, maximum safe rival points are `q + T - R - 1`.
- Evaluate supported event finishes directly to identify safe finishes and ties; do not turn an arithmetic threshold into an invented finish.

Example copy: “If you finish second, you reach 4,xxx. Cam must finish fourth or lower for you to stay ahead; third produces a points tie.” Only emit that wording when computed and feasible.

Show own first–fourth scenarios plus the first non-improving finish where helpful. Group identical outcomes, e.g. “Fifth or lower”, only when all members of that group produce the same own total. Grouped rows must not exclude a rival finish merely because it shares the group’s starting label: the athlete could finish another place within the group.

## 7. Advanced calculator

> **Dropped (decision 2026-10-13).** Not part of V1; kept below for reference only.

Keep beneath an expandable “Explore every result and build your own scenario” section. Changing a selection must preserve expansion, focus, scroll and previously chosen rival results.

Select an own finish and optional rival finishes; show own projected total, gain, projected rank and ties, and rival totals. Default rival assumptions are explicitly “no additional points”, not a predicted result. Preserve or reset on navigation using a documented policy; V1 can keep local page state only.

Disallow two selections for a unique finishing slot, or mark the scenario invalid and withhold definitive final-rank claims. Real shared finishing places must use the official event rules; duplicate numerical places are not automatically invalid when the official draw awards shared positions. Partial scenarios remain conditional because unassigned rivals are assumed not to gain.

No full heat-draw simulation or probability model is required for V1. Do not describe independent rival maxima as a simultaneously achievable final field.

## 8. Data pipeline and trust

### Source access

Use an authorised LiveHeats integration or approved public access path. The prototype used read-only GraphQL at `https://liveheats.com/api/graphql`, discovering:

- `series(id)` → `rankingsDivisions { id name }`.
- `rankings(divisionId)` → athlete ID/name, source place/points.
- `athleteRankingResults(divisionId, athleteId)` → result ID/place/points, event-division and event ID/name/date, source counting settings.

This is an observed public web-app interface, not a promised stable API contract. Confirm permission/support with LiveHeats before depending on it. The prototype could fetch server-side but direct browser cross-origin refresh was not established. Keep ingestion server-side or in a build/data-refresh job; never require every visitor to query the source.

### V1 recommendation: validated snapshots

Ben Richardson maintains a refresh command that fetches all required results, validates them, produces one versioned normalised snapshot, and opens/updates a data PR. Review and merge to deploy via GitHub. Retain the last valid snapshot if a fetch fails; do not publish partial results or zeros. This provides a fast, reproducible V1 without claiming automatic live scoring.

Store source series/division/event/result IDs, source and fetched timestamps, completeness/eligibility states, club rules version, schema version and snapshot ID. Label all pages with the same snapshot ID/timestamp. Hydrated client projections must use the same snapshot as server-rendered content.

A genuinely live November update cadence is a separate launch decision. If required, design a controlled server refresh with durable last-good snapshots, source limits and cache invalidation. Scheduled data work should not silently bypass protected GitHub branches. Specify whether only completed events count or provisional results may be included, and gate “secured” claims accordingly.

### Validation

Reject duplicate result identities, invalid numbers, unknown division counting rules and inconsistent event identities. Do not silently merge similarly named people. Verify series membership and mapped divisions; do not count the same event twice unless rules expressly allow it. Detect source-total differences and explain the known seven-vs-six/five discrepancy instead of treating all differences as corrupt data.

Unknown/missing data must remain unknown. Show a stale-data banner on refresh failure. Guarantees require verified eligible results, complete current standings and known points maxima. If completeness is uncertain, suppress absolute clinch/guarantee wording.

## 9. Technical architecture and performance

**Proposed baseline:** Next.js with TypeScript on Vercel, statically generated rankings/athlete pages, and a small client island for the calculator. Confirm this with Ben Richardson at setup; the requirement is fast pre-rendered output, not a specific framework. Do not build a client-only SPA that fetches all club data before showing rankings.

Suggested separation:

- `src/domain/`: pure scoring, ranking, scenario and narrative functions.
- `src/data/`: validated models, source adapter and snapshot reader.
- `src/ui/`: presentational screens/components, design tokens and responsive styles.
- `src/app/`: thin routes, page composition, metadata and error/not-found handling.
- `data/`: snapshots and club/season configuration.
- `scripts/`: ingestion and validation commands.
- `tests/`: domain tests, contract fixtures and route/browser checks.
- `docs/`: this spec, design guidance, decisions, ownership and runbook.

Calculate server/build-time by default. Deliver only the selected division/surfer data needed for interactive features, not the entire raw GraphQL response. A visitor’s ranking page must not make a synchronous LiveHeats request. Use ordinary links and pre-rendered first content; defer the advanced calculator bundle until opened where practical. Reserve layout space, optimise any imagery, and avoid heavy animation/font dependencies.

### Acceptance targets

Measure on 360–430px mobile widths, Safari/iPhone and Android Chrome, plus desktop. Proposed initial budgets: rankings first-load route JS <=100 KB gzip; athlete page initial JS <=120 KB gzip excluding a lazily loaded advanced calculator; compressed above-fold fonts/images <=150 KB. Treat budgets as project targets, not measured prototype results.

Aim for Core Web Vitals p75 LCP <=2.5 s, INP <=200 ms, CLS <=0.1 once enough field traffic exists. Before release, use repeatable mobile-throttled lab runs with a documented device/network profile. Do not claim field performance from one Lighthouse score.

Accessible names, keyboard navigation, visible focus, 44px primary tap targets, sufficient contrast, reduced-motion support, and screen-reader equivalents for struck-out scores. Do not rely on hover or colour alone. Main content must not overflow at 320px. Long names, ties and sparse divisions must fit.

## 10. GitHub → Vercel delivery

Ben Richardson creates the GitHub repository, imports it into the correct Vercel team/project, adds Ben Miller, sets environment scopes, and enables the Git integration. Do not create a second independent production deployment pipeline.

- `main` is production. Feature/design branches get public Vercel previews.
- All changes go through PRs, including snapshots. CI runs type checks, domain/data tests and a production build; when all pass, the PR auto-merges (squash) unless it is a draft or labelled `hold`. Merge to `main` deploys production through the Vercel Git integration. There is no required human review (decision 2026-10-13); the tests are the safety net. A successful preview is not a replacement for the correctness checks.
- Use unique named CI jobs. Pin runtime/package-manager versions and commit the lockfile. Setup/build/test commands are in the README.
- Preview and production secrets stay scoped in Vercel/GitHub settings, never source files. No frontend source tokens. Supply `.env.example` with names only if secrets become necessary.
- Record release commit, data snapshot and rules version. Roll back to a known-good deployment when needed and reconcile `main` through a follow-up revert/fix PR; hosting and repository must not remain divergent.

Official references:
- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/git
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

## 11. Collaboration and design handoff

Ben Richardson owns technical architecture, scoring rules implementation, ingestion, tests, repository/Vercel configuration and releases. Ben Miller owns the visual system, mobile layouts, typography, interaction presentation and design assets.

These are responsibilities, not permission to change each other’s work silently. Either person can propose cross-boundary changes. Coordinate the interface and ownership in a GitHub issue before parallel implementation. Keep branches separate, changes small, and business logic out of UI files. `AGENTS.md` applies to both people’s coding agents.

Before parallel work starts, Ben Richardson scaffolds routes/domain contracts and fixture data; Ben Miller supplies design direction and first mobile layouts. Agree on the typed screen props and component exports. UI development uses fixtures without requiring source API availability. Rename/move shared files only through coordinated PRs. See `AGENTS.md` and the collaboration guide for the actual working rules.

## 12. Correctness and acceptance checks

Required meaningful tests:

1. Every division’s counting limit: 6 except O50’s 5.
2. Fewer/exactly/more than N results; equal low scores; zero, missing and pending states.
3. Gains below/equal/above replacement; full recomputation equals projection for every candidate outcome.
4. Championship tie versus outright overtake; competition ranks and deterministic display order.
5. Strict clinch inequality: a rival whose maximum equals own total prevents a clinch.
6. Conservative top-X bound, unreachable rivals, and sparse/single-athlete divisions.
7. Head-to-head thresholds, unique winners and grouped “or lower” rows.
8. Unsupported point slots do not produce invented placements.
9. No partial/invalid fetch replaces a valid snapshot; stale-state behaviour.
10. U18 Boys first-load default; explicit URLs override; full-page same-tab athlete navigation/back/deep link.
11. Snapshot consistency between rendered rankings and interactive scenarios.
12. Mobile layouts, long names, tap/focus behaviour, expanded calculator state and duplicate-place warnings.

Useful regression fixture: the prototype snapshot dated 13 October 2026 Sydney time. It is a test fixture, not perpetually current data. Derived checks:

- Masters Glenn Pringle: 5,140; replacement 610; win total 5,530. Strictly ahead of rivals’ maximum totals in that snapshot.
- Masters David Martin: 4,610; replacement 610; win total 5,000.
- Masters Cam Pyett: 4,520; replacement 610; win total 4,910.
- Masters Ben Richardson: 3,783; replacement 475; win total 4,308.
- Masters Rickard Muffinhead Sillan: 4,185; replacement 500; win total 4,685.
- O50 Darren Curley: best five 4,580.
- O50 Colm O’leary and Simon Johnson: best five 4,450 each, unresolved points tie.

The supplied friend’s LLM report is a narrative-style reference only; its totals and guarantees must never become constants in application code.

## 13. Decisions before public launch

| Decision | Owner | Default until resolved |
|---|---|---|
| Official championship tie-break and how it affects scenarios | Ben Richardson / club | Show unresolved ties; no equal-total clinch |
| Complete point allocation, tied places, no-shows/DQs | Ben Richardson / club | Only verified mapping; no inferred finishes |
| November date, event ID and result status | Ben Richardson / club | Display “November pool event — pending” |
| Current event/division completeness and new entrant eligibility | Ben Richardson / club | Suppress unsupported absolute guarantees |
| Approved LiveHeats integration and refresh cadence | Ben Richardson | Reviewed snapshots; no auto-live promise |
| Brand/name/domain and first design direction | Ben Miller + Ben Richardson | New design; no inherited prototype styling |
| GitHub usernames, team/project and branch rules | Ben Richardson | Templates remain unconfigured |
| Public sharing/privacy, particularly junior names/photos | Both / club | Match authorised source scope; no extra personal data/photos |
| Ownership of launch acceptance and result corrections | Both | Technical sign-off by Richardson; visual sign-off by Miller |

## 14. Delivery sequence

1. Create repo/Vercel Git integration and protect main. Add project docs, AGENTS, ownership, issues and fixture contract.
2. Confirm scoring/eligibility rules; build pure domain engine and tests. Independently explore the mobile design with fixtures.
3. Implement new rankings and athlete pages; integrate the simple outlook and head-to-head tables.
4. Add advanced calculator, validated ingestion and stale-state handling.
5. Review previews on real phones; verify correctness, performance and accessibility; resolve launch decisions.
6. Merge the release PR and share the production domain. Establish the event-day refresh/correction runbook.
