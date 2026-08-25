# Capstone Release Notes – v1.0.0-capstone

**Release Version / Tag:** `v1.0.0-capstone`

**Release Date:** 2026-08-25

## Summary

This release packages the capstone full-stack Task list enhancements for end-users and includes automated Playwright API validation. Scope includes: Search, Sort, Filter, and Pagination.

## Included Features & Linked Jira Stories

- **EPMCDMETST-61074: Search Tasks**
  - Adds search capability to quickly find tasks by relevant text fields.
- **EPMCDMETST-61075: Sort Tasks**
  - Allows sorting tasks by supported fields and directions to improve list usability.
  - Expected to handle ascending/descending order as implemented in the service/client.
- **EPMCDMETST-61076: Filter Tasks**
  - Enables filtering tasks by status/attributes to narrow results.
- **EPMCDMETST-61077: Paginate Tasks**
  - Adds page-based result retrieval to improve performance and UX on large datasets.
  - Expected parameters: page, pageSize (or limit/offset, depending on implementation).

## Database Schemas & Migration Notes

- No database schema changes or migrations are required for this release (as packaged in this repos state).
- If your deployment upgrades an external DB/backend, verify backend configuration variables are unchanged.

## Automated QA Validation Status

- Playwright API test suites are included in this repository (configured via `playwright.config.js`).
- Release expectation: automated tests cover the Search/Sort/Filter/Pagination behaviors at the API layer where applicable.

Run automated tests:

 ``bash
 npx playwright install --deps
 npx playwright test
 ```

## Build & Local Deployment Instructions

**Prerequisites:**
 - Node.js LTS (18+ recommended)
 - npm (9+)

1) Install dependencies:

``bash
npm install
```

2) Build the project:

```bash
npm run build
```

3) Start the app locally:

```bash
npm start
```

4) (Optional) Run tests locally:

```bash
npx playwright test
```


## Release Change Risk & Rollback Plan
- Risk level: Low-to-Moderate (Ua/Ui query handling changes).
- Rollback: Revert the release PR or replace with prior tag/commit if production issues are observed.

## References
- Repository: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali
- JIRA: EPMCDMETST-61074..61077
