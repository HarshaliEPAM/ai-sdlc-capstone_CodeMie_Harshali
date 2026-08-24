// src/tests/e2e/utils.js
const crypto = require('crypto');

/**
 * Generates a unique, repeatable-enough test string for use in username/email/titles.
 */
function uniqueSuffix(prefix = 'e2e') {
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${Date.now()}-${rand}`;
}

async function apiRegister(request, apiBaseUrl, { username, email, password }) {
  const res = await request.post(`${apiBaseUrl}/auth/register`, {
    data: { username, email, password }
  });
  return res;
}

async function apiLogin(request, apiBaseUrl, { email, password }) {
  const res = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password }
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function apiCreateTask(request, apiBaseUrl, token, data) {
  const res = await request.post(`${apiBaseUrl}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    data
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function apiGetTasks(request, apiBaseUrl, token, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.set(k, String(v));
  });
  const url = `${apiBaseUrl}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await request.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json().catch(() => ({ tasks: [] }));
  return { res, body };
}

async function registerAndLoginForToken(request, apiBaseUrl) {
  const suf = uniqueSuffix('search');
  const username = `e2e-${suf}`;
  const email = `e2e-${suf}@test.com`;
  const password = 'P@ssw0rd!234!';

  await apiRegister(request, apiBaseUrl, { username, email, password });
  const { res: loginRes, body } = await apiLogin(request, apiBaseUrl, { email, password });
  const token = body.token || body.accessToken || body.jwt;
  return { creds: { username, email, password }, loginRes, token };
}

module.exports = {
  uniqueSuffix,
  apiRegister,
  apiLogin,
  apiCreateTask,
  apiGetTasks,
  registerAndLoginForToken
};
