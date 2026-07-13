# BackendGuide.md

> SIGAP Backend Engineering Guide
>
> Version 1.0

---

# 1. Purpose

This document defines the backend engineering standards for the SIGAP project.

It serves as the primary implementation guide for developers and AI coding agents to ensure that backend development remains consistent, maintainable, and aligned with the project's architecture.

This guide complements:

- PRD.md
- DatabaseDesign.md
- SoftwareArchitecture.md
- SKILLS.md

---

# 2. Backend Technology Stack

SIGAP backend is built using the following technologies.

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| TypeScript | Programming Language |
| Prisma ORM | Database ORM |
| PostgreSQL | Relational Database |
| JWT | Admin Authentication |
| bcrypt | Password Hashing |
| dotenv | Environment Configuration |

Only these technologies should be used unless explicitly approved by the development team.

---

# 3. Backend Architecture

The backend follows a layered architecture.

```

HTTP Request

↓

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

```

Each layer has a single responsibility.

Business logic must never bypass the Service layer.

---

# 4. Design Principles

The backend follows several engineering principles.

## Single Responsibility

Each module should perform only one responsibility.

---

## Separation of Concerns

Business logic, database logic, routing, and validation must remain separated.

---

## DRY

Avoid duplicated code.

Create reusable utilities whenever appropriate.

---

## KISS

Keep implementations simple.

Avoid unnecessary abstraction.

---

## Readability

Code should prioritize readability over cleverness.

Future maintainability is more important than writing fewer lines of code.

---

# 5. Folder Structure

```

backend/

├── prisma/
│
├── src/
│
├── config/
│
├── controllers/
│
├── middleware/
│
├── repositories/
│
├── routes/
│
├── services/
│
├── validators/
│
├── utils/
│
├── types/
│
├── constants/
│
├── app.ts
│
└── server.ts

```

Every folder has a clearly defined responsibility.

Do not create additional folders unless necessary.

---

# 6. Layer Responsibilities

## Routes

Responsible for:

- endpoint registration
- middleware assignment

Routes must never contain business logic.

---

## Controllers

Responsible for:

- receiving requests
- returning responses
- calling services

Controllers should remain thin.

---

## Services

Responsible for:

- business rules
- disaster workflow
- weather processing
- AI summary workflow
- broadcast workflow

Most project logic belongs here.

---

## Repositories

Responsible for:

- Prisma queries
- CRUD operations

Repositories should never contain business logic.

---

## Prisma

Responsible for database communication.

Prisma should never be called outside repositories.

---

# 7. Request Lifecycle

Every incoming HTTP request should follow the same lifecycle.

```
Client Request
      │
      ▼
Express Route
      │
      ▼
Middleware
      │
      ▼
Validator
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
      │
      ▼
Response
```

Each request should pass through every required layer.

Never skip layers to access the database directly.

---

# 8. API Response Standard

All API endpoints should return a standardized JSON response.

## Success Response

```json
{
  "success": true,
  "message": "Weather data retrieved successfully.",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

---

## Pagination Response

```json
{
  "success": true,
  "message": "Earthquake history retrieved successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

Every endpoint should follow the same response format.

---

# 9. HTTP Status Codes

The backend should use standard HTTP status codes.

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

Avoid returning HTTP 200 for failed requests.

---

# 10. Error Handling

Errors should always be handled gracefully.

Expected errors include:

- Invalid request body
- Invalid query parameters
- Missing resources
- Authentication failure
- Authorization failure
- Database errors
- External API failure
- Internal server errors

The backend should never expose:

- SQL queries
- Prisma errors
- Stack traces
- Environment variables
- Internal file paths

Unexpected errors should be logged internally and return a generic error response to the client.

---

# 11. Validation Strategy

Every incoming request must be validated.

Validation should occur before reaching business logic.

Validation includes:

- Required fields
- Data types
- Email format
- Password length
- Numeric ranges
- Enum values
- UUID format (if applicable)

Business rule validation belongs inside the Service layer.

Request structure validation belongs inside Validators or Middleware.

Never trust client-side validation.

---

# 12. Middleware

Middleware should be responsible for cross-cutting concerns.

Examples include:

- Authentication
- Authorization
- Request logging
- Rate limiting
- CORS
- Error handling

Middleware should never contain business logic.

---

# 13. Authentication

Only administrators require authentication.

Public users can access all public disaster information without logging in.

Authentication uses:

- JWT Access Token
- bcrypt password hashing

Authentication flow:

```
Admin Login

↓

JWT Generated

↓

Client Stores Token

↓

Protected Request

↓

JWT Verification

↓

Access Granted
```

Passwords must never be stored in plain text.

---

# 14. Authorization

Authentication and Authorization are different concepts.

Authentication verifies identity.

Authorization verifies permissions.

Every protected endpoint must verify both.

Role-based access control should be implemented.

Current roles:

- Admin

Future roles may include:

- Super Admin
- Operator
- BPBD Officer

Authorization logic should remain extensible.

---

# 15. Public Access

The following endpoints should remain publicly accessible.

Examples:

GET /weather

GET /forecast

GET /earthquakes

GET /tsunami

GET /evacuation-points

GET /evacuation-routes

GET /emergency-contacts

GET /announcements

These endpoints should not require authentication.

---

# 16. Protected Access

Administrative endpoints require authentication.

Examples:

POST /admin/login

POST /admin/announcements

PUT /admin/announcements/:id

DELETE /admin/announcements/:id

POST /admin/broadcast

PUT /admin/emergency-contacts/:id

POST /admin/evacuation-points

DELETE /admin/evacuation-points/:id

Unauthorized users must receive HTTP 401 or HTTP 403.

---

# 17. Authorization Matrix

| Feature | Public | Admin |
|----------|:------:|:-----:|
| View Weather | ✅ | ✅ |
| View Forecast | ✅ | ✅ |
| View Earthquakes | ✅ | ✅ |
| View Tsunami Status | ✅ | ✅ |
| View Evacuation Routes | ✅ | ✅ |
| View Emergency Contacts | ✅ | ✅ |
| View Announcements | ✅ | ✅ |
| Manage Announcements | ❌ | ✅ |
| Manage Evacuation Points | ❌ | ✅ |
| Manage Emergency Contacts | ❌ | ✅ |
| Broadcast Disaster Information | ❌ | ✅ |
| Validate Disaster Alerts | ❌ | ✅ |

This authorization matrix serves as the reference for all backend permission checks.

---

# 18. BMKG Integration Rules

BMKG is the primary and authoritative source for weather, earthquake, and tsunami information.

SIGAP acts solely as an information aggregator and decision support system.

SIGAP must never:

- Predict disasters
- Modify official BMKG data
- Generate independent disaster warnings
- Replace official BMKG announcements

The backend may:

- Retrieve official BMKG data
- Cache API responses
- Transform data into a simpler format
- Classify events according to SIGAP Alert Rules
- Generate AI summaries based on official information

All BMKG data should include:

- Event timestamp
- Event location
- Source
- Retrieval timestamp

Every BMKG response should be validated before processing.

If BMKG data is incomplete or unavailable, the system should continue operating without crashing.

---

# 19. External API Strategy

External APIs are outside the control of SIGAP.

Every external API request must assume the possibility of:

- Timeout
- Invalid response
- Rate limiting
- Network failure
- Temporary downtime

Recommended strategy:

1. Validate response format.
2. Handle timeout.
3. Retry when appropriate.
4. Log failures.
5. Return graceful fallback responses.

The frontend should never communicate directly with BMKG.

All external API communication must pass through the backend.

---

# 20. Disaster Decision Engine

The Decision Engine evaluates disaster events before initiating broadcasts.

Inputs include:

- Earthquake magnitude
- Earthquake depth
- Epicenter coordinates
- Distance from Pangandaran
- Tsunami warning status
- Official BMKG information

The Decision Engine does NOT predict disasters.

Its responsibility is to classify official information into the SIGAP Alert Levels.

Alert Levels:

🟢 Normal

🟡 Waspada

🟠 Siaga

🔴 Awas

Threshold values must remain configurable.

Do not hardcode business thresholds.

Configuration may be stored in:

- Environment Variables
- Configuration Files
- Database (future)

---

# 21. Broadcast Workflow

Broadcasting follows a multi-stage validation process.

```
BMKG

↓

SIGAP Scheduler

↓

Retrieve Latest Event

↓

Decision Engine

↓

Does the event affect Pangandaran?

↓

No
↓

Store as History

↓

End


Yes

↓

Notify Village Authorities

↓

Authority Reviews Event

↓

Authority Selects Alert Level

↓

Broadcast to Citizens

↓

Save Broadcast History

↓

End
```

Broadcasts should only originate from validated events.

The system should prioritize preventing misinformation over maximizing speed.

---

# 22. AI Summary Workflow

Artificial Intelligence serves only as an information simplification tool.

AI receives structured official data.

AI produces:

- Weather summaries
- Disaster summaries
- Public safety recommendations

Example:

Input:

- Heavy rain
- Wind speed: 30 km/h
- High waves

Output:

"Hari ini diperkirakan terjadi hujan lebat disertai angin kencang. Warga disarankan mengurangi aktivitas di area pantai."

AI must never:

- Predict disasters
- Change disaster status
- Invent information
- Override official BMKG data

Every AI-generated summary should clearly reflect official information.

---

# 23. Scheduler (Cron Job)

Certain backend tasks run automatically.

Examples include:

- Retrieve weather updates
- Retrieve earthquake updates
- Retrieve tsunami updates
- Refresh cached data
- Check pending broadcasts

The scheduler should run at configurable intervals.

Examples:

- Every 5 minutes
- Every 10 minutes
- Every hour

Scheduler intervals must never be hardcoded.

---

# 24. Logging Strategy

Logging supports debugging, monitoring, and auditing.

Important events to log include:

- Admin login
- Failed login
- BMKG synchronization
- Broadcast creation
- Broadcast approval
- Broadcast cancellation
- External API failure
- Database errors

Sensitive information must never be written to logs.

Examples of prohibited log content:

- Passwords
- JWT tokens
- API secrets
- Personal resident data

Logs should include timestamps and event context.

---

# 25. Environment Variables

Sensitive configuration should always be stored in environment variables.

Typical environment variables include:

- DATABASE_URL
- JWT_SECRET
- BMKG_API_URL
- AI_API_KEY
- PORT
- NODE_ENV

Do not commit `.env` files to version control.

Provide an `.env.example` file for development.

---

# 26. Security Checklist

Backend security should follow these principles:

- Validate all incoming requests.
- Authenticate admin users.
- Authorize protected endpoints.
- Hash passwords with bcrypt.
- Use HTTPS in production.
- Protect secrets using environment variables.
- Sanitize user input.
- Limit request rates where appropriate.
- Avoid exposing internal server information.

Security should be considered throughout development rather than added later.

---

# 27. Development Workflow

Recommended workflow:

1. Review the PRD.
2. Review the Software Architecture.
3. Review the Database Design.
4. Review existing code.
5. Plan the implementation.
6. Implement backend logic.
7. Test manually.
8. Update documentation if needed.

Developers and AI coding agents should avoid implementing features without understanding the existing architecture.

---

# 28. Git Workflow

Development follows a feature-branch workflow.

Typical process:

```
main

↓

feature/weather

↓

feature/earthquake

↓

feature/broadcast

↓

Pull Request

↓

Code Review

↓

Merge into main
```

Every feature should be developed in an isolated branch.

Direct commits to the main branch should be avoided.

---

# 29. AI Development Rules

AI coding agents must:

- Read existing project documentation before generating code.
- Follow the Repository Pattern.
- Respect the layered architecture.
- Reuse existing utilities and services.
- Avoid introducing unnecessary dependencies.
- Generate strongly typed TypeScript code.
- Keep functions small and readable.
- Write maintainable code over clever code.

AI coding agents must not:

- Change project architecture without approval.
- Ignore project conventions.
- Duplicate existing logic.
- Introduce undocumented features.
- Hardcode business rules.

If documentation is incomplete, the AI should request clarification instead of making assumptions.

---

# 30. Definition of Done

A backend feature is considered complete only when:

Functional:

- Business requirements are fully implemented.
- Feature behaves as expected.

Architecture:

- Repository Pattern is followed.
- Layer responsibilities are respected.

Database:

- Prisma schema updated if required.
- Migration completed successfully.

API:

- Endpoint follows response standards.
- Validation implemented.
- Error handling implemented.

Security:

- Protected endpoints require authentication.
- Authorization rules applied.

Testing:

- Manual testing completed.
- API tested successfully.

Documentation:

- Relevant documentation updated.

Only after satisfying all criteria should a feature be considered ready for review.
