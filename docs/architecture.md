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
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                    │  │
│  │  - AuthPage, UserDashboard, Results                  │  │
│  │  - AdminPage, ProgramsPage, QuestionsManager         │  │
│  │  - Assessment Steps (Strand, Grades, SUAST, etc.)   │  │
│  │  - OnboardingWalkthrough, ChatWidget                 │  │
│  └──────────────┬────────────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────────┘
                  │ HTTP (fetch, credentials: 'include')
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Express Server (server.js)                                 │
│  - REST API endpoints                                       │
│  - JWT authentication middleware                            │
│  - Rate limiting                                            │
│  - Cookie-based sessions (httpOnly)                         │
│  - Serves React build as static files                       │
└──────────────┬──────────────────────────────────────────────┘
               │ SQL queries (pg pool)
               ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
│  Tables: users, assessments, activity_log,                  │
│  program_settings, system_settings, assessment_progress,    │
│  counselor_notes, assessment_questions, password_resets,    │
│  email_verifications, user_favorites, chat_messages,        │
│  notifications, achievements, user_achievements             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

```
src/
├── App.jsx                  # Root component, routing, assessment flow
├── main.jsx                 # Entry point
├── components/              # React components
│   ├── AuthPage.jsx         # Login / Register / Forgot Password
│   ├── UserDashboard.jsx    # Student dashboard
│   ├── AdminPage.jsx        # Admin analytics & user management
│   ├── ProgramsPage.jsx     # Program CRUD (admin)
│   ├── QuestionsManager.jsx # Assessment question customization
│   ├── OnboardingWalkthrough.jsx # Interactive tour
│   ├── Results.jsx          # Assessment results view
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── ChatWidget.jsx       # AI career assistant
│   └── ... (40+ components)
├── context/                 # React contexts
│   ├── AuthContext.jsx      # Auth state (user, login, logout)
│   └── LanguageContext.jsx  # i18n locale state
├── engine/                  # Scoring logic
│   ├── scoring.js           # Recommendation algorithm
│   └── holland.js           # Holland Code calculation
├── data/                    # Static data
│   ├── programs.json        # Program definitions
│   ├── strands.json         # SHS strand data
│   └── glossary.json        # Term definitions
├── hooks/                   # Custom hooks
│   ├── useTranslation.js    # i18n translation hook
│   └── useMobile.js         # Responsive detection
└── i18n/                    # Translation files
    ├── en.json              # English
    ├── tl.json              # Tagalog
    └── ceb.json             # Cebuano
```

## Backend Architecture

```
Server (Express on port 3000)
├── Middleware Pipeline
│   ├── cookie-parser
│   ├── Rate limiting (per IP)
│   ├── JWT authentication (authenticate middleware)
│   └── Role authorization (requireStaff, requireManager, requireCounselor)
├── API Routes
│   ├── /api/auth/*          # Login, register, logout
│   ├── /api/assessment/*    # Save, load, progress
│   ├── /api/admin/*         # User management, analytics, programs
│   ├── /api/counselor/*     # Notes, reviews
│   ├── /api/notifications/* # CRUD
│   ├── /api/favorites/*     # Saved programs
│   ├── /api/chat/*          # AI assistant
│   └── /api/health          # Health check
└── Static file serving (React build)
```

## Data Flow: Assessment

```
1. Student logs in → Dashboard shown
2. Clicks "Start Assessment" → Progress saved automatically
3. Step 1: Welcome → School name input
4. Step 2: Strand Selection → SHS strand chosen
5. Step 3: Grades → Subject grades + GWA entered
6. Step 4: SUAST → Aptitude exam tier selected
7. Step 5: Holland → Personality quiz (6 dimensions)
8. Step 6: Interests → Career interest ratings
9. Step 7: Skills → Self-assessed skill levels
10. Results → Weighted scoring → Ranked program list
```

## Scoring Algorithm

The recommendation score is a weighted composite of three dimensions:

```
Total Score = Academic × 0.45 + SUAST × 0.30 + Personal Fit × 0.25

Academic     = GWA-based comparison + strand compatibility bonus
SUAST        = Exam tier match with program requirements
Personal Fit = Holland Code match (0.50) + Interest match (0.30) + Skills match (0.20)
```

Programs with a total score of 0 are filtered out. Results are sorted descending by total score.
