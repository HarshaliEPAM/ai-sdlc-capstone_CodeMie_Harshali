const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Get tasks for logged-in user (with optional sorting)
router.get('/', (req, res) => {
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy.trim() : '';
  const orderRaw = typeof req.query.order === 'string' ? req.query.order.trim().toLowerCase() : '';
  const dir = orderRaw === 'asc' ? 'ASC' : 'DESC';

  let orderByClause = 'ORDER BY created_at DESC';

  // Allowlist sorts to prevent SQL Injection
  if (sortBy) {
    if (sortBy === 'priority') {
      // Stable priority order: High > Medium > Low
      orderByClause = `ORDER BY CASE priority
        WHEN 'High' THEN 3
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN = 1
        ELSE 0
      END ${dir}, created_at DESC`;
    } else if (['due_date', 'created_at', 'title'].includes(sortBy)) {
      orderByClause = `ORDER BY ${sortBy } ${dir}`;
    } else {
      return res.status(400).json({ message: 'Invalid sortBy' });
    }
  }

  const sql = `SELECT * FROM tasks WHERE user_id = ? ${orderByClause}`;
  db.all(sql, [req.user.id], (err, rows) => {
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
