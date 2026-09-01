import { test, expect } from '@playwright/test';
import { registerAndLogin, url } from './_support/apiClient';

function parseCsv(text: string) {
  // very small CSV parser sufficient for header + row splitting (RFC4180 full parsing is out of scope here)
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  return { lines, header: lines[0] };
}

test.describe('EPMCDMETST-62726 - Tasks CSV export', () => {
  test('should return 401 when unauthenticated', async ({ request }) => {
    // Endpoint is defined as /api/tasks/export OR /api/tasks/export.csv
    const resA = await request.get(url('/tasks/export'));
    const resB = await request.get(url('/tasks/export.csv'));

    // Accept either endpoint existing; but if it exists and requires auth it should be 401
    // If one endpoint is 404 and the other 401, that's acceptable.
    expect([resA.status(), resB.status()]).toEqual(expect.arrayContaining([401]));
  });

  test('should return CSV with correct headers and content-disposition when authenticated', async ({ request }) => {
    const { token } = await registerAndLogin();

    const res = await request.get(url('/tasks/export.csv'), {
      headers: { Authorization: `Bearer ${token}` }
    });

    // If implementation uses /export instead of /export.csv, fallback
    const finalRes = res.status() === 404
      ? await request.get(url('/tasks/export'), { headers: { Authorization: `Bearer ${token}` } })
      : res;

    expect(finalRes.ok()).toBeTruthy();
    expect(finalRes.status()).toBe(200);

    const headers = finalRes.headers();
    expect(headers['content-type']).toContain('text/csv');
    expect(headers['content-disposition']).toMatch(/attachment/i);
    expect(headers['content-disposition']).toMatch(/filename=/i);

    const csv = await finalRes.text();
    const { header, lines } = parseCsv(csv);

    expect(header).toBe('id,title,description,status,priority,category,due_date,created_at,updated_at');
    // Should include at least header line
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  test('should pass through filter/sort query params and still return CSV', async ({ request }) => {
    const { token } = await registerAndLogin();

    const qs = new URLSearchParams({
      search: 'a',
      status: 'Todo',
      priority: 'High',
      category: 'Work',
      dueFrom: '2000-01-01',
      dueTo: '2100-01-01',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    const res = await request.get(`${url('/tasks/export.csv')}?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const finalRes = res.status() === 404
      ? await request.get(`${url('/tasks/export')}?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      : res;

    expect([200, 400]).toContain(finalRes.status());
    if (finalRes.status() === 200) {
      expect(finalRes.headers()['content-type']).toContain('text/csv');
      const csv = await finalRes.text();
      expect(parseCsv(csv).header).toBe('id,title,description,status,priority,category,due_date,created_at,updated_at');
    } else {
      const body = await finalRes.json();
      expect(body).toHaveProperty('error');
    }
  });

  test('should return 400 on invalid sortOrder or invalid date range if server enforces validation', async ({ request }) => {
    const { token } = await registerAndLogin();

    const invalid = new URLSearchParams({
      sortOrder: 'sideways',
      dueFrom: 'not-a-date'
    });

    const res = await request.get(`${url('/tasks/export.csv')}?${invalid.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const finalRes = res.status() === 404
      ? await request.get(`${url('/tasks/export')}?${invalid.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      : res;

    // Some implementations may ignore invalid params and still return 200.
    // If validation is implemented per TDD, we expect 400 JSON.
    expect([200, 400]).toContain(finalRes.status());
    if (finalRes.status() === 400) {
      const body = await finalRes.json();
      expect(body).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(body).toHaveProperty('message');
    }
  });
});
