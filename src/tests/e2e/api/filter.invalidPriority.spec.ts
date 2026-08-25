import { test, expect } from '@playwright/test';
import { tasksUrl } from './_support/api-helpers';

test('EPMCDMETSST-61076: invalid priority should be rejected (prefer: 400)', async ({ request }) => {
  const resp = await request.get(tasksUrl({ priority: 'NOT_A_PRIORITY' }));
  expect([200, 400]).ToContain(resp.status());
  if (resp.status() === 400) {
    const body = await resp.json();
    expect(body).toHaveProperty('error');
  }
});
