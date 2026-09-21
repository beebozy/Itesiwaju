# ITESIWAJU https://itesiwaju-etnj.vercel.app/(report dashboard)

### Digital Waste Management, Accountability & Community Intelligence Platform 

**Itesiwaju** is a digital waste-management and accountability platform that connects **citizens, PSP operators, waste-management agencies, and collectors** through a unified case-management system.

Citizens can report sanitation problems using a **mobile application or WhatsApp**, while PSP operators and waste-management agencies manage, verify, assign, monitor, and resolve cases through web dashboards.

The platform transforms a simple citizen complaint into a **traceable operational case** with evidence, accountability, SLA monitoring, and resolution tracking.

**Report → Verify → Assign → Resolve → Verify → Close** 

---

## 1. The Problem

Waste-management complaints are often fragmented across phone calls, social media, WhatsApp messages, and informal reporting channels.

This creates several problems:

* Citizens do not know whether their complaints were received.
* Waste operators lack a centralized case-management system.
* Authorities have limited visibility into unresolved sanitation problems.
* There is little accountability around who was assigned to a case.
* Resolution claims may lack before/after evidence.
* SLA breaches can go unnoticed.
* Valuable sanitation data is difficult to aggregate and analyze.

Itesiwaju provides a unified system for turning these complaints into **verifiable, trackable cases**.

---

# 2. How It Works

A citizen can report a waste problem through the mobile application or WhatsApp.

```text
Citizen
   │
   ├── *Mobile App
   │
   └── WhatsApp
          │
          ▼
     Node.js Backend
          │
          ▼
     Create WasteCase
          │
          ├── Evidence
          ├── GPS
          ├── Timestamp
          └── Audit Event
          │
          ▼
      AI Analysis
          │
          ▼
    Human Verification
          │
          ▼
       Assignment
          │
          ▼
       Collector
          │
          ├── Before Evidence
          ├── Cleanup
          └── After Evidence
          │
          ▼
        Resolved
          │
          ▼
   Authority Verification
          │
          ▼
         Closed
```

The important architectural principle is that **all reporting channels create the same `WasteCase` domain object**.

The mobile application and WhatsApp bot do not implement separate case-management logic.

```text
* Mobile App ───────┐
                  │
WhatsApp Bot ─────┼──→ ReportService → WasteCase
                  │
USSD ─────────────┘
```

---

# 3. Core Features

## Citizen Reporting

Citizens can:

* Capture or upload photos.
* Capture their GPS location.
* Add a description.
* Choose identified or private reporting.
* Submit sanitation complaints.
* Receive a case number.
* Track the progress of their report.
* Receive status notifications.

The reporting process is intentionally simple.

```text
Take Photo
     ↓
Capture Location
     ↓
Add Description
     ↓
Choose Privacy
     ↓
Submit
```

Citizens are not expected to understand technical waste classifications. The system and authorized personnel handle classification and verification.

---

## WhatsApp Reporting

WhatsApp provides a low-friction reporting channel for citizens.

Example:

```text
Bot: Send a photo of the waste problem.

Citizen: [Photo]

Bot: Please share your location.

Citizen: [Location]

Bot: Briefly describe the problem.

Citizen: Waste has blocked the drainage.

Bot: Report submitted.

Case: LAG-00124
```

The WhatsApp bot uses the same backend `ReportService` as the mobile application.

### WhatsApp State Machine

```text
START
  ↓
WAITING_FOR_PHOTO
  ↓
WAITING_FOR_LOCATION
  ↓
WAITING_FOR_DESCRIPTION
  ↓
CREATING_REPORT
  ↓
COMPLETED
```

---

# 4. Case Management

Every report becomes a trackable `WasteCase`.

### Case lifecycle

```text
REPORTED
    ↓
UNDER_REVIEW
    ↓
VERIFIED
    ↓
ASSIGNED
    ↓
ACCEPTED
    ↓
IN_PROGRESS
    ↓
RESOLVED
    ↓
CLOSED
```

Alternative outcomes include:

```text
UNDER_REVIEW → REJECTED
UNDER_REVIEW → DUPLICATE
RESOLVED → REOPENED
```

The backend is responsible for validating state transitions.

Frontend applications cannot directly change case states without server-side authorization and validation.

---

# 5. Evidence & Accountability

Evidence is a central part of the platform.

Supported evidence types include:

* `REPORT_PHOTO`
* `BEFORE_PHOTO`
* `AFTER_PHOTO`
* `INSPECTION_PHOTO`
* `ADDITIONAL_PHOTO`
* `VIDEO`

A typical resolution flow is:

```text
Citizen Photo
     ↓
Authority Verification
     ↓
Collector Before Photo
     ↓
Cleanup
     ↓
Collector After Photo
     ↓
Authority Review
     ↓
Resolution
```

Images and videos are stored in object/media storage such as Cloudinary.

PostgreSQL stores the metadata and references:

```text
Evidence
├── caseId
├── type
├── fileUrl
├── storageKey
├── mimeType
├── uploader
├── uploadedAt
└── metadata
```

This keeps large media files out of the relational database.

---

# 6. AI-Assisted Classification

Itesiwaju uses AI to assist authorities with classifying sanitation reports.

The initial implementation uses **Roboflow**.

AI can suggest:

### Waste Category

* Plastic
* Organic
* Paper
* Cardboard
* Glass
* Metal
* E-waste
* Hazardous
* Construction debris
* Mixed waste
* Unknown

### Incident Type

* Illegal dumping
* Bin overflow
* Road obstruction
* Drainage obstruction
* Uncollected waste
* Construction waste
* Burning waste
* Other

### Severity

* Low
* Medium
* High
* Critical

AI results include confidence values.

Example:

```json
{
  "type": "CONSTRUCTION_DEBRIS",
  "confidence": 0.91
}
```

### Human-in-the-loop verification

AI does not determine the official classification.

```text
AI Suggestion
      ↓
┌─────┼─────┐
↓     ↓     ↓
Accept Correct Reject
      │
      ▼
Human Verified Result
```

Both the AI-generated result and human-verified result are retained for traceability.

If AI is unavailable, the case remains valid and can be classified manually.

---

# 7. PSP & Collector Operations

PSP operators can:

* View cases assigned to their organization.
* Review verified cases.
* Assign collectors.
* Monitor active assignments.
* Monitor SLA status.
* Review evidence.
* Track resolutions.

Collectors receive assignments through a mobile-first interface.

### Collector workflow

```text
ASSIGNED
    ↓
ACCEPT
    ↓
ARRIVE
    ↓
BEFORE PHOTO
    ↓
START WORK
    ↓
CLEANUP
    ↓
AFTER PHOTO
    ↓
MARK RESOLVED
```

Where required by policy, a collector cannot mark a case resolved without submitting the required evidence.

---

# 8. Authority Dashboard

Waste-management agencies receive system-wide visibility.

The agency dashboard can provide:

* Total cases.
* Open cases.
* Resolved cases.
* SLA breaches.
* Resolution times.
* PSP operational metrics.
* Escalations.
* Case history.
* Community/street scores.
* Waste hotspots.

The goal is to give authorities operational visibility rather than simply displaying complaint counts.

---

# 9. SLA & Escalation

Itesiwaju supports configurable Service Level Agreements.

Example demonstration defaults:

| Severity | Example SLA |
| -------- | ----------: |
| LOW      |    72 hours |
| MEDIUM   |    48 hours |
| HIGH     |    24 hours |
| CRITICAL |     6 hours |

These values are **product demonstration defaults**, not claims about any particular authority's official policy.

The system records:

* SLA start time.
* Deadline.
* Warning time.
* Breach time.
* Escalation events.

Example escalation path:

```text
Collector
    ↓
PSP Supervisor
    ↓
Agency Supervisor
    ↓
Agency Management
```

Escalation policies are configurable by deployment.

---


# 13. Multilingual Support

The platform is designed for localized deployments.

Initial target languages include:

* English
* Yoruba
* Nigerian Pidgin
**Improvement to me made**
# 10. Clean Street Score

Itesiwaju can calculate a **Clean Street Score** ranging from 0–100.

The score is based on verified operational data rather than directly on AI predictions.

Example factors:

| Factor                           | Weight |
| -------------------------------- | -----: |
| Illegal dumping frequency        |    25% |
| Collection reliability           |    25% |
| Complaint resolution performance |    20% |
| Cleanliness inspections          |    20% |
| Verified recycling participation |    10% |

The scoring pipeline is:

```text
Verified Operational Data
          ↓
     Scoring Engine
          ↓
    Factor Scores
          ↓
 Weighted Overall Score
          ↓
 Community/Street Score
```

The score is designed to be explainable.

AI severity predictions do not directly modify the score.

---

# 11. Privacy

Privacy is built into the architecture.

Reports can be:

```text
IDENTIFIED
PRIVATE
```

Private reports should not expose citizen identity to PSP operators or the public unless access is required by the applicable operational or legal policy.

The platform also avoids exposing exact citizen locations publicly.

Public maps should use:

* Generalized locations.
* Aggregated data.
* Community-level information.

Sensitive case data remains protected by backend authorization.

---

# 12. Low-Bandwidth Design

Itesiwaju is designed for environments where connectivity may be limited.

### Mobile

* Compress images before upload.
* Cache essential screens.
* Minimize API requests.
* Retry failed uploads.
* Queue reports when offline.
* Avoid making maps mandatory.

### WhatsApp

* Familiar interface.
* Small text prompts.
* Minimal interaction steps.

### USSD

USSD can provide a future low-access reporting and case-status channel.

Because standard USSD cannot carry photos, reports can be created using basic information and enriched through another channel where necessary.

---



The backend stores a user's preferred language and frontend messages use translation keys rather than hardcoded text.

Example:

```typescript
t("report.title")
t("report.takePhoto")
t("report.location")
t("report.submit")
```

Additional languages can therefore be introduced without rewriting the application.

---

# 14. Architecture

```text
                         ITESIWAJU
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       CITIZEN          PSP OPERATOR       WASTE AGENCY
          │                  │                  │
     ┌────┴────┐             │                  │
     ▼         ▼             ▼                  ▼
  Mobile    WhatsApp      PSP Dashboard     Agency Dashboard
     │         │             │                  │
     └────┬────┘             │                  │
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
                     NODE.JS BACKEND
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
     CASE MANAGEMENT    AI ORCHESTRATION     AUTH
           │                 │
           ▼                 ▼
      PostgreSQL          Roboflow
       Supabase
           │
           ├── Cases
           ├── Evidence Metadata
           ├── Assignments
           ├── Case Events
           ├── SLA
           └── Scores
```

---

# 15. Backend Architecture

The backend follows a layered architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository / Database
```

External providers are isolated behind service interfaces.

```text
WasteClassificationService
          ↓
     Roboflow Adapter
```

```text
MediaService
      ↓
Cloudinary Adapter
```

```text
WhatsAppService
      ↓
WhatsApp Cloud API Adapter
```

This allows external providers to be replaced without rewriting the rest of the application.

---

# 16. Tech Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Backend           | Node.js                     |
| Language          | TypeScript                  |
| API               | Express                     |
| Database          | PostgreSQL                  |
| Database Platform | Supabase                    |
| AI                | Roboflow                    |
| Media Storage     | Cloudinary / Object Storage |
| Messaging         | WhatsApp Business Platform  |
| Authentication    | JWT / Session-based         |
| Mobile            | Mobile Application          |
| Dashboards        | Web Application             |

---

# 17. Database

The core database is PostgreSQL.

Main entities:

```text
users
   │
   ├── waste_cases
   │       ├── evidence
   │       ├── ai_analyses
   │       ├── assignments
   │       ├── case_events
   │       └── case_slas
   │
   ├── collectors
   └── psps

communities
   │
   └── street_scores
```

Additional entities include:

* `escalations`
* `notifications`
* `whatsapp_conversations`
* `inspections`
* `collection_records`
* `recycling_records`

For the initial MVP, the highest-priority tables are:

```text
users
waste_cases
evidence
ai_analyses
psps
collectors
assignments
case_events
case_slas
whatsapp_conversations
```

---

# 18. API

The backend exposes versioned APIs under:

```text
/api/v1
```

### Reports

```http
POST /api/v1/reports
```

Example:

```json
{
  "description": "Waste has blocked the drainage.",
  "latitude": 6.6018,
  "longitude": 3.3515,
  "privacyLevel": "PRIVATE"
}
```

Response:

```json
{
  "caseNumber": "LAG-00124",
  "status": "REPORTED"
}
```

### Cases

```http
GET  /api/v1/cases
GET  /api/v1/cases/:id

POST /api/v1/cases/:id/verify
POST /api/v1/cases/:id/reject
POST /api/v1/cases/:id/duplicate
POST /api/v1/cases/:id/assign
POST /api/v1/cases/:id/evidence

POST /api/v1/cases/:id/close
POST /api/v1/cases/:id/reopen
```

### Assignments

```http
POST /api/v1/assignments/:id/accept
POST /api/v1/assignments/:id/arrive
POST /api/v1/assignments/:id/start
POST /api/v1/assignments/:id/resolve
```

### WhatsApp

```http
GET  /api/v1/whatsapp/webhook
POST /api/v1/whatsapp/webhook
```

---

# 19. API Response Format

Successful responses use a consistent structure:

```json
{
  "data": {},
  "meta": {}
}
```

Errors:

```json
{
  "error": {
    "code": "CASE_NOT_FOUND",
    "message": "Case was not found."
  }
}
```

All incoming requests are validated server-side.

---

# 20. Project Structure

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── reports/
│   │   ├── cases/
│   │   ├── evidence/
│   │   ├── ai/
│   │   ├── assignments/
│   │   ├── collectors/
│   │   ├── sla/
│   │   ├── escalation/
│   │   ├── notifications/
│   │   ├── whatsapp/
│   │   ├── scoring/
│   │   └── analytics/
│   │
│   ├── services/
│   │   ├── cloudinary.service.ts
│   │   ├── roboflow.service.ts
│   │   └── whatsapp.service.ts
│   │
│   └── db/
│       ├── client.ts
│       └── schema/
│
├── package.json
├── tsconfig.json
└── .env
```

---

# 21. Security

The backend is the security boundary.

Security measures include:

* JWT/session-based authentication.
* Role-based authorization.
* Server-side request validation.
* Case access restrictions.
* Jurisdiction-based access control.
* Environment-based secrets.
* Signed/private media URLs where appropriate.
* HTTPS/TLS for data in transit.
* Restricted citizen information.
* Restricted exact GPS coordinates.
* Audit logging for privileged actions.

### User roles

```text
CITIZEN
PSP_OPERATOR
AGENCY_OPERATOR
COLLECTOR
ADMIN
```

A frontend button is never treated as an authorization mechanism.

For example:

```text
Frontend:
"Show Assign Collector button"

Backend:
"Is this user authorized to assign this case?"

             ↓

          YES / NO
```

---

# 22. Environment Variables

Create a `.env` file locally:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=

JWT_SECRET=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ROBOFLOW_API_KEY=
ROBOFLOW_MODEL_URL=



# 23. Development Roadmap

The project is being developed incrementally.

### Phase 1 — Core Backend

* [ ] Express server
* [ ] TypeScript
* [ ] PostgreSQL/Supabase
* [ ] Users
* [ ] Waste cases
* [ ] Evidence

### Phase 2 — Citizen Reporting

* [ ] Citizen authentication
* [ ] Report API
* [ ] Case lifecycle
* [ ] Case tracking
* [ ] Role-based authorization

### Phase 3 — PSP Operations

* [ ] PSP dashboard APIs
* [ ] Case assignment
* [ ] Collector management
* [ ] Collector workflow
* [ ] Before/after evidence

### Phase 4 — WhatsApp

* [ ] WhatsApp webhook
* [ ] Conversation state machine
* [ ] Photo handling
* [ ] Location handling
* [ ] Case creation
* [ ] Case status tracking

### Phase 5 — AI

* [ ] Roboflow integration
* [ ] Asynchronous AI processing
* [ ] Classification
* [ ] Confidence scores
* [ ] Human verification

### Phase 6 — Accountability

* [ ] SLA management
* [ ] SLA warnings
* [ ] SLA breach detection
* [ ] Escalations
* [ ] Notifications

### Phase 7 — Intelligence

* [ ] Clean Street Score
* [ ] Community analytics
* [ ] Waste hotspots
* [ ] Inspection data
* [ ] Recycling data

---

# 24. Documentation

The repository contains detailed architecture documentation covering the individual system components.

```text
docs/
├── architecture.md
├── system-design.md
├── database.md
├── backend.md
└── frontend.md
```

### Architecture

Describes:

* System boundaries
* Architectural principles
* External integrations
* Security
* Interfaces
* Data flow

### System Design

Describes:

* Case lifecycle
* Reporting flows
* AI processing
* Evidence
* Verification
* Assignment
* Collector workflow
* SLA
* Escalation
* Privacy
* Low-bandwidth strategy

### Database Design

Describes:

* PostgreSQL schema
* Entities
* Relationships
* Indexes
* MVP tables
* Audit trail

### Backend

Describes:

* API architecture
* Services
* Controllers
* Repository layer
* WhatsApp integration
* AI integration
* Authentication
* SLA processing

### Frontend

Describes:

* Citizen application
* PSP dashboard
* Agency dashboard
* Collector interface
* WhatsApp interface
* Accessibility
* Multilingual UI
* Low-bandwidth design

---

# 25. Design Principles

Itesiwaju follows several core principles:

### One backend, multiple channels

Mobile, WhatsApp, and future USSD channels all interact with the same backend.

### One case model

Every sanitation report becomes a `WasteCase`.

### Backend as the source of truth

Business rules and authorization live on the server.

### Human-in-the-loop AI

AI provides recommendations; authorized humans verify official classifications.

### Evidence-driven accountability

Important operational claims should be supported by evidence.

### Auditable state transitions

Important case transitions generate audit events.

### Privacy by design

Citizen identity and exact locations are protected according to the configured privacy model.

### Replaceable external services

External providers are hidden behind internal service interfaces.

### Configurable deployments

SLA policies, escalation rules, languages, service areas, and institutional workflows should be configurable.

---

# 26. Vision

Itesiwaju is designed to move waste-management reporting from:

```text
Complaint
   ↓
Unknown Status
   ↓
Manual Follow-up
```

towards:

```text
Evidence
   ↓
Verified Case
   ↓
Assigned Responsibility
   ↓
Measured SLA
   ↓
Documented Action
   ↓
Verified Resolution
   ↓
Accountability Data
```

The long-term goal is to provide a shared operational layer connecting **citizens, waste operators, collectors, and public authorities** while producing reliable data that can improve sanitation planning and service delivery.

---

## License

Add the project's license here.

```text
© 2026 Itesiwaju
```
