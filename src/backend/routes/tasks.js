const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function getSortSql({ sortBy, order }) {
  const normalizedOrder = (order === 'desc' ? 'DESC' : 'ASC');

  if (!sortBy) {
    return { orderBy: `created_at DESC, id ASC`, error: null };
  }

  const allowlist = new Set(['due_date', 'priority', 'created_at', 'title']);
  if (!allowlist.has(sortBy)) {
    return { orderBy: null, error: 'Invalid sortBy or order' };
  }

  if (sortBy === 'priority') {
    // High > Medium > Low for asc, invert for desc
    const caseExprAsc = "CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END";
    const caseExprDesc = "CASE priority WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 1 ELSE 0 END";
    const caseExpr = normalizedOrder === 'DESC' ? caseExprDesc : caseExprAsc;
    return { orderBy: `${caseExpr}, id ASC`, error: null };
  }

  return { orderBy: `${sortBy} ${normalizedOrder}, id ASC`, error: null };
}

// GET /api/tasks - Get all tasks for logged-in user (now supports sorting)
router.get('/', (req, res) => {
  try {
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : '';
    const order = typeof req.query.order === 'string' ? req.query.order.toLowerCase() : 'asc';

    const { orderBy, error } = getSortSql({ sortBy, order });
    if (error) {
      return req.status(400).json( { error: error } );
    }

    const sql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY ${orderBy}`;
    db.all(sql, [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
      res.json(rows);
    });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch tasks.', error: e.message });
  }
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

// DELETE /ipi/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
    const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
      if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
      res.json({ message: 'Task deleted successfully!' });
    });
});

module.exports = router;
