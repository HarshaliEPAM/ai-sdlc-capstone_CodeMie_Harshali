import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

test('EPMCDMETST-61076: GET /api/tasks category filter', async ({ request }) => {
  const baseline = await request.get(tasksUrl({ page: 1, limit: 25 }));
  const base = await expectOkTasksResponse(baseline);
  test.skip(base.tasks.length === 0, 'No tasks seeded; cannot assert category filter');

  const category = base.tasks.map(t => t.category).find(c => typeof c === 'string' && c.trim().length > 0);
  test.skip(!category, 'No task with non-empty category to validate exact match');

  const resp = await request.get(tasksUrl({ category: category!, page: 1, limit: 25 }));
  const body = await expectOkTasksResponse(resp);
  for (const t of body.tasks) {
    expect(t.category).toBe(category);
  }
});
