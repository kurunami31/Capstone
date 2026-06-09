# Developer Guide

## Project Structure

```
dorsu-recommender/
 +-- public/                  # Static files
 |    +-- developers/          # Developer profile photos
 |    +-- logos/               # College logo images
 +-- scripts/
 |    +-- backup.mjs           # Database backup script
 +-- src/
 |    +-- components/          # React components
 |    +-- context/             # React contexts
 |    +-- data/                # Static data files
 |    +-- engine/              # Scoring algorithms
 |    +-- hooks/               # Custom React hooks
 |    +-- i18n/                # Translation files
 +-- db.js                    # Database connection + schema
 +-- server.js                # Express server
 +-- vite.config.js           # Vite build configuration
```

## How to Add a New Assessment Step

1. **Create the component** in `src/components/` (e.g., `NewStep.jsx`).

   ```jsx
   import { useTranslation } from '../hooks/useTranslation.js'

   export default function NewStep({ data, onUpdate, onNext, onBack }) {
     const { t } = useTranslation()
     return (
       <div>
         <h2>{t('newstep.title')}</h2>
         {/* Your step UI here */}
         <button onClick={onBack}>{t('assessment.back')}</button>
         <button onClick={onNext}>{t('assessment.next')}</button>
       </div>
     )
   }
   ```

2. **Add the step** to `STEPS` array in `App.jsx`:
   ```js
   const STEPS = ['welcome', 'strand', 'grades', 'suast', 'holland', 'interest', 'skills', 'newstep', 'results']
   ```

3. **Add the step label key** to `STEP_LABEL_KEYS` in `App.jsx`:
   ```js
   const STEP_LABEL_KEYS = ['welcome.title', 'strand.title', 'grades.title', 'suast.title', 'holland.title', 'interest.title', 'skills.title', 'newstep.title', 'results.title']
   ```

4. **Add the render case** in `renderStep()`:
   ```js
   case 'newstep': return <NewStep data={studentData} onUpdate={updateData} onNext={() => setStep(8)} onBack={() => setStep(6)} />
   ```

5. **Update the scoring engine** if your step contributes to recommendations:
   - Add a new factor in `src/engine/scoring.js`.
   - Add its weight to `system_settings` defaults in `db.js`.

6. **Add translations** in `src/i18n/en.json`, `tl.json`, `ceb.json`.

## How to Add a New Translation Language

1. Create a new JSON file in `src/i18n/` (e.g., `hil.json` for Hiligaynon).
2. Copy the structure from `en.json` and translate all values.
3. Add the locale code to `SUPPORTED_LOCALES` in `src/context/LanguageContext.jsx`:
   ```js
   const SUPPORTED_LOCALES = ['en', 'tl', 'ceb', 'hil']
   ```
4. Import and add the translations in `src/hooks/useTranslation.js`:
   ```js
   import hil from '../i18n/hil.json'
   const TRANSLATIONS = { en, tl, ceb, hil }
   ```
5. Add the language button in `src/components/Sidebar.jsx`:
   ```js
   {['en', 'tl', 'ceb', 'hil'].map(l => (...)}
   ```

## How to Add a New Chart to Admin Analytics

1. **Add the API endpoint** in `server.js`:
   ```js
   app.get('/api/admin/analytics/your-metric', authenticate, requireStaff, async (req, res) => {
     const result = await pool.query('SELECT ...')
     res.json(result.rows)
   })
   ```

2. **Add the chart component** in `AdminPage.jsx`:
   - Use the existing chart pattern (title bar + data display).
   - Add a CSV export button following the existing `exportCSV` pattern.

3. **Add the fetch call** in the `useEffect` that loads analytics data.

4. **Add the translation key** in `src/i18n/*.json`.

## How to Add a New Achievement

1. Add the achievement definition in `db.js` in the `defaultAchievements` array:
   ```js
   { key: 'streak', name: 'On Fire', description: 'Complete assessments 3 months in a row' }
   ```
2. Add the check logic in the `POST /api/achievements/check` route in `server.js`.
3. Add the notification trigger when the achievement is earned.

## Coding Conventions

- **Components**: Functional components with hooks. No class components (except ErrorBoundary).
- **Styling**: All inline styles using JS objects. CSS variables are defined in `index.html`'s `<html data-theme>` selectors.
- **State Management**: React context + useState/useReducer. No Redux or Zustand.
- **API Calls**: Native `fetch` with `credentials: 'include'` for cookie auth.
- **Error Handling**: Try/catch in async functions. Server errors return `{ error: "message" }`.
- **Database**: Parameterized queries with `pg` pool. Always use `$1`, `$2` placeholders.
- **Translations**: String keys follow `domain.key` pattern (e.g., `dashboard.title`). Use `{variable}` interpolation for dynamic values.
- **File Naming**: PascalCase for components, camelCase for utilities.
- **Imports**: Named exports for components, default exports for pages.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `TOKEN_EXPIRY` | No | JWT expiration (default: `24h`) |
| `SMTP_HOST` | No | SMTP server for email features |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password or app password |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI chat |
| `SENTRY_DSN` | No | Sentry error tracking DSN |

## Build & Deploy

```bash
# Development
npm run dev          # Vite dev server (hot reload)

# Production build
npm run build        # Builds to dist/
npm start            # Serves dist/ via Express
```

The production build outputs to `dist/`. Express serves these static files and handles all API routes.

## Database Backup

```bash
npm run backup
```

This runs `scripts/backup.mjs` which exports the database to a SQL file.


