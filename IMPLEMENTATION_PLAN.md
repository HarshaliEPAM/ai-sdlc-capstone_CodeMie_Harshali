# Implementation Plan – AI-driven SDLC Capstone (CodeMie)

Branch: `develop`
Repo: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali
Last review: 2026-08-06

---

## 1) Executive Summary

This repository contains a full-stack Task Manager application (React + Vite + MUI frontend, Node/Express backend, SQLite database). The core functional flow (register/login + task CRUD) exists, but the repo is missing key SDLC enablers: reproducible setup, tests, CI, security hardening, observability, and production-readiness basics.

This plan prioritizes fixing high-risk gaps (committed `node_modules`, lack of CI/tests, missing env/secret hygiene), then adds quality improvements (validation, standardized errors, logging, API docs), and finally developer-experience / UX enhancements.

Key outcomes after execution:
- Reproducible local setup with documented env vars
- CI quality gates (lint/build/tests)
- Secured config (fail-fast secrets) and improved API correctness
- Improved observability and maintainability

---

## 2) Current State Analysis

### 2.1 Architecture & components
- **Frontend:** React (Vite), Material UI, AuthContext, routes for Login/Register/Dashboard, axios service.
- **Backend:** Express API with `/api/auth` and `/api/tasks`, JWT auth middleware.
- **Database:** SQLite with `users` and `tasks` tables; schema executed on server start.

### 2.2 Observed gaps
- No CI workflows; no automated quality gates.
- No unit/integration/E2E tests in repo.
- `src/backend/node_modules` is committed (repo bloat + security/licensing risk).
- `docs/*` are placeholders; README lacks setup/run instructions.
- Frontend hardcodes `http://localhost:5000/api` in `src/frontend/src/services/api.js`.
- No centralized request validation; task update can accept undefined fields.
- No global error handler; error shapes differ by endpoint.
- Express 5.x used (alpha); may cause ecosystem compatibility issues.

---

## 3) Proposed Enhancements (with Priorities)

Priority definitions:
- **High:** blocks reproducibility/security/quality gates
- **Medium:** improves maintainability/operations
- **Low:** UX / nice-to-have

### E1 (High) Remove committed dependencies (`node_modules`) and fix `.gitignore`
**Gap:** `src/backend/node_modules` is tracked in git.

**Technical approach:**
- Update root `.gitignore` to ignore `node_modules`, build outputs (`dist`, `build`), `.env*`, DB files, logs.
- Remove from index: `git rm -r --cached src/backend/node_modules`.
- Validate clean install with `npm ci` and `npm run dev`.

**Definition of Done:**
- `node_modules` not tracked anywhere.
- Fresh clone + `npm ci` works.
- Repo size drops significantly.

---

### E2 (High) Add CI pipeline (GitHub Actions)
**Gap:** no CI.

**Technical approach:**
- Add `.github/workflows/ci.yml`:
  - setup Node
  - install frontend/backend deps
  - run frontend lint/build
  - run backend test/lint (add lint script if needed)
- Add caching for npm.

**Definition of Done:**
- Workflow runs on PRs and pushes to `develop`.
- Failures block merges (via branch protection, if enabled later).

---

### E3 (High) Config hardening & secret management
**Gap:** missing env examples; JWT secret not validated.

**Technical approach:**
- Add `src/backend/.env.example` including `JWT_SECRET`, `PORT`, `DB_PATH`.
- Add `src/frontend/.env.example` including `VITE_API_URL`.
- Validate required env vars at backend start (fail-fast with clear error).

**Definition of Done:**
- New developer can configure env by copying examples.
- Server startup fails with actionable message if `JWT_SECRET` missing.

---

### E4 (High) Request validation + consistent error shape + global error handler
**Gap:** inconsistent validation and error responses.

**Technical approach:**
- Introduce request schema validation middleware (Zod or Joi).
- Standardize error responses: `{ code, message, details }`.
- Add a global Express error-handling middleware.

**Definition of Done:**
- Invalid inputs return 400 with standardized error shape.
- All unhandled errors flow through global handler.

---

### E5 (Medium) Add automated tests
**Gap:** no test coverage.

**Technical approach:**
- Backend: Jest (or Vitest) + Supertest for auth and tasks endpoints.
- Frontend: Vitest + React Testing Library smoke tests (login/register routing, dashboard rendering).

**Definition of Done:**
- Tests run locally and in CI.
- Coverage target: >= 60% for core modules (auth/tasks).

---

### E6 (Medium) Observability: structured logging + request id
**Gap:** console-only logging.

**Technical approach:**
- Add `pino` and request logging middleware.
- Generate request-id (header `x-request-id`), include in logs and response.

**Definition of Done:**
- Structured logs produced consistently.
- Requests can be traced end-to-end via request-id.

---

### E7 (Medium) Documentation & bootstrap
**Gap:** README/docs placeholders.

**Technical approach:**
- Update README with prerequisites, setup, run, test, and env.
- Populate `docs/architecture.md`, `docs/HLD.md`, `docs/LLD.md` with current design.

**Definition of Done:**
- A new developer can run the project using documentation only.

---

### E8 (Low) Frontend production readiness improvements
**Gap:** hardcoded backend URL; limited auth error UX.

**Technical approach:**
- Move baseURL into `import.meta.env.VITE_API_URL` with default.
- Add axios interceptor to handle 401/403 (logout + redirect to login).

**Definition of Done:**
- Frontend can be configured for different environments.
- Clear behavior on expired/invalid token.

---

### E9 (Low) Docker / one-command run
**Gap:** no containerized local run.

**Technical approach:**
- Add `docker-compose.yml` for frontend + backend.
- Add root scripts or Makefile for `dev`, `test`, `lint`.

**Definition of Done:**
- `docker compose up --build` starts the system locally.

---

## 4) Implementation Timeline (Sprints/Phases)

Assumption: 2-week sprints.

### Sprint 1 (Week 1–2): Repo sanity + CI + config
- E1 Remove committed `node_modules`, update `.gitignore`
- E2 Add CI workflows
- E3 Add env examples + fail-fast config

### Sprint 2 (Week 3–4): Validation + tests
- E4 Validation + standardized errors + global error handler
- E5 Backend + frontend tests

### Sprint 3 (Week 5–6): Observability + docs
- E6 Logging + request-id
- E7 Documentation completion

### Sprint 4 (Optional, Week 7–8): UX/DevOps
- E8 Frontend env + auth UX
- E9 Docker/one-command run

---

## 5) Resource Requirements
- 1 Full-stack engineer (Node + React) for 2–3 sprints
- Optional QA for regression and E2E expansion
- Access to Confluence space **MLG1**

---

## 6) Risk Assessment
- **Repo cleanup risk:** Removing `node_modules` produces huge diffs. Mitigation: do first, validate clean installs and CI.
- **Express 5 risk:** Potential incompatibilities. Mitigation: add tests and consider pinning Express 4 if needed.
- **DB init risk:** Schema executed on every start can mask migration needs. Mitigation: later add migration/versioning approach.
- **Confluence permissions risk:** API may reject page creation. Mitigation: search and update existing page if found.

---

## 7) Definition of Done (Meta)
- All High priority items delivered or tracked with issues.
- CI green on PR to `develop`.
- Documentation updated and accurate.
- Standardized API errors and tests for core flows.
