# Dashboard design review — 25 October 2026

Status: awaiting learner visual review. This is a separate, view-only prototype, not an implemented or judge-ready feature milestone.

## Reference and requested changes

The learner asked to use the visual hierarchy of the local MySpace reference at port 4318 while retaining Work Tracker identity and existing behavior. The reference was inspected through its rendered Overview, Achievements, and Backup & restore screens; no reference source or user records were imported.

- Navigation: Overview, Projects, Achievements. Achievements is a page with completed work and goal-progress views, replacing the clickable Active Goals dialog in this proposed design.
- Overview: Active goals, Goals completed this week, Upcoming deadlines, plus the requested Steps completed this week. Below: projects, active goal progress, this week's history; adjacent: upcoming/overdue deadlines, Today, and next actions.
- Original outline SVG shapes for target/calendar/award/lock/download, a header mark and favicon, and existing selectable project-icon concepts.
- Sidebar at the side in a wide window (right in Arabic); navigation across the top at 700px and below. Backup remains reachable in narrow windows.
- Storage copy accurately describes the current laptop architecture. Browser-local persistence for a future hosted judge experience is still a separate, unimplemented architecture change.

## Files and verification

`design-review/dashboard.js`, `dashboard.css`, and `mark.svg` contain review-only UI. `scripts/make_dashboard_review.py` reuses the application's original renderer and fictional preview fixtures to generate `devpost/dashboard-preview.html` and an ignored local serving copy under `qa/dashboard-review/`. Rebuild with `python3 scripts/make_dashboard_review.py`.

Checked the generated module syntax and browser rendering. Observed Overview and dedicated Achievements navigation, completed-work versus goal-progress switching, English/Arabic direction, and the top navigation at an actual 820px iframe viewport. Submitted a preview New goal form and observed explicit save refusal. The actual application source, user database, and API routes were not changed. Backup buttons are explicitly disabled in this design preview; dashboard dates/counts use fixed fictional examples.

Local preview: `http://127.0.0.1:8770/`. Current saved-work app remains on port 8768. Local screenshots under ignored `qa/dashboard-review/` document Overview, Achievements, Arabic, and the narrow window.

## Remaining gates

Learner visual approval, real dashboard calculations/date entry/goal completion, working backup and restore, hosted storage compatibility, and judge-path functional QA remain open. No Sites registration, upload, deployment, or public sharing was performed. The learner explicitly requires review and separate publication approval before any publish.

## Responsive correction after learner feedback

The initial preview switched to top navigation too early (950px). Read-only inspection of the rendered MySpace layout confirmed side navigation at 232px, 205px below 1150px, and 195px below 950px; top navigation begins at 700px. The review now uses those observed widths, while the content stacks earlier to avoid crowding. Original reference code was not copied. Boundary checks use isolated 701px/700px embedded viewports, plus the existing 820px review.
