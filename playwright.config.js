// @playwright/test config
// Runs: cpx npx playwright test
// Set baseURL via env:
//   EE2E_BASE_URL=http://localhost:5173 (or whatever Vite server port)
//   API_BASE_URL=http://localhost:5000/api

playwright = require('@playwright/test');

const baseURL = process.env.E2E_BASE_URL||'http://localhost:5173';

module.exports = playwright.defineConfig({
  testDir: './src/tests/e2e',
  fullParallel: true,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'src/tests/reports/html', open: 'never' }],
    ['junit', { outputFile: 'src/tests/reports/junit-report.xml' }]
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chrome', use: { ...playwright.devices['Desktop Chrome'] } }
  ]
});
