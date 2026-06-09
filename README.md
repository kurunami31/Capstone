# DOrSU Program Recommender

A web-based career guidance system for Davao Oriental State University (DOrSU) that helps incoming college students identify suitable undergraduate programs based on their academic profile, aptitude, interests, and personality.

Built by three 3rd-year BSIT students as a capstone project.

## Features

- **7-Step Assessment**: Strand selection, grades, SUAST exam, personality (Holland Code), career interests, and skills
- **Smart Recommendations**: Weighted scoring algorithm produces ranked program matches
- **Interactive Results**: Compare programs, simulate score changes, download PDF reports
- **Admin Dashboard**: User management, analytics, program CRUD, question customization
- **Multilingual**: English, Tagalog, and Cebuano support
- **Accessible**: ARIA labels, keyboard navigation, responsive design
- **AI Assistant**: Chat-based career guidance (Google Gemini)
- **Onboarding Tour**: Interactive walkthrough for first-time users

## Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React 19 | Node.js / Express 5 | PostgreSQL |
| Vite 6 | JWT Auth | pg |
| React Joyride | Nodemailer | - |

## Quick Start

```bash
git clone https://github.com/kurunami31/Capstone.git
cd Capstone/dorsu-recommender
npm install

# Configure .env (see Installation Guide)
# Create PostgreSQL database: dorsu_recommender

npm start
# Visit http://localhost:3000
```

## Documentation

All documentation is in the `docs/` directory:

- [System Architecture](docs/architecture.md)
- [Database Schema (ERD)](docs/erd.md)
- [API Reference](docs/api.md)
- [User Manual](docs/user-manual.md)
- [Installation Guide](docs/installation.md)
- [Testing Report](docs/testing.md)
- [Developer Guide](docs/developer-guide.md)

## Developers

- **Christopher Lyod B. Mercado** — Lead Developer & Project Manager
- **Kenth Justine B. Sumalinab** — Frontend & Backend Developer
- **Maria Stefanie Celine A. Dela Salde** — UI/UX Designer & QA Lead

Davao Oriental State University — BSIT 3rd Year
