# Step notes — learner feedback follow-up

## Scope

The learner could complete Write the outline but could not return to add context. Bring forward the step-note portion of the approved second slice. Step titles open a note form; Notes & updates exposes existing notes and an Add a note action. Both pending and completed steps support this. A note appears under its step and in project history, with separate occurrence and recording dates and optional helper attribution. Existing completion dates and events stay untouched.

No schema migration is required. No step title editing, goal/project note creation, summary/issue saving, deletion, or unrelated layout changes are included. The view-only preview still refuses every save.

## Verified automatically

- Existing runtime, no reinstall: 20/20 Python tests pass.
- JavaScript syntax passes; self-contained preview regenerated.
- Notes before/after completion preserve the exact project, goal, step, and older history records.
- Multiple notes, Arabic/literal text, earlier occurrence date, helper attribution, and new-process persistence tested.
- Duplicate requests do not duplicate notes; stale requests, missing/invalid targets, blank notes, invalid dates, and spoofed parent IDs are rejected without modifying data.
- Simulated write failure rolls back; HTTP note route preserves completion and requires the existing request token.

## Verified in the actual browser

After the learner restarted the existing QA server, the updated backend accepted notes. All writes used browser forms in the agent-created fictional QA project; no notes were added to the learner's own test project.

- Enter on the completed step title opened the note editor and focused its text field.
- An empty note was rejected with a field message.
- Saved an English/Arabic multiline note with literal `<b>` text to a completed step; it appeared under that step and in project history.
- Added a second note in Arabic through Add a note with helper attribution. Both remained visible, each with its own date.
- Added a note to a pending step without completing it.
- Restored English and reloaded the actual page; all three notes returned. Completion remained 25 October 2026 at 19:34; count stayed 1 of 3 completed.
- Read-only database comparison: all project, goal, and step rows and every existing history record are identical to the pre-test snapshot. Only three new notes in the QA project and the two language-switch events were added. Original English setting restored.
- Updated the learner's tab and opened the blank note form for Write the outline; did not enter or save learner content.

Evidence: `qa/step-notes-20261025/before-browser-notes.json`, `after-browser-notes.json`, `arabic.jpg`, and `after-refresh.jpg`.

## Pending

- Actual server stop/start after these new browser-created notes was not repeated; separate-process note persistence is covered by automated tests. Earlier first-slice server restart evidence remains separate.
- Learner retry and local Git checkpoint. No push or publication.

Attempted separate server on 8769 using qa/step-notes-20261025; sandbox rejected socket binding with Operation not permitted. No permission change attempted. Existing user-run server was not stopped by the agent.
