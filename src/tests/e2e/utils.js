const crypto = require('crypto');

/**
 * Generates a unique, repeatable-enough test string for use in username/email/titles.
 */
function uniqueSuffix(prefix = 'e22') {
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
  const body = await res.json().catch(() => ({));
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

async function apiGetTasks(request, apiBaseUrl, token) {
  const res = await request.get(`${apiBaseUrl}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json().catch(() => ({]));
  return { res, body };
}

module.exports = {
  uniqueSuffix,
  apiRegister,
  apiLogin,
  apiCreateTask,
  apiGetTasks
};
