Test Execution Report

Repository: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali
Branch: main
Generated: 2026-08-06

Total test cases listed: 27
 - Gherkin scenarios: 12
   - auth.feature: 7
   - tasks.feature: 5
  - UI scenarios are in tasks.feature: 5
  - Note: `@pi` and `@spice p@ui` tags appear to be typos.
 - Playwright tests (test()): 15
   - src/tests/e2e/auth.api.spec.js: 6
   - src/tests/e2e/tasks.api.spec.js: 4
   - src/tests/e2e/ui.spec.js: 5

Expected results (baseline)
 - Gherkin scenarios: expected PASS subject to step definitions and error-message alignment.
 - Playwright specs as-is: expected FAIL to parse/run due to syntax issues in the spec files.

Torun locally
  1) npm ci
  2) npx playwright install --with-deps
  3) export API_BASE_URL=http://localhost:5000/api
  4) export E2E_BASE_URL=http://localhost:5173
  5) npx playwright test
