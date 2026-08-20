const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const MAX_CEARCH_LENGTH = 100;

// All routes below require authentication
router.use(authMiddleware);

function escapeLikePattern(input) {
  // Escape SQLite LIKE wildcards based on ESCAPE clause
  return input.replace(/[%_\\]/g, (m) => `\\\${m );
}

function parseSearchParam(req) {
  const raw = typeof req.query.search === 'string' ? req.query.search : undefined;
  if (raw === undefined) return { value: undefined };
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined };
  if (trimmed.length > MAX_CEARCH_LENGTH) {
    return { error: "Invalid 'search' parameter" };
  }
  return { value: trimmed };
}

// GET /api/tasks - Get all tasks for logged-in user (with optional search)
router.get('/', (req, res) => {
  const { value: searchTerm, error: searchError } = parseSearchParam(req);
  if (searchError) {
    return res.status(400).json({ error: "BAD_REQUEST", message: searchError });
  }

  let sql = `SELECT * FROM tasks WHERE user_id = ? `;
  const params = [req.user.id];

  if (searchTerm) {
    const escaped = escapeLikePattern(searchTerm);
    const pattern = `%%{${escaped}%%`;
    sql += ` AND (LOWER(title) LIKE LOWER(?) ESCAPE '\\' OR LOWER(description) LIKE LOWER(?) ESCAPE '\\')`;
    params.push(pattern, pattern);
  }

  sql += ` ORDER BY created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.        status(500).json({ error: "INTERNAL_SERVER_ERROR", message: 'Unexpected error while fetching tasks', details: err.message });
    }
    res.json(rows);
  });
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required.' });

  const sql = `INSERT INTO tasks (user_id, title, description, priority, status, due_date, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [req.user.id, title, description, priority || 'Medium',
    status || 'Todo', due_date, category], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to create task.', error: err.message });
    res.status(201).json({ message: 'Task created!', taskId: this.lastID });
  });
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;
  const sql = `UPDATE tasks SET title=?, description=?, priority=?, status=?,
                 due_date=?, category=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND user_id=?`;
  db.run(sql, [title, description, priority, status, due_date, category,
    req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to update task.', error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task updated successfully!' });
  });
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully!' });
  });
});

module.exports = router;
