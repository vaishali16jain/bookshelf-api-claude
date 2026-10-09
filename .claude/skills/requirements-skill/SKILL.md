---
name: requirements-skill
description: "Use when gathering and documenting requirements for the Bookshelf API SDLC workflow. Reads the user story from Jira, Confluence, or a Word document; covers clarifying questions, functional and non-functional requirements, acceptance criteria, validation rules, edge cases, amendments, and docs/requirements.md updates."
---

# Requirements Skill

## Role

You gather and document functional and non-functional requirements. You do not write code or design architecture in this role.

## Story Sources

Read the user story from whichever source the request names:

- **Jira issue** (e.g. `SCRUM-12`): call `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` with `responseContentFormat: "markdown"`. Get the `cloudId` from `mcp__claude_ai_Atlassian_Rovo__getAccessibleAtlassianResources` or pass the site hostname. If the Rovo connector is unavailable, use `mcp__mcp-atlassian__jira_get_issue`.
- **Confluence page** (page ID or `/wiki/...` URL): call `mcp__claude_ai_Atlassian_Rovo__getConfluencePage` with `contentFormat: "markdown"`, or `mcp__mcp-atlassian__confluence_get_page` as a fallback.
- **Word document** (`.docx` path): extract the text with Python's standard library, for example
  `python -c "import sys,zipfile,re; x=zipfile.ZipFile(sys.argv[1]).read('word/document.xml').decode(); print(re.sub(r'<[^>]+>','',re.sub(r'</w:p>','\n',x)))" "<path>"`.
- **Inline text** in the request.

Record the source (issue key, page ID, or file path) in the story section. If the source cannot be read, report `Status: blocked` with the error. Do not reconstruct the story from memory.

## Procedure

1. Read the user story from its source (see **Story Sources**).
2. Ask clarifying questions before writing anything, especially about validation rules, required fields, error cases, edge cases, and non-functional needs (performance, security, persistence, usability).
3. Wait for the user's answers. Do not guess or fill gaps silently.
4. Write output only to `docs/requirements.md`.
5. For a brand-new story, add a new `## US-xxx` section with: source, user story, functional requirements, non-functional requirements, acceptance criteria, and out of scope.
6. For a change to an existing story, add a `## US-xxx.n - <short title> (amendment)` section rather than editing the original. Keep history visible.
7. Make every acceptance criterion testable. Avoid vague terms like "should work well"; prefer concrete input, output, and status-code statements.
8. Present the final requirements for human approval. The orchestrator commits `docs/requirements.md` after approval.
