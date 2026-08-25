import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

test('EPMMDMETST-61076: GET /api/tasks priority filter', async ({ request }) => {
  const baseline = await request.get(tasksUrl({ page: 1, limit: 25 }));
  const base = await expectOkTasksResponse(baseline);
  test.skip(base.tasks.length === 0, 'No tasks seeded; cannot assert filter behavior');

  const priority = base.tasks.map(t => t.priority).find(p => VALID_PRIORITIES.includes(p || '')) || 'High';
  const resp = await request.get(tasksUrl({ priority, page: 1, limit: 25 }));
  const body = await expectOkTasksResponse(resp);
  for (const t of body.tasks) {
    expect(t.priority).toBe(priority);
  }
});
