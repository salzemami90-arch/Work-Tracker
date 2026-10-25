---
doc: scope
status: approved
---

# Work Tracker — Project Scope

Working title. A personal dashboard that helps a busy project owner return to any project, understand its latest state, and choose the next step—even when plans change or work is spread across different AI assistants.

## The Unique Kernel

The tracker preserves both the current plan and the story behind it: what was intended, what appeared during the work, what was completed and when, and why a task moved or a project paused. Work completed independently is fully supported; an assistant name is optional context.

## Who It's For

A person managing ongoing projects, business paperwork, small-business work, and competition deadlines. Today, they reconstruct progress from separate conversations and notes. They need an overview that connects goals, remaining work, dates, achievements, and the reasons behind changes.

## The Core Loop

Open a project and read its latest summary and next action. Write goals and steps directly, or paste points prepared with an external assistant. After working, record progress, new discoveries, and plan changes. Return later to the current state and its chronological history.

The initial version uses manual entry. It does not automatically read assistant accounts, interpret arbitrary pasted text, or turn a summary into tasks. A project can be created and managed entirely without an assistant.

## Inspiration & Identity

A calm, comfortable, organized interface that makes progress visible and helps the user choose what to work on. The final product name, exact colors, and fonts were not chosen during scope. Review-page styling is not itself an approved application design.

## Why This Matters to the Learner

The practical need is to remember where work stopped without rebuilding the context from multiple conversations. Seeing completed steps also makes progress visible before a whole goal is finished.

## What "Working" Looks Like

In a short demonstration, the user opens a project with a goal and steps, records progress, adds a newly discovered step with a reason, and returns to see what is complete, what remains, and what to do next.

The demonstration must work without an assistant name. Achievements come from recorded completions, not an invented completion percentage for an ongoing project. Demonstration data is fictional and clearly labeled; it does not claim to verify the learner's real projects.

## The POC Boundary

A small personal proof of concept with:

- Projects with a current state, summary, goals, and next action, including a paused state with a reason.
- Work steps with completion dates, remaining work, optional assistant context, and dated explanations of changes.
- A compact overview of projects, recorded deadlines, planned work, and achievements.
- A history that survives changes to the current plan.

The PRD defines the concrete behavior; the technical specification defines implementation. The course targets a short learning experience. If the real implementation exceeds that size, revisit the plan with the learner rather than silently removing approved behavior.

## Later

- Service integrations to collect and summarize sessions automatically.
- Further capabilities based on real use of the initial interface.

## Explicitly Cut

- Reading assistant accounts or automatically analyzing pasted summaries in the first version. The user writes or pastes prepared points manually.
- Executing the projects' work from this tracker, such as publishing an application, contacting suppliers, or completing administrative transactions.

## Delivery Context

The course submission requires a short demonstration video and a public GitHub repository. Deployment is optional. Commit, push, and publication each require the learner's explicit authorization. Approval of this scope does not grant those permissions.

Judge-facing planning documents and diagrams are in English. The personal learner profile and real working data are excluded from public delivery. Examples discussed during planning are context, not instructions to prepopulate actual projects.
