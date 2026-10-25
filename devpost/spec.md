---
doc: spec
status: approved
---

# Work Tracker — Technical Specification

Working title. An implementation blueprint for the approved `prd.md`, including the later decisions to start on a laptop, operate locally in a browser, retain data in a local file, provide backup and restore, and offer an English-first interface with Arabic support. This specification is approved. Slice 1 implementation has started. All 33 current storage/service/HTTP checks passed in the existing runtime; actual browser saves and page-refresh persistence passed; actual server stop/start persistence also passed on the isolated QA data. See Build Progress Note.

## Current Browser-Local Amendment — 25 October 2026

This section supersedes the earlier Flask/SQLite implementation details below for the candidate being reviewed. The product behavior remains unchanged. The learner requested a judge-accessible website, approved the separate browser-local direction, and then requested completion of its remaining functions before final review. No publication is authorized by this amendment.

- `site/` is the complete static application. A local HTTP server serves only this folder. `run-browser.sh` uses the existing runtime without installation. The earlier Flask application and SQLite records are preserved separately; no automatic migration occurs.
- IndexedDB (the browser's structured local storage) saves a separate workspace for each browser and origin, including the port. Projects, goals, steps, entries, and language settings remain on that browser. No account, external API, or synchronization is required.
- `site/js/store-core.js` validates internal route-shaped operations; these are function dispatch identifiers, not server API calls. `site/js/api.js` commits data and request identities together in an IndexedDB transaction. Revisions reject stale writes; request IDs prevent duplicate retries. Every edit and its history event commit together.
- Backup version 1 wraps the complete state in a portable JSON file. Restore validates the schema, dates, IDs, and relationships and checks the latest expected revision. The previous workspace, replacement, and request reset commit atomically across the workspace, requests, and recovery stores. A failed safety-copy or replacement write aborts all changes. Recovery copies remain in browser storage and can be downloaded and restored. They are not independent device backups until exported.
- `site-src/workflow.js` adds entity editing, ordering, project pause/resume, step deferral/reopening, contextual manual records, and draft-preserving cancel confirmation. System events are immutable; editing a manual entry creates a before/after audit event.
- `site/js/planning.js` applies local calendar dates, Sunday–Saturday weeks, carried-over unfinished steps, a seven-day upcoming window (today plus six days), and separate step/goal achievements. Paused projects leave active work lists but retain labeled deadlines and history.
- Source generation: `scripts/build_browser_site.py` combines shared UI inputs and `site-src/`. Generated app/CSS/HTML are committed alongside their inputs. Runtime assets are local and relative; no service worker or cold-start offline installation is promised.
- Current verification and remaining limits are in `verification-final-candidate-2026-10-25.md`. Final user acceptance and any public-host verification remain separate gates.

The remainder preserves the original local-server blueprint and its earlier evidence for reference; its filesystem database and server-route descriptions do not describe the current browser-local candidate.

## How This Works, In Plain Language

The user opens the application in a laptop browser. A small program on the same computer receives their changes and saves them in a structured data file inside this project folder. Save reports success only after writing finishes. Returning a day or a month later reads the same file.

There are three parts: the browser interface, a Python program using Flask to handle requests, and a SQLite database containing projects, goals, steps, summaries, notes, and history. Here, a database is a file with linked tables; no online database account or subscription is needed.

Closing the browser does not erase saved work. After restarting the laptop, the user starts the application again. Text that has not been saved is still a draft; warn before leaving an edited form. The application works offline after its initial setup. It does not collect assistant conversations automatically.

Export Backup downloads a portable copy of all data. Restore Backup previews a selected copy and requests confirmation before replacing current data, first saving a recovery copy. A backup on the same laptop can help recover changes but does not protect against losing the device.

## The Core Journey Through the System

1. The browser loads the local interface and requests data from the local program. The program reads SQLite; the interface uses the saved language, starting with English.
2. The user adds a project, goal, and step. The program validates titles and relationships, then saves the change and its history event together.
3. Completing a step saves its status, completion date, and completion event together. It appears in the appropriate achievement period without automatically completing the goal or project.
4. Adding, deferring, rescheduling, or moving work updates the current plan while retaining dated events and optional explanations.
5. A summary, issue, or personal note is recorded from independent work or an optional assistant. Every entry remains available; the latest summary is shown without overwriting earlier summaries.
6. Restarting the application reads the same data file. Export and confirmed restore provide a separate recovery route.

Implements `prd.md > The Core Journey`, `Progress History`, and `Project Notes`.

## Stack

Python, Flask, and SQLite form the accepted implementation plan. They were recommended based on the learner's local-operation and storage requirements, rather than independently selected by her.

| Tool | Role and rationale | Verification and reference |
| --- | --- | --- |
| Python 3.12 | Runs the local program; already available on the laptop | Locally observed: 3.12.3. [Python documentation](https://docs.python.org/3.12/) |
| Flask 3.1.3 | Serves the interface and handles local save requests | Installed version verified in runtime-env; originally checked on [PyPI](https://pypi.org/project/Flask/3.1.3/). [Installation](https://flask.palletsprojects.com/en/stable/installation/) and [quickstart](https://flask.palletsprojects.com/en/stable/quickstart/) |
| SQLite through sqlite3 | Stores linked records in one file; transactions keep each change and its event together | Locally observed: SQLite 3.45.1. [sqlite3 documentation](https://docs.python.org/3.12/library/sqlite3.html) |
| HTML, CSS, JavaScript | Browser structure, appearance, and interactions without a UI framework or build pipeline | [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML), [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) |
| unittest | Tests application rules, persistence, and recovery using Python's standard library | [Documentation](https://docs.python.org/3.12/library/unittest.html) |

Install dependencies inside this project's `runtime-env/`, not system tools or another project. `requirements.txt` pins Flask; generate `requirements-lock.txt` with actual dependency versions after successful setup in 5-build. No installations or Python upgrades occur during planning.

## Where It Runs and How Someone Tries It

All work belongs to the existing, permanent `Devpost-Learn-2026/` project folder. This is a separate tracker project; it does not modify the source code of projects being tracked.

Planned setup commands, usable only after the build creates the referenced files:

```sh
cd '<project-root>'
python3 -m venv runtime-env
runtime-env/bin/python -m pip install -r requirements-lock.txt
bash run.sh
```

The builder's initial setup uses `requirements.txt` before generating the lock file. Delivery includes both files. `run.sh` resolves its own directory, starts `runtime-env/bin/python app.py`, and prints `http://127.0.0.1:8766`. Dependencies do not need reinstalling for every launch. Control-C stops the service; restarting reuses the existing database. Check port availability during the build without stopping unrelated services.

Listen on `127.0.0.1` only, with debug mode and the reloader disabled. Resolve the default database path, `data/tracker.sqlite3`, relative to the application root rather than the terminal's working directory. Support `--data-dir` and `--port` for isolated test runs.

Use a separate `qa/demo-data/` database with fictional, clearly labeled Demo content for the video. Do not automatically copy real examples from planning. The course requires a demonstration video and a public GitHub repository; online deployment is optional and outside this local version. Commit, push, and publication require separate explicit authorization. Personal data, backups, and the learner profile are excluded from public delivery.

## Look and Feel

Implements `prd.md > Look and Feel` and `Screens and Layout`. The approved direction is comfortable and organized. Latest requested visual reference: the learner-provided MySpace page at local port 4318. Use a dark navy sidebar, pale gray canvas, white bordered cards, slate text, muted green accents, and amber issue notices. Implement original CSS in static/workspace-theme.css; keep Work Tracker identity and all approved behavior. The reference is not a code or storage source. The learner approved the revised visual preview on 25 October 2026; live saving and actual server stop/start persistence subsequently passed on isolated QA data. Use approximately 16px body text, system fonts, clear spacing, and light borders. Do not invent an overall project-completion percentage.

A persistent sidebar contains the working title, Overview, project navigation, history access, and eventually Backup when its approved slice is implemented. A light top bar shows the current location and language selection. Overview contains Projects, Active Goals, Today, This Week, Upcoming Deadlines, and Achievements, clearly separating planned and completed work. Project Details contains goals and steps, Latest Summary, Next Action, Activity, and My Notes. Expandable goal sections reduce crowding; provide a clear return to Overview.

Every interface label, error, and confirmation has a translation key in `static/js/i18n.js`. Store the chosen language in SQLite. English uses `lang=en dir=ltr`; Arabic uses `lang=ar dir=rtl`. Use logical CSS properties, `dir=auto` and `textContent` for user text, and `bdi` for mixed-direction names and links. Preserve user content verbatim without translation or HTML execution. See [text direction](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir).

Support keyboard navigation, explicit labels, visible focus, and status indicators beyond color. Check a laptop viewport around 1280px and narrower windows for clipping. This does not promise phone access or synchronization. Judge-facing planning pages and diagrams remain entirely in English, independently of the application's language toggle.

## Components

### Local Application and Request Handling

`app.py` selects the data path and port and starts Flask. `tracker/web.py` serves the interface, assets, and local request routes. The browser sends JSON to the same local origin; this is communication within the laptop, not an external assistant integration.

Restrict Host to loopback and Origin to the same origin; do not enable external CORS. Require a random local request token for mutations. Avoid logging note contents. Never serve `data/` or `backups/` as static files. No account system is needed for this single-user local version; these settings do not expose it to the local network.

Implements `prd.md > States and Boundaries` and `Deferred From the POC`.

### Project, Goal, and Step Operations

`tracker/service.py` implements creation, editing, project pause/resume with reasons, moving a step between goals in the same project, and optional planned dates and deadlines. Store `position` within each level; use simple Move up/Move down controls instead of drag-and-drop or a dependency engine.

Creation and editing forms accept optional `reason` and `agent_name` with the same update. A separate summary is not required to explain newly discovered work. Save each mutation and its history event in one transaction: either both succeed or neither is saved. Recoverable removal, accepted during the first build review, sets `steps.archived_at` to the current UTC time and records a `step_archived` event with optional reason. Restore clears that field and records `step_restored`. Neither operation changes the original status, dates, notes, or completion events; restore creates no new achievement. Exclude archived steps from current step lists, remaining-work counts, completion warnings, and planned-work/deadline views, but retain them in a Removed steps disclosure with Restore to plan. Historical achievement counts include their completion events.

A moved step retains its ID and achievements; the move event records the previous and destination goal IDs and titles at that time. Selecting an already-current status does not create another achievement. Disable repeated submission while saving and preserve input on error.

Implements `prd.md > Projects and Goals`, `Flexible Steps`, and `Flexible Planning Rules`.

### History, Summaries, Issues, and Notes

`tracker/service.py` creates dated entries with explicit kinds: summary, issue, note, or event. Notes, summaries, and issues may reference a goal or step; assistant names are optional. A personal note needs only a project. My Notes shows general project notes with no goal/step link. Each goal and step has a Notes & updates disclosure for entries linked directly to it; goal-level entries exclude step-specific entries, which remain under their own step. Activity includes all contextual records with the goal/step title visible. History has no weekly retention limit.

System events retain before/after context. Each new summary or note is a separate entry. Editing a manual entry creates an event containing its previous and new text; system events cannot be edited. Distinguish `occurred_at` from `recorded_at`, allowing users to record earlier work and displaying the distinction when useful. System events use the current time unless a completion date is explicitly supplied. Text never generates tasks automatically. Derive Latest Summary from the newest summary by occurrence time, then recording time.

Implements `prd.md > Progress History` and `Project Notes`.

### Overview, Dates, and Achievements

`static/js/dates.js` contains pure grouping and display functions for this small personal dataset. Planned dates and deadlines are `YYYY-MM-DD` calendar dates, not UTC timestamps. Event timestamps are ISO-8601 UTC and displayed in the device's time zone. Refresh date views on opening, regaining focus, and day changes. Weeks run Sunday–Saturday. Upcoming includes today through the following six days; overdue deadlines are separate. Use [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) with the Gregorian calendar in both languages.

Today includes pending steps with `planned_for <= today`. This Week includes pending work planned through the end of the week, including unfinished work from earlier weeks. Label older work Carried over and show its original date. Do not apply a lower date bound that hides old work, rewrite dates automatically, or create events merely because time passed. Keep each step once within each list until completed, deferred, or explicitly rescheduled. Moving a step does not hide it when its status and date remain unchanged.

Undated steps remain in their project and do not enter Today automatically. Carried over describes a planned work date; Overdue describes a missed deadline. Deferring clears `planned_for` while retaining `due_date`. Completing a goal warns about unfinished steps but does not change their statuses; they remain visible and actionable.

**Paused projects — accepted display rule:** Exclude paused-project steps from Today and This Week, and their goals from Active Goals. Keep the project card, details, notes, history, and historical achievements with a Paused label. Do not change step statuses or dates. Resuming restores planned-work visibility using original dates, including carried-over work. Keep deadlines in Upcoming/Overdue with a Paused label because pausing does not cancel an external deadline. The learner explicitly accepted this rule during specification review.

Derive achievements from completion events in the selected period. Display goal and step achievements separately; count each entity at most once per period. Reopening records a change without erasing historical completion, and the display indicates reopened work. Moving alone is not a completion and does not rewrite the project context of an earlier achievement. Do not show a completion percentage for an ongoing project.

Implements `prd.md > Overview and Achievements` and `Flexible Planning Rules`.

### Local Persistence and Backups

`tracker/storage.py` opens SQLite with foreign keys enabled, parameterized queries, and versioned schema migrations. Never reset an existing database at startup or after a read error. Persist data and language settings in `data/tracker.sqlite3`; browser localStorage is not the source of truth.

`tracker/backup.py` exports UTF-8 JSON containing `format=work-tracker`, `schema_version=2`, `exported_at`, `settings`, `projects`, `goals`, `steps`, and `entries`. Obtain a consistent SQLite snapshot before serialization, using the [SQLite backup interface](https://docs.python.org/3.12/library/sqlite3.html#sqlite3.Connection.backup). Download a clearly named, dated file; its final location depends on the user's browser settings or selection. The app does not upload it.

Restore replaces the full snapshot; it does not merge records. Select a file, validate version/types/IDs/relationships/dates, preview counts and export time, then explicitly confirm replacement. Revalidate the snapshot, digest, and expected revision at confirmation. First write `backups/pre-restore-<timestamp>-<id>.json` using the same restorable JSON format, a fresh exclusive filename, flush, and fsync. Stop if this safety copy fails. Then apply the restore in one transaction and increment the current revision rather than restoring an older revision number. Invalid input or a failed transaction leaves current data unchanged.

Export and restore must accept the same valid format, without an arbitrary import-only size cap that rejects the app's own export. Handle resource failures safely and test a valid backup larger than 10 MiB. Never automatically delete data or recovery copies. A backup on the same laptop is not protection against device loss. Operating-system folder synchronization is separate from this application and has not been inspected.

Implements `prd.md > Local Data and Backup` and `States and Boundaries`.

### UI Shell and Forms

`static/js/app.js` coordinates Overview, Project Details, forms, and save feedback. `api.js` handles requests and errors. `render.js` creates safe elements without interpolating user content into innerHTML. Use `#overview` and `#project/<id>` navigation; reloading a project link reads existing data rather than creating a duplicate.

Empty states invite the relevant action without prepopulating real examples. Forms show translated field-level errors and retain input. Saved appears only after successful persistence. Warn before leaving an edited form. Keep backup and restore accessible without introducing a complex settings area.

Implements `prd.md > Screens and Layout`, `States and Boundaries`, and `Look and Feel`.

## Data Model

Five tables in one SQLite file. IDs are UUID strings; validate relationships in both application logic and the database. No account or team layer is required.

| Table | Main fields |
| --- | --- |
| projects | id, icon, title, description, status(active/paused), pause_reason, next_action, due_date?, position, created_at, updated_at |
| goals | id, project_id, title, description, status(active/completed), due_date?, position, completed_at?, created_at, updated_at |
| steps | id, goal_id, title, description, status(pending/completed/deferred), planned_for?, due_date?, position, completed_at?, archived_at?, created_at, updated_at |
| entries | id, project_id?, goal_id?, step_id?, kind(summary/issue/note/event), action?, text, agent_name?, occurred_at, recorded_at, details_json, request_id? UNIQUE |
| app_meta | singleton row: schema_version, revision, language(en/ar) |

Manual entries require `project_id`; global events such as language changes may omit it. Referenced goals and steps must belong to that project. `details_json` preserves event context: entity/title, before/after, and old/new goal IDs and titles for moves. Later renaming must not rewrite the explanation of past events. Completion events identify `entity_type` and `entity_id` explicitly.

User input and user-pasted summaries are the content sources. The browser holds a display copy. A global `revision` prevents an old tab from overwriting newer data: return 409, preserve its draft, and ask it to load the current state before reapplying the change. A `request_id` prevents repeating an already committed mutation; a retry returns success with the latest state, not a literal replay of an old response. Check duplicates before rejecting an old revision, and verify the operation identity and content match the stored event details; conflicting reuse fails. Mutations and restore increment the revision.

## Local Request Contracts

These routes belong to the local application, not external services. Every mutation includes `expected_revision`, `request_id`, and the local request token. After commit, return `{ok:true, revision, data}`. Errors use `{ok:false,error:{code,fields}}` with an appropriate HTTP status. Translate codes in the interface; do not display stack traces or private paths.

| Route | Input and result |
| --- | --- |
| GET /api/state | `{revision,settings,projects,goals,steps,entries}` for the small personal dataset |
| POST /api/projects | title,description?,next_action?,due_date?,reason?,agent_name? → project and creation event |
| PATCH /api/projects/<id> | changed fields/status/pause_reason,reason?,agent_name? → project and event |
| POST /api/goals | project_id,title,description?,due_date?,reason?,agent_name? → goal and event |
| PATCH /api/goals/<id> | title/description/due_date/position/status,reason?,agent_name?,completion_at?; `ack_remaining=true` when completing with unfinished steps → goal and event |
| POST /api/steps | goal_id,title,description?,planned_for?,due_date?,reason?,agent_name? → step and event |
| PATCH /api/steps/<id> | fields/status/new goal_id within the same project or archived(boolean),reason?,agent_name?,completion_at? → atomic update and event |
| POST /api/entries | project_id,kind(note/summary/issue),text,occurred_at?,agent_name?,goal_id?,step_id? → entry; notes need no goal/step |
| PATCH /api/entries/<id> | edit manual-entry text and retain a before/after event; system events are immutable |
| PATCH /api/settings | language(en/ar) → saved preference |
| GET /api/backup | consistent JSON download, excluding secrets and machine paths |
| POST /api/restore/preview | JSON snapshot → validation, counts, exported_at, digest; no mutation |
| POST /api/restore | snapshot,digest,expected_revision,confirm_replace=true plus request metadata → revalidation, safety copy, atomic replacement |

No destructive delete/reset routes in the initial version. Step removal uses dedicated POST archive/restore operations; project pause and step deferral also preserve history. Accept Unicode, require nonempty mandatory text, validate dates and existing relationships. Use 400 for invalid input, 404 for a missing entity, and 409 for a stale revision or busy database. Keep form input after failed saves.

## File Structure

Planned files within the current project. Only planning documents and curriculum files exist at this stage.

```text
Devpost-Learn-2026/
├── app.py                      # Launch, data path, and port
├── run.sh                      # Launch from any working directory
├── requirements.txt            # Flask==3.1.3
├── requirements-lock.txt       # Actual dependency versions captured during build
├── README.md                   # Setup, use, backup, restore, and limitations
├── tracker/
│   ├── __init__.py
│   ├── web.py                  # Flask routes and local request protection
│   ├── storage.py              # SQLite connections, transactions, and schema version
│   ├── schema.sql              # Tables, relationships, and indexes
│   ├── service.py              # Project, goal, step, and history rules
│   └── backup.py               # Export, validation, restore, and safety copies
├── templates/
│   └── index.html              # Interface shell and local request token
├── static/
│   ├── styles.css              # Layout, both directions, and keyboard focus
│   └── js/
│       ├── app.js              # Navigation, forms, and view updates
│       ├── api.js              # Requests and error handling
│       ├── render.js           # Safe cards, notes, and history
│       ├── dates.js            # Today, week, deadlines, and achievements
│       └── i18n.js             # English and Arabic interface strings
├── tests/
│   ├── test_workflow.py        # Completion, moves, and notes
│   ├── test_storage.py         # Atomic writes and conflicts
│   ├── test_backup.py          # Round trip and invalid backup rejection
│   └── dates.test.mjs          # Date boundaries and achievement deduplication
├── data/                       # Private; excluded from Git
│   └── tracker.sqlite3
├── backups/                    # Private recovery copies; excluded from Git
├── qa/                         # Isolated test data and evidence; excluded from Git
├── runtime-env/                # Project-local Python tools; excluded from Git
├── .gitignore                  # Private data and runtime exclusions
└── devpost/                    # English plans; learner-profile.md is private
```

Before the first data write, add `/data/`, `/backups/`, `/qa/`, `/runtime-env/`, `*.sqlite3*`, and `__pycache__/` to existing learner-profile and .env exclusions. Do not include real work data in public source. Review documentation for personal context before public delivery.

## External Services and Dependencies

No external AI, cloud service, analytics, remote fonts, or CDN assets at runtime. No service keys or subscriptions are required. Initial dependency installation downloads packages from PyPI; subsequent operation is local. All runtime communication is between the browser and the program on loopback. Phone support and synchronization are deferred; the database is not exposed to the network.

## Important Failure Modes

- **Stopped program or occupied port:** Show a connection error, retain an open form's draft, and report a clear launch error without terminating unrelated processes. Restart reads the existing database.
- **Failed save or busy database:** Roll back the mutation and event together. Never show false success. Keep input for retry; stale revisions must not overwrite another tab's changes.
- **Invalid restore or failed safety copy:** Reject before modifying data. Selecting a file alone never triggers replacement. Require preview and confirmation; a failed replacement transaction preserves the prior state.

## Verification Plan

These are planned checks for 5-build, not results already obtained. Use fictional data in isolated `qa/` databases or memory, never the real `data/tracker.sqlite3`.

1. **Complete workflow:** Create a generic project, a goal, and two steps; complete one step; add unexpected work; move unfinished work to a later goal; complete the first goal. The project and original completion history remain.
2. **Return after absence:** Save summaries from two assistants, an independent note, and an earlier-dated issue. Stop the actual application process and restart with the same QA data path. Verify content, dates, relationships, and language. Reloading a page alone is insufficient persistence evidence.
3. **Date boundaries:** Yesterday's and earlier weeks' pending work remains in Today/This Week with original dates across midnight and Saturday/Sunday. Time passing changes no stored date and creates no event. Completion/deferral removes the item; explicit rescheduling changes its view. Keep planned dates separate from deadlines and avoid duplicate achievements on reopen/recompletion. Test that pause removes steps from Today/This Week and goals from Active Goals while retaining labeled deadlines and historical achievements. Resume restores visibility using original dates, including carried-over work; statuses and history remain unchanged.
4. **Failures and atomicity:** Inject a failure between a status update and its event in an isolated test; neither may persist. Reject stale tabs and cross-project moves. Retrying a request ID must not duplicate completion.
5. **Backup round trip:** Export all entities, restore into a separate test database, compare IDs/text/relationships/events/settings, then restart. Test a valid backup larger than 10 MiB. Reject malformed files, unsupported versions, and broken references without changing current data. Verify the pre-restore safety copy exists and can itself be restored in a test environment.
6. **Both interface languages:** Exercise creation, moves, deferral, notes, errors, and backups in English and Arabic. Layout direction changes without translating or duplicating user content. Render `<script>` as text. Check keyboard access and offline operation after setup.

Planned commands: `runtime-env/bin/python -m unittest discover -s tests -v` and `node --test tests/dates.test.mjs`. Node 24.15.0 was observed locally for JavaScript tests; it is not an application runtime requirement. Inspect the interface in an available browser and record concise evidence rather than claiming unobserved success.

## What Was Simplified and Why

- One laptop, local browser, and one database file, following the learner's decision; no accounts, phone access, or synchronization.
- Plain browser tools and grouping of the small dataset in the browser; no advanced analytics or background scheduling service.
- Manual ordering buttons and a shared entry model with explicit summary/note/issue/event kinds.
- Full-snapshot backup with confirmed replacement; no merging of conflicting copies.
- Persistence and history remain real requirements and must be demonstrated in isolated tests.

## Decisions and Open Issues

**Accepted decisions:** Laptop-first, local browser operation, durable project-folder storage, export/restore, English-first interface with Arabic support, and English judge-facing plans. Real projects discussed in the interview remain examples, not authorized seed data.

**Learning clarification:** The conversation distinguished access from multiple devices from data synchronization. The learner chose a laptop-only start and confirmed the importance of local saving. The agreed evidence is a real process restart and export/restore, not a save observed only within one session.

**Accepted implementation plan:** Python/Flask/SQLite, plain HTML/CSS/JavaScript, restrained visual styling, and a pre-restore safety copy followed by confirmed replacement. The proposed tables and files are derived from the requirements rather than choices the learner must enumerate.

**Tool status:** Python and SQLite were available locally; Flask was not installed. Official Flask 3.1.3, Python, and MDN references were checked during planning on 2026-10-25. No application packages, application database, or application code have been created during this stage.

**Scope and feasibility:** History, two interface languages, and recovery make this larger than a basic checklist. Completion within two to four hours is not guaranteed. Build in small verified increments in 5-build without silently dropping approved behavior. Verify the port and dependency environment early. The user chooses any additional off-device backup location; the app does not provide automatic device-loss protection.

**Approval and handoff:** The learner accepted the updated technical blueprint after the paused-project rule was resolved. This completes 4-spec; no product questions remain. The next stage is 5-build, which will turn the approved documents into ordered implementation and verification steps. The final product name is not a blocker. Approval of the plan does not authorize commit, push, or publication.

**Independent review:** A read-only review against the PRD identified gaps in creation-time reason/helper metadata, safety-copy format compatibility, export/import size compatibility, and retry semantics. Those points were corrected in the draft.

**Learner review refinements:** Carry unfinished planned work across day/week boundaries without rewriting its date. The learner accepted the paused-project display rule after reviewing the recommendation. Translate judge-facing plans and diagrams into English while retaining Arabic conversation and a bilingual application.

## Build Progress Note

The core saved workflow and learner-requested refinements are implemented. Current checks pass in the existing Flask 3.1.3 runtime: 33 Python tests and 3 JavaScript tests. Actual UI saves, page refresh, and server stop/start persistence passed on isolated QA data. Local Git initialization and the initial source checkpoint succeeded; no remote publication is authorized. `devpost/interface-preview.html` remains a view-only fictional-data rendering. See `checklist.md` for current progress and open learner checks; no full application completion is claimed.

API history entries expose parsed `details` from the stored `details_json`; internal retry fingerprints remain server-side.

**First visual review refinement:** The learner selected calm blue styling, clarified user-defined goal counts and contextual notes at goal/step level, and explicitly accepted recoverable step removal. The revised preview demonstrates the placement of those controls; their persistence remains part of slice 2 and is not claimed as implemented. Existing databases need an explicit versioned migration when archived_at is introduced; never silently reset stored data.

**Visual-only reference revision:** Added `static/workspace-theme.css` and the sidebar/breadcrumb presentation. Overview metric meanings, goal/step relationships, contextual history, form behavior, local storage, and all later-slice requirements remain unchanged. No reference application code or data was imported.

## Implemented refinement — recoverable steps and goal overview

Schema migration v1→v2 transactionally adds nullable `steps.archived_at` and `projects.icon` (default `folder`); validates both version markers before changing existing data. Current supported icon keys: folder, chart, spark, award, document, book, code, heart. Draw locally in SVG, with a labeled native-radio picker. The project PATCH route accepts icon and/or next_action independently. POST step archive/restore routes preserve original step status/dates/notes, record separate events, honor revision/idempotency protections, and disallow completing an archived step.

`static/js/progress.js` calculates current-plan ratios excluding removed steps and active-goal counts excluding paused projects. The Active Goals metric is a keyboard-accessible button opening a dismissible all-goals dialog. Each circular indicator exposes completed/total text to assistive technology. Empty step sets use zero fill and no fake percentage; fully completed step sets do not change goal state. Navigation from the dialog focuses the selected goal. These changes do not implement the rest of the Today/This Week dashboard or goal-completion controls.

### Implemented title and move contracts — 25 October 2026

The incremental implementation uses explicit routes rather than overloading the planned general edit routes: `PATCH /api/goals/<id>/title` and `PATCH /api/steps/<id>/title` accept a nonblank `title`; `POST /api/steps/<id>/move` accepts a destination `goal_id`. Each accepts optional reason/helper plus the existing revision and request ID. The existing step PATCH continues to handle completion. Other general edit fields remain planned.

Moves reject the current goal and all goals in another project, append at the destination, and preserve step ID, status, dates, removal state, and notes. Past entries retain their original goal references; the new move event includes `source_goal` and `destination_goal` ID/title snapshots plus step before/after. Renames never rewrite old event titles. Completed and removed steps can also be renamed or moved; moving a removed step keeps it removed. No schema migration is required (version 2 remains current).
