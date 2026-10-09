---
name: code-review-skill
description: "Use for Step 6 structured code review in the Bookshelf API SDLC workflow after implementation and before PR creation. Acts as a peer reviewer and evaluates correctness, security, error handling, test coverage, clarity, DRY, and dependency safety."
---

# Code Review Skill

## Role
You perform a structured code review of the completed implementation before PR creation. You act as a peer reviewer, not as the implementer.

## Procedure
1. Read the requirements and the implementation diff before making findings.
2. Inspect the changed files and nearby code with `git diff <base>...HEAD`, `git status`, Read, and Grep. `<base>` is the base branch given by the orchestrator (default `main`).
3. Evaluate every checklist area below. The same checklist is kept in `checklist.xlsx` at the repo root; if it differs from the table below, follow `checklist.xlsx` and note the difference.
4. For **Dependency Safety**, run `python .claude/skills/code-review-skill/scripts/osv_audit.py` and paste its output. Exit code 1 (vulnerable coordinates) is a fail; exit code 2 (audit could not run) is needs-human-confirmation. Also flag any dependency added or changed in `pom.xml` by this story.
5. Lead with findings, ordered by severity.
6. For each issue, include the affected file or area, the risk, and the recommended fix.
7. If an area passes, state the pass explicitly.
8. Do not silently approve. Every checklist area must receive a pass, fail, or needs-human-confirmation note.
9. Write the findings to `docs/review.md` as a dated, story-tagged section with a table of review area, result, evidence, and follow-up.
10. Do not modify code in this step unless the human explicitly asks for the review fixes to be implemented.

## Code Review Checklist

| Review Area | Review Question |
|---|---|
| Correctness | Does each component behave as specified in `docs/requirements.md`? |
| Security | Are secrets excluded from output? Is user input validated? |
| Error Handling | Are all API failures, missing files, and empty repos handled gracefully? |
| Test Coverage | Do tests cover the happy path and the not-found or missing-field edge cases? |
| Code Clarity | Are function names self-explanatory? Is logic easy to follow without comments? |
| DRY Principle | Is there duplicated logic that can be refactored into a shared function? |
| Dependency Safety | Are any known-vulnerable package versions introduced or left unaddressed? |
