# Testing Report

## Scope

Testing covered the core functional areas of the DOrSU Program Recommender system. Due to the capstone project timeline, testing was performed manually with a focus on critical user flows and edge cases. Automated unit tests are planned for future iterations.

---

## Test Areas

### 1. Authentication

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| User Registration | Fill registration form, submit | Account created, user logged in | ✅ Pass |
| Duplicate Email | Register with existing email | Error message: email already exists | ✅ Pass |
| Weak Password | Enter password < 8 characters | Error: minimum length requirement | ✅ Pass |
| Login (valid) | Enter correct credentials | User redirected to dashboard | ✅ Pass |
| Login (invalid) | Enter wrong password | Error: Invalid email or password | ✅ Pass |
| Remember Me | Check checkbox on login | Cookie persists for 30 days | ✅ Pass |
| Logout | Click Sign Out | Cookie cleared, back to login page | ✅ Pass |
| Session Expiry | Wait 1 hour (or modify maxAge) | User redirected to login | ✅ Pass |

### 2. Assessment Flow

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Complete Assessment | Go through all 7 steps | Results page shows ranked programs | ✅ Pass |
| Auto-Save | Leave mid-assessment, return | Resume prompt appears | ✅ Pass |
| Resume | Click Resume on prompt | Continues from saved step | ✅ Pass |
| Start Over | Click Start Over on prompt | Fresh assessment begins | ✅ Pass |
| Back Navigation | Click Back on any step | Previous step loads with data intact | ✅ Pass |
| Strand Selection | Select each strand type | Compatible programs filtered correctly | ✅ Pass |
| GWA Input | Enter various GWA values | Score adjusts proportionally | ✅ Pass |
| Holland Quiz | Complete all 24 ratings | Holland Code calculated correctly | ✅ Pass |
| Empty Input | Skip all optional fields | Assessment still completes | ✅ Pass |

### 3. Results

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Program Ranking | Complete assessment | Programs sorted by total score descending | ✅ Pass |
| Score Breakdown | View program detail | Academic, SUAST, Personal Fit shown | ✅ Pass |
| Compare Programs | Select 2+ programs, click Compare | Side-by-side comparison table | ✅ Pass |
| Simulate Scores | Adjust grades, check result | Scores update in real-time | ✅ Pass |
| Add to Favorites | Click heart icon | Program saved, icon updates | ✅ Pass |
| Remove Favorites | Click heart icon again | Program removed | ✅ Pass |
| Share Results | Click Share | Link copied to clipboard | ✅ Pass |
| Download PDF | Click Download PDF | PDF file generated and downloaded | ✅ Pass |

### 4. Admin Features

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| View Dashboard | Navigate to Admin | KPI cards and charts rendered | ✅ Pass |
| Date Range Filter | Select from/to month | Charts update to date range | ✅ Pass |
| Export CSV | Click Export on any chart | CSV file downloaded | ✅ Pass |
| User Search | Type in search box | Users filtered by name/email | ✅ Pass |
| Edit User Role | Change role in dropdown | User role updated in database | ✅ Pass |
| Delete User | Click Delete, confirm | User removed | ✅ Pass |
| Reset Cooldown | Click Reset Cooldown | User can retake assessment | ✅ Pass |
| Add Program | Fill program form, submit | New program appears in list | ✅ Pass |
| Edit Program | Modify fields, save | Program updated | ✅ Pass |
| Toggle Program | Click toggle switch | Program active/inactive status changes | ✅ Pass |
| Delete Program | Click Delete | Program removed | ✅ Pass |
| Add Question | Fill question form | Question appears in step | ✅ Pass |
| Edit Question | Modify question text | Question updated | ✅ Pass |
| Delete Question | Click Delete | Question removed | ✅ Pass |

### 5. Notifications

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Achievement Notification | Complete assessment | Achievement notification appears | ✅ Pass |
| Unread Count | View sidebar badge | Number matches unread notifications | ✅ Pass |
| Mark as Read | Click notification | Badge decrements | ✅ Pass |
| Mark All Read | Click Mark All Read | All notifications read | ✅ Pass |

### 6. i18n (Multilingual)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Switch to Tagalog | Click TL in sidebar | UI text updates to Tagalog | ✅ Pass |
| Switch to Cebuano | Click CEB in sidebar | UI text updates to Cebuano | ✅ Pass |
| Switch to English | Click EN in sidebar | UI text updates to English | ✅ Pass |
| Language Persistence | Refresh page | Language persists from localStorage | ✅ Pass |
| Missing Key Fallback | Navigate to untranslated UI | Falls back to English text | ✅ Pass |

### 7. Security

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Unauthenticated Access | Access /api/admin without cookie | 401 Unauthorized | ✅ Pass |
| Role Enforcement | Access admin API as student | 403 Forbidden | ✅ Pass |
| SQL Injection | Enter SQL in email field | Query parameterized, no injection | ✅ Pass |
| Rate Limiting | Rapid login attempts | Blocked after threshold | ✅ Pass |
| Password Hashing | Check database | Passwords stored as bcrypt hash | ✅ Pass |
| XSS | Enter script tag in fields | Rendered as text, not executed | ✅ Pass |

### 8. Performance

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| Page Load Time | Load dashboard | Loads within 3 seconds | ✅ Pass |
| Assessment Calculation | Submit assessment | Results calculated in < 1 second | ✅ Pass |
| Concurrent Users | Simulate multiple logins | Server handles without crash | ✅ Pass |

---

## Known Issues

1. **Chunk size warning**: The pdf-related libraries (html2canvas + jspdf) form a ~585KB chunk. This does not affect functionality but could be optimized with dynamic imports.
2. **Mobile responsiveness**: Core flows work on mobile but some admin charts may overflow on very small screens.
3. **Email delivery**: Depends on SMTP configuration. Without it, email verification and password reset are unavailable.

---

## Test Environment

- **OS**: Windows 11
- **Browser**: Chrome 125, Firefox 128
- **Node.js**: v20.11.0
- **PostgreSQL**: 16.2
- **Screen sizes tested**: 1366×768, 1920×1080, 375×667 (mobile)
