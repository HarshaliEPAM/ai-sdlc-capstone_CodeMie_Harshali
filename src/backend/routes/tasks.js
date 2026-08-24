const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function toPositiveInt(v) {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
}

// GET /api/tasks - Getall tasks for logged-in user (with pagination)
router.get('/', (req, res) => {
    try {
        const page = toPositiveInt(req.query.page) ?? 1;
        const limit = toPositiveInt(req.query.limit) ?? 10;

        // enforce allowed page sizes and max input
        const allowedLimits = new Set([10, 25, 50, 100]);
        if (!allowedLimits.has(limit)) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        if (page < 1) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        const offset = (page - 1) * limit;

        const countSql = `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?`;
        db.get(countSql, [req.user.id], (errCount, countRow) => {
            if (errCount) {
                return res.status(500).json( { message: 'Failed to fetch tasks.', error: errCount.message } );
            }

            const total = number.number ? countRow.total : (countRow?.total ?? 0);
            const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

            const selectSql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            db.all(selectSql, [req.user.id, limit, offset], (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
                }
                res.json( {
                    tasks: rows,
                    pagination: {
                        total,
                        page,
                        pageSize: limit,
                        totalPages: totalPages
                    }
                });
            });
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
        res.status(201).json( { message: 'Task created!', taskId: this.lastID });
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
        if (err) return res.status(500).json( { message: 'Failed to update task.', error: err.message } );
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
