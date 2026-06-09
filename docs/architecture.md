# System Architecture

## Overview

The DOrSU Program Recommender is a full-stack web application that helps incoming college students at Davao Oriental State University identify suitable undergraduate programs based on their academic profile, aptitude exam results, career interests, and personality type.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Email | Nodemailer |
| PDF Generation | jsPDF, html2canvas |
| Analytics | PostgreSQL queries + Chart rendering (CSS) |
| AI Chat | Google Gemini API (`@google/genai`) |
| Onboarding | React Joyride |
| Error Tracking | Sentry |

## Architecture Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        Browser                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  React SPA (Vite)                                    â”‚  â”‚
â”‚  â”‚  - AuthPage, UserDashboard, Results                  â”‚  â”‚
â”‚  â”‚  - AdminPage, ProgramsPage, QuestionsManager         â”‚  â”‚
â”‚  â”‚  - Assessment Steps (Strand, Grades, SUAST, etc.)   â”‚  â”‚
â”‚  â”‚  - OnboardingWalkthrough, ChatWidget                 â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  â”‚ HTTP (fetch, credentials: 'include')
                  â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Express Server (server.js)                                 â”‚
â”‚  - REST API endpoints                                       â”‚
â”‚  - JWT authentication middleware                            â”‚
â”‚  - Rate limiting                                            â”‚
â”‚  - Cookie-based sessions (httpOnly)                         â”‚
â”‚  - Serves React build as static files                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚ SQL queries (pg pool)
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PostgreSQL Database                                        â”‚
â”‚  Tables: users, assessments, activity_log,                  â”‚
â”‚  program_settings, system_settings, assessment_progress,    â”‚
â”‚  counselor_notes, assessment_questions, password_resets,    â”‚
â”‚  email_verifications, user_favorites, chat_messages,        â”‚
â”‚  notifications, achievements, user_achievements             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Frontend Architecture

```
src/
â”œâ”€â”€ App.jsx                  # Root component, routing, assessment flow
â”œâ”€â”€ main.jsx                 # Entry point
â”œâ”€â”€ components/              # React components
â”‚   â”œâ”€â”€ AuthPage.jsx         # Login / Register / Forgot Password
â”‚   â”œâ”€â”€ UserDashboard.jsx    # Student dashboard
â”‚   â”œâ”€â”€ AdminPage.jsx        # Admin analytics & user management
â”‚   â”œâ”€â”€ ProgramsPage.jsx     # Program CRUD (admin)
â”‚   â”œâ”€â”€ QuestionsManager.jsx # Assessment question customization
â”‚   â”œâ”€â”€ OnboardingWalkthrough.jsx # Interactive tour
â”‚   â”œâ”€â”€ Results.jsx          # Assessment results view
â”‚   â”œâ”€â”€ Sidebar.jsx          # Navigation sidebar
â”‚   â”œâ”€â”€ ChatWidget.jsx       # AI career assistant
â”‚   â””â”€â”€ ... (40+ components)
â”œâ”€â”€ context/                 # React contexts
â”‚   â”œâ”€â”€ AuthContext.jsx      # Auth state (user, login, logout)
â”‚   â””â”€â”€ LanguageContext.jsx  # i18n locale state
â”œâ”€â”€ engine/                  # Scoring logic
â”‚   â”œâ”€â”€ scoring.js           # Recommendation algorithm
â”‚   â””â”€â”€ holland.js           # Holland Code calculation
â”œâ”€â”€ data/                    # Static data
â”‚   â”œâ”€â”€ programs.json        # Program definitions
â”‚   â”œâ”€â”€ strands.json         # SHS strand data
â”‚   â””â”€â”€ glossary.json        # Term definitions
â”œâ”€â”€ hooks/                   # Custom hooks
â”‚   â”œâ”€â”€ useTranslation.js    # i18n translation hook
â”‚   â””â”€â”€ useMobile.js         # Responsive detection
â””â”€â”€ i18n/                    # Translation files
    â”œâ”€â”€ en.json              # English
    â”œâ”€â”€ tl.json              # Tagalog
    â””â”€â”€ ceb.json             # Cebuano
```

## Backend Architecture

```
Server (Express on port 3000)
â”œâ”€â”€ Middleware Pipeline
â”‚   â”œâ”€â”€ cookie-parser
â”‚   â”œâ”€â”€ Rate limiting (per IP)
â”‚   â”œâ”€â”€ JWT authentication (authenticate middleware)
â”‚   â””â”€â”€ Role authorization (requireStaff, requireManager, requireCounselor)
â”œâ”€â”€ API Routes
â”‚   â”œâ”€â”€ /api/auth/*          # Login, register, logout
â”‚   â”œâ”€â”€ /api/assessment/*    # Save, load, progress
â”‚   â”œâ”€â”€ /api/admin/*         # User management, analytics, programs
â”‚   â”œâ”€â”€ /api/counselor/*     # Notes, reviews
â”‚   â”œâ”€â”€ /api/notifications/* # CRUD
â”‚   â”œâ”€â”€ /api/favorites/*     # Saved programs
â”‚   â”œâ”€â”€ /api/chat/*          # AI assistant
â”‚   â””â”€â”€ /api/health          # Health check
â””â”€â”€ Static file serving (React build)
```

## Data Flow: Assessment

```
1. Student logs in â†’ Dashboard shown
2. Clicks "Start Assessment" â†’ Progress saved automatically
3. Step 1: Welcome â†’ School name input
4. Step 2: Strand Selection â†’ SHS strand chosen
5. Step 3: Grades â†’ Subject grades + GWA entered
6. Step 4: SUAST â†’ Aptitude exam tier selected
7. Step 5: Holland â†’ Personality quiz (6 dimensions)
8. Step 6: Interests â†’ Career interest ratings
9. Step 7: Skills â†’ Self-assessed skill levels
10. Results â†’ Weighted scoring â†’ Ranked program list
```

## Scoring Algorithm

The recommendation score is a weighted composite of three dimensions:

```
Total Score = Academic Ã— 0.45 + SUAST Ã— 0.30 + Personal Fit Ã— 0.25

Academic     = GWA-based comparison + strand compatibility bonus
SUAST        = Exam tier match with program requirements
Personal Fit = Holland Code match (0.50) + Interest match (0.30) + Skills match (0.20)
```

Programs with a total score of 0 are filtered out. Results are sorted descending by total score.

