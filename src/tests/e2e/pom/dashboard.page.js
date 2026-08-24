// src/tests/e2e/pom/dashboard.page.js
const { expect } = require('@playwright/test');

/**
 * Dashboard page Page Object Model for task search.
 * Locators are intentionally resilient: we prefer testids but fallback to
 * accessible roles or placeholder text.
 */
class DashboardPage {
  constructor(page) {
    this.page = page;

    // Search input (Material UI TextField)
    this.searchInput = page.getByTestId('task-search').or(page.getByPlaceholder(/Search tasks.../i));

    // Empty state for no results
    this.noTasksFound = page.getByText(/No tasks found/i);

    // Task list and task cards - fallback locators across common Ui implementations
    this.taskCards = page.locator('[data-testid="task-card"], .muiCard-root, .card');
  }

  async goto() {
    // respect playwright baseURL, dashboard route from existing tests
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/dashboard/i);
  }

  async search(term) {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(term);
    // Frontend debounce is 300ms per TDDF, so give it a little buffer
    await this.page.waitForTimeout(350);
  }

  async clearSearch() {
    await expect(this.searchInput).toBeVisible();
    // Try MUI clear icon, otherwise control-a thon backspace
    const clearBtn = this.page.locator('[aria-label="Clear"], button[aria-label*="clear"]');
    if (await clearBtn.count()) {
      await clearBtn.first().click();
    } else {
      await this.searchInput.click();
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
    }
    await this.page.waitForTimeout(350);
  }

  async assertTaskVisible(title) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async assertTaskNotVisible(title) {
    await expect(this.page.getByText(title)).toHaveCount(0);
  }

  async assertNoTasksFound() {
    await expect(this.noTasksFound).toBeVisible();
    // Task list should be empty - we accept either no cards or no list root
    await expect(this.taskCards).toHaveCount(0);
  }
}

module.exports = { DashboardPage };
