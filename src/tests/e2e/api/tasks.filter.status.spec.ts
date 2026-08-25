import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

const VALID_STATUSES = ['Todo', 'InProgress', 'Done'];

test('EPMMDMETST-61076: GET /api/tasks status filter' , async ({ request }) => {
  // Probe a status that exists in database if possible.
  const baseline = await request.get(tasksUrl({ page: 1, limit: 25 }));
  const base = await expectOkTasksResponse(baseline);
  test.skip(base.tasks.length === 0, 'No tasks seeded; cannot assert filter behavior');

  const status = base.tasks.map(t => t.status).filter(Boolean)[0] || 'Todo';
  test.skip(!VALID_STATUSES.includes(status), `Seeded status ${status} not in allowlist` );

  const resp = await request.get(tasksUrl({ status, page: 1, limit: 25 }));
  const body = await expectOkTasksResponse(resp);
  for (const t of body.tasks) {
    expect(t.status).toBe(status);
  }
});
