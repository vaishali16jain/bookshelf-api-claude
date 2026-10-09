# Bookshelf API — Agentic SDLC Capstone

A minimal Java/Spring Boot prototype (US-101: add + view books) set up as
the starting point for the capstone's 8-step Agentic SDLC exercise.

Books are stored in a local file-based H2 database under `data/` and remain
available after the application restarts.

Open `http://localhost:8080/` in a browser to use the bookshelf UI. It lists
saved books and provides a form for calling the `POST /books` API.

## Run it

```bash
mvn spring-boot:run
```

Then, in another terminal:
```bash
curl -X POST localhost:8080/books -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Frank Herbert"}'

curl localhost:8080/books
```

## Run the tests

```bash
# All tests (unit + integration + functional/UI)
mvn test

# Integration tests only (BookControllerTest, MockMvc)
mvn test -Dtest=BookControllerTest

# Functional/automation tests only (BookApiFunctionalTest, REST Assured + Selenium, TestNG)
mvn test -Dtest=BookApiFunctionalTest
```

## What's already here
- `src/` — the prototype implementation of US-101 (intentionally minimal,
  with a known validation gap left in on purpose — see `docs/design-review.md`)
- `docs/requirements.md` — US-101 written up as your baseline story
- `docs/` — SDLC artifacts produced by each step (architecture, design
  review, implementation plan, implementation, review, verify, PR)
- `CLAUDE.md` — project rules loaded into every Claude Code session
- `.claude/agents/` — eight role subagents, one per SDLC step: requirements,
  architect, design review, planner, implementation, code review, verify, PR
- `.claude/skills/` — the detailed role instructions each subagent preloads,
  plus `orchestrator-skill`, which runs the whole workflow
- `.claude/hooks/` + `.claude/settings.json` — a PreToolUse safety gate
  (blocks destructive commands and secret leakage) and a PostToolUse
  formatter (Spotless for Java, Prettier for web/docs files)
- `.mcp.json` — Jira (`mcp-atlassian`) and GitHub MCP servers; set
  `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, and
  `GITHUB_PERSONAL_ACCESS_TOKEN` in your environment before starting Claude Code

## Next steps
1. Bring in a real requirement change (e.g. "add a read/unread status and
   let users filter by it") and run it through all 8 steps:
   requirements → architecture → design review → planning → implementation
   → code review → verify → PR.
2. Run the whole workflow from Claude Code with:
   ```
   /orchestrator-skill US-103: add a read/unread status and let users filter by it
   ```
   It stops for your answers and for approval of the requirements and the
   implementation plan.
3. To run a single step instead, ask for its subagent, e.g.
   `use the architect-agent for US-103`.
