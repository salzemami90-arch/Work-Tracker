---
doc: checklist
status: approved
---

# Work Tracker — Build Checklist

Build mode: the early interface and visual direction were reviewed with the learner. On 25 October 2026, the learner explicitly requested completion and testing of all remaining functions, followed by one final hands-on review, preserving the accepted design. This supersedes intermediate learn-mode stops for the remaining implementation.

Local commits are authorized after verification. Push, upload, publication, and production release remain unauthorized. Personal data, backups, credentials, and the learner profile remain excluded.

## Current Slice Status

All five implementation slices are mechanically complete in the browser-local candidate. These checkboxes record implementation and verification, not final learner acceptance. The historical slice descriptions below retain the original Flask plan; the current browser-local amendment in `spec.md` supersedes its storage and request details. The earlier Flask app remains preserved separately.

- Current candidate: `site/`, served on port 8771 with an empty workspace unless the user adds records. Isolated interface QA uses 8772; storage fault tests use 8773.
- 25/25 Node checks, 33/33 existing Python checks, and 10/10 actual IndexedDB checks in each of Chrome and the in-app browser passed. No dependency installation or permission changes were needed.
- UI checks cover changed plans, contextual records, cancellation, concurrent tabs, backup/recovery, keyboard focus, both languages, and the accepted 700px navigation transition. The isolated server was stopped and restarted; saved records and history returned.
- Evidence and limits: `verification-final-candidate-2026-10-25.md`. User trial: `final-review-guide.md`.
- Final learner exploration, feedback resolution, learning wrap-up, app map, and publication remain open. Safari and a public hosted address have not been tested.

## Slices

- [x] **1. Record a first project and a dated step achievement that survives restarting**
  Becomes usable: Open the local app, create a project, goal, and steps, complete a step, add newly discovered work with an optional reason/helper, and return to the saved project and chronological events after restarting. A next action identifies where to resume.
  Why now: Demonstrates the unique kernel early: the current plan and earlier progress coexist in durable storage. Bootstrapping supports this real workflow rather than becoming a separate infrastructure stage.
  PRD ref: `prd.md > The Core Journey`, `Projects and Goals`, `Flexible Steps`, `Progress History`, `Local Data and Backup`, `States and Boundaries`
  Spec ref: `spec.md > Local Application and Request Handling`, `Project, Goal, and Step Operations`, `History, Summaries, Issues, and Notes`, `Local Persistence and Backups`, `UI Shell and Forms`, `Data Model`, `Local Request Contracts`, `Look and Feel`, `Where It Runs and How Someone Tries It`
  Build: Set up the project-local Python environment and locked Flask dependencies; create the launcher, SQLite schema, transactional service, same-origin local routes, and calm laptop interface. Implement initial Overview/Project Details navigation, empty states, project/goal/step creation, step completion, next action, and immutable creation/completion events. Include optional reason/helper metadata, request deduplication, revision checks, safe text rendering, draft preservation, and translation keys from the first forms. Start with an empty user database; use isolated fictional QA data. Add setup/run guidance to README.
  Verify (mechanical): Run `runtime-env/bin/python -m unittest discover -s tests -v` for relationships, atomic change-plus-event writes, nonduplicate completion retries, and stale revision rejection. Start on loopback using an isolated QA path; use the browser to create and complete work, add another step, and observe the earlier achievement. Stop the actual process, restart against the same QA path, and verify IDs, next action, steps, and events persist. Check unsafe-looking user text renders literally and private files are not served.
  Learner check: Open the local link, make a fictional project with a goal and two steps, finish one, and add a newly discovered step. Inspect the dated achievement and next action, then restart with guidance and confirm the work returns. Describe whether the project/goal/step layout feels clear.
  Commit: `Add persistent projects and dated step progress` — local commit only after authorization, verification, and the applicable learner checkpoint.

- [x] **2. Adapt the plan and retain summaries, issues, and personal notes**
  Becomes usable: Edit and reorder work, move a step to another goal in the same project, remove/restore it without losing notes/history, defer or reopen it, and complete a goal without ending the project. Save multiple summaries, earlier-dated issues, and independent notes; return to the latest summary and full history.
  Why now: Expands the proven saved workflow into the changing plans and scattered context the tracker exists to handle. Early layout feedback from slice one can inform these forms.
  PRD ref: `prd.md > Projects and Goals`, `Flexible Steps`, `Progress History`, `Project Notes`, `States and Boundaries`, `Flexible Planning Rules`
  Spec ref: `spec.md > Project, Goal, and Step Operations`, `History, Summaries, Issues, and Notes`, `UI Shell and Forms`, `Data Model`, `Local Request Contracts`
  Build: Add entity editing, Move up/Move down, same-project goal selection for step moves, deferral, rescheduling, completion/reopening, and the warning before completing a goal with unfinished steps. Preserve context snapshots in history. Add contextual summary/issue/note disclosures and forms at goal and step level, with optional helper and work-occurrence dates, latest-summary selection, separate general My Notes, and manual-entry edits with before/after events. Keep system events immutable. Add archived_at through a versioned migration, archive/restore events, and a recoverable Removed steps area; preserve status/dates/notes/achievements and exclude archived steps from current-work counts. Include interface translations for the added controls.
  Verify (mechanical): Extend and run the Python tests for same-ID moves, forbidden cross-project moves, date-preserving history, deferred planned-date clearing with retained deadline, goal completion without child completion, and reopening without erasing events. Verify multiple summaries, older occurrence dates, note independence, manual-edit audit records, and goal/step-specific notes in both local disclosures and project history. Verify removal/restoration retains original status/dates/notes/achievement counts and never creates a completion. In the browser, move a remaining step to a later goal, finish the first goal, add summaries from different helpers plus an independent note, and confirm all survive a process restart.
  Learner check: Add unexpected work with a reason, move it to a later goal, and read the chronological explanation. Paste two short summaries, add a personal opinion in My Notes, then locate the latest summary and the older records without using an assistant integration.
  Commit: `Add flexible plans and durable project context` — local commit only within the granted authorization.

- [x] **3. Choose work from Today and This Week without losing unfinished items**
  Becomes usable: Overview shows active goals, next actions, planned work, carried-over steps, approaching/overdue deadlines, and separate step/goal achievements. Paused projects leave active work views while preserving their visible context and labeled deadlines.
  Why now: The dashboard now summarizes actual saved work and history instead of placeholder numbers. Date rules can be verified against completed, moved, deferred, and reopened items.
  PRD ref: `prd.md > Overview and Achievements`, `Flexible Planning Rules`, `Screens and Layout`, `Projects and Goals`
  Spec ref: `spec.md > Overview, Dates, and Achievements`, `Project, Goal, and Step Operations`, `Look and Feel`, `UI Shell and Forms`
  Build: Implement optional planned dates and project/goal/step deadlines in all appropriate forms, Today/This Week grouping, Sunday–Saturday weeks, seven-day Upcoming and separate Overdue views, and distinct achievement counts from events. Retain original carried-over dates, refresh date views on focus/day changes, and implement project pause/reason/resume with the accepted filters. Preserve completed work and show reopened status. Provide Add Goal from Overview with project selection and meaningful empty states. No artificial project completion percentage.
  Verify (mechanical): Run `node --test tests/planning.test.mjs` with controlled dates covering midnight, Saturday/Sunday, earlier-week backlog, undated work, deferred work, deadline boundaries, and repeat completions. Run Python workflow tests for pause/resume without child mutation. Verify in the browser that pausing removes active work but retains labeled deadlines/history, and resuming restores original-date visibility. Confirm achievement periods use event occurrence time in the device time zone.
  Learner check: Plan a fictional step for yesterday and see it under Carried over. Defer or reschedule it, inspect the separate deadline, then pause and resume its project. Check whether the overview makes today's possible work and this week's achievements easy to find.
  Commit: `Add carry-over planning and paused project views` — local commit only within the granted authorization.

- [x] **4. Export all work and restore it with a recoverable safety copy**
  Becomes usable: Download a complete backup, preview a selected backup, explicitly confirm full replacement, and recover the previous state from the automatically created safety copy.
  Why now: All record types and settings exist, so recovery can be tested against a complete project history rather than a partial format.
  PRD ref: `prd.md > Local Data and Backup`, `States and Boundaries`
  Spec ref: `spec.md > Local Persistence and Backups`, `Local Request Contracts`, `Data Model`, `Important Failure Modes`, `Verification Plan`
  Build: Add consistent UTF-8 JSON export; strict schema/version/ID/relationship/date validation; restore preview counts and date; digest/revision confirmation; and exclusive, flushed pre-restore JSON safety copies. Apply replacement atomically, preserve increasing revisions, and handle duplicate requests safely. Add translated backup UI, explicit replacement wording, and README recovery instructions. Do not add reset/delete actions or automatic backup deletion.
  Verify (mechanical): Run backup tests for a complete round trip into another isolated database, identical IDs/text/relationships/events/settings, a valid file larger than 10 MiB, malformed/version/reference failures, stale confirmation, and failed safety-copy writes. Verify injected replacement failure rolls back. Restore a safety copy in QA and restart the process. Exercise the preview/confirmation/download workflow in the browser using fictional data only; canceled preview changes nothing.
  Learner check: Export a fictional project, review the backup preview, and use a separate practice database to restore it with guidance. Confirm the preview explains replacement and that notes, summaries, dates, and achievements return. Locate the recovery copy.
  Commit: `Add validated backups and recoverable restore` — local commit only within the granted authorization.

- [x] **5. Complete the bilingual laptop experience and verify the whole journey**
  Becomes usable: Use the complete workflow in English or Arabic with persisted language, readable mixed-language content, keyboard access, useful error states, and offline operation after setup.
  Why now: Integrates the previous usable behaviors and catches language/layout interactions across every finished form before the learner's final exploration.
  PRD ref: `prd.md > The Core Journey`, `Look and Feel`, `What We're Building`, `States and Boundaries`, `Product Decisions`
  Spec ref: `spec.md > Look and Feel`, `UI Shell and Forms`, `External Services and Dependencies`, `Important Failure Modes`, `Verification Plan`, `Where It Runs and How Someone Tries It`
  Build: Audit and complete all translation keys, English/Arabic layout direction, logical spacing, mixed-text isolation, labels/focus, field errors, unsaved-form warnings, saved-state feedback, and narrower laptop layouts. Verify language survives restart and backup. Finish reproducible setup/use/recovery documentation and fictional demo instructions. Keep judge-facing plans and README in English. Record limitations accurately; do not introduce cloud, AI, phone, or deployment features.
  Verify (mechanical): Run the complete Python and JavaScript suites after integration. Inspect the core journey in both languages at a laptop width and a narrower window; test keyboard navigation, safe literal text, save failures, and two-tab conflicts without losing drafts. Verify runtime needs no remote assets or external services and works offline after setup. Repeat process persistence and backup checks only where integration changes could affect them. Confirm ignored private/runtime/QA paths and report actual evidence.
  Learner check: Start the app with guidance and explore your own fictional workflow in both languages, including an awkward input and a changed plan. Identify anything broken, confusing, or uncomfortable before final review is closed.
  Commit: `Complete bilingual workflow and integrated verification` — local commit only within the granted authorization.

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1; inspect the real saved project/goal/step workflow and influence the remaining interface.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 5; learner starts and explores the complete app. The learner requested the remaining implementation and verification before this final exploration.

## Final Review

- [ ] Learner retry: compact Project options menu; Add goal remains visible.

- [x] Learner retry: compact Goal options menu, keeping Add step visible; clearer goal-order labels.

- [ ] Learner retry: Achievements project selector (All projects or one project), applied to both Completed work and Goal progress; preserve the approved layout.

- [ ] Final review complete — feedback resolved and learner explicitly confirms ready to ship. Add agreed refinements below as unchecked items; each needs verification and learner retry. This does not authorize publication.

## Code Tour and App Map

- [ ] Learning activity complete — follow Save from a visible form through the local request handler to the transaction and history event, using 2–3 actual code locations from the finished app.
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse. Judge-facing content is English.

Activity and evidence: Not started. Connect the walkthrough to verified persistence and returning to saved work.
Route and stops: Select actual paths and symbols from the finished code; do not claim a tour of planned files.
Edit outcome: Not offered yet; a safe edit is optional.
Reflection: Not offered yet; any personal answer belongs only in the ignored learner profile.
Activity mode: To be recorded when performed.

## Revisions

- Added a clearly labeled view-only visual preview for the requested early interface review — the restricted environment blocked Git initialization and Flask installation. This preview uses the actual UI modules with fictional fixtures and does not replace the persistence or commit requirements. Slice 1 remains unchecked.
- API event records expose parsed `details` while SQLite retains `details_json` — keeps rendering straightforward without changing history semantics. Internal retry fingerprints are omitted from the UI state.

- Updated the first visual preview to calm blue and exposed goal/step Notes & updates — requested learner feedback. The user chooses the number of goals; each goal owns its steps. Contextual notes stay independent from completion.
- Added recoverable step removal/restoration to slice 2 after explicit learner agreement. Preserve the step and all history/notes/achievements; hide it from current work and keep a restore route. This adds one archival field, versioned migration, and corresponding behavior checks. No destructive deletion was authorized or performed.

- Learner reported that adding a project/step in the preview did not work. Confirmed it is still a view-only page, not a failed saved record. Retried Flask installation and local Git initialization; both remain blocked. Added `start-local.sh` for first-time dependency setup and launch with explicit failure handling and the real app URL (8766). Shell syntax checked; installation, HTTP checks, and live saves remain pending. No storage/architecture change or later-slice implementation.

- New visual direction requested: use the learner's MySpace reference for colors, typography, sidebar, cards, spacing, and page arrangement only. Preserve all agreed behavior and the Work Tracker identity; do not copy old source code. Show the revised preview before continuing. The supplied local reference at http://127.0.0.1:4317 returned an empty response in both Chrome and a connection check; reference screenshots or an available page are needed before selecting its visual details. No visual changes were made from guesses.

- Port 4318 reference was successfully inspected visually. Applied original navy-sidebar, gray-canvas, white-card, muted-green styling, breadcrumbs, project shortcuts, and a clearer no-save notice inside preview forms. Kept Work Tracker identity, existing metric meanings, all form operations, goal/step context, and approved future requirements. Reference project data and code were not imported. Updated visual-only PRD/spec sections. JavaScript syntax checks passed; browser visual review covers Overview, project details, forms, notes, and language direction. Await learner visual feedback before proceeding; previous runtime/Git gates still apply.

- Learner approved the latest visual preview on 25 October 2026. Recorded visual acceptance without marking the saved-work checkpoint or slice complete. Rechecked the project runtime: Flask is still unavailable. No further feature implementation or Git writes were performed.

- Fixed the skip link without changing routes, layout, requirements, or preview persistence. Keyboard verification in English and Arabic retained the project URL and focused main; subsequent Tab entered project content. Retested dirty-form cancellation: dismissing the confirmation retained the draft; accepting closed without saving, restored trigger focus, and reopening showed the original value. No cancellation code change was needed. See `verification-2026-10-25.md` for verified facts and pending live checks.

- Actual UI saving and reload verified on learner-started port 8768: one fictional project, one goal, three steps (one completed), saved Next action, and seven history entries. New work preserved the earlier achievement. Actual-app dirty-form cancellation and keyboard skip also passed. Read-only QA database snapshots before/after refresh are identical (revision 7). Server stop/start verification and local commit remain pending; see `verification-2026-10-25.md`.

- Learner stopped the QA server. A browser reload of the saved project URL returned `ERR_CONNECTION_REFUSED`, verifying shutdown. Awaiting restart on port 8768 against the same QA directory; no data was reset and the slice remains incomplete.

- Actual server restart verified: after confirmed shutdown, the learner restarted port 8768 using the same isolated QA directory. The same saved project, active goal, three steps, dated achievement, bilingual Next action, and seven history entries returned in the browser. All five tables matched `before-restart.json` exactly (revision 7). Saved `after-restart.json`, screenshot, and accessibility evidence; see `verification-2026-10-25.md`. The learner hands-on checkpoint and local commit remain open, so slice 1 stays unchecked.

- Learner hands-on feedback: created a project/goal/step, completed Write the outline, and could not return to add a note. Brought forward only step notes from slice 2: clickable step titles and Notes & updates remain available after completion, with dated entries in step context and project history. No completion/status/date changes, title editing, goal/project notes, removal, or broader slice-2 controls were added. 20 automated tests pass, including retry, invalid input, rollback, and separate-process persistence. Browser verification awaits the learner restarting the existing QA server; the restricted environment rejected binding a separate test port. Both slice checkboxes remain open.

- Step-notes browser verification passed after learner restart: keyboard-opened completed-step note form, blank validation, two dated notes on a completed step, one on a pending step, English/Arabic interface, and page reload. Read-only snapshots prove all prior steps/completion dates/history and learner project content unchanged. Learner tab refreshed and blank Write the outline note form opened for retry. No further feature expansion; local commit and learner acceptance still pending. See `verification-step-notes-2026-10-25.md`.

- Learner explicitly requested enabling recoverable step removal, clickable Active Goals with current-step rings and total counts, and selectable project icons. Brought forward those focused portions of slices 2/3; eight original local SVG icon choices are persisted per project. Preserve archived-step notes/achievements, current-plan counts, goal state, responsive sidebar, and non-saving preview. No broader dashboard/date, deletion, or summary features inferred. 28 Python and 3 JavaScript checks pass; browser verification covers removal/restore, ring changes, icon selection and reload. Full slice checkboxes remain open.

- Latest controls passed actual isolated server restart and browser checks. Learner server 8768 was restarted by the agent after precise process identification and consistent QA backup; v1→v2 comparison preserved every existing field/record/revision. Learner Overview refreshed and all-goals view opened (3 goals, including one without steps). See `verification-plan-controls-2026-10-25.md`. Await learner retry of removal/restoration, goal drilldown, and icon selection before closing their review.

- 25 October 2026: At the learner’s explicit request, implemented goal/step title editing and same-project step moves as a focused slice-2 refinement. Moves preserve identity, status, dates, notes, and original events; new history records source/destination goal snapshots. The UI and restart checks passed on isolated data; learner review of these new controls remains open.

- 25 October 2026: Learner requested MySpace-style dashboard hierarchy, outline icon shapes and a header/tab mark, responsive top navigation, and a dedicated Achievements page replacing the Active Goals popup. A separate view-only design review is saved in `dashboard-preview.html`; see `dashboard-design-review.md`. Live app and data remain unchanged pending visual review. The learner also requested a future judge-accessible Site, with explicit approval required before publishing. Hosted/browser-local storage and functional backup/restore are not implemented or approved as completed.

- 25 October 2026: Corrected the dashboard design preview after learner feedback: retain the side navigation until 700px, matching the rendered reference, with 232/205/195px sidebar widths. The prior 950px transition was too early. This changes only the review; live application and saved data remain unchanged.

- 25 October 2026: Following approval of the revised dashboard, added a separate unseeded browser-local version in `site/` for local review before publication. Includes 24 project icon choices, Work history and Achievements navigation, actual dashboard/date/goal-completion controls, and backup/restore with a pre-restore recovery copy. Arabic copy was changed to formal language; final learner clarification retains “Your Projects” / “مشاريعك”. Existing Flask data and view-only previews remain preserved. See `verification-browser-local-2026-10-25.md`; broader slice checkboxes and publication gate stay open.

- Restored the learner-requested Progress History name and prior in-page, project-aware navigation. Keyboard verification passed on overview and project history without leaving either page.

- 25 October 2026: Completed the remaining browser-local workflow: entity descriptions/reordering, pause/resume, step deferral/reopening, contextual summaries/issues/notes and audited edits, carried-over weekly planning, and integrated recovery checks. Replaced native dirty-form confirmation with an accessible in-app confirmation and fixed stale restore/focus/file-selection races. Preserved the approved visual system and Progress History. Mechanical slices are checked; final learner acceptance is still open.

- 25 October 2026: Added the requested Achievements project selector for both Completed work and Goal progress. Defaults to All projects and retains the selection across the two views and language changes during the page session. Actual browser checks on isolated port 8772 verified a populated project, an empty second project, switching back to all, and Arabic labels. Syntax and whitespace checks passed; learner retry remains open.

- 25 October 2026: Moved goal rename, dates, completion/reopening, details, and ordering into a compact Goal options disclosure; Add step stays visible. Goal order labels now explicitly refer to earlier/later placement in the goal list. Verified Arabic/English visibility, opening dates and order dialogs, Add step, Escape dismissal, and focus restoration on isolated QA. No data/status behavior changed. User has an open New step form, so its tab was left intact; a separate review tab shows the updated layout. Learner retry remains open.

- 25 October 2026: Learner accepted compact goal controls and requested the same treatment for projects. Grouped edit, dates, pause/resume, and ordering under Project options while keeping Add goal visible. Verified dates dialog, cancel/focus return, Escape, and real goal/step creation plus reload. At explicit learner request, populated the existing browser workspace with planned goals/steps and a Next action; these user records remain in browser storage and are excluded from source control. Final project-menu retry remains open.
