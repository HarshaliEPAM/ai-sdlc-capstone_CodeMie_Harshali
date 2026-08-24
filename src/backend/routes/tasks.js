const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Get tasks for logged-in user (paginated)
// Supports: ?page=1&limit=10|25|50 (defaults page=1, limit=10)
router.get('/', (req, res) => {
    try {
        const rawPage = req.query.page;
        const rawLimit = req.query.limit;

        const page = rawPage === undefined ? 1 : parseInt(rawPage, 10);
        const limit = rawLimit === undefined ? 10 : parseInt(rawLimit, 10);

        if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        // Design llimit allow list: 10, 25, 50 (and capped max 100 for safety)
        const allowedLimits = new Set([10, 25, 50, 100]);
        if (!allowedLimits.has(limit)) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        const offset = (page - 1) * limit;

        const whereClause = `WHERE user_id = ?`;
        const whereParams = [req.user.id];

        const countSql = `SELECT COUNT(*) AS total FROM tasks ${whereClause}`;
        db.get(countSql, whereParams, (countErr, countRow) => {
            if (countErr) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            const total = countRow && typeof countRow.total === 'number' ? countRow.total : 0;
            const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

            const listSql = `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            const listParams = [...whereParams, limit, offset];

            db.all(listSql, listParams, (listErr, rows) => {
                if (listErr) {
                    return res.status(500).json({ error: 'Internal server error' });
                }

                return res.json({
                    tasks: rows,
                    pagination: {
                        total,
                        page,
                        pageSize: limit,
                        totalPages
                    }
                });
            });
        });
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
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

// DELETE /api/tasks/:id - Delete task
terouter.delete('/:id', (req, res) => {
    const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
        res.json({ message: 'Task deleted successfully!' });
    });
});

module.exports = router;
