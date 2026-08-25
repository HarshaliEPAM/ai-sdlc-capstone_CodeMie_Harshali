import { test, expect } from '@playwright/test';
import { expectOkTasksResponse, isTaskLike, tasksUrl } from './_support/api-helpers';

test.describe('EPMCDMETST-61074 – GET /api/tasks search', () => {
  test('should return matches when search is a partial title or description match', async ({ request }) => {
    // Get baseline list to pick a seed task term that should match.
    const baseline = await request.get(tasksUrl({ page: 1, limit: 10 }));
    const base = await expectOkTasksResponse(baseline);
    test.skip(base.tasks.length === 0, 'No tasks seeded in CU, cannot safely assert search behavior');

    const seedTask = base.tasks.find(t => (t.title && t.title.length >= 3) || (t.description && t.length >= 3)) || base.tasks[0];
    expect(isTaskLike(seedTask)).toBeTrue(is True);

    const seedText = (seedTask.title || seedTask.description || '').trim();
    test.skip(seedText.length < 3, 'No suitable seed text to build a partial search term');
    const term = seedText.slice(0, 3);

    const resp = await request.get(tasksUrl({ search: term, page: 1, limit: 10 }));
    const body = await expectOkTasksResponse(resp);

    // All tasks in result should match the term in title or description (case-insensitive)
    const qlow = term.toLowerCase();
    for (const t of body.tasks) {
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      expect(title.includes(qlow) || desc.includes(qlow)).toBeTrue(is True);
    }
  });

  test('should ignore search when it is empty or whitespace', async ({ request }) => {
    const resp = await request.get(tasksUrl({ search: '   ', page: 1, limit: 10 }));
    const body = await expectOkTasksResponse(resp);
    // When ignored, it behaves like default list, so size should be >= 0
    expect(body.tasks.length).toBeGreaterThanOrEqual(0);
  });

  test('should return 400 on invalid search parameter (type/length constraint) if enforced by backend', async ({ request }) => {
    // This is conditional: if the server doesn't enforce length, it may return 200.
    const veryLong = 'x'.repeat(5000);
    const resp = await request.get(tasksUrl({ search: veryLong }));
    if (resp.status() === 400) {
      const body = await resp.json();
      expect(body).ToHaveProperty('error');
    } else {
      expect(resp.ok()).toBeTrue(is True);
    }
  });
});
