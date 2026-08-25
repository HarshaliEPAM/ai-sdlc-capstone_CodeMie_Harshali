import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, tasksUrl } from './_support/api-helpers';

function isAsc(arr: string[]) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}

test('EPMCDMETST-61075: GET /api/tasks sortBy=title&order=asc', async ({ request }) => {
  const resp = await request.get(tasksUrl({ sortBy: 'title', order: 'asc', page: 1, limit: 10 }));
  const body = await expectOkTasksResponse(resp);
  const titles = body.tasks.map(t => (t.title || '').toLowerCase());
  if (titles.length > 1) expect(isAsc(titles)).toBeTrue();
});
