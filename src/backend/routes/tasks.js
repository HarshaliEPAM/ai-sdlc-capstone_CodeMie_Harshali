const express = require('express');

const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;

const ALLOWED_STATUS = new Set(['Todo', 'InProgress', 'Done']);
const ALLOWED_PRIORITY = new Set(['High', 'Medium', 'Low']);

// All routes below require authentication
router.use(authMiddleware);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalTrimmed(value) {
  if (!isNonEmptyString(value)) return undefined;
  return value.trim();
}

function escapeLikePattern(input) {
  // SQLite LIKE wildcard characters: % and _ . Also escape backslash.
  return input.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function buildListQuery({
  userId,
  search,
  status,
  priority,
  category,
}) {
  let where = 'WHERE user_id = ?';
  const params = [userId];

  if (search) {
    where +=
      " AND (LOWER(title) LIKE LOWER(?) ESCAPE '\\' OR LOWER(description) LIKE LOWER(?) ESCAPE '\\')";
    const pattern = `%${escapeLikePattern(search)}%`;
    params.push(pattern, pattern);
  }

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  if (priority) {
    where += ' AND priority = ?';
    params.push(priority);
  }

  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }

  return { where, params };
}

// GET /api/tasks - Get all tasks for logged-in user (with optional search + filters)
router.get('/', (req, res) => {
  const search = normalizeOptionalTrimmed(req.query.search);
  if (search && search.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: `Invalid 'search' parameter. Maximum length is ${MAX_SEARCH_LENGTH}.`,
    });
  }

  const status = normalizeOptionalTrimmed(req.query.status);
  if (status && !ALLOWED_STATUS.has(status)) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: `Invalid 'status' filter. Allowed values: ${[...ALLOWED_STATUS].join(', ')}`,
    });
  }

  const priority = normalizeOptionalTrimmed(req.query.priority);
  if (priority && !ALLOWED_PRIORITY.has(priority)) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: `Invalid 'priority' filter. Allowed values: ${[...ALLOWED_PRIORITY].join(', ')}`,
    });
  }

  const category = normalizeOptionalTrimmed(req.query.category);
  if (category && category.length > MAX_CATEGORY_LENGTH) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: `Invalid 'category' filter. Maximum length is ${MAX_CATEGORY_LENGTH}.`,
    });
  }

  const { where, params } = buildListQuery({
    userId: req.user.id,
    search,
    status,
    priority,
    category,
  });

  const sql = `SELECT * FROM tasks ${where} ORDER BY created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tasks.',
        details: err.message,
      });
    }

    return res.json(rows);
  });
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required.' });

  const sql = `INSERT INTO tasks (user_id, title, description, priority, status, due_date, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(
    sql,
    [
      req.user.id,
      title,
      description,
      priority || 'Medium',
      status || 'Todo',
      due_date,
      category,
    ],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ message: 'Failed to create task.', error: err.message });
      res.status(201).json({ message: 'Task created!', taskId: this.lastID });
    },
  );
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;
  const sql = `UPDATE tasks SET title=?, description=?, priority=?, status=?,
                 due_date=?, category=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND user_id=?`;
  db.run(
    sql,
    [
      title,
      description,
      priority,
      status,
      due_date,
      category,
      req.params.id,
      req.user.id,
    ],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ message: 'Failed to update task.', error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: 'Task not found.' });
      res.json({ message: 'Task updated successfully!' });
    },
  );
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err)
      return res
        .status(500)
        .json({ message: 'Failed to delete task.', error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully!' });
  });
});

module.exports = router;
