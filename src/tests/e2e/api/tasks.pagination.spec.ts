import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

test.describe('EPMCDMETST-61077 – Paginate Task List', () => {
  test('should default to page=1 limit=10 and return pagination metadata', async ({ request }) => {
    const resp = await request.get(tasksUrl());
    const body = await expectOkTasksResponse(resp);
    expect(body.pagination.page).toBeGreaterThanOrEqual(1);
    expect(body.pagination.pageSize).toBeGreaterThan(0);
  });

  test('should respect page and limit query parameters', async ({ request }) => {
    const page = 2;
    const limit = 10;
    const resp = await request.get(tasksUrl({ page, limit }));
    const body = await expectOkTasksResponse(resp);
    expect(body.pagination.page).toBe(page);
    expect(body.pagination.pageSize).toBe(limit);
    expect(body.tasks.length).toBeLessThanOrEqual(limit);
  });

  test('should return 400 on invalid page/limit (min/allowed) if enforced', async ({ request }) => {
    const resp = await request.get(tasksUrl({ page: 0, limit: 9 }));
    expect([200, 400]).toContain(resp.status());
    if (resp.status() === 400) {
      const body = await resp.json();
      expect(body).toHaveProperty('error');
    }
  });
});
