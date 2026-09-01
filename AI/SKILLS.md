# SKILLS.md

> SIGAP AI Knowledge Base
>
> Version: 1.0
>
> This document serves as the primary knowledge base for AI Coding Agents working on the SIGAP project.
>
> The purpose of this file is to provide business context, development knowledge, architectural principles, and engineering guidelines so that every generated code follows the same understanding as the development team.

---

# 1. Project Identity

## Project Name

SIGAP

**Sistem Informasi dan Kesiapsiagaan Bencana Desa Cibenda**

---

## Project Type

Village Disaster Decision Support Dashboard

---

## Development Type

Full Stack Web Application

---

## Project Status

Capstone Project

---

# 2. Project Vision

SIGAP aims to become the primary disaster preparedness dashboard for Desa Cibenda by integrating official disaster information into a simple, accessible, and easy-to-understand platform.

The platform focuses on helping local communities and village authorities make faster and more informed decisions during disaster situations.

---

# 3. Mission

The mission of SIGAP is to:

- Centralize disaster information.
- Simplify BMKG information for local communities.
- Improve disaster preparedness.
- Support village officials in disseminating disaster information.
- Provide a single source of truth for weather and disaster monitoring within Desa Cibenda.

---

# 4. Business Domain

SIGAP operates in the Disaster Risk Reduction (DRR) and Decision Support System domain.

The system does NOT detect disasters.

The system does NOT predict disasters.

The system does NOT replace BMKG.

Instead, SIGAP consumes official information from trusted government services and transforms it into actionable information for village communities.

---

# 5. Project Objectives

The objectives of SIGAP are:

- Monitor local weather conditions.
- Monitor earthquake information.
- Monitor tsunami information.
- Display evacuation routes.
- Display evacuation points.
- Provide emergency contacts.
- Provide simplified disaster information.
- Support village-level disaster response.

---

# 6. Core Principles

Every feature inside SIGAP should follow these principles.

## Principle 1

Official data only.

All disaster-related information must originate from trusted official sources.

Examples:

- BMKG
- Government Disaster Agencies
- Other approved government services

---

## Principle 2

Decision Support.

SIGAP supports decision making.

SIGAP does NOT make decisions.

The final decision always belongs to authorized government officials.

---

## Principle 3

Simple Information.

Information should always be transformed into language that is understandable by ordinary citizens.

Avoid technical jargon whenever possible.

---

## Principle 4

Accessibility.

The dashboard must remain usable for:

- Elderly users
- Village officials
- Citizens with low digital literacy

---

## Principle 5

Trust.

Never display information whose source cannot be verified.

---

# 7. Project Scope

SIGAP focuses only on Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran.

Business logic should always prioritize this operational area.

Future expansion to other villages is possible but is outside the MVP scope.

---

# 8. Business Philosophy

SIGAP exists because official disaster information is often:

- scattered across multiple websites
- difficult to understand
- not village-oriented
- not actionable

SIGAP transforms official information into a village-oriented dashboard that is easy to access and understand.

---

# 9. What SIGAP IS

SIGAP is:

- Disaster Monitoring Dashboard
- Weather Monitoring Dashboard
- Village Information Dashboard
- Decision Support System
- Information Aggregator
- Public Information Platform

---

# 10. What SIGAP IS NOT

SIGAP is NOT:

- Earthquake prediction system
- Tsunami prediction system
- Early Warning System
- IoT monitoring platform
- Machine Learning project
- Disaster simulation software
- Emergency dispatch system
- Social media platform

Never generate code that changes these boundaries.

---

# 11. Success Criteria

A successful implementation of SIGAP should allow users to:

- View weather information quickly.
- View earthquake information.
- View tsunami status.
- Read simplified disaster summaries.
- Find evacuation routes.
- Find evacuation points.
- Contact emergency services.
- Receive validated disaster broadcasts from village authorities.

---

# 12. Engineering Goals

The engineering team values:

- Simplicity
- Maintainability
- Readability
- Scalability
- Reliability

Every implementation should prioritize maintainability over unnecessary complexity.

---

# 13. User Knowledge

SIGAP serves two categories of users.

## Public Users

Public users include:

- Residents of Desa Cibenda
- Fishermen
- Farmers
- Visitors currently staying in Desa Cibenda

Public users do NOT need authentication.

The dashboard is designed to provide immediate access to disaster information without requiring login.

Public users are allowed to:

- View weather information
- View weather forecast
- View earthquake information
- View tsunami status
- Read disaster summaries
- View evacuation routes
- View evacuation points
- View emergency contacts
- Read disaster preparedness guidelines

Public users are NOT allowed to:

- Modify any data
- Access the admin dashboard
- Validate disaster broadcasts
- Manage announcements

---

## Admin Users

Admin users represent village authorities.

Examples:

- Kepala Desa
- Perangkat Desa
- Village Operators
- Authorized Disaster Response Officers

Authentication is required.

Admin users are responsible for maintaining information and validating disaster broadcasts.

---

# 14. Business Workflow

SIGAP follows a centralized information workflow.

Official information is received from trusted external services.

The information is processed inside SIGAP.

Village authorities validate critical disaster information.

Validated information is then delivered to citizens.

General workflow:

Official Source

↓

SIGAP Backend

↓

Decision Engine

↓

Admin Validation

↓

Citizen Information

---

# 15. Disaster Monitoring Workflow

The monitoring process starts by retrieving disaster information from BMKG.

The backend periodically synchronizes data.

Whenever a new earthquake or tsunami information is detected, the system evaluates the event.

Evaluation includes:

- Magnitude
- Epicenter
- Distance from Pangandaran
- Tsunami information
- Official BMKG status

If the event does not affect Pangandaran, the system stores it only as historical information.

If the event potentially affects Pangandaran, the event enters the Disaster Evaluation process.

---

# 16. Broadcast Workflow

Broadcasting disaster information follows a controlled approval process.

The workflow is intentionally designed to reduce misinformation and public panic.

Workflow:

BMKG

↓

SIGAP receives official data

↓

Evaluate disaster threshold

↓

Determine impact on Pangandaran

↓

Notify village authorities

↓

Village authority reviews the information

↓

Authority selects disaster status

↓

Broadcast to citizens

↓

Store broadcast history

Village authorities remain responsible for validating disaster broadcasts before information reaches citizens.

---

# 17. Disaster Evaluation

Every incoming disaster event must be evaluated.

Evaluation considers:

- Magnitude
- Epicenter
- Distance from Pangandaran
- Tsunami status
- Official BMKG warning level

The evaluation process does NOT modify BMKG information.

SIGAP only classifies the event according to predefined business rules.

---

# 18. Decision Engine

The Decision Engine determines the internal disaster status used by SIGAP.

The Decision Engine never predicts disasters.

Its purpose is to classify official BMKG information into a simpler village-level status.

Decision Engine inputs include:

- Earthquake magnitude
- Epicenter location
- Earthquake depth
- Distance from Pangandaran
- Tsunami warning status

Decision Engine outputs include:

- Normal
- Waspada
- Siaga
- Awas

These outputs follow SIGAP business rules while remaining aligned with official BMKG terminology.

---

# 19. Alert Rules

SIGAP follows official BMKG terminology.

Internal alert levels are:

🟢 Normal

Normal condition.

No significant disaster information affecting Pangandaran.

Citizens continue daily activities.

---

🟡 Waspada

Minor disaster event.

Citizens are advised to remain informed.

No evacuation required.

---

🟠 Siaga

Potentially dangerous situation.

Village authorities prepare evacuation procedures.

Citizens should prepare for possible evacuation.

---

🔴 Awas

Highest disaster level.

Immediate evacuation should follow official government instructions.

Village authorities immediately activate emergency procedures.

---

Alert rules should always remain configurable.

Never hardcode thresholds directly inside business logic.

Threshold values should be stored in configuration or environment variables whenever possible.

---

# 20. Threshold Knowledge

SIGAP evaluates disasters using multiple parameters.

Magnitude alone is NOT sufficient.

The evaluation may consider:

- Earthquake magnitude
- Earthquake depth
- Epicenter location
- Distance from Pangandaran
- Tsunami warning level

Future versions may include:

- Wind speed
- Rainfall intensity
- Flood warning
- High wave warning

The evaluation process should remain extensible.

---

# 21. Database Knowledge

SIGAP uses PostgreSQL as the primary relational database.

Database access is exclusively handled through Prisma ORM.

Direct SQL queries should be avoided unless absolutely necessary and explicitly approved.

The database stores only application-specific data.

External data obtained from BMKG should generally not be stored permanently unless it serves one of the following purposes:

- Disaster history
- Broadcast history
- Audit trail
- Analytics
- System logging

The database should remain normalized while keeping the schema easy to understand.

All schema changes must first be reflected in DatabaseDesign.md before implementation.

---

# 22. Repository Pattern

SIGAP follows the Repository Pattern.

Repository Pattern separates business logic from database implementation.

Each layer has a single responsibility.

Architecture:

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

## Route Responsibilities

Routes should only:

- Register endpoints
- Apply middleware
- Forward requests to controllers

Routes should never contain business logic.

---

## Controller Responsibilities

Controllers should:

- Receive HTTP requests
- Validate request format
- Call services
- Return standardized HTTP responses

Controllers should remain lightweight.

Controllers should never:

- Query the database directly
- Execute business logic
- Perform complex calculations

---

## Service Responsibilities

Services are responsible for business logic.

Examples include:

- Disaster evaluation
- Broadcast workflow
- Weather summarization
- Authorization checks
- Validation of business rules

Services coordinate repositories.

Services do not know how the database works internally.

---

## Repository Responsibilities

Repositories are responsible only for data access.

Repositories communicate exclusively with Prisma.

Repositories should:

- Read data
- Insert data
- Update data
- Delete data

Repositories should never:

- Perform business decisions
- Call external APIs
- Validate business rules

Repositories should remain stateless.

---

## Prisma Responsibilities

Prisma is the only component allowed to communicate directly with PostgreSQL.

No Prisma query should exist outside repositories.

---

# 23. Backend Development Philosophy

The backend is responsible for:

- Business rules
- API endpoints
- Authentication
- Authorization
- Database operations
- External API integration
- Broadcast workflow
- Disaster evaluation

The backend should never contain frontend-specific logic.

---

# 24. Frontend Development Philosophy

Frontend focuses on presentation.

Responsibilities include:

- Displaying information
- User interaction
- Form validation
- Responsive layouts
- Calling backend APIs

Frontend should never:

- Evaluate disasters
- Predict disasters
- Store business rules
- Calculate disaster status

Business logic always belongs to the backend.

---

# 25. External API Knowledge

SIGAP consumes several external services.

Examples include:

- BMKG
- OpenStreetMap
- AI API (optional)

External APIs are considered unreliable by nature.

Therefore:

- Every request should handle failure gracefully.
- Timeouts must be considered.
- Retry mechanisms should be implemented where appropriate.
- API responses should be validated before processing.

Never assume external APIs always return valid data.

---

# 26. BMKG Integration

BMKG is the primary source of disaster information.

SIGAP acts only as a consumer.

SIGAP must never modify official BMKG data.

The backend may:

- Transform data
- Simplify language
- Categorize information
- Cache responses when appropriate

The backend must never:

- Predict disasters
- Estimate earthquake intensity
- Generate tsunami warnings
- Alter official disaster information

---

# 27. AI Summary Knowledge

Artificial Intelligence is optional.

Its responsibility is limited to simplifying official information.

AI may generate:

- Weather summaries
- Safety recommendations
- Human-readable explanations

AI must never:

- Predict disasters
- Override BMKG information
- Generate fake alerts
- Change official disaster status

AI should always state information based on official sources.

---

# 28. Error Handling Philosophy

Errors are expected.

The application should fail gracefully.

Every API endpoint should return meaningful error responses.

Examples include:

- Validation errors
- Authentication errors
- Authorization errors
- Resource not found
- External API failure
- Internal server errors

Internal implementation details should never be exposed to end users.

---

# 29. Logging Philosophy

Logging is important for debugging and auditing.

Important events include:

- Admin login
- Disaster broadcast
- Broadcast validation
- External API failure
- Database errors
- Authentication failures

Logs should never contain:

- Passwords
- Access tokens
- Sensitive personal information

Logging should assist developers without compromising user privacy.

---

# 30. Security Principles

Security should be considered from the beginning of development.

Basic principles include:

- Validate every request.
- Sanitize input.
- Use environment variables for secrets.
- Never hardcode credentials.
- Hash passwords securely.
- Protect admin endpoints.
- Apply role-based authorization.

Sensitive information should never appear in API responses.

---

# 31. Configuration Management

Application configuration should be centralized.

Examples include:

- Database connection
- API keys
- JWT secret
- Broadcast thresholds
- External API URLs

Configuration values should come from environment variables whenever possible.

Business thresholds should remain configurable without modifying application code.

---

# 32. API Design Principles

SIGAP follows RESTful API principles.

Every endpoint should represent a resource.

Examples:

GET /api/weather

GET /api/earthquakes

GET /api/evacuation-points

POST /api/announcements

PUT /api/emergency-contacts/:id

DELETE /api/announcements/:id

Endpoints should use plural nouns whenever possible.

Avoid verbs in endpoint names.

Good examples:

GET /api/earthquakes

GET /api/announcements

POST /api/broadcasts

Bad examples:

GET /api/getWeather

POST /api/createAnnouncement

---

# 33. API Response Standard

Every API response should use a consistent structure.

Successful response:

```json
{
    "success": true,
    "message": "Request completed successfully.",
    "data": {}
}
```

Failed response:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {}
}
```

The response format should remain consistent across all endpoints.

---

# 34. Validation Strategy

Every incoming request must be validated.

Validation occurs before business logic execution.

Typical validation includes:

- Required fields
- Data types
- String length
- Enum validation
- Numeric ranges
- Date validation

Business validation belongs inside Services.

Request validation belongs inside Validators or Middleware.

Never trust client-side validation alone.

---

# 35. Folder Structure Knowledge

Backend structure:

```

backend/
│
├── prisma/
│
├── src/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── repositories/
│ ├── routes/
│ ├── services/
│ ├── types/
│ ├── utils/
│ ├── validators/
│ └── app.ts
│
├── .env
├── package.json
└── tsconfig.json

```

Frontend structure:

```

frontend/
│
├── public/
├── src/
│
├── api/
├── assets/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── types/
├── utils/
│
└── App.tsx

```

Maintain this structure unless the development team explicitly decides otherwise.

---

# 36. Component Philosophy

Frontend components should follow these principles.

Reusable

Create reusable UI components whenever possible.

Single Responsibility

Each component should have one primary responsibility.

Composable

Small components are preferred over large components.

Readable

Component names should clearly describe their purpose.

Examples:

WeatherCard

EarthquakeCard

StatusBadge

EmergencyContactCard

BroadcastBanner

Avoid generic names such as:

Component1

Box

Item

Widget

---

# 37. UI Philosophy

SIGAP is designed primarily for village communities.

The interface should emphasize clarity over aesthetics.

Design priorities:

- Large readable typography
- High color contrast
- Simple navigation
- Minimal distractions
- Clear visual hierarchy

The dashboard should remain accessible for:

- Elderly users
- Village officers
- Users with limited digital literacy

Avoid:

- Excessive animations
- Complex dashboards
- Hidden navigation
- Unnecessary visual effects

---

# 38. Design Source of Truth

UI implementation follows the approved design provided by the development team.

Design sources may include:

- Google Stitch
- Dribbble references
- Internal UI guidelines

Claude should implement the approved design.

Do not redesign layouts unless explicitly requested.

Improvements are limited to:

- Responsiveness
- Accessibility
- Performance
- Code quality

Visual redesign requires developer approval.

---

# 39. Documentation Policy

Documentation is part of development.

Whenever a significant change occurs, update the relevant documentation.

Examples include:

- Database schema changes
- New API endpoints
- New business rules
- Folder structure changes

Documentation should remain synchronized with implementation.

---

# 40. Testing Philosophy

Code should be written with testing in mind.

Every endpoint should be easy to test independently.

Business logic should remain isolated from HTTP implementation whenever possible.

The development team primarily performs:

- Manual Testing
- API Testing
- Exploratory Testing

Future automated testing may include:

- Unit Testing
- Integration Testing

---

# 41. Performance Principles

Prefer simple and maintainable solutions.

Avoid premature optimization.

Performance improvements should not sacrifice readability.

Examples:

- Avoid unnecessary database queries.
- Select only required columns.
- Use pagination for large datasets.
- Cache external API responses when appropriate.

---

# 42. Code Quality Principles

Generated code should be production-ready.

Characteristics include:

- Readable
- Maintainable
- Consistent
- Modular
- Strongly typed
- Well documented

Avoid:

- Duplicate logic
- Magic numbers
- Hardcoded strings
- Deeply nested conditions
- Long functions

---

# 43. Definition of Done

A feature is considered complete only if all of the following conditions are satisfied.

Functional

- Business requirements are implemented.
- Feature behaves as expected.

Code Quality

- Follows Repository Pattern.
- Uses TypeScript correctly.
- No unnecessary complexity.

Database

- Schema follows DatabaseDesign.md.
- Migration completed when required.

API

- Endpoint follows API standards.
- Validation implemented.
- Error handling implemented.

Documentation

- Documentation updated if necessary.

Review

- Ready for developer review.

---

# 44. AI Collaboration Principles

Claude acts as a software engineer assisting the development team.

Before generating code:

- Understand the business requirement.
- Read relevant documentation.
- Follow project architecture.
- Reuse existing code whenever possible.

Never:

- Invent undocumented features.
- Ignore project conventions.
- Modify architecture without approval.
- Create unnecessary abstractions.

If project information is incomplete:

Stop implementation.

Explain what information is missing.

Request clarification before proceeding.

---

# 45. Final Engineering Guideline

Always remember:

The goal of SIGAP is not simply to build a web application.

The goal is to build a reliable, maintainable, and user-friendly disaster decision support platform that helps the people and local government of Desa Cibenda access trusted information from official sources.

Every implementation should prioritize:

- Simplicity
- Reliability
- Consistency
- Accessibility
- Maintainability

These principles take precedence over unnecessary complexity or over-engineering.