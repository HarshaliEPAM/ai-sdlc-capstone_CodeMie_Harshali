# Code Review Report (review-only)

Branch reviewed: `develop`
Branch for this PR: `code-review`

This PR contains **no functional code changes**. It adds this report to track findings.

## Overall code quality score
**6.4 / 10**

## Issues by severity

### Critical

#### C1 — Committed `node_modules` (backend + frontend)
**Why critical:** repo bloat, slow clones/CI, supply-chain risk, breaks reproducible builds.
- Paths:
  - `src/backend/node_modules/**`
  - `src/frontend/node_modules/**`
- Suggested fix:
  - Remove directories from git, add to `.gitignore`, commit only `package.json` + lockfiles.

#### C2 — JWT secret not validated (risk: undefined/weak secret)
- File: `src/backend/middleware/auth.js` — **L13** (`jwt.verify(token, process.env.JWT_SECRET)`)
- File: `src/backend/routes/auth.js` — **L48–L52** (`jwt.sign(..., process.env.JWT_SECRET, ...)`)
- Suggested fix:
  - Validate required env vars at startup (fail fast) and enforce minimum secret length.

#### C3 — Permissive CORS defaults
- File: `src/backend/server.js` — **L8** (`app.use(cors());`)
- Suggested fix:
  - Restrict allowed origins via env (`CORS_ORIGIN`), restrict methods/headers.

---

### Major

#### M1 — Insufficient backend input validation / normalization
- File: `src/backend/routes/auth.js`
  - Register presence-only checks: **L12–L14**
  - Login presence-only checks: **L33–L35**
- File: `src/backend/routes/tasks.js`
  - Create validates only title: **L20**
  - Update can write `undefined` fields: **L35–L43**
- Suggested fix:
  - Use schema validation (Joi/Zod), validate email format, password policy, trim strings, enforce enums.
  - Consider PATCH semantics (only update provided fields).

#### M2 — Sensitive error details returned to client
- File: `src/backend/routes/auth.js` — **L23** (`error: err.message`)
- File: `src/backend/routes/tasks.js` — **L13**, **L28**, **L44**, **L56** (`error: err.message`)
- Suggested fix:
  - Log server-side; return generic message + correlation id.

#### M3 — No centralized error handling middleware
- File: `src/backend/server.js` — missing global 404 + error handler.
- Suggested fix:
  - Add final `app.use((req,res)=>404...)` and `app.use((err,req,res,next)=>...)`.

#### M4 — JWT stored in `localStorage` (XSS risk)
- File: `src/frontend/src/context/AuthContext.jsx` — **L12–L13**
- File: `src/frontend/src/services/api.js` — **L7–L9**
- Suggested fix:
  - Prefer httpOnly cookies for prod; if staying with localStorage, add strong CSP and document tradeoffs.

#### M5 — Hardcoded frontend API base URL
- File: `src/frontend/src/services/api.js` — **L3**
- Suggested fix:
  - Use `import.meta.env.VITE_API_BASE_URL` and add `.env.example`.

#### M6 — SQLite FK enforcement + missing indexes
- File: `src/backend/db/database.js` — FK not enabled (SQLite needs `PRAGMA foreign_keys=ON`)
- File: `src/backend/db/init.sql` — missing index on `tasks.user_id`
- Suggested fix:
  - Enable FK pragma on connection; add `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);`.

---

### Minor

#### N1 — Leading whitespace in backend route files
- File: `src/backend/routes/auth.js` — **L1** (leading space before `const`)
- File: `src/backend/routes/tasks.js` — **L1** (leading space before `const`)
- Suggested fix:
  - Run Prettier/ESLint formatting.

#### N2 — Unused imports in DashboardPage
- File: `src/frontend/src/pages/DashboardPage.jsx` — **L2–L3** imports `Select, MenuItem, FormControl, InputLabel` but they are unused.
- Suggested fix:
  - Remove unused imports; enforce ESLint rule in CI.
