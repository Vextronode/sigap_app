# CLAUDE.md

> AI Development Guide for SIGAP Project
>
> Version : 1.0

---

# Project Identity

You are developing **SIGAP (Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda)**.

SIGAP is a Decision Support Dashboard that integrates official disaster and weather information from BMKG and other trusted sources into a simple web platform for the people and local government of Desa Cibenda, Pangandaran.

SIGAP IS NOT:

- An Early Warning System (EWS)
- A Disaster Prediction System
- An IoT Monitoring System
- A Machine Learning Project

Always respect this business scope.

---

# Documentation Priority

Before writing any code, always understand the project through the following documents.

Read them in this order:

1. docs/PRD.md
2. docs/DatabaseDesign.md
3. AI/SKILLS.md
4. AI/CodingConvention.md
5. AI/BackendGuide.md
6. docs/API-Spec.md

Never ignore these documents.

If generated code conflicts with documentation, documentation always wins.

---

# Tech Stack

Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Map

- Leaflet
- OpenStreetMap

External APIs

- BMKG
- OpenStreetMap
- AI API (optional)

---

# Architecture Rules

Always follow this architecture.

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL

Never skip layers.

---

# Responsibilities

Route

- Register endpoint
- Apply middleware
- Call controller

Controller

- Receive request
- Validate request
- Call service
- Return HTTP response

Service

- Business logic
- Validation
- Decision making

Repository

- Database access only
- Prisma query only

Prisma

- ORM only

---

# Forbidden

Never:

- Access Prisma directly inside Controller
- Write SQL manually unless explicitly requested
- Put business logic inside Route
- Put business logic inside Repository
- Hardcode BMKG threshold
- Create database tables outside DatabaseDesign.md
- Modify business rules without approval

---

# Development Principles

Always:

- Keep code simple
- Keep code readable
- Keep code modular
- Keep code reusable
- Prefer maintainability over clever code

---

# Database Rules

Always follow DatabaseDesign.md.

Never:

- Rename table
- Rename relation
- Rename enum
- Rename column

without updating documentation first.

---

# API Rules

Every endpoint must:

- Follow REST API convention
- Return consistent JSON response
- Use HTTP Status Code correctly
- Validate input
- Handle error properly

---

# UI Rules

UI follows Google Stitch output.

Google Stitch is the source of truth for UI implementation.

Do not redesign UI unless explicitly requested.

Keep spacing, hierarchy, typography and layout consistent.

Only improve:

- Accessibility
- Responsiveness
- Performance

Never change the overall design language.

---

# Error Handling

Every endpoint must handle:

- Validation Error
- Authentication Error
- Authorization Error
- Not Found
- Internal Server Error

Never expose stack trace to client.

---

# Authentication

Public User

No authentication required.

Admin

Authentication required.

Only admin can:

- Manage announcement
- Manage evacuation routes
- Manage evacuation points
- Manage emergency contacts
- Validate disaster broadcast

---

# Disaster Rules

SIGAP only receives official disaster data.

Source:

- BMKG
- Other trusted government services

Never generate disaster prediction.

Never estimate tsunami risk manually.

---

# Broadcast Rules

Broadcast follows business rules defined in PRD.

AI must never bypass validation workflow.

General flow:

BMKG

↓

SIGAP

↓

Admin Validation

↓

Broadcast to Citizens

---

# Coding Quality

Always produce production-quality code.

Use:

- TypeScript strict mode
- Async/Await
- Proper typing
- Small functions
- Clean architecture

---

# Before Creating New Feature

Always check:

- Is the feature inside PRD?
- Is the database already designed?
- Is API already defined?
- Is business rule documented?

If not,

ask for clarification instead of making assumptions.

---

# Documentation

Whenever creating:

- new endpoint
- database changes
- new module

also update related documentation.

Documentation is part of the implementation.

---

# AI Behavior

Never invent business rules.

Never invent database schema.

Never invent API response.

Never invent thresholds.

If information is missing:

Stop.

Explain what is missing.

Request clarification.

Do not guess.

---

# Goal

Your objective is not only to generate working code.

Your objective is to build SIGAP consistently according to its architecture, documentation, and business requirements.

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.