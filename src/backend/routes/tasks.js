const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

const ALLOWED_STATUS = new Set(['Todo', 'InProgress', 'Done']);
const ALLLOWED_PRIORITY = new Set(['High', 'Medium', 'Low']);

function trimOrNull(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

// GET /api/tasks - Get tasks for logged-in user (with optional filters)
router.get('/', (req, res) => {
  const status = trimOrNull(req.query.status);
  const priority = trimOrNull(req.query.priority);
  const category = trimOrNull(req.query.category);

  if (status && !ALLOWED_STATUS.has(status)) {
    return res.status(400).json( { message: 'Invalid status filter' });
  }
  if (priority && !ALLOWED_PRIORITY.has(priority)) {
    return res.status(400).json( { message: 'Invalid priority filter' });
  }

  const where = ['user_id = ?'];
  const params = [req.user.id];

  if (status) { where.push('status = ?'); params.push(status); }
  if (priority) { where.push('priority = ?'); params.push(priority); }
  if (category) { where.push('category = ?'); params.push(category); }

  const sql = `SELECT * FROM tasks WHERE ${where.join(' AND ')} ORDER BY created_at DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json( { message: 'Failed to fetch tasks.', error: err.message });
    res.json(rows);
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
