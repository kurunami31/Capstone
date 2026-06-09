# API Documentation

All API routes are prefixed with `/api`. Authentication is via httpOnly cookie (`token`). The server runs on port 3000 by default.

---

## Authentication

### POST /api/register
Create a new account.
```json
{
  "firstName": "string",
  "lastName": "string",
  "middleInitial": "string (optional)",
  "extensionName": "string (optional)",
  "email": "string",
  "password": "string (min 8 chars)"
}
```
**Response** `200`: `{ "user": { id, email, firstName, lastName, role } }`

### POST /api/login
Authenticate and receive a session cookie.
```json
{ "email": "string", "password": "string", "rememberMe": "boolean" }
```
- `rememberMe: true` → cookie lasts 30 days
- `rememberMe: false` → cookie lasts 1 hour

**Response** `200`: `{ "user": { ... } }`

### POST /api/logout
Clear the session cookie.
**Response** `200`: `{ "success": true }`

### GET /api/me
Get current authenticated user.
**Response** `200`: `{ "user": { ... } }`

---

## Profile

### PUT /api/profile
Update profile fields.
```json
{ "firstName": "string", "lastName": "string", "email": "string" }
```

### PUT /api/profile/password
Change password.
```json
{ "currentPassword": "string", "newPassword": "string" }
```

### POST /api/profile/picture
Upload avatar (multipart form-data).

---

## Assessment

### GET /api/assessments/last
Get the most recent assessment. **Response**: `{ "assessment": { ... } }`

### GET /api/assessments/history
List all past assessments.

### GET /api/assessments/:id/details
Get full details of a specific assessment.

### POST /api/assessment/save
Save a completed assessment.
```json
{
  "strand": "string",
  "gwa": "number",
  "hollandCode": "string",
  "topPrograms": ["string"],
  "fullData": { ... }
}
```

### GET /api/assessment/progress
Get saved progress (resume support). **Response**: `{ "progress": { step, data } }`

### PUT /api/assessment/progress
Auto-save progress mid-assessment.
```json
{ "step": "number", "data": { ... } }
```

### DELETE /api/assessment/progress
Clear saved progress.

---

## Programs

### GET /api/programs/status
Get all programs with their active/inactive status.
**Response**: `{ "programs": { "BSIT": true, ... } }`

### POST /api/admin/programs
Add a new program (admin). Expects program object with code, name, college, etc.

### PUT /api/admin/programs/:code
Update a program by code.

### DELETE /api/admin/programs/:code
Delete a program.

### PUT /api/admin/programs/:code/toggle
Toggle program active/inactive status.

---

## Assessment Questions

### GET /api/admin/questions
List all questions (admin). **Response**: `[{ id, step, questionKey, questionText, ... }]`

### POST /api/admin/questions
Add a new question.
```json
{ "step": "string", "questionKey": "string", "questionText": "string", "questionType": "string", "options": [], "sortOrder": 0 }
```

### PUT /api/admin/questions/:id
Update a question.

### DELETE /api/admin/questions/:id
Delete a question.

### GET /api/questions/:step
Get active questions for a specific assessment step (student).

---

## Favorites

### GET /api/favorites
List saved programs. **Response**: `{ "favorites": ["BSIT", ...] }`

### POST /api/favorites
Save a program.
```json
{ "programCode": "string" }
```

### DELETE /api/favorites/:programCode
Remove a saved program.

---

## Counselor

### GET /api/counselor/assessments
List assessments for review with optional status filter.

### POST /api/counselor/notes
Add a note to an assessment.
```json
{ "assessmentId": "string", "notes": "string", "status": "pending|reviewed" }
```

---

## Admin — Dashboard

### GET /api/admin/stats
Quick stats. **Response**: `{ totalUsers, totalAssessments, assessmentsToday, activeUsers }`

### GET /api/admin/activity
Recent activity log entries.

### GET /api/admin/users
List all users with pagination and search.
**Query params**: `?search=&page=&limit=`

### PUT /api/admin/users/:id
Update user (firstName, lastName, email, role, etc.).

### DELETE /api/admin/users/:id
Delete a user account.

### POST /api/admin/users/:id/reset-cooldown
Reset assessment cooldown for a user.

---

## Admin — Analytics

### GET /api/admin/analytics/user-growth?from=&to=
Monthly user registrations in a date range.

### GET /api/admin/analytics/program-popularity
Program recommendation frequency.

### GET /api/admin/analytics/completion-rate?from=&to=
Assessment completion rates over time.

### GET /api/admin/analytics/strand-distribution
SHS strand breakdown of users.

### GET /api/admin/analytics/holland-distribution
Holland Code distribution across users.

### GET /api/admin/analytics/summary?from=&to=
Aggregated KPIs (total users, assessments this month, new this week, assessments today).

---

## Admin — Export

### GET /api/admin/users/export?from=&to=
Download user data as CSV.

### GET /api/admin/assessments/export?from=&to=
Download assessment data as CSV.

### GET /api/export/my-data
Student exports their own data as CSV.

---

## Notifications

### GET /api/notifications
List all notifications for the current user.

### GET /api/notifications/unread-count
Get unread notification count.

### PUT /api/notifications/:id/read
Mark a notification as read.

### PUT /api/notifications/read-all
Mark all notifications as read.

---

## Achievements

### GET /api/achievements
List earned achievements.

### POST /api/achievements/check
Check and award new achievements based on current state.

---

## User Summary

### GET /api/user/summary
Dashboard summary (cooldown, last assessment, top programs, etc.).

### GET /api/user/consistency
Historical comparison data across multiple assessments.

---

## Chat

### POST /api/chat
Send a message to the AI career assistant.
```json
{ "message": "string" }
```
**Response**: `{ "reply": "string" }`

### GET /api/chat/history
Get chat message history.

---

## Settings

### GET /api/settings
Get system settings (weights, results count).

### PUT /api/admin/settings
Update system settings (admin).

---

## Email & Password Reset

### POST /api/forgot-password
Send password reset email.
```json
{ "email": "string" }
```

### GET /api/reset-password/verify?token=
Verify a reset token.

### POST /api/reset-password
Set new password with token.
```json
{ "token": "string", "password": "string" }
```

### GET /api/verify-email?token=
Verify email address via token.

### POST /api/resend-verification
Resend verification email.

### GET /api/email-verified
Check if current user's email is verified.

### GET /api/check-smtp
Check if SMTP is configured for email sending.

---

## Health

### GET /api/health
Server health check. **Response**: `{ "status": "ok", "timestamp": ... }`
