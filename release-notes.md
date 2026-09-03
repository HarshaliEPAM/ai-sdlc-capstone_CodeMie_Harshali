# Capstone Release Notes - v1.0.0-capstone

Release Tag: `v1.0.0-capstone`
Release Date: 2026-09-03

## Overview
This release packages the full-stack dashboard task listing enhancements (Search, Sort, Filter, Pagination) along with automated Playwright API validation.

## Included Features & Linked Jira Stories

- **EPMCDMETST-61074**: Search Tasks – Server support for search query parameters to locate tasks by title/description.
- **EPMCDMETST0-61075**: Sort Tasks – Allowlist sorting on common fields with asc/desc order.
- **EPMCDMETST0-61076**: Filter Tasks – Filter tasks by status, priority, and category.
- **EPMCDMETST0-61077**: Paginate Tasks – paged listing with page/limit and response metadata.

## Automated QA Validation Status
- Playwright API test suites have been committed and opened for review for Search, Sort, Filter, and Pagination stories (e.g. PR #48‐#51).
- Run automated tests: `npx playwright test`. (see commands below)

## Database Schemas & Migration Notes
- No database schema changes or explicit migrations were added in this release.

## Build & Local Deployment Instructions
Prerequisites:
- Node.js + npm

1) Install dependencies

```bash
npm install
```

2) Build

```bash
npm run build
```

3) Run locally

```bash
npm start
```

4) Run automated Playwright API tests

```bash
export API_BASE_URL=http://localhost:5000/api
npx playwright test
```
