const crypto = require('crypto');

/**
 * Generates a unique, repeatable-enough test string for use in username/email/titles.
 */
function uniqueSuffix(prefix = 'e22') {
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${Date.now()}-${rand}`;
}

function normalizeApiBaseUrl(apiBaseUrl) {
  const raw = (apiBaseUrl || 'http://localhost:5000/api').trim();
  const withScheme = raw.startsWith('http') ? raw : `http://${raw}`;
  return withScheme.endsWith('/api') ? withScheme : `${withScheme.replace(/\/+$/, '')}/api`;
}

async function apiRegister(request, apiBaseUrl, { username, email, password }) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const res = await request.post(`${base}/auth/register`, {
    data: { username, email, password }
  });
  return res;
}

async function apiLogin(request, apiBaseUrl, { email, password }) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const res = await request.post(`${base}/auth/login`, {
    data: { email, password }
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function apiCreateTask(request, apiBaseUrl, token, data) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const res = await request.post(`${base}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    data
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function apiGetTasks(request, apiBaseUrl, token) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  const res = await request.get(`${base}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json().catch(() => ([]));
  return { res, body };
}

module.exports = {
  uniqueSuffix,
  apiRegister,
  apiLogin,
  apiCreateTask,
  apiGetTasks
};
