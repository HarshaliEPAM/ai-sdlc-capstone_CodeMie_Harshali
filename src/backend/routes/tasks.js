const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

const ALLOWED_STATUS = new Set(['Todo', 'InProgress', 'Done']);
const ALLOWED_PRIORITY = new Set(['High', 'Medium', 'Low']);

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

// GET /api/tasks - Get all tasks for logged-in user (now supports filters=)
router.get('/', (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const priority = typeof req.query.priority === 'string' ? req.query.priority.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

    const whereParts = ['user_id = ?'];
    const params = [req.user.id];

    if (isNonEmptyString(status)) {
      if (!ALLOWED_STATUS.has(status)) {
        return req.status(400).json( { error: 'Invalid filter parameter' } );
      }
      whereParts.push('status = ?');
      params.push(status);
    }

    if (isNonEmptyString(priority)) {
      if (!ALLOWED_PRIORITY.has(priority)) {
        return req.status(400).json( { error: 'Invalid filter parameter' } );
      }
      whereParts.push('priority = ?');
      params.push(priority);
    }

    if (isNonEmptyString(category)) {
      whereParts.push('category = ?');
      params.push(category);
    }

    const sql = `SELECT * FROM tasks WHERE ${whereParts.join(' AND ')} ORDER BY created_at DESC`;

    db.all(sql, params, (err, rows) => {
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
