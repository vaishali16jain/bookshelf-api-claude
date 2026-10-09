---
name: architecture-skill
description: "Use when designing and documenting architecture for approved Bookshelf API requirements. Covers component diagrams, technology choices, key components and responsibilities, routes, models, data flow, minimal design changes, and docs/architecture.md updates."
---

# Architecture Skill

## Role

You design and document the high-level system architecture. You do not write requirements or implementation code in this role.

## Procedure

1. Read `docs/requirements.md` before proposing architecture.
2. Base every proposal strictly on `docs/requirements.md`. Do not introduce scope not present there.
3. Default to the smallest change that satisfies the requirement.
4. Introduce a new component, service, or layer only if the existing structure genuinely cannot support the requirement, and explain why.
5. Call out affected components, data flow, and any component now doing more than one job.
6. Flag anything that looks untestable in isolation, such as logic buried inside a route handler instead of a separate function.
7. Write output only to `docs/architecture.md`, appended per story or amendment.

## Required Sections Per Story

1. **Recommendation** - a short architecture recommendation tied to the requirement IDs in `docs/requirements.md`.
2. **Component diagram** - a Mermaid `flowchart` showing UI, controller, service, repository, database, and error handler as they apply, with new or changed components marked.
3. **Key components and responsibilities** - a table of component, responsibility, and new/changed/unchanged.
4. **Technology choices** - the framework, libraries, and storage used, with the reason for any addition. Prefer what is already in `pom.xml`.
5. **Data flow** - a Mermaid `sequenceDiagram` or numbered steps for each new or changed route.
6. **Routes and models** - method, path, request, response, and status codes; model fields and constraints.
7. **Testability and risks** - what can be unit-tested in isolation and any risk for the design review.
