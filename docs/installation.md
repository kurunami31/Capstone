# Installation Guide

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** 14 or later
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## Step 1: Clone or Download

```bash
git clone https://github.com/kurunami31/Capstone.git
cd Capstone/dorsu-recommender
```

Or download and extract the ZIP archive.

## Step 2: Install Dependencies

```bash
npm install
```

This installs all backend and frontend dependencies defined in `package.json`.

## Step 3: Configure Environment

Create a `.env` file in the `dorsu-recommender` directory:

```env
# Database
DATABASE_URL=postgresql://localhost:5432/dorsu_recommender

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-here

# Session
TOKEN_EXPIRY=24h

# SMTP (optional  for email verification & password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Gemini API Key (optional  for AI chat assistant)
GEMINI_API_KEY=your-gemini-api-key

# Sentry DSN (optional  for error tracking)
SENTRY_DSN=your-sentry-dsn
```

### Database URL Formats

- **Local**: `postgresql://localhost:5432/dorsu_recommender`
- **With auth**: `postgresql://username:password@localhost:5432/dorsu_recommender`
- **Remote**: `postgresql://username:password@host:port/database`

## Step 4: Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE dorsu_recommender;

# Exit
\q
```

The database tables are created automatically when the server starts for the first time (`db.js`  `initDB()`).

## Step 5: Load Program Data

The system reads program data from `src/data/programs.json`. A default set of programs covering all DOrSU colleges is already included. You can modify this file before starting or use the admin panel later to toggle programs on/off.

## Step 6: Start the Server

```bash
npm start
```

This starts both:
- **Backend**: Express API server on port 3000
- **Frontend**: The React build is served as static files by Express

Alternatively, for development with hot reload:

```bash
# Terminal 1: Start the backend
node server.js

# Terminal 2: Start the frontend dev server
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies API requests to port 3000.

## Step 7: Access the Application

Open your browser to:

- **Production mode**: `http://localhost:3000`
- **Development mode**: `http://localhost:5173`

## Step 8: Admin Setup

The first time you log in with the email `admin@dorsu.edu.ph`, the system automatically grants the `super_admin` role. Use this account to:

1. Create other admin accounts via the Users tab
2. Configure scoring weights in Settings
3. Manage programs and questions

Additional admin emails can be configured in `server.js` by adding to the `ADMIN_EMAILS` array.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on database | Ensure PostgreSQL is running. Check `DATABASE_URL` in `.env`. |
| Blank page on load | Check browser console. The React build may need `npm run build`. |
| Login returns 401 | Verify email/password. New registrations need email verification if SMTP is configured. |
| `npm start` fails | Ensure you ran `npm install` first and Node.js version is 18+. |
| Email features not working | SMTP is optional. Skip `.env` SMTP fields if not needed. |



