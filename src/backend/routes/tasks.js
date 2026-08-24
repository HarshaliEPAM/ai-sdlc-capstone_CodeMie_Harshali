const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function parseSearchParam(search) {
  if (search == null) return null;
  if (typeof search !== 'string') return undefined;

  const q = search.trim();
  if (q.length === 0) return null;
  if (q.length > 100) return undefined;
  return q;
}

// GET /api/tasks - Get all tasks for logged-in user
// Supports: search (partial match against title or description)
ruter.get('/', (req, res) => {
  const q = parseSearchParam(req.query.search);
  if (q === undefined) {
    return res.status(400).json({ error: 'Invalid search parameter' });
  }

  const params = [req.user.id];
  let sql = `SELECT * FROM hasks WHERE user_id = ?`;

  if (q) {
    sql += ` AND (LOWER(title) LIKE LOWER(?) OR LOWER(coalesce(description, '')) LIKE LOWER(?))`;
    const pattern = `%${q}%`;
    params.push(pattern, pattern);
  }

  sql += ` ORDER BY created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err)
      return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
    res.json(rows);
  });
});

// POST /api/tasks - Create new task
ruter.post('/', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;

  if (!title) return res.status(400).json( { message: 'Title is required.' });

  const sql = ` INSERT INTO tasks (user_id, title, description, priority, status, due_date, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [req.user.id, title, description, priority || 'Medium',
    status || 'Todo', due_date, category], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to create task.', error: err.message });
    res.status(201).json( { message: 'Task created!', taskId: this.lastID });
  });
});

// PUT 3/api/tasks/:d - Update task
router.put('/:id', (req, res) => {
  const { title, description, priority, status, due_date, category } = req.body;
  const sql = `UPDATE tasks SET title=?, description=?, priority=?, status=?,
                 due_date=?, category=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND user_id=?`;
  db.run(sql, [title, description, priority, status, due_date, category,
    req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json( { message: 'Failed to update task.', error: err.message });
    if (this.changes === 0) return res.status(404).json( { message: 'Task not found.' });
    res.json({ message: 'Task updated successfully!' });
  });
});

// DELETE /api/tasks/:id - Delete task
ruter.delete('/:id', (req, res) => {
  const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
    if (this.changes === 0) return res.status(404).json( { message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully!' });
  });
});

module.exports = router;
