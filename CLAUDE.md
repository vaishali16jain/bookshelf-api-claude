# Bookshelf API — Claude Code Project Instructions

This repo is a Java 17 / Spring Boot prototype used for an Agentic SDLC
capstone exercise. Applies to every Claude Code session here.

## Build and test
- Run the app: `mvn spring-boot:run` (UI at `http://localhost:8080/`)
- All tests: `mvn test`
- Integration tests only: `mvn test -Dtest=BookControllerTest`
- Functional/UI tests only: `mvn test -Dtest=BookApiFunctionalTest` (opens a visible Chrome)
- Format Java: `mvn com.diffplug.spotless:spotless-maven-plugin:apply`
  (runs automatically through the PostToolUse hook after each edit)

## General rules
- This is a learning project — favor clear, idiomatic Java over clever code.
- Do not add persistence (database, files) unless a requirement in
  `docs/requirements.md` explicitly calls for it.
- Every new endpoint must have a corresponding entry in `docs/requirements.md`
  before implementation begins.
- Never invent requirements — if something is ambiguous, ask.
- Keep `docs/architecture.md`, `docs/design-review.md`, and
  `docs/impl-plan.md` in sync with the code. If you change a route or model,
  say so and offer to update the relevant doc.

## Agentic SDLC: subagents and skills
Run the full workflow with `/orchestrator-skill <story or request>`. It runs in
the main conversation and delegates each step to a subagent in `.claude/agents/`.
Each subagent preloads its role skill from `.claude/skills/`:

| Step | Subagent (`.claude/agents/`) | Skill (`.claude/skills/`) | Output |
|---|---|---|---|
| Full workflow | — (main conversation) | `orchestrator-skill` | status per step |
| 1. Requirements | `requirements-agent` | `requirements-skill` | `docs/requirements.md` |
| 2. Architecture | `architect-agent` | `architecture-skill` | `docs/architecture.md` |
| 3. Design Review | `design-review-agent` | `design-review-skill` | `docs/design-review.md` |
| 4. Implementation Planning | `planner-agent` | `planner-skill` | `docs/impl-plan.md` |
| 5. Implementation | `implementation-agent` | `implementation-skill` | code, tests, `docs/implementation.md` |
| 6. Review | `code-review-agent` | `code-review-skill` | `docs/review.md` |
| 7. Verify | `verify-agent` | `verify-skill` | `docs/verify.md` |
| 8. PR Using Agentic SDLC | `pr-agent` | `pr-skill` | `docs/pr.md`, `CHANGELOG.md` |

A single step can also be run directly, e.g. "use the architect-agent for US-103"
or `/architecture-skill` to run that role in the main conversation.

## Hooks and MCP
- `.claude/settings.json` registers the hooks in `.claude/hooks/`:
  - PreToolUse (`pre-tool-use.js`) blocks destructive shell commands and secret leakage.
  - PostToolUse (`post-tool-use.js`) formats edited files.
- `.mcp.json` defines the `mcp-atlassian` (Jira) and `github` MCP servers. Their
  credentials come from the `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, and
  `GITHUB_PERSONAL_ACCESS_TOKEN` environment variables. Never read or print `.env`.
