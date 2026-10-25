# Recoverable steps, goal progress, and project icons

Date: 25 October 2026. Implements the learner's explicitly requested additions. MySpace on port 4318 was inspected visually for icon style only; no reference source or data was copied.

## Delivered behavior

- Step options offer Remove from plan, an optional reason, and confirmation. Removed steps remain in their goal's Removed steps section with notes, original status/date, and Restore to plan. No project deletion or permanent step deletion.
- Active Goals opens all goal totals and each goal's current-step progress ring, remaining count, project, and status. Empty goals do not show false completion. A full ring does not change goal status. Selecting a goal opens its project and focuses the goal.
- Eight original local SVG icons are selectable at project creation or by pressing the project's icon. Choice is stored and used in cards, project headers, and sidebar links. Existing responsive layout rules remain unchanged.
- Versioned additive v1→v2 migration preserves original records; new fields are archived_at and icon. View-only preview continues rejecting saves.

## Verification

- Existing runtime: 28/28 Python tests and 3/3 JavaScript progress tests pass. No dependency install.
- JavaScript syntax checks pass; preview regenerated.
- Real browser at isolated port 8769: created fictional QA flexible plan with Chart icon, goal and two steps. Completed Finished draft and saved a note via UI.
- Keyboard-opened Active Goals: 1 of 2, one remaining, ring stroke 50/100. Empty state separately inspected.
- Removed the pending step with a reason: 1 of 1, zero remaining, full ring 100/100; goal stayed active. Restored it and count returned to 1 of 2.
- Removed the completed step: current count 0 of 1 while historical achievement stayed 1. Removed steps retained completion time and note. Reloaded and restored; no duplicate completion event.
- Changed icon Chart→Award; reloaded and reopened picker, Award remained selected. Arabic picker and goal view visually inspected. Mixed-language titles retained.
- Stopped/restarted the actual isolated server. Browser retrieved the saved goal view; entire before/after state snapshots equal, including chosen icon, note, restored steps and one completion event.
- Saved consistent backup of the learner QA database before migration. Restarted only its identified server at 8768, retaining the exact QA directory. Compared every old field in projects/goals/steps/entries and revision: unchanged; only schema version and additive fields differ.
- Refreshed the learner tab and opened Active Goals: 3 total, 3 active, two 1/3 rings and a no-steps goal. No learner project was removed, edited, or seeded by this verification.

Evidence under qa/plan-controls-20261025/: screenshots goals-half.jpg, goals-full.jpg, removed-step.jpg, icon-picker.jpg, icon-picker-ar.jpg, learner-goals.jpg; before/after-restart.json; before/after-v2-migration.json; before-v2-migration.sqlite3.

## Remaining scope

Learner review of these new controls remains open. Full goal completion/reopening, moving/reordering, general title edits, broader summary/issue editing, Today/This Week deadlines, backup UI and full bilingual integration remain separate planned work. No complete slice or release is claimed. No push, deployment or publication.
