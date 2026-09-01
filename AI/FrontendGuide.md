# FrontendGuide.md

> SIGAP Frontend Development Guide
>
> Version 1.0

---

# 1. Purpose

This document defines the frontend development standards for SIGAP.

Its purpose is to ensure consistency across the user interface, improve maintainability, and provide clear guidance for developers and AI coding agents.

Frontend development should prioritize simplicity, accessibility, and readability over visual complexity.

---

# 2. Tech Stack

The frontend uses the following technologies.

Framework

- React

Language

- TypeScript

Build Tool

- Vite

Styling

- Tailwind CSS

Routing

- React Router

HTTP Client

- Axios

Maps

- Leaflet
- OpenStreetMap

Icons

- Lucide React

Charts

- Recharts

---

# 3. Frontend Architecture

The frontend follows a feature-based architecture.

Each feature owns its own:

- Pages
- Components
- Hooks
- Services
- Types

Business logic should remain minimal.

The frontend is responsible for:

- Rendering data
- User interaction
- Calling backend APIs
- Displaying loading states
- Displaying errors

Business rules belong to the backend.

---

# 4. Suggested Folder Structure

```

src/

├── assets/

├── components/

│ ├── common/

│ ├── layout/

│ ├── ui/

│ └── maps/

├── features/

│ ├── weather/

│ ├── earthquake/

│ ├── tsunami/

│ ├── announcement/

│ ├── evacuation/

│ └── admin/

├── hooks/

├── layouts/

├── pages/

├── routes/

├── services/

├── store/

├── types/

├── utils/

├── constants/

└── App.tsx

```

Each feature should remain isolated whenever possible.

Avoid creating a large shared folder without clear ownership.

---

# 5. Routing

Public Routes

- /
- /weather
- /forecast
- /earthquake
- /tsunami
- /evacuation
- /announcements
- /emergency

Protected Routes

- /admin/login
- /admin/dashboard
- /admin/broadcast
- /admin/announcement
- /admin/emergency
- /admin/evacuation

Protected routes require authentication.

Public users should never be required to log in.

---

# 6. UI Principles

SIGAP is designed primarily for:

- Village residents
- Elderly users
- Citizens with limited digital literacy

The interface should be:

- Simple
- Clear
- Consistent
- Calm
- Easy to understand

Avoid unnecessary animations.

Avoid decorative UI elements that distract from important information.

Important information should always appear first.

---

# 7. Navigation Rules

The navigation should remain simple.

Public users should reach important information within one or two clicks.

Recommended main navigation:

- Dashboard
- Weather
- Earthquake
- Tsunami
- Evacuation
- Emergency Contacts
- Announcements

Admin navigation should be separated from public navigation.

---

# 8. Layout Rules

Every page should follow a consistent layout structure.

Recommended page order:

1. Page Header
2. Status Card (if applicable)
3. Main Information
4. Supporting Information
5. Action Section
6. Footer

Avoid placing important information below the fold whenever possible.

Critical information should always appear near the top of the page.

---

# 9. Component Rules

Components should be reusable whenever possible.

Prefer composition over duplication.

Recommended reusable components:

- Card
- Button
- Badge
- Alert Banner
- Information Panel
- Status Chip
- Modal
- Confirmation Dialog
- Table
- Pagination
- Empty State
- Loading Skeleton
- Error Message

Each component should have a single responsibility.

---

# 10. Card Design Guidelines

Cards are the primary UI element throughout the application.

Every card should contain:

- Title
- Icon (optional)
- Main Information
- Supporting Information
- Last Updated (if applicable)

Avoid overcrowding cards.

One card should communicate one primary piece of information.

---

# 11. Status Indicator

Disaster status should always use the official SIGAP alert levels.

🟢 Normal

Display when:

- No active warning
- Daily conditions are safe

---

🟡 Waspada

Display when:

- Minor warning exists
- Citizens should remain alert

---

🟠 Siaga

Display when:

- Significant warning exists
- Prepare for evacuation

---

🔴 Awas

Display when:

- Immediate danger exists
- Evacuation should begin immediately

Status colors should remain consistent across the entire application.

Never use different colors for the same alert level.

---

# 12. Button Guidelines

Buttons should clearly communicate their actions.

Recommended hierarchy:

Primary Button

Used for:

- Save
- Submit
- Login
- Confirm

Secondary Button

Used for:

- Cancel
- Back
- Close

Danger Button

Used only for:

- Delete
- Reject Broadcast
- Remove Data

Success Button

Used for:

- Approve Broadcast
- Confirm Emergency Status

Avoid placing more than one primary button within the same section.

---

# 13. Typography Guidelines

Typography should prioritize readability.

Headings should be short.

Paragraphs should remain concise.

Avoid large blocks of text.

Use sentence case instead of ALL CAPS.

Numbers should be emphasized when displaying:

- Temperature
- Wind Speed
- Earthquake Magnitude
- Tsunami Height
- Rain Probability

---

# 14. Icon Guidelines

Icons should support understanding rather than decoration.

Recommended icon usage:

Weather

- Cloud
- Sun
- Rain
- Wind

Earthquake

- Activity
- Mountain

Tsunami

- Waves

Evacuation

- Map
- Navigation

Emergency

- Phone
- Hospital
- Shield

Announcements

- Megaphone

Use a single icon library throughout the application.

---

# 15. Color Usage

Colors should communicate status rather than decoration.

Avoid colorful interfaces.

The application should appear calm and trustworthy.

Color should primarily indicate:

- Alert Level
- Success
- Warning
- Error
- Information

Never rely solely on color.

Always accompany colors with labels or icons.

---

# 16. Spacing Guidelines

Maintain consistent spacing throughout the application.

Avoid crowded layouts.

Every section should have sufficient whitespace.

Cards should not touch each other directly.

Content should remain visually grouped according to function.

---

# 17. Dashboard Design Principles

The dashboard should answer three questions immediately:

1. Is it safe today?

2. What should I pay attention to?

3. What should I do?

Critical information should appear before supporting information.

The dashboard should avoid unnecessary scrolling.

---

# 18. Information Priority

Information should be displayed according to urgency.

Highest Priority

- Disaster Alert
- Tsunami Status
- Earthquake Status

High Priority

- Weather
- Broadcast Information

Medium Priority

- AI Summary
- Recommendations

Lower Priority

- Announcements
- News

Least Priority

- General Information
- Footer Content

This priority should remain consistent across all pages.

---

# 8. Layout Rules

Every page should follow a consistent layout structure.

Recommended page order:

1. Page Header
2. Status Card (if applicable)
3. Main Information
4. Supporting Information
5. Action Section
6. Footer

Avoid placing important information below the fold whenever possible.

Critical information should always appear near the top of the page.

---

# 9. Component Rules

Components should be reusable whenever possible.

Prefer composition over duplication.

Recommended reusable components:

- Card
- Button
- Badge
- Alert Banner
- Information Panel
- Status Chip
- Modal
- Confirmation Dialog
- Table
- Pagination
- Empty State
- Loading Skeleton
- Error Message

Each component should have a single responsibility.

---

# 10. Card Design Guidelines

Cards are the primary UI element throughout the application.

Every card should contain:

- Title
- Icon (optional)
- Main Information
- Supporting Information
- Last Updated (if applicable)

Avoid overcrowding cards.

One card should communicate one primary piece of information.

---

# 11. Status Indicator

Disaster status should always use the official SIGAP alert levels.

🟢 Normal

Display when:

- No active warning
- Daily conditions are safe

---

🟡 Waspada

Display when:

- Minor warning exists
- Citizens should remain alert

---

🟠 Siaga

Display when:

- Significant warning exists
- Prepare for evacuation

---

🔴 Awas

Display when:

- Immediate danger exists
- Evacuation should begin immediately

Status colors should remain consistent across the entire application.

Never use different colors for the same alert level.

---

# 12. Button Guidelines

Buttons should clearly communicate their actions.

Recommended hierarchy:

Primary Button

Used for:

- Save
- Submit
- Login
- Confirm

Secondary Button

Used for:

- Cancel
- Back
- Close

Danger Button

Used only for:

- Delete
- Reject Broadcast
- Remove Data

Success Button

Used for:

- Approve Broadcast
- Confirm Emergency Status

Avoid placing more than one primary button within the same section.

---

# 13. Typography Guidelines

Typography should prioritize readability.

Headings should be short.

Paragraphs should remain concise.

Avoid large blocks of text.

Use sentence case instead of ALL CAPS.

Numbers should be emphasized when displaying:

- Temperature
- Wind Speed
- Earthquake Magnitude
- Tsunami Height
- Rain Probability

---

# 14. Icon Guidelines

Icons should support understanding rather than decoration.

Recommended icon usage:

Weather

- Cloud
- Sun
- Rain
- Wind

Earthquake

- Activity
- Mountain

Tsunami

- Waves

Evacuation

- Map
- Navigation

Emergency

- Phone
- Hospital
- Shield

Announcements

- Megaphone

Use a single icon library throughout the application.

---

# 15. Color Usage

Colors should communicate status rather than decoration.

Avoid colorful interfaces.

The application should appear calm and trustworthy.

Color should primarily indicate:

- Alert Level
- Success
- Warning
- Error
- Information

Never rely solely on color.

Always accompany colors with labels or icons.

---

# 16. Spacing Guidelines

Maintain consistent spacing throughout the application.

Avoid crowded layouts.

Every section should have sufficient whitespace.

Cards should not touch each other directly.

Content should remain visually grouped according to function.

---

# 17. Dashboard Design Principles

The dashboard should answer three questions immediately:

1. Is it safe today?

2. What should I pay attention to?

3. What should I do?

Critical information should appear before supporting information.

The dashboard should avoid unnecessary scrolling.

---

# 18. Information Priority

Information should be displayed according to urgency.

Highest Priority

- Disaster Alert
- Tsunami Status
- Earthquake Status

High Priority

- Weather
- Broadcast Information

Medium Priority

- AI Summary
- Recommendations

Lower Priority

- Announcements
- News

Least Priority

- General Information
- Footer Content

This priority should remain consistent across all pages.

# UI Architecture

## Layout Structure

The application follows a one-page responsive dashboard.

Desktop Layout

- Fixed Left Sidebar
- Top Header
- Main Dashboard Content
- Footer

Mobile Layout

- Hamburger Navigation
- Top Header
- Vertical Scroll Layout
- Footer

---

## Component Structure

Layout Components

- Sidebar
- Header
- Footer

Dashboard Components

- StatusBanner
- AISummaryCard
- WeatherSection
- EarthquakeCard
- TsunamiCard
- EvacuationMap
- EmergencyContactGrid
- PreparednessGuide
- AnnouncementSection

---

## Rendering Order

Components should always appear in the following order:

1. Status Banner
2. AI Summary
3. Weather Monitoring
4. Earthquake Information
5. Tsunami Information
6. Evacuation Route
7. Emergency Contacts
8. Preparedness Guide
9. Village Announcements
10. Footer

---

## Responsive Rules

Desktop

- Fixed sidebar
- Multi-column cards
- Wider spacing

Mobile

- Single column layout
- Full-width cards
- Large touch targets
- Vertical scrolling only

---

## Design Reference

The official UI design reference is located in:

docs/assets/design/

- desktop-dashboard.png
- mobile-dashboard.png
- design-system.png

All UI implementation should follow these references.