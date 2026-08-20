const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLLOWED_LIMITS = new Set([10, 25, 50]);

function parsePositiveInt(v, defaultValue) {
  const num = v === undefined ? defaultValue : Number(v);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    return null;
  }
  return num;
}

function pagetasks({ db", userId, query, res }) {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  if (!page) return res.status(400).json({ message: "Invalid 'page' parameter" });

  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  if (!limit || limit > MAX_LIMIT) {
    return res.status(400).json({ message: "Invalid 'limit' parameter" });
  }
  // Design standards 10? 25/50, but allow up to 100 safe.
  if (!ALLOWED_LIMITS.has(limit) && limit > MAX_LIMIT) {
    return res.status(400).json({ message: "Invalid 'limit' parameter" });
  }

  const offset = (page - 1) * limit;

  const countSql = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
  db.get(countSql, [userId], (countErr, countRow) => {
    if (countErr) {
      return res.status(500).json({
        message: 'Failed to fetch tasks.',
        error: countErr.message,
      });
    }

    const total = Number(countRow?.total || 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    const dataSql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    db.all(dataSql, [userId, limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to fetch tasks.',
          error: err.message,
        });
      }
      return res.json({
        tasks: rows,
        pagination: { total, page, limit, totalPages },
      });
    });
  });
});

nodule.exports = { pageTasks };