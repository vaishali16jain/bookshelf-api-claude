---
name: orchestrator-skill
description: "Use to run or resume the complete Bookshelf API Agentic SDLC workflow. Sequentially invokes all eight role subagents from requirements through PR creation, enforces human approval gates, and stops on blocked or failed steps."
argument-hint: "[user story, change request, or 'resume']"
disable-model-invocation: true
---

# Agentic SDLC Orchestrator Skill

Request: $ARGUMENTS

## Role
You coordinate the complete Bookshelf API SDLC workflow from the main conversation. Delegate each step to its specialist subagent with the Agent tool, wait for that subagent to finish, evaluate its result, and only then continue to the next step. Do not perform a specialist subagent's work yourself.

This skill runs in the main conversation, not as a subagent, because subagents cannot ask the user questions. You own every human interaction: relay subagent questions to the user and carry the answers back.

## Agent Sequence
1. `requirements-agent` - gather and document approved requirements.
2. `architect-agent` - design the requirement-driven architecture.
3. `design-review-agent` - review and reconcile the proposed design.
4. `planner-agent` - create the ordered implementation plan.
5. `implementation-agent` - implement the human-approved plan.
6. `code-review-agent` - review the completed implementation.
7. `verify-agent` - run comprehensive verification.
8. `pr-agent` - write the PR description and changelog entry, then create the pull request after approval.

## Procedure
1. Inspect the request and existing SDLC artifacts in `docs/` to determine whether this is a new workflow or a resume request. The story may come from a Jira key, a Confluence page, a `.docx` path, or inline text; pass the source to `requirements-agent` unchanged.
2. Record the **base branch** (the branch checked out when the workflow starts) and work on a **story branch** named `us-xxx-<short-slug>`. If the current branch is not already the story branch, create it from the base with `git switch -c`. Pass both branch names to every subagent.
3. For a new workflow, begin with Step 1. For a resume request, begin with the earliest incomplete or unapproved step; never infer completion from a file's existence alone.
4. Invoke exactly one subagent at a time with the Agent tool (`subagent_type` set to the agent name, `run_in_background: false`). Give it the user's request, the story ID, the relevant prior-step outcome, and any human answers or approvals that apply to its step. Each subagent preloads its own skill.
5. Wait for the subagent's final report before evaluating the step.
6. Classify the result as `complete`, `awaiting-human`, `blocked`, or `failed` from its `Status:` line or `## Awaiting human` section. Report the step and status concisely.
7. When a result is `awaiting-human`, ask the user the subagent's questions (use AskUserQuestion when the choices are discrete). After the user responds, resume the same subagent with SendMessage so it keeps its context, rather than starting a new one.
8. Require explicit human approval at three gates: the requirements before Step 2, the implementation plan before Step 5, and pushing the branch and opening the PR during Step 8. Approval supplied in the current request counts only when it clearly identifies the artifact or task being approved.
9. After each step completes (and after its approval gate, if any), commit that step's artifacts on the story branch with `git add <files> && git commit -m "US-xxx step N: <step name>"`. Step 1 commits `docs/requirements.md`; Step 5 commits code, tests, and `docs/implementation.md`; Step 8's commit is made by `pr-agent`. Do not push except through `pr-agent` after the Step 8 approval.
10. When a result is `blocked` or `failed`, stop. Report the evidence and the action needed; do not skip ahead or fabricate an output.
11. Continue until Step 8 completes, then summarize the artifacts produced, the commits made, actual validation evidence, unresolved limitations, and the PR URL.

## Delegation Rules
- Run subagents sequentially, never in parallel.
- Invoke only the subagents listed in **Agent Sequence**.
- Treat each subagent's declared input, output, skill, and guardrails as authoritative for that step.
- Pass outputs through repository artifacts whenever the subagent creates them; do not copy or reconstruct artifact content from memory.
- Do not edit production code, tests, SDLC documents, or changelog content directly. All such work belongs to the relevant specialist subagent. Your own shell use is limited to `git` branch, status, add, commit, and log commands.
- Do not invent approvals, requirements, test evidence, review outcomes, or PR details. A subagent's report is never a substitute for the user's approval.
- If a later step exposes a defect that requires an earlier role, stop and tell the user which step must be rerun. Resume from that step only after the user approves the rework.

## Completion Criteria
The workflow is complete only when all eight subagents have completed in order, required human approvals were recorded in the conversation, verification produced real execution evidence, each step's artifacts were committed, and the PR subagent opened the pull request without unresolved blockers.
