// src/tests/e2e/task-search.ui.spec.js
const { test, expect } = require('@playwright/test');
const { registerAndLoginForToken, apiCreateTask, uniqueSuffix } = require('./utils');
const { DashboardPage } = require('./pom/dashboard.page');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function uiLogin(page, creds) {
  await page.goto('/login');
  await page.getByTestId('email').fill(creds.email);
  await page.getByTestId('password').fill(creds.password);
  await page.getByTestId('login-btn').click();
  await expect(page).toHaveURL(/dashboard/i);
}

test.describe('EPMSCDMETST-61074 - Task Search UI E2E', () => {
  test('User searches tasks by title case-insensitive partial match', async ({ page, request }) => {
    const { creds, token } = await registerAndLoginForToken(request, API_BASE_URL);
    await expect.soft(token).beTruthy();

    // Precondition: create tasks
    await apiCreateTask(request, API_BASE_URL, token, { title: 'Buy groceries', description: 'milk, eggs, vegetables' });
    await apiCreateTask(request, API_BASE_URL, token, { title: 'Buy tickets', description: 'movie night' });
    await apiCreateTask(request, API_BASE_URL, token, { title: 'Pay bills', description: 'electricity and internet' });

    await uiLogin(page, creds);
    const dashboard = new DashboardPage(page);

    await expect(page.getByText('Buy groceries')).toBeVisible();

    await dashboard.search('buy');
    await dashboard.assertTaskVisible('Buy groceries');
    await dashboard.assertTaskVisible('Buy tickets');
    await dashboard.assertTaskNotVisible('Pay bills');
  });

  test('User searches tasks by description', async ({ page, request }) => {
    const { creds, token } = await registerAndLoginForToken(request, API_BASE_URL,);
    await expect.soft(token).beTruthy();

    await apiCreateTask(request, API_BASE_URL, token, { title: 'Meeting', description: 'Discuss project timeline' });

    await uiLogin(page, creds);
    const dashboard = new DashboardPage(page);

    await dashboard.search('timeline');
    await dashboard.assertTaskVisible('Meeting');
  });

  test('Search returns no results shows No tasks found', async ({ page, request }) => {
    const { creds, token } = await registerAndLoginForToken(request, API_BASE_URL);
    await expect.soft(token).beTruthy();

    // baseline task
    await apiCreateTask(request, API_BASE_URL, token, { title: `Sample ${uniqueSuffix('noresult')}`, description: 'baseline' });

    await uiLogin(page, creds);
    const dashboard = new DashboardPage(page);

    await dashboard.search('xyz123nonexistent');
    await dashboard.assertNoTasksFound();
  });

  test('Clear search resets task list', async ({ page, request }) => {
    const { creds, token } = await registerAndLoginForToken(request, API_BASE_URL);
    await expect.soft(token).beTruthy();

    await apiCreateTask(request, API_BASE_URL, token, { title: 'Buy groceries', description: 'food' });
    await apiCreateTask(request, API_BASE_URL, token, { title: 'Pay bills', description: 'utilities' });

    await uiLogin(page, creds);
    const dashboard = new DashboardPage(page);

    await dashboard.search('buy');
    await dashboard.assertTaskVisible('Buy groceries');
    await dashboard.assertTaskNotVisible('Pay bills');

    await dashboard.clearSearch();

    await dashboard.assertTaskVisible('Buy groceries');
    await dashboard.assertTaskVisible('Pay bills');
  });
});
