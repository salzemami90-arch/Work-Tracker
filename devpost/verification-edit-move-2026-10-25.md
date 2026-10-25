# Goal and step editing verification — 25 October 2026

## Change

Added goal/step title editing and moves between different goals in the same project, with optional reasons. Original IDs, status, completion dates, notes, and historical entries are preserved. New history includes old/new names or source/destination goal snapshots. English and Arabic controls share the existing form validation, dirty-cancel, revision, request deduplication, and atomic history safeguards. No schema change, dependency reinstall, project deletion, or publication.

## Automated evidence

- Existing runtime: `runtime-env/bin/python -m unittest discover -s tests -q` — 33 passed, no skips.
- `node --test tests/progress.test.mjs` — 3 passed.
- New storage cases cover completed and pending moves, removed-step rename/move/restore, untouched original entries and dates, notes before/after a move, target append order, Unicode/literal markup titles, durable goal snapshots after later renaming, cross-project/same-goal/missing-target rejection, blank titles, retry deduplication, stale revisions, rollback on history-write failure, and new-process state equality.
- HTTP checks cover all three routes and reject missing request tokens without mutation.

## Actual UI evidence

Used the separate local directory `qa/edit-move-20261025` on port 8769, with fictional fixture setup. All changes listed below were performed through the actual browser forms:

1. Renamed a goal and saved its reason; history displayed both names and reason.
2. Rejected an empty step name. Changed a draft, canceled, chose to remain, and observed the draft intact. Canceled again and confirmed leaving; the original saved name remained.
3. Renamed a completed step; its original completion date and note remained.
4. Opened Move: only the other goal in the same project appeared; a seeded goal in another project was absent. Submission without a target showed a validation message.
5. Moved the completed step and saved a reason. Destination became 1/1, source 0/1, with one unchanged project achievement and the original note/date under the moved step. History displayed source and destination.
6. Switched to Arabic, opened a pending step menu with Enter, renamed it in Arabic and submitted with Enter; it stayed pending. Moved that step via the Arabic form and confirmed destination 1/2 and source 0/0 after reload.
7. Captured the full saved state, terminated the identified QA process, restarted the same directory, and reloaded the browser. Names, relationships, notes, achievement, and history remained. Full before/after state snapshots are identical.
8. Backed up the learner QA database, restarted port 8768 against the same directory, and verified its complete state stayed identical. Opened the learner project without changing its data and displayed the new controls. Screenshot: ignored local `qa/edit-move-20261025/edit-and-move.jpg`.

## Limits and remaining work

Removed-step moves, rollback, invalid cross-project requests, and concurrent stale requests are covered by automated tests rather than repeated browser interactions in this pass. A full keyboard/screen-reader or multi-browser accessibility audit was not performed. The no-alternative-goal explanation and view-only preview were inspected in source; the preview remains save-disabled. Learner acceptance of these new controls and the other approved slices remain open.
