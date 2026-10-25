# Work Tracker

A laptop-first tracker for ongoing projects, goals, steps, notes, and dated progress history. The interface is English-first with an Arabic option.

## Run the current application

Install Python 3 if it is not already available. No Python packages, account, API key, or backend service are required for the current browser-local application.

From this repository folder:

```sh
python3 -m http.server 8771 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:8771/ in a modern desktop browser. Keep the terminal running. Control-C stops the server. Always serve `site/`, not the repository root.

The app starts with an empty workspace. Create a project, add a goal and steps, complete a step, and inspect Achievements and Progress History. Projects remain available when a goal is completed. Newly discovered work can be added or moved without erasing earlier achievements.

## Storage and backups

Records are stored in IndexedDB in the current browser and site address. There is no cloud synchronization or automatic assistant integration. Notes and summaries can be entered or pasted manually.

Use **Backup & restore** to download a JSON backup before clearing browser data or changing the browser or address. Restore previews the file before confirmation and keeps a recovery copy of the previous workspace. Browser-held recovery copies can also disappear when browser storage is cleared; downloaded backups are the independent copies.

## Features

- Overview, projects, achievements filtered by project, and chronological progress history.
- Editable project, goal, and step names; optional dates and deadlines; ordering and moving steps within a project.
- Step completion/reopening, deferral, and recoverable removal; project pause/resume.
- Notes, summaries, issues, and next actions; optional attribution to an assistant or collaborator.
- Today/This Week carry unfinished work forward. Completed steps and goals are separate achievements.
- English and formal Arabic; responsive side/top navigation and selectable project icons.

## Source and planning

The current deliverable is `site/`. Its generated UI comes from `static/js/`, `site-src/`, and `scripts/build_browser_site.py`. Browser storage and planning modules live in `site/js/`.

```sh
python3 scripts/build_browser_site.py
```

Required planning documents: [scope](devpost/scope.md), [product requirements](devpost/prd.md), and [technical specification](devpost/spec.md). The specification's browser-local amendment supersedes the earlier Flask storage design. Historical review documents describe earlier milestones, not the current publication status.

The earlier Flask/SQLite implementation remains in `tracker/`, `templates/`, and `app.py` for traceability. It uses a separate database and is not the current browser-local deliverable. Running that earlier version requires the pinned packages in `requirements.txt`.

## Verification

JavaScript tests require Node.js:

```sh
node --test tests/browser-store.test.mjs tests/browser-integration.test.mjs tests/planning.test.mjs tests/progress.test.mjs
```

Historical verification of the current app recorded 25 JavaScript checks, 33 earlier Python regression checks, and 10 actual IndexedDB checks each in Chrome and the in-app browser. Details and limitations are recorded in `devpost/verification-final-candidate-2026-10-25.md`. Safari, phone-specific use, and a publicly hosted deployment have not been verified.

## Release contents

This is a clean public source snapshot for the Build With AI: Basics submission. Application assets match local source commit `50a18613e095b7fde53bd4ceca3488ff2197c145`. The README and one local path in the review guide were adjusted for public use. Private learner information, recordings, workspace records, backups, installed runtimes, and local QA artifacts are excluded. Local development history is preserved separately and is not rewritten by this snapshot.

`RELEASE-MANIFEST.json` records SHA-256 hashes for the included files. There is no hosted application link in this source-only release.
