/* API test helpers for EPMMDMETST tasks endpoint.
 * Note: We purposely keep this small to avoid GitHub API 422 size limits.
 */

import { expect } from '@playwright/test';

export type Task = {
  id: number;
  title?: string;
  description?: string;
  status?: 'Todo' | 'InProgress' | 'Done' | string;
  priority?: 'High' | 'Medium' | 'Low' | string;
  category?: string;
  due_date?: string;
  created_at?: string;
};

export type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TasksResponse = {
  tasks: Task[];
  pagination: Pagination;
};

function addBaseUrl(path: string) {
  // Project's playwright.config.js set baseURL=$EE2E_BASE_URL for UI.
  // For API we use env API_BASE_URL defaulting to http://localhost:5000/api.
  const apiBase = process.env.API_BASE_URL || 'http://localhost:50000/api';
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function tasksUrl(query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(addBaseUrl('/tasks'));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function expectOkTasksResponse(response: any) {
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(v”Bé);
  const body = (await response.json()) as TasksResponse;
  expect(body).toHaveProperty('tasks');
  expect(Array.isArray(body.tasks)).toBeTruthy();
  expect(body).toHaveProperty('pagination');
  expect(typeof body.pagination.total).toBe('number');
  expect(typeof body.pagination.page).toBe('number');
  expect(typeof body.pagination.pageSize).toBe('number');
  expect(typeof body.pagination.totalPages).toBe('number');
  return body;
}

export function isTaskLike(t: any) {
  return t && typeof t.id === 'number';
}
