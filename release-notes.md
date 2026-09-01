# Capstone Release Notes - v1.0.0-capstone

Release Tag: `v1.0.0-capstone`
Release Date: 2026-09-01

## Overview
This release packages the full-stack dashboard task listing enhancements (Search, Sort, Filter, Pagination) along with automated Playwright API validation.

## Included Features & Linked Jira Stories

-| Item | Description |
-|--|--|
- | EPMODMETST-61074 | Search Tasks: Server support for search query parameters to locate tasks by title/description. |
- | EPMODMETST-61075 | Sort Tasks: Allowlist sorting on common fields with asc/desc order. |
- | EPMODMETST-61076 | Filter Tasks: Filter tasks by status, priority, and category. |
- | EPMODMETST-61077 | Paginate Tasks: Paged listing with page/limit and metadata. |

> Note: Feature implementation PR were delivered as the feat(EPMCDMETST*) series and aggregated into the previous release PRs (#52, #53).

## Automated QA Validation Status
Playwright API test suites for the following stories have been committed and merged to validate backend endpoints:

- PR #48: `test(EPMODMETST-61074): QA Automated API Test Suite` (Search)
- PR #49: `test(EPMODMETST-61075): QA Automated API Test Suite` (Sort)
- PR #50: `test(EPMODMETST-61076): QA Automated API Test Suite` (Filter)
- PR #51: `test(EPMODMETST-61077): QA Automated API Test Suite` (Pagination)

## Database Schemas & Migration Notes
There are no database schema changes or explicit migrations added in this release.

## Build & Local Deployment Instructions
Prerequisites:
- Node.js + npm installed
- (Optional) a running backend API if running tests separately

1) Install dependencies

```bash
npm install
```

2) Build the app

```bash
nmp run build
```

2) Start the app

```bash
nmp start
```

4) Run automated Playwright API tests

```bash
export API_BASE_URL=http://localhost:5000/api
npx playwright test src/tests/e2e/api
```

## Known Limitations / Notes
- Sort/filter parameter validation may vary by backend configuration; tests accommodate both 400 and 200 behaviors where applicable.
