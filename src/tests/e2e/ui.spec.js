const { test, expect } = require('@playwright/test');
const { uniqueSuffix, apiRegister } = require('./utils');

// UI tests require the frontend dev server to be running.
// - Start frontend: `npm run dev:frontend`
// - Start backend:  `npm run start:backend`
const E2E_BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:5173').trim();
// API_BASE_URL should include /api (used by apiRegister helper)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function registerUserViaApi(request) {
  const suf = uniqueSuffix('ui');
  const username = `e2e-${suf}`;
  const email = `e2e-ui-${suf}@test.com`;
  const password = 'P@ssw0rd!234!';
  await apiRegister(request, API_BASE_URL, { username, email, password });
  return { username, email, password };
}

async function uILogin(page, creds) {
  await page.goto(`${E2E_BASE_URL}/login`);
  await page.getByTestId('email').locator('input').fill(creds.email);
  await page.getByTestId('password').locator('input').fill(creds.password);
  await page.getByTestId('login-btn').click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('UI - Auth, Tasks, Dashboard', () => {
  test('login via UI navigates to dashboard', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);
    await expect(page.getByText(/Welcome,/)).toBeVisible();
    await expect(page.getByTestId('add-task-btn')).toBeVisible();
  });

  test('create task via UI is displayed on dashboard', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const title = `UI Task ${uniqueSuffix('title')}`;
    await page.getByTestId('add-task-btn').click();
    await page.getByTestId('task-title').locator('input').fill(title);
    await page.getByTestId('save-task-btn').click();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('update task via UI (priority high and due date)', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const origTitle = `UI Edit ${uniqueSuffix('title')}`;

    // create task
    await page.getByTestId('add-task-btn').click();
    await page.getByTestId('task-title').locator('input').fill(origTitle);
    await page.getByTestId('save-task-btn').click();
    await expect(page.getByText(origTitle)).toBeVisible();

    // click Edit button for the card containing this task
    // The title is rendered as a <Typography variant="h6"> within the card.
    const card = page.getByRole('heading', { name: origTitle }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Edit' }).click();

    // update
    // MUI Select is not a native <select>
    await page.getByTestId('priority').click();
    await page.getByRole('option', { name: 'High' }).click();
    await page.getByLabel('Due Date').fill('2099-12-31');
    await page.getByTestId('save-task-btn').click();

    await expect(page.getByTestId('priority-badge-high').first()).toBeVisible();
    await expect(page.getByText(/Due:\s*2099-12-31/)).toBeVisible();
  });

  test('delete task via UI removes card', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const title = `UI Delete ${uniqueSuffix('title')}`;
    await page.getByTestId('add-task-btn').click();
    await page.getByTestId('task-title').locator('input').fill(title);
    await page.getByTestId('save-task-btn').click();
    await expect(page.getByText(title)).toBeVisible();

    // Delete first matching card action
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test('dashboard filter by status chip Todo', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const todoTitle = `Filter Todo ${uniqueSuffix('title')}`;
    const doneTitle = `Filter Done ${uniqueSuffix('title')}`;

    // Todo
    await page.getByTestId('add-task-btn').click();
    await page.getByTestId('task-title').locator('input').fill(todoTitle);
    await page.getByTestId('save-task-btn').click();
    await expect(page.getByText(todoTitle)).toBeVisible();

    // Done
    await page.getByTestId('add-task-btn').click();
    const dlg = page.getByRole('dialog');
    await dlg.getByTestId('task-title').locator('input').fill(doneTitle);

    // Status is a MUI Select.
    // From the DOM snapshot, the clickable element is a combobox within the dialog.
    await dlg.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Done' }).click();

    await dlg.getByTestId('save-task-btn').click();
    await expect(page.getByText(doneTitle)).toBeVisible();

    // Click Todo chip (Chip label like "Todo: N")
    await page.getByText(/^Todo:/).first().click();

    await expect(page.getByText(todoTitle)).toBeVisible();
    await expect(page.getByText(doneTitle)).toHaveCount(0);
  });
});
