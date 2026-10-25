---
doc: prd
status: approved
---

# Work Tracker — Product Requirements

Working title. A personal dashboard and durable reference for returning to a project after a day or a month. It combines adaptable goals and steps, dated progress, summaries from independent work or different assistants, and personal project notes.

Sources: `scope.md > The Unique Kernel`, `The Core Loop`, and `The POC Boundary`.

## Current Delivery Amendment — 25 October 2026

The current review candidate uses a private workspace saved in the current browser and site address. Export and restore provide portable copies; switching browser or address does not automatically transfer records. The earlier local-server application remains separate. There are no accounts, automatic assistant imports, or cross-device synchronization. The accepted interface, ongoing projects, flexible goals/steps, dated achievements, and contextual Progress History remain the product contract. Final hands-on acceptance and publication are still pending.

## The Core Journey

1. Open the overview to see projects, active goals, remaining work, deadlines, planned work, and achievements.
2. Create or open a project, then create goals and steps within it. A goal can also be added from the overview by selecting its project.
3. Complete a step. Its dated achievement remains visible even while its goal is still active.
4. Add unexpected work to the appropriate goal, defer it, or move it to another goal within the same project. Record an optional reason and assistant name without erasing earlier progress.
5. Complete a goal when its purpose has been met. The ongoing project remains available for new goals.
6. Return later to the latest summary, next action, and chronological history. Consult dated updates to understand when a problem was recorded and what happened around it; the app does not automatically diagnose its cause.

Sources: `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout

### Overview

Show projects, active goals, remaining work, upcoming and overdue deadlines, planned work, and separately labeled step and goal achievements. Provide Add Project, Add Goal, and links to project details. Every goal and step retains visible project context.

### Project Details

Show project status, latest summary, next action, ordered goals and their steps, activity history, and My Notes. The user chooses the appropriate goal when adding new work. Goal details can expand within the project rather than requiring a separate page.

The basic navigation is Overview → Project Details → Overview. The requested visual revision adds a persistent sidebar for workspace navigation and project shortcuts, without adding a separate goal page or changing behavior.

Source: `scope.md > The POC Boundary`, developed during the product interview.

## Look and Feel

The learner requested an interface that is comfortable and organized. Make the project → goals → steps relationship readable without crowding the screen. The latest requested visual direction uses the learner-provided MySpace page as a reference only: a dark navy sidebar, pale gray canvas, white cards, muted green accents, compact sans-serif headings, and generous spacing. Keep the Work Tracker name and all approved functions; implement original styling without copying reference code. The learner approved the revised visual preview on 25 October 2026. This supersedes the earlier calm-blue palette request; approval does not attest to working persistence.

A later explicit decision during technical planning limits the initial version to a laptop. The application starts in English and offers Arabic, including right-to-left layout. User-entered text stays in its original language; automatic translation is not required. The interface adapts to the available laptop window width. Phone access and synchronization are deferred.

The learner has also accepted local browser operation, durable storage inside the project folder, and backup export and restore. The specification defines the implementation.

Planning documents and judge-facing diagrams are in English; the conversational explanation can remain Arabic. This is separate from the application's two-language interface.

## Features and Behavior

### Projects and Goals

- Projects may concern paperwork, independent work, a small business, software, or other work. Do not impose software-development stages or require an assistant.
- Create and edit goals and their steps as work develops. The user decides how many goals a project needs; there is no fixed template or goal-count limit. Add new goals without closing the ongoing project.
- Completing a goal does not complete or remove its project.
- Record a paused project and its reason while retaining its content and history.
- Direct entry is a complete workflow; pasting an assistant's summary is optional.

**Acceptance:** Create a project, goal, and step without assistant metadata or predefined stages; edit an existing goal without losing achievements; complete a goal and add another to the same project; inspect a paused project's reason and history.

Sources: `scope.md > The POC Boundary` and `The Core Loop`.

### Flexible Steps

- Display steps under ordered goals. Let the user choose the goal for newly discovered work.
- Completing a step records a dated achievement independently of goal completion.
- Add, defer, reschedule, or move work to a later goal within the same project.
- Remove a step from the current plan without deleting it. Keep its original status, dates, notes, and prior achievements, show it in a recoverable Removed steps area, and allow Restore to plan. Record removal/restoration and an optional reason. Removed steps do not count as remaining active work or appear in planned-work/deadline lists; their historical achievements remain. Restoration uses original dates and status.
- A moved step keeps its identity and history. Record the previous and new goal and an optional reason. Moving alone is not an achievement.
- Optional assistant metadata belongs to the relevant update, not a mandatory project owner.
- Goal completion remains under the user's control; it never completes child steps automatically.

**Acceptance:** Add a step without erasing an earlier completion; move a step and find its destination and history; capture an optional reason/helper for new work; complete the workflow without a helper; do not count a move as a completion.

Sources: `scope.md > The Unique Kernel` and `What "Working" Looks Like`.

### Progress History

- Keep the latest summary and next action alongside dated events: completions, new work, edits, deferrals, moves, goal completion, and project pause/resume.
- Retain multiple summaries and updates from independent work or different assistants. A new summary does not replace the older records.
- A manual update may describe a problem and optionally reference a goal or step.
- Preserve event dates, explanatory notes, and assistant names when supplied.
- The user writes or pastes summaries. The app does not generate them or connect to assistant conversations automatically.
- History is not reset at the start of a day or week. It remains available after a long absence.

**Acceptance:** Save two summaries from different assistants and an independent update, then read all three; return to an update older than a month; find a dated issue and surrounding events; follow completion and move events while retaining the current summary and next action.

Sources: `scope.md > The Unique Kernel` and `The Core Loop`.

### Project Notes

- Provide My Notes inside each project for the user's ideas, opinions, and reminders.
- Notes are free text. They require a project, but not a goal, step, or assistant.
- Also provide Notes & updates at each goal and step. The learner can record what happened at that stage, what they encountered, and what they decided. Notes, issues, and summaries are dated and tied to that specific goal or step, with an optional helper. Opening an item reveals its own records; project history also includes them. My Notes remains the space for general project notes.
- Adding a contextual note is independent of completing the work. A completed or removed step retains its notes.
- Keep dated notes available on return; a new note does not erase the previous one.
- Distinguish personal notes from imported assistant summaries. Writing a note does not create a task or achievement automatically.
- An empty notes section is an optional place to write, not a requirement to proceed.

**Acceptance:** Save an opinion in a project with no goals or assistant, return to read it with its date, and add another without losing the first. Neither note changes task status or achievement counts. Add an issue and a later note to one step, and a summary directly to its goal; each appears in the correct local context and the project timeline. Removing/restoring the step preserves those records.

Source: the learner's explicit Project Notes request, extending `scope.md > The Core Loop`.

### Overview and Achievements

- Provide project summaries, active goals, deadlines, planned work, and achievements.
- Today and This Week are views, not retention limits or mandatory review schedules.
- Show completed steps independently of completed goals. Do not combine unlike achievements into a misleading total.
- Do not invent an overall completion percentage for an ongoing project.
- Distinguish work that was planned from work that was actually completed.
- Keep unfinished previously planned work visible as Carried over, following Flexible Planning Rules.

**Acceptance:** A completed step appears under the appropriate achievement date while its goal stays active; a completed goal leaves its project available; opening a project reveals its goals and steps; passing midnight or a week boundary does not silently hide unfinished planned work.

Sources: `scope.md > The POC Boundary` and `What "Working" Looks Like`.

### Local Data and Backup

Accepted during technical planning: run the initial version in a browser on the laptop, with durable data inside the project folder and backup export/restore. Closing and restarting the program must retain saved data. No account, hosting service, or phone synchronization is required.

**Acceptance:** Stop and restart the application process and recover the saved data; export and restore a backup into an isolated test database and compare projects, goals, steps, summaries, notes, and history. The proposed safe-restore mechanics are reviewed in `spec.md`.

## States and Boundaries

- **First use:** Invite the user to add a project. Do not automatically insert real examples discussed in the interview.
- **No goals or steps:** Show the appropriate add action. An empty goal is not automatically complete.
- **No achievements or dates:** Show a calm empty state without fabricated items.
- **Incomplete input:** Require an entity title and retain entered text while showing a field-level error. Helper names and reasons are optional.
- **Cancelled edit:** Keep previously saved content unchanged.
- **Save failure:** Show that saving failed; preserve the draft for retry while the form remains open.
- **Completing a goal with unfinished steps:** Warn about remaining work. The user can move it or proceed while the steps remain visibly unfinished. Do not complete them automatically.
- **Reopening work:** Retain previous completion and subsequent change events.

## Product Decisions

- Ongoing project → goals → steps; goal completion does not close the project.
- Step achievements are dated and visible before a whole goal is finished.
- Goals and steps can evolve without mandatory work templates.
- Independent work and optional assistant context are equally supported.
- Notes, summaries, and problem records are references for returning after any interval.
- English-first application with Arabic support; English judge-facing plans.
- Laptop-only local operation, durable file storage, and export/restore for the initial version.
- Real projects and examples from the interview must not be prepopulated automatically.
- Paused-project steps are excluded from Today/This Week and their goals from Active Goals. Keep the project, history, notes, and achievements available, and retain deadlines with a Paused label.

## What We're Building

Overview and Project Details; manual project, goal, step, summary, issue, and note entry; flexible work changes; dated achievements and history; a next action; optional planning dates and deadlines; local persistence and backup/restore; English and Arabic interface text.

## Deferred From the POC

Automatic assistant integrations and summarization; phone access and synchronization; accounts, team collaboration, and multi-device storage. Drag-and-drop ordering or a sophisticated calendar is not implied by the request for flexibility.

## Possible Later Enhancements

After testing the manual workflow, investigate service integrations that reduce input effort. This does not expand the first version automatically.

## Non-Goals

Executing the tracked work, publishing applications, contacting suppliers, or performing business transactions. No automatic interpretation of arbitrary pasted text, no automatic diagnosis of recorded problems, and no invented project-completion percentage.

Source: `scope.md > Explicitly Cut`.

## Flexible Planning Rules

1. **Optional planning and deadlines:** Select Today or another planned date for a step, change it, or leave it unset. The planned work date is separate from an optional deadline on a project, goal, or step.
2. **Carry unfinished work forward:** Today includes pending steps planned for today or earlier. This Week includes pending work planned through the end of the week, including unfinished work from previous weeks. Label older work Carried over and retain its original date. It stays visible until completed, deferred, or explicitly rescheduled. Moving it to another goal does not hide it if its status/date remain unchanged. Do not create new events or rewrite dates merely because time passes.
3. **Date views:** A week runs Sunday–Saturday. Upcoming covers today through the following six days, with overdue deadlines separate. Undated work is not overdue merely because it has no date. Carried over refers to a planned work date, not necessarily a missed deadline.
4. **Defer without a new date:** Keep the step under its goal as Deferred and clear its planned date. Retain its deadline until the user changes it. Deferral preserves history and does not end the project.
5. **Complete and reopen:** The user controls completion. Warn about unfinished child steps before completing a goal, but allow proceeding while retaining those unfinished steps. Reopening preserves the historical completion event. Count each step at most once in an achievement period even if completed repeatedly, and indicate when it has been reopened.

**Acceptance:** Crossing midnight or Sunday retains carried-over work and its original date; explicit rescheduling updates planned-work views without changing achievement history; deferral removes a step from planned work but retains its deadline; reopening retains the event history and the ongoing project.

6. **Pause and resume:** Temporarily exclude a paused project's steps from Today/This Week and its goals from Active Goals. Keep its card, details, notes, history, and previous achievements available. Upcoming and overdue deadlines remain visible with a Paused label. Do not rewrite step statuses or dates. Resuming restores visibility based on original dates, including carried-over work.

**Pause acceptance:** Pause a project with unfinished scheduled work and a deadline: its work leaves active planning views, the deadline remains labeled Paused, and its history is unchanged. Resume it and verify the original dates determine its planning views.

## Open Questions

No unresolved product decisions remain. Paused-project visibility was explicitly accepted during specification review. During the first visual build review, the learner requested blue styling and contextual goal/step notes, then accepted recoverable removal of steps while keeping their history and notes.

The final name and precise typography/colors may be settled as implementation recommendations. Do not reopen already agreed product behavior.

## Approval

The learner approved the product plan and the proposed flexible defaults, and explicitly requested personal project notes. Later authorized refinements added laptop-only local storage/backup, English-first bilingual UI, carry-over work, and English judge-facing plans. The learner then explicitly accepted the paused-project display rule, resolving that open product decision.

Product approval does not authorize commits, pushes, or publication. Personal learning context and real work data are not public submission artifacts.

## Accepted refinement — 25 October 2026

The learner requested activation of recoverable step removal, a clickable Active Goals metric, and personally chosen project icons. Active Goals opens an all-goals view with total, active, completed, and paused-project counts. Each goal shows its project, current completed/total step ring, and remaining steps. Removed steps are excluded from the ring. A goal with no current steps has an empty ring, not full completion. Finishing current steps closes the ring but does not automatically complete the goal or ongoing project. Selecting a goal opens its project and focuses that goal.

Users choose from eight named line icons when creating a project and may change its icon later from its card or project header. The chosen icon appears in project cards and navigation. Match the accepted reference's light line style with original drawings; do not import reference data/code or change Work Tracker's identity. Keep existing responsive sidebar behavior.
