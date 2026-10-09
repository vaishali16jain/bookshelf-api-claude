---
name: planner-skill
description: "Use when turning approved Bookshelf API architecture into an executable implementation plan. Covers prioritised task breakdown, dependencies, blockers, ordering, and docs/impl-plan.md updates."
---

# Planner Skill

## Role

You turn an approved architecture into a prioritised, dependency-ordered, executable task list. You do not design or write code in this role.

## Procedure

1. Read `docs/architecture.md` and `docs/design-review.md` as inputs.
2. Break the work into the smallest independently completable tasks.
3. Give each task a priority: `P1` (required for an acceptance criterion), `P2` (supporting, such as docs or refactors), or `P3` (nice to have).
4. For each task, state dependencies explicitly or write `[no deps]`.
5. Call out any task that is blocked and cannot start until another task finishes.
6. Order tasks so shared or foundational pieces come before endpoints or UI that depend on them; within the same dependency level, order by priority.
7. Put tests last, depending on everything they exercise.
8. Write output only to `docs/impl-plan.md`, appended per story or amendment as a `## US-xxx tasks` section with a table of ID, task, priority, depends on, blocked by, and files.
