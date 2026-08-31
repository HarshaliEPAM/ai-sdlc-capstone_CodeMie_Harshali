const ALLOWED_SORT_BY = new Set([
  'title',
  'status',
  'priority',
  'category',
  'due_date',
  'created_at',
]);

const ALLOWED_SORT_ORDER = new Set(['asc', 'desc']);

function isValidDateString(value) {
  if (value === undefined || value === null || value === '') return true;
  const t = Date.parse(value);
  return Number.isFinite(t);
}

function buildTaskQuery({ userId, filters = {} }) {
  const {
    search,
    status,
    priority,
    category,
    dueFrom,
    dueTo,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  if (!ALLOWED_SORT_BY.has(sortBy)) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          error: 'VALIDATION_ERROR',
          message: `Invalid sortBy. Allowed: ${Array.from(ALLOWED_SORT_BY).join(', ')}`,
        },
      },
    };
  }

  const normalizedSortOrder = String(sortOrder).toLowerCase();
  if (!ALLOWED_SORT_ORDER.has(normalizedSortOrder)) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          error: 'VALIDATION_ERROR',
          message: 'Invalid sortOrder. Allowed: asc, desc',
        },
      },
    };
  }

  if (!isValidDateString(dueFrom) || !isValidDateString(dueTo)) {
    return {
      ok: false,
      error: {
        status: 400,
        body: { error: 'VALIDATION_ERROR', message: 'Invalid dueFrom/dueTo date format' },
      },
    };
  }

  if (dueFrom && dueTo) {
    const fromT = Date.parse(dueFrom);
    const toT = Date.parse(dueTo);
    if (Number.isFinite(fromT) && Number.isFinite(toT) && fromT > toT) {
      return {
        ok: false,
        error: {
          status: 400,
          body: { error: 'VALIDATION_ERROR', message: 'dueFrom must be <= dueTo' },
        },
      };
    }
  }

  const where = ['user_id = ?'];
  const params = [userId];

  if (search) {
    where.push('(title LIKE ? OR description LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q);
  }

  if (status) {
    where.push('status = ?');
    params.push(status);
  }

  if (priority) {
    where.push('priority = ?');
    params.push(priority);
  }

  if (category) {
    where.push('category = ?');
    params.push(category);
  }

  if (dueFrom) {
    where.push('due_date >= ?');
    params.push(dueFrom);
  }

  if (dueTo) {
    where.push('due_date <= ?');
    params.push(dueTo);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = `ORDER BY ${sortBy} ${normalizedSortOrder.toUpperCase()}`;
  const sql = `SELECT * FROM tasks ${whereSql} ${orderSql}`;

  return { ok: true, sql, params };
}

module.exports = {
  buildTaskQuery,
  ALLOWED_SORT_BY,
  ALLOWED_SORT_ORDER,
};
