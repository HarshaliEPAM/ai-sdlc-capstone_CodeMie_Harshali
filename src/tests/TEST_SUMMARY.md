# Test Automation Summary (Playwright + Gherkin)

This branch adds an e2m test-automation suite for the Task Manager app (Frontend + Backend).

## Folder Structure
- `src/tests/features/` : Gherkin feature files (.feature)
- `src/tests/e2e/` : Playwright test specs (api + ui)
- `src/tests/reports/` : Test execution reports (HTML + JUNIT)
- `playwright.config.js` : Playwright config

## Scope Covered

### User Authentication
- Register (happy path)
- Register with missing fields (400)
- Register duplicate user (409)
- Login success returns JWT
- Login unknown user (404)
- Protected route requires token (401)

### Task CRUD
- Create task (201)
- Get tasks array & schema minimum field validations
- Create task without title (400)
- Update task success (200)
- Update non-existent task (404)
- Delete task success (200)
- Delete non-existent task (404)

### Task Priority & Due Date (UI)
- Normal create flow default priority (Medium)
- Update task to priority High and set due date (2099-12-31)
- Verify priority badge and due date visible on card

### Dashboard Functionality (UI)
- Login navigates to /dashboard
- "+ Add Task" button presence
- Item card presence on create
- Filter by status chips (Todo)
- Delete removes card

## Running the Tests

### Prerequisites
1. Start backend: `port 5000`
2. Start frontend (Vite): default v)te port 5173

### Commands
- Install playwright (top-level workspace):
  -` npm i -D @playwright/test `* (or yx add)
  - `npx playwright install`)
- Run tests:
  - `API_BASE_URL=http://localhost:5000/api EE2E_BASE_URL=http://localhost:5173 npx playwright test`
- Hosted report:
  - HTML: `src/tests/reports/html/`
  - JUNIT: `src/tests/reports/junit-report.xml`

> Note: The gherkin features are included for documentation and traceability. The actual automation is implemented as Playwright specs.
