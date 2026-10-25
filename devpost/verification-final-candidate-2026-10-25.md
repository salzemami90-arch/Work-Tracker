# Work Tracker — Final Review Candidate Verification

Date: 25 October 2026. Status: implementation verified locally; learner acceptance and publication pending.

## Candidate and isolation

The candidate is the generated `site/` application, served on loopback port 8771. It stores records in IndexedDB per browser and origin. No fixtures were inserted into the learner workspace. Interactive testing used fictional records on port 8772; transaction fault tests used a dedicated harness on port 8773. Earlier Flask data, previews, and downloaded recovery files were preserved. No dependency installation, permission change, push, upload, or publication occurred.

## Completed functionality

- Project, goal, and step editing, including descriptions and sibling ordering.
- Project pause/reason/resume; paused work excluded from active planning, with labeled deadlines retained.
- Step deferral/resume/reopening; rescheduling deferred work resumes it. Completion history remains after reopening, moving, or recoverable removal.
- Goal completion with an unfinished-step warning; reopening retains the dated achievement and does not change child steps.
- Notes, summaries, and issues attached to projects, goals, or steps. Optional helper names and occurrence dates; independent notes require neither a goal nor an assistant. Latest summary and separate project notes are visible.
- Manual-entry edits create immutable before/after events. Text-only edits preserve precise original occurrence timestamps.
- Today and This Week retain earlier unfinished plans; deadlines remain independent. Sunday–Saturday boundaries and the seven-day upcoming window are explicit.
- Existing icon choices, Achievements, context-aware Progress History, and the accepted visual system are retained.

## Automated results

| Check | Result |
| --- | --- |
| Browser store/core tests | 15/15 passed |
| Browser workflow/backup integration tests | 3/3 passed |
| Planning tests | 4/4 passed, also under America/Los_Angeles |
| Progress tests | 3/3 passed |
| Existing Flask/Python regression suite | 33/33 passed, no skips |
| Actual IndexedDB harness, in-app browser | 10/10 passed |
| Actual IndexedDB harness, Chrome | 10/10 passed |

The harness verifies real browser transactions: create/read, retry deduplication after newer revisions, conflicting request IDs, stale revisions, simulated quota failure after a queued workspace write, consistent export, failed safety-copy writes, failed replacement after a queued safety copy, successful replacement and exact recovery-copy restoration, and unavailable storage without resetting existing records. Fault injection is confined to the isolated harness.

Node integration checks include a UTF-8 backup larger than 10 MiB, invalid dates/timestamps, and combined pause/defer/reopen/move/archive/restore behavior. Syntax and whitespace checks passed. These automated results are separate from the interface evidence below.

## Actual interface checks

- Reopened a completed step: original achievement and note remained. Deferred it, then planned it for yesterday: it resumed and retained its separate deadline.
- Paused and resumed its project: Today/This Week changed correctly, while paused deadlines and all history remained.
- Added older/newer summaries from two fictional helpers, a goal summary, a step issue, and an independent project note. The latest summary and context filters were correct. Unsafe-looking text rendered literally.
- Edited a note and verified before/after history; reordered goals and steps; moved a step with its notes, issue, dates, and achievement intact.
- Completed a goal with unfinished steps after the warning, then reopened it; child steps stayed unfinished and the dated goal achievement remained.
- Replaced the unreliable native dirty-form confirmation with an in-app confirmation. Continue editing retained the draft; Discard changes restored saved content when reopened.
- Used two actual tabs: a stale save was rejected without losing the draft. Loading the latest state and retrying retained the other tab's next action.
- Downloaded a full backup, restored an older recovery copy through the UI, then restored the full backup. Notes, summaries, steps, order, and history returned; recovery copies were listed.
- Created and reloaded an independent project note in Chrome with no goals or assistant.
- Verified keyboard Skip to content retained the project route and focused its main content. Progress History retained current-page context.
- Reviewed English/LTR and formal Arabic/RTL; inspected the approved sidebar at 701px and top navigation at 700px. New records remain below goals rather than changing the approved hierarchy.
- Stopped and restarted the isolated port-8772 server, then reloaded the existing project. Titles, descriptions, next action, reordered/moved steps, contextual records, language, and dated history returned. AX evidence is retained in ignored `qa/final-candidate-20261025/after-server-restart.txt`.

## Limits and open gates

- Final learner exploration and feedback resolution are still required; this report is not acceptance or permission to publish.
- Safari, phone-specific layouts, a public hosted address, and a fresh machine installation were not tested. Laptop Chrome and the in-app browser were exercised.
- The app has no account, sync, automatic assistant import, or automatic migration from earlier SQLite data. Browser/site-address changes require export and restore.
- Browser data clearing can remove both the workspace and browser-held recovery copies. Downloaded backups are the independent copies. A cold-start offline installation is not promised; assets require the local server to be available.
- Learning wrap-up/app map remain after the hands-on review. Any future release requires the separately approved permanent source snapshot, manifest, and external preservation/publication steps.
