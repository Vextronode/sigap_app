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