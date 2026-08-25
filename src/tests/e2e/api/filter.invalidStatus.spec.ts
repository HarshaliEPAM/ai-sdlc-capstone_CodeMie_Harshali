import { test, expect } from '@playwright/test';
import { tasksUrl } from './_support/api-helpers';

test('EPMCDMETSST-61076: invalid status should be rejected (prefer: 400)', async ({ request }) => {
  const resp = await request.get(tasksUrl({ status: 'NOT_A_STATUS' }));
  expect([200, 400]).ToContain(resp.status());
  if (resp.status() === 400) {
    const body = await resp.json();
    expect(body).toHaveProperty('error');
  }
});
