# Work Tracker — targeted regression verification

Date: 25 October 2026. Scope: skip-link focus, dirty-form cancellation, existing-runtime validation, and an isolated live-persistence check. This report separates verified results from blocked work.

## Changes

- `static/js/app.js`: intercept normal skip-link activation, prevent hash navigation, focus the existing `main` element, and scroll it into view. The current project route stays intact. The existing `tabindex="-1"` makes main programmatically focusable.
- Regenerated `devpost/interface-preview.html` from the existing source. Its intentional refusal to save is unchanged.
- Recorded installed dependency versions in `requirements-lock.txt`; updated stale runtime status in README, specification, and checklist.
- No cancellation logic, design, product requirements, storage architecture, or project-deletion behavior was changed.

## Verified

| Check | Observed result |
| --- | --- |
| Existing runtime | `runtime-env/bin/python` has Flask 3.1.3. No dependency installation was attempted. |
| Automated checks | `runtime-env/bin/python -m unittest discover -s tests -v`: 16/16 passed, no skips. These include storage/service and Flask test-client checks, not browser-driven persistence. |
| JavaScript | `node --check static/js/app.js` passed. |
| English keyboard skip | On `interface-preview.html#project/demo-studio`, Tab focused Skip to content; Enter focused `main`. URL and Studio journal project remained unchanged. Next Tab focused Back to overview inside main without activating it. |
| Arabic keyboard skip | Switched to Arabic, navigated backward with Shift+Tab to انتقل للمحتوى, and pressed Enter. Focus moved to `main`; the same project route and content remained. |
| Cancel edited form: stay | Opened Edit next action, replaced the text with a fictional unsaved draft, reached Cancel with Tab, and pressed Enter. Inspected the native confirmation and dismissed it. The editor and exact draft text remained. |
| Cancel edited form: leave | Activated Cancel again and accepted the confirmation. The editor closed; focus returned to Edit next action. The visible next action was unchanged. Reopening showed the original `Outline the opening story` value. |
| Unchanged form | Escape closed the reopened, unmodified editor without a discard confirmation. |

Cancellation was observed to work in this fresh run. The earlier timed-out attempt remains inconclusive; this report does not infer its cause. All cancellation and keyboard observations above used the deliberately non-saving preview. They are not live-save proof.

Screenshot evidence: `qa/skip-project-ar.jpg`. Accessibility observations explicitly reported `main` as the focused element while retaining the project URL.

## Actual browser saving — verified

The learner started the actual app at `http://127.0.0.1:8768` with the isolated `qa/browser-regression-20261025/` directory. All changes below were made through browser forms, not seeded through SQL or test-client requests. A read-only database inspection confirmed the browser-created project exists in that exact QA file.

| Check | Observed result |
| --- | --- |
| Creation | Created fictional project `QA persistence - fictional workspace`, goal `Verify saved progress`, and two initial steps. |
| Completion | Completed `Finish the first verification` at 25 October 2026, 19:34 local time, with a completion note and no helper. The project and goal remain active. |
| Newly discovered work | Added `Check the newly discovered case` after completion, with a reason and optional helper `Codex - QA example`. The earlier achievement remains: 1 of 3 steps completed. |
| Edit and save | Changed Next action from `Draft the test plan` to `Resume with the remaining checks after restart - نكمل بعد إعادة التشغيل`. The new value and its update event appeared. |
| Actual-app cancel | Edited Next action to a disposable draft. Dismissing the confirmation retained the draft; accepting it closed the editor without saving. |
| Page reload | Reloaded the actual project page. All three steps, dated completion, saved Next action, and seven history entries remained. The canceled draft did not appear. |
| Literal text | Mixed English/Arabic description and `<b>keep as text</b>` displayed as text. |
| Actual-app keyboard skip | After reload, Tab focused Skip to content; Enter focused main while preserving the project route. |
| Database comparison | Read-only snapshots before cancellation and after reload were identical across all five tables, including IDs and dates. Revision stayed 7. Counts: 1 project, 1 goal, 3 steps, 7 history entries; 1 completed step. |

Evidence lives under `qa/browser-regression-20261025/`: `before-restart.json`, `after-refresh.json`, and `after-refresh.jpg`. Canonical snapshot SHA-256: `9c250b8c0db2a7d15df422f1606cb045fe49d38193e30e5b4f9f1f961d077a0f`.

Project route for continuation: `http://127.0.0.1:8768/#project/e66252dd-11c0-4872-83b2-cdad15a928ad`.

## Actual server restart — verified

The learner stopped the QA server. Reloading the saved project URL returned `ERR_CONNECTION_REFUSED`, confirming the service was unavailable. The learner then restarted on port 8768 with the same QA directory. Opening the same project route showed the saved project, active goal, all three steps, the completed achievement dated 25 October 2026 at 19:34, the edited bilingual Next action, and all seven history entries.

A fresh read-only database snapshot matched `before-restart.json` exactly across all five tables, including IDs, relationships, text, dates, history metadata, and revision 7. Canonical SHA-256 remained `9c250b8c0db2a7d15df422f1606cb045fe49d38193e30e5b4f9f1f961d077a0f`. No records were reset or duplicated. Tab then Enter also focused main without leaving the project after restart.

Additional evidence: `qa/browser-regression-20261025/after-restart.json`, `after-restart.jpg`, and `after-restart-accessibility.txt`. This verifies the actual server stop/start cycle and browser retrieval, separately from page reload and automated checks. A laptop reboot was not tested.

## Still pending
- Full project/goal/step title editing is not implemented yet (approved slice 2). The edit verified here is the currently implemented Next action field; broader editing is not claimed.
- Local Git checkpoint and the learner's applicable saved-work hands-on check remain open.

No default user data was used. No design, requirements, or source behavior changed during this saving check. The preview remains intentionally non-saving.

## Local preservation

Source and this report are saved in the project folder. Local `git init` was attempted under the user's existing authorization and rejected with `.git: Operation not permitted`. No repository or commit was created; nothing was pushed or published. Slice 1 remains incomplete.
