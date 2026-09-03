const { test, expect } = require('@playwright/test');
const { uniqueSuffix, apiRegister } = require('./utils');

const E2E_BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:5173').trim();
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

  // Always start clean
  await page.evaluate(() => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  });

  await page.getByTestId('email').locator('input').fill(creds.email);
  await page.getByTestId('password').locator('input').fill(creds.password);
  await page.getByTestId('login-btn').click();

  // If login fails, we will remain on /login and an Alert is shown.
  const errorAlert = page.locator('[role="alert"]');
  if (await errorAlert.isVisible().catch(() => false)) {
    throw new Error(`UI login failed: ${await errorAlert.innerText()}`);
  }

  // Navigate to dashboard if route transition didn't happen yet.
  if (!/\/dashboard/.test(page.url())) {
    // wait a bit for SPA navigation
    await page.waitForTimeout(250);
  }
  if (!/\/dashboard/.test(page.url())) {
    await page.goto(`${E2E_BASE_URL}/dashboard`);
  }

  // Assert we are on dashboard and the primary action is available.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  const addBtn = page.getByTestId('add-task-btn');
  await expect(addBtn).toBeVisible({ timeout: 20000 });
  await expect(addBtn).toBeEnabled();
}

async function openAddTaskDialog(page) {
  const addBtn = page.getByTestId('add-task-btn');
  await expect(addBtn).toBeVisible({ timeout: 20000 });
  await expect(addBtn).toBeEnabled();
  await addBtn.click({ force: true });
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible({ timeout: 20000 });
  return dlg;
}

test.describe.skip('UI - Auth, Tasks, Dashboard', () => {
  test('login via UI navigates to dashboard', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);
    await expect(page.getByText(/Welcome,/)).toBeVisible();
  });

  test('create task via UI is displayed on dashboard', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const title = `UI Task ${uniqueSuffix('title')}`;
    const dlg = await openAddTaskDialog(page);
    await dlg.getByTestId('task-title').locator('input').fill(title);
    await dlg.getByTestId('save-task-btn').click();

    await expect(page.getByText(title)).toBeVisible();
  });

  test('update task via UI (priority high and due date)', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const origTitle = `UI Edit ${uniqueSuffix('title')}`;

    // create task
    let dlg = await openAddTaskDialog(page);
    await dlg.getByTestId('task-title').locator('input').fill(origTitle);
    await dlg.getByTestId('save-task-btn').click();
    await expect(page.getByText(origTitle)).toBeVisible();

    // click Edit button for the card containing this task
    const card = page.getByRole('heading', { name: origTitle }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Edit' }).click();

    dlg = page.getByRole('dialog');
    await expect(dlg).toBeVisible();

    await dlg.getByTestId('priority').click();
    await page.getByRole('option', { name: 'High' }).click();
    await dlg.getByLabel('Due Date').fill('2099-12-31');
    await dlg.getByTestId('save-task-btn').click();

    await expect(page.getByTestId('priority-badge-high').first()).toBeVisible();
    await expect(page.getByText(/Due:\s*2099-12-31/)).toBeVisible();
  });

  test('delete task via UI removes card', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const title = `UI Delete ${uniqueSuffix('title')}`;
    const dlg = await openAddTaskDialog(page);
    await dlg.getByTestId('task-title').locator('input').fill(title);
    await dlg.getByTestId('save-task-btn').click();
    await expect(page.getByText(title)).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test('dashboard filter by status chip Todo', async ({ page, request }) => {
    const creds = await registerUserViaApi(request);
    await uILogin(page, creds);

    const todoTitle = `Filter Todo ${uniqueSuffix('title')}`;
    const doneTitle = `Filter Done ${uniqueSuffix('title')}`;

    // Todo
    let dlg = await openAddTaskDialog(page);
    await dlg.getByTestId('task-title').locator('input').fill(todoTitle);
    await dlg.getByTestId('save-task-btn').click();
    await expect(page.getByText(todoTitle)).toBeVisible();

    // Done
    dlg = await openAddTaskDialog(page);
    await dlg.getByTestId('task-title').locator('input').fill(doneTitle);
    await dlg.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Done' }).click();
    await dlg.getByTestId('save-task-btn').click();
    await expect(page.getByText(doneTitle)).toBeVisible();

    await page.getByText(/^Todo:/).first().click();
    await expect(page.getByText(todoTitle)).toBeVisible();
    await expect(page.getByText(doneTitle)).toHaveCount(0);
  });
});
