Here are all the **currently available Itesiwaju backend endpoints**:

### Base URL

```text
https://backend-6vdv-blue.vercel.app
```

### Public endpoints

| Method | Endpoint                | Purpose                     |
| ------ | ----------------------- | --------------------------- |
| `GET`  | `/health`               | Check if backend is running |
| `POST` | `/api/v1/auth/register` | Register a citizen          |
| `POST` | `/api/v1/auth/login`    | Login and receive JWT       |

### Protected endpoints

These require:

```http
Authorization: Bearer <access_token>
```

| Method | Endpoint              | Purpose                                       |
| ------ | --------------------- | --------------------------------------------- |
| `POST` | `/api/v1/reports`     | Create a waste report                         |
| `GET`  | `/api/v1/reports`     | Get authenticated user's reports              |
| `GET`  | `/api/v1/reports/:id` | Get a specific report, evidence, and timeline |

### Complete list

```text
GET  https://backend-6vdv-blue.vercel.app/health

POST https://backend-6vdv-blue.vercel.app/api/v1/auth/register

POST https://backend-6vdv-blue.vercel.app/api/v1/auth/login

POST https://backend-6vdv-blue.vercel.app/api/v1/reports
GET  https://backend-6vdv-blue.vercel.app/api/v1/reports
GET  https://backend-6vdv-blue.vercel.app/api/v1/reports/:id
```



## Endpoints

### 1. Health Check

```http
GET /health
```

**Authentication:** None

**Full URL:**

```text
https://backend-6vdv-blue.vercel.app/health
```

**Response:**

```json
{
  "status": "ok",
  "service": "itesiwoju-backend"
}
```

---

### 2. Register

Creates a new citizen account.

```http
POST /api/v1/auth/register
```

**Authentication:** None

**Headers:**

```http
Content-Type: application/json
```

**Request body:**

```json
{
  "fullName": "Musa Ajani",
  "phone": "08012345678",
  "email": "musa@example.com",
  "password": "password123",
  "preferredLanguage": "en"
}
```

**Possible languages:**

```text
en
yo
pcm
fr
```

**Response:**

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

### 3. Login

Authenticates a citizen and returns an access token.

```http
POST /api/v1/auth/login
```

**Authentication:** None

**Headers:**

```http
Content-Type: application/json
```

**Request body:**

```json
{
  "email": "musa@example.com",
  "password": "password123"
}
```

**Response:**

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

Save the `accessToken` and use it for protected endpoints.

---

# Authentication

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### 4. Create Waste Report

Creates a new waste case.

```http
POST /api/v1/reports
```

**Authentication:** Required

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request body:**

```json
{
  "description": "Waste dumped beside the road",
  "latitude": "6.5244",
  "longitude": "3.3792",
  "locationAccuracy": "8.2",
  "privacyLevel": "PRIVATE",
  "imageUrl": "https://example.com/waste.jpg",
  "capturedAt": "2026-09-18T12:00:00.000Z"
}
```

**Fields:**

| Field              | Required | Description                 |
| ------------------ | -------- | --------------------------- |
| `description`      | No       | Description of the incident |
| `latitude`         | No       | GPS latitude                |
| `longitude`        | No       | GPS longitude               |
| `locationAccuracy` | No       | GPS accuracy in metres      |
| `privacyLevel`     | No       | `PRIVATE` or `IDENTIFIED`   |
| `imageUrl`         | Yes      | Temporary image URL         |
| `capturedAt`       | No       | Photo capture time          |

> **Note:** `imageUrl` is temporary. Cloudinary integration will replace this with actual image upload using `multipart/form-data`.

The `reporterId` is automatically obtained from the authenticated user's JWT. The frontend does **not** send it.

---

### 5. Get My Reports

Returns reports belonging to the currently authenticated citizen.

```http
GET /api/v1/reports
```

**Authentication:** Required

**Headers:**

```http
Authorization: Bearer <accessToken>
```

**Response:**

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
      "privacyLevel": "PRIVATE",
      "reportedAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

The backend automatically filters reports using the authenticated user's ID.

---

### 6. Get Report Details

Returns a specific report belonging to the authenticated citizen.

```http
GET /api/v1/reports/:id
```

**Authentication:** Required

**Example:**

```text
GET /api/v1/reports/994733a6-3a15-46f2-85e0-3cca6dde6820
```

**Headers:**

```http
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "data": {
    "wasteCase": {
      "id": "uuid",
      "caseNumber": "LAG-123456",
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
        "mediaUrl": "https://example.com/waste.jpg",
        "capturedAt": "..."
      }
    ],
    "events": [
      {
        "id": "uuid",
        "eventType": "REPORTED",
        "description": "Waste report submitted.",
        "createdAt": "..."
      }
    ]
  }
}
```

The backend verifies that the requested report belongs to the authenticated user.

---

# Current Endpoint Summary

| Method | Endpoint                | Auth | Purpose            |
| ------ | ----------------------- | ---- | ------------------ |
| `GET`  | `/health`               | No   | Health check       |
| `POST` | `/api/v1/auth/register` | No   | Register           |
| `POST` | `/api/v1/auth/login`    | No   | Login              |
| `POST` | `/api/v1/reports`       | JWT  | Create report      |
| `GET`  | `/api/v1/reports`       | JWT  | Get my reports     |
| `GET`  | `/api/v1/reports/:id`   | JWT  | Get report details |

---

# Examples of Frontend Integration

## Fetch API

```javascript
const response = await fetch(
  `${API_BASE_URL}/api/v1/reports`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);

const data = await response.json();
```

---

## Axios

```javascript
const response = await axios.get(
  `${API_BASE_URL}/api/v1/reports`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);
```

---

## React API Function

```javascript
async function getMyReports(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/reports`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  return response.json();
}
```

---

## React Query

```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ["reports"],
  queryFn: () => getMyReports(accessToken)
});
```

---

## Mobile App

The same REST API can be consumed by a mobile application:

```text
React Native
Flutter
Native Android
Native iOS
```

The application simply makes HTTP requests to:

```text
https://backend-6vdv-blue.vercel.app
```

using the same authentication and API endpoints.
