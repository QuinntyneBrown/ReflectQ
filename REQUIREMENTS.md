# ReflectQ — Requirements

## Overview

ReflectQ is a real-time audience-feedback platform. A presenter displays a QR code on a screen; attendees scan it with their mobile devices, answer a question, and the admin dashboard shows responses as they arrive. An OAuth2-secured admin application manages questions, displays live results, and handles user administration. All web UIs are responsive (mobile, tablet, desktop).

---

## L1 — High-Level Requirements

| ID | Requirement |
|----|-------------|
| L1-01 | **QR Code Display** — The system shall generate and display a unique QR code that links to the respondent-facing question page. |
| L1-02 | **Response Collection** — The system shall present respondents with a question after they scan the QR code and shall capture their answer. |
| L1-03 | **Real-Time Feedback Dashboard** — The admin application shall display submitted responses in real time without requiring a page refresh. |
| L1-04 | **Question Management** — Administrators shall be able to create, update, activate, and deactivate questions. |
| L1-05 | **User Management** — The admin application shall provide user administration, including creating, editing, and deactivating admin accounts. |
| L1-06 | **Authentication & Authorisation** — Access to the admin application shall be protected by OAuth2. |
| L1-07 | **Responsive UI** — Every web interface (respondent and admin) shall function correctly and be visually usable on mobile, tablet, and desktop viewports. |

---

## L2 — Detailed Requirements & Acceptance Criteria

### L2-01 · QR Code Display

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-01.1 | The system shall generate a unique, time-bound URL for each active question and encode it as a QR code. | AC1: Scanning the QR code in any standards-compliant reader opens the respondent page for the correct question. AC2: The URL remains functional until the question is deactivated. |
| L2-01.2 | The QR code shall be rendered large enough for reliable scanning at a typical presentation distance (≥ 3 m). | AC1: QR code image is rendered at a minimum of 400 × 400 pixels when displayed full-screen. AC2: The image is vector-based (SVG) or exported at sufficient DPI so it does not appear pixelated on a 4K display. |
| L2-01.3 | The presenter view shall display the QR code alongside the question text and a live response counter. | AC1: Question text is visible below or beside the QR code. AC2: Response counter increments within 2 seconds of each new submission without page reload. |
| L2-01.4 | The presenter view shall be accessible via a shareable, unauthenticated URL so it can be opened on any display device. | AC1: Navigating directly to the presenter URL without logging in shows the QR code and question. AC2: No admin credentials are required to display the presenter view. |

---

### L2-02 · Response Collection

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-02.1 | After scanning the QR code, the respondent shall land on a mobile-optimised question page within 2 seconds. | AC1: Page load time (Time to Interactive) is ≤ 2 s on a 4G connection. AC2: The page renders correctly on iOS Safari and Android Chrome. |
| L2-02.2 | The question page shall display the question text clearly and provide an appropriate input control (multiple choice, rating scale, or free text) as configured by the administrator. | AC1: Multiple-choice questions render as a list of selectable options (radio buttons or tap targets ≥ 44 × 44 px). AC2: Rating-scale questions render as a numeric or star-scale control. AC3: Free-text questions render a text area. |
| L2-02.3 | The respondent shall be able to submit their answer with a single confirmation action. | AC1: A visible "Submit" button is present. AC2: Tapping "Submit" sends the response and navigates the respondent to a confirmation message. |
| L2-02.4 | The system shall prevent duplicate submissions from the same device session. | AC1: If the respondent attempts to re-submit on the same device during the same session, a message informs them that their response has already been recorded. AC2: The duplicate attempt is not written to the database. |
| L2-02.5 | Respondent submissions shall not require login or account creation. | AC1: No authentication prompt appears on the respondent page. AC2: An anonymous session token is used solely to enforce the single-submission rule. |

---

### L2-03 · Real-Time Feedback Dashboard

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-03.1 | The admin dashboard shall display incoming responses in real time using a persistent connection (WebSocket or Server-Sent Events). | AC1: A new response appears on the dashboard within 1 second of submission. AC2: The dashboard does not require manual refresh to see new responses. |
| L2-03.2 | Responses shall be visualised as both a list and an aggregated chart appropriate to the question type. | AC1: A list view shows each individual response with a timestamp. AC2: A bar chart (multiple choice / rating) or word-cloud / count (free text) updates live as responses arrive. |
| L2-03.3 | The dashboard shall display a running total of responses received for the active question. | AC1: Response count is shown prominently and updates in real time. AC2: Count matches the number of individual responses in the list. |
| L2-03.4 | Administrators shall be able to export responses for an active or past question to CSV. | AC1: An "Export CSV" button is present on the question results page. AC2: The exported file contains at minimum: response ID, response value, timestamp, and anonymous session ID. |
| L2-03.5 | Administrators shall be able to reset (clear) responses for a question. | AC1: A "Reset responses" action is available, protected by a confirmation dialog. AC2: After confirmation, all responses for the question are deleted and the dashboard shows zero responses. |

---

### L2-04 · Question Management

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-04.1 | Administrators shall be able to create a new question with a title, question body, type (multiple choice, rating scale, free text), and optional answer options. | AC1: The create form validates that title and question body are non-empty before saving. AC2: Multiple-choice questions require at least two answer options; validation prevents saving with fewer. |
| L2-04.2 | Only one question shall be in the "active" state at a time. Activating a new question automatically deactivates the previously active question. | AC1: When an admin activates question B while question A is active, question A transitions to "inactive" automatically. AC2: The QR code in the presenter view updates to reflect the newly active question within 2 seconds. |
| L2-04.3 | Administrators shall be able to edit a question that has no responses yet. | AC1: The edit form is available for questions with zero responses. AC2: Attempting to edit a question that already has responses shows a read-only view with a warning that edits are disabled. |
| L2-04.4 | Administrators shall be able to archive (soft-delete) a question. | AC1: Archived questions no longer appear in the default question list but are retrievable via an "Archived" filter. AC2: Archived questions cannot be activated. |
| L2-04.5 | The question list shall be searchable and sortable by title, type, status, and created date. | AC1: A search box filters results in real time as the admin types. AC2: Clicking column headers toggles ascending/descending sort. |

---

### L2-05 · User Management

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-05.1 | Super-admin users shall be able to invite new admin users by email. | AC1: An "Invite user" form accepts an email address and an assigned role (Admin or Viewer). AC2: An invitation email is sent; the link expires after 48 hours. |
| L2-05.2 | Admin users shall have defined roles with specific permissions. | AC1: **Super Admin** — full access including user management and system settings. AC2: **Admin** — manage questions and view responses; cannot manage users. AC3: **Viewer** — read-only access to the real-time dashboard only. |
| L2-05.3 | Administrators shall be able to deactivate a user account. | AC1: Deactivating a user immediately invalidates their active sessions and OAuth tokens. AC2: The deactivated user receives an HTTP 401 on their next API request. |
| L2-05.4 | Administrators shall be able to edit a user's display name and role. | AC1: Changes to role take effect on the user's next API request (within one token-refresh cycle). AC2: A user's own role cannot be downgraded by themselves. |
| L2-05.5 | The user list shall display each user's name, email, role, status (active/inactive), and last-login timestamp. | AC1: All five columns are present in the user list. AC2: The list is sortable by each column. |

---

### L2-06 · Authentication & Authorisation

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-06.1 | The admin application shall implement OAuth2 with the Authorization Code + PKCE flow. | AC1: Clicking "Sign in" redirects to the configured OAuth2 provider's authorisation endpoint. AC2: The admin app exchanges the authorisation code for tokens using PKCE; no client secret is embedded in the frontend. |
| L2-06.2 | The system shall support at least one external identity provider (e.g., Google, Microsoft Entra ID). | AC1: Admin users can authenticate using a configured external OAuth2 provider. AC2: Provider configuration (client ID, authorisation endpoint, scopes) is managed via environment variables, not hard-coded. |
| L2-06.3 | Access tokens shall be short-lived (≤ 60 minutes); refresh tokens shall be used to maintain sessions. | AC1: Access tokens expire no later than 60 minutes after issuance. AC2: The admin app silently refreshes the access token using the refresh token before expiry without logging the user out. |
| L2-06.4 | All admin API endpoints shall be protected by token-based authorisation. | AC1: Any request to a protected endpoint without a valid Bearer token returns HTTP 401. AC2: Requests with a valid token but insufficient role return HTTP 403. |
| L2-06.5 | Administrators shall be able to sign out, invalidating their current session. | AC1: Clicking "Sign out" clears local tokens and, where supported by the provider, calls the end-session endpoint. AC2: After sign-out, navigating to a protected route redirects to the sign-in page. |

---

### L2-07 · Responsive UI

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| L2-07.1 | All web interfaces shall render correctly at three standard breakpoints: mobile (≤ 480 px), tablet (481–1024 px), and desktop (≥ 1025 px). | AC1: No horizontal scroll bar appears at any defined breakpoint when tested in Chrome DevTools device emulation. AC2: Interactive elements (buttons, inputs) meet WCAG 2.1 AA minimum touch-target size (44 × 44 px) on mobile. |
| L2-07.2 | The respondent question page shall be optimised for one-handed mobile use. | AC1: The "Submit" button is reachable in the bottom half of the viewport on a 375 × 667 px screen without scrolling. AC2: Font sizes are ≥ 16 px to prevent auto-zoom on iOS. |
| L2-07.3 | The admin dashboard shall adapt its layout for tablet and desktop. | AC1: On tablet, the sidebar navigation collapses to an icon-only rail. AC2: On desktop, the sidebar is fully expanded by default. AC3: The chart and response list are displayed side-by-side on desktop and stack vertically on mobile/tablet. |
| L2-07.4 | All pages shall meet WCAG 2.1 Level AA accessibility guidelines. | AC1: Colour contrast ratio for normal text is ≥ 4.5:1. AC2: All interactive elements are keyboard-navigable and have visible focus indicators. AC3: ARIA roles and labels are applied to all dynamic content regions (live response counter, chart). |
| L2-07.5 | The presenter QR-code view shall be usable full-screen on a desktop or TV display. | AC1: The layout scales gracefully to 1920 × 1080 and 3840 × 2160 without content overflow. AC2: A "Full Screen" button is provided to enter browser full-screen mode. |
