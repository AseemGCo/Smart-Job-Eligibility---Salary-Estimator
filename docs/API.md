# 📡 TalentScope — API Documentation

Base URL (local): `http://localhost:4000/api`

All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "message": "OK", "data": { /* ... */ } }

// error
{ "success": false, "message": "Reason", "errors": [ /* optional field errors */ ] }
```

Authentication uses **JWT Bearer tokens**. Send the token on protected routes:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication

### POST `/auth/register`
Create a new account. Public.

**Body**
```json
{ "name": "Aseem Gupta", "email": "aseem@example.com", "password": "Secret@123" }
```

**201 Response**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "id": 4, "name": "Aseem Gupta", "email": "aseem@example.com", "role": "user", "created_at": "..." },
    "token": "<jwt>"
  }
}
```

Errors: `409` email already exists · `422` validation failed.

---

### POST `/auth/login`
Authenticate and receive a JWT. Public.

**Body**
```json
{ "email": "priya@example.com", "password": "Password@123", "remember": true }
```

**200 Response** — same shape as register (`user` + `token`).
`remember: true` issues a longer-lived token (default 7 days).

Errors: `401` invalid credentials · `422` validation failed.

---

### POST `/auth/logout`
Protected. JWT is stateless, so this confirms logout; the client discards the token.

**200 Response**: `{ "success": true, "message": "Logged out successfully.", "data": null }`

---

### GET `/auth/profile`
Protected. Returns the current user.

**200 Response**
```json
{ "success": true, "message": "Profile loaded.", "data": { "user": { "id": 1, "name": "Priya Sharma", "email": "priya@example.com", "role": "user", "created_at": "..." } } }
```

---

## 🧾 Candidates

All routes are **protected**. Regular users only see/modify their own
candidates; **admins** can access every candidate.

### GET `/candidates`
List candidates. Supports query params:

| Param | Values | Description |
| --- | --- | --- |
| `search` | string | Filter by candidate name (contains) |
| `filter` | `all` `eligible` `not-eligible` `priority` | Status filter |
| `sort` | `recent` `skill` `salary` `projects` `rank` `name` | Sort key |
| `order` | `asc` `desc` | Sort direction (default `desc`) |

**Example**: `GET /candidates?search=aar&filter=priority&sort=rank`

**200 Response**
```json
{
  "success": true,
  "message": "Candidates loaded.",
  "data": {
    "count": 1,
    "candidates": [
      {
        "id": 1, "user_id": 1, "candidate_name": "Aarav Sharma", "age": 24,
        "education": "Postgraduate", "skill_score": 88, "projects": 5, "relocate": "Yes",
        "eligibility": "Eligible", "priority_status": true, "confidence_level": "High",
        "salary_min": 12, "salary_max": 20, "salary_text": "₹12-20 LPA",
        "ranking_score": 86.6, "suggestions": ["Excellent profile! ..."],
        "owner_name": "Priya Sharma", "created_at": "..."
      }
    ]
  }
}
```

---

### GET `/candidates/:id`
Fetch a single candidate (ownership enforced unless admin).
Errors: `404` not found.

---

### POST `/candidates`
Create + evaluate a candidate. The server computes eligibility, salary,
confidence, ranking and suggestions.

**Body**
```json
{
  "candidate_name": "Aarav Sharma",
  "age": 24,
  "education": "Postgraduate",
  "skill_score": 88,
  "projects": 5,
  "relocate": "Yes"
}
```

**201 Response**: `{ "data": { "candidate": { /* full computed candidate */ } } }`

Errors: `422` validation failed.

---

### PUT `/candidates/:id`
Update a candidate; the evaluation is recomputed. Same body as POST.
Errors: `404` not found · `422` validation failed.

---

### DELETE `/candidates/:id`
Delete a candidate (ownership enforced unless admin).
Errors: `404` not found.

---

## 📊 Dashboard

### GET `/dashboard/stats`
Protected. Aggregated analytics. Scoped to the user; admins get
platform-wide stats plus `totalUsers`.

**200 Response (user)**
```json
{
  "success": true,
  "message": "Dashboard stats loaded.",
  "data": {
    "scope": "user",
    "totalCandidates": 3,
    "eligibleCandidates": 2,
    "priorityCandidates": 1,
    "averageSkillScore": 72,
    "topPerformer": { "candidate_name": "Aarav Sharma", "ranking_score": 86.6, "...": "..." }
  }
}
```

**Admin** additionally includes `"totalUsers": 3` and `"scope": "global"`.

---

## ⚙️ Utility

### GET `/health`
Public. Returns `{ "success": true, "message": "TalentScope API is healthy", "timestamp": "..." }`.

---

## HTTP status codes

| Code | Meaning |
| --- | --- |
| 200 | OK |
| 201 | Created |
| 401 | Unauthenticated (missing/invalid/expired token) |
| 403 | Forbidden (e.g. non-admin on admin resource) |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 422 | Validation failed (see `errors[]`) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

## Rate limits

- Global: 300 requests / 15 min per IP on `/api/*`.
- Auth (`/auth/login`, `/auth/register`): 20 requests / 15 min per IP.
