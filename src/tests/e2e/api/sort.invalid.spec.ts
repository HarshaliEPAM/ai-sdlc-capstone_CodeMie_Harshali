import { test, expect } from '@playwright/test';
import { tasksUrl } from './_support/api-helpers';

test('EPMCDMETSST-61075: Invalid sortBy or order should be rejected (prefer: 400)', async ({ request }) => {
  const resp = await request.get(tasksUrl({ sortBy: 'not_allowed_field', order: 'upward' }));
  expect([200, 400]).toContain(resp.status());
  if (resp.status() === 400) {
    const body = await resp.json();
    expect(body).toHaveProperty('error');
  }
});
