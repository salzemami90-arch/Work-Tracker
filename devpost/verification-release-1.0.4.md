# Work Tracker 1.0.4 — laptop compatibility follow-up

## Scope

Laptop use remains the requested scope. Physical-phone testing and iPhone Mirroring setup were explicitly excluded by the user in this follow-up. No mobile-device access was enabled.

## Confirmed Safari defect and fix

On Safari 27.0, choosing a restore JSON file in the native picker twice returned to an empty input with no preview. Window focus refreshed and rebuilt the page before the file-change event could finish. The same exported file loaded normally after the fix.

The focus handler now retains the backup page and file selection; restore still checks the saved revision transactionally and rejects stale replacements. Other pages refresh only when the saved revision changes. No layout or data-schema change.

## Verification

- 32 Node regression tests pass after the change.
- Safari 27.0: 14/14 real IndexedDB integration tests pass on an isolated origin.
- Safari public UI: create project, goal, step; record completion with note; reload retains all; add Arabic note after completion; switch to Arabic and reload; switch back to English; export JSON with expected project/goal/step/history.
- Fixed candidate in Safari: select the previously exported JSON; preview shows 1 project, 1 goal, 1 step, 7 events; explicit restore succeeds; reload retains restored project and a safety copy.

- Firefox 158.0.1: 14/14 real IndexedDB integration tests pass on an isolated origin.
- Firefox native UI: selected the Safari export, reviewed 1 project / 1 goal / 1 step / 7 events, restored it, and retained the project and safety copy after reload.
- Firefox native UI: added and completed a second step with a completion note; fully quit Firefox, verified the process was absent from the app inventory, relaunched it, and reopened the project. Both completed steps, original Arabic note, next action, and chronological history remained intact.
- A read-only second-look review found no actionable issues with the focus guard or revision check.

## Boundaries

Chrome regression coverage is recorded in verification-release-1.0.3.md. This follow-up targets Safari and Firefox on macOS; Windows, physical phones, and extended-duration soak testing were not performed. The downloadable browser and fictional QA data remain in ignored local tooling and are not included in the release. Source and deployment identifiers are recorded in the release DELIVERY-STATUS.json after publication.
