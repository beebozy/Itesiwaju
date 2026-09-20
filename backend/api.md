# Itesiwaju Backend API

API documentation for the Itesiwaju waste-management and accountability platform.

---

# Base URL

Production:

```text
https://backend-6vdv-blue.vercel.app
```

Local development:

```text
http://localhost:3000
```

All API endpoints use the `/api/v1` prefix except the health check.

---

# Authentication

Itesiwaju uses JWT access tokens.

After a successful login, the backend returns an `accessToken`.

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The frontend should store the access token securely and attach it to every protected API request.

---

# User Roles

The backend currently supports:

```text
CITIZEN
PSP_OPERATOR
AGENCY_OPERATOR
COLLECTOR
ADMIN
```

### Role access

| Role              | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `CITIZEN`         | Submit and track waste reports             |
| `PSP_OPERATOR`    | Private-sector/service-provider operations |
| `AGENCY_OPERATOR` | LAWMA/agency case management and analytics |
| `COLLECTOR`       | Handle assigned waste cases                |
| `ADMIN`           | Administrative access                      |

Normal public registration creates users with:

```text
CITIZEN
```

Privileged roles should not be self-assigned by users.

---

# Complete Endpoint Summary

## Public

| Method | Endpoint                | Auth | Purpose               |
| ------ | ----------------------- | ---- | --------------------- |
| `GET`  | `/health`               | No   | Health check          |
| `POST` | `/api/v1/auth/register` | No   | Register a citizen    |
| `POST` | `/api/v1/auth/login`    | No   | Login and receive JWT |

## Citizen / Authenticated

| Method  | Endpoint                   | Auth | Purpose                          |
| ------- | -------------------------- | ---- | -------------------------------- |
| `POST`  | `/api/v1/reports`          | JWT  | Create waste report              |
| `GET`   | `/api/v1/reports`          | JWT  | Get authenticated user's reports |
| `GET`   | `/api/v1/reports/:id`      | JWT  | Get report details               |
| `PATCH` | `/api/v1/cases/:id/status` | JWT  | Change case status               |

## Agency / Admin

| Method | Endpoint                         | Auth | Role                       |
| ------ | -------------------------------- | ---- | -------------------------- |
| `GET`  | `/api/v1/analytics/overview`     | JWT  | `AGENCY_OPERATOR`, `ADMIN` |
| `POST` | `/api/v1/assignments/:id/assign` | JWT  | `AGENCY_OPERATOR`, `ADMIN` |

---

# 1. Health Check

```http
GET /health
```

### Authentication

None.

### Production URL

```text
https://backend-6vdv-blue.vercel.app/health
```

### Response

```json
{
  "status": "ok",
  "service": "itesiwoju-backend"
}
```

---

# 2. Register

Creates a new citizen account.

```http
POST /api/v1/auth/register
```

### Authentication

None.

### Headers

```http
Content-Type: application/json
```

### Request body

```json
{
  "fullName": "Musa Ajani",
  "phone": "08012345678",
  "email": "musa@example.com",
  "password": "password123",
  "preferredLanguage": "en"
}
```

### Fields

| Field               | Required | Description               |
| ------------------- | -------- | ------------------------- |
| `fullName`          | Yes      | User's full name          |
| `phone`             | Yes      | User's phone number       |
| `email`             | No       | User's email address      |
| `password`          | Yes      | Account password          |
| `preferredLanguage` | No       | User's preferred language |

Supported languages:

```text
en
yo
pcm
fr
```

### Response

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Musa Ajani",
      "phone": "08012345678",
      "email": "musa@example.com",
      "role": "CITIZEN",
      "preferredLanguage": "en",
      "isActive": true,
      "createdAt": "..."
    }
  }
}
```

---

# 3. Login

Authenticates a user and returns an access token.

```http
POST /api/v1/auth/login
```

### Authentication

None.

### Headers

```http
Content-Type: application/json
```

### Request body

```json
{
  "email": "musa@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "id": "uuid",
      "fullName": "Musa Ajani",
      "phone": "08012345678",
      "email": "musa@example.com",
      "role": "CITIZEN",
      "preferredLanguage": "en",
      "isActive": true
    }
  }
}
```

The frontend should save the `accessToken` and send it with subsequent protected requests.

---

# 4. Create Waste Report

Creates a new waste case.

```http
POST /api/v1/reports
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

### Important

This endpoint accepts a **multipart form upload**.

The frontend should **not** send `imageUrl`.

The frontend sends the actual image file using the `photo` field.

The backend uploads the image to Cloudinary and stores the resulting media URL as evidence associated with the case.

### Form fields

| Field              | Required | Description                      |
| ------------------ | -------- | -------------------------------- |
| `photo`            | Yes      | Waste image file                 |
| `description`      | No       | Description of the incident      |
| `latitude`         | No       | GPS latitude                     |
| `longitude`        | No       | GPS longitude                    |
| `locationAccuracy` | No       | GPS accuracy in metres           |
| `privacyLevel`     | No       | `PRIVATE` or `IDENTIFIED`        |
| `capturedAt`       | No       | Original photo capture timestamp |

### Example

Using `curl`:

```bash
curl -X POST \
  https://backend-6vdv-blue.vercel.app/api/v1/reports \
  -H "Authorization: Bearer <accessToken>" \
  -F "photo=@waste.jpg" \
  -F "description=Illegal dumping beside the road" \
  -F "latitude=6.524400" \
  -F "longitude=3.379200" \
  -F "locationAccuracy=10" \
  -F "privacyLevel=PRIVATE" \
  -F "capturedAt=2026-09-20T10:00:00Z"
```

### Important frontend behavior

The frontend does **not** send:

```text
reporterId
caseNumber
status
source
```

These are generated/controlled by the backend.

The authenticated user's ID is obtained from the JWT.

The backend creates the case and associated evidence.

---

# 5. Get My Reports

Returns reports belonging to the authenticated user.

```http
GET /api/v1/reports
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <accessToken>
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "caseNumber": "LAG-123456",
      "reporterId": "uuid",
      "source": "MOBILE",
      "status": "REPORTED",
      "description": "Waste dumped beside the road",
      "latitude": "6.524400",
      "longitude": "3.379200",
      "locationAccuracy": "8.20",
      "address": "Example address",
      "ward": "Example ward",
      "lga": "Example LGA",
      "privacyLevel": "PRIVATE",
      "reportedAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

The backend automatically filters the results using the authenticated user's ID.

---

# 6. Get Report Details

Returns a specific report, its evidence, and its event timeline.

```http
GET /api/v1/reports/:id
```

### Authentication

Required.

### Example

```http
GET /api/v1/reports/9939ffbf-3b41-459f-9490-0d8a0ff7b7fc
```

### Headers

```http
Authorization: Bearer <accessToken>
```

### Response

```json
{
  "data": {
    "wasteCase": {
      "id": "uuid",
      "caseNumber": "LAG-123456",
      "reporterId": "uuid",
      "source": "MOBILE",
      "status": "REPORTED",
      "description": "Waste dumped beside the road",
      "latitude": "6.524400",
      "longitude": "3.379200",
      "privacyLevel": "PRIVATE",
      "reportedAt": "..."
    },
    "evidence": [
      {
        "id": "uuid",
        "caseId": "uuid",
        "type": "REPORT_PHOTO",
        "mediaUrl": "https://...",
        "capturedAt": "..."
      }
    ],
    "events": [
      {
        "id": "uuid",
        "caseId": "uuid",
        "eventType": "REPORTED",
        "description": "Waste report submitted.",
        "createdAt": "..."
      }
    ]
  }
}
```

The backend verifies that the report belongs to the authenticated user.

---

# 7. Update Case Status

Changes the status of a waste case.

```http
PATCH /api/v1/cases/:id/status
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Request body

```json
{
  "status": "UNDER_REVIEW"
}
```

### Available statuses

```text
REPORTED
UNDER_REVIEW
VERIFIED
ASSIGNED
ACCEPTED
IN_PROGRESS
RESOLVED
CLOSED
REJECTED
DUPLICATE
REOPENED
```

### Status transition rules

The backend enforces valid transitions.

```text
REPORTED
    ↓
UNDER_REVIEW
    ├── VERIFIED
    ├── REJECTED
    └── DUPLICATE

VERIFIED
    ↓
ASSIGNED
    ↓
ACCEPTED
    ↓
IN_PROGRESS
    ↓
RESOLVED
    ├── CLOSED
    └── REOPENED

REOPENED
    ↓
UNDER_REVIEW
```

Invalid status transitions are rejected by the backend.

### Example

```bash
curl -X PATCH \
  https://backend-6vdv-blue.vercel.app/api/v1/cases/<CASE_ID>/status \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "UNDER_REVIEW"
  }'
```

### Response

The response contains the updated case and the generated case event.

The backend records status changes in `case_events`, providing an audit trail.

---

# 8. Assign Case to Collector

Assigns a verified case to a collector.

```http
POST /api/v1/assignments/:id/assign
```

### Authentication

Required.

### Required role

```text
AGENCY_OPERATOR
ADMIN
```

### Headers

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### `:id`

The `:id` parameter is the **case ID**.

### Request body

```json
{
  "collectorId": "collector-uuid"
}
```

### Requirements

The backend verifies that:

1. The case exists.
2. The case is currently `VERIFIED`.
3. The collector exists.
4. The user has the `COLLECTOR` role.
5. The collector is active.

The backend then:

1. Creates an assignment.
2. Changes the case status to `ASSIGNED`.
3. Creates an `ASSIGNED` case event.

### Example

```bash
curl -X POST \
  https://backend-6vdv-blue.vercel.app/api/v1/assignments/<CASE_ID>/assign \
  -H "Authorization: Bearer <LAWMA_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "collectorId": "<COLLECTOR_ID>"
  }'
```

### Response

```json
{
  "data": {
    "assignment": {
      "id": "uuid",
      "caseId": "uuid",
      "collectorId": "uuid",
      "assignedBy": "uuid",
      "status": "ASSIGNED",
      "assignedAt": "...",
      "acceptedAt": null,
      "declinedAt": null,
      "completedAt": null
    },
    "case": {
      "id": "uuid",
      "caseNumber": "LAG-123456",
      "status": "ASSIGNED"
    },
    "event": {
      "id": "uuid",
      "caseId": "uuid",
      "actorId": "uuid",
      "eventType": "ASSIGNED",
      "description": "Case assigned to collector.",
      "metadata": {
        "collectorId": "uuid",
        "assignmentId": "uuid"
      },
      "createdAt": "..."
    }
  }
}
```

---

# 9. Analytics Overview

Returns high-level case statistics for the LAWMA/agency dashboard.

```http
GET /api/v1/analytics/overview
```

### Authentication

Required.

### Required roles

```text
AGENCY_OPERATOR
ADMIN
```

### Headers

```http
Authorization: Bearer <accessToken>
```

### Response

```json
{
  "data": {
    "totalCases": 10,
    "casesByStatus": {
      "reported": 9,
      "underReview": 0,
      "verified": 0,
      "assigned": 1,
      "accepted": 0,
      "inProgress": 0,
      "resolved": 0,
      "closed": 0,
      "rejected": 0,
      "duplicate": 0,
      "reopened": 0
    }
  }
}
```

### Frontend usage

This endpoint can power dashboard KPI cards such as:

```text
Total Cases
Reported
Under Review
Verified
Assigned
Accepted
In Progress
Resolved
Closed
Rejected
Duplicate
Reopened
```

---

# Case Status Lifecycle

The overall case lifecycle is:

```text
                    ┌──────────────┐
                    │   REPORTED   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ UNDER_REVIEW │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          VERIFIED      REJECTED     DUPLICATE
              │
              ▼
          ASSIGNED
              │
              ▼
          ACCEPTED
              │
              ▼
         IN_PROGRESS
              │
              ▼
          RESOLVED
           │       │
           ▼       ▼
        CLOSED  REOPENED
                    │
                    ▼
              UNDER_REVIEW
```

---

# Case Events / Audit Trail

Important case actions create events.

Current event types include:

```text
REPORTED
UNDER_REVIEW
VERIFIED
REJECTED
DUPLICATE
ASSIGNED
ACCEPTED
ARRIVED
IN_PROGRESS
RESOLVED
CLOSED
REOPENED
SLA_BREACHED
ESCALATED
```

Case events allow the frontend to display a timeline such as:

```text
20 Sep 2026
10:42
Report submitted

20 Sep 2026
11:15
Case moved to review

20 Sep 2026
12:03
Case verified

20 Sep 2026
12:24
Case assigned to collector
```

---

# Frontend Authentication Example

## Fetch

```javascript
const response = await fetch(
  `${API_BASE_URL}/api/v1/reports`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

---

# Create Report from React

Because report creation uses `multipart/form-data`, use `FormData`.

```javascript
async function createReport({
  token,
  photo,
  description,
  latitude,
  longitude,
  locationAccuracy,
  privacyLevel,
  capturedAt,
}) {
  const formData = new FormData();

  formData.append("photo", photo);

  if (description) {
    formData.append("description", description);
  }

  if (latitude !== undefined) {
    formData.append("latitude", String(latitude));
  }

  if (longitude !== undefined) {
    formData.append("longitude", String(longitude));
  }

  if (locationAccuracy !== undefined) {
    formData.append(
      "locationAccuracy",
      String(locationAccuracy)
    );
  }

  if (privacyLevel) {
    formData.append("privacyLevel", privacyLevel);
  }

  if (capturedAt) {
    formData.append("capturedAt", capturedAt);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/reports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create report");
  }

  return response.json();
}
```

### Important

Do **not** manually set:

```http
Content-Type: multipart/form-data
```

when using `FormData` with `fetch`.

The browser automatically sets the correct `Content-Type` including the multipart boundary.

---

# Get My Reports

```javascript
async function getMyReports(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/reports`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  return response.json();
}
```

---

# Get Report Details

```javascript
async function getReport(token, caseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/reports/${caseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }

  return response.json();
}
```

---

# Update Case Status

```javascript
async function updateCaseStatus(token, caseId, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/cases/${caseId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update case status");
  }

  return response.json();
}
```

---

# Assign Case

```javascript
async function assignCase(token, caseId, collectorId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/assignments/${caseId}/assign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collectorId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assign case");
  }

  return response.json();
}
```

---

# Get Analytics Overview

```javascript
async function getAnalyticsOverview(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analytics/overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch analytics overview");
  }

  return response.json();
}
```

---

# React Query Examples

## Reports

```javascript
const {
  data,
  isLoading,
  error,
} = useQuery({
  queryKey: ["reports"],
  queryFn: () => getMyReports(accessToken),
  enabled: !!accessToken,
});
```

## Analytics

```javascript
const {
  data,
  isLoading,
  error,
} = useQuery({
  queryKey: ["analytics", "overview"],
  queryFn: () => getAnalyticsOverview(accessToken),
  enabled: !!accessToken,
});
```

---

# Error Handling

API errors generally follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

Frontend applications should check:

```javascript
if (!response.ok) {
  const body = await response.json();

  throw new Error(
    body?.error?.message || "Request failed"
  );
}
```

Common authentication errors include:

```text
401 Unauthorized
```

for missing/invalid/expired authentication.

```text
403 Forbidden
```

when the authenticated user does not have the required role.

---

# Production API

The frontend should use:

```javascript
const API_BASE_URL =
  "https://backend-6vdv-blue.vercel.app";
```

Example:

```javascript
const response = await fetch(
  `${API_BASE_URL}/api/v1/reports`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

---

# Current Backend Capability

The current backend supports the following workflow:

```text
                 CITIZEN
                    │
                    │ Submit report
                    ▼
                 REPORT
                    │
                    ▼
                REPORTED
                    │
                    ▼
              UNDER_REVIEW
                    │
                    ▼
                 VERIFIED
                    │
                    │ Agency assigns
                    ▼
                ASSIGNED
                    │
                    ▼
                 COLLECTOR
```

The backend currently provides:

```text
Authentication
    ├── Register
    └── Login

Citizen Reporting
    ├── Create report
    ├── List my reports
    └── Get report details

Case Management
    └── Update case status

Assignments
    └── Assign verified case to collector

Analytics
    └── Dashboard overview

Audit Trail
    └── Case events
```

---

# Future Endpoints

The following functionality is part of the planned architecture but is **not yet available in the current API**:

```text
GET  /api/v1/cases
GET  /api/v1/cases/:id

GET  /api/v1/analytics/cases/trends
GET  /api/v1/analytics/cases/status
GET  /api/v1/analytics/cases/location

GET  /api/v1/collectors
GET  /api/v1/collectors/:id
GET  /api/v1/collectors/:id/assignments

POST /api/v1/assignments/:id/accept
POST /api/v1/assignments/:id/decline
POST /api/v1/assignments/:id/start
POST /api/v1/assignments/:id/complete
```

These should not be consumed by the frontend until they are implemented and deployed.

---

# API Version

Current API version:

```text
v1
```

Base API path:

```text
/api/v1
```
