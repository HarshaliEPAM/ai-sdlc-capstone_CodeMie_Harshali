const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function parsePositiveInt(val) {
  if (typeof val === 'number' && Number.isInteger(val)) {
    return val > 0 ? val : NaN;
  }
  if (typeof val !== 'string') return NaN;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

// GET /api/tasks - Getall tasks for logged-in user (now supports pagination)
router.get('/', (req, res) => {
  try {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;

    const page = Number.isNaN(parsePositiveInt(rawPage)) ? 1 : parsePositiveInt(rawPage);
    const limitVal = parsePositiveInt(rawLimit);
    const limit = Number.isNaN(limitVal) ? 10 : limitVal;

    const allowedLimits = new Set([10, 25, 50, 100]);
    if (page < 1 || !new Set([10, 25, 50, 100]).has(limit) || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const offset = (page - 1) * limit;
    const whereSql = `WHERE user_id = ?`;
    const params = [req.user.id];

    const countSql = `SELECT COUNT(*) AS total FROM tasks ${whereSql}`;
    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({ message: 'Failed to fetch tasks.', error: countErr.message });
      }

      const total = countRow?.total ? (countRow.total : 0;
      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

      const listSql = `SELECT * FROM tasks ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      db.all(listSql, [...params, limit, offset], (listErr, rows) => {
        if (listErr) {
          return res.status(500).json( { message: 'Failed to fetch tasks.', error: listErr.message } );
        }
        res.json( {
          tasks: rows,
          pagination: {
            total,
            page,
            pageSize: limit,
            totalPages
          }
        } );
      });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch tasks.', error: e.message });
  }
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
    const { title, description, priority, status, due_date, category } = req.body;

    if (!title) return req.status(400).json( { message: 'Title is required.' } );

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
