import { expect, request as playwrightRequest } from '@playwright/test';

// Expect API_BASE_URL to point to API root (including /api)
// Prefer env var, but normalize missing scheme (e.g. localhost:5000/api)
const rawBase = (process.env.API_BASE_URL || 'http://localhost:5000/api').trim();
const withScheme = rawBase.startsWith('http') ? rawBase : `http://${rawBase}`;
export const API_BASE_URL = withScheme.endsWith('/api') ? withScheme : `${withScheme.replace(/\/+$/, '')}/api`;

if (!/^https?:\/\//.test(API_BASE_URL)) {
  throw new Error(`Invalid API_BASE_URL resolved: ${API_BASE_URL}`);
}

// Backend route mount: server.js uses app.use('/api/auth', ...)
export const AUTH_BASE_PATH = '/auth'; // resolves to /api/auth/*

export function url(path: string) {
  // Always treat 'path' as relative to API_BASE_URL
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function registerAndLogin() {
  const requestContext = await playwrightRequest.newContext();
  const suf = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const username = `e2e-${suf}`;
  const email = `e2e-${suf}@test.com`;
  const password = 'P@ssw0rd!234!';

  const reg = await requestContext.post(url(`${AUTH_BASE_PATH}/register`), {
    data: { username, email, password }
  });
  expect([201]).toContain(reg.status());

  const login = await requestContext.post(url(`${AUTH_BASE_PATH}/login`), {
    data: { email, password }
  });
  expect(login.status()).toBe(200);
  const body = (await login.json()) as { token: string };
  expect(body.token).toBeTruthy();

  await requestContext.dispose();

  return { token: body.token, email, username, password };
}
