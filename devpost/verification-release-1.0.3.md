# Work Tracker 1.0.3 verification — 26 October 2026

## Result

PASS for the tested application and storage flows. Approved layout retained; no personal workspace included in deployment.

## Fixes

- Default completion and note timestamps preserve seconds and milliseconds, preventing newly recorded achievements from appearing before earlier changes in the same minute. Explicit user dates remain supported.
- Step option menus now close with Escape and return keyboard focus to their trigger, consistently with project and goal menus.
- An unreadable browser workspace now offers explicit backup recovery. Replacement atomically retains the exact raw record as a downloadable evidence copy. Concurrent changes, invalid backups, and failed writes cannot silently replace data.
- Versioned module URLs prevent a cached old storage module from being mixed with the new interface during an update.
- The next-action editor shows a neutral explanation even when an action already exists.

## Automated verification

- Node application tests: 32 passed, 0 failed.
- Real Chromium IndexedDB integration harness: 14 passed, 0 failed. Covers transactions, request deduplication, stale-tab conflicts, simulated quota/write failures, backup round-trip, exact recovery copies, corrupt-data recovery races, rollback and unavailable storage.
- Legacy Python/SQLite tests: 33 passed, 0 failed. These verify the retained local implementation, not hosted-browser persistence.

## Browser verification

Isolated localhost origins and fictional QA data were used.

- Backup file selection, content preview, cancel before replacement, restore, automatic safety copy, invalid-file rejection, and successful corrupt-workspace recovery through the interface.
- Rename a goal and a completed step; move that step to another goal; add a dated note after completion; remove from plan, restore, reopen and complete again. Original achievement and both notes retained.
- Exported final state confirms 1 project, 2 goals, 3 steps, 22 events and second-precision completion times.
- Next-action cancellation: Continue editing retains the draft; Discard changes retains the previously saved action.
- Skip to content focuses main without changing the project route. Escape closes step options and returns focus.
- Yesterday's unfinished work remains carried over in Today. Pausing hides planned work while keeping marked deadlines and history; resuming restores work.
- Achievements project selection and goal-progress controls; English/Arabic RTL; saved language survives reload.
- Reload and closing/reopening the tab preserve modified goals, steps, notes, achievement history and next action.
- Responsive iframe measurements: widths 375 and 700 use top navigation; 701 and 1000 use side navigation; no horizontal overflow at any tested width.
- Fresh candidate tab reports no browser console errors.

## Limits

This is not a guarantee of zero defects. Firefox, physical mobile devices, screen-reader speech output and a full browser-process restart were not tested in this pass. Browser storage remains specific to the browser and website address; exports are the supported device-transfer/recovery mechanism. Simulated storage failures test transaction behavior, not physical disk damage. Raw recovery exports are evidence files, not normal importable backups.

Chrome's automation upload helper required an unenabled file-URL permission; file selection was completed through the ordinary macOS picker without changing permissions. A stale cached module was found during local iteration and fixed by versioned module URLs.
