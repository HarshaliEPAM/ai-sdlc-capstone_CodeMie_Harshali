# Local Test Report

## Scope

- Backend: JUnit and Spring Boot tests for task service and controller behavior.
- Frontend: React Testing Library tests for rendering, creation, validation, loading errors, and deletion.

## Validation

Run locally with:

```text
mvn test
cd frontend
npm install
npm test -- --watchAll=false
npm run build
```

The commands are intentionally local and use the in-memory H2 database; no Jira, Confluence, GitHub, or credentials are needed.

## Results

- `mvn test`: passed, 6 tests, 0 failures.
- `npm --prefix frontend test -- --watchAll=false`: passed, 3 suites and 6 tests.
- `npm --prefix frontend run build`: passed.
- Frontend tests complete without React `act(...)` warnings.
# Test Report

## Summary
- Date: 2026-09-03
- Scope: Simple Task Manager backend and frontend
- Backend: 6 tests passed, 0 failures, 0 errors
- Frontend: 6 tests passed, 0 failures, 0 errors
- Frontend coverage: 83.11% statements, 83.82% lines, 70.58% branches, 71.42% functions

## Commands
- `mvn test` - passed; compilation and 6 JUnit tests succeeded.
- `npm install` from `frontend/` - passed; dependencies installed.
- `npm test -- --watchAll=false` from `frontend/` - passed; 6 RTL tests succeeded.
- `npm test -- --coverage --watchAll=false` from `frontend/` - passed; coverage exceeded the 70% target.
- `npm run build` from `frontend/` - passed; production bundle compiled.
- `mvn clean package` - not completed because Maven stalled downloading packaging-plugin dependencies at very low network throughput after compilation. The focused `mvn test` build gate passed.

## Coverage Notes
Backend line coverage was not measured because no coverage plugin was present in the supplied build. Service and controller paths cover creation, listing, lookup failure, deletion, and validation behavior.

## Warnings
The app-level React smoke test emitted React `act(...)` warnings while its async child list fetch completed. Tests still passed; this is a follow-up cleanup item.

## External Integrations
Jira and Confluence test pages were skipped as requested. No credentials or `.env` values were read or used.