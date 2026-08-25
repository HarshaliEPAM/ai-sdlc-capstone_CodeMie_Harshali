# Capstone Release Notes - v1.0.0-capstone

Release Version / Tag: `v1.0.0-capstone`

Release Date: 2026-08-25

Repository: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali

BRANCH PACKAGE FOR this release: `release/v1.0-capstone`

---

## Summary

This release packages the core task list enhancements for the Capstone project: **Search*, **Sort*, **Filter**, and **Pagination** on the task list view and GET `/api/tasks` and packages the corresponding Playwright API automated test suites.

---

## Included Features & Linked Jira Stories

- **EPMCDMETST0-61074: Search Tasks**
  - Adds search support to task list via `GET /api/tasks?search=`text``.
  - Behavior: partial and case-insensitive matching against title/description (per technical design and QA TDD).
  - Related PRs: #44 (feat), #48 (test)

- **EPMODDMETST-61075: Sort Tasks**
  - Adds sorting support to task list via `GET /api/tasks?sortBy=&order=`.
  - Expected allowlist: `sortBy` (e.g. `created_at`, `title`) and `order` (`asc|desc`).
  - Related PRs: #45 (feat), #49 (test)

- **EPMODDMETST-61076: Filter Tasks**
  - Adds filtering support via `GET /api/tasks?status=&priority=&category=`.
  - Expected enum: `status` (`Todo|InProgress|Done`), `priority` (`High|Medium|Low`), `category` (exact match).
  - Related Rs: #46 (feat), #50 (test)

- **EPMODDMETST-61077: Paginate Tasks**
  - Adds paged results on `GET /api/tasks?page=&limit=`.
  - Response includes pagination metadata (per tests).
  - Related Rs: #47 (feat), #51 (test)

Note: All features are implemented full-stack (frontend + backend) as part of the feature PRS. Individual validation rules (e.g., 400 for invalid allowlist values) may vary depending on backend enforcement; the Playwright suites set expectations accordingly.

---

## Automated QA Validation Status

Playwright API test suites have been committed and opened as QR for each story:

  - **EPMCDMETST0-61074: Search**: PR #48
  - **EPMCDMETST0-61075: Sort**: PR #49
  - **EPMODDMETST-61076: Filter**: PR #50
  - **EPMODDMETST-61077: Pagination**: PR #51

ToExecute Tests Locally:

- Start backend (ensure the API base URL matches the test run)
- Run:
  ```bash
  API_BASE_URL=http://localhost:5000/api npx playwright test src/tests/e2e/api
  ```

## Database Schemas & Migration Notes

- No explicit database migrations are included in this release package.
 - If your environment uses a persistent datastore, ensure you have standard backup/restore procedures in place before deploying.

---

## Build & Local Deployment Instructions

1) Clone and install dependencies:
 ```bash
  git clone https://github.com/HarshaliEPAM/ai-sd lc-capstone_CodeMie_Harshali.git
  cd ai-sdlc-capstone_CodeMie_Harshali
  npm install
  ```

2) Build:
```bash
  npm run build
  ```

3) Start the app:

- Start backend (commands may vary by repo scripts):
  ```bash
  npm run start
  ```

4) Verify functionality:
- Open the UI in your browser (as configured)
- Verify task list: search, sort, filter, paginate
- Verify API endpoint: `GET /api/tasks` with query params listed above

Optional: run automated tests:

 ```bash
  API_BASE_URL=http://localhost:5000/api npx playwright test src/tests/e2e/api
  ```

---

## List of Release PRs (For Traceability)

// Feature PRS
- #44 feat(EPMCDMETST0-61074): Search Tasks
- #45 feat(EPMCDMETST-61075): Sort Tasks
- #46 feat(EPMODDMETST-61076): Filter Tasks
- #47 feat(EPMCDMETST0-61077): Paginate Tasks

// QA Playwright API Test Suites
- #48 test(EPMCDMETST-61074): QA Automated API Test Suite
- #49 test(EPMCDMETST0-61075): QA Automated API Test Suite
- #50 test(EPMCDMETST-61076): QA Automated API Test Suite
- #51 test(EPMCDMETST0-61077): QA Automated API Test Suite
