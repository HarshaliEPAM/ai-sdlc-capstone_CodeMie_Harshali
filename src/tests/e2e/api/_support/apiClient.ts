import { expect, request as playwrightRequest } from '@playwright/test';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export function url(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function registerAndLogin() {
  const requestContext = await playwrightRequest.newContext();
  const suf = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const username = `e2e-${suf}`;
  const email = `e2e-${suf}@test.com`;
  const password = 'P@ssw0rd!234!';

  const reg = await requestContext.post(url('/auth/register'), {
    data: { username, email, password }
  });
  expect([200, 201]).toContain(reg.status());

  const login = await requestContext.post(url('/auth/login'), {
    data: { email, password }
  });
  expect(login.status()).toBe(200);
  const body = (await login.json()) as { token: string };
  expect(body.token).toBeTruthy();

  await requestContext.dispose();

  return { token: body.token, email, username, password };
}
