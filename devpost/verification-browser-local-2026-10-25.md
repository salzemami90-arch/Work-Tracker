# Browser-local application — 25 October 2026

## Scope and boundary

Learner approved the 700px sidebar transition and requested more icons, restoration of Work history, browser-local wording, and an empty working version without preview/sample banners. A separate static application in `site/` implements these requests. It retains the Work Tracker name and original locally drawn icons; no reference application code was copied. Arabic is now formal and not addressed specifically to a woman or man. The project heading follows the final clarification: Your Projects / مشاريعك.

No site has been registered, uploaded, or published. The earlier Flask source, SQLite records, and view-only previews remain preserved. Port 8771 is the empty learner workspace; all destructive replacement testing used fictional data at isolated origin 8772. There is no automatic data migration between origins or from SQLite.

## Implemented

- 24 project icons at creation and through Change project icon.
- Overview, Projects, Achievements, Work history, and Backup & restore.
- Real weekly goal and step achievements, current goals, upcoming/overdue deadlines, and planned steps carried forward until completed or rescheduled.
- Optional project/goal/step deadlines, step planned dates, explicit goal completion/reopening.
- Browser-local IndexedDB writes include state, history, and retry information in one transaction. Stale edits are rejected.
- Versioned JSON export, validated restore preview, confirmation, and a recovery copy stored before replacement.
- No seed records and no visible design-review/no-save banners in the real browser version.

## Verified this session

- 15/15 Node tests passed: 9 browser state/backup tests, 3 planning/date tests, 3 existing progress tests. Generated JavaScript syntax passed.
- Actual UI at 8772: created a project with the Video icon and 29 October deadline; created a goal and step planned for 24 October; completed the step with a dated note; added a separate note after completion; renamed the goal; explicitly completed the goal.
- Overview showed 0 active goals, 1 completed goal this week, 1 completed step this week, and 1 upcoming deadline.
- UI export downloaded a JSON file containing 1 project, 1 goal, 1 step, and 7 history entries. The same file was selected through the file input, reviewed, and restored successfully. A pre-restore recovery copy appeared.
- Malformed backup input was rejected visibly. The existing project and all seven events remained available afterward.
- Stopped and restarted the isolated static server, then reloaded the page. The project, renamed goal, step achievement, post-completion note, seven events, and recovery copy remained visible.
- Arabic language selection persisted across reload. English and Arabic interface text checked in the actual browser after the formal-copy changes.
- Separate origin 8771 opened with no projects, goals, steps, or events and all four overview counts at zero. The 24-icon creation picker was visually inspected.

Evidence screenshots are in ignored local `qa/browser-local-20261025/`. Exported QA backup is in the local Downloads folder. No personal records are committed.

## Still unverified or pending

- Learner acceptance of the new browser-local version and the complete planned workflow.
- Full regression in Safari/Chrome, mobile, blocked-storage/quota failures, and simultaneous cross-tab IndexedDB failures. Pure logic tests are not proof of these browser cases.
- Downloading and restoring a recovery copy separately; its creation and persistence were verified.
- Remaining approved workflow controls such as project pause/resume, step reopening/defer/reorder, and full goal/project note/summary/issue entry UI.
- Final accessibility/responsive regression for every newly added control, final judge acceptance, and any hosted deployment.

This checkpoint does not mark the whole application or build slice complete.

## Progress History correction

Restored the prior context-aware sidebar action at the learner’s request: Progress History / سجل التقدم scrolls and focuses the overview timeline, or the current project’s own timeline without changing its route. The overview retains the six most recent dated records and a View all history option. Achievements remains separate. Verified using Enter on the actual sidebar button at 8771 overview and the populated 8772 QA project; both retained their URLs and focused the intended history section. No records were changed.
