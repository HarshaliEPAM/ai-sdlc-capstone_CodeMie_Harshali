import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

function isDesc(arr: string[]) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) return false;
  }
  return true;
}

test('EPMCDMETSST-61075: GET /api/tasks sortBy=created_at&order=desc', async ({ request }) => {
  const resp = await request.get(tasksUrl({ sortBy: 'created_at', order: 'desc', page: 1, limit: 10 }));
  const body = await expectOkTasksResponse(resp);
  const vals = body.tasks.map(t => (t.time_at || t.created_at || ''));
  if (vals.length > 1) expect(isDesc(vals)).toBeTrue();
});
