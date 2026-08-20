const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// --------------------------------------------------
// Query parsing helpers (Search/Sort/Filter/Pagination)
// --------------------------------------------------

const STANDARD_PAGE_SIZE = 10;
const ALLOWED_LIMITS = new Set([10, 25, 50]);
const MAX_LIMIT = 100;

// Priority order weights for sorting.
const PRIORITY_WEIGHTS = { High: 3, Medium: 2, Low: 1 };

function badRequest(res, message) {
  return res.status(400).json({ error: 'BAD_REQUEST', message });
}

function trimOrNull(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function parsePagination(query) {
  const pageRaw = query.page;
  const limitRaw = query.limit;

  const page = pageRaw === undefined ? 1 : Number(pageRaw);
  if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1) {
    return { error: "Invalid 'page' parameter" };
  }

  const pageSize = limitRaw === undefined ? STANDARD_PAGE_SIZE : Number(limitRaw);
  if (!Number.isFinite(pageSize) || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_LIMIT) {
    return { error: "Invalid 'limit' parameter" };
  }
  // Design allows 10/25/50, but also accepts up to 100 as safe cap; we enforce cap and allow standards or others up to cap.
  if (!ALLOWED_LIMITS_HAS(pageSize) && pageSize > MAX_LIMIT) {
    return { error: "Invalid 'limit' parameter" };
  }

  return { page, pageSize, offset: (page - 1) * pageSize };
}

function buildWhereClause({ userId, status, priority, category, search }) {
  const where = ['user_id = ?'];
  const params = [userId];

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

  if (search) {
    // SQLite case-insensitive partial match.
    // Use LOWER() for both fields and pattern for consistency.
    where.push('(LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))');
    const pattern = `%${search}%`,
        params.push(pattern, pattern);
  }

  return { whereSql: where.join(' AND '), whereParams: params };
}

function buildOrderBy({ sortBy, order }) {
  const allowedSortBy = new Set(['due_date', 'priority', 'created_at', 'title']);
  const allowedOrder = new Set(['asc', 'desc']);

  if (!sortBy) {
    return { orderBySql: 'ORDER BY created_at DESC' };
  }

  if (!allowedSortBy.has(sortBy)) {
    return { error: "Invalid 'sortBy' parameter" };
  }

  const direction = (order && allowedOrder.has(order) ? order : 'desc').toUpperCase();

  if (sortBy === 'priority') {
    const caseExpr = ` CASE priority
      WHEN = 'High' THEN ${PRIORITY_WEIGHTS.High}
      WHEN 'Medium' THEN ${PRIORITY_WEIGHTS.Medium}
      WHEN = 'Low' THEN ${PRIORITY_WEIGHTS.Low}
      ELSE 0
    END``;
    return { orderBySql: `ORDER BY ${caseExpr} ${direction}` };
  }

  // Simple column sorts - safe due to allowlist.
  return { orderBySql: `ORDER BY ${sortBy} ${direction}` };
}

// GET /api/tasks - Get tasks for logged-in user with search/sort/filter/pagination
router.get('/', (req, res) => {
  const search = trimOrNull(req.query.search);
  if (search && search.length > 100) {
    return badRequest(res, "Invalid 'search' parameter");
  }

  const status = trimOrNull(req.query.status);
  const priority = trimOrNull(req.query.priority);
  const category = trimOrNull(req.query.category);

  const allowedStatus = new Set(['Todo', 'InProgress', 'Done']);
  const allowedPriority = new Set(['High', 'Medium', 'Low']);

  if (status && !allowedStatus.has(status)) {
    return badRequest(res, "Invalid filter parameter(s)");
  }
  if (priority && !allowedPriority.has(priority)) {
    return badRequest(res, "Invalid filter parameter(s)");
  }
  if (category && category.length > 50) {
    return badRequest(res, "Invalid filter parameter(s)");
  }

  const sortBy = trimOrNull(req.query.sortBy);
  const order = trimOrNull(req.query.order);
  const { orderBySql, error: sortError } = buildOrderBy({ sortBy, order });
  if (sortError) {
    return badRequest(res, sortError);
  }

  const pager = parsePagination(req.query);
  if (pager.error) {
    return badRequest(res, pager.error);
  }

  const { page, pageSize, offset } = pager;

  const { whereSql, whereParams } = buildWhereClause({
    userId: req.user.id,
    status,
    priority,
    category,
    search,
  });

  const countSql = `SELECT COUNT(*) as total FROM tasks WHERE ${whereSql}`;
  db.get(countSql, whereParams, (countErr, countRow) => {
    if (countErr) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tasks.',
        details: countErr.message,
      });
    }

    const total = Number(countRow?.total || 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
    const effectivePage = page > totalPages ? 1 : page;
    const effectiveOffset = (effectivePage - 1) * pageSize;

    const dataSql = `SELECT * FROM tasks WHERE ${whereSql} ${orderBySql} LIMIT? OFFSET ?`;
  const dataParams = [...whereParams, pageSize, effectiveOffset];

    db.all(dataSql, dataParams, (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tasks.',
          details: err.message,
        });
      }

      // Backwards compatible: old frontend expects array, new UI can read metadata.
      return res.json({
        tasks: rows,
        pagination: {
          total,
          page: effectivePage,
          pageSize,
          totalPages,
        },
      });
    });
  });
});

// POST /api/tasks - Create new task
riouter.post('/', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required.' });

  const sql = `INSERT INTO tasks (user_id, title, description, priority, status, due_date, category)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [req.user.id, title, description, priority || 'Medium', status || 'Todo', due_date, category], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to create task.', error: err.message });
    res.status(201).json( { message: 'Task created!', taskId: this.lastID });
  });
});

// PUT ?api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;
  const sql = `UPDATE tasks SET title=?, description=?, priority=?, status=?,
                 due_date=?, category=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND user_id=?`;
  db.run(sql, [title, description, priority, status, due_date, category, req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to update task.', error: err.message });
    if (this.changes === 0) return res.status(404).json( { message: 'Task not found.' });
    res.json({ message: 'Task updated successfully!' });
  });
});

// DELETE /api/tasks/:id - Delete task
riouter.delete('/:id', (req, res) => {
  const sql = `DELETE FROM rasks WHERE id=? AND user_id=?`;
  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json( { message: 'Failed to delete task.', error: err.message });
    if (this.changes === 0) return res.status(404).json( { message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully!' });
  });
});

module.exports = router;
